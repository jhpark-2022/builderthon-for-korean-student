# Changelog 2026-09-15 (나루 런칭 홈 · 8월 회차를 /2026-08 기록으로)

**Project:** 나루 NARU 사이트 (Next.js)
**Branch:** `naru-launch`
**Scope:** 새 홈(`/`)과 그 카피·날짜 파일, 8월 페이지 이동(`/2026-08`), 팔레트 전환,
로고 자산, 메타데이터. `Journey.tsx`는 컴포넌트 두 개를 꺼내고 색 토큰만 바뀌었을
뿐 로직은 손대지 않았습니다. Supabase, `/api/register`, `/api/vote`, 등록 창
로직은 건드리지 않았습니다.

---

## 1. 문제

홈이 이벤트 한 회차였습니다.

8월까지 `/`에는 제로백 AI 빌더톤 2026년 8월 회차가 있었습니다. 그 회차는 8월
29일에 끝났고, 페이지는 "8일이 끝났습니다"로 시작하는 마무리 화면이 됐습니다.
그 상태로는 세 가지가 안 됩니다.

- **12월 회차를 말할 자리가 없습니다.** 8월 회차 페이지 안에서 다음 회차를
  말하면 8월의 후속편처럼 읽힙니다. 12월은 무대를 한국으로 옮긴 2회차입니다.
- **나루를 말할 자리가 없습니다.** 이벤트는 나루가 학생회와 기업을 잇는 지금의
  방식이고, 방식은 바뀝니다. 홈이 회차 하나이면 회차가 끝나는 날 홈도 끝납니다.
- **8월을 지우면 근거가 없어집니다.** 한 회차가 남겨야 하는 것은 결과물이 아니라
  사람의 이야기이고, 두 번째 회차부터 선례가 됩니다.

## 2. 결정

### 2.1 홈은 이벤트가 아니라 그룹이다

`/`는 나루가 무엇이고 왜 존재하는지, 8월에 무엇이 있었는지, 12월 회차가 온다는
것, 그리고 함께하는 길을 말합니다. 챕터 여섯 개와 푸터입니다.

| 앵커 | 챕터 | 무엇을 말하는가 |
| --- | --- | --- |
| `#top` | 히어로 | 확정된 사실 셋: 로고, 태그라인, 8월 59명과 12월 9일 서울 |
| `#why` | 왜 존재하는가 | 코어 2축. 어젠다는 방법이고 코어만 바뀌지 않는다 |
| `#record` | 8월의 기록 | 숫자 다섯, 사진 셋, 아쉬웠던 네 가지 |
| `#how` | 어떻게 일하는가 | 3층 다이어그램, 층별 하는 것과 얻는 것, 이름의 두 겹, 하지 않는 것 |
| `#december` | 다음 회차 | 날짜, 달라지는 것, 회차가 끝난 뒤에 할 일 |
| `#join` | 함께하는 길 | 참가자, 학생회, 기업, 운영진 |
| `#people` | 여기서 나온 사람 | **비어 있으면 렌더되지 않습니다** |

히어로는 구체적 사실로 시작하고 코어는 두 번째 챕터에서 말합니다. 12월은 코어를
명시적으로 말했을 때도 사람이 오는지 보는 2차 시행이지만, 첫 화면까지 이상론이면
모객이 좁아집니다.

### 2.2 홈에 등록이 없다

12월 등록은 아직 열리지 않았고, 나루는 가입 폼 자체를 두지 않습니다. 들어오는
길은 회차 하나입니다. 그래서 홈의 CTA는 셋뿐입니다: 회차 알아보기(앵커), 소식
받기(오픈채팅), 문의(메일). `RegisterProvider`도 `ResetHandler`도 붙이지
않았습니다. 쓰지 않을 모달과 그 API 상태를 마운트하지 않습니다.

그 결과 `JourneyNav`가 프로바이더 없이도 그려져야 했습니다.
`lib/RegisterContext.tsx`에 `useRegisterOptional()`을 더했습니다.
`useRegister()`는 그대로 throw 합니다. 등록 CTA가 프로바이더 밖에서 조용히 죽는
쪽이 더 나쁩니다.

