"""Packet lab sound: bright minimal house bed at 118 bpm (four-on-the-floor soft kick, offbeat open hats, plucky
synth chords on the offbeat, rubbery bass, a little arpeggio), plus UI/network effects: send (rising blip),
recv (two-tone), click, pop, swish, iris (page open), type (key ticks), ding, error, data (byte chatter)."""
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
def sq(f, n):
    t = np.arange(n) / SR; return np.sign(np.sin(2 * np.pi * f * t))

PROG = [(53, [0, 4, 7, 11]), (55, [0, 4, 7, 10]), (52, [0, 3, 7, 10]), (57, [0, 3, 7, 10])]   # Fmaj7 G7 Em7 Am7
def music(dur, rng, bpm=118):
    N = int(SR * dur) + 2 * SR; out = np.zeros(N); beat = 60 / bpm; bar = 4 * beat
    def put(x, t, g):
        s = int(t * SR); e = min(N, s + len(x))
        if 0 <= s < N: out[s:e] += x[:e - s] * g
    nb = int(np.ceil(dur / bar)) + 1
    for b in range(nb):
        t0 = b * bar; r, iv = PROG[b % 4]; part = 0 if b < 4 else (2 if b >= nb - 4 else 1)
        lift = (b // 8) % 2   # alternate 8-bar sections: plain / with arp
        # chords: short plucky stabs on the offbeats
        for k in range(4):
            n = int(beat * 0.45 * SR); tk = np.arange(n) / SR
            c = sum(saw(nf(r + 12 + i), n, 0.004) for i in iv)
            c = (lp(c, 3200) * np.exp(-tk * 14) + lp(c, 1500) * 0.6) * np.exp(-tk * 8)
            put(c, t0 + k * beat + beat / 2, 0.028)
        if part == 2 and b >= nb - 2: continue
        # kick four on the floor + offbeat open hat + clap on 2/4
        for k in range(4):
            if part == 0 and k % 2: continue
            n = int(.32 * SR); tk = np.arange(n) / SR
            put(np.sin(2 * np.pi * np.cumsum(110 * np.exp(-tk * 35) + 48) / SR) * np.exp(-tk * 9), t0 + k * beat, 0.4 if part else 0.25)
            n = int(.14 * SR); hh = hp(rng.standard_normal(n), 7500) * np.exp(-np.arange(n) / SR * 26)
            put(hh, t0 + k * beat + beat / 2, 0.05 if part else 0.03)
            if part == 1 and k in (1, 3):
                n = int(.2 * SR); cl = bp(rng.standard_normal(n), 1000, 5000) * np.exp(-np.arange(n) / SR * 22)
                for d in (0, 0.012, 0.024): put(cl, t0 + k * beat + d, 0.07)
        # rubbery bass on 8ths with octave jumps
        if part:
            for k in range(8):
                n = int(beat * 0.42 * SR); tk = np.arange(n) / SR
                m = r - 24 + (12 if k in (3, 7) else 0)
                x = lp(sq(nf(m), n) * 0.6 + np.sin(2 * np.pi * nf(m) * tk), 520) * env(n, .01, .3)
                put(x, t0 + k * beat / 2, 0.2)
        # arpeggio on lifted sections
        if part == 1 and lift:
            for k in range(16):
                n = int(beat / 4 * 0.9 * SR); tk = np.arange(n) / SR; f = nf(r + 24 + iv[[0, 2, 1, 3][k % 4]] + (12 if k >= 12 else 0))
                put(np.sin(2 * np.pi * f * tk) * np.exp(-tk * 22), t0 + k * beat / 4, 0.03)
    out = out[:int(SR * dur)]; n = len(out)
    return out * np.minimum(1, np.arange(n) / (SR * 1.0)) * np.minimum(1, (n - np.arange(n)) / (SR * 2.0))

MUSIC_DB = -22

def send(rng):
    n = int(.24 * SR); tt = np.arange(n) / SR
    return np.sin(2 * np.pi * np.cumsum(600 + 1800 * tt / .24) / SR) * np.exp(-tt * 12) * 0.7
def recv(rng):
    n = int(.42 * SR); tt = np.arange(n) / SR; s = int(.09 * SR)
    a = np.sin(2 * np.pi * 1175 * tt) * np.exp(-tt * 9); b = np.sin(2 * np.pi * 1568 * tt) * np.exp(-tt * 8); o = a * .5; o[s:] += b[:n - s] * .55; return o
def click(rng): n = int(.03 * SR); return bp(rng.standard_normal(n), 2000, 8000) * np.exp(-np.arange(n) / SR * 180)
def pop(rng): n = int(.09 * SR); tt = np.arange(n) / SR; return np.sin(2 * np.pi * np.cumsum(850 * np.exp(-tt * 40) + 300) / SR) * np.exp(-tt * 45)
def swish(rng, d=.3):
    n = int(d * SR); tt = np.linspace(0, 1, n); return hp(rng.standard_normal(n), 2500) * np.sin(np.pi * tt) ** 3
def iris(rng, d=.42):
    n = int(d * SR); tt = np.arange(n) / SR
    return bp(rng.standard_normal(n), 400, 6000) * np.sin(np.pi * tt / d) ** 2 * 0.6 + np.sin(2 * np.pi * np.cumsum(300 + 900 * tt / d) / SR) * np.sin(np.pi * tt / d) * 0.25
def typing(rng, d=.6):
    n = int(d * SR); o = np.zeros(n)
    for s in np.sort(rng.integers(0, n - 800, int(d * 22))): o[s:s + 800] += bp(rng.standard_normal(800), 2500, 7000) * np.exp(-np.arange(800) / SR * 300)
    return o
def ding(rng, f=1318.5):
    n = int(.9 * SR); tt = np.arange(n) / SR
    a = np.sin(2 * np.pi * f * tt) * np.exp(-tt * 5); b = np.sin(2 * np.pi * f * 1.5 * tt) * np.exp(-tt * 5)
    s = int(.1 * SR); o = a * .55; o[s:] += b[:n - s] * .55; return o
def error(rng):
    n = int(.36 * SR); tt = np.arange(n) / SR
    return np.sign(np.sin(2 * np.pi * 160 * tt)) * 0.4 * env(n, .02, .3)
def data(rng, d=.8):
    n = int(d * SR); tt = np.arange(n) / SR
    f = 900 + 700 * np.sign(np.sin(2 * np.pi * 26 * tt)) * (rng.random() * 0.5 + 0.5)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.35 * env(n, .03, .2)
SFX = {'send': send, 'recv': recv, 'click': click, 'pop': pop, 'swish': swish, 'iris': iris, 'type': typing, 'ding': ding, 'error': error, 'data': data}
