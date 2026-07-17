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

interface RegisterContextValue {
  openRegister: () => void;
  registered: boolean;
}

const RegisterContext = createContext<RegisterContextValue | null>(null);

// Set once a submit succeeds → the nav button flips to "등록 완료 ✓" on return.
const REGISTERED_KEY = "z100-registered";

export function useRegister(): RegisterContextValue {
  const ctx = useContext(RegisterContext);
  if (!ctx) throw new Error("useRegister must be used within a RegisterProvider");
  return ctx;
}

export function RegisterProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [registered, setRegistered] = useState(false);
  // Quiz type + referrer captured from the URL on the auto-open path.
  const [urlType, setUrlType] = useState<string | null>(null);
  const [urlRef, setUrlRef] = useState<string | null>(null);

  useEffect(() => {
    // Restore the "already registered" flag (client-only).
    try {
      if (window.localStorage.getItem(REGISTERED_KEY)) setRegistered(true);
    } catch {
      /* storage blocked — treat as not registered */
    }

    // Auto-open from the /quiz result CTA: /?register=1&type=<id>&ref=quiz.
    const params = new URLSearchParams(window.location.search);
    const type = params.get("type");
    const ref = params.get("ref");
    if (type) setUrlType(type);
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

  const openRegister = useCallback(() => setOpen(true), []);
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
        urlType={urlType}
        urlRef={urlRef}
        onSuccess={onSuccess}
      />
    </RegisterContext.Provider>
  );
}
