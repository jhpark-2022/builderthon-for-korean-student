// ─────────────────────────────────────────────────────────────────────────────
// 버튼 3단. 8월 페이지의 히어로 CTA가 쓰던 클래스를 한 곳에 (2026-09-17, 8월 문법
// 브리프).
//
//   primary    단색 블루 필.
//   secondary  유령 필(얇은 테두리, 옅은 면).
//   text       "→" 텍스트 링크.
//
// DECIDED 2026-10-26: 두 톤은 크기와 동작을 유지하고 공통 블루 UI 색을 씁니다.
//
// 이 파일은 클래스 문자열만 냅니다. 마크업은 부르는 쪽이 갖습니다(a, Link, button,
// OpenChatLink가 각자 다른 속성을 가지기 때문입니다).
// ─────────────────────────────────────────────────────────────────────────────
export type ButtonVariant = "primary" | "secondary" | "text";
export type ButtonTone = "naru" | "zero100";

const PRIMARY: Record<ButtonTone, string> = {
  // 8월 페이지의 크기와 들림 동작은 유지합니다.
  zero100:
    "group inline-flex items-center gap-2 rounded-full bg-action hover:bg-action-hover px-5 py-2.5 text-sm font-bold text-naru-ink transition hover:-translate-y-0.5 sm:px-7 sm:py-3 sm:text-base",
  // 2026-10-26: 나루 주요 버튼은 7:3 블루 그라데이션(globals.css .bg-accent-gradient, #4F68F5 → #3550DC)에 흰 글자, 호버 shimmer. 8월 버튼(zero100)은 뉴트럴 밝은 면.
  naru:
    "group inline-flex min-h-[44px] items-center justify-center gap-2 cta-shimmer rounded-full bg-accent-gradient hover:brightness-110 px-[22px] py-[10px] text-center text-sm font-bold leading-snug text-[#fff] transition-[background-color,transform] duration-150 active:scale-[0.98] max-sm:w-full sm:px-[30px] sm:text-base",
};

// Journey.tsx 히어로 보조 CTA의 문자열 그대로. 톤이 없습니다(무채색).
// DECIDED 2026-10-20 (사용자, hwang 브리프 3.3, 시각 브리프 3.5~3.6): naru 주 버튼과 보조 버튼의 호버 들림(-translate-y)을 걷고 눌림만 둡니다.
// 폰에서 누르는 동안 반응이 없고, 떼면 :hover가 남아 들린 채 굳었습니다. hover 규칙은 tailwind.config의 hoverOnlyWhenSupported로
// (hover: hover) 안에서만 섭니다. zero100 주 버튼은 8월 페이지 것이라 그대로입니다.
const SECONDARY =
  "inline-flex items-center gap-2 rounded-full border border-white/20 bg-naru-surface px-5 py-2.5 text-sm font-semibold text-naru-text transition active:translate-y-0 active:scale-[0.98] active:duration-75 hover:bg-naru-surface-2 sm:px-7 sm:py-3 sm:text-base";

// DECIDED 2026-10-21: 나루 버튼 높이는 실제 px 기준으로 맞추고 8월 팔레트와 기하는 보존합니다.
// DECIDED 2026-10-26 (사용자: "버튼들 세로가 너무 긴 경우"): 나루 버튼 56/52px → 44px(위아래 10px), 8월 버튼 위아래 12/16 → 10/12px.
const NARU_SECONDARY =
  "group inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full border border-white/20 bg-naru-surface px-[22px] py-[10px] text-center text-sm font-semibold leading-snug text-naru-text transition-[background-color,transform] duration-150 active:scale-[0.98] hover:bg-naru-surface-2 sm:px-[30px] sm:text-base";

const TEXT =
  "inline-flex min-h-[44px] items-center gap-1.5 text-sm sm:text-base font-medium text-naru-text underline-offset-4 transition-colors duration-150 active:text-white hover:text-white hover:underline";

export function buttonClass(variant: ButtonVariant, tone: ButtonTone = "naru"): string {
  if (variant === "primary") return PRIMARY[tone];
  if (variant === "secondary") return tone === "naru" ? NARU_SECONDARY : SECONDARY;
  return TEXT;
}

/** 주 CTA 끝의 화살표. hover에서 오른쪽으로 한 칸. 8월 히어로와 같은 값. */
export const ARROW_CLASS = "transition-transform duration-150 motion-safe:group-hover:translate-x-1";
