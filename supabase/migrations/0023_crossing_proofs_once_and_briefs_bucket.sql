-- ─────────────────────────────────────────────────────────────────────────────
-- 0023 미션 인증의 "한 번만"을 DB에서도 막고, 이슈 브리프 버킷을 마이그레이션에 적습니다 (2026-11-13).
--
-- DECIDED 2026-11-13 (사용자, docs/proofs-once-brief.md):
--  P1 2026-10-26의 "업로드는 한 번만"(팀, 날, 종류마다)은 라우트(/api/crossing/proofs)만 지켰습니다. 같은 팀의 confirm 둘이
--     동시에 오면 둘 다 확인을 지나 두 행이 들어갈 수 있었습니다. 유니크 인덱스 crossing_mission_proofs_once가 둘째 행을 막습니다.
--     라우트가 이 이름으로 already를 알아봅니다. 이름을 바꾸면 라우트도 같이 바꿉니다.
--  P2 멘토 전용 이슈 브리프 버킷(crossing-issue-briefs)은 scripts/issue-briefs.mjs가 처음 올릴 때에야 생겼습니다. 0008의
--     crossing-proofs처럼 여기에 적어 둡니다. 값은 스크립트와 같습니다(비공개, 25MB, PDF와 index.json).
-- 여러 번 돌려도 같은 결과입니다.
--
-- 적용 전 확인: 같은 팀, 날, 종류의 행이 둘 이상이면 인덱스가 만들어지지 않습니다(2026-11-13 적용 때 인증 행은 0건).
--   select team_name, day, kind, count(*) from public.crossing_mission_proofs group by 1, 2, 3 having count(*) > 1;
-- ─────────────────────────────────────────────────────────────────────────────

-- P1: 팀, 날, 종류마다 한 행.
create unique index if not exists crossing_mission_proofs_once
  on public.crossing_mission_proofs (team_name, day, kind);

-- P2: 비공개 버킷. 25MB, PDF와 목록(index.json). 정책 0개라 서명 URL로만 오갑니다.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('crossing-issue-briefs', 'crossing-issue-briefs', false, 26214400,
        array['application/pdf', 'application/json'])
on conflict (id) do nothing;
