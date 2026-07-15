# Changelog — July 15, 2026 (quiz phase 9)

**Project:** Builderthon marketing site (Next.js)
**Branch:** `main`
**Window covered:** the `/quiz` ninth pass — persist the taker's own result and
greet returning visitors on the main site.

## Summary

The personality-test result now **survives a browser restart**. When a visitor
finishes the quiz we save their result id to `localStorage`; on any later visit
the main site's hero greets them by their AI-model type — **"안녕하세요, 조급한
Mistral님 👋"** — with a one-tap link back to their result. The `/quiz` landing
gains a matching "지난 결과: … · 다시 보기 →" line, and the hero's "성격 테스트" CTA
becomes **"내 결과 보기"** for returning takers.

Crucially, only a result the visitor **took themselves** is ever persisted — a
`?r=` deep-linked friend's result is never saved, so we never greet someone as
the wrong type. First-time visitors (no saved result) see the hero exactly as
before.

---

## Feat — durable own-result store

**User impact:** Finish the quiz once and the site remembers your type across
sessions, greeting you back and shortcutting to your result.
**Technical:**
- `lib/quizResult.ts` (new) — the durable layer, separate from the existing
  sessionStorage own-result key. `saveOwnResult` / `loadOwnResult` /
  `clearOwnResult` over `localStorage` key `z100-quiz-result`, value
  `{ v: 1, resultId, savedAt }`. All SSR-guarded + try/catch (blocked storage →
  silent no-op / null). `loadOwnResult` re-validates the id through
  `parseResultId` and drops the key on any parse/version/validity failure, so a
  future change to the type system can't resurrect a now-invalid type.

## Feat — save only on genuine completion

**Technical:**
- `components/Quiz.tsx` — `saveOwnResult(scored.resultId)` is called **only** in
  `enterResult`, the single genuine-completion path. A `?r=` deep-link never
  reaches `enterResult`, so a friend's shared type is never persisted. A retake
  that completes overwrites the previous type. The existing sessionStorage
  `OWN_KEY` (refresh survival) is untouched; the two now sit side by side.
- The `?r=` effect's `fromShare` check now OR's in a `localStorage` match, so
  reopening **your own** shared link on a later visit (no sessionStorage) still
  reads as your result → plain "다시 테스트하기", not the viral "나도 테스트하기".

## Feat — returning-visitor hero greeting

**User impact:** A greeting pill in the hero (model logo + "안녕하세요, {유형}님 👋"
+ "다시 보러 가기 →") for takers; nothing at all for first-timers.
**Technical:**
- `components/journey/ReturningGreeting.tsx` (new) — client component. Reads
  `loadOwnResult()` in an effect and renders **nothing** until mounted (absent on
  SSR + first client render → no hydration mismatch), then fades in via
  framer-motion (respects `useReducedMotion`). The variant name is derived from
  the stored id at render time (`RESULTS[mbti].variants[identity].name`), so a
  copy change always shows the latest name. Logo uses the same
  `/logos/` + emoji-fallback pattern as the result screen.
- `components/journey/Journey.tsx` — renders `<ReturningGreeting />` atop the hero
  left column, and swaps the hero quiz CTA to `dict.nav.quizResult` ("내 결과 보기")
  linking to `/quiz?r=<id>` when a saved result exists (label/href default to the
  original for non-takers → hydration-safe).
- `data/dictionary.ts` — added `nav.quizResult` ({ ko: "내 결과 보기", en: "View my
  result" }).

## Feat — /quiz landing personalization

**Technical:**
- `components/Quiz.tsx` — the landing screen shows a subtle
  "지난 결과: {유형} · 다시 보기 →" link under the start button for returning takers
  (loaded post-mount → no mismatch), adding a path to their result without ever
  blocking a fresh retake.

---

## QA (localhost:3999)

Verified end-to-end in the browser:
1. Complete the quiz → result `ESTP-T` "조급한 Mistral"; `localStorage` gets
   `{v:1,resultId:"ESTP-T",…}`; main page shows the greeting pill (name + Mistral
   logo); persists across a reload (browser-restart equivalent).
2. Greeting/CTA "다시 보기" → `/quiz?r=ESTP-T` shows **"↻ 다시 테스트하기"** (own), not
   the viral CTA — even on a fresh navigation (localStorage OR-match).
3. Clean state: main page identical to before (no greeting, original "성격 테스트"
   CTA); a friend's `?r=INTJ-A` deep-link neither saves nor greets.
4. Retake picking different answers → `INFJ-A` "흔들림 없는 Claude"; `localStorage`
   overwritten; main greeting updates to the new type + Anthropic logo.
5. Zero hydration/console errors; `npx tsc --noEmit` passes.
