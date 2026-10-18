-- ─────────────────────────────────────────────────────────────────────────────
-- 0012: 크로싱 서울 트랙 표, 활동 기록마다 트랙, 멘토 자리 10개 (2026-10-18).
--
-- DECIDED 2026-10-18 (사용자: "1일차에 각 팀들이 팀 이름 같은거를 주고 내가 그걸 넣을때, 각 팀들이 어떤 트랙을 할거인지도
-- 여기에 저장이 되어 있어야함", "멘토링 슬롯을 넣을때도 무슨 트랙인지에 따라서 슬롯 색깔이 달라졌으면", "activity를
-- 트랙하는 DB도 모두 그 트랙이 같이 트랙킹되어야함", "멘토링 현재 10명을 base"):
--   1. 트랙은 표 하나(crossing_tracks)에 둡니다. 팀의 트랙은 그 표에서만 고릅니다(자유 글자였던 0010의 track을 외래키로).
--      오타로 한 트랙이 둘로 갈라지지 않습니다. 트랙 이름은 미정이고 셋으로 기획 중이라(같은 날 사용자) 자리 셋
--      (a, b, c / 트랙 A, B, C)을 넣어 둡니다. 이름이 정해지면 label을 고치고, id도 바꿔도 됩니다(on update cascade로
--      팀과 모든 활동 기록이 따라 바뀝니다). id를 바꿀 때는 data/matchTracks.ts의 id와 같게 둡니다.
--   2. 팀은 트랙 없이 만들 수 없습니다(track not null). Day 1에 팀 이름과 트랙을 같이 적습니다.
--   3. 활동 기록(멘토 칸, 미션 인증, 인기투표)마다 track 열이 있고, (팀, 트랙) 쌍 외래키가 팀의 트랙과 늘 같게 지킵니다.
--      칸과 인증의 track은 트리거가 팀에서 채웁니다(라우트는 보내지 않음). 운영진이 팀의 트랙을 고치면 기록도 따라갑니다.
--      투표는 그 트랙의 팀에게만 넣을 수 있게 DB가 막습니다(전에는 라우트만 막음).
--   4. 색은 트랙 표의 color 열(blue, violet, plum, orange)입니다. 실제 색은 lib/crossingOps.ts TRACK_TINTS이고
--      brand 10장 크로싱 워드마크 그라데이션의 화면용 네 색입니다. 시간표의 칸이 그 팀의 트랙 색으로 칠해집니다.
--   5. 멘토는 자리 10개(멘토 01~10)를 넣어 둡니다. 이름과 분야는 표 편집기에서 고칩니다(공개 레포라 실명은 여기 쓰지 않음).
--      sort 열이 시간표의 열 순서를 정합니다(이름을 바꿔도 순서가 흔들리지 않게).
--
-- 2026-10-18 적용 전 프로덕션의 크로싱 표는 모두 0행이라 not null과 외래키가 막을 기존 행이 없습니다.
-- 멱등. 8월 표와 등록 표(crossing_registrations, crossing_members), 유형 테스트 표에는 닿지 않습니다.
-- RLS ON, 정책 0, 뷰는 anon/authenticated에서 거둡니다. 적용: `supabase db push`.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── 1. 트랙 ───────────────────────────────────────────────────────────────────
create table if not exists public.crossing_tracks (
  id          text primary key check (id ~ '^[a-z0-9-]{1,24}$'),
  created_at  timestamptz not null default now(),
  event_slug  text not null default 'crossing-seoul-2026-12',
  label_ko    text not null check (char_length(label_ko) between 1 and 40),
  label_en    text not null check (char_length(label_en) between 1 and 40),
  color       text not null check (color in ('blue', 'violet', 'plum', 'orange')),
  sort        smallint not null default 0
);
alter table public.crossing_tracks enable row level security;

insert into public.crossing_tracks (id, label_ko, label_en, color, sort)
select * from (values ('a', '트랙 A', 'Track A', 'blue', 1),
                      ('b', '트랙 B', 'Track B', 'plum', 2),
                      ('c', '트랙 C', 'Track C', 'orange', 3)) v(id, label_ko, label_en, color, sort)
where not exists (select 1 from public.crossing_tracks where event_slug = 'crossing-seoul-2026-12');

-- ── 2. 팀의 트랙: 트랙 표에서만, 비울 수 없음 ─────────────────────────────────────
alter table public.crossing_teams drop constraint if exists crossing_teams_track_fkey;
alter table public.crossing_teams
  add constraint crossing_teams_track_fkey foreign key (track) references public.crossing_tracks(id) on update cascade on delete restrict;
alter table public.crossing_teams alter column track set not null;
-- 활동 기록이 (팀, 트랙) 쌍으로 가리키도록.
-- 아래 외래키들이 이 제약에 기대므로 지웠다 다시 만들지 않고, 없을 때만 더합니다(두 번 적용해도 됨).
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'crossing_teams_name_track_key') then
    alter table public.crossing_teams add constraint crossing_teams_name_track_key unique (name, track);
  end if;
