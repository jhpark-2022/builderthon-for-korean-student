"use client";

// ─────────────────────────────────────────────────────────────────────────────
// /crossing/staff. 운영진 화면(2026-10-17). 한국어만 씁니다(운영진 도구).
//   팀: 만들기(코드 자동), 코드 보기
//   멘토: 만들기, 받는 시간(Day, 시작, 끝) 넣기와 빼기, 끄기
//   예약: 날마다 멘토별 목록, 운영진이 지우기
//   미션: 팀 × 날 표. 사진과 PDF가 왔는지, 현장 출석과 인정 체크(Day 4는 클로징 때 체크)
// 키는 이 탭의 sessionStorage에만 둡니다.
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useState } from "react";
import { BODY, META } from "@/components/ui/typography";
import { buttonClass } from "@/components/ui/Button";
import { OPS_DAYS, fmtKst } from "@/lib/crossingOps";

type Team = { id: string; name: string; code: string };
type Mentor = { id: string; name: string; field: string | null; active: boolean };
type Win = { id: string; mentor_id: string; day: number; starts_at: string; ends_at: string };
type Bk = { id: string; mentor_id: string; team_id: string; day: number; starts_at: string; ends_at: string };
type Proof = { id: string; teamId: string; day: number; kind: "photo" | "pdf"; createdAt: string; url: string | null };
type Check = { team_id: string; day: number; on_site: boolean; completed: boolean };
type Data = { teams: Team[]; mentors: Mentor[]; windows: Win[]; bookings: Bk[]; proofs: Proof[]; checks: Check[] };

const KEY = "crossing-staff-key";
const FIELD = `rounded-lg border border-white/20 bg-white/[0.04] px-3 py-2 ${BODY} text-white outline-none focus:border-white/50`;
const BOX = "rounded-2xl border border-white/15 bg-white/[0.03] p-4";

export default function StaffTool() {
  const [key, setKey] = useState("");
  const [input, setInput] = useState("");
  const [data, setData] = useState<Data | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async (k: string) => {
    const r = await fetch("/api/crossing/staff", { headers: { "x-staff-key": k }, cache: "no-store" });
    if (!r.ok) { setErr(r.status === 401 ? "키가 맞지 않습니다." : r.status === 503 ? "서버에 운영진 키가 설정되지 않았습니다." : "읽지 못했습니다."); return false; }
    setErr(null); setData(await r.json()); return true;
  }, []);

  useEffect(() => {
    let k = "";
    try { k = sessionStorage.getItem(KEY) ?? ""; } catch { /* 없음 */ }
    if (k) void load(k).then((ok) => ok && setKey(k));
  }, [load]);

  const post = async (body: object) => {
    const r = await fetch("/api/crossing/staff", { method: "POST", headers: { "content-type": "application/json", "x-staff-key": key }, body: JSON.stringify(body) });
    if (!r.ok) setErr("저장하지 못했습니다.");
    await load(key);
  };

  if (!key || !data) {
    return (
      <main id="main" className="min-h-screen bg-[#070B1F] px-4 py-16 text-white">
        <form className="mx-auto flex max-w-sm flex-col gap-3" onSubmit={async (e) => {
          e.preventDefault();
          if (await load(input)) { setKey(input); try { sessionStorage.setItem(KEY, input); } catch { /* */ } }
        }}>
          <h1 className={`${BODY} font-bold`}>크로싱 서울 운영진</h1>
          <label htmlFor="staff-key" className={`${META} text-white/85`}>운영진 키</label>
          <input id="staff-key" type="password" value={input} onChange={(e) => setInput(e.target.value)} className={FIELD} autoComplete="off" />
          {err && <p role="alert" className={`${META} text-rose-300`}>{err}</p>}
          <button className={`${buttonClass("primary")} justify-center`}>들어가기</button>
        </form>
      </main>
    );
  }

  const teamName = (id: string) => data.teams.find((t) => t.id === id)?.name ?? "?";

  return (
    <main id="main" className="min-h-screen bg-[#070B1F] px-4 pb-24 pt-10 text-white">
      <div className="mx-auto flex max-w-5xl flex-col gap-10">
        <header className="flex items-center justify-between">
          <h1 className={`${BODY} font-bold`}>크로싱 서울 운영진</h1>
          <button type="button" className={buttonClass("text")} onClick={() => load(key)}>새로고침</button>
        </header>
        {err && <p role="alert" className={`${META} text-rose-300`}>{err}</p>}

        <Teams teams={data.teams} onCreate={(name) => post({ action: "createTeam", name })} />
        <Mentors data={data} post={post} />
        <Bookings data={data} teamName={teamName} post={post} />
        <Missions data={data} post={post} />
      </div>
    </main>
  );
}

