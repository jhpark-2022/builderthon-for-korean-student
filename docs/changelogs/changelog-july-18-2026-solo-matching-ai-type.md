# Changelog — July 18, 2026 (solo-matching AI-type attach)

**Project:** Builderthon marketing site (Next.js)
**Branch:** `main`
**Window covered:** reworking how the register modal handles the personality-test
(AI type) attachment.

## Summary

The AI-type attach is now **strictly for solo applicants who opt into matching**.
Team applicants and un-matched solos never see any AI-type UI. When a solo matcher
has no saved result on this device, a **quiz round-trip** takes them to the test
and brings them back with their draft intact and the type attached.

`components/RegisterModal.tsx`, `data/dictionary.ts`, `components/Quiz.tsx`,
`data/quiz.ts`, `lib/RegisterContext.tsx`.

## Changes

- **Join type → two options.** "team" and "solo" only; the redundant "looking for
  teammates" option (which duplicated solo + matching) is removed.
- **Team path.** No AI-type UI anywhere. Payload carries `wantsMatching: false`
  and **never** a `quizType`.
- **Solo path.** A "다른 솔로 참가자와 팀 매칭을 원해요 / Match me with other solo
  builders" checkbox. The AI-type block appears **only while it's checked**:
  - **State A** (a saved result exists on this device, via `loadOwnResult()`):
    a confirm card — model glyph + "내 AI 유형: {variant} ({id})" — with
    **"네, 이거예요"** (default: pre-attached, collapses to "✓ AI 유형이 첨부됐어요")
    and **"내 결과가 아니에요 · 다시 테스트"** (→ round-trip).
  - **State B** (none): "아직 테스트를 안 하셨네요 — 3분이면 돼요" + **"테스트 하러
    가기 →"** (→ round-trip).
- **Round-trip.** The CTA saves the whole form draft to `sessionStorage`
  (`z100-register-draft`) and routes to `/quiz?return=register`. On a **genuine
  completion** (not a deep-link view — gated on the result's axes), the quiz
  surfaces a prominent **"등록으로 돌아가기 →"** banner (no auto-redirect) linking to
  `/?register=1&ref=quiz-return`. Back on the main page the modal auto-opens,
  restores every field from the draft, and State A applies pre-attached (the
  completion saved the type to localStorage). The draft is cleared on a
  successful submit.
- **Payload.** `wantsMatching: boolean` (solo only; always `false` for teams);
  `quizType` present **only** when `wantsMatching` is true and this device has a
  saved result (registrant-only).
- **No URL-sourced type.** The AI type is read solely from this device's saved
  result — no cross-device fallback, no manual picker. The quiz apply CTA and
  `RegisterContext` dropped the `?type=` param (apply CTA → `/?register=1&ref=quiz`).

## Verification

- `npx tsc --noEmit` — clean. `npm run build` — compiled successfully, 9/9 pages,
  lint clean.
- Live QA (dev server):
  - **team** (with a saved result present) → no AI checkbox/block anywhere; payload
    `joinType:"team"`, `wantsMatching:false`, `teamName` set, **no `quizType`**.
  - **solo** → checkbox appears; unchecked shows no block; checked shows the AI
    block. With a cleared device (State B), the block prompted the test.
  - **Round-trip (fresh, no result):** filled name/email/contact → checked matching
    → "테스트 하러 가기" → completed all 14 questions (result ESTP-T) → the emerald
    "등록으로 돌아가기 →" banner appeared → tapped it → **modal reopened with the
    field values intact, checkbox still checked, and State A showing "조급한 Mistral
    (ESTP-T)"**. "네, 이거예요" collapsed to "✓ 첨부됐어요"; submit produced
    `joinType:"solo"`, `wantsMatching:true`, `quizType:"ESTP-T"`, `ref:"quiz-return"`,
    single registrant member. Draft cleared on submit.
  - No console/hydration errors throughout.
