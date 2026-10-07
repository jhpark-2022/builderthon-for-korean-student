# 현장 팀 매칭 브리프: AI 모델 유형 테스트(12월판) + 이름, 나라 → 수파베이스

대상 레포: `website` (커밋 `8b1cae7` 기준, 아직 푸시 전). 새로 만드는 것: `/match` 페이지, `data/quiz-2026-12.ts`, `app/api/crossing/match/route.ts`, 마이그레이션 `supabase/migrations/0006_crossing_match.sql`, `scripts/build-match-board.py`. 고치는 것: `components/Quiz.tsx`(판을 고를 수 있게), 홈의 Day 1 행(버튼 하나). **8월 `/quiz`와 그 결과(`data/quiz.ts`의 RESULTS)는 한 글자도 바꾸지 않습니다.** 기존 수파베이스 표와 행도 건드리지 않습니다. 체인지로그는 `CLAUDE.md` 규칙대로.

## 0. 결론 한 줄

12월에는 AI 모델 유형 테스트를 **신청의 일부가 아니라 현장 팀 매칭 도구**로 씁니다. 참가자는 Day 1 현장에서 `/match`를 열어 **이름과 나라를 넣고 테스트**를 하고, 결과는 **새 표 `crossing_match_profiles`**에 저장됩니다. 운영진은 그 표로 팀을 짭니다. 결과에 나오는 16개 AI는 2026년 10월 기준 최신 모델로 바꿉니다.

## 1. 8월에는 어떻게 되어 있었나 (그대로 두는 것)

- 질문 14개, 축 다섯(MIND, ENERGY, NATURE, TACTICS, IDENTITY), 결과는 16유형 × A/T 변형. 유형마다 추천 역할(`roleKey`: plan, dev, design, growth)과 궁합 유형 둘(`match`, `matchWhy`).
- 8월 매핑:

| MBTI | 8월 모델 | MBTI | 8월 모델 |
| --- | --- | --- | --- |
| INTJ | DeepSeek | ISTJ | Perplexity |
| INTP | Meta Llama | ISFJ | GitHub Copilot |
| ENTJ | Gemini | ESTJ | Cohere Command |
| ENTP | Grok | ESFJ | Microsoft Copilot |
| INFJ | Claude | ISTP | Ollama |
| INFP | Character.AI | ISFP | Midjourney |
| ENFJ | ChatGPT | ESTP | Mistral |
| ENFP | Pi | ESFP | Suno |

- 8월에는 결과 유형이 신청의 `quiz_type` 열로 들어갔습니다. **12월 신청 폼에는 유형을 넣지 않습니다**(신청 모달이 `quizType`을 보내지 않는지 확인).

## 2. 12월판 매핑

### 2.1 원칙

- **유형의 성격은 8월 그대로**(질문, 채점, 역할, 궁합 구조는 같음). 바뀌는 것은 각 유형에 붙는 AI 이름과 그 AI에 대한 문장입니다.
- 8월의 브랜드가 지금도 최상위에 있으면 **같은 브랜드의 최신 모델 이름**으로 올립니다(성격의 연속성). 최상위에서 밀려난 브랜드는 성격이 맞는 지금의 최상위 모델로 바꿉니다.
- 화면에 보이는 이름은 **모델 이름 그대로**(예: Claude Opus 5.5). 이름 하나만 바꿔도 되도록 `data/quiz-2026-12.ts`의 한 표에만 둡니다.

### 2.2 기본안 (구현 당일 공식 출처로 이름을 다시 확인)

