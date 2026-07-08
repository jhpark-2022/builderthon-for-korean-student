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
      (p.reveal * 0.22 + p.portal * 0.45) * intensity;
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

  constructor(
    renderer: THREE.WebGLRenderer,
    scene: THREE.Scene,
    camera: THREE.Camera,
    useBloom: boolean
  ) {
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
        intensity: 0.6,
        luminanceThreshold: 0.28,
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
    this.lens.setPhase(p, intensity);
    if (this.bloom) {
      // bloom intensifies as particles converge / cross — volumetric light
      // emerging from density, not from a drawn glow
      this.bloom.intensity = 0.6 + (p.portal * 0.6 + p.whiteout * 1.0) * intensity;
    }
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
