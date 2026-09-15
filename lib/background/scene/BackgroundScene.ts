import * as THREE from "three";
import { pickQuality, type QualityTier } from "../config";
import { Renderer } from "../renderer/Renderer";
import { CameraController } from "../camera/CameraController";
import { Pointer } from "../interactions/Pointer";
import { ParticleField } from "../particles/ParticleField";
import { Atmosphere } from "../particles/Atmosphere";
import { WaterSurface } from "../water/WaterSurface";
import { PostFX } from "../renderer/PostFX";
import { computePhases } from "../utils/phases";
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
export type BackgroundVariant = "field" | "water";

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
  // water 변형에서만 만듭니다.
  private readonly water: WaterSurface | null;
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
      this.water = new WaterSurface();
      this.scene.add(this.water.mesh);
    } else {
      this.water = null;
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
    this.post = new PostFX(this.renderer.gl, this.scene, this.cam.camera, this.quality.bloom);
    this.post.setSize(window.innerWidth, window.innerHeight);

    this.applyReducedMotion(
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
    this.syncPixelRatio();
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
    this.clock.start();
    this.loop();
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

    if (this.water) {
      // 포인터 ndc(-1..1)를 화면 uv(0..1)로. 셰이더가 파문을 여기에 놓습니다.
      this.pointerUv.set(
        this.pointer.ndc.x * 0.5 + 0.5,
        this.pointer.ndc.y * 0.5 + 0.5
      );
      // 모션 민감 설정에서는 파문도 끕니다. 커서를 따라오는 물결은 자동으로
      // 시작되는 움직임은 아니지만, 정지를 고른 사람에게 줄 이유도 없습니다.
      this.water.update(this.fieldTime, this.scroll, this.pointerUv, this.reduced ? 0 : 1);
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
