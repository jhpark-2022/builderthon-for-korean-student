// ─────────────────────────────────────────────────────────────────────────────
// POST /api/crossing/team. 팀 코드 확인(2026-10-17). 맞으면 팀 이름을 돌려줍니다.
// 현장 도구(/crossing/team)의 첫 화면이 부릅니다. 다른 라우트도 같은 코드를 x-team-code 헤더로 받습니다.
// ─────────────────────────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { clientIp } from "@/lib/register/shared";
import { badCodeGate, findTeam } from "@/lib/crossingOpsServer";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const db = getSupabaseAdmin();
  if (!db) return NextResponse.json({ error: "not_configured" }, { status: 503 });
  const ip = clientIp(req);
  if (!badCodeGate(ip)) return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  const body = await req.json().catch(() => null);
  const team = await findTeam(db, body?.code);
  if (!team) {
    badCodeGate(ip, true);
    return NextResponse.json({ error: "unknown_code" }, { status: 404 });
  }
  return NextResponse.json({ team: { name: team.name, code: team.code } });
}
