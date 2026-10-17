// ─────────────────────────────────────────────────────────────────────────────
// 현장 도구 라우트의 서버 공통(2026-10-17). 팀 코드로 팀 찾기, 운영진 키 확인, 팀 코드 만들기.
//
// 로그인이 없습니다. 팀은 Day 1에 운영진이 준 6자 코드로, 운영진은 CROSSING_STAFF_KEY로 들어옵니다.
// 코드는 31자 6자리(약 8.9억 가지)이고 한 회차의 팀은 20개 안팎이라 맞혀서 들어오기 어렵습니다.
// 틀린 코드는 IP별로 세어 막습니다(아래 badCodeGate).
// ─────────────────────────────────────────────────────────────────────────────

import "server-only";
import { randomInt, timingSafeEqual } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { CURRENT_EVENT } from "@/lib/registrationWindow";
import { TEAM_CODE_ALPHABET, isTeamCode, normalizeTeamCode } from "@/lib/crossingOps";

export type Team = { id: string; name: string; code: string };

export function newTeamCode(): string {
  let s = "";
  for (let i = 0; i < 6; i++) s += TEAM_CODE_ALPHABET[randomInt(TEAM_CODE_ALPHABET.length)];
  return s;
}

// 틀린 코드 시도. 인스턴스 메모리라 완벽하지 않지만(인스턴스가 여럿이면 각자 셉니다) 코드 공간이 커서 이 정도면 됩니다.
const bad = new Map<string, { n: number; since: number }>();
const BAD_WINDOW_MS = 10 * 60_000;
const BAD_MAX = 20;
export function badCodeGate(ip: string, hit = false): boolean {
  const now = Date.now();
  const cur = bad.get(ip);
  const rec = !cur || now - cur.since > BAD_WINDOW_MS ? { n: 0, since: now } : cur;
  if (hit) rec.n += 1;
  bad.set(ip, rec);
  return rec.n < BAD_MAX;
}

/** 코드로 팀을 찾습니다. 형식이 틀리거나 없으면 null. */
export async function findTeam(db: SupabaseClient, raw: unknown): Promise<Team | null> {
  const code = normalizeTeamCode(raw);
  if (!isTeamCode(code)) return null;
  const { data } = await db.from("crossing_teams").select("id, name, code").eq("event_slug", CURRENT_EVENT).eq("code", code).maybeSingle();
  return (data as Team | null) ?? null;
}

/** 운영진 키. 환경 변수가 없으면 "unset"(라우트는 503). */
export function staffKeyVerdict(req: Request): "ok" | "bad" | "unset" {
  const want = process.env.CROSSING_STAFF_KEY;
  if (!want) return "unset";
  const got = req.headers.get("x-staff-key") ?? "";
  const a = Buffer.from(got), b = Buffer.from(want);
  return a.length === b.length && timingSafeEqual(a, b) ? "ok" : "bad";
}

export const PROOF_BUCKET = "crossing-proofs";
