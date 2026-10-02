import sys, math, numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

SERIES_LABEL = "YOUR SERIES NAME"   # set from the intake answers, upper case
FPS = 30
DUR = 116.79
NFR = int(DUR * FPS)
W, H = 1080, 820
EDGE = 774          # black area ends at 760 on the 1080x1920 frame

FD = "/usr/share/fonts/truetype/google-fonts/"
_fc = {}
def P(w, s):
    k = ("P", w, s)
    if k not in _fc: _fc[k] = ImageFont.truetype(FD + f"Poppins-{w}.ttf", s)
    return _fc[k]
def SERIF(s):
    k = ("L", s)
    if k not in _fc:
        f = ImageFont.truetype(FD + "Lora-Variable.ttf", s)
        try: f.set_variation_by_name("Bold")
        except Exception: pass
        _fc[k] = f
    return _fc[k]
MONO = "/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf"
def M(s):
    k = ("M", s)
    if k not in _fc: _fc[k] = ImageFont.truetype(MONO, s)
    return _fc[k]

# light graph-paper theme (no black background, no purple)
PAPER = (246, 242, 233); GRID = (226, 220, 206); GRID2 = (210, 202, 186)
INK = (27, 36, 48); GREY = (104, 112, 124); SOFT = (170, 162, 148)
TEAL = (12, 140, 124); ORANGE = (232, 119, 0); RED = (214, 48, 49)
GREEN = (43, 138, 62); BLUE = (28, 110, 196); HILITE = (255, 212, 59)
CARD = (255, 253, 248)

def clamp(x, a=0.0, b=1.0): return max(a, min(b, x))
def eo(x): x = clamp(x); return 1 - (1 - x) ** 3
def eio(x): x = clamp(x); return 3*x*x - 2*x*x*x
def eb(x):
    x = clamp(x); c1 = 1.70158; c3 = c1 + 1
    return 1 + c3 * (x - 1) ** 3 + c1 * (x - 1) ** 2
def lerp(a, b, k): return a + (b - a) * k
def fade(c, a): return tuple(c[:3]) + (int(255 * clamp(a)),)
def along(p, x0, y0, x1, y1): p = eio(p); return lerp(x0, x1, p), lerp(y0, y1, p)

# ---------- paper background ----------
rng = np.random.default_rng(5)
TW, TH = W + 72, H + 72
def make_bg():
    yy, xx = np.mgrid[0:TH, 0:TW]
    img = np.zeros((TH, TW, 3), np.float32) + np.array(PAPER, np.float32)
    minor = (xx % 36 < 1.4) | (yy % 36 < 1.4)
    major = (xx % 180 < 2) | (yy % 180 < 2)
    img[minor] = GRID; img[major] = GRID2
    img += rng.normal(0, 3.2, (TH, TW, 1))
    # paper fibres / blotches
    for _ in range(40):
        cx, cy, r = rng.uniform(0, TW), rng.uniform(0, TH), rng.uniform(40, 160)
        d = np.sqrt((xx - cx) ** 2 + (yy - cy) ** 2)
        img -= (np.clip(1 - d / r, 0, 1) ** 2)[..., None] * rng.uniform(2, 6)
    return np.clip(img, 0, 255).astype(np.uint8)
BGTEX = make_bg()
DOTS = [(rng.uniform(0, W), rng.uniform(0, H), rng.uniform(1.2, 2.6), rng.uniform(0, 6.28)) for _ in range(60)]
def background(t):
    ox = int(t * 6) % 36; oy = int(t * 4) % 36
    return Image.fromarray(BGTEX[oy:oy + H, ox:ox + W]).convert("RGBA")

# ---------- helpers ----------
def text(d, xy, s, f, fill, anchor="la"): d.text(xy, s, font=f, fill=fill, anchor=anchor)

def box(d, cx, cy, w, h, label, sub=None, col=INK, a=1.0, fill=CARD, bold=False, lf=None, sf=None):
    if a <= 0: return
    x0, y0 = cx - w/2, cy - h/2
    d.rounded_rectangle([x0 + 5, y0 + 6, x0 + w + 5, y0 + h + 6], radius=16, fill=fade(SOFT, a * 0.45))
    d.rounded_rectangle([x0, y0, x0 + w, y0 + h], radius=16, fill=fade(fill, a), outline=fade(col, a), width=5 if bold else 3)
    lf = lf or P("Bold", 28)
    if sub:
        text(d, (cx, cy - 13), label, lf, fade(INK, a), "mm")
        text(d, (cx, cy + 20), sub, sf or P("Medium", 20), fade(GREY, a), "mm")
    else:
        text(d, (cx, cy), label, lf, fade(INK, a), "mm")

