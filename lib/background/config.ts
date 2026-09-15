/**
 * Central configuration for the interactive background.
 *
 * "The invisible infrastructure of intelligence" — a flow-field of GPU-driven
 * particles drifting through volumetric depth. All tunable constants live here
 * so the scene reads from a single source of truth.
 */

// ── DECIDED 2026-09-15 (나루 런칭): 필드를 나루 팔레트로 옮깁니다 ───────────
// 8월의 필드는 일렉트릭 바이올렛에서 마젠타로 타올랐습니다. 나루의 기준색은
// 남색이고, 로고의 그라데이션은 왼쪽 위 남색에서 오른쪽 아래 주황으로 흐릅니다.
// 이 필드가 그 흐름을 공간으로 옮긴 것입니다: 안개는 남색, 입자의 몸통은 보라에서
// 자주로, 가장 뜨거운 심만 주황.
//
// hi1이 주황인 것이 이 팔레트의 요점입니다. 로고 한가운데 찍힌 주황 점 하나가
// 나루 자리이고, 화면에서 주황은 그 점만큼만 있어야 합니다. 셰이더에서 hi1은
// 가장 밝은 소수의 입자에만 닿으므로, 넓은 남색 위에 드문드문 찍히는 점이 됩니다.
// 여기 있는 어느 값이든 주황 쪽으로 더 밀지 마세요. 밀면 면이 되고, 면이 되면
// 로고의 점이 더 이상 눈에 띄지 않습니다.
export const PALETTE = {
  // Base (background / fog)
  base0: "#03050F",
  base1: "#070B1F",
  base2: "#12246B",
  // Accent (mid-tone particle body)
  accent0: "#4B3A8C",
  accent1: "#6B4E9E",
  accent2: "#9A5A82",
  // Highlight (hot core / fresnel)
  hi0: "#C79BB4",
  hi1: "#EE8A4F",
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
