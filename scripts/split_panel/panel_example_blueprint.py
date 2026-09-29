import sys, os, math, numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

FPS = 30
DUR = 107.1
NFR = int(DUR * FPS)
W, H = 1080, 960
SERIES_LABEL = "BUILDING BACKEND SYSTEMS"

BOUND = [820]*5 + [890] + [880]*102
def edge(t):
    i = int(t); v = [BOUND[min(max(j, 0), len(BOUND) - 1)] for j in (i - 1, i, i + 1)]
    return max(v) + 14

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
def M(s):
    k = ("M", s)
    if k not in _fc: _fc[k] = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf", s)
    return _fc[k]

# Blueprint theme (dark blue, no purple)
BASE = (14, 58, 92); GRID = (29, 78, 117); GRID2 = (42, 97, 144)
INK = (234, 242, 250); SOFT = (150, 180, 206); DIM = (98, 132, 162)
AMBER = (255, 183, 3); CYAN = (76, 201, 240); CORAL = (255, 107, 107); LIME = (149, 213, 178)
PGBLUE = (51, 103, 145); CARD = (19, 70, 108); CARD2 = (11, 45, 72)

def clamp(x, a=0.0, b=1.0): return max(a, min(b, x))
def eo(x): x = clamp(x); return 1 - (1 - x) ** 3
def eio(x): x = clamp(x); return 3*x*x - 2*x*x*x
def eb(x):
    x = clamp(x); c1 = 1.70158; c3 = c1 + 1
    return 1 + c3 * (x - 1) ** 3 + c1 * (x - 1) ** 2
def lerp(a, b, k): return a + (b - a) * k
def fade(c, a): return tuple(c[:3]) + (int(255 * clamp(a)),)
def along(p, x0, y0, x1, y1): p = eio(p); return lerp(x0, x1, p), lerp(y0, y1, p)

# ---------- blueprint background ----------
rng = np.random.default_rng(9)
TW, TH = W + 72, H + 72
def make_bg():
    yy, xx = np.mgrid[0:TH, 0:TW]
    img = np.zeros((TH, TW, 3), np.float32) + np.array(BASE, np.float32)
    img[(xx % 36 < 1.3) | (yy % 36 < 1.3)] = GRID
    img[(xx % 180 < 2) | (yy % 180 < 2)] = GRID2
    img += rng.normal(0, 2.4, (TH, TW, 1))
    d = np.sqrt(((xx - TW / 2) / TW) ** 2 + ((yy - TH * 0.4) / TH) ** 2)
    img *= np.clip(1.12 - d * 0.55, 0.7, 1.08)[..., None]
    return np.clip(img, 0, 255).astype(np.uint8)
BGTEX = make_bg()
SPECKS = [(rng.uniform(0, W), rng.uniform(0, H), rng.uniform(1, 2.4), rng.uniform(0, 6.28)) for _ in range(55)]
def background(t):
    ox = int(t * 6) % 36; oy = int(t * 4) % 36
    return Image.fromarray(BGTEX[oy:oy + H, ox:ox + W]).convert("RGBA")

# ---------- PostgreSQL icon (official logo file if provided, else a plain PG badge) ----------
LOGO = None
if os.path.exists("pg_logo.png"):
    LOGO = Image.open("pg_logo.png").convert("RGBA")
    bb = LOGO.getbbox(); LOGO = LOGO.crop(bb) if bb else LOGO
