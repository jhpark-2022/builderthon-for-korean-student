"use client";

import { useLocale } from "@/lib/LocaleContext";
import { dict } from "@/data/dictionary";
import Reveal from "./Reveal";

export default function Motivation() {
  const { t } = useLocale();

  return (
    <section id="motivation" className="relative scroll-mt-24 py-24 sm:py-32">
      <div className="mx-auto max-w-wide px-5 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          {/* Left — short editorial story */}
          <Reveal>
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-accent">
              {t(dict.motivation.tag)}
            </span>
            <h2 className="mt-4 max-w-xl text-[clamp(1.9rem,4.5vw,3rem)] font-bold leading-[1.12] tracking-tight text-navy">
              {t(dict.motivation.heading)}
            </h2>
            <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-ink-muted sm:text-base">
              {dict.motivation.body.map((p, i) => (
                <p key={i}>{t(p)}</p>
              ))}
            </div>
          </Reveal>

          {/* Right — concise belief cards */}
          <div className="flex flex-col gap-4">
            {dict.motivation.cards.map((card, i) => (
              <Reveal key={card.title.en} delay={i * 0.08}>
                <article className="group relative overflow-hidden rounded-2xl border border-line bg-surface p-6 shadow-card transition duration-300 hover:-translate-y-0.5 hover:shadow-card-hover sm:p-7">
                  <span
                    aria-hidden
                    className="absolute inset-y-0 left-0 w-1 bg-navy/85 transition-colors group-hover:bg-accent"
                  />
                  <h3 className="pl-2 text-base font-bold text-navy sm:text-lg">
                    {t(card.title)}
                  </h3>
                  <p className="mt-2 pl-2 text-sm leading-relaxed text-ink-muted sm:text-[15px]">
                    {t(card.body)}
                  </p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
