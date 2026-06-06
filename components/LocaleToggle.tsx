"use client";

import { useLocale } from "@/lib/LocaleContext";
import { dict } from "@/data/dictionary";

// KR/EN language toggle. Highlights the language currently active.
export default function LocaleToggle({ className = "" }: { className?: string }) {
  const { locale, toggle, t } = useLocale();

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={t(dict.toggle.aria)}
      className={`group inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-semibold text-ink-muted shadow-sm transition hover:border-accent/50 ${className}`}
    >
      <span className={locale === "en" ? "text-accent" : "text-ink-faint"}>
        EN
      </span>
      <span className="text-line">/</span>
      <span className={locale === "ko" ? "text-accent" : "text-ink-faint"}>
        KR
      </span>
    </button>
  );
}
