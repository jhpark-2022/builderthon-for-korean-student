// ─────────────────────────────────────────────────────────────────────────────
// POST /api/crossing/register. 크로싱 서울 등록을 Supabase에 씁니다.
// (2026-09-18, Supabase 등록 브리프 2.2). 8월 라우트(/api/register)와 별개이고
// 공통 로직은 lib/register/shared.ts에서 가져옵니다.
//
// 흐름: 창 확인(동의 안내가 완성됐는지 포함) → 봇 확인(Turnstile, 2026-09-23) → 허니팟 → IP 스로틀
// (crossing_registrations 기준) → 스키마 검증 → 동의 → crossing_registrations 삽입 → crossing_members 삽입
// (event_slug 함께) → 23505(이미 등록된 이메일)면 부모 행을 정리하고 성공과 같은 201.
//
// DECIDED 2026-10-08 (사용자: "팀 - 전원 현장 편성"): 한 폼에 한 사람입니다. members는 정확히 하나여야 하고,
// join_type은 "solo", team_name은 null, wants_matching은 false로 씁니다. 표는 그대로입니다. 팀 꼴의 요청은 400.
// ─────────────────────────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { normalizeKakaoId } from "@/lib/kakao";
import { CURRENT_EVENT, registrationState } from "@/lib/registrationWindow";
import {
  PER_IP_SHORT, PER_IP_LONG, GLOBAL,
  type Json, str, optStr, hashIp, clientIp, honeypotLogFields, sinceIso, throttleVerdict,
} from "@/lib/register/shared";
import { verifyTurnstile } from "@/lib/register/turnstile";
import {
  CONSENT_NOTICE_READY, COUNTRY_OTHER, COUNTRY_OTHER_KEY, CROSSING_FORM, REGISTRATION_FIELDS, MAX_TEXTAREA,
  validateField, validatePerson,
} from "@/data/crossingForm";

export const dynamic = "force-dynamic";

const TABLE = "crossing_registrations";
const MEMBERS = "crossing_members";

const isPlainObject = (v: unknown): v is Json => typeof v === "object" && v !== null && !Array.isArray(v);

/** 스키마의 키만 남기고 문자열로 정리한 answers. 모르는 키는 버리고 개수만 로그에(키 이름은 보낸 쪽이 정하는 값이라 남기지 않습니다). */
function pickAnswers(src: Json, scope: "registration" | "member"): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  const known = new Set(CROSSING_FORM.filter((f) => f.scope === scope).map((f) => f.key));
  let dropped = 0;
  for (const [k, v] of Object.entries(src)) {
    if (!known.has(k)) { dropped += 1; continue; }
    const f = CROSSING_FORM.find((x) => x.key === k)!;
    if (f.fixed) continue; // 고정 열은 따로 갑니다
    const val = f.type === "checkbox" ? v === true : str(v, f.maxLen ?? (f.type === "textarea" ? MAX_TEXTAREA : undefined));
    if (val === "") continue; // 빈 답은 넣지 않습니다
    out[k] = val;
  }
  if (dropped) console.warn(`[crossing/register] unknown ${scope} answer keys dropped: ${dropped}`);
  return out;
}

