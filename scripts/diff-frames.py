"""두 프레임 폴더의 같은 이름 PNG를 픽셀 비교합니다(2026-09-18). 쓰기: python3 scripts/diff-frames.py A B"""
import sys, os
from PIL import Image, ImageChops
import numpy as np
a, b = sys.argv[1], sys.argv[2]
for name in sorted(f for f in os.listdir(a) if f.endswith(".png")):
    pa, pb = os.path.join(a, name), os.path.join(b, name)
    if not os.path.exists(pb): print(name, "missing in B"); continue
    ia, ib = Image.open(pa).convert("RGB"), Image.open(pb).convert("RGB")
    if ia.size != ib.size: print(name, "size", ia.size, ib.size); continue
    d = np.asarray(ImageChops.difference(ia, ib)).max(axis=2)
    print(name, "diff px:", int((d > 16).sum()), "of", d.size)
