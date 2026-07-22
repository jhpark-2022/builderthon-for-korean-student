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
  useState,
} from "react";
import RegisterModal from "@/components/RegisterModal";
import { REGISTERED_KEY } from "@/lib/storage";

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

    // Auto-open from the /quiz result CTA: /?register=1&ref=quiz[-return].
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref) setUrlRef(ref);
    if (params.get("register") === "1") {
      setOpen(true);
      // Strip the query so a refresh doesn't reopen; the captured type/ref stay
      // in state. Keep the hash (deep-link anchors) intact.
      window.history.replaceState(
        null,
        "",
        window.location.pathname + window.location.hash
      );
    }
  }, []);

  const openRegister = useCallback((next?: RegisterPreset) => {
    setPreset(next ?? null);
    setOpen(true);
  }, []);
  const closeRegister = useCallback(() => setOpen(false), []);
  const onSuccess = useCallback(() => {
    setRegistered(true);
    try {
      window.localStorage.setItem(REGISTERED_KEY, "1");
    } catch {
      /* storage blocked — the label just won't persist across visits */
    }
  }, []);

  return (
    <RegisterContext.Provider value={{ openRegister, registered }}>
      {children}
      <RegisterModal
        open={open}
        onClose={closeRegister}
        urlRef={urlRef}
        preset={preset}
        onSuccess={onSuccess}
        alreadyRegistered={registered}
      />
    </RegisterContext.Provider>
  );
}
