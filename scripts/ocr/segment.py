import re, json
lines=json.load(open('rawlines.json'))
secs={}; cur=None; order=[]
part_lines=[]
exp=1
for i,l in enumerate(lines):
    t=l['t'].strip()
    letters=sum(ch.isalnum() for ch in t)
    if letters<2 or letters<0.5*len(t.replace(' ','')): continue
    t=re.sub(r'^[\-—–_=:;~\*\.,\s]+(?=\d|[§S]\d)','',t)
    m=re.match(r"^[\(\[\{'‘\"]?\s*([0-9§SOolIBW|!\]ZG$]{1,4})\s*[\.,]\s*(.*)$",t)
    num=None
    if m:
        tok=m.group(1).translate(str.maketrans('§SOolIBW|!]ZG','550011811112' + '6'))
        if tok.isdigit(): num=int(tok)
        e=str(exp)
        if len(e)==3 and len(m.group(1))==3 and tok[1:]==e[1:] and num!=exp: num=exp
    if num is not None and num!=exp and str(num).endswith(str(exp)) and len(str(num))==len(str(exp))+1: num=exp
    if num==exp:
        cur=exp; exp+=1; secs[cur]={'lines':[{'p':l['p'],'t':m.group(2),'gap':999}],'page':l['p']}; order.append(cur); continue
    if re.match(r'^(PART|Part|PaRT|PART)\s+[IVXLC1l]+',t) or (t.isupper() and len(t)>3 and not re.match(r'^\(',t)):
        part_lines.append((cur,l['p'],t)); continue
    if cur is None: continue
    secs[cur]['lines'].append({'p':l['p'],'t':t,'gap':l['gap']})
print("found",len(order),"last",order[-1] if order else None)
missing=[n for n in range(1,199) if n not in secs]; print("missing",missing)
json.dump(secs,open('secs_raw.json','w'),ensure_ascii=False)
for c,p,t in part_lines: print('PART?',c,p,t)
