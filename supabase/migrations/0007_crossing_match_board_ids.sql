-- ─────────────────────────────────────────────────────────────────────────────
-- 0007: 매칭판 뷰에 id와 created_at을 더합니다 (2026-10-08, 퀴즈와 매칭 리뷰 3).
--
-- 한 사람이 카카오톡 인앱 브라우저와 Safari에서 각각 올리면 기기 토큰이 달라 두 행이 됩니다. 매칭판 스크립트
-- (scripts/build-match-board.py)가 같은 이름과 나라의 행 가운데 가장 새것만 남기는데, 어느 행이 어느 것인지
-- 가리키려면 id가, 처음 올린 때를 보려면 created_at이 필요합니다. 스크립트는 이 두 열이 없어도 돕니다.
--
-- create or replace view는 열을 끝에만 더할 수 있어 두 열을 맨 뒤에 둡니다. 기존 열의 이름과 순서는 그대로.
-- 표(crossing_match_profiles)에 닿는 문장 0개. 멱등. 0005와 같이 security_invoker와 권한을 다시 겁니다.
-- 적용: 대시보드 SQL 에디터, 또는 `supabase db push`. 2026-10-09에 `supabase db push`로 프로덕션에 적용했습니다.
-- ─────────────────────────────────────────────────────────────────────────────

create or replace view public.crossing_match_board as
  select name, study_country, mbti, identity, model, role_key, updated_at, track_ranking, id, created_at
  from public.crossing_match_profiles
  where event_slug = 'crossing-seoul-2026-12'
  order by role_key, study_country, name;
alter view public.crossing_match_board set (security_invoker = on);
revoke select on public.crossing_match_board from anon, authenticated;
