# Changelog — July 13, 2026 (quiz phase 5)

**Project:** Builderthon marketing site (Next.js)
**Branch:** `main`
**Window covered:** the `/quiz` fifth pass — result screen re-architecture

## Summary

Reworked the result screen from *card → CTA → session recommendations → share*
to *card → CTA → **dream-teammate section** → share*. The session recommender
(matching takers to Day 2–5 sessions) is retired entirely and replaced by a
"환상의 궁합 (Dream teammates)" section that shows the two types a result pairs
best with **and why**, in the same B-grade self-roast tone as the axis
explanations. The apply CTA moves up between the personality card and the match
section and now carries a `?ref=quiz&type=<resultId>` attribution query.

---

## Feat — dream-teammate match section

**User impact:** Below the result card, two cards show each best-fit type's
logo, model · MBTI, catchphrase, a from-your-type reason it clicks, and their
recommended builderthon role. Renders for `?r=` deep-link visitors too (it's
type-only — no answer data needed).
**Technical:** `data/quiz.ts` — new `matchWhy: [Phrase, Phrase]` field on every
`Result`, index-aligned to `match` (32 reasons, ko/en). Each reason weaves the
two models' real identities into a concrete complementarity ("my weak spot,
their strong one") and A→B / B→A are written from each side's POV without
contradicting. `components/Quiz.tsx` — new `DreamTeammates` component; the
in-card "환상의 궁합" chip row is removed (promoted to this section, no dup). New
`matchTitle`/`matchSub`/`matchRoleLabel` copy; the card-only `matchLabel` key is
gone.

## Refactor — retire session recommendations

**User impact:** No more "추천받기 → 세션 목록" panel on the result screen.
**Technical:** Deleted `lib/eventMatch.ts`; removed `EventRecsPanel`, the `picks`
state / `onRecommend` flow, and the `rec*` `quizUI` copy. Removed the orphaned
`/?event=<id>#program` deep-link handler in `components/journey/Journey.tsx`
(its only producer was the rec panel). Retitled the main-site quiz CTA eyebrow
from "세션 추천 / session picks" to "환상의 궁합 / dream teammates".

## Feat — mid-page signup CTA + ref attribution

**User impact:** The apply CTA sits between the personality card and the match
section (final order: card → CTA → 궁합 → share/retake).
**Technical:** New `links.signup` constant in `data/dictionary.ts` (placeholder
→ `#program` anchor for now, with a `TODO` to swap when the form opens). The CTA
href is `${links.signup}?ref=quiz&type=<resultId>` so a lead can be attributed
to the taker's result once the form is wired up.

---

## Verification

- `npx tsc --noEmit` — clean. ✅
- `node scripts/verify-quiz.mjs` — Sidon/explanation invariants hold **and** the
  new guard confirms 16 results × 2 = 32 matchWhy phrases, all ko/en,
  match↔matchWhy aligned. ✅
- `node scripts/verify-quiz-axes.mjs` — a-lead balance intact. ✅
- Manual QA (dev @ :3999): result order card → CTA → 궁합 → share; no in-card
  match chip; two teammate cards render with reasons; `?r=INTJ-A` deep-link
  shows the match section; CTA href carries `?ref=quiz&type=INTJ-A`; mobile
  width stacks cleanly.
