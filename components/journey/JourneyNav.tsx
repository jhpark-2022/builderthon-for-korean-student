"use client";

import { useEffect, useState } from "react";
import { useLocale } from "@/lib/LocaleContext";
import { dict, links } from "@/data/dictionary";
import LocaleToggle from "@/components/LocaleToggle";

const anchors = [
  { id: "about",    label: dict.nav.about },
  { id: "join",     label: dict.nav.join },
  { id: "program",  label: dict.nav.program },
  // Lands on the partner pitch (#why-partner / "For partners"); the logo wall
  // (#builders) follows immediately below it.
  { id: "why-partner", label: dict.nav.builders },
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
    <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${scrolled ? "bg-[#06040f]/85" : "bg-transparent"}`}>
      <nav className="mx-auto flex h-20 max-w-6xl items-center justify-between px-6 sm:px-10">
        <a href="#top" className="flex items-center gap-2.5">
          <span className="text-lg font-black tracking-wider text-white sm:text-xl">KOMOS</span>
          {/* Co-brand suffix is hidden on the narrowest screens so the brand,
              EN/KR toggle, and the View Program CTA all fit; full lockup returns
              from the sm breakpoint up. */}
          <span className="hidden text-lg text-white/30 sm:inline sm:text-xl">×</span>
          <span className="hidden text-lg font-semibold text-white/70 sm:inline sm:text-xl">Zero100</span>
        </a>
        <div className="hidden items-center gap-6 lg:flex">
          {anchors.map((a) => (
            <a
              key={a.id}
              href={`#${a.id}`}
              className="relative text-sm font-medium text-white/70 transition hover:text-white after:absolute after:-bottom-1 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-violet-400/70 after:transition-transform after:duration-300 hover:after:scale-x-100 focus-visible:after:scale-x-100"
            >
              {t(a.label)}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-2.5 sm:gap-3">
          <LocaleToggle />
          <a href={links.partnership} className="hidden rounded-full border border-white/20 bg-white/5 px-5 py-2 text-sm font-semibold text-white/85 transition hover:bg-white/10 md:inline-flex">
            {t(dict.nav.partner)}
          </a>
          {/* Primary CTA stays reachable on every screen — compact on mobile so
              the partnership/program funnel never disappears below lg. */}
          <a href={links.program} className="inline-flex shrink-0 items-center rounded-full bg-violet-600/90 px-3 py-2 text-xs font-semibold text-white transition hover:-translate-y-0.5 hover:bg-violet-500 sm:px-5 sm:text-sm">
            {t(dict.nav.viewProgram)}
          </a>
        </div>
      </nav>
    </header>
  );
}
