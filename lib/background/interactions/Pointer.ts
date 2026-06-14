import * as THREE from "three";
import { damp } from "../utils/math";

/**
 * Tracks the pointer and projects it onto the particle plane (z = 0) in world
 * space, so the shader can apply a magnetic displacement around it. Smoothed so
 * the influence feels fluid, not jittery. Handles mouse + touch + leave.
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

  private onMove = (e: PointerEvent) => {
    const nx = (e.clientX / window.innerWidth) * 2 - 1;
    const ny = -((e.clientY / window.innerHeight) * 2 - 1);
    this.ndc.set(nx, ny);
    this.active = true;
  };
  private onLeave = () => {
    this.active = false;
    this.targetWorld.set(0, 0, 0); // drift influence back to centre/off
  };

  attach() {
    window.addEventListener("pointermove", this.onMove, { passive: true });
    window.addEventListener("pointerleave", this.onLeave);
    window.addEventListener("blur", this.onLeave);
  }

  detach() {
    window.removeEventListener("pointermove", this.onMove);
    window.removeEventListener("pointerleave", this.onLeave);
    window.removeEventListener("blur", this.onLeave);
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
