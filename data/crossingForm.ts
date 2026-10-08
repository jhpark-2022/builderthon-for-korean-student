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
// 카피는 data/naru.ts의 register 블록이 아니라 여기 label에 {ko, en}으로 둡니다. 질문과
// 라벨이 한 줄에 있어야 질문을 바꿀 때 한 곳만 고칩니다.
// ─────────────────────────────────────────────────────────────────────────────

// radio (2026-10-07, 신청 폼 브리프 2.3): 하나만 고르는 선택 카드. 검증은 select와 같습니다(목록 안의 값인지).
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
// 수집 항목, 목적, 거부할 권리는 아래에 적었습니다. 보관 기간은 아직 정해지지 않았습니다.
// TODO: confirm (사용자). 보관 기간 문장을 CONSENT_RETENTION에 {ko, en}으로 넣으세요.
//   예: { ko: "보관: 행사가 끝난 뒤 N개월까지 보관하고 지웁니다.", en: "Retention: kept until N months after the event, then deleted." }
// 이 값이 null인 동안에는 등록 창(lib/registrationWindow.ts)에 시각을 넣어도 등록이 열리지 않습니다.
// registrationState가 not_open을 돌려주고, 라우트(app/api/crossing/register)도 따로 막습니다.
// 보관 기간 없이 개인정보를 받지 않으려는 잠금입니다.
export const CONSENT_RETENTION: { ko: string; en: string } | null = null;
export const CONSENT_NOTICE_READY = CONSENT_RETENTION !== null;
const CONSENT_BASE = {
  ko: "수집 항목: 이름, 이메일, 카카오톡 ID, 학교, 공부하는 나라, 전공, AI로 해 본 것, 링크드인(선택). 목적: 참가 안내와 현장 팀 편성. 동의하지 않을 수 있고, 그 경우 등록할 수 없습니다.",
  en: "What we collect: name, email, KakaoTalk ID, school, country of study, major, your AI step, and LinkedIn (optional). Purpose: participation notices and on-site team formation. You may decline, in which case you cannot register.",
};
const retention = CONSENT_RETENTION as { ko: string; en: string } | null;
const CONSENT_HELP = retention
  ? { ko: `${CONSENT_BASE.ko} ${retention.ko}`, en: `${CONSENT_BASE.en} ${retention.en}` }
  : CONSENT_BASE;

