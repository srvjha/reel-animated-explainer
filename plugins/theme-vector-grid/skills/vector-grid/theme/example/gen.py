import json, re, os
P = './video-projects/ai-sd-ep3-semantic-cache'
W = json.load(open('./work/words.json'))['words']
DUR = 126.83
TEAL, RED, GREEN, AMBER, INK = '#2DE2C8', '#FF4D5E', '#7CF29A', '#FFC857', '#F2F6F8'
REDIS = open(P + '/assets/redis.path').read()

def norm(s): return re.sub(r'[^a-z0-9.]', '', s.lower()).rstrip('.')
def T(word, after=0.0):
    for w in W:
        if w['start'] >= after - 0.05 and norm(w['text']).startswith(norm(word)):
            return w['start']
    raise Exception('word not found ' + word + ' after ' + str(after))

# ---------------- layouts ----------------
LAY = [(0, 'split'), (10.4, 'full'), (13.0, 'split'), (14.4, 'face'), (16.9, 'split'), (22.4, 'full'), (24.1, 'split'),
       (25.4, 'punch'), (26.8, 'full'), (29.9, 'split'), (35.0, 'full'), (38.0, 'split'), (41.3, 'full'), (43.9, 'split'),
       (48.2, 'punch'), (49.4, 'full'), (52.3, 'split'), (58.8, 'full'), (62.2, 'split'), (65.0, 'full'), (68.1, 'split'),
       (74.2, 'punch'), (76.1, 'full'), (79.0, 'split'), (81.2, 'full'), (84.0, 'split'), (85.3, 'face'), (86.6, 'split'),
       (91.3, 'full'), (94.9, 'split'), (97.4, 'full'), (99.9, 'split'), (104.0, 'face'), (104.7, 'split'),
       (108.8, 'full'), (111.4, 'split'), (114.9, 'full'), (116.9, 'punch'), (118.5, 'full'), (120.4, 'split'), (124.0, 'full'), (125.4, 'split')]
def lay_at(t):
    m = LAY[0][1]
    for a, l in LAY:
        if t + 1e-6 >= a: m = l
    return m

# ---------------- scenes ----------------
SC = []
def scene(sid, a, b, html, js):
    SC.append((sid, a, b, html, js))

def F(t, a): return f'{max(0.0, t - a):.2f}'

HDR = lambda txt: f'<div class="hdr"><span class="dot"></span>{txt}</div>'

# s01 hook
a, b = 0.0, 5.3
scene('s01', a, b, f'''
<div class="tag mono" id="s01tag">AI SYSTEM DESIGN · EP 03</div>
<div class="ttl" id="s01l1" style="top:220px">Why your normal <span style="color:#FF4438">Redis</span> cache</div>
<div class="ttl" id="s01l2" style="top:300px"><span style="color:{RED}">won't work</span> for AI chatbots?</div>
<div class="card" id="s01redis" style="left:110px;top:450px;width:330px;height:300px">
  <div class="logo-tile" style="background:#FF4438"><svg viewBox="0 0 24 24" width="92" height="92"><path fill="#fff" d="{REDIS}"/></svg></div>
  <div class="mono kv" style="top:200px">GET "refund?"</div>
</div>
<div class="link" id="s01link" style="left:450px;top:592px;width:180px"></div>
<div class="xmark" id="s01x" style="left:500px;top:556px">✕</div>
<div class="card" id="s01bot" style="left:640px;top:450px;width:330px;height:300px">
  <div class="bubble" style="left:30px;top:40px">refund kaise milega?</div>
  <div class="bubble alt" style="left:70px;top:140px">mere paise kab milenge?</div>
  <div class="mono kv" style="top:236px;color:{TEAL}">AI chatbot</div>
</div>''', f'''
tl.from('#s01tag',{{y:-20,opacity:0,duration:.4,ease:'power3.out'}},0);
tl.from('#s01l1',{{y:30,opacity:0,duration:.45,ease:'power3.out'}},0.1);
tl.from('#s01l2',{{y:30,opacity:0,duration:.45,ease:'power3.out'}},{F(T("won't"), a)}-.25);
tl.from('#s01redis',{{scale:.85,opacity:0,duration:.45,ease:'back.out(1.6)'}},{F(T('Redis'), a)});
tl.from('#s01bot',{{scale:.85,opacity:0,duration:.45,ease:'back.out(1.6)'}},{F(T('chatbot'), a)}-.2);
tl.from('#s01link',{{scaleX:0,transformOrigin:'0 50%',duration:.4}},{F(T('chatbot'), a)});
tl.from('#s01x',{{scale:0,opacity:0,duration:.3,ease:'back.out(2.5)'}},{F(T('chatbot'), a)}+.25);
tl.to('#s01-root',{{scale:1.04,duration:{b-a:.2f},ease:'none'}},0);''')

# s02 normal caching
a, b = 5.3, 14.4
chips = ''.join(f'<div class="chip mono req" style="left:70px;top:{300+i*82}px">GET /faq/refund</div>' for i in range(5))
scene('s02', a, b, f'''
{HDR('BASICS · NORMAL CACHING')}
<div class="ttl" id="s02t" style="top:200px;font-size:52px">Same request, again and again</div>
{chips}
<div class="card node" id="s02cache" style="left:470px;top:330px;width:250px;height:250px">
  <div class="logo-tile sm" style="background:#FF4438"><svg viewBox="0 0 24 24" width="62" height="62"><path fill="#fff" d="{REDIS}"/></svg></div>
  <div class="nlab">CACHE</div></div>
<div class="card node" id="s02db" style="left:780px;top:330px;width:230px;height:250px">
  <svg viewBox="0 0 80 90" width="80" height="90" style="position:absolute;left:75px;top:40px"><ellipse cx="40" cy="14" rx="34" ry="11" fill="none" stroke="#9fb3bd" stroke-width="5"/><path d="M6 14v58c0 6 15 11 34 11s34-5 34-11V14" fill="none" stroke="#9fb3bd" stroke-width="5"/><path d="M6 43c0 6 15 11 34 11s34-5 34-11" fill="none" stroke="#9fb3bd" stroke-width="5"/></svg>
  <div class="nlab">DATABASE</div></div>
<div class="pill miss" id="s02skip" style="left:820px;top:610px">skipped</div>
<div class="pill hit" id="s02hit" style="left:470px;top:610px">served from cache</div>''', f'''
tl.from('#s02-root .hdr',{{opacity:0,x:-20,duration:.4}},0);
tl.from('#s02t',{{opacity:0,y:20,duration:.4}},0.1);
tl.from('#s02-root .req',{{opacity:0,x:-60,duration:.35,stagger:.22,ease:'power3.out'}},{F(T('bahut'), a)});
tl.from('#s02cache',{{opacity:0,scale:.8,duration:.4,ease:'back.out(1.6)'}},{F(T('karte', 10.6), a)});
tl.from('#s02db',{{opacity:0,scale:.8,duration:.4,ease:'back.out(1.6)'}},{F(T('database'), a)});
tl.to('#s02db',{{opacity:.35,duration:.3}},{F(T('nahi', 11.9), a)});
tl.from('#s02skip',{{opacity:0,scale:.6,duration:.3,ease:'back.out(2)'}},{F(T('nahi', 11.9), a)});
tl.to('#s02cache',{{borderColor:'{TEAL}',boxShadow:'0 0 60px rgba(45,226,200,.45)',duration:.3}},{F(T('caches'), a)});
tl.to('#s02-root .req',{{x:360,opacity:0,duration:.35,stagger:.12,ease:'power2.in'}},{F(T('caches'), a)});
tl.from('#s02hit',{{opacity:0,y:20,duration:.35}},{F(T('serve', 13.4), a)});
tl.to('#s02-root',{{scale:1.04,duration:{b-a:.2f},ease:'none'}},0);''')

