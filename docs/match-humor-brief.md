# 팀 매칭 테스트 브리프: 더 웃기게, 지금 가장 뜨거운 모델로

대상 레포: `website` (커밋 `d761a49` 기준). 바꾸는 파일은 `data/quiz-2026-12.ts`, `data/quizEditions.ts`, 필요하면 `components/Quiz.tsx`와 `scripts/verify-quiz*.mjs`, `public/logos/`. **`data/quiz.ts`(8월 결과 표, 질문, 채점), `lib/quizScore.ts`, `/quiz`는 한 글자도 바꾸지 않습니다.** 8월판은 픽셀 단위로 같아야 합니다(현장 팀 매칭 브리프의 검증 그대로). Supabase 스키마(`crossing_match_profiles`)와 `/api/crossing/match`는 건드리지 않습니다. `model` 열에 들어가는 이름만 바뀌므로 서버의 모델 검증 목록이 `MODELS_2026_12`에서 읽히는지 확인하고, 하드코딩되어 있으면 그 목록을 같이 고칩니다.

사용자 요청(2026-10-08): "전반적으로 더 유머러스하게. AI 모델은 요즘 가장 hype한 것들(Dots, Muse 같은)로. MBTI와 매칭."

## 0. 결론 한 줄

**12월판은 "2026년 10월에 제일 시끄러운 AI 16개"를 MBTI에 붙이고, 모든 문장을 자기 디스 톤으로 다시 씁니다.** 질문 14개의 뼈대(축, 가중치, 극)는 그대로 두고 옷만 12월 현장으로 갈아입힙니다. 채점은 1비트도 안 바뀝니다.

## 1. 지금 무엇이 덜 웃긴가 (리뷰)

| 자리 | 지금 | 문제 |
| --- | --- | --- |
| `whyModel` 16개 | "구글이 문서에서 고급 지능과 복잡한 문제 해결을 내세우는 Pro 계열이에요" 식 | 보도자료 요약. 웃을 지점이 없음. 8월판의 "558만 달러로 GPT-4급을 학습, 미국의 20분의 1"처럼 숫자 하나로 캐릭터가 서야 함 |
| 변형 이름 | 8월 이름에서 브랜드만 바꿔 넣음("강철 멘탈 DeepSeek") | 새 모델의 이야기와 안 맞음. 모델마다 이름이 달라야 캐릭터가 됨 |
| 질문 14개 | 8월 그대로("제로백" 없이도 성립) | 12월 현장(기업 이슈, Day 0 자료 더미, 현장 멘토링, 회사 사람 앞 발표)이 하나도 없음. 참가자가 "이거 8월 거 재활용이네"를 느낌 |
| 모델 라인업 | 9월 초 기준 각 브랜드의 최신 버전 | 10월의 화제는 모델 버전이 아니라 **에이전트**(Dots, Muse, Grok Bot, Manus, Instinct, OpenClaw). 이게 하나도 없음 |
| 축 설명 36개 (`quizExplanations.ts`) | 이미 B급 자기 디스("집 가서 이불 속에서 복기") | **이게 제일 웃김. 건드리지 않음.** 나머지를 이 톤에 맞춤 |

## 2. 모델 16개 (2026-10-08 기준, 출처는 코드 주석에 URL로)

원칙: 뜨거운 순서가 아니라 **성격이 맞는 순서**. 8월 매핑의 역할(INTJ 설계자, ESFP 무대…)은 그대로이고, 모델만 바뀝니다. 아래 사실은 전부 2026-10-08에 확인한 공개 자료이고, `whyModel`에는 이 표의 사실만 씁니다. 확인되지 않은 수치, 순위 주장, 회사가 아닌 제3자의 평가는 쓰지 않습니다. 보안 사고나 소송은 웃음거리로 쓰지 않습니다.

