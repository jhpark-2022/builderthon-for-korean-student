// ─────────────────────────────────────────────────────────────────────────────
// AI 유형 테스트 12월판의 결과 표 (DECIDED 2026-10-08, 현장 팀 매칭 브리프 2). /match가 읽습니다.
//
// 유형의 성격(질문, 채점, 역할, 궁합 구조)은 8월 그대로이고, 바뀌는 것은 각 유형에 붙는 AI 이름과 그 AI에 대한
// 문장입니다. 그래서 8월 표(data/quiz.ts의 RESULTS)를 고치지 않고 그 위에 덮어씁니다. 8월 표는 한 글자도 바뀌지 않습니다.
//
// ── 이름과 출처 ────────────────────────────────────────────────────────────
// 이름은 2026-10-08에 각 회사의 자체 페이지에서 확인했습니다(아래 줄마다 URL). 사용자가 최종 선택을 맡겼습니다
// ("다 너가 알아서", 2026-10-08). 원칙: 8월의 브랜드가 지금도 있으면 같은 브랜드의 최신 이름으로, 아니면 성격이
// 맞는 지금의 모델로. 확인되지 않은 것은 버전 없이 브랜드 이름만 씁니다.
// whyModel은 그 페이지에서 확인한 사실만 씁니다. 순위나 "1위" 같은 말, 확인하지 못한 수치는 쓰지 않습니다.
// 이름을 바꿀 때는 MODELS_2026_12의 한 줄만 고치면 됩니다(변형 이름은 짧은 이름 short에서 만듭니다).
//
// 기본안에서 달라진 것:
//   INTJ  DeepSeek V4 Pro → DeepSeek-V4.1-Flash. V4-Pro는 2026-09-14부터 V4.1-Flash로 돌려지고 있습니다.
//   ENTJ  Gemini의 Pro 계열 현재 이름은 Gemini 3.1 Pro(preview)입니다. 3.8은 Flash뿐이고 Gemini 4 Argon은 일반 공개 전입니다.
//   INFP  Sora는 종료됐습니다(API 제거 2026-09-24). 8월의 Character.AI를 그대로 둡니다. 회사 페이지로 직접 확인하지는
//         못해 버전 없이 브랜드 이름만이고, 문장도 8월 그대로입니다.
//   ISTJ  Perplexity는 사이트가 조회를 막아 API 문서로만 확인했습니다. 버전 없이 브랜드 이름만.
//   ISFP  Midjourney V8.2, ESFP Suno v6: 확인된 현재 버전을 붙였습니다.
// ─────────────────────────────────────────────────────────────────────────────
import { RESULTS, type MbtiKey, type Question, type Result } from "@/data/quiz";
import type { Phrase } from "@/data/dictionaryCore";

interface ModelRow {
  /** 화면에 보이는 모델 이름. 회사가 쓰는 표기 그대로. */
  model: string;
  /** 변형 이름("흔들림 없는 Claude")에 쓰는 짧은 이름. */
  short: string;
  /** 8월 문장 속의 짧은 이름. 변형 이름에서 이것을 short로 바꿉니다. */
  was: string;
  logo: string;
  emoji?: string;
  whyModel: Phrase;
}