# s03 support bot
a, b = 16.9, 25.4
scene('s03', a, b, f'''
{HDR('EXAMPLE · CUSTOMER SUPPORT BOT')}
<div class="card" id="s03ph" style="left:150px;top:200px;width:780px;height:610px">
  <div class="chathead"><span class="ldot"></span>AI Support Bot</div>
  <div class="who mono" id="s03wa" style="top:110px;left:40px">User A</div>
  <div class="bubble big" id="s03a" style="left:40px;top:150px">How do I get a refund?</div>
  <div class="who mono" id="s03wb" style="top:300px;left:40px">User B</div>
  <div class="bubble big alt" id="s03b" style="left:40px;top:340px">When will I get my money back?</div>
  <div class="pill hit teal" id="s03same" style="left:40px;top:500px">same meaning</div>
  <div class="pill miss" id="s03diff" style="left:330px;top:500px">different words</div>
</div>''', f'''
tl.from('#s03-root .hdr',{{opacity:0,x:-20,duration:.4}},0);
tl.from('#s03ph',{{opacity:0,y:40,duration:.5,ease:'power3.out'}},0);
tl.from('#s03wa,#s03a',{{opacity:0,y:20,duration:.35,ease:'back.out(1.6)'}},{F(T('refund'), a)}-.3);
tl.from('#s03wb,#s03b',{{opacity:0,y:20,duration:.35,ease:'back.out(1.6)'}},{F(T('mere'), a)});
tl.from('#s03same',{{opacity:0,scale:.6,duration:.3,ease:'back.out(2)'}},{F(T('matlab', 24), a)});
tl.from('#s03diff',{{opacity:0,scale:.6,duration:.3,ease:'back.out(2)'}},{F(T('matlab', 24), a)}+.35);
tl.to('#s03a,#s03b',{{borderColor:'{TEAL}',duration:.3}},{F(T('matlab', 24), a)});
tl.to('#s03-root',{{scale:1.04,duration:{b-a:.2f},ease:'none'}},0);''')

# s04 section / open loop
a, b = 26.8, 29.9
rows = ''.join(f'<div class="row4" style="top:{390+i*120}px"><span class="mono n">0{i+1}</span>{t}</div>' for i, t in enumerate(['Exact-match cache', 'Semantic cache', 'The traps']))
scene('s04', a, b, f'''
<div class="tag mono" id="s04tag" style="top:180px">HOW AI CHATBOTS CACHE</div>
<div class="ttl" id="s04t" style="top:250px;font-size:66px">Caching for <span style="color:{TEAL}">AI chatbots</span></div>
{rows}''', f'''
tl.from('#s04tag',{{opacity:0,y:-20,duration:.4}},0);
tl.from('#s04t',{{opacity:0,y:30,duration:.45,ease:'power3.out'}},.1);
tl.from('#s04-root .row4',{{opacity:0,x:-40,duration:.4,stagger:.25,ease:'power3.out'}},.5);
tl.to('#s04-root .row4',{{filter:'blur(7px)',opacity:.55,duration:.5,stagger:.1}},2.1);
tl.to('#s04-root',{{scale:1.04,duration:{b-a:.2f},ease:'none'}},0);''')

# s05 exact match
a, b = 29.9, 41.3
scene('s05', a, b, f'''
{HDR('01 · EXACT-MATCH CACHE')}
<div class="card" id="s05tab" style="left:70px;top:200px;width:940px;height:250px">
  <div class="th mono" style="left:40px">KEY</div><div class="th mono" style="left:560px">VALUE</div>
  <div class="mono cell" id="s05k" style="left:40px;top:110px">"how do i get a refund?"</div>
  <div class="mono cell dim" style="left:560px;top:110px">"Refunds take…"</div>
  <div class="und" id="s05u" style="left:40px;top:165px;width:470px"></div>
  <div class="ill" style="position:absolute;left:40px;top:200px">must match the key character for character</div>
</div>
<div class="card q" id="s05q1" style="left:70px;top:490px;width:940px"><span class="mono">"how do i get a refund?"</span><span class="pill hit r">HIT</span></div>
<div class="card q" id="s05q2" style="left:70px;top:640px;width:940px"><span class="mono">"how do i get a refund<span class="comma">,</span>?"</span><span class="pill miss r" id="s05miss">MISS</span></div>''', f'''
tl.from('#s05-root .hdr',{{opacity:0,x:-20,duration:.4}},0);
tl.from('#s05tab',{{opacity:0,y:30,duration:.45,ease:'power3.out'}},0.2);
tl.to('#s05tab',{{borderColor:'{TEAL}',duration:.3}},{F(T('exact', 33), a)});
tl.from('#s05u',{{scaleX:0,transformOrigin:'0 50%',duration:.5}},{F(T('bilkul', 36), a)});
tl.from('#s05q1',{{opacity:0,y:24,duration:.35}},{F(T('text', 37.5), a)});
tl.from('#s05q1 .pill',{{opacity:0,scale:.5,duration:.25,ease:'back.out(2)'}},{F(T('text', 37.5), a)}+.4);
tl.from('#s05q2',{{opacity:0,y:24,duration:.35}},{F(T('agar', 39), a)});
tl.from('#s05q2 .comma',{{opacity:0,scale:3,duration:.3}},{F(T('comma', 39.6), a)});
tl.from('#s05miss',{{opacity:0,scale:.5,duration:.25,ease:'back.out(2)'}},{F(T('miss', 40.5), a)});
tl.to('#s05-root',{{scale:1.04,duration:{b-a:.2f},ease:'none'}},0);''')

# s06 thousand ways
a, b = 41.3, 48.2
para = ['refund kaise milega?', 'how to get a refund', 'refund process?', 'paise wapas kab?', 'I want my money back', 'refund status pls', 'can I return this?', 'how do refunds work']
chips = ''.join(f'<div class="chip mono para" style="left:{70 + (i % 2) * 480}px;top:{220 + (i // 2) * 105}px">{p}<span class="mx">MISS</span></div>' for i, p in enumerate(para))
scene('s06', a, b, f'''
{HDR('01 · EXACT-MATCH CACHE')}
{chips}
<div class="ttl" id="s06k" style="top:660px;font-size:56px"><span style="color:{AMBER}">×1000</span> ways to ask one thing</div>
<div class="ttl" id="s06no" style="top:750px;font-size:46px;color:{RED}">✕ Exact match is not a good fit</div>''', f'''
tl.from('#s06-root .hdr',{{opacity:0,x:-20,duration:.4}},0);
tl.from('#s06-root .para',{{opacity:0,y:20,duration:.3,stagger:.16,ease:'power3.out'}},{F(T('ek hi', 42), a)});
tl.from('#s06-root .mx',{{opacity:0,scale:.4,duration:.2,stagger:.16}},{F(T('ek hi', 42), a)}+.3);
tl.from('#s06k',{{opacity:0,y:20,duration:.4}},{F(T('hazaar'), a)});
tl.from('#s06no',{{opacity:0,y:20,duration:.4}},{F(T('achha'), a)});
tl.to('#s06-root',{{scale:1.04,duration:{b-a:.2f},ease:'none'}},0);''')

