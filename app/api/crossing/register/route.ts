// ─────────────────────────────────────────────────────────────────────────────
// POST /api/crossing/register — 크로싱 서울 등록을 Supabase에 씁니다.
// (2026-09-18, Supabase 등록 브리프 2.2). 8월 라우트(/api/register)와 별개이고
// 공통 로직은 lib/register/shared.ts에서 가져옵니다.
//
// 흐름: 창 확인 → 허니팟 → IP 스로틀(crossing_registrations 기준) → 스키마 검증 →
// 동의 → crossing_registrations 삽입 → crossing_members 삽입(event_slug 함께) →
// 23505면 409 already_registered(부모 행 정리).
// ─────────────────────────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { normalizeKakaoId } from "@/lib/kakao";
import { CURRENT_EVENT, registrationState } from "@/lib/registrationWindow";
import {
  MAX_MEMBERS, PER_IP_SHORT, PER_IP_LONG, GLOBAL,
  type Json, str, optStr, hashIp, clientIp, rawMembersPreview, sinceIso, throttleVerdict,
} from "@/lib/register/shared";
import { CROSSING_FORM, MEMBER_FIELDS, REGISTRATION_FIELDS, MAX_TEXTAREA, validateField } from "@/data/crossingForm";

export const dynamic = "force-dynamic";

const TABLE = "crossing_registrations";
const MEMBERS = "crossing_members";

/** 스키마의 키만 남기고 문자열로 정리한 answers. 모르는 키는 버리고 로그만. */
function pickAnswers(src: Json, scope: "registration" | "member"): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  const known = new Set(CROSSING_FORM.filter((f) => f.scope === scope).map((f) => f.key));
  const dropped: string[] = [];
  for (const [k, v] of Object.entries(src)) {
    if (!known.has(k)) { dropped.push(k); continue; }
    const f = CROSSING_FORM.find((x) => x.key === k)!;
    if (f.fixed) continue; // 고정 열은 따로 갑니다
    out[k] = f.type === "checkbox" ? v === true : str(v, f.maxLen ?? (f.type === "textarea" ? MAX_TEXTAREA : undefined));
  }
  if (dropped.length) console.warn(`[crossing/register] unknown ${scope} answer keys dropped: ${dropped.join(", ")}`);
  return out;
}

