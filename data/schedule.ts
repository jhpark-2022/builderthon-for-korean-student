// ─────────────────────────────────────────────────────────────────────────────
// SINGLE SOURCE OF TRUTH for the program.
// Both the Timetable grid and the EventModal read from this array, so editing an
// event here updates the card AND the detail view everywhere.
//
// Content transcribed from the 2026-06 media brief (Zero100_Builderthon_미디어
// 브리프.docx), the daily-program graphic (Zero100_일별프로그램.png) and the deck
// (Zero100_Builderthon_deck.pptx). Where a detail (speaker / exact mentor) is not
// yet specified in the source material, the field is left undefined with a
// `// TODO: confirm` note — please do not invent these.
//
// THE 8-DAY SHAPE (per the daily-program graphic, which is authoritative):
//   • Day 1 is the REAL kick-off — the AX problems are released and self-paced
//     team build starts right after, running continuously to Demo Day.
//   • Day 5 is a mid-point Keynote & Check-in (NOT the opening / not build start).
//   • Online by default; the cohort only gathers in person on Day 5 and Day 8
//     at *SCAPE Lifejungle, Singapore.
// ─────────────────────────────────────────────────────────────────────────────

export type Category =
  | "main" // ★ anchor track: problem release · keynote · demo day
  | "workshop" // Vibe Coding 101 / 102 (+ certificate)
  | "build" // self-paced / independent team build
  | "mentoring" // 1:1 mentoring
  | "network"; // briefing · networking · mixers

export type Mode = "online" | "offline";

export interface Bilingual {
  ko: string;
  en: string;
}

export interface BEvent {
  id: string;
  day: number; // 1..8
  date: string; // e.g. "08.22"
  category: Category;
  mode: Mode; // online or in-person (Day 5 & Day 8 are offline at *SCAPE)
  timeOfDay: "AM" | "PM";
  title: Bilingual;
  summary: Bilingual; // short, shown on the card
  description: Bilingual; // full, shown in the modal
  speaker?: Bilingual;
  location?: Bilingual;
  confirmed?: boolean; // show a "Confirmed / 확정" badge on the card
  // Optional: the company/org behind the session, shown in the modal with a
  // link out. Only add when the partner is real & confirmed (honest by default).
  org?: { name: string; desc: Bilingual; url: string };
  // Optional: concrete opportunities a student gets from attending. Honest —
  // describes the value of the session, not guaranteed outcomes.
  opportunities?: Bilingual[];
}

export interface DayMeta {
  day: number;
  date: string; // "08.22"
  weekday: Bilingual;
  phase: Bilingual; // which of the 3 phases this day belongs to
  theme: Bilingual; // day theme label
}

// Three phases across the 8 days:
//   Pre · Release (Day 1–2) → Intro · Vibe Coding (Day 3–4) → Builderthon (Day 5–8)
const PHASE_PRE: Bilingual = { ko: "사전 · 문제 공개", en: "Pre · Release" };
const PHASE_INTRO: Bilingual = { ko: "입문 · 바이브 코딩", en: "Intro · Vibe Coding" };
const PHASE_BUILD: Bilingual = { ko: "빌더톤", en: "Builderthon" };

