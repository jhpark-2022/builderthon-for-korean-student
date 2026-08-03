// ─────────────────────────────────────────────────────────────────────────────
// SINGLE SOURCE OF TRUTH for the program.
// Both the Timetable grid and the EventModal read from this array, so editing an
// event here updates the card AND the detail view everywhere.
//
// Content transcribed from the authoritative deck (Zero100_Builderthon_deck_
// 수정본.pptx / _EN.pptx). Where a detail (exact mentor / speaker) is not yet
// specified in the source material, the field is left undefined with a
// `// TODO: confirm` note — please do not invent these.
//
// HOURS: the on-site days carry their PARTICIPANT-FACING window in
// `days[].hours` (Day 1 1PM–4:30PM · Day 5 10AM–2PM · Day 7 9AM–2PM ·
// Day 8 11AM–3PM). That field is the single source — nothing else computes it.
//
// It is NOT the booking. Whether set-up/teardown sits inside or outside the
// booked slot differs by venue, so the subtraction differs by day: the Foundry
// (Day 1) includes both inside its slot, *SCAPE (Day 5·8) books them separately
// around the event window. Operational clock times — booked slots, set-up,
// teardown, buffers — are NEVER published; only the numbers above are.
// Online / self-paced days have no hours by design. Per-session clock times do
// not exist yet: do not invent them.
//
// THE 8-DAY SHAPE (per the deck, which is authoritative):
//   • Day 1 — big Opening (1PM–4:30PM at The Foundry, The Refinery hall): 원대로
//     opening keynote + AWS speaker session + the AX problems are released and
//     tracks are chosen. MANDATORY (필참).
//   • Day 2 — one concentrated Crash Course (vibe-coding intro, 5–6h), then team
//     building right after. (A live per-track briefing by the client contacts
//     used to sit here; it was pulled because the format is undecided.)
//   • Day 3–4 — online self-build + 1:1 mentoring, ONLINE-FIRST as of Aug 2026
//     (was "in person by default"): most mentors need to take theirs online, so
//     online is the default and in person — at the KOREAN ASSOCIATION hall in
//     Tanjong Pagar, not NUS (corrected 2026-08-04) — is the exception a
//     mentor may offer. Day 3 and Day 4 are now identical in shape — the
//     tentative OpenAI Codex workshop that sat on Day 3 was removed 2026-08-03.
//   • Day 5 — Networking Day at *SCAPE L^IFE Jungle (10AM–2PM), the first time
//     the whole cohort is in one room; opens Lab 2. Venue and hours are
//     confirmed; the PROGRAMME is IN PLANNING (2026-08-03): the day was
//     re-pointed from "mid-point check-in" to student-to-student networking, and
//     the programme is being designed with Hashed. Its sessions were emptied on
//     purpose — see the DAY 5 block below before adding anything back.
//   • Day 6 — open build (online, self-paced).
//   • Day 7 — Final Rehearsal on-site at the AWS office (9AM–2PM, new venue).
//   • Day 8 — Demo Day at *SCAPE L^IFE Jungle (11AM–3PM). MANDATORY (필참).
//   • Self-paced team build runs continuously from the Day-1 problem release all
//     the way to the Day-8 pitch. In person on Days 1 / 5 / 7 / 8.
// ─────────────────────────────────────────────────────────────────────────────

export type Category =
  | "main" // ★ anchor track: opening · problem release · keynote · demo day
  // Only the Day-2 Crash Course uses this today — the Day-3 Codex workshop was
  // the other one and is gone (2026-08-03). Kept as its own category rather than
  // folded into "main": a teaching session is not an anchor moment.
  | "workshop" // Crash Course (vibe-coding intro)
  | "build" // self-paced / independent team build
  | "mentoring" // 1:1 mentoring
  | "network"; // orientation · panels · networking · mixers

// "mixed" = arranged case by case — used by the Day 3–4 1:1 mentoring, which
// runs online by default but may be in person (Korean Association hall) with
// some mentors.
export type Mode = "online" | "offline" | "mixed";

export interface Bilingual {
  ko: string;
  en: string;
}

export interface BEvent {
  id: string;
  day: number; // 1..8
  date: string; // e.g. "08.22"
  category: Category;
  mode: Mode; // online, in-person (Days 5 / 7 / 8), or mixed (see Mode)
  timeOfDay: "AM" | "PM";
  // 확정된 세션의 실제 시각 ("1:10PM–1:50PM"). 있으면 모달의 시간 행이 AM/PM
  // 대신 이 값을 보여줍니다. Day 1만 채워져 있습니다 — 다른 날은 진행 순서가
  // 아직 없고, 없는 시각을 추론해서 채우면 안 됩니다.
  // 표기는 days[].hours와 같은 컨벤션: 12시간제 대문자 AM/PM, en-dash, 분은
  // 필요할 때만, ko/en 동일 문자열.
  time?: string;
  // Overrides the modal's "Day {n} · {date} · {AM|PM}" chip. Two users: the
  // pre-event session, which sits OUTSIDE the Day 1–8 arc (day: 0) where "Day 0"
  // is not a thing anyone should read; and the Day 5 networking day, whose hours
  // are genuinely unset — an "AM" chip there would assert a time we don't have.
  dayLabel?: Bilingual;
  title: Bilingual;
  summary: Bilingual; // short, shown on the card
  description: Bilingual; // full, shown in the modal
  speaker?: Bilingual;
  // A fuller "who is running this" card for the modal, for sessions where the
  // person is the reason to turn up. `speaker` stays the one-line meta row.
  speakerProfile?: {
    name: Bilingual;
    role: Bilingual;
    bio: Bilingual;
    linkedin?: string;
    img?: string;
  };
  location?: Bilingual;
  // Optional: the venue's own site, turning the modal's 장소 row into a link.
  // For venues a visitor has to physically find and may not know by name — Day 1
  // is at a hall inside a building on Prinsep Link. Not for online sessions, and
  // not a place for booking/cost detail: it links the venue, nothing more.
  locationUrl?: string;
  confirmed?: boolean; // show a "Confirmed / 확정" badge on the card
  // NOT A SESSION. Self-paced build has no start time, no place to be and
  // nothing to attend — teams just build when it suits them. Flagged explicitly
  // rather than inferred from category === "build": the category held a
  // scheduled 4h on-site track (the Day 5 Quickathon) until the Day-5 pivot
  // (2026-08-03), and the next scheduled build session would break inference
  // again. Every "build" event happens to carry this flag today; keep setting it.
  //
  // The UI hides these from the session list entirely (see Journey.tsx): shown
  // as a card with a "자세히 보기" link they read as one more thing to turn up
  // for, which is the opposite of what they are and exactly what makes an
  // 8-day programme look exhausting.
  selfPaced?: boolean;
  // Optional: the company/org behind the session, shown in the modal with a
  // link out. Only add when the partner is real & confirmed (honest by default).
  org?: { name: string; desc: Bilingual; url: string };
  // Optional: concrete opportunities a student gets from attending. Honest —
  // describes the value of the session, not guaranteed outcomes.
  opportunities?: Bilingual[];
}

export interface DayMeta {
  day: number;
  date: string; // "08.22"
  weekday: Bilingual;
  phase: Bilingual; // which of the two Labs this day belongs to
  theme: Bilingual; // day theme label
  summary: Bilingual; // one-line day summary shown on the clean day card
  // 그날 현장에 열려 있는 시간(대관 창). 세션별 시각이 아니라 "언제 가면 되는지"다.
  // 온라인·자율 빌드 날은 비워 둔다 — 시간이 없는 게 그 날의 성격이다.
  // 셋업/철수 시간은 여기 넣지 않는다(비공개).
  //
  // 표기: 12시간제 + 대문자 AM/PM, en-dash `–`, 공백 없음. ko/en 동일 문자열이라
  // Bilingual이 아니라 plain string이다.
  // 세션별 시각의 출처가 아니다: BEvent는 여전히 timeOfDay("AM"|"PM")만 갖고,
  // EventModal의 시간 행도 그대로다. 그날의 대관 창을 개별 세션 시각처럼 보이게
  // 만들지 말 것.
  hours?: string; // "1PM–4:30PM"
  // 그날의 실제 진행 순서. 세션 카드(BEvent)로 만들 만한 것뿐 아니라 입장·휴식·
  // 네트워킹처럼 "카드는 없지만 참가자에겐 중요한" 순간까지 담습니다.
  // eventId가 있으면 그 줄이 해당 세션 카드와 같은 것이라는 뜻이고, 모달에서
  // 클릭하면 그 카드가 열립니다.
  // 확정된 날만 채웁니다 — 비어 있으면 시간표를 아예 렌더하지 않습니다("추후
  // 안내" 같은 자리표시자를 넣지 마세요. 없는 게 정보입니다).
  //
  // hours와의 관계: hours는 프로그램 시간(1PM–4:30PM), 이 배열의 첫 줄은 그보다
  // 이른 입장 시각(12:40)입니다. 입장은 프로그램 시작이 아니므로 hours를
  // 앞당기지 않습니다 — 대신 시간표 첫 줄이 일찍 올 이유를 보여줍니다.
  // href: 세션 카드가 아니라 사이트 안의 다른 페이지로 가는 줄(현재는 /quiz).
  // eventId와 함께 쓰지 마세요 — 한 줄에 목적지는 하나입니다.
  runOfShow?: { time: string; label: Bilingual; note?: Bilingual; eventId?: string; href?: string }[];
  // 이 날 들르면 무엇을 얻는가 — 일정 서술이 아니라 '올 이유' 한 줄.
  //
  // 노선도 아래에서 "하나하나 내려설 이유가 있도록 설계했습니다"라고 주장하는데,
  // 정작 카드들은 그 이유를 말하지 않고 무엇을 하는 날인지만 말하고 있었습니다.
  // 주장은 문단이 하고 증명은 카드가 해야 합니다 — 이 필드가 그 증명입니다.
  //
  // 선택일 전용입니다. 필참일(Day 1·8)에는 렌더하지 않습니다: 갈지 말지를
  // 고르는 날이 아니라 이미 가야 하는 날이고, 거기에 '올 이유'를 붙이면 필참이
  // 설득의 문제로 보입니다(DayCard의 렌더 가드 참고).
  //
  // 없는 이유를 지어내지 마세요. Day 6은 정말로 아무 일정이 없는 날이라 그 사실
  // 자체가 이 줄의 내용입니다 — 가짜 이유를 붙이면 나머지 다섯 줄의 신뢰가 같이
  // 떨어집니다. 한 줄, 길어야 두 줄로 유지하세요(모바일 카드가 늘어납니다).
  whyStop?: Bilingual;
  // 노선도 정거장 키워드 override. 기본값은 theme의 머리(stopKeyword)인데,
  // Day 3·4는 theme이 "자율 빌드 · 멘토링"이라 머리가 "자율 빌드"가 됩니다 —
  // 그날 내려설 이유는 자율 빌드가 아니라 1:1 멘토링이므로 여기서 덮습니다.
  // Day 6은 정말 자율 빌드뿐이라 파생값 그대로 둡니다.
  stopLabel?: Bilingual;
  // "pending" = meant to be on-site but venue isn't locked (Zoom fallback).
  // "mixed"   = both halves in the same day and neither badge alone is honest.
  //             NO DAY USES THIS RIGHT NOW: Day 3·4 held it while their 1:1
  //             mentoring defaulted to in-person. That default flipped to
  //             online, so both days are plain "online" again. Kept because the
  //             badge still renders (Journey.tsx) and the next partly-on-site day
  //             will want it.
  dayMode: "online" | "offline" | "pending" | "mixed";
  mandatory?: boolean; // 필참 — required attendance (Day 1 & Day 8)
  // Force the "자율 진행 / Self-paced" day badge on. Normally that badge is
  // inferred (a day with self-paced build and no real sessions), but Day 6 now
  // carries the FDE office hour — an OPTIONAL drop-in, which doesn't make the
  // day scheduled. Without this the badge would flip to "온라인" and the day
  // would read as somewhere you have to be. Set it only where a day's sessions
  // are all optional.
  selfPacedDay?: boolean;
  // Day 7 only: the pre-submission package is due this evening. Turns on the
  // required-deliverable box in the day modal. Copy lives in
  // dict.program.submission — this is a switch, not content.
  deliverableDue?: boolean;
}

