// ─────────────────────────────────────────────────────────────────────────────
// 나루 홈(/)의 카피 정본. 전부 { ko, en }.
//
// data/dictionary.ts와 섞지 않습니다. 그 파일은 8월 회차(/2026-08)의 정본이고,
// 여기는 나루 그룹의 정본입니다. 두 페이지는 같은 사이트지만 서로 다른 것을
// 말해요. 8월 카피에 소급 적용되는 규칙은 없고, 반대도 마찬가지입니다.
//
// 원본 문서. 문장을 고칠 때는 아래를 먼저 보세요.
//   나루_Overview.pdf        정체성, 3층 구조, 층별 하는 것과 얻는 것, 후원의 단계
//   매니페스토_나루.pdf       코어 2축, 문체의 기준
//   빌더톤_2회차_원페이저.pdf  12월 이벤트 기획 (내부 공유용, 확정 아님)
//                            문서 안의 "2회차", "빌더톤 서울" 표기는 웹에
//                            가져오지 않습니다. 아래 용어 위계 참고.
//
// ── 문체 ────────────────────────────────────────────────────────────────────
// 평서체 선언문. 주어는 "우리". "나"는 쓰지 않습니다. 문장은 짧게. 광고 문구
// 같은 느낌표와 물음표를 쓰지 않습니다.
//
// ── 쓰지 않는 말 ─────────────────────────────────────────────────────────────
//   심사            → 피드백 패널
//   순위, 등수      → 무순위, 부문별
//   데모데이        → 결과 공유회
//   각서, MOU, 협약서, 정관, 사비
//   회비, 가입, 멤버십, 구독   (아래 예외 참고)
//   Foundation, Singapore를 이름에 붙이는 것
//   다리(bridge)를 놓는다는 표현
//   "빌더톤이 나루다"식으로 이벤트와 그룹을 섞는 표현
//
// 예외: how.notDoing은 "회비를 받지 않습니다", "가입 폼을 두지 않습니다"라고
// 씁니다. 금지된 것은 그것을 **제안하는 일**이지 **부정하는 일**이 아닙니다.
// 나루가 하지 않는 것을 명시하는 것은 Overview 06의 핵심이고, 그 문장에서 낱말을
// 빼면 문장이 사라집니다. 금지어 검사에서 이 세 줄이 잡히면 그대로 두세요.
//
// ── em dash(—)를 쓰지 않습니다 ───────────────────────────────────────────────
// 쉼표와 마침표로 끊습니다. 이 주석 블록도 같은 규칙을 따릅니다.
//
// ── 용어 위계 ────────────────────────────────────────────────────────────────
// 이벤트 > 회차 > 빌더톤.
//
// 8월 = 제로백 빌더톤. 나루의 첫 이벤트이고, 그 이름은 그 이벤트의 것입니다.
// 12월 = 크로싱 서울 CROSSING SEOUL (2026-09-15 확정, lib/naruDates.ts).
//
// **12월을 제로백, 2회차, 빌더톤이라고 부르지 않습니다.** 제로백의 속편이 되면
// 12월에 오는 사람은 8월을 모르면 늦었다고 느끼고, 기업은 같은 문제를 또 여는
// 자리로 읽습니다. 12월은 제로백에서 나온 코어 2개를 잇는 다른 이벤트입니다.
// 형식이 빌더톤일지도 아직 정해지지 않았어요.
//
// "회차"는 한 이벤트의 개별 실행을 가리키는 일반어로만 씁니다. "들어오는 길은
// 회차 하나다" 같은 문장이 그 쓰임입니다. 12월을 "다음 회차"라고 부르면 안
// 됩니다. 그건 제로백의 다음 회차라는 뜻이 됩니다.
//
// 제로백 빌더톤은 나루가 여는 이벤트 중 하나였지 나루 자신이 아닙니다.
//
// ── 구분자 ───────────────────────────────────────────────────────────────────
// 칩과 라벨, 푸터 크레딧의 구분자는 가운뎃점(·)이 아니라 U+2002(EN SPACE)입니다.
// dictionary.ts 상단의 하우스 스타일(2026-08-16)을 그대로 따릅니다. 이 파일에
// 이미 들어 있는 그 글자를 복사해 쓰세요.
// ─────────────────────────────────────────────────────────────────────────────

import type { Phrase } from "./dictionary";

// ─────────────────────────────────────────────────────────────────────────────
// 문의 창구.
//
// TODO: confirm. 나루 전용 주소가 생기면 갈아 끼웁니다. 지금은 제로백 빌더톤이 쓰던
// 개인 주소를 그대로 씁니다(dictionary.ts의 links.partnership과 같은 주소).
// 학교 주소를 쓰지 않는 이유도 같습니다: 파트너 스레드는 .edu 계정보다 오래
// 갑니다.
//
// 제목만 나루의 것으로 바꿉니다. 받는 쪽 편지함에서 제로백 빌더톤의 스레드와
// 섞이지 않아야, 어느 이벤트 이야기인지 열어 보지 않고 압니다.
// ─────────────────────────────────────────────────────────────────────────────
const CONTACT = "pjh030924@gmail.com";

