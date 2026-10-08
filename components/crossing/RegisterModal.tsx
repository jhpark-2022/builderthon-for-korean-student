"use client";

// ─────────────────────────────────────────────────────────────────────────────
// 크로싱 서울 등록 폼 (2026-09-18, Supabase 등록 브리프 2.4).
//
// 8월 RegisterModal(1,551줄)을 복제하지 않습니다. data/crossingForm.ts의 스키마를 돌며
// 필드를 그립니다. 질문이 바뀌면 스키마 한 줄이면 됩니다.
//
// DECIDED 2026-10-08 (사용자: "팀 - 전원 현장 편성"): 한 폼에 한 사람입니다. 참가 형태, 팀 이름, 팀원 줄, 팀 매칭
// 희망은 없습니다. 팀은 현장에서 맺습니다.
//
// 2026-10-08 (폼 리뷰, 접근성 감사, 브랜드 감사 반영):
//   포커스  열릴 때 닫기 버튼으로, Tab은 대화상자 안에서 돌고, 뒤의 페이지는 inert, 닫으면 연 버튼으로 돌아갑니다
//           (components/EventModal.tsx와 같은 수명 주기).
//   색      나루 토큰만 씁니다(면 naru-surface, 강조 accent, 주 버튼 buttonClass("primary", "naru")). 8월의 보라와
//           인디고는 이 폼에 없습니다.
//   크기    BODY와 META, 그리고 LARGE(18px) 셋입니다. 아래 LARGE의 주석을 보세요.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useLocale } from "@/lib/LocaleContext";
import { useBodyScrollLock } from "@/lib/useBodyScrollLock";
import { CURRENT_EVENT } from "@/lib/registrationWindow";
import TurnstileWidget from "@/components/crossing/TurnstileWidget";
import { TURNSTILE_ACTION } from "@/lib/register/turnstileAction";
import { naruLinks, openChatLabels, register as copy } from "@/data/naru";
import { links, type Phrase } from "@/data/dictionaryCore";
import { BODY, META } from "@/components/ui/typography";
import { buttonClass } from "@/components/ui/Button";
import {
  COUNTRY_OTHER, COUNTRY_OTHER_KEY, MEMBER_FIELDS, REGISTRATION_FIELDS, MAX_TEXT, MAX_TEXTAREA,
  type Field, validateField, validatePerson,
} from "@/data/crossingForm";

const DRAFT_KEY = `naru.register.${CURRENT_EVENT}.draft`;
const SUBMIT_TIMEOUT_MS = 20_000;
const FOCUSABLE = "a[href], button:not([disabled]), input:not([disabled]):not([tabindex='-1']), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])";

// 2026-10-08: 입력칸과 제목의 크기. BODY의 sm 값(18px)을 폰에서도 그대로 씁니다. iOS Safari와 카카오톡 인앱 브라우저는
// 16px보다 작은 입력칸에 포커스가 가면 화면을 확대하는데, BODY는 폰에서 15.75px입니다. 새 크기가 아니고(BODY가 이미
// 쓰는 값), 이 폼은 TITLE을 쓰지 않으므로 한 화면의 크기는 폰에서 셋(18, 15.75, 13.5), 데스크톱에서 둘(18, 13.5)입니다.
const LARGE = "text-base";
// 테두리 white/45는 면 위에서 3:1을 넘고(1.4.11), 자리표시 글자 white/55는 6:1입니다(1.4.3). 그 전의 /12와 /35는 못 넘었습니다.
const FIELD = `w-full rounded-xl border border-white/45 bg-white/[0.04] px-4 py-3 ${LARGE} text-white placeholder:text-white/55 transition focus:border-accent focus:bg-white/[0.06]`;
const PRIMARY = `${buttonClass("primary", "naru")} min-h-[48px] justify-center disabled:opacity-60 disabled:hover:translate-y-0`;

type Answers = Record<string, string | boolean>;
type Status = "idle" | "submitting" | "success" | "error";

