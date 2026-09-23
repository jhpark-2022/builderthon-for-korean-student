// ─────────────────────────────────────────────────────────────────────────────
// Cloudflare Turnstile 서버 검증. 12월 등록 라우트(app/api/crossing/register)만 씁니다.
// 8월 /api/register와 /api/vote는 이 검증을 거치지 않습니다.
//
// DECIDED 2026-09-23: 비밀키는 TURNSTILE_SECRET_KEY(서버 전용, NEXT_PUBLIC_ 없음)입니다.
// 폼의 사이트 키(NEXT_PUBLIC_TURNSTILE_SITE_KEY)는 원래 공개되는 값이라 브라우저에 갑니다.
//
// 비밀키가 없을 때:
//   개발 빌드  검증을 건너뜁니다("skip"). 로컬에서 폼을 시험할 수 있어야 합니다.
//   운영 빌드  "not_configured"를 돌려 라우트가 503을 냅니다. 봇 확인 없이 받는 것보다
//              아예 받지 않는 편이 안전하고, 로그로 바로 드러납니다.
// ─────────────────────────────────────────────────────────────────────────────

import "server-only";
import { TURNSTILE_ACTION } from "./turnstileAction";

const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export type TurnstileResult = "ok" | "skip" | "fail" | "not_configured" | "unavailable";

export async function verifyTurnstile(token: unknown, ip: string): Promise<TurnstileResult> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return process.env.NODE_ENV === "production" ? "not_configured" : "skip";
  if (typeof token !== "string" || !token || token.length > 2048) return "fail";

  const form = new URLSearchParams({ secret, response: token });
  if (ip && ip !== "unknown") form.set("remoteip", ip);
  try {
    const res = await fetch(VERIFY_URL, { method: "POST", body: form, signal: AbortSignal.timeout(5000) });
    if (!res.ok) return "unavailable";
    const data = (await res.json()) as { success?: boolean; action?: string; "error-codes"?: string[] };
    if (!data.success) return "fail";
    // Cloudflare의 시험용 키는 action을 비워 돌려줍니다. 값이 있을 때만 맞춰 봅니다.
    if (data.action && data.action !== TURNSTILE_ACTION) return "fail";
    return "ok";
  } catch {
    // Cloudflare에 닿지 못한 것은 봇의 증거가 아닙니다. 403이 아니라 503으로 돌려 다시 시도하게 합니다.
    return "unavailable";
  }
}
