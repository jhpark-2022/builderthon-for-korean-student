// ─────────────────────────────────────────────────────────────────────────────
// Centralized browser-storage keys for the site.
//
// Every SITE-LOCAL key uses the `z100-` prefix so the `?reset=1` QA helper can
// sweep them wholesale (a prefix sweep, so future keys are covered automatically
// - add new ones here and they'll be reset without touching the helper). The
// locale preference (`builderthon.locale`, in LocaleContext) is deliberately NOT
// prefixed, so switching to a fresh-user state never wipes the chosen language.
// ─────────────────────────────────────────────────────────────────────────────

export const STORAGE_PREFIX = "z100-";

// sessionStorage - own-result refresh guard (survives a result-screen refresh).
export const QUIZ_OWN_KEY = "z100-quiz-own";
// localStorage - durable quiz result (returning-visitor greeting / attach).
export const QUIZ_RESULT_KEY = "z100-quiz-result";
// 12월판(/match, 크로싱 서울 현장 팀 매칭)의 같은 두 키와 기기 토큰 (2026-10-08). 접두사가 z100-이 아니라서
// 8월 페이지의 ?reset=1 청소(clearSiteStorage)에 걸리지 않습니다. 8월 결과와 섞이지 않게 따로 둡니다.
export const MATCH_OWN_KEY = "naru-match-own-2026-12";
export const MATCH_RESULT_KEY = "naru-match-result-2026-12";
// localStorage: /match 시작 화면에 넣은 이름과 나라, 이 기기의 무작위 토큰(한 기기 한 행), 저장이 끝난 결과 id.
export const MATCH_PROFILE_KEY = "naru-match-profile-2026-12";
export const MATCH_DEVICE_KEY = "naru-match-device";
export const MATCH_SAVED_KEY = "naru-match-saved-2026-12";
// localStorage - "already registered" flag (nav button → "등록 완료 ✓").
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
      /* storage blocked - skip this store */
    }
  }
}
