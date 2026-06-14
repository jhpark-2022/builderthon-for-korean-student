"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLocale } from "@/lib/LocaleContext";
import { dict, links } from "@/data/dictionary";
import LocaleToggle from "./LocaleToggle";

const anchors = [
  { id: "about",    label: dict.nav.about },
  { id: "program",  label: dict.nav.program },
  { id: "builders", label: dict.nav.builders },
  { id: "faq",      label: dict.nav.faq },
];

export default function Nav() {
  const { t } = useLocale();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [menuOpen]);

  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
      scrolled || menuOpen ? "border-b border-white/[0.06] bg-[#080810]/85 backdrop-blur-xl" : "border-b border-transparent bg-transparent"
    }`}>
      <nav className="mx-auto flex h-[72px] max-w-5xl items-center justify-between px-6 sm:px-10">
        <a href="#top" className="flex items-center gap-2">
          <span className="text-lg font-black tracking-wider text-white">KOMOS</span>
          <span className="text-white/25">×</span>
          <span className="text-sm font-semibold text-white/50">Zero100</span>
        </a>

        <div className="hidden items-center gap-6 lg:flex">
          {anchors.map((a) => (
            <a key={a.id} href={`#${a.id}`} className="text-sm font-medium text-white/50 transition hover:text-white">
              {t(a.label)}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <LocaleToggle />
          <a href={links.program} className="hidden rounded-full bg-violet-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-violet-500 sm:inline-flex">
            {t(dict.nav.viewProgram)}
          </a>
          <button type="button" onClick={() => setMenuOpen((v) => !v)} aria-label={menuOpen ? "Close menu" : "Open menu"}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white lg:hidden">
            <div className="relative h-3.5 w-4">
              <span className={`absolute left-0 h-[1.5px] w-4 bg-white transition-all duration-300 ${menuOpen ? "top-1.5 rotate-45" : "top-0"}`} />
              <span className={`absolute left-0 top-1.5 h-[1.5px] w-4 bg-white transition-all duration-300 ${menuOpen ? "opacity-0" : "opacity-100"}`} />
              <span className={`absolute left-0 h-[1.5px] w-4 bg-white transition-all duration-300 ${menuOpen ? "top-1.5 -rotate-45" : "top-3"}`} />
            </div>
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {menuOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden border-t border-white/[0.06] bg-[#080810]/95 backdrop-blur-xl lg:hidden">
            <div className="flex flex-col gap-1 px-6 py-4">
              {anchors.map((a) => (
                <a key={a.id} href={`#${a.id}`} onClick={() => setMenuOpen(false)}
                  className="rounded-xl px-3 py-3 text-base font-medium text-white/60 transition hover:bg-white/5 hover:text-white">
                  {t(a.label)}
                </a>
              ))}
              <a href={links.program} onClick={() => setMenuOpen(false)}
                className="mt-2 rounded-full bg-violet-600 px-5 py-3 text-center text-base font-bold text-white">
                {t(dict.nav.viewProgram)}
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
