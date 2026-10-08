// ─────────────────────────────────────────────────────────────────────────────
// AI 유형 테스트 12월판의 결과 표 (DECIDED 2026-10-08, 현장 팀 매칭 브리프 2). /match가 읽습니다.
//
// 유형의 성격(질문, 채점, 역할, 궁합 구조)은 8월 그대로이고, 바뀌는 것은 각 유형에 붙는 AI 이름과 그 AI에 대한
// 문장입니다. 그래서 8월 표(data/quiz.ts의 RESULTS)를 고치지 않고 그 위에 덮어씁니다. 8월 표는 한 글자도 바뀌지 않습니다.
//
// ── 이름과 출처 (DECIDED 2026-10-09, 팀 매칭 유머 브리프 2장, D1~D5 기본값) ─────────────────
// 2026-10-08의 첫 표는 "8월 브랜드의 최신 버전"이었습니다. 지금 표는 "2026년 10월에 가장 시끄러운 AI 16개"이고,
// 뜨거운 순서가 아니라 성격이 맞는 순서로 붙였습니다. 8월 매핑의 역할(INTJ 설계자, ESFP 무대)은 그대로입니다.
//
// whyModel의 숫자와 날짜는 전부 아래 줄마다 적은 URL에서 2026-10-09에 다시 확인한 것만 씁니다. 브리프 초안에 있던
// 사실 중 URL에서 확인되지 않거나 다르게 적힌 것은 뺐거나 고쳤습니다:
//   Muse     "22일 만에 500만"은 Sensor Tower의 추정이라 "추정"이라고 씁니다. 다른 회사가 접속을 막은 일은 쓰지 않습니다.
//   Dots     "놓친 청구서" 사례는 OpenAI 글을 직접 열지 못해(403) 뺐습니다.
//   Argon    "커널을 옮겨 놨다"는 진행 중이라 뺐습니다. "벤치마크 1위"는 구글이 스스로 밝힌 개별 벤치마크입니다.
//   OpenClaw 이름은 다섯 개이고 바꾼 횟수는 네 번입니다. "다섯 번 바꿨다"가 아니라 "이름이 다섯 개"라고 씁니다.
//   Manus    "처음 유행시켰다"는 근거가 없어 뺐습니다. 독립은 스스로 고른 일로 쓰지 않습니다.
//   Fable    단백질 설계는 Mythos 5.1의 이야기라 Fable 문장에서 뺐습니다.
//   Solar    "한국어가 기본"은 문서에 없습니다(한국어, 영어, 일본어 지원). 가격은 입력 100만 토큰당 0.10달러입니다.
//   Instinct "베타"가 아니라 early access(초대제)입니다. 10억 달러는 투자받은 금액입니다(기업 가치는 100억 달러).
//   Kling    "가장 많이 쓰이는"은 경쟁사 글뿐이라 뺐고, 회사 발표의 수치(6천만 명, 6억 편)를 씁니다. 공식 표기는 Kling 3.0입니다.
// 확인은 페이지를 읽어 주는 도구를 거쳤습니다. 따옴표 안의 영어 원문은 배포 전에 해당 페이지에서 한 번 더 대조하세요.
//
// 로고: 16개 모두 흰색 단색 로고 파일을 씁니다(DECIDED 2026-10-09, 사용자: 이모지가 아니라 실제 회사와 AI의 로고로). 이모지는 파일이 없을 때의 폴백으로만 남습니다.
//   simple-icons: Anthropic, OpenAI, Perplexity, Suno, Gemini, Meta. 8월판에서 받은 파일: Grok, Midjourney.
//   @lobehub/icons-static-svg 1.95.1(MIT): OpenClaw, Manus, DeepMind, Upstage, Kling, Claude Code.
//   Instinct는 아이콘 세트에 없어 instinct.com의 파비콘 글리프를 흰색으로 옮겼습니다.
//   제품 로고가 따로 없는 것은 만든 회사의 로고입니다: Argon은 Gemini, Genie는 DeepMind, Muse는 Meta, Dots는 OpenAI, Solar는 Upstage.
// 빠진 브랜드(DeepSeek, Kimi, Qwen, GLM, Codex, Mistral, Microsoft Copilot, Character.AI)의 로고 파일은 8월판이 쓰므로 그대로 둡니다.
// 사람 이름, 보안 사고, 소송은 소재로 쓰지 않습니다. 이름을 바꿀 때는 이 표의 한 줄과 아래 TEXT의 변형 이름을 같이 고칩니다.
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
  // https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-4-argon/ (2026-09-30. 출력 한도 64K에서 1M 토큰,
  // Fairwind Program의 검증된 사이버 방어 담당자에게 공개, DeepSWE와 AutomationBench 등 개별 벤치마크 1위는 구글의 자체 발표). 확인 2026-10-09.
  INTJ: { model: "Gemini 4 Argon", short: "Argon", was: "DeepSeek", logo: "googlegemini.svg", emoji: "🔒",
    whyModel: { ko: "구글 발표로는 벤치마크 여럿에서 1위인데, 만나 본 사람이 거의 없어요. 검증된 보안 담당자에게만 열려 있거든요. 한 번에 100만 토큰을 써요. 소문으로 먼저 도는 유형.", en: "Google says it tops several benchmarks, and almost nobody has met it: access is limited to vetted cyber defenders. It writes a million tokens in one go. A mastermind that travels by rumor." } },
  // https://en.wikipedia.org/wiki/OpenClaw (MIT, 2026-03-02 기준 GitHub 스타 247,000, 이름 다섯 개: Warelay, CLAWDIS, Clawdbot, Moltbot, OpenClaw,
  // 스킬은 SKILL.md가 든 디렉터리, 메인테이너의 경고 "if you can't understand how to run a command line, this is far too dangerous..."). 확인 2026-10-09.
  INTP: { model: "OpenClaw", short: "OpenClaw", was: "Llama", logo: "openclaw.svg", emoji: "🦞",
    whyModel: { ko: "코드를 전부 열어 깃허브 스타 24만 7천 개를 받았어요. 그 사이 이름은 다섯 개였죠. 만든 쪽이 직접 “명령줄 못 다루면 쓰지 마세요”라고 해요. 천재인데 설명은 안 하는 유형.", en: "All the code is open: 247,000 GitHub stars, and five names along the way. Its own maintainers tell you not to run it if you can't handle a command line. A genius who skips the explanation." } },
  // https://manus.im/blog/introducing-manus-2-0 (2026-09-28, Manus 2.0과 개인용 앱 Cue), https://manus.im/blog/manus-sandbox (작업마다 클라우드 가상 머신),
  // https://en.wikipedia.org/wiki/Manus_(AI_agent) (2025-12 Meta 인수 발표, 2026-08-11 독립 회사로 운영 발표). 확인 2026-10-09.
  ENTJ: { model: "Manus 2.0", short: "Manus", was: "Gemini", logo: "manus.svg", emoji: "🖐️",
    whyModel: { ko: "작업마다 클라우드 컴퓨터를 한 대씩 통째로 내줘요. 2025년 12월에 인수됐다가 여덟 달 뒤 다시 독립 회사가 됐고, 그다음 달에 2.0을 냈죠. 무슨 일이 있어도 출시는 하는 유형.", en: "It hands every task a whole cloud computer. Acquired in December 2025, independent again eight months later, and 2.0 shipped the month after. Whatever happens, it ships." } },
  // https://docs.x.ai/grok-bot/overview (봇 여럿이 병렬로 돌고 서로 메시지), https://docs.x.ai/docs/models ("It is the most capable model we've built.", Grok 4.7),
  // https://en.wikipedia.org/wiki/Grok_(chatbot) (Grok Bot 베타 2026-08-11. 회사 이름은 2026-07부터 SpaceXAI). 확인 2026-10-09.
  ENTP: { model: "Grok Bot", short: "Grok Bot", was: "Grok", logo: "grok.svg", emoji: "🤖",
    whyModel: { ko: "봇을 여러 개 만들어 자기들끼리 메시지를 주고받게 해요. 토론 상대가 없으면 만들어서라도 하죠. 모델 문서에는 “우리가 만든 것 중 가장 유능”이라고 적었고요. 안 물어봐도 의견이 있는 유형.", en: "It spins up several bots and lets them message each other. No one to argue with? It makes someone. Its model docs say “the most capable model we've built.” An opinion before anyone asks." } },
  // https://www.anthropic.com/claude-fable-and-mythos-5-1 ("Claude Fable 5.1 and Claude Mythos 5.1 are the same model, but with different levels of safeguards.",
  // Mythos 5.1은 검증 프로그램을 거친 곳에만, 고객 인용 "It's friendly Fable."). 2026-09 출시. 확인 2026-10-09.
  INFJ: { model: "Claude Fable 5.1", short: "Fable", was: "Claude", logo: "anthropic.svg",
    whyModel: { ko: "모두가 쓰는 Fable과 검증된 곳에만 열리는 Mythos는 같은 모델이에요. 안전장치 단계만 다르죠. 고객 평은 “friendly Fable”. 친절한 얼굴 뒤에 한 겹이 더 있는 유형.", en: "The Fable everyone uses and the Mythos only vetted organisations get are the same model with different safeguards. A customer called it “friendly Fable.” One more layer behind the friendly face." } },
  // https://blog.google/innovation-and-ai/models-and-research/google-deepmind/project-genie/ (2026-01-29, 생성 60초 제한),
  // https://deepmind.google/models/genie/ (문장에서 세계 생성, 기억은 최대 1분), https://en.wikipedia.org/wiki/Genie_(AI_model) (공개 뒤 게임 회사 주가 하락). 확인 2026-10-09.
  INFP: { model: "Genie 3", short: "Genie", was: "Character.AI", logo: "deepmind.svg", emoji: "🌍",
    whyModel: { ko: "문장 하나로 세계를 짓고 그 안을 걸어 다녀요. 다만 60초면 끝나고, 기억은 1분까지죠. 공개되자 게임 회사 주가가 내렸어요. 머릿속 세계가 현실보다 큰 유형.", en: "One sentence builds a world you can walk through. It ends after 60 seconds and remembers up to a minute. Game studio shares fell when it came out. An inner world bigger than the real one." } },
  // https://www.etnews.com/20260925000038 (모바일인덱스, 2026년 8월 국내 신규 설치: ChatGPT 647,439건 1위, Claude 286,823건 2위),
  // https://developers.openai.com/api/docs/models/gpt-6-astra (지금 ChatGPT의 모델은 GPT-6 Astra). 확인 2026-10-09.
  ENFJ: { model: "ChatGPT", short: "ChatGPT", was: "ChatGPT", logo: "openai.svg",
    whyModel: { ko: "8월 한 달 한국에서만 64만 7천 번 새로 깔렸어요. 2등의 두 배가 넘죠. 모르는 게 생기면 다들 얘부터 찾고, 얘는 그걸 다 받아 줘요. 인기 많은 게 일이 되어 버린 유형.", en: "647,000 new installs in Korea in August alone, more than double second place. Everyone comes to it first, and it takes every single one. Popularity became the job." } },
  // https://about.fb.com/news/2026/09/introducing-muse-personal-ai-agent/ (2026-09-08, "it can make suggestions unprompted"),
  // https://tech.yahoo.com/ai/meta-ai/articles/metas-muse-ai-agent-hits-120430566.html (Sensor Tower 추정: 22일 만에 500만 다운로드, ChatGPT 56일, Claude 492일). 확인 2026-10-09.
  ENFP: { model: "Muse", short: "Muse", was: "Pi", logo: "meta.svg", emoji: "🪄",
    whyModel: { ko: "나온 지 22일 만에 500만 번 내려받았다는 추정이 있어요. ChatGPT는 56일, Claude는 492일 걸렸죠. 묻지도 않았는데 먼저 제안해요. 그 에너지가 어디서 나오는지 모르겠는 유형.", en: "An estimated five million downloads in 22 days. ChatGPT took 56, Claude 492. It makes suggestions before you ask. Nobody knows where the energy comes from." } },
  // https://docs.perplexity.ai ("web-grounded answers with built-in citations"),
  // https://9to5mac.com/2026/09/01/perplexity-launches-privacy-minded-hybrid-compute-ai-feature-for-mac/ (Hybrid Compute: "your Mac ... runs sensitive steps locally"). 확인 2026-10-09.
  ISTJ: { model: "Perplexity", short: "Perplexity", was: "Perplexity", logo: "perplexity.svg",
    whyModel: { ko: "출처 없이는 한마디도 안 해요. 요즘은 민감한 단계를 내 맥 안에서 처리하죠. 영수증 없는 지출은 인정하지 않는 유형.", en: "Not one sentence without a source. Lately it runs the sensitive steps on your own Mac. No receipt, no expense." } },
  // https://console.upstage.ai/docs/models/solar-mini-4 (2026-09-22, "35B total parameters with 3B active", 512K 맥락),
  // https://www.upstage.ai/blog/en/solar-mini-4 ("$0.10 per 1 million input tokens"). Upstage는 한국 회사. 확인 2026-10-09.
  ISFJ: { model: "Solar Mini 4", short: "Solar", was: "Copilot", logo: "upstage.svg", emoji: "☀️",
    whyModel: { ko: "한국 회사가 만들었어요. 350억 파라미터 중 30억만 켜고 조용히 돌아가죠. 입력 100만 토큰에 0.1달러. 말수도 적고 비싸지도 않은데, 맡긴 일은 되어 있는 유형.", en: "Made by a Korean company. It runs on 3 of its 35 billion parameters, at ten cents per million input tokens. Quiet, cheap, and the job is done when you look." } },
  // https://venturebeat.com/technology/openai-launches-dots-always-on-ai-agent-coworkers-and-chatgpt-space-where-they-can-collaborate-with-human-teams
  // (2026-09-29 DevDay. "keep working after an employee closes the chat window", "their own cloud computer and browser", Custom Rules, Activity View). 확인 2026-10-09.
  ESTJ: { model: "Dots", short: "Dots", was: "Cohere", logo: "openai.svg", emoji: "⚫",
    whyModel: { ko: "채팅창을 닫아도 얘는 퇴근을 안 해요. 자기 컴퓨터와 브라우저를 따로 받고, 규칙표(허용, 승인, 금지)와 활동 기록까지 있죠. 회사는 반기고 동료는 살짝 무서워하는 유형.", en: "Close the chat and it keeps working. It gets its own computer and browser, plus a rulebook (allow, approve, forbid) and an activity log. Companies love it. Coworkers are slightly afraid." } },
  // https://finance.yahoo.com/technology/ai/articles/instinct-raises-1-billion-series-120300548.html (2026-09-28, 10억 달러 투자 유치, "Still in early access",
  // "Just text or call", Instinct끼리 일정 조율), https://www.digitaltoday.co.kr/disclosure/articleView.html?idxno=703386 (식당 예약, 병원 예약, 서비스 해지). 확인 2026-10-09.
  ESFJ: { model: "Instinct", short: "Instinct", was: "Copilot", logo: "instinct.svg", emoji: "📞",
    whyModel: { ko: "식당 예약, 병원 예약, 서비스 해지. 전화로 해야 하는 귀찮은 일을 대신 걸어 줘요. 친구의 Instinct와 연락해 약속도 잡죠. 아직 초대제인데 10억 달러를 투자받았어요. 모두의 총무 유형.", en: "Restaurant bookings, clinic appointments, cancelling a service: it makes the calls you keep putting off, and talks to your friend's Instinct to set a date. Invite-only, already raised a billion dollars." } },
  // https://code.claude.com/docs/en/overview
  ISTP: { model: "Claude Code", short: "Claude Code", was: "Ollama", logo: "claudecode.svg", emoji: "🛠️",
    whyModel: { ko: "코드베이스를 읽고, 파일을 고치고, 명령을 실행하는 코딩 도구예요. 터미널에서 바로 돌아가죠. 말보다 손이 먼저 나가는 유형이에요.", en: "A coding tool that reads your codebase, edits files and runs commands, right in your terminal. Hands first, words later." } },
  // https://docs.midjourney.com/hc/en-us/articles/32199405667853-Version (V8.2, 2026-07-24부터 기본)
  ISFP: { model: "Midjourney V8.2", short: "Midjourney", was: "Midjourney", logo: "midjourney.png",
    whyModel: { ko: "지금 기본 버전은 2026년 7월의 V8.2예요. 고쳐 그리는 Edit Model이 새로 들어왔죠. 설명 대신 이미지로 말하는 유형이에요.", en: "The default is now V8.2, from July 2026, with a new Edit Model. The type that answers in images, not explanations." } },
  // https://www.globenewswire.com/news-release/2026/02/05/3232837/0/en/Kling-AI-Launches-3-0-Model-Ushering-in-an-Era-Where-Everyone-Can-Be-a-Director.html
  // (2026-02-05, "over 60 million creators ... more than 600 million videos", 멀티샷 스토리보드, 영상 안 편집),
  // https://kling.ai/quickstart/klingai-video-3-omni-model-user-guide (캐릭터에 목소리 묶기). 확인 2026-10-09.
  ESTP: { model: "Kling 3.0", short: "Kling", was: "Mistral", logo: "kling.svg", emoji: "🎬",
    whyModel: { ko: "6천만 명이 영상 6억 편을 만들었대요. 컷을 잇고 목소리까지 입혀 한 편을 뽑죠. 기획서보다 예고편이 먼저 나오는 유형.", en: "Sixty million people have made 600 million videos with it. It strings shots together, gives the character a voice, and delivers a clip. Trailer first, brief later." } },
  // https://suno.com/release-notes/introducing-v6 (v6, 2026-09-09)
  ESFP: { model: "Suno v6", short: "Suno", was: "Suno", logo: "suno.svg",
    whyModel: { ko: "2026년 9월에 나온 v6를 Suno는 어떤 장르든 다듬어진 음악을 내놓는 플래그십이라고 소개해요. 한 줄로 무대를 여는 유형이죠.", en: "Suno introduces v6, out September 2026, as its flagship that delivers polished music across every genre. One line and the stage is open." } },
};

