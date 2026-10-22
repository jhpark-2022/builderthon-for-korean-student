// ─────────────────────────────────────────────────────────────────────────────
// 사전의 작은 조각: 타입, links, 그리고 모든 경로의 공통 부품(헤더, 건너뛰기 링크, 언어 토글,
// 오픈채팅 링크, 초기화 토스트)이 읽는 절만 둡니다.
//
// DECIDED 2026-10-08 (성능 리뷰 2, 3): data/dictionary.ts 전체(gzip 약 50KB, 거의 8월 아카이브의 글)가
// SkipLink 하나 때문에 루트 레이아웃에 실려 홈, /quiz, /match까지 내려갔습니다. 공통 부품은 이 파일에서
// 읽고, 8월 페이지만 dictionary.ts를 읽습니다. dictionary.ts의 dict는 여기 절을 그대로 펼쳐 담으므로
// dict.nav 같은 기존 경로는 그대로 동작합니다. 공통 부품에서 dictionary.ts를 import 하지 마세요.
// ─────────────────────────────────────────────────────────────────────────────


export type Locale = "ko" | "en";
export type Phrase = { ko: string; en: string };

// Internal navigation only. The main site is an informational program page -
// its primary CTA is the internal #program anchor.
export const links = {
  program: "#program", // main internal CTA target
  // Builderthon sign-up target for the quiz result CTA. Placeholder for now.
  // TODO: 신청 폼 열리면 교체 (placeholder) - 당분간 program 앵커를 재사용.
  signup: "#program",
  // Organizer contact for partnership/sponsor inquiries, with a prefilled subject.
  // Deliberately a personal address rather than the school one: partner threads
  // outlive the .edu account.
  partnership:
    "mailto:pjh030924@gmail.com?subject=Zero100%20AI%20Builderthon%20Partnership%20Inquiry",
  // Public builderthon group chat - KakaoTalk 오픈채팅 "싱가폴 한인 학생 AI 빌더톤".
  // This is the open room anyone can join to ask a question; the participant
  // room registrants are invited to is a separate, private one.
  // DECIDED 2026-10-08 (사용자: "오픈채팅 - 열어줘"): 2026-09-17에 막았던 오픈채팅을 다시
  // 엽니다. 주소는 그때 보관해 둔 것 그대로입니다. 사이트의 모든 오픈채팅 문(헤더 버튼,
  // 폰 하단 바, 홈과 /2026-08의 자리들)이 `links.openChat &&`로 지키고 있어서 이 한 줄로
  // 함께 돌아옵니다. 다시 막으려면 빈 문자열로 두면 됩니다.
  openChat: "https://open.kakao.com/o/g6msvcFi",
  // 자리를 가리지 않는 일반 문의. 세 페이지 푸터의 한 줄이 씁니다(data/naru.ts의 naruLinks.general과 같은 주소, 같은 제목).
  general: `mailto:pjh030924@gmail.com?subject=${encodeURIComponent("나루 문의")}`,
};

