-- ─────────────────────────────────────────────────────────────────────────────
-- 0008: 크로싱 서울 팀과 멘토 시간표 (2026-10-17).
--
-- DECIDED 2026-10-17 (사용자: "all i need is, supabase can help me match the people who participate the event as a team,
-- can track which of the time slot for the mentoring which those team has put in, and make sure that slot is visible
-- for other team"): 이 마이그레이션이 하는 일은 셋뿐입니다.
--   1. 등록한 사람(crossing_members)을 팀으로 묶는다          crossing_teams, crossing_team_members
--   2. 팀이 넣은 멘토링 칸을 남긴다                           crossing_mentors, crossing_mentor_windows, crossing_mentor_bookings
--   3. 그 칸을 모든 팀이 본다                                 /api/crossing/mentoring이 팀 이름과 함께 내보냄
--   4. Day 2, 3 미션 인증(멘토와 찍은 사진, 진척 PDF)을 팀별로 남긴다   crossing_mission_proofs + 비공개 버킷 crossing-proofs
--      (같은 날 사용자: "upload section은 있어야함. 그것도 DB에 연동은 되어야하고")
-- 돈, 계좌, 출석 체크는 넣지 않습니다.
--
-- 멘토링은 예약제입니다(그 전 2026-10-11 결정은 "예약 없이"). 한 칸은 30분이고, 같은 멘토의 두 칸 사이에는 15분 이상이
-- 남습니다. 이 규칙은 앱이 아니라 아래 exclude 제약이 지킵니다(같은 순간 두 팀이 같은 칸을 눌러도 한 팀만 들어감).
-- 15는 lib/crossingOps.ts의 BUFFER_MINUTES와 같아야 합니다.
--
-- 기존 표(8월 표, crossing_registrations, crossing_members, crossing_match_profiles)와 뷰에는 새 외래키가 그쪽을
-- 가리킬 뿐 고치는 문장이 없습니다. 멱등. 쓰기는 /api/crossing/* 라우트가 service_role로만 합니다.
-- 거부 전부: RLS ON, 정책 0. 적용: 대시보드 SQL 에디터, 또는 `supabase db push`.
-- ─────────────────────────────────────────────────────────────────────────────

create extension if not exists btree_gist with schema extensions;

-- ── 1. 팀 ───────────────────────────────────────────────────────────────────
-- Day 1 현장에서 팀을 맺으면 운영진이 만듭니다. 시간표에서 팀은 이 이름으로 보입니다.
create table if not exists public.crossing_teams (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  event_slug  text not null,
  name        text not null check (char_length(name) between 1 and 40),
  unique (event_slug, name)
);

-- 팀원. 등록한 사람 한 명이 한 회차에 한 팀에만 들어갑니다.
-- match_profile_id: Day 1 AI 유형 테스트(crossing_match_profiles)를 본 운영진이 이어 둘 때만. 없어도 됩니다.
create table if not exists public.crossing_team_members (
  team_id           uuid not null references public.crossing_teams(id) on delete cascade,
  member_id         uuid not null references public.crossing_members(id) on delete cascade,
  event_slug        text not null,
  match_profile_id  uuid references public.crossing_match_profiles(id) on delete set null,
  added_at          timestamptz not null default now(),
  primary key (team_id, member_id),
  unique (event_slug, member_id)
);
create index if not exists crossing_team_members_member_idx on public.crossing_team_members (member_id);

-- ── 2. 멘토와 시간표 ───────────────────────────────────────────────────────────
create table if not exists public.crossing_mentors (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  event_slug  text not null,
  name        text not null check (char_length(name) between 1 and 40),
  field       text check (field is null or char_length(field) <= 80),
  active      boolean not null default true
);

-- 멘토가 받는 시간. 하루에 여러 구간이 있을 수 있습니다.
create table if not exists public.crossing_mentor_windows (
  id          uuid primary key default gen_random_uuid(),
  mentor_id   uuid not null references public.crossing_mentors(id) on delete cascade,
  day         smallint not null check (day in (2, 3)),
  starts_at   timestamptz not null,
  ends_at     timestamptz not null,
  check (ends_at > starts_at)
);
create index if not exists crossing_mentor_windows_mentor_idx on public.crossing_mentor_windows (mentor_id, day, starts_at);

-- 팀이 넣은 칸.
create table if not exists public.crossing_mentor_bookings (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  mentor_id   uuid not null references public.crossing_mentors(id) on delete cascade,
  team_id     uuid not null references public.crossing_teams(id) on delete cascade,
  day         smallint not null check (day in (2, 3)),
  starts_at   timestamptz not null,
  ends_at     timestamptz not null,
  check (ends_at > starts_at),
  -- 같은 멘토: 칸 + 뒤 15분이 다른 칸과 겹치면 거절(23P01). 두 칸 사이가 15분 미만이 될 수 없습니다.
  constraint crossing_bookings_mentor_buffer
    exclude using gist (mentor_id with =, tstzrange(starts_at, ends_at + interval '15 minutes', '[)') with &&),
  -- 같은 팀: 한 팀이 같은 시간에 두 멘토를 잡지 못합니다.
  constraint crossing_bookings_team_overlap
    exclude using gist (team_id with =, tstzrange(starts_at, ends_at, '[)') with &&)
);
create index if not exists crossing_mentor_bookings_day_idx on public.crossing_mentor_bookings (day, starts_at);

-- ── 4. 미션 인증 파일 ─────────────────────────────────────────────────────────
-- 파일은 비공개 버킷 crossing-proofs에, 행은 여기에. 여러 번 올릴 수 있고 화면은 가장 최근 것을 보여 줍니다.
create table if not exists public.crossing_mission_proofs (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  team_id       uuid not null references public.crossing_teams(id) on delete cascade,
  day           smallint not null check (day in (2, 3)),
  kind          text not null check (kind in ('photo', 'pdf')),
  storage_path  text not null unique,
  content_type  text not null,
  size_bytes    integer not null check (size_bytes > 0)
);
create index if not exists crossing_mission_proofs_team_idx on public.crossing_mission_proofs (team_id, day, kind, created_at desc);

-- 비공개 버킷. 20MB, 사진과 PDF만. 정책 0개라 서명 URL로만 오갑니다.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('crossing-proofs', 'crossing-proofs', false, 20971520,
        array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif', 'application/pdf'])
on conflict (id) do nothing;

alter table public.crossing_teams           enable row level security;
alter table public.crossing_team_members    enable row level security;
alter table public.crossing_mentors         enable row level security;
alter table public.crossing_mentor_windows  enable row level security;
alter table public.crossing_mentor_bookings enable row level security;
alter table public.crossing_mission_proofs  enable row level security;

-- ── 운영진이 대시보드에서 보는 뷰 셋 ────────────────────────────────────────────
-- 팀 명단: 팀마다 누가 있는지(등록 정보와 함께).
create or replace view public.crossing_team_roster as
  select t.name as team, t.id as team_id, m.name, m.university, m.study_country, m.email, m.contact,
         tm.member_id, tm.match_profile_id
  from public.crossing_teams t
  join public.crossing_team_members tm on tm.team_id = t.id
  join public.crossing_members m on m.id = tm.member_id
  order by t.name, m.name;
alter view public.crossing_team_roster set (security_invoker = on);
revoke select on public.crossing_team_roster from anon, authenticated;

-- 시간표: 어느 팀이 언제 어느 멘토에게 가는지. 시각은 한국 시간.
create or replace view public.crossing_mentor_timetable as
  select b.day, to_char(b.starts_at at time zone 'Asia/Seoul', 'HH24:MI') as starts,
         to_char(b.ends_at at time zone 'Asia/Seoul', 'HH24:MI') as ends,
         mt.name as mentor, t.name as team, b.id as booking_id
  from public.crossing_mentor_bookings b
  join public.crossing_mentors mt on mt.id = b.mentor_id
  join public.crossing_teams t on t.id = b.team_id
  order by b.day, b.starts_at, mt.name;
alter view public.crossing_mentor_timetable set (security_invoker = on);
revoke select on public.crossing_mentor_timetable from anon, authenticated;

-- 인증 현황: 팀과 날마다 사진과 PDF가 왔는지(가장 최근 시각). 파일은 Storage의 crossing-proofs/<storage_path>.
create or replace view public.crossing_mission_uploads as
  select t.name as team, p.day,
         max(p.created_at) filter (where p.kind = 'photo') as photo_at,
         max(p.created_at) filter (where p.kind = 'pdf')   as pdf_at
  from public.crossing_teams t
  join public.crossing_mission_proofs p on p.team_id = t.id
  group by t.name, p.day
  order by p.day, t.name;
alter view public.crossing_mission_uploads set (security_invoker = on);
revoke select on public.crossing_mission_uploads from anon, authenticated;

comment on table public.crossing_team_members is
  '크로싱 서울 팀원. 등록한 사람(crossing_members) 한 명은 한 회차에 한 팀에만.';
comment on table public.crossing_mentor_bookings is
  '크로싱 서울 멘토 시간표의 칸. 같은 멘토의 두 칸 사이는 15분 이상(exclude 제약). 15는 lib/crossingOps.ts BUFFER_MINUTES와 같아야 함.';
