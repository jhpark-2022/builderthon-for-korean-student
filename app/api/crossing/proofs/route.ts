// ─────────────────────────────────────────────────────────────────────────────
// /api/crossing/proofs. Day 2, Day 3 미션 인증(2026-10-17, 상금·인센티브 정리 2장).
//
//   GET ?teamId=                       그 팀이 올린 파일(가장 최근 것부터, 10분짜리 보기 URL)
//   POST {action:"sign", day, kind, contentType, size}   한 번 쓰는 업로드 URL
//   POST {action:"confirm", path}      파일이 실제로 올라갔는지 보고 행을 남김
//
// 파일은 브라우저가 서명 URL로 Supabase Storage에 바로 올립니다. Vercel 함수의 본문 한도(4.5MB)를 넘는
// 폰 사진도 올라갑니다. 버킷은 비공개이고 정책이 없어 서명 URL로만 오갑니다.
// ─────────────────────────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { PROOF_BUCKET, findTeam } from "@/lib/crossingOpsServer";
import { PROOF_KINDS, PROOF_MAX_BYTES, PROOF_TYPES, isOpsDay, type ProofKind } from "@/lib/crossingOps";

export const dynamic = "force-dynamic";

const EXT: Record<string, string> = {
  "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/heic": "heic", "image/heif": "heif", "application/pdf": "pdf",
};

// 팀은 GET이면 ?teamId=, POST면 본문의 teamId로 옵니다(2026-10-17, 팀 코드를 뺐습니다).
async function auth(teamId: unknown) {
  const db = getSupabaseAdmin();
  if (!db) return { res: NextResponse.json({ error: "not_configured" }, { status: 503 }) } as const;
  const team = await findTeam(db, teamId);
  if (!team) return { res: NextResponse.json({ error: "unknown_team" }, { status: 400 }) } as const;
  return { db, team } as const;
}

export async function GET(req: Request) {
  const a = await auth(new URL(req.url).searchParams.get("teamId"));
  if ("res" in a) return a.res;
  const { db, team } = a;
  const { data, error } = await db.from("crossing_mission_proofs")
    .select("id, day, kind, storage_path, created_at").eq("team_id", team.id).order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: "db" }, { status: 500 });
  const rows = data ?? [];
  const signed = rows.length
    ? (await db.storage.from(PROOF_BUCKET).createSignedUrls(rows.map((r) => r.storage_path), 600)).data ?? []
    : [];
  return NextResponse.json({
    proofs: rows.map((r, i) => ({ id: r.id, day: r.day, kind: r.kind, createdAt: r.created_at, url: signed[i]?.signedUrl ?? null })),
  });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const a = await auth(body?.teamId);
  if ("res" in a) return a.res;
  const { db, team } = a;

  if (body?.action === "sign") {
    const day = Number(body.day);
    const kind = body.kind as ProofKind;
    const type = typeof body.contentType === "string" ? body.contentType : "";
    const size = Number(body.size);
    if (!isOpsDay(day) || !PROOF_KINDS.includes(kind)) return NextResponse.json({ error: "invalid" }, { status: 400 });
    if (!PROOF_TYPES[kind].includes(type)) return NextResponse.json({ error: "bad_type" }, { status: 400 });
    if (!(size > 0) || size > PROOF_MAX_BYTES) return NextResponse.json({ error: "too_big" }, { status: 400 });
    // 경로가 팀과 날을 말합니다. confirm은 이 접두어가 맞는지만 봅니다.
    const path = `${team.id}/day${day}/${kind}-${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${EXT[type]}`;
    const { data, error } = await db.storage.from(PROOF_BUCKET).createSignedUploadUrl(path);
    if (error || !data) {
      console.error("[crossing/proofs] sign failed", error?.message);
      return NextResponse.json({ error: "storage" }, { status: 500 });
    }
    return NextResponse.json({ path, signedUrl: data.signedUrl, token: data.token });
  }

  if (body?.action === "confirm") {
    const path = typeof body.path === "string" ? body.path : "";
    const m = path.match(/^([0-9a-f-]{36})\/day([23])\/(photo|pdf)-[^/]+$/);
    if (!m || m[1] !== team.id) return NextResponse.json({ error: "invalid" }, { status: 400 });
    const dir = `${m[1]}/day${m[2]}`;
    const name = path.slice(dir.length + 1);
    const { data: list } = await db.storage.from(PROOF_BUCKET).list(dir, { search: name, limit: 1 });
    const obj = list?.find((o) => o.name === name);
    if (!obj) return NextResponse.json({ error: "not_uploaded" }, { status: 400 });
    const meta = (obj.metadata ?? {}) as { mimetype?: string; size?: number };
    const { error } = await db.from("crossing_mission_proofs").insert({
      team_id: team.id, day: Number(m[2]), kind: m[3], storage_path: path,
      content_type: meta.mimetype ?? "application/octet-stream", size_bytes: Math.max(1, Number(meta.size ?? 1)),
    });
    if (error && error.code !== "23505") return NextResponse.json({ error: "db" }, { status: 500 });
    return NextResponse.json({ ok: true }, { status: 201 });
  }

  return NextResponse.json({ error: "invalid" }, { status: 400 });
}
