"""Mono map sound: night-drive minimal bed (~92 bpm: round kick on 1 and 3, rim on 4, turn-indicator tick hats,
deep sub, soft electric-piano minor chords with tremolo, sparse filtered plucks), plus effects: sheet (bottom sheet slides
up), drop (sheet slides down), ping (location ping), tap (phone tap), hex (wooden blip), sonar (ring search sweep),
match (two-note confirm), whoosh, pop, tick."""
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

PROG = [(45, [0, 3, 7, 10]), (41, [0, 4, 7, 11]), (43, [0, 4, 7, 10]), (40, [0, 3, 7, 10])]   # Am7 Fmaj7 G7 Em7
def epiano(f, n):
    t = np.arange(n) / SR
    x = np.sin(2 * np.pi * f * t + 0.9 * np.sin(2 * np.pi * f * 2 * t) * np.exp(-t * 3)) * np.exp(-t * 1.1)
    return x * (0.85 + 0.15 * np.sin(2 * np.pi * 4.5 * t))
def music(dur, rng, bpm=92):
    N = int(SR * dur) + 2 * SR; out = np.zeros(N); beat = 60 / bpm; bar = 4 * beat
    def put(x, t, g):
        s = int(t * SR); e = min(N, s + len(x))
        if 0 <= s < N: out[s:e] += x[:e - s] * g
    nb = int(np.ceil(dur / bar)) + 1
    for b in range(nb):
        t0 = b * bar; r, iv = PROG[b % 4]; part = 0 if b < 2 else (2 if b >= nb - 3 else 1)
        n = int(bar * 1.1 * SR)
        chord = sum(epiano(nf(r + 12 + k), n) for k in iv)
        put(lp(chord, 2400) * env(n, .01, .25), t0, 0.05)
        if part == 2 and b >= nb - 2: continue
        n = int(bar * 0.95 * SR); ts = np.arange(n) / SR
        put(np.sin(2 * np.pi * nf(r - 12) * ts) * env(n, .02, .2), t0, 0.16 if part else 0.08)
        for k in range(16):   # indicator-style tick hats on 8ths, ghost 16ths
            if k % 2 and (part == 0 or rng.random() < 0.6): continue
            m = int(.03 * SR); put(bp(rng.standard_normal(m), 4000, 11000) * np.exp(-np.arange(m) / SR * 160), t0 + k * beat / 4, 0.05 if k % 4 == 2 else 0.025)
        if part:
            for k in (0, 2):
                m = int(.4 * SR); tk = np.arange(m) / SR
                put(np.sin(2 * np.pi * np.cumsum(90 * np.exp(-tk * 25) + 45) / SR) * np.exp(-tk * 7), t0 + k * beat, 0.5)
            m = int(.08 * SR); tk = np.arange(m) / SR
            put((np.sin(2 * np.pi * 1700 * tk) * 0.6 + bp(rng.standard_normal(m), 1500, 5000) * 0.5) * np.exp(-tk * 60), t0 + 3 * beat, 0.12)
            for k in range(8):
                if rng.random() < 0.55: continue
                m = int(.25 * SR); tk = np.arange(m) / SR; f = nf(r + 24 + iv[rng.integers(0, 4)])
                x = lp(np.sign(np.sin(2 * np.pi * f * tk)) * 0.5, 1800) * np.exp(-tk * 14)
                put(x, t0 + k * beat / 2, 0.03); put(x, t0 + k * beat / 2 + beat * 0.75, 0.012)
    out = out[:int(SR * dur)]; n = len(out)
    return out * np.minimum(1, np.arange(n) / (SR * 1.0)) * np.minimum(1, (n - np.arange(n)) / (SR * 2.0))
MUSIC_DB = -22

def sheet(rng, d=.42):
    n = int(d * SR); tt = np.linspace(0, 1, n)
    return bp(rng.standard_normal(n), 400, 4000) * np.sin(np.pi * tt) ** 2 * (0.4 + tt) + 0.2 * np.sin(2 * np.pi * np.cumsum(200 + 500 * tt) / SR) * np.sin(np.pi * tt)
def drop(rng, d=.3):
    n = int(d * SR); tt = np.linspace(0, 1, n)
    return bp(rng.standard_normal(n), 300, 3000) * np.sin(np.pi * tt) ** 2 * (1.4 - tt)
def ping(rng):
    n = int(.6 * SR); tt = np.arange(n) / SR
    return (np.sin(2 * np.pi * 1568 * tt) + 0.4 * np.sin(2 * np.pi * 3136 * tt)) * np.exp(-tt * 7)
def tap(rng): n = int(.04 * SR); tt = np.arange(n) / SR; return (np.sin(2 * np.pi * 2200 * tt) * 0.6 + hp(rng.standard_normal(n), 3000) * 0.3) * np.exp(-tt * 140)
def hex(rng, f=880):
    n = int(.18 * SR); tt = np.arange(n) / SR
    return (np.sin(2 * np.pi * f * tt) + 0.3 * np.sin(2 * np.pi * f * 3.9 * tt) * np.exp(-tt * 40)) * np.exp(-tt * 28)
def sonar(rng, d=1.0):
    n = int(d * SR); tt = np.arange(n) / SR
    return np.sin(2 * np.pi * 1100 * tt) * np.exp(-tt * 4) * (1 + 0.3 * np.sin(2 * np.pi * 7 * tt))
def match(rng):
    n = int(.7 * SR); tt = np.arange(n) / SR; s = int(.11 * SR)
    a = np.sin(2 * np.pi * 1046.5 * tt) * np.exp(-tt * 6); b = np.sin(2 * np.pi * 1568 * tt) * np.exp(-tt * 5)
    o = a * .5; o[s:] += b[:n - s] * .55; return o
def whoosh(rng, d=.4):
    n = int(d * SR); tt = np.linspace(0, 1, n); return bp(rng.standard_normal(n), 300, 5000) * np.sin(np.pi * tt) ** 2
def pop(rng): n = int(.09 * SR); tt = np.arange(n) / SR; return np.sin(2 * np.pi * np.cumsum(800 * np.exp(-tt * 40) + 260) / SR) * np.exp(-tt * 45)
def tick(rng): n = int(.025 * SR); return bp(rng.standard_normal(n), 2500, 8000) * np.exp(-np.arange(n) / SR * 220)
SFX = {'sheet': sheet, 'drop': drop, 'ping': ping, 'tap': tap, 'hex': hex, 'sonar': sonar, 'match': match, 'whoosh': whoosh, 'pop': pop, 'tick': tick}
