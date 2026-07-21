// ─────────────────────────────────────────────────────────────────────────────
// Telegram handle normalisation.
//
// The registration contact field asks for a Telegram username — organizers
// invite every participant to the Telegram group chat. It's an ASK, not a gate:
// nothing here rejects a registration. All this does is tidy whatever people
// paste into one storable shape, so organizers aren't left with a mix of
// "@me", "t.me/me" and "  me  " for the same person.
//
// Accepted input, since people paste whatever their app shows them:
//   @jhpark  ·  jhpark  ·  t.me/jhpark  ·  https://t.me/jhpark  ·  telegram.me/jhpark
// All normalise to "@jhpark".
//
// Telegram's own rule: 5–32 characters, letters/digits/underscore, must start
// with a letter. (Telegram also rejects a trailing underscore and doubled
// underscores in new names, but plenty of older accounts have them — we accept
// those rather than rejecting a handle that really exists.)
// ─────────────────────────────────────────────────────────────────────────────

const HANDLE_RE = /^[A-Za-z][A-Za-z0-9_]{4,31}$/;

/**
 * Strip the decoration people paste (an @, a t.me link, stray whitespace) and
 * return the bare username — no validation, no leading "@".
 */
function bare(raw: string): string {
  return raw
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/^(?:www\.)?(?:t(?:elegram)?\.me|telegram\.dog)\//i, "")
    .replace(/^@/, "")
    .replace(/\/+$/, "")
    .trim();
}

/**
 * Canonical "@username" for storage, or null when the input isn't handle-shaped
 * — callers keep the raw text in that case rather than refusing it.
 * Case is preserved as typed — Telegram handles are case-insensitive, but the
 * capitalisation the visitor uses is how they'd recognise themselves.
 */
export function normalizeTelegramHandle(raw: string | null | undefined): string | null {
  if (typeof raw !== "string") return null;
  const name = bare(raw);
  return HANDLE_RE.test(name) ? `@${name}` : null;
}
