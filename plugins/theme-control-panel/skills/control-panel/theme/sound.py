"""Control panel sound: minimal industrial bed at 100 bpm (soft kick, metallic ticks, pulsing bass,
square-wave arpeggio) + mechanical effects: breaker clunk, relay click, electric zap, alarm, power-up."""
import numpy as np
SR = 44100
MUSIC_DB = -22
nf = lambda m: 440 * 2 ** ((m - 69) / 12)
def env(n, a=.01, r=.2):
    e = np.ones(n); ai = max(1, int(n * a)); ri = max(1, int(n * r)); e[:ai] = np.linspace(0, 1, ai); e[-ri:] = np.linspace(1, 0, ri); return e

def music(dur, rng):
    N = int(SR * dur); out = np.zeros(N)
    def put(x, t, g):
        s = int(t * SR); e = min(N, s + len(x))
        if 0 <= s < N: out[s:e] += x[:e - s] * g
    beat = 60 / 100; roots = [50, 50, 46, 48]; arp = [0, 7, 12, 15, 12, 7, 3, 7]; t = 0; bar = 0
    while t < dur:
        r = roots[bar % 4]
        for k in range(8):
            ts = t + k * beat / 2
            if k % 2 == 0:
                m = int(.2 * SR); tk = np.arange(m) / SR; put(np.sin(2 * np.pi * np.cumsum(95 * np.exp(-tk * 30) + 44) / SR) * np.exp(-tk * 13), ts, 0.42)
            m = int(.05 * SR); tk = np.arange(m) / SR
            put(np.sin(2 * np.pi * 6200 * tk) * rng.standard_normal(m) * np.exp(-tk * 90), ts + beat / 4, 0.05)
            m = int(beat / 2 * SR * 0.9); tk = np.arange(m) / SR
            put(np.sign(np.sin(2 * np.pi * nf(r + 12 + arp[k]) * tk)) * np.exp(-tk * 10) * 0.5, ts, 0.05)
            m = int(beat / 2 * SR); tk = np.arange(m) / SR
            put(np.sin(2 * np.pi * nf(r - 12) * tk) * env(m, .02, .5), ts, 0.22)
        t += beat * 4; bar += 1
    return out

def clunk(rng):
    n = int(.35 * SR); tt = np.arange(n) / SR
    return np.sin(2 * np.pi * np.cumsum(180 * np.exp(-tt * 40) + 70) / SR) * np.exp(-tt * 22) + 0.8 * rng.standard_normal(n) * np.exp(-tt * 120) + 0.4 * np.sin(2 * np.pi * 1900 * tt) * np.exp(-tt * 70)
def click(rng): n = int(.025 * SR); tt = np.arange(n) / SR; return (rng.standard_normal(n) * 0.6 + np.sin(2 * np.pi * 3200 * tt)) * np.exp(-tt * 260)
def zap(rng, d=.4):
    n = int(d * SR); tt = np.arange(n) / SR; buzz = np.sign(np.sin(2 * np.pi * (120 + 40 * rng.standard_normal(n).cumsum() / n) * tt))
    return (buzz * 0.5 + rng.standard_normal(n)) * np.exp(-tt * 9) * (0.5 + 0.5 * (rng.random(n) > 0.6))
def alarm(rng, d=.8): n = int(d * SR); tt = np.arange(n) / SR; f = 880 * (1 + 0.5 * (np.sin(2 * np.pi * 5 * tt) > 0)); return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, .02, .2)
def powerup(rng, d=.8): n = int(d * SR); tt = np.arange(n) / SR; f = 80 + 900 * (tt / d) ** 2; return (np.sin(2 * np.pi * np.cumsum(f) / SR) + 0.3 * np.sign(np.sin(2 * np.pi * np.cumsum(f * 2) / SR))) * env(n, .1, .1)
def powerdown(rng, d=.7): n = int(d * SR); tt = np.arange(n) / SR; f = 700 * (1 - tt / d) ** 2 + 50; return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, .02, .2)
def beep(rng, f=1200, d=.08): n = int(d * SR); return np.sin(2 * np.pi * f * np.arange(n) / SR) * env(n, .05, .3)
def tape(rng, d=.25): n = int(d * SR); tt = np.arange(n) / SR; return rng.standard_normal(n) * (0.5 + 0.5 * np.sin(2 * np.pi * 60 * tt)) * env(n, .05, .2)
def scan(rng, d=.5): n = int(d * SR); tt = np.arange(n) / SR; return np.sin(2 * np.pi * np.cumsum(400 + 1600 * tt / d) / SR) * env(n, .05, .3) * 0.6 + 0.2 * rng.standard_normal(n) * env(n, .05, .3)

SFX = {'clunk': clunk, 'click': click, 'zap': zap, 'alarm': alarm, 'powerup': powerup, 'powerdown': powerdown, 'beep': beep, 'tape': tape, 'scan': scan}
