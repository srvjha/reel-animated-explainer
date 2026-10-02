#!/usr/bin/env python3
"""Usage: asr.py <workdir> [--model base.en]
Word-level timestamps with whisper.cpp in short windows (no_context), which behaves far better
on mixed-language (Hinglish) speech than one long pass. Writes asr_plain.json [[t, word], ...]
and prints a compact timeline you can read to pick anchors."""
import sys, os, json, subprocess, urllib.request, argparse
import numpy as np
ap = argparse.ArgumentParser(); ap.add_argument('wd'); ap.add_argument('--model', default='base.en'); ap.add_argument('--win', type=float, default=3.5)
a = ap.parse_args(); os.chdir(a.wd)
cache = os.path.expanduser(os.environ.get('REEL_CACHE', '~/.cache/reel-studio')); os.makedirs(cache, exist_ok=True)
mp = os.path.join(cache, f'ggml-{a.model}.bin')
if not os.path.exists(mp):
    print('downloading whisper model', a.model)
    urllib.request.urlretrieve(f'https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-{a.model}.bin', mp)
try:
    from pywhispercpp.model import Model
except ImportError:
    sys.exit('pip install pywhispercpp numpy   (then rerun)')
dur = float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', 'audio16k.wav']))
m = Model(mp, n_threads=os.cpu_count() or 2, print_realtime=False, print_progress=False, no_context=True, token_timestamps=True, max_len=1, split_on_word=True)
out = []
for s in np.arange(0, dur, a.win):
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', str(s), '-t', str(a.win + 0.5), '-i', 'audio16k.wav', '_c.wav'])
    for x in m.transcribe('_c.wav'):
        if x.text.strip() and x.t0 / 100 < a.win + 0.4:
            out.append((round(s + x.t0 / 100, 2), x.text.strip()))
os.remove('_c.wav')
json.dump(out, open('asr_plain.json', 'w'))
line, t0 = [], 0
for t, w in out:
    if t - t0 > 5 and line: print(f'{t0:6.2f}  ' + ' '.join(line)); line, t0 = [], t
    line.append(f'{w}@{t:.2f}')
if line: print(f'{t0:6.2f}  ' + ' '.join(line))
