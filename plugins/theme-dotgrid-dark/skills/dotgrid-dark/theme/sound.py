"""Dotgrid dark sound: dark minimal techno bed at 124 bpm (deep kick, rolling off-beat sub bass, closed hats,
a filtered minor stab that opens and closes, a dry rim), plus effects: dots (page in, granular sparkle),
blip, tick, pop, whoosh, thud, error, ding, spin (loop pointer), glitch."""
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

ROOTS = [45, 45, 43, 48]   # A minor-ish, moves every 4 bars
def music(dur, rng, bpm=124):
    N = int(SR * dur) + 2 * SR; out = np.zeros(N); beat = 60 / bpm; bar = 4 * beat
    def put(x, t, g):
        s = int(t * SR); e = min(N, s + len(x))
        if 0 <= s < N: out[s:e] += x[:e - s] * g
    nb = int(np.ceil(dur / bar)) + 1
    for b in range(nb):
        t0 = b * bar; r = ROOTS[(b // 4) % 4]; part = 0 if b < 4 else (2 if b >= nb - 4 else 1)
        cut = 600 + 1800 * (0.5 - 0.5 * np.cos(2 * np.pi * (b % 16) / 16))   # slow filter sweep over 16 bars
        if part == 2 and b >= nb - 2:
            pass
        for k in range(4):
            if not (part == 2 and b >= nb - 2):
                n = int(.4 * SR); tk = np.arange(n) / SR
                put(lp(np.sin(2 * np.pi * np.cumsum(140 * np.exp(-tk * 40) + 44) / SR) * np.exp(-tk * 7), 300), t0 + k * beat, 0.5 if part else 0.32)
            # rolling sub on the offbeat 16ths
            if part:
                for s in (2, 3):
                    n = int(beat / 4 * 0.9 * SR); tk = np.arange(n) / SR
                    put(lp(saw(nf(r - 24), n), 180) * env(n, .02, .4), t0 + k * beat + s * beat / 4, 0.32)
            # closed hats on 8ths, open on offbeat
            n = int(.05 * SR); put(hp(rng.standard_normal(n), 8000) * np.exp(-np.arange(n) / SR * 90), t0 + k * beat, 0.025)
            n = int(.16 * SR); put(hp(rng.standard_normal(n), 7000) * np.exp(-np.arange(n) / SR * 22), t0 + k * beat + beat / 2, 0.04 if part else 0.025)
            if part == 1 and k in (1, 3):
                n = int(.08 * SR); put(bp(rng.standard_normal(n), 1500, 4000) * np.exp(-np.arange(n) / SR * 60), t0 + k * beat + (beat / 4 if k == 3 and b % 2 else 0), 0.06)
        # filtered minor stab, syncopated
        for s in (3, 10) if b % 2 == 0 else (6, 14):
            n = int(beat * 0.6 * SR); tk = np.arange(n) / SR
            c = sum(saw(nf(r + iv), n, 0.006) for iv in (0, 3, 7, 10))
            put(lp(c, cut) * np.exp(-tk * 7), t0 + s * beat / 4, 0.05)
        # pad drone
        if b % 4 == 0:
            n = int(bar * 4.2 * SR); p = sum(saw(nf(r + 12 + iv), n, 0.003) for iv in (0, 7))
            put(lp(p, 700) * env(n, .2, .3), t0, 0.02)
    out = out[:int(SR * dur)]; n = len(out)
    return out * np.minimum(1, np.arange(n) / (SR * 1.0)) * np.minimum(1, (n - np.arange(n)) / (SR * 2.0))

MUSIC_DB = -22

def dots(rng, d=.45):
    n = int(d * SR); o = np.zeros(n)
    for s in np.sort(rng.integers(0, n - 1500, 26)):
        f = 1800 + rng.random() * 3000; tk = np.arange(1500) / SR; o[s:s + 1500] += np.sin(2 * np.pi * f * tk) * np.exp(-tk * 90)
    return o * np.linspace(0.4, 1, n)
def blip(rng, f=1760, d=.07): n = int(d * SR); return np.sin(2 * np.pi * f * np.arange(n) / SR) * env(n, .05, .5)
def tick(rng): n = int(.025 * SR); return bp(rng.standard_normal(n), 2500, 8000) * np.exp(-np.arange(n) / SR * 220)
def pop(rng): n = int(.09 * SR); tt = np.arange(n) / SR; return np.sin(2 * np.pi * np.cumsum(800 * np.exp(-tt * 40) + 260) / SR) * np.exp(-tt * 45)
def whoosh(rng, d=.4):
    n = int(d * SR); tt = np.linspace(0, 1, n); return bp(rng.standard_normal(n), 300, 5000) * np.sin(np.pi * tt) ** 2
def thud(rng):
    n = int(.5 * SR); tt = np.arange(n) / SR
    return np.sin(2 * np.pi * np.cumsum(100 * np.exp(-tt * 12) + 40) / SR) * np.exp(-tt * 8)
def error(rng):
    n = int(.36 * SR); tt = np.arange(n) / SR
    return np.sign(np.sin(2 * np.pi * 150 * tt)) * 0.4 * env(n, .02, .3)
def ding(rng, f=1318.5):
    n = int(.9 * SR); tt = np.arange(n) / SR
    a = np.sin(2 * np.pi * f * tt) * np.exp(-tt * 5); b = np.sin(2 * np.pi * f * 1.5 * tt) * np.exp(-tt * 5)
    s = int(.1 * SR); o = a * .55; o[s:] += b[:n - s] * .55; return o
def spin(rng, d=.6):
    n = int(d * SR); tt = np.arange(n) / SR
    return bp(rng.standard_normal(n), 800, 6000) * (0.5 + 0.5 * np.sin(2 * np.pi * (6 + 10 * tt / d) * tt)) * env(n, .1, .4)
def glitch(rng, d=.3):
    n = int(d * SR); o = np.zeros(n); seg = int(.02 * SR)
    for s in range(0, n - seg, seg):
        if rng.random() < .6: o[s:s + seg] = np.sign(np.sin(2 * np.pi * (200 + rng.random() * 1500) * np.arange(seg) / SR)) * 0.4
    return lp(o, 6000)
SFX = {'dots': dots, 'blip': blip, 'tick': tick, 'pop': pop, 'whoosh': whoosh, 'thud': thud, 'error': error, 'ding': ding, 'spin': spin, 'glitch': glitch}
