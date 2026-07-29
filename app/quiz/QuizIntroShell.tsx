import { quizUI } from "@/data/quiz";

// ─────────────────────────────────────────────────────────────────────────────
// SERVER-RENDERED INTRO SHELL — what /quiz paints before any JS runs.
//
// Quiz reads useSearchParams (the ?r= deep link), which opts its whole subtree
// out of server rendering. The Suspense fallback was `min-h-screen bg-[#06040f]`,
// i.e. a black rectangle: someone tapping through from the home page got a blank
// screen until the bundle landed, which is a hard place to lose a visitor who
// was only mildly curious in the first place.
//
// This renders the same first frame the real Landing does — eyebrow, title,
// subtitle, logo row, button — from static markup, so the page is legible
// immediately and hydration swaps like-for-like.
//
// LOCALE: Korean, because that is LocaleProvider's default. These two must not
// diverge — the shell paints, then hydration renders with the provider's default,
// then the effect applies the saved preference. Matching them makes that one
// swap at most; mismatching them makes it two, with a visible flash in between.
//
// Keep the box metrics (chip height, title clamp, button min-height) in step
// with Landing in components/Quiz.tsx — that is what keeps the handover from
// shifting anything.
// ─────────────────────────────────────────────────────────────────────────────
const SHELL_LOGOS = ["🐋", "✳️", "🤖", "✨", "🦙", "❓"];

export default function QuizIntroShell() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#06040f] text-white">
      <div aria-hidden className="grid-bg pointer-events-none absolute inset-0 opacity-50" />
      <div className="relative z-10 mx-auto flex min-h-screen max-w-2xl flex-col px-6 pb-12">
        <div className="h-20 shrink-0" />
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-violet-400/30 bg-violet-400/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-violet-200">
            ✦ {quizUI.eyebrow.ko}
          </span>
          <h1 className="text-[2.6rem] font-black leading-[1.05] tracking-tight sm:text-[3rem]">
            <span className="bg-gradient-to-r from-violet-300 via-fuchsia-300 to-cyan-300 bg-clip-text pb-[0.12em] text-transparent">
              {quizUI.title.ko}
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-white/70">
            {quizUI.subtitle.ko}
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-2.5">
            {SHELL_LOGOS.map((e, i) => (
              <span
                key={i}
                aria-hidden
                className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-xl"
              >
                {e}
              </span>
            ))}
          </div>
          {/* Shaped like the real button but inert — it cannot start the quiz
              before the bundle lands, and a control that looks pressable and
              isn't is worse than one that reads as still loading. */}
          <div
            aria-hidden
            className="mt-10 flex min-h-[56px] w-full max-w-sm items-center justify-center rounded-full bg-gradient-to-r from-violet-600/60 to-indigo-600/60 px-9 py-4 text-base font-bold text-white/70 shadow-[0_8px_40px_rgba(124,58,237,0.35)] sm:w-auto"
          >
            {quizUI.start.ko}
          </div>
          <p className="mt-5 text-xs font-medium text-white/40">{quizUI.meta.ko}</p>
        </div>
      </div>
    </main>
  );
}
