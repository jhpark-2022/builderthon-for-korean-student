-- ─────────────────────────────────────────────────────────────────────────────
-- 0014: 인기투표를 트랙별로 차례로 엽니다 (2026-10-19).
--
-- DECIDED 2026-10-19 (사용자: "8월 달이랑 다른데? 그거랑 같이 맞춰줘", "트랙은 한번에 공개가 아니라, 발표할때 각 트랙별로
-- 점차 열리는 느낌"): 8월(lib/day8Vote.ts, 이제 git 이력)은 트랙마다 여는 시각과 닫는 시각이 있었고, 발표 순서대로 팀에 번호가
-- 붙었습니다. 8월에는 그 시각을 코드에 적어 당일 아침에 고쳐 배포했습니다. 12월은 표 편집기에서 바꿉니다.
--   1. crossing_tracks.vote_opens_at, vote_closes_at: 비어 있으면 열리지 않음. 발표가 끝나면 vote_opens_at에 지금 시각을 넣습니다
--      (표 편집기에서 now()). 미리 시각을 적어 둘 수도 있습니다. vote_closes_at이 지나면 마감. 비어 있으면 닫지 않습니다.
--   2. crossing_teams.present_order: 그 트랙 안의 발표 순서(1부터). 투표 화면의 번호와 순서입니다. 비어 있으면 이름 순으로 뒤에.
-- 표의 행은 고치지 않습니다. 멱등. RLS 그대로.
-- ─────────────────────────────────────────────────────────────────────────────

alter table public.crossing_tracks add column if not exists vote_opens_at timestamptz;
alter table public.crossing_tracks add column if not exists vote_closes_at timestamptz;
alter table public.crossing_tracks drop constraint if exists crossing_tracks_vote_window_check;
alter table public.crossing_tracks
  add constraint crossing_tracks_vote_window_check
  check (vote_closes_at is null or vote_opens_at is null or vote_closes_at > vote_opens_at);
comment on column public.crossing_tracks.vote_opens_at is
  '이 트랙 인기투표가 열리는 시각. 비어 있으면 닫혀 있음. 발표가 끝나면 now()를 넣습니다(2026-10-19).';
comment on column public.crossing_tracks.vote_closes_at is
  '이 트랙 인기투표가 닫히는 시각. 비어 있으면 닫지 않음(2026-10-19).';

alter table public.crossing_teams add column if not exists present_order smallint;
alter table public.crossing_teams drop constraint if exists crossing_teams_present_order_check;
alter table public.crossing_teams add constraint crossing_teams_present_order_check check (present_order is null or present_order > 0);
comment on column public.crossing_teams.present_order is
  '그 트랙 안의 발표 순서(1부터). 인기투표 화면의 번호와 순서(2026-10-19). 비어 있으면 이름 순으로 뒤에.';
