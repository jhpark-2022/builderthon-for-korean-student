// 언론 인용 줄. 8월 페이지(components/journey/Journey.tsx의 press 블록)와 같은
// 마크업·클래스입니다. 2026-09-17에 나루 홈의 #record가 같은 줄을 쓰게 되어 여기로
// 냈습니다. Journey.tsx의 원문은 그대로 두었습니다(8월 페이지 픽셀 회귀 0 규칙).
// 한 기사가 한 줄(제호 · 제목 · 날짜 · 원문 보기)이고 카드가 아니라 인용으로 읽힙니다.
import type { Phrase, PressItem } from "@/data/dictionary";

// 같은 글이 여러 매체에 실린 경우(보도자료). 제목·날짜는 한 번, 링크는 매체마다.
// 줄 하나가 링크 하나라는 규칙을 깨는 대신, 같은 제목을 두 줄에 두 번 쓰지 않습니다.
export type PressGroup = {
  title: Phrase;
  date: Phrase;
  links: { outlet: Phrase; url: string }[];
};
export type PressEntry = PressItem | PressGroup;
const isGroup = (p: PressEntry): p is PressGroup => "links" in p;

export default function PressRows({
  items,
  tag,
  lead,
  cta,
  t,
  className = "",
}: {
  items: PressEntry[];
  tag: Phrase;
  lead?: Phrase;
  cta: Phrase;
  t: (p: Phrase) => string;
  className?: string;
}) {
  return (
    <div className={`mx-auto max-w-2xl ${className}`}>
      <p className="text-center text-[0.68rem] font-bold uppercase tracking-[0.2em] text-white/55">{t(tag)}</p>
      {lead ? <p className="mt-2 break-keep text-center text-sm leading-relaxed text-white/70">{t(lead)}</p> : null}
      {items.map((p) => isGroup(p) ? (
        <div
          key={p.links[0].url}
          className="mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-center"
        >
          <span className="text-sm font-semibold text-white/90">{t(p.title)}</span>
          <span className="text-xs text-white/55">{t(p.date)}</span>
          {p.links.map((l) => (
            <a
              key={l.url}
              href={l.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-semibold text-violet-300 transition hover:text-violet-200"
            >
              {t(l.outlet)}
              <span aria-hidden>↗</span>
            </a>
          ))}
        </div>
      ) : (
        <a
          key={p.url}
          href={p.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-center transition hover:border-violet-400/30 hover:bg-white/[0.06]"
        >
          {p.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={p.logo} alt={t(p.outlet)} className="h-4 w-auto max-w-[5.5rem] shrink-0 object-contain opacity-70" />
          ) : (
            <span className="shrink-0 text-sm font-semibold tracking-tight text-white/70">{t(p.outlet)}</span>
          )}
          <span className="text-sm font-semibold text-white/90">{t(p.title)}</span>
          <span className="text-xs text-white/55">{t(p.date)}</span>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-violet-300 transition group-hover:text-violet-200">
            {t(cta)}
            <span aria-hidden>↗</span>
          </span>
        </a>
      ))}
    </div>
  );
}