export const CROSSING_FORM: Field[] = [
  // ── 사람 단위 ────────────────────────────────────────────────────────────
  { key: "name", scope: "member", type: "text", required: true, fixed: true, autoComplete: "name",
    label: { ko: "이름", en: "Name" } },
  { key: "email", scope: "member", type: "email", required: true, fixed: true, autoComplete: "email", inputMode: "email", verbatim: true,
    label: { ko: "이메일", en: "Email" },
    help: { ko: "안내 메일이 가는 주소입니다.", en: "Where the follow-up email goes." } },
  { key: "contact", scope: "member", type: "text", required: true, fixed: true, verbatim: true,
    label: { ko: "카카오톡 ID", en: "KakaoTalk ID" },
    help: { ko: "참가자 카카오톡 방에 초대할 때 씁니다. 참가비, 장소, Day 0 안내가 그 방에서 나갑니다.", en: "Used to invite you to the participant KakaoTalk room, where cost, venue and Day 0 details are shared." } },
  { key: "university", scope: "member", type: "text", required: false, fixed: true, autoComplete: "organization",
    label: { ko: "학교", en: "School" },
    placeholder: { ko: "예: 서울대학교, NUS", en: "e.g. Seoul National University, NUS" } },
  { key: "study_country", scope: "member", type: "country", required: true, fixed: true,
    label: { ko: "공부하는 나라", en: "Country you study in" },
    help: { ko: "한국과 해외의 학생이 한 팀에 섞이도록 팀을 맺을 때 봅니다.", en: "Used when forming teams so students in Korea and abroad are mixed." },
    options: [
      { value: "KR", label: { ko: "한국", en: "Korea" } },
      { value: "SG", label: { ko: "싱가포르", en: "Singapore" } },
      { value: "US", label: { ko: "미국", en: "United States" } },
      { value: "GB", label: { ko: "영국", en: "United Kingdom" } },
      { value: "JP", label: { ko: "일본", en: "Japan" } },
      { value: "CN", label: { ko: "중국", en: "China" } },
      { value: "HK", label: { ko: "홍콩", en: "Hong Kong" } },
      { value: "AU", label: { ko: "호주", en: "Australia" } },
      { value: "CA", label: { ko: "캐나다", en: "Canada" } },
      { value: "DE", label: { ko: "독일", en: "Germany" } },
      { value: COUNTRY_OTHER, label: { ko: "그 밖의 나라", en: "Another country" } },
    ] },
  // 위에서 "그 밖의 나라"를 골랐을 때만 묻고, 그때는 필수입니다(validatePerson). answers jsonb로 갑니다.
  { key: "study_country_other", scope: "member", type: "text", required: false, maxLen: 60, autoComplete: "country-name",
    label: { ko: "나라 이름", en: "Country name" },
    placeholder: { ko: "예: 프랑스", en: "e.g. France" } },
  { key: "linkedin", scope: "member", type: "text", required: false, fixed: true, autoComplete: "url", inputMode: "url", verbatim: true,
    label: { ko: "링크드인", en: "LinkedIn" },
    placeholder: { ko: "https://linkedin.com/in/...", en: "https://linkedin.com/in/..." } },
  // ── 폼 단위 ──────────────────────────────────────────────────────────────
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
  { key: "major", scope: "member", type: "text", required: true, maxLen: 80,
    label: { ko: "전공", en: "Major" },
    // DECIDED 2026-10-09 (사용자, 스크린숏: "여러분들을 위한 과정을 위해서 물어보는 것, screening 이 아니라는 내용 추가해줘"):
    // 전공과 아래 AI 질문은 선발처럼 읽히기 쉬운 두 칸입니다. 둘 다 바로 아래에 왜 묻는지와 스크리닝이 아님을 적습니다.
    help: { ko: "여러분에게 맞는 과정을 준비하려고 묻습니다. 스크리닝이 아닙니다.", en: "We ask so we can prepare a programme that fits you. This is not screening." },
    placeholder: { ko: "예: 경영학, 컴퓨터공학, 미정", en: "e.g. Business, Computer Science, Undeclared" } },
  { key: "ai_level", scope: "member", type: "radio", required: true,
    label: { ko: "AI로 해 본 것 중 가장 위에 있는 것 하나를 골라 주세요.", en: "Pick the highest step you have actually done with AI." },
    help: { ko: "여러분에게 맞는 과정을 준비하려고 묻습니다. 스크리닝이 아니고, 무엇을 골라도 참가에는 영향이 없습니다.", en: "We ask so we can prepare a programme that fits you. This is not screening, and your answer does not affect whether you can join." },
    options: [
      { value: "chat", label: { ko: "채팅창에 물어보고 답을 받아 써 봤다", en: "Asked a chatbot and used its answers" },
        hint: { ko: "ChatGPT나 Claude에 질문하고 글, 요약, 번역을 받아 씀", en: "Questions, drafts, summaries or translations from ChatGPT or Claude" } },
      { value: "agent", label: { ko: "AI에게 일을 맡겨 끝까지 해내게 해 봤다", en: "Handed AI a task and let it finish the job" },
        hint: { ko: "Claude Cowork나 ChatGPT 에이전트 모드로 파일 정리, 자료 조사, 문서 만들기", en: "Sorting files, research or making documents with Claude Cowork or ChatGPT agent mode" } },
      { value: "terminal", label: { ko: "터미널에서 AI 코딩 도구를 켜서 무언가를 만들어 봤다", en: "Opened an AI coding tool in the terminal and built something" },
        hint: { ko: "Claude Code나 Codex CLI로 앱이나 스크립트 만들기", en: "An app or a script with Claude Code or Codex CLI" } },
      { value: "connect", label: { ko: "AI에 다른 도구를 연결해 함께 쓰게 해 봤다", en: "Connected other tools to AI so it can use them" },
        hint: { ko: "MCP로 Claude나 ChatGPT에 노션, 깃허브, 캘린더 등을 연결", en: "Notion, GitHub or a calendar linked to Claude or ChatGPT through MCP" } },
    ] },
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
