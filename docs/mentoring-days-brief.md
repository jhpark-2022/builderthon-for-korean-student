# 브리프: 멘토링 세 상자와 Day 2부터의 미션

대상: 홈 `#december`의 "기존 해커톤과 다른 점" 미션 행, 멘토링 상자 둘, 일정 카드 넷. 근거는 2026-10-13 사용자 결정(아래 0장). 정본은 `docs/brand.md`(먼저 읽고, 7장을 이 브리프대로 먼저 고칩니다). 바꾸는 파일은 `data/naru.ts`, `components/home/NaruHome.tsx`(멘토링 상자의 열 수만), `docs/brand.md`, `CHANGELOG.md`. 챕터 순서, 블록 자리, 글자 크기, 노선도 모양, 폰 패널 방식은 그대로입니다.

## 0. 결정 (DECIDED 2026-10-13, 사용자)

| 날 | 멘토링 | 미션 |
| --- | --- | --- |
| Day 1 | 없음. 출제사가 Sharing session에서 이슈의 맥락을 더 풀어 줍니다 | 없음 |
| Day 2, Day 3 | 팀이 찾아가는 멘토링. 예약 없이 멘토가 같은 공간에 있습니다. 출제사 일터 방문(현장 멘토링)은 가능 여부 미정 | 있음 |
| Day 4 | 없음. 성과 공유회 | 있음(완주) |

미션은 Day 2부터. 조건은 "무엇을 냈는가"보다 "함께 있었는가"에 둡니다.

## 1. 멘토링 상자: 둘에서 셋으로, 가로 1×3

`NaruHome.tsx` 1009행의 그리드를 `md:grid-cols-2`에서 `md:grid-cols-3`으로. 폰은 전처럼 세로. 상자 문법(테두리, 패딩, 점 + 이름 BODY 굵게, 기간 META, 설명 BODY)은 지금 것 그대로. 초록 테두리는 가운데 상자 하나에만(2026-09-18 규칙: 초록은 General Mentoring 하나). 양옆은 무채색 테두리, 점 색만 다릅니다.

| | 왼쪽 | 가운데 (초록) | 오른쪽 |
| --- | --- | --- | --- |
| 점 | accent | emerald | naru-orange |
| 이름 | 출제사 컨텍스트 / Context from the companies | General Mentoring (lang="en") | 현장 멘토링 / Field mentoring |
| 기간(META) | Day 1 | Day 2와 Day 3 / Day 2 and Day 3 | Day 2와 Day 3 사이, 출제사 일정에 따라 / Between Day 2 and Day 3, when the companies can host |
| 설명(BODY) | 멘토링은 없습니다. 이슈를 낸 기업의 담당자가 Sharing session에서 회사와 이슈의 맥락을 더 풀어 줍니다. 질문은 이 날 합니다. / No mentoring. The person behind the issue opens up the company and the context at the Sharing session. This is the day for questions. | 질문 목록 대신, 이슈에 대한 팀의 생각 한 장을 들고 먼저 찾아갑니다. 예약 없이, 멘토가 같은 공간에 있습니다. / Your team goes first, with one page of its own thinking on the issue instead of a list of questions. No booking. The mentors are in the same space. | 팀을 나눠 이슈를 낸 기업의 일터로 가서, 실무자에게 팀의 생각을 말하고 의견을 듣습니다. 받을 수 있는 기업이 정해지면 이 자리에 적습니다. / Teams split up, visit the company behind the issue, tell the people doing the work what the team thinks, and hear them out. Which companies can host goes here once it is settled. |

세 상자 아래 META 한 줄, 가운데 정렬: "Day 4는 성과 공유회입니다. 멘토링 대신 무대에서 질의를 받습니다." / "Day 4 is the showcase. Questions from the floor take the place of mentoring."

데이터: `mentoringRules` 배열은 비웁니다(두 줄이 가운데 상자 설명과 아래 한 줄로 올라갔습니다). `mentoringLead`와 `mentoringAlways`는 가운데 상자의 설명과 기간이 됩니다. `fieldMentoring.when`과 `body`는 위 표대로. 새 키 `contextMentoring { name, when, body }`와 `mentoringDay4Line`을 둡니다. 안 쓰는 키(`mentoringHeading`, `fieldMentoringPill`)는 값만 "Day 2와 Day 3"으로 맞추고 그대로 둡니다.

## 2. 미션은 Day 2부터, 조건은 참여

| 날 | 지금 | 뒤 |
| --- | --- | --- |
| Day 1 | 미션 "이슈에 대한 팀의 생각 1장" | **미션 없음.** `milestone`, `milestoneDetail`을 뺍니다. `submit`은 "이슈에 대한 팀의 생각 1장"으로 그대로(Day 2에 들고 가는 것). 노선도의 Day 1은 `kind`가 자동으로 plain이 됩니다 |
| Day 2 | "현업에게 확인받은 문제 정의" | 띠: "팀 전원이 멘토를 찾아가 확인받기" / "The whole team takes it to a mentor". 설명: "Day 1에 쓴 팀의 생각 한 장을 팀 전원이 함께 멘토에게 가져가 확인받습니다. 무엇을 내는 것이 아니라, 다 같이 가는 것이 이 날의 미션입니다." / "Your whole team takes the one page from Day 1 to a mentor together and has it checked. Nothing is handed in. Going together is the mission." |
| Day 3 | "코드로 옮긴 결과물과 덱" | 띠: "다른 팀의 연습 피칭에 의견 주기" / "Give notes on another team's practice pitch". 설명: "연습 피칭을 다른 팀에 보여 주고, 다른 팀 한 곳의 피칭에 의견을 남깁니다. 덱과 결과물은 미션과 별개로 성과 공유회 전에 냅니다." / "Show your practice pitch to another team and leave notes on one other team's pitch. The deck and what you built are handed in before the showcase, separately from the mission." `submit`은 그대로 |
| Day 4 | "성과 공유회 완주" | 그대로. 설명도 그대로 |

