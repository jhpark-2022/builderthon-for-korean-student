"use client";

import { useLocale } from "@/lib/LocaleContext";
import { dict } from "@/data/dictionary";

// variant "naru" (2026-09-18, 감사 반영 브리프 2.3): 현재 언어를 색만으로 구분하지 않습니다(WCAG
// 1.4.1). 밑줄 + 굵기, aria-current, 각 버튼에 lang. 8월 페이지와 /quiz는 기본 변형 그대로입니다.
export default function LocaleToggle({ className = "", variant = "zero100" }: { className?: string; variant?: "zero100" | "naru" }) {
  const { locale, toggle, t, setLocale } = useLocale();
  if (variant === "naru") {
    const item = (l: "en" | "ko", label: string) => {
      const here = locale === l;
      return (
        <button
          type="button"
          lang={l}
          aria-current={here ? "true" : undefined}
          onClick={() => setLocale(l)}
          className={`inline-flex min-h-[44px] items-center px-1.5 underline-offset-4 transition ${here ? "font-bold text-white underline decoration-accent decoration-2" : "font-medium text-white/55 hover:text-white"}`}
        >
          {label}
        </button>
      );
    };
    return (
      <div role="group" aria-label={t(dict.toggle.aria)} className={`inline-flex min-h-[44px] shrink-0 items-center rounded-full border border-white/15 bg-white/5 px-1.5 text-xs ${className}`}>
        {item("en", "EN")}
        <span aria-hidden className="text-white/20">/</span>
        {item("ko", "KR")}
      </div>
    );
  }
  return (
    <button type="button" onClick={toggle} aria-label={t(dict.toggle.aria)}
      className={`inline-flex min-h-[44px] shrink-0 items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold transition hover:border-white/30 ${className}`}>
      <span className={locale === "en" ? "text-accent" : "text-white/55"}>EN</span>
      <span className="text-white/20">/</span>
      <span className={locale === "ko" ? "text-violet-400" : "text-white/30"}>KR</span>
    </button>
  );
}
