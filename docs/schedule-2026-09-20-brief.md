# 일정 브리프: 크로싱 서울 일정 PDF를 화면에 반영합니다

대상 레포: `website` (커밋 `c4de111` 기준). 바꾸는 곳은 `data/naru.ts`의 `december` 블록과 `components/home/NaruHome.tsx`의 프로그램 표 렌더입니다. 배경, 등록 라우트, 수파베이스, `/2026-08`은 건드리지 않습니다.

출처: `크로싱서울_일정.pdf` (방향 01 / 흐름 02 / 전반 03 / 후반 04). 05장(FDE 소양)은 사용자 지시로 이번 반영에서 제외합니다. PDF를 레포에 넣지 마세요. 이 브리프가 옮길 내용을 전부 담고 있습니다.

## 0. 결론 한 줄

화면의 일정이 **하루씩 어긋나 있고, 멘토링 약속이 사실과 다릅니다.** 그리고 PDF에서 가장 날카로운 장치(AI 활용 범위 셋)가 화면에 없습니다.

## 1. 지금 화면과 PDF의 차이

| 항목 | 지금 화면 | PDF | 성격 |
| --- | --- | --- | --- |
| 날짜 | Day1 12.10 · Day2 12.11 · Day3 12.12 · Day4 12.13 | Day0 12/10 · Day1 12/11 · Day2 12/12 · Day3 12/13 · Day4 12/14 | **하루씩 밀림. 틀린 정보** |
| 첫 칸 | "트랙 선택", 본 일정 전 | "Context Open", Day 0 (날짜 있음) | 성격이 바뀜 |
| 멘토링 | "전 기간 상시" | Day 1부터 Day 3까지. Day 3에 피칭 준비로 어젠다 전환. Day 4는 멘토링 없음 | **틀린 약속** |
| 세션 | Problem Discovery(D1) · PO session(D2) · Pitching session(D3) | 활용 Guide(D0) · Sharing session(D1) · PO session(D2) · Empower session(D3) | 셋 중 둘이 교체, 하나 추가 |
| 제출 | 정의서(D1) · 결과물(D3) | 이해도 1장(D1) · 덱 등 사전 제출물(D3) | 이름 구체화 |
| AI 활용 범위 셋 | 없음 | 8월은 셋 중 하나만 썼음 | **새 내용** |
| 공간 · 기록 | 없음 | 4일 아침부터 저녁까지(마지막 날 제외) · 하루 끝 일지 10분 · 팀 단위 체류 시간 | 새 내용 |

날짜와 멘토링 둘은 **지금 화면이 사실과 다른 것**이라 다른 항목보다 먼저입니다.

## 2. [P0] 스테이지 다섯을 PDF대로

`data/naru.ts`의 `december.stages`를 아래로 바꿉니다. `dayOffset`은 `DECEMBER_STARTS_AT`(12/10)에서 며칠 뒤인지이므로 **첫 칸이 0이 되고 나머지가 하나씩 올라갑니다.**

