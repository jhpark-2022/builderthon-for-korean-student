import * as THREE from "three";
import {
  EffectComposer,
  RenderPass,
  EffectPass,
  BloomEffect,
  VignetteEffect,
  Effect,
  BlendFunction,
} from "postprocessing";
import type { Phases } from "../utils/phases";

/**
 * Gravitational lensing — a *distortion in space*, never a drawn object.
 *
 * It bends the already-rendered scene toward a focal point using a smooth
 * potential falloff (∝ 1/(1+k·d²)), which is asymptotically zero everywhere and
 * has NO boundary — you can never trace an edge. Per-channel sample offsets give
 * true chromatic dispersion that's strongest where the bend is strongest. The
 * crossing brightness is a soft, unbounded radial bloom around the focus — no
 * disc, no ring, no alpha mask.
 *
 * Reads the scene texture itself (inputBuffer) in mainImage so the warp acts on
 * the environment, not on a shape of its own.
 */
class LensEffect extends Effect {
  constructor() {
    super(
      "LensEffect",
      /* glsl */ `
      uniform float uStrength;   // lensing strength 0..1
      uniform float uBright;     // white-out lift 0..1
      uniform vec2  uFocus;      // focal point in UV space
      uniform float uAspect;     // width/height, for circular metric in UV

      // smooth gravitational potential — no edge, no boundary
      float potential(float d){
        // 1/(1+k d^2): strong near focus, fades to ~0 with NO cutoff
        return 1.0 / (1.0 + 26.0 * d * d);
      }

      void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor){
        // aspect-correct vector from focus so the bend is radially symmetric
        vec2 dir = (uv - uFocus) * vec2(uAspect, 1.0);
        float d = length(dir);
        vec2 ndir = dir / max(d, 1e-5) / vec2(uAspect, 1.0);

        float warp = uStrength * potential(d);

        // per-channel displacement → chromatic lensing (dispersion grows with warp)
        float disp = warp * 0.10;
        vec2 oR = uv - ndir * disp * 1.00;
        vec2 oG = uv - ndir * disp * 0.86;
        vec2 oB = uv - ndir * disp * 0.72;

        vec3 col;
        col.r = texture2D(inputBuffer, oR).r;
        col.g = texture2D(inputBuffer, oG).g;
        col.b = texture2D(inputBuffer, oB).b;

        // crossing: soft unbounded radial light blooming from the focus
        float glow = potential(d) * uBright;
        col += vec3(0.85, 0.80, 1.0) * glow * 1.6;
        col = mix(col, vec3(1.0), uBright * smoothstep(0.0, 1.2, potential(d)));

        outputColor = vec4(col, inputColor.a);
      }
      `,
      {
        blendFunction: BlendFunction.NORMAL,
        uniforms: new Map<string, THREE.Uniform>([
          ["uStrength", new THREE.Uniform(0)],
          ["uBright", new THREE.Uniform(0)],
          ["uFocus", new THREE.Uniform(new THREE.Vector2(0.5, 0.5))],
          ["uAspect", new THREE.Uniform(1)],
        ]),
      }
    );
  }
  setPhase(p: Phases, intensity = 1) {
    // lensing builds across reveal→portal so space bends well before any
    // "arrival"; never a sudden on/off that would betray a shape. `intensity`
    // (<1 under reduced-motion) damps the whole space-bend so the scroll-driven
    // lensing stays gentle, not just the white-out below.
    (this.uniforms.get("uStrength") as THREE.Uniform).value =
      // Halved with the same reasoning as bloom above: `reveal` runs 0→1 across
      // the whole page, so anything it multiplies is a slow but total change in
      // how the field reads. Distortion still builds — just not enough to make
      // one section look like a different backdrop from its neighbour.
      (p.reveal * 0.12 + p.portal * 0.22) * intensity;
    // Cap + damp the white-out lift. At full scroll the focus sits over the
    // footer (CTAs + heading); a full white-out washed that text out — and this
    // pass runs even on mobile (bloom is gated, the lens is not). Keep it legible.
    (this.uniforms.get("uBright") as THREE.Uniform).value =
      p.whiteout * 0.6 * intensity;
  }
  setFocus(x: number, y: number) {
    (this.uniforms.get("uFocus") as THREE.Uniform).value.set(x, y);
  }
  setAspect(a: number) {
    (this.uniforms.get("uAspect") as THREE.Uniform).value = a;
  }
}

