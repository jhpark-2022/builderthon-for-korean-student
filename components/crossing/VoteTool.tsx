"use client";

// ─────────────────────────────────────────────────────────────────────────────
// /crossing/vote의 화면(2026-10-17). 트랙마다 한 팀을 고르고 한 번에 냅니다. 우리 팀은 고를 수 없습니다.
// 이 기기의 무작위 토큰(localStorage)이 한 표를 묶습니다. 사람을 저장하지 않습니다(8월 투표와 같음).
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from "react";
import { useLocale } from "@/lib/LocaleContext";
import { BODY, META } from "@/components/ui/typography";
import { buttonClass } from "@/components/ui/Button";
import { NO_TEAM, VOTE_DEVICE_KEY } from "@/lib/crossingVote";

const copy = {
  title: { ko: "트랙별 인기투표", en: "Vote by track" },
  lead: { ko: "트랙마다 가장 기억에 남는 팀 하나를 고릅니다. 우리 팀은 고를 수 없고, 한 번 내면 바꿀 수 없습니다.", en: "Pick the one team that stayed with you in each track. You cannot pick your own team, and a vote cannot be changed." },
  myTeam: { ko: "우리 팀", en: "Your team" },
  noTeam: { ko: "참가팀이 아닙니다", en: "Not on a team" },
  submit: { ko: "투표하기", en: "Vote" },
  done: { ko: "투표했습니다", en: "Voted" },
  already: { ko: "이 기기로 이미 투표한 트랙이 있습니다.", en: "This device has already voted in a track." },
  error: { ko: "잠시 뒤 다시 해 주세요.", en: "Something went wrong. Try again in a moment." },
};

function deviceToken(): string {
  try {
    const v = localStorage.getItem(VOTE_DEVICE_KEY);
    if (v) return v;
    const n = crypto.randomUUID();
    localStorage.setItem(VOTE_DEVICE_KEY, n);
    return n;
  } catch {
    return crypto.randomUUID();
  }
}

export default function VoteTool() {
  const { t } = useLocale();
  const [tracks, setTracks] = useState<Record<string, string[]>>({});
  const [teams, setTeams] = useState<string[]>([]);
  const [done, setDone] = useState<string[]>([]);
  const [voter, setVoter] = useState(NO_TEAM);
  const [picks, setPicks] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void fetch(`/api/crossing/vote?device=${deviceToken()}`, { cache: "no-store" }).then(async (r) => {
      if (!r.ok) return;
      const j = await r.json();
      setTracks(j.tracks ?? {}); setTeams(j.teams ?? []); setDone(j.done ?? []);
    });
  }, []);

  const open = Object.keys(tracks).filter((k) => !done.includes(k));
  const send = async () => {
    setBusy(true); setMsg(null);
    const votes = Object.fromEntries(open.filter((k) => picks[k]).map((k) => [k, picks[k]]));
    const r = await fetch("/api/crossing/vote", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ deviceToken: deviceToken(), voterTeam: voter, votes }) });
    if (r.ok) setDone((d) => [...d, ...Object.keys(votes)]);
    else setMsg(t((await r.json().catch(() => ({}))).error === "already_voted" ? copy.already : copy.error));
    setBusy(false);
  };

  return (
    <main id="main" className="min-h-screen bg-[#070B1F] px-4 pb-24 pt-10 text-white">
      <div className="mx-auto flex max-w-2xl flex-col gap-6">
        <h1 className={`${BODY} font-bold`}>{t(copy.title)}</h1>
        <p className={`${BODY} text-white/85`}>{t(copy.lead)}</p>
        <label className={`flex flex-wrap items-center gap-3 ${META} font-bold text-white/85`}>
          {t(copy.myTeam)}
          <select value={voter} onChange={(e) => setVoter(e.target.value)} className={`rounded-lg border border-white/20 bg-[#0d1230] px-3 py-2 ${BODY} font-normal text-white`}>
            <option value={NO_TEAM}>{t(copy.noTeam)}</option>
            {teams.map((x) => <option key={x} value={x}>{x}</option>)}
          </select>
        </label>
        {Object.entries(tracks).map(([track, list]) => (
          <fieldset key={track} disabled={done.includes(track)} className="rounded-2xl border border-white/15 bg-white/[0.03] p-4">
            <legend className={`px-1 ${BODY} font-bold`}>{track} {done.includes(track) && <span className={`${META} text-amber-100`}>★ {t(copy.done)}</span>}</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {list.map((team) => (
                <label key={team} className={`flex items-center gap-2 rounded-full border px-3 py-2 ${BODY} ${team === voter ? "border-white/10 text-white/30" : picks[track] === team ? "border-amber-300/70 bg-amber-400/20" : "border-white/20"}`}>
                  <input type="radio" name={track} value={team} disabled={team === voter} checked={picks[track] === team} onChange={() => setPicks((p) => ({ ...p, [track]: team }))} className="accent-accent" />
                  {team}
                </label>
              ))}
            </div>
          </fieldset>
        ))}
        {msg && <p role="alert" className={`${META} text-rose-300`}>{msg}</p>}
        {open.length > 0 && (
          <button type="button" disabled={busy || !open.some((k) => picks[k])} onClick={send} className={`${buttonClass("primary")} w-fit justify-center disabled:opacity-50`}>{t(copy.submit)}</button>
        )}
      </div>
    </main>
  );
}
