# Changelog — August 10, 2026 (노선도 ↔ 데이 카드 의미 체계 동기화)

**Project:** Builderthon marketing site (Next.js)
**Branch:** `main`
**Scope:** `data/schedule.ts` (새 파생값 `DayEmphasis` · `dayEmphasis()` ·
`MENTORING_DAYS` · `mentoringOpenOn()` · `MENTORING_DAY_RANGE`),
`components/journey/Journey.tsx` (`RouteMap` · `DayCard` · 데이 모달 배지 행,
새 글리프 컴포넌트 2개), `data/dictionary.ts` (`program.spotlightBadge` ·
`optionalAttendance` · `mentoringChip` 추가).

---

## 문제

같은 여덟 날을 두 표면이 다르게 말하고 있었습니다.

| | 층 | 멘토링 |
|---|---|---|
| 노선도 | 3층 — 필참 ★ / 놓치면 아까운 ◉ / 선택 ○ | Day 3~7 노드에 ● 마커 |
| 데이 카드 | **2층** — 필참 / 선택 | **없음** |

노선도가 ◉로 따로 그리는 Day 5·7이 카드에서는 Day 2·3·4·6과 똑같은 "선택"
필을 달고 있었고, Day 3~7 멘토링 상시 개방은 카드에 표시가 아예 없었습니다.
같은 페이지를 위아래로 훑는 사람에게 노선도의 기호는 노선도 안에서만 쓰는
방언이 됩니다.

---

## 1. 판정을 한 곳으로 — `schedule.ts`

바꾸기 전에는 판정이 **컴포넌트 안에** 흩어져 있었습니다.

```
RouteMap:  const anchor = d.mandatory === true
           const spot   = !anchor && d.spotlight === true
           const MENTORING_DAYS = new Set(schedule.filter(...))   ← Journey.tsx 지역 변수
DayCard:   day.mandatory ? ... : ...                              ← 층 개념 없음
```

셋을 `data/schedule.ts`로 올리고, 두 표면이 **여기서만** 도출하게 했습니다.

```ts
export type DayEmphasis = "must" | "worth" | "optional";

// mandatory가 spotlight를 이깁니다. 한 정거장이 두 가지로 그려질 일은 없어야 합니다.
export const dayEmphasis = (d: DayMeta): DayEmphasis =>
  d.mandatory === true ? "must" : d.spotlight === true ? "worth" : "optional";

export const MENTORING_DAYS: ReadonlySet<number> = new Set(
  schedule.filter((e) => e.category === "mentoring" && e.day > 0).map((e) => e.day),
);
export const mentoringOpenOn = (day: number) => MENTORING_DAYS.has(day);
export const MENTORING_DAY_RANGE = MENTORING_DAYS.size > 0
  ? { from: Math.min(...MENTORING_DAYS), to: Math.max(...MENTORING_DAYS) }
  : null;
```

**새 데이터 필드를 만들지 않았습니다.** `emphasis: "worth"` / `mentoringOpen: true`를
여덟 날에 손으로 적는 안을 검토하고 접었습니다 — 둘 다 이미 있는 데이터에서
도출되는 값이라(`mandatory`/`spotlight`는 이미 `DayMeta` 필드고, 멘토링 날은
`schedule`의 `category: "mentoring"` 이벤트), 손으로 적는 필드를 하나 더 두면
그게 곧 **스케줄과 어긋날 수 있는 두 번째 진실**이 됩니다. 지금 구조에서는
`spotlight: true` 하나만 뒤집으면 노드·카드 배지·모달이 함께 움직이고,
멘토링 이벤트를 하루 더 넣으면 점·칩·필 문구가 함께 따라옵니다.

`MENTORING_DAY_RANGE`가 nullable이 된 것은 `Math.min(...[])`이 `Infinity`를 내기
때문입니다. 멘토링 없는 빌더톤은 없지만, 필 문구가 "Day Infinity~-Infinity"로
렌더되는 쪽보다 렌더 안 되는 쪽이 낫습니다.

