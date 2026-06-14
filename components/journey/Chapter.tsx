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

  const alignCls =
    align === "left" ? "items-start text-left"
    : align === "right" ? "items-end text-right"
    : "items-center text-center";

  return (
    <section
      id={id}
      ref={ref}
      className={`relative flex min-h-screen w-full flex-col justify-center px-6 py-24 sm:px-10 ${alignCls} ${className}`}
    >
      <div
        className="w-full max-w-3xl transition-all duration-700 ease-out"
        style={{
          opacity: shown ? 1 : 0,
          transform: shown ? "translateY(0)" : "translateY(40px)",
        }}
      >
        {children}
      </div>
    </section>
  );
}
