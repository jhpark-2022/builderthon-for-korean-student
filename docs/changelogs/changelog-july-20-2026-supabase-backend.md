# Changelog — July 20, 2026 (Supabase 등록 백엔드)

**Project:** Builderthon marketing site (Next.js)
**Branch:** `main`
**Window covered:** wiring the 빌더톤 등록 form to a real datastore — it had been
posting nowhere since the form shipped on July 18.

## Summary

`등록하기` now actually persists. The RegisterModal POSTs to a first-party route
handler (`/api/register`), which re-validates the payload server-side and writes
it to Supabase (project `korean builderthon`, ap-northeast-2) as one
`registrations` row plus one `registration_members` row per person.

The schema is deliberately relational rather than a JSONB blob: the operational
need is a **participant** list — names, emails, and Telegram IDs for the
group-chat invite — not just a list of teams.

Row-level security is enabled on both tables with **zero policies**, so anon and
authenticated clients can do nothing at all. Every write goes through the route
handler using the `service_role` key, which never leaves the server.

## Changes

- **`supabase/migrations/0001_registrations.sql`** (new) — `registrations`
  (join_type, team_name, wants_matching, track, quiz_type, ref, submitted_at)
  and `registration_members` (ordinal 1–3, name, email, contact, university,
  linkedin), the child cascading on parent delete with a
  `unique (registration_id, ordinal)`. Indexes cover the two lookups an
  organizer actually runs: find-by-email (`lower(email)`) and newest-first.
  A `registration_participants` view flattens both tables to one row per person
  with team context attached.
- **`lib/supabaseAdmin.ts`** (new) — cached `service_role` client. Imports
  `server-only` so a `"use client"` component importing it fails the build, and
  the key env var deliberately has no `NEXT_PUBLIC_` prefix so Next can't inline
  it into a client bundle. Returns `null` when unconfigured rather than throwing,
  which the route surfaces as a `503 not_configured`.
- **`app/api/register/route.ts`** (new) — `POST` only, `force-dynamic`. Re-runs
  every check the client already did (never trust client-side validation):
  required fields, email format, in-payload duplicate emails, 1–3 members,
  team name required for teams, extra members rejected for solo, 200-char caps
  on all text. `wants_matching` is forced false for teams regardless of what the
  payload claims. If the members INSERT fails, the parent row is deleted so a
  registration with no people never lingers.
- **`data/dictionary.ts`** — `REGISTER_ENDPOINT` → `"/api/register"`. Setting it
  back to `""` still restores the offline console.info simulation. Added
  `register.errSubmit` (ko/en).
- **`components/RegisterModal.tsx`** — **bug fix, not just wiring.** The submit
  handler caught fetch failures and showed the success screen anyway
  (`"submit failed, showing success anyway"`), and it never checked `res.ok`.
  Harmless against a no-op endpoint; against a real database it would drop
  registrations silently while telling the participant they were signed up. Now
  only a 2xx advances to success — anything else returns to the still-filled
  form with an inline `role="alert"` retry message.
- **`.env.local.example`** (new), **`.gitignore`** — documents the two env vars
  and their server-only/public split; `.claude` added to the ignore list.

## Verification

- `npx tsc --noEmit` — clean.
- Migration applied via Supabase CLI (`supabase link` + `db push`). All three
  relations confirmed reachable (`registrations`, `registration_members`,
  `registration_participants` → 200 over REST).
- Local E2E against `next dev` on :3999, all test rows named `TEST-DELETE-ME`:
  - **Team of 3** → `201` + id. REST read-back confirmed ordinals 1–3 with the
    registrant at 1, optional `linkedin` null where omitted, `wants_matching`
    false, `submitted_at` round-tripped.
  - **Solo + matching** → `201` + id, with `wants_matching: true`,
    `quiz_type: "ESTP-T"`, `ref: "quiz"`, `team_name` null.
  - **Missing email** → `400 {"error":"missing_fields","ordinal":1}`.
  - `registration_participants` returned all 4 people with team context.
  - Cleanup: both parent rows deleted; `registrations` and
    `registration_members` both back to 0 rows (cascade confirmed).
- Production: `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
  (sensitive) added to both Production and Preview.

**Notes:**
- The repo's Vercel link was stale — `.vercel/project.json` pointed at a project
  named `website` under an inaccessible team. Relinked to
  `old-fashioned1/builderthon-for-korean-student`, which had **no** environment
  variables set at all.
- No rate limiting or spam protection on `/api/register` yet. The route is a
  public unauthenticated write endpoint; before wide promotion it should get
  BotID, a rate limit, or a captcha.
