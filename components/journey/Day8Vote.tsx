"use client";

// ─────────────────────────────────────────────────────────────────────────────
// Day 8 빌더스 초이스 투표 패널.
//
// 자리는 트랙 섹션(#tracks)입니다. 8/29에 이 자리가 하던 일(두 문제를 읽고 트랙을
// 고른다)은 8일 전에 끝났고, 그날 이 자리가 해야 하는 유일한 일은 발표를 다 본
// 사람이 폰으로 팀을 뽑는 것입니다. 그래서 문제 상세는 걷고 패널 머리(01 채용
// 저지먼트 / 02 마케팅 콘텐츠 오토메이션)만 남겼습니다. 트랙 정체성은 지난 8일이
// 이미 만들어 놨으니 여기서 다시 설명할 이유가 없어요.
//
// Journey.tsx 안에 두지 않은 이유: 이 컴포넌트는 저장소를 읽고 네트워크를 칩니다.
// 5천 줄짜리 파일 안의 순수 렌더 헬퍼들과 성격이 다르고, 행사가 끝나면 통째로
// 걷어낼 조각이라 파일 하나로 서 있는 편이 걷어내기도 쉽습니다.
//
// 시각·명단·개수는 lib/day8Vote.ts가 정본이고 카피는 dict.vote가 정본입니다.
// 여기에는 둘 다 없습니다. 이 파일이 갖는 것은 상태와 배치뿐이에요.
//
// 클라이언트 시계는 화면을 그리는 데만 씁니다. 열렸는지 마감됐는지의 최종 판정은
// app/api/vote/route.ts가 서버 시계로 합니다. 폰 시계가 5분 빠른 사람이 먼저
// 눌러도 서버가 403으로 돌려보냅니다.
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocale } from "@/lib/LocaleContext";
import { dict, type Phrase } from "@/data/dictionary";
import {
  VOTER_TEAM_NONE,
  VOTE_CLOSES_AT,
  VOTE_LAST_CLOSE,
  VOTE_OPENS_AT,
  VOTE_PICKS,
  VOTE_TEAMS,
  VOTE_TRACKS,
  formatVoteTime,
  voteWindowState,
  type VoteTrack,
} from "@/lib/day8Vote";
import { VOTE_DEVICE_KEY, VOTE_DONE_KEY, VOTE_TEAM_KEY } from "@/lib/storage";

// 제출 완료 상태. 값은 그 기기가 보낸 팀들이고, 빈 배열은 "보낸 것은 확실한데
// 무엇을 보냈는지 이 기기가 모른다"는 뜻입니다(다른 기기에서 이미 보냈거나
// 저장소가 지워진 경우, 서버의 409를 받고 여기로 들어옵니다).
type DoneMap = Partial<Record<VoteTrack, string[]>>;

// crypto.randomUUID는 보안 컨텍스트에서만, 그리고 iOS 15.4부터 있습니다. 현장에
// 오래된 폰이 한 대라도 있으면 그 사람만 투표를 못 하게 되므로 손으로 만드는 길을
// 둡니다. getRandomValues는 훨씬 오래된 브라우저에도 있어요.
function newDeviceToken(): string {
  try {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
    const b = new Uint8Array(16);
    crypto.getRandomValues(b);
    b[6] = (b[6] & 0x0f) | 0x40; // version 4
    b[8] = (b[8] & 0x3f) | 0x80; // variant
    const hex = Array.from(b, (n) => n.toString(16).padStart(2, "0")).join("");
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  } catch {
    return "";
  }
}

// 서버가 돌려준 상태를 화면 문장으로. 모르는 값은 일반 오류로 떨어집니다.
function errorPhrase(code: unknown): Phrase {
  switch (code) {
    case "already_voted":
      return dict.vote.errAlready;
    case "not_open":
      return dict.vote.errNotOpen;
    case "vote_closed":
      return dict.vote.errClosed;
    case "rate_limited":
      return dict.vote.errRate;
    case "cancel_closed":
      return dict.vote.errCancelClosed;
    default:
      return dict.vote.errGeneric;
  }
}

