"use client";

// DECIDED 2026-11-07 (redesign/crossing 브랜치): 나루 홈(/)의 새 화면. 크로싱 서울(components/crossing/redesign)과 같은 체계입니다.
// 종이 바탕, 글자 다섯 단(components/shared/redesign.tsx), 본문과 같은 왼쪽 선, 데스크톱에서 문장 단위로 줄 나눔.
// 데이터와 링크는 data/naru.ts 그대로이고, 한국어 문구만 ./copy.ts에서 덮어씁니다. 그 전 화면은 components/naru/NaruPage.tsx에 그대로 있습니다.
//
//   #top        인장, 태그라인, 나루 소개
//   #events     함께한 곳, 함께할 곳(크로싱 서울, #record 8월, 다음)
//   #core       변하지 않는 두 개, 경첩, 방법은 바뀝니다
//   #how        세 층, 회사가 얻는 것, 연락
//   #why        왜 이런 자리가 필요한가
//   #media      미디어(2026-11-13, components/shared/MediaSection)
//   #join-ways  매니페스토
import Image from "next/image";
import Link from "next/link";
import { track } from "@vercel/analytics";
import { useLocale } from "@/lib/LocaleContext";
import { naru, naruLinks, partnerContact, openChatLabels } from "@/data/naru";
import { decemberEventLabel, formatDecemberRange, DECEMBER_CITY } from "@/lib/naruDates";
import OpenChatLink from "@/components/ui/OpenChatLink";
import MobileChatBar from "@/components/shared/MobileChatBar";
import ManifestoViewer from "@/components/naru/ManifestoViewer";
import { SiteFooter } from "@/components/home/shared";
import { copy as crossingCopy } from "@/components/crossing/redesign/copy";
import { DISPLAY, TITLE, HEADING, BODY, META, INK, SOFT, NAVY, RULE, FRAME, BTN_PRIMARY, BTN_GHOST, LINK, Lines } from "@/components/shared/redesign";
import MediaSection from "@/components/shared/MediaSection";
import { copy as C } from "./copy";

/** "주최 HOST"에서 한국어 이름만. 영문 화면은 "Host"처럼 첫 글자만 크게. */
function roleName(text: string) {
  const parts = text.trim().split(/\s+/);
  return parts.length < 2 ? parts[0].charAt(0) + parts[0].slice(1).toLowerCase() : parts.slice(0, -1).join(" ");
}

/** 왼쪽 11rem 이름 칸과 오른쪽 내용. 크로싱 서울의 일정표, 사실 줄과 같은 왼쪽 선입니다. */
const ROW = `grid gap-2 border-b ${RULE} py-5 lg:grid-cols-[11rem_minmax(0,1fr)] lg:gap-8 lg:py-6`;

