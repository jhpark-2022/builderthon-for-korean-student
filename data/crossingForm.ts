// ─────────────────────────────────────────────────────────────────────────────
// 크로싱 서울 등록 폼 스키마 (2026-09-18, Supabase 등록 브리프 2.1).
//
// 12월 폼의 질문은 아직 정해지지 않았습니다. 그래서 폼을 코드에 박지 않고 이 목록으로
// 그립니다. 서버(app/api/crossing/register)와 클라이언트(components/crossing/RegisterModal)
// 가 같은 목록으로 검증합니다(필수, 길이, select 값).
//
//   fixed: true  → 표의 고정 열(name, email, contact, university, study_country, linkedin, consent).
//   fixed 없음   → answers jsonb에 key → 답으로. 질문이 늘면 여기에 줄 하나.
//
// 지금 넣은 것: 고정 열과 동의, 그리고 추가 질문(전공, AI로 해 본 것 네 단계. 2026-10-07).
//
// DECIDED 2026-10-08 (사용자: "팀 - 전원 현장 편성"): 모두 혼자 등록하고 팀은 현장에서 맺습니다. 폼에서 참가 형태,
// 팀 이름, 팀원 줄, 팀 매칭 희망을 뺐습니다. 표는 그대로입니다(마이그레이션 없음). 라우트가 join_type을 "solo"로,
// team_name을 null로, wants_matching을 false로 씁니다. 한 폼에 한 사람입니다.
// DECIDED 2026-11-14 (사용자: "8월달 참고해줘, 혼자해도 되고, team of two 로도 할 수 있도록"): 위 10-08을 이 결정이 대신합니다.
// 참가 형태(join_type)를 다시 묻습니다. 혼자(solo)면 한 사람, 둘이 한 팀(team)이면 같은 폼에 팀원 한 사람을 더 적습니다.
// 팀원도 같은 사람 칸(MEMBER_FIELDS)을 다 채우고 crossing_members의 ordinal 2로 들어갑니다. 팀 이름과 매칭 희망은 묻지 않습니다
// (team_name null, wants_matching false). 둘은 Day 1에 같은 팀이 되고, 팀의 나머지는 현장에서 꾸립니다(brand 7장 팀 줄).
// 카피는 data/naru.ts의 register 블록이 아니라 여기 label에 {ko, en}으로 둡니다. 질문과
// 라벨이 한 줄에 있어야 질문을 바꿀 때 한 곳만 고칩니다.
// ─────────────────────────────────────────────────────────────────────────────

import { registerFacts } from "./naru";

// radio (2026-10-07, 신청 폼 브리프 2.3): 하나만 고르는 선택 카드. 검증은 select와 같습니다(목록 안의 값인지).
export const JOIN_SOLO = "solo";
export const JOIN_TEAM = "team";
/** 둘이 한 팀일 때 한 폼의 사람 수(등록자 + 팀원 한 명). */
export const TEAM_SIZE = 2;

export type FieldType = "text" | "email" | "select" | "radio" | "textarea" | "checkbox" | "country";
/** hint: 선택지 아래 작은 설명(예시). radio 카드가 그립니다. */
export interface FieldOption { value: string; label: { ko: string; en: string }; hint?: { ko: string; en: string } }
export interface Field {
  key: string;                 // answers jsonb의 키(또는 고정 열 이름)
  scope: "registration" | "member";
  type: FieldType;
  required: boolean;
  label: { ko: string; en: string };
  help?: { ko: string; en: string };
  placeholder?: { ko: string; en: string };
  options?: FieldOption[];
  maxLen?: number;             // 기본 200, textarea 1000
  fixed?: boolean;             // 표의 고정 열로 가는 것
  // 2026-10-08 (접근성 감사 1.3.5): 브라우저 자동 완성 토큰. 없으면 "off"입니다.
  autoComplete?: string;
  inputMode?: "text" | "email" | "url";
  /** 아이디 같은 값. 폰이 첫 글자를 대문자로 바꾸거나 맞춤법을 고치지 않게 합니다. */
  verbatim?: boolean;
  /** radio 카드의 첫 번호. 기본 1. 폼(RegisterModal)과 명단 스크립트(build-crossing-roster.py)가 같이 읽습니다. */
  firstStep?: number;
  /** radio 카드에 단계 번호를 그리지 않습니다(참가 형태처럼 순서가 없는 선택). */
  plain?: boolean;
}

export const MAX_TEXT = 200;
export const MAX_TEXTAREA = 1000;

