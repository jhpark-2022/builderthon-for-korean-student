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
// 12월 = 다음 이벤트. 이름이 아직 없습니다(lib/naruDates.ts).
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
  /** 12월 이벤트 일반 문의 (출제사, 후원). */
  december: `mailto:${CONTACT}?subject=${encodeURIComponent("나루 12월 이벤트 문의")}`,
  /** 학생회 주관 문의. */
  organiser: `mailto:${CONTACT}?subject=${encodeURIComponent("나루 학생회 주관 문의")}`,
  /** 기업 후원 문의. */
  sponsor: `mailto:${CONTACT}?subject=${encodeURIComponent("나루 후원 문의")}`,
  /** 운영진 관심. */
  crew: `mailto:${CONTACT}?subject=${encodeURIComponent("나루 운영진 문의")}`,
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
// TODO: 스토리가 들어오면 #people을 #december 앞에 더하세요.
// ─────────────────────────────────────────────────────────────────────────────
export const naruNav: { id: string; label: Phrase }[] = [
  { id: "top", label: { ko: "나루", en: "NARU" } },
  { id: "why", label: { ko: "왜", en: "Why" } },
  { id: "record", label: { ko: "8월의 기록", en: "August" } },
  { id: "how", label: { ko: "세 층", en: "Three layers" } },
  { id: "december", label: { ko: "12월", en: "December" } },
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
  /** 원본 비율 그대로 둡니다(4:3). 자르거나 늘리지 않습니다. */
  width: number;
  height: number;
  day: Phrase;
  caption: Phrase;
  alt: Phrase;
}

export interface Layer {
  role: Phrase;
  who: Phrase;
  brings: Phrase;
  does: Phrase;
  gets: Phrase;
}

