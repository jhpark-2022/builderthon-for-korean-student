# 브리프: 홈을 나루로, 크로싱 서울은 그 안의 첫 자리로

대상 레포: `website` (`4f112e1` 이후). 정본은 `docs/brand.md`(먼저 읽습니다). 근거는 2026-10-26 외부 리뷰어와의 대화(사용자 결정: "한번 내가 좀 나루가 먼저 오게 뒤집어봄", 리뷰어의 절충안 "홈은 나루로 두고, 그 밑에 12월 이벤트, 제로백, 미래에 있을 이벤트" + "홈 나루 페이지에 12월을 좀 더 띄우는"). 리뷰어의 논리: 12월은 1회성이고 나루는 계속 남는다, 학생에게는 "계속 소속될 수 있는 커뮤니티가 여기 있다"가 더 센 후킹이다, 12월은 나루를 보여 주는 첫 쇼케이스다.

**원칙: 글은 새로 쓰지 않고, 두 페이지의 자리를 바꾸고, 나루 홈 맨 위에 12월을 띄웁니다.** 컴포넌트(`NaruHome`, `NaruPage`)는 그대로 두고 라우트만 바꾸므로 되돌리기는 커밋 하나입니다.

## 0. 정본과 어긋나는 곳 (먼저 사용자 확인, D0)

brand 3장 원칙 2 끝의 "그래서 채널에서도 무대(이벤트)가 먼저고, 만든 쪽(나루)은 그 안에서 드러난다", 4장 "사이트는 참가자용입니다", 그리고 10/19 결정 2("나루는 처음부터 내세우지 않고 결과를 보인 뒤 드러나게")가 이 브리프와 반대입니다. 원칙 2 자체(언더독으로 서지 않는다, 제대로 된 무대를 먼저 만든다)는 그대로이고 **채널에 적용하는 문장만** 바뀝니다. 11장대로 3장은 사이트에서 먼저 바꾸지 않으므로, 이 브리프는 사용자가 D0을 "예"로 주었을 때만 실행하고, 같은 커밋에 brand.md를 고칩니다.

| 자리 | 지금 | 뒤 |
| --- | --- | --- |
| 3장 원칙 2 끝 문장 | 그래서 채널에서도 무대(이벤트)가 먼저고, 만든 쪽(나루)은 그 안에서 드러난다. | 제대로 된 무대가 먼저다. 사이트에서는 나루가 틀이고, 지금 여는 무대가 그 틀의 첫 자리에 선다(2026-10-26 사용자, 외부 리뷰: 12월은 1회성이고 나루는 남는다). 나루는 설명이 아니라 무대의 목록으로 드러난다. |
| 4장 "사이트는 참가자용입니다" | 사이트는 참가자용입니다. | 홈(`/`)은 나루이고, 크로싱 서울 페이지(`/crossing`)는 참가자용입니다. |
| 6장 인스타 줄 | 이벤트를 먼저 보여 주고 그 안에서 나루를 드러낸다 | 그대로(인스타는 이 브리프 밖) |
| 맨 위 "마지막 손질" | 2026-10-24 | 2026-10-26(3장 채널 문장, 4장 홈) |

## 1. 바꾸는 것

### 1.1 라우트

| 주소 | 지금 | 뒤 |
| --- | --- | --- |
| `/` | 크로싱 서울 (`NaruHome`) | **나루 홈** (`NaruPage` + 1.3의 블록) |
| `/crossing` | 없음 (`/crossing/team`만 있음) | **크로싱 서울** (`NaruHome` 그대로. 글, 챕터, id 전부 같음) |
| `/naru` | 나루 | `/`로 308 리다이렉트(옛 링크, 카드) |
| `/2026-08` | 8월 기록 | 그대로 |
| `/en`, `/en/naru`, `/en/2026-08` | 정적 사본 | `/en`은 나루 홈 사본, `/en/crossing` 새로, `/en/naru`는 `/en`으로. `middleware.ts`의 `PAGES`와 `matcher`에 `/crossing`, `/en/crossing` 추가 |
| `/#december`, `/#register`, `/#mentoring`, `/#gains`, `/#partners`, `/#schedule` | 홈 앵커 | 나루 홈에 작은 클라이언트 스크립트 하나: `location.hash`가 `naruNav`의 id면 `/crossing#같은해시`로 `replace`. 밖에 뿌린 링크가 죽지 않게 |

