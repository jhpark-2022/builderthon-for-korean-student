"use client";

// ─────────────────────────────────────────────────────────────────────────────
// /crossing/vote의 화면.
//
// DECIDED 2026-10-19 (사용자: "8월 달이랑 다른데? 그거랑 같이 맞춰줘", "발표할때 각 트랙별로 점차 열리는 느낌"):
// 8월 Day8Vote(git 7de48c5^:components/journey/Day8Vote.tsx)의 구조 그대로입니다.
//   - 맨 위 "우리 팀" 카드. 먼저 골라야 팀을 누를 수 있고, 한 표라도 낸 뒤에는 잠깁니다. 관객도 고를 수 있습니다.
//   - 트랙마다 패널 하나. 아직 / 열림 / 마감 / 받았음 네 국면. 열림일 때만 발표 순서 번호가 붙은 팀 버튼이 나옵니다.
//   - 트랙마다 따로 냅니다. 고른 팀 줄과 보내기 버튼. 다 고르면 버튼으로 화면이 내려갑니다(8월 모바일 감사).
// 다른 것: 색은 8월의 에메랄드가 아니라 그 트랙의 틴트(brand 10장, 시간표와 같은 색), 문장은 합니다체(brand 5장),
// 열리는 시각은 코드가 아니라 트랙 표(0014)입니다. 화면은 15초마다 서버에 다시 묻습니다. 트랙이 열리면 새로 고침 없이 열립니다.
// 이 기기의 무작위 토큰(localStorage)이 표를 묶습니다. 사람을 저장하지 않습니다(8월 투표와 같음).
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useRef, useState } from "react";
import { useLocale } from "@/lib/LocaleContext";
import { BODY, META } from "@/components/ui/typography";
import { NO_TEAM, VOTE_DEVICE_KEY, VOTE_PICKS, VOTE_TEAM_KEY, formatVoteTime, type VoteTrackInfo } from "@/lib/crossingVote";
import { trackTint } from "@/lib/crossingOps";

type P = { ko: string; en: string };
const copy = {
  title: { ko: "트랙별 인기투표", en: "Vote by track" },
  intro: { ko: "트랙마다 발표를 본 사람이 가장 기억에 남는 팀 하나를 고릅니다. 참가팀이든 관객이든 트랙마다 한 표이고, 무기명입니다.", en: "Everyone who watched a track picks the one team that stayed with them. Team or audience, one vote per track, and it is anonymous." },
  myTeamLabel: { ko: "우리 팀", en: "Your team" },
  myTeamHelp: { ko: "관객으로 온 분도 투표할 수 있습니다. 참가자는 자기 팀에 투표할 수 없어서 먼저 고릅니다.", en: "You can vote as an audience member too. Participants pick their team first because you cannot vote for your own." },
  myTeamPlaceholder: { ko: "팀을 골라 주세요", en: "Choose your team" },
  myTeamNone: { ko: "참가팀이 아닙니다 (관객)", en: "Audience, not on a team" },
  myTeamLocked: { ko: "표를 낸 뒤라 우리 팀은 바꿀 수 없습니다.", en: "Your vote is in, so your team is fixed now." },
  needTeam: { ko: "먼저 우리 팀을 골라 주세요.", en: "Choose your team first." },
  ownTeam: { ko: "우리 팀", en: "Your team" },
  // 트랙마다 한 팀(VOTE_PICKS = 1). 8월은 "{n}팀을 골라 주세요"였고 트랙 1이 두 팀이었습니다.
  pickHint: { ko: "한 팀을 골라 주세요", en: "Pick one team" },
  pickCount: { ko: "{picked}/{n} 선택", en: "{picked}/{n} picked" },
  closesAt: { ko: "{time} 마감", en: "closes {time}" },
  submit: { ko: "투표 보내기", en: "Send my vote" },
  submitting: { ko: "보내는 중", en: "Sending" },
  lockedTitle: { ko: "아직 열리지 않았습니다", en: "Not open yet" },
  lockedAt: { ko: "{time}에 열립니다. 이 화면을 열어 두면 그때 여기서 바로 투표할 수 있습니다.", en: "Opens at {time}. Keep this page open and you can vote right here." },
  lockedLater: { ko: "이 트랙의 발표가 끝나면 열립니다. 이 화면을 열어 두면 그때 여기서 바로 투표할 수 있습니다.", en: "Opens when this track's presentations end. Keep this page open and you can vote right here." },
  lockedClose: { ko: "{time}에 닫힙니다.", en: "It closes at {time}." },
  closedTitle: { ko: "투표가 마감됐습니다", en: "Voting has closed" },
  closedBody: { ko: "결과는 시상에서 알려 드립니다.", en: "The result comes at the awards." },
  doneTitle: { ko: "투표를 받았습니다", en: "Your vote is in" },
  doneBody: { ko: "트랙마다 한 번만 낼 수 있습니다. 결과는 시상에서 알려 드립니다.", en: "One vote per track. The result comes at the awards." },
  doneChoices: { ko: "고른 팀", en: "You picked" },
  empty: { ko: "아직 투표할 팀이 없습니다.", en: "No teams to vote for yet." },
  errAlready: { ko: "이 기기로 이 트랙에 이미 투표했습니다.", en: "This device has already voted in this track." },
  errNotOpen: { ko: "아직 열리지 않았습니다.", en: "Not open yet." },
  errClosed: { ko: "투표가 마감됐습니다.", en: "Voting has closed." },
  errRate: { ko: "잠시 뒤 다시 보내 주세요.", en: "Too many votes at once. Try again in a moment." },
  errGeneric: { ko: "보내지 못했습니다. 잠시 뒤 다시 해 주세요.", en: "Something went wrong. Try again in a moment." },
} satisfies Record<string, P>;

