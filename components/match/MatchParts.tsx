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

type T = (p: { ko: string; en: string }) => string;
export interface MatchProfile { name: string; country: string }

export const matchCopy = {
  nameLabel: { ko: "이름", en: "Name" },
  namePlaceholder: { ko: "현장에서 불리는 이름", en: "The name people call you on site" },
  countryLabel: { ko: "공부하는 나라", en: "Country you study in" },
  countryKR: { ko: "한국", en: "Korea" },
  countrySG: { ko: "싱가포르", en: "Singapore" },
  countryOther: { ko: "그 밖(두 글자 코드 입력)", en: "Elsewhere (two-letter code)" },
  choose: { ko: "골라 주세요", en: "Choose one" },
  errName: { ko: "이름을 넣어 주세요.", en: "Please enter your name." },
  errCountry: { ko: "나라를 골라 주세요. 그 밖이면 두 글자 코드(예: JP)를 넣습니다.", en: "Please choose a country. For elsewhere, enter a two-letter code (e.g. JP)." },
  saving: { ko: "팀 매칭에 올리는 중입니다", en: "Adding you to team matching" },
  saved: { ko: "팀 매칭에 올라갔습니다", en: "You are on the team-matching board" },
  savedSub: { ko: "다시 하면 이 기기의 기록을 덮어씁니다.", en: "Retaking replaces this device's entry." },
  closed: { ko: "팀 매칭 기간이 아닙니다", en: "Team matching is not open right now" },
  closedSub: { ko: "결과는 볼 수 있지만 매칭판에는 올라가지 않습니다.", en: "You can see your result, but it is not added to the board." },
  failed: { ko: "올리지 못했습니다", en: "Could not add you" },
  retry: { ko: "다시 보내기", en: "Try again" },
  noProfile: { ko: "이름과 나라가 없어 올리지 못했습니다. 처음부터 다시 해 주세요.", en: "No name and country on this device. Please start again." },
} as const;

export function loadMatchProfile(): MatchProfile | null {
  try {
    const raw = window.localStorage.getItem(MATCH_PROFILE_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as Partial<MatchProfile>;
    return typeof p.name === "string" && typeof p.country === "string" ? { name: p.name, country: p.country } : null;
  } catch { return null; }
}
export function saveMatchProfile(p: MatchProfile): void {
  try { window.localStorage.setItem(MATCH_PROFILE_KEY, JSON.stringify(p)); } catch { /* storage blocked */ }
}
/** 문제 없으면 null. 이름은 1~40자, 나라는 두 글자 코드. */
export function matchProfileError(p: MatchProfile): "name" | "country" | null {
  const n = p.name.trim();
  if (!n || [...n].length > MATCH_NAME_MAX) return "name";
  if (!MATCH_COUNTRY_RE.test(p.country.trim().toUpperCase())) return "country";
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
  t: T; profile: MatchProfile; onChange: (p: MatchProfile) => void; error: "name" | "country" | null;
}) {
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
          axes, device_token: token, url_confirm: "",
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
  const tone = state === "saved" ? "border-emerald-400/30 bg-emerald-400/[0.08]" : state === "saving" ? "border-white/15 bg-white/[0.05]" : "border-amber-400/30 bg-amber-400/[0.08]";
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
