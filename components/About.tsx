"use client";

import { useLocale } from "@/lib/LocaleContext";
import { dict } from "@/data/dictionary";
import Reveal from "./Reveal";

export default function About() {
  const { t } = useLocale();

  return (
    <section id="about" className="relative scroll-mt-24 py-24 sm:py-32">
      <div className="mx-auto max-w-wide px-5 sm:px-8">
        <Reveal>
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-accent">
            {t(dict.about.tag)}
          </span>
          <h2 className="mt-4 max-w-3xl text-[clamp(2rem,5vw,3.5rem)] font-bold leading-[1.05] tracking-tight text-navy">
            {t(dict.about.heading)}
          </h2>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-ink-muted sm:text-lg">
            {t(dict.about.intro)}
          </p>
        </Reveal>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {dict.about.cards.map((card, i) => (
            <Reveal key={card.kicker.en} delay={i * 0.1}>
              <article className="group relative h-full overflow-hidden rounded-3xl border border-line bg-surface p-8 shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-card-hover">
                {/* top accent line */}
                <span
                  aria-hidden
                  className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-accent transition-transform duration-300 group-hover:scale-x-100"
                />
                <span className="text-sm font-bold tracking-widest text-accent">
                  {t(card.kicker)}
                </span>
                <h3 className="mt-4 text-xl font-bold text-navy sm:text-2xl">
                  {t(card.title)}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                  {t(card.body)}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