### 2.3 12월 상세는 이번 범위가 아니다

장소, 일정표, 출제사, 멘토, 등록 마감은 11월까지 확정됩니다. 지금 쓰면 전부
고쳐야 하고, 참가자는 고치기 전의 문장을 보고 항공권을 끊습니다. 홈은 확정된
사실만 싣고, 상세는 2단계에서 `/seoul`로 붙입니다.

12월 날짜 문자열은 `lib/naruDates.ts` 한 곳에서만 나옵니다. `DECEMBER_ENDS_AT`이
`null`인 동안 화면은 "12월 9일부터"까지만 그립니다.

### 2.4 8월은 지우지 않고 `/2026-08`로 내린다

`app/page.tsx`의 내용이 통째로 `app/2026-08/page.tsx`로 갔습니다. 달라진 것은
셋뿐입니다.

- `serverNow`가 `Date.now()`에서 `2026-09-01T00:00:00+08:00` 고정값으로.
  행사는 끝났고 이 페이지는 기록이라, 언제 읽어도 마무리 국면입니다.
- `export const revalidate`를 지웠습니다. 다시 그릴 이유가 있는 값이 없습니다.
- 맨 위에 배너 한 줄(`components/archive/ArchiveBanner.tsx`).

**크레딧은 고치지 않았습니다.** 이 회차의 주최는 AXMOS였고 파트너 표기도 그때의
것입니다. 나루라는 이름은 이 회차가 끝난 뒤에 정해졌어요. 지난 회차의 표기를
나중에 생긴 이름으로 덮어쓰면 그건 기록이 아니라 개작입니다. 그 사정을 배너가
한 줄로 말합니다.

`data/dictionary.ts`에서 고친 것은 **`wrap.next` 한 문단과 `wrap.cardLines[1]`
한 줄뿐**입니다. 12월을 "서울 강남 쇼케이스"라고 말하던 자리를 "다음 회차는
2026년 12월 9일 서울"로 바꿨습니다. 가을 빌더 커리큘럼 언급은 뺐습니다(아래
TODO 참고).

### 2.5 팔레트를 나루로 옮긴다

정본은 로고 가이드 v1입니다. 남색 `#12246B`, 보라 `#4B3A8C`, 자주 `#9A5A82`,
주황 `#EE8A4F`.

바탕이 보라 검정 `#080810`에서 남색 검정 `#070B1F`로 갔습니다. 완전한 검정이
아닌 이유는 반전 로고가 남색 계열 바탕을 전제로 하기 때문입니다. 주황은 CTA
하나, 12월 챕터의 아이브로, 배경 필드의 가장 뜨거운 입자에만 씁니다. 로고
한가운데 찍힌 주황 점 하나가 나루 자리이고, 화면에서 주황은 그만큼만 있어야
합니다.

`/2026-08`도 같은 토큰을 읽으므로 함께 바뀝니다. 의도입니다. 다만 8월 페이지
안의 Tailwind 기본 violet 계열(`violet-400` 등)은 토큰이 아니라 그대로입니다.
5,157줄짜리 파일의 색을 일괄 치환하는 것은 이번 작업의 범위가 아니고, 그 페이지는
그때의 모습으로 남는 편이 맞습니다.

`accent` 토큰은 원색이 아니라 밝은 틴트(`#A99AD6`)입니다. `text-accent`가 어두운
면 위의 글자색으로 쓰이는데, `#4B3A8C`를 그대로 넣으면 `--surface-2` 위에서
2:1도 나오지 않아 읽히지 않습니다.

### 2.6 로고는 한글이 든 것만 PNG

**납품된 SVG 17종에 임베드된 서체는 영문 Montserrat 하나뿐입니다.** 한글 "나루"는
`<text font-family="Noto Sans CJK KR">`로 방문자 기기의 시스템 폰트를 부릅니다.
그 서체는 대부분의 macOS와 Windows에 없습니다. `<img src>`로 넣으면 로고의
글자꼴이 기기마다 달라집니다. 로고 가이드가 금지한 "형태를 건드리는 일"이 우리
손이 아니라 방문자 기기에서 저절로 일어나는 셈입니다.

