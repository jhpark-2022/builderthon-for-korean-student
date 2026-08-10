# Changelog — August 10, 2026 (노선도 멘토링: 연속 선 → 점 마커)

**Project:** Builderthon marketing site (Next.js)
**Branch:** `main`
**Scope:** `components/journey/Journey.tsx` (`RouteMap`, 새 파생값 `MENTORING_DAYS`
· `MENTORING_DAY_RANGE`), `data/dictionary.ts` (`program.route.mentoringBand`
문구 변경, `program.route.mentoringBandAria` 삭제).

---

## 문제

노선도의 "Day 3–7 멘토링"은 Day 3 노드에서 Day 7 노드까지 이어지는 에메랄드
연속 선(밴드)으로 그려져 있었습니다. 데스크톱에서는 여덟 정거장이 한 줄이라
선 하나가 다섯 날을 덮고 그 아래 라벨이 붙어 잘 읽혔지만, **모바일에서는
노선도가 두 행으로 접히면서 선도 두 토막**이 났습니다.

- 1줄째(Day 3–4): 토막 하나. 폭이 한 칸뿐이라 라벨이 들어갈 자리가 없어,
  **라벨 없는 녹색 선**이 정거장 이름 아래에 떠 있었습니다.
- 2줄째(Day 5–7): 토막 하나 + 라벨.

1줄째의 그 선은 무엇을 뜻하는지 알 길이 없었습니다. 연속성을 그리는 장치가
줄바꿈을 견디지 못한 것이라, **줄바꿈과 무관한 장치로 교체**했습니다.

## 바꾼 것

### 1. 연속 선 제거 → 노드별 점 마커

멘토링이 열리는 날의 노드 아래에 5px 에메랄드 점을 하나씩 찍습니다. 점은
노드 하나에 붙으므로 행이 어디서 접히든 자기 노드를 따라가고, 라벨 없이 떠
있는 선분이 생길 수 없습니다.

```diff
- <span aria-hidden className={`... absolute bottom-7 h-[5px] rounded-full bg-emerald-400/60 ${
-   rowIdx === 0 ? "left-[62.5%] right-[12.5%] sm:right-0 ..." : "left-[12.5%] right-[37.5%] sm:left-0 ..."
- }`} />
+ <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-7 flex">
+   {row.map((d) => (
+     <span key={d.day} className="flex flex-1 justify-center">
+       {MENTORING_DAYS.has(d.day) && (
+         <span className="h-[5px] w-[5px] rounded-full bg-emerald-400/80" />
+       )}
+     </span>
+   ))}
+ </div>
```

기하에 대해 두 가지가 의도적입니다.

- **퍼센트(12.5% · 37.5% …)를 쓰지 않습니다.** 노드 행과 같은 `flex-1` 칸을
  한 겹 더 깔아 점을 가운데 세웁니다. 퍼센트로 적으면 "한 행은 네 칸"이라는
  사실이 두 군데에 적히고, 한쪽만 고치는 날이 옵니다.
- **점을 `<li>` 안에 넣지 않았습니다.** 정거장 이름이 두 줄로 접히는 날이
  있어서(375px 영문: "1:1 / mentoring"), `<li>` 기준으로 잡으면 점 높이가
  날마다 들쭉날쭉해집니다. `<ol>` 기준 `bottom-7`이면 한 줄로 정렬됩니다.

`bottom-7`은 **밴드가 쓰던 자리 그대로**입니다. 세로 높이는 한 픽셀도 늘지
않았습니다(`pb-9` 안에서 자리만 바뀜).

### 2. 날짜는 스케줄에서 파생 — 하드코딩 없음

`3·4·5·6·7`을 손으로 적지 않습니다. 멘토링 기간이 바뀌면 노선도가 저절로
따라오게 하려고요.

```ts
const MENTORING_DAYS = new Set(
  schedule.filter((e) => e.category === "mentoring" && e.day > 0).map((e) => e.day),
);
const MENTORING_DAY_RANGE = {
  from: Math.min(...MENTORING_DAYS),
  to: Math.max(...MENTORING_DAYS),
};
```

