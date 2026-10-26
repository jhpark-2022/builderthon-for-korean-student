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
  const link = (href: string, label: string) => (
    <a href={href} target="_blank" rel="noreferrer" className={`inline-flex min-h-[44px] items-center ${BODY} font-semibold text-accent underline decoration-accent/40 underline-offset-4 transition-colors hover:text-white`}>
      {label} <span aria-hidden className="ml-1">↗</span>
    </a>
  );

  return (
    <main id="main" className="min-h-screen bg-[#070B1F] px-4 pb-24 pt-4 text-white">
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
                  <h2 id={`mentor-day-${d}`} className={`${BODY} font-bold`}>
                    {t(c.day)} {d} <span className={`${META} font-normal text-white/70`}>{dayDate(d).slice(5).replace("-", ".")}</span>
                  </h2>
                  {!rows.length && <p className={`${BODY} text-white/70`}>{t(c.empty)}</p>}
                  {rows.map((b) => {
                    const tint = trackTint(trackOf(b.track)?.color);
                    return (
                      <div key={b.id} className="flex flex-col gap-[9px] rounded-2xl border border-white/15 bg-white/[0.03] p-[20px] sm:flex-row sm:items-center sm:justify-between sm:p-[24px]"
                        style={{ boxShadow: `inset 3px 0 0 ${tint}` }}>
                        <div className="flex flex-col gap-[4px]">
                          <span className={`${META} tabular-nums text-white/70`}>{fmtKst(b.startsAt)}~{fmtKst(b.endsAt)}</span>
                          <span className={`${BODY} font-bold`}>{b.team}</span>
                          {trackOf(b.track) && <span className={`${META} text-white/70`}>{t(trackOf(b.track)!.label)}</span>}
                        </div>
                        <div className="flex flex-col sm:items-end">
                          {b.files.length ? b.files.map((f) => <span key={f.day}>{link(f.url, t(f.day === 1 ? c.file1 : f.day === 2 ? c.file2 : c.file3))}</span>)
                            : <span className={`${META} text-white/70`}>{t(c.noPdf)}</span>}
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