// Two "Labs" across the 8 days (matches the deck):
//   Lab 1 · Warm-up (Day 1–4) → Lab 2 · In action (Day 5–8)
const LAB1: Bilingual = { ko: "Lab 1 · 워밍업", en: "Lab 1 · Warm-up" };
// EN ONLY diverges from KR here. KR "실전"의 짝으로 "Builderthon"이 붙어 있었는데,
// 그건 행사 이름 자체라 페이즈 라벨로 쓰면 "빌더톤 안의 빌더톤"이 됩니다 — 무엇이
// 달라지는 구간인지도 말해주지 못하고요. "In action"은 KR "실전"의 뜻(이제 실제로
// 한다)을 그대로 옮기면서 "Warm-up"과 같은 급의 짧은 상태 표현이라 짝이 맞습니다.
// KR은 건드리지 않습니다.
const LAB2: Bilingual = { ko: "Lab 2 · 실전", en: "Lab 2 · In action" };

// Day theme labels + one-line summaries (Opening → Demo Day)
export const days: DayMeta[] = [
  {
    day: 1,
    date: "08.22",
    weekday: { ko: "토", en: "Sat" },
    phase: LAB1,
    theme: { ko: "오프닝 · 문제 공개", en: "Opening · Problem Release" },
    // 마지막 절만 굿즈입니다. 이 요약은 이미 길어서 확정 내용(브랜드부스트 후드·캡
    // 세트 60개)은 오리엔테이션 세션 설명이 맡고, 카드에는 일찍 올 이유가 되는
    // 부분 — 선착순이라는 사실 — 만 남깁니다.
    // 시간은 이 문장에 없습니다 — `hours`가 카드의 뱃지와 데이 모달 칩으로 한 번씩
    // 렌더되므로, 요약이 다시 말하면 같은 카드에서 두 번 읽힙니다. 시간을 바꿀 때
    // 고치는 곳은 `hours` 하나입니다. (Day 5·7·8도 같은 규칙.)
    // 예외가 하나: 12:40 입장. hours(1PM–)보다 이르고, 일찍 올 이유(선착순 굿즈)가
    // 붙어 있어 카드에서 한 번은 보여야 합니다. 상세 순서는 runOfShow가 맡으므로
    // 요약은 짧게 유지하세요.
    summary: {
      ko: "The Foundry(The Refinery 홀) 현장 · 12:40 입장(선착순 굿즈) · 원대로 오프닝 키노트 · 해시드 인사말 · 문제 공개 · AWS 연사 한장환 님(확정).",
      en: "In person at The Foundry (The Refinery hall) · doors 12:40 (first-come goods) · Won's opening keynote · a word from Hashed · problem release · AWS talk by Han Jang-whan (confirmed).",
    },
    // Venue booked: The Foundry — The Refinery hall, 11 Prinsep Link, 22 Aug 2026
    // (2026-08-03). On-site was already confirmed under the previous booking (SMU
    // YPHSL B2-03) and stays confirmed; only the room changed.
    // 이 날만 계산이 다릅니다. Foundry는 셋업·철수가 대관 시간 "안에" 들어 있어서
    // (12–5PM 슬롯, 17:00 완전 퇴장), 앞의 셋업·등록 1시간과 뒤의 철수 30분을 뺀
    // 1PM–4:30PM이 참가자 기준 실제 프로그램 시간입니다. *SCAPE(Day 5·8)는 반대로
    // 셋업/철수가 이벤트 시간 밖에 따로 잡혀 있어 10AM–2PM·11AM–3PM이 이미 순수
    // 프로그램 시간이므로 깎지 않습니다 — 장소마다 계약 구조가 달라 날마다 계산이
    // 다릅니다. 운영 시각(대관 창·셋업·철수)은 사이트 어디에도 쓰지 않습니다.
    hours: "1PM–4:30PM",
    // 확정 진행 순서 (2026-08-04). 9줄 전부 — 카드가 없는 줄(입장·휴식·네트워킹·
    // 정리)이 절반이라 이벤트 배열로는 표현되지 않습니다.
    // 팀 매칭이 두 번 나오는데(1:50 성향 테스트 · 3:10 즉석 매칭) 둘 다 "팀 없이
    // 온 분"만 해당합니다 — 사이트에서 팀을 만들어 신청한 사람은 해당 없음을
    // 두 줄 모두에 적었습니다. 이걸 빼면 이미 팀이 있는 사람이 자기도 뭔가
    // 해야 하는 줄 압니다.
    runOfShow: [
      {
        time: "12:40PM–1PM",
        label: { ko: "입장 · 이름표 수령 · 선착순 굿즈", en: "Doors open · name tags · first-come goods" },
        // 굿즈 안내가 여기 다 들어 있습니다 — 오리엔테이션 설명에 있던 것을
        // 옮겨왔습니다(2026-08-04). 나눠주는 시점이 이 줄이니 읽는 자리도 이 줄이어야
        // 하고, 오리엔테이션(2:10PM) 설명에서 "굿즈는 12:40에 드려요"라고 말하는 건
        // 이미 지나간 일을 뒤늦게 알려주는 셈이었습니다.
        // 사이즈 이야기를 미리 하는 게 현장 불만을 줄입니다. "전원 제공"으로
        // 읽히는 표현은 금지 — 60세트가 사실입니다.
        // 참석 여부 확인도 여기 붙습니다: 이 줄이 "현장에 오는 일"을 다루는 유일한
        // 줄이고, 확인 채널은 아직 정해지지 않아 경로는 쓰지 않습니다.
        note: { ko: "브랜드부스트 후드·캡 세트 60개 선착순 · 사이즈 선택은 어렵습니다 — 받고 싶다면 일찍 오시는 게 확실해요. 현장 인원을 미리 잡기 위해 행사 이틀 전에 참석 여부를 여쭤봅니다.", en: "60 Brand Boost hoodie + cap sets, first come first served · sizes can't be chosen — arriving early is the sure way to get one. We'll also ask whether you're coming two days before the event, so we can size the room." },
      },
      {
        time: "1PM–1:10PM",
        label: { ko: "환영 인사 · 오늘의 순서 안내", en: "Welcome · what today looks like" },
      },
      {
        time: "1:10PM–1:50PM",
        label: { ko: "오프닝 키노트 · 원대로", en: "Opening keynote · Won Dae-ro" },
        eventId: "d1-opening-keynote",
      },
      {
        time: "1:50PM–2PM",
        label: { ko: "쉬는 시간 · 팀 매칭 성향 테스트", en: "Break · personality test for team matching" },
        note: { ko: "팀 없이 오신 분만 — 유형 테스트로 성향을 받아 현장에서 팀을 이어드립니다. 이미 팀으로 신청했다면 해당 없어요.", en: "Only if you came without a team — the type test reads your working style so we can match you on site. Nothing to do if you registered as a team." },
        // 이 줄이 가리키는 것은 사이트의 /quiz입니다 — FAQ 솔로 답변이 팀 매칭을
        // "AI 유형 테스트 + Day 1 현장 그룹핑"으로 이미 설명하고 있어 같은 흐름입니다.
        href: "/quiz",
      },
      {
        time: "2PM–2:10PM",
        label: { ko: "해시드 파트너 인사말", en: "A word from Hashed" },
        eventId: "d1-hashed-greeting",
      },
      {
        time: "2:10PM–2:30PM",
        label: { ko: "7일 진행 안내 · 멘토링 안내", en: "How the next 7 days run · mentoring" },
        eventId: "d1-orientation",
      },
      // 같은 20분 블록의 마지막 순서. time을 비우면 시간 열에 ↳가 찍혀 위 줄에
      // 이어지는 항목으로 읽힙니다 — 없는 시각을 쪼개 만들지 않으면서도 문제 공개가
      // 자기 카드로 이어질 수 있게 하는 유일한 방법입니다. 시간표가 세션 카드를
      // 대체하므로, 여기 걸리지 않은 세션은 열 방법이 사라집니다.
      {
        time: "",
        label: { ko: "문제 공개 · 트랙 선택", en: "Problem release · track selection" },
        note: { ko: "이 블록의 마지막 순서입니다", en: "The last item in that block" },
        eventId: "d1-problem-release",
      },
      {
        time: "2:30PM–3:10PM",
        label: { ko: "AWS 세션 · 한장환", en: "AWS session · Han Jang-whan" },
        eventId: "d1-aws-session",
      },
      {
        time: "3:10PM–4PM",
        label: { ko: "네트워킹 · 문제 브레인스토밍 · 팀 매칭", en: "Networking · brainstorming the problem · team matching" },
        note: { ko: "원하는 팀은 이때부터 바로 빌드를 시작해도 됩니다 · 팀 없이 오신 분은 이 시간에 즉석 매칭", en: "Teams can start building right here if they want · anyone who came solo gets matched during this slot" },
      },
      {
        time: "4PM–4:30PM",
        label: { ko: "마무리 · 정리", en: "Wrap-up" },
      },
    ],
    dayMode: "offline",
    mandatory: true,
  },
  {
    day: 2,
    date: "08.23",
    weekday: { ko: "일", en: "Sun" },
    phase: LAB1,
    theme: { ko: "크래시코스 (집중)", en: "Crash Course" },
    summary: {
      ko: "바이브 코딩 입문 집중 5–6시간(비개발자 OK) · 코드프레소 김지훈 이사님 진행.",
      en: "A focused 5–6h vibe-coding intro (beginners OK) · led by Jihoon Kim, Director at Codepresso.",
    },
    whyStop: {
      ko: "혼자 헤매며 배울 몇 주를, 출발선 맞추는 하루로 압축",
      en: "Weeks of solo trial-and-error, compressed into one day",
    },
    dayMode: "online",
  },
  {
    day: 3,
    date: "08.24",
    weekday: { ko: "월", en: "Mon" },
    phase: LAB1,
    theme: { ko: "자율 빌드 · 멘토링", en: "Self-paced build · Mentoring" },
    // Leads with "정해진 일정은 …뿐" rather than the task list. The old version
    // opened with what teams should get done, which reads as assigned work on a
    // day whose only fixed item is an optional 1:1 slot.
    summary: {
      ko: "정해진 일정은 오후 1:1 멘토링(온라인 기본)뿐 — 나머지는 각자 비는 시간에 원하는 만큼 빌드하면 됩니다.",
      en: "The only fixed thing is a PM 1:1 mentoring slot (online by default) — the rest is yours to build in whatever free time you have.",
    },
    whyStop: {
      ko: "방향을 아직 바꿀 수 있을 때 받는 두 번째 1:1",
      en: "A second 1:1, while there's still time to change direction",
    },
    stopLabel: { ko: "1:1 멘토링", en: "1:1 mentoring" },
    dayMode: "online",
  },
  {
    day: 4,
    date: "08.25",
    weekday: { ko: "화", en: "Tue" },
    phase: LAB1,
    theme: { ko: "자율 빌드 · 멘토링", en: "Self-paced build · Mentoring" },
    summary: {
      ko: "정해진 일정은 오후 1:1 멘토링(온라인 기본)뿐 — 나머지는 각자 비는 시간에 원하는 만큼 빌드하면 됩니다.",
      en: "The only fixed thing is a PM 1:1 mentoring slot (online by default) — the rest is yours to build in whatever free time you have.",
    },
    whyStop: {
      ko: "내 아이디어를 현직자에게 1:1로 검증받는 첫 기회",
      en: "The first time your idea meets a working founder, 1:1",
    },
    stopLabel: { ko: "1:1 멘토링", en: "1:1 mentoring" },
    dayMode: "online",
  },
  {
    day: 5,
    date: "08.26",
    weekday: { ko: "수", en: "Wed" },
    phase: LAB2,
    // "네트워킹 데이 (기획 중)" is the EVENT title; the theme drops 데이 because the
    // route-map stop label is derived from this field (head segment before "·",
    // parentheses stripped — see stopKeyword in Journey.tsx), and the strip wants
    // the one word: 네트워킹 / Networking.
    theme: { ko: "네트워킹 (기획 중)", en: "Networking (in planning)" },
    // 10AM–2PM is the *SCAPE EVENT window — set-up (9AM) and teardown (3PM) are
    // booked separately OUTSIDE it, so unlike Day 1 there is nothing to subtract:
    // this is already pure programme time. Do not trim it "for consistency" with
    // the Foundry day.
    // WHAT IS STILL OPEN IS THE PROGRAMME, not the time: keep the "해시드와 기획 중
    // / being planned with Hashed" hedge exactly as it is until the joint
    // programme is settled. 장소·시간 확정 ≠ 프로그램 확정.
    //
    // Deliberately NOT the event's own summary reworded: the day modal prints
    // this line directly above the networking-day card, and with one session
    // carrying the whole day the two were saying the same sentence twice. This
    // one gives the frame (온라인 구간을 지나 현장으로 · 선택), the card gives the
    // programme.
    summary: {
      ko: "온라인 구간을 지나 다시 현장으로 — *SCAPE에서 학생 간 네트워킹에 초점을 둔 프로그램을 해시드와 기획 중입니다 · FDE 오피스아워(온라인).",
      en: "Back in person after the online stretch — at *SCAPE, with a programme focused on student-to-student networking being planned with Hashed · FDE office hours (online).",
    },
    // 프로그램이 아니라 '만남' 자체가 이유입니다 — 세부 구성은 아직 해시드와
    // 기획 중이라, 여기서 프로그램을 약속하면 헤지가 무너집니다.
    whyStop: {
      ko: "함께 만드는 사람들을 전원이 처음 만나는 날",
      en: "The day you finally meet everyone you've been building alongside",
    },
    hours: "10AM–2PM",
    dayMode: "offline",
  },
  {
    day: 6,
    date: "08.27",
    weekday: { ko: "목", en: "Thu" },
    phase: LAB2,
    theme: { ko: "자율 빌드", en: "Self-paced build" },
    summary: {
      ko: "필요하면 팝업스튜디오 FDE 오피스아워(온라인)에 드롭인하세요 — 예약도 출석도 없습니다.",
      en: "Drop in to Popup Studio's FDE office hours (online) if you need them — no booking, no attendance.",
    },
    // 없는 이유를 지어내지 않습니다. 이 날은 정말 아무 일정이 없고, 그 사실이
    // 이 줄의 내용입니다. 요약에서 "정해진 일정이 하나도 없는 날"을 뺀 것도
    // 이 줄과 같은 말이기 때문입니다 — 한 카드에서 두 번 읽히면 안 됩니다.
    whyStop: {
      ko: "정해진 것 없음 — 온전히 팀의 빌드 시간",
      en: "Nothing scheduled — the day belongs to your team's build",
    },
    dayMode: "online",
    // The FDE office hour is a drop-in, so the day is still free-form.
    selfPacedDay: true,
  },
  {
    day: 7,
    date: "08.28",
    weekday: { ko: "금", en: "Fri" },
    phase: LAB2,
    theme: { ko: "파이널 리허설", en: "Final Rehearsal" },
    // "네트워킹 점심"이었는데 고쳤습니다 (2026-08-04) — 식사가 제공되는 것으로
    // 읽히지만 실제로는 각자 나가서 사 먹습니다. 현장에서 바로 불만이 되는 종류의
    // 오해라 요약과 시간표 양쪽에서 "개별"임이 드러나야 합니다.
    summary: {
      ko: "AWS 오피스(확정) · 멘토와 함께하는 최종 점검 · 점심(개별) · 박희덕 커리어 간담회 · FDE 오피스아워(온라인) · 저녁: 사전 제출물 마감(필수).",
      en: "AWS office (confirmed) · final check with mentors · lunch (on your own) · Park Hee-deok career session · FDE office hours (online) · Evening: submission deadline (required).",
    },
    whyStop: {
      ko: "심사위원이 던질 질문을 무대에 서기 하루 전에 미리 받아보는 자리",
      en: "The judges' questions, asked a day before you're on stage",
    },
    hours: "9AM–2PM",
    // 확정 진행 순서 (2026-08-04). 9AM–2PM 안에서 네 줄이 전부입니다.
    // FDE 오피스아워(d7-fde-office-hour)는 온라인 별개 트랙이고 시간도 미정이라
    // 여기 넣지 않습니다 — 시간표는 현장에 있는 사람의 하루입니다. 카드로만 남습니다.
    runOfShow: [
      {
        time: "9AM–9:10AM",
        label: { ko: "인트로 · 멘토 소개", en: "Intro · meet the mentors" },
      },
      {
        time: "9:10AM–11:30AM",
        label: { ko: "멘토링 · 최종 점검", en: "Mentoring · final check" },
        eventId: "d7-final-rehearsal",
      },
      {
        time: "11:30AM–12:30PM",
        label: { ko: "점심", en: "Lunch" },
        note: { ko: "식사는 제공되지 않아요 — 근처에서 각자 해결합니다. 그대로 나가서 네트워킹하거나 멘토와 이야기를 이어가도 좋아요.", en: "Lunch isn't provided — grab something nearby. Feel free to head out together and keep networking, or carry on with a mentor." },
      },
      {
        time: "12:30PM–2PM",
        label: { ko: "커리어 간담회 · 박희덕", en: "Career session · Park Hee-deok" },
        eventId: "d7-speaker-session",
      },
    ],
    dayMode: "offline",
    // What the deadline actually consists of is a LIST, and a list read as a
    // parenthetical inside an already-long day summary is the one thing nobody
    // parses. The modal renders it as its own bordered box instead (see
    // dict.program.submission) — this flag is what turns that box on.
    deliverableDue: true,
  },
  {
    day: 8,
    date: "08.29",
    weekday: { ko: "토", en: "Sat" },
    phase: LAB2,
    theme: { ko: "데모데이 · 최종 발표", en: "Demo Day · Final Pitch" },
    summary: {
      ko: "*SCAPE 현장 · 두 트랙 팀 발표(팀당 8분) · 박희덕 연사 · 수상자 발표 · 수료증과 단체 사진.",
      en: "In person at *SCAPE · team pitches across two tracks (8 min each) · Park Hee-deok · awards · certificates and a group photo.",
    },
    hours: "11AM–3PM",
    // 확정 진행 순서 (2026-08-04). 10:40 입장은 hours(11AM–)보다 이르지만 프로그램
    // 시작이 아니므로 hours를 앞당기지 않습니다 — Day 1의 12:40 입장과 같은 규칙.
    // 두 트랙 발표(3·4번 줄)가 같은 카드(d8-judging)를 가리킵니다. 하나의 세션이
    // 두 블록으로 나뉘어 도는 것이고, 카드를 둘로 쪼개면 같은 설명이 두 번 생깁니다.
    runOfShow: [
      {
        time: "10:40AM–11AM",
        label: { ko: "입장", en: "Doors open" },
        note: { ko: "발표 순서는 이날 아침 오픈 카톡방으로 미리 공지됩니다", en: "The running order goes out that morning in the open chat" },
      },
      {
        time: "11AM–11:10AM",
        label: { ko: "지금까지의 여정 정리 · 데모데이 시작", en: "Looking back at the eight days · Demo Day begins" },
      },
      {
        time: "11:10AM–12:30PM",
        label: { ko: "첫 번째 트랙 발표", en: "First track pitches" },
        note: { ko: "팀당 8분 — 발표 3분 + Q&A 포함 심사 5분", en: "8 minutes per team — a 3-minute pitch, then 5 minutes of judging including Q&A" },
        eventId: "d8-judging",
      },
      {
        time: "12:30PM–1:50PM",
        label: { ko: "두 번째 트랙 발표", en: "Second track pitches" },
        note: { ko: "자기 트랙이 아닌 시간에는 자유롭게 — 남아서 봐도, *SCAPE를 둘러봐도 됩니다", en: "Outside your own track you're free — stay and watch, or wander *SCAPE" },
        eventId: "d8-judging",
      },
      {
        time: "1:50PM–2:30PM",
        label: { ko: "박희덕 연사", en: "Park Hee-deok speaks" },
        eventId: "d8-opening-keynote",
      },
      {
        time: "2:30PM–2:45PM",
        label: { ko: "수상자 발표 · 사진", en: "Awards announced · photos" },
        eventId: "d8-final-pitch",
      },
      {
        time: "2:45PM–3PM",
        label: { ko: "What's next 안내 · 수료증과 함께 단체 사진", en: "What's next · group photo with your certificate" },
      },
    ],
    dayMode: "offline",
    mandatory: true,
  },
];

