# Changelog — August 3, 2026 (정거장 원칙)

**Project:** Builderthon marketing site (Next.js)
**Branch:** `main`
**Scope:** `components/journey/Journey.tsx` (`#program` section), `data/dictionary.ts`
(`dict.program`). `data/schedule.ts` was **read only** — `days[].mandatory` is the
single source of truth for every ★, count and pill added here.

## The problem

The programme is two required days and six optional ones. That fact lived in four
prose places:

| where | text |
|---|---|
| hero paragraph | "필참은 첫날과 마지막 날 이틀뿐" |
| `dict.program.modeNote` | "필참 2일 — Day 1 오프닝 · Day 8 데모데이" |
| FAQ "왜 8일이나 하나요?" | "필참은 Day 1(오프닝)과 Day 8(데모데이)뿐" |
| `mandatoryBadge` on two cards | "★ 필참" |

None of it was in the **structure**. Below those sentences sat eight cards of
identical size, weight, border and tint, in a 4×2 grid. A grid of eight equal
boxes asserts eight equal obligations, and it asserts it faster than a sentence
can deny it — the grid is what people scan, the prose is what they skip. The
result read as "eight days of programme", which is the single most likely reason
a student decides they cannot afford this.

## The principle

Each day is a **정거장** — a stop on the way to Day 8, where the work is put in
front of the companies and the judges. Two stops are terminals you have to be at.
The other six you choose to get off at. "선택" here means *you pick your pace*,
not *this day is filler*; the guardrail below is what keeps that reading.

## Layer A — route map strip (`RouteMap`)

Sits between the section intro and the day grid, so the grid is read *through*
it.

- Eight nodes on one rail, left to right.
- **Day 1 · 8** — 28px filled rose node with ★ and a `필참` pill under the label.
  Derived from `d.mandatory === true`. No day numbers are hardcoded anywhere.
- **Day 2–7** — 12px outline node. The shared label is stated **once** in the
  legend (`선택 정거장` / `Optional stop`) rather than repeated eight times.
- Each node carries `Day n` + a one-word keyword derived from `days[].theme`
  via `stopKeyword()` — first segment before `·`, parentheses stripped
  (`"크래시코스 (집중)"` → `크래시코스`, `"오프닝 · 문제 공개"` → `오프닝`).
  Derived, not duplicated, so a node can never drift from the card heading below.
- Nodes are buttons → `setActiveDay(day)`, the same modal the cards open.
- Terminus marker, right-aligned under Day 8: `→ 데모데이 — 기업·심사위원 앞 검증`.
- Principle line below, centred, `13px→sm:14px` semibold at `text-white/80` —
  deliberately between the section heading and the `modeNote` box in the
  hierarchy, because it is the section's thesis rather than a caption.

### The second line — why the six are worth choosing

`route.optionalValue`, directly under the principle at `text-xs→sm:13px`,
`text-white/60`:

> 나머지 여섯 정거장은 그냥 늘어난 일정이 아니에요. 결과물을 더 의미 있게 만들기
> 위해 직접 고르는 준비 과정이자 중간 정거장이고, 하나하나 내려설 이유가 있도록
> 설계했습니다.

Stating that six of eight days are optional and stopping there invites a worse
misread than the one being fixed: that those six are padding. The principle says
*you choose*; this says *and each was built to be worth choosing, because it makes
what you hand in on Day 8 better*. The two are one claim — keep them adjacent, and
do not drop the second when editing the first.

### Mobile

The strip keeps its shape and scrolls; it does not restack. A route that wraps to
two rows stops being a route.

- `-mx-6 px-6 sm:mx-0 sm:px-0` on an `overflow-x-auto` wrapper — the negative
  margin exactly cancels the section's `px-6` so the scroll area runs edge to
  edge instead of ending inside the gutter.
- Inner `min-w-[600px] sm:min-w-0` — below 600px the container scrolls rather
  than crushing eight nodes.
- Node sizes are fixed px (`h-7 w-7` vs `h-3 w-3`), so the required/optional
  hierarchy is viewport-independent. Verified at 375×780 (mobile emulation):
  anchors 32px, optional 14px, `scrollsInternally: true`.

### Motion

No entrance, loop or scroll-driven animation was added — only the hover colour
transitions the rest of this file already uses. `prefers-reduced-motion`
therefore needs no new branch here. If a draw-in animation is ever added to the
rail, it must go behind `useReducedMotion()` like every other motion in Journey.

## Layer B — obligation on every card

- Non-required days get a `선택` / `Optional` pill in the same slot as `★ 필참`,
  at `bg-white/[0.06] text-white/45`, borderless. It has to stay quieter than the
  anchors: a high-contrast pill on six cards would make the two terminals compete
  with them, which is the misread being fixed.