end $$;

-- 칸과 인증의 track을 팀에서 채웁니다. 라우트도 표 편집기도 track을 적지 않아도 됩니다.
create or replace function public.crossing_fill_track()
  returns trigger language plpgsql as $$
begin
  select t.track into new.track from public.crossing_teams t where t.name = new.team_name;
  return new;
end $$;
revoke execute on function public.crossing_fill_track() from public, anon, authenticated;

-- ── 3. 활동 기록마다 트랙 ────────────────────────────────────────────────────────
-- 멘토 칸.
alter table public.crossing_mentor_bookings add column if not exists track text;
drop trigger if exists crossing_bookings_fill_track on public.crossing_mentor_bookings;
create trigger crossing_bookings_fill_track
  before insert or update of team_name on public.crossing_mentor_bookings
  for each row execute function public.crossing_fill_track();
update public.crossing_mentor_bookings b set track = t.track from public.crossing_teams t where t.name = b.team_name and b.track is null;
alter table public.crossing_mentor_bookings alter column track set not null;
-- 팀 이름 하나만 보던 외래키를 (팀, 트랙) 쌍으로 바꿉니다. 이름과 트랙 어느 쪽을 고쳐도 따라갑니다.
alter table public.crossing_mentor_bookings drop constraint if exists crossing_mentor_bookings_team_name_fkey;
alter table public.crossing_mentor_bookings drop constraint if exists crossing_mentor_bookings_team_track_fkey;
alter table public.crossing_mentor_bookings
  add constraint crossing_mentor_bookings_team_track_fkey foreign key (team_name, track)
  references public.crossing_teams(name, track) on update cascade on delete cascade;
create index if not exists crossing_mentor_bookings_track_idx on public.crossing_mentor_bookings (track, day);

-- 미션 인증.
alter table public.crossing_mission_proofs add column if not exists track text;
drop trigger if exists crossing_proofs_fill_track on public.crossing_mission_proofs;
create trigger crossing_proofs_fill_track
  before insert or update of team_name on public.crossing_mission_proofs
  for each row execute function public.crossing_fill_track();
update public.crossing_mission_proofs p set track = t.track from public.crossing_teams t where t.name = p.team_name and p.track is null;
alter table public.crossing_mission_proofs alter column track set not null;
alter table public.crossing_mission_proofs drop constraint if exists crossing_mission_proofs_team_name_fkey;
alter table public.crossing_mission_proofs drop constraint if exists crossing_mission_proofs_team_track_fkey;
alter table public.crossing_mission_proofs
  add constraint crossing_mission_proofs_team_track_fkey foreign key (team_name, track)
  references public.crossing_teams(name, track) on update cascade on delete cascade;
create index if not exists crossing_mission_proofs_track_idx on public.crossing_mission_proofs (track, day);

-- 인기투표. track은 원래 있던 열(투표한 트랙)이고, 고른 팀이 그 트랙의 팀이어야 합니다.
alter table public.crossing_votes drop constraint if exists crossing_votes_choice_fkey;
alter table public.crossing_votes drop constraint if exists crossing_votes_choice_track_fkey;
alter table public.crossing_votes
  add constraint crossing_votes_choice_track_fkey foreign key (choice, track)
  references public.crossing_teams(name, track) on update cascade on delete cascade;

-- ── 4. 멘토 자리 10개 ──────────────────────────────────────────────────────────
alter table public.crossing_mentors add column if not exists sort smallint not null default 0;
insert into public.crossing_mentors (name, sort)
select '멘토 ' || lpad(n::text, 2, '0'), n from generate_series(1, 10) n
where not exists (select 1 from public.crossing_mentors where event_slug = 'crossing-seoul-2026-12');

-- ── 5. 뷰: 기존 뷰는 끝에 track(과 트랙 이름)을 더하고, 트랙별 한눈 보기를 새로 ──────────────
create or replace view public.crossing_team_roster as
  select tm.team_name as team, m.name, m.university, m.study_country, m.email, m.contact,
         tm.member_id, tm.match_profile_id, t.track, tr.label_ko as track_label
  from public.crossing_team_members tm
  join public.crossing_members m on m.id = tm.member_id
  join public.crossing_teams t on t.name = tm.team_name
  join public.crossing_tracks tr on tr.id = t.track
  order by tr.sort, tm.team_name, m.name;
