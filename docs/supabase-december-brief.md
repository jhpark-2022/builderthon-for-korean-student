# Supabase: 크로싱 서울 등록 표를 새로 만들고 12월에 연결하는 브리프

Claude Code용. 8월 제로백 빌더톤이 쓰던 Supabase 프로젝트(`mojwmfjtuykmrjkntpve`)를 12월 크로싱 서울에도 쓴다. **8월 표(`registrations`, `registration_members`, `registration_participants` 뷰, `day8_votes`)와 8월 라우트(`/api/register`)는 한 글자도 손대지 않는다.** 12월은 **새 표**를 만들어 연결한다(사용자 결정 2026-09-18: 12월 폼의 질문이 8월과 다를 것이고 아직 정해지지 않았다). 등록 창은 아직 열지 않는다. 이번 작업은 "열 수 있는 상태"까지다.

---

## 0. 검토 결과 (왜 새 표인가)

| 자리 | 지금 | 판단 |
| --- | --- | --- |
| `registrations` / `registration_members` | 8월 폼의 질문에 맞춘 고정 열(join_type, track, quiz_type, university 등). 이벤트 구분 열 없음 | 12월 질문이 다르고 미정. 8월 열에 억지로 맞추면 열이 계속 늘고 8월 행에 마이그레이션이 닿는다. **분리** |
| RLS | ON, 정책 0. 쓰기는 service_role로만 | 새 표도 같은 규칙 |
| `/api/register` | 허니팟, IP 해시 스로틀, 검증, 삽입. 8월 마감 상수를 읽어 지금은 항상 403 | 8월 것은 그대로 두고, 공통 로직(해시·스로틀·IP·문자열 정리)만 `lib/register/shared.ts`로 꺼내 두 라우트가 함께 쓴다. 8월 라우트의 동작은 바뀌면 안 된다 |
| `RegisterModal.tsx`(1,551줄) | 8월 카피·필드가 코드에 박혀 있음 | 12월은 **필드 스키마로 그리는 새 폼**. 질문이 바뀔 때 스키마 한 줄이면 되게 |
| `scripts/build-applicant-roster.py` | 8월 두 표를 읽어 명단 docx | 12월용은 새 표를 읽는 별도 스크립트 |

## 1. 데이터베이스: `supabase/migrations/0004_crossing_seoul.sql`

전부 멱등. 8월 표에 닿는 문장 0개.

```sql
create extension if not exists "pgcrypto";

-- 크로싱 서울(2026-12, 서울) 등록. 한 폼 = 한 행.
create table if not exists public.crossing_registrations (
  id             uuid primary key default gen_random_uuid(),
  created_at     timestamptz not null default now(),
  -- 어느 회차인지. 크로싱은 시리즈라 다음 크로싱도 이 표를 쓴다.
  event_slug     text not null,
  -- 8월과 같은 뼈대. 팀/솔로, 팀 이름, 매칭 희망.
  join_type      text check (join_type in ('team', 'solo')),
  team_name      text,
  wants_matching boolean not null default false,
  -- 아직 정해지지 않은 질문들. 폼 스키마(data/crossingForm.ts)의 key → 답.
  -- 질문이 늘거나 바뀌어도 마이그레이션 없이 여기에 들어간다.
  answers        jsonb not null default '{}'::jsonb,
  -- 개인정보 수집 동의 시각. 동의 없이는 라우트가 삽입하지 않는다.
  consent_at     timestamptz not null,
  -- 유입 경로(?ref=). 클라이언트 제출 시각. IP 해시(스로틀 전용).
  ref            text,
  submitted_at   timestamptz,
  ip_hash        text
);

-- 한 사람 = 한 행. ordinal 1이 등록자.
create table if not exists public.crossing_members (
  id              uuid primary key default gen_random_uuid(),
  registration_id uuid not null references public.crossing_registrations(id) on delete cascade,
  ordinal         smallint not null check (ordinal between 1 and 3),
  name            text not null,
  email           text not null,
  -- 메신저 ID(카카오). 채널이 바뀌어도 열 이름은 그대로.
  contact         text not null,
  -- 공부하는 학교(자유 입력)와 나라(ISO 3166-1 alpha-2: KR, SG, ...).
  university      text,
  study_country   text check (study_country is null or study_country ~ '^[A-Z]{2}$'),
  linkedin        text,
  -- 사람 단위의 추가 질문(전공, 학년 등). 위와 같은 이유로 jsonb.
  answers         jsonb not null default '{}'::jsonb,
  unique (registration_id, ordinal)
);

create index if not exists crossing_registrations_event_created_idx
  on public.crossing_registrations (event_slug, created_at desc);
create index if not exists crossing_registrations_ip_hash_created_idx
  on public.crossing_registrations (ip_hash, created_at desc);
create index if not exists crossing_members_email_idx
  on public.crossing_members (lower(email));

-- 같은 회차에 같은 이메일 두 번 금지(8월엔 없던 규칙). 회차 슬러그를 members에도
-- 중복 저장한다(라우트가 채움). 부모 표를 거치는 유니크 제약은 Postgres가 허용하지
-- 않으므로 이 중복이 정본이다. 라우트가 23505를 409로 옮긴다.
alter table public.crossing_members add column if not exists event_slug text not null;
create unique index if not exists crossing_members_event_email_once
  on public.crossing_members (event_slug, lower(email));

-- 거부 전부: RLS ON, 정책 0. 쓰기는 /api/crossing/register가 service_role로만.
alter table public.crossing_registrations enable row level security;
alter table public.crossing_members       enable row level security;

-- 조직자용 뷰. 0002와 같은 보안 설정.
create or replace view public.crossing_participants as
  select
    m.id as member_id, r.id as registration_id, r.event_slug, r.created_at,
    r.join_type, r.team_name, r.wants_matching, r.consent_at,
    m.ordinal, m.name, m.email, m.contact, m.university, m.study_country, m.linkedin,
    r.answers as registration_answers, m.answers as member_answers
  from public.crossing_members m
  join public.crossing_registrations r on r.id = m.registration_id
  order by r.created_at desc, m.ordinal;

alter view public.crossing_participants set (security_invoker = on);
revoke select on public.crossing_participants from anon, authenticated;

comment on table public.crossing_registrations is
  '크로싱 서울(2026-12) 등록. 8월 registrations 표와 별개. answers jsonb에 미정 질문의 답.';
comment on column public.crossing_registrations.ip_hash is
  'Salted SHA-256 of the submitter IP. Rate-limiting only. Never the raw IP.';
```

