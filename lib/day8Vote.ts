// ─────────────────────────────────────────────────────────────────────────────
// Day 8 빌더스 초이스 투표 — 단일 출처.
//
// 명단과 시각, 그리고 "몇 팀을 고르는가"가 여기 한 곳에 있습니다. 클라이언트
// 패널(components/journey/Day8Vote.tsx)과 서버 라우트(app/api/vote/route.ts)가
// 같은 파일을 읽어야 화면이 허용한 제출을 서버가 거절하는 일이 없습니다.
// lib/registrationWindow.ts와 같은 계약이에요: 화면은 시각을 보여줄 뿐이고,
// 실제로 막는 것은 서버입니다.
//
// server-only를 붙이지 않습니다. supabaseAdmin과 달리 여기엔 비밀이 없고, 브라우저
// 번들에 들어가야 패널이 오픈 시각과 명단을 그릴 수 있습니다.
//
// 오프셋(+08:00)을 문자열에 박아 둔 것이 핵심입니다. 이 코드를 읽는 곳의 시간대와
// 무관하게 같은 순간(SGT)을 가리킵니다. 서버는 UTC로 도는데 무대는 싱가포르에
// 있어서, 오프셋 없이 적으면 8시간이 조용히 틀립니다.
// ─────────────────────────────────────────────────────────────────────────────

export type VoteTrack = 1 | 2;

export const VOTE_TRACKS: readonly VoteTrack[] = [1, 2];

/**
 * 트랙별 오픈 시각 (epoch ms).
 *
 * 트랙 1은 12:50 PM. 트랙 1 발표가 12:59에 끝나므로 마지막 팀이 무대에 있는
 * 동안 투표가 열립니다. 발표가 다 끝난 뒤에 열면 점심시간에 흩어진 사람을
 * 다시 모아야 해요.
 * 트랙 2는 2:50 PM. 같은 이유로 트랙 2 발표(3:04 종료) 직전입니다.
 *
 * 진행이 밀리면 이 두 값만 옮기면 됩니다. 화면의 안내 문구는 이 상수를
 * Intl로 포맷해서 만들기 때문에 따로 고칠 카피가 없습니다.
 */
export const VOTE_OPENS_AT: Record<VoteTrack, number> = {
  1: new Date("2026-08-29T12:50:00+08:00").getTime(),
  2: new Date("2026-08-29T14:50:00+08:00").getTime(),
};

/**
 * 트랙별 마감 시각 (epoch ms).
 *
 * DECIDED 2026-08-28: 공통 3:20 PM 하나였던 것을 트랙별로 나눴습니다. 각 트랙의
 * 투표는 그 트랙 발표가 끝난 직후에 닫힙니다.
 *   트랙 1: 12:50 열림, 1:30 PM 닫힘 (발표는 12:59 종료, 점심 시간에 걸침)
 *   트랙 2: 2:50 열림, 3:20 PM 닫힘 (발표는 3:04 종료, 커리어 간담회 시작에 맞춤)
 *
 * UPDATED 2026-08-28 (진행덱 정본): 트랙 2 마감이 3:30에서 3:20으로 돌아왔습니다.
 * 진행덱 슬라이드 11이 "투표는 커리어 간담회 시작 전에 마감해요"라고 말하고,
 * 간담회는 3:20 시작입니다. 무대에서 읽는 문장과 서버 판정이 갈라지면 안 됩니다.
 *
 * 트랙 1을 오후 내내 열어두지 않는 이유는 기억입니다. 트랙 2 발표를 두 시간 보고
 * 나서 트랙 1을 뽑으면, 마지막에 본 것이 이깁니다. 발표 직후에 닫는 편이 공정해요.
 *
 * 대신 창이 좁습니다. 40분 안에 안 찍으면 그 표는 없습니다. 그래서 패널이 마감
 * 시각을 화면에 적습니다(dict.vote.closesAt · lockedClose).
 *
 * 집계는 3:30 이후 어워드(4:20 PM)까지 50분입니다.
 * (data/schedule.ts days[7].runOfShow가 이 시각들의 근거입니다.)
 */
export const VOTE_CLOSES_AT: Record<VoteTrack, number> = {
  1: new Date("2026-08-29T13:30:00+08:00").getTime(),
  2: new Date("2026-08-29T15:20:00+08:00").getTime(),
};

/** 두 트랙 중 가장 늦은 마감. "이제 볼 것이 없다"를 판정할 때만 씁니다. */
export const VOTE_LAST_CLOSE = Math.max(VOTE_CLOSES_AT[1], VOTE_CLOSES_AT[2]);

