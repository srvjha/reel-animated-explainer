"""EXAMPLE (Connection Pooling reel), copy and rewrite per episode. Generates front.html (captions, plates, cutaways) and behind.html (depth backgrounds drawn behind the cut-out speaker).
All animation is CSS keyframes with absolute delays in ms, so a frame at time t is rendered by pausing every
animation at currentTime = t*1000 (see compose.py). Mechanics borrowed from open-edit recipes:
template-034 (word-rise captions with a yellow emphasis plate, red CTA plates, giant red counter numerals)
and hook-244 (Press Start 2P extruded pixel headline with a per-glyph neon light-up).
Fonts come from npm (@fontsource/archivo-black, @fontsource/press-start-2p, @fontsource/jetbrains-mono); run from web/."""
import json, random, re, html

W = json.load(open("../words.json"))
DUR = 107.1
random.seed(4)

INK = "#101010"; CREAM = "#FAE3BB"; RED = "#FF2E12"; YEL = "#FFE500"; EXT = "#B74933"; GRN = "#3DDC84"; TEAL = "#34C6D8"

def at(word, near, win=6.0):
    """time of the spoken word closest to `near` (case-insensitive prefix match)"""
    c = [x["t"] for x in W if re.sub(r"[^a-z0-9_]", "", x["w"].lower()).startswith(word.lower()) and abs(x["t"] - near) < win]
    if not c: raise SystemExit(f"word {word} not found near {near}")
    return min(c, key=lambda v: abs(v - near))

_k = [0]
def gate(t0, t1, fin=0.12, fout=0.15):
    """opacity window t0..t1 with fades; returns css animation declaration + keyframes"""
    _k[0] += 1; n = f"g{_k[0]}"; d = max(0.05, t1 - t0)
    a = min(49, fin / d * 100); b = max(51, 100 - fout / d * 100)
    KF.append(f"@keyframes {n}{{0%{{opacity:0}}{a:.2f}%{{opacity:1}}{b:.2f}%{{opacity:1}}100%{{opacity:0}}}}")
    return f"animation:{n} {d*1000:.0f}ms linear {t0*1000:.0f}ms;"

def anim(name, dur, t0, ease="cubic-bezier(.2,.7,.3,1)", fill="both", extra=""):
    return f"animation:{name} {dur*1000:.0f}ms {ease} {t0*1000:.0f}ms {fill}{extra};"

