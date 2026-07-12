# Changelog — July 12, 2026 (quiz phase 3)

**Project:** Builderthon marketing site (Next.js)
**Branch:** `quiz-rebalance-v3`
**Window covered:** the `/quiz` third pass — pole rebalance + margin-stretched gauge %

## Summary

Two fixes on top of phase 2. (1) The Sidon weights introduced in phase 2 broke the phase-1 option-lead balance — the swapped questions happened to carry the heaviest weights, tilting the weighted first-option mass to 13:36 so that answering "all first option" always produced ISFP-T. (2) The gauge %s still came from only four fixed values per axis, so results read as "all similar numbers." Both are addressed without touching the 36 explanation phrases (pattern keys are pole-based, and % is `{pct}`-substituted).

---

## Fix 1 — Option-lead pole rebalance

**User impact:** Answering by habit (always the first option) no longer funnels everyone to one type; the weighted first-option split across all axes is now ~47% (was 13:36).
**Technical:** `data/quiz.ts` — swapped a/b on Q1 (I leads) and Q3 (F leads), and reverted the phase-1 swaps on Q6 (E leads) and Q8 (T leads) so the heaviest weight on each axis no longer leads the right pole. Final per-axis a-lead split: MIND E8:I6, ENERGY N4:S6, NATURE T5:F3, TACTICS J3:P4, IDENTITY A3:Tid7 — every axis within |diff| ≤ 4, the best the Sidon sets allow. `scripts/verify-quiz-axes.mjs` rewritten to assert the new invariants (pole pair, Sidon weights, both poles lead somewhere, |a-lead diff| ≤ 4, overall 40–60%).

## Fix 2 — Margin-stretched gauge % + per-taker spice

**User impact:** Gauge %s now spread across the whole band — a barely-won axis reads ~56–60%, a clean sweep ~95% — and two people with the same pattern on one axis but any difference elsewhere see different numbers, so the gauges stop looking like a fixed menu. Same answers always give the same result (shared/retaken links stay stable).
**Technical:** `lib/quizScore.ts` — display % now stretches the win margin `(max(r,1-r) − 0.5) × 2` over each axis's `[floor, ceil]` (base bands: MIND 58/70/83/95, ENERGY 62/70/85/93, NATURE 64/73/82/91, TACTICS 59/71/82/94, IDENTITY 70/92), then adds a deterministic `spice()` in [−2, +2] — a djb2 hash of the full 14-answer sheet + axis id (no `Math.random`). Safe by construction: adjacent base bands sit ≥ 8 apart (so ±2 never blurs a band or the explanation's hedge level) and the lowest base (58) − 2 stays above 50 (so a winner never flips). `data/quizExplanations.ts` header hedge ranges updated to the new values; the 36 phrases are unchanged. `scripts/verify-quiz.mjs` mirrors the margin formula and adds two invariants: adjacent bands ≥ 5 apart, and lowest band − 2 > 50.

---

## Verification

- `node scripts/verify-quiz.mjs` — base bands match the table (58/70/83/95 …), bands ≥5 apart, no ≤50 dip, explanation coverage 8/8 (4/4). ✅
- `node scripts/verify-quiz-axes.mjs` — a-lead 23:26 (47%), every axis |diff| ≤ 4. ✅
- `npx tsc --noEmit` — clean. ✅
- Manual QA (scoring replication): same answer sheet → identical %s; flipping one answer shifts all five gauges; a 2:1 axis shows a high-50s/60s % with an "어느 정도" hedge.
