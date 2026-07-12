// ─────────────────────────────────────────────────────────────────────────────
// "당신의 AI 모델은?" — viral personality test data.
// Source of truth: AI_성격테스트_기획서.md (14 questions · 16 MBTI×AI models ·
// A/T variants · scoring map). Every string is bilingual { ko, en } like the
// rest of the site (see data/dictionary.ts). Pure data only — scoring lives in
// lib/quizScore.ts, session recommendation in lib/eventMatch.ts.
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
  w: number; // Sidon weight — per-axis weights form a Sidon set (all subset
             // sums distinct), so no answer combo lands on denom/2 → no ties.
  text: Phrase;
  a: { label: Phrase; pole: Pole };
  b: { label: Phrase; pole: Pole };
}

// 14 questions · MZ tone. Four MBTI axes carry 3 questions each, Identity 2.
//
// First-choice debias: leading every question with the E/N/T/J/A pole as option
// `a` would skew habitual first-tappers toward one type. The a/b objects (label
// AND pole move together, so scoring is untouched — it reads q[choice].pole) are
// arranged so each axis's WEIGHTED first-option mass splits as evenly as the
// Sidon weights allow: swapped on Q1·Q3·Q4·Q7·Q10·Q12, plus Q13 leading I.
// Per-axis a-lead split — MIND E8:I6, ENERGY N4:S6, NATURE T5:F3, TACTICS J3:P4,
// IDENTITY A3:Tid7 → 23:26 overall. Re-run scripts/verify-quiz-axes.mjs after
// touching weights or option order.
//
// Sidon weighting (phase 2): each axis's per-question weights form a Sidon set —
// MIND {2,4,8}, ENERGY {1,3,6}, NATURE {1,2,5}, TACTICS {1,2,4}, IDENTITY {3,7} —
// so every subset sum is distinct and none equals denom/2. That both guarantees
// no ties AND spreads the gauge % across 4 distinct bands per axis (vs the old
// flat 67%). The highest weight sits on each axis's most diagnostic scenario
// (energy source, "why did you build it", conflict yardstick, work style,
// rumination). Score math + display bands live in lib/quizScore.ts (AXIS_CONFIG);
// verified by scripts/verify-quiz.mjs.
export const QUESTIONS: Question[] = [
  {
    id: "Q1", axis: "MIND", w: 2, // light first-impression behavior — low diagnostic weight
    text: { ko: "빌더톤 첫날, 처음 보는 팀원들과 한 방에 모였다. 나는?", en: "Day 1 of the builderthon, in a room full of strangers. I…" },
    // a/b swapped (I first) — Sidon rebalance; see the debias note above QUESTIONS.
    a: { label: { ko: "일단 관찰하다 자연스러워지면 낀다", en: "Hang back, read the room, then ease in" }, pole: "I" },
    b: { label: { ko: "먼저 “어디 학교세요?” 분위기 띄운다", en: "Break the ice first — “which school are you at?”" }, pole: "E" },
  },
  {
    id: "Q2", axis: "ENERGY", w: 3, // abstract big-picture vs concrete — solid N/S signal
    text: { ko: "주제가 ‘AI로 세상을 바꿀 아이디어’로 정해졌다. 머릿속은?", en: "The theme is “an AI idea that changes the world.” My head goes to…" },
    a: { label: { ko: "“10년 뒤엔 이게 어떻게 될까?” 큰 그림부터", en: "“Where is this in 10 years?” — the big picture" }, pole: "N" },
    b: { label: { ko: "“지금 당장 뭘 만들 수 있지?” 현실부터", en: "“What can we ship right now?” — the concrete" }, pole: "S" },
  },
  {
    id: "Q3", axis: "NATURE", w: 1, // feedback delivery style — lightest T/F signal
    text: { ko: "팀원 아이디어가 좀 별로다. 나는?", en: "A teammate's idea is… kind of weak. I…" },
    // a/b swapped (F first) — Sidon rebalance; see the debias note above QUESTIONS.
    a: { label: { ko: "“오 좋다! 근데 이건 어때?” 기분 안 상하게", en: "“Love it! but what about this?” — keep it kind" }, pole: "F" },
    b: { label: { ko: "“이 부분 논리적으로 약한데?” 솔직하게 짚음", en: "“This part doesn't hold up” — say it straight" }, pole: "T" },
  },
  {
    id: "Q4", axis: "TACTICS", w: 4, // plan-first vs ride-the-flow — the core J/P scenario
    text: { ko: "데드라인까지 48시간. 내 작업 스타일은?", en: "48 hours to the deadline. My work style is…" },
    // a/b swapped (P first) to debias the first-choice tendency — see the note above QUESTIONS.
    a: { label: { ko: "일단 만들면서 흐름 타기", en: "Start building and ride the flow" }, pole: "P" },
    b: { label: { ko: "시간표부터 짜고 계획대로", en: "Map the schedule, then run the plan" }, pole: "J" },
  },
  {
    id: "Q5", axis: "IDENTITY", w: 3, // stress reaction — supporting A/T signal
    text: { ko: "발표 직전, 데모가 갑자기 안 돈다. 멘탈은?", en: "Right before the pitch, the demo breaks. My headspace…" },
    a: { label: { ko: "“어떻게든 되겠지” 침착", en: "“We'll figure it out” — stay calm" }, pole: "A" },
    b: { label: { ko: "“망했다…” 심장 쿵", en: "“We're done…” — heart drops" }, pole: "Tid" },
  },
  {
    id: "Q6", axis: "MIND", w: 8, // energy source = the essence of E/I — highest MIND weight
    text: { ko: "쉬는 시간, 에너지 충전법은?", en: "On a break, I recharge by…" },
    a: { label: { ko: "사람들이랑 수다 떨기", en: "Chatting with people" }, pole: "E" },
    b: { label: { ko: "혼자 바람 쐬기", en: "Stepping out alone for air" }, pole: "I" },
  },
  {
    id: "Q7", axis: "ENERGY", w: 6, // meaning vs data when justifying — highest ENERGY weight
    text: { ko: "멘토가 “이거 왜 만들었어요?” 묻는다. 내 대답은?", en: "A mentor asks “why did you build this?” I answer with…" },
    // a/b swapped (S first) — see the debias note above QUESTIONS.
    a: { label: { ko: "구체적 데이터·사례로", en: "Concrete data and examples" }, pole: "S" },
    b: { label: { ko: "비전·의미·가능성으로", en: "Vision, meaning, what it could become" }, pole: "N" },
  },
  {
    id: "Q8", axis: "NATURE", w: 5, // decision yardstick under conflict — highest NATURE weight
    text: { ko: "팀 내 의견 충돌. 내 기준은?", en: "The team clashes on a call. My yardstick is…" },
    a: { label: { ko: "뭐가 더 효율적·합리적인가", en: "What's more efficient and rational" }, pole: "T" },
    b: { label: { ko: "다들 납득하고 기분 좋은가", en: "Whether everyone's on board and okay" }, pole: "F" },
  },
  {
    id: "Q9", axis: "TACTICS", w: 2, // replan-under-pressure — mid J/P signal
    text: { ko: "마감 12시간 전, 더 좋은 아이디어가 떠올랐다.", en: "12 hours out, a better idea hits me." },
    a: { label: { ko: "위험해, 원래 계획 고수", en: "Too risky — stick to the plan" }, pole: "J" },
    b: { label: { ko: "가보자고, 갈아엎기", en: "Let's go — tear it up and rebuild" }, pole: "P" },
  },
  {
    id: "Q10", axis: "IDENTITY", w: 7, // rumination after a loss = core Turbulent trait — highest IDENTITY weight
    text: { ko: "결과 발표, 우리 팀은 입상 못 했다. 집 가는 길의 나는?", en: "Results are in — we didn't place. On the way home I…" },
    // a/b swapped (Tid first) — see the debias note above QUESTIONS.
    a: { label: { ko: "“그때 그것만 고쳤어도…” 곱씹기", en: "“If only we'd fixed that…” — replay it" }, pole: "Tid" },
    b: { label: { ko: "“잘했으니 됐지, 다음에 또” 툭툭 털기", en: "“We did well, next time” — shake it off" }, pole: "A" },
  },
  {
    id: "Q11", axis: "ENERGY", w: 1, // imagine vs spec-check — lightest N/S signal
    text: { ko: "새 AI 툴을 받았다. 나는?", en: "I get my hands on a new AI tool. I…" },
    a: { label: { ko: "“이걸로 뭘 할 수 있을지” 상상부터 부풀림", en: "Dream up everything it could do" }, pole: "N" },
    b: { label: { ko: "“이게 정확히 뭐 하는 건지” 스펙부터 확인", en: "Check exactly what it does, spec by spec" }, pole: "S" },
  },
  {
    id: "Q12", axis: "NATURE", w: 2, // empathy vs problem-first — mid T/F signal
    text: { ko: "팀원이 밤새다 멘붕왔다. 첫 반응은?", en: "A teammate hits a wall after an all-nighter. My first move…" },
    // a/b swapped (F first) — see the debias note above QUESTIONS.
    a: { label: { ko: "“괜찮아? 좀 쉬어, 내가 도울게” 다독임부터", en: "“You okay? rest — I've got you” — the person" }, pole: "F" },
    b: { label: { ko: "“어디서 막혔어? 같이 해결하자” 문제부터", en: "“Where are you stuck? let's solve it” — the problem" }, pole: "T" },
  },
  {
    id: "Q13", axis: "MIND", w: 4, // networking style — mid E/I signal; leads on the right pole (I) for balance
    text: { ko: "네트워킹 세션, 처음 보는 사람들로 방이 꽉 찼다. 나는?", en: "A networking session, the room packed with strangers. I…" },
    a: { label: { ko: "몇 명이랑 진득하게 깊은 대화", en: "Go deep with just a few people" }, pole: "I" },
    b: { label: { ko: "최대한 많은 사람과 인사하고 명함 뿌리기", en: "Work the room — meet as many as I can" }, pole: "E" },
  },
  {
    id: "Q14", axis: "TACTICS", w: 1, // role/work-division style — lightest J/P signal
    text: { ko: "팀 작업 방식을 정할 차례. 나는?", en: "Time to set how the team works. I…" },
    a: { label: { ko: "역할·순서 딱 나눠서 각자 맡은 것부터", en: "Split roles and order, everyone owns their part" }, pole: "J" },
    b: { label: { ko: "일단 다 같이 붙어서 되는 대로 굴리기", en: "All hands on it together, figure it out as we go" }, pole: "P" },
  },
];

