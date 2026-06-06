"use client";

import Image from "next/image";
import { useLocale } from "@/lib/LocaleContext";
import { dict } from "@/data/dictionary";
import Reveal from "./Reveal";

// ── Partner / org assets ─────────────────────────────────────────────────────
// Provided logos were screenshots on varied (dark / coloured / grey) backgrounds.
// The one-colour marks (Zero100, Popup Studio, Codepresso, Alchemy, KOMOS) are
// normalized to a single navy tone on transparent in /public/partners/processed
// so they sit cleanly on the light theme's white cards (no clashing screenshot
// backgrounds, consistent size). See scripts run during the logo handoff.
//
// OpenAI / AWS / Workato are "in discussion" (NOT confirmed) and are the most
// trademark-sensitive brands, so they remain plain text wordmarks rather than
// displayed marks — avoids implying endorsement before any agreement.

type ImageBrand = {
  name: string;
  src: string;
  alt: string;
  w: number;
  h: number;
  imgClass: string;
};
type Brand = ({ kind: "image" } & ImageBrand) | { kind: "wordmark"; name: string };

const hosts: Brand[] = [
  {
    kind: "image",
    name: "Popup Studio",
    src: "/partners/processed/popup-studio.png",
    alt: "Popup Studio",
    w: 476,
    h: 134,
    // Wordmarks are visually lighter than icon marks, so they're sized taller
    // (and wider) to read with equal optical weight across the section.
    imgClass: "h-10 sm:h-12",
  },
  {
    kind: "image",
    name: "Codepresso",
    src: "/partners/processed/codepresso.png",
    alt: "Codepresso (code.presso)",
    w: 361,
    h: 113,
    imgClass: "h-10 sm:h-12",
  },
];

// In EARLY DISCUSSION — NOT confirmed. Text wordmarks (see note above).
const inDiscussion: Brand[] = [
  { kind: "wordmark", name: "Workato" },
  { kind: "wordmark", name: "OpenAI" },
  { kind: "wordmark", name: "AWS" },
];

function PartnerLogo({ brand }: { brand: Brand }) {
  if (brand.kind === "image") {
    return (
      <Image
        src={brand.src}
        alt={brand.alt}
        width={brand.w}
        height={brand.h}
        className={`${brand.imgClass} w-auto max-w-[78%] object-contain`}
      />
    );
  }
  // Clean text wordmark — intentional, not a placeholder box.
  return (
    <span className="text-xl font-bold tracking-tight text-ink-strong sm:text-2xl">
      {brand.name}
    </span>
  );
}

// Consistent logo card shell (identical height across the section).
function LogoCard({
  children,
  dashed = false,
}: {
  children: React.ReactNode;
  dashed?: boolean;
}) {
  return (
    <div
      className={`flex h-24 items-center justify-center rounded-2xl border bg-surface px-6 shadow-card transition hover:-translate-y-0.5 hover:shadow-card-hover ${
        dashed ? "border-dashed border-line" : "border-line"
      }`}
    >
      {children}
    </div>
  );
}

export default function Partners() {
  const { t } = useLocale();

  return (
    <section id="builders" className="relative scroll-mt-24 py-24 sm:py-32">
      <div className="mx-auto max-w-wide px-5 sm:px-8">
        <Reveal>
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-accent">
            {t(dict.partners.tag)}
          </span>
          <h2 className="mt-4 text-[clamp(2rem,5vw,3.5rem)] font-bold leading-[1.05] tracking-tight text-navy">
            {t(dict.partners.heading)}
          </h2>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-ink-muted">
            {t(dict.partners.note)}
          </p>
        </Reveal>

        {/* Organizer + Founding network — KOMOS × Zero100 */}
        <Reveal delay={0.05}>
          <div className="mt-12 grid gap-4 sm:grid-cols-2">
            {/* KOMOS — Organizer */}
            <div className="rounded-3xl border border-line bg-gradient-to-br from-white to-page p-7 shadow-card">
              <span className="text-xs font-bold uppercase tracking-[0.25em] text-ink-faint">
                {t(dict.partners.organizerLabel)}
              </span>
              <div className="mt-5 flex items-center gap-4">
                <Image
                  src="/partners/processed/komos.png"
                  alt="KOMOS — SMU Korean Student Association"
                  width={690}
                  height={439}
                  className="h-11 w-11 object-contain sm:h-12 sm:w-12"
                />
                <div>
                  <p className="text-xl font-bold tracking-[0.12em] text-navy sm:text-2xl">
                    KOMOS
                  </p>
                  <p className="text-sm text-ink-muted">
                    {t(dict.partners.organizerDesc)}
                  </p>
                </div>
              </div>
            </div>

            {/* Zero100 — Founding network */}
            <div className="rounded-3xl border border-line bg-gradient-to-br from-white to-page p-7 shadow-card">
              <span className="text-xs font-bold uppercase tracking-[0.25em] text-ink-faint">
                {t(dict.partners.networkLabel)}
              </span>
              <div className="mt-5 flex items-center gap-4">
                <Image
                  src="/partners/processed/zero100.png"
                  alt="Zero100"
                  width={453}
                  height={144}
                  className="h-9 w-auto object-contain sm:h-10"
                />
              </div>
              <p className="mt-3 text-sm text-ink-muted">
                {t(dict.partners.networkDesc)}
              </p>
            </div>
          </div>
        </Reveal>

        {/* Hosts */}
        <Reveal delay={0.1}>
          <div className="mt-12 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-ink-faint">
              {t(dict.partners.hostsLabel)}
            </p>
            <p className="text-xs text-ink-faint">· {t(dict.partners.hostsSub)}</p>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {hosts.map((b) => (
              <LogoCard key={b.name}>
                <PartnerLogo brand={b} />
              </LogoCard>
            ))}
          </div>
        </Reveal>

        {/* Confirmed support */}
        <Reveal delay={0.12}>
          <div className="mt-10 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-700">
              {t(dict.partners.confirmedLabel)}
            </p>
            <p className="text-xs text-ink-faint">· {t(dict.partners.confirmedSub)}</p>
          </div>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2">
            <a
              href="https://www.alchemy.com/"
              target="_blank"
              rel="noreferrer"
              aria-label="Alchemy (opens in a new tab)"
              className="group flex h-24 items-center justify-center gap-2 rounded-2xl border border-emerald-600/25 bg-surface px-6 shadow-card ring-1 ring-emerald-600/10 transition hover:-translate-y-0.5 hover:shadow-card-hover"
            >
              <Image
                src="/partners/processed/alchemy.png"
                alt="Alchemy"
                width={480}
                height={422}
                className="h-9 w-auto object-contain"
              />
              <span className="text-lg font-bold tracking-tight text-ink-strong">
                Alchemy
              </span>
              <span
                aria-hidden
                className="text-ink-faint transition group-hover:text-emerald-700"
              >
                ↗
              </span>
            </a>
          </div>
        </Reveal>

        {/* In discussion */}
        <Reveal delay={0.15}>
          <p className="mt-10 text-xs font-bold uppercase tracking-[0.25em] text-ink-faint">
            {t(dict.partners.partnersLabel)}
          </p>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {inDiscussion.map((b) => (
              <LogoCard key={b.name} dashed>
                <PartnerLogo brand={b} />
              </LogoCard>
            ))}
          </div>
          <p className="mt-5 text-xs text-ink-faint">
            {t(dict.partners.inDiscussionNote)}
          </p>
          <p className="mt-1 text-xs text-ink-faint">{t(dict.partners.moreLabel)}</p>
        </Reveal>
      </div>
    </section>
  );
}
