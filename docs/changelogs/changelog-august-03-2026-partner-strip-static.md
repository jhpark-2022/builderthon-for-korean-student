# Changelog — August 3, 2026 (mobile partner strip → static)

**Project:** Builderthon marketing site (Next.js)
**Branch:** `main`
**Scope:** `components/journey/Journey.tsx` (`HeroPartnerStrip`, `StripLogo`, hero
composition), `app/globals.css` (`.marquee-hero` removal). `confirmedPartnerTiers`
data is unchanged.

## The problem

Desktop rendered the confirmed-partner band as three stacked tiers — 주최 / 주관 /
후원 — with every mark visible at once. Mobile rendered the same data as a
single-line auto-scroll marquee, because "18 marks can't fit a phone width".

They can. They just have to wrap.

And the marquee cost the exact thing the strip exists for. **A logo wall earns
trust by being seen at once.** Three marks sliding past one at a time is a ticker:
it reads as decoration, and a visitor who looks away for two seconds cannot tell
whether they saw two sponsors or twenty. Sequential exposure is a weak trust
signal regardless of how many logos are in the queue.

## Task 1 — marquee → static wrapped grid

The tier stack is no longer `hidden sm:flex`. It renders at **every width**, from
the same `confirmedPartnerTiers` data, through the same `StripLogo` component. No
new logo render path was introduced.

### Sizing: a separate mobile band, not a narrower cap

The first cut of this shrank the per-mark width cap on mobile
(`max-w-[5.5rem]`) and left the heights alone. That was wrong, and it produced
exactly the complaint that followed — *the logos look like different sizes.*

A cap below a mark's natural width letterboxes it, which silently overrides the
equal-area height it had earned. Measured against the real 18 marks:

| mark | ratio | earned H | natural W | capped to | height lost |
|---|---|---|---|---|---|
| INNOVATE 360 | 8.4:1 | 16px | 135px | 99px | **−27%** |
| Onword Lab | 9.8:1 | 12px | 117px | 99px | **−16%** |
| Drimaes | 6.6:1 | 17px | 113px | 99px | **−12%** |

The three marks the cap hit were already the shortest in the strip, so the cap
made the spread worse, not better.

The underlying issue is that the desktop band spans **12–32px — a 2.67× spread**.
Equal-area sizing means that on purpose (a square crest and a long wordmark carry
equal visual mass, not equal height), and across a wide desktop row it reads as
one family. Squeezed onto 375px it stops reading that way: a 12px wordmark beside
a 32px crest looks like a rendering fault.

So mobile gets **its own clamp**, not a scaled copy of the desktop one:

| | area | min | max |
|---|---|---|---|
| 후원 (`STRIP_M_*`) | 1100 | 18 | 24 |
| 주최 · 주관 (`LEAD_TIER.m*`) | 1500 | 21 | 27 |

| | before | after |
|---|---|---|
| height range | 12–32px | **18–27px** |
| spread | 2.67× | **1.50×** |
| letterboxed marks | 3 | **0** |
| widest mark | — | 176px in a 327px column |

Lead tiers still sit above 후원 (21–27 vs 18–24), so the hierarchy the desktop
band establishes survives.

Two implementation notes:

- **Two heights, one `<img>`.** `StripLogo` computes both and writes them as
  `--sl-h` / `--sl-h-sm`, consumed by `h-[var(--sl-h)] sm:h-[var(--sl-h-sm)]`.
  These are 18 above-fold images; duplicating them for a media query is not a
  trade worth making.
- **Per-mark overrides do not carry into the mobile band.** Onword Lab's
  `min: 12` exists to stop a 9.8:1 wordmark dominating a laptop line; on a phone
  it just made it the smallest thing on screen. The mobile clamp handles both.

`max-w` is now a backstop again rather than a layout tool: `11rem` on mobile sits
above the widest natural width (176px) so it never bites, `8.5rem` from sm up as
before. How many marks land per row is decided by the band and the flex wrap.

Row gap is the one remaining spacing difference: `gap-x-3` on mobile,
`gap-x-6` from sm up.

Result at 375px: 18 marks, 3 tier labels, 7 wrapped rows, nothing scrolling,
nothing off-screen, nothing letterboxed.

### What was deleted

- `marqueeItems`, the `looped` state and its `useEffect` (the track-duplication
  trick that existed only to make the loop seamless).
- The `<sm` marquee block.
- `.marquee-hero` in `globals.css`, including **its `prefers-reduced-motion`
  exemption**. That exemption overrode a user's stated motion preference because
  the layout depended on movement to keep every partner reachable. With a static
  grid there is nothing to exempt — the accessibility win here is structural, not
  a new branch.
- `.marquee-track`, `.marquee-left`, `.marquee-right` and the `marquee` keyframes
  **stay**: the `#companions` band still uses them. That band is atmosphere; this
  one is evidence. Different jobs, different treatment.

## Task 2 — logos before the signup ask

On mobile the hero is a vertical stack, so whatever sits highest is what the first
swipe reveals. The order was:

```
title/copy → CTA cluster → hook cards (register) → partner strip
```

which asks for commitment before showing any reason to give it. Now:

```
title/copy → CTA cluster → partner strip → hook cards (register)
```

**Implemented by moving the hook cards down, not the strip up** — deliberately.
The strip spans under both hero columns on desktop and would have needed a second
instance to move; duplicating it would double 18 eager above-fold images, which
the file already warns about for LCP reasons. The mobile hook-cards block is
`lg:hidden` and desktop uses a separate right-column instance, so relocating it
touches nothing above `lg`.

The "확정 파트너 · CONFIRMED PARTNERS" label is unchanged.

## Guardrails checked

- **Tap behaviour:** unchanged. The strip is a non-clickable `div` (it stopped
  being a jump-to-`#builders` link before this change) and individual partner
  modals live in the partner section, not here. Nothing was wired up or removed.
- **prefers-reduced-motion:** improved by construction — the only animation in
  this component is gone, along with the exemption that ignored the preference.
- **Legibility at 375px:** heights unchanged at 22–38px; only the width cap moved.
- **White-on-dark treatment:** untouched — same `grayscale opacity-80` +
  drop-shadow, same radial scrim behind the strip.

## Desktop regression (1434px)

| check | result |
|---|---|
| 18 logos, 3 tiers | ✅ |
| zero marquee tracks in the strip | ✅ |
| every mark's height identical to pre-change (18/18 exact, 12–32px) | ✅ |
| mobile hook-cards instance hidden | ✅ |
| right-column hook cards visible | ✅ |
| `#companions` marquee still running | ✅ (2 tracks) |

## Verification

- `npx tsc --noEmit` → 0
- `npm run build` → ✓ compiled, 10/10 static pages
- 375×780 DPR2, 320×720 DPR2, 1440×900 DPR1
