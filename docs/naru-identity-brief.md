# 나루 공식 표기 반영 브리프 (2026-09-28, 정의 문장 2026-09-29 개정)

이 브리프 하나로 작업합니다. 순서대로 하고, 각 단계의 검증을 통과한 뒤 다음으로 갑니다.
레포 규칙은 `CLAUDE.md`를 따릅니다(체인지로그는 `CHANGELOG.md` 맨 위 한 항목, `DECIDED` 주석, em dash 금지).
`main`에 푸시하지 마세요. 브랜치 `naru-identity-2026-09-28`에 커밋하고 멈춥니다. 배포는 사용자가 합니다.

## 0. 무엇이 정해졌나 (DECIDED 2026-09-28, 정의 문장은 2026-09-29 개정, 사용자)

나루의 공식 표기가 정해졌습니다. 이름은 그대로 **나루 / NARU**입니다.

| 항목 | 문구 |
| --- | --- |
| 영문 부제 | A Korea-rooted alliance of student builders |
| 정의 (EN) | A Korea-rooted, student-run alliance of student associations and clubs across Seoul, Singapore and beyond, building together with AI. |
| 정의 (KO) | 서울과 싱가포르, 그리고 더 많은 나라의 학생회와 학회가 모인, 한국에 뿌리를 둔 학생 운영 연합입니다. AI로 함께 만듭니다. |
| 국문 부제 | 한국에 뿌리를 둔 학생 빌더 연합 (**TODO: confirm.** 사용자가 아직 확정하지 않은 번역안입니다. 주석에 그렇게 남기세요) |

정의 문장 개정(2026-09-29)에서 달라진 점: "Korea-rooted"와 "student-run"이 정의 안으로 들어왔고, 학생회 앞의 "Korean"이 빠졌으며, 지역이 "Seoul and Singapore"에서 "Seoul, Singapore and beyond"로 열렸습니다. 정의 문장이 "서울과 싱가포르"만 말하는 곳이 남아 있으면 이 문장으로 바꿉니다.

왜 바꾸나: 자문(9/28)에서 "지금 이름만으로는 예쁜 이름의 이벤트 회사와 구별되지 않는다"는 지적이 나왔습니다.
약어를 억지로 붙이는 대신, 이름은 두고 무엇인지 말하는 부제와 정의 문장을 고정했습니다.
"싱가포르 한인 학생 빌더 커뮤니티"는 12월(서울)부터 맞지 않고, "유학생"과 "커뮤니티"는 이 그룹을 이벤트 회사나 동호회와 구별하지 못합니다.

로고도 바뀌었습니다. 정본은 `~/Dropbox/Uni/Extra Curriculur/12월 빌더톤/그룹 기획/나루_로고_확정/` 입니다(`나루_로고가이드_v2_2026-09-29.pdf`).
- 마스터 링: 위 `KOREAN STUDENT BUILDERS` → `A KOREA-ROOTED ALLIANCE`, 아래 `SINGAPORE` → `OF STUDENT BUILDERS`. 링을 위에서 아래로 읽으면 영문 부제가 됩니다. 두 줄 모두 Montserrat 800, font-size 23, letter-spacing 위 0.9 / 아래 1.2.
- 가로 락업 기본(09~11): 아래 줄 `SINGAPORE` → `NARU`(font-size 16, letter-spacing 9).
- 가로 락업 설명형(12~14): 두 줄 `A KOREA-ROOTED ALLIANCE` / `OF STUDENT BUILDERS`.
- 04 열린 문구 판은 폐기. 심볼, 이름만 락업, 프로필 마크는 바뀌지 않았습니다.

## 1. 원칙

