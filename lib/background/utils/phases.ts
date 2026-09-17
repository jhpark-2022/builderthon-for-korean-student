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

// ─────────────────────────────────────────────────────────────────────────────
// "건너는 점들" (crossing) 변형의 국면. DECIDED 2026-09-17 (배경 수정 브리프 1.5).
//
//   banks     히어로가 화면에 있는 동안. 형상 정지, 등불 켬.
//   gather    히어로 하단이 뷰포트 상단을 지나는 순간부터 0.4화면. 형상이 속부터
//             풀리고 가장자리가 마지막에 떠난다. 등불·반사는 0.6화면에 걸쳐 사라진다.
//   crossing  #record 본문 동안(#record 시작 → #december 중반). 점들이 깊이 층 안의
//             먼 점(화면 중심 뒤쪽)을 향해 흐른다.
//   arrived   #december 중반부터 0.6화면. 먼 점 둘레의 성좌로 가라앉는다.
//   calm      #naru부터(±0.5화면). 깊이 층의 드리프트 50%, 밝기 15%.
//
// 경계는 상수가 아니라 챕터 앵커의 실제 픽셀 위치입니다(BackgroundScene이 히어로
// 하단, #record, #december, #naru에서 읽어 넘깁니다). 8월의 portal과 whiteout은
// 쓰지 않습니다.
// ─────────────────────────────────────────────────────────────────────────────
export interface CrossingAnchors {
  /** 전부 문서 px(스크롤 0 기준). DECIDED 2026-09-17 (홈 흐름 재배치): banks = 히어로,
   *  gather = #december 시작, crossing = #december 본문 ~ #gains, arrived = #record부터. */
  heroEnd: number;
  crossStart: number;
  crossEnd: number;
  arrivedAt: number;
  naru: number;
}
export interface CrossingPhases {
  gather: number;
  crossing: number;
  arrived: number;
  /** 그룹 챕터의 잔잔함 0..1 */
  calm: number;
  /** 등불·반사 띠의 알파 1..0 */
  fade: number;
  /** 먼 점 쪽 인력의 세기. 흐름장이 읽습니다. */
  pull: number;
  scroll: number;
}
export function computeCrossingPhases(scrollY: number, vh: number, scroll: number, a: CrossingAnchors): CrossingPhases {
  const y = Math.max(0, scrollY);
  const gather = ease(seg(y, a.heroEnd, a.heroEnd + 0.4 * vh));
  const crossing = ease(seg(y, a.crossStart, a.crossEnd));
  const arrived = ease(seg(y, a.arrivedAt, a.arrivedAt + 0.6 * vh));
  const calm = ease(seg(y, a.naru - 0.5 * vh, a.naru + 0.5 * vh));
  const fade = 1 - ease(seg(y, a.heroEnd, a.heroEnd + 0.6 * vh));
  const pull = gather * 0.35 + crossing * 0.65;
  return { gather, crossing, arrived, calm, fade, pull, scroll: clamp(scroll, 0, 1) };
}
/**
 * PostFX가 읽는 8월 국면 꼴로 옮깁니다. reveal 0(렌즈 왜곡 거의 없음), portal은
 * crossing의 0.3배(블룸이 건너는 동안 조금 오릅니다), whiteout 0.
 */
export function crossingToPhases(c: CrossingPhases): Phases {
  return { reveal: 0, portal: c.crossing * 0.3, pull: c.pull * 0.3, whiteout: 0, arrived: c.arrived, scroll: c.scroll };
}
