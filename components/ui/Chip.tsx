// ─────────────────────────────────────────────────────────────────────────────
// 칩. 8월 페이지의 DayModeBadge·멘토링 칩·시간 칩이 쓰던 클래스 문자열을 한 곳에
// 모은 것입니다 (2026-09-17, 8월 문법 브리프).
//
// 톤의 뜻은 8월 페이지가 정한 그대로입니다. 색마다 뜻이 하나씩이라, 새 뜻에 있는
// 색을 빌려 쓰지 마세요.
//   neutral   참여 방식(온라인 등). 테두리 얇고 글자 회색.
//   amber     "가야 할 곳이 있다"(현장). 점이 붙습니다. 상(어워드)도 앰버.
//   amberSoft 현장 반나절(mixed). 앰버를 한 단 낮춘 것.
//   pending   미정. 점선 테두리.
//   rose      의무(필참·필수 제출). ★가 붙습니다.
//   violet    "놓치면 아까운"(스포트라이트).
//   emerald   얻는 것(멘토링·혜택). 점이 붙습니다.
//   time      시간 창. 무채색 한 단 위(굵고 밝게).
//
// DayModeBadge(Journey.tsx)는 이 컴포넌트를 씁니다. 클래스는 옮기기 전과 한 글자도
// 다르지 않아야 합니다(8월 페이지 픽셀 회귀 0이 조건).
// ─────────────────────────────────────────────────────────────────────────────
import type { ReactNode } from "react";

export type ChipTone = "neutral" | "amber" | "amberSoft" | "pending" | "rose" | "violet" | "emerald" | "time";

export const CHIP: Record<ChipTone, string> = {
  neutral: "rounded-full border border-white/[0.12] bg-white/[0.04] px-2 py-0.5 text-[0.68rem] font-semibold text-white/60",
  amber: "inline-flex items-center gap-1 rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 text-[0.68rem] font-bold text-amber-200",
  amberSoft: "inline-flex items-center gap-1 rounded-full border border-amber-400/20 bg-amber-400/[0.06] px-2 py-0.5 text-[0.68rem] font-semibold text-amber-100/80",
  pending: "inline-flex items-center gap-1 rounded-full border border-dashed border-amber-400/30 bg-amber-400/[0.06] px-2 py-0.5 text-[0.68rem] font-bold text-amber-200/90",
  rose: "inline-flex items-center gap-1 rounded-full border border-rose-400/30 bg-rose-400/10 px-2 py-0.5 text-[0.68rem] font-bold text-rose-200",
  violet: "inline-flex items-center gap-1 rounded-full border border-violet-400/30 bg-violet-400/10 px-2 py-0.5 text-[0.68rem] font-bold text-violet-200",
  emerald: "inline-flex items-center gap-1.5 rounded-full border border-emerald-400/25 bg-emerald-400/[0.08] px-2 py-0.5 text-[0.68rem] font-semibold text-emerald-100/90",
  time: "shrink-0 rounded-full border border-white/20 bg-white/10 px-2.5 py-0.5 text-[0.72rem] font-bold text-white/90",
};

/** 7px 점. 8월 노선도의 멘토링 마커와 같은 크기입니다. 크기가 다르면 같은 것으로 안 읽힙니다. */
export function ChipDot({ className = "bg-emerald-400/80" }: { className?: string }) {
  return <span aria-hidden className={`h-[7px] w-[7px] shrink-0 rounded-full ${className}`} />;
}

export default function Chip({
  tone = "neutral",
  children,
  className = "",
}: {
  tone?: ChipTone;
  children: ReactNode;
  className?: string;
}) {
  return <span className={`${CHIP[tone]} ${className}`.trim()}>{children}</span>;
}