| MBTI | 8월 | 12월 기본안 | 왜 |
| --- | --- | --- | --- |
| INTJ | DeepSeek | DeepSeek V4 Pro | 같은 브랜드. 적은 비용으로 극한의 효율 |
| INTP | Meta Llama | Kimi K3 (Moonshot) | Llama 4는 2025년 모델. 긴 맥락을 파고드는 사색가 |
| ENTJ | Gemini | Gemini 최신 Pro 계열 | 같은 브랜드. **이름 확인 필요**(출처마다 3.1 Pro, 3.8, 4로 다름) |
| ENTP | Grok | Grok 4.7 | 같은 브랜드 |
| INFJ | Claude | Claude Opus 5.5 | 같은 브랜드. 2026년 10월 종합 1위 |
| INFP | Character.AI | Sora (OpenAI) | 이야기를 영상으로 그리는 몽상가. **현재 서비스와 버전 확인 필요** |
| ENFJ | ChatGPT | GPT-6 Astra (ChatGPT) | 같은 브랜드. 2026년 10월 종합 2위 |
| ENFP | Pi | Qwen3.8-Max (Alibaba) | 쉬지 않고 새 모델을 내놓는 열정. 오픈 웨이트 생태계 |
| ISTJ | Perplexity | Perplexity | 출처를 대는 성실함. **현재 상태 확인** |
| ISFJ | GitHub Copilot | Codex (OpenAI) | 뒤에서 묵묵히 일을 끝내 주는 코딩 에이전트 |
| ESTJ | Cohere Command | GLM-5.3 (Z.ai) | 긴 호흡의 엔지니어링을 체계적으로 끌고 가는 실행형 |
| ESFJ | Microsoft Copilot | Microsoft Copilot | 모든 사무 도구 안에서 먼저 챙기는 도우미 |
| ISTP | Ollama | Claude Code | 터미널에서 직접 손으로 만드는 장인 |
| ISFP | Midjourney | Midjourney | 같은 브랜드. 최신 버전 확인 |
| ESTP | Mistral | Mistral Medium 3.5 | 같은 브랜드. 일단 내놓고 보는 배짱 |
| ESFP | Suno | Suno | 같은 브랜드. 최신 버전 확인 |

- **"확인 필요" 표시가 있거나 버전이 붙은 이름은 전부, 구현하는 날 각 회사의 공식 발표나 문서에서 다시 확인**합니다. 확인한 출처 URL을 `quiz-2026-12.ts`의 해당 줄 주석에 남깁니다. 확인되지 않으면 버전 없이 브랜드 이름만 씁니다.
- 실제 화면에 쓰기 전에 이 표의 최종본(바뀐 이름, 출처)을 사용자에게 보여 주고 승인받습니다.

### 2.3 결과 문장

- 바뀐 유형마다 `desc`, `phrase`, `whyModel`, `strengths`, `weakness`, `memeStats`, A/T `variants`, `matchWhy`를 새로 씁니다. 8월 문장의 말투와 길이를 따릅니다.
- **`whyModel`은 사실만**: 공식 발표나 신뢰할 만한 보도에서 확인한 사실로 쓰고, 출처를 주석에 남깁니다. 지어낸 수치나 사건은 쓰지 않습니다.
- 같은 브랜드를 유지한 유형도 `whyModel`은 새 모델의 사실로 고칩니다(예: DeepSeek의 학습비 문장은 V3 시절 이야기).
- 로고: 8월처럼 `public/logos`에 둡니다. 공식 브랜드 자산이나 Simple Icons처럼 사용이 허락된 출처만 쓰고, 없으면 이모지 대체(`logo: ""`).
- 문장에 사람을 놀리는 표현, 특정 회사를 깎아내리는 표현은 쓰지 않습니다. em dash 금지.

## 3. `/match` 페이지 흐름

1. **시작 화면**: "크로싱 서울 팀 매칭" 제목, 한 줄 설명("14문항, 약 3분. 결과로 Day 1 팀 매칭을 합니다"), 입력 둘:
   - 이름(필수, 최대 40자)
   - 나라(필수): 한국 / 싱가포르 / 그 밖(두 글자 코드). 신청 폼의 `study_country`와 같은 값 체계.
   - 안내 한 줄: "이름, 나라, 테스트 결과는 현장 팀 매칭에만 씁니다."
2. **테스트**: 8월과 같은 14문항, 같은 화면.
3. **결과**: 12월판 모델로 결과 카드. 결과가 나오는 순간 자동 저장되고, 화면에 "팀 매칭에 올라갔습니다"가 보입니다. 다시 하면 같은 기기의 기록을 덮어씁니다.
4. 결과 공유, 스토리 이미지 같은 8월 기능은 그대로 씁니다. 공유 링크로 들어온 사람은 저장하지 않습니다(자기 테스트를 해야 저장).

