# Changelog — August 2, 2026 (mobile: open-chat CTA restored)

**Project:** Builderthon marketing site (Next.js)
**Branch:** `main`
**Scope:** `components/journey/Journey.tsx` (hero CTA row, `MobileStickyBar`,
`MobileRegisterBar`), `data/dictionary.ts` (`stickyBar`). URL and labels reuse
`links.openChat`, `dict.nav.openChat`, `dict.nav.openChatAria` — nothing new is
hardcoded.

## Why

Open chat is the funnel's low-friction entrance — the offer for someone who
isn't ready to register — and on desktop it has a permanent nav button. On a
phone it had **nothing**: that nav button is `lg`-only, the hero passes
`chatSrc={null}` to `HookCards` (correct on desktop, where the nav covers it),
and the only remaining doors were two in-content chips a long way down the page.
The tablet bar did carry one, but as a bare speech-bubble icon with no label.

## What changed

### 1 · Phone sticky bar — `[오픈채팅] [등록하기]`

- Open chat sits **first**, register second: the pair reads low-commitment →
  commitment, and the primary keeps the wider, brighter slot under the thumb.
- **Icon + text label**, never icon alone. A bare bubble in a dark pill is not a
  recognisable KakaoTalk affordance, and this is the CTA a hesitant visitor looks
  for by name.
- External link (`target="_blank" rel="noopener noreferrer"`), `aria-label` from
  `dict.nav.openChatAria`, analytics `track("openchat_click", { src: "sticky" })`
  — the same event name every other placement already uses.
- **The quiz chip ("✦ 내 유형은?") was removed** from this bar and its
  `stickyBar.quiz` key deleted. The quiz already has two permanent phone
  entrances (the nav's ✦ chip, in view at all times, and the hook card in the
  혜택 band); open chat had none. Nothing else referenced the key.
- Both buttons are 54px tall and fit on one line: KR `105 + 241`, EN `127 + 219`
  inside a 366px rail at 375px — no wrapping, no shrunken label.

### 2 · Hero CTA row (below lg)

A labelled ghost open-chat pill now sits beside 파트너십 문의, one tier under the
violet 여정 둘러보기 CTA. `lg:hidden`, so the desktop hero is untouched — there
the nav button is in the same viewport and a second link would be the same offer
twice. Tagged `src: "hero"`.

### 3 · Tablet bar (sm→lg) — two fixes

- Its icon-only chat button now carries the same **"오픈채팅" label**.
- `lg:hidden` → **`hidden sm:block lg:hidden`**. It was rendering *underneath*
  `MobileStickyBar` on phones (that one is `sm:hidden`): two fixed bars at
  `bottom-0`, two register buttons, and after this change two open-chat buttons.
  The phone rail is the pill bar; this one now starts where that one stops.

## Consistency

`OpenChatNudge`, the register modal's success/already screens, the nav button and
all three new placements resolve the same `links.openChat` and fire the same
`openchat_click` event with a `src` tag (`nav` · `sticky` · `hero` · `mobile-bar`
· `band` · `footer` · `modal-exit` · `success` · `already`). The nudge keeps its
own sentence-shaped copy (`register.openChatNudge`) — it's a sentence in a toast,
not a button label.

## Verification

- `npx tsc --noEmit` and `npm run build` pass.
- **375×812 and 375×600**, KR and EN: hero pill renders at 129×52 with
  `target="_blank"`; sticky bar shows exactly two controls, both 54px, one line;
  scroll-down auto-hide and safe-area padding from the previous commit still apply.
- Exactly **one** fixed bottom bar on a phone now (was two after `#about`).
- `.shots/openchat-hero-375-ko.png`, `.shots/openchat-sticky-375-ko.png`
