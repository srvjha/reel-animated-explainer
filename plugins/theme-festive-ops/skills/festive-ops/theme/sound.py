"""Festive ops sound: bright major arranged bed (marimba-style plucks, shaker, warm bass) that changes every few bars,
plus effects: notification ding, pop, swish, tick, riser, error, whoosh."""
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

# section recipes: chords (root midi, intervals), drums, bass pattern, arp pattern, pad
SECTIONS = {
    'intro':   dict(ch=[(48, [0, 4, 7, 11]), (45, [0, 3, 7, 10]), (41, [0, 4, 7, 11]), (43, [0, 4, 7, 9])], kick=0, snare=0, hat=1, bass=None, arp='bell', pad=1, cut=1400),
    'grooveA': dict(ch=[(48, [0, 4, 7, 11]), (45, [0, 3, 7, 10]), (41, [0, 4, 7, 11]), (43, [0, 4, 7, 9])], kick=1, snare=0, hat=1, bass='eighths', arp='up', pad=1, cut=2400),
    'grooveB': dict(ch=[(41, [0, 4, 7, 11]), (43, [0, 4, 7, 9]), (45, [0, 3, 7, 10]), (48, [0, 4, 7, 14])], kick=1, snare=1, hat=1, bass='sync', arp='bounce', pad=0, cut=3000),
    'tension': dict(ch=[(45, [0, 3, 7, 10]), (41, [0, 4, 7, 11]), (43, [0, 4, 7, 10]), (44, [0, 4, 7, 10])], kick=1, snare=1, hat=2, bass='pulse', arp='stab', pad=1, cut=3400),
    'drive':   dict(ch=[(48, [0, 4, 7, 11]), (43, [0, 4, 7, 9]), (45, [0, 3, 7, 10]), (41, [0, 4, 7, 11])], kick=2, snare=1, hat=2, bass='sync', arp='run', pad=1, cut=4400),
    'grooveC': dict(ch=[(41, [0, 4, 7, 11]), (48, [0, 4, 7, 9]), (43, [0, 4, 7, 10]), (45, [0, 3, 7, 10])], kick=1, snare=1, hat=1, bass='eighths', arp='bell', pad=1, cut=2600),
    'outro':   dict(ch=[(48, [0, 4, 7, 11]), (41, [0, 4, 7, 14]), (43, [0, 4, 7, 9]), (48, [0, 4, 7, 14])], kick=0, snare=0, hat=1, bass=None, arp='bell', pad=1, cut=1600),
}
ORDER = [('intro', 4), ('grooveA', 8), ('grooveB', 8), ('tension', 8), ('drive', 8), ('grooveC', 8), ('drive', 8), ('grooveB', 8), ('grooveC', 8)]
ARPS = {'up': [0, 1, 2, 3, 2, 1, 0, 1], 'bounce': [0, 2, 1, 3, 0, 2, 1, 3], 'stab': [0, -1, -1, 0, -1, 0, -1, -1], 'run': [0, 1, 2, 3, 3, 2, 1, 2], 'bell': [3, -1, 2, -1, 1, -1, 0, -1]}

