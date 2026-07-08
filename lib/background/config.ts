/**
 * Central configuration for the interactive background.
 *
 * "The invisible infrastructure of intelligence" — a violet flow-field of
 * GPU-driven particles drifting through volumetric depth. All tunable constants
 * live here so the scene reads from a single source of truth.
 */

export const PALETTE = {
  // Base (background / fog)
  base0: "#050505",
  base1: "#09090b",
  base2: "#0f172a",
  // Accent (mid-tone particle body)
  accent0: "#7c3aed",
  accent1: "#8b5cf6",
  accent2: "#a855f7",
  // Highlight (hot core / fresnel)
  hi0: "#c084fc",
  hi1: "#e879f9",
} as const;

/** Responsive particle budget. Picked at init from viewport + device tier. */
export interface QualityTier {
  particles: number;
  dprMax: number;
  bloom: boolean;
  /** Global field energy/opacity scale (lower = calmer). Mobile is quietest. */
  intensity: number;
}

/**
 * Adaptive quality. We don't trust raw width alone — combine viewport area with
 * a coarse device-memory / pointer heuristic so phones don't melt and ultrawide
 * desktops stay rich.
 */
export function pickQuality(): QualityTier {
  if (typeof window === "undefined") {
    return { particles: 2600, dprMax: 2, bloom: true, intensity: 0.9 };
  }

  const w = window.innerWidth;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  // navigator.deviceMemory is non-standard but widely supported on Chrome/Android
  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;

  // Mobile / low memory — leanest particle budget, tight DPR cap, and the lowest
  // intensity so the background is quietest on phones (bloom already off here).
  if (coarse || w < 768 || mem <= 4) {
    return { particles: 900, dprMax: 1.35, bloom: false, intensity: 0.6 };
  }
  // Laptops
  if (w < 1680) {
    return { particles: 2800, dprMax: 1.75, bloom: true, intensity: 0.85 };
  }
  // Desktop / ultrawide
  return { particles: 4000, dprMax: 2, bloom: true, intensity: 1.0 };
}

/** Camera + motion feel. */
export const MOTION = {
  cameraLerp: 0.045,          // how fast camera eases to target
  pointerInfluenceDeg: 3,     // max camera rotation from pointer (spec: 3–5°)
  breatheAmplitude: 0.22,     // gentle z breathing (calmer)
  breatheSpeed: 0.16,
  driftSpeed: 0.04,

  // scroll-driven camera travel (0 = top of page, 1 = bottom)
  // Shallow dolly: the camera drifts forward but deliberately STAYS OUT of the
  // dense core (no plunge to the portal plane) so content-heavy lower sections
  // keep a sparse, distant, premium field instead of big foreground bokeh.
  scrollDollyZ: 24,           // 30 - 24 = 6, well short of the core/portal
  scrollDriftY: -1.2,         // gentle vertical drift across the scroll
  scrollRollDeg: 5,           // subtle roll only (was a cinematic 14°)
  scrollLambda: 2.4,          // inertia — camera feels carried, never snaps
  scrollEasePower: 2.2,       // ease-in: slow start, accelerating pull near the end
} as const;

/** Flow-field / particle dynamics. */
export const FIELD = {
  spaceScale: 0.045,          // noise sample frequency
  flowSpeed: 0.011,           // base drift speed along the field (slower = calmer)
  curl: 0.65,                 // curl-noise strength (gentler swirl)
  pointerRadius: 2.4,         // world-space radius of pointer influence
  pointerForce: 1.6,          // magnetic displacement strength
  bounds: 26,                 // half-extent of the particle volume (X/Y)
  depth: 34,                  // half-extent along Z
} as const;
