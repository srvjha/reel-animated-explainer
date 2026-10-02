"""Cream passport sound: soft 88 bpm lo-fi bed (e-piano chords, sub, brushed hats) + office/stamp effects."""
import numpy as np
SR = 44100
MUSIC_DB = -19
nf = lambda m: 440 * 2 ** ((m - 69) / 12)
def env(n, a=.01, r=.2):
    e = np.ones(n); ai = max(1, int(n * a)); ri = max(1, int(n * r)); e[:ai] = np.linspace(0, 1, ai); e[-ri:] = np.linspace(1, 0, ri); return e

def music(dur, rng):
    N = int(SR * dur); out = np.zeros(N)
    def put(x, t, g):
        s = int(t * SR); e = min(N, s + len(x))
        if 0 <= s < N: out[s:e] += x[:e - s] * g
    beat = 60 / 88; chords = [(53, [0, 4, 7, 11]), (52, [0, 3, 7, 10]), (50, [0, 3, 7, 10]), (48, [0, 4, 7, 11])]
    t = 0; i = 0
    while t < dur:
        r, iv = chords[i % 4]; n = int(beat * 4 * SR); tt = np.arange(n) / SR
        ch = sum(np.sin(2 * np.pi * nf(r + 12 + k) * tt) * np.exp(-tt * 1.2) + 0.3 * np.sin(4 * np.pi * nf(r + 12 + k) * tt) * np.exp(-tt * 3) for k in iv)
        put(ch * env(n, .005, .1), t, 0.10)
        put(np.sin(2 * np.pi * nf(r - 12) * tt) * np.exp(-tt * 0.8) * env(n, .01, .2), t, 0.35)
        for b in range(8):
            m = int(0.05 * SR); put(rng.standard_normal(m) * np.exp(-np.arange(m) / SR * 60), t + b * beat / 2, 0.04 if b % 2 else 0.025)
        for b in (0, 2):
            m = int(.2 * SR); tk = np.arange(m) / SR; put(np.sin(2 * np.pi * np.cumsum(90 * np.exp(-tk * 25) + 45) / SR) * np.exp(-tk * 14), t + b * beat, 0.35)
        t += beat * 4; i += 1
    return out

def thud(rng):
    n = int(.35 * SR); tt = np.arange(n) / SR; return np.sin(2 * np.pi * np.cumsum(140 * np.exp(-tt * 30) + 50) / SR) * np.exp(-tt * 16) + 0.6 * rng.standard_normal(n) * np.exp(-tt * 70)
def beep(rng, f=1400, d=.09): n = int(d * SR); return np.sin(2 * np.pi * f * np.arange(n) / SR) * env(n, .05, .3)
def chime(rng): return np.concatenate([beep(rng, 1046, .12), beep(rng, 1568, .28)])
def buzz(rng): n = int(.45 * SR); tt = np.arange(n) / SR; return np.sign(np.sin(2 * np.pi * 110 * tt)) * 0.6 * env(n, .02, .2)
def click(rng): n = int(.015 * SR); return rng.standard_normal(n) * np.exp(-np.arange(n) / SR * 500)
def whoosh(rng, d=.4):
    n = int(d * SR); x = np.convolve(rng.standard_normal(n), np.ones(10) / 10, 'same'); return x * np.sin(np.linspace(0, np.pi, n)) ** 2
def sweep(rng):
    n = int(1.3 * SR); tt = np.arange(n) / SR; f = 600 + 900 * tt / 1.3; return np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.5 * (0.6 + 0.4 * np.sin(2 * np.pi * 12 * tt)) * env(n, .05, .1)

SFX = {'thud': thud, 'beep': beep, 'chime': chime, 'buzz': buzz, 'click': click, 'whoosh': whoosh, 'sweep': sweep}
