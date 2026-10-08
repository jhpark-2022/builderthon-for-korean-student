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
import { RESULTS, quizUI, type MbtiKey, type Result } from "@/data/quiz";
import { RESULTS_2026_12 } from "@/data/quiz-2026-12";
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
  /** 화면 문구. 8월판은 data/quiz.ts의 quizUI 그대로이고, 다른 판은 행사 이름이 든 줄만 덮습니다. */
  ui: typeof quizUI;
  /** 결과 카드 왼쪽 위의 한 줄(행사 이름과 시기). */
  cardStamp: { ko: string; en: string };
  /** 저장하는 이미지 파일 이름의 앞부분("<fileStem>-INFJ-A.png"). */
  fileStem: string;
}

// 12월판이 덮는 문구. 8월 문구의 "제로백 빌더톤", "빌더톤"이 든 줄과 시작 화면의 세 줄입니다.
// 시작 화면: 제목, 한 줄 설명, 그리고 안내 한 줄(8월의 meta 자리). 가운뎃점은 쓰지 않습니다.
const UI_2026_12: typeof quizUI = {
  ...quizUI,
  back: { ko: "크로싱 서울", en: "CROSSING SEOUL" },
  eyebrow: { ko: "Day 1 현장 팀 매칭", en: "Day 1 on-site team matching" },
  title: { ko: "크로싱 서울 팀 매칭", en: "CROSSING SEOUL team matching" },
  subtitle: { ko: "14문항, 약 3분. 결과로 Day 1 팀 매칭을 합니다.", en: "14 questions, about 3 minutes. Your result is used for team matching on Day 1." },
  meta: { ko: "이름, 나라, 테스트 결과는 현장 팀 매칭에만 씁니다.", en: "Your name, country and result are used only for on-site team matching." },
  roleLabel: { ko: "추천 역할", en: "Your role" },
  matchSub: { ko: "크로싱 서울에서 이 유형을 만나면 일단 팀 하세요. 이유는 나중에 ✦", en: "Spot one of these at CROSSING SEOUL? Team up first, talk later ✦" },
  matchRoleLabel: { ko: "이 친구 추천 역할", en: "Their role" },
  ctaLead: { ko: "이 성격이면 크로싱 서울에서 {role} 포지션으로 빛나요 ✦", en: "With this type, you'll shine in the {role} role at CROSSING SEOUL ✦" },
  ctaApply: { ko: "프로그램 보기", en: "See the programme" },
  storyTicket: { ko: "CROSSING SEOUL 팀 매칭 티켓  DAY 1  12.18", en: "CROSSING SEOUL TEAM-MATCHING TICKET  DAY 1  12.18" },
};

export const QUIZ_EDITIONS: Record<QuizEdition, EditionConfig> = {
  "2026-08": { results: RESULTS, path: "/quiz", backHref: "/2026-08", ownKey: QUIZ_OWN_KEY, resultKey: QUIZ_RESULT_KEY,
    ui: quizUI, cardStamp: { ko: "제로백 빌더톤 2026.08", en: "Zero100 builderthon, Aug 2026" }, fileStem: "zero100-quiz" },
  "2026-12": { results: RESULTS_2026_12, path: "/match", backHref: "/", ownKey: MATCH_OWN_KEY, resultKey: MATCH_RESULT_KEY,
    ui: UI_2026_12, cardStamp: { ko: "크로싱 서울 2026.12", en: "CROSSING SEOUL, Dec 2026" }, fileStem: "crossing-seoul-match" },
};
