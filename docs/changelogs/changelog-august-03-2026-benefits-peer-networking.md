# Changelog — August 3, 2026 (혜택 04 · 또래 네트워킹)

**Project:** Builderthon marketing site (Next.js)
**Branch:** `main`
**Scope:** `data/dictionary.ts` — `dict.benefits.items[3]` (04 네트워킹) `points`
only. No component, no other card, no schedule data.

## The problem

Every point on the 네트워킹 card pointed **upward**:

| | old point |
|---|---|
| 1 | 대표·경력자와 Day 1·5·7·8 현장 교류 |
| 2 | 박희덕·원대로 대표님 등 연사 세션 |
| 3 | 패널·공유 세션으로 technical 그 이상의 인사이트 |

Founders, working seniors, speakers, panels — all vertical. The thing a student
actually signs up for, **meeting other students**, appeared nowhere in the
benefits section. That gap became conspicuous once the same 8/3 feedback round
re-pointed Day 5 at student-to-student networking (see
`changelog-august-03-2026-day5-networking-pivot.md`): the programme now leads
with peers while the benefits section still led with seniors.

## The new order — 또래 → Day 5 → 선배

```
1  NUS·NTU·SMU에 흩어져 있던 또래 한인 빌더들 — 팀으로 만나 8일을 함께 만듭니다
2  Day 5는 통째로 네트워킹 데이 — 전원이 처음 한자리에 모이는 날, 해시드와 함께 기획 중
3  대표·현직 경력자와의 현장 교류와 연사·패널 세션 — Day 1·5·7·8
```

EN pairs:

```
1  The Korean student builders scattered across NUS, NTU and SMU — you meet them
   as a team and build the eight days together
2  Day 5 is a networking day end to end — the first time everyone is in one room,
   being planned together with Hashed
3  In-person exchange with founders and working seniors, plus speaker and panel
   sessions — Days 1·5·7·8
```

Three points in, three points out — the card keeps its title, its number and its
position in the six.

**Why the order matters mechanically, not just editorially:** `BenefitCard`
renders only the first two points below `sm` (`i > 1 && !open` → hidden), the
rest behind 더 보기. So on a phone the card *is* its first two lines — and those
are now 또래 and Day 5. A note at the key records this so the order isn't
casually reshuffled back.

**Point 3** compresses the three old lines into one. All three said the same
thing (vertical exchange with seniors), and making room for peers meant saying it
once. "Day 1·5·7·8" is carried over verbatim — it was already the only place that
list appears in copy (`grep`-checked; the only other occurrence is a comment at
`dict.program.stats`), and Day 5 becoming a networking day makes it *more*
accurate, not less.

## Consistency with `schedule.ts`

Point 2's status wording tracks the Day 5 entry exactly — "네트워킹 데이 (기획 중)",
"해시드(Hashed)와 함께 기획하고 있습니다". The card says **기획 중 / being planned**,
never a confirmed programme. A comment at the key says the two must move together
and that the hedge stays until the joint programme is actually settled.

## Guardrails honoured

- **No community promise.** "지속되는 한–싱 빌더 커뮤니티의 시작 멤버" was removed
  once before as an unconfirmed commitment; that removal note is kept and extended
  rather than replaced. The community arc belongs to the vision section, which
  hedges it properly ("…이어지게 설계하고 있습니다"); as a benefit bullet it would
  read as a settled deliverable.
- **No headcount.** No "100명" or any participation figure — the site avoids scale
  numbers throughout, and the note now says so at the point where someone would be
  tempted to add one.
- **Spine untouched.** `dict.benefits.spine` ("이 8일이 남기는 단 하나") and cards
  01·02·03·05·06 are unchanged. The peer line is a networking point, not a second
  competing headline claim.

## Verification

- `npx tsc --noEmit` → 0; `npm run build` → ✓ compiled, 10/10 static pages
- Rendered KR + EN at 1280px (all three points visible) and KR at 375×780 mobile
  emulation (collapsed card shows exactly the 또래 + Day 5 lines above 더 보기;
  horizontal overflow 0)
- `grep "Day 1·5·7·8"` → one copy string (this point) + one comment; no
  contradiction anywhere

## Files

- `data/dictionary.ts` — `dict.benefits.items` 04 네트워킹 `points` (3 new
  `{ko,en}` pairs) plus the ordering / hedge / removal notes.