```ts
    // DECIDED 2026-09-20 (크로싱서울_일정.pdf 02·03·04): 날짜가 하루씩 밀렸습니다.
    // 12/10이 Day 0(Context Open)이고 Day 4가 12/14입니다. 전에는 12/10이 1일차,
    // 첫 칸이 "본 일정 전"이었습니다.
    //
    // 첫 칸의 성격이 바뀐 것이 요점입니다. "본 일정 전"은 날짜가 없는 준비였는데,
    // Day 0은 날짜가 붙고 3시간짜리 세션이 있는 하루입니다. 다만 스테이지는
    // 아닙니다(아래 note). 다섯 칸을 같은 무게로 그리지 마세요.
    stages: [
      {
        name: { ko: "Context Open", en: "Context Open" },
        title: { ko: "컨텍스트 열기", en: "Opening the context" },
        when: { ko: "Day 0", en: "Day 0" },
        dayOffset: 0,
        body: {
          ko: "데이터와 회사 소개, 의뢰 문제점, 활용 가이드를 엽니다. 정제해서 주는 것이 아니라 무엇이 어디에 있는지까지입니다.",
          en: "The data opens, with the companies, what they are asking about, and a guide to using it. Not cleaned up for you. Just where everything is.",
        },
        line: {
          ko: "Day 1에 쓸 시간을 벌어 주는 장치이지, 별도의 스테이지가 아닙니다.",
          en: "It buys back time for Day 1. It is not a stage of its own.",
        },
        chips: [{ ko: "데이터 공개", en: "Data opens" }],
        session: {
          title: { ko: "활용 Guide", en: "Using it" },
          body: { ko: "데이터와 도구를 어떻게 쓸지 짚는 3시간 세션", en: "Three hours on how to use the data and the tools" },
        },
      },
      {
        name: { ko: "Discovery", en: "Discovery" },
        title: { ko: "문제 발견", en: "Discovery" },
        when: { ko: "Day 1", en: "Day 1" },
        dayOffset: 1,
        body: {
          ko: "팀을 먼저 서로 확인합니다. Day 0에 각자 세운 생각을 꺼내 맞춰 보고, 출제사가 직접 여는 세션에서 회사를 봅니다.",
          en: "First you meet your team. You put the thinking you did on Day 0 side by side, and the company opens its own session.",
        },
        // PDF 03에서 가장 강한 한 줄입니다. 8월과 12월의 차이를 한 문장이 말합니다.
        line: {
          ko: "8월에 출제사가 완성해서 준 문제집을, 12월에는 학생이 이 날 만듭니다.",
          en: "In August the company handed over a finished problem set. In December you write it, on this day.",
        },
        chips: [{ ko: "팀 매칭", en: "Team matching" }],
        session: {
          title: { ko: "Sharing session", en: "Sharing session" },
          body: { ko: "출제사가 직접. 회사와 의뢰 문제", en: "The company itself, on what it does and what it is asking" },
        },
        submit: { ko: "이해도 1장", en: "One page on what you understood" },
      },
      {
        name: { ko: "Build", en: "Build" },
        title: { ko: "빌드", en: "Build" },
        when: { ko: "Day 2", en: "Day 2" },
        dayOffset: 2,
        body: {
          ko: "오전 안에 돌아가는 첫 버전을 만들고 계속 고칩니다. 무엇을 만들지는 바뀔 수 있습니다. 다만 Day 1의 정의가 바뀌면 운영진에게 알립니다.",
          en: "You get a first working version up in the morning and keep fixing it. What you build can change. If the Day 1 definition changes, you tell the organisers.",
        },
        line: { ko: "추가 제출 요구는 없습니다.", en: "Nothing extra to hand in." },
        chips: [{ ko: "방향 전환은 팀의 몫", en: "Changing course is yours to call" }],
        session: {
          title: { ko: "PO session", en: "PO session" },
          body: { ko: "현업에서는 무엇에 집중하는지. 안 만들 것도 여기서 정합니다", en: "What people in the job actually focus on, and what they decide not to build" },
        },
      },
      {
        name: { ko: "Refine", en: "Refine" },
        title: { ko: "다듬기", en: "Refine" },
        when: { ko: "Day 3", en: "Day 3" },
        dayOffset: 3,
        body: {
          ko: "정의한 지표로 결과를 확인하고, 틀리는 경우를 직접 찾아 한계로 정리합니다. 피칭 연습을 팀끼리 서로 보여주고 의견을 주고받습니다.",
          en: "You check the result against the measure you set, hunt for the cases where it fails, and write those down as limits. Teams show each other their pitch and trade notes.",
        },
        // 8월에 없었던 자리라는 것이 이 날의 요점입니다(PDF 04, gaps[2]와 같은 사실).
        line: { ko: "팀 사이 공유는 8월에 없었던 자리입니다.", en: "Teams sharing with each other did not exist in August." },
        chips: [{ ko: "멘토링은 이 날까지", en: "Mentoring ends here" }],
        session: {
          title: { ko: "Empower session", en: "Empower session" },
          body: { ko: "창업과 커리어를 다루는 3시간 세션", en: "Three hours on starting something, and on careers" },
        },
        submit: { ko: "덱을 포함한 사전 제출물", en: "The deck and what goes with it" },
      },
      {
        name: { ko: "Pitch", en: "Pitch" },
        title: { ko: "피치", en: "Pitch" },
        when: { ko: "Day 4", en: "Day 4" },
        dayOffset: 4,
        body: {
          ko: "청중은 회사 관계자입니다. 발표 5분, 질의 5분. 아이디어 단계여도 무대에 섭니다. 완성도가 아니라 과정을 봅니다.",
          en: "You present to the people from the companies. Five minutes, then five for questions. You go up even if it is still an idea. What gets looked at is the process, not the finish.",
        },
        // #after 챕터와 같은 말입니다. 여기서는 일정 안의 사실로, 저기서는 챕터로.
        line: { ko: "여기서 만난 사람과 기회를 이어가는 것은 각자의 몫입니다.", en: "Carrying on with the people and the chances you met here is yours to do." },
        chips: [{ ko: "멘토링 없음", en: "No mentoring" }, { ko: "시상과 클로징", en: "Awards and closing" }],
      },
    ] as { /* 아래 3장의 타입을 쓰세요 */ }[],
```