# s07 semantic
a, b = 49.4, 52.3
scene('s07', a, b, f'''
<div class="tag mono" id="s07tag" style="top:200px">02 · SEMANTIC CACHE</div>
<div class="ttl" id="s07t" style="top:270px;font-size:80px;color:{TEAL}">Semantic caching</div>
<div class="ttl" id="s07a" style="top:450px;font-size:58px">Match the <span id="s07w" class="strike">words</span></div>
<div class="ttl" id="s07b" style="top:550px;font-size:58px">Match the <span style="color:{TEAL}">meaning</span> ✓</div>''', f'''
tl.from('#s07tag',{{opacity:0,y:-20,duration:.4}},0);
tl.from('#s07t',{{opacity:0,scale:.9,duration:.5,ease:'back.out(1.5)'}},.1);
tl.from('#s07a',{{opacity:0,y:20,duration:.3}},{F(T('words', 50.5), a)}-.2);
tl.to('#s07w',{{'--s':1,color:'{RED}',duration:.3}},{F(T('nahi', 50.9), a)});
tl.from('#s07b',{{opacity:0,y:20,duration:.35}},{F(T('meaning', 51.4), a)});
tl.to('#s07-root',{{scale:1.04,duration:{b-a:.2f},ease:'none'}},0);''')

# s08 embeddings
a, b = 52.3, 58.8
nums = ['0.12', '-0.48', '0.91', '0.07', '-0.33', '0.56', '-0.12', '0.74']
cells = ''.join(f'<span class="vn">{n}</span>' for n in nums)
scene('s08', a, b, f'''
{HDR('02 · EMBEDDINGS')}
<div class="card q" id="s08q" style="left:70px;top:210px;width:940px"><span class="mono">"how do i get a refund?"</span></div>
<div class="arrowd" id="s08ar" style="left:520px;top:330px"></div>
<div class="chip mono" id="s08m" style="left:330px;top:350px;background:#13212a;color:{TEAL}">embedding model</div>
<div class="card vec mono" id="s08v" style="left:70px;top:470px;width:940px">[ {cells} … ]</div>
<div class="ttl" id="s08l" style="top:640px;font-size:46px">A list of numbers</div>
<div class="ttl" id="s08l2" style="top:705px;font-size:46px;color:{TEAL}">= the meaning of the text</div>
<div class="ill" style="position:absolute;right:70px;top:420px">values illustrative · real ones have 100s of numbers</div>''', f'''
tl.from('#s08-root .hdr',{{opacity:0,x:-20,duration:.4}},0);
tl.from('#s08q',{{opacity:0,y:24,duration:.4}},{F(T('question', 52.8), a)});
tl.from('#s08ar,#s08m',{{opacity:0,y:-10,duration:.3}},{F(T('embeddings', 53.3), a)});
tl.from('#s08v',{{opacity:0,y:24,duration:.4}},{F(T('create', 53.9), a)});
tl.from('#s08-root .vn',{{opacity:0,y:12,duration:.2,stagger:.07}},{F(T('create', 53.9), a)}+.2);
tl.from('#s08l',{{opacity:0,y:20,duration:.35}},{F(T('numbers'), a)});
tl.from('#s08l2',{{opacity:0,y:20,duration:.35}},{F(T('meaning', 57), a)});
tl.to('#s08-root .vn',{{color:'{TEAL}',duration:.3,stagger:.04}},{F(T('meaning', 57), a)});
tl.to('#s08-root',{{scale:1.04,duration:{b-a:.2f},ease:'none'}},0);''')

# s09 vector space
a, b = 58.8, 68.1
import math
def pts(cx, cy, n, r, seed):
    out = []
    for i in range(n):
        ang = (i * 2.399 + seed) % (2 * math.pi); rr = r * (0.35 + 0.65 * ((i * 0.618 + seed) % 1))
        out.append((cx + rr * math.cos(ang), cy + rr * math.sin(ang)))
    return out
dots = ''
for (cx, cy, col, cls, lab) in [(300, 330, TEAL, 'cr', 'refund questions'), (760, 250, '#7f8f99', 'cg', 'shipping'), (720, 560, '#7f8f99', 'cg', 'password reset')]:
    for x, y in pts(cx, cy, 7, 70, cx / 100):
        dots += f'<div class="pt {cls}" style="left:{x:.0f}px;top:{y:.0f}px;background:{col}"></div>'
    dots += f'<div class="plab mono {cls}" style="left:{cx-90}px;top:{cy+90}px;color:{col}">{lab}</div>'
scene('s09', a, b, f'''
{HDR('02 · VECTOR SPACE')}
<div class="card" id="s09p" style="left:70px;top:190px;width:940px;height:640px;overflow:hidden">
  <div class="pgrid"></div>{dots}
  <div class="pt cached" id="s09c" style="left:330px;top:300px"></div>
  <svg id="s09line" width="940" height="640" style="position:absolute;left:0;top:0"><line x1="338" y1="308" x2="398" y2="368" stroke="{AMBER}" stroke-width="4" stroke-dasharray="10 8"/></svg>
  <div class="pt newq" id="s09n" style="left:390px;top:360px"></div>
  <div class="chip mono" id="s09nl" style="left:430px;top:390px;font-size:24px;color:{AMBER}">"when will I get my money back?"</div>
  <div class="pill hit teal" id="s09sim" style="left:470px;top:470px">similarity check</div>
</div>
<div class="ill" style="position:absolute;left:80px;top:840px">2D sketch · real embeddings have many dimensions</div>''', f'''
tl.from('#s09-root .hdr',{{opacity:0,x:-20,duration:.4}},0);
tl.from('#s09p',{{opacity:0,duration:.4}},0);
tl.from('#s09-root .pt',{{scale:0,duration:.3,stagger:.025,ease:'back.out(2)'}},.1);
tl.from('#s09-root .plab',{{opacity:0,duration:.3}},.6);
tl.to('#s09-root .cr',{{scale:1.5,duration:.25,yoyo:true,repeat:1}},{F(T('Same', 58.9), a)});
tl.from('#s09n',{{x:420,y:-260,scale:2,opacity:0,duration:.9,ease:'power3.out'}},{F(T('naya'), a)});
tl.from('#s09nl',{{opacity:0,x:30,duration:.35}},{F(T('question', 62), a)});
tl.from('#s09line',{{opacity:0,duration:.3}},{F(T('similarity', 66), a)});
tl.from('#s09sim',{{opacity:0,scale:.6,duration:.3,ease:'back.out(2)'}},{F(T('similarity', 66), a)}+.2);
tl.to('#s09-root',{{scale:1.04,duration:{b-a:.2f},ease:'none'}},0);''')

# s10 threshold
a, b = 68.1, 76.1
scene('s10', a, b, f'''
{HDR('02 · SIMILARITY THRESHOLD')}
<div class="card" id="s10g" style="left:70px;top:200px;width:940px;height:300px">
  <div class="mono glab" style="left:40px;top:40px">similarity</div>
  <div class="mono gval" id="s10val" style="right:40px;top:24px">0.97</div>
  <div class="track"><div class="fill" id="s10f"></div></div>
  <div class="thr" id="s10thr"></div>
  <div class="mono thl" id="s10thl">threshold 0.95</div>
  <div class="ill" style="position:absolute;left:40px;top:250px">example values · tune for your data</div>
</div>
<div class="pill hit big" id="s10hit" style="left:70px;top:540px">✓ CACHE HIT</div>
<div class="card q" id="s10ans" style="left:70px;top:650px;width:940px"><span class="mono" style="color:{GREEN}">↩ return the cached answer</span></div>
<div class="pill miss" id="s10llm" style="left:560px;top:556px">no LLM call</div>''', f'''
tl.from('#s10-root .hdr',{{opacity:0,x:-20,duration:.4}},0);
tl.from('#s10g',{{opacity:0,y:30,duration:.4}},0);
tl.from('#s10f',{{scaleX:0,transformOrigin:'0 50%',duration:1.2,ease:'power2.out'}},{F(T('similarity', 68.3), a)});
tl.from('#s10val',{{opacity:0,duration:.3}},{F(T('similarity', 68.3), a)}+.8);
tl.from('#s10thr,#s10thl',{{opacity:0,y:-20,duration:.35}},{F(T('threshold', 69), a)});
tl.from('#s10hit',{{opacity:0,scale:.6,duration:.3,ease:'back.out(2)'}},{F(T('hit', 71.9), a)});
tl.from('#s10ans',{{opacity:0,x:-40,duration:.4}},{F(T('purana'), a)});
tl.from('#s10llm',{{opacity:0,scale:.6,duration:.3,ease:'back.out(2)'}},{F(T('LLM', 74), a)});
tl.to('#s10-root',{{scale:1.04,duration:{b-a:.2f},ease:'none'}},0);''')

