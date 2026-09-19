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
  /**
   * 블룸의 기본 세기. 비우면 PostFX의 기본값(0.6)입니다.
   * 2026-09-19 (세로 패리티 브리프 3.6): 폰에서만 0.42. 블룸을 켜되 데스크톱과 같은
   * 세기로 두지는 않습니다. 해와 물비늘의 번짐은 살리고, 본문 뒤가 밝아지는 것은 막습니다.
   */
  bloomIntensity?: number;
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
  // 2026-09-19 (세로 패리티 브리프 3.5·3.6): 블룸을 켜고(해와 물비늘의 번짐이 전부
  // 사라지고 있었습니다) 형상 밝기 배수를 0.6 → 0.85로 올립니다. 3.4에서 올린 밝기가
  // 여기서 반이 깎이고 있었어요. **particles(900)와 dprMax(1.35)는 올리지 마세요.**
  // 성능이 걸리는 자리는 이 둘이지 블룸이 아닙니다.
  if (coarse || w < 768 || mem <= 4) {
    return { particles: 900, dprMax: 1.35, bloom: true, intensity: 0.85, bloomIntensity: 0.42 };
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
  bloomThreshold: 0.9,           // 등불의 흰 심만 넘습니다. 형상 점(hi0 휘도 ≈ 0.65, 파도 +30%까지 0.85)은 못 넘습니다. 형상은 선명해야 합니다.
  bandHeight: 0.14,              // 반사 띠의 높이(뷰포트 비율). 브리프 12~15%
  // 앵커를 못 읽었을 때의 국면 경계(문서 px). 실제 값은 BackgroundScene이 히어로
  // 하단, #record, #december, #naru의 offsetTop에서 읽습니다.
  fallbackAnchors: { heroEnd: 900, crossStart: 1000, crossEnd: 4200, arrivedAt: 5000, naru: 6500 },
  // 건너는 점들의 목적지(2026-09-17 수정 브리프 1.3): 화면 y가 아니라 깊이 층 안의
  // 먼 점. z 뒤쪽, 화면 중심 근처. 건너간 점들은 여기 둘레에서 성좌가 됩니다.
  // z −18: 처음 −35로 두니 안개(vDepth)에 묻혀 건너는 점이 보이지 않았습니다(실측).
  far: { x: 0, y: 2, z: -18 },
  // 깊이 층(1.4): 8월 필드를 밀도 35%(점 예산에서), 밝기 25%로. 그룹 챕터에서는
  // 드리프트 50%, 밝기 15%.
  depthBright: 0.4,       // 형상이 없는 동안 0.25 → 0.4(2026-09-17). 배경이 이 층뿐입니다.
  depthCalmBright: 0.6,   // 0.25 × 0.6 = 0.15
  depthCalmSpeed: 0.5,
  depthDollyZ: 6,         // 스크롤에 따라 z 6 단위
} as const;

/**
 * 기슭 형상의 그리기 (2026-09-17, 배경 수정 브리프). 자리는 utils/shapeLayout.ts가
 * 무대(DOM)에서 정하고, 여기는 점의 크기·밝기와 점 예산만.
 *
 * 정면(기울기 0°). 가장자리 점은 2.8px·밝기 1.0·hi0, 속 점은 1.4px·밝기 0.35·accent1.
 * 가장자리를 따라 밝기의 파도가 12초에 한 바퀴(±30%). 먼지가 아니라 살아 있는 선.
 * 점 예산: 데스크톱 티어(2,800)에서 형상 둘에 1,800(각 900), 나머지는 깊이 층.
 * 폰(900)은 형상 600(각 300), 깊이 층 300.
 */
const SHAPES_ENABLED = false;
export const SHAPES = {
  // DECIDED 2026-09-17 (사용자): 형상을 걷었습니다. 히어로 오른쪽 단은 행사 사진 넷.
  // false면 crossing 변형은 깊이 층만 그립니다(등불·반사 띠도 없음). 형상 코드는
  // 그대로 두어 true로 되돌리면 다시 섭니다.
  enabled: false,
  edgePx: 2.8,
  innerPx: 1.4,
  edgeBright: 1.0,
  innerBright: 0.35,
  wavePeriod: 12,     // 초
  waveAmp: 0.3,
  breath: 0.3,        // 숨 진폭: crossing 브리프 값의 30%
  shapePoints: (tier: number): number => {
    if (!SHAPES_ENABLED) return 0;
    return tier <= 900 ? 600 : Math.min(1800, tier - Math.round(tier * 0.35));
  },
} as const;

