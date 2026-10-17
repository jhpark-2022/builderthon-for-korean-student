"use client";

// ─────────────────────────────────────────────────────────────────────────────
// /crossing/team. 팀 코드로 들어와 멘토를 예약하고 Day 2, Day 3 미션 인증 파일을 올립니다(2026-10-17).
//
// 예약 칸: 멘토마다 시작 시각을 알약으로 늘어놓습니다. 폰에서 멘토 × 시각 격자는 옆으로 밀려 나가서,
// 멘토 카드 하나에 그날의 시각 줄 하나로 그립니다. 다른 팀의 예약과 그 앞뒤 15분은 눌리지 않습니다
// (lib/crossingOps.ts slotState, 규칙의 정본은 DB 제약). 팀 코드는 이 기기의 localStorage에만 둡니다.
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useState } from "react";
import { useLocale } from "@/lib/LocaleContext";
import { BODY, META, TITLE } from "@/components/ui/typography";
import { buttonClass } from "@/components/ui/Button";
import { teamCopy as c } from "@/data/crossingTeam";
import {
  OPS_DAYS, PROOF_MAX_BYTES, PROOF_TYPES, SESSION_MINUTES, dayDate, fmtKst, isTeamCode, normalizeTeamCode, slotStarts, slotState,
  type Booking, type OpsDay, type ProofKind, type SlotState, type Window,
} from "@/lib/crossingOps";

const CODE_KEY = "crossing-team-code";
type Mentor = { id: string; name: string; field: string | null; windows: Window[]; bookings: (Booking & { id?: string })[] };
type Proof = { id: string; day: number; kind: ProofKind; createdAt: string; url: string | null };

const readCode = () => { try { return localStorage.getItem(CODE_KEY) ?? ""; } catch { return ""; } };
const writeCode = (v: string | null) => { try { if (v) localStorage.setItem(CODE_KEY, v); else localStorage.removeItem(CODE_KEY); } catch { /* 저장 못 해도 이 화면은 돕니다 */ } };

const PILL: Record<SlotState, string> = {
  open: "border-white/25 bg-white/[0.06] text-white hover:bg-white/15",
  mine: "border-amber-300/70 bg-amber-400/20 font-bold text-amber-50",
  booked: "border-white/10 bg-white/[0.02] text-white/40 line-through",
  buffer: "border-dashed border-white/15 text-white/40",
  past: "border-white/10 text-white/30",
  teamBusy: "border-white/10 text-white/40",
};

export default function TeamTool() {
  const { t } = useLocale();
  const [code, setCode] = useState("");
  const [team, setTeam] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [day, setDay] = useState<OpsDay>(2);

  const enter = useCallback(async (raw: string) => {
    const v = normalizeTeamCode(raw);
    if (!isTeamCode(v)) { setErr(t(c.codeUnknown)); return; }
    const r = await fetch("/api/crossing/team", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ code: v }) });
    if (!r.ok) { setErr(t(r.status === 404 ? c.codeUnknown : c.errGeneric)); writeCode(null); return; }
    const j = await r.json();
    setErr(null); setCode(v); setTeam(j.team.name); writeCode(v);
  }, [t]);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("code");
    const saved = q || readCode();
    if (saved) { setInput(saved); void enter(saved); }
    // 처음 한 번만
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!team) {
    return (
      <main id="main" className="min-h-screen bg-[#070B1F] px-4 py-16 text-white">
        <form className="mx-auto flex max-w-sm flex-col gap-4" onSubmit={(e) => { e.preventDefault(); void enter(input); }}>
          <h1 className={`${BODY} font-bold`}>{t(c.title)}</h1>
          <label htmlFor="team-code" className={`${META} font-bold text-white/85`}>{t(c.codeLabel)}</label>
          <input
            id="team-code" value={input} onChange={(e) => setInput(normalizeTeamCode(e.target.value))}
            autoCapitalize="characters" autoComplete="off" spellCheck={false} inputMode="text" maxLength={6}
            className={`rounded-xl border border-white/20 bg-white/[0.04] px-4 py-3 ${BODY} tracking-[0.3em] text-white outline-none focus:border-white/50`}
            aria-describedby="team-code-help"
          />
          <p id="team-code-help" className={`${META} text-white/70`}>{t(c.codeHelp)}</p>
          {err && <p role="alert" className={`${META} text-rose-300`}>{err}</p>}
          <button type="submit" className={`${buttonClass("primary")} justify-center`}>{t(c.codeSubmit)}</button>
        </form>
      </main>
    );
  }

  return (
    <main id="main" className="min-h-screen bg-[#070B1F] px-4 pb-24 pt-10 text-white">
      <div className="mx-auto flex max-w-3xl flex-col gap-10">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className={`${META} font-bold text-white/70`}>{t(c.title)}</p>
            <h1 className={`${TITLE} font-bold leading-tight`}>{team}</h1>
          </div>
          <button type="button" className={buttonClass("text")} onClick={() => { writeCode(null); setTeam(null); setCode(""); setInput(""); }}>{t(c.changeTeam)}</button>
        </header>

        <div role="tablist" className="flex gap-2">
          {OPS_DAYS.map((d) => (
            <button key={d} role="tab" aria-selected={day === d} type="button" onClick={() => setDay(d)}
              className={`rounded-full border px-4 py-2 ${BODY} font-bold ${day === d ? "border-white/60 bg-white/15" : "border-white/15 text-white/70"}`}>
              {t(c.dayTab)} {d} <span className={`${META} font-normal text-white/70`}>{dayDate(d).slice(5).replace("-", ".")}</span>
            </button>
          ))}
        </div>

        <MentorBooking code={code} day={day} />
        <Proofs code={code} day={day} />
      </div>
    </main>
  );
}