# s11 race
a, b = 76.1, 86.6
scene('s11', a, b, f'''
{HDR('WHY IT PAYS OFF')}
<div class="card lane" id="s11a" style="left:70px;top:220px;width:940px">
  <div class="lt">LLM call</div><div class="track"><div class="fill slow" id="s11af"></div></div>
  <div class="mono lv" id="s11as" style="color:{RED}">seconds</div><div class="mono lv2" id="s11ae" style="color:{RED}">$$$ expensive</div></div>
<div class="card lane" id="s11b" style="left:70px;top:520px;width:940px">
  <div class="lt">Embedding + similarity search</div><div class="track"><div class="fill" id="s11bf"></div></div>
  <div class="mono lv" id="s11bs" style="color:{GREEN}">milliseconds</div><div class="mono lv2" id="s11be" style="color:{GREEN}">¢ cheap</div></div>''', f'''
tl.from('#s11-root .hdr',{{opacity:0,x:-20,duration:.4}},0);
tl.from('#s11a',{{opacity:0,y:30,duration:.4}},{F(T('LLM', 77.4), a)}-.2);
tl.from('#s11af',{{scaleX:0,transformOrigin:'0 50%',duration:3.2,ease:'none'}},{F(T('call', 77.8), a)});
tl.from('#s11as',{{opacity:0,y:10,duration:.3}},{F(T('seconds'), a)});
tl.from('#s11ae',{{opacity:0,y:10,duration:.3}},{F(T('expensive'), a)});
tl.from('#s11b',{{opacity:0,y:30,duration:.4}},{F(T('embeddings', 81), a)});
tl.from('#s11bf',{{scaleX:0,transformOrigin:'0 50%',duration:.25,ease:'power4.out'}},{F(T('search', 82), a)});
tl.from('#s11bs',{{opacity:0,y:10,duration:.3}},{F(T('milliseconds'), a)});
tl.from('#s11be',{{opacity:0,y:10,duration:.3}},{F(T('cheap'), a)});
tl.to('#s11-root',{{scale:1.04,duration:{b-a:.2f},ease:'none'}},0);''')

# s12 risk / bloom
a, b = 86.6, 91.3
bits = ''.join(f'<div class="bit" id="s12b{i}" style="left:{40+i*72}px">{0}</div>' for i in range(12))
scene('s12', a, b, f'''
{HDR('THE TRAP')}
<div class="ttl" id="s12r" style="top:200px;font-size:64px;color:{AMBER}">⚠ A big risk</div>
<div class="card" id="s12bf" style="left:70px;top:330px;width:940px;height:300px">
  <div class="mono glab" style="left:40px;top:30px">Bloom filter</div>
  <div class="bits">{bits}</div>
  <div class="mono glab" id="s12q" style="left:40px;top:210px;color:{AMBER}">"seen this?" → maybe yes</div>
</div>
<div class="pill miss big" id="s12fp" style="left:70px;top:670px">FALSE POSITIVE</div>
<div class="ill" id="s12n" style="position:absolute;left:470px;top:690px">a "yes" that is actually wrong</div>''', f'''
tl.from('#s12-root .hdr',{{opacity:0,x:-20,duration:.4}},0);
tl.from('#s12r',{{opacity:0,scale:.8,duration:.35,ease:'back.out(2)'}},0);
tl.from('#s12bf',{{opacity:0,y:30,duration:.4}},{F(T('bloom'), a)}-.2);
tl.set('#s12b2,#s12b5,#s12b9',{{textContent:'1'}},{F(T('filter', 87.9), a)}+.3);
tl.to('#s12b2,#s12b5,#s12b9',{{backgroundColor:'rgba(255,200,87,.25)',borderColor:'{AMBER}',color:'{AMBER}',duration:.25,stagger:.12}},{F(T('filter', 87.9), a)}+.3);
tl.from('#s12q',{{opacity:0,y:10,duration:.3}},{F(T('trade-off'), a)});
tl.from('#s12fp',{{opacity:0,scale:.6,duration:.3,ease:'back.out(2)'}},{F(T('false', 89.9), a)});
tl.from('#s12n',{{opacity:0,duration:.3}},{F(T('false', 89.9), a)}+.4);
tl.to('#s12-root',{{scale:1.04,duration:{b-a:.2f},ease:'none'}},0);''')

# s13 cancel vs don't cancel
a, b = 91.3, 101.6
scene('s13', a, b, f'''
{HDR('THE TRAP · FALSE POSITIVE')}
<div class="bubble big" id="s13a" style="left:70px;top:200px">Cancel my order</div>
<div class="bubble big alt" id="s13b" style="left:70px;top:330px"><span style="color:{RED}">Don't</span> cancel my order</div>
<div class="card" id="s13p" style="left:70px;top:470px;width:560px;height:340px;overflow:hidden">
  <div class="pgrid"></div>
  <div class="pt" id="s13pa" style="left:250px;top:150px;background:{TEAL}"></div>
  <div class="pt" id="s13pb" style="left:282px;top:168px;background:{RED}"></div>
  <div class="mono plab" id="s13pl" style="left:150px;top:220px;color:{AMBER}">almost the same point</div>
</div>
<div class="card" id="s13s" style="left:660px;top:470px;width:350px;height:340px">
  <div class="mono glab" style="left:30px;top:30px">similarity</div>
  <div class="mono gval" style="left:30px;top:80px;color:{AMBER}">0.96</div>
  <div class="ill" style="position:absolute;left:30px;top:170px">example</div>
  <div class="mono" id="s13o" style="position:absolute;left:30px;top:220px;font-size:30px;font-weight:700;color:{RED};line-height:1.2">opposite<br>meaning</div>
</div>''', f'''
tl.from('#s13-root .hdr',{{opacity:0,x:-20,duration:.4}},0);
tl.from('#s13a',{{opacity:0,y:20,duration:.35,ease:'back.out(1.6)'}},{F(T('mera', 93.9), a)});
tl.from('#s13b',{{opacity:0,y:20,duration:.35,ease:'back.out(1.6)'}},{F(T('mera', 96.3), a)});
tl.from('#s13p',{{opacity:0,y:30,duration:.4}},{F(T('Dono', 98), a)});
tl.from('#s13pa',{{x:-160,y:-80,duration:.6,ease:'power3.out'}},{F(T('Dono', 98), a)}+.1);
tl.from('#s13pb',{{x:160,y:90,duration:.6,ease:'power3.out'}},{F(T('Dono', 98), a)}+.1);
tl.from('#s13pl',{{opacity:0,duration:.3}},{F(T('pass', 99), a)});
tl.from('#s13s',{{opacity:0,y:30,duration:.4}},{F(T('pass', 99), a)});
tl.from('#s13o',{{opacity:0,scale:.7,duration:.3,ease:'back.out(2)'}},{F(T('ulta'), a)});
tl.to('#s13-root',{{scale:1.04,duration:{b-a:.2f},ease:'none'}},0);''')

