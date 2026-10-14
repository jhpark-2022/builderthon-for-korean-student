#!/usr/bin/env python3
"""공유 카드(app/opengraph-image.tsx)가 쓰는 서체 세 벌을 만듭니다.

왜 필요한가
-----------
next/og(satori)는 서체를 직접 주지 않으면 런타임의 기본 서체로 그립니다. 그
서체에는 굵기가 하나뿐이라, 900으로 적은 제목이 본문과 같은 굵기로 나옵니다.
실제로 그랬습니다(2026-09-19 이전의 카드).

satori는 **woff2를 읽지 못합니다.** 이 레포에 있는 것은 가변 woff2 하나
(app/fonts/PretendardVariable.woff2)뿐이라, 거기서 정적 ttf를 뽑아 둡니다.

무엇을 만드는가
---------------
public/fonts/Pretendard-OG-{Regular,Bold,Black}.ttf  (굵기 450 / 700 / 900)

라틴 글자와 카드에서 쓰는 문장부호, 그리고 **카드 파일에 실제로 적힌 한글만**
남깁니다.

DECIDED 2026-10-14 (사용자: "공유했을 때의 설명과 이미지가 정말 수준이 높으면"):
카드의 큰 글자를 한글로 씁니다(크로싱 서울, 나루, 제로백 빌더톤). 한글 전체를
넣으면 한 벌이 몇 MB가 되므로, 카드를 그리는 lib/ogCards.tsx에서 한글 글자를 모아
그 글자만 넣습니다. 수십 자라 한 벌이 수십 KB입니다. 카드에 한글을 새로 쓰면
**이 스크립트를 다시 돌려야** 합니다. 빠진 글자는 satori가 두부로 그립니다.
로고 PNG의 "나루"는 그대로 로고가 들고 옵니다(public/naru/README.md).

언제 다시 돌리는가
------------------
- Pretendard 원본을 바꿨을 때
- 카드에 새 문장부호가 필요할 때(CHARS에 더하고 다시 돌리세요)
- 카드 파일에 새 한글 글자를 썼을 때(자동으로 모읍니다, 다시 돌리기만 하세요)

    python3 scripts/build-og-fonts.py

필요한 것: fonttools, brotli (pip install fonttools brotli)
"""

import glob
import io
import os
import re
import sys

from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools import subset

SRC = "app/fonts/PretendardVariable.woff2"
OUT_DIR = "public/fonts"

# 기본 라틴 + 카드에서 쓰는 문장부호(가운뎃점, en/em 대시, 따옴표, 화살표 등).
CHARS = "".join(chr(c) for c in range(0x20, 0x7F)) + " ·–—‘’“”•→×…"

CARD_GLOB = "lib/ogCards.tsx"


def card_hangul() -> str:
    """카드 파일의 코드에 적힌 한글 음절을 모읍니다. 주석은 빼고 봅니다(주석의 한글까지 넣으면 몇 배로 커집니다)."""
    found = set()
    for path in glob.glob(CARD_GLOB, recursive=True):
        with open(path, encoding="utf-8") as f:
            src = f.read()
        src = re.sub(r"/\*.*?\*/", "", src, flags=re.S)
        src = re.sub(r"^\s*//.*$", "", src, flags=re.M)
        found.update(re.findall(r"[\uAC00-\uD7A3]", src))
    return "".join(sorted(found))


WEIGHTS = [("Regular", 450), ("Bold", 700), ("Black", 900)]


def main() -> int:
    if not os.path.exists(SRC):
        print(f"원본이 없습니다: {SRC}", file=sys.stderr)
        return 1
    os.makedirs(OUT_DIR, exist_ok=True)
    text = CHARS + card_hangul()
    print(f"한글 {len(text) - len(CHARS)}자")

    for name, wght in WEIGHTS:
        var = TTFont(SRC)
        var.flavor = None  # woff2 → 일반 ttf 컨테이너
        static = instantiateVariableFont(var, {"wght": wght}, inplace=True, updateFontNames=False)

        buf = io.BytesIO()
        static.save(buf)
        buf.seek(0)

        font = TTFont(buf)
        options = subset.Options()
        options.layout_features = ["kern", "liga", "calt"]
        options.name_IDs = ["*"]
        options.name_legacy = True
        options.name_languages = ["*"]
        options.notdef_outline = True
        options.recalc_bounds = True

        subsetter = subset.Subsetter(options=options)
        subsetter.populate(text=text)
        subsetter.subset(font)

        out = os.path.join(OUT_DIR, f"Pretendard-OG-{name}.ttf")
        font.flavor = None
        font.save(out)
        print(f"{out}  {os.path.getsize(out):,} bytes  (wght {wght})")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
