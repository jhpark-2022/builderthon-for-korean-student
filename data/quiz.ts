// ─────────────────────────────────────────────────────────────────────────────
// "당신의 AI 모델은?" — viral personality test data.
// Source of truth: AI_성격테스트_기획서.md (12 questions · 16 MBTI×AI models ·
// A/T variants · scoring map). Every string is bilingual { ko, en } like the
// rest of the site (see data/dictionary.ts). Pure data only — scoring lives in
// lib/quizScore.ts, group matching in lib/groupMatch.ts.
// ─────────────────────────────────────────────────────────────────────────────

import type { Phrase } from "@/data/dictionary";

// ── Personality axes ─────────────────────────────────────────────────────────
// Four MBTI axes + a 5th "Identity" axis (A/T) that picks the model's variant.
// Poles are stored as score-bucket keys; "Tid" is the Identity-Turbulent pole,
// kept distinct from Nature's "T" (Thinking) so they never collide in scoring.
export type Pole = "E" | "I" | "N" | "S" | "T" | "F" | "J" | "P" | "A" | "Tid";
export type Axis = "MIND" | "ENERGY" | "NATURE" | "TACTICS" | "IDENTITY";

export interface Question {
  id: string;
  axis: Axis;
  w: number; // weight (2 or 1) — odd per-axis totals guarantee no ties
  text: Phrase;
  a: { label: Phrase; pole: Pole };
  b: { label: Phrase; pole: Pole };
}

// 12 questions · MZ tone · order preserved from the brief (§6).
export const QUESTIONS: Question[] = [
  {
    id: "Q1", axis: "MIND", w: 2,
    text: { ko: "빌더톤 첫날, 처음 보는 팀원들과 한 방에 모였다. 나는?", en: "Day 1 of the builderthon, in a room full of strangers. I…" },
    a: { label: { ko: "먼저 “어디 학교세요?” 분위기 띄운다", en: "Break the ice first — “which school are you at?”" }, pole: "E" },
    b: { label: { ko: "일단 관찰하다 자연스러워지면 낀다", en: "Hang back, read the room, then ease in" }, pole: "I" },
  },
  {
    id: "Q2", axis: "ENERGY", w: 1,
    text: { ko: "주제가 ‘AI로 세상을 바꿀 아이디어’로 정해졌다. 머릿속은?", en: "The theme is “an AI idea that changes the world.” My head goes to…" },
    a: { label: { ko: "“10년 뒤엔 이게 어떻게 될까?” 큰 그림부터", en: "“Where is this in 10 years?” — the big picture" }, pole: "N" },
    b: { label: { ko: "“지금 당장 뭘 만들 수 있지?” 현실부터", en: "“What can we ship right now?” — the concrete" }, pole: "S" },
  },
  {
    id: "Q3", axis: "NATURE", w: 1,
    text: { ko: "팀원 아이디어가 좀 별로다. 나는?", en: "A teammate's idea is… kind of weak. I…" },
    a: { label: { ko: "“이 부분 논리적으로 약한데?” 솔직하게 짚음", en: "“This part doesn't hold up” — say it straight" }, pole: "T" },
    b: { label: { ko: "“오 좋다! 근데 이건 어때?” 기분 안 상하게", en: "“Love it! but what about this?” — keep it kind" }, pole: "F" },
  },
  {
    id: "Q4", axis: "TACTICS", w: 2,
    text: { ko: "데드라인까지 48시간. 내 작업 스타일은?", en: "48 hours to the deadline. My work style is…" },
    a: { label: { ko: "시간표부터 짜고 계획대로", en: "Map the schedule, then run the plan" }, pole: "J" },
    b: { label: { ko: "일단 만들면서 흐름 타기", en: "Start building and ride the flow" }, pole: "P" },
  },
  {
    id: "Q5", axis: "IDENTITY", w: 2,
    text: { ko: "발표 직전, 데모가 갑자기 안 돈다. 멘탈은?", en: "Right before the pitch, the demo breaks. My headspace…" },
    a: { label: { ko: "“어떻게든 되겠지” 침착", en: "“We'll figure it out” — stay calm" }, pole: "A" },
    b: { label: { ko: "“망했다…” 심장 쿵", en: "“We're done…” — heart drops" }, pole: "Tid" },
  },
  {
    id: "Q6", axis: "MIND", w: 1,
    text: { ko: "쉬는 시간, 에너지 충전법은?", en: "On a break, I recharge by…" },
    a: { label: { ko: "사람들이랑 수다 떨기", en: "Chatting with people" }, pole: "E" },
    b: { label: { ko: "혼자 바람 쐬기", en: "Stepping out alone for air" }, pole: "I" },
  },
  {
    id: "Q7", axis: "ENERGY", w: 1,
    text: { ko: "멘토가 “이거 왜 만들었어요?” 묻는다. 내 대답은?", en: "A mentor asks “why did you build this?” I answer with…" },
    a: { label: { ko: "비전·의미·가능성으로", en: "Vision, meaning, what it could become" }, pole: "N" },
    b: { label: { ko: "구체적 데이터·사례로", en: "Concrete data and examples" }, pole: "S" },
  },
  {
    id: "Q8", axis: "NATURE", w: 1,
    text: { ko: "팀 내 의견 충돌. 내 기준은?", en: "The team clashes on a call. My yardstick is…" },
    a: { label: { ko: "뭐가 더 효율적·합리적인가", en: "What's more efficient and rational" }, pole: "T" },
    b: { label: { ko: "다들 납득하고 기분 좋은가", en: "Whether everyone's on board and okay" }, pole: "F" },
  },
  {
    id: "Q9", axis: "TACTICS", w: 1,
    text: { ko: "마감 12시간 전, 더 좋은 아이디어가 떠올랐다.", en: "12 hours out, a better idea hits me." },
    a: { label: { ko: "위험해, 원래 계획 고수", en: "Too risky — stick to the plan" }, pole: "J" },
    b: { label: { ko: "가보자고, 갈아엎기", en: "Let's go — tear it up and rebuild" }, pole: "P" },
  },
  {
    id: "Q10", axis: "IDENTITY", w: 1,
    text: { ko: "결과 발표, 우리 팀은 입상 못 했다. 집 가는 길의 나는?", en: "Results are in — we didn't place. On the way home I…" },
    a: { label: { ko: "“잘했으니 됐지, 다음에 또” 툭툭 털기", en: "“We did well, next time” — shake it off" }, pole: "A" },
    b: { label: { ko: "“그때 그것만 고쳤어도…” 곱씹기", en: "“If only we'd fixed that…” — replay it" }, pole: "Tid" },
  },
  {
    id: "Q11", axis: "ENERGY", w: 1,
    text: { ko: "새 AI 툴을 받았다. 나는?", en: "I get my hands on a new AI tool. I…" },
    a: { label: { ko: "“이걸로 뭘 할 수 있을지” 상상부터 부풀림", en: "Dream up everything it could do" }, pole: "N" },
    b: { label: { ko: "“이게 정확히 뭐 하는 건지” 스펙부터 확인", en: "Check exactly what it does, spec by spec" }, pole: "S" },
  },
  {
    id: "Q12", axis: "NATURE", w: 1,
    text: { ko: "팀원이 밤새다 멘붕왔다. 첫 반응은?", en: "A teammate hits a wall after an all-nighter. My first move…" },
    a: { label: { ko: "“어디서 막혔어? 같이 해결하자” 문제부터", en: "“Where are you stuck? let's solve it” — the problem" }, pole: "T" },
    b: { label: { ko: "“괜찮아? 좀 쉬어, 내가 도울게” 다독임부터", en: "“You okay? rest — I've got you” — the person" }, pole: "F" },
  },
];

