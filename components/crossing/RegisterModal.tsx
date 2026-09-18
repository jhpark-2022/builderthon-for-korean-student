"use client";

// ─────────────────────────────────────────────────────────────────────────────
// 크로싱 서울 등록 폼 (2026-09-18, Supabase 등록 브리프 2.4).
//
// 8월 RegisterModal(1,551줄)을 복제하지 않습니다. data/crossingForm.ts의 스키마를 돌며
// 필드를 그립니다. 질문이 바뀌면 스키마 한 줄이면 됩니다. 8월 모달에서 가져온 것은
// 껍데기뿐: 열기/닫기, ESC·배경 클릭, 스크롤 잠금, 팀원 추가(최대 3인), 제출 중·완료·
// 오류 상태, localStorage 초안. 시각은 8월 문법(Glass 패널, 그라데이션 필 1차 버튼).
// 완료 화면은 "등록됐습니다. 며칠 안에 안내 메일을 보냅니다." + 문의 메일. 오픈채팅은
// 닫혀 있어 언급하지 않습니다(links.openChat이 비면 숨는 규칙 그대로).
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useLocale } from "@/lib/LocaleContext";
import { useBodyScrollLock } from "@/lib/useBodyScrollLock";
import { CURRENT_EVENT } from "@/lib/registrationWindow";
import { naruLinks, register as copy } from "@/data/naru";
import { links, type Phrase } from "@/data/dictionary";
import {
  COUNTRY_OTHER, MEMBER_FIELDS, REGISTRATION_FIELDS, MAX_MEMBERS, MAX_TEXT, MAX_TEXTAREA,
  type Field, validateField,
} from "@/data/crossingForm";

const DRAFT_KEY = `naru.register.${CURRENT_EVENT}.draft`;
const FIELD = "w-full rounded-xl border border-white/[0.12] bg-white/[0.04] px-4 py-3 text-base text-white placeholder:text-white/35 outline-none transition focus:border-violet-400/50 focus:bg-white/[0.06]";
const PRIMARY = "inline-flex min-h-[48px] items-center justify-center rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 px-7 py-3.5 text-base font-bold text-white shadow-[0_8px_36px_rgba(124,58,237,0.5)] transition hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0";

type Answers = Record<string, string | boolean>;
type Member = { id: number; a: Answers; other: string };
type Status = "idle" | "submitting" | "success" | "error";

const emptyMember = (id: number): Member => ({ id, a: {}, other: "" });

