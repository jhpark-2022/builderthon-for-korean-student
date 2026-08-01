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
  // Deliberately a personal address rather than the school one: partner threads
  // outlive the .edu account.
  partnership:
    "mailto:pjh030924@gmail.com?subject=Zero100%20AI%20Builderthon%20Partnership%20Inquiry",
  // Where an already-registered visitor goes to change or cancel their entry.
  // There is no self-serve edit: registrations are written once by /api/register
  // and the browser keeps no registration id, so nothing can identify "your" row
  // to a later request. Organizers edit by hand instead.
  registerEdit:
    "mailto:pjh030924@gmail.com?subject=Zero100%20AI%20Builderthon%20%EB%93%B1%EB%A1%9D%20%EC%A0%95%EB%B3%B4%20%EC%88%98%EC%A0%95%20%EC%9A%94%EC%B2%AD",
  // Public builderthon group chat — KakaoTalk 오픈채팅 "싱가폴 한인 학생 AI 빌더톤".
  // This is the open room anyone can join to ask a question; the participant
  // room registrants are invited to is a separate, private one.
  openChat: "https://open.kakao.com/o/g6msvcFi",
};

// Registration submit target — our own route handler, which validates the
// payload server-side and writes it to Supabase (see app/api/register/route.ts
// and supabase/migrations/0001_registrations.sql).
//
// Set this to "" to go back to the offline simulation: the modal then fakes a
// ~1s submit and logs the payload to console.info instead of POSTing.
export const REGISTER_ENDPOINT = "/api/register";

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
    ko: "블록체인·웹3 분야에 투자하는 대표적 벤처캐피털로, 스테이블코인·RWA·AI 인프라 등에 투자합니다. 2026년에는 AI 코딩 시대의 창업을 지원하는 액셀러레이터 ‘해시드 바이브 랩스’를 새로 열었습니다 — 이 행사가 다루는 바이브 코딩의 최전선에 있는 하우스입니다.",
    en: "A leading blockchain and Web3 venture capital firm, investing across stablecoins, RWA and AI infrastructure. In 2026 it launched Hashed Vibe Labs, an accelerator for the AI-coding era of company building — the very frontier this builderthon plays on.",
  },

  // ── 주최 · HOST ────────────────────────────────────────────────────────────
  AXMOS: {
    ko: "AXMOS는 Translink Investment · Wilt Venture Builder · Codepresso · Popup Studio · DRIMAES 5개 사가 결성한 AX(AI 전환) 컨소시엄입니다. 이번 빌더톤의 실제 기업 과제 발의·멘토링·심사를 함께 담당합니다.",
    en: "AXMOS is an AX (AI-transformation) consortium formed by Translink Investment, Wilt Venture Builder, Codepresso, Popup Studio and DRIMAES — jointly providing this builderthon's real company problems, mentoring and judging.",
  },
  "Translink Investment": {
    ko: "실리콘밸리 트랜스링크캐피탈과 합작해 2016년 출범한 벤처캐피탈로, SaaS·딥테크 중심으로 7개 조합·누적 약 1,900억 원 규모를 운용합니다. 마켓컬리 초기 투자사로 알려져 있으며, 포트폴리오사의 글로벌 진출 지원이 강점입니다. 데모데이 키노트를 맡은 박희덕 대표님이 이끄는 하우스입니다.",
    en: "A venture capital firm launched in 2016 with Silicon Valley's TransLink Capital, running seven funds (~KRW 190B) focused on SaaS and deep tech. An early investor in Market Kurly, known for helping portfolios expand globally — led by Hee-Duk Park, our Demo Day keynote speaker.",
  },
  "Wilt Venture Builder": {
    ko: "싱가포르에 본사를 둔 한–싱 크로스보더 벤처빌더로, 초기 아이디어부터 시리즈 A까지 창업자와 ‘공동 창업’ 방식으로 회사를 함께 만듭니다. AI·콘텐츠·F&B·B2B SaaS 영역에서 한국 브랜드의 동남아 진출을 빌드해 왔으며, 이 빌더톤을 만든 Zero100 프로그램의 모조직입니다.",
    en: "A Korea–Singapore cross-border venture builder headquartered in Singapore, co-founding companies with founders from first idea to Series A across AI, content, F&B and B2B SaaS. The parent organization of Zero100 — the program behind this builderthon.",
  },
  // The last sentence lists every role Codepresso plays here, and 문제 제공 comes
  // first because that is the one a participant actually meets — one of the AX
  // problems teams pick on Day 1 is theirs. Crash Course and mentoring follow.
  // If any of the three changes, dict.mentoring.mentors (김지훈 · 이동훈 · 황현진)
  // and schedule.ts d2-crash-course are the other places that name them.
  Codepresso: {
    ko: "‘AI 리터러시의 표준화’를 내건 AI 역량 평가·교육 기업입니다. 채용용 AI 역량 평가(SkillCertify)와 비개발자 대상 AI 활용 교육(AI Fluent)을 운영하며, 현대오토에버·현대모비스 등 대기업 프로그램을 진행해 왔습니다. 이번 빌더톤에서는 실제 기업 과제를 내는 문제 제공사이자 Day 2 크래시코스를 주관하고, Day 7 커리어 세션 멘토링에도 함께합니다.",
    en: "An AI competency assessment & education company working to standardize AI literacy — running skill assessments (SkillCertify) and AI-fluency training (AI Fluent) used by companies like Hyundai AutoEver and Hyundai Mobis. Here it sets one of the real company problems, runs the Day-2 Crash Course, and mentors at the Day 7 career session.",
  },
  Drimaes: {
    ko: "SDV(소프트웨어 정의 차량)·차량용 인포테인먼트(IVI)를 만드는 모빌리티 소프트웨어 기업입니다. 독자 리눅스 기반 OS와 가상화 기술로 차량의 여러 화면을 하나의 칩으로 통합하며, CES에서 퀄컴·텔레칩스와의 협업을 선보였고 2025년 국가 SW R&D 우수성과에 선정됐습니다.",
    en: "A mobility-software company building SDV and in-vehicle infotainment tech — its own Linux-based OS and virtualization stack runs multiple car displays on a single chip. Showcased Qualcomm and Telechips collaborations at CES, and named a national SW R&D standout in 2025.",
  },
  "Popup Studio": {
    ko: "싱가포르 본사와 한국 개발 허브를 둔 AI 전환(AX) 기업으로, FDE(Forward-Deployed Engineer)가 현장에 직접 들어가 작동하는 AI를 팀 안에 이식하는 방식으로 일합니다. 대화만으로 백엔드를 만드는 Bkend와 빌더 커뮤니티 bkamp도 운영합니다 — 이 행사가 다루는 ‘바이브 코딩’을 실제 사업으로 하는 회사입니다.",
    en: "An AI-transformation (AX) company with its HQ in Singapore and a dev hub in Korea — forward-deployed engineers embed working AI directly inside client teams. Also builds Bkend, a conversational backend-as-a-service, and the builder community bkamp. Vibe coding, as an actual business.",
  },

  // ── 후원 · SPONSORS ────────────────────────────────────────────────────────
  "INNOVATE 360": {
    ko: "싱가포르 최초의 푸드테크 액셀러레이터로, 공유 R&D 랩·인증 주방·생산 공간 등 약 20만 sq ft의 시설과 VC 펀드를 함께 운영하며 230개 이상의 스타트업을 지원해 왔습니다. Enterprise Singapore StartupSG 공인 멘토 파트너이며, 이번 행사에는 장소로 함께합니다.",
    en: "Singapore's first food-tech accelerator, running ~200,000 sq ft of facilities — shared R&D labs, certified kitchens, production space — alongside a VC fund, with 230+ startups supported. An accredited StartupSG mentor partner, joining this event as a venue sponsor.",
  },
  "L^IFE": {
    ko: "*SCAPE 오차드에 자리한 2층 규모의 체험형 리테일·이벤트 공간으로, Innovate 360가 운영합니다. 싱가포르 신진 브랜드들이 입점한 리테일 층과 크리에이터·라이브커머스 스튜디오, 정기 커뮤니티 프로그램이 함께 돌아갑니다. 빌더톤의 현장 일정이 열리는 L^ife Jungle이 바로 이곳입니다.",
    en: "A two-storey experiential retail & event space at *SCAPE Orchard, run by Innovate 360 — a floor of emerging Singapore brands plus creator and live-commerce studios with regular community programming. This is L^ife Jungle, home of the builderthon's on-site days.",
  },
  BZCF: {
    ko: "구독자 32만의 유튜브 채널을 중심으로 한 비즈니스·창업 콘텐츠 미디어입니다. 창업가 인터뷰와 산업 분석 콘텐츠를 만들고 창업가 커뮤니티 ‘BZCF Fellowship’을 운영하며, 이번 빌더톤에는 마케팅 파트너로 함께합니다.",
    en: "A business & startup content media brand built around a 320K-subscriber YouTube channel — founder interviews, industry analysis, and the BZCF Fellowship community. Joining the builderthon as a marketing partner.",
  },
  "Korean Association in Singapore": {
    ko: "1963년 설립된 싱가포르 한인 사회의 대표 단체로, 탄종파가에 자체 회관을 두고 장학 사업과 청년 멘토링·네트워킹 프로그램, 연례 한인 행사를 운영합니다. 이번 빌더톤에는 장소 지원과 멘토 굿즈백 준비로 함께합니다.",
    en: "The representative body of Singapore's Korean community since 1963, with its own hall in Tanjong Pagar — running scholarships, young-professionals mentoring and the community's annual events. Supporting the builderthon with the venue and goodie bags for the mentors.",
  },
  "Onword Lab": {
    ko: "‘We Make Old Businesses Young’을 내건 AI 전환(AX) 스타트업으로, 리테일·커머스의 운영과 마케팅을 AI로 다시 설계합니다. 이커머스 올인원 운영 에이전틱 대시보드를 만들고 있으며, 이번 빌더톤에는 멘토링으로 함께합니다.",
    en: "An AI-transformation startup — 'We Make Old Businesses Young' — redesigning retail and commerce operations and marketing with AI, building an agentic all-in-one e-commerce operations dashboard. Joining the builderthon as a mentoring partner.",
  },
  REmited: {
    ko: "영수증 리워드 앱으로 2천만 건 이상의 구매 데이터를 모아 브랜드에 초개인화 마케팅 솔루션을 제공하는 AI 커머스 스타트업(팀리미티드)입니다. CJ제일제당·이랜드리테일과 협업하며 구글·앤틀러 등의 지원 속에 동남아 진출을 준비 중이고, 이번 빌더톤에는 멘토링으로 함께합니다.",
    en: "An AI-commerce startup (Team REmited) whose receipt-reward app has gathered 20M+ purchase records, powering hyper-personalized marketing for brands like CJ CheilJedang and E-Land Retail. Backed by Google for Startups and Antler and eyeing Southeast Asia — joining as a mentoring partner.",
  },
  "Brand Boost": {
    ko: "브랜드 굿즈·판촉물을 기획부터 제작·패킹까지 원스톱으로 만드는 제작 플랫폼입니다. 아이디어 단계의 구상을 구성·공정·단가가 잡힌 제작 플랜으로 바꿔 주는 것이 강점이며, 이번 빌더톤의 굿즈를 함께 만듭니다.",
    en: "A one-stop platform for branded goods and merch — from planning through production and packing — turning rough ideas into concrete, costed production plans. Making this builderthon's goods.",
  },
  // Figures are the ones Fyreflyz publishes on its own site (fyreflyz.com) —
  // since 2009, 2,000+ youths, 300+ partner organisations, 1,800+ jobs. The last
  // sentence is the reason the tile's caption is 심사위원 지원: their co-founder
  // 한정필 joins as a judge (see dict.judges.people).
  Fyreflyz: {
    ko: "2009년 설립된 싱가포르의 소셜벤처 마케팅 에이전시입니다. 브랜드 진단·시장 분석부터 콘텐츠 실행까지 맡으면서, 교육을 마친 청년들을 실제 클라이언트 프로젝트에 투입하는 방식으로 일합니다 — 지금까지 청년 2,000명 이상, 파트너 기관 300곳 이상과 함께하며 1,800개 이상의 일자리를 만들었습니다. 이번 빌더톤에는 심사위원 연계로 함께합니다.",
    en: "A Singapore social-enterprise marketing agency founded in 2009. It runs brand audits, market analysis and content execution while embedding trained youths into real client projects — 2,000+ youths, 300+ partner organisations and 1,800+ jobs created so far. Supporting the builderthon through its judge connection.",
  },

};

