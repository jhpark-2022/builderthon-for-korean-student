"use client";

// ─────────────────────────────────────────────────────────────────────────────
// /crossing/mentor?k=. 멘토 한 사람의 페이지(2026-10-26).
//
// DECIDED 2026-10-26 (사용자: "올리면 팀이 멘토분들에게 사전에 공유줄 수 있도록", "멘토 전용 페이지"): 멘토는 자기 링크로 들어와
// Day 2, 3에 자기 칸을 넣은 팀과 그 팀이 올린 PDF 전부(Day 1 1장, Day 2 고친 1장, Day 3 발표 자료)를 눌러 엽니다(2026-10-26).
// 다른 멘토의 칸과 인증 사진은 보이지 않습니다. 보기 URL은 30분짜리라 1분마다 다시 읽습니다.
// 머리와 글자 크기는 /crossing/team과 같습니다(BODY, META 둘).
// DECIDED 2026-10-27 (사용자: 멘토 링크도 kwan-design을 따르게): 머리는 사이트 바와 같은 ToolHeader(워드마크, 가는 선, EN/KR).
// Day 제목은 /crossing/team의 구획 제목처럼 SUBTITLE 굵게 흰색, 날짜는 META. 블루는 칸 안의 파일 타일에만 남깁니다.
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useState } from "react";
import { useLocale } from "@/lib/LocaleContext";
import { BODY, META, SUBTITLE } from "@/components/ui/typography";
import ToolHeader from "@/components/crossing/ToolHeader";
import { mentorCopy as c } from "@/data/crossingTeam";
import { OPS_DAYS, dayDate, fmtKst, trackTint, type Track } from "@/lib/crossingOps";

type Row = { id: string; day: number; team: string; track: string; startsAt: string; endsAt: string; files: { day: number; url: string }[] };
type Data = { mentor: { name: string; field: string | null }; tracks: Track[]; bookings: Row[] };