적용: 대시보드 SQL 에디터 또는 `supabase db push`. 적용 뒤 `select count(*) from registrations`가 이전과 같은지 한 번 확인(닿지 않았음의 증거로 체인지로그에).

## 2. 코드

### 2.1 폼 스키마 `data/crossingForm.ts` (질문이 미정이라 이게 핵심)

```ts
export type FieldType = "text" | "email" | "select" | "textarea" | "checkbox";
export interface Field {
  key: string;                 // answers jsonb의 키
  scope: "registration" | "member";
  type: FieldType;
  required: boolean;
  label: { ko: string; en: string };
  help?: { ko: string; en: string };
  options?: { value: string; label: { ko: string; en: string } }[];
  maxLen?: number;             // 기본 200, textarea 1000
  fixed?: boolean;             // 표의 고정 열로 가는 것(name, email, contact, university, study_country, linkedin)
}
export const CROSSING_FORM: Field[] = [ /* 고정 열 여섯 + 팀/솔로 + 동의. 추가 질문은 TODO: confirm */ ];
```

- 고정 열(`fixed: true`)은 표의 열로, 나머지는 `answers`로 들어간다. 서버와 클라이언트가 **같은 스키마**로 검증한다(필수, 길이, select 값이 options 안인지).
- 지금 넣는 것: 이름, 이메일, 카카오 ID, 학교(자유 입력), 공부하는 나라(select: 한국 / 싱가포르 / 그 밖(2글자 코드 입력)), 링크드인(선택), 팀/솔로, 팀 이름, 팀 매칭 희망, 개인정보 동의(필수). **추가 질문은 넣지 않는다.** 사용자가 정하면 스키마에 줄을 더한다. 동의 문구는 `TODO: confirm`(자리만).
- 8월의 `dict.register`는 건드리지 않는다. 12월 카피는 `data/naru.ts`의 `register` 블록에 `{ ko, en }`으로.

### 2.2 라우트 `app/api/crossing/register/route.ts`

- 8월 `/api/register`의 허니팟, `hashIp`, `clientIp`, 스로틀 상수, `str`/`optStr`을 `lib/register/shared.ts`로 꺼낸다. **8월 라우트는 import만 바꾸고 동작·응답은 그대로**(스크린샷 대신 curl 응답 diff로 확인).
- 흐름: 창 확인(`registrationState(CURRENT_EVENT)`가 `open`이 아니면 403 `registration_not_open` / `registration_closed`) → 허니팟 → IP 스로틀(`crossing_registrations` 기준) → 스키마 검증 → 동의 없으면 400 `consent_required` → `crossing_registrations` 삽입 → `crossing_members` 삽입(`event_slug` 함께) → 23505면 409 `already_registered`(먼저 넣은 registration 행은 지운다: 같은 트랜잭션이 아니므로 실패 시 정리 코드 필수).
- 본문의 `eventSlug`는 `CURRENT_EVENT`와 같을 때만 받는다. 다르면 400.
- `answers`에는 스키마에 있는 키만 넣는다. 모르는 키는 버린다(로그만).

### 2.3 등록 창 `lib/registrationWindow.ts`

- 8월 상수와 `isRegistrationClosed()`는 그대로 둔다(`/2026-08`이 읽는다).
- 추가: `CURRENT_EVENT = "crossing-seoul-2026-12"`, `CROSSING_WINDOW = { opensAt: null, closesAt: null }`(`TODO: confirm`, KST `+09:00`을 문자열에 박을 것), `registrationState()`. 둘 다 null이면 `not_open`.