export default function NaruHome() {
  const { t, locale } = useLocale();
  const crew = naru.how.layers.find((l) => l.join.id === "join-crew");

  return (
    <>
      <main id="main" tabIndex={-1} className="naru-min12 bg-[#FCFBF8] focus:outline-none">
        {/* ── 히어로 ─────────────────────────────────────────────── */}
        <section id="top" aria-labelledby="naru-title" className="pt-[calc(var(--site-header-height,96px)+28px)] lg:pt-[calc(var(--site-header-height,96px)+40px)]">
          <div className={FRAME}>
            <Image
              src={locale === "en" ? "/naru/naru-master-en-v3-paper.svg" : "/naru/naru-master-v3-paper.png"}
              alt={t(naru.hero.logoAlt)}
              width={900}
              height={900}
              unoptimized={locale === "en"}
              priority
              className="block h-auto w-[88px] lg:w-[104px]"
            />
            <h1 id="naru-title" className={`mt-5 break-keep ${DISPLAY} ${NAVY}`}>
              <span className="block">{t(naru.hero.titleLine1)}</span>{" "}
              <span className="block text-[#845185]">{t(naru.hero.titleLine2)}</span>
            </h1>
            <div className="mt-6 grid gap-4 lg:mt-8 lg:grid-cols-12 lg:gap-12">
              <p className={`break-keep ${HEADING} ${INK} lg:col-span-8`}><Lines text={t(C.groupConcrete)} /></p>
              <p className={`break-keep ${BODY} ${SOFT} lg:col-span-8`}><Lines text={t(C.groupName)} /></p>
            </div>
          </div>
        </section>

        {/* ── 함께한 곳, 함께할 곳 ─────────────────────────────────────────────── */}
        <section id="events" aria-labelledby="events-title" className="mt-12 lg:mt-16">
          <div className={FRAME}>
            <h2 id="events-title" className={`break-keep ${TITLE} ${NAVY}`}>{t(C.eventsHeading)}</h2>
            <ol className={`mt-6 border-t ${RULE}`}>
              <li className={ROW}>
                <div className="flex flex-wrap items-baseline gap-x-3 lg:flex-col lg:gap-1">
                  <span className={`${BODY} font-bold ${INK}`}>{decemberEventLabel(locale)}</span>
                  <span className={`${META} tabular-nums ${SOFT}`}>{formatDecemberRange(locale)}, {DECEMBER_CITY[locale]}</span>
                </div>
                <div>
                  <p className={`break-keep ${HEADING} ${INK}`}>{t(C.decemberLine)}</p>
                  <p className={`mt-1 break-keep ${META} ${SOFT}`}>{t(crossingCopy.noteShort)}</p>
                  <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                    <Link href="/crossing" onClick={() => track("naru_cta", { src: "home-crossing", to: "crossing" })} className={BTN_PRIMARY}>
                      {t(naru.events.crossingCta)}
                    </Link>
                    <OpenChatLink t={t} src="home-crossing" label={openChatLabels.december} variant="secondary" className="!min-h-[48px] !rounded-[10px] max-sm:w-full" />
                  </div>
                </div>
              </li>
              <li id="record" className={ROW}>
                <div className="flex flex-wrap items-baseline gap-x-3 lg:flex-col lg:gap-1">
                  <span className={`${BODY} font-bold ${INK}`}>{t(naru.events.zero100Name)}</span>
                  <span className={`${META} tabular-nums ${SOFT}`}>{t(naru.events.zero100When)}</span>
                </div>
                <div>
                  <p className={`break-keep ${BODY} ${SOFT}`}>{t(C.recordLine)}</p>
                  <Link href={naruLinks.archive} onClick={() => track("naru_cta", { src: "record", to: "archive" })} className={LINK}>{t(C.recordCta)}</Link>
                </div>
              </li>
              <li className={ROW}>
                <span className={`${BODY} font-bold ${INK}`}>{t(naru.events.nextName)}</span>
                <p className={`break-keep ${BODY} ${SOFT}`}>{t(C.next)}</p>
              </li>
            </ol>
          </div>
        </section>

        {/* ── 변하지 않는 두 개 ─────────────────────────────────────────────── */}
        <section id="core" aria-labelledby="core-title" className="mt-14 lg:mt-20">
          <div className={FRAME}>
            <h2 id="core-title" className={`break-keep ${TITLE} ${NAVY}`}>{t(C.coreHeading)}</h2>
            <ol className={`mt-6 border-t ${RULE}`}>
              {naru.why.cores.map((core, i) => (
                <li key={core.index} className={`grid gap-5 border-b ${RULE} py-6 lg:grid-cols-[minmax(0,1fr)_26rem] lg:gap-12 lg:py-7`}>
                  <div>
                    <h3 className={`break-keep ${HEADING} ${INK}`}>{t(C.coreTitles[i])}</h3>
                    <p className={`mt-3 break-keep ${BODY} ${SOFT}`}><Lines text={t(C.coreLines[i])} /></p>
                  </div>
                  <dl className="rounded-xl bg-[#F6F4EE] px-5 py-4 lg:self-start">
                    <dt className={`${META} font-bold text-[#845185]`}>{t(naru.why.keepsLabel)}</dt>
                    <dd className={`mt-1 break-keep ${BODY} ${INK}`}><Lines text={t(C.coreKeeps[i])} /></dd>
                  </dl>
                </li>
              ))}
            </ol>
            <div className={ROW}>
              <p className={`${META} font-bold ${INK} lg:pt-1.5`}>{t({ ko: "둘이 같이 있어야 하는 이유", en: "Why the two go together" })}</p>
              <div>
                <p className={`break-keep ${HEADING} ${INK}`}>{t(C.note)}</p>
                <p className={`mt-2 break-keep ${BODY} ${SOFT}`}>{t(C.noteBody)}</p>
              </div>
            </div>
            <div className={ROW}>
              <p className={`${META} font-bold ${INK} lg:pt-1`}>{t(C.agendaLabel)}</p>
              <p className={`break-keep ${BODY} ${SOFT}`}><Lines text={t(C.agenda)} /></p>
            </div>
          </div>
        </section>

        {/* ── 일하는 방식 ─────────────────────────────────────────────── */}
        <section id="how" aria-labelledby="how-title" className="mt-14 lg:mt-20">
          <div className={FRAME}>
            <h2 id="how-title" className={`break-keep ${TITLE} ${NAVY}`}>{t(C.howHeading)}</h2>
            <ol className={`mt-6 border-t ${RULE}`}>
              {naru.how.layers.map((layer, k) => (
                <li key={layer.join.id} className={`grid gap-4 border-b ${RULE} py-5 lg:grid-cols-[11rem_minmax(0,1fr)_minmax(0,1fr)] lg:gap-8 lg:py-6`}>
                  <p className={`${META} font-bold ${k === 0 ? NAVY : INK} lg:pt-1`}>{roleName(t(layer.role))}</p>
                  <div>
                    {k === 0 ? (
                      <Image
                        src={locale === "en" ? "/naru/naru-name-en-paper.svg" : "/naru/naru-name-paper.png"}
                        alt={t({ ko: "나루", en: "NARU" })}
                        width={locale === "en" ? 857 : 604}
                        height={locale === "en" ? 142 : 168}
                        unoptimized={locale === "en"}
                        className="block h-7 w-auto"
                      />
                    ) : (
                      <h3 className={`break-keep ${HEADING} ${INK}`}>{t(layer.who)}</h3>
                    )}
                    <p className={`mt-2 break-keep ${BODY} ${SOFT}`}><Lines text={t(C.brings[k])} /></p>
                  </div>
                  <div>
                    <p className={`${META} font-bold ${INK}`}>{t({ ko: "얻는 것", en: "Gets" })}</p>
                    <p className={`mt-1 break-keep ${BODY} ${SOFT}`}><Lines text={t(C.gets[k])} /></p>
                  </div>
                </li>
              ))}
            </ol>

            <h3 className={`mt-10 ${HEADING} ${INK}`}>{t(C.companyLabel)}</h3>
            <dl className={`mt-4 border-t ${RULE}`}>
              {naru.how.company.map((c, i) => (
                <div key={i} className={`grid gap-1 border-b ${RULE} py-5 sm:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] sm:gap-x-10 lg:grid-cols-[minmax(0,17rem)_minmax(0,1fr)] lg:py-6`}>
                  <dt className={`break-keep ${BODY} font-bold ${INK}`}>{t(c.title)}</dt>
                  <dd className={`break-keep ${BODY} ${SOFT}`}>{t(C.companyBodies[i])}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-8">
              {crew && (
                <a href={crew.join.mail} onClick={() => track("naru_mail", { src: `how_${crew.join.id}` })} className={`${BTN_GHOST} self-start`}>
                  {t(crew.join.label)}
                </a>
              )}
              <div>
                <p className={`break-keep ${META} ${SOFT}`}>{t(C.ask)}</p>
                <p className={`${META} ${SOFT}`}>
                  {t(partnerContact.addressLabel)}{" "}
                  <a href={`mailto:${naruLinks.contact}`} className={`-my-3 inline-flex min-h-[44px] select-all items-center py-3 font-semibold ${NAVY} underline decoration-naru-navy/30 underline-offset-4 hover:decoration-naru-navy`}>{naruLinks.contact}</a>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── 왜 이런 자리가 필요한가 ─────────────────────────────────────────────── */}
        <section id="why" aria-labelledby="why-title" className="mt-14 lg:mt-20">
          <div className={FRAME}>
            <h2 id="why-title" className={`break-keep ${TITLE} ${NAVY}`}>{t(C.whyHeading)}</h2>
            <p className={`mt-4 break-keep ${HEADING} ${INK}`}>{t(C.whyLead)}</p>
            <ul className={`mt-6 border-t ${RULE}`}>
              {naru.join.needs.map((need, i) => (
                <li key={need.place.en} className={ROW}>
                  <h3 className={`${BODY} font-bold ${INK}`}>{t(need.place)}</h3>
                  <p className={`break-keep ${BODY} ${SOFT}`}>{t(C.lacks[i])}</p>
                </li>
              ))}
            </ul>
            <div className="mt-10 grid gap-6 lg:mt-12 lg:grid-cols-12 lg:gap-12">
              <p className={`break-keep ${TITLE} ${NAVY} lg:col-span-5`}><Lines text={t(C.closingStatement)} /></p>
              <div className={`flex flex-col gap-4 break-keep ${BODY} ${SOFT} lg:col-span-7 lg:pt-2`}>
                <p><Lines text={t(C.milestones)} /></p>
                {C.closingBody.map((line, i) => <p key={i}><Lines text={t(line)} /></p>)}
              </div>
            </div>
          </div>
        </section>

        <MediaSection />

        {/* ── 매니페스토 ─────────────────────────────────────────────── */}
        <section id="join-ways" aria-labelledby="manifesto-title" className="mt-14 pb-16 lg:mt-20 lg:pb-20">
          <div className={FRAME}>
            <div className="rounded-[22px] bg-[#FFFFFF] px-6 py-10 ring-1 ring-[#E3E0D8] sm:px-10 lg:grid lg:grid-cols-12 lg:gap-12 lg:px-12 lg:py-12">
              <div className="lg:col-span-5">
                <h2 id="manifesto-title" className={`${TITLE} ${INK}`}>{t(naru.join.manifesto.label)}</h2>
                <p className={`mt-3 break-keep ${BODY} ${SOFT}`}><Lines text={t(C.manifestoBody)} /></p>
              </div>
              <div className="mt-8 lg:col-span-7 lg:mt-0">
                <ManifestoViewer locale={locale === "en" ? "en" : "ko"} t={t} />
              </div>
            </div>
          </div>
        </section>

        <MobileChatBar afterId="record" endId="site-footer" phone />
      </main>
      <SiteFooter page="naru" />
    </>
  );
}