// Category legend (label + short meaning, both bilingual)
export const categoryMeta: Record<
  Category,
  { label: Bilingual; blurb: Bilingual; dot: string }
> = {
  main: {
    label: { ko: "메인 트랙", en: "Main Track" },
    blurb: {
      ko: "문제 공개 · 키노트 · 데모데이 — 행사의 핵심 마디.",
      en: "Problem Release · Keynote · Demo Day — the anchor moments.",
    },
    dot: "#fcd34d", // bright gold (matches the ★) — visible on the dark theme
  },
  workshop: {
    label: { ko: "워크숍", en: "Workshop" },
    blurb: {
      ko: "크래시코스(바이브 코딩 입문) — 처음이어도 출발선을 맞춥니다.",
      en: "The Crash Course (vibe-coding intro) — leveling the start line.",
    },
    dot: "#7C5CFF", // purple
  },
  build: {
    label: { ko: "빌드 / 자율", en: "Build / Open" },
    // Says what it ISN'T first: "상시 진행" was being read as "always on, so be
    // online for it" — the opposite of what it means.
    blurb: {
      ko: "정해진 세션·출석 없음 — 각자 편한 시간에 진행하는 자율 빌드.",
      en: "No sessions, no attendance — build at your own time and pace.",
    },
    dot: "#64748B", // slate grey
  },
  mentoring: {
    label: { ko: "멘토링", en: "Mentoring" },
    blurb: {
      ko: "막히는 지점·피칭 준비를 멘토와 1:1로 풀어내는 시간.",
      en: "1:1 time with mentors for blockers and pitch prep.",
    },
    dot: "#0F9D8F", // teal
  },
  network: {
    label: { ko: "네트워킹", en: "Networking" },
    blurb: {
      ko: "브리핑 · 네트워킹 · 믹서 — 사람과 사람을 잇는 시간.",
      en: "Briefing · networking · mixers — connecting people.",
    },
    dot: "#2F6DF0", // blue
  },
};

