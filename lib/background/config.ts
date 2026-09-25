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
  // 2026-09-23 (서울 존재감 브리프 2.2): 0.3 → 0.12. ±30%는 밝기에 여유가 있을 때
  // "살아 있는 선"이지만, 기준 밝기가 보일까 말까 한 자리면 파도의 골에서 점이
  // 사라집니다. 스크롤을 고정해 놓고 잰 열 프레임 중 두 프레임에서만 서울이
  // 읽혔습니다. 파도는 남기되 골이 바닥에 닿지 않게 합니다(particles.vert.ts의 0.8 바닥).
  waveAmp: 0.12,
  breath: 0.3,        // 숨 진폭: crossing 브리프 값의 30%
  shapePoints: (tier: number): number => {
    if (!SHAPES_ENABLED) return 0;
    return tier <= 900 ? 600 : Math.min(1800, tier - Math.round(tier * 0.35));
  },
} as const;

/**
 * 파문의 위상 (2026-09-19, 파문 위상 브리프). 셰이더가 uTime × (0.5 + uFlow × 1.6)으로
 * 계산하던 것을 BackgroundScene이 적분합니다. 곱셈이면 uFlow가 바뀔 때마다 지나간
 * 시간 전체가 곱해져 위상이 점프했습니다(실측: 페이지를 100초 본 뒤 300px 튕김 한 번에
 * 16.7rad = 2.7파장이 한 프레임에).
 *
 * baseRate·flowGain은 지금 셰이더의 0.5·1.6 그대로입니다. 정지 상태와 데스크톱의
 * 느낌은 바뀌지 않습니다. maxRate는 폰의 관성 스크롤(uFlow ≈ 1)에서만 걸립니다.
 * 1.6rad/s면 파문 하나에 3.9초. 데스크톱의 휠(uFlow ≤ 0.3, 0.98rad/s)에는 닿지 않습니다.
 */
/**
 * 싱가포르 구간의 빛(나루 점). DECIDED 2026-09-23 (사용자: "빛 속도가 너무 빨라서 천천히. 커버하는
 * 면적 때문이면 면적을 줄이면 됨", 싱가포르 빛 속도 브리프).
 *
 * LIGHT_SWEEP: 점이 가로로 도는 폭(화면 폭 대비, 한쪽). 0.22/0.28 → 0.12/0.15. 이동 거리가
 * 화면 폭의 0.48배(폰 0.60배)로 줄고 같은 스크롤에 속도도 절반이 됩니다. 싱가포르 반폭
 * (가로 0.33, 세로 0.40) 안쪽이라 점은 여전히 섬 위에 있습니다.
 *
 * LIGHT_MAX_RATE: 구간 4 진행도(0..1)의 초당 변화 상한. 지수 감쇠(초당 35%)만으로는 바닥까지
 * 플릭했을 때 점이 1초에 화면 폭의 70%를 갔습니다. 0.05/s면 한 바퀴에 20초 이상이고, 점의
 * 최고 속도가 데스크톱 약 80px/s, 폰 약 28px/s를 넘지 않습니다.
 * 더 느리게는 0.03(한 바퀴 33초), 더 좁게는 0.08/0.10까지가 브리프가 적은 범위입니다.
 */
// portrait 값은 2026-09-24부터 쓰지 않습니다(세로 화면은 아래 LIGHT_PORTRAIT). 되돌릴 때를 위해 둡니다.
export const LIGHT_SWEEP = { landscape: 0.12, portrait: 0.15 } as const;
export const LIGHT_MAX_RATE = 0.05;

/**
 * 세로 화면(폰)의 빛. DECIDED 2026-09-24 (사용자: "mobile view에서는 빛이 너무 안 움직임", 폰 빛
 * 움직임 브리프). 실측: 폰에서 한 바퀴가 5.2화면, 폭 60px이라 읽는 속도에서 점이 초당 약 3px
 * 움직였습니다. 화면 폭 대비 비율은 데스크톱과 같았지만 60px은 손가락 한 마디라 멈춰 보였습니다.
 * 가로 화면(LIGHT_SWEEP.landscape, LIGHT_MAX_RATE)과 값을 나눕니다. 가로 화면은 그대로입니다.
 */
