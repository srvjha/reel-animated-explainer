import json,re,numpy as np
from scipy.io import wavfile
W=json.load(open('words.json'))['words']
def norm(s): return re.sub(r'[^a-z0-9.]','',s.lower()).rstrip('.')
def T(w,after=0):
    for x in W:
        if x['start']>=after-0.05 and norm(x['text']).startswith(norm(w)): return x['start']
ev=[(T('chatbot')+.25,'x'),(T('nahi',11.9),'click'),(T('serve',13.4),'tap'),(T('text',37.5)+.4,'ok'),(T('miss',40.5),'x'),
    (T('achha'),'x'),(T('hit',71.9),'ok'),(T('cheap'),'tap'),(T('false',89.9),'x'),(T('ulta'),'x'),(T('nahi',106.7),'x'),
    (T('galat'),'click'),(T('invalidation',115)+.3,'paper'),(T('Semantic',120),'tap'),(T('similarity',121),'tap2'),(T('careful',122),'tap3')]
sr=48000;D=126.85;out=np.zeros(int(D*sr)+sr)
rng=np.random.default_rng(3)
def env(n,dec): t=np.arange(n)/sr; return np.exp(-t/dec)
def snd(k):
    n=int(.25*sr);t=np.arange(n)/sr
    if k=='x': s=np.sin(2*np.pi*190*t)*env(n,.05)*.9 + rng.normal(0,1,n)*env(n,.012)*.15
    elif k=='ok': s=(np.sin(2*np.pi*880*t)+.5*np.sin(2*np.pi*1320*t))*env(n,.09)*.35
    elif k=='click': s=rng.normal(0,1,n)*env(n,.004)*.5
    elif k=='paper':
        n=int(.4*sr);s=rng.normal(0,1,n);s=np.convolve(s,np.ones(30)/30,'same')*np.sin(np.linspace(0,np.pi,n))*.6
    else:
        f={'tap':520,'tap2':600,'tap3':680}[k]; s=np.sin(2*np.pi*f*t)*env(n,.035)*.6+rng.normal(0,1,n)*env(n,.003)*.15
    return s
for t,k in ev:
    s=snd(k);i=int(t*sr);out[i:i+len(s)]+=s
out=out[:int(D*sr)]
wavfile.write('sfx.wav',sr,(out*0.5*32767).clip(-32767,32767).astype(np.int16))
print(len(ev))
