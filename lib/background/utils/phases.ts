import { clamp } from "./math";

/**
 * Narrative scroll phases for the gravitational-portal journey.
 *
 *   0.00–0.20  drift        — stable universe, faint hint in the distance
 *   0.20–0.40  field        — gravity forms, particles curve, light lensing
 *   0.40–0.60  push         — camera pushes in, trails, parallax, momentum
 *   0.60–0.80  portal       — luminous vortex, spiral inflow, space warps
 *   0.80–0.95  pull         — accelerate, trails stretch, brightening
 *   0.95–1.00  cross        — through the centre, white-out, new dimension
 */
export interface Phases {
  /** 0..1 overall reveal of the gravitational presence (eases up from 0.1). */
  reveal: number;
  /** 0..1 portal luminosity / vortex organisation. */
  portal: number;
  /** 0..1 inward pull / acceleration strength. */
  pull: number;
  /** 0..1 white-out crossing (only the final 5%). */
  whiteout: number;
  /** 0..1 "arrived" — brighter, hopeful post-transition environment. */
  arrived: number;
  /** raw scroll passthrough */
  scroll: number;
}

const seg = (s: number, a: number, b: number) => clamp((s - a) / (b - a), 0, 1);
// smoothstep easing
const ease = (t: number) => t * t * (3 - 2 * t);

export function computePhases(scroll: number): Phases {
  const s = clamp(scroll, 0, 1);

  // gravity becomes perceptible from ~12% and is fully present by 60%
  const reveal = ease(seg(s, 0.12, 0.6));
  // Portal/pull kept very low: a faint gravitational drift, NOT a vortex that
  // converges particles into a dense bright ring at the bottom of the page.
  const portal = ease(seg(s, 0.55, 0.85)) * 0.3;
  const pull = ease(seg(s, 0.4, 0.95)) * 0.3;
  // No white-out crossing. It turned the footer field bright white and boosted
  // particle alpha, overriding the calm opacity fade — the "game portal" look.
  const whiteout = 0;
  // arrived environment fades up right at the very end
  const arrived = ease(seg(s, 0.97, 1.0));

  return { reveal, portal, pull, whiteout, arrived, scroll: s };
}
