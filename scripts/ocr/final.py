import json,re
from spellchecker import SpellChecker
sp=SpellChecker()
sp.word_frequency.load_words("promisor promisors promisee promisees proposer acceptor bailor bailors bailee bailees pawnor pawnee pawnors wharfingers thereto thereof therein thereunder therewith voidable gratuitously suretyship recognisance bailbond moslems anonyme mejelle usury co-surety co-sureties sub-agent sub-agents indemnity-holder wrong-doer wrong-doers non-performance non-fulfilment good-will compellable proportionably diligency labour defence offence annum".split())
s=json.load(open('secs_e.json'))
def split_inline(p):
    p=re.sub(r'(?<=[;:—]) (?=\((?:[a-z]|[ivx]{1,4})\) )','\n',p)
    p=re.sub(r'([,;] (?:and|or)(?: unless)?) (?=\((?:[a-z]|[ivx]{1,4})\) )',r'\1\n',p)
    p=re.sub(r'(?<=\(\w\)) @ ',' a ',p); p=re.sub(r' @ ',' a ',p)
    return p.split('\n')
unk={}
for k,v in s.items():
    ps=[]
    for p in v['paras']: ps+=split_inline(p)
    for i,p in enumerate(ps):
        nxt=ps[i+1] if i+1<len(ps) else None
        if p.endswith(',') and (nxt is None or re.match(r'^(\(\d+\)|[A-Z])',nxt)): ps[i]=p[:-1]+'.'
    v['paras']=ps
    for p in ps:
        for w in re.findall(r"[A-Za-z][A-Za-z'\-]*[A-Za-z]|[A-Za-z]",p):
            wl=w.lower()
            if wl in ('s',) or len(wl)==1: continue
            if all(sp.known([x]) for x in wl.split('-') if x) or sp.known([wl]): continue
            if wl.endswith("'s") and sp.known([wl[:-2]]): continue
            unk.setdefault(w,[]).append(int(k))
def quotes(p):
    p=re.sub(r"'\*\s*|\*\*\s*",'"',p)
    p=p.replace('essential to the agreement "the agreement','essential to the agreement, the agreement').replace("A' bond in customary form \"",'A "bond in customary form"')
    if p.count('"')%2: return p
    out=[];open_=True;i=0
    parts=p.split('"')
    res=parts[0]
    for j,seg in enumerate(parts[1:]):
        if open_:
            res=res.rstrip()+(' ' if res.strip() and not res.rstrip().endswith(('(','—')) else '')+'"'+seg.lstrip()
        else:
            res=res.rstrip()+'"'+(seg if seg[:1] in ',.;:)—' or seg[:1]==' ' or seg=='' else ' '+seg)
        open_=not open_
    return res
for v in s.values():
    v['paras']=[quotes(p) for p in v['paras']]
s['180']['paras'][-1]=s['180']['paras'][-1].rstrip()+('.' if not s['180']['paras'][-1].rstrip().endswith('.') else '')
json.dump(s,open('secs_f.json','w'),ensure_ascii=False,indent=0)
print(unk)
