"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePathname } from "next/navigation";
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
    if (typeof window === "undefined") return;
    // ?lang=en|ko가 저장값보다 먼저입니다(app/layout.tsx의 alternates.languages, 2026-09-18). 값은
    // 저장해 두어 다음 방문에도 이어집니다.
    const q = new URLSearchParams(window.location.search).get("lang");
    if (q === "ko" || q === "en") {
      setLocaleState(q);
      try { window.localStorage.setItem(STORAGE_KEY, q); } catch { /* storage blocked */ }
      return;
    }
    let saved: string | null = null;
    try { saved = window.localStorage.getItem(STORAGE_KEY); } catch { /* storage blocked */ }
    if (saved === "ko" || saved === "en") setLocaleState(saved);
  }, []);

  // Keep <html> in sync: `lang` for accessibility, `data-locale` for the CSS that
  // drives the pre-hydration /quiz shell. Both are already correct on arrival
  // (the layout's bootstrap script); this is what keeps them right after a
  // toggle, which never reloads the page.
  //
  // 탭 제목(DECIDED 2026-09-23, 첫 방문자 리뷰): 서버는 한국어 제목을 냅니다(SEO). 페이지가
  // <meta name="naru:title-en">을 가지고 있으면 EN에서 탭 제목을 그 값으로 바꾸고, KR로 돌아오면
  // 처음 읽은 한국어 제목으로 되돌립니다. 메타가 없는 페이지에서는 아무것도 하지 않습니다.
  // pathname을 같이 보는 것은 클라이언트 이동으로 페이지가 바뀌어도 새 페이지의 값을 읽기 위해서입니다.
  const koTitleRef = useRef<string | null>(null);
  const pathname = usePathname();
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale;
      document.documentElement.setAttribute("data-locale", locale);
      const en = document.querySelector('meta[name="naru:title-en"]')?.getAttribute("content");
      if (!en) return;
      if (document.title !== en) koTitleRef.current = document.title;
      if (locale === "en") document.title = en;
      else if (koTitleRef.current) document.title = koTitleRef.current;
    }
  }, [locale, pathname]);

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
