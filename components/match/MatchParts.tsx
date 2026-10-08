"use client";

// ─────────────────────────────────────────────────────────────────────────────
// /match(크로싱 서울 현장 팀 매칭)가 테스트 앞뒤에 붙이는 두 조각 (2026-10-08, 현장 팀 매칭 브리프 3).
//
//   MatchStartFields  시작 화면의 이름과 나라. 둘 다 있어야 테스트가 시작됩니다.
//   MatchSave         결과 화면의 저장 표시. 결과가 나오는 순간 한 번 보내고, 같은 기기는 같은 행을 덮어씁니다.
//
// 공유 링크로 들어온 사람의 결과는 보내지 않습니다(자기 테스트를 해야 올라갑니다). 이름과 나라는 이 기기의
// localStorage에만 두고, 서버에는 저장 요청 때만 갑니다. 글자 크기는 BODY와 META 둘뿐입니다.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from "react";
import { BODY, META } from "@/components/ui/typography";
import { MATCH_PROFILE_KEY, MATCH_DEVICE_KEY, MATCH_SAVED_KEY } from "@/lib/storage";
import {
  MATCH_EVENT, MATCH_EDITION, MATCH_NAME_MAX, MATCH_COUNTRY_RE, MATCH_COUNTRY_OTHER, isMatchDeviceToken, matchWindowOpen,
} from "@/lib/crossingMatch";
import type { QuizResult } from "@/lib/quizScore";
import type { Result } from "@/data/quiz";
import { MATCH_TRACKS, isValidTrackRanking, type MatchTrack } from "@/data/matchTracks";

type T = (p: { ko: string; en: string }) => string;
/** tracks: 선호 트랙 순위(트랙 id, 앞이 1순위). 트랙 목록이 비어 있으면 언제나 []. */
export interface MatchProfile { name: string; country: string; tracks: string[] }

export const matchCopy = {
  nameLabel: { ko: "이름", en: "Name" },
  namePlaceholder: { ko: "현장에서 불리는 이름", en: "The name people call you on site" },
  countryLabel: { ko: "공부하는 나라", en: "Country you study in" },
  countryKR: { ko: "한국", en: "Korea" },
  countrySG: { ko: "싱가포르", en: "Singapore" },
  countryOther: { ko: "그 밖(두 글자 코드 입력)", en: "Elsewhere (two-letter code)" },
  choose: { ko: "골라 주세요", en: "Choose one" },
  tracksLabel: { ko: "풀고 싶은 트랙 순위", en: "Rank the tracks you want" },
  tracksHelp: { ko: "가장 하고 싶은 트랙부터 차례로 눌러 주세요. 다시 누르면 빠집니다.", en: "Tap the tracks in order, most wanted first. Tap again to remove." },
  tracksRank: { ko: "{n}순위", en: "No. {n}" },
  errTracks: { ko: "모든 트랙에 순위를 매겨 주세요.", en: "Please rank every track." },
  errName: { ko: "이름을 넣어 주세요.", en: "Please enter your name." },
  errCountry: { ko: "나라를 골라 주세요. 그 밖이면 두 글자 코드(예: JP)를 넣습니다.", en: "Please choose a country. For elsewhere, enter a two-letter code (e.g. JP)." },
  saving: { ko: "팀 매칭에 올리는 중입니다", en: "Adding you to team matching" },
  saved: { ko: "팀 매칭에 올라갔습니다", en: "You are on the team-matching board" },
  savedSub: { ko: "다시 하면 이 기기의 기록을 덮어씁니다.", en: "Retaking replaces this device's entry." },
  // 받는 기간 밖(지금은 행사 전의 미리 해 보기). 결과, 이미지 저장, 공유는 그대로 되고 매칭판에만 올라가지 않습니다.
  closed: { ko: "지금은 미리 해 보기입니다", en: "This is a preview run" },
  closedSub: { ko: "결과는 저장되지 않습니다. 팀 매칭은 Day 1 현장에서 엽니다.", en: "Your result is not saved. Team matching opens on site on Day 1." },
  failed: { ko: "올리지 못했습니다", en: "Could not add you" },
  retry: { ko: "다시 보내기", en: "Try again" },
  noProfile: { ko: "이름과 나라가 없어 올리지 못했습니다. 처음부터 다시 해 주세요.", en: "No name and country on this device. Please start again." },
} as const;

