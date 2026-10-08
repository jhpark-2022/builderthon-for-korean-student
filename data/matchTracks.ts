// ─────────────────────────────────────────────────────────────────────────────
// 크로싱 서울 트랙 목록. /match에서 선호 순위를 받는 데 씁니다 (DECIDED 2026-10-08, 사용자).
//
// **지금은 비어 있습니다.** 12월의 트랙(셋이 될 예정)이 아직 정해지지 않았습니다. 목록이 비어 있는 동안
// /match 시작 화면에 순위 선택이 나오지 않고, 라우트는 빈 순위([])만 받습니다. 트랙이 정해지면 여기에
// 줄을 더하면 켜집니다: 화면에 순위 선택이 나오고(필수, 전부 순위를 매겨야 시작), 라우트가 "목록의 모든
// 트랙이 한 번씩 든 순서"인지 검사하고, 매칭판 스크립트가 순위를 냅니다. 다른 파일은 고칠 것이 없습니다.
//
// id는 crossing_match_profiles.track_ranking(jsonb 배열)에 그대로 남습니다. 받기 시작하면 id를 바꾸지 마세요
// (label은 바꿔도 됩니다). 영문 소문자와 숫자, 하이픈만 씁니다. 예:
//   { id: "ops", label: { ko: "업무 자동화", en: "Ops automation" } },
// ─────────────────────────────────────────────────────────────────────────────
export interface MatchTrack { id: string; label: { ko: string; en: string }; hint?: { ko: string; en: string } }

export const MATCH_TRACKS: MatchTrack[] = [];

/**
 * 순위가 맞는가. 목록이 비어 있으면 빈 배열만 맞고, 있으면 모든 트랙 id가 정확히 한 번씩 든 배열이어야 합니다.
 * 페이지와 라우트가 같은 함수를 씁니다. tracks를 넘기지 않으면 위 목록으로 검사합니다.
 */
export function isValidTrackRanking(v: unknown, tracks: MatchTrack[] = MATCH_TRACKS): v is string[] {
  if (!Array.isArray(v) || v.length !== tracks.length) return false;
  const ids = new Set(tracks.map((t) => t.id));
  return v.every((x) => typeof x === "string" && ids.has(x)) && new Set(v).size === tracks.length;
}
