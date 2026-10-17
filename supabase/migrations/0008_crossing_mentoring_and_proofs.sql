-- ─────────────────────────────────────────────────────────────────────────────
-- 0008: 크로싱 서울 현장 도구. 팀 코드, 멘토 예약, 미션 인증 (2026-10-17).
--
-- 시간표는 모든 팀이 같이 봅니다. 칸에는 예약한 팀의 이름이 보입니다.
-- DECIDED 2026-10-17 (사용자: "멘토링 booking system", "그 시간 앞뒤 15분씩도 자동으로 block"):
-- Day 2와 Day 3 멘토링은 예약제입니다(그 전 2026-10-11 결정은 "예약 없이"). 예약 하나는 자기 시간과
-- 그 뒤 15분을 막습니다. 예약마다 그렇게 하므로 같은 멘토의 두 예약 사이에는 언제나 15분 이상이 남고,
-- 화면에서는 예약의 앞뒤 15분이 막혀 보입니다. 이 규칙은 앱이 아니라 아래 exclude 제약이 지킵니다
-- (같은 순간 두 팀이 같은 칸을 눌러도 한 팀만 들어갑니다). 15는 lib/crossingOps.ts의 BUFFER_MINUTES와 같아야 합니다.
-- DECIDED 2026-10-17 (사용자, 상금·인센티브 정리 2장): Day 2, Day 3 미션은 멘토와 찍은 인증 사진과 진척 PDF로 확인합니다.
-- 파일은 비공개 버킷 crossing-proofs에 가고, 행은 crossing_mission_proofs에 남습니다.
--
-- 기존 표와 뷰에 닿는 문장 0개. 멱등. 쓰기와 읽기는 /api/crossing/* 라우트가 service_role로만 합니다.
-- 거부 전부: RLS ON, 정책 0. 버킷도 정책 0(서명 URL로만 오갑니다).
-- 적용: 대시보드 SQL 에디터, 또는 `supabase db push`.
-- ─────────────────────────────────────────────────────────────────────────────

create extension if not exists btree_gist with schema extensions;

-- 팀. Day 1 현장에서 팀을 맺은 뒤 운영진이 만듭니다. 로그인도 코드도 없습니다. 시간표에서 팀을 골라 씁니다
-- (DECIDED 2026-10-17, 사용자: "그냥 timetable where team can put in their available, 다른 팀과 공유").
create table if not exists public.crossing_teams (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  event_slug  text not null,
  name        text not null check (char_length(name) between 1 and 40),
  unique (event_slug, name)
);
create index if not exists crossing_teams_event_idx on public.crossing_teams (event_slug, name);

-- 멘토. 이름은 운영진 화면과 팀 화면에만 나갑니다(공개 사이트에는 쓰지 않습니다).
create table if not exists public.crossing_mentors (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  event_slug  text not null,
  name        text not null check (char_length(name) between 1 and 40),
  field       text check (field is null or char_length(field) <= 80),
  active      boolean not null default true
);

-- 멘토가 받을 수 있는 시간. 하루에 여러 구간이 있을 수 있습니다.
create table if not exists public.crossing_mentor_windows (
  id          uuid primary key default gen_random_uuid(),
  mentor_id   uuid not null references public.crossing_mentors(id) on delete cascade,
  day         smallint not null check (day in (2, 3)),
  starts_at   timestamptz not null,
  ends_at     timestamptz not null,
  check (ends_at > starts_at)
);
create index if not exists crossing_mentor_windows_mentor_idx on public.crossing_mentor_windows (mentor_id, day, starts_at);

-- 예약.
create table if not exists public.crossing_mentor_bookings (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  mentor_id   uuid not null references public.crossing_mentors(id) on delete cascade,
  team_id     uuid not null references public.crossing_teams(id) on delete cascade,
  day         smallint not null check (day in (2, 3)),
  starts_at   timestamptz not null,
  ends_at     timestamptz not null,
  check (ends_at > starts_at),
  -- 같은 멘토: 예약 시간 + 뒤 15분이 다른 예약과 겹치면 거절(23P01). 두 예약 사이가 15분 미만이 될 수 없습니다.
  constraint crossing_bookings_mentor_buffer
    exclude using gist (mentor_id with =, tstzrange(starts_at, ends_at + interval '15 minutes', '[)') with &&),
  -- 같은 팀: 한 팀이 같은 시간에 두 멘토를 잡지 못합니다.
  constraint crossing_bookings_team_overlap
    exclude using gist (team_id with =, tstzrange(starts_at, ends_at, '[)') with &&)
);
create index if not exists crossing_mentor_bookings_day_idx on public.crossing_mentor_bookings (day, starts_at);

-- 미션 인증 파일(사진, PDF). 여러 번 올릴 수 있고 화면은 가장 최근 것을 보여 줍니다.
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

-- 운영진의 체크. 현장 과반 출석과 그날 미션 인정. Day 4는 클로징 때 운영진이 체크합니다.
create table if not exists public.crossing_mission_checks (
  team_id     uuid not null references public.crossing_teams(id) on delete cascade,
  day         smallint not null check (day in (2, 3, 4)),
  on_site     boolean not null default false,
  completed   boolean not null default false,
  updated_at  timestamptz not null default now(),
  primary key (team_id, day)
);

alter table public.crossing_teams            enable row level security;
alter table public.crossing_mentors          enable row level security;
alter table public.crossing_mentor_windows   enable row level security;
alter table public.crossing_mentor_bookings  enable row level security;
alter table public.crossing_mission_proofs   enable row level security;
alter table public.crossing_mission_checks   enable row level security;

-- 비공개 버킷. 20MB, 사진과 PDF만.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('crossing-proofs', 'crossing-proofs', false, 20971520,
        array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif', 'application/pdf'])
on conflict (id) do nothing;

comment on table public.crossing_mentor_bookings is
  '크로싱 서울 멘토 예약. 같은 멘토의 두 예약 사이는 15분 이상(exclude 제약). 15는 lib/crossingOps.ts BUFFER_MINUTES와 같아야 함.';