export interface JoinCard {
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
      ko: "2026년 8월, 싱가포르에서 59명이 8일을 건넜습니다. 다음 이벤트는 12월 9일 서울에서 시작합니다.",
      en: "In August 2026, fifty-nine people crossed eight days in Singapore. The next event starts in Seoul on 9 December.",
    },
    ctaDecember: { ko: "12월 이벤트 알아보기", en: "About the December event" },
    ctaArchive: { ko: "제로백 빌더톤의 기록", en: "The Zero100 builderthon record" },
    // 로고의 대체 텍스트. 스크린리더가 읽는 이름이라 브랜드 표기 규칙을 그대로
    // 따릅니다: 한글이 주, 영문이 보조.
    logoAlt: { ko: "나루 NARU", en: "나루 NARU" },
  },

  // ── CH1 · 왜 존재하는가 ───────────────────────────────────────────────────
  // 매니페스토 II를 그대로 옮깁니다. 여기서 문장을 무르게 만들지 마세요.
  // 이 두 개를 바꾸는 결정은 매니페스토를 고쳐 쓰는 일과 같습니다(매니페스토 IX).
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
            en: "In front of that you build something by your own judgement, and you leave holding the thing that proves it.",
          },
        ],
      },
    ],
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
      en: "AI, the eight days, the format we use now: all of them are method. The agenda follows the times, and eight days may become four. Only the two above cannot change.",
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
    lead: {
      ko: "제로백 빌더톤은 나루의 첫 이벤트였습니다. 2026년 8월 22일부터 29일까지, 싱가포르에서 8일이었습니다.",
      en: "The Zero100 builderthon was NARU's first event. Eight days in Singapore, from 22 to 29 August 2026.",
    },
    // 이 줄이 CH2를 CH1과 묶습니다. 8월이 자랑거리라서 여기 있는 것이 아니라,
    // 코어 2개가 거기서 나왔기 때문에 있습니다. 순서가 반대였어요. 먼저 해 보고
    // 나서 무엇이 바뀌면 안 되는지를 알았습니다.
    lead2: {
      ko: "실제 기업의 문제를 스크리닝 없이 받아 8일 동안 풀고, 마지막 날 앞에서 증명했습니다. 이 이벤트에서 코어 2개가 나왔습니다.",
      en: "Real company problems, handed out with no screening, worked on for eight days and proved out front on the last day. The two cores came out of this event.",
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
    // ── 사진 세 장 ─────────────────────────────────────────────────────────
    // 전부 4:3 원본입니다. 자르거나 늘리지 않습니다.
    //
    // DECIDED 2026-09-15: 캡션은 사진에 실제로 찍힌 것만 말합니다.
    // 원래 계획한 흐름은 "기업이 문제를 연다 → 멘토와 다듬는다 → 앞에서
    // 증명한다"였습니다. 그런데 사진 폴더 전체를 훑어보니 1:1 멘토링 장면도,
    // 출제사가 문제를 여는 순간도 확인할 수 있는 사진이 없었습니다. Day 7
    // 폴더는 전부 피드백 패널 테이블이고, Day 1의 연단 사진은 어느 세션인지
    // 사진만으로는 알 수 없습니다.
    //
    // 그래서 흐름을 사진에 맞췄습니다: 모였다 → 증명했다 → 그리고 물었다.
    // 마지막 장이 CH4의 "이벤트가 끝난 뒤에 할 일"로 이어지는 것이 덤입니다.
    // 없는 장면에 맞는 캡션을 붙이는 것보다, 있는 장면에 맞는 흐름을 짜는 쪽이
    // 낫습니다. 더 맞는 사진이 나오면 캡션과 함께 바꾸세요.
    //
    // TODO: confirm. 이 세 장의 웹 공개 여부. 이미 발표 덱에 쓴 사진이지만
    // 덱은 닫힌 자리이고 웹은 열린 자리입니다. 얼굴이 알아볼 수 있게 찍혀
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
        src: "/record/day8-career.webp",
        width: 1600,
        height: 1200,
        day: { ko: "Day 8", en: "Day 8" },
        caption: { ko: "그리고 현직자에게 직접 물었습니다", en: "And then they asked the people doing the work" },
        alt: {
          ko: "Day 8 커리어 간담회, 현직자 세 명이 앞에 앉아 참가자들의 질문에 답하는 모습",
          en: "Day 8 career session: three working professionals taking questions from the room",
        },
      },
    ] as RecordPhoto[],
    gapsLabel: { ko: "8월에 아쉬웠던 네 가지", en: "Four things August missed" },
    gapsNote: { ko: "그래서 12월 이벤트가 있습니다", en: "This is why the December event exists" },
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
      },
      {
        title: { ko: "멘토링을 충분히 쓰지 못했습니다", en: "Mentoring went underused" },
        body: {
          ko: "슬롯은 넉넉했는데 한 번도 쓰지 않은 팀이 있었습니다.",
          en: "There were plenty of slots, and there were teams that never booked one.",
        },
      },
      {
        title: { ko: "팀 사이 교류가 없었습니다", en: "Teams never mixed" },
        body: {
          ko: "팀 안에서는 붙었지만 팀과 팀은 섞이지 않았습니다.",
          en: "People bonded inside their team. Between teams, nothing.",
        },
      },
      {
        title: {
          ko: "주관 학생이 함께 자랄 자리가 없었습니다",
          en: "The organizing students had no place to grow",
        },
        body: {
          ko: "열심히 해 주었는데, 함께 자란다고 느낄 자리를 만들지 못했습니다.",
          en: "They worked hard for it, and we never built them a place where that felt like growth of their own.",
        },
      },
    ],
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
    lead: {
      ko: "학생회와 기업은 서로 직접 만나지 않습니다. 나루를 거쳐 만납니다. 이벤트는 지금 그 둘을 잇는 방식이고, 방식은 바뀔 수 있습니다.",
      en: "Student associations and companies never meet each other directly. They meet through NARU. An event is how the two are connected for now, and how can change.",
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
      },
      {
        role: { ko: "주관 ORGANISER", en: "ORGANISER" },
        who: { ko: "각 학교 한인 학생회", en: "Each school's Korean student association" },
        brings: { ko: "소속 학생, 공간, 학교 안의 명의", en: "Students, space, standing inside the school" },
        does: {
          ko: "소속 학생 모집. 학교 안의 공간과 자원, 필요한 명의. 운영 협조.",
          en: "Bringing their students in. Space and resources inside the school, and the standing it takes. Hands on the day.",
        },
        gets: {
          ko: "학생에게 열어 줄 자리. 임기를 마친 임원이 이어서 일할 자리.",
          en: "Something real to open up for their students. A place for officers to keep working after their term ends.",
        },
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
          en: "A way to reach Korean students. Hiring pipeline. Credit on the round.",
        },
      },
    ] as Layer[],
    doesLabel: { ko: "하는 것", en: "What they do" },
    getsLabel: { ko: "얻는 것", en: "What they get" },
    nameLabel: { ko: "이름의 두 겹", en: "Two meanings in the name" },
    nameLines: [
      {
        ko: "하나는 사람입니다. 한 사람이 누군가의 나루가 되어 줄 수는 있지만, 그 사람은 졸업하고 떠납니다. 그래서 사람이 바뀌어도 언제나 누군가의 나루가 되어 주는 그룹을 만듭니다.",
        en: "One is about people. A person can be someone's landing, and then that person graduates and leaves. So we build a group that stays someone's landing even as the people change.",
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
    eyebrow: { ko: "다음 이벤트 2026.12 서울", en: "Next event Dec 2026, Seoul" },
    headingSuffix: { ko: ", 서울에서 시작합니다.", en: ", Seoul." },
    // 첫 문장이 부정으로 시작하는 것은 의도입니다. 8월을 아는 사람은 이 자리에서
    // 반드시 "2회차인가"를 묻고, 그 오해를 그대로 두면 나머지 문장이 전부 그
    // 전제 위에서 읽힙니다. 먼저 끊고 시작합니다.
    notSequel: {
      ko: "제로백 빌더톤의 2회차가 아닙니다. 그 이벤트에서 나온 코어 2개를 그대로 잇는, 나루의 다음 이벤트입니다.",
      en: "This is not a second run of the Zero100 builderthon. It is NARU's next event, carrying the two cores that came out of that one.",
    },
    // 이름이 아직 없다는 사실을 화면에서 말합니다. 비워 두면 "왜 이름이 없지"가
    // 읽는 사람의 질문으로 남고, 그 질문은 "아직 안 정해진 행사인가"로 갑니다.
    // 먼저 말해 두면 그건 그냥 아직 오지 않은 한 줄이 됩니다.
    // DECEMBER_EVENT_NAME이 채워지면 이 줄 대신 이름이 그려집니다.
    nameTbd: {
      ko: "이벤트 이름은 아직 없습니다. 정해지면 여기에 적습니다.",
      en: "The event does not have a name yet. It goes here when it does.",
    },
    lead: {
      ko: "코어는 그대로 두고 무대를 한국으로 옮깁니다. 한 번으로는 사례가 되지 않고, 두 번째부터 선례가 됩니다.",
      en: "The core stays as it is and the stage moves to Korea. Once is an anecdote. From the second, it is a precedent.",
    },
    changesLabel: { ko: "무엇이 달라지는가", en: "What changes" },
    changes: [
      {
        ko: "8월에는 기업이 정제한 문제를 받았습니다. 12월은 raw data에서 문제를 찾아 정의하는 구간부터 참가자에게 엽니다.",
        en: "In August the problems arrived already cleaned by the company. In December the stretch where you find and define a problem out of raw data opens to participants too.",
      },
      {
        ko: "코어는 그대로입니다. 스크리닝 없음, 무순위 부문별 시상, 전 기간 상시 멘토링.",
        en: "The core is unchanged. No screening, awards by category with no ranking, mentoring on call the whole way through.",
      },
    ],
    whoLabel: { ko: "누가 오는가", en: "Who comes" },
    // TODO: confirm. 알럼 참여 규모가 검증되지 않았습니다. 인원을 쓰지 마세요.
    who: {
      ko: "한국 대학생과, 싱가포르에서 8월을 건넌 사람들이 같은 무대에 섭니다.",
      en: "Korean university students, and the people who crossed August in Singapore, stand on the same stage.",
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
    ctaNote: { ko: "등록은 아직 열리지 않았습니다.", en: "Registration is not open yet." },
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
    cards: [
      {
        who: { ko: "참가자", en: "Participants" },
        lines: [
          {
            ko: "따로 들어오는 절차가 없습니다. 이벤트에 오면 됩니다.",
            en: "There is no process to join. You come to an event.",
          },
          {
            ko: "12월 이벤트 등록은 아직 열리지 않았습니다. 열리는 날은 오픈채팅에서 가장 먼저 알려 드립니다.",
            en: "December registration is not open yet. The open chat hears the day it is, first.",
          },
        ],
        doorLabel: { ko: "오픈채팅", en: "Open chat" },
        door: "",
        openChat: true,
      },
      {
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
      en: "What gets shown at the closing session is consumed there and mostly forgotten. What stays is the story of the first role model that event produced.",
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