페이지 파일: `app/page.tsx` ↔ `app/crossing/page.tsx`로 내용을 옮깁니다(메타데이터, LD, OG 포함). Event JSON-LD(`HOME_LD`의 Event)는 `/crossing`으로, `url`은 `${SITE_URL}/crossing`. `/`의 LD는 Organization만(지금 `/naru`와 같음). `app/naru/page.tsx`는 리다이렉트만 남깁니다.

### 1.2 메타, OG, 사이트맵

| 자리 | 뒤 |
| --- | --- |
| `/` title | `나루 NARU` (absolute), description은 지금 `/naru`의 것 그대로. EN 탭 제목 `NARU` |
| `/crossing` title | 지금 `/`의 것 그대로(`크로싱 서울 2026 | 나루 NARU`, EN `CROSSING SEOUL 2026 | NARU`) |
| OG 이미지 | `app/opengraph-image.tsx` ↔ `app/naru/opengraph-image.tsx`를 맞바꿔 `/`는 나루 카드, `/crossing`은 크로싱 서울 카드. `app/en/opengraph-image.tsx`도 같이 |
| `app/sitemap.ts` | `/` 1.0, `/crossing` 0.9, `/2026-08` 0.6, `/quiz` 0.5. `/naru`는 뺌 |
| canonical | `/crossing`에 `alternates.canonical: "/crossing"`, `/`는 `/` |

### 1.3 나루 홈 맨 위: 12월을 띄우는 블록 (글은 전부 있는 문장)

`NaruPage`의 히어로 안, 정의문(`naru.group.name`)과 구체 한 줄(`naru.group.concrete`) 다음, 지금 `id="record"` 블록 자리에 **"여는 자리" 표**를 둡니다. 지금 record 블록의 두 문장과 버튼은 표의 둘째 행으로 들어갑니다. 새 문장은 0이고 라벨 둘("여는 자리", "다음")만 새 낱말입니다.

| 행 | 왼쪽 (BODY 굵게 + META) | 오른쪽 (BODY) | 링크 |
| --- | --- | --- | --- |
| 1 (강조, 지금 여는 자리) | 크로싱 서울 / 2026년 12월 17일부터 21일까지, 서울 (`decemberEventLabel`, `naruDates`) | `december.heading` "국경과 상관없이, 한인 학생 빌더가 만나는 자리." 그 아래 META `registerNoteShort` "등록은 11월에 엽니다. 혼자 등록하고, 전공과 코딩 경험은 조건이 아닙니다." | 버튼 둘: `카카오톡으로 소식 받기 →`(`openChatLabels.december`, 지금 홈 히어로의 링크 그대로, `track("naru_cta", {src:"home-crossing"})`) + 보조 `크로싱 서울 보기 →`(`/crossing`) |
| 2 | 제로백 빌더톤 / 2026년 8월 22일부터 29일까지, 싱가포르 | `naru.record.lead2` "2026년 8월 싱가포르의 제로백 빌더톤에서 시작했습니다." + `naru.record.credit` "그 8일을 만든 사람들에게 빚을 졌습니다." | `naru.record.cta` "제로백 빌더톤 기록 전체 보기 →" (`naruLinks.archive`) |
| 3 | 다음 / (날짜 없음) | `/2026-08` 비전 셋째 칸의 문장 그대로: "이벤트는 이어집니다. 어디서 열릴지는 그때의 학생회와 기업이 정합니다." (`data/dictionary.ts`에서 가져와 `naru.events.next`로 복사. 한쪽을 고치면 다른 쪽도) | 없음 |

