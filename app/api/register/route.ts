// ─────────────────────────────────────────────────────────────────────────────
// POST /api/register — persists a 빌더톤 registration to Supabase.
//
// The browser posts the RegisterModal payload here; this route re-validates it
// server-side (never trust the client's own validation) and writes two rows sets:
// one `registrations` row plus one `registration_members` row per person.
//
// The service_role key stays on the server — see lib/supabaseAdmin.ts.
// ─────────────────────────────────────────────────────────────────────────────

import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { normalizeKakaoId } from "@/lib/kakao";

// Uses a secret + a live DB → must not be statically evaluated at build time.
export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_MEMBERS = 3;

// ── Throttle limits ─────────────────────────────────────────────────────────
// Tuned to be USELESS against a real student and painful for a script. The
// binding constraint is a campus shared IP: at an info session a whole room can
// register from one NAT'd address within minutes, and locking that out would
// cost far more than the spam it prevents. Hence limits an individual will
// never reach and a flood always will. Adjust here — nothing else reads these.
const PER_IP_SHORT = { minutes: 10, max: 10 };
const PER_IP_LONG = { minutes: 60, max: 30 };
// Circuit breaker across ALL submitters: if the whole table is moving this
// fast, something automated is running regardless of source address.
const GLOBAL = { minutes: 10, max: 120 };
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

/**
 * Salted, one-way fingerprint of the submitter's IP.
 *
 * The raw address never reaches the database. The salt is derived from
 * SUPABASE_SERVICE_ROLE_KEY rather than a new env var: it is already required
 * for this route to function at all, is server-only, and rotating it (which is
 * what you'd do after a leak) invalidates every stored hash — exactly the
 * behaviour you want. The hash is therefore meaningless outside this
 * deployment and cannot be used to correlate a person across projects.
 */
function hashIp(ip: string, secret: string): string {
  return createHash("sha256").update(`${secret}::ip-salt::${ip}`).digest("hex");
}

/**
 * Best-effort client IP. `x-forwarded-for` is a comma-separated chain appended
 * to by each proxy, so the ORIGINAL client is the first entry. Behind Vercel
 * this header is set by the platform; locally it's usually absent, which is why
 * an unknown IP still gets throttled — under one shared "unknown" bucket. That
 * is deliberate: failing open here would make the limiter trivially bypassable
 * by anyone who can strip a header.
 */
function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) {
    const first = fwd.split(",")[0]?.trim();
    if (first) return first;
  }
  return req.headers.get("x-real-ip")?.trim() || "unknown";
}

/**
 * Name/email pairs straight off an unvalidated body, for the honeypot log only.
 * Deliberately tolerant: the whole point is to describe a submission we are
 * about to throw away, so it must not throw on a malformed payload.
 */
function rawMembersPreview(body: Json): { name: string; email: string }[] | null {
  if (!Array.isArray(body.members)) return null;
  return body.members.slice(0, MAX_MEMBERS).map((m) => {
    const src = (m ?? {}) as Json;
    return { name: str(src.name), email: str(src.email) };
  });
}

const sinceIso = (minutes: number) =>
  new Date(Date.now() - minutes * 60_000).toISOString();

export async function POST(req: Request) {
  const supabase = getSupabaseAdmin();
  // Read directly rather than exporting it from supabaseAdmin: this is the only
  // consumer, and the value is used here purely as hash salt (see hashIp).
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabase || !serviceKey) {
    console.error("[register] Supabase env missing — set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  let body: Json;
  try {
    body = (await req.json()) as Json;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  // ── Honeypot ───────────────────────────────────────────────────────────────
  // `url_confirm` is rendered off-screen with tabIndex={-1} and aria-hidden, so
  // no human is offered it. Anything in it came from a form-filling script —
  // or, the case we actually have to plan for, an over-eager password manager.
  //
  // The response is a NORMAL-LOOKING 201 with a random id. Returning 400 would
  // tell the author exactly which field tripped them, and they'd remove it and
  // retry within the hour; a silent accept costs them nothing to keep sending
  // and us nothing to keep discarding.
  //
  // BUT that same silence is dangerous for a false positive: the visitor sees
  // "등록 완료" and never appears on the list. So log enough to tell the two
  // apart and to reach the person if it was real. Yes, this puts a name and an
  // email in the server log — that is the point. Casino-spam is obvious at a
  // glance; a Korean name with an .edu address is a student to go and re-register
  // by hand. Without this the mistake is undetectable AND unrecoverable.
  const honeypot = str(body.url_confirm);
  if (honeypot) {
    const who = (rawMembersPreview(body) ?? []).map((m) => `${m.name} <${m.email}>`).join(", ");
    console.warn(
      `[register] honeypot tripped — discarded. field=${JSON.stringify(honeypot.slice(0, 120))} submitter=${who || "(no member data)"}`
    );
    return NextResponse.json({ ok: true, id: crypto.randomUUID() }, { status: 201 });
  }

  // ── Throttle ───────────────────────────────────────────────────────────────
  // Counted BEFORE any write, so a rejected burst leaves no rows behind.
  const ipHash = hashIp(clientIp(req), serviceKey);

  const [shortWindow, longWindow, globalWindow] = await Promise.all([
    supabase
      .from("registrations")
      .select("id", { count: "exact", head: true })
      .eq("ip_hash", ipHash)
      .gte("created_at", sinceIso(PER_IP_SHORT.minutes)),
    supabase
      .from("registrations")
      .select("id", { count: "exact", head: true })
      .eq("ip_hash", ipHash)
      .gte("created_at", sinceIso(PER_IP_LONG.minutes)),
    supabase
      .from("registrations")
      .select("id", { count: "exact", head: true })
      .gte("created_at", sinceIso(GLOBAL.minutes)),
  ]);

  // A failed COUNT must not block registration — the limiter is a guard rail,
  // not a gate. If Supabase can't answer, the insert below will fail loudly on
  // its own if the database is genuinely down.
  if ((shortWindow.count ?? 0) >= PER_IP_SHORT.max || (longWindow.count ?? 0) >= PER_IP_LONG.max) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }
  if ((globalWindow.count ?? 0) >= GLOBAL.max) {
    // Loud on purpose: this one fires only when the whole endpoint is under
    // load no organic audience produces.
    console.error(
      `[register] GLOBAL RATE LIMIT HIT — ${globalWindow.count} registrations in ${GLOBAL.minutes}m. Possible attack.`
    );
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
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
      // A KakaoTalk id in any form (@me, "카톡: me", stray case) is stored
      // canonicalised as the bare lowercase id; anything else is kept verbatim
      // rather than rejected — we ask for an id in the form copy, we don't
      // refuse the registration over it.
      contact: normalizeKakaoId(str(src.contact)) ?? str(src.contact),
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
      ip_hash: ipHash,
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