def arrow(d, x0, y0, x1, y1, col=INK, a=1.0, prog=1.0, width=4, dash=False):
    if a <= 0 or prog <= 0: return
    xe, ye = lerp(x0, x1, prog), lerp(y0, y1, prog)
    if dash:
        n = max(1, int(math.hypot(xe - x0, ye - y0) / 16))
        for i in range(0, n, 2):
            d.line([lerp(x0, xe, i/n), lerp(y0, ye, i/n), lerp(x0, xe, (i+1)/n), lerp(y0, ye, (i+1)/n)], fill=fade(col, a), width=width)
    else:
        d.line([x0, y0, xe, ye], fill=fade(col, a), width=width)
    if prog > 0.95:
        ang = math.atan2(y1 - y0, x1 - x0); L = 16
        d.polygon([(x1, y1), (x1 - L*math.cos(ang - 0.45), y1 - L*math.sin(ang - 0.45)), (x1 - L*math.cos(ang + 0.45), y1 - L*math.sin(ang + 0.45))], fill=fade(col, a))

def chip(d, cx, cy, s, col, a=1.0, f=None, tc=(255, 255, 255)):
    if a <= 0: return
    f = f or P("Bold", 22)
    w = d.textlength(s, font=f) + 32
    d.rounded_rectangle([cx - w/2, cy - 21, cx + w/2, cy + 21], radius=21, fill=fade(col, a))
    text(d, (cx, cy + 1), s, f, fade(tc, a), "mm")

def marker(d, x0, y0, x1, y1, a=1.0):   # highlighter stroke
    d.rounded_rectangle([x0, y0, x1, y1], radius=6, fill=fade(HILITE, a * 0.75))

def dot(d, x, y, col, a=1.0, r=10): d.ellipse([x - r, y - r, x + r, y + r], fill=fade(col, a))
def check(d, cx, cy, a=1.0, r=18, col=GREEN):
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=fade(col, a))
    d.line([cx - 8, cy, cx - 2, cy + 7, cx + 9, cy - 7], fill=fade((255, 255, 255), a), width=4)
def cross(d, cx, cy, a=1.0, r=18):
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=fade(RED, a))
    d.line([cx - 7, cy - 7, cx + 7, cy + 7], fill=fade((255, 255, 255), a), width=4)
    d.line([cx - 7, cy + 7, cx + 7, cy - 7], fill=fade((255, 255, 255), a), width=4)

def header(d, t, title, t0, sub=None):
    d.rectangle([48, 100, 56, 136], fill=RED)
    text(d, (70, 118), SERIES_LABEL, P("Medium", 28), INK, "lm")
    k = eo((t - t0) / 0.5)
    f = SERIF(60)
    while d.textlength(title, font=f) > W - 110: f = SERIF(f.size - 2)
    text(d, (50 + (1 - k) * 60, 150), title, f, fade(INK, k))
    if sub: text(d, (52 + (1 - k) * 60, 150 + f.size + 14), sub, P("Medium", 26), fade(ORANGE, k))

def stamp(img, s, cx, cy, col, k, size=60, rot=-5):
    layer = Image.new("RGBA", img.size, (0, 0, 0, 0)); ld = ImageDraw.Draw(layer)
    f = P("Bold", size); tw = ld.textlength(s, font=f)
    ld.rounded_rectangle([cx - tw/2 - 30, cy - size*0.8, cx + tw/2 + 30, cy + size*0.8], radius=14, outline=fade(col, k), width=8, fill=fade(PAPER, 0.85 * k))
    ld.text((cx, cy + 2), s, font=f, fill=fade(col, k), anchor="mm")
    img.alpha_composite(layer.rotate(rot, center=(cx, cy), resample=Image.BICUBIC))