_icache = {}
def pg_icon(img, cx, cy, size, a=1.0):
    if a <= 0: return
    key = (size, round(a, 2))
    if key not in _icache:
        if LOGO is not None:
            s = size / max(LOGO.size); ic = LOGO.resize((max(1, int(LOGO.width * s)), max(1, int(LOGO.height * s))), Image.LANCZOS)
        else:
            ic = Image.new("RGBA", (size, size), (0, 0, 0, 0)); dd = ImageDraw.Draw(ic)
            dd.rounded_rectangle([0, 0, size - 1, size - 1], radius=size // 5, fill=PGBLUE + (255,), outline=(255, 255, 255, 255), width=max(2, size // 28))
            dd.text((size / 2, size / 2 + 1), "PG", font=P("Bold", int(size * 0.42)), fill=(255, 255, 255), anchor="mm")
        if a < 1:
            arr = np.array(ic); arr[..., 3] = (arr[..., 3] * a).astype(np.uint8); ic = Image.fromarray(arr)
        _icache[key] = ic
    ic = _icache[key]
    img.alpha_composite(ic, (int(cx - ic.width / 2), int(cy - ic.height / 2)))

# ---------- helpers ----------
def text(d, xy, s, f, fill, anchor="la"): d.text(xy, s, font=f, fill=fill, anchor=anchor)
def box(d, cx, cy, w, h, label, sub=None, col=INK, a=1.0, fill=CARD, bold=False, lf=None, sf=None):
    if a <= 0: return
    x0, y0 = cx - w/2, cy - h/2
    d.rounded_rectangle([x0 + 4, y0 + 6, x0 + w + 4, y0 + h + 6], radius=16, fill=fade((5, 25, 42), a * 0.6))
    d.rounded_rectangle([x0, y0, x0 + w, y0 + h], radius=16, fill=fade(fill, a), outline=fade(col, a), width=5 if bold else 3)
    lf = lf or P("Bold", 28)
    if sub:
        text(d, (cx, cy - 13), label, lf, fade(INK, a), "mm")
        text(d, (cx, cy + 20), sub, sf or P("Medium", 20), fade(SOFT, a), "mm")
    else:
        text(d, (cx, cy), label, lf, fade(INK, a), "mm")
def arrow(d, x0, y0, x1, y1, col=SOFT, a=1.0, prog=1.0, width=4, dash=False):
    if a <= 0 or prog <= 0: return
    xe, ye = lerp(x0, x1, prog), lerp(y0, y1, prog)
    if dash:
        n = max(1, int(math.hypot(xe - x0, ye - y0) / 16))
        for i in range(0, n, 2):
            d.line([lerp(x0, xe, i/n), lerp(y0, ye, i/n), lerp(x0, xe, (i+1)/n), lerp(y0, ye, (i+1)/n)], fill=fade(col, a), width=width)
    else: d.line([x0, y0, xe, ye], fill=fade(col, a), width=width)
    if prog > 0.95:
        ang = math.atan2(y1 - y0, x1 - x0); L = 16
        d.polygon([(x1, y1), (x1 - L*math.cos(ang - 0.45), y1 - L*math.sin(ang - 0.45)), (x1 - L*math.cos(ang + 0.45), y1 - L*math.sin(ang + 0.45))], fill=fade(col, a))
def chip(d, cx, cy, s, col, a=1.0, f=None, tc=(10, 30, 48)):
    if a <= 0: return
    f = f or P("Bold", 22); w = d.textlength(s, font=f) + 32
    d.rounded_rectangle([cx - w/2, cy - 21, cx + w/2, cy + 21], radius=21, fill=fade(col, a))
    text(d, (cx, cy + 1), s, f, fade(tc, a), "mm")
def dot(d, x, y, col, a=1.0, r=10): d.ellipse([x - r, y - r, x + r, y + r], fill=fade(col, a))
def check(d, cx, cy, a=1.0, r=18):
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=fade(LIME, a))
    d.line([cx - 8, cy, cx - 2, cy + 7, cx + 9, cy - 7], fill=fade(CARD2, a), width=4)
def cross(d, cx, cy, a=1.0, r=18):
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=fade(CORAL, a))
    d.line([cx - 7, cy - 7, cx + 7, cy + 7], fill=fade(CARD2, a), width=4); d.line([cx - 7, cy + 7, cx + 7, cy - 7], fill=fade(CARD2, a), width=4)