### 2.1 타입과 렌더

`workshop`을 `session`으로 이름만 바꿉니다. PDF가 부르는 이름이 워크샵이 아니라 세션입니다. 새 필드는 없습니다.

```ts
    } as {
      name: Phrase;
      title: Phrase;
      when: Phrase;
      dayOffset: number;
      body: Phrase;
      line: Phrase;
      chips: Phrase[];
      /** 그날의 3시간 세션. 전에는 workshop이었습니다. */
      session?: { title: Phrase; body: Phrase };
      submit?: Phrase;
    }[],
```

프로그램 표(표현 방식 브리프 4장에서 만든 것)의 렌더는 필드 이름만 `workshop`에서 `session`으로 바뀝니다. 그 외에는 손대지 않습니다.

`dayOffset`이 이제 전부 숫자이므로 `null` 분기를 지웁니다. 다섯 칸 모두 `formatDecemberDay`가 날짜를 붙입니다.

### 2.2 Day 0을 다른 무게로

다섯 칸이 같은 굵기면 Day 0이 스테이지로 읽힙니다. PDF가 "별도의 스테이지가 아닙니다"라고 못박고 있어요. 표에서 Day 0 행만 `text-white/55`로 한 단 낮춥니다. 행을 지우거나 접지는 마세요.

## 3. [P0] 멘토링을 사실대로

지금 화면이 세 자리에서 "전 기간 상시"라고 약속하는데 PDF는 Day 1부터 Day 3까지입니다.

```ts
    mentoringHeading: { ko: "General Mentoring, Day 1부터 Day 3까지", en: "General Mentoring, Day 1 to Day 3" },
    mentoringAlways: { ko: "Day 1부터 Day 3까지", en: "Day 1 to Day 3" },
    mentoringRules: [
      { ko: "예약제, 30분 슬롯", en: "By booking, 30-minute slots" },
      { ko: "질문은 사전 제출", en: "Questions submitted ahead" },
      { ko: "슬롯 횟수 제한 없음", en: "No cap on how many slots" },
      // 2026-09-20 (PDF 02·04): 마지막 줄이 "마지막 날에는 새 방향을 제안하지 않음"
      // 이었습니다. 이제 마지막 날에는 멘토링 자체가 없습니다.
      { ko: "Day 3에 피칭 준비로 어젠다가 바뀝니다", en: "On Day 3 the agenda switches to pitch prep" },
      { ko: "Day 4는 멘토링 없이 증명만 합니다", en: "Day 4 is proving it, with no mentoring" },
    ] as Phrase[],
```

`december.shape`의 여섯 번째 칸도 같이 고칩니다.

```ts
      {
        value: { ko: "3일", en: "3 days" },
        label: { ko: "멘토링", en: "Mentoring" },
        note: { ko: "Day 1부터 Day 3까지, 예약제", en: "Day 1 to Day 3, by booking" },
      },
```

`december.changes`에 "상시 멘토링"이 들어간 문장이 있으면 같이 고칩니다. **레포 전체에서 "전 기간 상시"를 검색해 남는 자리가 없게 하세요.**

