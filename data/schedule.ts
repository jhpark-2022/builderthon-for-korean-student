// ─────────────────────────────────────────────────────────────────────────────
// SINGLE SOURCE OF TRUTH for the program.
// Both the Timetable grid and the EventModal read from this array, so editing an
// event here updates the card AND the detail view everywhere.
//
// Content transcribed from the authoritative deck (Zero100_Builderthon_deck_
// 수정본.pptx / _EN.pptx). Where a detail (exact mentor / speaker) is not yet
// specified in the source material, the field is left undefined with a
// `// TODO: confirm` note — please do not invent these.
//
// THE 8-DAY SHAPE (per the deck, which is authoritative):
//   • Day 1 — big Opening: 원대로 opening keynote + AWS speaker session + the AX
//     problems are released and tracks are chosen. MANDATORY (필참); on-site
//     is pending (Zoom fallback if the venue isn't locked).
//   • Day 2 — one concentrated Crash Course (vibe-coding intro, 5–6h), then a
//     live per-track briefing (client contacts present the problem) right after.
//   • Day 3–4 — online self-build + 1:1 mentoring in person at NUS (Day 3 also
//     has a TENTATIVE OpenAI Codex workshop, still in coordination).
//   • Day 5 — recharge · in-person kickoff with panels at *SCAPE L^IFE Jungle; opens Lab 2.
//   • Day 6 — open build (online, self-paced).
//   • Day 7 — Final Rehearsal on-site at the AWS office (9AM–1:30PM, new venue).
//   • Day 8 — Demo Day at *SCAPE L^IFE Jungle. MANDATORY (필참).
//   • Self-paced team build runs continuously from the Day-1 problem release all
//     the way to the Day-8 pitch. In person on Days 1 / 5 / 7 / 8.
// ─────────────────────────────────────────────────────────────────────────────

export type Category =
  | "main" // ★ anchor track: opening · problem release · keynote · demo day
  | "workshop" // Crash Course (vibe-coding intro) + OpenAI Codex workshop
  | "build" // self-paced / independent team build
  | "mentoring" // 1:1 mentoring
  | "network"; // orientation · panels · networking · mixers

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
  mode: Mode; // online or in-person (Days 5 / 7 / 8 are offline)
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
  phase: Bilingual; // which of the two Labs this day belongs to
  theme: Bilingual; // day theme label
  summary: Bilingual; // one-line day summary shown on the clean day card
  // "pending" = meant to be on-site but venue isn't locked (Zoom fallback).
  dayMode: "online" | "offline" | "pending";
  mandatory?: boolean; // 필참 — required attendance (Day 1 & Day 8)
}

// Two "Labs" across the 8 days (matches the deck):
//   Lab 1 · Warm-up (Day 1–4) → Lab 2 · Builderthon (Day 5–8)
const LAB1: Bilingual = { ko: "Lab 1 · 워밍업", en: "Lab 1 · Warm-up" };
const LAB2: Bilingual = { ko: "Lab 2 · 실전", en: "Lab 2 · Builderthon" };

