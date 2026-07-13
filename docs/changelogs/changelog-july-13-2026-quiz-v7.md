# Changelog — July 13, 2026 (quiz phase 7)

**Project:** Builderthon marketing site (Next.js)
**Branch:** `main`
**Window covered:** the `/quiz` seventh pass — 9:16 story-image export

## Summary

The result screen can now export a 9:16 (1080×1920) story image. On mobile the
PNG goes straight into the native share sheet (→ Instagram story, or save to
photos); desktop falls back to a file download. Built as a dedicated off-screen
capture card so the export is pixel-stable and never mixes in the live card's
responsive layout / gauge-accordion state.

---

## Feat — 9:16 story-image export

**User impact:** A "📸 이미지로 저장 / Save as image" button on the result screen.
One tap on a phone → share sheet → post to an Instagram story or save the card.
**Technical:**
- `components/Quiz.tsx` — new `StoryCard` (forwardRef, fixed 1080×1920, inline-px
  layout) rendered off-screen (`position:fixed; left:-9999px`, **not**
  `display:none` — that captures blank). Reuses the site's dark `#06040f` +
  violet/cyan-orb tokens, `ModelGlyph` for the white-mono logo, and a mini 5-row
  axis-gauge block (label · bar · %) that renders **only when `result.axes`
  exists** — deep-link (`?r=`) visitors get the type-only card. ~180px top/bottom
  safe margins keep it clear of the story UI. Bottom shows "나도 테스트하기" + the
  site host (`<host>/quiz`, derived from `location.hostname`).
- Capture flow (`saveImage`): **dynamic** `import("html-to-image")` (kept out of
  the initial bundle), `await document.fonts.ready`, then `toBlob` called **twice**
  (iOS Safari drops fonts/images on the first pass — keep the second blob). Result
  routing: `navigator.canShare({files})` → `navigator.share({files:[File]})`
  (native sheet); otherwise object-URL + `<a download>`. Filename
  `zero100-quiz-<resultId>.png`. Share-sheet `AbortError` (user cancel) is
  swallowed; other failures show an error toast (the pattern re-added here).
  Button shows a spinner + "만드는 중…" while working.
- `data/quiz.ts` — `saveImage` / `saveImageLoading` / `saveImageError` /
  `storyRetake` copy.
- `package.json` — added `html-to-image@^1.11.13`.

Placement note: the task asked to add this as a 3rd button in the share/retake
row, but that row was removed in phase 6.5. It's added as its own full-width
button below the dream-teammate section instead.

---

## Verification

- `npx tsc --noEmit` — clean. ✅
- `next build` — succeeds; **`html-to-image` is a lazy async chunk (`967.*`), not
  in `/quiz`'s initial chunks** (verified against `app-build-manifest.json`);
  `/quiz` First Load JS 174 kB. ✅
- Desktop Chrome QA (dev @ :3999, real capture pipeline via the app button):
  - `?r=INFJ-A` deep-link → 1080×1920 PNG, **no gauges** (type-only). ✅
  - Full quiz run → 1080×1920 PNG **with** the 5 gauges; %s match the live card
    exactly (내향 95 / 직관 69 / 감성 73 / 계획 59 / 안정 90). ✅
  - Logo renders white-mono; Pretendard embedded (crisp Korean); orbs + safe
    margins present. ✅
- **Pending — real-device QA (cannot run here):** iPhone Safari + Android Chrome
  tap → share sheet → Instagram-story selection, to confirm fonts/logo/gauges
  survive the native share on-device (the double-render is the known iOS
  workaround, but a device check is still recommended before relying on it).
