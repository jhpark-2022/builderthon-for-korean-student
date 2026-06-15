// ─────────────────────────────────────────────────────────────────────────────
// Group matching for solo builders.
// A builder who arrives without a team finishes the personality test, and we
// (a) read the builder role their result already carries, (b) deterministically
// assign them to one of the SQUADS, and (c) surface the complementary roles that
// squad still needs — so solo builders self-organize into balanced teams.
//
// Deterministic + stable: the same result always maps to the same squad, so a
// shared "?r=INFJ-A" link shows a friend the same match (good for the viral loop).
// Pure functions only — content (squad names, role labels) lives in data/quiz.ts.
// ─────────────────────────────────────────────────────────────────────────────

import {
  RESULTS,
  ROLES,
  SQUADS,
  type MbtiKey,
  type Role,
  type RoleKey,
  type Squad,
} from "@/data/quiz";

// Canonical role order — also the order squads get "filled" in.
const ROLE_ORDER: RoleKey[] = ["plan", "dev", "design", "growth"];

export interface GroupMatch {
  squad: Squad;
  yourRole: Role;
  needs: Role[]; // the other three roles, in canonical order
}

// Small stable string hash (djb2) → non-negative int. Used to spread results
// across squads without Math.random (which would break SSR/hydration parity).
function hashString(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

// The role a result contributes to a team (set per-result in data/quiz.ts).
export function roleOf(mbti: MbtiKey): Role {
  return ROLES[RESULTS[mbti].roleKey];
}

// Everything a solo builder needs to see after matching.
export function matchGroup(resultId: string): GroupMatch {
  const mbti = resultId.split("-")[0] as MbtiKey;
  const yourRole = roleOf(mbti);
  // Mix in the full resultId so A/T variants of the same model can land in
  // different squads — keeps the assignment feeling personal, not just per-MBTI.
  const squad = SQUADS[hashString(resultId) % SQUADS.length];
  const needs = ROLE_ORDER.filter((k) => k !== yourRole.key).map((k) => ROLES[k]);
  return { squad, yourRole, needs };
}