export default function MentorTool() {
  const { t } = useLocale();
  const [data, setData] = useState<Data | null>(null);
  const [err, setErr] = useState<"bad" | "generic" | null>(null);

  const refresh = useCallback(async () => {
    const k = new URLSearchParams(window.location.search).get("k") ?? "";
    const r = await fetch(`/api/crossing/mentor?k=${encodeURIComponent(k)}`, { cache: "no-store" });
    if (r.status === 404) { setErr("bad"); return; }
    if (!r.ok) { setErr("generic"); return; }
    setErr(null); setData(await r.json());
  }, []);
  useEffect(() => { void refresh(); const id = setInterval(refresh, 60_000); return () => clearInterval(id); }, [refresh]);

  const trackOf = (id: string) => data?.tracks.find((x) => x.id === id);
  // DECIDED 2026-10-26 (사용자, 스크린숏: "뭔가 더 visually catchy 했으면"): 칸 카드는 트랙 색 그라데이션 위에 시간 칩, 팀, 트랙 점,
  // 그리고 파일 타일. 파일은 그 칸의 날까지(Day 2 칸은 Day 1, 2, Day 3 칸은 Day 1~3) 자리를 모두 두고, 올라온 것은 채운 타일(누르면 새 창),
  // 아직이면 점선 타일입니다. 색은 트랙 네 색과 보라(accent)만, 글자 크기는 BODY와 META 둘.
  // DECIDED 2026-10-26 (사용자: "12월 이벤트의 모든 부분을 새 UI/UX로"): kwan-design 문법으로. 카드는 card-base, 굵은 트랙 색 왼쪽 띠와
  // 트랙 그라데이션은 뺐습니다(UI Craft가 꼽는 색 띠 카드). 트랙은 시간 칩의 옅은 틴트와 점으로만, 올라온 파일은 블루(강조 하나) 타일.
  const fileLabel = (d: number) => t(d === 1 ? c.file1 : d === 2 ? c.file2 : c.file3);
  const tile = (d: number, url: string | undefined, tint: string) => url ? (
    <a key={d} href={url} target="_blank" rel="noreferrer"
      className="card-raised group flex min-h-[52px] items-center gap-[10px] rounded-xl px-[12px] py-[8px] transition-[transform,border-color] duration-150 hover:-translate-y-0.5 hover:border-accent/40">
      <span aria-hidden className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/15 text-accent">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5M9 13h6M9 17h4" /></svg>
      </span>
      <span className={`flex-1 ${META} font-semibold text-white`}>{fileLabel(d)}</span>
      <span aria-hidden className={`${META} text-naru-muted transition-[transform,color] group-hover:translate-x-0.5 group-hover:text-accent`}>↗</span>
    </a>
  ) : (
    <div key={d} className="card-sunken flex min-h-[52px] items-center gap-[10px] rounded-xl border-dashed px-[12px] py-[8px]">
      <span aria-hidden className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.04] text-white/25">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5" /></svg>
      </span>
      <span className={`flex-1 ${META} text-naru-muted`}>{fileLabel(d)}</span>
      <span className={`${META} text-naru-muted/70`}>{t(c.notYet)}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-naru-ink text-naru-text">
    <ToolHeader />
    <main id="main" className="px-4 pb-24 pt-[40px] sm:pt-[56px]">
      <div className="mx-auto flex max-w-3xl flex-col gap-[32px]">
        <div className="flex flex-col gap-[6px]">
          <p className={`${META} font-semibold text-naru-muted`}>{t(c.title)}</p>
          {data && <h1 className={`${SUBTITLE} font-bold tracking-[-0.02em] text-white`}>{data.mentor.name}{data.mentor.field && <span className={`ml-2 ${META} font-normal text-naru-muted`}>{data.mentor.field}</span>}</h1>}
          {!data && <h1 className={`${SUBTITLE} font-bold tracking-[-0.02em] text-white`}>{t(c.title)}</h1>}
        </div>
        {err === "bad" && <p role="alert" className={`card-sunken rounded-xl px-[16px] py-[14px] ${BODY} text-white`}>{t(c.badLink)}</p>}
        {err === "generic" && <p role="alert" className={`${META} text-rose-300`}>{t(c.errGeneric)}</p>}

        {data && (
          <>
            <p className={`${BODY} leading-relaxed text-naru-muted`}>{t(c.lead)} <span className={`${META} text-naru-muted/80`}>{t(c.refresh)}</span></p>
            {OPS_DAYS.map((d) => {
              const rows = data.bookings.filter((b) => b.day === d);
              return (
                <section key={d} aria-labelledby={`mentor-day-${d}`} className="flex flex-col gap-[12px]">
                  <h2 id={`mentor-day-${d}`} className={`flex items-baseline gap-[10px] ${SUBTITLE} font-bold tracking-[-0.02em] text-white`}>
                    <span>{t(c.day)} {d}</span> <span className={`${META} font-normal text-naru-muted`}>{dayDate(d).slice(5).replace("-", ".")}</span>
                    {rows.length > 0 && <span className={`ml-auto ${META} font-semibold tabular-nums text-naru-muted`}>{t(c.teamCount).replace("{n}", String(rows.length))}</span>}
                  </h2>
                  {!rows.length && <p className={`card-sunken rounded-xl px-[16px] py-[14px] ${META} text-naru-muted`}>{t(c.empty)}</p>}
                  {rows.map((b) => {
                    const tint = trackTint(trackOf(b.track)?.color);
                    const tr = trackOf(b.track);
                    return (
                      <div key={b.id} className="card-base flex flex-col gap-[16px] rounded-2xl p-[20px] sm:flex-row sm:items-center sm:gap-[24px] sm:p-[24px]">
                        <div className="flex shrink-0 flex-col gap-[8px] sm:w-[11rem]">
                          <span className={`w-fit rounded-md px-[8px] py-[3px] ${META} font-semibold tabular-nums text-white`} style={{ background: `${tint}2E` }}>
                            {fmtKst(b.startsAt)}~{fmtKst(b.endsAt)}
                          </span>
                          <span className={`${BODY} font-bold text-white`}>{b.team}</span>
                          {tr && <span className={`flex items-center gap-[6px] ${META} text-naru-muted`}><span aria-hidden className="h-2 w-2 rounded-full" style={{ background: tint }} />{t(tr.label)}</span>}
                        </div>
                        <div className="grid flex-1 gap-[8px]">
                          {Array.from({ length: b.day }, (_, i) => i + 1).map((fd) => tile(fd, b.files.find((f) => f.day === fd)?.url, tint))}
                        </div>
                      </div>
                    );
                  })}
                </section>
              );
            })}
          </>
        )}
      </div>
    </main>
    </div>
  );
}