# s14 tune
a, b = 101.6, 104.0
scene('s14', a, b, f'''
{HDR('FIX 1 · TUNE THE THRESHOLD')}
<div class="card" id="s14c" style="left:70px;top:250px;width:940px;height:420px">
  <div class="mono glab" style="left:40px;top:40px">threshold</div>
  <div class="track" style="top:170px"><div class="fill" style="background:linear-gradient(90deg,{RED},{AMBER} 55%,{GREEN})"></div></div>
  <div class="knob" id="s14k"></div>
  <div class="mono glab" style="left:40px;top:250px;color:{RED};font-size:26px">too low: wrong hits</div>
  <div class="mono glab" style="right:40px;top:250px;color:{AMBER};font-size:26px">too high: few hits</div>
  <div class="ill" style="position:absolute;left:40px;top:340px">tune it on your real queries</div>
</div>''', f'''
tl.from('#s14-root .hdr',{{opacity:0,x:-20,duration:.4}},0);
tl.from('#s14c',{{opacity:0,y:30,duration:.4}},0);
tl.fromTo('#s14k',{{x:0}},{{x:620,duration:.8,ease:'power2.inOut'}},.4);
tl.to('#s14k',{{x:430,duration:.6,ease:'power2.inOut'}},1.2);
tl.to('#s14k',{{x:520,duration:.6,ease:'power3.out'}},1.8);
tl.to('#s14-root',{{scale:1.04,duration:{b-a:.2f},ease:'none'}},0);''')

# s15 user specific
a, b = 104.7, 108.8
scene('s15', a, b, f'''
{HDR('FIX 2 · SKIP USER-SPECIFIC QUESTIONS')}
<div class="card q" id="s15q" style="left:70px;top:210px;width:940px"><span class="mono">"Where is <span style="color:{AMBER}">my</span> order?"</span><span class="pill r" style="color:{AMBER};border:2px solid {AMBER}">user-specific</span></div>
<div class="card node" id="s15c" style="left:110px;top:400px;width:320px;height:250px">
  <div class="logo-tile sm" style="background:#FF4438;opacity:.5"><svg viewBox="0 0 24 24" width="62" height="62"><path fill="#fff" d="{REDIS}"/></svg></div>
  <div class="nlab">CACHE</div><div class="xmark sm" id="s15x">✕</div></div>
<div class="card node" id="s15l" style="left:650px;top:400px;width:320px;height:250px">
  <div class="ldot big"></div><div class="nlab" style="color:{GREEN}">LIVE LOOKUP</div></div>
<div class="link" id="s15ln" style="left:430px;top:525px;width:220px;background:{GREEN}"></div>
<div class="mono glab" id="s15rt" style="position:absolute;left:650px;top:680px;color:{GREEN}">real-time, never cached</div>''', f'''
tl.from('#s15-root .hdr',{{opacity:0,x:-20,duration:.4}},0);
tl.from('#s15q',{{opacity:0,y:24,duration:.4}},0);
tl.from('#s15c',{{opacity:0,scale:.8,duration:.4,ease:'back.out(1.6)'}},{F(T('cache', 106), a)}-.1);
tl.from('#s15x',{{opacity:0,scale:0,duration:.3,ease:'back.out(2.5)'}},{F(T('nahi', 106.7), a)});
tl.from('#s15l',{{opacity:0,scale:.8,duration:.4,ease:'back.out(1.6)'}},{F(T('real-time'), a)}-.2);
tl.from('#s15ln',{{scaleX:0,transformOrigin:'0 50%',duration:.4}},{F(T('real-time'), a)});
tl.from('#s15rt',{{opacity:0,y:10,duration:.3}},{F(T('real-time'), a)}+.2);
tl.to('#s15-root',{{scale:1.04,duration:{b-a:.2f},ease:'none'}},0);''')

# s16 TTL & invalidation
a, b = 108.8, 116.9
rows = ''
for i, (k, cls) in enumerate([('"how do i get a refund?"', 'stale'), ('"shipping time?"', ''), ('"reset password"', '')]):
    rows += f'<div class="ttlrow {cls}" id="s16r{i}" style="top:{110+i*95}px"><span class="mono">{k}</span><div class="tbar"><div class="tfill" id="s16t{i}"></div></div></div>'
scene('s16', a, b, f'''
{HDR('FIX 3 · TTL + INVALIDATION')}
<div class="card" id="s16c" style="left:70px;top:190px;width:940px;height:420px">
  <div class="mono glab" style="left:40px;top:34px">cache entries · TTL</div>{rows}
  <div class="pill miss" id="s16st" style="left:640px;top:96px">STALE</div>
</div>
<div class="card" id="s16doc" style="left:70px;top:640px;width:460px;height:170px">
  <div class="mono glab" style="left:30px;top:26px">Refund policy</div>
  <div class="mono gv2" id="s16v1" style="left:30px;top:84px">v1</div>
  <div class="mono gv2" id="s16v2" style="left:30px;top:84px;color:{AMBER}">v2 · updated</div>
</div>
<div class="card" id="s16inv" style="left:560px;top:640px;width:450px;height:170px">
  <div class="mono glab" style="left:30px;top:26px;color:{TEAL}">cache invalidation</div>
  <div class="mono" style="position:absolute;left:30px;top:84px;font-size:26px;color:{INK}">clear it when data changes</div>
</div>''', f'''
tl.from('#s16-root .hdr',{{opacity:0,x:-20,duration:.4}},0);
tl.from('#s16c',{{opacity:0,y:30,duration:.4}},0);
tl.from('#s16-root .ttlrow',{{opacity:0,x:-30,duration:.3,stagger:.12}},.2);
tl.fromTo('#s16t0',{{scaleX:1}},{{scaleX:.55,duration:6,ease:'none'}},.3);
tl.fromTo('#s16t1',{{scaleX:.8}},{{scaleX:.2,duration:6,ease:'none'}},.3);
tl.fromTo('#s16t2',{{scaleX:.6}},{{scaleX:.05,duration:6,ease:'none'}},.3);
tl.from('#s16doc',{{opacity:0,y:30,duration:.4}},{F(T('policy', 110.7), a)});
tl.from('#s16v2',{{opacity:0,duration:.01}},{F(T('change', 111), a)});
tl.to('#s16v1',{{opacity:0,duration:.01}},{F(T('change', 111), a)});
tl.from('#s16st',{{opacity:0,scale:.6,duration:.3,ease:'back.out(2)'}},{F(T('serve', 112.8), a)});
tl.to('#s16r0',{{borderColor:'{RED}',duration:.3}},{F(T('galat'), a)});
tl.from('#s16inv',{{opacity:0,y:30,duration:.4}},{F(T('invalidation', 115), a)}-.2);
tl.to('#s16r0,#s16st',{{opacity:0,x:120,duration:.4,ease:'power2.in'}},{F(T('invalidation', 115), a)}+.3);
tl.to('#s16-root',{{scale:1.04,duration:{b-a:.2f},ease:'none'}},0);''')

# s17 key = meaning
a, b = 118.5, 120.4
scene('s17', a, b, f'''
<div class="tag mono" id="s17tag" style="top:200px">THE TAKEAWAY</div>
<div class="ttl" id="s17t" style="top:280px;font-size:70px">The cache key is</div>
<div class="ttl" id="s17a" style="top:400px;font-size:70px"><span class="strike on" style="color:{RED}">not the text</span></div>
<div class="ttl" id="s17b" style="top:520px;font-size:78px;color:{TEAL}">it's the meaning</div>''', f'''
tl.from('#s17tag',{{opacity:0,y:-20,duration:.3}},0);
tl.from('#s17t',{{opacity:0,y:20,duration:.3}},0);
tl.from('#s17a',{{opacity:0,y:20,duration:.3}},.15);
tl.from('#s17b',{{opacity:0,scale:.85,duration:.4,ease:'back.out(1.6)'}},{F(T('meaning', 119.5), a)}-.1);
tl.to('#s17-root',{{scale:1.04,duration:{b-a:.2f},ease:'none'}},0);''')

