# 브리프: 브랜드 정본 한 장과 사이트의 말 맞추기

대상 레포: `website` (커밋 `f578745` 기준, 리뷰 2단계와 3단계를 되돌린 뒤). 근거는 `docs/brand-audit-2026-10-11.md`(번호 B1~B12, D1~D4). 바꾸는 파일은 `docs/brand.md`(새로), `data/naru.ts`, `data/dictionaryCore.ts`, 헤더 워드마크 한 곳(`components/journey/JourneyNav.tsx`). `/2026-08`, `/quiz`, `/match`, 등록 폼, API, Supabase, 배경은 건드리지 않습니다. 체인지로그는 `CLAUDE.md` 규칙대로.

**이 브리프는 글만 바꿉니다.** 레이아웃, 크기, 순서, 블록의 자리는 하나도 바꾸지 않습니다(2단계와 3단계가 되돌려진 이유가 화면이었으므로). 항목마다 커밋을 따로 해서 하나씩 되돌릴 수 있게 합니다.

## 0. 결론 한 줄

**브랜드의 정본을 레포 안에 한 장으로 두고, 사이트의 문장을 그 정본에 맞춥니다.** 새로 쓰는 문장은 아래에 전부 적혀 있습니다.

## 1. `docs/brand.md` (새 파일, 정본 한 장)

카피를 바꾸는 사람이 처음 읽는 파일입니다. `CLAUDE.md`에 한 줄 더합니다: "사이트의 이름, 정의문, 단계 이름, 금지어는 `docs/brand.md`가 정본이다. 바꾸려면 거기부터 바꾼다." 내용은 아래를 그대로 씁니다(em dash 없음, 가운뎃점은 이미 있는 것만).

```
# 브랜드 정본 (2026-10-11)

## 이름 셋
- 나루 NARU: 그룹. 마스터 브랜드. 주최. 한글 '나루'가 주, 영문 NARU가 보조. 항상 나루가 먼저.
- 크로싱 서울 CROSSING SEOUL: 나루가 직접 여는 첫 이벤트. 2026.12.17~21 서울. 별도 로고 없음. 표기는 둘뿐: A = 국문 "크로싱 서울" + 영문 "CROSSING SEOUL" 락업, B = 영문 "CROSSING SEOUL" 단독. 영문은 항상 대문자.
- 제로백 빌더톤 Zero100: 2026년 8월 싱가포르 이벤트의 이름. 나루라는 이름은 그 뒤에 정해졌다.
- 관계 한 문장: "제로백 빌더톤에서 나루가 시작됐고, 크로싱 서울은 나루가 직접 여는 첫 자리다."

## 정의문
- KO: 나루는 한국에 뿌리를 두고 학생이 직접 운영하는, 영리를 목적으로 하지 않는 그룹입니다. 이벤트로 학생을 모으고, 모인 사람들을 진짜 커뮤니티로 잇고, 각 나라의 학생회, 학회와 함께 서울과 싱가포르를 넘어 더 넓게 다가갑니다. 모두 AI로 함께 만듭니다.
- KO 짧은 판(한 줄이 필요한 자리): 한국에 뿌리를 두고 학생이 직접 운영하는, 영리를 목적으로 하지 않는 그룹.
- EN: A Korea-rooted, student-run, not-for-profit group that brings students in through events, grows them into a genuine community, and reaches out with student associations and clubs across Seoul, Singapore and beyond, building together with AI.
- EN 부제: A Korea-rooted collective of student builders.
- 쓰지 않는 말: 비영리, non-profit(등록 전), alliance, 모임(정의문에서).

## 변하지 않는 두 개
- 안전하게 도전할 수 있는 자리 / 자기 가치를 증명해 보는 경험 (사이트 표기. 매니페스토의 "공간"은 v5에서 맞춘다. TODO)
- EN: A safe place to try something new / A chance to prove your own worth

## 이름의 뜻
- 나루: 강을 건너려는 사람이 배를 타는 자리. 건너간 사람이 다시 돌아와 서는 자리. 학생회와 기업이 직접 만나지 않고 거쳐 가는 나루터. 건너는 법을 미리 익히는 곳. 젓는 노는 지금 AI.
- 크로싱 서울: 싱가포르에서 만든 자리를 서울로 건너와 연다.
- 은유 규칙: 나루터만 쓴다. 다리는 쓰지 않는다. "연습"은 나루터의 것이다(코어 02는 "모의"를 쓴다).

## 닷새의 이름
- Day 0 컨텍스트 열기 / Day 1 찾기 / Day 2 확인받기 / Day 3 만들기 / Day 4 공유하기(성과 공유회)
- 영문 Context Open / Find / Check / Build / Share. 마지막 날의 이름은 "성과 공유회" 하나. 피치, 데모데이, 발표회는 쓰지 않는다.

## 숫자
- 8월에 실제로 있었던 것만: 74명 신청, 25팀 시작, 21팀 마지막 날 발표(84%), 9팀 자료 요청, 4부문 10팀, 멘토 14명, 8일.
- 12월 숫자(인원, 기업 수)는 약속하지 않는다.

## 금지어
- 참가자가 읽는 자리: POC, 실험, 검증, 가설, 파일럿, FDE, 심사(→ 피드백 패널), 장벽이 낮다, 아무나, 비전공자 OK, 개발 1도 몰라도.
- 전부: em dash, 다리 은유.
- 스크리닝 없음은 차분하게, 한 자리에 한 번.

## 색
- 화면(사이트, 결과 카드, 저장 이미지): 잉크 #070B1F 위에 남색 #12246B, 보라 #4B3A8C, 자주 #9A5A82, 주황 #EE8A4F.
- 종이(매니페스토, 원페이저, 인스타 카드): 크림 #FCFBF8 위에 남색, 마젠타 #845185, 테라코타 #9A3324, 주황.
- 규칙: 화면은 잉크 위에, 종이는 크림 위에. 글자와 점의 색은 같다.
```

