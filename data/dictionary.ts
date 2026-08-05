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
    ko: "AXMOS는 Translink Investment · Wilt Venture Builder · Codepresso · Popup Studio · DRIMAES 5개 사가 결성한 AX(AI 전환) 컨소시엄입니다. 이번 빌더톤의 실제 기업 과제 발의·멘토링·피드백을 함께 담당합니다.",
    en: "AXMOS is an AX (AI-transformation) consortium formed by Translink Investment, Wilt Venture Builder, Codepresso, Popup Studio and DRIMAES — jointly providing this builderthon's real company problems, mentoring and expert feedback.",
  },
  "Translink Investment": {
    ko: "실리콘밸리 트랜스링크캐피탈과 합작해 2016년 출범한 벤처캐피탈로, SaaS·딥테크 중심으로 7개 조합·누적 약 1,900억 원 규모를 운용합니다. 마켓컬리 초기 투자사로 알려져 있으며, 포트폴리오사의 글로벌 진출 지원이 강점입니다. 클로징 키노트를 맡은 박희덕 대표님이 이끄는 하우스입니다.",
    en: "A venture capital firm launched in 2016 with Silicon Valley's TransLink Capital, running seven funds (~KRW 190B) focused on SaaS and deep tech. An early investor in Market Kurly, known for helping portfolios expand globally — led by Hee-Duk Park, our closing-keynote speaker.",
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
    // "장소 지원"이 무엇인지 2026-08-04에 구체화됐습니다 — Day 3·4 1:1 멘토링의
    // 대면 진행이 이 회관에서 열립니다(schedule.ts MENTORING_MODE와 함께 움직일 것).
    ko: "1963년 설립된 싱가포르 한인 사회의 대표 단체로, 탄종파가에 자체 회관을 두고 장학 사업과 청년 멘토링·네트워킹 프로그램, 연례 한인 행사를 운영합니다. 이번 빌더톤에는 Day 3·4 1:1 멘토링의 대면 장소로 한인회관을 내어주고, 멘토 굿즈백 준비로 함께합니다.",
    en: "The representative body of Singapore's Korean community since 1963, with its own hall in Tanjong Pagar — running scholarships, young-professionals mentoring and the community's annual events. For the builderthon it opens that hall for the in-person Day 3·4 1:1 mentoring, and prepares goodie bags for the mentors.",
  },
  "Onword Lab": {
    ko: "‘We Make Old Businesses Young’을 내건 AI 전환(AX) 스타트업으로, 리테일·커머스의 운영과 마케팅을 AI로 다시 설계합니다. 이커머스 올인원 운영 에이전틱 대시보드를 만들고 있으며, 이번 빌더톤에는 멘토링으로 함께합니다.",
    en: "An AI-transformation startup — 'We Make Old Businesses Young' — redesigning retail and commerce operations and marketing with AI, building an agentic all-in-one e-commerce operations dashboard. Joining the builderthon as a mentoring partner.",
  },
  REmited: {
    ko: "영수증 리워드 앱으로 2천만 건 이상의 구매 데이터를 모아 브랜드에 초개인화 마케팅 솔루션을 제공하는 AI 커머스 스타트업(팀리미티드)입니다. CJ제일제당·이랜드리테일과 협업하며 구글·앤틀러 등의 지원 속에 동남아 진출을 준비 중이고, 이번 빌더톤에는 멘토링으로 함께합니다.",
    en: "An AI-commerce startup (Team REmited) whose receipt-reward app has gathered 20M+ purchase records, powering hyper-personalized marketing for brands like CJ CheilJedang and E-Land Retail. Backed by Google for Startups and Antler and eyeing Southeast Asia — joining as a mentoring partner.",
  },
  // 2026-08-03: 굿즈가 확정되면서 마지막 문장이 "굿즈를 함께 만듭니다"(무엇인지
  // 미정)에서 실제 품목으로 바뀌었습니다. 수량·선착순 조건은 여기 쓰지 않습니다 —
  // 이 카드는 파트너가 누구인지를 설명하는 자리이고, 받는 방법은 혜택 카드와 FAQ,
  // Day 1 일정이 말합니다. 물류(배송지·비용) 정보는 어디에도 쓰지 않습니다.
  "Brand Boost": {
    ko: "브랜드 굿즈·판촉물을 기획부터 제작·패킹까지 원스톱으로 만드는 제작 플랫폼입니다. 아이디어 단계의 구상을 구성·공정·단가가 잡힌 제작 플랜으로 바꿔 주는 것이 강점이며, 이번 빌더톤에는 참가자 굿즈(후드·캡 세트)를 제공하는 굿즈 파트너로 함께합니다.",
    en: "A one-stop platform for branded goods and merch — from planning through production and packing — turning rough ideas into concrete, costed production plans. Joining the builderthon as its goods partner, providing the participant hoodie + cap sets.",
  },
  // Figures are the ones Fyreflyz publishes on its own site (fyreflyz.com) —
  // since 2009, 2,000+ youths, 300+ partner organisations, 1,800+ jobs. The last
  // sentence is the reason the tile's caption is 피드백 패널 지원: their co-founder
  // 한정필 joins the Day 8 feedback panel (see dict.judges.people).
  Fyreflyz: {
    ko: "2009년 설립된 싱가포르의 소셜벤처 마케팅 에이전시입니다. 브랜드 진단·시장 분석부터 콘텐츠 실행까지 맡으면서, 교육을 마친 청년들을 실제 클라이언트 프로젝트에 투입하는 방식으로 일합니다 — 지금까지 청년 2,000명 이상, 파트너 기관 300곳 이상과 함께하며 1,800개 이상의 일자리를 만들었습니다. 이번 빌더톤에는 피드백 패널 연계로 함께합니다.",
    en: "A Singapore social-enterprise marketing agency founded in 2009. It runs brand audits, market analysis and content execution while embedding trained youths into real client projects — 2,000+ youths, 300+ partner organisations and 1,800+ jobs created so far. Supporting the builderthon through its feedback-panel connection.",
  },

};

// Press coverage shown as outbound links in a company's intro modal, keyed by the
// same tile `alt` / modal name as partnerIntros. Each label is the PUBLICATION
// (not an invented headline) so the link is honest about where it points. URLs
// are supplied verbatim by the user.
export type PartnerArticle = { url: string; label: Phrase };

