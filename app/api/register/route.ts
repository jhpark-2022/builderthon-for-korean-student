// ─────────────────────────────────────────────────────────────────────────────
// POST /api/register — persists a 빌더톤 registration to Supabase.
//
// The browser posts the RegisterModal payload here; this route re-validates it
// server-side (never trust the client's own validation) and writes two rows sets:
// one `registrations` row plus one `registration_members` row per person.
//
// The service_role key stays on the server — see lib/supabaseAdmin.ts.
// ─────────────────────────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { normalizeTelegramHandle } from "@/lib/telegram";

// Uses a secret + a live DB → must not be statically evaluated at build time.
export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_MEMBERS = 3;
// Generous caps that still stop someone pasting a novel into a text input.
const MAX_LEN = 200;

type Json = Record<string, unknown>;

/** Trim + length-cap a value that must be a non-empty string. */
function str(v: unknown): string {
  return typeof v === "string" ? v.trim().slice(0, MAX_LEN) : "";
}
/** Same, but empty → null (for the optional columns). */
function optStr(v: unknown): string | null {
  return str(v) || null;
}

export async function POST(req: Request) {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    console.error("[register] Supabase env missing — set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  let body: Json;
  try {
    body = (await req.json()) as Json;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  // ── Validate ───────────────────────────────────────────────────────────────
  const rawMembers = Array.isArray(body.members) ? body.members : [];
  if (rawMembers.length === 0 || rawMembers.length > MAX_MEMBERS) {
    return NextResponse.json({ error: "invalid_members" }, { status: 400 });
  }

  const members = rawMembers.map((m, i) => {
    const src = (m ?? {}) as Json;
    return {
      ordinal: i + 1,
      name: str(src.name),
      email: str(src.email),
      // A Telegram handle in any form (@user, t.me/user) is stored canonicalised
      // as "@user"; anything else is kept verbatim rather than rejected — we ask
      // for a handle in the form copy, we don't refuse the registration over it.
      contact: normalizeTelegramHandle(str(src.contact)) ?? str(src.contact),
      university: optStr(src.university),
      linkedin: optStr(src.linkedin),
    };
  });

  for (const m of members) {
    if (!m.name || !m.email || !m.contact) {
      return NextResponse.json({ error: "missing_fields", ordinal: m.ordinal }, { status: 400 });
    }
    if (!EMAIL_RE.test(m.email)) {
      return NextResponse.json({ error: "invalid_email", ordinal: m.ordinal }, { status: 400 });
    }
  }

  // Duplicate emails within one submission — the form blocks this, so a hit here
  // means a hand-rolled request.
  const emails = members.map((m) => m.email.toLowerCase());
  if (new Set(emails).size !== emails.length) {
    return NextResponse.json({ error: "duplicate_email" }, { status: 400 });
  }

  const joinType = str(body.joinType);
  const isTeam = joinType === "team";
  if (joinType && joinType !== "team" && joinType !== "solo") {
    return NextResponse.json({ error: "invalid_join_type" }, { status: 400 });
  }
  if (isTeam && !str(body.teamName)) {
    return NextResponse.json({ error: "missing_team_name" }, { status: 400 });
  }
  // Only a team submits extra members.
  if (!isTeam && members.length > 1) {
    return NextResponse.json({ error: "invalid_members" }, { status: 400 });
  }

  const submittedAt = typeof body.submittedAt === "string" && !Number.isNaN(Date.parse(body.submittedAt))
    ? body.submittedAt
    : null;

  // ── Insert ─────────────────────────────────────────────────────────────────
  const { data: reg, error: regErr } = await supabase
    .from("registrations")
    .insert({
      join_type: joinType || null,
      team_name: isTeam ? str(body.teamName) : null,
      // Matching is solo-only; a team payload claiming otherwise is ignored.
      wants_matching: !isTeam && body.wantsMatching === true,
      track: optStr(body.track),
      quiz_type: optStr(body.quizType),
      ref: optStr(body.ref),
      submitted_at: submittedAt,
    })
    .select("id")
    .single();

  if (regErr || !reg) {
    console.error("[register] registrations insert failed:", regErr);
    return NextResponse.json({ error: "db_error" }, { status: 500 });
  }

  const { error: memErr } = await supabase
    .from("registration_members")
    .insert(members.map((m) => ({ ...m, registration_id: reg.id })));

  if (memErr) {
    // Roll back the parent so a half-written registration never lingers — no
    // members means no participant list entry, which would be worse than none.
    console.error("[register] members insert failed, rolling back:", memErr);
    await supabase.from("registrations").delete().eq("id", reg.id);
    return NextResponse.json({ error: "db_error" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, id: reg.id }, { status: 201 });
}
