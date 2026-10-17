-- ─────────────────────────────────────────────────────────────────────────────
-- 0010: 크로싱 서울 흐름 점검 뒤 채운 것 (2026-10-17).
--
-- DECIDED 2026-10-17 (사용자, 흐름 점검 요청과 답):
--   1. 팀에 트랙(track)을 둡니다. 마지막 날 트랙별 인기투표가 이 값으로 팀을 나눕니다. 운영진이 표 편집기로 적습니다.
--   2. 멘토 칸은 한 팀이 하루 두 칸까지입니다("둘 다": 하루 두 칸 + 두 칸 시작이 2시간 이상, 0008의 cooldown은 그대로).
--      같은 순간 두 요청이 들어와도 세 번째 칸이 생기지 않게 트리거가 팀과 날로 잠그고 셉니다. 한 번 넣은 칸은 참가자가
--      바꾸지 못합니다(API에 빼기가 없음. 운영진은 표 편집기에서 지울 수 있음).
--   3. 유형 테스트(crossing_match_profiles)와 등록한 사람(crossing_members)은 본명으로 잇습니다("등록에 썼던 본인 이름").
--      띄어쓰기와 대소문자를 무시하고 같은 이름을 찾고, 같은 이름이 둘 이상이면 나라로 가립니다. 그래도 둘 이상이면 'ambiguous'.
--   4. 인기투표(crossing_votes): 8월 day8_votes와 같은 규칙. 무기명, 기기 하나에 트랙마다 한 표, 자기 팀에는 못 넣음,
--      한 번 내면 못 바꿈. 화면은 아직 열지 않습니다(lib/crossingVote.ts).
--
-- 기존 표에는 열 하나(crossing_teams.track)만 더합니다. 멱등. RLS ON, 정책 0, 뷰는 anon/authenticated에서 거둡니다.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── 1. 팀의 트랙 ───────────────────────────────────────────────────────────────
alter table public.crossing_teams add column if not exists track text check (track is null or char_length(track) between 1 and 40);

-- ── 2. 멘토 칸: 한 팀 하루 두 칸 ─────────────────────────────────────────────────
create or replace function public.crossing_bookings_daily_limit()
  returns trigger language plpgsql as $$
begin
  -- 같은 팀과 날의 동시 삽입을 줄 세웁니다. 트랜잭션이 끝나면 풀립니다.
  perform pg_advisory_xact_lock(hashtext('crossing_booking:' || new.team_name || ':' || new.day));
  if (select count(*) from public.crossing_mentor_bookings where team_name = new.team_name and day = new.day) >= 2 then
    raise exception 'team_daily_limit' using errcode = 'P0001';
  end if;
  return new;
end $$;
revoke execute on function public.crossing_bookings_daily_limit() from public, anon, authenticated;

drop trigger if exists crossing_bookings_daily_limit on public.crossing_mentor_bookings;
create trigger crossing_bookings_daily_limit
  before insert on public.crossing_mentor_bookings
  for each row execute function public.crossing_bookings_daily_limit();

-- 누가 누구를 몇 번 만났는지. 팀과 날마다 칸 수와 멘토 이름.
create or replace view public.crossing_mentoring_counts as
  select b.team_name as team, b.day, count(*) as slots,
         string_agg(m.name || ' ' || to_char(b.starts_at at time zone 'Asia/Seoul', 'HH24:MI'), ', ' order by b.starts_at) as mentors
  from public.crossing_mentor_bookings b
  join public.crossing_mentors m on m.id = b.mentor_id
  group by b.team_name, b.day
  order by b.day, b.team_name;
alter view public.crossing_mentoring_counts set (security_invoker = on);
revoke select on public.crossing_mentoring_counts from anon, authenticated;

-- ── 3. 팀 짜기용 명단: 등록한 사람 + 유형 테스트 + 배정된 팀 ─────────────────────────
create or replace function public.crossing_norm_name(n text)
  returns text language sql immutable parallel safe
  as $$ select lower(regexp_replace(coalesce(n, ''), '\s+', '', 'g')) $$;
revoke execute on function public.crossing_norm_name(text) from public, anon, authenticated;

