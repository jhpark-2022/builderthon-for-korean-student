// ─────────────────────────────────────────────────────────────────────────────
// 크로싱 서울 마지막 날 트랙별 인기투표(2026-10-17). 표는 crossing_votes(마이그레이션 0010).
//
// DECIDED 2026-10-17 (사용자: "인기투표 for one team for each of the track, 8월에도 있었던 것처럼. function은 만들어 놓되,
// frontend에는 그게 아직은 안보였으면"): 8월 day8_votes와 같은 규칙입니다. 무기명, 기기 하나에 트랙마다 한 표,
// 자기 팀에는 못 넣음, 한 번 내면 못 바꿈. 트랙마다 한 팀을 고릅니다. 팀의 트랙은 crossing_teams.track입니다.
//
// 여는 스위치는 환경 변수 CROSSING_VOTE_OPEN=1 하나입니다. 꺼져 있으면 /crossing/vote는 404, API는 403입니다.
// 화면 어디에도 이 주소로 가는 링크가 없습니다.
// ─────────────────────────────────────────────────────────────────────────────

export const voteOpen = () => process.env.CROSSING_VOTE_OPEN === "1";
export const VOTE_DEVICE_KEY = "crossing-vote-device";
export const NO_TEAM = "NONE";
export const isUuid = (v: unknown): v is string =>
  typeof v === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
