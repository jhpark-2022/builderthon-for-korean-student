-- ─────────────────────────────────────────────────────────────────────────────
-- 0013: 미션은 Day 2와 Day 3에만 (2026-10-19).
--
-- DECIDED 2026-10-19 (사용자: "1일차랑 4일차에는 미션을 빼자", "supabase도 이걸 반영을 해야할거 같은데"; docs/brand.md 7장):
--   - Day 4 미션은 DB에 있던 적이 없습니다(운영진이 클로징 때 확인하던 것). 바꿀 것이 없습니다.
--   - Day 1의 PDF(이슈에 대한 팀의 생각 1장)는 미션이 아니라 Day 2에 들고 갈 것이고, 올려 두는 것은 선택입니다.
--     그래서 올리기(0009)는 그대로 두고, 미션으로 세지 않게 합니다.
--       1. crossing_mission_proofs.mission: day가 2나 3이면 true(계산 열). 표 편집기에서 바로 거를 수 있습니다.
--       2. crossing_track_activity: Day 1 PDF를 "들고 갈 것"(carry)으로 따로 세고, 미션 칸은 Day 2, 3만.
--       3. crossing_mission_progress(새 뷰): 팀마다 Day 2, 3 미션에서 DB가 아는 조건(그날 PDF, 이틀 중 멘토 사진)을 한 줄로.
--          팀원 과반이 현장에 왔는지는 운영진이 현장에서 체크하고 DB에는 없습니다(0008 결정 그대로).
--
-- 표의 행은 고치지 않습니다. 멱등. RLS 그대로, 뷰는 anon/authenticated에서 거둡니다.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── 1. 미션 여부 열 ───────────────────────────────────────────────────────────
alter table public.crossing_mission_proofs
  add column if not exists mission boolean generated always as (day in (2, 3)) stored;
comment on column public.crossing_mission_proofs.mission is
  '미션 인증이면 true(Day 2, 3). Day 1 PDF는 미션이 아니라 Day 2에 들고 갈 것을 올려 둔 것(선택, 2026-10-19).';

-- ── 2. 트랙별 한눈 보기: Day 1은 미션과 따로 ─────────────────────────────────────
-- 열 이름이 바뀌므로 create or replace가 아니라 지우고 다시 만듭니다. 이 뷰에 기대는 다른 뷰는 없습니다.
drop view if exists public.crossing_track_activity;
create view public.crossing_track_activity as
  select tr.sort, tr.id as track, tr.label_ko as label, tr.color,
         (select count(*) from public.crossing_teams t where t.track = tr.id) as teams,
         (select count(*) from public.crossing_team_members tm join public.crossing_teams t on t.name = tm.team_name where t.track = tr.id) as members,
         (select count(*) from public.crossing_mentor_bookings b where b.track = tr.id and b.day = 2) as slots_day2,
         (select count(*) from public.crossing_mentor_bookings b where b.track = tr.id and b.day = 3) as slots_day3,
         (select count(distinct p.team_name) from public.crossing_mission_proofs p where p.track = tr.id and p.day = 1) as carry_pdf_teams_day1,
         (select count(distinct p.team_name) from public.crossing_mission_proofs p where p.track = tr.id and p.day = 2 and p.kind = 'pdf') as mission_pdf_teams_day2,
         (select count(distinct p.team_name) from public.crossing_mission_proofs p where p.track = tr.id and p.day = 3 and p.kind = 'pdf') as mission_pdf_teams_day3,
         (select count(distinct p.team_name) from public.crossing_mission_proofs p where p.track = tr.id and p.mission and p.kind = 'photo') as mentor_photo_teams,
         (select count(*) from public.crossing_votes v where v.track = tr.id) as votes
  from public.crossing_tracks tr
  where tr.event_slug = 'crossing-seoul-2026-12'
  order by tr.sort;
alter view public.crossing_track_activity set (security_invoker = on);
revoke select on public.crossing_track_activity from anon, authenticated;

-- ── 3. 팀마다 미션 진행 ──────────────────────────────────────────────────────────
-- brand 7장 인정 조건 가운데 DB가 아는 것: Day 2, 3 각각 그날 진척 PDF, 그리고 이틀 중 하루 이상 멘토와 찍은 사진.
-- dayN_ready는 그 둘이 다 있는지입니다. 팀원 과반 현장은 운영진 체크라 여기 없습니다(ready여도 최종 인정은 운영진).
create or replace view public.crossing_mission_progress as
  with p as (
    select team_name,
           max(created_at) filter (where day = 1)                     as day1_carry_pdf_at,
           max(created_at) filter (where day = 2 and kind = 'pdf')    as day2_pdf_at,
           max(created_at) filter (where day = 3 and kind = 'pdf')    as day3_pdf_at,
           max(created_at) filter (where mission and kind = 'photo')  as mentor_photo_at
    from public.crossing_mission_proofs
    group by team_name
  ), b as (
    select team_name, count(*) as mentor_slots
    from public.crossing_mentor_bookings
    where day in (2, 3)
    group by team_name
  )
  select t.track, t.name as team,
         p.day2_pdf_at, p.day3_pdf_at, p.mentor_photo_at, coalesce(b.mentor_slots, 0) as mentor_slots,
         (p.day2_pdf_at is not null and p.mentor_photo_at is not null) as day2_ready,
         (p.day3_pdf_at is not null and p.mentor_photo_at is not null) as day3_ready,
         p.day1_carry_pdf_at
  from public.crossing_teams t
  left join p on p.team_name = t.name
  left join b on b.team_name = t.name
  where t.event_slug = 'crossing-seoul-2026-12'
  order by t.track, t.name;
alter view public.crossing_mission_progress set (security_invoker = on);
revoke select on public.crossing_mission_progress from anon, authenticated;

comment on table public.crossing_mission_proofs is
  '크로싱 서울 인증 파일. 미션은 Day 2, 3(mission 열). Day 1 PDF는 Day 2에 들고 갈 것을 올려 둔 것이고 선택(2026-10-19).';