function Teams({ teams, onCreate }: { teams: Team[]; onCreate: (name: string) => void }) {
  const [name, setName] = useState("");
  return (
    <section className="flex flex-col gap-3">
      <h2 className={`${BODY} font-bold`}>팀 ({teams.length})</h2>
      <form className="flex flex-wrap gap-2" onSubmit={(e) => { e.preventDefault(); if (name.trim()) { onCreate(name.trim()); setName(""); } }}>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="팀 이름" maxLength={40} className={FIELD} />
        <button className={buttonClass("secondary")}>팀 만들기</button>
      </form>
      <ul className={`grid gap-2 sm:grid-cols-3 ${BODY}`}>
        {teams.map((t) => (
          <li key={t.id} className={`${BOX} flex items-center justify-between gap-2`}>
            <span className="font-bold">{t.name}</span>
            <code className="tracking-[0.2em] text-amber-100">{t.code}</code>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Mentors({ data, post }: { data: Data; post: (b: object) => Promise<void> }) {
  const [name, setName] = useState("");
  const [field, setField] = useState("");
  return (
    <section className="flex flex-col gap-3">
      <h2 className={`${BODY} font-bold`}>멘토와 받는 시간</h2>
      <form className="flex flex-wrap gap-2" onSubmit={(e) => { e.preventDefault(); if (name.trim()) { void post({ action: "createMentor", name, field }); setName(""); setField(""); } }}>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="멘토 이름" maxLength={40} className={FIELD} />
        <input value={field} onChange={(e) => setField(e.target.value)} placeholder="분야, 소속 (선택)" maxLength={80} className={FIELD} />
        <button className={buttonClass("secondary")}>멘토 추가</button>
      </form>
      <div className="grid gap-3 sm:grid-cols-2">
        {data.mentors.map((m) => <MentorCard key={m.id} m={m} windows={data.windows.filter((w) => w.mentor_id === m.id)} post={post} />)}
      </div>
    </section>
  );
}

function MentorCard({ m, windows, post }: { m: Mentor; windows: Win[]; post: (b: object) => Promise<void> }) {
  const [day, setDay] = useState("2");
  const [start, setStart] = useState("14:00");
  const [end, setEnd] = useState("17:00");
  return (
    <div className={`${BOX} flex flex-col gap-2 ${m.active ? "" : "opacity-50"}`}>
      <div className="flex items-baseline justify-between gap-2">
        <span className={`${BODY} font-bold`}>{m.name} <span className={`${META} font-normal text-white/70`}>{m.field}</span></span>
        <button type="button" className={`${buttonClass("text")} ${META}`} onClick={() => post({ action: "setMentorActive", mentorId: m.id, active: !m.active })}>{m.active ? "끄기" : "켜기"}</button>
      </div>
      <ul className={`${META} text-white/85`}>
        {windows.map((w) => (
          <li key={w.id} className="flex items-center justify-between">
            <span className="tabular-nums">Day {w.day} {fmtKst(w.starts_at)}~{fmtKst(w.ends_at)}</span>
            <button type="button" className="text-rose-300 underline" onClick={() => post({ action: "deleteWindow", windowId: w.id })}>빼기</button>
          </li>
        ))}
      </ul>
      <form className="flex flex-wrap items-center gap-2" onSubmit={(e) => { e.preventDefault(); void post({ action: "addWindow", mentorId: m.id, day: Number(day), start, end }); }}>
        <select value={day} onChange={(e) => setDay(e.target.value)} className={FIELD}>{OPS_DAYS.map((d) => <option key={d} value={d}>Day {d}</option>)}</select>
        <input type="time" step={900} value={start} onChange={(e) => setStart(e.target.value)} className={FIELD} />
        <input type="time" step={900} value={end} onChange={(e) => setEnd(e.target.value)} className={FIELD} />
        <button className={buttonClass("text")}>시간 추가</button>
      </form>
    </div>
  );
}

function Bookings({ data, teamName, post }: { data: Data; teamName: (id: string) => string; post: (b: object) => Promise<void> }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className={`${BODY} font-bold`}>예약</h2>
      {OPS_DAYS.map((d) => (
        <div key={d} className={BOX}>
          <h3 className={`${META} font-bold text-white/85`}>Day {d}</h3>
          {data.mentors.map((m) => {
            const bs = data.bookings.filter((b) => b.day === d && b.mentor_id === m.id);
            if (!bs.length) return null;
            return (
              <div key={m.id} className="mt-2">
                <p className={`${BODY} font-bold`}>{m.name}</p>
                <ul className={`${META} text-white/85`}>
                  {bs.map((b) => (
                    <li key={b.id} className="flex items-center justify-between gap-2">
                      <span className="tabular-nums">{fmtKst(b.starts_at)}~{fmtKst(b.ends_at)} {teamName(b.team_id)}</span>
                      <button type="button" className="text-rose-300 underline" onClick={() => post({ action: "deleteBooking", bookingId: b.id })}>지우기</button>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      ))}
    </section>
  );
}

function Missions({ data, post }: { data: Data; post: (b: object) => Promise<void> }) {
  const days = [2, 3, 4];
  const check = (teamId: string, day: number) => data.checks.find((c) => c.team_id === teamId && c.day === day) ?? { team_id: teamId, day, on_site: false, completed: false };
  const latest = (teamId: string, day: number, kind: "photo" | "pdf") => data.proofs.find((p) => p.teamId === teamId && p.day === day && p.kind === kind);
  return (
    <section className="flex flex-col gap-3">
      <h2 className={`${BODY} font-bold`}>미션</h2>
      <p className={`${META} text-white/70`}>Day 2, 3: 과반 현장 + 멘토 사진 + 진척 PDF. Day 4: 과반 현장 + 성과 공유회 발표(클로징 때 체크).</p>
      <div className="overflow-x-auto">
        <table className={`w-full min-w-[640px] ${META}`}>
          <thead><tr className="text-left text-white/70"><th className="py-2">팀</th>{days.map((d) => <th key={d}>Day {d}</th>)}</tr></thead>
          <tbody>
            {data.teams.map((t) => (
              <tr key={t.id} className="border-t border-white/10 align-top">
                <td className={`py-2 ${BODY} font-bold`}>{t.name}</td>
                {days.map((d) => {
                  const c = check(t.id, d);
                  const photo = d < 4 ? latest(t.id, d, "photo") : undefined;
                  const pdf = d < 4 ? latest(t.id, d, "pdf") : undefined;
                  return (
                    <td key={d} className="py-2 pr-3">
                      <div className="flex flex-col gap-1">
                        {d < 4 && (
                          <span className="flex gap-2">
                            {photo?.url ? <a href={photo.url} target="_blank" rel="noreferrer" className="text-amber-100 underline">사진</a> : <span className="text-white/40">사진 없음</span>}
                            {pdf?.url ? <a href={pdf.url} target="_blank" rel="noreferrer" className="text-amber-100 underline">PDF</a> : <span className="text-white/40">PDF 없음</span>}
                          </span>
                        )}
                        <label className="flex items-center gap-1.5"><input type="checkbox" checked={c.on_site} onChange={(e) => post({ action: "setCheck", teamId: t.id, day: d, onSite: e.target.checked, completed: c.completed })} />과반 현장</label>
                        <label className="flex items-center gap-1.5"><input type="checkbox" checked={c.completed} onChange={(e) => post({ action: "setCheck", teamId: t.id, day: d, onSite: c.on_site, completed: e.target.checked })} />미션 인정</label>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