그래서 이렇게 나눴습니다.

| 파일 | 형식 | 이유 |
| --- | --- | --- |
| `public/naru/naru-symbol.svg` | SVG (1.1KB) | `<text>`가 없습니다. 벡터로 안전 |
| `public/naru/naru-master-rev.png` | PNG 900px | 한글 "나루"가 들어 있음 |
| `public/naru/naru-lockup-rev.png` | PNG 627px | 한글 "나루"가 들어 있음 |
| `public/naru/naru-name-rev.png` | PNG 604px | 한글 "나루"가 들어 있음 |

벡터로 돌아가려면 원본 SVG의 한글 `<text>`를 패스로 변환(아웃라인화)해서 다시
받으면 됩니다. 사정은 `public/naru/README.md`에 적어 두었습니다.

`app/icon.tsx`를 지우고 `app/icon.svg`로 바꿨습니다. 심볼을 흰 둥근 사각형 위에
올린 것입니다. 심볼의 그라데이션이 남색에서 시작해서, 어두운 탭 바 위에서는 그
끝이 사라집니다.

`app/opengraph-image.tsx`(홈)의 글자는 전부 로마자입니다. `next/og`(satori)는
시스템 서체를 쓰고 그 런타임에 한글 글립이 있다는 보장이 없습니다. 브랜드의 한글
이름은 로고 PNG가 픽셀로 들고 옵니다.

### 2.7 사진 세 장은 찍힌 것만 말한다

원래 계획한 흐름은 "기업이 문제를 연다 → 멘토와 다듬는다 → 앞에서 증명한다"
였습니다. 사진 폴더 전체를 훑어보니 **1:1 멘토링 장면도, 출제사가 문제를 여는
순간도 확인할 수 있는 사진이 없었습니다.** `Day 7` 폴더는 전부 피드백 패널
테이블이고, `Day 1`의 연단 사진은 어느 세션인지 사진만으로는 알 수 없습니다.
브리프가 지목한 `Day 1/IMG_2092`와 `Day 8/시상식/IMG_2684`는 둘 다 전체 단체
사진이라, 그대로 쓰면 흐름이 아니라 반복으로 읽힙니다.

그래서 흐름을 사진에 맞췄습니다.

| 파일 | 원본 | 캡션 |
| --- | --- | --- |
| `public/record/day1-start.webp` | `Day 1/현장 사진/IMG_2092.JPG` | Day 1 · 쉰아홉 명으로 시작했습니다 |
| `public/record/day8-prove.webp` | `Day 8/Judgement Track Sharing/IMG_2520.HEIC` | Day 8 · 앞에서 증명했습니다 |
| `public/record/day8-career.webp` | `Day 8/커리어 간담회/IMG_2651.HEIC` | Day 8 · 그리고 현직자에게 직접 물었습니다 |

전부 4:3 원본, 1600×1200 webp, 300KB 이하. 자르지 않았습니다. 마지막 장이 12월
챕터의 "회차가 끝난 뒤에 할 일"로 이어지는 것이 덤입니다.

### 2.8 파트너 로고 스트립은 넣지 않았다

브리프에서 선택 항목이었고, 넣지 않는 쪽을 골랐습니다.

하나. 8월의 로고 월은 `Journey.tsx`의 `HeroPartnerStrip`과 `LogoTile`이 그리는데,
그 둘은 로고마다 실측한 시각적 질량으로 높이를 맞추고(`scripts/measure-logo-mass.py`)
티어 라벨과 소개 모달까지 달고 있습니다. 목록만 넘겨 재사용할 수 있는 모양이
아니고, 한 줄짜리로 다시 만들면 질량 보정이 빠져 로고 행이 들쭉날쭉해집니다.

