"use client";

import type { ReactNode } from "react";

// A full-viewport-height scroll chapter. Content fades/rises in when it enters
// the viewport, so the copy reveals as the camera arrives at each waypoint.
export default function Chapter({
  id,
  children,
  align = "center",
  className = "",
  background,
  footer,
  wide = false,
  labelledBy,
  contentSized = false,
}: {
  id?: string;
  children: ReactNode;
  align?: "left" | "center" | "right";
  className?: string;
  // When true the content spans the full viewport width (no centred max-w-6xl
  // rail, no side padding) so children can hug the left/right screen edges.
  // Used by the hero's two-up layout.
  wide?: boolean;
  // optional full-bleed layer rendered behind the content rail (e.g. a hero
  // video). It positions itself absolutely; the rail sits above it via z-10.
  background?: ReactNode;
  // optional element pinned to the very bottom of the section (e.g. a scroll
  // hint). It sits at the section's bottom edge regardless of how tall the
  // centred content is, so it never pushes the content up.
  footer?: ReactNode;
  /**
   * 이 챕터의 제목 요소 id (2026-09-19, 접근성 감사 5). 이름 없는 <section>은
   * region 랜드마크로 노출되지 않아서, 폰 로터의 랜드마크 목록에 main과
   * contentinfo만 남았습니다. 18,000px짜리 한 장에서 챕터 단위 이동 수단이
   * 레일 하나뿐이 됩니다. 제목을 가리키면 그 제목이 랜드마크의 이름이 됩니다.
   */
  labelledBy?: string;
  /** 나루 전용 거터와 배경 전환 간격을 구분합니다. 세로 여백과 화면 최소 높이는 공통값을 유지합니다. */
  contentSized?: boolean;
}) {
  // DECIDED 2026-10-20 (hwang 브리프 3.1, D5): 챕터 리빌을 걷었습니다(8월 페이지도 같은 부품). 최종 화면은 전과 같습니다.
  // text alignment for the inner column
  const textCls =
    align === "left" ? "text-left"
    : align === "right" ? "text-right"
    : "text-center";

  // how the column sits inside the centered rail.
  // mobile: always full-width single column.
  // desktop: left/right become a ~58% column nudged to one side (an editorial
  // offset within the rail); center stays full-width-centered.
  const offsetCls =
    align === "left" ? "lg:mr-auto lg:max-w-[58%]"
    : align === "right" ? "lg:ml-auto lg:max-w-[58%]"
    : "mx-auto";

  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      // A footer (the scroll hint) is pinned to the section's bottom, so it only
      // lands at the real screen bottom if the section fills the viewport. Force
      // DECIDED 2026-10-21: 6799d58의 63/90/108px 여백과 md 화면 최소 높이를 복원합니다.
      // full height at every breakpoint when a footer exists (min-h-screen →
      // 100dvh via globals.css, correct on iOS). Otherwise keep the collaborator's
      // mobile auto-height (content-sized on phones, full-height from md up).
      className={`relative flex w-full flex-col justify-center py-14 sm:py-20 lg:py-24 ${contentSized ? "naru-content-chapter" : ""} ${footer ? "min-h-screen" : "min-h-[auto] md:min-h-screen"} ${wide ? "" : contentSized ? "px-6 sm:px-12 lg:px-16" : "px-6 sm:px-10"} ${background ? "isolate" : ""} ${className}`}
    >
      {background}
      {/* centered content rail - the real boundary (z-10 keeps it above any
          full-bleed background layer). `wide` drops the max-width + centering so
          content can reach the screen edges.
          When there's a bottom-pinned footer (the scroll hint), reserve space
          for it so the centred content can't grow down into it on short phones -
          iPhone heights vary, so we don't chase a fixed number: pad the bottom
          on mobile and let it drop away once there's room (sm+). */}
      <div className={`relative z-10 w-full ${wide ? "" : "mx-auto max-w-6xl"} ${footer ? "pb-24 sm:pb-0" : ""}`}>
        <div
          // data-chapter-reveal: globals.css의 안전망이 잡는 손잡이입니다.
          // 이 div는 서버 마크업에 style="opacity:0"을 실어 보내고, 그 안에
          // 페이지의 모든 문단이 들어 있습니다. 자세한 사정은 globals.css의
          // "Chapter 리빌 안전망" 블록을 보세요.
          data-chapter-reveal
          className={`w-full ${textCls} ${offsetCls}`}
        >
          {children}
        </div>
      </div>
      {footer && (
        // Pinned to the bottom edge, offset by the iOS safe-area inset so it
        // clears the home indicator / gesture bar on any iPhone height.
        <div
          className="absolute inset-x-0 z-10 flex justify-center"
          style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 1.25rem)" }}
        >
          {footer}
        </div>
      )}
    </section>
  );
}
