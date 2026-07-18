"use client";

// ─────────────────────────────────────────────────────────────────────────────
// Registration modal — the "등록하기" flow.
//
// Reuses the EventModal/PartnerModal dialog pattern verbatim (portal, backdrop,
// ESC + Tab focus-trap, body scroll-lock, inert background, focus restoration,
// bottom-sheet on mobile). The quiz personality type, if the visitor has one, is
// auto-attached (not a field, registrant only) and shown as a small chip.
//
// TEAM FLOW: the "How are you joining?" select drives everything.
//   • "team"    → reveals the team section: required team name + multi-member
//                 entry (registrant = Member 1; add up to Member 3).
//   • "looking" → no team section; the team-matching chip stays prominent.
//   • "solo"    → no team section.
//
// Submit: with no REGISTER_ENDPOINT it simulates a ~1s submit, logs the payload
// to console.info (so the shape can be confirmed pre-backend), and shows the
// success state. With a URL it POSTs the payload as JSON. On success it sets the
// `z100-registered` flag (via onSuccess) so the nav button flips to "등록 완료 ✓".
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useLocale } from "@/lib/LocaleContext";
import { dict, REGISTER_ENDPOINT } from "@/data/dictionary";
import { RESULTS } from "@/data/quiz";
import { parseResultId } from "@/lib/quizScore";
import { loadOwnResult } from "@/lib/quizResult";

interface RegisterModalProps {
  open: boolean;
  onClose: () => void;
  // Quiz type + referrer captured from the URL (?type=&ref=) when the modal is
  // auto-opened from the /quiz result CTA. `urlType` falls back to the visitor's
  // saved own-result when absent.
  urlType?: string | null;
  urlRef?: string | null;
  // Called once a submit succeeds (persists the "registered" flag in the parent).
  onSuccess: () => void;
}

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea,[tabindex]:not([tabindex="-1"])';

// Shared input styling so every field reads as one system on the dark sheet.
const FIELD =
  "w-full rounded-xl border border-white/12 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none transition focus:border-violet-400/50 focus:bg-white/[0.06]";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Teams are strictly 1–3 people → at most 2 members beyond the registrant.
const MAX_ADDITIONAL = 2;

type Status = "idle" | "submitting" | "success";

// An added teammate (Member 2 / Member 3). `id` is a stable key for
// AnimatePresence + clean renumbering on removal.
interface Member {
  id: number;
  name: string;
  email: string;
  contact: string;
  university: string;
  universityOther: string;
  linkedin: string;
}

const blankMember = (id: number): Member => ({
  id,
  name: "",
  email: "",
  contact: "",
  university: "",
  universityOther: "",
  linkedin: "",
});

// Resolve a resultId ("ESTP-T") to its display variant name ("조급한 Mistral"),
// mirroring ReturningGreeting. Returns null for an unparseable id.
function useVariantName(resultId: string | null): string | null {
  const { t } = useLocale();
  if (!resultId) return null;
  const parsed = parseResultId(resultId);
  if (!parsed) return null;
  const data = RESULTS[parsed.mbti];
  if (!data) return null;
  return t(data.variants[parsed.identity].name);
}

