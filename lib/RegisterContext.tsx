"use client";

// ─────────────────────────────────────────────────────────────────────────────
// Registration modal state, shared across the page.
//
// The "등록하기" flow is triggered from three places that live in different
// component trees — the hero question-hook (Journey), the scroll-revealed nav
// button (JourneyNav), and a URL auto-open (?register=1 from the /quiz result
// CTA) — so the open state + the single RegisterModal instance live here, above
// both siblings. Consumers only need `openRegister()` and the `registered` flag.
//
// Provider is mounted in app/page.tsx, INSIDE LocaleProvider (layout) so the
// modal can use useLocale().
// ─────────────────────────────────────────────────────────────────────────────

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import RegisterModal from "@/components/RegisterModal";
import OpenChatNudge from "@/components/OpenChatNudge";
import { OPENCHAT_NUDGE_KEY, REGISTERED_KEY } from "@/lib/storage";
import { REGISTRATION_CLOSES_AT, isRegistrationClosed } from "@/lib/registrationWindow";

// Optional starting state for the modal, so a CTA can express what it promised.
// The hero's "팀이 없어도 괜찮아요 → 등록하고 팀 매칭 받기" card opens the form
// already set to solo + matching, instead of making the visitor re-answer a
// question they just answered by clicking.
export interface RegisterPreset {
  joinType?: "team" | "solo";
  wantsMatching?: boolean;
}

interface RegisterContextValue {
  openRegister: (preset?: RegisterPreset) => void;
  registered: boolean;
  // Whether the modal is currently open — the mobile sticky bar has to hide
  // while it is, or it sits on top of the form it just opened.
  registerOpen: boolean;
  // True once the deadline (2:15 PM SGT) has passed. Every register CTA reads
  // this to render a disabled "신청 마감" state; openRegister() becomes a no-op.
  // The API enforces the same cutoff independently — this is the UX half.
  closed: boolean;
}

const RegisterContext = createContext<RegisterContextValue | null>(null);

export function useRegister(): RegisterContextValue {
  const ctx = useContext(RegisterContext);
  if (!ctx) throw new Error("useRegister must be used within a RegisterProvider");
  return ctx;
}

export function RegisterProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [registered, setRegistered] = useState(false);
  // Starts false to match the server's first paint (same pattern as
  // `registered`), then corrected on mount and flipped live by a timer if the
  // tab is open across the deadline. The API is the real gate; this drives UI.
  const [closed, setClosed] = useState(false);
  // Holds the pending deadline-flip timeout so the mount effect can clear it.
  const deadlineTimer = useRef<number | undefined>(undefined);
  // Referrer captured from the URL on the auto-open path ("quiz" | "quiz-return").
  // The AI type is NEVER passed via the URL — it's read from this device's saved
  // result inside the modal (localStorage), so there's no cross-device leak.
  const [urlRef, setUrlRef] = useState<string | null>(null);
  // Preset applied on the next open (cleared by the modal once consumed).
  const [preset, setPreset] = useState<RegisterPreset | null>(null);

  useEffect(() => {
    // Restore the "already registered" flag (client-only).
    try {
      if (window.localStorage.getItem(REGISTERED_KEY)) setRegistered(true);
    } catch {
      /* storage blocked — treat as not registered */
    }

    // Deadline: correct the flag on mount, then schedule the exact flip if the
    // tab loaded before 2:15 and stays open — so a long-open page closes itself
    // to the second instead of waiting for a refresh. setTimeout's ~24.8-day cap
    // is far beyond this hours-away deadline.
    if (isRegistrationClosed()) {
      setClosed(true);
    } else {
      const ms = REGISTRATION_CLOSES_AT - Date.now();
      deadlineTimer.current = window.setTimeout(() => setClosed(true), ms);
    }

    // Auto-open from the /quiz result CTA: /?register=1&ref=quiz[-return].
    //
    // DECIDED 2026-08-22 (마감 후 청산): 이 경로로는 더 이상 모달을 열지 않습니다.
    // 페이지의 등록 진입점을 전부 걷어냈는데 URL 하나가 살아 있으면, 예전 링크나
    // 북마크를 타고 온 사람에게만 아무 데서도 닿을 수 없는 모달이 튀어나옵니다.
    // 쿼리를 지우는 것은 그대로 둡니다 — 주소창에 죽은 파라미터를 남길 이유가
    // 없어요. `ref`는 계속 읽습니다(유입 출처는 여전히 유효한 정보).
    // 모달 자체와 openRegister()는 살아 있습니다. 다음 라운드에 되살릴 때는
    // 아래 setOpen(true) 한 줄만 돌려놓으면 됩니다.
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref) setUrlRef(ref);
    if (params.get("register") === "1") {
      // Strip the query so the dead parameter doesn't linger in the address bar.
      // Keep the hash (deep-link anchors) intact.
      window.history.replaceState(
        null,
        "",
        window.location.pathname + window.location.hash
      );
    }

    return () => {
      if (deadlineTimer.current !== undefined) {
        window.clearTimeout(deadlineTimer.current);
      }
    };
  }, []);

  const openRegister = useCallback((next?: RegisterPreset) => {
    // Past the deadline the form no longer opens — the CTAs are already in their
    // disabled "신청 마감" state and the API would reject the POST anyway. Guard
    // here too so a stale in-page trigger can't reopen it.
    if (isRegistrationClosed()) {
      setClosed(true);
      return;
    }
    setPreset(next ?? null);
    setOpen(true);
  }, []);
  // Dismissing the form without submitting is the moment to offer the
  // low-commitment alternative. Deliberately NOT a second modal: the toast
  // renders outside the dialog and self-dismisses, so it can't fight
  // RegisterModal's focus restoration or stack a dialog on a closing dialog.
  // Suppressed for anyone already registered (nothing to nudge them toward) and
  // capped at once per session via sessionStorage.
  const [nudge, setNudge] = useState(false);
  const closeRegister = useCallback(() => {
    setOpen(false);
    if (registered) return;
    try {
      if (window.sessionStorage.getItem(OPENCHAT_NUDGE_KEY)) return;
      window.sessionStorage.setItem(OPENCHAT_NUDGE_KEY, "1");
    } catch {
      /* storage blocked — show it this once rather than not at all */
    }
    setNudge(true);
  }, [registered]);
  const onSuccess = useCallback(() => {
    setRegistered(true);
    try {
      window.localStorage.setItem(REGISTERED_KEY, "1");
    } catch {
      /* storage blocked — the label just won't persist across visits */
    }
  }, []);

  return (
    <RegisterContext.Provider value={{ openRegister, registered, registerOpen: open, closed }}>
      {children}
      <RegisterModal
        open={open}
        onClose={closeRegister}
        urlRef={urlRef}
        preset={preset}
        onSuccess={onSuccess}
        alreadyRegistered={registered}
      />
      <OpenChatNudge open={nudge} onClose={() => setNudge(false)} />
    </RegisterContext.Provider>
  );
}
