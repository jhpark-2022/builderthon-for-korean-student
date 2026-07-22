# Changelog — July 22, 2026 (등록 CTA 위계 · 확정 파트너 스트립 · 카카오톡 전환)

**Project:** Builderthon marketing site (Next.js)
**Branch:** `main`
**Window covered:** making registration the unmistakable primary action, putting
the confirmed partners on the first screen, and moving the participant channel
from Telegram to KakaoTalk.

## Summary

Nine commits in one session, driven by screenshots of the running site.

Registration had been competing with a partnership CTA of equal visual weight,
and the hero's register card was a dead box with a text link inside it. Both are
now unambiguous: one glowing gradient pill in the nav, the whole hero card
clickable, and a sticky bottom bar on phones.

The hero gained a confirmed-partner logo strip — the deck cover's CONFIRMED
PARTNERS band — which went through three rounds of correction: flat row →
주최/주관/후원 tiers → vertical stack at a legible size. Each round exposed
something the previous one hid, including a reduced-motion bug that left 13 of
17 partners permanently off-screen on phones.

Then four microcopy lines at the decision points, an already-registered panel
(the "등록 완료 ✓" button had been reopening a blank form), and the Telegram →
KakaoTalk switch now that operations are settled on Kakao.

## Changes

### 1 · 등록 CTA 위계 (`feat(cta)`, `f8d012b`, `582cd97`)

`components/journey/JourneyNav.tsx`, `components/journey/Journey.tsx`.

- **Nav** — register is the only top-level element: violet gradient +
  `shadow-[0_0_20px_rgba(124,92,255,0.4)]`. 파트너십 문의 lost its border and
  fill and is now a plain text link (desktop only).
- **Hero hook card 1** — the whole card is the `<button>`. It used to be a dead
  container with a text link inside, so the obvious tap target did nothing. The
  pill inside is a styled `span`, not a nested control, so it stays one tab stop.
- **Mobile sticky register bar** (`<lg`) — appears once `#about`'s **top** passes
  the viewport top. The brief said "past #about", but its *bottom* is ~2400px
  down on a phone, which would have hidden the bar until three screens in.
  `ScrollToTop` is lifted by the bar height below `lg`; measured at 375px the
  button sits at 663–717px and the bar at 734–812px.

### 2 · 확정 파트너 로고 스트립 (`feat(hero)` + two `fix(hero)`)

`components/journey/Journey.tsx`, `app/globals.css`, `data/dictionary.ts`.

Confirmed partners only — the AXMOS host five, the three student associations,
and the nine confirmed sponsors. The Zero100 network marquee stays out: those
are network companions, not partners of this event. Assets are the existing
`white/trimmed` marks; no new files.

Three rounds, each fixing what the last one obscured:

1. **Flat row** (`f8d012b`) — 14 marks in one line. Read as an undifferentiated
   list; you couldn't tell who runs the event from who funds it.
2. **Tiers** (`2068d63`) — grouped 주최 / 주관 / 후원 inline. Still read as one
   long line, and the scroll fade was wrong (below).
3. **Vertical stack** (`dc3b0d8`) — caption centred above each tier's marks.
   Sizes went from a 14–24px band to **22–38px**: the original was past
   "understated" into "unreadable", with WILT VENTURE BUILDER losing its
   subtitle entirely. Sponsors lead with AWS and Hashed, the two marks a visitor
   recognises without being told. Only the strip is ordered this way — the
   partner section stays grouped by what each sponsor provides.

**Scroll fade removed.** The strip had been sharing `heroFade`, which starts
dropping on the first pixel of scroll and is gone by 35% of the hero. The strip
sits lowest, so it was the last thing to come into view and the first thing the
fade erased — "잠깐 보이고 사라진다". It now just scrolls away with the page,
which also keeps one more element off the scroll-linked repaint path.

### 3 · reduced-motion 모바일 버그 (`fix(hero)`, `fb12240`)

Freezing the mobile marquee for motion-sensitive visitors was right; leaving it
frozen was not. A stopped track sits at `translateX(0)`, so **주최 + the first
three marks were all that was ever on screen** — 주관 and 후원 were parked off
the right edge with no way to reach them. 4 partners visible out of 17.

Under reduced motion the phone now gets the same stacked, wrapping layout the
desktop uses. Taller (90px → 455px), but every partner is actually visible.

`prefers-reduced-motion` is read straight off `matchMedia`. framer's
`useReducedMotion()` was the obvious choice and returned `false` on a browser
where `matchMedia("(prefers-reduced-motion: reduce)").matches` was `true` — not
worth debugging when the platform API is one line and testable.

### 4 · 전환 마이크로카피 (`content(cta)`, `9541c56`)

`data/dictionary.ts`, `components/journey/Journey.tsx`.

Four lines at the decision points:

- **`register.reassure`** — "참가비 무료 · 스크리닝 없음 · 코딩 몰라도 OK ·
  솔로 환영", under the register CTA. `HookCards` is the same component in the
  hero and both mid-page bands, so one key covers all three and the answer can
  never drift between placements.
- **3분 chip** on the CTA (the label is already the longest thing in the card)
  and at the top of the modal, where it's checkable.
- **Name-value line** folded into the partner strip's caption — same claim
  ("these partners are really involved") in specifics, so it didn't need its own
  line. Hidden below `sm`: the phone hero is already tall and this is the one
  line here that's a nice-to-have rather than an objection-remover.
