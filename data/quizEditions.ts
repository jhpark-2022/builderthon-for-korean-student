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
import { RESULTS, quizUI, type MbtiKey, type Question, type Result } from "@/data/quiz";
import { RESULTS_2026_12, QUESTIONS_2026_12 } from "@/data/quiz-2026-12";
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
  /**
   * 화면의 옷. zero100은 8월의 보라, 인디고, 푸크시아 그대로이고 naru는 나루 토큰과 글자 크기 셋(TITLE/BODY/META)입니다.
   * DECIDED 2026-10-08 (브랜드 감사 2, 4): /match는 이름만 크로싱 서울이고 옷은 제로백이었습니다. 판이 옷도 고릅니다.
   * 저장 이미지(9:16 카드)의 글자 크기와 색은 판과 무관하게 그대로입니다.
   */
  tone: "zero100" | "naru";
  /**
   * 축 설명 문장(data/quizExplanations.ts, 두 판이 같이 씀)에서 이 판에 없는 말을 바꿉니다. 8월판은 비워 둡니다.
   * 12월에는 "결과 공유회"가 없고 마지막 날은 발표입니다.
   */
  explainSwaps?: { ko: [string, string][]; en: [string, string][] };
  /**
   * 이 판의 질문 글. 없으면 data/quiz.ts의 QUESTIONS입니다(8월판). 화면에 보이는 text와 label만 다르고,
   * id, axis, w, 극과 순서는 QUESTIONS와 같아야 합니다(scripts/verify-quiz.mjs가 검사). 채점은 QUESTIONS를 읽습니다.
   */
  questions?: Question[];
}

// 12월판이 덮는 문구. 8월 문구의 "제로백 빌더톤", "빌더톤"이 든 줄과 시작 화면의 세 줄입니다.
// 시작 화면: 제목, 한 줄 설명, 그리고 안내 한 줄(8월의 meta 자리). 가운뎃점은 쓰지 않습니다.
const UI_2026_12: typeof quizUI = {
  ...quizUI,
  back: { ko: "크로싱 서울", en: "CROSSING SEOUL" },
  eyebrow: { ko: "Day 1 현장 팀 매칭", en: "Day 1 on-site team matching" },
  title: { ko: "크로싱 서울 팀 매칭", en: "CROSSING SEOUL team matching" },
  // 2026-10-09 (팀 매칭 유머 브리프 5): 한 줄을 덧붙입니다.
  subtitle: { ko: "14문항, 약 3분. 결과로 Day 1 팀 매칭을 합니다. 결과가 마음에 안 들면 다시 해도 됩니다. 다들 그래요.", en: "14 questions, about 3 minutes. Your result is used for team matching on Day 1. Don't like it? Take it again. Everyone does." },
  meta: { ko: "이름, 나라, 테스트 결과는 현장 팀 매칭에만 씁니다.", en: "Your name, country and result are used only for on-site team matching." },
  roleLabel: { ko: "추천 역할", en: "Your role" },
  matchSub: { ko: "이 유형 보이면 일단 잡으세요. 이유는 Day 4에 알게 돼요 ✦", en: "See one of these? Grab them. You'll find out why on Day 4 ✦" },
  matchRoleLabel: { ko: "이 친구 추천 역할", en: "Their role" },
  ctaLead: { ko: "이 성격이면 크로싱 서울에서 {role} 포지션으로 빛나요 ✦", en: "With this type, you'll shine in the {role} role at CROSSING SEOUL ✦" },
  ctaApply: { ko: "프로그램 보기", en: "See the programme" },
  storyTicket: { ko: "CROSSING SEOUL 팀 매칭 티켓  DAY 1  12.18", en: "CROSSING SEOUL TEAM-MATCHING TICKET  DAY 1  12.18" },
  // DECIDED 2026-10-08 (사용자: "팀 - 전원 현장 편성"): 8월 문장의 "솔로 참가자는"을 뺍니다. 12월은 모두가 Day 1 현장에서 팀을 맺습니다.
  saveImageTicket: { ko: "이 이미지를 저장해 두세요. Day 1 현장 팀 매칭에서 서로 보여 줍니다 🎟️", en: "Save this image. Everyone shows theirs at on-site team matching on Day 1 🎟️" },
};

export const QUIZ_EDITIONS: Record<QuizEdition, EditionConfig> = {
  "2026-08": { results: RESULTS, path: "/quiz", backHref: "/2026-08", ownKey: QUIZ_OWN_KEY, resultKey: QUIZ_RESULT_KEY,
    ui: quizUI, cardStamp: { ko: "제로백 빌더톤 2026.08", en: "Zero100 builderthon, Aug 2026" }, fileStem: "zero100-quiz", tone: "zero100" },
  "2026-12": { results: RESULTS_2026_12, path: "/match", backHref: "/", ownKey: MATCH_OWN_KEY, resultKey: MATCH_RESULT_KEY,
    ui: UI_2026_12, cardStamp: { ko: "크로싱 서울 2026.12", en: "CROSSING SEOUL, Dec 2026" }, fileStem: "crossing-seoul-match", tone: "naru",
    // 2026-10-09: 12월 Q1의 첫마디가 바뀌어, 그 대사를 인용하는 축 설명도 같이 바꿉니다.
    explainSwaps: {
      ko: [["공유회", "발표"], ["어디 학교세요?", "서울이세요, 싱가포르세요?"]],
      en: [["showcase day", "pitch day"], ["showcase countdown", "pitch-day countdown"], ["which school are you at?", "Seoul or Singapore?"]],
    },
    questions: QUESTIONS_2026_12 },
};