- Because every non-required day now carries one, the *absence* of a 선택 pill is
  itself the signal on Day 1 · 8.
- Day 1 · 8 cards move from `border-white/[0.08] bg-white/[0.03]` to
  `border-rose-400/25 bg-white/[0.055]`. Rose because that is already the 필참
  hue on the badge inside them and on the route terminals above — one meaning,
  one colour. Held to a border/tint step: anything stronger greys out the other
  six, which contradicts "stops you choose".
- Both branches read `day.mandatory` only.

## Layer C — stat line (`ProgramStats`)

Directly under the section heading, because "how much of my August does this
take" is the first question and it was previously answerable only by reading the
amber box four blocks further down.

| stat | value | source |
|---|---|---|
| 필참 / Required | **2일** | `days.filter(d => d.mandatory === true).length` |
| 선택 / Optional | **6일** | `days.length - required` |

Required is rose, optional neutral. Note line beneath: "현장 4일 중 시간을 비워야
하는 날은 Day 1·8 이틀뿐이에요."

### The third stat, and why there isn't one

The brief suggested `필참 2일 · 선택 6일 · 온라인 중심`. Two problems, in order:

1. **"온라인 중심" is not true.** `dayMode` is `offline` on Day 1 · 5 · 7 · 8 —
   the split is 4 on-site / 4 online, and `modeNote` one block down lists a 현장
   row of its own. The phrase would have contradicted a live block on the same
   screen. It was first replaced with the honest computed count, `온라인 4일`.
2. **The count was then cut too.** With three numbers the rule stopped answering
   one question. This line exists to answer "how many days do I owe you";
   online-vs-on-site is a different axis that `modeNote` already covers properly.
   Two stats also sum to the whole programme (2 + 6 = 8), so the pair reads as
   complete where a third read as a stat dump.

The on-site reassurance the removed stat was reaching for now lives in the note
line, which says it without asserting anything false. `dict.program.stats.online`
was deleted along with the row; the "do not add a third" reason is recorded at
the key.

## Cross-check against the four existing places

All four still say two required days, and every new number is computed from the
same flag, so they cannot drift apart:

- hero "필참은 첫날과 마지막 날 이틀뿐" ↔ stat `필참 2일` ✅
- `modeNote` "필참 2일 · Day 1 오프닝 · Day 8 데모데이" ↔ route terminals ✅
- FAQ "필참은 Day 1과 Day 8뿐" ↔ principle line "Day 1·8 이틀뿐" ✅
- `mandatoryBadge` on exactly two cards ↔ two ★ nodes, two rose cards ✅

`modeNote`, the FAQ answer and the hero paragraph were **not** edited — they are
now the detail behind the structure rather than the only carrier of it.

## Bug found while verifying

The stat dividers were written `bg-white/12` and compiled to nothing — `/12` is
off Tailwind's default opacity scale, and this repo expresses fine alphas as
arbitrary values (`bg-white/[0.03]`, `/[0.04]`, `/[0.06]`). The rule rendered as
three unseparated numbers. Fixed to `bg-white/[0.14]`, spacing widened to
`mx-5 sm:mx-9`.

## Pre-existing, not introduced — **RESOLVED 2026-08-03**

At 375px the document overflows horizontally by 18px. The culprits are the hero
marquee track and a decorative `-inset-x-10 -z-10` glow layer, both of which
predate this change; the route strip is not among the overflowing elements and
handles its own width via internal scroll. Recorded here so it is not attributed
to this work later — it is worth a separate fix.

> **Resolved** later the same day — see
> `changelog-august-03-2026-horizontal-overflow.md`. The marquee was removed
> outright (the hero partner strip is static now) and the glow layer's bleed was
> matched to the rail padding. Document overflow is 0 at 375px and 320px, with an
> `overflow-x: clip` guard on `html`/`body` as a safety net.

## Files

- `components/journey/Journey.tsx` — `stopKeyword()`, `RouteMap`, `ProgramStats`;
  `DayCard` badge branch + anchor border; both blocks mounted in `#program`.
- `data/dictionary.ts` — `dict.program.stats` (2 rows), `dict.program.route`
  (legend · destination · principle · optionalValue · ariaLabel),
  `dict.program.optionalBadge`. All copy `{ko, en}`.
- `data/schedule.ts` — unchanged.

## Verification

- `npx tsc --noEmit` → 0
- `npm run build` → ✓ compiled, 10/10 static pages
- KR + EN at desktop; KR at 375×780 mobile emulation (strip scrolls, hierarchy
  holds, 선택 pills render on Day 2–7)
- Node → day-modal wiring confirmed against `setActiveDay`
