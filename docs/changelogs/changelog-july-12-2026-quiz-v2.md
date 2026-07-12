# Changelog — July 12, 2026 (quiz phase 2)

**Project:** Builderthon marketing site (Next.js)
**Branch:** `quiz-sidon-v2`
**Window covered:** the AI personality test (`/quiz`) second improvement pass, on top of phase 1

## Summary

This pass deepened the `/quiz` result with a research-grounded scoring model and a personalized explanation layer. Three threads: (A) a **Sidon-weighted scoring system** that replaces the flat 67%/100% gauges with 4 distinct % bands per axis and mathematically rules out ties; (B) an **answer-aware explanation layer** that tells each taker *why* their % is what it is, citing their actual answers, rendered as click-to-expand accordions on the gauges; and (C) a **model rebalance** of 5 MBTI↔AI mappings plus a "왜 이 모델" evidence line on all 16 results. Scope stayed on the quiz surface (`data/quiz.ts`, `data/quizExplanations.ts`, `lib/quizScore.ts`, `components/Quiz.tsx`, `app/quiz/page.tsx`, `public/logos`).

---

## Task A — Sidon-weighted scoring

**User impact:** The gauges used to show only 67% or 100% (every axis had total weight 3). Now each axis spreads across 4 distinct bands — MIND 77/83/89/95, ENERGY 77/81/89/93, NATURE 78/82/86/91, TACTICS 76/82/88/94, IDENTITY 81/92 — so the breakdown feels precise and individual. Two new questions bring the quiz to 14 (MIND and TACTICS each go from 2→3 questions).
**Technical:** `data/quiz.ts` — each axis's per-question weights now form a **Sidon set** (all subset sums distinct): MIND {2,4,8}, ENERGY {1,3,6}, NATURE {1,2,5}, TACTICS {1,2,4}, IDENTITY {3,7}; the heaviest weight sits on each axis's most diagnostic scenario. `lib/quizScore.ts` — new `AXIS_CONFIG` (denom/floor/ceil per axis); scoring is now a per-axis ratio `r = firstPoleWeight / denom`, displayed as `bankRound(floor + max(r,1-r)·(ceil−floor))`. Because no subset sums to denom/2, `r` is never 0.5 → ties are impossible (asserted). `AxisScore` gains `pattern: number[]` (pole-based, survives the phase-1 a/b swaps) to key the explanations.

## Task B — Answer-aware explanations

**User impact:** Clicking any gauge row expands a one-line explanation of *why* that %, written from the taker's own answers — e.g. "첫날엔 먼저 말을 걸었지만, 정작 충전은 혼자… 꽤 강하게 89% 내향이에요 🌙." The hedging matches the score band (strong under 78%, none at 91%+). The first axis is open by default; it's a single-open accordion, reduced-motion-safe.
**Technical:** `data/quizExplanations.ts` (new) — a static, precompiled `EXPLANATIONS[axis][pattern]` table (4 MBTI axes × 8 + Identity × 4 = 36 bilingual phrases), O(1) `getExplanation()` with `{pct}` substitution and a graceful null (hide + warn) on a missing key. `components/Quiz.tsx` — the gauge list became `AxisGauges` / `AxisGaugeRow` accordion with a framer-motion height transition and chevron.

## Task C — Model rebalance + "왜 이 모델"

**User impact:** Five type→model mappings were re-grounded in research: INTP → **Meta Llama** (open weights), INFP → **Character.AI** (persona/narrative), ENFP → **Pi** (EQ companion), ESFJ → **Microsoft Copilot** (ambient service helper), ISTP → **Ollama** (local-run hacker). Every result now carries a "왜 이 모델이냐면" line with a concrete, verifiable reason (DeepSeek's ~$5.58M training run, Perplexity's ~21.87 citations/answer, Claude's Constitutional AI, etc.).
**Technical:** `data/quiz.ts` — rewrote the 5 results' copy (model/emoji/logo/phrase/desc/strengths/weakness/variants) while keeping `role`/`roleKey`/`match` (MBTI-derived); added `whyModel: Phrase` to the `Result` interface and all 16 entries; `quizUI.whyModel` label. `components/Quiz.tsx` renders the section under the persona description. Logos: `meta`/`ollama` were already self-hosted from phase 1; Character.AI / Pi / Microsoft Copilot aren't in `simple-icons`, so they use emoji fallbacks (🎭 / 🫂 / 🪁). No new logo files needed; no unused files to remove.

---

## Verification

- `npm run build` passes clean (0 type errors, 0 warnings).
- `scripts/verify-quiz.mjs` (new): for every axis, enumerates all answer combos and confirms ① the displayed %s are the expected distinct bands, ② no combo lands on 50%, ③ `EXPLANATIONS` covers every pattern key with no extras, ④ the 14 questions' per-axis counts/weights match the table. All green; bands match the design table exactly.
- Manual QA (browser): a 14-question run shows 5 gauges at distinct %s (e.g. 89/77/86/76/81 for ISFP-T); clicking a gauge expands its answer-aware explanation (single-open); the "왜 이 모델" section renders; `?r=INTP-A` deep-links to Meta Llama with no gauges/explanations and the viral button.

## Compatibility

Existing `?r=<id>` share links still resolve. The 5 rebalanced types' old shared links now show the new model (intended).
