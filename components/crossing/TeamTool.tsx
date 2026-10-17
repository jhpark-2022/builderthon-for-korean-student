"use client";

// ─────────────────────────────────────────────────────────────────────────────
// /crossing/team. 모든 팀이 같이 보는 멘토 시간표와 Day 2, Day 3 미션 인증(2026-10-17).
//
// DECIDED 2026-10-17 (사용자: "너무 뭐가 많은데? 그냥 timetable where team can put in their available, 다른 팀과 공유"):
// wejoinin처럼 표 하나입니다. 줄은 15분, 칸은 멘토. 팀을 고르고 빈 칸을 누르면 그 팀 이름이 30분 들어가고,
// 앞뒤 15분은 "쉬는 15분"으로 막힙니다(규칙의 정본은 DB 제약, lib/crossingOps.ts). 팀 코드는 없습니다.
// 고른 팀은 이 기기의 localStorage에만 둡니다. 폰에서 표가 넓으면 표만 옆으로 밉니다(페이지는 밀리지 않음).
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocale } from "@/lib/LocaleContext";
import { BODY, META } from "@/components/ui/typography";
import { buttonClass } from "@/components/ui/Button";
import { teamCopy as c } from "@/data/crossingTeam";
import {
  BUFFER_MINUTES, GRID_MINUTES, OPS_DAYS, PROOF_MAX_BYTES, PROOF_TYPES, dayDate, fitsWindow, fmtKst, slotState,
  type OpsDay, type ProofKind, type Window,
} from "@/lib/crossingOps";

const TEAM_KEY = "crossing-team";
const MIN = 60_000;
type Bk = { id: string; team: string; startsAt: string; endsAt: string };
type Mentor = { id: string; name: string; field: string | null; windows: Window[]; bookings: Bk[] };
type Proof = { id: string; day: number; kind: ProofKind; createdAt: string; url: string | null };

const load = (k: string) => { try { return localStorage.getItem(k) ?? ""; } catch { return ""; } };
const save = (k: string, v: string) => { try { localStorage.setItem(k, v); } catch { /* 저장 못 해도 화면은 돕니다 */ } };