// Location helpers.
const ONLINE: Bilingual = { ko: "온라인", en: "Online" };
const ONSITE: Bilingual = {
  ko: "*SCAPE L^IFE Jungle, 싱가포르 · 현장 집결",
  en: "*SCAPE L^IFE Jungle, Singapore · in person",
};
// Day 1 kickoff venue — The Foundry's The Refinery hall, booked 2026-08-03 for
// 22 Aug. This REPLACED SMU YPHSL B2-03: that room was the Day-1 booking until
// the Foundry hall was confirmed, and every Day-1 venue string moved with it in
// one pass. Do not leave the two names co-existing — a student reading "SMU" on
// one surface and "Prinsep Link" on another has no way to tell which door to
// walk through. (The 8/13 PRE-EVENT session is a different booking and is still
// at SMU SOL; SMU also remains an organizer and an eligibility term. Only VENUE
// references changed.)
// The street address rides in the string because this is a room inside a
// building on a road nobody knows by name; "The Foundry" alone is not findable.
// Only Day 1 uses this — Networking Day (Day 5) and Demo Day (Day 8) are at
// *SCAPE (ONSITE), Day 7 at the AWS office.
const FOUNDRY_REFINERY: Bilingual = {
  ko: "The Foundry (The Refinery 홀) · 11 Prinsep Link",
  en: "The Foundry (The Refinery hall) · 11 Prinsep Link",
};
// The venue's own site, shown as a link on the modal's 장소 row (see
// BEvent.locationUrl). Booking terms and costs stay OUT of the site.
const FOUNDRY_URL = "https://foundry.sg";
// Day 7's new venue — the Final Rehearsal moves to the AWS office (confirmed).
const AWS_OFFICE: Bilingual = {
  ko: "AWS 오피스, 싱가포르 · 현장",
  en: "AWS office, Singapore · in person",
};
// Days 3–4's 1:1 mentoring is arranged MENTOR BY MENTOR, and the default is
// ONLINE. In person is what an individual mentor may offer, not what the
// programme promises — enough of them can only make an online slot that leading
// with F2F would be the wrong way round.
//
// THE F2F VENUE IS THE KOREAN ASSOCIATION HALL (2026-08-04), not NUS. Every
// "NUS 대면" on this page came from the deck's original plan; the sessions are
// actually hosted by the Korean Association in Singapore at its own hall in
// Tanjong Pagar — which is also why it carries the 장소 role on the partner wall.
// NUS stays everywhere it is legitimately used (organizer 학생회, eligibility,
// a judge's affiliation); only the mentoring VENUE moved.
const MENTORING_MODE: Bilingual = {
  ko: "온라인 기본 — 멘토에 따라 한인회관 대면(F2F)",
  en: "Online by default — in person at the Korean Association hall with some mentors",
};
// Codepresso runs the Day-2 Crash Course (vibe-coding intro), per the deck.
const CODEPRESSO_ORG = {
  name: "Codepresso",
  url: "https://codepresso.io",
  desc: {
    ko: "코드프레소는 AI·소프트웨어 교육 전문 기업으로, 이번 빌더톤 Day 2의 크래시코스(바이브 코딩 입문)를 주관합니다.",
    en: "Codepresso is an AI & software-education company running the Day-2 Crash Course (vibe-coding intro).",
  },
} as const;

// OPENAI_ORG lived here for the Day-3 Codex workshop and was deleted with it
// (2026-08-03). OpenAI is not a partner of this event — do not add it back as
// one without an agreement.

// Popup Studio runs the stage-2 mentoring: online FDE office hours across
// Day 5–7. The programme itself is agreed; only the time slots are open, which
// is why the events carry neither a "확정" nor a "TBC" badge — a TBC badge would
// read as "this might not happen", which is not what is unsettled here.
const POPUP_STUDIO_ORG = {
  name: "Popup Studio",
  url: "https://popupstudio.ai",
  desc: {
    ko: "팝업스튜디오는 AI 전환(AX)을 업으로 하는 싱가포르 본사 기업으로, Day 5–7 동안 FDE 온라인 오피스아워를 열어 팀별 문제 정의·워크플로·구현 방향을 함께 점검합니다.",
    en: "Popup Studio is a Singapore-headquartered AI-transformation (AX) company. Across Day 5–7 its FDEs hold online office hours to review each team's problem definition, workflow and implementation direction.",
  },
} as const;

// The three Day 5–7 office-hour entries are identical apart from `day`/`id` —
// one per day so the session shows up on each day's card and modal, rather than
// living on Day 5 only and being invisible to someone opening Day 6 or 7.
// Written once here so the three can never drift apart.
// TODO: 시간대 확정 시 timeOfDay 조정 (현재 PM은 자리표시자).
const FDE_OFFICE_HOUR = {
  date: "",
  category: "mentoring" as const,
  mode: "online" as const,
  timeOfDay: "PM" as const,
  title: { ko: "FDE 오피스아워 · 팝업스튜디오", en: "FDE Office Hours · Popup Studio" },
  summary: {
    ko: "온라인 드롭인 — 문제 정의·워크플로·구현 방향을 FDE와 점검해요 (시간 추후 안내).",
    en: "Online drop-in — check your problem definition, workflow and build direction with FDEs (times TBA).",
  },
  description: {
    ko: "기초 멘토링(Day 3·4)을 지난 팀을 위한 실전 2단계입니다. AI 전환을 업으로 하는 팝업스튜디오의 FDE(Forward-Deployed Engineer)들이 Day 5–7 동안 온라인 오피스아워를 열어 둡니다 — 원하는 팀이 원하는 때 드롭인해서 문제 정의, 워크플로 분석, 구현 방향을 점검받으세요. 예약·출석 의무가 없고, 시간대는 추후 안내됩니다. 멘토 지정 없이 열려 있는 시간이라는 점은 다른 멘토링과 같아요.",
    en: "Stage two, for teams past the foundational mentoring on Day 3·4. Popup Studio — an AI-transformation company — keeps online office hours open across Day 5–7 with its FDEs (Forward-Deployed Engineers): drop in whenever your team wants and get a read on your problem definition, workflow analysis and implementation direction. There's no booking and no attendance obligation, and the time slots will be announced. Like the rest of the mentoring, it's open time rather than a mentor you pick.",
  },
  location: ONLINE,
  org: POPUP_STUDIO_ORG,
};

// Hashed co-designs the Day-5 Networking Day (2026-08-03; it was the Quickathon
// side quest before that day was re-pointed at networking). STILL A DISCUSSION —
// keep the "함께 기획 중 / co-designing" hedge, same as 조율 중 / 섭외 중 elsewhere.
// Nothing about the programme is agreed, so never write this as a fixed session.
const HASHED_ORG = {
  name: "Hashed",
  url: "https://hashed.com",
  desc: {
    ko: "해시드는 블록체인·프론티어 테크 투자사로, Day 5 네트워킹 데이의 프로그램을 저희와 함께 기획하고 있습니다 (세부 구성 논의 중).",
    en: "Hashed, a blockchain & frontier-tech investment firm, is co-designing the Day-5 Networking Day programme with us (the details are still under discussion).",
  },
} as const;

