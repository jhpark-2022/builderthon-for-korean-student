// ─────────────────────────────────────────────────────────────────────────────
// SINGLE SOURCE OF TRUTH for the program.
// Both the Timetable grid and the EventModal read from this array, so editing an
// event here updates the card AND the detail view everywhere.
//
// Content transcribed from "SMU_Zero100_Builderthon_Daily_Program_EN.png" and the
// intro docs (EN/KR). Where a detail (speaker / exact venue) is not specified in
// the source material the field is left undefined with a `// TODO: confirm` note —
// please do not invent these.
// ─────────────────────────────────────────────────────────────────────────────

export type Category =
  | "main"
  | "ambassador"
  | "dinner"
  | "meetup"
  | "empowerment"
  | "network"
  | "build";

export interface Bilingual {
  ko: string;
  en: string;
}

export interface BEvent {
  id: string;
  day: number; // 1..6
  date: string; // e.g. "08.24"
  category: Category;
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
  date: string; // "08.24"
  weekday: Bilingual;
  theme: Bilingual; // day theme label
}

// Day theme labels (Kick-off → Demo Day)
export const days: DayMeta[] = [
  {
    day: 1,
    date: "08.24",
    weekday: { ko: "월", en: "Mon" },
    theme: { ko: "Kick-off", en: "Kick-off" },
  },
  {
    day: 2,
    date: "08.25",
    weekday: { ko: "화", en: "Tue" },
    theme: { ko: "PMF (제품–시장 적합성)", en: "PMF (Product–Market Fit)" },
  },
  {
    day: 3,
    date: "08.26",
    weekday: { ko: "수", en: "Wed" },
    theme: { ko: "GTM (시장 진입 전략)", en: "GTM (Go-to-Market)" },
  },
  {
    day: 4,
    date: "08.27",
    weekday: { ko: "목", en: "Thu" },
    theme: { ko: "Scale-up", en: "Scale-up" },
  },
  {
    day: 5,
    date: "08.28",
    weekday: { ko: "금", en: "Fri" },
    theme: { ko: "Calm Before the Storm", en: "Calm Before the Storm" },
  },
  {
    day: 6,
    date: "08.29",
    weekday: { ko: "토", en: "Sat" },
    theme: { ko: "Demo Day", en: "Demo Day" },
  },
];

// Category legend (label + short meaning, both bilingual)
export const categoryMeta: Record<
  Category,
  { label: Bilingual; blurb: Bilingual; dot: string }
> = {
  main: {
    label: { ko: "메인 세션", en: "Main Session" },
    blurb: {
      ko: "오프닝 · Founder Sharing · 데모데이 — 행사의 핵심 트랙 (유지)",
      en: "Opening · Founder Sharing · Demo Day — the core event track (retained)",
    },
    dot: "#fcd34d", // bright gold (matches the ★) — visible on the dark theme
  },
  ambassador: {
    label: { ko: "AI 앰배서더", en: "AI Ambassador" },
    blurb: {
      ko: "선도적인 AI 도구 활용 사례를 공유합니다.",
      en: "Shares leading AI-tool use cases.",
    },
    dot: "#7C5CFF", // purple
  },
  dinner: {
    label: { ko: "테마 디너", en: "Theme Dinner" },
    blurb: {
      ko: "FinTech · Payment · Blockchain 등 분야별 디너 / 밋업.",
      en: "FinTech · Payment · Blockchain theme dinners / meetups.",
    },
    dot: "#E0852A", // orange
  },
  meetup: {
    label: { ko: "테마 밋업", en: "Theme Meetup" },
    blurb: {
      ko: "분야별 생태계 인사와 만나는 캐주얼 네트워킹.",
      en: "Casual networking with people across each ecosystem.",
    },
    dot: "#E0852A", // orange
  },
  empowerment: {
    label: { ko: "창업가 정신", en: "Entrepreneurship Empowerment" },
    blurb: {
      ko: "“모두가 창업가가 될 필요는 없다” — 진로의 폭을 넓히는 세션.",
      en: "“Not everyone needs to be a founder” — broadening the path.",
    },
    dot: "#0F9D8F", // teal
  },
  network: {
    label: { ko: "네트워킹", en: "Networking" },
    blurb: {
      ko: "팀빌딩 · 믹서 · 클로징 — 사람과 사람을 잇는 시간.",
      en: "Team building · mixers · closing — connecting people.",
    },
    dot: "#2F6DF0", // blue
  },
  build: {
    label: { ko: "빌드 / 자율", en: "Build / Open" },
    blurb: {
      ko: "메인 세션 없이 빌드에 집중 — 수시 멘토링과 자율 빌드.",
      en: "Focused build with no main session — rolling mentoring & open build.",
    },
    dot: "#64748B", // slate grey
  },
};