## 4. [P1] AI 활용 범위 셋

PDF 01의 가장 날카로운 장치입니다. "8월은 셋 중 하나만 썼다"가 12월이 왜 다른지를 한 눈에 말합니다.

`december.gaps`(8월에 아쉬웠던 넷) **바로 위**에 놓습니다. 지금 gaps 첫 항목이 같은 이야기를 덜 선명하게 하고 있어서, 이 셋이 그 항목의 근거가 됩니다.

```ts
    scopeLabel: { ko: "학생이 도전할 수 있는 AI 활용 범위", en: "What students can take on with AI" },
    scopeNote: { ko: "8월은 셋 중 하나만 썼습니다", en: "August used one of the three" },
    scope: [
      { num: "i",   title: { ko: "다량의 Data 분석", en: "Analysing a lot of data" },   when: { ko: "12월에 더한다", en: "Added in December" } },
      { num: "ii",  title: { ko: "복잡한 Process 이해", en: "Understanding a complex process" }, when: { ko: "12월에 더한다", en: "Added in December" } },
      { num: "iii", title: { ko: "아이디어의 코드화", en: "Turning an idea into code" }, when: { ko: "8월에 한 것", en: "What August did" } },
    ],
    scopeClose: {
      ko: "아이디어를 LLM에 맡긴 것은, 그 전의 두 가지를 통한 본인 아이디어 구축이 없었기 때문입니다.",
      en: "Ideas got handed to the LLM because the two steps before it, the ones that build your own idea, were missing.",
    },
```

렌더는 **3열 행 하나**입니다. 카드를 만들지 마세요(표현 방식 브리프 2장). 헤어라인으로 나누고, iii은 `text-white/45`로 한 단 낮춰 "지난 것"으로 보이게 합니다. i과 ii의 `when`만 accent 색입니다.

## 5. [P1] 공간과 기록

PDF 02 하단의 네 칸 중 셋이 새 내용입니다. 프로그램 표 아래 한 줄짜리 정보 행으로 둡니다.

```ts
    factsLabel: { ko: "이렇게 굴립니다", en: "How it runs" },
    facts: [
      { k: { ko: "세션", en: "Sessions" },
        v: { ko: "모두 3시간씩. 따로 떼어 내도 하나의 이벤트로 쓸 수 있는 퀄리티로 만듭니다.", en: "Three hours each, built to stand on their own as an event." } },
      { k: { ko: "공간", en: "Space" },
        v: { ko: "4일 동안 아침부터 저녁까지. 마지막 날은 제외입니다.", en: "Open morning to evening for four days. Not the last day." } },
      { k: { ko: "제출", en: "Submissions" },
        v: { ko: "두 번뿐입니다. Day 1 이해도 1장, Day 3 덱 등 사전 제출물.", en: "Twice only. One page on Day 1, the deck and what goes with it on Day 3." } },
      { k: { ko: "기록", en: "What gets recorded" },
        v: { ko: "하루 끝 일지 10분, 팀 단위 체류 시간.", en: "Ten minutes of notes at the end of each day, and how long each team stayed." } },
    ],
```

**"장소"와 "공간"을 섞지 마세요.** 장소(어디인가)는 여전히 미정이고 `tbd`에 있습니다. 여기서 말하는 것은 운영 방식입니다.

## 6. [P2] 8월에 아쉬웠던 것의 문장 보강

PDF 01이 `gaps[0]`과 같은 것을 더 정확하게 말합니다. 첫 항목만 문장을 바꿉니다. 나머지 셋은 그대로.

```ts
        body: {
          ko: "기업 프로세스 이해가 중요한데, 데이터를 가지고 프로세스를 그려 보고 고쳐 본 것이 아니라 문제 접근법만 받았습니다. 생각의 기회가 거기서 닫혔고, 만든 것이 서로 비슷했던 것도 같은 이유입니다.",
          en: "Understanding the company's process matters, and what arrived was an approach to the problem rather than a chance to map that process from the data and revise it. That is where the thinking stopped, and it is why the builds resembled each other.",
        },
        answer: {
          ko: "만들어야 하는 것과 그것이 어디에 적용되는지까지 학생이 정의합니다.",
          en: "What to build, and where it has to land, are both yours to define.",
        },
```

