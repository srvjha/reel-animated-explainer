"""Chiptune bed (ducked later under the voice) + 8-bit SFX, synthesised with numpy."""
import numpy as np, wave, json
SR = 44100; DUR = 107.2; N = int(SR * DUR)
A = json.load(open("anchors.json")); L = json.load(open("layout.json"))
rng = np.random.default_rng(3)
BPM = 104; beat = 60 / BPM; step = beat / 4

def sq(f, n, duty=0.5):
    ph = (np.arange(n) * f / SR) % 1.0
    return np.where(ph < duty, 1.0, -1.0)
def tri(f, n):
    ph = (np.arange(n) * f / SR) % 1.0
    return 4 * np.abs(ph - 0.5) - 1
def env(n, a=0.005, d=0.12, s=0.5, r=0.05):
    e = np.ones(n) * s; ai = int(a * SR); di = int(d * SR); ri = int(r * SR)
    e[:ai] = np.linspace(0, 1, ai) if ai else e[:ai]
    e[ai:ai + di] = np.linspace(1, s, len(e[ai:ai + di]))
    if ri: e[-ri:] *= np.linspace(1, 0, ri)
    return e
nf = lambda m: 440 * 2 ** ((m - 69) / 12)

music = np.zeros(N)
def put(x, t, g):
    s = int(t * SR); e = min(N, s + len(x))
    if s < N: music[s:e] += x[:e - s] * g
# progression Am - F - C - G (one bar each)
chords = [(57, [0, 3, 7]), (53, [0, 4, 7]), (48, [0, 4, 7]), (55, [0, 4, 7])]
bar = beat * 4; t = 0.0; bi = 0
while t < DUR:
    root, iv = chords[bi % 4]
    for k in range(16):
        ts = t + k * step
        # arpeggio (pulse 25%)
        m = root + 12 + iv[k % 3] + (12 if k % 6 >= 3 else 0)
        n = int(step * SR * 0.9); put(sq(nf(m), n, 0.25) * env(n, d=0.08, s=0.3, r=0.02), ts, 0.10)
        # bass (triangle) on 8ths
        if k % 2 == 0:
            n = int(step * 2 * SR * 0.95); put(tri(nf(root - 12 + (7 if k in (6, 14) else 0)), n) * env(n, d=0.1, s=0.7), ts, 0.32)
        # hats
        if k % 2 == 1:
            n = int(0.03 * SR); put(rng.standard_normal(n) * np.linspace(1, 0, n), ts, 0.05)
        # kick / snare
        if k in (0, 8):
            n = int(0.16 * SR); tt = np.arange(n) / SR
            put(np.sin(2 * np.pi * np.cumsum(120 * np.exp(-tt * 30) + 45) / SR) * np.exp(-tt * 18), ts, 0.5)
        if k in (4, 12):
            n = int(0.12 * SR); put(rng.standard_normal(n) * np.exp(-np.arange(n) / SR * 28), ts, 0.16)
    t += bar; bi += 1
# fade in / out
fi = int(1.5 * SR); music[:fi] *= np.linspace(0, 1, fi); fo = int(2.5 * SR); music[-fo:] *= np.linspace(1, 0, fo)
music = music / np.abs(music).max() * 10 ** (-20 / 20)

sfx = np.zeros(N)
def place(x, t, db):
    x = x / (np.abs(x).max() + 1e-9) * 10 ** (db / 20); s = int(max(0, t) * SR); e = min(N, s + len(x)); sfx[s:e] += x[:e - s]
def blip(f0=880, f1=1760, d=0.08):
    n = int(d * SR); f = np.linspace(f0, f1, n); return np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * np.linspace(1, 0, n)
def coin():
    a = sq(988, int(0.07 * SR), 0.5); b = sq(1319, int(0.35 * SR), 0.5) * np.linspace(1, 0, int(0.35 * SR)); return np.concatenate([a, b])
def boom():
    n = int(0.9 * SR); x = rng.standard_normal(n); hold = 12
    x = np.repeat(x[::hold], hold)[:n]  # bit-crushed noise
    return x * np.exp(-np.arange(n) / SR * 4)
def whoosh(d=0.35):
    n = int(d * SR); x = rng.standard_normal(n); x = np.convolve(x, np.ones(8) / 8, "same")
    return x * np.sin(np.linspace(0, np.pi, n)) ** 2
def powerup():
    out = [sq(nf(m), int(0.06 * SR), 0.5) for m in (60, 64, 67, 72, 76, 79, 84)]
    return np.concatenate(out) * 1.0
def gameover():
    out = [sq(nf(m), int(0.18 * SR), 0.5) * np.linspace(1, .3, int(0.18 * SR)) for m in (67, 63, 60, 55)]
    return np.concatenate(out)
for a, b, _ in L["cuts"]:
    place(whoosh(), a - 0.15, -18); place(whoosh(), b - 0.25, -21)
for a, b in L["depth"][1:]:
    place(blip(400, 1600, 0.15), a - 0.05, -22)
place(powerup(), 0.12, -20)
place(boom(), A["hit"], -12); place(gameover(), A["hit"] + 0.35, -20)
place(powerup(), A["pooling1"] - 0.5, -18)
place(coin(), A["reuse1"], -19); place(coin(), A["reuse2"], -18)
for k in ("1000a", "1000b", "20", "process", "one"):
    place(blip(), A[k], -24)
place(blip(600, 2400, 0.2), A["pgb"] - 0.2, -20)

def wav(name, x):
    st = np.stack([x, x], 1); w = wave.open(name, "wb"); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.clip(st, -1, 1) * 32767).astype(np.int16).tobytes()); w.close()
wav("music.wav", music); wav("sfx.wav", sfx)