# s18 summary
a, b = 120.4, DUR
chips = ''.join(f'<div class="sumchip" id="s18c{i}" style="top:{200+i*120}px"><span class="mono n">0{i+1}</span>{t}</div>' for i, t in enumerate(['Semantic caching', 'Similarity threshold', 'Careful invalidation']))
scene('s18', a, b, f'''
{chips}
<div class="card stat" id="s18cost" style="left:70px;top:600px;width:450px"><span>LLM cost</span><b>↓</b></div>
<div class="card stat" id="s18lat" style="left:560px;top:600px;width:450px"><span>Latency</span><b>↓</b></div>''', f'''
tl.from('#s18c0',{{opacity:0,x:-40,duration:.35,ease:'power3.out'}},{F(T('Semantic', 120), a)});
tl.from('#s18c1',{{opacity:0,x:-40,duration:.35,ease:'power3.out'}},{F(T('similarity', 121), a)});
tl.from('#s18c2',{{opacity:0,x:-40,duration:.35,ease:'power3.out'}},{F(T('careful', 122), a)});
tl.from('#s18cost',{{opacity:0,y:30,duration:.4,ease:'back.out(1.6)'}},{F(T('cost', 124), a)}-.1);
tl.from('#s18lat',{{opacity:0,y:30,duration:.4,ease:'back.out(1.6)'}},{F(T('latency', 124.5), a)}-.1);
tl.to('#s18cost b,#s18lat b',{{y:14,duration:.35,yoyo:true,repeat:3,ease:'sine.inOut'}},{F(T('kam', 125.5), a)});
tl.to('#s18-root',{{scale:1.04,duration:{b-a:.2f},ease:'none'}},0);''')

SCSS = f'''
.sc{{position:absolute;left:0;top:0;width:1080px;height:880px;font-family:Montserrat,sans-serif;color:{INK};transform-origin:50% 55%}}
.mono{{font-family:'JetBrains Mono',monospace}}
.hdr{{position:absolute;left:70px;top:120px;font:700 26px 'JetBrains Mono';color:{TEAL};letter-spacing:3px;display:flex;align-items:center;gap:14px}}
.hdr .dot{{width:12px;height:12px;border-radius:50%;background:{TEAL};box-shadow:0 0 14px {TEAL}}}
.tag{{position:absolute;left:0;right:0;top:140px;text-align:center;font-size:28px;font-weight:700;letter-spacing:4px;color:{TEAL}}}
.ttl{{position:absolute;left:40px;right:40px;text-align:center;font-weight:900;font-size:62px;line-height:1.1;letter-spacing:-1px;white-space:nowrap}}
.card{{position:absolute;background:rgba(10,18,24,.94);border:2px solid rgba(45,226,200,.26);border-radius:26px;box-shadow:0 20px 50px rgba(0,0,0,.45)}}
.logo-tile{{position:absolute;left:50%;top:40px;width:140px;height:140px;margin-left:-70px;border-radius:30px;display:flex;align-items:center;justify-content:center;box-shadow:0 0 40px rgba(255,68,56,.35)}}
.logo-tile.sm{{width:110px;height:110px;margin-left:-55px;top:34px;border-radius:24px}}
.kv{{position:absolute;left:0;right:0;text-align:center;font-size:28px;font-weight:700;color:#cfd8dc}}
.link{{position:absolute;height:6px;border-radius:3px;background:rgba(242,246,248,.35)}}
.xmark{{position:absolute;width:76px;height:76px;border-radius:50%;background:{RED};color:#fff;font:900 46px Montserrat;display:flex;align-items:center;justify-content:center;box-shadow:0 0 30px rgba(255,77,94,.6)}}
.xmark.sm{{left:auto;right:-20px;top:-20px;width:64px;height:64px;font-size:38px}}
.bubble{{position:absolute;padding:14px 22px;border-radius:22px 22px 22px 6px;background:#1a2a33;border:2px solid rgba(255,255,255,.12);font:700 24px Montserrat;white-space:nowrap}}
.bubble.alt{{background:#22303a}}
.bubble.big{{font-size:40px;padding:22px 32px}}
.chathead{{position:absolute;left:0;right:0;top:0;height:84px;border-bottom:2px solid rgba(255,255,255,.08);display:flex;align-items:center;gap:16px;padding-left:40px;font:800 32px Montserrat}}
.ldot{{width:16px;height:16px;border-radius:50%;background:{GREEN};box-shadow:0 0 12px {GREEN}}}
.ldot.big{{position:absolute;left:50%;top:70px;width:70px;height:70px;margin-left:-35px}}
.who{{position:absolute;font-size:22px;color:rgba(242,246,248,.55)}}
.pill{{position:absolute;padding:10px 22px;border-radius:999px;font:800 28px Montserrat;letter-spacing:1px;white-space:nowrap}}
.pill.big{{font-size:42px;padding:16px 34px}}
.pill.r{{position:absolute;right:28px;top:50%;transform:translateY(-50%)}}
.hit{{background:rgba(124,242,154,.12);color:{GREEN};border:2px solid {GREEN}}}
.hit.teal{{background:rgba(45,226,200,.12);color:{TEAL};border-color:{TEAL}}}
.miss{{background:rgba(255,77,94,.12);color:{RED};border:2px solid {RED}}}
.chip{{position:absolute;padding:14px 22px;border-radius:16px;background:#121d24;border:2px solid rgba(255,255,255,.1);font-size:28px;font-weight:500;white-space:nowrap}}
.para{{width:440px;font-size:26px}}
.mx{{position:absolute;right:16px;top:50%;transform:translateY(-50%);font:800 18px Montserrat;color:{RED};border:2px solid {RED};border-radius:999px;padding:3px 10px}}
.node .nlab{{position:absolute;left:0;right:0;bottom:30px;text-align:center;font:800 28px Montserrat;letter-spacing:2px;color:#cfd8dc}}
.th{{position:absolute;top:36px;font-size:22px;letter-spacing:3px;color:{TEAL};font-weight:700}}
.cell{{position:absolute;font-size:30px;font-weight:500;white-space:nowrap}}
.dim{{color:rgba(242,246,248,.55)}}
.und{{position:absolute;height:5px;background:{AMBER};border-radius:3px}}
.ill{{font:500 21px 'JetBrains Mono';color:rgba(242,246,248,.5)}}
.q{{height:110px;display:flex;align-items:center;padding-left:36px;font-size:32px}}
.comma{{display:inline-block;color:{RED};font-weight:800;text-shadow:0 0 16px {RED}}}
.strike{{position:relative;display:inline-block;--s:0}}
.strike::after{{content:'';position:absolute;left:-6px;right:-6px;top:52%;height:7px;background:{RED};border-radius:4px;transform:scaleX(var(--s));transform-origin:0 50%}}
.strike.on{{--s:1}}
.arrowd{{position:absolute;width:6px;height:130px;background:rgba(242,246,248,.3)}}
.vec{{height:120px;display:flex;align-items:center;padding-left:30px;font-size:30px;color:#9fb3bd;white-space:nowrap}}
.vn{{display:inline-block;margin:0 8px;color:{INK};font-weight:700}}
.pgrid{{position:absolute;inset:0;background-image:linear-gradient(rgba(103,232,249,.08) 1px,transparent 1px),linear-gradient(90deg,rgba(103,232,249,.08) 1px,transparent 1px);background-size:40px 40px}}
.pt{{position:absolute;width:20px;height:20px;margin:-10px 0 0 -10px;border-radius:50%;box-shadow:0 0 14px currentColor}}
.pt.cached{{background:{TEAL};width:28px;height:28px;margin:-14px 0 0 -14px;border:3px solid #fff}}
.pt.newq{{background:{AMBER};width:30px;height:30px;margin:-15px 0 0 -15px;border:3px solid #fff;box-shadow:0 0 24px {AMBER}}}
.plab{{position:absolute;width:180px;text-align:center;font-size:20px;font-weight:700}}
.glab{{position:absolute;font-size:30px;font-weight:700;color:#cfd8dc}}
.gval{{position:absolute;font-size:64px;font-weight:700;color:{GREEN}}}
.gv2{{position:absolute;font-size:40px;font-weight:700}}
.track{{position:absolute;left:40px;right:40px;top:140px;height:34px;border-radius:17px;background:#1b2730;overflow:hidden}}
.fill{{position:absolute;left:0;top:0;bottom:0;width:97%;background:linear-gradient(90deg,{TEAL},{GREEN});border-radius:17px}}
.thr{{position:absolute;left:{40+0.95*860:.0f}px;top:118px;width:5px;height:80px;background:{AMBER};border-radius:3px}}
.thl{{position:absolute;left:{40+0.95*860-250:.0f}px;top:205px;font-size:24px;color:{AMBER};font-weight:700}}
.lane{{height:250px}}
.lane .lt{{position:absolute;left:40px;top:30px;font:800 34px Montserrat}}
.lane .track{{top:105px}}
.fill.slow{{width:100%;background:linear-gradient(90deg,#ff8a5c,{RED})}}
.lv{{position:absolute;left:40px;top:170px;font-size:32px;font-weight:700}}
.lv2{{position:absolute;right:40px;top:170px;font-size:32px;font-weight:700}}
.bits{{position:absolute;left:0;top:100px}}
.bit{{position:absolute;top:0;width:60px;height:72px;border-radius:12px;border:2px solid rgba(255,255,255,.18);font:700 34px 'JetBrains Mono';display:flex;align-items:center;justify-content:center;color:#9fb3bd}}
.knob{{position:absolute;left:40px;top:150px;width:74px;height:74px;border-radius:50%;background:#fff;box-shadow:0 0 0 8px rgba(255,255,255,.15),0 0 30px rgba(255,255,255,.5)}}
.ttlrow{{position:absolute;left:30px;right:30px;height:80px;border-radius:16px;border:2px solid rgba(255,255,255,.08);display:flex;align-items:center;padding-left:24px;font-size:28px}}
.tbar{{position:absolute;right:24px;width:220px;height:14px;border-radius:7px;background:#1b2730;overflow:hidden}}
.tfill{{position:absolute;inset:0;background:{TEAL};transform-origin:0 50%}}
.row4{{position:absolute;left:180px;right:180px;height:96px;border-radius:20px;background:rgba(10,18,24,.94);border:2px solid rgba(45,226,200,.26);display:flex;align-items:center;gap:26px;padding-left:34px;font:800 40px Montserrat}}
.row4 .n,.sumchip .n{{color:{TEAL};font-size:30px}}
.sumchip{{position:absolute;left:70px;right:70px;height:96px;border-radius:20px;background:rgba(10,18,24,.94);border:2px solid {TEAL};display:flex;align-items:center;gap:26px;padding-left:34px;font:800 44px Montserrat;box-shadow:0 0 30px rgba(45,226,200,.18)}}
.stat{{height:160px;display:flex;align-items:center;justify-content:space-between;padding:0 40px;font:800 46px Montserrat;border-color:{GREEN}}}
.stat b{{display:inline-block;color:{GREEN};font-size:90px}}
'''