export default function Day8Vote({ serverNow }: { serverNow: number }) {
  const { t, locale } = useLocale();

  // ── 시계 ───────────────────────────────────────────────────────────────────
  // 이 화면은 방문자의 폰 시계를 믿지 않습니다. 서버 시각과의 차(offset)를 한 번
  // 재두고, 이후 모든 "지금"은 Date.now() + offset으로 읽습니다.
  //
  // 폰 시계가 5분 빠른 사람이 문제였습니다. 열린 화면을 보고 눌렀다가 서버에서
  // 403을 받아요. 화면이 거짓말을 한 셈이고, 무대 앞에서 그 사람은 자기 폰이
  // 아니라 이 사이트가 고장 났다고 판단합니다.
  //
  // offset의 출처가 둘입니다. 첫 렌더는 SSR이 내려준 serverNow로 그립니다.
  // 서버 HTML과 클라이언트의 첫 렌더가 같은 숫자를 봐야 하이드레이션이 어긋나지
  // 않아요. 그런데 / 는 ISR(revalidate 300)이라 그 값이 최대 5분 낡습니다.
  // 12:48에 만들어진 HTML을 12:52에 받은 사람은 12:50 오픈을 4분 늦게 보게 되고,
  // 그건 폰 시계가 틀린 사람을 구하려다 시계가 맞는 사람을 막는 일입니다.
  // 그래서 마운트 직후 GET /api/vote로 캐시되지 않은 진짜 서버 시각을 받아
  // offset을 다시 맞춥니다. 실패하면 serverNow 기준으로 남습니다.
  //
  // 첫 렌더의 offset을 0이 아니라 serverNow - Date.now()로 두는 이유: 0이면
  // 하이드레이션 순간 화면이 폰 시계로 한 번 튑니다.
  const [now, setNow] = useState(serverNow);
  const offsetRef = useRef(0);

  useEffect(() => {
    let alive = true;
    offsetRef.current = serverNow - Date.now();
    const read = () => Date.now() + offsetRef.current;
    const tick = () => setNow(read());

    tick();

    // 캐시되지 않은 서버 시각으로 보정. force-dynamic 라우트라 항상 지금입니다.
    // 네트워크 왕복만큼(수백 ms) 과거인 것은 감수합니다. 잡으려는 오차는 분 단위예요.
    void fetch("/api/vote", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { now?: number } | null) => {
        if (!alive || typeof d?.now !== "number") return;
        offsetRef.current = d.now - Date.now();
        tick();
      })
      .catch(() => {
        /* 오프라인이면 serverNow 기준으로 둡니다. */
      });

    // 두 트랙 중 늦은 쪽까지만 시계를 돌립니다. 그 뒤로는 화면이 바뀔 일이 없어요.
    if (read() >= VOTE_LAST_CLOSE) return () => { alive = false; };

    const id = window.setInterval(tick, 20_000);
    // 폰을 잠갔다 켠 순간. 백그라운드에서는 인터벌이 눌리기 때문에, 돌아오자마자
    // 한 번 다시 읽지 않으면 12:50에 깨운 사람이 최대 20초 동안 잠금 화면을 봅니다.
    const onVisible = () => {
      if (document.visibilityState === "visible") tick();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      alive = false;
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [serverNow]);

  const [device, setDevice] = useState<string | null>(null);
  const [myTeam, setMyTeam] = useState("");
  const [done, setDone] = useState<DoneMap>({});
  const [picks, setPicks] = useState<Record<VoteTrack, string[]>>({ 1: [], 2: [] });
  const [busy, setBusy] = useState<VoteTrack | null>(null);
  const [error, setError] = useState<Partial<Record<VoteTrack, Phrase>>>({});
  // 내 팀을 안 고르고 팀을 누른 순간에만 뜨는 힌트. 패널마다 따로 뜹니다.
  const [needTeam, setNeedTeam] = useState<Partial<Record<VoteTrack, boolean>>>({});
  // 취소 버튼을 눌러 확인 문구가 떠 있는 트랙. 실수 탭으로 표가 사라지지 않게
  // 한 단계를 둡니다.
  const [confirming, setConfirming] = useState<Partial<Record<VoteTrack, boolean>>>({});

  // 저장소 복원. 완료 상태가 재방문에도 남는 자리가 여기입니다.
  useEffect(() => {
    try {
      let token = window.localStorage.getItem(VOTE_DEVICE_KEY);
      if (!token) {
        token = newDeviceToken();
        if (token) window.localStorage.setItem(VOTE_DEVICE_KEY, token);
      }
      setDevice(token || null);

      const savedTeam = window.localStorage.getItem(VOTE_TEAM_KEY);
      if (savedTeam) setMyTeam(savedTeam);

      const raw = window.localStorage.getItem(VOTE_DONE_KEY);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        const next: DoneMap = {};
        for (const track of VOTE_TRACKS) {
          const v = (parsed as Record<string, unknown>)?.[String(track)];
          if (Array.isArray(v)) next[track] = v.filter((x): x is string => typeof x === "string");
        }
        setDone(next);
      }
    } catch {
      /* 저장소가 막힌 브라우저(프라이빗 모드 등). 투표는 되고 완료 상태만 안 남습니다. */
    }
  }, []);

  const persistDone = useCallback((next: DoneMap) => {
    setDone(next);
    try {
      window.localStorage.setItem(VOTE_DONE_KEY, JSON.stringify(next));
    } catch {
      /* 저장소가 막혔으면 화면 상태로만 남습니다. */
    }
  }, []);

  const chooseMyTeam = useCallback((value: string) => {
    setMyTeam(value);
    setNeedTeam({});
    // 내 팀을 바꾸면 그 팀에 찍혀 있던 표를 걷습니다. 안 그러면 "AI Bot"을 고른
    // 뒤 내 팀을 AI Bot으로 바꾼 사람이 자기 팀 표를 든 채로 제출 버튼을 만납니다.
    setPicks((prev) => ({
      1: prev[1].filter((teamName) => teamName !== value),
      2: prev[2].filter((teamName) => teamName !== value),
    }));
    try {
      window.localStorage.setItem(VOTE_TEAM_KEY, value);
    } catch {
      /* 저장소가 막혔으면 이번 방문에만 남습니다. */
    }
  }, []);

  // 표를 한 번이라도 보냈으면 내 팀은 잠깁니다. 이미 그 값으로 배제 판정이 끝난
  // 표가 서버에 있어서, 여기서 바꾸면 두 트랙의 기준이 서로 달라집니다.
  const teamLocked = VOTE_TRACKS.some((track) => done[track] !== undefined);

  const toggle = useCallback(
    (track: VoteTrack, teamName: string) => {
      if (!myTeam) {
        setNeedTeam((prev) => ({ ...prev, [track]: true }));
        return;
      }
      setError((prev) => ({ ...prev, [track]: undefined }));
      setPicks((prev) => {
        const current = prev[track];
        if (current.includes(teamName)) {
          return { ...prev, [track]: current.filter((x) => x !== teamName) };
        }
        if (current.length >= VOTE_PICKS[track]) return prev;
        return { ...prev, [track]: [...current, teamName] };
      });
    },
    [myTeam]
  );

  const submit = useCallback(
    async (track: VoteTrack) => {
      const chosen = picks[track];
      if (!device || !myTeam || chosen.length !== VOTE_PICKS[track] || busy) return;
      setBusy(track);
      setError((prev) => ({ ...prev, [track]: undefined }));
      try {
        const res = await fetch("/api/vote", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            track,
            deviceToken: device,
            voterTeam: myTeam,
            choices: chosen,
          }),
        });
        if (res.ok) {
          persistDone({ ...done, [track]: chosen });
          return;
        }
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        if (data.error === "already_voted") {
          // 이 기기의 표는 이미 서버에 있습니다. 무엇을 골랐는지는 모르니 빈
          // 배열로 완료만 표시하고, 왜 그런지는 아래 문장이 말합니다.
          persistDone({ ...done, [track]: [] });
        }
        setError((prev) => ({ ...prev, [track]: errorPhrase(data.error) }));
      } catch {
        setError((prev) => ({ ...prev, [track]: dict.vote.errGeneric }));
      } finally {
        setBusy(null);
      }
    },
    [busy, device, done, myTeam, persistDone, picks]
  );

  const cancel = useCallback(
    async (track: VoteTrack) => {
      if (!device || busy) return;
      setBusy(track);
      setError((prev) => ({ ...prev, [track]: undefined }));
      try {
        const res = await fetch("/api/vote", {
          method: "DELETE",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ track, deviceToken: device }),
        });
        const data = (await res.json().catch(() => ({}))) as { error?: string };

        // 404는 오류가 아닙니다. 서버에 표가 없으니 화면이 말하던 완료 상태가
        // 틀린 것이고, 하려던 일(투표 화면으로 돌아가기)은 이미 이뤄져 있습니다.
        if (res.ok || data.error === "not_found") {
          const next = { ...done };
          delete next[track];
          persistDone(next);
          setPicks((prev) => ({ ...prev, [track]: [] }));
          setConfirming((prev) => ({ ...prev, [track]: false }));
          return;
        }

        // 마감 뒤 취소만 별도 문구입니다. 서버는 POST와 같은 vote_closed를
        // 돌려주지만, 이 자리에서 그 말은 "투표가 마감됐어요"가 아니라
        // "취소할 수 없어요"여야 뜻이 맞습니다.
        setError((prev) => ({
          ...prev,
          [track]: errorPhrase(data.error === "vote_closed" ? "cancel_closed" : data.error),
        }));
        setConfirming((prev) => ({ ...prev, [track]: false }));
      } catch {
        setError((prev) => ({ ...prev, [track]: dict.vote.errGeneric }));
      } finally {
        setBusy(null);
      }
    },
    [busy, device, done, persistDone]
  );

  return (
    <div className="mt-10 flex flex-col gap-5 text-left">
      <MyTeamCard
        value={myTeam}
        locked={teamLocked}
        onChange={chooseMyTeam}
        t={t}
      />
      {VOTE_TRACKS.map((track) => (
        <VotePanel
          key={track}
          track={track}
          now={now}
          locale={locale}
          t={t}
          myTeam={myTeam}
          picked={picks[track]}
          done={done[track]}
          busy={busy === track}
          error={error[track]}
          needTeam={needTeam[track] === true}
          confirming={confirming[track] === true}
          onToggle={toggle}
          onSubmit={submit}
          onAskCancel={(tr, on) => setConfirming((prev) => ({ ...prev, [tr]: on }))}
          onCancel={cancel}
        />
      ))}
    </div>
  );
}

