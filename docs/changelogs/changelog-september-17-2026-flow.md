# Changelog 2026-09-17 (홈의 흐름: 12월을 앞으로, 행동을 제목 아래로)

**Project:** 나루 NARU 사이트 (Next.js)
**Branch:** `main`
**Scope:** `/` 홈만. 챕터 순서 하나(`#december` ↔ `#how`), `#december`의 CTA 배선,
`#how`에서 `#join`으로 가는 이정표, 메일 제목 통일, 그리고 9/16 정리에서 떨어진
문장 셋의 복원. `/2026-08`, `/quiz`, 배경, 팔레트, `#why`의 자리는 손대지 않았습니다.

---

## 1. 문제

서브에이전트 다섯이 서로 다른 방법으로 홈의 흐름을 평가했습니다. 페르소나 4인
여정, CTA 인벤토리와 링크 그래프, 브라우저 실측 스토리보드, 모바일 thumb-path,
스토리 스파인과 약속·근거 감사. 다섯이 독립적으로 같은 곳을 짚었습니다.

### 12월이 너무 멀고, 도착해도 할 일이 없었습니다

실측(390×844, ko, localhost iframe).

| 지점 | 전 |
| --- | --- |
| 문서 길이 | 12,149px, 14.4화면 |
| `#december` 제목 | 5.9화면 |
| 본문의 첫 행동(오픈채팅) | 8.6화면 |
| 히어로 주 CTA 착지 뒤 행동까지 | 3화면 더 |

원인 넷.

1. **`#how`(세 층)가 `#record`와 `#december` 사이에 끼어 있었습니다.** 폰에서
   2,140px. 독자는 학생회 임원, 기업 담당자, 운영진, 곧 `#join`의 독자인데 12월을
   예비하는 문장은 한 줄도 없었습니다. "가입 폼 없음"을 `#how`와 `#join`이 두
   챕터 떨어져 세 번 말하고 있었습니다.
2. **히어로 주 CTA가 행동 없는 자리에 착지했습니다.** `#december` 제목에
   떨어지고, 오픈채팅과 메일은 챕터 맨 끝, 미정 목록 아래에 같은 고스트로 나란히
   있었습니다. "소식 받기"와 "출제사 문의"가 동급으로 읽혔고, 페이지의 최종
   행동 전부가 고스트였습니다.
3. **9/16 "코어만 남깁니다"에서 문장 셋이 떨어졌습니다.** 12월 블록에 남은
   유일한 참가 대상 문구가 "알럼과 한국 대학생"이라 해외 한인 유학생을 정확히
   제외했습니다(포지션 브리프 §2 위반). "스크리닝 없음"이 12월 블록에 0회.
   "3곳 문제를 여는 회사"가 같은 화면의 미정 목록에도 있었습니다.
4. **기업과 학생회에게 이정표가 없었습니다.** 헤더의 "세 층"은 읽고 난 뒤에야
   뜻이 통하는 이름이고, `#how`에서 `#join`으로 가는 링크가 없었습니다. 메일
   제목도 `#december`는 "크로싱 서울 문의", 기업 카드는 "나루 후원 문의"로
   갈라져 있었습니다.

## 2. 결정

### 순서: `top → record → december → how → join → (people) → why`

이벤트 줄(8월 → 12월)을 먼저 끝내고, 조직 줄(세 층 → 문 → 이유)을 통째로 뒤에
둡니다. 히어로 서브의 두 문장 순서와 챕터 순서가 같아집니다. 12월의 숫자는 전부
초안이라 8월의 실측에서 신뢰를 빌려야 하는데, 그 거리가 가장 짧습니다. 기업이
읽는 줄(`#how` 후원 카드, `#join` 기업 카드, `#why` 재는 것)이 연속 세 챕터가
됩니다.

`#why`는 맨 아래 그대로입니다(9/16 결정 유지). `#record`가 `#december` 앞인
것도 그대로입니다. 270px 이음매는 `#december`에 붙어 따라왔고, 이제 "여기서
과거가 끝나고 미래가 시작합니다"라는 그 자리의 주석이 처음으로 말 그대로가
됐습니다.

### `#december`의 배선

