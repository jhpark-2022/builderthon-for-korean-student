# Changelog — July 18, 2026 (register flow)

**Project:** Builderthon marketing site (Next.js)
**Branch:** `main`
**Window covered:** the home-page CTA restructure + registration modal.


> **Superseded (July 22, 2026):** the participant channel moved from Telegram
> to KakaoTalk — the contact field now asks for a 카카오톡 ID and `lib/telegram.ts`
> became `lib/kakao.ts`. Telegram references below describe what shipped on this
> date and are left as written. See
> `changelog-july-22-2026-cta-hierarchy-partner-strip.md`.

## Summary

The main page now routes visitors down a clear branch — *need a team → take the
personality test* vs *solo / already have a squad → register* — and gains a real
6-field registration modal. The always-visible nav "등록하기" is replaced by a
button that only appears once the visitor reaches the "취지 / Why" chapter, then
persists. Also reverts the team size to **1–3** (organizer override of the deck's
1–5). All copy is bilingual `{ ko, en }`; the modal reuses the existing
EventModal/PartnerModal dialog pattern and design tokens.

---

## 1 · Question-hook hero CTAs (`feat(home): question-hook hero CTAs`)

`components/journey/Journey.tsx`, `data/dictionary.ts`. Under the primary
"8일의 여정 둘러보기" button, two hook cards (two-up from sm, stacked on mobile):

- **"팀이 필요하신가요?" → ✦ 성격 테스트** — links to `/quiz`, keeping the
  returning-taker deep link (`/quiz?r=<id>` → "내 결과 보기").
- **"외로운 늑대? 아니면 이미 팀이 있다면" → 등록하기** — opens the register modal.

Replaces the old standalone quiz button (folded into hook #1).

## 2 · Scroll-revealed register button (`feat(home): scroll-revealed register button`)

`components/journey/JourneyNav.tsx`. The header keeps only **파트너십 문의 +
EN/KR toggle**; the register button is gone from the initial view. An
`IntersectionObserver` on `#about` (CH 1 · the "취지 · Why this exists" chapter)
reveals it the first time that section is reached — it fades/slides in
(framer-motion, `useReducedMotion` aware) and then **persists** (the observer
disconnects on first intersection, so scrolling back above `#about` never hides
or flickers it). Shows "등록 완료 ✓" once the visitor has registered.

## 3 · 6-field register modal (`feat(home): 6-field register modal w/ quiz-type attach`)

`components/RegisterModal.tsx` (new), `lib/RegisterContext.tsx` (new),
`app/page.tsx`, `data/dictionary.ts`, `components/Quiz.tsx`.

- **Modal** reuses the PartnerModal pattern (portal · backdrop · ESC + Tab
  focus-trap · body scroll-lock · inert background · focus restore · mobile
  bottom-sheet). Six fields exactly: name*, email* (format-checked), school
  (select · "기타" reveals a text input), contact* (Telegram ID, "@username"
  placeholder), participation (select · "solo" reveals a matching checkbox),
  interested track (재무 · 영업 · 마케팅 입문 · 아직 모르겠어요). Required =
  name/email/contact.
- **Quiz type auto-attach** (not a field): URL `?type=` wins, else
  `loadOwnResult()`; shown as a chip ("내 AI 유형: 조급한 Mistral (ESTP-T) — …")
  with a take-the-test fallback link when absent.
- **Submit**: posts to `REGISTER_ENDPOINT` (dictionary.ts, empty for now →
  `console.info` the payload + a ~1s simulated submit → success state). A URL
  there switches it to a JSON POST. On success sets `z100-registered` so the nav
  button flips to "등록 완료 ✓".
- **Shared state**: `RegisterContext` (mounted in `app/page.tsx`) owns the single
  modal instance above the Journey/JourneyNav siblings, and handles the
  `?register=1&type=&ref=` auto-open (stripping the query afterward).
- **/quiz result CTA** now deep-links to `/?register=1&type=<resultId>&ref=quiz`.

## 4 · Team size 1–3 (`content: team size 1–3, not 1–5`)

Reverts the deck-sourced "팀 1–5인" back to **1–3** (organizer override) in the
solo FAQ answer and the "other perks" incentive.

---

## Verification

- `npx tsc --noEmit` — clean. `npm run build` — compiled successfully, 9/9 pages,
  lint clean.
- Live QA (dev server, fresh session): ① no nav register button at load → reveals
  at `#about` → persists ✓ · ② two hero hooks render (stack on mobile) ✓ · ③ modal
  6 fields, required validation (3 errors on name/email/contact), success state,
  ESC close ✓ · ④ quiz type chip auto-shown (ESTP-T → 조급한 Mistral) ✓ ·
  ⑤ `/?register=1&type=…&ref=quiz` auto-opens + strips the query ✓ · ⑥ EN toggle
  switches all copy and the nav button reads "Registered ✓" ✓.
- Console clean — **zero hydration warnings**; submit payload logged via
  `console.info` (pre-backend shape check).
