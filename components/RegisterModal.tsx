"use client";

// ─────────────────────────────────────────────────────────────────────────────
// Registration modal — the "등록하기" flow.
//
// Reuses the EventModal/PartnerModal dialog pattern verbatim (portal, backdrop,
// ESC + Tab focus-trap, body scroll-lock, inert background, focus restoration,
// bottom-sheet on mobile).
//
// JOIN FLOW: the "How are you joining?" select has two options.
//   • "team" → team section: required team name + multi-member entry
//              (registrant = Member 1; add up to Member 3). NO AI-type UI.
//   • "solo" → a "match me with other solo builders" checkbox. ONLY while that
//              box is checked does the AI-type block appear, in one of two states:
//                A) a saved quiz result exists on this device (localStorage) →
//                   confirm-and-attach card;
//                B) none → prompt to take the 3-min test, via a round-trip that
//                   saves the form draft to sessionStorage, sends the visitor to
//                   /quiz?return=register, and (after they complete it) brings
//                   them back to /?register=1&ref=quiz-return with the draft
//                   restored and the freshly-saved type now in State A.
// The AI type is NEVER read from the URL — always from this device's saved
// result. No cross-device fallback, no manual picker.
//
// Submit: POSTs JSON to REGISTER_ENDPOINT (/api/register → Supabase). With that
// set to "" it instead simulates a ~1s submit and logs the payload to
// console.info. Only a 2xx reaches the success state, where it sets the
// `z100-registered` flag and clears the draft; anything else returns to the
// filled-in form with an inline retry error.
// ─────────────────────────────────────────────────────────────────────────────

import { cloneElement, isValidElement, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useLocale } from "@/lib/LocaleContext";
import { normalizeTelegramHandle } from "@/lib/telegram";
import { dict, REGISTER_ENDPOINT } from "@/data/dictionary";
import { RESULTS } from "@/data/quiz";
import { parseResultId } from "@/lib/quizScore";
import { loadOwnResult } from "@/lib/quizResult";
import { REGISTER_DRAFT_KEY as DRAFT_KEY } from "@/lib/storage";
import type { RegisterPreset } from "@/lib/RegisterContext";

interface RegisterModalProps {
  open: boolean;
  onClose: () => void;
  // Referrer captured from the URL (?ref=) on the auto-open path — "quiz" or
  // "quiz-return". The AI type is NOT passed via the URL (localStorage only).
  urlRef?: string | null;
  // Starting state requested by whichever CTA opened the modal (e.g. the hero's
  // team-matching card opens it as solo + matching). Applied on open, on top of
  // any restored draft — the visitor just expressed this intent by clicking.
  preset?: RegisterPreset | null;
  // Called once a submit succeeds (persists the "registered" flag in the parent).
  onSuccess: () => void;
}

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea,[tabindex]:not([tabindex="-1"])';

// Shared input styling so every field reads as one system on the dark sheet.
// text-base (16px), not text-sm: iOS Safari zooms the whole page in when a
// focused input's font-size is under 16px, and the visitor then has to pinch
// back out mid-form.
const FIELD =
  "w-full rounded-xl border border-white/12 bg-white/[0.04] px-4 py-3 text-base text-white placeholder:text-white/35 outline-none transition focus:border-violet-400/50 focus:bg-white/[0.06]";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Teams are strictly 1–3 people → at most 2 members beyond the registrant.
const MAX_ADDITIONAL = 2;