create or replace view public.crossing_matching_pool as
  with members as (
    select m.id as member_id, m.name, m.university, m.study_country, m.email,
           m.answers->>'major' as major, m.answers->>'ai_level' as ai_level,
           public.crossing_norm_name(m.name) as key,
           count(*) over (partition by public.crossing_norm_name(m.name)) as same_name
    from public.crossing_members m
    where m.event_slug = 'crossing-seoul-2026-12'
  )
  select mb.name, mb.university, mb.study_country, mb.major, mb.ai_level,
         p.model, p.role_key, p.mbti, p.identity, p.track_ranking,
         case when p.id is null then 'none'
              when mb.same_name > 1 and p.study_country is distinct from mb.study_country then 'ambiguous'
              when mb.same_name > 1 then 'name+country'
              else 'name' end as test_link,
         tm.team_name as team, t.track,
         mb.email, mb.member_id, p.id as match_profile_id
  from members mb
  left join lateral (
    select * from public.crossing_match_profiles p
    where p.event_slug = 'crossing-seoul-2026-12' and public.crossing_norm_name(p.name) = mb.key
    order by (p.study_country = mb.study_country) desc, p.updated_at desc
    limit 1
  ) p on true
  left join public.crossing_team_members tm on tm.member_id = mb.member_id
  left join public.crossing_teams t on t.name = tm.team_name
  order by tm.team_name nulls first, mb.study_country, mb.name;
alter view public.crossing_matching_pool set (security_invoker = on);
revoke select on public.crossing_matching_pool from anon, authenticated;

-- 테스트는 했는데 등록 명단에서 같은 이름을 못 찾은 사람(오타, 별명). 운영진이 손으로 맞춥니다.
create or replace view public.crossing_match_unlinked as
  select p.name, p.study_country, p.model, p.role_key, p.updated_at, p.id as match_profile_id
  from public.crossing_match_profiles p
  where p.event_slug = 'crossing-seoul-2026-12'
    and not exists (
      select 1 from public.crossing_members m
      where m.event_slug = 'crossing-seoul-2026-12' and public.crossing_norm_name(m.name) = public.crossing_norm_name(p.name)
    )
  order by p.updated_at desc;
alter view public.crossing_match_unlinked set (security_invoker = on);
revoke select on public.crossing_match_unlinked from anon, authenticated;

-- ── 인증 파일: 팀과 날마다 모든 제출과 가장 최근 것 ──────────────────────────────────
-- 파일은 Storage의 crossing-proofs/<storage_path>. 폴더 이름은 팀 이름의 해시라 이 뷰로 찾습니다.
create or replace view public.crossing_mission_files as
  select p.team_name as team, p.day, p.kind, p.created_at,
         row_number() over (partition by p.team_name, p.day, p.kind order by p.created_at desc) = 1 as latest,
         p.storage_path, p.size_bytes
  from public.crossing_mission_proofs p
  order by p.day, p.team_name, p.kind, p.created_at desc;
alter view public.crossing_mission_files set (security_invoker = on);
revoke select on public.crossing_mission_files from anon, authenticated;

-- ── 4. 인기투표 ────────────────────────────────────────────────────────────────
create table if not exists public.crossing_votes (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  event_slug    text not null default 'crossing-seoul-2026-12',
  track         text not null,
  device_token  uuid not null,
  -- 투표자의 팀. 신원이 아니라 자기 팀 배제용. 참가팀이 아니면 'NONE'.
  voter_team    text not null,
  choice        text not null references public.crossing_teams(name) on update cascade on delete cascade,
  ip_hash       text,
  check (choice <> voter_team),
  unique (event_slug, track, device_token)
);
create index if not exists crossing_votes_ip_hash_idx on public.crossing_votes (ip_hash, created_at desc);
alter table public.crossing_votes enable row level security;

create or replace view public.crossing_vote_tally as
  select v.track, v.choice as team, count(*) as votes
  from public.crossing_votes v
  where v.event_slug = 'crossing-seoul-2026-12'
  group by v.track, v.choice
  order by v.track, votes desc;
alter view public.crossing_vote_tally set (security_invoker = on);
revoke select on public.crossing_vote_tally from anon, authenticated;

comment on table public.crossing_votes is
  '크로싱 서울 마지막 날 트랙별 인기투표. 무기명, 기기 하나에 트랙마다 한 표, 자기 팀 제외, 수정 불가(8월 day8_votes와 같은 규칙).';
