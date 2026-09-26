import * as THREE from "three";
import { CROSSING, RING, SHAPES, FIELD, SEOUL_WATERMARK, PLATE_FEATHER, LIGHT_SWEEP, LIGHT_MAX_RATE, LIGHT_PORTRAIT, pickQuality, type QualityTier } from "../config";
import { SEOUL_POINTS, SEOUL_STRIDE } from "../shapes/seoul";
import { SINGAPORE_POINTS, SINGAPORE_STRIDE } from "../shapes/singapore";
import { computeStageLayout, readStageRect, findStageElement, type StageLayout } from "../utils/shapeLayout";
import { Renderer } from "../renderer/Renderer";
import { CameraController } from "../camera/CameraController";
import { Pointer } from "../interactions/Pointer";
import { ParticleField } from "../particles/ParticleField";
import { Atmosphere } from "../particles/Atmosphere";
import { WaterSurface } from "../water/WaterSurface";
import { Lantern } from "../particles/Lantern";
import { PostFX } from "../renderer/PostFX";
import { computePhases, computeCrossingPhases, crossingToPhases, type CrossingAnchors } from "../utils/phases";
import { clamp } from "../utils/math";
import { isScrollLocked } from "../../useBodyScrollLock";

/**
 * Top-level controller. Owns the renderer, camera, layers, and the animation
 * loop. Public API: constructor(canvas) → start() → dispose(). Handles resize,
 * scroll, reduced-motion, visibility throttling, and adaptive frame-skipping.
 *
 * Layer composition depends on `variant`.
 *
 *   "field" (8월 회차, /2026-08의 기본값)
 *     Atmosphere    드리프트하는 성운 그라데이션 (가장 느림)
 *     ParticleField 흐름장 입자 (가장 빠름, 상호작용)
 *
 *   "water" (나루 홈)
 *     WaterSurface  하늘과 수면을 한 셰이더로. 이 하나가 배경 전부입니다.
 *
 * DECIDED 2026-09-15: variant를 둔 이유는 두 페이지가 서로 다른 것을 말하기
 * 때문입니다. 8월 페이지의 입자 필드는 그 회차의 것이라 그대로 둡니다.
 * 나루 홈은 나루터를 말해야 하고, 그건 강과 등불입니다.
 */
//
// "crossing" (나루 홈, 2026-09-17 배경 브리프)
//   Atmosphere    하늘(8월과 같은 성운 그라데이션, 남색)
//   WaterSurface  띠 모드. 등불 아래의 얇은 반사 띠만
//   ParticleField crossing 분포. 두 기슭 → 강가 → 건너기 → 등불 둘레의 성좌
//   Lantern       등불 한 점(스프라이트). 화면의 유일한 주황
// 8월의 엔진(입자·블룸·카메라·국면·품질 티어)을 그대로 쓰고 이야기만 바꿨습니다.
// 국면 경계는 #record, #december, #naru의 실제 스크롤 위치에서 읽습니다.
export type BackgroundVariant = "field" | "water" | "crossing";

// 구운 점의 범위(정규화 좌표, 너비가 [-1, 1]). 판 덮개(2026-09-26, 판 덮개 브리프 2.1)가 형상의
// 화면 상자를 추정 비율이 아니라 실제 점에서 계산하려고 한 번 잽니다.
function pointExtent(pts: ArrayLike<number>, stride: number) {
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
  for (let k = 0; k + 1 < pts.length; k += stride) {
    const x = pts[k], y = pts[k + 1];
    if (x < x0) x0 = x;
    if (x > x1) x1 = x;
    if (y < y0) y0 = y;
    if (y > y1) y1 = y;
  }
  return { x0, x1, y0, y1 };
}
const SEOUL_EXTENT = pointExtent(SEOUL_POINTS, SEOUL_STRIDE);
const SINGAPORE_EXTENT = pointExtent(SINGAPORE_POINTS, SINGAPORE_STRIDE);

/** 화면 좌표(CSS px) 상자. */
export interface ScreenBox { top: number; bottom: number; left: number; right: number }
/**
 * 읽기 판 하나. 문서 좌표의 불투명한 안쪽과 덮개 구간(스크롤 px). 판이 형상 상자를 위아래로
 * 덮지 못하거나 덮개가 stages.minHideVh보다 짧으면(#join 판은 예외) cover가 null. fade는 덮개 구간 양 끝에서 형상이 사라지고 돌아오는 길이(px).
 * coversX는 좌우까지 덮는지(참고값. 숨기는 데는 쓰지 않습니다. 사라지면 옆도 안 보입니다).
 */
export interface PlateCover {
  id: string;
  top: number; bottom: number; left: number; right: number;
  coversX: boolean;
  cover: { c0: number; c1: number; fade: number } | null;
}

export class BackgroundScene {
  private readonly scene = new THREE.Scene();
  private readonly renderer: Renderer;
  private readonly cam: CameraController;
  private readonly pointer = new Pointer();
  private readonly quality: QualityTier;

  private readonly variant: BackgroundVariant;
  // field 변형에서만 만듭니다. water에서는 둘 다 null입니다.
  private readonly atmosphere: Atmosphere | null;
  private readonly particles: ParticleField | null;
  // water·crossing 변형에서 만듭니다.
  private readonly water: WaterSurface | null;
  // crossing 변형에서만.
  private readonly lantern: Lantern | null;
  private anchors: CrossingAnchors = { ...CROSSING.fallbackAnchors };
  private anchorTimer = 0;
  private readonly lanternProjected = new THREE.Vector3();
  // 포인터의 화면 uv. water 셰이더가 파문을 여기에 놓습니다.
  private readonly pointerUv = new THREE.Vector2(0.5, 0.5);
  // 필드의 자체 시간. 벽시계와 분리합니다. motionScale이 0이면 이 값이 더 이상
  // 늘지 않아 배경이 "그 자리에" 얼어붙습니다. uTime에 0을 곱하면 t=0의 배치로
  // 튀어서, 정지가 아니라 점프로 보입니다.
  private fieldTime = 0;
  private readonly post: PostFX;

  private readonly clock = new THREE.Clock();
  private rafId = 0;
  private running = false;
  private reduced = false;
  private scroll = 0;
  private scrollY = 0; // crossing의 국면은 px로 잽니다(utils/phases.ts).
  // 스크롤 속도 0..1. 깊은 물의 물살이 여기에 반응합니다(shaders/water.ts의
  // uFlow). 원시 값을 그대로 넘기면 프레임마다 튀어서, 아래 loop에서 지수
  // 감쇠로 부드럽게 합니다. 올라갈 때는 빠르게, 잦아들 때는 천천히.
  private flow = 0;
  /** 파문의 위상(rad). 곱셈이 아니라 적분입니다(2026-09-19, 파문 위상 브리프). */
  private ringPhase = 0;
  private prevScroll = 0;
  private visible = true;
  // 방문자가 직접 끈 상태. prefers-reduced-motion과 별개입니다.
  // WCAG 2.2.2는 5초를 넘겨 자동으로 시작하는 움직임에 "일시정지, 정지, 또는
  // 숨김 수단"을 요구합니다. OS 설정을 그 수단으로 인정할지는 감사자에 따라
  // 갈리므로, 페이지 안에도 손잡이를 둡니다(components/ui/MotionToggle.tsx).
  private paused = false;

  // world-space focal point the field converges to (matches ParticleField uHole)
  private readonly focusWorld = new THREE.Vector3(0, 0, -46);
  private readonly focusProjected = new THREE.Vector3();

  // adaptive performance
  private frameAccum = 0;
  private frameCount = 0;
  private motionScale = 1; // dialed down under reduced-motion