/**
 * Post-processing stack:
 *   1. Lens pass — gravitational space-bend + chromatic dispersion + crossing
 *      glow. This IS the portal: a distortion, never an object.
 *   2. Bloom + vignette pass — density-driven volumetric light (bright only
 *      where particles converge) and edge falloff.
 *
 * The lens samples the scene texture (UV transform), so it must live in its own
 * pass, separate from bloom's convolution.
 */
export class PostFX {
  readonly composer: EffectComposer;
  private readonly bloom?: BloomEffect;
  private readonly lens: LensEffect;
  /** 블룸의 기본 세기(티어에서 받습니다). setPhase의 가산이 이 값에 얹힙니다. */
  private readonly bloomBase: number;

  constructor(
    renderer: THREE.WebGLRenderer,
    scene: THREE.Scene,
    camera: THREE.Camera,
    useBloom: boolean,
    // 2026-09-17: crossing 변형은 등불의 흰 심만 블룸이 잡도록 임계값을 올립니다.
    // 기본값은 8월 필드의 값 그대로입니다.
    bloomThreshold = 0.28,
    // 2026-09-19 (세로 패리티 브리프 3.6): 블룸의 기본 세기. 티어가 넘기지 않으면 0.6,
    // 즉 지금까지의 값 그대로입니다. 폰 티어만 0.42를 넘깁니다. setPhase의 동적 가산도
    // 이 값을 기준으로 삼습니다(전에는 0.6이 두 곳에 박혀 있었습니다).
    bloomIntensity = 0.6
  ) {
    this.bloomBase = bloomIntensity;
    this.composer = new EffectComposer(renderer, {
      frameBufferType: THREE.HalfFloatType,
    });
    this.composer.addPass(new RenderPass(scene, camera));

    this.lens = new LensEffect();
    this.lens.setAspect(window.innerWidth / window.innerHeight);
    this.composer.addPass(new EffectPass(camera, this.lens));

    const second: Effect[] = [];
    if (useBloom) {
      this.bloom = new BloomEffect({
        intensity: bloomIntensity,
        luminanceThreshold: bloomThreshold,
        luminanceSmoothing: 0.95,
        mipmapBlur: true,
        radius: 0.7,
      });
      second.push(this.bloom);
    }
    // deeper vignette darkens the edges where text/cards sit → better contrast
    second.push(new VignetteEffect({ offset: 0.22, darkness: 0.9 }));
    this.composer.addPass(new EffectPass(camera, ...second));
  }

  /**
   * Drive effect intensity from the narrative phases. `intensity` (0..1) damps
   * the dynamic, flashier parts (portal/white-out) — passed as <1 under
   * reduced-motion so the journey stays calm. The base bloom is kept gentle and
   * the portal/white-out multipliers are well below the old blow-out levels so
   * text over the field stays readable.
   */
  setPhase(p: Phases, intensity = 1) {
    this.lens.setPhase(p, intensity * this.lensScale);
    if (this.bloom) {
      // bloom intensifies as particles converge / cross — volumetric light
      // emerging from density, not from a drawn glow
      // Clamped swing. portal maxes at 0.3 (see utils/phases), so the old 0.6
      // coefficient moved bloom 0.60 → 0.78 — a ~30% brightness change between
      // the top of the page and the FAQ/vision stretch, which read as the
      // background "turning on". 0.25 holds the same shape inside ±15%.
      this.bloom.intensity = this.bloomBase + (p.portal * 0.25 + p.whiteout * 1.0) * intensity;
    }
  }

  /**
   * 렌즈 왜곡의 배수. 1이면 지금까지와 같습니다(8월 field 변형).
   * DECIDED 2026-09-23 (사용자: "빛이 중간에 오면 두 개로 갈라짐"): 나루 홈(water 변형)은 0입니다.
   * 렌즈의 초점이 화면 한가운데에 고정돼 있고 세기가 8월 국면(reveal, portal)을 따라 페이지
   * 아래로 갈수록 커져서, 한가운데를 오목하게 당겨 어두운 구멍을 만들었습니다. 나루 점이 그
   * 자리를 지나가면 점 옆에 검은 점이 하나 더 붙어 빛이 둘로 갈라진 것처럼 보였습니다.
   * 블룸은 그대로입니다(파문의 밝기가 여기에 걸려 있습니다).
   */
  private lensScale = 1;
  setLensScale(s: number) {
    this.lensScale = s;
  }

  /** Focal point in UV (0..1) where the field converges — projected from world. */
  setFocus(x: number, y: number) {
    this.lens.setFocus(x, y);
  }

  setSize(w: number, h: number) {
    this.composer.setSize(w, h);
    this.lens.setAspect(w / h);
  }

  render(dt: number) {
    this.composer.render(dt);
  }

  dispose() {
    this.composer.dispose();
  }
}
