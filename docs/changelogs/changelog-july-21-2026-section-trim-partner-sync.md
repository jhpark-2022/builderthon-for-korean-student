# Changelog — July 21, 2026 (섹션 정리 + 파트너 월 덱 싱크)

**Project:** Builderthon marketing site (Next.js)
**Branch:** `main`
**Window covered:** a same-day follow-up to the deck content sync — walking the
live site section by section and cutting or correcting what the organizers
flagged on screen.

## Summary

Four asks, all driven by screenshots of the running site: drop the prize card,
drop the partner-pitch section, give the Day 7 career session a speaker card,
and make the partner wall match the deck's partner slide exactly.

The partner wall was the substantive one. It had drifted into a two-stage
taxonomy (확정 / 협의 중, plus a separate 멘토사 tier) that the deck no longer
uses. The deck shows a single confirmed sponsor row where each logo is captioned
with what that sponsor actually provides, so the site now does the same — which
also means the four in-discussion sponsors that aren't on the deck are gone.

## Changes

### 인센티브 — `data/dictionary.ts`

- **`benefits.incentives[0]` ('상금 · 시상') deleted.** The per-track prize and
  internship breakdown (deep-dive 1st = paid FDE internship, S$100, Nuldam and
  Haenyeo's Kitchen vouchers) is still being negotiated, so it comes off the
  page entirely. Two incentive cards remain — 크래시 코스 수료증 and 그 외 혜택.
  A comment records why, and prizes are still mentioned at a high level in
  `benefits.items[5]` (인턴십 · 상금), which was left alone.

### 파트너 안내 (traction) — 섹션 삭제

- **`dict.traction` removed** and the whole `#why-partner` chapter deleted from
  `Journey.tsx`: heading, the four count-up stats (~100 · 3 · 8 · 60%), and both
  '학생들이 원하는 것' / '파트너가 얻는 것' cards.
- **`CountUp`** existed only for those stats, so it went too, along with the now
  unused `useInView` import.
- **`JourneyNav`** — the '파트너' anchor pointed at `#why-partner`, which no
  longer exists; it now lands on the logo wall (`#builders`). This was the one
  thing that would have silently broken: a nav link to a dead anchor.

### 연사 섹션 — Day 7 카드 추가

- A third card for the **Day 7 커리어 간담회 (12:30–14:00)** — the FDE-business
  session for interested students and graduates, the internship/hiring-pool
  connection, and the note that follow-up 1:1s happen after the event closes on
  8/29. Speaker is **박희덕**, confirmed against the deck (the request said
  이병일; the deck and `d7-speaker-session` both say 박희덕).
- Heading updated `Day 1 · 5 · 8` → **`Day 1 · 5 · 7 · 8`**.
- 박희덕 now holds two sessions (Day 7 간담회 + Day 8 키노트) and so appears on
  two cards with the same photo. The list was keyed by `s.img`, which would have
  been a **duplicate React key** — changed to the index. Side benefit: three
  cards fill the `sm:grid-cols-3` row, so the off-centre two-card layout noted
  in the previous changelog is resolved.

### 함께 만드는 사람들 — 덱 슬라이드 그대로

- **후원 티어 통합.** One 확정 row, every logo captioned with its role:
  AWS · INNOVATE 360 · L^IFE (장소) · BZCF (마케팅) · 싱가포르 한인회
  (심사위원 지원) · Onward Lab · REmited (멘토링) · Brand Boost (굿즈) ·
  Hashed (종합 지원).
- **Removed:** the '협의 중' sponsor tier (OpenAI · Workato · EO Studio ·
  Superteam Singapore — none appear on the deck) and the separate 멘토사 tier
  (멘토링 is now just a role caption). Their dictionary labels went with them
  (`sponsorDiscussionLabel`, `catTech`, `catCommunity`, `catVC`, `mentors*`,
  `stageDiscussion`); `partnerIntros` entries were left in place, harmless and
  ready if those partners come back.
- `partners.note` and `stageNote` rewritten — they described a stage-based
  taxonomy that no longer exists, and the note was dated June 2026.
- 주최 · HOST and 주관 · 운영 rows were already an exact match for the deck and
  are untouched.

### 로고 월 (marquee) + 신규 자산

- Every logo on the deck's partner slide now also rides the scrolling band:
  Drimaes, Popup Studio, SMU KSA, NUS Korea Society, NTU KSA, AWS,
  INNOVATE 360, L^IFE, BZCF, 싱가포르 한인회, Onward Lab, REmited, Brand Boost,
  Hashed (Translink · Wilt · Codepresso were already there).
- **`scripts/process-partner-logos.py`** (new) — converts CI-folder originals to
  the wall's convention (white mono on transparent, natural aspect, long edge
  900px). Two source shapes: a dark mark on a light sheet (alpha from darkness,
  so L^IFE's outline letterforms survive) and a colour mark on a flat background
  (alpha from colour distance, then flattened to white). Produces
  `public/partners/logos/white/life.png` (900×352) and
  `korean-association.png` (443×90), 16KB and 6KB.

## Verification

- `npx tsc --noEmit` — clean. `npm run build` — clean (9/9 static pages).
- Eyeballed each changed section on `next dev` at :3999:
  - Incentives: two cards, '상금 · 시상' gone, 각주 intact.
  - Speakers: three cards, Day 7 카드 between Day 1 and Day 8, 박희덕 photo on
    both of his, Day 5 panel footnote still below.
  - Partners: the confirmed row renders 5 + 4 with correct role captions, and
    both new logos read cleanly white-on-dark.
  - Marquee: the new sponsor/organizer logos scroll in with the Zero100 network.
- No dead anchors: `why-partner` appears nowhere outside an explanatory comment.

**Notes:**
- The 로고 롤 band is titled '함께하는 빌더 네트워크' and described as the
  Zero100 network this builderthon grew from. Folding this builderthon's own
  sponsors into it broadens what the band means, so `companionsSub` was widened
  to "…네트워크와 이번 빌더톤의 파트너". If the band should stay strictly the
  Zero100 network, the sponsor logos are one contiguous block at the end of the
  `companions` array and are trivial to lift back out.
- Promoting Brand Boost / Hashed / REmited from 협의 중 to 확정 follows the deck,
  which lists them under 확정 (Confirmed). Worth a sanity check against the
  actual agreements before this goes wide, since it raises a public claim.