export async function POST(req: Request) {
  // ── 창 ─────────────────────────────────────────────────────────────────
  const state = registrationState(CURRENT_EVENT);
  if (state !== "open") {
    return NextResponse.json({ error: state === "closed" ? "registration_closed" : "registration_not_open" }, { status: 403 });
  }
  // 2026-10-08 (보안 감사 M4): 동의 안내의 보관 기간이 비어 있으면 받지 않습니다. registrationState가 이미 같은 것을
  // 보지만, 그 함수가 바뀌어도 이 문은 남도록 여기서 한 번 더 막습니다.
  if (!CONSENT_NOTICE_READY) {
    console.error("[crossing/register] consent notice incomplete (CONSENT_RETENTION unset). refusing.");
    return NextResponse.json({ error: "registration_not_open" }, { status: 403 });
  }

  const supabase = getSupabaseAdmin();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabase || !serviceKey) {
    console.error("[crossing/register] Supabase env missing");
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  let parsed: unknown;
  try {
    parsed = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  // null, 배열, 숫자 같은 본문은 400입니다(2026-10-08. 그 전에는 아래에서 던져 500이 났습니다).
  if (!isPlainObject(parsed)) return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  const body = parsed;

  // 회차 슬러그는 지금 받는 회차와 같을 때만.
  if (str(body.eventSlug) !== CURRENT_EVENT) {
    return NextResponse.json({ error: "invalid_event" }, { status: 400 });
  }

  // ── 봇 확인(Cloudflare Turnstile) ─────────────────────────────────────────
  // DECIDED 2026-09-23: 스로틀보다 먼저 합니다. 스로틀은 DB에 COUNT를 세 번 묻는데, 확인되지
  // 않은 요청이 그 비용을 쓰지 못하게 합니다. 실패하면 403. 비밀키가 없으면 개발에서는
  // 건너뛰고 운영에서는 503(lib/register/turnstile.ts).
  const bot = await verifyTurnstile(body.turnstileToken, clientIp(req));
  if (bot === "fail") return NextResponse.json({ error: "bot_check_failed" }, { status: 403 });
  if (bot === "not_configured") {
    console.error("[crossing/register] TURNSTILE_SECRET_KEY missing in production");
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }
  if (bot === "unavailable") return NextResponse.json({ error: "bot_check_unavailable" }, { status: 503 });

  // ── 허니팟(8월과 같은 규칙: 조용한 201, 서버 로그. 이름과 이메일은 남기지 않음) ──
  const honeypot = str(body.url_confirm);
  if (honeypot) {
    console.warn(`[crossing/register] honeypot tripped. discarded. ${honeypotLogFields(honeypot)}`);
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
    if (verdict === "global") console.error(`[crossing/register] GLOBAL RATE LIMIT HIT. ${globalWindow.count} in ${GLOBAL.minutes}m.`);
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  // ── 검증(스키마) ─────────────────────────────────────────────────────────
  const reg = body.registration ?? {};
  if (!isPlainObject(reg)) return NextResponse.json({ error: "invalid_registration" }, { status: 400 });
  // 한 폼에 한 사람. 팀 꼴(여러 사람, join_type "team")은 받지 않습니다.
  if (!Array.isArray(body.members) || body.members.length !== 1 || !isPlainObject(body.members[0])) {
    return NextResponse.json({ error: "invalid_members" }, { status: 400 });
  }
  if (reg.join_type !== undefined && reg.join_type !== "solo") {
    return NextResponse.json({ error: "invalid_members" }, { status: 400 });
  }
  const m = body.members[0];
  for (const f of REGISTRATION_FIELDS) {
    if (f.key === "consent") continue; // 아래에서 따로
    const err = validateField(f, reg[f.key]);
    if (err) return NextResponse.json({ error: err, field: f.key }, { status: 400 });
  }
  const personErrors = Object.entries(validatePerson(m));
  if (personErrors.length) {
    const [field, error] = personErrors[0];
    return NextResponse.json({ error, field }, { status: 400 });
  }
  if (reg.consent !== true) {
    return NextResponse.json({ error: "consent_required" }, { status: 400 });
  }

  // 나라: 목록의 두 글자 코드는 열로, "그 밖의 나라"는 열을 비우고 적은 이름을 answers로(표의 check가 두 글자만 받습니다).
  const otherCountry = str(m.study_country) === COUNTRY_OTHER;
  const memberAnswers = pickAnswers(m, "member");
  if (!otherCountry) delete memberAnswers[COUNTRY_OTHER_KEY];
  const member = {
    ordinal: 1,
    event_slug: CURRENT_EVENT,
    name: str(m.name),
    email: str(m.email),
    contact: normalizeKakaoId(str(m.contact)) ?? str(m.contact),
    university: optStr(m.university),
    study_country: otherCountry ? null : str(m.study_country),
    linkedin: optStr(m.linkedin),
    answers: memberAnswers,
  };

  const submittedAt = typeof body.submittedAt === "string" && !Number.isNaN(Date.parse(body.submittedAt)) ? body.submittedAt : null;

  // ── 삽입 ─────────────────────────────────────────────────────────────────
  const { data: row, error: regErr } = await supabase
    .from(TABLE)
    .insert({
      event_slug: CURRENT_EVENT,
      join_type: "solo",
      team_name: null,
      wants_matching: false,
      answers: pickAnswers(reg, "registration"),
      consent_at: new Date().toISOString(),
      ref: optStr(body.ref),
      submitted_at: submittedAt,
      ip_hash: ipHash,
    })
    .select("id")
    .single();
  if (regErr || !row) {
    // 원본 오류 객체는 남기지 않습니다. details에 실패한 행(이름, 이메일)이 실릴 수 있습니다(보안 감사 L2).
    console.error(`[crossing/register] registrations insert failed: ${regErr?.code ?? "no_row"} ${regErr?.message ?? ""}`);
    return NextResponse.json({ error: "db_error" }, { status: 500 });
  }

  const { error: memErr } = await supabase.from(MEMBERS).insert({ ...member, registration_id: row.id });
  if (memErr) {
    // 같은 트랜잭션이 아니므로 부모 행을 직접 지웁니다. 고아 행을 남기지 않습니다.
    await supabase.from(TABLE).delete().eq("id", row.id);
    if (memErr.code === "23505") {
      // 2026-10-08 (보안 감사 M3): 이미 등록된 이메일도 성공과 같은 201입니다. 409를 돌려주면 누구든 남의 이메일로
      // 신청 여부를 알아낼 수 있었습니다. 처음 등록이 그대로 남고, 새 행은 쓰지 않습니다. id는 허니팟처럼 버리는 값입니다.
      return NextResponse.json({ ok: true, id: crypto.randomUUID() }, { status: 201 });
    }
    console.error(`[crossing/register] members insert failed, rolled back: ${memErr.code ?? ""} ${memErr.message ?? ""}`);
    return NextResponse.json({ error: "db_error" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, id: row.id }, { status: 201 });
}
