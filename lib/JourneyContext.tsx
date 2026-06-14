"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";

// Global scroll-journey progress, 0 → 1 across the whole page.
// The 3D world reads this to fly the camera; overlays read it for chapter fades.

interface JourneyValue {
  progress: number;        // 0..1 smoothed
  progressRef: React.MutableRefObject<number>; // raw, for useFrame (no re-render)
}

const JourneyContext = createContext<JourneyValue | null>(null);

export function JourneyProvider({ children }: { children: React.ReactNode }) {
  const progressRef = useRef(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? window.scrollY / max : 0;
      progressRef.current = p;
      // throttle state updates to one per frame
      if (!raf) {
        raf = requestAnimationFrame(() => {
          setProgress(progressRef.current);
          raf = 0;
        });
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <JourneyContext.Provider value={{ progress, progressRef }}>
      {children}
    </JourneyContext.Provider>
  );
}

export function useJourney() {
  const ctx = useContext(JourneyContext);
  if (!ctx) throw new Error("useJourney must be used within JourneyProvider");
  return ctx;
}

// Number of narrative chapters (used to map progress → chapter index).
export const CHAPTERS = 7;

// Helper: returns 0..1 fade for a chapter given global progress.
// Each chapter owns a slice of the scroll; fades in/out at its edges.
export function chapterOpacity(progress: number, index: number, total = CHAPTERS) {
  const slice = 1 / total;
  const center = slice * (index + 0.5);
  const dist = Math.abs(progress - center);
  // visible within ~0.6 slice of its center, fading at edges
  const t = 1 - dist / (slice * 0.7);
  return Math.max(0, Math.min(1, t));
}
