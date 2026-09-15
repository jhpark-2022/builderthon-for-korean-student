# Changelog 2026-09-15 (크로싱 서울 포지션 반영)

**Project:** 나루 NARU 사이트 (Next.js)
**Branch:** `main`
**Scope:** 카피가 대부분입니다. 컴포넌트는 `#december` 제목 구조 하나와
`lib/naruDates.ts`의 포맷 함수 둘. 이름, 날짜, `tbd` 목록, 로고, 팔레트, 배경,
`/2026-08`의 크레딧은 손대지 않았습니다.

---

## 1. 문제

홈이 12월을 이렇게 말하고 있었습니다.

> 코어는 그대로 두고 **무대를 한국으로 옮깁니다.**

그 문장이 서울 개최를 "한국 이벤트"로 읽히게 만듭니다. 그러면 두 가지가
깨집니다. 한국 밖에서 공부하는 한인 유학생이 자기 자리를 못 찾고, 8월과의
서사도 끊깁니다. 8월은 싱가포르 **안에서** 열렸고, 12월은 그 안이 아닌
자리입니다. 넓어지는 것은 판이지 무대의 위치가 아닙니다.

어긋난 문장이 셋이었습니다.

| 키 | 전 | 문제 |
| --- | --- | --- |
| `december.lead` | 코어는 그대로 두고 무대를 한국으로 옮깁니다 | 한국 이벤트로 읽힘 |
| `december.who` | 한국 대학생과, 싱가포르에서 8월을 건넌 사람들 | 대상이 두 집단으로 닫힘. 싱가포르 밖의 한인 유학생이 빠짐 |
| `hero.sub` | 다음 이벤트 크로싱 서울은 12월 9일에 시작합니다 | 날짜만 있고 무엇인지가 없음 |

## 2. 결정

**크로싱 서울 = 한인 학생 빌더가 국경과 상관없이 만나는 자리.**

