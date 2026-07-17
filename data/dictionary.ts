// ─────────────────────────────────────────────────────────────────────────────
// All STATIC UI copy lives here (event strings live in schedule.ts).
// Every string is bilingual: { ko, en }. Add new strings as { ko, en } pairs and
// read them with the t() helper in components.
//
// Source of truth for the 2026 program: the authoritative deck (Zero100_
// Builderthon_deck_수정본.pptx / _EN.pptx), with the vision graphic and media
// brief for supporting copy.
// ─────────────────────────────────────────────────────────────────────────────

export type Locale = "ko" | "en";
export type Phrase = { ko: string; en: string };

// Internal navigation only. The main site is an informational program page —
// its primary CTA is the internal #program anchor.
export const links = {
  program: "#program", // main internal CTA target
  // Builderthon sign-up target for the quiz result CTA. Placeholder for now.
  // TODO: 신청 폼 열리면 교체 (placeholder) — 당분간 program 앵커를 재사용.
  signup: "#program",
  // Organizer contact for partnership/sponsor inquiries, with a prefilled subject.
  partnership:
    "mailto:jhpark.2022@business.smu.edu.sg?subject=Zero100%20Builderthon%20Partnership%20Inquiry",
};

// Sponsor / mentor company introductions, shown in a modal when a logo tile is
// clicked (the tiles no longer link out to external sites). Keyed by the tile's
// `alt`. HONESTY RULE: only companies we can describe factually get real copy;
// everyone else falls back to `partnerIntroTBC` until their blurb is confirmed.
export const partnerIntroTBC: Phrase = {
  ko: "회사 소개는 준비 중입니다. 파트너십이 확정되는 대로 업데이트할 예정입니다.",
  en: "Company introduction coming soon — we'll update it as the partnership is confirmed.",
};

export const partnerIntros: Record<string, Phrase> = {
  AWS: {
    ko: "아마존이 운영하는 세계 최대 규모의 클라우드 컴퓨팅 플랫폼입니다. 컴퓨팅·스토리지·데이터베이스부터 생성형 AI까지 폭넓은 서비스를 제공하며, 전 세계 스타트업의 인프라 표준으로 자리잡았습니다.",
    en: "Amazon's cloud computing platform and the world's most broadly adopted cloud — spanning compute, storage, databases, and generative AI, and the default infrastructure for startups worldwide.",
  },
  OpenAI: {
    ko: "ChatGPT와 GPT 모델을 만든 AI 연구·배포 기업입니다. 안전하고 유익한 인공지능을 목표로, 개발자가 활용할 수 있는 강력한 언어·멀티모달 모델 API를 제공합니다.",
    en: "The AI research and deployment company behind ChatGPT and the GPT models, offering powerful language and multimodal model APIs for developers building with AI.",
  },
  Workato: {
    ko: "코드를 거의 쓰지 않고도 여러 앱과 데이터를 연결해 업무를 자동화하는 기업용 자동화·통합(iPaaS) 플랫폼입니다. AI 기반 워크플로 자동화로 주목받고 있습니다.",
    en: "An enterprise automation and integration (iPaaS) platform that connects apps and data to automate work with little to no code, increasingly known for its AI-driven workflow automation.",
  },
  "Superteam Singapore": {
    ko: "솔라나(Solana) 생태계를 기반으로 하는 글로벌 빌더 커뮤니티의 싱가포르 지부입니다. 창업가·개발자·크리에이터가 함께 프로젝트를 만들고 지원받는 네트워크를 운영합니다.",
    en: "The Singapore chapter of a global builder community in the Solana ecosystem, running a network where founders, developers, and creators build and get supported together.",
  },
  Hashed: {
    ko: "블록체인·웹3 분야에 투자하는 국내 대표 벤처캐피털입니다. 초기 단계 창업팀에 투자와 네트워크를 지원하며 글로벌 웹3 생태계를 연결합니다.",
    en: "A leading venture capital firm investing in blockchain and Web3, backing early-stage teams with capital and network across the global Web3 ecosystem.",
  },
};

