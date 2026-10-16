"""Receipt tape sound: minimal ambient electronic bed (warm pad, soft sub pulse, glassy plucked arpeggio, muted clicks)
at ~100 bpm, plus office/printer effects: print (thermal printer chatter), tear, stamp, beep (POS beep), powerdown,
powerup, tick, pop, whoosh, error."""
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
def tri(f, n, ph=0.0):
    t = np.arange(n) / SR; return 2 * np.abs(2 * ((t * f + ph) % 1) - 1) - 1

PROG = [(45, [0, 7, 12, 15, 19]), (41, [0, 7, 12, 16, 19]), (48, [0, 7, 11, 16, 19]), (43, [0, 7, 10, 14, 17])]   # Am9-ish, Fmaj, Cmaj7, G
ARP = [0, 2, 3, 4, 2, 3, 1, 3]

def music(dur, rng, bpm=100):
    N = int(SR * dur) + 2 * SR; out = np.zeros(N); beat = 60 / bpm; bar = beat * 4
    def put(x, t, g):
        s = int(t * SR); e = min(N, s + len(x))
        if 0 <= s < N: out[s:e] += x[:e - s] * g
    nbars = int(np.ceil(dur / bar)) + 1
    for b in range(nbars):
        t0 = b * bar; r, iv = PROG[(b // 2) % 4]; sect = 0 if b < 4 else (1 if b < 20 else (2 if b < nbars - 4 else 3))
        # pad: detuned triangles, slow swell, one per 2 bars
        if b % 2 == 0:
            n = int(bar * 2.2 * SR); p = sum(tri(nf(r + 12 + k) * (1 + d), n, rng.random()) for k in iv[:4] for d in (-0.003, 0.003))
            put(lp(p, 1300) * env(n, .3, .35), t0, 0.022)
        if sect == 3 and b >= nbars - 2: continue
        # sub pulse on every beat (soft), skipped in intro
        for k in range(4):
            if sect == 0 and k % 2: continue
            n = int(beat * 0.9 * SR); tk = np.arange(n) / SR
            x = np.sin(2 * np.pi * nf(r - 12) * tk) * np.exp(-tk * 5) * env(n, .02, .3)
            put(x, t0 + k * beat, 0.16 if sect else 0.1)
        # soft kick + click hats in the middle sections
        if sect in (1, 2):
            for k in (0, 2):
                n = int(.3 * SR); tk = np.arange(n) / SR
                put(np.sin(2 * np.pi * np.cumsum(90 * np.exp(-tk * 30) + 45) / SR) * np.exp(-tk * 10), t0 + k * beat, 0.32)
            for k in range(8):
                n = int(.04 * SR); x = hp(rng.standard_normal(n), 6000) * np.exp(-np.arange(n) / SR * 120)
                put(x, t0 + k * beat / 2 + beat / 4, 0.03 if k % 2 else 0.018)
            if sect == 2:
                for k in (1, 3):
                    n = int(.2 * SR); x = bp(rng.standard_normal(n), 1200, 6000) * np.exp(-np.arange(n) / SR * 25)
                    put(x, t0 + k * beat, 0.06)   # rim-ish snap
        # glassy pluck arpeggio (8ths), sparser in intro/outro
        for k in range(8):
            if sect in (0, 3) and k % 2: continue
            n = int(beat * 1.2 * SR); tk = np.arange(n) / SR; f = nf(r + 24 + iv[ARP[k] % len(iv)])
            x = (np.sin(2 * np.pi * f * tk + 1.2 * np.exp(-tk * 9) * np.sin(2 * np.pi * f * 2 * tk))) * np.exp(-tk * 5)
            g = 0.035 if k % 4 == 0 else 0.022
            put(x, t0 + k * beat / 2, g); put(x * 0.4, t0 + k * beat / 2 + beat * 0.75, g)   # dotted echo
    out = out[:int(SR * dur)]; n = len(out)
    fade = np.minimum(1, np.arange(n) / (SR * 1.5)) * np.minimum(1, (n - np.arange(n)) / (SR * 2.0))
    return out * fade

MUSIC_DB = -22

def printer(rng, d=.7):
    n = int(d * SR); tt = np.arange(n) / SR
    chat = (np.sin(2 * np.pi * 38 * tt) > 0.2).astype(float) * 0.7 + 0.3
    x = bp(rng.standard_normal(n), 1500, 6500) * chat + 0.25 * np.sign(np.sin(2 * np.pi * 760 * tt)) * chat * 0.4
    return lp(x, 7000) * env(n, .03, .15)
def tear(rng, d=.32):
    n = int(d * SR); tt = np.linspace(0, 1, n); x = np.zeros(n); pos = rng.integers(0, n, 400); x[pos] = rng.standard_normal(400)
    return bp(lfilter([1], [1, -0.7], x) + 0.3 * rng.standard_normal(n), 1000, 8000) * np.sin(np.pi * tt) ** 0.7
def stamp(rng):
    n = int(.4 * SR); tt = np.arange(n) / SR
    return np.sin(2 * np.pi * np.cumsum(150 * np.exp(-tt * 35) + 55) / SR) * np.exp(-tt * 16) + 0.5 * lp(rng.standard_normal(n), 1500) * np.exp(-tt * 40)
def beep(rng, f=2350):
    n = int(.12 * SR); return np.sin(2 * np.pi * f * np.arange(n) / SR) * env(n, .05, .2)
def powerdown(rng, d=1.0):
    n = int(d * SR); tt = np.arange(n) / SR
    f = 420 * np.exp(-tt * 3.2) + 30; x = np.sin(2 * np.pi * np.cumsum(f) / SR) * (1 - tt / d) ** 1.5
    th = np.sin(2 * np.pi * np.cumsum(70 * np.exp(-tt * 8) + 35) / SR) * np.exp(-tt * 9)
    return x * 0.7 + th * 0.8
def powerup(rng, d=.8):
    n = int(d * SR); tt = np.arange(n) / SR
    f = 60 + 500 * (tt / d) ** 2; return np.sin(2 * np.pi * np.cumsum(f) / SR) * (tt / d) * env(n, .02, .1) * 0.8 + 0.15 * hp(rng.standard_normal(n), 4000) * (tt / d)
def tick(rng): n = int(.025 * SR); return bp(rng.standard_normal(n), 2000, 7000) * np.exp(-np.arange(n) / SR * 220)
def pop(rng): n = int(.09 * SR); tt = np.arange(n) / SR; return np.sin(2 * np.pi * np.cumsum(800 * np.exp(-tt * 40) + 280) / SR) * np.exp(-tt * 45)
def whoosh(rng, d=.45):
    n = int(d * SR); tt = np.linspace(0, 1, n); return bp(rng.standard_normal(n), 300, 5000) * np.sin(np.pi * tt) ** 2
def error(rng):
    n = int(.36 * SR); tt = np.arange(n) / SR
    return np.sign(np.sin(2 * np.pi * 150 * tt)) * 0.4 * env(n, .02, .3)
def ding(rng, f=1318.5):
    n = int(.9 * SR); tt = np.arange(n) / SR
    a = np.sin(2 * np.pi * f * tt) * np.exp(-tt * 5); b = np.sin(2 * np.pi * f * 1.5 * tt) * np.exp(-tt * 5)
    s = int(.1 * SR); out = a * .55; out[s:] += b[:n - s] * .55; return out
SFX = {'print': printer, 'tear': tear, 'stamp': stamp, 'beep': beep, 'powerdown': powerdown, 'powerup': powerup, 'tick': tick, 'pop': pop, 'whoosh': whoosh, 'error': error, 'ding': ding}