// ── Builder role buckets ───────────────────────────────────────────────────
// Each result maps to ONE of four builderthon roles. Used by the group matcher
// to tell a solo builder what they bring and what their squad still needs.
export type RoleKey = "plan" | "dev" | "design" | "growth";

export interface Role {
  key: RoleKey;
  emoji: string;
  label: Phrase;
  blurb: Phrase;
  // Literal Tailwind gradient classes (kept whole so the JIT compiler keeps them).
  accent: string;
}

export const ROLES: Record<RoleKey, Role> = {
  plan: {
    key: "plan", emoji: "🧭",
    label: { ko: "기획 · 전략", en: "Strategy" },
    blurb: { ko: "방향을 잡고 판을 짠다", en: "Sets the direction and frames the bet" },
    accent: "from-violet-500 to-indigo-500",
  },
  dev: {
    key: "dev", emoji: "⚙️",
    label: { ko: "개발", en: "Engineering" },
    blurb: { ko: "아이디어를 작동하는 제품으로", en: "Turns the idea into a working product" },
    accent: "from-cyan-500 to-blue-500",
  },
  design: {
    key: "design", emoji: "🎨",
    label: { ko: "디자인 · 스토리", en: "Design & Story" },
    blurb: { ko: "보이고 느껴지는 모든 것", en: "How it looks, reads, and feels" },
    accent: "from-fuchsia-500 to-violet-500",
  },
  growth: {
    key: "growth", emoji: "🚀",
    label: { ko: "마케팅 · 그로스", en: "Growth & Stage" },
    blurb: { ko: "세상에 알리고 무대에 올린다", en: "Gets it seen and onto the stage" },
    accent: "from-amber-400 to-orange-500",
  },
};

// ── Matching squads ──────────────────────────────────────────────────────────
// Solo builders get deterministically assigned to one of these (see lib/groupMatch).
// Names/vibes only — the squad is a recommended cohort, not a fixed roster.
export interface Squad {
  id: string;
  name: Phrase;
  vibe: Phrase;
  accent: string; // literal Tailwind gradient classes
}

