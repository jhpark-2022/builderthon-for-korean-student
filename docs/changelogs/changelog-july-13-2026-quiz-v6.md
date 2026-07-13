# Changelog — July 13, 2026 (quiz phase 6)

**Project:** Builderthon marketing site (Next.js)
**Branch:** `main`
**Window covered:** the `/quiz` sixth pass — self-host the remaining 5 model logos

## Summary

Five models that were rendering an emoji fallback (Grok, Character.AI, Pi, MS
Copilot, Midjourney) now have real white-mono logos, self-hosted in
`public/logos/` alongside the existing marks. The raster originals (JPEG/AVIF
with solid backgrounds) were processed into transparent white-mono PNGs; Grok's
SVG was recolored white and trimmed to its icon mark. The `logo` field now
carries a full filename (extension included) so PNG and SVG marks coexist.

---

## Feat — 5 self-hosted logos

**User impact:** The result card avatar, dream-teammate cards, and landing tiles
show real white-mono brand marks (transparent background) for Grok, Character.AI,
Pi, MS Copilot, and Midjourney instead of emoji.
**Technical:**
- `scripts/process-logos.py` (new, one-off, PIL) — turns each raster into a
  white-mono transparent PNG: sample the flat background from the image corners,
  take each pixel's Euclidean color distance from it, ramp that to alpha (near-bg
  → transparent, far → opaque, smooth AA), flatten survivors to pure white, trim
  to the alpha bbox, center on a 512×512 canvas with ~8% padding. Handles mono
  AND multicolor marks (MS Copilot's gradient ribbon keeps its shape + S-gap
  where luminance thresholding would have dropped the bright sections). Saved as
  `LA` (grayscale+alpha) — same look, ~40% smaller, all files < 40 KB.
  Wordmark-bearing sources are cropped to the icon: Midjourney to the sailboat
  (dropping the "Midjourney" text below the y=200 gap).
- `public/logos/grok.svg` — recolored `fill="#ffffff"`, stripped of exported
  Tailwind-class cruft, and trimmed to the swirl mark only (viewBox measured via
  `getBBox`), dropping the "Grok" wordmark so it matches the icon-only peers.
- Raster originals (`Character.jpg`, `Pi (Inflection).jpeg`,
  `Microsoft Copilot.jpeg`, `Midjourney.avif`) and stray `.DS_Store` files
  removed; `.DS_Store` was already in `.gitignore`.
- `data/quiz.ts` — `logo` field semantics changed to a full filename
  (`"deepseek.svg"`, `"characterai.png"`, …); all 16 updated. The two models
  with no self-hostable mono mark (ChatGPT/`openai`, Cohere/`cohere`) keep
  `logo: ""` and their emoji fallback (per decision; simple-icons dropped both).
- `components/Quiz.tsx` — render simplified to `/logos/${logo}`; `HERO_LOGOS`
  entries use `file` (ext included) rendered via `/logos/${file}`. Emoji
  fallback (`ModelGlyph`/`HeroLogo` onError) kept as the safety net.
- `scripts/verify-quiz.mjs` — logo check now asserts every non-empty `logo`
  field resolves to a real file in `public/logos/` (a missing file → fail); empty
  logos are reported as intentional emoji fallbacks.

---

## Verification

- `node scripts/verify-quiz.mjs` — Sidon/explanation/matchWhy invariants hold;
  **14/16 logos have a file, 2 emoji-fallback** (openai, cohere); negative-tested
  that a missing file fails the check. ✅
- `npx tsc --noEmit` — clean. ✅
- `node scripts/verify-quiz-axes.mjs` — a-lead balance intact. ✅
- PNG sizes: characterai 13.4 KB, pi 18.2 KB, microsoftcopilot 13.5 KB,
  midjourney 36.6 KB — all < 50 KB.
- Manual QA (dev @ :3999): `?r=ENTP-A` (Grok swirl), `?r=INFP-T` (c.ai + ChatGPT
  emoji fallback), `?r=ENFP-A` (Pi), `?r=ESFJ-A` (MS Copilot ribbon + Midjourney
  sailboat), `?r=ISFP-T` — all five render white-mono on the dark gradient
  avatars with no background rectangle and no pixel breakage.
