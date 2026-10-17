// ─────────────────────────────────────────────────────────────────────────────
// /api/crossing/staff. 운영진 화면(/crossing/staff)의 읽기와 쓰기(2026-10-17).
// x-staff-key 헤더가 CROSSING_STAFF_KEY와 같아야 합니다. 환경 변수가 없으면 503.
//
//   GET                       팀, 멘토와 구간, 예약, 인증 파일(10분짜리 보기 URL), 체크
//   POST {action, ...}        createTeam, createMentor, setMentorActive, addWindow, deleteWindow,
//                             deleteBooking, setCheck
// ─────────────────────────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { CURRENT_EVENT } from "@/lib/registrationWindow";
import { PROOF_BUCKET, staffKeyVerdict } from "@/lib/crossingOpsServer";
import { isOpsDay, kstTime } from "@/lib/crossingOps";

export const dynamic = "force-dynamic";

const s = (v: unknown, max = 80) => (typeof v === "string" ? v.trim().slice(0, max) : "");

function gate(req: Request) {
  const v = staffKeyVerdict(req);
  if (v === "unset") return NextResponse.json({ error: "not_configured" }, { status: 503 });
  if (v === "bad") return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  return null;
}

export async function GET(req: Request) {
  const denied = gate(req);
  if (denied) return denied;
  const db = getSupabaseAdmin();
  if (!db) return NextResponse.json({ error: "not_configured" }, { status: 503 });

  const [teams, mentors, windows, bookings, proofs, checks] = await Promise.all([
    db.from("crossing_teams").select("id, name, created_at").eq("event_slug", CURRENT_EVENT).order("name"),
    db.from("crossing_mentors").select("id, name, field, active").eq("event_slug", CURRENT_EVENT).order("name"),
    db.from("crossing_mentor_windows").select("id, mentor_id, day, starts_at, ends_at").order("starts_at"),
    db.from("crossing_mentor_bookings").select("id, mentor_id, team_id, day, starts_at, ends_at").order("starts_at"),
    db.from("crossing_mission_proofs").select("id, team_id, day, kind, storage_path, created_at").order("created_at", { ascending: false }),
    db.from("crossing_mission_checks").select("team_id, day, on_site, completed"),
  ]);
  const err = [teams, mentors, windows, bookings, proofs, checks].find((r) => r.error);
  if (err) return NextResponse.json({ error: "db" }, { status: 500 });

  const p = proofs.data ?? [];
  const signed = p.length ? (await db.storage.from(PROOF_BUCKET).createSignedUrls(p.map((r) => r.storage_path), 600)).data ?? [] : [];
  return NextResponse.json({
    teams: teams.data,
    mentors: mentors.data,
    windows: windows.data,
    bookings: bookings.data,
    proofs: p.map((r, i) => ({ id: r.id, teamId: r.team_id, day: r.day, kind: r.kind, createdAt: r.created_at, url: signed[i]?.signedUrl ?? null })),
    checks: checks.data,
  });
}

export async function POST(req: Request) {
  const denied = gate(req);
  if (denied) return denied;
  const db = getSupabaseAdmin();
  if (!db) return NextResponse.json({ error: "not_configured" }, { status: 503 });
  const b = await req.json().catch(() => null);
  const fail = (error: string, status = 400) => NextResponse.json({ error }, { status });

  switch (b?.action) {
    case "createTeam": {
      const name = s(b.name, 40);
      if (!name) return fail("invalid");
      const { error } = await db.from("crossing_teams").insert({ event_slug: CURRENT_EVENT, name });
      if (error) return fail(error.code === "23505" ? "duplicate" : "db", error.code === "23505" ? 409 : 500);
      return NextResponse.json({ ok: true }, { status: 201 });
    }
    case "createMentor": {
      const name = s(b.name, 40);
      if (!name) return fail("invalid");
      const { error } = await db.from("crossing_mentors").insert({ event_slug: CURRENT_EVENT, name, field: s(b.field) || null });
      return error ? fail("db", 500) : NextResponse.json({ ok: true }, { status: 201 });
    }
    case "setMentorActive": {
      const { error } = await db.from("crossing_mentors").update({ active: b.active === true }).eq("id", s(b.mentorId, 40));
      return error ? fail("db", 500) : NextResponse.json({ ok: true });
    }
    case "addWindow": {
      const day = Number(b.day);
      if (!isOpsDay(day)) return fail("invalid");
      const from = kstTime(day, s(b.start, 5)), to = kstTime(day, s(b.end, 5));
      if (!from || !to || to <= from) return fail("invalid");
      const { error } = await db.from("crossing_mentor_windows").insert({
        mentor_id: s(b.mentorId, 40), day, starts_at: from.toISOString(), ends_at: to.toISOString(),
      });
      return error ? fail("db", 500) : NextResponse.json({ ok: true }, { status: 201 });
    }
    case "deleteWindow": {
      const { error } = await db.from("crossing_mentor_windows").delete().eq("id", s(b.windowId, 40));
      return error ? fail("db", 500) : NextResponse.json({ ok: true });
    }
    case "deleteBooking": {
      const { error } = await db.from("crossing_mentor_bookings").delete().eq("id", s(b.bookingId, 40));
      return error ? fail("db", 500) : NextResponse.json({ ok: true });
    }
    case "setCheck": {
      const day = Number(b.day);
      if (![2, 3, 4].includes(day)) return fail("invalid");
      const { error } = await db.from("crossing_mission_checks").upsert({
        team_id: s(b.teamId, 40), day, on_site: b.onSite === true, completed: b.completed === true, updated_at: new Date().toISOString(),
      });
      return error ? fail("db", 500) : NextResponse.json({ ok: true });
    }
    default:
      return fail("invalid");
  }
}