---

## 2. 카드 배지 3층화

```diff
- {day.mandatory ? <★ 필참> : <선택>}
+ {emphasis === "must"  ? <★ 필참 (rose)>
+ : emphasis === "worth" ? <◉ 놓치면 아까운 (violet)>
+ : <선택 (중립)>}
```

새 문구 (`dict.program.spotlightBadge`):

```
ko: "놓치면 아까운"
en: "Worth it"
```

범례("놓치면 아까운 정거장" / "Worth getting off for")를 필 크기로 줄인 말입니다.
정거장 비유는 범례가 이미 세워 놓았으므로 필은 층만 가리킵니다. 의무를 암시하는
낱말(필참·전원·꼭·must)은 쓰지 않습니다.

### ◉는 문자가 아니라 렌더된 마크

`SpotlightGlyph` 컴포넌트로 노선도 노드·범례 스와치의 마크업(violet 링 + 안쪽
점)을 그대로 줄여 씁니다. 문자 `◉`는 폰트마다 크기·baseline이 달라 노드와 짝이
맞지 않습니다. 같은 이유로 멘토링 점도 `MentoringDot`(7px)으로 공용화했습니다 —
노선도 점, 노선도 필 앞의 점, 카드 칩 앞의 점이 한 컴포넌트입니다.

★(필참)만 문자 그대로 둡니다. 원래 그랬고, 별은 어느 폰트에서나 별입니다.

### 카드 테두리는 3단계로 나누지 않았습니다

필참 두 장의 rose 테두리는 그대로, 스포트라이트 날에는 테두리를 주지 않습니다.
테두리는 "격자에서 먼저 읽히는 것"이라는 별도의 축이고, 층은 안쪽 배지가 이미
말합니다. 셋으로 나누면 카드 여덟 장이 3등급으로 줄 서서, 노선도 아래 문단이
주장하는 "나머지 여섯도 하나하나 내려설 이유가 있다"와 정면으로 부딪힙니다.

### 되돌린 결정 하나

`DayMeta.spotlight` 주석에는 **"배지는 붙이지 않습니다 — 필참 배지와 비슷한
무엇이든 달면 의무로 읽힙니다"**라고 적혀 있었습니다. 이번에 뒤집었습니다.
두 표면이 어긋나는 값이 더 컸기 때문입니다. 다만 원래 우려는 유효해서 두 가지로
받쳤고, 주석에 그 거래를 기록했습니다.

1. 색·글리프를 필참과 확실히 갈랐습니다 (violet ◉ vs rose ★). 노선도에서 이미
   배운 기호라, 카드의 배지는 새 뜻이 아닙니다.
2. **데이 모달에 "선택 참여"를 글자로 박았습니다** (아래 3번).

---

## 3. 모달 — ◉ 배지와 "선택 참여"는 한 쌍

카드에서 그날의 "선택" 필이 ◉ 필로 바뀌었으므로, 필참이 아니라는 사실을 말로
받는 자리가 한 곳은 있어야 합니다. 스포트라이트 날 모달의 배지 행에 두 칩이
나란히 섭니다.

```
[Lab 2 · 실전] [Day 7 · 08.28 · 금 · 9AM–2PM] [◉ 놓치면 아까운] [선택 참여] [● 현장]
```

`optionalAttendance` = `{ ko: "선택 참여", en: "Optional to attend" }`. 중립색입니다 —
카드의 선택 필과 같은 층이고, 여기서 색을 주면 축이 하나 더 생깁니다.
**둘을 떼어 놓지 마세요**: ◉만 남으면 이 모달은 무게만 말하고 의무 여부는 말하지
않는 화면이 됩니다.

모달의 ★필참 조건도 `day.mandatory` → `dayEmphasis(day) === "must"`로 옮겨,
세 표면이 같은 함수를 읽습니다.

