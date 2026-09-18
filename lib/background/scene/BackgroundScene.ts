import * as THREE from "three";
import { CROSSING, SHAPES, SEOUL_WATERMARK, pickQuality, type QualityTier } from "../config";
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
      variant === "crossing" ? CROSSING.bloomThreshold : undefined
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
    const hw = (widthFrac ?? (portrait ? W.portrait.heroW : W.landscapeW)) * halfW;
    const cy = cyFrac ?? (portrait ? W.portrait.heroCy : W.cy);
    const sym = { x: (W.cx * 2 - 1) * halfW, y: (1 - cy * 2) * halfH, hw };
    this.particles.setShapes(sym, sym);
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
  private heroEnd = 900; // water 변형의 서울 워터마크가 씁니다(히어로 section의 아래, 문서 px)
  private naruTop = Infinity;
  private readAnchors() {
    if (this.variant === "water") {
      const hero = document.getElementById("top");
      if (hero) this.heroEnd = hero.getBoundingClientRect().bottom + window.scrollY;
      const naru = document.getElementById("naru");
      if (naru) this.naruTop = naru.getBoundingClientRect().top + window.scrollY;
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

  private applyReducedMotion(reduced: boolean) {
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
      // 서울 워터마크(2026-09-18): 히어로 하단이 뷰포트 상단을 지나면 revealVh에 걸쳐
      // 떠오르고, 그 뒤로는 서 있습니다. #naru부터 조금 더 어둡게. 국면 uniform은 전부 0
      // (banks 자세). uShift 0: 카메라 자식이라 뷰포트 고정입니다.
      this.anchorTimer += dt;
      if (this.anchorTimer > 2) { this.anchorTimer = 0; this.readAnchors(); }
      const vh = window.innerHeight;
      const ss = (x: number) => x * x * (3 - 2 * x);
      const W = SEOUL_WATERMARK;
      const c = clamp((this.scrollY - (this.naruTop - 0.5 * vh)) / vh, 0, 1);
      const calm = ss(c);
      let opacity: number;
      if (vh > window.innerWidth) {
        // 세로 화면: 히어로에 서 있다가 풀리고, 본문 뒤에서는 없고, #naru부터 다시(설정 portrait).
        const g = ss(clamp((this.scrollY - this.heroEnd) / (W.portrait.dissolveVh * vh), 0, 1));
        opacity = (1 - g) * W.portrait.heroBright + calm * W.portrait.naruBright;
        this.placeSeoul(W.portrait.heroW + (W.portrait.naruW - W.portrait.heroW) * calm, W.portrait.heroCy + (W.portrait.naruCy - W.portrait.heroCy) * calm);
      } else {
        // 가로 화면: 히어로 하단이 뷰포트 상단을 지나면 revealVh에 걸쳐 떠오르고, 그 뒤로는
        // 서 있습니다. #naru부터 조금 더 어둡게.
        const r = clamp((this.scrollY - this.heroEnd) / (W.revealVh * vh), 0, 1);
        opacity = ss(r) * (1 - calm * (1 - W.calmBright));
      }
      this.particles?.updateCrossing(this.fieldTime, this.scroll, this.motionScale, { gather: 0, crossing: 0, arrived: 0, calm }, 0);
      this.particles?.setShapeLook(W.edgeBright, W.innerBright, opacity, W.edgePx, W.innerPx);
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
