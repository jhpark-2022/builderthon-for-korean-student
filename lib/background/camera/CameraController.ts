import * as THREE from "three";
import { MOTION } from "../config";
import { damp, degToRad } from "../utils/math";

/**
 * Cinematic camera:
 *  - perpetual gentle breathing + idle drift
 *  - tiny pointer-driven rotation (capped at MOTION.pointerInfluenceDeg)
 *  - scroll-driven travel: dollies through the field, drifts vertically, and
 *    adds a subtle roll, so scrolling feels like flying deeper into the world.
 * All motion is frame-rate-independent damped — alive, never abrupt.
 */
export class CameraController {
  readonly camera: THREE.PerspectiveCamera;

  private targetYaw = 0;
  private targetPitch = 0;
  private yaw = 0;
  private pitch = 0;

  // smoothed scroll progress (0..1)
  private scroll = 0;

  private reduced = false;

  constructor() {
    this.camera = new THREE.PerspectiveCamera(60, 1, 0.1, 200);
    this.camera.position.set(0, 0, 30);
    this.resize();
  }

  setReducedMotion(reduced: boolean) {
    this.reduced = reduced;
  }

  /** Pointer in normalized device coords (-1..1). Drives a few degrees of rotation. */
  setPointer(nx: number, ny: number) {
    if (this.reduced) return;
    const max = degToRad(MOTION.pointerInfluenceDeg);
    this.targetYaw = -nx * max;
    this.targetPitch = ny * max;
  }

  /** elapsed: total seconds; dt: delta seconds; scrollTarget: 0..1 page scroll. */
  update(elapsed: number, dt: number, scrollTarget: number) {
    // ease scroll toward its target so flicks feel smooth, not snappy (inertia)
    this.scroll = damp(this.scroll, scrollTarget, MOTION.scrollLambda, dt);
    // ease-in curve: gentle early, accelerating pull as we near the portal
    const s = Math.pow(this.scroll, MOTION.scrollEasePower);

    // ── positional: scroll travel + idle breathing/drift ──
    const breathe = this.reduced
      ? 0
      : Math.sin(elapsed * MOTION.breatheSpeed) * MOTION.breatheAmplitude;
    const driftX = this.reduced ? 0 : Math.sin(elapsed * MOTION.driftSpeed) * 0.8;
    const driftY = this.reduced ? 0 : Math.cos(elapsed * MOTION.driftSpeed * 0.8) * 0.5;

    // Under reduced-motion, nearly freeze the scroll-driven camera travel so
    // scrolling no longer flies through the field (idle drift/roll are already 0).
    const scrollTravel = this.reduced ? 0.15 : 1;

    // dolly forward (decreasing z) as we scroll down — flying into the field
    this.camera.position.z = 30 + breathe - s * MOTION.scrollDollyZ * scrollTravel;
    this.camera.position.x = driftX;
    this.camera.position.y = driftY + s * MOTION.scrollDriftY * scrollTravel;

    // ── rotational: pointer + a gentle scroll roll ──
    this.yaw = damp(this.yaw, this.targetYaw, 4, dt);
    this.pitch = damp(this.pitch, this.targetPitch, 4, dt);
    const roll = this.reduced ? 0 : degToRad(MOTION.scrollRollDeg) * s;
    this.camera.rotation.set(this.pitch, this.yaw, roll);
  }

  resize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    const portrait = window.innerHeight > window.innerWidth;
    this.camera.fov = portrait ? 75 : 60;
    this.camera.updateProjectionMatrix();
  }
}