alter view public.crossing_team_roster set (security_invoker = on);
revoke select on public.crossing_team_roster from anon, authenticated;

create or replace view public.crossing_mentor_timetable as
  select b.day, to_char(b.starts_at at time zone 'Asia/Seoul', 'HH24:MI') as starts,
         to_char(b.ends_at at time zone 'Asia/Seoul', 'HH24:MI') as ends,
         mt.name as mentor, b.team_name as team, b.id as booking_id, b.track, tr.label_ko as track_label
  from public.crossing_mentor_bookings b
  join public.crossing_mentors mt on mt.id = b.mentor_id
  join public.crossing_tracks tr on tr.id = b.track
  order by b.day, b.starts_at, mt.sort, mt.name;
alter view public.crossing_mentor_timetable set (security_invoker = on);
revoke select on public.crossing_mentor_timetable from anon, authenticated;

create or replace view public.crossing_mentoring_counts as
  select b.team_name as team, b.day, count(*) as slots,
         string_agg(m.name || ' ' || to_char(b.starts_at at time zone 'Asia/Seoul', 'HH24:MI'), ', ' order by b.starts_at) as mentors,
         b.track
  from public.crossing_mentor_bookings b
  join public.crossing_mentors m on m.id = b.mentor_id
  group by b.team_name, b.day, b.track
  order by b.day, b.track, b.team_name;
alter view public.crossing_mentoring_counts set (security_invoker = on);
revoke select on public.crossing_mentoring_counts from anon, authenticated;

create or replace view public.crossing_mission_uploads as
  select p.team_name as team, p.day,
         max(p.created_at) filter (where p.kind = 'photo') as photo_at,
         max(p.created_at) filter (where p.kind = 'pdf')   as pdf_at,
         p.track
  from public.crossing_mission_proofs p
  group by p.team_name, p.day, p.track
  order by p.day, p.track, p.team_name;
alter view public.crossing_mission_uploads set (security_invoker = on);
revoke select on public.crossing_mission_uploads from anon, authenticated;

create or replace view public.crossing_mission_files as
  select p.team_name as team, p.day, p.kind, p.created_at,
         row_number() over (partition by p.team_name, p.day, p.kind order by p.created_at desc) = 1 as latest,
         p.storage_path, p.size_bytes, p.track
  from public.crossing_mission_proofs p
  order by p.day, p.track, p.team_name, p.kind, p.created_at desc;
alter view public.crossing_mission_files set (security_invoker = on);
revoke select on public.crossing_mission_files from anon, authenticated;

-- 트랙마다 팀 수, 사람 수, 날마다 멘토 칸 수, 날마다 PDF를 낸 팀 수, 표 수. 운영진이 대시보드에서 한 줄로 봅니다.
create or replace view public.crossing_track_activity as
  select tr.sort, tr.id as track, tr.label_ko as label, tr.color,
         (select count(*) from public.crossing_teams t where t.track = tr.id) as teams,
         (select count(*) from public.crossing_team_members tm join public.crossing_teams t on t.name = tm.team_name where t.track = tr.id) as members,
         (select count(*) from public.crossing_mentor_bookings b where b.track = tr.id and b.day = 2) as slots_day2,
         (select count(*) from public.crossing_mentor_bookings b where b.track = tr.id and b.day = 3) as slots_day3,
         (select count(distinct p.team_name) from public.crossing_mission_proofs p where p.track = tr.id and p.day = 1 and p.kind = 'pdf') as pdf_teams_day1,
         (select count(distinct p.team_name) from public.crossing_mission_proofs p where p.track = tr.id and p.day = 2 and p.kind = 'pdf') as pdf_teams_day2,
         (select count(distinct p.team_name) from public.crossing_mission_proofs p where p.track = tr.id and p.day = 3 and p.kind = 'pdf') as pdf_teams_day3,
         (select count(distinct p.team_name) from public.crossing_mission_proofs p where p.track = tr.id and p.kind = 'photo') as photo_teams,
         (select count(*) from public.crossing_votes v where v.track = tr.id) as votes
  from public.crossing_tracks tr
  where tr.event_slug = 'crossing-seoul-2026-12'
  order by tr.sort;
alter view public.crossing_track_activity set (security_invoker = on);
revoke select on public.crossing_track_activity from anon, authenticated;

comment on table public.crossing_tracks is
  '크로싱 서울 트랙. 팀은 여기서만 트랙을 고르고, 멘토 칸, 인증, 투표가 (팀, 트랙) 쌍으로 따라옵니다. color는 lib/crossingOps.ts TRACK_TINTS의 키.';
