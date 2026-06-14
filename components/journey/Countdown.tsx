"use client";

import { useEffect, useState } from "react";
import { useLocale } from "@/lib/LocaleContext";
import { dict } from "@/data/dictionary";

// Registration deadline — 300 days from the time the bundle is built/first run.
// Fixed at module load so the number genuinely counts down day by day.
const DEADLINE = Date.now() + 300 * 24 * 60 * 60 * 1000;

function daysLeft() {
  const ms = DEADLINE - Date.now();
  return Math.max(0, Math.ceil(ms / (24 * 60 * 60 * 1000)));
}

export default function Countdown() {
  const { t } = useLocale();
  // start null to avoid SSR/CSR hydration mismatch, fill on mount
  const [days, setDays] = useState<number | null>(null);

  useEffect(() => {
    setDays(daysLeft());
    const id = setInterval(() => setDays(daysLeft()), 60 * 60 * 1000); // refresh hourly
    return () => clearInterval(id);
  }, []);

  return (
    <div className="hidden flex-col items-end leading-tight md:flex">
      <span className="text-[10px] font-medium uppercase tracking-wider text-white/40">
        {t(dict.nav.regEndsIn)}
      </span>
      <span className="text-sm font-bold text-white">
        {days ?? "—"} <span className="text-violet-300">{t(dict.nav.days)}</span>
      </span>
    </div>
  );
}
