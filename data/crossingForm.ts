// ─────────────────────────────────────────────────────────────────────────────
// 크로싱 서울 등록 폼 스키마 (2026-09-18, Supabase 등록 브리프 2.1).
//
// 12월 폼의 질문은 아직 정해지지 않았습니다. 그래서 폼을 코드에 박지 않고 이 목록으로
// 그립니다. 서버(app/api/crossing/register)와 클라이언트(components/crossing/RegisterModal)
// 가 같은 목록으로 검증합니다(필수, 길이, select 값).
//
//   fixed: true  → 표의 고정 열(name, email, contact, university, study_country, linkedin,
//                  join_type, team_name, wants_matching, consent).
//   fixed 없음   → answers jsonb에 key → 답으로. 질문이 늘면 여기에 줄 하나.
//
// 지금 넣은 것: 고정 열과 팀/솔로, 동의, 그리고 추가 질문 둘(전공, AI로 해 본 것 네 단계. 2026-10-07).
// 동의 문구는 자리만 있습니다(TODO: confirm).
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
}

/** 한 폼의 최대 인원(등록자 포함). 서버(lib/register/shared.ts)가 여기서 가져갑니다(클라이언트 번들에 node:crypto가 들어가지 않게). */
export const MAX_MEMBERS = 3;
export const MAX_TEXT = 200;
export const MAX_TEXTAREA = 1000;

/** 나라 select의 값. OTHER를 고르면 두 글자 코드를 직접 넣습니다. */
export const COUNTRY_OTHER = "OTHER";

export const CROSSING_FORM: Field[] = [
  // ── 사람 단위(팀이면 팀원마다) ───────────────────────────────────────────
  { key: "name", scope: "member", type: "text", required: true, fixed: true,
    label: { ko: "이름", en: "Name" } },
  { key: "email", scope: "member", type: "email", required: true, fixed: true,
    label: { ko: "이메일", en: "Email" },
    help: { ko: "안내 메일이 가는 주소입니다.", en: "Where the follow-up email goes." } },
  { key: "contact", scope: "member", type: "text", required: true, fixed: true,
    label: { ko: "카카오톡 ID", en: "KakaoTalk ID" },
    help: { ko: "참가자 방 초대에 씁니다.", en: "Used for the participant room invite." } },
  { key: "university", scope: "member", type: "text", required: false, fixed: true,
    label: { ko: "학교", en: "School" },
    placeholder: { ko: "예: 서울대학교, NUS", en: "e.g. Seoul National University, NUS" } },
  { key: "study_country", scope: "member", type: "country", required: true, fixed: true,
    label: { ko: "공부하는 나라", en: "Country you study in" },
    options: [
      { value: "KR", label: { ko: "한국", en: "Korea" } },
      { value: "SG", label: { ko: "싱가포르", en: "Singapore" } },
      { value: COUNTRY_OTHER, label: { ko: "그 밖(두 글자 코드 입력)", en: "Elsewhere (two-letter code)" } },
    ] },
  { key: "linkedin", scope: "member", type: "text", required: false, fixed: true,
    label: { ko: "링크드인", en: "LinkedIn" },
    placeholder: { ko: "선택", en: "Optional" } },
  // ── 폼 단위 ──────────────────────────────────────────────────────────────
  { key: "join_type", scope: "registration", type: "select", required: true, fixed: true,
    label: { ko: "참가 형태", en: "How you join" },
    options: [
      { value: "solo", label: { ko: "혼자", en: "Solo" } },
      { value: "team", label: { ko: "팀(2~3명)", en: "Team (2 to 3)" } },
    ] },
  { key: "team_name", scope: "registration", type: "text", required: false, fixed: true,
    label: { ko: "팀 이름", en: "Team name" },
    help: { ko: "팀으로 오면 필수입니다.", en: "Required for a team." } },
  { key: "wants_matching", scope: "registration", type: "checkbox", required: false, fixed: true,
    label: { ko: "팀 매칭을 원합니다", en: "I would like to be matched into a team" },
    help: { ko: "혼자 오는 경우에만.", en: "Solo entries only." } },
  // TODO: confirm. 동의 문구. 지금은 자리만 있습니다.
  { key: "consent", scope: "registration", type: "checkbox", required: true, fixed: true,
    label: { ko: "개인정보 수집과 이용에 동의합니다.", en: "I agree to the collection and use of my personal data." },
    help: { ko: "TODO: confirm. 수집 항목과 보관 기간 문구.", en: "TODO: confirm. Items collected and retention period." } },
  // ── 추가 질문 ────────────────────────────────────────────────────────────
  // 여기에 줄을 더합니다. fixed 없이(answers jsonb로 갑니다. 표의 스키마는 바뀌지 않습니다).
  // key, scope, label 순서를 지키세요. 명단 스크립트(scripts/build-crossing-roster.py의 form_keys)가
  // 이 파일을 정규식으로 읽어 열을 만듭니다.
  // DECIDED 2026-10-07 (이슈 브리프 3, 신청 폼 브리프 2): 8월 폼에 전공과 "AI로 해 본 것" 둘을 더합니다. 사람 단위라
  // 팀이면 팀원마다 묻습니다.
  // AI로 해 본 것은 네 단계이고 수준이 아니라 행동으로 적습니다. 어느 회사 제품을 쓰든 자기 단계를 바로 알 수
  // 있게, 단계마다 두 회사의 제품 이름을 예시(hint)로 나란히 둡니다. 제품 이름은 예시일 뿐입니다.
  // 워크숍을 맞추려는 질문이고 선발에 쓰지 않습니다. 그 말을 도움말로 질문 바로 아래에 둡니다.
  // 값(value)은 answers에 그대로 남으니 받기 시작하면 바꾸지 마세요(라벨과 예시는 바꿔도 됩니다). 같은 날 처음의
  // 값(none, chatbot, coding_tool, cli_agent)을 아래 넷으로 바꿨습니다. 등록 창이 열리기 전이라 받은 답이 없었습니다.
  // 순서가 곧 단계 번호입니다(명단 스크립트가 "3. 라벨"로 냅니다). 순서를 바꾸지 마세요.
  { key: "major", scope: "member", type: "text", required: true, maxLen: 80,
    label: { ko: "전공", en: "Major" },
    placeholder: { ko: "예: 경영학, 컴퓨터공학, 미정", en: "e.g. Business, Computer Science, Undeclared" } },
  { key: "ai_level", scope: "member", type: "radio", required: true,
    label: { ko: "AI로 해 본 것 중 가장 위에 있는 것 하나를 골라 주세요.", en: "Pick the highest step you have actually done with AI." },
    help: { ko: "워크숍을 여러분에게 맞추기 위해 묻는 것이고, 이것으로 선발하지 않습니다.", en: "We ask this to fit the workshops to you. It is not used for selection." },
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
const COUNTRY_RE = /^[A-Z]{2}$/;

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
  if ((f.type === "select" || f.type === "radio") && !(f.options ?? []).some((o) => o.value === v)) return "invalid_option";
  if (f.type === "country" && !COUNTRY_RE.test(v)) return "invalid_country";
  return null;
}