KF = []
BASE_CSS = f"""
@font-face{{font-family:AB;src:url(node_modules/@fontsource/archivo-black/files/archivo-black-latin-400-normal.woff2)}}
@font-face{{font-family:PS;src:url(node_modules/@fontsource/press-start-2p/files/press-start-2p-latin-400-normal.woff2)}}
@font-face{{font-family:JB;font-weight:700;src:url(node_modules/@fontsource/jetbrains-mono/files/jetbrains-mono-latin-700-normal.woff2)}}
@font-face{{font-family:JB;font-weight:400;src:url(node_modules/@fontsource/jetbrains-mono/files/jetbrains-mono-latin-400-normal.woff2)}}
*{{margin:0;padding:0;box-sizing:border-box}}
html,body{{width:1080px;height:1920px;overflow:hidden;background:transparent}}
.a{{position:absolute}}
.g{{opacity:0}}
/* template-034 caption board */
.board{{position:absolute;left:64px;bottom:318px;width:960px;z-index:50}}
.cl{{display:block;text-align:left;font-family:AB;letter-spacing:-.02em;line-height:1;padding:0 0 10px;font-size:74px;white-space:nowrap}}
.w{{display:inline-block;opacity:0;line-height:1;margin-right:.22em;padding:8px 0 16px;color:#FFF;
   text-shadow:6px 8px 0 {INK},0 6px 26px rgba(25,25,25,.45),0 2px 6px rgba(25,25,25,.4)}}
.hl{{background:{YEL};color:{INK};padding:8px 20px 16px;text-shadow:none;box-shadow:6px 8px 0 {INK}}}
.lead{{margin-left:-20px}}
.cta{{background:{RED};color:{INK};padding:10px 24px 20px;text-shadow:none;box-shadow:7px 9px 0 {INK}}}
@keyframes wIn{{0%{{opacity:0;transform:translateY(.3em)}}100%{{opacity:1;transform:none}}}}
@keyframes wPop{{0%{{opacity:0;transform:translateY(.18em) scale(.86)}}100%{{opacity:1;transform:none}}}}
/* counter numerals */
.ig{{display:inline-block;font-family:AB;letter-spacing:-.045em;color:{RED};line-height:1;
    text-shadow:0 14px 60px rgba(25,25,25,.45),0 8px 14px rgba(25,25,25,.35)}}
@keyframes idxIn{{0%{{opacity:0;transform:translateY(60px) scale(1.06)}}100%{{opacity:1;transform:none}}}}
/* hook-244 pixel headline */
.ext{{font-family:PS;color:{CREAM};letter-spacing:-.04em;white-space:nowrap;line-height:1.15;
     text-shadow:3px 3px 0 {EXT},6px 6px 0 {EXT},9px 9px 0 #AD4530,12px 12px 0 #A8412E,15px 15px 0 #9A3B2A}}
.ch{{display:inline-block;opacity:0}}
@keyframes neon{{0%{{opacity:0;transform:translateY(.6em);filter:drop-shadow(0 0 0 rgba(255,224,138,0))}}
 55%{{opacity:1;filter:drop-shadow(0 0 16px rgba(255,210,90,.95)) drop-shadow(0 0 36px rgba(255,150,40,.7))}}
 100%{{opacity:1;transform:none;filter:drop-shadow(0 0 0 rgba(255,224,138,0))}}}}
/* generic plates */
.plate{{font-family:AB;font-size:64px;line-height:1;padding:14px 26px 22px;display:inline-block;box-shadow:7px 9px 0 {INK}}}
@keyframes pop{{0%{{opacity:0;transform:scale(.6) rotate(var(--r,0deg))}}70%{{opacity:1;transform:scale(1.06) rotate(var(--r,0deg))}}100%{{opacity:1;transform:scale(1) rotate(var(--r,0deg))}}}}
@keyframes rise{{0%{{opacity:0;transform:translateY(40px)}}100%{{opacity:1;transform:none}}}}
@keyframes fadein{{0%{{opacity:0}}100%{{opacity:1}}}}
@keyframes wipeIn{{0%{{clip-path:inset(0 0 0 100%)}}100%{{clip-path:inset(0 0 0 0)}}}}
@keyframes wipeOut{{0%{{clip-path:inset(0 0 0 0)}}100%{{clip-path:inset(0 100% 0 0)}}}}
@keyframes blink{{0%,49%{{opacity:1}}50%,100%{{opacity:.15}}}}
@keyframes shake{{0%,100%{{transform:translate(0,0) rotate(-4deg)}}20%{{transform:translate(-14px,6px) rotate(-5deg)}}40%{{transform:translate(12px,-8px) rotate(-3deg)}}60%{{transform:translate(-8px,4px) rotate(-4deg)}}80%{{transform:translate(6px,-3px) rotate(-4deg)}}}}
@keyframes floor{{0%{{background-position:0 0}}100%{{background-position:0 120px}}}}
.mono{{font-family:JB;font-weight:700}}
"""

def page_doc(body):
    fit = "<script>for(const a of document.getAnimations()){a.pause();a.currentTime=0}document.fonts.ready.then(()=>{for(const a of document.getAnimations()){a.pause()}for(const l of document.querySelectorAll('.board .cl')){const w=l.scrollWidth;if(w>950){l.style.fontSize=(74*950/w).toFixed(1)+'px'}}document.body.dataset.ready=1})</script>"
    return f"<!doctype html><meta charset=utf-8><style>{BASE_CSS}\n{chr(10).join(KF)}</style><body>{body}{fit}</body>"

# ---------------------------------------------------------------- arcade background (depth + cutaways)
BLUE = "#3B82F6"
def arcade_bg(t0, t1, tint=None, floor=True):
    """black + blue grid (no warm glow, no sun)"""
    s = gate(t0, t1, 0.15, 0.15)
    fl = ""
    if floor:
        fl = (f'<div class=a style="left:-540px;right:-540px;bottom:-200px;height:820px;transform:perspective(420px) rotateX(62deg);transform-origin:50% 100%;'
              f'background-image:linear-gradient(rgba(59,130,246,.55) 3px,transparent 3px),linear-gradient(90deg,rgba(59,130,246,.45) 3px,transparent 3px);'
              f'background-size:120px 120px;-webkit-mask-image:linear-gradient(transparent,#000 45%);{anim("floor", 1.2, t0, "linear", "both", "")} animation-iteration-count:infinite"></div>')
    return (f'<div class="a g" style="inset:0;{s}background:linear-gradient(#040507,#070a10 60%,#0a1120);overflow:hidden">'
            f'<div class=a style="inset:0;background-image:linear-gradient(rgba(59,130,246,.10) 2px,transparent 2px),linear-gradient(90deg,rgba(59,130,246,.10) 2px,transparent 2px);background-size:60px 60px"></div>'
            f'<div class=a style="inset:0;background-image:linear-gradient(rgba(59,130,246,.22) 2px,transparent 2px),linear-gradient(90deg,rgba(59,130,246,.22) 2px,transparent 2px);background-size:240px 240px;background-position:-1px -1px"></div>'
            f'{fl}<div class=a style="inset:0;background:repeating-linear-gradient(transparent 0 3px,rgba(0,0,0,.16) 3px 5px)"></div></div>')

