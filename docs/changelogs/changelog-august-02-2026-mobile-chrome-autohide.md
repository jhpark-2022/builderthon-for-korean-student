# Changelog — August 2, 2026 (mobile chrome: auto-hide + slimming)

**Project:** Builderthon marketing site (Next.js)
**Branch:** `main`
**Scope:** `lib/useScrollDirection.ts` (new), `components/journey/JourneyNav.tsx`,
`components/journey/Journey.tsx` (`MobileStickyBar`, `MobileRegisterBar`,
`ScrollToTop`), `app/globals.css`. **Desktop (lg and up) behaviour is unchanged**
— every new rule is either `max-lg:`-scoped or overridden by `lg:`.

## Why

On a phone three fixed surfaces were on screen at once: a two-row header (logo
row + section rail), the bottom register bar, and the back-to-top button. On a
390×844 phone that is tolerable; inside Telegram's or Instagram's in-app browser,
where the app's own chrome eats another ~120px of a ~600px viewport, it left very
little page. The FAB also sat close enough to the bottom bar to read as
overlapping it.

## What changed

### 1 · One shared scroll-direction signal — `lib/useScrollDirection.ts`

Every piece of chrome subscribes to the same hook, so they move as one surface.
Separate listeners would have been worse than none: the page would settle at a
different height depending on which element happened to agree.

- **Hysteresis (12px).** The accumulator only trips after 12px of travel in one
  direction and resets whenever direction flips, so momentum jitter and
  rubber-banding never toggle it. Verified: a 6px scroll-up does **not** bring the
  chrome back; 250px does.
- **Top zone (80px).** Always visible near the top of the page.
- **Scroll lock.** Every modal sets `body.style.overflow = "hidden"`; while that
  holds, the hook reports "visible" so a bar hidden a moment before the modal
  opened can't stay stuck underneath it.
- One evaluation per animation frame.

### 2 · Header: slimmer, and it slides away

- Bar row `h-20` → **`h-[52px]`** below lg (`lg:h-20` untouched); rail padding
  `pb-2.5` → `pb-2`; chips `px-3.5`/`text-xs` → `px-3`/`text-[0.7rem]` with the
  **44px min-height kept** — the row got shorter by losing padding around the
  targets, never by shrinking them.
- Measured: **145px → 105px, a 28% reduction.**
- Scrolling down translates it `-translate-y-full`; scrolling up brings it back.
  `focus-within:translate-y-0` pins it for keyboard users, `lg:!translate-y-0`
  freezes it on desktop, and the tint transition keeps its old 500ms there
  (`duration-300 lg:duration-500`).
- `scroll-padding-top` for the anchor rail: 160px → **120px**, matching the new
  chrome height.

### 3 · Bottom bars

Both bars (`MobileStickyBar` below sm, `MobileRegisterBar` sm→lg) now:

- slide out with the same signal, `focus-within` pinning them open;
- stand down while the **closing section** is on screen — that section has its own
  register CTA, and two identical buttons stacked on each other read as a bug.
  `MobileStickyBar` already did this; `MobileRegisterBar` never had it and does now;
- lost a little height (`p-1.5`→`p-1`, `pt-3`→`pt-2`, bottom padding
  `0.75rem`→`0.5rem`) with the 44px+ buttons untouched.

`body { padding-bottom }` on phones drops 4.5rem → 4rem and stays **fixed** rather
than following the bar: reclaiming that space on every hide would make the page
height breathe under the reader's thumb.

### 4 · Back-to-top button

Rides the same signal below lg (`max-lg:opacity-0 max-lg:pointer-events-none`), so
it leaves with the rail rather than floating alone above nothing — and that is
also what guarantees the two can never overlap. Measured gap when both are
visible: **16px**. From lg up it is untouched (opacity 1, `lg:bottom-8`, no
hide-on-scroll).

## Verification

- `npx tsc --noEmit` and `npm run build` pass.
- **375×600** (in-app-browser proportions): header 105px; scroll down → header at
  `-105`, pill bar off-screen, FAB gone; 6px jitter up → still hidden; 250px up →
  all three return together.
- **768×700**: register bar hides on scroll-down and over the closing section;
  header and FAB follow the same signal.
- **1440×900**: header 90px and pinned at top through every scroll direction, FAB
  opacity 1 with its usual 36px bottom gap, no bottom bars — i.e. identical to
  before.
- **375×812**: FAB bottom 757 vs bar top 773 → 16px clear; `body` bottom padding
  72px; safe-area insets still applied on both bars.
- `.shots/mobile-chrome-after-375.png`