export function loadMatchProfile(): MatchProfile | null {
  try {
    const raw = window.localStorage.getItem(MATCH_PROFILE_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as Partial<MatchProfile>;
    if (typeof p.name !== "string" || typeof p.country !== "string") return null;
    // 저장된 순위가 지금 목록과 맞지 않으면(트랙이 바뀌었으면) 버리고 다시 받습니다.
    return { name: p.name, country: p.country, tracks: isValidTrackRanking(p.tracks) ? p.tracks : [] };
  } catch { return null; }
}
export function saveMatchProfile(p: MatchProfile): void {
  try { window.localStorage.setItem(MATCH_PROFILE_KEY, JSON.stringify(p)); } catch { /* storage blocked */ }
}
/** 문제 없으면 null. 이름은 1~40자, 나라는 두 글자 코드, 트랙이 있으면 전부 순위. tracks는 시험용(기본은 MATCH_TRACKS). */
export type MatchProfileError = "name" | "country" | "tracks";
export function matchProfileError(p: MatchProfile, tracks: MatchTrack[] = MATCH_TRACKS): MatchProfileError | null {
  const n = p.name.trim();
  if (!n || [...n].length > MATCH_NAME_MAX) return "name";
  if (!MATCH_COUNTRY_RE.test(p.country.trim().toUpperCase())) return "country";
  if (!isValidTrackRanking(p.tracks, tracks)) return "tracks";
  return null;
}

// 이 기기의 무작위 토큰. 투표(Day8Vote)와 같은 방식입니다. randomUUID가 없는 구형 브라우저는 getRandomValues로 만듭니다.
function deviceToken(): string | null {
  try {
    let token = window.localStorage.getItem(MATCH_DEVICE_KEY);
    if (isMatchDeviceToken(token)) return token;
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") token = crypto.randomUUID();
    else {
      const b = crypto.getRandomValues(new Uint8Array(16));
      b[6] = (b[6] & 0x0f) | 0x40; b[8] = (b[8] & 0x3f) | 0x80;
      const h = Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("");
      token = `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
    }
    window.localStorage.setItem(MATCH_DEVICE_KEY, token);
    return token;
  } catch { return null; }
}

const INPUT = `w-full rounded-xl border border-white/[0.12] bg-white/[0.04] px-4 py-3 ${BODY} text-white placeholder:text-white/40 outline-none transition focus:border-violet-400/60 focus:bg-white/[0.06]`;

export function MatchStartFields({ t, profile, onChange, error }: {
  t: T; profile: MatchProfile; onChange: (p: MatchProfile) => void; error: MatchProfileError | null;
}) {
  // 선호 트랙 순위(DECIDED 2026-10-08, 사용자: 필수, 전부 순위). 누른 순서가 곧 순위이고 다시 누르면 빠지며 뒤 순위가
  // 당겨집니다. 끌어 옮기기는 쓰지 않습니다(폰 한 손, 스크린리더). 버튼마다 aria-pressed와 순위를 읽어 줍니다.
  // 목록(data/matchTracks.ts)이 비어 있으면 이 블록은 그려지지 않습니다.
  const toggleTrack = (id: string) => {
    const has = profile.tracks.includes(id);
    onChange({ ...profile, tracks: has ? profile.tracks.filter((x) => x !== id) : [...profile.tracks, id] });
  };
  // 나라 select는 KR, SG, 그 밖 셋. 그 밖이면 두 글자 코드를 직접 넣습니다(신청 폼과 같은 방식).
  const known = profile.country === "KR" || profile.country === "SG";
  const [other, setOther] = useState(!known && profile.country !== "");
  const selectValue = known ? profile.country : other ? MATCH_COUNTRY_OTHER : "";
  return (
    <div className="mt-8 flex w-full max-w-sm flex-col gap-4 text-left">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="match-name" className={`${META} font-semibold text-white/85`}>{t(matchCopy.nameLabel)}</label>
        <input
          id="match-name" type="text" autoComplete="off" maxLength={MATCH_NAME_MAX} value={profile.name}
          onChange={(e) => onChange({ ...profile, name: e.target.value })}
          placeholder={t(matchCopy.namePlaceholder)} className={INPUT}
          aria-invalid={error === "name" || undefined} aria-describedby={error === "name" ? "match-name-error" : undefined}
        />
        {error === "name" && <span id="match-name-error" role="alert" className={`${META} font-medium text-rose-300`}>{t(matchCopy.errName)}</span>}
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="match-country" className={`${META} font-semibold text-white/85`}>{t(matchCopy.countryLabel)}</label>
        <select
          id="match-country" value={selectValue} className={`${INPUT} appearance-none`}
          onChange={(e) => {
            const v = e.target.value;
            setOther(v === MATCH_COUNTRY_OTHER);
            onChange({ ...profile, country: v === MATCH_COUNTRY_OTHER ? "" : v });
          }}
          aria-invalid={error === "country" || undefined} aria-describedby={error === "country" ? "match-country-error" : undefined}
        >
          <option value="">{t(matchCopy.choose)}</option>
          <option value="KR">{t(matchCopy.countryKR)}</option>
          <option value="SG">{t(matchCopy.countrySG)}</option>
          <option value={MATCH_COUNTRY_OTHER}>{t(matchCopy.countryOther)}</option>
        </select>
        {other && (
          <input
            type="text" maxLength={2} value={profile.country} placeholder="JP" aria-label={t(matchCopy.countryOther)}
            onChange={(e) => onChange({ ...profile, country: e.target.value.toUpperCase().replace(/[^A-Z]/g, "") })}
            className={`${INPUT} uppercase`}
          />
        )}
        {error === "country" && <span id="match-country-error" role="alert" className={`${META} font-medium text-rose-300`}>{t(matchCopy.errCountry)}</span>}
      </div>
      {MATCH_TRACKS.length > 0 && (
        <div role="group" aria-labelledby="match-tracks-label" aria-describedby={error === "tracks" ? "match-tracks-help match-tracks-error" : "match-tracks-help"} className="flex flex-col gap-1.5">
          <span id="match-tracks-label" className={`${META} font-semibold text-white/85`}>{t(matchCopy.tracksLabel)}</span>
          <span id="match-tracks-help" className={`${META} text-white/70`}>{t(matchCopy.tracksHelp)}</span>
          <div className="mt-1 flex flex-col gap-2">
            {MATCH_TRACKS.map((tr, i) => {
              const rank = profile.tracks.indexOf(tr.id) + 1;
              return (
                <button
                  key={tr.id} id={i === 0 ? "match-tracks" : undefined} type="button" aria-pressed={rank > 0} data-track={tr.id} onClick={() => toggleTrack(tr.id)}
                  className={`flex min-h-[48px] items-center gap-3 rounded-xl border px-4 py-3 text-left transition ${rank > 0 ? "border-violet-400/70 bg-violet-400/[0.12]" : "border-white/[0.12] bg-white/[0.04] hover:border-white/25"}`}
                >
                  <span aria-hidden className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${META} font-bold ${rank > 0 ? "border-violet-300 bg-violet-500 text-white" : "border-white/25 text-white/60"}`}>{rank > 0 ? rank : ""}</span>
                  <span className="min-w-0">
                    <span className={`block break-keep ${BODY} font-bold leading-snug text-white`}>{t(tr.label)}</span>
                    {tr.hint && <span className={`mt-0.5 block break-keep ${META} text-white/70`}>{t(tr.hint)}</span>}
                  </span>
                  {rank > 0 && <span className="sr-only">{t(matchCopy.tracksRank).replace("{n}", String(rank))}</span>}
                </button>
              );
            })}
          </div>
          {error === "tracks" && <span id="match-tracks-error" role="alert" className={`${META} font-medium text-rose-300`}>{t(matchCopy.errTracks)}</span>}
        </div>
      )}
    </div>
  );
}