/**
 * 나라 select의 값. 2026-10-08: 두 글자 ISO 코드를 직접 넣게 하지 않습니다(학생이 코드를 알아야 했습니다).
 * 목록에 없으면 OTHER를 고르고 나라 이름을 그대로 적습니다. 표의 study_country 열은 두 글자 코드만 받으므로
 * (0004의 check), OTHER는 그 열을 비우고(null) 적은 이름을 answers의 COUNTRY_OTHER_KEY로 보냅니다. 표는 그대로입니다.
 */
export const COUNTRY_OTHER = "OTHER";
export const COUNTRY_OTHER_KEY = "study_country_other";

// ── 개인정보 동의 안내 ────────────────────────────────────────────────────────
// 수집 항목, 목적, 거부할 권리는 아래에 적었습니다. 보유 기간은 아직 정해지지 않았습니다.
// 보유 기간은 data/naru.ts의 registerFacts.retentionLine입니다(2026-10-15: 삭제를 요청할 때까지).
// DECIDED 2026-10-12 (등록 브리프 1.1, 1.4): CONSENT_RETENTION의 값은 registerFacts.retentionLine에서 옵니다.
// 사실이 정해져야 쓰는 칸 다섯이 한 곳에 있습니다. 이름은 남겼습니다(라우트의 로그와 lib/registrationWindow.ts의 주석이 부릅니다). 잠금은 그대로입니다:
// 이 값이 null인 동안에는 등록 창(lib/registrationWindow.ts)에 시각을 넣어도 등록이 열리지 않습니다.
// registrationState가 not_open을 돌려주고, 라우트(app/api/crossing/register)도 따로 막습니다.
// 보유 기간 없이 개인정보를 받지 않으려는 잠금입니다. null인 동안 동의 문구는 보유 기간을 언제 적는지만 말합니다.
export const CONSENT_RETENTION: { ko: string; en: string } | null = registerFacts.retentionLine;
export const CONSENT_NOTICE_READY = CONSENT_RETENTION !== null;
const retention = CONSENT_RETENTION;
const CONSENT_BASE = {
  // DECIDED 2026-11-14: 둘이 한 팀이면 팀원의 같은 항목도 받으므로 수집 항목에 적고, 목적은 "현장 팀 편성"에서 "팀 편성"으로.
  ko: "수집 항목: 이름, 이메일, 카카오톡 ID, 학교, 공부하는 나라, 전공, AI로 해 본 것, 링크드인(선택). 둘이 한 팀으로 오면 팀원의 같은 항목도 받습니다. 목적: 참가 안내와 팀 편성. 동의하지 않을 수 있고, 그 경우 등록할 수 없습니다. 팀원의 정보는 팀원에게 먼저 알리고 적어 주세요.",
  en: "What we collect: name, email, KakaoTalk ID, school, country of study, major, your AI step, and LinkedIn (optional), and the same for your teammate if you come as a team of two. Purpose: participation notices and team formation. You may decline, in which case you cannot register. Tell your teammate before you enter their details.",
};
const CONSENT_HELP = retention
  ? { ko: `${CONSENT_BASE.ko} 보유 기간: ${retention.ko}.`, en: `${CONSENT_BASE.en} Retention: ${retention.en}.` }
  : { ko: `${CONSENT_BASE.ko} 보유 기간은 등록이 열릴 때 함께 적습니다.`, en: `${CONSENT_BASE.en} The retention period will be written here when registration opens.` };