// Day theme labels (Release → Demo Day)
export const days: DayMeta[] = [
  {
    day: 1,
    date: "08.22",
    weekday: { ko: "토", en: "Sat" },
    phase: PHASE_PRE,
    theme: { ko: "문제 공개 · 실질적 킥오프", en: "Problem Release · Kick-off" },
  },
  {
    day: 2,
    date: "08.23",
    weekday: { ko: "일", en: "Sun" },
    phase: PHASE_PRE,
    theme: { ko: "분석 · 자율 빌드 시작", en: "Deep-Dive · Build begins" },
  },
  {
    day: 3,
    date: "08.24",
    weekday: { ko: "월", en: "Mon" },
    phase: PHASE_INTRO,
    theme: { ko: "바이브 코딩 101", en: "Vibe Coding 101" },
  },
  {
    day: 4,
    date: "08.25",
    weekday: { ko: "화", en: "Tue" },
    phase: PHASE_INTRO,
    theme: { ko: "바이브 코딩 102 · 수료", en: "Vibe Coding 102 · Certificate" },
  },
  {
    day: 5,
    date: "08.26",
    weekday: { ko: "수", en: "Wed" },
    phase: PHASE_BUILD,
    theme: { ko: "키노트 · 중간 점검", en: "Keynote · Mid-point Check-in" },
  },
  {
    day: 6,
    date: "08.27",
    weekday: { ko: "목", en: "Thu" },
    phase: PHASE_BUILD,
    theme: { ko: "집중 빌드 · 멘토링", en: "Focused Build · Mentoring" },
  },
  {
    day: 7,
    date: "08.28",
    weekday: { ko: "금", en: "Fri" },
    phase: PHASE_BUILD,
    theme: { ko: "집중 빌드 · 멘토링", en: "Focused Build · Mentoring" },
  },
  {
    day: 8,
    date: "08.29",
    weekday: { ko: "토", en: "Sat" },
    phase: PHASE_BUILD,
    theme: { ko: "데모데이 · 최종 발표", en: "Demo Day · Final Pitch" },
  },
];

// Category legend (label + short meaning, both bilingual)
export const categoryMeta: Record<
  Category,
  { label: Bilingual; blurb: Bilingual; dot: string }
> = {
  main: {
    label: { ko: "메인 트랙", en: "Main Track" },
    blurb: {
      ko: "문제 공개 · 키노트 · 데모데이 — 행사의 핵심 마디.",
      en: "Problem Release · Keynote · Demo Day — the anchor moments.",
    },
    dot: "#fcd34d", // bright gold (matches the ★) — visible on the dark theme
  },
  workshop: {
    label: { ko: "워크숍", en: "Workshop" },
    blurb: {
      ko: "바이브 코딩 입문(101 · 102)과 수료증 — 처음이어도 출발선을 맞춥니다.",
      en: "Vibe Coding 101 · 102 with a certificate — leveling the start line.",
    },
    dot: "#7C5CFF", // purple
  },
  build: {
    label: { ko: "빌드 / 자율", en: "Build / Open" },
    blurb: {
      ko: "문제 분석부터 데모데이까지, 팀별로 상시 진행되는 자율 빌드.",
      en: "Self-paced team build, running from problem analysis to Demo Day.",
    },
    dot: "#64748B", // slate grey
  },
  mentoring: {
    label: { ko: "멘토링", en: "Mentoring" },
    blurb: {
      ko: "막히는 지점·피칭 준비를 멘토와 1:1로 풀어내는 시간.",
      en: "1:1 time with mentors for blockers and pitch prep.",
    },
    dot: "#0F9D8F", // teal
  },
  network: {
    label: { ko: "네트워킹", en: "Networking" },
    blurb: {
      ko: "브리핑 · 네트워킹 · 믹서 — 사람과 사람을 잇는 시간.",
      en: "Briefing · networking · mixers — connecting people.",
    },
    dot: "#2F6DF0", // blue
  },
};

// Location helpers — the only two venues in the new format.
const ONLINE: Bilingual = { ko: "온라인", en: "Online" };
const ONSITE: Bilingual = {
  ko: "*SCAPE Lifejungle, 싱가포르 · 현장 집결",
  en: "*SCAPE Lifejungle, Singapore · in person",
};

// Codepresso runs the Vibe Coding intro track (secured per the media brief).
const CODEPRESSO_ORG = {
  name: "Codepresso",
  url: "https://codepresso.io",
  desc: {
    ko: "코드프레소는 AI·소프트웨어 교육 전문 기업으로, 이번 빌더톤의 바이브 코딩 입문 과정(101·102)을 주관합니다.",
    en: "Codepresso is an AI & software-education company running the builderthon's Vibe Coding intro track (101 · 102).",
  },
} as const;