# ---------- mini table widget ----------
def table(d, x, y, w, rows, t, a=1.0, hl_row=None, scan=None, row_h=40, cols=("id", "name", "email")):
    if a <= 0: return
    d.rounded_rectangle([x + 5, y + 6, x + w + 5, y + row_h * (len(rows) + 1) + 6], radius=12, fill=fade(SOFT, a * 0.4))
    d.rounded_rectangle([x, y, x + w, y + row_h * (len(rows) + 1)], radius=12, fill=fade(CARD, a), outline=fade(INK, a), width=3)
    cw = [0.18, 0.30, 0.52]
    cx = x
    for i, c in enumerate(cols):
        text(d, (cx + 16, y + row_h / 2), c, P("Bold", 20), fade(GREY, a), "lm"); cx += w * cw[i]
    d.line([x, y + row_h, x + w, y + row_h], fill=fade(INK, a), width=2)
    for r, vals in enumerate(rows):
        ry = y + row_h * (r + 1)
        if scan is not None and r == scan: d.rectangle([x + 3, ry + 2, x + w - 3, ry + row_h - 2], fill=fade((255, 226, 200), a))
        if hl_row is not None and r == hl_row: marker(d, x + 6, ry + 5, x + w - 6, ry + row_h - 5, a)
        cx = x
        for i, v in enumerate(vals):
            text(d, (cx + 16, ry + row_h / 2), v, M(18), fade(INK, a), "lm"); cx += w * cw[i]
        if r < len(rows) - 1: d.line([x + 10, ry + row_h, x + w - 10, ry + row_h], fill=fade(GRID2, a), width=1)

NAMES = ["aarav", "diya", "kabir", "meera", "rohan", "sana", "vivek", "isha", "arjun", "neha", "saurav", "tara"]
def fake_rows(start, n):
    out = []
    for i in range(n):
        k = start + i; nm = NAMES[k % len(NAMES)]
        out.append((str(1000 + k * 37), nm, f"{nm}{k % 90}@mail.com"))
    return out

# ---------- scenes ----------
def s_hook(img, d, t):    # 0 - 4
    d.rectangle([48, 100, 56, 136], fill=RED)
    text(d, (70, 118), SERIES_LABEL, P("Medium", 28), INK, "lm")
    k = eo((t - 0.2) / 0.5)
    text(d, (540, 300 + (1 - k) * 40), "Database Indexes", SERIF(92), fade(INK, k), "mm")
    if t > 0.9:
        k2 = eo((t - 0.9) / 0.5); w = 700 * k2
        marker(d, 540 - 350, 330, 540 - 350 + w, 356, 1)
        text(d, (540, 300), "Database Indexes", SERIF(92), INK, "mm")
    # key icon
    if t > 2.0:
        k3 = eb((t - 2.0) / 0.5); cx, cy = 540, 520
        s = clamp(k3, 0, 1.2)
        d.ellipse([cx - 150 * s, cy - 42 * s, cx - 66 * s, cy + 42 * s], outline=ORANGE, width=int(12 * max(s, 0.1)))
        d.rectangle([cx - 70 * s, cy - 8 * s, cx + 130 * s, cy + 8 * s], fill=ORANGE)
        d.rectangle([cx + 80 * s, cy, cx + 96 * s, cy + 36 * s], fill=ORANGE)
        d.rectangle([cx + 110 * s, cy, cx + 126 * s, cy + 28 * s], fill=ORANGE)
        text(d, (540, 640), "= the KEY concept of databases", P("Bold", 34), fade(INK, clamp((t - 2.3) / 0.4)), "mm")

def s_title(img, d, t):   # 4 - 8
    lt = t - 4
    d.rectangle([48, 100, 56, 136], fill=RED)
    text(d, (70, 118), SERIES_LABEL, P("Medium", 28), INK, "lm")
    for i, (w, x, y, f, col) in enumerate([("How", 90, 230, SERIF(92), INK), ("Database Indexes", 150, 350, SERIF(104), TEAL), ("work", 610, 480, SERIF(92), INK)]):
        k = eo((lt - i * 0.35) / 0.5)
        text(d, (x + (1 - k) * 80, y), w, f, fade(col, k))
    if lt > 2.2: chip(d, 540, 680, "Episode: " + "Database Indexes", ORANGE, eo((lt - 2.2) / 0.4), P("Bold", 26))