export const CROSSING_FORM: Field[] = [
  // ── 사람 단위 ────────────────────────────────────────────────────────────
  { key: "name", scope: "member", type: "text", required: true, fixed: true, autoComplete: "name",
    label: { ko: "이름", en: "Name" },
    // DECIDED 2026-10-17 (사용자: "등록에도 본명을 쓰라는걸 명시"): Day 1 유형 테스트와 팀 명단을 이 이름으로 잇습니다(0010 crossing_matching_pool).
    help: { ko: "본명으로 적어 주세요. Day 1의 AI 유형 테스트와 팀 구성을 이 이름으로 잇습니다.", en: "Use your real name. Your Day 1 AI type test and your team are matched to it." } },
  { key: "email", scope: "member", type: "email", required: true, fixed: true, autoComplete: "email", inputMode: "email", verbatim: true,
    label: { ko: "이메일", en: "Email" },
    // DECIDED 2026-10-15 (사용자: 메일은 보내지 않고 소식은 카카오톡으로): 안내 메일을 약속하지 않습니다.
    help: { ko: "운영진이 따로 연락할 일이 있을 때만 씁니다.", en: "Only used if the organisers need to reach you directly." } },
  { key: "contact", scope: "member", type: "text", required: true, fixed: true, verbatim: true,
    label: { ko: "카카오톡 ID", en: "KakaoTalk ID" },
    // DECIDED 2026-10-23 (사용자, 스크린숏: "이거는 빼줘"): 아래 설명 세 문장(참가자 방 초대, ID 찾는 곳, 오픈채팅과 다른 방)을 뺐습니다.
    // 그 전 문장은 git 이력에 있습니다(2026-10-12 등록 브리프 1.4).
  },
  { key: "university", scope: "member", type: "text", required: true, fixed: true, autoComplete: "organization",
    // DECIDED 2026-10-15 (사용자: "학교 이름은 필수임"): 필수입니다.
    label: { ko: "학교", en: "School" },
    // DECIDED 2026-10-15 (사용자: "서울대랑 nus 넣지 말아줘, 가장 좋은 학교를 넣으면 intimidate 될 수 있어"): 예시에 학교 이름을 두지 않습니다.
    placeholder: { ko: "다니는 학교 이름", en: "Your school's name" } },
  { key: "study_country", scope: "member", type: "country", required: true, fixed: true,
    label: { ko: "공부하는 나라", en: "Country you study in" },
    help: { ko: "한국과 해외의 학생이 한 팀에 섞이도록 팀을 맺을 때 봅니다.", en: "Used when forming teams so students in Korea and abroad are mixed." },
    options: [
      { value: "KR", label: { ko: "한국", en: "Korea" } },
      { value: "SG", label: { ko: "싱가포르", en: "Singapore" } },
      // DECIDED 2026-10-15 (사용자: "공부하는 나라는 한국, 싱가폴, 기타"): 셋입니다. 기타를 고르면 아래 나라 이름 칸이 열립니다.
      { value: COUNTRY_OTHER, label: { ko: "기타", en: "Other" } },
    ] },
  // 위에서 "그 밖의 나라"를 골랐을 때만 묻고, 그때는 필수입니다(validatePerson). answers jsonb로 갑니다.
  { key: "study_country_other", scope: "member", type: "text", required: false, maxLen: 60, autoComplete: "country-name",
    label: { ko: "나라 이름", en: "Country name" },
    placeholder: { ko: "예: 프랑스", en: "e.g. France" } },
  // ── 폼 단위 ──────────────────────────────────────────────────────────────
  // DECIDED 2026-11-14 (위 머리 주석): 참가 형태. 폼의 맨 위에 그립니다(RegisterModal). 값은 표의 join_type 열 그대로(0004의 check: solo, team).
  { key: "join_type", scope: "registration", type: "radio", required: true, fixed: true, plain: true,
    label: { ko: "어떻게 오나요?", en: "How are you joining?" },
    options: [
      { value: JOIN_SOLO, label: { ko: "혼자", en: "On my own" },
        hint: { ko: "팀은 Day 1 현장에서 꾸려요.", en: "Teams form on site on Day 1." } },
      { value: JOIN_TEAM, label: { ko: "둘이 한 팀으로", en: "As a team of two" },
        hint: { ko: "같이 올 한 사람의 정보도 이 폼에 적어요. 둘은 Day 1에 같은 팀이 돼요.", en: "Add the one person coming with you on this form. You two will be on the same team on Day 1." } },
    ] },
  { key: "consent", scope: "registration", type: "checkbox", required: true, fixed: true,
    label: { ko: "개인정보 수집과 이용에 동의합니다.", en: "I agree to the collection and use of my personal data." },
    help: CONSENT_HELP },
  // ── 추가 질문 ────────────────────────────────────────────────────────────
  // 여기에 줄을 더합니다. fixed 없이(answers jsonb로 갑니다. 표의 스키마는 바뀌지 않습니다).
  // key, scope, label 순서를 지키세요. 명단 스크립트(scripts/build-crossing-roster.py의 form_keys)가
  // 이 파일을 정규식으로 읽어 열을 만듭니다.
  // DECIDED 2026-10-07 (이슈 브리프 3, 신청 폼 브리프 2): 8월 폼에 전공과 "AI로 해 본 것" 둘을 더합니다. 사람 단위입니다.
  // AI로 해 본 것은 네 단계이고 수준이 아니라 행동으로 적습니다. 어느 회사 제품을 쓰든 자기 단계를 바로 알 수
  // 있게, 단계마다 두 회사의 제품 이름을 예시(hint)로 나란히 둡니다. 제품 이름은 예시일 뿐입니다.
  // 워크숍을 맞추려는 질문이고 선발에 쓰지 않습니다. 그 말을 도움말로 질문 바로 아래에 둡니다.
  // 값(value)은 answers에 그대로 남으니 받기 시작하면 바꾸지 마세요(라벨과 예시는 바꿔도 됩니다). 같은 날 처음의
  // 값(none, chatbot, coding_tool, cli_agent)을 아래 넷으로 바꿨습니다. 등록 창이 열리기 전이라 받은 답이 없었습니다.
  // 순서가 곧 단계 번호입니다(명단 스크립트가 "3. 라벨"로 냅니다). 순서를 바꾸지 마세요.
  // DECIDED 2026-10-12 (등록 브리프 1.4 D3, 리뷰 S15): 전공은 선택입니다. Day 1 전에 꼭 필요한 것은 이름, 이메일, 카카오톡 ID,
  // 나라, 동의입니다. 서버도 같은 스키마로 검증하므로 빈 전공을 받습니다(빈 답은 answers에 넣지 않습니다).
  // DECIDED 2026-11-02 (사용자, 스크린숏: "전공을 필수로 하되, 거기에 참여에는 영향이 없다 이렇게 해줘"): 전공은 필수입니다. 위 10-12의 선택을
  // 이 결정이 대신합니다. 정해지지 않은 사람은 "미정"이라 적으면 됩니다(placeholder). 도움말은 AI 질문과 같은 꼴로 참가에 영향이 없다고 적습니다.
  { key: "major", scope: "member", type: "text", required: true, maxLen: 80,
    label: { ko: "전공", en: "Major" },
    // DECIDED 2026-10-09 (사용자, 스크린숏: "여러분들을 위한 과정을 위해서 물어보는 것, screening 이 아니라는 내용 추가해줘"):
    // 전공과 아래 AI 질문은 선발처럼 읽히기 쉬운 두 칸입니다. 둘 다 바로 아래에 왜 묻는지를 적습니다.
    // DECIDED 2026-10-12 (등록 브리프 1.4, 리뷰 S5): "스크리닝이 아닙니다"는 두 도움말에서 빼고 모달 도입부 한 번만 둡니다.
    // 세 번 되풀이하니 오히려 선발처럼 읽혔습니다(docs/brand.md 9장: 한 자리에 한 번).
    help: { ko: "여러분에게 맞는 과정을 준비하려고 묻습니다. 무엇을 적어도 참가에는 영향이 없습니다.", en: "We ask so we can prepare a programme that fits you. Your answer does not affect whether you can join." },
    placeholder: { ko: "예: 경영학, 컴퓨터공학, 미정", en: "e.g. Business, Computer Science, Undeclared" } },
  // DECIDED 2026-10-12 (등록 브리프 1.4 D2, 리뷰 S5): 0단계 "아직 거의 써 보지 않았다"(값 none)를 맨 앞에 더합니다. 그 전에는
  // 아무것도 해 보지 않은 사람이 고를 칸이 없는데 필수였습니다. 번호는 0부터입니다(firstStep). 기존 넷의 값과 번호(1~4)는
  // 그대로라 이미 있는 답과 명단의 번호가 바뀌지 않습니다. 라벨은 "가장 위"가 아니라 "번호가 가장 큰 것"입니다(카드는 1번이 맨 위).
  { key: "ai_level", scope: "member", type: "radio", required: true, firstStep: 0,
    label: { ko: "AI로 해 본 것 중 번호가 가장 큰 것 하나를 골라 주세요.", en: "Of the things you have done with AI, pick the one with the highest number." },
    help: { ko: "여러분에게 맞는 과정을 준비하려고 묻습니다. 무엇을 골라도 참가에는 영향이 없습니다.", en: "We ask so we can prepare a programme that fits you. Your answer does not affect whether you can join." },
    options: [
      { value: "none", label: { ko: "아직 거의 써 보지 않았다", en: "Have barely used it yet" } },
      { value: "chat", label: { ko: "채팅창에 물어보고 답을 받아 써 봤다", en: "Asked a chatbot and used its answers" },
        hint: { ko: "ChatGPT나 Claude에 질문하고 글, 요약, 번역을 받아 씀", en: "Questions, drafts, summaries or translations from ChatGPT or Claude" } },
      { value: "agent", label: { ko: "AI에게 일을 맡겨 끝까지 해내게 해 봤다", en: "Handed AI a task and let it finish the job" },
        hint: { ko: "Claude Cowork나 ChatGPT 에이전트 모드로 파일 정리, 자료 조사, 문서 만들기", en: "Sorting files, research or making documents with Claude Cowork or ChatGPT agent mode" } },
      { value: "terminal", label: { ko: "터미널에서 AI 코딩 도구를 켜서 무언가를 만들어 봤다", en: "Opened an AI coding tool in the terminal and built something" },
        hint: { ko: "Claude Code나 Codex CLI로 앱이나 스크립트 만들기", en: "An app or a script with Claude Code or Codex CLI" } },
      { value: "connect", label: { ko: "AI에 다른 도구를 연결해 함께 쓰게 해 봤다", en: "Connected other tools to AI so it can use them" },
        hint: { ko: "MCP로 Claude나 ChatGPT에 노션, 깃허브, 캘린더 등을 연결", en: "Notion, GitHub or a calendar linked to Claude or ChatGPT through MCP" } },
    ] },
  // DECIDED 2026-11-02 (사용자: "질문의 순서를 다시 생각. 필수가 먼저 와야함"): 필수 질문을 다 묻고 선택을 맨 끝에 둡니다.
  // 링크드인이 학교와 나라 다음, 필수인 전공과 AI 질문 앞에 있었습니다. 고정 열이라 answers와 명단 열 순서는 바뀌지 않습니다.
  // 폼에 그리는 순서는 이 배열의 순서이고, 동의 칸은 RegisterModal이 언제나 맨 끝에 그립니다.
  { key: "linkedin", scope: "member", type: "text", required: false, fixed: true, autoComplete: "url", inputMode: "url", verbatim: true,
    label: { ko: "링크드인", en: "LinkedIn" },
    placeholder: { ko: "https://linkedin.com/in/...", en: "https://linkedin.com/in/..." } },
];

