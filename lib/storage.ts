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
// sessionStorage — the open-chat nudge toast has been shown this session.
// Session-scoped on purpose: someone who closes the register modal twice in one
// visit gets nudged once, but a visitor returning next week is a fresh chance.
export const OPENCHAT_NUDGE_KEY = "z100-openchat-nudged";

// ── Day 8 빌더스 초이스 투표 ────────────────────────────────────────────────
// 기기 토큰만 `z100-` 접두사를 쓰지 않습니다. 이 값이 곧 "이 브라우저는 이미
// 투표했다"는 표라서, ?reset=1 쓸기에 함께 지워지면 그 한 줄이 재투표 우회
// 수단이 됩니다. 로케일과 같은 이유의 예외예요.
// localStorage — 익명 기기 토큰 (UUID). 서버의 (track, device_token) 유니크 키.
export const VOTE_DEVICE_KEY = "builderthon.vote-device";
// 아래 둘은 파생 상태라 접두사를 그대로 씁니다. 지워져도 표는 서버에 남아 있고,
// 다시 제출하면 409로 튕겨 "이미 투표하셨어요"가 나옵니다.
// localStorage — 투표자가 고른 자기 팀 (자기 팀 배제용).
export const VOTE_TEAM_KEY = "z100-vote-team";
// localStorage — 트랙별 제출 완료와 고른 팀. JSON {"1":["a","b"],"2":["c"]}.
export const VOTE_DONE_KEY = "z100-vote-done";

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
