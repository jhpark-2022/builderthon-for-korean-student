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
//   • Day 8 — the Showcase at *SCAPE L^IFE Jungle (11AM–3PM). MANDATORY (필참).
//   • Self-paced team build runs continuously from the Day-1 problem release all
//     the way to the Day-8 pitch. In person on Days 1 / 5 / 7 / 8.
// ─────────────────────────────────────────────────────────────────────────────

export type Category =
  | "main" // ★ anchor track: opening · problem release · keynote · the showcase
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
  // 연사가 다니는 회사의 로고. 지금은 사전 세션 밴드(PreEventBand) 하나만 씁니다.
  //
  // `org`와 절대 헷갈리지 마세요. org는 "이 세션을 주관하는 파트너사"라는 뜻이고,
  // 모달에 소개 문단과 바깥 링크까지 함께 렌더됩니다. 이 필드는 그냥 연사의 소속
  // 표시입니다 — 마이크로소프트는 이 행사의 파트너가 아니라 연사가 다니는 회사라,
  // org 자리에 세우면 사이트가 하지 않은 약속을 하게 됩니다.
  //
  // 파일은 white/trimmed 규격(흰색 모노 · 투명 배경)이어야 합니다.
  speakerLogo?: { src: string; alt: string };
  // Optional: concrete opportunities a student gets from attending. Honest —
  // describes the value of the session, not guaranteed outcomes.
  opportunities?: Bilingual[];
  // 멘토링 시간에 멘토와 함께 짚는 것들. 세션 소개(description)가 "이게 무슨
  // 시간인지"를 말한다면, 이 배열은 "무엇을 보는지"를 말한다.
  // Day 3–6(근거를 만드는 시간)과 Day 7(만든 것을 잃지 않는 시간)이 서로 다른
  // 목록을 쓴다 — 두 구간의 할 일이 다르기 때문이다. 아래 공용 상수를 참조만
  // 하고 카드마다 문장을 복사하지 마라(같은 문장을 두 곳에서 관리하면 반드시
  // 갈라진다).
  checkpoints?: Bilingual[];
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
  // Day 6도 2026-08-09부터 같습니다(멘토링 Day 3–7 상시화). 자율 빌드는 어디서나
  // 할 수 있는 일이라 정거장에 내려설 이유가 못 됩니다.
  stopLabel?: Bilingual;
  // "pending" = meant to be on-site but venue isn't locked (Zoom fallback).
  // "mixed"   = both halves in the same day and neither badge alone is honest.
  //             NO DAY USES THIS RIGHT NOW: Day 3·4 held it while their 1:1
  //             mentoring defaulted to in-person. That default flipped to
  //             online, so both days are plain "online" again. Kept because the
  //             badge still renders (Journey.tsx) and the next partly-on-site day
  //             will want it.
  // "online-default" = online unless a specific mentor offers otherwise. Day 3·4
  //             (2026-08-08): plain "online" was reading as a promise that the
  //             day is entirely online, and some mentors do take their 1:1 in
  //             person at the Korean Association hall. NOT "mixed" — "mixed" is a
  //             day with an on-site half for EVERYONE, which would send people
  //             planning a trip they probably don't need. The badge says only
  //             "온라인 기본"; WHO gets F2F and WHERE stays on the 1:1 session
  //             card (mode "mixed") and its modal 장소 row (MENTORING_MODE),
  //             which is the one place that can carry the condition in full.
  dayMode: "online" | "offline" | "pending" | "mixed" | "online-default";
  // 노선도의 현장 마커. 원래 이 자리에는 지도 핀 아이콘이 있었는데, 핀은 "현장"
  // 하나만 말합니다 — 그건 바로 아래 카드의 뱃지가 이미 하는 말이고, 정작 궁금한
  // 것은 "어디로 가야 하나"입니다. 그래서 핀 대신 그날의 장소 로고를 세웁니다.
  //
  // dayMode가 "offline"인 날에만 렌더됩니다. 로고가 없으면 마커도 없습니다 —
  // 자리를 채우려고 아무 마크나 넣지 마세요. "pending"(장소 미확정)에 이걸 다는
  // 것도 안 됩니다: 마커는 "여기로 오세요"라는 약속입니다.
  //
  // 파일은 파트너 월과 같은 규격이어야 합니다(흰색 모노 · 투명 배경 ·
  // white/trimmed). 어두운 배경 위에서 다른 로고와 같은 무게로 읽히는 것은 그
  // 규격뿐이고, 브랜드 원색 마크를 그대로 넣으면 노선도에서 그 하나만 튑니다.
  // 마커 박스는 h-4 × w-14이고 object-contain이라 가로로 긴 워드마크도 잘리지
  // 않습니다.
  venueLogo?: { src: string; name: string };
  mandatory?: boolean; // 필참 — required attendance (Day 1 & Day 8)
  // 노선도에서 이 정거장을 한 단계 크게 그립니다. 필참(★·rose)과는 다른 층입니다 —
  // "와야 하는 날"이 아니라 "놓치면 아까운 날"이라 색도 글리프도 다르게 씁니다.
  //
  // 2026-08-10, 카드에도 배지가 생겼습니다. 원래 이 자리에는 "배지는 붙이지
  // 않습니다 — 필참 배지와 비슷한 무엇이든 달면 의무로 읽힙니다"라고 적혀
  // 있었습니다. 그 우려로 카드를 필참/선택 2층으로 두었더니 반대쪽 값이 더
  // 컸습니다: 노선도는 Day 5·7을 ◉로 강조하는데 카드에서는 나머지 선택일과
  // 똑같이 보여, 같은 사실을 두 표면이 다르게 말했습니다.
  //
  // 우려 자체는 유효해서, 배지를 다는 대신 두 가지를 같이 넣었습니다.
  //  · 색과 글리프를 필참과 확실히 갈랐습니다(violet ◉ vs rose ★). 노선도 노드·
  //    범례 스와치와 같은 모양이라, 카드의 배지는 새 뜻이 아니라 이미 배운 뜻입니다.
  //  · 데이 모달에는 "선택 참여"를 글자로 박았습니다(dict.program.optionalAttendance).
  //    배지가 무게를 실어 주더라도, 필참이 아니라는 사실은 말로 남습니다.
  // 배지에 의무를 암시하는 낱말을 쓰지 마세요 — 그것이 원래 우려의 핵심입니다.
  //
  // 지금은 Day 5(네트워킹)와 Day 7(파이널 리허설) 둘입니다 — 선택 여섯 중 둘.
  // 셋째를 만들지 마세요: 선택일의 절반이 크게 그려지는 순간 큰 점이 기본값이 되고,
  // 작은 점이 "덜 중요한 날"이라는 뜻으로 뒤집힙니다(그건 dict.program.route의
  // optionalValue가 정면으로 부정하는 주장입니다).
  //
  // 이 층에 들어오는 기준: 현장(dayMode: "offline")이면서, 그날 벌어지는 일이
  // 혼자서는 대체 불가능할 것. Day 5는 학생끼리 섞이는 하루, Day 7은 무대 전날
  // 현업 앞에서 받아보는 리허설 — 둘 다 자율 빌드로는 못 얻습니다.
  // 범례(dict.program.route.legendSpotlight)는 이 둘을 다 덮는 말이어야 합니다.
  spotlight?: boolean;
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
  // Day 8 only: turns on the thematic-awards box in the day modal, the same
  // shape as Day 7's deliverable box. Copy lives in dict.program.awards — this
  // is a switch, not content. The four categories are described THERE and
  // nowhere else in the programme: the d8-final-pitch description used to list
  // them inline and it buried the run of show under a paragraph.
  awardsBox?: boolean;
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

// 노선도 현장 마커에 쓰는 장소 로고 (DayMeta.venueLogo 참고). 상수로 두는 이유는
// L^IFE Jungle이 Day 5와 Day 8 두 곳에 붙기 때문입니다 — 장소가 바뀌면 고칠 곳이
// 하나여야 합니다. 아트워크는 scripts/process-partner-logos.py가 CI 폴더에서
// 만들고, `name`은 스크린리더가 읽는 장소 이름입니다.
//
// FOUNDRY는 "FOUNDRY." 워드마크만 씁니다. 원본 로고는 말풍선 도형 + 워드마크인데,
// 흰색 모노로 바꾸면 도형이 통짜 흰 사각형이 되어 이 크기(16px)에서는 아무것도
// 말하지 않습니다. 자세한 것은 스크립트의 JOBS 주석에 있습니다.
const VENUE_FOUNDRY = { src: "/partners/logos/white/trimmed/foundry.png", name: "The Foundry" };
const VENUE_LIFE = { src: "/partners/logos/white/trimmed/life.png", name: "*SCAPE L^IFE Jungle" };
const VENUE_AWS = { src: "/partners/logos/white/trimmed/aws.png", name: "AWS office" };

// Day 8 두 트랙 발표 슬롯(11:10–12:30 · 12:30–1:50)이 함께 쓰는 note입니다.
// 상수인 이유 둘:
//   · 두 슬롯은 트랙만 다른 같은 세션입니다. 슬롯마다 다른 문장을 달면 첫 슬롯에만
//     포맷이, 둘째 슬롯에만 오고 갈 자유가 적혀 반쪽짜리 안내가 둘 생깁니다.
//   · 발표/Q&A 배분이 아직 미확정이라 총량(8분)만 적습니다. 포맷이 확정되면 여기
//     한 곳만 고치면 두 슬롯이 같이 따라옵니다.
// ⚠️ 세부 배분("발표 3분 + 피드백 5분")을 되살리지 마세요 — 참가자가 잘못된 길이로
// 준비해 오는 종류의 숫자라, 확정 전에는 총량과 헤지만 노출합니다.
const D8_TRACK_PITCH_NOTE: Bilingual = {
  ko: "팀당 8분(잠정) — 발표·Q&A 시간 구성은 확정되는 대로 안내해요. 자기 트랙 발표 외 시간은 자유롭게 쓰시면 돼요 — 남아서 다른 팀을 봐도, *SCAPE를 둘러봐도 됩니다.",
  en: "Eight minutes per team (provisional) — we'll confirm how that splits between the presentation and Q&A once it's settled. Outside your own track the time is yours: stay and watch other teams, or wander *SCAPE.",
};