export const MEMBER_FIELDS = CROSSING_FORM.filter((f) => f.scope === "member");
export const REGISTRATION_FIELDS = CROSSING_FORM.filter((f) => f.scope === "registration");
/** answers jsonb로 가는 키(고정 열이 아닌 것) */
export const ANSWER_KEYS = { registration: REGISTRATION_FIELDS.filter((f) => !f.fixed).map((f) => f.key), member: MEMBER_FIELDS.filter((f) => !f.fixed).map((f) => f.key) };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** 필드 하나의 값 검증. 문제 없으면 null, 있으면 오류 코드. 서버와 클라이언트가 같이 씁니다. */
export function validateField(f: Field, raw: unknown): string | null {
  const max = f.maxLen ?? (f.type === "textarea" ? MAX_TEXTAREA : MAX_TEXT);
  if (f.type === "checkbox") {
    if (f.required && raw !== true) return "required";
    return null;
  }
  const v = typeof raw === "string" ? raw.trim() : "";
  if (!v) return f.required ? "required" : null;
  if (v.length > max) return "too_long";
  if (f.type === "email" && !EMAIL_RE.test(v)) return "invalid_email";
  if ((f.type === "select" || f.type === "radio" || f.type === "country") && !(f.options ?? []).some((o) => o.value === v)) return "invalid_option";
  return null;
}

/**
 * 한 사람의 답 전체 검증. {키: 오류 코드}. 서버와 클라이언트가 같이 씁니다.
 * 필드 하나로는 알 수 없는 규칙 하나가 여기 있습니다: 나라가 "그 밖의 나라"면 나라 이름이 필수입니다.
 */
/** 팀원 칸 묶음 위의 제목과 안내(둘이 한 팀일 때만). */
export const TEAMMATE_COPY = {
  me: { ko: "내 정보", en: "About you" },
  heading: { ko: "함께 오는 팀원", en: "Your teammate" },
  note: { ko: "팀원은 따로 등록하지 않아도 돼요. 이 폼 하나로 둘 다 등록돼요.", en: "Your teammate does not need to register separately. This one form registers you both." },
};

export function validatePerson(a: Record<string, unknown>): Record<string, string> {
  const e: Record<string, string> = {};
  const other = a.study_country === COUNTRY_OTHER;
  for (const f of MEMBER_FIELDS) {
    if (f.key === COUNTRY_OTHER_KEY && !other) continue;
    const err = validateField(f.key === COUNTRY_OTHER_KEY ? { ...f, required: true } : f, a[f.key]);
    if (err) e[f.key] = err;
  }
  return e;
}
