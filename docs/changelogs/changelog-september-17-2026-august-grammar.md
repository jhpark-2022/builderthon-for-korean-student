# Changelog 2026-09-17 (나루 홈을 8월 사이트의 디자인 문법으로)

**Project:** 나루 NARU 사이트 (Next.js)
**Branch:** `main`
**Scope:** 보이는 문법만. 카피 키, 챕터 순서, 내용은 그대로입니다. 브리프는
`docs/august-design-language-brief.md`.

---

## 1. 문제

나루 홈(`/`)과 8월 사이트(`/2026-08`)가 다른 손에서 나온 것처럼 보였습니다.
8월은 두 단 히어로, 2행 그라데이션 제목, 어두운 drop-shadow로 떠 있는 챕터 제목,
번호 배지 카드, 색 점 불릿, 노선도, 플로우 스트립, 그라데이션 필 CTA, 색 테두리
강조 상자, 섹션 띠, 하단 바를 씁니다. 홈은 가운데 한 단 히어로, 발광 없는 제목,
회색 테두리 카드, 주황 면 버튼, 헤어라인 목록이었습니다. 같은 사이트인데 문법이
둘이었습니다.

## 2. 원칙

1. 카피 키를 바꾸지 않습니다. 새 문자열은 라벨뿐(칩, 노선도 범례, 플로우, 카운트다운).
   `stages[].body`의 마지막 문장을 `line` 키로 떼어 낸 것은 브리프 4.3의 지시이고,
   문장을 새로 쓰지 않았습니다.
2. 길이를 늘리지 않습니다. 폰 12,500px, 1440 9,300px이 상한.
3. 팔레트는 나루 토큰 그대로. 8월의 보라 `#7c3aed`를 들여오지 않았습니다.
   그라데이션 글자는 `GRADIENT_TEXT` 토큰 하나(보라 틴트 → 자주 틴트 → 주황).
4. 주황은 면이 아니라 점. 버튼 면과 아이브로 면에서 주황을 뺐습니다.
5. 배경은 나루터 수면 그대로.
6. 컴포넌트는 복사하지 않고 꺼냅니다. 꺼내면서 8월 페이지가 픽셀 하나 달라지면 버그.
7. `#naru`의 코어 판 둘은 판형 유지.

## 3. 꺼낸 컴포넌트 (어디서 → 어디로)

| 무엇 | 전 | 후 | 8월 페이지 |
| --- | --- | --- | --- |
| `Glass` | `Journey.tsx` | `components/ui/Glass.tsx` | import만 바뀜 |
| `FlowStrip` | `Journey.tsx` | `components/shared/FlowStrip.tsx` | import만 바뀜 |
| `BAND_TINT`, `BandFades` | `Journey.tsx` | `components/shared/Band.tsx` | import만 바뀜 |
| `MobileChatBar` | `Journey.tsx` | `components/shared/MobileChatBar.tsx` | `afterId`/`endId`/`phone` prop 신설, 기본값이 8월 값 |
| `HeroPartnerStrip` + 스트립 로고 계산(`StripLogo`, `stripHeight`, `confirmedPartnerTiers`, `sortLikeHeroStrip`, `sponsorMass`) | `Journey.tsx` | `components/shared/HeroPartnerStrip.tsx` | import만 바뀜. 홈은 렌더하지 않음(TODO: 12월 출제사·후원사 확정 시) |
| 히어로 패럴랙스 값 여섯(`heroRef`, `leftX`, `rightX`, `splitX`, `heroFade`, `bgBlur`) | `Journey()` 안 | `components/shared/useHeroSplit.ts` | 훅 호출 한 줄로. JSX 불변 |
| 칩 클래스(DayModeBadge의 여섯 문자열 + 멘토링·시간 칩) | `Journey.tsx` | `components/ui/Chip.tsx` | `DayModeBadge`가 `<Chip tone>`을 씀. 문자열 동일 |
| 버튼 3단(히어로 주 CTA 그라데이션 필, 보조 유령 필) | `Journey.tsx` 문자열 | `components/ui/Button.tsx` (`buttonClass`) | 히어로 CTA 넷이 `buttonClass`를 씀. 문자열 동일 |

새로 쓴 것(8월에 같은 문법이 있으나 상태에 묶여 있어 꺼낼 수 없던 것):

- `components/ui/Halo.tsx`: 제목 뒤 방사형 면(blur-3xl, 챕터 색) + 어두운 drop-shadow.
- `components/shared/RouteMap.tsx`: 정거장 수를 prop으로 받는 노선도. 노드·레일·
  배지·필·범례의 클래스는 8월 RouteMap의 문자열입니다. 8월 RouteMap 자체는
  라이브 시계와 데이 모달, 장소 로고에 묶여 있어 그대로 두었습니다.
- 홈의 데이 카드(`#december` 일정)는 8월 `DayCard`의 문법(DAY 큰 숫자, 날짜 요일,
  칩 줄, 제목, 본문, → 한 줄)으로 새로 그렸습니다. `DayCard`는 진행 상태(오늘·
  지나온 날)와 모달에 묶여 있어 꺼내지 않았습니다.

`Journey.tsx`는 4,993줄에서 4,353줄이 됐습니다.

## 4. 챕터별 바뀐 것