def neon_word(txt, size, t0, spread=1.0, color=None):
    order = list(range(len(txt))); random.shuffle(order)
    out = []
    for i, ch in enumerate(txt):
        if ch == " ": out.append('<span style="display:inline-block;width:.6em"></span>'); continue
        d = t0 + order.index(i) / max(1, len(txt) - 1) * spread
        out.append(f'<span class=ch style="{anim("neon", .42, d)}">{html.escape(ch)}</span>')
    st = f"font-size:{size}px;" + (f"color:{color};" if color else "")
    return f'<div class=ext style="{st}">{"".join(out)}</div>'

# ---------------------------------------------------------------- timeline anchors (from word timings)
T = {}
T["so"] = at("so", 2.4, 2)
T["1000a"] = at("1000", 6.7)
T["query"] = at("query", 14.5, 3); T["establish"] = at("establish", 16.0, 3); T["client"] = at("client", 17.8, 3)
T["dedicated"] = at("dedicated", 20.4, 3); T["process"] = at("process", 21.3, 3); T["zyada"] = at("zyada", 23.5, 0.5)
T["concurrent1"] = at("concurrent", 29.0, 3); T["max"] = at("max_connections", 36.3, 4); T["hit"] = at("hit", 40.1, 4)
T["one"] = at("hi", 43.8, 3); T["problem"] = at("problem", 45.7, 3); T["sakta"] = at("sakta", 51.0, 3)
T["multiple2"] = at("multiple", 56.2, 2); T["yahin"] = at("yahin", 60.0, 3); T["pooling1"] = at("pooling", 59.9, 0.5)
T["create2"] = at("create", 63.1, 3); T["destroy2"] = at("destroy", 63.7, 3); T["reuse1"] = at("reuse", 65.2, 3)
T["lets"] = at("let", 66.6, 3); T["pool3"] = at("pool", 68.0, 1); T["execute"] = at("execute", 73.1, 3)
T["kaam"] = at("kaam", 73.6, 3); T["destroy3"] = at("destroy", 75.2, 2); T["next"] = at("next", 77.0, 3)
T["reuse2"] = at("reuse", 79.0, 2); T["unlike"] = at("unlike", 79.8, 3)
T["1000b"] = at("1000", 82.1, 3); T["20"] = at("20", 85.5, 3); T["1000c"] = at("1000", 87.8, 3)
T["wait"] = at("wait", 98.0, 3); T["production"] = at("production", 98.6, 3); T["pgb"] = at("pgbouncer", 99.8, 3)
T["large"] = at("large", 101.8, 3); T["fewer"] = at("fewer", 103.4, 3)
json.dump(T, open("../anchors.json", "w"), indent=1)

# depth (background removed) windows, used by the compositor too
DEPTH = [(0.0, 4.35), (30.0, 43.75), (T["yahin"] - 0.25, T["yahin"] + 2.2), (98.2, 107.1)]
CUTS = [(T["query"] - 0.3, T["process"] + 1.3, "terminal"), (T["problem"] - 0.2, T["sakta"] + 0.4, "single"),
        (T["lets"] - 0.2, T["unlike"] - 0.1, "pool")]
json.dump({"depth": DEPTH, "cuts": CUTS}, open("../layout.json", "w"), indent=1)

# ================================================================= BEHIND layer
B = []
B.append(arcade_bg(-0.5, DUR + 1))
# hook
h0, h1 = DEPTH[0]
B.append(arcade_bg(h0, h1 + 0.2))
B.append(f'<div class="a g" style="left:0;right:0;top:150px;text-align:center;{gate(h0, h1 + 0.2, 0.01)}">'
         f'{neon_word("CONNECTION", 92, 0.15, 0.9)}<div style="height:26px"></div>{neon_word("POOLING", 136, 0.55, 0.8, YEL)}</div>')
