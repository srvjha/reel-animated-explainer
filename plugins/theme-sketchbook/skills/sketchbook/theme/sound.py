"""Sketchbook sound: lo-fi bed (soft Rhodes chords, dusty boom-bap ~82 bpm, upright-ish bass, vinyl crackle, tape wobble)
plus paper effects: flip (page turn), scribble (pencil), pop, erase, ding, tick, thud, crumple."""
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

def rhodes(f, n, vel=1.0):
    tt = np.arange(n) / SR
    m = 1.4 * np.exp(-tt * 3.5) * np.sin(2 * np.pi * f * tt)
    x = np.sin(2 * np.pi * f * tt + m) + 0.25 * np.sin(2 * np.pi * 2 * f * tt) * np.exp(-tt * 2) + 0.12 * np.sin(2 * np.pi * 7 * f * tt) * np.exp(-tt * 18)
    x *= np.exp(-tt * 1.1) * (1 + 0.12 * np.sin(2 * np.pi * 5.2 * tt))   # gentle tremolo
    return x * env(n, .004, .25) * vel

# jazzy ii-V-I-vi style progressions (root midi, voicing)
PROG_A = [(50, [0, 3, 7, 10, 14]), (55, [0, 4, 7, 10, 14]), (48, [0, 4, 7, 11, 14]), (45, [0, 3, 7, 10, 14])]
PROG_B = [(53, [0, 4, 7, 11, 14]), (52, [0, 3, 7, 10]), (50, [0, 3, 7, 10, 14]), (55, [0, 4, 7, 10, 13])]
ORDER = [('intro', 4, PROG_A), ('a', 8, PROG_A), ('b', 8, PROG_B), ('a', 8, PROG_A), ('b', 8, PROG_B), ('a', 8, PROG_A)]

def music(dur, rng, bpm=82, plan=None):
    N = int(SR * dur) + 2 * SR; out = np.zeros(N); beat = 60 / bpm; bar = beat * 4; sw = beat / 4 * 0.18   # swing
    def put(x, t, g):
        s = int(t * SR); e = min(N, s + len(x))
        if 0 <= s < N: out[s:e] += x[:e - s] * g
    kick = lambda: (lambda tk: lp(np.sin(2 * np.pi * np.cumsum(95 * np.exp(-tk * 25) + 48) / SR) * np.exp(-tk * 7), 900))(np.arange(int(.4 * SR)) / SR)
    snare = lambda: (lambda n: lp(bp(rng.standard_normal(n), 700, 4500) * np.exp(-np.arange(n) / SR * 16), 3500) + 0.25 * np.sin(2 * np.pi * 180 * np.arange(n) / SR) * np.exp(-np.arange(n) / SR * 25))(int(.3 * SR))
    hat = lambda d=.035: (lambda n: lp(hp(rng.standard_normal(n), 6000), 9000) * np.exp(-np.arange(n) / SR * (3 / d)))(int(.12 * SR))
    nbars = int(np.ceil(dur / bar)) + 1; bars = []
    for name, n, prog in (plan or ORDER): bars += [(name, i, n, prog) for i in range(n)]
    while len(bars) < nbars: bars += [('a', i, 8, PROG_A) for i in range(8)]
    for b in range(nbars):
        name, bi, sl, prog = bars[b]; t0 = b * bar; r, iv = prog[b % 4]
        outro = b >= nbars - 3
        # chords: one long hit + a soft re-hit on the "and" of 3
        n = int(bar * 1.15 * SR)
        ch = sum(rhodes(nf(r + 12 + k), n, 0.9 - 0.08 * j) for j, k in enumerate(iv))
        put(ch, t0 + 0.01 * rng.random(), 0.05)
        if name != 'intro' and b % 2: put(sum(rhodes(nf(r + 12 + k), int(beat * 1.5 * SR), 0.6) for k in iv[1:4]), t0 + beat * 2.5 + sw, 0.035)
        # little melody on top every other bar
        if name in ('a', 'b') and b % 2 == 0:
            mel = [iv[-1], iv[-2], iv[2], iv[-2]] if name == 'a' else [iv[2], iv[3 % len(iv)], iv[-1], iv[3 % len(iv)]]
            for k, m in enumerate(mel):
                if k == 2 and bi % 4 == 2: continue
                put(rhodes(nf(r + 24 + m), int(beat * 0.9 * SR), 0.7), t0 + k * beat + (sw if k % 2 else 0), 0.028)
        if name == 'intro' or outro: continue
        # dusty boom-bap
        kpat = [0, 7, 10] if bi % 2 == 0 else [0, 3, 10]
        for k in range(16):
            ts = t0 + k * beat / 4 + (sw if k % 2 else 0)
            if k in kpat: put(kick(), ts, 0.42)
            if k in (4, 12): put(snare(), ts, 0.16)
            if k % 2 == 0: put(hat(), ts, 0.032 if k % 4 == 0 else 0.022)
        # bass
        for k, (st, ln, iv_) in enumerate([(0, 1.5, 0), (6, 0.5, 7), (8, 1.5, 0), (14, 0.5, 10 if len(iv) > 3 else 7)]):
            d = beat / 4 * ln * 2.2; nn = int(d * SR); tk = np.arange(nn) / SR
            f = nf(r - 12 + iv_); x = (np.sin(2 * np.pi * f * tk) + 0.3 * np.sin(2 * np.pi * 2 * f * tk)) * np.exp(-tk * 3) * env(nn, .01, .3)
            put(lp(x, 500), t0 + st * beat / 4 + (sw if st % 2 else 0), 0.3)
    out = out[:int(SR * dur)]
    # tape wobble (slight pitch drift via resampling index)
    idx = np.arange(len(out)) + 0.0025 * SR * np.sin(2 * np.pi * 0.35 * np.arange(len(out)) / SR)
    out = np.interp(np.clip(idx, 0, len(out) - 1), np.arange(len(out)), out)
    out = lp(out, 5200)   # warm, dusty
    # vinyl crackle + hiss
    n = len(out); cr = np.zeros(n); pos = rng.integers(0, n, int(dur * 9)); cr[pos] = rng.standard_normal(len(pos)) * 0.6
    cr = hp(cr, 1500) + 0.008 * lp(hp(rng.standard_normal(n), 3000), 9000)
    fade = np.minimum(1, np.arange(n) / (SR * 1.2)) * np.minimum(1, (n - np.arange(n)) / (SR * 1.5))
    return (out + cr * 0.05) * fade

