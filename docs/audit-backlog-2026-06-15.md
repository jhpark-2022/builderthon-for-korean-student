# Post-audit backlog — 2026-06-15

Deferred findings from the 8-subagent audit of the marketing site (branch
`choi-design-revamp`). These are **not yet implemented** — they touch visuals,
structure, copy, or strategy and are parked pending product decisions. Safe,
non-visual fixes from the same audits were already shipped.

Constraints to respect for all items: keep the **violet theme**, keep the
**honest / no-hype positioning** (no fabricated stats, no fake logos, no fake
registration), and keep the current layout unless a change is explicitly
approved.

---

## A. Accessibility — remaining contrast (partially done)

The "worst offenders" (informative text at ~2.3–2.9:1) were lifted toward AA.
Still below or borderline AA and **not yet changed**:

- `EventCard` summary text `text-white/45` (`Journey.tsx`, program card summary) — ~3.3:1.
- Program legend descriptions and partner descriptions `text-white/50` — ~3.7:1.
- Secondary disclaimers / notes `text-white/40` (e.g. whoWhat disclaimer, partner notes, swipe hint), footer credits `text-white/35`.
- Borderline body copy at `text-white/55`–`/60` in a few spots.
- Program day-accordion chevron / `+` glyph `text-white/50` vs WCAG 1.4.11 non-text contrast (3:1) — borderline.

**Fix shape:** same monochrome opacity bump (`→ /65–70`), palette preserved.
**Why deferred:** broader visible brightening across the page; wanted a scoped
pass first. Recommend a follow-up "full AA pass" when ready.

---

## B. UX research — copy & strategy (DEFERRED by decision)

Source: ux-researcher audit. All touch copy/strategy and are explicitly parked.

1. **No honest "next step" for students.** The page never states that
   registration isn't open yet, and a convinced student has nowhere to act
   (both footer CTAs lead elsewhere). Consider an honest "applications aren't
   open yet — here's how to be first to know" line + a low-commitment action
   (mirroring the partnership mailto). *(highest-leverage)*
2. **"How / when do I sign up" FAQ missing.** Most predictable unanswered
   student question; the S$30 deposit FAQ implies a signup that's never
   explained.
3. **"RSVP" / "Optional · RSVP" dangles.** The copy implies an RSVP mechanism
   that doesn't exist on the page. Either soften to descriptive language or add
   "RSVP details shared with participants."
4. **Audience hand-off not signposted.** Student → partner transition relies on
   a subtle eyebrow color change; add a short "if you're a company/investor…"
   lead line.
5. **Hero "EN · run in English" may raise anxiety** before the "we train you"
   reassurance appears ~3 sections later. Consider sequencing reassurance
   nearer the hero.
6. **Eligibility edge cases:** Korean students at universities other than
   SMU/NUS/NTU? Year/degree level? Reconcile the hardcoded three-school list
   with the FAQ "and others."
7. **Asterisked "What you get" items** render identically to confirmed ones;
   the partner side's "in discussion" treatment is a cleaner honesty pattern to
   borrow.
8. **Hero "~100" vs traction "~100 Target"** — minor framing consistency for a
   scrutinizing sponsor.
9. **Mobile program accordion** defaults to Day 1 open; the 6-day arc needs
   interaction to see (acceptable; watch-item).

---

## C. Visual storytelling — design / structure (DEFERRED by decision)

Source: visual-storyteller audit. All visual/structural.

1. **Differentiate the three stat bands by role** — hero (identity), gap
   (tension; make the "0" the punchline), traction (proof; emphasize "18
   benchmarked"). They currently read as one repeated gesture.
2. **6-day program timeline "spine"** — a thin violet rail with six nodes above
   the desktop columns to surface the Kick-off→PMF→GTM→Scale-up→Build→Demo-Day
   lifecycle that's currently buried in column headers. (Desktop win.)
3. **Rationalize the eyebrow color system** — map color to meaning, e.g.
   violet = student-facing chapters, cyan = partner-facing; reserve emerald for
   "confirmed" status only (it currently means both "Join" and "confirmed").
4. **Vary section rhythm at the student→partner pivot** — every section is a
   uniform full-viewport fade; one deliberate cadence change (or the unused
   `align="left/right"` editorial offset in `Chapter.tsx`) would mark the act
   break.
5. **Two-tier glass elevation** — one brighter/violet-tinted glass for "the
   point of this section," standard faint glass for supporting content, so the
   eye can rank within a section.
6. **Footer CTA emphasis** — footer repeats the hero's exact CTA pairing; by the
   footer the reader has already explored the program, so the partner ask is
   arguably the more earned primary action there. (Re-order existing asks, not
   add new ones.)
7. **Day-5 "Calm Before the Storm" label** breaks the otherwise-parallel day
   themes; consider treating it as a subtitle under a short node label if the
   timeline (C2) is built.

**Guard:** the WebGL background's calm/restraint is part of the honest tone —
if elevation/contrast is added to the traction section, re-check the count-up
numbers still hold contrast over the field.

---

## Cross-cutting note

The `EventModal` `triggerRef` focus-restore bug and several ARIA gaps (FAQ
`aria-expanded`, count-up `sr-only`, Alchemy `alt`) flagged here were **already
fixed** and are not in this backlog. Likewise the nav "Builders / Partners"
anchor was repointed to `#why-partner`.
