# 신청 폼 브리프: 8월과 같은 항목 + 전공 + AI로 해 본 것 네 단계, 그리고 수파베이스

대상 레포: `website` (커밋 `68c6ac9` 기준, 아직 푸시 전). 바꾸는 파일은 `data/crossingForm.ts`, `components/crossing/RegisterModal.tsx`, `scripts/build-crossing-roster.py`, `scripts/crossing-route-test.sh`, 새 마이그레이션 `supabase/migrations/0005_crossing_participants_answers.sql`. 8월 표(`registrations`, `registration_members`), 8월 라우트, 투표 라우트는 건드리지 않습니다. 기존 수파베이스 행은 지우거나 고치지 않습니다. 체인지로그는 `CLAUDE.md` 규칙대로.

## 0. 결론 한 줄

크로싱 서울 신청 폼은 **8월 폼과 같은 항목**을 받고, 사람마다 **전공**과 **AI로 해 본 것(네 단계)**을 더 받습니다. 네 단계는 ChatGPT를 쓰는 사람도 Claude를 쓰는 사람도 바로 자기 자리를 알 수 있게 **행동**으로 적습니다. 답은 이미 있는 `crossing_members.answers`(jsonb)에 들어가고, 운영자가 보는 뷰에 두 열을 더합니다.

## 1. 8월과 같은 항목인지 확인 (먼저 표로 보고)

8월 폼(`components/RegisterModal.tsx`, `app/api/register/route.ts`, 마이그레이션 0001)이 받은 것과 지금 크로싱 폼(`data/crossingForm.ts`)을 한 표로 대조해 보여 주세요.

| 8월 | 크로싱 서울 | 비고 |
| --- | --- | --- |
| 이름, 이메일, 카카오톡 ID | 같음 | |
| 학교(선택), 링크드인(선택) | 같음 | |
| 참가 형태(팀/혼자), 팀 이름, 팀 매칭 희망 | 같음 | |
| 팀원(최대 3명) | 같음 | 8월은 팀원에게 이름, 이메일, 카카오톡만 받았고 크로싱은 사람 항목 전부를 받음. 그대로 둡니다 |
| `ref`(유입 경로 URL 파라미터) | 라우트는 받음 | **모달이 실제로 `ref`를 보내는지 확인.** 안 보내면 8월과 같은 방식으로 보내게 고칩니다 |
| `track`, `quiz_type` | 없음 | 8월 행사 전용(트랙, 유형 테스트). 가져오지 않습니다 |
| (없음) | 공부하는 나라, 동의 | 크로싱에서 더한 것. 그대로 |

표에서 8월에 있었는데 크로싱에 빠진 것이 위 둘(`track`, `quiz_type`) 말고 더 있으면 작업 전에 알려 주세요.

## 2. 더하는 두 항목

이미 커밋된 `major`, `ai_level`(8b34d18)을 아래로 고칩니다. 아직 등록 창이 열린 적이 없어 받은 답이 없으므로 `ai_level`의 값(value)을 바꿔도 됩니다.

### 2.1 전공

| key | 종류 | 필수 | 라벨 | 자리표시 |
| --- | --- | --- | --- | --- |
| `major` | text, 최대 80자 | 예 | 전공 / Major | 예: 경영학, 컴퓨터공학, 미정 / e.g. Business, Computer Science, Undeclared |

### 2.2 AI로 해 본 것 (네 단계)

- key `ai_level`, 필수, **하나만 고름**(라디오).
- 질문: **AI로 해 본 것 중 가장 위에 있는 것 하나를 골라 주세요.** / *Pick the highest step you have actually done with AI.*
- 도움말(질문 바로 아래): 워크숍을 여러분에게 맞추기 위해 묻는 것이고, 이것으로 선발하지 않습니다. / *We ask this to fit the workshops to you. It is not used for selection.*

| 단계 | value | 한 것(굵게) | 예(작게) |
| --- | --- | --- | --- |
| 1 | `chat` | 채팅창에 물어보고 답을 받아 써 봤다 | ChatGPT나 Claude에 질문하고 글, 요약, 번역을 받아 씀 |
| 2 | `agent` | AI에게 일을 맡겨 끝까지 해내게 해 봤다 | Claude Cowork나 ChatGPT 에이전트 모드로 파일 정리, 자료 조사, 문서 만들기 |
| 3 | `terminal` | 터미널에서 AI 코딩 도구를 켜서 무언가를 만들어 봤다 | Claude Code나 Codex CLI로 앱이나 스크립트 만들기 |
| 4 | `connect` | AI에 다른 도구를 연결해 함께 쓰게 해 봤다 | MCP로 Claude나 ChatGPT에 노션, 깃허브, 캘린더 등을 연결 |

