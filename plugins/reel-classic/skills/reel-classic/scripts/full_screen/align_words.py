"""Per-word timings for a Hinglish transcript. ASR alone is unreliable on Hinglish, so: run asr_anchors.py,
pick ~100+ clearly heard words as anchors below, and interpolate the rest by loudness. Writes words.json.
usage: python3 align_words.py segments.json   (needs audio16k.wav: ffmpeg -i SRC -ac 1 -ar 16000 audio16k.wav)"""
import json, re, numpy as np, wave
import sys
segs=json.load(open(sys.argv[1]))  # [{start,end,text}] transcript segments; words=' '.join(s['text'] for s in segs).split()
# Anchors: "word time" pairs in transcript order, taken from words the English ASR pass (asr_anchors.py) heard clearly.
# Everything between anchors is spread by voiced time. Replace with the anchors for your video.
AN="""How .11|connection .35|pooling .74|PostgreSQL 1.24|works 1.68|So 2.28|episode 2.68|Building 3.12|Backend 3.5|Systems 3.88|let's 4.37|understand 4.63|that 5.17|Suppose 5.5|application 5.87|read 10.5|write 11.02|But 12.15|Postgres 12.33|requests 12.92|handle 13.59|kaise 13.97|Jab 14.15|server 14.96|Postgres 15.27|query 15.69|database 16.98|connection 17.38|establish 18.01|Postgres 19.19|har 19.52|client 19.78|connection 20.21|dedicated 21.14|backend 21.75|process 22.15|create 22.56|connections 23.68|matlab 24.24|Postgres 24.62|concurrent 28.37|requests 28.9|database 31.01|connection 31.5|create 32.13|connections 33.1|rapidly 33.67|increase 34.07|connection 35.17|database 35.7|resources 36.5|consume 36.82|max_connections 38.94|naam 39.65|limit 39.92|hoti 40.19|point 41.0|connection 41.43|limit 41.98|hit 42.2|connection 43.8|use 44.3|Problem 45.7|single 46.08|database 46.43|connection 46.9|unlimited 47.69|concurrent 48.13|database 48.62|work 49.0|application 53.65|multiple 54.37|connections 54.79|pooling 59.91|pooling 61.15|simple 61.55|idea 61.84|create 63.04|destroy 63.52|unko 64.6|reuse 64.92|Let's 65.64|suppose 66.12|request 66.73|aayi 67.11|application 67.53|pool 68.01|available 68.55|connection 69.02|execute 71.46|Kaam 72.2|complete 72.49|connection 73.18|destroy 73.5|unlike 80.55|destroy 81.69|1000 84.0|requests 84.56|pool 85.27|20 85.85|connections 86.12|use 86.74|Postgres 89.1|1000 89.5|connections 90.0|create 90.4|Requests 91.5|limited 91.9|baaki 95.71|requests 95.88|available 96.19|connection 96.6|wait 97.41|Production 98.0|systems 98.71|PgBouncer 99.35|connection 100.16|pooler 100.48|use 100.94|large 101.77|number 102.05|client 102.5|connections 102.84|fewer 103.63|Postgres 103.87|connections 104.22|efficiently 105.0|manage 105.58|help 106.38"""
norm=lambda w: re.sub(r"[^a-z0-9_']",'',w.lower())
anc=[(-1,0.0)]; pos=0
for item in AN.split('|'):
    w,t=item.rsplit(' ',1); t=float(t)
    while norm(words[pos])!=norm(w): pos+=1
    anc.append((pos,t)); pos+=1
anc.append((len(words),107.05))
for (a,ta),(b,tb) in zip(anc,anc[1:]): assert tb>ta,(a,b,ta,tb)
w_=wave.open('audio16k.wav'); x=np.frombuffer(w_.readframes(w_.getnframes()),np.int16).astype(float)
db=np.array([20*np.log10(np.sqrt((x[i:i+320]**2).mean())+1e-9) for i in range(0,len(x)-320,160)])
vo=(db>np.percentile(db,30)+3).astype(float)+0.03; cum=np.concatenate([[0],np.cumsum(vo)])
CV=lambda t: np.interp(t*100,np.arange(len(cum)),cum); inv=lambda c: np.interp(c,cum,np.arange(len(cum)))/100
L=[len(w)+2 for w in words]; t=[None]*len(words)
for (a,ta),(b,tb) in zip(anc,anc[1:]):
    if a>=0: t[a]=ta
    s=a+1 if a>=0 else 0
    # words strictly between anchors: spread in voiced time after anchor word a
    seq=list(range(max(a,0),b)); tot=sum(L[q] for q in seq) or 1
    for j in range(s,b):
        if j==a: continue
        f=sum(L[q] for q in seq if q<j)/tot
        t[j]=float(inv(CV(ta)+(CV(tb)-CV(ta))*f))
json.dump([{'w':w,'t':round(v,3)} for w,v in zip(words,t)],open('words.json','w'))
print(len(anc)-2,'anchors')
