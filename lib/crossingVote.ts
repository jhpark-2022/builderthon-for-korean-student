// ─────────────────────────────────────────────────────────────────────────────
// 크로싱 서울 마지막 날 트랙별 인기투표(2026-10-17). 표는 crossing_votes(마이그레이션 0010).
//
// DECIDED 2026-10-17 (사용자: "인기투표 for one team for each of the track, 8월에도 있었던 것처럼. function은 만들어 놓되,
// frontend에는 그게 아직은 안보였으면"): 8월 day8_votes와 같은 규칙입니다. 무기명, 기기 하나에 트랙마다 한 표,
// 자기 팀에는 못 넣음, 한 번 내면 못 바꿈. 트랙마다 한 팀을 고릅니다. 팀의 트랙은 crossing_teams.track입니다.
//
// DECIDED 2026-10-19 (사용자: "8월 달이랑 다른데? 그거랑 같이 맞춰줘", "발표할때 각 트랙별로 점차 열리는 느낌"):
// 화면과 흐름을 8월(components/journey/Day8Vote.tsx, git 7de48c5^)에 맞췄습니다. 트랙마다 패널 하나, 발표 순서 번호가 붙은
// 팀 버튼, 트랙마다 따로 내기, 우리 팀을 먼저 고르기. 트랙은 각자 열리고 닫힙니다. 8월은 시각을 코드에 적었고,
// 12월은 crossing_tracks.vote_opens_at, vote_closes_at(0014)을 운영진이 표 편집기에서 넣습니다. 최종 판정은 서버 시계입니다.
//
// 여는 스위치는 둘입니다. 환경 변수 CROSSING_VOTE_OPEN=1(페이지와 API)과 아래 VOTE_BUTTON_OPEN(홈 Day 4 버튼).
// ─────────────────────────────────────────────────────────────────────────────

export const voteOpen = () => process.env.CROSSING_VOTE_OPEN === "1";
/**
 * 홈 Day 4 카드의 인기투표 버튼이 눌리는지. false면 버튼이 보이되 잠겨 있습니다(시간표 버튼 TIMETABLE_OPEN과 같은 문법).
 * DECIDED 2026-10-19 (사용자: "버튼이 4일차에 있으면 좋겠어, 그런데 지금은 disable"). 열 때는 이 값을 true로,
 * Vercel 환경 변수 CROSSING_VOTE_OPEN=1을 함께 켭니다. 하나만 켜면 버튼이 404로 가거나 페이지가 열려도 길이 없습니다.
 */
export const VOTE_BUTTON_OPEN = false;
export const VOTE_DEVICE_KEY = "crossing-vote-device";
export const VOTE_TEAM_KEY = "crossing-vote-team";
export const NO_TEAM = "NONE";
/** 트랙마다 고르는 팀 수. 2026-10-17 사용자: 트랙마다 한 팀. */
export const VOTE_PICKS = 1;
export const isUuid = (v: unknown): v is string =>
  typeof v === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);

export type VoteWindowState = "before" | "open" | "closed";

/** 이 트랙의 투표가 지금 어느 국면인가. 여는 시각이 비어 있으면 아직 열리지 않았습니다. 8월 voteWindowState와 같은 경계(>=). */
export function voteWindowState(opensAt: string | null, closesAt: string | null, now: number = Date.now()): VoteWindowState {
  if (closesAt && now >= Date.parse(closesAt)) return "closed";
  if (!opensAt || now < Date.parse(opensAt)) return "before";
  return "open";
}

/** 한국 시각 "오후 2:25" / "2:25 PM". 8월 formatVoteTime과 같은 이유로 Intl을 쓰지 않습니다(서버와 브라우저가 다른 글자를 냄). */
export function formatVoteTime(iso: string, locale: "ko" | "en"): string {
  const k = new Date(Date.parse(iso) + 9 * 60 * 60 * 1000);
  const h24 = k.getUTCHours();
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  const mm = String(k.getUTCMinutes()).padStart(2, "0");
  if (locale === "ko") return `${h24 < 12 ? "오전" : "오후"} ${h12}:${mm}`;
  return `${h12}:${mm} ${h24 < 12 ? "AM" : "PM"}`;
}

/** GET /api/crossing/vote가 내보내는 트랙 하나. teams는 발표 순서입니다. */
export type VoteTrackInfo = {
  id: string;
  label: { ko: string; en: string };
  color: string;
  opensAt: string | null;
  closesAt: string | null;
  state: VoteWindowState;
  teams: string[];
};
