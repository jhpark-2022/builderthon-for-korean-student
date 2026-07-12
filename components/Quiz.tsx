"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useLocale } from "@/lib/LocaleContext";
import { links } from "@/data/dictionary";
import LocaleToggle from "@/components/LocaleToggle";
import {
  QUESTIONS,
  RESULTS,
  quizUI,
  axisMeta,
  type Axis,
  type MbtiKey,
  type Result,
} from "@/data/quiz";
import { categoryMeta } from "@/data/schedule";
import { scoreQuiz, parseResultId, type Choice, type QuizResult, type AxisScore } from "@/lib/quizScore";
import { getExplanation } from "@/data/quizExplanations";
import { recommendEvents, type EventPick } from "@/lib/eventMatch";

type Phase = "landing" | "quiz" | "analyzing" | "result";

// The visitor's OWN result id, stashed in sessionStorage the moment they finish
// the quiz. On a result-screen refresh the ?r= deep-link would otherwise look
// like a friend's share; matching it against this key keeps "my result" =
// "my result" (correct CTA button, gauges preserved across the reload).
// All access is guarded — sessionStorage can throw (private mode, blocked
// storage) — and any failure silently falls back to the old share behavior.
const OWN_KEY = "z100-quiz-own";

function readOwnResult(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage.getItem(OWN_KEY);
  } catch {
    return null;
  }
}

function writeOwnResult(resultId: string): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(OWN_KEY, resultId);
  } catch {
    /* storage blocked — keep old behavior */
  }
}

function clearOwnResult(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(OWN_KEY);
  } catch {
    /* storage blocked — no-op */
  }
}

// Landing-cluster logos, now self-hosted from /public/logos (copied from the
// simple-icons npm package by scripts/copy-logos.mjs) — no more CDN dependency
// after the `openai` slug 404'd on cdn.simpleicons.org. Each still carries an
// emoji fallback: HeroLogo swaps to it if the local SVG is ever missing, so a
// tile never renders broken.
const HERO_LOGOS = [
  { slug: "deepseek", alt: "DeepSeek", emoji: "🐋" },
  { slug: "anthropic", alt: "Claude", emoji: "✳️" },
  { slug: "openai", alt: "ChatGPT", emoji: "🤖" },
  { slug: "googlegemini", alt: "Gemini", emoji: "✨" },
  { slug: "ollama", alt: "Llama", emoji: "🦙" },
  { slug: "perplexity", alt: "Perplexity", emoji: "❓" },
];

// Detects an <img> that already failed before React could attach onError (the
// SSR/hydration race for a 404'd src): if it's complete with zero intrinsic
// width, it errored — flip to the emoji fallback.
function markBrokenImage(node: HTMLImageElement | null, fail: () => void) {
  if (node && node.complete && node.naturalWidth === 0) fail();
}

