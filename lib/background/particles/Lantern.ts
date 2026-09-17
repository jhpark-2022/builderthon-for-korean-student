import * as THREE from "three";
import { CROSSING, PALETTE } from "../config";
import { disposeMaterial } from "../utils/Disposable";

/**
 * 등불 한 점. "건너는 점들"(crossing) 변형의 목적지입니다.
 *
 * DECIDED 2026-09-17 (배경 브리프): 스프라이트 하나입니다. 점광(PointLight)은
 * 입자 셰이더가 조명을 읽지 않아 화면에 아무것도 남기지 않고, 지오메트리 구는
 * "테두리가 있는 물체"가 됩니다(8월 필드가 포털을 물체로 그리지 않은 이유와
 * 같습니다). 스프라이트에 방사 그라데이션을 구워 두면 블룸이 없는 폰에서도
 * 스스로 빛나고, 블룸이 있는 데스크톱에서는 가운데의 흰 심이 임계값을 넘어
 * 이 점만 뜨겁게 잡힙니다.
 *
 * 화면에서 주황은 이 점과 수면의 반사 기둥뿐입니다(9/15 원칙). 입자는 주황이
 * 되지 않습니다(particles.frag의 crossingFrag).
 */
export class Lantern {
  readonly sprite: THREE.Sprite;
  private readonly material: THREE.SpriteMaterial;
  private readonly texture: THREE.CanvasTexture;

  constructor() {
    const size = 128;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    // 흰 심 → 주황 → 투명. 심이 흰 이유는 블룸 임계값(config.CROSSING.bloomThreshold)을
    // 넘어야 하기 때문입니다. 주황 원색의 휘도는 임계값 아래라 심이 없으면
    // 블룸이 잡지 않습니다.
    g.addColorStop(0.0, "rgba(255,236,214,1)");
    g.addColorStop(0.12, "rgba(255,190,140,0.95)");
    g.addColorStop(0.3, "rgba(238,138,79,0.55)");
    g.addColorStop(0.6, "rgba(238,138,79,0.12)");
    g.addColorStop(1.0, "rgba(238,138,79,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    this.texture = new THREE.CanvasTexture(canvas);
    this.texture.colorSpace = THREE.SRGBColorSpace;

    this.material = new THREE.SpriteMaterial({
      map: this.texture,
      color: new THREE.Color(PALETTE.hi1),
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
    });
    this.sprite = new THREE.Sprite(this.material);
    this.sprite.position.set(CROSSING.lantern.x, CROSSING.lantern.y, CROSSING.lantern.z);
    this.sprite.scale.set(CROSSING.lanternSize, CROSSING.lanternSize, 1);
    this.sprite.renderOrder = 1;
  }

  /**
   * @param time  필드 자체 시간(멈추면 같이 멈춥니다).
   * @param gather  국면 0..1. 기슭에서 강가로 모이는 동안 등불이 또렷해집니다.
   * @param arrived 국면 0..1. 닿은 뒤에는 조금 더 밝고 조금 더 큽니다.
   */
  setPosition(x: number, y: number, z: number) {
    this.sprite.position.set(x, y, z);
  }

  update(time: number, gather: number, arrived: number) {
    // 아주 느린 숨. 움직임이 아니라 살아 있다는 표시 정도입니다. 진폭 4%.
    const breathe = 1 + Math.sin(time * 0.9) * 0.04;
    const s = CROSSING.lanternSize * breathe;
    this.sprite.scale.set(s, s, 1);
    // 모이는 동안 또렷해지고, 닿은 뒤에는 오히려 한 단 가라앉습니다. 그 구간의
    // 본문(코어 판 두 장)이 등불 위에 앉기 때문입니다(브리프 6, 대비).
    this.material.opacity = 0.5 + gather * 0.4 - arrived * 0.3;
  }

  dispose() {
    this.texture.dispose();
    disposeMaterial(this.material);
  }
}
