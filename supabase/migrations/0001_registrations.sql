-- ─────────────────────────────────────────────────────────────────────────────
-- Zero100 Builderthon — 등록 (registration) storage.
--
-- Two tables, because the operational need is a *participant* list (emails and
-- Telegram IDs for the group-chat invite), not just a list of teams:
--   registrations         — one row per submitted form (a team or a solo entry)
--   registration_members  — one row per person; ordinal 1 is the registrant
--
-- RLS is ON with NO policies → anon/authenticated clients can do nothing at all.
-- Writes happen only through /api/register using the service_role key, which
-- bypasses RLS. Never expose service_role to the browser.
-- ─────────────────────────────────────────────────────────────────────────────

create extension if not exists "pgcrypto";

create table if not exists public.registrations (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),

  -- "team" | "solo" | null (the field is optional in the form)
  join_type     text check (join_type in ('team', 'solo')),
  team_name     text,
  -- Solo only: opted into being matched with other solo builders.
  wants_matching boolean not null default false,
  -- "finance" | "sales" | "marketing" | "unsure" | '' — kept as free text so a
  -- new track option in the UI never breaks a submit.
  track         text,
  -- Quiz result id ("ESTP-T"), attached only for a solo matcher who confirmed it.
  quiz_type     text,
  -- Referrer captured from ?ref= ("quiz" | "quiz-return" | null).
  ref           text,
  -- Client-reported submit time; created_at stays the server-side truth.
  submitted_at  timestamptz
);

create table if not exists public.registration_members (
  id              uuid primary key default gen_random_uuid(),
  registration_id uuid not null references public.registrations(id) on delete cascade,
  -- 1 = the registrant, 2..3 = added teammates. Matches the form's numbering.
  ordinal         smallint not null check (ordinal between 1 and 3),

  name            text not null,
  email           text not null,
  contact         text not null,
  university      text,
  linkedin        text,

  unique (registration_id, ordinal)
);

-- The two lookups an organizer actually runs: "find this person by email" and
-- "list registrations newest first".
create index if not exists registration_members_email_idx
  on public.registration_members (lower(email));
create index if not exists registrations_created_at_idx
  on public.registrations (created_at desc);

-- Deny-all: RLS enabled, zero policies. Only service_role reaches these tables.
alter table public.registrations        enable row level security;
alter table public.registration_members enable row level security;

-- Convenience view for the organizer — one row per person, with team context.
create or replace view public.registration_participants as
  select
    m.id            as member_id,
    r.id            as registration_id,
    r.created_at,
    r.join_type,
    r.team_name,
    r.wants_matching,
    r.track,
    r.quiz_type,
    m.ordinal,
    m.name,
    m.email,
    m.contact,
    m.university,
    m.linkedin
  from public.registration_members m
  join public.registrations r on r.id = m.registration_id
  order by r.created_at desc, m.ordinal;
