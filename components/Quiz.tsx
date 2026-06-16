"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useLocale } from "@/lib/LocaleContext";
import { links } from "@/data/dictionary";
import LocaleToggle from "@/components/LocaleToggle";
import {
  QUESTIONS,
  RESULTS,
  quizUI,
  type Identity,
  type MbtiKey,
  type Result,
} from "@/data/quiz";
import { categoryMeta } from "@/data/schedule";
import { scoreQuiz, parseResultId, type Choice } from "@/lib/quizScore";
import { recommendEvents, type EventPick } from "@/lib/eventMatch";

type Phase = "landing" | "quiz" | "result";

// Six landing-cluster logos with reliable Simple Icons coverage (others fall
// back to emoji on individual result cards via ModelGlyph's onError).
const HERO_LOGOS = [
  { slug: "deepseek", alt: "DeepSeek" },
  { slug: "anthropic", alt: "Claude" },
  { slug: "openai", alt: "ChatGPT" },
  { slug: "googlegemini", alt: "Gemini" },
  { slug: "ollama", alt: "Llama" },
  { slug: "perplexity", alt: "Perplexity" },
];

// Real brand logo (white mono) with a graceful emoji fallback.
function ModelGlyph({
  result,
  imgClass,
  emojiClass,
}: {
  result: Result;
  imgClass: string;
  emojiClass: string;
}) {
  const [failed, setFailed] = useState(false);
  if (!result.logo || failed) {
    return <span className={emojiClass} aria-hidden>{result.emoji}</span>;
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://cdn.simpleicons.org/${result.logo}/ffffff`}
      alt={result.model}
      className={imgClass}
      onError={() => setFailed(true)}
    />
  );
}