export async function POST(req: Request) {
  // ── 창 ─────────────────────────────────────────────────────────────────
  const state = registrationState(CURRENT_EVENT);
  if (state !== "open") {
    return NextResponse.json({ error: state === "closed" ? "registration_closed" : "registration_not_open" }, { status: 403 });
  }

  const supabase = getSupabaseAdmin();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabase || !serviceKey) {
    console.error("[crossing/register] Supabase env missing");
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  let body: Json;
  try {
    body = (await req.json()) as Json;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  // 회차 슬러그는 지금 받는 회차와 같을 때만.
  if (str(body.eventSlug) !== CURRENT_EVENT) {
    return NextResponse.json({ error: "invalid_event" }, { status: 400 });
  }

  // ── 허니팟(8월과 같은 규칙: 조용한 201, 서버 로그) ───────────────────────
  const honeypot = str(body.url_confirm);
  if (honeypot) {
    const who = (rawMembersPreview(body) ?? []).map((m) => `${m.name} <${m.email}>`).join(", ");
    console.warn(`[crossing/register] honeypot tripped — discarded. field=${JSON.stringify(honeypot.slice(0, 120))} submitter=${who || "(no member data)"}`);
    return NextResponse.json({ ok: true, id: crypto.randomUUID() }, { status: 201 });
  }

  // ── 스로틀 ──────────────────────────────────────────────────────────────
  const ipHash = hashIp(clientIp(req), serviceKey);
  const [shortWindow, longWindow, globalWindow] = await Promise.all([
    supabase.from(TABLE).select("id", { count: "exact", head: true }).eq("ip_hash", ipHash).gte("created_at", sinceIso(PER_IP_SHORT.minutes)),
    supabase.from(TABLE).select("id", { count: "exact", head: true }).eq("ip_hash", ipHash).gte("created_at", sinceIso(PER_IP_LONG.minutes)),
    supabase.from(TABLE).select("id", { count: "exact", head: true }).gte("created_at", sinceIso(GLOBAL.minutes)),
  ]);
  const verdict = throttleVerdict({ short: shortWindow.count, long: longWindow.count, global: globalWindow.count });
  if (verdict !== "ok") {
    if (verdict === "global") console.error(`[crossing/register] GLOBAL RATE LIMIT HIT — ${globalWindow.count} in ${GLOBAL.minutes}m.`);
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  // ── 검증(스키마) ─────────────────────────────────────────────────────────
  const reg = (body.registration ?? {}) as Json;
  const rawMembers = Array.isArray(body.members) ? (body.members as Json[]) : [];
  if (rawMembers.length === 0 || rawMembers.length > MAX_MEMBERS) {
    return NextResponse.json({ error: "invalid_members" }, { status: 400 });
  }
  for (const f of REGISTRATION_FIELDS) {
    if (f.key === "team_name" || f.key === "wants_matching" || f.key === "consent") continue; // 아래에서 조건부
    const err = validateField(f, reg[f.key]);
    if (err) return NextResponse.json({ error: err, field: f.key }, { status: 400 });
  }
  for (const [i, m] of rawMembers.entries()) {
    for (const f of MEMBER_FIELDS) {
      const err = validateField(f, (m ?? {})[f.key]);
      if (err) return NextResponse.json({ error: err, field: f.key, ordinal: i + 1 }, { status: 400 });
    }
  }
  if (reg.consent !== true) {
    return NextResponse.json({ error: "consent_required" }, { status: 400 });
  }

  const joinType = str(reg.join_type) as "team" | "solo";
  const isTeam = joinType === "team";
  if (isTeam && !str(reg.team_name)) return NextResponse.json({ error: "missing_team_name" }, { status: 400 });
  if (isTeam && rawMembers.length < 2) return NextResponse.json({ error: "team_too_small" }, { status: 400 });
  if (!isTeam && rawMembers.length > 1) return NextResponse.json({ error: "invalid_members" }, { status: 400 });
  const wantsMatching = !isTeam && reg.wants_matching === true;
  const teamName = isTeam ? str(reg.team_name) : wantsMatching ? null : optStr(reg.team_name);

  const members = rawMembers.map((m, i) => ({
    ordinal: i + 1,
    event_slug: CURRENT_EVENT,
    name: str(m.name),
    email: str(m.email),
    contact: normalizeKakaoId(str(m.contact)) ?? str(m.contact),
    university: optStr(m.university),
    study_country: str(m.study_country).toUpperCase(),
    linkedin: optStr(m.linkedin),
    answers: pickAnswers(m, "member"),
  }));
  const emails = members.map((m) => m.email.toLowerCase());
  if (new Set(emails).size !== emails.length) {
    return NextResponse.json({ error: "duplicate_email" }, { status: 400 });
  }

  const submittedAt = typeof body.submittedAt === "string" && !Number.isNaN(Date.parse(body.submittedAt)) ? body.submittedAt : null;

  // ── 삽입 ─────────────────────────────────────────────────────────────────
  const { data: row, error: regErr } = await supabase
    .from(TABLE)
    .insert({
      event_slug: CURRENT_EVENT,
      join_type: joinType,
      team_name: teamName,
      wants_matching: wantsMatching,
      answers: pickAnswers(reg, "registration"),
      consent_at: new Date().toISOString(),
      ref: optStr(body.ref),
      submitted_at: submittedAt,
      ip_hash: ipHash,
    })
    .select("id")
    .single();
  if (regErr || !row) {
    console.error("[crossing/register] registrations insert failed:", regErr);
    return NextResponse.json({ error: "db_error" }, { status: 500 });
  }

  const { error: memErr } = await supabase.from(MEMBERS).insert(members.map((m) => ({ ...m, registration_id: row.id })));
  if (memErr) {
    // 같은 트랜잭션이 아니므로 부모 행을 직접 지웁니다. 고아 행을 남기지 않습니다.
    await supabase.from(TABLE).delete().eq("id", row.id);
    if (memErr.code === "23505") {
      return NextResponse.json({ error: "already_registered" }, { status: 409 });
    }
    console.error("[crossing/register] members insert failed, rolled back:", memErr);
    return NextResponse.json({ error: "db_error" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, id: row.id }, { status: 201 });
}