### 2.4 폼 컴포넌트 `components/crossing/RegisterModal.tsx`

- 8월 `RegisterModal.tsx`를 복제하지 않는다. **스키마를 돌며 필드를 그리는 새 컴포넌트.** 8월 모달에서 가져올 것은 껍데기뿐: 모달 열기/닫기, ESC·배경 클릭, 스크롤 잠금(`useBodyScrollLock`), 팀원 추가(최대 3인), 제출 중·완료·오류 상태, localStorage 초안(키 `naru.register.crossing-seoul-2026-12.draft`).
- 시각은 8월 문법(Glass 패널, 칩, 그라데이션 필 1차 버튼) 그대로.
- 완료 화면: "등록됐습니다. 며칠 내 안내 메일을 보냅니다." + 문의 메일. 오픈채팅은 지금 닫혀 있으니 언급하지 않는다(`links.openChat`이 비면 자동으로 숨는 기존 규칙 그대로).

### 2.5 홈에 연결

- `components/crossing/RegisterProvider.tsx`(8월 `RegisterContext`와 별개, 인터페이스는 같게). 홈의 `#top` 1차 CTA와 `#december` CTA, `#join` 참가자 카드가 `registrationState(CURRENT_EVENT)`에 따라 셋 중 하나를 그린다: `not_open` → 지금 카피 그대로 / `open` → "등록하기"(모달) / `closed` → "등록이 마감됐습니다".
- 지금은 `not_open`이므로 **화면 변화 0**이 이번 작업의 완료 조건이다.
- `?register=1`은 `open`일 때만 모달을 연다.
- `/2026-08`은 아무것도 바뀌지 않는다.

### 2.6 명단 스크립트 `scripts/build-crossing-roster.py`

8월 스크립트를 복제하지 않고 공통 부분(REST fetch, docx 만들기)을 `scripts/roster_lib.py`로 꺼낸 뒤, 12월용은 `crossing_participants` 뷰를 읽어 `12월 빌더톤/Execution/Tracking/크로싱서울_신청자_명단.docx`로 쓴다(폴더 없으면 만든다. 경로는 `TODO: confirm`). `answers` jsonb는 스키마의 label 순서로 열을 펼친다. 8월 스크립트는 리팩토링 뒤에도 같은 docx를 만들어야 한다(회귀 확인).

## 3. 하지 않는 것

- 8월 표·뷰·라우트·모달·마감 시각 변경. 8월 행에 닿는 SQL 전부.
- 12월 추가 질문 지어 넣기. 동의 문구 지어 넣기(자리만).
- 등록 창 열기(`opensAt` 채우기).
- anon 키로 읽는 경로, RLS 정책 추가.
- 백업 CSV, 명단 docx를 레포에 커밋. `.gitignore`에 `*.csv`, `scripts/data/backup*`가 없으면 추가.

## 4. 검증

1. `npx tsc --noEmit`, `npm run build`.
2. 마이그레이션 뒤 `select count(*) from registrations` / `registration_members`가 이전과 같음(체인지로그에 숫자). `crossing_registrations` 0건.
3. 8월 라우트 회귀: 리팩토링 전후 `curl -X POST /api/register`(빈 본문, 허니팟 본문, 유효 본문) 응답 status·json이 같음. 지금은 전부 403 `registration_closed`여야 한다.
4. 12월 라우트 시나리오(로컬, `opensAt`을 과거로 임시 설정하고 커밋 안 함): (a) 지금 상태 403 `registration_not_open` / (b) 유효 본문 201, 두 표에 행, `event_slug` 둘 다 `crossing-seoul-2026-12` / (c) 같은 이메일 재제출 409, 그리고 `crossing_registrations`에 고아 행이 남지 않음 / (d) 동의 없음 400 / (e) 모르는 `answers` 키는 버려짐 / (f) `eventSlug` 다름 400 / (g) 허니팟 201이지만 행 없음. 테스트 행은 `delete from crossing_registrations where ...`로만 지운다. 8월 표에 닿는 DELETE 금지.
5. 홈·아카이브 스크린샷 전후 픽셀 diff 0.
6. 8월 명단 스크립트 회귀: 리팩토링 전후 docx 같은 인원·순서.
7. 체인지로그 `docs/changelogs/changelog-september-XX-2026-crossing-registration.md`: 왜 새 표인가, 표 구조, 스키마 방식, 전후 count, TODO: confirm(등록 창 시각, 추가 질문, 동의 문구, 명단 경로). 커밋 셋: `feat(db): 크로싱 서울 등록 표를 만든다` → `refactor(register): 8월 라우트의 공통 로직을 꺼낸다` → `feat(register): 크로싱 서울 폼과 라우트를 스키마로 만들고 홈에 연결한다(창은 닫힘)`.