// 언론 인용 한 줄 (dict.about.press). `logo`는 선택입니다 — 이 사이트의 로고는
// 전부 흰색으로 트림한 자산이라, 그 처리를 거치지 않은 매체까지 이미지로 넣으려면
// 색이 남은 파일을 어두운 배경에 얹게 됩니다. 자산이 없는 매체는 제호를 텍스트로
// 냅니다(렌더는 Journey.tsx의 press 블록). 나중에 트림한 로고가 생기면 그때 채우면
// 되고, 그 전까지 줄은 멀쩡히 읽힙니다.
export type PressItem = {
  outlet: string;
  date: Phrase;
  title: Phrase;
  url: string;
  logo?: string;
};
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
  // The phone's fixed bottom rail. It carries the two actions the funnel is built
  // on — the low-friction door (open chat) and the commitment (register) — and
  // borrows their labels from `nav` so the same door never has two names.
  // `quiz` ("✦ 내 유형은?") used to sit here and was removed: the quiz already has
  // two permanent entrances on a phone (the nav's ✦ chip and the hook card in the
  // 혜택 band), while open chat had none between the hero and the footer.
  stickyBar: {
    register: { ko: "등록하기", en: "Register" },
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
    // Q1 spine (2026-08-01): the one thing these eight days leave you is a real
    // company's real problem SOLVED and VALIDATED in front of that company and
    // working leaders — plus the artefacts that prove it. The old last sentence
    // ("zero에서 MVP까지, 데모로 끝나지 않는 '성공의 경험'") named a feeling and
    // left the reader to guess what they walk away holding. Same spine appears in
    // benefits.spine, judges.heading/sub and the "8일이 끝나면 뭐가 남나요" FAQ —
    // change them together.
    // SAY ONLY WHAT NOTHING ELSE IN THE HERO SAYS (2026-08-03). This opened with
    // "싱가포르에서 공부하는 한국 학생들이 8일간 … AI 빌더톤", which is the eyebrow
    // ("싱가포르 최초의 한인 학생 AI 빌더톤") and the date line ("… · 8일") read back
    // in sentence form — roughly half the paragraph restating its own neighbours.
    // Cut to the four things only this block carries, in the order a reader needs
    // them: what you actually do → how little of your August it costs → who you
    // prove it to → what you keep. Any addition here should have to displace one
    // of those four rather than sit alongside them.
    blurb: {
      ko: "실제 기업의 AI 전환(AX) 과제를 바이브 코딩으로 풉니다. 필참은 첫날과 마지막 날 이틀뿐 — 나머지는 팀이 편한 시간에 빌드해요. 마지막 날, 문제를 낸 기업과 현업 리더 앞에서 ‘내 아이디어가 돌아간다’를 증명하고 데모·피칭·수료증으로 남깁니다.",
      en: "Solve a real company's AI-transformation (AX) problem with vibe coding. Only day one and day eight are required — the rest is your team's own time. On the last day you show it running to the company that set the problem and to working leaders, and keep the demo, the pitch and the certificate."
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
    // 최신순입니다. 새 기사는 맨 위에 넣으세요 — 이 줄은 "이 이야기가 계속 다뤄지고
    // 있다"를 보이는 자리라, 가장 최근 것이 먼저 읽혀야 합니다.
    press: [
      // 경인일보 '수요광장' 칼럼. 온라인 입력 8/4, 지면은 8/5이고 방문자가 링크를
      // 눌렀을 때 화면에서 보는 날짜(입력일)를 씁니다.
      // 로고 없음 — 위 PressItem 주석 참고. 제호가 텍스트로 나갑니다.
      // 제목에서 섹션 라벨 "[수요광장]"은 뺐습니다. 칼럼 이름이지 기사 제목이 아니고,
      // 한 줄짜리 인용에서 대괄호가 먼저 눈에 걸립니다.
      {
        outlet: "경인일보",
        date: { ko: "2026.08.04", en: "4 Aug 2026" },
        title: {
          ko: "「‘취업 안되면 만든다’ 스물세살의 바이브 코딩」",
          en: "“If I can't get hired, I'll build it” — vibe coding at 23",
        },
        url: "https://www.kyeongin.com/article/1768469",
      },
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
    ] as PressItem[],
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
    // EN ONLY diverges from KR here. 한국어는 eyebrow "참가 대상"과 이 제목
    // "이런 분께"가 서로 다른 말이라 문제가 없는데, 영어는 둘 다 "Who should join"
    // 으로 번역돼 화면에서 같은 문구가 두 줄 연달아 찍혔습니다. eyebrow(섹션 이름)를
    // 유지하고 이 리스트 제목만 바꿉니다 — 리스트가 조건 나열이라 "This is for you
    // if"가 문법적으로도 이어집니다. KR은 건드리지 않습니다.
    whoTitle: { ko: "이런 분께", en: "This is for you if" },
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
    // entries in data/schedule.ts (Day 1 킥오프 · Day 8 결과 공유회); the six days
    // between are self-paced and mostly online, which is why the second half of
    // the sentence is there — without it this reads as an 8-day residency.
    requirement: {
      ko: "참가 조건은 하나예요 — Day 1(8/22 킥오프)과 Day 8(8/29 결과 공유회)은 싱가포르 현장 필참입니다. 그 사이 현장 일정은 Day 5·7 세션뿐이고(선택), Day 3·4 1:1 멘토링과 팀별 자율 빌드는 온라인으로 진행돼요.",
      en: "One condition: Day 1 (22 Aug, kick-off) and Day 8 (29 Aug, the Showcase) are in person in Singapore and required. The only other on-site days are the Day 5 and Day 7 sessions, and those are optional — the Day 3·4 1:1 mentoring and your team's own build time run online.",
    },
    // 준비물 — 참가비가 아니라 각자 준비해 오는 것. requirement(필참 2일) 바로
    // 아래, 등록을 결정하는 자리에 둡니다: 이걸 등록 후에 알게 되면 Day 1에 와서
    // 아무것도 못 만드는 사람이 생깁니다. 사이트에서 유일하게 '돈이 드는' 항목이라
    // 숨기지 않고 먼저 말하되, 자격 조건이 아니라 준비물로 씁니다(스크리닝 없음은
    // 그대로 사실).
    //
    // 금액은 적지 않습니다 — 벤더 가격은 지역·시점에 따라 다르고, 공개 페이지에
    // 틀린 숫자를 박아두는 쪽이 숫자가 없는 것보다 나쁩니다. "기본 유료 플랜"까지만.
    // "그 이상은 필요 없다"가 이 문단의 핵심입니다: 무게가 기술 완성도에 실리지
    // 않기 때문에(피드백 문서 — 프로세스 중심, 완성도·발표력은 보지 않음) API
    // 크레딧이나 상위 플랜이 필요하지 않습니다. 배점 수치는 아직 파트너 조율
    // 중이라 여기에 퍼센트를 쓰지 않습니다.
    prep: {
      ko: "준비물은 하나예요 — AI 코딩 도구를 쓸 수 있는 계정. Claude나 ChatGPT의 기본 유료 플랜 정도면 8일 내내 충분하고, 그 이상은 필요 없습니다. 크래시코스는 Codex를 기준으로 진행하지만 팀 빌드와 데모에 쓰는 도구는 자유예요.",
      en: "One thing to bring: an account you can vibe-code with. A basic paid plan on Claude or ChatGPT covers the whole eight days — nothing beyond that is needed. The crash course runs on Codex, but the tool you build and demo with is yours to choose.",
    },
    disclaimer: {
      ko: "* 일부 혜택(인센티브·멘토 라인업 등)은 파트너와 논의 중이며 확정 시 안내됩니다.",
      en: "* Some benefits (incentives, mentor line-up) are under discussion with partners and will be confirmed.",
    },
  },

  program: {
    tag: { ko: "Program", en: "Program" },
    heading: { ko: "8일, zero에서 MVP까지", en: "8 days, from zero to MVP" },
    // ── 최종 아웃풋 (프로그램 머리) ──────────────────────────────────────────
    // The page said what happens on each day and never said what a team hands in
    // at the end of it, so "8일, zero에서 MVP까지" left people building toward a
    // finished product. The deliverable is a proposal in three parts — read the
    // client's workflow, diagnose where it jams and how AI unjams it, and bring a
    // demo that backs the idea up. Stated once, right under the heading, so the
    // eight day-cards below are read as steps toward it.
    //
    // The demo is EVIDENCE, not the point: "완성도가 아니라 설득력" is the whole
    // reason this block exists, and it is the same claim the "피드백과 어워드는
    // 어떤 기준인가요" FAQ makes. If that answer moves, this moves too — but never
    // put the presentation's minute-by-minute split here; that guidance is
    // internal and not settled.
    outputTag: { ko: "최종 아웃풋", en: "The final output" },
    outputHeading: {
      ko: "공유회에 내는 건 코드가 아니라, 하나의 제안입니다",
      en: "What you present isn't code — it's a proposal",
    },
    outputSteps: [
      {
        title: { ko: "워크플로우 이해", en: "Read the workflow" },
        body: {
          ko: "의뢰 기업이 실제로 일하는 방식을 얼마나 정확히 읽었는가.",
          en: "How accurately you've read the way the client company actually works.",
        },
      },
      {
        title: { ko: "병목 진단 + AI 해법", en: "The bottleneck, and the AI fix" },
        body: {
          ko: "그 흐름의 어디가 막혀 있고, AI를 어떻게 접목하면 풀리는지 — 당신의 아이디어.",
          en: "Where that flow jams, and how AI unjams it — your idea.",
        },
      },
      {
        title: { ko: "증명하는 데모", en: "A demo that proves it" },
        body: {
          ko: "아이디어를 뒷받침하는 임팩트 있는 데모 — 완성도가 아니라 설득력.",
          en: "A demo with impact behind the idea — persuasive, not polished.",
        },
      },
    ],
    // ── 사전 제출물 (Day 7 저녁 마감) ──────────────────────────────────────
    // outputSteps says WHAT a team is arguing; this says what physically has to
    // be uploaded, by when, and what happens if it isn't. It is deliberately a
    // BOX and not a sentence in the Day 7 summary: it's a checklist, and a
    // checklist folded into prose inside an already-long day line is the thing
    // nobody reads. Rendered in the day modal, gated on
    // days[].deliverableDue in data/schedule.ts.
    //
    // The consequence line is the whole reason the box exists. Teams treat a
    // deadline with no stated cost as a soft one; the real cost here isn't a
    // penalty we invented, it's mechanical — the experts read the package
    // beforehand. Say that, not "감점".
    //
    // DECIDED 2026-08-05 (파트너 피드백): 경쟁형 데모데이 → 결과 공유회. 그러면서
    // 이 경고문의 논리 자체가 바뀌었습니다. 옛 논리는 공포였습니다 — "안 내면
    // 차갑게 심사받는다". 순위가 없는 자리에서는 그 협박이 성립하지 않고, 실제로
    // 잃는 것은 다른 겁니다: 사전에 읽고 온 사람만이 줄 수 있는 깊이의 피드백.
    // 공포가 아니라 손실로 씁니다.
    submission: {
      tag: { ko: "사전 제출물", en: "Submission package" },
      mustBadge: { ko: "필수", en: "Required" },
      heading: {
        ko: "Day 7 저녁 마감 — 네 가지를 올립니다",
        en: "Due Day 7 evening — four things to upload",
      },
      items: [
        {
          ko: "데모 영상 1–2분 — 실제 입력→처리→출력 화면",
          en: "1–2 min demo video — real input → processing → output on screen",
        },
        {
          ko: "문제 정의 카드 — 병목 한 문장 + 근거 숫자·출처 + 풀지 않은 것 + 성공의 정의",
          en: "Problem-definition card — the bottleneck in one sentence, evidence numbers and their source, what you didn't solve, your definition of success",
        },
        {
          ko: "설계요약 1장 — 담당자가 믿게 만드는 장치와 오판 대응",
          en: "One-page design summary — what makes the owner trust it, and what happens when it's wrong",
        },
        {
          ko: "베이스라인 비교 컷 1장 + 레포·배포 링크",
          en: "One baseline comparison shot + repo / deployment links",
        },
      ],
      warning: {
        ko: "내지 않아도 감점은 없습니다 — 다만 피드백을 주시는 전문가들이 사전 리뷰 없이 무대에서 처음 보게 되어, 받을 수 있는 피드백의 깊이가 그만큼 얕아져요.",
        en: "Miss it and there's no penalty — but the experts arrive without having reviewed anything, and the feedback you get on stage is only as deep as what they can take in cold.",
      },
    },
    // ── 체크인 폼 3종 ─────────────────────────────────────────────────────
    // Sits AFTER the eight day cards on purpose: the reader has just seen Day 4,
    // 6 and 7 go past, so "a form lands that evening" attaches to a day they
    // already have in their head. Above the cards it would be three more boxes
    // to parse before the programme itself.
    //
    // Roles only — NOT the question list. The forms' actual job is operational
    // (drift detection, unblocking, stage logistics); publishing all 31 questions
    // here would turn a landing page into a document and would go stale the
    // moment the forms are edited. Each card answers only: when does it arrive,
    // how long does it take, what is it FOR.
    //
    // The bonus line carries no numbers, same contract as the feedback FAQ — the
    // weights live in the feedback document, which as of 2026-08-04 IS disclosed
    // to participants before the event, but is still being settled. Copy stays
    // number-free so it can't go stale; the document carries the figures.
    // 한국어에서 "폼"을 쓰지 않습니다 (2026-08-04). 구글 폼 때문에 익숙하긴 해도
    // 카피에서는 콩글리시로 읽혀서, 문장은 행위로("여쭤봅니다", "받습니다")·
    // 이름은 성격으로(체크인 / 최종 제출) 바꿨습니다. 영어는 form이 맞는 단어라
    // 그대로 둡니다 — 이 섹션은 ko와 en이 일부러 다른 명사를 씁니다.
    checkins: {
      tag: { ko: "체크인", en: "Check-in forms" },
      heading: {
        ko: "8일 동안 세 번 여쭤봅니다",
        en: "Three forms across the eight days",
      },
      intro: {
        ko: "같은 설문을 세 번 받는 게 아니라, 질문이 ‘생각’에서 ‘증빙’으로 옮겨갑니다. 앞서 쓴 답이 다음으로 이월돼서, 같은 걸 두 번 쓰는 게 아니라 v1을 최종본으로 다듬게 돼요.",
        en: "It isn't the same survey three times — the questions move from what you're thinking to what you can show. Each form carries your previous answers forward, so you're not writing it twice; you're sharpening a v1 into the final.",
      },
      forms: [
        {
          id: "f1",
          when: { ko: "Day 4 저녁 발송", en: "Sent Day 4 evening" },
          duration: { ko: "5분", en: "5 min" },
          title: { ko: "중간 체크인", en: "Mid-point check-in" },
          body: {
            ko: "무엇을 풀기로 했는지 한 문장으로 고정하고, 막힌 팀을 Day 5–7 오피스아워로 연결합니다.",
            en: "Pins down what you've decided to solve in one sentence, and routes stuck teams into the Day 5–7 office hours.",
          },
        },
        {
          id: "f2",
          when: { ko: "Day 6 저녁 발송", en: "Sent Day 6 evening" },
          duration: { ko: "2분", en: "2 min" },
          title: { ko: "제출 D-1 체크인", en: "Submission D-1 check-in" },
          body: {
            ko: "내일 마감까지 남은 위험 요소를 짚고, 아직 안 풀린 막힘을 운영진이 바로 붙습니다.",
            en: "Surfaces what could still go wrong before tomorrow's deadline, so the organisers can step in on anything still blocking you.",
          },
        },
        {
          id: "f3",
          when: { ko: "Day 7 저녁 마감", en: "Due Day 7 evening" },
          duration: { ko: "15분", en: "15 min" },
          title: { ko: "최종 제출", en: "Final submission form" },
          body: {
            ko: "사전 제출물이 실제로 올라가는 곳이자, 공유회 무대 운영(발표자·장비·동의)도 여기서 함께 받습니다. 무엇을 내는지는 Day 7 카드에 있어요.",
            en: "Where the submission package actually gets uploaded — and where Showcase stage logistics (presenter, equipment, consent) are collected. What's in the package is on the Day 7 card.",
          },
        },
      ],
      // DECIDED 2026-08-05 (파트너 피드백): 경쟁형 데모데이 → 결과 공유회. 가산점이
      // 꽂힐 순위가 사라졌으므로 이 줄의 '행선지'를 바꿨습니다 — 점수가 아니라
      // 기록으로, 그리고 그 기록이 실제로 도착하는 두 곳(전문가 피드백 · 주최사의
      // 인턴십 검토)으로. 인턴십이 전원에게 열리면서 오히려 더 강한 문장이 됐습니다.
      // 오픈챗 티저(faq aTail)도 같은 논리로 맞춰져 있으니 함께 움직이세요.
      bonusLabel: { ko: "과정이 기록됩니다", en: "Your process counts" },
      bonus: {
        ko: "세 번의 응답과 오피스아워 참여는 과정 기록으로 남아, 전문가 피드백과 주최사의 인턴십 검토에서 그대로 참고됩니다 — 잘 쓴 답이 아니라, 과정을 남겼는지를 봅니다.",
        en: "Responding to the three forms and showing up to office hours leaves a trail of your process — one the experts' feedback and the hosts' internship review draw on directly. Not for writing good answers, but for leaving the trail.",
      },
    },
    // Second sentence is the one that changes behaviour: teams assume a hidden
    // correct answer and try to guess it. The company does have one; what it
    // wants is the approach that isn't on it.
    outputNote: {
      ko: "8일의 모든 세션은 이 세 가지를 완성해 가는 정거장입니다. 회사에는 ‘답지’가 있지만, 답지에 없던 접근을 가장 반깁니다.",
      en: "Every session across the eight days is a stop on the way to these three. The company has its own answer sheet — the approach that isn't on it is the one they want most.",
    },
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
      ko: "세션·연사·시간은 아직 조율 중이며, 확정되는 대로 이 페이지에 업데이트합니다.",
      en: "Sessions, speakers and times are still being worked out — this page is updated as each is confirmed.",
    },
    // Three rows, not a paragraph. The previous version said all of this in one
    // 4-sentence block and nobody finished it: the two facts that actually change
    // a decision — WHICH days you must attend, and WHERE the rest happens — were
    // buried mid-sentence behind qualifiers. A visitor scanning this needs to
    // answer "how much of my August does this take?" in about three seconds, and
    // a labelled list answers it; prose does not.
    // Keep it to three rows. Every exception that gets appended here (venue
    // names, mentor-by-mentor caveats, TBC markers) belongs on the day card or in
    // the session modal, which is where someone who wants that detail is already
    // looking.
    modeNote: {
      lead: {
        ko: "8일 내내 붙어 있는 일정이 아니에요.",
        en: "This isn't eight days you have to block out.",
      },
      // Labels stay ONE WORD in both languages — they sit in a shared grid column
      // that sizes to the longest of them, so "On-site · optional" would push the
      // English body into a ribbon on a phone. Qualifiers ("이 이틀뿐", "optional")
      // ride in the body instead, where there's room for them.
      rows: [
        {
          id: "required",
          label: { ko: "필참 2일", en: "Required" },
          body: {
            ko: "Day 1 오프닝 · Day 8 결과 공유회 — 싱가포르 현장",
            en: "Day 1 opening · Day 8 Showcase — in person in Singapore",
          },
        },
        {
          id: "onsite",
          label: { ko: "현장", en: "On-site" },
          body: {
            ko: "Day 5 네트워킹 데이 · Day 7 파이널 리허설 — 참여는 선택",
            en: "Day 5 Networking Day · Day 7 final rehearsal — optional",
          },
        },
        {
          id: "online",
          label: { ko: "온라인", en: "Online" },
          body: {
            ko: "크래시코스 · 1:1 멘토링 · 팀별 자율 빌드",
            en: "Crash course · 1:1 mentoring · your team's own build time",
          },
        },
      ],
    },
    // ── 정거장 원칙 (2026-08-03) ──────────────────────────────────────────
    // The fact that only two of the eight days are required lived in FOUR prose
    // places (hero paragraph · modeNote · FAQ · the 필참 badge) and in none of
    // the visual structure. Eight identically-weighted cards in a grid say
    // "eight days of programme" louder than any sentence says otherwise, and
    // the grid is what people scan. These three blocks put the same fact into
    // the layout: a route where two stops are terminals and six are optional,
    // a headline count, and an 선택 pill on every non-required card.
    //
    // EVERY number and every ★ here is derived from days[].mandatory in
    // data/schedule.ts. Nothing is hardcoded — if a day's mandatory flag flips,
    // the strip, the stats and the pills all follow. Do not type "2" into this
    // file.
    stats: {
      // Rendered as: big value + unit, small label beneath. Every count here is
      // ≥2 by construction (2 required / 6 optional / 4 online), so a plural-only
      // English unit is safe and avoids a pluralisation helper for three numbers.
      unit: { ko: "일", en: "days" },
      mandatory: { ko: "필참", en: "Required" },
      optional: { ko: "선택", en: "Optional" },
      // TWO stats only — 필참 + 선택, which sum to the whole 8. A third (온라인)
      // was here and removed: online-vs-on-site is a different question and
      // modeNote answers it properly one block down, so the number only diluted
      // the one thing this rule is for. Do not add a third.
      //
      // The note carries the on-site reassurance the removed stat was reaching
      // for, without asserting the programme is "온라인 중심" — it isn't, four of
      // the eight days are on-site (Day 1·5·7·8).
      note: {
        ko: "현장 4일 중 시간을 비워야 하는 날은 Day 1·8 이틀뿐이에요.",
        en: "Four days are on-site, but only Day 1 and Day 8 need blocking out.",
      },
    },
    route: {
      // The one-word-per-stop keyword is derived from days[].theme (first segment
      // before "·", parentheses stripped), so it can never drift from the card
      // heading below it.
      legendMandatory: { ko: "필참 정거장", en: "Required stop" },
      legendOptional: { ko: "선택 정거장", en: "Optional stop" },
      // spotlight 노드(schedule.ts days[].spotlight)용. 노선도에 세 번째 모양이
      // 생겼으니 범례에도 세 번째 줄이 있어야 합니다 — 설명 없는 모양은 "왜 저것만
      // 크지"가 됩니다.
      // 의무를 암시하는 낱말을 피합니다("필참"·"전원 참석" 등): 이 날들은 선택입니다.
      // 말하는 것은 의무가 아니라 왜 내려설 만한가입니다.
      //
      // 2026-08-05: Day 7(파이널 리허설)이 이 층에 합류하면서 문구를 일반화했습니다.
      // 직전 문구는 "학생끼리 제대로 교류하는 날"로 Day 5 전용이었고, 그대로 두면
      // Day 7 노드에 대해 범례가 거짓이 됩니다. 스포트라이트가 한 날에만 붙어 있는
      // 동안에만 그날을 서술할 수 있습니다 — 지금은 둘이라, 둘을 다 덮는 말이어야
      // 합니다. 각 날이 왜 특별한지는 카드의 whyStop 한 줄이 따로 말합니다
      // (Day 5 "학생끼리 교류하는 데 하루를 통째로", Day 7 "전문가들이 던질 질문을
      // 하루 전에"). 범례는 층을 설명하고, 카드는 그 날을 설명합니다.
      //
      // 앞의 두 줄과 같은 '정거장' 낱말을 씁니다 — 필참 정거장 / 선택 정거장 /
      // 놓치면 아까운 정거장. 셋이 한 체계로 읽혀야 세 모양이 한 축 위에 놓입니다.
      legendSpotlight: { ko: "놓치면 아까운 정거장", en: "Worth getting off for" },
      destination: {
        ko: "결과 공유회 — 기업·업계 전문가 앞 검증",
        en: "The Showcase — put it in front of the companies and the experts",
      },
      // The frame the whole section hangs on. Sized between the heading and
      // modeNote on purpose: it is the claim those four prose places were
      // making, said once where the structure can back it up. "정거장" is the
      // load-bearing word — a stop you choose to get off at, not a day you
      // failed to attend. Keep it.
      principle: {
        ko: "하루하루는 이 무대로 나아가는 정거장 — 방문은 당신의 선택입니다. 시간을 비워야 하는 날은 Day 1·8 이틀뿐.",
        en: "Each day is a stop on the way to that stage — which ones you get off at is your call. Only Day 1 and Day 8 need blocking out.",
      },
      // The other half of the principle, and the guardrail on it. Saying six of
      // eight days are optional, and stopping there, invites the reading that
      // those six are padding — which would be a worse outcome than the "eight
      // days of obligation" misread this whole block exists to fix. This line
      // says what the six ARE: each was built to be worth choosing, because it
      // makes the thing you hand in on Day 8 better. Keep it immediately under
      // the principle; separated, either half reads wrong.
      // 2026-08-04: 가운데 부연("결과물을 더 의미 있게 만들기 위해 직접 고르는
      // 준비 과정이자 중간 정거장이고")을 덜어냈습니다. 그 자리는 이제 카드가
      // 맡습니다 — 각 선택일 카드에 '올 이유' 한 줄(days[].whyStop)이 붙어서,
      // 이 문단은 주장만 하고 증명은 바로 아래 그리드가 합니다. 부연을 다시
      // 붙이면 같은 말을 문단과 카드가 두 번 하게 됩니다.
      optionalValue: {
        ko: "나머지 여섯 정거장은 그냥 늘어난 일정이 아니에요 — 하나하나 내려설 이유가 있도록 설계했습니다.",
        en: "The other six stops aren't schedule padding — each was designed to be worth getting off for.",
      },
      ariaLabel: { ko: "8일 노선도", en: "The 8-day route" },
    },
    // Sits in the same slot as the ★필참 pill and must stay quieter than it —
    // the point is "you may skip this", not "this day is filler". Neutral tone,
    // no colour: colour here would make optional days compete with the two
    // anchors, which is the exact misread being fixed.
    optionalBadge: { ko: "선택", en: "Optional" },
    dayLabel: { ko: "Day", en: "Day" },
    // Label on the wide band above Lab 1. "사전" rather than "Day 0" — the
    // session is a prologue to the eight days, not a day of them.
    preEventTag: { ko: "사전 세션 · 8/13", en: "Pre-event · 13 Aug" },
    tapHint: { ko: "자세히 보기", en: "View details" },
    confirmedBadge: { ko: "확정", en: "Confirmed" },
    mandatoryBadge: { ko: "필참", en: "Required" },
    onlineLabel: { ko: "온라인", en: "Online" },
    offlineLabel: { ko: "현장", en: "In person" },
    // dayMode "mixed" — a day that is genuinely half online, half on-site.
    // UNUSED right now: Day 3·4 carried it while their mentoring defaulted to
    // in-person F2F, and both went back to plain 온라인 when that default flipped.
    mixedLabel: { ko: "온라인 · 현장", en: "Online · in person" },
    // ── Self-paced (category "build") ──────────────────────────────────────
    // Build events carry mode "online" in the data because they have to carry
    // SOMETHING, but showing them an "온라인" badge told a lie: it reads as a
    // room you log into at a set hour. There is no hour and no room — teams
    // build whenever they like. The data keeps its Mode value; only the display
    // changes, so nothing downstream of `mode` has to know about this.
    // ONE NAME FOR ONE THING (2026-08-03). This used to read 자유 진행 here,
    // 자율 진행 two keys down, 자율 빌드 on Day 3·4 and 오픈 빌드 on Day 6 — four
    // Korean words and five English ones for the same non-event, which made
    // three identical days look like three different regimes. Canonical now:
    //   activity = 자율 빌드 / self-paced build
    //   badge    = 자율 진행 / Self-paced
    // Keep the 자율 root. Do not reintroduce 자유 진행 or 오픈 빌드.
    selfPacedLabel: { ko: "자율 진행", en: "Self-paced" },
    // The event modal's "진행 방식" row, where there's space to say why.
    selfPacedMode: {
      ko: "자율 진행 · 정해진 시간·접속 없음",
      en: "Self-paced · no set time, nothing to join",
    },
    // Replaces the "N 세션" count on a day whose events are ALL self-paced —
    // counting sessions on a day with no sessions is the same misread again.
    selfPacedDay: { ko: "자율 진행", en: "Self-paced" },
    // Replaces the whole session card for self-paced build. Non-interactive on
    // purpose — there is nothing to open, because there is nothing to attend.
    selfPacedNote: {
      ko: "자율 빌드 — 정해진 세션도, 출석도, 접속도 없습니다. 팀이 각자 비는 시간에 원하는 만큼만 이어가면 돼요.",
      en: "Self-paced build — no scheduled session, no attendance, nothing to join. Teams pick it up in whatever free time they have, for as long as they want.",
    },
    // A day whose only entries are self-paced: there is no session to count.
    noSessions: { ko: "정해진 세션 없음", en: "No scheduled sessions" },
    pendingLabel: { ko: "현장 (미정)", en: "On-site (TBC)" },
    // 1:1 mentoring is arranged mentor by mentor, and the DEFAULT is now online
    // (Aug 2026 — enough mentors can only make an online slot). The badge led
    // with "대면 기본" while that was the promise; leading with the wrong
    // default is what makes people plan a trip they don't need. "멘토별" keeps it
    // honest for the mentors who do offer F2F (at the Korean Association hall).
    byMentorLabel: { ko: "온라인 기본 (멘토별)", en: "Online by default (by mentor)" },
    sessions: { ko: "세션", en: "sessions" },
    // English needs the singular for a one-session day. Korean has no plural, so
    // both forms are identical there — kept as a pair rather than a special case
    // in the component. (Only reachable since self-paced build stopped being
    // counted; before that no day was down to one.)
    session: { ko: "세션", en: "session" },
    // Accessible name for the day card's hours pill. The pill itself shows only
    // the window ("1PM–4:30PM") — short enough to read at a glance, but with no
    // label a screen reader announces a bare time next to two other pills. The
    // VALUE is not translated: `days[].hours` is one string for both locales
    // (see DayMeta.hours), so only this prefix is bilingual.
    hoursLabel: { ko: "현장 시간", en: "On-site hours" },
    // 데이 모달의 진행 순서 블록 (days[].runOfShow). 확정된 날에만 렌더되므로
    // "추후 안내" 같은 빈 상태 문구는 없습니다 — 없으면 블록 자체가 없습니다.
    runOfShowTitle: { ko: "진행 순서", en: "Run of show" },
    // 시간표 줄 중 세션 카드로 이어지는 줄에 붙는 접근성 힌트. 화면에는 → 하나만
    // 보이고, 스크린리더는 이 문장을 읽습니다.
    runOfShowOpen: { ko: "세션 자세히 보기", en: "Open this session" },
    swipeHint: {
      ko: "카드를 눌러 하루 일정을 펼쳐보세요",
      en: "Tap a day card to see its sessions",
    },
  },

  // ── 참가 혜택 · WHY JOIN (6 benefits) + 참여 플로우 + 인센티브 ──────────────
  benefits: {
    tag: { ko: "참가 혜택", en: "Why Join" },
    heading: { ko: "참가하면 무엇을 얻나요?", en: "What you get by joining" },
    // MOBILE ONLY. The six cards carry 3–5 bullets each, and fully expanded they
    // were the second-longest block on a phone. Collapsed to two bullets, a card
    // still reads as a complete claim (title + the point that matters most), and
    // tapping it opens the rest. Desktop never collapses — there the cards sit
    // three-up and the full list is what makes them comparable.
    expand: { ko: "더 보기", en: "Show more" },
    collapse: { ko: "접기", en: "Show less" },
    // Q1 spine (2026-08-01). This section listed six benefits side by side, which
    // read as six reasons of equal size — and the actual answer to "what do I get"
    // was scattered across cards 02 and 03 and the feedback-panel section, never stated in
    // one sentence. The spine block states it once, up front; the six cards below
    // it become what makes that one thing REACHABLE (crash course = you can build
    // at all, mentoring = you don't get stuck, certificate = it's provable,
    // networking = it doesn't end on Day 8). Card order and numbering unchanged.
    //
    // `spineTangibles` are the three things a participant physically leaves with.
    // Keep them concrete: a feeling ("성공의 경험") is what this replaced. The
    // certificate's condition is NOT restated here — it lives on card 05 and in
    // the FAQ, both worded "크래시코스 전 시간 참석 시"; a second, looser wording
    // here would quietly lower the bar.
    spine: {
      tag: { ko: "이 8일이 남기는 단 하나", en: "The one thing these 8 days leave you" },
      heading: {
        ko: "실제 기업의 진짜 문제를 풀고, 그 기업과 업계 전문가 앞에서 검증받은 경험.",
        en: "You solve a real company's real problem — and have it validated in front of that company and industry experts.",
      },
      tangibles: [
        { ko: "돌아가는 데모", en: "A demo that runs" },
        { ko: "무대 위 피칭", en: "A pitch on stage" },
        { ko: "수료증", en: "A certificate" },
      ],
    },
    // Reframed with the spine: the six cards are not six parallel perks, they are
    // the things that put that one experience within reach of someone who has
    // never built anything. The no-screening promise stays — it is the first
    // barrier this section removes.
    intro: {
      ko: "아래의 모든 것 — 크래시코스, 멘토링, 수료증, 네트워킹 — 은 이 하나의 경험을 누구나 가질 수 있게 만드는 장치입니다. 스크리닝·사전 평가 없이, 개발 경험이 없어도 환영합니다.",
      en: "Everything below — the crash course, the mentoring, the certificate, the network — exists to put that one experience within anyone's reach. No screening, no pre-assessment, and no dev experience needed.",
    },
    items: [
      {
        num: "01",
        title: { ko: "개발 경험 없어도 OK", en: "No dev experience needed" },
        points: [
          // "Codex 기반"만 있으면 이 카드 제목("개발 경험 없어도 OK") 바로 아래에서
          // 진입장벽으로 읽힙니다 — 초보는 "Codex를 따로 사야 하나", 경험자는
          // "난 Claude Code 쓰는데 여긴 OpenAI 행사인가"로. 두 사실은 항상 붙어
          // 다녀야 해서 줄을 나누지 않고 한 줄로 씁니다. 카드는 모바일에서 앞 두
          // 줄만 보이므로 새 포인트를 추가하면 접혀서 안 보입니다.
          { ko: "Codex 기반 beginner-friendly 크래시 코스 — 이후 빌드 툴은 자유", en: "A Codex-based, beginner-friendly crash course — your own build isn't tied to it" },
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
          // WHAT the brief actually contains. "실제 기업의 진짜 문제" was a claim
          // with nothing behind it — a reader had no way to picture what lands on
          // Day 1. These three items (워크플로우 · 페인포인트 · 맥락과 데이터) are
          // what makes the 주니어 컨설턴트 framing above possible; without them it
          // is a prompt with a nicer name. Same fact as the 테마 FAQ answer.
          { ko: "문제는 ‘AX 의뢰서’로 — 실제 업무 워크플로우, 담당자의 페인포인트, 맥락과 데이터가 함께 Day 1에 공개", en: "The problem arrives as an AX brief — the real workflow, the owner's pain points, plus context and data, released on Day 1" },
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
          // The spine, said once more where the "성공" claim is actually made —
          // this card used to describe a feeling and stop there.
          { ko: "문제를 낸 기업과 업계 전문가 앞에서 검증 — 데모·피칭·수료증으로 남습니다", en: "Validated in front of the company that set the problem and industry experts — and it stays with you as a demo, a pitch and a certificate" },
          { ko: "군 입대 전 첫 성공 · 전역 후 재도전 동력", en: "A first win before enlistment · momentum to return after service" },
        ],
      },
      {
        num: "04",
        title: { ko: "네트워킹", en: "Networking" },
        // 또래가 첫 줄인 이유 (2026-08-03 피드백): 이 카드의 세 포인트가 전부
        // 대표·경력자·연사와의 수직 네트워킹이었고, 정작 이 행사의 핵심 혜택인
        // 학생 간(수평) 네트워킹은 혜택 섹션 어디에도 없었습니다. 같은 피드백으로
        // Day 5가 네트워킹 데이로 재편됐으니(schedule.ts) 순서도 그 결론을 따릅니다:
        // 또래 → Day 5 → 선배. 모바일에서는 앞의 두 줄만 보이고 나머지는 '더 보기'로
        // 접히므로(BenefitCard: i > 1 && !open), 접힌 채로 읽히는 두 줄이 또래와
        // Day 5여야 합니다. 순서를 되돌려 선배 교류를 위로 올리지 마세요.
        points: [
          { ko: "NUS·NTU·SMU에 흩어져 있던 또래 한인 빌더들 — 팀으로 만나 8일을 함께 만듭니다", en: "The Korean student builders scattered across NUS, NTU and SMU — you meet them as a team and build the eight days together" },
          // Day 5의 상태 표기는 schedule.ts(네트워킹 데이 (기획 중) · 해시드와 함께
          // 기획 중)와 반드시 같이 움직여야 합니다. 확정 전까지 '기획 중'을 떼지 마세요.
          // "전원이 처음 한자리에 모이는 날"이었습니다 — 사실이 아닙니다. Day 1이
          // 필참 현장이라 전원은 첫날 이미 만납니다. Day 5의 값은 '처음'이 아니라
          // 하루를 통째로 학생 간 교류에만 쓴다는 것입니다.
          { ko: "Day 5는 통째로 네트워킹 데이 — 학생끼리 교류하는 데만 하루를 쓰는 날, 해시드와 함께 기획 중", en: "Day 5 is a networking day end to end — a whole day given to students connecting with each other, being planned together with Hashed" },
          // 기존 세 줄(대표·경력자 현장 교류 / 연사 세션 / 패널·공유 세션)을 한 줄로
          // 압축했습니다. 셋 다 같은 이야기(선배와의 수직 교류)였고, 또래를 위에
          // 세우려면 그 자리를 만들어야 했습니다.
          { ko: "대표·현직 경력자와의 현장 교류와 연사·패널 세션 — Day 1·5·7·8", en: "In-person exchange with founders and working seniors, plus speaker and panel sessions — Days 1·5·7·8" },
          // REMOVED: "Day 5 참가자 AI 유스케이스 발표 · QR 인기투표 (검토 중)" 및
          // "지속되는 한–싱 빌더 커뮤니티의 시작 멤버". 후자는 확정된 약속이 아니고,
          // 전자의 세션은 2026-08-03 Day 5가 네트워킹 데이로 재정의되며 아예
          // 사라졌습니다 — 둘 다 되살리지 마세요. 특히 커뮤니티 약속은 비전 섹션이
          // 맡는 서사입니다(거기서는 "설계하고 있습니다"로 헤지되어 있고, 혜택 카드에
          // 놓이면 확정된 혜택으로 읽힙니다). 참가 인원 숫자도 쓰지 않습니다 —
          // 사이트 전체가 규모 숫자를 의도적으로 피합니다.
          // "Day 1·5·7·8 현장 교류"는 유지: Day 5가 네트워킹 날이 되면서 오히려 더
          // 정확해진 문장이라, 압축된 셋째 줄이 그대로 물려받았습니다.
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
          // 배부 시점 표기는 "Day 8 시상 때"였는데, 순위형 시상이 폐지되면서
          // (2026-08-05) 시상이라는 순간 자체가 사라졌습니다 — 발급 기준은 그대로,
          // 배부는 그날 마무리 세션에서 이뤄집니다.
          { ko: "Zero100 명의로 발급", en: "Issued by Zero100" },
          { ko: "크래시코스 전 시간 참석 시 · Day 8 마무리 세션에서 배부", en: "For attending the full Crash Course · handed out at the Day 8 closing" },
          { ko: "링크드인 · 포트폴리오 · 이력에 활용", en: "Use it on LinkedIn, in your portfolio and CV" },
        ],
      },
      {
        num: "06",
        title: { ko: "인턴십 · 어워드", en: "Internships & awards" },
        // DECIDED 2026-08-05 (파트너 피드백): 경쟁형 데모데이 → 결과 공유회. 순위형
        // 시상 폐지·테마형 어워드(부문 pending)·인턴십 전원 개방.
        //
        // 이 카드는 1·2·3위를 순서대로 나열하던 자리였습니다. 순위가 사라지면서
        // 나열할 대상 자체가 없어졌고, 남은 것은 "무엇이 걸려 있는가"뿐입니다 —
        // 테마형 어워드 · 인센티브 · 인턴십 · 굿즈. WHAT is on offer is settled;
        // 부문 구성도, 금액도, 인원도 전부 미정이라 어느 줄에도 숫자를 쓰지 않습니다.
        //
        // "부문 구성은 확정되는 대로 안내" 헤지는 사이트 전체에서 딱 세 곳입니다 —
        // 이 카드, FAQ 상금 답변, schedule.ts d8-final-pitch description. 부문이
        // 확정되면 그 세 곳만 갈아끼우면 되고, 네 번째 자리를 만들면 확정 시
        // 쫓아다녀야 합니다.
        //
        // 널담 바우처는 3위 시상이 사라지며 자리를 잃었습니다 — 인센티브 바우처로
        // 편입될지는 미정이라 실명 표기를 뺐습니다. (해녀의 부엌 바우처는 그 전에
        // 인센티브에서 빠졌고, "Day 5 AI Use Case Top 3 · 널담 바우처"는 2026-08-03
        // Day 5가 네트워킹 데이로 재정의되며 삭제됐습니다 — 둘 다 되살리지 마세요.)
        // Mirrored in the FAQ internship + award items; change them together.
        points: [
          // NOT "FDE 인턴십". The internship itself is confirmed; what the intern
          // would actually DO is not decided yet, and naming a role we haven't
          // agreed sets an expectation the partners never made. Say the offer,
          // leave the job description to the line below. Same rule in both FAQ
          // answers (인턴십이 진짜인가요 / 상금이나 현금 지원) — change all three.
          //
          // 인턴십 대상이 "메인 트랙 각 1위 팀"에서 "참가자 전원"으로 바뀌었습니다
          // (2026-08-05). 행사에서 잘하는 것과 실무에서 잘하는 것이 다르다는 파트너
          // 판단이고, 그래서 검토 기준도 등수가 아니라 '행사 과정과 제출물'입니다.
          // CONFIRMED 2026-08-05: AXMOS(코드프레소·WVB) 실명 표기 가능 — 바뀐 것은
          // 대상 범위(1위 팀 → 전원)이지 인턴십을 여는 회사가 아닙니다. 실명은 FAQ
          // 인턴십 답변과 여기 두 곳에만 두세요.
          { ko: "테마형 어워드 — 1·2·3위 순위 대신 각 팀의 강점을 조명 · 부문 구성은 확정되는 대로 안내", en: "Thematic awards — spotlighting each team's strengths instead of a 1st–3rd ranking · categories announced once set" },
          { ko: "어워드 인센티브는 현금·식사 바우처 형태로 주최사가 지원 — 규모 확정 전", en: "Award incentives come as cash or dining vouchers from the hosts — amounts not yet final" },
          { ko: "AXMOS(코드프레소·WVB) 유급 인턴십 기회 — 수상과 무관하게 모든 참가자에게 열려 있습니다 · 주최사가 행사 과정과 제출물을 바탕으로 직접 검토", en: "A paid internship with AXMOS (Codepresso · WVB) — open to every participant, awards or not · the hosts review interest on the strength of your work across the event" },
          // CONFIRMED 2026-08-03 (브랜드부스트 미팅): 후드+캡 세트 60개, Day 1 전
          // 도착 확정, 현장 선착순. 이전 줄("굿즈 (pen·notes) 등 · 검토 중")은
          // 품목도 진행 여부도 미정이던 시절의 표기라 헤지가 붙어 있었습니다 —
          // 확정된 지금은 헤지를 붙이지 않습니다. 수량(60)과 '선착순'은 세트로
          // 유지하세요: 이 카드의 다른 줄과 달리 여기는 전원에게 가지 않습니다.
          // 배송·비용 등 물류 정보는 사이트에 쓰지 않습니다.
          { ko: "브랜드부스트 굿즈 — 후드·캡 세트, Day 1 현장 선착순 60세트", en: "Brand Boost goods — a hoodie + cap set, 60 sets on a first-come basis on Day 1" },
        ],
      },
    ],
    flowTitle: { ko: "참여 플로우", en: "How it flows" },
    flow: [
      { ko: "참가 신청", en: "Apply" },
      { ko: "8일 빌더톤", en: "8-day builderthon" },
      { ko: "결과 공유회", en: "Showcase" },
      { ko: "네트워크 · 경험 · 성장", en: "Network · experience · growth" },
    ],
    // DECIDED 2026-08-05 (파트너 피드백): 경쟁형 데모데이 → 결과 공유회. 이 줄은
    // "시상은 상위 팀"으로 끝나면서 앞의 세 스텝을 예선처럼 읽히게 만들었습니다.
    // 어워드가 순위를 매기지 않으니 대조 자체가 성립하지 않습니다 — 전원 vs 상위
    // 팀이 아니라, 전원 vs 각 팀의 강점입니다.
    flowNote: {
      ko: "네트워크·경험·성장은 참가자 전원 · 어워드는 순위가 아니라 각 팀의 강점에.",
      en: "Network, experience and growth for everyone · awards go to strengths, not rankings.",
    },
  },

  // ── 연사 · 공유 세션 (Day 1·7·8) ────────────────────────────────────────────
  speakers: {
    tag: { ko: "연사 · 공유 세션", en: "Speaker sessions" },
    // Days listed here must match the cards in `people` below. Day 5 was in the
    // heading with no card to back it — its only content was the panel in
    // tbcNote, whose panelists were never arranged. That panel is gone for good
    // now (2026-08-03: Day 5 became a networking day), so Day 5 stays out.
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
          // 시각을 여기서 뺐습니다 (2026-08-04). schedule.ts의 d7-speaker-session
          // `time`과 Day 7 runOfShow에 이미 있는데, 세 번째 사본이던 이 줄만
          // 12:30–14:00으로 남아 실제로 어긋났습니다 — 간담회는 13:40에 끝나고
          // 뒤 20분은 촬영입니다. 이 섹션은 "무슨 이야기를 하는가"를 말하는 자리이니
          // 시각은 프로그램 쪽 한 곳에만 둡니다. 다시 넣지 마세요.
          { ko: "자사 FDE 사업에 관심 있는 학생·졸업생 대상", en: "For students & grads interested in the firm's FDE business" },
          { ko: "어떤 일을 하는 자리인지, 어떤 사람을 찾는지 직접 듣기", en: "What the work actually is, and who they're looking for — first-hand" },
          { ko: "인턴 · 채용 pool로 이어지는 실질적 연결", en: "A genuine connection into the internship & hiring pool" },
          { ko: "후속 1:1 면담·멘토링(희망자)은 8/29 행사 종료 후", en: "Follow-up 1:1s & mentoring (opt-in) after the event closes on 29 Aug" },
        ],
      },
      {
        day: { ko: "Day 8 · 결과 공유회", en: "Day 8 · Showcase" },
        name: { ko: "박희덕", en: "Park Hee-deok" },
        role: { ko: "CEO · General Partner, Translink Investment (VC)", en: "CEO · General Partner, Translink Investment (VC)" },
        topic: { ko: "‘제로백의 진짜 의미’", en: "“The Real Meaning of Zero100”" },
        img: "/partners/logos/speaker-park.jpeg",
        linkedin: "https://www.linkedin.com/in/hee-duk-park-304079bb",
        points: [
          { ko: "0 → 100의 핵심 — 협업 · 가치 · 실행 · 글로벌 스탠다드", en: "The core of 0 → 100 — collaboration · value · execution · global standards" },
          { ko: "협업의 힘 · 커뮤니티의 중요성", en: "The power of collaboration · why community matters" },
          { ko: "왜 지금, 왜 싱가포르의 한인 학생인가", en: "Why now, and why Korean students in Singapore" },
          // 위치·길이 정정 (2026-08-04): 확정 진행 순서에서 이 키노트는 여는
          // 순서가 아니라 두 트랙 발표가 끝난 뒤 어워드 발표 직전 40분입니다. 이 줄이
          // schedule.ts d8-opening-keynote와 같은 사실을 말해야 합니다.
          { ko: "모든 발표가 끝난 뒤 · 어워드 발표 직전 40분", en: "After every pitch · 40 minutes before the awards" },
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
    // ── 멘토링 그룹 (두 박스 + 워밍업 줄) ────────────────────────────────────
    // Replaces the three stage cards that stood here. Those cards described the
    // arc well but sat ABOVE an undivided grid of thirteen mentors, so a reader
    // still had to match day pills by eye — and the click-to-filter interaction
    // that tried to fix it was a second mechanism for something the layout can
    // just do. Grouping the mentors physically says the same thing with no
    // affordance to discover: 만들 때 돕는 사람 / 팔 때 돕는 사람.
    //
    // `stages` on each group is the JOIN KEY back to `mentors[].stages`
    // (1 = Day 3·4, 2 = Day 5–7, 3 = Day 7). Nothing counts people: add or
    // remove a mentor and they land in the right box on their own. A mentor with
    // an empty `stages` (Day 1·2) belongs to neither box and appears in the
    // warm-up strip above them.
    //
    // The persona/role copy from the old cards is not thrown away — it carries
    // over as each group's `sub`/`note`, which is where it now does its work.
    warmup: {
      label: { ko: "워밍업 · Day 1–2", en: "Warm-up · Day 1–2" },
      // A strip, not a box: these two run sessions (Day 1 AWS talk, Day 2
      // 크래시코스) rather than 1:1 mentoring, so giving them a box the size of
      // the other two would overstate what they are here to do.
      note: {
        ko: "1:1 멘토링 전, 출발선을 맞추는 세션을 맡습니다.",
        en: "They run the sessions that level the start line, before the 1:1s begin.",
      },
    },
    groups: [
      {
        id: "build",
        stages: [1, 2],
        dayRange: { ko: "Day 3–6", en: "Day 3–6" },
        title: { ko: "빌드 멘토링", en: "Build mentoring" },
        theme: { ko: "만들 때 돕는 사람들", en: "The people who help you build" },
        // Two-verb contract (2026-08-02): stage 1 = help them BUILD the thing
        // (scope, evidence, unblock — direction can still change), stage 3 = help
        // them PROVE it (3-min pitch structure, judges questions, final submission
        // check — direction is frozen). Keep the verbs distinct; do not let
        // build-stage advice language leak into the Day 7 blurb or vice versa.
        //
        // NO PEER/AGE CLAIM (2026-08-03). This said "또래 창업가·주니어 엔지니어"
        // and the cards below contradict it: 김종현 is 16년+ in digital forensics
        // and a KITRI BoB mentor, and three of the six are founders/CEO/CTO. The
        // group's shared trait is having shipped product, not being the same age
        // as the students — describe them by that. Re-check this line whenever a
        // stage-1 mentor is added.
        sub: {
          ko: "아직 방향을 바꿀 수 있는 구간의 멘토링입니다. 제품을 직접 만들어 온 창업가·현업 엔지니어와 — 여러 병목 중 하나를 고르고, 버릴 것을 정하고, 그 선택을 제공 데이터로 뒷받침합니다. 정답을 주는 자리가 아니라 같은 문제를 놓고 ‘나라면 이렇게 했을 수도’를 나누는 자리이고, 빌드가 막히면 팝업스튜디오 엔지니어(FDE 오피스아워)와 함께 풀어요.",
          en: "This is mentoring while the direction can still change. With founders and working engineers who have built and shipped products themselves — you pick one bottleneck, decide what NOT to solve, and back that choice with the provided data. It's not an answer-giving session but a ‘here's how I might have done it’ conversation over the same problem — and when the build gets stuck, Popup Studio's engineers (FDE office hours) work through it with you.",
        },
        // "메인 멘토링 파트너" is load-bearing, not decoration: most of the cards
        // in this box are NOT Onword people (REmited · YMX · T3Q · NTU), and two
        // logos over a list of faces reads as an org chart unless the label says
        // otherwise.
        partnersLabel: { ko: "메인 멘토링 파트너", en: "Main mentoring partners" },
        // `logoClass` is OPTICAL sizing, not a uniform cap. Capping both marks at
        // the same height is what made Popup Studio look like a footnote next to
        // Onword Lab: Onword is a long single-line wordmark (900×92, aspect ~9.8)
        // and Popup is a stacked block (512×245, aspect ~2.1), so at equal height
        // the wordmark carries four times the ink. Taller for the stacked mark
        // brings the two to similar visual weight — the same reasoning the hero
        // partner strip applies with its area-based sizing.
        // No `chip` here on purpose. Each mark used to carry its day span
        // ("Day 3·4 아이디에이션" / "Day 5–7 FDE 오피스아워"), which said again what
        // this box's own heading and the programme below already say — a credit
        // panel reading as a third schedule. If a partner's span ever needs
        // stating, the session it runs is where it belongs.
        partners: [
          {
            name: "Onword Lab",
            logo: "/partners/logos/white/trimmed/onword-lab.png",
            logoW: 900,
            logoH: 92,
            logoClass: "h-6 sm:h-7",
          },
          {
            name: "Popup Studio",
            logo: "/partners/logos/white/trimmed/popup-studio.png",
            logoW: 512,
            logoH: 245,
            logoClass: "h-11 sm:h-12",
          },
        ],
        // Placeholder card at the end of this box's grid. Popup Studio sends FDEs
        // rather than named mentors, so there is nobody to list yet — and an
        // invented name would be the one thing this page has never done. The copy
        // is the old stage-2 card's, which described exactly this.
        placeholder: {
          title: { ko: "FDE 오피스아워 · 멘토 명단 공개 예정", en: "FDE office hours · mentors to be announced" },
          body: {
            ko: "Popup Studio의 FDE(Forward Deployed Engineer)가 온라인 오피스아워를 엽니다 — 드롭인 방식이라 지정 멘토 없이, 빌드가 막히는 지점을 현업 엔지니어와 함께 풀어요.",
            en: "Popup Studio's Forward Deployed Engineers keep online office hours — drop in with no assigned mentor and work through whatever your build is stuck on.",
          },
        },
      },
      {
        id: "pitch",
        stages: [3],
        dayRange: { ko: "Day 7", en: "Day 7" },
        title: { ko: "피치 · 세일즈 멘토링", en: "Pitch & sales mentoring" },
        theme: { ko: "팔 때 돕는 사람들", en: "The people who help you sell it" },
        // "AWS 등 현직 GTM·세일즈 시니어" alone stopped being true as this box filled
        // up: it now also holds an AI-education platform's founders (이동훈 · 황현진)
        // and a studio head (정요천). What they share isn't a job title, it's that
        // they sell something for a living — say that instead of listing one role.
        // Two-verb contract (2026-08-02): stage 1 = help them BUILD the thing
        // (scope, evidence, unblock — direction can still change), stage 3 = help
        // them PROVE it (3-min pitch structure, the questions the Day 8 experts
        // will ask, final submission check — direction is frozen). Keep the verbs
        // distinct; do not let build-stage advice language leak into the Day 7
        // blurb or vice versa.
        sub: {
          // 인용문을 풀어 쓴 이유 (2026-08-04): 원래 "프롬프트 한 줄로 한 것과 뭐가
          // 다르죠?"였는데, 패널에 서는 전문가(정요천 님)조차 이 축약형의 의미를
          // 되물었습니다. 전문가가 되묻는 문장을 학생이 제대로 읽을 리 없습니다. 실제 질문은
          // "학생 팀이 프롬프트를 한 줄만 썼느냐"가 아니라 "기업 담당자가 그냥 범용
          // LLM에 물어봐서 얻는 답 대비, 이 솔루션이 무엇을 더 하느냐"입니다 —
          // 비교 대상이 학생의 노력이 아니라 담당자의 대안이라는 게 요지라서, 그
          // 대상을 문장 안에 넣지 않으면 뜻이 서지 않습니다.
          // 같은 인용이 FAQ("AI로 대충 만들면?")에도 있습니다 — 함께 움직이세요.
          // 축약형으로 되돌리지 말 것.
          ko: "빌드는 끝났고, 남은 것은 증명입니다. 공유회 전날 — AWS의 GTM·세일즈 시니어를 비롯해 현업에서 제품을 직접 파는 사람들과 — 발표와 이어지는 Q&A 안에서 ‘어떤 병목을 왜 골랐고, 근거는 무엇이고, 실제로 돌아가는가’가 서는지 점검하고, 전문가들이 던질 질문(“담당자가 그냥 범용 LLM에 물어봐서 얻는 답과, 이건 뭐가 다르죠?”)을 미리 받아봅니다. 그날 저녁 마감되는 사전 제출물의 마지막 점검 자리이기도 해요.",
          en: "The build is done; what's left is the proof. The day before the Showcase — with AWS GTM & sales seniors and people who sell products for a living — you pressure-test whether ‘which bottleneck, why, on what evidence, and does it actually run’ stands up in the pitch and the Q&A that follows, and field the questions the experts will ask (“how is this different from what the problem owner would get by just asking a general LLM?”). It's also the last check before the submission package closes that evening.",
        },
        // No partner logos here on purpose. AWS is where several of these mentors
        // work, and it sponsors the Day 7 venue — but it has never been named a
        // 메인 멘토링 파트너, and a logo in this header would say that it has.
        partnersLabel: { ko: "", en: "" },
        partners: [],
        placeholder: null,
      },
    ],
    // The one line kept from the amber aside that used to sit here. That aside
    // ran four clauses about who runs which day; the only part a participant
    // needed was this — mentoring hours are not assessed. Everything else it
    // said (AXMOS's roles, the Day 7 mentor/panel overlap) is already visible
    // in the programme section and on the cards themselves.
    // It is deliberately a footnote, not a card: it answers a worry, it isn't
    // information anyone came for.
    separationNote: {
      ko: "Day 8 피드백 패널과 멘토링은 분리 운영됩니다 — 멘토링 시간은 피드백·어워드와 무관해요.",
      en: "The Day 8 feedback panel and the mentoring are run separately — mentoring hours have no bearing on feedback or awards.",
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
    // the feedback panel's and a photo can be reinstated without a schema change.
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
    // removed from these cards and from the panel bios on purpose: what a mentor
    // has BUILT is what a team needs to know before an hour with them, and a
    // university line invites students to rank the room by admissions instead.
    // Academic POSTS are career (한정필's professorship stays); degrees are not. If a profile can't be verified, leave `intro`
    // empty — the card drops the line rather than guessing.
    // `stages` decides WHICH BOX a mentor's card appears in (1 = Day 3·4,
    // 2 = Day 5–7, 3 = Day 7; see `groups` above, whose own `stages` is the join
    // key). It is DERIVED from `days`/`daysPending` — never set it to a stage the
    // day pills don't already claim, or a card lands in a box its own badge
    // denies. Empty array = neither box: those mentors run the Day 1·2 sessions
    // and show up in the warm-up strip instead. Nobody carries stage 2 today,
    // which is why the build box ends with the FDE placeholder card rather than
    // a name — Popup Studio sends FDEs, not an assigned mentor.
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
        days: "Day 1", daysPending: "", stages: [], img: "", logo: "", logoW: 0, logoH: 0, linkedin: "https://www.linkedin.com/in/jangwhan",
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
        days: "Day 2", daysPending: "", stages: [], img: "", logo: "", logoW: 0, logoH: 0, linkedin: "https://www.linkedin.com/in/jihoon-kim-613878134",
      },
      // ── Day 3·4 · 자율 빌드 1:1 ─────────────────────────────────────────────
      // Onword Lab — two founders as mentors.
      {
        name: { ko: "김진호", en: "Jinho Kim" }, org: { ko: "Onword Lab", en: "Onword Lab" }, role: { ko: "공동창업자 · CEO", en: "Co-founder · CEO" },
        intro: {
          ko: "유통·리테일 AI 전환(AX).",
          en: "AI transformation for retail & distribution.",
        },
        days: "Day 3·4", daysPending: "", stages: [1], img: "", logo: "", logoW: 0, logoH: 0, linkedin: "https://www.linkedin.com/in/kimjinho",
      },
      {
        name: { ko: "김시훈", en: "Sihoon Kim" }, org: { ko: "Onword Lab", en: "Onword Lab" }, role: { ko: "공동창업자 · CTO", en: "Co-founder · CTO" },
        intro: {
          ko: "커머스 운영 에이전트 시스템 개발.",
          en: "Agentic ops systems for commerce.",
        },
        days: "Day 3·4", daysPending: "", stages: [1], img: "", logo: "", logoW: 0, logoH: 0, linkedin: "https://www.linkedin.com/in/sihoon-kim-306551372",
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
        days: "Day 3·4", daysPending: "", stages: [1], img: "", logo: "", logoW: 0, logoH: 0, linkedin: "https://www.linkedin.com/in/brian-bae-ba638a131",
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
        days: "Day 3·4", daysPending: "", stages: [1], img: "/partners/people/joseph-jonghyun-kim.jpg", logo: "", logoW: 0, logoH: 0, linkedin: "https://www.linkedin.com/in/joseph-jonghyun-kim-009b244a",
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
        days: "Day 3·4", daysPending: "", stages: [1], img: "", logo: "", logoW: 0, logoH: 0, linkedin: "https://www.linkedin.com/in/hopper0620",
      },
      {
        name: { ko: "이유택", en: "Lee Yoo-taek" }, org: { ko: "NTU", en: "NTU" }, role: { ko: "前 Naver", en: "ex-Naver" },
        intro: {
          ko: "SW 엔지니어 5년 — LLM 코드리뷰 봇·사내 RAG 구축.",
          en: "5 yrs as a software engineer — LLM code-review bots, internal RAG.",
        },
        days: "Day 3·4", daysPending: "", stages: [1], img: "", logo: "", logoW: 0, logoH: 0, linkedin: "https://www.linkedin.com/in/yutaek",
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
        days: "Day 7", daysPending: "", stages: [3], img: "", logo: "", logoW: 0, logoH: 0, linkedin: "https://www.linkedin.com/in/donghyukshin",
      },
      {
        name: { ko: "이화영", en: "Lee Hwa-young" }, org: { ko: "AWS", en: "AWS" }, role: { ko: "Sales", en: "Sales" },
        intro: {
          ko: "싱가포르 근무. 前 브로드컴 어카운트 디렉터 · VMware 5년+.",
          en: "Based in Singapore. Ex-Broadcom account director; 5+ yrs at VMware.",
        },
        days: "Day 7", daysPending: "", stages: [3], img: "", logo: "", logoW: 0, logoH: 0, linkedin: "https://www.linkedin.com/in/hwayoung-lee-bbb79a134",
      },
      {
        name: { ko: "임석건", en: "Lim Seok-geon" }, org: { ko: "NetApp", en: "NetApp" }, role: { ko: "APAC", en: "APAC" },
        intro: {
          ko: "AWS 세일즈 스페셜리스트 4년+. 前 Rescale.",
          en: "AWS Sales Specialist, 4+ yrs. Ex-Rescale.",
        },
        days: "Day 7", daysPending: "", stages: [3], img: "", logo: "", logoW: 0, logoH: 0, linkedin: "https://www.linkedin.com/in/sugkun-lim",
      },
      // Codepresso — the two below are ALSO on the Day 8 feedback panel
      // (dict.judges.people; the key stays `judges` because components read it).
      // That double role is disclosed by dict.mentoring.separationNote above: the
      // panel and the mentoring are run separately, so a Day 7 mentor may sit on
      // the panel while the mentoring hours themselves stay outside it. Keep name,
      // org, role and LinkedIn identical to their panel cards — one person, two
      // surfaces. Nobody on the panel appears among the Day 3·4 mentors; re-check
      // that whenever a mentor or panellist is added.
      {
        name: { ko: "이동훈", en: "Lee Dong-hoon" }, org: { ko: "Codepresso", en: "Codepresso" }, role: { ko: "대표 · CEO", en: "CEO" },
        // The panel card carries the full bio; this line keeps only what a team
        // meeting him 1:1 needs, without repeating "Codepresso · 대표" above it.
        intro: {
          ko: "AI 코딩·역량진단 교육 플랫폼 운영. 前 스마일게이트 · LG전자 소프트웨어 엔지니어.",
          en: "Runs an AI-coding & skills-assessment education platform. Ex-Smilegate · LG Electronics engineer.",
        },
        days: "Day 7", daysPending: "", stages: [3], img: "/partners/people/lee-dong-hoon.jpg", logo: "", logoW: 0, logoH: 0, linkedin: "https://www.linkedin.com/in/donghun-lee-8888a13a",
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
        days: "Day 7", daysPending: "", stages: [3], img: "/partners/people/hwang-hyun-jin.jpg", logo: "", logoW: 0, logoH: 0, linkedin: "https://www.linkedin.com/in/hyunjin-hwang-40892697",
      },
      // 정요천: Popup Studio 총괄. Popup Studio already appears in the BUILD box as
      // a mentoring partner (its FDEs run the Day 5–7 drop-in office hours) — this
      // is a different thing: he comes on Day 7 in person as a named mentor, so he
      // belongs to the pitch group like the other Day 7 seniors. He is also on the
      // Day 8 feedback panel (dict.judges.people); name, org, role and LinkedIn are
      // kept identical across both cards — one person, two surfaces.
      {
        name: { ko: "정요천", en: "Jeong Yo-cheon" }, org: { ko: "Popup Studio", en: "Popup Studio" }, role: { ko: "총괄", en: "Head" },
        // The panel card carries the full history; this keeps what a team meeting
        // him on Day 7 would want, minus anything the org line already says.
        intro: {
          ko: "前 Brie 대표(CEO 겸 CTO) — 웹·AI 풀스택. 前 워프벤처스 CEO/CTO · 산업은행(KDB).",
          en: "Ex-CEO/CTO of Brie, a full-stack web·AI studio. Ex-Warp Ventures CEO/CTO · KDB.",
        },
        days: "Day 7", daysPending: "", stages: [3], img: "/partners/people/jeong-yo-cheon.webp", logo: "", logoW: 0, logoH: 0, linkedin: "https://www.linkedin.com/in/%EC%9A%94%EC%B2%9C-%EC%A0%95-8245a94b/",
      },
    ],
  },

  // ── 피드백 패널 (덱 p13의 심사위원 슬롯) ─────────────────────────────────────
  // The OBJECT KEY stays `judges` — components read dict.judges, and the rename
  // is a copy change, not a schema one. 2026-08-05 이후 사람을 부르는 이름은
  // '업계 전문가', 이 자리를 부르는 이름은 '피드백 패널'입니다.
  // Rendered as a subsection of the mentoring chapter (no new nav item). Bios are
  // tidied from the deck's own copy — NO facts added, EN is a translation. Every
  // person object carries identical keys to keep the array homogeneous. Everyone
  // has a face photo (img) and a LinkedIn. `linkedin` stays on every object even
  // when empty — the card just drops the icon — rather than omitted, since an
  // omitted key would make TS
  // infer a union and break `j.linkedin` on the card. Same reason `pending` is
  // false on every confirmed panellist instead of being left off the object.
  // TODO: confirm public naming — verify each name may be shown publicly.
  // Internal-only figures (e.g. Shin Sang-gil's "FY24 S$22M·+45%") are omitted.
  judges: {
    tag: { ko: "피드백 패널", en: "Feedback panel" },
    // Q1 spine (2026-08-01). "심사는 현업 리더가 합니다" was written from the
    // organizers' side — it answered "who runs the judging" when the participant's
    // question is "who is going to look at MY work". Same people, same order, same
    // cards: only the framing turns around.
    //
    // DECIDED 2026-08-05 (파트너 피드백): 경쟁형 데모데이 → 결과 공유회. 순위형
    // 시상 폐지·테마형 어워드(부문 pending)·인턴십 전원 개방. 이 섹션의 논리는
    // 원래 "검증 rather than 심사"였는데, 이제 한 칸 더 갔습니다 —
    // 피드백 rather than 심사 (2026-08-05). 이분들이 하는 일은 누가 더 잘했는지
    // 가리는 게 아니라 각 팀 결과물에 전문적인 시각과 다음 가능성을 주는 것이고,
    // 그건 등수가 사라진 뒤에도 그대로 남는 값입니다. 인물 카드·순서·pending
    // 규칙(확정 전 인물은 amber pill)은 그대로입니다.
    heading: { ko: "당신의 결과물에 피드백을 줄 사람들", en: "The people who'll give you feedback on your work" },
    sub: {
      ko: "순위를 매기는 심사가 아니라, 전문적인 시각의 피드백입니다 — 문제를 낸 기업과, 실제 산업에서 문제를 풀어온 시니어 리더들이 결과 공유회에서 각자의 관점으로 피드백과 다음 가능성을 제안합니다.",
      en: "Not a ranking exercise — expert feedback. The company that set the problem and senior leaders who have solved real ones in industry look at your Showcase work and, each from their own vantage point, offer feedback and what could come next.",
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
      // both are Day 7 mentors as well as Day 8 panellists (dict.mentoring.mentors).
      // Facts from her own LinkedIn ("Co-founder & Director & Content R&D Lead at
      // Codepresso", Director since Jan 2020, LG Electronics software engineer
      // Feb 2011 – Jan 2020, 서강대). The AXMOS clause is the same one 이동훈's bio
      // carries — it is the consortium her company belongs to, not a claim of her own.
      {
        name: { ko: "황현진", en: "Hyunjin Hwang" },
        org: { ko: "Codepresso", en: "Codepresso" },
        role: { ko: "공동창업자 · 이사", en: "Co-founder · Director" },
        tag: { ko: "AI 코딩 교육 · 콘텐츠 R&D", en: "AI coding education · content R&D" },
        img: "/partners/people/hwang-hyun-jin.jpg",
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
        // Korean-slug profile URL — keep it percent-encoded exactly as LinkedIn
        // serves it; the decoded form (/in/요천-정-…) 404s in some clients.
        linkedin: "https://www.linkedin.com/in/%EC%9A%94%EC%B2%9C-%EC%A0%95-8245a94b/",
      },
    ],
    // Amber dashed pill on a panellist whose participation is agreed in principle but
    // not locked — the same convention as the mentor grid's daysPending pill, so a
    // reader who has scrolled past the mentors already knows what amber means.
    pendingLabel: { ko: "협의 중", en: "TBC" },
    // tbcLabel / tbcNote ("추후 공개 · 트랙별 심사위원 섭외 중") lived here for the two
    // dashed placeholder cards at the end of the grid. The panel is complete, so
    // the cards and their copy were both removed — restore the pair together if
    // panellists are ever pending again (and reword the ko string: 심사위원 is no
    // longer the name for these people — 업계 전문가 / 피드백 패널 is).
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
    // 멘토링 카드의 점검 목록(BEvent.checkpoints) 제목. `opportunities`가 "여기서
    // 뭘 얻나"라면 이건 "그 시간에 뭘 하나"입니다 — 같은 마크업, 다른 질문.
    checkpoints: { ko: "이 시간에 함께 보는 것", en: "What you'll go through" },
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
    catJudges: { ko: "피드백 패널 지원", en: "Feedback panel" },
    catMentoring: { ko: "멘토링", en: "Mentoring" },
    catGoods: { ko: "굿즈", en: "Goods" },
    // 싱가포르 한인회 only. Its caption said 심사위원 지원, which was wrong: the
    // association is helping with the venue and with goodie bags for the mentors,
    // and nobody on the Day 8 feedback panel comes through it. Two roles in one
    // caption because the tile takes a single label and neither half tells the
    // truth alone.
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
  // Numbers here are NOT independent copy — they mirror the benefits, feedback
  // and schedule sections. Change one, change all of them.
  faq: {
    tag: { ko: "FAQ", en: "FAQ" },
    heading: { ko: "자주 묻는 질문", en: "Frequently asked" },
    items: [
      {
        q: { ko: "왜 8일이나 하나요? 해커톤치고 길지 않나요?", en: "Why 8 days? Isn't that long for a hackathon?" },
        a: {
          ko: "시간을 통으로 내야 하는 날은 사실 이틀입니다 — 필참은 Day 1(오프닝)과 Day 8(8/29 결과 공유회)뿐이고, 나머지는 각자 편한 시간에 하는 자율 빌드와 선택 참여 세션입니다. 8일로 늘린 건 매일 나오라는 뜻이 아니라, 학기 중에도 크래시 코스로 배우고 → 만들고 → 발표까지 가는 호흡을 만들기 위해서예요.",
          en: "Only two days actually need blocking out — Day 1 (opening) and Day 8 (29 Aug, the Showcase) are the only required ones. Everything else is self-paced building on your own time, plus optional sessions. Stretching it to eight days isn't asking you to show up daily: it's what makes room, mid-semester, for the full arc — learn at the crash course → build → present.",
        },
      },
      {
        q: { ko: "테마가 뭔가요? 너무 막연해요.", en: "What's the theme? It feels vague." },
        a: {
          // 브리핑은 Day 1(문제 공개 직후)이며 schedule.ts의 `d1-problem-deep-dive`와
          // 같은 사실을 말해야 합니다. 진행자·형식은 아직 조율 중이라 여기서도 확정으로
          // 쓰지 않습니다 — 특정 인물을 진행자로 명시하지 말 것(미확정).
          //
          // ⚠️ 2026-08-04: 그 `d1-problem-deep-dive`가 보류됐습니다 — 확정된 Day 1
          // 진행 순서(12:40–4:30PM)에 슬롯이 없어 schedule.ts에서 주석 처리됐고,
          // 부활 여부는 미정입니다. 이 답변의 "주최사가 배경을 직접 브리핑하는" 절만
          // 그 세션에 걸려 있습니다. 딥다이브를 되살리지 않기로 하면 이 절을 함께
          // 정리해야 합니다(문제가 Day 1에 공개된다는 나머지 부분은 그대로 사실).
          ko: "실제 한국 기업이 지금 겪고 있는 AX(AI 전환) 문제를 트랙별로 받아서 풉니다 — 예를 들어 ‘회사 돈이 어디서 새는지 눈에 안 보인다’ 같은 실무 문제요. 가상 과제가 아니라, Day 1에 문제가 공개되고 과제를 낸 주최사(AXMOS) 측이 배경을 직접 브리핑하는 ‘의뢰’입니다(진행자·형식은 조율 중). 의뢰서에는 그 회사의 실제 업무 워크플로우와 담당자의 페인포인트, 관련 맥락·데이터가 담깁니다. 트랙 구성은 메인 트랙 2개로 좁혀 논의 중이며 확정되는 대로 안내합니다.",
          en: "You take on the AX (AI-transformation) problems Korean companies are facing right now, one set per track — practical things like “we can't see where the company's money is leaking.” These aren't invented exercises but briefs: the problems drop on Day 1 and the host companies (AXMOS) that set them walk through the background first-hand (presenter and format still being arranged). Each brief carries the company's real workflow, the pain points of the person who owns it, and the context and data around it. The line-up has been narrowed to two main tracks, and we'll announce them once settled.",
        },
      },
      {
        q: { ko: "문과인데 이과생들에게 밀리지 않을까요?", en: "I'm not from a STEM major — will I fall behind?" },
        a: {
          // 배점 숫자는 여기에도 쓰지 않습니다 — 아래 "피드백과 어워드는 어떤
          // 기준인가요?" 답변과 같은 계약입니다. 피드백 문서 자체는 2026-08-04
          // 결정으로 참가자에게 사전 공개하지만, 배점은 아직 파트너 조율 중이라
          // 카피에 숫자를 박으면 곧 낡습니다. 숫자는 피드백 문서가 나르게 두고,
          // 여기서는 무게가 실리는 '방향'만.
          ko: "아니요 — 코드 실력을 겨루는 대회가 아닙니다. 피드백의 무게는 코드가 아니라 문제를 얼마나 정확히 이해했는가, 그 위에 세운 아이디어가 적절한가, 데모가 그 아이디어를 실제로 증명하는가에 실려 있어요. 프로토타입은 와이어프레임 수준이어도 되고, 화면의 세련됨은 보지 않습니다. 산업 맥락을 아는 사람이 오히려 유리한 구조이고, 코딩 기본기는 Day 2 크래시코스에서 맞춰 드립니다.",
          en: "No — this isn't a contest of coding ability. The weight of the feedback sits on how accurately you understand the problem, whether the idea you build on it is the right one, and whether the demo actually proves that idea — not on the code. A wireframe-level prototype is fine, and visual polish isn't part of it. The structure actually favours people who understand the industry context, and the Day 2 Crash Course levels the coding basics for everyone.",
        },
      },
      {
        // DECIDED 2026-08-04: all presentations incl. the Showcase pitches are in KOREAN.
        // This is final — do not reintroduce "choose your language" hedging here or
        // anywhere else. If an English-speaking participant ever needs an exception,
        // that's handled by the organizers case-by-case, not promised on the site.
        q: { ko: "‘해커톤’이라는 말이 부담돼요. 영어 발표도 자신 없어요.", en: "‘Hackathon’ feels intimidating, and I'm not confident presenting in English." },
        a: {
          ko: "발표는 전부 한국어로 진행합니다 — 참가자와 피드백을 주시는 전문가분들 모두 한인 커뮤니티 기반이에요. 영어 발표 걱정은 내려놓으셔도 됩니다. 그리고 이건 밤샘 해커톤이 아니라 8일에 걸쳐 만드는 빌더톤 — 완성도보다 ‘내 손으로 만들었다’를 보여주는 자리입니다.",
          en: "All presentations, the Showcase pitches included, are in Korean — both the participants and the industry experts giving feedback come from the Korean community here, so you can put the English worry down. And this isn't an all-nighter hackathon but a builderthon built over eight days: it's about showing you made it yourself, not about polish.",
        },
      },
      {
        q: { ko: "수료증을 주나요? 의미가 있나요?", en: "Is there a certificate? Is it worth anything?" },
        a: {
          ko: "네 — 크래시코스 전 시간을 참석한 분들께 Zero100 명의의 수료증이 발급되고, Day 8 마무리 세션에서 배부됩니다. 링크드인·이력서에 올릴 수 있어요. 이미 개발 경험이 있다면 수료증보다 멘토링·네트워킹이 더 큰 수확일 거예요.",
          en: "Yes — everyone who attends the full Crash Course receives a certificate issued by Zero100, handed out at the Day 8 closing. It's LinkedIn- and CV-ready. If you already build, the mentoring and network will matter more than the paper.",
        },
      },
      // Q1 spine (2026-08-01), placed straight after the certificate question —
      // that is where a reader is already thinking about what they keep. The three
      // artefacts are the same three in benefits.spine.tangibles, and the
      // certificate's condition is worded exactly as it is on benefits card 05 and
      // in the certificate FAQ above ("크래시코스 전 시간 참석 시"): four places, one
      // sentence, no drift.
      {
        q: { ko: "8일이 끝나면 저에게 뭐가 남나요?", en: "What do I walk away with after the 8 days?" },
        a: {
          ko: "세 가지가 실물로 남습니다 — 실제로 돌아가는 데모, 기업과 업계 전문가 앞에서 피칭한 경험(사진으로 남는), 그리고 수료증(크래시코스 전 시간 참석 시). 그리고 그 데모는 가상 과제가 아니라 실제 기업의 진짜 문제를 푼 결과물입니다.",
          en: "Three things you can actually show: a demo that runs, the experience of pitching it to the company and industry experts (photos included), and a certificate (for attending the full Crash Course). And that demo isn't a toy exercise — it's your answer to a real company's real problem.",
        },
      },
      {
        q: { ko: "인턴십이 진짜인가요? 유급인가요?", en: "Is the internship real? Is it paid?" },
        a: {
          // The internship is real and paid — that part is settled. The ROLE is
          // not: it used to say "FDE 인턴", which named a job nobody has agreed to
          // yet. The answer says what is decided and leaves the job description
          // out, which is also what a reader is really asking. NOT "FDE 인턴십" —
          // that rule still holds.
          //
          // DECIDED 2026-08-05 (파트너 피드백): 경쟁형 데모데이 → 결과 공유회. 순위형
          // 시상 폐지·테마형 어워드(부문 pending)·인턴십 전원 개방. 이 답의 옛 논리는
          // "1위 한정"이었습니다 — 이제 등수와 무관하게 전원에게 열려 있고, 검토
          // 기준은 행사 과정과 제출 자료입니다(그래서 8일 전체가 포트폴리오가 됩니다).
          //
          // CONFIRMED 2026-08-05: AXMOS(코드프레소·WVB) 실명 표기 가능. 옛 약속의
          // 형태("1위 팀에게")는 바뀌었지만 인턴십을 여는 회사는 그대로라, 개방형
          // 문구에도 실명이 남습니다 — 오히려 "누가 검토하는가"가 등수를 대신하는
          // 문장이라 실명이 있어야 답이 섭니다.
          // benefits 06 카드의 인턴십 줄과 같은 사실이니 함께 움직여 주세요.
          ko: "네, 실제로 추진 중인 유급 인턴십입니다 — AXMOS(코드프레소·WVB)의 인턴 기회이고, 특정 수상팀에게만 열리는 게 아닙니다. 행사에서 좋은 결과를 내는 것과 실제 현장에서 잘하는 것은 다를 수 있어서, 주최사가 관심 있는 참가자를 행사 과정과 제출 자료를 바탕으로 직접 검토해요. 8일 전체가 사실상 포트폴리오가 되는 구조입니다. 구체적인 조건은 행사가 끝난 뒤 회사와 학생이 학기 일정에 맞춰 직접 이야기해 정합니다. Day 7 커리어 간담회도 인턴·채용 풀로 이어지는 별도 연결 통로예요.",
          en: "Yes — a paid internship that's actually in motion, with AXMOS (Codepresso · WVB), and it isn't reserved for winning teams. Doing well at an event and doing well on the job aren't the same thing, so the hosts review interested participants directly, on the strength of their work across the event and what they submit. The whole eight days effectively become your portfolio. Specific terms get settled after the event, directly between the company and the student around their term dates. The Day 7 career session is a separate route into the internship & hiring pool too.",
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
          // DECIDED 2026-08-05 (파트너 피드백): 경쟁형 데모데이 → 결과 공유회. 순위형
          // 시상 폐지·테마형 어워드(부문 pending)·인턴십 전원 개방.
          //
          // 답의 첫 문장이 "네 — 다만 …"인 이유: 질문은 돈이 있느냐이고 답은 예스인데,
          // 바로 뒤에 오는 사실("1·2·3위가 아니다")이 예스의 모양을 바꿉니다. 부정을
          // 먼저 꺼내면 상금이 없다고 읽힙니다.
          //
          // "부문 구성은 확정되는 대로 안내" 헤지가 사는 세 곳 중 하나입니다 —
          // 나머지는 benefits 06 카드와 schedule.ts d8-final-pitch description.
          // 부문 이름·인센티브 금액·인원은 어디에도 쓰지 않습니다.
          //
          // 수료증은 이 목록에서 의도적으로 빠져 있습니다 — 발급 기준이 "크래시코스
          // 전 시간 참석"이라, 참가자 전원이 받는 항목과 나란히 두면 기준이 오해됩니다.
          // "Day 5 AI Use Case Top 3의 널담 바우처도 논의 중" 문장은 2026-08-03에
          // 빠졌습니다 — Day 5가 네트워킹 데이로 바뀌며 그 세션이 없어졌습니다.
          // DECIDED 2026-08-04: NO meals are provided at any point — aligned with
          // schedule.ts d7 ("점심(개별)"). What IS free: entry, networking, and the
          // Brand Boost hoodie+cap sets (Day 1 on-site, 60 sets first-come). Do not
          // reintroduce food promises here or in any benefit/schedule copy.
          // benefits 06 카드와 같은 사실을 말하는 자리이니 함께 움직여 주세요.
          ko: "네 — 다만 팀을 1·2·3위로 세우는 방식은 아닙니다. 시상은 각 팀의 강점을 드러내는 테마형 어워드로 구성되며, 부문은 현재 기획 중이라 확정되는 대로 안내드려요. 인센티브는 현금·식사 바우처 형태로 주최사가 지원합니다(규모 확정 전). 참가비는 무료이고, 네트워킹은 전원에게 돌아갑니다(식사는 제공되지 않아요 — 각자 해결). 브랜드부스트 후드·캡 세트는 Day 1 현장에서 선착순 60세트로 드리고, 수료증은 크래시코스 전 시간을 들으면 받습니다.",
          en: "Yes — but not as a 1st-2nd-3rd ranking. Awards are thematic, built to recognise each team's strengths, and the categories are being designed now — we'll announce them once set. Incentives come as cash or dining vouchers from the hosts (amounts not yet final). Entry is free and the networking goes to everyone (meals aren't provided — grab food on your own). The Brand Boost hoodie + cap sets go out on Day 1 on site, 60 sets first-come, and the certificate comes with full Crash Course attendance.",
        },
      },
      {
        q: { ko: "결과물이 실제로 쓰이나요? AI로 대충 만들면 어떡하죠?", en: "Will the results actually be used? What if it's just AI slop?" },
        a: {
          // 퍼센트를 뺐습니다 (2026-08-03). 여기 있던 "도입 가능성 15%"와 "데모
          // 30%"는 트랙별 옛 채점표의 숫자로, 현재 피드백 문서의 5축 구성에는 그 이름의
          // 항목이 없습니다. 게다가 배점 자체가 파트너 조율 중이라("배점은 파트너
          // 조율에 따라 확정 전" — 피드백 문서 각주) 새 숫자로 갈아끼우면 또 낡습니다.
          // 그래서 확정적으로 말할 수 있는 것만 서술로 씁니다.
          //
          // "무대에서 실제로 돌아가는지"도 함께 고쳤습니다 — 피드백 문서는 반대로
          // 말합니다: 작동 판정은 사전 제출 영상 기준이고 라이브 실패는 감점이
          // 아닙니다. 학생이 무대 사고를 치명적으로 오해하게 두면 안 됩니다.
          // 숫자를 다시 넣지 마세요. 배점이 확정되면 피드백 문서를 정본으로 삼되,
          // 이 답변은 서술로 두는 편이 오래갑니다.
          //
          // DECIDED 2026-08-05 (파트너 피드백): 경쟁형 데모데이 → 결과 공유회.
          // 두 절이 바뀌었습니다 — ① 인턴 기회의 대상이 우승팀에서 "관심 있는
          // 참가자"로 열렸고, ② 'AI로 대충'을 걸러내는 주체가 심사가 아니라 전문가
          // 피드백입니다(순위를 매기는 자리가 아니어도 전문가 앞에서는 그대로
          // 드러납니다). "요구사항 미충족"과 라이브 시연 문장은 그대로 둡니다 —
          // 영상 기준 원칙은 전환과 무관하게 살아 있습니다.
          ko: "기업이 도입을 약속하는 건 아니에요 — ‘담당자가 다음 주 월요일부터 쓸 수 있는가’를 보긴 하지만, 그건 도입 확정과는 다릅니다. 대신 주최사가 관심 있는 참가자에게는 인턴으로 그 문제를 실무에서 이어갈 기회를 열어두고 있어요 — 수상과 무관하게, 행사 과정을 바탕으로요. ‘AI로 대충’은 전문가 피드백에서 그대로 드러납니다 — 전문가들이 현장에서 “담당자가 그냥 범용 LLM에 물어봐서 얻는 답과, 이건 뭐가 다르죠?”를 직접 묻고, 근거 없이 결과만 내놓는 산출물은 요구사항 미충족으로 처리됩니다. 목업·슬라이드만 있는 경우도 마찬가지고요. 반대로 무대에서 라이브 시연이 삐끗하는 건 감점이 아닙니다 — 작동 여부는 사전에 제출한 데모 영상 기준으로 봅니다.",
          en: "No company commits to adopting what you build — the question “could the owner use this from next Monday?” does get asked, but that isn't the same as a decision to adopt. What the hosts do keep open is the chance to carry that problem into real work as an intern, for participants they're interested in — awards or not, on the strength of your work across the event. And “AI slop” shows up plainly in the expert feedback: the experts ask out loud, “how is this different from what the problem owner would get by just asking a general LLM?”, and output that returns results with no reasoning behind them counts as a failed requirement. Mockups or slides alone go the same way. A live demo stumbling on stage, on the other hand, costs nothing — whether it runs is judged on the demo video you submit beforehand.",
        },
      },
      {
        q: { ko: "저는 개발 경험이 있는데 크래시코스가 필요 없어요.", en: "I already code — I don't need the crash course." },
        a: {
          // 두 번째 문장("경험자를 위한 OpenAI Codex 워크샵(레포 연동·API·MCP)도
          // 별도로 조율 중")은 2026-08-03에 삭제했습니다 — 그 워크샵이 스케줄에서
          // 빠졌기 때문입니다(schedule.ts d3-codex-workshop). 경험자용 대체 세션을
          // 여기에 새로 적지 마세요: 지금 확정된 건 없고, 이 답의 일은 "안 들어도
          // 된다"를 말해주는 것까지입니다.
          ko: "크래시코스는 선택입니다 — 건너뛰고 Day 1 문제 공개 직후부터 바로 빌드에 들어가면 됩니다.",
          en: "The Crash Course is optional — skip it and start building the moment the problems drop on Day 1.",
        },
      },
      // 툴 질문은 바로 위 "크래시코스 필요 없어요" 옆이 자리입니다 — 같은 사람이
      // 연달아 묻는 두 질문이고(경험자·도구), 초보는 "Codex를 사야 하나"를 여기서
      // 확인합니다. 답의 순서가 곧 요지: ① 강의만 Codex 기준 ② 빌드는 자유
      // ③ 그래서 기본 플랜이면 충분 — ③의 근거는 무엇을 보느냐입니다.
      // 배점(프로세스 대 작동의 비율)은 파트너 조율 중이라 숫자를 쓰지 않고,
      // 피드백 문서가 확정적으로 말하는 것만 씁니다: 완성도·발표력은 보지 않음.
      {
        q: { ko: "어떤 AI 툴을 써야 하나요? Codex를 꼭 써야 하나요?", en: "Which AI tool do I need? Do I have to use Codex?" },
        a: {
          ko: "크래시코스는 Codex를 기준으로 진행해요 — 강사와 같은 화면을 따라 하기 좋게 하나로 맞춘 것뿐입니다. 팀 빌드와 공유회 결과물에는 툴 제한이 없어요. Claude Code든 커서든 ChatGPT든 손에 맞는 걸 쓰면 됩니다. 다만 계정은 필요해요 — Claude나 ChatGPT의 기본 유료 플랜 정도면 8일 내내 충분하고, 그 이상은 필요 없습니다. 피드백이 기술 완성도나 화면의 세련됨이 아니라, 어떤 병목을 왜 골랐고 그 판단의 근거가 무엇인지를 보기 때문이에요.",
          en: "The crash course runs on Codex — that's so everyone can follow the same screen, not a rule about what you build with. There's no tool restriction on your team's build or your Showcase work: Claude Code, Cursor, ChatGPT, whatever fits your hand. You do need an account, though — a basic paid plan on Claude or ChatGPT covers the whole eight days, and nothing beyond that is needed. The feedback looks at which bottleneck you picked, why, and what backs that call — not at technical polish or how slick the screen looks.",
        },
      },
      {
        q: { ko: "제가 여기서 얻는 게 뭔가요?", en: "What do I actually get out of this?" },
        a: {
          ko: "손에 남는 것 기준으로: 실제 기업 문제를 8일간 풀어본 결과물, 크래시코스 수료증, 현직 선배들과의 1:1 멘토링, 공유회 무대 발표 경험, 그리고 행사 후에도 이어지는 커뮤니티입니다. Day 7 커리어 세션에서는 시니어 리더들과 직접 만나요.",
          en: "In terms of what you actually walk away with: something you built against a real company's problem over eight days, the Crash Course certificate, 1:1 mentoring with people already working in the field, the experience of presenting on the Showcase stage, and a community that keeps going after the event. The Day 7 career session puts you in front of senior leaders directly.",
        },
      },
      {
        q: { ko: "피드백과 어워드는 어떤 기준인가요? 기술이 완벽해야 하나요?", en: "What's the feedback based on? Does it need to be technically polished?" },
        // DECIDED 2026-08-04: the criteria ARE disclosed to participants before
        // the event. This REVERSES the earlier "internal, never published" stance
        // (2026-08-02), so this answer may — and now does — promise the document.
        //
        // What it still does NOT print is the per-axis weights. That is not
        // secrecy any more, it's freshness: the weights are not settled yet
        // ("배점은 파트너 조율에 따라 확정 전"), so numbers typed into copy go stale
        // the moment they land, and the document reaching participants is the
        // thing that carries them anyway. Let the document carry the numbers;
        // keep this answer to the SHAPE of what matters.
        //
        // DECIDED 2026-08-05 (파트너 피드백): 경쟁형 데모데이 → 결과 공유회. 문서의
        // 이름이 심사표에서 '피드백 문서'로 바뀌었습니다 — 이름만 바꾼 게 아니라
        // 하는 일이 바뀐 것이라(점수를 매기는 표 → 각 팀에게 돌아가는 피드백),
        // 사이트에서도 심사표라고 부르지 마세요. 공개 약속 자체는 그대로입니다.
        //
        // The not-looked-at list below stays public regardless. It isn't a
        // criterion anyone can game — it's the reassurance that gets a nervous
        // non-developer to register. Same reason the three-part deliverable
        // framing stays in dict.program.outputSteps and the upload checklist in
        // dict.program.submission: those tell you what to DO.
        a: {
          ko: "기술 완성도는 보는 기준이 아닙니다. 크게 보면 무게는 결과물의 완성도가 아니라 거기까지 간 과정에 실려 있어요 — 문제를 감이 아니라 근거로 골랐는지, 그리고 그게 실제로 돌아가는지. 무엇을 보고 피드백을 드리는지는 피드백 문서로 대회 전에 그대로 공개합니다 — 무엇을 준비해야 하는지 모르는 채 무대에 서실 일은 없어요.",
          en: "Technical polish isn't one of the things looked at. Broadly, the weight sits on the process rather than the finish — whether you chose the problem from evidence rather than instinct, and whether the thing actually runs. What the feedback is based on goes out to participants before the event as a feedback document, exactly as it stands — you'll never be preparing without knowing.",
        },
        aGroups: [
          {
            label: { ko: "보지 않는 것", en: "What isn't looked at" },
            items: [
              { ko: "발표력 · 영어 · 화면의 세련됨", en: "Delivery · English · visual polish" },
              {
                ko: "무대에서 데모가 터지는 것 — 작동 판정은 사전 제출 영상 기준입니다",
                en: "A demo failing live — running is judged on the submitted video",
              },
              {
                ko: "팀에 개발자가 몇 명인지 · 어떤 전공인지",
                en: "How many developers are on your team, or what you studied",
              },
            ],
          },
        ],
        // The withheld-detail line. Phrased as an offer, not a wall: it says more
        // detail exists and that being in the room is how you get it.
        //
        // UPDATED 2026-08-04: the feedback document is no longer internal (see the
        // answer above), so the old ban on naming it here is lifted.
        //
        // This line still promises GUIDANCE rather than the document, and that is
        // deliberate: the answer above already commits to "대회 전에 공개", which is
        // the promise. Naming a delivery CHANNEL here would be a second, narrower
        // promise — the open chat is public while the document goes to participants
        // — and the organisers would have to keep both. Still no per-axis numbers:
        // they aren't settled.
        aOpenChat: {
          ko: "전문가들이 뭘 눈여겨보는지는 오픈채팅방에서 먼저 풀어요 — 준비하면서 참고할 만한 것들부터요.",
          en: "We go into what the experts actually look for in the open chat first — starting with what's useful while you're still building.",
        },
        // 과정 기록의 행선지가 순위가 아니라 피드백·인턴십 검토로 바뀌었습니다
        // (2026-08-05) — dict.program.checkins.bonus와 같은 논리이니 함께 움직이세요.
        aTail: {
          ko: "체크인 응답과 오피스아워 참여는 과정 기록으로 남아, 전문가 피드백과 주최사의 인턴십 검토에서 그대로 참고돼요. 피드백은 실제 산업에서 문제를 풀어온 현업 리더분들이 직접 주십니다(피드백 패널 섹션 참조).",
          en: "Responding to the check-in forms and using the office hours leaves a trail of your process, which the experts' feedback and the hosts' internship review draw on. The feedback itself comes first-hand from leaders who have solved these problems in industry (see the feedback panel section).",
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
    // WCAG 2.5.3 (Label in Name): the accessible name has to CONTAIN the visible
    // label, which on this control is "EN / KR". It read only "Switch to English",
    // so a voice-control user saying "EN" or "KR" could not activate it — the one
    // control on the page whose visible text is the language itself.
    // "EN/KR" with no spaces — that is exactly how the three spans render, and the
    // check compares the literal visible string.
    aria: { ko: "EN/KR — Switch to English", en: "EN/KR — 한국어로 전환" },
  },
};
