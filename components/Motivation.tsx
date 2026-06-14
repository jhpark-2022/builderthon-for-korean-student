"use client";


import { useLocale } from "@/lib/LocaleContext";
import { dict } from "@/data/dictionary";
import Reveal from "./Reveal";

export default function Motivation() {
  const { t } = useLocale();

  return (
    <section id="motivation" className="relative scroll-mt-20 py-28 sm:py-36">
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 top-1/4 h-[400px] w-[400px] rounded-full bg-cyan-500/8 blur-[100px]" />
      </div>
      <div className="relative mx-auto max-w-5xl px-6 sm:px-10">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
          <Reveal>
            <span className="mb-6 border border-cyan-500/30 bg-cyan-500/10 text-cyan-300">
              {t(dict.motivation.tag)}
            </span>
            <h2 className="text-[clamp(1.8rem,4vw,3rem)] font-bold leading-tight tracking-tight text-white">
              {t(dict.motivation.heading)}
            </h2>
            <div className="mt-7 space-y-5 text-base leading-relaxed text-white/50">
              {dict.motivation.body.map((p, i) => <p key={i}>{t(p)}</p>)}
            </div>
          </Reveal>

          <div className="flex flex-col gap-4">
            {dict.motivation.cards.map((card, i) => (
              <Reveal key={card.title.en} delay={i * 0.08}>
                <div className="border border-white/[0.07] bg-white/[0.03] transition-all duration-300 hover:border-cyan-500/25">
                  <div className="p-6">
                    <div className="flex gap-4">
                      <div className="mt-1 w-[2px] shrink-0 self-stretch rounded-full bg-gradient-to-b from-violet-500 to-cyan-500" />
                      <div>
                        <h3 className="font-bold text-white">{t(card.title)}</h3>
                        <p className="mt-2 text-sm leading-relaxed text-white/50">{t(card.body)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