def s_problem(img, d, t): # 8 - 13
    header(d, t, "10 million users. Find one.", 8.0)
    a = eo((t - 8.3) / 0.5)
    off = int(t * 30) % 40
    rows = fake_rows(int(t * 6), 8)
    table(d, 90, 270, 560, rows, t, a, row_h=44)
    text(d, (370, 700), "users table", P("Medium", 22), fade(GREY, a), "mm")
    k = eo((t - 9.0) / 0.6)
    n = int(10_000_000 * k)
    text(d, (870, 340), f"{n:,}", P("Bold", 58), fade(TEAL, a), "mm")
    text(d, (870, 395), "rows", P("Medium", 26), fade(GREY, a), "mm")
    if t > 10.8:
        k2 = eb((t - 10.8) / 0.4)
        d.rounded_rectangle([700, 470, 1040, 600], radius=16, fill=fade(CARD, clamp(k2)), outline=fade(ORANGE, clamp(k2)), width=3)
        text(d, (870, 505), "find:", P("Medium", 22), fade(GREY, clamp(k2)), "mm")
        text(d, (870, 552), "saurav@mail.com", M(24), fade(INK, clamp(k2)), "mm")
        # magnifier
        mx, my = 870 + 10 * math.sin(t * 4), 650
        d.ellipse([mx - 30, my - 30, mx + 30, my + 30], outline=ORANGE, width=7)
        d.line([mx + 20, my + 20, mx + 50, my + 50], fill=ORANGE, width=9)

def s_scan(img, d, t):    # 13 - 26
    header(d, t, "Naive approach: full table scan", 13.0)
    rows = fake_rows(int(max(0, t - 13) * 14), 8)
    scan = int((t * 12) % 8)
    table(d, 60, 260, 520, rows, t, 1, scan=scan, row_h=44)
    # scanned counter + time
    k = clamp((t - 13.5) / 5.0)
    n = int(10_000_000 * k)
    text(d, (820, 290), "rows scanned", P("Medium", 24), GREY, "mm")
    text(d, (820, 340), f"{n:,}", P("Bold", 50), RED if k >= 1 else INK, "mm")
    text(d, (820, 395), "O(n)  one row at a time", M(22), GREY, "mm")
    # peak traffic
    if t > 19.5:
        a = eo((t - 19.5) / 0.4)
        text(d, (820, 460), "peak traffic", P("Bold", 26), fade(ORANGE, a), "mm")
        for i in range(12):
            ph = (t * 1.3 + i / 12) % 1
            x = lerp(1060, 660, ph); y = 520 + (i % 4) * 18
            dot(d, x, y, ORANGE, a * 0.9, 7)
        # CPU meter
        load = clamp((t - 20.0) / 4.0)
        d.rounded_rectangle([640, 600, 1000, 640], radius=20, fill=fade(CARD, a), outline=fade(INK, a), width=3)
        col = GREEN if load < 0.5 else (ORANGE if load < 0.85 else RED)
        if load > 0.02: d.rounded_rectangle([643, 603, 643 + 354 * load, 637], radius=17, fill=fade(col, a))
        text(d, (820, 670), f"DB CPU {int(load * 100)}%", P("Bold", 24), fade(col, a), "mm")
    if t > 24.4:
        k = eo((t - 24.4) / 0.25)
        shake = int(8 * math.sin(t * 70) * max(0, 1 - (t - 24.4) / 0.6))
        stamp(img, "DB CRASH", 540 + shake, 470, RED, k, 76, -6)

