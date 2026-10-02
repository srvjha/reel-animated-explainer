#!/usr/bin/env python3
"""Usage: mix_audio.py <workdir>
Builds music.wav (the theme's bed) and sfx.wav (cues.json) for the final mix.
  cues.json: [{"sfx": "swish", "t": "socho-0.1", "db": -17},
              {"sfx": "click", "t": 15.6, "db": -26, "repeat": 7, "every": 0.05}, ...]
  "t" is seconds or a T key from data.json with an optional +/- offset. "args" passes kwargs to the sfx.
The theme's sound.py defines music(dur, rng) and SFX = {name: fn(rng, **kw)}."""
import sys, os, json, re, wave, importlib.util
sys.dont_write_bytecode = True
import numpy as np
os.chdir(sys.argv[1]); SR = 44100
theme = json.load(open('reel.json'))['theme']
spec = importlib.util.spec_from_file_location('sound', os.path.join(theme, 'sound.py')); snd = importlib.util.module_from_spec(spec); spec.loader.exec_module(snd)
data = json.load(open('rem/src/data.json')); T = data['T']; DUR = data['duration'] + 0.1; N = int(SR * DUR)
rng = np.random.default_rng(7)
def tm(v):
    if isinstance(v, (int, float)): return float(v)
    m = re.fullmatch(r'\s*([A-Za-z_]\w*)\s*(?:([+-])\s*([\d.]+))?\s*', v)
    if not m or m.group(1) not in T: sys.exit(f'bad cue time "{v}" (unknown T key?)')
    return T[m.group(1)] + (float(m.group(3)) * (1 if m.group(2) == '+' else -1) if m.group(2) else 0)
def put(buf, x, t, g):
    s = int(t * SR); e = min(N, s + len(x))
    if 0 <= s < N: buf[s:e] += x[:e - s] * g
music = np.zeros(N); bed = snd.music(DUR, rng); music[:min(N, len(bed))] = bed[:N]
fi, fo = int(.8 * SR), int(2 * SR); music[:fi] *= np.linspace(0, 1, fi); music[-fo:] *= np.linspace(1, 0, fo)
music = music / (np.abs(music).max() + 1e-9) * 10 ** (getattr(snd, 'MUSIC_DB', -21) / 20)
sfx = np.zeros(N)
cues = json.load(open('cues.json')) if os.path.exists('cues.json') else []
for c in cues:
    if c['sfx'] not in snd.SFX: sys.exit(f'unknown sfx "{c["sfx"]}". Theme has: {", ".join(snd.SFX)}')
    for k in range(c.get('repeat', 1)):
        x = snd.SFX[c['sfx']](rng, **c.get('args', {})); x = x / (np.abs(x).max() + 1e-9) * 10 ** (c.get('db', -20) / 20)
        put(sfx, x, max(0, tm(c['t']) + k * c.get('every', 0)), 1)
def wav(name, x):
    st = np.stack([x, x], 1); w = wave.open(name, 'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.clip(st, -1, 1) * 32767).astype(np.int16).tobytes()); w.close()
wav('music.wav', music); wav('sfx.wav', sfx); print(f'music.wav + sfx.wav ({len(cues)} cues)')
