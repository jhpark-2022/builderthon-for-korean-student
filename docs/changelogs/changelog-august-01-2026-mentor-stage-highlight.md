# Changelog — August 1, 2026 (mentoring: stage → mentor highlight)

**Project:** Builderthon marketing site (Next.js)
**Branch:** `main`
**Scope:** `components/journey/Journey.tsx` (`<Chapter id="mentoring">`) and
`data/dictionary.ts` (`dict.mentoring`). The judges subsection was not touched,
and no mentor's name, org, intro or LinkedIn changed — the only data added is a
derived `stages` field.

## Why

The section already answered "who do I meet at each stage" twice — once as three
stage cards, once as a grid of thirteen mentors — but the two lists never
referenced each other. A reader who wanted "so who is with me on Day 3·4?" had to
hold three day strings in their head and scan thirteen pills for matches. The
data to answer it was already in each card (`days`), just not connected.

## What changed

### 1 · Layout: matchNote moved below the grid

The "멘토 매칭은 이렇게 배정돼요" box used to sit between the stage cards and the
mentor grid, on the reasoning that a reader should know the line-up isn't a menu
*before* reading names. Two things overturned that:

- the stage cards now filter the grid, and a filter has to sit next to what it
  filters — anything wedged between them breaks the connection;
- "can I pick one?" is a question the cards *provoke*, not one a reader arrives
  with. Answering it directly under the faces answers it where it is asked.

`separationNote` (심사·멘토링 분리) stays where it was, directly under the stage
cards. The old "Sits directly above the grid on purpose" comment was replaced
with this reasoning rather than deleted.

### 2 · Data: `stages` on every mentor

`dict.mentoring.mentors[].stages: number[]` — 1 = Day 3·4 아이디에이션,
2 = Day 5–7 고도화, 3 = Day 7 피치·세일즈. **Derived from each mentor's existing
`days` / `daysPending`**, never invented:

| stages | mentors |
|---|---|
| `[1]` | 김진호 · 김시훈 · Brian Bae · 김종현 · 황영준 · 이유택 |
| `[3]` | 신동혁 · 이화영 · 임석건 · 이동훈 · 황현진 |
| `[]` | 한장환 (Day 1 세션) · 김지훈 (Day 2 크래시코스) |

`[]` means "outside the three stages" — those cards simply never highlight.
**No mentor carries stage 2**, and that is correct: Day 5–7 is Popup Studio's FDE
office hours, a drop-in with no named mentor, which the grid comment has always
said. Rather than let that dim all thirteen cards with no explanation, selecting
stage 2 shows `dict.mentoring.stageNoMentors` above the grid.

### 3 · Interaction

- Stage cards are now `<button aria-pressed>`; clicking one filters, clicking it
  again clears. Keyboard reaches them natively, and `focus-visible` gets the same
  ring the selected state uses.
- Matching mentors take an emerald border, a lifted background and an emerald day
  pill; the rest drop to `opacity-45` — dimmed, still readable, still clickable
  (dimming is a hint, not a disable). Only colour and opacity animate: no width,
  height or reordering, so the flex-wrap layout never moves.
- **Two state values, not one.** `activeStage` is a click and survives scrolling;
  `hoverStage` is a mouse preview that dies with the pointer. Click wins
  (`activeStage ?? hoverStage`), so a stray mouse-over can't destroy a filter the
  visitor just set.
- **Active-filter chip** next to the 확정 멘토 label ("Day 3·4 멘토 ✕"), shown only
  for a clicked filter. The stage cards are a screen above the grid on a phone —
  without the chip a dimmed grid reads as broken rather than filtered. Its text is
  built from `stages[].day` + `dict.mentoring.filterSuffix`, so the day string is
  never written twice.
- **Reverse highlight:** hovering a mentor lights up their stage card, answering
  "and when do I meet this person" without moving your eyes back up. It only
  lights the card — it does not filter.
- **Hover is mouse-only** (`onPointerEnter` + `e.pointerType === "mouse"`). A tap
  fires a synthetic mouseenter with no matching mouseleave, which would have left
  the grid dimmed by a preview a touch visitor can neither see the cause of nor
  clear.
- `useReducedMotion` — with reduce on, every transition class is dropped and the
  states swap instantly.

## Verification

- `npx tsc --noEmit` and `npm run build` pass.
- Desktop 1440 and mobile 375, both locales, driven with real input:
  - click stage 1 → 6 lit / 7 dimmed, `aria-pressed="true"`, chip "Day 3·4 멘토"
  - click stage 3 → 5 lit / 8 dimmed, chip "Day 7 멘토" / "Day 7 mentors"
  - click stage 2 → no cards match, explanation shown
  - second click and chip ✕ both restore 13 lit / 0 dimmed
  - real mouse hover previews without clicking; leaving restores
  - hovering a Day 7 mentor lights stage 3 while the grid stays untouched
  - simulated touch tap leaves no sticky preview
- Dimmed opacity is 0.45, above the 0.35 legibility floor.
- No horizontal overflow at 375px.
- The audit browser reports `prefers-reduced-motion: reduce`, so the reduce path
  is the one that was exercised throughout; transitions were verified separately.
