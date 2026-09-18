// 언론 인용 줄. 8월 페이지(components/journey/Journey.tsx의 press 블록)에서 온
// 줄인데, 2026-09-17에 나루 홈의 #record가 쓰면서 여기로 냈고 정렬을 바꿨습니다.
// Journey.tsx의 원문은 그대로입니다(8월 페이지 픽셀 회귀 0 규칙).
//
// DECIDED 2026-09-17 (사용자): 가운데 정렬에서 표 정렬로. 제목 길이가 줄마다 크게
// 달라(영문 보도자료 제목 두 줄, 한국 기사 제목 한 줄) 가운데 맞춤이면 짧은 줄이
// 떠 보였습니다. 열 넷을 고정하면(제호 · 제목 · 날짜 · 링크) 길이가 달라도 같은
// 줄로 읽힙니다. 폰에서는 세로로 쌓입니다.
import type { Phrase, PressItem } from "@/data/dictionary";

// 같은 글이 여러 매체에 실린 경우(보도자료). 제목·날짜는 한 번, 링크는 매체마다.
export type PressGroup = {
  title: Phrase;
  date: Phrase;
  links: { outlet: Phrase; url: string }[];
};
export type PressEntry = PressItem | PressGroup;
const isGroup = (p: PressEntry): p is PressGroup => "links" in p;

const ROW = "mt-3 grid grid-cols-1 gap-x-5 gap-y-1.5 rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3.5 text-left sm:grid-cols-[9rem_1fr_5.5rem_5.5rem] sm:items-center";
const OUTLET = "text-sm font-semibold tracking-tight text-white/70";
const TITLE = "break-keep text-sm font-semibold leading-snug text-white/90";
const DATE = "text-xs tabular-nums text-white/55";
// -my-2.5 py-2.5: 히트 영역 44px, 레이아웃 불변(2026-09-18 모바일 수정 브리프 5).
const LINK = "-my-2.5 inline-flex min-h-[44px] items-center gap-1 py-2.5 text-xs font-semibold text-violet-300 transition hover:text-violet-200";

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
    <div className={`mx-auto max-w-3xl ${className}`}>
      <p className="text-center text-[0.68rem] font-bold uppercase tracking-[0.2em] text-white/55">{t(tag)}</p>
      {lead ? <p className="mt-2 break-keep text-center text-sm leading-relaxed text-white/70">{t(lead)}</p> : null}
      {items.map((p) =>
        isGroup(p) ? (
          <div key={p.links[0].url} className={ROW}>
            {/* 제호 칸에 매체 링크들. 같은 글이라 "원문 보기"가 둘일 수 없어, 매체
                이름이 곧 링크입니다. 마지막 칸은 비워 열을 맞춥니다. */}
            <span className="flex flex-wrap gap-x-3 gap-y-1">
              {p.links.map((l) => (
                <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer" className={LINK}>
                  {t(l.outlet)}
                  <span aria-hidden>↗</span>
                </a>
              ))}
            </span>
            <span className={TITLE}>{t(p.title)}</span>
            <span className={DATE}>{t(p.date)}</span>
            <span aria-hidden className="hidden sm:block" />
          </div>
        ) : (
          <a key={p.url} href={p.url} target="_blank" rel="noopener noreferrer" className={`group ${ROW} transition hover:border-violet-400/30 hover:bg-white/[0.06]`}>
            {p.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p.logo} alt={t(p.outlet)} className="h-4 w-auto max-w-[5.5rem] object-contain opacity-70" />
            ) : (
              <span className={OUTLET}>{t(p.outlet)}</span>
            )}
            <span className={TITLE}>{t(p.title)}</span>
            <span className={DATE}>{t(p.date)}</span>
            <span className={`${LINK} group-hover:text-violet-200`}>
              {t(cta)}
              <span aria-hidden>↗</span>
            </span>
          </a>
        )
      )}
    </div>
  );
}
