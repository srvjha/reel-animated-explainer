"""Glass rig sound: airy future-garage / chill-trap bed (half-time 140 bpm feel: soft 808 sub with glide, skippy
swung hats with rolls, rimshot on 3, warm detuned pad, a bell-like pluck motif), plus soft UI effects: focus
(page in, airy swell), blur (page out), chime, pop, tick, tap, swoosh, error, spark, type."""
import numpy as np
from scipy.signal import lfilter, butter
SR = 44100
nf = lambda m: 440 * 2 ** ((m - 69) / 12)

def lp(x, fc, order=2):
    b, a = butter(order, min(0.99, fc / (SR / 2)), 'low'); return lfilter(b, a, x)
def hp(x, fc, order=2):
    b, a = butter(order, min(0.99, fc / (SR / 2)), 'high'); return lfilter(b, a, x)
def bp(x, lo, hi):
    b, a = butter(2, [lo / (SR / 2), hi / (SR / 2)], 'band'); return lfilter(b, a, x)
def env(n, a=.01, r=.2):
    e = np.ones(n); ai = max(1, int(n * a)); ri = max(1, int(n * r)); e[:ai] = np.linspace(0, 1, ai); e[-ri:] = np.linspace(1, 0, ri); return e
def saw(f, n, det=0.0):
    t = np.arange(n) / SR; return sum(2 * ((t * f * (1 + d)) % 1) - 1 for d in (-det, 0, det)) / 3