def music(dur, rng, bpm=112, plan=None):
    N = int(SR * dur) + SR; out = np.zeros(N); beat = 60 / bpm; bar = beat * 4
    def put(x, t, g):
        s = int(t * SR); e = min(N, s + len(x))
        if 0 <= s < N: out[s:e] += x[:e - s] * g
    kick = lambda: (lambda tk: np.sin(2 * np.pi * np.cumsum(120 * np.exp(-tk * 32) + 45) / SR) * np.exp(-tk * 9))(np.arange(int(.35 * SR)) / SR)
    snare = lambda: (lambda n: bp(rng.standard_normal(n), 900, 5000) * np.exp(-np.arange(n) / SR * 22) + 0.3 * np.sin(2 * np.pi * 190 * np.arange(n) / SR) * np.exp(-np.arange(n) / SR * 30))(int(.25 * SR))
    hat = lambda d=.04: (lambda n: hp(rng.standard_normal(n), 7000) * np.exp(-np.arange(n) / SR * (1 / d) * 3))(int(max(d, .03) * 4 * SR))
    crash = lambda: (lambda n: hp(rng.standard_normal(n), 4000) * np.exp(-np.arange(n) / SR * 2.2))(int(1.8 * SR))
    riser = lambda d: (lambda n: bp(rng.standard_normal(n), 400, 6000) * np.linspace(0, 1, n) ** 2)(int(d * SR))
    nbars = int(np.ceil(dur / bar)); bars = []
    for name, n in (plan or ORDER):
        bars += [(name, i, n) for i in range(n)]
    while len(bars) < nbars: bars += [(ORDER[-1][0], i, 8) for i in range(8)]
    for b in range(nbars):
        name, bin_, sec_len = bars[b]
        if b >= nbars - 4: name = 'outro'
        S = SECTIONS[name]; t0 = b * bar; r, iv = S['ch'][b % 4]
        fill = bin_ == sec_len - 1 and b < nbars - 5
        if bin_ == 0 and b > 0: put(crash(), t0, 0.12)
        if fill: put(riser(bar), t0, 0.10)
        # pad
        if S['pad']:
            n = int(bar * SR); p = sum(saw(nf(r + 12 + k), n, 0.004) for k in iv)
            put(lp(p, S['cut'] * (0.8 + 0.4 * (bin_ / sec_len))) * env(n, .15, .2), t0, 0.06)
        for k in range(16):
            ts = t0 + k * beat / 4
            if S['kick'] and k % 4 == 0 and not (fill and k >= 12): put(kick(), ts, 0.55)
            if S['kick'] == 2 and k in (10, 14) and bin_ % 2: put(kick(), ts, 0.3)
            if S['snare'] and k in (4, 12): put(snare(), ts, 0.22)
            if fill and k >= 12 and S['snare']: put(snare(), ts, 0.12)
            if S['hat'] and k % 2 == 1: put(hat(), ts + (0.012 if k % 4 == 3 else 0), 0.05)
            if S['hat'] == 2 and k % 2 == 0: put(hat(.02), ts, 0.03)
            if S['hat'] and k in (6, 14) and name in ('drive', 'tension'): put(hat(.15), ts, 0.04)
        # bass
        bp_ = S['bass']
        if bp_:
            steps = {'eighths': [0, 2, 4, 6, 8, 10, 12, 14], 'sync': [0, 3, 6, 8, 11, 14], 'pulse': list(range(16))}[bp_]
            for k in steps:
                d = beat / 4 * (1.6 if bp_ != 'pulse' else 0.9); n = int(d * SR)
                note = r - 12 + (12 if (bp_ == 'sync' and k in (6, 14)) else 0)
                put(lp(saw(nf(note), n, 0.003), 420 + 300 * (k % 4 == 0)) * env(n, .02, .4), ts := t0 + k * beat / 4, 0.32 if bp_ != 'pulse' else 0.22)
        # arp / lead
        ap = S['arp']
        if ap:
            pat = ARPS[ap]
            for k in range(8):
                if pat[k] < 0: continue
                ts = t0 + k * beat / 2; n = int(beat / 2 * SR * (1.8 if ap == 'bell' else 0.9)); tk = np.arange(n) / SR
                f = nf(r + 24 + iv[pat[k] % len(iv)] + (12 if (ap == 'run' and bin_ >= 4 and k >= 4) else 0))
                if ap == 'bell': x = np.sin(2 * np.pi * f * tk + 2.2 * np.exp(-tk * 6) * np.sin(2 * np.pi * f * 3.5 * tk)) * np.exp(-tk * 4)
                elif ap == 'stab': x = lp(saw(f / 2, n, 0.006), 2600) * np.exp(-tk * 9)
                else: x = (np.sin(2 * np.pi * f * tk) + 0.35 * np.sin(2 * np.pi * f * 4 * tk) * np.exp(-tk * 30)) * np.exp(-tk * 9)
                put(x, ts, 0.07 if ap != 'bell' else 0.06)
                if ap in ('up', 'run', 'bounce'): put(x * 0.5, ts + beat * 0.75, 0.035)   # dotted echo
    return out[:int(SR * dur)]

MUSIC_DB = -22

def whoosh(rng, d=.5):
    n = int(d * SR); x = bp(rng.standard_normal(n), 300, 5000); tt = np.linspace(0, 1, n); return x * np.sin(np.pi * tt) ** 2
def swish(rng, d=.28):
    n = int(d * SR); x = hp(rng.standard_normal(n), 2500); tt = np.linspace(0, 1, n); return x * np.sin(np.pi * tt) ** 3
def ding(rng, f=1318.5):
    n = int(.9 * SR); tt = np.arange(n) / SR
    a = np.sin(2 * np.pi * f * tt) * np.exp(-tt * 5); b = np.sin(2 * np.pi * f * 1.5 * tt) * np.exp(-tt * 5)
    s = int(.11 * SR); out = a * 0.6; out[s:] += b[:n - s] * 0.6; return out
def pop(rng): n = int(.09 * SR); tt = np.arange(n) / SR; return np.sin(2 * np.pi * np.cumsum(900 * np.exp(-tt * 40) + 300) / SR) * np.exp(-tt * 45)
def blip(rng, f=1500, d=.06): n = int(d * SR); return np.sin(2 * np.pi * f * np.arange(n) / SR) * env(n, .05, .4)
def tick(rng): n = int(.02 * SR); return hp(rng.standard_normal(n), 3000) * np.exp(-np.arange(n) / SR * 300)
def riser(rng, d=1.2): n = int(d * SR); tt = np.arange(n) / SR; return (bp(rng.standard_normal(n), 300, 6000) * 0.5 + np.sin(2 * np.pi * np.cumsum(180 * 6 ** (tt / d)) / SR) * 0.5) * (tt / d) ** 2
def error(rng): n = int(.35 * SR); tt = np.arange(n) / SR; return np.sign(np.sin(2 * np.pi * 140 * tt)) * 0.45 * env(n, .02, .3)
def hit(rng):
    n = int(.9 * SR); tt = np.arange(n) / SR
    return np.sin(2 * np.pi * np.cumsum(90 * np.exp(-tt * 8) + 50) / SR) * np.exp(-tt * 5) + 0.25 * hp(rng.standard_normal(n), 3000) * np.exp(-tt * 18)

SFX = {'whoosh': whoosh, 'swish': swish, 'ding': ding, 'pop': pop, 'blip': blip, 'tick': tick, 'riser': riser, 'error': error, 'hit': hit}
