"use client";

import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
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
  type Variant,
} from "@/data/quiz";
import { scoreQuiz, parseResultId, type Choice, type QuizResult, type AxisScore } from "@/lib/quizScore";
import { getExplanation } from "@/data/quizExplanations";

type Phase = "landing" | "quiz" | "analyzing" | "result";

// Landing-cluster logos, self-hosted from /public/logos — no CDN dependency.
// `file` is the full filename (ext included) under /public/logos, matching the
// `logo` field on RESULTS. Each still carries an emoji fallback: HeroLogo swaps
// to it if the local file is ever missing (e.g. openai has no self-hostable
// mono mark), so a tile never renders broken.
const HERO_LOGOS = [
  { file: "deepseek.svg", alt: "DeepSeek", emoji: "🐋" },
  { file: "anthropic.svg", alt: "Claude", emoji: "✳️" },
  { file: "openai.svg", alt: "ChatGPT", emoji: "🤖" }, // no file → emoji fallback
  { file: "googlegemini.svg", alt: "Gemini", emoji: "✨" },
  { file: "ollama.svg", alt: "Llama", emoji: "🦙" },
  { file: "perplexity.svg", alt: "Perplexity", emoji: "❓" },
];

// Detects an <img> that already failed before React could attach onError (the
// SSR/hydration race for a 404'd src): if it's complete with zero intrinsic
// width, it errored — flip to the emoji fallback.
function markBrokenImage(node: HTMLImageElement | null, fail: () => void) {
  if (node && node.complete && node.naturalWidth === 0) fail();
}