- 나루 **자신을 가리키는** "커뮤니티", "싱가포르 한인 학생 빌더 커뮤니티", "a community that started in Singapore"만 바꿉니다. 일반 개념으로 쓰인 커뮤니티(예: `data/naru.ts`의 "커뮤니티에는 이벤트가 필요합니다")는 그대로 둡니다.
- **`/2026-08` 아카이브(`data/dictionary.ts`, `components/journey/*` 본문)는 고치지 않습니다.** 그 페이지는 8월의 기록이고 크레딧을 고치지 않는다는 결정(2026-09-15)이 있습니다. 헤더/푸터 로고가 공용 파일이면 그건 자동으로 바뀌어도 됩니다.
- 부제와 정의 문장은 위 표 그대로 씁니다. 다듬거나 줄이지 마세요. 길이 때문에 못 들어가면 멈추고 그 자리를 보고합니다.
- 영문 화면에서 한글이 보이지 않게 하는 기존 규칙(README "영문 마스터")을 지킵니다.

## 2. 로고 자산 (`public/naru/`)

정본 PNG/SVG에서 다시 만듭니다. 만드는 법은 `public/naru/README.md`에 적힌 그대로입니다(투명 여백 자르기, 긴 변 900px).

| 파일 | 원본 | 할 일 |
| --- | --- | --- |
| `naru-master-rev.png` | `PNG/naru_03_마스터_반전.png` | 다시 만든다 |
| `naru-lockup-rev.png` | `PNG/naru_11_가로락업_반전.png` | 다시 만든다(지금 쓰는 곳이 없어도 사본을 정본과 맞춘다) |
| `naru-master-en-rev.svg` | `SVG/naru_03_마스터_반전.svg` | 링 글자 두 줄만 위 문구와 속성으로 바꾼다. 가운데 아웃라인 NARU와 심볼은 그대로 |
| `naru-name-rev.png`, `naru-name-en-rev.svg`, `naru-symbol.svg`, `app/icon.svg` | 변경 없음 | 건드리지 않는다 |

- `README.md`의 "쓰는 규칙" 제목을 "로고 가이드 v2 요약"으로 바꾸고, 링 문구가 바뀐 사실과 날짜를 "영문 마스터" 절에 한 줄 추가합니다. `KOREAN STUDENT BUILDERS, SINGAPORE`라고 적힌 설명도 새 문구로 고칩니다.
- `lib/background/shaders/water.ts`가 마스터 PNG를 표식으로 씁니다(291행 주석). 파일을 바꾼 뒤 배경에서 링 글자가 어떻게 보이는지 스크린샷으로 확인하세요. 크기나 위치 상수는 바꾸지 않습니다.

## 3. 매니페스토 PDF

그룹 기획 폴더의 `매니페스토_나루.pdf`가 새 표지(로고, 부제, 정의 문장)로 다시 나왔습니다(2026-09-29판).
- `public/naru/naru-manifesto-v2-2026-09.pdf`로 **새 파일명**으로 복사합니다(README 규칙: 같은 이름으로 덮지 않는다). v1 파일은 지웁니다.
- `data/naru.ts`의 `naruLinks.manifesto`와 `NaruHome.tsx` 1467행 주석의 파일명, 버튼 옆 `PDF 0.9MB` 숫자를 실제 크기로 맞춥니다.
- 영문 매니페스토(`NARU_Manifesto_EN.pdf`)를 영문 화면에서 내려받게 할지는 **TODO: confirm.** 이번에는 하지 않고 주석으로만 남깁니다.

## 4. 문구 변경 목록

