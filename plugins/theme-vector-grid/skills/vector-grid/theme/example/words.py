import json,re
k=json.load(open('keep.json'))
def m(t):
    acc=0
    for a,b in k:
        if t<a: return acc
        if t<=b: return acc+(t-a)
        acc+=b-a
    return acc
w=json.load(open('../fw2.json'))
R={'hari':None,'bhoot':'bahut','databases':'database','Amman':'Maan','vanaya':'banaya','wohin':'wahi','dosora':'dusra','dosura':'dusra','users':'user','pujte':'puchta','kam':'kab','kate':'kehte','ekhi':'ek hi','hazar':'hazaar','aana':'ka','kreate':'create','pas':'paas','me':'mein','hoto':'hota','ansar':'answer','zarot':'zaroorat','padhi.':'padi.','fahida':'faayda','bhat':'bahut','lakta':'lagta','jati':'jaati','bilkuli':'bilkul','likin':'lekin','Likin':'Lekin','hoa':'hoga','our':'aur','likhe':'likhta','gaya':'hai','likta':'likhta','ekdami':'ekdum','isli':'isliye','cashin':'cache','rakne':'rakhte','TTLVs':'TTL','ya.':'hai.','hoge':'ho gayi','hojaya':'ho jaayega','kyaate':'kehte','Amani':'hamari','humko':'humko','Yaha':'Yahan','sath':'saath','hain?':'hain','ho,':'hain,','jise':'jaise'}
out=[]
for i,(s,e,t) in enumerate(w):
    t2=R.get(t,t) if t in R else t
    if t2 is None: continue
    out.append([s,e,t2])
# context fixes
txt=[x[2] for x in out]
def fix(seq,new):
    for i in range(len(out)-len(seq)+1):
        if [x[2] for x in out[i:i+len(seq)]]==seq:
            s=out[i][0];e=out[i+len(seq)-1][1]
            n=len(new);d=(e-s)/n
            out[i:i+len(seq)]=[[s+j*d,s+(j+1)*d,new[j]] for j in range(n)]
            return True
    print('nofix',seq)
fix(['bhi','hum','bhi','hum','bahut'],['bhi','hum','bahut'])
fix(['matlab','se','hain'],['matlab','same','hai'])
fix(['0','.95'],['0.95'])
fix(['paise','bhi','bhi','bahut','lagta','bahut'],['paise','bhi','bahut','lagte,','bahut'])
fix(['cache','in','validation'],['cache','invalidation'])
fix(['cache','ki','key','text','hain','hi','hota','hain.'],['cache','ki','key','text','nahi','hoti,'])
fix(['meaning','hota','hi.'],['meaning','hoti','hai.'])
fix(['policy','uska','change'],['policy','change'])
fix(['trade','-off'],['trade-off'])
fix(['real','-time'],['real-time'])
fix(['kum','kar','sakte'],['kam','kar','sakte'])
fix(['concept','kum'],['concept','ko'])
fix(['ho','jaayega','ke','jo','ki'],['ho','jaayega','jo','ki'])
fix(['hota','humara','wo','miss'],['hota','hai','toh','miss'])
fix(['aur','dusra','user','likhta','hi','ki'],['aur','dusra','user','likhta','hai','ki'])
fix(['pe','dusra','user','ko','puchta','ki'],['pe','dusra','user','puchta','hai','ki'])
fix(['hum','kar','ke','nahi','rakhte'],['hum','nahi','rakhte'])
fix(['store','kar','ke','nahi'],['store','nahi'])
fix(['cash','in','validation'],['cache','invalidation'])
fix(['cash','ki','key','text','hain','hi','hota','hain.'],['cache','ki','key','text','nahi','hoti,'])
fix(['ho jaayega','ke','jo','ki'],['ho jaayega','jo','ki'])
fix(['humko','ki','bilkul','same','rakhne','hi','hoti,'],['humko','key','bilkul','same','rakhni','hoti,'])
fix(['mein','lo','ek hi'],['mein','log','ek hi'])
fix(['se','puchta','hain','isse'],['se','puchte','hain,','isse'])
fix(['miss','ho','jaige'],['miss','ho','jayega.'])
new=[[round(m(s),3),round(m(e),3),t] for s,e,t in out]
json.dump({'words':[{'text':t,'start':s,'end':e} for s,e,t in new]},open('words.json','w'),ensure_ascii=False)
print(' '.join(f'{t}@{s:.1f}' for s,e,t in new))
