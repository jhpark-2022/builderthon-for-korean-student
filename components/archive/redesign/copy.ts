// DECIDED 2026-11-13 (사용자: "naru.community에 맞추어서 8월까지 다 update"): 8월 기록(/2026-08)의 새 화면 글.
// naru.community에 다른 기여자가 먼저 올린 판(코드는 GitHub에 없었음)의 글을 그대로 옮겼습니다.
// 사진과 숫자, 미디어는 data/naru.ts(naru.record)를 읽고, 여기에는 화면 글과 사람, 로고 목록만 둡니다.
// 지난 이벤트의 기록이라 사람 이름과 그때의 표기를 그대로 씁니다(brand 5장 예외가 아니라 8월 기록의 원래 내용).
import type { Phrase } from "@/data/dictionaryCore";

type Person = { name: Phrase; org: Phrase };
type Logo = { name: string; src: string; w: number; h: number };

const p = (ko: string, en: string): Phrase => ({ ko, en });
const same = (s: string): Phrase => ({ ko: s, en: s });

export const aug = {
  date: p("2026년 8월 22일부터 29일까지, 싱가포르", "22 to 29 August 2026, Singapore"),
  title: p("제로백 빌더톤", "Zero100 Builderthon"),
  lead: p(
    "나루는 이 8일에서 시작했어요.\n스크리닝 없이 들어온 학생들이 실제 회사의 문제를 받아 풀고 마지막 날 그 회사 앞에서 발표했어요.",
    "NARU started with these eight days.\nStudents came in with no screening, took a real company's problem, and presented to that company on the last day.",
  ),
  host: p(
    "Zero100 커뮤니티의 AXMOS 소속 회사들이 주최했고 문제는 그중 코드프레소가 냈어요.",
    "Hosted by AXMOS member companies of the Zero100 community. Codepresso, one of them, set the problem.",
  ),

  numbersTitle: p("74명이 신청했고 21팀이 끝까지 왔어요", "74 applied, and 21 teams made it to the end"),
  numbers: [
    { value: p("74명", "74"), label: p("신청", "applied") },
    { value: p("25팀", "25"), label: p("첫날 팀을 꾸림", "teams formed on Day 1") },
    { value: p("21팀", "21"), label: p("마지막 날 발표", "presented on the last day") },
    { value: p("9팀", "9"), label: p("출제사에 직접 자료를 요청", "asked the problem owner for data"), note: p("아무도 시키지 않았어요", "Nobody told them to") },
  ],

  daysTitle: p("8일", "Eight days"),
  daysLead: p(
    "첫 이틀은 문제를 받고 배웠고 가운데 닷새는 멘토를 만나며 만들었어요.\n마지막 날에는 문제를 낸 회사 앞에 섰고요.",
    "The first two days were for the problem and the basics, the middle five for building with mentors.\nOn the last day, teams stood in front of the company that set the problem.",
  ),
  days: [
    { date: "08/22", dow: p("토", "Sat"), what: p("오프닝, 문제 공개", "Opening, problem release") },
    { date: "08/23", dow: p("일", "Sun"), what: p("크래시코스", "Crash course") },
    { date: "08/24", dow: p("월", "Mon"), what: p("만들면서 1:1 멘토링", "Build, with 1:1 mentoring") },
    { date: "08/25", dow: p("화", "Tue"), what: p("만들면서 1:1 멘토링", "Build, with 1:1 mentoring") },
    { date: "08/26", dow: p("수", "Wed"), what: p("중간 점검", "Mid-point check") },
    { date: "08/27", dow: p("목", "Thu"), what: p("각자 만드는 날", "Self-paced build") },
    { date: "08/28", dow: p("금", "Fri"), what: p("파이널 리허설", "Final rehearsal") },
    { date: "08/29", dow: p("토", "Sat"), what: p("결과 공유회", "Showcase") },
  ],

  photosTitle: p("사진", "Photos"),

  awardsTitle: p("순위 대신 부문으로", "Categories, not rankings"),
  awardsLead: p("1등, 2등을 가리지 않았어요. 네 부문에서 열 팀이 상을 받았어요.", "No first or second place. Ten teams were recognised across four categories."),
  awards: [
    { name: p("비욘드 브리프", "Beyond the Brief"), line: p("‘어… 이건 우리 답지에 없던 접근인데요?’ 소리가 나오게 한 팀.", "For the team that made them go “wait… that wasn't in our answer key.”") },
    { name: p("비즈니스 포텐셜", "Business Potential"), line: p("발표를 듣다가 ‘이거 되겠는데?’ 하고 지갑이 먼저 반응한 팀.", "For the team that made wallets twitch mid-pitch: “this could actually sell.”") },
    { name: p("빌더스 초이스", "Builder's Choice"), line: p("발표가 다 끝났는데도 자꾸 생각나는, 빌더들이 뽑은 최애의 팀.", "The team you kept thinking about long after the pitches ended.") },
    { name: p("0→100", "Zero to Hundred"), line: p("첫날엔 ‘제가요? 이걸요?’였다가 마지막 날 ‘제가 만들었는데요’가 된, 출발선에서 가장 먼 거리를 온 팀.", "From “Me? Build this?” on day one to “I built this” on day eight. For the teams that travelled furthest from their starting line.") },
  ],

  peopleTitle: p("함께한 사람들", "The people"),
  peopleLead: p("소속과 상관없이, 개인 시간을 내서 와 준 분들이에요.", "They came on their own time, separately from where they work."),
  people: [
    {
      label: p("연사", "Speakers"),
      list: [
        { name: p("원대로 대표님", "Won Dae-ro"), org: p("Wilt Venture Builder 대표 (싱가포르)", "Managing Director, Wilt Venture Builder (SG)") },
        { name: p("한장환 님", "Jang Whan Han"), org: p("Oracle AI Database 제품관리 Senior Director Architect", "Senior Director Architect, AI Database Product Management, Oracle") },
        { name: p("박희덕 대표님", "Park Hee-deok"), org: p("트랜스링크인베스트먼트 대표\u2002GP", "CEO\u2002General Partner, Translink Investment") },
      ] as Person[],
    },
    {
      label: p("피드백 패널", "Feedback panel"),
      list: [
        { name: p("박희덕 대표님", "Park Hee-deok"), org: same("Translink Investment") },
        { name: p("원대로 대표님", "Won Dae-ro"), org: same("Wilt Venture Builder") },
        { name: p("한정필 교수님", "Jungpil Hahn"), org: same("NUS Computing") },
        { name: p("이동훈 대표님", "Lee Dong-hoon"), org: same("Codepresso") },
        { name: p("황현진 이사님", "Hyunjin Hwang"), org: same("Codepresso") },
        { name: p("신상길 님", "Shin Sang-gil"), org: same("FUJIFILM BI Singapore") },
        { name: p("신동혁 총괄님", "Shin Dong-hyuk"), org: same("AWS") },
        { name: p("백민정 총괄님", "MJ Baek"), org: same("Codepresso") },
      ] as Person[],
    },
    {
      label: p("멘토", "Mentors"),
      list: [
        { name: p("한장환 님", "Han Jang-whan"), org: same("Oracle") },
        { name: p("김지훈 이사님", "Jihoon Kim"), org: same("Codepresso") },
        { name: p("Brian Bae 대표님", "Brian Bae"), org: same("REmited") },
        { name: p("김종현 이사님", "Joseph JongHyun Kim"), org: same("YMX") },
        { name: p("황영준 님", "Hwang Young-jun"), org: same("T3Q") },
        { name: p("이유택 님", "Lee Yoo-taek"), org: same("NTU") },
        { name: p("신동혁 총괄님", "Shin Dong-hyuk"), org: same("AWS") },
        { name: p("이화영 님", "Lee Hwa-young"), org: same("AWS") },
        { name: p("임석건 님", "Lim Seok-geon"), org: same("NetApp") },
        { name: p("이동훈 대표님", "Lee Dong-hoon"), org: same("Codepresso") },
        { name: p("황현진 이사님", "Hyunjin Hwang"), org: same("Codepresso") },
      ] as Person[],
    },
  ],

  partnersTitle: p("함께한 곳", "Partners"),
  partnersLead: p("2026년 8월 행사 당시의 표기 그대로예요.", "As credited at the time, August 2026."),
  hostLabel: p("주최", "Host"),
  hostLine: p("5개 사의 AX 컨소시엄. 실제 기업 과제를 함께 냅니다.", "a five-firm AX consortium setting real problems"),
  hostMark: { name: "AXMOS", src: "/partners/logos/paper/axmos-wordmark.png", w: 600, h: 120 } as Logo,
  hosts: [
    { name: "Translink Investment", src: "/partners/logos/white/trimmed/translink.png", w: 330, h: 91 },
    { name: "Wilt Venture Builder", src: "/partners/logos/white/trimmed/wilt.png", w: 309, h: 148 },
    { name: "Codepresso", src: "/partners/logos/white/trimmed/codepresso.png", w: 456, h: 91 },
    { name: "Popup Studio", src: "/partners/logos/white/trimmed/popup-studio.png", w: 512, h: 245 },
    { name: "Drimaes", src: "/partners/logos/white/trimmed/drimaes.png", w: 332, h: 50 },
  ] as Logo[],
  organizersLabel: p("주관", "Organizers"),
  organizers: [
    { name: "SMU KSA", src: "/partners/logos/white/trimmed/smu-lion.png", w: 292, h: 173 },
    { name: "NUS Korea Society", src: "/partners/logos/white/trimmed/nus.png", w: 512, h: 512 },
    { name: "NTU KSA", src: "/partners/logos/white/trimmed/ntu-ksa.png", w: 318, h: 382 },
  ] as Logo[],
  sponsorsLabel: p("후원", "Sponsors"),
  sponsors: [
    ["AWS", "aws"], ["INNOVATE 360", "innovate360"], ["L^IFE", "life"], ["BZCF", "bzcf"],
    ["Korean Association in Singapore", "korean-association"], ["Nuldam", "nuldam"], ["Jeju Haenyeo", "haenyeo-kitchen"],
    ["Onword Lab", "onword-lab"], ["REmited", "remited"], ["Brand Boost", "brandboost"], ["Hashed", "hashed"],
  ].map(([name, file]) => ({ name, src: `/partners/logos/white/trimmed/${file}.png`, w: 300, h: 120 })) as Logo[],

  thanksTitle: p("고마운 이름들", "Thank you"),
  thanks: [
    p("문제를 낸 회사", "The company that set the problem"),
    p("저녁 시간을 내 준 멘토들", "The mentors who gave their evenings"),
    p("무대에 선 연사와 전문가들", "The speakers and expert reviewers"),
    p("1:1 멘토링에 회관을 내어 준 싱가포르 한인회", "The Korean Association in Singapore, for its hall"),
    p("각 학교 한인 학생회 운영진", "The student associations at each school"),
    p("그리고 마지막 날 무대에 선 21팀", "And the 21 teams on the final day"),
  ],
  thanksClose: p("이 이름들이 지금의 나루를 만들었어요.", "Those names are what NARU is made of."),
  next: p("다음 자리는 12월, 서울이에요.", "Next up: December, in Seoul."),
  nextCta: p("크로싱 서울 보기", "See CROSSING SEOUL"),
};