| # | 위치 | 지금 | 바꿀 것 |
| --- | --- | --- | --- |
| 1 | `data/naru.ts` `hero.eyebrow` | ko 싱가포르 한인 학생 빌더 커뮤니티 / en Korean student builders in Singapore | ko 한국에 뿌리를 둔 학생 빌더 연합 (TODO: confirm) / en A Korea-rooted alliance of student builders |
| 2 | `data/naru.ts` `eventHero.naruLine` | 싱가포르에서 시작한 커뮤니티, 나루가 엽니다. / Run by NARU, a community that started in Singapore. | 한국에 뿌리를 둔 학생 연합, 나루가 엽니다. / Run by NARU, a Korea-rooted alliance of student builders. |
| 3 | `data/naru.ts` `group.concrete` | 나루는 학생회와 기업을 이어 이벤트를 엽니다. 첫 이벤트는 ... | 정의 문장(KO/EN) 그대로 + 기존 둘째 문장(첫 이벤트는 2026년 8월 싱가포르의 제로백 빌더톤이었습니다 / The first was ...). 첫 문장은 정의와 겹치므로 뺍니다 |
| 4 | `data/naru.ts` `footer` 주관 | 각 학교 한인 학생 단체 / each school's Korean student association | 각 학교 한인 학생회와 학회 / Korean student associations and clubs at each school. 한 줄 요약(2309~2310행)도 같이 |
| 5 | `app/layout.tsx` `SITE_DESCRIPTION` 마지막 문장 | 나루는 싱가포르에서 시작한 한인 학생 빌더 커뮤니티입니다. | 나루는 서울과 싱가포르, 그리고 더 많은 나라의 학생회와 학회가 모인, 한국에 뿌리를 둔 학생 운영 연합입니다. (정의 KO의 첫 문장. 검색 설명이 길어지면 AI 문장은 뺍니다) |
| 6 | `app/layout.tsx` `keywords` | "싱가포르 한인 학생", "빌더 커뮤니티" | "학생 빌더 연합", "Korea-rooted alliance", "student builders"로 바꾸고 나머지는 둔다 |
| 7 | `app/opengraph-image.tsx` `alt` | ... 나루 NARU, Korean student builders. | ... 나루 NARU, a Korea-rooted alliance of student builders. 카드 오른쪽 아래 줄(Korean student builders, wherever they study)은 12월 포지션이라 **그대로** 둡니다 |
| 8 | 위 1, 2번 자리의 `TODO: confirm` 주석 | "정체성 문구는 사용자가 정한다", "로고 링의 SINGAPORE에 묶여 있다" | `DECIDED 2026-09-28` 주석으로 바꾸고 0절의 표를 한 줄로 요약해 적는다. 국문 부제만 TODO로 남긴다 |

- 공유 카드 설명(`OG_DESCRIPTION`)과 `OG_TITLE`은 12월 이벤트 문구라 바꾸지 않습니다. 60자 규칙도 그대로입니다.
- 그 밖에 `data/naru.ts`, `app/`, `components/home/`에서 나루 자신을 "커뮤니티", "community"로 부르는 곳이 더 있으면 **고치지 말고 목록으로 보고**합니다(파일:행, 지금 문장, 제안).

## 5. 검증

1. `npm run lint`, `npm run build` 통과.
2. 잔존 문구 grep이 0건이어야 합니다(아카이브 파일 제외):
   `grep -rn "싱가포르 한인 학생 빌더 커뮤니티\|community that started in Singapore\|Korean student builders in Singapore\|student-run alliance of Korean student associations" app components/home data/naru.ts lib`
   `grep -n "KOREAN STUDENT BUILDERS\|>SINGAPORE<" public/naru/*.svg`
3. `.shots/`에 스크린샷(ko, en 각각, 데스크톱 1440 / 모바일 390): 이벤트 히어로, `#naru` 챕터(마스터 로고와 정의 문장), 푸터, `/opengraph-image`. 링 글자가 잘리거나 겹치지 않는지, 영문 화면에 한글이 없는지 봅니다.
4. 정의 문장이 들어간 `#naru` 챕터가 모바일에서 넘치지 않는지 확인합니다.

## 6. 커밋과 체인지로그

- 커밋은 둘 이상으로 나눕니다: `feat(brand): 로고 v2 자산` / `feat(copy): 나루 공식 표기` / `docs(changelog): 2026-09-28 naru identity`.
- `CHANGELOG.md` 맨 위에 한 항목(25줄 이내). 범위, 한 것(0절 요약), 검증(grep 0건, 빌드), 브리프: `docs/naru-identity-brief.md`, 커밋 해시.
- 끝나면 바꾼 것, 4절 마지막 항목의 보고 목록, 스크린샷 경로를 요약해 보고하고 멈춥니다.
