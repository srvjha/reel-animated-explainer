"""Build a styled, speech-synced ASS caption file from a timestamped transcript.

Usage:
  python3 build_captions.py VIDEO.mp4 segments.json caps.ass [--margin-v 360] [--size 58] [--keywords k1,k2,...]

segments.json is a list of {"start": 0.0, "end": 8.0, "text": "exact words spoken..."}.
The text is never reworded, only split into short lines. Inside each segment, lines are
timed by voiced (loud) time rather than raw time, so they follow the speaker's pace.
"""
import argparse, json, re, subprocess, wave
import numpy as np

ap = argparse.ArgumentParser()
ap.add_argument("video"); ap.add_argument("segments"); ap.add_argument("out")
ap.add_argument("--margin-v", type=int, default=360, help="distance of caption bottom from frame bottom (1920 tall)")
ap.add_argument("--size", type=int, default=58)
ap.add_argument("--max-chars", type=int, default=46)
ap.add_argument("--keywords", default="", help="comma-separated terms to highlight")
ap.add_argument("--font", default="/usr/share/fonts/truetype/google-fonts/Poppins-Bold.ttf")
ap.add_argument("--hl", default="&H3BD4FF&", help="ASS BGR colour for highlights (default yellow #FFD43B)")
a = ap.parse_args()

# loudness per 0.1 s
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", a.video, "-ac", "1", "-ar", "16000", "/tmp/_caps_audio.wav"], check=True)
w = wave.open("/tmp/_caps_audio.wav"); x = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(float)
hop = 1600
db = np.array([20 * np.log10(np.sqrt((x[i:i + hop] ** 2).mean()) + 1e-9) for i in range(0, len(x) - hop, hop)])
voiced = (db > np.percentile(db, 40)).astype(float) + 0.15

def chunks(text):
    raw = re.split(r"(?<=[.,?!])\s+", text); parts = []; carry = ""
    for r in raw:
        r = (carry + " " + r).strip() if carry else r
        if len(r) < 12: carry = r
        else: parts.append(r); carry = ""
    if carry: parts.append(carry)
    out = []
    for p in parts:
        cur = ""
        for wd in p.split():
            if len(cur) + 1 + len(wd) > a.max_chars and cur: out.append(cur); cur = wd
            else: cur = (cur + " " + wd).strip()
        if cur: out.append(cur)
    # never leave a single word on its own: merge it into a neighbour
    fixed = []
    for c in out:
        if len(c.split()) == 1 and fixed:
            prev = fixed[-1].split()
            if len(prev) >= 3 and len(" ".join(prev + [c])) > a.max_chars + 12:
                fixed[-1] = " ".join(prev[:-1]); fixed.append(prev[-1] + " " + c)
            else:
                fixed[-1] = fixed[-1] + " " + c
        else:
            fixed.append(c)
    if len(fixed) > 1 and len(fixed[0].split()) == 1:
        fixed[1] = fixed[0] + " " + fixed[1]; fixed = fixed[1:]
    return fixed

caps = []
for seg in json.load(open(a.segments)):
    s, e, text = float(seg["start"]), float(seg["end"]), seg["text"]
    cs = chunks(text)
    i0, i1 = int(s * 10), min(int(e * 10), len(voiced))
    v = voiced[i0:i1]; cum = np.concatenate([[0], np.cumsum(v)]); tot = cum[-1] or 1
    lens = np.array([len(c) for c in cs], float); cl = np.concatenate([[0], np.cumsum(lens)]) / lens.sum()
    t_at = lambda f: s + min(np.searchsorted(cum, f * tot), len(v)) / 10.0
    for j, c in enumerate(cs):
        caps.append((t_at(cl[j]), t_at(cl[j + 1]) if j < len(cs) - 1 else e, c))

from PIL import ImageFont
_F = ImageFont.truetype(a.font, a.size)
MAXW = 1080 - 2 * 110
def balance(c):
    words = c.split()
    if _F.getlength(c) <= MAXW or len(words) < 4: return c
    best = None
    for i in range(2, len(words) - 1):
        l1, l2 = " ".join(words[:i]), " ".join(words[i:])
        w1, w2 = _F.getlength(l1), _F.getlength(l2)
        if max(w1, w2) <= MAXW and (best is None or abs(w1 - w2) < best[0]): best = (abs(w1 - w2), l1, l2)
    return best[1] + " \\N " + best[2] if best else c
caps = [(s0, e0, balance(c)) for s0, e0, c in caps]

keys = [k.strip() for k in a.keywords.split(",") if k.strip()]
def hl(s):
    if not keys: return s
    pat = "|".join(re.escape(k) for k in sorted(keys, key=len, reverse=True))
    return re.sub(r"(?i)(?<![\w+])(" + pat + r")(?![\w])", lambda m: "{\\c" + a.hl + "}" + m.group(1) + "{\\c&HFFFFFF&}", s)
def fin(s): return hl(s).replace(" \\N ", "\\N")
def ts(t): return f"0:{int(t // 60):02d}:{t % 60:05.2f}"
pop = "{\\fscx85\\fscy85\\t(0,120,\\fscx103\\fscy103)\\t(120,200,\\fscx100\\fscy100)}"
hdr = f"""[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
WrapStyle: 0
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Cap,Poppins,{a.size},&H00FFFFFF,&H00FFFFFF,&H00000000,&H96000000,-1,0,0,0,100,100,0,0,1,7,3,2,110,110,{a.margin_v},1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
open(a.out, "w").write(hdr + "\n".join(
    f"Dialogue: 0,{ts(s)},{ts(max(s + 0.3, e - 0.02))},Cap,,0,0,0,,{pop}{fin(c)}" for s, e, c in caps) + "\n")
print(f"wrote {len(caps)} caption lines to {a.out}")
