"use client";

// ─────────────────────────────────────────────────────────────────────────────
// /crossing/mentor?k=. 멘토 한 사람의 페이지(2026-10-26).
//
// DECIDED 2026-10-26 (사용자: "올리면 팀이 멘토분들에게 사전에 공유줄 수 있도록", "멘토 전용 페이지"): 멘토는 자기 링크로 들어와
// Day 2, 3에 자기 칸을 넣은 팀과 그 팀이 올린 PDF 전부(Day 1 1장, Day 2 고친 1장, Day 3 발표 자료)를 눌러 엽니다(2026-10-26).
// 다른 멘토의 칸과 인증 사진은 보이지 않습니다. 보기 URL은 30분짜리라 1분마다 다시 읽습니다.
// 머리와 글자 크기는 /crossing/team과 같습니다(BODY, META 둘).
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useState } from "react";
import { useLocale } from "@/lib/LocaleContext";
import { BODY, META } from "@/components/ui/typography";
import LocaleToggle from "@/components/LocaleToggle";
import { mentorCopy as c, teamCopy } from "@/data/crossingTeam";
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
  const fileLabel = (d: number) => t(d === 1 ? c.file1 : d === 2 ? c.file2 : c.file3);
  const tile = (d: number, url: string | undefined, tint: string) => url ? (
    <a key={d} href={url} target="_blank" rel="noreferrer"
      className="group flex min-h-[52px] items-center gap-[10px] rounded-xl border px-[12px] py-[8px] transition duration-150 hover:-translate-y-0.5 hover:bg-white/[0.08]"
      style={{ borderColor: `${tint}66`, background: `${tint}1F` }}>
      <span aria-hidden className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ background: `${tint}33`, color: tint }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5M9 13h6M9 17h4" /></svg>
      </span>
      <span className={`flex-1 ${META} font-semibold text-white`}>{fileLabel(d)}</span>
      <span aria-hidden className={`${META} text-white/70 transition group-hover:translate-x-0.5 group-hover:text-white`}>↗</span>
    </a>
  ) : (
    <div key={d} className="flex min-h-[52px] items-center gap-[10px] rounded-xl border border-dashed border-white/15 px-[12px] py-[8px]">
      <span aria-hidden className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.04] text-white/30">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5" /></svg>
      </span>
      <span className={`flex-1 ${META} text-white/50`}>{fileLabel(d)}</span>
      <span className={`${META} text-white/40`}>{t(c.notYet)}</span>
    </div>
  );

  return (
    <main id="main" className="min-h-screen bg-naru-ink px-4 pb-24 pt-4 text-naru-text">
      <div className="mx-auto flex max-w-3xl flex-col gap-[27px]">
        <header className="flex min-h-[44px] items-center justify-between">
          <a href="/" className={`-my-3 inline-flex min-h-[44px] items-center py-3 ${BODY} font-semibold text-white/70 transition hover:text-white`}>← {t(teamCopy.back)}</a>
          <LocaleToggle />
        </header>
        <div className="flex flex-col gap-[9px]">
          <h1 className={`${BODY} font-bold`}>{t(c.title)}</h1>
          {data && <p className={`${BODY} text-white/85`}>{data.mentor.name}{data.mentor.field && <span className={`ml-2 ${META} text-white/70`}>{data.mentor.field}</span>}</p>}
        </div>
        {err === "bad" && <p role="alert" className={`${BODY} text-naru-orange`}>{t(c.badLink)}</p>}
        {err === "generic" && <p role="alert" className={`${META} text-rose-300`}>{t(c.errGeneric)}</p>}

        {data && (
          <>
            <p className={`${BODY} text-white/70`}>{t(c.lead)} <span className={`${META}`}>{t(c.refresh)}</span></p>
            {OPS_DAYS.map((d) => {
              const rows = data.bookings.filter((b) => b.day === d);
              return (
                <section key={d} aria-labelledby={`mentor-day-${d}`} className="flex flex-col gap-[13.5px]">
                  <h2 id={`mentor-day-${d}`} className={`flex items-baseline gap-[10px] ${BODY} font-bold`}>
                    {t(c.day)} {d} <span className={`${META} font-normal text-white/70`}>{dayDate(d).slice(5).replace("-", ".")}</span>
                    {rows.length > 0 && <span className={`ml-auto rounded-full bg-accent/15 px-[10px] py-[2px] ${META} font-semibold text-accent`}>{t(c.teamCount).replace("{n}", String(rows.length))}</span>}
                  </h2>
                  {!rows.length && <p className={`rounded-2xl border border-dashed border-white/10 px-[20px] py-[18px] ${BODY} text-white/50`}>{t(c.empty)}</p>}
                  {rows.map((b) => {
                    const tint = trackTint(trackOf(b.track)?.color);
                    const tr = trackOf(b.track);
                    return (
                      <div key={b.id} className="flex flex-col gap-[16px] rounded-2xl border p-[20px] sm:flex-row sm:items-center sm:gap-[24px] sm:p-[24px]"
                        style={{ borderColor: `${tint}40`, background: `linear-gradient(135deg, ${tint}2E, ${tint}0A 60%)`, boxShadow: `inset 4px 0 0 ${tint}` }}>
                        <div className="flex shrink-0 flex-col gap-[8px] sm:w-[11rem]">
                          <span className={`w-fit rounded-full px-[10px] py-[3px] ${META} font-bold tabular-nums text-white`} style={{ background: `${tint}55` }}>
                            {fmtKst(b.startsAt)}~{fmtKst(b.endsAt)}
                          </span>
                          <span className={`${BODY} font-bold`}>{b.team}</span>
                          {tr && <span className={`flex items-center gap-[6px] ${META} text-white/70`}><span aria-hidden className="h-2 w-2 rounded-full" style={{ background: tint }} />{t(tr.label)}</span>}
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
  );
}