export default function Quiz() {
  const { t } = useLocale();
  const reduce = useReducedMotion();
  const params = useSearchParams();

  const [phase, setPhase] = useState<Phase>("landing");
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Choice[]>([]);
  const [selected, setSelected] = useState<Choice | null>(null);
  const [result, setResult] = useState<{ mbti: MbtiKey; identity: Identity; resultId: string } | null>(null);
  const [fromShare, setFromShare] = useState(false);
  const [toast, setToast] = useState(false);
  const [picks, setPicks] = useState<EventPick[] | null>(null);

  // Deep-link: ?r=INFJ-A drops a visitor straight onto a friend's result card
  // (the viral loop — they see the result, then take it themselves).
  useEffect(() => {
    const parsed = parseResultId(params.get("r"));
    if (parsed) {
      setResult(parsed);
      setPhase("result");
      setFromShare(true);
    }
  }, [params]);

  const startQuiz = () => {
    setAnswers([]);
    setIndex(0);
    setSelected(null);
    setResult(null);
    setPicks(null);
    setFromShare(false);
    setPhase("quiz");
  };

  const handleAnswer = (choice: Choice) => {
    if (selected) return; // ignore double taps during the transition
    setSelected(choice);
    const next = [...answers];
    next[index] = choice;
    setAnswers(next);

    const advance = () => {
      if (index + 1 < QUESTIONS.length) {
        setIndex(index + 1);
        setSelected(null);
      } else {
        const scored = scoreQuiz(next);
        setResult(scored);
        setPicks(null);
        setPhase("result");
        if (typeof window !== "undefined") {
          window.history.replaceState(null, "", `/quiz?r=${scored.resultId}`);
        }
      }
    };
    // brief beat so the selected-state highlight is visible before advancing
    window.setTimeout(advance, reduce ? 0 : 260);
  };

  const goBack = () => {
    if (index === 0) {
      setPhase("landing");
      return;
    }
    setIndex(index - 1);
    setSelected(answers[index - 1] ?? null);
  };

  const share = useCallback(async () => {
    if (!result) return;
    const url = `${typeof window !== "undefined" ? window.location.origin : ""}/quiz?r=${result.resultId}`;
    const data = RESULTS[result.mbti];
    const title = `${t(data.variants[result.identity].name)} · ${result.resultId}`;
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ title, text: t(quizUI.title), url });
        return;
      }
      throw new Error("no share");
    } catch {
      try {
        await navigator.clipboard.writeText(url);
        setToast(true);
        window.setTimeout(() => setToast(false), 2200);
      } catch {
        /* clipboard blocked — silently no-op */
      }
    }
  }, [result, t]);

  const current = QUESTIONS[index];
  const progress = ((index + 1) / QUESTIONS.length) * 100;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#06040f] text-white">
      {/* decorative field — same tokens as the main site */}
      <div aria-hidden className="grid-bg pointer-events-none absolute inset-0 opacity-50" />
      <div aria-hidden className="orb" style={{ left: "-12%", top: "-10%", width: "42vh", height: "42vh", background: "rgba(124,58,237,0.4)" }} />
      <div aria-hidden className="orb" style={{ bottom: "-14%", right: "-10%", width: "46vh", height: "46vh", background: "rgba(6,182,212,0.3)" }} />

      {/* header — widens on the result screen so it lines up with the 2-col layout */}
      <header className={`relative z-10 mx-auto flex h-20 items-center justify-between px-6 ${phase === "result" ? "max-w-5xl" : "max-w-2xl"}`}>
        <a href="/" className="text-sm font-semibold text-white/60 transition hover:text-white">
          ← {t(quizUI.back)}
        </a>
        <LocaleToggle />
      </header>

      <div className={`relative z-10 mx-auto flex min-h-[calc(100vh-5rem)] flex-col px-6 pb-12 ${phase === "result" ? "max-w-5xl" : "max-w-2xl"}`}>
        {phase === "landing" && <Landing onStart={startQuiz} t={t} reduce={!!reduce} />}

        {phase === "quiz" && current && (
          <div className="flex flex-1 flex-col pt-4">
            {/* progress */}
            <div className="mb-3 flex items-center justify-between">
              <button type="button" onClick={goBack} className="inline-flex items-center gap-1 text-sm font-semibold text-white/50 transition hover:text-white/90">
                ← {t(quizUI.prev)}
              </button>
              <span className="font-mono text-sm font-bold text-white">
                {index + 1}
                <span className="text-white/35"> / {QUESTIONS.length}</span>
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-400"
                animate={{ width: `${progress}%` }}
                initial={false}
                transition={{ duration: reduce ? 0 : 0.4, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>

            {/* question */}
            <div className="flex flex-1 flex-col justify-center py-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={current.id}
                  initial={reduce ? false : { opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={reduce ? undefined : { opacity: 0, x: -24 }}
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                >
                  <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-violet-300">
                    {current.id}
                  </p>
                  <h2 className="text-[1.6rem] font-bold leading-snug tracking-tight sm:text-[1.8rem]">
                    {t(current.text)}
                  </h2>
                  <div className="mt-8 flex flex-col gap-3.5">
                    {(["a", "b"] as const).map((key) => {
                      const opt = current[key];
                      const isSel = selected === key;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => handleAnswer(key)}
                          className={`flex items-center gap-4 rounded-2xl border p-5 text-left transition ${
                            isSel
                              ? "-translate-y-0.5 border-violet-400/50 bg-white/[0.08]"
                              : "border-white/10 bg-white/[0.04] hover:border-white/20 hover:bg-white/[0.07]"
                          }`}
                        >
                          <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-sm font-bold transition ${
                            isSel ? "border-violet-400/50 bg-violet-500/20 text-violet-100" : "border-white/15 bg-white/[0.04] text-white/60"
                          }`}>
                            {key.toUpperCase()}
                          </span>
                          <span className="text-base font-semibold leading-snug text-white/90">
                            {t(opt.label)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        )}

        {phase === "result" && result && (
          <ResultView
            result={result}
            t={t}
            reduce={!!reduce}
            fromShare={fromShare}
            picks={picks}
            onRecommend={() => setPicks(recommendEvents(result.resultId))}
            onShare={share}
            onRetake={startQuiz}
          />
        )}
      </div>

      {/* copy toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className="fixed bottom-8 left-1/2 z-50 -translate-x-1/2 rounded-full border border-white/15 bg-[#13131f] px-5 py-3 text-sm font-semibold text-white shadow-xl"
          >
            ✓ {t(quizUI.copied)}
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

// ── Landing ──────────────────────────────────────────────────────────────────
function Landing({ onStart, t, reduce }: { onStart: () => void; t: (p: { ko: string; en: string }) => string; reduce: boolean }) {
  return (
    <motion.div
      className="flex flex-1 flex-col items-center justify-center text-center"
      initial={reduce ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-violet-400/30 bg-violet-400/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-violet-200">
        ✦ {t(quizUI.eyebrow)}
      </span>
      <h1 className="text-[2.6rem] font-black leading-[1.05] tracking-tight sm:text-[3rem]">
        <span className="bg-gradient-to-r from-violet-300 via-fuchsia-300 to-cyan-300 bg-clip-text pb-[0.12em] text-transparent">
          {t(quizUI.title)}
        </span>
      </h1>
      <p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-white/70">
        {t(quizUI.subtitle)}
      </p>
      <div className="mt-9 flex flex-wrap items-center justify-center gap-2.5">
        {HERO_LOGOS.map((l) => (
          <span key={l.slug} className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`https://cdn.simpleicons.org/${l.slug}/ffffff`} alt={l.alt} className="h-6 w-6 object-contain" />
          </span>
        ))}
      </div>
      <button
        type="button"
        onClick={onStart}
        className="group mt-10 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-9 py-4 text-base font-bold text-white shadow-[0_8px_40px_rgba(124,58,237,0.5)] transition hover:-translate-y-0.5"
      >
        {t(quizUI.start)}
        <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">→</span>
      </button>
      <p className="mt-5 text-xs font-medium text-white/40">{t(quizUI.meta)}</p>
    </motion.div>
  );
}

// ── Result + session recommendation ────────────────────────────────────────
function ResultView({
  result,
  t,
  reduce,
  fromShare,
  picks,
  onRecommend,
  onShare,
  onRetake,
}: {
  result: { mbti: MbtiKey; identity: Identity; resultId: string };
  t: (p: { ko: string; en: string }) => string;
  reduce: boolean;
  fromShare: boolean;
  picks: EventPick[] | null;
  onRecommend: () => void;
  onShare: () => void;
  onRetake: () => void;
}) {
  const data = RESULTS[result.mbti];
  const variant = data.variants[result.identity];
  const ctaLead = t(quizUI.ctaLead).replace("{role}", t(data.role));

  return (
    <motion.div
      className="flex flex-col items-center pb-6 pt-2"
      initial={reduce ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-white/60">
        ✦ {t(quizUI.resultEyebrow)}
      </span>

      {/* On desktop the result card sits left (sticky) and the CTA + session
          recommendations fill the column to its right; on mobile it all stacks. */}
      <div className="grid w-full gap-6 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)] lg:items-start">
      {/* left: shareable result card */}
      <div className="mx-auto w-full max-w-[420px] lg:mx-0 lg:sticky lg:top-6">
      <div
        className="relative w-full overflow-hidden rounded-[28px] border border-white/12 bg-[#0c0a18] p-7 text-left"
        style={{ boxShadow: "0 30px 70px -28px rgba(217,70,239,0.42)" }}
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-fuchsia-500/20 to-transparent" />
        <div className="relative flex items-center justify-between">
          <span className="font-mono text-[0.7rem] font-bold uppercase tracking-[0.15em] text-white/45">KOMOS × Zero100</span>
          <span className="font-mono text-[0.7rem] font-bold tracking-wider text-white/45">{result.resultId}</span>
        </div>
        <div className={`relative mt-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br ${data.accent} shadow-lg`}>
          <ModelGlyph result={data} imgClass="h-10 w-10 object-contain" emojiClass="text-4xl leading-none" />
        </div>
        <p className="relative mt-6 text-sm font-semibold text-white/55">{t(quizUI.youAre)}</p>
        <h2 className="relative mt-1 text-[1.7rem] font-black leading-tight tracking-tight">{t(variant.name)}</h2>
        <p className="relative mt-1 text-sm font-bold text-fuchsia-200">{data.model} · {result.resultId}</p>
        <p className="relative mt-4 text-[15px] font-semibold leading-relaxed text-white/90">“{t(data.phrase)}”</p>
        <p className="relative mt-3 text-sm leading-relaxed text-white/65">{t(data.desc)}</p>
        <p className="relative mt-3 text-sm italic leading-relaxed text-white/55">{t(variant.line)}</p>

        <div className="relative mt-5 grid grid-cols-1 gap-2.5">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3.5">
            <p className="text-[0.7rem] font-bold uppercase tracking-wider text-emerald-300">{t(quizUI.strengthsLabel)}</p>
            <p className="mt-1 text-sm leading-snug text-white/80">{t(data.strengths)}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3.5">
            <p className="text-[0.7rem] font-bold uppercase tracking-wider text-rose-300">{t(quizUI.weaknessLabel)}</p>
            <p className="mt-1 text-sm leading-snug text-white/80">{t(data.weakness)}</p>
          </div>
        </div>

        <div className="relative mt-5">
          <p className="text-[0.7rem] font-bold uppercase tracking-wider text-white/45">{t(quizUI.roleLabel)}</p>
          <span className="mt-2 inline-flex items-center gap-2 rounded-full border border-fuchsia-400/30 bg-fuchsia-400/10 px-4 py-2 text-sm font-bold text-fuchsia-200">
            ★ {t(data.role)}
          </span>
        </div>

        <div className="relative mt-5">
          <p className="text-[0.7rem] font-bold uppercase tracking-wider text-white/45">{t(quizUI.matchLabel)}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {data.match.map((m) => {
              const mate = RESULTS[m];
              return (
                <span key={m} className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-3 py-2 text-sm font-semibold text-white/85">
                  <ModelGlyph result={mate} imgClass="h-4 w-4 object-contain" emojiClass="text-lg leading-none" />
                  {mate.model} · {m}
                </span>
              );
            })}
          </div>
        </div>
      </div>
      </div>

      {/* right: apply CTA + session recommendation + actions */}
      <div className="mx-auto flex w-full max-w-[420px] flex-col gap-4 lg:mx-0 lg:max-w-none">
        {/* apply CTA */}
        <div className="w-full rounded-[24px] border border-white/10 bg-white/[0.04] p-6 text-center">
          <p className="text-[15px] font-bold leading-relaxed text-white/85">{ctaLead}</p>
          <a
            href={links.program}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-4 text-base font-bold text-white shadow-[0_8px_36px_rgba(124,58,237,0.5)] transition hover:-translate-y-0.5"
          >
            {t(quizUI.ctaApply)} →
          </a>
        </div>

        {/* session recommendation */}
        <EventRecsPanel picks={picks} onRecommend={onRecommend} t={t} reduce={reduce} />

        {/* share / retake */}
        <div className="flex w-full gap-3">
          <button type="button" onClick={onShare} className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-6 py-3.5 text-sm font-bold text-white/90 transition hover:bg-white/10">
            ↗ {t(quizUI.share)}
          </button>
          <button type="button" onClick={onRetake} className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-6 py-3.5 text-sm font-bold text-white/90 transition hover:bg-white/10">
            ↻ {fromShare ? t(quizUI.retakeViral) : t(quizUI.retake)}
          </button>
        </div>
      </div>
    </div>
    </motion.div>
  );
}

// The new piece — recommend the Day 2–5 sessions a result should RSVP for.
function EventRecsPanel({
  picks,
  onRecommend,
  t,
  reduce,
}: {
  picks: EventPick[] | null;
  onRecommend: () => void;
  t: (p: { ko: string; en: string }) => string;
  reduce: boolean;
}) {
  if (!picks) {
    return (
      <div className="w-full rounded-[24px] border border-violet-400/20 bg-violet-500/[0.06] p-6 text-center">
        <p className="text-[0.7rem] font-bold uppercase tracking-[0.18em] text-violet-300">
          ✦ {t(quizUI.recEyebrow)}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-white/75">{t(quizUI.recPrompt)}</p>
        <button
          type="button"
          onClick={onRecommend}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-violet-400/40 bg-white/[0.06] px-6 py-3.5 text-sm font-bold text-violet-100 transition hover:bg-white/10"
        >
          ✦ {t(quizUI.recCta)}
        </button>
      </div>
    );
  }

  return (
    <motion.div
      key="recs"
      initial={reduce ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="w-full overflow-hidden rounded-[24px] border border-white/12 bg-[#0c0a18] p-6 text-left"
    >
      <p className="text-[0.7rem] font-bold uppercase tracking-[0.18em] text-white/45">{t(quizUI.recTitle)}</p>

      <div className="mt-3 flex flex-col gap-3">
        {picks.map(({ event, reason }) => {
          const meta = categoryMeta[event.category];
          return (
            <a
              key={event.id}
              href={`/?event=${event.id}#program`}
              className="group block rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition hover:-translate-y-0.5 hover:border-violet-400/30 hover:bg-white/[0.07]"
            >
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: meta.dot }} aria-hidden />
                <span className="text-[0.7rem] font-bold uppercase tracking-wide" style={{ color: meta.dot }}>
                  {t(meta.label)}
                </span>
                <span className="ml-auto text-[0.7rem] font-semibold text-white/45">
                  Day {event.day} · {event.date}
                </span>
              </div>
              <h4 className="mt-2 text-base font-bold leading-snug text-white">{t(event.title)}</h4>
              <p className="mt-1 text-sm leading-snug text-white/65">{t(reason)}</p>
              <span className="mt-2.5 inline-flex items-center gap-1 text-xs font-semibold text-violet-300/70 transition group-hover:text-violet-300">
                {t(quizUI.recView)} →
              </span>
            </a>
          );
        })}
      </div>

      <p className="mt-4 text-[0.7rem] leading-relaxed text-white/35">{t(quizUI.recNote)}</p>
    </motion.div>
  );
}
