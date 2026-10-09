# 마일스톤 지원과 먼저 찾아가는 멘토링 브리프

대상 레포: `website` (커밋 `74e9add` 기준). 바꾸는 파일은 `data/naru.ts`, `components/home/NaruHome.tsx`, `components/shared/RouteMap.tsx`. 배경(WebGL), 레이아웃 규칙(글은 하나의 왼쪽 끝), 글자 크기 셋(TITLE, BODY, META), `/2026-08`, `/quiz`, `/match`, 등록 폼, Supabase는 건드리지 않습니다. 체인지로그는 `CLAUDE.md` 규칙대로 `CHANGELOG.md` 한 곳에만 씁니다. em dash 문자는 쓰지 않습니다.

출처: 사용자 결정(2026-10-10)과 10/07~10/09 미팅 정리. 회의록 문장, 사람 이름, 회사 이름은 레포에 옮기지 않습니다. 같은 내용이 인스타 포스트 P2_05, P4_04(멘토링), P4_06(보상), P4_07(얻는 것)에 이미 들어가 있으니 문구를 맞춥니다.

## 0. 결론 한 줄

**상은 마지막 날 한 팀에게 몰지 않고, Day 1부터 Day 4까지 그날의 마일스톤을 넘은 팀 모두에게 나눕니다. 멘토링은 멘토를 기다리는 자리가 아니라, 이슈에 대한 내 생각을 들고 먼저 찾아가는 자리입니다.** 새 섹션은 만들지 않고, 노선도, 얻는 것, 멘토링, 이렇게 굴립니다 네 자리에 넣습니다.

## 1. 결정과 화면의 지금

| # | 결정 (2026-10-10, 사용자) | 화면의 지금 | 이번 처리 |
| --- | --- | --- | --- |
| 1 | 보상을 1등에 몰지 않고, 날마다 마일스톤을 넘은 팀 모두에게 지원 | `gains.items[3]` "다양한 테마의 수상", Day 4 칩 "시상과 클로징" | **2.1, 2.2, 2.3, 2.4** |
| 2 | 마일스톤 4개: Day 1 내 생각 1장 / Day 2 현업에게 확인받은 문제 정의 / Day 3 코드로 옮긴 결과물과 덱 / Day 4 성과 공유회 완주 | 노선도에 `submit`이 Day 1, Day 3에만 있음 | **2.1** |
| 3 | 멘토링은 학생이 먼저 찾아가 이슈에 대한 자기 생각을 말하고, 들은 이야기로 아이디어를 다듬어 코드로 옮긴다 | `mentoringLead`는 이탈 신호 이야기, 규칙은 "질문은 사전 제출" | **2.5** |
| 4 | 문제는 사람이 찾고, 푸는 것은 AI와 함께 | `find.december` "공개된 정보를 AI로 모아 추론하고" | **2.6** |
| 5 | 마지막 날 이름은 "성과 공유회" (포스트는 SHOWCASE · 공유하는 날) | `flow[3]` "결과 공유회", Day 4 `name` "Pitch" | **2.7** |

무엇을 주는지(현금, 크레딧, 현물), 금액, 지급 방식은 정해지지 않았습니다. 화면에 숫자와 형태를 쓰지 않고 "지원"이라고만 씁니다. (TODO: confirm)

## 2. 바꿀 것

### 2.1 `december.stages[*].milestone` (새 필드) + 노선도

stages 타입에 `milestone?: Phrase`를 더하고 Day 1~4에 넣습니다. Day 0에는 넣지 않습니다.

```ts
// DECIDED 2026-10-10 (사용자): 보상은 마지막 날 한 팀이 아니라, 그날의 마일스톤을 넘은 팀 모두에게.
// Day 1, Day 3의 마일스톤은 기존 submit과 같은 물건입니다. Day 2는 제출이 아니라 멘토·현업의 확인,
// Day 4는 완주입니다. 그래서 "제출은 두 번뿐"(facts)은 그대로 참입니다. 하나를 바꾸면 facts도 보세요.
// Day 1
milestone: { ko: "이슈에 대한 내 생각 1장", en: "One page of your own take on the issue" },
// Day 2
milestone: { ko: "현업에게 확인받은 문제 정의", en: "A problem definition checked with the people who do the work" },
// Day 3
milestone: { ko: "코드로 옮긴 결과물과 덱", en: "Something built in code, plus the deck" },
// Day 4
milestone: { ko: "성과 공유회 완주", en: "Making it through the showcase" },
```

