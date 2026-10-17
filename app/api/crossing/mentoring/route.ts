// ─────────────────────────────────────────────────────────────────────────────
// /api/crossing/mentoring. 멘토 예약(2026-10-17, 사용자: 예약 시간의 앞뒤 15분 자동 막기).
//
//   GET    ?day=2          그날의 멘토, 받을 수 있는 구간, 예약(다른 팀 이름은 내보내지 않음)
//   POST   {mentorId, startsAt}   예약. 시작 시각은 구간 안의 칸 간격, 길이는 SESSION_MINUTES
//   DELETE {bookingId}     내 팀의 예약 취소
//
// 팀은 x-team-code 헤더로 들어옵니다. 같은 멘토의 15분 간격과 팀의 시간 겹침은 DB의 exclude 제약이
// 지키고(23P01), 이 라우트는 칸 간격, 구간, 지난 시각, 하루 예약 수만 미리 봅니다.
// ─────────────────────────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { clientIp } from "@/lib/register/shared";
import { CURRENT_EVENT } from "@/lib/registrationWindow";
import { badCodeGate, findTeam } from "@/lib/crossingOpsServer";
import { MAX_BOOKINGS_PER_TEAM_PER_DAY, SESSION_MINUTES, fitsWindow, isOpsDay } from "@/lib/crossingOps";

export const dynamic = "force-dynamic";

async function auth(req: Request) {
  const db = getSupabaseAdmin();
  if (!db) return { res: NextResponse.json({ error: "not_configured" }, { status: 503 }) } as const;
  const ip = clientIp(req);
  if (!badCodeGate(ip)) return { res: NextResponse.json({ error: "rate_limited" }, { status: 429 }) } as const;
  const team = await findTeam(db, req.headers.get("x-team-code"));
  if (!team) {
    badCodeGate(ip, true);
    return { res: NextResponse.json({ error: "unknown_code" }, { status: 401 }) } as const;
  }
  return { db, team } as const;
}

export async function GET(req: Request) {
  const a = await auth(req);
  if ("res" in a) return a.res;
  const { db, team } = a;
  const day = Number(new URL(req.url).searchParams.get("day"));
  if (!isOpsDay(day)) return NextResponse.json({ error: "invalid_day" }, { status: 400 });

  const { data: mentors, error: e1 } = await db.from("crossing_mentors").select("id, name, field").eq("event_slug", CURRENT_EVENT).eq("active", true).order("name");
  if (e1) return NextResponse.json({ error: "db" }, { status: 500 });
  const ids = (mentors ?? []).map((m) => m.id);
  const [{ data: windows }, { data: bookings }] = await Promise.all([
    db.from("crossing_mentor_windows").select("mentor_id, starts_at, ends_at").eq("day", day).in("mentor_id", ids.length ? ids : ["00000000-0000-0000-0000-000000000000"]).order("starts_at"),
    db.from("crossing_mentor_bookings").select("id, mentor_id, team_id, starts_at, ends_at").eq("day", day).order("starts_at"),
  ]);
  return NextResponse.json({
    mentors: (mentors ?? []).map((m) => ({
      id: m.id, name: m.name, field: m.field,
      windows: (windows ?? []).filter((w) => w.mentor_id === m.id).map((w) => ({ startsAt: w.starts_at, endsAt: w.ends_at })),
      bookings: (bookings ?? []).filter((b) => b.mentor_id === m.id).map((b) => ({
        startsAt: b.starts_at, endsAt: b.ends_at, mine: b.team_id === team.id, ...(b.team_id === team.id ? { id: b.id } : {}),
      })),
    })),
  });
}

export async function POST(req: Request) {
  const a = await auth(req);
  if ("res" in a) return a.res;
  const { db, team } = a;
  const body = await req.json().catch(() => null);
  const mentorId = typeof body?.mentorId === "string" ? body.mentorId : "";
  const t = Date.parse(typeof body?.startsAt === "string" ? body.startsAt : "");
  if (!mentorId || Number.isNaN(t)) return NextResponse.json({ error: "invalid" }, { status: 400 });
  if (t < Date.now()) return NextResponse.json({ error: "past" }, { status: 400 });

  const { data: mentor } = await db.from("crossing_mentors").select("id").eq("id", mentorId).eq("event_slug", CURRENT_EVENT).eq("active", true).maybeSingle();
  if (!mentor) return NextResponse.json({ error: "invalid" }, { status: 400 });
  const { data: windows } = await db.from("crossing_mentor_windows").select("day, starts_at, ends_at").eq("mentor_id", mentorId);
  const ws = (windows ?? []).map((w) => ({ day: w.day as number, startsAt: w.starts_at as string, endsAt: w.ends_at as string }));
  const hit = ws.find((w) => fitsWindow(t, [w]));
  if (!hit) return NextResponse.json({ error: "outside_window" }, { status: 400 });

  const { count } = await db.from("crossing_mentor_bookings").select("id", { count: "exact", head: true }).eq("team_id", team.id).eq("day", hit.day);
  if ((count ?? 0) >= MAX_BOOKINGS_PER_TEAM_PER_DAY) return NextResponse.json({ error: "team_limit" }, { status: 409 });

  const { data, error } = await db.from("crossing_mentor_bookings").insert({
    mentor_id: mentorId, team_id: team.id, day: hit.day,
    starts_at: new Date(t).toISOString(), ends_at: new Date(t + SESSION_MINUTES * 60_000).toISOString(),
  }).select("id").single();
  if (error) {
    if (error.code === "23P01") {
      const teamClash = (error.message ?? "").includes("team_overlap");
      return NextResponse.json({ error: teamClash ? "team_busy" : "taken" }, { status: 409 });
    }
    console.error("[crossing/mentoring] insert failed", error.code);
    return NextResponse.json({ error: "db" }, { status: 500 });
  }
  return NextResponse.json({ ok: true, id: data.id }, { status: 201 });
}

export async function DELETE(req: Request) {
  const a = await auth(req);
  if ("res" in a) return a.res;
  const { db, team } = a;
  const body = await req.json().catch(() => null);
  const id = typeof body?.bookingId === "string" ? body.bookingId : "";
  if (!id) return NextResponse.json({ error: "invalid" }, { status: 400 });
  const { data, error } = await db.from("crossing_mentor_bookings").delete().eq("id", id).eq("team_id", team.id).select("id");
  if (error) return NextResponse.json({ error: "db" }, { status: 500 });
  if (!data?.length) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