export const schedule: BEvent[] = [
  // ─── PRE-EVENT · 13 Aug ────────────────────────────────────────────────────
  // day: 0 — this is NOT part of the 8-day arc; it runs nine days before Day 1.
  // Everything that walks the day grid filters by `e.day === dayNum` for 1..8,
  // so 0 never appears in a day card, a day modal or a session count. It is
  // surfaced by one band above Lab 1 (see PreEventBand in Journey.tsx).
  //
  // THE SPEAKER ASKED NOT TO BE NAMED PUBLICLY. `speaker` carries a role, not a
  // person, and there is no photo or LinkedIn anywhere for this entry. That is
  // the request, not missing data — do not "complete" it.
  // Wording is from his own LinkedIn headline ("Senior Cloud & AI Solution
  // Architect @ Microsoft").
  //
  // Building is agreed (SMU SOL, the School of Law); the ROOM is still TBC. Keep the
  // "강의실 확정 시 안내" clause until a room is actually booked.
  {
    id: "pre-enterprise-deep-dive",
    day: 0,
    date: "08.13",
    category: "workshop",
    mode: "offline",
    timeOfDay: "PM",
    confirmed: true,
    // 이 세션만 예약 창을 그대로 공개합니다 (18:00–20:00, 2026-08-03 확정).
    // Day 1처럼 버퍼를 빼지 않는 것은 의도된 결정입니다 — 강연 1시간에 입장·Q&A·
    // 정리가 얹히는 자리라, 학생에게 필요한 정보는 "몇 분짜리 강연인가"가 아니라
    // "이 시간대를 비워두면 된다"이기 때문입니다. 이전에는 강연 길이만 적어(1시간
    // 창) 실제 창보다 좁게 안내됐습니다. 여기와 description 두 곳이 같은 값을
    // 말해야 하고, 되돌려 버퍼를 빼지 마세요.
    dayLabel: { ko: "사전 세션 · 08.13 (목) 18:00–20:00", en: "Pre-event · Thu 13 Aug, 18:00–20:00" },
    title: { ko: "Enterprise Tech Deep Dive — How to Build", en: "Enterprise Tech Deep Dive — How to Build" },
    // Just the role — no "(성함 비공개)" tag. Saying out loud that a name is being
    // withheld draws attention to the absence and reads as something hidden; the
    // role alone reads as a normal listing. The comment above is the record of WHY
    // there is no name here — keep that, and never fill one in.
    speaker: { ko: "Microsoft 클라우드·AI 솔루션 아키텍트", en: "Microsoft cloud & AI solution architect" },
    summary: {
      ko: "본 행사 9일 전 · SMU SOL 현장 — “데모는 쉽고, 시스템은 어렵다”. 엔터프라이즈 AI 에이전트를 실제로 만드는 이야기.",
      en: "Nine days before the event · in person at SMU SOL — “the demo is easy, the system is hard”: building enterprise AI agents for real.",
    },
    description: {
      ko: "빌더톤이 시작되기 전, 기업 현장에서 AI를 실제로 설계하고 배포하는 사람에게 직접 듣는 시간입니다. Microsoft 클라우드·AI 솔루션 아키텍트가 ‘엔터프라이즈 AI 에이전트가 보기보다 어려운 이유’를 다룹니다 — 데모는 2초면 되지만 프로덕션까지는 몇 달이 걸리는 이유, 챗봇과 에이전트를 가르는 것(신원·권한·툴·승인·감사), 그리고 실제로 구축된 회계 자동화 에이전트 사례. 8월 13일 목요일 18:00–20:00, SMU SOL(School of Law)에서 열리며 강의실은 확정되는 대로 안내합니다. 빌더톤 등록 여부와 무관하게 NUS·NTU·SMU 한인 학생이면 누구나 올 수 있습니다. 사전에 받은 질문을 세션에 반영하니 오픈채팅으로 미리 보내주세요.",
      en: "Before the builderthon starts, an evening with someone who designs and ships enterprise AI for a living. A Microsoft cloud & AI solution architect covers why enterprise AI agents are harder than they look — why a 2-second demo takes months to reach production, what separates a chatbot from an agent (identity, permissions, tools, approval, audit), and a real accounts-payable agent built end to end. Thursday 13 August, 18:00–20:00, at SMU SOL (School of Law) — the room will be announced once booked. Open to any Korean student at NUS, NTU or SMU, whether or not you register for the builderthon. Questions are worked into the session, so send yours via the open chat beforehand.",
    },
    // Building is settled (SMU School of Law); the ROOM is not.
    // This is now the ONLY SMU venue in the schedule. Day 1 used to share the
    // same law school under its full name ("SMU YPHSL B2-03") and this note
    // asked for the two to be named consistently — as of 2026-08-03 Day 1 moved
    // to The Foundry, so there is nothing left to unify. Keep this session at
    // SMU SOL: it is a separate booking and was never part of that move.
    location: { ko: "SMU SOL (강의실 추후 안내)", en: "SMU SOL — School of Law (room TBA)" },
    opportunities: [
      { ko: "챗봇과 에이전트의 차이 — 신원·권한·툴·승인·감사까지 붙어야 일이 된다", en: "What separates a chatbot from an agent — identity, permissions, tools, approval, audit" },
      { ko: "기업 에이전트가 어려운 6가지 이유와, 실제 구축된 회계 자동화 에이전트 사례", en: "The six reasons enterprise agents are hard, and a real accounts-payable agent that works" },
      { ko: "빌더톤 과제를 풀 때 바로 쓸 수 있는 아키텍처 관점", en: "An architecture lens you can take straight into the builderthon problems" },
      { ko: "사전 질문을 받아 세션에 반영 — 오픈채팅으로 보내면 됩니다", en: "Questions collected in advance and worked into the session — send them via the open chat" },
    ],
  },
  // ─── DAY 1 · Opening · Problem Release (08.22) ──────────────────────────────
  {
    id: "d1-opening-keynote",
    day: 1,
    date: "08.22",
    category: "main",
    mode: "offline",
    timeOfDay: "PM",
    time: "1:10PM–1:50PM",
    confirmed: true,
    title: { ko: "오프닝 키노트 · 원대로", en: "Opening Keynote · Won Dae-ro" },
    // TODO: confirm — speaker name is from the internal deck; confirm public naming is OK.
    speaker: { ko: "원대로", en: "Won Dae-ro" },
    summary: {
      ko: "‘취업과 창업의 사이’ — 8일의 ‘왜’를 여는 오프닝 키노트.",
      en: "“Between Employment and Founding” — the keynote that opens the 8-day ‘why’.",
    },
    description: {
      ko: "빌더톤의 문을 여는 오프닝 키노트입니다. Wilt Venture Builder(SG)의 원대로 대표님이 ‘취업과 창업의 사이’를 주제로, 정형화된 ‘취업 vs 창업’ 이분법에서 벗어나 벤처빌더가 본 다양한 진로·커리어 경로와 비개발자도 시작할 수 있는 여러 갈래를 약 1시간 동안 Q&A와 함께 풀어냅니다. ‘처음이어도 괜찮다’는 톤으로 8일의 ‘왜’를 세우며 출발선을 엽니다.",
      en: "The keynote that opens the builderthon. Won Dae-ro (Managing Director, Wilt Venture Builder SG) speaks on “Between Employment and Founding” for about an hour, with Q&A — stepping past the tidy ‘employment vs. founding’ binary to the many career paths a venture builder has seen, and the routes even non-developers can start from. It sets the 8-day ‘why’ in a ‘first-timers welcome’ tone.",
    },
    location: FOUNDRY_REFINERY,
    locationUrl: FOUNDRY_URL,
  },
  {
    id: "d1-orientation",
    day: 1,
    date: "08.22",
    category: "network",
    mode: "offline",
    timeOfDay: "PM",
    time: "2:10PM–2:30PM",
    title: { ko: "오리엔테이션", en: "Orientation" },
    // SPEAKER 필드를 지웠습니다 (2026-08-04). `한장환 (AWS)`로 돼 있었는데 그분은
    // 바로 다음 순서인 AWS 세션 연사입니다 — 오리엔테이션 진행자일 리 없어 복사
    // 실수로 판단했습니다. 진행자가 정해지면 다시 넣으세요.
    //
    // 굿즈·참석 확인 안내는 여기 있다가 12:40 입장 줄(runOfShow)로 옮겼습니다
    // (2026-08-04). 2:10PM 세션 설명에서 "굿즈는 12:40에 드려요"라고 말하는 건
    // 이미 지나간 일을 뒤늦게 알려주는 셈이었고, 나눠주는 시점과 읽는 자리가
    // 같아야 일찍 올 이유가 됩니다. 여기로 되돌리지 마세요.
    summary: {
      ko: "앞으로 7일이 어떻게 굴러가는지 · 멘토링 운영 · 마지막 순서로 문제 공개.",
      en: "How the next seven days run · how mentoring works · and the problems drop at the end.",
    },
    description: {
      ko: "앞으로 7일이 어떻게 굴러가는지를 한 번에 정리하는 자리입니다. 트랙 구성과 팀 운영, 평가 흐름을 짚고, 멘토링이 어떻게 돌아가는지 — 언제 열리고, 어떻게 신청하고, 누구를 만나게 되는지 — 를 함께 안내합니다. 그리고 이 블록의 마지막 순서로 실제 과제가 공개됩니다(문제 공개 카드 참고).",
      en: "One sitting that lays out how the next seven days run: the tracks, team logistics and the judging flow, plus how mentoring actually works — when it opens, how you request a slot, who you end up with. The real problems are then released as the last item in this block (see the problem-release card).",
    },
    location: FOUNDRY_REFINERY,
    locationUrl: FOUNDRY_URL,
  },
  {
    id: "d1-aws-session",
    day: 1,
    date: "08.22",
    category: "main",
    mode: "offline",
    timeOfDay: "PM",
    time: "2:30PM–3:10PM",
    confirmed: true,
    title: { ko: "AWS 연사 세션", en: "AWS Speaker Session" },
    // TODO: confirm public naming — speaker (한장환 · AWS) is confirmed in the internal
    // deck; verify the public name may be shown before surfacing it in the UI.
    speaker: { ko: "한장환 (AWS)", en: "Han Jang-whan (AWS)" },
    summary: {
      ko: "Amazon의 AI 문제 정의 · 접근 방법론.",
      en: "Amazon's AI problem-definition & approach methodology.",
    },
    description: {
      ko: "AWS 연사 한장환 님이 진행하는 확정 세션입니다. Amazon이 실제로 AI 문제를 어떻게 정의하고, 어떤 방법론으로 접근하는지를 다룹니다. 문제를 ‘어떻게 풀까’ 이전에 ‘무엇을, 왜 푸는가’를 잡는 관점입니다. 순서상 과제가 공개된 바로 다음 시간이라 — 방금 손에 쥔 진짜 문제를 어떤 눈으로 뜯어볼지, 배운 걸 그 자리에서 바로 얹어볼 수 있습니다.",
      en: "A confirmed session led by AWS speaker Han Jang-whan on how Amazon defines AI problems and the methodology it uses to approach them. It's the ‘what and why’ before the ‘how’ — and it comes immediately after the problems are released, so the lens lands on the real brief you're holding rather than on a hypothetical one.",
    },
    location: FOUNDRY_REFINERY,
    locationUrl: FOUNDRY_URL,
  },
  {
    id: "d1-problem-release",
    day: 1,
    date: "08.22",
    category: "main",
    mode: "offline",
    timeOfDay: "PM",
    // 오리엔테이션과 같은 20분 블록입니다 — 문제 공개가 그 블록의 마지막 순서라,
    // 두 카드가 같은 시각을 갖는 게 맞습니다(중복이 아니라 사실).
    time: "2:10PM–2:30PM",
    title: { ko: "문제 공개 · 트랙 선택", en: "Problem Release · Track Selection" },
    summary: {
      ko: "실제 기업의 AX 과제가 공개되고, 트랙을 고르며 8일 빌드 시계가 시작됩니다 (트랙 구성은 확정 전).",
      en: "Real companies' AX problems drop, you pick a track — and the 8-day build clock starts (track line-up not final yet).",
    },
    description: {
      ko: "Day 1은 이 빌더톤의 실질적 킥오프입니다. 가상의 과제가 아니라, 파트너 기업이 지금 겪고 있는 실제 AX(AI 전환) 문제가 트랙별로 공개되고, 참가자는 이 자리에서 자신의 트랙을 고릅니다. 공개는 오리엔테이션의 마지막 순서로 이뤄집니다 — 앞으로 7일이 어떻게 굴러가는지를 듣고 난 직후에 진짜 과제를 받는 흐름이에요. 트랙 구성은 아직 확정 전이며(메인 트랙 2개로 좁혀 논의 중), 확정되는 대로 안내합니다. 바로 다음 순서인 AWS 세션이 이 문제를 어떤 방법론으로 뜯어볼지를 다루고, 이어지는 네트워킹 시간부터는 원하는 팀은 그 자리에서 빌드를 시작해도 됩니다 — 정해진 ‘시작 버튼’을 기다릴 필요 없이 각 팀의 페이스로 데모데이까지 이어집니다. Day 1은 필참이며 The Foundry의 The Refinery 홀(11 Prinsep Link) 현장에서 1PM–4:30PM 진행합니다.",
      en: "Day 1 is the real kick-off. These aren't made-up prompts — they're the actual AX (AI-transformation) problems partner companies are facing right now, released by track, and this is where you choose yours. The release lands as the final item of the orientation block: you hear how the next seven days work, then get the real brief. The track line-up isn't confirmed yet (narrowed to two main tracks, still under discussion) and we'll announce it once settled. The AWS session immediately after gives you a methodology to take the problem apart, and from the networking slot that follows any team can start building on the spot — no start whistle to wait for, each team at its own pace through to Demo Day. Day 1 is mandatory and runs on-site at The Foundry's The Refinery hall, 11 Prinsep Link, 1PM–4:30PM.",
    },
    location: FOUNDRY_REFINERY,
    locationUrl: FOUNDRY_URL,
  },
  // 파트너 인사말. 구성·길이가 아직 조율 중이라 confirmed를 세우지 않습니다 —
  // 시각(2:00–2:10PM)만 진행 순서에 잡혀 있습니다.
  // 개인 실명은 넣지 않습니다: 본인 공개 동의 전이고, 회사명으로 두면 나오는
  // 사람이 바뀌어도 카피가 깨지지 않습니다. 무슨 이야기를 할지도 쓰지 않습니다 —
  // 정해지지 않은 것을 지어내는 자리가 아닙니다.
  {
    id: "d1-hashed-greeting",
    day: 1,
    date: "08.22",
    category: "network",
    mode: "offline",
    timeOfDay: "PM",
    time: "2PM–2:10PM",
    title: { ko: "해시드 파트너 인사말", en: "A word from Hashed" },
    summary: {
      ko: "종합 지원 파트너 해시드의 인사말 — 구성·길이는 조율 중입니다.",
      en: "A greeting from Hashed, our overall supporting partner — shape and length still being arranged.",
    },
    description: {
      ko: "이번 빌더톤을 종합 지원하는 해시드(Hashed)가 참가자에게 건네는 인사말입니다. 구성과 길이는 아직 조율 중이라 정해지는 대로 안내합니다. 해시드는 Day 5 네트워킹 데이의 프로그램도 저희와 함께 기획하고 있어요.",
      en: "A short greeting to the room from Hashed, the builderthon's overall supporting partner. Its shape and length are still being arranged and we'll share them once settled. Hashed is also co-designing the Day 5 Networking Day programme with us.",
    },
    location: FOUNDRY_REFINERY,
    locationUrl: FOUNDRY_URL,
    org: HASHED_ORG,
  },
  // ─── 보류된 Day 1 세션 2개 (2026-08-04) ────────────────────────────────────
  // `d1-problem-deep-dive`(과제 딥다이브 · 조율 중)와 `d1-briefing`(현장 브리핑 &
  // Q&A)은 확정된 진행 순서에 슬롯이 없습니다. 12:40–4:30PM 아홉 줄 어디에도
  // 들어갈 자리가 없어 배열에서 뺐습니다 — 내용은 지우지 않고 아래에 그대로
  // 보존합니다. 부활 여부는 결정되지 않았습니다.
  //
  // 되살릴 때 확인할 것: 두 세션이 다루던 것(과제 배경 딥다이브 / 진행 방식·평가
  // 기준 Q&A) 중 후자의 상당 부분은 이제 오리엔테이션(2:10–2:30PM)이 흡수했습니다.
  // 그대로 복원하면 같은 이야기가 두 카드가 됩니다.
  //
  // {
  //   id: "d1-problem-deep-dive",
  //   day: 1, date: "08.22", category: "main", mode: "offline", timeOfDay: "PM",
  //   confirmed: false,
  //   title: { ko: "과제 딥다이브 (조율 중)", en: "Problem Deep-Dive (TBC)" },
  //   summary: {
  //     ko: "과제를 낸 주최사가 문제의 배경과 맥락을 직접 풀어주는 시간 — 형식 조율 중.",
  //     en: "The companies that set the problems walk through the background and context first-hand — format still being arranged.",
  //   },
  //   description: {
  //     ko: "문제가 공개되고 트랙을 고른 직후, 그 과제를 실제로 낸 주최사(AXMOS) 측이 배경과 맥락을 직접 풀어주는 시간입니다. 왜 이게 현업에서 문제인지, 안에서는 지금 어떻게 처리하고 있는지, 이번 과제의 범위는 어디까지인지 — 문제 설명문만으로는 보이지 않는 부분을 짚고 질문을 받습니다. 이어지는 현장 브리핑 & Q&A가 진행 방식·팀 구성·평가 기준을 다룬다면, 이 시간은 과제 내용 자체를 다룹니다. 참가자 전원이 한자리에 모이는 다음 기회는 Day 5이므로, 맥락을 가장 깊게 가져갈 수 있는 자리이기도 합니다. 진행자와 형식(길이·구성)은 아직 조율 중이며, 확정되는 대로 안내합니다.",
  //     en: "Right after the problems drop and tracks are chosen, the host companies (AXMOS) that actually set them walk through the background and context first-hand: why this is a real problem inside the business, how it's handled today, and where the scope of this brief starts and ends — the parts a written problem statement doesn't show. Questions are taken on the spot. Where the on-site briefing & Q&A that follows covers how the eight days run, this session is about the problem itself. The next time everyone is in one room is Day 5, so this is the deepest context you can carry out of the room. Who runs it and in what format (length, structure) is still being arranged; we'll announce it once settled.",
  //   },
  //   location: FOUNDRY_REFINERY,
  //   locationUrl: FOUNDRY_URL,
  // },
  // {
  //   id: "d1-briefing",
  //   day: 1, date: "08.22", category: "network", mode: "offline", timeOfDay: "PM",
  //   title: { ko: "현장 브리핑 & Q&A", en: "On-site Briefing & Q&A" },
  //   summary: {
  //     ko: "과제 설명과 진행 방식 안내, 그리고 질의응답.",
  //     en: "Walking through the problems, how it runs, and your questions.",
  //   },
  //   description: {
  //     ko: "공개된 과제를 함께 살펴보고, 8일간의 진행 방식·팀 구성·평가 기준을 안내하는 현장 브리핑입니다. 궁금한 점은 그 자리에서 바로 묻고 답을 들을 수 있어, 첫날부터 막힘 없이 출발할 수 있습니다.",
  //     en: "An on-site briefing that walks through the released problems and explains how the eight days work — team formation, schedule and judging. Bring your questions; you'll get answers on the spot so nobody starts the week unsure of how it runs.",
  //   },
  //   location: FOUNDRY_REFINERY,
  //   locationUrl: FOUNDRY_URL,
  // },

  // ─── DAY 2 · Crash Course (08.23) ───────────────────────────────────────────
  {
    id: "d2-crash-course",
    day: 2,
    date: "08.23",
    category: "workshop",
    mode: "online",
    timeOfDay: "AM",
    confirmed: true,
    title: { ko: "크래시코스 · 바이브 코딩 입문", en: "Crash Course · Vibe Coding Intro" },
    // Confirmed instructor. Title from her own LinkedIn headline — "Co-founder &
    // Director & Content R&D Lead at Codepresso". She runs Codepresso's content
    // R&D, which is exactly what this session is, so the credential is worth
    // naming rather than leaving the day to read as a generic vendor workshop.
    speaker: { ko: "김지훈 이사님 (코드프레소)", en: "Jihoon Kim, Director (Codepresso)" },
    // Shown as its own block in the modal — who is actually in the room matters
    // more for this session than for any other, because the Crash Course is the
    // one thing a non-developer is nervous about. Facts from his own LinkedIn.
    // Photo supplied by him (CI/김지훈.jpeg) — not lifted from LinkedIn.
    speakerProfile: {
      name: { ko: "김지훈", en: "Jihoon Kim" },
      role: { ko: "코드프레소 이사", en: "Director, Codepresso" },
      img: "/partners/people/kim-ji-hoon.jpg",
      bio: {
        ko: "추천 시스템 · 스마트팩토리 데이터 7년+. 前 스마일게이트 · LG CNS. 서강대 물리학.",
        en: "7+ yrs on recommender systems and smart-factory data. Ex-Smilegate · LG CNS. Physics, Sogang University.",
      },
      linkedin: "https://www.linkedin.com/in/jihoon-kim-613878134",
    },
    summary: {
      ko: "집중 5–6시간의 바이브 코딩 입문 — 비개발자도 OK · 코드프레소 김지훈 이사님 진행.",
      en: "A focused 5–6h vibe-coding intro — non-developers welcome · led by Jihoon Kim of Codepresso.",
    },
    description: {
      ko: "참가자의 약 60%가 바이브 코딩이 처음입니다. 그래서 여러 번에 나누지 않고, 하루에 몰아서 끝내는 집중 5–6시간의 크래시코스로 모두의 출발선을 맞춥니다. 슬라이드 강의가 아니라, 간단한 툴 하나를 바이브 코딩으로 처음부터 만드는 라이브 빌드를 따라가는 방식입니다 — AI 도구로 아이디어를 작동하는 프로토타입으로 바꾸는 기본기를 그대로 몸에 익혀, 기술 장벽이 아니라 아이디어가 한계가 되도록 합니다. 강의는 Codex를 기준으로 진행해요 — 모두가 같은 화면을 보며 따라 하기 위해서지, 도구를 정해주려는 게 아닙니다. 배우는 건 특정 툴이 아니라 AI로 만드는 방식이라, 이후 팀 빌드와 데모데이 결과물은 Claude Code든 커서든 손에 맞는 도구로 만들면 됩니다. 비개발자도 따라올 수 있게 설계되었고, 이 크래시코스 전 시간을 참석하면 Zero100 명의의 수료증이 발급되어 Day 8 시상 때 배부됩니다. 크래시코스는 코드프레소가 주관하며, 코드프레소의 김지훈 이사님이 직접 진행합니다.",
      en: "About 60% of participants are trying vibe coding for the first time — so instead of spreading it out, one concentrated 5–6 hour Crash Course levels the start line in a single day. It isn't a slide deck: the session is a live build of one simple tool from scratch, vibe-coded, with the room following along — you pick up the fundamentals of turning ideas into working prototypes with AI tools by doing them, so your ideas rather than the tooling are the limit. The class runs on Codex, so everyone follows the same screen — it isn't the tool being prescribed. What you take away is the method rather than the tool, so your own team build and Demo Day work can run on Claude Code, Cursor or whatever fits your hand. It's built so non-developers can keep up, and attending the full Crash Course earns a certificate issued by Zero100, handed out at the Day 8 awards. The Crash Course is run by Codepresso and led in person by Jihoon Kim, a Director there.",
    },
    location: ONLINE,
    org: CODEPRESSO_ORG,
    opportunities: [
      {
        ko: "코딩 경험이 없어도 첫 작동하는 프로토타입을 직접 만들어 보기",
        en: "Ship your first working prototype, even with zero coding background.",
      },
      {
        ko: "AI 바이브 코딩 워크플로를 핸즈온으로 체득",
        en: "Pick up an AI vibe-coding workflow hands-on, not just in theory.",
      },
      {
        ko: "크래시코스 전 시간 참석 시 Zero100 명의 수료증 (Day 8 배부)",
        en: "Attend the full Crash Course and get a Zero100-issued certificate (handed out on Day 8).",
      },
    ],
  },
  // Day 2 is the Crash Course and nothing else.
  //
  // Two slots have been removed from this day. The per-track LIVE BRIEFING by the
  // client contacts went first (how the company contacts would run it was never
  // worked out); the problems still drop on Day 1. (The deep-dive that used to
  // walk through them moved to Day 1 as `d1-problem-deep-dive` and is now
  // shelved there — the confirmed Day-1 run-of-show has no slot for it.)
  // TEAM BUILDING
  // followed: teams are matched from registration (AI-type test) and grouped
  // on-site on Day 1, so a separate Day-2 slot was describing a step that had
  // already happened. Nothing downstream depends on it — the FAQ solo answer
  // points at registration + Day 1, not at this day.
  // Do not re-add a briefing slot here: Day 1 is where the problem work happens.

  // ─── DAY 3 · Self-paced build · Mentoring (08.24) ─────────────────────────────────
  {
    id: "d3-self-build",
    day: 3,
    date: "08.24",
    category: "build",
    selfPaced: true,
    mode: "online",
    timeOfDay: "AM",
    title: { ko: "자율 빌드", en: "Self-paced build" },
    summary: {
      ko: "팀 단위로 방향을 정하고 문제 해결에 착수합니다.",
      en: "Teams set direction and start solving the problem.",
    },
    description: {
      ko: "팀이 스스로 방향을 설정하고 문제 해결에 착수하는 자율 빌드 시간입니다. 공개된 AX 과제를 어떻게 풀지 정하고, 첫 구현으로 들어갑니다. 정해진 시간도, 접속해야 할 곳도 없습니다 — 운영진이 여는 세션이 아니라 팀이 각자 편한 때에 진행하는 시간입니다.",
      en: "Self-paced build time where teams set their own direction and start solving the problem — deciding how to tackle the released AX problem and moving into a first implementation. There is no set time and nothing to join: this is team-led time you take whenever suits you, not a hosted session.",
    },
    location: ONLINE,
  },
  // REMOVED (2026-08-03): "OpenAI Codex 워크샵 (조율 중)" — d3-codex-workshop.
  // It never got past "조율 중" with OpenAI, and a TBC session on an otherwise
  // self-paced day made Day 3 look scheduled when it isn't. Day 3 now reads
  // exactly like Day 4: one optional 1:1 slot, the rest is the team's own time.
  // Its partner constant (OPENAI_ORG) went with it. Do not restore either until
  // there is an actual agreement — this is the second TBC session pulled from
  // the schedule this week, for the same reason (see the Day 5 block).
  {
    id: "d3-mentoring",
    day: 3,
    date: "08.24",
    category: "mentoring",
    mode: "mixed",
    timeOfDay: "PM",
    title: { ko: "1:1 멘토링 (온라인 기본)", en: "1:1 Mentoring (online by default)" },
    summary: {
      ko: "막힌 지점을 점검하고 방향을 조정하는 1:1 — 온라인이 기본이고, 멘토에 따라 한인회관 대면.",
      en: "One-on-one to unblock and adjust direction — online by default, in person at the Korean Association hall with some mentors.",
    },
    description: {
      ko: "멘토링 1단계(기초)로, 정해진 시간표 대신 팀의 필요에 맞춰 진행되는 1:1 멘토링입니다. 진행 방식은 멘토별로 정해집니다 — 온라인이 기본이고, 멘토에 따라 싱가포르 한인회관(탄종파가) 대면(F2F)으로 진행될 수 있으니 배정된 멘토와 직접 맞추시면 됩니다. 막힌 지점을 함께 점검하고 방향을 조정합니다. 멘토는 ‘정답을 주는 심사자’가 아니라 한때 우리와 같았던 유학생 출신 현직 대표 — 같은 눈높이에서 함께 고민하는 선배입니다. 학생 정체성과 giver 문화를 지키는 이 멘토 persona가 이 시간의 핵심입니다. 확정 멘토로 기업 멘토 2곳(Onword Lab · REmited)과 현직 시니어 9인이 함께합니다 — 전체 명단은 멘토링 섹션을 참고하세요. 멘토는 지정이 아니라 가능 시간이 겹치는 구간으로 배정됩니다. Day 5–7에는 팝업스튜디오 FDE의 실전 멘토링이 2단계로 이어집니다.",
      en: "Stage one of mentoring — the foundational round, following each team's needs rather than a fixed timetable. The format is set mentor by mentor — online by default, though some mentors take theirs in person (F2F) at the Korean Association hall in Tanjong Pagar, so you'll settle it with the mentor you're matched with. It's time to check blockers and adjust direction. Mentors aren't answer-giving judges; they're Korean ex-international-student founders who were once in your shoes, thinking alongside you at eye level. That peer-mentor persona — protecting the student identity and giver culture — is the point of this time. The confirmed line-up is two company mentors (Onword Lab · REmited) plus nine working seniors — see the mentoring section for the full roster. Mentors are assigned by overlapping availability, not by request. Stage two — Popup Studio's FDE mentoring — follows on Day 5–7.",
    },
    location: MENTORING_MODE,
    // TODO: confirm public naming — the confirmed individual mentors (김종현·황영준·
    // 이유택·신동혁·이화영·임석건·이동훈·황현진·정요천) are from the internal deck; verify
    // their names may be shown publicly before surfacing. Full roster lives in
    // dict.mentoring.mentors.
    // The count is every individually named 1:1 mentor — NOT everyone in that grid:
    // 한장환 (Day 1 speaker) and 김지훈 (Day 2 크래시코스) run sessions, not 1:1s, so
    // they are outside it. 한장환 was in the count until his pending Day 7 was
    // dropped; if a mentoring day is added back for him, the number moves too.
    // 이동훈·황현진·정요천 joined the Day 7 career session (all three also judge on
    // Day 8), and 김종현 the Day 3·4 round — hence 9인 / "nine" above.
  },

  // ─── DAY 4 · Self-paced build · Mentoring (08.25) ─────────────────────────────────
  {
    id: "d4-self-build",
    day: 4,
    date: "08.25",
    category: "build",
    selfPaced: true,
    mode: "online",
    timeOfDay: "AM",
    title: { ko: "자율 빌드", en: "Self-paced build" },
    summary: {
      ko: "프로토타입을 빌드하고 완성도를 높입니다.",
      en: "Build the prototype and raise its completeness.",
    },
    description: {
      ko: "전날 잡은 방향 위에서 프로토타입을 실제로 빌드하고 완성도를 끌어올리는 자율 빌드 시간입니다. 핵심 흐름이 작동하게 만들고, 부족한 부분을 채워가며 데모데이를 향한 토대를 다집니다. 정해진 시간도, 접속해야 할 곳도 없습니다.",
      en: "Self-paced build time to actually build the prototype and raise its completeness on top of the direction set the day before — getting the core flow working and filling the gaps that lay the foundation toward Demo Day. There is no set time and nothing to join.",
    },
    location: ONLINE,
  },
  {
    id: "d4-mentoring",
    day: 4,
    date: "08.25",
    category: "mentoring",
    mode: "mixed",
    timeOfDay: "PM",
    title: { ko: "1:1 멘토링 (온라인 기본)", en: "1:1 Mentoring (online by default)" },
    summary: {
      ko: "프로토타입을 점검하고 진전을 함께 보는 1:1 — 온라인이 기본이고, 멘토에 따라 한인회관 대면.",
      en: "One-on-one prototype review and progress — online by default, in person at the Korean Association hall with some mentors.",
    },
    description: {
      ko: "멘토링 1단계(기초)의 마무리로, 팀이 만든 프로토타입을 함께 점검하고 진전을 살피는 1:1 멘토링입니다. Day 3과 마찬가지로 온라인이 기본이되 진행 방식은 멘토별로 정해지며(멘토에 따라 한인회관 대면 가능), 무엇이 잘 되고 있는지, 어디를 더 밀어야 하는지를 같은 눈높이의 선배 멘토와 짚어봅니다. 멘토는 유학생 출신 현직 대표로, 학생 교류와 giver 문화를 지키는 역할입니다(확정 멘토진은 Day 3과 동일). 멘토는 지정이 아니라 가능 시간이 겹치는 구간으로 배정됩니다.",
      en: "The close of stage one — one-on-one mentoring to review the prototype your team built and look at progress together. As on Day 3 it's online by default, with the format set by each mentor (in person at the Korean Association hall is possible) — what's working, and where to push harder, with peer-level senior mentors. Mentors are Korean ex-international-student founders, there to keep the student exchange and giver culture alive (same confirmed line-up as Day 3). Mentors are assigned by overlapping availability, not by request.",
    },
    location: MENTORING_MODE,
  },

  // ─── DAY 5 · Networking Day (08.26 · OFFLINE · *SCAPE) ───────────────────────
  // WHY THIS DAY HOLDS ONE PLACEHOLDER AND NOTHING ELSE (2026-08-03):
  // feedback settled that Day 5's job is NOT to serve the technical needs of the
  // cohort but to get students meeting each other, so the day was re-pointed at
  // student-to-student networking. Every on-site session that was written for
  // the old frame was deleted with that decision — the mid-point check-in,
  // the student AI Use Case showcase + QR vote, the ‘유학생에서 창업가로’ panel,
  // the cross-track exchange and the Quickathon side quest. The replacement
  // programme is being designed WITH HASHED and none of it is agreed yet, so a
  // single honest "기획 중" entry stands where five half-committed ones did.
  // Do not restore any of them, and do not set `confirmed` here, until the joint
  // programme actually exists. The FDE office hour below stays: it is the
  // separate ONLINE Day 5–7 track, not part of this day's on-site programme.
  {
    id: "d5-networking-day",
    day: 5,
    date: "08.26",
    category: "network",
    mode: "offline",
    // AM은 이제 자리표시자가 아니라 사실입니다 — *SCAPE 대관이 10AM–2PM으로
    // 확정됐고(2026-08-03), 그 창은 days[4].hours가 갖습니다. 시간이 미정이던
    // 동안 모달 칩을 덮어쓰던 dayLabel은 그래서 제거했습니다: 기본 형식
    // ("Day 5 · 08.26 · AM")이 이제 맞는 말입니다.
    timeOfDay: "AM",
    title: { ko: "네트워킹 데이 (기획 중)", en: "Networking Day (in planning)" },
    summary: {
      ko: "*SCAPE 현장 · 전원이 처음으로 한자리에 모이는 날 — 학생 간 네트워킹에 초점을 맞춘 프로그램을 해시드(Hashed)와 함께 기획하고 있습니다. 확정되는 대로 공개해요.",
      en: "On-site at *SCAPE · the first day the whole cohort is in one room — we're designing a programme built around student-to-student networking together with Hashed. We'll share it as soon as it's settled.",
    },
    description: {
      ko: "온라인으로 이어지던 8일 중, 전원이 처음으로 *SCAPE L^IFE Jungle에 모이는 날입니다(10AM–2PM). 이날의 목적은 세션을 채우는 게 아니라 사람을 만나는 것 — 화면 너머로만 함께 빌드하던 동료를 직접 만나고, 다른 트랙에서 같은 8일을 풀고 있는 팀들과 섞이는 자리입니다. 시간과 장소는 확정됐고, 세부 프로그램은 학생 간 네트워킹에 초점을 맞춰 해시드(Hashed)와 함께 설계하는 중입니다 — 정해지는 대로 이 페이지에 올립니다. 참여는 선택이에요(필참은 Day 1·8뿐). 같은 기간 열리는 팝업스튜디오 FDE 온라인 오피스아워는 별개 트랙이라, 빌드를 점검받고 싶은 팀은 따로 드롭인하면 됩니다.",
      en: "The first day everyone gathers in person at *SCAPE L^IFE Jungle after a week that ran online, 10AM–2PM. The point of the day isn't to fill a timetable — it's to meet people: the teammates you'd only built alongside on-screen, and the teams working the same eight days in another track. The time and the venue are set; what we're still designing, together with Hashed, is the programme itself — built around student-to-student networking, and posted here once it's settled. Attending is your choice (only Day 1 and Day 8 are required). Popup Studio's online FDE office hours run over the same stretch but are a separate track — drop in there if your team wants a read on the build.",
    },
    location: ONSITE,
    org: HASHED_ORG,
  },
  // Stage-2 mentoring, one entry per day (see FDE_OFFICE_HOUR above).
  { ...FDE_OFFICE_HOUR, id: "d5-fde-office-hour", day: 5, date: "08.26" },

  // ─── DAY 6 · Self-paced build (08.27) ─────────────────────────────────────────────
  {
    id: "d6-open-build",
    day: 6,
    date: "08.27",
    category: "build",
    selfPaced: true,
    mode: "online",
    timeOfDay: "AM",
    title: { ko: "자율 빌드", en: "Self-paced build" },
    summary: {
      ko: "정해진 세션이 없는 날 — 팀별로 편한 시간에 빌드를 이어갑니다.",
      en: "No scheduled sessions — teams keep building whenever suits them.",
    },
    description: {
      ko: "정해진 세션이 하나도 없는 자율 빌드 데이입니다. 출석 개념이 없고 접속해야 할 곳도 없습니다 — 각 팀이 편한 시간·장소에서 자기 페이스로 프로덕트를 완성해 갑니다. 하루 종일 붙어 있어야 한다는 뜻이 아니라, 하루를 팀이 원하는 대로 쓸 수 있다는 뜻입니다. Day 5–7에는 팝업스튜디오 FDE의 온라인 오피스아워가 열려 있어, 필요한 팀은 문제 정의·워크플로·구현 방향을 점검받을 수 있습니다(시간대는 추후 안내).",
      en: "An open build day with no scheduled sessions at all. There's no attendance and nothing to join — each team pushes its product toward completion at its own pace, whenever and wherever suits them. It doesn't mean being glued to it all day; it means the day is yours to use as the team wants. Popup Studio's FDE office hours run online across Day 5–7, so any team that wants a check on its problem definition, workflow or implementation direction can take one (times to be announced).",
    },
    location: ONLINE,
  },
  // Stage-2 mentoring, one entry per day (see FDE_OFFICE_HOUR above).
  { ...FDE_OFFICE_HOUR, id: "d6-fde-office-hour", day: 6, date: "08.27" },

  // ─── DAY 7 · Final Rehearsal (08.28 · OFFLINE · AWS office) ──────────────────
  {
    id: "d7-final-rehearsal",
    day: 7,
    date: "08.28",
    category: "main",
    mode: "offline",
    timeOfDay: "AM",
    time: "9:10AM–11:30AM",
    // 제목을 "파이널 리허설 (현장)"에서 바꿨습니다 (2026-08-04). 확정된 내용은
    // 멘토와 함께하는 최종 점검이고, "리허설"은 무대에 서보는 것으로 읽힙니다 —
    // 무대 리허설은 확정된 순서가 아닙니다. 하지 않을 일을 제목으로 약속하지 않게
    // 실제로 하는 일로 바꿨고, 진행 순서의 줄 이름과도 같은 말이 됩니다.
    // 날짜 테마(days[6].theme "파이널 리허설")는 그대로 둡니다 — 그건 하루 전체의
    // 성격이고 노선도 키워드가 여기서 파생됩니다.
    //
    // SPEAKER 필드를 지웠습니다: `박희덕`으로 돼 있었는데 그분은 같은 날 오후
    // 커리어 간담회(d7-speaker-session) 연사입니다. 이 시간은 특정 연사가 아니라
    // 멘토진이 진행합니다 — Day 1 오리엔테이션과 같은 종류의 복사 오염이었습니다.
    title: { ko: "최종 점검 멘토링 (현장)", en: "Final-check Mentoring (on-site)" },
    summary: {
      ko: "이미 만든 것을 3분 발표와 Q&A 안에서 증명하도록 — 멘토와 함께하는 마지막 점검.",
      en: "Making what you already built stand up in a 3-minute pitch and the Q&A — the last check, with mentors.",
    },
    description: {
      ko: "Day 7은 사전 제출물 마감 당일이라, 새 기능을 붙이거나 방향을 크게 바꾸는 날이 아닙니다. 남은 일은 이미 만든 결과를 3분 발표와 이어지는 Q&A 안에서 명확히 증명하는 것 — 그래서 이 시간은 만드는 자리가 아니라 잃지 않는 자리입니다. 멘토와 함께 세 가지를 점검합니다. ① 3분 발표 구조 — 병목 → 근거 → 데모 → 위험과 대응의 흐름이 서 있는지, 베이스라인 비교 자료가 필요한 자리에 놓였는지. ② 심사 질문 사전 리허설 — “담당자가 그냥 범용 LLM에 물어봐서 얻는 답과, 이건 뭐가 다르죠?”, “어떤 판단을 AI에 맡겼나요?”, “이 솔루션의 효과를 어떻게 증명할 수 있나요?” 같은 질문에 자기 언어로 답할 수 있는지. ③ 사전 제출물 최종 점검 — 오늘 저녁 마감되는 그 네 가지가 다 완성됐는지 함께 확인합니다(무엇을 내는지는 이 날 카드의 제출물 안내를 보세요). AWS 오피스에서 열리며, Day 5에 이은 두 번째 현장 집결입니다. 팝업스튜디오 FDE의 온라인 오피스아워도 오늘까지 이어집니다.",
      en: "Day 7 is the submission deadline, so it isn't a day for new features or a change of direction. What's left is proving what you already built — making it stand up inside a 3-minute pitch and the Q&A that follows — so this session is about not losing points rather than earning new ones. Three things get checked with a mentor. ① The 3-minute pitch structure — does bottleneck → evidence → demo → risk-and-response hold up, and is the baseline comparison where it needs to be. ② A dry run of the judges' questions — “how is this different from what the problem owner would get by just asking a general LLM?”, “which judgements did you hand to the AI?”, “how would you prove this actually helps?” — can you answer them in your own words. ③ A final pass over the submission package due this evening: all four pieces finished (what they are is in this day's submission box). It runs at the AWS office, the second in-person gathering after Day 5, and Popup Studio's online FDE office hours run through today too.",
    },
    location: AWS_OFFICE,
  },
  {
    id: "d7-speaker-session",
    day: 7,
    date: "08.28",
    category: "network",
    mode: "offline",
    timeOfDay: "PM",
    time: "12:30PM–2PM",
    // TODO: confirm public naming — speaker (박희덕) from the internal deck.
    speaker: { ko: "박희덕", en: "Park Hee-deok" },
    title: { ko: "커리어 간담회 · ‘FDE로 일한다는 것’", en: "Career Session · “Working as an FDE”" },
    // 시각은 `time`이 갖습니다 — 요약과 설명 앞머리에 박혀 있던 "12:30–14:00"을
    // 뺐습니다. 같은 정보가 세 군데 있으면 하나가 바뀔 때 나머지가 어긋납니다.
    summary: {
      ko: "박희덕 대표님의 ‘FDE로 일한다는 것’ — FDE 사업에 관심 있는 학생·졸업생 대상.",
      en: "Park Hee-deok on “Working as an FDE” — for students & grads interested in the FDE business.",
    },
    description: {
      ko: "파이널 리허설 일정의 마무리로 마련된 커리어 간담회입니다. 트랜스링크 인베스트먼트의 박희덕 대표님이 ‘FDE로 일한다는 것’을 주제로, 자사 FDE 사업에 관심 있는 학생·졸업생에게 어떤 일을 하는 자리인지, 어떤 사람을 찾는지를 직접 이야기하며, 인턴·채용 pool로 이어지는 실질적 연결의 시간입니다. 간담회 후속 1:1 면담·멘토링(희망자)은 8/29 행사 종료(3PM) 후 현장 또는 널담에서 진행됩니다.",
      en: "A career session closing out the final-rehearsal day. Under the theme “Working as an FDE,” Park Hee-deok (CEO · General Partner, Translink Investment) talks directly with students and graduates interested in the firm's FDE business — what the work actually is and who they're looking for — a genuine connection into the internship and hiring pool. Follow-up 1:1 conversations and mentoring (for those who want them) run after the event closes on 29 Aug (3PM), either on-site or at Nuldam.",
    },
    location: AWS_OFFICE,
  },
  // Stage-2 mentoring, one entry per day (see FDE_OFFICE_HOUR above).
  { ...FDE_OFFICE_HOUR, id: "d7-fde-office-hour", day: 7, date: "08.28" },

  // ─── DAY 8 · Demo Day · Final Pitch (08.29 · OFFLINE) ────────────────────────
  {
    // ⚠️ id가 "d8-OPENING-keynote"지만 더 이상 여는 순서가 아닙니다 — 확정된 진행
    // 순서에서 이 키노트는 두 트랙 발표가 모두 끝난 뒤(1:50PM), 시상 직전에
    // 놓입니다. id는 다른 곳에서 참조될 수 있어 그대로 두었으니, 위치를 id로
    // 짐작하지 마세요.
    // 제목도 "데모데이 키노트"에서 "클로징 키노트"로 바꿨습니다: 행사의 대표
    // 강연이라는 무게는 유지하되, 여는 강연이라는 잘못된 위치를 지웠습니다.
    id: "d8-opening-keynote",
    day: 8,
    date: "08.29",
    category: "main",
    mode: "offline",
    timeOfDay: "PM",
    time: "1:50PM–2:30PM",
    confirmed: true,
    title: { ko: "클로징 키노트 · 박희덕", en: "Closing Keynote · Park Hee-deok" },
    // TODO: confirm — speaker name is from the internal deck; confirm public naming is OK.
    speaker: { ko: "박희덕", en: "Park Hee-deok" },
    summary: {
      ko: "모든 발표가 끝난 뒤, 시상 직전 40분 — ‘제로백의 진짜 의미’.",
      en: "After every pitch, 40 minutes before the awards — ‘The Real Meaning of Zero100’.",
    },
    description: {
      ko: "두 트랙의 발표가 모두 끝나고 시상을 앞둔 40분, 트랜스링크 인베스트먼트의 박희덕 대표님이 ‘제로백의 진짜 의미’를 주제로 이야기합니다. 창업가가 0에서 100으로 가기 위한 핵심 요소 — 협업·가치·실행·글로벌 스탠다드의 중요성과 협업의 힘, 그리고 왜 지금, 왜 싱가포르의 한인 학생인지. 8일을 막 끝낸 사람들에게, 오늘이 끝이 아니라 어디의 시작인지를 짚어주는 자리입니다.",
      en: "With both tracks done pitching and the awards still ahead, Park Hee-deok (CEO · General Partner, Translink Investment) takes 40 minutes on ‘The Real Meaning of Zero100’ — what actually carries a founder from zero to a hundred: collaboration, value, execution, global standards, and why now, why Korean students in Singapore. Spoken to people who have just finished the eight days, about what today is the start of rather than the end of.",
    },
    location: ONSITE,
  },
  {
    id: "d8-judging",
    day: 8,
    date: "08.29",
    category: "main",
    mode: "offline",
    timeOfDay: "PM",
    time: "11:10AM–1:50PM",
    title: { ko: "데모데이 발표 · 심사", en: "Demo-Day Pitches · Judging" },
    // 발표 길이가 "팀당 5분"에서 "팀당 8분 = 발표 3분 + Q&A 포함 심사 5분"으로
    // 정정됐습니다 (2026-08-04 확정). 참가자가 5분짜리 발표를 준비해 오면 현장에서
    // 그대로 사고가 나는 종류의 숫자라, 이 값이 나오는 모든 곳을 함께 고쳤습니다.
    summary: {
      ko: "문제를 낸 기업과 심사위원 앞에서 팀당 8분 — 발표 3분 + Q&A 포함 심사 5분.",
      en: "Eight minutes per team in front of the company that set the problem and the judges — a 3-minute pitch, then 5 minutes of judging with Q&A.",
    },
    description: {
      ko: "8일의 마지막이자, 문제를 낸 기업과 심사위원 앞에서 ‘내 아이디어가 돌아간다’를 검증받는 자리입니다. 같은 공간에서 트랙별로 순차 진행하며, 팀당 8분입니다 — 발표 3분에 이어 Q&A를 포함한 심사 5분(트랙마다 약 1시간 20분). 발표 순서는 이날 아침 오픈 카톡방으로 미리 공지되니, 자기 차례를 미리 알고 오시면 됩니다. 자기 트랙 발표에는 참석하시고, 그 외 시간은 자유롭게 쓰셔도 됩니다 — 남아서 다른 트랙을 봐도 좋고, 자리를 지킬 의무는 없어요. 심사는 실제 산업에서 문제를 풀어온 현업 리더들이 맡습니다(문제 발의는 AXMOS). Day 3·4 기초 멘토링은 심사에 참여하지 않는 선배들이 맡아, 학생 눈높이의 멘토 문화를 지킵니다.",
      en: "The end of the eight days, and the moment your idea gets validated in front of the company that set the problem and the judges. Tracks run in sequence in one space, eight minutes per team: a 3-minute pitch, then 5 minutes of judging including Q&A (about an hour and twenty minutes per track). The running order goes out in the open chat that morning, so you'll know your slot before you arrive. Attend your own track's pitches; the rest of the time is yours — stay and watch another track if you like, but you're not required to sit through it. Judging is done by working leaders who have solved real problems in industry (problem-setting by AXMOS). The Day 3·4 foundational mentoring is handled by seniors who take no part in judging, which is what keeps the peer-level mentor culture intact.",
    },
    location: ONSITE,
  },
  {
    id: "d8-final-pitch",
    day: 8,
    date: "08.29",
    category: "main",
    mode: "offline",
    timeOfDay: "PM",
    time: "2:30PM–3PM",
    title: { ko: "결과 발표 · 시상", en: "Results · Awards" },
    summary: {
      ko: "수상자 발표 · 사진 → 앞으로의 안내 → 수료증과 함께 단체 사진.",
      en: "Awards and photos → what comes next → a group photo with your certificate.",
    },
    description: {
      ko: "8일간의 빌드를 마무리하는 30분입니다. 두 트랙 발표와 박희덕 대표님의 이야기가 끝나면 수상자 발표와 사진 촬영이 이어지고(2:30~), 이어서 앞으로 무엇이 남아 있는지를 짧게 안내합니다(2:45~). 마지막 2:50에는 수료증을 손에 들고 다 함께 단체 사진을 찍으며 끝납니다 — 수료증은 크래시코스 전 시간을 참석한 분들께 드립니다. 전원이 *SCAPE L^IFE Jungle 현장에 모여, ‘데모로 끝나지 않는 성공의 경험’으로 8일을 함께 마칩니다.",
      en: "Thirty minutes to close out eight days of building. Once both tracks have pitched and Park Hee-deok has spoken, the awards are announced with photos (from 2:30), followed by a short word on what comes next (from 2:45). At 2:50 everyone gathers for a group photo, certificate in hand — the certificate goes to everyone who attended the full Crash Course. The whole cohort is at *SCAPE L^IFE Jungle to finish the eight days on a success that goes beyond a demo.",
    },
    location: ONSITE,
  },
];
