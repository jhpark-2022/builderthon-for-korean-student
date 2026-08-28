-- ─────────────────────────────────────────────────────────────────────────────
-- Zero100 Builderthon — Day 8 빌더스 초이스 참가자 투표.
--
-- 무기명입니다. 이름도 이메일도 저장하지 않습니다. 한 행이 말하는 것은
-- "어느 트랙에서 어느 팀이 뽑혔는가"와, 그 표를 한 번으로 묶기 위한 기기 토큰뿐.
--
-- voter_team은 신원이 아니라 배제 조건입니다. 자기 팀에 투표하는 것을 막는 데만
-- 쓰고, 참가팀이 아닌 사람은 'NONE'이 들어갑니다. 팀은 2~3인이라 이 값 하나로
-- 개인이 특정되지 않습니다.
--
-- RLS는 ON이고 정책이 하나도 없습니다 → anon/authenticated는 아무것도 못 합니다.
-- 쓰기는 /api/vote가 service_role로만 합니다. 이 줄을 빼지 마세요. 빼면 익명 키를
-- 가진 누구나 표를 넣고 중간 집계를 읽을 수 있습니다.
--
-- 재실행해도 안전합니다 (모든 문장이 멱등).
-- ─────────────────────────────────────────────────────────────────────────────

create extension if not exists "pgcrypto";

create table if not exists public.day8_votes (
  id           uuid primary key default gen_random_uuid(),
  -- 1 = 저지먼트(14팀 중 2팀), 2 = 오토메이션(7팀 중 1팀)
  track        smallint not null check (track in (1, 2)),
  -- 클라이언트 localStorage의 익명 토큰. 사람이 아니라 브라우저를 가리킵니다.
  device_token uuid not null,
  -- 투표자의 소속 팀. 참가팀이 아니면 'NONE'.
  voter_team   text not null,
  -- 트랙 1은 서로 다른 2팀, 트랙 2는 1팀. 개수와 명단 대조는 라우트가 합니다.
  choices      text[] not null,
  -- 소금 친 SHA-256. 스로틀 전용이고 원본 주소로 되돌릴 수 없습니다.
  ip_hash      text,
  created_at   timestamptz not null default now()
);

-- 1기기 1트랙 1표. 수정 불가, 첫 제출이 최종이라는 규칙이 이 인덱스입니다.
-- 두 번째 제출은 23505로 튕기고, 라우트가 그것을 "이미 투표했어요"로 옮깁니다.
create unique index if not exists day8_votes_once
  on public.day8_votes (track, device_token);

-- 스로틀이 던지는 질문 그대로의 인덱스: 이 해시의 최근 행.
create index if not exists day8_votes_ip_hash_created_idx
  on public.day8_votes (ip_hash, created_at desc);

alter table public.day8_votes enable row level security;

comment on table public.day8_votes is
  'Day 8 Builder''s Choice anonymous participant votes. No names, no emails.';
comment on column public.day8_votes.device_token is
  'Anonymous per-browser UUID from localStorage. Not an identity.';
comment on column public.day8_votes.ip_hash is
  'Salted SHA-256 of the submitter IP. Rate-limiting only — never the raw IP.';

-- ── 집계 ────────────────────────────────────────────────────────────────────
-- 별도 화면을 만들지 않았습니다. Supabase SQL 에디터에서 이 한 줄을 돌리세요.
--
--   select track, unnest(choices) as team, count(*)
--   from day8_votes group by 1, 2 order by 1, 3 desc;
