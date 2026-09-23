import * as THREE from "three";
import { CROSSING, RING, SHAPES, SEOUL_WATERMARK, pickQuality, type QualityTier } from "../config";
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
  // 구간 4 진행도를 부드럽게 따라가는 값(점의 가로 이동용). 휠의 계단을 지웁니다.
  private s4Eased = 0;
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

  /**
   * 구간 2가 모자라면 개발 빌드에서 한 번 경고합니다(챕터 지도 브리프 3.2). 서울이 다 떠오른
   * 뒤 온전히 설 자리가 한 화면이 안 되는 경우입니다. 2026-09-23 이전 배포본이 정확히
   * 그랬고(서울 온전 0px), 아무도 몰랐습니다.
   */
  private warnedShortSeoul = false;
  private warnShortSeoul() {
    if (process.env.NODE_ENV === "production" || this.warnedShortSeoul) return;
    if (!Number.isFinite(this.naruTop)) return;
    const vh = window.innerHeight;
    const S = SEOUL_WATERMARK.stages;
    const room = (this.naruTop - S.morph.startVh * vh) - (this.heroEnd + S.descendVh * vh);
    if (room < S.revealVh * vh + vh) {
      this.warnedShortSeoul = true;
      console.warn(
        `[background] 구간 2가 모자랍니다: 서울이 설 자리 ${Math.round(room)}px, ` +
        `필요 ${Math.round(S.revealVh * vh + vh)}px (revealVh + 1vh). stages.descendVh 또는 앵커를 보세요.`
      );
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
      //   2 서울      구간 1 끝 → #naru − morph.startVh    서울 윤곽(앞 revealVh는 떠오름)
      //   3 크로싱    → +morph.spanVh                      서울 → 싱가포르
      //   4 싱가포르  → #join − dissolve.startVh          싱가포르 윤곽
      //   5 세 곳     → +dissolve.spanVh, 그 뒤 끝까지     형상을 거두고 나루 점만
      // 전에는 구간 1이 #gains 상단까지라 #december 전체가 해가 지는 장면이었고, 건너기가
      // 서울이 다 떠오르기 전에 시작해서 서울이 온전히 선 구간이 0px이었습니다.
      const descendEnd = this.heroEnd + S.descendVh * vh;
      const morphStart = this.naruTop - S.morph.startVh * vh;
      const morphEnd = morphStart + S.morph.spanVh * vh;

      // 구간 1. 선형으로 넘깁니다. water 셰이더가 uStage1에 자기 곡선(pow 12 등)을
      // 이미 씌우므로, 여기서 ss()를 한 번 더 씌우면 해가 내려가는 모양이 바뀝니다.
      const s1 = clamp((this.scrollY - this.heroEnd) / (S.descendVh * vh), 0, 1);
      // 구간 2 진행. 셰이더가 uStage2로 나루 점을 화면 가운데로 올립니다(my).
      // 구간 1 끝부터 건너기 시작까지로 다시 정의합니다.
      const s2 = clamp((this.scrollY - descendEnd) / Math.max(morphStart - descendEnd, 1), 0, 1);
      // 구간 3. #naru 제목("건너는 건 각자가 한다")이 건너기의 70% 지점에 옵니다.
      // 위로 스크롤하면 같은 길로 돌아옵니다.
      const morph = ss(clamp((this.scrollY - morphStart) / (S.morph.spanVh * vh), 0, 1));
      this.particles?.setMorph(morph);

      // 떠오름 길이는 구간 2보다 길 수 없습니다(챕터가 짧아져도 떠오르다 건너지 않게).
      // 떠오름은 구간 1이 끝난 뒤에 시작합니다. 수면이 가라앉는 것과 서울이 서는 것이
      // 겹치지 않습니다(한 시계 브리프 3.4).
      const revealSpan = Math.max(Math.min(S.revealVh * vh, morphStart - descendEnd), 1);
      const reveal = ss(clamp((this.scrollY - descendEnd) / revealSpan, 0, 1));
      // 구간 4의 밝기. 건너기가 끝난 뒤 1vh에 걸쳐 singaporeBright로. 싱가포르가 한 번은
      // 온전한 밝기로 서야 합니다. 어두워지면서 도착하면 물러나는 것으로 읽힙니다.
      const settle = ss(clamp((this.scrollY - morphEnd) / vh, 0, 1));
      // 구간 5. #join(세 곳: 싱가포르, 한국, 그 밖) 상단 dissolve.startVh 앞에서 시작해
      // spanVh 동안 형상을 거둡니다. 나루 점(water 셰이더의 깊은 물 층)은 남습니다.
      // #join이 없는 페이지에서는 joinTop이 Infinity라 dissolve가 0입니다.
      // 흩어지는 모양(브리프 3.4의 uBreath)은 넣지 않았습니다. 불투명도만으로 먼저 봅니다.
      const dissolveStart = this.joinTop - S.dissolve.startVh * vh;
      const dissolve = ss(clamp((this.scrollY - dissolveStart) / (S.dissolve.spanVh * vh), 0, 1));
      const shapeOpacity = reveal * (1 - dissolve);
      // 구간 4 진행(건너기 끝 → 형상 거두기 시작). DECIDED 2026-09-23 (사용자: "싱가폴 모양으로
      // 넘어가면 해가 아예 멈추고 빛이 퍼지는 것도 없음"): 서울 구간에서는 스크롤이 나루 점을
      // 올리고 파문이 건너는 동안 커지는데, 싱가포르에 닿은 뒤로는 스크롤에 반응하는 것이
      // 없었습니다. 셰이더가 이 값으로 점을 섬을 따라 움직이고 파문을 살려 둡니다.
      // 2026-09-23 (사용자: "화면을 넓게 써서 빛이 이동했으면"): 끝을 형상 거두기 시작에서
      // 문서 끝으로 늘립니다. 같은 폭을 더 긴 스크롤에 나눠 움직여 천천히 갑니다.
      const docEnd = document.documentElement.scrollHeight - vh;
      const s4 = clamp((this.scrollY - morphEnd) / Math.max(docEnd - morphEnd, 1), 0, 1);
      // 휠은 한 번에 백 px씩 건너뛰어서, 스크롤 값을 그대로 쓰면 점이 계단처럼 튑니다
      // ("너무 확확 이동"). 점만 지수 감쇠로 따라가게 합니다(1초에 약 90%). 사건을 시간이
      // 만드는 것이 아니라 스크롤이 정한 자리까지 미끄러지는 것이고, 모션 민감 설정에서는
      // 바로 그 자리에 섭니다.
      this.s4Eased = this.reduced ? s4 : this.s4Eased + (s4 - this.s4Eased) * Math.min(1, dt * 2.4);
      this.water.setStages(s1, s2, morph, this.s4Eased);

      // DECIDED 2026-09-19 (사용자): "모바일도 데스크톱과 같은 배경 효과였으면 좋겠다."
      // 세로 화면은 크기와 자리가 처음부터 끝까지 같습니다. calm으로 옮기지 않습니다
      // (2026-09-23부터 naruW, naruCy, naruBright를 지웠습니다).
      const portrait = vh > window.innerWidth;
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
