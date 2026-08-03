# Changelog — August 4, 2026 (EN 카피 미세 수정 2건 + Day 1 시간 정정)

**Project:** Builderthon marketing site (Next.js)
**Branch:** `main`
**Scope:** `data/dictionary.ts`, `data/schedule.ts`. **KR 문자열은 한 글자도
바뀌지 않았습니다** (EN 카피 2건). Day 1 시간 정정은 ko/en 양쪽.

---

## 1. EN 카피 — 참가 대상 섹션의 라벨 중복

영어에서 섹션 eyebrow와 카드 리스트 제목이 **같은 문구로 연달아** 찍히고 있었습니다:

```
WHO SHOULD JOIN          ← whoWhat.tag (eyebrow)
You don't need to be a CS major.
…
WHO SHOULD JOIN          ← whoWhat.whoTitle (리스트 제목)
  · Any major — …
```

한국어는 "참가 대상"(eyebrow) / "이런 분께"(리스트)로 서로 다른 말이라 문제가
없었고, 영어만 둘 다 "Who should join"으로 번역돼 생긴 일입니다.

- `whoWhat.whoTitle.en`: `Who should join` → **`This is for you if`**
- eyebrow(`whoWhat.tag.en`)는 섹션 이름이므로 그대로.
- 리스트가 조건 나열("Any major —", "Not enrolled?")이라 `This is for you if`가
  문법적으로도 리스트로 이어집니다.

## 2. EN 카피 — Lab 2 페이즈 라벨

`Lab 2 · Builderthon`은 **행사 이름 자체**를 페이즈 라벨로 쓰고 있었습니다 —
빌더톤 페이지 안에서 "빌더톤"이라는 구간 이름은 무엇이 달라지는 구간인지 말해주지
못하고, `Lab 1 · Warm-up`과 급도 맞지 않았습니다.

- `LAB2.en`: `Lab 2 · Builderthon` → **`Lab 2 · In action`**
- KR `Lab 2 · 실전` 유지. "In action"이 "실전"의 뜻(이제 실제로 한다)을 옮기면서
  "Warm-up"과 같은 짧은 상태 표현이라 짝이 맞습니다.
- 파일 상단 개요 주석의 `Lab 2 · Builderthon (Day 5–8)` 표기도 함께 갱신.

읽는 곳 3군데 EN 확인: 데이 카드 그룹 헤더(`Lab 1 · Warm-up` / `Lab 2 · In
action`), 데이 모달 첫 칩(`Lab 2 · In action`), 이벤트 모달 상단.

---

## 3. Day 1 시간 정정 — 1PM–5PM → **1PM–4:30PM**

같은 요청에 딸려 온 시간 v3 반영. 다른 날짜(8/13 18:00–20:00 · Day 5 10AM–2PM ·
Day 7 9AM–2PM · Day 8 11AM–3PM)는 이미 반영돼 있어 **Day 1만 달라졌습니다.**

**왜 Day 1만 깎이는가 — 장소마다 계약 구조가 다릅니다:**

| 장소 | 셋업·철수 위치 | 공개 시간 |
|---|---|---|
| The Foundry (Day 1) | 대관 슬롯 **안** | 슬롯에서 앞 1시간·뒤 30분을 뺀 값 |
| *SCAPE (Day 5·8) | 이벤트 시간 **밖**에 별도 | 이벤트 창 그대로 (깎지 않음) |

이 규칙을 `days[0]`·`days[4]` 주석과 파일 상단 HOURS 단락에 적었습니다 —
다음에 누가 "일관성을 위해 *SCAPE도 깎아야 하는 것 아니냐"고 되돌리지 않도록.

바뀐 문자열: `days[0].hours`, 파일 상단 개요(Day 1 줄), `DayMeta.hours` 예시
주석, `d1-problem-release.description` ko/en, `dict.program.hoursLabel` 주석의
예시. 운영 시각(12–5PM 슬롯·셋업·철수)은 **주석에만** 있고 공개 카피에는 없습니다.

**8/13 사전 세션 주석 보강**: 이 날만 예약 창(18:00–20:00)을 그대로 공개하는 것이
의도된 결정임을 주석에 남겼습니다(강연 + 입장·Q&A·정리까지 "비워두면 되는 시간대"
로 안내). 옛 표기 `18:30–19:30`은 주석에서도 제거 — 코드에 남은 옛 시각이 다음
사람에게 되살아날 씨앗이 됩니다.

## Verification

- `npx tsc --noEmit` → 0 · `npm run build` → ✓ compiled, 10/10 static pages
- `grep "시간 확정 예정|time to be confirmed"` → 0건
- `grep "18:30|19:30"` → 0건 (주석 포함)
- `grep "셋업|철수|teardown|12–5"` → 전부 주석, 공개 카피 0건
- 렌더 확인(1440px):
  - EN 참가 대상 — eyebrow `WHO SHOULD JOIN` / 리스트 `THIS IS FOR YOU IF`, 중복 해소
  - EN 그룹 헤더·모달 칩 — `Lab 2 · In action`
  - KR 확인 — `참가 대상` / `이런 분께`, `Lab 2 · 실전` 그대로
  - Day 1 카드·모달 — `1PM–4:30PM`, 8/13 밴드·모달 — `18:00–20:00`

## Files

- `data/dictionary.ts` — `whoWhat.whoTitle.en`, `program.hoursLabel` 주석 예시
- `data/schedule.ts` — `LAB2.en` + 상단 개요, `days[0].hours`·주석,
  `days[4]` 주석, `DayMeta.hours` 주석, 8/13 주석,
  `d1-problem-release.description` ko/en