Day 1의 `submit`은 "이해도 1장"에서 마일스톤과 같은 말로 맞춥니다: `{ ko: "이슈에 대한 내 생각 1장", en: "One page of your own take on the issue" }`.

`RouteMap.tsx`: 각 스테이지 행에 마일스톤 한 줄을 META 크기로 그립니다. 앞에 주황 점(현재 위치 점과 같은 `bg-naru-orange`)을 붙입니다. 범례에 항목 하나를 더합니다: `routeLegendMilestone: { ko: "마일스톤 지원, 넘은 팀 모두", en: "Milestone support, for every team that clears it" }`. 기존 "제출이 있는 날" 범례는 그대로 둡니다. 새 글자 크기를 만들지 않습니다.

### 2.2 `gains.items[3]`: 수상에서 하루마다의 지원으로

길이 규칙(본문 36자 이하, 다섯 칸 한 줄)을 지킵니다. 칸 수는 늘리지 않습니다.

```ts
// DECIDED 2026-10-10 (사용자): 상금이나 상에 몰지 않고 날마다 마일스톤별로 모든 팀에게.
// 2026-09-30의 "다양한 테마의 수상"은 Day 4 칩 "시상과 클로징"에 남습니다(D1 기본).
// evidence 키는 지웁니다. 하루 단위 지원은 12월에 처음 하는 것이라 8월 근거가 없습니다.
title: { ko: "하루마다, 모두에게", en: "Every day, for everyone" },
body: {
  ko: "그날의 마일스톤을 넘은 팀은 모두 지원을 받습니다.",
  en: "Every team that clears the day's milestone gets support.",
},
```

D1: 부문별 수상을 아예 없애기로 하면 Day 4 칩 "시상과 클로징"도 "클로징"으로 바꿉니다. 기본은 남깁니다.

### 2.3 `december.facts`: "보상" 한 줄

"제출" 바로 아래에 넣습니다.

```ts
{
  k: { ko: "보상", en: "Rewards" },
  v: {
    ko: "상금을 한 팀에 몰지 않습니다. Day 1부터 Day 4까지 그날의 마일스톤을 넘은 팀 모두에게 나눕니다.",
    en: "No single team takes it all. From Day 1 to Day 4, every team that clears the day's milestone gets a share.",
  },
},
```

### 2.4 `december.also`: 바꾼 것 한 줄

맨 앞에 넣습니다.

```ts
{ ko: "보상을 마지막 날에서 매일로 옮겼습니다. 넘은 팀은 모두 받습니다.", en: "Rewards moved from the last day to every day. Every team that clears the bar gets one." },
```

### 2.5 멘토링: 먼저 찾아가는 자리

```ts
// DECIDED 2026-10-10 (사용자): 멘토링은 학생이 먼저 나섭니다. 질문이 아니라 이슈에 대한 자기 생각을 들고 가서
// 말하고, 들은 이야기로 아이디어를 다듬어 코드로 옮깁니다. fieldMentoring과 같은 원칙입니다.
mentoringHeading: { ko: "먼저 찾아가는 멘토링, Day 1부터 Day 3까지", en: "Mentoring you walk into, Day 1 to Day 3" },
mentoringLead: {
  ko: "멘토는 답을 주러 오지 않습니다. 이슈에 대한 내 생각을 들고 먼저 찾아가 말하고, 들은 이야기로 아이디어를 다듬어 코드로 옮깁니다. 8월에는 슬롯이 넉넉했는데 한 번도 쓰지 않은 팀이 있었습니다.",
  en: "Mentors do not come with answers. You walk in with your own take on the issue, say it, then shape the idea with what you hear and turn it into code. In August there were plenty of slots, and some teams never used one.",
},
```

