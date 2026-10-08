#!/usr/bin/env python3
"""사이트 본문 서체의 서브셋을 만듭니다.

왜 필요한가
-----------
app/fonts/PretendardVariable.woff2는 2.06MB이고, 모든 경로에서 높은 우선순위로 프리로드됩니다.
폰의 LTE에서 히어로 이미지와 대역폭을 다툽니다(2026-10-08 성능 리뷰 1).

무엇을 만드는가
---------------
app/fonts/PretendardSubset.woff2 (가변 굵기 그대로, 약 0.5MB)

남기는 글자:
- KS X 1001 완성형 한글 2,350자 (일상 한국어를 거의 다 덮습니다)
- 기본 라틴, 라틴-1, 자주 쓰는 문장부호와 기호
- 레포의 app, components, data, lib 소스에 실제로 나오는 모든 글자 (위에 없는 것까지)

빠진 글자(폼에 직접 친 드문 음절 등)는 시스템 서체로 떨어집니다. 원본은 지우지 않습니다.
scripts/build-og-fonts.py가 원본에서 공유 카드용 ttf를 뽑습니다.

언제 다시 돌리는가
------------------
- 화면에 네모(빠진 글자)가 보일 때, 새 기호를 문장에 넣었을 때
- Pretendard 원본을 바꿨을 때

    python3 scripts/build-site-font.py

필요한 것: fonttools, brotli (pip install fonttools brotli)
"""

import os
import sys

from fontTools import subset
from fontTools.ttLib import TTFont

SRC = "app/fonts/PretendardVariable.woff2"
OUT = "app/fonts/PretendardSubset.woff2"
SCAN_DIRS = ["app", "components", "data", "lib"]
SCAN_EXT = (".ts", ".tsx", ".css")


def ksx1001_hangul() -> set[int]:
    out: set[int] = set()
    for lead in range(0xB0, 0xC9):
        for trail in range(0xA1, 0xFF):
            try:
                out.add(ord(bytes([lead, trail]).decode("euc_kr")))
            except UnicodeDecodeError:
                pass
    return out


def source_chars() -> set[int]:
    out: set[int] = set()
    for d in SCAN_DIRS:
        for root, _, files in os.walk(d):
            for f in files:
                if f.endswith(SCAN_EXT):
                    with open(os.path.join(root, f), encoding="utf-8") as fh:
                        out.update(ord(c) for c in fh.read())
    return out


def main() -> int:
    if not os.path.exists(SRC):
        print(f"원본이 없습니다: {SRC}", file=sys.stderr)
        return 1
    wanted = set(range(0x20, 0x7F)) | set(range(0xA0, 0x100))
    wanted |= set(range(0x2010, 0x2028)) | set(range(0x2030, 0x2040))  # 대시, 따옴표, 말줄임표, 프라임
    wanted |= set(range(0x3131, 0x3164))  # 호환 자모 (ㄱ, ㅏ: 입력 중간 상태)
    wanted |= ksx1001_hangul() | source_chars()

    font = TTFont(SRC)
    have = set(font.getBestCmap().keys())
    keep = sorted(wanted & have)

    opts = subset.Options()
    opts.flavor = "woff2"
    opts.layout_features = ["*"]
    opts.notdef_outline = True
    opts.name_IDs = ["*"]
    sub = subset.Subsetter(opts)
    sub.populate(unicodes=keep)
    sub.subset(font)
    font.flavor = "woff2"
    font.save(OUT)

    hangul = sum(1 for c in keep if 0xAC00 <= c <= 0xD7A3)
    print(f"{OUT}: {os.path.getsize(OUT):,} bytes, {len(keep):,} glyph codepoints ({hangul:,} 한글)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