둘. 라벨을 아무리 정확히 써도 홈에 있는 로고 월은 나루의 후원사로 읽힙니다.
나루는 아직 법인격이 없어 후원 계약의 주체가 될 수 없습니다. 로고를 보고 싶은
사람은 CTA로 8월 페이지에 가면 되고, 거기에는 제대로 된 벽이 있습니다.

### 2.9 회차가 끝난 뒤에 할 일

12월 챕터에 명시적으로 넣었습니다. 8월에 이걸 쓰지 않아서, 회차 뒤에 멘토에게
먼저 연락한 팀이 한 팀이었습니다. 병목은 의지가 아니라 판단 재료였습니다.
멘토에게 먼저 연락한다, 기업이 마지막 날 공고 형식으로 여는 기회를 본다, 다음
회차에 멘토로 돌아온다. 이 블록을 빼지 마세요.

---

## 3. 바뀐 파일

### 새로 만든 것

| 파일 | 무엇 |
| --- | --- |
| `app/page.tsx` | 나루 홈 (배선만) |
| `app/2026-08/page.tsx` | 8월 회차 기록 |
| `app/icon.svg` | 파비콘 (심볼) |
| `app/opengraph-image.tsx` | 홈 공유 카드 (새로 작성) |
| `components/home/NaruHome.tsx` | 홈 본체, 챕터 여섯 + 푸터 + 3층 다이어그램 |
| `components/archive/ArchiveBanner.tsx` | `/2026-08` 맨 위 한 줄 |
| `components/ui/Eyebrow.tsx` | `Journey.tsx`에서 꺼냄 + `orange` 추가 |
| `components/ui/OpenChatLink.tsx` | `Journey.tsx`에서 꺼냄 + `naru-*` src 셋 |
| `data/naru.ts` | 홈 카피 정본. 전부 `{ ko, en }` |
| `lib/naruDates.ts` | 12월 날짜 단일 출처 |
| `public/naru/` | 로고 넷 + README |
| `public/record/` | 8월 사진 셋 |

### 옮긴 것

- `app/opengraph-image.tsx` → `app/2026-08/opengraph-image.tsx` (내용 그대로)
- `app/layout.tsx`의 8월 `metadata` → `app/2026-08/page.tsx` (문구 그대로)

### 고친 것

| 파일 | 무엇 |
| --- | --- |
| `app/layout.tsx` | `metadata`를 나루로. `title.template` `%s \| 나루 NARU`. `themeColor`·body 배경 |
| `app/globals.css` | 토큰을 나루 팔레트로. 스크롤바, 그리드 배경 틴트 |
| `tailwind.config.ts` | `accent` 재정의, `naru.*` 팔레트 추가 |
| `lib/background/config.ts` | WebGL 필드 `PALETTE` |
| `components/Background.tsx` | 캔버스 아래 CSS 그라데이션 |
| `components/journey/JourneyNav.tsx` | `anchors`·`brand` prop, `useRegisterOptional` |
| `components/journey/Journey.tsx` | `Eyebrow`·`OpenChatLink` import로 교체, 색 상수 |
| `lib/RegisterContext.tsx` | `useRegisterOptional()` 추가 |
| `data/dictionary.ts` | `wrap.next`, `wrap.cardLines[1]` |
| `app/sitemap.ts` | `/2026-08`, `/quiz` 추가 |
| `app/quiz/*`, `components/Quiz.tsx`, `ResetHandler`, `OpenChatNudge` | 하드코딩된 배경색만 |

### 지운 것

- `app/icon.tsx` (→ `app/icon.svg`)

---

## 4. 확인 방법

```
npx tsc --noEmit          통과
npm run build             통과. 12페이지 전부 정적(○)
```

`npm run lint`는 **돌지 않습니다.** 이 레포에 ESLint 설정이 없어서 `next lint`가
대화형 설정 마법사를 띄웁니다. 이번 작업에서 새로 설정하지 않았습니다.

스크린샷 10장 (`.shots/naru/`, 프로덕션 빌드를 `next start -p 4010`으로):

```
home-375-ko.png      home-375-en.png      home-1440-ko.png   home-1440-en.png
archive-375-ko.png   archive-375-en.png   archive-1440-ko.png archive-1440-en.png
home-375-ko-diagram.png   home-375-en-diagram.png
```