def s_index(img, d, t):   # 26 - 34
    header(d, t, "Enter: the Index", 26.0, "a separate data structure")
    a1 = eo((t - 26.4) / 0.5)
    rows = [("1037", "diya", "diya1@mail.com"), ("4821", "saurav", "saurav10@mail.com"), ("2210", "neha", "neha9@mail.com"), ("7765", "arjun", "arjun8@mail.com"), ("3302", "tara", "tara11@mail.com")]
    table(d, 470, 300, 560, rows, t, a1, row_h=52, hl_row=1 if t > 32 else None)
    text(d, (750, 640), "table (data on disk)", P("Medium", 22), fade(GREY, a1), "mm")
    a2 = eo((t - 28.6) / 0.5)
    # index card like a book index
    d.rounded_rectangle([60, 300, 370, 610], radius=16, fill=fade(CARD, a2), outline=fade(TEAL, a2), width=4)
    text(d, (215, 330), "INDEX (email)", P("Bold", 24), fade(TEAL, a2), "mm")
    idx = [("arjun8@...", 3), ("diya1@...", 0), ("neha9@...", 2), ("saurav10@...", 1), ("tara11@...", 4)]
    for i, (e, r) in enumerate(idx):
        yy = 375 + i * 48
        if t > 31.5 and r == 1: marker(d, 74, yy - 18, 356, yy + 18, a2)
        text(d, (84, yy), e, M(19), fade(INK, a2), "lm")
        text(d, (340, yy), f"-> row {r+1}", M(17), fade(GREY, a2), "rm")
    text(d, (215, 640), "sorted, points to location", P("Medium", 21), fade(GREY, a2), "mm")
    if t > 31.5:
        k = eo((t - 31.5) / 0.8)
        arrow(d, 360, 375 + 3 * 48, 468, 300 + 52 * 2 + 26, TEAL, 1, k, 5)

# B+ tree layout
ROOT = (540, 290, ["30", "60"])
MID = [(188, 450, ["10", "20"]), (540, 450, ["40", "50"]), (892, 450, ["70", "80"])]
LEAF = [(95, 620, ["5", "8"]), (280, 620, ["12", "18"]), (450, 620, ["33", "38"]), (630, 620, ["42", "47"]), (800, 620, ["62", "68"]), (985, 620, ["72", "91"])]
def node(d, cx, cy, keys, a=1.0, col=INK, active=False, w=None):
    w = w or 70 * len(keys) + 40; h = 64
    d.rounded_rectangle([cx - w/2 + 5, cy - h/2 + 6, cx + w/2 + 5, cy + h/2 + 6], radius=10, fill=fade(SOFT, a * 0.45))
    d.rounded_rectangle([cx - w/2, cy - h/2, cx + w/2, cy + h/2], radius=10, fill=fade((255, 238, 186) if active else CARD, a), outline=fade(col if not active else ORANGE, a), width=5 if active else 3)
    cw = (w - 20) / len(keys)
    for i, k in enumerate(keys):
        x = cx - w/2 + 10 + cw * (i + 0.5)
        text(d, (x, cy), k, P("Bold", 28), fade(INK, a), "mm")
        if i: d.line([cx - w/2 + 10 + cw * i, cy - 22, cx - w/2 + 10 + cw * i, cy + 22], fill=fade(GRID2, a), width=2)

def s_btree(img, d, t):   # 34 - 49
    header(d, t, "B+Tree: sorted, level by level", 34.0)
    a0 = eo((t - 34.4) / 0.5); a1 = eo((t - 35.2) / 0.5); a2 = eo((t - 36.0) / 0.5)
    # edges
    for (mx, my, _) in MID: d.line([ROOT[0], ROOT[1] + 32, mx, my - 32], fill=fade(SOFT, a1), width=3)
    kids = [[0, 1], [2, 3], [4, 5]]
    for i, (mx, my, _) in enumerate(MID):
        for j in kids[i]: d.line([mx, my + 32, LEAF[j][0], LEAF[j][1] - 32], fill=fade(SOFT, a2), width=3)
    # leaf linked list
    for j in range(len(LEAF) - 1):
        arrow(d, LEAF[j][0] + 60, LEAF[j][1] + 44, LEAF[j + 1][0] - 60, LEAF[j + 1][1] + 44, SOFT, a2, 1, 2)
    text(d, (540, 715), "leaves are sorted + linked", P("Medium", 21), fade(GREY, a2), "mm")
    # search path for 47: root (30|60) -> mid[1] (40|50) -> leaf[3] (42|47)
    act_root = 39.0 <= t < 42.8; act_mid = 42.8 <= t < 44.8; act_leaf = t >= 44.8
    node(d, *ROOT[:2], ROOT[2], a0, active=act_root)
    for i, (mx, my, ks) in enumerate(MID): node(d, mx, my, ks, a1, active=(act_mid and i == 1))
    for j, (lx, ly, ks) in enumerate(LEAF): node(d, lx, ly, ks, a2, active=(act_leaf and j == 3), w=150)
    if t > 38.6:
        chip(d, 150, 290, "find 47", ORANGE, eo((t - 38.6) / 0.3), P("Bold", 26))
    if 41.0 < t < 42.8:
        chip(d, 850, 290, "30 < 47 < 60", TEAL, eo((t - 41.0) / 0.3), M(22))
    if 42.8 <= t < 44.8:
        k = (t - 42.8) / 0.9
        x, y = along(k, ROOT[0], ROOT[1] + 32, MID[1][0], MID[1][1] - 32); dot(d, x, y, ORANGE, 1, 11)
        chip(d, 850, 370, "follow pointer", TEAL, 1, P("Bold", 22))
    if 44.8 <= t:
        k = (t - 44.8) / 0.9
        if k < 1:
            x, y = along(k, MID[1][0], MID[1][1] + 32, LEAF[3][0], LEAF[3][1] - 32); dot(d, x, y, ORANGE, 1, 11)
        else:
            check(d, LEAF[3][0] + 90, LEAF[3][1] - 40, eo(k - 1), 20)
    if t > 46.4:
        chip(d, 850, 370, "3 levels, found 47", GREEN, eo((t - 46.4) / 0.3), P("Bold", 22))

