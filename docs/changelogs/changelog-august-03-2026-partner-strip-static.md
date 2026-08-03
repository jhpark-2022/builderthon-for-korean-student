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

Mobile differs only in two spacing values:

| | mobile | sm+ |
|---|---|---|
| row gap between marks | `gap-x-3` | `gap-x-6` |
| per-mark width cap | `max-w-[5.5rem]` | `max-w-[8.5rem]` |

The width cap is what decides how many marks land per row now that nothing
scrolls; at 8.5rem the two widest wordmarks sat alone on a line at 375px. **Logo
heights are untouched** — every mark keeps its equal-area `opticalHeight` sizing
(22–38px), and only the widest wordmarks letterbox down inside the narrower cap.
`LEAD_TIER` (`area: 1900, max: 32`) still applies to 주최 and 주관, so the size
hierarchy between lead tiers and 후원 survives the smaller scale.

Result at 375px: 18 marks, 3 tier labels, ~3–4 marks per row, nothing scrolling,
nothing off-screen.

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
| logo heights 12–32px (unchanged range) | ✅ |
| mobile hook-cards instance hidden | ✅ |
| right-column hook cards visible | ✅ |
| `#companions` marquee still running | ✅ (2 tracks) |

## Verification

- `npx tsc --noEmit` → 0
- `npm run build` → ✓ compiled, 10/10 static pages
- 375×780 DPR2, 320×720 DPR2, 1440×900 DPR1
