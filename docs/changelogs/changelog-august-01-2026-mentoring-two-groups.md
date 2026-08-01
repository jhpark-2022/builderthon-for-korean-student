# Changelog — August 1, 2026 (mentoring: two theme groups)

**Project:** Builderthon marketing site (Next.js)
**Branch:** `main`
**Scope:** `components/journey/Journey.tsx` (`<Chapter id="mentoring">`) and
`data/dictionary.ts` (`dict.mentoring`). Judges untouched. No mentor's name, org,
role, intro or LinkedIn changed.

## Why

The previous version (shipped earlier the same day) put three stage cards above
one undivided grid of thirteen mentors, and connected them with a click-to-filter
interaction: pick a stage, matching mentors light up, the rest dim. It worked —
but it was a mechanism a visitor had to *discover* in order to learn something the
layout can simply **be**. Grouping the mentors physically says the same thing with
no affordance at all, and it survives a visitor who never clicks anything.

## New structure

```
멘토링 heading + intro
separationNote            ← moved up: answers a worry, belongs before the names
확정 멘토 · CONFIRMED
  워밍업 · Day 1–2         ← thin strip (한장환 · 김지훈)
  [ 빌드 멘토링 · Day 3–6 ]  ← box, 만들 때 돕는 사람들
      메인 멘토링 파트너: Onword Lab · Popup Studio (logos + span chips)
      6 mentor cards + FDE office-hours placeholder
  [ 피치·세일즈 멘토링 · Day 7 ] ← box, 팔 때 돕는 사람들
      5 mentor cards
matchNote                 ← stays below both boxes
```

### Warm-up strip (Day 1·2)

A line, not a box. 한장환 and 김지훈 run **sessions** (the Day 1 AWS talk, the Day 2
crash course) rather than 1:1 mentoring, and a third box their size would claim
otherwise. Rendered only when someone actually has no stage, so it disappears on
its own if that stops being true.

### Box 1 — 빌드 멘토링 · Day 3–6

Header carries the two **main mentoring partners** as white trimmed logos (the same
assets the hero strip and partner wall use — no tile needed on a dark panel), each
with its own span chip:

| partner | chip |
|---|---|
| Onword Lab | Day 3·4 · 아이디에이션 |
| Popup Studio | **Day 5–7** · FDE 오피스아워 |

The "메인 멘토링 파트너" label is load-bearing, not decoration: most cards in this box
are *not* Onword people (REmited · YMX · T3Q · NTU), and two marks over a list of
faces read as an org chart without it. Popup Studio's chip says **Day 5–7 even
though the box says Day 3–6** — that is when its office hours actually run
(`schedule.ts` `d5/d6/d7-fde-office-hour`), and a chip is never rounded to fit a
box label.

The box ends with a dashed **placeholder card**: Popup Studio sends FDEs on
rotation rather than an assigned mentor, so there is nobody to name yet. The copy
is the old stage-2 card's, which described exactly this.

### Box 2 — 피치·세일즈 멘토링 · Day 7

No partner logos, deliberately. AWS is where several of these mentors work and it
hosts the Day 7 venue, but it has never been named a 메인 멘토링 파트너 — a logo in
that header would say it has. The old stage-3 copy carries the box instead
("데모데이 전, 기술이 아니라 '어떻게 파는가'" · "AWS 등 현직 GTM·세일즈 시니어").

## Data model

- `dict.mentoring.stages` (3 cards) → **`dict.mentoring.groups`** (2 boxes) plus
  `dict.mentoring.warmup`. Each group carries `dayRange` · `title` · `theme` ·
  `sub` · `partnersLabel` · `partners[{name, logo, logoW, logoH, chip}]` ·
  `placeholder`. The old persona/role copy was not discarded — it carries over as
  each group's `sub` and as the placeholder body.
- `mentors[].stages` is **reused unchanged** as the join key: a group lists the
  stage numbers it owns (`[1, 2]` and `[3]`), and cards are matched with
  `m.stages.some(n => g.stages.includes(n))`. Empty `stages` → warm-up strip.
  **No counts, no name lists in the component** — add or drop a mentor in
  `dictionary.ts` and the boxes rearrange themselves.
- Removed with the interaction: `activeStage` / `hoverStage` / `mentorHoverStage`
  state, the filter chip next to the grid label, and the `filterSuffix`,
  `filterClear`, `stageNoMentors` keys. Comments justifying the three-stage layout
  and the filter were replaced with the reasoning above rather than deleted.

## Kept

`separationNote` (moved to the top of the section), `matchNote` (still below both
boxes), `gridLabel` (확정 멘토 · CONFIRMED, now introducing the whole roster),
the mentor card design, and every mentor's data.

## Verification

- `npx tsc --noEmit` and `npm run build` pass.
- Desktop 1440 and mobile 375, both locales: warm-up strip renders two people;
  build box shows 6 cards + placeholder; pitch box shows 5; both logos and their
  chips fit within the panel on a 375px phone with no horizontal overflow
  (measured, not eyeballed); matchNote sits after both boxes; the judges section
  is unchanged.
- Cross-checked the Popup Studio span against `data/schedule.ts` — the office
  hours are Day 5, 6 and 7, so the chip reads Day 5–7.
