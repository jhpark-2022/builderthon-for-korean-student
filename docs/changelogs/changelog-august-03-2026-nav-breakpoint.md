# Changelog — August 3, 2026 (데스크톱 내비 브레이크포인트 `lg` → `xl`)

**Project:** Builderthon marketing site (Next.js)
**Branch:** `main`
**Scope:** `components/journey/JourneyNav.tsx`, `app/globals.css`
(`scroll-padding-top` band). No copy, no new component, no data.

## What was reported, and what it actually was

Reported: in **EN at 1280px** the "AI Builderthon" lockup printed on top of the
first nav links. Measuring it turned up a bigger fault underneath — the desktop
nav row **overflowed in both locales across the whole `lg`→`xl` band**, and the
1280 overlap was just its mildest symptom.

Measured inside a 1024px bar (content width 934px after `px-10`, which is 45px at
this site's 112.5% root):

| | brand | + anchor row | + right group | total needed |
|---|---|---|---|---|
| KR | 171 | 509 | 324 | **1139px** |
| EN | 171 | 577 | 323 | **1201px** |

Nothing wrapped, because every nav label is `whitespace-nowrap`. So flex did the
only thing left: it shrank the one item that could give — the brand link. At
1024px **the zero100 wordmark was crushed from 171px to 50px** and the EN/KR
toggle sat off the right edge of the screen. At 1280 the row itself fitted and
only the suffix overflowed its own flex item, printing over "Why" and "Who".

The previous fix in this file had treated the 1280 case as a suffix problem and
hidden the suffix from `lg` to `xl`. That was the right diagnosis for the wrong
variable: the constraint is the **row**, not the lockup.

## The fix — the inline row starts where it fits

`lg` (1024) → `xl` (1280) for everything that makes the bar a one-row desktop
header, so 1024–1279 gets the same two-row treatment a phone gets:

| element | before | after |
|---|---|---|
| anchor row (`7 links + Type test`) | `lg:ml-10 lg:flex` | `xl:ml-10 xl:flex` |
| section rail (the chips that replace it) | `lg:hidden` | `xl:hidden` |
| quiz chip (the only header route to /quiz below the row) | `lg:hidden` | `xl:hidden` |
| bar height | `lg:h-20` | `xl:h-20` |
| `scroll-padding-top: 120px` | `max-width: 1023px` | `max-width: 1279px` |

The rail reaches every section the inline row does, so nothing became
unreachable at 1024–1279 — the links moved from one row to the other. Bar height
and scroll-padding move with them so an anchor jump still clears the two-row
header: verified at 1100px, `#program` lands at 120px against a 105px header.

**Deliberately NOT moved:** the Open Chat and Register buttons (`lg:inline-flex`)
and the tablet bottom register bar (`sm:block lg:hidden`) in `Journey.tsx`. Both
CTAs stay in the bar at 1024–1279 and the bottom bar stays out, so that band
keeps exactly one register CTA and one chat door — checked on screen, not
inferred. The header's scroll-away (`lg:!translate-y-0`) also stays at `lg`: it
exists because a phone carries this header *plus* a bottom rail, and neither the
bottom rail nor the vertical pressure applies at 1024+.

## The suffix, second band

`xl:hidden min-[1500px]:inline-flex` — **English only**. KR fits from `xl` with
42px to spare and needs no second band, so the class is applied inside the
existing `locale === "ko"` branch.

1500 is measured, not chosen: with the suffix forced on, the two nav groups sit
**0px** apart at 1400 (and the lockup still overflows its flex item by 18px),
**15px** apart at 1440, and **75px** apart at 1500. 1440 works but is the kind of
margin that breaks on the next label edit; 1500 is the first width with real air.
The comment at the key carries these numbers so the next person re-measures
instead of rounding.

## Result

| width | locale | before | after |
|---|---|---|---|
| 1024 | KR | wordmark crushed 171→50px, toggle off-screen | full lockup, rail carries the links, 0 overflow |
| 1024 | EN | wordmark gone entirely, toggle off-screen | same |
| 1280 | EN | "AI Builderthon" printed over Why/Who | suffix drops, row fits with 29px between the groups |
| 1280 | KR | fine | unchanged — 35px between the groups |
| 1500 | EN | — | full lockup returns, 75px between the groups |
| 375 | both | — | unchanged: 52px bar, 105px header, rail, 0 overflow |

Document horizontal overflow is 0 at every width checked (375 / 1024 / 1100 /
1280 / 1400 / 1440 / 1500).

## Verification

- `npx tsc --noEmit` → 0; `npm run build` → ✓ compiled, 10/10 static pages
- Both locales toggled live at each width; brand image width, suffix overflow,
  inter-group gap and document overflow read off `getBoundingClientRect()` rather
  than eyeballed
- Anchor-jump offset re-checked at 1100px after the `scroll-padding-top` band moved

## Files

- `components/journey/JourneyNav.tsx` — anchor row, quiz chip, section rail, bar
  height moved to `xl`; brand-suffix second band (EN, `min-[1500px]`); comments
  rewritten with the measurements.
- `app/globals.css` — `scroll-padding-top` band `max-width: 1023px` → `1279px`.
