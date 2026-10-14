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
import type { Locale, Phrase } from "@/data/dictionaryCore";

// Lightweight i18n - no external library.
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
// useLayoutEffect is called during SSR, so fall back to useEffect there - the
// server never runs either body anyway.
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

// DECIDED 2026-10-14 (사용자: "영어로 바꾼 뒤 링크를 공유하면 받는 사람에게도 영어로, 이미지와 설명도"):
// 지금 언어를 주소에 적습니다. 영어면 ?lang=en, 한국어면 뺍니다(한국어가 기본이라 주소를 깨끗하게 둡니다).
// 그러면 주소창에서 복사한 링크가 언어를 들고 가고, middleware.ts가 그 링크의 공유 카드를 영문판으로 냅니다.
// 새 기록을 쌓지 않도록 replaceState입니다. 해시(#program 같은)는 그대로 둡니다.
function syncLangParam(l: Locale) {
  try {
    const url = new URL(window.location.href);
    if (l === "en") url.searchParams.set("lang", "en");
    else url.searchParams.delete("lang");
    if (url.href !== window.location.href) window.history.replaceState(null, "", url.pathname + url.search + url.hash);
  } catch { /* history blocked */ }
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  // Default locale: ko. The audience is Korean students in Singapore, so this is
  // the language most first-time visitors want - and the server has no way to
  // know better (the preference lives in localStorage, which never reaches it).
  //
  // This value is what the STATIC HTML ships with, so anything server-rendered
  // must agree with it: app/layout.tsx's <html lang>/<data-locale>, and the
  // default branch of the [data-l] rules in globals.css that pick which language
  // the /quiz shell shows. The bootstrap script in the layout corrects all of
  // that before paint for visitors who have chosen otherwise; this default is
  // what everyone else, and anyone with JS off, ends up on.
  const [locale, setLocaleState] = useState<Locale>("ko");
  // 저장값을 읽기 전에는 주소를 건드리지 않습니다. 첫 렌더의 "ko"가 ?lang=en을 지우면 안 됩니다.
  const restoredRef = useRef(false);

  // Restore a saved preference. BEFORE PAINT (see useIsomorphicLayoutEffect):
  // the first client render still produces Korean to match the server HTML, and
  // this swaps it in the same frame, so the hydration mismatch is never visible.
  useIsomorphicLayoutEffect(() => {
    if (typeof window === "undefined") return;
    // ?lang=en|ko가 저장값보다 먼저입니다(app/layout.tsx의 alternates.languages, 2026-09-18). 값은
    // 저장해 두어 다음 방문에도 이어집니다.
    const q = new URLSearchParams(window.location.search).get("lang");
    restoredRef.current = true;
    if (q === "ko" || q === "en") {
      setLocaleState(q);
      try { window.localStorage.setItem(STORAGE_KEY, q); } catch { /* storage blocked */ }
      syncLangParam(q);
      return;
    }
    let saved: string | null = null;
    try { saved = window.localStorage.getItem(STORAGE_KEY); } catch { /* storage blocked */ }
    if (saved === "ko" || saved === "en") setLocaleState(saved);
    if (saved === "en") syncLangParam("en");
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

  // 페이지를 옮기면(클라이언트 이동) 새 주소에는 ?lang이 없습니다. 영어면 다시 붙입니다.
  useEffect(() => {
    if (restoredRef.current && locale === "en") syncLangParam("en");
  }, [locale, pathname]);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, l);
      syncLangParam(l);
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