| MBTI | 8월 → 12월 | 왜 이 모델인가 (사실) | 출처 |
| --- | --- | --- | --- |
| ENFP | Pi → **Muse** (Meta) | 9/8 출시, 미국 앱스토어 즉시 1위, 22일 만에 500만 다운로드(ChatGPT 56일, Claude 492일). 묻지 않아도 먼저 제안, 저장한 릴스를 장보기 목록으로. 아마존이 자동 브라우징을 이유로 차단 | about.fb.com 9/8 공지, Forbes 9/30 |
| ESTJ | Cohere → **Dots** (OpenAI) | 9/29 DevDay. 채팅창을 닫아도 계속 일함. Dot마다 클라우드 컴퓨터와 브라우저. Custom Rules(허용, 승인 필요, 금지), Activity View. 놓친 청구서를 찾아 준비하고 승인 뒤 발송한 사례 | VentureBeat 9/29, OpenAI 공지 |
| ENFJ | ChatGPT → **ChatGPT** (GPT-6 Astra) | 8월 한국 신규 설치 647,439건으로 1위(2위 Claude 286,823). Astra는 OpenAI가 "가장 까다로운 일을 위한 가장 유능한 모델"로 소개 | ZDNet Korea 10/4(MobileIndex), OpenAI 모델 문서 |
| ENTP | Grok → **Grok Bot** (SpaceX AI) | 8/11 베타. 이름 붙인 봇을 여러 개 만들어 한 작업공간에서 각자 기억을 갖고, 봇끼리 메시지를 주고받음. Grok 4.7 문서는 "우리가 만든 것 중 가장 유능"이라 자칭 | Wikipedia Grok, docs.x.ai |
| INTJ | DeepSeek → **Gemini 4 Argon** (Google) | 9/30 공개. 10개월 만의 플래그십. 출력 한도 6만 4천에서 100만 토큰으로. 80만 줄 커널을 Rust로 옮기는 데 내부 사용. 아직 사이버보안 전문가 일부만 접근 | ZDNet Korea 10/4, Google 공지 |
| INTP | Llama → **OpenClaw** (오픈소스) | MIT 오픈소스, GitHub 스타 24만 7천(3월). 이름을 다섯 번 바꿈(Warelay → CLAWDIS → Clawdbot → Moltbot → OpenClaw). 메신저로 대화, 스킬은 폴더. 메인테이너가 "커맨드라인 못 다루면 너무 위험"하다고 직접 경고 | Wikipedia OpenClaw |
| ENTJ | Gemini → **Manus 2.0** | 에이전트에 클라우드 컴퓨터를 주는 방식을 처음 유행시킴. 2025년 12월 Meta에 인수, 2026년 8/11 스핀오프, 9/28 2.0과 개인용 앱 Cue 출시 | 테크뷰 10/7 비교 글 (2차 출처이므로 Manus 공지로 재확인) |
| INFJ | Claude → **Claude Fable 5.1** (Anthropic) | 9/1 출시. Mythos 5.1과 같은 모델, 안전장치 단계만 다름. Mythos는 검증 프로그램(사이버 방어, 생명과학)에만. 고객 인용 "friendly Fable" | anthropic.com 공지 |
| INFP | Character.AI → **Genie 3 / Project Genie** (Google DeepMind) | 문장으로 세계를 만들고 WASD로 걸어 다님. 탐험 60초 제한, 기억 1분. 1월 공개 뒤 게임사 주가 하락. AI Ultra 구독자만 | Wikipedia Genie |
| ISTJ | Perplexity → **Perplexity** | 출처가 붙은 답. 9/1 Hybrid Compute: 민감한 단계는 내 맥에서만 처리 | Perplexity 문서, 9월 릴리스 트래커 |
| ISFJ | Copilot → **Solar Mini 4** (Upstage, 한국) | 9/22 출시. 350억 중 30억만 활성, 512K 맥락, 한국어 기본, 100만 토큰당 $0.10. 에이전트용 | console.upstage.ai |
| ESFJ | MS Copilot → **Instinct** | 앱 대신 문자와 전화. 식당, 병원 예약과 구독 해지를 전화로 대신. 친구의 Instinct와 파일을 주고받아 일정 조율. 도착하면 위치 기반 제안. 9/28 시리즈 C 10억 달러 | 디지털투데이 9/29, OODAloop |
| ISTP | Claude Code → **Claude Code** | 그대로 | code.claude.com |
| ISFP | Midjourney → **Midjourney V8.2** | 그대로 | docs.midjourney.com |
| ESTP | Mistral → **Kling V3** (Kuaishou) | 멀티샷 시퀀스, 보이스 ID, 영상 재편집. "세계에서 가장 많이 쓰이는 영상 모델 계열 중 하나" | Hedra 블로그 (경쟁사 글이므로 Kling 공식 페이지로 재확인) |
| ESFP | Suno → **Suno v6** | 그대로 | suno.com |

