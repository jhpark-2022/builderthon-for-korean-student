"use client";

// ─────────────────────────────────────────────────────────────────────────────
// Returning-visitor greeting pill for the hero.
//
// A visitor who took the /quiz personality test and comes back to the main site
// is welcomed by name — "안녕하세요, 조급한 Mistral님 👋" — with a link straight back
// to their result. Non-takers (no saved result) see nothing at all, so the hero
// is 100% unchanged for them.
//
// HYDRATION: the saved result lives only in localStorage (absent during SSR), so
// we render nothing until it's read in an effect — no server/client markup
// mismatch. It then fades in (respecting prefers-reduced-motion).
//
// The variant NAME is derived from the stored resultId at render time (localStorage
// holds only the id), so a copy change to the type names always shows the latest.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useLocale } from "@/lib/LocaleContext";
import { RESULTS } from "@/data/quiz";
import { parseResultId } from "@/lib/quizScore";
import { loadOwnResult, type OwnResult } from "@/lib/quizResult";

// Model brand logo (white mono) from /public/logos with an emoji fallback —
// mirrors Quiz.tsx's ModelGlyph so the pill's mark matches the result screen.
function GreetingGlyph({ logo, emoji, model }: { logo: string; emoji: string; model: string }) {
  const [failed, setFailed] = useState(false);
  if (!logo || failed) {
    return <span className="text-base leading-none" aria-hidden>{emoji}</span>;
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/logos/${logo}`}
      alt={model}
      className="h-4 w-4 object-contain"
      // Catch a 404 that fired before React attached onError (SSR/hydration race).
      ref={(n) => {
        if (n && n.complete && n.naturalWidth === 0) setFailed(true);
      }}
      onError={() => setFailed(true)}
    />
  );
}

export default function ReturningGreeting({ compact = false }: { compact?: boolean }) {
  const { t, locale } = useLocale();
  const reduce = useReducedMotion();
  const [own, setOwn] = useState<OwnResult | null>(null);

  useEffect(() => {
    setOwn(loadOwnResult());
  }, []);

  if (!own) return null; // first-time visitor (or SSR) → hero is untouched

  const parsed = parseResultId(own.resultId);
  if (!parsed) return null; // defensive — loadOwnResult already validated it

  const data = RESULTS[parsed.mbti];
  const variantName = t(data.variants[parsed.identity].name);
  const lead =
    locale === "ko" ? `안녕하세요, ${variantName}님 👋` : `Welcome back, ${variantName} 👋`;
  const sub = locale === "ko" ? "다시 보러 가기 →" : "See it again →";

  // Compact variant — a single-line pill sized for the top nav bar. Same link
  // and glyph, but the "다시 보러 가기" sub-line is dropped and the name shows
  // just the type ("조급한 Mistral님"), so it fits inline beside the nav buttons.
  if (compact) {
    const nameOnly =
      locale === "ko" ? `${variantName}님` : variantName;
    return (
      <a
        href={`/quiz?r=${own.resultId}`}
        title={sub}
        className="group inline-flex shrink-0 items-center gap-2 rounded-full border border-violet-400/30 bg-violet-400/10 py-1.5 pl-2 pr-3.5 transition hover:border-violet-400/50 hover:bg-violet-400/15"
      >
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/[0.06]">
          <GreetingGlyph logo={data.logo} emoji={data.emoji} model={data.model} />
        </span>
        <span className="whitespace-nowrap text-sm font-semibold text-white">
          {nameOnly} <span aria-hidden className="text-violet-200/80 transition group-hover:text-violet-100">👋</span>
        </span>
      </a>
    );
  }

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="mb-6 flex justify-center lg:justify-start"
    >
      <a
        href={`/quiz?r=${own.resultId}`}
        className="group inline-flex items-center gap-2.5 rounded-full border border-violet-400/30 bg-violet-400/10 py-2 pl-2.5 pr-4 text-left backdrop-blur-sm transition hover:-translate-y-0.5 hover:border-violet-400/50 hover:bg-violet-400/15"
      >
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/[0.06]">
          <GreetingGlyph logo={data.logo} emoji={data.emoji} model={data.model} />
        </span>
        <span className="flex flex-col leading-tight">
          <span className="text-sm font-bold text-white">{lead}</span>
          <span className="text-[0.7rem] font-semibold text-violet-200/80 transition group-hover:text-violet-100">
            {sub}
          </span>
        </span>
      </a>
    </motion.div>
  );
}
