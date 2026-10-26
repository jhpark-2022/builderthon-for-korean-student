// ─────────────────────────────────────────────────────────────────────────────
// Server-only Supabase client, holding the service_role key.
//
// service_role BYPASSES row-level security, so this module must never be
// imported from a "use client" component. It is only reachable from route
// handlers (see app/api/register/route.ts). The env var is deliberately NOT
// prefixed with NEXT_PUBLIC_ so Next.js cannot inline it into a client bundle.
// ─────────────────────────────────────────────────────────────────────────────

import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cached: SupabaseClient | null = null;

/**
 * Returns the admin client, or null when the env isn't configured - callers
 * treat null as "backend not wired up yet" rather than crashing the route.
 */
export function getSupabaseAdmin(): SupabaseClient | null {
  if (cached) return cached;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;

  // DECIDED 2026-10-26 (끝에서 끝 시험에서 발견): Next 14는 서버의 fetch 결과를 데이터 캐시에 둡니다. supabase-js도 그 fetch를 쓰므로,
  // 같은 조회가 지운 예약이나 빈 목록을 계속 돌려줬습니다(멘토 페이지). 이 클라이언트의 모든 요청은 캐시 없이 갑니다.
  // 라우트의 dynamic = "force-dynamic"만으로는 막히지 않았습니다.
  cached = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }) },
  });
  return cached;
}
