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
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
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
    const fallback = window.setTimeout(() => setShown(true), 1200);
    return () => {
      io.disconnect();
      window.clearTimeout(fallback);
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
