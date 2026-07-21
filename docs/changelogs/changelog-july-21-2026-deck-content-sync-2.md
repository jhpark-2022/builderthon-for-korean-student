# Changelog — July 21, 2026 (덱 → 웹사이트 콘텐츠 싱크 2차)

**Project:** Builderthon marketing site (Next.js)
**Branch:** `main`
**Window covered:** the second pass of syncing the site against the latest
`Zero100_Builderthon_deck_수정본.pptx` — Day 5 rebuilt around the deck's confirmed
timeline, the career session moved from Day 8 to Day 7, and the track vocabulary
renamed.

## Summary

Content only. No background scenes, animations, layout structure or component
logic were touched, and the registration path (RegisterModal, `app/api`,
`lib/supabase*`) and `/quiz` were left alone entirely.

Day 5 was the biggest change: it is no longer a "recharge + 이병일 패널" day. Per
the deck it is now a **mid-point check-in and exchange day** at *SCAPE (10AM–2PM)
built around the student AI use-case showcase with a QR popular vote, the
'유학생에서 창업가로' panel (still being arranged), and cross-track exchange.

Confidence wording was preserved throughout — nothing was promoted from
잠정/섭외 중/TBC to confirmed. The three Day 5 panelists and the Haenyeo's Kitchen
voucher are both marked as tentative, exactly as the deck has them.

## Changes

### Day 5 — `data/schedule.ts`, `data/dictionary.ts`

Rebuilt against the deck's confirmed timeline: 10:00 오프닝·중간 점검 → 10:15 AI
빌더 커뮤니티 소개(이수민) → 10:30 학생 AI Use Case 발표·QR 인기투표 → 11:35 패널
'유학생에서 창업가로' → 12:15 시상 → 12:25 런치 → 13:00 크로스트랙 교류.

- **`days[4]`** — theme `오프라인 킥오프 · 패널` → **`중간 점검 · 교류`**
  (`Mid-point · Exchange`); summary rewritten off the deck's language and the
  이병일 mention dropped. The Day 5 line in the file-header comment was updated to
  match.
- **`d5-kickoff`** — keeps the '첫 현장 집결 · Lab 2 시작' beat but now opens on the
  10:00 mid-point check-in and the 10:15 AI-builder-community intro (이수민,
  carrying the usual `// TODO: confirm public naming` note).
- **`d5-panel-usecase`** — the QR popular vote and the 12:15 Top 3 award
  ('해녀의 부엌' S$25 dining voucher, Singapore branch · tentative) added to both
  summary and description.
- **`d5-panel-founding`** — fully replaced. Was `패널 2 · 이병일 · 멘탈관리와
  회복탄력성`; now `패널 · 유학생에서 창업가로 (섭외 중)` /
  `Panel · From Int'l Student to Founder (TBC)`. The `speaker` field was **removed**
  rather than filled — the three panelists aren't locked, so there is no honest
  name to show. The description (11:35) carries the insight/pain + student Q&A
  framing lifted from the old Day 7 panel copy.
- **`d5-networking`** — retitled `크로스트랙 교류 세션` / `Cross-track Exchange`,
  anchored at 13:00 with the 12:25 lunch beat named.

### Day 7 — `data/schedule.ts`

- Time corrected **9AM–1:30PM → 9AM–2PM** in all three places it appeared: the
  file-header comment, `days[6].summary`, and `d7-final-rehearsal`
  (summary + description, ko/en).
- **`d7-speaker-session`** replaced. Was the international-student founder panel
  talk (that content now lives on Day 5); it is now the **박희덕 커리어 간담회 ·
  12:30–14:00**, aimed at students and graduates interested in the firm's FDE
  business, i.e. a route into the internship/hiring pool. The description closes
  by noting that follow-up 1:1 conversations and mentoring (for those who want
  them) run after the event closes on 8/29 at 3PM, on-site or at 널담.
- `days[6].summary`: '유학생 창업가 패널' → '박희덕 커리어 간담회'.

### Day 8 — `data/schedule.ts`

