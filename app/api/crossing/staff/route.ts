// ─────────────────────────────────────────────────────────────────────────────
// /api/crossing/staff. 운영진 화면(/crossing/staff)의 읽기와 쓰기(2026-10-17).
// x-staff-key 헤더가 CROSSING_STAFF_KEY와 같아야 합니다. 환경 변수가 없으면 503.
//
//   GET                  등록한 사람, 팀과 팀원, 멘토와 받는 시간, 시간표의 칸, 인증 파일(10분짜리 보기 URL)
//   POST {action, ...}   createTeam {name, memberIds}, setTeamMembers {teamId, memberIds}, deleteTeam,
//                        createMentor, setMentorActive, addWindow, deleteWindow, deleteBooking
//
// DECIDED 2026-10-17 (사용자: "supabase can help me match the people who participate the event as a team"):
// 팀은 등록 명단(crossing_members)에서 사람을 골라 만듭니다. 한 사람은 한 팀에만(DB unique).
// ─────────────────────────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { CURRENT_EVENT } from "@/lib/registrationWindow";
import { PROOF_BUCKET, staffKeyVerdict } from "@/lib/crossingOpsServer";
import { isOpsDay, kstTime } from "@/lib/crossingOps";

export const dynamic = "force-dynamic";

const s = (v: unknown, max = 80) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const ids = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === "string" && /^[0-9a-f-]{36}$/.test(x)).slice(0, 10) : []);

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

  const [people, teams, members, mentors, windows, bookings, proofs] = await Promise.all([
    db.from("crossing_members").select("id, name, university, study_country").eq("event_slug", CURRENT_EVENT).order("name"),
    db.from("crossing_teams").select("id, name").eq("event_slug", CURRENT_EVENT).order("name"),
    db.from("crossing_team_members").select("team_id, member_id").eq("event_slug", CURRENT_EVENT),
    db.from("crossing_mentors").select("id, name, field, active").eq("event_slug", CURRENT_EVENT).order("name"),
    db.from("crossing_mentor_windows").select("id, mentor_id, day, starts_at, ends_at").order("starts_at"),
    db.from("crossing_mentor_bookings").select("id, mentor_id, team_id, day, starts_at, ends_at").order("starts_at"),
    db.from("crossing_mission_proofs").select("id, team_id, day, kind, storage_path, created_at").order("created_at", { ascending: false }),
  ]);
  if ([people, teams, members, mentors, windows, bookings, proofs].some((r) => r.error)) return NextResponse.json({ error: "db" }, { status: 500 });
  const p = proofs.data ?? [];
  const signed = p.length ? (await db.storage.from(PROOF_BUCKET).createSignedUrls(p.map((x) => x.storage_path), 600)).data ?? [] : [];
  return NextResponse.json({
    people: people.data,
    teams: (teams.data ?? []).map((t) => ({ ...t, memberIds: (members.data ?? []).filter((m) => m.team_id === t.id).map((m) => m.member_id) })),
    mentors: mentors.data,
    windows: windows.data,
    bookings: bookings.data,
    proofs: p.map((x, i) => ({ id: x.id, teamId: x.team_id, day: x.day, kind: x.kind, createdAt: x.created_at, url: signed[i]?.signedUrl ?? null })),
  });
}

export async function POST(req: Request) {
  const denied = gate(req);
  if (denied) return denied;
  const db = getSupabaseAdmin();
  if (!db) return NextResponse.json({ error: "not_configured" }, { status: 503 });
  const b = await req.json().catch(() => null);
  const fail = (error: string, status = 400) => NextResponse.json({ error }, { status });
  const ok = (status = 200) => NextResponse.json({ ok: true }, { status });

  // 팀원 목록을 통째로 바꿉니다. 다른 팀에 이미 있는 사람이면 23505(unique)로 거절됩니다.
  // 실패하면 그 전 팀원을 다시 넣어 팀이 비지 않게 합니다.
  const setMembers = async (teamId: string, memberIds: string[]) => {
    const row = (member_id: string) => ({ team_id: teamId, member_id, event_slug: CURRENT_EVENT });
    const before = (await db.from("crossing_team_members").select("member_id").eq("team_id", teamId)).data ?? [];
    const del = await db.from("crossing_team_members").delete().eq("team_id", teamId);
    if (del.error) return "db";
    if (!memberIds.length) return null;
    const ins = await db.from("crossing_team_members").insert(memberIds.map(row));
    if (!ins.error) return null;
    if (before.length) await db.from("crossing_team_members").insert(before.map((m) => row(m.member_id)));
    return ins.error.code === "23505" ? "already_in_team" : "db";
  };

  switch (b?.action) {
    case "createTeam": {
      const name = s(b.name, 40);
      if (!name) return fail("invalid");
      const { data, error } = await db.from("crossing_teams").insert({ event_slug: CURRENT_EVENT, name }).select("id").single();
      if (error) return fail(error.code === "23505" ? "duplicate" : "db", error.code === "23505" ? 409 : 500);
      const e = await setMembers(data.id, ids(b.memberIds));
      if (e) { await db.from("crossing_teams").delete().eq("id", data.id); return fail(e, e === "db" ? 500 : 409); }
      return ok(201);
    }
    case "setTeamMembers": {
      const e = await setMembers(s(b.teamId, 40), ids(b.memberIds));
      return e ? fail(e, e === "db" ? 500 : 409) : ok();
    }
    case "deleteTeam": {
      const { error } = await db.from("crossing_teams").delete().eq("id", s(b.teamId, 40)).eq("event_slug", CURRENT_EVENT);
      return error ? fail("db", 500) : ok();
    }
    case "createMentor": {
      const name = s(b.name, 40);
      if (!name) return fail("invalid");
      const { error } = await db.from("crossing_mentors").insert({ event_slug: CURRENT_EVENT, name, field: s(b.field) || null });
      return error ? fail("db", 500) : ok(201);
    }
    case "setMentorActive": {
      const { error } = await db.from("crossing_mentors").update({ active: b.active === true }).eq("id", s(b.mentorId, 40));
      return error ? fail("db", 500) : ok();
    }
    case "addWindow": {
      const day = Number(b.day);
      if (!isOpsDay(day)) return fail("invalid");
      const from = kstTime(day, s(b.start, 5)), to = kstTime(day, s(b.end, 5));
      if (!from || !to || to <= from) return fail("invalid");
      const { error } = await db.from("crossing_mentor_windows").insert({ mentor_id: s(b.mentorId, 40), day, starts_at: from.toISOString(), ends_at: to.toISOString() });
      return error ? fail("db", 500) : ok(201);
    }
    case "deleteWindow": {
      const { error } = await db.from("crossing_mentor_windows").delete().eq("id", s(b.windowId, 40));
      return error ? fail("db", 500) : ok();
    }
    case "deleteBooking": {
      const { error } = await db.from("crossing_mentor_bookings").delete().eq("id", s(b.bookingId, 40));
      return error ? fail("db", 500) : ok();
    }
    default:
      return fail("invalid");
  }
}
