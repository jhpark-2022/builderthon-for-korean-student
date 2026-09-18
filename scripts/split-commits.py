"""작업 트리의 변경을 감사 반영 브리프 11.9의 커밋 여섯으로 나눕니다(2026-09-18).
파일 단위로 나눌 수 없는 NaruHome.tsx 등은 hunk 단위로 분류합니다: 매 라운드마다 index 대비 diff를 다시
읽어 선택한 hunk만 `git apply --cached`로 올리므로 줄 번호가 어긋나지 않습니다. 분류는 키워드 점수의
최댓값(동점이면 앞 라운드)입니다.
쓰기: python3 scripts/split-commits.py <round 1..6> [--dry]"""
import subprocess, sys, re

FILES = {
 1: {"components/ui/Chip.tsx","components/ui/Eyebrow.tsx","components/ui/Halo.tsx","components/ui/typography.ts","components/crossing/RegisterModal.tsx","components/shared/RouteMap.tsx"},
 3: {"components/ui/MotionToggle.tsx"},
 5: {"components/LocaleToggle.tsx"},
 6: {"app/globals.css","app/layout.tsx","components/journey/Chapter.tsx","lib/LocaleContext.tsx"},
}
KEYS = {
 1: ["emerald","orange","F2B183","EE8A4F","plum","GRADIENT","Halo","Eyebrow","rose-","violet","cyan","naru-purple","C79BB4","9A5A82","주황","민트","tone=\"outline\"","RoleLabel","현재 위치","dotLeft","starFlash","FlowStrip","플로우","title: {","stage.title","s.title","sub &&","lowercase","bg-accent/80","bg-accent/70","decemberLabel","border-accent/30","bg-accent/15","text-accent\">","보라 외곽선","강조색"],
 2: ["preparing","Preparing","naruLine","photosCaption","photo.day","figcaption","HeroPhotos","register-note","notSequel","두 번째 이벤트","alumniLink","join-alumni","photos.filter","캡션"],
 3: ["DayCard","openDay","hoverDay","KeepsPanel","아코디언","w-[160px]","lines[1]","noteBody","how.lead","md:block","md:py-5","md:mt-1.5","px-3 py-2 sm:gap-3","compact","grid-cols-2 gap-2","각주","gap-3 py-5","lg:text-center","lg:mt-12","lg:pt-12","mt-8 lg:mt-12","sm:!p-5","hidden flex-wrap","inline break-keep","sm:mr-0","grid-cols-2 gap-x-4","last:border-b-0","sm:grid-cols-2 sm:gap-4","useScrollDirection({","headerRef","translate-y-[52px]","mask-image","snap-","MotionToggle compact","scrollPaddingTop","길이 목표","폰에서"],
 4: ["Funnel","funnel","RecordTabs","깔때기","min-h-[64px]","lg:items-start","evidence","card.gets","gets:","getsShort","layer.gets","brings","얻는 것"],
 5: ["aria-label","aria-hidden","aria-disabled","aria-describedby","min-h-[44px]","countdownAria","role=\"group\"","LocaleToggle variant","aria-current","reduce = window.matchMedia","buttonClass(\"text\")"],
 6: ["sizes=","scrollIntoView({ behavior","scroll-behavior","HOME_TITLE","alternates","alternateLocale","LOCALE_BOOTSTRAP","Chapter","capture","diff-frames"],
}
rnd = int(sys.argv[1]); dry = "--dry" in sys.argv
diff = subprocess.run(["git","diff","-U3","--no-color"], capture_output=True, text=True).stdout
files = re.split(r'(?=^diff --git )', diff, flags=re.M)
out = []; report = {}
for f in files:
    if not f.strip(): continue
    path = re.match(r'diff --git a/(\S+) b/', f).group(1)
    head, *hunks = re.split(r'(?=^@@ )', f, flags=re.M)
    owner = next((r for r, fs in FILES.items() if path in fs), None)
    if owner is not None:
        if owner == rnd: out.append(f); report[path] = len(hunks)
        continue
    chosen = []
    for h in hunks:
        body = "\n".join(l for l in h.splitlines() if l.startswith(("+","-")))
        scores = {r: sum(body.count(k) for k in ks) for r, ks in KEYS.items()}
        best = max(scores, key=lambda r: (scores[r], -r))
        if scores[best] == 0: best = 6
        if best == rnd: chosen.append(h)
    if chosen: out.append(head + "".join(chosen)); report[path] = len(chosen)
patch = "".join(out)
if dry: print(rnd, report); sys.exit()
if not patch.strip(): print("nothing"); sys.exit(0)
r = subprocess.run(["git","apply","--cached","--recount","-"], input=patch, text=True, capture_output=True)
print(r.returncode, r.stderr[:500])