- **`d8-career-session` deleted.** The 간담회 moved to Day 7 and the 1:1s are now
  after the event, so the 11:10 slot no longer exists.
- **`d8-opening-keynote`** — now states 11:00~ and about an hour explicitly.
  `d8-judging` (12:00) and `d8-final-pitch` (14:30) are unchanged, so the Day 8
  card goes 3 sessions instead of 4 with no gap in the timeline.

### 연사 섹션 — `data/dictionary.ts`

The deck's speaker slides are now just Day 1 원대로 and Day 8 박희덕. `Journey.tsx`
renders `<Image src={s.img}>` per person and keys off `s.img`, so a photo-less
teaser card isn't possible without changing component logic — option **(b)** was
taken instead:

- `speakers.people` reduced to the two speakers; the 이병일 card removed.
  `public/partners/logos/speaker-lee.jpeg` was **left in place**, not deleted.
- `speakers.tbcNote` now leads with the Day 5 '유학생에서 창업가로' panel (three
  founders, 섭외 중) before the existing line about the line-up not being final —
  so the section heading (`Day 1 · 5 · 8`) still tells the truth.

### 트랙 어휘 · 인센티브 · 히어로 — `data/dictionary.ts`

- **Normal / Beginner → 딥다이브 / 스프린트.** `Normal 2트랙(재무·영업)` →
  `딥다이브 2트랙(재무·영업)` / `Deep Dive tracks`; `Beginner 트랙(마케팅)` →
  `스프린트 트랙(마케팅 · 입문)` / `Sprint track (marketing · beginner)`;
  `유급 인턴은 Normal 트랙만` → `유급 인턴은 딥다이브 트랙만`. Both
  `benefits.items[5]` and `benefits.incentives[0]` carried the old names.
- **`benefits.incentives[0]`** gained a bullet for the separate AI Use Case
  award: Day 5 학생 AI 활용 사례 발표 · QR 인기투표 Top 3 = '해녀의 부엌' $25
  다이닝 바우처(싱가포르 지점) · 잠정.
- **`benefits.items[3]`** (네트워킹) — `박희덕·원대로·이병일 등 연사 세션` →
  `박희덕·원대로 등 연사 세션`; the Day 5 use-case bullet now names the QR vote.
- **`hero.location`** — `싱가포르 · *SCAPE L^IFE Jungle` →
  `싱가포르 · *SCAPE L^IFE Jungle & AWS 오피스` (EN to match), since Day 7 is at
  the AWS office.

## Verification

- Residue grep over `data components` for
  `이병일|Byung-il|1:30PM|11:10|Normal 트랙|Normal track|Beginner` — **zero hits.**
  The only surviving `beginner` strings are lowercase descriptive uses that were
  already there and are still accurate (the RegisterModal track option
  `마케팅 (입문) / Marketing (beginner)` and the FAQ's "marketing is the beginner
  track"), neither of which is the removed track *label*.
- Invariants confirmed unchanged: dates 08.22–08.29, 팀 1–3, the "1,000" Korean
  students figure, S$100 and the 널담 $25 voucher. No `코참` or `6,000` anywhere.
- `npx tsc --noEmit` — clean. `npm run build` — clean (9/9 static pages).
- Eyeballed on `next dev` at :3999: the Day 5 card reads 중간 점검 · 교류 / 4 세션
  and its modal lists all four sessions in the right order with the new times;
  Day 7 reads `AWS 오피스 9AM–2PM · … 박희덕 커리어 간담회` / 2 세션; Day 8 is 3
  세션. The speakers section renders the two remaining cards with the Day 5 panel
  noted underneath.

**Notes:**
- The speakers grid is `sm:grid-cols-3`, so with two cards the row now sits
  left-of-center with an empty third column. It renders fine and reads as
  deliberate enough, but it's the one place a layout tweak (centering the row, or
  letting a card render without a photo) would look better — deliberately not
  done here since layout/component logic was out of scope for this pass.
- `speaker-lee.jpeg` is now unreferenced but intentionally retained.
