# Changelog — July 18, 2026 (deck content sync)

**Project:** Builderthon marketing site (Next.js)
**Branch:** `main`
**Source of truth:** `Slide Dump/Actual Use/Zero100_Builderthon_deck_수정본.pptx`
**Window covered:** aligning the site's program/track/award content with the
revised deck. **Content (text/data) only** — no background scenes, animation,
effects, layout structure, or component logic were touched. Every change was
applied to both `ko` and `en`, keeping the honest labelling convention
(unconfirmed items stay "조율 중 / 잠정 / TBC" — never promoted to confirmed).

## Summary

The site had drifted a version behind the deck. Five thematic passes brought it
back in sync, committed separately:

1. **Speaker rotation** was off by one slot — realigned to the deck.
2. **Day 2** "문제 영상 공개" → live per-track briefings.
3. **Day 3–4** mentoring is in person at **NUS (F2F)**, not online.
4. **Day 1 / 7 / 8** detailed timetables updated.
5. **Tracks 2 → 3**, the deck's **award structure**, and global checks.

---

## 1 · Speaker rotation (`data/schedule.ts`, `dict.speakers`)

Commit `ac28fd3`. The three keynote/panel speakers were each one slot out:

| Slot | Was (wrong) | Now (deck) |
|---|---|---|
| Day 1 opening keynote | 박희덕 · 제로백의 진짜 의미 | **원대로** (WVB SG · MD) · **취업과 창업의 사이** (~1h + Q&A) |
| Day 5 Panel 2 | 원대로 · AI 시대의 창업 | **이병일** (WVB SG · Venture Partner) · **멘탈관리와 회복탄력성** |
| Day 8 keynote | 이병일 · 멘탈관리와 회복탄력성 | **박희덕** (Translink · CEO·GP) · **제로백의 진짜 의미** (~1h) |

Rewrote each event's title/speaker/summary/description, the D1/D5/D8 day
summaries, and the `dict.speakers.people` cards (with the matching speaker
images). Folded in the Day-1 details: `dayMode: offline → pending` (on-site
targeted, Zoom fallback), problem release adds **트랙 선택**, and the AWS session
names its confirmed speaker **한장환** — all with `// TODO: confirm public naming`
notes.

## 2 · Day 2 track briefings (`data/schedule.ts`)

Commit `8ab6a36`. `d2-problem-video` (the deprecated "문제 영상 공개 & 팀 빌딩")
became **트랙별 라이브 브리핑 & 팀 빌딩** — after the crash course, each track's
client contact presents the problem/process live (recorded for replay), then
team building. Day 2 summary updated to match.

## 3 · Mentoring at NUS, F2F (`data/schedule.ts`)

Commit `8ab6a36`. `d3-mentoring` / `d4-mentoring` `mode: online → offline`, new
`NUS` location constant; the self-build stays online (mixed day → conveyed via
the summary "(NUS 대면)"). Replaced the "멘토 라인업 안내" placeholder with the
**confirmed mentors** — 황영준 (T3Q·AI), 신동혁 (AWS·GTM), 한장환 (AWS·SA),
이유택 (NTU·前 Naver) — under a public-naming TODO.

## 4 · Day 7 & Day 8 timetables (`data/schedule.ts`)

Commit `ed4a20c`.
- **Day 7:** Final Rehearsal is AWS office **9AM–1:30PM** (09:00–11:30 per-team
  feedback → 11:30–12:30 networking/lunch); the generic speaker session became
  the concrete **12:30–13:30 panel talk with Singapore international-student
  founders**.
- **Day 8:** reshaped to the deck's flow — added **박희덕's 11:10 career session
  + 1:1 interviews** (FDE/hiring pool); "심사" → **12:00 same-space per-track
  5-min pitches** (dropped the outdated per-Problem-Statement judging rooms);
  "최종 발표" → **14:30 results · awards · certificates · group photo** (dropped
  the Top-3 impromptu-pitch / 11AM–3PM framing).

## 5 · Tracks 3, awards, global checks (`data/dictionary.ts`)

Commits `3d634dc`, `2124fda`.
- **Tracks 2 → 3:** replaced "세일즈·재무 2트랙" (benefits · FAQ) with **재무 ·
  영업 · 마케팅(입문)** and the "출제가 아니라 의뢰 — 주니어 컨설턴트" framing;
  "세일즈" unified to "영업"; client names kept at "조율 중".
- **Awards:** spelled out the deck's structure with a mandatory **"잠정 · 조율 중"**
  label — Normal ×2 (1st paid FDE intern · 2nd S$100 · 3rd Nuldam voucher),
  Beginner (1st S$100 · 2nd/3rd voucher), interns Normal-track only, plus the
  "AXMOS 학생 TF" virtuous-loop narrative.
- **Global checks:** team size **1–3 → 1–5** (solo OK · matching optional, dropped
  "4인 지양"); added a judging-criteria FAQ (understanding 20 · idea 25 ·
  demo↔idea 30 · feasibility 15 · delivery 10; wireframe-level prototype OK).
  Verified 1,000 student count consistent (no 6,000), no "코참" mentions, dates
  08.22–08.29 throughout.

---

## Verification

- `npx tsc --noEmit` — clean.
- `npm run build` — compiled successfully, 9/9 static pages.
- `node scripts/verify-quiz.mjs` — all Sidon + explanation invariants hold
  (quiz does not depend on schedule content, so the program edits have no
  fallout).
- Self-review: ko/en both edited everywhere; PENDING/TENTATIVE items kept at the
  deck's labelling level (never promoted to confirmed).
