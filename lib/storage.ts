// ─────────────────────────────────────────────────────────────────────────────
// Centralized browser-storage keys for the site.
//
// Every SITE-LOCAL key uses the `z100-` prefix so the `?reset=1` QA helper can
// sweep them wholesale (a prefix sweep, so future keys are covered automatically
// — add new ones here and they'll be reset without touching the helper). The
// locale preference (`builderthon.locale`, in LocaleContext) is deliberately NOT
// prefixed, so switching to a fresh-user state never wipes the chosen language.
// ─────────────────────────────────────────────────────────────────────────────

export const STORAGE_PREFIX = "z100-";

// sessionStorage — own-result refresh guard (survives a result-screen refresh).
export const QUIZ_OWN_KEY = "z100-quiz-own";
// localStorage — durable quiz result (returning-visitor greeting / attach).
export const QUIZ_RESULT_KEY = "z100-quiz-result";
// sessionStorage — register-form draft saved across the quiz round-trip.
export const REGISTER_DRAFT_KEY = "z100-register-draft";
// localStorage — "already registered" flag (nav button → "등록 완료 ✓").
export const REGISTERED_KEY = "z100-registered";

// Remove every `z100-*` key from BOTH localStorage and sessionStorage. A prefix
// sweep rather than a known-list delete, so keys added later are cleared too.
// Silent no-op when storage is blocked (private mode) or on the server.
export function clearSiteStorage(): void {
  if (typeof window === "undefined") return;
  for (const store of [window.localStorage, window.sessionStorage]) {
    try {
      const doomed: string[] = [];
      for (let i = 0; i < store.length; i++) {
        const k = store.key(i);
        if (k && k.startsWith(STORAGE_PREFIX)) doomed.push(k);
      }
      doomed.forEach((k) => store.removeItem(k));
    } catch {
      /* storage blocked — skip this store */
    }
  }
}
