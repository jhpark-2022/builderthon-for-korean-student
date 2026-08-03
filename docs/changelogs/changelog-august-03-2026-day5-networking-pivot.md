# Changelog — August 3, 2026 (Day 5 → 네트워킹 데이)

**Project:** Builderthon marketing site (Next.js)
**Branch:** `main`
**Scope:** `data/schedule.ts` (single source of truth), `data/dictionary.ts`,
`components/journey/Journey.tsx` (comment only). All copy `{ko, en}`.

## The decision

Feedback settled that Day 5 (8/26 수, *SCAPE) is **not** there to serve the
cohort's technical needs — its job is to get students meeting each other. The day
was re-pointed at **student-to-student networking**, and the programme is being
designed with **Hashed**. Nothing about it is agreed yet.

So the day's on-site session list — five entries written for the old frame — was
emptied and replaced by **one honest placeholder**. Publishing five
half-committed sessions for a day whose actual shape is unknown is the failure
mode this repo's hedging convention (조율 중 · 섭외 중 · 검토 중) exists to avoid;
here the whole *day* is the thing in planning, not one line inside it.

## Removed from `schedule.ts`

| id | what it was |
|---|---|
| `d5-kickoff` | 오프라인 킥오프 · 10:00 중간 점검 + 10:15 커뮤니티 소개 |
| `d5-panel-usecase` | 패널 1 · 참여자 AI Use Case + QR 인기투표 (검토 중) |
| `d5-panel-founding` | 패널 · 유학생에서 창업가로 (섭외 중) |
| `d5-networking` | 크로스트랙 교류 세션 (13:00) |
| `d5-quickathon` | Quickathon 사이드 퀘스트 (검토 중, ~4h, 해시드 논의 중) |

**Kept:** `d5-fde-office-hour`. It is Popup Studio's separate **online** Day 5–7
track, not part of this day's on-site programme — removing it would have
contradicted the mentoring section's "Day 5–7 오피스아워" in three places
(`dict.mentoring` groups, the mentor-matching FAQ, the Day 6 · 7 copy).

## Added — `d5-networking-day`

```
category: "network" · mode: "offline" · timeOfDay: "AM" (placeholder)
location: ONSITE (*SCAPE L^IFE Jungle — unchanged)
org: HASHED_ORG · confirmed: NOT SET
dayLabel: "Day 5 · 08.26 (수) · 시간 확정 예정"
```

- **title** 네트워킹 데이 (기획 중) / Networking Day (in planning)
- **summary** *SCAPE 현장 · 전원이 처음으로 한자리에 모이는 날 — 학생 간 네트워킹에
  초점을 맞춘 프로그램을 해시드(Hashed)와 함께 기획하고 있습니다. 확정되는 대로
  공개해요.
- **description** expands it: the day's purpose is meeting people (teammates seen
  only on screen, teams from the other track), the programme is being co-designed
  with Hashed, shape *and* hours still open, attendance optional (필참 is still
  Day 1 · 8 only), and the FDE office hours are flagged as a separate track.

`confirmed` is deliberately **not** set — the unconfirmed state is the fact.

### Time

