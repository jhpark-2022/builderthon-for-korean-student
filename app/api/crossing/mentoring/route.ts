// ─────────────────────────────────────────────────────────────────────────────
// /api/crossing/mentoring. 멘토 시간표(2026-10-17). 모든 팀이 같은 시간표를 봅니다.
//
//   GET    ?day=2                          팀 목록, 그날의 멘토와 받는 구간, 예약(팀 이름 포함)
//   POST   {teamId, mentorId, startsAt}    칸에 팀 넣기. 길이는 SESSION_MINUTES
//   DELETE {bookingId}                     칸 비우기
//
// DECIDED 2026-10-17 (사용자: "그냥 timetable where team can put in their available, 다른 팀과 공유"): 팀 코드 없이
// 팀을 골라 넣습니다. 같은 멘토의 앞뒤 15분과 한 팀의 시간 겹침은 DB의 exclude 제약이 지킵니다(23P01).
// ─────────────────────────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { CURRENT_EVENT } from "@/lib/registrationWindow";
import { findTeam } from "@/lib/crossingOpsServer";
import { MAX_BOOKINGS_PER_TEAM_PER_DAY, SESSION_MINUTES, fitsWindow, isOpsDay } from "@/lib/crossingOps";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const db = getSupabaseAdmin();
  if (!db) return NextResponse.json({ error: "not_configured" }, { status: 503 });
  const day = Number(new URL(req.url).searchParams.get("day"));
  if (!isOpsDay(day)) return NextResponse.json({ error: "invalid_day" }, { status: 400 });

  const [teams, mentors] = await Promise.all([
    db.from("crossing_teams").select("id, name").eq("event_slug", CURRENT_EVENT).order("name"),
    db.from("crossing_mentors").select("id, name, field").eq("event_slug", CURRENT_EVENT).eq("active", true).order("name"),
  ]);
  if (teams.error || mentors.error) return NextResponse.json({ error: "db" }, { status: 500 });
  const ids = (mentors.data ?? []).map((m) => m.id);
  const none = ["00000000-0000-0000-0000-000000000000"];
  const [{ data: windows }, { data: bookings }] = await Promise.all([
    db.from("crossing_mentor_windows").select("mentor_id, starts_at, ends_at").eq("day", day).in("mentor_id", ids.length ? ids : none).order("starts_at"),
    db.from("crossing_mentor_bookings").select("id, mentor_id, team_id, starts_at, ends_at").eq("day", day).in("mentor_id", ids.length ? ids : none).order("starts_at"),
  ]);
  const name = new Map((teams.data ?? []).map((t) => [t.id, t.name]));
  return NextResponse.json({
    teams: teams.data,
    mentors: (mentors.data ?? []).map((m) => ({
      id: m.id, name: m.name, field: m.field,
      windows: (windows ?? []).filter((w) => w.mentor_id === m.id).map((w) => ({ startsAt: w.starts_at, endsAt: w.ends_at })),
      bookings: (bookings ?? []).filter((b) => b.mentor_id === m.id).map((b) => ({
        id: b.id, teamId: b.team_id, teamName: name.get(b.team_id) ?? "", startsAt: b.starts_at, endsAt: b.ends_at,
      })),
    })),
  });
}

export async function POST(req: Request) {
  const db = getSupabaseAdmin();
  if (!db) return NextResponse.json({ error: "not_configured" }, { status: 503 });
  const body = await req.json().catch(() => null);
  const team = await findTeam(db, body?.teamId);
  const mentorId = typeof body?.mentorId === "string" ? body.mentorId : "";
  const t = Date.parse(typeof body?.startsAt === "string" ? body.startsAt : "");
  if (!team || !mentorId || Number.isNaN(t)) return NextResponse.json({ error: "invalid" }, { status: 400 });
  if (t < Date.now()) return NextResponse.json({ error: "past" }, { status: 400 });

  const { data: mentor } = await db.from("crossing_mentors").select("id").eq("id", mentorId).eq("event_slug", CURRENT_EVENT).eq("active", true).maybeSingle();
  if (!mentor) return NextResponse.json({ error: "invalid" }, { status: 400 });
  const { data: windows } = await db.from("crossing_mentor_windows").select("day, starts_at, ends_at").eq("mentor_id", mentorId);
  const hit = (windows ?? []).map((w) => ({ day: w.day as number, startsAt: w.starts_at as string, endsAt: w.ends_at as string })).find((w) => fitsWindow(t, [w]));
  if (!hit) return NextResponse.json({ error: "outside_window" }, { status: 400 });

  const { count } = await db.from("crossing_mentor_bookings").select("id", { count: "exact", head: true }).eq("team_id", team.id).eq("day", hit.day);
  if ((count ?? 0) >= MAX_BOOKINGS_PER_TEAM_PER_DAY) return NextResponse.json({ error: "team_limit" }, { status: 409 });

  const { error } = await db.from("crossing_mentor_bookings").insert({
    mentor_id: mentorId, team_id: team.id, day: hit.day,
    starts_at: new Date(t).toISOString(), ends_at: new Date(t + SESSION_MINUTES * 60_000).toISOString(),
  });
  if (error) {
    if (error.code === "23P01") return NextResponse.json({ error: (error.message ?? "").includes("team_overlap") ? "team_busy" : "taken" }, { status: 409 });
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