## 2. 사이트의 문장 (전부 `data/naru.ts`, 영문도 같이)

| # | 키 | 지금 | 뒤 |
| --- | --- | --- | --- |
| B1 | `december.facts`의 "가설" 행 | k "가설", v "결과만 존재하면 안 됩니다. 1위 한 팀에게 몰아 주는 것보다 과정마다 모두에게 나누는 쪽이 더 좋은 결과물을 낸다고 봅니다. 12월은 그 가설의 검증입니다." | k "왜 날마다", v "1위 한 팀에게 몰아 주는 것보다 과정마다 모두에게 나누는 쪽이 더 좋은 결과물을 낸다고 봅니다. 그래서 날마다 나눕니다." en: "Why every day" / "We think sharing support with everyone along the way produces better work than handing it all to first place. So we share it every day." |
| B2 | `december.stages[1..4].title`과 `name` | 문제 발견/Discovery, 빌드/Build, 다듬기/Refine, 성과 공유회/Showcase | 찾기/Find, 확인받기/Check, 만들기/Build, 공유하기/Share. Day 4의 세션 없는 마일스톤과 본문에서 "성과 공유회"는 그대로. `scheduleLead`의 "Discovery에서 Showcase까지"는 "찾기에서 공유하기까지". 노선도, 카드, 폰 패널 제목이 같은 키를 읽는지 확인 |
| B3 | `december.programConcrete` 바로 아래, 새 키 `crossingLine` | 없음 | ko "싱가포르에서 만든 자리를 서울로 건너와 엽니다. 한국의 대학생과 해외에서 공부하는 한인 학생이 같은 팀이 됩니다." en "A place made in Singapore, crossed over to Seoul. Students in Korea and Korean students abroad end up on the same team." 그리는 자리: `programConcrete` 문단 바로 아래 같은 스타일 BODY 한 문단. 히어로 셋째 문단의 "한국의 대학생과 해외에서 공부하는 한인 학생이 한 팀이 됩니다."는 겹치므로 히어로에서 그 문장을 뺍니다 |
| B4 | 나루 정의 네 자리: `teaser.body`(370행), `/naru` 필(391행), `/naru` 히어로 둘째 문단(605행), 푸터(2681행) | "학생이 직접 운영하는 비영리 그룹 나루가 엽니다…" / "한국에 뿌리를 둔 학생 빌더 모임" / 정의문(가까움) / "…학생 빌더 그룹. 서울과 싱가포르, 그리고 그 너머." | 티저: "한국에 뿌리를 두고 학생이 직접 운영하는, 영리를 목적으로 하지 않는 그룹 나루가 엽니다. 2026년 8월 싱가포르에서 시작했습니다." 필: "한국에 뿌리를 둔 학생 빌더 그룹"(모임 → 그룹). 히어로 둘째 문단: 정의문 KO 전문 그대로. 푸터: 짧은 판 "한국에 뿌리를 두고 학생이 직접 운영하는, 영리를 목적으로 하지 않는 그룹." EN은 정본의 EN과 부제 |
| B6 | 코어 02 본문(647행) | "연습이 아니라 진짜 앞에 섭니다. 실명이 박힌 기업…" | "모의가 아니라 진짜 앞에 섭니다. 실명이 박힌 기업…" en "Not a mock run. The real thing: …" |
| B11 | EN 표기 | "Crossing Seoul" 1회, program/programme 혼용, `dictionaryCore.openChat` "Open Chat" vs `naru.footer` "Open chat" | 전부 CROSSING SEOUL, programme, "Open chat". `grep -rn "Crossing Seoul\|\bprogram\b\|Open Chat" data components`가 0 |
| B7 | 홈 헤더 워드마크 | 국문 "크로싱 서울" 단독 | 표기 B "CROSSING SEOUL"(지금 크기, 같은 그라데이션). 히어로는 표기 A 그대로. "맨 위 로고 둘" 문제는 이번에 건드리지 않습니다(10/11 되돌림) |