// Day theme labels + one-line summaries (Opening → the Showcase)
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
      // "(확정)" trailed the AWS speaker here until 2026-08-10. Nothing else in
      // this summary is hedged, so the tag only asked why the speaker alone
      // needed vouching for; the card's own 확정 badge (confirmed: true) still
      // marks which SESSIONS are locked, which is the distinction that exists.
      ko: "The Foundry(The Refinery 홀) 현장 · 12:40 입장(선착순 굿즈) · 원대로 오프닝 키노트 · 해시드 인사말 · 문제 공개 · AWS 연사 한장환 님.",
      en: "In person at The Foundry (The Refinery hall) · doors 12:40 (first-come goods) · Won's opening keynote · a word from Hashed · problem release · AWS talk by Han Jang-whan.",
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
        note: { ko: "브랜드부스트 후드·캡 세트 60개 선착순 · 사이즈 선택은 어렵습니다. 받고 싶다면 일찍 오시는 게 확실해요. 현장 인원을 미리 잡기 위해 행사 이틀 전에 참석 여부를 여쭤봅니다.", en: "60 Brand Boost hoodie + cap sets, first come first served · sizes can't be chosen, so arriving early is the sure way to get one. We'll also ask whether you're coming two days before the event, so we can size the room." },
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
        note: { ko: "팀 없이 오신 분만 해당돼요. 유형 테스트로 성향을 받아 현장에서 팀을 이어드립니다. 이미 팀으로 신청했다면 해당 없어요.", en: "Only if you came without a team: the type test reads your working style so we can match you on site. Nothing to do if you registered as a team." },
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
    venueLogo: VENUE_FOUNDRY,
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
      ko: "정해진 일정은 오후 1:1 멘토링(온라인 기본)뿐이고, 나머지는 각자 비는 시간에 원하는 만큼 빌드하면 됩니다.",
      en: "The only fixed thing is a PM 1:1 mentoring slot (online by default), and the rest is yours to build in whatever free time you have.",
    },
    whyStop: {
      ko: "내 아이디어를 현직자에게 1:1로 검증받는 첫 기회",
      en: "The first time your idea meets a working founder, 1:1",
    },
    stopLabel: { ko: "1:1 멘토링", en: "1:1 mentoring" },
    // 온라인이 기본이되 멘토에 따라 한인회관 대면이 있을 수 있는 날 — "online"이
    // 아닌 이유는 dayMode 주석에 있습니다.
    dayMode: "online-default",
  },
  {
    day: 4,
    date: "08.25",
    weekday: { ko: "화", en: "Tue" },
    phase: LAB1,
    theme: { ko: "자율 빌드 · 멘토링", en: "Self-paced build · Mentoring" },
    summary: {
      ko: "정해진 일정은 오후 1:1 멘토링(온라인 기본)뿐이고, 나머지는 각자 비는 시간에 원하는 만큼 빌드하면 됩니다.",
      en: "The only fixed thing is a PM 1:1 mentoring slot (online by default), and the rest is yours to build in whatever free time you have.",
    },
    whyStop: {
      ko: "방향을 아직 바꿀 수 있을 때 받는 두 번째 1:1",
      en: "A second 1:1, while there's still time to change direction",
    },
    stopLabel: { ko: "1:1 멘토링", en: "1:1 mentoring" },
    // Day 3과 같습니다 (dayMode 주석 참고).
    dayMode: "online-default",
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
      ko: "온라인 구간을 지나 다시 현장으로 갑니다. *SCAPE에서 학생 간 네트워킹에 초점을 둔 프로그램을 해시드와 기획 중입니다 · FDE 오피스아워(온라인).",
      en: "Back in person after the online stretch. At *SCAPE, with a programme focused on student-to-student networking being planned with Hashed · FDE office hours (online).",
    },
    // 프로그램이 아니라 '만남' 자체가 이유입니다 — 세부 구성은 아직 해시드와
    // 기획 중이라, 여기서 프로그램을 약속하면 헤지가 무너집니다.
    //
    // "전원이 처음 만나는 날"이라고 썼었는데 사실이 아닙니다 (2026-08-04 수정).
    // Day 1이 필참 현장이라 전원은 이미 첫날 한자리에 있습니다. Day 5를 다르게 만드는
    // 것은 '처음'이 아니라 밀도입니다 — 첫날의 만남은 키노트·문제 공개 사이에 낀
    // 쉬는 시간이고, 이 날은 하루 전체가 학생끼리 섞이는 데 쓰입니다.
    // 같은 주장이 dict의 노선도 범례(legendSpotlight)와 혜택 네트워킹 줄에도 있었고
    // 셋을 함께 고쳤습니다. 되돌릴 거면 두 곳을 같이 되돌리세요 — 범례는 2026-08-05
    // Day 7이 스포트라이트에 합류하며 일반화됐고("놓치면 아까운 정거장"), 이제 Day 5를
    // 서술하지 않습니다. Day 5가 무엇인지는 아래 whyStop과 혜택 네트워킹 줄 둘만
    // 말합니다.
    whyStop: {
      ko: "학생끼리 교류하는 데 하루를 통째로 쓰는 날",
      en: "A whole day given to students connecting with each other",
    },
    hours: "10AM–2PM",
    dayMode: "offline",
    venueLogo: VENUE_LIFE,
    // 노선도에서 크게 그리는 두 선택일 중 하나(다른 하나는 Day 7). 하루를 통째로
    // 학생 간 교류에 쓰는 유일한 날인데, 작은 점 하나로는 Day 2·3·4·6과 구분되지
    // 않았습니다 — whyStop이 그 값을 말하는 동안 노선도는 그냥 지나가는 정거장으로
    // 그리고 있었습니다.
    spotlight: true,
  },
  {
    day: 6,
    date: "08.27",
    weekday: { ko: "목", en: "Thu" },
    phase: LAB2,
    theme: { ko: "자율 빌드", en: "Self-paced build" },
    // 멘토링 줄이 이 요약에 있는 이유 (DECIDED 2026-08-09): 이 날의 유일한 이벤트인
    // d6-open-build는 selfPaced라 세션 목록에서 아예 숨겨집니다 — 그 description에
    // 적으면 아무도 읽지 못합니다. Day 5·7은 현장 세션 카드가 있어서 그쪽
    // description이 읽히지만, Day 6은 이 요약이 카드와 모달에서 유일하게 보이는
    // 자리입니다. 여기서 빼지 마세요.
    summary: {
      ko: "필요하면 팝업스튜디오 FDE 오피스아워(온라인)에 드롭인하세요. 예약도 출석도 없습니다. 1:1 멘토링도 하루 종일 열려 있는 날입니다. 막힌 지점이 있으면 예약하고 풀고 가세요.",
      en: "Drop in to Popup Studio's FDE office hours (online) if you need them. No booking, no attendance. 1:1 mentoring runs all day too. If you're stuck, book a slot and get unstuck.",
    },
    // 없는 이유를 지어내지 않습니다. 이 날은 정말 아무 일정이 없고, 그 사실이
    // 이 줄의 내용입니다. 요약에서 "정해진 일정이 하나도 없는 날"을 뺀 것도
    // 이 줄과 같은 말이기 때문입니다 — 한 카드에서 두 번 읽히면 안 됩니다.
    whyStop: {
      ko: "정해진 것 없음. 온전히 팀의 빌드 시간",
      en: "Nothing scheduled. The day belongs to your team's build",
    },
    // DECIDED 2026-08-09: 멘토링이 Day 3–7 닷새 매일 열리면서 이 날의 파생 키워드
    // ("자율 빌드")가 틀린 말이 됐습니다 — 노선도에서 내려설 이유는 이 날도
    // 1:1 멘토링이지, 아무 데서나 할 수 있는 자율 빌드가 아닙니다. Day 3·4와 같은
    // 이유로 덮습니다. theme("자율 빌드")은 그대로 둡니다: 그건 이 날의 기본 성격이고,
    // 멘토링이 열려 있다는 사실은 카드 요약과 노선도의 Day 3–7 밴드가 말합니다.
    stopLabel: { ko: "1:1 멘토링", en: "1:1 mentoring" },
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
    // DECIDED 2026-08-05: 식사 언급 전면 제거 — 제공 안내도, 미제공 안내도 쓰지
    // 않는다. (식사 미제공 정책 자체는 2026-08-04 결정 그대로) 어느 방향으로든 다시
    // 넣지 마세요. 이 나열에 있던 "점심(개별)"이 그래서 빠졌습니다 — 요약은 그날
    // 무엇이 열리는지를 말하는 줄이고, 참가자가 알아서 먹는 시간은 행사가 여는
    // 프로그램이 아닙니다. 아래 시간표에도 같은 시간대가 "휴식"으로 남아 있습니다.
    // 끝의 "저녁: 사전 제출물 마감"은 시간대이지 식사가 아닙니다 — 건드리지 마세요.
    summary: {
      // "(확정)" sat on the venue while this day was moving between rooms. The
      // AWS office is booked and every other day names its venue flat, so the
      // tag came off on 2026-08-10 rather than making this one venue look like
      // the only one anybody had checked.
      ko: "AWS 오피스 · 멘토와 함께하는 최종 점검 · 박희덕 커리어 간담회 · FDE 오피스아워(온라인) · 저녁: 사전 제출물 마감(필수).",
      en: "AWS office · final check with mentors · Park Hee-deok career session · FDE office hours (online) · Evening: submission deadline (required).",
    },
    whyStop: {
      ko: "전문가들이 던질 질문을 무대에 서기 하루 전에 미리 받아보는 자리",
      en: "The experts' questions, asked a day before you're on stage",
    },
    hours: "9AM–2PM",
    // 확정 진행 순서 (2026-08-04). 9AM–2PM 안에서 다섯 줄이 전부입니다.
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
        // 이 줄은 "네트워킹 점심" → "점심 (식사 미제공 안내)"을 거쳐 지금의 "점심시간"이
        // 됐습니다. DECIDED 2026-08-05: 식사 언급 전면 제거 — 제공 안내도, 미제공
        // 안내도 쓰지 않는다. (식사 미제공 정책 자체는 2026-08-04 결정 그대로) 어느
        // 방향으로든 다시 넣지 마세요.
        // 여기서 걷어낸 것은 "제공/미제공"이지 시간대 이름이 아닙니다. 시간표에는
        // 점심시간이 그대로 있어야 합니다 — 9AM–2PM을 관통하는 하루에서 11:30에
        // 무엇이 열리는지 이름이 없으면 현장에 있는 사람이 자리를 떠도 되는지를
        // 모릅니다. "점심시간"은 그 시간대의 이름일 뿐, 끼니를 준다는 말이 아닙니다.
        // note에는 무엇을 해도 되는 시간인지만 씁니다 — 식판도, 각자 해결하라는
        // 안내도 넣지 마세요.
        time: "11:30AM–12:30PM",
        label: { ko: "점심시간", en: "Lunch break" },
        note: { ko: "자유 시간이에요. 그대로 나가서 네트워킹을 이어가거나, 멘토와 이야기를 이어가도 좋아요.", en: "Free time. Head out and keep networking, or carry on the conversation with a mentor." },
      },
      {
        time: "12:30PM–1:40PM",
        label: { ko: "커리어 간담회 · 박희덕", en: "Career session · Park Hee-deok" },
        eventId: "d7-speaker-session",
      },
      // 12:30–2PM 한 줄이었는데 쪼갰습니다 (2026-08-04). 간담회는 1시간 10분이고
      // 남은 20분은 촬영입니다 — 합쳐두면 간담회가 90분인 것으로 읽히고, 그 20분에
      // 자리를 뜬 사람은 사진에서 빠집니다. 아직 잠정이라 note에 그렇게 적었습니다.
      {
        time: "1:40PM–2PM",
        label: { ko: "기념촬영 · 단체 사진", en: "Photos · group shot" },
        note: {
          ko: "주최사와 주관 학생회 임원진 기념촬영, 이어서 단체 사진 (잠정, 확정 시 안내)",
          en: "Commemorative photos with the host companies and the student council executives, then a group shot (provisional, we'll confirm)",
        },
      },
    ],
    dayMode: "offline",
    venueLogo: VENUE_AWS,
    // 노선도에서 크게 그리는 두 선택일 중 하나(다른 하나는 Day 5). Day 5와 같은
    // 이유입니다 — 현장이고, 그날 벌어지는 일이 혼자서는 대체 불가능합니다: 무대에
    // 서기 하루 전, 현업에서 제품을 파는 사람들 앞에서 발표와 Q&A를 미리 받아보는
    // 자리는 자율 빌드로 대신할 수 없습니다. 게다가 이날 저녁이 사전 제출물 마감이라
    // 실질적으로 마지막 손볼 기회이기도 합니다(deliverableDue).
    //
    // 배지는 붙이지 않습니다 — Day 7은 선택일입니다. 노선도에서 크게 그리는 것과
    // 필참은 다른 층이고, 그 구분이 무너지면 "이틀만 비우면 된다"는 이 섹션 전체의
    // 주장이 무너집니다.
    spotlight: true,
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
    // DECIDED 2026-08-05 (파트너 피드백): 경쟁형 데모데이 → 결과 공유회. 순위형
    // 시상 폐지·테마형 어워드(부문 pending)·인턴십 전원 개방. 이벤트 id는 그대로
    // 둡니다 — 바뀐 것은 카피뿐입니다.
    theme: { ko: "결과 공유회 · 최종 발표", en: "Showcase · Final Presentations" },
    summary: {
      ko: "*SCAPE 현장 · 두 트랙 팀 발표(팀당 8분·잠정) · 박희덕 연사 · 테마별 어워드 발표 · 완주 수료증과 단체 사진.",
      en: "In person at *SCAPE · team presentations across two tracks (8 min each, provisional) · Park Hee-deok · thematic awards · completion certificates and a group photo.",
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
        label: { ko: "지금까지의 여정 정리 · 공유회 시작", en: "Looking back at the eight days · the Showcase begins" },
      },
      {
        time: "11:10AM–12:30PM",
        label: { ko: "첫 번째 트랙 발표", en: "First track pitches" },
        note: D8_TRACK_PITCH_NOTE,
        eventId: "d8-judging",
      },
      {
        time: "12:30PM–1:50PM",
        label: { ko: "두 번째 트랙 발표", en: "Second track pitches" },
        note: D8_TRACK_PITCH_NOTE,
        eventId: "d8-judging",
      },
      {
        time: "1:50PM–2:30PM",
        label: { ko: "박희덕 연사", en: "Park Hee-deok speaks" },
        eventId: "d8-opening-keynote",
      },
      {
        time: "2:30PM–2:45PM",
        label: { ko: "테마별 어워드 발표 · 사진", en: "Thematic awards · photos" },
        eventId: "d8-final-pitch",
      },
      {
        time: "2:45PM–3PM",
        // 손에 드는 것은 완주 수료증입니다 — 공유회 발표까지 마친 분들께 이 자리에서
        // 실물로 드리는 그 한 장. 크래시코스 수료증은 PDF로 나가므로 이 사진에
        // 등장하지 않습니다. 둘을 "수료증"으로 뭉뚱그리면 PDF도 현장에서 받는
        // 것처럼 읽힙니다.
        label: { ko: "What's next 안내 · 완주 수료증과 함께 단체 사진", en: "What's next · group photo with your completion certificate" },
      },
    ],
    dayMode: "offline",
    venueLogo: VENUE_LIFE,
    mandatory: true,
    awardsBox: true,
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
      ko: "문제 공개 · 키노트 · 결과 공유회. 행사의 핵심 마디입니다.",
      en: "Problem Release · Keynote · the Showcase. The anchor moments.",
    },
    dot: "#fcd34d", // bright gold (matches the ★) — visible on the dark theme
  },
  workshop: {
    label: { ko: "워크숍", en: "Workshop" },
    blurb: {
      ko: "크래시코스(바이브 코딩 입문). 처음이어도 출발선을 맞춥니다.",
      en: "The Crash Course (vibe-coding intro). Leveling the start line.",
    },
    dot: "#7C5CFF", // purple
  },
  build: {
    label: { ko: "빌드 / 자율", en: "Build / Open" },
    // Says what it ISN'T first: "상시 진행" was being read as "always on, so be
    // online for it" — the opposite of what it means.
    blurb: {
      ko: "정해진 세션·출석 없음. 각자 편한 시간에 진행하는 자율 빌드.",
      en: "No sessions, no attendance. Build at your own time and pace.",
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
      ko: "브리핑 · 네트워킹 · 믹서. 사람과 사람을 잇는 시간.",
      en: "Briefing · networking · mixers. Connecting people.",
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
// at the law school — YPHSL Seminar Room 2-01, confirmed 2026-07-31; SMU also
// remains an organizer and an eligibility term. Only VENUE references changed.)
// The street address rides in the string because this is a room inside a
// building on a road nobody knows by name; "The Foundry" alone is not findable.
// Only Day 1 uses this — Networking Day (Day 5) and the Showcase (Day 8) are at
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
// The 1:1 mentoring is arranged MENTOR BY MENTOR, and the default is ONLINE.
// In person is what an individual mentor may offer, not what the programme
// promises — enough of them can only make an online slot that leading with F2F
// would be the wrong way round.
//
// DECIDED 2026-08-09: 멘토링 Day 3–7 매일·예약제 확정. 웹에서 멘토↔날짜 매핑 전면
// 제거(무대 세션 연사 공지는 예외) — 편향 방지. 대면 운영 범위(어느 날 회관이 열리는지)는
// 확정 전이라 이 문자열에 날짜를 새로 쓰지 마세요.
//
// THE F2F VENUE IS THE KOREAN ASSOCIATION HALL (2026-08-04), not NUS. Every
// "NUS 대면" on this page came from the deck's original plan; the sessions are
// actually hosted by the Korean Association in Singapore at its own hall in
// Tanjong Pagar — which is also why it carries the 장소 role on the partner wall.
// NUS stays everywhere it is legitimately used (organizer 학생회, eligibility,
// a Day 8 panellist's affiliation); only the mentoring VENUE moved.
const MENTORING_MODE: Bilingual = {
  ko: "온라인 기본, 멘토에 따라 한인회관 대면(F2F)",
  en: "Online by default, in person at the Korean Association hall with some mentors",
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

// Popup Studio runs the stage-2 mentoring: the online FDE office hours. The
// programme itself is agreed; only the time slots are open, which is why the
// events carry neither a "확정" nor a "TBC" badge — a TBC badge would read as
// "this might not happen", which is not what is unsettled here.
//
// DECIDED 2026-08-09: 이 소개문에서 날짜("Day 5–7 동안")를 뺐습니다 — 기업 멘토를
// 특정 날짜와 묶는 표기는 웹에서 쓰지 않습니다. 오피스아워가 어느 날 열리는지는
// 세션 카드가 그 날짜의 카드로 서 있다는 사실이 이미 말합니다.
const POPUP_STUDIO_ORG = {
  name: "Popup Studio",
  url: "https://popupstudio.ai",
  desc: {
    ko: "팝업스튜디오는 AI 전환(AX)을 업으로 하는 싱가포르 본사 기업으로, FDE 온라인 오피스아워를 열어 팀별 문제 정의·워크플로·구현 방향을 함께 점검합니다.",
    en: "Popup Studio is a Singapore-headquartered AI-transformation (AX) company. Its FDEs hold online office hours to review each team's problem definition, workflow and implementation direction.",
  },
} as const;

// ── 멘토링 점검 항목 (BEvent.checkpoints) ────────────────────────────────────
// 두 구간의 할 일이 다르므로 목록도 둘입니다.
//
// 원문은 멘토에게 주는 지침("~해주시면 좋겠습니다")이었는데, 사이트는 학생이
// 읽는 곳이라 시점을 학생으로 옮겨 다시 썼습니다 — 내용은 그대로 두고 "멘토와
// 함께 이런 걸 점검한다"로. 카피에 멘토를 부르는 말투를 남기지 마세요.
//
// Day 3–6 · 근거를 만드는 시간: 문제의 범위와 솔루션 방향을 아직 실제로 고칠 수
// 있는 구간. 핵심 질문 두 개 — 무엇을 보는지에 맞는 솔루션을 어떻게 만들 것인가,
// 그 차별성과 효과를 어떻게 증명할 것인가.
// (상수명 SCORE_BUILDING/SCORE_KEEPING은 그대로 둡니다 — 참조가 걸려 있고,
//  2026-08-05 전환에서 바뀐 것은 카피와 비유이지 코드가 아닙니다.)
const SCORE_BUILDING_CHECKS: Bilingual[] = [
  {
    ko: "문제의 범위가 지나치게 넓지 않은지, 끝까지 갈 수 있는 크기로 좁혔는가",
    en: "Whether the problem is scoped too wide, and cut down to something you can finish",
  },
  {
    ko: "선택한 병목이 충분한 데이터와 근거로 설명되는지",
    en: "Whether the bottleneck you picked is backed by data and evidence",
  },
  // "프롬프트 한 줄과 뭐가 다른가"의 풀어쓴 버전입니다. 축약형은 Day 8 패널에
  // 서는 전문가조차 되물었던 표현이라 사이트 전체에서 쓰지 않기로 했습니다 —
  // 되돌리지 마세요.
  {
    ko: "솔루션이 범용 LLM에 그냥 물어보면 나오는 답과 무엇이 다른지",
    en: "How the solution differs from what you'd get by just asking a general LLM",
  },
  {
    ko: "AI가 실제로 어떤 판단이나 처리를 담당하는지",
    en: "Which judgements or steps the AI actually takes on",
  },
  {
    ko: "그 차별성과 효과를 데모와 비교 자료로 증명할 수 있는지",
    en: "Whether you can prove that difference and its effect with the demo and a comparison",
  },
];

// Day 7 · 만든 것을 잃지 않는 시간: 제출 마감 당일이라 범위를 다시 좁히거나
// 방향을 트는 날이 아닙니다. 남은 일은 이미 만든 것을 증명하는 것뿐.
const SCORE_KEEPING_CHECKS: Bilingual[] = [
  {
    ko: "발표 구조: 병목 → 근거 → 데모 → 위험과 대응의 흐름이 서 있는지, 베이스라인 비교 자료가 필요한 자리에 놓였는지",
    en: "The pitch structure: does bottleneck → evidence → demo → risk-and-response hold up, and is the baseline comparison where it needs to be",
  },
  {
    ko: "전문가 질문 사전 리허설: “담당자가 그냥 범용 LLM에 물어봐서 얻는 답과, 이건 뭐가 다르죠?”, “어떤 판단을 AI에 맡겼나요?”, “이 솔루션의 효과를 어떻게 증명할 수 있나요?”에 자기 언어로 답할 수 있는지",
    en: "A dry run of the experts' questions, in your own words: “how is this different from what the problem owner would get by just asking a general LLM?”, “which judgements did you hand to the AI?”, “how would you prove this actually helps?”",
  },
  {
    ko: "오늘 저녁 마감되는 사전 제출물 네 가지가 다 완성됐는지",
    en: "Whether all four pieces of the submission package due this evening are finished",
  },
];

// The three Day 5–7 office-hour entries are identical apart from `day`/`id` —
// one per day so the session shows up on each day's card and modal, rather than
// living on Day 5 only and being invisible to someone opening Day 6 or 7.
// Written once here so the three can never drift apart.
//
// ⚠️ 단 하나 갈라지는 것: checkpoints. 이 상수는 Day 3–6의 목록
// (SCORE_BUILDING_CHECKS)을 갖고, Day 7 항목만 SCORE_KEEPING_CHECKS로
// override합니다. Day 7은 제출 마감 당일이라 "문제 범위를 다시 좁혀보자"를
// 그대로 보여주면 오늘 방향을 틀어도 된다고 잘못 안내하는 셈입니다.
// 아래 Day 7 spread의 override를 지우지 마세요.
// TODO: 시간대 확정 시 timeOfDay 조정 (현재 PM은 자리표시자).
const FDE_OFFICE_HOUR = {
  date: "",
  category: "mentoring" as const,
  mode: "online" as const,
  timeOfDay: "PM" as const,
  title: { ko: "FDE 오피스아워 · 팝업스튜디오", en: "FDE Office Hours · Popup Studio" },
  summary: {
    ko: "온라인 드롭인으로 문제 정의·워크플로·구현 방향을 FDE와 점검해요 (시간 추후 안내).",
    en: "Online drop-in to check your problem definition, workflow and build direction with FDEs (times TBA).",
  },
  description: {
    // EDIT 2026-08-09: 날짜 표기 제거 — 1:1 멘토링을 "Day 3·4 기초"로, 오피스아워를
    // "Day 5–7 실전"으로 갈라 적으면 사람·기업이 특정 날짜에 묶입니다. 두 트랙은
    // 날짜가 아니라 도움의 종류로 갈립니다(예약제 1:1 / 드롭인 오피스아워).
    ko: "빌드가 막히는 지점을 현업 엔지니어와 함께 푸는 실전 2단계입니다. AI 전환을 업으로 하는 팝업스튜디오의 FDE(Forward-Deployed Engineer)들이 온라인 오피스아워를 열어 둡니다. 원하는 팀이 원하는 때 드롭인해서 문제 정의, 워크플로 분석, 구현 방향을 점검받으세요. 예약·출석 의무가 없고, 시간대는 추후 안내됩니다. 멘토 지정 없이 열려 있는 시간이라는 점은 다른 멘토링과 같아요.",
    // EDIT 2026-08-09: AI-티 감량(부정 대구·강조어·공식 어미) — 뜻은 불변
    en: "Stage two: working through what's blocking the build with engineers who do it for a living. Popup Studio, an AI-transformation company, keeps online office hours open with its FDEs (Forward-Deployed Engineers): drop in whenever your team wants and get a read on your problem definition, workflow analysis and implementation direction. There's no booking and no attendance obligation, and the time slots will be announced. Like the rest of the mentoring, it's open time you drop into, not a mentor you pick.",
  },
  location: ONLINE,
  org: POPUP_STUDIO_ORG,
  checkpoints: SCORE_BUILDING_CHECKS,
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
  // VENUE FULLY CONFIRMED 2026-07-31: YPHSL Seminar Room 2-01, 18:00–20:00.
  // Facility booking ref BK-20260731-000114 (SMU Facility Booking System →
  // James LEE). The room was TBC until then and every venue string carried a
  // "강의실 추후 안내" hedge; the hedge is gone. Do not put it back.
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
    // 창) 실제 창보다 좁게 안내됐습니다. 되돌려 버퍼를 빼지 마세요.
    // 시각을 말하는 곳은 이제 여기 하나입니다. description에도 같은 창이 적혀 있어
    // 둘을 맞춰 두어야 했는데, 한쪽만 고쳐지면 조용히 어긋나므로 뺐습니다.
    dayLabel: { ko: "사전 세션 · 08.13 (목) 18:00–20:00", en: "Pre-event · Thu 13 Aug, 18:00–20:00" },
    title: { ko: "Enterprise Tech Deep Dive: How to Build", en: "Enterprise Tech Deep Dive: How to Build" },
    // Just the role — no "(성함 비공개)" tag. Saying out loud that a name is being
    // withheld draws attention to the absence and reads as something hidden; the
    // role alone reads as a normal listing. The comment above is the record of WHY
    // there is no name here — keep that, and never fill one in.
    speaker: { ko: "Microsoft 클라우드·AI 솔루션 아키텍트", en: "Microsoft cloud & AI solution architect" },
    // 이름이 비공개인 만큼, 밴드에서 이 세션의 무게를 말할 수 있는 것은 소속뿐입니다.
    // 밴드는 제목과 요약 한 줄만 보여주고 speaker 행은 모달에만 있어서, 목록을 훑는
    // 사람에게는 이 로고가 "누가 와서 말하는가"의 유일한 신호입니다.
    speakerLogo: { src: "/partners/logos/white/trimmed/microsoft.png", alt: "Microsoft" },
    summary: {
      ko: "본 행사 9일 전 · SMU 법학대학원 현장. “데모는 쉽고, 시스템은 어렵다”, 엔터프라이즈 AI 에이전트를 실제로 만드는 이야기.",
      en: "Nine days before the event · in person at SMU's School of Law. “The demo is easy, the system is hard”: building enterprise AI agents for real.",
    },
    // 모달이 스스로 말하는 것은 여기서 반복하지 않습니다: 연사 소속은 연사 행,
    // 시각은 시간 행, 강의실은 장소 행, 그리고 신원·권한·툴·승인·감사 · 회계
    // 자동화 사례 · 사전 질문은 바로 아래 opportunities에 이미 그대로 있습니다.
    // 남은 두 문장은 다른 어디에도 없는 것뿐입니다 — 왜 들을 만한지, 그리고 누가
    // 올 수 있는지. 특히 "등록 무관, 세 학교 누구나"는 이 문장이 유일한 출처라
    // 지우면 정보가 사라집니다.
    description: {
      // EDIT 2026-08-09: AI-티 감량(부정 대구·강조어·공식 어미) — 뜻은 불변
      ko: "빌더톤이 시작되기 전, 기업 현장에서 AI를 설계하고 배포해 온 사람이 직접 이야기합니다. 데모는 2초면 되지만 프로덕션까지는 몇 달이 걸리는 이유, 엔터프라이즈 AI 에이전트가 보기보다 어려운 지점을 다룹니다. 빌더톤 등록 여부와 무관하게 NUS·NTU·SMU 한인 학생이면 누구나 올 수 있습니다.",
      en: "Before the builderthon starts, an evening with someone who designs and ships enterprise AI for a living: why a 2-second demo takes months to reach production, and where enterprise AI agents turn out to be harder than they look. Open to any Korean student at NUS, NTU or SMU, whether or not you register for the builderthon.",
    },
    // This is the ONLY SMU venue left in the schedule. Day 1 used to share the
    // same law school ("SMU YPHSL B2-03") and this note asked for the two to be
    // named consistently — as of 2026-08-03 Day 1 moved to The Foundry, so there
    // is nothing left to unify. This session was always a separate booking and
    // was never part of that move.
    //
    // 건물 이름은 사이트 전체에서 하나여야 합니다. 예약 시스템과 건물 안내판은
    // YPHSL(Yong Pung How School of Law)로 적고, 이전 문구는 SOL(School of Law)을
    // 썼습니다 — 같은 건물의 다른 약어라 둘을 함께 두면 읽는 사람이 두 곳인지
    // 의심합니다. 한국어로 뜻이 바로 통하는 "법학대학원"을 앞에 두고 괄호로
    // 예약·안내판의 표기를 답니다. summary의 표기도 같이 맞췄습니다.
    location: {
      ko: "SMU 법학대학원(YPHSL) 세미나룸 2-01",
      en: "SMU Yong Pung How School of Law (YPHSL), Seminar Room 2-01",
    },
    opportunities: [
      { ko: "챗봇과 에이전트의 차이: 신원·권한·툴·승인·감사까지 붙어야 일이 된다", en: "What separates a chatbot from an agent: identity, permissions, tools, approval, audit" },
      { ko: "기업 에이전트가 어려운 6가지 이유와, 실제 구축된 회계 자동화 에이전트 사례", en: "The six reasons enterprise agents are hard, and a real accounts-payable agent that works" },
      { ko: "빌더톤 과제를 풀 때 바로 쓸 수 있는 아키텍처 관점", en: "An architecture lens you can take straight into the builderthon problems" },
      { ko: "사전 질문을 받아 세션에 반영합니다. 오픈채팅으로 보내면 돼요", en: "Questions collected in advance and worked into the session, so send them via the open chat" },
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
      ko: "‘취업과 창업의 사이’, 8일의 ‘왜’를 여는 오프닝 키노트.",
      en: "“Between Employment and Founding”, the keynote that opens the 8-day ‘why’.",
    },
    description: {
      ko: "빌더톤의 문을 여는 오프닝 키노트입니다. Wilt Venture Builder(SG)의 원대로 대표님이 ‘취업과 창업의 사이’를 주제로, 정형화된 ‘취업 vs 창업’ 이분법에서 벗어나 벤처빌더가 본 다양한 진로·커리어 경로와 비개발자도 시작할 수 있는 여러 갈래를 약 1시간 동안 Q&A와 함께 풀어냅니다. ‘처음이어도 괜찮다’는 톤으로 8일의 ‘왜’를 세우며 출발선을 엽니다.",
      en: "The keynote that opens the builderthon. Won Dae-ro (Managing Director, Wilt Venture Builder SG) speaks on “Between Employment and Founding” for about an hour, with Q&A, stepping past the tidy ‘employment vs. founding’ binary to the many career paths a venture builder has seen, and the routes even non-developers can start from. It sets the 8-day ‘why’ in a ‘first-timers welcome’ tone.",
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
      // EDIT 2026-08-09: AI-티 감량(부정 대구·강조어·공식 어미) — 뜻은 불변
      ko: "앞으로 7일이 어떻게 굴러가는지 여기서 한 번에 정리해 드려요. 트랙 구성과 팀 운영, 평가 흐름을 짚고, 멘토링이 어떻게 돌아가는지, 그러니까 언제 열리고 어떻게 신청하고 누구를 만나게 되는지를 함께 안내합니다. 그리고 이 블록의 마지막 순서로 실제 과제가 공개됩니다(문제 공개 카드 참고).",
      en: "One sitting that lays out how the next seven days run: the tracks, team logistics and how the work gets looked at, plus how mentoring actually works: when it opens, how you request a slot, who you end up with. The real problems are then released as the last item in this block (see the problem-release card).",
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
      // "확정 세션입니다" opened this until 2026-08-10 — the card above it
      // already carries the 확정 badge, so the first sentence of the copy spent
      // itself repeating a pill the reader just tapped through.
      ko: "AWS 연사 한장환 님이 진행합니다. Amazon이 실제로 AI 문제를 어떻게 정의하고, 어떤 방법론으로 접근하는지를 다룹니다. 문제를 ‘어떻게 풀까’ 이전에 ‘무엇을, 왜 푸는가’를 잡는 관점입니다. 순서상 과제가 공개된 바로 다음 시간이라, 방금 손에 쥔 진짜 문제를 어떤 눈으로 뜯어볼지 배운 걸 그 자리에서 바로 얹어볼 수 있습니다.",
      // EDIT 2026-08-09: AI-티 감량(부정 대구·강조어·공식 어미) — 뜻은 불변
      en: "A session led by AWS speaker Han Jang-whan on how Amazon defines AI problems and the methodology it uses to approach them. It's the ‘what and why’ before the ‘how’, and it comes immediately after the problems are released, so the lens lands on the real brief already in your hands.",
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
      en: "Real companies' AX problems drop, you pick a track, and the 8-day build clock starts (track line-up not final yet).",
    },
    description: {
      // EDIT 2026-08-09: AI-티 감량(부정 대구·강조어·공식 어미) — 뜻은 불변
      // "파트너 기업이 지금 겪고 있는" 자체가 '가상이 아님'을 증명하므로 부정 절 삭제.
      ko: "Day 1은 이 빌더톤의 실질적 킥오프입니다. 파트너 기업이 지금 겪고 있는 실제 AX(AI 전환) 문제가 트랙별로 공개되고, 참가자는 이 자리에서 자신의 트랙을 고릅니다. 공개는 오리엔테이션의 마지막 순서로 이뤄집니다. 앞으로 7일이 어떻게 굴러가는지를 듣고 난 직후에 진짜 과제를 받는 흐름이에요. 트랙 구성은 아직 확정 전이며(메인 트랙 2개로 좁혀 논의 중), 확정되는 대로 안내합니다. 바로 다음 순서인 AWS 세션이 이 문제를 어떤 방법론으로 뜯어볼지를 다루고, 이어지는 네트워킹 시간부터는 원하는 팀은 그 자리에서 빌드를 시작해도 됩니다. 정해진 ‘시작 버튼’을 기다릴 필요 없이 각 팀의 페이스로 공유회까지 이어집니다. Day 1은 필참이며 The Foundry의 The Refinery 홀(11 Prinsep Link) 현장에서 1PM–4:30PM 진행합니다.",
      en: "Day 1 is the real kick-off. The actual AX (AI-transformation) problems partner companies are facing right now get released by track, and this is where you choose yours. The release lands as the final item of the orientation block: you hear how the next seven days work, then get the real brief. The track line-up isn't confirmed yet (narrowed to two main tracks, still under discussion) and we'll announce it once settled. The AWS session immediately after gives you a methodology to take the problem apart, and from the networking slot that follows any team can start building on the spot, with no start whistle to wait for and each team at its own pace through to the Showcase. Day 1 is mandatory and runs on-site at The Foundry's The Refinery hall, 11 Prinsep Link, 1PM–4:30PM.",
    },
    location: FOUNDRY_REFINERY,
    locationUrl: FOUNDRY_URL,
  },
  // 파트너 인사말. 구성·길이가 아직 조율 중이라 confirmed를 세우지 않습니다 —
  // 시각(2:00–2:10PM)만 진행 순서에 잡혀 있습니다. 무슨 이야기를 할지는 쓰지
  // 않습니다: 정해지지 않은 것을 지어내는 자리가 아닙니다.
  //
  // 실명·사진은 2026-08-04에 추가했습니다. 그전까지는 "본인 공개 동의 전"이라
  // 회사명만 두고 있었는데, 사진과 LinkedIn을 함께 받아 공개로 전환했습니다.
  // speakerProfile의 내용은 공개 LinkedIn 프로필에서 확인한 것만 씁니다 —
  // 직함을 추측해 붙이지 마세요(아래 role 주석 참고).
  {
    id: "d1-hashed-greeting",
    day: 1,
    date: "08.22",
    category: "network",
    mode: "offline",
    timeOfDay: "PM",
    time: "2PM–2:10PM",
    title: { ko: "해시드 파트너 인사말", en: "A word from Hashed" },
    speaker: { ko: "김성호 (해시드)", en: "Sungho Kim (Hashed)" },
    speakerProfile: {
      name: { ko: "김성호", en: "Sungho Kim" },
      // 공개 프로필이 말하는 만큼만: 소속과 하는 일. 정확한 직함(파트너 등)은
      // 확인되면 여기에 넣으세요 — 추측해서 붙이지 않았습니다.
      role: { ko: "해시드 · 벤처 투자자 (싱가포르)", en: "Venture investor, Hashed (Singapore)" },
      img: "/partners/people/kim-sung-ho.jpg",
      bio: {
        ko: "Web3·AI 투자. AI 에이전트 인프라와 신뢰 구조, 아시아의 스테이블코인·크로스보더 결제를 봅니다. KAIST.",
        en: "Invests across Web3 and AI: agent infrastructure and trust in AI systems, plus stablecoins and cross-border payments in Asia. KAIST.",
      },
      linkedin: "https://www.linkedin.com/in/ryansunghokim/",
    },
    summary: {
      ko: "종합 지원 파트너 해시드의 인사말입니다. 구성·길이는 조율 중이에요.",
      en: "A greeting from Hashed, our overall supporting partner. Shape and length still being arranged.",
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
  //     ko: "문제가 공개되고 트랙을 고른 직후, 그 과제를 실제로 낸 코드프레소가 배경과 맥락을 직접 풀어주는 시간입니다. 왜 이게 현업에서 문제인지, 안에서는 지금 어떻게 처리하고 있는지, 이번 과제의 범위는 어디까지인지 — 문제 설명문만으로는 보이지 않는 부분을 짚고 질문을 받습니다. 이어지는 현장 브리핑 & Q&A가 진행 방식·팀 구성·평가 기준을 다룬다면, 이 시간은 과제 내용 자체를 다룹니다. 참가자 전원이 한자리에 모이는 다음 기회는 Day 5이므로, 맥락을 가장 깊게 가져갈 수 있는 자리이기도 합니다. 진행자와 형식(길이·구성)은 아직 조율 중이며, 확정되는 대로 안내합니다.",
  //     en: "Right after the problems drop and tracks are chosen, Codepresso, which actually set it, walks through the background and context first-hand: why this is a real problem inside the business, how it's handled today, and where the scope of this brief starts and ends — the parts a written problem statement doesn't show. Questions are taken on the spot. Where the on-site briefing & Q&A that follows covers how the eight days run, this session is about the problem itself. The next time everyone is in one room is Day 5, so this is the deepest context you can carry out of the room. Who runs it and in what format (length, structure) is still being arranged; we'll announce it once settled.",
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
    // 설명에서 뺀 것들 (2026-08-04) — 전부 같은 모달의 다른 자리가 이미 말합니다.
    // 지우기 전에 그 자리를 확인하고 옮기세요, 문장만 되살리지 말고:
    //   · "코드프레소가 주관 · 김지훈 이사님이 진행" → speaker · speakerProfile ·
    //     org 세 곳이 말하고 있었습니다(문단까지 네 번째)
    //   · "전 시간 참석 시 수료증, Day 8 PDF 발송" → opportunities 세 번째 항목
    //   · "집중 5–6시간 · 비개발자도 따라올 수 있게" → summary
    //   · "작동하는 프로토타입을 만드는 기본기" → opportunities 첫·둘째 항목
    // 남은 문단은 이 카드에서만 말하는 것뿐입니다: 왜 하루에 몰아서 하는지,
    // 라이브 빌드라는 진행 방식, 그리고 Codex 기준이되 툴은 자유라는 정책.
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
      ko: "집중 5–6시간의 바이브 코딩 입문. 비개발자도 OK · 코드프레소 김지훈 이사님 진행.",
      en: "A focused 5–6h vibe-coding intro. Non-developers welcome · led by Jihoon Kim of Codepresso.",
    },
    description: {
      // EDIT 2026-08-09: AI-티 감량(부정 대구·강조어·공식 어미) — 뜻은 불변
      ko: "참가자의 약 60%가 바이브 코딩이 처음이라, 여러 번 나누지 않고 하루에 몰아서 출발선을 맞춥니다. 슬라이드 대신, 강사가 간단한 툴 하나를 바이브 코딩으로 처음부터 만드는 라이브 빌드를 다 함께 따라갑니다. 기술 장벽을 여기서 걷어내고 아이디어만 한계로 남기려고요. 강의는 Codex를 기준으로 진행하되, 도구는 자유예요. 배우는 건 방식이라, 이후 팀 빌드와 공유회 결과물은 Claude Code든 커서든 손에 맞는 도구로 만들면 돼요.",
      en: "About 60% of participants are trying vibe coding for the first time, so the course runs in a single concentrated day. Instead of slides, the instructor vibe-codes one simple tool from scratch, live, and the room follows along, clearing the technical barrier so your ideas are the only limit left. The class runs on Codex, though the tool is up to you: what you take away is the method, and your own team build and Showcase work can run on Claude Code, Cursor or whatever fits your hand.",
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
        ko: "크래시코스 전 시간 참석 시 Zero100 명의 수료증 (Day 8에 PDF로 발송)",
        en: "Attend the full Crash Course and get a Zero100-issued certificate (sent as a PDF on Day 8).",
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
      // EDIT 2026-08-09: AI-티 감량(부정 대구·강조어·공식 어미) — 뜻은 불변
      ko: "팀이 스스로 방향을 설정하고 문제 해결에 착수하는 자율 빌드 시간입니다. 공개된 AX 과제를 어떻게 풀지 정하고, 첫 구현으로 들어갑니다. 정해진 시간도, 접속해야 할 곳도 없습니다. 운영진이 여는 세션 없이, 팀이 각자 편한 때에 진행하시면 돼요.",
      en: "Self-paced build time where teams set their own direction and start solving the problem, deciding how to tackle the released AX problem and moving into a first implementation. There is no set time and nothing to join. Nobody hosts this one: your team takes it whenever suits you.",
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
      ko: "아이디어에서 가장 뾰족한 지점을 찾고, 그걸 어떻게 증명할지까지 잡는 1:1입니다. 온라인이 기본이고, 멘토에 따라 한인회관 대면.",
      en: "A 1:1 to find the sharpest point in your idea, and to work out how you'll prove it. Online by default, in person at the Korean Association hall with some mentors.",
    },
    description: {
      // EDIT 2026-08-09: AI-티 감량(부정 대구·강조어·공식 어미) — 뜻은 불변
      // 멘토 포지셔닝 문장("정답을 주는 심사자가 아니라")은 유지, 배정 설명의
      // 부정 대구만 정리했습니다.
      // DECIDED 2026-08-09: 멘토링 Day 3–7 매일·예약제 확정. 웹에서 멘토↔날짜 매핑
      // 전면 제거(무대 세션 연사 공지는 예외) — 편향 방지. 그래서 "Day 5–7에는
      // 팝업스튜디오 FDE가…" 같은 누가-언제 문장이 "Day 7까지 매일"로 바뀌었습니다.
      // 예약 방식(전날 오픈 · 팀 단위 1시간)은 사이트에서 여기 한 곳에만 적습니다 —
      // 운영 시간대나 슬롯표 같은 숫자는 예약 시스템과 참가자 카톡방의 정보입니다.
      ko: "Day 3–6은 근거를 만드는 시간입니다. 범위도 방향도 아직 고칠 수 있는 구간이라, 멘토와 함께 아이디어에서 가장 뾰족한 지점을 찾아 그게 데모에서 제일 잘 드러나게 만듭니다. 멘토링 1단계로, 정해진 시간표 대신 팀의 필요에 맞춰 진행돼요. 멘토는 ‘정답을 주는 심사자’가 아니라 한때 우리와 같았던 유학생 출신 현직 대표입니다. 확정 멘토진은 멘토링 섹션에 있고, 슬롯은 가능 시간이 겹치는 구간을 기준으로 배정됩니다. 멘토링은 전날 예약이 열리고, 팀 단위로 1시간씩 신청해요. 멘토링은 Day 7까지 매일 이어집니다.",
      en: "Day 3–6 is where the evidence gets built. Scope and direction can still genuinely change, so this is when you and a mentor find the sharpest point in your idea and make sure that's what the demo shows. It's stage one of mentoring, following each team's needs instead of a fixed timetable. Mentors aren't answer-giving judges; they're Korean ex-international-student founders who were once in your shoes. The confirmed line-up is in the mentoring section, and slots land wherever your team's availability and a mentor's overlap. Booking opens the day before; teams book one-hour slots. Mentoring then runs every day through Day 7.",
    },
    location: MENTORING_MODE,
    checkpoints: SCORE_BUILDING_CHECKS,
    // 설명에서 "온라인 기본 / 한인회관 대면 가능"을 뺐습니다 (2026-08-04) —
    // 같은 모달의 '장소' 행이 MENTORING_MODE로 이미 그대로 말합니다. 사실이
    // 사라진 게 아니라 한 번만 말하게 한 것이고, 설명은 이 시간이 무엇을 위한
    // 시간인지에만 씁니다. 되돌려 문장을 다시 넣지 마세요.
    // TODO: confirm public naming — the confirmed individual mentors (김종현·황영준·
    // 이유택·신동혁·이화영·임석건·이동훈·황현진·정요천) are from the internal deck; verify
    // their names may be shown publicly before surfacing. Full roster lives in
    // dict.mentoring.mentors.
    // 멘토 수("기업 2곳 · 현직 시니어 9인")를 이 문장에서 뺐습니다 (2026-08-09).
    // 숫자는 사람이 하나 늘고 줄 때마다 여기서 손으로 세어야 하는 값이었고, 정작
    // 그 명단은 바로 아래 멘토링 섹션이 카드로 보여줍니다 — 세는 곳과 보여주는 곳이
    // 둘이면 반드시 갈라집니다. 다시 넣지 마세요.
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
      // EDIT 2026-08-09: AI-티 감량(부정 대구·강조어·공식 어미) — 뜻은 불변
      ko: "전날 잡은 방향 위에서 프로토타입을 빌드하고 완성도를 끌어올리는 자율 빌드 시간입니다. 핵심 흐름이 작동하게 만들고, 부족한 부분을 채워가며 공유회를 향한 토대를 다집니다. 정해진 시간도, 접속해야 할 곳도 없습니다.",
      en: "Self-paced build time to actually build the prototype and raise its completeness on top of the direction set the day before, getting the core flow working and filling the gaps that lay the foundation toward the Showcase. There is no set time and nothing to join.",
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
      ko: "프로토타입을 놓고 뾰족함과 증명 방법을 다시 조이는 1:1입니다. 온라인이 기본이고, 멘토에 따라 한인회관 대면.",
      en: "A 1:1 over the prototype, tightening what makes it sharp and how you'll prove it. Online by default, in person at the Korean Association hall with some mentors.",
    },
    description: {
      ko: "아직 근거를 만드는 구간(Day 3–6)의 두 번째 1:1입니다. 방향을 바꿀 수 있는 시간이 남아 있을 때, 팀이 만든 프로토타입을 놓고 무엇이 뾰족한지와 그걸 어떻게 증명할지를 다시 조입니다. 멘토링 1단계의 마무리이고, 멘토진과 배정 방식은 Day 3과 같습니다.",
      en: "The second 1:1 inside the score-building window (Day 3–6). While there is still time to change direction, you put the prototype on the table and tighten two things: what makes it sharp, and how you'll prove it. It closes out stage one of mentoring; the mentors and how slots are assigned are the same as Day 3.",
    },
    location: MENTORING_MODE,
    checkpoints: SCORE_BUILDING_CHECKS,
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
      ko: "*SCAPE 현장 · 전원이 처음으로 한자리에 모이는 날입니다. 학생 간 네트워킹에 초점을 맞춘 프로그램을 해시드(Hashed)와 함께 기획하고 있고, 확정되는 대로 공개해요.",
      en: "On-site at *SCAPE · the first day the whole cohort is in one room. We're designing a programme built around student-to-student networking together with Hashed, and we'll share it as soon as it's settled.",
    },
    description: {
      // EDIT 2026-08-09: AI-티 감량(부정 대구·강조어·공식 어미) — 뜻은 불변
      // 마지막 줄 (DECIDED 2026-08-09): 1:1 멘토링은 Day 3–7 닷새 매일 열립니다.
      // 현장 일정이 있는 날이라 "오늘은 멘토링이 없는 날"로 읽히기 쉬워서, 이 날
      // 카드에도 한 줄로 적습니다. 누가 오는지는 적지 않습니다 — 멘토↔날짜 매핑 금지.
      ko: "온라인으로 이어지던 8일 중, 전원이 처음으로 *SCAPE L^IFE Jungle에 모이는 날입니다(10AM–2PM). 이날의 목적은 사람을 만나는 것 하나입니다. 화면 너머로만 함께 빌드하던 동료를 직접 만나고, 다른 트랙에서 같은 8일을 풀고 있는 팀들과 섞이는 자리예요. 시간과 장소는 확정됐고, 세부 프로그램은 학생 간 네트워킹에 초점을 맞춰 해시드(Hashed)와 함께 설계하는 중이고, 정해지는 대로 이 페이지에 올립니다. 참여는 선택이에요(필참은 Day 1·8뿐). 같은 기간 열리는 팝업스튜디오 FDE 온라인 오피스아워는 별개 트랙이라, 빌드를 점검받고 싶은 팀은 따로 드롭인하면 됩니다. 이날도 1:1 멘토링은 열려 있어요. 현장 일정이 끝난 오후부터, 팀이 예약한 시간에.",
      en: "The first day everyone gathers in person at *SCAPE L^IFE Jungle after a week that ran online, 10AM–2PM. The whole point of the day is meeting people: the teammates you'd only built alongside on-screen, and the teams working the same eight days in another track. The time and the venue are set; what we're still designing, together with Hashed, is the programme itself, built around student-to-student networking, and it goes up here once it's settled. Attending is your choice (only Day 1 and Day 8 are required). Popup Studio's online FDE office hours run over the same stretch but are a separate track, so drop in there if your team wants a read on the build. 1:1 mentoring stays open today too, from the afternoon after the on-site programme, at whatever slot your team booked.",
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
      ko: "정해진 세션이 없는 날입니다. 팀별로 편한 시간에 빌드를 이어갑니다.",
      en: "No scheduled sessions. Teams keep building whenever suits them.",
    },
    description: {
      // EDIT 2026-08-09: AI-티 감량(부정 대구·강조어·공식 어미) — 뜻은 불변
      // 오피스아워에서 날짜("Day 5–7에는")를 뺐습니다 (DECIDED 2026-08-09).
      // 1:1 멘토링 줄은 여기가 아니라 days[5].summary에 있습니다 — 이 이벤트는
      // selfPaced라 세션 목록에서 숨겨져서, 여기 적으면 읽히지 않습니다.
      ko: "정해진 세션이 하나도 없는 자율 빌드 데이입니다. 출석 개념이 없고 접속해야 할 곳도 없습니다. 각 팀이 편한 시간·장소에서 자기 페이스로 프로덕트를 완성해 갑니다. 하루를 팀이 원하는 대로 쓸 수 있다는 뜻이에요. 하루 종일 붙어 있으실 필요는 없습니다. 팝업스튜디오 FDE의 온라인 오피스아워가 열려 있어, 필요한 팀은 문제 정의·워크플로·구현 방향을 점검받을 수 있습니다(시간대는 추후 안내).",
      en: "An open build day with no scheduled sessions at all. There's no attendance and nothing to join: each team pushes its product toward completion at its own pace, whenever and wherever suits them. The day is yours to use as the team wants, and nobody expects you glued to it from morning to night. Popup Studio's FDE office hours run online, so any team that wants a check on its problem definition, workflow or implementation direction can take one (times to be announced).",
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
      ko: "이미 만든 것을 발표와 Q&A 안에서 증명하도록, 멘토와 함께하는 마지막 점검.",
      en: "Making what you already built stand up in the pitch and the Q&A. The last check, with mentors.",
    },
    description: {
      // EDIT 2026-08-09: AI-티 감량(부정 대구·강조어·공식 어미) — 뜻은 불변
      // 마지막 줄 (DECIDED 2026-08-09): 예약제 1:1이 열려 있는 마지막 날입니다.
      // 이 카드가 말하는 현장 최종 점검(9:10–11:30)과는 다른 트랙이라 따로 적습니다.
      ko: "Day 7은 사전 제출물 마감 당일입니다. 새 기능이나 방향 전환은 여기서 멈추고, 이미 만든 결과를 발표와 이어지는 Q&A 안에서 명확히 증명하는 데 시간을 씁니다. 오늘 지켜야 할 건 이미 손에 있는 것들이에요. 멘토와 함께 무엇을 보는지는 아래 목록에 있습니다(무엇을 내는지는 이 날 카드의 제출물 안내를 보세요). AWS 오피스에서 열리며, Day 5에 이은 두 번째 현장 집결입니다. 팝업스튜디오 FDE의 온라인 오피스아워도 오늘까지 이어집니다. 저녁까지 1:1 멘토링이 열려 있는 마지막 날이에요. 제출 전 마지막 점검에 쓰세요.",
      en: "Day 7 is the submission deadline. New features and changes of direction stop here; the time goes into proving what you already built, making it stand up inside the pitch and the Q&A that follows. The session protects what's already in your hands. What you go through with a mentor is listed below (what the package contains is in this day's submission box). It runs at the AWS office, the second in-person gathering after Day 5, and Popup Studio's online FDE office hours run through today too. It's the last day 1:1 mentoring is open, into the evening. Use it for a final check before the submission closes.",
    },
    location: AWS_OFFICE,
    checkpoints: SCORE_KEEPING_CHECKS,
  },
  {
    id: "d7-speaker-session",
    day: 7,
    date: "08.28",
    category: "network",
    mode: "offline",
    timeOfDay: "PM",
    // 2PM이 아니라 1:40PM입니다 — 뒤 20분은 간담회가 아니라 기념촬영·단체 사진이고,
    // 그 줄은 runOfShow에 따로 있습니다 (2026-08-04). 이 세션 카드가 말하는 시각은
    // 간담회 자체의 길이여야 합니다.
    time: "12:30PM–1:40PM",
    // TODO: confirm public naming — speaker (박희덕) from the internal deck.
    speaker: { ko: "박희덕", en: "Park Hee-deok" },
    title: { ko: "커리어 간담회 · ‘FDE로 일한다는 것’", en: "Career Session · “Working as an FDE”" },
    // 시각은 `time`이 갖습니다 — 요약과 설명 앞머리에 박혀 있던 "12:30–14:00"을
    // 뺐습니다. 같은 정보가 세 군데 있으면 하나가 바뀔 때 나머지가 어긋납니다.
    summary: {
      ko: "박희덕 대표님의 ‘FDE로 일한다는 것’. FDE 사업에 관심 있는 학생·졸업생 대상입니다.",
      en: "Park Hee-deok on “Working as an FDE”, for students & grads interested in the FDE business.",
    },
    description: {
      ko: "파이널 리허설 일정의 마무리로 마련된 커리어 간담회입니다. 트랜스링크 인베스트먼트의 박희덕 대표님이 ‘FDE로 일한다는 것’을 주제로, 자사 FDE 사업에 관심 있는 학생·졸업생에게 어떤 일을 하는 자리인지, 어떤 사람을 찾는지를 직접 이야기하며, 인턴·채용 pool로 이어지는 실질적 연결의 시간입니다. 간담회 후속 1:1 면담·멘토링(희망자)은 8/29 행사 종료(3PM) 후 현장 또는 널담에서 진행됩니다.",
      en: "A career session closing out the final-rehearsal day. Under the theme “Working as an FDE,” Park Hee-deok (CEO · General Partner, Translink Investment) talks directly with students and graduates interested in the firm's FDE business: what the work actually is and who they're looking for, and a genuine connection into the internship and hiring pool. Follow-up 1:1 conversations and mentoring (for those who want them) run after the event closes on 29 Aug (3PM), either on-site or at Nuldam.",
    },
    location: AWS_OFFICE,
  },
  // Stage-2 mentoring, one entry per day (see FDE_OFFICE_HOUR above).
  // Day 7만 점검 목록이 다릅니다 — 제출 마감 당일이라 범위를 다시 좁히는 날이
  // 아니라 이미 만든 것을 증명하는 날입니다. 상수의 SCORE_BUILDING_CHECKS를
  // 여기서 SCORE_KEEPING_CHECKS로 덮습니다. 지우지 마세요.
  { ...FDE_OFFICE_HOUR, id: "d7-fde-office-hour", day: 7, date: "08.28", checkpoints: SCORE_KEEPING_CHECKS },

  // ─── DAY 8 · Showcase · Final Presentations (08.29 · OFFLINE) ────────────────
  // DECIDED 2026-08-05 (파트너 피드백): 경쟁형 데모데이 → 결과 공유회. 순위형 시상
  // 폐지·테마형 어워드(부문 pending)·인턴십 전원 개방. 세 이벤트의 id는 그대로
  // 둡니다(d8-opening-keynote · d8-judging · d8-final-pitch) — 이 파일에는 이미
  // "id로 위치를 짐작하지 말라"는 선례가 있고, 바뀐 것은 카피뿐입니다.
  {
    // ⚠️ id가 "d8-OPENING-keynote"지만 더 이상 여는 순서가 아닙니다 — 확정된 진행
    // 순서에서 이 키노트는 두 트랙 발표가 모두 끝난 뒤(1:50PM), 어워드 발표 직전에
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
      ko: "모든 발표가 끝난 뒤, 어워드 발표 직전 40분, ‘제로백의 진짜 의미’.",
      en: "After every pitch, 40 minutes before the awards: ‘The Real Meaning of Zero100’.",
    },
    description: {
      ko: "두 트랙의 발표가 모두 끝나고 어워드 발표를 앞둔 40분, 트랜스링크 인베스트먼트의 박희덕 대표님이 ‘제로백의 진짜 의미’를 주제로 이야기합니다. 창업가가 0에서 100으로 가기 위한 핵심 요소, 즉 협업·가치·실행·글로벌 스탠다드의 중요성과 협업의 힘, 그리고 왜 지금, 왜 싱가포르의 한인 학생인지. 8일을 막 끝낸 사람들에게, 오늘이 무엇의 시작인지를 짚어줍니다.",
      // EDIT 2026-08-09: AI-티 감량(부정 대구·강조어·공식 어미) — 뜻은 불변
      en: "With both tracks done pitching and the awards still ahead, Park Hee-deok (CEO · General Partner, Translink Investment) takes 40 minutes on ‘The Real Meaning of Zero100’ and what actually carries a founder from zero to a hundred: collaboration, value, execution, global standards, and why now, why Korean students in Singapore. Spoken to people who have just finished the eight days, about what today is the start of.",
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
    title: { ko: "공유회 발표 · 전문가 피드백", en: "Showcase Presentations · Expert Feedback" },
    // 발표 길이는 "팀당 8분"입니다. 참가자가 잘못된 길이로 준비해 오면 현장에서
    // 그대로 사고가 나는 종류의 숫자라, 이 값이 나오는 모든 곳을 함께 고쳤습니다.
    //
    // ⚠️ 아직 잠정입니다 (2026-08-04) — 바뀔 수 있어서 표기마다 "잠정"을 답니다.
    // 8분 안에서 발표와 Q&A를 어떻게 나눌지는 미확정이라, 이제 웹에는 총량만
    // 적습니다 (EDIT 2026-08-10). 확정 전 세부 배분을 적으면 잠정 숫자 위에 또
    // 잠정 숫자가 얹혀 사고 위험만 커집니다.
    // 숫자가 사는 곳은 Day 8 세 군데뿐입니다: days[7].summary · 두 트랙 발표 슬롯이
    // 공유하는 D8_TRACK_PITCH_NOTE · 이 카드의 summary와 description. 확정되면 이
    // 셋과 헤지를 함께 고치세요. (2026-08-05 결과 공유회 전환으로 "심사"가
    // "피드백"이 됐을 뿐, 8분이라는 잠정 숫자와 그 헤지는 그대로입니다.)
    // Day 7 멘토링 카피에서는 숫자를 일부러 뺐습니다("발표와 Q&A") — 그쪽까지
    // 숫자를 퍼뜨리면 바뀔 때마다 다섯 곳을 쫓아다녀야 합니다.
    // 길이 정리 (2026-08-05). 일곱 문장이던 description을 넷으로 줄였습니다. 덜어낸
    // 것은 전부 이 모달 안에서 이미 다른 줄이 말하고 있던 내용입니다:
    //   · "발표 순서는 이날 아침 오픈 카톡방으로…" → runOfShow 첫 줄(입장)의 note
    //   · "(트랙마다 약 1시간 20분)" → runOfShow의 11:10–12:30 / 12:30–1:50이 보여줌
    //   · "남아서 다른 트랙을 봐도 좋고 자리를 지킬 의무는 없어요"
    //      → 앞 문장 "그 외 시간은 자유롭게"와 같은 말
    //   · "Day 3·4 기초 멘토링은 피드백 패널에 서지 않는 선배들이…"
    //      → dict.mentoring.separationNote가 멘토링 섹션에서 말하는 주장
    // 남긴 넷: 이게 무슨 자리인가 · 형식(8분·잠정) · 오고 갈 자유 · 누가 어떤
    // 성격의 피드백을 주는가. 덜어낸 문장을 여기로 되돌리지 마세요.
    summary: {
      ko: "문제를 낸 코드프레소와 업계 전문가 앞에서 팀당 8분(잠정).",
      en: "Eight minutes per team (provisional) in front of Codepresso, who set the problem, and industry experts.",
    },
    description: {
      ko: "8일의 마지막이자, 문제를 낸 코드프레소와 업계 전문가 앞에서 ‘내 아이디어가 돌아간다’를 검증받는 자리입니다. 같은 공간에서 트랙별로 순차 진행하며, 팀당 8분입니다(잠정). 발표와 Q&A를 어떻게 나눌지는 확정되는 대로 안내합니다. 자기 트랙 발표에는 참석하시고, 그 외 시간은 자유롭게 쓰셔도 됩니다. 피드백은 실제 산업에서 문제를 풀어온 현업 리더들이 맡습니다. 순위를 가리는 대신, 각 팀 결과물에 전문적인 시각과 다음 가능성을 제안합니다.",
      // EDIT 2026-08-09: AI-티 감량(부정 대구·강조어·공식 어미) — 뜻은 불변
      en: "The end of the eight days, and the moment your idea gets validated in front of Codepresso, who set the problem, and industry experts. Tracks run in sequence in one space, eight minutes per team (provisional); we'll confirm how that splits between the presentation and Q&A once it's settled. Attend your own track's presentations; the rest of the time is yours. The feedback comes from working leaders who have solved real problems in industry. Instead of ranking the teams, each one gets an expert read on its work and a sense of what could come next.",
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
    title: { ko: "어워드 · 클로징", en: "Awards & Closing" },
    summary: {
      ko: "테마별 어워드 발표 · 사진 → 앞으로의 안내 → 완주 수료증과 함께 단체 사진.",
      en: "Thematic awards and photos → what comes next → a group photo with your completion certificate.",
    },
    // DECIDED 2026-08-06: 테마형 어워드 4부문 확정(비욘드 브리프·비즈니스 포텐셜·빌더스
    // 초이스·0→100). 이름은 포멀·설명은 유머 원칙. 금액 확정 S$100/75/50 —
    // 헤지("확정되는 대로 안내"·"규모 확정 전") 제거.
    //
    // 부문 헤지가 살던 세 곳 중 하나였습니다 — 나머지는 dict.benefits 06 카드와
    // FAQ 상금 답변이고, 셋 다 같은 날 확정 내용으로 갈아끼웠습니다.
    //
    // 이 절은 부문을 나열하지 않습니다. 부문별 설명은 Day 8 데이 모달의 어워드
    // 박스(dict.program.awards) 한 곳에 있고, 여기는 "4개 부문"이라는 사실과
    // 그리로 가는 길만 말합니다. 금액은 어디에도 쓰지 않습니다 — 확정은 됐지만
    // 공개를 보류한 상태라(WITHHELD 2026-08-07, 같은 주석 참고) "추후 안내"류의
    // 헤지도 붙이지 않습니다. runOfShow 라벨과 summary는 그대로 둡니다.
    description: {
      ko: "8일간의 빌드를 마무리하는 30분입니다. 두 트랙 발표와 박희덕 대표님의 이야기가 끝나면 테마별 어워드 발표와 사진 촬영이 이어집니다(2:30~). 어워드는 순위 대신 각 팀의 강점을 조명하는 4개 부문이고, 어떤 부문이 있고 누가 뽑는지는 이 날 카드에 정리돼 있습니다. 이어서 앞으로 무엇이 남아 있는지를 짧게 안내합니다(2:45~). 마지막 2:50에는 완주 수료증을 손에 들고 다 함께 단체 사진을 찍으며 끝나요. 완주 수료증은 공유회 발표까지 마친 분들께 이 자리에서 실물로 드리고, 크래시코스 수료증은 크래시코스 전 시간을 참석한 분들께 이날 PDF로 발송됩니다. 전원이 *SCAPE L^IFE Jungle 현장에 모여, ‘데모로 끝나지 않는 성공의 경험’으로 8일을 함께 마칩니다.",
      // EDIT 2026-08-09: AI-티 감량(부정 대구·강조어·공식 어미) — 뜻은 불변
      en: "Thirty minutes to close out eight days of building. Once both tracks have presented and Park Hee-deok has spoken, the thematic awards are announced with photos (from 2:30). They're four categories that spotlight each team's strengths instead of ranking 1st to 3rd, and what each one looks for is laid out on this day's card. Then comes a short word on what comes next (from 2:45). At 2:50 everyone gathers for a group photo, completion certificate in hand. That one is printed and handed to you here for going all the way through your Showcase pitch, while the Crash Course certificate goes out the same day as a PDF to everyone who attended the full Crash Course. The whole cohort is at *SCAPE L^IFE Jungle to finish the eight days on a success that goes beyond a demo.",
    },
    location: ONSITE,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// 노선도와 데이 카드가 함께 읽는 파생값 (2026-08-10)
//
// 두 표면이 같은 사실을 그리는데 판정을 각자 하고 있었습니다. 노선도는
// Journey.tsx 안에서 `d.mandatory === true` / `!anchor && d.spotlight === true`를
// 직접 계산했고, 데이 카드는 `day.mandatory` 하나만 보느라 스포트라이트 층이
// 아예 없었습니다. 그래서 노선도가 ◉로 강조하는 Day 5·7이 카드에서는 나머지
// 선택일과 구분되지 않았습니다.
//
// 판정을 여기 한 곳으로 올립니다. 두 표면 모두 아래 두 함수에서만 도출하고,
// 어느 쪽에서도 날짜를 손으로 적지 마세요 — spotlight 하나만 뒤집으면 노드와
// 카드 배지가 같이 따라와야 합니다.
// ─────────────────────────────────────────────────────────────────────────────

// 정거장의 층. 노선도 노드 모양(★ / ◉ / ○)과 카드 배지가 같은 값에서 나옵니다.
//   must     — 필참 (rose · ★).       와야 하는 날.
//   worth    — 놓치면 아까운 (violet · ◉). 선택이지만 혼자서는 못 얻는 날.
//   optional — 선택 (중립 · ○).
// 층은 셋뿐입니다. 넷째를 만들지 마세요 — DayMeta.spotlight 주석의 결정입니다.
export type DayEmphasis = "must" | "worth" | "optional";

// mandatory가 spotlight를 이깁니다. 지금 둘 다 참인 날은 없지만, 우선순위를
// 코드에 남겨 둡니다 — 한 정거장이 두 가지로 그려질 일은 없어야 합니다.
export const dayEmphasis = (d: DayMeta): DayEmphasis =>
  d.mandatory === true ? "must" : d.spotlight === true ? "worth" : "optional";

// 멘토링이 열리는 날. 노선도의 에메랄드 점 마커, 그 아래 필의 "Day 3~7", 그리고
// 데이 카드의 "● 1:1 멘토링" 칩이 전부 여기서 나옵니다.
//
// 스케줄에서 세는 이유는 하나입니다: 멘토링 기간이 바뀌면(하루 늘거나, 앞당겨
// 시작하거나) 세 표면이 저절로 따라오게 하려고요. 손으로 적어둔 3·4·5·6·7은
// 반드시 스케줄과 어긋나는 날이 옵니다.
//
// 출처는 category === "mentoring" 이벤트입니다 — 지금은 Day 3·4의 1:1 예약제와
// Day 5–7의 FDE 오피스아워(드롭인)입니다. 두 트랙을 나누지 않고 한 덩어리로
// 세는 것은 참가자 입장에서 "오늘 도움을 받을 수 있는가"가 같은 질문이기
// 때문입니다(FDE_OFFICE_HOUR 주석의 결정과 같은 이유).
// day > 0: 사전 세션(day 0)은 8일 노선도 밖이라 셈에서 뺍니다.
export const MENTORING_DAYS: ReadonlySet<number> = new Set(
  schedule.filter((e) => e.category === "mentoring" && e.day > 0).map((e) => e.day),
);

export const mentoringOpenOn = (day: number) => MENTORING_DAYS.has(day);

// 필 문구의 "Day {from}~{to}"가 읽는 값. 구간이 비는 일은 없지만(멘토링 없는
// 빌더톤은 없습니다), Math.min(...[])이 Infinity를 내므로 빈 셋이면 null입니다.
export const MENTORING_DAY_RANGE =
  MENTORING_DAYS.size > 0
    ? { from: Math.min(...MENTORING_DAYS), to: Math.max(...MENTORING_DAYS) }
    : null;