export const dict = {
  nav: {
    about: { ko: "취지", en: "Why" },
    join: { ko: "참가 대상", en: "Who" },
    benefits: { ko: "혜택", en: "Benefits" },
    program: { ko: "프로그램", en: "Program" },
    speakers: { ko: "연사", en: "Speakers" },
    builders: { ko: "파트너", en: "Partners" },
    faq: { ko: "FAQ", en: "FAQ" },
    quiz: { ko: "성격 테스트", en: "Personality Test" },
    // Shown instead of `quiz` once a visitor has taken the test (links to their saved result).
    quizResult: { ko: "내 결과 보기", en: "View my result" },
    viewProgram: { ko: "프로그램 보기", en: "View Program" },
    register: { ko: "등록하기", en: "Register" },
    partner: { ko: "파트너십 문의", en: "Partner with us" },
    // Brand suffix beside the Zero100 wordmark in the nav.
    brandSuffix: { ko: "빌더톤", en: "Builderthon" },
  },

  // Secondary CTA on the hero/footer that sends visitors to the /quiz mini-site.
  quizCta: {
    eyebrow: { ko: "✦ AI 성격 테스트 · 환상의 궁합", en: "✦ AI test · dream teammates" },
    button: { ko: "내 AI 모델 알아보기", en: "Find your AI model" },
  },

  hero: {
    eyebrow: {
      ko: "싱가포르 최초의 한인 학생 AI 빌더톤",
      en: "Singapore's first AI builderthon for Korean students",
    },
    titleLine1: { ko: "싱가포르,", en: "Build" },
    titleLine2: { ko: "빌드의 무대", en: "in Singapore." },
    dates: { ko: "2026.08.22 – 08.29 · 8일", en: "22–29 Aug 2026 · 8 days" },
    location: { ko: "싱가포르 · *SCAPE L^IFE Jungle", en: "Singapore · *SCAPE L^IFE Jungle" },
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
      ko: "참가자의 약 60%는 바이브 코딩이 처음입니다. 그리고 그게 핵심입니다 — 크래시코스(Day 2, 코드프레소 주관)로 출발선을 맞추고, 코딩 실력이 아니라 아이디어가 한계가 되게 합니다.",
      en: "About 60% of participants are trying vibe coding for the first time — and that's the point. A crash course (Day 2, run by Codepresso) levels the start line so your ideas, not your syntax, are the limit.",
    },
    whoTitle: { ko: "이런 분께", en: "Who should join" },
    who: [
      { ko: "전공 불문 — NUS · NTU · SMU의 모든 한인 학생", en: "Any major — Korean students across NUS · NTU · SMU" },
      { ko: "코딩이 처음이어도 좋습니다 — 크래시코스와 수료증이 함께합니다", en: "First time coding is fine — a crash course and a certificate are included" },
      { ko: "입대 전·전역 후, 다시 도전하고 싶은 분", en: "Anyone wanting a fresh challenge — before enlistment or after service" },
      { ko: "실제 기업의 문제를 직접 풀어보고 싶은 분", en: "Anyone who wants to solve a real company's problem hands-on" },
    ],
    getTitle: { ko: "얻어가는 것", en: "What you get" },
    get: [
      { ko: "8일간 AI로 실제 작동하는 제품 빌드", en: "Build a real, working product in 8 days with AI" },
      { ko: "실제 기업의 AX 과제를 푼 ‘성공의 경험’", en: "A real success — solving an actual company's AX problem" },
      { ko: "크래시코스 수료증 (Day 2, 코드프레소 주관)", en: "A crash-course completion certificate (Day 2, run by Codepresso)" },
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
      ko: "Day 1 오프닝 → Day 2 크래시코스 → Day 3–4 자율 빌드·멘토링 → Day 5 오프라인 킥오프 → Day 6 오픈 빌드 → Day 7 파이널 리허설 → Day 8 데모데이로 이어집니다. Day 1이 실질적 킥오프이고, 자율 빌드는 문제 공개 직후부터 데모데이까지 상시 진행됩니다. 카드를 누르면 자세한 내용을 볼 수 있습니다.",
      en: "Day 1 opening → Day 2 crash course → Day 3–4 self-build + mentoring → Day 5 in-person kickoff → Day 6 open build → Day 7 final rehearsal → Day 8 Demo Day. Day 1 is the real kick-off, and the self-paced build runs from the Day-1 problem release to Demo Day. Tap any card for details.",
    },
    modeNote: {
      ko: "대부분 온라인으로 진행되며, Day 1(오프닝·*SCAPE)·Day 5(오프라인 킥오프)·Day 7(파이널 리허설·AWS 오피스)·Day 8(데모데이)에 전원이 현장에 모입니다.",
      en: "Mostly online — the whole cohort gathers in person on Day 1 (opening · *SCAPE), Day 5 (kickoff), Day 7 (final rehearsal · AWS office) and Day 8 (Demo Day).",
    },
    legendTitle: { ko: "카테고리", en: "Legend" },
    dayLabel: { ko: "Day", en: "Day" },
    tapHint: { ko: "자세히 보기", en: "View details" },
    confirmedBadge: { ko: "확정", en: "Confirmed" },
    mandatoryBadge: { ko: "필참", en: "Required" },
    onlineLabel: { ko: "온라인", en: "Online" },
    offlineLabel: { ko: "현장", en: "In person" },
    pendingLabel: { ko: "현장 (미정)", en: "On-site (TBC)" },
    sessions: { ko: "세션", en: "sessions" },
    swipeHint: {
      ko: "카드를 눌러 하루 일정을 펼쳐보세요",
      en: "Tap a day card to see its sessions",
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

  // ── 참가 혜택 · WHY JOIN (6 benefits) + 참여 플로우 + 인센티브 ──────────────
  benefits: {
    tag: { ko: "참가 혜택", en: "Why Join" },
    heading: { ko: "참가하면 무엇을 얻나요?", en: "What you get by joining" },
    intro: {
      ko: "참여 자체만으로 얻어가도록 설계했습니다 — 스크리닝·사전 평가 없이, 개발 경험이 없어도 누구나 환영합니다.",
      en: "Designed so you gain just by taking part — no screening or pre-assessment, and no dev experience needed.",
    },
    items: [
      {
        num: "01",
        title: { ko: "개발 경험 없어도 OK", en: "No dev experience needed" },
        points: [
          { ko: "Codex 기반 beginner-friendly 크래시 코스", en: "A Codex-based, beginner-friendly crash course" },
          { ko: "주최사 FDE의 실제 예시 라이브 빌드 → 따라 하기", en: "Live example builds by the hosts' FDEs to follow along" },
          { ko: "모델 선택·프롬프트·용어 가이드 제공", en: "Model-choice, prompt and terminology guides" },
          { ko: "0→1 첫 성공 경험 (기본기는 Day 1)", en: "Your first 0→1 success (fundamentals on Day 1)" },
        ],
      },
      {
        num: "02",
        title: { ko: "실제 기업의 진짜 문제", en: "A real company's real problem" },
        points: [
          { ko: "가상 과제가 아닌 파트너사의 실제 AX 문제 + 직원 피드백", en: "Not toy prompts — a partner's real AX problem + employee feedback" },
          { ko: "세일즈·재무 2트랙 · AWS 방법론으로 접근", en: "Sales & finance tracks · approached with AWS methodology" },
          { ko: "지원하면 무조건 진짜 문제 + 회사 인원과 만남", en: "Everyone who applies gets a real problem + meets the company" },
        ],
      },
      {
        num: "03",
        title: { ko: "‘성공 체험’", en: "A taste of success" },
        points: [
          { ko: "생각한 것이 눈앞에서 돌아가는 짜릿함", en: "The thrill of seeing your idea actually run" },
          { ko: "데모로 끝나지 않는 첫 성공 경험", en: "A first success that goes beyond a demo" },
          { ko: "군 입대 전 첫 성공 · 전역 후 재도전 동력", en: "A first win before enlistment · momentum to return after service" },
        ],
      },
      {
        num: "04",
        title: { ko: "네트워킹", en: "Networking" },
        points: [
          { ko: "대표·경력자와 Day 1·5·7·8 현장 교류", en: "In-person exchange with founders on Days 1·5·7·8" },
          { ko: "박희덕·원대로·이병일 등 연사 세션", en: "Speaker sessions with Park · Won · Lee and more" },
          { ko: "패널·공유 세션으로 technical 그 이상의 인사이트", en: "Panels & sharing sessions for more-than-technical insight" },
          { ko: "Day 5 참가자 AI 유스케이스 발표 (대표진 청중)", en: "Day 5 participant AI use-case showcase (founders in the room)" },
        ],
      },
      {
        num: "05",
        title: { ko: "수료증", en: "Certificate" },
        points: [
          { ko: "크래시 코스 참여자 전원 발급 · 8일차 이후", en: "Issued to every crash-course participant · after Day 8" },
          { ko: "포트폴리오 · 이력에 활용", en: "Use it in your portfolio and CV" },
          { ko: "발급 기관·기준 협의 중", en: "Issuing body & criteria in discussion" },
        ],
      },
      {
        num: "06",
        title: { ko: "인턴십 · 상금", en: "Internships & prizes" },
        points: [
          { ko: "우수 팀 인턴십 기회", en: "Internship opportunities for top teams" },
          { ko: "데모데이 순위별 시상 · 상금", en: "Ranked awards & prizes on Demo Day" },
          { ko: "After 파이프라인(투자·인턴)으로 연결", en: "Bridges into an After pipeline (investment · internship)" },
          { ko: "굿즈 (pen·notes) 등", en: "Goods (pens · notes) and more" },
        ],
      },
    ],
    flowTitle: { ko: "참여 플로우", en: "How it flows" },
    flow: [
      { ko: "참가 신청", en: "Apply" },
      { ko: "8일 빌더톤", en: "8-day builderthon" },
      { ko: "데모데이", en: "Demo Day" },
      { ko: "네트워크 · 경험 · 성장", en: "Network · experience · growth" },
    ],
    flowNote: {
      ko: "네트워크·경험·성장은 참가자 전원 · 시상은 데모데이 상위 팀.",
      en: "Network, experience and growth for everyone · awards for Demo Day's top teams.",
    },
    incentivesTitle: { ko: "참가자 인센티브 · 협의 진행 중", en: "Participant incentives · in discussion" },
    incentives: [
      { title: { ko: "상금 · 시상", en: "Prizes & awards" }, stage: { ko: "협의 중", en: "In discussion" }, desc: { ko: "데모데이 순위별 시상 · 상금 규모·구성 협의 중.", en: "Ranked Demo-Day awards · size & structure in discussion." } },
      { title: { ko: "크래시 코스 수료증", en: "Crash-course certificate" }, stage: { ko: "협의 중", en: "In discussion" }, desc: { ko: "참여자 전원 발급 추진 · 8일차 이후 · 발급 기관·기준 협의 중.", en: "Aiming to issue to all · after Day 8 · body & criteria in discussion." } },
      { title: { ko: "그 외 혜택", en: "Other perks" }, stage: { ko: "제공 예정", en: "Planned" }, desc: { ko: "Free Food · 굿즈(pen & notes) · 네트워킹 · 1–3인 참여 · 스크리닝 없음.", en: "Free food · goods · networking · teams of 1–3 · no screening." } },
    ],
    incentiveNote: {
      ko: "* 인센티브는 파트너사와 협의 진행 중 — 확정되는 대로 업데이트합니다.",
      en: "* Incentives are in discussion with partners — updated as they're confirmed.",
    },
  },

  // ── 연사 · 공유 세션 (Day 1·5·8) ────────────────────────────────────────────
  speakers: {
    tag: { ko: "연사 · 공유 세션", en: "Speaker sessions" },
    heading: { ko: "Day 1 · 5 · 8 — 스피커 & 공유 세션", en: "Day 1 · 5 · 8 — Speaker & sharing sessions" },
    intro: {
      ko: "이 시간을 따로 두는 이유 — Zero100의 앙트레프레너십 정체성을 지키기 위해. (연사 라인업은 확정되는 대로 안내됩니다.)",
      en: "Why we set this time aside — to protect Zero100's entrepreneurial identity. (Speaker line-up announced as confirmed.)",
    },
    people: [
      {
        day: { ko: "Day 1 · 오프닝 키노트", en: "Day 1 · Opening keynote" },
        name: { ko: "원대로", en: "Won Dae-ro" },
        role: { ko: "Managing Director, Wilt Venture Builder (SG)", en: "Managing Director, Wilt Venture Builder (SG)" },
        topic: { ko: "‘취업과 창업의 사이’", en: "“Between employment and founding”" },
        img: "/partners/logos/speaker-won.jpeg",
        points: [
          { ko: "정형화된 ‘취업 vs 창업’ 이분법에서 벗어나기", en: "Stepping past the tidy ‘employment vs. founding’ binary" },
          { ko: "벤처빌더가 본 다양한 진로·커리어 경로 탐색", en: "The many career paths a venture builder has seen" },
          { ko: "학생·비개발자도 시작할 수 있는 여러 갈래", en: "Routes even students and non-developers can start from" },
          { ko: "Q&A 포함 · 약 1시간 — ‘처음이어도 된다’ 동기부여", en: "About an hour with Q&A — a ‘first-timers welcome’ nudge" },
        ],
      },
      {
        day: { ko: "Day 5 · 오프라인 킥오프", en: "Day 5 · In-person kickoff" },
        name: { ko: "이병일", en: "Lee Byung-il" },
        role: { ko: "Venture Partner, Wilt Venture Builder (SG)", en: "Venture Partner, Wilt Venture Builder (SG)" },
        topic: { ko: "‘창업가의 멘탈관리와 회복탄력성’", en: "“Founder resilience & mental management”" },
        img: "/partners/logos/speaker-lee.jpeg",
        points: [
          { ko: "스타트업 실패·재기 스토리로 배우는 회복탄력성", en: "Resilience, learned from startup failure & comeback stories" },
          { ko: "빌드 중 좌절 대처 + 완주 동기부여", en: "Handling mid-build setbacks + the drive to finish" },
          { ko: "헤드다운 빌드 직전, 완주 동기를 다시 채우는 자리", en: "Right before the heads-down build — topping up the motivation to finish" },
          { ko: "같은 날 ‘참여자 AI Use Case’ 패널도 함께 진행", en: "Paired the same day with a ‘Participant AI Use Cases’ panel" },
        ],
      },
      {
        day: { ko: "Day 8 · 데모데이", en: "Day 8 · Demo Day" },
        name: { ko: "박희덕", en: "Park Hee-deok" },
        role: { ko: "CEO · General Partner, Translink Investment (VC)", en: "CEO · General Partner, Translink Investment (VC)" },
        topic: { ko: "‘제로백의 진짜 의미’", en: "“The Real Meaning of Zero100”" },
        img: "/partners/logos/speaker-park.jpeg",
        points: [
          { ko: "0 → 100의 핵심 — 협업 · 가치 · 실행 · 글로벌 스탠다드", en: "The core of 0 → 100 — collaboration · value · execution · global standards" },
          { ko: "협업의 힘 · 커뮤니티의 중요성", en: "The power of collaboration · why community matters" },
          { ko: "왜 지금, 왜 싱가포르의 한인 학생인가", en: "Why now, and why Korean students in Singapore" },
          { ko: "데모데이 키노트 · 약 1시간", en: "Demo-Day keynote · about an hour" },
        ],
      },
    ],
    tbcNote: {
      ko: "* 연사 라인업은 미확정이며 공개 시점·구성은 조정될 수 있습니다.",
      en: "* The speaker line-up is not yet final and may change.",
    },
  },

  // ── 멘토링 철학 ─────────────────────────────────────────────────────────────
  mentoring: {
    tag: { ko: "멘토링", en: "Mentoring" },
    heading: { ko: "멘토는 ‘학생 눈높이의 선배’", en: "Mentors are ‘peer-level seniors’" },
    intro: {
      ko: "좋은 기업이 많이 참여해도, 학생 정체성·giver 문화는 멘토 페르소나로 지킵니다.",
      en: "Even with many companies involved, we protect the student identity & giver culture through the mentor persona.",
    },
    personaLabel: { ko: "멘토 페르소나", en: "Mentor persona" },
    persona: {
      ko: "한때 우리와 같았고, 같은 고민을 하던 한국 유학생 출신 founder · startup 멤버.",
      en: "Korean ex-international-student founders / startup members — once in our shoes, with the same struggles.",
    },
    asideLabel: { ko: "AXMOS = 심사 · 문제 발의 전담", en: "AXMOS = judging & problem-setting only" },
    aside: { ko: "멘토가 아니라 ‘선배’ — 역할을 분리합니다.", en: "Not mentors — the roles are kept separate." },
    asksTitle: { ko: "멘토에게 요청하는 것", en: "What we ask of mentors" },
    asks: [
      { title: { ko: "정답 아닌 ‘눈높이’", en: "Eye-level, not the answer" }, desc: { ko: "정답보다 같은 레벨의 context를 공유 — 학생으로서 함께 ideate.", en: "Share same-level context and ideate as a student — don't hand over the answer." } },
      { title: { ko: "제품 아닌 ‘삶’까지", en: "Life, not just the product" }, desc: { ko: "먼저 같은 길을 걸어본 선배로서 제품 + 삶·커리어 멘토링.", en: "Mentor on life & career as someone who walked the path first." } },
      { title: { ko: "팀당 1시간+", en: "1+ hour per team" }, desc: { ko: "제대로 된 멘토링을 위해 팀당 최소 1시간 이상 확보.", en: "At least an hour per team for proper mentoring." } },
      { title: { ko: "연락처 공유", en: "Share contacts" }, desc: { ko: "email · LinkedIn 공유 → 행사 이후에도 팀이 후속 연락(follow-up).", en: "Share email · LinkedIn so teams can follow up after the event." } },
    ],
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
    // Partner logo → intro modal
    companyAbout: { ko: "회사 소개", en: "About" },
  },

  partners: {
    tag: { ko: "Partners", en: "Partners" },
    heading: { ko: "함께 만드는 사람들", en: "Built together" },
    note: {
      ko: "실제 AX 과제를 함께 제공하는 주최 파트너(AXMOS), SMU·NUS·NTU 한인 학생회의 주관·운영, 그리고 AI·클라우드·커뮤니티 후원사가 함께합니다. 각 파트너의 진행 단계를 솔직하게 구분해 안내합니다.",
      en: "Built with the host partners providing the real AX problems (AXMOS), organized and run by the SMU · NUS · NTU Korean student associations, and supported by AI, cloud and community sponsors. Each partner's stage is labelled honestly.",
    },
    // ── Tier 1 · 주최 · HOST (the AXMOS collective) ──────────────────────────
    hostLabel: { ko: "주최 · HOST", en: "Host" },
    hostNote: {
      ko: "AXMOS — 실제 AX 과제를 함께 제공하는 주최 파트너.",
      en: "AXMOS — the host partners providing the real AX problems.",
    },
    // ── Tier 2 · 주관 · 운영 · ORGANIZERS (student associations) ─────────────
    organizersLabel: { ko: "주관 · 운영", en: "Organizers" },
    organizersNote: {
      ko: "SMU · NUS · NTU 한인 학생회가 기획하고 운영합니다.",
      en: "Planned & run by the SMU · NUS · NTU Korean student associations.",
    },
    roleLead: { ko: "기획 · 운영", en: "Lead · Ops" },
    roleOps: { ko: "운영", en: "Ops" },
    // ── Tier 3 · 후원 · SPONSORS ─────────────────────────────────────────────
    sponsorsLabel: { ko: "후원 · SPONSORS", en: "Sponsors" },
    sponsorConfirmedLabel: { ko: "확정 · 장소 · 마케팅", en: "Confirmed · Venue · Marketing" },
    sponsorDiscussionLabel: { ko: "협의 중", en: "In discussion" },
    catTech: { ko: "기술 · Tech", en: "Tech" },
    catMarketing: { ko: "마케팅 · Marketing", en: "Marketing" },
    catCommunity: { ko: "커뮤니티 · Community", en: "Community" },
    catGoods: { ko: "굿즈 · Goods", en: "Goods" },
    catVC: { ko: "벤처 · VC", en: "VC" },
    // ── Mentors in discussion (from the deck's mentoring slide) ──────────────
    mentorsLabel: { ko: "멘토사", en: "Mentors" },
    mentorsNote: {
      ko: "학생 눈높이의 선배 멘토로 함께하는 파트너.",
      en: "Partners mentoring as peer-level seniors.",
    },
    mentorConfirmedLabel: { ko: "확정", en: "Confirmed" },
    mentorDiscussionLabel: { ko: "논의 중", en: "In discussion" },
    // Neutral stage pills shown inside the company-intro modal.
    stageConfirmed: { ko: "확정", en: "Confirmed" },
    stageDiscussion: { ko: "협의 중", en: "In discussion" },
    stageNote: {
      ko: "* 단계 표기는 2026년 6월 기준이며, 변동될 수 있습니다. 최종 후원·파트너십은 확정 시 안내됩니다.",
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
        q: { ko: "왜 8일이나 하나요? 해커톤치고 길지 않나요?", en: "Why 8 days? Isn't that long for a hackathon?" },
        a: {
          ko: "8일은 ‘가볍게 들어와 깊게 몰입하는’ 퍼널로 설계했습니다. 앞 4일(Lab 1)은 크래시코스·네트워킹 중심의 가벼운 워밍업이고, 뒤 4일(Lab 2)에서 본격적으로 빌드합니다. 현장 필참은 킥오프·데모데이 같은 핵심 순간뿐이고, 나머지는 원하는 시간·장소에서 진행하는 self-led 빌드입니다(24/7 아님). 학생 인터뷰를 거쳐 ‘너무 짧지도 길지도 않은’ 8일을 골든 넘버로 잡았습니다 — 학기 중에도 짧고 집중적으로 몰입하기 좋은 길이입니다.",
          en: "The 8 days are a funnel — come in light, then go deep. The first four days (Lab 1) are a low-pressure warm-up around the crash course and networking; the last four (Lab 2) are the real build. In-person attendance is only for the key moments like the kickoff and Demo Day — the rest is self-led build on your own time and place (not 24/7). Student interviews landed on 8 days as the sweet spot: long enough to go deep, short and focused enough to fit a busy semester.",
        },
      },
      {
        q: { ko: "테마가 뭔가요? 너무 막연해요.", en: "What's the theme? It feels vague." },
        a: {
          ko: "테마는 ‘AI’가 아니라 ‘산업’입니다. 실제 한국 기업이 지금 겪는 진짜 AX(AI 전환) 과제를 트랙별로 제공합니다. 문제는 ‘Broad problem, sharp objective’ — 목표는 뾰족하게 주되 푸는 방법은 여러분의 몫입니다. 트랙은 세일즈·재무 등으로 구체화하고 있으며, 비전공자도 감을 잡을 수 있도록 산업 맥락을 함께 제공합니다.",
          en: "The theme isn't ‘AI’ — it's industry. You'll get real AX (AI-transformation) problems Korean companies are facing right now, organized by track. The format is ‘broad problem, sharp objective’: the goal is sharp, but how you solve it is up to you. Tracks (e.g. sales and finance) are being finalized, and we give you the industry context so non-CS participants can find their footing.",
        },
      },
      {
        q: { ko: "문과인데 이과생들에게 밀리지 않을까요?", en: "I'm not from a STEM major — will I fall behind?" },
        a: {
          ko: "그 두려움을 없애는 것이 설계의 핵심입니다. 본 행사 전 바이브 코딩 크래시코스로 코딩 장벽을 미리 낮추고, 1인 참가도 허용해 부담을 줄였습니다. 오히려 산업 맥락을 잘 아는 학생이 바이브 코딩을 더 잘 살릴 수 있습니다. 그리고 우승하지 못해도 수료증·네트워킹·굿즈처럼 손에 남는 것이 반드시 있도록 설계했습니다.",
          en: "Removing that fear is the whole point of the design. A vibe-coding crash course before the event lowers the coding barrier up front, and solo entry keeps the pressure low. If anything, people who understand industry context can get more out of vibe coding — and even if you don't win, you always leave with something: a certificate, networking and goods.",
        },
      },
      {
        q: { ko: "‘해커톤’이라는 말이 부담돼요. 영어 발표도 자신 없어요.", en: "‘Hackathon’ feels intimidating, and I'm not confident presenting in English." },
        a: {
          ko: "그래서 이름부터 ‘빌더톤’으로 프레이밍해 무게를 낮췄습니다(창업 경진대회에 가까운 톤). 영어 발표 부담 때문에 영상 제출도 검토했지만, 현장 데모데이를 유지하기로 했습니다 — 비원어민 학생에게 오히려 값진 무대·발표 경험이고, 현장에서만 얻는 에너지와 기록이 크기 때문입니다.",
          en: "That's exactly why we frame it as a ‘Builderthon’ rather than a hackathon — closer in tone to a startup showcase. We considered a demo-video submission to ease the English-presentation worry, but chose to keep the in-person Demo Day: it's a genuinely valuable stage and presenting experience for non-native speakers, with energy and memories you only get on-site.",
        },
      },
      {
        q: { ko: "수료증을 주나요? 의미가 있나요?", en: "Is there a certificate? Is it worth anything?" },
        a: {
          ko: "크래시코스를 완료한 참여자 전원에게 수료증을 드리고, 링크드인에 올릴 수 있습니다. 발급 명의는 주최 기업·컨소시엄으로 붙어 무게를 더합니다. 처음 시작하는 분에게 특히 좋은 출발점이 되고, 이미 개발 경험이 있는 분에게는 수료증보다 커리큘럼·네트워킹·멘토링이 더 큰 가치가 됩니다.",
          en: "Everyone who completes the crash course gets a certificate you can post on LinkedIn, issued under the host company/consortium's name to give it weight. It's a strong starting point especially if you're new; if you already build, the curriculum, networking and mentoring will matter more to you than the certificate itself.",
        },
      },
      {
        q: { ko: "인턴십이 진짜인가요? 유급인가요?", en: "Is the internship real? Is it paid?" },
        a: {
          ko: "네, 실제 기회입니다. 상위 팀에게는 파트너 기업에서 자신이 푼 그 문제를 실무로 이어가는 유급 인턴십 기회가 열립니다. 유급인 만큼 선발은 경쟁이 있지만, 저희는 소수의 인턴십보다 ‘참여하면 누구나 얻는’ 네트워킹과 협업을 앞세웁니다. 세부 조건은 파트너와 확정되는 대로 안내합니다.",
          en: "Yes — it's a real opportunity. Top teams may be offered a paid internship with a partner company to carry the very problem they solved into real work. Because it's paid, selection is competitive — but we put the networking and collaboration everyone gains ahead of the few internships. Details will be announced as they're confirmed with partners.",
        },
      },
      {
        q: { ko: "혼자(1인) 참가해도 되나요?", en: "Can I take part solo?" },
        a: {
          ko: "됩니다 — 솔로 참가를 환영합니다. 다만 1~3인 팀을 권장합니다(4인은 지양). 혼자 자신의 기량을 보여주고 싶은 분을 위해 1인 참가를 열어두었고, 팀이 없어도 네트워킹·팀 빌딩 시간에 팀을 찾을 수 있습니다.",
          en: "Yes — solo entries are welcome. We recommend teams of 1–3 (4 is discouraged). Solo is kept open for anyone who wants to show what they can do on their own, and if you don't have a team you can find one during the networking and team-building sessions.",
        },
      },
      {
        q: { ko: "상금이나 현금 지원이 있나요?", en: "Are there prizes or cash?" },
        a: {
          ko: "있습니다. 파트너 기업들이 함께 후원하며 순위별 차등 시상을 검토 중입니다. 다만 상금·인턴을 전면에 내세우기보다 ‘참여하면 누구나 남는 게 있다’를 먼저 이야기합니다. 규모·구성은 확정되는 대로 안내합니다.",
          en: "Yes. Partner companies co-sponsor it, and tiered awards are under consideration. That said, we lead with ‘everyone who takes part gains something’ rather than putting prizes and internships front and center. Size and structure will be announced once confirmed.",
        },
      },
      {
        q: { ko: "결과물이 실제로 쓰이나요? AI로 대충 만들면 어떡하죠?", en: "Will the results actually be used? What if it's just AI slop?" },
        a: {
          ko: "이 행사의 초점은 ‘완성된 프로덕트’보다 ‘참여한 사람과 그 이후’에 있습니다. 진짜 문제 + 복수 트랙으로 결과물의 다양성을 확보하고, 시연은 실제 과제가 아닌 다른 예시로 진행해 사고를 특정 답에 가두지 않습니다. 8일 동안 진짜 문제를 붙잡고 끝까지 만들어 본 경험 자체가 핵심 성과입니다.",
          en: "The focus is less on a finished product and more on the people who take part and what they do next. Real problems plus multiple tracks keep the outputs diverse, and the walk-through uses a different example — not the actual problem — so it doesn't box your thinking into one answer. The real outcome is taking a real problem all the way through in 8 days.",
        },
      },
      {
        q: { ko: "저는 개발 경험이 있는데 크래시코스가 필요 없어요.", en: "I already code — I don't need the crash course." },
        a: {
          ko: "크래시코스는 필수가 아니라 선택입니다. 개발 경험이 있으면 건너뛰고 바로 빌드로 갈 수 있는 이원 트랙(코스 트랙 / 바로 빌드 트랙)입니다. 이미 빌드 경험이 있는 분들을 위해 OpenAI Codex 워크샵 같은 상급 트랙도 별도로 준비하고 있습니다(조율 중).",
          en: "The crash course is optional, not required. There are two tracks — take the course, or skip straight to building if you already have dev experience. For experienced builders we're also arranging an advanced track such as the OpenAI Codex workshop (in coordination).",
        },
      },
      {
        q: { ko: "제가 여기서 얻는 게 뭔가요?", en: "What do I actually get out of this?" },
        a: {
          ko: "학습 → 빌드 → 인턴십·멘토링으로 이어지는 단계형 파이프라인입니다. 커리어 탐색, 바이브 코딩 실전 학습, 그리고 현업 창업가·대표와의 네트워킹(Day 5 유스케이스 피치에서 대표진과 직접 연결)을 얻어갑니다. 싱가포르 한인 유학생에게 가장 부족한 ‘연결의 기회’를 정면으로 겨냥합니다.",
          en: "It's a staged pipeline: learn → build → internship and mentoring. You get career exploration, hands-on vibe-coding practice, and real networking with founders and executives — the Day 5 use-case pitch connects you with them directly. It squarely targets the biggest gap for Korean students in Singapore: the lack of connections.",
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
