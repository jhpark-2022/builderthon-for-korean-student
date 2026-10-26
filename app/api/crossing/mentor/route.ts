// ─────────────────────────────────────────────────────────────────────────────
// /api/crossing/mentor. 멘토 페이지(2026-10-26).
//
//   GET ?k=<멘토 열쇠>   그 멘토의 Day 2, 3 칸과, 칸을 넣은 팀이 올린 PDF(30분짜리 보기 URL)
//
// DECIDED 2026-10-26 (사용자: "올리면 팀이 멘토분들에게 사전에 공유줄 수 있도록", "멘토 전용 페이지"): 멘토는 찾아올 팀의
// 이슈에 대한 생각 1장(Day 1 PDF)을 미리 봅니다. Day 3 칸에는 그 팀의 Day 2에 고쳐 올린 1장도 붙습니다. 사진은 내보내지 않습니다.
// 열쇠는 lib/crossingOpsServer.ts mentorKey. 맞는 멘토가 없으면 404입니다.
// ─────────────────────────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { CURRENT_EVENT } from "@/lib/registrationWindow";
import { PROOF_BUCKET, listTracks, mentorKey } from "@/lib/crossingOpsServer";

export const dynamic = "force-dynamic";

const same = (a: string, b: string) => a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b));

export async function GET(req: Request) {
  const db = getSupabaseAdmin();
  if (!db) return NextResponse.json({ error: "not_configured" }, { status: 503 });
  const k = new URL(req.url).searchParams.get("k") ?? "";
  if (!/^[0-9a-f]{20}$/.test(k)) return NextResponse.json({ error: "unknown_mentor" }, { status: 404 });

  const { data: mentors, error } = await db.from("crossing_mentors").select("id, name, field").eq("event_slug", CURRENT_EVENT).eq("active", true);
  if (error) return NextResponse.json({ error: "db" }, { status: 500 });
  const mentor = (mentors ?? []).find((m) => { const mk = mentorKey(m.id); return !!mk && same(mk, k); });
  if (!mentor) return NextResponse.json({ error: "unknown_mentor" }, { status: 404 });

  const [{ data: bookings, error: bErr }, tracks] = await Promise.all([
    db.from("crossing_mentor_bookings").select("id, day, team_name, track, starts_at, ends_at").eq("mentor_id", mentor.id).order("starts_at"),
    listTracks(db),
  ]);
  if (bErr || !tracks) return NextResponse.json({ error: "db" }, { status: 500 });

  // 칸을 넣은 팀의 PDF 중 날마다 가장 최근 것 하나. Day 1은 이슈에 대한 생각 1장, Day 2는 진척.
  const teams = [...new Set((bookings ?? []).map((b) => b.team_name))];
  const latest = new Map<string, string>(); // `${team}|${day}` → storage_path
  if (teams.length) {
    const { data: proofs } = await db.from("crossing_mission_proofs").select("team_name, day, storage_path, created_at")
      .in("team_name", teams).eq("kind", "pdf").in("day", [1, 2]).order("created_at", { ascending: false });
    for (const p of proofs ?? []) { const key = `${p.team_name}|${p.day}`; if (!latest.has(key)) latest.set(key, p.storage_path); }
  }
  const paths = [...latest.values()];
  const signed = paths.length ? (await db.storage.from(PROOF_BUCKET).createSignedUrls(paths, 1800)).data ?? [] : [];
  const urlOf = new Map(paths.map((p, i) => [p, signed[i]?.signedUrl ?? null]));
  const file = (team: string, day: number) => { const p = latest.get(`${team}|${day}`); return p ? urlOf.get(p) ?? null : null; };

  return NextResponse.json({
    mentor: { name: mentor.name, field: mentor.field },
    tracks,
    bookings: (bookings ?? []).map((b) => ({
      id: b.id, day: b.day, team: b.team_name, track: b.track, startsAt: b.starts_at, endsAt: b.ends_at,
      day1Pdf: file(b.team_name, 1),
      day2Pdf: b.day === 3 ? file(b.team_name, 2) : null,
    })),
  });
}