export default function RegisterModal({ open, onClose, onRegistered, refSource }: {
  open: boolean; onClose: () => void; onRegistered: () => void; refSource: string | null;
}) {
  const { t } = useLocale();
  const reduce = useReducedMotion();
  const [reg, setReg] = useState<Answers>({});
  const [members, setMembers] = useState<Member[]>([emptyMember(1)]);
  const [website, setWebsite] = useState(""); // 허니팟(url_confirm). 초안에 넣지 않습니다.
  const [status, setStatus] = useState<Status>("idle");
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(2);

  const isTeam = reg.join_type === "team";
  const visibleMembers = isTeam ? members : members.slice(0, 1);

  useBodyScrollLock(open);

  // 초안 복원(마운트 뒤, 클라이언트만).
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const d = JSON.parse(raw) as { reg?: Answers; members?: Member[] };
        if (d.reg) setReg(d.reg);
        if (Array.isArray(d.members) && d.members.length) {
          setMembers(d.members.map((m, i) => ({ id: i + 1, a: m.a ?? {}, other: m.other ?? "" })));
          nextId.current = d.members.length + 1;
        }
      }
    } catch { /* corrupt draft */ }
  }, []);
  // 초안 저장(입력할 때마다). 완료하면 지웁니다.
  useEffect(() => {
    if (!touched || status === "success") return;
    try { window.localStorage.setItem(DRAFT_KEY, JSON.stringify({ reg, members })); } catch { /* ignore */ }
  }, [reg, members, touched, status]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { e.preventDefault(); onClose(); } };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const setRegField = (k: string, v: string | boolean) => { setTouched(true); setReg((r) => ({ ...r, [k]: v })); };
  const setMemberField = (id: number, k: string, v: string | boolean) => { setTouched(true); setMembers((ms) => ms.map((m) => (m.id === id ? { ...m, a: { ...m.a, [k]: v } } : m))); };
  const setMemberOther = (id: number, v: string) => { setTouched(true); setMembers((ms) => ms.map((m) => (m.id === id ? { ...m, other: v } : m))); };
  const addMember = () => setMembers((ms) => (ms.length >= MAX_MEMBERS ? ms : [...ms, emptyMember(nextId.current++)]));
  const removeMember = (id: number) => setMembers((ms) => (ms.length <= 1 ? ms : ms.filter((m) => m.id !== id)));

  /** 서버로 보내는 꼴. country OTHER는 직접 넣은 두 글자 코드로. */
  const payload = useMemo(() => ({
    eventSlug: CURRENT_EVENT,
    ref: refSource,
    submittedAt: new Date().toISOString(),
    url_confirm: website,
    registration: reg,
    members: visibleMembers.map((m) => {
      const a: Answers = { ...m.a };
      if (a.study_country === COUNTRY_OTHER) a.study_country = m.other.trim().toUpperCase();
      return a;
    }),
  }), [reg, visibleMembers, website, refSource]);

  const validate = (): Record<string, string> => {
    const e: Record<string, string> = {};
    for (const f of REGISTRATION_FIELDS) {
      if (f.key === "team_name" && !isTeam) continue;
      if (f.key === "wants_matching") continue;
      const err = validateField(f, reg[f.key]);
      if (err) e[`reg.${f.key}`] = err;
    }
    if (isTeam && !String(reg.team_name ?? "").trim()) e["reg.team_name"] = "required";
    payload.members.forEach((a, i) => {
      for (const f of MEMBER_FIELDS) {
        const err = validateField(f, a[f.key]);
        if (err) e[`m${i}.${f.key}`] = err;
      }
    });
    const emails = payload.members.map((a) => String(a.email ?? "").trim().toLowerCase()).filter(Boolean);
    if (new Set(emails).size !== emails.length) e["m1.email"] = "duplicate_email";
    return e;
  };

  const onSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) {
      dialogRef.current?.querySelector<HTMLElement>("[aria-invalid='true']")?.focus();
      return;
    }
    setStatus("submitting"); setErrorCode(null);
    try {
      const res = await fetch("/api/crossing/register", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) { setStatus("error"); setErrorCode(data.error ?? "generic"); return; }
      setStatus("success");
      try { window.localStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ }
      onRegistered();
    } catch {
      setStatus("error"); setErrorCode("generic");
    }
  };

  const errText = (code: string | undefined) => (code ? t((copy.errors as Record<string, Phrase>)[code] ?? copy.errors.generic) : undefined);

  const renderField = (f: Field, value: string | boolean | undefined, set: (v: string | boolean) => void, err: string | undefined, id: string, extra?: { other: string; setOther: (v: string) => void }) => {
    const label = t(f.label);
    const help = f.help ? t(f.help) : undefined;
    const errorId = err ? `${id}-error` : undefined;
    const common = { id, "aria-invalid": err ? true : undefined, "aria-describedby": errorId };
    if (f.type === "checkbox") {
      return (
        <label key={f.key} className="flex items-start gap-3 text-sm text-white/85">
          <input {...common} type="checkbox" checked={value === true} onChange={(e) => set(e.target.checked)} className="mt-1 h-4 w-4 rounded border-white/30 bg-white/[0.04] accent-violet-500" />
          <span>
            {label}{f.required && <span aria-hidden className="ml-1 text-rose-400">*</span>}
            {help && <span className="mt-0.5 block text-xs text-white/55">{help}</span>}
            {err && <span id={errorId} className="mt-0.5 block text-xs font-medium text-rose-300">{errText(err)}</span>}
          </span>
        </label>
      );
    }
    const max = f.maxLen ?? (f.type === "textarea" ? MAX_TEXTAREA : MAX_TEXT);
    return (
      <div key={f.key} className="flex flex-col gap-1.5">
        <label htmlFor={id} className="flex items-center gap-1.5 text-sm font-semibold text-white/85">
          {label}{f.required && <span aria-hidden className="text-rose-400">*</span>}
        </label>
        {f.type === "textarea" ? (
          <textarea {...common} value={String(value ?? "")} maxLength={max} rows={3} onChange={(e) => set(e.target.value)} className={FIELD} />
        ) : f.type === "select" || f.type === "country" ? (
          <>
            <select {...common} value={String(value ?? "")} onChange={(e) => set(e.target.value)} className={`${FIELD} appearance-none`}>
              <option value="">{"—"}</option>
              {(f.options ?? []).map((o) => <option key={o.value} value={o.value}>{t(o.label)}</option>)}
            </select>
            {f.type === "country" && value === COUNTRY_OTHER && extra && (
              <input type="text" value={extra.other} maxLength={2} onChange={(e) => extra.setOther(e.target.value)} placeholder="JP" className={`${FIELD} uppercase`} aria-label={label} />
            )}
          </>
        ) : (
          <input {...common} type={f.type === "email" ? "email" : "text"} value={String(value ?? "")} maxLength={max} onChange={(e) => set(e.target.value)} placeholder={f.placeholder ? t(f.placeholder) : undefined} className={FIELD} autoComplete={f.type === "email" ? "email" : "off"} />
        )}
        {help && <span className="text-xs leading-relaxed text-white/60">{help}</span>}
        {err && <span id={errorId} className="text-xs font-medium text-rose-300">{errText(err)}</span>}
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
            className="relative z-10 flex max-h-[88dvh] w-full max-w-[560px] flex-col overflow-hidden rounded-t-3xl border border-white/15 bg-[#0c0a18] shadow-2xl sm:rounded-3xl"
          >
            <span aria-hidden className="h-[2px] w-full shrink-0 bg-gradient-to-r from-accent to-accent-strong" />
            <button type="button" onClick={onClose} aria-label={t(copy.close)} className="absolute right-5 top-6 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/70 transition hover:bg-white/10 hover:text-white active:scale-95">
              <svg width="16" height="16" viewBox="0 0 15 15" fill="none"><path d="M1 1l13 13M14 1L1 14" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>
            </button>
            <div className="overflow-y-auto overscroll-contain px-6 pt-8 pb-[max(1.75rem,env(safe-area-inset-bottom))] sm:px-9 sm:py-9">
              {status === "success" ? (
                <div className="py-6 text-center">
                  <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-400/10">
                    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-300"><path d="M4 12.5l5 5L20 6.5" /></svg>
                  </span>
                  <h3 id="crossing-register-title" className="mt-6 text-[24px] font-bold leading-tight text-white sm:text-[28px]">{t(copy.successTitle)}</h3>
                  <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-white/70">{t(copy.successBody)}</p>
                  <a href={naruLinks.general} className="mt-4 inline-block text-sm text-white/65 underline-offset-4 hover:text-white hover:underline">{t(copy.successMail)}</a>
                  {links.openChat && <p className="mt-4 text-sm text-white/60"><a href={links.openChat} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">Open chat</a></p>}
                  <div className="mt-7"><button type="button" onClick={onClose} className={PRIMARY}>{t(copy.close)}</button></div>
                </div>
              ) : (
                <>
                  <h3 id="crossing-register-title" className="pr-12 text-[24px] font-bold leading-tight text-white sm:text-[28px]">{t(copy.title)}</h3>
                  <p className="mt-2 text-sm text-white/65">{t(copy.intro)}</p>
                  <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4" noValidate>
                    {/* 허니팟. 8월과 같은 세 겹의 방어(이름, 매니저 opt-out, 서버 로그). */}
                    <input type="text" name="url_confirm" value={website} onChange={(e) => setWebsite(e.target.value)} tabIndex={-1} aria-hidden="true" autoComplete="off" data-1p-ignore data-lpignore="true" data-bwignore data-form-type="other" style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }} />
                    {REGISTRATION_FIELDS.filter((f) => f.key === "join_type").map((f) => renderField(f, reg[f.key], (v) => setRegField(f.key, v), errors[`reg.${f.key}`], `reg-${f.key}`))}
                    {isTeam && (
                      <>
                        {REGISTRATION_FIELDS.filter((f) => f.key === "team_name").map((f) => renderField({ ...f, required: true }, reg[f.key], (v) => setRegField(f.key, v), errors[`reg.${f.key}`], `reg-${f.key}`))}
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-violet-200/80">{t(copy.teamSize)}</p>
                      </>
                    )}
                    {!isTeam && REGISTRATION_FIELDS.filter((f) => f.key === "wants_matching").map((f) => renderField(f, reg[f.key], (v) => setRegField(f.key, v), undefined, `reg-${f.key}`))}
                    {visibleMembers.map((m, i) => (
                      <fieldset key={m.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                        <legend className="flex w-full items-center justify-between px-1 text-sm font-bold text-violet-200">
                          <span>{i === 0 ? t(copy.memberYou) : t(copy.memberN).replace("{n}", String(i))}</span>
                          {i > 0 && <button type="button" onClick={() => removeMember(m.id)} className="text-xs font-medium text-white/55 hover:text-white">{t(copy.removeMember)}</button>}
                        </legend>
                        <div className="mt-2 flex flex-col gap-4">
                          {MEMBER_FIELDS.map((f) => renderField(f, m.a[f.key], (v) => setMemberField(m.id, f.key, v), errors[`m${i}.${f.key}`], `m${m.id}-${f.key}`, { other: m.other, setOther: (v) => setMemberOther(m.id, v) }))}
                        </div>
                      </fieldset>
                    ))}
                    {isTeam && members.length < MAX_MEMBERS && (
                      <button type="button" onClick={addMember} className="self-start rounded-full border border-white/20 bg-white/[0.06] px-4 py-2 text-sm font-medium text-white/80 transition hover:border-white/35 hover:text-white">+ {t(copy.addMember)}</button>
                    )}
                    {REGISTRATION_FIELDS.filter((f) => f.key === "consent").map((f) => renderField(f, reg[f.key], (v) => setRegField(f.key, v), errors[`reg.${f.key}`], `reg-${f.key}`))}
                    {REGISTRATION_FIELDS.filter((f) => !f.fixed).map((f) => renderField(f, reg[f.key], (v) => setRegField(f.key, v), errors[`reg.${f.key}`], `reg-${f.key}`))}
                    {status === "error" && <p role="alert" className="text-sm font-medium text-rose-300">{errText(errorCode ?? "generic")}</p>}
                    <button type="submit" disabled={status === "submitting"} className={`${PRIMARY} mt-2`}>{t(status === "submitting" ? copy.submitting : copy.submit)}</button>
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
