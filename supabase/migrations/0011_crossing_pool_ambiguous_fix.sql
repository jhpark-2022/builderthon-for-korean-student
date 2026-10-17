-- ─────────────────────────────────────────────────────────────────────────────
-- 0011: 팀 짜기 명단(crossing_matching_pool)에서 같은 이름의 유형이 남의 줄에 붙던 것 (2026-10-17).
--
-- 전체 점검(사용자: "supabase 지금 내가 원했던 방향으로 다 작동하는지 모든걸 다 확인해") 중에 찾았습니다.
-- 같은 본명이 두 명(예: 한국 한 명, 싱가포르 한 명)이고 테스트는 한 명만 했을 때, 0010의 뷰는 테스트하지 않은 사람의 줄에도
-- 다른 사람의 유형을 붙이고 'ambiguous'라고만 표시했습니다. 운영진이 그 유형을 믿고 팀을 짜면 틀립니다.
-- 이제 같은 이름이 둘 이상이면 나라까지 맞는 테스트만 붙입니다. 나라로도 못 가리면 유형을 비우고 'ambiguous'로 둡니다.
-- 같은 이름이 하나뿐이면 지금처럼 이름만으로 잇습니다(나라를 잘못 골랐어도 이어지게).
-- 멱등(create or replace view, 열 이름과 순서는 0010과 같음).
-- ─────────────────────────────────────────────────────────────────────────────

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
         case when p.id is not null and mb.same_name > 1 then 'name+country'
              when p.id is not null then 'name'
              when mb.same_name > 1 and exists (
                select 1 from public.crossing_match_profiles x
                where x.event_slug = 'crossing-seoul-2026-12' and public.crossing_norm_name(x.name) = mb.key
              ) then 'ambiguous'
              else 'none' end as test_link,
         tm.team_name as team, t.track,
         mb.email, mb.member_id, p.id as match_profile_id
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