# limit segment: scoreboard + block wall behind the speaker
l0, l1 = DEPTH[1]
B.append(arcade_bg(l0, l1 + 0.2, "rgba(255,46,18,.35)", floor=False))
fill0, fill1 = l0 + 0.5, T["hit"]
blocks = []
for i in range(100):
    r, c = divmod(i, 10); x = 40 + c * 100; y = 330 + r * 100
    ti = fill0 + (fill1 - fill0) * (i / 99) ** 0.85
    col = CREAM if i < 60 else (YEL if i < 85 else RED)
    blocks.append(f'<div class=a style="left:{x}px;top:{y}px;width:88px;height:88px;background:{col};box-shadow:inset -8px -8px 0 rgba(0,0,0,.25),inset 6px 6px 0 rgba(255,255,255,.35);{anim("pop", .25, ti)}"></div>')
    blocks.append(f'<div class="a g" style="left:{x}px;top:{y}px;width:88px;height:88px;background:{RED};{anim("blink", .24, T["hit"], "steps(1)", "none", "")}animation-iteration-count:{int((l1 - T["hit"]) / .24)}"></div>')
B.append(f'<div class="a g" style="inset:0;{gate(l0, l1 + 0.2)}">{"".join(blocks)}</div>')
# scoreboard counter (one span per value, each gated)
cnt = []
for v in range(101):
    tv = fill0 + (fill1 - fill0) * (max(v - 1, 0) / 99) ** 0.85 if v else l0
    tn = (fill0 + (fill1 - fill0) * (v / 99) ** 0.85) if v < 100 else l1 + 0.2
    colr = CREAM if v < 60 else (YEL if v < 85 else RED)
    cnt.append(f'<span class="a g" style="left:0;color:{colr};{gate(tv, tn, 0.001, 0.001)}">{v:03d}/100</span>')
B.append(f'<div class="a g" style="left:44px;top:100px;width:420px;height:200px;{gate(l0, l1 + 0.2)}">'
         f'<div class=ext style="position:absolute;left:0;font-size:34px;top:0">CONNECTIONS</div>'
         f'<div class=ext style="position:absolute;left:0;right:0;top:52px;height:80px;font-size:60px">{"".join(cnt)}</div></div>')
B.append(f'<div class="a g mono" style="right:40px;top:104px;{gate(T["max"], l1 + 0.2, 0.01)}"><div style="background:#0d0b0a;border:4px solid {YEL};color:{YEL};font-size:30px;padding:10px 16px;{anim("rise", .3, T["max"])}">max_connections=100</div></div>')
# pooling slam (callback to hook)
p0, p1 = DEPTH[2]
B.append(arcade_bg(p0, p1 + 0.2, "rgba(61,220,132,.30)"))
B.append(f'<div class="a g" style="left:0;right:0;top:150px;text-align:center;{gate(p0, p1 + 0.2, 0.01)}">'
         f'{neon_word("CONNECTION", 92, T["pooling1"] - 0.55, 0.5)}<div style="height:26px"></div>{neon_word("POOLING", 136, T["pooling1"] - 0.2, 0.35, GRN)}</div>')
# PgBouncer finale
f0, f1 = DEPTH[3]
B.append(arcade_bg(f0, f1 + 0.3, "rgba(52,198,216,.28)"))
cl = []
for i in range(10):
    y = 470 + i * 78
    cl.append(f'<div class="a mono" style="left:40px;top:{y}px;width:230px;height:60px;border:4px solid {CREAM};background:#1d1714;color:{CREAM};font-size:28px;display:flex;align-items:center;justify-content:center;{anim("rise", .3, T["production"] + 0.3 + i * 0.08)}">client {i + 1}</div>')
    for k in range(3):
        d0 = T["pgb"] + 0.4 + (i * 0.37 + k * 1.3) % 3.9
        KF.append(f"@keyframes fly{i}_{k}{{0%{{opacity:0;transform:translate(0,0)}}10%{{opacity:1}}90%{{opacity:1}}100%{{opacity:0;transform:translate({540 - 280}px,{(820 - y) * 1.0:.0f}px)}}}}")
        cl.append(f'<div class=a style="left:280px;top:{y + 22}px;width:18px;height:18px;background:{YEL};{anim(f"fly{i}_{k}", 1.1, d0, "linear", "none")}animation-iteration-count:{int((f1 - d0) / 1.3)};animation-duration:1.3s"></div>')
for j in range(3):
    y = 700 + j * 130
    cl.append(f'<div class="a mono" style="left:800px;top:{y}px;width:240px;height:96px;border:5px solid {TEAL};background:#0f1d20;color:{CREAM};font-size:28px;display:flex;align-items:center;justify-content:center;gap:10px;{anim("pop", .35, T["large"] + 0.3 + j * 0.2)}"><img src=pg_logo.png style="height:52px">conn {j + 1}</div>')