def header(d, t, title, t0, sub=None):
    d.rectangle([48, 100, 56, 136], fill=CORAL)
    text(d, (70, 118), SERIES_LABEL, P("Medium", 28), INK, "lm")
    k = eo((t - t0) / 0.5); f = SERIF(58)
    while d.textlength(title, font=f) > W - 110: f = SERIF(f.size - 2)
    text(d, (50 + (1 - k) * 60, 150), title, f, fade(INK, k))
    if sub: text(d, (52 + (1 - k) * 60, 150 + f.size + 14), sub, P("Medium", 26), fade(AMBER, k))
def stamp(img, s, cx, cy, col, k, size=58, rot=-5):
    layer = Image.new("RGBA", img.size, (0, 0, 0, 0)); ld = ImageDraw.Draw(layer)
    f = P("Bold", size); tw = ld.textlength(s, font=f)
    ld.rounded_rectangle([cx - tw/2 - 30, cy - size*0.8, cx + tw/2 + 30, cy + size*0.8], radius=14, outline=fade(col, k), width=8, fill=fade(CARD2, 0.9 * k))
    ld.text((cx, cy + 2), s, font=f, fill=fade(col, k), anchor="mm")
    img.alpha_composite(layer.rotate(rot, center=(cx, cy), resample=Image.BICUBIC))
def pg_box(img, d, cx, cy, w, h, a=1.0, sub="database", bold=False):
    if a <= 0: return
    x0, y0 = cx - w/2, cy - h/2
    d.rounded_rectangle([x0 + 4, y0 + 6, x0 + w + 4, y0 + h + 6], radius=16, fill=fade((5, 25, 42), a * 0.6))
    d.rounded_rectangle([x0, y0, x0 + w, y0 + h], radius=16, fill=fade(CARD, a), outline=fade(CYAN, a), width=5 if bold else 3)
    isz = int(min(56, h * 0.5)); pg_icon(img, x0 + 16 + isz / 2, cy, isz, a)
    tx = (x0 + 28 + isz + x0 + w - 8) / 2; avail = w - isz - 44
    f = P("Bold", 26)
    while d.textlength("PostgreSQL", font=f) > avail and f.size > 14: f = P("Bold", f.size - 1)
    text(d, (tx, cy - 13), "PostgreSQL", f, fade(INK, a), "mm")
    sf = P("Medium", 20)
    while d.textlength(sub, font=sf) > avail and sf.size > 12: sf = P("Medium", sf.size - 1)
    text(d, (tx, cy + 20), sub, sf, fade(SOFT, a), "mm")

# ---------- scenes ----------
def s_hook(img, d, t):       # 0 - 4.2
    d.rectangle([48, 100, 56, 136], fill=CORAL)
    text(d, (70, 118), SERIES_LABEL, P("Medium", 28), INK, "lm")
    k = eb((t - 0.1) / 0.6)
    pg_icon(img, 540, 330, int(190 * clamp(k, 0.1, 1.08)), clamp(k))
    # line 1: "How Connection Pooling" (mixed colour), line 2: "works in PostgreSQL" (no orphan words)
    f1 = SERIF(76); f2 = SERIF(64)
    w_how = d.textlength("How ", font=f1); w_cp = d.textlength("Connection Pooling", font=f1)
    x1 = 540 - (w_how + w_cp) / 2
    k1 = eo((t - 0.6) / 0.5); k2 = eo((t - 1.0) / 0.5)
    off = (1 - k1) * 70
    text(d, (x1 + off, 560), "How ", f1, fade(INK, k1), "lm")
    text(d, (x1 + w_how + off, 560), "Connection Pooling", f1, fade(AMBER, k1), "lm")
    text(d, (540 + (1 - k2) * 70, 665), "works in PostgreSQL", f2, fade(INK, k2), "mm")
    if t > 2.6: chip(d, 540, 780, "Problem statement  ->", CORAL, eo((t - 2.6) / 0.4), P("Bold", 26))

