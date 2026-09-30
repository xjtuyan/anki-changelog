# -*- coding: utf-8 -*-
"""生成品牌标识：public/logo.svg（矢量 emblem）+ public/favicon.ico（多尺寸）。

设计：红缨枪斜出 + 金箍 + 红缨穗，突出「长缨」主题；浅底红缨，16px 仍可辨识。
运行：npm run brand  （或直接用 venv python 跑本脚本）
"""
import math
import os

from PIL import Image, ImageDraw

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUBLIC = os.path.join(ROOT, "public")
os.makedirs(PUBLIC, exist_ok=True)

RED = (192, 57, 43, 255)        # #c0392b 主红
RED_DEEP = (169, 50, 38, 255)   # #a93226 枪杆
GOLD = (241, 196, 15, 255)      # #f1c40f 金箍
CREAM = (255, 247, 240, 255)    # 底色
STEEL_LIGHT = (241, 245, 249, 255)
STEEL_DARK = (148, 163, 184, 255)
RING = (192, 57, 43, 255)

S = 256  # 画布


def rot_poly(a, b, w):
    """a->b 线段，宽 w，返回四边形顶点。"""
    ux, uy = b[0] - a[0], b[1] - a[1]
    L = math.hypot(ux, uy)
    ux, uy = ux / L, uy / L
    nx, ny = -uy, ux
    h = w / 2
    return [
        (a[0] + nx * h, a[1] + ny * h),
        (b[0] + nx * h, b[1] + ny * h),
        (b[0] - nx * h, b[1] - ny * h),
        (a[0] - nx * h, a[1] - ny * h),
    ]


def bezier(p0, p1, p2, n=28):
    pts = []
    for i in range(n + 1):
        t = i / n
        x = (1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * p1[0] + t * t * p2[0]
        y = (1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * p1[1] + t * t * p2[1]
        pts.append((x, y))
    return pts


def emblem(draw):
    A = (52, 214)    # 枪杆尾（左下）
    B = (186, 66)    # 枪杆头（右上，枪头基部）
    ux, uy = B[0] - A[0], B[1] - A[1]
    L = math.hypot(ux, uy)
    ux, uy = ux / L, uy / L
    nx, ny = -uy, ux
    back = (-ux, -uy)

    # 缨穗（画在杆后面）
    P = (B[0] - ux * 10, B[1] - uy * 10)
    strands = [
        bezier(P, (P[0] + back[0] * 16 - nx * 22, P[1] + back[1] * 16 - ny * 22),
               (P[0] + back[0] * 44 - nx * 34, P[1] + back[1] * 44 - ny * 34)),
        bezier(P, (P[0] + back[0] * 20, P[1] + back[1] * 20),
               (P[0] + back[0] * 52, P[1] + back[1] * 52)),
        bezier(P, (P[0] + back[0] * 16 + nx * 22, P[1] + back[1] * 16 + ny * 22),
               (P[0] + back[0] * 44 + nx * 34, P[1] + back[1] * 44 + ny * 34)),
    ]
    for pts in strands:
        draw.line(pts, fill=RED, width=11, joint="curve")
    draw.ellipse([P[0] - 13, P[1] - 13, P[0] + 13, P[1] + 13], fill=RED)

    # 枪杆
    draw.polygon(rot_poly(A, B, 13), fill=RED_DEEP)

    # 枪头（叶形：三角近似 + 圆肩）
    T = (B[0] + ux * 42, B[1] + uy * 42)
    draw.polygon([T, (B[0] + nx * 17, B[1] + ny * 17), (B[0] - nx * 17, B[1] - ny * 17)],
                 fill=STEEL_LIGHT, outline=STEEL_DARK)

    # 金箍
    f0 = (B[0] + ux * 6, B[1] + uy * 6)
    f1 = (B[0] - ux * 8, B[1] - uy * 8)
    draw.polygon(rot_poly(f0, f1, 22), fill=GOLD)


def raster(size, ring=True):
    img = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([10, 10, S - 10, S - 10], radius=54, fill=CREAM)
    if ring:
        d.rounded_rectangle([10, 10, S - 10, S - 10], radius=54, outline=RING, width=10)
    emblem(d)
    if size != S:
        img = img.resize((size, size), Image.LANCZOS)
    return img


# ---- favicon.ico ----
base = raster(S)
base.save(os.path.join(PUBLIC, "favicon.ico"), format="ICO",
          sizes=[(16, 16), (32, 32), (48, 48), (64, 64), (128, 128)])
base.save(os.path.join(PUBLIC, "logo-emblem.png"))

# ---- logo.svg（同几何） ----
svg = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <defs>
    <linearGradient id="steel" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#f1f5f9"/>
      <stop offset="1" stop-color="#94a3b8"/>
    </linearGradient>
  </defs>
  <rect x="2.5" y="2.5" width="59" height="59" rx="13.5" fill="#fff7f0" stroke="#c0392b" stroke-width="2.5"/>
  <g transform="rotate(45 32 32)">
    <path d="M32 22 C27 27 25.5 33 27.5 40" fill="none" stroke="#c0392b" stroke-width="2.6" stroke-linecap="round"/>
    <path d="M32 22 C32 28 32 34 32 41" fill="none" stroke="#c0392b" stroke-width="2.8" stroke-linecap="round"/>
    <path d="M32 22 C37 27 38.5 33 36.5 40" fill="none" stroke="#c0392b" stroke-width="2.6" stroke-linecap="round"/>
    <circle cx="32" cy="21" r="3.4" fill="#c0392b"/>
    <rect x="28.6" y="16.5" width="6.8" height="3.4" rx="1.7" fill="#f1c40f"/>
    <rect x="30" y="19.5" width="4" height="26" rx="2" fill="#a93226"/>
    <path d="M32 3 C36.2 7.6 37.2 11.2 32 15.8 C26.8 11.2 27.8 7.6 32 3 Z" fill="url(#steel)" stroke="#94a3b8" stroke-width="0.7"/>
  </g>
</svg>
"""
with open(os.path.join(PUBLIC, "logo.svg"), "w", encoding="utf-8") as f:
    f.write(svg)

print("已生成：public/favicon.ico / logo-emblem.png / logo.svg")
