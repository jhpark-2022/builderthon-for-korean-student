import { Fragment } from "react";

// MOVED HERE 2026-09-17 (8월 문법 브리프). components/journey/Journey.tsx에서
// 정의만 옮겼습니다. 마크업과 클래스는 한 글자도 바뀌지 않았고, 8월 페이지는
// 같은 파일을 import 합니다. 나루 홈이 같은 문법을 쓰기 위해서입니다.

// ─────────────────────────────────────────────────────────────────────────────
// FLOW STRIP — a row of boxes joined by arrows (참여 플로우, 최종 아웃풋).
//
// The arrows used to live INSIDE each box's own flex row: [box →][box →][box].
// Horizontally that looks right, but stacked on a phone it puts the arrow beside
// the box instead of between boxes — and because the arrow takes width, the two
// boxes that carry one end up narrower than the third. Boxes in a column that
// don't share a width read as a rendering bug, which is what this was.
//
// So the children are FLAT: [box, arrow, box, arrow, box]. In a column every box
// is full width and each arrow is its own centred row; in a row from `sm` the
// same elements line up horizontally with the arrows between them, exactly as
// before. One glyph, rotated 90° on phones — a second glyph conditionally
// rendered would be two things to keep in step for no gain.
// ─────────────────────────────────────────────────────────────────────────────
export default function FlowStrip<T>({
  items,
  render,
  align = "stretch",
  className = "",
}: {
  items: readonly T[];
  render: (item: T, i: number) => React.ReactNode;
  // "stretch" = boxes in a row match the tallest (the output cards carry two
  // lines of copy); "center" = single-line pills that shouldn't grow.
  align?: "stretch" | "center";
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-2 sm:flex-row ${align === "center" ? "sm:items-center" : "sm:items-stretch"} ${className}`}>
      {items.map((item, i) => (
        <Fragment key={i}>
          <div className="w-full sm:flex-1">{render(item, i)}</div>
          {i < items.length - 1 && (
            <span aria-hidden className="shrink-0 self-center rotate-90 leading-none text-white/30 sm:rotate-0">
              →
            </span>
          )}
        </Fragment>
      ))}
    </div>
  );
}