MUSIC_DB = -22

def flip(rng, d=.42):
    n = int(d * SR); tt = np.linspace(0, 1, n)
    x = bp(rng.standard_normal(n), 600, 7000) * (np.sin(np.pi * tt) ** 1.5) * (0.6 + 0.4 * np.sin(2 * np.pi * 14 * tt) ** 2)
    sn = int(.05 * SR); x[-sn:] += lp(rng.standard_normal(sn), 1500) * np.exp(-np.arange(sn) / SR * 60) * 1.4   # paper slap
    return x
def scribble(rng, d=.6):
    n = int(d * SR); tt = np.arange(n) / SR
    am = 0.5 + 0.5 * np.abs(np.sin(2 * np.pi * (7 + 3 * rng.random()) * tt + 3 * np.sin(2 * np.pi * 1.3 * tt)))
    return bp(rng.standard_normal(n), 2500, 8000) * am * env(n, .05, .2)
def pop(rng): n = int(.09 * SR); tt = np.arange(n) / SR; return np.sin(2 * np.pi * np.cumsum(700 * np.exp(-tt * 40) + 260) / SR) * np.exp(-tt * 45)
def erase(rng, d=.5):
    n = int(d * SR); tt = np.arange(n) / SR
    return bp(rng.standard_normal(n), 300, 2500) * (0.5 + 0.5 * np.sin(2 * np.pi * 9 * tt) ** 2) * env(n, .05, .3)
def ding(rng, f=1046.5):
    n = int(1.0 * SR); tt = np.arange(n) / SR
    a = np.sin(2 * np.pi * f * tt) * np.exp(-tt * 4); b = np.sin(2 * np.pi * f * 1.5 * tt) * np.exp(-tt * 4)
    s = int(.1 * SR); out = a * 0.55; out[s:] += b[:n - s] * 0.55; return out
def tick(rng): n = int(.03 * SR); return bp(rng.standard_normal(n), 1500, 6000) * np.exp(-np.arange(n) / SR * 200)
def thud(rng):
    n = int(.5 * SR); tt = np.arange(n) / SR
    return np.sin(2 * np.pi * np.cumsum(110 * np.exp(-tt * 12) + 45) / SR) * np.exp(-tt * 8) + 0.2 * lp(rng.standard_normal(n), 900) * np.exp(-tt * 25)
def error(rng):
    n = int(.4 * SR); tt = np.arange(n) / SR
    return (np.sin(2 * np.pi * 220 * tt) + np.sin(2 * np.pi * 233 * tt)) * 0.4 * env(n, .02, .4) * (tt < .16) + (np.sin(2 * np.pi * 196 * tt) + np.sin(2 * np.pi * 207 * tt)) * 0.4 * env(n, .02, .4) * (tt >= .18)
def crumple(rng, d=.5):
    n = int(d * SR); x = np.zeros(n); pos = rng.integers(0, n, 260); x[pos] = rng.standard_normal(260)
    return bp(lfilter([1], [1, -0.6], x), 800, 7000) * env(n, .05, .4) * 3
SFX = {'flip': flip, 'scribble': scribble, 'pop': pop, 'erase': erase, 'ding': ding, 'tick': tick, 'thud': thud, 'error': error, 'crumple': crumple}
