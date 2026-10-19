// ─────────────────────────────────────────────────────────────────────────────
// /api/crossing/vote. 마지막 날 트랙별 인기투표(2026-10-17, lib/crossingVote.ts).
//
//   GET ?device=                                   서버 시각, 트랙(이름, 색, 열고 닫는 시각, 지금 국면, 발표 순서의 팀),
//                                                  이 기기가 이미 낸 트랙과 고른 팀
//   POST {deviceToken, voterTeam, track, choice}   한 트랙에 한 표(2026-10-19, 8월처럼 트랙마다 따로 냄).
//                                                  그 트랙이 열려 있어야 함, 자기 팀 제외, 한 번 내면 못 바꿈
//
// CROSSING_VOTE_OPEN=1이 아니면 403입니다. 8월 투표처럼 IP 해시로 몰려드는 요청만 막고, 사람은 저장하지 않습니다.
// ─────────────────────────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { CURRENT_EVENT } from "@/lib/registrationWindow";
import { clientIp, hashIp, sinceIso } from "@/lib/register/shared";
import { NO_TEAM, isUuid, voteOpen, voteWindowState, type VoteTrackInfo } from "@/lib/crossingVote";

export const dynamic = "force-dynamic";

// 한 방 와이파이에서 80명이 함께 내도 막히지 않는 값(8월 투표와 같은 생각).
const PER_IP = { minutes: 10, max: 300 };

type Db = NonNullable<ReturnType<typeof getSupabaseAdmin>>;

// 트랙과 그 트랙의 팀(발표 순서, 순서가 없으면 이름 순으로 뒤에). 팀이 하나도 없는 트랙은 내보내지 않습니다.
async function load(db: Db, now: number): Promise<VoteTrackInfo[] | null> {
  const [tr, tm] = await Promise.all([
    db.from("crossing_tracks").select("id, label_ko, label_en, color, vote_opens_at, vote_closes_at").eq("event_slug", CURRENT_EVENT).order("sort"),
    db.from("crossing_teams").select("name, track, present_order").eq("event_slug", CURRENT_EVENT),
  ]);
  if (tr.error || tm.error) return null;
  const teams = (tm.data ?? []).slice().sort((a, b) =>
    (a.present_order ?? 9999) - (b.present_order ?? 9999) || String(a.name).localeCompare(String(b.name), "ko"));
  return (tr.data ?? [])
    .map((r) => ({
      id: r.id as string,
      label: { ko: r.label_ko as string, en: r.label_en as string },
      color: r.color as string,
      opensAt: (r.vote_opens_at as string | null) ?? null,
      closesAt: (r.vote_closes_at as string | null) ?? null,
      state: voteWindowState(r.vote_opens_at as string | null, r.vote_closes_at as string | null, now),
      teams: teams.filter((t) => t.track === r.id).map((t) => t.name as string),
    }))
    .filter((t) => t.teams.length > 0);
}

export async function GET(req: Request) {
  if (!voteOpen()) return NextResponse.json({ error: "closed" }, { status: 403 });
  const db = getSupabaseAdmin();
  if (!db) return NextResponse.json({ error: "not_configured" }, { status: 503 });
  const now = Date.now();
  const tracks = await load(db, now);
  if (!tracks) return NextResponse.json({ error: "db" }, { status: 500 });
  const device = new URL(req.url).searchParams.get("device");
  const done: Record<string, string> = {};
  if (isUuid(device)) {
    const { data } = await db.from("crossing_votes").select("track, choice").eq("event_slug", CURRENT_EVENT).eq("device_token", device.toLowerCase());
    for (const r of data ?? []) done[r.track as string] = r.choice as string;
  }
  return NextResponse.json({ now, tracks, done });
}

export async function POST(req: Request) {
  if (!voteOpen()) return NextResponse.json({ error: "closed" }, { status: 403 });
  const db = getSupabaseAdmin();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!db || !key) return NextResponse.json({ error: "not_configured" }, { status: 503 });
  const body = await req.json().catch(() => null);
  if (!isUuid(body?.deviceToken) || typeof body?.track !== "string" || typeof body?.choice !== "string") {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
  const device = (body.deviceToken as string).toLowerCase();
  const voterTeam = typeof body?.voterTeam === "string" && body.voterTeam ? body.voterTeam : NO_TEAM;

  const tracks = await load(db, Date.now());
  if (!tracks) return NextResponse.json({ error: "db" }, { status: 500 });
  const track = tracks.find((t) => t.id === body.track);
  if (!track || !track.teams.includes(body.choice)) return NextResponse.json({ error: "invalid_choice" }, { status: 400 });
  // 열렸는지 닫혔는지는 서버 시계가 정합니다(8월과 같음). 화면이 열려 보여도 여기서 막힙니다.
  if (track.state === "before") return NextResponse.json({ error: "not_open" }, { status: 403 });
  if (track.state === "closed") return NextResponse.json({ error: "vote_closed" }, { status: 403 });
  if (voterTeam !== NO_TEAM && !tracks.some((t) => t.teams.includes(voterTeam))) {
    return NextResponse.json({ error: "invalid_team" }, { status: 400 });
  }
  if (body.choice === voterTeam) return NextResponse.json({ error: "own_team" }, { status: 400 });

  const ipHash = hashIp(clientIp(req), key);
  const { count } = await db.from("crossing_votes").select("id", { count: "exact", head: true }).eq("ip_hash", ipHash).gte("created_at", sinceIso(PER_IP.minutes));
  if ((count ?? 0) >= PER_IP.max) return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  const { error } = await db.from("crossing_votes").insert({
    event_slug: CURRENT_EVENT, track: track.id, choice: body.choice, device_token: device, voter_team: voterTeam, ip_hash: ipHash,
  });
  if (error) {
    // 같은 기기가 같은 트랙에 두 번: 첫 표가 최종입니다(8월과 같음).
    if (error.code === "23505") return NextResponse.json({ error: "already_voted" }, { status: 409 });
    console.error("[crossing/vote] insert failed", error.code);
    return NextResponse.json({ error: "db" }, { status: 500 });
  }
  return NextResponse.json({ ok: true }, { status: 201 });
}