"기존 해커톤과 다른 점"의 미션 행: "Day 2부터 날마다 하나씩 있습니다. 무엇을 냈는지보다 함께 있었는지를 봅니다. 해낸 팀은 모두 그날 지원을 받고, 해낸 미션이 그 팀의 기록으로 남습니다." / "One a day from Day 2. We look at whether you were there together, more than at what you handed in. Every team that completes it gets support that day, and the missions a team completes become its record."

## 3. 같은 말을 하는 다른 자리 (전부 맞춥니다)

`grep -n "Day 1부터 Day 3\|Day 1 to Day 3\|날마다 하나씩\|One a day" data/naru.ts docs/brand.md`로 찾아 하나도 남기지 않습니다. 지금 아는 자리:

- `data/naru.ts` 878행 /naru 코어 "멘토" 본문: "Day 2와 Day 3에 열려 있습니다. 막힐 때마다 다시 갑니다."
- `december.changes` 셋째: "...Day 2와 Day 3의 멘토링."
- `december.shape[5]` note: "Day 2와 Day 3, 예약 없이". value는 "2일" / "2 days"
- `shape[3]` "2회 중간 제출 지점"과 `facts`의 제출 횟수: Day 1 한 장은 들고 가는 것이고 제출은 Day 3 덱 하나입니다. 제출 횟수를 적은 자리가 있으면 "1회"로, 그 note는 "덱과 결과물, 성과 공유회 전" / "The deck and what you built, before the showcase"
- `docs/brand.md` 7장 125~126행: "날마다의 할 일은 미션(Mission). Day 2부터. 조건은 무엇을 냈는가보다 함께 있었는가. 해낸 팀은 모두 그날 지원을 받는다." / "멘토링: Day 1은 출제사의 컨텍스트, Day 2와 Day 3은 팀이 찾아가는 멘토링(예약 없음), Day 4는 없음. 멘토는 답을 주러 오지 않는다. ... 현장 멘토링은 가능한 기업이 정해지면 적는다."
- 폰 노선도 패널(`stageCard(..., true)`)은 같은 데이터를 그리므로 따로 고칠 것 없음. 확인만

## 4. 건드리지 말 것

챕터 순서, 블록 자리, 글자 크기 셋, 노선도의 정거장 모양(◉, ★, 빈 점)과 힌트, MilestoneStrip 컴포넌트, 폰 패널, `/match`, `/naru`의 다른 글. 기업 이름, 멘토 이름, 날짜별 방문 횟수는 쓰지 않습니다(미정). 금지어 0, em dash 0, 가운뎃점 새로 쓰지 않음.

## 5. 결정 기본값

| # | 질문 | 기본값 |
| --- | --- | --- |
| D1 | 세 상자를 종류(컨텍스트 / General / 현장)로 나눌지, 날(Day 1 / Day 2~3 / Day 4)로 나눌지 | 종류. Day 4는 상자가 아니라 아래 한 줄. 날로 나누면 현장 멘토링이 가운데 상자의 둘째 문단으로 들어가고 Day 4 상자는 "없음" 하나라 비어 보입니다 |
| D2 | Day 1 한 장을 "제출"로 셀지 | 세지 않습니다. 들고 가는 것입니다. 제출은 Day 3 덱 하나 |
| D3 | Day 3 미션에서 의견을 주는 팀 수 | 한 곳. 늘리려면 운영 설계가 먼저 |
| D4 | Day 2 "팀 전원"을 조건으로 둘지 | 둡니다. 참여를 보는 미션이라는 말이 이 조건에서 나옵니다 |

## 6. 검증

| # | 항목 | 기준 |
| --- | --- | --- |
| 1 | 상자 | 1440에서 멘토링 상자 셋이 한 줄, 폭 같음. 390에서 세로 셋. 초록 테두리는 가운데 하나. 상자 아래 Day 4 한 줄 |
| 2 | 미션 | Day 1 카드에 MilestoneStrip 없음, Day 2~4에 있음. 노선도 Day 1은 빈 점, Day 2~3은 ◉, Day 4는 ★ |
| 3 | 문장 | `grep` "Day 1부터 Day 3" 0, "날마다 하나씩" 0, "One a day" 0(앞에 "from Day 2"가 붙은 것은 제외). "미션"은 홈 `main` innerText에 상자 행 1회 + 띠 라벨 3회 |
| 4 | 정본 | `docs/brand.md` 7장이 먼저 고쳐져 있고, 사이트 문장이 그 문장과 같음. 금지어 0 |
| 5 | 불변 | 다른 블록의 픽셀 차이 0(이 블록 높이 변화만큼 아래로 밀리는 것 제외). `/naru`는 코어 02 본문 한 줄만 다름. axe 0, `npm run build` 통과 |

적용 전과 후를 1440×900과 390×844로 나란히: 멘토링 상자, Day 1~4 카드, 폰 노선도 패널 Day 1과 Day 2.

## 7. 커밋

`docs(brand): 7장 멘토링과 미션을 Day 2부터로` / `feat(home): 멘토링 상자 셋, 1×3` / `copy(home): 미션은 Day 2부터, 조건은 참여` / `copy: Day 1부터 Day 3 문장을 전부 Day 2와 Day 3으로` / changelog. `main` 푸시는 사용자 확인 뒤.
