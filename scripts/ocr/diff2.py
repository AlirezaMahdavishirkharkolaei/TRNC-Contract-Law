import json,re,difflib,glob
st=json.load(open('secs_c.json'))
A=[]  # (token, section)
for k in sorted(st,key=int):
    for p in st[k]['paras']:
        for t in p.split(): A.append((t,int(k)))
B=[]
for n in range(7,47):
    for line in open(f'v2/t-{n:02d}.txt'):
        if re.search(r'CAP\.? ?149|CONTRACT\.',line) and len(line)<60: continue
        B+= line.split()
def norm(t): return re.sub(r'[^\w]','',t.lower())
a=[norm(t) for t,_ in A]; b=[norm(t) for t in B]
sm=difflib.SequenceMatcher(None,a,b,autojunk=False)
issues=[]
for op,i1,i2,j1,j2 in sm.get_opcodes():
    if op=='equal': continue
    if op=='replace' and (i2-i1)<=3 and (j2-j1)<=3:
        sa=' '.join(t for t,_ in A[i1:i2]); sb=' '.join(B[j1:j2])
        if norm(sa)==norm(sb): continue
        # ignore hyphenation joins
        if norm(sa).replace(' ','')==''.join(norm(x) for x in B[j1:j2]): continue
        issues.append((A[i1][1],' '.join(t for t,_ in A[max(0,i1-4):i1]),sa,sb,' '.join(t for t,_ in A[i2:i2+3])))
json.dump(issues,open('issues.json','w'),ensure_ascii=False,indent=0)
print(len(issues))
for x in issues: print(x)
