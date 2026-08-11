# Changelog — August 10, 2026 (Day 8 트랙 발표 두 슬롯: 문안 통일 + 시간 구성 헤지)

**Project:** Builderthon marketing site (Next.js)
**Branch:** `main`
**Scope:** `data/schedule.ts` — 새 상수 `D8_TRACK_PITCH_NOTE`, `days[7].runOfShow`의
트랙 발표 두 줄(11:10AM–12:30PM · 12:30PM–1:50PM), 이벤트 `d8-judging`의
`summary` · `description`.

---

## 문제

Day 8 진행 순서에서 트랙 발표는 두 줄로 나뉘어 있습니다. 두 줄은 트랙만 다른
**같은 세션**인데, 각자 다른 note를 달고 있었습니다.

- 첫 번째 트랙 발표: 발표 포맷만 (`팀당 8분: 발표 3분 + Q&A 포함 전문가 피드백 5분`)
- 두 번째 트랙 발표: 오고 갈 자유만 (`자기 트랙 발표 외 시간은 자유롭게…`)

읽는 사람은 자기 트랙이 걸린 줄 하나만 봅니다. 첫 트랙 참가자는 자유시간
안내를 못 보고, 둘째 트랙 참가자는 발표 길이를 못 봅니다. **반쪽짜리 안내가
두 개** 있던 셈입니다.

그리고 8분 안에서 발표와 Q&A를 어떻게 나눌지는 **아직 확정되지 않았는데**,
`발표 3분 + Q&A 포함 피드백 5분`이 확정 사실처럼 세 곳에 적혀 있었습니다
(runOfShow note · `d8-judging` summary · 같은 카드 description). 참가자가
잘못된 길이로 발표를 준비해 오면 현장에서 그대로 사고가 나는 종류의 숫자라,
확정 전에는 총량만 노출하기로 했습니다.

## 바꾼 것

### 1. 공통 문안을 상수로 (`D8_TRACK_PITCH_NOTE`)

두 슬롯이 같은 상수를 참조합니다. 포맷이 확정되면 고칠 곳은 한 곳입니다.

```ts
const D8_TRACK_PITCH_NOTE: Bilingual = {
  ko: "팀당 8분(잠정) — 발표·Q&A 시간 구성은 확정되는 대로 안내해요. 자기 트랙 발표 외 시간은 자유롭게 쓰시면 돼요 — 남아서 다른 팀을 봐도, *SCAPE를 둘러봐도 됩니다.",
  en: "Eight minutes per team (provisional) — we'll confirm how that splits between the presentation and Q&A once it's settled. Outside your own track the time is yours: stay and watch other teams, or wander *SCAPE.",
};
```

```diff
  {
    time: "11:10AM–12:30PM",
    label: { ko: "첫 번째 트랙 발표", en: "First track pitches" },
-   note: { ko: "팀당 8분: 발표 3분 + Q&A 포함 전문가 피드백 5분 (잠정, 확정 시 안내)", en: "8 minutes per team: a 3-minute presentation, then 5 minutes of expert feedback including Q&A (provisional, we'll confirm)" },
+   note: D8_TRACK_PITCH_NOTE,
    eventId: "d8-judging",
  },
  {
    time: "12:30PM–1:50PM",
    label: { ko: "두 번째 트랙 발표", en: "Second track pitches" },
-   note: { ko: "자기 트랙 발표 외 시간은 자유롭게 쓰시면 돼요. 남아서 봐도, *SCAPE를 둘러봐도 됩니다", en: "Outside your own track you're free to stay and watch, or wander *SCAPE" },
+   note: D8_TRACK_PITCH_NOTE,
    eventId: "d8-judging",
  },
```

제목(`첫 번째`/`두 번째 트랙 발표`)과 시간대는 그대로 다릅니다. 슬롯을
구분하는 것은 이 둘뿐이어야 합니다.

`*SCAPE`의 별표 표기는 유지했습니다 — 장소 이름의 일부입니다.

### 2. 세부 배분 표기 제거 → 총량 + 헤지

`d8-judging` 카드의 summary와 description에서 `발표 3분 + 피드백 5분`을 빼고,
총량(8분·잠정)과 "구성은 확정되는 대로 안내"로 바꿨습니다.

```diff
  summary: {
-   ko: "문제를 낸 코드프레소와 업계 전문가 앞에서 팀당 8분: 발표 3분 + Q&A 포함 피드백 5분 (잠정).",
+   ko: "문제를 낸 코드프레소와 업계 전문가 앞에서 팀당 8분(잠정).",
  },
```

description은 해당 문장만 교체했습니다(`팀당 8분으로 발표 3분에 이어 Q&A를
포함한 피드백 5분입니다(잠정, …)` → `팀당 8분입니다(잠정). 발표와 Q&A를
어떻게 나눌지는 확정되는 대로 안내합니다.`). 나머지 세 문장(이게 무슨
자리인가 · 오고 갈 자유 · 누가 어떤 성격의 피드백을 주는가)은 그대로입니다.

### 3. 다른 자리 확인

`"3분"` · `"5분"` · `"8분"`을 전체 grep 했습니다. Day 8 배분 표기가 남은 곳은
없습니다.

- `days[7].summary`: 이미 `팀당 8분·잠정` — 배분 없음, 손대지 않음.
- `data/dictionary.ts`의 `3분`/`5분`/`15분`: 퀴즈 소요시간·등록 폼·체크인 폼
  길이라 Day 8과 무관.
- Day 7 멘토링 카피: 원래부터 숫자를 빼고 "발표와 Q&A"로만 적혀 있음 — 유지.
- FAQ: Day 8 발표 배분을 언급하는 항목 없음.

### 4. '왜' 주석

상수 정의부에 남긴 이유 둘: **두 슬롯은 트랙만 다른 동일 세션**이라 문장이
갈리면 반쪽 안내가 둘 생긴다는 것, **배분이 미확정**이라 총량만 적는다는 것.
`d8-judging`의 기존 주석 블록도 "숫자가 사는 세 곳" 목록을 새 상수 이름으로
갱신하고, 확정 전 세부 배분을 되살리지 말라는 경고를 붙였습니다.

## 검증

- `npm run build` 통과 (10/10 static pages).
- `{ko,en}` 쌍 유지 — 상수는 `Bilingual` 타입으로 선언해 타입 체커가 강제.
- 백업 사본 없음.
