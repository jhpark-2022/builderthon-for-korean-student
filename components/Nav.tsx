"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useLocale } from "@/lib/LocaleContext";
import { dict, links } from "@/data/dictionary";
import LocaleToggle from "./LocaleToggle";

const anchors = [
  { id: "about", label: dict.nav.about },
  { id: "program", label: dict.nav.program },
  { id: "builders", label: dict.nav.builders },
  { id: "faq", label: dict.nav.faq },
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

  // Lock body scroll while the mobile menu is open.
  // Save/restore the prior value so we don't clobber another scroll-lock owner
  // (e.g. the event modal) if both happen to be open.
  useEffect(() => {
    if (!menuOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [menuOpen]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled || menuOpen
          ? "border-b border-line bg-surface/85 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <nav className="mx-auto flex h-[72px] max-w-board items-center justify-between px-5 sm:px-8">
        {/* Co-branded lockup: KOMOS lion + wordmark × Zero100 wordmark.
            Composed from existing navy assets; link aria-label is authoritative
            so the inner mark images are decorative (alt=""). */}
        <a
          href="#top"
          className="flex items-center gap-2 sm:gap-2.5"
          aria-label="SMU KOMOS × Zero100 Builderthon — home"
        >
          <Image
            src="/komos-lion-navy.png"
            alt=""
            aria-hidden
            width={34}
            height={34}
            priority
            className="h-7 w-7 object-contain sm:h-8 sm:w-8"
          />
          <span className="text-[17px] font-bold leading-none tracking-[0.12em] text-navy sm:text-lg">
            KOMOS
          </span>
          <span
            aria-hidden
            className="text-base font-light leading-none text-ink-faint sm:text-lg"
          >
            ×
          </span>
          <Image
            src="/partners/processed/zero100.png"
            alt=""
            aria-hidden
            width={225}
            height={225}
            className="h-7 w-7 rounded-md object-contain sm:h-8 sm:w-8"
          />
        </a>

        {/* Desktop links */}
        <div className="hidden items-center gap-8 lg:flex">
          {anchors.map((a) => (
            <a
              key={a.id}
              href={`#${a.id}`}
              className="text-sm font-medium text-ink-muted transition-colors hover:text-navy"
            >
              {t(a.label)}
            </a>
          ))}
        </div>

        {/* Right cluster */}
        <div className="flex items-center gap-3">
          <LocaleToggle />
          <a
            href={links.program}
            className="hidden rounded-full bg-navy px-5 py-2 text-sm font-semibold text-white shadow-soft transition hover:bg-navy-soft sm:inline-flex"
          >
            {t(dict.nav.viewProgram)}
          </a>

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-surface text-navy lg:hidden"
          >
            <div className="relative h-3.5 w-4">
              <span
                className={`absolute left-0 h-[1.5px] w-4 bg-navy transition-all duration-300 ${
                  menuOpen ? "top-1.5 rotate-45" : "top-0"
                }`}
              />
              <span
                className={`absolute left-0 top-1.5 h-[1.5px] w-4 bg-navy transition-all duration-300 ${
                  menuOpen ? "opacity-0" : "opacity-100"
                }`}
              />
              <span
                className={`absolute left-0 h-[1.5px] w-4 bg-navy transition-all duration-300 ${
                  menuOpen ? "top-1.5 -rotate-45" : "top-3"
                }`}
              />
            </div>
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.28, ease: "easeInOut" }}
            className="overflow-hidden border-t border-line bg-surface/95 backdrop-blur-xl lg:hidden"
          >
            <div className="flex flex-col gap-1 px-5 py-4">
              {anchors.map((a) => (
                <a
                  key={a.id}
                  href={`#${a.id}`}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-xl px-3 py-3 text-base font-medium text-ink transition hover:bg-page hover:text-navy"
                >
                  {t(a.label)}
                </a>
              ))}
              <a
                href={links.program}
                onClick={() => setMenuOpen(false)}
                className="mt-2 rounded-full bg-navy px-5 py-3 text-center text-base font-semibold text-white"
              >
                {t(dict.nav.viewProgram)}
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
