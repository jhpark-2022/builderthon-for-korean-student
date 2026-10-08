"use client";

// ─────────────────────────────────────────────────────────────────────────────
// /match(크로싱 서울 현장 팀 매칭)가 테스트 앞뒤에 붙이는 두 조각 (2026-10-08, 현장 팀 매칭 브리프 3).
//
//   MatchStartFields  시작 화면의 이름과 나라. 둘 다 있어야 테스트가 시작됩니다.
//   MatchSave         결과 화면의 저장 표시. 결과가 나오는 순간 한 번 보내고, 같은 기기는 같은 행을 덮어씁니다.
//
// 공유 링크로 들어온 사람의 결과는 보내지 않습니다(자기 테스트를 해야 올라갑니다). 이름과 나라는 이 기기의
// localStorage에만 두고, 서버에는 저장 요청 때만 갑니다. 글자 크기는 BODY와 META 둘뿐입니다.
//
// DECIDED 2026-10-08 (퀴즈와 매칭 리뷰 2~7, 10, 행사 당일 대비):
//   - 저장 요청은 10초에 끊고 "다시 보내기"를 냅니다. 행사장 와이파이가 멈추면 "올리는 중"에 갇혔습니다.
//   - 같은 결과와 같은 프로필을 이미 올렸으면 새로고침해도 다시 보내지 않습니다(결과 id와 프로필을 묶은 표시).
//   - 이미 올라간 기록이 있는데 다시 보내기가 실패하면 "올리지 못했습니다"로 덮지 않고 그 사실을 말합니다.
//   - 이름, 나라, 트랙 순위가 비었으면 시작 화면으로 돌려보내 무엇이 비었는지 말합니다. 14문항을 다시 풀지 않습니다.
//   - 받는 기간이 끝난 뒤에는 "미리 해 보기"가 아니라 "접수가 끝났습니다"입니다.
//   - 글자 입력은 text-base(18px)입니다. BODY는 폰에서 15.75px이라 iOS가 칸을 누를 때 화면을 확대했습니다.
//     데스크톱의 BODY와 같은 크기라 새 크기는 아닙니다.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from "react";
import { BODY, META } from "@/components/ui/typography";
import { MATCH_PROFILE_KEY, MATCH_DEVICE_KEY, MATCH_SAVED_KEY } from "@/lib/storage";
import {
  MATCH_EVENT, MATCH_EDITION, MATCH_NAME_MAX, MATCH_COUNTRY_RE, MATCH_COUNTRY_OTHER, MATCH_CODE_MAX, MATCH_CODE_FIELD_ON,
  isMatchDeviceToken, matchWindowState, normalizeMatchCode,
} from "@/lib/crossingMatch";
import type { QuizResult } from "@/lib/quizScore";
import type { Result } from "@/data/quiz";
import { MATCH_TRACKS, isValidTrackRanking, type MatchTrack } from "@/data/matchTracks";

