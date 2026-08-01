# Changelog — August 1, 2026 (final-output & brief framing)

**Project:** Builderthon marketing site (Next.js)
**Branch:** `main`
**Source of truth:** organizer transcripts, 7/29–7/31 (definition of the final
deliverable and of the AX brief)
**Scope:** content only — four surfaces, no new section, no schedule data
touched. Every string is a `{ko, en}` pair; English is written to the site's
existing idiom rather than translated literally.

## Why

The site described eight days in detail and never said **what a team hands in at
the end of them**, or **what the problem looks like when it arrives**. Two
consequences: "8일, zero에서 MVP까지" read as "ship a finished product", and
"실제 기업의 진짜 문제" was a claim with nothing behind it — a reader had no way
to picture what lands on Day 1.

Both facts were settled in the 7/29–7/31 discussions:

- **Final output = three parts.** ① the client's real workflow, as you read it
  ② where that flow jams and how AI unjams it — your idea ③ a demo with impact
  that backs the idea up. The demo is **evidence**, not the point; the weight of
  the presentation sits on the idea.
- **The problem arrives as an AX brief** on Day 1: the company's real workflow,
  the pain points of the person who owns it, and the surrounding context and data.
- The company has an answer sheet, and **an approach that isn't on it is welcome**
  — the most welcome thing, in fact.
- Student positioning stays what the site already said: a **junior consultant**
  placed inside the client company.

## What changed

### 1 · New "최종 아웃풋" block at the head of the programme section

`data/dictionary.ts` (`program.outputTag` / `outputHeading` / `outputSteps` /
`outputNote`) · `components/journey/Journey.tsx` (`id="program"` head)

Sits between the section heading and the pending/mode notes, so the eight
day-cards below read as steps toward a deliverable rather than a calendar.

- **Heading** — 데모데이에 내는 건 코드가 아니라, 하나의 제안입니다 /
  "What you present isn't code — it's a proposal"
- **Three steps** — 워크플로우 이해 → 병목 진단 + AI 해법 → 증명하는 데모
  (Read the workflow → The bottleneck, and the AI fix → A demo that proves it).
  Step ③ carries the load-bearing clause: **완성도가 아니라 설득력** /
  "persuasive, not polished".
- **Note under the strip** — every session across the eight days is a stop on the
  way to these three; the company has an answer sheet, and the approach that
  isn't on it is the one they want most.

Markup reuses the benefits flow strip's visual grammar (bordered violet boxes
joined by `→`, horizontal from `sm`, stacked below it) plus a numbered pill per
box. Verified at 1440 and at 390 px in both languages: three stacked rows on
mobile, no horizontal overflow.

### 2 · What the brief contains (benefits card 02)

`data/dictionary.ts` — `benefits.items[1].points`, one line added:

> 문제는 'AX 의뢰서'로 — 실제 업무 워크플로우, 담당자의 페인포인트, 맥락과
> 데이터가 함께 Day 1에 공개
> *(The problem arrives as an AX brief — the real workflow, the owner's pain
> points, plus context and data, released on Day 1)*

This is what makes the 주니어 컨설턴트 framing on the line above it possible;
without it, "의뢰" is a prompt with a nicer name.

### 3 · FAQ "테마가 뭔가요? 너무 막연해요."

One sentence woven into the existing answer (flow and every other claim
untouched):

> 의뢰서에는 그 회사의 실제 업무 워크플로우와 담당자의 페인포인트, 관련
> 맥락·데이터가 담깁니다.

### 4 · FAQ "심사는 어떻게 하나요? 기술이 완벽해야 하나요?"

The answer now opens with the deliverable before the rubric — someone asking how
judging works is really asking what they have to hand in:

> 제출물의 뼈대는 ① 워크플로우 이해 ② 병목 진단과 AI 해법 아이디어 ③ 이를
> 뒷받침하는 데모입니다 — 기술 완성도는 심사 기준이 아닙니다. …

**Weightings are untouched:** 회사·문제 이해도 20 · 아이디어의 적절성 25 ·
데모↔아이디어 정합 30 · 도입 가능성 15 · 발표·전달 10 (75% for
understanding + idea + alignment). The three parts map onto them in the same
order, which is why the sentence sits in front rather than replacing anything.

## Deliberately not written

- **No presentation time split.** The "4분:1분"-style guidance from the
  transcripts is internal and unsettled; the site says the weight is on the idea
  and stops there.
- **No new emphasis on track count.** The existing "메인 트랙 2개로 좁혀 논의 중"
  in the theme FAQ stays as-is; nothing new asserts a number.
- **No presenter names, no KorCham mention.**
- **No new vocabulary.** Reuses AX(AI 전환) · 의뢰 · 주니어 컨설턴트 · 바이브 코딩.

## Verification

- `npx tsc --noEmit` and `npm run build` pass.
- Rendered checks in both locales: the output strip (desktop 1440 + mobile 390,
  stacks to three rows, no overflow), the new benefits bullet, and both FAQ
  answers expanded.
- Cross-checked against `data/schedule.ts` (untouched): `d1-problem-release` /
  `d1-problem-deep-dive` (problems released and briefed on Day 1) and the Day 8
  pitch entries carry no claim that contradicts the new copy.
