"use client";

import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { track } from "@vercel/analytics";
import { useLocale } from "@/lib/LocaleContext";
import Confetti from "@/components/Confetti";
import LocaleToggle from "@/components/LocaleToggle";
import {
  QUESTIONS,
  quizUI,
  axisMeta,
  type Axis,
  type MbtiKey,
  type Result,
  type Variant,
} from "@/data/quiz";
import { scoreQuiz, parseResultId, type Choice, type QuizResult, type AxisScore } from "@/lib/quizScore";
import { saveOwnResult, loadOwnResult, type OwnResult } from "@/lib/quizResult";
import { QUIZ_EDITIONS, type QuizEdition, type EditionConfig } from "@/data/quizEditions";
import { getExplanation } from "@/data/quizExplanations";
import { MatchStartFields, MatchSave, loadMatchProfile, saveMatchProfile, matchProfileError, matchCopy, type MatchProfile, type MatchProfileError } from "@/components/match/MatchParts";
import { normalizeMatchCode } from "@/lib/crossingMatch";
import { TITLE, BODY, META, GRADIENT_TEXT } from "@/components/ui/typography";
import { buttonClass, ARROW_CLASS } from "@/components/ui/Button";
import Eyebrow from "@/components/ui/Eyebrow";

type Phase = "landing" | "quiz" | "analyzing" | "result";

// The visitor's OWN result id, stashed in sessionStorage the moment they finish
// the quiz. On a result-screen refresh the ?r= deep-link would otherwise look
// like a friend's share; matching it against this key keeps "my result" =
// "my result" (so a taker sees "다시 테스트하기", not the viral "나도 테스트하기").
// All access is guarded - sessionStorage can throw (private mode, blocked
// storage) - and any failure silently falls back to treating it as a share.
// (OWN_KEY is centralized in lib/storage.ts so the ?reset=1 sweep covers it.)

function readOwnResult(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeOwnResult(key: string, resultId: string): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(key, resultId);
  } catch {
    /* storage blocked - keep old behavior */
  }
}

function clearOwnResult(key: string): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(key);
  } catch {
    /* storage blocked - no-op */
  }
}

// 풀던 답(새로고침, 폰의 뒤로 가기 대비). sessionStorage라 탭을 닫으면 사라집니다. 판마다 키가 다릅니다.
// DECIDED 2026-10-08 (퀴즈와 매칭 리뷰 11): 답이 React 상태에만 있어 현장에서 새로고침 한 번에 처음부터였습니다.
// 키는 판의 ownKey에서 만듭니다(lib/storage.ts의 ?reset=1 청소 목록에는 없습니다. 탭 단위라 남아도 해가 없습니다).
const progressKey = (ownKey: string) => `${ownKey}-progress`;
function readProgress(ownKey: string): { index: number; answers: Choice[] } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(progressKey(ownKey));
    if (!raw) return null;
    const p: unknown = JSON.parse(raw);
    if (typeof p !== "object" || p === null) return null;
    const { index, answers } = p as { index?: unknown; answers?: unknown };
    if (!Array.isArray(answers) || !answers.every((c) => c === "a" || c === "b")) return null;
    if (typeof index !== "number" || !Number.isInteger(index) || index < 0 || index >= QUESTIONS.length || index > answers.length) return null;
    if (answers.length === 0 || answers.length > QUESTIONS.length) return null;
    return { index, answers: answers as Choice[] };
  } catch {
    return null;
  }
}
function writeProgress(ownKey: string, index: number, answers: Choice[]): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(progressKey(ownKey), JSON.stringify({ index, answers }));
  } catch {
    /* storage blocked */
  }
}
function clearProgress(ownKey: string): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(progressKey(ownKey));
  } catch {
    /* storage blocked */
  }
}

// Landing-cluster logos, self-hosted from /public/logos - no CDN dependency.
// `file` is the full filename (ext included) under /public/logos, matching the
// `logo` field on RESULTS. Each still carries an emoji fallback: HeroLogo swaps
// to it if the local file is ever missing, so a tile never renders broken.
const HERO_LOGOS = [
  { file: "deepseek.svg", alt: "DeepSeek", emoji: "🐋" },
  { file: "anthropic.svg", alt: "Claude", emoji: "✳️" },
  { file: "openai.svg", alt: "ChatGPT", emoji: "🤖" },
  { file: "googlegemini.svg", alt: "Gemini", emoji: "✨" },
  { file: "ollama.svg", alt: "Llama", emoji: "🦙" },
  { file: "perplexity.svg", alt: "Perplexity", emoji: "❓" },
];

// Detects an <img> that already failed before React could attach onError (the
// SSR/hydration race for a 404'd src): if it's complete with zero intrinsic
// width, it errored - flip to the emoji fallback.
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