// ── 내 팀 ────────────────────────────────────────────────────────────────────
// 네이티브 select입니다. 21개 항목을 폰에서 고르는 데 iOS·안드로이드의 기본 피커를
// 이기는 커스텀 드롭다운은 없고, 이 화면은 전원이 폰으로 씁니다.
function MyTeamCard({
  value,
  locked,
  onChange,
  t,
}: {
  value: string;
  locked: boolean;
  onChange: (v: string) => void;
  t: (p: Phrase) => string;
}) {
  const optionCls = "bg-[#0d0d16] text-white";
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 sm:p-8">
      <label
        htmlFor="vote-my-team"
        className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-emerald-200/90"
      >
        {t(dict.vote.myTeamLabel)}
      </label>
      <p className="mt-2 break-keep text-sm leading-relaxed text-white/65">
        {t(dict.vote.myTeamHelp)}
      </p>
      <select
        id="vote-my-team"
        value={value}
        disabled={locked}
        onChange={(e) => onChange(e.target.value)}
        className="mt-4 min-h-[52px] w-full rounded-2xl border border-white/15 bg-white/[0.06] px-4 py-3 text-base font-semibold text-white outline-none transition focus-visible:border-emerald-400/60 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <option value="" disabled className={optionCls}>
          {t(dict.vote.myTeamPlaceholder)}
        </option>
        <option value={VOTER_TEAM_NONE} className={optionCls}>
          {t(dict.vote.myTeamNone)}
        </option>
        {VOTE_TRACKS.map((track) => (
          <optgroup key={track} label={t(dict.tracks.items[track - 1].title)} className={optionCls}>
            {VOTE_TEAMS[track].map((teamName) => (
              <option key={teamName} value={teamName} className={optionCls}>
                {teamName}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
      {locked && (
        <p className="mt-3 break-keep text-sm leading-relaxed text-white/50">
          {t(dict.vote.myTeamLocked)}
        </p>
      )}
    </div>
  );
}

// ── 트랙 패널 ────────────────────────────────────────────────────────────────
// 머리(번호 칩 · 대상 업무 · 트랙 이름)는 문제 설명이 있던 시절의 TrackPanel과 같은
// 어법입니다. 같은 자리에 같은 두 패널이 서 있다는 것이 8일을 보낸 참가자에게는
// 설명 한 줄보다 빠른 안내라서요. 바뀐 것은 본문뿐입니다.
function VotePanel({
  track,
  now,
  locale,
  t,
  myTeam,
  picked,
  done,
  busy,
  error,
  needTeam,
  confirming,
  onToggle,
  onSubmit,
  onAskCancel,
  onCancel,
}: {
  track: VoteTrack;
  now: number;
  locale: "ko" | "en";
  t: (p: Phrase) => string;
  myTeam: string;
  picked: string[];
  done: string[] | undefined;
  busy: boolean;
  error: Phrase | undefined;
  needTeam: boolean;
  confirming: boolean;
  onToggle: (track: VoteTrack, team: string) => void;
  onSubmit: (track: VoteTrack) => void;
  onAskCancel: (track: VoteTrack, on: boolean) => void;
  onCancel: (track: VoteTrack) => void;
}) {
  const meta = dict.tracks.items[track - 1];
  const state = voteWindowState(track, now);
  const need = VOTE_PICKS[track];
  const teams = VOTE_TEAMS[track];
  const full = picked.length >= need;
  const openTime = useMemo(() => formatVoteTime(VOTE_OPENS_AT[track], locale), [track, locale]);
  const closeTime = useMemo(() => formatVoteTime(VOTE_CLOSES_AT[track], locale), [track, locale]);

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 sm:p-9">
      <p className="flex items-center gap-2 text-[0.68rem] font-bold uppercase tracking-[0.16em] text-emerald-200/90">
        <span
          aria-hidden
          className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-emerald-400/25 bg-emerald-400/[0.08] text-[0.6rem] font-black text-emerald-200"
        >
          {meta.num}
        </span>
        {t(meta.kicker)}
      </p>
      <h3 className="mt-3 break-keep text-[clamp(1.35rem,3vw,2rem)] font-bold leading-snug text-white">
        {t(meta.title)}
      </h3>

      {/* 완료가 다른 무엇보다 먼저입니다. 보낸 사람에게 팀 목록을 다시 보여주면
          한 번 더 누를 수 있다는 뜻으로 읽혀요. */}
      {done !== undefined ? (
        <div className="mt-6 rounded-2xl border border-emerald-400/30 bg-emerald-400/[0.07] px-5 py-4">
          <p className="text-sm font-bold text-emerald-100">{t(dict.vote.doneTitle)}</p>
          {done.length > 0 && (
            <p className="mt-2 break-keep text-sm leading-relaxed text-white/80">
              <span className="text-white/50">{t(dict.vote.doneChoices)}</span>{" "}
              {done.join(", ")}
            </p>
          )}
          <p className="mt-2 break-keep text-sm leading-relaxed text-white/60">
            {t(state === "closed" ? dict.vote.doneBodyClosed : dict.vote.doneBody)}
          </p>

          {/* 취소. 마감 뒤에는 버튼 자체를 내립니다. 누를 수 없는 버튼을 남겨
              두면 눌러 보고 나서야 안 된다는 것을 알게 되고, 그때는 이미
              "왜 안 되지"가 됩니다. 서버도 같은 시각으로 거절합니다. */}
          {state === "open" &&
            (confirming ? (
              <div className="mt-4 border-t border-emerald-400/20 pt-4">
                <p className="break-keep text-sm font-bold text-white/85">
                  {t(dict.vote.cancelAsk)}
                </p>
                <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                  {/* 파괴적인 쪽을 두 번째에 둡니다. 폰에서 엄지가 먼저 닿는
                      자리에 "그대로 두기"가 오게 하려는 것이고, 이 확인 문구를
                      띄운 사람의 절반은 잘못 눌러서 온 사람입니다. */}
                  <button
                    type="button"
                    onClick={() => onAskCancel(track, false)}
                    disabled={busy}
                    className="min-h-[44px] w-full rounded-full border border-white/20 bg-white/[0.06] px-5 text-sm font-bold text-white/85 transition hover:border-white/35 hover:text-white disabled:opacity-40 sm:w-auto"
                  >
                    {t(dict.vote.cancelNo)}
                  </button>
                  <button
                    type="button"
                    onClick={() => onCancel(track)}
                    disabled={busy}
                    className="min-h-[44px] w-full rounded-full border border-amber-300/35 px-5 text-sm font-bold text-amber-100/90 transition hover:border-amber-300/60 hover:bg-amber-300/[0.08] disabled:opacity-40 sm:w-auto"
                  >
                    {t(busy ? dict.vote.cancelling : dict.vote.cancelYes)}
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => onAskCancel(track, true)}
                className="mt-4 inline-flex min-h-[44px] items-center justify-center rounded-full border border-white/15 px-5 text-sm font-semibold text-white/60 transition hover:border-white/30 hover:text-white/85"
              >
                {t(dict.vote.cancel)}
                <span className="sr-only"> {t(meta.title)}</span>
              </button>
            ))}

          {error && (
            <p role="alert" className="mt-3 break-keep text-sm font-semibold text-amber-200/90">
              {t(error)}
            </p>
          )}
        </div>
      ) : state === "before" ? (
        <div className="mt-6 rounded-2xl border border-white/12 bg-white/[0.03] px-5 py-4">
          <p className="text-sm font-bold text-white/85">{t(dict.vote.lockedTitle)}</p>
          <p className="mt-2 break-keep text-sm leading-relaxed text-white/60">
            {t(dict.vote.lockedBody).replace("{time}", openTime)}{" "}
            {/* 창이 40분입니다. 여는 시각만 적고 닫는 시각을 안 적으면, 점심 먹고
                돌아와서 찍으면 된다고 읽습니다. */}
            <span className="font-semibold text-white/80">
              {t(dict.vote.lockedClose).replace("{time}", closeTime)}
            </span>
          </p>
        </div>
      ) : state === "closed" ? (
        <div className="mt-6 rounded-2xl border border-white/12 bg-white/[0.03] px-5 py-4">
          <p className="text-sm font-bold text-white/85">{t(dict.vote.closedTitle)}</p>
          <p className="mt-2 break-keep text-sm leading-relaxed text-white/60">
            {t(dict.vote.closedBody)}
          </p>
        </div>
      ) : (
        <>
          <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1">
            <p className="text-sm font-bold text-white/85">
              {t(dict.vote.pickHint).replace("{n}", String(need))}
            </p>
            <span
              className={`rounded-full border px-2.5 py-0.5 text-[0.7rem] font-black ${
                full
                  ? "border-emerald-400/40 bg-emerald-400/[0.12] text-emerald-200"
                  : "border-white/15 bg-white/[0.05] text-white/60"
              }`}
            >
              {t(dict.vote.pickCount)
                .replace("{picked}", String(picked.length))
                .replace("{n}", String(need))}
            </span>
            {/* 마감 시각. 카운터와 같은 줄에 두되 한 단 낮은 톤입니다 — 지금 해야
                하는 일(고르기)이 먼저고, 언제까지인지가 그 다음이에요. */}
            <span className="text-[0.72rem] font-semibold text-amber-200/70">
              {t(dict.vote.closesAt).replace("{time}", closeTime)}
            </span>
          </div>

          {/* 발표 순서 그대로, 순번과 함께. 폰에서는 한 줄에 하나입니다. 두 열로
              놓으면 팀 이름이 긴 쪽("일단 돌려봤습니다")이 줄바꿈되면서 행 높이가
              들쭉날쭉해지고, 한 손으로 훑는 목록에서는 그게 그대로 오조작입니다. */}
          <ul role="list" className="mt-4 grid gap-2 sm:grid-cols-2">
            {teams.map((teamName, i) => {
              const isOwn = teamName === myTeam;
              const isPicked = picked.includes(teamName);
              const disabled = isOwn || busy || (full && !isPicked);
              return (
                <li key={teamName}>
                  <button
                    type="button"
                    onClick={() => onToggle(track, teamName)}
                    disabled={disabled}
                    aria-pressed={isPicked}
                    className={`flex min-h-[52px] w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition ${
                      isPicked
                        ? "border-emerald-400/60 bg-emerald-400/[0.14] text-white"
                        : "border-white/10 bg-white/[0.03] text-white/80"
                    } ${
                      disabled
                        ? "cursor-not-allowed opacity-45"
                        : "hover:border-emerald-400/40 hover:bg-emerald-400/[0.08] hover:text-white"
                    }`}
                  >
                    <span
                      aria-hidden
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border text-[0.62rem] font-black ${
                        isPicked
                          ? "border-emerald-400/50 bg-emerald-400/20 text-emerald-100"
                          : "border-white/12 bg-white/[0.05] text-white/55"
                      }`}
                    >
                      {i + 1}
                    </span>
                    <span className="break-keep text-[0.95rem] font-semibold leading-snug">
                      {teamName}
                    </span>
                    {isOwn && (
                      <span className="ml-auto shrink-0 rounded-full border border-white/15 bg-white/[0.06] px-2 py-0.5 text-[0.62rem] font-bold text-white/60">
                        {t(dict.vote.ownTeam)}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>

          {needTeam && (
            <p className="mt-4 break-keep text-sm font-semibold text-amber-200/90">
              {t(dict.vote.needTeam)}
            </p>
          )}
          {error && (
            <p role="alert" className="mt-4 break-keep text-sm font-semibold text-amber-200/90">
              {t(error)}
            </p>
          )}

          <button
            type="button"
            onClick={() => onSubmit(track)}
            disabled={!myTeam || !full || busy}
            className="mt-5 inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/[0.10] px-6 py-3 text-base font-bold text-emerald-100 transition hover:border-emerald-400/60 hover:bg-emerald-400/[0.18] hover:text-white disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
          >
            {t(busy ? dict.vote.submitting : dict.vote.submit)}
            <span className="sr-only"> {t(meta.title)}</span>
          </button>
        </>
      )}
    </div>
  );
}
