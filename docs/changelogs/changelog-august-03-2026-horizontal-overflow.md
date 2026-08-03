# Changelog — August 3, 2026 (horizontal overflow)

**Project:** Builderthon marketing site (Next.js)
**Branch:** `main`
**Scope:** `components/journey/Journey.tsx` (hero strip glow layer),
`app/globals.css` (root overflow guard). Resolves the known issue recorded in
`changelog-august-03-2026-station-principle.md` and
`changelog-august-03-2026-mobile-audit-fixes.md`.

## Symptom

At 375px, `document.documentElement.scrollWidth` was 393 against a `clientWidth`
of 375 — **18px of horizontal document overflow**. Felt as the page sliding
sideways under a vertical swipe.

`body { overflow-x: hidden }` was already set, which is why it clipped visually
but still measured: body clipping does not stop the document element from
reporting overflow, and on touch it does not reliably stop the sideways drag.

## Task 1 — full diagnostic before fixing

Ran at 375px and 320px:

```js
[...document.querySelectorAll('*')].filter(el =>
  el.getBoundingClientRect().right > document.documentElement.clientWidth + 1 ||
  el.getBoundingClientRect().left < -1)
```

Raw output was ~360 elements, which is misleading: almost all of them are the
`#companions` marquee's own children, and that band clips itself. The list was
re-run filtered to elements with **no clipping ancestor** (`overflow-x` in
`hidden | clip | auto | scroll`), which is the set that can actually widen the
document.

| offender | contribution | status |
|---|---|---|
| hero confirmed-partner marquee track (`.marquee-hero`) | track is `width: max-content`, far wider than the viewport | **gone** — the strip is static now (see the partner-strip changelog) |
| hero strip glow layer (`-inset-x-10`) | 40px bleed − 24px `px-6` rail padding = **16px past each edge** | **fixed** — see below |
| everything else | — | none found at 375px or 320px |

No third offender existed. The two known ones were the whole of it.

## Task 2 — root-cause fixes

### The marquee

Removed rather than clipped. It was replaced by a static wrapped grid for
independent reasons (a sliding ticker is a weak trust signal), and that removal
also deletes the widest element on the page. No wrapper `overflow-x: clip` was
needed because there is no longer an over-wide track to contain.

`#companions` keeps its marquee and keeps clipping it locally — unchanged.

### The glow layer

```
- className="pointer-events-none absolute -inset-x-10 -inset-y-6 -z-10"
+ className="pointer-events-none absolute -inset-x-6 -inset-y-6 -z-10 sm:-inset-x-10"
```

The layer is a soft radial scrim that deliberately bleeds past its container so
it reads as a shadow rather than a panel. Clipping it would have flattened that
into a visible box edge, so instead the **bleed was matched to the rail padding**:
the hero rail pads by `px-6` (24px) below `sm`, so a 24px bleed reaches exactly
the screen edge and stops. From `sm` up the rail pads by 40px and the original
`-inset-x-10` still fits inside the viewport.

The gradient is already at ~0 alpha at that distance
(`… rgba(6,4,15,0.22) 68%, transparent 88%`), so there is no visible difference —
the change removes 16px of transparent box, not 16px of glow.

## Task 3 — recurrence guard

```css
html { overflow-x: clip; }
body { … overflow-x: clip; }
```

with the mandated comment in the file: **the root causes are fixed at the section
level; this is a safety net so a future mistake never reaches a user as a page
that slides sideways — do not hide a new overflow behind it.**

Two deliberate choices:

- **`clip`, not `hidden`.** `hidden` makes the element a scroll container, which
  silently breaks `position: sticky` in descendants and still allows
  programmatic/`scrollLeft` sideways movement. `clip` only clips.
- **Both `html` and `body`.** Body alone was already set and was not enough — the
  document element kept reporting the overflow. That is precisely the state this
  changelog is fixing.

### Sticky / fixed check

The site has no `position: sticky` elements (grepped: the "sticky" names in this
codebase are the *fixed* mobile register bar and nudge). The fixed chrome was
verified live rather than assumed: after the guard, `header` is still
`position: fixed`, hides on scroll-down and returns to `top: 0` on scroll-up.

## Verification

| check | 375px | 320px |
|---|---|---|
| `scrollWidth === clientWidth` | ✅ 375 = 375 | ✅ 320 = 320 |
| document overflow | **0** | **0** |
| unclipped offenders | 0 | 0 |
| forced sideways push (`scrollLeft = 500`, `scrollBy(500,0)`) | no movement (`scrollLeft` 0, `scrollX` 0) | — |
| fixed nav returns on scroll-up | ✅ `top: 0` | — |

Desktop (1434px): document overflow 0, hero strip and `#companions` marquee
visually unchanged.

- `npx tsc --noEmit` → 0
- `npm run build` → ✓ compiled, 10/10 static pages

## Known-issue entries now resolved

- `changelog-august-03-2026-station-principle.md` → "Pre-existing, not
  introduced"
- `changelog-august-03-2026-mobile-audit-fixes.md` → the 18px note

Both are marked resolved in place, pointing here.
