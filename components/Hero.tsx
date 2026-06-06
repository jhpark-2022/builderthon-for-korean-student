"use client";

import { motion } from "framer-motion";
import { useLocale } from "@/lib/LocaleContext";
import { dict, links } from "@/data/dictionary";

const ease = [0.22, 1, 0.36, 1] as const;

export default function Hero() {
  const { t } = useLocale();

  return (
    <section
      id="top"
      className="relative flex min-h-[92svh] items-center overflow-hidden pt-[72px]"
    >
      {/* Light, airy backdrop */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(120%_100%_at_50%_-10%,#ffffff_0%,#eef2f9_45%,#f4f6fa_100%)]" />
        {/* soft accent glows */}
        <div className="absolute -left-[10%] top-[8%] h-[42vmax] w-[42vmax] rounded-full bg-[radial-gradient(circle,#cfe0ff,transparent_62%)] opacity-60 blur-[90px]" />
        <div className="absolute -right-[8%] bottom-[2%] h-[34vmax] w-[34vmax] rounded-full bg-[radial-gradient(circle,#dfe6f5,transparent_62%)] opacity-70 blur-[80px]" />
        {/* fine navy grid texture */}
        <div className="absolute inset-0 opacity-[0.05] [background-image:linear-gradient(to_right,#172747_1px,transparent_1px),linear-gradient(to_bottom,#172747_1px,transparent_1px)] [background-size:72px_72px]" />
        {/* fade into next section */}
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-page" />
      </div>

      <div className="relative mx-auto w-full max-w-wide px-5 sm:px-8">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-1.5 text-xs font-semibold tracking-wide text-ink-muted shadow-sm"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          {t(dict.hero.eyebrow)}
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.05, ease }}
          className="max-w-4xl text-[clamp(2.75rem,9vw,7rem)] font-bold leading-[0.95] tracking-tight"
          aria-label={`${t(dict.hero.titleLine1)} ${t(dict.hero.titleLine2)}`}
        >
          <span aria-hidden className="block text-navy">
            {t(dict.hero.titleLine1)}
          </span>
          <span aria-hidden className="block text-gradient">
            {t(dict.hero.titleLine2)}
          </span>
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease }}
          className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm sm:text-base"
        >
          <span className="font-semibold text-navy">{t(dict.hero.dates)}</span>
          <span className="hidden h-4 w-px bg-line sm:block" />
          <span className="text-ink-muted">{t(dict.hero.location)}</span>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.22, ease }}
          className="mt-6 max-w-2xl text-base leading-relaxed text-ink-muted sm:text-lg"
        >
          {t(dict.hero.blurb)}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease }}
          className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center"
        >
          <a
            href={links.program}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-navy px-7 py-3.5 text-base font-semibold text-white shadow-soft transition hover:bg-navy-soft"
          >
            {t(dict.hero.ctaProgram)}
            <span aria-hidden>→</span>
          </a>
        </motion.div>

        {/* Stats */}
        <motion.dl
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4, ease }}
          className="mt-14 grid max-w-xl grid-cols-3 gap-6 border-t border-line pt-6"
        >
          <div>
            <dt className="text-2xl font-bold text-navy sm:text-3xl">~100</dt>
            <dd className="mt-1 text-xs text-ink-muted sm:text-sm">
              {t(dict.hero.statParticipants)}
            </dd>
          </div>
          <div>
            <dt className="text-2xl font-bold text-navy sm:text-3xl">6</dt>
            <dd className="mt-1 text-xs text-ink-muted sm:text-sm">
              {t(dict.hero.statDays)}
            </dd>
          </div>
          <div>
            <dt className="text-2xl font-bold text-navy sm:text-3xl">EN</dt>
            <dd className="mt-1 text-xs text-ink-muted sm:text-sm">
              {t(dict.hero.statLanguage)}
            </dd>
          </div>
        </motion.dl>
      </div>

      {/* Scroll cue */}
      <div className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-ink-faint md:flex">
        <span className="text-[10px] tracking-[0.3em]">
          {t(dict.hero.scroll).toUpperCase()}
        </span>
        <span className="h-8 w-px bg-gradient-to-b from-ink-faint to-transparent" />
      </div>
    </section>
  );
}
