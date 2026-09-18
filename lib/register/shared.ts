// ─────────────────────────────────────────────────────────────────────────────
// 등록 라우트의 공통 로직. 2026-09-18에 app/api/register/route.ts(8월)에서 꺼냈습니다.
// 8월 라우트와 12월 라우트(app/api/crossing/register)가 같이 씁니다. 8월 라우트의
// 동작·응답은 그대로입니다(옮겼을 뿐). 값을 고치면 두 라우트가 같이 바뀝니다.
// ─────────────────────────────────────────────────────────────────────────────

import { createHash } from "node:crypto";

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const MAX_MEMBERS = 3;

// ── Throttle limits ─────────────────────────────────────────────────────────
// Tuned to be USELESS against a real student and painful for a script. The
// binding constraint is a campus shared IP: at an info session a whole room can
// register from one NAT'd address within minutes, and locking that out would
// cost far more than the spam it prevents. Hence limits an individual will
// never reach and a flood always will.
export const PER_IP_SHORT = { minutes: 10, max: 10 };
export const PER_IP_LONG = { minutes: 60, max: 30 };
// Circuit breaker across ALL submitters: if the whole table is moving this
// fast, something automated is running regardless of source address.
export const GLOBAL = { minutes: 10, max: 120 };
// Generous caps that still stop someone pasting a novel into a text input.
export const MAX_LEN = 200;

export type Json = Record<string, unknown>;

/** Trim + length-cap a value that must be a non-empty string. */
export function str(v: unknown, maxLen: number = MAX_LEN): string {
  return typeof v === "string" ? v.trim().slice(0, maxLen) : "";
}
/** Same, but empty → null (for the optional columns). */
export function optStr(v: unknown, maxLen: number = MAX_LEN): string | null {
  return str(v, maxLen) || null;
}

/**
 * Salted, one-way fingerprint of the submitter's IP.
 *
 * The raw address never reaches the database. The salt is derived from
 * SUPABASE_SERVICE_ROLE_KEY rather than a new env var: it is already required
 * for this route to function at all, is server-only, and rotating it (which is
 * what you'd do after a leak) invalidates every stored hash. The hash is
 * therefore meaningless outside this deployment.
 */
export function hashIp(ip: string, secret: string): string {
  return createHash("sha256").update(`${secret}::ip-salt::${ip}`).digest("hex");
}

/**
 * Best-effort client IP. `x-forwarded-for` is a comma-separated chain appended
 * to by each proxy, so the ORIGINAL client is the first entry. Locally it's
 * usually absent, which is why an unknown IP still gets throttled under one
 * shared "unknown" bucket. Failing open would make the limiter bypassable.
 */
export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) {
    const first = fwd.split(",")[0]?.trim();
    if (first) return first;
  }
  return req.headers.get("x-real-ip")?.trim() || "unknown";
}

/**
 * Name/email pairs straight off an unvalidated body, for the honeypot log only.
 * Deliberately tolerant: it describes a submission we are about to throw away,
 * so it must not throw on a malformed payload.
 */
export function rawMembersPreview(body: Json): { name: string; email: string }[] | null {
  if (!Array.isArray(body.members)) return null;
  return body.members.slice(0, MAX_MEMBERS).map((m) => {
    const src = (m ?? {}) as Json;
    return { name: str(src.name), email: str(src.email) };
  });
}

export const sinceIso = (minutes: number) =>
  new Date(Date.now() - minutes * 60_000).toISOString();

/** 스로틀 판정. 셋 다 head count. 실패한 COUNT는 0으로 보고 막지 않는다(가드레일이지 게이트가 아님). */
export type ThrottleCounts = { short: number | null; long: number | null; global: number | null };
export function throttleVerdict(c: ThrottleCounts): "ok" | "ip" | "global" {
  if ((c.short ?? 0) >= PER_IP_SHORT.max || (c.long ?? 0) >= PER_IP_LONG.max) return "ip";
  if ((c.global ?? 0) >= GLOBAL.max) return "global";
  return "ok";
}
