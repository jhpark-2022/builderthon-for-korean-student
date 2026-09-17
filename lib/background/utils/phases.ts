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
// "건너는 점들" (crossing) 변형의 국면. DECIDED 2026-09-17 (배경 브리프).
//
//   banks     기슭에서 느리게 떠다닙니다. 등불은 멀리 희미하게.   (히어로)
//   gather    기슭의 점들이 강가로 모입니다. 등불이 또렷해집니다. (8월의 기록)
//   crossing  강을 건넙니다. 트레일이 길어지고 블룸이 오릅니다.   (프로그램)
//   arrived   건너편에 닿아 등불 둘레의 성좌로 가라앉습니다.       (나루 이후)
//
// 경계는 상수가 아니라 챕터 앵커의 실제 스크롤 위치입니다(BackgroundScene이
// #record, #december, #naru의 offsetTop에서 읽어 넘깁니다). 페이지 길이가
// 바뀌어도 "프로그램에서 건넌다"가 유지됩니다.
// 8월의 portal과 whiteout은 쓰지 않습니다.
// ─────────────────────────────────────────────────────────────────────────────
export interface CrossingAnchors {
  /** #record, #december, #naru 시작점의 스크롤 비율 0..1 */
  record: number;
  december: number;
  naru: number;
}
export interface CrossingPhases {
  gather: number;
  crossing: number;
  arrived: number;
  /** 등불 쪽 인력의 세기. 흐름장이 읽습니다. */
  pull: number;
  scroll: number;
}
export function computeCrossingPhases(scroll: number, a: CrossingAnchors): CrossingPhases {
  const s = clamp(scroll, 0, 1);
  // 모이기는 8월의 기록에 들어서기 조금 전부터 프로그램 시작까지.
  const gather = ease(seg(s, Math.max(0, a.record - 0.02), a.december));
  // 건너기는 프로그램 챕터 전체. 입자마다 지연이 있어 실제 이동은 그 안에서 퍼집니다.
  const crossing = ease(seg(s, a.december, a.naru));
  // 닿기는 나루 챕터 첫머리에서 짧게.
  const arrived = ease(seg(s, Math.max(0, a.naru - 0.02), Math.min(1, a.naru + 0.1)));
  const pull = gather * 0.35 + crossing * 0.65;
  return { gather, crossing, arrived, pull, scroll: s };
}
/**
 * PostFX가 읽는 8월 국면 꼴로 옮깁니다. reveal 0(렌즈 왜곡 거의 없음), portal은
 * crossing의 0.3배(블룸이 건너는 동안 조금 오릅니다), whiteout 0.
 */
export function crossingToPhases(c: CrossingPhases): Phases {
  return { reveal: 0, portal: c.crossing * 0.3, pull: c.pull * 0.3, whiteout: 0, arrived: c.arrived, scroll: c.scroll };
}