- 375px에서 로고가 잘리지 않고, 태그라인이 정확히 두 줄입니다(ko·en 모두).
- `document.scrollWidth === clientWidth` (375에서 375/375, 1440에서 1434/1434).
- 3층 다이어그램이 모바일에서 세로로 서고 화살표가 ↓로 바뀝니다.
- `/2026-08`이 예전 홈과 같은 구성입니다. 배너 한 줄이 위에 붙었고 색만
  남색 계열로 옮겨졌습니다.
- 파트너 모달이 열립니다(`#builders` 첫 타일 클릭 → `[role="dialog"]`).
- 콘솔 오류 없음. 로컬에서 `_vercel/insights` 404 두 건은 Vercel 밖이라 정상입니다.

금지어 검사:

```
grep -n "—\|심사\|각서\|MOU\|협약\|정관\|사비\|회비\|가입\|멤버십\|Foundation\|데모데이\|순위" \
  data/naru.ts components/home/ components/archive/ArchiveBanner.tsx
```

em dash 0건(규칙을 설명하는 주석 한 줄 제외). 나머지 13건은 전부 **부정문이거나
규칙을 적어 둔 주석**입니다. 눈으로 확인했습니다.

- `회비를 받지 않습니다` · `가입 폼을 두지 않습니다`. Overview 06의 핵심 문장.
  금지된 것은 그것을 제안하는 일이지 부정하는 일이 아닙니다.
- `순위가 없습니다` · `사이에 순위는 없습니다` · `무순위`. 부정문과 허용어.
- 나머지는 `data/naru.ts` 상단의 규칙 목록과 `NaruHome.tsx`의 결정 주석.

---

## 5. TODO: confirm (확정 안 된 것 모음)

| 항목 | 지금 값 | 어디 |
| --- | --- | --- |
| 12월 종료일과 기간 | `null` (화면은 "12월 9일부터") | `lib/naruDates.ts` |
| 12월 원페이저와의 날짜 차이 | 원페이저 v1은 12/10~14, 확정은 12/9 시작 | `lib/naruDates.ts` |
| 12월 회차 공식 이름 | "나루 2회차" | `data/naru.ts` `december.roundName` |
| 참가 대상 문구 (알럼 규모 미검증) | "한국 대학생과, 싱가포르에서 8월을 건넌 사람들" | `data/naru.ts` `december.who` |
| 태그라인 영문 | "You do the crossing. We make the place." | `data/naru.ts` `hero.titleLine*` |
| 문의 이메일 | `pjh030924@gmail.com` (8월과 같은 주소) | `data/naru.ts` `naruLinks` |
| 커스텀 도메인 | `builderthon-for-korean-student.vercel.app` | `app/layout.tsx`, `app/sitemap.ts`, `app/robots.ts` |
| 8월 사진의 웹 공개 | 세 장 모두 얼굴이 알아볼 수 있게 찍혀 있음 | `data/naru.ts` `record.photos` |
| 가을 빌더 커리큘럼 유지 여부 | `wrap.next`에서 뺐음 | `data/dictionary.ts` |
| `#people` 스토리 | 빈 배열. 챕터가 렌더되지 않음 | `data/naru.ts` `people.stories` |

그리고 확정과 별개로 남겨 둔 것 하나. `dict.program.awards.next`는 아직 "12월 서울
강남 쇼케이스 무대 우선 초청"이라고 말합니다. 그 자리는 8월에 수상팀에게 약속된
것이라 기록 그대로 두었습니다. 12월 회차의 형식이 확정되면 함께 보세요.

---

## 6. 2단계 (이번에 하지 않은 것)

12월 상세가 확정되면 `/seoul` 라우트를 만듭니다. 8월 `Journey`의 데이 카드,
멘토링, FAQ, `RegisterModal` 패턴을 `data/seoul.ts`와 `lib/naruDates.ts` 기준으로
재사용하고, Supabase `registrations`에 회차 구분 컬럼을 추가합니다.
