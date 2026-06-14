"use client";


import { motion } from "framer-motion";
import { useLocale } from "@/lib/LocaleContext";
import { dict, links } from "@/data/dictionary";

const ease = [0.22, 1, 0.36, 1] as const;
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, delay, ease },
});

export default function Hero() {
  const { t } = useLocale();

  return (
    <section id="top" className="relative flex min-h-screen flex-col justify-center overflow-hidden bg-[#080810]">

      {/* Ambient orbs */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[600px] w-[600px] rounded-full bg-violet-700/20 blur-[120px]" />
        <div className="absolute -right-40 top-1/3 h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[120px]" />
        <div className="absolute bottom-0 left-1/3 h-[400px] w-[400px] rounded-full bg-indigo-600/15 blur-[100px]" />
        <div className="absolute inset-0 opacity-[0.03] [background-image:linear-gradient(rgba(124,58,237,1)_1px,transparent_1px),linear-gradient(90deg,rgba(124,58,237,1)_1px,transparent_1px)] [background-size:60px_60px]" />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-b from-transparent to-[#080810]" />
      </div>

      <div className="relative mx-auto w-full max-w-5xl px-6 pt-24 sm:px-10 lg:pt-32">

        {/* Eyebrow */}
        <motion.div {...fadeUp(0)}>
          <span className="mb-8 border border-violet-500/30 bg-violet-500/10 text-violet-300">
            ✦ {t(dict.hero.eyebrow)}
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1 {...fadeUp(0.08)} className="max-w-4xl text-[clamp(3rem,8vw,6.5rem)] font-black leading-[0.92] tracking-tight">
          <span className="block text-white">{t(dict.hero.titleLine1)}</span>
          <span className="block bg-gradient-to-r from-violet-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent">
            {t(dict.hero.titleLine2)}
          </span>
        </motion.h1>

        {/* Meta */}
        <motion.div {...fadeUp(0.16)} className="mt-7 flex flex-wrap items-center gap-3 text-sm sm:text-base">
          <span className="font-semibold text-white/90">{t(dict.hero.dates)}</span>
          <span className="h-4 w-px bg-white/20" />
          <span className="text-white/45">{t(dict.hero.location)}</span>
        </motion.div>

        {/* Blurb */}
        <motion.p {...fadeUp(0.22)} className="mt-6 max-w-2xl text-base leading-relaxed text-white/55 sm:text-lg">
          {t(dict.hero.blurb)}
        </motion.p>

        {/* CTAs */}
        <motion.div {...fadeUp(0.3)} className="mt-10 flex flex-wrap gap-3">
          <a
            href={links.program}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-7 py-3.5 text-base font-bold text-white shadow-lg shadow-violet-500/30 transition hover:-translate-y-0.5 hover:shadow-violet-500/50"
          >
            {t(dict.hero.ctaProgram)} →
          </a>
          <a
            href="#about"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 px-7 py-3.5 text-base font-semibold text-white/80 transition hover:border-white/30 hover:text-white"
          >
            {t(dict.about.tag)} ↓
          </a>
        </motion.div>

        {/* Stat tiles */}
        <motion.div {...fadeUp(0.4)} className="mt-16 grid grid-cols-3 gap-3 border-t border-white/[0.06] pt-10 sm:gap-4">
          {[
            { num: "~100", label: t(dict.hero.statParticipants), icon: "👥" },
            { num: "6",    label: t(dict.hero.statDays),         icon: "📅" },
            { num: "EN",   label: t(dict.hero.statLanguage),     icon: "🌏" },
          ].map(({ num, label, icon }) => (
            <div
              key={num}
              className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4 transition hover:border-violet-500/30 hover:bg-white/[0.06] sm:p-5"
            >
              <div className="text-xl sm:text-2xl">{icon}</div>
              <div className="mt-2 text-2xl font-black text-white sm:text-3xl">{num}</div>
              <div className="mt-1 text-xs text-white/40 sm:text-sm">{label}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll cue */}
      <div className="scroll-hint absolute bottom-8 left-1/2 -translate-x-1/2">
        <span>{t(dict.hero.scroll).toUpperCase()}</span>
        <div className="scroll-line" />
      </div>
    </section>
  );
}