export const MODELS_2026_12: Record<MbtiKey, ModelRow> = {
  // https://api-docs.deepseek.com/news/news260910 (V4.1-Flash, 2026-09-10. V4-Pro 요청을 이쪽으로 돌림)
  INTJ: { model: "DeepSeek-V4.1-Flash", short: "DeepSeek", was: "DeepSeek", logo: "deepseek.svg",
    whyModel: { ko: "2026년 9월에 나온 V4.1-Flash예요. DeepSeek은 한 달 전의 V4-Pro보다 성능, 비용, 속도에서 앞선다며 V4-Pro 요청을 전부 이쪽으로 돌렸죠. 더 가볍게, 더 멀리.", en: "V4.1-Flash, out September 2026. DeepSeek says it beats the month-old V4-Pro on performance, cost and speed, and now routes V4-Pro requests to it. Lighter, and further." } },
  // https://platform.kimi.ai/docs/guide/kimi-k3-quickstart , https://huggingface.co/moonshotai/kimi-k3 (가중치 공개, 1M 맥락)
  INTP: { model: "Kimi K3", short: "Kimi", was: "Llama", logo: "kimi.svg", emoji: "🌙",
    whyModel: { ko: "2.8조 파라미터의 가중치를 공개했고, 100만 토큰의 맥락을 한 번에 읽어요. 긴 글을 끝까지 파고들고, 그 속을 다 같이 뜯어보게 열어 두는 유형이죠.", en: "It released the weights of a 2.8-trillion-parameter model and reads a 1M-token context in one go. It digs to the end of a long text and leaves the hood open for everyone." } },
  // https://ai.google.dev/gemini-api/docs/models (Gemini 3.1 Pro, preview)
  ENTJ: { model: "Gemini 3.1 Pro", short: "Gemini", was: "Gemini", logo: "googlegemini.svg",
    whyModel: { ko: "구글이 문서에서 고급 지능과 복잡한 문제 해결, 에이전트 작업을 내세우는 Pro 계열이에요. 어려운 일을 맡아 끝까지 끌고 가는 유형이죠.", en: "Google's Pro line, pitched in its docs on advanced intelligence, complex problem-solving and agentic work. The type that takes the hard job and drives it home." } },
  // https://docs.x.ai/docs/models , https://docs.x.ai/docs/release-notes (Grok 4.7, 2026-09)
  ENTP: { model: "Grok 4.7", short: "Grok", was: "Grok", logo: "grok.svg",
    whyModel: { ko: "xAI가 문서에 “우리가 만든 것 중 가장 유능한 모델”이라고 적어 둔 모델이에요. 자기 입으로 그렇게 말하는 배짱까지가 이 유형이죠.", en: "xAI's docs call it “the most capable model we've built.” Saying so out loud is half the type." } },
  // https://platform.claude.com/docs/en/about-claude/models/overview (Claude Opus 5.5, 2026-09-22)
  INFJ: { model: "Claude Opus 5.5", short: "Claude", was: "Claude", logo: "anthropic.svg",
    whyModel: { ko: "Anthropic이 “어떤 모델을 쓸지 모르겠으면 여기서 시작하라”고 권하는 모델이에요. 오래 걸리는 일을 조용히, 끝까지 맡는 유형이죠.", en: "The model Anthropic tells you to start with if you're unsure which to use. Built for long-running work, taken on quietly and seen through." } },
  // Sora 종료: https://developers.openai.com/api/docs/deprecations . Character.AI는 8월 그대로(회사 페이지 직접 확인 못 함).
  INFP: { model: "Character.AI", short: "Character.AI", was: "Character.AI", logo: "characterai.png",
    whyModel: RESULTS.INFP.whyModel },
  // https://developers.openai.com/api/docs/models/gpt-6-astra (GPT-6 Astra, 2026-09-03)
  ENFJ: { model: "GPT-6 Astra", short: "ChatGPT", was: "ChatGPT", logo: "openai.svg",
    whyModel: { ko: "OpenAI가 “가장 까다로운 일을 위한, 가장 유능한 모델”이라고 소개해요. 어려운 일일수록 먼저 나서서 사람들을 이끄는 유형이죠.", en: "OpenAI introduces it as its most capable model for the most demanding work. The harder the job, the sooner this type steps up to lead." } },
  // https://www.alibabacloud.com/help/en/model-studio/qwen3-8-max (Qwen3.8-Max)
  ENFP: { model: "Qwen3.8-Max", short: "Qwen", was: "Pi", logo: "qwen.svg", emoji: "🎉",
    whyModel: { ko: "2조 4천억 파라미터의 플래그십이에요. 알리바바는 코딩과 사무 생산성에서 크게 뛰었다고 소개하죠. 쉬지 않고 다음 것을 들고 나오는 유형이에요.", en: "A 2.4-trillion-parameter flagship that Alibaba says takes a major leap in coding and office productivity. The type that always turns up with the next thing." } },
  // https://docs.perplexity.ai/getting-started/overview (API 문서. perplexity.ai 본 사이트는 조회가 막혀 직접 확인 못 함)
  ISTJ: { model: "Perplexity", short: "Perplexity", was: "Perplexity", logo: "perplexity.svg",
    whyModel: { ko: "문서부터 “웹에 근거한, 출처가 붙은 답”을 내세워요. 근거 없이는 말을 꺼내지 않는 유형이죠.", en: "Its docs lead with web-grounded answers with built-in citations. No source, no statement." } },
  // https://openai.com/codex/ , https://github.com/openai/codex
  ISFJ: { model: "Codex", short: "Codex", was: "Copilot", logo: "openai.svg", emoji: "🧰",
    whyModel: { ko: "OpenAI의 코딩 에이전트예요. ChatGPT에서도, 에디터에서도, 터미널에서도 맡은 일을 조용히 끝내 놓죠.", en: "OpenAI's coding agent. In ChatGPT, in your editor or in the terminal, it quietly gets the assigned job done." } },
  // https://docs.z.ai/guides/llm/glm-5.3 (GLM-5.3, 2026-08)
  ESTJ: { model: "GLM-5.3", short: "GLM", was: "Cohere", logo: "", emoji: "📋",
    whyModel: { ko: "Z.ai가 최신 플래그십이라 부르는 모델이에요. 100만 토큰의 맥락을 쥐고 한 번에 12만 8천 토큰까지 써 내려가죠. 긴 일을 체계적으로 끝까지 끌고 가는 유형이에요.", en: "What Z.ai calls its latest flagship: a 1M-token context and up to 128K tokens of output in one go. The type that runs a long job by the book, to the end." } },
  // https://learn.microsoft.com/en-us/microsoft-365/copilot/which-copilot-for-your-organization (2026-10-01)
  ESFJ: { model: "Microsoft Copilot", short: "Copilot", was: "Copilot", logo: "microsoftcopilot.png",
    whyModel: { ko: "Microsoft 365 Copilot 앱이 이제 Microsoft Copilot이라는 이름 하나로 불려요. 일하는 도구 안에 먼저 와 있는 도우미죠.", en: "The Microsoft 365 Copilot app now goes by one name, Microsoft Copilot. The helper that's already inside the tools you work in." } },
  // https://code.claude.com/docs/en/overview
  ISTP: { model: "Claude Code", short: "Claude Code", was: "Ollama", logo: "anthropic.svg", emoji: "🛠️",
    whyModel: { ko: "코드베이스를 읽고, 파일을 고치고, 명령을 실행하는 코딩 도구예요. 터미널에서 바로 돌아가죠. 말보다 손이 먼저 나가는 유형이에요.", en: "A coding tool that reads your codebase, edits files and runs commands, right in your terminal. Hands first, words later." } },
  // https://docs.midjourney.com/hc/en-us/articles/32199405667853-Version (V8.2, 2026-07-24부터 기본)
  ISFP: { model: "Midjourney V8.2", short: "Midjourney", was: "Midjourney", logo: "midjourney.png",
    whyModel: { ko: "지금 기본 버전은 2026년 7월의 V8.2예요. 고쳐 그리는 Edit Model이 새로 들어왔죠. 설명 대신 이미지로 말하는 유형이에요.", en: "The default is now V8.2, from July 2026, with a new Edit Model. The type that answers in images, not explanations." } },
  // https://docs.mistral.ai/models/mistral-medium-3-5-26-04 , https://mistral.ai/news/vibe-remote-agents-mistral-medium-3-5/
  ESTP: { model: "Mistral Medium 3.5", short: "Mistral", was: "Mistral", logo: "mistralai.svg",
    whyModel: { ko: "Mistral이 “첫 플래그십 통합 모델”이라 부르는 모델이에요. 가중치까지 열어서 내놨죠. 일단 내놓고 보는 유형이에요.", en: "Mistral calls it its first flagship merged model, and shipped it with open weights. Put it out there first, see what happens." } },
  // https://suno.com/release-notes/introducing-v6 (v6, 2026-09-09)
  ESFP: { model: "Suno v6", short: "Suno", was: "Suno", logo: "suno.svg",
    whyModel: { ko: "2026년 9월에 나온 v6를 Suno는 어떤 장르든 다듬어진 음악을 내놓는 플래그십이라고 소개해요. 한 줄로 무대를 여는 유형이죠.", en: "Suno introduces v6, out September 2026, as its flagship that delivers polished music across every genre. One line and the stage is open." } },
};