### `#top` 크로싱 서울 히어로
두 단. 왼쪽이 아이브로(보라), H1 두 줄(1행 "크로싱 서울" 흰색, 2행 "CROSSING SEOUL"
`GRADIENT_TEXT`. en은 "CROSSING" / "SEOUL"), 굵은 기간 줄, 포지션(굵게), 서술,
CTA 둘(주 = `OpenChatLink variant="hero"` 그라데이션 필 + 발광, 보조 = 유령 필).
오른쪽(lg부터)이 `CountdownPanel`: `Glass` 패널, 12월 10일 0시(KST)까지 일·시간·분.
숫자는 마운트 뒤에만 채우고 패널 높이는 고정(하이드레이션 밀림 방지). 0이 되면
"시작했습니다". 아래에 미정 칩 셋(장소, 일정표, 등록이 열리는 날). 패럴랙스는
8월과 같은 훅. 파트너 로고 띠는 두지 않음.

### `#record`
아이브로 `violet`, H2 발광(violet), 아카이브 버튼을 2차 유령 필로.

### `#december` 프로그램
섹션 띠(`BAND_TINT`). 아이브로 `orange`(글자·테두리만, 면 없음). H2 발광(orange).
숫자 둘(5일, 2회. `ProgramStats` 문법). **노선도** 5정거장(★ = 제출이 있는 날
Discovery·Refine, 레일 아래 초록 필 "General Mentoring, 전 기간 상시", 범례).
**데이 카드** 다섯(DayCard 문법: BEFORE/DAY n, 날짜 요일, 칩(★ 제출, 대면, 요구
강도 최고, PO 세션, 새 방향 금지, 발표 5분 + 질의 5분, 시상), 제목, 본문, → 한 줄).
워크샵 상자 셋은 연보라 테두리(`accent`), General Mentoring은 초록 테두리 강조
상자, "그래서 재는 것"은 호박색 강조 상자. "8월에 아쉬웠던 넷"은 번호 배지 카드
넷(2×2). 미정 칩은 색 점 + 라벨. **플로우 스트립**(등록 → 팀 본딩 → 닷새 → 결과
공유회). CTA: 오픈채팅 2차 유령 필, 메일 텍스트 링크.

### `#naru`
태그라인 H2 발광(violet), 2행은 `GRADIENT_TEXT` 토큰. 코어 판 둘은 그대로.

### `#how`
섹션 띠. 아이브로 `cyan`, H2 발광(cyan). 다이어그램 역할 라벨을 칩으로(가운데만
violet 톤). "하지 않는 것"은 시안 점 불릿.

### `#join`
아이브로 `emerald`, H2 발광(emerald). 카드 넷에 번호 배지(01~04, emerald). 알럼 띠는
초록 테두리 강조 상자.

### 공통
- 하단 오픈채팅 바(`MobileChatBar afterId="record" endId="closing" phone`). 8월과
  같은 위치·높이. 홈에는 폰 전용 바가 없어 폰까지 맡습니다.
- 1차 버튼은 페이지에 하나(히어로). `variant="hero"` 사용처 1.
- 주황 면 검사: `bg-naru-orange`는 `Eyebrow`에서도 빠졌습니다. 남은 것은 점(로고,
  코어 표식), 그라데이션의 끝, 아이브로·기간 줄 글자색.

## 5. 측정

### 8월 페이지 회귀 (픽셀 diff, 작업 전 vs 후, 애니메이션·캔버스 제외)

| 캡처 | 결과 |
| --- | --- |
| 1440 ko (3부분) | 0 px |
| 1440 en (3부분) | 0 px |
| 390 en (4부분) | 0 px |
| 390 ko (4부분) | 154 px (0.005%). 멘토 카드의 아바타 사진 한 장(49×66px 상자). 지연 로딩 이미지의 디코드 차이이고 레이아웃 변화가 아닙니다 |

### 홈 길이

| | 전 (프로덕션 실측) | 후 | 상한 |
| --- | --- | --- | --- |
| 390 ko | 11,426px | 12,391px | 12,500 |
| 390 en | 12,729px | 13,725px | |
| 1440 ko | 8,659px | 9,289px | 9,300 |
| 1440 en | 9,252px | 9,846px | |

가로 넘침 0(390, 1440). 콘솔 오류 0(로컬에서 Vercel insights 스크립트 404는 배포
환경의 것이라 제외). `npx tsc --noEmit`, `npm run build` 통과.

캡처 방법: `next build` + `next start`, Playwright, 애니메이션·전환 끔, 배경
캔버스·비디오 숨김, 끝까지 스크롤한 뒤 맨 위에서 전체 캡처. 8,000px 단위로 잘라
비교. 같은 빌드를 두 번 찍은 잡음은 0.

## 6. 스크린샷

`.shots/naru/aug-grammar/`: `before-home-{390,1440}-{ko,en}`, `after-home-…`,
`compare-hero.png`, `compare-cards.png`, `compare-schedule.png`.

## 7. 하지 않은 것

- 카피 수정, 챕터 순서 변경, 키 삭제, 9/16·9/17에 내린 내용의 복원.
- 팔레트 토큰 변경, 배경 변경, 히어로 영상.
- `#naru` 코어 판의 크기·배치.
- 8월 페이지의 시각 변경. 회귀 diff가 그것을 증명합니다.
- 12월 상세(일정표 모달, 등록)를 지어 넣는 것.
- 8월 `RouteMap`·`DayCard`의 추출. 위 3장의 이유.
- `BandFades`는 8월에서도 no-op이라(띠는 `BAND_TINT` 그라데이션 자체가 만듭니다)
  홈에서도 같은 방식으로, `#december`와 `#how` 두 챕터에 띠를 깔았습니다. 브리프의
  "경계 넷"은 이 두 띠의 위아래 가장자리 넷과 같습니다.

## 8. TODO: confirm

- 12월 출제사·후원사가 확정되면 히어로 두 단 아래에 `HeroPartnerStrip`(tiers prop으로
  일반화 필요).
- `docs/background-crossing-field-brief.md`가 같은 날 들어왔습니다. 이 작업의 범위
  밖이라 손대지 않았습니다.
