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
 * Returns the admin client, or null when the env isn't configured — callers
 * treat null as "backend not wired up yet" rather than crashing the route.
 */
export function getSupabaseAdmin(): SupabaseClient | null {
  if (cached) return cached;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;

  cached = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}
