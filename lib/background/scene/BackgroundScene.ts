import * as THREE from "three";
import { CROSSING, pickQuality, type QualityTier } from "../config";
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
      this.particles = null;
      this.lantern = null;
      this.water = new WaterSurface();
      this.scene.add(this.water.mesh);
    } else if (variant === "crossing") {
      this.atmosphere = new Atmosphere();
      this.atmosphere.mesh.renderOrder = -2; // 하늘이 맨 뒤, 그 위에 반사 띠
      // 위는 거의 검정, 아래(강 쪽)는 옅은 남색. water 변형의 하늘과 같은 값입니다.
      this.atmosphere.setPalette("#0B1540", "#03050F", "#2A2260");
      this.water = new WaterSurface(true);
      this.particles = new ParticleField(this.quality, 1.0, "crossing");
      this.lantern = new Lantern();
      this.scene.add(this.atmosphere.mesh, this.water.mesh, this.particles.points, this.lantern.sprite);
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
  }

  /**
   * 등불의 자리. 가로 화면에서는 가운데 조금 오른쪽(히어로 두 단 사이의 틈,
   * uv x ≈ 0.53), 세로 화면에서는 왼쪽(uv x ≈ 0.2)입니다. 폰에서는 CTA 버튼이
   * 화면 가로의 대부분을 차지해서 가운데에 두면 기둥이 그 버튼 한가운데를 지납니다
   * (shaders/water.ts의 등불 자리 주석과 같은 이유).
   */
  private placeLantern() {
    if (!this.lantern || !this.particles) return;
    const portrait = window.innerHeight > window.innerWidth;
    const x = portrait ? -15 : CROSSING.lantern.x;
    // 세로 화면은 fov가 75라 같은 y가 화면에서 더 높이 잡힙니다. 히어로의 CTA
    // 아래(uv y ≈ 0.22)에 놓이도록 더 내립니다.
    const y = portrait ? -28 : CROSSING.lantern.y;
    this.lantern.setPosition(x, y, CROSSING.lantern.z);
    this.particles.setLantern(x, y, CROSSING.lantern.z);
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
    this.readAnchors();
    this.clock.start();
    this.loop();
  }

  /**
   * crossing 변형의 국면 경계. #record, #december, #naru의 offsetTop을 스크롤
   * 비율로 바꿉니다. 상수로 박지 않는 이유는 페이지 길이가 바뀌어도 "프로그램에서
   * 건넌다"가 유지되어야 하기 때문입니다. 시작·리사이즈, 그리고 2초마다 다시
   * 읽습니다(이미지가 늦게 실려 문서 높이가 바뀌는 경우).
   */
  private readAnchors() {
    if (this.variant !== "crossing") return;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (max <= 0) return;
    const top = (id: string) => {
      const el = document.getElementById(id);
      return el ? clamp(el.getBoundingClientRect().top + window.scrollY, 0, max) / max : null;
    };
    const record = top("record");
    const december = top("december");
    const naru = top("naru");
    if (record !== null && december !== null && naru !== null && record < december && december < naru) {
      this.anchors = { record, december, naru };
    }
  }

  dispose() {
    this.running = false;
    cancelAnimationFrame(this.rafId);
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

    if (this.variant === "crossing" && this.water && this.particles && this.lantern && this.atmosphere) {
      this.anchorTimer += dt;
      if (this.anchorTimer > 2) { this.anchorTimer = 0; this.readAnchors(); }
      const cp = computeCrossingPhases(this.scroll, this.anchors);
      const ph = crossingToPhases(cp);
      // 등불의 화면 uv. 반사 띠의 지평선이 여기서 시작하고, 렌즈의 초점도 여기입니다.
      this.lanternProjected.copy(this.lantern.sprite.position).project(this.cam.camera);
      const lx = this.lanternProjected.x * 0.5 + 0.5;
      const ly = this.lanternProjected.y * 0.5 + 0.5;
      this.post.setFocus(lx, ly);
      this.water.setLamp(lx, ly, CROSSING.bandHeight);
      this.atmosphere.update(this.fieldTime, this.scroll, 0);
      // uFlow 자리에 건너기 국면을 넘깁니다. 건너는 동안 반사 띠가 흔들립니다.
      this.water.update(this.fieldTime, this.scroll, this.pointerUv, 0, cp.crossing);
      this.particles.updateCrossing(this.fieldTime, this.scroll, this.motionScale, cp);
      this.lantern.update(this.fieldTime, cp.gather, cp.arrived);
      this.post.setPhase(ph, this.reduced ? 0.3 : 1);
      this.post.render(dt);
      return;
    }

    if (this.water) {
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
