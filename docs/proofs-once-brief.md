# 브리프: 미션 인증 "한 번만"을 DB에서도, 이슈 브리프 버킷 (2026-11-13 Supabase 점검)

대상: `supabase/migrations/0023_crossing_proofs_once_and_briefs_bucket.sql`, `app/api/crossing/proofs/route.ts`. 화면과 글은 바꾸지 않습니다(`docs/brand.md`의 문장은 그대로). 근거: 2026-11-13 Supabase 점검(마이그레이션 22개와 DB 대조, 규칙마다 행을 넣었다가 되돌리는 시험)에서 남은 둘을 사용자 요청으로 처리합니다.

## 0. 지금 (점검 실측 2026-11-13, HEAD 9c4e433)

| 자리 | 지금 |
| --- | --- |
| 인증 한 번만 | 2026-10-26 결정(팀, 날, 종류마다 한 번)을 라우트의 `alreadyUploaded`만 지킴. DB에는 `storage_path` 유니크뿐이라 같은 팀, 날, 종류의 둘째 행이 들어감(시험에서 확인) |
| 동시 confirm | 두 요청이 함께 세어 보면 둘 다 0건. 두 행이 남고 멘토 페이지에 그 팀 파일이 둘 |
| 이슈 브리프 버킷 | `crossing-issue-briefs`가 없음. `scripts/issue-briefs.mjs`를 처음 돌릴 때에야 생김. 없는 버킷의 목록은 오류 없이 빈 배열이라 멘토 페이지에서 티가 나지 않음 |
| 인증 행 | 0건 |

## 1. 뒤

| # | 바꿈 |
| --- | --- |
| P1 | 유니크 인덱스 `crossing_mission_proofs_once (team_name, day, kind)`. confirm의 insert가 이 이름의 23505를 받으면 방금 올린 파일을 지우고 409 `already`. 같은 경로가 두 번 온 23505(`storage_path`)는 전처럼 201 |
| P2 | 버킷 `crossing-issue-briefs`를 0023에 적음. 비공개, 25MB, PDF와 index.json(스크립트의 값과 같음). `on conflict do nothing` |

## 2. 지키는 것

- 팀 쪽 화면과 `already`의 안내 글은 그대로입니다. 새 오류 코드를 만들지 않습니다.
- 팀 이름을 바꾸면 인증 행이 따라갑니다(`team_track_fkey`의 on update cascade).
- 버킷은 비공개이고 정책이 0개입니다. 서명 URL로만 오갑니다.
- 두 배포가 같은 DB를 씁니다. 인덱스는 더하기만 하므로 라우트가 옛 판이어도 깨지지 않습니다(옛 판은 그 23505에 201로 답하고, 뒤의 파일이 행 없이 버킷에 남습니다).
- 한 팀의 인증을 다시 받으려면 운영진이 표 편집기에서 그 행을 지웁니다(전과 같음).

## 3. 결정

- 인덱스 이름이 라우트와의 약속입니다(멘토 칸의 `team_overlap`과 같은 방식). 이름을 바꾸면 라우트도 같이 바꿉니다.
- 버킷 값의 정본은 `scripts/issue-briefs.mjs`입니다. 스크립트의 값을 바꾸면 새 마이그레이션으로 맞춥니다.

## 4. 검증

| # | 확인 |
| --- | --- |
| 1 | DB(service_role로 넣었다가 되돌림, 남은 행 0): 같은 팀, 날, 종류의 둘째 파일은 23505 `crossing_mission_proofs_once`. 같은 경로는 23505 `storage_path_key`. 다른 종류와 다른 날은 들어감. 팀 이름을 바꾸면 행 셋이 따라감 |
| 2 | 스토리지 API가 `crossing-issue-briefs`를 비공개, 25MB로 답함. 버킷은 둘 |
| 3 | 적용 기록(`supabase_migrations.schema_migrations`) 23개, `supabase/migrations/` 파일 23개. 이름이 서로 같음 |
| 4 | `npx tsc --noEmit` 통과 |
| 5 | 끝까지(2026-11-13, 테스트 팀으로 올렸다가 모두 지움): 새 라우트(로컬)는 화면에서 올리기 201, 다시 서명 409, 동시 confirm은 201과 409이고 진 파일이 지워짐. 앞의 확인을 건너뛰게 한 사본에서 둘째 파일은 인덱스에 막혀 409. 배포본 둘(옛 라우트)은 동시 confirm이 둘 다 201이지만 행은 하나. 멘토 페이지(로컬, 배포본 둘)에서 팀 PDF와 이슈 브리프가 열리고, 열쇠 없이는 404 |

## 5. 커밋

`fix(crossing): 미션 인증 한 번만을 DB에서도(0023), 이슈 브리프 버킷` / `docs(changelog): 2026-11-13 미션 인증 한 번만을 DB에서도`. 같은 커밋에 `docs/README.md` 색인. DB에는 2026-11-13에 적용했고 적용 기록에 0023도 적었습니다. `supabase db push`는 다시 돌리지 않아도 됩니다(돌려도 할 일이 없습니다). `main` 푸시는 사용자 확인 뒤.

결정이 남는 곳: `0023`의 머리 주석과 `app/api/crossing/proofs/route.ts`의 `DECIDED 2026-11-13` 주석.
