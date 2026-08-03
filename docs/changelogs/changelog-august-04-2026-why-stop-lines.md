# Changelog — August 4, 2026 (선택일 카드에 '올 이유' 한 줄)

**Project:** Builderthon marketing site (Next.js)
**Branch:** `main`
**Scope:** `data/schedule.ts` (`DayMeta.whyStop` · `DayMeta.stopLabel`),
`components/journey/Journey.tsx` (`DayCard` · `RouteMap`), `data/dictionary.ts`
(`program.route.optionalValue` 한 문장).

## 문제

노선도 아래에서 이렇게 주장하고 있었습니다:

> 나머지 여섯 정거장은 그냥 늘어난 일정이 아니에요 — **하나하나 내려설 이유가
> 있도록 설계했습니다.**

그런데 바로 아래 카드들은 그 이유를 말하지 않았습니다. 카드 카피가 전부 **일정
서술**이었거든요 — "정해진 일정은 오후 1:1 멘토링뿐", "바이브 코딩 입문 집중
5–6시간". 무엇을 하는 날인지는 알겠는데 **왜 가야 하는지**는 독자가 스스로
번역해야 했습니다. 주장은 문단이 하고 증명은 아무도 하지 않던 상태입니다.

"필참 2일, 나머지 선택"이라는 부담 제거는 이미 충분히 전달되고 있었으니, 남은
빈칸은 그 반대쪽 — **선택일에 굳이 갈 이유** 였습니다.

## 1. `DayMeta.whyStop` — 카드의 '올 이유' 한 줄

| day | ko | en |
|---|---|---|
| 2 크래시코스 | 혼자 헤매며 배울 몇 주를, 출발선 맞추는 하루로 압축 | Weeks of solo trial-and-error, compressed into one day |
| 3 멘토링 | 내 아이디어를 현직자에게 1:1로 검증받는 첫 기회 | The first time your idea meets a working founder, 1:1 |
| 4 멘토링 | 방향을 아직 바꿀 수 있을 때 받는 두 번째 1:1 | A second 1:1, while there's still time to change direction |
| 5 네트워킹 | 함께 만드는 사람들을 전원이 처음 만나는 날 | The day you finally meet everyone you've been building alongside |
| 6 자율 빌드 | 정해진 것 없음 — 온전히 팀의 빌드 시간 | Nothing scheduled — the day belongs to your team's build |
| 7 리허설 | 심사위원이 던질 질문을 무대에 서기 하루 전에 미리 받아보는 자리 | The judges' questions, asked a day before you're on stage |

**Day 1·8(필참)에는 렌더하지 않습니다.** 갈지 말지를 고르는 날이 아니라 이미
가야 하는 날이고, 거기에 '올 이유'를 붙이면 필참이 설득의 문제로 보입니다.
필드 자체를 비워두는 대신 `!day.mandatory` 가드를 뒀습니다 — 나중에 누가 값을
채워도 필참일에는 안 나옵니다.

**Day 5는 프로그램이 아니라 '만남'을 이유로 씁니다.** 세부 구성은 아직 해시드와
기획 중이라, 여기서 프로그램을 약속하면 그 헤지가 무너집니다.

**Day 6은 가짜 이유를 만들지 않았습니다.** 정말 아무 일정이 없는 날이고, 그
사실 자체가 이 줄의 내용입니다 — 없는 이유를 지어내면 나머지 다섯 줄의 신뢰가
같이 떨어집니다.

### 렌더

요약 아래, 세션 카운트 위. `→` 프리픽스 + 에메랄드(`text-emerald-200/85`).
에메랄드는 이 페이지에서 이미 **'얻는 것'** 에 쓰는 색(혜택 섹션)이라, 일정
서술(회색)과 가치 제시(에메랄드)가 색으로 갈립니다. 새 토큰은 만들지
않았습니다.

## 2. 노선도 키워드 — `DayMeta.stopLabel`

Day 3·4 노드가 **자율 빌드**로 찍히고 있었습니다. 키워드가 `theme`의 머리에서
파생되는데(`stopKeyword`), 그 theme이 "자율 빌드 · 멘토링"이라서요. 자율 빌드는
내려설 이유가 아닙니다 — 그날 굳이 접속할 이유는 1:1 멘토링입니다.

`stopLabel` override를 추가해 Day 3·4를 **1:1 멘토링**으로 덮었습니다. Day 6은
정말 자율 빌드뿐이라 파생값 그대로 둡니다. theme(카드 제목)은 건드리지
않았습니다 — 그건 하루의 성격이고, 노드 키워드만 '이유' 기준으로 바뀐 것입니다.

## 3. 주장 문단 정리

`program.route.optionalValue`에서 가운데 부연을 덜어냈습니다:

- before: "…그냥 늘어난 일정이 아니에요. **결과물을 더 의미 있게 만들기 위해 직접
  고르는 준비 과정이자 중간 정거장이고,** 하나하나 내려설 이유가 있도록 설계했습니다."
- after: "…그냥 늘어난 일정이 아니에요 — 하나하나 내려설 이유가 있도록 설계했습니다."

그 부연이 하던 일(각 정거장이 왜 가치 있는지)을 이제 카드가 구체적으로 합니다.
문단은 주장만, 증명은 그리드가 — 부연을 다시 붙이면 같은 말을 두 번 하게 됩니다.

## 4. 중복 정리

**Day 6 요약**을 함께 손봤습니다. whyStop이 "정해진 것 없음"을 말하는데 요약도
"정해진 일정이 하나도 없는 날"로 시작해 같은 문장이 한 카드에서 두 번
읽혔습니다. 요약은 그 카드에서 유일하게 행동 가능한 정보만 남겼습니다:

> 필요하면 팝업스튜디오 FDE 오피스아워(온라인)에 드롭인하세요 — 예약도 출석도 없습니다.

Day 3·4는 요약("정해진 일정은 오후 1:1 멘토링뿐")과 whyStop("그 1:1이 왜
중요한가")이 기능이 달라 그대로 뒀습니다.

## Verification

- `npx tsc --noEmit` → 0 · `npm run build` → ✓ compiled, 10/10 static pages
- **375px 줄 수 측정**(가드레일: 1줄, 최대 2줄): KR 1줄 × 5 + Day 7만 2줄 ·
  EN 전부 2줄. EN Day 2·3은 처음에 3줄이 나와 EN만 줄였습니다
  (KR 확정 문안은 그대로).
- 카드 높이 375px 최대 296px(Day 7), whyStop 없는 Day 1은 253px — 과하게
  길어지지 않았습니다. 가로 오버플로 0.
- 노선도 노드: `Day 3 1:1 멘토링` · `Day 4 1:1 멘토링` · `Day 6 자율 빌드` 확인.
- 세션 카운트·배지·모달 로직 무변경(렌더 가드 하나만 추가).

## Files

- `data/schedule.ts` — `DayMeta.whyStop`·`stopLabel` 필드 + 주석, Day 2–7 값,
  Day 3·4 `stopLabel`, Day 6 요약 정리
- `components/journey/Journey.tsx` — `DayCard`의 whyStop 줄(필참 가드 포함),
  `RouteMap`의 `stopLabel` override, `stopKeyword` 주석
- `data/dictionary.ts` — `program.route.optionalValue` 축약 + 이유 주석
