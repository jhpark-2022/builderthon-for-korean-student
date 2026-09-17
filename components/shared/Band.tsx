// MOVED HERE 2026-09-17 (8월 문법 브리프). components/journey/Journey.tsx에서
// 정의만 옮겼습니다. 마크업과 클래스는 한 글자도 바뀌지 않았고, 8월 페이지는
// 같은 파일을 import 합니다. 나루 홈이 같은 문법을 쓰기 위해서입니다.

// ─────────────────────────────────────────────────────────────────────────────
// SECTION BACKGROUND TINT — two steps, one token, nothing in between.
//
// INVENTORY (before this was unified), section-level tints only:
//   #program     bg-[#0a0814]/45 + h-24 top/bottom fades
//   #companions  bg-[#0a0814]/55 + h-20 top/bottom fades
//   everything else (Chapter: about · join · benefits · speakers · mentoring ·
//                    builders · faq · vision)  — no tint at all
// Two bands, two opacities, two fade heights. Scrolling from a /45 band into an
// untinted chapter and later into a /55 one produced three different background
// levels, and the eye reads the third as an error rather than a rhythm.
//
// Now: BASE (no tint, WebGL field as-is) or BAND (this one value). 45 and 55
// both collapse into 50 — the midpoint, so neither section moves much — and
// every band gets the SAME fade height, so no band can announce its edge.
// Any new section picks one of the two; a third opacity is the bug.
// The band tint FADES ITSELF at both ends instead of being a flat fill with two
// dark gradients laid over its edges.
//
// The old shape was `bg-[#0a0814]/50` on the whole section plus a `/50`
// top-to-transparent gradient at each edge. That does the opposite of blending:
// at the very edge you get tint AND fade (0.5 over 0.5 ≈ 0.75 alpha), and one
// pixel outside the section you get 0. The edge was the DARKEST part of the band
// and the discontinuity was maximal — which is why the seam was still visible
// entering the speakers chapter, and why simply making the fade taller only made
// the dark strip taller without touching the step.
//
// A single vertical gradient has no step at all: transparent at the boundary,
// full tint 10rem in, held flat through the body, back to transparent. Both band
// sections (#program, #companions) share it, so no edge can drift from another.
export const BAND_TINT =
  "bg-[linear-gradient(to_bottom,transparent,rgba(10,8,20,0.5)_10rem,rgba(10,8,20,0.5)_calc(100%_-_10rem),transparent)]";
/**
 * Kept as a no-op so every band section keeps one obvious place to opt into edge
 * treatment, and so the two call sites don't have to change shape. The fading now
 * lives in BAND_TINT itself — see the note there for why overlay gradients could
 * not soften an edge they were painted on top of.
 */
export function BandFades() {
  return null;
}