B.append(f'<div class="a g" style="inset:0;{gate(f0, f1 + 0.3)}">{"".join(cl)}</div>')
B.append(f'<div class="a g" style="left:0;right:0;top:150px;text-align:center;{gate(f0, f1 + 0.3, 0.01)}">{neon_word("PgBouncer", 104, T["pgb"] - 0.3, 0.6, TEAL)}</div>')
open("behind.html", "w").write(page_doc("".join(B)))
KF.clear()

# ================================================================= FRONT layer
F = []
KEYS = {"connection pooling", "postgresql", "postgres", "pgbouncer", "max_connections", "1000", "20", "reuse", "limit", "concurrent", "pool"}
def is_key(i):
    w = re.sub(r"[^a-z0-9_]", "", W[i]["w"].lower())
    nxt = re.sub(r"[^a-z0-9_]", "", W[i + 1]["w"].lower()) if i + 1 < len(W) else ""
    prv = re.sub(r"[^a-z0-9_]", "", W[i - 1]["w"].lower()) if i else ""
    if w == "connection" and nxt == "pooling": return True
    if w == "pooling" and prv == "connection": return True
    return w in KEYS

# pages: <=2 lines, <=15 chars a line, never a single word alone on a line, break after sentence punctuation
MAXC = 16
pages, cur, line = [], [], []
def llen(l): return sum(len(W[i]["w"]) for i in l) + max(0, len(l) - 1)
def flush_page():
    global cur, line
    if line: cur.append(line)
    if cur: pages.append(cur)
    cur, line = [], []
start = 0
for i, x in enumerate(W):
    if x["t"] < T["so"] - 0.05: continue      # the hook title already shows the opening words
    if line and llen(line + [i]) > MAXC:
        cur.append(line); line = []
        if len(cur) == 2: pages.append(cur); cur = []
    line.append(i)
    if re.search(r"[.?!:]$", x["w"]) or (re.search(r",$", x["w"]) and llen(line) > 8): flush_page()
flush_page()
# fix single-word lines: move a word from the neighbour line, or merge
fixed = []
for pg in pages:
    lines = [l[:] for l in pg]
    if len(lines) == 2:
        a, b = lines
        if len(b) == 1: b.insert(0, a.pop()) if len(a) > 2 else (a.extend(b), b.clear())
        if len(a) == 1 and b: a.append(b.pop(0)) if len(b) > 2 else (a.extend(b), b.clear())
        lines = [l for l in (a, b) if l]
    fixed.append(lines)
# a page that is a single one-word line joins the previous page's last line
out = []
for pg in fixed:
    if len(pg) == 1 and len(pg[0]) == 1 and out:
        out[-1][-1].extend(pg[0])
    else: out.append(pg)
pages = out
def resplit(pg):
    res = []
    for l in pg:
        if llen(l) > MAXC + 3 and len(l) >= 4:
            best = min(range(2, len(l) - 1), key=lambda k: abs(llen(l[:k]) - llen(l[k:])))
            res += [l[:best], l[best:]]
        else: res.append(l)
    return res
pages = [resplit(p) for p in pages]
cuts_end = {round(c[1], 2) for c in CUTS}
for n, pg in enumerate(pages):
    first = W[pg[0][0]]["t"]; lastw = W[pg[-1][-1]]["t"]
    nxt = W[pages[n + 1][0][0]]["t"] if n + 1 < len(pages) else DUR
    end = min(nxt, lastw + 1.6, DUR)
    # the closing words become red CTA plates at the end instead of a caption page
    lines = []
    for l in pg:
        spans = []
        for q, i in enumerate(l):
            k = is_key(i)
            cls = "w hl" + (" lead" if q == 0 else "") if k else "w"
            spans.append(f'<span class="{cls}" style="{anim("wPop" if k else "wIn", .26 if k else .2, W[i]["t"], "cubic-bezier(.34,1.4,.64,1)" if k else "cubic-bezier(.2,.7,.3,1)")}">{html.escape(W[i]["w"])}</span>')
        lines.append(f'<div class=cl>{"".join(spans)}</div>')
    F.append(f'<div class="board g" style="{gate(first - 0.02, end, 0.02, 0.08)}">{"".join(lines)}</div>')