---

## 4. 카드 멘토링 칩

`mentoringOpenOn(day.day)`인 날에 노선도와 **같은 에메랄드 점**을 단 칩:

```
● 1:1 멘토링   /   ● 1:1 mentoring
```

### 배지 행이 아니라 자기 줄인 이유

375px에서 배지 행은 이미 세 칩(층 · 현장/온라인 · 시간)까지 찹니다. 넷째를
넣으면 날마다 다른 데서 줄이 접혀 카드 여덟 장의 배지 행 높이가 들쭉날쭉해집니다.
게다가 멘토링은 '참여 방식'이 아니라 '그날 얻는 것'이라, 층·모드 칩보다 바로 위
`whyStop` 줄과 한 덩어리로 읽히는 편이 맞습니다. 그래서 `whyStop` 바로 아래
마이크로 행입니다.

### Day 3·4에도 답니다

제목에 이미 "멘토링"이 있어 중복처럼 보이지만, 이 칩이 하는 말은 "이 날 멘토링이
있다"가 아니라 **"이 날은 노선도에서 점이 찍힌 그 날들 중 하나"**입니다. 다섯 중
셋에만 붙으면 기호가 아니라 장식이 됩니다.

---

## 검증

### 8일 대조표 (`dayEmphasis` · `mentoringOpenOn`에서 직접 생성)

| Day | 노선도 노드 | 카드 배지 | 노선도 ● | 카드 칩 | 모달 "선택 참여" |
|---|---|---|---|---|---|
| Day 1 | ★ rose | ★ 필참 | — | — | — |
| Day 2 | ○ 중립 | 선택 | — | — | — |
| Day 3 | ○ 중립 | 선택 | ● | ● 1:1 멘토링 | — |
| Day 4 | ○ 중립 | 선택 | ● | ● 1:1 멘토링 | — |
| Day 5 | ◉ violet | ◉ 놓치면 아까운 | ● | ● 1:1 멘토링 | 선택 참여 |
| Day 6 | ○ 중립 | 선택 | ● | ● 1:1 멘토링 | — |
| Day 7 | ◉ violet | ◉ 놓치면 아까운 | ● | ● 1:1 멘토링 | 선택 참여 |
| Day 8 | ★ rose | ★ 필참 | — | — | — |

**불일치 0건 — 8/8 1:1 대응.** 멘토링 구간 `{from: 3, to: 7}`.

### 화면

| 항목 | 결과 |
|---|---|
| `npm run build` | 통과 |
| 375px KO | Day 5·7 배지 행 `[◉ 놓치면 아까운][● 현장][10AM–2PM]` 한 줄에 들어감. 멘토링 칩은 자기 줄. `scrollWidth` 375 — 가로 넘침 없음. |
| 375px 모달 | `[◉ 놓치면 아까운][선택 참여]` 한 줄, 그 아래 `[● 현장]`. |
| 1280px KO/EN | 세 층이 카드 여덟 장에서 색으로 구분됨. EN 필("Worth it" · "Optional to attend" · "1:1 mentoring") 줄바꿈 없음. |

---

## 건드리지 않은 것

- **`whyStop` 줄** — 문구·색·위치 무변경 (조건만 `!day.mandatory` →
  `emphasis !== "must"`, 값은 동일).
- **시간 칩(`hours`)·현장/온라인 배지(`DayModeBadge`)** — 무변경.
- **노선도 범례 3줄** — 무변경. 카드가 범례의 세 층을 그대로 쓰므로 새 항목이
  필요 없습니다. 멘토링은 여전히 범례 밖입니다(점과 필이 서로를 설명하는 짝).
- **`days[].mandatory` 기반 헤드라인 카운트("필참 2일")** — `mandatory` 의미
  그대로 둡니다. 층이 아니라 의무 일수를 세는 자리입니다.