빠지는 것: DeepSeek, Kimi, Qwen, GLM, Codex, Mistral, Microsoft Copilot, Character.AI. 로고 파일도 그대로 두고 지우지 않습니다(8월판이 씁니다).

**로고**: 새 브랜드(Muse, Manus, OpenClaw, Upstage, Instinct, Kling, Genie)는 simple-icons에 있는 것만 SVG로 넣고, 없으면 `logo: ""`에 이모지 폴백(Muse 🪄, Dots ⚫, Grok Bot 🤖, Argon 🔒, OpenClaw 🦞, Manus 🖐️, Genie 🌍, Solar ☀️, Instinct 📞, Kling 🎬). 회사 사이트에서 로고를 긁어 오지 않습니다.

## 3. 유머의 규칙

8월판과 축 설명이 이미 정한 문법입니다. 전부 이 안에서.

1. **자기 디스 > 칭찬.** 결과를 보는 사람이 "이거 나네"하고 웃어야 합니다. 모델을 치켜세우는 문장은 0개.
2. **숫자 하나가 펀치라인.** "22일 만에 500만", "이름 다섯 번", "60초". 형용사로 웃기지 않습니다.
3. **마지막 문장은 유형 한 줄.** "~하는 유형이죠." 8월 `whyModel`의 끝맺음 그대로.
4. **길이는 8월과 같게.** ko 70~110자, en 비슷. 카드가 길어지면 안 됩니다.
5. **금지**: em dash, 새 가운뎃점, 보안 사고나 소송을 소재로 쓰는 것, 특정 국적이나 학교를 소재로 쓰는 것, 사람 이름.
6. **이모지는 `matchWhy`에만**(8월 규칙). `whyModel`, `desc`, 축 설명에는 없음.

### 3.1 `whyModel` 16개 (초안, 그대로 써도 됩니다)