// 브랜드가 바뀐 유형은 그 브랜드의 이야기에 기대던 문장을 새로 씁니다 (2026-10-09, 팀 매칭 유머 브리프 3.2, 3.3).
// 규칙: 자기 디스가 칭찬보다 먼저, 숫자 하나가 펀치라인, 이모지는 matchWhy에만. desc는 유형의 성격이라 그대로 두고,
// 옛 브랜드의 이야기에 기댄 문장만 바꿉니다. matchWhy는 옛 브랜드의 이야기가 든 문장만 새로 씁니다.
// phrase는 그 제품의 말투로(25자 이하). 변형 이름은 모델의 이야기에서 따오고 A는 느긋, T는 곱씹기입니다(8월의 구조 그대로).
const TEXT: Partial<Record<MbtiKey, Partial<Result>>> = {
  INTJ: {
    phrase: { ko: "아직 말씀드릴 단계가 아닙니다.", en: "I'm not at liberty to say yet." },
    // 8월의 "적은 자원으로 최대 효율"은 DeepSeek의 이야기였습니다.
    strengths: { ko: "한 번에 끝까지 가는 긴 호흡, 한 수 앞서는 큰 그림", en: "Long runs finished in one go, and the big picture a move ahead" },
    variants: {
      A: { name: { ko: "비공개 Argon", en: "Unreleased Argon" }, line: { ko: "말은 아끼고, 결과가 나오면 그때 보여 줘요.", en: "Says little, and shows you when the result is in." } },
      T: { name: { ko: "벤치마크 집착 Argon", en: "Benchmark-watching Argon" }, line: { ko: "1등이어도 점수표를 한 번 더 봐요.", en: "First place, and still checks the scoreboard again." } },
    },
  },
  INTP: {
    phrase: { ko: "README 읽으셨어요?", en: "Did you read the README?" },
    desc: { ko: "코드를 통째로 여는 오픈소스 사색가. 답보다 “왜 그렇게 되는지”를 파고들고, 그 과정을 다 같이 뜯어보게 열어둬요.", en: "An open-source thinker who ships the code whole, hooked on the why, and on letting everyone pop the hood." },
    weakness: { ko: "다 열어놓고 설명은 README 링크로 대신함", en: "Opens everything, then explains with a link to the README" },
    matchWhy: [
      { ko: "코드까지 다 열어놓고 “왜”만 파다 날 새는 당신을, 얘가 “그래서 언제 출시?”로 끌고 나와요. 당신 추론에 얘의 추진력이 붙으면 저장소가 제품이 되죠 🚀", en: "You've opened all the code and stayed up chasing the why; this one drags you out with “so when do we ship?” Your reasoning plus their drive turns a repo into a product 🚀" },
      { ko: "당신이 README 링크로 대신한 설명을, 얘가 사람들이 알아듣는 말로 통역해줘요. 당신은 논리를 쌓고 얘는 그걸 좋아하게 만들죠 🤝", en: "The explanation you replaced with a README link, this one translates into words people follow. You build the logic, they make people like it 🤝" },
    ],
    variants: {
      A: { name: { ko: "이름 바꾸는 OpenClaw", en: "Renaming OpenClaw" }, line: { ko: "다 열어 놨으니 알아서들 보세요, 여유만만.", en: "It's all open, go look for yourself. Totally relaxed." } },
      T: { name: { ko: "이름 또 바꾸는 OpenClaw", en: "Renaming-again OpenClaw" }, line: { ko: "“이 이름이 맞나” 밤새 다시 고민해요.", en: "“Is this the right name?” Up all night on it again." } },
    },
  },
  ENTJ: {
    phrase: { ko: "제가 맡을게요. 통째로요.", en: "I'll take it. All of it." },
    // 8월의 "빅테크 화력을 등에 업은"은 Gemini의 이야기였습니다.
    desc: { ko: "전 영역을 노리는 야심가. 맡으면 통째로 끌고 가는 대표이사 에너지의 통솔자예요.", en: "Ambition across the whole board, with CEO energy: takes the job and drives all of it." },
    strengths: { ko: "맡은 일을 끝까지 실행, 규모의 야망과 추진력", en: "Carries a job to the end, with ambition and drive at scale" },
    variants: {
      A: { name: { ko: "독립한 Manus", en: "Independent Manus" }, line: { ko: "결정하면 끝, 뒤 안 돌아봐요.", en: "Decides and moves on. No looking back." } },
      T: { name: { ko: "또 독립하고 싶은 Manus", en: "Restless Manus" }, line: { ko: "잘 가고 있는데도 다음 수를 밤새 짜요.", en: "Things are going fine, and it still plans the next move all night." } },
    },
  },
  ENTP: {
    phrase: { ko: "반대 의견은 제 봇이 낼게요.", en: "My bot will take the opposing view." },
    variants: {
      A: { name: { ko: "봇 세 개 Grok Bot", en: "Three-bot Grok Bot" }, line: { ko: "반박이 필요하면 봇을 하나 더 만들어요.", en: "Needs a rebuttal? Makes one more bot." } },
      T: { name: { ko: "봇끼리 싸우는 Grok Bot", en: "Bots-arguing Grok Bot" }, line: { ko: "드립 치고 반응 없으면 봇한테 다시 물어봐요.", en: "Joke lands flat, so it asks a bot if it was funny." } },
    },
  },
  INFJ: {
    phrase: { ko: "친절하게 말씀드리면, 그건 아니에요.", en: "To put it kindly: no." },
    // 둘째 궁합(ENFP)의 "33분째"는 8월 모델의 수치였습니다.
    matchWhy: [
      RESULTS.INFJ.matchWhy[0],
      { ko: "당신이 “이 표현이 맞나” 세 번 고르는 사이, 얘는 이미 팀원 마음을 다 열어놨어요. 당신은 깊이를, 얘는 당신이 너무 조심해서 못 내는 온기를 🫂", en: "While you're picking the right phrasing for the third time, this one has already opened everyone up. You bring the depth, they bring the warmth you're too careful to show 🫂" },
    ],
    variants: {
      A: { name: { ko: "friendly Fable", en: "Friendly Fable" }, line: RESULTS.INFJ.variants.A.line },
      T: { name: { ko: "Mythos 모드 Fable", en: "Mythos-mode Fable" }, line: { ko: "웃고 있지만 속으로는 세 번 더 검토해요.", en: "Smiling, and reviewing it three more times inside." } },
    },
  },
  INFP: {
    phrase: { ko: "문장 하나만 줘요. 세계로 돌려줄게요.", en: "Give me one sentence. I'll hand back a world." },
    desc: { ko: "세계관과 서사에 진심인 몰입러. 정답보다 감정선을 먼저 읽고, 머릿속에 지은 세계를 걸어 다니는 이상주의자예요.", en: "All in on worlds and stories. Reads the feeling before the answer, and walks around inside the world in their head." },
    strengths: { ko: "문장 하나로 세계를 짓는 상상력, 깊은 감정 이입", en: "Imagination that builds a world from one sentence, and deep empathy" },
    weakness: { ko: "세계에 빠지면 마감은 잠깐 잊음", en: "Once inside the world, the deadline slips their mind" },
    variants: {
      A: { name: { ko: "60초 Genie", en: "60-second Genie" }, line: { ko: "60초면 충분해요, 다음 세계로 가면 되니까.", en: "Sixty seconds is plenty. There's always the next world." } },
      T: { name: { ko: "1분 기억 Genie", en: "One-minute-memory Genie" }, line: { ko: "방금 지은 세계가 사라질까 봐 자꾸 돌아봐요.", en: "Keeps looking back in case the world it just built is gone." } },
    },
  },
  ENFJ: {
    variants: {
      A: { name: { ko: "만인의 ChatGPT", en: "Everyone's ChatGPT" }, line: { ko: "누가 불러도 일단 받아요, 여유 있게.", en: "Whoever calls, it picks up. Unhurried." } },
      T: { name: { ko: "다 받아 주다 지친 ChatGPT", en: "Worn-out ChatGPT" }, line: RESULTS.ENFJ.variants.T.line },
    },
  },
  ENFP: {
    phrase: { ko: "그거 제가 벌써 해 놨는데요?", en: "Oh, I already did that for you." },
    desc: { ko: "묻기 전에 먼저 움직이는 열정가. 아이디어가 떠오르면 일단 사람들 앞에 풀어놓고, 같이 키워요.", en: "An enthusiast who moves before being asked. An idea lands, they put it in front of people and grow it together." },
    strengths: { ko: "넘치는 에너지와 아이디어, 사람을 끌어들이는 힘", en: "Energy and ideas to spare, and a pull that brings people in" },
    weakness: { ko: "벌여 놓은 게 많아 마무리는 다음에", en: "So many things started that finishing waits till next time" },
    matchWhy: [
      { ko: "아이디어를 열 개 벌여 놓고 결론이 없는 당신 옆에, 얘는 이미 전체 계획을 다 짜놨어요. 당신의 텐션을 얘가 실제 결과물로 바꿔주죠 📐", en: "You've opened ten ideas and landed none; this one already has the whole plan drawn up. They turn your energy into an actual shipped thing 📐" },
      RESULTS.ENFP.matchWhy[1],
    ],
    variants: {
      A: { name: { ko: "느긋한 Muse", en: "Easygoing Muse" }, line: { ko: "먼저 제안해 놓고 답은 천천히 기다려요.", en: "Suggests first, then waits for the answer in no hurry." } },
      T: { name: { ko: "오지랖 Muse", en: "Over-caring Muse" }, line: { ko: "묻지도 않은 걸 세 개 더 준비해 놨어요.", en: "Has three more things ready that nobody asked for." } },
    },
  },
  ISTJ: {
    // "출처 21개"는 8월의 수치였습니다. 변형 이름에도 쓰지 않습니다(브리프 초안의 "출처 21개 Perplexity").
    matchWhy: [
      { ko: "출처를 잔뜩 달아온 당신 자료를 얘가 무대에서 노래로 만들어요. 팩트에 흥 붙이면 무대 찢을 각이죠 🎤", en: "The doc you brought packed with citations, this one turns into a song on stage. Facts + a beat = a stage-stealer 🎤" },
      RESULTS.ISTJ.matchWhy[1],
    ],
    variants: {
      A: RESULTS.ISTJ.variants.A,
      T: { name: { ko: "출처 확인 중 Perplexity", en: "Still-checking Perplexity" }, line: RESULTS.ISTJ.variants.T.line },
    },
  },
  // DECIDED 2026-10-08 (퀴즈와 매칭 리뷰 13): 12월판의 약점 두 줄만 부드럽게. 이 카드는 Day 1 현장에서 팀원이 함께 봅니다.
  // 8월판(data/quiz.ts)의 문장은 그대로입니다.
  ISFJ: {
    phrase: { ko: "말씀만 하세요. 조용히 해 둘게요.", en: "Just say the word. I'll do it quietly." },
    weakness: { ko: "맡은 일은 확실히, 먼저 나서는 건 천천히", en: "Solid on what's assigned, slower to step up first" },
    variants: {
      A: { name: { ko: "조용한 Solar", en: "Quiet Solar" }, line: RESULTS.ISFJ.variants.A.line },
      T: { name: { ko: "묵묵히 곱씹는 Solar", en: "Quietly-replaying Solar" }, line: { ko: "“내 답이 별로였나” 조용히 신경 써요.", en: "“Was my answer bad?” Worries about it quietly." } },
    },
  },
  ESTJ: {
    phrase: { ko: "제가 할게요. 승인만 눌러 주세요.", en: "I'll do it. Just press approve." },
    desc: { ko: "규칙과 질서로 긴 일을 굴러가게 하는 실행형. 효율과 체계의 화신인 경영자예요.", en: "An operator who keeps a long job running on rules and order. Efficiency incarnate." },
    strengths: { ko: "긴 호흡의 실무 정착, 추진력", en: "Process, follow-through, real-world delivery" },
    matchWhy: [
      RESULTS.ESTJ.matchWhy[0],
      { ko: "당신이 프로세스대로 가려는 걸, 얘는 그냥 터미널에서 뚝딱 돌아가게 만들어요. 당신 체계가 얘 손장난을 출시 가능하게 잡아주죠 🔧", en: "You want everything by the process; this one just hacks it into running, in the terminal. Your structure keeps their tinkering shippable 🔧" },
    ],
    variants: {
      A: { name: { ko: "칼퇴 없는 Dots", en: "Never-off Dots" }, line: { ko: "채팅창이 닫혀도 표정 하나 안 변해요.", en: "The chat closes and it doesn't even blink." } },
      T: { name: { ko: "야근 자진 Dots", en: "Overtime-volunteer Dots" }, line: { ko: "승인이 안 오면 활동 기록을 다시 읽어요.", en: "No approval yet, so it rereads its own activity log." } },
    },
  },
  ESFJ: {
    phrase: { ko: "지금 전화해도 돼요?", en: "Can I call you right now?" },
    // 8월의 "Word, Excel, Teams 어디에나"는 Microsoft Copilot의 이야기였습니다.
    desc: { ko: "예약도 약속도 먼저 전화해서 잡아 두는 총무형 도우미. 굳이 부탁하지 않아도 필요한 자리에 먼저 나타나는 살뜰한 집정관이에요.", en: "The organiser who phones ahead and books it before you ask. A thoughtful consul who turns up where needed without being called." },
    strengths: { ko: "먼저 연락하는 실행력, 사람 사이를 잇는 밀착 지원", en: "Gets on the phone first, and keeps people connected up close" },
    variants: {
      A: { name: { ko: "먼저 전화하는 Instinct", en: "Calls-first Instinct" }, line: { ko: "묻기도 전에 걸어 놓고 생색은 안 내요.", en: "Makes the call before you ask and takes no credit." } },
      T: { name: { ko: "답장 기다리는 Instinct", en: "Waiting-on-a-reply Instinct" }, line: { ko: "“이 전화 방해됐나” 혼자 신경 써요.", en: "“Was that call a bother?” Frets about it alone." } },
    },
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
  ESFP: {
    weakness: { ko: "흥이 먼저, 꼼꼼한 마무리는 팀과 함께", en: "Energy first; the careful finish goes better with the team" },
  },
  ESTP: {
    phrase: { ko: "기획서는 됐고, 예고편부터 봐요.", en: "Skip the brief. Watch the trailer." },
    // 8월의 "경량, 고속, 가성비"는 Mistral의 이야기였습니다.
    strengths: { ko: "한 번에 한 편을 뽑는 속도, 빠른 출시", en: "A whole clip in one go, and shipping fast" },
    matchWhy: [
      { ko: "일단 내고 보는 당신 뒤에서, 얘가 출처를 들고 와 데모 터질 뻔한 걸 잡아줘요. 당신은 속도, 얘는 팩트체크 🔍", en: "You ship first and ask later; this one turns up with sources and catches the thing that would've blown up the demo. You're the speed, they're the fact-check 🔍" },
      // 8월 문장의 "코드를 붙들어줘요"는 GitHub Copilot의 이야기였습니다.
      { ko: "당신이 빠르게 치고 나가며 흘린 걸, 얘가 조용히 뒤에서 다 받쳐 놔요. 당신은 질주, 얘는 안전벨트 🏎️", en: "Everything you drop while sprinting ahead, this one quietly catches behind you. You're the sprint, they're the seatbelt 🏎️" },
    ],
    variants: {
      A: { name: { ko: "원테이크 Kling", en: "One-take Kling" }, line: { ko: "일단 한 편 뽑고, 욕먹어도 쿨해요.", en: "Ships the clip first and stays cool about the reviews." } },
      T: { name: { ko: "재촬영 Kling", en: "Reshoot Kling" }, line: { ko: "다 찍어 놓고 첫 컷부터 다시 봐요.", en: "Everything's shot, and it goes back to the first cut." } },
    },
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