  constructor(canvas: HTMLCanvasElement, variant: BackgroundVariant = "field") {
    this.variant = variant;
    this.quality = pickQuality();
    this.renderer = new Renderer(canvas, this.quality);
    this.cam = new CameraController();

    // soft ambient + rim glow (lighting supports atmosphere, never dominates)
    this.scene.add(new THREE.AmbientLight(0x6d5fa8, 0.6));
    const rim = new THREE.PointLight(0xc084fc, 8, 80);
    rim.position.set(-18, 12, 20);
    this.scene.add(rim);

    if (variant === "water") {
      this.atmosphere = null;
      this.lantern = null;
      this.water = new WaterSurface();
      this.scene.add(this.water.mesh);
      // 서울 워터마크(2026-09-18). 카메라의 자식으로 z = −30에 두어 스크롤 돌리·포인터
      // 패럴랙스에 흔들리지 않습니다(water 변형은 카메라를 쓰지 않던 것과 같은 결과).
      // 카메라가 씬에 있어야 자식이 그려집니다.
      const n = this.quality.particles <= 900 ? SEOUL_WATERMARK.points.phone : SEOUL_WATERMARK.points.desktop;
      this.particles = new ParticleField({ ...this.quality, particles: n }, 1.0, "crossing", "seoul");
      this.particles.points.position.set(0, 0, -30);
      this.particles.points.frustumCulled = false;
      this.cam.camera.add(this.particles.points);
      this.scene.add(this.cam.camera);
    } else if (variant === "crossing") {
      this.atmosphere = new Atmosphere();
      this.atmosphere.mesh.renderOrder = -2; // 하늘이 맨 뒤, 그 위에 반사 띠
      // 위는 거의 검정, 아래(강 쪽)는 옅은 남색. water 변형의 하늘과 같은 값입니다.
      this.atmosphere.setPalette("#0B1540", "#03050F", "#2A2260");
      this.particles = new ParticleField(this.quality, 1.0, "crossing");
      if (SHAPES.enabled) {
        this.water = new WaterSurface(true);
        this.lantern = new Lantern();
        this.scene.add(this.atmosphere.mesh, this.water.mesh, this.particles.points, this.lantern.sprite);
      } else {
        // 형상을 걷은 상태(2026-09-17): 하늘 + 깊이 층만. 등불도 반사 띠도 없습니다.
        this.water = null;
        this.lantern = null;
        this.scene.add(this.atmosphere.mesh, this.particles.points);
      }
    } else {
      this.water = null;
      this.lantern = null;
      this.atmosphere = new Atmosphere();
      this.particles = new ParticleField(this.quality, 1.0);
      // NOTE: there is intentionally NO portal object in the scene. The phenomenon
      // is expressed only through particle convergence + screen-space lensing +
      // density-driven bloom — never a rendered disc/sphere with a visible edge.
      this.scene.add(
        this.atmosphere.mesh,
        this.particles.points
      );
    }

    // post-processing stack (bloom only on capable tiers)
    this.post = new PostFX(
      this.renderer.gl,
      this.scene,
      this.cam.camera,
      this.quality.bloom,
      variant === "crossing" ? CROSSING.bloomThreshold : undefined,
      // 폰 티어만 값을 갖습니다. 나머지는 undefined → PostFX의 기본 0.6.
      this.quality.bloomIntensity
    );
    this.post.setSize(window.innerWidth, window.innerHeight);
    // 나루 홈은 렌즈 왜곡을 쓰지 않습니다(2026-09-23, PostFX.setLensScale 주석). 8월 field는 그대로.
    if (variant === "water") this.post.setLensScale(0);

    this.applyReducedMotion(
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
    this.syncPixelRatio();
    this.placeLantern();
    this.placeShapes();
  }

  /**
   * 기슭 형상의 자리(2026-09-17, 배경 수정 브리프). 히어로 오른쪽 단(폰은 카피 아래
   * 한 단)의 무대 사각형을 재서(utils/shapeLayout.ts) z = 0 평면의 월드 좌표로
   * 바꿉니다. 등불과 반사 띠도 같은 무대에서 나옵니다. 무대가 없으면(다른 페이지)
   * 화면 오른쪽 반을 무대로 칩니다.
   */
  private stageLayout: StageLayout | null = null;
  private lanternBaseY: number = CROSSING.lantern.y;
  /** water 변형: 서울 워터마크의 자리. 카메라 자식(z = −30)이라 뷰포트 비율을 그 평면의 월드로. */
  private placeSeoul(widthFrac?: number, cyFrac?: number) {
    if (!this.particles || this.variant !== "water") return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    const portrait = h > w;
    const fov = portrait ? 75 : 60;
    const halfH = 30 * Math.tan((fov * Math.PI) / 360);
    const halfW = halfH * (w / h);
    const W = SEOUL_WATERMARK;
    // 2026-09-19 (서울→싱가포르 브리프 2.3): 자리가 둘입니다. 같은 중심, 반너비만
    // 다르게. L이 도착(싱가포르), R이 출발(서울)입니다. 셰이더가 uMorph로 둘 사이를
    // 보간하므로 두 형상의 폭이 달라도 됩니다. widthFrac은 서울 쪽에만 적용합니다.
    const hwSeoul = (widthFrac ?? (portrait ? W.portrait.heroW : W.landscapeW)) * halfW;
    const hwSg = (portrait ? W.portrait.singaporeW : W.singaporeW) * halfW;
    const cy = cyFrac ?? (portrait ? W.portrait.heroCy : W.cy);
    const x = (W.cx * 2 - 1) * halfW;
    const y = (1 - cy * 2) * halfH;
    this.particles.setShapes({ x, y, hw: hwSg }, { x, y, hw: hwSeoul });
  }

  private placeShapes() {
    if (this.variant === "water") { this.placeSeoul(); return; }
    if (!this.particles || this.variant !== "crossing") return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    const portrait = h > w;
    const fov = portrait ? 75 : 60;
    const halfH = 30 * Math.tan((fov * Math.PI) / 360);
    const halfW = halfH * (w / h);
    const stage = readStageRect() ?? { left: w * 0.5, top: h * 0.3, right: w, bottom: h * 0.7 };
    const L = computeStageLayout(w, h, stage);
    if (!L) return;
    this.stageLayout = L;
    const toWorld = (p: { cx: number; cy: number; w: number }) => ({
      x: (p.cx / w * 2 - 1) * halfW,
      y: (1 - p.cy / h * 2) * halfH,
      hw: (p.w / w) * halfW,
    });
    this.particles.setShapes(toWorld(L.left), toWorld(L.right));
    // 등불은 z = −40(카메라에서 70). 그 깊이의 화면 반폭은 z = 0의 70/30배입니다.
    const k = (30 - CROSSING.lantern.z) / 30;
    const lx = (L.lantern.cx / w * 2 - 1) * halfW * k;
    const ly = (1 - L.lantern.cy / h * 2) * halfH * k;
    this.lanternBaseY = ly;
    this.lantern?.setPosition(lx, ly, CROSSING.lantern.z);
    this.particles.setLantern(lx, ly, CROSSING.lantern.z);
    this.water?.setBandX(L.band.x0 / w, L.band.x1 / w);
  }

  /** 무대 요소와 문서 크기를 지켜봅니다. 2초 폴링 대신(브리프 1.1). */
  private stageObserver: ResizeObserver | null = null;
  private observeStage() {
    if (this.variant !== "crossing" || typeof ResizeObserver === "undefined") return;
    this.stageObserver?.disconnect();
    this.stageObserver = new ResizeObserver(() => { this.readAnchors(); this.placeShapes(); });
    const stage = findStageElement();
    if (stage) this.stageObserver.observe(stage);
    this.stageObserver.observe(document.body);
    document.fonts?.ready.then(() => { this.readAnchors(); this.placeShapes(); }).catch(() => {});
  }

  /** 등불의 기본 자리(무대를 읽기 전). 실제 자리는 placeShapes가 무대에서 정합니다. */
  private placeLantern() {
    if (!this.lantern || !this.particles) return;
    this.lanternBaseY = CROSSING.lantern.y;
    this.lantern.setPosition(CROSSING.lantern.x, CROSSING.lantern.y, CROSSING.lantern.z);
    this.particles.setLantern(CROSSING.lantern.x, CROSSING.lantern.y, CROSSING.lantern.z);
  }

  // ── lifecycle ──────────────────────────────────────────────────────────────
  start() {
    if (this.running) return;
    this.running = true;
    this.pointer.attach();
    window.addEventListener("resize", this.onResize, { passive: true });
    window.addEventListener("scroll", this.onScroll, { passive: true });
    document.addEventListener("visibilitychange", this.onVisibility);
    this.mql.addEventListener("change", this.onReducedChange);
    this.scrollY = window.scrollY;
    this.readAnchors();
    this.placeShapes();
    this.observeStage();
    this.clock.start();
    this.loop();
  }

  /**
   * crossing 변형의 국면 경계(문서 px). 히어로 하단, #december 시작, #gains 시작,
   * #record 시작, #naru 시작. 상수로 박지 않는 이유는 페이지 길이가
   * 바뀌어도 "8월의 기록에서 건넌다"가 유지되어야 하기 때문입니다. 시작·리사이즈·
   * 무대 ResizeObserver, 그리고 2초마다 다시 읽습니다(이미지가 늦게 실리는 경우).
   */
  private heroEnd: number = CROSSING.fallbackAnchors.heroEnd; // water 변형: 히어로 section의 아래(문서 px)
  private naruTop = Infinity;
  // water 변형: #join 상단(문서 px). 없는 페이지에서는 Infinity라 구간 5(형상 거두기)가 오지 않습니다.
  private joinTop = Infinity;
  // 푸터(#closing) 상단. 문서 끝에서 빛을 거두는 기준(2026-09-26). 없으면 Infinity라 거두지 않습니다.
  private closingTop = Infinity;
  // 구간 4 진행도를 부드럽게 따라가는 값(점의 가로 이동용). 휠의 계단을 지웁니다.
  private s4Eased = 0;
  // 세로 화면의 빛(2026-09-24): 건너기 끝부터 센 바퀴 수를 부드럽게 따라가는 값.
  private lapEased = 0;
  // 지난 프레임이 세로였는가. 회전하면 두 값을 목표로 바로 맞춥니다. 첫 프레임은 null.
  private lightPortrait: boolean | null = null;
  // 수면 평면의 두 끝을 화면에 투영할 때 쓰는 벡터(매 프레임 새로 만들지 않습니다).
  private readonly sweepA = new THREE.Vector3();
  private readonly sweepB = new THREE.Vector3();
  private readAnchors() {
    if (this.variant === "water") {
      const sy = window.scrollY;
      const top = (id: string) => {
        const el = document.getElementById(id);
        return el ? el.getBoundingClientRect().top + sy : null;
      };
      const hero = document.getElementById("top");
      this.heroEnd = hero ? hero.getBoundingClientRect().bottom + sy : CROSSING.fallbackAnchors.heroEnd;
      const naru = top("naru");
      if (naru !== null) this.naruTop = naru;
      const join = top("join");
      if (join !== null) this.joinTop = join;
      const closing = top("closing");
      if (closing !== null) this.closingTop = closing;
      this.readPlates();
      this.schedule();
      this.warnShortSeoul();
      return;
    }
    if (this.variant !== "crossing") return;
    const sy = window.scrollY;
    const top = (id: string) => {
      const el = document.getElementById(id);
      return el ? el.getBoundingClientRect().top + sy : null;
    };
    // DECIDED 2026-09-17 (홈 흐름 재배치): 순서가 #december → #gains → #record → #naru.
    // #gains가 없으면(다른 구성) #record를 crossing의 끝으로 씁니다.
    const december = top("december");
    const gains = top("gains") ?? top("record");
    const record = top("record");
    const naru = top("naru");
    const stage = findStageElement();
    const hero = stage?.closest("section");
    const heroEnd = hero ? hero.getBoundingClientRect().bottom + sy : december;
    if (december !== null && gains !== null && record !== null && naru !== null && heroEnd !== null) {
      if (heroEnd <= december + 1 && december < gains && gains <= record && record < naru) {
        this.anchors = { heroEnd, crossStart: december, crossEnd: gains, arrivedAt: record, naru };
      }
    }
  }

  // ── 판 덮개 (DECIDED 2026-09-26, 사용자: "gap이 나왔을 때 이미 바뀌어 있고, complete shape만") ──
  // 형상이 바뀌는 일(떠오름, 건너기, 사라짐)은 읽기 판이 형상을 다 덮고 있는 동안에만 일어납니다.
  // 앵커는 챕터 머리가 아니라 판과 형상의 실제 위치에서 계산합니다. 창 크기, 카피 길이가
  // 바뀌어도 틈에는 완성된 형상만 보입니다(docs/background-change-under-cover-brief.md).
  private shapeBox: ScreenBox = { top: 0, bottom: 0, left: 0, right: 0 };
  private plates: PlateCover[] = [];

  /**
   * 형상의 화면 상자(CSS px). 서울 상자와 싱가포르 상자의 합집합입니다. 건너는 동안 점은 두
   * 자리를 잇는 직선 위에 있으므로 합집합 안에 머뭅니다. placeSeoul과 같은 중심과 반너비,
   * 구운 점의 min/max에서 계산하고, 셰이더가 점을 옮기는 만큼을 더합니다: 건너기의 들어 올림
   * (서울 반너비의 6%, 위로), 숨(컬 노이즈 단위 벡터 × uCurl × 0.75 + 0.12, × uBreath, z 방향
   * 숨의 원근 확대까지), 점의 반지름(가장 큰 점 크기의 반 + 1px).
   */
  private computeShapeBox(): ScreenBox {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const portrait = h > w;
    const halfH = 30 * Math.tan(((portrait ? 75 : 60) * Math.PI) / 360);
    const halfW = halfH * (w / h);
    const W = SEOUL_WATERMARK;
    const hwS = (portrait ? W.portrait.heroW : W.landscapeW) * halfW;
    const hwG = (portrait ? W.portrait.singaporeW : W.singaporeW) * halfW;
    const cy = portrait ? W.portrait.heroCy : W.cy;
    const x = (W.cx * 2 - 1) * halfW;
    const y = (1 - cy * 2) * halfH;
    const breath = (FIELD.curl * 0.75 + 0.12) * SHAPES.breath;
    const lift = 0.06 * hwS;
    const persp = 30 / (30 - breath);
    const wx0 = (x + Math.min(SEOUL_EXTENT.x0 * hwS, SINGAPORE_EXTENT.x0 * hwG) - breath) * persp;
    const wx1 = (x + Math.max(SEOUL_EXTENT.x1 * hwS, SINGAPORE_EXTENT.x1 * hwG) + breath) * persp;
    const wy0 = (y + Math.min(SEOUL_EXTENT.y0 * hwS, SINGAPORE_EXTENT.y0 * hwG) - breath) * persp;
    const wy1 = (y + Math.max(SEOUL_EXTENT.y1 * hwS, SINGAPORE_EXTENT.y1 * hwG) + breath + lift) * persp;
    const dot = Math.max(W.edgePxLandscapeSeoul, W.edgePxLandscape, W.edgePxSeoul, W.edgePx) / 2 + 1;
    const sx = (X: number) => (w / 2) * (1 + X / halfW);
    const sy = (Y: number) => (h / 2) * (1 - Y / halfH);
    return { left: sx(wx0) - dot, right: sx(wx1) + dot, top: sy(wy1) - dot, bottom: sy(wy0) + dot };
  }

  /**
   * 판마다 덮개 구간 [c0, c1](스크롤 px)을 계산합니다(판 덮개 브리프 2.1). 스크롤이 이 안에
   * 있으면 판의 불투명한 안쪽(PLATE_FEATHER를 뺀 영역)이 형상 상자를 위아래로 전부 덮고,
   * 형상은 이 안에서 사라집니다(stages.hideFadeVh). 판은 문서 순서대로 전부 읽습니다
   * (#december와 #naru는 판이 둘. NaruHome의 PlateSegment).
   * 판은 챕터 리빌 div 안에 있어, 리빌 전(translateY 40px)이나 리빌 중에 읽어도 그 이동을
   * 빼고 자리 잡은 뒤의 위치로 계산합니다.
   */
  private readPlates() {
    const sy = window.scrollY;
    const box = this.computeShapeBox();
    this.shapeBox = box;
    const F = PLATE_FEATHER;
    const fx = window.matchMedia("(max-width: 639px)").matches ? F.xPhone : F.x;
    const fadeMax = SEOUL_WATERMARK.stages.hideFadeVh * window.innerHeight;
    const minHide = SEOUL_WATERMARK.stages.minHideVh * window.innerHeight;
    const plates: PlateCover[] = [];
    for (const el of Array.from(document.querySelectorAll<HTMLElement>(".reading-plate[data-plate]"))) {
      const id = el.dataset.plate ?? "";
      const r = el.getBoundingClientRect();
      let ty = 0;
      const rev = el.closest("[data-chapter-reveal]");
      if (rev) {
        const tf = getComputedStyle(rev).transform;
        if (tf && tf !== "none") ty = new DOMMatrixReadOnly(tf).m42;
      }
      const top = r.top + sy - ty + F.y;
      const bottom = r.bottom + sy - ty - F.y;
      const left = r.left + fx;
      const right = r.right - fx;
      const coversX = left <= box.left && right >= box.right;
      const c0 = top - box.top;
      const c1 = bottom - box.bottom;
      // 사라지고 돌아오는 길이는 덮개 구간의 3분의 1을 넘지 않습니다. 가운데 3분의 1 이상은
      // 형상이 다 사라져 있어 바뀌는 일을 둘 자리가 남습니다.
      const fade = Math.min(fadeMax, (c1 - c0) / 3);
      // #join 판은 예외입니다. 그 뒤로 형상이 돌아오지 않아(사라짐) 짧게 사라져도 깜빡이지 않습니다.
      // 1920×1080에서 이 판의 덮개는 0.29화면입니다.
      const hides = c1 > c0 && (c1 - c0 >= minHide || id === "join");
      plates.push({ id, top, bottom, left, right, coversX, cover: hides ? { c0, c1, fade } : null });
    }
    plates.sort((a, b) => a.top - b.top);
    this.plates = plates;
  }

  /**
   * 형상이 바뀌는 세 구간의 자리(문서 스크롤 px). 판 덮개 브리프 2.2의 배정에 2026-09-26 2차의
   * "판 뒤에서는 사라진다"를 더했습니다. 각 판의 덮개 구간에서 양 끝 fade를 뺀 가운데가 형상이
   * 다 사라져 있는 구간이고, 바뀌는 일은 그 안에서만 일어납니다.
   *   떠오름   #december 판(첫 조각)      시작 = descendEnd를 가운데 구간 안으로 당긴 값, 길이 ≤ revealVh
   *   건너기   #naru 앞의 마지막 판        시작 = 가운데 시작, 길이 ≤ morph.spanVh
   *            (떠오름의 판은 빼고. 데스크톱은 #december 둘째 조각, 폰은 #gains 판)
   *   사라짐   #join 판                  끝 = 가운데 끝, 길이 ≤ dissolve.spanVh
   * 한 챕터의 판이 모두 형상보다 낮으면(덮개 없음) 옛 식(챕터 머리 앵커, stages.coverFallback)으로
   * 돌아가고 개발 빌드에서 경고합니다. 그때는 바뀌는 모습이 보입니다.
   */
  private sched = { revealStart: Infinity, revealSpan: 1, morphStart: Infinity, morphSpan: 1, dissolveStart: Infinity, dissolveSpan: 1 };
  private schedule() {
    const vh = window.innerHeight;
    const S = SEOUL_WATERMARK.stages;
    const descendEnd = this.heroEnd + S.descendVh * vh;
    // 챕터(chapter)의 판 가운데, 형상이 다 사라져 있는 구간이 있는 첫 판.
    const hidden = (chapter: string) => {
      for (const p of this.plates) {
        if (!p.cover || (p.id !== chapter && !p.id.startsWith(chapter + "-"))) continue;
        const a = p.cover.c0 + p.cover.fade;
        const b = p.cover.c1 - p.cover.fade;
        if (b - a >= 1) return { a, b };
      }
      return null;
    };

    // DECIDED 2026-09-26 3차 (사용자: #gains와 #naru 사이 틈에 "아직 한국 shape이 보이는데?"):
    // 건너기는 #naru 앞, 형상을 숨기는 마지막 판 뒤입니다. 같은 날 앞서 정한 "#gains와 #naru 사이
    // 이음매에서는 싱가포르"로 돌아갑니다. 판 덮개 브리프 2.2의 "naru 판"을 대신합니다.
    const decFirst = this.plates.find((p) => p.cover && (p.id === "december" || p.id.startsWith("december-")));
    const beforeNaru = this.plates.filter((p) => p.cover && p !== decFirst && p.top < this.naruTop);
    let naru: { a: number; b: number } | null = null;
    for (let k = beforeNaru.length - 1; k >= 0 && !naru; k--) {
      const c = beforeNaru[k].cover!;
      if (c.c1 - c.fade - (c.c0 + c.fade) >= 1) naru = { a: c.c0 + c.fade, b: c.c1 - c.fade };
    }
    naru ??= hidden("naru");
    let morphStart: number, morphSpan: number;
    if (naru) {
      morphStart = naru.a;
      morphSpan = Math.min(S.morph.spanVh * vh, naru.b - naru.a);
    } else {
      morphStart = this.naruTop - S.coverFallback.morphStartVh * vh;
      morphSpan = S.morph.spanVh * vh;
      if (Number.isFinite(this.naruTop)) this.warnCover("morph-fallback", "#naru 판이 형상을 덮는 구간이 없습니다. 건너기를 #naru 머리 앵커로 둡니다(바뀌는 것이 보입니다).");
    }

    // 떠오름은 #december의 첫 판 뒤입니다. 해가 다 내려가기 전에 그 판의 가운데 구간이 끝나는
    // 창(1728×906, 1920×1080)에서도 첫 틈에 서울이 서 있게, 시작을 가운데 구간 안으로 당깁니다.
    // 형상은 그동안 사라져 있으니 해와 서울이 겹쳐 보이는 것은 틈에서 해가 마저 내려가는 잠깐뿐입니다.
    const dec = hidden("december");
    let revealStart: number, revealSpan: number;
    if (dec) {
      const room = Math.min(0.2 * vh, dec.b - dec.a);
      revealStart = Math.min(Math.max(descendEnd, dec.a), dec.b - room);
      revealSpan = Math.max(Math.min(S.revealVh * vh, dec.b - revealStart), 1);
    } else {
      // 옛 식: 구간 1 끝에서 시작, 건너기 시작을 넘지 않게.
      revealStart = descendEnd;
      revealSpan = Math.max(Math.min(S.revealVh * vh, morphStart - descendEnd), 1);
      if (Number.isFinite(this.naruTop)) this.warnCover("reveal-fallback", "#december 판이 구간 1 뒤에 형상을 덮는 구간이 없습니다. 떠오름을 구간 1 끝에 둡니다(떠오르는 것이 보입니다).");
    }

    const join = hidden("join");
    let dissolveStart: number, dissolveSpan: number;
    if (join) {
      dissolveSpan = Math.min(S.dissolve.spanVh * vh, join.b - join.a);
      dissolveStart = join.b - dissolveSpan;
    } else {
      dissolveStart = this.joinTop - S.coverFallback.dissolveStartVh * vh;
      dissolveSpan = S.dissolve.spanVh * vh;
      if (Number.isFinite(this.joinTop)) this.warnCover("dissolve-fallback", "#join 판이 형상을 덮는 구간이 없습니다. 사라짐을 #join 머리 앵커로 둡니다(사라지는 것이 보입니다).");
    }
    this.sched = { revealStart, revealSpan, morphStart, morphSpan, dissolveStart, dissolveSpan };
  }

  /**
   * 판 뒤에서 형상이 얼마나 사라져 있는가(0 = 보임, 1 = 다 사라짐). 덮개 구간에 들어가면 fade에
   * 걸쳐 1로, 나올 때 fade에 걸쳐 0으로. 판이 겹치지 않으므로 가장 큰 값 하나입니다.
   */
  private hiddenAt(sy: number) {
    let h = 0;
    for (const p of this.plates) {
      const c = p.cover;
      if (!c || sy <= c.c0 || sy >= c.c1) continue;
      const f = Math.max(c.fade, 1);
      h = Math.max(h, Math.min(1, (sy - c.c0) / f, (c.c1 - sy) / f));
    }
    return h * h * (3 - 2 * h);
  }

  /** 판 덮개 경고. 개발 빌드에서 종류마다 한 번(판 덮개 브리프 2.3). */
  private readonly warnedCover = new Set<string>();
  private warnCover(key: string, msg: string) {
    if (process.env.NODE_ENV === "production" || this.warnedCover.has(key)) return;
    this.warnedCover.add(key);
    console.warn(`[background] ${msg}`);
  }

  /**
   * 구간 2가 모자라면 개발 빌드에서 한 번 경고합니다(챕터 지도 브리프 3.2). 2026-09-23 이전
   * 배포본은 서울이 온전히 선 구간이 0px이었고, 아무도 몰랐습니다.
   * 2026-09-26 3차부터 형상은 틈에서만 보이므로, 기준을 "이어진 한 화면"에서 "떠오름이 끝난 뒤
   * 건너기 전에 서울이 온전히 보이는 스크롤이 있는가"로 바꿉니다(20px 간격으로 봅니다).
   */
  private warnedShortSeoul = false;
  private warnShortSeoul() {
    if (process.env.NODE_ENV === "production" || this.warnedShortSeoul) return;
    const { revealStart, revealSpan, morphStart } = this.sched;
    if (!Number.isFinite(morphStart) || !Number.isFinite(revealStart)) return;
    let seen = 0;
    for (let y = revealStart + revealSpan; y < morphStart; y += 20) if (this.hiddenAt(y) < 0.001) seen += 20;
    if (seen < 20) {
      this.warnedShortSeoul = true;
      console.warn(`[background] 서울이 온전히 보이는 틈이 없습니다(떠오름 끝 ${Math.round(revealStart + revealSpan)}px, 건너기 시작 ${Math.round(morphStart)}px). 판 나누기를 보세요.`);
    }
  }

  dispose() {
    this.running = false;
    cancelAnimationFrame(this.rafId);
    this.stageObserver?.disconnect();
    this.pointer.detach();
    window.removeEventListener("resize", this.onResize);
    window.removeEventListener("scroll", this.onScroll);
    document.removeEventListener("visibilitychange", this.onVisibility);
    this.mql.removeEventListener("change", this.onReducedChange);

    this.atmosphere?.dispose();
    this.particles?.dispose();
    this.water?.dispose();
    this.lantern?.dispose();
    this.post.dispose();
    this.scene.traverse((o) => {
      const l = o as THREE.Light;
      if (l.dispose) l.dispose();
    });
    this.renderer.dispose();
  }

  // ── event handlers (stable refs for clean removal) ──────────────────────────
  private mql = window.matchMedia("(prefers-reduced-motion: reduce)");
  private onReducedChange = (e: MediaQueryListEvent) => this.applyReducedMotion(e.matches);
  private onResize = () => {
    this.renderer.resize();
    this.cam.resize();
    this.atmosphere?.resize();
    this.water?.resize();
    this.post.setSize(window.innerWidth, window.innerHeight);
    this.syncPixelRatio();
    this.readAnchors();
    this.placeLantern();
    this.placeShapes();
  };
  private onScroll = () => {
    // While a modal holds the scroll lock the page is parked at
    // `position: fixed` (lib/useBodyScrollLock): scrollY reads 0 and the
    // document collapses to viewport height, so this would drive the scene back
    // to its start and then jump it forward again on close — visible through the
    // 70%-opacity backdrop. Hold the last real reading until the page is free.
    if (isScrollLocked()) return;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    this.scroll = max > 0 ? clamp(window.scrollY / max, 0, 1) : 0;
    this.scrollY = window.scrollY;
  };
  private onVisibility = () => {
    this.visible = document.visibilityState === "visible";
    if (this.visible) this.clock.getDelta(); // swallow the gap
  };

  // OS의 prefers-reduced-motion 값. 방문자가 페이지 안에서 켜기를 누르면(motionOptIn) 그 선택이 이깁니다.
  private reducedPref = false;
  private motionOptIn = false;
  private applyReducedMotion(pref: boolean) {
    this.reducedPref = pref;
    // DECIDED 2026-09-23 (사용자: "내가 부탁한 내용이 반영이 안되고 있음"): 사용자의 맥은 동작 줄이기가
    // 켜져 있어 배경이 멈춰 있었고, 헤더의 "배경 움직임 켜기"를 눌러도 motionScale이 0에 묶여
    // 아무것도 움직이지 않았습니다. 버튼이 켜짐을 표시하는데 배경은 멈춘 채였습니다.
    // 페이지 안에서 명시적으로 켠 선택은 OS 설정보다 우선합니다. 누르기 전까지는 OS 설정대로 멈춥니다.
    const reduced = pref && !this.motionOptIn;
    this.reduced = reduced;
    this.cam.setReducedMotion(reduced);
    // DECIDED 2026-09-15: 0.1이 아니라 0입니다. WCAG 2.2.2가 요구하는 것은
    // 감속이 아니라 정지이고, prefers-reduced-motion을 그 "수단"으로 쓰려면
    // 실제로 멈춰야 합니다. 10% 속도도 전정기관에는 움직임입니다.
    // fieldTime이 누산기라 값이 t=0으로 튀지 않고 그 자리에 섭니다.
    // 스크롤 연동 이동은 남깁니다. 그건 자동으로 시작되는 움직임이 아니라
    // 사용자가 손가락으로 만든 것이고, 2.2.2의 대상이 아닙니다.
    this.motionScale = reduced ? 0 : 1;
  }

  private syncPixelRatio() {
    this.particles?.setPixelRatio(this.renderer.pixelRatio);
  }

  // ── render loop ─────────────────────────────────────────────────────────────
  private loop = () => {
    if (!this.running) return;
    this.rafId = requestAnimationFrame(this.loop);
    if (!this.visible) return; // pause work in background tabs
    if (this.paused) return; // 방문자가 껐습니다

    const dt = Math.min(this.clock.getDelta(), 0.05);
    const t = this.clock.elapsedTime;

    // adaptive DPR: if we're consistently slow, drop resolution one notch
    this.adapt(dt);

    this.pointer.update(this.cam.camera, dt);
    this.cam.setPointer(this.pointer.ndc.x, this.pointer.ndc.y);
    this.cam.update(t, dt, this.scroll);

    // narrative phases drive every layer + the post stack
    const phases = computePhases(this.scroll);

    // project the convergence point to screen UV so the lens bends space around
    // exactly where particles are streaming — the focus is felt, never outlined
    this.focusProjected.copy(this.focusWorld).project(this.cam.camera);
    this.post.setFocus(
      this.focusProjected.x * 0.5 + 0.5,
      this.focusProjected.y * 0.5 + 0.5
    );

    this.fieldTime += dt * this.motionScale;

    // 스크롤 속도. 초당 진행률을 0.6(한 화면을 빠르게 넘기는 속도)으로 나눠
    // 0..1로 봅니다. 감쇠 계수가 비대칭인 것이 요점입니다: 손가락이 움직이면
    // 즉시 반응하고(12), 멈추면 물살이 서서히 잦아듭니다(1.8). 대칭이면
    // 스크롤을 멈춘 순간 배경도 같이 뚝 멈춰서, 물이 아니라 스위치로 보여요.
    const perSec = Math.abs(this.scroll - this.prevScroll) / Math.max(dt, 1e-3);
    this.prevScroll = this.scroll;
    const target = clamp(perSec / 0.6, 0, 1);
    const k = target > this.flow ? 12 : 1.8;
    this.flow += (target - this.flow) * Math.min(1, k * dt);

    if (this.variant === "crossing" && this.particles && this.atmosphere && !SHAPES.enabled) {
      // 형상 없음: 깊이 층만. 국면은 calm(그룹 챕터의 잔잔함)만 씁니다.
      this.anchorTimer += dt;
      if (this.anchorTimer > 2) { this.anchorTimer = 0; this.readAnchors(); }
      const cp = computeCrossingPhases(this.scrollY, window.innerHeight, this.scroll, this.anchors);
      this.atmosphere.update(this.fieldTime, this.scroll, 0);
      this.particles.updateCrossing(this.fieldTime, this.scroll, this.motionScale, cp, 0);
      this.post.setPhase(crossingToPhases(cp), this.reduced ? 0.3 : 1);
      this.post.render(dt);
      return;
    }
    if (this.variant === "crossing" && this.water && this.particles && this.lantern && this.atmosphere) {
      this.anchorTimer += dt;
      if (this.anchorTimer > 2) { this.anchorTimer = 0; this.readAnchors(); }
      const vh = window.innerHeight;
      const cp = computeCrossingPhases(this.scrollY, vh, this.scroll, this.anchors);
      const ph = crossingToPhases(cp);
      // 형상과 등불은 히어로의 시각물이라 히어로와 같이 스크롤됩니다. px → z = 0 평면의
      // 월드 단위(fov에 따라). 카메라 돌리가 조금 어긋나게 하지만 배경이라 괜찮습니다.
      const portrait = vh > window.innerWidth;
      const halfH = 30 * Math.tan(((portrait ? 75 : 60) * Math.PI) / 360);
      const shift = (this.scrollY / vh) * 2 * halfH;
      const k = (30 - CROSSING.lantern.z) / 30;
      this.lantern.sprite.position.y = this.lanternBaseY + shift * k;
      // 등불의 화면 uv. 반사 띠의 지평선이 여기서 시작하고, 렌즈의 초점도 여기입니다.
      this.lanternProjected.copy(this.lantern.sprite.position).project(this.cam.camera);
      const lx = this.lanternProjected.x * 0.5 + 0.5;
      const ly = this.lanternProjected.y * 0.5 + 0.5;
      this.post.setFocus(lx, ly);
      this.water.setLamp(lx, ly, this.stageLayout ? this.stageLayout.band.h / window.innerHeight : CROSSING.bandHeight);
      this.atmosphere.update(this.fieldTime, this.scroll, 0);
      // uFlow 자리에 건너기 국면을 넘깁니다. 건너는 동안 반사 띠가 흔들립니다.
      this.water.setBandFade(cp.fade);
      this.water.update(this.fieldTime, this.scroll, this.pointerUv, 0, cp.crossing);
      this.particles.updateCrossing(this.fieldTime, this.scroll, this.motionScale, cp, shift);
      this.lantern.update(this.fieldTime, cp.gather, cp.arrived, cp.fade);
      this.post.setPhase(ph, this.reduced ? 0.3 : 1);
      this.post.render(dt);
      return;
    }

    if (this.water && this.variant === "water") {
      // 파문 위상 적분(2026-09-19, 파문 위상 브리프 1.4). 셰이더의
      // uTime × (0.5 + uFlow × 1.6)을 대신합니다. 곱셈이면 uFlow가 바뀌는 순간
      // 페이지를 연 뒤 지나간 시간 전체가 곱해져 위상이 점프했습니다.
      // motionScale이 0(모션 민감)이면 여기서도 멈춥니다. 셰이더의 uTime이 멈추던 것과
      // 같은 결과입니다.
      const ringRate = Math.min(RING.baseRate + this.flow * RING.flowGain, RING.maxRate);
      this.ringPhase += ringRate * dt * this.motionScale;
      this.water.setRingPhase(this.ringPhase);

      // 서울 워터마크(2026-09-18). 국면 uniform은 전부 0(banks 자세). uShift 0: 카메라
      // 자식이라 뷰포트 고정입니다. 시간은 쓰지 않습니다. 손가락이 만든 움직임이라 모션
      // 민감 설정과의 관계가 지금과 같습니다(WCAG 2.2.2의 대상이 아닙니다).
      this.anchorTimer += dt;
      if (this.anchorTimer > 2) { this.anchorTimer = 0; this.readAnchors(); }
      const vh = window.innerHeight;
      const ss = (x: number) => x * x * (3 - 2 * x);
      const W = SEOUL_WATERMARK;
      const S = W.stages;

      // ── 구간 지도 (DECIDED 2026-09-23, 챕터 지도 브리프) ──────────────────────
      //   0 나루터    0 → #top 하단                        수면, 해
      //   1 건넘      #top 하단 → +descendVh              해가 내려가 나루 점이 됨
      //   2 서울      구간 1 끝 → 건너기 시작              서울 윤곽(떠오름은 december 판 뒤)
      //   3 크로싱    naru 판 뒤, morph.spanVh             서울 → 싱가포르
      //   4 싱가포르  → 사라짐 시작                        싱가포르 윤곽
      //   5 세 곳     join 판 뒤, dissolve.spanVh, 그 뒤   형상을 거두고 나루 점만
      // 2026-09-26 (판 덮개 브리프): 2, 3, 5의 경계는 schedule()이 판의 덮개 구간에서 정합니다.
      // 전에는 구간 1이 #gains 상단까지라 #december 전체가 해가 지는 장면이었고, 건너기가
      // 서울이 다 떠오르기 전에 시작해서 서울이 온전히 선 구간이 0px이었습니다.
      const descendEnd = this.heroEnd + S.descendVh * vh;
      const P = this.sched;
      const morphStart = P.morphStart;
      const morphEnd = morphStart + P.morphSpan;

      // 구간 1. 선형으로 넘깁니다. water 셰이더가 uStage1에 자기 곡선(pow 12 등)을
      // 이미 씌우므로, 여기서 ss()를 한 번 더 씌우면 해가 내려가는 모양이 바뀝니다.
      const s1 = clamp((this.scrollY - this.heroEnd) / (S.descendVh * vh), 0, 1);
      // 구간 2 진행. 셰이더가 uStage2로 나루 점을 화면 가운데로 올립니다(my).
      // 구간 1 끝부터 건너기 시작까지로 다시 정의합니다.
      const s2 = clamp((this.scrollY - descendEnd) / Math.max(morphStart - descendEnd, 1), 0, 1);
      // 구간 3. naru 판이 형상을 다 덮고 있는 동안 건넙니다(2026-09-26 판 덮개 브리프).
      // 틈 B에는 온전한 서울, 틈 C에는 온전한 싱가포르. 위로 스크롤하면 같은 길로 돌아옵니다.
      const morph = ss(clamp((this.scrollY - morphStart) / P.morphSpan, 0, 1));
      this.particles?.setMorph(morph);

      // 떠오름은 구간 1이 끝난 뒤, december 판이 형상을 다 덮고 있는 동안입니다. 수면이
      // 가라앉는 것과 서울이 서는 것이 겹치지 않습니다(한 시계 브리프 3.4).
      const reveal = ss(clamp((this.scrollY - P.revealStart) / P.revealSpan, 0, 1));
      // 구간 4의 밝기. 건너기가 끝난 뒤 1vh에 걸쳐 singaporeBright로. 싱가포르가 한 번은
      // 온전한 밝기로 서야 합니다. 어두워지면서 도착하면 물러나는 것으로 읽힙니다.
      const settle = ss(clamp((this.scrollY - morphEnd) / vh, 0, 1));
      // 구간 5. #join(세 곳: 싱가포르, 한국, 그 밖) 판 뒤에서 형상을 거두고, 판의 덮개 구간이
      // 끝나기 전에 다 거둡니다. 나루 점(water 셰이더의 깊은 물 층)은 남습니다.
      // #join이 없는 페이지에서는 joinTop이 Infinity라 dissolve가 0입니다.
      // 흩어지는 모양(브리프 3.4의 uBreath)은 넣지 않았습니다. 불투명도만으로 먼저 봅니다.
      const dissolve = ss(clamp((this.scrollY - P.dissolveStart) / P.dissolveSpan, 0, 1));
      // 판 뒤에서는 사라지고 틈에서만 보입니다(DECIDED 2026-09-26 2차, config의 hideFadeVh).
      const visible = 1 - this.hiddenAt(this.scrollY);
      const shapeOpacity = reveal * (1 - dissolve) * visible;
      // 구간 4 진행(건너기 끝 → 형상 거두기 시작). DECIDED 2026-09-23 (사용자: "싱가폴 모양으로
      // 넘어가면 해가 아예 멈추고 빛이 퍼지는 것도 없음"): 서울 구간에서는 스크롤이 나루 점을
      // 올리고 파문이 건너는 동안 커지는데, 싱가포르에 닿은 뒤로는 스크롤에 반응하는 것이
      // 없었습니다. 셰이더가 이 값으로 점을 섬을 따라 움직이고 파문을 살려 둡니다.
      // 2026-09-23 (사용자: "화면을 넓게 써서 빛이 이동했으면"): 끝을 형상 거두기 시작에서
      // 문서 끝으로 늘립니다. 같은 폭을 더 긴 스크롤에 나눠 움직여 천천히 갑니다.
      const docEnd = document.documentElement.scrollHeight - vh;
      const s4 = clamp((this.scrollY - morphEnd) / Math.max(docEnd - morphEnd, 1), 0, 1);
      // 휠은 한 번에 백 px씩 건너뛰어서, 스크롤 값을 그대로 쓰면 점이 계단처럼 튑니다
      // ("너무 확확 이동"). 점만 지수 감쇠로 따라가게 합니다. 사건을 시간이 만드는 것이 아니라
      // 스크롤이 정한 자리까지 미끄러지는 것이고, 모션 민감 설정에서는 바로 그 자리에 섭니다.
      // 2026-09-23 (사용자: "움직이는 속도가 너무 빠름"): 계수 2.4 → 0.7. 2.4는 1초에 90%를
      // 따라잡아 휠 한 번에 점이 휙 옮겨 갔습니다. 0.7이면 1초에 50%, 3초 남짓에 거의 다 가서
      // 천천히 흘러갑니다. 경로와 폭은 그대로입니다.
      // 2026-09-23 (사용자: "더 느리게, 이거의 50%로"): 0.7 → 0.35. 1초에 약 30%, 6초 남짓에 거의 다.
      // DECIDED 2026-09-23 (싱가포르 빛 속도 브리프 2.2): 지수 감쇠는 스크롤이 클수록 처음 속도가
      // 비례해서 커져, 바닥까지 플릭하면 점이 1초에 화면 폭의 70%를 갔습니다. 한 프레임의 이동량에
      // 상한(LIGHT_MAX_RATE, 초당 진행도 0.05)을 둡니다. 작은 스크롤은 전처럼 부드럽게 따라가고,
      // 큰 스크롤은 상한 속도로 흘러갑니다. 모션 민감 설정에서는 전처럼 바로 그 자리에 섭니다.
      const want = (s4 - this.s4Eased) * Math.min(1, dt * 0.35);
      const cap = LIGHT_MAX_RATE * dt;
      this.s4Eased = this.reduced ? s4 : this.s4Eased + Math.max(-cap, Math.min(cap, want));
      this.water.setStages(s1, s2, morph);
      // 구간 6 (DECIDED 2026-09-26, 사용자: 맨 아래에서는 빛과 배경 효과가 보이지 않게).
      // 깊은 물의 빛(나루 점, 번짐, 파문, 물살)을 푸터가 화면에 들어오기 **전에** 다 거둡니다.
      // 푸터 상단이 화면 아래 끝보다 0.4화면 아래에 있을 때 시작해, 화면 아래 끝에 닿을 때 0.
      // 처음에는 푸터가 들어온 뒤에 시작했는데, 폰에서 그 직전 화면(매니페스토 블록)에 점이
      // 반쯤 남았습니다. 사용자가 짚은 "맨 아래"는 그 블록까지입니다. 문서 끝이 먼저 오면
      // 그 끝에서 다 거둬지게 길이를 줄입니다. 형상은 이미 구간 5에서 거둬져 있습니다.
      const endStart = this.closingTop - 1.4 * vh;
      const endSpan = Math.max(Math.min(0.4 * vh, docEnd - endStart), 1);
      this.water.setEnd(ss(clamp((this.scrollY - endStart) / endSpan, 0, 1)));

      // DECIDED 2026-09-19 (사용자): "모바일도 데스크톱과 같은 배경 효과였으면 좋겠다."
      // 세로 화면은 크기와 자리가 처음부터 끝까지 같습니다. calm으로 옮기지 않습니다
      // (2026-09-23부터 naruW, naruCy, naruBright를 지웠습니다).
      const portrait = vh > window.innerWidth;
      // LIGHT_SWEEP은 화면 폭 대비입니다. 셰이더의 uv 1은 화면 폭이 아니라 수면 평면의 폭이고,
      // 그 평면은 화면보다 12% 넓게 깔리고(WaterSurface.resize의 여유) 카메라 돌리로 조금 더
      // 커집니다. 실측하니 0.12가 화면 폭의 0.136(폰 0.15가 0.179)으로 그려졌습니다. 평면의 두 끝을
      // 매 프레임 화면에 투영해 uv 1이 화면 몇 폭인지 재고 그만큼 나눕니다.
      this.sweepA.set(-1, 0, 0).applyMatrix4(this.water.mesh.matrixWorld).project(this.cam.camera);
      this.sweepB.set(1, 0, 0).applyMatrix4(this.water.mesh.matrixWorld).project(this.cam.camera);
      const uvSpan = Math.abs(this.sweepB.x - this.sweepA.x) / 2 || 1;
      // 점의 가로 이동(DECIDED 2026-09-24, 폰 빛 움직임 브리프 2.1~2.2). 셰이더에 있던 식
      // sweep × sin(2π × smoothstep(0, 1, s4Eased))를 여기서 그대로 계산합니다. 화면 폭 대비 값을
      // 위의 uvSpan으로 나눠 uv로 넘기는 것도 전과 같습니다.
      const ss01 = (x: number) => { const c = clamp(x, 0, 1); return c * c * (3 - 2 * c); };
      // 폰을 돌리면(가로 ↔ 세로) 두 값을 목표로 바로 맞춥니다. 한 프레임 튀지만 회전 중이라 보이지 않습니다.
      const lap = Math.max(0, (this.scrollY - morphEnd) / (LIGHT_PORTRAIT.lapVh * vh));
      if (this.lightPortrait !== null && this.lightPortrait !== portrait) { this.s4Eased = s4; this.lapEased = lap; }
      this.lightPortrait = portrait;
      let dxScreen: number;
      if (portrait) {
        // DECIDED 2026-09-24 (폰 빛 움직임 브리프 2.3): 세로 화면은 문서 끝까지 한 바퀴가 아니라
        // 2.6화면마다 한 바퀴(바퀴 수로 셉니다. 1에서 자르지 않고 문서 끝에서 자연히 멈춥니다).
        // 따라가기는 가로와 같은 감쇠(초당 35%)에 상한은 초당 0.07바퀴. 도착 직후 튀지 않게 첫
        // 1/4바퀴 동안 폭을 0에서 키웁니다(가로의 smoothstep과 같은 역할).
        const wantP = (lap - this.lapEased) * Math.min(1, dt * 0.35);
        const capP = LIGHT_PORTRAIT.maxRate * dt;
        this.lapEased = this.reduced ? lap : this.lapEased + Math.max(-capP, Math.min(capP, wantP));
        const ramp = ss01(this.lapEased / 0.25);
        dxScreen = LIGHT_PORTRAIT.sweep * ramp * Math.sin(2 * Math.PI * this.lapEased);
      } else {
        // 가로 화면은 전과 같습니다(문서 끝까지 한 바퀴, smoothstep, LIGHT_MAX_RATE).
        dxScreen = LIGHT_SWEEP.landscape * Math.sin(2 * Math.PI * ss01(this.s4Eased));
      }
      const lightDx = dxScreen / uvSpan;
      this.water.setLightDx(lightDx);
      if (process.env.NODE_ENV !== "production") {
        // 개발 빌드에서만. 속도를 스크린숏이 아니라 값으로 재기 위해서입니다(브리프 4장).
        // 2026-09-26 (판 덮개 브리프 4): 형상이 바뀌는 세 진행도와 판 덮개도 값으로 잽니다.
        (window as unknown as { __naruBg?: unknown }).__naruBg = {
          lightDx, dxScreen, uvSpan, s4Eased: this.s4Eased, lapEased: this.lapEased, t: performance.now(),
          sy: this.scrollY, vh, s1, s2, reveal, morph, dissolve, visible, ringPhase: this.ringPhase,
          shapeBox: this.shapeBox, plates: this.plates, schedule: this.sched,
        };
      }
      let opacity: number;
      if (portrait) {
        opacity = shapeOpacity * W.portrait.heroBright * (1 - settle * (1 - S.singaporeBright));
        this.placeSeoul(W.portrait.heroW, W.portrait.heroCy);
      } else {
        opacity = shapeOpacity * (1 - settle * (1 - S.singaporeBright));
      }
      this.particles?.updateCrossing(this.fieldTime, this.scroll, this.motionScale, { gather: 0, crossing: 0, arrived: 0, calm: settle }, 0);
      // 점 크기는 화면 방향에 따라 다릅니다(2026-09-19). 같은 px이라도 형상이 크면
      // 비율이 작아져 선이 끊겨 보입니다. 세로는 3.2/1.6, 가로는 4.2/2.0.
      this.particles?.setShapeLook(
        W.edgeBright,
        W.innerBright,
        opacity,
        // 2026-09-23 (서울 존재감 브리프 3.2): 가장자리 점 크기는 형상별입니다. morph 0이면
        // 서울 값, 1이면 싱가포르 값. morph가 스크롤에서 나오므로 건너는 동안 끊기지 않습니다.
        portrait
          ? W.edgePxSeoul + (W.edgePx - W.edgePxSeoul) * morph
          : W.edgePxLandscapeSeoul + (W.edgePxLandscape - W.edgePxLandscapeSeoul) * morph,
        portrait ? W.innerPx : W.innerPxLandscape
      );
      if (this.particles) this.particles.points.visible = opacity > 0.001;
      // 포인터 ndc(-1..1)를 화면 uv(0..1)로. 셰이더가 파문을 여기에 놓습니다.
      this.pointerUv.set(
        this.pointer.ndc.x * 0.5 + 0.5,
        this.pointer.ndc.y * 0.5 + 0.5
      );
      // 모션 민감 설정에서는 파문도 끕니다. 커서를 따라오는 물결은 자동으로
      // 시작되는 움직임은 아니지만, 정지를 고른 사람에게 줄 이유도 없습니다.
      this.water.update(this.fieldTime, this.scroll, this.pointerUv, this.reduced ? 0 : 1, this.flow);
    } else {
      this.atmosphere?.update(this.fieldTime, this.scroll, phases.reveal);
      this.particles?.update(this.fieldTime, this.pointer.world, this.scroll, this.motionScale, phases);
    }
    // under reduced-motion, damp the flashy portal/white-out so the crossing
    // stays calm and the footer text never washes out
    this.post.setPhase(phases, this.reduced ? 0.3 : 1);

    this.post.render(dt);
  };

  /** 방문자가 배경을 껐는가. 끄면 다음 프레임부터 그리지 않습니다. */
  /** 방문자가 페이지 안에서 움직임을 켰는가(2026-09-23). 켜면 prefers-reduced-motion을 넘어섭니다. */
  setMotionOptIn(on: boolean) {
    this.motionOptIn = on;
    this.applyReducedMotion(this.reducedPref);
  }

  setPaused(paused: boolean) {
    this.paused = paused;
    // 켤 때 시계의 빈 구간을 삼킵니다. 그러지 않으면 꺼 둔 시간만큼 fieldTime이
    // 한 프레임에 뛰어 배경이 순간이동합니다.
    if (!paused) this.clock.getDelta();
  }

  /** Rolling FPS estimate → step DPR down once if we're below ~45fps sustained. */
  private adaptedDown = false;
  private adapt(dt: number) {
    if (this.adaptedDown) return;
    this.frameAccum += dt;
    this.frameCount++;
    if (this.frameAccum >= 1.5) {
      const fps = this.frameCount / this.frameAccum;
      if (fps < 45) {
        // halve the effective DPR for headroom
        this.renderer.gl.setPixelRatio(Math.max(1, this.renderer.pixelRatio * 0.75));
        this.syncPixelRatio();
        this.adaptedDown = true;
      }
      this.frameAccum = 0;
      this.frameCount = 0;
    }
  }
}
