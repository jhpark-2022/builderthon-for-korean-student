// ─────────────────────────────────────────────────────────────────────────────
// All STATIC UI copy lives here (event strings live in schedule.ts).
// Every string is bilingual: { ko, en }. Add new strings as { ko, en } pairs and
// read them with the t() helper in components.
// ─────────────────────────────────────────────────────────────────────────────

export type Locale = "ko" | "en";
export type Phrase = { ko: string; en: string };

// Internal navigation only. This is an informational program-introduction page —
// there is intentionally no application / sign-up / external form link.
export const links = {
  program: "#program", // main internal CTA target
  // Organizer contact for partnership/sponsor inquiries, with a prefilled subject.
  partnership:
    "mailto:jhpark.2022@business.smu.edu.sg?subject=Korean%20University%20Builderthon%20Partnership%20Inquiry",
};

export const dict = {
  nav: {
    about: { ko: "취지", en: "Why" },
    join: { ko: "참가 대상", en: "Join" },
    program: { ko: "프로그램", en: "Program" },
    builders: { ko: "빌더 & 파트너", en: "Builders / Partners" },
    faq: { ko: "FAQ", en: "FAQ" },
    viewProgram: { ko: "프로그램 보기", en: "View Program" },
    partner: { ko: "파트너십 문의", en: "Partner with us" },
  },

  hero: {
    eyebrow: {
      ko: "싱가포르 최초의 한인 학생 대상 페스티벌형 빌더톤",
      en: "Singapore's first festival-style builderthon for Korean students",
    },
    titleLine1: { ko: "여기서", en: "Build" },
    titleLine2: { ko: "빌드하라.", en: "in Singapore." },
    dates: { ko: "2026.08.24 – 08.29 · 6일", en: "24–29 Aug 2026 · 6 days" },
    location: { ko: "싱가포르 · 장소 확정 예정", en: "Singapore · venue to be confirmed" },
    blurb: {
      ko: "단발성 해커톤이 아닌 6일간의 페스티벌형 빌더톤. 싱가포르 한인 학생 약 100명이 바이브코딩으로 직접 빌드하고, 생태계의 창업가들과 실제로 연결됩니다.",
      en: "Not a one-shot hackathon but a 6-day festival-style builderthon. ~100 Korean students in Singapore build hands-on with vibe coding and genuinely connect with founders across the ecosystem.",
    },
    ctaProgram: { ko: "6일의 여정 둘러보기", en: "Explore the 6-day journey" },
    ctaPartner: { ko: "파트너십 문의", en: "Partner with us" },
    scroll: { ko: "스크롤", en: "Scroll" },
    statParticipants: { ko: "한인 학생", en: "Korean students" },
    statDays: { ko: "일간의 빌드", en: "days of building" },
    statLanguage: { ko: "영어 중심 진행", en: "run in English" },
  },

  about: {
    tag: { ko: "취지", en: "Why this exists" },
    heading: {
      ko: "우리가 있었으면 했던 다리를 직접 만듭니다.",
      en: "Building the bridge we wished existed.",
    },
    intro: {
      ko: "싱가포르에는 약 900명의 한인 유학생이 있지만 커뮤니티는 학교별로 나뉘어 있고, 먼저 길을 걸은 사람의 경험과 기회가 다음 세대로 잘 이어지지 않습니다. 우리는 누군가 조금 더 일찍 열어줬으면 했던 그 문을 직접 만들고자 합니다.",
      en: "There are ~900 Korean students in Singapore, split university by university — with little access or guidance passed down from those a few steps ahead. We're building the door we wished someone had opened for us.",
    },
    // The problem, in numbers — from the "900 students, no bridge between them"
    // partner deck. Sourced, not invented.
    gapTag: { ko: "지금의 현실", en: "The gap today" },
    gap: [
      {
        num: "~900",
        label: {
          ko: "NUS · NTU · SMU에 흩어진 한인 유학생 — 학교별로 나뉜 커뮤니티",
          en: "Korean students across NUS · NTU · SMU — split school by school",
        },
      },
      {
        num: "60–70%",
        label: {
          ko: "사교 중심 모임이 채워주지 못하는 도전 지향 학생",
          en: "ambition-driven students today's social-only events don't serve",
        },
      },
      {
        num: "0",
        label: {
          ko: "창업가 · 멘토 · 커리어로 잇는 상시 교류 플랫폼",
          en: "standing cross-university platform linking them to founders, mentors & careers",
        },
      },
    ],
    gapNote: {
      ko: "많은 학생이 군 복무 전후로 방향을 잃고 한국으로 돌아가지만, 먼저 온 사람의 기회가 다음 세대로 이어지는 통로는 아직 없습니다.",
      en: "Many lose direction around military service and head back to Korea — yet there's no channel passing opportunity from those who came before to the next generation.",
    },
    shiftTag: { ko: "그래서 우리가 만드는 변화", en: "The shift we're building" },
    cards: [
      {
        kicker: { ko: "01", en: "01" },
        title: { ko: "기회에서 가이던스로", en: "From access to guidance" },
        body: {
          ko: "필요한 것은 영감만이 아닙니다. 맥락을 열어주고, 시행착오를 나누며, 실제 기회로 이어주는 사람들이 필요합니다.",
          en: "Inspiration isn't enough. Students need people who open up context, share their mistakes, and point them toward real opportunities.",
        },
      },
      {
        kicker: { ko: "02", en: "02" },
        title: { ko: "하나의 행사에서 커뮤니티로", en: "From one event to a community" },
        body: {
          ko: "빌더톤은 끝이 아니라 시작점입니다. 학생·창업가·오퍼레이터가 반복적으로 연결되는 네트워크를 만듭니다.",
          en: "The builderthon is a starting point, not an end — a network where students, founders, and operators keep connecting.",
        },
      },
      {
        kicker: { ko: "03", en: "03" },
        title: { ko: "혼자가 아니라 함께", en: "From building alone to together" },
        body: {
          ko: "도전적인 학생들이 덜 외롭게, 함께 만들 동료와 멘토를 만날 수 있도록 합니다.",
          en: "So ambitious students feel less alone — and find peers and mentors to build alongside.",
        },
      },
    ],
  },

  whoWhat: {
    tag: { ko: "참가 대상 · 혜택", en: "Who should join · What you get" },
    heading: {
      ko: "전공도, 코딩 실력도 묻지 않습니다.",
      en: "You don't need to be a CS major.",
    },
    intro: {
      ko: "참가자의 약 80%는 비전공자입니다. 그리고 그게 핵심입니다 — 바이브코딩과 AI로, 코딩 실력이 아니라 아이디어가 한계가 됩니다.",
      en: "About 80% of builders won't come from CS — and that's the point. With vibe coding and AI, your ideas, not your syntax, are the limit.",
    },
    whoTitle: { ko: "이런 분께", en: "Who should join" },
    who: [
      { ko: "전공 불문 — SMU · NUS · NTU의 모든 한인 학생", en: "Any major — Korean students across SMU · NUS · NTU" },
      { ko: "코딩 경험이 없어도 좋습니다 — 바이브코딩과 AI 도구로 시작합니다", en: "No coding experience needed — start with vibe coding and AI tools" },
      { ko: "혼자도, 팀도 좋습니다 — 팀 구성을 강제하지 않습니다", en: "Solo or team — grouping is never forced" },
      { ko: "영어가 부담돼도 괜찮습니다 — 글로벌 스탠다드로 함께 훈련합니다", en: "Nervous about English? We train you to the global standard, together" },
    ],
    getTitle: { ko: "얻어가는 것", en: "What you get" },
    get: [
      { ko: "6일간 AI로 실제 작동하는 제품 빌드", en: "Build a real, working product in 6 days with AI" },
      { ko: "창업가 · VC와의 실질적 네트워킹", en: "Genuine networking with founders & VCs" },
      { ko: "멘토링 & AI Use Case 세션 (AWS · OpenAI급 연사)", en: "Mentoring & AI Use Case sessions (AWS · OpenAI-class speakers)" },
      { ko: "우수 참가자 대상 프로젝트 인턴십*", en: "Project internships for top performers*" },
      { ko: "수료증*", en: "Certificate of completion*" },
    ],
    disclaimer: {
      ko: "* 인턴십 · 수료증 등 일부 혜택은 파트너와 논의 중이며 확정 시 안내됩니다.",
      en: "* Some benefits (internships, certificates) are under discussion with partners and will be confirmed.",
    },
  },

  program: {
    tag: { ko: "Program", en: "Program" },
    heading: { ko: "경쟁이 아니라, 함께 배우는 6일", en: "Six days to learn together, not compete" },
    intro: {
      ko: "이 빌더톤은 순위를 가리기 위한 자리가 아닙니다. 서로에게 배우고 함께 성장할 수 있도록 더 많은 세션과 만남을 준비했습니다. 오프닝 · 파운더 셰어링 · 데모데이가 중심 트랙이고, 카드를 누르면 자세한 내용을 볼 수 있습니다.",
      en: "This builderthon isn't about ranking who wins. We've prepared more sessions and connections than a usual hackathon so everyone can learn from each other and grow together. Opening · Founder Sharing · Demo Day anchor the week — tap any card for details.",
    },
    rsvpNote: {
      ko: "Day 2–5의 사이드 세션(밋업 · 디너 · AI 유즈케이스 · 멘토링 등)은 필수가 아닙니다 — 원하는 세션만 자유롭게 RSVP로 참여하세요.",
      en: "Day 2–5 side sessions (meetups · dinners · AI use cases · mentoring) are optional — just RSVP for the ones you want to join.",
    },
    legendTitle: { ko: "카테고리", en: "Legend" },
    dayLabel: { ko: "Day", en: "Day" },
    tapHint: { ko: "자세히 보기", en: "View details" },
    confirmedBadge: { ko: "지원 확정", en: "Confirmed" },
    optionalBadge: { ko: "선택 · RSVP", en: "Optional · RSVP" },
    sessions: { ko: "세션", en: "sessions" },
    swipeHint: {
      ko: "날짜를 눌러 해당 일정을 펼쳐보세요",
      en: "Tap a day to expand its sessions",
    },
  },

  traction: {
    tag: { ko: "파트너 안내", en: "For partners" },
    heading: {
      ko: "추측이 아니라 근거로 설계합니다.",
      en: "Designed on evidence, not guesses.",
    },
    intro: {
      ko: "학생 인터뷰·피드백과 18개 빌더 행사 벤치마크를 토대로 프로그램을 설계하고 있습니다. 아래는 지금까지 확인된 수요와 파트너가 얻는 가치입니다.",
      en: "We're shaping this program on student interviews and 18 benchmarked builder events. Here's the demand we've validated — and what partners get.",
    },
    stats: [
      { num: "~100", label: { ko: "목표 한인 학생 빌더", en: "Target Korean student builders" } },
      { num: "3", label: { ko: "참가 대학 (SMU · NUS · NTU)", en: "Universities (SMU · NUS · NTU)" } },
      { num: "6", label: { ko: "일간 빌더 중심 프로그램", en: "Day builder-focused program" } },
      { num: "18", label: { ko: "벤치마크한 빌더 행사", en: "Builder events benchmarked" } },
    ],
    wantTitle: { ko: "학생들이 원하는 것 (인터뷰 기반)", en: "What students told us they want" },
    wants: [
      { ko: "프로젝트 기반 인턴십", en: "Project-based internships" },
      { ko: "멘토링 · 셰어링 세션", en: "Mentoring & sharing sessions" },
      { ko: "창업가 · VC 네트워킹", en: "Founder & VC networking" },
    ],
    getTitle: { ko: "파트너가 얻는 것", en: "What partners get" },
    gets: [
      { ko: "약 100명의 한인 학생 빌더에 대한 우선 접근", en: "First access to ~100 Korean student builders" },
      { ko: "실제로 빌드하는 사람들로부터의 제품 피드백", en: "Product feedback from people who actually build" },
      { ko: "채용 · 고객 · 창업으로 이어지는 인재 파이프라인", en: "A talent pipeline into hiring, customers, and founders" },
      { ko: "지속되는 커뮤니티의 파운딩 파트너 포지션", en: "A founding-partner position in a lasting community" },
    ],
    note: {
      ko: "확정된 파트너와 논의 중인 파트너는 아래에서 구분해 안내합니다.",
      en: "Confirmed and in-discussion partners are distinguished below.",
    },
  },

  modal: {
    close: { ko: "닫기", en: "Close" },
    speaker: { ko: "연사", en: "Speaker" },
    location: { ko: "장소", en: "Location" },
    category: { ko: "카테고리", en: "Category" },
    time: { ko: "시간", en: "Time" },
    tbc: { ko: "추후 안내", en: "To be announced" },
    about: { ko: "함께하는 곳", en: "Who's behind it" },
    visit: { ko: "사이트 방문", en: "Visit site" },
    opportunities: { ko: "이런 기회가 있어요", en: "What's in it for you" },
  },

  partners: {
    tag: { ko: "Builders & Partners", en: "Builders & Partners" },
    heading: { ko: "함께 만드는 사람들", en: "Built together" },
    hostsLabel: { ko: "주최 · Hosts", en: "Hosts" },
    hostsSub: {
      ko: "Zero100 네트워크의 핵심 기업",
      en: "Core companies from the Zero100 network",
    },
    partnersLabel: { ko: "협업 논의 중 · In discussion", en: "In discussion" },
    organizerLabel: { ko: "주관 · Organizer", en: "Organizer" },
    organizerDesc: {
      ko: "SMU 한인학생회",
      en: "SMU Korean Student Association",
    },
    networkLabel: { ko: "시작점이 된 네트워크 · Founding network", en: "Founding network" },
    networkDesc: {
      ko: "이 빌더톤이 이어가는 네트워크",
      en: "The network this builderthon continues",
    },
    confirmedLabel: { ko: "지원 확정 · Confirmed support", en: "Confirmed support" },
    confirmedSub: {
      ko: "블록체인 밋업 — Alchemy GTM Lead의 지원 확정",
      en: "Blockchain Meetup — Alchemy GTM Lead support confirmed",
    },
    moreLabel: {
      ko: "그 외 파트너는 확정되는 대로 안내됩니다.",
      en: "More partners will be announced as they are confirmed.",
    },
    note: {
      ko: "Zero100 네트워크의 핵심 기업이 주최로, SMU 한인학생회(KOMOS)가 주관으로 함께합니다. 아래 AI · 클라우드 파트너와 협업을 논의 중입니다.",
      en: "Core companies from the Zero100 network host the event, with the SMU Korean Student Association (KOMOS) as organizer. We are in active discussion with the AI & cloud partners below.",
    },
    inDiscussionNote: {
      ko: "* 로고는 논의 진행 상황을 나타내며, 최종 후원·파트너십은 확정 시 안내됩니다.",
      en: "* Logos reflect ongoing discussions; final sponsorships/partnerships will be announced once confirmed.",
    },
    companionsHeading: { ko: "함께하는 빌더 파트너", en: "Builder Companions" },
    companionsSub: {
      ko: "Zero100 · KOMOS 네트워크와 함께하는 확정 파트너들",
      en: "Confirmed partners alongside the Zero100 & KOMOS network",
    },
  },

  faq: {
    tag: { ko: "FAQ", en: "FAQ" },
    heading: { ko: "자주 묻는 질문", en: "Frequently asked" },
    items: [
      {
        q: { ko: "누가 참가할 수 있나요?", en: "Who can take part?" },
        a: {
          ko: "싱가포르에 기반을 둔 한인 학생(SMU · NUS · NTU 등) 약 100명을 대상으로 합니다. ‘한인 학생을 위한 최초의 행사’라는 정체성을 유지하며, 공간 확보를 위해 로컬 학생 일부 포함이 검토될 수 있습니다.",
          en: "It's for ~100 Korean students based in Singapore (SMU · NUS · NTU and others). The founding identity — the first event made for Korean students — is preserved, though some local students may be included where it helps secure space.",
        },
      },
      {
        q: { ko: "참가비가 있나요?", en: "Is there a fee?" },
        a: {
          ko: "S$30의 환급형 보증금이 있으며, 전 일정에 참석하면 전액 환급됩니다. 무료 행사에 비해 참여 몰입도를 높이고 행사의 가치를 지키기 위한 장치입니다.",
          en: "There is a refundable S$30 deposit, fully returned to those who attend throughout. It keeps engagement and perceived value high compared to a free event.",
        },
      },
      {
        q: { ko: "코딩을 잘 못해도 괜찮나요?", en: "What if I'm not a strong coder?" },
        a: {
          ko: "네. 이 행사는 바이브코딩(Vibe Coding)과 AI 도구로 아이디어를 빠르게 프로토타입으로 만드는 데 초점을 둡니다. AI Use Case 세션과 멘토링이 준비되어 있어, 기술 장벽보다 아이디어와 실행이 더 중요합니다.",
          en: "Yes. The event centers on vibe coding and AI tools to turn ideas into prototypes fast. With AI Use Case sessions and mentoring on hand, ideas and execution matter more than raw coding skill.",
        },
      },
      {
        q: { ko: "어떤 언어로 진행되나요?", en: "What language is it in?" },
        a: {
          ko: "세션과 데모데이 피칭은 가능한 한 영어로 진행됩니다. 싱가포르에서 요구되는 글로벌 스탠다드 역량을 함께 훈련하기 위함입니다. (커뮤니티는 한국어·영어가 자연스럽게 섞입니다.)",
          en: "Sessions and Demo Day pitches run in English wherever possible, to train the global-standard capability Singapore expects. (The community itself mixes Korean and English freely.)",
        },
      },
      {
        q: { ko: "일정과 장소는 확정인가요?", en: "Are the dates and venue final?" },
        a: {
          ko: "일정은 2026년 8월 24일(월)–29일(토)로 잡혀 있으며, 세부 프로그램은 후원사·파트너 확정에 따라 일부 조정될 수 있습니다. Day 1·6은 오프라인, 중간 기간은 하이브리드로 운영되며 장소는 확정 후 안내됩니다.",
          en: "The dates are set for Mon 24 – Sat 29 Aug 2026; the detailed program may shift as sponsors and partners are confirmed. Day 1 and Day 6 run offline with a hybrid build-up in between, and the venue will be announced once confirmed.",
        },
      },
      {
        q: { ko: "더 자세한 내용은 어디서 볼 수 있나요?", en: "Where can I learn more?" },
        a: {
          ko: "이 페이지는 빌더톤 프로그램을 소개하는 정보용 페이지입니다. 6일간의 일정과 테마는 ‘프로그램’ 섹션에서 확인할 수 있으며, 장소·연사·파트너 등 세부 사항은 확정되는 대로 이 페이지에 업데이트됩니다.",
          en: "This is an informational page introducing the builderthon program. You can explore the 6-day schedule and themes in the “Program” section; details such as venue, speakers and partners will be updated here as they are confirmed.",
        },
      },
    ],
  },

  footer: {
    heading: {
      ko: "싱가포르 한인 대학생을 위한 6일간의 빌더 여정.",
      en: "A six-day builder journey for Korean university students in Singapore.",
    },
    blurb: {
      ko: "다음 세대에게 더 많은 기회와 가이드를. 일회성 행사를 넘어 싱가포르 한인 학생 빌더 커뮤니티를 함께 만들어 갑니다. 6일간의 전체 일정은 프로그램 섹션에서 확인하세요.",
      en: "More opportunity and guidance for the next generation — building a lasting community of Korean student builders in Singapore, beyond a single event. Explore the full six-day schedule in the program section.",
    },
    ctaProgram: { ko: "프로그램 보기", en: "View Program" },
    hostedBy: {
      ko: "주최 Popup Studio · Codepresso  ·  주관 SMU 한인학생회 (KOMOS)",
      en: "Hosted by Popup Studio · Codepresso  ·  Organized by SMU KSA (KOMOS)",
    },
    rights: {
      ko: "SMU × Zero100 Builderthon. All rights reserved.",
      en: "SMU × Zero100 Builderthon. All rights reserved.",
    },
  },

  toggle: {
    label: { ko: "EN", en: "한국어" }, // shows the language you'll switch TO
    aria: { ko: "Switch to English", en: "한국어로 전환" },
  },
};
