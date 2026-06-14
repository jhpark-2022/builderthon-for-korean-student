/** Small math helpers — no allocations in hot paths. */

export const clamp = (v: number, min: number, max: number) =>
  v < min ? min : v > max ? max : v;

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Frame-rate-independent damping toward a target (Freya Holmér style). */
export const damp = (current: number, target: number, lambda: number, dt: number) =>
  lerp(current, target, 1 - Math.exp(-lambda * dt));

export const degToRad = (d: number) => (d * Math.PI) / 180;
