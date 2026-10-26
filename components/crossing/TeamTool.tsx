"use client";

// ─────────────────────────────────────────────────────────────────────────────
// /crossing/team. 모든 팀이 같이 보는 멘토 시간표와 Day 2, Day 3 미션 인증(2026-10-17).
//
// DECIDED 2026-10-17 (사용자: "너무 뭐가 많은데? 그냥 timetable where team can put in their available, 다른 팀과 공유"):
// wejoinin처럼 표 하나입니다. 줄은 30분, 칸은 멘토. 팀을 고르고 빈 칸을 누르면 그 팀 이름이 30분 들어가고,
// 앞뒤 10분은 "쉬는 10분"으로 막힙니다(규칙의 정본은 DB 제약, lib/crossingOps.ts). 팀 코드는 없습니다.
// 고른 팀은 이 기기의 localStorage에만 둡니다. 폰에서 표가 넓으면 표만 옆으로 밉니다(페이지는 밀리지 않음).
// DECIDED 2026-10-18 (사용자: "멘토링 슬롯을 넣을때도 무슨 트랙인지에 따라서 슬롯 색깔이 달라졌으면"): 넣은 칸은 그 팀의
// 트랙 색(lib/crossingOps.ts TRACK_TINTS)으로 칠합니다. 우리 팀은 주황 대신 흰 테두리로 가립니다(주황은 트랙 색과 겹침).
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocale } from "@/lib/LocaleContext";
import { BODY, META, SUBTITLE } from "@/components/ui/typography";
import { buttonClass } from "@/components/ui/Button";
import LocaleToggle from "@/components/LocaleToggle";
import { teamCopy as c, timetableRules } from "@/data/crossingTeam";
import {
  BUFFER_MINUTES, GRID_MINUTES, bookingGate, isPhoneUA, kstTime, BOOKING_OPENS_DAY, BOOKING_OPENS_AT, MAX_BOOKINGS_PER_TEAM_PER_DAY, PROOF_DAYS, PROOF_MAX_BYTES, PROOF_TYPES, dayDate, fitsWindow, fmtKst, isProofDay, proofKindsFor, slotState, trackTint,
  type ProofDay, type ProofKind, type Track, type Window,
} from "@/lib/crossingOps";

const TEAM_KEY = "crossing-team";
// 2026-10-26 (사용자: "색깔이 좀 더 다채로우면 좋을거 같기는 함 for the teams"): 팀 칸의 트랙 색을 더 진하게.
// 그 전 22%(38) 한 겹. 이제 왼쪽 위 45%에서 오른쪽 아래 25%로(brand 10장 그라데이션 방향), 왼쪽 띠 4px. 색은 그대로 트랙 네 색입니다.
const SLOT_ALPHA = "73", SLOT_ALPHA_END = "40";
const MIN = 60_000;
type Bk = { id: string; team: string; track: string; startsAt: string; endsAt: string };
type Mentor = { id: string; name: string; field: string | null; windows: Window[]; bookings: Bk[] };
type Proof = { id: string; day: number; kind: ProofKind; createdAt: string; sizeBytes?: number };

const load = (k: string) => { try { return localStorage.getItem(k) ?? ""; } catch { return ""; } };
const save = (k: string, v: string) => { try { localStorage.setItem(k, v); } catch { /* 저장 못 해도 화면은 돕니다 */ } };

