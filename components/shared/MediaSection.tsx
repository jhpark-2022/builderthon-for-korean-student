"use client";

// DECIDED 2026-11-13: 미디어 블록. 나루 홈은 행사 이름과 함께 전부, 크로싱 서울은 그 행사 기사만(이름 칸 없이).
// 왼쪽 11rem 날짜 칸과 오른쪽 매체, 제목. 같은 글이 여러 매체에 실리면(PressGroup) 링크는 매체 이름에.
import { useLocale } from "@/lib/LocaleContext";
import { media, naru, type MediaEvent } from "@/data/naru";
import type { PressEntry } from "@/components/shared/PressRows";
import { TITLE, HEADING, META, INK, SOFT, NAVY, RULE, FRAME } from "@/components/shared/redesign";

const FOCUS = "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-naru-navy";
const UNDER = "underline decoration-naru-navy/25 underline-offset-[5px] transition-colors hover:decoration-naru-navy";
const strip = (s: string) => s.replace(/^「(.*)」$/, "$1");

export default function MediaSection({ only }: { only?: MediaEvent }) {
  const { t } = useLocale();
  const all: { event: MediaEvent; item: PressEntry }[] = [
    ...media.crossing.map((item) => ({ event: "crossing" as const, item })),
    ...naru.record.press.map((item) => ({ event: "zero100" as const, item })),
  ];
  const rows = only ? all.filter((r) => r.event === only) : all;
  const newTab = <span className="sr-only"> ({t(media.newTab)})</span>;

  return (
    <section id="media" aria-labelledby="media-title" className="mt-14 lg:mt-20">
      <div className={FRAME}>
        <h2 id="media-title" className={`${TITLE} ${NAVY}`}>{t(media.heading)}</h2>
        <div className="mt-6 lg:mt-8">
          <ul className={`border-t ${RULE}`}>
            {rows.map(({ event, item }) => (
              <li key={"url" in item ? item.url : item.links[0].url} className={`grid gap-1.5 border-b ${RULE} py-5 lg:grid-cols-[11rem_minmax(0,1fr)] lg:gap-8 lg:py-6`}>
                <p className={`${META} tabular-nums ${SOFT} lg:pt-1`}>
                  {!only && <span className={`block font-semibold ${INK}`}>{t(media.events[event])}</span>}
                  {t(item.date)}
                </p>
                <div className="min-w-0">
                  {"url" in item ? (
                    <>
                      <p className={`${META} font-semibold ${SOFT}`}><span>{t(item.outlet)}</span></p>
                      <a href={item.url} target="_blank" rel="noopener noreferrer" className={`mt-1 inline break-keep ${HEADING} ${INK} ${UNDER} ${FOCUS}`}>
                        {strip(t(item.title))}
                        <span aria-hidden="true" className={`ml-1.5 ${META} ${SOFT}`}>↗</span>
                        {newTab}
                      </a>
                    </>
                  ) : (
                    <>
                      <p className={`${META} font-semibold ${SOFT}`}>
                        {item.links.map((l, i) => (
                          <span key={l.url}>
                            {i > 0 && ", "}
                            <a href={l.url} target="_blank" rel="noopener noreferrer" className={`${NAVY} ${UNDER} ${FOCUS}`}>{t(l.outlet)}{newTab}</a>
                          </span>
                        ))}
                      </p>
                      <p className={`mt-1 break-keep ${HEADING} ${INK}`}>{t(item.title)}</p>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
