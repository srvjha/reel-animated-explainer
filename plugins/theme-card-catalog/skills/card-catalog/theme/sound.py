"""Card catalog sound: quiet library jazz trio (swing ~96 bpm: soft piano comping, walking upright bass, brushed snare,
ride cymbal), plus desk effects: card (index card slide), typewriter (key clacks), bell (typewriter ding), drawer (wooden
drawer slide + thunk), snip (scissors), page (paper flip), pop, tick, error, chime."""
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

def piano(f, n, vel=1.0):
    tt = np.arange(n) / SR
    x = sum(np.sin(2 * np.pi * f * h * tt) * np.exp(-tt * (1.6 + h * 0.9)) / h ** 1.3 for h in (1, 2, 3, 4, 5))
    return x * env(n, .003, .2) * vel

# ii-V-I-VI in F, shell voicings (root, 3rd/7th + 9th)
PROG = [(55, [10, 15, 21]), (48, [10, 16, 21]), (53, [11, 16, 21]), (50, [10, 16, 20])]   # Gm9 C13 Fmaj9 D7b13
def music(dur, rng, bpm=96):
    N = int(SR * dur) + 2 * SR; out = np.zeros(N); beat = 60 / bpm; bar = 4 * beat; sw = beat * 0.66
    def put(x, t, g):
        s = int(t * SR); e = min(N, s + len(x))
        if 0 <= s < N: out[s:e] += x[:e - s] * g
    nb = int(np.ceil(dur / bar)) + 1
    for b in range(nb):
        t0 = b * bar; r, iv = PROG[b % 4]; nxt = PROG[(b + 1) % 4][0]; intro = b < 2; outro = b >= nb - 3
        # piano comping: Charleston-ish rhythm
        hits = [(0, 1.2), (1 + 0.66, 0.9)] if b % 2 == 0 else [(0.66, 1.0), (2, 0.8), (3 + 0.66, 0.6)]
        for pos, L in hits:
            n = int(beat * L * 1.3 * SR)
            put(sum(piano(nf(r + k), n, 0.8 - 0.1 * j) for j, k in enumerate(iv)), t0 + pos * beat, 0.045)
        # a little melody fill every 4th bar
        if b % 4 == 3 and not outro:
            for j, (pos, m) in enumerate([(0, 9), (0.66, 10), (1.33, 12), (2, 14), (3, 16)]):
                put(piano(nf(r + 24 + m - 12), int(beat * 0.9 * SR), 0.7), t0 + pos * beat, 0.035)
        if intro or (outro and b >= nb - 2): continue
        # walking bass: root, 3rd/5th, approach
        walk = [r - 24, r - 24 + 7, r - 24 + (4 if iv[1] == 16 else 3) + 12, nxt - 24 + 1]
        for k, m in enumerate(walk):
            n = int(beat * 0.95 * SR); tk = np.arange(n) / SR; f = nf(m)
            x = (np.sin(2 * np.pi * f * tk) + 0.35 * np.sin(2 * np.pi * 2 * f * tk) * np.exp(-tk * 6)) * np.exp(-tk * 3.5) * env(n, .01, .3)
            put(lp(x, 700), t0 + k * beat, 0.3)
        # ride: ding ding-a ding
        for pos in (0, 1, 1 + 0.66, 2, 3, 3 + 0.66):
            n = int(.5 * SR); tk = np.arange(n) / SR
            x = bp(rng.standard_normal(n), 3000, 11000) * np.exp(-tk * 7) + 0.2 * np.sin(2 * np.pi * 5200 * tk) * np.exp(-tk * 9)
            put(x, t0 + pos * beat, 0.03 if pos in (1, 3) else 0.02)
        # brushes: swish on 2 and 4
        for pos in (1, 3):
            n = int(.32 * SR); tk = np.linspace(0, 1, n)
            put(bp(rng.standard_normal(n), 1500, 6000) * np.sin(np.pi * tk) ** 1.5, t0 + pos * beat, 0.045)
    out = out[:int(SR * dur)]; n = len(out)
    return out * np.minimum(1, np.arange(n) / (SR * 1.0)) * np.minimum(1, (n - np.arange(n)) / (SR * 2.5))

MUSIC_DB = -22

def card(rng, d=.3):
    n = int(d * SR); tt = np.linspace(0, 1, n)
    return bp(rng.standard_normal(n), 1200, 7000) * np.sin(np.pi * tt) ** 2 * (0.7 + 0.3 * np.sin(2 * np.pi * 30 * tt))
def typewriter(rng, d=.5, rate=16):
    n = int(d * SR); o = np.zeros(n)
    for s in np.sort(rng.integers(0, max(1, n - 2500), max(1, int(d * rate)))):
        tk = np.arange(2500) / SR
        o[s:s + 2500] += (bp(rng.standard_normal(2500), 1500, 6000) * np.exp(-tk * 160) + 0.6 * np.sin(2 * np.pi * 180 * tk) * np.exp(-tk * 90))
    return o
def bell(rng):
    n = int(1.0 * SR); tt = np.arange(n) / SR
    return (np.sin(2 * np.pi * 2093 * tt) + 0.5 * np.sin(2 * np.pi * 2093 * 2.76 * tt)) * np.exp(-tt * 4) * 0.6
def drawer(rng, d=.6):
    n = int(d * SR); tt = np.arange(n) / SR
    slide = lp(rng.standard_normal(n), 900) * np.sin(np.pi * np.clip(tt / (d * 0.8), 0, 1)) * 0.8
    s = int(d * 0.78 * SR); th = np.zeros(n); m = n - s; tk = np.arange(m) / SR
    th[s:] = np.sin(2 * np.pi * np.cumsum(140 * np.exp(-tk * 20) + 70) / SR) * np.exp(-tk * 14)
    return slide + th
def snip(rng):
    n = int(.18 * SR); o = np.zeros(n)
    for s in (0, int(.08 * SR)):
        m = int(.05 * SR); tk = np.arange(m) / SR; o[s:s + m] += hp(rng.standard_normal(m), 3000) * np.exp(-tk * 90) + 0.4 * np.sin(2 * np.pi * 3400 * tk) * np.exp(-tk * 120)
    return o
def page(rng, d=.4):
    n = int(d * SR); tt = np.linspace(0, 1, n); return bp(rng.standard_normal(n), 800, 7000) * np.sin(np.pi * tt) ** 1.5
def pop(rng): n = int(.09 * SR); tt = np.arange(n) / SR; return np.sin(2 * np.pi * np.cumsum(700 * np.exp(-tt * 40) + 240) / SR) * np.exp(-tt * 45)
def tick(rng): n = int(.025 * SR); return bp(rng.standard_normal(n), 2000, 7000) * np.exp(-np.arange(n) / SR * 220)
def error(rng):
    n = int(.4 * SR); tt = np.arange(n) / SR
    return (np.sin(2 * np.pi * 233 * tt) + np.sin(2 * np.pi * 247 * tt)) * 0.35 * env(n, .02, .4)
def chime(rng, f=1318.5):
    n = int(1.0 * SR); tt = np.arange(n) / SR
    a = np.sin(2 * np.pi * f * tt) * np.exp(-tt * 4); b = np.sin(2 * np.pi * f * 1.5 * tt) * np.exp(-tt * 4)
    s = int(.1 * SR); o = a * .55; o[s:] += b[:n - s] * .55; return o
SFX = {'card': card, 'type': typewriter, 'bell': bell, 'drawer': drawer, 'snip': snip, 'page': page, 'pop': pop, 'tick': tick, 'error': error, 'chime': chime}
