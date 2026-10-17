"use client";

// ─────────────────────────────────────────────────────────────────────────────
// /crossing/staff. 운영진 화면(2026-10-17). 한국어만 씁니다(운영진 도구).
//   팀: 등록 명단에서 사람을 골라 팀을 만들고 고칩니다(한 사람은 한 팀에만). 이 팀 이름이 시간표에 보입니다.
//   멘토: 만들기, 받는 시간(Day, 시작, 끝) 넣기와 빼기, 끄기
//   시간표: 날마다 멘토별로 어느 팀이 넣었는지, 운영진이 빼기
//   인증: 팀과 날마다 가장 최근 사진과 PDF(누르면 열림)
// 키는 이 탭의 sessionStorage에만 둡니다.
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useState } from "react";
import { BODY, META } from "@/components/ui/typography";
import { buttonClass } from "@/components/ui/Button";
import { OPS_DAYS, fmtKst } from "@/lib/crossingOps";

type Person = { id: string; name: string; university: string | null; study_country: string | null };
type Team = { id: string; name: string; memberIds: string[] };
type Mentor = { id: string; name: string; field: string | null; active: boolean };
type Win = { id: string; mentor_id: string; day: number; starts_at: string; ends_at: string };
type Bk = { id: string; mentor_id: string; team_id: string; day: number; starts_at: string; ends_at: string };
type Proof = { id: string; teamId: string; day: number; kind: "photo" | "pdf"; createdAt: string; url: string | null };
type Data = { people: Person[]; teams: Team[]; mentors: Mentor[]; windows: Win[]; bookings: Bk[]; proofs: Proof[] };

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
    if (!r.ok) {
      const e = (await r.json().catch(() => ({}))).error;
      setErr(e === "already_in_team" ? "이미 다른 팀에 있는 사람이 있습니다." : e === "duplicate" ? "같은 이름의 팀이 있습니다." : "저장하지 못했습니다.");
    } else setErr(null);
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

        <Teams data={data} post={post} />
        <Mentors data={data} post={post} />
        <Bookings data={data} teamName={teamName} post={post} />
        <Uploads data={data} />
      </div>
    </main>
  );
}

function Teams({ data, post }: { data: Data; post: (b: object) => Promise<void> }) {
  const [name, setName] = useState("");
  const [picked, setPicked] = useState<string[]>([]);
  const [q, setQ] = useState("");
  const inTeam = new Map(data.teams.flatMap((t) => t.memberIds.map((id) => [id, t.name] as const)));
  const person = (id: string) => data.people.find((p) => p.id === id);
  const label = (p: Person) => [p.name, p.university, p.study_country].filter(Boolean).join(" · ");
  const free = data.people.filter((p) => !inTeam.has(p.id) && (!q || label(p).toLowerCase().includes(q.toLowerCase())));
  return (
    <section className="flex flex-col gap-3">
      <h2 className={`${BODY} font-bold`}>팀 ({data.teams.length}) <span className={`${META} font-normal text-white/70`}>등록 {data.people.length}명, 팀 없음 {data.people.length - inTeam.size}명</span></h2>
      <div className={`${BOX} flex flex-col gap-3`}>
        <div className="flex flex-wrap gap-2">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="팀 이름" maxLength={40} className={FIELD} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="이름, 학교로 찾기" className={FIELD} />
          <button type="button" disabled={!name.trim()} className={buttonClass("secondary")}
            onClick={async () => { await post({ action: "createTeam", name: name.trim(), memberIds: picked }); setName(""); setPicked([]); }}>
            팀 만들기 ({picked.length}명)
          </button>
        </div>
        <ul className={`grid max-h-64 gap-1 overflow-y-auto sm:grid-cols-2 ${META}`}>
          {free.map((p) => (
            <li key={p.id}>
              <label className="flex items-center gap-2 text-white/85">
                <input type="checkbox" checked={picked.includes(p.id)} onChange={(e) => setPicked((x) => e.target.checked ? [...x, p.id] : x.filter((y) => y !== p.id))} />
                {label(p)}
              </label>
            </li>
          ))}
        </ul>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {data.teams.map((t) => (
          <div key={t.id} className={`${BOX} flex flex-col gap-2`}>
            <div className="flex items-baseline justify-between gap-2">
              <span className={`${BODY} font-bold`}>{t.name} <span className={`${META} font-normal text-white/70`}>{t.memberIds.length}명</span></span>
              <button type="button" className={`${META} text-rose-300 underline`} onClick={() => post({ action: "deleteTeam", teamId: t.id })}>팀 지우기</button>
            </div>
            <ul className={`${META} text-white/85`}>
              {t.memberIds.map((id) => {
                const p = person(id);
                return (
                  <li key={id} className="flex items-center justify-between gap-2">
                    <span>{p ? label(p) : "?"}</span>
                    <button type="button" className="text-rose-300 underline" onClick={() => post({ action: "setTeamMembers", teamId: t.id, memberIds: t.memberIds.filter((x) => x !== id) })}>빼기</button>
                  </li>
                );
              })}
            </ul>
            {picked.length > 0 && (
              <button type="button" className={`${buttonClass("text")} ${META}`} onClick={async () => { await post({ action: "setTeamMembers", teamId: t.id, memberIds: [...t.memberIds, ...picked] }); setPicked([]); }}>
                고른 {picked.length}명을 이 팀에 넣기
              </button>
            )}
          </div>
        ))}
      </div>
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
      <h2 className={`${BODY} font-bold`}>시간표</h2>
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

function Uploads({ data }: { data: Data }) {
  const latest = (teamId: string, day: number, kind: "photo" | "pdf") => data.proofs.find((p) => p.teamId === teamId && p.day === day && p.kind === kind);
  const link = (p: Proof | undefined, label: string) =>
    p?.url ? <a href={p.url} target="_blank" rel="noreferrer" className="text-amber-100 underline">{label} {fmtKst(p.createdAt)}</a> : <span className="text-white/40">{label} 없음</span>;
  return (
    <section className="flex flex-col gap-3">
      <h2 className={`${BODY} font-bold`}>미션 인증</h2>
      <div className="overflow-x-auto">
        <table className={`w-full min-w-[520px] ${META}`}>
          <thead><tr className="text-left text-white/70"><th className="py-2">팀</th>{OPS_DAYS.map((d) => <th key={d}>Day {d}</th>)}</tr></thead>
          <tbody>
            {data.teams.map((t) => (
              <tr key={t.id} className="border-t border-white/10">
                <td className={`py-2 ${BODY} font-bold`}>{t.name}</td>
                {OPS_DAYS.map((d) => (
                  <td key={d} className="py-2 pr-3"><span className="flex gap-3">{link(latest(t.id, d, "photo"), "사진")}{link(latest(t.id, d, "pdf"), "PDF")}</span></td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
