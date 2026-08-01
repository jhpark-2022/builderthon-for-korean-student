# Changelog — August 2, 2026 (flow strips: mobile arrow direction & box widths)

**Project:** Builderthon marketing site (Next.js)
**Branch:** `main`
**Scope:** `components/journey/Journey.tsx` — the "최종 아웃풋" strip at the head of
the programme section and the "참여 플로우" strip in the benefits section. No copy
changed; `data/dictionary.ts` untouched.

## The bug

Both strips were built as `[box →][box →][box]` — each arrow lived **inside** its
box's own flex row. Laid out horizontally that reads correctly. Stacked on a
phone it produced two defects at once:

1. the arrow sat **beside** its box instead of between boxes, still pointing
   right while the flow ran downward;
2. because the arrow occupies width inside that row, the two boxes carrying one
   were **narrower than the last box**. Three stacked boxes that don't share a
   width read as a rendering fault, not as a design.

Measured before the fix at 375px: two boxes at 297px, one at 321px.

## The fix

Children are now **flat** — `[box, arrow, box, arrow, box]` — inside a
`flex-col sm:flex-row` container:

- **Mobile:** every box is its own full-width row (all 321px at 375px), and each
  arrow is its own centred row between them.
- **Desktop (sm+):** the identical elements line up horizontally with the arrows
  between the boxes, exactly as before.
- **One glyph, rotated:** `rotate-90 sm:rotate-0` turns the same `→` into a `↓`
  on phones. Conditionally rendering a second glyph would have been two strings
  to keep in step for no benefit. Still `aria-hidden` — it is decoration; the
  order is already carried by the numbered pills and the reading order.

Both strips now share a small `FlowStrip` component (items + a render function +
an `align` prop for `stretch` vs `center`), so the layout rule lives in one place
rather than being copied into a second section that then drifts.

## Verification

- `npx tsc --noEmit` and `npm run build` pass.
- **375px:** output strip children measure `[321, 18(↓), 321, 18(↓), 321]`, every
  arrow centred on the container's axis (187 vs 188 centre, sub-pixel rounding);
  participation flow measures the same with four boxes. Arrow transform is
  `matrix(0, 1, -1, 0, 0, 0)` — i.e. rotated to point down.
- **1440px:** boxes `[360, 18(→), 360, 18(→), 360]` all sharing one row top,
  arrow transform back to identity — unchanged from before the fix.
- `.shots/flow-strip-after-375.png`, `.shots/flow-strip-after-desktop.png`
