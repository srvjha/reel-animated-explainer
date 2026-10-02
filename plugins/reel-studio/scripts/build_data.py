#!/usr/bin/env python3
"""Usage: build_data.py <workdir> [--maxc N] [--lines N] [--keywords "IP,address,router"]
Reads words.json and marks.txt, writes rem/src/data.json = {duration, T, pages}.
  marks.txt: "key word [n]" -> T[key] = time of the n-th (1-based, default 1) occurrence of word
             "key 12.34"    -> T[key] = 12.34
  T is what Video.tsx uses to time every visual to the speech.
Pages never leave a single word alone on a line. maxc/lines default to the theme's theme.json."""
import sys, os, json, re, argparse, subprocess
ap = argparse.ArgumentParser(); ap.add_argument('wd'); ap.add_argument('--maxc', type=int); ap.add_argument('--lines', type=int); ap.add_argument('--keywords', default='')
a = ap.parse_args(); os.chdir(a.wd)
th = json.load(open('rem/src/theme/theme.json')).get('captions', {})
MAXC = a.maxc or th.get('maxc', 22); NL = a.lines or th.get('lines', 2)
words = json.load(open('words.json'))
dur = float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', 'src.mp4']))
norm = lambda w: re.sub(r"[^a-z0-9_.']", '', w.lower()).strip('.')
kw = {norm(k) for k in a.keywords.split(',') if k.strip()}
for i, w in enumerate(words):
    nxt = words[i + 1]['t'] if i + 1 < len(words) else dur
    w['e'] = round(min(nxt, w['t'] + 1.2), 3); w['k'] = norm(w['w']) in kw
T = {}
if os.path.exists('marks.txt'):
    for ln in open('marks.txt'):
        p = ln.split()
        if not p or p[0].startswith('#'): continue
        if len(p) == 2 and re.fullmatch(r'-?[\d.]+', p[1]): T[p[0]] = float(p[1]); continue
        n = int(p[2]) if len(p) > 2 else 1; hits = [w for w in words if norm(w['w']) == norm(p[1])]
        if len(hits) < n: sys.exit(f'mark {p[0]}: "{p[1]}" occurs {len(hits)} times, wanted #{n}')
        T[p[0]] = hits[n - 1]['t']
# group into sentences, then lines (<= MAXC chars), then pages (<= NL lines)
L = lambda ln: sum(len(w['w']) for w in ln) + len(ln) - 1
sents, cur = [], []
for w in words:
    cur.append(w)
    if re.search(r'[.?!:]$', w['w']) and not re.fullmatch(r'[\d.]+', w['w'].rstrip('.?!:')): sents.append(cur); cur = []
if cur: sents.append(cur)
lines = []
for s in sents:
    ln = []
    for w in s:
        if ln and L(ln + [w]) > MAXC: lines.append(ln); ln = []
        ln.append(w)
    if ln:
        if len(ln) == 1 and lines and lines[-1] and lines[-1][-1] in s:      # orphan: steal a word or merge
            prev = lines[-1]
            if len(prev) >= 3: ln.insert(0, prev.pop())
            else: prev.extend(ln); ln = []
        if ln: lines.append(ln)
pages, pg = [], []
for ln in lines:
    sent_end = re.search(r'[.?!:]$', pg[-1][-1]['w']) if pg else False
    if pg and (len(pg) >= NL or sent_end): pages.append(pg); pg = []
    pg.append(ln)
if pg: pages.append(pg)
out = []
for i, pg in enumerate(pages):
    ws = [w for ln in pg for w in ln]
    s = round(max(0, ws[0]['t'] - 0.05), 3)
    nxt = pages[i + 1][0][0]['t'] - 0.05 if i + 1 < len(pages) else dur
    out.append({'s': s, 'e': round(min(nxt, ws[-1]['e'] + 0.6), 3), 'words': ws, 'lines': pg})
single = [ln for pg in pages for ln in pg if len(ln) == 1]
json.dump({'duration': round(dur, 3), 'T': T, 'pages': out}, open('rem/src/data.json', 'w'))
print(f'{len(out)} pages, {len(T)} marks, duration {dur:.2f}s' + (f'  WARNING single-word lines: {[l[0]["w"] for l in single]}' if single else ''))
