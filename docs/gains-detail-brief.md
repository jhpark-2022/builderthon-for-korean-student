# 얻는 것 브리프: 다섯 개에 설명을 답니다

대상 레포: `website` (커밋 `7dbabf7` 기준). `#gains` 챕터 하나만 바꿉니다.

## 1. 무엇을 바꾸나

9월 17일에 이 챕터는 "제목만, 디테일은 이후 공개"로 정해졌습니다. 그 결정을 **부분적으로** 되돌립니다. 다섯 개에 각각 한 줄 설명을 답니다. 아직 정해지지 않은 운영 방식은 여전히 적지 않습니다.

되돌리는 이유가 둘입니다.

첫째, **제목만으로는 뜻이 안 통하는 항목이 있습니다.** "무순위 어워드"는 이 이벤트의 가장 특징적인 결정인데 제목만 보면 무슨 말인지 알 수 없습니다. "앞에서 증명"도 누구 앞인지가 빠져 있습니다.

둘째, **02 "멘토"가 빈 카드로 읽힙니다.** 감사(`docs/audit-2026-09-18.md` P1)에서 두 관점이 같은 것을 짚었고, 카드 높이를 내용에 맞추는 것으로 완화했지만 두 글자는 여전히 두 글자입니다. 설명이 붙으면 이 문제가 원인 쪽에서 사라집니다.

**8월 근거는 넣지 않습니다.** `gains.items[].evidence`에 네 개가 들어 있고 렌더에서 주석 처리돼 있습니다. 그대로 둡니다. 키도 지우지 말고, 주석도 풀지 마세요. 8월 숫자는 `#record`가 갖습니다. 이 챕터는 12월에 무엇이 있는지를 말하는 자리이고, 여기에 8월 숫자를 흩어 놓으면 두 챕터가 같은 일을 두 번 합니다.

## 2. 문장

`data/naru.ts`의 `gains.items` 다섯 항목에 `body`를 답니다. `num`, `title`, `evidence`는 손대지 않습니다.

```ts
    // DECIDED 2026-09-19 (얻는 것 브리프): 제목만 두던 것을 되돌립니다. 제목 +
    // 한 줄 설명. 설명은 "무엇인가"만 말하고 "어떻게 운영하는가"는 말하지
    // 않습니다. 후자는 아직 정해지지 않았고, note가 그렇게 적혀 있습니다.
    //
    // evidence는 그대로 둡니다. 화면에 그리지 않습니다. 8월 숫자는 #record가
    // 갖습니다. 여기에 흩으면 두 챕터가 같은 일을 두 번 합니다.
    //
    // 길이 규칙: body는 한국어 36자 이하입니다. 데스크톱에서 다섯 칸이 한 줄에
    // 들어가야 하고, 한 칸의 본문 폭이 170px 남짓이라 그 위로 가면 카드가
    // 세로로 무너집니다. 늘리고 싶으면 문장이 아니라 칸 수를 먼저 재세요.
    items: [
      {
        num: "01",
        title: { ko: "실명 기업의 진짜 문제", en: "A real problem from a named company" },
        body: {
          ko: "아직 풀리지 않은 문제를, 출제한 회사 이름과 함께 받습니다.",
          en: "A problem still unsolved, handed over with the name of the company that set it.",
        },
        evidence: { ko: "8월 코드프레소 출제", en: "August: Codepresso set the problem" },
      },
      {
        num: "02",
        title: { ko: "멘토", en: "Mentors" },
        body: {
          ko: "기간 내내 열려 있습니다. 막힐 때마다 다시 갑니다.",
          en: "Open the whole time. You go back every time you get stuck.",
        },
        evidence: { ko: "8월 11명", en: "August: eleven of them" },
      },
      {
        num: "03",
        title: { ko: "앞에서 증명", en: "Proving it out front" },
        body: {
          ko: "마지막 날, 문제를 낸 회사 앞에서 직접 발표합니다.",
          en: "On the last day you present to the company that set the problem.",
        },
        evidence: { ko: "8월 21팀 발표", en: "August: 21 teams presented" },
      },
      {
        num: "04",
        title: { ko: "무순위 어워드", en: "Awards with no ranking" },
        body: {
          ko: "1등을 뽑지 않습니다. 독보적이었던 지점을 적습니다.",
          en: "No first place. We write down what each team was singular at.",
        },
        evidence: { ko: "8월 4부문 10팀", en: "August: 10 teams across 4 categories" },
      },
      {
        num: "05",
        title: { ko: "국경 너머의 동료", en: "Peers from across the border" },
        body: {
          ko: "어느 나라에서 공부하든 같은 자리에 섭니다.",
          en: "Whichever country you study in, you stand in the same room.",
        },
      },
    ] as { num: string; title: Phrase; body: Phrase; evidence?: Phrase }[],
```