export const naruLinks = {
  contact: CONTACT,
  /** 자리를 가리지 않는 일반 문의. 푸터가 씁니다. */
  general: `mailto:${CONTACT}?subject=${encodeURIComponent("나루 문의")}`,
  /** 학생회 주관 문의. */
  organiser: `mailto:${CONTACT}?subject=${encodeURIComponent("나루 학생회 주관 문의")}`,
  /**
   * 출제사와 후원 문의. #december의 메일과 #join 기업 카드가 같은 문입니다.
   *
   * DECIDED 2026-09-17: 전에는 #december가 "크로싱 서울 문의", 기업 카드가
   * "나루 후원 문의"로 갈라져 있었습니다. 같은 사람이 어디서 눌렀느냐에 따라
   * 편지함의 스레드 제목이 달라졌고, #december의 라벨은 "출제사 및 후원"인데
   * 제목에는 그 말이 없었어요. 문은 하나이고 제목은 라벨과 같은 말을 합니다.
   */
  sponsor: `mailto:${CONTACT}?subject=${encodeURIComponent("나루 출제사 및 후원 문의")}`,
  /** 운영진 관심. */
  crew: `mailto:${CONTACT}?subject=${encodeURIComponent("나루 운영진 문의")}`,
  /** 8월 알럼이 자기 이야기를 보내는 자리. #people 챕터의 유일한 공급원입니다. */
  alumni: `mailto:${CONTACT}?subject=${encodeURIComponent("제로백 빌더톤 이야기")}`,
  /** 제로백 빌더톤(8월)의 기록. */
  archive: "/2026-08",
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// 내비게이션 앵커. id는 NaruHome의 <Chapter id>와 반드시 같아야 합니다.
// href이자 useActiveSection이 관찰하는 대상이라, 한쪽만 바꾸면 링크는 되는데
// 현위치 표시가 죽거나 그 반대가 됩니다(JourneyNav의 같은 주석 참고).
//
// 여섯 개인 이유: 홈은 8월 페이지와 달리 한 화면에 다 들어가는 길이라, 앵커가
// 챕터 수를 넘지 않습니다. #people은 목록에 없습니다. 스토리가 비어 있으면
// 챕터 자체가 렌더되지 않아서, 앵커만 남으면 아무 데도 가지 않는 칩이 됩니다.
// TODO: 스토리가 들어오면 #people을 #join 뒤, #why 앞에 더하세요. NaruHome이
// 그 자리에 그립니다(2026-09-17에 주석과 렌더가 어긋나 있던 것을 맞췄습니다).
// ─────────────────────────────────────────────────────────────────────────────
// ── P3. 오픈채팅 라벨 (DECIDED 2026-09-15) ─────────────────────────────────
// OpenChatLink는 기본 라벨을 dict.register.openChatCta에서 읽습니다. 그 문장은
// "다음 소식은 오픈채팅에서 먼저 알려드려요"이고, 8월 등록 마감 뒤에 급히 고친
// 것입니다. 문제가 셋이었습니다.
//
//   1. 문장형이라 버튼이 행동으로 읽히지 않습니다.
//   2. 홈에서 세 자리에 같은 문장이 나오는데 누르는 이유가 자리마다 다릅니다.
//      #join 참가자 카드에서는 바로 위 본문과 같은 말이 두 줄 간격으로 두 번
//      나왔습니다.
//   3. 이 파일 맨 위가 선언한 "8월 정본과 섞지 않는다"를 그 한 줄이 깨고 있었어요.
//
// 무엇을 언제 받는지를 말하게 합니다. 막연한 구독이 아니라 날짜가 있는 약속이
// 되어야, 미정 목록(december.tbd)과 이어집니다.
export const openChatLabels = {
  december: { ko: "등록이 열리면 가장 먼저 알기", en: "Know the day registration opens" },
  join: { ko: "오픈채팅에서 소식 받기", en: "Get news in the open chat" },
  footer: { ko: "오픈채팅", en: "Open chat" },
} as const;

// DECIDED 2026-09-16: #why가 맨 아래로 갑니다. 목록의 순서는 페이지의 순서와
// 반드시 같아야 합니다. 여기가 화면 순서와 어긋나면, 앵커를 눌러 내려간 사람이
// 한 칸 위로 튀어 오르고 현위치 표시가 목록을 거꾸로 훑습니다.
//
// 순서가 바뀐 이유는 챕터 쪽에 적어 두었습니다(NaruHome.tsx의 CH6 · 왜 존재하는가).
// 한 줄로 줄이면: 프로그램이 좋아야 메시지에 값이 생깁니다.
//
// DECIDED 2026-09-17: #december가 #how 앞으로 갑니다.
// 실측(390px, ko)에서 12월 제목이 5.9화면, 본문의 첫 행동이 8.6화면에 있었습니다.
// 그 사이에 있던 #how는 학생회와 기업, 운영진이 읽는 챕터이고, 12월을 예비하는
// 문장은 한 줄도 없었습니다. 이벤트 줄(8월 → 12월)을 먼저 끝내고, 조직 줄
// (세 층 → 문 → 이유)을 통째로 뒤에 둡니다. 히어로 서브의 두 문장 순서와
// 챕터 순서가 같아집니다. 자세한 근거는 NaruHome.tsx의 CH3 주석.
//
// "세 층"이 "학생회와 기업"이 된 이유: 그 챕터를 읽어야 하는 사람(학생회 임원,
// 기업 담당자)이 헤더에서 자기 자리를 찾지 못했습니다. 층이라는 말은 읽고 난
// 뒤에야 뜻이 통하는 이름이고, 헤더는 읽기 전에 고르는 자리입니다.
// DECIDED 2026-09-17 (2차): 이벤트와 그룹을 나눕니다. 위가 이벤트(크로싱 서울
// 히어로 → 8월의 기록 → 프로그램), 아래가 그룹(나루 → 학생회와 기업 → 함께).
// 사용자의 지시: "이벤트와 그룹 설명은 분리. 맨 아래에 그룹 로고와 존재 목적,
// 그 위에 8월 recap과 12월 설명. 12월 설명은 8월 사이트와 같은 격식으로."
// #why 앵커는 없어졌습니다. 코어 둘은 #naru 안에 있고, 안쪽 앵커 id="why"가
// 남아 있어 옛 링크(/#why, notSequel의 링크)는 그대로 닿습니다.
export const naruNav: { id: string; label: Phrase }[] = [
  { id: "top", label: { ko: "크로싱 서울", en: "CROSSING SEOUL" } },
  { id: "record", label: { ko: "8월의 기록", en: "August" } },
  { id: "december", label: { ko: "프로그램", en: "Programme" } },
  { id: "naru", label: { ko: "나루", en: "NARU" } },
  { id: "how", label: { ko: "학생회와 기업", en: "Councils and companies" } },
  { id: "join", label: { ko: "함께", en: "Join" } },
];

export interface Stat {
  value: Phrase;
  label: Phrase;
  /** 숫자만으로는 전해지지 않는 한 줄. 없으면 그리지 않습니다. */
  note?: Phrase;
}

export interface RecordPhoto {
  src: string;
  /**
   * **전부 4:3이어야 합니다.** 화면은 4:3 칸에 채우고(NaruHome의 PhotoWall),
   * 4:3이 아닌 원본을 넣으면 그 자리에서 잘립니다. 자를 자리는 런타임이 아니라
   * 사람이 고르세요 - export 단계에서 4:3으로 자른 뒤 여기 넣습니다.
   *
   * 지금 이 값은 화면이 읽지 않습니다(PhotoWall이 fill을 씁니다). 어떤 원본이
   * 들어와 있는지를 기록으로 남겨 두는 자리예요. 4:3이 아닌 숫자가 보이면 그
   * 사진은 잘려서 그려지고 있다는 뜻입니다.
   */
  width: number;
  height: number;
  /**
   * 캡션은 몇 장에만 답니다(2026-09-16). 사진 벽이 열두 장이라 전부 캡션을
   * 달면 사진을 늘린 만큼 글이 늘어납니다. day와 caption은 한 쌍입니다:
   * 하나만 있으면 화면이 반쪽짜리 줄을 그립니다.
   */
  day?: Phrase;
  caption?: Phrase;
  alt: Phrase;
}

export interface Layer {
  role: Phrase;
  who: Phrase;
  brings: Phrase;
  does: Phrase;
  gets: Phrase;
  /**
   * 이 층의 사람이 문의하는 문. #join의 카드 id와 그 링크의 라벨입니다.
   * 2026-09-17: #how에서 #join으로 가는 길이 없어서, 학생회 임원과 기업 담당자가
   * 헤더의 "함께"를 눌러야 한다는 것을 스스로 알아내야 했습니다. 새 목적지는
   * 없고 앵커만 답니다.
   */
  join: { id: string; label: Phrase };
}

export interface JoinCard {
  /** 앵커 id. #how의 층 카드가 여기로 옵니다. 바꾸면 Layer.join.id도 같이. */
  id: string;
  who: Phrase;
  lines: [Phrase, Phrase];
  doorLabel: Phrase;
  door: string;
  /** 오픈채팅이 창구인 카드는 href 대신 이 플래그를 켭니다. */
  openChat?: boolean;
}

/**
 * 제로백 빌더톤에서 나온 사람의 이야기.
 *
 * 비어 있으면 #people 챕터 자체가 렌더되지 않습니다(NaruHome 참고).
 *
 * **인용문을 지어내지 마세요.** 한 회차의 가장 중요한 산출물은 결과물이 아니라
 * 사람의 이야기이고(매니페스토 VIII), 그 이야기의 값어치는 그것이 실제로 있었던
 * 일이라는 데서 옵니다. 지어낸 한 줄은 그 값어치를 통째로 없앱니다.
 *
 * 채우기 전에 필요한 것: 본인의 동의, 그리고 본인이 쓴 문장.
 */
export interface Story {
  name: Phrase;
  school: Phrase;
  quote: Phrase;
  after: Phrase;
}

export const naru = {
  // ── CH0 · 히어로 ──────────────────────────────────────────────────────────
  // 구체적인 사실로 시작합니다. 코어는 다음 챕터의 몫이에요.
  //
  // DECIDED 2026-09-15: 히어로에 이상론을 두지 않습니다. 12월은 코어를 명시적으로
  // 말했을 때도 사람이 오는지 보는 2차 시행이지만, 첫 화면까지 그러면 모객이
  // 좁아집니다. 첫 화면은 언제, 어디서, 무엇이 있었고 무엇이 온다 입니다.
  hero: {
    // 로고가 바로 위에 있으므로 이름을 한 번 더 말하지 않습니다. 이 줄은 나루가
    // 무엇인지를 한 줄로 말하는 자리입니다.
    // TODO: confirm. 12월이 국경을 여니 "싱가포르에서 시작한 한인 학생 빌더
    // 커뮤니티"가 후보입니다. 지금은 바꾸지 않습니다. 나루의 정체성 문구는
    // Overview와 로고 링의 SINGAPORE에 묶여 있고, 그건 이벤트 포지션이 아니라
    // 그룹의 정의라 사용자가 정할 일입니다.
    eyebrow: {
      ko: "싱가포르 한인 학생 빌더 커뮤니티",
      en: "Korean student builders in Singapore",
    },
    // 확정 태그라인. 매니페스토의 마지막 문단에서 왔습니다.
    // "건너는 일은 각자가 한다. 나루는 건널 수 있는 자리를 만들고, 건너간 사람이
    // 다시 돌아와 서는 자리도 같은 나루다."
    //
    // TODO: confirm. 영문은 초안입니다. 한글이 정본이고 영문은 보조입니다.
    titleLine1: { ko: "건너는 건 각자가 한다.", en: "You do the crossing." },
    titleLine2: { ko: "자리는 우리가 만든다.", en: "We make the place." },
    // 숫자 둘과 날짜 하나. 전부 확정된 사실입니다.
    sub: {
      // 날짜와 이름은 lib/naruDates.ts에서 조립해 넣습니다. 이 문자열에 "12월
      // 9일"이나 "크로싱 서울"을 직접 쓰지 마세요(NaruHome의 히어로 렌더 참고).
      // {date}와 {name} 자리를 그대로 두면 렌더가 채웁니다.
      // 이름에 "서울"이 이미 있어서 날짜 뒤에 도시를 한 번 더 쓰지 않습니다.
      // "12월 9일 서울, 크로싱 서울에서는"이 되어 서울이 연달아 두 번 나옵니다.
      ko: "2026년 8월, 싱가포르에서 59명이 8일을 건넜습니다. {date}, {name}에서는 국경과 상관없이 만납니다.",
      en: "In August 2026, fifty-nine people crossed eight days in Singapore. On {date}, {name} brings them together whichever country they study in.",
    },
    ctaDecember: { ko: "크로싱 서울 알아보기", en: "About CROSSING SEOUL" },
    ctaArchive: { ko: "제로백 빌더톤의 기록", en: "The Zero100 builderthon record" },
    // 로고의 대체 텍스트. 스크린리더가 읽는 이름이라 브랜드 표기 규칙을 그대로
    // 따릅니다: 한글이 주, 영문이 보조.
    logoAlt: { ko: "나루 NARU", en: "나루 NARU" },
  },

  // ── CH1 · 왜 존재하는가 ───────────────────────────────────────────────────
  // 매니페스토 II를 그대로 옮깁니다. 여기서 문장을 무르게 만들지 마세요.
  // 이 두 개를 바꾸는 결정은 매니페스토를 고쳐 쓰는 일과 같습니다(매니페스토 IX).
  // ── CH0 · 이벤트 히어로 (DECIDED 2026-09-17) ──────────────────────────────
  // 홈의 첫 화면이 그룹에서 이벤트로 바뀝니다. 8월 사이트의 히어로가 8월
  // 이벤트였듯이, 이 히어로는 크로싱 서울입니다. 이름과 날짜, 도시는 전부
  // lib/naruDates.ts에서 옵니다. 여기에는 문장만 있습니다.
  // 나루 로고는 헤더에만 작게 있고, 큰 로고와 존재 목적은 맨 아래 #naru로
  // 내려갔습니다. 위의 hero 블록(태그라인)은 그쪽이 씁니다.
  eventHero: {
    eyebrow: { ko: "나루의 다음 이벤트", en: "NARU's next event" },
    // 이름 아래 한 줄. 포지션은 december.heading이 그대로 맡습니다.
    sub: {
      ko: "한국의 대학생과 해외의 한인 유학생이 같은 문제 앞에 섭니다. raw data에서 문제를 찾는 것부터 앞에서 증명하기까지, 닷새.",
      en: "Students at Korean universities and Korean students abroad stand in front of the same problem. From finding it in raw data to proving it out front, in five days.",
    },
    ctaProgram: { ko: "프로그램 보기", en: "See the programme" },
  },

  // ── CH3 · 나루 (그룹) ─────────────────────────────────────────────────────
  // 맨 아래. 로고, 태그라인, 그리고 존재 목적(변하지 않는 두 개). 이벤트 위에
  // 그룹이 있는 것이 아니라, 이벤트 아래에 그룹이 서명하는 구조입니다.
  group: {
    eyebrow: { ko: "나루 NARU", en: "나루 NARU" },
    lead: {
      ko: "이벤트는 나루가 학생회와 기업을 잇는 지금의 방식입니다. 방식은 바뀝니다. 바뀌지 않는 것은 아래 두 개입니다.",
      en: "An event is how NARU connects student associations and companies for now. The method changes. What does not change is the two things below.",
    },
  },

  why: {
    eyebrow: { ko: "변하지 않는 두 개", en: "The two that do not change" },
    heading: {
      ko: "우리는 두 가지를 만들려고 모였습니다",
      en: "We came together to build two things",
    },
    cores: [
      {
        index: "01",
        title: {
          ko: "안전하게 도전할 수 있는 자리",
          en: "A safe place to try something new",
        },
        lines: [
          {
            ko: "스크리닝이 없고, 순위가 없습니다. 못해도 되는 자리입니다.",
            en: "No screening, no ranking. It is a place where doing badly is allowed.",
          },
          {
            ko: "여기서 잘하지 못한 것은 어디에도 기록되지 않습니다. 대신 끝까지 해본 것은 남습니다.",
            en: "Nothing you do poorly here is recorded anywhere. What stays is that you went all the way through.",
          },
        ],
        keeps: {
          ko: "스크리닝 없이 전원에게 진짜 기업 문제를 줍니다. 순위 대신 부문별로 시상하고, 평가는 결과물보다 과정에 무게를 둡니다.",
          en: "Everyone gets a real company problem, with no screening. Awards go by category instead of placing, and the weight sits on the process rather than the artefact.",
        },
      },
      {
        index: "02",
        title: {
          ko: "자기 가치를 증명해 보는 경험",
          en: "A chance to prove your own worth",
        },
        lines: [
          {
            ko: "연습이 아니라 진짜 앞에 섭니다. 실명이 박힌 기업, 실제로 그 일을 하는 사람, 답이 정해지지 않은 문제입니다.",
            en: "Not a rehearsal. A company with its name on it, the person who actually does the work, a problem with no settled answer.",
          },
          {
            ko: "그 앞에서 자기 판단으로 무언가를 만들고, 그 경험을 증명하는 실물을 손에 쥐고 나갑니다.",
            en: "Standing in front of that, you build something on your own judgement, and you leave holding something real that proves it.",
          },
        ],
        keeps: {
          ko: "학점도 이력서도 보지 않습니다. 실명이 박힌 기업의 문제 하나가 전부이고, 증명은 마지막 날 그 기업 앞에서 합니다.",
          en: "We do not look at your grades or your CV. One problem from a named company is the whole of it, and you prove it in front of that company on the last day.",
        },
      },
    ],
    keepsLabel: { ko: "그래서 지키는 것", en: "So this is what we hold" },
    // ── 약속이 지켜지는 지점 ───────────────────────────────────────────────
    // ADDED 2026-09-16. 출처는 12월 기획 슬라이드의 코어 장(02)입니다. 그 장은
    // 왼쪽에 약속을, 오른쪽에 그 약속이 실제로 지켜지는 지점을 놓습니다.
    //
    // 이 블록이 없으면 위의 코어 둘은 구호입니다. 안전한 자리와 증명할 기회는
    // 누구나 말할 수 있고, 말만으로는 아무 값이 없어요. 값은 "그래서 무엇을
    // 재느냐"에서 나옵니다. 몇 명이 왔느냐가 아니라 몇 팀이 끝까지 갔느냐를
    // 본다는 문장이, 위의 두 문장을 검증 가능한 것으로 만듭니다.
    //
    // measure의 숫자를 지어내지 마세요. 8월의 실측은 #record의 stats에 있고,
    // 여기서는 무엇을 보는지만 말합니다.
    execLabel: { ko: "약속이 지켜지는 지점", en: "Where the promise is kept" },
    execLead: {
      ko: "위의 둘은 우리가 약속하는 것입니다. 약속은 프로그램 안의 어느 한 시간에서 지켜지거나 깨집니다.",
      en: "The two above are what we promise. A promise is kept or broken inside one particular hour of the programme.",
    },
    exec: [
      {
        index: "i",
        title: { ko: "멘토링 한 시간의 밀도", en: "The density of one hour of mentoring" },
        body: {
          ko: "코어가 지켜지느냐 아니냐는 결국 여기서 갈립니다. 슬롯을 늘리는 것과 그 한 시간이 밀도 있는 것은 다른 일이고, 8월에 부족했던 것은 슬롯이 아니라 그 한 시간을 쓰게 만드는 설계였습니다.",
          en: "This is where the core holds or gives. Adding slots and making one hour dense are different jobs, and what August lacked was not slots but a design that got people to use them.",
        },
      },
      {
        index: "ii",
        title: { ko: "내 가치를 들어주는 사람", en: "Who is listening" },
        body: {
          ko: "누가 듣느냐, 그리고 그들이 얼마나 진심이었느냐가 참가자가 실제로 기억하는 전부입니다. 상금은 8월 참가 동기에서 언급조차 되지 않았고, 꼽힌 것은 평소 만날 수 없는 대표와 멘토였습니다.",
          en: "Who listens, and how much they meant it, is the whole of what a participant actually remembers. In August prize money went unmentioned as a reason to come. What people named were the founders and mentors they could not otherwise meet.",
        },
      },
    ] as { index: string; title: Phrase; body: Phrase }[],
    measureLabel: { ko: "그래서 재는 것", en: "So this is what we count" },
    measure: {
      ko: "몇 명이 왔느냐가 아닙니다. 몇 팀이 끝까지 갔느냐, 그리고 멘토링을 한 번이라도 받은 팀이 몇이냐를 봅니다.",
      en: "Not how many came. How many teams went all the way through, and how many booked mentoring even once.",
    },
    note: {
      ko: "문턱이 낮아야 커지고, 롤모델이 있어야 자랍니다.",
      en: "A low doorway is what makes it grow. Role models are what make it grow up.",
    },
    noteBody: {
      ko: "둘 중 하나만 있으면 친목 모임이거나 소수의 클럽이 됩니다. 둘을 동시에 지키는 것이 이 그룹이 하는 일이고, 부딪힐 때 어느 쪽으로 기울일지 매번 판단하는 것이 실력입니다.",
      en: "With only one of them you end up as either a social circle or a small elite club. Holding both at once is this group's work, and deciding which way to lean when they collide is the skill.",
    },
    agendaLabel: { ko: "방법은 바뀝니다", en: "The method changes" },
    agenda: {
      ko: "AI도, 8일이라는 길이도, 지금의 형식도 방법입니다. 어젠다는 상황을 따라 바뀌고, 8일이 4일이 되어도 됩니다. 바뀌면 안 되는 것은 위의 두 개뿐입니다.",
      en: "AI, the eight days, the format we use now: all of them are method. The agenda changes as the situation does, and eight days may become four. Only the two above cannot change.",
    },
  },

  // ── CH2 · 8월의 기록 ──────────────────────────────────────────────────────
  // 숫자는 전부 실측입니다. 하나라도 어림하지 마세요. 이 숫자들이 기업에 우리를
  // 설명하는 근거이고, 한 번 부풀리면 다음 이벤트의 모든 숫자가 의심받습니다.
  record: {
    // 8월 이벤트의 이름이 여기에 있습니다. 홈에서 "제로백 빌더톤"이라는 말이
    // 나오는 자리는 이 챕터와 아카이브로 가는 링크뿐입니다. december 블록에
    // 이 낱말이 하나라도 들어가면 잘못된 것입니다.
    eyebrow: { ko: "제로백 빌더톤 2026.08 싱가포르", en: "Zero100 builderthon Aug 2026, Singapore" },
    heading: { ko: "8월에 있었던 일", en: "What happened in August" },
    // DECIDED 2026-09-16: 한 문장입니다. 이 챕터가 하는 일은 8월을 설명하는 것이
    // 아니라 8월이 있었다는 것을 보여 주는 것으로 바뀌었습니다. 설명은 전부
    // /2026-08에 그대로 있고, 여기서는 숫자 다섯과 사진 열둘, 그리고 그쪽으로
    // 가는 버튼 하나만 남깁니다. lead2는 더 이상 화면에 없지만 키는 둡니다.
    lead: {
      ko: "나루의 첫 이벤트. 2026년 8월 22일부터 29일까지, 싱가포르에서 8일이었습니다.",
      en: "NARU's first event. Eight days in Singapore, 22 to 29 August 2026.",
    },
    // 이 줄이 CH2를 CH1과 묶습니다. 8월이 자랑거리라서 여기 있는 것이 아니라,
    // 코어 2개가 거기서 나왔기 때문에 있습니다. 순서가 반대였어요. 먼저 해 보고
    // 나서 무엇이 바뀌면 안 되는지를 알았습니다.
    lead2: {
      ko: "실제 기업의 문제를 스크리닝 없이 받아 8일 동안 풀고, 마지막 날 앞에서 증명했습니다. 이 이벤트에서 코어 2개가 나왔습니다.",
      en: "Teams took a real company's problem with no screening, worked it for eight days, and proved it out front on the last day. The two cores came out of this event.",
    },
    stats: [
      { value: { ko: "74명", en: "74" }, label: { ko: "신청", en: "applied" } },
      { value: { ko: "59명", en: "59" }, label: { ko: "Day 1 참석", en: "showed up on Day 1" } },
      { value: { ko: "25팀", en: "25" }, label: { ko: "시작", en: "teams started" } },
      { value: { ko: "21팀", en: "21" }, label: { ko: "발표", en: "teams presented" } },
      {
        value: { ko: "9팀", en: "9" },
        label: { ko: "출제사에 직접 자료 요청", en: "asked the problem owner for data" },
        note: { ko: "시키지 않았습니다", en: "Nobody told them to" },
      },
    ] as Stat[],
    photosLabel: { ko: "8일의 모양", en: "The shape of eight days" },
    // ── 사진 열두 장 ───────────────────────────────────────────────────────
    // DECIDED 2026-09-16: 세 장에서 열두 장. 시상식 두 장을 뺀 자리(아래 REMOVED
    // 주석)는 같은 날 커리어 간담회와 트랙 공유회 사진으로 채웠습니다.
    //
    // 열두 장인 이유는 격자 때문입니다. 데스크톱 3열 · 그 아래 2열이라 12는 둘 다
    // 딱 떨어지는 유일한 수예요(3x4, 2x6). 열 장이면 3열에서 마지막 줄에 한 장만
    // 남습니다. 늘리거나 줄일 때 6의 배수로 두세요.
    //
    // 이 챕터에서 글이 빠진 자리를 사진이 받습니다. 8일이 어땠는지는 문단
    // 다섯 개보다 사진 열두 장이 더 정확하게 말하고, 그게 이 챕터가 남는
    // 이유입니다. 자세한 것을 알고 싶은 사람은 아래 버튼으로 /2026-08에
    // 갑니다.
    //
    // 열두 장 전부 4:3입니다. 처음에는 세로 사진 셋을 원본 비율 그대로 두고
    // 화면에서 CSS columns로 쌓았는데, 세로가 가로보다 1.8배 길어서 몇 장이
    // 아래로 삐져나왔습니다(NaruHome의 PhotoWall 주석에 실측이 있습니다).
    // 그래서 자르는 자리를 런타임이 아니라 사람이 고르는 쪽으로 바꿨습니다 -
    // 세로 셋은 Dropbox 원본에서 4:3으로 다시 잘랐어요.
    //
    // 4:3이 아닌 사진을 이 목록에 넣지 마세요. 넣으면 화면에서 잘립니다.
    //
    // 원본은 Dropbox의 한인 빌더톤/Photo입니다. 1200x900 webp q78
    // (day1-start · day8-prove · day8-career는 1600x1200 q80, 9/15에 넣은 것).
    //
    // day/caption은 세 장에만 있습니다(Day 1 · Day 5 · Day 8). 나머지는
    // 벽지처럼 읽히면 됩니다 - 전부 캡션을 달면 사진을 늘린 만큼 글이 늘어나서
    // 이 벽을 만든 이유가 없어집니다.
    //
    // TODO: confirm. 이 열두 장의 웹 공개 여부. 얼굴이 알아볼 수 있게 찍혀
    // 있습니다.
    photos: [
      {
        src: "/record/day1-start.webp",
        width: 1600,
        height: 1200,
        day: { ko: "Day 1", en: "Day 1" },
        caption: { ko: "쉰아홉 명으로 시작했습니다", en: "It started with fifty-nine people" },
        alt: {
          ko: "2026년 8월 22일 Day 1, 싱가포르 파운드리에 모인 참가자 단체 사진",
          en: "Day 1, 22 August 2026: everyone gathered at Foundry in Singapore",
        },
      },
      {
        src: "/record/day1-checkin.webp",
        width: 1200,
        height: 900,
        alt: {
          ko: "Day 1 체크인 테이블에서 이름표를 받는 참가자들",
          en: "Day 1: participants picking up name tags at the check-in table",
        },
      },
      {
        src: "/record/day1-listen.webp",
        width: 1200,
        height: 900,
        alt: {
          ko: "Day 1 오프닝 세션을 듣고 있는 참가자들",
          en: "Day 1: participants listening to the opening session",
        },
      },
      {
        src: "/record/day1-hall.webp",
        width: 1200,
        height: 900,
        alt: {
          ko: "Day 1, 파운드리 홀에 앉은 참가자들과 무대 스크린",
          en: "Day 1: the Foundry hall, participants seated in front of the stage screen",
        },
      },
      {
        src: "/record/day1-crowd.webp",
        width: 1200,
        height: 900,
        alt: {
          ko: "Day 1 객석을 가득 채운 참가자들",
          en: "Day 1: a full room of participants",
        },
      },
      {
        src: "/record/day5-session.webp",
        width: 1200,
        height: 900,
        day: { ko: "Day 5", en: "Day 5" },
        // 캡션 셋의 아크는 시작 → 물음 → 증명입니다(2026-09-16).
        // "중간에 한 번 모였습니다"였는데, 그건 모인 사실만 말하고 거기서 무슨
        // 일이 있었는지는 말하지 않았습니다. Day 5는 *SCAPE 현장에서 서로
        // 앞에 공유하고, 트랙을 섞어 이야기하고, 문제를 낸 코드프레소 대표와의
        // 시간으로 닫은 날입니다(data/schedule.ts의 d5-networking-day).
        // 이 사진도 앞에 앉은 두 사람과 객석이 주고받는 자리예요.
        caption: {
          ko: "궁금한 건 그 자리에서 바로 물었습니다",
          en: "Whatever you wanted to know, you asked right there",
        },
        alt: {
          ko: "Day 5 *SCAPE 현장, 앞에 앉은 두 사람과 이야기를 주고받는 참가자들",
          en: "Day 5 at *SCAPE: two people seated at the front, the room talking with them",
        },
      },
      {
        src: "/record/day8-prove.webp",
        width: 1600,
        height: 1200,
        day: { ko: "Day 8", en: "Day 8" },
        caption: { ko: "앞에서 증명했습니다", en: "They proved it out front" },
        alt: {
          ko: "Day 8 트랙 발표, 세 명으로 이루어진 팀이 자기 슬라이드 앞에 서서 발표하는 모습",
          en: "Day 8 track sharing: a team of three presenting in front of their slide",
        },
      },
      {
        src: "/record/day8-share.webp",
        width: 1200,
        height: 900,
        alt: {
          ko: "Day 8 트랙 공유회, 발표를 보고 있는 참가자들",
          en: "Day 8 track sharing: the room watching a presentation",
        },
      },
      {
        src: "/record/day8-watch.webp",
        width: 1200,
        height: 900,
        alt: {
          ko: "Day 8, 노트북을 앞에 두고 다른 팀의 발표를 보는 참가자들",
          en: "Day 8: participants watching another team present, laptops in front of them",
        },
      },
      {
        src: "/record/day8-room.webp",
        width: 1200,
        height: 900,
        alt: {
          ko: "Day 8 커리어 간담회가 열린 강의실 전경",
          en: "Day 8: the room during the career session",
        },
      },
      // 2026-09-17: 이 자리에 있던 day8-panel.webp는 바로 아래 day8-career와 같은
      // 순간을 찍은 컷이었습니다(현직자 세 명이 앉은 패널, 각도만 다름). 같은
      // 사진을 두 번 걸지 않습니다. Automation 트랙 공유회의 발표 컷으로 바꿨고,
      // 그래서 발표 사진이 트랙마다 하나씩(day8-prove, 여기) 있습니다.
      // 원본 Photo/Day 8/Automation Track Sharing/IMG_2621.HEIC, 4:3.
      {
        src: "/record/day8-automation.webp",
        width: 1200,
        height: 900,
        alt: {
          ko: "Day 8 Automation 트랙 공유회, 세 명이 강단에 서서 슬라이드를 앞에 두고 발표하는 모습",
          en: "Day 8 Automation track sharing: a team of three at the lectern presenting their slide",
        },
      },
      {
        src: "/record/day8-career.webp",
        width: 1600,
        height: 1200,
        alt: {
          ko: "Day 8 커리어 간담회, 현직자 세 명이 앞에 앉아 참가자들의 질문에 답하는 모습",
          en: "Day 8 career session: three working professionals taking questions from the room",
        },
      },
      // REMOVED 2026-09-16: 시상식 사진 둘(day8-award · day8-award2). 파일도
      // 함께 지웠습니다.
      //
      // 그 두 장에는 수상한 팀이 상패를 들고 출제사와 나란히 서 있었습니다.
      // 이 사이트에서 등수를 매기지 않는다고 말하는 챕터 한가운데에, 무대에서
      // 상을 받은 사람들의 기념 사진만 두 장이 있었어요. 나머지 열 장은 전부
      // 그냥 그 자리에 있던 사람들입니다.
      //
      // 수상팀 명단은 원래도 싣지 않습니다(발표 경로는 오픈채팅입니다 -
      // data/dictionary.ts의 wrap 주석). 사진으로 그걸 되돌리지 않습니다.
      //
      // "등수 없이, 네 부문에서 열 팀"이라는 캡션도 함께 내려갔습니다. 그
      // 사실은 8월 페이지의 어워드 섹션에 정본이 있습니다.
    ] as RecordPhoto[],
    // ── 탭 블록 ────────────────────────────────────────────────────────────
    // DECIDED 2026-09-15: 숫자와 사진만으로는 제로백이 무엇이었는지 설명되지
    // 않습니다. 74명이 신청했다는 사실은 신뢰를 주지만, 처음 오는 사람에게
    // "그래서 8일 동안 뭘 한 거냐"와 "누가 왔느냐"는 여전히 답이 없어요.
    // 그 둘이 이 이벤트를 설명하는 진짜 재료이고, 기업에 우리를 설명할 때도
    // 같은 둘을 씁니다.
    //
    // 탭인 이유는 길이입니다. 8일 + 멘토 열셋 + 연사와 패널을 한 번에 펼치면
    // 이 챕터가 페이지의 절반이 됩니다. 한 번에 하나만 보이면 깊이는 그대로
    // 두고 길이만 줄일 수 있어요.
    //
    // **내용을 여기에 옮겨 적지 않습니다.** 사람과 일정은 전부 8월 정본
    // (data/schedule.ts의 days, data/dictionary.ts의 mentoring·speakers·judges)
    // 에서 그대로 읽습니다. 복사해 두면 한쪽만 고쳐지기 시작하고, 사람 이름이
    // 어긋나는 것은 이 사이트가 저지를 수 있는 가장 나쁜 오류입니다.
    // 이 블록에는 라벨과 안내 문장만 있습니다.
    tabs: {
      label: { ko: "무엇을 어떻게 했나", en: "What it was, and who was there" },
      format: {
        label: { ko: "8일의 형식", en: "The eight days" },
        intro: {
          ko: "팀으로 참가해 실제 기업의 문제를 받고, 8일 뒤 마지막 날 앞에서 증명했습니다. 문제를 낸 곳은 코드프레소였습니다.",
          en: "You came as a team, took a real company's problem, and proved it out front on the eighth day. The problem came from Codepresso.",
        },
        facts: [
          { value: { ko: "8일", en: "8 days" }, label: { ko: "2026.08.22 ~ 08.29", en: "22 to 29 Aug 2026" } },
          { value: { ko: "스크리닝 없음", en: "No screening" }, label: { ko: "오면 참가입니다", en: "Showing up is the entry" } },
          { value: { ko: "실제 기업 문제", en: "A real problem" }, label: { ko: "출제사 코드프레소", en: "Set by Codepresso" } },
          { value: { ko: "무순위 4부문", en: "Four categories" }, label: { ko: "10팀 수상", en: "Ten teams recognised" } },
        ],
        railLabel: { ko: "날마다 무엇이 있었나", en: "Day by day" },
        tracksLabel: { ko: "문제 둘", en: "Two problems" },
        tracksNote: {
          ko: "채용이냐 마케팅이냐가 아니라, 어느 병목을 풀고 싶은지로 골랐습니다. 둘 다 출제사가 그때 실제로 겪고 있던 문제였어요.",
          en: "Not hiring versus marketing. You picked by which bottleneck you wanted to solve. Both were problems the company was living with at the time.",
        },
        awardsLabel: { ko: "부문 넷", en: "Four categories" },
        awardsNote: {
          ko: "등수가 없습니다. 네 부문이 각각 다른 것을 보고, 보는 사람도 출제사와 VC, 참가자, 운영진으로 다 다릅니다.",
          en: "No placings. Each of the four looks for something different, and so does each set of eyes: the problem owner, the VC panel, fellow builders, the organizers.",
        },
      },
      mentors: {
        label: { ko: "멘토", en: "Mentors" },
        intro: {
          ko: "단계마다 다른 멘토가 붙었습니다. 아이디어를 형태로 만들 때, 빌드가 막힐 때, 무대에서 팔아야 할 때. 필요한 사람이 매번 달랐어요.",
          en: "A different kind of mentor at each stage. Shaping the idea, unblocking the build, selling it on stage: each needed a different person in the room.",
        },
        countLabel: { ko: "멘토", en: "mentors" },
        stageWarmup: { ko: "출발선 세션", en: "Start-line session" },
        stageBuild: { ko: "빌드 멘토링", en: "Build mentoring" },
        stagePitch: { ko: "Day 7 피치 세션", en: "Day 7 pitch session" },
      },
      people: {
        label: { ko: "연사와 피드백 패널", en: "Speakers and the panel" },
        intro: {
          ko: "먼저 길을 낸 사람들이 직접 왔습니다. 취업과 창업 사이에서 무엇을 골랐는지, 실무에서 AI를 어떻게 쓰는지, 0에서 100까지 무엇이 필요한지를 각자의 자리에서 이야기했습니다.",
          en: "People who had already cut a path showed up in person: what they chose between a job and founding, how AI is actually used at work, and what it takes to get from zero to a hundred.",
        },
        speakersLabel: { ko: "연사", en: "Speakers" },
        panelLabel: { ko: "Day 8 커리어 간담회", en: "Day 8 career panel" },
        judgesLabel: { ko: "피드백 패널", en: "Feedback panel" },
        judgesNote: {
          ko: "순위를 매기는 자리가 아니었습니다. 문제를 낸 기업과, 실제 산업에서 문제를 풀어온 시니어들이 각자의 관점으로 피드백과 다음 가능성을 이야기했습니다.",
          en: "Not a ranking exercise. The company that set the problem and seniors who have solved real ones in industry each offered feedback, and what could come next.",
        },
      },
      archiveNote: {
        ko: "각 세션의 시각과 장소, 멘토 소개, FAQ까지 전부 8월 페이지에 그대로 있습니다.",
        en: "Session times and venues, mentor introductions, the FAQ: all of it is still on the August page.",
      },
    },
    gapsLabel: { ko: "8월에 아쉬웠던 네 가지", en: "Four things August missed" },
    // {name}은 렌더가 decemberEventLabel로 채웁니다.
    gapsNote: { ko: "그래서 {name}이 있습니다", en: "This is why {name} exists" },
    // ── 각 항목에 12월의 답을 답니다 (DECIDED 2026-09-15) ──────────────────
    // 고백 넷과 답 둘이 챕터 두 개 떨어져 있어서 서로 모르고 있었습니다. 그러면
    // 고백이 변명으로 읽히고, "그래서 12월 이벤트가 있습니다"라는 주장이 근거
    // 없이 뜹니다. 나란히 두면 그 줄이 로드맵이 됩니다.
    //
    // **넷 중 둘만 답이 있습니다. 나머지 둘은 answer가 null이고, 화면은 "아직"
    // 이라고 씁니다.** 없는 대책을 지어내 채우지 마세요. 넷 다 답한 척하면
    // 나머지 문장의 신뢰가 같이 떨어집니다. 확정되면 여기를 채우면 됩니다.
    answerLabel: { ko: "12월", en: "December" },
    answerPending: { ko: "아직 답이 없습니다", en: "No answer yet" },
    gaps: [
      {
        title: {
          ko: "데이터로 문제를 정의하는 단계가 없었습니다",
          en: "There was no step where data defines the problem",
        },
        body: {
          ko: "문제와 데이터가 이미 정제돼 있어서, 발견하는 구간이 통째로 빠졌습니다.",
          en: "The problem and the data arrived already cleaned, so the discovery stretch was missing entirely.",
        },
        answer: {
          ko: "raw data에서 문제를 찾아 정의하는 구간부터 참가자에게 엽니다.",
          en: "The stretch where you find and define a problem out of raw data opens to participants.",
        },
      },
      {
        title: { ko: "멘토링을 충분히 쓰지 못했습니다", en: "Mentoring went underused" },
        body: {
          ko: "슬롯은 넉넉했는데 한 번도 쓰지 않은 팀이 있었습니다.",
          en: "There were plenty of slots, and there were teams that never booked one.",
        },
        answer: {
          ko: "전 기간 상시 예약제로 열고, 횟수를 제한하지 않습니다.",
          en: "Open by booking the whole way through, with no cap on how many times.",
        },
      },
      {
        title: { ko: "팀 사이 교류가 없었습니다", en: "Teams never mixed" },
        body: {
          ko: "팀 안에서는 붙었지만 팀과 팀은 섞이지 않았습니다.",
          en: "People bonded inside their team. Between teams, nothing.",
        },
        // 2026-09-17: 기획 03에서 채움. 본 일정 전 팀 본딩, 중간 공유. 초안입니다.
        answer: {
          ko: "본 일정 전에 팀 본딩을 두고, 중간 공유로 서로의 진행을 보게 합니다.",
          en: "Team bonding before the main schedule, and mid-point sharing so teams see each other's progress.",
        },
      },
      {
        title: {
          ko: "주관 학생이 함께 자랄 자리가 없었습니다",
          en: "The organizing students had no place to grow",
        },
        body: {
          ko: "열심히 해 주었는데, 함께 자란다고 느낄 자리를 만들지 못했습니다.",
          en: "They worked hard for it, and we never made a place where they could feel they were growing too.",
        },
        // 2026-09-17: 기획 03에서 채움. 초안입니다.
        answer: {
          ko: "주관 학생도 피칭할 수 있게 열고, 시상은 운영 기여도 기준의 별도 트랙으로 둡니다.",
          en: "Organising students can pitch too, and there is a separate award track judged on what they put into running it.",
        },
      },
    ] as { title: Phrase; body: Phrase; answer: Phrase | null }[],
    // ── 로고 스트립은 넣지 않았습니다 (DECIDED 2026-09-15) ────────────────
    // 브리프에서 선택 항목이었고, 넣지 않는 쪽을 골랐습니다. 이유는 둘입니다.
    //
    // 하나. 8월의 로고 월은 Journey.tsx의 HeroPartnerStrip과 LogoTile이
    // 그리는데, 그 둘은 로고마다 실측한 시각적 질량으로 높이를 맞추고(scripts/
    // measure-logo-mass.py) 티어 라벨과 소개 모달까지 달고 있습니다. 목록만
    // 넘겨 재사용할 수 있는 모양이 아니고, 한 줄짜리로 다시 만들면 질량 보정이
    // 빠져 로고 행이 들쭉날쭉해집니다. 그 파일을 리팩토링하는 것은 이번 작업이
    // 하지 않기로 한 일입니다.
    //
    // 둘. 라벨을 아무리 정확히 써도("제로백 빌더톤을 함께한 곳") 홈에 있는 로고 월은
    // 나루의 후원사로 읽힙니다. 나루는 아직 법인격이 없어 후원 계약의 주체가 될
    // 수 없습니다. 로고를 보고 싶은 사람은 아래 CTA로 8월 페이지에 가면 되고,
    // 거기에는 티어와 소개까지 붙은 제대로 된 벽이 있습니다.
    //
    // 넣기로 한다면 라벨 문자열은 이것입니다. 나루의 후원사라고 쓰지 마세요.
    partnersLabel: { ko: "제로백 빌더톤을 함께한 곳", en: "Who was with us on the Zero100 builderthon" },
    cta: { ko: "제로백 빌더톤 기록 전체 보기", en: "Read the full Zero100 builderthon record" },
  },

  // ── CH3 · 어떻게 일하는가 ─────────────────────────────────────────────────
  // Overview 01과 02를 웹에 맞게 옮긴 것입니다.
  how: {
    eyebrow: { ko: "세 층", en: "Three layers" },
    heading: { ko: "어떻게 일하는가", en: "How we work" },
    // 첫 문장은 2026-09-17에 붙었습니다. 이 챕터가 #december 뒤로 오면서, 왜
    // 12월 다음에 조직도가 나오는지를 첫 줄이 말해야 했습니다.
    lead: {
      ko: "8월의 자리도 12월의 자리도 같은 세 층이 만듭니다. 학생회와 기업은 서로 직접 만나지 않습니다. 나루를 거쳐 만납니다. 이벤트는 지금 그 둘을 잇는 방식이고, 방식은 바뀔 수 있습니다.",
      en: "August's place and December's are made by the same three layers. Student associations and companies never meet each other directly. They meet through NARU. An event is how the two are connected for now, and that can change.",
    },
    diagramNote: {
      ko: "서로 직접 만나지 않습니다",
      en: "They do not meet directly",
    },
    layers: [
      {
        role: { ko: "주최 HOST", en: "HOST" },
        who: { ko: "나루", en: "NARU" },
        brings: { ko: "학생이 만드는 그룹", en: "A group students make" },
        does: {
          ko: "회차의 기획과 실행. 출제사와 멘토, 후원사와의 관계. 기록과 회차 사이의 연속성.",
          en: "Planning and running each round. The relationships with problem owners, mentors and sponsors. The record, and the continuity between rounds.",
        },
        gets: {
          ko: "회차의 책임과 이름. 다음 판을 깔 사람.",
          en: "The responsibility and the name of the round. The people who will set up the next one.",
        },
        join: { id: "join-crew", label: { ko: "운영진으로 함께하기", en: "Join the crew" } },
      },
      {
        role: { ko: "주관 ORGANISER", en: "ORGANISER" },
        // TODO: confirm. 한국 안의 학교에서 누가 주관 자리에 서는지는 아직
        // 정해지지 않았습니다. 창업학회 같은 주체를 지어내 쓰지 마세요.
        who: { ko: "각 학교 한인 학생회", en: "Each school's Korean student association" },
        brings: { ko: "소속 학생, 공간, 학교 안의 명의", en: "Students, space, standing inside the school" },
        does: {
          ko: "소속 학생 모집. 학교 안의 공간과 자원, 필요한 명의. 운영 협조.",
          en: "Recruiting their own students. Space and resources inside the school, and the standing it takes. Hands on the day.",
        },
        gets: {
          ko: "학생에게 열어 줄 자리. 임기를 마친 임원이 이어서 일할 자리.",
          en: "Something real to open up for their students. A place for officers to keep working after their term ends.",
        },
        join: { id: "join-organiser", label: { ko: "학생회로 문의하기", en: "As an association" } },
      },
      {
        role: { ko: "후원 SPONSOR", en: "SPONSOR" },
        who: { ko: "참여 기업", en: "Participating companies" },
        brings: { ko: "문제와 자료, 자금, 멘토", en: "Problems and data, funding, mentors" },
        does: {
          ko: "자금과 현물, 용역. 문제와 자료. 멘토와 피드백 패널. 채용 기회.",
          en: "Funding, goods, services. Problems and data. Mentors and the feedback panel. Hiring opportunities.",
        },
        gets: {
          ko: "한인 학생과의 접점. 채용 연계. 회차 크레딧.",
          en: "A way to reach Korean students. A hiring pipeline. Credit on the round.",
        },
        join: { id: "join-company", label: { ko: "기업으로 문의하기", en: "As a company" } },
      },
    ] as Layer[],
    doesLabel: { ko: "하는 것", en: "What they do" },
    getsLabel: { ko: "얻는 것", en: "What they get" },
    nameLabel: { ko: "이름의 두 겹", en: "Two meanings in the name" },
    nameLines: [
      {
        ko: "하나는 사람입니다. 한 사람이 누군가의 나루가 되어 줄 수는 있지만, 그 사람은 졸업하고 떠납니다. 그래서 사람이 바뀌어도 언제나 누군가의 나루가 되어 주는 그룹을 만듭니다.",
        en: "One is about people. A person can be someone's landing, but that person graduates and leaves. So we build a group that stays someone's landing even as the people change.",
      },
      {
        ko: "다른 하나는 구조입니다. 주관으로 들어온 학생회와 후원으로 들어오는 기업을 이어 주는 나루터, 그 자리가 이 그룹입니다.",
        en: "The other is about structure. The landing where the organising associations and the sponsoring companies meet: that place is this group.",
      },
    ],
    notDoingLabel: { ko: "나루가 하지 않는 것", en: "What NARU does not do" },
    // 금지어 검사에 걸리는 세 줄입니다. 의도된 것입니다. 이 낱말들을 쓰지 않는
    // 규칙은 그것을 제안하지 말라는 뜻이고, 여기서는 하지 않는다고 말합니다.
    // 낱말을 빼면 문장이 없어집니다. 파일 맨 위의 예외 항목을 보세요.
    notDoing: [
      { ko: "회비를 받지 않습니다.", en: "We do not collect dues." },
      {
        ko: "가입 폼을 두지 않습니다. 들어오는 길은 회차 하나입니다.",
        en: "There is no sign-up form. The way in is a round.",
      },
      {
        ko: "운영진에게 보수를 주지 않고, 자리를 보장하지도 않습니다.",
        en: "We do not pay the crew, and we do not promise anyone a seat.",
      },
    ],
  },

  // ── CH4 · 다음 이벤트 ─────────────────────────────────────────────────────
  // 확정된 사실만 싣습니다. 장소와 일정표, 출제사, 멘토, 등록 마감은 여기 없어요.
  // 11월까지 확정되고, 그때 상세 라우트가 붙습니다(2단계).
  //
  // 이름과 날짜 문자열은 이 파일에 없습니다. lib/naruDates.ts에서만 옵니다.
  //
  // **이 블록에 "제로백", "Zero100", "빌더톤", "2회차"가 하나라도 들어가면
  // 잘못된 것입니다.** 12월은 제로백의 속편이 아니라 그 이벤트에서 나온 코어
  // 2개를 잇는 다른 이벤트입니다. 파일 맨 위의 용어 위계를 보세요.
  december: {
    // 아이브로는 세 조각으로 조립됩니다. 접두어 + 이름 + 달과 도시.
    // 이름은 decemberEventLabel, 달과 도시는 naruDates가 줍니다. 이름이 다시
    // null이 되어도(다음 크로싱이 이름 없이 시작할 때) 깨지지 않습니다.
    eyebrowPrefix: { ko: "다음 이벤트", en: "Next event" },

    // ── 프로그램 (DECIDED 2026-09-17) ─────────────────────────────────────
    // 8월 사이트의 격식을 따릅니다: 프로그램(일정), 멘토링, 무엇이 달라지는가.
    // 출처는 빌더톤_2회차_기획.pdf 다섯 장(성과, 코어, 제안, 일정, 실행).
    // 05 실행(팀이 알아볼 세 곳)은 내부용이라 싣지 않습니다. 03 제안의 "왜
    // 서울인가" 셋과 "8월에 아쉬웠던 넷 → 12월의 답"이 여기, 04 일정의
    // 스테이지·워크샵·General Mentoring이 아래 stages와 mentoring입니다.
    // 02 코어의 EXECUTION 열(멘토링의 퀄리티, 들어주는 사람, 재는 것)은 이벤트의
    // 것이라 why.exec/measure를 이 챕터의 멘토링 블록이 읽습니다.
    // 전부 초안입니다. draftNote가 이 챕터에 붙어 있어야 합니다.
    programEyebrow: { ko: "프로그램", en: "Programme" },
    programHeading: { ko: "raw data에서 증명까지, 닷새", en: "From raw data to proof, in five days" },
    reasonsLabel: { ko: "왜 서울인가", en: "Why Seoul" },
    reasons: [
      {
        title: { ko: "코어가 한국에서도 유효합니다", en: "The core holds in Korea too" },
        body: {
          ko: "안전한 도전 공간과 자기 가치를 증명할 기회라는 두 축은 한국 대학생에게 그대로 적용됩니다. 바꿔야 하는 것은 코어가 아니라 그것을 부르는 이름입니다.",
          en: "A safe place to try and a chance to prove your worth apply to students in Korea exactly as they are. What had to change was not the core but the name it goes by.",
        },
      },
      {
        title: { ko: "커뮤니티에는 이벤트가 필요합니다", en: "A community needs an event" },
        body: {
          ko: "연속성 있는 커뮤니티를 만들려면 사람이 다시 모이는 계기가 있어야 합니다. 정기적으로 굴러가면 자연히 살고, 단발성으로 끝나면 흩어집니다.",
          en: "A community with continuity needs a reason for people to gather again. Run regularly, it lives on its own. Run once, it scatters.",
        },
      },
      {
        title: { ko: "메시지가 싱가포르를 넘어야 합니다", en: "The message has to travel past Singapore" },
        body: {
          ko: "한 번으로는 사례가 되지 않고, 두 번째부터 선례가 됩니다. 이 이벤트가 그 선례가 싱가포르 밖으로 퍼져 나가는 시작점입니다.",
          en: "Once is an anecdote. From the second time it is a precedent, and this event is where that precedent starts travelling beyond Singapore.",
        },
      },
    ] as { title: Phrase; body: Phrase }[],
    gapsHeading: { ko: "8월에 아쉬웠던 넷, 그리고 12월의 답", en: "Four things August missed, and December's answer" },
    gapsLead: {
      ko: "이 네 가지를 메우려면 한 번 더 해야 합니다. 각각 8월에 무엇이 없었고 12월에 무엇을 넣는지입니다.",
      en: "Filling these four takes doing it once more. For each, what August lacked and what December puts in.",
    },
    augustLabel: { ko: "8월", en: "August" },
    decemberLabel: { ko: "12월", en: "December" },
    scheduleLabel: { ko: "일정", en: "Schedule" },
    scheduleLead: {
      ko: "본 일정 전에 팀 본딩을 두고, Discovery에서 Pitch까지 하루에 한 스테이지씩 넘어갑니다. 전 일정 한 공간에서 합니다.",
      en: "Team bonding comes before the main schedule, then one stage a day from Discovery to Pitch. The whole thing happens in one space.",
    },
    workshopLabel: { ko: "워크샵", en: "Workshop" },
    workshopNote: {
      ko: "스테이지마다 그날의 어젠다에 맞는 3시간짜리 워크샵이 붙습니다.",
      en: "Each stage comes with a three-hour workshop matched to that day's agenda.",
    },
    submitLabel: { ko: "제출", en: "Submission" },
    mentoringLabel: { ko: "멘토링", en: "Mentoring" },
    mentoringHeading: { ko: "General Mentoring, 전 기간 상시", en: "General Mentoring, on call the whole way" },
    mentoringLead: {
      ko: "8월에는 슬롯이 넉넉했는데 한 번도 쓰지 않은 팀이 있었습니다. 12월은 예약하지 않은 팀을 이탈 신호로 봅니다.",
      en: "In August there were plenty of slots and teams that never booked one. In December a team that has not booked is read as a warning sign.",
    },
    mentoringRules: [
      { ko: "예약제, 30분 슬롯", en: "By booking, 30-minute slots" },
      { ko: "질문은 몇 시간 전에 제출", en: "Questions submitted a few hours ahead" },
      { ko: "슬롯 횟수 제한 없음", en: "No cap on how many slots" },
      { ko: "마지막 날에는 새 방향을 제안하지 않음", en: "No new directions on the last day" },
    ] as Phrase[],

    // ── 제목이 포지션을 말합니다 (DECIDED 2026-09-15) ──────────────────────
    // 전에는 H2가 날짜였습니다("12월 9일, 서울에서 시작합니다"). 그러면 이
    // 챕터가 가장 큰 글씨로 "언제"를 말하는데, 이 이벤트에서 설명이 필요한 것은
    // 언제가 아니라 무엇입니다. 날짜는 아래 한 줄로 내려갔습니다.
    heading: {
      ko: "국경과 상관없이, 한인 학생 빌더가 만나는 자리.",
      // 브리프의 초안은 "Where Korean student builders meet, whichever country
      // they study in."이었는데 375px에서 다섯 줄이 됐습니다(실측). 뜻을 유지한
      // 채 줄였습니다. "Korean"은 빼지 않습니다. 국경을 여는 것이지 한인이라는
      // 범위를 여는 것이 아닙니다.
      en: "Korean student builders meet here, wherever they study.",
    },
    // 첫 문장이 부정으로 시작하는 것은 의도입니다. 8월을 아는 사람은 이 자리에서
    // 반드시 "2회차인가"를 묻고, 그 오해를 그대로 두면 나머지 문장이 전부 그
    // 전제 위에서 읽힙니다. 먼저 끊고 시작합니다.
    //
    // 2026-09-17: "코어 2개"가 "변하지 않는 두 개"가 됐습니다. 같은 것을 이 페이지가
    // 낱말 넷으로 불렀습니다(코어 2개, 변하지 않는 두 개, 두 가지, 위의 두 개).
    // 처음 읽는 사람은 같은 것인지 모릅니다. #why의 아이브로와 같은 말로 묶고,
    // NaruHome이 그 구절을 #why로 가는 링크로 그립니다(notSequelTerm이 그 구절).
    // 두 챕터 뒤에서 풀리는 전방 참조가 이름 있는 앵커가 됩니다.
    notSequel: {
      ko: "제로백 빌더톤의 2회차가 아닙니다. 그 8일에서 나온 변하지 않는 두 개를 그대로 잇는, 나루의 다음 이벤트입니다.",
      en: "This is not a second run of the Zero100 builderthon. It is NARU's next event, carrying the two things that do not change, both of which came out of those eight days.",
    },
    /** notSequel 안에서 #why로 링크되는 구절. notSequel의 문자열에 그대로 들어 있어야 합니다. */
    notSequelTerm: { ko: "변하지 않는 두 개", en: "the two things that do not change" },
    // **지금은 쓰이지 않습니다.** DECEMBER_EVENT_NAME이 채워져서(크로싱 서울,
    // 2026-09-15) NaruHome이 이 줄 대신 이름을 그립니다.
    //
    // 지우지 않은 이유: 다음 이벤트가 이름 없이 시작할 때 그대로 다시 쓰입니다.
    // 비워 두면 "왜 이름이 없지"가 읽는 사람의 질문으로 남고, 그 질문은 "아직
    // 안 정해진 행사인가"로 갑니다. 먼저 말해 두면 그건 그냥 아직 오지 않은
    // 한 줄이 됩니다.
    nameTbd: {
      ko: "이벤트 이름은 아직 없습니다. 정해지면 여기에 적습니다.",
      en: "The event does not have a name yet. It goes here when it does.",
    },
    // ── 왜 옛 문장을 버렸는가 ───────────────────────────────────────────
    // 전에는 "코어는 그대로 두고 무대만 옮깁니다"였습니다. 그 문장이 서울 개최를 "한국 이벤트"로 읽히게 만들었습니다. 그러면 한국
    // 밖에서 공부하는 한인 유학생이 자기 자리를 못 찾고, 8월과의 서사도
    // 끊깁니다. 8월은 싱가포르 안에서 열렸고 12월은 그 안이 아닌 자리입니다.
    // 넓어지는 것은 판이지 코어가 아닙니다.
    lead: {
      ko: "8월은 싱가포르 안에서 열렸습니다. 12월은 한국의 대학생과 해외의 한인 유학생이 같은 문제 앞에 섭니다. 학교도 나라도 다르지만 같은 자리입니다. 코어는 둘 그대로이고, 넓어지는 것은 판입니다.",
      en: "August happened inside Singapore. In December, students at Korean universities and Korean students studying abroad stand in front of the same problem. Different schools, different countries, one place. The two cores are unchanged. What widens is the room.",
    },
    changesLabel: { ko: "무엇이 달라지는가", en: "What changes" },
    // 첫 항목이 국경입니다. 나머지 둘(문제 정의 개방, 코어 유지)은 그대로예요.
    //
    // TODO: confirm. 기획 초안에는 크로스보더 문제 각도가 있습니다. 동남아
    // 진출 한국 기업이 문제를 열고, 한국 학생은 한국 시장의 눈으로, 싱가포르
    // 학생은 싱가포르 시장의 눈으로 본다는 것. 확정되면 이 포지션의 가장
    // 구체적인 증거가 되니 여기 한 항목으로 들어갈 자리입니다. 출제사가
    // 정해지기 전에는 쓰지 않습니다.
    changes: [
      {
        ko: "8월은 싱가포르 세 학교 안이었습니다. 12월은 어느 나라에서 공부하든 옵니다.",
        en: "August ran inside three Singapore universities. In December you come whichever country you study in.",
      },
      {
        ko: "8월에는 기업이 정제한 문제를 받았습니다. 12월은 raw data에서 문제를 찾아 정의하는 구간부터 참가자에게 엽니다.",
        en: "In August the problems arrived already cleaned by the company. In December the stretch where you find and define a problem out of raw data opens to participants too.",
      },
      {
        ko: "코어는 그대로입니다. 스크리닝 없음, 무순위 부문별 시상, 전 기간 상시 멘토링.",
        en: "The core is unchanged. No screening, awards by category with no ranking, mentoring on call the whole way through.",
      },
    ],
    // ── 왜 국경을 여는가 ────────────────────────────────────────────────
    // 두 줄입니다. 세 번째로 쓰려던 줄("12월은 흩어져 있던 사람들이 한곳에
    // 모이는 시기")은 넣지 않았습니다.
    // TODO: confirm. 유학생 귀국 규모가 검증되지 않았습니다. 그 줄이 사실이면
    // 이 블록에서 가장 실용적인 근거가 되지만, 지금은 짐작입니다.
    whyLabel: { ko: "왜 국경을 여는가", en: "Why the borders open" },
    why: [
      {
        ko: "한 번으로는 사례가 되지 않습니다. 두 번째부터 선례가 되고, 그 선례가 싱가포르를 넘어야 다음이 있습니다.",
        en: "Once is an anecdote. The second time it becomes a precedent, and the precedent has to travel past Singapore for there to be a next one.",
      },
      {
        ko: "안전하게 도전하고 자기 가치를 증명할 자리는 어느 나라의 학교 안에도 없습니다. 그래서 학교 밖에, 나라 밖에 만듭니다.",
        en: "A place to try safely and prove your own worth does not exist inside any country's universities. So we build it outside the school, and outside the country.",
      },
    ],
    whoLabel: { ko: "누가 오는가", en: "Who comes" },
    // TODO: confirm. 알럼 참여 규모가 검증되지 않았습니다. 인원도 비율도 쓰지
    // 마세요. 셋을 나열만 하고 크기를 말하지 않는 것이 지금 쓸 수 있는 전부입니다.
    who: {
      ko: "한국의 대학생, 해외의 한인 유학생, 그리고 8월을 싱가포르에서 건넌 사람들.",
      en: "Students at Korean universities, Korean students studying abroad, and the people who crossed August in Singapore.",
    },
    // ── 이벤트가 끝난 뒤에 할 일 ────────────────────────────────────────────
    // 이 블록은 반드시 있어야 합니다. 8월에 이걸 쓰지 않아서, 이벤트 뒤에 멘토에게
    // 먼저 연락한 팀이 한 팀이었습니다(Overview 06). 병목은 의지가 아니라 판단
    // 재료였습니다. 내 강점이 그 자리에 쓸모가 있는지 스스로 판단할 수 없었어요.
    // 그래서 무엇을 하면 되는지를 글로 적습니다.
    afterLabel: { ko: "이벤트가 끝난 뒤에 할 일", en: "What to do after the event ends" },
    afterNote: {
      ko: "8월에는 이 문단이 없었습니다. 그래서 이벤트 뒤에 멘토에게 먼저 연락한 팀이 한 팀이었습니다.",
      en: "In August this paragraph did not exist. Afterwards, exactly one team reached out to a mentor on their own.",
    },
    after: [
      {
        title: { ko: "멘토에게 먼저 연락합니다", en: "Message the mentor first" },
        body: {
          ko: "이벤트 안에서 받은 피드백은 이벤트 밖에서도 유효합니다.",
          en: "Feedback you were given inside the event still holds outside it.",
        },
      },
      {
        title: {
          ko: "기업이 마지막 날 여는 기회를 봅니다",
          en: "Read what the companies open on the final day",
        },
        body: {
          ko: "말이 아니라 공고 형식으로 엽니다. 비전공자 가능 여부까지 한 줄로 적혀 있을 것입니다.",
          en: "Not as talk but as a posting. It will say in one line whether a non-major can apply.",
        },
      },
      {
        title: { ko: "다음 이벤트에 멘토로 돌아옵니다", en: "Come back as a mentor" },
        body: {
          ko: "받은 사람이 돌려주는 모습이 보일 때 문화가 됩니다.",
          en: "It becomes a culture at the moment someone is seen giving back what they were given.",
        },
      },
    ],
    // ── P2. 아직 정해지지 않은 것 (DECIDED 2026-09-15) ────────────────────
    // 지금 이 챕터에 없는 것은 "12월 정보"가 아니라 "12월이 관리되고 있다는
    // 증거"입니다. 미정 항목이 일곱인데 화면이 아직 없다고 말하는 것은 이름
    // 하나뿐이었고, 나머지 여섯은 그냥 없었습니다. **없는 것은 미정이 아니라
    // 부실로 읽힙니다.**
    //
    // 이 레포는 이미 같은 원리를 두 번 적어 놓았습니다(lib/naruDates.ts의
    // DECEMBER_ENDS_AT, 위 nameTbd). 그 원리를 한 항목에만 적용하고 있었어요.
    //
    // 지어내지 않으면서 이 챕터에 실을 수 있는 가장 큰 덩어리이고, 약점을
    // 신뢰로 바꿉니다. 매니페스토 VII-02("계산식을 숨기지 않는다")와 같은
    // 태도이기도 하고요. 그리고 이 목록이 오픈채팅 버튼에 실제 직무를 줍니다.
    //
    // **달을 쓰지 않았습니다.** 내부 일정은 11월까지지만, 화면에 쓰는 순간
    // 공개 약속이 됩니다. 지키지 못하면 이 블록이 하려던 일이 정확히 반대로
    // 작동합니다. 채워지는 순서만 말하고 날짜는 말하지 않습니다.
    // ── 기획 초안의 엑기스 ─────────────────────────────────────────────────
    // DECIDED 2026-09-16: 12월 챕터가 문단 여덟 개에서 숫자 여섯 + 스테이지
    // 다섯으로 바뀝니다.
    //
    // 출처는 12월 빌더톤/이벤트 기획의 원페이저(v1, 2026-09-10)와 기획 슬라이드
    // 다섯 장입니다. 그 문서가 실제로 말하는 것은 "raw data에서 문제를 찾는
    // 것부터 증명까지 한 사이클을 5일로 압축한다" 한 줄이고, 나머지는 그 한
    // 줄의 근거와 모양이에요. 화면에는 그 한 줄과 모양만 싣습니다.
    //
    // 이 자리에 있던 것(changes · why · who · after)은 키를 지우지 않았습니다.
    // 전부 맞는 말이었지만 여덟 문단이었고, 여덟 문단을 읽고 나서야 12월이
    // 무엇인지 알 수 있는 페이지는 12월을 모르는 사람에게 닫혀 있습니다.
    //
    // ⚠️ 초안입니다. draftNote가 반드시 이 블록과 함께 그려져야 합니다. 아래
    // 숫자 중 확정된 것은 하나도 없고, 참가자는 확정되지 않은 숫자를 보고
    // 일정을 비웁니다. 확정되면 그때 이 주석과 draftNote를 함께 걷으세요.
    //
    // 날짜를 숫자에 넣지 않은 것이 요점입니다. 초안은 12/10~12/14로 적고
    // 있는데 확정된 시작일은 12월 9일이라(lib/naruDates.ts) 둘을 한 화면에
    // 나란히 놓으면 바로 위 날짜 줄과 싸웁니다. 기간은 "실질 4일 + 사전 팀
    // 본딩"까지만 말하고, 달력은 naruDates 하나가 갖습니다.
    shapeLabel: { ko: "이번 회차의 모양", en: "The shape of this round" },
    // 첫 문장은 2026-09-17에 changes[1]에서 한 문장만 빌려 왔습니다. #record가
    // 바로 앞에 오면서 8월과 12월을 잇는 경첩이 필요했고, "왜 raw data인가"의
    // 근거이기도 합니다. changes 블록 전체를 되살린 것은 아닙니다.
    shapeLead: {
      ko: "8월에는 기업이 정제한 문제를 받았습니다. 12월은 raw data에서 문제를 찾는 것부터 증명까지, 한 사이클을 닷새로 압축합니다.",
      en: "In August the problem arrived already cleaned by the company. In December, from finding a problem in raw data to proving it out front: one full cycle, compressed into five days.",
    },
    draftNote: {
      ko: "기획 초안입니다. 확정되면 이 자리에서 바로 고칩니다.",
      en: "This is the working draft. It gets corrected here the moment it is settled.",
    },
    shape: [
      {
        value: { ko: "5일", en: "5 days" },
        label: { ko: "실질 4일 + 사전 팀 본딩", en: "Four working days, bonding before" },
      },
      {
        value: { ko: "3곳", en: "3" },
        label: { ko: "문제를 여는 회사", en: "companies opening a problem" },
        // "목표"가 붙은 이유(2026-09-17): 같은 항목이 아래 tbd 목록에도 "문제를
        // 여는 회사"로 있습니다. 한 화면에서 숫자이자 미정이면 초안 고지로는
        // 가려지지 않습니다. 숫자는 목표라고 말하고, 미정은 미정 목록이 말합니다.
        note: { ko: "목표. raw data와 담당자까지", en: "Target. Raw data and the person who owns it" },
      },
      {
        value: { ko: "60명+", en: "60+" },
        label: { ko: "참가 규모", en: "participants" },
        // 2026-09-17: "알럼과 한국 대학생"이었습니다. 9/16에 lead와 who가 화면에서
        // 내려간 뒤 이 여덟 글자가 12월 블록에 남은 유일한 참가 대상 문구였고,
        // 싱가포르 밖에서 공부하는 한인 유학생을 정확히 제외했습니다. 포지션
        // 브리프 §2가 금지한 바로 그 문장이었어요. 인원과 비율은 여전히 쓰지 않습니다.
        note: { ko: "한국의 대학생과 해외의 한인 유학생", en: "Students in Korea and Korean students abroad" },
      },
      {
        value: { ko: "2회", en: "2" },
        label: { ko: "중간 제출 지점", en: "submission checkpoints" },
        note: { ko: "정의서와 결과물", en: "The problem statement, then the build" },
      },
      {
        value: { ko: "무순위", en: "No ranking" },
        label: { ko: "부문별 시상", en: "Awards by category" },
        note: { ko: "과정에 무게를 둡니다", en: "Weighted on the process" },
      },
      {
        value: { ko: "상시", en: "Always on" },
        label: { ko: "멘토링", en: "Mentoring" },
        note: { ko: "예약제, 횟수 제한 없음", en: "By booking, no cap" },
      },
    ] as Stat[],
    // 스테이지 다섯. 날짜 대신 순서입니다(위 주석 참고).
    stagesLabel: { ko: "닷새의 스테이지", en: "Five days, five stages" },
    // dayOffset: DECEMBER_STARTS_AT에서 며칠 뒤인지. null이면 본 일정 전.
    // 날짜 문자열을 여기 쓰지 않습니다(naruDates.formatDecemberDay가 셉니다).
    // submit: 그 스테이지가 끝나며 받는 제출물. workshop: 그날 붙는 3시간 워크샵.
    // 출처 빌더톤_2회차_기획.pdf 04.
    stages: [
      {
        name: { ko: "Team Bonding", en: "Team Bonding" },
        when: { ko: "본 일정 전", en: "Before it starts" },
        dayOffset: null,
        body: {
          ko: "사전 매칭된 팀이 대면으로 먼저 만납니다. 첫날의 아이스브레이킹 시간이 사라집니다.",
          en: "Matched teams meet in person first, so day one does not start with icebreakers.",
        },
      },
      {
        name: { ko: "Discovery", en: "Discovery" },
        when: { ko: "1일차", en: "Day 1" },
        dayOffset: 0,
        body: {
          ko: "데이터를 열고, 그 데이터에서 문제를 찾아 정의합니다. 요구 강도가 가장 높은 날입니다.",
          en: "The data opens. You find the problem inside it and define it. The hardest day.",
        },
        workshop: {
          title: { ko: "Problem Discovery", en: "Problem Discovery" },
          body: { ko: "워크플로우를 분해해 병목 짚는 법", en: "Taking a workflow apart to find the bottleneck" },
        },
        submit: { ko: "정의서", en: "The problem statement" },
      },
      {
        name: { ko: "Build", en: "Build" },
        when: { ko: "2일차", en: "Day 2" },
        dayOffset: 1,
        body: {
          ko: "정의한 문제를 실제로 풉니다. PO 세션이 빌드 도중에 들어옵니다.",
          en: "You actually solve what you defined. The PO session lands mid-build.",
        },
        workshop: {
          title: { ko: "PO session", en: "PO session" },
          body: { ko: "정의를 기능으로 옮기는 판단 기준", en: "How a definition turns into a feature" },
        },
      },
      {
        name: { ko: "Refine", en: "Refine" },
        when: { ko: "3일차", en: "Day 3" },
        dayOffset: 2,
        body: {
          ko: "검증받을 수 있는 상태로 다듬습니다. 이 시점부터 새 방향은 제안하지 않습니다.",
          en: "You get it to a state that can be verified. From here, no new directions.",
        },
        workshop: {
          title: { ko: "Pitching session", en: "Pitching session" },
          body: { ko: "무엇을 증명할지와 발표 구조", en: "What to prove, and how to structure the pitch" },
        },
        submit: { ko: "결과물", en: "The build" },
      },
      {
        name: { ko: "Pitch", en: "Pitch" },
        when: { ko: "4일차", en: "Day 4" },
        dayOffset: 3,
        body: {
          ko: "만든 것을 앞에서 증명합니다. 발표 5분, 질의 5분. 시상과 클로징까지 이 날입니다.",
          en: "You prove it out front. Five minutes to present, five to answer. Awards and closing the same day.",
        },
      },
    ] as {
      name: Phrase;
      when: Phrase;
      dayOffset: number | null;
      body: Phrase;
      workshop?: { title: Phrase; body: Phrase };
      submit?: Phrase;
    }[],
    tbdLabel: { ko: "아직 정해지지 않은 것", en: "Not settled yet" },
    // 2026-09-15: "이벤트 이름"이 이 목록에서 빠졌습니다. 크로싱 서울로
    // 정해졌기 때문입니다. 바로 아래 tbdNote가 "이 목록은 한 줄씩 채워집니다"
    // 라고 말하는데, 그 말이 지켜진 첫 사례입니다. 다음에 무엇이 정해지든
    // 같은 방식으로 여기서 한 줄 빼세요.
    tbd: [
      // 2026-09-17: "기간과 마지막 날"이 빠졌습니다. 12/10~12/14로 확정(naruDates).
      { ko: "장소", en: "The venue" },
      { ko: "일정표", en: "The schedule" },
      { ko: "문제를 여는 회사", en: "The companies opening problems" },
      { ko: "멘토", en: "The mentors" },
      // TODO: confirm. 한국 안의 학교에서 누가 주관 자리에 서는지는 미정입니다
      // (how.layers[1]의 같은 TODO). 2026-09-17까지는 코드 주석에만 있었는데,
      // 이 레포의 원칙은 미정을 화면에 적는 것입니다. 없는 것은 미정이 아니라
      // 부실로 읽힙니다. 학생회 임원이 "우리 학교도 되나"를 물으러 와서 답을
      // 찾지 못하고 있었습니다.
      { ko: "주관 학생회", en: "The organising associations" },
      { ko: "등록이 열리는 날", en: "The day registration opens" },
    ],
    tbdNote: {
      ko: "이 목록은 한 줄씩 채워집니다. 채워지는 날은 오픈채팅이 가장 먼저 압니다.",
      en: "This list gets filled in one line at a time. The open chat hears each one first.",
    },
    // 둘째 문장은 2026-09-17에 붙었습니다. 참가 조건("스크리닝 없음")이 12월
    // 블록에 한 번도 없었습니다. changes[2]에 셋이 나란히 있었는데 9/16에
    // 내려가면서 무순위와 상시 멘토링은 shape 칸으로 살아남고 첫 항목만
    // 떨어졌어요. 결정 지점(등록 안내와 오픈채팅 버튼) 바로 옆이 그 조건이
    // 있어야 하는 자리입니다.
    ctaNote: {
      ko: "등록은 아직 열리지 않았습니다. 열리면 스크리닝 없이, 오는 사람이 참가자입니다.",
      en: "Registration is not open yet. When it opens there is no screening. If you come, you are in.",
    },
    ctaMail: { ko: "출제사 및 후원 문의", en: "Problem owners and sponsors" },
  },

  // ── CH5 · 함께하는 길 ─────────────────────────────────────────────────────
  // 각서, MOU, 협약서 같은 말을 쓰지 않습니다. 학생회와의 결합 방식은 미결이고,
  // 미결인 것을 정해진 것처럼 쓰면 첫 통화에서 말을 무르게 됩니다.
  join: {
    eyebrow: { ko: "함께하는 길", en: "Ways in" },
    heading: { ko: "어떻게 함께하는가", en: "How to be part of it" },
    lead: {
      ko: "들어오는 길은 자리마다 다릅니다. 참가자에게는 회차 하나뿐이고, 나머지 셋은 먼저 말을 걸어 주시면 됩니다.",
      en: "The way in depends on where you stand. For a participant it is a round and nothing else. For the other three, say hello first.",
    },
    // ── P4. 8월을 건넌 분께 (DECIDED 2026-09-15) ──────────────────────────
    // 홈에 알럼을 2인칭으로 부르는 문장이 한 줄도 없었습니다. 59명, 이 그룹이
    // 가진 유일한 따뜻한 리스트인데요. december.who는 그들을 3인칭으로 언급할
    // 뿐이고("싱가포르에서 8월을 건넌 사람들이"), #join의 카드 넷 중 어느 것도
    // 그들이 자기라고 인식할 카드가 아닙니다.
    //
    // 특히 december.after의 "다음 이벤트에 멘토로 돌아옵니다"는 미래의 12월
    // 참가자에게 주는 조언으로 쓰여 있는데, **지금 당장 그걸 할 수 있는 사람은
    // 8월 알럼뿐입니다.** 가장 값진 전환(받은 사람이 돌려주러 오는 것)을 말해
    // 놓고 그 말을 할 수 있는 사람에게 말하지 않고 있었습니다.
    //
    // 카드를 다섯 장으로 늘리지 않은 것은 그리드 때문입니다(2열이라 마지막 한
    // 장이 혼자 남습니다). 카드 아래 폭 전체를 쓰는 띠 하나로 둡니다.
    //
    // 세 번째 요청("그때의 이야기를 보내 주세요")이 비어 있는 #people 챕터를
    // 채우는 유일한 공급원입니다. people.stories 주석과 함께 보세요.
    alumni: {
      label: { ko: "8월을 건넌 분께", en: "If you crossed August" },
      lines: [
        {
          ko: "제로백 빌더톤에 왔던 분이라면, 크로싱 서울에서 할 수 있는 일이 셋입니다. 참가자로 오거나, 멘토로 돌아오거나, 그때의 이야기를 보내 주는 것.",
          en: "If you were at the Zero100 builderthon, there are three things you can do at CROSSING SEOUL. Come as a participant, come back as a mentor, or send us your story from back then.",
        },
        {
          ko: "받은 사람이 돌려주는 모습이 보일 때 문화가 됩니다. 지금 그걸 할 수 있는 사람은 8월을 건넌 분들뿐입니다.",
          en: "It becomes a culture at the moment someone is seen giving back what they were given. Right now you are the only people who can do that.",
        },
      ],
      storyNote: {
        ko: "이야기를 보내 주시면 이 사이트에 자리를 만듭니다. 본인이 쓴 문장과 동의가 있어야 싣습니다.",
        en: "Send us a story and it gets a place on this site. We publish only your own words, with your consent.",
      },
      mailLabel: { ko: "메일로 보내기", en: "Send it by email" },
    },
    cards: [
      {
        id: "join-participant",
        who: { ko: "참가자", en: "Participants" },
        lines: [
          {
            ko: "따로 들어오는 절차가 없습니다. 어느 나라에서 공부하든, 이벤트에 오면 됩니다.",
            en: "There is no process to join. Whichever country you study in, you come to an event.",
          },
          {
            ko: "크로싱 서울 등록은 아직 열리지 않았습니다.",
            en: "Registration for CROSSING SEOUL is not open yet.",
          },
        ],
        doorLabel: { ko: "오픈채팅", en: "Open chat" },
        door: "",
        openChat: true,
      },
      {
        id: "join-organiser",
        who: { ko: "학생회", en: "Student associations" },
        lines: [
          {
            ko: "나루가 여는 모든 회차는 각 학교 한인 학생회가 주관합니다. 학생회가 여럿이면 각자 자기 학교에 대해 주관하고, 사이에 순위는 없습니다.",
            en: "Every round NARU opens is organised by a school's Korean student association. Where there are several, each organises for its own school, and there is no ranking between them.",
          },
          {
            ko: "학교 안의 학생과 공간, 명의를 엽니다. 임기를 마친 사람이 나루로 들어올 수 있고, 학교 안에서 판을 깔아 본 경험이 그대로 쓰입니다.",
            en: "You open up your students, your space, your standing. Officers who finish their term can come into NARU, and what they learned setting things up at school carries over exactly.",
          },
        ],
        doorLabel: { ko: "메일로 문의", en: "Email us" },
        door: naruLinks.organiser,
      },
      {
        id: "join-company",
        who: { ko: "기업", en: "Companies" },
        lines: [
          {
            ko: "행사 비용은 병목이 아닙니다. 자금보다 먼저 물어볼 것은 문제와 raw data, 멘토로 들어오는 시간, 채용의 실제 기준입니다.",
            en: "The cost of the event is not the bottleneck. Before money we ask about the problem and the raw data, the hours you can give as a mentor, and what you actually hire on.",
          },
          {
            ko: "후원사에서 시작해 채용 경로, 발주자, 팀의 첫 파트너까지 갈 수 있습니다. 어디까지 가느냐는 각 단계의 성립 조건이 결정합니다.",
            en: "You can start as a sponsor and go on to a hiring channel, a client with a real brief, a team's first partner. How far it goes is decided by what each step requires.",
          },
        ],
        doorLabel: { ko: "메일로 문의", en: "Email us" },
        door: naruLinks.sponsor,
      },
      {
        id: "join-crew",
        who: { ko: "운영진", en: "Crew" },
        lines: [
          {
            ko: "지명으로 들어옵니다. 보수는 없고 실비만 있습니다. 돌아오는 것은 네트워크와 이름입니다.",
            en: "You come in by invitation. There is no pay, only costs covered. What comes back is a network and a name.",
          },
          {
            ko: "혼자 하지 않는 것이 미덕이 아니라 규칙입니다. 관심이 있으면 먼저 말을 걸어 주시면 됩니다.",
            en: "Not doing it alone is a rule here, not a virtue. If you are interested, say hello first.",
          },
        ],
        doorLabel: { ko: "메일로 문의", en: "Email us" },
        door: naruLinks.crew,
      },
    ] as JoinCard[],
  },

  // ── CH6 · 여기서 나온 사람 (조건부) ───────────────────────────────────────
  people: {
    eyebrow: { ko: "여기서 나온 사람", en: "People who came out of it" },
    heading: {
      ko: "한 이벤트가 남기는 것은 결과물이 아니라 사람의 이야기입니다",
      en: "What an event leaves behind is not the builds. It is a person's story",
    },
    lead: {
      ko: "결과 공유회에서 나온 결과물은 그 자리에서 소비되고 대부분 잊힙니다. 남는 것은 그 이벤트에서 나온 첫 롤모델의 이야기입니다.",
      en: "What gets shown at the closing session is used up in the room and mostly forgotten. What stays is the story of the first role model that event produced.",
    },
    // 비어 있으면 챕터가 통째로 렌더되지 않습니다. 지어내지 마세요.
    stories: [] as Story[],
  },

  // ── 푸터 ──────────────────────────────────────────────────────────────────
  // 크레딧 표기 순서는 언제나 주최 → 주관 → 후원입니다.
  //
  // 8월 푸터의 "SMU, NUS, NTU 한인 학생회가 주관하고 Zero100 빌더 네트워크가
  // 함께합니다"는 여기로 가져오지 않습니다. 그건 제로백 빌더톤의 크레딧이고,
  // 12월 이벤트의 주관은 아직 정해지지 않았습니다.
  footer: {
    credits: {
      ko: "주최 나루 주관 각 학교 한인 학생 단체 후원 참여 기업",
      en: "Hosted by NARU Organised by each school's Korean student association Supported by participating companies",
    },
    archive: { ko: "제로백 빌더톤의 기록", en: "The Zero100 builderthon record" },
    contact: { ko: "문의", en: "Contact" },
    rights: { ko: "© 2026 나루 NARU", en: "© 2026 나루 NARU" },
    logoAlt: { ko: "나루 NARU", en: "나루 NARU" },
  },
} as const;