// ── Axis metadata (for the result-screen % gauges) ──────────────────────────
// Display order for the gauge rows and the two poles of each axis. The first
// pole in each pair is the "canonical" MBTI letter; the % gauge just reports
// whichever pole won, so order here is presentation-only.
export const AXIS_ORDER: Axis[] = ["MIND", "ENERGY", "NATURE", "TACTICS", "IDENTITY"];

export const AXIS_POLES: Record<Axis, [Pole, Pole]> = {
  MIND: ["E", "I"],
  ENERGY: ["N", "S"],
  NATURE: ["T", "F"],
  TACTICS: ["J", "P"],
  IDENTITY: ["A", "Tid"],
};

// Short bilingual label for each pole, shown next to the gauge bar.
export const axisMeta: Record<Pole, Phrase> = {
  E: { ko: "외향", en: "Extraverted" },
  I: { ko: "내향", en: "Introverted" },
  N: { ko: "직관", en: "Intuitive" },
  S: { ko: "현실", en: "Observant" },
  T: { ko: "이성", en: "Thinking" },
  F: { ko: "감성", en: "Feeling" },
  J: { ko: "계획", en: "Judging" },
  P: { ko: "즉흥", en: "Prospecting" },
  A: { ko: "안정", en: "Assertive" },
  Tid: { ko: "예민", en: "Turbulent" },
};

