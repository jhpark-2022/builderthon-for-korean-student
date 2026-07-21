// ─────────────────────────────────────────────────────────────────────────────
// Telegram handle normalisation + validation.
//
// The registration contact field is a Telegram username, full stop — organizers
// invite every participant to the Telegram group chat, so anything else (a phone
// number, a KakaoTalk id) means a registrant we can't reach. Shared by the
// client form (instant feedback) and app/api/register (the actual gate), so both
// accept exactly the same inputs and store exactly the same shape.
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

/** True when the input is a usable Telegram handle in any accepted form. */
export function isTelegramHandle(raw: string | null | undefined): boolean {
  return typeof raw === "string" && HANDLE_RE.test(bare(raw));
}

/**
 * Canonical "@username" for storage, or null if the input isn't a valid handle.
 * Case is preserved as typed — Telegram handles are case-insensitive, but the
 * capitalisation the visitor uses is how they'd recognise themselves.
 */
export function normalizeTelegramHandle(raw: string | null | undefined): string | null {
  if (typeof raw !== "string") return null;
  const name = bare(raw);
  return HANDLE_RE.test(name) ? `@${name}` : null;
}
