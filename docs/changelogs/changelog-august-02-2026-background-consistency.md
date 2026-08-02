# Changelog — August 2, 2026 (background consistency)

**Project:** Builderthon marketing site (Next.js)
**Branch:** `main`
**Scope:** `components/journey/Journey.tsx` (section tint bands),
`lib/background/{renderer/PostFX.ts, particles/ParticleField.ts,
shaders/particles.vert.ts, shaders/particles.frag.ts}`. Hero and closing staging
untouched; the phase system is intact — only the *amplitude* of its changes moved.

## Layer A — section tint bands

### Inventory (before)

| section | tint | fades |
|---|---|---|
| `#program` | `bg-[#0a0814]/45` | h-24 top + bottom, `/45` |
| `#companions` | `bg-[#0a0814]/55` | h-20 top + bottom, `/55` |
| `#about` `#join` `#benefits` `#speakers` `#mentoring` `#builders` `#faq` `#vision` | none | — |

Two bands, two opacities, two fade heights. Scrolling from a `/45` band into an
untinted chapter and later into a `/55` one gives three background levels, and
the eye reads the third as an error rather than a rhythm.

### After — two steps, one token

- `BAND_TINT = "bg-[#0a0814]/50"` — 45 and 55 collapse to their midpoint, so
  neither section moves much.
- `<BandFades />` renders both edges from `BAND_FADE_TOP` / `BAND_FADE_BOTTOM`:
  the same gradient, both at **h-24** (the taller of the two — at 20px the
  companions edge was still visible on a wide screen).
- Sections are now **BASE** (no tint) or **BAND** (this token). A third opacity is
  the bug. New sections pick one of the two; nothing repeats a literal.

## Layer B — WebGL phase amplitude

### Inventory of phase-driven values

| where | was | now | why |
|---|---|---|---|
| `PostFX.setPhase` bloom | `0.6 + portal*0.6` | `portal*0.25` | `portal` maxes at 0.3, so bloom swung 0.60→0.78 (~+30%) top-to-bottom |
| `PostFX` lens strength | `reveal*0.22 + portal*0.45` | `reveal*0.12 + portal*0.22` | `reveal` runs 0→1 across the whole page — anything it multiplies is a total change in how the field reads |
| `particles.vert` inward/swirl | `reveal*1.2 + pull*3.0` / `reveal*0.5 + portal*2.5` | `reveal*0.9 + pull*2.2` / `reveal*0.4 + portal*1.8` | displacement feeds `vSpeed`, which feeds both size and alpha |
| `particles.vert` `vSpeed` | `+ uPull*0.5` | `+ uPull*0.25` | biggest single amplifier of lower-page brightening |
| `particles.vert` size | `vNear*uPortal*0.8`, `*(1+vSpeed*1.2)` | `*0.35`, `*(1+vSpeed*0.6)` | growth toward the portal is what turned points into discs |
| `particles.vert` point cap | `34px * DPR` | `22px * DPR` | above ~22px a blurred point stops reading as light and starts reading as a circle over the text |
| `particles.frag` trail alpha | `mix(a, a*1.6 + 0.2, vSpeed)` | `mix(a, a*1.25 + 0.06, vSpeed)` | the additive term put a floor under every fast particle — the lower page glowed as a whole instead of sparkling |
| `particles.frag` heat | `vNear*uPortal*0.8` | `*0.4` | hue shift toward the hot highlight — the *tone* half of the complaint |
| `ParticleField` opacity ramp | `HERO .8 → CONTENT .30 → FOOTER .12` | `.8 → .34 → .22` | the footer sat at 40% of the middle's brightness, so every local variation on top of a moving floor read as a jump. HERO untouched. |

Transitions still interpolate through the same smoothstep ramps — no new steps
were introduced, and `prefers-reduced-motion` still damps `intensity` to 0.3.

## Measurement

Screenshots at 10/28/42/56/70/84% scroll, 1440×900. The first pass measured whole
frames and was useless — a frame's mean is dominated by whatever content is on
screen (an FAQ panel vs a sparse section), not by the background. The usable
method hides content (`main, header, footer { visibility: hidden }`) so only the
fixed WebGL canvas is captured, at identical scroll offsets before and after
(before = `git stash` of `lib/background`).

| | mean-luminance range across the page | max adjacent step |
|---|---|---|
| before | 11.00 – 13.92 (**1.27×**) | +23.3% (the 70→84% step — the FAQ/vision stretch the report named) |
| after | 11.27 – 13.31 (**1.18×**) | 15–17% |

**Noise floor: 11.9%** — two captures at the *same* scroll position differ by that
much, because the field animates continuously. So the adjacent-step figures are
at the edge of what this method can resolve; the range statistic (1.27× → 1.18×,
i.e. ±9% around the mean) is the trustworthy one, and it meets the ±15% target.
The qualitative change is unambiguous in the side-by-side: the large soft discs
behind the FAQ are gone, replaced by a diffuse glow.

Contrast: the band change is at most ±5 opacity points on two sections, and card
borders/text over both were checked at 1440. The `#program` → `#speakers`
boundary — the reported seam — now fades with no visible edge
(`.shots/bg-seam-after.png`).

## Shots

`.shots/bg-before/`, `.shots/bg-after/` (with content, six positions),
`.shots/bgonly-before/`, `.shots/bgonly-after/` (field only, four positions),
`.shots/bg-noise/` (noise floor), `.shots/bg-seam-after.png`.