type SaveState = "idle" | "saving" | "saved" | "closed" | "failed" | "no_profile";

export function MatchSave({ t, result, data, fromShare }: { t: T; result: QuizResult; data: Result; fromShare: boolean }) {
  const [state, setState] = useState<SaveState>("idle");
  const sent = useRef<string | null>(null);

  const send = async () => {
    const profile = loadMatchProfile();
    const token = deviceToken();
    if (!profile || matchProfileError(profile) || !token) { setState("no_profile"); return; }
    if (!matchWindowOpen()) { setState("closed"); return; }
    setState("saving");
    try {
      const axes = Object.fromEntries((result.axes ?? []).map((a) => [a.axis, { winner: a.winner, pct: a.pct }]));
      const res = await fetch("/api/crossing/match", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          eventSlug: MATCH_EVENT, quiz_edition: MATCH_EDITION,
          name: profile.name.trim(), study_country: profile.country.trim().toUpperCase(),
          mbti: result.mbti, identity: result.identity, model: data.model, role_key: data.roleKey,
          axes, track_ranking: profile.tracks, device_token: token, url_confirm: "",
        }),
      });
      if (res.ok) {
        try { window.localStorage.setItem(MATCH_SAVED_KEY, result.resultId); } catch { /* ignore */ }
        setState("saved");
      } else setState(res.status === 403 ? "closed" : "failed");
    } catch { setState("failed"); }
  };

  useEffect(() => {
    if (fromShare) return;                      // 남의 결과는 올리지 않습니다
    if (sent.current === result.resultId) return;
    sent.current = result.resultId;
    let already: string | null = null;
    try { already = window.localStorage.getItem(MATCH_SAVED_KEY); } catch { /* ignore */ }
    // 방금 끝낸 테스트(축 점수가 있음)는 언제나 보냅니다. 새로고침으로 다시 본 같은 결과는 다시 보내지 않습니다.
    if (already === result.resultId && !result.axes) { setState("saved"); return; }
    void send();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result.resultId, fromShare]);

  if (fromShare || state === "idle") return null;
  const tone = state === "saved" ? "border-emerald-400/30 bg-emerald-400/[0.08]" : state === "saving" || state === "closed" ? "border-white/15 bg-white/[0.05]" : "border-amber-400/30 bg-amber-400/[0.08]";
  const title = state === "saved" ? matchCopy.saved : state === "saving" ? matchCopy.saving : state === "closed" ? matchCopy.closed : state === "no_profile" ? matchCopy.noProfile : matchCopy.failed;
  const sub = state === "saved" ? matchCopy.savedSub : state === "closed" ? matchCopy.closedSub : null;
  return (
    <div role="status" aria-live="polite" data-match-save={state} className={`mb-5 w-full max-w-xl rounded-2xl border px-5 py-3 text-center ${tone}`}>
      <p className={`${BODY} font-bold text-white`}>{state === "saved" && <span aria-hidden className="mr-1.5 text-emerald-300">✓</span>}{t(title)}</p>
      {sub && <p className={`mt-0.5 ${META} text-white/70`}>{t(sub)}</p>}
      {state === "failed" && (
        <button type="button" onClick={() => void send()} className={`mt-2 inline-flex min-h-[44px] items-center rounded-full border border-white/25 bg-white/[0.06] px-5 ${BODY} font-semibold text-white`}>{t(matchCopy.retry)}</button>
      )}
    </div>
  );
}
