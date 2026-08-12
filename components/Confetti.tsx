"use client";

import { useEffect, useState } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// ONE-SHOT CONFETTI — 18 particles, 1.2s, brand hues only, and it never repeats.
// A sponsor is reading this page too.
//
// Lived inside Quiz.tsx until 2026-08-12, when the register success screen
// needed the same burst. That screen is the page's actual conversion moment and
// it was the flattest frame on the site: a static check mark, while the QUIZ —
// a side attraction — got a celebration. Rather than write a second burst that
// would drift from the first, the original moved here and both import it.
//
// Absent entirely under prefers-reduced-motion (CSS gate on `.quiz-confetti` in
// globals.css — the class name is load-bearing, don't rename it here alone).
// The caller decides WHEN it is warranted: the quiz skips it for a shared or
// deep-linked result, because the flourish is for the person who just did the
// work, not for a visitor landing cold.
//
// Requires a positioned ancestor: it pins itself to the top of the nearest
// `relative` box and fans downward from there.
// ─────────────────────────────────────────────────────────────────────────────
const CONFETTI_HUES = ["#a78bfa", "#818cf8", "#f0abfc", "#67e8f9"];

export default function Confetti() {
  const [done, setDone] = useState(false);
  useEffect(() => {
    const id = window.setTimeout(() => setDone(true), 1400);
    return () => window.clearTimeout(id);
  }, []);
  if (done) return null;
  return (
    <div
      aria-hidden
      className="quiz-confetti pointer-events-none absolute inset-x-0 top-0 z-10 flex justify-center overflow-visible"
    >
      {Array.from({ length: 18 }).map((_, i) => {
        const angle = (i / 18) * Math.PI * 2;
        return (
          <span
            key={i}
            className="absolute h-1.5 w-1.5 rounded-[1px]"
            style={{
              background: CONFETTI_HUES[i % CONFETTI_HUES.length],
              // Distance and spin are derived from the index — no randomness, so
              // the burst is identical every time and can't be mistaken for jank.
              ["--dx" as string]: `${Math.cos(angle) * 120}px`,
              ["--dy" as string]: `${Math.abs(Math.sin(angle)) * 90 + 40}px`,
              ["--rot" as string]: `${(i % 2 ? 1 : -1) * 220}deg`,
              animation: "quizConfetti 1.2s cubic-bezier(0.2,0.6,0.3,1) forwards",
              animationDelay: `${(i % 6) * 25}ms`,
            }}
          />
        );
      })}
    </div>
  );
}
