// ─────────────────────────────────────────────────────────────────────────────
// KakaoTalk ID normalisation.
//
// The registration contact field asks for a KakaoTalk ID — organizers run the
// participant group chat on KakaoTalk (open chat: links.openChat). It's an ASK,
// not a gate: nothing here rejects a registration. All this does is tidy
// whatever people paste into one storable shape, so organizers aren't left with
// a mix of "@me", "  me  " and "ID: me" for the same person.
//
// Accepted input, since people paste whatever their app shows them:
//   jhpark  ·  @jhpark  ·  " jhpark "  ·  open.kakao.com/o/... links are NOT ids
// All normalise to "jhpark" — no leading "@".
//
// Kakao's own rule for 카카오톡 ID: 4–20 characters, lowercase English letters,
// digits, period (.) and underscore (_). Unlike Telegram there is no "@"
// convention and no t.me-style profile URL, so the stored form has no sigil.
//
// Kakao IDs are lowercase-only, so a pasted "JHPark" is lowercased rather than
// rejected — that is the same account, just typed with the shift key.
// ─────────────────────────────────────────────────────────────────────────────

const KAKAO_ID_RE = /^[a-z0-9._]{4,20}$/;

/**
 * Strip the decoration people paste (a leading @, a "ID:"/"카톡" label, stray
 * whitespace) and return the bare id, lowercased. No validation here.
 */
function bare(raw: string): string {
  return raw
    .trim()
    .replace(/^(?:카톡|카카오톡|kakao(?:talk)?)\s*(?:id)?\s*[:：]?\s*/i, "")
    .replace(/^@/, "")
    .trim()
    .toLowerCase();
}

/**
 * Canonical KakaoTalk id for storage, or null when the input isn't id-shaped —
 * callers keep the raw text in that case rather than refusing it. Someone whose
 * Kakao account has no id set may well type a phone number or a display name,
 * and losing that contact detail is worse than storing it unnormalised.
 */
export function normalizeKakaoId(raw: string | null | undefined): string | null {
  if (typeof raw !== "string") return null;
  const id = bare(raw);
  return KAKAO_ID_RE.test(id) ? id : null;
}
