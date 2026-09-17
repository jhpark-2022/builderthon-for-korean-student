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

/**
 * "건너는 점들" (crossing) 변형의 상수. DECIDED 2026-09-17 (배경 브리프).
 *
 * 월드 좌표는 8월 필드와 같은 카메라(z=30, fov 60)를 기준으로 합니다. z=0 평면에서
 * 화면 반폭이 약 27.7(1440×900)이라, 가운데 40%가 강(±11)이고 양옆 30%씩이
 * 기슭(11~26)입니다. 등불은 강 건너편(z 먼 쪽) 가운데 조금 왼쪽입니다. 가운데에
 * 두면 반사 기둥이 헤드라인과 CTA 뒤를 세로로 지나갑니다(shaders/water.ts의
 * 등불 자리 주석과 같은 이유).
 */
export const CROSSING = {
  riverHalf: 11,                 // 강의 반폭(월드, z=0 기준)
  bankSigmaY: 11,                // 기슭 입자의 세로 분포(가우시안 표준편차)
  bankCenterY: -2,               // 그 중심. 지평선(등불 y) 조금 위
  lantern: { x: 4, y: -15, z: -40 },   // 가로 화면. 세로 화면은 BackgroundScene.placeLantern이 x를 -15로
  lanternSize: 7,                // 스프라이트 한 변(월드)
  bloomThreshold: 0.7,           // 등불의 흰 심만 넘습니다. 입자(hi0 휘도 ≈ 0.65)는 못 넘습니다.
  bandHeight: 0.14,              // 반사 띠의 높이(뷰포트 비율). 브리프 12~15%
  // 앵커를 못 읽었을 때의 국면 경계(스크롤 비율). 실제 값은 BackgroundScene이
  // #record, #december, #naru의 offsetTop에서 읽습니다.
  fallbackAnchors: { record: 0.06, december: 0.2, naru: 0.55 },
} as const;

/**
 * 기슭 형상의 배치 (2026-09-17, 배경 형상 브리프). 뷰포트 비율(0..1, 위가 0)입니다.
 * BackgroundScene.placeShapes가 카메라(z=30, fov 60/75)를 기준으로 월드 좌표로
 * 바꿔 셰이더에 넘깁니다. 라벨(components/home/NaruHome.tsx)도 같은 값을 읽습니다.
 *
 * tilt 18°: 지도가 탁자 위에 놓인 것처럼 x축으로 눕힙니다. 3° 포인터 패럴랙스에서
 * 입체가 살면서도 위에서 본 윤곽으로 읽힙니다. 25°를 넘기면 서울이 납작해집니다.
 *
 * dim: 히어로 카피(왼쪽 단)와 카운트다운 패널(오른쪽 단) 뒤에서는 입자 밝기를
 * 40%로 눌러 글자 대비를 지킵니다. 사각형은 [x0, y0, x1, y1], y는 아래가 0
 * (셰이더의 ndc 기준).
 */
export const SHAPES = {
  tiltDeg: 18,
  dimFactor: 0.4,
  thickness: 0.15, // 형상 너비 대비 z 두께(±)
  landscape: {
    left: { x: 0.22, y: 0.55 },
    right: { x: 0.78, y: 0.55 },
    width: 0.24,      // 뷰포트 너비 대비 형상 너비
    dimA: [0.03, 0.18, 0.47, 0.85],
    dimB: [0.60, 0.33, 0.95, 0.69],
  },
  // DECIDED 2026-09-17: 세로 화면의 싱가포르는 0.44(브리프 0.35). 0.35에서는 형상이
  // H1 영역(y 120~330px, 390 폭)까지 올라와 그 영역의 캔버스 휘도가 형상 이전
  // (0.0037)보다 높아졌습니다(0.0044. 0.42에서도 0.0038). 0.44면 형상의 위 가장자리가
  // 329px이라 영역 밖입니다. 서울은 브리프대로 0.70. 폰 히어로는 y 690px 근처에서
  // 다음 챕터가 시작해 더 내리면 형상과 라벨이 칩에 닿습니다.
  portrait: {
    left: { x: 0.5, y: 0.44 },
    right: { x: 0.5, y: 0.70 },
    width: 0.55,
    dimA: [0.0, 0.28, 1.0, 0.92],
    dimB: [0.0, 0.0, 0.0, 0.0],
  },
} as const;
