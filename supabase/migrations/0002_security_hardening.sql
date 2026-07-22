-- ─────────────────────────────────────────────────────────────────────────────
-- Zero100 Builderthon — 등록 보안 강화.
--
-- Context: the registration link is about to be posted into Korean-association
-- group chats, i.e. the first time /api/register is exposed to a wide, untrusted
-- audience. Two gaps this closes:
--
--   1. No per-IP throttle. The route would happily accept an unbounded flood,
--      and the participant list is the one thing here that can't be un-poisoned
--      cheaply — organizers would have to hand-sort real students out of junk.
--   2. `registration_participants` is a plain view, so it runs with the
--      DEFINER's privileges and reads straight past RLS on the tables beneath
--      it. Any role holding SELECT on the view could read every registrant's
--      email and KakaoTalk id. Supabase's advisor flags this as CRITICAL.
--
-- Safe to re-run: every statement is idempotent.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── 1 · Throttle bookkeeping ────────────────────────────────────────────────
-- A SALTED HASH of the submitter's IP, never the IP itself. It exists only to
-- answer "has this same origin submitted N times in the last M minutes"; it is
-- not reversible to an address and is not a stable cross-project identifier.
-- See app/api/register/route.ts for how the salt is derived.
alter table public.registrations
  add column if not exists ip_hash text;

comment on column public.registrations.ip_hash is
  'Salted SHA-256 of the submitter IP. Rate-limiting only — never the raw IP.';

-- The throttle asks exactly one question: recent rows for this hash, newest
-- first. Composite index in that shape so the check stays cheap under a flood,
-- which is precisely when it must not become the bottleneck.
create index if not exists registrations_ip_hash_created_idx
  on public.registrations (ip_hash, created_at desc);

-- ── 2 · Close the view's RLS bypass (advisor: CRITICAL) ─────────────────────
-- security_invoker makes the view execute as the CALLER, so the deny-all RLS on
-- registrations / registration_members applies through it like anywhere else.
alter view public.registration_participants set (security_invoker = on);

-- Belt and braces: even with security_invoker on, nothing should be handing
-- this view out to the browser roles. The route handler uses service_role,
-- which bypasses both grants and RLS, so revoking these costs us nothing.
revoke select on public.registration_participants from anon, authenticated;