def plate(txt, t0, t1, x, y, bg=YEL, fg=INK, rot=0, size=64, extra=""):
    return (f'<div class="a g" style="left:{x}px;top:{y}px;{gate(t0, t1, 0.01, 0.15)}"><div class=plate style="--r:{rot}deg;background:{bg};color:{fg};font-size:{size}px;{anim("pop", .32, t0, "cubic-bezier(.34,1.4,.64,1)")}{extra}">{txt}</div></div>')
def numeral(txt, t0, t1, size=300, label=None):
    lab = f'<div style="font-family:AB;font-size:52px;color:#fff;text-shadow:5px 7px 0 {INK};margin-top:-10px;{anim("rise", .3, t0 + 0.15)}">{label}</div>' if label else ""
    return (f'<div class="a g" style="right:50px;top:120px;text-align:right;{gate(t0, t1, 0.01, 0.2)}">'
            f'<span class=ig style="font-size:{size}px;{anim("idxIn", .42, t0)}">{txt}</span>{lab}</div>')

# hook front: series tag + "in PostgreSQL" sticker
F.append(f'<div class="a g mono" style="left:56px;top:96px;font-size:30px;color:{CREAM};letter-spacing:.08em;{gate(0.1, DEPTH[0][1] + 0.2)}"><span style="display:inline-block;width:14px;height:34px;background:{RED};vertical-align:middle;margin-right:14px"></span>BUILDING BACKEND SYSTEMS</div>')
F.append(f'<div class="a g" style="left:36px;top:1050px;{gate(1.1, DEPTH[0][1] + 0.2, 0.01)}"><div class=plate style="--r:-5deg;background:{CREAM};color:{INK};font-size:40px;display:flex;align-items:center;gap:12px;{anim("pop", .35, 1.1, "cubic-bezier(.34,1.4,.64,1)")}">in <img src=pg_logo.png style="height:58px"> PostgreSQL</div></div>')
# face moments
F.append(numeral("1000", T["1000a"], T["1000a"] + 3.6, 280, "requests at once"))
F.append(plate("more connections,", T["zyada"], T["concurrent1"] - 0.3, 60, 150, YEL, INK, -3, 56))
F.append(plate("more processes", T["zyada"] + 0.8, T["concurrent1"] - 0.3, 110, 250, RED, INK, 2, 56))
# limit hit (front, over the speaker)
F.append(f'<div class="a g" style="left:0;right:0;top:930px;text-align:center;{gate(T["hit"], DEPTH[1][1] + 0.1, 0.01)}">'
         f'<div class=ext style="display:inline-block;font-size:104px;color:{RED};text-shadow:4px 4px 0 {INK},8px 8px 0 {INK},12px 12px 0 #000;{anim("shake", .5, T["hit"], "linear", "both")}">LIMIT HIT</div></div>')
F.append(f'<div class="a g mono" style="left:60px;right:60px;top:1100px;text-align:center;{gate(T["hit"] + 0.35, DEPTH[1][1] + 0.1, 0.01)}"><span style="background:{RED};color:{INK};font-size:34px;padding:10px 18px;{anim("rise", .25, T["hit"] + 0.35)}display:inline-block">FATAL: too many clients already</span></div>')
F.append(plate("Just use ONE connection?", T["one"] - 0.2, T["problem"] - 0.25, 60, 170, YEL, INK, -3, 60))
F.append(plate("need multiple connections", T["multiple2"], T["yahin"] - 0.3, 60, 170, CREAM, INK, 2, 56))
F.append(plate('<s style="text-decoration-thickness:8px">create</s>', T["create2"], T["lets"] - 0.3, 60, 170, CREAM, RED, -4, 60))
F.append(plate('<s style="text-decoration-thickness:8px">destroy</s>', T["destroy2"], T["lets"] - 0.3, 420, 170, CREAM, RED, 3, 60))
F.append(plate("REUSE", T["reuse1"], T["lets"] - 0.3, 330, 300, GRN, INK, -2, 90))
F.append(numeral("1000", T["1000b"], T["20"] - 0.1, 280, "requests"))
F.append(numeral("20", T["20"], T["1000c"] - 0.1, 380, "connections"))
F.append(plate('<s style="text-decoration-thickness:8px">1000 connections</s>', T["1000c"], T["1000c"] + 2.6, 60, 170, CREAM, RED, -3, 60))
F.append(plate("others wait their turn", T["wait"] - 1.6, DEPTH[3][0], 60, 170, YEL, INK, -2, 58))
F.append(plate("many clients, few connections", T["large"], T["fewer"] + 1.3, 60, 1080, CREAM, INK, -2, 44))

