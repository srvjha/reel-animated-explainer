"""Yellow ticker sound: bouncy 120 bpm pluck bed + paper/flap/stamp effects. Pure numpy, no samples."""
import numpy as np
SR = 44100
MUSIC_DB = -21
nf = lambda m: 440 * 2 ** ((m - 69) / 12)

def music(dur, rng):
    N = int(SR * dur); out = np.zeros(N)
    def put(x, t, g):
        s = int(t * SR); e = min(N, s + len(x))
        if 0 <= s < N: out[s:e] += x[:e - s] * g
    beat = 60 / 120; prog = [(60, [0, 4, 7]), (57, [0, 3, 7]), (65, [0, 4, 7]), (67, [0, 4, 7])]; t = 0; bar = 0
    while t < dur:
        r, iv = prog[bar % 4]
        for k in range(8):
            ts = t + k * beat / 2; m = int(.25 * SR); tt = np.arange(m) / SR
            note = r + 12 + iv[k % 3] + (12 if k in (3, 7) else 0)
            put((np.sin(2 * np.pi * nf(note) * tt) + 0.3 * np.sin(4 * np.pi * nf(note) * tt)) * np.exp(-tt * 14), ts, 0.12)
            if k % 4 == 0:
                m2 = int(.18 * SR); t2 = np.arange(m2) / SR; put(np.sin(2 * np.pi * np.cumsum(100 * np.exp(-t2 * 30) + 48) / SR) * np.exp(-t2 * 14), ts, 0.4)
            if k % 4 == 2:
                m3 = int(.12 * SR); put(rng.standard_normal(m3) * np.exp(-np.arange(m3) / SR * 30), ts, 0.10)
            if k % 2 == 1:
                m4 = int(.02 * SR); put(rng.standard_normal(m4) * np.exp(-np.arange(m4) / SR * 200), ts, 0.05)
        m = int(beat * 4 * SR); tt = np.arange(m) / SR; put(np.sin(2 * np.pi * nf(r - 12) * tt) * np.exp(-tt * 1.5), t, 0.3)
        t += beat * 4; bar += 1
    return out

def swish(rng, d=.35):
    n = int(d * SR); x = np.convolve(rng.standard_normal(n), np.ones(4) / 4, 'same'); return x * np.sin(np.linspace(0, np.pi, n)) ** 3
def click(rng): n = int(.012 * SR); return rng.standard_normal(n) * np.exp(-np.arange(n) / SR * 600)
def flap(rng): n = int(.02 * SR); tt = np.arange(n) / SR; return (rng.standard_normal(n) + np.sin(2 * np.pi * 1800 * tt)) * np.exp(-tt * 300)
def stamp(rng): n = int(.3 * SR); tt = np.arange(n) / SR; return np.sin(2 * np.pi * np.cumsum(160 * np.exp(-tt * 30) + 60) / SR) * np.exp(-tt * 16) + 0.7 * rng.standard_normal(n) * np.exp(-tt * 80)
def ding(rng, f=1320): n = int(.5 * SR); tt = np.arange(n) / SR; return (np.sin(2 * np.pi * f * tt) + 0.4 * np.sin(2 * np.pi * f * 2.01 * tt)) * np.exp(-tt * 6)
def pop(rng): n = int(.08 * SR); tt = np.arange(n) / SR; return np.sin(2 * np.pi * np.cumsum(400 + 1600 * tt / 0.08) / SR) * np.exp(-tt * 30)

SFX = {'swish': swish, 'click': click, 'flap': flap, 'stamp': stamp, 'ding': ding, 'pop': pop}