## 7. 절대 하지 말 것

- **`#gains`(오면 무엇이 남는가) 다섯 항목을 건드리지 마세요.** 사용자가 따로 정한 것입니다.
- **PDF 05장(FDE 소양 넷)을 넣지 마세요.** 사용자가 이번 반영에서 제외했습니다. 스테이지에 `capability` 같은 필드를 만들지 마세요.
- **`#after` 챕터를 건드리지 마세요.** Day 4의 `line`이 같은 말을 하지만 하나는 일정 안의 사실이고 하나는 챕터입니다.
- **초안 고지(`draftNote`)를 걷지 마세요.** 이 PDF는 일정 초안이지 확정이 아닙니다.
- **`tbd` 목록에서 "장소"를 빼지 마세요.** 5장의 "공간"은 운영 방식이지 장소가 아닙니다.
- 새 상자를 만들지 마세요. 4장과 5장은 헤어라인으로 나뉜 행입니다(표현 방식 브리프 2장의 규칙).
- `lib/naruDates.ts`의 `DECEMBER_STARTS_AT`(12/10)과 `DECEMBER_ENDS_AT`(12/14)는 이미 맞습니다. 바꾸지 마세요.
- em dash 금지. 한국어 문단 `break-keep`. 모든 문자열 `{ ko, en }` 쌍.

## 8. 검증

| # | 항목 | 기준 |
| --- | --- | --- |
| 1 | 날짜 | 화면의 다섯 칸이 12.10 / 12.11 / 12.12 / 12.13 / 12.14 |
| 2 | "전 기간 상시" | 레포 전체 검색 결과 **0건** |
| 3 | Day 0 무게 | Day 0 행이 나머지 넷보다 한 단 낮은 밝기. 접히거나 지워지지 않음 |
| 4 | 세션 | 활용 Guide / Sharing session / PO session / Empower session 넷이 각각 해당 Day 행에 |
| 5 | 상자 수 | 표현 방식 브리프 이후의 수에서 **늘지 않음** |
| 6 | `#december` 높이 | 데스크톱 **1,950px 이하**, 모바일 **2,450px 이하** (내용이 늘었으므로 표현 방식 브리프의 상한 +150px까지 허용) |
| 7 | 본문 대비 | 새로 넣은 줄의 흰 글자와 accent 글자가 배경 대비 4.5:1 이상 |
| 8 | 영문 | 새 문장 전부 영문이 있고 한국어가 섞이지 않음 |
| 9 | 글자 크기 | 12 / 14 / 16 / 18 넷 유지, 12px 미만 0건 |
| 10 | em dash | 0건 |

## 9. 사용자가 확인해야 할 것

1. **멘토링이 정말 Day 1~Day 3인가.** 지금 화면은 "전 기간 상시"로 약속하고 있습니다. PDF대로 줄이면 약속을 좁히는 것이라 되돌리기 어렵습니다.
2. **`tbd`의 "일정표"를 뺄 것인가.** 이 PDF가 일정표입니다. 확정이면 빼고, 초안이면 둡니다.
3. **Day 4의 청중.** "청중은 회사 관계자"라고 적었습니다. 외부 관객이 있으면 문장이 달라집니다.

## 10. 커밋

1. `data(december): 일정을 Day 0부터 Day 4로, 날짜를 하루씩 밀린 대로` (2장)
2. `fix(december): 멘토링은 Day 1부터 Day 3까지` (3장)
3. `feat(december): AI 활용 범위 셋과 운영 네 줄` (4장, 5장)
4. `content(december): 8월 첫 항목의 문장을 일정 PDF대로` (6장)
5. `docs(changelog): 2026-09-20 schedule`

각 커밋에서 `npm run build`가 지나고 해당 검증을 통과해야 다음으로 갑니다. 1번과 2번은 지금 화면이 틀린 것을 고치는 것이라 먼저 배포해도 됩니다. `main` 푸시 전에 9장 1번(멘토링 범위)을 사용자에게 확인하세요.
