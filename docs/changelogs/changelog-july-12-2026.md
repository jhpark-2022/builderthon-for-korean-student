# Changelog — July 12, 2026

**Project:** Builderthon marketing site (Next.js)
**Branch:** `quiz-improvements`
**Window covered:** the AI personality test (`/quiz`) improvement pass

## Summary

This cycle hardened and deepened the "당신의 AI 모델은?" personality test (`/quiz`). Four threads: (1) a **scoring-fairness fix** that removes a systematic ENTJ-A skew caused by every question putting the same pole first; (2) a **refresh bug fix** so a taker's own result stops masquerading as a friend's share; (3) **result-screen depth** — per-axis % gauges, an "analyzing" interstitial, and A/T identity now shaping session picks; and (4) **tech-debt cleanup** — self-hosted brand logos (no more simpleicons CDN), personalized recommendation copy, and progress-bar accessibility. Scope was limited to the quiz surface (`app/quiz`, `components/Quiz.tsx`, `data/quiz.ts`, `lib/quizScore.ts`, `lib/eventMatch.ts`, `public/logos`); the main page and background scenes were untouched.

---

## Bug Fixes

### First-choice bias removed (systematic ENTJ-A skew)
**User impact:** All 12 questions used to place the E/N/T/J/A pole as option `a`, so anyone who habitually taps the first option was funneled toward ENTJ-A. Six questions (Q4·Q6·Q7·Q8·Q10·Q12) now lead with the opposite pole, so both ends of every axis appear first at least once. Weighted first-position now nets 8:7 instead of 15:0. As a live check: answering "always A" now yields **ENFP-A**, not the old ENTJ-A.
**Technical:** `data/quiz.ts` — swapped the `a`/`b` objects (label + pole move together, so `scoreQuiz` is untouched — it reads `q[choice].pole`). Per-axis weight totals stay odd (3), preserving the no-tie invariant. Verified by `scripts/verify-quiz-axes.mjs`.

### Own result no longer reads as a friend's share on refresh
**User impact:** Finishing the quiz writes `?r=<id>` to the URL. Refreshing that page used to treat it as an inbound share — showing the viral "나도 테스트하기" button on your *own* result. Now a refresh keeps it as your result with the correct "다시 테스트하기" button.
**Technical:** `components/Quiz.tsx` — the finished result id is stashed in `sessionStorage` (`z100-quiz-own`, fully guarded against private-mode throws). The deep-link effect compares `?r=` against it: match → own result (`fromShare=false`), else → share. Retake clears the key and resets the URL to `/quiz`. Also fixed an interaction with Next 14.2 syncing `replaceState` into `useSearchParams`, which was wiping the freshly-scored result's axis data on result entry (functional `setResult` now preserves the in-memory result when the id matches).

---

## New Features

### Per-axis % gauges on the result card
**User impact:** The result now shows a five-row "성향 분석" breakdown — winning pole + %, an accent-gradient bar (animated 0→pct, reduced-motion-safe), and the losing pole faint. Only appears when you actually took the quiz; shared links (which carry no per-answer data) hide it.
**Technical:** `lib/quizScore.ts` returns an optional `axes: AxisScore[]`; `data/quiz.ts` adds `AXIS_ORDER`, `AXIS_POLES`, and `axisMeta` (bilingual pole labels); `components/Quiz.tsx` renders the `AxisGauge` rows.

### "Analyzing…" interstitial
**User impact:** After the last answer, a ~2.4s beat with a spinner and three rotating lines ("답변 패턴 분석 중… → 16개 AI 모델과 대조 중… → 당신의 모델 확정!") builds anticipation before the reveal. Reduced-motion skips straight to the result; deep-links never show it.
**Technical:** `components/Quiz.tsx` — new `"analyzing"` phase with a cleaned-up timer; copy in `data/quiz.ts` (`quizUI.analyzing`).

### Identity (A/T) now shapes session recommendations
**User impact:** INFJ-A vs INFJ-T now get meaningfully different session picks — Assertive leans toward self-driven build time, Turbulent toward 1:1 mentoring. Still fully deterministic, so a shared link shows the same picks.
**Technical:** `lib/eventMatch.ts` — `IDENTITY_BONUS` (T→mentoring, A→build) layered onto the existing role + MIND weights.

---

## Enhancements

### Self-hosted brand logos (dropped the simpleicons CDN)
**User impact:** Logos on the result card, dream-teammate chips, and landing tiles now load from `/public/logos` instead of `cdn.simpleicons.org` (whose `openai` slug had been 404-ing). No third-party request for a brand mark. Mistral and Suno — previously emoji-only — now show real marks. Grok, Midjourney, Character.AI, Pi keep their emoji (no confidently-correct slug in the package); OpenAI/Cohere aren't in the package either and fall back to emoji.
**Technical:** `scripts/copy-logos.mjs` copies the used slugs from the `simple-icons` npm package into `public/logos` with a white fill; `components/Quiz.tsx` points `HeroLogo`/`ModelGlyph` at the local files and hardens the emoji fallback for images that 404 during hydration; `data/quiz.ts` fills the Mistral/Suno `logo` fields.

### Personalized recommendation copy (role × category)
**User impact:** Recommendation reasons now read differently for a strategist vs a builder vs a designer vs a growth type, instead of one line per session category.
**Technical:** `lib/eventMatch.ts` — `REC_REASON[roleKey][category]` (16 bilingual lines) with the old `CATEGORY_REASON` retained as a fallback.

### Progress-bar accessibility
**User impact:** Screen readers now announce quiz progress.
**Technical:** `components/Quiz.tsx` — `role="progressbar"` + `aria-valuemin/max/now` + a bilingual `aria-label` (`quizUI.progressLabel`).

---

## Verification

- `npm run build` passes clean (0 type errors, 0 warnings).
- `scripts/verify-quiz-axes.mjs`: every axis carries its correct pole pair, weight sums = 3, first-position tally 8:7.
- Manual QA (browser): full run → analyzing → result with gauges; own-result refresh keeps result + correct button; incognito `?r=INFJ-T` → result, no gauges, viral button; retake clears `?r=`; INFJ-A vs INFJ-T recommendations differ and are stable; all logos load locally (0 simpleicons.org requests).
