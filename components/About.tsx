"use client";


import { useLocale } from "@/lib/LocaleContext";
import { dict } from "@/data/dictionary";
import Reveal from "./Reveal";

export default function About() {
  const { t } = useLocale();

  return (
    <section id="about" className="relative scroll-mt-20 py-28 sm:py-36">
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute right-0 top-0 h-[400px] w-[400px] rounded-full bg-violet-700/10 blur-[100px]" />
      </div>
      <div className="relative mx-auto max-w-5xl px-6 sm:px-10">
        <Reveal>
          <span className="mb-6 border border-violet-500/30 bg-violet-500/10 text-violet-300">
            {t(dict.about.tag)}
          </span>
          <h2 className="max-w-3xl text-[clamp(2rem,5vw,3.5rem)] font-bold leading-tight tracking-tight text-white">
            {t(dict.about.heading)}
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/50 sm:text-lg">
            {t(dict.about.intro)}
          </p>
        </Reveal>

        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {dict.about.cards.map((card, i) => (
            <Reveal key={card.kicker.en} delay={i * 0.1}>
              <div className="group border border-white/[0.07] bg-white/[0.03] transition-all duration-300 hover:border-violet-500/30 hover:bg-white/[0.06]">
                <div className="p-7">
                  <span className="text-xs font-bold tracking-[.2em] text-violet-400">{t(card.kicker)}</span>
                  <h3 className="mt-4 text-xl font-bold text-white">{t(card.title)}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-white/50">{t(card.body)}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