os.makedirs(P + '/compositions', exist_ok=True)
for sid, a, b, html, js in SC:
    d = b - a
    open(f'{P}/compositions/{sid}.html', 'w').write(f'''<template id="{sid}-template">
  <div data-composition-id="{sid}" data-start="0" data-width="1080" data-height="880" data-duration="{d:.2f}">
    <div class="sc" id="{sid}-root">{html}
    </div>
    <script>
      (function () {{
        window.__timelines = window.__timelines || {{}};
        const tl = gsap.timeline({{ paused: true }});
        {js}
        window.__timelines["{sid}"] = tl;
      }})();
    </script>
  </div>
</template>
''')

# ---------------- captions ----------------
TEALW = ['semantic', 'embedding', 'embeddings', 'meaning', 'similarity', 'threshold', 'invalidation', 'ttl', 'cache', 'caching', 'exact', 'key', 'vector']
REDW = ['miss', 'nahi', 'galat', 'risk', 'false', 'positive', 'expensive', 'seconds', 'ulta', "won't", 'mat', 'comma']
GREENW = ['hit', 'cheap', 'milliseconds', 'kam', 'real-time', 'faayda']
SERIF = ['so', 'matlab', 'lekin', 'toh', 'aur', 'agar', 'isliye', 'jaise', 'maan', 'normally', 'isme']
FIX = {'pass': 'paas', 'Isse': 'Isliye', 'jaige': 'jayega', 'hain.': 'hain.'}
words = [dict(w) for w in W]
for w in words:
    w['text'] = FIX.get(w['text'], w['text'])
# drop duplicate 'liye' after Isliye
clean = []
for i, w in enumerate(words):
    if w['text'] == 'liye' and clean and clean[-1]['text'] == 'Isliye': continue
    clean.append(w)
chunks = []; cur = []
for i, w in enumerate(clean):
    cur.append(w)
    nxt = clean[i + 1] if i + 1 < len(clean) else None
    end_punct = w['text'][-1] in ',.?'
    gap = (nxt['start'] - w['end']) if nxt else 9
    if len(cur) >= 3 or end_punct or gap > 0.18 or (len(cur) >= 2 and nxt and nxt['text'].lower() in ('aur', 'toh', 'lekin', 'agar', 'matlab', 'so')):
        chunks.append(cur); cur = []
if cur: chunks.append(cur)
# avoid single-word chunk orphan where possible: merge single word chunk with next if total <=3 and same phrase
merged = []
for c in chunks:
    if merged and len(c) == 1 and len(merged[-1]) == 1 and c[0]['start'] - merged[-1][-1]['end'] < 0.15:
        merged[-1] = merged[-1] + c
    else:
        merged.append(c)
chunks = merged
caps = []
prev_serif = False
for i, c in enumerate(chunks):
    t0 = c[0]['start'] - 2 / 30
    t1 = chunks[i + 1][0]['start'] - 2 / 30 if i + 1 < len(chunks) else DUR
    t1 = min(t1, c[-1]['end'] + 0.5)
    txt = ' '.join(w['text'] for w in c).rstrip(',.')
    toks = [norm(w['text']) for w in c]
    col = ''
    if any(t in GREENW for t in toks) or ('cache' in toks and 'hit' in toks): col = 'g'
    elif any(t in REDW for t in toks): col = 'r'
    elif any(t in TEALW for t in toks): col = 't'
    serif = (len(c) <= 3 and toks[0] in SERIF and not prev_serif and not col)
    prev_serif = serif
    caps.append({'a': round(max(0, t0), 3), 'b': round(t1, 3), 't': txt, 'c': col, 's': serif, 'l': lay_at(c[0]['start'])})
json.dump(caps, open('./work/caps.json', 'w'), ensure_ascii=False)
ncol = sum(1 for c in caps if c['c']); nser = sum(1 for c in caps if c['s'])
print('captions', len(caps), 'colored %.0f%%' % (100 * ncol / len(caps)), 'serif %.0f%%' % (100 * nser / len(caps)))

CAPY = {'split': 880, 'full': 1560, 'face': 1330, 'punch': 1360}