// A single landing logo tile that falls back to its emoji if the local SVG 404s.
function HeroLogo({ slug, alt, emoji }: { slug: string; alt: string; emoji: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return <span className="text-2xl leading-none" aria-hidden>{emoji}</span>;
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/logos/${slug}.svg`}
      alt={alt}
      className="h-6 w-6 object-contain"
      ref={(n) => markBrokenImage(n, () => setFailed(true))}
      onError={() => setFailed(true)}
    />
  );
}

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
      src={`/logos/${result.logo}.svg`}
      alt={result.model}
      className={imgClass}
      ref={(n) => markBrokenImage(n, () => setFailed(true))}
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
  const [result, setResult] = useState<QuizResult | null>(null);
  const [fromShare, setFromShare] = useState(false);
  const [toast, setToast] = useState(false);
  const [picks, setPicks] = useState<EventPick[] | null>(null);

  // Deep-link: ?r=INFJ-A drops a visitor straight onto a result card. Usually
  // that's a friend's share (the viral loop). But if the id matches the one WE
  // just stashed, it's the visitor's own result surviving a refresh — treat it
  // as theirs (fromShare=false) so the retake button/copy stay correct.
  useEffect(() => {
    const parsed = parseResultId(params.get("r"));
    if (!parsed) return;
    setPhase("result");
    setFromShare(readOwnResult() !== parsed.resultId);
    // Keep a freshly-scored result (which carries `axes` for the gauges) when
    // our OWN enterResult → replaceState re-fires this effect with the same id
    // (Next 14.2 syncs replaceState into useSearchParams). A genuine deep-link
    // has no prior result, so it falls through to the axes-less parsed one.
    setResult((prev) => (prev && prev.resultId === parsed.resultId ? prev : parsed));
  }, [params]);

  // Enter the result phase: persist the id (so refresh keeps it "ours"), reflect
  // it in the URL for sharing, then flip the phase. Called either straight away
  // (reduced motion) or after the analyzing interstitial.
  const enterResult = useCallback((scored: QuizResult) => {
    writeOwnResult(scored.resultId);
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", `/quiz?r=${scored.resultId}`);
    }
    setPhase("result");
  }, []);

  // Analyzing interstitial → result, after ~2.4s. Timer is cleaned up so leaving
  // the page (or hitting Back) mid-analysis never fires setState on an unmount.
  useEffect(() => {
    if (phase !== "analyzing" || !result) return;
    const id = window.setTimeout(() => enterResult(result), 2400);
    return () => window.clearTimeout(id);
  }, [phase, result, enterResult]);

  const startQuiz = () => {
    setAnswers([]);
    setIndex(0);
    setSelected(null);
    setResult(null);
    setPicks(null);
    setFromShare(false);
    clearOwnResult();
    // drop the ?r= so a retake doesn't leave a stale result in the URL
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", "/quiz");
    }
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
        // Reduced motion skips the interstitial and jumps straight to the result;
        // otherwise show the "analyzing" beat, which then enters the result.
        if (reduce) {
          enterResult(scored);
        } else {
          setPhase("analyzing");
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
            <div
              className="h-2 w-full overflow-hidden rounded-full bg-white/10"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={QUESTIONS.length}
              aria-valuenow={index + 1}
              aria-label={t(quizUI.progressLabel)}
            >
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

        {phase === "analyzing" && <Analyzing t={t} reduce={!!reduce} />}

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
            <HeroLogo slug={l.slug} alt={l.alt} emoji={l.emoji} />
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
  result: QuizResult;
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

      {/* Stacked: the shareable result card spans the full width on top, then
          the apply CTA + session recommendations + actions sit below it. */}
      <div className="flex w-full flex-col gap-6">
        {/* full-width shareable result card */}
        <div
          className="relative w-full overflow-hidden rounded-[28px] border border-white/12 bg-[#0c0a18] p-7 text-left sm:p-9"
          style={{ boxShadow: "0 30px 70px -28px rgba(217,70,239,0.42)" }}
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-fuchsia-500/20 to-transparent" />
          <div className="relative flex items-center justify-between">
            <span className="font-mono text-[0.7rem] font-bold uppercase tracking-[0.15em] text-white/45">Zero100 Builderthon</span>
            <span className="font-mono text-[0.7rem] font-bold tracking-wider text-white/45">{result.resultId}</span>
          </div>

          {/* two columns fill the wide card: identity + gauges on the left,
              strengths / weakness / role / match on the right */}
          <div className="relative mt-6 grid gap-8 lg:grid-cols-2 lg:gap-14">
            {/* identity + traits */}
            <div>
              <div className={`flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br ${data.accent} shadow-lg`}>
                <ModelGlyph result={data} imgClass="h-10 w-10 object-contain" emojiClass="text-4xl leading-none" />
              </div>
              <p className="mt-6 text-sm font-semibold text-white/55">{t(quizUI.youAre)}</p>
              <h2 className="mt-1 text-[1.7rem] font-black leading-tight tracking-tight sm:text-[2rem]">{t(variant.name)}</h2>
              <p className="mt-1 text-sm font-bold text-fuchsia-200">{data.model} · {result.resultId}</p>
              <p className="mt-4 text-[15px] font-semibold leading-relaxed text-white/90">“{t(data.phrase)}”</p>
              <p className="mt-3 text-sm leading-relaxed text-white/65">{t(data.desc)}</p>
              <p className="mt-3 text-sm italic leading-relaxed text-white/55">{t(variant.line)}</p>

              {/* Why this model — the research-backed reason the type maps here. */}
              <div className="mt-4 rounded-2xl border border-fuchsia-400/15 bg-fuchsia-500/[0.05] p-3.5">
                <p className="text-[0.7rem] font-bold uppercase tracking-wider text-fuchsia-200/70">{t(quizUI.whyModel)} · {data.model}</p>
                <p className="mt-1 text-sm leading-relaxed text-white/75">{t(data.whyModel)}</p>
              </div>
            </div>

            {/* strengths / weakness / gauges / role / match */}
            <div className="flex flex-col gap-5">
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3.5">
                  <p className="text-[0.7rem] font-bold uppercase tracking-wider text-emerald-300">{t(quizUI.strengthsLabel)}</p>
                  <p className="mt-1 text-sm leading-snug text-white/80">{t(data.strengths)}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3.5">
                  <p className="text-[0.7rem] font-bold uppercase tracking-wider text-rose-300">{t(quizUI.weaknessLabel)}</p>
                  <p className="mt-1 text-sm leading-snug text-white/80">{t(data.weakness)}</p>
                </div>
              </div>

              {/* Per-axis % gauges — only when the visitor actually took the quiz.
                  Deep-linked (shared) results carry no axes, so this is hidden.
                  Each row is a click-to-expand accordion explaining the % from
                  the taker's own answers. */}
              {result.axes && result.axes.length > 0 && (
                <div>
                  <p className="text-[0.7rem] font-bold uppercase tracking-wider text-white/45">{t(quizUI.axesLabel)}</p>
                  <AxisGauges axes={result.axes} accent={data.accent} t={t} reduce={reduce} />
                </div>
              )}

              <div>
                <p className="text-[0.7rem] font-bold uppercase tracking-wider text-white/45">{t(quizUI.roleLabel)}</p>
                <span className="mt-2 inline-flex items-center gap-2 rounded-full border border-fuchsia-400/30 bg-fuchsia-400/10 px-4 py-2 text-sm font-bold text-fuchsia-200">
                  ★ {t(data.role)}
                </span>
              </div>

              <div>
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
        </div>

        {/* below the card: apply CTA + actions on one side, session recs on the other */}
        <div className="grid w-full gap-4 lg:grid-cols-2 lg:items-start">
          <div className="flex flex-col gap-4">
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

          {/* session recommendation */}
          <EventRecsPanel picks={picks} onRecommend={onRecommend} t={t} reduce={reduce} />
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

// ── Axis % gauges (accordion) ───────────────────────────────────────────────
// One row per MBTI axis: winner pole + %, an accent bar that fills 0→pct, the
// losing pole faint, and a chevron. Click a row to expand an answer-aware
// explanation of that %. Single-open accordion; the first axis starts open.
function AxisGauges({
  axes,
  accent,
  t,
  reduce,
}: {
  axes: AxisScore[];
  accent: string;
  t: (p: { ko: string; en: string }) => string;
  reduce: boolean;
}) {
  const [open, setOpen] = useState<Axis | null>(axes[0]?.axis ?? null);
  return (
    <div className="mt-3 flex flex-col gap-1">
      {axes.map((a, i) => (
        <AxisGaugeRow
          key={a.axis}
          axis={a}
          accent={accent}
          t={t}
          reduce={reduce}
          order={i}
          isOpen={open === a.axis}
          onToggle={() => setOpen((cur) => (cur === a.axis ? null : a.axis))}
        />
      ))}
    </div>
  );
}

function AxisGaugeRow({
  axis,
  accent,
  t,
  reduce,
  order,
  isOpen,
  onToggle,
}: {
  axis: AxisScore;
  accent: string; // literal Tailwind gradient classes, reused from the card
  t: (p: { ko: string; en: string }) => string;
  reduce: boolean;
  order: number;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const explanation = getExplanation(axis.axis, axis.pattern, axis.pct);
  const bar = (
    <>
      <span className="w-11 shrink-0 text-right text-xs font-bold text-white/85">{t(axisMeta[axis.winner])}</span>
      <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-white/10">
        <motion.div
          className={`h-full rounded-full bg-gradient-to-r ${accent}`}
          initial={reduce ? false : { width: 0 }}
          animate={{ width: `${axis.pct}%` }}
          transition={{ duration: reduce ? 0 : 0.7, ease: [0.22, 1, 0.36, 1], delay: reduce ? 0 : 0.15 + order * 0.08 }}
        />
      </div>
      <span className="w-9 shrink-0 text-right font-mono text-xs font-bold tabular-nums text-white/85">{axis.pct}%</span>
      <span className="w-11 shrink-0 text-xs font-medium text-white/30">{t(axisMeta[axis.loser])}</span>
    </>
  );

  // Defensive: a missing explanation (getExplanation already warned) → static row.
  if (!explanation) {
    return <div className="flex items-center gap-2.5 py-1">{bar}</div>;
  }

  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex w-full items-center gap-2.5 rounded-lg py-1 text-left transition hover:bg-white/[0.03]"
      >
        {bar}
        <motion.span
          className="shrink-0 text-white/40"
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: reduce ? 0 : 0.2 }}
          aria-hidden
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="exp"
            initial={reduce ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reduce ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <p className="px-1 pb-2 pt-0.5 text-[13px] leading-relaxed text-white/65">{t(explanation)}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── "Analyzing…" interstitial ───────────────────────────────────────────────
// A spinner + three copy lines that swap on an ~0.8s cadence (≈2.4s total, the
// parent's timer). Only mounted on the non-reduced-motion path.
function Analyzing({ t, reduce }: { t: (p: { ko: string; en: string }) => string; reduce: boolean }) {
  const messages = quizUI.analyzing;
  const [step, setStep] = useState(0);
  useEffect(() => {
    const id = window.setInterval(
      () => setStep((s) => (s < messages.length - 1 ? s + 1 : s)),
      800
    );
    return () => window.clearInterval(id);
  }, [messages.length]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center py-16 text-center">
      <motion.div
        className="h-14 w-14 rounded-full border-[3px] border-white/15 border-t-violet-400"
        animate={reduce ? undefined : { rotate: 360 }}
        transition={reduce ? undefined : { repeat: Infinity, ease: "linear", duration: 0.9 }}
      />
      <div className="mt-8 h-7">
        <AnimatePresence mode="wait">
          <motion.p
            key={step}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="text-lg font-bold text-white"
          >
            {t(messages[step])}
          </motion.p>
        </AnimatePresence>
      </div>
      <div className="mt-6 flex gap-1.5">
        {messages.map((_, i) => (
          <span
            key={i}
            className={`h-1.5 w-1.5 rounded-full transition-colors ${i <= step ? "bg-violet-400" : "bg-white/15"}`}
            aria-hidden
          />
        ))}
      </div>
    </div>
  );
}
