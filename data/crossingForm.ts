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
// 지금 넣은 것: 고정 열과 팀/솔로, 동의뿐입니다. 추가 질문은 넣지 않았습니다(사용자가
// 정하면 더합니다). 동의 문구는 자리만 있습니다(TODO: confirm).
// 카피는 data/naru.ts의 register 블록이 아니라 여기 label에 {ko, en}으로 둡니다. 질문과
// 라벨이 한 줄에 있어야 질문을 바꿀 때 한 곳만 고칩니다.
// ─────────────────────────────────────────────────────────────────────────────

export type FieldType = "text" | "email" | "select" | "textarea" | "checkbox" | "country";
export interface FieldOption { value: string; label: { ko: string; en: string } }
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
  // 여기에 줄을 더합니다. fixed 없이. 예:
  // { key: "major", scope: "member", type: "text", required: false, label: { ko: "전공", en: "Major" } },
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
  if (f.type === "select" && !(f.options ?? []).some((o) => o.value === v)) return "invalid_option";
  if (f.type === "country" && !COUNTRY_RE.test(v)) return "invalid_country";
  return null;
}