`mentoringRules`의 둘째 줄 "질문은 사전 제출"을 바꿉니다.

```ts
{ ko: "질문 대신 내 생각 한 장을 들고 갑니다", en: "Bring one page of your own thinking, not a list of questions" },
```

`fieldMentoring.body`의 마지막 문장만 바꿉니다: "그 일을 하는 사람에게 그 자리에서 내 생각을 말하고 의견을 듣습니다." / "tell the people doing that work what you think, and hear them out, right where they work."

### 2.6 `find.december`: 문제는 사람이 찾는다

```ts
// DECIDED 2026-10-10: 공개 정보는 AI로 모으되, 문제는 팀이 세웁니다(포스트 P2_03 "문제는 사람이 찾고, 푸는 건 AI와 함께").
ko: "기업의 이슈를 받습니다. 공개된 정보는 AI로 모으고, 그 아래의 문제는 팀이 직접 세웁니다. 그 생각을 들고 멘토와 현업을 찾아가 확인받은 뒤 코드로 옮깁니다. 팀마다 다른 문제를 찾고, 그 과정에서 각자의 강점이 드러납니다.",
en: "Teams receive a company's issue. They gather public information with AI, and set the problem underneath themselves. They take that thinking to mentors and to the people doing the work, check it, then turn it into code. Each team finds a different problem, and each person's strengths show along the way.",
```

### 2.7 마지막 날 이름: 성과 공유회

- `flow[3]`: "결과 공유회" → `{ ko: "성과 공유회", en: "Showcase" }`
- Day 4 `name`/`title`: "Pitch"/"피치" → `{ ko: "Showcase", en: "Showcase" }` / `{ ko: "성과 공유회", en: "Showcase" }`
- `gains.items[2].body`: `{ ko: "마지막 날 성과 공유회에서, 이슈를 낸 회사와 나눕니다.", en: "On the last day, at the showcase, you share it with the company that brought the issue." }` (36자 이하)
- 화면에 그리는 키에서 "결과 공유회", "Pitch"(Day 4 이름으로 쓰인 것)가 0건이 되게 합니다. `/2026-08` 쪽 8월 기록은 바꾸지 않습니다.

## 3. 하지 않을 것

- 지원 금액, 형태, 지급 방식, 후원사 이름. 정해지면 2.3 문장 뒤에 붙입니다.
- Day 2 `session`의 PO session은 그대로 둡니다(포스트에서는 현장 확인으로 묶었지만 사이트는 fieldMentoring 상자가 따로 있습니다).
- 팀 편성 기준(학교와 나라를 섞는다)은 이번 범위가 아닙니다. 쓰려면 `scheduleLead`와 `gains.items[4]`를 같이 봐야 합니다.

## 4. 검증

- ko, en 두 화면에서 새 문장이 보입니다.
- `gains` 다섯 칸이 1440에서 한 줄. 본문 36자 이하.
- 노선도 마일스톤 줄과 범례가 1440, 1000, 390에서 필, 배지, 아래 블록과 겹치지 않습니다.
- 새 글과 상자의 왼쪽 끝이 READ 왼쪽 끝과 같습니다(1440에서 288px, 390에서 27px). 한 화면 글자 크기 3종 초과 0.
- `/2026-08`, `/quiz`, `/match` 픽셀 차이 0. 빌드 통과.
- 화면에 그리는 키에서 "결과 공유회", "질문은 사전 제출", "AI로 모아 추론" 0건.

## 5. 기록

- `CHANGELOG.md` 맨 위에 `## 2026-10-10 마일스톤 지원과 먼저 찾아가는 멘토링` 항목과 목차 링크. 브리프: docs/milestone-mentoring-brief.md.
- 체인지로그 커밋은 `docs(changelog): 2026-10-10 milestone mentoring`.
- `main` 푸시는 사용자가 검증을 본 뒤에 합니다.

## 6. 사용자 확인 대기 (TODO: confirm)

- 마일스톤 지원의 형태와 금액, 화면 표기 여부
- D1: 부문별 수상을 남길지(기본 남김)
