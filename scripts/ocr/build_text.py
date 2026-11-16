import re, json
from lines import split_page
out=[]  # list of (page, top, text, gap_before)
for n in range(7,47):
    L=split_page(n)
    body=[(int(sum(w['tp'] for w in v)/len(v)), ' '.join(w['t'] for w in v)) for k,v in L.items() if k[0]=='b']
    body.sort()
    prev=None
    for top,txt in body:
        if top<230 and re.search(r'CAP|CONTRACT|^\d+$',txt): continue  # running header
        if n==7 and top<2400: continue  # TOC part of page 7
        if re.fullmatch(r'[\W_]*',txt): continue
        gap = (top-prev) if prev is not None else 999
        out.append(dict(p=n,top=top,t=txt,gap=gap)); prev=top
json.dump(out,open('rawlines.json','w'),ensure_ascii=False,indent=0)
print(len(out))
for l in out[:40]: print(l['p'],l['gap'],l['t'])
