# 브리프: 멘토링 상자 셋 자리에 "기업에게"

대상: 홈 `#december`의 멘토링 상자 셋(`NaruHome.tsx` `mentoringBoxes`, 643~682행)과 그 아래 Day 4 한 줄. 정본은 `docs/brand.md`(먼저 읽습니다). 근거는 `docs/lee-review-2026-10-24.md` L3(두 청중)과 사용자 결정 2026-10-24("이 부분에 그 내용을 지금 있는 내용 대신 넣자"). 글은 전부 사이트에 이미 있는 문장입니다(`/naru` 기업 상자, 홈 리드, 8월 깔때기). 상자 모양, 1×3 그리드, 글자 크기, 자리는 그대로이고 **내용과 라벨만** 바뀝니다.

## 1. 바꾸는 것

### 1.1 상자 셋 (같은 문법: 이름 BODY 굵게, 기간 META, 설명 BODY)

| 자리 | 이름 | META | 설명 (KO) | 설명 (EN) |
| --- | --- | --- | --- | --- |
| 왼쪽 | 내는 것 | Day 1과 Day 4 | 지금 겪는 이슈 하나와 자료, 멘토로 들어오는 시간입니다. Day 1 Sharing session 3시간과 마지막 날 질의입니다. | One issue you are facing now, its material, and the hours you can give as a mentor. Three hours at the Day 1 Sharing session and the questions on the last day. |
| 가운데 | 받는 것 | 닷새 뒤 | 같은 이슈를 받은 팀마다 다른 문제를 찾아 들어간 기록입니다. 팀의 생각 1장, 코드로 옮긴 결과물, 마지막 날의 발표와 질의. 8월에는 9팀이 시키지 않았는데 출제사에 직접 자료를 요청했습니다. | A record of each team finding a different problem under the same issue: one page of the team's take, something built in code, the last day's presentation and questions. In August nine teams asked the problem owner directly for data, unprompted. |
| 오른쪽 | 그 다음 | 끝난 뒤 | 후원사에서 시작해 채용 경로, 발주자, 팀의 첫 파트너까지 갈 수 있습니다. 어디까지 가느냐는 각 단계의 성립 조건이 결정합니다. | You can start as a sponsor and go on to a hiring channel, a client with a real brief, a team's first partner. How far it goes is decided by what each step requires. |

가운데 상자의 강조(지금 General Mentoring이 받는 것)는 "받는 것"이 받습니다. 오른쪽 상자의 점선 구분은 그대로.

### 1.2 상자 위 소제목 한 줄

상자 셋 위에 META 굵게 가운데 "기업에게" / "For companies". 네 단계 블록과 상자 사이에 섭니다. 새 섹션이 아니라 청중 라벨입니다.

### 1.3 상자 아래 한 줄 (지금 "Day 4는 멘토링 없이..." 자리)

"닷새 안에 다 풀리지 않을 수 있는 문제를 고릅니다. 8월에는 기업이 가져다 쓸 결과물이 나오지 않았고, 그래서 12월은 문제를 찾아 정의하는 구간부터 엽니다." / "We pick problems that may not be solved in five days. In August nothing the company could take and use came out, so December opens from the part where the problem is found and defined."

"기업 출제, 후원 문의 →" 링크는 바로 아래 등록 블록에 이미 있으므로 여기에는 넣지 않습니다.

### 1.4 데이터

`data/naru.ts` `december`에 새 키 `forCompanies { label, boxes: [{ name, when, body }×3], limit }`. 기존 `contextMentoring`, `mentoringAlways`, `mentoringLead`, `fieldMentoring`, `mentoringDay4Line`은 지우지 않고 둡니다(화면에서만 내림. `/crossing/team` 시간표 페이지가 쓰는지 grep으로 확인).

### 1.5 내려가는 멘토링 문장은 어디로

| 지금 상자에 있던 말 | 뒤 |
| --- | --- |
| 출제사 컨텍스트: 담당자가 Sharing session에서 맥락을 풀어 줌 | Day 1 카드 세션 줄 "출제사가 막힌 지점과 이미 해 본 것을 직접 엽니다"가 같은 말. 그대로 |
| 질문 목록 대신 팀의 생각 한 장을 들고 먼저 찾아감 | Day 2 카드 본문과 미션 띠 "멘토 찾아가기와 진척 공유", 남는 것 02가 말함. 그대로 |
| 멘토 시간은 시간표로 예약 | Day 2 카드의 칩 자리(지금 "방향 전환은 팀의 몫")를 "멘토 시간은 시간표로 예약" / "Mentor slots are booked on the shared timetable"로 교체. 버튼 "멘토 시간표와 미션 인증"이 바로 아래 있어 이어짐 |
| 현장 멘토링(출제사 일정에 따라, 정해지면 적음) | 홈에서 내림. 정해지면 다시 올림(키 유지) |
| Day 4는 멘토링 없이 질의 | Day 4 카드 본문이 "질의를 받습니다"로 말함. 내림 |

### 1.6 헤더 칩과 앵커

`data/naru.ts` naruNav의 `mentoring` 항목 라벨 "멘토링" / "Mentoring" → "기업에게" / "Companies". id는 `mentoring` 그대로(h3 `id="mentoring"`을 소제목 "기업에게"로 옮김). 외부 링크 `#mentoring`은 그대로 착지합니다.

## 2. 건드리지 말 것

상자의 테두리, 그리드, 글자 크기, 자리, 네 단계 블록, 등록 블록, `/naru`의 기업 상자(원문), 정본 금지어(POC, 실험, 검증, 비영리 0), 사람 이름 0, 12월 숫자 약속 0. "9팀", "CNA", "The Straits Times"는 8월 사실이라 정본 8장 안입니다(이 브리프는 9팀만 씁니다).

## 3. 검증

| # | 기준 |
| --- | --- |
| 1 | 홈 1440과 390에서 상자 셋 제목이 내는 것 / 받는 것 / 그 다음, 위에 "기업에게", 아래 한계 한 줄 |
| 2 | 홈 innerText에 "현장 멘토링" 0, "General Mentoring" 0, "시간표로 예약" 1(Day 2 칩) |
| 3 | 헤더 칩 "기업에게" 탭 → 소제목이 헤더 아래 8~16px에 착지 |
| 4 | EN 전환에서 상자 셋 높이 차이 60px 이하, 칩 한 줄 |
| 5 | 금지어 0, 사람 이름 0. `npm run build` 통과. axe 변화 없음 |

적용 전과 후를 1440×900, 390×844, KR과 EN으로 이 블록만 나란히.

## 4. 커밋

`feat(home): 멘토링 상자 셋 자리에 기업에게 (내는 것, 받는 것, 그 다음)` / changelog. `main` 푸시는 사용자 확인 뒤.