def s_flood(img, d, t):      # 4.2 - 10
    header(d, t, "1000 requests at once", 4.2)
    box(d, 200, 520, 220, 120, "App", "backend server", AMBER, eo((t - 4.6) / 0.4), lf=P("Bold", 34))
    pg_box(img, d, 820, 520, 300, 120, eo((t - 5.0) / 0.4))
    n = int(1000 * eo((t - 5.2) / 2.8))
    text(d, (200, 380), f"{n:,} requests", P("Bold", 40), AMBER, "mm")
    for i in range(14):
        ph = (t * 1.1 + i / 14) % 1
        if t > 5.3: dot(d, lerp(20, 88, ph), 470 + (i % 7) * 16, AMBER, 0.9, 6)
    if t > 7.6:
        a = eo((t - 7.6) / 0.4)
        for j, (lab, col) in enumerate([("READ", CYAN), ("WRITE", LIME)]):
            y = 490 + j * 60
            arrow(d, 312, y, 668, y, col, a, a, 4)
            ph = (t * 0.9 + j * 0.5) % 1
            x, _ = along(ph, 312, y, 660, y); dot(d, x, y, col, a, 9)
            chip(d, 490, y - 26, lab, col, a, P("Bold", 18))
        text(d, (540, 690), "every request needs the database", P("Medium", 26), fade(SOFT, a), "mm")

def s_connect(img, d, t):    # 10 - 21
    header(d, t, "Every query needs a connection", 10.0)
    box(d, 190, 470, 230, 110, "Backend", "server", AMBER, eo((t - 10.3) / 0.4), lf=P("Bold", 30))
    pg_box(img, d, 820, 470, 300, 110, eo((t - 10.6) / 0.4))
    steps = [("1. connect (TCP)", 15.6), ("2. authenticate", 16.8), ("3. session ready", 18.0)]
    for i, (s, ts) in enumerate(steps):
        k = eo((t - ts) / 0.4); y = 610 + i * 56
        if k > 0:
            d.rounded_rectangle([330, y - 22, 750, y + 22], radius=12, fill=fade(CARD2, k), outline=fade(CYAN if t < ts + 1.2 else LIME, k), width=2)
            text(d, (350, y), s, M(22), fade(INK, k), "lm")
            if t > ts + 1.0: check(d, 725, y, eo((t - ts - 1.0) / 0.3), 13)
    if 12.0 < t:
        k = eo((t - 12.0) / 0.6)
        arrow(d, 308, 450, 662, 450, AMBER, k, k, 4)
        if 13.0 < t < 15.5:
            x, _ = along((t - 13.0) / 1.2 % 1, 308, 450, 650, 450); chip(d, x, 410, "SELECT ...", AMBER, 1, M(18))
    if t > 19.0:
        k = eb((t - 19.0) / 0.5)
        chip(d, 820, 360, "1 connection = 1 backend process", CORAL, clamp(k), P("Bold", 22))

