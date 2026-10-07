// ─────────────────────────────────────────────────────────────────────────────
// AI 유형 테스트의 판 (DECIDED 2026-10-08, 현장 팀 매칭 브리프 3).
//
// 질문 14개와 채점, 역할, 궁합 구조는 판이 달라도 같습니다(data/quiz.ts의 QUESTIONS, lib/quizScore.ts).
// 판마다 다른 것은 각 유형에 붙는 AI 이름과 그 AI에 대한 문장(결과 표), 그리고 기기에 남기는 저장 키와
// 주소입니다. 8월판(/quiz)은 data/quiz.ts의 RESULTS 그대로이고, 이 파일은 그 표를 고치지 않습니다.
//
//   2026-08  /quiz   8월 기록. 저장 키도 그때 그대로(z100-quiz-own, z100-quiz-result).
//   2026-12  /match  크로싱 서울 현장 팀 매칭. 저장 키가 달라서 8월 결과와 섞이지 않습니다.
// ─────────────────────────────────────────────────────────────────────────────
import { RESULTS, type MbtiKey, type Result } from "@/data/quiz";
import { QUIZ_OWN_KEY, QUIZ_RESULT_KEY, MATCH_OWN_KEY, MATCH_RESULT_KEY } from "@/lib/storage";

export type QuizEdition = "2026-08" | "2026-12";

export interface EditionConfig {
  /** 이 판의 결과 표(유형 → AI 이름과 문장). */
  results: Record<MbtiKey, Result>;
  /** 이 판이 사는 주소. 결과 딥링크(?r=)와 다시 하기가 이 주소를 씁니다. */
  path: string;
  /** 왼쪽 위 "돌아가기"가 가는 곳. */
  backHref: string;
  /** sessionStorage: 내 결과 표시(새로고침 대비). */
  ownKey: string;
  /** localStorage: 내 결과(답 포함). */
  resultKey: string;
}

export const QUIZ_EDITIONS: Record<QuizEdition, EditionConfig> = {
  "2026-08": { results: RESULTS, path: "/quiz", backHref: "/2026-08", ownKey: QUIZ_OWN_KEY, resultKey: QUIZ_RESULT_KEY },
  // 12월판의 결과 표는 data/quiz-2026-12.ts가 생기면 그쪽을 읽습니다. 그 전까지는 8월 표를 가리킵니다
  // (이 판을 쓰는 페이지가 아직 없습니다).
  "2026-12": { results: RESULTS, path: "/match", backHref: "/", ownKey: MATCH_OWN_KEY, resultKey: MATCH_RESULT_KEY },
};
