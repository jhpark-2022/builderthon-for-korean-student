# Changelog — June 15, 2026

**Project:** Builderthon marketing site (Next.js)
**Branch:** `choi-design-revamp`
**Window covered:** the design-revamp polish cycle through HEAD on 2026-06-15

## Summary

This cycle took the immersive WebGL Builderthon site from a rough redesign to a launch-ready state. The work breaks into three threads: (1) **content & framing** — reworking the "Why this exists" and "Program" sections so the page tells an honest, sourced story; (2) **a sweeping subagent-driven polish pass** across accessibility, performance, UI, security, and types; and (3) **launch readiness** — self-hosted fonts, social/OG cards, SEO files, analytics, and a thorough mobile fit pass down to 360px. The signature violet WebGL hero was preserved throughout every change.

---

## New Features

### "Why this exists" section, told in numbers
**User impact:** The 취지/Why section previously felt empty and jumped straight from intro to belief cards. It now carries real, sourced substance: a "The gap today" stat band (~900 students across NUS·NTU·SMU split school by school; 60–70% ambition-driven students whom social-only events don't serve; 0 standing cross-university platform), plus a "The shift we're building" label that introduces the three belief cards as a problem→answer narrative. Switched to a centered full-width layout so the section no longer reads as a void. All facts sourced from Builderthon materials.
**Technical:** `components/journey/Journey.tsx`, `data/dictionary.ts`.

### Program reframed around learning together
**User impact:** New heading "Six days to learn together, not compete" with intro copy stressing this isn't about ranking. Day 2–5 side sessions are now clearly marked optional: an RSVP note callout plus an "Optional · RSVP" badge on every Day 2–5 non-main card, while the main track (Opening · Founder Sharing · Demo Day) stays the anchor. Visual density lowered (lighter cards/borders, thinner category spine, calmer day headers, more grid gap).
**Technical:** `components/journey/Journey.tsx`, `data/dictionary.ts`.

---

## Enhancements

### Site-wide typography scale-up
**User impact:** Text felt too small and the layout looked empty. Root font size bumped 16px → 18px (`html { font-size: 112.5% }`), which scales every rem-based size, spacing value, and content-rail max-width together — the whole site reads larger and fills the screen. The hero "Build" headline was deliberately held at its current size (clamp caps trimmed to cancel the root bump). Program-card hardcoded px text was converted to rem so it scales too.
**Technical:** `app/globals.css`, `components/journey/Journey.tsx`; scroll-padding-top raised 80→96px to match the taller nav.

### Partner logo normalization (Builders & Partners)
**User impact:** Logos previously rendered at wildly inconsistent sizes and Zero100 showed as a blank white square. Now a single sizing system: wordmarks (popup-studio, codepresso) share a 28px cap-height; square/icon marks (KOMOS lion, Alchemy) use a larger box for equal optical weight. Zero100, which carries a baked-in blue background, is now placed on a white chip (no invert) instead of being blanked out by the invert filter.
**Technical:** `components/journey/Journey.tsx`.

### UI polish pass
**User impact:** Hero stat numbers promoted to the page's largest stats; program "view details" hint made faintly visible so touch users get the affordance; "in discussion" partner tiles restyled as deliberate labels rather than broken loads; Zero100 white-chip glare softened; the event modal got a brand-tinted panel (#0c0a18), tighter eyebrow→heading spacing, repositioned close button with press feedback, and more legible footer copyright. The "gap" stat band gained a faint violet weight to distinguish "the problem" from the belief cards.
**Technical:** `components/journey/Journey.tsx`, `components/EventModal.tsx`, `components/journey/JourneyNav.tsx`.

### Delight / micro-interactions (all reduced-motion-safe)
**User impact:** Hover lift on hero and traction stat tiles; partner logos brighten on hover; "in discussion" dashed tiles get a faint hover; nav links gain a violet underline-wipe; secondary/footer CTAs match the primary CTA's hover lift; primary-CTA arrows nudge on hover. Framer-driven motion: hero stat tiles stagger in on view, and numeric traction stats (3, 6, 18) count up — "~100" intentionally stays static so a number is never animated to a wrong value. All gated behind the existing reduced-motion kill-switch.
**Technical:** `components/journey/Journey.tsx`, `app/globals.css`.

---

## Accessibility

### Reduced-motion now actually covers JS animations
**User impact:** The global CSS reduced-motion kill-switch only zeroed CSS transitions; framer-motion animates via JS/rAF, so the program accordion, FAQ accordion, and event modal still animated for reduced-motion users. These are now gated behind `useReducedMotion()`. (Chapter reveals already snap via the CSS kill-switch.)
**Technical:** `components/journey/Journey.tsx`, `components/EventModal.tsx`.

### Tap targets and iOS safe areas
**User impact:** The EN/KR locale toggle now meets a 44px minimum tap target (was ~31.5px). The modal bottom-sheet gets iOS `safe-area-inset-bottom` padding plus `viewportFit: "cover"` so the home indicator no longer overlaps content.
**Technical:** `components/LocaleToggle.tsx`, `components/EventModal.tsx`, `app/layout.tsx`.

### Focus restore, ARIA, and contrast
**User impact:** Modal focus now returns to the program card that opened it (a `triggerRef` is threaded through; `document.activeElement` is unreliable in Safari). The FAQ accordion announces expanded/collapsed state (`aria-expanded`); the traction count-up exposes its true final value to screen readers (`sr-only`) so a mid-animation number is never read; the Alchemy logo no longer double-announces. A keyboard-only "skip to content" link bypasses the fixed nav. Muted informative text (modal field labels, program times/dates, stat labels, FAQ answers) was lifted out of the failing contrast band toward WCAG AA — a monochrome opacity change only, palette and layout preserved.
**Technical:** `components/journey/Journey.tsx`, `components/EventModal.tsx`, `components/journey/JourneyNav.tsx`, `app/layout.tsx`.

---

## Performance

### Self-hosted Pretendard (LCP)
**User impact:** The font no longer render-blocks on a jsdelivr `@import`. Pretendard is self-hosted via `next/font/local`, served same-origin, preloaded, with a metric-matched fallback so there's no layout shift.
**Technical:** `app/fonts/PretendardVariable.woff2`, `app/layout.tsx`, `app/globals.css` (`--font-sans` now leads with `--font-pretendard`).

### WebGL deferred and skipped when appropriate
**User impact:** The WebGL scene build is deferred to `requestIdleCallback` so it stays off the LCP/hydration critical path, and is skipped entirely under `prefers-reduced-motion` (CSS gradient fallback) — better for low-power and motion-sensitive devices.
**Technical:** `components/Background.tsx`.

### Build/config and dependency cleanup
**User impact:** Faster, lighter installs and better-cached static assets. Dropped dead HeroUI `transpilePackages`; added avif/webp image formats, `optimizePackageImports(framer-motion)`, and 1-year immutable cache headers for png/woff2/svg. Removed unused `@react-three/{drei,fiber,postprocessing}` deps (0 imports — the scene is imperative three + postprocessing), trimming the lockfile substantially.
**Technical:** `next.config.mjs`, `package.json`, `package-lock.json`.

---

## SEO & Launch Readiness

**User impact:** The site is now share- and crawl-ready. Added `metadataBase` + OpenGraph url/siteName + Twitter `summary_large_image`; a generated branded 1200×630 social card; an always-legible branded favicon; `robots.ts` and `sitemap.ts`; and Vercel Analytics + Speed Insights wired into the layout (no env config needed).
**Technical:** `app/layout.tsx`, `app/opengraph-image.tsx`, `app/icon.tsx`, `app/robots.ts`, `app/sitemap.ts`, `package.json`.

### Baseline security headers
**User impact:** Added `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, and HSTS. Added `rel="noopener noreferrer"` to the external Alchemy link.
**Technical:** `next.config.mjs`, `components/journey/Journey.tsx`.

**Deployment notes:**
- `SITE_URL` / `metadataBase` is currently the Vercel prod URL with a TODO to swap to the custom domain before/at DNS cutover — OG, sitemap, and robots URLs all derive from it.
- CSP was intentionally deferred; it needs a live WebGL/OG test pass before enabling.

---

## Mobile

### Layout fit and full-height handling
**User impact:** `min-h-screen` is mapped to `100dvh` via `@supports` so mobile address-bar collapse no longer leaves empty scroll space on full-height chapters. The nav "View Program" CTA is now reachable on mobile (compact below `sm`). Hero stat numbers step down one size at base so "~100" doesn't crowd the 3-column grid on the narrowest screens.
**Technical:** `app/globals.css`, `components/journey/Journey.tsx`, `components/journey/JourneyNav.tsx`.

### Compact nav brand + contained scrim
**User impact:** Below the `sm` breakpoint the nav brand shows only "KOMOS" (the full "KOMOS × Zero100" lockup returns from `sm` up), so brand, EN/KR toggle, and "View Program" CTA all fit on small phones — at 360px the CTA sits 27px from the edge with zero horizontal overflow (it was clipping before). The traction (`#why-partner`) chapter's oversized `w-[140%]` vignette now gets `overflow-x-clip` so it no longer widens the page or triggers horizontal scroll, while its vertical bleed into neighbouring sections is preserved.
**Technical:** `components/journey/Journey.tsx`, `components/journey/JourneyNav.tsx`. Verified at 360px: `docScrollWidth == innerWidth`.

---

## Bug Fixes

### Hero headline descender clipping
**User impact:** "Singapore." looked cut off at the bottom — the gradient `background-clip:text` headline with tight `leading-[0.88]` only painted inside the line box, which was shorter than the glyphs, so g/p/period descenders rendered transparent. Fixed by adding `pb-[0.15em]` so the paint box extends ~19px below the baseline.
**Technical:** `components/journey/Journey.tsx`.

### Type dedup
**User impact:** Internal only. The local `Tfn` translator type now reuses the canonical `Phrase` type from `data/dictionary` instead of an inline `{ ko; en }` literal.
**Technical:** `components/journey/Journey.tsx`.

---

## Verification

Every commit in this cycle was verified with `tsc --noEmit` + `next build`, a fresh `next start` returning 200, and SwiftShader render checks confirming the violet WebGL hero stays intact (plus the CSS gradient fallback under reduced-motion). Launch files (`/robots.txt`, `/sitemap.xml`, `/opengraph-image`, `/icon`) were confirmed serving 200, and mobile fit was checked via DOM measurements down to 360px.
