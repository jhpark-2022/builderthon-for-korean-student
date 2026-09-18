-- ─────────────────────────────────────────────────────────────────────────────
-- 크로싱 서울(2026-12, 서울) 등록 표. DECIDED 2026-09-18 (사용자).
--
-- 8월 표(registrations, registration_members, registration_participants 뷰,
-- day8_votes)에는 닿지 않습니다. 12월 폼의 질문이 8월과 다르고 아직 정해지지
-- 않아서(브리프 0), 8월 열에 맞추면 열이 계속 늘고 8월 행에 마이그레이션이 닿습니다.
-- 미정 질문은 answers jsonb에 들어가고, 폼 스키마(data/crossingForm.ts)가 키를 정합니다.
--
-- 전부 멱등. 8월 표에 닿는 문장 0개.
-- 적용: 대시보드 SQL 에디터, 또는 `supabase login` 뒤 `supabase db push`.
-- 적용 뒤 `select count(*) from registrations`가 이전과 같은지 확인(체인지로그에).
-- ─────────────────────────────────────────────────────────────────────────────

create extension if not exists "pgcrypto";

-- 크로싱 서울 등록. 한 폼 = 한 행.
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
