#!/usr/bin/env python3
# 生成 favicon.ico（红卡 + 金色缨穗标识，多尺寸）与 256px logo-emblem.png
from PIL import Image, ImageDraw

def draw_emblem(S):
    img = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    r = int(S * 0.18)
    m = max(1, S // 16)
    card = [m, int(S * 0.22), S - m, S - int(S * 0.06)]
    d.rounded_rectangle(card, radius=r, fill=(192, 57, 43, 255))
    # 顶部高光
    hl = [card[0], card[1], card[2], card[1] + (card[3] - card[1]) // 2]
    d.rounded_rectangle(hl, radius=r, fill=(231, 76, 60, 255))
    # 缨穗金结
    kx, ky = S // 2, int(S * 0.14)
    kr = max(1, int(S * 0.06))
    d.ellipse([kx - kr, ky - kr, kx + kr, ky + kr], fill=(241, 196, 15, 255))
    lw = max(1, S // 22)
    d.line([(kx, ky + kr), (kx - int(S * 0.09), int(S * 0.40))], fill=(241, 196, 15, 255), width=lw)
    d.line([(kx, ky + kr), (kx, int(S * 0.43))], fill=(241, 196, 15, 255), width=lw)
    d.line([(kx, ky + kr), (kx + int(S * 0.09), int(S * 0.40))], fill=(241, 196, 15, 255), width=lw)
    # 卡针（白）
    pinw = max(1, S // 16)
    pinh = max(1, int(S * 0.06))
    py = int(S * 0.72)
    for off in (-1, 0, 1):
        px = kx + off * int(S * 0.11) - pinw // 2
        d.rounded_rectangle([px, py, px + pinw, py + pinh], radius=max(1, pinw // 2), fill=(255, 255, 255, 230))
    return img

ico_sizes = [16, 32, 48, 128]
imgs = [draw_emblem(s) for s in ico_sizes]
imgs[0].save("favicon.ico", format="ICO", sizes=[(s, s) for s in ico_sizes], append_images=imgs[1:])
# 256px 站点用 emblem
draw_emblem(256).save("assets/logo-emblem.png")
print("favicon.ico + assets/logo-emblem.png generated")