// DECIDED 2026-10-08 (현장 팀 매칭 브리프 3): 판(edition)과 매칭 모드(matchMode)를 고를 수 있습니다.
// 기본값은 8월판이고, /quiz는 아무것도 넘기지 않으므로 그 화면은 전과 픽셀 단위로 같습니다(검증 1).
// 판이 바꾸는 것은 결과 표, 주소, 저장 키뿐입니다(data/quizEditions.ts). 질문과 채점은 같습니다.
export default function Quiz({ edition = "2026-08", matchMode = false }: { edition?: QuizEdition; matchMode?: boolean }) {
  const ed = QUIZ_EDITIONS[edition];
  // 판마다 질문의 글이 다를 수 있습니다(12월판). 극과 가중치와 순서는 QUESTIONS와 같아서 채점은 그대로입니다.
  const questions = ed.questions ?? QUESTIONS;
  // 판의 옷(data/quizEditions.ts의 tone). c(8월 클래스, 나루 클래스)로 고릅니다. 8월판의 문자열은 한 글자도 바뀌지 않습니다.
  const naru = ed.tone === "naru";
  const c = (z: string, n: string) => (naru ? n : z);
  const { t } = useLocale();
  const reduce = useReducedMotion();
  const params = useSearchParams();

  const [phase, setPhase] = useState<Phase>("landing");
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Choice[]>([]);
  const [selected, setSelected] = useState<Choice | null>(null);
  // The question <h2>; focused on each step so the swap is announced (see below).
  const questionRef = useRef<HTMLHeadingElement>(null);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [fromShare, setFromShare] = useState(false);
  // The visitor's DURABLE own result (localStorage), loaded post-mount so it
  // never diverges from SSR. Powers the landing "지난 결과" hint and, on a
  // deep-link, lets us recognise their own type across a browser restart.
  const [ownResult, setOwnResult] = useState<OwnResult | null>(null);
  useEffect(() => {
    setOwnResult(loadOwnResult(ed.resultKey));
  }, []);

  // Came here from the register modal's round-trip (/quiz?return=register)?
  // Captured once on mount, BEFORE enterResult's replaceState strips the param,
  // so the result screen can offer "Back to registration →" after a genuine
  // completion. (Deep-link views carry no axes, so the button stays hidden.)
  // 매칭 모드: 결과 화면에서 프로필(이름, 나라, 트랙 순위)을 고치러 시작 화면으로 돌아온 상태. 무엇이 비었는지 들고 옵니다.
  const [profileFix, setProfileFix] = useState<MatchProfileError | null>(null);
  const [returnToRegister, setReturnToRegister] = useState(false);
  useEffect(() => {
    if (params.get("return") === "register") setReturnToRegister(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Deep-link: ?r=INFJ-A drops a visitor straight onto a result card. Usually
  // that's a friend's share (the viral loop → show "나도 테스트하기"). But if the id
  // matches the one WE stashed, it's the visitor's own result - treat it as
  // theirs (fromShare=false → "다시 테스트하기"). "Ours" = the sessionStorage key
  // (survives a refresh) OR the durable localStorage id (survives a restart), so
  // reopening your own shared link on a later visit still reads as your result.
  useEffect(() => {
    const parsed = parseResultId(params.get("r"));
    if (!parsed) return;
    setPhase("result");
    const saved = loadOwnResult(ed.resultKey);
    const isOwn =
      readOwnResult(ed.ownKey) === parsed.resultId || saved?.resultId === parsed.resultId;
    setFromShare(!isOwn);
    // Revisiting your OWN result (landing "다시 보기", a reopened link, a fresh
    // tab): re-score the stored answers so the per-axis % gauges come back
    // instead of the card rendering axis-less. Only ever for our own saved
    // answers, and only if they still score to this exact type - a scoring
    // change that shifts the outcome falls back to the axis-less card rather
    // than showing percentages that contradict the type on screen.
    const rescored =
      isOwn && saved?.answers?.length === questions.length ? scoreQuiz(saved.answers) : null;
    const restored = rescored?.resultId === parsed.resultId ? rescored : parsed;
    // Keep a freshly-scored result (which carries `axes` for the gauges) when
    // our OWN enterResult → replaceState re-fires this effect with the same id
    // (Next 14.2 syncs replaceState into useSearchParams). A genuine deep-link
    // has no prior result, so it falls through to `restored`.
    setResult((prev) => (prev && prev.resultId === parsed.resultId ? prev : restored));
  }, [params]);

  // Enter the result phase: persist the id (so a refresh keeps it "ours" → the
  // taker still sees "다시 테스트하기"), reflect it in the URL for sharing, then flip
  // the phase. Called straight away (reduced motion) or after the interstitial.
  // This is the ONLY genuine-completion path, so it's the ONLY place we write the
  // durable localStorage result - a `?r=` deep-link never reaches here, so a
  // friend's shared type is never saved as the visitor's own. A retake that
  // completes overwrites the previous type.
  // `taken` is the answer array the result was scored from - persisted alongside
  // the id so a later revisit can re-score it and show the gauges again. It's
  // passed in rather than read from state: the reduced-motion path calls this in
  // the same tick as setAnswers, where the state hasn't flushed yet.
  const enterResult = useCallback((scored: QuizResult, taken: Choice[]) => {
    writeOwnResult(ed.ownKey, scored.resultId);
    saveOwnResult(scored.resultId, taken, ed.resultKey);
    setOwnResult({ resultId: scored.resultId, savedAt: new Date().toISOString(), answers: taken });
    clearProgress(ed.ownKey);
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", `${ed.path}?r=${scored.resultId}`);
    }
    setPhase("result");
  }, []);

  // Analyzing interstitial → result, after ~2.4s. Timer is cleaned up so leaving
  // the page (or hitting Back) mid-analysis never fires setState on an unmount.
  useEffect(() => {
    if (phase !== "analyzing" || !result) return;
    const id = window.setTimeout(() => enterResult(result, answers), 2400);
    return () => window.clearTimeout(id);
  }, [phase, result, answers, enterResult]);

  // ?q1=a|b - the home page's one-question hook was answered inline, so start
  // from that answer instead of throwing it away and asking again. Runs once on
  // mount; anything other than "a"/"b" is ignored.
  // 매칭 모드(/match)에서는 읽지 않습니다. 이름과 나라를 받는 시작 화면을 건너뛰어 끝에서 "올리지 못했습니다"가 됐습니다(2026-10-08).
  useEffect(() => {
    if (matchMode) return;
    const seed = params.get("q1");
    if (seed !== "a" && seed !== "b") return;
    setAnswers([seed as Choice]);
    setIndex(1);
    setPhase("quiz");
    window.history.replaceState(null, "", ed.path);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 풀던 답을 되살립니다(새로고침, 뒤로 갔다가 돌아옴). 결과 딥링크(?r=)나 q1이 있으면 그쪽이 이깁니다.
  // 매칭 모드는 프로필이 온전할 때만 질문으로 바로 갑니다. 아니면 시작 화면에서 채운 뒤 이어서 풉니다.
  const [resumable, setResumable] = useState<{ index: number; answers: Choice[] } | null>(null);
  useEffect(() => {
    if (parseResultId(params.get("r")) || params.get("q1")) return;
    const saved = readProgress(ed.ownKey);
    if (!saved) return;
    if (matchMode) {
      const p = loadMatchProfile();
      if (!p || matchProfileError(p)) { setResumable(saved); return; }
    }
    setAnswers(saved.answers);
    setIndex(saved.index);
    setPhase("quiz");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (phase === "quiz" && answers.length > 0) writeProgress(ed.ownKey, index, answers);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, index, answers]);

  const startQuiz = () => {
    // 시작 화면에서 프로필을 채우고 온 사람에게 풀던 답이 남아 있으면 이어서 풉니다.
    if (resumable) {
      setAnswers(resumable.answers);
      setIndex(resumable.index);
      setSelected(null);
      setResumable(null);
      setPhase("quiz");
      return;
    }
    setAnswers([]);
    setIndex(0);
    setSelected(null);
    setResult(null);
    setFromShare(false);
    setProfileFix(null);
    clearProgress(ed.ownKey);
    clearOwnResult(ed.ownKey);
    // drop the ?r= so a restart doesn't leave a stale result in the URL
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", ed.path);
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
      if (index + 1 < questions.length) {
        setIndex(index + 1);
        setSelected(null);
      } else {
        const scored = scoreQuiz(next);
        setResult(scored);
        // Reduced motion skips the interstitial and jumps straight to the result;
        // otherwise show the "analyzing" beat, which then enters the result.
        if (reduce) {
          enterResult(scored, next);
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
    // 2026-10-08: 여기서 selected에 지난 답을 넣었더니 handleAnswer의 두 번 누르기 방지(selected가 있으면 무시)에
    // 걸려 돌아간 질문에서 아무것도 고를 수 없었습니다. selected는 비우고, 지난 답은 answers[index]로 보여 줍니다.
    setIndex(index - 1);
    setSelected(null);
  };

  // 다시 하기. 매칭 모드에서 프로필이 비었으면(미리 해 본 기기는 트랙 순위가 없습니다) 질문이 아니라 시작 화면으로
  // 갑니다. 그 전에는 14문항을 다시 풀고 같은 "올리지 못했습니다"를 봤습니다(퀴즈와 매칭 리뷰 2).
  const retake = () => {
    if (matchMode) {
      const p = loadMatchProfile();
      const err = p ? matchProfileError(p) : "name";
      if (err) {
        setAnswers([]);
        setIndex(0);
        setSelected(null);
        setResult(null);
        setFromShare(false);
        clearProgress(ed.ownKey);
        clearOwnResult(ed.ownKey);
        if (typeof window !== "undefined") window.history.replaceState(null, "", ed.path);
        setProfileFix(err);
        setPhase("landing");
        return;
      }
    }
    startQuiz();
  };
  // 결과는 그대로 두고 프로필만 고치러 시작 화면으로. 채우면 결과로 돌아오고 MatchSave가 다시 올립니다.
  const fixProfile = (problem: MatchProfileError) => {
    setProfileFix(problem);
    setPhase("landing");
  };

  const current = questions[index];
  const progress = ((index + 1) / questions.length) * 100;

  // Focus the new question after it mounts (both forward and back). preventScroll
  // keeps the page still - the question is already centred in the viewport.
  useEffect(() => {
    if (phase !== "quiz") return;
    const id = window.setTimeout(
      () => questionRef.current?.focus({ preventScroll: true }),
      reduce ? 0 : 300
    );
    return () => window.clearTimeout(id);
  }, [phase, index, reduce]);

  return (
    // id="main": 건너뛰기 링크(components/SkipLink.tsx)가 #main으로 갑니다. 이 화면에는 그 id가 없어 링크가 죽어 있었습니다(2026-10-08).
    <main id="main" tabIndex={-1} className="relative min-h-screen overflow-hidden bg-[#070B1F] text-white focus:outline-none">
      {/* decorative field - same tokens as the main site */}
      <div aria-hidden className="grid-bg pointer-events-none absolute inset-0 opacity-50" />
      {/* 12월판의 빛은 나루의 보라와 자주입니다(#4B3A8C, #9A5A82). 8월판은 그대로. */}
      <div aria-hidden className="orb" style={{ left: "-12%", top: "-10%", width: "42vh", height: "42vh", background: naru ? "rgba(75,58,140,0.5)" : "rgba(124,58,237,0.4)" }} />
      <div aria-hidden className="orb" style={{ bottom: "-14%", right: "-10%", width: "46vh", height: "46vh", background: naru ? "rgba(154,90,130,0.3)" : "rgba(6,182,212,0.3)" }} />
      {/* 질문과 결과 화면에는 h1이 없었습니다(?r= 딥링크는 h1 없는 페이지). 시작 화면은 자기 h1이 있습니다. */}
      {phase !== "landing" && <h1 className="sr-only">{t(ed.ui.title)}</h1>}

      {/* header - widens on the result screen so it lines up with the 2-col layout */}
      <header className={`relative z-10 mx-auto flex h-20 items-center justify-between px-6 ${phase === "result" ? "max-w-5xl" : "max-w-2xl"}`}>
        {/* -my-3 py-3: 터치 면적을 44px로 키우면서 글자 위치는 그대로 둡니다
            (2026-08-17). 그전에는 두 링크 다 높이가 23px이라 손가락으로는
            빗나가기 쉬웠습니다. 아래 '이전' 버튼도 같은 처리입니다. */}
        <a href={ed.backHref} className={`-my-3 inline-flex min-h-[44px] items-center py-3 ${c("text-sm", BODY)} font-semibold text-white/60 transition hover:text-white`}>
          ← {t(ed.ui.back)}
        </a>
        <LocaleToggle />
      </header>

      <div className={`relative z-10 mx-auto flex min-h-[calc(100vh-5rem)] flex-col px-6 pb-12 ${phase === "result" ? "max-w-5xl" : "max-w-2xl"}`}>
        {phase === "landing" && (
          <Landing
            ed={ed} matchMode={matchMode} onStart={startQuiz} t={t} reduce={!!reduce} ownResult={ownResult}
            profileFix={profileFix}
            // 결과가 아직 있으면(프로필만 고치러 온 경우) 테스트를 다시 하지 않고 결과로 돌아갑니다.
            onResume={profileFix && result ? () => { setProfileFix(null); setPhase("result"); } : undefined}
          />
        )}

        {phase === "quiz" && current && (
          <div className="flex flex-1 flex-col pt-4">
            {/* progress */}
            <div className="mb-3 flex items-center justify-between">
              <button type="button" onClick={goBack} className={`-my-3 inline-flex min-h-[44px] items-center gap-1 py-3 pr-3 ${c("text-sm", BODY)} font-semibold ${c("text-white/50", "text-white/60")} transition hover:text-white/90`}>
                ← {t(ed.ui.prev)}
              </button>
              <span className={`font-mono ${c("text-sm", BODY)} font-bold text-white`}>
                {index + 1}
                {/* white/35는 3.14:1이었습니다(접근성 감사 9). */}
                <span className="text-white/55"> / {questions.length}</span>
              </span>
            </div>
            <div
              className="h-2 w-full overflow-hidden rounded-full bg-white/10"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={questions.length}
              aria-valuenow={index + 1}
              aria-label={t(ed.ui.progressLabel)}
            >
              <motion.div
                className={`h-full rounded-full bg-gradient-to-r ${c("from-violet-500 to-cyan-400", "from-naru-purple to-accent")}`}
                animate={{ width: `${progress}%` }}
                initial={false}
                transition={{ duration: reduce ? 0 : 0.4, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>

            {/* Position announcement - the "n / 14" counter above is visual
                only; this is its polite spoken equivalent. */}
            <p className="sr-only" aria-live="polite">
              {t(ed.ui.questionPosition)
                .replace("{n}", String(index + 1))
                .replace("{total}", String(questions.length))}
            </p>

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
                  <p className={c("mb-4 text-xs font-bold uppercase tracking-[0.2em] text-violet-300", `mb-4 ${META} font-bold uppercase tracking-[0.16em] text-accent`)}>
                    {current.id}
                  </p>
                  {/* Focused on every step: the question swaps in place, so a
                      keyboard/screen-reader user was left with focus on the
                      option button they just pressed (or on <body> after it
                      unmounted) and never heard the new question. tabIndex={-1}
                      makes the heading programmatically focusable only. */}
                  <h2
                    ref={questionRef}
                    tabIndex={-1}
                    className={c("text-[1.6rem] font-bold leading-snug tracking-tight outline-none sm:text-[1.8rem]", `break-keep ${BODY} font-black leading-snug tracking-tight text-white outline-none`)}
                  >
                    {t(current.text)}
                  </h2>
                  <div className="mt-8 flex flex-col gap-3.5">
                    {(["a", "b"] as const).map((key) => {
                      const opt = current[key];
                      // 방금 누른 답, 또는 "이전"으로 돌아온 질문의 지난 답. 색만으로는 스크린리더에 전해지지 않아 aria-pressed도 겁니다.
                      const isSel = selected === key || (selected === null && answers[index] === key);
                      return (
                        <button
                          key={key}
                          type="button"
                          aria-pressed={isSel}
                          onClick={() => handleAnswer(key)}
                          className={`flex items-center gap-4 rounded-2xl border p-5 text-left transition ${
                            isSel
                              ? c("-translate-y-0.5 border-violet-400/50 bg-white/[0.08]", "-translate-y-0.5 border-accent/70 bg-white/[0.08]")
                              : "border-white/10 bg-white/[0.04] hover:border-white/20 hover:bg-white/[0.07]"
                          }`}
                        >
                          <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border ${c("text-sm", BODY)} font-bold transition ${
                            isSel ? c("border-violet-400/50 bg-violet-500/20 text-violet-100", "border-accent/70 bg-naru-purple/40 text-white") : "border-white/15 bg-white/[0.04] text-white/60"
                          }`}>
                            {key.toUpperCase()}
                          </span>
                          <span className={`${c("text-base", BODY)} font-semibold leading-snug text-white/90`}>
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

        {phase === "analyzing" && <Analyzing t={t} reduce={!!reduce} naru={naru} />}

        {phase === "result" && result && (
          <ResultView ed={ed} matchMode={matchMode} result={result} t={t} reduce={!!reduce} fromShare={fromShare} onRetake={retake} onFixProfile={fixProfile} returnToRegister={returnToRegister} />
        )}
      </div>
    </main>
  );
}

// ── Landing ──────────────────────────────────────────────────────────────────
function Landing({
  ed,
  matchMode,
  onStart,
  t,
  reduce,
  ownResult,
  profileFix,
  onResume,
}: {
  ed: EditionConfig;
  matchMode: boolean;
  onStart: () => void;
  t: (p: { ko: string; en: string }) => string;
  reduce: boolean;
  ownResult: OwnResult | null;
  /** 매칭 모드: 결과 화면에서 프로필을 고치러 돌아왔을 때 비어 있던 항목. 그 칸에 바로 오류를 보여 줍니다. */
  profileFix?: MatchProfileError | null;
  /** 결과가 이미 있으면 시작 버튼이 테스트를 다시 하지 않고 결과로 돌아갑니다. */
  onResume?: () => void;
}) {
  const naru = ed.tone === "naru";
  const c = (z: string, n: string) => (naru ? n : z);
  // A returning taker gets a subtle "지난 결과: {variantName} · 다시 보기 →" line
  // under the start button - an extra path to their result, never blocking a
  // retake. Derived (not stored) so copy changes always show the latest name.
  // `ownResult` is null on the server + first client render (loaded in an effect),
  // so this is absent then → no hydration mismatch; it just fades in on mount.
  const parsedOwn = ownResult ? parseResultId(ownResult.resultId) : null;
  const ownVariantName = parsedOwn
    ? ed.results[parsedOwn.mbti].variants[parsedOwn.identity].name
    : null;

  // 매칭 모드(/match): 이름과 나라가 있어야 시작합니다(현장 팀 매칭 브리프 3). 이 기기에 넣어 둔 값이 있으면
  // 다시 채웁니다. 8월판(/quiz)에서는 아래 세 줄이 아무 일도 하지 않습니다.
  const [profile, setProfile] = useState<MatchProfile>({ name: "", country: "", tracks: [] });
  const [profileError, setProfileError] = useState<MatchProfileError | null>(null);
  const cleanProfile = (p: MatchProfile): MatchProfile => ({
    name: p.name.trim(), country: p.country.trim().toUpperCase(), tracks: p.tracks, ...(p.code ? { code: p.code } : {}),
  });
  const focusProfileField = (err: MatchProfileError) =>
    document.getElementById(err === "name" ? "match-name" : err === "country" ? "match-country" : "match-tracks")?.focus();
  useEffect(() => {
    if (!matchMode) return;
    let next = loadMatchProfile() ?? { name: "", country: "", tracks: [] };
    // 현장 QR의 주소(/match?code=...)에 실려 온 현장 코드를 받아 둡니다. 참가자가 따로 칠 것이 없습니다.
    try {
      const fromUrl = normalizeMatchCode(new URLSearchParams(window.location.search).get("code"));
      if (fromUrl) { next = { ...next, code: fromUrl }; saveMatchProfile(next); }
    } catch { /* ignore */ }
    setProfile(next);
    // 결과 화면에서 돌아왔으면 비어 있던 칸을 바로 가리킵니다.
    if (profileFix) {
      const err = matchProfileError(next);
      setProfileError(err);
      if (err) window.setTimeout(() => focusProfileField(err), 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchMode]);
  // 온전한 프로필은 바뀔 때마다 저장합니다. 그 전에는 시작 버튼만 저장해서 이름 오타 하나를 고치려면 14문항을
  // 다시 풀어야 했습니다(퀴즈와 매칭 리뷰 6). 고친 뒤 "지난 결과 다시 보기"로 가면 바뀐 이름이 다시 올라갑니다.
  const changeProfile = (p: MatchProfile) => {
    setProfile(p);
    setProfileError(null);
    const clean = cleanProfile(p);
    if (!matchProfileError(clean)) saveMatchProfile(clean);
  };
  const start = () => {
    if (matchMode) {
      const clean = cleanProfile(profile);
      const err = matchProfileError(clean);
      setProfileError(err);
      if (err) { focusProfileField(err); return; }
      saveMatchProfile(clean);
      if (onResume) { onResume(); return; }
    }
    onStart();
  };

  return (
    <motion.div
      className="flex flex-1 flex-col items-center justify-center text-center"
      initial={reduce ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* DECIDED 2026-10-08 (브랜드 감사 2, 4, 9): 12월판은 나루의 Eyebrow, 그라데이션 글자, 버튼, 그리고 글자 크기 셋
          (TITLE/BODY/META)을 씁니다. 8월판의 클래스는 아래 삼항의 앞쪽에 그대로 있습니다. */}
      {naru ? (
        <Eyebrow color="purple">✦ {t(ed.ui.eyebrow)}</Eyebrow>
      ) : (
      <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-violet-400/30 bg-violet-400/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-violet-200">
        ✦ {t(ed.ui.eyebrow)}
      </span>
      )}
      <h1 className={c("text-[2.6rem] font-black leading-[1.05] tracking-tight sm:text-[3rem]", `break-keep ${TITLE} font-black leading-[1.05] tracking-tight`)}>
        <span className={c("gradient-text gradient-text--zero100 bg-gradient-to-r from-violet-300 via-fuchsia-300 to-cyan-300 bg-clip-text pb-[0.12em] text-transparent", GRADIENT_TEXT)}>
          {t(ed.ui.title)}
        </span>
      </h1>
      <p className={`mx-auto mt-5 max-w-md ${c("text-base", BODY)} leading-relaxed text-white/70`}>
        {t(ed.ui.subtitle)}
      </p>
      {/* 매칭 모드에서는 8월 로고 줄 자리에 이름과 나라 입력이 섭니다. */}
      {matchMode ? (
        <MatchStartFields t={t} profile={profile} onChange={changeProfile} error={profileError} />
      ) : (
      <div className="mt-9 flex flex-wrap items-center justify-center gap-2.5">
        {HERO_LOGOS.map((l) => (
          <span key={l.file} className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05]">
            <HeroLogo file={l.file} alt={l.alt} emoji={l.emoji} />
          </span>
        ))}
      </div>
      )}
      {/* Full-width and 56px tall on a phone, sitting low enough to fall in the
          thumb zone. It was a centred inline pill - reachable on a desktop, a
          stretch on a 6" screen where this is the only thing to press. */}
      <button
        type="button"
        onClick={start}
        className={c(
          "group mt-10 inline-flex min-h-[56px] w-full max-w-sm items-center justify-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-9 py-4 text-base font-bold text-white shadow-[0_8px_40px_rgba(124,58,237,0.5)] transition hover:-translate-y-0.5 sm:w-auto",
          `${buttonClass("primary", "naru")} mt-10 min-h-[56px] w-full max-w-sm justify-center sm:w-auto`,
        )}
      >
        {matchMode && onResume ? t(matchCopy.resume) : t(ed.ui.start)}
        <span aria-hidden className={c("transition-transform duration-300 group-hover:translate-x-1", ARROW_CLASS)}>→</span>
      </button>
      <p className={`mt-5 ${c("text-xs", META)} font-medium ${c("text-white/55", "text-white/70")}`}>{t(ed.ui.meta)}</p>

      {/* Returning taker: a low-key link back to their saved result. Fades in
          post-mount (ownResult loads client-side), so it never disrupts the
          landing for a first-time visitor. */}
      {ownResult && ownVariantName && (
        <motion.a
          href={`${ed.path}?r=${ownResult.resultId}`}
          initial={reduce ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className={`mt-6 inline-flex min-h-[44px] items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 ${c("text-xs", META)} font-semibold text-white/70 transition hover:border-white/20 hover:bg-white/[0.09] hover:text-white`}
        >
          <span className="text-white/60">{t(quizLandingHint.lead)}</span>
          <span className={`font-bold ${c("text-violet-200", "text-white")}`}>{t(ownVariantName)}</span>
          <span aria-hidden> </span>
          <span className={c("text-violet-300", "text-accent")}>{t(quizLandingHint.cta)} →</span>
        </motion.a>
      )}
    </motion.div>
  );
}

// Landing "지난 결과" hint copy (returning taker only). Kept local - it's specific
// to this component and not part of the shared quizUI export.
const quizLandingHint = {
  lead: { ko: "지난 결과:", en: "Last result:" },
  cta: { ko: "다시 보기", en: "View again" },
};

// 축 설명 문장을 이 판의 말로. 문장 표(data/quizExplanations.ts)는 두 판이 같이 쓰고, 판에 없는 말만 바꿉니다
// (12월판: "공유회" → "발표"). 8월판은 바꿀 것이 없어 그대로 돌려줍니다.
function explainFor(ed: EditionConfig, axis: Axis, pattern: number[], pct: number): { ko: string; en: string } | null {
  const exp = getExplanation(axis, pattern, pct);
  if (!exp || !ed.explainSwaps) return exp;
  const swap = (text: string, pairs: [string, string][]) => pairs.reduce((acc, [from, to]) => acc.split(from).join(to), text);
  return { ko: swap(exp.ko, ed.explainSwaps.ko), en: swap(exp.en, ed.explainSwaps.en) };
}

// ── Result screen ───────────────────────────────────────────────────────────

function ResultView({
  ed,
  matchMode,
  result,
  t,
  reduce,
  fromShare,
  onRetake,
  onFixProfile,
  returnToRegister,
}: {
  ed: EditionConfig;
  matchMode: boolean;
  result: QuizResult;
  t: (p: { ko: string; en: string }) => string;
  reduce: boolean;
  fromShare: boolean;
  onRetake: () => void;
  onFixProfile: (problem: MatchProfileError) => void;
  returnToRegister: boolean;
}) {
  const naru = ed.tone === "naru";
  const c = (z: string, n: string) => (naru ? n : z);
  // 12월판의 블록 버튼. 페이지의 CTA와 같은 알약 모양입니다(브랜드 감사 10). 8월판은 rounded-2xl 그대로.
  const NARU_PRIMARY = `${buttonClass("primary", "naru")} w-full justify-center`;
  const NARU_GHOST = `${buttonClass("secondary")} w-full justify-center`;
  const data = ed.results[result.mbti];
  const variant = data.variants[result.identity];
  const ctaLead = t(ed.ui.ctaLead).replace("{role}", t(data.role));

  // 9:16 story-image export. We capture a dedicated, fixed-size (1080×1920) card
  // rendered off-screen - never the live card (it's responsive and its gauge
  // accordion state would leak in). On mobile the PNG goes into the native share
  // sheet (→ Instagram story / save to photos); desktop falls back to download.
  const storyRef = useRef<HTMLDivElement>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  // In-app-browser fallback: the captured PNG shown full-screen to long-press.
  const [holdImage, setHoldImage] = useState<string | null>(null);
  const [host, setHost] = useState("");
  useEffect(() => {
    setHost(window.location.hostname.replace(/^www\./, ""));
  }, []);

  // 길게 눌러 저장하는 오버레이(role=dialog)의 포커스. 열리면 닫기 버튼으로 옮기고, Esc로 닫고, Tab은 안에 가두고,
  // 닫히면 저장 버튼으로 돌려줍니다(접근성 감사 10). 그 전에는 포커스가 뒤의 페이지에 남아 있었습니다.
  const saveBtnRef = useRef<HTMLButtonElement>(null);
  const holdCloseRef = useRef<HTMLButtonElement>(null);
  const closeHold = useCallback(() => {
    setHoldImage((cur) => {
      if (cur) URL.revokeObjectURL(cur);
      return null;
    });
    saveBtnRef.current?.focus();
  }, []);
  useEffect(() => {
    if (!holdImage) return;
    const id = window.setTimeout(() => holdCloseRef.current?.focus(), 0);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); closeHold(); }
      // 안에서 포커스를 받을 수 있는 것은 닫기 버튼 하나입니다.
      else if (e.key === "Tab") { e.preventDefault(); holdCloseRef.current?.focus(); }
    };
    document.addEventListener("keydown", onKey);
    return () => { window.clearTimeout(id); document.removeEventListener("keydown", onKey); };
  }, [holdImage, closeHold]);

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
      const opts = { width: 1080, height: 1920, pixelRatio: 1, cacheBust: true, backgroundColor: "#070B1F" };
      // iOS Safari drops fonts/images on the FIRST html-to-image pass - render
      // twice and keep the second blob. Logos are self-hosted (/logos), so no
      // CORS taint; the double pass is purely for font/image warm-up.
      await toBlob(node, opts);
      const blob = await toBlob(node, opts);
      if (!blob) throw new Error("capture produced no blob");

      const fileName = `${ed.fileStem}-${result.resultId}.png`;
      const file = new File([blob], fileName, { type: "image/png" });

      const canShareFiles =
        typeof navigator !== "undefined" &&
        typeof navigator.canShare === "function" &&
        navigator.canShare({ files: [file] });

      if (canShareFiles) {
        try {
          await navigator.share({ files: [file] });
          // Counted only on resolve - a dismissed sheet throws AbortError below.
          track("story_share", { type: result.resultId });
        } catch (err) {
          // User dismissed the share sheet - not a failure, stay silent.
          if ((err as Error)?.name === "AbortError") return;
          throw err;
        }
      } else if (window.matchMedia("(pointer: coarse)").matches) {
        // Mobile in-app browsers (Instagram, KakaoTalk, LINE…) support neither
        // the file share sheet nor <a download> - the click silently did
        // nothing and the visitor was left with no image. Show the PNG instead
        // and tell them to long-press it, which always works.
        setHoldImage(URL.createObjectURL(blob));
        track("story_longpress_shown", { type: result.resultId });
      } else {
        // Desktop → download the PNG, and say so: a file landing in a folder
        // somewhere is otherwise invisible feedback.
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        track("story_download", { type: result.resultId });
        setToast(t(ed.ui.saveImageSaved));
        window.setTimeout(() => setToast(null), 2600);
      }
    } catch {
      setToast(t(ed.ui.saveImageError));
      window.setTimeout(() => setToast(null), 2600);
    } finally {
      setSaving(false);
    }
  }, [saving, result.resultId, t]);

  return (
    <motion.div
      // `relative` so the confetti burst can anchor to the card's own top edge.
      className="relative flex flex-col items-center pb-6 pt-2"
      initial={reduce ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Only for someone who actually finished the quiz - a shared link is a
          stranger's result and gets no celebration. */}
      {!fromShare && <Confetti />}
      {naru ? (
        <Eyebrow color="purple">✦ {t(ed.ui.resultEyebrow)}</Eyebrow>
      ) : (
      <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-white/60">
        ✦ {t(ed.ui.resultEyebrow)}
      </span>
      )}
      {/* 매칭 모드: 결과가 나오는 순간 매칭판에 올리고 그 상태를 보여 줍니다. 공유 링크로 온 사람은 올리지 않습니다. */}
      {matchMode && <MatchSave t={t} result={result} data={data} fromShare={fromShare} onFixProfile={onFixProfile} />}

      {/* Stacked: the shareable result card spans the full width on top, then
          the apply CTA + the match section + actions sit below it. (This said
          "session recommendations" until 2026-08-12 - there are none and there
          never were; the claim was removed from the home-page chip and /quiz's
          metadata in the same pass.) */}
      <div className="flex w-full flex-col gap-6">
        {/* full-width shareable result card */}
        <div
          className={`relative w-full overflow-hidden rounded-[28px] border border-white/[0.12] ${c("bg-[#0c0a18]", "bg-naru-surface")} p-7 text-left sm:p-9`}
          style={{ boxShadow: naru ? "0 30px 70px -28px rgba(75,58,140,0.6)" : "0 30px 70px -28px rgba(217,70,239,0.42)" }}
        >
          <div className={`pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b ${c("from-fuchsia-500/20", "from-naru-purple/30")} to-transparent`} />
          {/* DECIDED 2026-10-09 (사용자: 결과 카드를 더 예쁘게, 더 과감하게): 12월판은 카드가 그 모델의 색을 입습니다.
              로고 뒤와 맞은편 아래에서 색이 번지고, 테두리가 같은 색으로 빛나고, 로고가 오른쪽 위에 크게 비칩니다.
              열여섯 장이 같은 남색이던 것을 유형마다 다른 카드로 보이게 합니다. 8월판(/quiz)은 아래 else 가지 그대로입니다. */}
          {naru && (
            <>
              <div aria-hidden className={`pointer-events-none absolute -left-28 -top-28 h-96 w-96 rounded-full bg-gradient-to-br ${data.accent} opacity-[0.28] blur-3xl`} />
              <div aria-hidden className={`pointer-events-none absolute -bottom-32 -right-24 h-80 w-80 rounded-full bg-gradient-to-br ${data.accent} opacity-[0.12] blur-3xl`} />
              <div
                aria-hidden
                className={`pointer-events-none absolute inset-0 rounded-[28px] bg-gradient-to-br ${data.accent} p-px opacity-60`}
                style={{ WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)", WebkitMaskComposite: "xor", maskComposite: "exclude" }}
              />
              {data.logo && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={`/logos/${data.logo}`} alt="" aria-hidden className="pointer-events-none absolute -right-8 -top-10 h-44 w-44 rotate-12 object-contain opacity-[0.06] sm:-right-10 sm:-top-14 sm:h-80 sm:w-80" />
              )}
            </>
          )}
          {/* Stub header. The event name is long enough that at phone widths the
              wide mono tracking wrapped it - and squeezed the type code into
              "ESTP-/T". Both stay on one line now; the size scales with the
              viewport (capped at the original 0.7rem from ~430px up) and the
              tracking only opens up from `sm`, where the card can carry it. */}
          <div className="relative flex items-center justify-between gap-3">
            <span className={`whitespace-nowrap font-mono ${c("text-[clamp(0.52rem,2.6vw,0.7rem)]", META)} font-bold uppercase tracking-[0.08em] text-white/60 sm:tracking-[0.15em]`}>{t(ed.cardStamp)}</span>
            <span className={`whitespace-nowrap font-mono ${c("text-[clamp(0.52rem,2.6vw,0.7rem)]", META)} font-bold tracking-wider text-white/60`}>{result.resultId}</span>
          </div>

          {/* two columns fill the wide card: identity + gauges on the left,
              strengths / weakness / role / match on the right */}
          {naru ? (
            <>
              {/* 머리: 큰 로고 타일과 이름. 이름의 끝이 모델의 색으로 물듭니다. */}
              <div className="relative mt-7 flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-8">
                <div className="relative shrink-0 self-start sm:self-auto">
                  <div aria-hidden className={`absolute inset-0 rounded-[2rem] bg-gradient-to-br ${data.accent} opacity-60 blur-2xl`} />
                  <div className={`relative flex h-24 w-24 items-center justify-center rounded-[2rem] bg-gradient-to-br ${data.accent} shadow-lg ring-1 ring-white/25 sm:h-32 sm:w-32`}>
                    <ModelGlyph result={data} imgClass="h-12 w-12 object-contain sm:h-16 sm:w-16" emojiClass="text-4xl leading-none" />
                  </div>
                </div>
                <div className="min-w-0">
                  <p className={`${BODY} font-semibold text-white/70`}>{t(ed.ui.youAre)}</p>
                  <h2 className={`mt-1 break-keep ${TITLE} font-black leading-[1.12] tracking-tight`}>
                    <span className={`bg-gradient-to-r from-white via-white ${data.accent.split(" ").find((x) => x.startsWith("to-")) ?? "to-white"} bg-clip-text text-transparent`}>{t(variant.name)}</span>
                  </h2>
                  <p className={`mt-2 ${BODY} font-bold text-accent`}>{data.model} {result.resultId}</p>
                </div>
              </div>

              {/* 대사: 카드 너비의 띠 */}
              <p className={`relative mt-7 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] py-4 pl-6 pr-5 ${BODY} font-semibold leading-relaxed text-white/90`}>
                <span aria-hidden className={`absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b ${data.accent}`} />
                “{t(data.phrase)}”
              </p>

              <div className="relative mt-7 grid gap-8 lg:grid-cols-2 lg:gap-14">
                <div>
                  <p className={`${BODY} leading-relaxed text-white/75`}>{t(data.desc)}</p>
                  <p className={`mt-3 ${BODY} italic leading-relaxed text-white/70`}>{t(variant.line)}</p>
                  <div className="mt-6">
                    <p className={`${META} font-bold uppercase tracking-wider text-white/60`}>{t(ed.ui.roleLabel)}</p>
                    <span className={`mt-2 inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-4 py-2 ${BODY} font-bold text-accent`}>
                      ★ {t(data.role)}
                    </span>
                  </div>
                  <div className="mt-6 rounded-2xl border border-accent/20 bg-accent/[0.05] p-4">
                    <p className={`${META} font-bold uppercase tracking-wider text-accent`}>{t(ed.ui.whyModel)} {data.model}</p>
                    <p className={`mt-1 ${BODY} leading-relaxed text-white/75`}>{t(data.whyModel)}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-5">
                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    <div className="rounded-2xl border border-emerald-300/20 bg-emerald-300/[0.05] p-4">
                      <p className={`${META} font-bold uppercase tracking-wider text-emerald-300`}>{t(ed.ui.strengthsLabel)}</p>
                      <p className={`mt-1 ${BODY} leading-snug text-white/80`}>{t(data.strengths)}</p>
                    </div>
                    <div className="rounded-2xl border border-rose-300/20 bg-rose-300/[0.05] p-4">
                      <p className={`${META} font-bold uppercase tracking-wider text-rose-300`}>{t(ed.ui.weaknessLabel)}</p>
                      <p className={`mt-1 ${BODY} leading-snug text-white/80`}>{t(data.weakness)}</p>
                    </div>
                  </div>
                  {result.axes && result.axes.length > 0 && (
                    <div>
                      <p className={`${META} font-bold uppercase tracking-wider text-white/60`}>{t(ed.ui.axesLabel)}</p>
                      <AxisGauges ed={ed} axes={result.axes} accent={data.accent} t={t} reduce={reduce} />
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
          <div className="relative mt-6 grid gap-8 lg:grid-cols-2 lg:gap-14">
            {/* identity + traits */}
            <div>
              <div className={`flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br ${data.accent} shadow-lg`}>
                <ModelGlyph result={data} imgClass="h-10 w-10 object-contain" emojiClass="text-4xl leading-none" />
              </div>
              <p className={`mt-6 ${c("text-sm", BODY)} font-semibold ${c("text-white/55", "text-white/70")}`}>{t(ed.ui.youAre)}</p>
              <h2 className={c("mt-1 text-[1.7rem] font-black leading-tight tracking-tight sm:text-[2rem]", `mt-1 break-keep ${TITLE} font-black leading-tight tracking-tight`)}>{t(variant.name)}</h2>
              <p className={`mt-1 ${c("text-sm", BODY)} font-bold ${c("text-fuchsia-200", "text-accent")}`}>{data.model} {result.resultId}</p>
              <p className={`mt-4 ${c("text-[15px]", BODY)} font-semibold leading-relaxed text-white/90`}>“{t(data.phrase)}”</p>
              <p className={`mt-3 ${c("text-sm", BODY)} leading-relaxed ${c("text-white/65", "text-white/75")}`}>{t(data.desc)}</p>
              <p className={`mt-3 ${c("text-sm", BODY)} italic leading-relaxed ${c("text-white/55", "text-white/70")}`}>{t(variant.line)}</p>

              {/* Why this model - the research-backed reason the type maps here. */}
              <div className={`mt-4 rounded-2xl border ${c("border-fuchsia-400/15 bg-fuchsia-500/[0.05]", "border-accent/20 bg-accent/[0.05]")} p-3.5`}>
                <p className={`${c("text-[0.7rem]", META)} font-bold uppercase tracking-wider ${c("text-fuchsia-200/70", "text-accent")}`}>{t(ed.ui.whyModel)} {data.model}</p>
                <p className={`mt-1 ${c("text-sm", BODY)} leading-relaxed text-white/75`}>{t(data.whyModel)}</p>
              </div>
            </div>

            {/* strengths / weakness / gauges / role / match */}
            <div className="flex flex-col gap-5">
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3.5">
                  <p className={`${c("text-[0.7rem]", META)} font-bold uppercase tracking-wider text-emerald-300`}>{t(ed.ui.strengthsLabel)}</p>
                  <p className={`mt-1 ${c("text-sm", BODY)} leading-snug text-white/80`}>{t(data.strengths)}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3.5">
                  <p className={`${c("text-[0.7rem]", META)} font-bold uppercase tracking-wider text-rose-300`}>{t(ed.ui.weaknessLabel)}</p>
                  <p className={`mt-1 ${c("text-sm", BODY)} leading-snug text-white/80`}>{t(data.weakness)}</p>
                </div>
              </div>

              {/* Per-axis % gauges - only when the visitor actually took the quiz.
                  Deep-linked (shared) results carry no axes, so this is hidden.
                  Each row is a click-to-expand accordion explaining the % from
                  the taker's own answers. */}
              {result.axes && result.axes.length > 0 && (
                <div>
                  <p className={`${c("text-[0.7rem]", META)} font-bold uppercase tracking-wider text-white/60`}>{t(ed.ui.axesLabel)}</p>
                  <AxisGauges ed={ed} axes={result.axes} accent={data.accent} t={t} reduce={reduce} />
                </div>
              )}

              <div>
                <p className={`${c("text-[0.7rem]", META)} font-bold uppercase tracking-wider text-white/60`}>{t(ed.ui.roleLabel)}</p>
                <span className={`mt-2 inline-flex items-center gap-2 rounded-full border ${c("border-fuchsia-400/30 bg-fuchsia-400/10", "border-accent/40 bg-accent/10")} px-4 py-2 ${c("text-sm", BODY)} font-bold ${c("text-fuchsia-200", "text-accent")}`}>
                  ★ {t(data.role)}
                </span>
              </div>
            </div>
          </div>
          )}
        </div>

        {/* Round-trip return banner - only after a GENUINE completion (axes
            present; a deep-link view has none) that arrived from the register
            modal. Prominent, and never auto-redirects: the visitor taps to go
            back, where the modal restores their draft and attaches this type. */}
        {/* DECIDED 2026-10-08: 이 배너는 8월 등록 모달의 왕복(/quiz?return=register)에서만 켜졌고, 그 모달은 이제 열리지
            않습니다. 링크(/?register=1)는 홈의 12월 등록 공급자가 받아, 등록이 열려 있을 때 폼을 엽니다. 매칭 모드(/match)는
            신청의 일부가 아니라(사용자: "팀 - 전원 현장 편성") 여기서 등록으로 보내지 않습니다. */}
        {!matchMode && returnToRegister && result.axes && result.axes.length > 0 && (
          <div className="mx-auto w-full max-w-xl rounded-[24px] border border-emerald-400/25 bg-emerald-400/[0.06] p-6 text-center">
            <p className="text-[15px] font-bold leading-relaxed text-white/85">{t(ed.ui.ctaBackToRegisterNote)}</p>
            <a
              href="/?register=1&ref=quiz-return"
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-4 text-base font-bold text-white shadow-[0_8px_36px_rgba(16,185,129,0.4)] transition hover:-translate-y-0.5"
            >
              {t(ed.ui.ctaBackToRegister)}
            </a>
          </div>
        )}

        {/* apply CTA - sits between the personality card and the match section.
            2026-08-22 (마감 후 청산): /?register=1&ref=quiz로 등록 모달을 열던
            자리입니다. 등록이 닫혔으니 홈의 #wrap으로 보냅니다 - 결과를 본 사람에게
            지금 내밀 수 있는 다음 걸음. (2026-08-28: 그 섹션이 트랙에서 Day 8
            빌더스 초이스 투표가 되면서 #vote로 옮겼고, 행사가 끝난 8/30에
            마무리 섹션 #wrap이 됐습니다. 2026-09-16: 그 섹션이 8월 페이지에서
            내려갔고, 애초에 `/`는 이제 나루 홈이라 이 링크는 아무 데도 닿지 않는
            앵커였습니다. 나루 홈의 #december로 보냅니다 - 유형 테스트를 막 끝낸
            사람에게 지금 내밀 수 있는 다음 걸음은 다음 이벤트입니다.)
            위의 returnToRegister 배너는 등록 모달에서 건너온 왕복 경로라 이제
            켜지지 않지만, 모달 자체는 살아 있어서 그대로 둡니다. */}
        <div className="mx-auto w-full max-w-xl rounded-[24px] border border-white/10 bg-white/[0.04] p-6 text-center">
          <p className={`${c("text-[15px]", BODY)} font-bold leading-relaxed text-white/85`}>{ctaLead}</p>
          <a
            href="/#december"
            className={c("mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-4 text-base font-bold text-white shadow-[0_8px_36px_rgba(124,58,237,0.5)] transition hover:-translate-y-0.5", `mt-4 ${NARU_PRIMARY}`)}
          >
            {t(ed.ui.ctaApply)} →
          </a>
        </div>

        {/* Dream teammates - the two types this result pairs best with, and why. */}
        <DreamTeammates ed={ed} result={result} t={t} reduce={reduce} />

        {/* Actions: story-image save (primary), then retake. */}
        <div className="mx-auto flex w-full max-w-xl flex-col gap-3">
          {/* Why the save matters - the image is the Day 1 matching ticket, not
              just a share graphic. Above the button so it's read before the tap,
              not after. */}
          <p className={`text-center ${c("text-xs", META)} leading-relaxed ${c("text-violet-100/70", "text-white/70")}`}>
            {t(ed.ui.saveImageTicket)}
          </p>
          {/* Save as a 9:16 story image (native share sheet on mobile). */}
          <button
            type="button"
            ref={saveBtnRef}
            onClick={saveImage}
            disabled={saving}
            aria-busy={saving}
            className={c("inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-6 py-4 text-sm font-bold text-white/90 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60", `${NARU_GHOST} disabled:cursor-not-allowed disabled:opacity-60`)}
          >
            {saving ? (
              <>
                <span className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-white/30 border-t-white" aria-hidden />
                {t(ed.ui.saveImageLoading)}
              </>
            ) : (
              <>📸 {t(ed.ui.saveImage)}</>
            )}
          </button>

          {/* retake. For share-link visitors it becomes the prominent viral CTA
              ("나도 테스트하기") - the loop's key conversion. */}
          {fromShare ? (
            <button
              type="button"
              onClick={onRetake}
              className={c("inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-3.5 text-sm font-bold text-white shadow-[0_8px_30px_rgba(124,58,237,0.45)] transition hover:-translate-y-0.5", NARU_PRIMARY)}
            >
              ✦ {t(ed.ui.retakeViral)}
            </button>
          ) : (
            <button
              type="button"
              onClick={onRetake}
              className={c("inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-6 py-3.5 text-sm font-bold text-white/90 transition hover:bg-white/10", NARU_GHOST)}
            >
              ↻ {t(ed.ui.retake)}
            </button>
          )}
        </div>
      </div>

      {/* Off-screen 9:16 capture target (not display:none - that captures blank). */}
      <div aria-hidden style={{ position: "fixed", top: 0, left: -9999, pointerEvents: "none", zIndex: -1 }}>
        <StoryCard ref={storyRef} ed={ed} result={result} data={data} variant={variant} host={host} t={t} />
      </div>

      {/* Long-press-to-save overlay (in-app browsers - see saveImage). */}
      <AnimatePresence>
        {holdImage && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={t(ed.ui.saveImageHold)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.2 }}
            className="fixed inset-0 z-[70] flex flex-col items-center justify-center gap-4 bg-black/90 px-6 py-8"
          >
            <p className={`text-center ${c("text-sm", BODY)} font-semibold text-white/90`}>
              {t(ed.ui.saveImageHold)}
            </p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={holdImage}
              alt={`${t(variant.name)}, ${result.resultId}`}
              className="max-h-[70vh] w-auto max-w-full rounded-2xl border border-white/15 object-contain"
            />
            <button
              ref={holdCloseRef}
              type="button"
              onClick={closeHold}
              className={c("rounded-2xl border border-white/20 bg-white/10 px-6 py-3 text-sm font-bold text-white", `min-h-[44px] rounded-full border border-white/20 bg-white/10 px-6 py-3 ${BODY} font-bold text-white`)}
            >
              {t(ed.ui.saveImageHoldClose)}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 늘 놓여 있는 알림 자리(접근성 감사 11). 아래 토스트는 나타나는 순간 마운트되어 스크린리더가 읽지 못했습니다.
          이 자리는 처음부터 있고 글자만 바뀌므로 "이미지를 저장했어요"와 오류가 읽힙니다. 보이는 토스트는 장식으로 둡니다. */}
      <p role="status" aria-live="polite" className="sr-only">{toast ?? ""}</p>
      {/* error toast (share-sheet cancels stay silent) */}
      <AnimatePresence>
        {toast && (
          <motion.div
            aria-hidden
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className={`fixed bottom-8 left-1/2 z-50 -translate-x-1/2 rounded-full border border-white/15 bg-[#111A3A] px-5 py-3 ${c("text-sm", BODY)} font-semibold text-white shadow-xl`}
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
    ed: EditionConfig;
    result: QuizResult;
    data: Result;
    variant: Variant;
    host: string;
    t: (p: { ko: string; en: string }) => string;
  }
>(function StoryCard({ ed, result, data, variant, host, t }, ref) {
  const axes = result.axes && result.axes.length > 0 ? result.axes : null;
  const url = `${host || "naru-crossing-seoul.vercel.app"}${ed.path}`;

  // Two axis-explanation highlights below the gauges: the MOST decisive axis
  // (highest %) beside the CLOSEST-CALL axis (lowest %) - a "92% 단정" line next
  // to a "56% 반반" line is the whole gag. Ties resolve to the earlier axis (we
  // scan in AXIS_ORDER and keep the first extreme via strict compare). Only when
  // the taker actually answered (axes present); deep-link results carry none.
  let hiAxis: AxisScore | null = null;
  let loAxis: AxisScore | null = null;
  if (axes) {
    hiAxis = axes[0];
    loAxis = axes[0];
    for (const a of axes) {
      if (a.pct > hiAxis.pct) hiAxis = a;
      if (a.pct < loAxis.pct) loAxis = a;
    }
  }
  // Build each card's copy; a missing explanation (defensive - pattern key gap)
  // silently drops just that card. The low card is skipped if it's the same axis
  // as the high one (all-equal %), so we never show a duplicate.
  const buildCard = (a: AxisScore | null, label: { ko: string; en: string }, tone: "hi" | "lo") => {
    if (!a) return null;
    const exp = explainFor(ed, a.axis, a.pattern, a.pct);
    if (!exp) return null;
    return { tone, label, text: t(exp) };
  };
  const highlightCards = [
    buildCard(hiAxis, quizUI.storyHighlightHi, "hi"),
    loAxis && hiAxis && loAxis.axis !== hiAxis.axis
      ? buildCard(loAxis, quizUI.storyHighlightLo, "lo")
      : null,
  ].filter(Boolean) as { tone: "hi" | "lo"; label: { ko: string; en: string }; text: string }[];

  // Overflow guard: render both cards, then measure whether the bottom CTA gets
  // pushed past the safe line (content bottom = 1740 = 1920 − 180px margin). If
  // so, drop the SECOND card so nothing ever clips off-frame. Runs off-screen and
  // long before the user hits save (the card is always mounted), so it's settled
  // by capture time. Resets whenever the copy changes (new result / locale).
  // The ticket stamp, meme stats and dream-teammate line all landed in this
  // budget, so the guard now steps DOWN one card at a time (2 → 1 → 0) instead
  // of only ever dropping the second. The axis highlights are the most
  // expendable thing on the card: the gauges directly above already carry the
  // same information, just without the joke.
  const bottomRef = useRef<HTMLDivElement>(null);
  const [maxCards, setMaxCards] = useState(2);
  const cardSig = highlightCards.map((c) => c.text).join("|");
  useEffect(() => {
    setMaxCards(2); // re-attempt both cards when the content changes
  }, [cardSig]);
  useEffect(() => {
    if (maxCards === 0) return;
    const el = bottomRef.current;
    if (el && el.getBoundingClientRect().bottom > 1742) setMaxCards((n) => n - 1);
  });
  const shownCards = highlightCards.slice(0, maxCards);

  return (
    <div
      ref={ref}
      style={{
        width: 1080,
        height: 1920,
        position: "relative",
        overflow: "hidden",
        background: "#070B1F",
        color: "#fff",
        fontFamily: '"Pretendard Variable", Pretendard, -apple-system, sans-serif',
      }}
    >
      {/* orbs - same palette as the live page */}
      <div style={{ position: "absolute", top: -180, left: -180, width: 660, height: 660, borderRadius: "50%", background: "radial-gradient(circle, rgba(124,58,237,0.45), transparent 70%)" }} />
      <div style={{ position: "absolute", bottom: -220, right: -180, width: 700, height: 700, borderRadius: "50%", background: "radial-gradient(circle, rgba(6,182,212,0.32), transparent 70%)" }} />

      <div style={{ position: "relative", height: "100%", display: "flex", flexDirection: "column", padding: "180px 84px", boxSizing: "border-box" }}>
        {/* top */}
        <div style={{ textAlign: "center" }}>
          <p style={{ margin: 0, fontSize: 26, fontWeight: 700, letterSpacing: 6, textTransform: "uppercase", color: "rgba(196,181,253,0.9)" }}>✦ {t(quizUI.eyebrow)}</p>
          <h1 style={{ margin: "12px 0 0", fontSize: 60, fontWeight: 900, lineHeight: 1.05, color: "#fff" }}>{t(quizUI.title)}</h1>
          {/* Ticket stamp - dashed border + mono type so it reads as a stub,
              not a logo lockup. Replaces the plain wordmark line: the image is
              a Day 1 matching ticket now, and saying so on the artwork is what
              makes someone keep it in their camera roll. */}
          <div style={{ display: "inline-block", margin: "16px 0 0", border: "3px dashed rgba(196,181,253,0.55)", borderRadius: 18, padding: "12px 26px", background: "rgba(124,58,237,0.12)" }}>
            <p style={{ margin: 0, fontSize: 24, fontWeight: 800, letterSpacing: 3, color: "rgb(221,214,254)", fontFamily: "ui-monospace, monospace" }}>{t(ed.ui.storyTicket)}</p>
          </div>
        </div>

        {/* center - identity */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
          <div className={`bg-gradient-to-br ${data.accent}`} style={{ width: 192, height: 192, borderRadius: 44, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 30px 80px -22px rgba(217,70,239,0.5)" }}>
            <ModelGlyph result={data} imgClass="h-[114px] w-[114px] object-contain" emojiClass="text-[100px] leading-none" />
          </div>
          <p style={{ margin: "24px 0 0", fontSize: 30, fontWeight: 600, color: "rgba(255,255,255,0.55)" }}>{t(quizUI.youAre)}</p>
          <h2 style={{ margin: "6px 0 0", fontSize: 68, fontWeight: 900, lineHeight: 1.1, color: "#fff" }}>{t(variant.name)}</h2>
          <p style={{ margin: "10px 0 0", fontSize: 33, fontWeight: 700, color: "rgb(245,208,254)" }}>{data.model} {result.resultId}</p>
          <p style={{ margin: "18px auto 0", maxWidth: 820, fontSize: 33, fontWeight: 600, lineHeight: 1.4, color: "rgba(255,255,255,0.9)" }}>“{t(data.phrase)}”</p>

          {/* mini axis gauges */}
          {axes && (
            <div style={{ margin: "28px 0 0", width: "100%", display: "flex", flexDirection: "column", gap: 14 }}>
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

          {/* axis-explanation highlights - the B-grade one-liners from the result
              screen, just the most-decisive + closest-call axes. First card violet
              (단정), second cyan (반반), for the visual contrast. Full text, no
              ellipsis; the overflow guard above drops the 2nd card if needed. */}
          {shownCards.length > 0 && (
            <div style={{ margin: "24px auto 0", width: 880, display: "flex", flexDirection: "column", gap: 18 }}>
              {shownCards.map((c) => {
                const hi = c.tone === "hi";
                return (
                  <div
                    key={c.tone}
                    style={{
                      border: `2px solid ${hi ? "rgba(167,139,250,0.6)" : "rgba(34,211,238,0.55)"}`,
                      background: hi ? "rgba(124,58,237,0.12)" : "rgba(6,182,212,0.10)",
                      borderRadius: 28,
                      padding: "24px 30px",
                      textAlign: "left",
                    }}
                  >
                    <p style={{ margin: 0, fontSize: 22, fontWeight: 800, letterSpacing: 2, textTransform: "uppercase", color: hi ? "rgb(196,181,253)" : "rgb(103,232,249)" }}>
                      {t(c.label)}
                    </p>
                    <p style={{ margin: "12px 0 0", fontSize: 31, fontWeight: 600, lineHeight: 1.5, color: "rgba(255,255,255,0.92)" }}>
                      {c.text}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* bottom - meme stats, dream teammate, call to action + url */}
        <div ref={bottomRef} style={{ textAlign: "center" }}>
          {/* Joke stats as three columns of label + number - deliberately NOT
              bars. The axis gauges above are already bars with percentages, and
              a second bar block would read as more of the same real data
              instead of the gag it is. */}
          <div style={{ display: "flex", gap: 16, marginBottom: 26 }}>
            {data.memeStats.map((st) => (
              <div key={st.label.en} style={{ flex: 1, border: "2px solid rgba(255,255,255,0.14)", background: "rgba(255,255,255,0.05)", borderRadius: 22, padding: "18px 10px" }}>
                <p style={{ margin: 0, fontSize: 40, fontWeight: 900, lineHeight: 1, color: "#fff", fontVariantNumeric: "tabular-nums" }}>{st.value}</p>
                <p style={{ margin: "8px 0 0", fontSize: 21, fontWeight: 700, lineHeight: 1.25, color: "rgba(255,255,255,0.55)" }}>{t(st.label)}</p>
              </div>
            ))}
          </div>

          {/* Dream teammate, one line. The result screen carries the full
              two-card version with reasons; at story scale a name is all that
              survives being shrunk into someone's feed. */}
          <p style={{ margin: "0 0 22px", fontSize: 27, fontWeight: 700, color: "rgba(255,255,255,0.65)" }}>
            {t(quizUI.storyMatch)} <span style={{ color: "rgb(245,208,254)" }}>{ed.results[data.match[0]].model} {data.match[0]}</span>
          </p>

          <p style={{ margin: 0, fontSize: 38, fontWeight: 800, color: "#fff" }}>{t(quizUI.storyRetake)} →</p>
          <p style={{ margin: "12px 0 0", fontSize: 30, fontWeight: 600, letterSpacing: 1, color: "rgba(255,255,255,0.45)" }}>{url}</p>
        </div>
      </div>
    </div>
  );
});

// ── Dream teammates ─────────────────────────────────────────────────────────
// The two MBTI/model types this result pairs best with. Type-only, so it renders
// for deep-link (?r=) visitors too - no answer data needed. Each card shows the
// mate's glyph, model · type, catchphrase, the from-this-type reason it clicks,
// and the mate's recommended builderthon role.
function DreamTeammates({
  ed,
  result,
  t,
  reduce,
}: {
  ed: EditionConfig;
  result: QuizResult;
  t: (p: { ko: string; en: string }) => string;
  reduce: boolean;
}) {
  const data = ed.results[result.mbti];
  const naru = ed.tone === "naru";
  const c = (z: string, n: string) => (naru ? n : z);
  return (
    <motion.section
      initial={reduce ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduce ? 0 : 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="w-full"
      aria-label={t(ed.ui.matchTitle)}
    >
      <div className="mb-4 text-center">
        <p className={c("text-[0.7rem] font-bold uppercase tracking-[0.18em] text-fuchsia-200", `${META} font-bold uppercase tracking-[0.16em] text-accent`)}>
          ✦ {t(ed.ui.matchTitle)}
        </p>
        <p className={`mx-auto mt-1.5 max-w-md ${c("text-sm", BODY)} leading-relaxed ${c("text-white/60", "text-white/70")}`}>{t(ed.ui.matchSub)}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {data.match.map((m, i) => {
          const mate = ed.results[m];
          const why = data.matchWhy[i];
          return (
            <div
              key={m}
              className={`flex flex-col rounded-[24px] border border-white/[0.12] ${c("bg-[#0c0a18]", "bg-naru-surface")} p-6 text-left`}
            >
              <div className="flex items-center gap-3">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${mate.accent} shadow-lg`}>
                  <ModelGlyph result={mate} imgClass="h-6 w-6 object-contain" emojiClass="text-2xl leading-none" />
                </div>
                <div className="min-w-0">
                  <p className={`truncate ${c("text-base", BODY)} font-black leading-tight`}>{mate.model}</p>
                  <p className={`${c("text-xs", META)} font-bold ${c("text-fuchsia-200/80", "text-accent")}`}>{mate.mbti}</p>
                </div>
              </div>

              <p className={`mt-4 ${c("text-[15px]", BODY)} font-semibold leading-relaxed text-white/90`}>“{t(mate.phrase)}”</p>
              <p className={`mt-2.5 ${c("text-sm", BODY)} leading-relaxed text-white/70`}>{t(why)}</p>

              <div className="mt-auto pt-4">
                <p className={`${c("text-[0.65rem]", META)} font-bold uppercase tracking-wider ${c("text-white/55", "text-white/60")}`}>{t(ed.ui.matchRoleLabel)}</p>
                <span className={`mt-1.5 inline-flex items-center gap-1.5 rounded-full border ${c("border-fuchsia-400/25 bg-fuchsia-400/[0.08]", "border-accent/40 bg-accent/10")} px-3 py-1.5 ${c("text-xs", META)} font-bold ${c("text-fuchsia-100", "text-accent")}`}>
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
  ed,
  axes,
  accent,
  t,
  reduce,
}: {
  ed: EditionConfig;
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
          ed={ed}
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
  ed,
  axis,
  accent,
  t,
  reduce,
  order,
  isOpen,
  onToggle,
}: {
  ed: EditionConfig;
  axis: AxisScore;
  accent: string; // literal Tailwind gradient classes, reused from the card
  t: (p: { ko: string; en: string }) => string;
  reduce: boolean;
  order: number;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const explanation = explainFor(ed, axis.axis, axis.pattern, axis.pct);
  const naru = ed.tone === "naru";
  const bar = (
    <>
      <span className="w-11 shrink-0 text-right text-xs font-bold text-white/85">{t(axisMeta[axis.winner])}</span>
      <div className={`relative ${naru ? "h-2.5" : "h-2"} flex-1 overflow-hidden rounded-full bg-white/10`}>
        <motion.div
          className={`h-full rounded-full bg-gradient-to-r ${accent}`}
          initial={reduce ? false : { width: 0 }}
          animate={{ width: `${axis.pct}%` }}
          transition={{ duration: reduce ? 0 : 0.7, ease: [0.22, 1, 0.36, 1], delay: reduce ? 0 : 0.15 + order * 0.08 }}
        />
      </div>
      <span className="w-9 shrink-0 text-right font-mono text-xs font-bold tabular-nums text-white/85">{axis.pct}%</span>
      {/* 진 쪽 이름. white/30은 2.61:1이었습니다(접근성 감사 9). 두 판 모두 white/55. */}
      <span className="w-11 shrink-0 text-xs font-medium text-white/55">{t(axisMeta[axis.loser])}</span>
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
          className="shrink-0 text-white/55"
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
            <p className={`${naru ? "mb-2 mt-1 border-l border-white/15 pl-3 sm:ml-[3.375rem]" : "px-1 pb-2 pt-0.5"} ${naru ? META : "text-[13px]"} leading-relaxed ${naru ? "text-white/75" : "text-white/65"}`}>{t(explanation)}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── "Analyzing…" interstitial ───────────────────────────────────────────────
// A spinner + three copy lines that swap on an ~0.8s cadence (≈2.4s total, the
// parent's timer). Only mounted on the non-reduced-motion path.
function Analyzing({ t, reduce, naru }: { t: (p: { ko: string; en: string }) => string; reduce: boolean; naru: boolean }) {
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
    <div
      role="status"
      aria-live="polite"
      className="flex flex-1 flex-col items-center justify-center py-16 text-center"
    >
      <motion.div
        className={`h-14 w-14 rounded-full border-[3px] border-white/15 ${naru ? "border-t-accent" : "border-t-violet-400"}`}
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
            className={`${naru ? BODY : "text-lg"} font-bold text-white`}
          >
            {t(messages[step])}
          </motion.p>
        </AnimatePresence>
      </div>
      <div className="mt-6 flex gap-1.5">
        {messages.map((_, i) => (
          <span
            key={i}
            className={`h-1.5 w-1.5 rounded-full transition-colors ${i <= step ? (naru ? "bg-accent" : "bg-violet-400") : "bg-white/15"}`}
            aria-hidden
          />
        ))}
      </div>
    </div>
  );
}