export default function TeamTool() {
  const { t } = useLocale();
  const [day, setDay] = useState<OpsDay>(2);
  const [teams, setTeams] = useState<string[]>([]);
  const [mentors, setMentors] = useState<Mentor[] | null>(null);
  const [team, setTeam] = useState(""); // 팀 이름. 따로 만드는 ID는 없습니다
  const [open, setOpen] = useState<string | null>(null); // 우리 팀 칸을 누르면 "비우기"가 섭니다
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => { setTeam(load(TEAM_KEY)); }, []);

  const refresh = useCallback(async () => {
    const r = await fetch(`/api/crossing/mentoring?day=${day}`, { cache: "no-store" });
    if (!r.ok) { setMsg(t(c.errGeneric)); return; }
    const j = await r.json();
    setTeams(j.teams ?? []); setMentors(j.mentors ?? []);
  }, [day]);
  useEffect(() => { setMentors(null); setMsg(null); setOpen(null); void refresh(); }, [refresh]);
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

  const mine = (mentors ?? []).flatMap((m) => m.bookings.filter((b) => b.team === team));

  const call = async (method: "POST" | "DELETE", body: object) => {
    setBusy(true); setMsg(null);
    const r = await fetch("/api/crossing/mentoring", { method, headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    if (!r.ok) {
      const e = (await r.json().catch(() => ({}))).error;
      setMsg(t(e === "taken" ? c.errTaken : e === "team_busy" ? c.errTeamBusy : e === "past" ? c.errPast : c.errGeneric));
    }
    setOpen(null); setBusy(false); void refresh();
  };

  const cell = (m: Mentor, r: number) => {
    const inWin = m.windows.some((w) => Date.parse(w.startsAt) <= r && r < Date.parse(w.endsAt));
    if (!inWin) return <td key={m.id} className="border-l border-white/5 bg-black/20" />;
    const b = m.bookings.find((x) => Date.parse(x.startsAt) <= r && r < Date.parse(x.endsAt));
    if (b) {
      const first = Date.parse(b.startsAt) === r;
      const ours = b.team === team;
      return (
        <td key={m.id} className={`border-l border-white/5 px-1 ${ours ? "bg-amber-400/20" : "bg-white/[0.08]"}`}>
          {first && (ours ? (
            <div className="flex items-center justify-between gap-2">
              <button type="button" aria-expanded={open === b.id} onClick={() => setOpen(open === b.id ? null : b.id)} className={`min-w-0 flex-1 truncate px-1 py-1.5 text-left ${META} font-bold text-amber-50`}>{b.team}</button>
              {open === b.id && <button type="button" disabled={busy} onClick={() => call("DELETE", { bookingId: b.id })} className={`shrink-0 rounded-full border border-amber-200/50 px-2 ${META} text-amber-50`}>{t(c.clear)}</button>}
            </div>
          ) : <span className={`block truncate px-1 py-1.5 ${META} font-bold text-white/85`}>{b.team}</span>)}
        </td>
      );
    }
    const gap = m.bookings.some((x) => {
      const s = Date.parse(x.startsAt), e = Date.parse(x.endsAt);
      return (r >= s - BUFFER_MINUTES * MIN && r < s) || (r >= e && r < e + BUFFER_MINUTES * MIN);
    });
    if (gap) return <td key={m.id} className={`border-l border-white/5 bg-[repeating-linear-gradient(45deg,rgba(255,255,255,0.06)_0_4px,transparent_4px_8px)] px-2 ${META} text-white/60`}>{t(c.gap)}</td>;
    const ok = !!team && fitsWindow(r, m.windows) && slotState(r, m.bookings, mine) === "open";
    return (
      <td key={m.id} className="border-l border-white/5 p-0.5">
        <button type="button" disabled={!ok || busy} aria-label={`${m.name} ${fmtKst(r)}`}
          onClick={() => call("POST", { team, mentorId: m.id, startsAt: new Date(r).toISOString() })}
          className={`h-8 w-full rounded-md ${META} transition ${ok ? "border border-white/20 text-white/70 hover:bg-white/15" : "text-transparent"}`}>
          +
        </button>
      </td>
    );
  };

  return (
    <main id="main" className="min-h-screen bg-[#070B1F] px-4 pb-24 pt-10 text-white">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <h1 className={`${BODY} font-bold`}>{t(c.title)}</h1>

        <div className="flex flex-wrap items-center gap-3">
          <label htmlFor="team" className={`${META} font-bold text-white/85`}>{t(c.teamLabel)}</label>
          <select id="team" value={teams.includes(team) ? team : ""} onChange={(e) => { setTeam(e.target.value); save(TEAM_KEY, e.target.value); }}
            className={`rounded-lg border border-white/20 bg-[#0d1230] px-3 py-2 ${BODY} text-white`}>
            <option value="">{t(c.teamPick)}</option>
            {teams.map((x) => <option key={x} value={x}>{x}</option>)}
          </select>
          <div role="tablist" className="flex gap-2">
            {OPS_DAYS.map((d) => (
              <button key={d} role="tab" aria-selected={day === d} type="button" onClick={() => setDay(d)}
                className={`rounded-full border px-4 py-2 ${BODY} font-bold ${day === d ? "border-white/60 bg-white/15" : "border-white/15 text-white/70"}`}>
                {t(c.dayTab)} {d} <span className={`${META} font-normal text-white/70`}>{dayDate(d).slice(5).replace("-", ".")}</span>
              </button>
            ))}
          </div>
        </div>

        {/* DECIDED 2026-10-17 (사용자, 스크린숏: "인증 올리는 거를 테이블 위로"): 인증이 시간표보다 먼저 섭니다. */}
        {team && teams.includes(team) && <Proofs team={team} day={day} />}

        <h2 className={`mt-4 ${BODY} font-bold`}>{t(c.timetableHeading)}</h2>
        <p className={`${BODY} text-white/85`}>{t(c.lead)} {t(c.carry)}</p>
        {msg && <p role="alert" className={`${META} text-rose-300`}>{msg}</p>}

        {mentors && !rows.length && <p className={`${BODY} text-white/70`}>{t(c.noMentors)}</p>}
        {!!rows.length && (
          <div className="overflow-x-auto rounded-2xl border border-white/15">
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
                  <tr key={r} className="h-10 border-t border-white/5">
                    <th scope="row" className={`sticky left-0 z-10 bg-[#0d1230] px-3 py-1 text-left ${META} font-normal tabular-nums text-white/70`}>{fmtKst(r)}</th>
                    {mentors!.map((m) => cell(m, r))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

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

function Proofs({ team, day }: { team: string; day: OpsDay }) {
  const { t } = useLocale();
  const [proofs, setProofs] = useState<Proof[]>([]);
  const [state, setState] = useState<Record<ProofKind, "idle" | "uploading">>({ photo: "idle", pdf: "idle" });
  const [msg, setMsg] = useState<string | null>(null);

  const refresh = useCallback(async () => {
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
    return (
      <div key={kind} className="flex flex-col gap-3 rounded-2xl border border-white/15 bg-white/[0.03] p-4">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className={`${BODY} font-bold`}>{t(kind === "photo" ? c.proofPhoto : c.proofPdf)}</h3>
          <span className={`${META} ${latest ? "text-amber-100" : "text-white/70"}`}>{latest ? `★ ${t(c.proofDone)} ${fmtKst(latest.createdAt)}` : t(c.proofNone)}</span>
        </div>
        {latest?.url && kind === "photo" && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={latest.url} alt="" className="max-h-56 w-fit rounded-xl object-contain" />
        )}
        {latest?.url && kind === "pdf" && <a href={latest.url} target="_blank" rel="noreferrer" className={buttonClass("text")}>{t(c.proofView)}</a>}
        <label className={`${buttonClass("secondary")} w-fit cursor-pointer justify-center ${up ? "pointer-events-none opacity-50" : ""}`}>
          {up ? t(c.proofUploading) : t(latest ? c.proofReplace : c.proofPick)}
          <input type="file" className="sr-only" disabled={up} accept={kind === "photo" ? "image/*" : "application/pdf"}
            onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; if (f) void upload(kind, f); }} />
        </label>
      </div>
    );
  };

  return (
    <section aria-labelledby="proof-h" className="flex flex-col gap-4">
      <h2 id="proof-h" className={`${BODY} font-bold`}>{t(c.proofHeading)}</h2>
      <p className={`${BODY} text-white/85`}>{t(c.proofLead)}</p>
      {msg && <p role="alert" className={`${META} text-rose-300`}>{msg}</p>}
      <div className="grid gap-4 sm:grid-cols-2">{slot("photo")}{slot("pdf")}</div>
    </section>
  );
}
