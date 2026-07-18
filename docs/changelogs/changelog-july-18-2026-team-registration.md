# Changelog — July 18, 2026 (team registration)

**Project:** Builderthon marketing site (Next.js)
**Branch:** `main`
**Window covered:** upgrading the register modal with a team flow, LinkedIn, and
multi-member entry.

## Summary

The registration modal now lets **one person register a whole team of 1–3**. The
"How are you joining?" select drives a revealable team section; the registrant is
Member 1 and up to two more members can be added inline. A LinkedIn field is added
for everyone, and the submit payload is reshaped around a `members` array.

`components/RegisterModal.tsx`, `data/dictionary.ts`. Reuses the existing dialog
pattern, design tokens, validation and success-state flow. All copy bilingual.

## Changes

- **LinkedIn (optional)** on the registrant and each member — trim-only
  normalization (full URL or bare handle), placeholder `linkedin.com/in/… or
  @handle`.
- **Join type → team section.** The select's three options are `team` /
  `looking` / `solo`. "I already have a team" reveals (framer-motion expand,
  `useReducedMotion`-aware) a **required team name** with the "everyone must
  enter exactly the same team name" helper, plus a **"Teams are 1–3 people"**
  label. `looking` keeps the team-matching quiz chip prominent; `solo` shows no
  team section. (The old solo-matching checkbox was removed — superseded.)
- **Multi-member entry.** The registrant is **Member 1** (a "You (Member 1)"
  subtitle appears once the team section opens). A **(+) Add teammate** button
  appends **Member 2** then **Member 3**; it hides at 3 with a **"3 is the max"**
  note. Each added block has Name/Email/Contact (required) + University/LinkedIn
  (optional) and an **×** remove control in its header; removing a middle member
  **renumbers cleanly** (stable ids → no gaps). Blocks animate in/out; the + and
  × are real `<button>`s with aria-labels.
- **Validation.** Team name required when `team`; every member email is
  format-checked; **no duplicate emails across Member 1–3** (inline error on the
  duplicate). Existing registrant validation unchanged.
- **Payload** reshaped:
  ```ts
  { joinType, teamName?, track, members: [{name,email,contact,university?,linkedin?}, …1–3],
    quizType?, ref?, submittedAt }
  ```
  `members[0]` is the registrant; `quizType` (auto-attached resultId) stays
  registrant-only at the top level; `teamName` + extra members are included only
  when `joinType === "team"` (state is preserved if the user switches away and
  back within the session).
- **Copy.** Modal subtitle now mentions the team option ("Have a team already?
  One person can register everyone." / ko equivalent).

## Verification

- `npx tsc --noEmit` — clean. `npm run build` — compiled successfully, 9/9 pages,
  lint clean.
- Live QA (dev server, EN): join type = team → team name + (+) appear; add
  Member 2 & 3 → (+) replaced by "3 is the max"; removing Member 2 renumbered the
  marked block from Member 3 → Member 2 (no gap) and restored (+). Duplicate email
  across members showed the inline "This email is already entered." and blocked
  submit. After making emails unique, a **team-of-3** submit succeeded and the
  captured `console.info` payload was exactly:
  `joinType:"team"`, `teamName:"Test Squad"`, `track:"finance"`,
  `members.length === 3` (members[0] = registrant), `quizType:"ESTP-T"` at the top
  level only, `ref:"quiz"`. No console/hydration errors throughout.