B5(공간/자리)는 사이트가 이미 "자리"이므로 코드 변경 없음. 정본에 적고 매니페스토 v5 TODO.

B10: `docs/site-review-brief.md` 2.2의 히어로 META 줄 "전공, 코딩 경험 무관…"을 지우고, 그 자리에 "등록 안내의 '전공과 코딩 경험은 참가 조건이 아닙니다'를 그대로 둔다. 히어로에 올리지 않는다."로 고칩니다(문서 수정만).

## 3. 건드리지 말 것

레이아웃, 글자 크기, 정렬, 블록 순서, 배경, 노선도의 모양, 폰 접힘, 사진, 헤더의 자리. 되돌려진 2단계와 3단계의 내용은 이 브리프에 없습니다. 사람 이름, 회의록 인용 없음.

## 4. 결정 (기본값으로 진행)

| # | 질문 | 기본값 | 다르면 |
| --- | --- | --- | --- |
| D1 | 닷새 이름을 찾기/확인받기/만들기/공유하기로 | 한다. 인스타 10/10판과 같은 이름 | B2를 빼고 정본의 "닷새의 이름"을 지금 사이트 이름으로 적음 |
| D2 | 코어 01은 "자리" | 자리. 사이트 그대로, 매니페스토 v5에서 맞춤 | "공간"이면 620행과 정본을 공간으로 |
| D3 | 코어 02의 "연습"을 "모의"로 | 한다 | 그대로 두고 정본의 은유 규칙에서 "연습" 줄을 뺌 |
| D4 | 색 규칙 | 화면은 잉크, 종이는 크림 | 정본의 "색" 절만 바꿈 |

## 5. 검증

| # | 항목 | 기준 |
| --- | --- | --- |
| 1 | 금지어 | 홈과 `/naru` `main` innerText에서 가설, 검증, 실험, POC, FDE, 비영리, 모임(정의문 자리), Discovery, Showcase 0회. "스크리닝" 홈 2 이하 |
| 2 | 정의문 | "영리를 목적으로 하지 않는"이 네 자리(티저, 필, 히어로, 푸터)에서 같은 문장 안에 있음 |
| 3 | 단계 이름 | 노선도, 날짜 카드, 폰 패널 제목, `scheduleLead`에 찾기/확인받기/만들기/공유하기. 옛 이름 0회(마일스톤 이름 "성과 공유회 완주"는 예외) |
| 4 | 건너기 | 홈 `main`에 "건너와" 1회(프로그램 리드 아래) |
| 5 | EN | "Crossing Seoul" 0, " program " 0, "Open Chat" 0. 헤더 워드마크가 CROSSING SEOUL |
| 6 | 화면 불변 | 1440×900과 390×844 전체 페이지 스크린숏에서 글자 외의 차이 0(블록 위치, 크기, 판). 글자가 늘어난 B3 문단만큼만 아래가 밀림 |
| 7 | 빌드와 아카이브 | `npm run build` 통과. `/2026-08`, `/quiz`, `/match` 픽셀 차이 0 |

## 6. 커밋

1. `docs: 브랜드 정본 한 장` (`docs/brand.md`, `CLAUDE.md` 한 줄, `site-review-brief.md` B10 정정)
2. `copy(home): 가설 행을 왜 날마다로` (B1)
3. `copy(program): 닷새 이름을 찾기 확인받기 만들기 공유하기로` (B2)
4. `copy(home): 크로싱의 뜻 한 줄` (B3)
5. `copy: 나루 정의문을 정본으로 네 자리` (B4)
6. `copy(naru): 코어 02는 모의가 아니라` (B6)
7. `copy: EN 표기 통일, 헤더는 CROSSING SEOUL` (B11, B7)
8. `docs(changelog): 2026-10-11 brand` (`CHANGELOG.md` 맨 위, 25줄 이하)

`main` 푸시는 사용자가 스크린숏을 확인한 뒤입니다.