```
전                                   후
아이브로 / H2 / 날짜 / notSequel       아이브로 / H2 / 날짜 / notSequel
shapeLead                            ctaNote (등록 안내 + 스크리닝 없음)
stats 6 / draftNote                  [오픈채팅, 흰 면]          ← 주 행동
stages 5                             shapeLead
tbd                                  stats 6 / draftNote
ctaNote                              stages 5
[오픈채팅 고스트] [메일 고스트]         tbd
                                     출제사 및 후원 문의 → (텍스트 링크)
```

오픈채팅이 제목 바로 아래 흰 면 버튼이 됐습니다. 주황이 아닌 이유는 히어로의
주황 원장("면은 히어로 CTA와 12월 아이브로, 둘뿐. 늘리지 마세요")이 막기
때문이고, 흰 면은 `#record`의 아카이브 버튼이 이미 "챕터의 주 행동"으로 쓰는
면입니다. `OpenChatLink`에 `variant="primary"`가 생겼고, 기본값은 ghost라
`/2026-08`과 나머지 자리는 한 글자도 바뀌지 않습니다.

메일은 텍스트 링크로 내려갔고 제목은 `#join` 기업 카드와 같은
"나루 출제사 및 후원 문의"입니다. 푸터의 "문의"는 새 `naruLinks.general`
("나루 문의"). `naruLinks.december`는 없어졌습니다.

### 이정표 둘

- 헤더 앵커 "세 층" → **"학생회와 기업"** (en "Councils and companies").
- `#how`의 층 카드 셋 끝에 텍스트 링크 하나씩: 운영진으로 함께하기 → `#join-crew`,
  학생회로 문의하기 → `#join-organiser`, 기업으로 문의하기 → `#join-company`.
  `#join` 카드에 id가 생겼습니다(`JoinCard.id`, `Layer.join`). 새 목적지는 없고
  앵커만 늘었습니다.

### 문장 셋 복원 (9/16을 세 줄만큼 되돌림)

| 키 | 전 | 후 |
| --- | --- | --- |
| `december.shape[2].note` | 알럼과 한국 대학생 | 한국의 대학생과 해외의 한인 유학생 |
| `december.ctaNote` | 등록은 아직 열리지 않았습니다. | + 열리면 스크리닝 없이, 오는 사람이 참가자입니다. |
| `december.shapeLead` | raw data에서 문제를 찾는 것부터… | 앞에 "8월에는 기업이 정제한 문제를 받았습니다." (`changes[1]`에서 한 문장만) |
| `december.notSequel` | 그 이벤트에서 나온 코어 2개 | 그 8일에서 나온 **변하지 않는 두 개** (`#why`로 링크, `notSequelTerm`) |
| `how.lead` | 학생회와 기업은 서로 직접… | 앞에 "8월의 자리도 12월의 자리도 같은 세 층이 만듭니다." |
| `december.shape[1].note` | raw data와 담당자까지 | 목표. raw data와 담당자까지 |
| `december.tbd` | | + "주관 학생회" |

"코어 2개"를 "변하지 않는 두 개"로 바꾼 이유: 같은 것을 페이지가 낱말 넷으로
불렀습니다(코어 2개, 변하지 않는 두 개, 두 가지, 위의 두 개). `#why` 아이브로와
같은 말로 묶고, 그 구절을 `#why` 링크로 그립니다(`TermLink`). 두 챕터 뒤에서
풀리던 전방 참조가 이름 있는 앵커가 됐습니다.

`changes`, `who`, `after` 블록 전체를 되살린 것은 아닙니다. 한 문장씩만 빌렸습니다.

## 3. 바뀐 파일

- `data/naru.ts`: `naruLinks`(`december` 삭제, `general` 신설, `sponsor` 제목),
  `naruNav` 순서와 라벨, `Layer.join`, `JoinCard.id`, `how.lead`, `how.layers[].join`,
  `december.notSequel`/`notSequelTerm`/`shapeLead`/`shape[1..2].note`/`tbd`/`ctaNote`,
  `join.cards[].id`. `#people` TODO 주석의 자리도 렌더와 맞췄습니다(`#join` 뒤).
- `components/home/NaruHome.tsx`: CH2/CH3 블록 교체, `TermLink`, `Card`의 `id`,
  `#december` CTA 블록 이동과 승격, `#how` 층 카드의 링크, `#join` 카드 id와
  track src(`join_${card.id}`), 푸터 메일.
- `components/ui/OpenChatLink.tsx`: `variant?: "ghost" | "primary"`.

## 4. 확인 방법