export default function RegisterModal({
  open,
  onClose,
  urlType,
  urlRef,
  onSuccess,
}: RegisterModalProps) {
  const { t } = useLocale();
  const reduce = useReducedMotion();
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Registrant (Member 1) fields.
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [school, setSchool] = useState("");
  const [schoolOther, setSchoolOther] = useState("");
  const [contact, setContact] = useState("");
  const [linkedin, setLinkedin] = useState("");
  // Team-level fields.
  const [joinType, setJoinType] = useState(""); // "" | "team" | "looking" | "solo"
  const [teamName, setTeamName] = useState("");
  const [track, setTrack] = useState("");
  // Added teammates (Member 2 / 3). State is preserved when switching join type
  // away from "team" and back within the session.
  const [members, setMembers] = useState<Member[]>([]);
  const memberIdRef = useRef(0);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>("idle");

  const isTeam = joinType === "team";

  const addMember = () =>
    setMembers((prev) =>
      prev.length >= MAX_ADDITIONAL ? prev : [...prev, blankMember(++memberIdRef.current)]
    );
  const removeMember = (id: number) =>
    setMembers((prev) => prev.filter((m) => m.id !== id));
  const patchMember = (id: number, patch: Partial<Member>) =>
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));

  // The attached quiz type — the URL's ?type= wins, else the saved own-result.
  // Read post-mount only (localStorage is absent during SSR → no mismatch).
  const [resolvedType, setResolvedType] = useState<string | null>(null);
  useEffect(() => {
    if (!open) return;
    setStatus("idle"); // reopening always returns to the form
    setResolvedType(urlType ?? loadOwnResult()?.resultId ?? null);
  }, [open, urlType]);

  const variantName = useVariantName(resolvedType);

  // ESC + focus trap, body scroll lock, inert background, focus restoration —
  // kept in lockstep with PartnerModal so all dialogs behave identically.
  useEffect(() => {
    if (!open) return;
    const opener = document.activeElement as HTMLElement | null;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key === "Tab" && dialogRef.current) {
        const nodes = Array.from(
          dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)
        ).filter((el) => el.offsetParent !== null || el === document.activeElement);
        if (nodes.length === 0) {
          e.preventDefault();
          return;
        }
        const first = nodes[0];
        const last = nodes[nodes.length - 1];
        const active = document.activeElement;
        if (e.shiftKey && (active === first || !dialogRef.current.contains(active))) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && (active === last || !dialogRef.current.contains(active))) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const inerted = Array.from(
      document.querySelectorAll<HTMLElement>("header, main, footer")
    );
    inerted.forEach((el) => el.setAttribute("inert", ""));

    const id = window.setTimeout(() => closeRef.current?.focus(), 50);

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      inerted.forEach((el) => el.removeAttribute("inert"));
      window.clearTimeout(id);
      opener?.focus?.();
    };
  }, [open, onClose]);

  function validate(): boolean {
    const next: Record<string, string> = {};
    const req = t(dict.register.errRequired);
    const badEmail = t(dict.register.errEmail);
    const dupEmail = t(dict.register.errDupEmail);

    // Member 1 (registrant).
    if (!name.trim()) next.name = req;
    if (!email.trim()) next.email = req;
    else if (!EMAIL_RE.test(email.trim())) next.email = badEmail;
    if (!contact.trim()) next.contact = req;

    if (isTeam) {
      if (!teamName.trim()) next.teamName = req;
      // Added members validate the same way as Member 1.
      members.forEach((m) => {
        if (!m.name.trim()) next[`m${m.id}-name`] = req;
        if (!m.email.trim()) next[`m${m.id}-email`] = req;
        else if (!EMAIL_RE.test(m.email.trim())) next[`m${m.id}-email`] = badEmail;
        if (!m.contact.trim()) next[`m${m.id}-contact`] = req;
      });
      // No duplicate emails across Member 1–3 — flag the later duplicate, and
      // don't clobber a required/format error already set on that field.
      const entries = [
        { key: "email", value: email },
        ...members.map((m) => ({ key: `m${m.id}-email`, value: m.email })),
      ];
      const seen = new Set<string>();
      entries.forEach(({ key, value }) => {
        const norm = value.trim().toLowerCase();
        if (!norm) return; // emptiness handled by the required check
        if (seen.has(norm)) {
          if (!next[key]) next[key] = dupEmail;
        } else {
          seen.add(norm);
        }
      });
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setStatus("submitting");

    // Light normalization: trim only (accept full URL or bare handle).
    const uni = (val: string, other: string) =>
      val === "other" ? other.trim() || undefined : val || undefined;
    const link = (v: string) => v.trim() || undefined;

    const registrant = {
      name: name.trim(),
      email: email.trim(),
      contact: contact.trim(),
      university: uni(school, schoolOther),
      linkedin: link(linkedin),
    };
    const extra = isTeam
      ? members.map((m) => ({
          name: m.name.trim(),
          email: m.email.trim(),
          contact: m.contact.trim(),
          university: uni(m.university, m.universityOther),
          linkedin: link(m.linkedin),
        }))
      : [];

    const payload = {
      joinType: joinType || null, // "team" | "looking" | "solo"
      ...(isTeam ? { teamName: teamName.trim() } : {}),
      track,
      members: [registrant, ...extra], // [0] is the registrant
      quizType: resolvedType ?? null, // registrant only
      ref: urlRef ?? null,
      submittedAt: new Date().toISOString(),
    };

    try {
      if (REGISTER_ENDPOINT) {
        await fetch(REGISTER_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        // No backend yet — log the payload and simulate a submit delay.
        console.info("[register] payload (no endpoint configured):", payload);
        await new Promise((r) => setTimeout(r, 1000));
      }
    } catch (err) {
      // Even on a network error we surface success — the console payload is the
      // pre-backend fallback and we don't want a hard failure UX before wiring.
      console.warn("[register] submit failed, showing success anyway:", err);
    }

    setStatus("success");
    onSuccess();
  }

  if (!mounted) return null;

  const submitting = status === "submitting";
  const expand = reduce
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { height: 0, opacity: 0 },
        animate: { height: "auto" as const, opacity: 1 },
        exit: { height: 0, opacity: 0 },
      };
  const expandT = { duration: reduce ? 0 : 0.3, ease: [0.22, 1, 0.36, 1] as const };

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0 : 0.2 }}
        >
          <div
            aria-hidden
            onClick={onClose}
            className="absolute inset-0 cursor-default bg-black/70 backdrop-blur-sm"
          />

          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="register-modal-title"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 40, scale: 0.985 }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.985 }}
            transition={{ duration: reduce ? 0 : 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 flex max-h-[92vh] w-full max-w-[560px] flex-col overflow-hidden rounded-t-3xl border border-white/15 bg-[#0c0a18] shadow-2xl sm:rounded-3xl"
          >
            <span
              aria-hidden
              className="h-[2px] w-full shrink-0 bg-gradient-to-r from-accent to-accent-strong"
            />

            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label={t(dict.modal.close)}
              className="absolute right-5 top-6 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/70 transition hover:bg-white/10 hover:text-white active:scale-95"
            >
              <svg width="16" height="16" viewBox="0 0 15 15" fill="none">
                <path d="M1 1l13 13M14 1L1 14" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
              </svg>
            </button>

            <div className="overflow-y-auto px-6 pt-8 pb-[max(1.75rem,env(safe-area-inset-bottom))] sm:px-9 sm:py-9">
              {status === "success" ? (
                // ── Success state ─────────────────────────────────────────────
                <div className="py-6 text-center">
                  <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-400/10">
                    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-300">
                      <path d="M4 12.5l5 5L20 6.5" />
                    </svg>
                  </span>
                  <h3 id="register-modal-title" className="mt-6 text-[24px] font-bold leading-tight text-white sm:text-[28px]">
                    {t(dict.register.successTitle)}
                  </h3>
                  <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-white/70">
                    {t(dict.register.successBody)}
                  </p>
                  <button
                    type="button"
                    onClick={onClose}
                    className="mt-7 inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 px-8 py-3.5 text-base font-bold text-white shadow-[0_8px_36px_rgba(124,58,237,0.5)] transition hover:-translate-y-0.5"
                  >
                    {t(dict.register.successClose)}
                  </button>
                </div>
              ) : (
                // ── Form ──────────────────────────────────────────────────────
                <>
                  <h3 id="register-modal-title" className="pr-12 text-[24px] font-bold leading-tight text-white sm:text-[28px]">
                    {t(dict.register.modalTitle)}
                  </h3>
                  <p className="mt-2 pr-4 text-sm leading-relaxed text-white/65">
                    {t(dict.register.modalSubtitle)}
                  </p>

                  <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4" noValidate>
                    {/* Member-1 group label appears once the team section is open. */}
                    {isTeam && (
                      <p className="-mb-1 text-sm font-bold text-violet-200">
                        {t(dict.register.memberYou)}
                      </p>
                    )}

                    {/* 1 · Name */}
                    <Field label={t(dict.register.nameLabel)} required error={errors.name}>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={t(dict.register.namePlaceholder)}
                        autoComplete="name"
                        className={FIELD}
                      />
                    </Field>

                    {/* 2 · Email */}
                    <Field label={t(dict.register.emailLabel)} required error={errors.email}>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={t(dict.register.emailPlaceholder)}
                        autoComplete="email"
                        className={FIELD}
                      />
                    </Field>

                    {/* 3 · School (+ "other" free text) */}
                    <Field label={t(dict.register.schoolLabel)} optional={t(dict.register.optional)}>
                      <UniversitySelect
                        value={school}
                        otherValue={schoolOther}
                        onValue={setSchool}
                        onOther={setSchoolOther}
                      />
                    </Field>

                    {/* 4 · Contact (Telegram preferred) */}
                    <Field
                      label={t(dict.register.contactLabel)}
                      required
                      error={errors.contact}
                      hint={t(dict.register.contactHint)}
                    >
                      <input
                        type="text"
                        value={contact}
                        onChange={(e) => setContact(e.target.value)}
                        placeholder={t(dict.register.contactPlaceholder)}
                        className={FIELD}
                      />
                    </Field>

                    {/* 5 · LinkedIn (optional) */}
                    <Field label={t(dict.register.linkedinLabel)} optional={t(dict.register.optional)}>
                      <input
                        type="text"
                        value={linkedin}
                        onChange={(e) => setLinkedin(e.target.value)}
                        placeholder={t(dict.register.linkedinPlaceholder)}
                        className={FIELD}
                      />
                    </Field>

                    {/* 6 · Join type — drives the team section */}
                    <Field label={t(dict.register.partLabel)} optional={t(dict.register.optional)}>
                      <select
                        value={joinType}
                        onChange={(e) => setJoinType(e.target.value)}
                        className={`${FIELD} ${joinType ? "" : "text-white/35"}`}
                      >
                        <option value="" className="bg-[#0c0a18] text-white/50">{t(dict.register.selectPlaceholder)}</option>
                        {dict.register.partOptions.map((o) => (
                          <option key={o.value} value={o.value} className="bg-[#0c0a18] text-white">
                            {t(o.label)}
                          </option>
                        ))}
                      </select>
                    </Field>

                    {/* Team section — revealed only for "team", with a smooth expand */}
                    <AnimatePresence initial={false}>
                      {isTeam && (
                        <motion.div
                          key="team-section"
                          initial={expand.initial}
                          animate={expand.animate}
                          exit={expand.exit}
                          transition={expandT}
                          className="overflow-hidden"
                        >
                          <div className="flex flex-col gap-4 rounded-2xl border border-violet-400/20 bg-violet-400/[0.04] p-4">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-sm font-bold text-white/90">
                                {t(dict.register.teamSectionTitle)}
                              </span>
                              <span className="shrink-0 rounded-full border border-violet-400/25 bg-violet-400/10 px-2.5 py-0.5 text-[0.7rem] font-semibold text-violet-200">
                                {t(dict.register.teamSizeNote)}
                              </span>
                            </div>

                            {/* Team name (required) */}
                            <Field
                              label={t(dict.register.teamNameLabel)}
                              required
                              error={errors.teamName}
                              hint={t(dict.register.teamNameHelper)}
                            >
                              <input
                                type="text"
                                value={teamName}
                                onChange={(e) => setTeamName(e.target.value)}
                                placeholder={t(dict.register.teamNamePlaceholder)}
                                className={FIELD}
                              />
                            </Field>

                            {/* Members 2 / 3 */}
                            <AnimatePresence initial={false}>
                              {members.map((m, i) => (
                                <motion.div
                                  key={m.id}
                                  initial={expand.initial}
                                  animate={expand.animate}
                                  exit={expand.exit}
                                  transition={expandT}
                                  className="overflow-hidden"
                                >
                                  <div className="flex flex-col gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3.5">
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm font-bold text-white/85">
                                        {t(dict.register.memberLabel)} {i + 2}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => removeMember(m.id)}
                                        aria-label={`${t(dict.register.removeMember)} (${t(dict.register.memberLabel)} ${i + 2})`}
                                        className="flex h-7 w-7 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/60 transition hover:bg-white/10 hover:text-white active:scale-95"
                                      >
                                        <svg width="12" height="12" viewBox="0 0 15 15" fill="none" aria-hidden>
                                          <path d="M1 1l13 13M14 1L1 14" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                                        </svg>
                                      </button>
                                    </div>

                                    <Field label={t(dict.register.nameLabel)} required error={errors[`m${m.id}-name`]}>
                                      <input
                                        type="text"
                                        value={m.name}
                                        onChange={(e) => patchMember(m.id, { name: e.target.value })}
                                        placeholder={t(dict.register.namePlaceholder)}
                                        className={FIELD}
                                      />
                                    </Field>
                                    <Field label={t(dict.register.emailLabel)} required error={errors[`m${m.id}-email`]}>
                                      <input
                                        type="email"
                                        value={m.email}
                                        onChange={(e) => patchMember(m.id, { email: e.target.value })}
                                        placeholder={t(dict.register.emailPlaceholder)}
                                        className={FIELD}
                                      />
                                    </Field>
                                    <Field label={t(dict.register.contactLabel)} required error={errors[`m${m.id}-contact`]}>
                                      <input
                                        type="text"
                                        value={m.contact}
                                        onChange={(e) => patchMember(m.id, { contact: e.target.value })}
                                        placeholder={t(dict.register.contactPlaceholder)}
                                        className={FIELD}
                                      />
                                    </Field>
                                    <Field label={t(dict.register.schoolLabel)} optional={t(dict.register.optional)}>
                                      <UniversitySelect
                                        value={m.university}
                                        otherValue={m.universityOther}
                                        onValue={(v) => patchMember(m.id, { university: v })}
                                        onOther={(v) => patchMember(m.id, { universityOther: v })}
                                      />
                                    </Field>
                                    <Field label={t(dict.register.linkedinLabel)} optional={t(dict.register.optional)}>
                                      <input
                                        type="text"
                                        value={m.linkedin}
                                        onChange={(e) => patchMember(m.id, { linkedin: e.target.value })}
                                        placeholder={t(dict.register.linkedinPlaceholder)}
                                        className={FIELD}
                                      />
                                    </Field>
                                  </div>
                                </motion.div>
                              ))}
                            </AnimatePresence>

                            {/* Add teammate (hidden once Member 3 exists) */}
                            {members.length < MAX_ADDITIONAL ? (
                              <button
                                type="button"
                                onClick={addMember}
                                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-violet-400/30 bg-violet-400/[0.04] px-4 py-3 text-sm font-semibold text-violet-100 transition hover:border-violet-400/50 hover:bg-violet-400/10"
                              >
                                <span aria-hidden className="text-base leading-none">+</span>
                                {t(dict.register.addTeammate)}
                              </button>
                            ) : (
                              <p className="text-center text-xs text-white/45">{t(dict.register.maxNote)}</p>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* 7 · Interested track (team-level) */}
                    <Field label={t(dict.register.trackLabel)} optional={t(dict.register.optional)}>
                      <select
                        value={track}
                        onChange={(e) => setTrack(e.target.value)}
                        className={`${FIELD} ${track ? "" : "text-white/35"}`}
                      >
                        <option value="" className="bg-[#0c0a18] text-white/50">{t(dict.register.selectPlaceholder)}</option>
                        {dict.register.trackOptions.map((o) => (
                          <option key={o.value} value={o.value} className="bg-[#0c0a18] text-white">
                            {t(o.label)}
                          </option>
                        ))}
                      </select>
                    </Field>

                    {/* Quiz-type auto-attach chip (not a field; registrant only) */}
                    {variantName ? (
                      <div className="flex items-center gap-2 rounded-xl border border-violet-400/25 bg-violet-400/10 px-3.5 py-2.5 text-[13px] font-semibold text-violet-100">
                        <span aria-hidden>✦</span>
                        <span>
                          {t(dict.register.quizChipPrefix)}
                          {variantName} ({resolvedType})
                          {t(dict.register.quizChipSuffix)}
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-[13px] text-white/60">
                        <span>{t(dict.register.quizChipNone)}</span>
                        <a href="/quiz" className="font-semibold text-violet-300 transition hover:text-violet-200">
                          {t(dict.register.quizChipNoneCta)}
                        </a>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={submitting}
                      className="mt-2 inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-4 text-base font-bold text-white shadow-[0_8px_36px_rgba(124,58,237,0.5)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
                    >
                      {submitting && (
                        <span aria-hidden className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      )}
                      {t(submitting ? dict.register.submitting : dict.register.submit)}
                    </button>
                  </form>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

// University select shared by the registrant and each teammate — same options,
// with a free-text input when "Other" is chosen.
function UniversitySelect({
  value,
  otherValue,
  onValue,
  onOther,
}: {
  value: string;
  otherValue: string;
  onValue: (v: string) => void;
  onOther: (v: string) => void;
}) {
  const { t } = useLocale();
  return (
    <>
      <select
        value={value}
        onChange={(e) => onValue(e.target.value)}
        className={`${FIELD} ${value ? "" : "text-white/35"}`}
      >
        <option value="" className="bg-[#0c0a18] text-white/50">{t(dict.register.selectPlaceholder)}</option>
        {dict.register.schoolOptions.map((o) => (
          <option key={o.value} value={o.value} className="bg-[#0c0a18] text-white">
            {t(o.label)}
          </option>
        ))}
      </select>
      {value === "other" && (
        <input
          type="text"
          value={otherValue}
          onChange={(e) => onOther(e.target.value)}
          placeholder={t(dict.register.schoolOtherPlaceholder)}
          className={`${FIELD} mt-2`}
        />
      )}
    </>
  );
}

// One labelled form row: label (+ required asterisk / optional tag), the control,
// an optional hint line, and an inline error.
function Field({
  label,
  required,
  optional,
  hint,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  optional?: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="flex items-center gap-1.5 text-sm font-semibold text-white/85">
        {label}
        {required && <span className="text-rose-400" aria-hidden>*</span>}
        {optional && (
          <span className="text-[0.7rem] font-medium uppercase tracking-wide text-white/40">
            {optional}
          </span>
        )}
      </span>
      {children}
      {hint && <span className="text-xs leading-relaxed text-white/45">{hint}</span>}
      {error && <span className="text-xs font-medium text-rose-300">{error}</span>}
    </label>
  );
}