export const schedule: BEvent[] = [
  // ─── DAY 1 · Problem Release (08.22) ────────────────────────────────────────
  {
    id: "d1-problem-release",
    day: 1,
    date: "08.22",
    category: "main",
    mode: "online",
    timeOfDay: "AM",
    title: { ko: "문제 공개", en: "Problem Release" },
    summary: {
      ko: "실제 기업의 AX 과제가 공개되고, 8일 빌드가 시작됩니다.",
      en: "Real companies' AX problems drop — and the 8-day build begins.",
    },
    description: {
      ko: "Day 1이 이 빌더톤의 실질적 킥오프입니다. 가상의 과제가 아니라, 파트너 기업이 지금 겪고 있는 실제 AX(AI 전환) 문제가 공개됩니다. 팀별 자율 빌드는 문제가 공개되는 이 순간부터 데모데이까지 상시로 이어집니다 — 정해진 ‘시작 버튼’을 기다릴 필요 없이, 바로 만들기 시작할 수 있습니다.",
      en: "Day 1 is the real kick-off. These aren't made-up prompts — they're the actual AX (AI-transformation) problems partner companies are facing right now. Self-paced team build starts the moment the problems are released and runs continuously to Demo Day, so you can begin building straight away rather than waiting for a start whistle.",
    },
    location: ONLINE,
  },
  {
    id: "d1-briefing",
    day: 1,
    date: "08.22",
    category: "network",
    mode: "online",
    timeOfDay: "PM",
    title: { ko: "온라인 브리핑 & Q&A", en: "Online Briefing & Q&A" },
    summary: {
      ko: "과제 설명과 진행 방식 안내, 그리고 질의응답.",
      en: "Walking through the problems, how it runs, and your questions.",
    },
    description: {
      ko: "공개된 과제를 함께 살펴보고, 8일간의 진행 방식·팀 구성·평가 기준을 안내하는 온라인 브리핑입니다. 궁금한 점은 그 자리에서 바로 묻고 답을 들을 수 있어, 첫날부터 막힘 없이 출발할 수 있습니다.",
      en: "An online briefing that walks through the released problems and explains how the eight days work — team formation, schedule and judging. Bring your questions; you'll get answers on the spot so nobody starts the week unsure of how it runs.",
    },
    location: ONLINE,
  },

  // ─── DAY 2 · Deep-Dive · Build begins (08.23) ───────────────────────────────
  {
    id: "d2-deepdive",
    day: 2,
    date: "08.23",
    category: "build",
    mode: "online",
    timeOfDay: "AM",
    title: { ko: "문제 분석 · 리서치", en: "Problem Deep-Dive" },
    summary: {
      ko: "과제를 깊이 파고들어 리서치하는 자율 시간.",
      en: "Self-paced research, getting deep into the problem.",
    },
    description: {
      ko: "공개된 AX 과제를 팀이 직접 파고드는 자율 리서치 시간입니다. 기업이 진짜로 풀고 싶은 것이 무엇인지, 어디에 기회가 있는지를 정의하면서 빌드의 방향을 잡습니다. 운영진이 정해주는 세션이 아니라, 팀이 스스로 주도하는 시간입니다.",
      en: "Self-directed research where teams dig into the released AX problem — defining what the company actually wants solved and where the opportunity is, then setting a build direction. This is team-led time, not a hosted session.",
    },
    location: ONLINE,
  },
  {
    id: "d2-ideation",
    day: 2,
    date: "08.23",
    category: "build",
    mode: "online",
    timeOfDay: "PM",
    title: { ko: "팀 아이데이션 & 빌드 시작", en: "Team Ideation & Build" },
    summary: {
      ko: "아이디어를 모으고 곧장 프로토타입을 만들기 시작합니다.",
      en: "Gather ideas and move straight into a first prototype.",
    },
    description: {
      ko: "팀이 아이디어를 모으고, 가장 만들고 싶은 방향을 정해 곧바로 빌드에 들어가는 시간입니다. 입문 워크숍(Day 3–4)을 듣기 전이라도 괜찮습니다 — 일단 손을 움직여 보고, 워크숍에서 부족한 부분을 채우는 흐름으로 설계되어 있습니다.",
      en: "Teams converge on an idea, pick the direction they most want to build, and start prototyping. It's fine if this comes before the intro workshops on Day 3–4 — the flow is designed so you get your hands moving first and fill the gaps in the workshops.",
    },
    location: ONLINE,
  },

  // ─── DAY 3 · Vibe Coding 101 (08.24) ────────────────────────────────────────
  {
    id: "d3-vibe-101",
    day: 3,
    date: "08.24",
    category: "workshop",
    mode: "online",
    timeOfDay: "AM",
    confirmed: true,
    title: { ko: "바이브 코딩 101", en: "Vibe Coding 101" },
    summary: {
      ko: "코딩이 처음이어도 OK — 바이브 코딩의 기본기를 익힙니다.",
      en: "New to coding? Start here — the fundamentals of vibe coding.",
    },
    description: {
      ko: "참가자의 약 60%가 바이브 코딩이 처음입니다. 그래서 모두의 출발선을 맞추는 입문 워크숍을 준비했습니다. AI 도구로 아이디어를 작동하는 프로토타입으로 바꾸는 기본기를 핸즈온으로 익혀, 기술 장벽이 아니라 아이디어가 한계가 되도록 합니다. 입문 과정은 코드프레소가 주관합니다.",
      en: "About 60% of participants are trying vibe coding for the first time, so this intro workshop levels the start line. A hands-on run through the fundamentals of turning ideas into working prototypes with AI tools — so your ideas, not the tooling, are the limit. The intro track is run by Codepresso.",
    },
    location: ONLINE,
    org: CODEPRESSO_ORG,
    opportunities: [
      {
        ko: "코딩 경험이 없어도 첫 작동하는 프로토타입을 직접 만들어 보기",
        en: "Ship your first working prototype, even with zero coding background.",
      },
      {
        ko: "AI 바이브 코딩 워크플로를 핸즈온으로 체득",
        en: "Pick up an AI vibe-coding workflow hands-on, not just in theory.",
      },
    ],
  },
  {
    id: "d3-networking",
    day: 3,
    date: "08.24",
    category: "network",
    mode: "online",
    timeOfDay: "PM",
    title: { ko: "네트워킹", en: "Networking" },
    summary: {
      ko: "학교를 넘어 빌더들과 가볍게 연결되는 시간.",
      en: "Easy connections with builders across universities.",
    },
    description: {
      ko: "학교(NUS·NTU·SMU)와 배경의 벽을 넘어, 같은 주에 함께 빌드하는 사람들과 가볍게 연결되는 네트워킹 시간입니다. 팀을 찾거나, 다른 팀의 접근에서 자극을 받거나, 그냥 좋은 사람을 만나기에 좋은 자리입니다.",
      en: "A relaxed networking block that crosses the lines between universities (NUS·NTU·SMU) and backgrounds. A good place to find a team, draw energy from how others are approaching their build, or simply meet good people.",
    },
    location: ONLINE,
  },

  // ─── DAY 4 · Vibe Coding 102 · Certificate (08.25) ──────────────────────────
  {
    id: "d4-vibe-102",
    day: 4,
    date: "08.25",
    category: "workshop",
    mode: "online",
    timeOfDay: "AM",
    confirmed: true,
    title: { ko: "바이브 코딩 102 · 수료증", en: "Vibe Coding 102 · Certificate" },
    summary: {
      ko: "한 단계 더 — 입문 과정을 마치면 수료증이 함께합니다.",
      en: "One level up — finish the track and earn a certificate.",
    },
    description: {
      ko: "101에서 익힌 기본기 위에 한 단계를 더 쌓는 워크숍입니다. 에이전트·UI·데이터 연동과 배포 등 빌드를 끝까지 끌고 가는 데 필요한 흐름을 다루고, 입문 과정을 마치면 수료증이 발급됩니다. 이 역시 코드프레소가 주관합니다.",
      en: "Building on the fundamentals from 101, this workshop adds the next layer — agents, UI, data integration and deployment, the flow you need to carry a build all the way through. Finish the track and you receive a certificate of completion. Also run by Codepresso.",
    },
    location: ONLINE,
    org: CODEPRESSO_ORG,
    opportunities: [
      {
        ko: "입문 과정 수료증으로 ‘나도 만들 수 있다’를 증명",
        en: "Earn a completion certificate that proves you can build.",
      },
      {
        ko: "프로토타입을 배포까지 끌고 가는 흐름을 학습",
        en: "Learn the flow that carries a prototype all the way to deploy.",
      },
    ],
  },
  {
    id: "d4-networking",
    day: 4,
    date: "08.25",
    category: "network",
    mode: "online",
    timeOfDay: "PM",
    title: { ko: "네트워킹", en: "Networking" },
    summary: {
      ko: "본격 빌드 전, 다시 한 번 사람들과 연결되는 자리.",
      en: "One more chance to connect before the build ramps up.",
    },
    description: {
      ko: "입문 과정을 마무리하며 다시 한 번 참가자들이 어울리는 네트워킹입니다. Day 5 현장 집결을 앞두고, 온라인으로 쌓아 온 관계를 한 번 더 다지는 시간입니다.",
      en: "A networking block to close out the intro track. With the Day 5 in-person gathering ahead, it's a chance to firm up the relationships built online so far.",
    },
    location: ONLINE,
  },

  // ─── DAY 5 · Keynote · Mid-point Check-in (08.26 · OFFLINE) ──────────────────
  {
    id: "d5-keynote",
    day: 5,
    date: "08.26",
    category: "main",
    mode: "offline",
    timeOfDay: "AM",
    title: { ko: "키노트 & 중간 점검", en: "Keynote & Check-in" },
    summary: {
      ko: "개막이 아닌 중간 점검 — 빌드는 이미 진행 중입니다.",
      en: "A mid-point check-in, not an opening — the build is already underway.",
    },
    description: {
      ko: "Day 5는 ‘개막’이 아니라 중간 점검입니다. 빌드는 이미 Day 1부터 진행 중이고, 이날은 키노트와 함께 각 팀의 진행 상황을 점검하며 데모데이까지의 남은 절반을 정렬하는 자리입니다. 온라인으로 진행되던 일정 중, 처음으로 전원이 *SCAPE Lifejungle 현장에 모입니다.",
      en: "Day 5 is a mid-point check-in, not an opening. The build has been running since Day 1; this is where a keynote and a progress check across teams realign everyone for the second half toward Demo Day. It's also the first time the whole cohort gathers in person at *SCAPE Lifejungle.",
    },
    location: ONSITE,
  },
  {
    id: "d5-build",
    day: 5,
    date: "08.26",
    category: "build",
    mode: "offline",
    timeOfDay: "PM",
    title: { ko: "자율 빌드 (현장)", en: "Independent Build (on-site)" },
    summary: {
      ko: "현장에서 같은 공간에 모여 집중 빌드.",
      en: "Heads-down build, together in one room.",
    },
    description: {
      ko: "중간 점검에 이어, 팀들이 같은 공간에서 각자의 제품을 다듬는 현장 자율 빌드입니다. 서로의 진행을 보며 자극을 주고받고, 운영진과 멘토가 상주해 필요한 도움을 그때그때 제공합니다.",
      en: "Following the check-in, an on-site build block where teams polish their products in one shared space — drawing energy from each other's progress, with organizers and mentors on hand to help whenever it's needed.",
    },
    location: ONSITE,
  },

  // ─── DAY 6 · Focused Build · Mentoring (08.27) ──────────────────────────────
  {
    id: "d6-build",
    day: 6,
    date: "08.27",
    category: "build",
    mode: "online",
    timeOfDay: "AM",
    title: { ko: "자율 빌드", en: "Independent Build" },
    summary: {
      ko: "각자 페이스로 제품을 끌어올리는 집중 빌드.",
      en: "Focused build, each team at its own pace.",
    },
    description: {
      ko: "데모데이를 향해 제품의 완성도를 끌어올리는 집중 빌드 시간입니다. 온라인으로 각 팀이 자기 페이스로 진행하며, 오후 멘토링과 이어집니다.",
      en: "Focused build time to raise the polish of your product on the way to Demo Day. Teams work online at their own pace, flowing into the afternoon mentoring.",
    },
    location: ONLINE,
  },
  {
    id: "d6-mentoring",
    day: 6,
    date: "08.27",
    category: "mentoring",
    mode: "online",
    timeOfDay: "PM",
    title: { ko: "멘토링 1:1", en: "Mentoring 1:1" },
    summary: {
      ko: "막히는 지점·피칭 준비를 멘토와 1:1로.",
      en: "Blockers and pitch prep, one-on-one with mentors.",
    },
    description: {
      ko: "정해진 시간표 대신 팀의 필요에 맞춰 진행되는 1:1 멘토링입니다. 막히는 지점, 기술적 난제, 피칭 준비 등 무엇이든 멘토와 함께 풀어내며 데모데이를 준비합니다. (멘토 라인업은 파트너 확정에 따라 안내될 예정입니다.)",
      en: "One-on-one mentoring that follows each team's needs rather than a fixed timetable. Work through blockers, technical challenges or pitch prep with a mentor as you head into Demo Day. (Mentor line-up to be announced as partners are confirmed.)",
    },
    location: ONLINE,
    // mentors — TODO: confirm
  },

  // ─── DAY 7 · Focused Build · Mentoring (08.28) ──────────────────────────────
  {
    id: "d7-build",
    day: 7,
    date: "08.28",
    category: "build",
    mode: "online",
    timeOfDay: "AM",
    title: { ko: "자율 빌드", en: "Independent Build" },
    summary: {
      ko: "데모데이 전, 제품을 마무리하는 마지막 빌드.",
      en: "The last build push before Demo Day.",
    },
    description: {
      ko: "데모데이를 하루 앞두고 제품을 마무리하는 집중 빌드입니다. 남은 기능을 다듬고, 데모 시나리오를 점검하며, 오후 멘토링에서 마지막 피드백을 받습니다.",
      en: "With Demo Day one day away, a focused build to finish the product — tightening the last features, rehearsing the demo, and taking final feedback in the afternoon mentoring.",
    },
    location: ONLINE,
  },
  {
    id: "d7-mentoring",
    day: 7,
    date: "08.28",
    category: "mentoring",
    mode: "online",
    timeOfDay: "PM",
    title: { ko: "멘토링 1:1", en: "Mentoring 1:1" },
    summary: {
      ko: "피칭 리허설과 마지막 점검을 위한 1:1.",
      en: "One-on-one for pitch rehearsal and final checks.",
    },
    description: {
      ko: "데모데이 직전, 피칭 리허설과 마지막 점검에 초점을 둔 1:1 멘토링입니다. 발표 구성, 데모 흐름, 예상 질문까지 멘토와 함께 다듬어 무대에 오를 준비를 마칩니다.",
      en: "The day before Demo Day, one-on-one mentoring focused on pitch rehearsal and final checks. Refine your narrative, demo flow and likely questions with a mentor so you're ready for the stage.",
    },
    location: ONLINE,
    // mentors — TODO: confirm
  },

  // ─── DAY 8 · Demo Day (08.29 · OFFLINE) ─────────────────────────────────────
  {
    id: "d8-final-pitch",
    day: 8,
    date: "08.29",
    category: "main",
    mode: "offline",
    timeOfDay: "AM",
    title: { ko: "최종 발표 & 시상", en: "Final Pitch & Awards" },
    summary: {
      ko: "8일 빌드를 마무리하는 데모데이 — 최종 피칭과 시상.",
      en: "Demo Day — final pitches and awards close out the 8-day build.",
    },
    description: {
      ko: "8일간의 빌드를 마무리하는 데모데이입니다. 각 팀이 실제 기업의 AX 과제를 풀어 만든 제품을 무대에서 피칭하고, 심사를 거쳐 시상이 이뤄집니다. 전원이 다시 *SCAPE Lifejungle 현장에 모여, ‘데모로 끝나지 않는 성공의 경험’을 함께 마무리합니다.",
      en: "Demo Day closes out eight days of building. Each team pitches the product they built to solve a real company's AX problem, judging follows, and awards are presented. The whole cohort gathers again at *SCAPE Lifejungle to finish on a success that goes beyond a demo.",
    },
    location: ONSITE,
  },
];
