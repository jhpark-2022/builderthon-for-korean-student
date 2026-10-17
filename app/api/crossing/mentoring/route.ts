// ─────────────────────────────────────────────────────────────────────────────
// /api/crossing/mentoring. 멘토 시간표(2026-10-17). 모든 팀이 같은 시간표를 봅니다.
//
//   GET    ?day=2                          팀 목록, 그날의 멘토와 받는 구간, 예약(팀 이름 포함)
//   POST   {team, mentorId, startsAt}       칸에 팀 넣기. 길이는 SESSION_MINUTES
//   DELETE {bookingId}                     칸 비우기
//
// DECIDED 2026-10-17 (사용자: "그냥 timetable where team can put in their available, 다른 팀과 공유"): 팀 코드 없이
// 팀을 골라 넣습니다. 같은 멘토의 앞뒤 10분과 한 팀의 시간 겹침은 DB의 exclude 제약이 지킵니다(23P01).
// ─────────────────────────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { CURRENT_EVENT } from "@/lib/registrationWindow";
import { findTeam } from "@/lib/crossingOpsServer";
import { DEFAULT_WINDOW, OPS_DAYS, SESSION_MINUTES, fitsWindow, isOpsDay, isProofDay, kstTime, type Window } from "@/lib/crossingOps";

export const dynamic = "force-dynamic";

// 멘토 시간은 표에 Day와 한국 시각("14:00:00")으로 들어 있습니다(운영진이 표 편집기에 바로 적음). 화면과 판정에는 시각으로 바꿔 씁니다.
function toWindow(day: number, start: string, end: string): Window | null {
  const a = kstTime(day, String(start).slice(0, 5)), b = kstTime(day, String(end).slice(0, 5));
  return a && b && b > a ? { startsAt: a.toISOString(), endsAt: b.toISOString() } : null;
}
// 그 날 적힌 시간이 없으면 기본값(10:00~22:00, 임시)으로 봅니다(2026-10-17 사용자).
function windowsFor(day: number, rows: { start_time: string; end_time: string }[]): Window[] {
  const ws = rows.map((w) => toWindow(day, w.start_time, w.end_time)).filter((w): w is Window => !!w);
  return ws.length ? ws : [toWindow(day, DEFAULT_WINDOW.start, DEFAULT_WINDOW.end)!];
}

export async function GET(req: Request) {
  const db = getSupabaseAdmin();
  if (!db) return NextResponse.json({ error: "not_configured" }, { status: 503 });
  const day = Number(new URL(req.url).searchParams.get("day"));
  // Day 1도 읽습니다(팀 목록과 잠긴 시간표를 그리려고, 2026-10-17). Day 1에는 칸이 없고 POST도 받지 않습니다.
  if (!isProofDay(day)) return NextResponse.json({ error: "invalid_day" }, { status: 400 });

  const [teams, mentors] = await Promise.all([
    db.from("crossing_teams").select("name").eq("event_slug", CURRENT_EVENT).order("name"),
    db.from("crossing_mentors").select("id, name, field").eq("event_slug", CURRENT_EVENT).eq("active", true).order("name"),
  ]);
  if (teams.error || mentors.error) return NextResponse.json({ error: "db" }, { status: 500 });
  const ids = (mentors.data ?? []).map((m) => m.id);
  const none = ["00000000-0000-0000-0000-000000000000"];
  const [{ data: windows }, { data: bookings }] = await Promise.all([
    db.from("crossing_mentor_windows").select("mentor_id, start_time, end_time").eq("day", isOpsDay(day) ? day : -1).in("mentor_id", ids.length ? ids : none).order("start_time"),
    db.from("crossing_mentor_bookings").select("id, mentor_id, team_name, starts_at, ends_at").eq("day", isOpsDay(day) ? day : -1).in("mentor_id", ids.length ? ids : none).order("starts_at"),
  ]);
  return NextResponse.json({
    teams: (teams.data ?? []).map((t) => t.name),
    mentors: (mentors.data ?? []).map((m) => ({
      id: m.id, name: m.name, field: m.field,
      windows: windowsFor(day, (windows ?? []).filter((w) => w.mentor_id === m.id)),
      bookings: (bookings ?? []).filter((b) => b.mentor_id === m.id).map((b) => ({
        id: b.id, team: b.team_name, startsAt: b.starts_at, endsAt: b.ends_at,
      })),
    })),
  });
}

export async function POST(req: Request) {
  const db = getSupabaseAdmin();
  if (!db) return NextResponse.json({ error: "not_configured" }, { status: 503 });
  const body = await req.json().catch(() => null);
  const team = await findTeam(db, body?.team);
  const mentorId = typeof body?.mentorId === "string" ? body.mentorId : "";
  const t = Date.parse(typeof body?.startsAt === "string" ? body.startsAt : "");
  if (!team || !mentorId || Number.isNaN(t)) return NextResponse.json({ error: "invalid" }, { status: 400 });
  if (t < Date.now()) return NextResponse.json({ error: "past" }, { status: 400 });

  const { data: mentor } = await db.from("crossing_mentors").select("id").eq("id", mentorId).eq("event_slug", CURRENT_EVENT).eq("active", true).maybeSingle();
  if (!mentor) return NextResponse.json({ error: "invalid" }, { status: 400 });
  const { data: windows } = await db.from("crossing_mentor_windows").select("day, start_time, end_time").eq("mentor_id", mentorId);
  const hit = OPS_DAYS.map((d) => ({ day: d, ws: windowsFor(d, (windows ?? []).filter((w) => w.day === d)) })).find((x) => fitsWindow(t, x.ws));
  if (!hit) return NextResponse.json({ error: "outside_window" }, { status: 400 });

  const { error } = await db.from("crossing_mentor_bookings").insert({
    mentor_id: mentorId, team_name: team.name, day: hit.day,
    starts_at: new Date(t).toISOString(), ends_at: new Date(t + SESSION_MINUTES * 60_000).toISOString(),
  });
  if (error) {
    if (error.code === "23P01") return NextResponse.json({ error: (error.message ?? "").includes("team_cooldown") ? "team_busy" : "taken" }, { status: 409 });
    console.error("[crossing/mentoring] insert failed", error.code);
    return NextResponse.json({ error: "db" }, { status: 500 });
  }
  return NextResponse.json({ ok: true }, { status: 201 });
}

export async function DELETE(req: Request) {
  const db = getSupabaseAdmin();
  if (!db) return NextResponse.json({ error: "not_configured" }, { status: 503 });
  const body = await req.json().catch(() => null);
  const id = typeof body?.bookingId === "string" ? body.bookingId : "";
  if (!id) return NextResponse.json({ error: "invalid" }, { status: 400 });
  const { data, error } = await db.from("crossing_mentor_bookings").delete().eq("id", id).select("id");
  if (error) return NextResponse.json({ error: "db" }, { status: 500 });
  if (!data?.length) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
