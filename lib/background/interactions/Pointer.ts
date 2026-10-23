import * as THREE from "three";
import { damp } from "../utils/math";

/**
 * Tracks the pointer and projects it onto the particle plane (z = 0) in world
 * space, so the shader can apply a magnetic displacement around it. Smoothed so
 * the influence feels fluid, not jittery. Handles mouse, touch, wheel.
 */
export class Pointer {
  /** Normalized device coords (-1..1), for the camera. */
  readonly ndc = new THREE.Vector2(0, 0);
  /** Smoothed world-space position on the z=0 plane, for the particle field. */
  readonly world = new THREE.Vector3(0, 0, 0);

  private targetWorld = new THREE.Vector3(0, 0, 0);
  private readonly raycaster = new THREE.Raycaster();
  private readonly plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  private readonly hit = new THREE.Vector3();
  private active = false;
  /** 마지막 움직임이 마우스(또는 펜)였는가. 손가락은 스크롤이라 커서로 치지 않습니다(2026-10-22). */
  mouse = typeof window !== "undefined" && window.matchMedia?.("(hover: hover) and (pointer: fine)").matches === true;
  /**
   * 커서 자리를 한 번이라도 알았는가. DECIDED 2026-10-22 (사용자: "가끔 빛이 커서를 안 따라오고 클릭하면 온다.
   * 무조건 이 효과가 있게"). 전에는 창이 포커스를 잃으면(blur) 꺼졌고, 다음 pointermove가 와야 다시 켜졌습니다.
   * 트랙패드로 스크롤하는 동안에는 브라우저가 pointermove를 거의 보내지 않아 그 사이 빛이 멈췄습니다.
   * 이제 끄지 않고 마지막 자리를 그대로 둡니다. 휠(트랙패드 스크롤)과 누름도 커서 자리를 알려 줍니다.
   */
  get inside() { return this.active; }
  /** 마지막으로 커서 자리를 받은 시각(performance.now). /naru는 이 값으로 커서가 쉬는지 봅니다(2026-10-23). */
  lastMoveAt = 0;

  private setFrom(x: number, y: number, type: string) {
    const nx = (x / window.innerWidth) * 2 - 1;
    const ny = -((y / window.innerHeight) * 2 - 1);
    this.ndc.set(nx, ny);
    this.active = true;
    this.mouse = type === "mouse" || type === "pen";
    this.lastMoveAt = performance.now();
  }
  private onMove = (e: PointerEvent) => this.setFrom(e.clientX, e.clientY, e.pointerType);
  // 휠은 마우스와 트랙패드에서만 옵니다. 스크롤 중에도 커서 자리를 실어 옵니다.
  private onWheel = (e: WheelEvent) => this.setFrom(e.clientX, e.clientY, "mouse");

  attach() {
    window.addEventListener("pointermove", this.onMove, { passive: true });
    window.addEventListener("pointerdown", this.onMove, { passive: true });
    window.addEventListener("wheel", this.onWheel, { passive: true });
  }

  detach() {
    window.removeEventListener("pointermove", this.onMove);
    window.removeEventListener("pointerdown", this.onMove);
    window.removeEventListener("wheel", this.onWheel);
  }

  /** Project current NDC onto the z=0 plane using the live camera. */
  update(camera: THREE.Camera, dt: number) {
    if (this.active) {
      this.raycaster.setFromCamera(this.ndc, camera);
      if (this.raycaster.ray.intersectPlane(this.plane, this.hit)) {
        this.targetWorld.copy(this.hit);
      }
    }
    // smooth toward target so the magnetic pull feels organic
    this.world.x = damp(this.world.x, this.targetWorld.x, 5, dt);
    this.world.y = damp(this.world.y, this.targetWorld.y, 5, dt);
    this.world.z = damp(this.world.z, this.targetWorld.z, 5, dt);
  }
}
