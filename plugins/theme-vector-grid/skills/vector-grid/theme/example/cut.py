import json
sil=[(5.21,5.44),(26.48,26.81),(30.21,30.42),(37.94,38.21),(48.76,49.12),(51.20,51.43),(59.68,59.96),(69.13,69.37),(75.25,75.61),(86.40,86.65),(103.04,103.41),(110.49,110.83),(116.60,116.89)]
END=128.85
keep=[];t=0.0
for s,e in sil:
    a=s+0.07;b=e-0.07
    if b-a>0.05: keep.append((t,a)); t=b
keep.append((t,END))
# snap to frames (30fps)
keep=[(round(a*30)/30,round(b*30)/30) for a,b in keep]
json.dump(keep,open('keep.json','w'))
print(keep, sum(b-a for a,b in keep))
