// ─────────────────────────────────────────────────────────────────────────────
// POST /api/crossing/match. 크로싱 서울 현장 팀 매칭용 AI 유형 결과를 Supabase에 씁니다.
// (2026-10-08, 현장 팀 매칭 브리프 4.1). 표는 crossing_match_profiles(마이그레이션 0006).
//
// 구조는 8월 투표 라우트(app/api/vote/route.ts)를 따릅니다: force-dynamic, 서버 검증, 허니팟,
// IP 해시 스로틀, service_role은 서버에만. 봇 확인(Turnstile)은 쓰지 않습니다. 현장에서 80명이
// 한 와이파이로 동시에 여는 자리라 마찰이 큽니다.
//
// 흐름: 기간 → 허니팟 → 현장 코드(있을 때) → 검증 → 스로틀(새 기기만) → (event_slug, device_token)로 upsert.
// 클라이언트가 보낸 model과 role_key는 읽지 않습니다. 유형(mbti)으로 12월판 표에서 서버가 직접 찾아 씁니다.
// 로그에 이름을 남기지 않습니다.
//
// DECIDED 2026-10-08 (퀴즈와 매칭 리뷰 7, 9, 보안 감사 M1):
//   1. model/role_key가 다르다고 400을 내지 않습니다. 행사 중에 모델 이름을 고쳐 배포하면 열려 있던 탭이 전부
//      "올리지 못했습니다"에 갇혔습니다. 서버의 표가 정본이라 비교할 이유가 없습니다.
//   2. 이미 올린 기기(event_slug, device_token)의 고쳐 쓰기는 스로틀을 거치지 않습니다. 전역 차단기는 새 행만
//      셉니다(created_at). 누군가 가짜 토큰으로 방을 채워도 이미 올린 사람의 수정은 막히지 않습니다.
//   3. MATCH_ROOM_CODE 환경변수가 있으면 같은 코드를 요구합니다(없으면 지금처럼). 현장에서 QR에 실어 알립니다.
// ─────────────────────────────────────────────────────────────────────────────

import { createHash, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { QUIZ_EDITIONS } from "@/data/quizEditions";
import { AXIS_ORDER, type MbtiKey } from "@/data/quiz";
import { isValidTrackRanking } from "@/data/matchTracks";
import {
  MATCH_EVENT, MATCH_EDITION, MATCH_NAME_MAX, MATCH_COUNTRY_RE, isMatchDeviceToken, matchWindowOpen, normalizeMatchCode,
} from "@/lib/crossingMatch";

export const dynamic = "force-dynamic";

const TABLE = "crossing_match_profiles";

// 투표 라우트와 같은 값입니다. 한 방의 와이파이(NAT) 하나에서 80명이 몰려도 막히지 않게.
// 세는 것은 새로 생긴 행(기기)입니다(created_at). 같은 기기가 다시 하면 같은 행을 덮어쓰고, 그 요청은 세지도 막지도 않습니다.
const PER_IP_SHORT = { minutes: 10, max: 200 };
const PER_IP_LONG = { minutes: 60, max: 400 };
const GLOBAL = { minutes: 10, max: 400 };

type Json = Record<string, unknown>;

function hashIp(ip: string, secret: string): string {
  return createHash("sha256").update(`${secret}::ip-salt::${ip}`).digest("hex");
}
function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) {
    const first = fwd.split(",")[0]?.trim();
    if (first) return first;
  }
  return req.headers.get("x-real-ip")?.trim() || "unknown";
}
const sinceIso = (minutes: number) => new Date(Date.now() - minutes * 60_000).toISOString();

/** 현장 코드 비교. 길이가 달라도 걸리는 시간이 같도록 해시끼리 견줍니다. */
function sameCode(given: string, expected: string): boolean {
  const a = createHash("sha256").update(given).digest();
  const b = createHash("sha256").update(expected).digest();
  return timingSafeEqual(a, b);
}

/** 축 점수는 정해진 다섯 축의 승자와 퍼센트만 남깁니다. 모르는 키와 모양은 버립니다. */
function pickAxes(raw: unknown): Record<string, { winner: string; pct: number }> {
  const out: Record<string, { winner: string; pct: number }> = {};
  if (typeof raw !== "object" || raw === null) return out;
  for (const axis of AXIS_ORDER) {
    const v = (raw as Json)[axis] as Json | undefined;
    if (!v || typeof v.winner !== "string" || typeof v.pct !== "number" || !Number.isFinite(v.pct)) continue;
    if (!/^(E|I|N|S|T|F|J|P|A|Tid)$/.test(v.winner)) continue;
    out[axis] = { winner: v.winner, pct: Math.max(0, Math.min(100, Math.round(v.pct))) };
  }
  return out;
}

