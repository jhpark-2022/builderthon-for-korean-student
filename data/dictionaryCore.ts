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
};

export const coreDict = {
  nav: {
    // 두 탐색 랜드마크의 이름 (2026-09-19, 접근성 감사 4). 이름 없는 nav가
    // 둘이면 iOS 로터에 "탐색, 탐색"으로 뜹니다. 하나는 상단 바(xl 이상의
    // 앵커 행), 하나는 폰·태블릿의 칩 레일입니다.
    primaryAria: { ko: "주요 탐색", en: "Primary" },
    sectionsAria: { ko: "챕터 목차", en: "Sections" },
    // 폰 목차 줄에 상주하는 12월 이벤트 버튼 (2026-09-20, 사용자: "8월 페이지에는
    // 12월 이벤트 페이지로 돌아갈 수 있는 버튼이 항상 보였으면 좋겠어, along with
    // the TOC at the top").
    //
    // 이름("크로싱 서울" / "CROSSING SEOUL")을 쓰지 않습니다. 목차 줄에 남는 폭이
    // 좁고 en은 138px이라 칩 하나가 그 줄을 다 먹습니다. 이름은 맨 위 아카이브
    // 배너와 마지막 화면의 CTA가 이미 말하고 있어요. 여기서는 **어디로 가는지**만
    // 말하면 됩니다. 이 페이지가 지난 이벤트라는 것은 배너가 이미 못 박았으므로
    // "12월"이면 그것이 지금 열려 있는 쪽이라는 뜻이 섭니다.
    toDecember: { ko: "12월 이벤트", en: "Dec event" },
    toDecemberAria: { ko: "12월 이벤트 페이지로 이동", en: "Go to the December event page" },
    program: { ko: "프로그램", en: "Program" },
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
    openChat: { ko: "오픈채팅", en: "Open Chat" },
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
