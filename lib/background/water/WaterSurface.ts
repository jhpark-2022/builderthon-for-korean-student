import * as THREE from "three";
import { WATER_VERT, WATER_FRAG } from "../shaders/water";
import { disposeMaterial } from "../utils/Disposable";

/**
 * 나루터 수면 레이어. 전체 화면을 덮는 사각형 하나입니다.
 *
 * Atmosphere와 같은 방식으로 카메라 앞에 평면을 세우고 depthTest를 끕니다.
 * 다른 점은 이 레이어가 하늘까지 함께 그린다는 것입니다. 지평선 위아래가 한
 * 셰이더 안에 있어야 지평선이 선이 아니라 전환으로 만들어지고, 등불의 빛이
 * 하늘과 물에 같은 좌표로 얹힙니다.
 *
 * 그래서 이 레이어를 쓸 때는 Atmosphere도 ParticleField도 쓰지 않습니다.
 * 배경 전체가 이 하나입니다.
 *
 * 브랜드 색은 셰이더가 아니라 여기에서 주입합니다. 로고 가이드 v1의 4색이
 * 정본이고(lib/background/config.ts의 PALETTE), 값을 고칠 일이 생기면
 * 셰이더가 아니라 이 파일을 보면 됩니다.
 */
export class WaterSurface {
  readonly mesh: THREE.Mesh;
  private readonly geometry: THREE.PlaneGeometry;
  private readonly material: THREE.ShaderMaterial;

  constructor() {
    this.geometry = new THREE.PlaneGeometry(2, 2);
    this.material = new THREE.ShaderMaterial({
      vertexShader: WATER_VERT,
      fragmentShader: WATER_FRAG,
      depthWrite: false,
      depthTest: false,
      uniforms: {
        uTime: { value: 0 },
        uScroll: { value: 0 },
        uAspect: { value: 1 },
        uPointer: { value: new THREE.Vector2(0.5, 0.5) },
        uPointerOn: { value: 0 },
        // 밤하늘 꼭대기. 남색보다 더 어둡게 떨어뜨립니다.
        uSkyTop: { value: new THREE.Color("#03050F") },
        // 지평선의 남색. 로고 가이드의 #12246B를 그대로 쓰면 화면 가운데가
        // 너무 밝아져 본문이 앉을 자리가 없습니다. 같은 색상환에서 명도만
        // 내린 값입니다(227.9도 유지).
        uSkyHorizon: { value: new THREE.Color("#0B1540") },
        // 가까운 물. 거의 검정입니다.
        uDeep: { value: new THREE.Color("#04060F") },
        // 물비늘. 자주 #9A5A82의 밝은 쪽.
        uGlint: { value: new THREE.Color("#C79BB4") },
        // 등불. 주황 원색 그대로입니다. 화면에서 주황은 이것 하나뿐이라
        // 여기서만 원색을 씁니다.
        uLamp: { value: new THREE.Color("#EE8A4F") },
      },
    });
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.frustumCulled = false;
    this.mesh.renderOrder = -1;
    this.resize();
  }

  /**
   * 프러스텀을 거의 정확히 덮습니다.
   *
   * Atmosphere처럼 넉넉히(1.6배) 키우면 안 됩니다. 저쪽은 부드러운 그라데이션
   * 이라 UV가 화면과 얼마나 어긋나든 상관없지만, 이 셰이더는 지평선을 화면의
   * 특정 높이에 놓아야 합니다. 평면이 프러스텀보다 크면 보이는 UV 창이 가운데로
   * 좁아지고, 지평선이 계산한 자리에서 위로 밀립니다.
   *
   * 여유 12%는 두 가지를 위한 것입니다. 포인터가 만드는 카메라 회전(최대 3도,
   * 이 거리에서 약 4.7 단위)과 카메라 브리딩. 스크롤 달리는 카메라를 평면 쪽으로
   * 당기기만 하므로(z 30 → 6) 거리가 줄고 덮는 면적은 오히려 늘어납니다.
   */
  resize() {
    const z = -60;
    this.mesh.position.set(0, 0, z);
    const w = window.innerWidth;
    const h = window.innerHeight;
    const portrait = h > w;
    // CameraController.resize가 세로 화면에서 FOV를 75로 올립니다. 같이 따라가지
    // 않으면 폰에서 평면이 프러스텀보다 작아져 가장자리에 클리어 컬러가 보입니다.
    const fov = portrait ? 75 : 60;
    const dist = 90; // 카메라 z=30, 평면 z=-60
    const vh = 2 * dist * Math.tan((fov * Math.PI) / 360);
    const margin = 1.12;
    // PlaneGeometry(2,2)라 scale은 원하는 크기의 절반입니다.
    this.mesh.scale.set((vh * (w / h) * margin) / 2, (vh * margin) / 2, 1);
    this.material.uniforms.uAspect.value = w / h;
  }

  /**
   * @param time  필드 자체 시간. 벽시계가 아닙니다. 모션 민감 설정에서 이 값이
   *              더 이상 늘지 않아 수면이 그 자리에 얼어붙습니다.
   * @param pointer  화면 uv (0..1). y는 위가 1입니다.
   * @param on  포인터가 화면 안에 있는가. 터치 기기에서는 0으로 둡니다.
   */
  update(time: number, scroll: number, pointer: THREE.Vector2, on: number) {
    const u = this.material.uniforms;
    u.uTime.value = time;
    u.uScroll.value = scroll;
    u.uPointer.value.copy(pointer);
    u.uPointerOn.value = on;
  }

  dispose() {
    this.geometry.dispose();
    disposeMaterial(this.material);
  }
}