export async function POST(req: Request) {
  if (!matchWindowOpen()) {
    return NextResponse.json({ error: "match_closed" }, { status: 403 });
  }

  const supabase = getSupabaseAdmin();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabase || !serviceKey) {
    console.error("[crossing/match] Supabase env missing");
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  let parsed: unknown;
  try {
    parsed = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  // null, 배열, 숫자 같은 본문은 아래에서 속성을 읽다 500이 났습니다(2026-10-08). 객체만 받습니다.
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const body = parsed as Json;

  // 허니팟: 조용한 200, 아무것도 쓰지 않습니다(등록 라우트와 같은 규칙).
  if (typeof body.url_confirm === "string" && body.url_confirm.trim()) {
    console.warn("[crossing/match] honeypot tripped. discarded.");
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  // ── 현장 코드(환경변수가 있을 때만) ─────────────────────────────────────────
  const roomCode = normalizeMatchCode(process.env.MATCH_ROOM_CODE);
  if (roomCode && !sameCode(normalizeMatchCode(body.room_code), roomCode)) {
    return NextResponse.json({ error: "invalid_code", field: "room_code" }, { status: 403 });
  }

  // ── 검증 ─────────────────────────────────────────────────────────────────
  if (body.eventSlug !== MATCH_EVENT) return NextResponse.json({ error: "invalid_event" }, { status: 400 });
  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name) return NextResponse.json({ error: "required", field: "name" }, { status: 400 });
  if ([...name].length > MATCH_NAME_MAX) return NextResponse.json({ error: "too_long", field: "name" }, { status: 400 });
  const country = typeof body.study_country === "string" ? body.study_country.trim() : "";
  if (!MATCH_COUNTRY_RE.test(country)) return NextResponse.json({ error: "invalid_country", field: "study_country" }, { status: 400 });
  const results = QUIZ_EDITIONS[MATCH_EDITION].results;
  const mbti = typeof body.mbti === "string" ? body.mbti : "";
  if (!Object.prototype.hasOwnProperty.call(results, mbti)) return NextResponse.json({ error: "invalid_option", field: "mbti" }, { status: 400 });
  const type = results[mbti as MbtiKey];
  if (body.identity !== "A" && body.identity !== "T") return NextResponse.json({ error: "invalid_option", field: "identity" }, { status: 400 });
  // 모델 이름과 역할은 서버의 표가 정본입니다. 클라이언트가 보낸 값은 읽지 않습니다(머리말의 DECIDED 1).
  // 선호 트랙 순위: 목록의 모든 트랙이 한 번씩. 목록이 비어 있는 동안은 빈 배열(보내지 않아도 됨)만 받습니다.
  const ranking = body.track_ranking ?? [];
  if (!isValidTrackRanking(ranking)) return NextResponse.json({ error: "invalid_option", field: "track_ranking" }, { status: 400 });
  if (!isMatchDeviceToken(body.device_token)) return NextResponse.json({ error: "invalid_device", field: "device_token" }, { status: 400 });

  // ── 스로틀(COUNT가 실패하면 통과시킵니다. 난간이지 문이 아닙니다) ──────────────────
  // 이미 올린 기기는 그대로 통과합니다(머리말의 DECIDED 2). 조회가 실패하면 새 기기로 보고 아래에서 셉니다.
  const ipHash = hashIp(clientIp(req), serviceKey);
  const deviceToken = (body.device_token as string).toLowerCase();
  const existing = await supabase.from(TABLE).select("id", { count: "exact", head: true })
    .eq("event_slug", MATCH_EVENT).eq("device_token", deviceToken);
  if ((existing.count ?? 0) === 0) {
    const [shortWindow, longWindow, globalWindow] = await Promise.all([
      supabase.from(TABLE).select("id", { count: "exact", head: true }).eq("ip_hash", ipHash).gte("created_at", sinceIso(PER_IP_SHORT.minutes)),
      supabase.from(TABLE).select("id", { count: "exact", head: true }).eq("ip_hash", ipHash).gte("created_at", sinceIso(PER_IP_LONG.minutes)),
      supabase.from(TABLE).select("id", { count: "exact", head: true }).gte("created_at", sinceIso(GLOBAL.minutes)),
    ]);
    if ((shortWindow.count ?? 0) >= PER_IP_SHORT.max || (longWindow.count ?? 0) >= PER_IP_LONG.max) {
      return NextResponse.json({ error: "rate_limited" }, { status: 429 });
    }
    if ((globalWindow.count ?? 0) >= GLOBAL.max) {
      console.error(`[crossing/match] GLOBAL RATE LIMIT HIT. ${globalWindow.count} new rows in ${GLOBAL.minutes}m.`);
      return NextResponse.json({ error: "rate_limited" }, { status: 429 });
    }
  }

  // ── 저장: 한 기기 한 행. 다시 하면 덮어씁니다 ─────────────────────────────────
  const { error } = await supabase.from(TABLE).upsert(
    {
      event_slug: MATCH_EVENT,
      device_token: deviceToken,
      name,
      study_country: country,
      mbti,
      identity: body.identity,
      model: type.model,
      role_key: type.roleKey,
      axes: pickAxes(body.axes),
      track_ranking: ranking,
      quiz_edition: MATCH_EDITION,
      ip_hash: ipHash,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "event_slug,device_token" },
  );
  if (error) {
    console.error("[crossing/match] upsert failed:", error.code, error.message);
    return NextResponse.json({ error: "db_error" }, { status: 500 });
  }
  return NextResponse.json({ ok: true }, { status: 200 });
}