The old 10AM–2PM was the deleted line-up's frame, so it is gone from the day
summary. `timeOfDay: "AM"` stays only because `BEvent` requires it, and the modal
chip is overridden with `dayLabel` so the UI never shows a bare "AM" for a time we
don't have. `BEvent.dayLabel`'s comment (previously "only the pre-event session
uses it") now records both users. TODO at the field: on confirmation, set the real
`timeOfDay` and delete the `dayLabel`.

## `days[5]` dayMeta

- `theme` 중간 점검 · 교류 → **네트워킹 (기획 중)** / Networking (in planning).
  Not "네트워킹 데이" — the route-map stop label is derived from this field
  (`stopKeyword()`: head segment before `·`, parentheses stripped), and the strip
  wants the single word **네트워킹 / Networking**. The event title keeps 데이.
- `summary` rewritten, and deliberately **not** a reword of the event's own
  summary: with one session carrying the whole day, the day modal was printing
  near-identical sentences back to back. The day line now gives the frame
  (온라인 구간을 지나 다시 현장으로 · 시간 확정 예정), the card gives the programme.
- `dayMode: "offline"`, date, venue and optional status all unchanged.

## Hashed

`HASHED_ORG.desc` moved from the Quickathon to the networking day, keeping the
hedge required for a partner who has agreed to plan *with* us, not to run a fixed
session:

> 해시드는 블록체인·프론티어 테크 투자사로, Day 5 네트워킹 데이의 프로그램을 저희와
> 함께 기획하고 있습니다 (세부 구성 논의 중).

The partner wall / hero strip entries for Hashed (종합 지원) are untouched.

## Derived surfaces synced

| surface | change |
|---|---|
| route strip (`RouteMap`) | Day 5 keyword 중간 점검 → **네트워킹** — derived from the new `theme`, no code change |
| `dict.program.modeNote` 현장 row | "Day 5 중간 점검 · Day 7 파이널 리허설" → "Day 5 **네트워킹 데이** · Day 7 파이널 리허설 — 참여는 선택" |
| benefits 06 인턴십·상금 | deleted "Day 5 AI Use Case Top 3 · 널담 바우처 · 논의 중" |
| FAQ "상금이나 현금 지원이 있나요?" | deleted the same sentence from both ko and en |
| benefits 04 네트워킹 | **kept** "Day 1·5·7·8 현장 교류" — more accurate now, not less |
| `dict.speakers` comment | Day 5 stays out of the Day 1·7·8 heading; its only claim (the founder panel) no longer exists at all |
| session counts | derived from `realSessions()` — Day 5 falls 6 → **2** on its own |

The award went with the session on purpose: no session, no prize. Both places that
carried it are cross-referenced in each other's comments so they move together.

Comments in `schedule.ts` (`BEvent.selfPaced`) and `Journey.tsx` (`isSelfPaced`)
justified the explicit self-paced flag by pointing at the Day 5 Quickathon, which
no longer exists. Both were rewritten rather than the inference changed — every
`build` event happens to carry the flag today, and the next scheduled build
session would break `category === "build"` inference again.

## Left alone (verified, not stale)

`Day 5–7 FDE 오피스아워` in the mentoring groups, the mentor-matching FAQ, the
Day 4 check-in form ("막힌 팀을 Day 5–7 오피스아워로 연결"), the Day 6 · 7 session
copy, the participation FAQ ("현장 일정은 Day 5·7 세션뿐이고(선택)"), and the
Day 1 problem-brief line ("전원이 한자리에 모이는 다음 기회는 Day 5"). All still
true after the pivot.

## Verification

- `grep` for 중간 점검 · AI Use Case · 유학생에서 창업가로 · Quickathon/퀵커톤 ·
  크로스트랙 · QR 투표 across `**/*.ts(x)` → only historical comments remain
- `npm run build` → ✓ compiled, 10/10 static pages
- Rendered at localhost: Day 5 card reads `네트워킹 (기획 중)` + **2 세션**; day
  modal shows the two cards (네트워킹 데이 · FDE 오피스아워) with no empty-state
  awkwardness; event modal chip reads `Day 5 · 08.26 (수) · 시간 확정 예정` and the
  Hashed org block carries the 기획 중 hedge
- Route strip node reads `Day 5 · 네트워킹`

## Note for the next edit

The summary line "전원이 **처음으로** 한자리에 모이는 날" is scoped by the "*SCAPE
현장 ·" prefix that opens it — Day 1 is also an all-hands in-person day, at SMU.
The description says it precisely ("온라인으로 이어지던 8일 중, 전원이 처음으로
*SCAPE L^IFE Jungle에 모이는 날"). If the summary is ever edited, keep the venue
scoping.

## Files

- `data/schedule.ts` — header day-5 note, `BEvent.selfPaced` + `dayLabel`
  comments, `days[5]`, `HASHED_ORG`, the Day 5 event block
- `data/dictionary.ts` — `program.modeNote` 현장 row, `benefits` cards 04 · 06,
  FAQ prize answer, `speakers` comment
- `components/journey/Journey.tsx` — `isSelfPaced` comment only
