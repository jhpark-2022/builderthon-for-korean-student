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
-- 멘토링은 예약제입니다(그 전 2026-10-11 결정은 "예약 없이"). 한 칸은 30분이고, 같은 멘토의 두 칸 사이에는 10분 이상이
-- 남습니다. 이 규칙은 앱이 아니라 아래 exclude 제약이 지킵니다(같은 순간 두 팀이 같은 칸을 눌러도 한 팀만 들어감).
-- 10은 lib/crossingOps.ts의 BUFFER_MINUTES와 같아야 합니다.
--
-- 운영진 화면은 없습니다(같은 날 사용자: "운영진 page는 필요가 없음"). 팀, 팀원, 멘토, 멘토가 받는 시간은 Supabase 표 편집기에
-- 바로 넣습니다. 그래서 event_slug에는 기본값을 두고, 멘토 시간은 날짜 없이 Day와 한국 시각(HH:MM)으로 적습니다.
-- 팀원의 member_id는 표 편집기에서 외래키를 누르면 crossing_members 목록에서 고를 수 있습니다.
-- 팀에는 따로 만드는 ID가 없습니다. 팀 이름이 곧 키이고(같은 날 사용자: "팀 아이디 생성 이런게 필요없음, 내가 사전에 팀 만들고
-- 팀 이름 만들면"), 팀원, 시간표 칸, 인증 파일이 모두 팀 이름을 가리킵니다. 이름을 고치면 따라 바뀝니다(on update cascade).
--
-- 기존 표(8월 표, crossing_registrations, crossing_members, crossing_match_profiles)와 뷰에는 새 외래키가 그쪽을
-- 가리킬 뿐 고치는 문장이 없습니다. 멱등. 쓰기는 /api/crossing/* 라우트가 service_role로만 합니다.
-- 거부 전부: RLS ON, 정책 0. 적용: 대시보드 SQL 에디터, 또는 `supabase db push`.
-- ─────────────────────────────────────────────────────────────────────────────

create extension if not exists btree_gist with schema extensions;

-- exclude 제약의 식에는 IMMUTABLE 함수만 쓸 수 있는데 timestamptz + interval은 STABLE입니다(일, 월 단위는 시간대에 따라
-- 달라질 수 있어서). 여기서는 분 단위만 더하므로 시간대와 무관합니다. 그래서 분을 더하는 함수를 IMMUTABLE로 둡니다.
create or replace function public.crossing_plus_minutes(t timestamptz, m integer)
  returns timestamptz language sql immutable parallel safe
  as $$ select t + make_interval(mins => m) $$;
revoke execute on function public.crossing_plus_minutes(timestamptz, integer) from public, anon, authenticated;

-- ── 1. 팀 ───────────────────────────────────────────────────────────────────
-- Day 1 현장에서 팀을 맺으면 운영진이 만듭니다. 시간표에서 팀은 이 이름으로 보입니다.
create table if not exists public.crossing_teams (
  name        text primary key check (char_length(name) between 1 and 40),
  created_at  timestamptz not null default now(),
  event_slug  text not null default 'crossing-seoul-2026-12'
);

-- 팀원. 등록한 사람 한 명이 한 회차에 한 팀에만 들어갑니다.
-- match_profile_id: Day 1 AI 유형 테스트(crossing_match_profiles)를 본 운영진이 이어 둘 때만. 없어도 됩니다.
create table if not exists public.crossing_team_members (
  team_name         text not null references public.crossing_teams(name) on update cascade on delete cascade,
  member_id         uuid not null references public.crossing_members(id) on delete cascade,
  event_slug        text not null default 'crossing-seoul-2026-12',
  match_profile_id  uuid references public.crossing_match_profiles(id) on delete set null,
  added_at          timestamptz not null default now(),
  primary key (team_name, member_id),
  unique (event_slug, member_id)
);
create index if not exists crossing_team_members_member_idx on public.crossing_team_members (member_id);

-- ── 2. 멘토와 시간표 ───────────────────────────────────────────────────────────
create table if not exists public.crossing_mentors (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  event_slug  text not null default 'crossing-seoul-2026-12',
  name        text not null check (char_length(name) between 1 and 40),
  field       text check (field is null or char_length(field) <= 80),
  active      boolean not null default true
);

-- 멘토가 받는 시간. 하루에 여러 구간이 있을 수 있습니다. 시각은 한국 시간 그대로(예: day 2, 14:00, 17:00).
-- 그 날 행이 하나도 없는 멘토는 10:00~22:00으로 봅니다(임시, lib/crossingOps.ts DEFAULT_WINDOW).
-- 10분 단위로 적습니다. 날짜는 앱이 Day 번호로 셉니다(lib/crossingOps.ts dayDate).
create table if not exists public.crossing_mentor_windows (
  id          uuid primary key default gen_random_uuid(),
  mentor_id   uuid not null references public.crossing_mentors(id) on delete cascade,
  day         smallint not null check (day in (2, 3)),
  start_time  time not null check (extract(minute from start_time)::int % 10 = 0),
  end_time    time not null check (extract(minute from end_time)::int % 10 = 0),
  check (end_time > start_time)
);
create index if not exists crossing_mentor_windows_mentor_idx on public.crossing_mentor_windows (mentor_id, day, start_time);

-- 팀이 넣은 칸.
create table if not exists public.crossing_mentor_bookings (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  mentor_id   uuid not null references public.crossing_mentors(id) on delete cascade,
  team_name   text not null references public.crossing_teams(name) on update cascade on delete cascade,
  day         smallint not null check (day in (2, 3)),
  starts_at   timestamptz not null,
  ends_at     timestamptz not null,
  check (ends_at > starts_at),
  -- 같은 멘토: 칸 + 뒤 10분이 다른 칸과 겹치면 거절(23P01). 두 칸 사이가 10분 미만이 될 수 없습니다(2026-10-17 사용자, 15분에서 10분).
  constraint crossing_bookings_mentor_buffer
    exclude using gist (mentor_id with =, tstzrange(starts_at, public.crossing_plus_minutes(ends_at, 10), '[)') with &&),
  -- 같은 팀: 칸 하나를 넣으면 그 시작부터 2시간 동안은 어느 멘토의 칸도 못 넣습니다(하루 횟수 제한은 없음).
  -- 두 칸의 시작이 2시간 이상 떨어져야 합니다. 2시간은 lib/crossingOps.ts의 TEAM_COOLDOWN_MINUTES와 같아야 합니다.
  constraint crossing_bookings_team_cooldown
    exclude using gist (team_name with =, tstzrange(starts_at, public.crossing_plus_minutes(starts_at, 120), '[)') with &&)
);
create index if not exists crossing_mentor_bookings_day_idx on public.crossing_mentor_bookings (day, starts_at);

-- ── 4. 미션 인증 파일 ─────────────────────────────────────────────────────────
-- 파일은 비공개 버킷 crossing-proofs에, 행은 여기에. 여러 번 올릴 수 있고 화면은 가장 최근 것을 보여 줍니다.
create table if not exists public.crossing_mission_proofs (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  team_name     text not null references public.crossing_teams(name) on update cascade on delete cascade,
  day           smallint not null check (day in (2, 3)),
  kind          text not null check (kind in ('photo', 'pdf')),
  storage_path  text not null unique,
  content_type  text not null,
  size_bytes    integer not null check (size_bytes > 0)
);
create index if not exists crossing_mission_proofs_team_idx on public.crossing_mission_proofs (team_name, day, kind, created_at desc);

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
  select tm.team_name as team, m.name, m.university, m.study_country, m.email, m.contact,
         tm.member_id, tm.match_profile_id
  from public.crossing_team_members tm
  join public.crossing_members m on m.id = tm.member_id
  order by tm.team_name, m.name;
alter view public.crossing_team_roster set (security_invoker = on);
revoke select on public.crossing_team_roster from anon, authenticated;

-- 시간표: 어느 팀이 언제 어느 멘토에게 가는지. 시각은 한국 시간.
create or replace view public.crossing_mentor_timetable as
  select b.day, to_char(b.starts_at at time zone 'Asia/Seoul', 'HH24:MI') as starts,
         to_char(b.ends_at at time zone 'Asia/Seoul', 'HH24:MI') as ends,
         mt.name as mentor, b.team_name as team, b.id as booking_id
  from public.crossing_mentor_bookings b
  join public.crossing_mentors mt on mt.id = b.mentor_id
  order by b.day, b.starts_at, mt.name;
alter view public.crossing_mentor_timetable set (security_invoker = on);
revoke select on public.crossing_mentor_timetable from anon, authenticated;

-- 인증 현황: 팀과 날마다 사진과 PDF가 왔는지(가장 최근 시각). 파일은 Storage의 crossing-proofs/<storage_path>.
create or replace view public.crossing_mission_uploads as
  select p.team_name as team, p.day,
         max(p.created_at) filter (where p.kind = 'photo') as photo_at,
         max(p.created_at) filter (where p.kind = 'pdf')   as pdf_at
  from public.crossing_mission_proofs p
  group by p.team_name, p.day
  order by p.day, p.team_name;
alter view public.crossing_mission_uploads set (security_invoker = on);
revoke select on public.crossing_mission_uploads from anon, authenticated;

comment on table public.crossing_team_members is
  '크로싱 서울 팀원. 등록한 사람(crossing_members) 한 명은 한 회차에 한 팀에만.';
comment on table public.crossing_mentor_bookings is
  '크로싱 서울 멘토 시간표의 칸. 같은 멘토의 두 칸 사이는 10분 이상(exclude 제약). 10은 lib/crossingOps.ts BUFFER_MINUTES와 같아야 함.';