`npx tsc --noEmit` 통과. `npm run lint`는 이 레포에 ESLint 설정이 없어 대화형
프롬프트가 뜹니다(전부터 그랬습니다). 금지어 검사는 전부터 의도된 부정문
(`notDoing`, "2회차가 아닙니다")만 걸립니다. `december` 블록에 제로백·Zero100·
빌더톤은 `notSequel`의 부정문에만 있습니다.

같은 방법으로 재측정(390×844, ko).

| 지점 | 전 | 후 |
| --- | --- | --- |
| `#december` 제목 | 5.9화면 | 3.4화면 |
| 본문의 첫 행동(오픈채팅) | 8.6화면 | 3.9화면 |
| 히어로 CTA 착지 화면 안의 행동 | 없음 (3화면 더) | 흰 버튼 y 709~763에 보임 |
| 첫 mailto | 8.6화면 | 6.3화면 |
| 문서 길이 | 14.4화면 | 14.8화면 (문장 셋과 링크 셋이 늘어난 만큼) |

1440×900도 같은 방향(제목 5.0 → 3.6화면, 첫 행동 6.3 → 4.1화면, 착지 화면 안에
버튼 보임). 헤더 레일 순서 나루 → 8월의 기록 → 12월 → 학생회와 기업 → 함께 → 왜.
`#how`의 "기업으로 문의하기"를 누르면 `#join-company` 카드가 헤더 아래에 옵니다.
콘솔 에러 0, 가로 넘침 0. 스크린샷은 세션 스크래치패드 `flow/`(전)와
`flow-after/`(후).

## 5. 하지 않은 것

평가에서 나왔지만 이번에 적용하지 않은 것. 사용자가 1·2·3·5만 고른 결과입니다.

- `#how`의 요약 카드 3장과 상세 카드 3장 중 한 벌 걷기.
- `#join` 알럼 띠의 오픈채팅(참가자 카드와 같은 라벨, 같은 track src) 삭제.
  헤더 오픈채팅의 track src를 아카이브와 분리(`nav` → `naru-nav`).
- `/2026-08` closing에 "나루 홈으로" 한 줄(지금은 맨 위 배너 하나뿐).
  아카이브 `showQuiz`를 내려 모바일 헤더에 오픈채팅 복귀. `/quiz`의 나루 표기.
  `Quiz.tsx`의 `/?register=1` 죽은 링크.
- `#why` 뒤 행동. "결론에 CTA를 얹지 않는다" 결정과 충돌하므로 두었습니다.
- 사진 벽 12 → 6장 접기. 정적 페이지 원칙과 6의 배수 규칙에 걸립니다.

## 6. TODO: confirm

- `december.tbd`의 "주관 학생회": 한국 안의 학교에서 누가 주관 자리에 서는지
  (`how.layers[1]`의 같은 TODO). 정해지면 이 목록에서 한 줄 빼세요.
- `naruNav`의 en "Councils and companies": "학생회"의 영문은 사이트 다른 곳에서
  "student associations"인데 칩 폭 때문에 줄였습니다.

---

## 추가 (같은 날) · #why를 판 두 장으로 다시 그립니다

사용자: "우리는 두 가지를 만들려고 모였습니다 부분의 content가 너무 안 이쁘게
presented 되어 있어. 사실 나에게는 여기가 가장 중요한데."

실측 화면(1440, ko)이 그 말을 뒷받침했습니다. 코어 둘은 카드 안 H3(최대 34px)에
14px 본문이었고, 그 아래로 왼쪽 정렬된 회색 소문자 블록(exec, measure, agenda)이
얇은 헤어라인 하나씩 사이에 두고 이어졌습니다. 챕터 제목은 가운데, 본문은 왼쪽.
결론이 아니라 문서였습니다. 9/16의 "강조 장치 다섯"은 위계를 고쳤지만 판형은
그대로였어요.

### 바꾼 원칙 셋