출처는 `category === "mentoring"` 이벤트입니다 — 지금은 Day 3·4의 1:1 예약제
(`d3-mentoring` · `d4-mentoring`)와 Day 5–7의 FDE 오피스아워(`FDE_OFFICE_HOUR`
세 벌). 두 트랙을 나누지 않고 한 덩어리로 세는 것은, 참가자 입장에서 "오늘
도움을 받을 수 있는가"가 같은 질문이기 때문입니다(`schedule.ts`
`FDE_OFFICE_HOUR` 주석의 결정과 같은 이유). `day > 0`으로 사전 세션(day 0)은
8일 노선도 밖이라 뺍니다.

### 3. 필: 같은 점으로 시작 + 구간을 말로

밴드였을 때는 구간을 **선이** 보여주니 라벨에 날짜를 적지 않았습니다. 점은
"며칠부터 며칠까지"를 스스로 말하지 못하므로, 이 줄이 대신 말합니다.

```diff
- ko: "1:1 멘토링 · 매일 열려 있어요"
- en: "1:1 mentoring · open every day"
+ ko: "1:1 멘토링 · Day {from}~{to} 매일 열려 있어요"
+ en: "1:1 mentoring · open every day, Day {from}–{to}"
```

`{from}`·`{to}`는 `MENTORING_DAY_RANGE`가 채웁니다(사이트에 이미 있는
`{name}` 치환과 같은 방식). 숫자를 문구에 직접 적으면 점 마커와 이 줄이 서로
다른 말을 하는 날이 옵니다.

문두의 점은 **문자 `●`가 아니라 마커와 같은 렌더된 점**입니다 — 문자로 적으면
폰트마다 크기가 달라져 위 마커와 짝이 안 맞습니다.

```tsx
<span aria-hidden className="h-[5px] w-[5px] shrink-0 rounded-full bg-emerald-400/80" />
```

**필 위치는 그대로입니다.** 종전 밴드 라벨의 컨테이너(`bottom-0`,
모바일 `left-0 right-[25%]`, 데스크톱 `sm:left-[-37.5%] sm:right-[37.5%]`)를
손대지 않았습니다. 그 값들은 "밴드와 같은 중심"을 만들려고 잡은 것이었는데,
점의 구간(Day 3→7)이 밴드와 같으므로 중심도 그대로입니다 — 모바일은 Day 6,
데스크톱은 Day 5 언저리.

### 4. 데스크톱도 같은 점 (선 유지 안 함)

한 줄 노선도에서는 연속 선이 "닷새 내내"를 더 잘 말합니다. 그래도 점으로
통일했습니다: 그 이득보다 **두 레이아웃이 다른 시각 언어를 쓰는 값이
큽니다.** 같은 페이지를 폰과 노트북에서 번갈아 보는 사람에게는 노선도가 두
개인 것처럼 보입니다. 점 다섯 개가 나란한 것으로도 "매일"은 읽히고, 바로
아래 필이 그것을 말로 확인해 줍니다. 근거는 `Journey.tsx` 마커 주석에도
남겼습니다.

### 5. `mentoringBandAria` 삭제

밴드는 시각 요소라 `aria-hidden`이었고, 스크린리더는 `role="img"` +
`aria-label`로 구간을 따로 들었습니다. 이제 필의 **눈에 보이는 문구가 구간을
그대로 말하므로** 그 대사는 중복입니다. 점 마커는 전부 `aria-hidden`이라,
스크린리더가 듣는 것은 필 한 줄과 각 노드 버튼의 기존 `aria-label`입니다.
(점 다섯 개를 각각 읽어 주는 것은 소음입니다.)

---

## 뒤이은 조정 (같은 날, 화면 보고 나서)

### 6. 행 사이 화살표 제거

모바일에서 두 행 사이에 "계속 아래로"를 뜻하는 세로선 + 꺾쇠 화살표가
있었습니다. 지웠습니다 — 두 행이 위아래로 놓인 것만으로 순서는 읽히고, 이
화살표는 노선도에서 **유일하게 아무 정거장도 가리키지 않는 표시**라 시선만
먹었습니다.

여백 36px은 남깁니다. 지우기만 하면 둘째 행의 장소 로고(`-top-5`, 노드 위로
20px 삐져나옵니다)가 첫 행의 멘토링 점·필과 부딪힙니다.

