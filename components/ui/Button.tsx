// ─────────────────────────────────────────────────────────────────────────────
// 버튼 3단. 8월 페이지의 히어로 CTA가 쓰던 클래스를 한 곳에 (2026-09-17, 8월 문법
// 브리프).
//
//   primary    그라데이션 필 + 발광 그림자. 페이지에 하나.
//   secondary  유령 필(얇은 테두리, 옅은 면).
//   text       "→" 텍스트 링크.
//
// 톤은 둘입니다. zero100은 8월 페이지의 보라·인디고(#7c3aed 계열)이고 그쪽 페이지가
// 그대로 씁니다. naru는 나루 토큰(보라 → 자주)이고 발광도 보라 계열입니다.
// 8월 페이지에 naru 톤을, 나루 홈에 zero100 톤을 쓰지 마세요. 팔레트가 갈립니다.
//
// 이 파일은 클래스 문자열만 냅니다. 마크업은 부르는 쪽이 갖습니다(a, Link, button,
// OpenChatLink가 각자 다른 속성을 가지기 때문입니다).
// ─────────────────────────────────────────────────────────────────────────────
export type ButtonVariant = "primary" | "secondary" | "text";
export type ButtonTone = "naru" | "zero100";

const PRIMARY: Record<ButtonTone, string> = {
  // Journey.tsx 히어로 주 CTA의 문자열 그대로.
  zero100:
    "group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-[0_8px_40px_rgba(124,58,237,0.5)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_50px_rgba(124,58,237,0.7)] sm:px-8 sm:py-4 sm:text-base",
  // 같은 기하, 나루 토큰. 보라(#4B3A8C) → 자주(#9A5A82). 발광은 보라.
  // 글자는 흰색입니다: 보라 위 흰 글자 7.2:1, 자주 위 4.9:1 (실측 2026-09-17).
  naru:
    "group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-naru-purple to-naru-plum px-5 py-3 text-sm font-bold text-white shadow-[0_8px_40px_rgba(75,58,140,0.55)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_50px_rgba(75,58,140,0.75)] sm:px-8 sm:py-4 sm:text-base",
};

// Journey.tsx 히어로 보조 CTA의 문자열 그대로. 톤이 없습니다(무채색).
const SECONDARY =
  "inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 py-3 text-sm font-semibold text-white/85 transition hover:-translate-y-0.5 hover:bg-white/10 sm:px-8 sm:py-4 sm:text-base";

const TEXT =
  "inline-flex items-center gap-1.5 text-sm font-medium text-white/75 underline-offset-4 transition hover:text-white hover:underline";

export function buttonClass(variant: ButtonVariant, tone: ButtonTone = "naru"): string {
  if (variant === "primary") return PRIMARY[tone];
  if (variant === "secondary") return SECONDARY;
  return TEXT;
}

/** 주 CTA 끝의 화살표. hover에서 오른쪽으로 한 칸. 8월 히어로와 같은 값. */
export const ARROW_CLASS = "transition-transform duration-300 group-hover:translate-x-1";
