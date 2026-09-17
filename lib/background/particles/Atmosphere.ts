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

  /**
   * crossing 변형의 하늘(2026-09-17). 8월 필드의 그라데이션은 아래가 base0, 위가
   * base2(남색 원색)라 위쪽이 밝습니다. 나루 홈에서는 위가 거의 검정이고 아래
   * (지평선·강 쪽)가 옅은 남색이어야 본문 뒤가 어둡습니다. 셰이더는 그대로 두고
   * 색만 바꿉니다. base는 아래, mid는 위입니다.
   */
  setPalette(base: string, mid: string, accent: string) {
    this.material.uniforms.uBase.value.set(base);
    this.material.uniforms.uMid.value.set(mid);
    this.material.uniforms.uAccent.value.set(accent);
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