// Day theme labels + one-line summaries (Opening → Demo Day)
export const days: DayMeta[] = [
  {
    day: 1,
    date: "08.22",
    weekday: { ko: "토", en: "Sat" },
    phase: LAB1,
    theme: { ko: "오프닝 · 문제 공개", en: "Opening · Problem Release" },
    summary: {
      ko: "원대로 오프닝 키노트 · 오리엔테이션 · AWS 연사(확정) · 문제 공개·트랙 선택.",
      en: "Won's opening keynote · orientation · AWS session (confirmed) · problem release & track selection.",
    },
    // Deck: on-site is pending (Zoom fallback if the venue isn't locked).
    dayMode: "pending",
    mandatory: true,
  },
  {
    day: 2,
    date: "08.23",
    weekday: { ko: "일", en: "Sun" },
    phase: LAB1,
    theme: { ko: "크래시코스 (집중)", en: "Crash Course" },
    summary: {
      ko: "바이브 코딩 입문 집중 5–6시간 · 종료 직후 문제 영상 공개 & 팀 빌딩.",
      en: "A focused 5–6h vibe-coding intro · problem video & team building right after.",
    },
    dayMode: "online",
  },
  {
    day: 3,
    date: "08.24",
    weekday: { ko: "월", en: "Mon" },
    phase: LAB1,
    theme: { ko: "자율 빌드 · 멘토링", en: "Self-build · Mentoring" },
    summary: {
      ko: "오전 자율 빌드 · 오후 1:1 멘토링 (OpenAI Codex 워크샵 조율 중).",
      en: "AM self-build · PM 1:1 mentoring (OpenAI Codex workshop TBC).",
    },
    dayMode: "online",
  },
  {
    day: 4,
    date: "08.25",
    weekday: { ko: "화", en: "Tue" },
    phase: LAB1,
    theme: { ko: "자율 빌드 · 멘토링", en: "Self-build · Mentoring" },
    summary: {
      ko: "오전 자율 빌드 · 오후 1:1 멘토링 — 프로토타입 진전.",
      en: "AM self-build · PM 1:1 mentoring — advancing the prototype.",
    },
    dayMode: "online",
  },
  {
    day: 5,
    date: "08.26",
    weekday: { ko: "수", en: "Wed" },
    phase: LAB2,
    theme: { ko: "오프라인 킥오프 · 패널", en: "In-person Kickoff · Panels" },
    summary: {
      ko: "*SCAPE 현장 집결 · 재충전 · 참여자 AI Use Case · 이병일 패널 · 네트워킹.",
      en: "In person at *SCAPE · a recharge beat · AI use-case panel · Lee Byung-il panel · networking.",
    },
    dayMode: "offline",
  },
  {
    day: 6,
    date: "08.27",
    weekday: { ko: "목", en: "Thu" },
    phase: LAB2,
    theme: { ko: "오픈 빌드", en: "Open Build" },
    summary: {
      ko: "팀 자율 빌드가 온종일 상시 진행 — 스스로 프로덕트를 완성합니다.",
      en: "Team-led build runs all day — ship your product.",
    },
    dayMode: "online",
  },
  {
    day: 7,
    date: "08.28",
    weekday: { ko: "금", en: "Fri" },
    phase: LAB2,
    theme: { ko: "파이널 리허설", en: "Final Rehearsal" },
    summary: {
      ko: "AWS 오피스 현장 · 최종 발표 리허설 · 연사 세션.",
      en: "On-site at the AWS office · final-pitch rehearsal · speaker session.",
    },
    dayMode: "offline",
  },
  {
    day: 8,
    date: "08.29",
    weekday: { ko: "토", en: "Sat" },
    phase: LAB2,
    theme: { ko: "데모데이 · 최종 발표", en: "Demo Day · Final Pitch" },
    summary: {
      ko: "*SCAPE 현장 · 박희덕 키노트 · 팀별 5분 발표 · 결과 발표 & 시상.",
      en: "In person at *SCAPE · Park Hee-deok keynote · 5-min team pitches · results & awards.",
    },
    dayMode: "offline",
    mandatory: true,
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
      ko: "크래시코스(바이브 코딩 입문)와 OpenAI Codex 워크샵 — 처음이어도 출발선을 맞춥니다.",
      en: "Crash Course (vibe-coding intro) + OpenAI Codex workshop — leveling the start line.",
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

// Location helpers.
const ONLINE: Bilingual = { ko: "온라인", en: "Online" };
const ONSITE: Bilingual = {
  ko: "*SCAPE L^IFE Jungle, 싱가포르 · 현장 집결",
  en: "*SCAPE L^IFE Jungle, Singapore · in person",
};
// Day 7's new venue — the Final Rehearsal moves to the AWS office (confirmed).
const AWS_OFFICE: Bilingual = {
  ko: "AWS 오피스, 싱가포르 · 현장",
  en: "AWS office, Singapore · in person",
};
// Codepresso runs the Day-2 Crash Course (vibe-coding intro), per the deck.
const CODEPRESSO_ORG = {
  name: "Codepresso",
  url: "https://codepresso.io",
  desc: {
    ko: "코드프레소는 AI·소프트웨어 교육 전문 기업으로, 이번 빌더톤 Day 2의 크래시코스(바이브 코딩 입문)를 주관합니다.",
    en: "Codepresso is an AI & software-education company running the Day-2 Crash Course (vibe-coding intro).",
  },
} as const;

// OpenAI is in discussion to run a hands-on Codex workshop on Day 3 (TBC).
const OPENAI_ORG = {
  name: "OpenAI",
  url: "https://openai.com",
  desc: {
    ko: "OpenAI가 빌드 경험이 있는 학생을 위한 Codex 실전 워크샵을 함께 논의 중입니다 (일정 조율 중).",
    en: "OpenAI is in discussion to run a hands-on Codex workshop for students with some building experience (schedule TBC).",
  },
} as const;

export const schedule: BEvent[] = [
  // ─── DAY 1 · Opening · Problem Release (08.22) ──────────────────────────────
  {
    id: "d1-opening-keynote",
    day: 1,
    date: "08.22",
    category: "main",
    mode: "offline",
    timeOfDay: "AM",
    confirmed: true,
    title: { ko: "오프닝 키노트 · 원대로", en: "Opening Keynote · Won Dae-ro" },
    // TODO: confirm — speaker name is from the internal deck; confirm public naming is OK.
    speaker: { ko: "원대로", en: "Won Dae-ro" },
    summary: {
      ko: "‘취업과 창업의 사이’ — 8일의 ‘왜’를 여는 오프닝 키노트.",
      en: "“Between Employment and Founding” — the keynote that opens the 8-day ‘why’.",
    },
    description: {
      ko: "빌더톤의 문을 여는 오프닝 키노트입니다. Wilt Venture Builder(SG)의 원대로 대표가 ‘취업과 창업의 사이’를 주제로, 정형화된 ‘취업 vs 창업’ 이분법에서 벗어나 벤처빌더가 본 다양한 진로·커리어 경로와 비개발자도 시작할 수 있는 여러 갈래를 약 1시간 동안 Q&A와 함께 풀어냅니다. ‘처음이어도 괜찮다’는 톤으로 8일의 ‘왜’를 세우며 출발선을 엽니다.",
      en: "The keynote that opens the builderthon. Won Dae-ro (Managing Director, Wilt Venture Builder SG) speaks on “Between Employment and Founding” for about an hour, with Q&A — stepping past the tidy ‘employment vs. founding’ binary to the many career paths a venture builder has seen, and the routes even non-developers can start from. It sets the 8-day ‘why’ in a ‘first-timers welcome’ tone.",
    },
    location: ONSITE,
  },
  {
    id: "d1-orientation",
    day: 1,
    date: "08.22",
    category: "network",
    mode: "offline",
    timeOfDay: "AM",
    title: { ko: "오리엔테이션", en: "Orientation" },
    summary: {
      ko: "행사 개요 · 진행 방식 · 트랙 안내 · 베이스 리포트.",
      en: "Event overview, how it runs, tracks, and the base report.",
    },
    description: {
      ko: "8일간의 행사 개요와 진행 방식을 안내하는 오리엔테이션입니다. 트랙 구성과 팀 운영, 평가 흐름을 짚고, 현재까지의 준비 상황을 담은 베이스 리포트를 공유합니다. 첫날부터 ‘어떻게 굴러가는지’를 모두가 같은 그림으로 이해하고 출발할 수 있게 하는 자리입니다.",
      en: "An orientation walking through the shape of the eight days — how it runs, the tracks, team logistics and the judging flow — plus a base report on where preparations stand. The goal is that everyone starts with the same picture of how the week works.",
    },
    location: ONSITE,
  },
  {
    id: "d1-aws-session",
    day: 1,
    date: "08.22",
    category: "main",
    mode: "offline",
    timeOfDay: "PM",
    confirmed: true,
    title: { ko: "AWS 연사 세션", en: "AWS Speaker Session" },
    // TODO: confirm public naming — speaker (한장환 · AWS) is confirmed in the internal
    // deck; verify the public name may be shown before surfacing it in the UI.
    speaker: { ko: "한장환 (AWS)", en: "Han Jang-whan (AWS)" },
    summary: {
      ko: "Amazon의 AI 문제 정의 · 접근 방법론.",
      en: "Amazon's AI problem-definition & approach methodology.",
    },
    description: {
      ko: "AWS 연사 한장환 님이 진행하는 확정 세션입니다. Amazon이 실제로 AI 문제를 어떻게 정의하고, 어떤 방법론으로 접근하는지를 다룹니다. 문제를 ‘어떻게 풀까’ 이전에 ‘무엇을, 왜 푸는가’를 잡는 관점을 얻어, 곧이어 공개되는 실제 AX 과제에 그대로 적용해볼 수 있습니다.",
      en: "A confirmed session led by AWS speaker Han Jang-whan on how Amazon defines AI problems and the methodology it uses to approach them. It's the ‘what and why’ before the ‘how’ — a lens you can apply directly to the real AX problems released the same day.",
    },
    location: ONSITE,
  },
  {
    id: "d1-problem-release",
    day: 1,
    date: "08.22",
    category: "main",
    mode: "offline",
    timeOfDay: "PM",
    title: { ko: "문제 공개 · 트랙 선택", en: "Problem Release · Track Selection" },
    summary: {
      ko: "실제 기업의 AX 과제가 공개되고, 트랙을 고르며 8일 빌드 시계가 시작됩니다.",
      en: "Real companies' AX problems drop, you pick a track — and the 8-day build clock starts.",
    },
    description: {
      ko: "Day 1은 이 빌더톤의 실질적 킥오프입니다. 가상의 과제가 아니라, 파트너 기업이 지금 겪고 있는 실제 AX(AI 전환) 문제가 트랙별로 공개되고, 참가자는 이 자리에서 자신의 트랙을 고릅니다. 팀별 자율 빌드는 문제가 공개되는 이 순간부터 데모데이까지 상시로 이어집니다 — 정해진 ‘시작 버튼’을 기다릴 필요 없이, 바로 만들기 시작할 수 있습니다. Day 1은 필참이며 *SCAPE L^IFE Jungle 현장 진행을 목표로 합니다(장소 미정 시 Zoom). (Day 2에는 크래시코스 직후 트랙별 라이브 브리핑이 이어집니다.)",
      en: "Day 1 is the real kick-off. These aren't made-up prompts — they're the actual AX (AI-transformation) problems partner companies are facing right now, released by track, and this is where you choose yours. Self-paced team build starts the moment the problems are released and runs continuously to Demo Day, so you can begin building straight away rather than waiting for a start whistle. Day 1 is mandatory and aims to run on-site at *SCAPE L^IFE Jungle (Zoom fallback if the venue isn't locked). (A live per-track briefing follows on Day 2, right after the Crash Course.)",
    },
    location: ONSITE,
  },
  {
    id: "d1-briefing",
    day: 1,
    date: "08.22",
    category: "network",
    mode: "offline",
    timeOfDay: "PM",
    title: { ko: "현장 브리핑 & Q&A", en: "On-site Briefing & Q&A" },
    summary: {
      ko: "과제 설명과 진행 방식 안내, 그리고 질의응답.",
      en: "Walking through the problems, how it runs, and your questions.",
    },
    description: {
      ko: "공개된 과제를 함께 살펴보고, 8일간의 진행 방식·팀 구성·평가 기준을 안내하는 현장 브리핑입니다. 궁금한 점은 그 자리에서 바로 묻고 답을 들을 수 있어, 첫날부터 막힘 없이 출발할 수 있습니다.",
      en: "An on-site briefing that walks through the released problems and explains how the eight days work — team formation, schedule and judging. Bring your questions; you'll get answers on the spot so nobody starts the week unsure of how it runs.",
    },
    location: ONSITE,
  },

  // ─── DAY 2 · Crash Course (08.23) ───────────────────────────────────────────
  {
    id: "d2-crash-course",
    day: 2,
    date: "08.23",
    category: "workshop",
    mode: "online",
    timeOfDay: "AM",
    confirmed: true,
    title: { ko: "크래시코스 · 바이브 코딩 입문", en: "Crash Course · Vibe Coding Intro" },
    summary: {
      ko: "집중 5–6시간의 바이브 코딩 입문 — 비개발자도 OK.",
      en: "A focused 5–6h vibe-coding intro — non-developers welcome.",
    },
    description: {
      ko: "참가자의 약 60%가 바이브 코딩이 처음입니다. 그래서 여러 번에 나누지 않고, 하루에 몰아서 끝내는 집중 5–6시간의 크래시코스로 모두의 출발선을 맞춥니다. AI 도구로 아이디어를 작동하는 프로토타입으로 바꾸는 기본기를 핸즈온으로 익혀, 기술 장벽이 아니라 아이디어가 한계가 되도록 합니다. 비개발자도 따라올 수 있게 설계되었고, 참여자 전원에게는 8일차 이후 수료증이 발급됩니다. 이 크래시코스는 코드프레소가 주관합니다.",
      en: "About 60% of participants are trying vibe coding for the first time — so instead of spreading it out, one concentrated 5–6 hour Crash Course levels the start line in a single day. A hands-on run through the fundamentals of turning ideas into working prototypes with AI tools, so your ideas — not the tooling — are the limit. It's built so non-developers can keep up, and every participant receives a certificate after Day 8. The Crash Course is run by Codepresso.",
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
      {
        ko: "참여자 전원 수료증 (8일차 이후 발급)",
        en: "A completion certificate for every participant (issued after Day 8).",
      },
    ],
  },
  {
    id: "d2-problem-video",
    day: 2,
    date: "08.23",
    category: "main",
    mode: "online",
    timeOfDay: "PM",
    title: { ko: "문제 영상 공개 & 팀 빌딩", en: "Problem Video Release & Team Building" },
    summary: {
      ko: "크래시코스 직후, 상세 문제 영상 공개와 팀 빌딩 시작.",
      en: "Right after the crash course — a detailed problem video, then team building.",
    },
    description: {
      ko: "크래시코스가 끝난 직후, 과제를 더 깊이 보여주는 상세 문제 영상이 공개됩니다. 다른 접근 예시까지 함께 시연한 뒤, 곧바로 팀 빌딩이 시작됩니다. 방금 익힌 기본기를 실제 문제 위에 얹어, ‘무엇을 만들지’를 팀과 함께 정하는 흐름으로 이어집니다.",
      en: "Right after the Crash Course, a detailed problem video goes deeper into the challenge. After a walk-through of different example approaches, team building begins straight away — putting the fundamentals you just learned onto a real problem and deciding, as a team, what to build.",
    },
    location: ONLINE,
  },

  // ─── DAY 3 · Self-build · Mentoring (08.24) ─────────────────────────────────
  {
    id: "d3-self-build",
    day: 3,
    date: "08.24",
    category: "build",
    mode: "online",
    timeOfDay: "AM",
    title: { ko: "자율 빌드", en: "Self-led Build" },
    summary: {
      ko: "팀 단위로 방향을 정하고 문제 해결에 착수합니다.",
      en: "Teams set direction and start solving the problem.",
    },
    description: {
      ko: "팀이 스스로 방향을 설정하고 문제 해결에 착수하는 자율 빌드 시간입니다. 공개된 AX 과제를 어떻게 풀지 정하고, 첫 구현으로 들어갑니다. 운영진이 정해주는 세션이 아니라, 팀이 주도하는 시간입니다.",
      en: "Self-directed build time where teams set their own direction and start solving the problem — deciding how to tackle the released AX problem and moving into a first implementation. This is team-led time, not a hosted session.",
    },
    location: ONLINE,
  },
  {
    id: "d3-codex-workshop",
    day: 3,
    date: "08.24",
    category: "workshop",
    mode: "online",
    timeOfDay: "AM",
    confirmed: false,
    title: { ko: "OpenAI Codex 워크샵 (조율 중)", en: "OpenAI Codex Workshop (TBC)" },
    summary: {
      ko: "빌드 경험자를 위한 Codex 실전 세션 — 아직 조율 중입니다.",
      en: "A hands-on Codex session for experienced builders — still being arranged.",
    },
    description: {
      ko: "빌드 경험이 어느 정도 있는 학생을 위해 OpenAI와 함께 논의 중인 Codex 워크샵/셰어링 세션입니다. Codex를 레포·스펙(테스트, QA/QC)과 연결하는 법, OpenAI API, function calling, MCP 등 아직 많은 학생이 접해보지 못한 Codex 기능을 다룰 예정입니다. 아직 확정된 세션이 아니라 일정과 형태를 조율 중이며, 확정되는 대로 안내됩니다.",
      en: "A Codex-focused workshop / sharing session being discussed with OpenAI for students who already have some building experience. It may cover connecting Codex with repos & specs (tests, QA/QC), the OpenAI API, function calling, MCP and other Codex features many students haven't seen yet. It isn't confirmed — the schedule and format are still in coordination, and it'll be announced once locked.",
    },
    location: ONLINE,
    org: OPENAI_ORG,
  },
  {
    id: "d3-mentoring",
    day: 3,
    date: "08.24",
    category: "mentoring",
    mode: "online",
    timeOfDay: "PM",
    title: { ko: "1:1 멘토링", en: "1:1 Mentoring" },
    summary: {
      ko: "막힌 지점을 점검하고 방향을 조정하는 1:1.",
      en: "Unblock and adjust direction, one-on-one.",
    },
    description: {
      ko: "정해진 시간표 대신 팀의 필요에 맞춰 진행되는 1:1 멘토링입니다. 막힌 지점을 함께 점검하고 방향을 조정합니다. 멘토는 ‘정답을 주는 심사자’가 아니라 한때 우리와 같았던 유학생 출신 현직 대표 — 같은 눈높이에서 함께 고민하는 선배입니다. 학생 정체성과 giver 문화를 지키는 이 멘토 persona가 이 시간의 핵심입니다. (멘토 라인업은 확정에 따라 안내됩니다.)",
      en: "One-on-one mentoring that follows each team's needs rather than a fixed timetable — checking blockers and adjusting direction. Mentors aren't answer-giving judges; they're Korean ex-international-student founders who were once in your shoes, thinking alongside you at eye level. That peer-mentor persona — protecting the student identity and giver culture — is the point of this time. (Mentor line-up to be announced as it's confirmed.)",
    },
    location: ONLINE,
    // mentors — TODO: confirm line-up
  },

  // ─── DAY 4 · Self-build · Mentoring (08.25) ─────────────────────────────────
  {
    id: "d4-self-build",
    day: 4,
    date: "08.25",
    category: "build",
    mode: "online",
    timeOfDay: "AM",
    title: { ko: "자율 빌드", en: "Self-led Build" },
    summary: {
      ko: "프로토타입을 빌드하고 완성도를 높입니다.",
      en: "Build the prototype and raise its completeness.",
    },
    description: {
      ko: "전날 잡은 방향 위에서 프로토타입을 실제로 빌드하고 완성도를 끌어올리는 자율 빌드 시간입니다. 핵심 흐름이 작동하게 만들고, 부족한 부분을 채워가며 데모데이를 향한 토대를 다집니다.",
      en: "Self-led build time to actually build the prototype and raise its completeness on top of the direction set the day before — getting the core flow working and filling the gaps that lay the foundation toward Demo Day.",
    },
    location: ONLINE,
  },
  {
    id: "d4-mentoring",
    day: 4,
    date: "08.25",
    category: "mentoring",
    mode: "online",
    timeOfDay: "PM",
    title: { ko: "1:1 멘토링", en: "1:1 Mentoring" },
    summary: {
      ko: "프로토타입을 점검하고 진전을 함께 봅니다.",
      en: "Prototype review and progress, together.",
    },
    description: {
      ko: "팀이 만든 프로토타입을 함께 점검하고 진전을 살피는 1:1 멘토링입니다. 무엇이 잘 되고 있는지, 어디를 더 밀어야 하는지를 같은 눈높이의 선배 멘토와 짚어봅니다. 멘토는 유학생 출신 현직 대표로, 학생 교류와 giver 문화를 지키는 역할입니다.",
      en: "One-on-one mentoring to review the prototype your team built and look at progress together — what's working, and where to push harder — with peer-level senior mentors. Mentors are Korean ex-international-student founders, there to keep the student exchange and giver culture alive.",
    },
    location: ONLINE,
    // mentors — TODO: confirm line-up
  },

  // ─── DAY 5 · In-person Kickoff · Panels (08.26 · OFFLINE) ────────────────────
  {
    id: "d5-kickoff",
    day: 5,
    date: "08.26",
    category: "main",
    mode: "offline",
    timeOfDay: "AM",
    title: { ko: "오프라인 킥오프 · 직접 만나는 날", en: "In-person Kickoff · Meeting Day" },
    summary: {
      ko: "전원이 처음으로 현장에 모여 Lab 2(실전)를 엽니다.",
      en: "The whole cohort meets in person for the first time — Lab 2 begins.",
    },
    description: {
      ko: "온라인으로 진행되던 일정 중, 처음으로 전원이 *SCAPE L^IFE Jungle 현장에 모이는 날입니다(10AM–2PM). Zero100 소개와 파트너사 인사로 문을 열고, 여기서부터 실전 단계인 Lab 2가 시작됩니다. 화면 너머로만 함께 빌드하던 사람들을 직접 만나, 남은 절반을 같은 공간에서 이어갑니다.",
      en: "The first day the whole cohort gathers in person at *SCAPE L^IFE Jungle (10AM–2PM). It opens with a Zero100 intro and partner-company greetings, and from here Lab 2 — the main event — begins. You finally meet the people you'd only built alongside on-screen, and carry the second half forward in one room.",
    },
    location: ONSITE,
  },
  {
    id: "d5-panel-usecase",
    day: 5,
    date: "08.26",
    category: "network",
    mode: "offline",
    timeOfDay: "AM",
    title: { ko: "패널 1 · 참여자 AI Use Case", en: "Panel 1 · Participant AI Use Cases" },
    summary: {
      ko: "참여자들이 자기 AI 활용 사례를 라이트닝으로 공유.",
      en: "Participants share their own AI use cases, lightning-style.",
    },
    description: {
      ko: "참여자 몇 명이 자기 AI 활용 사례를 짧은 라이트닝 형식으로 공유하는 패널입니다. 대표진도 청중으로 함께하며, 참가자 간 교류가 자연스럽게 이어집니다. 다른 사람이 실제로 AI를 어떻게 쓰는지에서 자극을 받고, 내 빌드에 바로 가져올 아이디어를 얻는 자리입니다.",
      en: "A panel where a handful of participants share their own AI use cases in a short lightning format, with founders in the audience and easy peer exchange throughout. A chance to draw energy from how others actually use AI — and take ideas straight back into your own build.",
    },
    location: ONSITE,
  },
  {
    id: "d5-panel-founding",
    day: 5,
    date: "08.26",
    category: "main",
    mode: "offline",
    timeOfDay: "AM",
    title: { ko: "패널 2 · 이병일 · 멘탈관리와 회복탄력성", en: "Panel 2 · Lee Byung-il · Resilience & Mental Management" },
    // TODO: confirm — speaker name is from the internal deck; confirm public naming is OK.
    speaker: { ko: "이병일", en: "Lee Byung-il" },
    summary: {
      ko: "실패·재기에서 배우는 회복탄력성 — 이병일 파트너와 함께.",
      en: "Resilience, learned from failure & comebacks — with Lee Byung-il.",
    },
    description: {
      ko: "Wilt Venture Builder(SG)의 이병일 파트너와 함께하는 패널입니다. ‘창업가의 멘탈관리와 회복탄력성’을 주제로, 스타트업의 실패·재기 스토리에서 배우는 회복탄력성과 빌드 중 좌절을 다루는 법을 나눕니다. 헤드다운 빌드로 들어가기 직전, 끝까지 완주할 동기를 다시 채우는 시간입니다.",
      en: "A panel with Lee Byung-il (Venture Partner, Wilt Venture Builder SG) on ‘Founder resilience & mental management’ — the resilience learned from startup failure-and-comeback stories, and how to handle the setbacks that come mid-build. Right before the heads-down build, it's a moment to top up the motivation to see it through.",
    },
    location: ONSITE,
  },
  {
    id: "d5-networking",
    day: 5,
    date: "08.26",
    category: "network",
    mode: "offline",
    timeOfDay: "PM",
    title: { ko: "네트워킹", en: "Networking" },
    summary: {
      ko: "현장에서 사람과 사람을 잇는 온사이트 믹서.",
      en: "An on-site mixer connecting people in person.",
    },
    description: {
      ko: "패널에 이어, 현장에서 참가자·멘토·파트너가 자연스럽게 어울리는 네트워킹입니다. 온라인으로 쌓아 온 관계를 얼굴을 맞대고 다지고, 팀을 넘어선 연결을 만드는 자리입니다.",
      en: "Following the panels, an on-site networking block where participants, mentors and partners mix in person — turning the relationships built online into face-to-face ones, and making connections beyond your own team.",
    },
    location: ONSITE,
  },

  // ─── DAY 6 · Open Build (08.27) ─────────────────────────────────────────────
  {
    id: "d6-open-build",
    day: 6,
    date: "08.27",
    category: "build",
    mode: "online",
    timeOfDay: "AM",
    title: { ko: "오픈 빌드", en: "Open Build" },
    summary: {
      ko: "팀 자율 빌드가 온종일 상시로 진행됩니다.",
      en: "Team-led build runs, self-paced, all day.",
    },
    description: {
      ko: "팀 자율 빌드가 온종일 상시로 진행되는 오픈 빌드 데이입니다. 정해진 세션 없이 각 팀이 자기 페이스로 프로덕트를 스스로 완성해 갑니다. 온라인으로 진행되며, 필요한 팀은 가벼운 멘토링 접점을 활용할 수 있습니다.",
      en: "An open build day — team-led build runs continuously, all day. No fixed sessions; each team pushes its product toward completion at its own pace. It runs online, with a light mentoring touchpoint available for teams that need it.",
    },
    location: ONLINE,
  },

  // ─── DAY 7 · Final Rehearsal (08.28 · OFFLINE · AWS office) ──────────────────
  {
    id: "d7-final-rehearsal",
    day: 7,
    date: "08.28",
    category: "main",
    mode: "offline",
    timeOfDay: "AM",
    title: { ko: "파이널 리허설 (현장)", en: "Final Rehearsal (on-site)" },
    summary: {
      ko: "AWS 오피스에서 최종 발표를 준비하고 리허설합니다.",
      en: "Final-pitch prep and rehearsal at the AWS office.",
    },
    description: {
      ko: "데모데이를 하루 앞두고, AWS 오피스(확정)에서 진행하는 현장 파이널 리허설입니다. 오전부터 오후 2시까지, 최종 발표를 준비하고 무대를 리허설하며 데모의 흐름과 예상 질문을 다듬습니다. Day 5에 이은 두 번째 현장 집결이자, 새 장소인 AWS 오피스에서 열립니다.",
      en: "The day before Demo Day, an on-site final rehearsal at the AWS office (confirmed). From the morning to 2PM, teams prep the final pitch and rehearse on stage, tightening the demo flow and likely questions. It's the second in-person gathering after Day 5 — at the new AWS-office venue.",
    },
    location: AWS_OFFICE,
  },
  {
    id: "d7-speaker-session",
    day: 7,
    date: "08.28",
    category: "network",
    mode: "offline",
    timeOfDay: "PM",
    title: { ko: "연사 세션", en: "Speaker Session" },
    summary: {
      ko: "파이널 리허설과 함께하는 연사 세션.",
      en: "A speaker session alongside the final rehearsal.",
    },
    description: {
      ko: "파이널 리허설 일정의 일부로 마련된 연사 세션입니다. 발표를 앞둔 팀들에게 관점과 자극을 더하는 이야기 시간으로, 리허설 사이의 호흡을 고르며 마지막 동기를 채웁니다. (연사·세부 내용은 확정되는 대로 안내됩니다.)",
      en: "A speaker session set within the final-rehearsal day — a talk to add perspective and energy for teams about to present, and a beat between rehearsals to top up the final motivation. (Speaker and details to be announced once confirmed.)",
    },
    location: AWS_OFFICE,
    // speaker / topic — TODO: confirm
  },

  // ─── DAY 8 · Demo Day · Final Pitch (08.29 · OFFLINE) ────────────────────────
  {
    id: "d8-opening-keynote",
    day: 8,
    date: "08.29",
    category: "main",
    mode: "offline",
    timeOfDay: "AM",
    confirmed: true,
    title: { ko: "데모데이 키노트 · 박희덕", en: "Demo Day Keynote · Park Hee-deok" },
    // TODO: confirm — speaker name is from the internal deck; confirm public naming is OK.
    speaker: { ko: "박희덕", en: "Park Hee-deok" },
    summary: {
      ko: "‘제로백의 진짜 의미’로 여는 데모데이.",
      en: "Demo Day opens on ‘The Real Meaning of Zero100’.",
    },
    description: {
      ko: "데모데이를 여는 키노트입니다. 트랜스링크 인베스트먼트의 박희덕 대표가 ‘제로백의 진짜 의미’를 주제로 약 1시간 동안 이야기합니다. 창업가가 0에서 100으로 가기 위한 핵심 요소 — 협업·가치·실행·글로벌 스탠다드의 중요성과 협업의 힘, 그리고 왜 지금, 왜 싱가포르의 한인 학생인지를 짚으며 피칭 직전의 동기를 끌어올립니다.",
      en: "The keynote that opens Demo Day. Park Hee-deok (CEO · General Partner, Translink Investment) speaks for about an hour on ‘The Real Meaning of Zero100’ — the core of going from zero to a hundred: collaboration, value, execution and global standards, the power of collaboration, and why now and why Korean students in Singapore — lifting the motivation right before pitching.",
    },
    location: ONSITE,
  },
  {
    id: "d8-judging",
    day: 8,
    date: "08.29",
    category: "main",
    mode: "offline",
    timeOfDay: "AM",
    title: { ko: "심사", en: "Judging" },
    summary: {
      ko: "Problem Statement별 심사룸과 대기실을 운영합니다.",
      en: "A judging room per problem statement, with a waiting area.",
    },
    description: {
      ko: "각 팀이 만든 결과물을 심사하는 시간입니다. Problem Statement별로 심사룸을 나누어 운영하고, 대기실을 함께 두어 흐름을 정리합니다. 심사와 문제 발의는 AXMOS·파트너가 전담하며, 멘토와는 역할을 분리해 학생 눈높이의 멘토 문화를 지킵니다.",
      en: "Judging of what each team built — with a room per problem statement and a waiting area to keep things flowing. Judging and problem-setting are handled by AXMOS and partners, kept separate from the mentor role so the peer-level mentor culture stays intact.",
    },
    location: ONSITE,
  },
  {
    id: "d8-final-pitch",
    day: 8,
    date: "08.29",
    category: "main",
    mode: "offline",
    timeOfDay: "PM",
    title: { ko: "최종 발표 · 결과 & 시상", en: "Final Pitch · Results & Awards" },
    summary: {
      ko: "상위 팀 최종 피칭에 이어 결과 발표 · 시상 · 피드백.",
      en: "Top teams' final pitch, then results, awards and feedback.",
    },
    description: {
      ko: "8일간의 빌드를 마무리하는 최종 발표입니다. Problem Statement별 상위 팀(Top 3)이 즉석에서 슬라이드를 정리해 무대에서 피칭하고, 이어서 결과 발표·시상·피드백이 진행됩니다. 전원이 *SCAPE L^IFE Jungle 현장(11AM–3PM)에 모여, ‘데모로 끝나지 않는 성공의 경험’으로 8일을 함께 마칩니다.",
      en: "The final pitch closing out eight days of building. The top teams per problem statement (Top 3) compile slides on the spot and pitch on stage, followed by results, awards and feedback. The whole cohort gathers at *SCAPE L^IFE Jungle (11AM–3PM) to finish the eight days on a success that goes beyond a demo.",
    },
    location: ONSITE,
  },
];