def s_procs(img, d, t):      # 21 - 30
    header(d, t, "More connections = more processes", 21.0)
    pg_icon(img, 150, 330, 90, eo((t - 21.2) / 0.4))
    text(d, (220, 330), "Postgres server", P("Bold", 30), fade(INK, eo((t - 21.2) / 0.4)), "lm")
    n = int(clamp((t - 21.8) / 5.0) * 24)
    for i in range(n):
        cx = 110 + (i % 8) * 110; cy = 440 + (i // 8) * 92
        k = eb((t - 21.8 - i * 5.0 / 24) / 0.3)
        w = 90 * clamp(k, 0, 1.1)
        d.rounded_rectangle([cx - w/2, cy - 32, cx + w/2, cy + 32], radius=10, fill=fade(CARD, clamp(k)), outline=fade(CYAN, clamp(k)), width=2)
        if k > 0.6: text(d, (cx, cy), f"pid {4100 + i}", M(16), fade(INK, clamp(k)), "mm")
    mem = clamp((t - 22.0) / 6.0)
    text(d, (60, 740), "memory", P("Bold", 24), SOFT, "lm")
    d.rounded_rectangle([180, 725, 1020, 755], radius=15, fill=CARD2, outline=SOFT, width=2)
    col = LIME if mem < 0.5 else (AMBER if mem < 0.8 else CORAL)
    if mem > 0.03: d.rounded_rectangle([183, 728, 183 + 834 * mem, 752], radius=12, fill=col)
    if t > 27.2: chip(d, 780, 330, "concurrent requests", AMBER, eo((t - 27.2) / 0.3), P("Bold", 22))

def s_limit(img, d, t):      # 30 - 42
    header(d, t, "New connection per request?", 30.0)
    n = int(clamp((t - 30.8) / 6.5) * 100)
    cols = 20
    for i in range(n):
        x = 70 + (i % cols) * 47; y = 330 + (i // cols) * 44
        d.rounded_rectangle([x, y, x + 36, y + 32], radius=7, fill=CYAN if n < 80 else (AMBER if n < 100 else CORAL))
    text(d, (540, 575), f"{n} / 100 connections", P("Bold", 40), INK, "mm")
    if t > 37.0:
        k = eo((t - 37.0) / 0.4)
        d.rounded_rectangle([200, 620, 880, 670], radius=12, fill=fade(CARD2, k))
        text(d, (540, 645), "max_connections = 100  (default)", M(24), fade(AMBER, k), "mm")
    if t > 39.6:
        k = eo((t - 39.6) / 0.25)
        shake = int(8 * math.sin(t * 70) * max(0, 1 - (t - 39.6) / 0.6))
        stamp(img, "LIMIT HIT", 540 + shake, 450, CORAL, k, 70, -6)
        text(d, (540, 730), "FATAL: sorry, too many clients already", M(22), fade(CORAL, k), "mm")

def s_single(img, d, t):     # 42 - 55
    header(d, t, "Just use one connection?", 42.0)
    box(d, 170, 480, 220, 110, "App", "many requests", AMBER, 1, lf=P("Bold", 30))
    pg_box(img, d, 830, 480, 290, 110, 1)
    arrow(d, 282, 480, 670, 480, CYAN, 1, eo((t - 42.4) / 0.5), 6)
    text(d, (476, 450), "1 connection", P("Bold", 22), CYAN, "mm")
    # queue of waiting requests
    for i in range(9):
        x = 70 + (i % 3) * 44; y = 580 + (i // 3) * 40
        dot(d, x + 20, y, AMBER, 0.9, 12)
    if t > 45.0:
        ph = (t * 0.35) % 1
        x, _ = along(ph, 282, 480, 660, 480); dot(d, x, 480, AMBER, 1, 11)
        text(d, (170, 720), "waiting...", P("Bold", 24), CORAL, "mm")
    if t > 46.5: stamp(img, "BOTTLENECK", 560, 640, CORAL, eo((t - 46.5) / 0.25), 50, -4)
    if t > 50.0: chip(d, 540, 380, "concurrent work needs multiple connections", LIME, eo((t - 50.0) / 0.3), P("Bold", 22))

def s_idea(img, d, t):       # 55 - 65
    header(d, t, "The fix: Connection Pooling", 55.0)
    a1 = eo((t - 55.5) / 0.4)
    d.rounded_rectangle([60, 300, 510, 620], radius=20, fill=fade(CARD2, a1), outline=fade(CORAL, a1), width=3)
    text(d, (285, 340), "Without pool", P("Bold", 30), fade(CORAL, a1), "mm")
    for i, s in enumerate(["create", "use", "destroy", "repeat x 1000"]):
        text(d, (285, 400 + i * 52), s, M(26), fade(INK, a1), "mm")
    a2 = eo((t - 60.2) / 0.4)
    d.rounded_rectangle([570, 300, 1020, 620], radius=20, fill=fade(CARD2, a2), outline=fade(LIME, a2), width=3)
    text(d, (795, 340), "With pool", P("Bold", 30), fade(LIME, a2), "mm")
    for i, s in enumerate(["create once", "use", "return to pool", "reuse"]):
        text(d, (795, 400 + i * 52), s, M(26), fade(INK, a2), "mm")
    if t > 61.2: cross(d, 470, 505, eo((t - 61.2) / 0.3), 18)
    if t > 63.0:
        k = eo((t - 63.0) / 0.4)
        text(d, (540, 700), "Don't create. Reuse.", SERIF(56), fade(AMBER, k), "mm")

POOLX = [430, 510, 590, 670, 750]
def pool_diagram(img, d, t, t0, a=1.0):
    box(d, 130, 480, 190, 100, "Request", None, AMBER, a, lf=P("Bold", 26))
    d.rounded_rectangle([370, 400, 810, 560], radius=22, fill=fade(CARD2, a), outline=fade(LIME, a), width=4)
    text(d, (590, 380), "CONNECTION POOL", P("Bold", 22), fade(LIME, a), "mm")
    pg_box(img, d, 950, 480, 210, 110, a, sub="db")
def s_pool(img, d, t):       # 65 - 84
    header(d, t, "How the pool works", 65.0)
    a = eo((t - 65.3) / 0.4)
    pool_diagram(img, d, t, 65, a)
    # connection slot 0 is taken and returned in cycles
    cyc = [(66.5, "take"), (72.5, "return"), (75.5, "reuse")]
    busy = (66.8 <= t < 72.8) or (75.8 <= t < 79.5)
    for i, x in enumerate(POOLX):
        on = (i == 0 and busy)
        d.rounded_rectangle([x - 32, 450, x + 32, 510], radius=10, fill=fade(AMBER if on else LIME, a))
        text(d, (x, 480), f"c{i+1}", P("Bold", 20), fade(CARD2, a), "mm")
    if 66.5 < t < 67.3:
        x, _ = along((t - 66.5) / 0.8, 225, 480, 398, 480); dot(d, x, 480, AMBER, 1, 11)
    if 67.3 < t < 72.5:
        arrow(d, 462, 480, 842, 480, AMBER, 1, eo((t - 67.3) / 0.5), 4, dash=True)
        chip(d, 650, 600, "query runs on c1", AMBER, eo((t - 67.5) / 0.3), P("Bold", 22))
    if 72.5 < t < 75.5:
        chip(d, 590, 620, "done: c1 goes back to the pool", LIME, eo((t - 72.5) / 0.3), P("Bold", 22))
        text(d, (590, 680), "not destroyed", P("Bold", 26), CORAL, "mm")
    if 75.5 < t < 80.0:
        chip(d, 130, 380, "next request", AMBER, 1, P("Bold", 20))
        chip(d, 590, 620, "reuses c1 instantly", LIME, eo((t - 75.8) / 0.3), P("Bold", 22))
    if t > 80.0:
        k = eo((t - 80.0) / 0.4)
        d.rounded_rectangle([230, 600, 950, 700], radius=16, fill=fade(CARD, k), outline=fade(CORAL, k), width=3)
        text(d, (590, 632), "before: create + destroy every time", P("Bold", 26), fade(CORAL, k), "mm")
        text(d, (590, 672), "now: a few connections, reused", P("Bold", 26), fade(LIME, k), "mm")

def s_scale(img, d, t):      # 84 - 98
    header(d, t, "1000 requests, only 20 connections", 84.0)
    a = eo((t - 84.3) / 0.4)
    text(d, (160, 300), "1000 requests", P("Bold", 30), fade(AMBER, a), "mm")
    for i in range(40):
        x = 60 + (i % 5) * 42; y = 340 + (i // 5) * 42
        dot(d, x + 16, y + 16, AMBER, a * 0.9, 12)
    d.rounded_rectangle([330, 320, 690, 700], radius=20, fill=fade(CARD2, a), outline=fade(LIME, a), width=4)
    text(d, (510, 350), "POOL: 20", P("Bold", 26), fade(LIME, a), "mm")
    for i in range(20):
        x = 370 + (i % 4) * 75; y = 390 + (i // 4) * 58
        busy = (i + int(t * 3)) % 3 != 0
        d.rounded_rectangle([x, y, x + 56, y + 42], radius=8, fill=fade(AMBER if busy else LIME, a))
    pg_box(img, d, 900, 500, 260, 120, a, sub="20 connections")
    for j in range(5):
        ph = (t * 0.8 + j / 5) % 1
        x, y = along(ph, 690, 420 + j * 60, 770, 500); dot(d, x, y, CYAN, a, 7)
    if t > 88.2: chip(d, 900, 360, "not 1000 connections", CORAL, eo((t - 88.2) / 0.3), P("Bold", 22))
    if t > 95.0:
        k = eo((t - 95.0) / 0.3)
        chip(d, 160, 720, "others wait their turn", AMBER, k, P("Bold", 20))

def s_bouncer(img, d, t):    # 98 - end
    header(d, t, "In production: PgBouncer", 98.0)
    a = eo((t - 98.3) / 0.4)
    for i in range(10):
        y = 320 + i * 42; x = 110
        box(d, x, y, 150, 34, f"client {i+1}", None, AMBER, a * 0.95, lf=P("Medium", 18))
        arrow(d, x + 78, y, 440, 490, SOFT, a * 0.7, 1, 2)
    box(d, 540, 490, 200, 130, "PgBouncer", "pooler", LIME, eo((t - 99.2) / 0.4), bold=True, lf=P("Bold", 30))
    for j in range(3):
        y = 430 + j * 60
        arrow(d, 642, 490, 770, y, CYAN, eo((t - 100.0) / 0.4), 1, 4)
    pg_box(img, d, 900, 490, 240, 150, eo((t - 100.4) / 0.4), sub="few connections")
    if t > 101.5: chip(d, 540, 680, "many clients -> few Postgres connections", AMBER, eo((t - 101.5) / 0.3), P("Bold", 22))
    if t > 104.5:
        k = eo((t - 104.5) / 0.4)
        text(d, (540, 760), "Reuse, don't recreate.", SERIF(48), fade(INK, k), "mm")

SCENES = [(0, 4.2, s_hook), (4.2, 10, s_flood), (10, 21, s_connect), (21, 30, s_procs), (30, 42, s_limit),
          (42, 55, s_single), (55, 65, s_idea), (65, 84, s_pool), (84, 98, s_scale), (98, 200, s_bouncer)]

def frame(t):
    img = background(t); d = ImageDraw.Draw(img)
    for x, y, r, ph in SPECKS:
        a = 0.25 + 0.25 * math.sin(t * 1.4 + ph)
        d.ellipse([x - r, y - r, x + r, y + r], fill=(160, 205, 235, int(255 * a)))
    for i, (a, b, fn) in enumerate(SCENES):
        if a <= t < b:
            layer = Image.new("RGBA", (W, H), (0, 0, 0, 0)); fn(layer, ImageDraw.Draw(layer), t)
            k = min(clamp((t - a) / 0.3) if i > 0 else 1, clamp((b - t) / 0.25))
            if k < 1:
                arr = np.array(layer); arr[..., 3] = (arr[..., 3] * k).astype(np.uint8); layer = Image.fromarray(arr)
            img.alpha_composite(layer)
    E = edge(t)
    arr = np.array(img); xs = np.arange(W)
    wave = (E + 10 * np.sin(2 * math.pi * xs / 150 + t * 2.2)).astype(int)
    arr[..., 3] = np.where(np.arange(H)[:, None] <= wave[None, :], 255, 0).astype(np.uint8)
    out = Image.fromarray(arr); od = ImageDraw.Draw(out)
    od.line([(x, float(wave[x])) for x in range(0, W, 6)] + [(W - 1, float(wave[-1]))], fill=AMBER + (255,), width=7)
    return out

if __name__ == "__main__":
    if sys.argv[1:] and sys.argv[1] == "preview":
        for t in [float(x) for x in sys.argv[2:]]: frame(t).save(f"pv_{t:.1f}.png")
        sys.exit()
    o = sys.stdout.buffer
    for n in range(NFR): o.write(frame(n / FPS).tobytes())
