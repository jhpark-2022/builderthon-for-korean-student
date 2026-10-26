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
import { BODY, META } from "@/components/ui/typography";
import { buttonClass } from "@/components/ui/Button";
import LocaleToggle from "@/components/LocaleToggle";
import { teamCopy as c } from "@/data/crossingTeam";
import {
  BUFFER_MINUTES, GRID_MINUTES, bookingGate, kstTime, BOOKING_OPENS_DAY, BOOKING_OPENS_AT, MAX_BOOKINGS_PER_TEAM_PER_DAY, PROOF_DAYS, PROOF_MAX_BYTES, PROOF_TYPES, dayDate, fitsWindow, fmtKst, isProofDay, proofKindsFor, slotState, trackTint,
  type ProofDay, type ProofKind, type Track, type Window,
} from "@/lib/crossingOps";

const TEAM_KEY = "crossing-team";
// 2026-10-26 (사용자: "색깔이 좀 더 다채로우면 좋을거 같기는 함 for the teams"): 팀 칸의 트랙 색을 더 진하게.
// 그 전 22%(38) 한 겹. 이제 왼쪽 위 45%에서 오른쪽 아래 25%로(brand 10장 그라데이션 방향), 왼쪽 띠 4px. 색은 그대로 트랙 네 색입니다.
const SLOT_ALPHA = "73", SLOT_ALPHA_END = "40";
const MIN = 60_000;
type Bk = { id: string; team: string; track: string; startsAt: string; endsAt: string };
type Mentor = { id: string; name: string; field: string | null; windows: Window[]; bookings: Bk[] };
type Proof = { id: string; day: number; kind: ProofKind; createdAt: string; url: string | null };

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
        : e === "not_yet" ? c.errNotYet : e === "same_day_morning" ? c.errMorning : c.errGeneric));
    }
    setPending(null); setBusy(false); void refresh();
  };

  const cell = (m: Mentor, r: number) => {
    const inWin = m.windows.some((w) => Date.parse(w.startsAt) <= r && r < Date.parse(w.endsAt));
    if (!inWin) return <td key={m.id} className="border-l border-white/5 bg-black/20" />;
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
    const ok = !timetableLocked && !gated && !!picked && !full && free && slotState(r, m.bookings, mine) === "open";
    const asking = pending?.m === m.id && pending.r === r;
    const locked = (timetableLocked || gated || !picked) && free; // 팀을 고르면 열릴 칸: "+"를 흐리게 보여 줍니다
    return (
      <td key={m.id} className="border-l border-white/5 p-0">
        <button type="button" disabled={!ok || busy} aria-label={`${m.name} ${fmtKst(r)}`}
          // 바꿀 수 없으니 두 번 누릅니다: 처음은 "넣기?"로 묻고, 같은 칸을 한 번 더 누르면 넣습니다.
          onClick={() => (asking ? (setPending(null), call("POST", { team: picked, mentorId: m.id, startsAt: new Date(r).toISOString() })) : setPending({ m: m.id, r }))}
          // 묻는 칸은 우리 팀의 트랙 색으로 미리 칠합니다(넣으면 이 색이 됩니다).
          style={asking ? { background: `${myTint}${SLOT_ALPHA}`, borderColor: myTint } : undefined}
          className={`min-h-[44px] w-full rounded-md px-1 py-2 ${META} transition duration-150 ${asking ? "border font-bold text-white" : ok ? "border border-white/20 text-white/70 hover:bg-white/15" : locked ? "cursor-not-allowed border border-white/10 text-white/30" : "text-transparent"}`}>
          {asking ? t(c.confirmPut) : "+"}
        </button>
      </td>
    );
  };

  return (
    <main id="main" className="min-h-screen bg-[#070B1F] px-4 pb-24 pt-4 text-white">
      <div className="mx-auto flex max-w-5xl flex-col gap-[27px]">
        {/* 2026-10-23 (모바일 점검): /match와 같은 머리(돌아가기, EN/KR). 머리 없이 제목으로 시작해 두 페이지가 달랐습니다. */}
        <header className="flex min-h-[44px] items-center justify-between">
          <a href="/" className={`-my-3 inline-flex min-h-[44px] items-center py-3 ${BODY} font-semibold text-white/70 transition hover:text-white`}>← {t(c.back)}</a>
          <LocaleToggle />
        </header>
        <h1 className={`${BODY} font-bold`}>{t(c.title)}</h1>

        <div className="flex flex-col gap-[24px] rounded-2xl border border-white/10 bg-white/[0.04] p-[20px] sm:p-[32px]">
          <div className="flex flex-col gap-[24px] sm:flex-row sm:flex-wrap sm:items-end">
            <div className="flex flex-col gap-[8px]">
              <label htmlFor="team" className={`${META} font-bold text-white/85`}>{t(c.teamLabel)}</label>
              {/* 2026-10-17 (사용자: "화살표도 상자 밖으로 튀어나와 있는 느낌"): 브라우저 기본 화살표를 끄고 상자 안쪽에 그립니다. */}
              <div className="relative">
                <select id="team" value={teams.includes(team) ? team : ""} onChange={(e) => { setTeam(e.target.value); save(TEAM_KEY, e.target.value); }}
                  className={`min-h-[52px] w-full min-w-[10rem] appearance-none rounded-xl border border-white/45 bg-[#0d1230] py-3 pl-3 pr-10 ${BODY} text-white sm:w-auto`}>
                  <option value="">{t(c.teamPick)}</option>
                  {teams.map((x) => <option key={x} value={x}>{trackOf(teamTracks[x]) ? `${x} (${t(trackOf(teamTracks[x])!.label)})` : x}</option>)}
                </select>
                <svg aria-hidden width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/70"><path d="m6 9 6 6 6-6" /></svg>
              </div>
            </div>
            <div role="tablist" className="flex flex-wrap gap-[9px]">
              {PROOF_DAYS.map((d) => (
                <button key={d} role="tab" aria-selected={day === d} type="button" onClick={() => setDay(d)}
                  className={`min-h-[52px] rounded-full border px-4 py-3 ${BODY} font-bold transition duration-150 ${day === d ? "border-white/60 bg-white/15" : "border-white/15 text-white/70"}`}>
                  {t(c.dayTab)} {d} <span className={`${META} font-normal text-white/70`}>{dayDate(d).slice(5).replace("-", ".")}</span>
                </button>
              ))}
            </div>
          </div>
          {/* 2026-10-23 (모바일 점검): 노랑(amber)은 팔레트 밖이라 주황(brand 10장)으로. */}
          {!picked && <p className={`${META} font-bold text-naru-orange`}>{t(timetableLocked ? c.pickFirstDay1 : c.pickFirst)}</p>}
        </div>

        {/* DECIDED 2026-10-17 (사용자, 스크린숏: "인증 올리는 거를 테이블 위로"): 인증이 시간표보다 먼저 섭니다. */}
        <Proofs team={picked} day={day} />

        {msg && <p role="alert" className={`${META} text-rose-300`}>{msg}</p>}
        {/* DECIDED 2026-10-26 (사용자, 스크린숏: "1일차에는 멘토 시간표가 없어야함"): Day 1 탭에서는 시간표 절 전체(제목, 안내, 범례, 표)를 그리지 않습니다.
            그 전(2026-10-17): 잠긴 표와 주황 안내 "Day 1에는 멘토 시간표에 칸을 넣지 않습니다"를 보여 줬습니다. */}
        {timetableLocked && <p className={`${BODY} text-white/70`}>{t(c.day1BookHint)}</p>}
        {!timetableLocked && <>
        <h2 className={`mt-[18px] ${BODY} font-bold`}>{t(c.timetableHeading)}</h2>
        <p className={`${BODY} text-white/70`}>{t(c.lead)} {t(c.gateRule)} {t(c.carry)}</p>
        {notYet && <p className={`${META} font-bold text-naru-orange`}>{t(c.notYet)}</p>}
        {!notYet && today && <p className={`${META} font-bold text-naru-orange`}>{t(c.sameDay)}</p>}
        {tracks.length > 0 && (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            {tracks.map((x) => (
              <span key={x.id} className={`flex items-center gap-2 ${META} ${teamTracks[picked] === x.id ? "font-bold text-white" : "text-white/70"}`}>
                <span aria-hidden className="h-3 w-5 rounded-sm" style={{ background: `${trackTint(x.color)}${SLOT_ALPHA}`, boxShadow: `inset 4px 0 0 ${trackTint(x.color)}` }} />
                {t(x.label)}
              </span>
            ))}
            <span className={`${META} text-white/70`}>{t(c.trackLegend)}</span>
          </div>
        )}

        {mentors && !rows.length && <p className={`${BODY} text-white/70`}>{t(c.noMentors)}</p>}
        {/* 2026-10-23 (모바일 점검): 폰에서 시간표가 옆으로 굴러간다는 것을 잘린 글자로만 알 수 있었습니다. 오른쪽 끝 페이드와 한 줄 안내(sm 아래). */}
        {!!rows.length && <p className={`${META} text-white/70 sm:hidden`}>{t(c.swipeHint)}</p>}
        {!!rows.length && (
          <div className="overflow-x-auto rounded-2xl border border-white/15 max-sm:[mask-image:linear-gradient(to_right,#000_calc(100%_-_32px),transparent)]">
            <table className="w-full min-w-max border-collapse">
              <thead>
                <tr className="bg-white/[0.04]">
                  <th className={`sticky left-0 z-10 bg-[#0d1230] px-3 py-2 text-left ${META} text-white/70`}>{t(c.time)}</th>
                  {mentors!.map((m) => (
                    <th key={m.id} className="min-w-[120px] border-l border-white/10 px-2 py-2 text-left align-bottom">
                      <span className={`block ${META} font-bold text-white`}>{m.name}</span>
                      {m.field && <span className={`block ${META} font-normal text-white/70`}>{m.field}</span>}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r} className="h-[45px] border-t border-white/5">
                    <th scope="row" className={`sticky left-0 z-10 bg-[#0d1230] px-3 py-1 text-left ${META} font-normal tabular-nums text-white/70`}>{fmtKst(r)}</th>
                    {mentors!.map((m) => cell(m, r))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        </>}

      </div>
    </main>
  );
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

function Proofs({ team, day }: { team: string; day: ProofDay }) {
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

  const upload = async (kind: ProofKind, file: File) => {
    setMsg(null);
    if (!PROOF_TYPES[kind].includes(file.type)) { setMsg(t(c.proofBadType)); return; }
    setState((s) => ({ ...s, [kind]: "uploading" }));
    try {
      const blob = kind === "photo" ? await shrink(file) : file;
      if (blob.size > PROOF_MAX_BYTES) { setMsg(t(c.proofTooBig)); throw new Error("size"); }
      const type = blob.type || file.type;
      const post = (body: object) => fetch("/api/crossing/proofs", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ team, ...body }) });
      const s = await post({ action: "sign", day, kind, contentType: type, size: blob.size });
      if (!s.ok) throw new Error("sign");
      const { path, signedUrl } = await s.json();
      if (!(await fetch(signedUrl, { method: "PUT", headers: { "content-type": type }, body: blob })).ok) throw new Error("put");
      if (!(await post({ action: "confirm", path })).ok) throw new Error("confirm");
      void refresh();
    } catch {
      setMsg((m) => m ?? t(c.errGeneric));
    }
    setState((x) => ({ ...x, [kind]: "idle" }));
  };

  const slot = (kind: ProofKind) => {
    const latest = proofs.find((p) => p.day === day && p.kind === kind);
    const up = state[kind] === "uploading";
    const off = up || !team;
    return (
      <div key={kind} className="flex flex-col gap-[13.5px] rounded-2xl border border-white/15 bg-white/[0.03] p-[20px] sm:p-[24px]">
        <div className="flex flex-col gap-[13.5px] sm:flex-row sm:items-baseline sm:justify-between">
          <h3 className={`${BODY} font-bold`}>{t(kind === "photo" ? c.proofPhoto : day === 1 ? c.proofPdfDay1 : c.proofPdf)}</h3>
          <span className={`${META} ${latest ? "text-naru-orange" : "text-white/70"}`}>{latest ? `★ ${t(c.proofDone)} ${fmtKst(latest.createdAt)}` : t(c.proofNone)}</span>
        </div>
        {latest?.url && kind === "photo" && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={latest.url} alt="" className="max-h-56 w-fit rounded-xl object-contain" />
        )}
        {latest?.url && kind === "pdf" && <a href={latest.url} target="_blank" rel="noreferrer" className={buttonClass("text")}>{t(c.proofView)}</a>}
        <label aria-disabled={off} className={`${buttonClass("secondary", "naru")} w-full cursor-pointer justify-center sm:w-fit ${off ? "pointer-events-none opacity-50" : ""}`}>
          {up ? t(c.proofUploading) : t(latest ? c.proofReplace : c.proofPick)}
          <input type="file" className="sr-only" disabled={off} accept={kind === "photo" ? "image/*" : "application/pdf"}
            onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; if (f) void upload(kind, f); }} />
        </label>
      </div>
    );
  };

  return (
    <section aria-labelledby="proof-h" className="flex flex-col gap-[24px]">
      <div className="flex flex-col gap-[18px]">
        <h2 id="proof-h" className={`${BODY} font-bold`}>{t(c.proofHeading)}</h2>
        <p className={`${BODY} text-white/70`}>{t(day === 1 ? c.proofLeadDay1 : c.proofLead)}</p>
        {msg && <p role="alert" className={`${META} text-rose-300`}>{msg}</p>}
      </div>
      <div className="grid gap-[18px] sm:grid-cols-2">{proofKindsFor(day).map((k) => slot(k))}</div>
    </section>
  );
}
