-- ─────────────────────────────────────────────────────────────────────────────
-- 0009: Day 1 미션 인증 (2026-10-17).
--
-- DECIDED 2026-10-17 (사용자: "1일차에도 미션인증은 해야해서", "Day 1에는 PDF 하나만"): 인증 파일은 Day 1, 2, 3에 받고,
-- Day 1은 PDF만입니다(이슈에 대한 팀의 생각 1장). 시간표 칸(crossing_mentor_bookings, windows)은 그대로 Day 2, 3뿐입니다.
-- 0008의 day check(2, 3)을 바꿉니다. 멱등.
-- ─────────────────────────────────────────────────────────────────────────────

alter table public.crossing_mission_proofs drop constraint if exists crossing_mission_proofs_day_check;
alter table public.crossing_mission_proofs drop constraint if exists crossing_mission_proofs_day1_pdf;
alter table public.crossing_mission_proofs
  add constraint crossing_mission_proofs_day_check check (day in (1, 2, 3)),
  add constraint crossing_mission_proofs_day1_pdf check (day <> 1 or kind = 'pdf');