/**
 * 트랙별로 정확히 몇 팀을 고르는가.
 *
 * 트랙 1이 2표인 것은 팀이 트랙 2의 두 배(14 대 7)이기 때문입니다. 한 표씩이면
 * 트랙 1의 한 팀이 트랙 2의 한 팀보다 두 배 어려운 표를 받게 됩니다.
 */
export const VOTE_PICKS: Record<VoteTrack, number> = { 1: 2, 2: 1 };

/**
 * 발표팀 명단. 순서가 곧 발표 순서이고, 화면의 순번도 이 배열의 인덱스입니다.
 * 표기는 Day8_발표순서 정본 그대로입니다. 띄어쓰기 하나도 고치지 마세요.
 * 집계는 이 문자열로 묶이기 때문에, 표기가 갈리면 한 팀의 표가 둘로 쪼개집니다.
 */
export const VOTE_TEAMS: Record<VoteTrack, readonly string[]> = {
  1: [
    "AGENTS.md",
    "아보카도",
    "Alt F4",
    "Sheploy",
    "일단 돌려봤습니다",
    "KUDA12",
    "팀 Answer",
    "마일로",
    "스무스무",
    "AI Bot",
    "V1",
    "안녕즈",
    "404 FOUND",
    "버거킹",
  ],
  2: ["와싸-", "김동현 팀", "Ganache", "양하민 팀", "NCoded", "복학왕", "Kopi & Compile"],
};

/** "내 팀" 드롭다운에서 참가팀이 아닌 사람이 고르는 값. DB에도 이 문자열이 들어갑니다. */
export const VOTER_TEAM_NONE = "NONE";

/** 두 트랙의 21팀. "내 팀" 선택지와 서버 검증이 함께 읽습니다. */
export const ALL_VOTE_TEAMS: readonly string[] = [...VOTE_TEAMS[1], ...VOTE_TEAMS[2]];

export type VoteWindowState = "before" | "open" | "closed";

/** `now` 시점에 이 트랙 투표가 어느 국면인가. (기본값: 지금) */
export function voteWindowState(track: VoteTrack, now: number = Date.now()): VoteWindowState {
  if (now >= VOTE_CLOSES_AT[track]) return "closed";
  if (now < VOTE_OPENS_AT[track]) return "before";
  return "open";
}

/** 지금 이 트랙에 표를 받을 수 있는가. 서버 라우트의 최종 판정이 이 함수입니다. */
export function isVoteOpen(track: VoteTrack, now: number = Date.now()): boolean {
  return voteWindowState(track, now) === "open";
}

/** 임의의 입력이 트랙 번호인가. 라우트가 body를 좁힐 때 씁니다. */
export function isVoteTrack(v: unknown): v is VoteTrack {
  return v === 1 || v === 2;
}

// v4든 아니든 UUID 꼴이면 받습니다. 이 토큰은 신원이 아니라 기기 구분자일 뿐이고,
// 버전 비트까지 강제해서 얻을 것이 없습니다. 길이와 모양만 봅니다.
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** 기기 토큰이 UUID 꼴인가. */
export function isDeviceToken(v: unknown): v is string {
  return typeof v === "string" && UUID_RE.test(v);
}

/**
 * 오픈 시각을 로케일에 맞춰 사람이 읽는 문자열로. ko는 "오후 12:50", en은 "12:50 PM".
 *
 * 카피에 시각을 적지 않는 이유입니다. 진행이 밀려 위 상수를 옮기면 안내 문구가
 * 저절로 따라옵니다. 사전에 "12시 50분"을 박아두면 상수와 카피가 갈라져요.
 *
 * Intl.DateTimeFormat("ko-KR")을 쓰지 않습니다. 같은 입력에 Node(ICU 78)는
 * "PM 12:50"을, 브라우저는 "오후 12:50"을 내놓습니다. 서버 HTML과 클라이언트의
 * 첫 렌더가 다른 글자를 그리면 그 자리에서 하이드레이션이 어긋나요.
 * 싱가포르는 서머타임이 없는 고정 +08:00이라, 오프셋을 더하고 UTC 필드를 읽는
 * 것으로 충분합니다. 이 계산은 어느 엔진에서도 같은 값을 냅니다.
 */
export function formatVoteTime(at: number, locale: "ko" | "en"): string {
  const sgt = new Date(at + 8 * 60 * 60 * 1000);
  const h24 = sgt.getUTCHours();
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  const mm = String(sgt.getUTCMinutes()).padStart(2, "0");
  if (locale === "ko") return `${h24 < 12 ? "오전" : "오후"} ${h12}:${mm}`;
  return `${h12}:${mm} ${h24 < 12 ? "AM" : "PM"}`;
}