PROG = [(50, [0, 3, 7, 10, 14]), (46, [0, 4, 7, 11, 14]), (43, [0, 4, 7, 9, 14]), (45, [0, 3, 7, 10, 15])]   # Dm9 Bbmaj9 G6/9 Am(add11)
MOTIF = [(0, 4), (3, 3), (6, 2), (10, 4), (12, 1)]   # (16th step, index into voicing)
def music(dur, rng, bpm=140):
    N = int(SR * dur) + 2 * SR; out = np.zeros(N); beat = 60 / bpm; bar = 4 * beat
    def put(x, t, g):
        s = int(t * SR); e = min(N, s + len(x))
        if 0 <= s < N: out[s:e] += x[:e - s] * g
    nb = int(np.ceil(dur / bar)) + 1
    for b in range(nb):
        t0 = b * bar; r, iv = PROG[(b // 2) % 4]; part = 0 if b < 4 else (2 if b >= nb - 4 else 1)
        if b % 2 == 0:
            n = int(bar * 2.3 * SR); p = sum(saw(nf(r + 12 + k), n, 0.005) for k in iv[:4])
            put(lp(p, 1100) * env(n, .25, .35), t0, 0.022)
        for s, k in MOTIF:
            if part == 0 and s > 6: continue
            n = int(beat * 1.5 * SR); tk = np.arange(n) / SR; f = nf(r + 24 + iv[k])
            x = np.sin(2 * np.pi * f * tk + 1.5 * np.exp(-tk * 7) * np.sin(2 * np.pi * f * 3.01 * tk)) * np.exp(-tk * 4)
            put(x, t0 + s * beat / 4, 0.03); put(x * 0.35, t0 + s * beat / 4 + beat * 0.75, 0.03)
        if part == 2 and b >= nb - 2: continue
        if part:
            # 808: on 1, the "and" of 2, and a pickup on bar ends; glide down
            for s, L in ((0, 1.8), (6, 0.9), (11, 0.7)) if b % 2 == 0 else ((0, 1.6), (7, 1.2)):
                n = int(beat * L * SR); tk = np.arange(n) / SR; f0 = nf(r - 12)
                f = f0 * (1 + 0.5 * np.exp(-tk * 30))
                x = np.tanh(1.6 * np.sin(2 * np.pi * np.cumsum(f) / SR)) * env(n, .01, .3)
                put(lp(x, 260), t0 + s * beat / 4, 0.36)
            # rim on beat 3 (half-time snare)
            n = int(.18 * SR); tk = np.arange(n) / SR
            put(bp(rng.standard_normal(n), 1500, 6000) * np.exp(-tk * 30) + 0.4 * np.sin(2 * np.pi * 820 * tk) * np.exp(-tk * 50), t0 + 2 * beat, 0.11)
        # swung hats with occasional rolls
        for s in range(16):
            if part == 0 and s % 4: continue
            sw = (0.022 if s % 2 else 0)
            n = int(.05 * SR); x = hp(rng.standard_normal(n), 8000) * np.exp(-np.arange(n) / SR * 100)
            put(x, t0 + s * beat / 4 + sw, 0.028 if s % 2 == 0 else 0.016)
            if part == 1 and b % 4 == 3 and s in (13, 14, 15):
                for q in range(2): put(x, t0 + s * beat / 4 + q * beat / 8, 0.015)
    out = out[:int(SR * dur)]; n = len(out)
    return out * np.minimum(1, np.arange(n) / (SR * 1.2)) * np.minimum(1, (n - np.arange(n)) / (SR * 2.0))

MUSIC_DB = -22

def focus(rng, d=.55):
    n = int(d * SR); tt = np.linspace(0, 1, n)
    return bp(rng.standard_normal(n), 800, 9000) * tt ** 2 * np.exp(-((tt - 0.8) * 4) ** 2) * 2 + np.sin(2 * np.pi * np.cumsum(500 + 700 * tt) / SR) * tt * (1 - tt) * 0.6
def blur(rng, d=.4):
    n = int(d * SR); tt = np.linspace(0, 1, n); return lp(rng.standard_normal(n), 2500) * np.sin(np.pi * tt) ** 2 * 0.8
def chime(rng, f=1567.98):
    n = int(1.1 * SR); tt = np.arange(n) / SR
    return (np.sin(2 * np.pi * f * tt) + 0.5 * np.sin(2 * np.pi * f * 2.0 * tt) * np.exp(-tt * 6)) * np.exp(-tt * 3.5) * 0.6
def pop(rng): n = int(.09 * SR); tt = np.arange(n) / SR; return np.sin(2 * np.pi * np.cumsum(780 * np.exp(-tt * 40) + 260) / SR) * np.exp(-tt * 45)
def tick(rng): n = int(.025 * SR); return bp(rng.standard_normal(n), 2500, 8000) * np.exp(-np.arange(n) / SR * 220)
def tap(rng): n = int(.06 * SR); tt = np.arange(n) / SR; return np.sin(2 * np.pi * 1200 * tt) * np.exp(-tt * 80)
def swoosh(rng, d=.35):
    n = int(d * SR); tt = np.linspace(0, 1, n); return bp(rng.standard_normal(n), 600, 7000) * np.sin(np.pi * tt) ** 3
def error(rng):
    n = int(.34 * SR); tt = np.arange(n) / SR
    return (np.sin(2 * np.pi * 330 * tt) + np.sin(2 * np.pi * 311 * tt)) * 0.35 * env(n, .02, .4)
def spark(rng, d=.5):
    n = int(d * SR); o = np.zeros(n)
    for s in np.sort(rng.integers(0, n - 1200, 14)):
        tk = np.arange(1200) / SR; o[s:s + 1200] += np.sin(2 * np.pi * (2500 + rng.random() * 2500) * tk) * np.exp(-tk * 80)
    return o
def typing(rng, d=.6):
    n = int(d * SR); o = np.zeros(n)
    for s in np.sort(rng.integers(0, n - 800, int(d * 20))): o[s:s + 800] += bp(rng.standard_normal(800), 2500, 7000) * np.exp(-np.arange(800) / SR * 300)
    return o
SFX = {'focus': focus, 'blur': blur, 'chime': chime, 'pop': pop, 'tick': tick, 'tap': tap, 'swoosh': swoosh, 'error': error, 'spark': spark, 'type': typing}
