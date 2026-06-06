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
};

export const dict = {
  nav: {
    about: { ko: "소개", en: "About" },
    program: { ko: "프로그램", en: "Program" },
    builders: { ko: "빌더 & 파트너", en: "Builders / Partners" },
    faq: { ko: "FAQ", en: "FAQ" },
    viewProgram: { ko: "프로그램 보기", en: "View Program" },
  },

  hero: {
    eyebrow: {
      ko: "싱가포르 최초 한인 학생 페스티벌형 빌더톤",
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
    ctaProgram: { ko: "프로그램 보기", en: "View Program" },
    scroll: { ko: "스크롤", en: "Scroll" },
    statParticipants: { ko: "한인 학생", en: "Korean students" },
    statDays: { ko: "일간 빌드", en: "days of building" },
    statLanguage: { ko: "영어 진행", en: "run in English" },
  },

  about: {
    tag: { ko: "About", en: "About" },
    heading: {
      ko: "왜 빌더톤인가",
      en: "Why a builderthon",
    },
    intro: {
      ko: "싱가포르에는 약 900명의 한인 유학생이 있지만, 커뮤니티는 학교별로 나뉘어 경험과 인사이트를 나누는 문화가 아직 충분히 자리 잡지 못했습니다. 먼저 길을 걸은 사람이 문을 열어 주는 — 그런 장을 만들고자 합니다.",
      en: "There are ~900 Korean students in Singapore, yet the community is split by university and a culture of sharing experience hasn't fully taken root. We want to build the place where those who walked the path first open the door.",
    },
    cards: [
      {
        kicker: { ko: "01", en: "01" },
        title: { ko: "함께 빌드 (Co-building)", en: "Co-building" },
        body: {
          ko: "학교(SMU·NUS·NTU)와 배경을 넘어 팀을 이루고, 6일간 실제로 작동하는 제품을 함께 만듭니다. 혼자가 아니라 같이.",
          en: "Form teams across universities (SMU·NUS·NTU) and backgrounds and build a real, working product together over six days — not alone, but side by side.",
        },
      },
      {
        kicker: { ko: "02", en: "02" },
        title: { ko: "글로벌 아웃바운딩", en: "Global Out-Bounding" },
        body: {
          ko: "세션과 데모데이 피칭을 가능한 한 영어로 진행해, 싱가포르에서 요구되는 글로벌 스탠다드 역량을 직접 훈련합니다.",
          en: "Sessions and Demo Day pitches run in English wherever possible, training the global-standard capability Singapore expects.",
        },
      },
      {
        kicker: { ko: "03", en: "03" },
        title: { ko: "AI-Native 빌딩", en: "AI-Native" },
        body: {
          ko: "바이브코딩과 AI 도구로 아이디어를 빠르게 프로토타입으로 전환합니다. 기술 장벽이 아니라 아이디어가 한계가 되도록.",
          en: "Turn ideas into prototypes fast with vibe coding and AI tools — so your ideas, not technical barriers, are the only limit.",
        },
      },
    ],
  },

  motivation: {
    tag: { ko: "커뮤니티를 만드는 이유", en: "Community motivation" },
    heading: {
      ko: "우리가 있었으면 했던 다리를 직접 만들고자 합니다.",
      en: "Building the bridge we wished existed.",
    },
    // Short editorial story — 3 concise paragraphs (avoid one wall of text).
    body: [
      {
        ko: "싱가포르의 한인 학생들은 충분히 뛰어나고, 글로벌하게 도전할 준비가 되어 있습니다. 다만 커뮤니티는 아직 젊습니다. 여러 세대에 걸쳐 뿌리를 내린 지역처럼 선배들의 경험과 기회, 실질적인 조언이 자연스럽게 후배들에게 이어지는 구조는 아직 충분히 자리 잡지 못했습니다.",
        en: "Many Korean students in Singapore are ambitious, capable, and globally minded — but the community is still young. Unlike places where Korean networks have grown over several generations, Singapore doesn't yet have a strong structure where experience, opportunities, and practical guidance flow naturally from seniors to juniors.",
      },
      {
        ko: "이번 빌더톤은 그 다리를 직접 만들어보려는 시도입니다. 창업가·오퍼레이터·한인 비즈니스 오너, 그리고 여러 생태계 파트너들과의 대화와 도움을 바탕으로, 학생들이 먼저 길을 걸어간 사람들을 만나고, 제품과 회사가 실제로 어떻게 만들어지는지 배우며, 혼자 도전한다는 외로움을 조금이나마 덜 수 있는 장을 만들고자 합니다.",
        en: "This Builderthon is our attempt to start building that bridge. With help and conversations across founders, operators, Korean business owners, and ecosystem partners, we want to create a space where students meet people who are a few steps ahead, learn how products and companies are actually built, and feel a little less alone while attempting something ambitious.",
      },
      {
        ko: "목표는 단순히 6일짜리 행사를 여는 것이 아닙니다. 더 큰 목표는 싱가포르 안에서 지속 가능하고 단단한 한인 학생 창업가·빌더 커뮤니티의 기반을 만드는 것 — 기회와 맥락, 그리고 용기가 다음 세대의 학생들에게 계속 이어지는 구조를 만드는 것입니다.",
        en: "The goal isn't just to run a six-day event. The bigger goal is to lay the foundation for a sustainable Korean student founder and builder community in Singapore — one that keeps passing on access, context, and courage to the next group of students.",
      },
    ],
    // Three concise belief cards.
    cards: [
      {
        title: { ko: "기회에서 가이던스로", en: "From access to guidance" },
        body: {
          ko: "학생들에게 필요한 것은 영감만이 아닙니다. 맥락을 열어주고, 시행착오를 나누며, 실제 기회로 이어지게 해줄 사람들이 필요합니다.",
          en: "Students don't only need inspiration. They need people who can open up context, share their mistakes, and point them toward real opportunities.",
        },
      },
      {
        title: { ko: "하나의 행사에서 커뮤니티로", en: "From one event to a community" },
        body: {
          ko: "빌더톤은 끝이 아니라 시작점입니다. 학생·창업가·오퍼레이터가 반복적으로 연결되는 네트워크를 만들고자 합니다.",
          en: "The Builderthon is designed as a starting point — a way to gather students, founders, and operators into a network that can repeat.",
        },
      },
      {
        title: {
          ko: "혼자 만드는 것에서 함께 만드는 것으로",
          en: "From building alone to building together",
        },
        body: {
          ko: "도전적인 학생들이 덜 외롭게, 그리고 함께 만들 수 있는 동료와 멘토를 만날 수 있게 하는 것이 목표입니다.",
          en: "The aim is to make ambitious students feel less isolated, and to help them find peers and mentors who can build alongside them.",
        },
      },
    ],
  },

  program: {
    tag: { ko: "Program", en: "Program" },
    heading: { ko: "6일간의 여정", en: "The 6-day journey" },
    intro: {
      ko: "메인 세션(오프닝 · Founder Sharing · 데모데이)은 핵심 트랙으로 유지되며, Day 2–5의 Ad-hoc 이벤트는 제안 배치로 유연하게 조정됩니다. 카드를 누르면 상세 내용을 볼 수 있습니다.",
      en: "Main sessions (Opening · Founder Sharing · Demo Day) are retained as the core track; Day 2–5 ad-hoc events are a suggested placement and can be adjusted. Tap any card for details.",
    },
    legendTitle: { ko: "카테고리", en: "Legend" },
    dayLabel: { ko: "Day", en: "Day" },
    tapHint: { ko: "자세히 보기", en: "View details" },
    confirmedBadge: { ko: "확정", en: "Confirmed" },
    swipeHint: {
      ko: "← 좌우로 스크롤하여 6일 전체 일정을 확인하세요 →",
      en: "← Scroll sideways to see all 6 days →",
    },
  },

  modal: {
    close: { ko: "닫기", en: "Close" },
    speaker: { ko: "연사", en: "Speaker" },
    location: { ko: "장소", en: "Location" },
    category: { ko: "카테고리", en: "Category" },
    time: { ko: "시간", en: "Time" },
    tbc: { ko: "추후 안내", en: "To be announced" },
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
    networkLabel: { ko: "전신 네트워크 · Founding network", en: "Founding network" },
    networkDesc: {
      ko: "이 빌더톤이 잇는 네트워크",
      en: "The network this builderthon continues",
    },
    confirmedLabel: { ko: "지원 확정 · Confirmed support", en: "Confirmed support" },
    confirmedSub: {
      ko: "Blockchain Meetup — Alchemy GTM Lead 지원 확정",
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
          ko: "환급형 보증금 S$30이 있으며, 전 일정에 참석하면 전액 환급됩니다. 무료 운영 대비 참여 몰입도와 인식 가치를 유지하기 위한 장치입니다.",
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