function errorPhrase(code: unknown): P {
  switch (code) {
    case "already_voted": return copy.errAlready;
    case "not_open": return copy.errNotOpen;
    case "vote_closed": return copy.errClosed;
    case "rate_limited": return copy.errRate;
    default: return copy.errGeneric;
  }
}

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
  const { t, locale } = useLocale();
  const [tracks, setTracks] = useState<VoteTrackInfo[] | null>(null);
  const [done, setDone] = useState<Record<string, string>>({});
  const [myTeam, setMyTeam] = useState("");
  const [picks, setPicks] = useState<Record<string, string[]>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<Record<string, P | undefined>>({});
  const [needTeam, setNeedTeam] = useState<Record<string, boolean>>({});
  const device = useRef("");

  const refresh = useCallback(async () => {
    const r = await fetch(`/api/crossing/vote?device=${device.current}`, { cache: "no-store" }).catch(() => null);
    if (!r?.ok) return;
    const j = await r.json();
    setTracks(j.tracks ?? []);
    setDone(j.done ?? {});
  }, []);

  useEffect(() => {
    device.current = deviceToken();
    try { const s = localStorage.getItem(VOTE_TEAM_KEY); if (s) setMyTeam(s); } catch { /* 저장소가 막혀도 투표는 됩니다 */ }
    void refresh();
    // 트랙이 열리는 것을 새로 고침 없이 보도록 15초마다 다시 묻습니다. 폰을 잠갔다 켜면 바로 한 번.
    const id = window.setInterval(refresh, 15_000);
    const onVisible = () => { if (document.visibilityState === "visible") void refresh(); };
    document.addEventListener("visibilitychange", onVisible);
    return () => { window.clearInterval(id); document.removeEventListener("visibilitychange", onVisible); };
  }, [refresh]);

  const allTeams = (tracks ?? []).flatMap((x) => x.teams);
  const teamValid = myTeam === NO_TEAM || allTeams.includes(myTeam);
  const voter = teamValid ? myTeam : "";
  const teamLocked = Object.keys(done).length > 0;

  const chooseMyTeam = (value: string) => {
    setMyTeam(value);
    setNeedTeam({});
    // 우리 팀으로 바꾼 팀에 찍어 둔 표는 걷습니다(8월과 같음).
    setPicks((prev) => Object.fromEntries(Object.entries(prev).map(([k, v]) => [k, v.filter((x) => x !== value)])));
    try { localStorage.setItem(VOTE_TEAM_KEY, value); } catch { /* 이번 방문에만 남습니다 */ }
  };

  const toggle = (track: string, team: string) => {
    if (!voter) { setNeedTeam((p) => ({ ...p, [track]: true })); return; }
    setError((p) => ({ ...p, [track]: undefined }));
    setPicks((prev) => {
      const cur = prev[track] ?? [];
      if (cur.includes(team)) return { ...prev, [track]: cur.filter((x) => x !== team) };
      if (VOTE_PICKS === 1) return { ...prev, [track]: [team] }; // 한 팀이면 다른 팀을 누르는 것이 바꾸기입니다
      if (cur.length >= VOTE_PICKS) return prev;
      return { ...prev, [track]: [...cur, team] };
    });
  };

  const submit = async (track: string) => {
    const chosen = picks[track] ?? [];
    if (!voter || chosen.length !== VOTE_PICKS || busy) return;
    setBusy(track);
    setError((p) => ({ ...p, [track]: undefined }));
    try {
      const r = await fetch("/api/crossing/vote", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ deviceToken: device.current, voterTeam: voter, track, choice: chosen[0] }),
      });
      if (r.ok) setDone((d) => ({ ...d, [track]: chosen[0] }));
      else {
        const e = (await r.json().catch(() => ({}))).error;
        setError((p) => ({ ...p, [track]: errorPhrase(e) }));
        void refresh();
      }
    } catch {
      setError((p) => ({ ...p, [track]: copy.errGeneric }));
    } finally {
      setBusy(null);
    }
  };

  return (
    <main id="main" className="min-h-screen bg-[#070B1F] px-4 pb-24 pt-10 text-white">
      <div className="mx-auto flex max-w-2xl flex-col gap-5">
        <header className="flex flex-col gap-3">
          <h1 className={`${BODY} font-bold`}>{t(copy.title)}</h1>
          <p className={`break-keep ${BODY} leading-relaxed text-white/80`}>{t(copy.intro)}</p>
        </header>

        {/* 우리 팀. 네이티브 select입니다(8월과 같은 이유: 폰의 기본 피커가 가장 빠름). 트랙별로 묶습니다. */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
          <label htmlFor="vote-my-team" className={`${META} font-bold uppercase tracking-[0.16em] text-white/75`}>{t(copy.myTeamLabel)}</label>
          <p className={`mt-2 break-keep ${BODY} leading-relaxed text-white/65`}>{t(copy.myTeamHelp)}</p>
          <select id="vote-my-team" value={voter} disabled={teamLocked} onChange={(e) => chooseMyTeam(e.target.value)}
            className={`mt-4 min-h-[52px] w-full rounded-2xl border border-white/15 bg-[#0d1230] px-4 py-3 ${BODY} font-semibold text-white outline-none focus-visible:border-white/50 disabled:cursor-not-allowed disabled:opacity-60`}>
            <option value="" disabled>{t(copy.myTeamPlaceholder)}</option>
            <option value={NO_TEAM}>{t(copy.myTeamNone)}</option>
            {(tracks ?? []).map((tr) => (
              <optgroup key={tr.id} label={t(tr.label)}>
                {tr.teams.map((x) => <option key={x} value={x}>{x}</option>)}
              </optgroup>
            ))}
          </select>
          {teamLocked && <p className={`mt-3 break-keep ${BODY} text-white/55`}>{t(copy.myTeamLocked)}</p>}
        </div>

        {tracks && tracks.length === 0 && <p className={`${BODY} text-white/60`}>{t(copy.empty)}</p>}
        {(tracks ?? []).map((tr) => (
          <VotePanel key={tr.id} track={tr} locale={locale} t={t} myTeam={voter} picked={picks[tr.id] ?? []} done={done[tr.id]}
            busy={busy === tr.id} error={error[tr.id]} needTeam={!!needTeam[tr.id]} onToggle={toggle} onSubmit={submit} />
        ))}
      </div>
    </main>
  );
}

