# Changelog — July 15, 2026 (quiz phase 10)

**Project:** Builderthon marketing site (Next.js)
**Branch:** `main`
**Window covered:** the `/quiz` tenth pass — axis-explanation highlights on the
9:16 story image.

## Summary

The shareable 1080×1920 story card (phase 7) now carries **two of the result
screen's B-grade axis explanations** in the previously-empty space under the
gauges: the taker's **most decisive axis** (highest %) beside their
**closest-call axis** (lowest %). A "94% 단정" line sitting next to a "56% 반반"
line is the whole gag — so the two cards are styled differently (violet vs cyan)
to sell the contrast.

Only two are shown (all five would be unreadable at story size), full text with
no ellipsis. Deep-link (`?r=`) visitors — who have no per-answer data — get the
original card unchanged.

---

## Feat — two axis-explanation highlight cards

**User impact:** The saved/shared story image now explains *why* you're your type,
in the same self-roast voice as the result screen, for the two most tellable axes.
**Technical:**
- `components/Quiz.tsx` (`StoryCard`) — picks the highest-% and lowest-% axes from
  `result.axes` (ties resolve to the earlier axis in `AXIS_ORDER`), then renders a
  card each: a small uppercase label + `getExplanation(axis, pattern, pct)` text
  (the exact string the result-screen gauge accordion shows, `{pct}` substituted).
  First card violet border (`빼박인 부분` / "No debate here"), second cyan
  (`아슬아슬한 부분` / "The coin toss").
- `data/quiz.ts` — added `quizUI.storyHighlightHi` / `storyHighlightLo` labels.

## Readability & layout

- Body text **31px** (≥ the 30px floor at 1080px width), line-height 1.5, cards
  880px wide, full text (no truncation).
- Reclaimed vertical room by tightening the identity/gauge block (smaller glyph,
  title, and inter-section margins) so a medium hi-card + a long "반반" lo-card fit
  together in the common case while the identity block stays balanced.

## Overflow fallback (never clips off-frame)

- The card renders both highlights, then an effect measures the bottom CTA's
  position; if it's pushed past the safe line (content bottom = 1740 = 1920 −
  180px bottom margin), the **second (lowest-%) card is dropped** so nothing ever
  clips out of frame. Re-attempts both whenever the copy changes (new result /
  locale). Runs off-screen, long before the user hits save.

## Guards

- **No `axes`** (deep-link visitor who taps save) → the whole highlight section is
  omitted, exactly like the gauges; original card layout preserved.
- **Missing explanation** (defensive — pattern-key gap) → only that card is
  silently skipped. Same axis for hi & lo (all-equal %) → the duplicate is skipped.

---

## QA (localhost:3999)

Verified in-browser across multiple playthroughs:
1. `ESTP-T` (70% 예민 / 56% 외향) and `ENTP-T` (94% 외향 / 71% 이성): the two cards
   match the highest/lowest-% gauges, and each card's text carries the matching %
   number (identical to the result-screen accordion — same `getExplanation`).
2. Both cards fit with the bottom CTA at the safe line (content bottom = 1740); no
   text truncation or off-frame overflow. Before the margin tightening, a long
   "반반" pair overflowed and the fallback correctly dropped the second card —
   confirming the guard works.
3. Emojis (🌗 🌤️ 🧊 🎉) render in the live DOM the story card is serialized from.
4. `?r=` deep-link (no `axes`): no gauges, no highlight cards, original layout.
5. `npx tsc --noEmit` passes.

**Note:** the actual `html-to-image` PNG could not be produced in this dev +
browser-automation harness — `toBlob` does not resolve here (it hangs with no
error). This is **pre-existing and unrelated to this change**: an A/B test showed
the phase-7 *no-emoji* deep-link card hangs identically, so emoji embedding is not
the cause. The capture pipeline is phase 7's shipped, unchanged code; the emoji is
plain text drawn with the system emoji font (as confirmed in the live DOM).
**Recommend a quick manual save on a preview/prod build** (desktop download +
mobile share sheet) to eyeball the final rendered PNG.
