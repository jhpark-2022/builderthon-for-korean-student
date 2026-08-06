"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import type { Locale, Phrase } from "@/data/dictionary";

// Lightweight i18n — no external library.
// LocaleProvider holds "ko" | "en"; useLocale() exposes the current locale, a
// setter/toggle, and a t() helper that resolves a { ko, en } phrase to a string.

interface LocaleContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  toggle: () => void;
  t: (phrase: Phrase) => string;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

const STORAGE_KEY = "builderthon.locale";

// useLayoutEffect runs before the browser paints; useEffect can run after it.
// That difference is the whole flash: with useEffect an English visitor gets one
// painted frame of Korean before the restore lands. React warns when
// useLayoutEffect is called during SSR, so fall back to useEffect there — the
// server never runs either body anyway.
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  // Default locale: ko. The audience is Korean students in Singapore, so this is
  // the language most first-time visitors want — and the server has no way to
  // know better (the preference lives in localStorage, which never reaches it).
  //
  // This value is what the STATIC HTML ships with, so anything server-rendered
  // must agree with it: app/layout.tsx's <html lang>/<data-locale>, and the
  // default branch of the [data-l] rules in globals.css that pick which language
  // the /quiz shell shows. The bootstrap script in the layout corrects all of
  // that before paint for visitors who have chosen otherwise; this default is
  // what everyone else, and anyone with JS off, ends up on.
  const [locale, setLocaleState] = useState<Locale>("ko");

  // Restore a saved preference. BEFORE PAINT (see useIsomorphicLayoutEffect):
  // the first client render still produces Korean to match the server HTML, and
  // this swaps it in the same frame, so the hydration mismatch is never visible.
  useIsomorphicLayoutEffect(() => {
    const saved =
      typeof window !== "undefined"
        ? (window.localStorage.getItem(STORAGE_KEY) as Locale | null)
        : null;
    if (saved === "ko" || saved === "en") setLocaleState(saved);
  }, []);

  // Keep <html> in sync: `lang` for accessibility, `data-locale` for the CSS that
  // drives the pre-hydration /quiz shell. Both are already correct on arrival
  // (the layout's bootstrap script); this is what keeps them right after a
  // toggle, which never reloads the page.
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale;
      document.documentElement.setAttribute("data-locale", locale);
    }
  }, [locale]);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, l);
    }
  }, []);

  const toggle = useCallback(() => {
    setLocale(locale === "ko" ? "en" : "ko");
  }, [locale, setLocale]);

  const t = useCallback((phrase: Phrase) => phrase[locale], [locale]);

  const value = useMemo(
    () => ({ locale, setLocale, toggle, t }),
    [locale, setLocale, toggle, t]
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within a LocaleProvider");
  return ctx;
}
