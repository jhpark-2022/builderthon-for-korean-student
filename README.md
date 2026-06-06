# SMU × Zero100 Builderthon — Landing Page

A dark, bold, bilingual (KR/EN) **informational landing page** for the **SMU ×
Zero100 Builderthon** — Singapore's first festival-style builderthon for Korean
students (24–29 Aug 2026 · 6 days · ~100 builders). KOMOS is the spiritual
successor to Zero100, and the site follows that grammar: near-black theme, one
electric accent, large display type, looping gradient hero, smooth scroll
animations, and an interactive timetable.

> **This is currently an informational program-introduction page, not an
> application page.** There is intentionally **no** sign-up / registration /
> application form or external (e.g. Google Form / KakaoTalk) link. The primary
> call-to-action is internal navigation only — **“View Program” / “프로그램 보기”**
> scrolls to the Program section. If/when applications open later, add the CTA
> back via `data/dictionary.ts` (`links` + the relevant `cta*` strings).

## Tech stack

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS** for styling
- **Framer Motion** for scroll reveals, the event modal, and the FAQ accordion
- `next/image` for assets · fully static (no backend) · deployable on **Vercel**

## Run it locally

Requires **Node 18+**.

```bash
cd website
npm install
npm run dev
```

Then open **http://localhost:3999** (the dev server runs on port 3999).

Build & preview production:

```bash
npm run build
npm run start   # serves on http://localhost:3999
```

## Where to edit things

The site deliberately separates **data** from **presentation**.

| You want to change…                              | Edit this file              |
| ------------------------------------------------ | --------------------------- |
| **Event content** (titles, summaries, full descriptions, speakers, locations, days, categories) | `data/schedule.ts` |
| **Day themes / dates / weekday labels**          | `data/schedule.ts` → `days` |
| **Category colors, labels, legend blurbs**       | `data/schedule.ts` → `categoryMeta` |
| **All static UI copy** (nav, hero, about, FAQ, footer…) | `data/dictionary.ts` |
| **Internal CTA target** (the “View Program” anchor) | `data/dictionary.ts` → `links` |
| **Brand colors / accent / fonts**                | `tailwind.config.ts`, `app/globals.css` |
| **Nav logo**                                     | `public/komos-lion-white.png` (swap the file) |

### Single source of truth

`data/schedule.ts` is the **one place** event data lives. Both the timetable grid
(`components/Timetable.tsx`) and the detail modal (`components/EventModal.tsx`)
read from the same `schedule` array — edit an event once and it updates everywhere.

### Bilingual content

Every user-facing string is a `{ ko, en }` pair. Static UI strings live in
`data/dictionary.ts`; event strings live in `data/schedule.ts`. Components read
them through the `t()` helper from `useLocale()` (see `lib/LocaleContext.tsx`).
The KR/EN toggle in the nav switches everything instantly; the choice is
remembered in `localStorage`. Default locale is **en** (the timetable is in
English).

To add a new string: add a `{ ko: "...", en: "..." }` entry in `dictionary.ts`
and render it with `t(dict.section.key)`.

### `// TODO: confirm` markers

A few details aren't specified in the source material and are flagged with
`// TODO: confirm` comments instead of being invented — notably:

- Individual **speakers** for each session (`data/schedule.ts`)
- The exact **venue** (currently "to be confirmed · Singapore")

Search the project for `TODO: confirm` to find them all.

> Note: there is intentionally no application deadline or apply/registration link
> at this stage (this is an informational page). A deadline should only be shown
> once it is clearly confirmed in the source files.

## Deploy to Vercel

1. Push this `website/` folder to a Git repo (GitHub/GitLab/Bitbucket).
2. In Vercel, **New Project → Import** the repo. If `website/` is a subfolder,
   set the **Root Directory** to `website`.
3. Vercel auto-detects Next.js — no extra config needed. Click **Deploy**.

Or from the CLI:

```bash
cd website
npx vercel        # preview deploy
npx vercel --prod # production deploy
```

## Structure

```
website/
├── app/
│   ├── layout.tsx        # root layout + LocaleProvider + metadata
│   ├── page.tsx          # composes the sections
│   └── globals.css       # Tailwind + base theme + Pretendard font
├── components/
│   ├── Nav.tsx           # sticky nav, anchor links, mobile menu
│   ├── Hero.tsx          # animated gradient hero + "View Program" CTA + stats
│   ├── About.tsx         # 3 value-prop cards
│   ├── Timetable.tsx     # interactive 6-day grid (reads schedule.ts)
│   ├── EventModal.tsx    # detail modal (reads schedule.ts) — ESC/backdrop/X
│   ├── Partners.tsx      # organizer + hosts + in-discussion partners
│   ├── FAQ.tsx           # accordion
│   ├── FooterCTA.tsx     # closing explanation + "View Program" CTA + footer
│   ├── LocaleToggle.tsx  # KR/EN switch
│   └── Reveal.tsx        # scroll fade/slide-in wrapper
├── data/
│   ├── schedule.ts       # ← event data (source of truth)
│   └── dictionary.ts     # ← all static UI copy
├── lib/
│   └── LocaleContext.tsx # i18n provider + useLocale() hook
└── public/               # KOMOS logos
```