const VENUE_TBC: Bilingual = {
  ko: "장소 미정 · 확정 예정 (싱가포르)",
  en: "Venue to be confirmed (Singapore)",
};

export const schedule: BEvent[] = [
  // ─── DAY 1 · Kick-off (08.24) ───────────────────────────────────────────────
  {
    id: "d1-opening",
    day: 1,
    date: "08.24",
    category: "main",
    timeOfDay: "PM",
    title: { ko: "오프닝 세리머니", en: "Opening Ceremony" },
    summary: {
      ko: "6일간의 빌더톤을 여는 오프닝과 빌더 인사이트 연사.",
      en: "Opening the 6-day builderthon with a builder insight talk.",
    },
    description: {
      ko: "Day 1·6(킥오프·데모데이)은 오프라인으로 진행됩니다. 오프닝 세리머니에서 행사의 취지와 6일 여정을 소개하고, 빌더 인사이트 연사를 통해 ‘왜 지금 싱가포르에서 빌드하는가’에 대한 큰 그림을 공유합니다. 단발성 해커톤이 아닌 페스티벌형 빌더톤으로서의 분위기를 함께 만들어 갑니다.",
      en: "Day 1 and Day 6 (Kick-off & Demo Day) run offline. The opening ceremony introduces the mission and the 6-day journey, followed by a builder insight talk on why now is the moment to build in Singapore. This is where the festival-style builderthon — not a one-shot hackathon — sets its tone.",
    },
    location: VENUE_TBC,
    // speaker — TODO: confirm
  },
  {
    id: "d1-team-building",
    day: 1,
    date: "08.24",
    category: "network",
    timeOfDay: "PM",
    title: { ko: "아이데이션 & 팀빌딩", en: "Ideation & Team Building" },
    summary: {
      ko: "아이디어를 모으고 함께 빌드할 팀을 구성합니다.",
      en: "Gather ideas and form the teams you'll build with.",
    },
    description: {
      ko: "참가자들이 서로의 관심사와 아이디어를 나누고, 6일간 함께 빌드할 팀을 구성하는 시간입니다. 학교(SMU·NUS·NTU)와 배경을 넘어 새로운 팀을 만나고, 바이브코딩(Vibe Coding)으로 곧장 프로토타입을 만들 수 있도록 방향을 잡습니다.",
      en: "Participants share interests and ideas and form the teams they'll build with over six days. Meet new teammates across universities (SMU·NUS·NTU) and backgrounds, and set a direction so you can move straight into vibe coding your first prototype.",
    },
    location: VENUE_TBC,
  },
  {
    id: "d1-welcome-mixer",
    day: 1,
    date: "08.24",
    category: "network",
    timeOfDay: "PM",
    title: { ko: "웰컴 믹서", en: "Welcome Mixer" },
    summary: {
      ko: "참가자·연사·운영진이 함께하는 환영 네트워킹.",
      en: "A welcome mixer for participants, speakers and the team.",
    },
    description: {
      ko: "첫날을 마무리하는 캐주얼한 환영 믹서입니다. 싱가포르 한인 학생 커뮤니티가 학교별로 분리되어 있던 벽을 넘어, 참가자와 연사·운영진이 편안하게 어울리며 6일간의 빌드를 함께할 관계를 만듭니다.",
      en: "A casual welcome mixer to close out day one. Crossing the university lines that have kept the Korean student community apart, participants, speakers and organizers mingle and build the relationships that will carry the next six days.",
    },
    location: VENUE_TBC,
  },

  // ─── DAY 2 · PMF (08.25) ────────────────────────────────────────────────────
  {
    id: "d2-founder-sharing",
    day: 2,
    date: "08.25",
    category: "main",
    timeOfDay: "PM",
    title: { ko: "Founder Sharing — PMF", en: "Founder Sharing — PMF" },
    summary: {
      ko: "창업가가 직접 들려주는 제품–시장 적합성(PMF) 이야기.",
      en: "A founder on finding Product–Market Fit, first-hand.",
    },
    description: {
      ko: "현업 창업가가 제품–시장 적합성(PMF)을 찾아가는 과정을 직접 공유하는 메인 세션입니다. 초기 가설 검증, 사용자 발견, 처음의 ‘될 것 같다’는 신호를 읽는 법까지 — 학생들이 자신의 빌드에 바로 적용할 수 있는 실전 인사이트를 전합니다.",
      en: "A main-track session where a founder shares how they found Product–Market Fit. From validating early hypotheses to user discovery and reading the first real signals of traction — practical insight students can apply directly to their own builds.",
    },
    location: VENUE_TBC,
    // speaker — TODO: confirm
  },
  {
    id: "d2-ai-use-case",
    day: 2,
    date: "08.25",
    category: "ambassador",
    timeOfDay: "PM",
    title: { ko: "AI 활용 사례", en: "AI Use Case" },
    summary: {
      ko: "AI 앰배서더가 전하는 최신 AI 도구 활용 사례.",
      en: "Leading AI-tool use cases from an AI Ambassador.",
    },
    description: {
      ko: "AI 앰배서더가 실제 빌드와 업무에서 AI 도구를 어떻게 활용하는지 구체적인 사례로 보여 줍니다. 아이디어를 작동하는 프로토타입으로 빠르게 전환하는 워크플로를 익혀, 기술 장벽에 막히지 않고 자유롭게 빌드할 수 있도록 돕습니다.",
      en: "An AI Ambassador walks through concrete examples of how leading AI tools are used in real builds and workflows. Learn how to turn ideas into working prototypes fast, so technical barriers never stand between you and shipping.",
    },
    location: VENUE_TBC,
    // speaker — TODO: confirm
  },
  {
    id: "d2-fintech-dinner",
    day: 2,
    date: "08.25",
    category: "dinner",
    timeOfDay: "PM",
    title: { ko: "핀테크 디너", en: "FinTech Dinner" },
    summary: {
      ko: "핀테크를 주제로 한 디너 네트워킹.",
      en: "A dinner gathering around FinTech.",
    },
    description: {
      ko: "핀테크를 주제로 한 테마 디너입니다. 관련 분야의 창업가·비즈니스 오너와 학생들이 한 테이블에서 식사하며, 생태계 전반의 사람들과 ‘실제로’ 연결되는 장을 만듭니다.",
      en: "A FinTech-themed dinner. Students share a table with founders and business owners in the space — creating a setting where you genuinely connect with people across the ecosystem, not just collect names.",
    },
    location: VENUE_TBC,
  },

  // ─── DAY 3 · GTM (08.26) ────────────────────────────────────────────────────
  {
    id: "d3-founder-sharing",
    day: 3,
    date: "08.26",
    category: "main",
    timeOfDay: "PM",
    title: { ko: "Founder Sharing — GTM", en: "Founder Sharing — GTM" },
    summary: {
      ko: "시장 진입(GTM) 전략을 다루는 창업가 세션.",
      en: "A founder session on Go-to-Market strategy.",
    },
    description: {
      ko: "제품을 시장에 실제로 내보내는 ‘Go-to-Market(GTM)’을 주제로 한 메인 세션입니다. 첫 사용자 확보, 채널 선택, 초기 성장 전략 등 데모데이까지 빌드를 끌고 갈 실전 노하우를 창업가의 경험으로 풀어냅니다.",
      en: "A main-track session on Go-to-Market — actually getting a product into the world. Acquiring first users, choosing channels and early growth strategy, drawn from a founder's own experience to carry your build all the way to Demo Day.",
    },
    location: VENUE_TBC,
    // speaker — TODO: confirm
  },
  {
    id: "d3-ai-use-case",
    day: 3,
    date: "08.26",
    category: "ambassador",
    timeOfDay: "PM",
    title: { ko: "AI 활용 사례", en: "AI Use Case" },
    summary: {
      ko: "두 번째 AI 앰배서더 세션 — 심화 활용 사례.",
      en: "A second AI Ambassador session — deeper use cases.",
    },
    description: {
      ko: "두 번째 AI 활용 사례 세션입니다. 빌드가 본격화되는 시점에 맞춰, 더 깊이 있는 AI 워크플로와 자동화 사례를 공유해 팀들이 제품의 완성도와 속도를 동시에 끌어올릴 수 있도록 돕습니다.",
      en: "A second AI Use Case session. Timed for when builds are in full swing, it shares deeper AI workflows and automation examples so teams can raise both the polish and the velocity of their product.",
    },
    location: VENUE_TBC,
    // speaker — TODO: confirm
  },
  {
    id: "d3-payment-dinner",
    day: 3,
    date: "08.26",
    category: "dinner",
    timeOfDay: "PM",
    title: { ko: "페이먼트 디너", en: "Payment Dinner" },
    summary: {
      ko: "페이먼트 분야를 주제로 한 디너 밋업.",
      en: "A dinner meetup focused on Payments.",
    },
    description: {
      ko: "페이먼트(결제) 분야를 주제로 한 디너 밋업입니다. 결제·핀테크 인접 분야의 실무자·창업가와 편안한 자리에서 대화하며, 학생들이 산업의 현재와 기회를 가까이서 들여다볼 수 있게 합니다.",
      en: "A Payments-themed dinner meetup. Over a relaxed meal with practitioners and founders adjacent to payments and fintech, students get a close-up view of where the industry is and where the openings are.",
    },
    location: VENUE_TBC,
  },

  // ─── DAY 4 · Scale-up (08.27) ───────────────────────────────────────────────
  {
    id: "d4-founder-sharing",
    day: 4,
    date: "08.27",
    category: "main",
    timeOfDay: "PM",
    title: { ko: "Founder Sharing — Scale-up", en: "Founder Sharing — Scale-up" },
    summary: {
      ko: "스케일업 단계를 다루는 창업가 메인 세션.",
      en: "A founder main-session on the Scale-up stage.",
    },
    description: {
      ko: "PMF와 GTM을 지나 ‘스케일업’ 단계로 나아가는 이야기를 다루는 메인 세션입니다. 조직과 제품을 키우며 마주하는 현실적인 도전과 의사결정을, 그 길을 먼저 걸어 본 창업가의 시선으로 공유합니다.",
      en: "A main-track session on moving past PMF and GTM into Scale-up. The real challenges and decisions that come with growing an organization and a product — shared through the eyes of a founder who has walked the path first.",
    },
    location: VENUE_TBC,
    // speaker — TODO: confirm
  },
  {
    id: "d4-empowerment",
    day: 4,
    date: "08.27",
    category: "empowerment",
    timeOfDay: "PM",
    title: {
      ko: "Empowerment (창업가 정신 세션)",
      en: "Empowerment (Entrepreneurship session)",
    },
    summary: {
      ko: "“모두가 창업가가 될 필요는 없다” — 진로의 폭을 넓히는 세션.",
      en: "“Not everyone needs to be a founder” — widening the path.",
    },
    description: {
      ko: "“모두가 창업가가 될 필요는 없다”는 메시지를 중심으로, 창업이라는 길 외에도 빌더로서 가질 수 있는 다양한 진로와 기여 방식을 함께 들여다봅니다. 부담이 아니라 가능성으로서의 창업가 정신을 이야기하며, 각자에게 맞는 다음 걸음을 찾도록 돕습니다.",
      en: "Built around the idea that not everyone needs to be a founder, this session explores the many paths and ways to contribute as a builder beyond starting a company. It frames entrepreneurship as possibility rather than pressure, helping each person find the next step that fits them.",
    },
    location: VENUE_TBC,
    // speaker — TODO: confirm
  },
  {
    id: "d4-blockchain-meetup",
    day: 4,
    date: "08.27",
    category: "meetup",
    timeOfDay: "PM",
    confirmed: true,
    title: { ko: "블록체인 밋업", en: "Blockchain Meetup" },
    summary: {
      ko: "Alchemy GTM Lead의 지원이 확정된 블록체인 밋업.",
      en: "Blockchain-focused meetup with confirmed support from an Alchemy GTM Lead.",
    },
    description: {
      ko: "크립토 인프라, Web3 제품, 그리고 생태계의 GTM 관점에 관심 있는 학생들을 위한 블록체인 밋업입니다. Alchemy GTM Lead의 지원이 확정되었으며, 구체적인 연사 정보는 확정 후 업데이트합니다.",
      en: "A focused blockchain meetup for students interested in crypto infrastructure, web3 products, and go-to-market lessons from the ecosystem. Support from an Alchemy GTM Lead has been confirmed; exact speaker details will be updated once finalized.",
    },
    // TODO: confirm — specific speaker name not provided yet; using role only.
    speaker: { ko: "Alchemy GTM Lead", en: "Alchemy GTM Lead" },
    location: VENUE_TBC,
    org: {
      name: "Alchemy",
      url: "https://www.alchemy.com",
      desc: {
        ko: "Alchemy는 Ethereum을 비롯한 여러 블록체인 위에서 앱을 만들 수 있게 해주는 대표적인 Web3 개발자 인프라 플랫폼입니다. 노드·API·SDK를 제공하며, 전 세계 수많은 Web3 팀이 사용합니다.",
        en: "Alchemy is a leading web3 developer-infrastructure platform that lets teams build apps on Ethereum and other chains — node infrastructure, APIs, and SDKs used by web3 teams worldwide.",
      },
    },
    opportunities: [
      {
        ko: "Alchemy GTM Lead에게서 Web3·크립토의 실제 시장 진입(GTM) 전략을 직접 듣기",
        en: "Hear real go-to-market (GTM) lessons for web3 & crypto straight from an Alchemy GTM Lead.",
      },
      {
        ko: "크립토 인프라·Web3 제품을 만드는 사람들과 가까이서 네트워킹",
        en: "Network up close with people building crypto infrastructure and web3 products.",
      },
      {
        ko: "블록체인 생태계의 커리어·기회가 어디에 열려 있는지 감 잡기",
        en: "Get a feel for where the careers and openings are across the blockchain ecosystem.",
      },
    ],
  },
  {
    id: "d4-adhoc-mentoring",
    day: 4,
    date: "08.27",
    category: "build",
    timeOfDay: "PM",
    title: { ko: "수시 멘토링", en: "Ad-hoc Mentoring" },
    summary: {
      ko: "Day 4–5 동안 필요할 때 받는 롤링 멘토링.",
      en: "Rolling mentoring across Day 4–5, whenever you need it.",
    },
    description: {
      ko: "Day 4–5에 걸쳐, 정해진 시간표 대신 팀의 필요에 맞춰 수시로 진행되는 멘토링입니다. 막히는 지점, 피칭 준비, 기술적 난제 등 무엇이든 멘토와 1:1로 풀어내며 데모데이를 준비합니다. (멘토 라인업은 파트너 확정에 따라 안내될 예정입니다.)",
      en: "Across Day 4–5, rolling ad-hoc mentoring that follows each team's needs rather than a fixed timetable. Work through blockers, pitch prep or technical challenges one-on-one with mentors as you head into Demo Day. (Mentor line-up to be announced as partners are confirmed.)",
    },
    location: VENUE_TBC,
    // speaker / mentors — TODO: confirm
  },

  // ─── DAY 5 · Calm Before the Storm (08.28) ──────────────────────────────────
  {
    id: "d5-no-main",
    day: 5,
    date: "08.28",
    category: "build",
    timeOfDay: "AM",
    title: { ko: "메인 세션 없음 (빌드 집중)", en: "No Main Session (Build Focus)" },
    summary: {
      ko: "데모데이 전날, 메인 세션 없이 빌드에 집중하는 날.",
      en: "The day before Demo Day — no sessions, pure build.",
    },
    description: {
      ko: "‘폭풍 전야(Calm Before the Storm)’ — 데모데이를 하루 앞두고 별도의 메인 세션 없이 팀들이 온전히 빌드에 몰입하는 날입니다. 중간 빌드업 기간은 하이브리드·모듈형으로 운영되어, 각 팀이 자기 페이스로 제품을 마무리할 수 있습니다.",
      en: "Calm Before the Storm — with Demo Day one day away, there is no main session so teams can immerse themselves fully in building. The build-up period runs in a hybrid, modular format, letting each team finish their product at its own pace.",
    },
    location: VENUE_TBC,
  },
  {
    id: "d5-adhoc-mentoring",
    day: 5,
    date: "08.28",
    category: "build",
    timeOfDay: "PM",
    title: { ko: "수시 멘토링", en: "Ad-hoc Mentoring" },
    summary: {
      ko: "Day 4–5 동안 필요할 때 받는 롤링 멘토링.",
      en: "Rolling mentoring across Day 4–5, whenever you need it.",
    },
    description: {
      ko: "Day 4–5에 걸쳐, 정해진 시간표 대신 팀의 필요에 맞춰 수시로 진행되는 멘토링입니다. 막히는 지점, 피칭 준비, 기술적 난제 등 무엇이든 멘토와 1:1로 풀어내며 데모데이를 준비합니다. (멘토 라인업은 파트너 확정에 따라 안내될 예정입니다.)",
      en: "Across Day 4–5, rolling ad-hoc mentoring that follows each team's needs rather than a fixed timetable. Work through blockers, pitch prep or technical challenges one-on-one with mentors as you head into Demo Day. (Mentor line-up to be announced as partners are confirmed.)",
    },
    location: VENUE_TBC,
    // speaker / mentors — TODO: confirm
  },
  {
    id: "d5-open-build",
    day: 5,
    date: "08.28",
    category: "build",
    timeOfDay: "PM",
    title: { ko: "자율 빌드 (Open Build)", en: "Open Build" },
    summary: {
      ko: "오피스 아워 형식의 열린 자율 빌드 시간.",
      en: "Free build / office-hours style open work time.",
    },
    description: {
      ko: "오피스 아워 형식의 열린 자율 빌드 시간입니다. 팀들이 같은 공간에서 각자의 제품을 다듬고, 서로의 진행 상황을 보며 자극을 주고받습니다. 운영진과 멘토가 상주해 필요한 도움을 그때그때 제공합니다.",
      en: "An open, office-hours-style build block. Teams polish their products in a shared space, drawing energy from seeing each other's progress, with organizers and mentors on hand to help whenever it's needed.",
    },
    location: VENUE_TBC,
  },

  // ─── DAY 6 · Demo Day (08.29) ───────────────────────────────────────────────
  {
    id: "d6-final-pitch",
    day: 6,
    date: "08.29",
    category: "main",
    timeOfDay: "PM",
    title: { ko: "최종 피칭 및 시상", en: "Final Pitch & Awards" },
    summary: {
      ko: "팀별 최종 피칭과 심사, 그리고 시상.",
      en: "Final team pitches, judging and awards.",
    },
    description: {
      ko: "6일간의 빌드를 마무리하는 데모데이의 하이라이트입니다. 각 팀이 완성한 제품을 무대에서 피칭하고 심사를 거쳐 시상이 이뤄집니다. 피칭은 가능한 한 영어로 진행되어, 싱가포르에서 요구되는 글로벌 스탠다드 역량을 직접 훈련합니다.",
      en: "The highlight of Demo Day, closing out six days of building. Each team pitches their finished product on stage, judging follows, and awards are presented. Pitches run in English wherever possible — training the global-standard capability Singapore expects.",
    },
    location: VENUE_TBC,
  },
  {
    id: "d6-closing-networking",
    day: 6,
    date: "08.29",
    category: "network",
    timeOfDay: "PM",
    title: { ko: "클로징 네트워킹", en: "Closing Networking" },
    summary: {
      ko: "행사를 마무리하는 클로징 네트워킹.",
      en: "Closing networking to wrap the event.",
    },
    description: {
      ko: "빌더톤을 마무리하는 클로징 네트워킹입니다. 6일간 함께한 참가자·연사·창업가·운영진이 마지막으로 모여, 이번 행사가 일회성에 그치지 않고 싱가포르 한인 학생 빌더 커뮤니티로 이어지도록 다음을 약속하는 자리입니다.",
      en: "A closing networking session to wrap up the builderthon. Participants, speakers, founders and organizers gather one last time — turning a single event into the start of a durable community of Korean student builders in Singapore.",
    },
    location: VENUE_TBC,
  },
];