# ---- cutaways (opaque full-screen clips, wipe in / out)
def cutaway(t0, t1, inner, title):
    return (f'<div class="a g" style="inset:0;z-index:20;{gate(t0, t1, 0.001, 0.001)}"><div class=a style="inset:0;{anim("wipeIn", .28, t0, "cubic-bezier(.7,0,.2,1)")}">'
            f'<div class=a style="inset:0;{anim("wipeOut", .28, t1 - .28, "cubic-bezier(.7,0,.2,1)", "forwards")}">'
            f'{arcade_bg(t0 - 0.01, t1 + 0.01, "rgba(255,46,18,.22)", floor=False)}'
            f'<div class="a mono" style="left:56px;top:110px;font-size:30px;color:{CREAM};letter-spacing:.08em"><span style="display:inline-block;width:14px;height:34px;background:{RED};vertical-align:middle;margin-right:14px"></span>BUILDING BACKEND SYSTEMS</div>'
            f'<div class=ext style="position:absolute;left:56px;top:180px;font-size:50px">{title}</div>{inner}</div></div></div>')

def typed(txt, t0, cps=38, color=CREAM):
    return "".join(f'<span style="opacity:0;{anim("fadein", .01, t0 + i / cps, "linear")}">{html.escape(c)}</span>' for i, c in enumerate(txt)) + ""

# 1) terminal: what happens when the backend sends a query
c0, c1, _ = CUTS[0]
rows = [(T["query"], "$ db.query('SELECT * FROM users')", CREAM), (T["query"] + 1.0, "> connecting to postgres:5432", TEAL),
        (T["establish"] - 0.4, "  [1] TCP handshake ....... ok", GRN), (T["establish"] + 0.5, "  [2] authenticate ........ ok", GRN),
        (T["client"] - 0.2, "  [3] session ready ....... ok", GRN), (T["dedicated"], "postgres: forked backend", YEL), (T["dedicated"] + 0.9, "          process pid=4102", YEL)]
term = "".join(f'<div style="height:64px;white-space:pre;color:{c}">{typed(s, t)}</div>' for t, s, c in rows)
inner = (f'<div class=a style="left:48px;right:48px;top:330px;height:720px;background:#0b0908;border:5px solid {CREAM};box-shadow:12px 14px 0 {INK}">'
         f'<div style="height:58px;background:{CREAM};display:flex;align-items:center;gap:14px;padding-left:22px"><i style="width:22px;height:22px;background:{RED};display:block"></i><i style="width:22px;height:22px;background:{YEL};display:block"></i><i style="width:22px;height:22px;background:{GRN};display:block"></i><b class=mono style="font-size:26px;color:{INK};margin-left:12px">backend-server</b></div>'
         f'<div class=mono style="padding:30px 30px;font-size:33px;font-weight:700">{term}</div></div>'
         f'<div class="a" style="left:0;right:0;top:1090px;text-align:center"><span class=plate style="background:{YEL};color:{INK};font-size:52px;{anim("pop", .3, T["dedicated"] + 1.2, "cubic-bezier(.34,1.4,.64,1)")}">1 connection = 1 process</span></div>')
F.append(cutaway(c0, c1, inner, "EVERY QUERY NEEDS<br>A CONNECTION"))

# 2) single connection bottleneck
c0, c1, _ = CUTS[1]
box = lambda x, y, w, h, lab, col: f'<div class="a mono" style="left:{x}px;top:{y}px;width:{w}px;height:{h}px;border:6px solid {col};background:#161110;color:{CREAM};font-size:40px;display:flex;align-items:center;justify-content:center;gap:12px">{lab}</div>'
inner = box(60, 560, 250, 170, "APP", YEL) + box(770, 560, 250, 170, '<img src=pg_logo.png style="height:70px">PG', TEAL)
inner += f'<div class=a style="left:310px;top:636px;width:460px;height:18px;background:{CREAM}"></div><div class="a mono" style="left:310px;width:460px;top:580px;text-align:center;color:{CREAM};font-size:30px">1 connection</div>'
for q in range(12):
    r, c = divmod(q, 4)
    inner += f'<div class=a style="left:{70 + c * 60}px;top:{800 + r * 60}px;width:40px;height:40px;background:{YEL};{anim("pop", .2, c0 + 0.3 + q * 0.06)}"></div>'