type T = (p: { ko: string; en: string }) => string;
/** tracks: 선호 트랙 순위(트랙 id, 앞이 1순위). 트랙 목록이 비어 있으면 언제나 []. */
export interface MatchProfile { name: string; country: string; tracks: string[]; /** 현장 코드(있을 때만). 서버가 요구할 때만 쓰입니다. */ code?: string }

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
  // 받는 기간이 끝난 뒤.
  ended: { ko: "팀 매칭 접수가 끝났습니다", en: "Team matching is closed" },
  endedSub: { ko: "결과는 볼 수 있지만 매칭판에는 올라가지 않습니다.", en: "You can still see your result, but it is no longer added to the board." },
  failed: { ko: "올리지 못했습니다", en: "Could not add you" },
  failedSub: { ko: "연결이 느리거나 끊겼습니다. 결과는 이 기기에 남아 있으니 다시 보내면 됩니다.", en: "The connection is slow or dropped. Your result is kept on this device, so just send it again." },
  // 전에 올린 기록은 남아 있고, 방금 바꾼 내용만 가지 못한 경우.
  failedKept: { ko: "바뀐 내용을 올리지 못했습니다", en: "Your update did not go through" },
  failedKeptSub: { ko: "전에 올린 기록은 매칭판에 그대로 있습니다.", en: "Your earlier entry is still on the board." },
  retry: { ko: "다시 보내기", en: "Try again" },
  // 서버가 요청의 모양을 받지 못한 경우(대개 열어 둔 화면이 오래됨).
  reload: { ko: "화면이 오래됐습니다", en: "This page is out of date" },
  reloadSub: { ko: "새로고침하면 결과는 그대로 남고 다시 올라갑니다.", en: "Reload and your result stays and is sent again." },
  reloadCta: { ko: "새로고침", en: "Reload" },
  // 무엇이 비었는지 말합니다. 미리 해 본 기기는 트랙 순위 없이 저장돼 있습니다.
  noProfileName: { ko: "이름이 없어 올리지 못했습니다", en: "Your name is missing, so nothing was added" },
  noProfileCountry: { ko: "공부하는 나라가 없어 올리지 못했습니다", en: "Your country is missing, so nothing was added" },
  noProfileTracks: { ko: "트랙 순위가 없어 올리지 못했습니다", en: "Your track ranking is missing, so nothing was added" },
  noProfileSub: { ko: "시작 화면에서 채우면 됩니다. 테스트는 다시 하지 않아도 됩니다.", en: "Fill it in on the start screen. You do not need to retake the test." },
  noProfileCta: { ko: "돌아가서 채우기", en: "Go back and fill it in" },
  noStorage: { ko: "이 브라우저가 저장을 막고 있어 올리지 못했습니다", en: "This browser is blocking storage, so nothing was added" },
  noStorageSub: { ko: "사생활 보호 모드를 끄거나 다른 브라우저로 열어 주세요.", en: "Turn off private mode or open this in another browser." },
  // 현장 코드.
  codeLabel: { ko: "현장 코드", en: "Room code" },
  codeHelp: { ko: "현장 화면에 보이는 코드입니다.", en: "The code shown on the screen in the room." },
  codeWrong: { ko: "현장 코드를 넣어 주세요", en: "Please enter the room code" },
  codeWrongSub: { ko: "현장 화면에 보이는 코드를 넣고 다시 보내면 됩니다.", en: "Enter the code shown in the room and send again." },
  // 시작 화면: 결과가 이미 있고 프로필만 고치러 온 경우의 버튼.
  resume: { ko: "저장하고 결과로 돌아가기", en: "Save and return to my result" },
} as const;

