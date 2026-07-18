"use client";

// ─────────────────────────────────────────────────────────────────────────────
// Undocumented QA/reset helper. Visiting any page with `?reset=1` wipes this
// device's site-local storage so fresh-user flows can be tested on the deployed
// site — including phones, where DevTools isn't practical. No UI surface beyond a
// confirmation toast.
//
// Mounted as the FIRST child on both the main page and /quiz, so its effect fires
// before the greeting pill / deep-link / register-modal effects read storage —
// after a `?reset=1` load the page renders exactly like a first-time visitor,
// with no second refresh needed.
//
// Safety: only ever touches THIS browser's storage for THIS site (a `z100-*`
// prefix sweep). No server calls, no effect on anyone else.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useLocale } from "@/lib/LocaleContext";
import { dict } from "@/data/dictionary";
import { clearSiteStorage } from "@/lib/storage";

export default function ResetHandler() {
  const { t } = useLocale();
  const reduce = useReducedMotion();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("reset") !== "1") return;

    // Wipe every z100-* key from both storages (prefix sweep, future-proof).
    clearSiteStorage();

    // Strip ?reset so a refresh doesn't re-trigger; keep any other params + hash.
    params.delete("reset");
    const qs = params.toString();
    window.history.replaceState(
      null,
      "",
      window.location.pathname + (qs ? `?${qs}` : "") + window.location.hash
    );

    setShow(true);
    const id = window.setTimeout(() => setShow(false), 3200);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        // Centered via a flex wrapper (not a transform) so framer's y-animation
        // doesn't fight the horizontal centering.
        <div className="pointer-events-none fixed inset-x-0 bottom-8 z-[70] flex justify-center px-4">
          <motion.div
            role="status"
            aria-live="polite"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
            className="rounded-full border border-white/15 bg-[#13131f] px-5 py-3 text-center text-sm font-semibold text-white shadow-xl"
          >
            {t(dict.resetToast)}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
