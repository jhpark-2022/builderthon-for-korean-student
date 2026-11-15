-- ─────────────────────────────────────────────────────────────────────────────
-- 0025: 12월 신청자를 한 화면에서 보는 뷰 crossing_applicants (2026-11-15).
--
-- DECIDED 2026-11-15 (사용자: "이름. 이메일, 카톡 아이디, 학교이름, 공부하는 나라, 전공, AI 0123, team code, linkedin
-- 이거대로 한번에 볼 수 있게"): 열은 이 순서 그대로입니다.
-- crossing_participants(0004, 0005)는 고치지 않습니다. scripts/build-crossing-roster.py가 select=*로 읽고 있고,
-- 열 순서를 바꾸려면 drop view가 필요해서입니다. 이 뷰는 새로 더하는 것이라 기존 표와 뷰에 닿는 문장 0개.
--
-- team_code: 등록 폼에는 팀 코드가 없습니다(0024: 둘이 한 팀이면 한 등록에 두 사람). 둘이 한 팀으로 온 두 사람이
-- 같은 값을 갖도록 등록 id의 앞 6자리를 대문자로 씁니다. 혼자 온 사람은 비어 있습니다(null).
-- Day 1에 운영진이 짠 팀은 crossing_matching_pool의 team 열입니다(이 값과 다릅니다).
-- ai_level: 폼의 번호(data/crossingForm.ts, firstStep 0) none 0, chat 1, agent 2, terminal 3, connect 4.
-- 팀원은 AI 질문을 받지 않아(2026-11-14 TEAMMATE_SKIP) 비어 있습니다.
-- study_country: 기타를 고른 사람은 표의 열이 null이고 적은 나라 이름이 answers.study_country_other에 있어 그 이름을 씁니다.
-- 보안 설정은 0004와 같습니다. 멱등.
-- ─────────────────────────────────────────────────────────────────────────────

create or replace view public.crossing_applicants as
  select
    m.name,
    m.email,
    m.contact as kakao_id,
    m.university,
    coalesce(m.study_country, nullif(m.answers->>'study_country_other', '')) as study_country,
    m.answers->>'major' as major,
    case m.answers->>'ai_level'
      when 'none' then 0 when 'chat' then 1 when 'agent' then 2
      when 'terminal' then 3 when 'connect' then 4
    end as ai_level,
    case when r.join_type = 'team' then upper(left(r.id::text, 6)) end as team_code,
    m.linkedin
  from public.crossing_members m
  join public.crossing_registrations r on r.id = m.registration_id
  where m.event_slug = 'crossing-seoul-2026-12'
  order by r.created_at, m.ordinal;

alter view public.crossing_applicants set (security_invoker = on);
revoke select on public.crossing_applicants from anon, authenticated;
grant select on public.crossing_applicants to service_role;
