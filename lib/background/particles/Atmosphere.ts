import * as THREE from "three";
import { PALETTE } from "../config";
import { ATMO_VERT, ATMO_FRAG } from "../shaders/atmosphere";
import { disposeMaterial } from "../utils/Disposable";

/**
 * Background depth layer: a large plane locked behind the particle field
 * rendering a slow drifting nebula gradient. Gives volumetric depth and a
 * radial vignette that focuses attention on the hero content.
 *
 * Sits far on -Z and is scaled generously so it never crops on any aspect.
 */
export class Atmosphere {
  readonly mesh: THREE.Mesh;
  private readonly geometry: THREE.PlaneGeometry;
  private readonly material: THREE.ShaderMaterial;

  constructor() {
    this.geometry = new THREE.PlaneGeometry(2, 2);
    this.material = new THREE.ShaderMaterial({
      vertexShader: ATMO_VERT,
      fragmentShader: ATMO_FRAG,
      depthWrite: false,
      depthTest: false,
      uniforms: {
        uTime: { value: 0 },
        uScroll: { value: 0 },
        uBase: { value: new THREE.Color(PALETTE.base0) },
        uMid: { value: new THREE.Color(PALETTE.base2) },
        uAccent: { value: new THREE.Color(PALETTE.accent0) },
        uReveal: { value: 0 },
      },
    });
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.frustumCulled = false;
    this.mesh.renderOrder = -1;
    this.resize();
  }

  /** Park the plane far behind everything and scale to cover the frustum. */
  resize() {
    // Big enough to always fill the view; sits deep on -Z.
    const z = -60;
    this.mesh.position.set(0, 0, z);
    // cover both ultrawide and portrait generously
    const s = 180;
    this.mesh.scale.set(s * Math.max(1, window.innerWidth / window.innerHeight), s, 1);
  }

  update(time: number, scroll: number, reveal: number) {
    this.material.uniforms.uTime.value = time;
    this.material.uniforms.uScroll.value = scroll;
    this.material.uniforms.uReveal.value = reveal;
  }

  dispose() {
    this.geometry.dispose();
    disposeMaterial(this.material);
  }
}