export const coreDict = {
  // DECIDED 2026-10-13 (등록 브리프 2.1): 세 페이지를 잇는 칩 셋. 순서는 고정입니다(components/shared/PageChips.tsx).
  // 영문 칩은 브리프가 "Crossing Seoul"이라고 적었지만 정본(docs/brand.md 6장: 영문은 항상 대문자)을 따라 대문자입니다.
  // footerLabel은 푸터의 한 줄에서 쓰는 긴 이름입니다.
  pages: [
    // DECIDED 2026-10-20 (hwang 브리프 1.3, 4.1): EN 메뉴 이름은 "Home". 헤더 워드마크와 같은 글자가 한 줄에 둘 서지 않게. 푸터(footerLabel)는 그대로.
    // 같은 날 8월의 EN footerLabel "Zero100 builderthon, Aug 2026"을 "Aug 2026"으로 줄였습니다(EN 푸터 줄바꿈).
    { key: "crossing", href: "/", label: { ko: "크로싱 서울", en: "Home" }, footerLabel: { ko: "크로싱 서울", en: "CROSSING SEOUL" } },
    { key: "naru", href: "/naru", label: { ko: "나루", en: "NARU" }, footerLabel: { ko: "나루", en: "NARU" } },
    { key: "aug", href: "/2026-08", label: { ko: "8월 기록", en: "Aug 2026" }, footerLabel: { ko: "제로백 빌더톤 8월 기록", en: "Aug 2026" } },
  ],
  // DECIDED 2026-10-20 (hwang 브리프 4.1, 4.2, 4.3, D2, D3, D4): 세 페이지가 같은 사이트 메뉴, 같은 푸터, 같은 바이라인을 씁니다
  // (components/shared/SiteChrome.tsx). 메뉴는 알약이 아니라 글자 링크이고, 목차(챕터 칩)와 갈립니다. 후원은 "후원 문의" 메일 하나(D4),
  // "함께하는 사람"은 보류(D3). 푸터의 파트너 줄은 8월에 실제로 함께한 곳 중 주소가 있는 열여섯입니다.
  siteMenu: {
    aria: { ko: "사이트 메뉴", en: "Site menu" },
    open: { ko: "사이트 메뉴 열기", en: "Open site menu" },
    close: { ko: "사이트 메뉴 닫기", en: "Close site menu" },
    sponsor: { ko: "후원 문의", en: "Sponsorship" },
  },
  siteFooter: {
    line: { ko: "학생이 직접 운영하는 그룹 나루가 엽니다.", en: "Run by NARU, a student-run group." },
    // DECIDED 2026-10-22 (사용자: "지금까지 나루와 함께한 기업들"): 8월만이 아니라 12월과 제로백 네트워크까지 담습니다.
    partners: { ko: "나루와 함께한 곳", en: "With NARU so far" },
    rights: { ko: "© 2026 나루 NARU", en: "© 2026 NARU" },
  },
  footerNav: {
    aria: { ko: "사이트 안내", en: "Site" },
    openChat: { ko: "오픈채팅", en: "Open chat" },
    contact: { ko: "문의", en: "Contact" },
  },
  nav: {
    // 두 탐색 랜드마크의 이름 (2026-09-19, 접근성 감사 4). 이름 없는 nav가
    // 둘이면 iOS 로터에 "탐색, 탐색"으로 뜹니다. 하나는 상단 바(xl 이상의
    // 앵커 행), 하나는 폰·태블릿의 칩 레일입니다.
    primaryAria: { ko: "주요 탐색", en: "Primary" },
    sectionsAria: { ko: "챕터 목차", en: "Sections" },
    // 2026-10-13 (등록 브리프 2.1): 여기 있던 toDecember("12월 이벤트" / "Dec event")는 페이지 칩 셋(아래 pages)이 대신합니다.
    // 2026-10-13 (등록 브리프 2.3): 영문은 정본대로 Programme.
    // DECIDED 2026-10-13 (사용자: "TOC가 수가 너무 적음, 실제 내용에 비해"): 앞의 넷을 더했습니다. 8월 페이지는 22화면인데
    // 첫 칩(프로그램)이 7.2화면에 있어, 그 앞의 결과, 취지, 참가, 혜택 네 챕터로 가는 길이 없었습니다.
    results: { ko: "결과", en: "Results" },
    about: { ko: "취지", en: "Why" },
    join: { ko: "참가", en: "Who" },
    benefits: { ko: "혜택", en: "Benefits" },
    program: { ko: "프로그램", en: "Programme" },
    // 2026-08-13에 앵커에서 뺐다가 2026-08-23에 되살렸습니다. 뺐던 이유는
    // "프로그램 앵커로 닿고 Day 카드에도 반복된다"였는데, Day 1이 지나고 Day 7·8
    // 세션이 남은 지금은 "누가 언제 오는지"가 실제로 찾는 정보가 됐습니다.
    speakers: { ko: "연사", en: "Speakers" },
    mentoring: { ko: "멘토링", en: "Mentoring" },
    builders: { ko: "파트너", en: "Partners" },
    faq: { ko: "FAQ", en: "FAQ" },
    // Nav anchor for the quiz, sitting after FAQ. Deliberately a text link at the
    // same weight as the section anchors - a step below the open-chat ghost
    // button, two below the register pill.
    quizNav: { ko: "유형 테스트 ✦", en: "Type test ✦" },
    // 폰 헤더의 퀴즈 칩에 붙는 짧은 라벨 (2026-08-12). 위의 전체 라벨은 좁은
    // 헤더에서 오픈채팅·등록 칩을 밀어냅니다. 그 칩의 접근성 이름은 여전히
    // quizNav이니(aria-label), 이 문자열은 눈으로 읽는 쪽만 담당합니다.
    quizNavShort: { ko: "퀴즈", en: "Quiz" },
    partner: { ko: "파트너십 문의", en: "Partner with us" },
    // Nav open-chat entry. Present from first paint (unlike the register button,
    // which is scroll-revealed): the whole point is to give someone who isn't
    // ready to register a door that is already open when they land.
    // 2026-10-11 (브랜드 브리프 B11): "Open Chat"에서 "Open chat"으로. 푸터(data/naru.ts)와 같은 표기입니다.
    openChat: { ko: "오픈채팅", en: "Open chat" },
    // DECIDED 2026-08-22 (마감 후 청산): 등록 진입점 전면 제거 - 비활성 버튼을
    // 남기지 않는다. 1순위 액션은 오픈채팅, 히어로 1순위는 트랙. 등록 코드
    // (모달·API·registered 상태)는 삭제하지 않고 진입점만 끊는다.
    //
    // 위 openChat은 nav와 바의 짧은 라벨이고, 이건 등록 버튼이 있던 자리를 받는
    // 긴 라벨입니다. 같은 문을 여는 같은 링크지만, 페이지의 마지막 CTA 자리에
    // "오픈채팅" 넉 자만 서면 이름표처럼 읽힙니다.
    //
    // DECIDED 2026-08-24: 브리지 CTA 라벨 분리 - 클로징과 같은 문구가 모바일에서
    // 연달아 반복되어 역할을 나눔(브리지=소식, 클로징=합류).
    // 이제 이 키를 읽는 곳은 클로징 하나뿐입니다. 비전 브리지는 자기 라벨
    // (dict.about.visionChatCta)을 갖고 갔어요 - 되돌리려면 그 키를 지우고 여기로
    // 다시 부르면 됩니다.
    openChatJoin: { ko: "오픈채팅으로 함께하기", en: "Join the open chat" },
    openChatAria: { ko: "카카오톡 오픈채팅방 열기", en: "Open the KakaoTalk open chat" },
    // 2026-10-12 (등록 브리프 1.3, 리뷰 S7): 헤더 오픈채팅 알약의 title. 폰에서는 아이콘만 보이는 자리입니다.
    openChatTitle: { ko: "카카오톡 오픈채팅", en: "KakaoTalk open chat" },
    // Brand suffix beside the Zero100 wordmark in the nav.
    brandSuffix: { ko: "AI 빌더톤", en: "AI Builderthon" },
  },

  // ── Mobile sticky action bar ──────────────────────────────────────────────
  // Register stays the primary; the quiz rides along as a chip so it is reachable
  // from anywhere on a phone without competing for the same visual weight.
  // The phone's fixed bottom rail. It carries the two actions the funnel is built
  // on - the low-friction door (open chat) and the commitment (register) - and
  // borrows their labels from `nav` so the same door never has two names.
  // `quiz` ("✦ 내 유형은?") used to sit here and was removed: the quiz already has
  // two permanent entrances on a phone (the nav's ✦ chip and the hook card in the
  // 혜택 band), while open chat had none between the hero and the footer.
  stickyBar: {
    aria: { ko: "빠른 실행", en: "Quick actions" },
  },

  // Toast shown by the undocumented ?reset=1 QA helper (see components/ResetHandler).
  resetToast: {
    // EDIT 2026-08-17: "로컬 데이터"·"새 사용자 상태"를 걷어냈습니다. QA용
    // 헬퍼라 참가자가 볼 일은 드물지만, 보이는 순간 개발자 말이 그대로 뜹니다.
    ko: "이 브라우저에 저장된 기록을 지웠어요. 처음 온 것과 같은 상태예요",
    en: "Saved data cleared. You're starting fresh",
  },

  // ── Registration - hero question hooks, nav button, and the register modal ──
  register: {
    // ── Open-chat CTA (혜택 밴드의 텍스트 링크) ─────────────────────────────
    // 등록을 망설이는 사람을 위한 낮은 문턱의 출구였습니다. 등록 CTA 옆에 서면서도
    // 시각적으로 경쟁하지 않도록 어디서나 텍스트 링크로만 렌더합니다.
    //
    // EDIT 2026-08-22 (마감 후 청산): "아직 고민 중이라면"이 무엇을 고민한다는
    // 것인지 가리킬 대상이 없어졌습니다(등록 CTA가 옆에서 사라졌으니까). 지금 이
    // 링크가 하는 일은 망설이는 사람을 붙잡는 것이 아니라 다음 소식으로 잇는
    // 것이라, 문장이 그쪽을 봅니다. 텍스트 링크로 두는 규칙은 그대로입니다.
    openChatCta: {
      ko: "다음 소식은 오픈채팅에서 먼저 알려드려요",
      en: "News lands in the open chat first",
    },
  },

  a11y: {
    skipToContent: { ko: "본문으로 건너뛰기", en: "Skip to content" },
    scrollTop: { ko: "맨 위로 이동", en: "Scroll to top" },
  },

  toggle: {
    // WCAG 2.5.3 (Label in Name): the accessible name has to CONTAIN the visible
    // label, which on this control is "EN / KR". It read only "Switch to English",
    // so a voice-control user saying "EN" or "KR" could not activate it - the one
    // control on the page whose visible text is the language itself.
    // "EN/KR" with no spaces - that is exactly how the three spans render, and the
    // check compares the literal visible string.
    aria: { ko: "EN/KR: Switch to English", en: "EN/KR: 한국어로 전환" },
    // naru 변형(버튼 두 개짜리 묶음)의 이름 (2026-09-19, 접근성 감사 8).
    // 위의 aria는 버튼 **하나**가 다음 언어로 넘기는 zero100 변형용이라
    // "Switch to English"라는 행동 설명이 맞습니다. 나루 것은 버튼이 둘이고
    // 각자 자기 이름(EN / KR)과 aria-current를 이미 갖고 있어서, 묶음에
    // 필요한 것은 행동이 아니라 **이름**입니다. 그리고 한국어 페이지에서
    // 영어 문장을 읽어 주지 않게 로케일을 따라갑니다(3.1.2).
    // "EN/KR"은 그대로 답니다. 눈에 보이는 글자가 그것이라 2.5.3(Label in
    // Name)이 이름 안에 포함되기를 요구합니다.
    groupAria: { ko: "EN/KR: 언어 선택", en: "EN/KR: Language" },
  },
};