// ─────────────────────────────────────────────────────────────────────────────
// Dropdown — a NATIVE <select>, styled to match the dark/violet system with
// `appearance-none` + our own chevron.
//
// This was a custom listbox (button + role="listbox" + roving focus) purely for
// looks. That reimplements, imperfectly, what the platform already gives away:
// mobile OS pickers, type-ahead, screen-reader semantics every AT already knows,
// and form autofill. The custom version also had no aria-activedescendant, so a
// screen-reader user got no announcement of the highlighted option. The native
// control gets all of it for free, and `appearance-none` keeps the styling — so
// there's nothing left to trade off.
//
// Options render on the OS layer, so they need explicit colours: some platforms
// draw the popup on white regardless of the trigger's styling.
// ─────────────────────────────────────────────────────────────────────────────
interface SelectOption {
  value: string;
  label: string;
}
function SelectField({
  value,
  options,
  placeholder,
  onChange,
  id,
  ...rest
}: {
  value: string;
  options: SelectOption[];
  placeholder: string;
  onChange: (v: string) => void;
  id?: string;
  // `rest` is how Field's cloneElement injects aria-invalid / aria-describedby.
} & Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "value" | "onChange">) {
  return (
    <div className="relative">
      <select
        {...rest}
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${FIELD} cursor-pointer appearance-none pr-11 ${value ? "" : "text-white/35"}`}
      >
        <option value="" disabled className="bg-[#0c0a18] text-white/50">
          {placeholder}
        </option>
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-[#0c0a18] text-white">
            {o.label}
          </option>
        ))}
      </select>
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6 9l6 6 6-6" />
      </svg>
    </div>
  );
}

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

// Resolve a resultId ("ESTP-T") to its display info (variant name + brand mark),
// mirroring ReturningGreeting. Returns null for an unparseable id.
function useTypeInfo(resultId: string | null) {
  const { t } = useLocale();
  if (!resultId) return null;
  const parsed = parseResultId(resultId);
  if (!parsed) return null;
  const data = RESULTS[parsed.mbti];
  if (!data) return null;
  return {
    name: t(data.variants[parsed.identity].name),
    logo: data.logo,
    emoji: data.emoji,
    model: data.model,
  };
}

// Model brand mark (white mono) with an emoji fallback — mirrors the quiz glyph.
function TypeGlyph({ logo, emoji, model }: { logo: string; emoji: string; model: string }) {
  const [failed, setFailed] = useState(false);
  if (!logo || failed) return <span className="text-base leading-none" aria-hidden>{emoji}</span>;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/logos/${logo}`}
      alt={model}
      className="h-5 w-5 object-contain"
      onError={() => setFailed(true)}
      ref={(n) => {
        if (n && n.complete && n.naturalWidth === 0) setFailed(true);
      }}
    />
  );
}

