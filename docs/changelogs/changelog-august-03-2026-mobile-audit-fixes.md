# Changelog — August 3, 2026 (mobile audit fixes)

**Project:** Builderthon marketing site (Next.js)
**Branch:** `main`
**Scope:** `components/journey/Journey.tsx` (ScrollToTop, RouteMap, mentor and judge
grids, benefit cards, band tint, `#launch` spacing), `data/dictionary.ts`
(`dict.benefits.expand` / `.collapse`). Measured at 375×780, DPR 2.

## Page height — before / after

| viewport | before | after | change |
|---|---|---|---|
| 375px (mobile) | **30,115px** | **26,011px** | **−4,104px (−13.6%)** |

Per section at 375px:

| section | before | after | Δ |
|---|---|---|---|
| `#mentoring` | 7,010 | 3,089 | **−3,921** |
| `#benefits` | 3,918 | 3,642 | −276 |
| `#launch` | 288 | 252 | −36 |
| `#program` | 5,079 | 5,208 | **+129** |
| everything else | — | unchanged | 0 |

`#program` grew on purpose: the route strip is two rows instead of one scrolling
row (task 2). Trading 129px for "the destination is on screen" is the right side
of that deal.

Desktop total is 17,857px and unchanged in layout — see the regression checks at
the end.

## Task 1 — ScrollToTop FAB

### The actual bug: it never hid

The hide-on-scroll-down was already wired to `useScrollDirection`, written as
`max-lg:pointer-events-none max-lg:opacity-0`. Only half of it worked.
framer-motion writes `opacity: 1` as an **inline style** from its `animate` prop,
and inline beats any class — so the FAB went `pointer-events: none` and stayed
fully visible. It sat on top of body copy for the whole page and merely stopped
responding to taps, which is indistinguishable from "it covers the text" and is
exactly what the audit reported.

Fixed with `max-lg:!opacity-0`. `!important` is the one thing that outranks an
inline style; it is the only `!` in the file and the comment says why.

Measured after the fix (375px):

| state | opacity | pointer-events |
|---|---|---|
| at rest | 1 | auto |
| scrolling down | **0** | none |
| scrolling up | 1 | auto |

### Size and weight

The button is now the hit area and an inner `<span>` is the artwork:

| | touch target | visual disc | fill |
|---|---|---|---|
| mobile | **50px** (h-11 @ 18px root) | **36px** | `white/[0.07]` + `white/20` border, backdrop-blur |
| desktop (lg+) | 54px | 54px | `violet-600/85`, unchanged |

36 / 54 = exactly the ~2/3 the audit asked for, and the 50px target clears the
44px minimum. Root font-size is 18px in this project, so `h-12` was always 54px —
desktop is byte-identical, not merely close.

Bottom offset (`safe-area-inset-bottom + 5.25rem`, `lg:bottom-8`) is untouched and
still clears the sticky register rail.

**Residual, stated plainly:** a `position: fixed` control overlaps content by
definition. What changed is that it is now 36px, low-contrast, and absent unless
you are scrolling up. Guaranteeing zero overlap would mean reserving a gutter for
it, which is not worth a page-wide layout cost.

## Task 2 — route map: two rows on mobile

The strip was one horizontally scrolling row. At 375px it cut off around Day 5, so
**Day 8 — the ★ terminal the device exists to show — was off-screen by default.**
A route map whose destination needs scrolling to find is worse than a wrapped one.

- The eight days are split into two `<ol>`s of four. Below `sm` they stack; from
  `sm` up they sit side by side and read as the original single line of eight.
- Each row owns its rail. Outer ends inset 12.5% (half a column of a four-up row)
  so the line runs node-centre to node-centre; the **inner** ends run to the edge
  from `sm` up (`sm:right-0` / `sm:left-0`) so the two rails meet and desktop
  still reads as one unbroken line.
- Mobile-only elbow between rows: a short hairline plus a chevron, `sm:hidden`. A
  rail cannot be drawn across a flex-direction change, and the brief allowed
  "spacing + arrow".
- The `overflow-x-auto` wrapper and `min-w-[600px]` are gone — nothing scrolls now.

Verified at 375px: `routeRows: 2`, stacked, `day1Visible: true`,
`day8Visible: true`, no horizontal scroll. At 1434px: both rows on one line
(`routeOneLine: true`), connector hidden.

## Task 3 — mobile compression

### Mentor and judge grids → snap rows

Three card sets (7 build mentors, 6 pitch mentors, 10 judges) were one-per-screen
stacks on a phone — 23 screens of scrolling. Each container is now a
`snap-x snap-mandatory overflow-x-auto` row on mobile and the **same flex-wrap
grid as before** from `sm` up:

- cards `w-[75vw] shrink-0 snap-start`, reverting to `sm:w-[calc(...)] sm:shrink`
- `-mx-4 px-4` so cards can scroll to the screen edge while the first still lines
  up with the section
- `role="region"` + `aria-label` (the group's own theme / the judges heading)
- The peek of the next card is the only affordance. No dot indicators: a dot row
  is more chrome than the thing it explains.

This is the whole −3,921px in `#mentoring`.

### Benefit cards → collapse to two bullets

New `BenefitCard` component. Desktop renders exactly what it rendered before, so
the extra points are **never removed from the DOM** — they are `hidden sm:flex`,
and the toggle is `sm:hidden` (no button, no tab stop, no aria state above the
breakpoint).

- Tap target is a transparent overlay across the whole card (`absolute inset-0
  sm:hidden`), because on a phone the card *is* the control and a small link at
  the bottom of a card is a worse target than the block above it.
- A visible "더 보기 / 접기" row with a rotating chevron is the affordance — an
  overlay with no cue is a card that silently eats taps.
- `aria-expanded` on the button, `aria-controls` → the `<ul>` id, plus an
  `sr-only` label naming the card.

Measured at 375px: all six cards show 2 of 3–5 points collapsed; tapping card 06
goes to `aria-expanded="true"` with 5/5 visible and the label flips to "접기".

Nine bullets hidden across six cards nets **−276px** after the six new toggle
rows are paid for. Modest, and reported as such — the bulk of `#benefits` is the
spine block, the intro, the flow strip and the hook cards, none of which were in
scope.

New copy: `dict.benefits.expand` / `.collapse`, both `{ko, en}`.

## Task 4 — background and spacing

### The band edge — the fade was making it worse

The audit asked to double the top fade. Doing that does not fix this seam, and
the reason is worth recording.

A band section was `bg-[#0a0814]/50` across its whole height **plus** a `/50`
top-to-transparent gradient at each edge. Those gradients are painted *on* the
tint, not subtracted from it:

| position | composite alpha |
|---|---|
| section edge | 0.5 tint over 0.5 fade ≈ **0.75** |
| section middle | 0.50 |
| 1px outside the section | **0** |

The edge was the darkest part of the band and the step to the outside was
maximal. Making the fade taller only widens the dark strip; the step is identical.

Replaced with a tint that fades itself — one vertical gradient, no overlay:

```
transparent → rgba(10,8,20,0.5) @ 10rem → hold → transparent @ last 10rem
```

There is now no step at either boundary. `BandFades()` is kept as a no-op so both
band sections retain one obvious place to opt into edge treatment and neither call
site had to change shape. Applied through `BAND_TINT`, so `#program` and
`#companions` are automatically identical.

### `#launch` → `#about` gap

`#launch` is `lg:hidden`, i.e. a mobile block by definition, and its `py-12`
bottom stacked on the About chapter's `py-14` — 104px of nothing between the
countdown and the first line of copy. Bottom padding only: `py-12` → `pb-4 pt-12`.
The top gap under the hero is doing real work and is untouched. Desktop never
renders this section.

## Desktop regression checks (1434px)

| check | result |
|---|---|
| route map on one line | ✅ |
| mobile row connector hidden | ✅ |
| all benefit points visible | ✅ |
| benefit toggles not rendered (no tab stop) | ✅ |
| mentor/judge regions wrap, no scroll | ✅ |
| FAB 54px, violet fill | ✅ (root font-size 18px — `h-12` was always 54px) |

## Accessibility

- Touch targets: FAB 50px; benefit card overlay spans the card; route nodes
  unchanged.
- `aria-expanded` + `aria-controls` + `sr-only` label on each benefit toggle.
- `role="region"` + `aria-label` on all three swipe rows.
- `prefers-reduced-motion`: no new animation was added. The FAB's existing
  `useReducedMotion()` branches (enter/exit offset, smooth-scroll → auto) are
  untouched; the new `transition-opacity` is a 200ms fade with no transform.
- Route strip `aria-label` is carried by the first `<ol>` only, so the split into
  two lists does not announce twice.

## Known issue at the time — **RESOLVED 2026-08-03**

> The 18px horizontal document overflow at 375px (hero marquee + `-inset-x-10`
> glow layer) was still open when this work shipped. Fixed later the same day —
> see `changelog-august-03-2026-horizontal-overflow.md`.

## Verification

- `npx tsc --noEmit` → 0
- `npm run build` → ✓ compiled, 10/10 static pages
- 375×780 DPR2 and 1440×900 DPR1, KR