export function loadMatchProfile(): MatchProfile | null {
  try {
    const raw = window.localStorage.getItem(MATCH_PROFILE_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as Partial<MatchProfile>;
    if (typeof p.name !== "string" || typeof p.country !== "string") return null;
    // 저장된 순위가 지금 목록과 맞지 않으면(트랙이 바뀌었으면) 버리고 다시 받습니다.
    return { name: p.name, country: p.country, tracks: isValidTrackRanking(p.tracks) ? p.tracks : [], ...(typeof p.code === "string" && p.code ? { code: normalizeMatchCode(p.code) } : {}) };
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

/** 이 결과와 이 프로필을 이미 올렸는가를 가리는 표시. 현장 코드는 넣지 않습니다. */
export const matchSavedSig = (resultId: string, p: MatchProfile): string =>
  [resultId, p.name.trim(), p.country.trim().toUpperCase(), p.tracks.join(",")].join("|");

// 테두리 white/45는 바탕 위 3:1(WCAG 1.4.11), 플레이스홀더 white/55는 6.2:1입니다(접근성 감사 6, 7).
// 포커스는 전역 :focus-visible 링이 맡고, 테두리는 나루의 accent로 바뀝니다. 글자는 text-base(머리말).
const INPUT = "w-full rounded-xl border border-white/45 bg-white/[0.04] px-4 py-3 text-base text-white placeholder:text-white/55 outline-none transition focus:border-accent focus:bg-white/[0.06]";

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
  // "그 밖"은 저장된 프로필에서 다시 읽습니다. 처음 상태로만 두면 프로필이 마운트 뒤에 채워져(localStorage) JP로
  // 저장한 사람이 "골라 주세요"와 숨은 코드 칸을 봤습니다(퀴즈와 매칭 리뷰 10).
  const known = profile.country === "KR" || profile.country === "SG";
  const [pickedOther, setPickedOther] = useState(false);
  const other = !known && (pickedOther || profile.country !== "");
  const selectValue = known ? profile.country : other ? MATCH_COUNTRY_OTHER : "";
  return (
    <div className="mt-8 flex w-full max-w-sm flex-col gap-4 text-left">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="match-name" className={`${META} font-semibold text-white/85`}>{t(matchCopy.nameLabel)}</label>
        <input
          id="match-name" type="text" autoComplete="name" required aria-required="true" maxLength={MATCH_NAME_MAX} value={profile.name}
          onChange={(e) => onChange({ ...profile, name: e.target.value })}
          placeholder={t(matchCopy.namePlaceholder)} className={INPUT}
          aria-invalid={error === "name" || undefined} aria-describedby={error === "name" ? "match-name-error" : undefined}
        />
        {error === "name" && <span id="match-name-error" role="alert" className={`${META} font-medium text-rose-300`}>{t(matchCopy.errName)}</span>}
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="match-country" className={`${META} font-semibold text-white/85`}>{t(matchCopy.countryLabel)}</label>
        <select
          id="match-country" value={selectValue} required aria-required="true" className={`${INPUT} appearance-none`}
          onChange={(e) => {
            const v = e.target.value;
            setPickedOther(v === MATCH_COUNTRY_OTHER);
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
            id="match-country-code" type="text" maxLength={2} value={profile.country} placeholder="JP" aria-label={t(matchCopy.countryOther)}
            required aria-required="true" autoComplete="off" autoCapitalize="characters" autoCorrect="off" spellCheck={false}
            aria-invalid={error === "country" || undefined} aria-describedby={error === "country" ? "match-country-error" : undefined}
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
                  className={`flex min-h-[48px] items-center gap-3 rounded-xl border px-4 py-3 text-left transition ${rank > 0 ? "border-accent/70 bg-accent/[0.12]" : "border-white/45 bg-white/[0.04] hover:border-white/60"}`}
                >
                  <span aria-hidden className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${META} font-bold ${rank > 0 ? "border-accent bg-naru-purple text-white" : "border-white/45 text-white/60"}`}>{rank > 0 ? rank : ""}</span>
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
      {/* 현장 코드. 서버가 요구하도록 켰을 때만 보입니다. QR 주소에 실려 왔으면 이미 채워져 있습니다. */}
      {MATCH_CODE_FIELD_ON && (
        <div className="flex flex-col gap-1.5">
          <label htmlFor="match-code" className={`${META} font-semibold text-white/85`}>{t(matchCopy.codeLabel)}</label>
          <input
            id="match-code" type="text" autoComplete="off" autoCapitalize="characters" autoCorrect="off" spellCheck={false}
            maxLength={MATCH_CODE_MAX} value={profile.code ?? ""} aria-describedby="match-code-help"
            onChange={(e) => onChange({ ...profile, code: normalizeMatchCode(e.target.value) })}
            className={`${INPUT} uppercase`}
          />
          <span id="match-code-help" className={`${META} text-white/70`}>{t(matchCopy.codeHelp)}</span>
        </div>
      )}
    </div>
  );
}

type SaveState = "idle" | "saving" | "saved" | "preview" | "ended" | "failed" | "failed_kept" | "reload" | "no_profile" | "no_storage" | "code";
const SAVE_TIMEOUT_MS = 10_000;
const GHOST = `inline-flex min-h-[44px] items-center rounded-full border border-white/25 bg-white/[0.06] px-5 ${BODY} font-semibold text-white transition hover:bg-white/10`;

function readSavedSig(): string | null {
  try { return window.localStorage.getItem(MATCH_SAVED_KEY); } catch { return null; }
}

export function MatchSave({ t, result, data, fromShare, onFixProfile }: {
  t: T; result: QuizResult; data: Result; fromShare: boolean;
  /** 프로필이 비었을 때 시작 화면으로 돌려보냅니다(결과는 그대로 둡니다). */
  onFixProfile?: (problem: MatchProfileError) => void;
}) {
  const [state, setState] = useState<SaveState>("idle");
  const [problem, setProblem] = useState<MatchProfileError>("name");
  const [code, setCode] = useState("");
  const sent = useRef<string | null>(null);
  const busy = useRef(false);

  const send = async (codeOverride?: string) => {
    if (busy.current) return;                     // 두 번 누르기
    let profile = loadMatchProfile();
    const token = deviceToken();
    if (!token) { setState("no_storage"); return; }
    const err = profile ? matchProfileError(profile) : "name";
    if (!profile || err) { setProblem(err ?? "name"); setState("no_profile"); return; }
    if (codeOverride !== undefined) { profile = { ...profile, code: normalizeMatchCode(codeOverride) }; saveMatchProfile(profile); }
    const sig = matchSavedSig(result.resultId, profile);
    const prior = readSavedSig();
    // 끝난 뒤에는 보내지 않습니다. 전에 올린 적이 있으면 그 사실을 보여 줍니다.
    if (matchWindowState() === "after") { setState(prior ? "saved" : "ended"); return; }
    // 받기 전("미리 해 보기")에도 서버에 묻습니다. 열어 둔 탭의 번들이 오래돼 opensAt을 모를 수 있기 때문입니다.
    // 서버는 기간 밖이면 표에 닿기 전에 403을 돌려줍니다.
    busy.current = true;
    setState("saving");
    const ctl = new AbortController();
    const timer = window.setTimeout(() => ctl.abort(), SAVE_TIMEOUT_MS);
    try {
      const axes = Object.fromEntries((result.axes ?? []).map((a) => [a.axis, { winner: a.winner, pct: a.pct }]));
      const res = await fetch("/api/crossing/match", {
        method: "POST",
        headers: { "content-type": "application/json" },
        signal: ctl.signal,
        body: JSON.stringify({
          eventSlug: MATCH_EVENT, quiz_edition: MATCH_EDITION,
          name: profile.name.trim(), study_country: profile.country.trim().toUpperCase(),
          mbti: result.mbti, identity: result.identity, model: data.model, role_key: data.roleKey,
          axes, track_ranking: profile.tracks, device_token: token, url_confirm: "",
          ...(profile.code ? { room_code: profile.code } : {}),
        }),
      });
      if (res.ok) {
        try { window.localStorage.setItem(MATCH_SAVED_KEY, sig); } catch { /* ignore */ }
        setState("saved");
        return;
      }
      const body: unknown = await res.json().catch(() => null);
      const code403 = typeof body === "object" && body !== null && "error" in body ? (body as { error?: unknown }).error : null;
      if (res.status === 403 && code403 === "invalid_code") { setCode(profile.code ?? ""); setState("code"); }
      else if (res.status === 403) setState(matchWindowState() === "after" ? "ended" : "preview");
      else if (res.status === 400) setState("reload");
      else setState(prior ? "failed_kept" : "failed");
    } catch { setState(prior ? "failed_kept" : "failed"); }
    finally { window.clearTimeout(timer); busy.current = false; }
  };

  useEffect(() => {
    if (fromShare) return;                      // 남의 결과는 올리지 않습니다
    if (sent.current === result.resultId) return;
    sent.current = result.resultId;
    // 같은 결과, 같은 프로필을 이미 올렸으면 다시 보내지 않습니다(새로고침, "지난 결과 다시 보기").
    // 이름이나 순위를 고쳤으면 표시가 달라져 한 번 다시 보냅니다.
    const profile = loadMatchProfile();
    if (profile && !matchProfileError(profile) && readSavedSig() === matchSavedSig(result.resultId, profile)) { setState("saved"); return; }
    void send();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result.resultId, fromShare]);

  if (fromShare || state === "idle") return null;
  const quiet = state === "saving" || state === "preview" || state === "ended";
  const tone = state === "saved" ? "border-emerald-400/30 bg-emerald-400/[0.08]" : quiet ? "border-white/15 bg-white/[0.05]" : "border-amber-400/30 bg-amber-400/[0.08]";
  const copy: Record<Exclude<SaveState, "idle">, { title: { ko: string; en: string }; sub: { ko: string; en: string } | null }> = {
    saving: { title: matchCopy.saving, sub: null },
    saved: { title: matchCopy.saved, sub: matchCopy.savedSub },
    preview: { title: matchCopy.closed, sub: matchCopy.closedSub },
    ended: { title: matchCopy.ended, sub: matchCopy.endedSub },
    failed: { title: matchCopy.failed, sub: matchCopy.failedSub },
    failed_kept: { title: matchCopy.failedKept, sub: matchCopy.failedKeptSub },
    reload: { title: matchCopy.reload, sub: matchCopy.reloadSub },
    no_profile: { title: problem === "tracks" ? matchCopy.noProfileTracks : problem === "country" ? matchCopy.noProfileCountry : matchCopy.noProfileName, sub: matchCopy.noProfileSub },
    no_storage: { title: matchCopy.noStorage, sub: matchCopy.noStorageSub },
    code: { title: matchCopy.codeWrong, sub: matchCopy.codeWrongSub },
  };
  const { title, sub } = copy[state];
  return (
    <div role="status" aria-live="polite" data-match-save={state} className={`mb-5 w-full max-w-xl rounded-2xl border px-5 py-3 text-center ${tone}`}>
      <p className={`${BODY} font-bold text-white`}>{state === "saved" && <span aria-hidden className="mr-1.5 text-emerald-300">✓</span>}{t(title)}</p>
      {sub && <p className={`mt-0.5 ${META} text-white/70`}>{t(sub)}</p>}
      {(state === "failed" || state === "failed_kept") && (
        <button type="button" onClick={() => void send()} className={`mt-2 ${GHOST}`}>{t(matchCopy.retry)}</button>
      )}
      {state === "reload" && (
        <button type="button" onClick={() => window.location.reload()} className={`mt-2 ${GHOST}`}>{t(matchCopy.reloadCta)}</button>
      )}
      {state === "no_profile" && onFixProfile && (
        <button type="button" onClick={() => onFixProfile(problem)} className={`mt-2 ${GHOST}`}>{t(matchCopy.noProfileCta)}</button>
      )}
      {state === "code" && (
        <form className="mx-auto mt-3 flex w-full max-w-xs flex-col gap-2" onSubmit={(e) => { e.preventDefault(); void send(code); }}>
          <label htmlFor="match-save-code" className="sr-only">{t(matchCopy.codeLabel)}</label>
          <input
            id="match-save-code" type="text" autoComplete="off" autoCapitalize="characters" autoCorrect="off" spellCheck={false}
            maxLength={MATCH_CODE_MAX} value={code} onChange={(e) => setCode(normalizeMatchCode(e.target.value))}
            placeholder={t(matchCopy.codeLabel)} className={`${INPUT} text-center uppercase`}
          />
          <button type="submit" className={`justify-center ${GHOST}`}>{t(matchCopy.retry)}</button>
        </form>
      )}
    </div>
  );
}
