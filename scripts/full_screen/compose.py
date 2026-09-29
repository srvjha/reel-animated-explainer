"""Render front/behind HTML layers with Chromium at each frame time and composite with the source video and mattes.
usage: python3 compose.py preview t1 t2 ...   |   python3 compose.py render > raw rgb24 on stdout"""
import sys, json, io, math, subprocess, os, numpy as np
from PIL import Image
from playwright.sync_api import sync_playwright

SRC = os.environ["SRC"]
W, H, FPS, DUR = 1080, 1920, 30, 107.1
L = json.load(open("../layout.json")); A = json.load(open("../anchors.json"))
DEPTH = L["depth"]; CUTS = L["cuts"]
HIT = A["hit"]
here = os.path.dirname(os.path.abspath(__file__))

SEEK = "t => { for (const a of document.getAnimations()) { a.pause(); a.currentTime = t; } }"

def in_any(t, spans): return any(a <= t < b for a, b, *_ in spans)

# face segments (for gentle alternating zoom): complement of depth and cut windows
edges = sorted({0.0, DUR} | {x for a, b, *_ in DEPTH + CUTS for x in (a, b)})
FACE = [(a, b) for a, b in zip(edges, edges[1:]) if not in_any((a + b) / 2, DEPTH) and not in_any((a + b) / 2, CUTS)]

def zoom_face(img, t):
    for i, (a, b) in enumerate(FACE):
        if a <= t < b:
            z0 = 1.0 if i % 2 == 0 else 1.1
            z = z0 + 0.05 * (t - a) / max(0.5, b - a)
            cw, ch = W / z, H / z; x0 = (W - cw) / 2; y0 = min(max(700 - ch / 2, 0), H - ch)
            return img.resize((W, H), Image.BICUBIC, box=(x0, y0, x0 + cw, y0 + ch))
    return img

class Layers:
    def __init__(self):
        self.pw = sync_playwright().start()
        self.br = self.pw.chromium.launch(args=["--disable-gpu", "--allow-file-access-from-files"])
        self.pages = {}
        for name in ("front", "behind"):
            p = self.br.new_page(viewport={"width": W, "height": H})
            p.goto(f"file://{here}/{name}.html"); p.wait_for_load_state("load")
            p.wait_for_function("document.body.dataset.ready==1")
            self.pages[name] = p
    def shot(self, name, t):
        p = self.pages[name]; p.evaluate(SEEK, t * 1000)
        return Image.open(io.BytesIO(p.screenshot(omit_background=True, type="png"))).convert("RGBA")

def frame(ly, src, n):
    t = n / FPS
    depth = os.path.exists(f"../alpha/{n:05d}.png") and not in_any(t, [(a + 0.3, b - 0.3) for a, b, _ in CUTS])
    out = np.asarray(src, np.float32)
    if depth:
        bh = np.asarray(ly.shot("behind", t), np.float32)
        ba = bh[..., 3:4] / 255
        a = np.asarray(Image.open(f"../alpha/{n:05d}.png"), np.float32)[..., None] / 255
        bgd = bh[..., :3] * ba + out * (1 - ba)
        out = bgd * (1 - a) + out * a
    if not in_any(t, DEPTH) and not in_any(t, CUTS):
        out = np.asarray(zoom_face(Image.fromarray(np.clip(out, 0, 255).astype(np.uint8)), t), np.float32)
    fr = np.asarray(ly.shot("front", t), np.float32)
    fa = fr[..., 3:4] / 255
    out = fr[..., :3] * fa + out * (1 - fa)
    if HIT <= t < HIT + 0.5:
        k = 1 - (t - HIT) / 0.5
        dx, dy = int(16 * k * math.sin(t * 90)), int(12 * k * math.cos(t * 77))
        out = np.roll(np.roll(out, dx, 1), dy, 0)
        fl = max(0, 1 - (t - HIT) / 0.15); out = out * (1 - 0.5 * fl) + 255 * 0.5 * fl
    return np.clip(out, 0, 255).astype(np.uint8)

def grab(t):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-ss", f"{t:.3f}", "-i", SRC, "-frames:v", "1", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], capture_output=True).stdout
    return Image.frombuffer("RGB", (W, H), raw, "raw", "RGB", 0, 1)

if __name__ == "__main__":
    ly = Layers()
    if sys.argv[1] == "preview":
        ts = [float(x) for x in sys.argv[2:]]
        ims = [Image.fromarray(frame(ly, grab(t), int(round(t * FPS)))).resize((270, 480)) for t in ts]
        cols = 6; rows = (len(ims) + cols - 1) // cols
        g = Image.new("RGB", (cols * 274, rows * 500), "white")
        from PIL import ImageDraw
        d = ImageDraw.Draw(g)
        for j, im in enumerate(ims):
            g.paste(im, ((j % cols) * 274, (j // cols) * 500)); d.text(((j % cols) * 274 + 4, (j // cols) * 500 + 484), str(ts[j]), fill="black")
        g.save("../grid.jpg", quality=88); sys.exit()
    n0, n1 = int(sys.argv[2]), int(sys.argv[3])
    dec = subprocess.Popen(["ffmpeg", "-v", "error", "-ss", f"{n0 / FPS:.4f}", "-i", SRC, "-vf", "fps=30", "-frames:v", str(n1 - n0), "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], stdout=subprocess.PIPE)
    o = sys.stdout.buffer; fs = W * H * 3; last = None
    for n in range(n0, n1):
        buf = dec.stdout.read(fs)
        if len(buf) < fs: buf = last
        last = buf
        o.write(frame(ly, Image.frombuffer("RGB", (W, H), buf, "raw", "RGB", 0, 1), n).tobytes())
        if n % 150 == 0: print(n, file=sys.stderr, flush=True)
