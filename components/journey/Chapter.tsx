"use client";

import { useEffect, useRef, useState } from "react";
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
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // IntersectionObserver가 없는 환경(구형 웹뷰, 일부 인앱 브라우저)을 먼저
    // 거릅니다 (2026-09-19, 접근성 감사 13). 순서가 중요합니다: js-reveal-ready를
    // 먼저 달고 나서 생성자가 던지면, globals.css의 안전망은 이미 비켜선 뒤라
    // 화면에 배경과 헤더만 남습니다. 같은 파일의 Funnel은 이미 이렇게 가드합니다.
    if (typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }
    // React가 살아 있다는 표시. globals.css의 리빌 안전망이 이 클래스를 보고
    // 비켜섭니다(2026-09-19). 없으면 안전망이 1.5초 뒤 전부 보여 줍니다.
    document.documentElement.classList.add("js-reveal-ready");
    // Fire as soon as ANY part of the section enters the viewport (threshold 0),
    // not once 25% of it is on screen. A section taller than the viewport — e.g.
    // the About/Vision chapter on a phone — can never show 25% of its area at
    // once, so a 0.25 threshold left it stuck at opacity:0 (invisible) on real
    // iOS Safari, where the usable viewport is shorter than desktop emulators.
    // A small negative rootMargin still lets it reveal a touch before fully in.
    const io = new IntersectionObserver(
      ([e]) => {
        // Reveal once and stay revealed — don't re-hide when scrolled back past.
        if (e.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0, rootMargin: "0px 0px -10% 0px" }
    );
    io.observe(el);
    // Safety net: if the observer somehow never fires (e.g. the element starts
    // already spanning the viewport with no scroll event), reveal after a beat
    // so content can never stay permanently hidden.
    //
    // 2026-09-19: 화면 안에 있는 경우로 좁혔습니다. 조건이 없던 동안에는 화면
    // 밖 챕터까지 1200ms에 전부 보이게 되어, 스크롤해서 내려갈 때 아무것도
    // 나타나지 않았습니다(8월 페이지에서 실측: 17,000px 아래 챕터가 스크롤 전에
    // 이미 opacity 1). 안전망이 하려던 일은 "이미 화면에 있는데 관찰자가 울리지
    // 않는 경우"이고, 그 경우는 그대로 지킵니다.
    const fallback = window.setTimeout(() => {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) setShown(true);
    }, 1200);
    // 키보드가 먼저 도착하는 경우 (2026-09-19, 접근성 감사 3). opacity 0은
    // 접근성 트리에서 빠지지 않아서, 아직 나타나지 않은 블록 안의 링크로 Tab이
    // 들어갈 수 있습니다. 그러면 700ms 동안 포커스는 거기 있는데 화면에는
    // 아무것도 보이지 않습니다. 포커스가 들어오면 즉시 보여 줍니다.
    const onFocusIn = () => setShown(true);
    el.addEventListener("focusin", onFocusIn);
    return () => {
      io.disconnect();
      window.clearTimeout(fallback);
      el.removeEventListener("focusin", onFocusIn);
    };
  }, []);

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
      ref={ref}
      aria-labelledby={labelledBy}
      // A footer (the scroll hint) is pinned to the section's bottom, so it only
      // lands at the real screen bottom if the section fills the viewport. Force
      // full height at every breakpoint when a footer exists (min-h-screen →
      // 100dvh via globals.css, correct on iOS). Otherwise keep the collaborator's
      // mobile auto-height (content-sized on phones, full-height from md up).
      className={`relative flex w-full flex-col justify-center py-14 sm:py-20 lg:py-24 ${footer ? "min-h-screen" : "min-h-[auto] md:min-h-screen"} ${wide ? "" : "px-6 sm:px-10"} ${background ? "isolate" : ""} ${className}`}
    >
      {background}
      {/* centered content rail — the real boundary (z-10 keeps it above any
          full-bleed background layer). `wide` drops the max-width + centering so
          content can reach the screen edges.
          When there's a bottom-pinned footer (the scroll hint), reserve space
          for it so the centred content can't grow down into it on short phones —
          iPhone heights vary, so we don't chase a fixed number: pad the bottom
          on mobile and let it drop away once there's room (sm+). */}
      <div className={`relative z-10 w-full ${wide ? "" : "mx-auto max-w-6xl"} ${footer ? "pb-24 sm:pb-0" : ""}`}>
        <div
          // data-chapter-reveal: globals.css의 안전망이 잡는 손잡이입니다.
          // 이 div는 서버 마크업에 style="opacity:0"을 실어 보내고, 그 안에
          // 페이지의 모든 문단이 들어 있습니다. 자세한 사정은 globals.css의
          // "Chapter 리빌 안전망" 블록을 보세요.
          data-chapter-reveal
          className={`w-full transition-all duration-700 ease-out ${textCls} ${offsetCls}`}
          style={{
            opacity: shown ? 1 : 0,
            transform: shown ? "translateY(0)" : "translateY(40px)",
          }}
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
