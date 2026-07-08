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
    const io = new IntersectionObserver(
      ([e]) => {
        // Reveal once and stay revealed — don't re-hide when scrolled back past.
        if (e.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.25 }
    );
    io.observe(el);
    return () => io.disconnect();
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
      className={`relative flex min-h-screen w-full flex-col justify-center py-24 ${wide ? "" : "px-6 sm:px-10"} ${background ? "isolate" : ""} ${className}`}
    >
      {background}
      {/* centered content rail — the real boundary (z-10 keeps it above any
          full-bleed background layer). `wide` drops the max-width + centering so
          content can reach the screen edges. */}
      <div className={`relative z-10 w-full ${wide ? "" : "mx-auto max-w-6xl"}`}>
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
        <div className="absolute inset-x-0 bottom-8 z-10 flex justify-center sm:bottom-10">
          {footer}
        </div>
      )}
    </section>
  );
}