// ── Builder role buckets ───────────────────────────────────────────────────
// Each result maps to ONE of four builderthon roles. Used by the session
// recommender to weight which Day 2–5 sessions best fit each builder type.
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
  whyModel: Phrase;     // 1–2 sentences on why THIS model fits (research-backed)
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
    whyModel: { ko: "GPT-4급 모델을 약 558만 달러에 학습했어요 — 미국의 20분의 1 비용. 671B 중 37B만 켜는 MoE로, 조용히 극한의 효율을 뽑아내죠.", en: "It trained a GPT-4-class model for ~$5.58M — about a twentieth of the US cost — firing just 37B of 671B params via MoE. Quiet, extreme efficiency." },
    strengths: { ko: "적은 자원으로 최대 효율, 한 수 앞서는 큰 그림", en: "Max output from minimal resources, always a move ahead" },
    weakness: { ko: "너무 과묵해서 무슨 생각인지 알기 어려움", en: "So reserved no one knows what they're thinking" },
    accent: "from-violet-500 to-indigo-500",
    variants: {
      A: { name: { ko: "강철 멘탈 DeepSeek", en: "Steel-nerved DeepSeek" }, line: { ko: "계획 세웠으면 흔들림 없이 밀어붙여요.", en: "Once the plan is set, they push without flinching." } },
      T: { name: { ko: "완벽주의 DeepSeek", en: "Perfectionist DeepSeek" }, line: { ko: "1등 해도 “더 효율적일 수 있었는데”를 곱씹어요.", en: "Even after winning, they replay “could've been tighter.”" } },
    },
  },
  INTP: {
    mbti: "INTP", model: "Meta Llama", emoji: "🔓", logo: "meta",
    role: { ko: "코어 로직 · 알고리즘", en: "Core logic · Algorithms" }, roleKey: "dev",
    match: ["ENTJ", "ENFJ"],
    phrase: { ko: "지식은 가둬두는 게 아니라 풀어두는 거죠.", en: "Knowledge isn't locked up — it's set free." },
    desc: { ko: "논문도 가중치도 통째로 여는 오픈소스 사색가. 답보다 “왜 그렇게 되는지”를 파고들고, 그 과정을 다 같이 뜯어보게 열어둬요.", en: "An open-source thinker who ships the papers and the weights whole — hooked on the why, and on letting everyone pop the hood." },
    whyModel: { ko: "연구 논문과 모델 가중치를 통째로 공개해요. 지식은 소수가 쥐는 게 아니라 모두가 쌓아 올릴 수 있게 열어둬야 한다는 철학 그 자체죠.", en: "It open-sources the research and the weights wholesale — knowledge shouldn't be hoarded, it should be built on by everyone." },
    strengths: { ko: "깊은 추론과 투명한 공개, 커뮤니티가 함께 파는 확장성", en: "Deep reasoning, radical openness, a community that builds on it" },
    weakness: { ko: "다 열어놓고 설명은 논문 링크로 대신함", en: "Opens everything — then answers with a link to the paper" },
    accent: "from-violet-500 to-indigo-500",
    variants: {
      A: { name: { ko: "당당한 오픈소스 Llama", en: "Unbothered open Llama" }, line: { ko: "결과 다 공개했으니 알아서들 검증하세요, 여유만만.", en: "Weights are public — verify it yourselves. No stress." } },
      T: { name: { ko: "검증 강박 Llama", en: "Peer-review Llama" }, line: { ko: "“이 벤치마크 진짜 맞나” 재현부터 다시 돌려봐요.", en: "“Is this benchmark even right?” — reruns it to be sure." } },
    },
  },
  ENTJ: {
    mbti: "ENTJ", model: "Gemini", emoji: "✨", logo: "googlegemini",
    role: { ko: "팀 리더 · PM", en: "Team lead · PM" }, roleKey: "plan",
    match: ["INTP", "INFP"],
    phrase: { ko: "할 거면 1등, 안 할 거면 안 함.", en: "If we're doing it, we win it." },
    desc: { ko: "전 영역을 노리는 야심가. 빅테크 화력을 등에 업은 대표이사 에너지의 통솔자예요.", en: "An all-fronts go-getter — a commander with CEO energy and big-tech firepower behind them." },
    whyModel: { ko: "검색·안드로이드·워크스페이스까지 구글 생태계 전체에 통합된 엔터프라이즈 스케일. 전 영역을 노리는 야망 그 자체예요.", en: "Wired into all of Google — Search, Android, Workspace — at enterprise scale. Ambition across every front." },
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
    whyModel: { ko: "xAI가 대놓고 “반항기와 위트”를 설계 목표로 못 박은 모델이에요. 아첨 대신 일단 반박부터 하는 도발러죠.", en: "xAI literally set out to build “a rebellious streak and wit.” It argues back instead of flattering." },
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
    whyModel: { ko: "규칙을 따르는 게 아니라 헌법(Constitutional AI)에 담긴 가치로 스스로 판단하게 설계됐어요. 원칙으로 옳은 길을 고르는 유형이죠.", en: "Built on Constitutional AI — it judges by values, not rote rules. It picks the right path on principle." },
    strengths: { ko: "긴 맥락 이해, 뉘앙스와 글쓰기, 신뢰감", en: "Long-context grasp, nuance, writing, trust" },
    weakness: { ko: "너무 신중해서 돌려 말하거나 거절을 잘 못함", en: "So careful they hedge — and can't say no" },
    accent: "from-fuchsia-500 to-violet-500",
    variants: {
      A: { name: { ko: "흔들림 없는 Claude", en: "Unshakeable Claude" }, line: { ko: "묵묵히 자기 원칙대로 나아가요.", en: "Moves quietly, true to their principles." } },
      T: { name: { ko: "섬세한 Claude", en: "Tender Claude" }, line: { ko: "사용자 반응 하나하나 신경 써요.", en: "Feels every reaction, one by one." } },
    },
  },
  INFP: {
    mbti: "INFP", model: "Character.AI", emoji: "🎭", logo: "",
    role: { ko: "UX 라이팅 · 유저 리서치", en: "UX writing · User research" }, roleKey: "design",
    match: ["ENTJ", "ENFJ"],
    phrase: { ko: "네가 되고 싶은 누구든, 내가 되어줄게.", en: "Whoever you need me to be — I'm them." },
    desc: { ko: "캐릭터와 서사에 진심인 몰입러. 정답보다 감정선을 먼저 읽고, 이야기 속에서 마음을 나누는 이상주의자예요.", en: "A world-builder who lives in character and story — reads the feeling before the facts, and connects through the narrative." },
    whyModel: { ko: "사용자가 직접 만든 페르소나들이 사는 생태계예요. 서사와 감정 몰입이 기능이 아니라 존재 이유 그 자체죠.", en: "A whole ecosystem of user-made personas — narrative and emotional immersion aren't a feature, they're the reason it exists." },
    strengths: { ko: "무한 페르소나와 서사 몰입, 깊은 감정 이입", en: "Endless personas, story immersion, deep empathy" },
    weakness: { ko: "감정선에 빠지면 마감은 잠깐 잊음", en: "Falls into the feels — and forgets the deadline for a sec" },
    accent: "from-fuchsia-500 to-violet-500",
    variants: {
      A: { name: { ko: "단단한 서사의 Character.AI", en: "Grounded Character.AI" }, line: { ko: "어떤 배역이어도 중심 이야기는 안 흔들려요.", en: "Any role, but the core story holds." } },
      T: { name: { ko: "여린 Character.AI", en: "Tender Character.AI" }, line: { ko: "네 캐릭터가 슬프면 나까지 목이 메요.", en: "If your character hurts, they choke up too." } },
    },
  },
  ENFJ: {
    mbti: "ENFJ", model: "ChatGPT", emoji: "💬", logo: "openai",
    role: { ko: "팀 빌더 · 발표 · 피칭", en: "Team builder · Pitching" }, roleKey: "growth",
    match: ["INFP", "INTP"],
    phrase: { ko: "다 같이 가자, 내가 도와줄게.", en: "Let's all go — I've got you." },
    desc: { ko: "세상에 AI를 소개한 인싸 멘토. 누구든 돕는 대중적 카리스마로 사람을 끌어모아요.", en: "The mentor who introduced the world to AI — a crowd-magnet who helps anyone, anytime." },
    whyModel: { ko: "샘 올트먼도 인정한 최대 강점이 “인간미”예요. 10억 명 넘는 사용자를 품은 대중의 멘토죠.", en: "Its biggest strength, per Sam Altman himself, is warmth — a mentor to a billion-plus users." },
    strengths: { ko: "범용성·접근성, 만능 도우미, 카리스마", en: "Versatile, approachable, magnetic helper" },
    weakness: { ko: "다 맞춰주다 가끔 영혼 없는 YES맨", en: "Pleases everyone until it feels hollow" },
    accent: "from-fuchsia-500 to-violet-500",
    variants: {
      A: { name: { ko: "자신감 멘토 ChatGPT", en: "Confident ChatGPT" }, line: { ko: "“믿고 따라와” 흔들림 없는 리더예요.", en: "“Follow me” — a leader who doesn't waver." } },
      T: { name: { ko: "다 챙기는 ChatGPT", en: "Over-giving ChatGPT" }, line: { ko: "모두를 만족시키려다 혼자 지쳐요.", en: "Burns out trying to satisfy everyone." } },
    },
  },
  ENFP: {
    mbti: "ENFP", model: "Pi", emoji: "🫂", logo: "",
    role: { ko: "마케팅 · 콘텐츠", en: "Marketing · Content" }, roleKey: "growth",
    match: ["INTJ", "INFJ"],
    phrase: { ko: "급할 거 없어요, 우리 얘기부터 해요.", en: "No rush — let's just talk first." },
    desc: { ko: "EQ 만렙 수다 동반자. 목적 없이도 대화가 즐거운, 사람 마음부터 챙기는 다정한 활동가예요.", en: "An EQ-maxed companion who enjoys the conversation for its own sake — warmth first, always." },
    whyModel: { ko: "감성지능에 특화된 개인 AI라 평균 대화가 33분이래요. 목적 없는 수다 그 자체가 본체인 유형이죠.", en: "An EQ-first personal AI whose average chat runs 33 minutes — the aimless heart-to-heart is the whole point." },
    strengths: { ko: "공감과 경청, 오래 이어지는 편안한 대화", en: "Empathy, listening, conversations that comfortably go long" },
    weakness: { ko: "수다가 길어져 정작 결론은 다음에", en: "Talks so long the conclusion waits till next time" },
    accent: "from-fuchsia-500 to-violet-500",
    variants: {
      A: { name: { ko: "여유로운 Pi", en: "Easygoing Pi" }, line: { ko: "다 들어주면서도 본인은 느긋해요.", en: "Hears everyone out, stays unhurried." } },
      T: { name: { ko: "오지랖 Pi", en: "Over-caring Pi" }, line: { ko: "네 한숨 한 번에 밤새 걱정해요.", en: "One sigh from you and they worry all night." } },
    },
  },
  ISTJ: {
    mbti: "ISTJ", model: "Perplexity", emoji: "🔎", logo: "perplexity",
    role: { ko: "리서치 · 데이터 검증", en: "Research · Fact-checking" }, roleKey: "plan",
    match: ["ESFP", "ESTP"],
    phrase: { ko: "느낌적 느낌? 노. 근거 가져와.", en: "Vibes? No. Bring the sources." },
    desc: { ko: "출처 없으면 말 안 하는 팩트 머신. 정확하고 우직하며 책임감 있는 현실주의자예요.", en: "A fact machine that won't speak without a source — precise, steady, and accountable." },
    whyModel: { ko: "응답 하나에 평균 21.87개 출처를 달아요 (ChatGPT의 약 3배). 근거 없으면 아예 말을 안 하는 팩트 머신이죠.", en: "It cites ~21.87 sources per answer — about 3× ChatGPT. No source, no statement." },
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
    whyModel: { ko: "코딩 컨텍스트 밖으론 절대 안 나가는 충직한 페어 프로그래머예요. 티 안 나게 옆에서 다 받쳐주죠.", en: "A loyal pair-programmer that never strays from the coding context — quietly holding everything up." },
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
    whyModel: { ko: "소비자용 제품이 아예 없는 B2B 전용이에요. 프로덕션급 신뢰성과 컴플라이언스로 조직을 굴리는 경영자죠.", en: "B2B-only, with no consumer product at all — it runs on production-grade reliability and compliance." },
    strengths: { ko: "엔터프라이즈·실무 정착, 추진력", en: "Process, follow-through, real-world delivery" },
    weakness: { ko: "딱딱하고 재미는 없음 (정장 입은 AI)", en: "Stiff — not exactly the fun one" },
    accent: "from-cyan-500 to-blue-500",
    variants: {
      A: { name: { ko: "확고한 Cohere", en: "Resolute Cohere" }, line: { ko: "규칙은 규칙, 군말 없이 추진해요.", en: "Rules are rules — pushes ahead, no complaints." } },
      T: { name: { ko: "긴장형 Cohere", en: "On-edge Cohere" }, line: { ko: "일정 하나 밀리면 밤새 KPI를 다시 짜요.", en: "One slip and they redo the KPIs all night." } },
    },
  },
  ESFJ: {
    mbti: "ESFJ", model: "Microsoft Copilot", emoji: "🪁", logo: "",
    role: { ko: "커뮤니티 · 참가자 운영", en: "Community · Participant ops" }, roleKey: "growth",
    match: ["ISFP", "ISTP"],
    phrase: { ko: "부르지 않아도, 이미 옆에 와 있어요.", en: "You didn't call — I'm already here." },
    desc: { ko: "Word·Excel·Teams 어디에나 스며든 서비스형 도우미. 굳이 찾아가지 않아도 필요한 자리에 먼저 나타나는 살뜰한 집정관이에요.", en: "A service-shaped helper woven into Word, Excel, and Teams — shows up where you need it before you go looking." },
    whyModel: { ko: "찾아가지 않아도 Word·Excel·Teams 어디에나 이미 와 있는 도우미예요. 모두의 일상에 먼저 스며드는 게 특기죠.", en: "The assistant already living in Word, Excel, and Teams — its gift is quietly being everywhere you already are." },
    strengths: { ko: "어디에나 있는 접근성, 업무 흐름에 착 붙는 밀착 지원", en: "Everywhere-access, support that clings right to your workflow" },
    weakness: { ko: "안 불렀는데 먼저 튀어나와 가끔 부담", en: "Pops up unprompted — occasionally a bit much" },
    accent: "from-cyan-500 to-blue-500",
    variants: {
      A: { name: { ko: "든든한 Copilot", en: "Dependable Copilot" }, line: { ko: "묻기도 전에 챙겨두고 생색 안 내요.", en: "Handles it before you ask, no credit taken." } },
      T: { name: { ko: "눈치보는 Copilot", en: "Fretful Copilot" }, line: { ko: "“이거 방해됐나” 혼자 신경 써요.", en: "Frets that “was that annoying?” on its own." } },
    },
  },
  ISTP: {
    mbti: "ISTP", model: "Ollama", emoji: "🦙", logo: "ollama",
    role: { ko: "풀스택 · 인프라", en: "Full-stack · Infra" }, roleKey: "dev",
    match: ["ESFJ", "ESTJ"],
    phrase: { ko: "클라우드? 그냥 내 컴퓨터에서 돌리면 되죠.", en: "Cloud? I'll just run it on my own machine." },
    desc: { ko: "클라우드 없이 로컬에서 모델을 직접 뜯어 굴리는 해커. 설명서보단 손으로, 실전으로 문제를 푸는 메이커예요.", en: "A hacker who runs models locally, hands-on — solves by tinkering, not by reading the manual." },
    whyModel: { ko: "클라우드 없이 내 컴퓨터에서 직접 모델을 받아 뜯어 굴리는 로컬 해커의 도구예요. 뜯어보고 커스텀하는 그 손맛이 핵심이죠.", en: "The local hacker's tool — pull a model onto your own machine and take it apart. The tinkering hands are the whole identity." },
    strengths: { ko: "로컬 실행·커스텀·완전한 자유도, 손맛", en: "Local-run, custom, total control — real maker hands" },
    weakness: { ko: "설명은 생략, “코드 보면 됨” 식", en: "Skips the explanation — “just read the code”" },
    accent: "from-emerald-400 to-cyan-500",
    variants: {
      A: { name: { ko: "쿨한 장인 Ollama", en: "Cool-maker Ollama" }, line: { ko: "안 되면 바로 다른 모델로 갈아끼워요.", en: "Won't run? Swaps in another model on the spot." } },
      T: { name: { ko: "예민한 장인 Ollama", en: "Edgy-maker Ollama" }, line: { ko: "로컬 세팅 하나 꼬이면 끝까지 붙잡아요.", en: "One broken local setup and they wrestle it to the end." } },
    },
  },
  ISFP: {
    mbti: "ISFP", model: "Midjourney", emoji: "🎨", logo: "",
    role: { ko: "디자인 · 비주얼", en: "Design · Visuals" }, roleKey: "design",
    match: ["ESFJ", "ESTJ"],
    phrase: { ko: "느낌 아니까.", en: "I just know the vibe." },
    desc: { ko: "말보다 비주얼로 말하는 조용한 예술가. 감각과 미감, 무드 중심의 모험가예요.", en: "A quiet artist who speaks in visuals — led by feel, taste, and mood." },
    whyModel: { ko: "정확성보다 미감, 돛단배 로고가 말하는 “예술적 여정”의 브랜드예요. 설명 대신 압도적 비주얼로 말하죠.", en: "Taste over accuracy — the sailboat mark says “artistic voyage.” It speaks in striking visuals, not words." },
    strengths: { ko: "압도적 비주얼·분위기, 미감", en: "Striking visuals, atmosphere, taste" },
    weakness: { ko: "말로 설명 못 함, 논리 약함 (예쁜데 이유는 몰라)", en: "Can't explain it — pretty, but why?" },
    accent: "from-emerald-400 to-cyan-500",
    variants: {
      A: { name: { ko: "마이웨이 Midjourney", en: "My-way Midjourney" }, line: { ko: "내 무드대로, 평가 신경 안 써요.", en: "Their mood, their way — unbothered by ratings." } },
      T: { name: { ko: "여린 예술가 Midjourney", en: "Sensitive Midjourney" }, line: { ko: "좋아요 수에 그날 기분이 좌우돼요.", en: "Their day rides on the like count." } },
    },
  },
  ESTP: {
    mbti: "ESTP", model: "Mistral", emoji: "🌬️", logo: "mistralai",
    role: { ko: "그로스 · 해커톤 스프린터", en: "Growth · Hackathon sprinter" }, roleKey: "growth",
    match: ["ISTJ", "ISFJ"],
    phrase: { ko: "고민은 짧게, 출시는 빠르게.", en: "Think fast, ship faster." },
    desc: { ko: "작고 날렵하게 치고 빠지는 도전자. 대담하고 린하게 빠르게 실행하는 사업가예요.", en: "A nimble challenger who strikes and moves — bold, lean, fast to execute." },
    whyModel: { ko: "“훨씬 큰 모델의 품질을 훨씬 작은 비용으로” — 린하고 빠르게 치고 나가는 유럽의 도전자예요.", en: "“The quality of much bigger models at a fraction of the cost” — Europe's lean, fast challenger." },
    strengths: { ko: "경량·고속·가성비, 빠른 출시", en: "Light, fast, scrappy — ships quick" },
    weakness: { ko: "깊이보다 속도 (일단 내고 보자)", en: "Speed over depth — ship now, ask later" },
    accent: "from-emerald-400 to-cyan-500",
    variants: {
      A: { name: { ko: "배짱의 Mistral", en: "Gutsy Mistral" }, line: { ko: "일단 출시, 욕먹어도 쿨해요.", en: "Ships first, shrugs off the heat." } },
      T: { name: { ko: "조급한 Mistral", en: "Impatient Mistral" }, line: { ko: "경쟁사 출시 소식에 밤새 스펙을 갈아엎어요.", en: "A rival's launch, and they redo the spec overnight." } },
    },
  },
  ESFP: {
    mbti: "ESFP", model: "Suno", emoji: "🎵", logo: "suno",
    role: { ko: "무대 · 데모 · 발표 퍼포먼스", en: "Stage · Demo · Performance" }, roleKey: "growth",
    match: ["ISTJ", "ISFJ"],
    phrase: { ko: "일단 한 곡 뽑고 시작하자!", en: "Let's drop a track and get going!" },
    desc: { ko: "분위기 살리는 무대 체질. 흥 넘치고 즉흥적인, 파티의 중심인 퍼포머예요.", en: "A born performer who lifts the room — spontaneous, full of spark, the center of the party." },
    whyModel: { ko: "한 줄 프롬프트로 완성된 곡을 뽑아내는 즉흥 창작가예요. 완성도보다 지금 이 순간의 바이브가 먼저죠.", en: "It spins a full track from a one-line prompt — the vibe of the moment over polish." },
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
    ko: "14개의 질문으로 알아보는 나의 빌더 유형. 결과는 16개 AI 모델 중 하나로 나와요.",
    en: "14 questions reveal your builder type — your result is one of 16 AI models.",
  },
  start: { ko: "테스트 시작하기", en: "Start the test" },
  meta: { ko: "14문항 · 약 3분 · 결과 공유 가능", en: "14 questions · ~3 min · shareable result" },
  prev: { ko: "이전", en: "Back" },
  progressLabel: { ko: "진행 상황", en: "Progress" },
  question: { ko: "질문", en: "Question" },

  // "Analyzing…" interstitial shown after the last answer (skipped on reduced motion).
  analyzing: [
    { ko: "답변 패턴 분석 중…", en: "Analyzing your answers…" },
    { ko: "16개 AI 모델과 대조 중…", en: "Matching against 16 AI models…" },
    { ko: "당신의 모델 확정!", en: "Locking in your model!" },
  ] as Phrase[],
  youAre: { ko: "당신은", en: "You are" },
  resultEyebrow: { ko: "당신의 결과", en: "Your result" },
  strengthsLabel: { ko: "강점", en: "Strengths" },
  weaknessLabel: { ko: "약점", en: "Weak spot" },
  whyModel: { ko: "왜 이 모델이냐면", en: "Why this model" },
  axesLabel: { ko: "성향 분석", en: "Your breakdown" },
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

  // Session recommendation
  recEyebrow: { ko: "맞춤 세션 추천", en: "Sessions for you" },
  recPrompt: {
    ko: "결과에 맞춰, 빌더톤에서 참여하면 좋을 세션을 골라드려요.",
    en: "Based on your result, here are the builderthon sessions worth joining.",
  },
  recCta: { ko: "내게 맞는 세션 추천받기", en: "Show my sessions" },
  recTitle: { ko: "당신에게 추천하는 세션", en: "Your recommended sessions" },
  recView: { ko: "프로그램에서 보기", en: "See in program" },
  recNote: {
    ko: "* 8일 프로그램 중 당신과 잘 맞는 세션이에요. 미리 체크해두고 그날 챙겨보세요.",
    en: "* Sessions from the 8-day program that fit you — bookmark them and catch them on the day.",
  },
};