구현: `components/Quiz.tsx`에 판을 고르는 prop(`edition: "2026-08" | "2026-12"`)과 매칭 모드(`matchMode`)를 더합니다. `/quiz`는 `edition="2026-08"` 기본값 그대로라 **8월 화면은 픽셀 단위로 같아야 합니다.** 저장 키(localStorage, sessionStorage)도 판마다 따로 둡니다.

## 4. 수파베이스: 새 표가 맞다

**판단: 새 표를 만듭니다.** 이유 셋:

1. 현장 테스트는 신청과 다른 사람 단위입니다. 팀원은 대표가 대신 신청했고, 현장에 와서 처음 하는 사람도 있습니다. 이메일 없이 이름과 나라만 받습니다.
2. 신청 행(`crossing_members`)에 결과를 쓰면 **기존 행을 고치게** 됩니다. 기존 행은 건드리지 않는다는 원칙과 맞지 않습니다.
3. 다시 하기(덮어쓰기), 보관 기간, 접근 권한이 신청과 다릅니다.

```sql
-- 0006: 크로싱 서울 현장 팀 매칭용 AI 유형 결과 (2026-10-08). 신청 표와 별개.
create table if not exists public.crossing_match_profiles (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  event_slug    text not null,
  name          text not null check (char_length(name) between 1 and 40),
  study_country text not null check (study_country ~ '^[A-Z]{2}$'),
  mbti          text not null check (mbti in ('INTJ','INTP','ENTJ','ENTP','INFJ','INFP','ENFJ','ENFP',
                                              'ISTJ','ISFJ','ESTJ','ESFJ','ISTP','ISFP','ESTP','ESFP')),
  identity      text not null check (identity in ('A','T')),
  model         text not null,          -- 저장 시점의 모델 이름(나중에 매핑이 바뀌어도 기록은 남음)
  role_key      text not null check (role_key in ('plan','dev','design','growth')),
  axes          jsonb not null default '{}'::jsonb,  -- 축별 점수
  quiz_edition  text not null default '2026-12',
  device_token  text not null,          -- 브라우저가 만든 무작위 UUID. 사람을 가리키지 않음
  ip_hash       text,                   -- 스로틀용 솔트 해시. 원 IP는 저장하지 않음
  unique (event_slug, device_token)
);
create index if not exists crossing_match_profiles_event_idx
  on public.crossing_match_profiles (event_slug, updated_at desc);

alter table public.crossing_match_profiles enable row level security;  -- 정책 0개: service_role만

create or replace view public.crossing_match_board as
  select name, study_country, mbti, identity, model, role_key, updated_at
  from public.crossing_match_profiles
  where event_slug = 'crossing-seoul-2026-12'
  order by role_key, study_country, name;
alter view public.crossing_match_board set (security_invoker = on);
revoke select on public.crossing_match_board from anon, authenticated;
```

- **운영 DB 적용은 사용자 확인 뒤**(SQL을 보여 주고 승인을 받은 뒤 `supabase db push` 또는 사용자가 SQL 편집기에서).

### 4.1 라우트 `POST /api/crossing/match`

- 구조는 8월 투표 라우트(`app/api/vote/route.ts`)를 따릅니다: `force-dynamic`, 서버 검증, 허니팟, IP 해시 스로틀, `service_role`은 서버에만.
- **스로틀은 투표 라우트 기준**(한 방의 와이파이 하나에서 80명이 몰려도 막히지 않게): IP당 10분 200건, 전체 10분 400건. 봇 확인(Turnstile)은 현장 마찰이 커서 쓰지 않습니다.
- 검증: 이름 1~40자, 나라 두 글자 코드, `mbti`/`identity`/`role_key`는 목록 안, `model`은 `quiz-2026-12.ts`의 해당 유형 이름과 같아야 함(클라이언트가 보낸 값을 그대로 믿지 않음), `device_token`은 UUID 형식.
- 저장은 `(event_slug, device_token)`로 upsert. `updated_at` 갱신.
- 열리는 기간: 상수 `MATCH_WINDOW`(기본: 지금부터 행사 마지막 날 다음 날까지). 그 밖에는 403, 화면은 테스트만 되고 "팀 매칭 기간이 아닙니다"를 보여 줌.