/**
 * 서울 워터마크 (2026-09-18, 사용자: "scroll 하면 서울의 모습이 나왔으면").
 * water 변형(밤의 강과 등불) 위에 얹는 입자 층 하나. 히어로에서는 없고, 히어로가 화면에서
 * 나가면(강이 가라앉는 구간) 서울특별시 경계(lib/background/shapes/seoul.ts)가 뷰포트
 * 가운데에 점으로 떠오릅니다. 그 뒤로는 본문 뒤에 희미하게 서 있습니다(카드가 가립니다).
 * 밝기는 워터마크 값(가장자리 0.45, 속 0.15). 정면, 카메라에 붙어 있어 돌리·패럴랙스가
 * 없습니다(형상이 커지거나 기울지 않습니다).
 */
export const SEOUL_WATERMARK = {
  cx: 0.5,
  cy: 0.5,
  // 2026-09-19 (사용자: "서울의 모습이 데스크톱에서 잘 안 보인다. 모바일은 잘 보인다"):
  // 0.58 → 0.52. 구운 점은 1,990개가 전부라(shapes/seoul.ts) 데스크톱에서는 그 점들이
  // 830px 폭에 흩어져 한 점 간격이 폰의 두 배였습니다. 폭을 줄이면 같은 점으로 선이
  // 촘촘해집니다. 폰의 0.72는 건드리지 않습니다.
  landscapeW: 0.52,   // 뷰포트 너비 대비
  portraitW: 0.98,
  // 2026-09-18 사용자: "너무 희미하게 보임". 0.45 → 0.6 → 1.0. 속 점도 0.15 → 0.4.
  edgeBright: 1.0,
  innerBright: 0.4,
  edgePx: 3.2,        // 수정 브리프의 2.8보다 한 단 굵게
  innerPx: 1.6,
  // 2026-09-19 (사용자: 데스크톱에서 서울이 잘 안 보임): 가로 화면 전용 점 크기.
  // 같은 3.2px이라도 폰에서는 폭 281px짜리 형상 위의 3.2px이고 데스크톱에서는 750px짜리
  // 위의 3.2px입니다. 화면에 차지하는 비율이 2.7배 차이가 나서, 폰에서는 선으로 읽히는
  // 것이 데스크톱에서는 먼지로 읽혔습니다. 세로 화면은 위의 값을 그대로 씁니다.
  edgePxLandscape: 4.2,
  innerPxLandscape: 2.0,
  revealVh: 0.8,      // 히어로 하단이 뷰포트 상단을 지난 뒤 이만큼(뷰포트 높이 배)에 걸쳐 떠오름
  // 2026-09-19 (세로 패리티 브리프 3.4): 폰 500 → 1100. 점은 2.8배 적은데 면적은 넓어
  // 단위 면적당 잉크가 데스크톱의 6분의 1이었습니다. 그래서 윤곽이 서울로 읽히지 않고
  // 먼지로 읽혔어요.
  // desktop 1400 → 1990. 구운 파일에 있는 점 전부입니다(SEOUL_POINTS는 1,990점).
  // 폰의 1100은 그 앞부분이라 그대로입니다. 순서가 "가장자리 75% · 속 25%"를 어느
  // 접두사에서도 유지하게 섞여 있어, 개수를 늘려도 비율은 같습니다.
  points: { phone: 1100, desktop: 1990 },
  calmBright: 0.6,    // #naru부터 이 배수로
  // 세로 화면. 2026-09-19 (사용자)부터 **순서는 가로와 같습니다**: 히어로에서는 보이지
  // 않고, 히어로가 나가면 revealVh에 걸쳐 떠오르고, #naru부터 어두워집니다.
  //
  // 2026-09-19 (세로 패리티 브리프 3.4): 폭이 1.10 → 0.90이라 양옆이 화면 밖으로 잘렸고,
  // 남은 점이 무엇의 일부인지 알 수 없었습니다. 가로(0.58)보다 조금만 넓은 0.72로 고정
  // 합니다. 폰은 화면이 좁아 같은 비율이면 실제 크기가 작아지기 때문입니다.
  //
  // heroW와 naruW를 **같은 값**으로 둔 것이 요점입니다. 전에는 스크롤하면서 형상이
  // 1.10에서 0.90으로 줄어들었는데, 가로 화면에는 그런 움직임이 없습니다. 폭이 고정되면
  // BackgroundScene의 세로 분기가 가로와 같은 모양이 됩니다.
  //
  // 밝기도 가로와 같은 값으로 올립니다(1.0 → 0.6). dissolveVh는 쓰이지 않습니다
  // (9/18의 "히어로에서 풀린다"가 사라지면서). 키는 되살릴 때를 위해 둡니다.
  portrait: { heroW: 0.72, heroCy: 0.5, heroBright: 1.0, dissolveVh: 0.4, naruW: 0.72, naruCy: 0.5, naruBright: 0.6 },

} as const;