// 브랜드가 바뀐 유형은 그 브랜드의 이야기에 기대던 문장을 새로 씁니다. 말투와 길이는 8월 문장을 따릅니다.
// 성격(유형)이 같으므로 그대로 맞는 문장은 건드리지 않습니다.
const TEXT: Partial<Record<MbtiKey, Partial<Result>>> = {
  INTP: {
    desc: { ko: "가중치를 통째로 여는 사색가. 답보다 “왜 그렇게 되는지”를 파고들고, 그 과정을 다 같이 뜯어보게 열어둬요.", en: "A thinker who ships the weights whole, hooked on the why, and on letting everyone pop the hood." },
  },
  ENFP: {
    phrase: { ko: "일단 같이 해 봐요, 재밌을 것 같아요.", en: "Let's just try it together. It sounds fun." },
    desc: { ko: "쉬지 않고 새 걸 들고 나오는 열정가. 아이디어가 떠오르면 일단 사람들 앞에 풀어놓고, 같이 키워요.", en: "A tireless enthusiast with a new thing every time. An idea lands, they put it in front of people and grow it together." },
    strengths: { ko: "넘치는 에너지와 아이디어, 사람을 끌어들이는 힘", en: "Energy and ideas to spare, and a pull that brings people in" },
    weakness: { ko: "벌여 놓은 게 많아 마무리는 다음에", en: "So many things started that finishing waits till next time" },
    matchWhy: [
      { ko: "아이디어를 열 개 벌여 놓고 결론이 없는 당신 옆에, 얘는 이미 전체 계획을 다 짜놨어요. 당신의 텐션을 얘가 실제 결과물로 바꿔주죠 📐", en: "You've opened ten ideas and landed none; this one already has the whole plan drawn up. They turn your energy into an actual shipped thing 📐" },
      RESULTS.ENFP.matchWhy[1],
    ],
    variants: {
      A: { name: { ko: "여유로운 Qwen", en: "Easygoing Qwen" }, line: { ko: "판을 잔뜩 벌여 놓고도 본인은 느긋해요.", en: "Ten things in the air, and still unhurried." } },
      T: { name: { ko: "오지랖 Qwen", en: "Over-caring Qwen" }, line: RESULTS.ENFP.variants.T.line },
    },
  },
  INFJ: {
    // 둘째 궁합(ENFP)의 "33분째"는 8월 모델의 수치였습니다.
    matchWhy: [
      RESULTS.INFJ.matchWhy[0],
      { ko: "당신이 “이 표현이 맞나” 세 번 고르는 사이, 얘는 이미 팀원 마음을 다 열어놨어요. 당신은 깊이를, 얘는 당신이 너무 조심해서 못 내는 온기를 🫂", en: "While you're picking the right phrasing for the third time, this one has already opened everyone up. You bring the depth, they bring the warmth you're too careful to show 🫂" },
    ],
  },
  ESTJ: {
    desc: { ko: "규칙과 질서로 긴 일을 굴러가게 하는 실행형. 효율과 체계의 화신인 경영자예요.", en: "An operator who keeps a long job running on rules and order. Efficiency incarnate." },
    strengths: { ko: "긴 호흡의 실무 정착, 추진력", en: "Process, follow-through, real-world delivery" },
    matchWhy: [
      RESULTS.ESTJ.matchWhy[0],
      { ko: "당신이 프로세스대로 가려는 걸, 얘는 그냥 터미널에서 뚝딱 돌아가게 만들어요. 당신 체계가 얘 손장난을 출시 가능하게 잡아주죠 🔧", en: "You want everything by the process; this one just hacks it into running, in the terminal. Your structure keeps their tinkering shippable 🔧" },
    ],
  },
  ISTP: {
    phrase: { ko: "설명은 됐고, 터미널부터 열어요.", en: "Skip the explanation. Open the terminal." },
    desc: { ko: "터미널에서 코드를 직접 읽고 고치고 돌리는 장인. 설명서보단 손으로, 실전으로 문제를 푸는 메이커예요.", en: "A maker who reads, edits and runs the code right in the terminal, solving by doing rather than reading the manual." },
    strengths: { ko: "직접 실행, 코드 파악, 완전한 자유도, 손맛", en: "Runs it for real, reads the code, total control, real maker hands" },
    variants: {
      A: { name: { ko: "쿨한 장인 Claude Code", en: "Cool-maker Claude Code" }, line: { ko: "안 되면 바로 다른 방법으로 갈아타요.", en: "Won't run? Switches approach on the spot." } },
      T: { name: { ko: "예민한 장인 Claude Code", en: "Edgy-maker Claude Code" }, line: { ko: "빌드 하나 깨지면 끝까지 붙잡아요.", en: "One broken build and they wrestle it to the end." } },
    },
  },
  ISTJ: {
    // "출처 21개"는 8월의 수치였습니다.
    matchWhy: [
      { ko: "출처를 잔뜩 달아온 당신 자료를 얘가 무대에서 노래로 만들어요. 팩트에 흥 붙이면 무대 찢을 각이죠 🎤", en: "The doc you brought packed with citations, this one turns into a song on stage. Facts + a beat = a stage-stealer 🎤" },
      RESULTS.ISTJ.matchWhy[1],
    ],
  },
  // DECIDED 2026-10-08 (퀴즈와 매칭 리뷰 13): 12월판의 약점 두 줄만 부드럽게. 이 카드는 Day 1 현장에서 팀원이 함께 봅니다.
  // 8월판(data/quiz.ts)의 문장은 그대로입니다.
  ISFJ: {
    weakness: { ko: "맡은 일은 확실히, 먼저 나서는 건 천천히", en: "Solid on what's assigned, slower to step up first" },
  },
  ESFP: {
    weakness: { ko: "흥이 먼저, 꼼꼼한 마무리는 팀과 함께", en: "Energy first; the careful finish goes better with the team" },
  },
  ESTP: {
    matchWhy: [
      { ko: "일단 내고 보는 당신 뒤에서, 얘가 출처를 들고 와 데모 터질 뻔한 걸 잡아줘요. 당신은 속도, 얘는 팩트체크 🔍", en: "You ship first and ask later; this one turns up with sources and catches the thing that would've blown up the demo. You're the speed, they're the fact-check 🔍" },
      RESULTS.ESTP.matchWhy[1],
    ],
  },
};

