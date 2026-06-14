"use client";

import Image from "next/image";

import { useLocale } from "@/lib/LocaleContext";
import { dict } from "@/data/dictionary";
import Reveal from "./Reveal";

export default function Partners() {
  const { t } = useLocale();

  return (
    <section id="builders" className="relative scroll-mt-20 py-28 sm:py-36">
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-20 top-1/3 h-[350px] w-[350px] rounded-full bg-violet-700/8 blur-[100px]" />
      </div>
      <div className="relative mx-auto max-w-5xl px-6 sm:px-10">
        <Reveal>
          <span className="mb-6 border border-violet-500/30 bg-violet-500/10 text-violet-300">
            {t(dict.partners.tag)}
          </span>
          <h2 className="text-[clamp(2rem,5vw,3.5rem)] font-bold tracking-tight text-white">
            {t(dict.partners.heading)}
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/50">
            {t(dict.partners.note)}
          </p>
        </Reveal>

        {/* Organizer + Network */}
        <Reveal delay={0.05}>
          <div className="mt-12 grid gap-4 sm:grid-cols-2">
            {[
              { label: t(dict.partners.organizerLabel), img: "/komos-lion-white.png", name: "KOMOS", desc: t(dict.partners.organizerDesc), w: 690, h: 439 },
              { label: t(dict.partners.networkLabel),   img: "/partners/processed/zero100.png", name: "Zero100", desc: t(dict.partners.networkDesc), w: 225, h: 225 },
            ].map(({ label, img, name, desc, w, h }) => (
              <div key={name} className="border border-white/[0.07] bg-white/[0.03]">
                <div className="p-7">
                  <span className="text-xs font-bold uppercase tracking-widest text-white/30">{label}</span>
                  <div className="mt-5 flex items-center gap-4">
                    <Image src={img} alt={name} width={w} height={h} className="h-11 w-11 rounded-lg object-contain brightness-0 invert" />
                    <div>
                      <p className="text-lg font-bold text-white">{name}</p>
                      <p className="text-sm text-white/40">{desc}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Reveal>

        {/* Hosts */}
        <Reveal delay={0.1}>
          <p className="mt-10 text-xs font-bold uppercase tracking-widest text-white/30">{t(dict.partners.hostsLabel)}</p>
          <p className="mb-4 mt-1 text-xs text-white/25">{t(dict.partners.hostsSub)}</p>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { src: "/partners/processed/popup-studio.png", alt: "Popup Studio", w: 476, h: 134 },
              { src: "/partners/processed/codepresso.png",   alt: "Codepresso",   w: 361, h: 113 },
            ].map(({ src, alt, w, h }) => (
              <div key={alt} className="flex h-24 items-center justify-center rounded-2xl border border-white/[0.07] bg-white/[0.03] px-6 hover:border-white/15 transition">
                <Image src={src} alt={alt} width={w} height={h} className="h-10 w-auto max-w-[70%] object-contain brightness-0 invert opacity-60 hover:opacity-90 transition" />
              </div>
            ))}
          </div>
        </Reveal>

        {/* Confirmed */}
        <Reveal delay={0.12}>
          <p className="mt-10 text-xs font-bold uppercase tracking-widest text-emerald-400">{t(dict.partners.confirmedLabel)}</p>
          <p className="mb-4 mt-1 text-xs text-white/30">{t(dict.partners.confirmedSub)}</p>
          <a href="https://www.alchemy.com/" target="_blank" rel="noreferrer"
            className="group flex h-24 w-full items-center justify-center gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 px-6 transition hover:border-emerald-500/40 hover:bg-emerald-500/10 sm:w-1/2">
            <Image src="/partners/processed/alchemy.png" alt="Alchemy" width={480} height={422}
              className="h-9 w-auto object-contain brightness-0 invert opacity-75 transition group-hover:opacity-100" />
            <span className="font-bold text-white">Alchemy</span>
            <span className="text-white/30 transition group-hover:text-emerald-400">↗</span>
          </a>
        </Reveal>

        {/* In discussion */}
        <Reveal delay={0.15}>
          <p className="mt-10 text-xs font-bold uppercase tracking-widest text-white/30">{t(dict.partners.partnersLabel)}</p>
          <div className="mt-4 grid grid-cols-3 gap-4">
            {["Workato", "OpenAI", "AWS"].map((name) => (
              <div key={name} className="flex h-24 items-center justify-center rounded-2xl border border-dashed border-white/[0.08] bg-white/[0.02] px-4">
                <span className="text-lg font-bold text-white/40">{name}</span>
              </div>
            ))}
          </div>
          <p className="mt-5 text-xs text-white/25">{t(dict.partners.inDiscussionNote)}</p>
          <p className="mt-1 text-xs text-white/25">{t(dict.partners.moreLabel)}</p>
        </Reveal>
      </div>
    </section>
  );
}
