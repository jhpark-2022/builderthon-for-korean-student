# 구조 브리프: 홈은 크로싱 서울, 나루는 `/naru`

대상 레포: `website` (커밋 `6d5b620` 기준). 바꾸는 파일은 `app/page.tsx`, 새 `app/naru/page.tsx`(+ `opengraph-image.tsx`), `components/home/NaruHome.tsx`(둘로 나눔), `components/journey/JourneyNav.tsx`, `data/naru.ts`(naruNav와 티저 키), `app/sitemap.ts`, 배경의 챕터 지도(`lib/background/scene/BackgroundScene.ts`의 anchors). `/2026-08`, `/quiz`, `/match`, 등록 폼, Supabase는 건드리지 않습니다. 체인지로그는 `CLAUDE.md` 규칙대로 `CHANGELOG.md` 한 곳에만.

사용자 결정(2026-10-10): "나루와 크로싱 서울이 한 페이지에 있어 혼동된다. 목차는 프로그램과 나루로 단순하게. 프로그램 끝에 나루 티저, 나루 내용은 전부 다른 탭으로."

`docs/home-dedupe-brief.md`(B, C)는 **이 브리프 뒤에** 실행합니다. 그 브리프의 행 번호는 이 작업 뒤에 어긋나므로 키 이름으로 찾습니다.

## 0. 결론 한 줄

**`/`는 크로싱 서울(이벤트) 한 가지만 말하고, 나루(그룹)는 `/naru`로 옮깁니다.** 글은 한 문장도 새로 쓰지 않습니다(티저 두 문장 제외). 블록을 옮기고, 이름이 섞이는 자리만 정리합니다.

## 1. 페이지 셋

| 페이지 | 누구를 위한 것 | 챕터 (id) | 목차 칩 |
| --- | --- | --- | --- |
| `/` | 등록하러 온 학생 | `top`(히어로), `december`(프로그램), `gains`(참가 혜택 + 등록 안내), **`naru`(티저, 한 상자)** | 프로그램 / 참가 / 나루 |
| `/naru` | 학생회, 후원사, 운영진, 더 알고 싶은 사람 | 지금 홈의 `#naru` 챕터 전부(소개, `#record` 8월 요약, 변하지 않는 두 개, 경첩, 방법, `#how` 어떻게 일하는가), `#join` 챕터 전부(왜 이 자리가 필요한가, `#join-ways`, 맺음, 매니페스토), `#people`이 홈에 있으면 그것도 | 나루 / 코어 / 함께하기 / 왜 |
| `/2026-08` | 8월 기록 | 그대로 | 그대로 |

## 2. 홈 (`/`)

### 2.1 남는 것

`#top`, `#december`, `#gains`(등록 안내와 세 버튼 포함). 순서와 내용은 그대로입니다.

### 2.2 빼는 것 (전부 `/naru`로 이동, 삭제 아님)

`NaruHome.tsx` 1298행부터 `#join` 끝까지(`<Chapter id="naru">`, `<Chapter id="join">`, 조건부 `<Chapter id="people">`). 코드는 `components/naru/NaruPage.tsx`(새 파일)로 옮기고, `NaruHome.tsx`에는 티저만 남깁니다. 두 컴포넌트가 같이 쓰는 것(`Chapter`, `PlateSegment`, `Reveal`, `PhoneFold`, `Halo`, 토큰)은 `components/home/shared.tsx` 같은 한 파일로 뺍니다. 중복 복사 금지.

### 2.3 티저 (`#naru`, 홈의 마지막 블록, 등록 안내 아래)

`READ` 폭, 상자 하나(둥근 테두리, 지금 General Mentoring 상자와 같은 문법, 색은 보라 계열). id는 `naru`로 둡니다. 옛 링크 `/#naru`가 여기에 내려앉습니다.

```ts
// data/naru.ts, naru.teaser (새 키). DECIDED 2026-10-10 (사용자: 나루 내용은 전부 다른 탭으로).
teaser: {
  eyebrow: { ko: "여는 사람들", en: "Who runs this" },
  body: {
    ko: "학생이 직접 운영하는 비영리 그룹 나루가 엽니다. 2026년 8월 싱가포르에서 시작했고, 이번이 두 번째 자리입니다.",
    en: "CROSSING SEOUL is run by NARU, a student-run, not-for-profit group. It started in Singapore in August 2026, and this is the second time.",
  },
  cta: { label: { ko: "나루 알아보기", en: "About NARU" }, href: "/naru" },
},
```