코어 둘은 그대로입니다. 이름과도 맞물립니다. "크로싱"은 8월의 기록("59명이
8일을 건넜습니다")에서 온 동사인데, 국경을 두고 읽으면 한 겹이 더 생깁니다.

조심한 것 둘.

1. **이것은 "한인 전용 vs 넓게"와 다른 축입니다.** 국경을 여는 것이지 한인이라는
   범위를 여는 것이 아닙니다. 영문에서 `Korean`을 빼지 않았습니다.
2. **한국 안의 독자에게 "한인"은 교포나 유학생으로 읽힙니다.** 그래서 12월
   블록에서 한 번은 "한국의 대학생과 해외의 한인 유학생"으로 풀어 썼습니다
   (`december.lead`, `december.who`).

### 제목 구조를 바꿨습니다

전에는 H2가 날짜였습니다("12월 9일, 서울에서 시작합니다"). 그러면 이 챕터가 가장
큰 글씨로 "언제"를 말하는데, 이 이벤트에서 설명이 필요한 것은 언제가 아니라
무엇입니다.

```
전                                   후
H2   12월 9일, 서울에서 시작합니다.     아이브로  다음 이벤트  크로싱 서울
이름 크로싱 서울 (주황 작은 줄)         H2       국경과 상관없이, 한인 학생 빌더가 만나는 자리.
                                      날짜 줄   2026년 12월 9일부터, 서울.
```

이름이 라벨 자리로 올라갔고, 날짜는 한 줄로 내려왔습니다. 날짜 문자열은 여전히
`lib/naruDates.ts`에서만 나옵니다(`formatDecemberDateLine` 신설).

## 3. 바뀐 키

### `data/naru.ts`

| 키 | 무엇 |
| --- | --- |
| `hero.sub` | `{date}`와 `{name}` 자리표시자로. 렌더가 naruDates에서 채웁니다 |
| `hero.eyebrow` | **그대로.** `TODO: confirm` 주석만 더했습니다(3장 참고) |
| `record.lead` | "싱가포르에서 8일" → "싱가포르 **안에서** 8일" |
| `record.gapsNote` | "그래서 12월 이벤트가 있습니다" → "그래서 **{name}**이 있습니다" |
| `december.eyebrowPrefix` | 신설. `eyebrow` 삭제 |
| `december.heading` | 신설. `headingSuffix` 삭제 |
| `december.lead` | 교체 |
| `december.changes[0]` | 신설(맨 앞). 기존 둘은 그대로 |
| `december.whyLabel` · `why` | 신설. 두 줄 |
| `december.who` | 셋을 나열. 인원과 비율은 쓰지 않음 |
| `december.nameTbd` | **지우지 않음.** 다음 크로싱이 이름 없이 시작할 때 다시 쓰입니다 |
| `december.notSequel` · `tbd` | **그대로** |
| `join.cards[0].lines[0]` | "어느 나라에서 공부하든"을 더함 |
| `join.alumni` | **그대로.** 이미 포지션과 맞습니다 |

### 그 밖

- `lib/naruDates.ts`: `formatDecemberMonth`, `formatDecemberDateLine` 신설
- `components/home/NaruHome.tsx`: `#december` 머리 구조, 히어로와 gapsNote의
  자리표시자 치환, `why` 블록 렌더
- `app/layout.tsx`: `SITE_DESCRIPTION`에 이름과 포지션 문장. 이름은
  `DECEMBER_EVENT_NAME`에서 읽습니다. `keywords`에 크로싱 서울, CROSSING SEOUL,
  한인 유학생 추가. "이름이 없어서"라는 낡은 주석 교체
- `app/opengraph-image.tsx`: 마지막 줄이 "CROSSING SEOUL  9 Dec 2026" + 그 아래
  작은 줄 "Korean student builders, wherever they study". `alt`도 갱신
- `data/dictionary.ts`: `about.visionSteps`의 크로싱 서울 칸 `body`와 `wrap.next`
  에만 국경 한 구절. `program.awards.next` · `benefits` · `faq`는 자리 안내
  문장이라 **손대지 않았습니다**

## 4. 확인 방법

```
npx tsc --noEmit          통과
npm run build             통과
```

검사 넷 (브리프 6장).

| | 결과 |
| --- | --- |
| 큰 말 (`글로벌`·`디아스포라`·`월드와이드`·`국경을 넘/건너/잇`·`해외 각지`) | **0건** |
| `무대를 한국으로` · `한국으로 옮` | **0건** |
| `december` 블록의 제로백·Zero100·빌더톤·2회차 | 5건, 전부 규칙 주석 3 + `notSequel` ko/en 2 |
| em dash | 새로 쓴 문장에 0건 |

눈으로 확인한 것.

- 375px에서 아이브로가 **한 줄**, 가로 오버플로 0
- ko H2 3줄, **en H2 4줄**(아래 참고)
- OG 카드의 마지막 두 줄이 겹치지 않음

스크린샷 갱신: `home-375-ko.png`, `home-375-en.png`,
`home-375-ko-december.png`, `home-375-en-december.png`,
`home-1440-ko-december.png`, `home-1440-en-december.png`

### 브리프 기준에서 벗어난 것 셋

1. **아이브로에서 날짜를 뺐습니다.** 기준은 "다음 이벤트 · 크로싱 서울 ·
   2026.12 서울"이었는데 375px에서 두 줄로 접혔습니다. 브리프가 지시한
   대응("넘치면 아이브로에서 날짜를 빼고 서브에만 둔다")을 그대로 따랐습니다.
   바로 아래 날짜 줄이 "2026년 12월 9일부터, 서울."을 이미 말합니다.
   `formatDecemberMonth`는 지우지 않고 남겼습니다.
2. **영문 H2를 줄였습니다.** 기준은 "Where Korean student builders meet,
   whichever country they study in."이었는데 375px에서 **다섯 줄**이었습니다.
   "Korean student builders meet here, wherever they study."로 줄여 네 줄이
   됐습니다. 세 줄까지 줄이려면 "student"를 빼야 하는데, 그건 이 그룹의 영문
   자기 표현이라 네 줄을 택했습니다. `Korean`은 빼지 않았습니다.
3. **히어로 서브에서 도시를 한 번 뺐습니다.** 기준 문장은 "12월 9일 서울,
   크로싱 서울에서는"이었는데 서울이 연달아 두 번 나옵니다. 이름에 이미 서울이
   있어서 "12월 9일, 크로싱 서울에서는"으로 다듬었습니다.

## 5. TODO: confirm

| 항목 | 지금 | 어디 |
| --- | --- | --- |
| 히어로 아이브로 | "싱가포르 한인 학생 빌더 커뮤니티" 그대로. 후보는 "싱가포르에서 시작한 한인 학생 빌더 커뮤니티" | `data/naru.ts` `hero.eyebrow` |
| 귀국 시기 줄 | 안 씀. "12월은 흩어져 있던 사람들이 한곳에 모이는 시기"는 유학생 귀국 규모가 미검증 | `december.why` 주석 |
| 크로스보더 문제 각도 | 안 씀. 동남아 진출 한국 기업이 문제를 열고 한국 학생은 한국 시장, 싱가포르 학생은 싱가포르 시장의 눈으로 본다는 기획 초안. 출제사 확정 전 | `december.changes` 주석 |
| 한국 쪽 주관 주체 | "각 학교 한인 학생회" 그대로. 한국 안의 학교에서 누가 주관 자리에 서는지 미정 | `join.cards[1]` · `how.layers[1]` 주석 |
| 12월 종료일 | `null`. 화면은 "12월 9일부터"까지만 | `lib/naruDates.ts` |

앞 체인지로그(`changelog-september-15-2026-naru-launch.md`)의 TODO 목록도 함께
보세요. 이름은 그쪽에서 확정됐고 여기서 채우지 않은 것은 위 다섯뿐입니다.
