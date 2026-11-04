"""Night blueprint sound: retro synthwave bed (~100 bpm: gated pad, driving 8th-note octave bass, gated snare on 2/4,
bright arpeggio with delay, soft tom fills), plus effects: scan (page wipe), draw (pen line), blip, tick, pop, whoosh,
ding, error, rise (spike), lock."""
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

PROG = [(45, [0, 3, 7, 12]), (41, [0, 4, 7, 12]), (48, [0, 4, 7, 12]), (43, [0, 4, 7, 12])]   # Am F C G
def music(dur, rng, bpm=100):
    N = int(SR * dur) + 2 * SR; out = np.zeros(N); beat = 60 / bpm; bar = 4 * beat
    def put(x, t, g):
        s = int(t * SR); e = min(N, s + len(x))
        if 0 <= s < N: out[s:e] += x[:e - s] * g
    nb = int(np.ceil(dur / bar)) + 1
    for b in range(nb):
        t0 = b * bar; r, iv = PROG[b % 4]; part = 0 if b < 2 else (2 if b >= nb - 3 else 1)
        # pad (wide detuned saws)
        n = int(bar * 1.05 * SR); p = sum(saw(nf(r + 12 + k), n, 0.007) for k in iv)
        put(lp(p, 1600 if part else 900) * env(n, .2, .2), t0, 0.022)
        if part == 2 and b >= nb - 2: continue
        # octave 8th bass
        for k in range(8):
            if part == 0 and k % 2: continue
            n = int(beat / 2 * 0.85 * SR); m = r - 24 + (12 if k % 2 else 0)
            put(lp(saw(nf(m), n, 0.004), 700) * env(n, .01, .3), t0 + k * beat / 2, 0.2)
        if part:
            for k in range(4):
                n = int(.35 * SR); tk = np.arange(n) / SR
                put(np.sin(2 * np.pi * np.cumsum(120 * np.exp(-tk * 30) + 48) / SR) * np.exp(-tk * 8), t0 + k * beat, 0.42)
                if k in (1, 3):
                    n = int(.28 * SR); tk = np.arange(n) / SR
                    sn = bp(rng.standard_normal(n), 700, 7000) * (tk < .2) + 0.3 * np.sin(2 * np.pi * 200 * tk) * np.exp(-tk * 20)
                    put(sn * np.exp(-tk * 4), t0 + k * beat, 0.16)
                for h in (0.5,):
                    n = int(.05 * SR); put(hp(rng.standard_normal(n), 8000) * np.exp(-np.arange(n) / SR * 90), t0 + k * beat + h * beat, 0.035)
            # arp with delay
            pat = [0, 1, 2, 3, 2, 1, 2, 3]
            for k in range(8):
                n = int(beat / 2 * 0.8 * SR); tk = np.arange(n) / SR; f = nf(r + 24 + iv[pat[k]])
                x = lp(saw(f, n, 0.002), 3500) * np.exp(-tk * 7)
                put(x, t0 + k * beat / 2, 0.035); put(x, t0 + k * beat / 2 + beat * 0.75, 0.015)
            if b % 8 == 7:
                for j, m in enumerate((50, 47, 43)):
                    n = int(.3 * SR); tk = np.arange(n) / SR
                    put(np.sin(2 * np.pi * np.cumsum(nf(m) * (1 + np.exp(-tk * 20))) / SR) * np.exp(-tk * 9), t0 + 3 * beat + j * beat / 3, 0.18)
    out = out[:int(SR * dur)]; n = len(out)
    return out * np.minimum(1, np.arange(n) / (SR * 1.0)) * np.minimum(1, (n - np.arange(n)) / (SR * 2.0))

MUSIC_DB = -22

def scan(rng, d=.45):
    n = int(d * SR); tt = np.arange(n) / SR
    return np.sin(2 * np.pi * np.cumsum(300 + 2600 * tt / d) / SR) * np.sin(np.pi * tt / d) * 0.5 + 0.3 * bp(rng.standard_normal(n), 2000, 9000) * np.sin(np.pi * tt / d) ** 2
def draw(rng, d=.35):
    n = int(d * SR); tt = np.arange(n) / SR; return bp(rng.standard_normal(n), 3000, 9000) * env(n, .05, .3) * (0.6 + 0.4 * np.sin(2 * np.pi * 40 * tt))
def blip(rng, f=1760, d=.07): n = int(d * SR); return np.sin(2 * np.pi * f * np.arange(n) / SR) * env(n, .05, .5)
def tick(rng): n = int(.025 * SR); return bp(rng.standard_normal(n), 2500, 8000) * np.exp(-np.arange(n) / SR * 220)
def pop(rng): n = int(.09 * SR); tt = np.arange(n) / SR; return np.sin(2 * np.pi * np.cumsum(800 * np.exp(-tt * 40) + 260) / SR) * np.exp(-tt * 45)
def whoosh(rng, d=.4):
    n = int(d * SR); tt = np.linspace(0, 1, n); return bp(rng.standard_normal(n), 300, 5000) * np.sin(np.pi * tt) ** 2
def ding(rng, f=1318.5):
    n = int(.9 * SR); tt = np.arange(n) / SR
    a = np.sin(2 * np.pi * f * tt) * np.exp(-tt * 5); b = np.sin(2 * np.pi * f * 1.5 * tt) * np.exp(-tt * 5)
    s = int(.1 * SR); o = a * .55; o[s:] += b[:n - s] * .55; return o
def error(rng):
    n = int(.36 * SR); tt = np.arange(n) / SR
    return np.sign(np.sin(2 * np.pi * 150 * tt)) * 0.4 * env(n, .02, .3)
def rise(rng, d=1.2):
    n = int(d * SR); tt = np.arange(n) / SR
    return (bp(rng.standard_normal(n), 400, 6000) * 0.5 + np.sin(2 * np.pi * np.cumsum(150 * 8 ** (tt / d)) / SR) * 0.5) * (tt / d) ** 2
def lock(rng):
    n = int(.25 * SR); tt = np.arange(n) / SR; s = int(.06 * SR)
    a = hp(rng.standard_normal(n), 2500) * np.exp(-tt * 80); b = np.sin(2 * np.pi * 900 * tt) * np.exp(-tt * 40); o = a * .6; o[s:] += b[:n - s] * .5; return o
SFX = {'scan': scan, 'draw': draw, 'blip': blip, 'tick': tick, 'pop': pop, 'whoosh': whoosh, 'ding': ding, 'error': error, 'rise': rise, 'lock': lock}
