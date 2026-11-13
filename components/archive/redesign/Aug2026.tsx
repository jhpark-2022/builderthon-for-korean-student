"use client";

// DECIDED 2026-11-13 (사용자: "naru.community에 맞추어서 8월까지 다 update"): 8월 기록(/2026-08)의 새 화면.
// 나루 홈, 크로싱 서울과 같은 종이 체계(components/shared/redesign)입니다. 그 전 화면(components/journey/Journey.tsx)은 그대로 둡니다.
//
//   #top       날짜, 이름, 시작한 이야기, 사진 한 장
//   #numbers   74명, 25팀, 21팀, 9팀
//   #days      8일
//   #photos    사진 열두 장(naru.record.photos)
//   #awards    순위 대신 부문으로
//   #people    연사, 피드백 패널, 멘토
//   #partners  그때의 표기 그대로
//   #media     제로백 빌더톤 기사(components/shared/MediaSection)
//   #thanks    고마운 이름들, 다음 자리
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLocale } from "@/lib/LocaleContext";
import { naru } from "@/data/naru";
import PhotoLightbox, { warmPhoto } from "@/components/shared/PhotoLightbox";
import MediaSection from "@/components/shared/MediaSection";
import { SiteFooter } from "@/components/shared/SiteChrome";
import { DISPLAY, TITLE, HEADING, BODY, META, INK, SOFT, NAVY, RULE, FRAME, BTN_PRIMARY, Lines } from "@/components/shared/redesign";
import { aug as C } from "./copy";

const ZOOM = "relative block aspect-[4/3] w-full cursor-zoom-in overflow-hidden bg-[#F6F4EE] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-naru-navy";
const SUB = `text-[1.125rem] font-bold leading-[1.4] lg:text-[1.25rem] ${INK}`;
const CARD = "flex h-[5.5rem] items-center justify-center rounded-2xl bg-[#FFFFFF] px-4 ring-1 ring-[#E3E0D8] lg:h-24";
const LOGO = "block h-auto max-h-10 w-auto max-w-[8.5rem] object-contain brightness-0 opacity-75";

type Logo = { name: string; src: string; w: number; h: number };

function Chapter({ id, title, lead, last, children }: { id: string; title: string; lead?: string; last?: boolean; children: React.ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={`mt-14 lg:mt-20 ${last ? "pb-16 lg:pb-20" : ""}`}>
      <div className={FRAME}>
        <div className="grid gap-4 lg:grid-cols-12 lg:gap-12">
          <h2 id={`${id}-title`} className={`break-keep ${TITLE} ${NAVY} lg:col-span-5`}>{title}</h2>
          {lead && <p className={`break-keep ${BODY} ${SOFT} lg:col-span-7 lg:pt-2`}><Lines text={lead} /></p>}
        </div>
        <div className="mt-6 lg:mt-8">{children}</div>
      </div>
    </section>
  );
}

function Logos({ list, cols }: { list: Logo[]; cols: string }) {
  return (
    <ul className={`mt-3 grid grid-cols-2 gap-3 ${cols}`}>
      {list.map((l) => (
        <li key={l.name} className={CARD}>
          <Image src={l.src} alt={l.name} width={l.w} height={l.h} className={LOGO} />
        </li>
      ))}
    </ul>
  );
}

