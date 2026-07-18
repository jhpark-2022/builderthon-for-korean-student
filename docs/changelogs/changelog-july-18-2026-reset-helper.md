# Changelog — July 18, 2026 (?reset=1 QA helper)

**Project:** Builderthon marketing site (Next.js)
**Branch:** `main`
**Window covered:** an undocumented reset mechanism for testing fresh-user flows
on the deployed site (including phones, where DevTools isn't practical).

## Summary

Visiting any page with `?reset=1` wipes this device's site-local storage — every
`z100-*` key from both localStorage and sessionStorage — shows a confirmation
toast, and strips the param. The page then renders exactly like a first-time
visitor with **no second refresh**. No UI surface beyond the toast; no server
calls; other apps' localhost keys are untouched.

## Changes

- **`lib/storage.ts`** (new) — single home for every site-local storage key
  (`QUIZ_OWN_KEY`, `QUIZ_RESULT_KEY`, `REGISTER_DRAFT_KEY`, `REGISTERED_KEY`,
  all `z100-` prefixed) plus `STORAGE_PREFIX` and `clearSiteStorage()`. The clear
  is a **prefix sweep** (not a known-list delete), so future `z100-*` keys are
  covered automatically. The non-prefixed locale pref (`builderthon.locale`) is
  deliberately left intact so a reset never changes the chosen language.
- **Refactor** — `lib/quizResult.ts`, `lib/RegisterContext.tsx`,
  `components/RegisterModal.tsx`, and `components/Quiz.tsx` now import their keys
  from `lib/storage.ts` instead of defining local literals.
- **`components/ResetHandler.tsx`** (new) — on mount, if `?reset=1` is present it
  calls `clearSiteStorage()`, strips the `reset` param via `history.replaceState`
  (so a refresh doesn't re-trigger), and shows a bottom-center toast
  (`role="status"`, `aria-live="polite"`). All storage access is try/catch-guarded
  (private mode).
- **Ordering** — `ResetHandler` is the **first child** on both `app/page.tsx` and
  `app/quiz/page.tsx`, so its effect fires before the greeting pill / deep-link /
  register-modal effects read storage. On `/quiz` it sits outside the Suspense
  boundary (it reads `window.location` directly, no `useSearchParams`).
- **Copy** — `dict.resetToast` (ko: "저장된 로컬 데이터를 지웠어요 — 새 사용자 상태예요"
  / en: "Local data cleared — you're a fresh user now").

## Verification

- `npx tsc --noEmit` — clean. `npm run build` — compiled successfully, 9/9 pages,
  lint clean.
- Live QA (dev server), storage seeded with all four `z100-*` keys plus unrelated
  localhost keys from other apps:
  - **`/?reset=1`** → toast shown, URL stripped to `/`, the "Welcome back" greeting
    pill gone and the hero hook back to "Personality test" — **without a second
    refresh**. Storage after: `z100-*` empty in both stores; `builderthon.locale`
    and other apps' keys (`richdivine-store`, `cfa-tutor-usage-seen`, …) preserved.
  - **`/quiz?reset=1`** → KO toast "저장된 로컬 데이터를 지웠어요 — 새 사용자 상태예요",
    URL stripped to `/quiz`, the landing's "지난 결과" hint gone, `z100-quiz-result`
    cleared — again with no second refresh.
  - No console/hydration errors.