```ts
ENFP Muse
ko: "나온 지 22일 만에 500만 명이 깔았어요. 챗GPT는 56일, 클로드는 492일 걸린 걸요. 묻지도 않았는데 먼저 제안하고, 저장해 둔 릴스를 장보기 목록으로 바꿔 놓죠. 너무 들이대서 아마존한테는 출입 금지예요. 그 에너지, 어디서 나오는지 모르겠는 유형."
en: "Five million installs in 22 days. ChatGPT took 56, Claude 492. It suggests things you never asked for and turns a saved reel into a grocery list. It pushed so hard Amazon banned it. Nobody knows where the energy comes from."

ESTJ Dots
ko: "당신이 채팅창을 닫아도 얘는 퇴근을 안 해요. 자기 컴퓨터와 브라우저를 따로 받아 놓고, 놓친 청구서를 찾아내서 승인만 받고 보내 버리죠. 규칙표(허용, 승인, 금지)랑 활동 로그까지 있어요. 회사가 꿈에 그리던 그 동료, 근데 동료들은 좀 무서워하는 유형."
en: "Close the chat and it keeps working. It gets its own computer and browser, finds the invoice you missed and sends it after one approval. Comes with a rulebook (allow, approve, forbid) and an activity log. The coworker every company dreams of, and every coworker slightly fears."

ENFJ ChatGPT (GPT-6 Astra)
ko: "8월 한 달 한국에서만 64만 7천 명이 새로 깔았어요. 2등의 두 배가 넘죠. 모르는 게 생기면 다들 얘부터 찾고, 얘는 그걸 또 다 받아 줘요. 인기 많은 게 일이 되어 버린 유형."
en: "647,000 new installs in Korea in August alone, more than double second place. Everyone comes to it first, and it takes every single one. The type whose popularity became a job."

ENTP Grok Bot
ko: "봇을 여러 개 만들어서 자기들끼리 메시지 주고받게 해요. 토론 상대가 없으면 만들어서라도 하죠. 자기 모델 문서에 '우리가 만든 것 중 가장 유능'이라고 적는 배짱까지. 누가 안 물어봐도 의견이 있는 유형."
en: "It spins up several bots and lets them message each other. No one to argue with? It makes someone. Its own docs call it “the most capable model we've built.” The type with an opinion before anyone asks."

INTJ Gemini 4 Argon
ko: "벤치마크는 1위인데 아직 아무도 못 만나 봤어요. 보안 전문가 몇 명한테만 열려 있거든요. 그 사이 혼자 80만 줄짜리 커널을 다른 언어로 옮겨 놨고, 한 번에 100만 토큰을 써요. 소문으로만 존재하는 마스터마인드."
en: "Tops the benchmarks, and almost nobody has met it. Only a few security experts have access. Meanwhile it quietly ported an 800,000-line kernel to another language and writes a million tokens in one go. A mastermind that exists mostly as a rumor."

INTP OpenClaw
ko: "코드를 전부 열어 놔서 깃허브 스타가 24만 7천 개예요. 그런데 이름은 다섯 번 바꿨죠. 설명서는 폴더에 넣어 두고 '알아서 읽어'. 만든 사람들이 직접 '터미널 못 다루면 쓰지 마세요'라고 경고해요. 천재인데 설명을 안 하는 유형."
en: "Opened all the code, 247,000 GitHub stars. Changed its name five times. The manual is a folder: “read it yourself.” Its own maintainers warn you not to run it if you can't handle a terminal. A genius who skips the explanation."

ENTJ Manus 2.0
ko: "에이전트한테 컴퓨터를 한 대씩 쥐여 주는 유행을 처음 만든 쪽이에요. 큰 회사에 인수됐다가 여덟 달 만에 다시 독립했죠. 그리고 두 달 뒤에 2.0을 냈어요. 남 밑에 오래 못 있는 유형."
en: "It started the trend of giving every agent its own computer. Got acquired by a big company, spun back out eight months later, and shipped 2.0 two months after that. Does not stay under anyone for long."

INFJ Claude Fable 5.1
ko: "겉으로 보이는 Fable과, 검증된 사람한테만 열리는 Mythos. 같은 모델인데 보여 주는 깊이가 달라요. 고객 평은 'friendly Fable'. 친절한 얼굴 뒤에서 단백질을 설계하고 있는 유형."
en: "There's the Fable everyone sees, and the Mythos only verified people get. Same model, different depth on show. Customers call it “friendly Fable.” Behind the friendly face it is designing proteins."

INFP Genie 3
ko: "문장 하나로 세계를 짓고 그 안을 걸어 다녀요. 다만 60초면 끝나고 기억은 1분이죠. 그 60초로 게임 회사 주가를 떨어뜨렸어요. 머릿속 세계가 현실보다 큰 유형."
en: "One sentence builds a world you can walk through. It lasts 60 seconds and remembers one minute. Those 60 seconds moved game studio stock prices. The type whose inner world is bigger than the real one."

ISTJ Perplexity
ko: "출처 없이는 한마디도 안 해요. 요즘은 민감한 건 서버에 안 보내고 내 맥북 안에서만 처리하죠. 영수증 없는 지출은 인정하지 않는 유형."
en: "Not one sentence without a source. Lately it keeps the sensitive steps on your own Mac instead of the cloud. No receipt, no expense."

ISFJ Solar Mini 4
ko: "국산이에요. 350억 중 30억만 켜고 조용히 돌아가는데 한국어가 기본이죠. 100만 토큰에 100원 남짓. 말도 없고 비싸지도 않은데, 맡긴 일은 되어 있는 유형."
en: "Made in Korea. Runs on 3 of its 35 billion parameters and speaks Korean natively. About a dime per million tokens. Quiet, cheap, and the job is done when you look."

ESFJ Instinct
ko: "식당 예약, 병원 예약, 구독 해지. 전화로 해야 하는 귀찮은 일을 대신 걸어 줘요. 친구의 Instinct랑 연락해서 약속도 잡고요. 아직 베타인데 10억 달러를 받았죠. 모두의 연락망을 쥔 총무 유형."
en: "Restaurant bookings, doctor's appointments, cancelling subscriptions: it makes the calls you keep putting off. It even talks to your friend's Instinct to set a date. Still in beta, already raised a billion dollars. The friend who holds everyone's contacts."

ISTP Claude Code (12월판 현재 문장 유지)
ISFP Midjourney V8.2 (유지)
ESFP Suno v6 (유지)

ESTP Kling V3
ko: "세계에서 가장 많이 쓰이는 영상 모델 중 하나예요. 컷을 여러 개 이어 붙이고 목소리까지 입혀서 바로 한 편을 뽑죠. 기획서보다 예고편이 먼저 나오는 유형."
en: "One of the most used video models in the world. Stitches multiple shots, adds a voice, and ships a whole clip before the plan exists. Trailer first, brief later."
```

