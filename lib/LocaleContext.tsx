"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
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

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  // Default locale: en (the timetable is in English).
  const [locale, setLocaleState] = useState<Locale>("en");

  // Restore a saved preference on mount (client-only).
  useEffect(() => {
    const saved =
      typeof window !== "undefined"
        ? (window.localStorage.getItem(STORAGE_KEY) as Locale | null)
        : null;
    if (saved === "ko" || saved === "en") setLocaleState(saved);
  }, []);

  // Keep <html lang> in sync for accessibility.
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale;
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