// Press coverage shown as outbound links in a company's intro modal, keyed by the
// same tile `alt` / modal name as partnerIntros. Each label is the PUBLICATION
// (not an invented headline) so the link is honest about where it points. URLs
// are supplied verbatim by the user.
export type PartnerArticle = { url: string; label: Phrase };
export const partnerArticles: Record<string, PartnerArticle[]> = {
  AXMOS: [
    { url: "https://magazine.hankyung.com/business/article/202603238734b", label: { ko: "한국경제 매거진", en: "Hankyung Business" } },
    { url: "https://zdnet.co.kr/view/?no=20260714141002", label: { ko: "ZDNet Korea", en: "ZDNet Korea" } },
    { url: "https://www.prnewswire.com/kr/news-releases/u0061u0078u006Du006Fu0073u002DuCEE8uC18CuC2DCuC5C4u002DuCF54uB4DCuD504uB808uC18Cu002Cu002DuBD80uC0B0uC815uBCF4uC0B0uC5C5uC9C4uD765uC6D0u2022-302811904.html", label: { ko: "PR Newswire", en: "PR Newswire" } },
  ],
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
    // Nav anchor for the quiz, sitting after FAQ. Deliberately a text link at the
    // same weight as the section anchors — a step below the open-chat ghost
    // button, two below the register pill.
    quizNav: { ko: "유형 테스트 ✦", en: "Type test ✦" },
    // Shown instead of `quiz` once a visitor has taken the test (links to their saved result).
    quizResult: { ko: "내 결과 보기", en: "View my result" },
    viewProgram: { ko: "프로그램 보기", en: "View Program" },
    register: { ko: "등록하기", en: "Register" },
    partner: { ko: "파트너십 문의", en: "Partner with us" },
    // Nav open-chat entry. Present from first paint (unlike the register button,
    // which is scroll-revealed): the whole point is to give someone who isn't
    // ready to register a door that is already open when they land.
    openChat: { ko: "오픈채팅", en: "Open Chat" },
    openChatAria: { ko: "카카오톡 오픈채팅방 열기", en: "Open the KakaoTalk open chat" },
    // Brand suffix beside the Zero100 wordmark in the nav.
    brandSuffix: { ko: "AI 빌더톤", en: "AI Builderthon" },
  },

  // Secondary CTA on the hero/footer that sends visitors to the /quiz mini-site.
  quizCta: {
    eyebrow: { ko: "✦ AI 성격 테스트 · 환상의 궁합", en: "✦ AI test · dream teammates" },
    button: { ko: "내 AI 모델 알아보기", en: "Find your AI model" },
  },

  // ── Mobile sticky action bar ──────────────────────────────────────────────
  // Register stays the primary; the quiz rides along as a chip so it is reachable
  // from anywhere on a phone without competing for the same visual weight.
  stickyBar: {
    register: { ko: "등록하기", en: "Register" },
    quiz: { ko: "✦ 내 유형은?", en: "✦ My type?" },
    aria: { ko: "빠른 실행", en: "Quick actions" },
  },

  // ── One-question hook ─────────────────────────────────────────────────────
  // The quiz's real Q1 now lives INSIDE the quiz hook card in the 혜택 band
  // (HookCards `withQuestion`), not as a section of its own — so the only copy
  // left here is the way past it. The heading/sub the standalone block used are
  // gone: the card's own title already introduces the quiz, and repeating it
  // above the question read as two intros stacked.
  miniQuiz: {
    cta: { ko: "질문 없이 바로 시작하기 →", en: "Skip ahead and just start →" },
  },

  // Program-section cross-link — the quiz already recommends sessions by type,
  // which nothing on the home page said out loud.
  programQuizChip: {
    ko: "유형 테스트 결과로 맞춤 세션 추천받기 →",
    en: "Get session picks from your type →",
  },

  // Toast shown by the undocumented ?reset=1 QA helper (see components/ResetHandler).
  resetToast: {
    ko: "저장된 로컬 데이터를 지웠어요 — 새 사용자 상태예요",
    en: "Local data cleared — you're a fresh user now",
  },

  // ── Registration — hero question hooks, nav button, and the register modal ──
  register: {
    // Hero "question hook" pair — also reused as the mid-page CTA bands.
    // Card 1 is the PRIMARY one and goes straight to registration (it opens the
    // modal preset to solo + matching, which is what the copy promises). Card 2
    // is the quiz, framed as an optional bit of fun, not as the way in — it used
    // to be the lead card, which sent people who wanted to register into a
    // 14-question personality test instead.
    hookRegisterQ: { ko: "팀이 없어도 괜찮아요", en: "No team? No problem." },
    hookRegisterSub: {
      ko: "이미 팀이 있다면 대표 1명이 팀 전체를 등록하면 돼요.",
      en: "Already have a team? One person can register everyone.",
    },
    hookRegisterCta: { ko: "등록하고 팀 매칭 받기", en: "Register & get matched" },
    // Quiz card — the aside, so it earns attention with tone rather than weight.
    // The two type names are REAL variantNames from data/quiz.ts (ESTP-T and
    // ENFP-A); the pairing is the gag, so they have to be a genuine opposite.
    // Check the data before editing — an invented name here reads as a bug the
    // moment someone takes the test and never finds it.
    hookQuizQ: {
      ko: "조급한 Mistral? 여유로운 Pi? — 너 뭔데",
      en: "Impatient Mistral? Easygoing Pi? — which one are you",
    },
    // ── Quiz hook card, promoted ────────────────────────────────────────────
    // The old card was a text link at text-xs/white-60 inside a dead panel: it
    // read as a disclaimer and its tap target was ~20px. These keys drive the
    // promoted version. The effort label deliberately differs from the register
    // card's "3분" chip so the two CTAs don't sound like the same offer.
    hookQuizQBig: {
      ko: "16개 AI 모델 중, 당신은 뭘까요?",
      en: "16 AI models. Which one are you?",
    },
    hookQuizCtaBig: { ko: "내 유형 보기", en: "See my type" },
    hookQuizMeta: { ko: "14문항 · 약 3분", en: "14 questions · ~3 min" },
    // Rotating teaser under the question — REAL variant names from data/quiz.ts,
    // resolved at runtime from RESULTS so they can never drift from the data.
    hookQuizShufflePrefix: { ko: "예를 들면", en: "For instance" },
    // ── Post-registration ───────────────────────────────────────────────────
    // The one moment a visitor is guaranteed to be receptive: they just finished
    // the form and there is nothing else to do until the event.
    successQuizTitle: {
      ko: "등록 완료! 행사 전까지 — 내 AI 모델 알아보고 스토리에 공유하기",
      en: "You're in! While you wait — find your AI model & share it",
    },
    successQuizCta: { ko: "유형 테스트 하러 가기", en: "Take the type test" },
    // The disclaimer IS the joke — and it's also true, which is why it can be
    // said out loud instead of buried.
    hookQuizNote: { ko: "*과학적 근거는 없습니다. 재미는 있습니다.", en: "*Zero science. 100% fun." },
    // Returning visitor with a saved result: {name} is their own variantName.
    hookQuizQReturn: {
      ko: "{name}님, 환상의 짝꿍은 확인하셨어요?",
      en: "Hey {name} — met your perfect match yet?",
    },
    // No trailing arrow: the card draws its own (and animates it on hover), so
    // one baked into the string rendered as "내 결과 다시 보기 → →".
    hookQuizCtaReturn: { ko: "내 결과 다시 보기", en: "Back to my result" },
    // The four things that stop people from registering, answered in one line.
    // Rendered under the register CTA everywhere the hook cards appear (hero +
    // both mid-page bands) from this single key, so the answer can never drift
    // between placements. Every clause is a confirmed fact stated elsewhere on
    // the site — nothing here is new promise.
    reassure: {
      ko: "참가비 무료 · 스크리닝 없음 · 코딩 몰라도 OK · 솔로 환영",
      en: "Free to join · No screening · No coding needed · Solo welcome",
    },
    // "How long will this take" — the other silent objection. Sits as a chip on
    // the hook CTA and is restated at the top of the modal, where it's checkable
    // (the form really does have three required fields).
    hookRegisterMinutes: { ko: "3분", en: "3 min" },
    // ── Open-chat third CTA ────────────────────────────────────────────────
    // The low-commitment exit for someone who isn't ready to register. Rendered
    // as a TEXT LINK everywhere, never a button: it sits next to the register
    // CTA and the moment it competes visually it starts cannibalising the
    // conversion it's meant to catch. See OpenChatLink in Journey.tsx.
    openChatCta: {
      ko: "아직 고민 중이라면 — 오픈채팅에서 소식만 받아보세요",
      en: "Not sure yet? Just follow along in our open chat",
    },
    // Shown once per session when the register modal is dismissed WITHOUT
    // submitting. Not a second modal — a bottom toast that self-dismisses, so it
    // can't trap focus or stack on top of the dialog that just closed.
    openChatNudge: {
      ko: "등록은 나중에 해도 돼요. 오픈채팅에서 소식 받아보실래요?",
      en: "No rush — want updates in our open chat instead?",
    },
    // Success screen: the participant room is private and invite-only, so this
    // says why the OPEN room is still worth joining rather than repeating it.
    successOpenChatTitle: {
      ko: "오픈채팅방에도 들어와 계세요 — 공지가 가장 먼저 올라와요",
      en: "Join the open chat too — announcements land there first",
    },
    successOpenChatCta: { ko: "오픈채팅 들어가기", en: "Open the chat" },
    // Nav scroll-revealed button + its post-registration label.
    navRegistered: { ko: "등록 완료 ✓", en: "Registered ✓" },
    // Modal chrome.
    modalTitle: { ko: "빌더톤 등록", en: "Register for the Builderthon" },
    // Leads with the effort estimate, then the original subtitle unchanged: the
    // question someone has with the form already open is "how long is this".
    // COUNT THIS AGAINST THE FORM before editing — it's a claim the visitor can
    // check in one glance. Solo path has four `required` Fields (name, email,
    // joinType, contact); picking 팀 adds the team name, so "4" is the floor,
    // not the average. Bump it if a required field is ever added.
    modalSubtitle: {
      ko: "필수는 4칸 — 3분이면 끝나요. 몇 가지만 알려주시면 운영진이 카카오톡으로 다음 절차를 안내드려요. 이미 팀이 있다면 한 명이 팀 전체를 등록할 수 있어요.",
      en: "Only 4 required fields — done in 3 minutes. A few details and our team will reach out on KakaoTalk. Have a team already? One person can register everyone.",
    },
    // Trust signals — who's asking, what happens to the data, and what happens
    // next. All three restate facts already true elsewhere on the site; none of
    // them promises anything new.
    trustOrganizer: {
      ko: "SMU · NUS · NTU 한인 학생회 주관 · Zero100 AI 빌더톤 운영진이 직접 확인합니다.",
      en: "Organized by the SMU · NUS · NTU Korean student associations — the Zero100 AI Builderthon team reads every entry.",
    },
    trustPrivacy: {
      ko: "입력하신 연락처는 참가 안내·참가자 단톡방 초대에만 사용하고 외부에 공유하지 않습니다. 팀원 정보는 팀원 동의 하에 입력해 주세요.",
      en: "Your contact details are used only for event updates and the participants' chat invite, and are never shared outside the team. Please enter teammates' details only with their consent.",
    },
    optional: { ko: "선택", en: "optional" },
    selectPlaceholder: { ko: "선택하세요", en: "Select…" },
    // Field 1 — name.
    nameLabel: { ko: "이름", en: "Name" },
    namePlaceholder: { ko: "홍길동", en: "Your name" },
    // Field 2 — email.
    emailLabel: { ko: "이메일", en: "Email" },
    emailPlaceholder: { ko: "you@example.com", en: "you@example.com" },
    // Field 3 — school.
    schoolLabel: { ko: "학교", en: "University" },
    schoolOptions: [
      { value: "NUS", label: { ko: "NUS", en: "NUS" } },
      { value: "NTU", label: { ko: "NTU", en: "NTU" } },
      { value: "SMU", label: { ko: "SMU", en: "SMU" } },
      { value: "SIM", label: { ko: "SIM", en: "SIM" } },
      { value: "other", label: { ko: "기타", en: "Other" } },
    ],
    schoolOtherPlaceholder: { ko: "학교명을 입력해 주세요", en: "Enter your university" },
    // Field 4 — KakaoTalk id. Required, and it must be a real id: the organizers
    // run the participant group chat on KakaoTalk, so a phone number or an
    // email here means someone we can't invite.
    // Kakao ids are lowercase letters/digits/./_ , 4–20 chars, and carry no "@"
    // — see lib/kakao.ts, which strips one if it's typed anyway.
    contactLabel: { ko: "카카오톡 ID", en: "KakaoTalk ID" },
    contactHint: {
      ko: "카카오톡 앱 → 프로필 → 설정에서 확인할 수 있어요. 참가자 단톡방 초대에 사용돼요.",
      en: "Find it in KakaoTalk → Profile → Settings. Used for the participants' chat invite.",
    },
    contactPlaceholder: { ko: "kakao_id", en: "kakao_id" },
    // LinkedIn (optional) — registrant + each team member.
    linkedinLabel: { ko: "링크드인", en: "LinkedIn" },
    linkedinPlaceholder: { ko: "linkedin.com/in/… 또는 @handle", en: "linkedin.com/in/… or @handle" },
    // Field 5 — join type (drives the team section).
    partLabel: { ko: "참가 형태", en: "How are you joining?" },
    partOptions: [
      { value: "team", label: { ko: "팀이 이미 있어요 (2–3인)", en: "I already have a team (2–3)" } },
      { value: "solo", label: { ko: "솔로로 갑니다 (1인)", en: "Going solo (1)" } },
    ],
    // Solo-only: opt into being matched with other solo builders. The AI-type
    // block appears only while this is checked.
    soloMatchLabel: {
      ko: "다른 솔로 참가자와 팀 매칭을 원해요",
      en: "Match me with other solo builders",
    },
    // Solo-only team name — a 1인 팀 can name itself in advance. Optional, and
    // hidden the moment matching is checked (the team is decided on-site then).
    soloTeamNameHelper: {
      ko: "1인 팀으로 출전할 팀명이에요. 비워두면 현장에서 정해도 돼요.",
      en: "Your one-person team's name — leave it blank and decide on-site if you like.",
    },
    // Checkbox: mirror the name into the team name and lock the field.
    soloTeamNameSameLabel: {
      ko: "팀명을 내 이름과 똑같이 할래요",
      en: "Use my name as the team name",
    },
    // Shown (not an error) when the box is checked before a name is entered —
    // focus jumps to the name field and the team name fills in as they type.
    soloTeamNameNeedName: {
      ko: "먼저 이름을 입력해 주세요 — 팀명에 그대로 채워드려요.",
      en: "Enter your name first — we'll fill it into the team name for you.",
    },
    // The locked-field reason, tied to the input via aria-describedby.
    soloTeamNameLocked: {
      ko: "이름과 똑같이 맞춰뒀어요. 체크를 해제하면 직접 고칠 수 있어요.",
      en: "Matched to your name. Uncheck to edit it yourself.",
    },
    // Team section — shown only when "team" is selected.
    teamSectionTitle: { ko: "팀 정보", en: "Team details" },
    teamSizeNote: {
      ko: "팀은 2–3인이에요 — 혼자라면 '솔로'로",
      en: "Teams are 2–3 — going alone? Pick solo.",
    },
    teamNameLabel: { ko: "팀명", en: "Team name" },
    teamNamePlaceholder: { ko: "예: 빌드 마스터즈", en: "e.g. Build Masters" },
    teamNameHelper: {
      ko: "팀원이 따로따로 등록한다면 반드시 똑같은 팀명으로 적어주세요 — 그래야 같은 팀으로 묶여요. 한 명이 팀 전체를 등록하면 나머지는 등록 안 해도 돼요.",
      en: "If teammates register separately, everyone must enter exactly the same team name so we can group you. If one person registers the whole team, the others don't need to submit again.",
    },
    // Multi-member entry (registrant is Member 1; add up to Member 3).
    memberYou: { ko: "나 (팀원 1)", en: "You (Member 1)" },
    memberLabel: { ko: "팀원", en: "Member" },
    addTeammate: { ko: "팀원 추가", en: "Add teammate" },
    maxNote: { ko: "최대 3인까지예요", en: "3 is the max" },
    removeMember: { ko: "팀원 삭제", en: "Remove teammate" },
    // Field 6 — interested track.
    trackLabel: { ko: "관심 트랙", en: "Track of interest" },
    // The track line-up is still being worked out, so this answer is a signal of
    // interest, not a pick from a final menu — say so rather than let the select
    // imply otherwise.
    trackHint: {
      ko: "트랙 구성은 아직 확정 전이에요. 참고용으로만 받고, 확정되면 다시 안내드려요.",
      en: "The track line-up isn't final yet — this is just a signal of interest, and we'll follow up once it's confirmed.",
    },
    trackOptions: [
      { value: "finance", label: { ko: "재무", en: "Finance" } },
      { value: "sales", label: { ko: "영업", en: "Sales" } },
      { value: "marketing", label: { ko: "마케팅 (입문)", en: "Marketing (beginner)" } },
      { value: "unsure", label: { ko: "아직 모르겠어요", en: "Not sure yet" } },
    ],
    // AI-type block — shown ONLY for solo applicants who opted into matching.
    aiTypePrefix: { ko: "내 AI 유형: ", en: "My AI type: " },
    // State A — a saved result exists on this device.
    aiConfirmQ: {
      ko: "이 결과가 맞나요? 팀 매칭에 활용돼요.",
      en: "Is this you? We'll use it for team matching.",
    },
    aiYes: { ko: "네, 이거예요", en: "Yep, that's me" },
    aiRetake: { ko: "내 결과가 아니에요 · 다시 테스트", en: "Not mine · retake the test" },
    aiAttached: { ko: "AI 유형이 첨부됐어요", en: "AI type attached" },
    aiRetakeShort: { ko: "다시 테스트", en: "Retake" },
    // State B — no saved result on this device.
    aiNoneMsg: {
      ko: "아직 테스트를 안 하셨네요 — 3분이면 돼요",
      en: "Looks like you haven't taken the test — it takes 3 minutes",
    },
    aiGoTest: { ko: "테스트 하러 가기 →", en: "Take the test →" },
    // Submit + states.
    submit: { ko: "등록하기", en: "Register" },
    submitting: { ko: "등록 중…", en: "Registering…" },
    successTitle: { ko: "등록 완료!", en: "You're registered!" },
    // Concrete next step + a way out if it doesn't arrive — "hang tight" left
    // people with no idea whether to wait a day or a month, or whom to poke.
    // TODO: '며칠 내' → 운영 확정 시 '2–3일 내'로 (EN: "within a few days" → "in 2–3 days")
    successBody: {
      ko: "며칠 내 참가자 단톡방으로 초대해 드려요. 연락이 없으면 pjh030924@gmail.com 로 문의해 주세요.",
      en: "We'll invite you to the participants' KakaoTalk chat within a few days. If you don't hear from us, email pjh030924@gmail.com.",
    },
    successClose: { ko: "닫기", en: "Close" },
    // ── Already-registered panel ───────────────────────────────────────────
    // Shown instead of a blank form when this browser has the registered flag.
    // Before this existed, "등록 완료 ✓" reopened an empty form, which invited
    // duplicate entries and gave someone wanting to fix a typo nowhere to go.
    //
    // The copy says "이 브라우저" on purpose: the flag is device-local, so it is
    // evidence that THIS BROWSER registered, not proof of who is holding it.
    // Same reason `alreadyAgain` always offers a way through to the form —
    // a shared laptop must never lock the next person out of registering.
    alreadyTitle: { ko: "이미 등록하셨어요", en: "You're already registered" },
    alreadyBody: {
      ko: "이 브라우저에 등록 기록이 남아 있어요. 등록 정보를 고치거나 취소하시려면 운영진에게 알려주세요 — 직접 수정하는 기능은 아직 없어요.",
      en: "This browser has a registration on record. To change or cancel your details, just tell the organizers — there's no self-serve edit yet.",
    },
    alreadyEmailCta: { ko: "운영진에게 메일 보내기", en: "Email the organizers" },
    alreadyChatBody: {
      ko: "빌더톤 오픈채팅방에 문의를 남기셔도 돼요.",
      en: "You can also leave a message in the builderthon open chat.",
    },
    alreadyChatCta: { ko: "오픈채팅 들어가기", en: "Open the chat" },
    alreadyAgain: {
      ko: "다른 사람을 등록하시나요? 새로 등록하기",
      en: "Registering someone else? Start a new registration",
    },
    // Validation.
    errRequired: { ko: "필수 항목이에요.", en: "This field is required." },
    errEmail: { ko: "이메일 형식을 확인해 주세요.", en: "Please enter a valid email." },
    errDupEmail: { ko: "이미 입력한 이메일이에요.", en: "This email is already entered." },
    // A "team" with only the registrant — a team is 2–3 people, so route them
    // to the solo option instead of accepting a 1인 team.
    errTeamTooSmall: {
      ko: "혼자라면 '솔로'로 바꿔주세요.",
      en: "Going alone? Switch to 'Going solo'.",
    },
    // Shown when the submit itself fails (network down / server error). The
    // form stays filled in so the visitor can just press the button again.
    errSubmit: {
      ko: "등록에 실패했어요. 잠시 후 다시 시도해 주세요.",
      en: "Registration failed. Please try again in a moment.",
    },
    // 429 from the per-IP / global throttle. Separate from errSubmit because
    // the remedy differs: this one really is "wait", not "retry now", and a
    // shared campus IP can legitimately hit it during an info session.
    errRateLimited: {
      ko: "요청이 너무 몰리고 있어요. 잠시 후 다시 시도해 주세요.",
      en: "Too many requests right now — please try again in a moment.",
    },
  },

  hero: {
    eyebrow: {
      ko: "싱가포르 최초의 한인 학생 AI 빌더톤",
      en: "Singapore's first AI builderthon for Korean students",
    },
    titleLine1: { ko: "싱가포르,", en: "Build" },
    titleLine2: { ko: "빌드의 무대", en: "in Singapore." },
    dates: { ko: "2026.08.22 – 08.29 · 8일", en: "22–29 Aug 2026 · 8 days" },
    location: { ko: "싱가포르 · *SCAPE L^IFE Jungle & AWS 오피스", en: "Singapore · *SCAPE L^IFE Jungle & AWS office" },
    blurb: {
      ko: "싱가포르에서 공부하는 한국 학생들이 8일간, 실제 기업의 AI 전환(AX) 과제를 바이브 코딩으로 직접 풀어내는 AI 빌더톤. 필참은 첫날과 마지막 날 이틀뿐 — 나머지는 각자 편한 시간·장소에서 팀별로 빌드합니다. zero에서 MVP까지, 데모로 끝나지 않는 ‘성공의 경험’을 남깁니다.",
      en: "Korean students in Singapore spend 8 days solving real companies' AI-transformation (AX) problems with vibe coding. Only the first and last day are required — the rest your team builds whenever and wherever suits you. From zero to MVP, a real success that goes beyond a demo.",
    },
    ctaProgram: { ko: "8일의 여정 둘러보기", en: "Explore the 8-day journey" },
    ctaPartner: { ko: "파트너십 문의", en: "Partner with us" },
    scroll: { ko: "스크롤", en: "Scroll" },
    // Label above the hero's confirmed-partner logo strip (mirrors the deck's
    // "CONFIRMED PARTNERS" cover band). Only partners already confirmed appear
    // there — see `confirmedPartners` in Journey.tsx.
    partnersLabel: { ko: "확정 파트너 · CONFIRMED PARTNERS", en: "Confirmed Partners" },
    // Accessible name for the strip, which links to the full partner section.
    partnersAria: { ko: "확정 파트너 전체 보기", en: "See all confirmed partners" },
    // Tier captions inside the strip. Deliberately shorter than the partner
    // section's own labels ("주최 · HOST", "주관 · 운영", "후원 · SPONSORS") —
    // at 0.55rem in a hairline band the full forms crowd out the logos.
    partnersHost: { ko: "주최 · AXMOS", en: "Host · AXMOS" },
    partnersOrganizers: { ko: "주관", en: "Organizers" },
    partnersSponsors: { ko: "후원", en: "Sponsors" },
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
    // Short variant shown on mobile, where the full line is too long.
    countdownEyebrowShort: { ko: "시작까지", en: "Begins in" },
    countdownLive: { ko: "실시간", en: "Live" },
    countdownUnitDays: { ko: "일", en: "days" },
    countdownUnitHours: { ko: "시", en: "hrs" },
    countdownUnitMinutes: { ko: "분", en: "min" },
    countdownUnitSeconds: { ko: "초", en: "sec" },
    // Sits under the countdown grid. Says what registering early actually gets
    // you — NOT that seats are running out. There is no cap and no registration
    // deadline set, so scarcity framing ("선착순", "마감 임박", "잔여석") would
    // be fabricated pressure. Each clause here is something already true.
    countdownUrgency: {
      ko: "등록자부터 참가자 단톡방 초대 · 트랙 사전 안내 · 팀 매칭이 시작돼요.",
      en: "Registered builders get the participants' chat invite, track previews and team matching first.",
    },
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
    // One-line stand-in left in the 취지 chapter after the five-step funnel moved
    // to its own section before the footer.
    visionOneLiner: {
      ko: "이 행사는 끝이 아니라 깔때기의 입구입니다 — 그 시작이 당신입니다.",
      en: "This event isn't an end but the mouth of a funnel — and you're where it starts.",
    },
    visionTag: { ko: "비전", en: "Vision" },
    visionHeading: {
      ko: "이벤트는 끝이 아니라, 모든 것의 ‘초입’입니다.",
      en: "The event isn't the end — it's the entry point to everything.",
    },
    // Rewritten from community persona interviews + operator advice: the funnel
    // now describes how the thing actually works from a participant's seat
    // (what happens after the eight days, and how you move up), not an
    // organizer's multi-year roadmap. Research flagged roadmap-speak and soft
    // "grow together" phrasing as trust-killers, so both are out.
    visionIntro: {
      ko: "기회는 많은데 ‘내 기회’는 아니었던 싱가포르에서 — 행사가 끝나도 다음 모임이 잡혀 있도록, 8일의 경험이 정기 세션과 성장 사다리로 이어지게 설계하고 있습니다.",
      en: "In a Singapore full of opportunities that never quite felt like ours — we're designing the eight days to continue: regular builder sessions and a growth ladder, so there's always a next gathering after the event ends.",
    },
    visionSteps: [
      {
        num: "1",
        title: { ko: "Zero100 AI 빌더톤", en: "Zero100 AI Builderthon" },
        body: {
          ko: "8일의 성공 경험 — 여기서 만나는 동료·멘토·기업이 전부의 시작점입니다.",
          en: "8 days of real success — the peers, mentors and companies you meet here start everything.",
        },
      },
      {
        num: "2",
        title: { ko: "이어지는 리듬", en: "A rhythm that continues" },
        body: {
          ko: "한 번 하고 끝나지 않습니다 — 기업 문제를 해부하고, 만든 것을 서로 발표하는 정기 빌더 세션. 소수정예 코어로 시작합니다.",
          en: "Not a one-off — regular builder sessions where a small core dissects real company problems and demos what they built.",
        },
      },
      {
        num: "3",
        title: { ko: "성장 사다리", en: "A growth ladder" },
        body: {
          ko: "참가자 → 코어 멤버 → 기업 프로젝트 TF. 스터디와 미니 스프린트를 거쳐 실제 기업 프로젝트를 이어받는 구조가 1차 목표입니다.",
          en: "Participant → core member → company-project TF — through studies and mini-sprints to owning a real company project. That ladder is goal #1.",
        },
      },
      {
        num: "4",
        title: { ko: "한–싱 Cross-border", en: "Korea–SG cross-border" },
        body: {
          ko: "공고판이 아니라, 실력을 증명한 학생을 기업이 찾아오게 만드는 다리 — 해마다 싱가포르를 오가는 수백 개의 한국 기업이 그 상대입니다.",
          en: "Not a job board — a bridge where companies seek out proven builders, among the hundreds of Korean companies moving through Singapore each year.",
        },
      },
      {
        num: "5",
        title: { ko: "목적지가 되는 것", en: "Becoming the destination" },
        body: {
          ko: "‘이걸 하러 싱가포르에 온다’ — 한인 학생 빌더의 목적지가 될 때까지.",
          en: "“You come to Singapore to do this” — until this is the destination for Korean student builders.",
        },
      },
    ],
    // Continuity note — the single most-cited worry in the interviews.
    visionNote: {
      ko: "군 복무나 교환을 다녀와도 연결이 끊기지 않는 커뮤니티를 목표로 합니다.",
      en: "A community where the connection survives military service and exchange terms.",
    },
    // Bridge into the closing register CTA that sits directly below this
    // section — higher in the hierarchy than visionNote for that reason.
    // No headcount: the target has been ~100 all along but the actual number
    // isn't settled, and a figure printed under a register button reads as a
    // cap ("only 100 spots") rather than an ambition. "첫 빌더들" says the same
    // thing — you'd be at the start of this — without a number to be wrong about.
    visionBridge: {
      ko: "그 시작점의 첫 빌더들이 이번 8월에 모입니다.",
      en: "The first builders of that starting point gather this August.",
    },
    // ── Press ────────────────────────────────────────────────────────────────
    // Outside coverage of the gap described just above, rendered as a slim
    // citation row under the 지금의 현실 block (logo · title · date · link — no
    // blurb, the row stays one line). Deliberately links out (the only external
    // link on the page) and deliberately does NOT name the organizer the piece
    // profiles — the site's own copy stays name-free, and the byline is one
    // click away in the article itself.
    pressTag: { ko: "언론에 소개된 이야기", en: "In the press" },
    press: [
      {
        outlet: "BZCF · 비즈까페",
        date: { ko: "2026.07.05", en: "5 Jul 2026" },
        title: {
          ko: "「세계는 넓고 할 일은 많다」",
          en: "“The world is wide, and there's much to do”",
        },
        url: "https://bzcf.io/segyeneun-neolbgo-hal-ileun-manhda/",
        logo: "/partners/logos/white/trimmed/bzcf.png",
      },
    ],
    pressCta: { ko: "원문 보기", en: "Read the article" },
  },

  whoWhat: {
    tag: { ko: "참가 대상", en: "Who should join" },
    heading: {
      ko: "전공도, 코딩 실력도 묻지 않습니다.",
      en: "You don't need to be a CS major.",
    },
    intro: {
      ko: "참가자의 약 60%는 바이브 코딩이 처음입니다. 그리고 그게 핵심입니다 — 크래시코스(Day 2, 코드프레소 주관)로 출발선을 맞추고, 코딩 실력이 아니라 아이디어가 한계가 되게 합니다.",
      en: "About 60% of participants are trying vibe coding for the first time — and that's the point. A crash course (Day 2, run by Codepresso) levels the start line so your ideas, not your syntax, are the limit.",
    },
    whoTitle: { ko: "이런 분께", en: "Who should join" },
    // Eligibility is TWO groups, not one: the universities, and Koreans who are
    // job-hunting right now whether or not they are enrolled anywhere. The list
    // used to name only NUS·NTU·SMU, which read as a closed door to the second
    // group — and they are the people an 8-day build with real company problems
    // and an internship at the end is most useful to. The register form already
    // handles them: 학교 is optional and carries an 기타 option, so nothing there
    // needs to change (components/RegisterModal.tsx · dict.register.schoolOptions).
    who: [
      { ko: "전공 불문 — NUS · NTU · SMU의 모든 한인 학생", en: "Any major — Korean students across NUS · NTU · SMU" },
      { ko: "재학생이 아니어도 — 지금 구직 중인 한인이라면 누구나", en: "Not enrolled? Open to any Korean who's job-hunting right now" },
      { ko: "코딩이 처음이어도 좋습니다 — 크래시코스와 수료증(전 시간 참석 시)이 함께합니다", en: "First time coding is fine — a crash course, plus a certificate if you attend all of it" },
      { ko: "입대 전·전역 후, 다시 도전하고 싶은 분", en: "Anyone wanting a fresh challenge — before enlistment or after service" },
      { ko: "실제 기업의 문제를 직접 풀어보고 싶은 분", en: "Anyone who wants to solve a real company's problem hands-on" },
    ],
    // The only eligibility CONDITION on the page. It sits with the invitation
    // because the list above says "누구나" — and the honest limit is not where
    // you study or whether you're enrolled, it's whether you can be in the room
    // on the two mandatory days. Those two are the only `mandatory: true`
    // entries in data/schedule.ts (Day 1 킥오프 · Day 8 데모데이); the six days
    // between are self-paced and mostly online, which is why the second half of
    // the sentence is there — without it this reads as an 8-day residency.
    requirement: {
      ko: "참가 조건은 하나예요 — Day 1(8/22 킥오프)과 Day 8(8/29 데모데이)은 싱가포르 현장에 꼭 오셔야 합니다. 사이 6일은 대부분 온라인이고, 각자 편한 시간·장소에서 팀별로 빌드해요.",
      en: "One condition: you need to be in Singapore in person for Day 1 (22 Aug, kick-off) and Day 8 (29 Aug, Demo Day). The six days between are mostly online and self-paced, wherever you are.",
    },
    disclaimer: {
      ko: "* 일부 혜택(인센티브·멘토 라인업 등)은 파트너와 논의 중이며 확정 시 안내됩니다.",
      en: "* Some benefits (incentives, mentor line-up) are under discussion with partners and will be confirmed.",
    },
  },

  program: {
    tag: { ko: "Program", en: "Program" },
    heading: { ko: "8일, zero에서 MVP까지", en: "8 days, from zero to MVP" },
    // Leads with what's REQUIRED, because the previous version led with the
    // four in-person days and read as "block out all eight." Only Day 1 and
    // Day 8 carry `mandatory: true` in data/schedule.ts — keep this in step with
    // that flag. Everything between is either optional or self-paced, and saying
    // so up front is what stops the programme looking like an 8-day lock-in.
    // Sits above modeNote. The schedule already marks individual items
    // ("조율 중", "섭외 중", "검토 중"), but someone scanning eight day-cards
    // reads them as a finished timetable and treats every line as a promise.
    // Say once, up front, that this is still moving — it costs nothing now and
    // saves explaining a change later.
    pendingNote: {
      ko: "프로그램은 아직 확정 전인 부분이 많습니다 — 세션·연사·시간은 조율 중이며, 확정되는 대로 이 페이지에 업데이트합니다.",
      en: "Much of the programme is still being finalised — sessions, speakers and times are being worked out, and this page is updated as each is confirmed.",
    },
    modeNote: {
      ko: "필참은 Day 1(오프닝)과 Day 8(데모데이) 둘뿐이에요. 그 사이는 대부분 온라인이고, 자율 빌드는 각자 편한 시간·장소에서 팀별로 이어갑니다 — 8일 내내 붙어 있어야 하는 일정이 아닙니다. Day 5(오프라인 킥오프)·Day 7(파이널 리허설·AWS 오피스)은 현장에 모이지만 필참은 아니에요.",
      en: "Only two days are required: Day 1 (opening) and Day 8 (Demo Day). Everything in between is mostly online, and the self-paced build happens whenever and wherever works for your team — this is not eight days you have to block out. Day 5 (kickoff) and Day 7 (final rehearsal · AWS office) meet in person too, but attendance isn't required.",
    },
    dayLabel: { ko: "Day", en: "Day" },
    // Label on the wide band above Lab 1. "사전" rather than "Day 0" — the
    // session is a prologue to the eight days, not a day of them.
    preEventTag: { ko: "사전 세션 · 8/13", en: "Pre-event · 13 Aug" },
    tapHint: { ko: "자세히 보기", en: "View details" },
    confirmedBadge: { ko: "확정", en: "Confirmed" },
    mandatoryBadge: { ko: "필참", en: "Required" },
    onlineLabel: { ko: "온라인", en: "Online" },
    offlineLabel: { ko: "현장", en: "In person" },
    // ── Self-paced (category "build") ──────────────────────────────────────
    // Build events carry mode "online" in the data because they have to carry
    // SOMETHING, but showing them an "온라인" badge told a lie: it reads as a
    // room you log into at a set hour. There is no hour and no room — teams
    // build whenever they like. The data keeps its Mode value; only the display
    // changes, so nothing downstream of `mode` has to know about this.
    selfPacedLabel: { ko: "자유 진행", en: "Your own pace" },
    // The event modal's "진행 방식" row, where there's space to say why.
    selfPacedMode: {
      ko: "자유 진행 · 정해진 시간·접속 없음",
      en: "Your own pace · no set time, nothing to join",
    },
    // Replaces the "N 세션" count on a day whose events are ALL self-paced —
    // counting sessions on a day with no sessions is the same misread again.
    selfPacedDay: { ko: "자율 진행", en: "Self-paced" },
    // Replaces the whole session card for self-paced build. Non-interactive on
    // purpose — there is nothing to open, because there is nothing to attend.
    selfPacedNote: {
      ko: "정해진 세션 없이, 팀별로 편한 시간에 빌드를 이어갑니다 — 출석·접속 없음",
      en: "No scheduled session — teams just keep building whenever suits them. Nothing to attend or join.",
    },
    // A day whose only entries are self-paced: there is no session to count.
    noSessions: { ko: "정해진 세션 없음", en: "No scheduled sessions" },
    pendingLabel: { ko: "현장 (미정)", en: "On-site (TBC)" },
    // 1:1 mentoring is arranged mentor by mentor — some meet at NUS in person,
    // others take it online. Neither plain badge is true for everyone.
    byMentorLabel: { ko: "대면·온라인 (멘토별)", en: "In person / online (by mentor)" },
    sessions: { ko: "세션", en: "sessions" },
    // English needs the singular for a one-session day. Korean has no plural, so
    // both forms are identical there — kept as a pair rather than a special case
    // in the component. (Only reachable since self-paced build stopped being
    // counted; before that no day was down to one.)
    session: { ko: "세션", en: "session" },
    swipeHint: {
      ko: "카드를 눌러 하루 일정을 펼쳐보세요",
      en: "Tap a day card to see its sessions",
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
          // NOT "주최사 FDE". FDEs are Popup Studio's, and their only slot here is
          // the Day 5–7 office hours — the Crash Course is Codepresso's, and its
          // body is a live build of one simple tool that the room follows along
          // with. Naming the company instead of a job title also keeps this line
          // out of the way of who is actually on the mic (schedule.ts
          // d2-crash-course carries that, and the two must agree).
          { ko: "코드프레소가 간단한 툴을 바이브 코딩으로 만드는 라이브 빌드 → 따라 하기", en: "Follow along as Codepresso builds a simple tool live, by vibe coding" },
          { ko: "모델 선택·프롬프트·용어 가이드 제공", en: "Model-choice, prompt and terminology guides" },
        ],
      },
      {
        num: "02",
        title: { ko: "실제 기업의 진짜 문제", en: "A real company's real problem" },
        points: [
          { ko: "출제가 아니라 ‘의뢰’ — 학생은 주니어 컨설턴트로 프로세스·아픔을 진단해 AI로 재설계", en: "Not a prompt but a brief — you're a junior consultant diagnosing a real process & pain, then redesigning it with AI" },
          { ko: "가상 과제가 아닌 파트너사의 실제 AX 문제 + 직원 피드백", en: "Not toy prompts — a partner's real AX problem + employee feedback" },
          // REMOVED: "트랙 구성 미확정 — 재무·영업·마케팅 3트랙으로 논의 중(잠정) ·
          // AWS 방법론으로 접근 · 클라이언트 사명도 조율 중". 트랙/클라이언트가 확정되기
          // 전까지는 표기하지 않습니다.
          // REMOVED: "모든 참가팀에게 실제 문제와 기업 담당자 브리핑 제공 (Day 2 라이브 브리핑)".
          // How the client contacts would actually deliver a per-track problem
          // briefing is not worked out, so the site no longer promises one. The
          // problems themselves still drop on Day 1 — that part is unchanged.
          // TODO: 문제 브리핑 방식 확정 시 복원 검토.
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
          { ko: "박희덕·원대로 대표님 등 연사 세션", en: "Speaker sessions with Park · Won and more" },
          { ko: "패널·공유 세션으로 technical 그 이상의 인사이트", en: "Panels & sharing sessions for more-than-technical insight" },
          // REMOVED: "Day 5 참가자 AI 유스케이스 발표 · QR 인기투표 (검토 중)" 및
          // "지속되는 한–싱 빌더 커뮤니티의 시작 멤버". 전자는 아직 미확정 세션
          // (schedule.ts의 d5-panel-usecase)이고, 후자는 확정된 약속이 아닙니다.
        ],
      },
      {
        num: "05",
        title: { ko: "수료증", en: "Certificate" },
        points: [
          // CONFIRMED policy — issuer, criterion and hand-out are all settled, so
          // none of these three lines carries a hedge. The criterion is FULL
          // attendance, not participation: never write "참여자 전원" here, or the
          // bar reads as "showed up once". Mirrored in the FAQ certificate item
          // and in schedule.ts (d2 crash course · d8 awards) — change all four.
          { ko: "Zero100 명의로 발급", en: "Issued by Zero100" },
          { ko: "크래시코스 전 시간 참석 시 · Day 8 시상 때 배부", en: "For attending the full Crash Course · handed out at the Day 8 awards" },
          { ko: "링크드인 · 포트폴리오 · 이력에 활용", en: "Use it on LinkedIn, in your portfolio and CV" },
        ],
      },
      {
        num: "06",
        title: { ko: "인턴십 · 상금", en: "Internships & prizes" },
        // Detail lifted to match the FAQ (they were a tier apart, and the FAQ was
        // the more specific of the two — the mismatch itself read as unreliable).
        // WHAT is on offer is settled; HOW MUCH and HOW MANY are not. Every line
        // carrying an amount or a headcount says so on the same line — a single
        // "잠정" at the end of the card lets a reader take the numbers as fixed.
        // Mirrored in the FAQ internship + prize items; change both together.
        points: [
          // NOT "FDE 인턴십". The internship itself is confirmed; what the intern
          // would actually DO is not decided yet, and naming a role we haven't
          // agreed sets an expectation the partners never made. Say the offer,
          // leave the job description to the line below. Same rule in both FAQ
          // answers (인턴십이 진짜인가요 / 상금이나 현금 지원) — change all three.
          { ko: "메인 트랙 각 1위 · AXMOS(코드프레소·WVB) 유급 인턴십 기회", en: "1st place in each main track · a paid internship with AXMOS (Codepresso · WVB)" },
          // The numbers that used to sit here ("겨울방학 약 1.5개월 · 트랙당 최대
          // 3명") were never agreed with the companies — they came from an early
          // deck. Timing in particular can only be settled between the student
          // and the company after the event, around that student's own term
          // dates, so a figure printed now would be a promise made on their
          // behalf. Note the line does NOT list what is undecided ("직무·기간·
          // 인원은 미정"): spelling out the gaps next to a prize reads as a
          // warning label. It says when the terms get set, and stops there.
          // Put a number back only when a partner has confirmed it.
          { ko: "행사 후 우승팀과 직접 협의", en: "Settled directly with the winning team after the event" },
          { ko: "2위 S$100 · 3위 널담 바우처 — 금액 확정 전", en: "2nd S$100 · 3rd Nuldam voucher — amounts not yet final" },
          // Both vouchers on this card are 널담 now — the 해녀의 부엌 one was dropped
          // from the incentives entirely. Keep the two lines saying the same
          // vendor; if one ever splits off again, the FAQ prize answer and
          // schedule.ts d5-panel-usecase carry the same sentence and move with it.
          { ko: "Day 5 AI Use Case Top 3 · 널담 바우처 · 논의 중", en: "Day 5 AI Use Case top 3 · Nuldam voucher · under discussion" },
          { ko: "굿즈 (pen·notes) 등 · 검토 중", en: "Goods (pens · notes) and more · under review" },
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
  },

  // ── 연사 · 공유 세션 (Day 1·7·8) ────────────────────────────────────────────
  speakers: {
    tag: { ko: "연사 · 공유 세션", en: "Speaker sessions" },
    // Days listed here must match the cards in `people` below. Day 5 was in the
    // heading with no card to back it — its only content was the panel in
    // tbcNote, whose panelists were never arranged.
    heading: { ko: "Day 1 · 7 · 8 — 스피커 & 공유 세션", en: "Day 1 · 7 · 8 — Speaker & sharing sessions" },
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
        linkedin: "https://www.linkedin.com/in/wondaero",
        points: [
          { ko: "정형화된 ‘취업 vs 창업’ 이분법에서 벗어나기", en: "Stepping past the tidy ‘employment vs. founding’ binary" },
          { ko: "벤처빌더가 본 다양한 진로·커리어 경로 탐색", en: "The many career paths a venture builder has seen" },
          { ko: "학생·비개발자도 시작할 수 있는 여러 갈래", en: "Routes even students and non-developers can start from" },
          { ko: "Q&A 포함 · 약 1시간 — ‘처음이어도 된다’ 동기부여", en: "About an hour with Q&A — a ‘first-timers welcome’ nudge" },
        ],
      },
      {
        // Second Day 1 card, placed right after the keynote so the four cards read
        // in day order (1 · 1 · 7 · 8). Backs `d1-aws-session` in data/schedule.ts —
        // that entry's summary and this card's points describe the same hour and
        // should move together.
        //
        // Content is from his own AI-DLC deck (Execution Research/Mentoring/
        // TalkFile_AIDLC-janghan.pdf): the SDLC-as-waiting problem, the 10–15%
        // velocity ceiling when AI is bolted onto coding alone, and AI-DLC as the
        // answer. Deliberately NOT included: the Kiro demo and the 3-day workshop
        // agenda in that deck — that deck is his multi-day enterprise workshop,
        // and this is a ~1h session. Promising a live tool demo we have not
        // scheduled would be a claim we can't keep.
        // Role is verbatim from that deck's title slide.
        //
        // THREE short bullets, not four long ones. This card ran at a different
        // altitude from its three siblings — theirs are one-line takeaways, this
        // one carried the deck's own phrasing ("Inception → Construction →
        // Operation · 팀이 한 화면에서 함께(Mob)"), which is process detail for
        // engineers inside a delivery org, not something a student choosing which
        // session to attend can use. The dropped phase/mob bullet is the deck's
        // method, not the session's promise; keep it out unless the session grows
        // into a workshop. Same rule as the sibling cards: what will I take away,
        // in one line.
        day: { ko: "Day 1 · AWS 세션", en: "Day 1 · AWS session" },
        name: { ko: "한장환", en: "Jang Whan Han" },
        role: { ko: "Well-Architected Solution Innovation SA, AWS", en: "Well-Architected Solution Innovation SA, AWS" },
        topic: { ko: "‘AI-DLC’ — AI가 주도하는 개발 라이프사이클", en: "“AI-DLC” — the AI-Driven Development Lifecycle" },
        img: "/partners/logos/speaker-han.jpeg",
        linkedin: "https://www.linkedin.com/in/jangwhan/",
        points: [
          { ko: "개발의 진짜 병목은 코딩이 아니라 기다리는 시간", en: "The real bottleneck isn't coding — it's waiting" },
          { ko: "AI를 코딩 보조로만 쓰면 속도는 10–15%에 그침", en: "AI as a coding assistant alone moves velocity 10–15%" },
          { ko: "AI가 계획·설계까지 주도하고, 검증·결정은 사람이", en: "Let AI drive planning and design; humans validate and decide" },
        ],
      },
      {
        // Same speaker as the Day 8 keynote — the career session is a separate
        // session on a separate day, so it gets its own card (see d7-speaker-session).
        day: { ko: "Day 7 · 커리어 간담회", en: "Day 7 · Career session" },
        name: { ko: "박희덕", en: "Park Hee-deok" },
        role: { ko: "CEO · General Partner, Translink Investment (VC)", en: "CEO · General Partner, Translink Investment (VC)" },
        topic: { ko: "‘FDE로 일한다는 것’ — 커리어 간담회", en: "“Working as an FDE” — a career session" },
        img: "/partners/logos/speaker-park.jpeg",
        linkedin: "https://www.linkedin.com/in/hee-duk-park-304079bb",
        points: [
          { ko: "자사 FDE 사업에 관심 있는 학생·졸업생 대상 · 12:30–14:00", en: "For students & grads interested in the firm's FDE business · 12:30–14:00" },
          { ko: "어떤 일을 하는 자리인지, 어떤 사람을 찾는지 직접 듣기", en: "What the work actually is, and who they're looking for — first-hand" },
          { ko: "인턴 · 채용 pool로 이어지는 실질적 연결", en: "A genuine connection into the internship & hiring pool" },
          { ko: "후속 1:1 면담·멘토링(희망자)은 8/29 행사 종료 후", en: "Follow-up 1:1s & mentoring (opt-in) after the event closes on 29 Aug" },
        ],
      },
      {
        day: { ko: "Day 8 · 데모데이", en: "Day 8 · Demo Day" },
        name: { ko: "박희덕", en: "Park Hee-deok" },
        role: { ko: "CEO · General Partner, Translink Investment (VC)", en: "CEO · General Partner, Translink Investment (VC)" },
        topic: { ko: "‘제로백의 진짜 의미’", en: "“The Real Meaning of Zero100”" },
        img: "/partners/logos/speaker-park.jpeg",
        linkedin: "https://www.linkedin.com/in/hee-duk-park-304079bb",
        points: [
          { ko: "0 → 100의 핵심 — 협업 · 가치 · 실행 · 글로벌 스탠다드", en: "The core of 0 → 100 — collaboration · value · execution · global standards" },
          { ko: "협업의 힘 · 커뮤니티의 중요성", en: "The power of collaboration · why community matters" },
          { ko: "왜 지금, 왜 싱가포르의 한인 학생인가", en: "Why now, and why Korean students in Singapore" },
          { ko: "데모데이 키노트 · 약 1시간", en: "Demo-Day keynote · about an hour" },
        ],
      },
    ],
    tbcNote: {
      ko: "* 세션 시간·구성은 조정될 수 있습니다.",
      en: "* Session times and format may still change.",
    },
  },

  // ── 멘토링 철학 ─────────────────────────────────────────────────────────────
  mentoring: {
    tag: { ko: "멘토링", en: "Mentoring" },
    // The heading used to be "멘토는 '학생 눈높이의 선배'" — a claim over the whole
    // section. With three stages that is no longer true: stage 2 is Popup
    // Studio's FDEs and stage 3 is working GTM/sales people, and calling either
    // a peer-level senior undersells them and misleads the reader. The
    // 눈높이/선배 framing now lives inside stage 1, where it is accurate.
    heading: { ko: "단계마다 다른 멘토가 붙습니다", en: "A different kind of mentor at each stage" },
    intro: {
      ko: "아이디어를 형태로 만들 때, 빌드가 막힐 때, 무대에서 팔아야 할 때 — 필요한 사람이 매번 다릅니다.",
      en: "Shaping the idea, unblocking the build, selling it on stage — each needs a different person in the room.",
    },
    // ── Three stages, one card each ─────────────────────────────────────────
    // The frame is the point: this is NOT a difficulty ladder. It tracks how a
    // product actually grows — shape the idea, then harden it, then learn to
    // sell it — which is why stage 3 is about delivery rather than a harder
    // version of stage 2.
    //
    // `day` strings must match the mentor cards' `days` badges below; the steps
    // are what makes those badges legible (3·4 = ideation, 7 = pitch & sales).
    // `phase` is read from data/schedule.ts at render time, so the 워밍업/실전
    // labels can never drift from the programme section.
    //
    // ONE stage = ONE card = label + `persona` (who you meet) + `role` (what the
    // time is for). Nothing else. This block used to be three stacked things —
    // a large "1단계 멘토 페르소나" card, an amber AXMOS aside, and four "멘토에게
    // 요청하는 것" cards — which buried the one fact a participant needs (who
    // shows up on which day) under recruiting-side copy. The persona that lived
    // in the big card is now inside stage 1, where it is actually true; the
    // aside's load-bearing sentence survives as `separationNote` below. Keep the
    // two sentences per card ONE sentence each: the whole point of this layout
    // is what it leaves out.
    stages: [
      {
        day: { ko: "Day 3·4", en: "Day 3·4" },
        phaseDay: 3,
        title: { ko: "아이디에이션", en: "Ideation" },
        persona: {
          ko: "한때 우리와 같았고, 같은 고민을 하던 한국 유학생 출신 또래 창업가·주니어 엔지니어.",
          en: "Peer founders and early-career engineers who were once exactly where you are — Korean students abroad.",
        },
        role: {
          ko: "정답이 아니라 같은 레벨의 context로 — 아이디어를 형태로 만드는 시간.",
          en: "Ideation with people who share your context, not lectures.",
        },
      },
      {
        day: { ko: "Day 5–7", en: "Day 5–7" },
        phaseDay: 5,
        title: { ko: "고도화", en: "Refinement" },
        // Stage 2 is Popup Studio's, NOT "AXMOS's" — Popup Studio is one member
        // of that consortium, and attributing its FDE office hours to AXMOS was
        // pre-pivot copy. Name the company here and everywhere else.
        persona: {
          ko: "Popup Studio의 FDE(Forward Deployed Engineer) — AI 제품을 현장에서 만드는 현업 엔지니어.",
          en: "Forward Deployed Engineers from Popup Studio — engineers who build AI products in the field.",
        },
        role: {
          ko: "온라인 오피스아워, 드롭인 방식. 빌드가 막히는 지점을 전문가와 풉니다.",
          en: "Drop-in online office hours for when your build hits a wall.",
        },
      },
      {
        day: { ko: "Day 7", en: "Day 7" },
        phaseDay: 7,
        title: { ko: "피치 · 세일즈", en: "Pitch & sales" },
        persona: {
          ko: "AWS 등 현직 GTM·세일즈 시니어.",
          en: "Senior GTM & sales professionals from AWS and beyond.",
        },
        role: {
          ko: "데모데이 전, 기술이 아니라 ‘어떻게 파는가’를 다듬습니다.",
          en: "Pre–demo day pitch sharpening — how to sell, not how to build.",
        },
      },
    ],
    // The one line kept from the amber aside that used to sit here. That aside
    // ran four clauses about who runs which day; the only part a participant
    // needed was this — mentoring hours are not assessed. Everything else it
    // said (AXMOS's roles, the Day 7 mentor/judge overlap) is already visible
    // in the programme section and on the cards themselves.
    // It is deliberately a footnote, not a card: it answers a worry, it isn't
    // information anyone came for.
    separationNote: {
      ko: "심사와 멘토링은 분리 운영됩니다 — 멘토링 시간은 평가와 무관해요.",
      en: "Judging and mentoring are kept separate — mentoring hours never affect your score.",
    },
    // ── 매칭 방식 안내 (그리드 바로 위) ────────────────────────────────────────
    // Expectation management: participants kept asking to be assigned a NAMED
    // mentor. Sessions are assigned by the organizers from the overlap between a
    // team's submitted availability and a mentor's — never by request. Stated
    // right above the mentor grid so the line-up reads as "who you might meet",
    // not "who you can pick". The reassurance sentence ("whoever you meet …") is
    // load-bearing: without it "no requests" reads as a restriction.
    // `**…**` marks the emphasized span — rendered by <Emph> in Journey.tsx.
    // TODO: 가용시간 수집 방식 확정 시 구체화 — the submission channel and timing
    // are not decided yet, so the copy says only "a scheduling survey announced
    // before the event".
    matchNote: {
      title: { ko: "멘토 매칭은 이렇게 배정돼요", en: "How mentor matching works" },
      body: {
        ko: "특정 멘토를 지정하는 방식이 아니에요. 행사 전 팀이 제출한 가능 시간과 멘토의 가능 시간이 **겹치는 구간**을 기준으로 운영진이 배정합니다. Day 5–7의 팝업스튜디오 오피스아워도 같은 방식입니다. 누구와 만나든 — 모든 멘토는 여러분이 푸는 그 문제를 미리 보고 들어옵니다.",
        en: "You don't pick a specific mentor. Sessions are assigned by the organizers where your team's submitted availability **overlaps** with a mentor's. Popup Studio's Day 5–7 office hours work the same way. And whoever you meet — every mentor comes in having already seen the problem you're solving.",
      },
    },
    // ── 확정 멘토 그리드 (덱 p12) ──────────────────────────────────────────────
    // Every object carries the SAME keys (img/logo/logoW/logoH/linkedin/daysPending
    // default to "" / 0) so the array stays a single homogeneous type — otherwise
    // TS infers a union and `m.linkedin` / `m.intro` can't be read on the cards.
    // The img/logo fields are now unused by the card (the avatar was dropped in
    // favour of the intro line) but stay on the type so the array shape matches
    // the judges' and a photo can be reinstated without a schema change.
    // The two host companies (Onword Lab · REmited) are represented by the SPECIFIC
    // founder(s) coming as mentors — not just a company logo — with names/titles
    // taken verbatim from their own LinkedIn profiles (not invented).
    // LinkedIn URLs are the mentors' public profiles.
    //
    // ORDER = the day they are with you (Day 1 → 2 → 3·4 → 7). This is the
    // order a participant meets them, which is the only ordering that means
    // anything on a page they read before the event. If a mentor's `days` change,
    // move the entry too — the grid renders the array as-is.
    //
    // `intro` is one line of NEW information, sourced from that person's own
    // LinkedIn (headline + experience) and nothing else. Rules that keep it
    // useful: never restate the org/role already printed above it on the card;
    // no honorifics or embellishment; no internal figures (revenue, targets) and
    // no contact details; keep it to roughly one 60–70 character Korean sentence
    // so it clamps to two lines. NO SCHOOLS — every alma mater and degree was
    // removed from these cards and from the judge bios on purpose: what a mentor
    // has BUILT is what a team needs to know before an hour with them, and a
    // university line invites students to rank the room by admissions instead.
    // Academic POSTS are career (한정필's professorship stays); degrees are not. If a profile can't be verified, leave `intro`
    // empty — the card drops the line rather than guessing.
    // daysPending marks a day that is confirmed-in-principle but not locked —
    // rendered as a separate amber pill. Nobody carries one right now (한장환 held
    // a pending Day 7 until it was dropped and he became Day 1 only); the field
    // and its pill stay, since this is the normal state for a newly added day.
    // TODO: confirm public naming — verify each named mentor may be shown publicly.
    gridLabel: { ko: "확정 멘토 · Confirmed", en: "Confirmed mentors" },
    dayPendingLabel: { ko: "협의 중", en: "TBC" },
    mentors: [
      // ── Day 1 ────────────────────────────────────────────────────────────────
      // 한장환: Day 1 ONLY. He used to also carry a pending Day 7 (daysPending);
      // that day is no longer his, so the pill is gone — he is the Day 1 AWS
      // speaker and nothing else. Do not re-add a Day 7 unless he is booked for it
      // again; the Day 3 event copy counts the mentoring seniors and moves with it.
      {
        name: { ko: "한장환", en: "Han Jang-whan" }, org: { ko: "AWS", en: "AWS" }, role: { ko: "SA", en: "SA" },
        intro: {
          ko: "싱가포르 근무 · 클라우드·인프라 18년+. 前 오라클 JAPAC · Dell EMC.",
          en: "Based in Singapore · 18+ yrs in cloud & infrastructure. Ex-Oracle JAPAC, Dell EMC.",
        },
        days: "Day 1", daysPending: "", img: "", logo: "", logoW: 0, logoH: 0, linkedin: "https://www.linkedin.com/in/jangwhan",
      },
      // ── Day 2 · 크래시코스 ───────────────────────────────────────────────────
      // Codepresso — runs the Day 2 Crash Course (see schedule.ts d2-crash-course,
      // where she is also the `speaker`). Day 2 is the day she is confirmed for, so
      // that is what the pill says; do not widen it to the 1:1 mentoring days
      // (Day 3·4·7) unless she is actually booked for them.
      // Title verbatim from his LinkedIn ("Director at Codepresso") — not inferred.
      // He replaced a colleague here when the Crash Course instructor changed;
      // if it changes again, this card and every 크래시코스 mention in
      // data/schedule.ts move together.
      // Codepresso is an AXMOS company. The amber aside that used to spell out
      // which days AXMOS runs is gone (the stage cards now say who is on each
      // day), so nothing above this grid needs re-checking when an AXMOS name is
      // added here — but the stage-2 card must keep naming POPUP STUDIO, not
      // AXMOS, as the FDE office-hours host.
      {
        name: { ko: "김지훈", en: "Jihoon Kim" }, org: { ko: "Codepresso", en: "Codepresso" }, role: { ko: "이사 · Director", en: "Director" },
        intro: {
          ko: "추천 시스템 · 스마트팩토리 데이터 7년+. 前 스마일게이트 · LG CNS.",
          en: "7+ yrs on recommender systems & smart-factory data. Ex-Smilegate · LG CNS.",
        },
        days: "Day 2", daysPending: "", img: "", logo: "", logoW: 0, logoH: 0, linkedin: "https://www.linkedin.com/in/jihoon-kim-613878134",
      },
      // ── Day 3·4 · 자율 빌드 1:1 ─────────────────────────────────────────────
      // Onword Lab — two founders as mentors.
      {
        name: { ko: "김진호", en: "Jinho Kim" }, org: { ko: "Onword Lab", en: "Onword Lab" }, role: { ko: "공동창업자 · CEO", en: "Co-founder · CEO" },
        intro: {
          ko: "유통·리테일 AI 전환(AX).",
          en: "AI transformation for retail & distribution.",
        },
        days: "Day 3·4", daysPending: "", img: "", logo: "", logoW: 0, logoH: 0, linkedin: "https://www.linkedin.com/in/kimjinho",
      },
      {
        name: { ko: "김시훈", en: "Sihoon Kim" }, org: { ko: "Onword Lab", en: "Onword Lab" }, role: { ko: "공동창업자 · CTO", en: "Co-founder · CTO" },
        intro: {
          ko: "커머스 운영 에이전트 시스템 개발.",
          en: "Agentic ops systems for commerce.",
        },
        days: "Day 3·4", daysPending: "", img: "", logo: "", logoW: 0, logoH: 0, linkedin: "https://www.linkedin.com/in/sihoon-kim-306551372",
      },
      // REmited (Team Remited) — CEO as mentor.
      {
        name: { ko: "Brian Bae", en: "Brian Bae" }, org: { ko: "REmited", en: "REmited" }, role: { ko: "CEO", en: "CEO" },
        // NOT "前 Antler" — he is an Entrepreneur in Residence AT Antler, which is
        // a current standing, not a past employment. "공동창업자" was dropped: the
        // card already prints "REmited · CEO" directly above, so it spent a line
        // restating the org line instead of adding anything.
        intro: {
          ko: "Google for Startups Accelerator 2026 선정 · Antler Entrepreneur in Residence.",
          en: "Google for Startups Accelerator 2026 · Entrepreneur in Residence at Antler.",
        },
        days: "Day 3·4", daysPending: "", img: "", logo: "", logoW: 0, logoH: 0, linkedin: "https://www.linkedin.com/in/brian-bae-ba638a131",
      },
      // YMX (XR·디지털 트윈 스타트업, 싱가포르) — 사업개발 총괄로 참여. Facts below are
      // from his own LinkedIn: Head of Business Development at YMX.INC since Jan
      // 2023 (also its PDPC Data Protection Officer — one title per card, so the
      // DPO role is not printed), KITRI Best-of-the-Best faculty mentor in digital
      // forensics & incident response since 2012, and 2006–2022 in forensics
      // (Douzon BizOn chief forensic analyst · Duzon ISS). Korea University.
      // `img` is set even though the mentor card doesn't render a photo — the
      // file is on hand, so the field is ready if the avatar ever returns.
      // NOTE: the Korean name is a transliteration of "JongHyun Kim" — confirm the
      // spelling with him before this goes out.
      {
        name: { ko: "김종현", en: "Joseph JongHyun Kim" }, org: { ko: "YMX", en: "YMX" }, role: { ko: "사업개발 총괄", en: "Head of Business Development" },
        intro: {
          ko: "XR·디지털 트윈 스타트업 · 싱가포르 근무. 디지털 포렌식 16년+ · KITRI BoB 멘토.",
          en: "An XR & digital-twin startup, based in Singapore. 16+ yrs in digital forensics · KITRI BoB mentor.",
        },
        days: "Day 3·4", daysPending: "", img: "/partners/people/joseph-jonghyun-kim.jpg", logo: "", logoW: 0, logoH: 0, linkedin: "https://www.linkedin.com/in/joseph-jonghyun-kim-009b244a",
      },
      // 황영준 · 이유택 were "Day 3·4·7" until their Day 7 was dropped — both are
      // stage-1 mentors only now, which is why there is no longer a Day 3·4·7
      // group between this block and the Day 7 one. Re-add the day (and move the
      // cards back out) only if they are actually booked for the career session.
      {
        name: { ko: "황영준", en: "Hwang Young-jun" }, org: { ko: "T3Q", en: "T3Q" }, role: { ko: "AI", en: "AI" },
        intro: {
          ko: "컴퓨터 비전·NLP 3년+. VLM 문서 처리·검색엔진 고도화.",
          en: "3+ yrs in computer vision & NLP. VLM document processing, search.",
        },
        days: "Day 3·4", daysPending: "", img: "", logo: "", logoW: 0, logoH: 0, linkedin: "https://www.linkedin.com/in/hopper0620",
      },
      {
        name: { ko: "이유택", en: "Lee Yoo-taek" }, org: { ko: "NTU", en: "NTU" }, role: { ko: "前 Naver", en: "ex-Naver" },
        intro: {
          ko: "SW 엔지니어 5년 — LLM 코드리뷰 봇·사내 RAG 구축.",
          en: "5 yrs as a software engineer — LLM code-review bots, internal RAG.",
        },
        days: "Day 3·4", daysPending: "", img: "", logo: "", logoW: 0, logoH: 0, linkedin: "https://www.linkedin.com/in/yutaek",
      },
      // Day 5–7 stage-2 mentoring is Popup Studio's, but it has NO card here:
      // this grid is named people you may be matched with 1:1, and Popup Studio
      // sends FDEs rather than a named mentor. It stays described in the section
      // intro above and as its own sessions in the programme (schedule.ts
      // d5/d6/d7-fde-office-hour) — do not re-add a card for it.
      // ── Day 7 · 커리어 세션 ─────────────────────────────────────────────────
      {
        name: { ko: "신동혁", en: "Shin Dong-hyuk" }, org: { ko: "AWS", en: "AWS" }, role: { ko: "GTM", en: "GTM" },
        intro: {
          ko: "GenAI 커뮤니케이션·CX APJC 총괄 · 7년+. 前 삼성전자 북미 5G 사업개발.",
          en: "Head of GenAI Communications & CX, APJC · 7+ yrs. Ex-Samsung Electronics 5G BD, North America.",
        },
        days: "Day 7", daysPending: "", img: "", logo: "", logoW: 0, logoH: 0, linkedin: "https://www.linkedin.com/in/donghyukshin",
      },
      {
        name: { ko: "이화영", en: "Lee Hwa-young" }, org: { ko: "AWS", en: "AWS" }, role: { ko: "Sales", en: "Sales" },
        intro: {
          ko: "싱가포르 근무. 前 브로드컴 어카운트 디렉터 · VMware 5년+.",
          en: "Based in Singapore. Ex-Broadcom account director; 5+ yrs at VMware.",
        },
        days: "Day 7", daysPending: "", img: "", logo: "", logoW: 0, logoH: 0, linkedin: "https://www.linkedin.com/in/hwayoung-lee-bbb79a134",
      },
      {
        name: { ko: "임석건", en: "Lim Seok-geon" }, org: { ko: "NetApp", en: "NetApp" }, role: { ko: "APAC", en: "APAC" },
        intro: {
          ko: "AWS 세일즈 스페셜리스트 4년+. 前 Rescale.",
          en: "AWS Sales Specialist, 4+ yrs. Ex-Rescale.",
        },
        days: "Day 7", daysPending: "", img: "", logo: "", logoW: 0, logoH: 0, linkedin: "https://www.linkedin.com/in/sugkun-lim",
      },
      // Codepresso — the two below are ALSO Day 8 judges (dict.judges.people).
      // That double role is disclosed by dict.mentoring.separationNote above:
      // judging and mentoring are run separately, so a Day 7 mentor may judge
      // while the mentoring hours themselves stay outside the scoring. Keep name,
      // org, role and LinkedIn identical to their judge cards — one person, two
      // surfaces. No judge appears among the Day 3·4 mentors; re-check that
      // whenever a mentor or judge is added.
      {
        name: { ko: "이동훈", en: "Lee Dong-hoon" }, org: { ko: "Codepresso", en: "Codepresso" }, role: { ko: "대표 · CEO", en: "CEO" },
        // The judge card carries the full bio; this line keeps only what a team
        // meeting him 1:1 needs, without repeating "Codepresso · 대표" above it.
        intro: {
          ko: "AI 코딩·역량진단 교육 플랫폼 운영. 前 스마일게이트 · LG전자 소프트웨어 엔지니어.",
          en: "Runs an AI-coding & skills-assessment education platform. Ex-Smilegate · LG Electronics engineer.",
        },
        days: "Day 7", daysPending: "", img: "/partners/people/lee-dong-hoon.jpg", logo: "", logoW: 0, logoH: 0, linkedin: "https://www.linkedin.com/in/donghun-lee-8888a13a",
      },
      // 황현진: LinkedIn headline is "Co-founder & Director & Content R&D Lead at
      // Codepresso" — the card prints ONE role segment, so 공동창업자 · 이사 goes here
      // and the 콘텐츠 R&D 총괄 line moves into the intro. Director since Jan 2020,
      // before that 9 years as an LG Electronics software engineer. 서강대.
      // NOTE: Korean name transliterated from "Hyunjin Hwang" — confirm the spelling.
      {
        name: { ko: "황현진", en: "Hyunjin Hwang" }, org: { ko: "Codepresso", en: "Codepresso" }, role: { ko: "공동창업자 · 이사", en: "Co-founder · Director" },
        intro: {
          ko: "콘텐츠 R&D 총괄. 前 LG전자 소프트웨어 엔지니어 9년.",
          en: "Content R&D lead. Ex-LG Electronics software engineer, 9 yrs.",
        },
        days: "Day 7", daysPending: "", img: "/partners/people/hwang-hyun-jin.png", logo: "", logoW: 0, logoH: 0, linkedin: "https://www.linkedin.com/in/hyunjin-hwang-40892697",
      },
    ],
  },

  // ── 심사위원 (덱 p13) ────────────────────────────────────────────────────────
  // Rendered as a subsection of the mentoring chapter (no new nav item). Bios are
  // tidied from the deck's own copy — NO facts added, EN is a translation. Every
  // person object carries identical keys to keep the array homogeneous. Everyone
  // has a face photo (img); 정요천 has no LinkedIn, so `linkedin` is "" (the card
  // simply drops the icon) rather than omitted — an omitted key would make TS
  // infer a union and break `j.linkedin` on the card. Same reason `pending` is
  // false on every confirmed judge instead of being left off the object.
  // TODO: confirm public naming — verify each name may be shown publicly.
  // Internal-only figures (e.g. Shin Sang-gil's "FY24 S$22M·+45%") are omitted.
  judges: {
    tag: { ko: "심사위원", en: "Judges" },
    heading: { ko: "심사는 현업 리더가 합니다", en: "Judged by working leaders" },
    sub: {
      ko: "실제 산업에서 문제를 풀어온 시니어 리더가 데모데이 결과물을 직접 심사합니다.",
      en: "Senior leaders who have solved real problems in industry judge the Demo-Day work first-hand.",
    },
    people: [
      {
        name: { ko: "박희덕", en: "Park Hee-deok" },
        org: { ko: "Translink Investment", en: "Translink Investment" },
        role: { ko: "대표 · General Partner", en: "CEO · General Partner" },
        tag: { ko: "美·韓 크로스보더 VC", en: "US–Korea cross-border VC" },
        img: "/partners/people/park-hee-deok.jpg",
        pending: false,
        bio: {
          ko: "트랜스링크인베스트먼트 대표 · GP. 前 CJ인베스트먼트 CIO · KT 신사업 · KTB네트워크 — 벤처투자·펀드운용 30년.",
          en: "CEO · GP, Translink Investment. Ex-CJ Investment CIO · KT new business · KTB Network — 30 yrs in venture investing · fund management.",
        },
        linkedin: "https://www.linkedin.com/in/hee-duk-park-304079bb",
      },
      {
        name: { ko: "원대로", en: "Won Dae-ro" },
        org: { ko: "Wilt Venture Builder", en: "Wilt Venture Builder" },
        role: { ko: "대표 · Managing Director", en: "CEO · Managing Director" },
        tag: { ko: "싱가포르 벤처스튜디오", en: "Singapore venture studio" },
        img: "/partners/people/won-dae-ro.jpg",
        pending: false,
        bio: {
          ko: "Wilt VB 대표 · d·camp 글로벌 어드바이저. 한–싱 스타트업 빌딩 · 동남아 크로스보더 투자. 前 KB자산운용 COO · KTB Asia MD — 25년+.",
          en: "MD, Wilt VB · d·camp global advisor. Korea–Singapore startup building · SEA cross-border investing. Ex-KB Asset Management COO · KTB Asia MD — 25+ yrs.",
        },
        linkedin: "https://www.linkedin.com/in/wondaero",
      },
      {
        name: { ko: "이병일", en: "Lee Byung-il" },
        org: { ko: "Wilt Venture Builder", en: "Wilt Venture Builder" },
        role: { ko: "Venture Partner · 한국대표", en: "Venture Partner · Korea Head" },
        tag: { ko: "헬스케어 · 바이오", en: "Healthcare · Bio" },
        img: "/partners/people/lee-byung-il.jpg",
        pending: false,
        bio: {
          ko: "헬스케어·바이오 창업가 · 글로벌 오픈이노베이션 전문가. 前 MUST 액셀러레이터 파트너 · AllLive Healthcare 창업(국내 1호 규제샌드박스).",
          en: "Healthcare·bio founder · global open-innovation specialist. Ex-MUST Accelerator partner · founder, AllLive Healthcare (Korea's first regulatory-sandbox case).",
        },
        linkedin: "https://www.linkedin.com/in/danielbyungillee",
      },
      // 한정필 (Jungpil Hahn) — `pending: true`, so the card carries an amber
      // dashed "협의 중" pill next to its topic tag. Flip `pending` to false the
      // moment he confirms; nothing else on the card changes. He sits 4th because
      // ARRAY ORDER IS THE ORGANISERS' SENIORITY ORDER, not a confirmed-first sort —
      // he was briefly kept last for that reason and moved here on request. Ask
      // before resequencing.
      //
      // Titles are verbatim from his own NUS department page (comp.nus.edu.sg/disa)
      // — "Provost's Chair Professor" in the Department of Information Systems and
      // Analytics, Director of the NUS FinTech Lab, Deputy Director of TRAIL (the
      // Centre for Technology, Robotics, AI & the Law). Secondary sources also
      // credit him with an AI Singapore AI-governance role; that one is NOT here
      // because his own page doesn't list it. The Fyreflyz co-founder line comes
      // from the organisers, not from a public source — Fyreflyz is already a
      // confirmed sponsor in the hero strip, which is the connection.
      {
        name: { ko: "한정필", en: "Jungpil Hahn" },
        org: { ko: "NUS Computing", en: "NUS Computing" },
        // The card prints "{org} · {role}", so keep the role to ONE segment — an
        // internal "·" here rendered as "NUS Computing · 석좌교수 · Provost's Chair"
        // and read like three separate affiliations. The full English title is in
        // the bio's first clause, which is where it belongs.
        role: { ko: "석좌교수", en: "Provost's Chair Professor" },
        tag: { ko: "AI 거버넌스 · 핀테크", en: "AI governance · FinTech" },
        img: "/partners/people/hahn-jungpil.jpg",
        pending: true,
        bio: {
          ko: "NUS 정보시스템·분석학과 석좌교수 · NUS 핀테크랩 디렉터 · NUS TRAIL(기술·로봇·AI·법 센터) 부센터장. Fyreflyz 공동창업자. 前 퍼듀대 교수.",
          en: "Director of the NUS FinTech Lab · Deputy Director of NUS TRAIL (technology, robotics, AI & the law). Co-founder, Fyreflyz. Ex-Purdue.",
        },
        linkedin: "https://www.linkedin.com/in/jungpil/",
      },
      {
        name: { ko: "이동훈", en: "Lee Dong-hoon" },
        org: { ko: "Codepresso", en: "Codepresso" },
        role: { ko: "대표 · CEO", en: "CEO" },
        tag: { ko: "AI 코딩 · 교육 플랫폼", en: "AI coding · education platform" },
        img: "/partners/people/lee-dong-hoon.jpg",
        pending: false,
        bio: {
          ko: "코드프레소 대표 — AI 코딩·역량진단 교육 플랫폼(AXMOS 컨소시엄). 비개발자 대상 바이브코딩·AX 교육 다수 운영. 前 스마일게이트 · LG전자 소프트웨어 엔지니어.",
          en: "Runs an AI-coding & skills-assessment education platform (AXMOS consortium). Many vibe-coding · AX programmes for non-developers. Ex-Smilegate · LG Electronics.",
        },
        linkedin: "https://www.linkedin.com/in/donghun-lee-8888a13a",
      },
      // Sits directly after 이동훈: same company, and the two come as a pair —
      // both are Day 7 mentors as well as judges (dict.mentoring.mentors).
      // Facts from her own LinkedIn ("Co-founder & Director & Content R&D Lead at
      // Codepresso", Director since Jan 2020, LG Electronics software engineer
      // Feb 2011 – Jan 2020, 서강대). The AXMOS clause is the same one 이동훈's bio
      // carries — it is the consortium her company belongs to, not a claim of her own.
      {
        name: { ko: "황현진", en: "Hyunjin Hwang" },
        org: { ko: "Codepresso", en: "Codepresso" },
        role: { ko: "공동창업자 · 이사", en: "Co-founder · Director" },
        tag: { ko: "AI 코딩 교육 · 콘텐츠 R&D", en: "AI coding education · content R&D" },
        img: "/partners/people/hwang-hyun-jin.png",
        pending: false,
        bio: {
          ko: "코드프레소 공동창업자 · 콘텐츠 R&D 총괄 — AI 코딩·역량진단 교육 콘텐츠 설계(AXMOS 컨소시엄). 前 LG전자 소프트웨어 엔지니어 9년.",
          en: "Co-founder · content R&D lead at Codepresso — designs its AI-coding & skills-assessment curriculum (AXMOS consortium). Ex-LG Electronics engineer, 9 yrs.",
        },
        linkedin: "https://www.linkedin.com/in/hyunjin-hwang-40892697",
      },
      {
        name: { ko: "신상길", en: "Shin Sang-gil" },
        org: { ko: "FUJIFILM BI Singapore", en: "FUJIFILM BI Singapore" },
        role: { ko: "고객성공 · DX/AI", en: "Customer Success · DX/AI" },
        tag: { ko: "DX · AI 컨설팅", en: "DX · AI consulting" },
        img: "/partners/people/shin-sang-gil.jpg",
        pending: false,
        bio: {
          ko: "후지필름 BI 싱가포르 고객성공 · DX/AI 컨설팅 총괄 — 금융·정부·제조. 前 HP 24년 — APJ 매니지드 서비스 · 잉크젯 제품 · 시장개발.",
          en: "Head of customer success · DX·AI consulting, FUJIFILM BI Singapore — finance · government · manufacturing. Ex-HP, 24 yrs — APJ managed services · inkjet · market development.",
        },
        linkedin: "https://www.linkedin.com/in/steveskshin",
      },
      {
        name: { ko: "신동혁", en: "Shin Dong-hyuk" },
        org: { ko: "AWS", en: "AWS" },
        role: { ko: "Head of GTM Scaling · APJC", en: "Head of GTM Scaling · APJC" },
        tag: { ko: "GenAI GTM", en: "GenAI GTM" },
        img: "/partners/people/shin-dong-hyuk.jpg",
        pending: false,
        bio: {
          ko: "AWS APJC GenAI 커뮤니케이션·CX GTM 총괄 — AWS 7년+. 前 삼성전자 북미 5G 사업개발.",
          en: "Head of GTM, GenAI Communications & CX APJC at AWS (7+ yrs). Ex-Samsung Electronics 5G BD, North America.",
        },
        linkedin: "https://www.linkedin.com/in/donghyukshin",
      },
      {
        // A bio has to say what someone DID, not what they are in charge of —
        // the first draft here listed her role and affiliations and told a reader
        // nothing. Both claims below are things she carried out, taken from her
        // own LinkedIn posts: "이번 AI 특강 3기를 진행하며…", "why we started Women
        // in Vibe Coding", "Watching this cohort from the very first session to
        // Demo Day", "Across Korea, Singapore, Vietnam, and now Luxembourg".
        // The GTM/partnerships title stays in `role` and is not repeated here.
        // Her headline is a description, not a formal title — "GTM · 파트너십 총괄"
        // renders it without inventing a rank.
        name: { ko: "백민정", en: "MJ Baek" },
        org: { ko: "Codepresso", en: "Codepresso" },
        role: { ko: "GTM · 파트너십 총괄", en: "Go-to-Market & Partnerships" },
        tag: { ko: "AI 리터러시 · 빌더 커뮤니티", en: "AI literacy · builder community" },
        img: "/partners/people/baek-min-joung.jpg",
        pending: false,
        bio: {
          ko: "코드프레소 GTM · 파트너십 총괄. ‘Women in Vibe Coding’ 공동 설립 · 4개국(한·싱·베·룩) 운영. 비개발 직군 AI 입문 특강 3기.",
          en: "GTM · partnerships, Codepresso. Co-founder, Women in Vibe Coding · 4 countries (KR · SG · VN · LU). Three cohorts, AI intro course for non-developers.",
        },
        linkedin: "https://www.linkedin.com/in/mjbaek",
      },
      {
        // Brie is PAST, not present: he led it as CEO/CTO and no longer does.
        // The org/role line therefore carries the current post — Popup Studio,
        // which is also the company running the Day 5–7 FDE office hours — and
        // Brie moves into the bio with the rest of the career history. Do not
        // put "Brie · 대표" back on the card without checking with him first.
        name: { ko: "정요천", en: "Jeong Yo-cheon" },
        org: { ko: "Popup Studio", en: "Popup Studio" },
        // "Head of Popup Studio" rendered as "Popup Studio · Head of Popup Studio"
        // — the card already prints the org, so the role stays a bare title.
        role: { ko: "총괄", en: "Head" },
        tag: { ko: "웹 · AI 풀스택", en: "Web · AI full-stack" },
        img: "/partners/people/jeong-yo-cheon.webp",
        pending: false,
        bio: {
          ko: "前 Brie 대표(CEO 겸 CTO) — 웹·AI 풀스택 개발사. 前 워프벤처스 CEO/CTO — 건축 매칭 플랫폼 · 딥러닝 추천. 前 산업은행(KDB) 기업금융.",
          en: "Ex-CEO/CTO of Brie, a full-stack web·AI studio. Ex-Warp Ventures CEO/CTO — construction matching platform · deep-learning recommendations. Earlier KDB corporate finance.",
        },
        linkedin: "",
      },
    ],
    // Amber dashed pill on a judge whose participation is agreed in principle but
    // not locked — the same convention as the mentor grid's daysPending pill, so a
    // reader who has scrolled past the mentors already knows what amber means.
    pendingLabel: { ko: "협의 중", en: "TBC" },
    // tbcLabel / tbcNote ("추후 공개 · 트랙별 심사위원 섭외 중") lived here for the two
    // dashed placeholder cards at the end of the grid. The panel is complete, so
    // the cards and their copy were both removed — restore the pair together if
    // judges are ever pending again.
  },

  modal: {
    // Header for the instructor block in an event modal (see BEvent.speakerProfile).
    runBy: { ko: "이 세션을 진행해요", en: "Who runs this session" },
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
    // Shown in the partner modal when the tile it replaced had an outbound link.
    companySite: { ko: "사이트 열기", en: "Visit site" },
    // Heading for the press-coverage link list in the partner modal.
    inTheNews: { ko: "관련 기사", en: "In the news" },
  },

  partners: {
    tag: { ko: "Partners", en: "Partners" },
    heading: { ko: "함께 만드는 사람들", en: "Built together" },
    note: {
      ko: "실제 기업 과제를 함께 제공하는 주최 컨소시엄 AXMOS(5개 사), SMU·NUS·NTU 한인 학생회의 주관·운영, 그리고 장소·마케팅·멘토링·굿즈를 맡아주는 후원사가 함께합니다. 각 파트너가 맡은 역할을 그대로 표기합니다.",
      en: "Built with AXMOS — the host consortium of five companies providing the real company problems — organized and run by the SMU · NUS · NTU Korean student associations, and supported by sponsors covering venue, marketing, mentoring and goods. Each partner is labelled with the role they actually play.",
    },
    // ── Tier 1 · 주최 · HOST (the AXMOS consortium) ──────────────────────────
    hostLabel: { ko: "주최 · HOST", en: "Host" },
    // Header line inside the AXMOS umbrella container (the wordmark "AXMOS"
    // renders separately, so the copy starts after the em-dash — no double name).
    axmosTagline: {
      ko: "5개 사가 결성한 AX 컨소시엄 · 실제 기업 과제를 함께 제공합니다",
      en: "an AX consortium of the five companies below, providing the real company problems",
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
    // One confirmed row, captioned by the role each sponsor plays — mirrors the
    // deck's partner slide. Role captions below.
    sponsorsLabel: { ko: "후원 · SPONSORS", en: "Sponsors" },
    sponsorConfirmedLabel: { ko: "확정 (Confirmed)", en: "Confirmed" },
    catVenue: { ko: "장소", en: "Venue" },
    catMarketing: { ko: "마케팅", en: "Marketing" },
    catJudges: { ko: "심사위원 지원", en: "Judges" },
    catMentoring: { ko: "멘토링", en: "Mentoring" },
    catGoods: { ko: "굿즈", en: "Goods" },
    // 싱가포르 한인회 only. Its caption said 심사위원 지원, which was wrong: the
    // association is helping with the venue and with goodie bags for the mentors,
    // and no judge comes through it. Two roles in one caption because the tile
    // takes a single label and neither half tells the truth alone.
    catVenueGoods: { ko: "장소 · 굿즈", en: "Venue · Goods" },
    catOverall: { ko: "종합 지원", en: "Overall support" },
    // Neutral stage pill shown inside the company-intro modal.
    stageConfirmed: { ko: "확정", en: "Confirmed" },
    stageNote: {
      ko: "* 파트너 구성은 2026년 7월 기준이며, 변동될 수 있습니다. 추가되는 후원·파트너십은 확정 시 안내됩니다.",
      en: "* The partner line-up is as of July 2026 and may change; further sponsorships/partnerships will be announced once confirmed.",
    },
    companionsHeading: { ko: "함께하는 빌더 네트워크", en: "Builder network" },
    companionsSub: {
      ko: "이 빌더톤의 시작점이 된 Zero100 빌더 네트워크와 이번 빌더톤의 파트너",
      en: "The Zero100 builder network this builderthon grew from — and this builderthon's own partners",
    },
  },

  // ── FAQ ────────────────────────────────────────────────────────────────────
  // ONE RULE, applied to every answer: the FIRST SENTENCE is the direct answer
  // to the question asked — 네/아니요, or a concrete number, date or condition.
  // Philosophy and background come after, in one or two sentences at most.
  // The previous set led with design rationale and made the reader dig for the
  // fact they came for; if you add or edit an item, front-load the answer.
  //
  // Numbers here are NOT independent copy — they mirror the benefits, judging
  // and schedule sections. Change one, change all of them.
  faq: {
    tag: { ko: "FAQ", en: "FAQ" },
    heading: { ko: "자주 묻는 질문", en: "Frequently asked" },
    items: [
      {
        q: { ko: "왜 8일이나 하나요? 해커톤치고 길지 않나요?", en: "Why 8 days? Isn't that long for a hackathon?" },
        a: {
          ko: "시간을 통으로 내야 하는 날은 사실 이틀입니다 — 필참은 Day 1(오프닝)과 Day 8(데모데이)뿐이고, 나머지는 각자 편한 시간에 하는 자율 빌드와 선택 참여 세션입니다. 8일로 늘린 건 매일 나오라는 뜻이 아니라, 학기 중에도 크래시 코스로 배우고 → 만들고 → 발표까지 가는 호흡을 만들기 위해서예요.",
          en: "Only two days actually need blocking out — Day 1 (opening) and Day 8 (Demo Day) are the only required ones. Everything else is self-paced building on your own time, plus optional sessions. Stretching it to eight days isn't asking you to show up daily: it's what makes room, mid-semester, for the full arc — learn at the crash course → build → present.",
        },
      },
      {
        q: { ko: "테마가 뭔가요? 너무 막연해요.", en: "What's the theme? It feels vague." },
        a: {
          // 브리핑은 Day 1(문제 공개 직후)이며 schedule.ts의 `d1-problem-deep-dive`와
          // 같은 사실을 말해야 합니다. 진행자·형식은 아직 조율 중이라 여기서도 확정으로
          // 쓰지 않습니다 — 특정 인물을 진행자로 명시하지 말 것(미확정).
          ko: "실제 한국 기업이 지금 겪고 있는 AX(AI 전환) 문제를 트랙별로 받아서 풉니다 — 예를 들어 ‘회사 돈이 어디서 새는지 눈에 안 보인다’ 같은 실무 문제요. 가상 과제가 아니라, Day 1에 문제가 공개되고 과제를 낸 주최사(AXMOS) 측이 배경을 직접 브리핑하는 ‘의뢰’입니다(진행자·형식은 조율 중). 트랙 구성은 메인 트랙 2개로 좁혀 논의 중이며 확정되는 대로 안내합니다.",
          en: "You take on the AX (AI-transformation) problems Korean companies are facing right now, one set per track — practical things like “we can't see where the company's money is leaking.” These aren't invented exercises but briefs: the problems drop on Day 1 and the host companies (AXMOS) that set them walk through the background first-hand (presenter and format still being arranged). The line-up has been narrowed to two main tracks, and we'll announce them once settled.",
        },
      },
      {
        q: { ko: "문과인데 이과생들에게 밀리지 않을까요?", en: "I'm not from a STEM major — will I fall behind?" },
        a: {
          ko: "아니요 — 코드 실력을 겨루는 대회가 아닙니다. 심사 배점의 75%가 문제 이해(20)·아이디어(25)·데모와 아이디어의 정합(30)이고, 프로토타입은 와이어프레임 수준이어도 됩니다. 산업 맥락을 아는 사람이 오히려 유리한 구조이고, 코딩 기본기는 Day 2 크래시코스에서 맞춰 드립니다.",
          en: "No — this isn't a contest of coding ability. 75% of the rubric is problem understanding (20), the idea itself (25) and how well the demo matches that idea (30), and a wireframe-level prototype is fine. The structure actually favours people who understand the industry context, and the Day 2 Crash Course levels the coding basics for everyone.",
        },
      },
      {
        // TODO: 발표 언어 방침 확정 시 문구 확정. 확정되면 "발표는 한국어로 해도
        // 됩니다"로 직답을 강화할 것 — 그 전까지는 아래의 보수적 표현을 유지한다.
        q: { ko: "‘해커톤’이라는 말이 부담돼요. 영어 발표도 자신 없어요.", en: "‘Hackathon’ feels intimidating, and I'm not confident presenting in English." },
        a: {
          ko: "발표 언어는 편한 쪽을 택할 수 있게 준비 중입니다 — 참가자와 심사위원님 모두 한인 커뮤니티 기반이에요. 그리고 이건 밤샘 해커톤이 아니라 8일에 걸쳐 만드는 빌더톤 — 완성도보다 ‘내 손으로 만들었다’를 보여주는 자리입니다.",
          en: "We're arranging it so you can present in whichever language you're comfortable in — both the participants and the judges come from the Korean community here. And this isn't an all-nighter hackathon but a builderthon built over eight days: it's about showing you made it yourself, not about polish.",
        },
      },
      {
        q: { ko: "수료증을 주나요? 의미가 있나요?", en: "Is there a certificate? Is it worth anything?" },
        a: {
          ko: "네 — 크래시코스 전 시간을 참석한 분들께 Zero100 명의의 수료증이 발급되고, Day 8 시상 때 배부됩니다. 링크드인·이력서에 올릴 수 있어요. 이미 개발 경험이 있다면 수료증보다 멘토링·네트워킹이 더 큰 수확일 거예요.",
          en: "Yes — everyone who attends the full Crash Course receives a certificate issued by Zero100, handed out at the Day 8 awards. It's LinkedIn- and CV-ready. If you already build, the mentoring and network will matter more than the paper.",
        },
      },
      {
        q: { ko: "인턴십이 진짜인가요? 유급인가요?", en: "Is the internship real? Is it paid?" },
        a: {
          // The internship is real and paid — that part is settled. The ROLE is
          // not: it used to say "FDE 인턴", which named a job nobody has agreed to
          // yet. The answer now says what is decided and says plainly that the
          // job description isn't, which is also what a reader is really asking.
          ko: "네, 실제로 추진 중인 유급 인턴십입니다 — 메인 트랙 각 1위 팀에게 AXMOS(코드프레소·WVB)의 유급 인턴 기회가 열립니다. 구체적인 조건은 행사가 끝난 뒤 회사와 학생이 학기 일정에 맞춰 직접 이야기해 정합니다. 인턴이 안 되더라도 Day 7 커리어 간담회가 인턴·채용 풀로 이어지는 별도 연결 통로예요.",
          en: "Yes — it's a paid internship we're actively arranging: the winning team in each main track gets a paid internship with AXMOS (Codepresso · WVB). The specifics are settled directly between the company and the students after the event, around their term dates. And even without the internship, the Day 7 career session is its own route into the internship and hiring pool.",
        },
      },
      {
        q: { ko: "혼자(1인) 참가해도 되나요?", en: "Can I take part solo?" },
        a: {
          ko: "됩니다 — 솔로로 등록하면 1인 팀으로 출전할 수 있어요. 원하면 팀 매칭도 신청할 수 있고(AI 유형 테스트 + Day 1 현장 그룹핑), 이미 팀이 있다면 2–3인 팀 등록으로 대표 1명이 한 번에 등록하면 됩니다.",
          en: "Yes — register solo and you compete as a one-person team. You can also opt into team matching (the AI personality test plus on-site grouping on Day 1), and if you already have a team, one person registers the whole 2–3 person group in one go.",
        },
      },
      // Mentor requests were the most common pre-event ask — answered next to the
      // solo/team question since both are about how you get placed.
      // TODO: 가용시간 수집 방식 확정 시 구체화 (제출 채널·시점은 아직 미정).
      {
        q: { ko: "멘토를 직접 고를 수 있나요?", en: "Can I choose my mentor?" },
        a: {
          ko: "멘토 지정은 받지 않아요. 팀이 제출한 가능 시간과 멘토의 가능 시간이 겹치는 구간으로 운영진이 배정합니다. 대신 모든 멘토가 여러분 트랙의 문제를 미리 보고 들어오고, Day 7 커리어 세션에서는 시니어 리더들과 만나는 시간이 따로 있어요.",
          en: "We don't take mentor requests. The organizers assign sessions where your team's submitted availability overlaps with a mentor's. Every mentor comes in having seen your track's problem, and Day 7 has its own career session with senior leaders.",
        },
      },
      {
        q: { ko: "상금이나 현금 지원이 있나요?", en: "Are there prizes or cash?" },
        a: {
          // 수료증은 이 목록에서 의도적으로 빠져 있습니다 — 발급 기준이 "크래시코스
          // 전 시간 참석"이라, 참가자 전원이 받는 항목과 나란히 두면 기준이 오해됩니다.
          ko: "네 — 시상은 메인 트랙 2개 각각에 1~3위로 걸립니다: 1위 유급 인턴십 기회 · 2위 S$100 · 3위 널담 바우처. Day 5 AI Use Case Top 3의 널담 바우처도 논의 중이에요. 참가비는 무료이고, 순위에 못 들어도 밥·굿즈·네트워킹은 전원에게 돌아가며 수료증은 크래시코스 전 시간을 들으면 받습니다. ※ 금액·인원 등 세부는 아직 확정 전이며 파트너 협의로 변경될 수 있어요.",
          en: "Yes — each of the two main tracks carries awards for 1st through 3rd: a paid internship for 1st, S$100 for 2nd and a Nuldam voucher for 3rd. A Nuldam voucher for the top 3 of the Day 5 AI Use Case session is also under discussion. Entry is free, and off the podium the food, goods and networking still go to everyone — the certificate comes with full Crash Course attendance. ※ Amounts, headcounts and other details aren't final and may change as partner discussions continue.",
        },
      },
      {
        q: { ko: "결과물이 실제로 쓰이나요? AI로 대충 만들면 어떡하죠?", en: "Will the results actually be used? What if it's just AI slop?" },
        a: {
          ko: "기업이 결과물 도입을 약속하는 건 아니에요 — 도입 가능성은 심사의 15%인 보조 항목입니다. 대신 우승팀은 인턴으로 그 문제를 실무에서 이어갈 기회(잠정)가 있고요. ‘AI로 대충’은 심사에서 걸러집니다 — 데모가 무대에서 실제로 돌아가는지(배점 30%)를 보고, 목업·슬라이드만이면 감점이에요.",
          en: "No company commits to adopting what you build — adoption feasibility is a secondary line worth 15% of the score. What the winning team does get is the chance (tentative) to carry that problem into real work as an intern. And “AI slop” doesn't survive judging: 30% of the score is whether the demo actually runs on stage, and mockups or slides alone lose points.",
        },
      },
      {
        q: { ko: "저는 개발 경험이 있는데 크래시코스가 필요 없어요.", en: "I already code — I don't need the crash course." },
        a: {
          ko: "크래시코스는 선택입니다 — 건너뛰고 Day 1 문제 공개 직후부터 바로 빌드에 들어가면 됩니다. 경험자를 위한 OpenAI Codex 워크샵(레포 연동·API·MCP)도 별도로 조율 중이에요.",
          en: "The Crash Course is optional — skip it and start building the moment the problems drop on Day 1. An OpenAI Codex workshop for experienced builders (repo integration, APIs, MCP) is being arranged separately.",
        },
      },
      {
        q: { ko: "제가 여기서 얻는 게 뭔가요?", en: "What do I actually get out of this?" },
        a: {
          ko: "손에 남는 것 기준으로: 실제 기업 문제를 8일간 풀어본 결과물, 크래시코스 수료증, 현직 선배들과의 1:1 멘토링, 데모데이 무대 발표 경험, 그리고 행사 후에도 이어지는 커뮤니티입니다. Day 7 커리어 세션에서는 시니어 리더들과 직접 만나요.",
          en: "In terms of what you actually walk away with: something you built against a real company's problem over eight days, the Crash Course certificate, 1:1 mentoring with people already working in the field, the experience of presenting on the Demo Day stage, and a community that keeps going after the event. The Day 7 career session puts you in front of senior leaders directly.",
        },
      },
      {
        q: { ko: "심사는 어떻게 하나요? 기술이 완벽해야 하나요?", en: "How is judging done? Does it need to be technically polished?" },
        a: {
          ko: "기술 완성도는 심사 기준이 아닙니다. 보는 것은 ‘회사·문제 이해 → 아이디어 → 데모의 정합성’이고, 배점은 회사·문제 이해도 20 · 아이디어의 적절성 25 · 데모↔아이디어 정합 30 · 도입 가능성 15 · 발표·전달 10 — 이해+아이디어+정합이 75%를 차지합니다. 프로토타입은 프론트엔드 와이어프레임 수준이어도 괜찮고, 목업·슬라이드만이면 감점됩니다. 배점은 심사위원님·파트너사 합의로 조정될 수 있습니다. 심사는 실제 산업에서 문제를 풀어온 현업 리더분들이 직접 합니다(심사위원 섹션 참조).",
          en: "Technical polish is not a judging criterion. What we look at is the coherence of ‘understanding the company & problem → idea → demo’, scored as: company/problem understanding 20 · appropriateness of the idea 25 · demo ↔ idea alignment 30 · adoption feasibility 15 · delivery 10 — understanding + idea + alignment make up 75%. A front-end wireframe-level prototype is fine; mockups or slides alone lose points. Weightings may be adjusted by agreement among judges and partners. Judging is done first-hand by leaders who have solved these problems in industry (see the judges section).",
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
    // Shown under the partnership CTA: `mailto:` does nothing when the visitor
    // has no mail client configured, so the address is also readable/copyable.
    partnerFallback: {
      ko: "메일 앱이 열리지 않으면 이 주소로 보내주세요 —",
      en: "If your mail app doesn't open, write to us at",
    },
    copy: { ko: "복사", en: "Copy" },
    copied: { ko: "복사됨 ✓", en: "Copied ✓" },
    hostedBy: {
      ko: "주관 SMU · NUS · NTU 한인 학생회  ·  Zero100 빌더 네트워크",
      en: "Organized by the SMU · NUS · NTU Korean Student Associations  ·  Zero100 builder network",
    },
    rights: {
      ko: "Zero100 AI Builderthon. All rights reserved.",
      en: "Zero100 AI Builderthon. All rights reserved.",
    },
  },

  toggle: {
    label: { ko: "EN", en: "한국어" }, // shows the language you'll switch TO
    aria: { ko: "Switch to English", en: "한국어로 전환" },
  },
};
