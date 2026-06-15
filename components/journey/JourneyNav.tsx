"use client";

import { useEffect, useState } from "react";
import { useLocale } from "@/lib/LocaleContext";
import { dict, links } from "@/data/dictionary";
import LocaleToggle from "@/components/LocaleToggle";

const anchors = [
  { id: "about",    label: dict.nav.about },
  { id: "join",     label: dict.nav.join },
  { id: "program",  label: dict.nav.program },
  { id: "builders", label: dict.nav.builders },
  { id: "faq",      label: dict.nav.faq },
];

export default function JourneyNav() {
  const { t } = useLocale();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${scrolled ? "bg-[#06040f]/50 backdrop-blur-xl" : "bg-transparent"}`}>
      <nav className="mx-auto flex h-20 max-w-6xl items-center justify-between px-6 sm:px-10">
        <a href="#top" className="flex items-center gap-2.5">
          <span className="text-lg font-black tracking-wider text-white sm:text-xl">KOMOS</span>
          <span className="text-lg text-white/30 sm:text-xl">×</span>
          <span className="text-lg font-semibold text-white/55 sm:text-xl">Zero100</span>
        </a>
        <div className="hidden items-center gap-6 lg:flex">
          {anchors.map((a) => (
            <a key={a.id} href={`#${a.id}`} className="text-sm font-medium text-white/55 transition hover:text-white">
              {t(a.label)}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <LocaleToggle />
          <a href={links.partnership} className="hidden rounded-full border border-white/20 bg-white/5 px-5 py-2 text-sm font-semibold text-white/85 backdrop-blur transition hover:bg-white/10 md:inline-flex">
            {t(dict.nav.partner)}
          </a>
          <a href={links.program} className="hidden rounded-full bg-violet-600/90 px-5 py-2 text-sm font-semibold text-white backdrop-blur transition hover:bg-violet-500 lg:inline-flex">
            {t(dict.nav.viewProgram)}
          </a>
        </div>
      </nav>
    </header>
  );
}