```diff
- {rowIdx === 1 && (
-   <div aria-hidden className="flex flex-col items-center justify-center py-1.5 sm:hidden">
-     <span className="h-4 w-px bg-gradient-to-b from-white/5 to-white/25" />
-     <svg viewBox="0 0 12 8" className="h-2 w-3 text-white/30" ...><path d="M1 1l5 5 5-5" /></svg>
-   </div>
- )}
+ // <ol> className에 흡수
+ ${rowIdx === 1 ? "mt-9 sm:mt-0" : ""}
```

36px은 화살표 블록이 차지하던 높이(`py-1.5` 12 + `h-4` 16 + `h-2` 8) 그대로라
세로 리듬이 바뀌지 않습니다. 데스크톱은 두 행이 나란해서 `sm:mt-0`.

이 블록이 사라지면서 `<Fragment key={rowIdx}>` 래퍼도 필요 없어져, `key`를
`<ol>`로 옮기고 제거했습니다(`Fragment` import는 파일 내 다른 5곳이 계속 씁니다).

### 7. 점 5px → 7px

5px은 노드에 딸린 표시가 아니라 **렌더 잡티**로 읽혔습니다. 키우면서 위아래
여백은 키우기 전과 같게 유지했습니다 — 이 36px 안에 필(24px)과 점이 같이
살고 있어서, 점만 키우면 위로는 정거장 이름에, 아래로는 필에 붙습니다.

```diff
- className="... absolute inset-x-0 bottom-7 flex"     ← 점 컨테이너
+ className="... absolute inset-x-0 bottom-[30px] flex"
- <span className="h-[5px] w-[5px] rounded-full bg-emerald-400/80" />
+ <span className="h-[7px] w-[7px] rounded-full bg-emerald-400/80" />
- className="relative flex flex-1 items-start pb-9"   ← <ol>
+ className="relative flex flex-1 items-start pb-10"
```

필 앞의 점도 같이 7px로 올렸습니다(둘은 같은 크기여야 짝으로 읽힙니다).

**더 키우지 마세요.** 선택일 노드(○ 12px)와 크기가 붙으면 점이 아홉 번째
정거장처럼 보입니다. 주석에도 남겼습니다.

세로 총합: `pb` +4px, 화살표 -36px → 모바일 노선도는 오히려 **32px 짧아졌습니다**.

---

## 건드리지 않은 것

- **노드 3종 규칙** — 필참 ★(rose) / 놓치면 아까운 ◉(violet) / 선택 ○. 크기·색·
  우선순위 모두 그대로.
- **범례 3줄** — 항목을 추가하지 않았습니다. 점과 필이 이미 서로를 설명하는
  짝이고, 범례는 *정거장의 층*을 말하는 축인데 멘토링은 정거장이 아닙니다.
  범례 항목을 넣으면 세 번째 설명이 됩니다.
- **정거장 키워드**(`stopLabel` / `stopKeyword`) — "1:1 멘토링" 등 문구 무변경.
- **장소 로고 마커** — 배치·크기·`alt=""` 그대로.
- **세로 공간** — `pb-9`, `bottom-7` 그대로. 늘어난 높이 0.

## 검증

| 항목 | 결과 |
|---|---|
| `npm run build` | 통과 (`/` 61.4 kB / 249 kB First Load) |
| 375×812 KO | 점 5개(Day 3·4 / Day 5·6·7) 각 노드 중앙, 한 줄 정렬. 필 1줄. |
| 375×812 EN | 정거장 이름이 2줄로 접히는데도 점은 한 줄 유지. 필 폭 241px, `scrollWidth` 375 — 가로 넘침 없음. |
| 1280 데스크톱 | 점 5개가 Day 3→7에 한 줄, 필은 Day 5 아래 중앙. 두 `<ol>` 높이·top 동일(433 / 130px) — 화살표 제거·`mt-9`가 데스크톱에 새지 않음. |
| 겹침 | Day 1·8의 `필참` 배지 구간과 점·필 구간(Day 3~7)이 가로로 겹치지 않음 — 375px에서 실측 확인. |
