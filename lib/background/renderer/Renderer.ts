import * as THREE from "three";
import type { QualityTier } from "../config";

/**
 * Thin wrapper around WebGLRenderer with adaptive DPR and clean resize/dispose.
 * Keeps renderer concerns out of the scene class.
 */
export class Renderer {
  readonly gl: THREE.WebGLRenderer;
  private readonly canvas: HTMLCanvasElement;
  private readonly dprMax: number;

  constructor(canvas: HTMLCanvasElement, quality: QualityTier) {
    this.canvas = canvas;
    this.dprMax = quality.dprMax;

    // Let Three acquire and own the context — its internal creation/fallback
    // logic is the most robust path across drivers. (Pre-acquiring a context and
    // passing it in triggers driver-specific crashes on some headless/software
    // GL stacks.) A genuine failure throws here and is caught upstream → CSS
    // fallback. The earlier "reading 'precision'" crash came from a leaked
    // probe-canvas context, which we no longer create.
    this.gl = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
      stencil: false,
      depth: true,
    });
    this.gl.setClearColor(0x050505, 1);
    this.gl.outputColorSpace = THREE.SRGBColorSpace;
    this.gl.toneMapping = THREE.ACESFilmicToneMapping;
    this.gl.toneMappingExposure = 1.05;
    this.resize();
  }

  /** Clamp DPR to the device tier so phones don't over-render. */
  get pixelRatio(): number {
    return Math.min(window.devicePixelRatio || 1, this.dprMax);
  }

  resize(): void {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.gl.setPixelRatio(this.pixelRatio);
    this.gl.setSize(w, h, false);
  }

  render(scene: THREE.Scene, camera: THREE.Camera): void {
    this.gl.render(scene, camera);
  }

  dispose(): void {
    // dispose() frees all GPU resources (programs, buffers, textures). We do NOT
    // call forceContextLoss() here: the <canvas> element persists across React
    // StrictMode remounts, and force-losing its context permanently prevents the
    // next mount from acquiring a new one (→ "reading 'precision'" crash).
    this.gl.dispose();
  }
}
