// ─────────────────────────────────────────────────────────────────────────────
// /api/crossing/proofs. Day 2, Day 3 미션 인증(2026-10-17, 상금·인센티브 정리 2장).
//
//   GET ?team=                         그 팀이 낸 것(날, 종류, 시각). 파일 주소는 주지 않습니다(2026-10-26)
//   (2026-10-26) 팀, 날, 종류마다 한 번만. 두 번째는 409 already.
//   POST {action:"sign", day, kind, contentType, size}   한 번 쓰는 업로드 URL
//   POST {action:"confirm", path}      파일이 실제로 올라갔는지 보고 행을 남김
//
// 파일은 브라우저가 서명 URL로 Supabase Storage에 바로 올립니다. Vercel 함수의 본문 한도(4.5MB)를 넘는
// 폰 사진도 올라갑니다. 버킷은 비공개이고 정책이 없어 서명 URL로만 오갑니다.
// ─────────────────────────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { PROOF_BUCKET, findTeam, teamFolder } from "@/lib/crossingOpsServer";
import { PROOF_MAX_BYTES, PROOF_TYPES, isProofDay, proofKindsFor, type ProofKind } from "@/lib/crossingOps";

export const dynamic = "force-dynamic";

const EXT: Record<string, string> = {
  "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/heic": "heic", "image/heif": "heif", "application/pdf": "pdf",
};

// 팀은 GET이면 ?team=, POST면 본문의 team으로 옵니다. 값은 팀 이름입니다(2026-10-17, 팀 ID 없음).
async function auth(teamName: unknown) {
  const db = getSupabaseAdmin();
  if (!db) return { res: NextResponse.json({ error: "not_configured" }, { status: 503 }) } as const;
  const team = await findTeam(db, teamName);
  if (!team) return { res: NextResponse.json({ error: "unknown_team" }, { status: 400 }) } as const;
  return { db, team } as const;
}

// DECIDED 2026-10-26 (사용자: "업로드는 한번만 가능하도록 해, 그러니까 하루 끝나기 전에 신중한 업로드 부탁"):
// 팀마다, 날마다, 종류(사진, PDF)마다 한 번만 올립니다. sign에서 미리 거절하고, 동시에 두 번 올린 경우는 confirm에서 뒤의 파일을 지웁니다.
async function alreadyUploaded(db: NonNullable<ReturnType<typeof getSupabaseAdmin>>, teamName: string, day: number, kind: string) {
  const { count } = await db.from("crossing_mission_proofs").select("id", { count: "exact", head: true }).eq("team_name", teamName).eq("day", day).eq("kind", kind);
  return (count ?? 0) > 0;
}

export async function GET(req: Request) {
  const a = await auth(new URL(req.url).searchParams.get("team"));
  if ("res" in a) return a.res;
  const { db, team } = a;
  const { data, error } = await db.from("crossing_mission_proofs")
    .select("id, day, kind, size_bytes, created_at").eq("team_name", team.name).order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: "db" }, { status: 500 });
  // DECIDED 2026-10-26 (사용자: "업로드를 하면 웹사이트에서 보이지 않고, 그냥 submission 되었다 이런식으로만"): 팀 쪽에는 파일 주소를
  // 내주지 않습니다. 팀은 코드 없이 목록에서 고르므로(10/17), 주소를 주면 다른 팀 이름을 골라 그 팀 파일을 열 수 있었습니다.
  // 파일은 멘토 페이지(/api/crossing/mentor, 멘토 열쇠)에서만 열립니다. 여기는 제출 여부와 시각만.
  const rows = data ?? [];
  return NextResponse.json({
    proofs: rows.map((r) => ({ id: r.id, day: r.day, kind: r.kind, createdAt: r.created_at, sizeBytes: r.size_bytes })),
  });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const a = await auth(body?.team);
  if ("res" in a) return a.res;
  const { db, team } = a;

  if (body?.action === "sign") {
    const day = Number(body.day);
    const kind = body.kind as ProofKind;
    const type = typeof body.contentType === "string" ? body.contentType : "";
    const size = Number(body.size);
    // Day 1은 PDF만(2026-10-17 사용자).
    if (!isProofDay(day) || !proofKindsFor(day).includes(kind)) return NextResponse.json({ error: "invalid" }, { status: 400 });
    if (!PROOF_TYPES[kind].includes(type)) return NextResponse.json({ error: "bad_type" }, { status: 400 });
    if (!(size > 0) || size > PROOF_MAX_BYTES[kind]) return NextResponse.json({ error: "too_big" }, { status: 400 });
    if (await alreadyUploaded(db, team.name, day, kind)) return NextResponse.json({ error: "already" }, { status: 409 });
    // 경로가 팀과 날을 말합니다. confirm은 이 접두어가 맞는지만 봅니다.
    const path = `${teamFolder(team.name)}/day${day}/${kind}-${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${EXT[type]}`;
    const { data, error } = await db.storage.from(PROOF_BUCKET).createSignedUploadUrl(path);
    if (error || !data) {
      console.error("[crossing/proofs] sign failed", error?.message);
      return NextResponse.json({ error: "storage" }, { status: 500 });
    }
    return NextResponse.json({ path, signedUrl: data.signedUrl, token: data.token });
  }

  if (body?.action === "confirm") {
    const path = typeof body.path === "string" ? body.path : "";
    const m = path.match(/^([0-9a-f]{16})\/day([123])\/(photo|pdf)-[^/]+$/);
    if (!m || m[1] !== teamFolder(team.name)) return NextResponse.json({ error: "invalid" }, { status: 400 });
    const dir = `${m[1]}/day${m[2]}`;
    const name = path.slice(dir.length + 1);
    const { data: list } = await db.storage.from(PROOF_BUCKET).list(dir, { search: name, limit: 1 });
    const obj = list?.find((o) => o.name === name);
    if (!obj) return NextResponse.json({ error: "not_uploaded" }, { status: 400 });
    const meta = (obj.metadata ?? {}) as { mimetype?: string; size?: number };
    // DECIDED 2026-10-26 (사용자: "이거 이상의 파일을 올릴려고 하면 막히게 해줘"): sign 단계의 크기는 브라우저가 알려 준 값이라,
    // 올라간 파일의 실제 크기를 한 번 더 봅니다. 종류 한도(사진 10MB, PDF 20MB)를 넘으면 파일을 지우고 행을 남기지 않습니다.
    if (Number(meta.size ?? 0) > PROOF_MAX_BYTES[m[3] as ProofKind]) {
      await db.storage.from(PROOF_BUCKET).remove([path]);
      return NextResponse.json({ error: "too_big" }, { status: 400 });
    }
    if (await alreadyUploaded(db, team.name, Number(m[2]), m[3])) {
      await db.storage.from(PROOF_BUCKET).remove([path]);
      return NextResponse.json({ error: "already" }, { status: 409 });
    }
    const { error } = await db.from("crossing_mission_proofs").insert({
      team_name: team.name, day: Number(m[2]), kind: m[3], storage_path: path,
      content_type: meta.mimetype ?? "application/octet-stream", size_bytes: Math.max(1, Number(meta.size ?? 1)),
    });
    if (error && error.code !== "23505") return NextResponse.json({ error: "db" }, { status: 500 });
    return NextResponse.json({ ok: true }, { status: 201 });
  }

  return NextResponse.json({ error: "invalid" }, { status: 400 });
}