def s_fast(img, d, t):    # 49 - 60
    header(d, t, "Why is it fast?", 49.0)
    # left: rows checked comparison
    a = eo((t - 50.4) / 0.5)
    d.rounded_rectangle([50, 250, 520, 470], radius=18, fill=fade(CARD, a), outline=fade(INK, a), width=3)
    text(d, (80, 290), "Full scan", P("Bold", 26), fade(RED, a), "lm")
    text(d, (490, 290), "10,000,000 rows", M(22), fade(INK, a), "rm")
    d.rounded_rectangle([80, 315, 490, 340], radius=12, fill=fade(RED, a))
    text(d, (80, 395), "B+Tree index", P("Bold", 26), fade(GREEN, a), "lm")
    text(d, (490, 395), "3 to 4 pages", M(22), fade(INK, a), "rm")
    d.rounded_rectangle([80, 420, 80 + 410 * 0.03 + 12, 445], radius=12, fill=fade(GREEN, a))
    # right: fat node with many keys (fan-out)
    a2 = eo((t - 52.4) / 0.5)
    d.rounded_rectangle([560, 250, 1030, 470], radius=18, fill=fade(CARD, a2), outline=fade(TEAL, a2), width=3)
    text(d, (795, 285), "1 node = many keys", P("Bold", 26), fade(TEAL, a2), "mm")
    for i in range(12):
        kx = 590 + (i % 6) * 72; ky = 330 + (i // 6) * 60
        on = t > 52.6 + i * 0.08
        d.rounded_rectangle([kx, ky, kx + 62, ky + 46], radius=8, fill=fade((214, 238, 234) if on else CARD, a2), outline=fade(TEAL, a2 if on else a2 * 0.3), width=2)
        if on: text(d, (kx + 31, ky + 23), str(10 + i * 7), P("Bold", 20), fade(INK, a2), "mm")
    # bottom: shallow tree + page = disk block
    a3 = eo((t - 54.4) / 0.5)
    text(d, (60, 525), "shallow tree", P("Bold", 28), fade(INK, a3), "lm")
    for lvl in range(3):
        n = [1, 3, 9][lvl]; y = 560 + lvl * 52; wdt = [110, 90, 40][lvl]
        span = n * (wdt + 10); x0 = 285 - span / 2
        for i in range(n):
            if t > 54.6 + lvl * 0.3:
                d.rounded_rectangle([x0 + i * (wdt + 10), y, x0 + i * (wdt + 10) + wdt, y + 34], radius=6, fill=fade(CARD, a3), outline=fade(TEAL, a3), width=2)
    a4 = eo((t - 57.8) / 0.5)
    d.rounded_rectangle([600, 520, 1030, 720], radius=18, fill=fade(CARD, a4), outline=fade(ORANGE, a4), width=3)
    text(d, (815, 555), "page = fixed-size disk block", P("Bold", 24), fade(ORANGE, a4), "mm")
    for i in range(4):
        x = 640 + i * 95
        d.rectangle([x, 590, x + 80, 690], fill=fade((255, 238, 210), a4), outline=fade(ORANGE, a4), width=3)
        text(d, (x + 40, 640), "8 KB", P("Bold", 20), fade(INK, a4), "mm")

def s_email(img, d, t):   # 60 - 78
    header(d, t, "Example: index on email", 60.0)
    a = eo((t - 62.0) / 0.5)
    d.rounded_rectangle([50, 245, 1030, 300], radius=12, fill=fade((34, 44, 58), a))
    text(d, (72, 272), "CREATE INDEX idx_email ON users(email);", M(24), fade((255, 214, 120), a), "lm")
    a2 = eo((t - 66.0) / 0.5)
    d.rounded_rectangle([50, 312, 1030, 367], radius=12, fill=fade((34, 44, 58), a2))
    text(d, (72, 339), "SELECT * FROM users WHERE email = 'saurav10@...';", M(22), fade((150, 225, 210), a2), "lm")
    # hops
    steps = [(190, "Index", "find email", TEAL, 68.4), (540, "Primary key", "id = 4821", ORANGE, 70.0), (890, "Table row", "fetch data", GREEN, 72.0)]
    for i, (x, lab, sub, col, ts) in enumerate(steps):
        k = eo((t - ts) / 0.4)
        box(d, x, 500, 250, 110, lab, sub, col, k, bold=(ts <= t < ts + 2.2), sf=M(20))
        if i and t > ts - 0.4:
            px = steps[i - 1][0]
            arrow(d, px + 130, 500, x - 130, 500, col, 1, eo((t - ts + 0.4) / 0.4), 5)
        if t > ts + 0.3: chip(d, x, 600, f"hop {i+1}", col, eo((t - ts - 0.3) / 0.3), P("Bold", 20))
    if t > 74.2:
        k = eo((t - 74.2) / 0.4)
        d.rounded_rectangle([130, 650, 950, 720], radius=16, fill=fade(CARD, k), outline=fade(GREEN, k), width=3)
        text(d, (540, 685), "3 hops  vs  scanning 10M rows", P("Bold", 32), fade(GREEN, k), "mm")

def s_where(img, d, t):   # 78 - 107
    header(d, t, "Where should you add indexes?", 78.0)
    if t < 85.9:
        a = eo((t - 81.3) / 0.5)
        d.rounded_rectangle([50, 260, 1030, 320], radius=12, fill=fade((34, 44, 58), a))
        text(d, (72, 290), "WHERE status = ? AND city = ? AND age > ?", M(24), fade((255, 214, 120), a), "lm")
        for i, (w, x) in enumerate([("status", 250), ("city", 520), ("age", 780)]):
            k = eo((t - 83.2 - i * 0.3) / 0.3)
            chip(d, x, 400, f"index on {w}?", ORANGE, k, P("Bold", 22))
        if t > 84.6: stamp(img, "NOT EVERY COLUMN", 540, 560, RED, eo((t - 84.6) / 0.25), 50, -4)
        return
    # table + multiple indexes: storage then write amplification
    a = eo((t - 86.0) / 0.4)
    box(d, 180, 470, 230, 120, "users", "table", INK, a, lf=P("Bold", 32))
    idxs = [("idx_email", 88.0), ("idx_city", 88.6), ("idx_status", 89.2), ("idx_age", 89.8)]
    for i, (n, ts) in enumerate(idxs):
        k = eo((t - ts) / 0.35); y = 290 + i * 100
        box(d, 560, y, 240, 72, n, None, TEAL, k, lf=M(22))
        arrow(d, 300, 470, 438, y, SOFT, k, k, 3, dash=True)
    # storage bar
    if t > 88.7:
        k = clamp((t - 88.7) / 2.4)
        text(d, (860, 280), "storage", P("Bold", 26), ORANGE, "mm")
        d.rounded_rectangle([800, 310, 920, 560], radius=12, fill=CARD, outline=INK, width=3)
        hh = 240 * (0.25 + 0.75 * k)
        d.rounded_rectangle([804, 556 - hh, 916, 556], radius=10, fill=ORANGE)
        text(d, (860, 590), f"{int(1 + 4 * k)}x", P("Bold", 30), INK, "mm")
    # writes fan out
    if t > 91.0:
        ops = ["INSERT", "UPDATE", "DELETE"]
        op = ops[int((t - 91.0) / 1.2) % 3]
        chip(d, 180, 330, op, RED, 1, M(22))
        ph = ((t - 91.0) * 0.9) % 1
        for i in range(4):
            y = 290 + i * 100
            x, yy = along(ph, 300, 470, 438, y); dot(d, x, yy, RED, 1, 9)
        if t > 94.8: text(d, (180, 560), "1 write = 5 writes", P("Bold", 26), RED, "mm")
    if t > 97.8: chip(d, 860, 660, "1. storage", ORANGE, eo((t - 97.8) / 0.3), P("Bold", 24))
    if t > 99.3: chip(d, 860, 715, "2. syncing", RED, eo((t - 99.3) / 0.3), P("Bold", 24))
    if t > 103.8: stamp(img, "SLOW QUERIES AGAIN", 470, 690, RED, eo((t - 103.8) / 0.25), 44, -3)

def s_outro(img, d, t):   # 107 - end
    header(d, t, "Your turn", 107.0)
    a = eo((t - 108.8) / 0.5)
    table(d, 90, 280, 540, [("4821", "saurav", "saurav10@mail.com"), ("1037", "diya", "diya1@mail.com"), ("2210", "neha", "neha9@mail.com")], t, a, row_h=50)
    if t > 110.7:
        k = eo((t - 110.7) / 0.5)
        for i, x in enumerate([90 + 540 * 0.18, 90 + 540 * 0.48]):
            d.rounded_rectangle([x + 4, 284, x + 540 * (0.30 if i == 0 else 0.52) - 4, 476], radius=8, outline=fade(ORANGE, k), width=5)
        text(d, (360, 510), "index on multiple columns", P("Bold", 26), fade(ORANGE, k), "mm")
    if t > 113.0:
        k = eb((t - 113.0) / 0.5)
        f = SERIF(int(150 * clamp(k, 0.2, 1.1)))
        text(d, (860, 380), "?", f, ORANGE, "mm")
        text(d, (860, 520), "What is it called?", P("Bold", 28), INK, "mm")
        text(d, (860, 560), "How do you build it?", P("Bold", 28), INK, "mm")
    if t > 114.6:
        chip(d, 540, 670, "Answer in the comments", TEAL, eo((t - 114.6) / 0.3), P("Bold", 30))

SCENES = [(0, 4, s_hook), (4, 8, s_title), (8, 13, s_problem), (13, 26, s_scan), (26, 34, s_index),
          (34, 49, s_btree), (49, 60, s_fast), (60, 78, s_email), (78, 107, s_where), (107, 200, s_outro)]

def frame(t):
    img = background(t)
    d = ImageDraw.Draw(img)
    for x, y, r, ph in DOTS:
        a = 0.2 + 0.2 * math.sin(t * 1.3 + ph)
        d.ellipse([x - r, y - r, x + r, y + r], fill=(150, 140, 120, int(255 * a)))
    for i, (a, b, fn) in enumerate(SCENES):
        if a <= t < b:
            layer = Image.new("RGBA", (W, H), (0, 0, 0, 0)); ld = ImageDraw.Draw(layer)
            fn(layer, ld, t)
            k = min(clamp((t - a) / 0.3) if i > 0 else 1, clamp((b - t) / 0.25))
            if k < 1:
                arr = np.array(layer); arr[..., 3] = (arr[..., 3] * k).astype(np.uint8); layer = Image.fromarray(arr)
            img.alpha_composite(layer)
    arr = np.array(img)
    xs = np.arange(W)
    wave = (EDGE + 10 * np.sin(2 * math.pi * xs / 150 + t * 2.2)).astype(int)
    arr[..., 3] = np.where(np.arange(H)[:, None] <= wave[None, :], 255, 0).astype(np.uint8)
    out = Image.fromarray(arr); od = ImageDraw.Draw(out)
    od.line([(x, float(wave[x])) for x in range(0, W, 6)] + [(W - 1, float(wave[-1]))], fill=INK + (255,), width=8)
    return out

if __name__ == "__main__":
    if sys.argv[1:] and sys.argv[1] == "preview":
        for t in [float(x) for x in sys.argv[2:]]: frame(t).save(f"pv_{t:.1f}.png")
        sys.exit()
    o = sys.stdout.buffer
    for n in range(NFR): o.write(frame(n / FPS).tobytes())