export const LIGHT_PORTRAIT = {
  sweep: 0.26,    // 한쪽 폭(화면 폭 대비). 390px에서 약 100px. 싱가포르 세로 반폭 0.40 안쪽.
  // DECIDED 2026-09-24 (사용자): 2.6 → 2.0. 폰에서 약 2.6바퀴, 같은 스크롤에 점이 1.3배 움직입니다.
  lapVh: 2.0,     // 한 바퀴에 필요한 스크롤(화면 높이 배). 문서 끝이 아니라 고정 길이입니다.
  maxRate: 0.07,  // 초당 바퀴 수 상한. 점의 최고 속도가 약 45px/s.
} as const;

export const RING = {
  baseRate: 0.5,
  flowGain: 1.6,
  maxRate: 1.6,
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
  // DECIDED 2026-09-23 (서울 존재감 브리프 2.4): 서울은 윤곽선이 길어 같은 1,990점으로도
  // 싱가포르보다 성깁니다. 두 형상이 같은 점 크기를 쓰던 것을 형상별로 나눕니다.
  // 위 edgePx / edgePxLandscape는 이제 싱가포르 값이고, 지금 화면에서 잘 읽히므로 그대로입니다.
  // 건너는 동안 morph로 보간합니다(BackgroundScene). 점 개수는 늘리지 않습니다.
  edgePxLandscapeSeoul: 5.0,   // 싱가포르는 4.2 그대로
  edgePxSeoul: 3.8,            // 폰. 싱가포르는 3.2 그대로
  // 2026-09-19 (세로 패리티 브리프 3.4): 폰 500 → 1100. 점은 2.8배 적은데 면적은 넓어
  // 단위 면적당 잉크가 데스크톱의 6분의 1이었습니다. 그래서 윤곽이 서울로 읽히지 않고
  // 먼지로 읽혔어요.
  // desktop 1400 → 1990. 구운 파일에 있는 점 전부입니다(SEOUL_POINTS는 1,990점).
  // 폰의 1100은 그 앞부분이라 그대로입니다. 순서가 "가장자리 75% · 속 25%"를 어느
  // 접두사에서도 유지하게 섞여 있어, 개수를 늘려도 비율은 같습니다.
  points: { phone: 1100, desktop: 1990 },
  // calmBright는 2026-09-23부터 stages.singaporeBright입니다(이름과 값).
  // ── 서울 → 싱가포르 (2026-09-19, 서울→싱가포르 브리프 2.4) ──────────────────
  // 싱가포르 본섬의 폭. 서울(0.52)보다 넓게 둡니다. 싱가포르는 납작해서
  // (높이/너비 0.511, 서울 0.820) 같은 폭이면 작아 보입니다.
  // 2026-09-19: 실제 해안선에서 다시 구우면서 비율이 0.455 → 0.511이 됐지만
  // 값은 프리뷰와 실제 화면으로 판단해 그대로 둡니다.
  singaporeW: 0.66,
  // revealVh, morph는 2026-09-23부터 아래 stages에 있습니다.
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
  // singaporeW: 세로 화면의 싱가포르 폭. 가로(0.66)보다 넓게. 폰은 화면이 좁아
  // 같은 비율이면 실제 크기가 작아지기 때문입니다(서울의 0.72와 같은 이유).
  // 2026-09-23 (챕터 지도 브리프 3.1): naruW, naruCy, naruBright를 지웠습니다. 세로 분기가
  // 더는 calm으로 크기·자리·밝기를 옮기지 않습니다. 구간 4의 밝기는 stages.singaporeBright.
  portrait: { heroW: 0.72, heroCy: 0.5, heroBright: 1.0, dissolveVh: 0.4, singaporeW: 0.80 },

  // ── 구간 지도 (DECIDED 2026-09-23, 챕터 지도 브리프) ─────────────────────
  // 앵커는 BackgroundScene.readAnchors가 읽습니다: #top 하단, #naru, #join.
  // 카피가 늘어도 챕터를 따라갑니다. 각 구간이 어느 챕터 위에 놓이는지는
  // 브리프(docs/background-chapter-map-brief.md) 2장의 표에 있고, 그 표가 이 값들의 이유입니다.
  stages: {
    // 구간 1: 해가 내려가 점이 됩니다. #top 하단부터 이만큼(뷰포트 높이 배).
    // 전에는 #gains 상단까지였고, 그러면 #december 전체가 해가 지는 장면이었습니다.
    // 뷰포트 배수라 데스크톱과 폰이 같은 길이로 봅니다(전에는 3.7화면 대 5.5화면).
    descendVh: 1.2,
    // 구간 2: 서울. 구간 1 끝에서 이만큼에 걸쳐 떠오른 뒤, 건너기 시작까지 섭니다.
    revealVh: 0.6,
    // 구간 3: 서울 → 싱가포르. #naru 위쪽 startVh 앞에서 시작해 spanVh 동안.
    // DECIDED 2026-09-26 (사용자: #gains와 #naru 사이 이음매에서 서울이 아니라 싱가포르가
    // 보여야 함): { startVh: 0.5, spanVh: 1.5 } → { 1.2, 1.0 }.
    // DECIDED 2026-09-26 2차 (사용자: "여기서 shape이 바뀌면 안 되고, 여기 오기 전에 바뀌어
    // 있어야 함", #gains 마지막 행이 보이는 자리): { 1.2, 1.0 } → { 1.8, 0.8 }. 끝이 #naru
    // 상단 0.2화면 앞이면, 가장자리 점이 마지막에 떠나는 탓(particles.vert의 mlead, 윤곽 점은
    // uMorph 0.25~0.55부터 출발)에 이음매가 화면에 있는 동안 윤곽이 아직 흘러가고 있었습니다.
    // 이제 #naru 상단이 화면 아래 끝에 닿을 때(naruTop − 1.0화면) 건너기가 끝납니다. 화면
    // 높이와 상관없이 이음매가 보이기 전에 싱가포르입니다. 건너기는 #december 끝과 #gains 위쪽.
    // 대가: 서울이 설 자리(warnShortSeoul, 기준 1.6화면)가 키 큰 데스크톱에서 모자랍니다.
    // 1920×1080 1.21, 1440×1100 1.15화면(개발 빌드에서 경고가 뜹니다). 1440×900 1.88,
    // 1000×646 3.64, 폰 3.8화면. 사용자 요구가 우선이라 알고 둔 값입니다. 길이를 1.0에서
    // 0.8로 줄인 것은 서울 자리를 조금이라도 남기려는 것입니다.
    morph: { startVh: 1.8, spanVh: 0.8 },
    // 구간 4: 싱가포르의 밝기. 건너기가 끝난 뒤 1vh에 걸쳐 이 값으로 내려갑니다.
    // #naru와 #record 본문이 그 위에 놓이므로 온전한 1.0이 아니라 0.8.
    // 본문 대비(브리프 5.3의 7)를 통과하지 못하면 이전 값 0.6으로 되돌립니다.
    singaporeBright: 0.8,
    // 구간 5: 형상을 거둡니다. #join 상단 startVh 앞에서 시작해 spanVh 동안 0으로.
    // 세 곳(싱가포르, 한국, 그 밖)을 말하는 챕터 뒤에 싱가포르 하나만 서 있으면
    // 셋 중 하나를 편드는 그림이 됩니다. 나루 점만 남깁니다.
    // #join의 제목을 읽을 때 형상이 비어 있도록 챕터보다 조금 앞에서 시작합니다.
    dissolve: { startVh: 0.6, spanVh: 0.8 },
  },

} as const;