- **Urgency line** under the countdown. There is no cap and no registration
  deadline, so 선착순 / 마감 임박 / 잔여석 would be fabricated pressure. It says
  what registering early actually gets you instead. Static — it must not animate
  alongside the seconds.

**Two deviations from the brief, both confirmed before committing:**

- `"필수는 3칸"` → `"4칸"`. The solo path has four `required` fields
  (name · email · joinType · contact), five with a team. The claim sits directly
  above a form where you can count the asterisks — verified `asterisks === 4`.
- **`register.hookFacts` deleted.** On the mid-page bands it landed two lines
  below the new reassurance line saying nearly the same thing. The new line is a
  superset apart from "팀 1–3인", which is already in the benefits section and
  the modal.

### 5 · 이미 등록한 경우 안내 패널 (`feat(register)`, `33a18e6`)

`components/RegisterModal.tsx`, `lib/RegisterContext.tsx`, `data/dictionary.ts`.

"등록 완료 ✓" was reopening a **blank registration form** — an invitation to
register twice, and nowhere to go for someone wanting to fix a typo. It now
opens a panel pointing at the organizers (mailto with a prefilled subject) and
the open KakaoTalk room.

**No self-serve edit.** `/api/register` writes once and the browser keeps no
registration id, so a later request has no way to prove which row is yours;
opening it on an email address alone would let anyone edit anyone's entry.
Adding it later needs either a device-local edit token or an email magic link,
and both need a DB column. **No schema or API change in this commit.**

Two safeguards worth keeping:

- The copy says **"이 브라우저"**. The flag is device-local — evidence that this
  browser registered, not proof of who is holding it.
- The bypass link is always available and the panel returns on every reopen. A
  shared laptop must never lock the next person out of registering. A `status`
  guard stops the panel covering the success screen after a submit.

### 6 · 텔레그램 → 카카오톡 (`content(register)`, `485c685`)

`data/dictionary.ts`, `components/RegisterModal.tsx`, `app/api/register/route.ts`,
`lib/telegram.ts` → `lib/kakao.ts`.

The form was collecting Telegram handles while the invite was going out on
Kakao, which would have stranded a good share of registrants.

- `links.openChat` now holds the real 오픈채팅 URL
  (`open.kakao.com/o/g6msvcFi` · "싱가폴 한인 학생 AI 빌더톤"). This is the open
  room anyone can join to ask a question; the participant room registrants are
  invited to is a separate, private one.
- Contact field, modal subtitle, success body and the countdown urgency line all
  say KakaoTalk.
- **Normalisation rewritten, not renamed.** Kakao ids are lowercase letters /
  digits / `.` / `_`, 4–20 chars, with no `@` convention and no `t.me`-style
  profile URL — so the stored form is a bare lowercase id, and the parser strips
  the `@`, `카톡:` prefixes and stray case people paste. Unparseable input is
  still stored verbatim: an account with no id set may well type a phone number,
  and losing that contact detail is worse than storing it unnormalised.

**No DB change** — `contact` was always channel-neutral. Its column comment now
says so explicitly.

## Performance

Adding above-fold images to the hero cost LCP twice, and both times the fix came
from measuring rather than guessing. Production build, Slow 4G + 4× CPU, mobile:

| State | LCP |
| --- | --- |
| Baseline (no strip) | 890–967 ms |
| 14 marks, eager @ default priority | 1555 ms |
| 14 marks, eager @ `fetchPriority="low"` | 907 ms |
| 17 marks in tiers, marquee duplicated up front | 1365–1638 ms |
| 17 marks, duplication deferred to post-mount | 939 ms |

Two separate causes:

1. **Network contention.** Fourteen eager images at default priority crowded the
   critical path. `fetchPriority="low"` keeps them non-lazy (no pop-in) while
   yielding the pipe to the hero itself.
2. **Element count.** The marquee duplicates its track for a seamless loop, so
   the tiered version put 51 `<img>` elements above the fold. The first paint now
   renders one copy and duplicates right after mount — the second copy appends
   off-screen to the right, so the swap is invisible.

CLS stayed 0.00 throughout.

## Verification note

Two harness problems worth recording, since both cost time:

- **`take_screenshot` returned an all-black hero repeatedly** while the DOM
  reported `opacity: 1`, `visibility: visible` and a live hit-test at the
  headline's coordinates. Related to the backgrounded-tab issue noted in the
  July 21 changelog but not identical — here the capture, not the reveal state,
  was wrong. Layout was verified by DOM measurement instead.
- **Scroll-linked `useScroll` progress read as 0 at every scroll position** in
  that same session, including on the pre-existing `heroFade` that drives the
  scroll hint. That made the fade curve unmeasurable in-browser, which is part
  of why the strip's fade was removed outright rather than retuned to a value
  that couldn't be checked.

`npx tsc --noEmit` and `npm run build` clean at every commit. The Kakao
normaliser has unit coverage (10 cases, including `"카톡: jhpark"` → `jhpark`,
`"@JHPark"` → `jhpark`, and a phone number passing through unnormalised).

Not verified: the open-chat link was confirmed to render with the real URL but
never opened on a device, no test registration was written to the live Supabase
project, and the mobile marquee's motion was confirmed only by forcing the
animation — this browser has reduced-motion enabled.
