#!/bin/zsh
# 12월 라우트 시나리오(브리프 4.4). 전제: 마이그레이션 적용됨, 로컬에서 CROSSING_WINDOW.opensAt을
# 과거로 임시 설정하고 빌드(커밋 안 함). usage: ./crossingtest.sh http://localhost:4099
B=${1:-http://localhost:4099}; U=$B/api/crossing/register
post() { printf "%-28s" "$1"; curl -s -w " → %{http_code}\n" -X POST -H "content-type: application/json" -d "$2" $U; }
M='{"name":"테스트","email":"crossing-test@example.com","contact":"kakaotest","university":"테스트대","study_country":"KR","major":"경영학","ai_level":"terminal"}'
post "(b) valid solo"          "{\"eventSlug\":\"crossing-seoul-2026-12\",\"registration\":{\"join_type\":\"solo\",\"consent\":true,\"wants_matching\":true},\"members\":[$M]}"
post "(c) same email again"    "{\"eventSlug\":\"crossing-seoul-2026-12\",\"registration\":{\"join_type\":\"solo\",\"consent\":true},\"members\":[$M]}"
post "(d) no consent"          "{\"eventSlug\":\"crossing-seoul-2026-12\",\"registration\":{\"join_type\":\"solo\"},\"members\":[{\"name\":\"a\",\"email\":\"c2@example.com\",\"contact\":\"k\",\"study_country\":\"SG\",\"major\":\"테스트\",\"ai_level\":\"chat\"}]}"
post "(e) unknown answer key"  "{\"eventSlug\":\"crossing-seoul-2026-12\",\"registration\":{\"join_type\":\"solo\",\"consent\":true,\"bogus\":\"x\"},\"members\":[{\"name\":\"b\",\"email\":\"c3@example.com\",\"contact\":\"k\",\"study_country\":\"SG\",\"major\":\"테스트\",\"ai_level\":\"chat\",\"bogus2\":\"y\"}]}"
post "(f) wrong eventSlug"     "{\"eventSlug\":\"other\",\"registration\":{\"join_type\":\"solo\",\"consent\":true},\"members\":[$M]}"
post "(g) honeypot"            "{\"eventSlug\":\"crossing-seoul-2026-12\",\"url_confirm\":\"http://x\",\"registration\":{\"join_type\":\"solo\",\"consent\":true},\"members\":[{\"name\":\"h\",\"email\":\"c4@example.com\",\"contact\":\"k\",\"study_country\":\"KR\",\"major\":\"테스트\",\"ai_level\":\"chat\"}]}"
# 2026-10-07 (신청 폼 브리프 3.4): 새 필수 항목 둘의 검사. 목록 밖 단계와 빈 전공은 400.
post "(h) ai_level not in list" "{\"eventSlug\":\"crossing-seoul-2026-12\",\"registration\":{\"join_type\":\"solo\",\"consent\":true},\"members\":[{\"name\":\"i\",\"email\":\"c5@example.com\",\"contact\":\"k\",\"study_country\":\"KR\",\"major\":\"테스트\",\"ai_level\":\"expert\"}]}"
post "(i) empty major"          "{\"eventSlug\":\"crossing-seoul-2026-12\",\"registration\":{\"join_type\":\"solo\",\"consent\":true},\"members\":[{\"name\":\"j\",\"email\":\"c6@example.com\",\"contact\":\"k\",\"study_country\":\"KR\",\"major\":\"  \",\"ai_level\":\"chat\"}]}"
echo "--- 확인: crossing_registrations / crossing_members 행 수와 answers(e에 bogus 없어야, b에 major와 ai_level 있어야), 고아 행 0(c 뒤)"
echo "--- 정리: delete from crossing_members where email like 'c%@example.com' or email='crossing-test@example.com'; delete from crossing_registrations where id not in (select registration_id from crossing_members);"
