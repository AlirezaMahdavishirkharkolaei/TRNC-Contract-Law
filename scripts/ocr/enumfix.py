import json,re
s=json.load(open('secs_m.json'))
LET='abcdefghijklmnopqrstuvwxyz'
ROM=['i','ii','iii','iv','v','vi','vii','viii','ix','x']
MK=re.compile(r'[\(\{\[]([^\)\}\]\s]{0,3})[\)\}\]]')
def repair(paras):
    sep=' '
    text=sep.join(paras)
    marks=[m for m in MK.finditer(text) if (m.start()==0 or text[m.start()-1]==sep or re.search(r'(\bor|\band|\bunless|[;:—,\)])\s*$',text[max(0,m.start()-12):m.start()]))]
    # skip markers that are clearly references e.g. "section 2(1)" (preceded by digit)
    marks=[m for m in marks if not (m.start()>0 and text[m.start()-1].isalnum())]
    nums=[m.group(1) for m in marks]
    exp_num=1; exp_let='a'; exp_rom=0; mode=None
    repl=[]
    for idx,m in enumerate(marks):
        t=m.group(1); before=text[max(0,m.start()-3):m.start()]
        after_dash='—' in before or ':' in before
        new=None
        if t.isdigit() and t!='6':
            d=int(t)
            later=[x for x in nums[idx+1:] if x==t]
            after_conj=bool(re.search(r'(\bor|\band),?\s*$',text[max(0,m.start()-8):m.start()]))
            if after_conj and mode=='let': new=exp_let
            elif d==exp_num and not (later and after_dash):
                new=t; exp_num=d+1; exp_let='a'; exp_rom=0; mode='num'
            elif d==exp_num+1 and not after_dash and mode!='let':
                new=t; exp_num=d+1; exp_let='a'; mode='num'
            else:
                new=exp_let
        elif t in ROM and not (t==exp_let):
            if mode=='rom' or t=='i':
                new=ROM[exp_rom] if exp_rom<len(ROM) else t; exp_rom+=1; mode='rom'; repl.append((m,new)); continue
            new=t
        elif len(t)==1 and t in LET:
            new=t if (t==exp_let or exp_let=='a' and t=='a') else exp_let
        else:
            new=exp_let
        if new in LET and len(new)==1:
            exp_let=LET[LET.index(new)+1]; mode='let'; exp_rom=0
        repl.append((m,new))
    out=[];last=0
    for m,new in repl:
        out.append(text[last:m.start()]); out.append('('+new+')'); last=m.end()
    out.append(text[last:])
    return ''.join(out).split(sep)
changed=0
for k,v in s.items():
    new=repair(v['paras'])
    if new!=v['paras']:
        changed+=1
        for a,b in zip(v['paras'],new):
            if a!=b: print(k,'|',a[:70],'=>',b[:70])
    v['paras']=new
json.dump(s,open('secs_e.json','w'),ensure_ascii=False,indent=0)
print('changed',changed)