export default function RegisterModal({
  open,
  onClose,
  urlRef,
  preset,
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
  const [joinType, setJoinType] = useState(""); // "" | "team" | "solo"
  const [teamName, setTeamName] = useState("");
  const [track, setTrack] = useState("");
  // Added teammates (Member 2 / 3). Preserved when toggling join type.
  const [members, setMembers] = useState<Member[]>([]);
  const memberIdRef = useRef(0);
  // Solo-matching opt-in + AI-type attach.
  const [soloMatch, setSoloMatch] = useState(false);
  const [savedResultId, setSavedResultId] = useState<string | null>(null);
  const [attachConfirmed, setAttachConfirmed] = useState(false); // "네, 이거예요" tapped

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>("idle");

  const isTeam = joinType === "team";
  const wantsMatching = joinType === "solo" && soloMatch;

  const addMember = () =>
    setMembers((prev) =>
      prev.length >= MAX_ADDITIONAL ? prev : [...prev, blankMember(++memberIdRef.current)]
    );
  const removeMember = (id: number) =>
    setMembers((prev) => prev.filter((m) => m.id !== id));
  const patchMember = (id: number, patch: Partial<Member>) =>
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));

  // Restore a round-trip draft (client-only, post-mount → no SSR mismatch) and
  // read this device's saved quiz result. The draft is written just before
  // navigating to the quiz, so restoring it here brings every field back.
  useEffect(() => {
    let raw: string | null = null;
    try {
      raw = window.sessionStorage.getItem(DRAFT_KEY);
    } catch {
      /* storage blocked */
    }
    if (raw) {
      try {
        const d = JSON.parse(raw);
        setName(d.name ?? "");
        setEmail(d.email ?? "");
        setSchool(d.school ?? "");
        setSchoolOther(d.schoolOther ?? "");
        setContact(d.contact ?? "");
        setLinkedin(d.linkedin ?? "");
        setJoinType(d.joinType ?? "");
        setTeamName(d.teamName ?? "");
        setTrack(d.track ?? "");
        setSoloMatch(!!d.soloMatch);
        const mem: Member[] = Array.isArray(d.members) ? d.members : [];
        setMembers(mem);
        memberIdRef.current = mem.reduce((mx, x) => Math.max(mx, x?.id ?? 0), 0);
      } catch {
        /* corrupt draft — ignore */
      }
    }
    setSavedResultId(loadOwnResult()?.resultId ?? null);
  }, []);

  // On (re)open: return to the form, re-read the saved result (it may have just
  // been written by a completed round-trip in this same tab), and apply whatever
  // the opening CTA asked for. The preset only touches join type / matching, so
  // a restored draft keeps every field the visitor already typed.
  useEffect(() => {
    if (!open) return;
    setStatus("idle");
    setSavedResultId(loadOwnResult()?.resultId ?? null);
    if (preset?.joinType) setJoinType(preset.joinType);
    if (preset?.wantsMatching !== undefined) setSoloMatch(preset.wantsMatching);
  }, [open, preset]);

  const typeInfo = useTypeInfo(savedResultId);

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

  // Save the whole form to sessionStorage and route to the quiz. On completion
  // the quiz surfaces a "Back to registration →" button (→ ?register=1&
  // ref=quiz-return) that brings the visitor back to this restored draft.
  function goToQuiz() {
    try {
      window.sessionStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({
          name, email, school, schoolOther, contact, linkedin,
          joinType, teamName, track, soloMatch, members,
        })
      );
    } catch {
      /* storage blocked — the round-trip just won't restore fields */
    }
    window.location.href = "/quiz?return=register";
  }

  // Move the visitor to the first thing that needs fixing. Without this a
  // failed submit on a long form looks like nothing happened — the error is
  // often scrolled off-screen above the button.
  function focusFirstError(next: Record<string, string>) {
    // Declaration order of the form, so "first" means first on screen.
    const order = ["name", "email", "joinType", "contact", "teamName"];
    const keys = Object.keys(next);
    const first =
      order.find((k) => next[k]) ?? keys.find((k) => k !== "submit") ?? keys[0];
    if (!first) return;
    // setTimeout, not requestAnimationFrame: rAF is paused in a backgrounded
    // tab, so a submit there would leave focus on the button with the error
    // off-screen. `data-field` is on the label and always present, so there's
    // nothing to wait for a paint on anyway.
    window.setTimeout(() => {
      const el = dialogRef.current?.querySelector<HTMLElement>(
        `[data-field="${first}"]`
      );
      if (!el) return;
      el.scrollIntoView({ block: "center", behavior: reduce ? "auto" : "smooth" });
      const control = el.querySelector<HTMLElement>(
        "input,select,textarea"
      );
      control?.focus({ preventScroll: true });
    }, 0);
  }

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
    // Join type drives the whole rest of the form (team section, matching, and
    // how organizers group the entry), so it's required here even though the API
    // still accepts null — no server change needed.
    if (!joinType) next.joinType = req;

    if (isTeam) {
      if (!teamName.trim()) next.teamName = req;
      members.forEach((m) => {
        if (!m.name.trim()) next[`m${m.id}-name`] = req;
        if (!m.email.trim()) next[`m${m.id}-email`] = req;
        else if (!EMAIL_RE.test(m.email.trim())) next[`m${m.id}-email`] = badEmail;
        if (!m.contact.trim()) next[`m${m.id}-contact`] = req;
      });
      const entries = [
        { key: "email", value: email },
        ...members.map((m) => ({ key: `m${m.id}-email`, value: m.email })),
      ];
      const seen = new Set<string>();
      entries.forEach(({ key, value }) => {
        const norm = value.trim().toLowerCase();
        if (!norm) return;
        if (seen.has(norm)) {
          if (!next[key]) next[key] = dupEmail;
        } else {
          seen.add(norm);
        }
      });
    }

    setErrors(next);
    const ok = Object.keys(next).length === 0;
    if (!ok) focusFirstError(next);
    return ok;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setStatus("submitting");

    // Light normalization: trim only (accept full URL or bare handle). The
    // Telegram field is the exception — when it parses as a handle it's stored
    // canonicalised as "@handle" so organizers can paste it straight into
    // Telegram search. Anything else goes through as typed: the copy asks for a
    // handle, it doesn't police the answer.
    const uni = (val: string, other: string) =>
      val === "other" ? other.trim() || undefined : val || undefined;
    const link = (v: string) => v.trim() || undefined;

    const registrant = {
      name: name.trim(),
      email: email.trim(),
      contact: normalizeTelegramHandle(contact) ?? contact.trim(),
      university: uni(school, schoolOther),
      linkedin: link(linkedin),
    };
    const extra = isTeam
      ? members.map((m) => ({
          name: m.name.trim(),
          email: m.email.trim(),
          contact: normalizeTelegramHandle(m.contact) ?? m.contact.trim(),
          university: uni(m.university, m.universityOther),
          linkedin: link(m.linkedin),
        }))
      : [];

    // AI type attaches ONLY for a solo matcher whose device has a saved result.
    const attachedType = wantsMatching && savedResultId ? savedResultId : undefined;

    const payload = {
      joinType: joinType || null, // "team" | "solo"
      ...(isTeam ? { teamName: teamName.trim() } : {}),
      wantsMatching, // solo only; always false for teams
      track,
      members: [registrant, ...extra], // [0] is the registrant
      ...(attachedType ? { quizType: attachedType } : {}), // present iff matching + saved result
      ref: urlRef ?? null,
      submittedAt: new Date().toISOString(),
    };

    // A failed write must NOT show the success state — the registration would be
    // silently lost and the visitor would never know to retry. On failure we
    // return to the form with an inline error and everything still filled in.
    try {
      if (REGISTER_ENDPOINT) {
        const res = await fetch(REGISTER_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(`submit failed: ${res.status}`);
      } else {
        console.info("[register] payload (no endpoint configured):", payload);
        await new Promise((r) => setTimeout(r, 1000));
      }
    } catch (err) {
      console.error("[register] submit failed:", err);
      setErrors({ submit: t(dict.register.errSubmit) });
      setStatus("idle");
      return;
    }

    try {
      window.sessionStorage.removeItem(DRAFT_KEY); // draft fulfilled
    } catch {
      /* ignore */
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
                  {/* Who's actually on the other end of this form — the same
                      organizer fact the footer states, surfaced where the
                      visitor is deciding whether to hand over contact details. */}
                  <p className="mt-3 flex items-start gap-2 text-xs leading-relaxed text-white/50">
                    <span aria-hidden className="mt-[1px] text-violet-300/80">◆</span>
                    {t(dict.register.trustOrganizer)}
                  </p>

                  <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4" noValidate>
                    {isTeam && (
                      <p className="-mb-1 text-sm font-bold text-violet-200">
                        {t(dict.register.memberYou)}
                      </p>
                    )}

                    {/* 1 · Name */}
                    <Field name="name" label={t(dict.register.nameLabel)} required error={errors.name}>
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
                    <Field name="email" label={t(dict.register.emailLabel)} required error={errors.email}>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={t(dict.register.emailPlaceholder)}
                        autoComplete="email"
                        className={FIELD}
                      />
                    </Field>


                    {/* 3 · Join type — required, and asked early: it decides
                        whether the rest of the form is a team block or the
                        solo-matching block, so burying it under the optional
                        fields made people fill the wrong shape of form. */}
                    <Field
                      name="joinType"
                      label={t(dict.register.partLabel)}
                      required
                      error={errors.joinType}
                    >
                      <SelectField
                        value={joinType}
                        onChange={setJoinType}
                        placeholder={t(dict.register.selectPlaceholder)}
                        options={dict.register.partOptions.map((o) => ({ value: o.value, label: t(o.label) }))}
                      />
                    </Field>

                    {/* 4 · School (+ "other" free text) */}
                    <Field label={t(dict.register.schoolLabel)} optional={t(dict.register.optional)}>
                      <UniversitySelect
                        value={school}
                        otherValue={schoolOther}
                        onValue={setSchool}
                        onOther={setSchoolOther}
                      />
                    </Field>

                    {/* 5 · Contact (Telegram preferred) */}
                    <Field
                      name="contact"
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

                    {/* 6 · LinkedIn (optional) */}
                    <Field label={t(dict.register.linkedinLabel)} optional={t(dict.register.optional)}>
                      <input
                        type="text"
                        value={linkedin}
                        onChange={(e) => setLinkedin(e.target.value)}
                        placeholder={t(dict.register.linkedinPlaceholder)}
                        className={FIELD}
                      />
                    </Field>

                    {/* Team section — revealed only for "team" */}
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

                            <Field
                              name="teamName"
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

                    {/* Solo matching opt-in + AI-type block (solo only) */}
                    {joinType === "solo" && (
                      <div className="flex flex-col gap-3">
                        <label className="flex cursor-pointer items-center gap-2.5 text-sm text-white/80">
                          <input
                            type="checkbox"
                            checked={soloMatch}
                            onChange={(e) => setSoloMatch(e.target.checked)}
                            className="h-4 w-4 shrink-0 accent-violet-500"
                          />
                          {t(dict.register.soloMatchLabel)}
                        </label>

                        <AnimatePresence initial={false}>
                          {soloMatch && (
                            <motion.div
                              key="ai-block"
                              initial={expand.initial}
                              animate={expand.animate}
                              exit={expand.exit}
                              transition={expandT}
                              className="overflow-hidden"
                            >
                              <div className="rounded-2xl border border-violet-400/25 bg-violet-400/[0.06] p-4">
                                {savedResultId && typeInfo ? (
                                  // State A — a saved result exists on this device.
                                  <>
                                    <div className="flex items-center gap-2.5">
                                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/[0.06]">
                                        <TypeGlyph logo={typeInfo.logo} emoji={typeInfo.emoji} model={typeInfo.model} />
                                      </span>
                                      <span className="text-[13px] font-bold text-violet-100">
                                        {t(dict.register.aiTypePrefix)}
                                        {typeInfo.name} ({savedResultId})
                                      </span>
                                    </div>
                                    {attachConfirmed ? (
                                      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                                        <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-emerald-300">
                                          <span aria-hidden>✓</span>
                                          {t(dict.register.aiAttached)}
                                        </span>
                                        <button
                                          type="button"
                                          onClick={goToQuiz}
                                          className="text-xs font-semibold text-white/50 underline underline-offset-2 transition hover:text-white/80"
                                        >
                                          {t(dict.register.aiRetakeShort)}
                                        </button>
                                      </div>
                                    ) : (
                                      <>
                                        <p className="mt-3 text-[13px] leading-relaxed text-white/70">
                                          {t(dict.register.aiConfirmQ)}
                                        </p>
                                        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                                          <button
                                            type="button"
                                            onClick={() => setAttachConfirmed(true)}
                                            className="inline-flex items-center justify-center rounded-xl bg-violet-500/90 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-violet-500"
                                          >
                                            {t(dict.register.aiYes)}
                                          </button>
                                          <button
                                            type="button"
                                            onClick={goToQuiz}
                                            className="inline-flex items-center justify-center rounded-xl border border-white/12 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-white/75 transition hover:bg-white/[0.08]"
                                          >
                                            {t(dict.register.aiRetake)}
                                          </button>
                                        </div>
                                      </>
                                    )}
                                  </>
                                ) : (
                                  // State B — no saved result on this device.
                                  <>
                                    <p className="text-[13px] leading-relaxed text-white/75">
                                      {t(dict.register.aiNoneMsg)}
                                    </p>
                                    <button
                                      type="button"
                                      onClick={goToQuiz}
                                      className="mt-3 inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2.5 text-sm font-bold text-white transition hover:-translate-y-0.5"
                                    >
                                      {t(dict.register.aiGoTest)}
                                    </button>
                                  </>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}

                    {/* 7 · Interested track (team-level) */}
                    <Field
                      label={t(dict.register.trackLabel)}
                      optional={t(dict.register.optional)}
                      hint={t(dict.register.trackHint)}
                    >
                      <SelectField
                        value={track}
                        onChange={setTrack}
                        placeholder={t(dict.register.selectPlaceholder)}
                        options={dict.register.trackOptions.map((o) => ({ value: o.value, label: t(o.label) }))}
                      />
                    </Field>

                    {errors.submit && (
                      <p
                        role="alert"
                        className="rounded-xl border border-rose-400/25 bg-rose-400/[0.08] px-4 py-3 text-[13px] font-medium leading-relaxed text-rose-200"
                      >
                        {errors.submit}
                      </p>
                    )}

                    {/* What happens to what they just typed — stated right
                        where they're about to hand it over, including the ask
                        about teammates' details (they're entering data about
                        other people). */}
                    <p className="text-xs leading-relaxed text-white/45">
                      {t(dict.register.trustPrivacy)}
                    </p>

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
      <SelectField
        value={value}
        onChange={onValue}
        placeholder={t(dict.register.selectPlaceholder)}
        options={dict.register.schoolOptions.map((o) => ({ value: o.value, label: t(o.label) }))}
      />
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
// `name` does double duty: it's the scroll target focusFirstError() looks for
// (data-field) and the id stem that ties the error text to the control via
// aria-describedby, so a screen reader reads the reason, not just "invalid".
// The control is cloned rather than asking ~15 call sites to repeat the wiring.
function Field({
  name,
  label,
  required,
  optional,
  hint,
  error,
  children,
}: {
  name?: string;
  label: string;
  required?: boolean;
  optional?: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  const errorId = name && error ? `${name}-error` : undefined;
  const control =
    isValidElement(children) && (errorId || error)
      ? cloneElement(children as React.ReactElement<Record<string, unknown>>, {
          "aria-invalid": error ? true : undefined,
          "aria-describedby": errorId,
        })
      : children;

  return (
    <label className="flex flex-col gap-1.5" data-field={name}>
      <span className="flex items-center gap-1.5 text-sm font-semibold text-white/85">
        {label}
        {required && <span className="text-rose-400" aria-hidden>*</span>}
        {optional && (
          <span className="text-[0.7rem] font-medium uppercase tracking-wide text-white/40">
            {optional}
          </span>
        )}
      </span>
      {control}
      {hint && <span className="text-xs leading-relaxed text-white/45">{hint}</span>}
      {error && (
        <span id={errorId} className="text-xs font-medium text-rose-300">
          {error}
        </span>
      )}
    </label>
  );
}