// preview (2026-10-08): 등록 창이 열리기 전의 미리 보기. 폼은 그대로 보이고 채울 수도 있지만 제출 버튼이 꺼져 있고
// 요청을 보내지 않습니다. 서버도 창이 열리기 전에는 403입니다.
// closed: 폼이 열린 채로 마감 시각을 넘긴 경우. 안내가 "아직 열리지 않았습니다"가 아니라 "마감됐습니다"여야 합니다.
export default function RegisterModal({ open, onClose, onRegistered, refSource, preview = false, closed = false }: {
  open: boolean; onClose: () => void; onRegistered: () => void; refSource: string | null; preview?: boolean; closed?: boolean;
}) {
  const { t, locale } = useLocale();
  const reduce = useReducedMotion();
  const [person, setPerson] = useState<Answers>({});
  const [reg, setReg] = useState<Answers>({});
  const [website, setWebsite] = useState(""); // 허니팟(url_confirm). 초안에 넣지 않습니다.
  const [status, setStatus] = useState<Status>("idle");
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sentEmail, setSentEmail] = useState("");
  // 봇 확인(Cloudflare Turnstile, 2026-09-23). 사이트 키가 없으면(로컬) 위젯을 그리지 않고,
  // 서버도 개발 빌드에서는 확인을 건너뜁니다. 토큰은 한 번 쓰면 끝이라 보낸 뒤 실패하면 새로 받습니다.
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";
  const [botToken, setBotToken] = useState<string | null>(null);
  const [botReset, setBotReset] = useState(0);
  const [botFailed, setBotFailed] = useState(false);
  const [touched, setTouched] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const successRef = useRef<HTMLHeadingElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const statusRef = useRef(status);
  statusRef.current = status;

  // 수명 주기 effect보다 먼저 선언합니다. 정리 순서가 스크롤 복원 → 포커스 복원이 됩니다(EventModal과 같은 이유).
  useBodyScrollLock(open);

  // 초안 복원(마운트 뒤, 클라이언트만). 2026-10-08 전의 초안({reg, members})도 읽습니다.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const d = JSON.parse(raw) as { person?: Answers; reg?: Answers; members?: { a?: Answers }[] };
      const p = d.person ?? d.members?.[0]?.a;
      if (p && typeof p === "object") setPerson(p);
      if (d.reg && typeof d.reg === "object") {
        const known = new Set(REGISTRATION_FIELDS.map((f) => f.key));
        setReg(Object.fromEntries(Object.entries(d.reg).filter(([k]) => known.has(k) && k !== "consent")));
      }
    } catch { /* corrupt draft */ }
  }, []);
  // 초안 저장(입력할 때마다). 완료하면 지웁니다. 동의 표시는 넣지 않습니다(2026-10-08. 다음에 열 때 다시 묻습니다).
  useEffect(() => {
    if (!touched || status === "success") return;
    try {
      const regDraft = Object.fromEntries(Object.entries(reg).filter(([k]) => k !== "consent"));
      window.localStorage.setItem(DRAFT_KEY, JSON.stringify({ person, reg: regDraft }));
    } catch { /* ignore */ }
  }, [person, reg, touched, status]);

  // 열고 닫을 때의 상태 정리(2026-10-08).
  //   열 때  지난번에 등록을 마친 채 닫았다면 빈 폼으로. 그 전에는 새로고침할 때까지 "등록됐습니다"만 보였습니다.
  //   닫을 때 봇 토큰을 버립니다(다시 열면 위젯이 새 토큰을 받습니다). 남아 있던 서버 오류 문구도 지웁니다.
  useEffect(() => {
    if (open) {
      if (statusRef.current === "success") {
        setPerson({}); setReg({}); setErrors({}); setTouched(false); setSentEmail(""); setStatus("idle");
      }
      return;
    }
    setBotToken(null); setBotFailed(false); setErrorCode(null);
    setStatus((s) => (s === "error" ? "idle" : s));
  }, [open]);

  // 열림/닫힘 수명 주기: ESC, Tab 가두기, 뒤 페이지 inert, 닫으면 연 자리로 포커스 복원.
  // onClose는 ref로 읽습니다. 프로바이더가 렌더마다 새 함수를 주므로 의존성에 넣으면 입력할 때마다 포커스가 튑니다.
  useEffect(() => {
    if (!open) return;
    const opener = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); onCloseRef.current(); return; }
      if (e.key !== "Tab" || !dialogRef.current) return;
      const nodes = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE))
        .filter((el) => el.offsetParent !== null || el === document.activeElement);
      if (nodes.length === 0) { e.preventDefault(); return; }
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      const active = document.activeElement;
      const outside = !dialogRef.current.contains(active);
      if (e.shiftKey && (active === first || outside)) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && (active === last || outside)) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKey);
    // 대화상자는 <body>로 포털되므로 이 형제들을 통째로 inert로 둘 수 있습니다. aria-hidden은 같이 걸지 않습니다
    // (방금 누른 버튼이 <main> 안에서 포커스를 쥐고 있어 경고가 납니다. EventModal의 주석과 같은 이유).
    const inerted = Array.from(document.querySelectorAll<HTMLElement>("header, main, footer"));
    inerted.forEach((el) => el.setAttribute("inert", ""));
    const id = window.setTimeout(() => closeRef.current?.focus(), 50);
    return () => {
      document.removeEventListener("keydown", onKey);
      inerted.forEach((el) => el.removeAttribute("inert"));
      window.clearTimeout(id);
      opener?.focus?.();
    };
  }, [open]);

  // 완료 화면으로 바뀌면 제출 버튼이 사라져 포커스가 body로 떨어집니다. 제목으로 옮겨 결과를 읽게 합니다.
  useEffect(() => {
    if (status === "success") successRef.current?.focus();
  }, [status]);

  // 값을 고치면 그 칸의 오류는 바로 지웁니다(2026-10-08. 그 전에는 다음 제출까지 빨간 글이 남았습니다).
  const clearError = (key: string) => setErrors((e) => (key in e ? Object.fromEntries(Object.entries(e).filter(([k]) => k !== key)) : e));
  const setPersonField = (k: string, v: string | boolean) => { setTouched(true); setPerson((p) => ({ ...p, [k]: v })); clearError(`m.${k}`); };
  const setRegField = (k: string, v: string | boolean) => { setTouched(true); setReg((r) => ({ ...r, [k]: v })); clearError(`reg.${k}`); };

  const otherCountry = person.study_country === COUNTRY_OTHER;

  const validate = (): Record<string, string> => {
    const e: Record<string, string> = {};
    for (const [k, code] of Object.entries(validatePerson(person))) e[`m.${k}`] = code;
    for (const f of REGISTRATION_FIELDS) {
      const err = validateField(f, reg[f.key]);
      if (err) e[`reg.${f.key}`] = f.key === "consent" ? "consent_required" : err;
    }
    return e;
  };

  const onSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (preview || status === "submitting") return;
    setStatus("idle"); setErrorCode(null);
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) {
      // 다음 프레임에서 찾습니다(2026-10-07). setErrors 직후에는 aria-invalid가 아직 DOM에 없어서, 첫 제출에서는
      // 포커스가 오류 칸으로 가지 않았습니다. 선택 카드 묶음(radiogroup)은 포커스를 받지 못하므로 그 안의 첫 radio로.
      requestAnimationFrame(() => {
        const bad = dialogRef.current?.querySelector<HTMLElement>("[aria-invalid='true']");
        (bad?.matches("[role='radiogroup']") ? bad.querySelector<HTMLElement>("input") : bad)?.focus();
      });
      return;
    }
    if (turnstileSiteKey && !botToken) { setStatus("error"); setErrorCode(botFailed ? "bot_check_load_failed" : "bot_check_pending"); return; }
    setStatus("submitting");
    // 서버로 보내는 꼴. 한 폼에 한 사람이라 members는 늘 하나입니다. 나라가 목록에 있으면 나라 이름 칸은 보내지 않습니다.
    const member: Answers = { ...person };
    if (!otherCountry) delete member[COUNTRY_OTHER_KEY];
    const email = String(person.email ?? "").trim();
    // 응답이 오지 않으면 20초 뒤에 끊습니다. 그 전에는 "보내는 중"에서 영영 멈췄습니다.
    const ctrl = new AbortController();
    const timer = window.setTimeout(() => ctrl.abort(), SUBMIT_TIMEOUT_MS);
    try {
      const res = await fetch("/api/crossing/register", {
        method: "POST",
        headers: { "content-type": "application/json" },
        signal: ctrl.signal,
        body: JSON.stringify({
          eventSlug: CURRENT_EVENT, ref: refSource, submittedAt: new Date().toISOString(), url_confirm: website,
          registration: reg, members: [member], turnstileToken: botToken,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) { setStatus("error"); setErrorCode(data.error ?? "generic"); setBotToken(null); setBotReset((n) => n + 1); return; }
      setSentEmail(email);
      setStatus("success");
      try { window.localStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ }
      onRegistered();
    } catch {
      setStatus("error"); setErrorCode("generic"); setBotToken(null); setBotReset((n) => n + 1);
    } finally {
      window.clearTimeout(timer);
    }
  };

  const maxOf = (f: Field) => f.maxLen ?? (f.type === "textarea" ? MAX_TEXTAREA : MAX_TEXT);
  const errText = (code: string | undefined, max: number = MAX_TEXT) =>
    code ? t((copy.errors as Record<string, Phrase>)[code] ?? copy.errors.generic).replace("{max}", String(max)) : undefined;

  const renderField = (f: Field, value: string | boolean | undefined, set: (v: string | boolean) => void, err: string | undefined, id: string) => {
    const label = t(f.label);
    const help = f.help ? t(f.help) : undefined;
    const max = maxOf(f);
    const errorId = err ? `${id}-error` : undefined;
    const helpId = help ? `${id}-help` : undefined;
    const described = [errorId, helpId].filter(Boolean).join(" ") || undefined;
    const common = { id, "aria-invalid": err ? true : undefined, "aria-describedby": described, "aria-required": f.required || undefined };
    if (f.type === "checkbox") {
      // 줄의 높이는 44px 이상입니다(누르는 자리). 상자를 키우지 않고 줄에 여백을 줍니다.
      return (
        <label key={f.key} className={`flex min-h-[44px] cursor-pointer items-start gap-3 py-2 ${BODY} text-white/85`}>
          <input {...common} type="checkbox" checked={value === true} onChange={(e) => set(e.target.checked)} className="mt-1 h-5 w-5 shrink-0 rounded border-white/45 bg-white/[0.04] accent-accent" />
          <span>
            <span className="font-semibold">{label}</span>{f.required && <span aria-hidden className="ml-1 text-rose-400">*</span>}
            {help && <span id={helpId} className={`mt-1 block ${META} leading-relaxed text-white/70`}>{help}</span>}
            {err && <span id={errorId} className={`mt-1 block ${META} font-medium text-rose-300`}>{errText(err, max)}</span>}
          </span>
        </label>
      );
    }
    // DECIDED 2026-10-07 (신청 폼 브리프 2.3): radio는 세로로 쌓인 선택 카드입니다. 카드 하나에 단계 숫자, 한 것(굵게),
    // 그 아래 예(작게). 실제 <input type="radio">가 카드마다 있고 눈에만 숨깁니다. 같은 name이라 화살표 키로 옮기고
    // 스페이스로 고르는 것은 브라우저가 합니다. 포커스 링과 고른 표시는 peer로 카드에 그립니다.
    // 글자 크기는 BODY와 META 둘뿐입니다(CLAUDE.md의 "한 화면 글자 크기 셋 이하"). 도움말은 질문 바로 아래입니다.
    if (f.type === "radio") {
      const labelId = `${id}-label`;
      return (
        <div key={f.key} role="radiogroup" aria-labelledby={labelId} aria-describedby={described} aria-required={f.required || undefined} aria-invalid={err ? true : undefined} className="flex flex-col gap-1.5">
          <span id={labelId} className={`${BODY} font-semibold leading-snug text-white/85`}>
            {label}{f.required && <span aria-hidden className="ml-1 text-rose-400">*</span>}
          </span>
          {help && <span id={helpId} className={`${META} leading-relaxed text-white/70`}>{help}</span>}
          <div className="mt-1 flex flex-col gap-2">
            {(f.options ?? []).map((o, n) => (
              <label key={o.value} className="relative block cursor-pointer">
                <input
                  type="radio" name={id} id={n === 0 ? id : undefined} value={o.value} checked={value === o.value}
                  onChange={() => set(o.value)} required={f.required}
                  aria-describedby={errorId}
                  className="peer sr-only"
                />
                <span className="flex items-start gap-3 rounded-xl border border-white/45 bg-white/[0.04] px-4 py-3 transition hover:border-white/70 peer-checked:border-accent peer-checked:bg-accent/[0.12] peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent peer-checked:[&>span:first-child]:border-accent peer-checked:[&>span:first-child]:bg-naru-purple peer-checked:[&>span:first-child]:text-white">
                  <span aria-hidden className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/45 ${META} font-bold text-white/80`}>{n + 1}</span>
                  <span className="min-w-0">
                    <span className={`block break-keep ${BODY} font-bold leading-snug text-white`}>{t(o.label)}</span>
                    {o.hint && <span className={`mt-1 block break-keep ${META} leading-relaxed text-white/70`}>{t(o.hint)}</span>}
                  </span>
                </span>
              </label>
            ))}
          </div>
          {err && <span id={errorId} className={`${META} font-medium text-rose-300`}>{errText(err, max)}</span>}
        </div>
      );
    }
    return (
      <div key={f.key} className="flex flex-col gap-1.5">
        <label htmlFor={id} className={`flex items-center gap-1.5 ${BODY} font-semibold text-white/85`}>
          {label}
          {f.required ? <span aria-hidden className="text-rose-400">*</span> : <span className={`${META} font-normal text-white/70`}>{t(copy.optional)}</span>}
        </label>
        {f.type === "textarea" ? (
          <textarea {...common} value={String(value ?? "")} maxLength={max} rows={3} onChange={(e) => set(e.target.value)} className={FIELD} />
        ) : f.type === "select" || f.type === "country" ? (
          <select {...common} value={String(value ?? "")} onChange={(e) => set(e.target.value)} className={`${FIELD} appearance-none`}>
            <option value="">{t(copy.selectPlaceholder)}</option>
            {(f.options ?? []).map((o) => <option key={o.value} value={o.value}>{t(o.label)}</option>)}
          </select>
        ) : (
          <input
            {...common} type={f.type === "email" ? "email" : "text"} inputMode={f.inputMode} value={String(value ?? "")} maxLength={max}
            onChange={(e) => set(e.target.value)} placeholder={f.placeholder ? t(f.placeholder) : undefined} className={FIELD}
            autoComplete={f.autoComplete ?? "off"}
            {...(f.verbatim ? { autoCapitalize: "none", autoCorrect: "off", spellCheck: false } : {})}
          />
        )}
        {help && <span id={helpId} className={`${META} leading-relaxed text-white/70`}>{help}</span>}
        {err && <span id={errorId} className={`${META} font-medium text-rose-300`}>{errText(err, max)}</span>}
      </div>
    );
  };

  if (typeof document === "undefined") return null;
  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduce ? 0 : 0.2 }}>
          <div aria-hidden onClick={onClose} className="absolute inset-0 cursor-default touch-none bg-black/70 backdrop-blur-sm" />
          <motion.div
            ref={dialogRef}
            role="dialog" aria-modal="true" aria-labelledby="crossing-register-title"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 40, scale: 0.985 }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.985 }}
            transition={{ duration: reduce ? 0 : 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 flex max-h-[88dvh] w-full max-w-[560px] flex-col overflow-hidden rounded-t-3xl border border-white/15 bg-naru-surface shadow-2xl sm:rounded-3xl"
          >
            <span aria-hidden className="h-[2px] w-full shrink-0 bg-gradient-to-r from-accent to-accent-strong" />
            {/* 닫기 버튼의 면은 대화상자와 같은 어두운 면입니다. 반투명이면 스크롤된 글이 아래로 비쳐 X와 겹쳤습니다(모바일 리뷰 9). */}
            <button ref={closeRef} type="button" onClick={onClose} aria-label={t(copy.close)} className="absolute right-4 top-5 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-naru-surface text-white/80 transition hover:border-white/45 hover:text-white active:scale-95">
              <svg aria-hidden width="16" height="16" viewBox="0 0 15 15" fill="none"><path d="M1 1l13 13M14 1L1 14" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>
            </button>
            <div className="overflow-y-auto overscroll-contain px-6 pt-8 pb-[max(1.75rem,env(safe-area-inset-bottom))] sm:px-9 sm:py-9">
              {status === "success" ? (
                <div className="py-6 text-center">
                  <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-accent/40 bg-accent/10">
                    <svg aria-hidden width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="text-accent"><path d="M4 12.5l5 5L20 6.5" /></svg>
                  </span>
                  <h3 ref={successRef} tabIndex={-1} id="crossing-register-title" className={`mt-6 ${LARGE} font-bold leading-tight text-white focus:outline-none`}>{t(copy.successTitle)}</h3>
                  <p className={`mx-auto mt-3 max-w-sm break-keep ${BODY} leading-relaxed text-white/85`}>{t(copy.successBody).replace("{email}", sentEmail)}</p>
                  <p className={`mx-auto mt-3 max-w-sm break-keep ${META} leading-relaxed text-white/70`}>{t(copy.successHelp)}</p>
                  <a href={naruLinks.general} className={`mt-2 inline-flex min-h-[44px] items-center ${BODY} font-semibold text-accent underline underline-offset-4 hover:text-white`}>{naruLinks.contact}</a>
                  {links.openChat && (
                    <p><a href={links.openChat} target="_blank" rel="noopener noreferrer" className={`inline-flex min-h-[44px] items-center ${BODY} text-white/85 underline underline-offset-4 hover:text-white`}>{t(openChatLabels.footer)}</a></p>
                  )}
                  <div className="mt-5"><button type="button" onClick={onClose} className={PRIMARY}>{t(copy.close)}</button></div>
                </div>
              ) : (
                <>
                  <h3 id="crossing-register-title" className={`pr-12 ${LARGE} font-bold leading-tight text-white`}>{t(copy.title)}</h3>
                  <p className={`mt-2 break-keep pr-12 ${BODY} leading-relaxed text-white/85`}>{t(copy.intro)}</p>
                  <p className={`mt-1 ${META} leading-relaxed text-white/70`}>{t(copy.draftNote)}</p>
                  {(preview || closed) && (
                    <p id="crossing-register-preview" role="note" className={`mt-4 rounded-2xl border border-dashed border-amber-400/40 bg-amber-400/[0.07] px-4 py-3 ${BODY} leading-relaxed text-amber-50/90`}>{t(closed ? copy.closed : copy.previewBanner)}</p>
                  )}
                  <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4" noValidate>
                    {/* 허니팟. 8월과 같은 세 겹의 방어(이름, 매니저 opt-out, 서버 로그). */}
                    <input type="text" name="url_confirm" value={website} onChange={(e) => setWebsite(e.target.value)} tabIndex={-1} aria-hidden="true" autoComplete="off" data-1p-ignore data-lpignore="true" data-bwignore data-form-type="other" style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }} />
                    {MEMBER_FIELDS.map((f) => {
                      // 나라 이름은 "그 밖의 나라"를 골랐을 때만 묻고, 그때는 필수입니다(validatePerson과 같은 규칙).
                      if (f.key === COUNTRY_OTHER_KEY && !otherCountry) return null;
                      const field = f.key === COUNTRY_OTHER_KEY ? { ...f, required: true } : f;
                      return renderField(field, person[f.key], (v) => setPersonField(f.key, v), errors[`m.${f.key}`], `m-${f.key}`);
                    })}
                    {REGISTRATION_FIELDS.filter((f) => !f.fixed).map((f) => renderField(f, reg[f.key], (v) => setRegField(f.key, v), errors[`reg.${f.key}`], `reg-${f.key}`))}
                    {REGISTRATION_FIELDS.filter((f) => f.key === "consent").map((f) => renderField(f, reg[f.key], (v) => setRegField(f.key, v), errors[`reg.${f.key}`], `reg-${f.key}`))}
                    {turnstileSiteKey && !preview && (
                      <TurnstileWidget siteKey={turnstileSiteKey} action={TURNSTILE_ACTION} locale={locale === "en" ? "en" : "ko"} onToken={setBotToken} onError={setBotFailed} resetKey={botReset} />
                    )}
                    {botFailed && !preview && status !== "error" && <p role="alert" className={`${BODY} font-medium text-rose-300`}>{errText("bot_check_load_failed")}</p>}
                    {status === "error" && <p role="alert" className={`${BODY} font-medium text-rose-300`}>{errText(errorCode ?? "generic")}</p>}
                    {preview ? (
                      // 꺼진 버튼은 흐림이 아니라 색으로 말합니다(히어로의 준비 중 버튼과 같은 문법). 이유는 위 안내가 읽어 줍니다.
                      <button type="submit" disabled aria-describedby="crossing-register-preview" className={`mt-2 inline-flex min-h-[48px] cursor-not-allowed items-center justify-center rounded-full border border-white/20 bg-white/[0.06] px-7 py-3 ${BODY} font-bold text-white/70`}>{t(closed ? copy.closed : copy.previewSubmit)}</button>
                    ) : (
                      <button type="submit" disabled={status === "submitting"} className={`${PRIMARY} mt-2`}>{t(status === "submitting" ? copy.submitting : copy.submit)}</button>
                    )}
                  </form>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
