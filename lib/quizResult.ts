// ─────────────────────────────────────────────────────────────────────────────
// Persistent "own result" store for the /quiz personality test.
//
// This is the DURABLE layer (localStorage) — it survives a browser restart, so a
// returning visitor to the main site can be greeted by name ("안녕하세요, 조급한
// Mistral님 👋"). It sits ON TOP of the existing sessionStorage own-result key in
// components/Quiz.tsx (OWN_KEY, "z100-quiz-own"), which only needs to survive a
// result-screen refresh — the two are independent and both are consulted.
//
// SAVE POLICY (critical): call saveOwnResult ONLY the moment a visitor finishes
// the quiz themselves. Never persist a `?r=` deep-linked result — that's usually
// a friend's share, and saving it would greet the visitor as someone else's type.
//
// All access is SSR-guarded and try/catch-wrapped: in a blocked-storage
// environment (private mode, disabled cookies) every function is a silent no-op
// (writes) or returns null (reads), exactly like the sessionStorage helpers.
// ─────────────────────────────────────────────────────────────────────────────

import { parseResultId, type Choice } from "@/lib/quizScore";
import { QUIZ_RESULT_KEY as KEY } from "@/lib/storage";

// Bump `v` if the stored shape ever changes; loadOwnResult treats an unknown
// version as invalid (→ null + key removed), so old blobs never mis-render.
// `answers` was ADDED at v1 rather than bumping: it's optional on read, so an
// older axis-less blob still loads (the visitor keeps their greeting and just
// sees no gauges until their next take) instead of being thrown away.
const VERSION = 1;

export interface OwnResult {
  resultId: string; // e.g. "ESTP-T" — the ONLY identity we persist
  savedAt: string; // ISO timestamp of when it was saved
  // The 14 raw answers, so revisiting your own result can re-score it and show
  // the per-axis % gauges again. We store the ANSWERS, not the computed axes:
  // re-running scoreQuiz keeps the displayed numbers in lockstep with the
  // current scoring logic (and `spice` is a pure function of the answers, so
  // the percentages come back bit-identical). Absent on pre-existing blobs.
  answers?: Choice[];
}

// Persist the visitor's own freshly-taken result. Overwrites any previous one
// (a retake replaces the old type). No-op on the server or when storage throws.
export function saveOwnResult(resultId: string, answers?: Choice[]): void {
  if (typeof window === "undefined") return;
  try {
    const payload = JSON.stringify({
      v: VERSION,
      resultId,
      savedAt: new Date().toISOString(),
      ...(answers ? { answers } : {}),
    });
    window.localStorage.setItem(KEY, payload);
  } catch {
    /* storage blocked (private mode, quota) — silently skip persistence */
  }
}

// A stored `answers` blob is only usable if it's an array of "a"/"b". Anything
// else (hand-edited storage, a future answer format) is dropped silently — the
// result still loads, just without gauges.
function parseAnswers(raw: unknown): Choice[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  if (!raw.every((c) => c === "a" || c === "b")) return undefined;
  return raw as Choice[];
}

// Read + validate the stored result. Returns null (and clears the key) on any
// problem: missing, unparseable JSON, wrong version, or a resultId that no longer
// passes parseResultId (so a future change to the type system can't resurrect a
// now-invalid type). Never throws.
export function loadOwnResult(): OwnResult | null {
  if (typeof window === "undefined") return null;
  let raw: string | null;
  try {
    raw = window.localStorage.getItem(KEY);
  } catch {
    return null; // storage blocked — behave as "no saved result"
  }
  if (!raw) return null;

  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) throw new Error("bad shape");
    const { v, resultId, savedAt, answers } = parsed as {
      v?: unknown;
      resultId?: unknown;
      savedAt?: unknown;
      answers?: unknown;
    };
    if (v !== VERSION) throw new Error("version mismatch");
    // parseResultId is the single source of truth for a valid type id.
    if (typeof resultId !== "string" || !parseResultId(resultId)) {
      throw new Error("invalid resultId");
    }
    return {
      resultId,
      savedAt: typeof savedAt === "string" ? savedAt : "",
      answers: parseAnswers(answers),
    };
  } catch {
    clearOwnResult(); // drop the corrupt/stale blob so we don't re-check it
    return null;
  }
}

// Forget the stored result. No-op on the server or when storage throws.
export function clearOwnResult(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* storage blocked — no-op */
  }
}