1. **코어 둘은 카드가 아니라 판입니다.** 전면 폭(max-w-5xl), 세로로 두 장, 사이에
   1px 헤어라인. 제목은 새 토큰 `STATEMENT`(`typography.ts`, clamp 31.5~51.75px,
   H2와 H3 사이의 단). 첫 줄("스크리닝이 없고, 순위가 없습니다. 못해도 되는
   자리입니다.")은 그 자체가 코어의 문장이라 `text-xl sm:text-2xl`, 둘째 줄이
   본문. "그래서 지키는 것"은 md부터 오른쪽 열에 세로 헤어라인을 두고 섭니다.
   12월 기획 슬라이드의 코어 장 배치(왼쪽 약속, 오른쪽 지켜지는 지점)를 이번엔
   실제로 그렸습니다. 나루 점은 제목 첫 글자 앞 그대로(0.65em, 하한 18px 유지).
2. **문장은 가운데로 돌아옵니다.** 경첩(`note`), 재는 것(`measure`), 마지막 줄
   (`agenda`)이 챕터 제목과 같은 축에 H3 크기로 섭니다. 왼쪽 정렬은 판 안쪽과
   exec 두 열에만 남습니다.
3. **이 챕터에서 `text-sm`을 쓰지 않습니다.** 결론의 본문이 페이지에서 가장 작은
   글씨였습니다. 바닥은 `text-base`(18px). exec 제목은 `text-xl sm:text-2xl`.

여전히 하지 않은 것: 상자, 주황 면, 두 번째 그라데이션 선, CTA. 판을 나누는 것은
1px 흰 헤어라인뿐이고 서명 헤어라인은 제목 아래 한 번입니다. ol/dl/h3/h4 의미
구조는 그대로입니다.

### 길이

| | 전 | 후 |
| --- | --- | --- |
| 390 | 2,407px | 2,991px |
| 1440 | 1,727px | 2,377px |

길어졌습니다. 글자가 커진 만큼입니다. 결론이 페이지에서 가장 작은 글씨로 가장
짧게 지나가는 것보다 낫습니다. 영문(en)도 두 뷰포트에서 확인했습니다.
제목 "A safe place to try something new"가 데스크톱에서 두 줄, 폰에서 두 줄.

### 바뀐 파일

- `components/ui/typography.ts`: `STATEMENT` 신설.
- `components/home/NaruHome.tsx`: `#why` 블록 전체. 카피 키는 하나도 안 바뀜.

### 확인 방법

`npx tsc --noEmit` 통과. `#why` 블록 안에 `text-sm` 0건. 스크린샷은 세션
스크래치패드 `why/`(before, after, after-en, 각 390과 1440).

---

## 추가 (같은 날) · #why 한 단 축소, 사진 벽의 중복 하나 교체

사용자: "또 너무 큰데? 그리고 for the photowall, do not use the same photo twice."

### #why

판형은 그대로, 크기만 전부 한 단 내렸습니다. 첫 판형의 코어 제목은 51.75px까지
갔는데 H2(67.5px)와 겨루는 크기였습니다.

| | 1차 | 2차 |
| --- | --- | --- |
| 코어 제목 `STATEMENT` | clamp 31.5~51.75px | clamp 27~38px |
| 코어 첫 줄 | `text-xl sm:text-2xl` | `text-lg sm:text-xl` |
| 경첩, 재는 것 | `H3` (24~34px) | `text-xl sm:text-2xl` |
| exec 제목 | `text-xl sm:text-2xl` | `text-lg sm:text-xl` |
| 판 세로 여백 | `py-10 sm:py-12 lg:py-16` | `py-8 sm:py-10 lg:py-12` |
| 챕터 높이 (390 / 1440) | 2,991 / 2,377px | 2,867 / 2,156px |

나루 점은 제목이 작아진 만큼 0.65em → 0.75em으로 올려 하한 18px을 지킵니다.
크기가 아니라 배치가 이 챕터를 결론으로 만든다는 것이 2차의 교훈입니다.

### 사진 벽

`day8-panel.webp`와 `day8-career.webp`가 같은 순간이었습니다(현직자 세 명이 앉은
커리어 간담회 패널, 각도만 다름). 9/16에 열 장을 열두 장으로 채우면서 같은
폴더에서 한 장 더 꺼낸 결과였어요. 같은 사진을 두 번 걸지 않습니다.

`day8-panel`을 빼고 그 자리에 `day8-automation.webp`를 넣었습니다. Automation
트랙 공유회의 발표 컷(세 명이 강단에서 슬라이드를 앞에 두고 발표). 벽의 다른
발표 컷 `day8-prove`는 Judgement 트랙이라 이제 트랙마다 하나씩입니다. 장수는
열두 장 그대로(6의 배수 규칙). 원본
`Photo/Day 8/Automation Track Sharing/IMG_2621.HEIC`, 5712×4284, 4:3.
긴 변 1200px webp q76.

후보로 본 것: Day 7 열다섯 장은 전부 같은 서명 장면이라 벽에 맞지 않았고,
Day 5 열 장은 이미 있는 `day5-session`과 같은 세션이었습니다.

### 바뀐 파일

- `components/ui/typography.ts`: `STATEMENT` 값.
- `components/home/NaruHome.tsx`: `#why` 크기 클래스.
- `data/naru.ts`: `record.photos[10]` (panel → automation).
- `public/record/day8-panel.webp` 삭제, `public/record/day8-automation.webp` 추가.

### 확인 방법

`npx tsc --noEmit` 통과. `md5 public/record/*`로 파일 중복 없음, 눈으로 열두 장의
장면 중복 없음(스크래치패드 `why/contact.png`, `why/after2-1440-record.png`).

### 3차 · 코어 제목 둘만 한 번 더

사용자가 "변하지 않는 두 개" 챕터에서 큰 글자를 코어 제목 둘로 짚었습니다.
`STATEMENT`를 clamp 27~38px에서 **22.5~29px**로. 이제 H3(24~34px)보다 작고, 그
아래 첫 줄(`text-lg sm:text-xl`, 20~22.5px)보다 한 단 큽니다. 나루 점은 0.8em으로
올려 좁은 쪽 끝에서 하한 18px을 정확히 지킵니다. 판형과 나머지 크기는 2차
그대로. 챕터 높이 390 / 1440: 2,797 / 2,137px.

---

## 추가 (같은 날) · 이벤트와 그룹을 나눕니다

사용자: "이벤트와 그룹 설명은 분리해 주어야 함. 맨 아래에 그룹 로고랑 존재
목적이 있고, 그 위에는 원래처럼 8월 이벤트 recap과 12월 이벤트 설명. 12월은 8월
이벤트 사이트와 같은 격식으로(빌더톤_2회차_기획.pdf)."

확인한 결정 셋: 히어로는 12월 이벤트. 12월 상세는 기획 PDF 전부(초안 표시).
날짜는 12/10~12/14로 확정.

### 구조

```
전                                   후
#top       나루 로고 + 태그라인         #top       크로싱 서울 (이름, 기간, 도시, 포지션, 오픈채팅)
#record    8월의 기록                  #record    8월의 기록 (그대로)
#december  12월 (숫자 6 + 스테이지 5)   #december  프로그램 (모양, 왜 서울인가, 아쉬웠던 넷과 답,
#how       세 층                                  일정, 멘토링, 약속이 지켜지는 지점, 미정, 문)
#join      함께                        #naru      나루 (로고, 태그라인, 변하지 않는 두 개, 경첩, 방법은 바뀝니다)
#why       변하지 않는 두 개            #how       학생회와 기업 (그대로)
                                      #join      함께 (그대로)
```

위 셋이 이벤트, 아래 셋이 그룹. 270px 이음매가 `#december`에서 `#naru`로 옮겨
가 "여기서 이벤트가 끝나고 그룹이 시작한다"를 말합니다. `#why` 챕터는 없어졌고
코어 판 둘은 `#naru` 안에 있습니다. 안쪽 앵커 `id="why"`가 남아 옛 링크와
notSequel의 링크는 그대로 닿습니다. 헤더 앵커: 크로싱 서울 · 8월의 기록 ·
프로그램 · 나루 · 학생회와 기업 · 함께.

### 히어로

8월 사이트의 히어로가 8월 이벤트였듯이, 크로싱 서울입니다. H1이 이름(ko에서는
영문 표기 한 줄 더), 기간 줄, 포지션("국경과 상관없이…"), 한 줄 설명, 그리고
오픈채팅(주황 면, `OpenChatLink variant="hero"`)과 "프로그램 보기 ↓". 나루 로고는
헤더에만 있습니다. 아이브로는 보라(히어로에 주황 둘 금지, 9/15 결정 그대로).

### 프로그램 (`#december`), 기획 PDF 매핑

| 기획 | 화면 |
| --- | --- |
| 01 성과 | `#record` (전부터 있음) |
| 02 코어 VISION & MISSION | `#naru`의 코어 둘 |
| 02 코어 EXECUTION (멘토링 퀄리티, 들어주는 사람, 재는 것) | `#december` 멘토링 아래 "약속이 지켜지는 지점" (`why.exec`, `why.measure`를 그대로 읽음) |
| 03 제안 (왜 셋) | "왜 서울인가" 카드 셋 (`december.reasons`) |
| 03 아쉬웠던 넷 → 12월 | "8월에 아쉬웠던 넷, 그리고 12월의 답" (`record.gaps`, 답 둘을 기획에서 채움) |
| 04 일정 (스테이지 5, 워크샵 3, 제출 2, General Mentoring) | 일정 카드 5 (`stages[].dayOffset/workshop/submit`), 멘토링 규칙 4 (`december.mentoringRules`) |
| 05 실행 (팀이 알아볼 세 곳) | 내부용. 싣지 않음 |

전부 초안 표시(`draftNote`)와 미정 목록이 붙어 있습니다. 미정 목록에서 "기간과
마지막 날"이 빠졌습니다(확정).

### 날짜

`lib/naruDates.ts`: `DECEMBER_STARTS_AT` 12/09 → **12/10**, `DECEMBER_ENDS_AT`
null → **12/14**. 새 `formatDecemberDay(locale, offset)`로 스테이지 날짜를 셉니다
(카피에 날짜 문자열 없음). 따라 바뀐 곳: `app/layout.tsx` 설명, `app/opengraph-image.tsx`
(10–14 Dec 2026), `data/dictionary.ts`의 `wrap.next`와 `wrap.cardLines`(아카이브가
12월을 말하는 유일한 자리, 런칭 브리프가 허용한 예외).

> TODO: confirm. 기획의 스테이지는 12/13 Pitch에서 끝나는데 기간은 12/14까지
> 입니다. 하루가 비어 있습니다. 14일이 무엇인지(예비일, 클로징, 이동일) 정해질
> 때까지 화면은 기간만 말하고 14일에 무엇이 있다고 쓰지 않습니다.

### 바뀐 파일

- `data/naru.ts`: `naruNav`, `eventHero`, `group`, `december.program*`/`reasons`/
  `gaps*`/`schedule*`/`workshop*`/`submitLabel`/`mentoring*`, `stages`(오프셋·워크샵·
  제출), `tbd`, `record.gaps[2..3].answer`.
- `components/home/NaruHome.tsx`: 히어로·프로그램·나루 챕터 새로 씀. `#record`,
  `#how`, `#join`, `#people`, 푸터는 그대로. `#why` 챕터 제거(판은 `#naru`로).
- `components/ui/OpenChatLink.tsx`: `variant="hero"`, src `naru-hero`.
- `lib/naruDates.ts`, `app/layout.tsx`, `app/opengraph-image.tsx`, `data/dictionary.ts`.

### 확인 방법

`npx tsc --noEmit` 통과. 가로 넘침 0(390, 1440). ko/en 전체 페이지 스크린샷은
세션 스크래치패드 `split/`. 문서 길이 390: 16,072px, 1440: 11,307px. `#december`가
폰에서 6,436px로 가장 깁니다. 8월 사이트의 프로그램 챕터와 같은 사정입니다.

### 3차 · 걷어내기

사용자: "너무 길어 지금 웹사이트가." 폰 16,045px(19화면)이었습니다.

| 어디 | 무엇 | 폰에서 |
| --- | --- | --- |
| `#record` | 사진 12 → 6 (`record.wall`이 고름, 파일과 photos 목록은 그대로) | 1,934 → 1,466 |
| `#december` | "왜 서울인가" 카드 셋 내림. 아쉬웠던 넷: 카드 → 제목 + 12월 한 줄. 멘토링 규칙: 카드 → 칩 한 줄. "약속이 지켜지는 지점" 두 항목 내림, 재는 것 한 줄만 | 6,436 → 4,041 |
| `#naru` | "우리는 두 가지를…" 제목 내림(태그라인이 H2, lead가 이미 "아래 두 개"). 판 여백 축소 | 2,313 → 2,160 |
| `#how` | "하는 것 / 얻는 것" 카드 셋 내림. 다이어그램 아래 문 링크 셋 | 2,335 → 1,317 |
| 합계 | | **16,045 → 12,010px** (1440: 11,165 → 8,988) |

내려간 키(`december.reasons`, `why.exec`, `how.layers[].does/gets`, `why.heading`,
`record.photos`의 여섯 장)는 전부 그대로 있습니다.