`note`도 바꿉니다. 지금 문장("디테일은 확정되는 대로 이 자리에서 공개합니다")은 "왜 제목뿐인가"의 답이었는데, 제목뿐이 아니게 되므로 답할 질문이 바뀝니다.

```ts
    note: {
      ko: "각 항목을 어떻게 운영하는지는 확정되는 대로 이 자리에서 채웁니다.",
      en: "How each of these runs goes here, as it is confirmed.",
    },
```

### 2.1 쓰지 않은 것

- **8월 숫자.** 위에 적었습니다. `evidence`는 렌더하지 않습니다.
- **멘토링 사용률.** 8월에 멘토링을 쓴 팀의 비율은 화면에 적지 않습니다. 참가자에게 줄 정보가 아니라 운영이 고칠 문제입니다.
- **12월의 멘토 수, 출제사 수, 부문 수.** 확정되지 않았습니다.
- **05의 팀 편성 방식.** 국경을 섞어서 팀을 짜는지는 아직 기준이 없습니다. `body`가 포지션("같은 자리에 섭니다")만 말하고 편성("같은 팀이 됩니다")을 말하지 않는 것은 그래서입니다. 바꾸지 마세요.

## 3. 렌더: `components/home/NaruHome.tsx`

`#gains`의 `<ol>` 하나만 고칩니다.

- 그리드 폭을 `max-w-5xl`에서 `max-w-6xl`로 넓힙니다. 다섯 칸에 본문이 들어가므로 한 칸이 170px 아래로 내려가면 안 됩니다.
- 데스크톱은 지금처럼 `lg:grid-cols-5`, `lg:items-start`. `lg:min-h-[8.5rem]`은 지웁니다. 본문이 생기면 최소 높이가 할 일이 없어집니다.
- 폰은 **1열 카드**로 바꿉니다. 지금은 높이 64px의 리스트 행인데 본문 두 줄이 들어가지 않습니다. `min-h-[64px]`와 `items-center`를 빼고, 번호 배지를 왼쪽에 두고 제목과 본문을 오른쪽에 쌓습니다(`docs/after-brief.md` 4.1의 `steps` 카드와 같은 문법입니다. 그쪽에 맞추세요).
- 본문은 `mt-2 break-keep text-sm leading-relaxed text-white/70`.
- **`item.evidence` 주석 줄은 그대로 둡니다.** 풀지 마세요.

`#after`로 가는 다리 링크(`gains.bridge`)는 `docs/after-brief.md` 3.3과 4.2에 있습니다. 순서는 카드 → `note` → 다리입니다.

## 4. 확인

| 항목 | 방법 | 기준 |
| --- | --- | --- |
| 데스크톱 한 줄 | 1440×900 | 다섯 칸이 한 줄, 어느 칸도 본문이 5줄을 넘지 않음 |
| 02 카드 | 같은 화면 | 더 이상 빈 카드로 보이지 않음 |
| 8월 숫자 | 같은 화면 | `#gains` 안에 8월이라는 말이 한 번도 없음 |
| 폰 | 390×844 | 1열 카드, 본문이 잘리지 않음, 챕터 높이 증가분 보고 |
| 문서 높이 | 390×844 | `docs/after-brief.md` 6장의 상한 14,000px을 두 브리프 합쳐서 지킴 |
| 영문 | 언어 토글 | 다섯 개 전부 영문 본문이 있음 |
| 글자 크기 | 계산된 스타일 | 12px 미만 없음 |

## 5. 덤으로 확인할 것 하나

프로덕션 화면에서 `note`가 "디테일은 확정되는 대로 **어** 자리에서 공개합니다"로 보입니다. 데이터에는 "이 자리에서"로 들어 있으므로 글자꼴 렌더링 문제일 가능성이 큽니다. 2장에서 이 문장을 통째로 바꾸므로 자연히 사라지겠지만, 바꾼 뒤에도 같은 자리에서 "이"가 "어"로 보이면 폰트 로딩 쪽을 보세요. 다른 문장에도 같은 일이 일어나고 있다는 뜻입니다.

## 6. 커밋

1. `data(gains): 다섯 항목에 설명을 단다` (2장)
2. `feat(web): 얻는 것 카드에 본문을 그린다` (3장)
3. `docs(changelog): 2026-09-19 gains` (`docs/changelogs/`에 기존 형식대로)

`main` 푸시 전에 4장을 전부 통과시키세요.
