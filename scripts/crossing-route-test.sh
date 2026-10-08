#!/bin/zsh
# 12월 라우트 시나리오(브리프 4.4). 전제: 마이그레이션 적용됨, 로컬에서 CROSSING_WINDOW.opensAt을 과거로,
# data/crossingForm.ts의 CONSENT_RETENTION을 임시 문장으로 설정하고 빌드(둘 다 커밋 안 함. 보관 기간이 비어 있으면
# 창이 열려도 전부 403이다). usage: ./crossing-route-test.sh http://localhost:4099
# 2026-10-08 (사용자: "팀 - 전원 현장 편성"): 한 폼에 한 사람. 팀 꼴은 400. 이미 등록된 이메일은 성공과 같은 201(새 행 없음).
B=${1:-http://localhost:4099}; U=$B/api/crossing/register
E=crossing-seoul-2026-12
post() { printf "%-30s" "$1"; curl -s -w " → %{http_code}\n" -X POST -H "content-type: application/json" -d "$2" $U; }
M='{"name":"테스트","email":"crossing-test@example.com","contact":"kakaotest","university":"테스트대","study_country":"KR","major":"경영학","ai_level":"terminal"}'
post "(b) valid, 201"            "{\"eventSlug\":\"$E\",\"registration\":{\"consent\":true},\"members\":[$M]}"
post "(c) same email, 201 no row" "{\"eventSlug\":\"$E\",\"registration\":{\"consent\":true},\"members\":[$M]}"
post "(d) no consent, 400"       "{\"eventSlug\":\"$E\",\"registration\":{},\"members\":[{\"name\":\"a\",\"email\":\"c2@example.com\",\"contact\":\"k\",\"study_country\":\"SG\",\"major\":\"테스트\",\"ai_level\":\"chat\"}]}"
post "(e) unknown keys, 201"     "{\"eventSlug\":\"$E\",\"registration\":{\"consent\":true,\"bogus\":\"x\"},\"members\":[{\"name\":\"b\",\"email\":\"c3@example.com\",\"contact\":\"k\",\"study_country\":\"SG\",\"major\":\"테스트\",\"ai_level\":\"chat\",\"bogus2\":\"y\"}]}"
post "(f) wrong eventSlug, 400"  "{\"eventSlug\":\"other\",\"registration\":{\"consent\":true},\"members\":[$M]}"
post "(g) honeypot, quiet 201"   "{\"eventSlug\":\"$E\",\"url_confirm\":\"http://x\",\"registration\":{\"consent\":true},\"members\":[{\"name\":\"h\",\"email\":\"c4@example.com\",\"contact\":\"k\",\"study_country\":\"KR\",\"major\":\"테스트\",\"ai_level\":\"chat\"}]}"
# 2026-10-07 (신청 폼 브리프 3.4): 새 필수 항목 둘의 검사. 목록 밖 단계와 빈 전공은 400.
post "(h) ai_level not in list"  "{\"eventSlug\":\"$E\",\"registration\":{\"consent\":true},\"members\":[{\"name\":\"i\",\"email\":\"c5@example.com\",\"contact\":\"k\",\"study_country\":\"KR\",\"major\":\"테스트\",\"ai_level\":\"expert\"}]}"
post "(i) empty major, 400"      "{\"eventSlug\":\"$E\",\"registration\":{\"consent\":true},\"members\":[{\"name\":\"j\",\"email\":\"c6@example.com\",\"contact\":\"k\",\"study_country\":\"KR\",\"major\":\"  \",\"ai_level\":\"chat\"}]}"
# 2026-10-08: 팀 꼴, 나라, 본문 모양.
post "(j) two members, 400"      "{\"eventSlug\":\"$E\",\"registration\":{\"consent\":true},\"members\":[$M,$M]}"
post "(k) join_type team, 400"   "{\"eventSlug\":\"$E\",\"registration\":{\"consent\":true,\"join_type\":\"team\",\"team_name\":\"t\"},\"members\":[$M]}"
post "(l) other country, 201"    "{\"eventSlug\":\"$E\",\"registration\":{\"consent\":true},\"members\":[{\"name\":\"l\",\"email\":\"c7@example.com\",\"contact\":\"k\",\"study_country\":\"OTHER\",\"study_country_other\":\"프랑스\",\"major\":\"테스트\",\"ai_level\":\"chat\"}]}"
post "(m) other, no name, 400"   "{\"eventSlug\":\"$E\",\"registration\":{\"consent\":true},\"members\":[{\"name\":\"m\",\"email\":\"c8@example.com\",\"contact\":\"k\",\"study_country\":\"OTHER\",\"major\":\"테스트\",\"ai_level\":\"chat\"}]}"
post "(n) code not in list, 400" "{\"eventSlug\":\"$E\",\"registration\":{\"consent\":true},\"members\":[{\"name\":\"n\",\"email\":\"c9@example.com\",\"contact\":\"k\",\"study_country\":\"ZZ\",\"major\":\"테스트\",\"ai_level\":\"chat\"}]}"
post "(o) body null, 400"        "null"
echo "--- 확인: crossing_registrations / crossing_members 행 수(b, e, l만 행이 생긴다), answers(e에 bogus 없어야, b에 major와 ai_level, l에 study_country_other와 study_country null), 고아 행 0(c 뒤), 전부 join_type solo"
echo "--- 정리: delete from crossing_members where email like 'c%@example.com' or email='crossing-test@example.com'; delete from crossing_registrations where id not in (select registration_id from crossing_members);"
