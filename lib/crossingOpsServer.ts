// ─────────────────────────────────────────────────────────────────────────────
// 현장 도구 라우트의 서버 공통(2026-10-17). 팀 찾기.
//
// DECIDED 2026-10-17 (사용자: "너무 뭐가 많은데? 그냥 timetable where team can put in their available"):
// 팀 코드를 뺐습니다. 시간표는 모든 팀이 같이 보고, 팀은 목록에서 자기 팀을 골라 칸에 넣습니다(wejoinin처럼).
// 대가: 주소를 아는 사람은 어느 팀으로든 넣고 뺄 수 있습니다. 현장에서만 쓰는 도구라 받아들입니다.
// ─────────────────────────────────────────────────────────────────────────────

import "server-only";
import { createHash } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { CURRENT_EVENT } from "@/lib/registrationWindow";

// 팀에는 따로 만드는 ID가 없습니다. 운영진이 Supabase에 적은 팀 이름이 곧 키입니다(2026-10-17).
export type Team = { name: string };

/** 이름으로 이번 회차의 팀을 찾습니다. 없으면 null. */
export async function findTeam(db: SupabaseClient, name: unknown): Promise<Team | null> {
  if (typeof name !== "string" || !name.trim() || name.length > 40) return null;
  const { data } = await db.from("crossing_teams").select("name").eq("event_slug", CURRENT_EVENT).eq("name", name).maybeSingle();
  return (data as Team | null) ?? null;
}

/** 저장소 폴더 이름. 팀 이름(한글)은 경로에 못 써서 해시 16자로 씁니다. */
export const teamFolder = (name: string) => createHash("sha256").update(name).digest("hex").slice(0, 16);

export const PROOF_BUCKET = "crossing-proofs";