export default function TeamTool() {
  const { t } = useLocale();
  const [day, setDay] = useState<ProofDay>(2);
  const [teams, setTeams] = useState<string[]>([]);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [teamTracks, setTeamTracks] = useState<Record<string, string>>({});
  const [mentors, setMentors] = useState<Mentor[] | null>(null);
  const [team, setTeam] = useState(""); // 팀 이름. 따로 만드는 ID는 없습니다
  const [pending, setPending] = useState<{ m: string; r: number } | null>(null); // 넣기 전에 한 번 묻는 칸
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setTeam(load(TEAM_KEY));
    // 홈의 Day 1, 2, 3 카드 버튼이 ?day=N으로 엽니다(2026-10-17).
    const d = Number(new URLSearchParams(window.location.search).get("day"));
    if (isProofDay(d)) setDay(d);
  }, []);
  // DECIDED 2026-10-26 (사용자: "여기에 있는 기능들은 폰으로는 할 수 없도록 for the participants", 이어서 사진과 PDF는 폰에서도):
  // 폰에서는 칸을 넣지 못하고 시간표는 보기만 합니다. 판정은 서버(app/api/crossing/mentoring, isPhoneUA)와 같은 기준입니다.
  const [phone, setPhone] = useState(false);
  useEffect(() => { setPhone(isPhoneUA(navigator.userAgent)); }, []);
  // DECIDED 2026-10-17 (사용자: "day 1으로 들어왔을때는 timetable은 disable, 팀 이름을 넣던 말던"): Day 1 탭에서는 시간표가 늘 잠깁니다.
  const timetableLocked = day === 1;
  // 2026-10-26: 안내 줄에 쓰는 지금 상태. 칸마다의 판정은 bookingGate가 합니다. 시간표를 다시 읽을 때(20초) 같이 새로 셉니다.
  const now = Date.now();
  const notYet = now < kstTime(BOOKING_OPENS_DAY, BOOKING_OPENS_AT)!.getTime();
  const today = now >= kstTime(day, "00:00")!.getTime();

  const refresh = useCallback(async () => {
    const r = await fetch(`/api/crossing/mentoring?day=${day}`, { cache: "no-store" });
    if (!r.ok) { setMsg(t(c.errGeneric)); return; }
    const j = await r.json();
    setTeams(j.teams ?? []); setTracks(j.tracks ?? []); setTeamTracks(j.teamTracks ?? {}); setMentors(j.mentors ?? []);
  }, [day]);
  useEffect(() => { setMentors(null); setMsg(null); setPending(null); void refresh(); }, [refresh]);
  // 다른 팀이 넣은 칸이 보이도록 20초마다 다시 읽습니다.
  useEffect(() => { const id = setInterval(refresh, 20_000); return () => clearInterval(id); }, [refresh]);

  const rows = useMemo(() => {
    const ws = (mentors ?? []).flatMap((m) => m.windows);
    if (!ws.length) return [];
    const a = Math.min(...ws.map((w) => Date.parse(w.startsAt))), b = Math.max(...ws.map((w) => Date.parse(w.endsAt)));
    const out: number[] = [];
    for (let x = a; x < b; x += GRID_MINUTES * MIN) out.push(x);
    return out;
  }, [mentors]);

  // DECIDED 2026-10-17 (사용자: "팀 선택을 해야 업로드나 시간표에 슬롯 넣는 것이 풀리는 걸로"): 목록에 있는 팀을 골라야
  // 인증 올리기와 칸 넣기가 풀립니다. 그 전에는 두 영역이 보이되 잠겨 있습니다.
  const picked = teams.includes(team) ? team : "";
  const mine = (mentors ?? []).flatMap((m) => m.bookings.filter((b) => b.team === picked));
  const trackOf = (id: string | undefined) => tracks.find((x) => x.id === id);
  const tintOf = (id: string | undefined) => trackTint(trackOf(id)?.color);
  const myTint = tintOf(teamTracks[picked]);

  const call = async (method: "POST" | "DELETE", body: object) => {
    setBusy(true); setMsg(null);
    const r = await fetch("/api/crossing/mentoring", { method, headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    if (!r.ok) {
      const e = (await r.json().catch(() => ({}))).error;
      setMsg(t(e === "taken" ? c.errTaken : e === "team_busy" ? c.errTeamBusy : e === "team_limit" ? c.errLimit : e === "past" ? c.errPast
        : e === "not_yet" ? c.errNotYet : e === "same_day_morning" ? c.errMorning : e === "phone" ? c.errPhone : c.errGeneric));
    }
    setPending(null); setBusy(false); void refresh();
  };

  const cell = (m: Mentor, r: number) => {
    const inWin = m.windows.some((w) => Date.parse(w.startsAt) <= r && r < Date.parse(w.endsAt));
    if (!inWin) return <td key={m.id} className="border-l border-white/5 bg-naru-ink/60" />;
    const b = m.bookings.find((x) => Date.parse(x.startsAt) <= r && r < Date.parse(x.endsAt));
    if (b) {
      // DECIDED 2026-10-18 (사용자: "두개의 상자 불편함. 하나의 상자면 좋겠음"): 40분 칸이 30분 줄 둘에 걸쳐도
      // 첫 줄의 칸이 그 줄들을 합쳐(rowSpan) 상자 하나로 그립니다. 뒤 줄에는 칸을 그리지 않습니다.
      const s = Date.parse(b.startsAt), e = Date.parse(b.endsAt);
      const span = rows.filter((x) => s <= x && x < e);
      if (span[0] !== r) return null;
      const ours = b.team === picked;
      // 칸의 색은 그 팀의 트랙(2026-10-18). 왼쪽 띠는 진하게, 바탕은 옅게. 우리 팀은 흰 테두리.
      const tint = tintOf(b.track);
      return (
        <td key={m.id} rowSpan={span.length} className="border-l border-white/5 p-0 align-top">
          <div title={trackOf(b.track) ? t(trackOf(b.track)!.label) : undefined}
            // 띠와 흰 테두리를 한 그림자에 둡니다(Tailwind ring도 그림자라 따로 쓰면 하나가 지워짐).
            // DECIDED 2026-10-21 (시각 통일): 예약 높이는 걸친 45px 시간표 줄 수입니다.
            className="rounded-md"
            style={{ height: `${span.length * 45}px`, background: `linear-gradient(135deg, ${tint}${SLOT_ALPHA}, ${tint}${SLOT_ALPHA_END})`, boxShadow: `inset 4px 0 0 ${tint}${ours ? ", inset 0 0 0 2px rgba(255,255,255,0.9)" : ""}` }}>
            {/* 한 번 넣은 칸은 바꾸지 못합니다(2026-10-17). 우리 팀 칸도 이름만 보입니다. */}
            <span className={`block truncate py-1.5 pl-2.5 pr-1 ${META} font-bold ${ours ? "text-white" : "text-white/85"}`}>{b.team}</span>
            <span className={`block pl-2.5 ${META} tabular-nums text-white/70`}>{fmtKst(s)}~{fmtKst(e)}</span>
          </div>
        </td>
      );
    }
    const gap = m.bookings.some((x) => {
      const s = Date.parse(x.startsAt), e = Date.parse(x.endsAt);
      return (r >= s - BUFFER_MINUTES * MIN && r < s) || (r >= e && r < e + BUFFER_MINUTES * MIN);
    });
    if (gap) return <td key={m.id} className={`border-l border-white/5 bg-[repeating-linear-gradient(45deg,rgba(255,255,255,0.06)_0_4px,transparent_4px_8px)] px-2 ${META} text-white/70`}>{t(c.gap)}</td>;
    // 2026-10-26 (사용자: 지난 칸이 막힌 것이 보이게, 넣은 팀의 칸은 그대로 남게): 시작 시각이 지난 빈칸은 빗금과 "지남"입니다.
    // 쉬는 10분과 같은 빗금이되 더 흐립니다. 팀이 넣은 칸은 위에서 먼저 그려져 시간이 지나도 그대로 남습니다.
    if (r < Date.now()) return <td key={m.id} className={`border-l border-white/5 bg-[repeating-linear-gradient(45deg,rgba(255,255,255,0.035)_0_4px,transparent_4px_8px)] px-2 ${META} text-white/40`}>{t(c.past)}</td>;
    const free = fitsWindow(r, m.windows) && slotState(r, m.bookings, []) === "open";
    const full = mine.length >= MAX_BOOKINGS_PER_TEAM_PER_DAY; // 이 날 두 칸을 다 넣었으면 더 열지 않습니다
    // 2026-10-26: Day 1 전에는 닫혀 있고, 그날에는 13:00 전 칸이 닫힙니다(bookingGate). 닫힌 칸도 흐린 "+"로 보입니다.
    const gated = bookingGate(day, r) !== "ok";
    const ok = !phone && !timetableLocked && !gated && !!picked && !full && free && slotState(r, m.bookings, mine) === "open";
    const asking = pending?.m === m.id && pending.r === r;
    const locked = (phone || timetableLocked || gated || !picked) && free; // 팀을 고르면 열릴 칸: "+"를 흐리게 보여 줍니다
    return (
      <td key={m.id} className="border-l border-white/5 p-0">
        <button type="button" disabled={!ok || busy} aria-label={`${m.name} ${fmtKst(r)}`}
          // 바꿀 수 없으니 두 번 누릅니다: 처음은 "넣기?"로 묻고, 같은 칸을 한 번 더 누르면 넣습니다.
          onClick={() => (asking ? (setPending(null), call("POST", { team: picked, mentorId: m.id, startsAt: new Date(r).toISOString() })) : setPending({ m: m.id, r }))}
          // 묻는 칸은 우리 팀의 트랙 색으로 미리 칠합니다(넣으면 이 색이 됩니다).
          style={asking ? { background: `${myTint}${SLOT_ALPHA}`, borderColor: myTint } : undefined}
          className={`min-h-[44px] w-full rounded-md px-1 py-2 ${META} transition-colors duration-150 ${asking ? "border font-bold text-white" : ok ? "border border-white/10 bg-white/[0.02] text-naru-muted hover:border-accent/40 hover:bg-accent/10 hover:text-accent" : locked ? "cursor-not-allowed text-white/20" : "text-transparent"}`}>
          {asking ? t(c.confirmPut) : "+"}
        </button>
      </td>
    );
  };

  // DECIDED 2026-10-26 (사용자: "main에 있는 웹사이트 디자인 기준으로 시간표와 인증 페이지의 UI/UX를 바꿔줘"): 2026-10-26 kwan-design의 문법을 따릅니다.
  // 뉴트럴 잉크 바탕, 면은 card-base/card-sunken/card-tint, 강조는 블루(accent) 하나, 캡션 톤(naru-muted). 주황 안내 글씨는 없앴습니다.
  // 규칙 여섯은 같은 모양 카드 여섯 장(UI Craft가 꼽는 템플릿 문법)이 아니라 한 판 안의 목록입니다. 글자 크기는 SUBTITLE, BODY, META.
  const dayLabel = (d: number) => dayDate(d).slice(5).replace("-", ".");
  return (
    <main id="main" className="min-h-screen bg-naru-ink px-4 pb-24 pt-4 text-naru-text">
      <div className="mx-auto flex max-w-5xl flex-col gap-[32px]">
        {/* 2026-10-23 (모바일 점검): /match와 같은 머리(돌아가기, EN/KR). */}
        <header className="flex min-h-[44px] items-center justify-between">
          <a href="/crossing" className={`-my-3 inline-flex min-h-[44px] items-center py-3 ${BODY} font-semibold text-naru-muted transition-colors hover:text-white`}>← {t(c.back)}</a>
          <LocaleToggle />
        </header>

        <div className="flex flex-col gap-[16px]">
          <h1 className={`${SUBTITLE} font-bold tracking-[-0.02em] text-white`}>{t(c.title)}</h1>
          {/* 팀과 날 고르기: 한 판 안에 셀렉트와 세그먼트 */}
          <div className="card-base flex flex-col gap-[16px] rounded-2xl p-[20px] sm:flex-row sm:items-end sm:justify-between sm:p-[24px]">
            <div className="flex flex-col gap-[8px]">
              <label htmlFor="team" className={`${META} font-semibold text-naru-muted`}>{t(c.teamLabel)}</label>
              <div className="relative">
                <select id="team" value={teams.includes(team) ? team : ""} onChange={(e) => { setTeam(e.target.value); save(TEAM_KEY, e.target.value); }}
                  className={`min-h-[44px] w-full min-w-[14rem] appearance-none rounded-lg border border-white/10 bg-naru-surface-2 py-2 pl-3 pr-10 ${BODY} text-white transition-colors focus-visible:border-accent/60 focus-visible:outline-none sm:w-auto`}>
                  <option value="">{t(c.teamPick)}</option>
                  {teams.map((x) => <option key={x} value={x}>{trackOf(teamTracks[x]) ? `${x} (${t(trackOf(teamTracks[x])!.label)})` : x}</option>)}
                </select>
                <svg aria-hidden width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-naru-muted"><path d="m6 9 6 6 6-6" /></svg>
              </div>
            </div>
            <div role="tablist" aria-label="Day" className="card-sunken inline-flex w-full rounded-full p-1 sm:w-auto">
              {PROOF_DAYS.map((d) => (
                <button key={d} role="tab" aria-selected={day === d} type="button" onClick={() => setDay(d)}
                  className={`min-h-[40px] flex-1 rounded-full px-4 ${BODY} font-semibold transition-colors duration-150 sm:flex-none ${day === d ? "bg-naru-surface-2 text-white shadow-[0_1px_2px_rgb(0_0_0/0.4)]" : "text-naru-muted hover:text-white"}`}>
                  <span className={day === d ? "text-accent" : ""}>{t(c.dayTab)} {d}</span> <span className={`${META} font-normal text-naru-muted`}>{dayLabel(d)}</span>
                </button>
              ))}
            </div>
          </div>
          {!picked && <Note>{t(timetableLocked ? c.pickFirstDay1 : c.pickFirst)}</Note>}
        </div>

        {/* DECIDED 2026-10-17 (사용자, 스크린숏: "인증 올리는 거를 테이블 위로"): 인증이 시간표보다 먼저 섭니다. */}
        <Proofs team={picked} day={day} phone={phone} />

        {msg && <p role="alert" className={`${META} text-rose-300`}>{msg}</p>}
        {/* DECIDED 2026-10-26 (사용자: "1일차에는 멘토 시간표가 없어야함"): Day 1 탭에서는 시간표 절 전체를 그리지 않습니다. */}
        {timetableLocked && <Note>{t(c.day1BookHint)}</Note>}
        {!timetableLocked && (
        <section aria-labelledby="tt-h" className="flex flex-col gap-[16px]">
          <div className="flex flex-col gap-[8px]">
            <h2 id="tt-h" className={`${SUBTITLE} font-bold tracking-[-0.02em] text-white`}>{t(c.timetableHeading)}</h2>
            <p className={`flex items-center gap-[8px] ${META} text-naru-muted`}>
              <span aria-hidden className="text-accent"><RuleIcon name="doc" size={16} /></span>{t(c.carry)}
            </p>
          </div>

          {/* 넣는 규칙: 한 판, 여섯 줄. 시간 규칙 둘(열림, 당일)은 블루 점. */}
          <dl className="card-sunken grid gap-x-[24px] gap-y-[14px] rounded-2xl p-[20px] sm:grid-cols-2 sm:p-[24px] lg:grid-cols-3">
            {timetableRules.map((r) => (
              <div key={r.icon} className="flex gap-[10px]">
                <span aria-hidden className={`mt-[2px] shrink-0 ${r.icon === "open" || r.icon === "today" ? "text-accent" : "text-naru-muted"}`}><RuleIcon name={r.icon} size={18} /></span>
                <div className="flex flex-col gap-[2px]">
                  <dt className={`${META} font-semibold text-white`}>{t(r.key)}</dt>
                  <dd className={`${META} leading-relaxed text-naru-muted`}>{t(r.body)}</dd>
                </div>
              </div>
            ))}
          </dl>

          {phone && <Note tone="accent">{t(c.phoneNotice)}</Note>}
          {!phone && notYet && <Note tone="accent">{t(c.notYet)}</Note>}
          {!phone && !notYet && today && <Note tone="accent">{t(c.sameDay)}</Note>}

          {tracks.length > 0 && (
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              {tracks.map((x) => (
                <span key={x.id} className={`flex items-center gap-2 ${META} ${teamTracks[picked] === x.id ? "font-semibold text-white" : "text-naru-muted"}`}>
                  <span aria-hidden className="h-3 w-5 rounded-sm" style={{ background: `${trackTint(x.color)}${SLOT_ALPHA}`, boxShadow: `inset 4px 0 0 ${trackTint(x.color)}` }} />
                  {t(x.label)}
                </span>
              ))}
              <span className={`${META} text-naru-muted`}>{t(c.trackLegend)}</span>
            </div>
          )}

          {mentors && !rows.length && <p className={`${BODY} text-naru-muted`}>{t(c.noMentors)}</p>}
          {/* 2026-10-23 (모바일 점검): 폰에서 표가 옆으로 굴러간다는 한 줄과 오른쪽 끝 페이드. */}
          {!!rows.length && <p className={`${META} text-naru-muted sm:hidden`}>{t(c.swipeHint)}</p>}
          {!!rows.length && (
            <div className="card-base overflow-x-auto rounded-2xl max-sm:[mask-image:linear-gradient(to_right,#000_calc(100%_-_32px),transparent)]">
              <table className="w-full min-w-max border-collapse">
                <thead>
                  <tr className="bg-naru-surface-2">
                    <th className={`sticky left-0 z-10 bg-naru-surface-2 px-3 py-3 text-left ${META} font-semibold text-naru-muted`}>{t(c.time)}</th>
                    {mentors!.map((m) => (
                      <th key={m.id} className="min-w-[120px] border-l border-white/5 px-2 py-3 text-left align-bottom">
                        <span className={`block ${META} font-semibold text-white`}>{m.name}</span>
                        {m.field && <span className={`block ${META} font-normal text-naru-muted`}>{m.field}</span>}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r} className="h-[45px] border-t border-white/5">
                      <th scope="row" className={`sticky left-0 z-10 bg-naru-surface px-3 py-1 text-left ${META} font-normal tabular-nums text-naru-muted`}>{fmtKst(r)}</th>
                      {mentors!.map((m) => cell(m, r))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
        )}
      </div>
    </main>
  );
}

/** 한 줄 안내. 기본은 캡션 톤, accent는 블루 점과 옅은 블루 면(상태 안내). 주황은 쓰지 않습니다(2026-10-26 뉴트럴 UI). */
function Note({ children, tone = "muted" }: { children: React.ReactNode; tone?: "muted" | "accent" }) {
  return (
    <p className={`flex items-start gap-[10px] rounded-xl px-[14px] py-[10px] ${META} leading-relaxed ${tone === "accent" ? "card-tint text-white" : "card-sunken text-naru-text"}`}>
      <span aria-hidden className={`mt-[6px] h-[6px] w-[6px] shrink-0 rounded-full ${tone === "accent" ? "bg-accent" : "bg-naru-muted"}`} />
      <span>{children}</span>
    </p>
  );
}

/** 시간표 규칙 카드의 아이콘(2026-10-26). 선 두께 2, 20px. */
function RuleIcon({ name, size = 20 }: { name: string; size?: number }) {
  const p = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (name) {
    case "tap": return <svg {...p}><path d="M9 11V5a2 2 0 0 1 4 0v6" /><path d="M13 10a2 2 0 0 1 4 0v2" /><path d="M17 11a2 2 0 0 1 4 0v4a7 7 0 0 1-7 7h-1a7 7 0 0 1-5.6-2.8L4 15.5a2 2 0 0 1 3-2.6L9 15" /></svg>;
    case "clock": return <svg {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>;
    case "two": return <svg {...p}><rect x="3" y="4" width="18" height="6" rx="2" /><rect x="3" y="14" width="18" height="6" rx="2" /></svg>;
    case "lock": return <svg {...p}><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>;
    case "open": return <svg {...p}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /><path d="m9 15 2 2 4-4" /></svg>;
    case "today": return <svg {...p}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>;
    case "upload": return <svg {...p}><path d="M12 15V4" /><path d="m7 9 5-5 5 5" /><path d="M5 15v3a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3" /></svg>;
    case "image": return <svg {...p}><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="9" cy="10" r="2" /><path d="m21 16-5-5-9 9" /></svg>;
    case "check": return <svg {...p}><path d="m5 12.5 4.5 4.5L19 7.5" /></svg>;
    default: return <svg {...p}><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5M9 13h6M9 17h4" /></svg>;
  }
}

/** 사진은 긴 변 2000px JPEG로 줄여 올립니다. 브라우저가 못 여는 형식(HEIC 등)은 그대로. */
async function shrink(file: File): Promise<Blob> {
  if (!file.type.startsWith("image/") || file.type.includes("heic") || file.type.includes("heif")) return file;
  try {
    const bmp = await createImageBitmap(file);
    const k = Math.min(1, 2000 / Math.max(bmp.width, bmp.height));
    const cv = document.createElement("canvas");
    cv.width = Math.round(bmp.width * k); cv.height = Math.round(bmp.height * k);
    cv.getContext("2d")!.drawImage(bmp, 0, 0, cv.width, cv.height);
    const out = await new Promise<Blob | null>((res) => cv.toBlob(res, "image/jpeg", 0.85));
    return out && out.size < file.size ? out : file;
  } catch {
    return file;
  }
}

function Proofs({ team, day, phone }: { team: string; day: ProofDay; phone: boolean }) {
  const { t } = useLocale();
  const [proofs, setProofs] = useState<Proof[]>([]);
  const [state, setState] = useState<Record<ProofKind, "idle" | "uploading">>({ photo: "idle", pdf: "idle" });
  const [msg, setMsg] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!team) { setProofs([]); return; } // 팀을 고르기 전에는 잠겨 있습니다
    const r = await fetch(`/api/crossing/proofs?team=${encodeURIComponent(team)}`, { cache: "no-store" });
    if (r.ok) setProofs((await r.json()).proofs);
  }, [team]);
  useEffect(() => { void refresh(); }, [refresh]);

  // DECIDED 2026-10-26 (사용자: "업로드는 한번만 가능하도록 해, 그러니까 하루 끝나기 전에 신중한 업로드 부탁"):
  // 파일을 고르면 바로 올리지 않고 이름과 크기를 보여 주며 한 번 더 묻습니다("이 파일로 올리기"). 올린 뒤에는 고르기 버튼이 사라집니다.
  // 서버도 팀, 날, 종류마다 한 번만 받습니다(app/api/crossing/proofs, already).
  const [picked, setPicked] = useState<Partial<Record<ProofKind, { name: string; blob: Blob; type: string }>>>({});
  const tooBig = (kind: ProofKind) => t(c.proofTooBig).replace("{mb}", String(PROOF_MAX_BYTES[kind] / 1024 / 1024));
  const errOf = (e: unknown, kind: ProofKind) => (e === "too_big" ? tooBig(kind) : e === "already" ? t(c.proofAlready) : null);

  const choose = async (kind: ProofKind, file: File) => {
    setMsg(null);
    if (!PROOF_TYPES[kind].includes(file.type)) { setMsg(t(c.proofBadType)); return; }
    const blob = kind === "photo" ? await shrink(file) : file;
    if (blob.size > PROOF_MAX_BYTES[kind]) { setMsg(tooBig(kind)); return; }
    setPicked((p) => ({ ...p, [kind]: { name: file.name, blob, type: blob.type || file.type } }));
  };

  const upload = async (kind: ProofKind) => {
    const f = picked[kind];
    if (!f) return;
    setMsg(null);
    setState((s) => ({ ...s, [kind]: "uploading" }));
    try {
      const post = (body: object) => fetch("/api/crossing/proofs", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ team, ...body }) });
      const s = await post({ action: "sign", day, kind, contentType: f.type, size: f.blob.size });
      if (!s.ok) { setMsg(errOf((await s.json().catch(() => ({}))).error, kind)); throw new Error("sign"); }
      const { path, signedUrl } = await s.json();
      if (!(await fetch(signedUrl, { method: "PUT", headers: { "content-type": f.type }, body: f.blob })).ok) throw new Error("put");
      const cf = await post({ action: "confirm", path });
      if (!cf.ok) { setMsg(errOf((await cf.json().catch(() => ({}))).error, kind)); throw new Error("confirm"); }
      setPicked((p) => ({ ...p, [kind]: undefined }));
    } catch {
      setMsg((m) => m ?? t(c.errGeneric));
    }
    void refresh();
    setState((x) => ({ ...x, [kind]: "idle" }));
  };
  // 날이나 팀을 바꾸면 골라 둔 파일은 버립니다(다른 날 상자에 올라가지 않게).
  useEffect(() => { setPicked({}); setMsg(null); }, [day, team]);

  const [dragOver, setDragOver] = useState<ProofKind | null>(null);

  const slot = (kind: ProofKind) => {
    const latest = proofs.find((p) => p.day === day && p.kind === kind);
    const up = state[kind] === "uploading";
    const off = up || !team;
    const f = picked[kind];
    const mb = (n: number) => `${(n / 1024 / 1024).toFixed(1)}MB`;
    const limit = t(kind === "photo" ? c.proofLimitPhoto : c.proofLimitPdf).replace("{mb}", String(PROOF_MAX_BYTES[kind] / 1024 / 1024));
    const title = t(kind === "photo" ? c.proofPhoto : day === 1 ? c.proofPdfDay1 : day === 3 ? c.proofPdfDay3 : c.proofPdf);
    // 폰: 사진은 갤러리(accept image/*), PDF는 파일 앱. 노트북: 끌어다 놓기 또는 고르기(2026-10-26).
    const pickLabel = phone ? t(kind === "photo" ? c.proofPickPhotoPhone : c.proofPickPdfPhone) : t(c.proofPick);
    const input = (
      <input type="file" className="sr-only" disabled={off} accept={kind === "photo" ? "image/*" : "application/pdf,.pdf"}
        onChange={(e) => { const x = e.target.files?.[0]; e.target.value = ""; if (x) void choose(kind, x); }} />
    );
    const drop = {
      onDragOver: (e: React.DragEvent) => { if (off) return; e.preventDefault(); setDragOver(kind); },
      onDragLeave: () => setDragOver((k) => (k === kind ? null : k)),
      onDrop: (e: React.DragEvent) => { e.preventDefault(); setDragOver(null); if (off) return; const x = e.dataTransfer.files?.[0]; if (x) void choose(kind, x); },
    };
    return (
      <div key={kind} className="card-base flex flex-col gap-[14px] rounded-2xl p-[20px] sm:p-[24px]">
        <div className="flex items-start justify-between gap-[12px]">
          <h3 className={`${BODY} font-semibold leading-snug tracking-[-0.01em] text-white`}>{title}</h3>
          {latest
            ? <span className={`inline-flex shrink-0 items-center gap-[4px] rounded-full bg-accent/15 px-[10px] py-[3px] ${META} font-semibold text-accent`}><RuleIcon name="check" size={14} />{t(c.proofDoneChip)}</span>
            : <span className={`shrink-0 ${META} text-naru-muted`}>{t(c.proofNone)}</span>}
        </div>
        {kind === "pdf" && day !== 1 && <p className={`${META} leading-relaxed text-naru-muted`}>{t(day === 3 ? c.proofPdfHintDay3 : c.proofPdfHint)}</p>}
        {/* 2026-10-26: 낸 파일은 이 페이지에서 보이지 않습니다(사진 미리보기, 보기 링크 없음). 멘토 페이지에서만 열립니다. */}
        {latest ? (
          // DECIDED 2026-10-26 (사용자: "너무 상자가 비어있음"): 제출한 상자는 "제출 완료" 패널이 남은 자리를 채웁니다. 색은 블루(뉴트럴 UI의 강조 하나).
          <div className="card-tint flex flex-1 items-center gap-[14px] rounded-xl p-[16px] sm:p-[18px]">
            <span aria-hidden className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent/20 text-accent"><RuleIcon name="check" size={22} /></span>
            <span className="flex flex-col gap-[3px]">
              <span className={`${BODY} font-semibold text-white`}>{t(c.proofDone)}</span>
              <span className={`${META} tabular-nums text-naru-text`}>
                {dayDate(day).slice(5).replace("-", ".")} {fmtKst(latest.createdAt)}{latest.sizeBytes ? `, ${mb(latest.sizeBytes)}` : ""}
              </span>
              <span className={`${META} leading-relaxed text-naru-muted`}>{t(c.proofLocked)}</span>
            </span>
          </div>
        ) : f ? (
          // 고른 파일: 이름과 크기를 보여 주고 한 번 더 묻습니다(한 번만 제출, 2026-10-26).
          <div className="card-sunken flex flex-1 flex-col gap-[12px] rounded-xl p-[14px] sm:p-[16px]">
            <div className="flex items-center gap-[10px]">
              <span aria-hidden className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-naru-surface-2 text-naru-text"><RuleIcon name={kind === "photo" ? "image" : "doc"} size={18} /></span>
              <span className="min-w-0">
                <span className={`block truncate ${META} font-semibold text-white`}>{f.name}</span>
                <span className={`block ${META} tabular-nums text-naru-muted`}>{mb(f.blob.size)}</span>
              </span>
            </div>
            <div className="flex flex-wrap gap-[8px]">
              <button type="button" disabled={off} onClick={() => void upload(kind)} className={`${buttonClass("primary", "naru")} justify-center ${off ? "opacity-50" : ""}`}>
                {up ? t(c.proofUploading) : t(c.proofConfirm)}
              </button>
              <button type="button" disabled={up} onClick={() => setPicked((p) => ({ ...p, [kind]: undefined }))} className={`${buttonClass("secondary", "naru")} justify-center`}>
                {t(c.proofCancel)}
              </button>
            </div>
          </div>
        ) : phone ? (
          // 폰: 끌어다 놓기가 없으므로 큰 고르기 버튼 하나.
          <label aria-disabled={off} className={`card-sunken flex flex-1 cursor-pointer flex-col items-center justify-center gap-[8px] rounded-xl border border-dashed border-white/15 px-[16px] py-[22px] text-center transition-colors ${off ? "pointer-events-none opacity-50" : "active:bg-accent/10"}`}>
            <span aria-hidden className="text-accent"><RuleIcon name={kind === "photo" ? "image" : "upload"} size={24} /></span>
            <span className={`${BODY} font-semibold text-white`}>{pickLabel}</span>
            <span className={`${META} text-naru-muted`}>{limit}</span>
            {input}
          </label>
        ) : (
          // 노트북: 상자 전체가 끌어다 놓는 자리. 안의 버튼으로 고를 수도 있습니다.
          <div {...drop} className={`flex flex-1 flex-col items-center justify-center gap-[8px] rounded-xl border border-dashed px-[16px] py-[22px] text-center transition-colors duration-150 ${dragOver === kind ? "border-accent bg-accent/10" : "card-sunken border-white/15"} ${off ? "opacity-50" : ""}`}>
            <span aria-hidden className={dragOver === kind ? "text-accent" : "text-naru-muted"}><RuleIcon name="upload" size={24} /></span>
            <span className={`flex flex-wrap items-center justify-center gap-[8px] ${META} text-naru-text`}>
              {dragOver === kind ? t(c.proofDropActive) : (
                <>
                  {t(c.proofDrop)}
                  <label aria-disabled={off} className={`inline-flex min-h-[36px] cursor-pointer items-center rounded-full border border-white/15 bg-naru-surface-2 px-[14px] font-semibold text-white transition-colors hover:border-accent/50 hover:text-accent ${off ? "pointer-events-none" : ""}`}>
                    {pickLabel}{input}
                  </label>
                </>
              )}
            </span>
            <span className={`${META} text-naru-muted`}>{limit}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <section aria-labelledby="proof-h" className="flex flex-col gap-[16px]">
      <div className="flex flex-col gap-[8px]">
        <h2 id="proof-h" className={`${SUBTITLE} font-bold tracking-[-0.02em] text-white`}>{t(c.proofHeading)}</h2>
        <p className={`${BODY} leading-relaxed text-naru-muted`}>{t(day === 1 ? c.proofLeadDay1 : day === 3 ? c.proofLeadDay3 : c.proofLead)}</p>
      </div>
      <Note>{t(c.proofOnce)}</Note>
      {msg && <p role="alert" className={`${META} text-rose-300`}>{msg}</p>}
      <div className="grid gap-[16px] sm:grid-cols-2">{proofKindsFor(day).map((k) => slot(k))}</div>
    </section>
  );
}