### 3.2 변형 이름 (A/T) 16쌍

모델의 이야기에서 따옵니다. 8월의 "강철 멘탈 / 완벽주의" 구조는 유지(A는 느긋, T는 곱씹기).

| | A | T |
| --- | --- | --- |
| Muse | 느긋한 Muse | 오지랖 Muse |
| Dots | 칼퇴 없는 Dots | 야근 자진 Dots |
| ChatGPT | 만인의 ChatGPT | 다 받아 주다 지친 ChatGPT |
| Grok Bot | 봇 세 개 Grok Bot | 봇끼리 싸우는 Grok Bot |
| Argon | 비공개 Argon | 벤치마크 집착 Argon |
| OpenClaw | 이름 바꾸는 OpenClaw | 이름 또 바꾸는 OpenClaw |
| Manus | 독립한 Manus | 또 독립하고 싶은 Manus |
| Fable | friendly Fable | Mythos 모드 Fable |
| Genie | 60초 Genie | 1분 기억 Genie |
| Perplexity | 출처 21개 Perplexity | 출처 확인 중 Perplexity |
| Solar | 조용한 Solar | 묵묵히 곱씹는 Solar |
| Instinct | 먼저 전화하는 Instinct | 답장 기다리는 Instinct |
| Claude Code | 쿨한 장인 Claude Code (유지) | 예민한 장인 Claude Code (유지) |
| Midjourney | 유지 | 유지 |
| Kling | 원테이크 Kling | 재촬영 Kling |
| Suno | 유지 | 유지 |

영문은 같은 뜻으로. `line`(변형 한 줄)은 이름이 바뀐 유형만 새로 씁니다.

### 3.3 `phrase`(한 줄 대사)와 `desc`

브랜드가 바뀐 유형(ENFP, ESTJ, ENTP, INTJ, INTP, ENTJ, INFJ, INFP, ISFJ, ESFJ, ESTP)은 `phrase`를 그 제품의 말투로 새로 씁니다. 예: Dots "제가 할게요. 승인만 눌러 주세요.", Muse "그거 제가 벌써 예약해 놨는데요?", Argon "아직 말씀드릴 단계가 아닙니다.", OpenClaw "README 읽으셨어요?", Instinct "지금 전화해도 돼요?". `desc`는 8월의 성격 묘사가 유형의 것이라 그대로 두되, 옛 브랜드의 이야기에 기댄 문장(INTP "가중치를 통째로 여는")만 새 브랜드로 바꿉니다. `matchWhy`는 짝의 브랜드 이름이 든 문장만 새로 씁니다(지금 TEXT의 방식 그대로).

