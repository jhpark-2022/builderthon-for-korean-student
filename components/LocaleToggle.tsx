"use client";

import { useLocale } from "@/lib/LocaleContext";
import { dict } from "@/data/dictionary";

export default function LocaleToggle({ className = "" }: { className?: string }) {
  const { locale, toggle, t } = useLocale();
  return (
    <button type="button" onClick={toggle} aria-label={t(dict.toggle.aria)}
      className={`inline-flex min-h-[44px] shrink-0 items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold transition hover:border-white/30 ${className}`}>
      <span className={locale === "en" ? "text-violet-400" : "text-white/30"}>EN</span>
      <span className="text-white/20">/</span>
      <span className={locale === "ko" ? "text-violet-400" : "text-white/30"}>KR</span>
    </button>
  );
}
