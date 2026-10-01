# 나루 NARU 웹사이트

**나루**는 한국에 뿌리를 두고 학생이 직접 운영하는, 영리를 목적으로 하지 않는 학생 빌더 그룹입니다(A Korea-rooted collective of student builders). 이 레포는 나루의 공식 사이트이고, 지금 홈은 2026년 12월 서울에서 여는 **크로싱 서울 CROSSING SEOUL**을 알립니다.

> 건너는 건 각자가 한다. 자리는 우리가 만든다.

- 사이트: https://naru-crossing-seoul.vercel.app
- 한국어와 영어 두 벌(KR/EN 전환)

*NARU is a Korea-rooted, student-run, not-for-profit group of student builders. This repo is its website. The home page introduces CROSSING SEOUL (18 to 22 December 2026, Seoul), and `/2026-08` keeps the record of the group's first event, the Zero100 builderthon in Singapore.*

## 무엇이 있나

| 주소 | 내용 |
| --- | --- |
| `/` | 나루 홈. 크로싱 서울 소개, 프로그램, 얻는 것, 나루(8월의 기록, 세 층 구조), 왜 나루인가 |
| `/2026-08` | 제로백 빌더톤(2026년 8월, 싱가포르)의 기록. 나루의 첫 이벤트이고 끝난 회차입니다 |
| `/quiz` | 8월 팀 매칭에 쓴 유형 테스트 |
| `/api/crossing/register` | 크로싱 서울 등록 |
| `/api/register`, `/api/vote` | 8월 회차의 등록과 Day 8 투표 |

### 크로싱 서울

- 2026년 12월 18일(금)부터 22일(화)까지, 서울. 닷새.
- Day 0 Context Open, Day 1 Discovery, Day 2 Build, Day 3 Refine, Day 4 Pitch.
- 스크리닝이 없고 순위를 매기지 않습니다. 팀은 2~3명입니다.
- 등록 창은 아직 열지 않았습니다(`lib/registrationWindow.ts`의 `CROSSING_WINDOW`가 둘 다 `null`). 값을 채우면 홈의 등록 버튼이 켜집니다.

크로싱 서울은 제로백 빌더톤의 2회차가 아닙니다. 8월에서 물려받은 코어 둘(안전하게 도전할 수 있는 자리, 자기 가치를 증명해 보는 경험)을 잇는 다른 이벤트입니다. 용어 규칙은 `data/naru.ts` 맨 위 주석에 있습니다.

## 기술

- **Next.js 14**(App Router), **TypeScript**, **Tailwind CSS**
- **Framer Motion**: 스크롤 리빌, 모달
- **three.js**: 홈 배경(밤의 강과 등불, 서울과 싱가포르 윤곽). `lib/background/`
- **Supabase**: 등록과 투표 저장. 서버 라우트에서만 service role 키로 씁니다
- **Cloudflare Turnstile**: 12월 등록 폼의 봇 확인
- **Vercel**: 배포, Analytics, Speed Insights

## 로컬에서 돌리기

Node 18.17 이상이 필요합니다.

```bash
npm install
cp .env.local.example .env.local   # 값은 아래 표 참고
npm run dev                        # http://localhost:3999
```

```bash
npm run build   # 먼저 scripts/check-changelog.mjs가 돕니다
npm run start   # http://localhost:3999
```

dev 서버가 도는 동안 같은 폴더에서 `npm run build`를 돌리지 마세요. `.next`를 같이 써서 dev가 깨집니다.

### 환경 변수

| 이름 | 쓰는 곳 |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 주소 |
| `SUPABASE_SERVICE_ROLE_KEY` | 서버 전용. `lib/supabaseAdmin.ts`만 읽습니다. `NEXT_PUBLIC_`를 붙이지 마세요 |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Turnstile 사이트 키(공개 값) |
| `TURNSTILE_SECRET_KEY` | 서버 전용. 없으면 개발에서는 확인을 건너뛰고 운영에서는 503을 돌려줍니다 |

키가 없어도 화면은 뜹니다. 등록과 투표 API만 동작하지 않습니다. 표 구조는 `supabase/migrations/`에 있습니다.

## 어디를 고치나

카피와 화면을 나눠 둡니다. 화면에 보이는 문장은 전부 `{ ko, en }` 쌍이고, 컴포넌트는 `useLocale()`의 `t()`로 읽습니다.

| 바꾸려는 것 | 파일 |
| --- | --- |
| 홈(`/`)의 모든 문장 | `data/naru.ts` |
| 크로싱 서울의 이름과 날짜 | `lib/naruDates.ts` (단일 출처. 다른 곳에 날짜를 적지 않습니다) |
| 등록 창이 열리고 닫히는 시각 | `lib/registrationWindow.ts` |
| 12월 등록 폼의 문항 | `data/crossingForm.ts` |
| 홈의 배치와 챕터 | `components/home/NaruHome.tsx` |
| 헤더와 목차 | `components/journey/JourneyNav.tsx`, `data/naru.ts`의 `naruNav` |
| 배경 | `lib/background/` (`config.ts`가 수치) |
| 8월 기록(`/2026-08`)의 문장과 일정 | `data/dictionary.ts`, `data/schedule.ts` |
| 나루 로고 | `public/naru/` (같은 폴더 README에 출처와 규칙) |
| 색과 서체 | `tailwind.config.ts`, `app/globals.css` |
| 사이트 주소와 메타데이터 | `app/layout.tsx`, `app/sitemap.ts`, `app/robots.ts` |

`data/naru.ts`와 `data/dictionary.ts`는 섞지 않습니다. 앞은 나루 그룹의 정본이고 뒤는 8월 회차의 정본입니다.

## 일하는 규칙

전문은 `CLAUDE.md`에 있습니다.

- 체인지로그는 레포 루트의 `CHANGELOG.md` 하나입니다. 새 항목은 맨 위에 씁니다. 다른 체인지로그 파일이 있으면 빌드가 실패합니다.
- 결정은 코드 주석에 `DECIDED YYYY-MM-DD`로 남깁니다. 아직 확정되지 않은 것은 지어내지 않고 `TODO: confirm`으로 표시합니다.
- em dash 문자를 쓰지 않습니다.
- 큰 변경은 `docs/`에 브리프를 두고, 브리프의 검증을 마친 뒤에 푸시합니다.
- 사람 이름, 연락처, 참가자 개인 정보를 체인지로그와 문서에 쓰지 않습니다.

## 배포

`main`에 푸시하면 Vercel이 프로덕션으로 배포합니다. 그래서 검증을 마친 뒤에 푸시합니다.

## 구조

```
app/
  page.tsx               나루 홈
  2026-08/               제로백 빌더톤 기록
  quiz/                  유형 테스트
  api/                   등록, 투표 라우트
  layout.tsx             메타데이터, 서체, 로케일
components/
  home/                  홈(NaruHome, RecordTabs)
  crossing/              12월 등록 모달과 Turnstile
  journey/               헤더, 챕터, 8월 페이지
  shared/, ui/           같이 쓰는 조각
data/                    카피 정본(naru, dictionary, schedule, crossingForm, quiz)
lib/
  background/            three.js 배경
  naruDates.ts           12월 이름과 날짜
  registrationWindow.ts  등록 창
  supabaseAdmin.ts       서버 전용 Supabase 클라이언트
docs/                    브리프와 감사 기록
scripts/                 빌드 전 검사, 배경 형상 굽기, 로고 처리
supabase/migrations/     표 정의
public/                  로고, 사진, 서체
```