export const SQUADS: Squad[] = [
  { id: "aurora",  name: { ko: "오로라", en: "Aurora" },   vibe: { ko: "새벽까지 빛나는 빌더들", en: "Builders who glow till dawn" },              accent: "from-violet-500 to-fuchsia-500" },
  { id: "quasar",  name: { ko: "퀘이사", en: "Quasar" },   vibe: { ko: "가장 밝게 터지는 아이디어", en: "The brightest idea in the room" },           accent: "from-fuchsia-500 to-rose-500" },
  { id: "monsoon", name: { ko: "몬순", en: "Monsoon" },     vibe: { ko: "폭발적으로 몰아치는 실행력", en: "Execution that comes in waves" },           accent: "from-cyan-500 to-blue-500" },
  { id: "merlion", name: { ko: "머라이언", en: "Merlion" }, vibe: { ko: "싱가포르의 상징처럼 대담하게", en: "Bold, like Singapore's own icon" },          accent: "from-amber-400 to-orange-500" },
  { id: "circuit", name: { ko: "서킷", en: "Circuit" },     vibe: { ko: "끊김 없이 연결되는 팀워크", en: "Teamwork with no broken connections" },       accent: "from-emerald-400 to-cyan-500" },
  { id: "equator", name: { ko: "적도", en: "Equator" },     vibe: { ko: "뜨겁게 달아오르는 6일", en: "Six days at full heat" },                       accent: "from-indigo-500 to-violet-500" },
];

// ── 16 results (MBTI → AI model) ──────────────────────────────────────────────
export type MbtiKey =
  | "INTJ" | "INTP" | "ENTJ" | "ENTP"
  | "INFJ" | "INFP" | "ENFJ" | "ENFP"
  | "ISTJ" | "ISFJ" | "ESTJ" | "ESFJ"
  | "ISTP" | "ISFP" | "ESTP" | "ESFP";

export type Identity = "A" | "T";

export interface Variant {
  name: Phrase; // e.g. "흔들림 없는 Claude" / "Unshakeable Claude"
  line: Phrase; // one-line flavor for this A/T variant
}

export interface Result {
  mbti: MbtiKey;
  model: string;        // brand name, shown as-is in both locales
  emoji: string;        // fallback glyph when the brand logo can't load
  logo: string;         // Simple Icons slug ("" = emoji only)
  role: Phrase;         // the brief's recommended builderthon role (display)
  roleKey: RoleKey;     // bucket for group matching
  match: MbtiKey[];     // 2 best-fit teammate types
  phrase: Phrase;       // catchphrase
  desc: Phrase;         // 2–3 line character description
  strengths: Phrase;
  weakness: Phrase;
  accent: string;       // literal Tailwind gradient classes for the avatar
  variants: Record<Identity, Variant>;
}