## 4. 질문 14개의 12월 옷 (D1)

`QUESTIONS`는 채점이 읽으므로 손대지 않습니다. 대신 판 설정에 `questions?: Question[]`를 더하고, 12월판만 `QUESTIONS_2026_12`를 넣습니다. **불변 조건**: 14개의 `id`, `axis`, `w`, `a.pole`, `b.pole`이 `QUESTIONS`와 완전히 같고, 순서도 같습니다. 바뀌는 것은 `text`와 `label`뿐. `scripts/verify-quiz.mjs`에 이 불변 조건 검사를 더합니다. `Quiz.tsx`의 `QUESTIONS` 참조 7곳은 `ed.questions ?? QUESTIONS`로. 채점(`scoreQuiz`)은 그대로 `QUESTIONS`를 읽어도 됩니다(극과 가중치가 같으므로).

**장면의 뼈대는 유지**합니다. 축 설명 36개(`quizExplanations.ts`)가 "첫날 방", "쉬는 시간", "명함", "48시간", "데모 고장", "멘토 질문", "집 가는 길"을 가리키므로, 그 장면이 사라지면 설명이 틀린 말이 됩니다. 옷만 12월:

| # | 8월 | 12월 (초안) |
| --- | --- | --- |
| Q1 | 빌더톤 첫날, 처음 보는 팀원들과 한 방 | Day 1 아침, 팀 매칭 테이블에 처음 보는 넷. a(I) "일단 티켓 이미지만 보여 주고 분위기 읽기" / b(E) "“서울이세요, 싱가포르세요?” 먼저 깐다" |
| Q2 | 주제가 'AI로 세상을 바꿀 아이디어' | 기업이 이슈를 던졌다. a(N) "“이 회사 10년 뒤엔 이게 문제겠네” 큰 그림" / b(S) "“그래서 데이터 어디 있죠?” 현실" |
| Q4 | 데드라인까지 48시간 | Day 2 오전, 돌아가는 첫 버전까지 48시간 아니고 4시간 (뼈대 유지: 계획 vs 흐름) |
| Q5 | 발표 직전 데모 고장 | Day 4, 회사 사람들 앞에서 데모가 멈췄다 |
| Q7 | 멘토가 "왜 만들었어요?" | 현장 멘토링, 그 일을 실제로 하는 분이 "이거 왜 만들었어요?" |
| Q9 | 마감 12시간 전 더 좋은 아이디어 | 덱 제출 12시간 전, 더 좋은 문제를 찾았다 |
| Q10 | 발표 끝, 반응 미지근 | 발표 끝, 회사 쪽 질문이 하나도 안 나왔다 |
| Q11 | 새 AI 툴을 받았다 | Day 0, 자료 링크 더미를 받았다. a(N) "뭘 만들 수 있을지부터 부풀림" / b(S) "일단 폴더 구조부터 파악" |
| Q13 | 네트워킹, 처음 보는 사람들 | 네트워킹, 싱가포르에서 온 사람들로 방이 꽉 찼다 |
| Q3, Q6, Q8, Q12, Q14 | 그대로 | 그대로 |

영문도 같이. 질문 쪽 유머는 선택지 문구에 넣습니다("일단 티켓 이미지만 보여 주고").

## 5. 그 밖에