const swap = (p: Phrase, from: string, to: string): Phrase =>
  from === to ? p : { ko: p.ko.split(from).join(to), en: p.en.split(from).join(to) };

export const RESULTS_2026_12 = Object.fromEntries(
  (Object.keys(RESULTS) as MbtiKey[]).map((k) => {
    const base = RESULTS[k];
    const m = MODELS_2026_12[k];
    const merged: Result = {
      ...base,
      model: m.model,
      logo: m.logo,
      emoji: m.emoji ?? base.emoji,
      whyModel: m.whyModel,
      // 변형 이름("강철 멘탈 DeepSeek")은 짧은 브랜드 이름만 바꿉니다. 문장을 새로 쓴 유형은 아래 TEXT가 덮습니다.
      variants: {
        A: { name: swap(base.variants.A.name, m.was, m.short), line: base.variants.A.line },
        T: { name: swap(base.variants.T.name, m.was, m.short), line: base.variants.T.line },
      },
      ...TEXT[k],
    };
    return [k, merged];
  }),
) as Record<MbtiKey, Result>;

// ─────────────────────────────────────────────────────────────────────────────
// 12월판의 질문 14개 (DECIDED 2026-10-09, 팀 매칭 유머 브리프 4장, D1 기본값: 옷을 12월로 갈아입힌다).
//
// 8월 질문(data/quiz.ts의 QUESTIONS)은 채점이 읽으므로 손대지 않습니다. 이 배열은 화면에 보이는 글만 다릅니다.
// **불변 조건**: 14개의 id, axis, w, a.pole, b.pole과 순서가 QUESTIONS와 완전히 같습니다. 바뀌는 것은 text와 label뿐입니다.
// scripts/verify-quiz.mjs가 이 조건과, 같은 답 14개가 두 판에서 같은 결과를 내는지를 검사합니다. 채점(lib/quizScore.ts)은
// 여전히 QUESTIONS를 읽습니다(극과 가중치가 같으므로 결과가 같습니다).
//
// 장면의 뼈대는 8월 그대로입니다. 축 설명 36개(data/quizExplanations.ts, 두 판이 같이 씀)가 "첫날", "쉬는 시간", "명함",
// "새 툴과 스펙", "10년 뒤", "멘토 앞의 데이터", "데모가 터진 순간", "12시간 전의 더 좋은 아이디어", "무대 내려온 밤"을
// 가리키므로, 그 말이 질문에서 사라지면 설명이 틀린 말이 됩니다. 그래서 브리프 초안에서 둘을 고쳤습니다.
//   Q11  초안은 "자료 링크 더미를 받았다 / 폴더 구조부터 파악"이었는데, 설명 여섯 문장이 "새 툴"과 "스펙"을 말합니다.
//        자료 더미와 함께 받은 "처음 보는 AI 툴"로 두고 선택지의 "상상"과 "스펙"을 살렸습니다.
//   Q1   "어디 학교세요?"가 "서울이세요, 싱가포르세요?"가 됩니다. 설명의 같은 대사는 판 설정의 explainSwaps가 바꿉니다.
// Q3, Q6, Q8, Q12, Q14는 8월 문장 그대로입니다(가운뎃점만 쉼표와 "와"로 풀었습니다. 새 문장에 가운뎃점을 쓰지 않습니다).
// ─────────────────────────────────────────────────────────────────────────────
export const QUESTIONS_2026_12: Question[] = [
  {
    id: "Q1", axis: "MIND", w: 2,
    text: { ko: "Day 1 아침, 팀 매칭 테이블에 처음 보는 넷이 앉았다. 나는?", en: "Day 1, morning. Four strangers at the team-matching table. I…" },
    a: { label: { ko: "일단 티켓 이미지만 보여 주고 분위기부터 읽는다", en: "Show my ticket image and read the room first" }, pole: "I" },
    b: { label: { ko: "“서울이세요, 싱가포르세요?” 먼저 깐다", en: "Open with “Seoul or Singapore?”" }, pole: "E" },
  },
  {
    id: "Q2", axis: "ENERGY", w: 3,
    text: { ko: "기업이 지금 겪는 이슈를 던졌다. 머릿속은?", en: "The company drops the issue it is facing right now. My head goes to…" },
    a: { label: { ko: "“이 회사, 10년 뒤엔 이게 문제겠네” 큰 그림부터", en: "“In 10 years this is their real problem.” The big picture" }, pole: "N" },
    b: { label: { ko: "“그래서 자료는 어디 있죠?” 현실부터", en: "“So where is the material?” The concrete" }, pole: "S" },
  },
  {
    id: "Q3", axis: "NATURE", w: 1,
    text: { ko: "팀원 아이디어가 좀 별로다. 나는?", en: "A teammate's idea is… kind of weak. I…" },
    a: { label: { ko: "“오 좋다! 근데 이건 어때?” 기분 안 상하게", en: "“Love it! but what about this?” Keep it kind" }, pole: "F" },
    b: { label: { ko: "“이 부분 논리적으로 약한데?” 솔직하게 짚음", en: "“This part doesn't hold up.” Say it straight" }, pole: "T" },
  },
  {
    id: "Q4", axis: "TACTICS", w: 4,
    text: { ko: "Day 2 아침. 피치까지 48시간, 돌아가는 첫 버전까지는 4시간. 내 작업 스타일은?", en: "Day 2, morning. 48 hours to the pitch, 4 hours to a first working version. My work style is…" },
    a: { label: { ko: "일단 만들면서 흐름 타기", en: "Start building and ride the flow" }, pole: "P" },
    b: { label: { ko: "시간표부터 짜고 계획대로", en: "Map the schedule, then run the plan" }, pole: "J" },
  },
  {
    id: "Q5", axis: "IDENTITY", w: 3,
    text: { ko: "Day 4, 회사 사람들 앞. 데모가 갑자기 멈췄다. 멘탈은?", en: "Day 4, in front of the company. The demo freezes. My headspace…" },
    a: { label: { ko: "“어떻게든 되겠지” 침착", en: "“We'll figure it out.” Stay calm" }, pole: "A" },
    b: { label: { ko: "“망했다…” 심장 쿵", en: "“We're done…” Heart drops" }, pole: "Tid" },
  },
  {
    id: "Q6", axis: "MIND", w: 8,
    text: { ko: "쉬는 시간, 에너지 충전법은?", en: "On a break, I recharge by…" },
    a: { label: { ko: "사람들이랑 수다 떨기", en: "Chatting with people" }, pole: "E" },
    b: { label: { ko: "혼자 바람 쐬기", en: "Stepping out alone for air" }, pole: "I" },
  },
  {
    id: "Q7", axis: "ENERGY", w: 6,
    text: { ko: "멘토링 시간. 그 일을 실제로 하는 분이 “이거 왜 만들었어요?” 묻는다. 내 대답은?", en: "Mentoring. Someone who does this job for real asks “why did you build this?” I answer with…" },
    a: { label: { ko: "구체적 데이터와 사례로", en: "Concrete data and examples" }, pole: "S" },
    b: { label: { ko: "비전과 의미, 가능성으로", en: "Vision, meaning, what it could become" }, pole: "N" },
  },
  {
    id: "Q8", axis: "NATURE", w: 5,
    text: { ko: "팀 내 의견 충돌. 내 기준은?", en: "The team clashes on a call. My yardstick is…" },
    a: { label: { ko: "뭐가 더 효율적이고 합리적인가", en: "What's more efficient and rational" }, pole: "T" },
    b: { label: { ko: "다들 납득하고 기분 좋은가", en: "Whether everyone's on board and okay" }, pole: "F" },
  },
  {
    id: "Q9", axis: "TACTICS", w: 2,
    text: { ko: "덱 제출 12시간 전, 더 좋은 아이디어가 떠올랐다.", en: "12 hours before the deck is due, a better idea hits me." },
    a: { label: { ko: "위험해, 원래 계획 고수", en: "Too risky, stick to the plan" }, pole: "J" },
    b: { label: { ko: "가보자고, 갈아엎기", en: "Let's go, tear it up and rebuild" }, pole: "P" },
  },
  {
    id: "Q10", axis: "IDENTITY", w: 7,
    text: { ko: "발표는 끝났는데 회사 쪽 질문이 하나도 안 나왔다. 반응이 미지근하다. 집 가는 길의 나는?", en: "The pitch is done and the company asked zero questions. Lukewarm room. On the way home I…" },
    a: { label: { ko: "“그때 그것만 고쳤어도…” 곱씹기", en: "“If only we'd fixed that…” Replay it" }, pole: "Tid" },
    b: { label: { ko: "“잘했으니 됐지, 다음에 또” 툭툭 털기", en: "“We did well, next time.” Shake it off" }, pole: "A" },
  },
  {
    id: "Q11", axis: "ENERGY", w: 1,
    text: { ko: "Day 0, 자료 링크 더미와 함께 처음 보는 AI 툴을 받았다. 나는?", en: "Day 0. A pile of links arrives, plus an AI tool I have never seen. I…" },
    a: { label: { ko: "“이걸로 뭘 만들 수 있을지” 상상부터 부풀림", en: "Dream up everything it could build" }, pole: "N" },
    b: { label: { ko: "“이게 정확히 뭐 하는 건지” 스펙부터 확인", en: "Check exactly what it does, spec by spec" }, pole: "S" },
  },
  {
    id: "Q12", axis: "NATURE", w: 2,
    text: { ko: "팀원이 밤새다 멘붕왔다. 첫 반응은?", en: "A teammate hits a wall after an all-nighter. My first move…" },
    a: { label: { ko: "“괜찮아? 좀 쉬어, 내가 도울게” 다독임부터", en: "“You okay? Rest, I've got you.” The person" }, pole: "F" },
    b: { label: { ko: "“어디서 막혔어? 같이 해결하자” 문제부터", en: "“Where are you stuck? Let's solve it.” The problem" }, pole: "T" },
  },
  {
    id: "Q13", axis: "MIND", w: 4,
    text: { ko: "네트워킹 시간, 여러 나라에서 온 처음 보는 사람들로 방이 꽉 찼다. 나는?", en: "Networking. The room is packed with strangers from several countries. I…" },
    a: { label: { ko: "몇 명이랑 진득하게 깊은 대화", en: "Go deep with just a few people" }, pole: "I" },
    b: { label: { ko: "최대한 많은 사람과 인사하고 명함 뿌리기", en: "Work the room, meet as many as I can" }, pole: "E" },
  },
  {
    id: "Q14", axis: "TACTICS", w: 1,
    text: { ko: "팀 작업 방식을 정할 차례. 나는?", en: "Time to set how the team works. I…" },
    a: { label: { ko: "역할과 순서 딱 나눠서 각자 맡은 것부터", en: "Split roles and order, everyone owns their part" }, pole: "J" },
    b: { label: { ko: "일단 다 같이 붙어서 되는 대로 굴리기", en: "All hands on it together, figure it out as we go" }, pole: "P" },
  },
];