function VotePanel({ track, locale, t, myTeam, picked, done, busy, error, needTeam, onToggle, onSubmit }: {
  track: VoteTrackInfo; locale: "ko" | "en"; t: (p: P) => string; myTeam: string; picked: string[]; done: string | undefined;
  busy: boolean; error: P | undefined; needTeam: boolean; onToggle: (track: string, team: string) => void; onSubmit: (track: string) => void;
}) {
  const tint = trackTint(track.color);
  const full = picked.length >= VOTE_PICKS;
  const fill = (s: string, v: Record<string, string>) => Object.entries(v).reduce((a, [k, x]) => a.replace(`{${k}}`, x), s);
  const closeTime = track.closesAt ? formatVoteTime(track.closesAt, locale) : null;

  // 다 골랐을 때 보내기 버튼으로(8월 모바일 감사): 버튼이 화면 밖이면 한 번만 내려갑니다.
  const submitRef = useRef<HTMLButtonElement>(null);
  const wasFull = useRef(false);
  useEffect(() => {
    if (full && !wasFull.current && track.state === "open") {
      const el = submitRef.current;
      if (el) {
        const r = el.getBoundingClientRect();
        if (r.bottom > window.innerHeight || r.top < 0) {
          el.scrollIntoView({ block: "center", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
        }
      }
    }
    wasFull.current = full;
  }, [full, track.state]);

  const box = "mt-5 rounded-2xl border px-5 py-4";
  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6" aria-labelledby={`vote-${track.id}`}>
      <h2 id={`vote-${track.id}`} className={`flex items-center gap-2 ${BODY} font-bold`}>
        <span aria-hidden className="h-2.5 w-2.5 rounded-full" style={{ background: tint }} />{t(track.label)}
      </h2>

      {/* 받았음이 무엇보다 먼저입니다. 낸 사람에게 팀 목록을 다시 보여 주면 한 번 더 낼 수 있다는 뜻으로 읽힙니다(8월). */}
      {done !== undefined ? (
        <div className={box} style={{ borderColor: `${tint}55`, background: `${tint}14` }}>
          <p className={`${BODY} font-bold text-white`}>{t(copy.doneTitle)}</p>
          <p className={`mt-2 break-keep ${BODY} text-white/85`}><span className="text-white/55">{t(copy.doneChoices)}</span> {done}</p>
          <p className={`mt-2 break-keep ${BODY} text-white/60`}>{t(track.state === "closed" ? copy.closedBody : copy.doneBody)}</p>
        </div>
      ) : track.state === "before" ? (
        <div className={`${box} border-white/[0.12] bg-white/[0.03]`}>
          <p className={`${BODY} font-bold text-white/85`}>{t(copy.lockedTitle)}</p>
          <p className={`mt-2 break-keep ${BODY} leading-relaxed text-white/60`}>
            {track.opensAt ? fill(t(copy.lockedAt), { time: formatVoteTime(track.opensAt, locale) }) : t(copy.lockedLater)}{" "}
            {closeTime && <span className="font-semibold text-white/80">{fill(t(copy.lockedClose), { time: closeTime })}</span>}
          </p>
        </div>
      ) : track.state === "closed" ? (
        <div className={`${box} border-white/[0.12] bg-white/[0.03]`}>
          <p className={`${BODY} font-bold text-white/85`}>{t(copy.closedTitle)}</p>
          <p className={`mt-2 break-keep ${BODY} text-white/60`}>{t(copy.closedBody)}</p>
        </div>
      ) : (
        <>
          <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1">
            <p className={`${BODY} font-bold text-white/85`}>{fill(t(copy.pickHint), { n: String(VOTE_PICKS) })}</p>
            <span className={`rounded-full border px-2.5 py-0.5 ${META} font-bold ${full ? "text-white" : "border-white/15 bg-white/[0.05] text-white/60"}`}
              style={full ? { borderColor: `${tint}80`, background: `${tint}26` } : undefined}>
              {fill(t(copy.pickCount), { picked: String(picked.length), n: String(VOTE_PICKS) })}
            </span>
            {closeTime && <span className={`${META} font-semibold text-amber-200/75`}>{fill(t(copy.closesAt), { time: closeTime })}</span>}
          </div>

          {/* 발표 순서 그대로, 번호와 함께. 폰에서는 한 줄에 하나(8월: 두 열이면 긴 이름이 꺾여 오조작). */}
          <ul role="list" className="mt-4 grid gap-2 sm:grid-cols-2">
            {track.teams.map((team, i) => {
              const isOwn = team === myTeam;
              const isPicked = picked.includes(team);
              const disabled = isOwn || busy;
              return (
                <li key={team}>
                  <button type="button" onClick={() => onToggle(track.id, team)} disabled={disabled} aria-pressed={isPicked}
                    className={`flex min-h-[52px] w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition ${isPicked ? "text-white" : "border-white/10 bg-white/[0.03] text-white/80"} ${disabled ? "cursor-not-allowed opacity-45" : "hover:border-white/30 hover:text-white"}`}
                    style={isPicked ? { borderColor: `${tint}aa`, background: `${tint}2e` } : undefined}>
                    <span aria-hidden className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border ${META} font-black ${isPicked ? "text-white" : "border-white/[0.12] bg-white/[0.05] text-white/55"}`}
                      style={isPicked ? { borderColor: `${tint}aa`, background: `${tint}40` } : undefined}>{i + 1}</span>
                    <span className={`break-keep ${BODY} font-semibold leading-snug`}>{team}</span>
                    {isOwn && <span className={`ml-auto shrink-0 rounded-full border border-white/15 bg-white/[0.06] px-2 py-0.5 ${META} font-bold text-white/60`}>{t(copy.ownTeam)}</span>}
                  </button>
                </li>
              );
            })}
          </ul>

          {needTeam && <p className={`mt-4 break-keep ${BODY} font-semibold text-amber-200/90`}>{t(copy.needTeam)}</p>}
          {error && <p role="alert" className={`mt-4 break-keep ${BODY} font-semibold text-amber-200/90`}>{t(error)}</p>}
          {picked.length > 0 && (
            <p className={`mt-5 break-keep ${BODY} text-white/85`}><span className="text-white/55">{t(copy.doneChoices)}</span> <span className="font-bold">{picked.join(", ")}</span></p>
          )}
          <button ref={submitRef} type="button" onClick={() => onSubmit(track.id)} disabled={!myTeam || !full || busy}
            className={`mt-4 inline-flex min-h-[52px] w-full items-center justify-center rounded-full border px-6 py-3 ${BODY} font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto`}
            style={{ borderColor: `${tint}80`, background: `${tint}26` }}>
            {t(busy ? copy.submitting : copy.submit)}<span className="sr-only"> {t(track.label)}</span>
          </button>
        </>
      )}
    </section>
  );
}