// A single landing logo tile that falls back to its emoji if the local file 404s.
function HeroLogo({ file, alt, emoji }: { file: string; alt: string; emoji: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return <span className="text-2xl leading-none" aria-hidden>{emoji}</span>;
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/logos/${file}`}
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
      src={`/logos/${result.logo}`}
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

  // Deep-link: ?r=INFJ-A drops a visitor straight onto a result card (a shared
  // link, or the visitor's own result surviving a refresh).
  useEffect(() => {
    const parsed = parseResultId(params.get("r"));
    if (!parsed) return;
    setPhase("result");
    // Keep a freshly-scored result (which carries `axes` for the gauges) when
    // our OWN enterResult → replaceState re-fires this effect with the same id
    // (Next 14.2 syncs replaceState into useSearchParams). A genuine deep-link
    // has no prior result, so it falls through to the axes-less parsed one.
    setResult((prev) => (prev && prev.resultId === parsed.resultId ? prev : parsed));
  }, [params]);

  // Enter the result phase: reflect the id in the URL (so a refresh keeps the
  // result), then flip the phase. Called either straight away (reduced motion)
  // or after the analyzing interstitial.
  const enterResult = useCallback((scored: QuizResult) => {
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
    // drop the ?r= so a restart doesn't leave a stale result in the URL
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
          <ResultView result={result} t={t} reduce={!!reduce} />
        )}
      </div>
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
          <span key={l.file} className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05]">
            <HeroLogo file={l.file} alt={l.alt} emoji={l.emoji} />
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

// ── Result screen ───────────────────────────────────────────────────────────
function ResultView({
  result,
  t,
  reduce,
}: {
  result: QuizResult;
  t: (p: { ko: string; en: string }) => string;
  reduce: boolean;
}) {
  const data = RESULTS[result.mbti];
  const variant = data.variants[result.identity];
  const ctaLead = t(quizUI.ctaLead).replace("{role}", t(data.role));

  // 9:16 story-image export. We capture a dedicated, fixed-size (1080×1920) card
  // rendered off-screen — never the live card (it's responsive and its gauge
  // accordion state would leak in). On mobile the PNG goes into the native share
  // sheet (→ Instagram story / save to photos); desktop falls back to download.
  const storyRef = useRef<HTMLDivElement>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [host, setHost] = useState("");
  useEffect(() => {
    setHost(window.location.hostname.replace(/^www\./, ""));
  }, []);

  const saveImage = useCallback(async () => {
    const node = storyRef.current;
    if (!node || saving) return;
    setSaving(true);
    try {
      // Dynamic import keeps html-to-image out of the initial bundle.
      const { toBlob } = await import("html-to-image");
      // Wait for Pretendard to be ready before the first paint we capture.
      if (typeof document !== "undefined" && document.fonts?.ready) {
        await document.fonts.ready;
      }
      const opts = { width: 1080, height: 1920, pixelRatio: 1, cacheBust: true, backgroundColor: "#06040f" };
      // iOS Safari drops fonts/images on the FIRST html-to-image pass — render
      // twice and keep the second blob. Logos are self-hosted (/logos), so no
      // CORS taint; the double pass is purely for font/image warm-up.
      await toBlob(node, opts);
      const blob = await toBlob(node, opts);
      if (!blob) throw new Error("capture produced no blob");

      const fileName = `zero100-quiz-${result.resultId}.png`;
      const file = new File([blob], fileName, { type: "image/png" });

      const canShareFiles =
        typeof navigator !== "undefined" &&
        typeof navigator.canShare === "function" &&
        navigator.canShare({ files: [file] });

      if (canShareFiles) {
        try {
          await navigator.share({ files: [file] });
        } catch (err) {
          // User dismissed the share sheet — not a failure, stay silent.
          if ((err as Error)?.name === "AbortError") return;
          throw err;
        }
      } else {
        // Desktop (no file-share support) → download the PNG.
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      }
    } catch {
      setToast(t(quizUI.saveImageError));
      window.setTimeout(() => setToast(null), 2600);
    } finally {
      setSaving(false);
    }
  }, [saving, result.resultId, t]);

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
            </div>
          </div>
        </div>

        {/* apply CTA — sits between the personality card and the match section.
            href carries ?ref=quiz&type=<resultId> so the (placeholder) signup
            link can attribute a lead to the taker's result once it goes live. */}
        <div className="mx-auto w-full max-w-xl rounded-[24px] border border-white/10 bg-white/[0.04] p-6 text-center">
          <p className="text-[15px] font-bold leading-relaxed text-white/85">{ctaLead}</p>
          <a
            href={`${links.signup}?ref=quiz&type=${result.resultId}`}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-4 text-base font-bold text-white shadow-[0_8px_36px_rgba(124,58,237,0.5)] transition hover:-translate-y-0.5"
          >
            {t(quizUI.ctaApply)} →
          </a>
        </div>

        {/* Dream teammates — the two types this result pairs best with, and why. */}
        <DreamTeammates result={result} t={t} reduce={reduce} />

        {/* Save as a 9:16 story image (native share sheet on mobile). */}
        <div className="mx-auto w-full max-w-xl">
          <button
            type="button"
            onClick={saveImage}
            disabled={saving}
            aria-busy={saving}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-6 py-4 text-sm font-bold text-white/90 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <>
                <span className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-white/30 border-t-white" aria-hidden />
                {t(quizUI.saveImageLoading)}
              </>
            ) : (
              <>📸 {t(quizUI.saveImage)}</>
            )}
          </button>
        </div>
      </div>

      {/* Off-screen 9:16 capture target (not display:none — that captures blank). */}
      <div aria-hidden style={{ position: "fixed", top: 0, left: -9999, pointerEvents: "none", zIndex: -1 }}>
        <StoryCard ref={storyRef} result={result} data={data} variant={variant} host={host} t={t} />
      </div>

      {/* error toast (share-sheet cancels stay silent) */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className="fixed bottom-8 left-1/2 z-50 -translate-x-1/2 rounded-full border border-white/15 bg-[#13131f] px-5 py-3 text-sm font-semibold text-white shadow-xl"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── 9:16 story card (capture target) ────────────────────────────────────────
// A fixed 1080×1920 card rendered off-screen and captured to a PNG for Instagram
// stories. Fixed px (not responsive) so the export is pixel-stable regardless of
// viewport. ~180px top/bottom safe margins keep content clear of the story UI
// (profile bar up top, reply bar at the bottom). Gauges only render when the
// visitor actually took the quiz (deep-link `?r=` results carry no `axes`).
const StoryCard = forwardRef<
  HTMLDivElement,
  {
    result: QuizResult;
    data: Result;
    variant: Variant;
    host: string;
    t: (p: { ko: string; en: string }) => string;
  }
>(function StoryCard({ result, data, variant, host, t }, ref) {
  const axes = result.axes && result.axes.length > 0 ? result.axes : null;
  const url = `${host || "builderthon-for-korean-student.vercel.app"}/quiz`;
  return (
    <div
      ref={ref}
      style={{
        width: 1080,
        height: 1920,
        position: "relative",
        overflow: "hidden",
        background: "#06040f",
        color: "#fff",
        fontFamily: '"Pretendard Variable", Pretendard, -apple-system, sans-serif',
      }}
    >
      {/* orbs — same palette as the live page */}
      <div style={{ position: "absolute", top: -180, left: -180, width: 660, height: 660, borderRadius: "50%", background: "radial-gradient(circle, rgba(124,58,237,0.45), transparent 70%)" }} />
      <div style={{ position: "absolute", bottom: -220, right: -180, width: 700, height: 700, borderRadius: "50%", background: "radial-gradient(circle, rgba(6,182,212,0.32), transparent 70%)" }} />

      <div style={{ position: "relative", height: "100%", display: "flex", flexDirection: "column", padding: "180px 84px", boxSizing: "border-box" }}>
        {/* top */}
        <div style={{ textAlign: "center" }}>
          <p style={{ margin: 0, fontSize: 26, fontWeight: 700, letterSpacing: 6, textTransform: "uppercase", color: "rgba(196,181,253,0.9)" }}>✦ {t(quizUI.eyebrow)}</p>
          <h1 style={{ margin: "16px 0 0", fontSize: 66, fontWeight: 900, lineHeight: 1.05, color: "#fff" }}>{t(quizUI.title)}</h1>
          <p style={{ margin: "14px 0 0", fontSize: 22, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: "rgba(255,255,255,0.4)", fontFamily: "ui-monospace, monospace" }}>Zero100 Builderthon</p>
        </div>

        {/* center — identity */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
          <div className={`bg-gradient-to-br ${data.accent}`} style={{ width: 256, height: 256, borderRadius: 56, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 30px 80px -22px rgba(217,70,239,0.5)" }}>
            <ModelGlyph result={data} imgClass="h-[148px] w-[148px] object-contain" emojiClass="text-[128px] leading-none" />
          </div>
          <p style={{ margin: "44px 0 0", fontSize: 30, fontWeight: 600, color: "rgba(255,255,255,0.55)" }}>{t(quizUI.youAre)}</p>
          <h2 style={{ margin: "8px 0 0", fontSize: 72, fontWeight: 900, lineHeight: 1.1, color: "#fff" }}>{t(variant.name)}</h2>
          <p style={{ margin: "14px 0 0", fontSize: 34, fontWeight: 700, color: "rgb(245,208,254)" }}>{data.model} · {result.resultId}</p>
          <p style={{ margin: "28px auto 0", maxWidth: 820, fontSize: 40, fontWeight: 600, lineHeight: 1.4, color: "rgba(255,255,255,0.9)" }}>“{t(data.phrase)}”</p>

          {/* mini axis gauges */}
          {axes && (
            <div style={{ margin: "60px 0 0", width: "100%", display: "flex", flexDirection: "column", gap: 22 }}>
              {axes.map((a) => (
                <div key={a.axis} style={{ display: "flex", alignItems: "center", gap: 20 }}>
                  <span style={{ width: 120, textAlign: "right", fontSize: 27, fontWeight: 700, color: "#fff" }}>{t(axisMeta[a.winner])}</span>
                  <div style={{ flex: 1, height: 16, borderRadius: 999, background: "rgba(255,255,255,0.1)", overflow: "hidden" }}>
                    <div className={`bg-gradient-to-r ${data.accent}`} style={{ height: "100%", width: `${a.pct}%`, borderRadius: 999 }} />
                  </div>
                  <span style={{ width: 84, textAlign: "right", fontSize: 27, fontWeight: 700, fontVariantNumeric: "tabular-nums", color: "#fff" }}>{a.pct}%</span>
                  <span style={{ width: 120, fontSize: 24, color: "rgba(255,255,255,0.3)" }}>{t(axisMeta[a.loser])}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* bottom — call to action + url */}
        <div style={{ textAlign: "center" }}>
          <p style={{ margin: 0, fontSize: 38, fontWeight: 800, color: "#fff" }}>{t(quizUI.storyRetake)} →</p>
          <p style={{ margin: "12px 0 0", fontSize: 30, fontWeight: 600, letterSpacing: 1, color: "rgba(255,255,255,0.45)" }}>{url}</p>
        </div>
      </div>
    </div>
  );
});

// ── Dream teammates ─────────────────────────────────────────────────────────
// The two MBTI/model types this result pairs best with. Type-only, so it renders
// for deep-link (?r=) visitors too — no answer data needed. Each card shows the
// mate's glyph, model · type, catchphrase, the from-this-type reason it clicks,
// and the mate's recommended builderthon role.
function DreamTeammates({
  result,
  t,
  reduce,
}: {
  result: QuizResult;
  t: (p: { ko: string; en: string }) => string;
  reduce: boolean;
}) {
  const data = RESULTS[result.mbti];
  return (
    <motion.section
      initial={reduce ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduce ? 0 : 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="w-full"
      aria-label={t(quizUI.matchTitle)}
    >
      <div className="mb-4 text-center">
        <p className="text-[0.7rem] font-bold uppercase tracking-[0.18em] text-fuchsia-200">
          ✦ {t(quizUI.matchTitle)}
        </p>
        <p className="mx-auto mt-1.5 max-w-md text-sm leading-relaxed text-white/60">{t(quizUI.matchSub)}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {data.match.map((m, i) => {
          const mate = RESULTS[m];
          const why = data.matchWhy[i];
          return (
            <div
              key={m}
              className="flex flex-col rounded-[24px] border border-white/12 bg-[#0c0a18] p-6 text-left"
            >
              <div className="flex items-center gap-3">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${mate.accent} shadow-lg`}>
                  <ModelGlyph result={mate} imgClass="h-6 w-6 object-contain" emojiClass="text-2xl leading-none" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-base font-black leading-tight">{mate.model}</p>
                  <p className="text-xs font-bold text-fuchsia-200/80">{mate.mbti}</p>
                </div>
              </div>

              <p className="mt-4 text-[15px] font-semibold leading-relaxed text-white/90">“{t(mate.phrase)}”</p>
              <p className="mt-2.5 text-sm leading-relaxed text-white/70">{t(why)}</p>

              <div className="mt-auto pt-4">
                <p className="text-[0.65rem] font-bold uppercase tracking-wider text-white/40">{t(quizUI.matchRoleLabel)}</p>
                <span className="mt-1.5 inline-flex items-center gap-1.5 rounded-full border border-fuchsia-400/25 bg-fuchsia-400/[0.08] px-3 py-1.5 text-xs font-bold text-fuchsia-100">
                  ★ {t(mate.role)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </motion.section>
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
