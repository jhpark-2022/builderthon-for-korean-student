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
    "mailto:pjh030924@gmail.com?subject=Zero100%20Builderthon%20Partnership%20Inquiry",
  // Where an already-registered visitor goes to change or cancel their entry.
  // There is no self-serve edit: registrations are written once by /api/register
  // and the browser keeps no registration id, so nothing can identify "your" row
  // to a later request. Organizers edit by hand instead.
  registerEdit:
    "mailto:pjh030924@gmail.com?subject=Zero100%20Builderthon%20%EB%93%B1%EB%A1%9D%20%EC%A0%95%EB%B3%B4%20%EC%88%98%EC%A0%95%20%EC%9A%94%EC%B2%AD",
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
  "Translink Investment": {
    ko: "실리콘밸리 트랜스링크캐피탈과 합작해 2016년 출범한 벤처캐피탈로, SaaS·딥테크 중심으로 7개 조합·누적 약 1,900억 원 규모를 운용합니다. 마켓컬리 초기 투자사로 알려져 있으며, 포트폴리오사의 글로벌 진출 지원이 강점입니다. 데모데이 키노트를 맡은 박희덕 대표가 이끄는 하우스입니다.",
    en: "A venture capital firm launched in 2016 with Silicon Valley's TransLink Capital, running seven funds (~KRW 190B) focused on SaaS and deep tech. An early investor in Market Kurly, known for helping portfolios expand globally — led by Hee-Duk Park, our Demo Day keynote speaker.",
  },
  "Wilt Venture Builder": {
    ko: "싱가포르에 본사를 둔 한–싱 크로스보더 벤처빌더로, 초기 아이디어부터 시리즈 A까지 창업자와 ‘공동 창업’ 방식으로 회사를 함께 만듭니다. AI·콘텐츠·F&B·B2B SaaS 영역에서 한국 브랜드의 동남아 진출을 빌드해 왔으며, 이 빌더톤을 만든 Zero100 프로그램의 모조직입니다.",
    en: "A Korea–Singapore cross-border venture builder headquartered in Singapore, co-founding companies with founders from first idea to Series A across AI, content, F&B and B2B SaaS. The parent organization of Zero100 — the program behind this builderthon.",
  },
  Codepresso: {
    ko: "‘AI 리터러시의 표준화’를 내건 AI 역량 평가·교육 기업입니다. 채용용 AI 역량 평가(SkillCertify)와 비개발자 대상 AI 활용 교육(AI Fluent)을 운영하며, 현대오토에버·현대모비스 등 대기업 프로그램을 진행해 왔습니다. 이번 빌더톤에서는 Day 2 크래시코스를 주관합니다.",
    en: "An AI competency assessment & education company working to standardize AI literacy — running skill assessments (SkillCertify) and AI-fluency training (AI Fluent) used by companies like Hyundai AutoEver and Hyundai Mobis. Codepresso runs this builderthon's Day-2 Crash Course.",
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
    ko: "1963년 설립된 싱가포르 한인 사회의 대표 단체로, 탄종파가에 자체 회관을 두고 장학 사업과 청년 멘토링·네트워킹 프로그램, 연례 한인 행사를 운영합니다. 이번 빌더톤에는 심사위원 연계로 함께합니다.",
    en: "The representative body of Singapore's Korean community since 1963, with its own hall in Tanjong Pagar — running scholarships, young-professionals mentoring and the community's annual events. Supporting the builderthon through its judge network.",
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
    // Nav open-chat entry. Present from first paint (unlike the register button,
    // which is scroll-revealed): the whole point is to give someone who isn't
    // ready to register a door that is already open when they land.
    openChat: { ko: "오픈채팅", en: "Open Chat" },
    openChatAria: { ko: "카카오톡 오픈채팅방 열기", en: "Open the KakaoTalk open chat" },
    // Brand suffix beside the Zero100 wordmark in the nav.
    brandSuffix: { ko: "빌더톤", en: "Builderthon" },
  },

  // Secondary CTA on the hero/footer that sends visitors to the /quiz mini-site.
  quizCta: {
    eyebrow: { ko: "✦ AI 성격 테스트 · 환상의 궁합", en: "✦ AI test · dream teammates" },
    button: { ko: "내 AI 모델 알아보기", en: "Find your AI model" },
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
    hookQuizCta: { ko: "3분 만에 정체 확인 →", en: "Find out in 3 min →" },
    // The disclaimer IS the joke — and it's also true, which is why it can be
    // said out loud instead of buried.
    hookQuizNote: { ko: "*과학적 근거는 없습니다. 재미는 있습니다.", en: "*Zero science. 100% fun." },
    // Returning visitor with a saved result: {name} is their own variantName.
    hookQuizQReturn: {
      ko: "{name}님, 환상의 짝꿍은 확인하셨어요?",
      en: "Hey {name} — met your perfect match yet?",
    },
    hookQuizCtaReturn: { ko: "내 결과 다시 보기 →", en: "Back to my result →" },
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
      ko: "SMU · NUS · NTU 한인 학생회 주관 · Zero100 빌더톤 운영진이 직접 확인합니다.",
      en: "Organized by the SMU · NUS · NTU Korean student associations — the Zero100 builderthon team reads every entry.",
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
      { value: "team", label: { ko: "팀이 이미 있어요", en: "I already have a team" } },
      { value: "solo", label: { ko: "솔로로 갑니다", en: "Going solo" } },
    ],
    // Solo-only: opt into being matched with other solo builders. The AI-type
    // block appears only while this is checked.
    soloMatchLabel: {
      ko: "다른 솔로 참가자와 팀 매칭을 원해요",
      en: "Match me with other solo builders",
    },
    // Team section — shown only when "team" is selected.
    teamSectionTitle: { ko: "팀 정보", en: "Team details" },
    teamSizeNote: { ko: "팀은 1–3인이에요", en: "Teams are 1–3 people" },
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
    partnersHost: { ko: "주최", en: "Host" },
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
    // Two confirmed headline facts, used as the hero partner strip's caption.
    // Both are locked: the AWS office venue and the Translink CEO keynote are
    // confirmed. Do NOT append other speakers or venues to this line.
    heroNameValue: {
      ko: "AWS 오피스에서 파이널 리허설 · Translink 대표의 데모데이 키노트",
      en: "Final rehearsal at the AWS office · Demo Day keynote by Translink's CEO",
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
        title: { ko: "Zero100 빌더톤", en: "Zero100 Builderthon" },
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
    visionBridge: {
      ko: "그 시작점의 첫 ~100명이 이번 8월에 모입니다.",
      en: "The first ~100 of that starting point gather this August.",
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
    who: [
      { ko: "전공 불문 — NUS · NTU · SMU의 모든 한인 학생", en: "Any major — Korean students across NUS · NTU · SMU" },
      { ko: "코딩이 처음이어도 좋습니다 — 크래시코스와 수료증이 함께합니다", en: "First time coding is fine — a crash course and a certificate are included" },
      { ko: "입대 전·전역 후, 다시 도전하고 싶은 분", en: "Anyone wanting a fresh challenge — before enlistment or after service" },
      { ko: "실제 기업의 문제를 직접 풀어보고 싶은 분", en: "Anyone who wants to solve a real company's problem hands-on" },
    ],
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
    modeNote: {
      ko: "필참은 Day 1(오프닝)과 Day 8(데모데이) 둘뿐이에요. 그 사이는 대부분 온라인이고, 자율 빌드는 각자 편한 시간·장소에서 팀별로 이어갑니다 — 8일 내내 붙어 있어야 하는 일정이 아닙니다. Day 5(오프라인 킥오프)·Day 7(파이널 리허설·AWS 오피스)은 현장에 모이지만 필참은 아니에요.",
      en: "Only two days are required: Day 1 (opening) and Day 8 (Demo Day). Everything in between is mostly online, and the self-paced build happens whenever and wherever works for your team — this is not eight days you have to block out. Day 5 (kickoff) and Day 7 (final rehearsal · AWS office) meet in person too, but attendance isn't required.",
    },
    legendTitle: { ko: "카테고리", en: "Legend" },
    dayLabel: { ko: "Day", en: "Day" },
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
          { ko: "주최사 FDE의 실제 예시 라이브 빌드 → 따라 하기", en: "Live example builds by the hosts' FDEs to follow along" },
          { ko: "모델 선택·프롬프트·용어 가이드 제공", en: "Model-choice, prompt and terminology guides" },
          { ko: "0→1 첫 성공 경험 (기본기는 Day 1)", en: "Your first 0→1 success (fundamentals on Day 1)" },
        ],
      },
      {
        num: "02",
        title: { ko: "실제 기업의 진짜 문제", en: "A real company's real problem" },
        points: [
          { ko: "출제가 아니라 ‘의뢰’ — 학생은 주니어 컨설턴트로 프로세스·아픔을 진단해 AI로 재설계", en: "Not a prompt but a brief — you're a junior consultant diagnosing a real process & pain, then redesigning it with AI" },
          { ko: "가상 과제가 아닌 파트너사의 실제 AX 문제 + 직원 피드백", en: "Not toy prompts — a partner's real AX problem + employee feedback" },
          { ko: "트랙 구성 미확정 — 재무·영업·마케팅 3트랙으로 논의 중(잠정) · AWS 방법론으로 접근 · 클라이언트 사명도 조율 중", en: "Tracks not finalized — finance · sales · marketing under discussion (tentative) · approached with AWS methodology · client names TBC" },
          { ko: "모든 참가팀에게 실제 문제와 기업 담당자 브리핑 제공 (Day 2 라이브 브리핑)", en: "Every team gets a real problem and a briefing from the company contact (Day 2, live)" },
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
          { ko: "박희덕·원대로 등 연사 세션", en: "Speaker sessions with Park · Won and more" },
          { ko: "패널·공유 세션으로 technical 그 이상의 인사이트", en: "Panels & sharing sessions for more-than-technical insight" },
          // Not confirmed — see d5-panel-usecase in data/schedule.ts. Listing an
          // unconfirmed activity as a flat benefit is the kind of thing someone
          // registers for and then doesn't get.
          { ko: "Day 5 참가자 AI 유스케이스 발표 · QR 인기투표 (검토 중)", en: "Day 5 participant AI use-case showcase + QR popular vote (under review)" },
          { ko: "지속되는 한–싱 빌더 커뮤니티의 시작 멤버", en: "Founding membership in a lasting Korea–SG builder community" },
        ],
      },
      {
        num: "05",
        title: { ko: "수료증", en: "Certificate" },
        points: [
          { ko: "크래시 코스 참여자 전원 발급 · 8일차 이후", en: "Issued to every crash-course participant · after Day 8" },
          { ko: "포트폴리오 · 이력에 활용", en: "Use it in your portfolio and CV" },
          { ko: "링크드인에 올릴 수 있는 형태", en: "In a form you can post on LinkedIn" },
        ],
      },
      {
        num: "06",
        title: { ko: "인턴십 · 상금", en: "Internships & prizes" },
        points: [
          { ko: "딥다이브 2트랙(재무·영업) 1위 = 유급 FDE 인턴 — ‘AXMOS 학생 TF’로 잇는 선순환 · 잠정", en: "1st in each Deep Dive track (finance · sales) = paid FDE internship — a virtuous loop as the ‘AXMOS student TF’ · tentative" },
          { ko: "트랙별 순위 시상 · 상금 S$100 · 널담 바우처 · 잠정", en: "Ranked per-track awards · S$100 prize · Nuldam voucher · tentative" },
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
  },

  // ── 연사 · 공유 세션 (Day 1·5·8) ────────────────────────────────────────────
  speakers: {
    tag: { ko: "연사 · 공유 세션", en: "Speaker sessions" },
    heading: { ko: "Day 1 · 5 · 7 · 8 — 스피커 & 공유 세션", en: "Day 1 · 5 · 7 · 8 — Speaker & sharing sessions" },
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
        // Same speaker as the Day 8 keynote — the career session is a separate
        // session on a separate day, so it gets its own card (see d7-speaker-session).
        day: { ko: "Day 7 · 커리어 간담회", en: "Day 7 · Career session" },
        name: { ko: "박희덕", en: "Park Hee-deok" },
        role: { ko: "CEO · General Partner, Translink Investment (VC)", en: "CEO · General Partner, Translink Investment (VC)" },
        topic: { ko: "‘FDE로 일한다는 것’ — 커리어 간담회", en: "“Working as an FDE” — a career session" },
        img: "/partners/logos/speaker-park.jpeg",
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
        points: [
          { ko: "0 → 100의 핵심 — 협업 · 가치 · 실행 · 글로벌 스탠다드", en: "The core of 0 → 100 — collaboration · value · execution · global standards" },
          { ko: "협업의 힘 · 커뮤니티의 중요성", en: "The power of collaboration · why community matters" },
          { ko: "왜 지금, 왜 싱가포르의 한인 학생인가", en: "Why now, and why Korean students in Singapore" },
          { ko: "데모데이 키노트 · 약 1시간", en: "Demo-Day keynote · about an hour" },
        ],
      },
    ],
    tbcNote: {
      ko: "* Day 5에는 ‘유학생에서 창업가로’ 패널(유학생 출신 창업가 3인)이 예정되어 있으며 현재 섭외 중입니다. 세션 시간·구성은 조정될 수 있습니다.",
      en: "* Day 5 hosts a ‘From Int'l Student to Founder’ panel (three founders who came up as international students) — panelists are still being arranged. Session times and format may still change.",
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
    // Shown in the partner modal when the tile it replaced had an outbound link.
    companySite: { ko: "사이트 열기", en: "Visit site" },
  },

  partners: {
    tag: { ko: "Partners", en: "Partners" },
    heading: { ko: "함께 만드는 사람들", en: "Built together" },
    note: {
      ko: "실제 AX 과제를 함께 제공하는 주최 파트너(AXMOS), SMU·NUS·NTU 한인 학생회의 주관·운영, 그리고 장소·마케팅·멘토링·굿즈를 맡아주는 후원사가 함께합니다. 각 파트너가 맡은 역할을 그대로 표기합니다.",
      en: "Built with the host partners providing the real AX problems (AXMOS), organized and run by the SMU · NUS · NTU Korean student associations, and supported by sponsors covering venue, marketing, mentoring and goods. Each partner is labelled with the role they actually play.",
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
    // One confirmed row, captioned by the role each sponsor plays — mirrors the
    // deck's partner slide. Role captions below.
    sponsorsLabel: { ko: "후원 · SPONSORS", en: "Sponsors" },
    sponsorConfirmedLabel: { ko: "확정 (Confirmed)", en: "Confirmed" },
    catVenue: { ko: "장소", en: "Venue" },
    catMarketing: { ko: "마케팅", en: "Marketing" },
    catJudges: { ko: "심사위원 지원", en: "Judges" },
    catMentoring: { ko: "멘토링", en: "Mentoring" },
    catGoods: { ko: "굿즈", en: "Goods" },
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
          ko: "테마는 ‘AI’가 아니라 ‘산업’입니다. 실제 한국 기업이 지금 겪는 진짜 AX(AI 전환) 과제를 트랙별로 제공합니다. 문제는 ‘Broad problem, sharp objective’ — 목표는 뾰족하게 주되 푸는 방법은 여러분의 몫입니다. 출제가 아니라 ‘의뢰’에 가깝습니다 — 학생은 주니어 컨설턴트처럼 클라이언트의 프로세스와 아픔을 진단해 AI로 다시 설계합니다. 트랙 구성은 아직 확정되지 않았습니다 — 현재 재무·영업·마케팅 3트랙(마케팅은 입문 트랙)으로 논의 중이며, 트랙과 클라이언트 사명 모두 확정되는 대로 안내합니다. 비전공자도 감을 잡을 수 있도록 산업 맥락을 함께 제공합니다.",
          en: "The theme isn't ‘AI’ — it's industry. You'll get real AX (AI-transformation) problems Korean companies are facing right now, organized by track. The format is ‘broad problem, sharp objective’: the goal is sharp, but how you solve it is up to you. It's less a prompt than a brief — you act like a junior consultant, diagnosing a client's process and pain and redesigning it with AI. The tracks aren't confirmed yet — three are under discussion (finance, sales and marketing, with marketing as the beginner track), and we'll announce both the tracks and the client names once they're settled. We give you the industry context either way, so non-CS participants can find their footing.",
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
          ko: "크래시코스를 완료한 참여자 전원에게 수료증을 발급합니다(링크드인에 올릴 수 있는 형태). 발급 기관과 기준은 아직 협의 중이며, 확정되는 대로 안내합니다. 처음 시작하는 분에게 특히 좋은 출발점이 되고, 이미 개발 경험이 있는 분에게는 수료증보다 커리큘럼·네트워킹·멘토링이 더 큰 가치가 됩니다.",
          en: "Everyone who completes the crash course gets a certificate — in a form you can post on LinkedIn. The issuing body and the criteria are still being agreed, and we'll announce them once confirmed. It's a strong starting point especially if you're new; if you already build, the curriculum, networking and mentoring will matter more to you than the certificate itself.",
        },
      },
      {
        q: { ko: "인턴십이 진짜인가요? 유급인가요?", en: "Is the internship real? Is it paid?" },
        a: {
          ko: "실제로 추진 중인 기회입니다. 상위 팀이 자신이 푼 문제를 파트너 기업에서 실무로 이어가는 유급 인턴십을 목표로 논의하고 있고, 조건(참여 기업·기간·인원)은 아직 조율 중이며 확정되는 대로 업데이트합니다. 그래서 저희는 확정되지 않은 인턴십보다, 참여하면 누구나 얻는 네트워킹과 협업을 먼저 이야기합니다.",
          en: "It's a real opportunity we're actively working on. We're in discussion to have top teams carry the problem they solved into paid internship work at a partner company; the terms (which companies, how long, how many people) are still being arranged and we'll update this as they're confirmed. That's why we lead with the networking and collaboration everyone gains, rather than an internship that isn't locked yet.",
        },
      },
      {
        q: { ko: "혼자(1인) 참가해도 되나요?", en: "Can I take part solo?" },
        a: {
          ko: "됩니다 — 솔로 참가를 환영합니다. 팀은 1–3인까지 가능하며(솔로 OK · 매칭 선택), 혼자 자신의 기량을 보여주고 싶은 분을 위해 1인 참가를 열어두었습니다. 팀이 없어도 네트워킹·팀 빌딩 시간에 팀을 찾을 수 있습니다.",
          en: "Yes — solo entries are welcome. Teams can be 1–3 people (solo is fine · matching optional), and solo is kept open for anyone who wants to show what they can do on their own. If you don't have a team you can find one during the networking and team-building sessions.",
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
      {
        q: { ko: "심사는 어떻게 하나요? 기술이 완벽해야 하나요?", en: "How is judging done? Does it need to be technically polished?" },
        a: {
          ko: "기술적 완성도가 아니라 ‘회사·문제 이해 → 아이디어 → 데모의 정합성’을 봅니다. 배점은 회사·문제 이해도 20 · 아이디어의 적절성 25 · 데모↔아이디어 정합 30 · 도입 가능성 15 · 발표·전달 10이며, 이해+아이디어+정합이 75%를 차지합니다. 프로토타입은 프론트엔드 와이어프레임 수준이어도 괜찮고, 목업·슬라이드만이면 감점됩니다. 배점은 심사위원·파트너 합의로 조정될 수 있습니다.",
          en: "We look at the coherence of ‘understanding the company & problem → idea → demo’, not technical polish. The rubric is: company/problem understanding 20 · appropriateness of the idea 25 · demo ↔ idea alignment 30 · adoption feasibility 15 · delivery 10 — with understanding + idea + alignment making up 75%. A front-end wireframe-level prototype is fine; mockups or slides alone lose points. Weightings may be adjusted by agreement among judges and partners.",
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
      ko: "Zero100 Builderthon. All rights reserved.",
      en: "Zero100 Builderthon. All rights reserved.",
    },
  },

  toggle: {
    label: { ko: "EN", en: "한국어" }, // shows the language you'll switch TO
    aria: { ko: "Switch to English", en: "한국어로 전환" },
  },
};
