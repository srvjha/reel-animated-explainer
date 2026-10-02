"""Lime bento sound: dark 112 bpm techno-ish bed (kick, hats, square bass, pad) + glitchy UI effects."""
import numpy as np
SR = 44100
MUSIC_DB = -21
nf = lambda m: 440 * 2 ** ((m - 69) / 12)
def env(n, a=.01, r=.2):
    e = np.ones(n); ai = max(1, int(n * a)); ri = max(1, int(n * r)); e[:ai] = np.linspace(0, 1, ai); e[-ri:] = np.linspace(1, 0, ri); return e

def music(dur, rng):
    N = int(SR * dur); out = np.zeros(N)
    def put(x, t, g):
        s = int(t * SR); e = min(N, s + len(x))
        if 0 <= s < N: out[s:e] += x[:e - s] * g
    beat = 60 / 112; prog = [45, 41, 48, 43]; t = 0; bar = 0
    while t < dur:
        r = prog[bar % 4]
        for k in range(16):
            ts = t + k * beat / 4
            if k % 4 == 0:
                m = int(.22 * SR); tk = np.arange(m) / SR; put(np.sin(2 * np.pi * np.cumsum(110 * np.exp(-tk * 28) + 42) / SR) * np.exp(-tk * 12), ts, 0.45)
            if k % 2 == 1:
                m = int(.03 * SR); put(rng.standard_normal(m) * np.exp(-np.arange(m) / SR * 120), ts, 0.05)
            if k in (2, 6, 10, 14):
                m = int(beat / 4 * SR * 1.6); tk = np.arange(m) / SR
                put((np.sign(np.sin(2 * np.pi * nf(r - 12) * tk)) * 0.5 + np.sin(2 * np.pi * nf(r - 12) * tk)) * np.exp(-tk * 9), ts, 0.18)
        m = int(beat * 4 * SR); tk = np.arange(m) / SR
        pad = sum(np.sin(2 * np.pi * nf(r + 12 + i) * tk + np.sin(2 * np.pi * 0.3 * tk)) for i in (0, 3, 7, 10))
        put(pad * env(m, .25, .25), t, 0.035)
        t += beat * 4; bar += 1
    return out

def swoosh(rng, d=.45):
    n = int(d * SR); x = np.convolve(rng.standard_normal(n), np.ones(6) / 6, 'same'); tt = np.linspace(0, 1, n); return x * np.sin(np.pi * tt) ** 2 * (0.5 + tt)
def slice(rng):
    n = int(.5 * SR); tt = np.arange(n) / SR; x = rng.standard_normal(n) * np.exp(-tt * 9); x = np.convolve(x, [1, -0.95], 'same')
    return x + 0.6 * np.sin(2 * np.pi * np.cumsum(2400 * np.exp(-tt * 8) + 300) / SR) * np.exp(-tt * 10)
def blip(rng, f=1300, d=.06): n = int(d * SR); return np.sin(2 * np.pi * f * np.arange(n) / SR) * env(n, .05, .4)
def tick(rng): n = int(.02 * SR); return rng.standard_normal(n) * np.exp(-np.arange(n) / SR * 400)
def thud(rng): n = int(.4 * SR); tt = np.arange(n) / SR; return np.sin(2 * np.pi * np.cumsum(120 * np.exp(-tt * 22) + 40) / SR) * np.exp(-tt * 10) + 0.5 * rng.standard_normal(n) * np.exp(-tt * 60)
def alarm(rng): n = int(.9 * SR); tt = np.arange(n) / SR; f = 700 + 250 * np.sign(np.sin(2 * np.pi * 6 * tt)); return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, .02, .2)
def riser(rng, d=1.4): n = int(d * SR); tt = np.arange(n) / SR; return np.sin(2 * np.pi * np.cumsum(200 * 8 ** (tt / d)) / SR) * (tt / d) ** 2

SFX = {'swoosh': swoosh, 'slice': slice, 'blip': blip, 'tick': tick, 'thud': thud, 'alarm': alarm, 'riser': riser}
