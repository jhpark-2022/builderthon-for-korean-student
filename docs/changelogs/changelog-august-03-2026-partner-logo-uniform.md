# Changelog — August 3, 2026 (확정 파트너 스트립 · 티어별 고정 박스)

**Project:** Builderthon marketing site (Next.js)
**Branch:** `main`
**Scope:** `components/journey/Journey.tsx` — the hero confirmed-partner strip
(`confirmedPartnerTiers` / `StripLogo` / `HeroPartnerStrip`) only. No asset, no
copy, no tier label, no data file touched.

## The problem

Inside a single tier, logos rendered at visibly different sizes. The wide
wordmarks — **DRIMAES, INNOVATE 360, ONWORD LAB** — read as the biggest marks on
the strip while **Translink** and the crests read as the smallest, even though
they are peers in the same tier.

The cause was the sizing rule itself: **equal rendered AREA**
(`opticalHeight()` with `STRIP_AREA` / `STRIP_M_*` bands and a `LEAD_TIER` bump).
Equal-area holds every mark to the same amount of ink and lets **width** float —
`h = √(A / r)`, so a 9.8:1 wordmark gets a short height and an unbounded width.
That works on the partner wall, where each mark sits inside a visible white chip
that gives the eye a common frame. The hero strip has no chips: the marks float
on the video with nothing to measure against except each other, and with no frame
the eye reads **width** as size. Onword Lab was 176px wide next to a 60px
Translink and looked twice as big while carrying the same ink.

Per-mark overrides had been accreting to fight this (`area: 1900` on 한인회,
`area: 1000, min: 12` on Onword Lab). Each fix made the next mark look wrong —
the sign that the rule, not the values, was the problem.

## The rule now: one box per tier

Each tier defines **one** `StripBox` — a fixed height and a max width — and every
mark in it is `object-contain`-ed inside that box:

```ts
type StripBox = { h: number; maxW: number; mH: number; mMaxW: number };
const LEAD_BOX:    StripBox = { h: 34, maxW: 126, mH: 26, mMaxW: 96 }; // 주최 · 주관
const SPONSOR_BOX: StripBox = { h: 26, maxW:  98, mH: 21, mMaxW: 78 }; // 후원
```

- A **wide wordmark** hits the width wall and letterboxes down (DRIMAES: 126×19).
- A **square crest** hits the height wall and uses the full box height
  (NUS: 34×34).
- Nothing can exceed its tier's box in either dimension, so nothing sticks out.

Box aspect is ~3.7:1 in both tiers, tuned by eye against the real 18 marks:
wider and the long wordmarks start dominating again; narrower and they letterbox
into hairlines beside the crests.

**No per-logo overrides.** The `area` / `min` / `max` / `mArea` / `mMin` / `mMax`
fields are gone from `StripLogoSpec`, along with 한인회's and Onword Lab's
exceptions. `w`/`h` stay in the data but are now the `<img>` `width`/`height`
attributes — **aspect ratio only**, so the box is reserved before the file loads.
They feed no size calculation. The comment at `StripBox` says this out loud: if a
mark looks wrong, retune the tier and re-check the whole tier.

Tier hierarchy is kept — 후원's box is ~13% smaller than 주최·주관's — but
**within** a tier the box is identical with no exceptions.

## Mobile and desktop share the rule

They already shared the component (the strip has been one static layout at every
width since the marquee was removed). They now also share the *rule*: mobile is
the same fixed box with the phone half of each `StripBox` (`mH` / `mMaxW`) and
tighter gaps, not a separate band with its own clamp. `STRIP_M_AREA` /
`STRIP_M_MIN` / `STRIP_M_MAX` are deleted.

## Layout

`flex flex-wrap justify-center gap-x-3 gap-y-1.5 sm:gap-x-6` — unchanged. What
changed is that the width cap is now uniform inside a tier, so no mark can claim
a line to itself. Measured wrap:

| viewport | 주최 (5) | 주관 (3) | 후원 (10) |
|---|---|---|---|
| 375px | **3 + 2** | 3 | 4 + 3 + 3 |
| 1280px | 5 | 3 | 10 |

At 375px under the old sizing DRIMAES sat alone on its own row; it now shares row
two with Popup Studio. Document horizontal overflow is 0 at both widths.

`max-w` on `StripLogo` flipped meaning and the comment records it: it used to be
a *backstop* that had to stay above every natural width (a cap that bit was a
bug, because it stole height the area had earned). It is now the width half of
the tier box, and letterboxing wide marks is the intended effect.

## `opticalHeight()` — kept, with two callers

Still used by the white-chip partner wall (`LogoTile`) and the Zero100 companion
marquee tile, both of which draw marks inside a **visible container** where equal
area is the right rule. Only the hero strip's constants were removed. A note at
the function records which caller left and why, so it isn't reintroduced here.

## Untouched (guardrails)

Trimmed white-silhouette assets and the `grayscale` / `opacity-80` /
drop-shadow treatment; tier labels 주최 · 주관 · 후원; the strip's non-clickable
`group` wrapper and hover highlight; eager loading + `fetchPriority="low"`;
`sortLikeHeroStrip()` (sponsor order is still read off this list); the partner
section below.

## Verification

- `npx tsc --noEmit` → 0; `npm run build` → ✓ compiled, 10/10 static pages
- Rendered at **375×780 (mobile emulation, dpr 2)** and **1280×800**: within
  each tier every mark now sits in an identical box; the three wide wordmarks no
  longer out-size their peers; the 한인회 seal and the NUS/NTU crests stay
  legible (crests use the full 34px / 26px box height)
- Per-mark drawn sizes measured in-page (`getBoundingClientRect` + intrinsic
  ratio) to confirm the wall each mark hits — width for the wordmarks, height for
  the crests
- `grep` for `STRIP_AREA|STRIP_MIN|STRIP_MAX|STRIP_M_|LEAD_TIER` → gone except in
  the explanatory comment

## Files

- `components/journey/Journey.tsx` — `StripBox` + `LEAD_BOX` / `SPONSOR_BOX`,
  `StripLogoSpec` trimmed to `{src, alt, w, h}`, `confirmedPartnerTiers` gains a
  `box` per tier and loses both per-mark overrides, `StripLogo` takes `box` and
  renders `h` + `max-w` from CSS vars, `opticalHeight()` doc note.