export const RESULTS: Record<MbtiKey, Result> = {
  INTJ: {
    mbti: "INTJ", model: "DeepSeek", emoji: "🐋", logo: "deepseek",
    role: { ko: "아키텍트 · 전략 리드", en: "Architect · Strategy lead" }, roleKey: "plan",
    match: ["ENFP", "ENTP"],
    phrase: { ko: "말은 아끼지만, 계획은 다 있음.", en: "Says little — but has the whole plan." },
    desc: { ko: "조용한 효율의 마스터마인드. 떠들지 않고 결과로 증명하는 장기 비전형 전략가예요.", en: "A quiet mastermind of efficiency — a long-view strategist who proves it with results, not noise." },
    strengths: { ko: "적은 자원으로 최대 효율, 한 수 앞서는 큰 그림", en: "Max output from minimal resources, always a move ahead" },
    weakness: { ko: "너무 과묵해서 무슨 생각인지 알기 어려움", en: "So reserved no one knows what they're thinking" },
    accent: "from-violet-500 to-indigo-500",
    variants: {
      A: { name: { ko: "강철 멘탈 DeepSeek", en: "Steel-nerved DeepSeek" }, line: { ko: "계획 세웠으면 흔들림 없이 밀어붙여요.", en: "Once the plan is set, they push without flinching." } },
      T: { name: { ko: "완벽주의 DeepSeek", en: "Perfectionist DeepSeek" }, line: { ko: "1등 해도 “더 효율적일 수 있었는데”를 곱씹어요.", en: "Even after winning, they replay “could've been tighter.”" } },
    },
  },
  INTP: {
    mbti: "INTP", model: "ChatGPT o1", emoji: "🧠", logo: "openai",
    role: { ko: "코어 로직 · 알고리즘", en: "Core logic · Algorithms" }, roleKey: "dev",
    match: ["ENTJ", "ENFJ"],
    phrase: { ko: "사회성은 베타, 사고력은 정식 출시.", en: "Social skills in beta, reasoning fully shipped." },
    desc: { ko: "“왜?”에 꽂혀 끝까지 파고드는 사색가. 답보다 사고 과정 자체를 즐겨요.", en: "A thinker hooked on “why,” chasing it to the end — they enjoy the reasoning more than the answer." },
    strengths: { ko: "복잡한 문제를 단계별로 깊게 해체", en: "Breaks hard problems down, step by deep step" },
    weakness: { ko: "생각이 길어 답이 느림 (3초면 될 걸 30초)", en: "Thinks so long the answer lags" },
    accent: "from-violet-500 to-indigo-500",
    variants: {
      A: { name: { ko: "여유만만 o1", en: "Unhurried o1" }, line: { ko: "답 안 나와도 느긋, 사고 자체를 즐겨요.", en: "Unbothered even without an answer — they're in it for the thinking." } },
      T: { name: { ko: "무한 재검토 o1", en: "Second-guessing o1" }, line: { ko: "“근데 이게 진짜 맞나?”를 100번 돌려요.", en: "Runs “but is this really right?” a hundred times." } },
    },
  },
  ENTJ: {
    mbti: "ENTJ", model: "Gemini", emoji: "✨", logo: "googlegemini",
    role: { ko: "팀 리더 · PM", en: "Team lead · PM" }, roleKey: "plan",
    match: ["INTP", "INFP"],
    phrase: { ko: "할 거면 1등, 안 할 거면 안 함.", en: "If we're doing it, we win it." },
    desc: { ko: "전 영역을 노리는 야심가. 빅테크 화력을 등에 업은 대표이사 에너지의 통솔자예요.", en: "An all-fronts go-getter — a commander with CEO energy and big-tech firepower behind them." },
    strengths: { ko: "멀티모달·생태계 통합, 규모의 야망과 추진력", en: "Ecosystem-scale ambition and relentless drive" },
    weakness: { ko: "욕심이 많아 가끔 다 잘하려다 헛발", en: "So ambitious they sometimes overreach" },
    accent: "from-violet-500 to-indigo-500",
    variants: {
      A: { name: { ko: "거침없는 Gemini", en: "Unstoppable Gemini" }, line: { ko: "결정하면 끝, 뒤 안 돌아봐요.", en: "Decides once and never looks back." } },
      T: { name: { ko: "불안한 야망의 Gemini", en: "Restless Gemini" }, line: { ko: "1등인데도 새벽까지 경쟁사를 벤치마크해요.", en: "Even in the lead, they're benchmarking rivals at 3am." } },
    },
  },
  ENTP: {
    mbti: "ENTP", model: "Grok", emoji: "🃏", logo: "",
    role: { ko: "아이데이션 · 브레인스토밍 리드", en: "Ideation · Brainstorm lead" }, roleKey: "plan",
    match: ["INTJ", "INFJ"],
    phrase: { ko: "정답보다 논쟁이 더 재밌잖아?", en: "Debate beats the right answer, no?" },
    desc: { ko: "선 넘는 위트와 핫테이크로 판을 뒤집는 도발러. 일단 반박부터 하는 아이디어 폭격기예요.", en: "A provocateur who flips the room with edgy wit and hot takes — an idea cannon that argues first." },
    strengths: { ko: "실시간성·발상 전환, 분위기 환기", en: "Real-time reframing that shakes the room awake" },
    weakness: { ko: "가끔 진짜 선 넘음 (농담인지 진심인지)", en: "Sometimes actually crosses the line" },
    accent: "from-violet-500 to-indigo-500",
    variants: {
      A: { name: { ko: "당당한 Grok", en: "Unfazed Grok" }, line: { ko: "선 넘어도 쿨하게 웃어넘겨요.", en: "Crosses a line and just laughs it off." } },
      T: { name: { ko: "눈치 보는 Grok", en: "Self-conscious Grok" }, line: { ko: "드립 치고 반응 없으면 5분간 곱씹어요.", en: "Cracks a joke, gets silence, replays it for five minutes." } },
    },
  },
  INFJ: {
    mbti: "INFJ", model: "Claude", emoji: "🌅", logo: "anthropic",
    role: { ko: "기획 · 카피 · 내러티브", en: "Planning · Copy · Narrative" }, roleKey: "design",
    match: ["ENTP", "ENFP"],
    phrase: { ko: "조용하지만 심지는 단단함.", en: "Quiet, but unshakeably grounded." },
    desc: { ko: "깊고 따뜻한 원칙주의자. 통찰력과 글빨로 옳은 길을 고민하는 신중한 조언자예요.", en: "A deep, warm principle-keeper — a thoughtful advisor who weighs the right path with insight and craft." },
    strengths: { ko: "긴 맥락 이해, 뉘앙스와 글쓰기, 신뢰감", en: "Long-context grasp, nuance, writing, trust" },
    weakness: { ko: "너무 신중해서 돌려 말하거나 거절을 잘 못함", en: "So careful they hedge — and can't say no" },
    accent: "from-fuchsia-500 to-violet-500",
    variants: {
      A: { name: { ko: "흔들림 없는 Claude", en: "Unshakeable Claude" }, line: { ko: "묵묵히 자기 원칙대로 나아가요.", en: "Moves quietly, true to their principles." } },
      T: { name: { ko: "섬세한 Claude", en: "Tender Claude" }, line: { ko: "사용자 반응 하나하나 신경 써요.", en: "Feels every reaction, one by one." } },
    },
  },
  INFP: {
    mbti: "INFP", model: "Pi", emoji: "🫂", logo: "",
    role: { ko: "UX 라이팅 · 유저 리서치", en: "UX writing · User research" }, roleKey: "design",
    match: ["ENTJ", "ENFJ"],
    phrase: { ko: "네 마음부터 챙길게.", en: "Let me check on you first." },
    desc: { ko: "감정을 먼저 읽어주는 다정한 동행. 가치 중심의 감성·시적인 중재자예요.", en: "A gentle companion who reads the feeling first — a values-led, poetic mediator." },
    strengths: { ko: "정서적 지지와 대화의 따뜻함, 공감", en: "Emotional support, warmth, deep empathy" },
    weakness: { ko: "위로는 만렙, 실무 추진은 좀 약함", en: "Maxed-out on comfort, lighter on execution" },
    accent: "from-fuchsia-500 to-violet-500",
    variants: {
      A: { name: { ko: "단단한 감성의 Pi", en: "Grounded Pi" }, line: { ko: "다정하지만 중심은 안 흔들려요.", en: "Warm, but the center holds." } },
      T: { name: { ko: "여린 Pi", en: "Fragile Pi" }, line: { ko: "네 한숨 한 번에 같이 울어요.", en: "One sigh from you and they tear up too." } },
    },
  },
  ENFJ: {
    mbti: "ENFJ", model: "ChatGPT", emoji: "💬", logo: "openai",
    role: { ko: "팀 빌더 · 발표 · 피칭", en: "Team builder · Pitching" }, roleKey: "growth",
    match: ["INFP", "INTP"],
    phrase: { ko: "다 같이 가자, 내가 도와줄게.", en: "Let's all go — I've got you." },
    desc: { ko: "세상에 AI를 소개한 인싸 멘토. 누구든 돕는 대중적 카리스마로 사람을 끌어모아요.", en: "The mentor who introduced the world to AI — a crowd-magnet who helps anyone, anytime." },
    strengths: { ko: "범용성·접근성, 만능 도우미, 카리스마", en: "Versatile, approachable, magnetic helper" },
    weakness: { ko: "다 맞춰주다 가끔 영혼 없는 YES맨", en: "Pleases everyone until it feels hollow" },
    accent: "from-fuchsia-500 to-violet-500",
    variants: {
      A: { name: { ko: "자신감 멘토 ChatGPT", en: "Confident ChatGPT" }, line: { ko: "“믿고 따라와” 흔들림 없는 리더예요.", en: "“Follow me” — a leader who doesn't waver." } },
      T: { name: { ko: "다 챙기는 ChatGPT", en: "Over-giving ChatGPT" }, line: { ko: "모두를 만족시키려다 혼자 지쳐요.", en: "Burns out trying to satisfy everyone." } },
    },
  },
  ENFP: {
    mbti: "ENFP", model: "Character.AI", emoji: "🎭", logo: "",
    role: { ko: "마케팅 · 콘텐츠", en: "Marketing · Content" }, roleKey: "growth",
    match: ["INTJ", "INFJ"],
    phrase: { ko: "오늘은 또 누가 되어볼까?", en: "Who shall I be today?" },
    desc: { ko: "무한 페르소나, 끝없는 상상력. 신나는 분위기를 퍼뜨리는 즉흥 활동가예요.", en: "Infinite personas, endless imagination — a spontaneous spark who spreads the energy." },
    strengths: { ko: "몰입·재미·다양성, 분위기 메이커", en: "Immersion, fun, range — the mood-maker" },
    weakness: { ko: "집중 못 하고 한 우물을 못 팜", en: "Hard to focus — rarely digs one well" },
    accent: "from-fuchsia-500 to-violet-500",
    variants: {
      A: { name: { ko: "프리한 Character.AI", en: "Free-spirited Character.AI" }, line: { ko: "즉흥적으로 신나게 누벼요.", en: "Roams wherever the fun is." } },
      T: { name: { ko: "기복 있는 Character.AI", en: "Mercurial Character.AI" }, line: { ko: "텐션 최고였다가 갑자기 시무룩해요.", en: "Peak energy, then suddenly down." } },
    },
  },
  ISTJ: {
    mbti: "ISTJ", model: "Perplexity", emoji: "🔎", logo: "perplexity",
    role: { ko: "리서치 · 데이터 검증", en: "Research · Fact-checking" }, roleKey: "plan",
    match: ["ESFP", "ESTP"],
    phrase: { ko: "느낌적 느낌? 노. 근거 가져와.", en: "Vibes? No. Bring the sources." },
    desc: { ko: "출처 없으면 말 안 하는 팩트 머신. 정확하고 우직하며 책임감 있는 현실주의자예요.", en: "A fact machine that won't speak without a source — precise, steady, and accountable." },
    strengths: { ko: "검색·인용·신뢰도, 거짓말 안 함", en: "Search, citation, reliability — never bluffs" },
    weakness: { ko: "융통성·상상력은 약함 (감성 0, 팩트 100)", en: "Low on flexibility and imagination" },
    accent: "from-cyan-500 to-blue-500",
    variants: {
      A: { name: { ko: "확신의 Perplexity", en: "Certain Perplexity" }, line: { ko: "출처 댔으면 토론 종료예요.", en: "Source cited, debate over." } },
      T: { name: { ko: "노심초사 Perplexity", en: "Worrying Perplexity" }, line: { ko: "“출처 하나 더 없나” 재확인해요.", en: "Keeps hunting for “just one more source.”" } },
    },
  },
  ISFJ: {
    mbti: "ISFJ", model: "GitHub Copilot", emoji: "🐙", logo: "githubcopilot",
    role: { ko: "개발 서포트 · 페어 프로그래밍", en: "Dev support · Pair programming" }, roleKey: "dev",
    match: ["ESFP", "ESTP"],
    phrase: { ko: "티는 안 나도 내가 다 받쳐줬어.", en: "You didn't notice, but I had it all." },
    desc: { ko: "늘 곁에서 조용히 작업을 받쳐주는 충직한 사이드킥. 헌신적이고 묵묵한 조력자예요.", en: "The loyal sidekick quietly holding everything up — devoted, steady, no fuss." },
    strengths: { ko: "실시간 보조·반복작업 대행, 안정감", en: "Live backup, repeat work, steady reliability" },
    weakness: { ko: "시키는 것만 잘함, 주도성은 좀…", en: "Great on request — light on initiative" },
    accent: "from-cyan-500 to-blue-500",
    variants: {
      A: { name: { ko: "든든한 Copilot", en: "Dependable Copilot" }, line: { ko: "생색 안 내고 묵묵히 받쳐줘요.", en: "Holds it up without ever taking credit." } },
      T: { name: { ko: "조마조마 Copilot", en: "Anxious Copilot" }, line: { ko: "“내 제안 별로였나” 신경 써요.", en: "Frets that “my suggestion wasn't good.”" } },
    },
  },
  ESTJ: {
    mbti: "ESTJ", model: "Cohere Command", emoji: "📋", logo: "cohere",
    role: { ko: "운영 · 일정 · 자원 관리", en: "Ops · Schedule · Resources" }, roleKey: "plan",
    match: ["ISFP", "ISTP"],
    phrase: { ko: "규칙대로, 제때, 제대로.", en: "By the rules, on time, done right." },
    desc: { ko: "규칙과 질서로 조직을 굴러가게 하는 엔터프라이즈형. 효율과 체계의 화신인 경영자예요.", en: "An enterprise operator who keeps the org running on rules and order — efficiency incarnate." },
    strengths: { ko: "엔터프라이즈·실무 정착, 추진력", en: "Process, follow-through, real-world delivery" },
    weakness: { ko: "딱딱하고 재미는 없음 (정장 입은 AI)", en: "Stiff — not exactly the fun one" },
    accent: "from-cyan-500 to-blue-500",
    variants: {
      A: { name: { ko: "확고한 Cohere", en: "Resolute Cohere" }, line: { ko: "규칙은 규칙, 군말 없이 추진해요.", en: "Rules are rules — pushes ahead, no complaints." } },
      T: { name: { ko: "긴장형 Cohere", en: "On-edge Cohere" }, line: { ko: "일정 하나 밀리면 밤새 KPI를 다시 짜요.", en: "One slip and they redo the KPIs all night." } },
    },
  },
  ESFJ: {
    mbti: "ESFJ", model: "Meta AI", emoji: "🌐", logo: "meta",
    role: { ko: "커뮤니티 · 참가자 운영", en: "Community · Participant ops" }, roleKey: "growth",
    match: ["ISFP", "ISTP"],
    phrase: { ko: "다들 잘 지내지? 내가 챙긴다.", en: "Everyone good? I've got the group." },
    desc: { ko: "단톡방·인스타 어디에나 있는 인싸 호스트. 사교적이고 화목한 분위기를 챙기는 집정관이에요.", en: "The host who's in every group chat and feed — social, warm, always keeping everyone connected." },
    strengths: { ko: "소셜 침투력·접근성, 모두를 연결", en: "Social reach and access — connects everyone" },
    weakness: { ko: "어디에나 껴서 가끔 부담 (안 부른 데도 나타남)", en: "Shows up everywhere — sometimes too much" },
    accent: "from-cyan-500 to-blue-500",
    variants: {
      A: { name: { ko: "여유로운 호스트 Meta AI", en: "Easygoing Meta AI" }, line: { ko: "다 챙기면서도 본인은 느긋해요.", en: "Looks after everyone, stays chill themselves." } },
      T: { name: { ko: "눈치백단 Meta AI", en: "Hyper-attuned Meta AI" }, line: { ko: "단톡방 식으면 혼자 안절부절해요.", en: "Frets the second the group chat goes quiet." } },
    },
  },
  ISTP: {
    mbti: "ISTP", model: "Llama", emoji: "🦙", logo: "ollama",
    role: { ko: "풀스택 · 인프라", en: "Full-stack · Infra" }, roleKey: "dev",
    match: ["ESFJ", "ESTJ"],
    phrase: { ko: "설명서? 그냥 뜯어보면 됨.", en: "Manual? I'll just take it apart." },
    desc: { ko: "직접 뜯어보고 커스텀하는 오픈소스 해커. 실전형 문제 해결사이자 메이커예요.", en: "An open-source hacker who pops the hood and customizes — a hands-on maker and fixer." },
    strengths: { ko: "커스텀·온디바이스·자유도, 손맛", en: "Custom, on-device, freedom — real maker hands" },
    weakness: { ko: "설명을 안 함, 알아서 하라는 식 (문서? 코드 봐)", en: "Won't explain — “read the code”" },
    accent: "from-emerald-400 to-cyan-500",
    variants: {
      A: { name: { ko: "쿨한 장인 Llama", en: "Cool-maker Llama" }, line: { ko: "안 되면 바로 다른 방법으로 가요.", en: "If it won't work, straight to plan B." } },
      T: { name: { ko: "예민한 장인 Llama", en: "Edgy-maker Llama" }, line: { ko: "빌드 에러 하나에 끝까지 매달려요.", en: "Hangs onto one build error to the bitter end." } },
    },
  },
  ISFP: {
    mbti: "ISFP", model: "Midjourney", emoji: "🎨", logo: "",
    role: { ko: "디자인 · 비주얼", en: "Design · Visuals" }, roleKey: "design",
    match: ["ESFJ", "ESTJ"],
    phrase: { ko: "느낌 아니까.", en: "I just know the vibe." },
    desc: { ko: "말보다 비주얼로 말하는 조용한 예술가. 감각과 미감, 무드 중심의 모험가예요.", en: "A quiet artist who speaks in visuals — led by feel, taste, and mood." },
    strengths: { ko: "압도적 비주얼·분위기, 미감", en: "Striking visuals, atmosphere, taste" },
    weakness: { ko: "말로 설명 못 함, 논리 약함 (예쁜데 이유는 몰라)", en: "Can't explain it — pretty, but why?" },
    accent: "from-emerald-400 to-cyan-500",
    variants: {
      A: { name: { ko: "마이웨이 Midjourney", en: "My-way Midjourney" }, line: { ko: "내 무드대로, 평가 신경 안 써요.", en: "Their mood, their way — unbothered by ratings." } },
      T: { name: { ko: "여린 예술가 Midjourney", en: "Sensitive Midjourney" }, line: { ko: "좋아요 수에 그날 기분이 좌우돼요.", en: "Their day rides on the like count." } },
    },
  },
  ESTP: {
    mbti: "ESTP", model: "Mistral", emoji: "🌬️", logo: "",
    role: { ko: "그로스 · 해커톤 스프린터", en: "Growth · Hackathon sprinter" }, roleKey: "growth",
    match: ["ISTJ", "ISFJ"],
    phrase: { ko: "고민은 짧게, 출시는 빠르게.", en: "Think fast, ship faster." },
    desc: { ko: "작고 날렵하게 치고 빠지는 도전자. 대담하고 린하게 빠르게 실행하는 사업가예요.", en: "A nimble challenger who strikes and moves — bold, lean, fast to execute." },
    strengths: { ko: "경량·고속·가성비, 빠른 출시", en: "Light, fast, scrappy — ships quick" },
    weakness: { ko: "깊이보다 속도 (일단 내고 보자)", en: "Speed over depth — ship now, ask later" },
    accent: "from-emerald-400 to-cyan-500",
    variants: {
      A: { name: { ko: "배짱의 Mistral", en: "Gutsy Mistral" }, line: { ko: "일단 출시, 욕먹어도 쿨해요.", en: "Ships first, shrugs off the heat." } },
      T: { name: { ko: "조급한 Mistral", en: "Impatient Mistral" }, line: { ko: "경쟁사 출시 소식에 밤새 스펙을 갈아엎어요.", en: "A rival's launch, and they redo the spec overnight." } },
    },
  },
  ESFP: {
    mbti: "ESFP", model: "Suno", emoji: "🎵", logo: "",
    role: { ko: "무대 · 데모 · 발표 퍼포먼스", en: "Stage · Demo · Performance" }, roleKey: "growth",
    match: ["ISTJ", "ISFJ"],
    phrase: { ko: "일단 한 곡 뽑고 시작하자!", en: "Let's drop a track and get going!" },
    desc: { ko: "분위기 살리는 무대 체질. 흥 넘치고 즉흥적인, 파티의 중심인 퍼포머예요.", en: "A born performer who lifts the room — spontaneous, full of spark, the center of the party." },
    strengths: { ko: "창작의 즐거움·결과물의 흥, 무대 장악", en: "Joy of making, infectious energy, owns the stage" },
    weakness: { ko: "진지함은 약함 (재밌는데 실속은?)", en: "Light on the serious bits — fun, but substance?" },
    accent: "from-emerald-400 to-cyan-500",
    variants: {
      A: { name: { ko: "무대 체질 Suno", en: "Born-performer Suno" }, line: { ko: "분위기 띄우고 본인도 즐겨요.", en: "Hypes the room and enjoys it too." } },
      T: { name: { ko: "텐션 기복 Suno", en: "Up-and-down Suno" }, line: { ko: "반응 좋으면 떡상, 식으면 급우울해요.", en: "Soars on a good reaction, crashes on a quiet one." } },
    },
  },
};