export default function Aug2026() {
  const { t } = useLocale();
  const photos = naru.record.photos;
  const hero = naru.eventHero;
  const [open, setOpen] = useState<number | null>(null);

  return (
    <>
      <main id="main" tabIndex={-1} className="naru-min12 bg-[#FCFBF8] focus:outline-none">
        {/* ── 히어로 ─────────────────────────────────────────────── */}
        <section id="top" aria-labelledby="aug-title" className="pt-[calc(var(--site-header-height,96px)+28px)] lg:pt-[calc(var(--site-header-height,96px)+40px)]">
          <div className={FRAME}>
            <p className={`${HEADING} ${INK}`}>{t(C.date)}</p>
            <h1 id="aug-title" className={`mt-2 break-keep ${DISPLAY} ${NAVY}`}>
              {t(C.title)}<span aria-hidden="true" className="text-naru-orange">.</span>
            </h1>
            <div className="mt-6 grid gap-8 lg:mt-8 lg:grid-cols-12 lg:gap-12">
              <div className="lg:col-span-6 lg:pt-1">
                <p className={`break-keep ${HEADING} ${INK}`}><Lines text={t(C.lead)} /></p>
                <p className={`mt-5 max-w-[34rem] break-keep ${BODY} ${SOFT}`}>{t(C.host)}</p>
              </div>
              <figure className="lg:col-span-6">
                <button type="button" aria-haspopup="dialog" onPointerEnter={() => warmPhoto(photos[0].src)} onClick={() => setOpen(0)} className={`${ZOOM} rounded-[18px]`}>
                  <Image src={photos[0].src} alt={t(photos[0].alt)} fill priority sizes="(max-width: 1023px) 100vw, 560px" className="object-cover" />
                </button>
              </figure>
            </div>
          </div>
        </section>

        {/* ── 숫자 ─────────────────────────────────────────────── */}
        <Chapter id="numbers" title={t(C.numbersTitle)}>
          <ol className={`grid border-t ${RULE} sm:grid-cols-2 lg:grid-cols-4`}>
            {C.numbers.map((n, i) => (
              <li key={i} className={`border-b ${RULE} py-5 sm:pr-6 lg:border-b-0 lg:py-6 ${i > 0 ? "lg:border-l lg:pl-6" : ""}`}>
                <p className={`${TITLE} tabular-nums ${i === 3 ? "text-naru-orange" : NAVY}`}>{t(n.value)}</p>
                <p className={`mt-1 break-keep ${BODY} font-semibold ${INK}`}>{t(n.label)}</p>
                {n.note && <p className={`mt-0.5 ${META} ${SOFT}`}>{t(n.note)}</p>}
              </li>
            ))}
          </ol>
        </Chapter>

        {/* ── 8일 ─────────────────────────────────────────────── */}
        <Chapter id="days" title={t(C.daysTitle)} lead={t(C.daysLead)}>
          <ol className="relative">
            <span aria-hidden="true" className="absolute bottom-6 left-[5px] top-6 w-px bg-naru-navy/25" />
            {C.days.map((d, i) => (
              <li key={d.date} className={`relative grid gap-x-8 border-b ${RULE} py-4 pl-8 sm:grid-cols-[9rem_minmax(0,1fr)] lg:grid-cols-[11rem_minmax(0,1fr)]`}>
                <span
                  aria-hidden="true"
                  className={`absolute left-0 top-[24px] z-10 block h-3 w-3 rounded-full ${i === C.days.length - 1 ? "bg-naru-orange" : "border-[1.5px] border-naru-navy bg-[#FCFBF8]"}`}
                />
                <p className={`${BODY} font-bold tabular-nums ${NAVY}`}>
                  Day {i + 1} <span className={`ml-2 font-semibold ${SOFT}`}>{d.date} {t(d.dow)}</span>
                </p>
                <p className={`break-keep ${BODY} ${INK}`}>{t(d.what)}</p>
              </li>
            ))}
          </ol>
        </Chapter>

        {/* ── 사진 ─────────────────────────────────────────────── */}
        <Chapter id="photos" title={t(C.photosTitle)}>
          <ul className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-3">
            {photos.map((ph, i) => (
              <li key={ph.src}>
                <button type="button" aria-haspopup="dialog" onPointerEnter={() => warmPhoto(ph.src)} onClick={() => setOpen(i)} className={`${ZOOM} rounded-xl`}>
                  <Image src={ph.src} alt={t(ph.alt)} fill sizes="(max-width: 1023px) 50vw, 380px" className="object-cover" />
                </button>
              </li>
            ))}
          </ul>
        </Chapter>

        {/* ── 부문 ─────────────────────────────────────────────── */}
        <Chapter id="awards" title={t(C.awardsTitle)} lead={t(C.awardsLead)}>
          <ul className={`grid border-t ${RULE} lg:grid-cols-2 lg:gap-x-12`}>
            {C.awards.map((a) => (
              <li key={a.name.en} className={`border-b ${RULE} py-5`}>
                <p className={`${HEADING} ${INK}`}>{t(a.name)}</p>
                <p className={`mt-1 break-keep ${BODY} ${SOFT}`}>{t(a.line)}</p>
              </li>
            ))}
          </ul>
        </Chapter>

        {/* ── 사람들 ─────────────────────────────────────────────── */}
        <Chapter id="people" title={t(C.peopleTitle)} lead={t(C.peopleLead)}>
          <div className="grid gap-10 lg:grid-cols-3 lg:gap-12">
            {C.people.map((g) => (
              <div key={g.label.en}>
                <h3 className={SUB}>{t(g.label)}</h3>
                <ul className={`mt-3 border-t ${RULE}`}>
                  {g.list.map((m) => (
                    <li key={m.name.en} className={`flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 border-b ${RULE} py-3`}>
                      <span className={`${BODY} font-semibold ${INK}`}>{t(m.name)}</span>
                      <span className={`break-keep text-right ${META} ${SOFT}`}>{t(m.org)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Chapter>

        {/* ── 함께한 곳 ─────────────────────────────────────────────── */}
        <Chapter id="partners" title={t(C.partnersTitle)} lead={t(C.partnersLead)}>
          <div className="flex flex-col gap-8">
            <div>
              <h3 className={SUB}>{t(C.hostLabel)}</h3>
              <div className="mt-3 flex items-center gap-5 rounded-2xl bg-[#F0EEE8] px-5 py-4 lg:px-7">
                <Image src={C.hostMark.src} alt={C.hostMark.name} width={C.hostMark.w} height={C.hostMark.h} className="block h-7 w-auto shrink-0" />
                <span className={`min-w-0 break-keep ${META} ${SOFT}`}>{t(C.hostLine)}</span>
              </div>
              <Logos list={C.hosts} cols="sm:grid-cols-5" />
            </div>
            <div className={`border-t ${RULE} pt-6`}>
              <h3 className={SUB}>{t(C.organizersLabel)}</h3>
              <Logos list={C.organizers} cols="sm:grid-cols-3 lg:grid-cols-4" />
            </div>
            <div className={`border-t ${RULE} pt-6`}>
              <h3 className={SUB}>{t(C.sponsorsLabel)}</h3>
              <Logos list={C.sponsors} cols="sm:grid-cols-3 lg:grid-cols-4" />
            </div>
          </div>
        </Chapter>

        <MediaSection only="zero100" />

        {/* ── 고마운 이름들 ─────────────────────────────────────────────── */}
        <Chapter id="thanks" title={t(C.thanksTitle)} last>
          <ul className={`border-t ${RULE}`}>
            {C.thanks.map((line) => (
              <li key={line.en} className={`border-b ${RULE} py-3 break-keep ${BODY} ${INK}`}>{t(line)}</li>
            ))}
          </ul>
          <p className={`mt-6 break-keep ${HEADING} ${NAVY}`}>{t(C.thanksClose)}</p>
          <div className="mt-10 flex flex-col gap-4 rounded-2xl bg-[#F0EEE8] px-5 py-5 sm:flex-row sm:items-center sm:justify-between lg:px-7">
            <p className={`break-keep ${HEADING} ${INK}`}>{t(C.next)}</p>
            <Link href="/crossing" className={`${BTN_PRIMARY} shrink-0`}>{t(C.nextCta)}</Link>
          </div>
        </Chapter>
      </main>

      <SiteFooter page="aug" />

      <PhotoLightbox
        photos={photos.map((ph) => ({ src: ph.src, alt: t(ph.alt), width: ph.width, height: ph.height, caption: ph.day && `${t(C.title)} ${t(ph.day)}` }))}
        index={open}
        onIndex={setOpen}
        onClose={() => setOpen(null)}
        labels={{ close: t(hero.photoClose), prev: t(hero.photoPrev), next: t(hero.photoNext) }}
      />
    </>
  );
}
