import * as THREE from "three";
import { FIELD, PALETTE, type QualityTier } from "../config";
import { PARTICLES_VERT } from "../shaders/particles.vert";
import { PARTICLES_FRAG } from "../shaders/particles.frag";
import { disposeMaterial } from "../utils/Disposable";

/**
 * The hero layer: a GPU-driven curl-noise flow field of soft glowing particles.
 *
 * Positions are advected entirely in the vertex shader (see particles.vert),
 * so the only per-frame CPU work is updating a handful of uniforms — zero
 * allocations in the render loop.
 */
export class ParticleField {
  readonly points: THREE.Points;
  private readonly geometry: THREE.BufferGeometry;
  private readonly material: THREE.ShaderMaterial;
  private readonly intensity: number; // device-tier energy/opacity scale

  constructor(quality: QualityTier, parallax: number) {
    const count = quality.particles;
    this.intensity = quality.intensity;

    const seeds = new Float32Array(count * 3);
    const scales = new Float32Array(count);
    const speeds = new Float32Array(count);
    const offsets = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // distribute through the volume; bias slightly toward centre depth
      seeds[i * 3 + 0] = (Math.random() * 2 - 1) * FIELD.bounds;
      seeds[i * 3 + 1] = (Math.random() * 2 - 1) * FIELD.bounds;
      seeds[i * 3 + 2] = (Math.random() * 2 - 1) * FIELD.depth;

      // varied size, opacity (via scale → glow), and velocity. Fewer + smaller
      // "leaders" so the field reads as fine cosmic dust, not big bokeh orbs.
      const tier = Math.random();
      scales[i] = tier < 0.93 ? 0.45 + Math.random() * 0.55 : 1.0 + Math.random() * 0.7;
      speeds[i] = 0.5 + Math.random() * 1.2;
      offsets[i] = Math.random() * 100;
    }

    this.geometry = new THREE.BufferGeometry();
    this.geometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 3));
    this.geometry.setAttribute("aScale", new THREE.BufferAttribute(scales, 1));
    this.geometry.setAttribute("aSpeed", new THREE.BufferAttribute(speeds, 1));
    this.geometry.setAttribute("aOffset", new THREE.BufferAttribute(offsets, 1));
    // dummy position attribute (shader ignores it but Three expects one)
    this.geometry.setAttribute("position", new THREE.BufferAttribute(seeds, 3));
    this.geometry.boundingSphere = new THREE.Sphere(
      new THREE.Vector3(),
      Math.hypot(FIELD.bounds, FIELD.bounds, FIELD.depth)
    );

    this.material = new THREE.ShaderMaterial({
      vertexShader: PARTICLES_VERT,
      fragmentShader: PARTICLES_FRAG,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uSpaceScale: { value: FIELD.spaceScale },
        uFlowSpeed: { value: FIELD.flowSpeed * parallax },
        uCurl: { value: FIELD.curl },
        uBounds: { value: new THREE.Vector3(FIELD.bounds, FIELD.bounds, FIELD.depth) },
        uPointer: { value: new THREE.Vector3() },
        uPointerRadius: { value: FIELD.pointerRadius },
        uPointerForce: { value: FIELD.pointerForce },
        uPixelRatio: { value: 1 },
        uScroll: { value: 0 },
        uReveal: { value: 0 },   // gravity presence 0..1
        uPull: { value: 0 },     // inward acceleration 0..1
        uPortal: { value: 0 },   // vortex organisation 0..1
        uWhiteout: { value: 0 }, // crossing 0..1
        uHole: { value: new THREE.Vector3(0, 0, -46) }, // portal centre (matches Portal.Z)
        // top-of-page palette (indigo-violet)
        uAccent: { value: new THREE.Color("#6366f1") },
        uHighlight: { value: new THREE.Color("#a855f7") },
        // bottom-of-page palette (fuchsia-pink) — blended by uScroll
        uAccent2: { value: new THREE.Color("#a855f7") },
        uHighlight2: { value: new THREE.Color("#e879f9") },
        uFog: { value: new THREE.Color(PALETTE.base2) },
        uOpacity: { value: 1 },
      },
    });

    this.points = new THREE.Points(this.geometry, this.material);
    this.points.frustumCulled = true;
  }

  setPixelRatio(pr: number) {
    this.material.uniforms.uPixelRatio.value = pr;
  }

  update(
    time: number,
    pointer: THREE.Vector3,
    scroll: number,
    motionScale: number,
    p: { reveal: number; pull: number; portal: number; whiteout: number }
  ) {
    const u = this.material.uniforms;
    u.uTime.value = time * motionScale;
    u.uPointer.value.copy(pointer);
    u.uScroll.value = scroll;
    u.uReveal.value = p.reveal;
    u.uPull.value = p.pull;
    u.uPortal.value = p.portal;
    u.uWhiteout.value = p.whiteout;

    // Scroll-aware calm: medium immersive at the hero, then fade the field well
    // down through the content-heavy sections, and quietest at the footer — so
    // text/cards stay readable and the lower page feels premium, not crowded.
    const ss = (a: number, b: number, x: number) => {
      const t = Math.min(Math.max((x - a) / (b - a), 0), 1);
      return t * t * (3 - 2 * t);
    };
    const HERO = 0.85, CONTENT = 0.4, FOOTER = 0.22;
    let op = HERO + (CONTENT - HERO) * ss(0.05, 0.32, scroll); // hero → content
    op += (FOOTER - op) * ss(0.72, 1.0, scroll);               // → footer
    u.uOpacity.value = op * this.intensity;
  }

  dispose() {
    this.geometry.dispose();
    disposeMaterial(this.material);
  }
}
