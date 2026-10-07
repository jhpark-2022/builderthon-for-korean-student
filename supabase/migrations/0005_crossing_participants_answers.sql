-- ─────────────────────────────────────────────────────────────────────────────
-- 0005: 크로싱 신청의 전공과 AI 단계를 뷰에서 바로 보이게 (2026-10-07). 표는 그대로.
--
-- 두 답은 crossing_members.answers(jsonb)에 major, ai_level 키로 들어 있습니다
-- (data/crossingForm.ts). 운영자가 뷰에서 jsonb를 펼치지 않고 바로 보도록 끝에 두 열을 더합니다.
-- 표 변경이 아니라 뷰 교체입니다. 기존 열의 순서와 이름은 그대로이고 끝에만 더합니다
-- (create or replace view가 허용하는 형태). 보안 설정은 0004와 같습니다.
-- 8월 표와 뷰에 닿는 문장 0개. 멱등.
-- 적용: 대시보드 SQL 에디터, 또는 `supabase db push`.
-- ─────────────────────────────────────────────────────────────────────────────

create or replace view public.crossing_participants as
  select
    m.id as member_id, r.id as registration_id, r.event_slug, r.created_at,
    r.join_type, r.team_name, r.wants_matching, r.consent_at,
    m.ordinal, m.name, m.email, m.contact, m.university, m.study_country, m.linkedin,
    r.answers as registration_answers, m.answers as member_answers,
    m.answers->>'major'    as major,
    m.answers->>'ai_level' as ai_level
  from public.crossing_members m
  join public.crossing_registrations r on r.id = m.registration_id
  order by r.created_at desc, m.ordinal;

alter view public.crossing_participants set (security_invoker = on);
revoke select on public.crossing_participants from anon, authenticated;