en:

| 단계 | 한 것 | 예 |
| --- | --- | --- |
| 1 | Asked a chatbot and used its answers | Questions, drafts, summaries or translations from ChatGPT or Claude |
| 2 | Handed AI a task and let it finish the job | Sorting files, research or making documents with Claude Cowork or ChatGPT agent mode |
| 3 | Opened an AI coding tool in the terminal and built something | An app or a script with Claude Code or Codex CLI |
| 4 | Connected other tools to AI so it can use them | Notion, GitHub or a calendar linked to Claude or ChatGPT through MCP |

- 제품 이름은 예시로만 둡니다. 두 회사 이름을 단계마다 나란히 적어 어느 쪽 사용자든 자기 단계를 바로 알게 하는 것이 요점입니다.
- `crossingForm.ts`의 `FieldOption`에 선택 설명용 `hint?: { ko; en }`를 더하고, 위 "예"를 거기에 둡니다.

### 2.3 화면

- `FieldType`에 `"radio"`를 더합니다. `validateField`는 `radio`를 `select`와 같이 검사합니다(서버와 클라이언트가 같은 함수).
- `RegisterModal`에서 `radio`는 **세로로 쌓인 선택 카드 넷**으로 그립니다. 카드 하나: 왼쪽에 단계 숫자, 가운데에 "한 것"(본문 크기, 굵게), 그 아래 "예"(메타 크기, white/65 이상). 고른 카드는 테두리와 배경이 바뀝니다.
- 접근성: `role="radiogroup"`, 카드마다 실제 `<input type="radio">`(시각적으로만 숨김)와 `<label>`, 화살표 키 이동, 포커스 링, 오류 메시지 연결(`aria-describedby`).
- 팀이면 팀원마다 같은 두 항목이 나옵니다(사람 단위).
- 10월 7일 규칙대로 카드 안 글자 크기는 `BODY`/`META` 둘만 씁니다.

## 3. 수파베이스

스키마(표)는 이미 있습니다. 표는 바꾸지 않습니다.

### 3.1 저장 위치

- `major`, `ai_level`은 `crossing_members.answers`(jsonb)에 사람마다 들어갑니다. 라우트(`app/api/crossing/register/route.ts`)의 `pickAnswers(m, "member")`가 `crossingForm.ts` 목록으로 키를 걸러 넣으니 라우트 코드는 그대로입니다. `radio` 종류도 문자열로 들어가는지만 확인합니다.

### 3.2 운영자용 뷰에 두 열 (마이그레이션 0005)

`crossing_participants` 뷰 끝에 두 열을 더합니다. 표 변경이 아니라 뷰 교체입니다.

```sql
-- 0005: 크로싱 신청의 전공과 AI 단계를 뷰에서 바로 보이게 (2026-10-07). 표는 그대로.
create or replace view public.crossing_participants as
  select
    m.id as member_id, r.id as registration_id, r.event_slug, r.created_at,
    r.join_type, r.team_name, r.wants_matching, r.consent_at,
    m.ordinal, m.name, m.email, m.contact, m.university, m.study_country, m.linkedin,
    r.answers as registration_answers, m.answers as member_answers,
    m.answers->>'major'    as major,
    m.answers->>'ai_level' as ai_level
  from public.crossing_members m
  join public.crossing_registrations r on r.id = m.registration_id
  order by r.created_at desc, m.ordinal;

alter view public.crossing_participants set (security_invoker = on);
revoke select on public.crossing_participants from anon, authenticated;
```

- 기존 열의 순서와 이름은 그대로 두고 끝에만 더합니다(`create or replace view`가 허용하는 형태).
- **운영 DB에 적용하는 것은 사용자 확인 뒤입니다.** SQL을 보여 주고, 사용자가 좋다고 하면 `supabase db push`(링크된 프로젝트) 또는 사용자가 SQL 편집기에서 실행합니다.

