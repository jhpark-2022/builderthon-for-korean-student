// ─────────────────────────────────────────────────────────────────────────────
// All STATIC UI copy lives here (event strings live in schedule.ts).
// Every string is bilingual: { ko, en }. Add new strings as { ko, en } pairs and
// read them with the t() helper in components.
//
// Source of truth for the 2026 program: the media brief (Zero100_Builderthon_
// 미디어브리프.docx), the daily-program graphic, the vision graphic and the deck.
// ─────────────────────────────────────────────────────────────────────────────

export type Locale = "ko" | "en";
export type Phrase = { ko: string; en: string };

// Internal navigation only. This is an informational program-introduction page —
// there is intentionally no application / sign-up / external form link.
export const links = {
  program: "#program", // main internal CTA target
  // Organizer contact for partnership/sponsor inquiries, with a prefilled subject.
  partnership:
    "mailto:jhpark.2022@business.smu.edu.sg?subject=Zero100%20Builderthon%20Partnership%20Inquiry",
};

export const dict = {
  nav: {
    about: { ko: "취지", en: "Why" },
    join: { ko: "참가 대상", en: "Who" },
    program: { ko: "프로그램", en: "Program" },
    builders: { ko: "파트너", en: "Partners" },
    faq: { ko: "FAQ", en: "FAQ" },
    quiz: { ko: "성격 테스트", en: "Personality Test" },
    viewProgram: { ko: "프로그램 보기", en: "View Program" },
    register: { ko: "등록하기", en: "Register" },
    partner: { ko: "파트너십 문의", en: "Partner with us" },
  },

  // Secondary CTA on the hero/footer that sends visitors to the /quiz mini-site.
  quizCta: {
    eyebrow: { ko: "✦ AI 성격 테스트 · 세션 추천", en: "✦ AI test · session picks" },
    button: { ko: "내 AI 모델 알아보기", en: "Find your AI model" },
  },

  hero: {
    eyebrow: {
      ko: "싱가포르 최초의 한인 학생 AI 빌더톤",
      en: "Singapore's first AI builderthon for Korean students",
    },
    titleLine1: { ko: "여기서", en: "Build" },
    titleLine2: { ko: "빌드하라.", en: "in Singapore." },
    dates: { ko: "2026.08.22 – 08.29 · 8일", en: "22–29 Aug 2026 · 8 days" },
    location: { ko: "싱가포르 · *SCAPE Lifejungle", en: "Singapore · *SCAPE Lifejungle" },
    blurb: {
      ko: "싱가포르에서 공부하는 한국 학생 약 100명이 8일간, 실제 기업의 AI 전환(AX) 과제를 바이브 코딩으로 직접 풀어내는 AI 빌더톤. zero에서 MVP까지 — 데모로 끝나지 않는 ‘성공의 경험’을 남깁니다.",
      en: "Around 100 Korean students in Singapore spend 8 days solving real companies' AI-transformation (AX) problems with vibe coding. From zero to MVP — a real success that goes beyond a demo.",
    },
    ctaProgram: { ko: "8일의 여정 둘러보기", en: "Explore the 8-day journey" },
    ctaPartner: { ko: "파트너십 문의", en: "Partner with us" },
    scroll: { ko: "스크롤", en: "Scroll" },
    statParticipants: { ko: "한인 학생", en: "Korean students" },
    statDays: { ko: "일간의 빌드", en: "days of building" },
    statLanguage: { ko: "실전 AX 과제", en: "real AX problems" },

    // ── Countdown ↔ Problem Statement 전환 탭 ──────────────────────────
    // 행사 시작(8/22) 전: 실시간 D-day 카운트다운.
    // 행사 시작 후: 같은 자리에서 Problem Statement 로 전환.
    // (실제 카피/문제 내용은 확정되면 교체 — 지금은 레이아웃 확인용 플레이스홀더)
    countdownTabLabel: { ko: "카운트다운", en: "Countdown" },
    problemTabLabel: { ko: "Problem Statement", en: "Problem Statement" },

    countdownEyebrow: { ko: "빌더톤 시작까지", en: "Until the builderthon begins" },
    countdownLive: { ko: "실시간", en: "Live" },
    countdownUnitDays: { ko: "일", en: "days" },
    countdownUnitHours: { ko: "시", en: "hrs" },
    countdownUnitMinutes: { ko: "분", en: "min" },
    countdownUnitSeconds: { ko: "초", en: "sec" },
    // 카운트다운이 끝난 뒤(이미 시작한 시점) 노출되는 문구.
    countdownStarted: { ko: "빌더톤이 시작되었습니다.", en: "The builderthon has begun." },

    problemEyebrow: { ko: "이번 라운드의 과제", en: "This round's challenge" },
    // TODO: confirm — 실제 문제가 확정되면 교체할 플레이스홀더.
    problemHeading: {
      ko: "실제 기업의 AX 과제가 여기서 공개됩니다.",
      en: "Real companies' AX problems are revealed here.",
    },
    problemBody: {
      ko: "행사가 시작되면 이 자리에서 팀이 8일간 풀어낼 실제 AI 전환(AX) 과제가 공개됩니다. 문제 정의, 제약 조건, 평가 기준이 함께 안내될 예정입니다.",
      en: "When the event begins, the real AI-transformation (AX) problems your team will solve over 8 days appear here — with the problem definition, constraints, and evaluation criteria.",
    },
    problemPlaceholderBadge: { ko: "공개 예정", en: "Coming soon" },
  },

  about: {
    tag: { ko: "취지", en: "Why this exists" },
    heading: {
      ko: "우리가 있었으면 했던 다리를 직접 만듭니다.",
      en: "Building the bridge we wished existed.",
    },
    intro: {
      ko: "싱가포르의 한인 학생은 1,000명을 넘어섰지만, 이들을 대표하는 학생 단체는 사실상 없습니다. 우리는 누군가 조금 더 일찍 열어줬으면 했던 그 문을, 이번 빌더톤으로 직접 만들고자 합니다.",
      en: "There are now over 1,000 Korean students in Singapore — yet effectively no body that represents them. We're building the door we wished someone had opened for us, starting with this builderthon.",
    },
    // The problem, in numbers — from the deck's CONTEXT slide. Sourced, not invented.
    gapTag: { ko: "지금의 현실", en: "The gap today" },
    gap: [
      {
        num: "1,000+",
        label: {
          ko: "싱가포르의 한인 유학생 (추정) — NUS · NTU · SMU에 흩어진",
          en: "Korean students in Singapore (est.) — scattered across NUS · NTU · SMU",
        },
      },
      {
        num: "0",
        label: {
          ko: "이들을 대표하는 학생 단체 — 친목 위주의 행사뿐",
          en: "bodies representing them — only social-first events exist",
        },
      },
      {
        num: "2년",
        label: {
          ko: "군 복무로 끊기는 동기부여와 커뮤니티의 연속성",
          en: "of motivation and community continuity, cut by military service",
        },
      },
    ],
    gapNote: {
      ko: "진로·교육의 장은 부재하고, 선배가 후배를 끌어주는 멘토십도 약합니다. ‘4–6년 잠깐 있다 가는 사람’으로 여겨져 목소리를 내기 어려웠던 1,000명에게, 이번 빌더톤은 그 공백을 잇는 첫 시도입니다.",
      en: "There's no real space for careers or learning, and little senior-to-junior mentorship. Seen as people who pass through for 4–6 years and leave, these 1,000 students have had no voice — this builderthon is the first attempt to bridge that gap.",
    },
    shiftTag: { ko: "그래서 우리가 만드는 변화", en: "The shift we're building" },
    cards: [
      {
        kicker: { ko: "01", en: "01" },
        title: { ko: "가상이 아니라 실전", en: "Real problems, not toy ones" },
        body: {
          ko: "파트너 기업이 지금 겪는 실제 AX 과제를 바이브 코딩으로 풉니다. 데모로 끝나지 않는, ‘해냈다’는 성공의 경험을 남깁니다.",
          en: "Teams solve the actual AX problems partner companies face right now — leaving a real sense of “we did it,” not just a demo.",
        },
      },
      {
        kicker: { ko: "02", en: "02" },
        title: { ko: "하나의 행사에서 커뮤니티로", en: "From one event to a community" },
        body: {
          ko: "빌더톤은 끝이 아니라 ‘깔때기의 입구’입니다. 학생·창업가·빌더가 반복적으로 연결되는 지속 가능한 커뮤니티로 키워갑니다.",
          en: "The builderthon isn't an end but the mouth of a funnel — growing into a durable community where students, founders and builders keep connecting.",
        },
      },
      {
        kicker: { ko: "03", en: "03" },
        title: { ko: "혼자가 아니라 함께", en: "From building alone to together" },
        body: {
          ko: "입대 전 첫 성공 경험을 심고, 전역 후 다시 잇습니다. 도전적인 학생들이 덜 외롭게, 함께 만들 동료와 멘토를 만납니다.",
          en: "A first success before enlistment, picked back up after service — so ambitious students feel less alone and find peers and mentors to build with.",
        },
      },
    ],
    // The vision funnel — straight from the vision graphic. The event is a
    // starting point, not an end; it feeds a lasting cross-border community.
    visionTag: { ko: "비전", en: "Vision" },
    visionHeading: {
      ko: "이벤트는 끝이 아니라, 모든 것의 ‘초입’입니다.",
      en: "The event isn't the end — it's the entry point to everything.",
    },
    visionIntro: {
      ko: "Zero100 Builderthon → 지속가능한 한–싱 빌더 커뮤니티로 이어지는 ‘깔때기의 입구’. 한 번의 행사가 아니라 5년·10년 이어질 구조입니다.",
      en: "Zero100 Builderthon → the entry point to a lasting Korea–Singapore builder community. Not a one-off event but a structure meant to last 5 or 10 years.",
    },
    visionSteps: [
      {
        num: "1",
        title: { ko: "Zero100 빌더톤", en: "Zero100 Builderthon" },
        body: { ko: "모든 것의 시작점", en: "Where it all starts" },
      },
      {
        num: "2",
        title: { ko: "코어 커뮤니티", en: "Core community" },
        body: { ko: "작게라도 시작 — 단톡방에서 코어 멤버로", en: "Start small — a group chat to core members" },
      },
      {
        num: "3",
        title: { ko: "싱가포르 한인 빌더", en: "SG Korean builders" },
        body: { ko: "학생·빌더 지속 활동 기반 (1차 목표)", en: "A standing base for students & builders (1st goal)" },
      },
      {
        num: "4",
        title: { ko: "한–싱 Cross-border", en: "Korea–SG cross-border" },
        body: { ko: "한국 기업과 연결 · 5~10년 자생 구조", en: "Linked to Korean companies · self-sustaining over 5–10 yrs" },
      },
      {
        num: "5",
        title: { ko: "글로벌 확산", en: "Global expansion" },
        body: { ko: "싱가포르를 넘어 전 세계 한인 커뮤니티로", en: "Beyond Singapore to Korean communities worldwide" },
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
      ko: "참가자의 약 60%는 바이브 코딩이 처음입니다. 그리고 그게 핵심입니다 — 입문 워크숍(101·102)으로 출발선을 맞추고, 코딩 실력이 아니라 아이디어가 한계가 되게 합니다.",
      en: "About 60% of participants are trying vibe coding for the first time — and that's the point. Intro workshops (101 · 102) level the start line so your ideas, not your syntax, are the limit.",
    },
    whoTitle: { ko: "이런 분께", en: "Who should join" },
    who: [
      { ko: "전공 불문 — NUS · NTU · SMU의 모든 한인 학생", en: "Any major — Korean students across NUS · NTU · SMU" },
      { ko: "코딩이 처음이어도 좋습니다 — 입문 워크숍과 수료증이 함께합니다", en: "First time coding is fine — intro workshops and a certificate are included" },
      { ko: "입대 전·전역 후, 다시 도전하고 싶은 분", en: "Anyone wanting a fresh challenge — before enlistment or after service" },
      { ko: "실제 기업의 문제를 직접 풀어보고 싶은 분", en: "Anyone who wants to solve a real company's problem hands-on" },
    ],
    getTitle: { ko: "얻어가는 것", en: "What you get" },
    get: [
      { ko: "8일간 AI로 실제 작동하는 제품 빌드", en: "Build a real, working product in 8 days with AI" },
      { ko: "실제 기업의 AX 과제를 푼 ‘성공의 경험’", en: "A real success — solving an actual company's AX problem" },
      { ko: "바이브 코딩 입문 수료증 (코드프레소 주관)", en: "A Vibe Coding completion certificate (run by Codepresso)" },
      { ko: "창업가 · 빌더 · 멘토와의 실질적 네트워킹", en: "Genuine networking with founders, builders & mentors" },
      { ko: "지속되는 한–싱 빌더 커뮤니티의 시작 멤버", en: "Founding membership in a lasting Korea–SG builder community" },
    ],
    disclaimer: {
      ko: "* 일부 혜택(인센티브·멘토 라인업 등)은 파트너와 논의 중이며 확정 시 안내됩니다.",
      en: "* Some benefits (incentives, mentor line-up) are under discussion with partners and will be confirmed.",
    },
  },

  program: {
    tag: { ko: "Program", en: "Program" },
    heading: { ko: "8일, zero에서 MVP까지", en: "8 days, from zero to MVP" },
    intro: {
      ko: "사전 2일(문제 공개) → 입문 2일(바이브 코딩) → 빌더톤 4일로 이어집니다. Day 1이 실질적 킥오프이고, 자율 빌드는 그 직후부터 데모데이까지 상시 진행됩니다. 카드를 누르면 자세한 내용을 볼 수 있습니다.",
      en: "Pre 2 days (problem release) → Intro 2 days (vibe coding) → Builderthon 4 days. Day 1 is the real kick-off, with self-paced build running from then to Demo Day. Tap any card for details.",
    },
    modeNote: {
      ko: "대부분 온라인으로 진행되며, Day 5(중간 점검)와 Day 8(데모데이)에만 *SCAPE Lifejungle 현장에 전원이 모입니다.",
      en: "Mostly online — the whole cohort only gathers in person at *SCAPE Lifejungle on Day 5 (check-in) and Day 8 (Demo Day).",
    },
    legendTitle: { ko: "카테고리", en: "Legend" },
    dayLabel: { ko: "Day", en: "Day" },
    tapHint: { ko: "자세히 보기", en: "View details" },
    confirmedBadge: { ko: "확정", en: "Confirmed" },
    onlineLabel: { ko: "온라인", en: "Online" },
    offlineLabel: { ko: "현장", en: "In person" },
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
      ko: "학생 인터뷰·피드백과 빌더 행사 벤치마크를 토대로 프로그램을 설계하고 있습니다. 아래는 지금까지 확인된 수요와 파트너가 얻는 가치입니다.",
      en: "We're shaping this program on student interviews and benchmarked builder events. Here's the demand we've validated — and what partners get.",
    },
    stats: [
      { num: "~100", label: { ko: "목표 한인 학생 빌더", en: "Target Korean student builders" } },
      { num: "3", label: { ko: "참가 대학 (NUS · NTU · SMU)", en: "Universities (NUS · NTU · SMU)" } },
      { num: "8", label: { ko: "일간 AI 빌더톤", en: "Day AI builderthon" } },
      { num: "60%", label: { ko: "바이브 코딩 첫 시도 참가자", en: "First-time vibe coders" } },
    ],
    wantTitle: { ko: "학생들이 원하는 것 (인터뷰 기반)", en: "What students told us they want" },
    wants: [
      { ko: "실제 기업의 문제로 만드는 성공 경험", en: "A real success on an actual company's problem" },
      { ko: "멘토링 · 셰어링 세션", en: "Mentoring & sharing sessions" },
      { ko: "창업가 · 빌더 네트워킹", en: "Founder & builder networking" },
    ],
    getTitle: { ko: "파트너가 얻는 것", en: "What partners get" },
    gets: [
      { ko: "약 100명의 한인 학생 빌더에 대한 우선 접근", en: "First access to ~100 Korean student builders" },
      { ko: "실제 AX 과제를 학생이 직접 푸는 결과물·피드백", en: "Solutions & feedback as students tackle a real AX problem" },
      { ko: "채용 · 고객 · 창업으로 이어지는 인재 파이프라인", en: "A talent pipeline into hiring, customers, and founders" },
      { ko: "지속되는 한–싱 커뮤니티의 파운딩 파트너 포지션", en: "A founding-partner position in a lasting Korea–SG community" },
    ],
    note: {
      ko: "확정·진행 단계별 파트너는 아래에서 구분해 안내합니다.",
      en: "Partners are distinguished by stage (confirmed / in talks) below.",
    },
  },

  modal: {
    close: { ko: "닫기", en: "Close" },
    speaker: { ko: "연사", en: "Speaker" },
    location: { ko: "장소", en: "Location" },
    category: { ko: "카테고리", en: "Category" },
    time: { ko: "시간", en: "Time" },
    mode: { ko: "진행 방식", en: "Format" },
    tbc: { ko: "추후 안내", en: "To be announced" },
    about: { ko: "함께하는 곳", en: "Who's behind it" },
    visit: { ko: "사이트 방문", en: "Visit site" },
    opportunities: { ko: "이런 기회가 있어요", en: "What's in it for you" },
  },

  partners: {
    tag: { ko: "Partners", en: "Partners" },
    heading: { ko: "함께 만드는 사람들", en: "Built together" },
    note: {
      ko: "한인 학생회(SMU·NUS·NTU)와 Zero100 빌더 네트워크가 함께 만들고, 실제 AX 과제를 제공하는 기업과 AI·클라우드 파트너가 함께합니다. 각 파트너의 진행 단계를 솔직하게 구분해 안내합니다.",
      en: "Built by the Korean student associations (SMU·NUS·NTU) and the Zero100 builder network, with the companies providing real AX problems and the AI & cloud partners alongside. Each partner's stage is labelled honestly.",
    },
    organizerLabel: { ko: "주관 · Organizers", en: "Organizers" },
    organizerDesc: {
      ko: "SMU · NUS · NTU 한인 학생회",
      en: "SMU · NUS · NTU Korean Student Associations",
    },
    networkLabel: { ko: "시작점이 된 네트워크 · Founding network", en: "Founding network" },
    networkDesc: {
      ko: "이 빌더톤이 이어가는 빌더 네트워크",
      en: "The builder network this builderthon continues",
    },
    // Companies supplying the real AX problems (confirmed per the media brief).
    providersLabel: { ko: "문제 제공 · 확정", en: "Problem providers · Confirmed" },
    providersNote: {
      ko: "실제 AX 과제를 제공하는 파트너사 (확정).",
      en: "Partner companies supplying the real AX problems (confirmed).",
    },
    // Three honest tiers for sponsors / partners.
    tierConfirmedLabel: { ko: "확정 · Confirmed", en: "Confirmed" },
    tierAdvancedLabel: { ko: "협의 완료 · 미팅 진행", en: "In advanced talks" },
    tierDiscussionLabel: { ko: "논의 중 · In discussion", en: "In discussion" },
    tierAdvancedNote: {
      ko: "* 미팅을 마치고 구체적 협업을 조율 중인 단계입니다.",
      en: "* Meetings done; specific collaboration being arranged.",
    },
    inDiscussionNote: {
      ko: "* 위 단계 표기는 2026년 6월 기준이며, 변동될 수 있습니다. 최종 후원·파트너십은 확정 시 안내됩니다.",
      en: "* Stages are as of June 2026 and may change; final sponsorships/partnerships will be announced once confirmed.",
    },
    companionsHeading: { ko: "함께하는 빌더 네트워크", en: "Builder network" },
    companionsSub: {
      ko: "이 빌더톤의 시작점이 된 Zero100 빌더 네트워크",
      en: "The Zero100 builder network this builderthon grew from",
    },
  },

  faq: {
    tag: { ko: "FAQ", en: "FAQ" },
    heading: { ko: "자주 묻는 질문", en: "Frequently asked" },
    items: [
      {
        q: { ko: "누가 참가할 수 있나요?", en: "Who can take part?" },
        a: {
          ko: "싱가포르에 기반을 둔 한인 학생(NUS · NTU · SMU 등) 약 100명을 대상으로 합니다. ‘한인 학생을 위한 최초의 AI 빌더톤’이라는 정체성을 유지합니다.",
          en: "It's for ~100 Korean students based in Singapore (NUS · NTU · SMU and others), keeping its founding identity: the first AI builderthon made for Korean students.",
        },
      },
      {
        q: { ko: "코딩을 잘 못해도 괜찮나요?", en: "What if I'm not a strong coder?" },
        a: {
          ko: "네. 참가자의 약 60%가 바이브 코딩이 처음입니다. 입문 워크숍(바이브 코딩 101·102, 코드프레소 주관)과 멘토링이 준비되어 있어, 기술 실력보다 아이디어와 실행이 더 중요합니다. 입문 과정을 마치면 수료증도 발급됩니다.",
          en: "Yes. About 60% of participants are first-time vibe coders. With intro workshops (Vibe Coding 101 · 102, run by Codepresso) and mentoring, ideas and execution matter more than raw skill — and you earn a certificate for completing the track.",
        },
      },
      {
        q: { ko: "무엇을 만드나요?", en: "What do we build?" },
        a: {
          ko: "가상의 과제가 아니라, 파트너 기업이 지금 겪고 있는 실제 AX(AI 전환) 문제를 바이브 코딩으로 풉니다. Day 1에 과제가 공개되고, 팀별로 8일간 빌드해 데모데이에 발표합니다. (과제 제공: Drimaes · Codepresso · Popup Studio 확정, Workato 논의 중.)",
          en: "Not made-up prompts — you solve real AX (AI-transformation) problems partner companies face right now, with vibe coding. Problems drop on Day 1; teams build over 8 days and present on Demo Day. (Problems from Drimaes · Codepresso · Popup Studio confirmed, Workato in discussion.)",
        },
      },
      {
        q: { ko: "온라인인가요, 오프라인인가요?", en: "Is it online or in person?" },
        a: {
          ko: "대부분 온라인으로 진행되며, 전원이 현장에 모이는 날은 Day 5(중간 점검)와 Day 8(데모데이) 두 번입니다. 현장은 싱가포르 *SCAPE Lifejungle(100명+ 수용 확보)입니다. 자율 빌드는 Day 1부터 온라인으로 상시 진행됩니다.",
          en: "Mostly online. The whole cohort gathers in person twice — Day 5 (check-in) and Day 8 (Demo Day) — at *SCAPE Lifejungle, Singapore (100+ capacity secured). Self-paced build runs online from Day 1.",
        },
      },
      {
        q: { ko: "일정과 장소는 확정인가요?", en: "Are the dates and venue final?" },
        a: {
          ko: "일정은 2026년 8월 22일(토)–29일(토), 8일입니다. 장소는 *SCAPE Lifejungle(싱가포르)로, Day 5·Day 8 현장 집결을 위해 확보되어 있습니다. 세부 프로그램·연사·멘토는 후원사·파트너 확정에 따라 일부 조정될 수 있습니다.",
          en: "The dates are Sat 22 – Sat 29 Aug 2026, 8 days. The venue is *SCAPE Lifejungle (Singapore), secured for the Day 5 and Day 8 gatherings. Detailed program, speakers and mentors may shift as sponsors and partners are confirmed.",
        },
      },
      {
        q: { ko: "더 자세한 내용은 어디서 볼 수 있나요?", en: "Where can I learn more?" },
        a: {
          ko: "이 페이지는 빌더톤 프로그램을 소개하는 정보용 페이지입니다. 8일간의 일정과 테마는 ‘프로그램’ 섹션에서 확인할 수 있으며, 연사·멘토·파트너 등 세부 사항은 확정되는 대로 이 페이지에 업데이트됩니다.",
          en: "This is an informational page introducing the builderthon. You can explore the 8-day schedule and themes in the “Program” section; details such as speakers, mentors and partners will be updated here as they're confirmed.",
        },
      },
    ],
  },

  footer: {
    heading: {
      ko: "싱가포르 한인 학생을 위한 8일간의 AI 빌더 여정.",
      en: "An 8-day AI builder journey for Korean students in Singapore.",
    },
    blurb: {
      ko: "이벤트는 끝이 아니라 ‘초입’입니다. 일회성 행사를 넘어, 지속가능한 한–싱 빌더 커뮤니티를 함께 만들어 갑니다. 8일간의 전체 일정은 프로그램 섹션에서 확인하세요.",
      en: "The event isn't an end but an entry point. Beyond a single event, we're building a lasting Korea–Singapore builder community. Explore the full 8-day schedule in the program section.",
    },
    ctaProgram: { ko: "프로그램 보기", en: "View Program" },
    hostedBy: {
      ko: "주관 SMU · NUS · NTU 한인 학생회  ·  Zero100 빌더 네트워크",
      en: "Organized by the SMU · NUS · NTU Korean Student Associations  ·  Zero100 builder network",
    },
    rights: {
      ko: "Zero100 Builderthon. All rights reserved.",
      en: "Zero100 Builderthon. All rights reserved.",
    },
  },

  toggle: {
    label: { ko: "EN", en: "한국어" }, // shows the language you'll switch TO
    aria: { ko: "Switch to English", en: "한국어로 전환" },
  },
};
