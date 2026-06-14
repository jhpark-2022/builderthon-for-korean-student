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
}: {
  id?: string;
  children: ReactNode;
  align?: "left" | "center" | "right";
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => setShown(e.isIntersecting),
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
      className={`relative flex min-h-screen w-full flex-col justify-center px-6 py-24 sm:px-10 ${className}`}
    >
      {/* centered content rail — the real boundary */}
      <div className="mx-auto w-full max-w-6xl">
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
    </section>
  );
}
