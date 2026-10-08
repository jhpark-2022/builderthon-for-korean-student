-- ─────────────────────────────────────────────────────────────────────────────
-- 0006: 크로싱 서울 현장 팀 매칭용 AI 유형 결과 (2026-10-08). 신청 표와 별개.
--
-- 12월에는 AI 유형 테스트가 신청의 일부가 아니라 Day 1 현장의 팀 매칭 도구입니다. 참가자가 /match에서
-- 이름과 나라를 넣고 테스트를 하면 결과가 이 표에 한 기기 한 행으로 들어갑니다(다시 하면 덮어씀).
-- 새 표인 이유: 현장 테스트는 신청과 사람 단위가 다르고(팀원은 대표가 대신 신청, 이메일 없이 이름과 나라만),
-- 신청 행(crossing_members)에 쓰면 기존 행을 고치게 되며, 덮어쓰기와 보관 기간, 접근 권한이 신청과 다릅니다.
--
-- 기존 표와 뷰(8월 표, crossing_registrations, crossing_members, crossing_participants)에 닿는 문장 0개. 멱등.
-- 쓰기는 /api/crossing/match가 service_role로만 합니다. 거부 전부: RLS ON, 정책 0.
-- 적용: 대시보드 SQL 에디터, 또는 `supabase db push`.
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.crossing_match_profiles (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  event_slug    text not null,
  name          text not null check (char_length(name) between 1 and 40),
  study_country text not null check (study_country ~ '^[A-Z]{2}$'),
  mbti          text not null check (mbti in ('INTJ','INTP','ENTJ','ENTP','INFJ','INFP','ENFJ','ENFP',
                                              'ISTJ','ISFJ','ESTJ','ESFJ','ISTP','ISFP','ESTP','ESFP')),
  identity      text not null check (identity in ('A','T')),
  model         text not null,          -- 저장 시점의 모델 이름(나중에 매핑이 바뀌어도 기록은 남음)
  role_key      text not null check (role_key in ('plan','dev','design','growth')),
  axes          jsonb not null default '{}'::jsonb,  -- 축별 점수
  -- 선호 트랙 순위. 트랙 id의 배열이고 앞이 1순위(data/matchTracks.ts). 트랙이 정해지기 전에는 [].
  track_ranking jsonb not null default '[]'::jsonb check (jsonb_typeof(track_ranking) = 'array'),
  quiz_edition  text not null default '2026-12',
  device_token  text not null,          -- 브라우저가 만든 무작위 UUID. 사람을 가리키지 않음
  ip_hash       text,                   -- 스로틀용 솔트 해시. 원 IP는 저장하지 않음
  unique (event_slug, device_token)
);
create index if not exists crossing_match_profiles_event_idx
  on public.crossing_match_profiles (event_slug, updated_at desc);
-- 스로틀이 IP 해시와 시각으로 셉니다(라우트).
create index if not exists crossing_match_profiles_ip_hash_idx
  on public.crossing_match_profiles (ip_hash, updated_at desc);

alter table public.crossing_match_profiles enable row level security;  -- 정책 0개: service_role만

-- 운영진용 매칭판. 기기 토큰과 IP 해시는 내보내지 않습니다.
create or replace view public.crossing_match_board as
  select name, study_country, mbti, identity, model, role_key, updated_at, track_ranking
  from public.crossing_match_profiles
  where event_slug = 'crossing-seoul-2026-12'
  order by role_key, study_country, name;
alter view public.crossing_match_board set (security_invoker = on);
revoke select on public.crossing_match_board from anon, authenticated;

comment on table public.crossing_match_profiles is
  '크로싱 서울 현장 팀 매칭용 AI 유형 결과. 한 기기 한 행(다시 하면 덮어씀). 신청 표와 별개.';
comment on column public.crossing_match_profiles.ip_hash is
  'Salted SHA-256 of the submitter IP. Rate-limiting only. Never the raw IP.';
