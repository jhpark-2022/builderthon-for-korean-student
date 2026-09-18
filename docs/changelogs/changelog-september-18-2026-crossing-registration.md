# Changelog 2026-09-18 (Supabase: 크로싱 서울 등록 표를 새로 만들고 12월에 연결)

**Project:** 나루 NARU 사이트 (Next.js + Supabase `mojwmfjtuykmrjkntpve`)
**Branch:** `main`
**Scope:** 12월 등록의 표·라우트·폼·명단 스크립트. 등록 창은 열지 않았습니다. **8월 표·뷰·
라우트·모달·마감 시각은 한 글자도 바뀌지 않았습니다**(라우트는 공통 로직만 꺼냄, 응답 동일).
커밋 셋: `feat(db): 크로싱 서울 등록 표를 만든다` → `refactor(register): 8월 라우트의 공통
로직을 꺼낸다` → `feat(register): 크로싱 서울 폼과 라우트를 스키마로 만들고 홈에 연결한다(창은
닫힘)`.

## 1. 왜 새 표인가

8월 표(`registrations`, `registration_members`)는 8월 폼의 질문에 맞춘 고정 열이고 이벤트 구분
열이 없습니다. 12월 폼의 질문은 다르고 아직 정해지지 않았습니다(사용자 결정 2026-09-18). 8월
열에 억지로 맞추면 열이 계속 늘고 8월 행에 마이그레이션이 닿습니다. 그래서 분리했고, 미정
질문은 `answers jsonb`에 넣어 질문이 바뀌어도 마이그레이션 없이 갑니다.

## 2. 표 (`supabase/migrations/0004_crossing_seoul.sql`)

- `crossing_registrations`: id, created_at, **event_slug**, join_type(team/solo), team_name,
  wants_matching, **answers jsonb**, **consent_at**(필수), ref, submitted_at, ip_hash.
- `crossing_members`: registration_id(cascade), ordinal 1~3, name, email, contact, university,
  study_country(ISO alpha-2), linkedin, **answers jsonb**, **event_slug**(중복 저장. 같은 회차
  같은 이메일 금지 유니크 인덱스 `(event_slug, lower(email))`. 부모 표를 거치는 유니크는
  Postgres가 허용하지 않아서).
- `crossing_participants` 뷰: 0002와 같은 보안(security_invoker, anon·authenticated revoke).
- RLS ON, 정책 0. 쓰기는 service_role로만. 전부 멱등. 8월 표에 닿는 문장 0개.
- **아직 적용하지 않았습니다.** 이 세션에는 DB 자격증명(Supabase 로그인 토큰, DB 비밀번호)이
  없습니다. 적용: 대시보드 SQL 에디터에 파일 내용을 붙여 넣거나, `supabase login` 뒤
  `supabase db push`. 적용 전 count: `registrations` **44**, `registration_members` **74**
  (REST count=exact, 2026-09-18). 적용 뒤 같은지 확인해 아래 §5에 적을 것.

## 3. 코드

- `lib/register/shared.ts`: 허니팟 미리보기, IP 해시(salt = service key), 클라이언트 IP, 스로틀
  상수(10분 10 / 60분 30 / 전체 10분 120), 문자열 정리. 8월 라우트는 import만 바뀜.
- `lib/registrationWindow.ts`: 8월 상수 그대로 + `CURRENT_EVENT = "crossing-seoul-2026-12"`,
  `CROSSING_WINDOW = { opensAt: null, closesAt: null }`(TODO: confirm, KST `+09:00`을 문자열에),
  `registrationState()` → not_open / open / closed.
- `data/crossingForm.ts`: **스키마가 폼입니다.** 필드 = key, scope(registration/member), type,
  required, label{ko,en}, help, options, maxLen, fixed. `fixed`는 표의 고정 열로, 나머지는
  answers로. `validateField()`를 서버와 클라이언트가 같이 씁니다. 지금 들어 있는 것: 이름,
  이메일, 카카오 ID, 학교, 공부하는 나라(KR/SG/그 밖 두 글자 코드), 링크드인, 참가 형태, 팀
  이름, 팀 매칭, 동의(문구 TODO: confirm). **추가 질문은 넣지 않았습니다.**
- `app/api/crossing/register/route.ts`: 창 → 허니팟 → 스로틀(crossing 표 기준) → 스키마 검증 →
  동의 → 삽입 둘 → 23505면 부모 행 정리 후 409. `eventSlug`는 CURRENT_EVENT와 같을 때만.
  모르는 answers 키는 버리고 로그.
- `components/crossing/RegisterModal.tsx`: 스키마를 돌며 그리는 새 폼. 8월 모달에서 가져온 것은
  껍데기뿐(열기/닫기, ESC·배경, 스크롤 잠금, 팀원 최대 3, 상태, 초안 localStorage
  `naru.register.crossing-seoul-2026-12.draft`). 완료 화면: "등록됐습니다. 며칠 안에 안내 메일을
  보냅니다." + 문의 메일. 오픈채팅은 `links.openChat`이 비면 안 나옵니다.
- `components/crossing/RegisterProvider.tsx`: 홈에 마운트. CTA 셋(히어로, `#december`, `#join`
  참가자 카드)이 상태에 따라 셋 중 하나. `?register=1`은 open일 때만. 카피는 `data/naru.ts`의
  `register`.
- `scripts/roster_lib.py`(공통) + `scripts/build-crossing-roster.py`(`crossing_participants` →
  `12월 빌더톤/Execution/Tracking/크로싱서울_신청자_명단.docx`, 경로 TODO: confirm. answers는
  스키마 순서로 열을 펼침) + 8월 스크립트는 공통부를 import(`ROSTER_OUT`으로 출력 경로 지정 가능).
- `scripts/crossing-route-test.sh`: §5의 (b)~(g) 시나리오 curl.

## 4. 하지 않은 것

8월 표·뷰·라우트·모달·마감 변경. 12월 추가 질문·동의 문구 지어 넣기. 등록 창 열기. anon 읽기
경로, RLS 정책. 백업 CSV·명단 docx 커밋(`.gitignore`에 `*.csv`, `scripts/data/backup*`).

## 5. 검증

1. `npx tsc --noEmit`, `npm run build` 통과. 프로덕션 콘솔 오류 0.
2. 마이그레이션 전후 count: **적용 대기.** 전 44 / 74, `crossing_registrations` 없음(404).
3. 8월 라우트 회귀: 빈 본문·허니팟·유효 본문 curl → 리팩토링 전후 전부 `403 registration_closed`,
   응답 본문 동일.
4. 12월 라우트: (a) 지금 상태 `403 registration_not_open` 확인. (b)~(g)는 표가 생긴 뒤
   `CROSSING_WINDOW.opensAt`을 과거로 임시 설정하고(커밋 안 함) `scripts/crossing-route-test.sh`로.
   **적용 대기.**
5. 홈·아카이브 스크린샷 전후(같은 로컬 조건, 커밋 2 빌드 vs 커밋 3 빌드): `/2026-08` 1440·390
   전부 0px, 홈 390 0px, 홈 1440 318px(카운트다운 "분" 숫자 자리, 캡처 사이에 분이 바뀜).
6. 8월 명단 스크립트 회귀: 리팩토링 전후 docx 본문 370줄 동일(추출 시각 제외). 신청 43건 /
   명단 73명 / 중복 제외 1명 양쪽 같음.

## 6. TODO: confirm

- 등록 창 시각(`CROSSING_WINDOW`), 추가 질문(`data/crossingForm.ts`), 동의 문구, 명단 docx 경로.
- 마이그레이션 적용과 §5.2·§5.4.