function MentorBooking({ code, day }: { code: string; day: OpsDay }) {
  const { t } = useLocale();
  const [mentors, setMentors] = useState<Mentor[] | null>(null);
  const [pick, setPick] = useState<{ mentorId: string; t: number; bookingId?: string } | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const r = await fetch(`/api/crossing/mentoring?day=${day}`, { headers: { "x-team-code": code }, cache: "no-store" });
    if (r.ok) setMentors((await r.json()).mentors);
  }, [code, day]);
  useEffect(() => { setMentors(null); setPick(null); setMsg(null); void load(); }, [load]);
  // 다른 팀의 예약이 화면에 들어오도록 30초마다 다시 읽습니다.
  useEffect(() => { const id = setInterval(load, 30_000); return () => clearInterval(id); }, [load]);

  const teamBookings = (mentors ?? []).flatMap((m) => m.bookings.filter((b) => b.mine));

  const act = async () => {
    if (!pick) return;
    setBusy(true); setMsg(null);
    const r = pick.bookingId
      ? await fetch("/api/crossing/mentoring", { method: "DELETE", headers: { "content-type": "application/json", "x-team-code": code }, body: JSON.stringify({ bookingId: pick.bookingId }) })
      : await fetch("/api/crossing/mentoring", { method: "POST", headers: { "content-type": "application/json", "x-team-code": code }, body: JSON.stringify({ mentorId: pick.mentorId, startsAt: new Date(pick.t).toISOString() }) });
    if (!r.ok) {
      const e = (await r.json().catch(() => ({}))).error;
      setMsg(t(e === "taken" ? c.errTaken : e === "team_busy" ? c.errTeamBusy : e === "team_limit" ? c.errLimit : e === "past" ? c.errPast : c.errGeneric));
    }
    setPick(null); setBusy(false); void load();
  };

  return (
    <section aria-labelledby="booking-h" className="flex flex-col gap-4">
      <h2 id="booking-h" className={`${BODY} font-bold`}>{t(c.bookingHeading)}</h2>
      <p className={`${BODY} text-white/85`}>{t(c.bookingLead)} {t(c.carry)}</p>
      <ul className={`flex flex-wrap gap-x-4 gap-y-1 ${META} text-white/70`}>
        {(["open", "mine", "booked", "buffer"] as const).map((s) => (
          <li key={s} className="flex items-center gap-1.5">
            <span aria-hidden className={`inline-block h-3 w-5 rounded-full border ${PILL[s]}`} />
            {t(s === "open" ? c.legendOpen : s === "mine" ? c.legendMine : s === "booked" ? c.legendBooked : c.legendBuffer)}
          </li>
        ))}
      </ul>
      {msg && <p role="alert" className={`${META} text-rose-300`}>{msg}</p>}
      {mentors && mentors.every((m) => m.windows.length === 0) && <p className={`${BODY} text-white/70`}>{t(c.noMentors)}</p>}
      {(mentors ?? []).filter((m) => m.windows.length).map((m) => (
        <article key={m.id} className="rounded-2xl border border-white/15 bg-white/[0.03] p-4">
          <h3 className={`${BODY} font-bold`}>{m.name}</h3>
          {m.field && <p className={`${META} text-white/70`}>{m.field}</p>}
          <div className="mt-3 flex flex-wrap gap-2">
            {slotStarts(m.windows).map((ts) => {
              const st = slotState(ts, m.bookings, teamBookings);
              const mine = m.bookings.find((b) => b.mine && Date.parse(b.startsAt) === ts);
              const clickable = st === "open" || st === "mine";
              const picked = pick?.mentorId === m.id && pick.t === ts;
              return (
                <button key={ts} type="button" disabled={!clickable || busy}
                  aria-pressed={picked}
                  onClick={() => setPick(picked ? null : { mentorId: m.id, t: ts, bookingId: mine?.id })}
                  className={`min-h-[40px] rounded-full border px-3 ${META} tabular-nums transition ${PILL[st]} ${picked ? "ring-2 ring-white/80" : ""} disabled:cursor-not-allowed`}>
                  {fmtKst(ts)}
                </button>
              );
            })}
          </div>
          {pick?.mentorId === m.id && (
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <span className={`${BODY} tabular-nums`}>{fmtKst(pick.t)}~{fmtKst(pick.t + SESSION_MINUTES * 60_000)}</span>
              <button type="button" disabled={busy} onClick={act} className={buttonClass("secondary")}>{t(pick.bookingId ? c.cancelBook : c.confirmBook)}</button>
              <button type="button" onClick={() => setPick(null)} className={buttonClass("text")}>{t(c.keep)}</button>
            </div>
          )}
        </article>
      ))}
    </section>
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

function Proofs({ code, day }: { code: string; day: OpsDay }) {
  const { t } = useLocale();
  const [proofs, setProofs] = useState<Proof[]>([]);
  const [state, setState] = useState<Record<ProofKind, "idle" | "uploading" | "error">>({ photo: "idle", pdf: "idle" });
  const [msg, setMsg] = useState<string | null>(null);
  const [consent, setConsent] = useState(false);

  const load = useCallback(async () => {
    const r = await fetch("/api/crossing/proofs", { headers: { "x-team-code": code }, cache: "no-store" });
    if (r.ok) setProofs((await r.json()).proofs);
  }, [code]);
  useEffect(() => { void load(); }, [load]);
  useEffect(() => { setMsg(null); setConsent(false); }, [day]);

  const upload = async (kind: ProofKind, file: File) => {
    setMsg(null);
    if (!PROOF_TYPES[kind].includes(file.type)) { setMsg(t(c.proofBadType)); return; }
    setState((s) => ({ ...s, [kind]: "uploading" }));
    try {
      const blob = kind === "photo" ? await shrink(file) : file;
      if (blob.size > PROOF_MAX_BYTES) { setMsg(t(c.proofTooBig)); throw new Error("size"); }
      const type = blob.type || file.type;
      const post = (body: object) => fetch("/api/crossing/proofs", { method: "POST", headers: { "content-type": "application/json", "x-team-code": code }, body: JSON.stringify(body) });
      const s = await post({ action: "sign", day, kind, contentType: type, size: blob.size });
      if (!s.ok) throw new Error("sign");
      const { path, signedUrl } = await s.json();
      const up = await fetch(signedUrl, { method: "PUT", headers: { "content-type": type }, body: blob });
      if (!up.ok) throw new Error("put");
      const cf = await post({ action: "confirm", path });
      if (!cf.ok) throw new Error("confirm");
      setState((x) => ({ ...x, [kind]: "idle" }));
      void load();
    } catch {
      setState((x) => ({ ...x, [kind]: "error" }));
      setMsg((m) => m ?? t(c.errGeneric));
    }
  };

  const slot = (kind: ProofKind) => {
    const latest = proofs.find((p) => p.day === day && p.kind === kind);
    const disabled = state[kind] === "uploading" || (kind === "photo" && !consent);
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
        {kind === "photo" && (
          <label className={`flex items-start gap-2 ${META} leading-relaxed text-white/85`}>
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 h-5 w-5 shrink-0 accent-accent" />
            {t(c.photoConsent)}
          </label>
        )}
        <label className={`${buttonClass("secondary")} w-fit cursor-pointer justify-center ${disabled ? "pointer-events-none opacity-50" : ""}`}>
          {state[kind] === "uploading" ? t(c.proofUploading) : t(latest ? c.proofReplace : c.proofPick)}
          <input type="file" className="sr-only" disabled={disabled}
            accept={kind === "photo" ? "image/*" : "application/pdf"}
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