상자 왼쪽에 나루 인장(지금 `#naru` 머리의 로고, 크기 그대로). 폰에서는 위에.

### 2.4 홈에서 이름이 섞이는 자리

- `#december` 머리말 "다음 이벤트 크로싱 서울"(`eyebrowPrefix` + `decemberEventLabel`, 808행)을 그리지 않습니다. 홈이 곧 크로싱 서울입니다. 키는 둡니다.
- 히어로 셋째 문단(452행)의 "학생이 직접 운영하는 그룹, 나루가 엽니다."는 **그대로 둡니다.** 첫 화면에서 누가 여는지 한 번은 말해야 합니다. 다만 "나루"에 `/naru` 링크를 겁니다(밑줄 없음, 색만).
- 헤더(`JourneyNav`, `brand="naru"`) 왼쪽 로고: 홈에서는 나루 락업 대신 **크로싱 서울 워드마크**(히어로의 `decemberEventLabel` 두 조각과 같은 글자, `text-xl`). 클릭은 `#top`. `/naru`에서는 지금의 나루 락업 그대로, 클릭은 `/naru#top`. (D2)
- 홈 목차 `naruNav`: `top`(크로싱 서울), `december`(프로그램), `gains`(참가), `naru`(나루, 티저로). `join` 항목은 뺍니다. 폰 레일도 같은 넷.
- 푸터: "나루" 로고 클릭이 `/naru`로. 크레딧 줄은 그대로.
- 홈의 JSON-LD는 그대로(Organization `@id` `/#naru`는 티저 id와 맞습니다). `/naru`에도 같은 Organization LD를 넣습니다.

## 3. `/naru`

### 3.1 페이지

`app/naru/page.tsx`: `JourneyNav`(brand naru, 목차는 3.2), `BackgroundMount`(variant는 4장), `NaruPage`. 메타: title "나루 NARU", description은 지금 `#naru` 챕터 리드 한 줄. OG 이미지는 홈 것을 복제하되 글자만 "나루 NARU / 한국에 뿌리를 둔 학생 빌더 모임". `sitemap.ts`에 `/naru` 추가(priority 0.8). 헤더 왼쪽에 "← 크로싱 서울"(`/`) 링크를 `/match`의 돌아가기와 같은 문법으로.

### 3.2 순서와 목차

옮겨 온 블록의 순서는 홈에 있던 그대로입니다.

| 칩 | id | 내용 |
| --- | --- | --- |
| 나루 | `top` | h1 "건너는 건 각자가 한다. 자리는 우리가 만든다." + 소개 문단 셋 + `#record` 8월 요약 + "제로백 빌더톤 기록 전체 보기 →" |
| 코어 | `core` | 변하지 않는 두 개, 경첩(문턱과 롤모델), 방법은 바뀝니다 |
| 함께하기 | `how` | 어떻게 일하는가(주관, 주최, 후원), 세 버튼, 메일 |
| 왜 | `why` | 왜 이 자리가 필요한가, 세 곳, 절박하지 않아도, 매니페스토 |

`#join-ways`, `#record`, `#how`, `#why` id는 안쪽 앵커로 남깁니다. 옛 링크 `/#join`, `/#how`, `/#why`, `/#record`는 `next.config` redirects로 못 잡으므로(해시는 서버에 안 옴) 홈의 `NaruHome`에 작은 클라이언트 훅 하나: 마운트 시 `location.hash`가 `#join|#how|#why|#record|#join-ways`이면 `/naru` + 같은 해시로 `replace`. 그 외 해시는 손대지 않습니다.

### 3.3 `/naru`의 맨 끝

마지막 블록(매니페스토 상자) 아래에 돌아가는 줄 하나: "크로싱 서울 프로그램 보기 →"(`/#december`)와 "등록이 열리면 가장 먼저 알기 →"(홈의 같은 버튼이 가는 곳). 새 문장 없음.

## 4. 배경

홈의 배경은 챕터 지도(anchors: heroEnd, december, gains, record, naru)로 싱가포르 형상에서 서울 형상으로 건너갑니다. `#naru` 챕터가 사라지므로:

- 홈: 도착(`arrivedAt`)을 `#gains` 끝, `naru`를 티저 상자로 잡습니다. 서울 형상이 티저 뒤에서 완성되어 있어야 합니다. "형상은 판 뒤에서만 바뀐다"(2026-09-26) 검증 1을 다시 돌립니다. 광선 속도 노브(LIGHT_SWEEP 등)는 건드리지 않습니다.
- `/naru`: 새 셰이더를 만들지 않습니다. 기존 `BackgroundVariant` 중 하나로: 서울 형상이 처음부터 완성된 상태에서 시작해 나루 점만 있는 정지 장면(2026-09-19 나루 심벌 브리프의 변형). 없으면 `/match`가 쓰는 변형을 그대로 씁니다. (D3)

## 5. 건드리지 말 것

- 옮기는 블록의 글, 글자 크기, 정렬, 판(plate) CSS, `PhoneFold` 규칙(10/10). 옮긴 뒤 `/naru`의 본문 innerText는 홈에서 뺀 블록의 innerText와 **글자 단위로 같아야** 합니다(순서 포함).
- `/2026-08`, `/quiz`, `/match`(backHref "/"는 그대로), 등록 폼, API, Supabase.
- 카피 규칙: em dash 금지, 가운뎃점 새로 쓰지 않음. 새 문장은 2.3의 둘과 3.3의 링크 라벨뿐입니다.

## 6. 결정 (사용자)

| # | 질문 | 기본값 |
| --- | --- | --- |
| D1 | 탭 주소 | `/naru` |
| D2 | 홈 헤더 로고 | 크로싱 서울 워드마크. 나루 락업은 `/naru`에서만. 두 이름이 한 화면에 로고로 같이 서는 것이 혼동의 절반입니다 |
| D3 | `/naru` 배경 | 기존 변형 재사용. 새 셰이더 없음 |
| D4 | `#record`(8월 요약 숫자) 위치 | `/naru` 소개 바로 아래. 홈의 참가 혜택 한 줄("8월에는 74명이 신청했고…")이 홈 쪽 8월 언급의 전부 |

## 7. 검증

| # | 항목 | 기준 |
| --- | --- | --- |
| 1 | 글자 보존 | 홈에서 뺀 블록의 innerText == `/naru` 본문 innerText (티저, 돌아가는 줄, 헤더 제외) |
| 2 | 홈 길이 | 1440×900에서 7,000px 이하(지금 11,725), 390×844에서 5,500px 이하 |
| 3 | 이름 | 홈 `main` innerText에서 "나루" 4회 이하(히어로 1, 티저 2, 목차 1). "제로백" 2회 이하 |
| 4 | 목차 | 홈 칩 넷, `/naru` 칩 넷. 폰 레일에서 활성 칩이 스크롤을 따라감(기존 IntersectionObserver) |
| 5 | 옛 링크 | `/#naru` → 티저에 멈춤. `/#join`, `/#how`, `/#why`, `/#record` → `/naru`의 같은 자리. `/2026-08`의 돌아가기와 `/match`의 돌아가기 그대로 |
| 6 | 배경 | 홈 1440, 1000, 390에서 "형상은 판 뒤에서만 바뀐다" 위반 0. 서울 형상이 티저 뒤에서 완성. `/naru`에서 콘솔 경고 0 |
| 7 | 헤더 | 홈 헤더에 나루 락업 없음, `/naru` 헤더에 크로싱 서울 워드마크 없음(돌아가기 링크 글자는 제외) |
| 8 | 메타 | `/naru` title, description, OG 이미지 렌더. sitemap에 `/naru` |
| 9 | 빌드와 아카이브 | `npm run build` 통과. `/2026-08`, `/quiz`, `/match` 픽셀 차이 0 |

홈과 `/naru`의 전체 페이지 스크린숏을 1440×900과 390×844로, 적용 전 홈과 나란히 보여 주세요.

## 8. 커밋

1. `refactor(home): 공용 조각을 shared로` (2.2의 분리, 화면 변화 0)
2. `feat(naru): /naru 페이지, 홈의 나루와 왜 챕터를 옮긴다` (3장)
3. `feat(home): 나루 티저, 목차 넷, 머리말과 헤더 정리` (2.3, 2.4)
4. `fix(background): 홈 챕터 지도를 티저까지로, /naru 배경` (4장)
5. `chore(seo): /naru 메타, OG, sitemap, 옛 해시 링크` (3.1, 3.2)
6. `docs(changelog): 2026-10-10 split naru` (`CHANGELOG.md` 맨 위, 25줄 이하)

`main` 푸시는 사용자가 스크린숏을 확인한 뒤입니다. 그 뒤에 `docs/home-dedupe-brief.md`를 실행합니다.
