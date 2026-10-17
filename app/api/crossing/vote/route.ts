// ─────────────────────────────────────────────────────────────────────────────
// /api/crossing/vote. 마지막 날 트랙별 인기투표(2026-10-17, lib/crossingVote.ts).
//
//   GET                                          트랙과 그 트랙의 팀 이름, 이 기기가 이미 낸 트랙
//   POST {deviceToken, voterTeam, votes: {트랙: 팀}}  트랙마다 한 표. 자기 팀 제외, 한 번 내면 못 바꿈
//
// CROSSING_VOTE_OPEN=1이 아니면 403입니다. 8월 투표처럼 IP 해시로 몰려드는 요청만 막고, 사람은 저장하지 않습니다.
// ─────────────────────────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { CURRENT_EVENT } from "@/lib/registrationWindow";
import { clientIp, hashIp, sinceIso } from "@/lib/register/shared";
import { NO_TEAM, isUuid, voteOpen } from "@/lib/crossingVote";

export const dynamic = "force-dynamic";

// 한 방 와이파이에서 80명이 함께 내도 막히지 않는 값(8월 투표와 같은 생각).
const PER_IP = { minutes: 10, max: 300 };

async function tracks(db: NonNullable<ReturnType<typeof getSupabaseAdmin>>) {
  const { data, error } = await db.from("crossing_teams").select("name, track").eq("event_slug", CURRENT_EVENT).not("track", "is", null).order("name");
  if (error) return null;
  const out: Record<string, string[]> = {};
  for (const r of data ?? []) (out[r.track as string] ??= []).push(r.name as string);
  return out;
}

export async function GET(req: Request) {
  if (!voteOpen()) return NextResponse.json({ error: "closed" }, { status: 403 });
  const db = getSupabaseAdmin();
  if (!db) return NextResponse.json({ error: "not_configured" }, { status: 503 });
  const t = await tracks(db);
  if (!t) return NextResponse.json({ error: "db" }, { status: 500 });
  const device = new URL(req.url).searchParams.get("device");
  let done: string[] = [];
  if (isUuid(device)) {
    const { data } = await db.from("crossing_votes").select("track").eq("event_slug", CURRENT_EVENT).eq("device_token", device.toLowerCase());
    done = (data ?? []).map((r) => r.track as string);
  }
  const { data: all } = await db.from("crossing_teams").select("name").eq("event_slug", CURRENT_EVENT).order("name");
  return NextResponse.json({ tracks: t, teams: (all ?? []).map((r) => r.name), done });
}

export async function POST(req: Request) {
  if (!voteOpen()) return NextResponse.json({ error: "closed" }, { status: 403 });
  const db = getSupabaseAdmin();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!db || !key) return NextResponse.json({ error: "not_configured" }, { status: 503 });
  const body = await req.json().catch(() => null);
  if (!isUuid(body?.deviceToken)) return NextResponse.json({ error: "invalid" }, { status: 400 });
  const device = (body.deviceToken as string).toLowerCase();
  const voterTeam = typeof body?.voterTeam === "string" && body.voterTeam ? body.voterTeam : NO_TEAM;
  const votes = body?.votes && typeof body.votes === "object" ? (body.votes as Record<string, unknown>) : {};

  const t = await tracks(db);
  if (!t) return NextResponse.json({ error: "db" }, { status: 500 });
  if (voterTeam !== NO_TEAM && !Object.values(t).flat().includes(voterTeam)) {
    const { data } = await db.from("crossing_teams").select("name").eq("event_slug", CURRENT_EVENT).eq("name", voterTeam).maybeSingle();
    if (!data) return NextResponse.json({ error: "invalid_team" }, { status: 400 });
  }
  const rows: { track: string; choice: string }[] = [];
  for (const [track, choice] of Object.entries(votes)) {
    if (!t[track] || typeof choice !== "string" || !t[track].includes(choice)) return NextResponse.json({ error: "invalid_choice", track }, { status: 400 });
    if (choice === voterTeam) return NextResponse.json({ error: "own_team", track }, { status: 400 });
    rows.push({ track, choice });
  }
  if (!rows.length) return NextResponse.json({ error: "empty" }, { status: 400 });

  const ipHash = hashIp(clientIp(req), key);
  const { count } = await db.from("crossing_votes").select("id", { count: "exact", head: true }).eq("ip_hash", ipHash).gte("created_at", sinceIso(PER_IP.minutes));
  if ((count ?? 0) >= PER_IP.max) return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  const { error } = await db.from("crossing_votes").insert(
    rows.map((r) => ({ event_slug: CURRENT_EVENT, track: r.track, choice: r.choice, device_token: device, voter_team: voterTeam, ip_hash: ipHash })),
  );
  if (error) {
    // 같은 기기가 같은 트랙에 두 번: 첫 표가 최종입니다(8월과 같음).
    if (error.code === "23505") return NextResponse.json({ error: "already_voted" }, { status: 409 });
    console.error("[crossing/vote] insert failed", error.code);
    return NextResponse.json({ error: "db" }, { status: 500 });
  }
  return NextResponse.json({ ok: true }, { status: 201 });
}