## 5. 버튼 자리

- **홈 `#december` 일정의 Day 1 행**: 지금 "팀 매칭" 칩이 있는 자리에 버튼 하나, "AI 유형 테스트로 팀 매칭 →"(`/match`로). 글은 한 줄, 9월 29일 정렬 규칙대로 그 행의 왼쪽 끝에 맞춥니다.
- `/match`는 현장 QR로도 엽니다. 주소가 짧고 바뀌지 않게 둡니다.
- 8월 기록 페이지의 퀴즈 버튼은 8월 `/quiz`로 그대로 둡니다.

## 6. 운영진용 매칭판

`scripts/build-match-board.py`: 서비스 키로 `crossing_match_board`를 읽어 운영진용 파일(docx, 레포 밖 경로, **커밋하지 않음**)을 만듭니다.

- 표 1: 역할(plan/dev/design/growth) × 나라별 인원.
- 표 2: 팀 제안. 3~4명 팀으로, 한 팀 안에 역할이 겹치지 않게, 한국과 그 밖의 나라가 섞이게, 가능하면 서로의 `match` 궁합을 우선. 8월 팀 매칭 로직이 원격 브랜치 `origin/group-matching`에 남아 있으면 참고합니다. **제안일 뿐이고 최종 배정은 운영진이 합니다.**

## 7. 건드리지 말 것

8월 `/quiz` 화면, `data/quiz.ts`, 8월 표와 라우트, 신청 표와 행, 신청 폼(유형을 넣지 않음). 서비스 키에 `NEXT_PUBLIC_`를 붙이지 않음. 사람 이름은 이 표에만 들어가고 로그, 체인지로그, 커밋에 쓰지 않음. em dash 금지, 가운뎃점 새로 쓰지 않음.

## 8. 검증

| # | 항목 | 기준 |
| --- | --- | --- |
| 1 | 8월 불변 | `/quiz` 시작, 질문, 결과(16유형 × A/T 중 넷 표본) 스크린숏이 적용 전과 픽셀 차이 없음 |
| 2 | 모델 이름 | 2.2 최종본의 모든 이름에 확인 출처 URL 주석. 사용자 승인 기록 |
| 3 | 흐름 | 390×844에서 이름, 나라 → 14문항 → 결과 → 저장됨 표시. 다시 하기는 같은 행을 덮어씀(행 수 그대로) |
| 4 | 검증 | 이름 빈칸, 41자, 나라 `KOR`, 목록 밖 `mbti`, 유형과 맞지 않는 `model`에서 서버가 400 |
| 5 | 스로틀 | 한 IP에서 10분 200건까지 통과, 그 뒤 429 |
| 6 | 권한 | `anon` 키로 표와 뷰 select 거부. RLS 켜짐, 정책 0개 |
| 7 | 끝에서 끝 | 로컬에서 운영 수파베이스로 시험 결과 셋 저장 → 뷰에 보임 → **시험 기기 토큰의 행만** 정리 |
| 8 | 버튼 | 홈 Day 1 행의 버튼이 `/match`로 감. 1440, 390 스크린숏 |
| 9 | 매칭판 | 시험 행으로 스크립트가 표 1, 2를 만듦. 파일은 레포 밖 |
| 10 | 빌드 | `npm run build` 통과 |

## 9. 커밋

1. `feat(quiz): 판을 고르는 구조, 8월판은 그대로` (`Quiz.tsx` 리팩터, 검증 1)
2. `feat(quiz): 12월판 모델과 결과 문장` (`quiz-2026-12.ts`, 로고. 사용자 승인 뒤)
3. `feat(db): 현장 팀 매칭 결과 표와 매칭판 뷰` (0006 파일. 운영 적용은 사용자 확인 뒤)
4. `feat(match): /match 페이지와 저장 라우트` (3, 4.1장)
5. `feat(home): Day 1에 팀 매칭 테스트 버튼` (5장)
6. `chore(scripts): 운영진 매칭판` (6장)
7. `docs(changelog): 2026-10-08 match quiz` (`CHANGELOG.md` 맨 위)

`main` 푸시는 사용자가 2.2 최종본, `/match` 스크린숏, 검증 표를 확인한 뒤입니다.