- 표 문법은 /naru "어떻게 일하는가" 아래의 가는 선 행(border-t, py 20/24)과 같습니다. 1행만 `bg-white/[0.04] rounded-2xl border border-white/15`(홈 카운트다운 카드와 같은 면)로 띄웁니다. 그것이 "12월을 좀 더 띄우는" 전부이고, 새 색이나 글자 크기는 없습니다.
- 라벨: 표 위 SUBHEADING "여는 자리" / "What NARU opens". 데이터 키 `naru.events { label, rows[3] }`.
- 카운트다운은 `/crossing`에만 둡니다(D4).
- 이 표 아래부터는 지금 /naru 그대로: 변하지 않는 두 개, 어떻게 일하는가, 왜 이 자리가 필요한가, 매니페스토, 로고 띠, 푸터.
- `id="record"`는 2행에 남깁니다(옛 링크, 배경 국면, 하단 바 `afterId`).

### 1.4 헤더, 메뉴, 푸터

| 자리 | 지금 | 뒤 |
| --- | --- | --- |
| 워드마크 | `/`는 크로싱 서울(국문 단독, brand 6장 예외 C), `/naru`와 `/2026-08`은 나루 | 세 페이지 모두 **나루** 락업(`brand="naru"`). 예외 C는 `/crossing`에 적용(그 페이지의 워드마크는 크로싱 서울 국문 단독 그대로) |
| 사이트 메뉴 `coreDict.pages` | 홈(`/`) / 나루(`/naru`) / 8월 기록 | **홈(`/`)** / **크로싱 서울(`/crossing`)** / 8월 기록. key는 `naru`, `crossing`, `aug` 순. footerLabel: 나루 / 크로싱 서울 / 제로백 빌더톤 8월 기록 |
| 챕터 칩 | `/`에 `naruNav`, `/naru`에 `naruPageNav` | `/`에 `naruPageNav`, `/crossing`에 `naruNav`. 칩 "홈으로"류 링크는 `/` |
| 푸터 "나루 알아보기 →"(`naru.teaser.cta.href`) | `/naru` | `/` |
| `app/not-found.tsx`의 `/naru` 링크 | `/naru` | `/` |
| `/crossing/team`의 "← 돌아가기"(`TeamTool.tsx`), `quizEditions` `backHref`, `Journey.tsx`의 "크로싱 서울 프로그램 보기 →"와 "크로싱 서울 알아보기 →" | `/` | `/crossing` |
| `MobileChatBar afterId="gains"` | 홈 | `/crossing`에서 그대로. `/`(나루 홈)에는 지금 /naru처럼 없음 |
| 배경 | `/`는 서울 형상(home), `/naru`는 싱가포르 정지(water still) | 각 컴포넌트가 가진 것을 그대로 따라감(`BackgroundMount` 호출을 페이지 파일과 같이 옮김) |

### 1.5 그 밖에 손대는 파일

`lib/organizationLd.ts`(`url` 그대로 `SITE_URL`, `#naru` id 그대로), `lib/siteUrl.ts` 변화 없음, `app/robots.ts` 변화 없음, `data/naru.ts`에 `events` 키 추가와 `teaser.cta.href`, `data/dictionaryCore.ts`의 `pages`, `data/quizEditions.ts`, `components/crossing/TeamTool.tsx`, `components/journey/Journey.tsx`(href 둘), `components/shared/PageChips.tsx`(`SitePage` 순서), `middleware.ts`, `app/en/*`, `CHANGELOG.md`, `docs/brand.md`.

## 2. 하지 않는 것

크로싱 서울 페이지의 글, 챕터 순서, id, 카운트다운, 등록 블록, 기업의 닷새, 남는 것, 함께하는 곳: 전부 그대로(innerText 동일). /naru의 코어, 어떻게 일하는가, 왜, 매니페스토: 그대로. 8월 기록: 그대로. 새 문장 0(라벨 "여는 자리", "다음"만). 새 색, 새 글자 크기 0. 인스타, 카카오톡 링크(`/go/*`) 변화 없음. `/crossing/team` 기능 변화 없음.