### 3.3 운영 연결 확인 (읽기만)

서비스 키로 **읽기 쿼리만** 실행해 확인합니다.

- `crossing_registrations`, `crossing_members` 표가 있고 `answers`, `event_slug` 열이 있다.
- 두 표의 RLS가 켜져 있고 정책이 0개다.
- 0005 적용 뒤 `crossing_participants`에 `major`, `ai_level` 열이 있고, `anon` 키로 select하면 거부된다.
- Vercel 운영 환경변수에 `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, 봇 확인 키(Turnstile 사이트 키와 비밀 키)가 있다(`vercel env ls production`, 값은 출력하지 않음).

### 3.4 끝에서 끝까지 시험

`scripts/crossing-route-test.sh`의 방식 그대로 합니다.

- 로컬에서 `CROSSING_WINDOW.opensAt`을 과거로 **임시로**(커밋하지 않음) 바꾸고, 개발 모드의 봇 확인 우회로 운영 수파베이스에 시험 신청을 넣습니다.
- 시험 데이터의 `major`, `ai_level`을 새 값(`terminal` 등)으로 바꾸고, 새 경우 둘을 더합니다: `ai_level`이 목록에 없는 값이면 400, `major`가 비어 있으면 400.
- 넣은 뒤 `crossing_participants`에서 `major`, `ai_level`이 보이는지 확인합니다.
- **정리는 이 시험이 만든 행만**: 이메일이 `@example.com`이고 시험 시각 이후에 만들어진 행. 그 밖의 행은 건드리지 않습니다.
- 끝나면 `CROSSING_WINDOW`가 커밋된 값(둘 다 null, 아직 안 엶)인지 `git diff`로 확인합니다.

### 3.5 명단 스크립트

`scripts/build-crossing-roster.py`가 `major`, `ai_level` 두 열을 내고, `ai_level`은 값이 아니라 **"3. 터미널에서 AI 코딩 도구를 켜서 무언가를 만들어 봤다"**처럼 단계 번호와 한국어 라벨로 냅니다. 명단 파일(docx)은 레포에 커밋하지 않습니다.

## 4. 건드리지 말 것

8월 표, 라우트, 폼. 등록 창(`CROSSING_WINDOW`)은 열지 않습니다. 기존 수파베이스 행은 지우거나 고치지 않습니다. 서비스 키는 서버에만, `NEXT_PUBLIC_`를 붙이지 않습니다. em dash 금지, 가운뎃점 새로 쓰지 않음.

## 5. 검증

| # | 항목 | 기준 |
| --- | --- | --- |
| 1 | 8월 대조 | 1장 표. `ref` 전송 확인 |
| 2 | 화면 | 1440×900, 390×844에서 모달 스크린숏. 네 카드가 다 보이고 "예"가 읽힘(대비 4.5:1 이상). 팀 모드에서 팀원마다 두 항목 |
| 3 | 키보드 | 탭으로 들어가 화살표로 단계를 옮기고 스페이스로 고를 수 있음. 오류가 읽힘 |
| 4 | 검증 | 클라이언트와 서버가 같은 `validateField`. 빈 전공, 목록 밖 단계에서 둘 다 막힘 |
| 5 | 저장 | 3.4 시험에서 `crossing_members.answers`에 두 키, 뷰에 두 열 |
| 6 | 정리 | 시험 행만 지워졌고 그 밖의 행 수는 시험 전과 같음 |
| 7 | 창 | `CROSSING_WINDOW` 커밋 값 그대로 |
| 8 | 빌드 | `npm run build`(체인지로그 검사 포함) 통과 |

## 6. 커밋

1. `feat(crossing): AI로 해 본 것 네 단계를 선택 카드로, 전공 자리표시` (2장)
2. `feat(db): 크로싱 참가자 뷰에 전공과 AI 단계 열` (3.2, 마이그레이션 파일만. 운영 적용은 사용자 확인 뒤)
3. `chore(scripts): 명단과 라우트 시험에 새 항목` (3.4, 3.5)
4. `docs(changelog): 2026-10-07 registration form` (`CHANGELOG.md` 맨 위)

`main` 푸시는 사용자가 모달 스크린숏과 검증 표를 확인한 뒤입니다. 앞선 이슈 브리프의 커밋과 함께 푸시해도 됩니다.