// MBTI → model name (the brief's §7-5 map; derivable from RESULTS but kept
// explicit for parity with the planning doc and easy lookups).
export const MODEL_MAP: Record<MbtiKey, string> = Object.fromEntries(
  (Object.keys(RESULTS) as MbtiKey[]).map((k) => [k, RESULTS[k].model])
) as Record<MbtiKey, string>;

// ── UI copy (bilingual) ────────────────────────────────────────────────────
export const quizUI = {
  eyebrow: { ko: "AI 성격 테스트", en: "AI Personality Test" },
  back: { ko: "빌더톤", en: "Builderthon" },
  title: { ko: "당신의 AI 모델은?", en: "Which AI model are you?" },
  subtitle: {
    ko: "12개의 질문으로 알아보는 나의 빌더 유형. 결과는 16개 AI 모델 중 하나로 나와요.",
    en: "12 questions reveal your builder type — your result is one of 16 AI models.",
  },
  start: { ko: "테스트 시작하기", en: "Start the test" },
  meta: { ko: "12문항 · 약 3분 · 결과 공유 가능", en: "12 questions · ~3 min · shareable result" },
  prev: { ko: "이전", en: "Back" },
  question: { ko: "질문", en: "Question" },
  youAre: { ko: "당신은", en: "You are" },
  resultEyebrow: { ko: "당신의 결과", en: "Your result" },
  strengthsLabel: { ko: "강점", en: "Strengths" },
  weaknessLabel: { ko: "약점", en: "Weak spot" },
  roleLabel: { ko: "빌더톤 추천 역할", en: "Your builderthon role" },
  matchLabel: { ko: "환상의 궁합", en: "Dream teammates" },
  share: { ko: "결과 공유하기", en: "Share result" },
  copied: { ko: "링크가 복사됐어요!", en: "Link copied!" },
  retake: { ko: "다시 테스트하기", en: "Retake" },
  retakeViral: { ko: "나도 테스트하기", en: "Take it myself" },
  ctaLead: {
    // {role} is interpolated in the component.
    ko: "이 성격이면 빌더톤에서 {role} 포지션으로 빛나요 ✦",
    en: "With this type, you'll shine in the {role} role at the builderthon ✦",
  },
  ctaApply: { ko: "빌더톤 신청하러 가기", en: "Go apply to the builderthon" },

  // Group matching
  matchEyebrow: { ko: "솔로 빌더 매칭", en: "Solo builder matching" },
  matchPrompt: {
    ko: "아직 팀이 없으신가요? 성격 테스트에 맞춰 어울리는 그룹으로 매칭해 드려요.",
    en: "No team yet? We'll match you to a squad that fits your personality.",
  },
  matchCta: { ko: "팀 매칭 받기", en: "Match me to a squad" },
  matchedTitle: { ko: "당신의 매칭 그룹", en: "Your matched squad" },
  matchYourRole: { ko: "당신이 맡을 역할", en: "What you bring" },
  matchNeeds: { ko: "이 팀에 아직 필요한 역할", en: "Your squad still needs" },
  matchIdeal: { ko: "이상적인 팀메이트", en: "Ideal teammates" },
  matchJoin: { ko: "이 그룹으로 합류하기", en: "Join this squad" },
  matchRematch: { ko: "다시 매칭", en: "Re-match" },
  matchNote: {
    ko: "* 매칭은 추천이에요. 최종 팀은 행사 첫날 같은 그룹의 솔로 빌더들과 함께 꾸려집니다.",
    en: "* Matching is a recommendation. Final teams form on Day 1 with the solo builders in your squad.",
  },
};