## 3. 결정 기본값

| # | 질문 | 기본값 |
| --- | --- | --- |
| D0 | brand 3장 채널 문장과 4장 첫 문장을 0장대로 고치는 데 동의하는지 | **사용자가 프롬프트에서 "예"를 줘야 실행.** 아니면 이 브리프 전체를 하지 않음 |
| D1 | 크로싱 서울의 새 주소 | `/crossing` (`/crossing/team`이 이미 그 아래에 있음). 대안 `/2026-12`는 기록처럼 읽혀 안 씀 |
| D2 | `/naru` 처리 | `/`로 308. 공유 카드, 카카오톡에 뿌린 `/naru` 링크가 살아 있음 |
| D3 | 여는 자리 표의 3행 "다음" | 넣음. 문장은 /2026-08 비전 셋째 칸 그대로. 날짜, 도시는 쓰지 않음(brand 6장: 다음 회차는 정해지지 않음) |
| D4 | 나루 홈 1행에 카운트다운 | 넣지 않음. 날짜 한 줄과 버튼 둘. 카운트다운은 `/crossing` 히어로에 그대로 |
| D5 | 나루 홈 1행의 버튼 | 카카오톡 주, 크로싱 서울 보기 보조. 애널리틱스(10/24)에서 `/`의 방문이 LinkedIn 유입 166으로 가장 많아 소식 받기 버튼은 첫 화면에 남겨야 함 |
| D6 | 메뉴 라벨 | 홈 / 크로싱 서울 / 8월 기록. 10/22 "크로싱 서울이 셋"은 워드마크가 나루가 되면서 사라짐 |

## 4. 검증

| # | 기준 |
| --- | --- |
| 1 | `/crossing` `main` innerText가 적용 전 `/`와 같음(KO, EN). 챕터 id 여섯 그대로. 1440과 390 전체 페이지 픽셀 차이 1% 이하(헤더 워드마크 제외) |
| 2 | `/` 맨 위: 로고, 태그라인, 정의문, 구체 한 줄, 여는 자리 표(3행), 그 아래 변하지 않는 두 개. 1행에 날짜, 한 문장, 등록 한 줄, 버튼 둘. 새 문장 0 |
| 3 | `/naru` → `/` 308. `/en/naru` → `/en`. `/#register` → `/crossing#register`에 착지(헤더 아래 8~16px). `/crossing/team` 돌아가기가 `/crossing` |
| 4 | OG: `/`가 나루 카드, `/crossing`이 크로싱 서울 카드(두 주소를 `curl`로 `og:image`, `og:title` 확인). 사이트맵에 `/crossing` 있고 `/naru` 없음 |
| 5 | 사이트 안 `href="/"`와 `href="/naru"`를 전부 grep해 표로. 홈이어야 할 것과 크로싱이어야 할 것이 섞이지 않음 |
| 6 | 세 페이지 헤더 워드마크 나루, 메뉴 순서 홈 / 크로싱 서울 / 8월 기록, 활성 표시가 맞는 페이지에 |
| 7 | brand.md 두 문장이 바뀌어 있고 "마지막 손질" 2026-10-26. `npm run build` 통과, axe 변화 없음, EN 문서 높이 차이 10% 이하 |

적용 전후를 `/`, `/crossing` 1440×900과 390×844로 나란히.

## 5. 커밋

`feat(site): 홈은 나루, 크로싱 서울은 /crossing (여는 자리 표, /naru 리다이렉트)` + `docs(brand): 3장 채널 문장, 4장 홈` 같은 커밋 / changelog("한 것"에 brand 3장 원칙 2 근거와 2026-10-26 사용자 결정). `main` 푸시는 사용자 확인 뒤. 되돌릴 때는 이 커밋 하나를 revert.
