-- ─────────────────────────────────────────────────────────────────────────────
-- 0024: 둘이 한 팀으로 등록한 사람을 팀 짜기 명단에서 바로 보이게 (2026-11-14).
--
-- 사용자: "8월달 참고해줘, 혼자해도 되고, team of two 로도 할 수 있도록". 등록 폼이 참가 형태(혼자, 둘이 한 팀)를 다시 묻습니다.
-- 표는 이미 받을 수 있습니다(0004): crossing_registrations.join_type의 check가 solo, team이고 crossing_members.ordinal은 1~3.
-- 둘이 한 팀이면 한 등록에 ordinal 1(등록자)과 2(팀원) 두 행이 들어갑니다. 표 변경은 없습니다.
--
-- 바꾸는 것은 뷰 하나입니다. crossing_matching_pool(0011) 끝에 pair_with(같은 등록의 다른 사람 이름)를 더합니다.
-- Day 1에 운영진이 이 명단으로 팀을 짤 때 둘을 같은 팀에 넣으려고 봅니다. 혼자 온 사람은 null.
-- 기존 열의 이름과 순서는 0011과 같고 끝에만 더합니다(create or replace view가 허용하는 형태). 보안 설정도 같습니다. 멱등.
-- crossing_participants 뷰는 이미 join_type과 ordinal을 보여 주므로 그대로입니다.
-- ─────────────────────────────────────────────────────────────────────────────

create or replace view public.crossing_matching_pool as
  with members as (
    select m.id as member_id, m.registration_id, m.name, m.university, m.study_country, m.email,
           m.answers->>'major' as major, m.answers->>'ai_level' as ai_level,
           public.crossing_norm_name(m.name) as key,
           count(*) over (partition by public.crossing_norm_name(m.name)) as same_name
    from public.crossing_members m
    where m.event_slug = 'crossing-seoul-2026-12'
  )
  select mb.name, mb.university, mb.study_country, mb.major, mb.ai_level,
         p.model, p.role_key, p.mbti, p.identity, p.track_ranking,
         case when p.id is not null and mb.same_name > 1 then 'name+country'
              when p.id is not null then 'name'
              when mb.same_name > 1 and exists (
                select 1 from public.crossing_match_profiles x
                where x.event_slug = 'crossing-seoul-2026-12' and public.crossing_norm_name(x.name) = mb.key
              ) then 'ambiguous'
              else 'none' end as test_link,
         tm.team_name as team, t.track,
         mb.email, mb.member_id, p.id as match_profile_id,
         (select string_agg(o.name, ', ' order by o.ordinal)
            from public.crossing_members o
           where o.registration_id = mb.registration_id and o.id <> mb.member_id) as pair_with
  from members mb
  left join lateral (
    select * from public.crossing_match_profiles p
    where p.event_slug = 'crossing-seoul-2026-12' and public.crossing_norm_name(p.name) = mb.key
      and (mb.same_name = 1 or p.study_country = mb.study_country)
    order by (p.study_country = mb.study_country) desc, p.updated_at desc
    limit 1
  ) p on true
  left join public.crossing_team_members tm on tm.member_id = mb.member_id
  left join public.crossing_teams t on t.name = tm.team_name
  order by tm.team_name nulls first, mb.study_country, mb.name;
alter view public.crossing_matching_pool set (security_invoker = on);
revoke select on public.crossing_matching_pool from anon, authenticated;