KF.append(f"@keyframes pass{{0%{{transform:translateX(0)}}100%{{transform:translateX(430px)}}}}")
inner += f'<div class=a style="left:320px;top:626px;width:38px;height:38px;background:{YEL};{anim("pass", 1.6, c0 + 0.6, "linear", "both")}animation-iteration-count:{int((c1 - c0) / 1.6)}"></div>'
inner += f'<div class="a mono" style="left:70px;top:1000px;color:{RED};font-size:40px;{anim("blink", .8, c0 + 1.0, "steps(1)", "both")}animation-iteration-count:12">WAITING...</div>'
inner += f'<div class=a style="left:420px;top:880px"><div class=ext style="font-size:60px;color:{RED};text-shadow:4px 4px 0 {INK},8px 8px 0 #000;{anim("pop", .3, c0 + 1.6, "cubic-bezier(.34,1.4,.64,1)")}--r:-6deg">BOTTLENECK</div></div>'
F.append(cutaway(c0, c1, inner, "JUST ONE<br>CONNECTION?"))

# 3) how the pool works
c0, c1, _ = CUTS[2]
inner = box(40, 700, 200, 140, "REQ", YEL) + box(830, 690, 210, 160, '<img src=pg_logo.png style="height:70px">PG', TEAL)
inner += f'<div class=a style="left:290px;top:620px;width:500px;height:300px;border:6px dashed {GRN}"></div><div class="a mono" style="left:290px;width:500px;top:570px;text-align:center;color:{GRN};font-size:30px">CONNECTION POOL</div>'
take, ret, take2 = T["pool3"], T["kaam"] + 0.6, T["next"] + 0.6
for s in range(5):
    x = 320 + s * 92
    inner += f'<div class="a mono" style="left:{x}px;top:730px;width:76px;height:80px;background:{GRN};color:{INK};font-size:28px;display:flex;align-items:center;justify-content:center;{anim("pop", .25, c0 + 0.4 + s * 0.1)}">c{s + 1}</div>'
# c1 busy windows (yellow overlay)
for a_, b_ in ((take, ret), (take2, c1)):
    inner += f'<div class="a g mono" style="left:320px;top:730px;width:76px;height:80px;background:{YEL};color:{INK};font-size:28px;display:flex;align-items:center;justify-content:center;{gate(a_, b_, .08, .08)}">c1</div>'
KF.append(f"@keyframes q1{{0%{{transform:translateX(0)}}100%{{transform:translateX(420px)}}}}")
inner += f'<div class="a g" style="left:400px;top:760px;width:22px;height:22px;background:{YEL};{gate(T["execute"] - 0.2, T["kaam"] + 0.2, .05, .1)}"><div style="width:22px;height:22px;{anim("q1", .9, T["execute"] - 0.2, "linear", "both")}animation-iteration-count:3;background:{YEL}"></div></div>'
inner += f'<div class="a g mono" style="left:0;right:0;top:980px;text-align:center;{gate(T["execute"] - 0.2, T["kaam"] + 0.4)}"><span style="background:{YEL};color:{INK};font-size:40px;padding:10px 18px">query runs on c1</span></div>'
inner += f'<div class="a g mono" style="left:0;right:0;top:980px;text-align:center;{gate(ret, T["next"] - 0.05)}"><span style="background:{GRN};color:{INK};font-size:40px;padding:10px 18px">c1 back in pool, not destroyed</span></div>'
inner += f'<div class="a g mono" style="left:0;right:0;top:980px;text-align:center;{gate(T["next"], c1)}"><span style="background:{CREAM};color:{INK};font-size:40px;padding:10px 18px">next request reuses c1</span></div>'
inner += f'<div class="a g" style="left:320px;top:470px;{gate(T["reuse2"], c1, .01)}"><div class=ext style="font-size:46px;color:{YEL};{anim("rise", .5, T["reuse2"])}">+1 REUSE</div></div>'
F.append(cutaway(c0, c1, inner, "HOW THE POOL<br>WORKS"))

# ending CTA (template-034 closing plates)
F.append(f'<div class="a g" style="left:64px;top:1030px;{gate(T["fewer"] + 1.4, DUR + 1, 0.01)}">'
         f'<div class=cl><span class="w cta" style="font-size:96px;{anim("wPop", .26, T["fewer"] + 1.4, "cubic-bezier(.34,1.4,.64,1)")}">REUSE,</span></div>'
         f'<div class=cl><span class="w cta" style="font-size:96px;{anim("wPop", .26, T["fewer"] + 1.8, "cubic-bezier(.34,1.4,.64,1)")}">DON\'T RECREATE</span></div></div>')
open("front.html", "w").write(page_doc("".join(F)))
print("pages", len(pages), "anchors", T)