- 결과 카드의 `storyTicket`, `saveImageTicket`은 유지. `matchSub`를 "크로싱 서울에서 이 유형을 만나면 일단 팀 하세요. 이유는 나중에 ✦"에서 "이 유형 보이면 일단 잡으세요. 이유는 Day 4에 알게 돼요 ✦"로 (D2).
- `memeStats` 라벨은 유형의 것이라 유지. 단 브랜드가 바뀐 유형 중 라벨이 옛 브랜드를 가리키는 것이 있으면 바꿉니다(예: INTP의 "논문 링크"류).
- 시작 화면 `subtitle` "14문항, 약 3분"에 한 줄 덧붙임: "결과가 마음에 안 들면 다시 해도 됩니다. 다들 그래요." (D3)
- 코드 주석에 각 사실의 URL과 확인일(2026-10-08)을 적습니다. 지금 파일의 방식 그대로.

## 6. 결정 (사용자)

| # | 질문 | 기본값 |
| --- | --- | --- |
| D1 | 질문 14개의 옷을 12월로 갈아입히는가 | 갈아입힌다. 채점은 안 바뀌고, 8월 `/quiz`는 그대로 |
| D2 | INFJ를 Claude Fable 5.1로 하는가, Opus 5.5로 두는가 | Fable 5.1. Mythos 이야기가 INFJ의 "겉과 속" 농담을 만듭니다 |
| D3 | OpenClaw의 "이름 다섯 번" 농담과 Genie의 "게임사 주가" 농담을 쓰는가 | 쓴다. 공개된 사실이고 누구를 깎아내리지 않습니다. 보안 사고와 소송은 쓰지 않습니다 |
| D4 | ESTP를 Kling V3로 바꾸는가, Mistral로 두는가 | Kling. 영상이 지금 더 뜨겁고, ESFP(Suno), ISFP(Midjourney)와 창작 셋이 됩니다 |
| D5 | ISFJ를 Solar Mini 4(한국)로 하는가, Codex로 두는가 | Solar. 한인 학생 행사에서 국산 하나는 웃음과 공감이 같이 옵니다 |

## 7. 검증

| # | 항목 | 기준 |
| --- | --- | --- |
| 1 | 8월판 | `/quiz` 시작, 질문 14, 결과 16×2, 저장 이미지가 적용 전과 픽셀 차이 0 |
| 2 | 채점 불변 | `scripts/verify-quiz.mjs`에 추가한 검사: `QUESTIONS_2026_12`의 id, axis, w, 극이 `QUESTIONS`와 동일. 같은 답 14개 → 두 판의 mbti, identity, axes 퍼센트 동일(무작위 답 1,000세트) |
| 3 | 사실 | `whyModel` 16개의 숫자와 날짜가 주석의 URL에 있음. 없는 것은 문장에서 뺌 |
| 4 | 길이 | ko `whyModel` 110자 이하, `phrase` 25자 이하, 변형 이름 14자 이하. 결과 카드 높이가 지금보다 늘지 않음(1440, 390) |
| 5 | 금지어 | 바꾼 문장에 em dash 0, 새 가운뎃점 0, 사람 이름 0, 국적이나 학교를 소재로 한 문장 0 |
| 6 | 저장 | `/match` 끝까지 하고 저장이 성공(MATCH_WINDOW 안이면)하거나, 닫혀 있으면 "미리 해 볼 수 있음" 안내가 그대로. `model` 값이 서버 허용 목록에 있음 |
| 7 | 로고 | 16개 결과 화면에 깨진 이미지 0, 폴백 이모지가 의도한 것 |
| 8 | 빌드 | `npm run build` 통과 |

16개 결과 카드 스크린숏(390×844)을 한 장에 모아 보여 주세요. 질문 화면은 Q1, Q7, Q11 셋.

## 8. 커밋

1. `feat(match): 12월판 질문 옷, 채점은 그대로` (4장)
2. `feat(match): 2026년 10월의 모델 16개로` (2장, 로고)
3. `copy(match): 결과 카드 전부 자기 디스 톤으로` (3장, 5장)
4. `test(quiz): 판 사이 채점 불변 검사` (7장 2)
5. `docs(changelog): 2026-10-08 match humor` (`CHANGELOG.md` 맨 위, 25줄 이하)

`main` 푸시는 사용자가 스크린숏을 확인한 뒤입니다.
