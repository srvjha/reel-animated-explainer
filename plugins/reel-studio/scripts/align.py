#!/usr/bin/env python3
"""Usage: align.py <workdir>
Inputs in <workdir>:
  transcript.txt  the exact transcript (used word for word, never reworded)
  anchors.txt     one "word time" per line, in transcript order, for words you clearly heard
                  (read them off asr_plain.json). Every 2 to 4 seconds is plenty.
Words between anchors are spread by voiced time (silences get no words).
Writes words.json [{w, t}]. Anchors must be strictly increasing."""
import sys, os, json, re, wave, subprocess
import numpy as np
os.chdir(sys.argv[1])
words = open('transcript.txt').read().split()
norm = lambda w: re.sub(r"[^a-z0-9_']", '', w.lower())
dur = float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', 'audio16k.wav']))
anc = [(-1, 0.0)]; pos = 0
for ln in open('anchors.txt'):
    ln = ln.strip()
    if not ln or ln.startswith('#'): continue
    w, t = ln.rsplit(None, 1); t = float(t)
    start = pos
    while pos < len(words) and norm(words[pos]) != norm(w): pos += 1
    if pos == len(words): sys.exit(f'anchor "{w}" not found after word #{start} ("{words[start] if start < len(words) else "END"}")')
    anc.append((pos, t)); pos += 1
anc.append((len(words), dur - 0.05))
for (a, ta), (b, tb) in zip(anc, anc[1:]):
    if not tb > ta: sys.exit(f'anchors not increasing: {words[a] if a >= 0 else "START"}@{ta} then {words[b] if b < len(words) else "END"}@{tb}')
w_ = wave.open('audio16k.wav'); x = np.frombuffer(w_.readframes(w_.getnframes()), np.int16).astype(float)
db = np.array([20 * np.log10(np.sqrt((x[i:i + 320] ** 2).mean()) + 1e-9) for i in range(0, len(x) - 320, 160)])
vo = (db > np.percentile(db, 30) + 3).astype(float) + 0.03; cum = np.concatenate([[0], np.cumsum(vo)])
CV = lambda t: np.interp(t * 100, np.arange(len(cum)), cum); inv = lambda c: np.interp(c, cum, np.arange(len(cum))) / 100
L = [len(w) + 2 for w in words]; t = [None] * len(words)
for (a, ta), (b, tb) in zip(anc, anc[1:]):
    if a >= 0: t[a] = ta
    seq = list(range(max(a, 0), b)); tot = sum(L[q] for q in seq) or 1
    for j in range(a + 1 if a >= 0 else 0, b):
        f = sum(L[q] for q in seq if q < j) / tot
        t[j] = float(inv(CV(ta) + (CV(tb) - CV(ta)) * f))
json.dump([{'w': w, 't': round(v, 3)} for w, v in zip(words, t)], open('words.json', 'w'))
print(len(anc) - 2, 'anchors,', len(words), 'words -> words.json')