# ---------------- main ----------------
mounts = ''
for i, (sid, a, b, html, js) in enumerate(SC):
    mounts += f'''      <div id="m-{sid}" class="scene" data-composition-id="{sid}" data-composition-src="compositions/{sid}.html" data-start="{a:.2f}" data-duration="{b-a:.2f}" data-track-index="{2 + i % 2}" data-width="1080" data-height="880"></div>\n'''

laysets = ''
for t, l in LAY:
    if l == 'split':
        laysets += f"tl.set('#face',{{clipPath:'inset(880px 0px 0px 0px)',opacity:1}},{t});tl.set('#facev',{{y:580,scale:1}},{t});tl.set('#stagewrap',{{y:72,scale:.93,opacity:1}},{t});tl.set('#seam',{{opacity:1}},{t});\n"
    elif l == 'full':
        laysets += f"tl.set('#face',{{opacity:0}},{t});tl.set('#stagewrap',{{y:400,scale:1,opacity:1}},{t});tl.set('#seam',{{opacity:0}},{t});\n"
    elif l == 'face':
        laysets += f"tl.set('#face',{{clipPath:'inset(0px 0px 0px 0px)',opacity:1}},{t});tl.set('#facev',{{y:0,scale:1}},{t});tl.set('#stagewrap',{{opacity:0}},{t});tl.set('#seam',{{opacity:0}},{t});\n"
    elif l == 'punch':
        laysets += f"tl.set('#face',{{clipPath:'inset(0px 0px 0px 0px)',opacity:1}},{t});tl.set('#facev',{{y:0,scale:1.32}},{t});tl.set('#stagewrap',{{opacity:0}},{t});tl.set('#seam',{{opacity:0}},{t});\n"
# slow push on face per layout segment
pushes = ''
for i, (t, l) in enumerate(LAY):
    t2 = LAY[i + 1][0] if i + 1 < len(LAY) else DUR
    if l in ('face', 'punch'):
        s0 = 1.0 if l == 'face' else 1.32
        pushes += f"tl.fromTo('#facev',{{scale:{s0}}},{{scale:{s0*1.05:.3f},duration:{t2-t:.2f},ease:'none'}},{t});\n"
    elif l == 'split':
        pushes += f"tl.fromTo('#facev',{{scale:1}},{{scale:1.035,duration:{t2-t:.2f},ease:'none'}},{t});\n"

capjs = json.dumps(caps, ensure_ascii=False)
main = f'''<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=1080, height=1920" />
<title>AI System Design Ep 3 · Semantic Cache</title>
<script src="assets/gsap.min.js"></script>
<style>
@font-face{{font-family:Montserrat;font-weight:600;src:url(assets/fonts/montserrat-latin-600-normal.woff2) format('woff2')}}
@font-face{{font-family:Montserrat;font-weight:800;src:url(assets/fonts/montserrat-latin-800-normal.woff2) format('woff2')}}
@font-face{{font-family:Montserrat;font-weight:900;src:url(assets/fonts/montserrat-latin-900-normal.woff2) format('woff2')}}
@font-face{{font-family:'Abril Fatface';font-weight:400;src:url(assets/fonts/abril-fatface-latin-400-normal.woff2) format('woff2')}}
@font-face{{font-family:'JetBrains Mono';font-weight:500;src:url(assets/fonts/jetbrains-mono-latin-500-normal.woff2) format('woff2')}}
@font-face{{font-family:'JetBrains Mono';font-weight:700;src:url(assets/fonts/jetbrains-mono-latin-700-normal.woff2) format('woff2')}}
*{{margin:0;padding:0;box-sizing:border-box}}
html,body{{width:1080px;height:1920px;overflow:hidden;background:#030507;font-family:Montserrat,sans-serif;color:{INK}}}
#bg{{position:absolute;left:-80px;top:-80px;width:1240px;height:2080px;background-color:#05090c;
 background-image:linear-gradient(rgba(110,231,183,.10) 2px,transparent 2px),linear-gradient(90deg,rgba(110,231,183,.10) 2px,transparent 2px),linear-gradient(rgba(103,232,249,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(103,232,249,.06) 1px,transparent 1px);
 background-size:200px 200px,200px 200px,40px 40px,40px 40px}}
#glow{{position:absolute;inset:0;background:radial-gradient(ellipse 70% 40% at 50% 30%,rgba(45,226,200,.13),transparent 70%),radial-gradient(ellipse 120% 80% at 50% 50%,transparent 55%,rgba(0,0,0,.65))}}
#face{{position:absolute;left:0;top:0;width:1080px;height:1920px;overflow:hidden;clip-path:inset(880px 0px 0px 0px)}}
#facev{{position:absolute;left:0;top:0;width:1080px;height:1920px;transform-origin:540px 700px}}
#facev video{{width:1080px;height:1920px;display:block;object-fit:cover;filter:contrast(1.05) saturate(1.05)}}
#stagewrap{{position:absolute;left:0;top:0;width:1080px;height:880px;transform-origin:50% 0}}
.scene{{position:absolute;left:0;top:0;width:1080px;height:880px}}
#seam{{position:absolute;left:0;top:878px;width:1080px;height:4px;background:linear-gradient(90deg,transparent,{TEAL},transparent);box-shadow:0 0 18px {TEAL}}}
.cap{{position:absolute;left:0;width:1080px;display:flex;justify-content:center;opacity:0}}
.cap span{{display:inline-block;max-width:940px;text-align:center;background:rgba(6,10,14,.9);border:2px solid rgba(242,246,248,.22);border-radius:16px;padding:10px 26px 12px;font:800 62px/1.08 Montserrat;text-transform:uppercase;letter-spacing:-.5px;color:#fff;transform:translateY(-50%)}}
.cap.t span{{color:{TEAL}}} .cap.r span{{color:{RED}}} .cap.g span{{color:{GREEN}}}
.cap.s span{{font-family:'Abril Fatface';font-weight:400;text-transform:none;font-size:66px;letter-spacing:0}}
{SCSS}
</style>
</head>
<body>
  <div id="root" data-composition-id="main" data-start="0" data-duration="{DUR}" data-width="1080" data-height="1920">
    <div id="bg"></div><div id="glow"></div>
    <div id="face"><div id="facev">
      <video id="talkv" data-start="0" data-duration="{DUR}" data-track-index="0" src="assets/talk.mp4" muted playsinline></video>
    </div></div>
    <div id="stagewrap">
{mounts}    </div>
    <div id="seam"></div>
    <div id="caps"></div>
  </div>
<script>
(function(){{
  const CAPS={capjs};
  const CY={json.dumps(CAPY)};
  const box=document.getElementById('caps');
  window.__timelines=window.__timelines||{{}};
  const tl=gsap.timeline({{paused:true}});
  tl.fromTo('#bg',{{x:0,y:0}},{{x:-40,y:-80,duration:{DUR},ease:'none'}},0);
{laysets}{pushes}
  CAPS.forEach((c,i)=>{{
    const d=document.createElement('div');
    d.className='cap'+(c.c?' '+c.c:'')+(c.s?' s':'');
    d.id='cap'+i; d.style.top=CY[c.l]+'px';
    const s=document.createElement('span'); s.textContent=c.t; d.appendChild(s); box.appendChild(d);
    tl.set(d,{{opacity:1}},c.a); tl.set(d,{{opacity:0}},c.b);
  }});
  window.__timelines['main']=tl;
}})();
</script>
</body>
</html>
'''
open(P + '/index.html', 'w').write(main)
json.dump({'id': 'ai-sd-ep3-semantic-cache', 'name': 'ai-sd-ep3-semantic-cache', 'width': 1080, 'height': 1920, 'fps': 30}, open(P + '/meta.json', 'w'))
print('scenes', len(SC))
