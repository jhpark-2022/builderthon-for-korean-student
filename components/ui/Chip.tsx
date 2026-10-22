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

//   outline   나루 홈의 Day 카드 칩(2026-09-18, 감사 반영 브리프 3.3). --border-2 외곽선에
//             흰 글자 /80. 8월 톤(호박·민트·분홍)은 홈에서 쓰지 않습니다.
//   plum      나루 홈의 "★ 제출" 칩. 자주 #9A5A82 하나만 색을 갖습니다.
// 2026-10-08 (사용자 승인, 브랜드 감사 14): 쓰는 곳이 없던 톤 다섯(rose, violet, emerald, time, plum)을 뺐습니다.
export type ChipTone = "neutral" | "amber" | "amberSoft" | "pending" | "outline";

export const CHIP: Record<ChipTone, string> = {
  // DECIDED 2026-10-22 (사용자: 10/19 피드백을 8월 페이지에도): 8월만 쓰는 네 모양은 알약과 amber를 걷은 글자입니다. outline(/naru)은 그대로.
  neutral: "text-[0.68rem] font-semibold text-white/60",
  amber: "inline-flex items-center gap-1 text-[0.68rem] font-bold text-white/85",
  amberSoft: "inline-flex items-center gap-1 text-[0.68rem] font-semibold text-white/70",
  pending: "inline-flex items-center gap-1 text-[0.68rem] font-bold text-white/70",
  outline: "inline-flex items-center gap-1 rounded-full border border-white/[0.12] bg-transparent px-2 py-0.5 text-[0.68rem] font-semibold text-white/80",
};

// 2026-10-20 (hwang 브리프 2.8): ChipDot(7px 장식 점)을 지웠습니다. 쓰던 곳은 홈 멘토링 상자 셋뿐이었습니다.

// DECIDED 2026-10-08 (사용자 승인, 브랜드 감사 12): size. "meta"는 글자 크기를 META(text-xs, 13.5px)로 올립니다.
// 그 전에는 홈이 <main class="naru-min12">의 속성 선택자와 !text-xs 덮어쓰기로 칩을 키웠고, 포털로 뜨는
// 자리(모달)에서는 12.24px으로 남았습니다. outline 톤(나루 홈 전용)은 기본이 meta입니다. 8월 페이지가 쓰는
// 나머지 톤은 기본이 "legacy"라 한 글자도 바뀌지 않습니다.
export type ChipSize = "legacy" | "meta";

export default function Chip({
  tone = "neutral",
  size,
  children,
  className = "",
}: {
  tone?: ChipTone;
  size?: ChipSize;
  children: ReactNode;
  className?: string;
}) {
  const resolved = size ?? (tone === "outline" ? "meta" : "legacy");
  const base = resolved === "meta" ? CHIP[tone].replace("text-[0.68rem]", "text-xs") : CHIP[tone];
  return <span className={`${base} ${className}`.trim()}>{children}</span>;
}
