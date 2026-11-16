import re, json, difflib
from spellchecker import SpellChecker
sp=SpellChecker()
sp.word_frequency.load_words("promisor promisors promisee promisees proposer acceptor bailor bailors bailee bailees pawnor pawnee wharfingers thereto thereof therein thereunder therewith voidable gratuitously suretyship recognisance bailbond".split())
st=json.load(open('structure.json'))
S=json.load(open('secs_raw.json'))
heads=[p[1] for p in st['parts']]+list(st['headings'].values())
def nl(s): return re.sub(r'[^a-z]','',s.lower())
HN=[nl(h) for h in heads]
def is_heading(t):
    n=nl(t)
    if re.match(r'^(PART|Part|Parr|Pari|PaRT)\b',t): return True
    if len(n)<4: return False
    for h in HN:
        if difflib.SequenceMatcher(None,n,h).ratio()>0.8: return True
        if len(n)>10 and n in h and len(t)<70 and (t[:1].isupper()): return True
    return False
FIX={"promisce":"promisee","uf":"of","Uf":"Of","moncy":"money","bailec":"bailee","signilies":"signifies","agrec-ment":"agreement","proposa":"proposal",
"cighteen":"eighteen","thercof":"thereof","susbsisting":"subsisting","afiected":"affected","belicf":"belief","withuut":"without","cansed":"caused",
"apreement":"agreement","Jawful":"lawful","Agreument":"Agreement","enfurcing":"enforcing","yinless":"unless","Wheie":"Where","cloes":"does","contiact":"contract",
"promiscr":"promisor","promisec":"promisee","specificd":"specified","applicd":"applied","partics":"parties","agrec":"agree","enteis":"enters","matriage":"marriage",
"uncer":"under","serics":"series","persen":"person","cach":"each","surcty’s":"surety’s","crecitor":"creditor","creclitor":"creditor","pramises":"promises",
"guarantecd":"guaranteed","Asurety":"A surety","atfect":"affect","co-surcties":"co-sureties","bailiment":"bailment","expuse":"expose","uwn":"own","gouds":"goods",
"Teturned":"returned","guods":"goods","Dailed":"bailed","bailur":"bailor","bailce":"bailee","vreater":"greater","undei":"under","Fawnee’s":"Pawnee’s","uscd":"used",
"cuntract":"contract","necessarv":"necessary","fullow":"follow","authoritv":"authority","hercin":"herein","accurding":"according","reccived":"received",
"pavable":"payable","conunission":"commission","ayent":"agent","agrcements":"agreements","comunitted":"committed","Tf":"If","1f":"If","1s":"is","Acterioration":"deterioration",
"Tequire":"require","bank-Tuptcy":"bankruptcy"}
MID_CAP={'Of','With','Which','Is','The','To','And','Or','In','By','For','As','At','On','A','An','That','Any','Such','It','He','His'}
def fixline(t):
    t=t.replace('’',"'").replace('‘',"'").replace('“','"').replace('”','"')
    t=re.sub(r"''|``",'"',t)
    toks=t.split(' ')
    out=[]
    for w in toks:
        core=re.match(r"^([\(\[\{\"']*)(.*?)([\.,;:\)\]\}\"']*)$",w)
        a,c,b=core.groups()
        c2=FIX.get(c.replace("'",'’'),FIX.get(c,c))
        out.append(a+c2+b)
    return ' '.join(out)
def paras(lines):
    out=[]
    MARK=re.compile(r'^([\(\{\[](?:[a-z]{1,4}|\d{1,2}|[ivx]{1,4}|6|k)[\)\}\]]|Provided|Illustration|Explanation|Exception)')
    for i,l in enumerate(lines):
        t=fixline(l['t'].strip())
        if not t: continue
        newp = i==0 or MARK.match(t) or (l['gap']>=62 and out and re.search(r'[\.;:—\-]$',out[-1].rstrip()))
        if newp: out.append(t); continue
        prev=out[-1]
        # lowercase OCR'd capital function word at line start mid-sentence
        m=re.match(r'^(\w+)(.*)$',t)
        if m and m.group(1) in MID_CAP and re.search(r'[a-z,]$',prev): t=m.group(1).lower()+m.group(2)
        if prev.endswith('-') and not prev.endswith('--'):
            head=re.search(r'(\w+)-$',prev); nxt=re.match(r'(\w+)',t)
            if head and nxt and head.group(1).lower() not in ('non','co','re','pre','self','wrong','indemnity') and sp.known([(head.group(1)+nxt.group(1)).lower()]):
                out[-1]=prev[:-1]+t
            else: out[-1]=prev+t
        else: out[-1]=prev+' '+t
    return out
LET='abcdefghijklmnopqrstuvwxyz'
CONF={'6':'b','k':'h','l':'i','1':'i','u':'a','ce':'c','e':'c','o':'c','ii':'h','j':'j'}
def fix_enum(ps):
    # repair (x) letter markers by sequence
    last=None
    res=[]
    for p in ps:
        m=re.match(r'^[\(\{\[]([^\)\}\]]{1,3})[\)\}\]]\s*(.*)$',p,re.S)
        if m:
            tok=m.group(1)
            if tok.isdigit() and tok!='6': last=None; res.append('('+tok+') '+m.group(2)); continue
            exp = 'a' if last is None else (LET[LET.index(last)+1] if last in LET[:-1] else None)
            if tok in LET and len(tok)==1 and (tok==exp or exp is None): last=tok; res.append('('+tok+') '+m.group(2)); continue
            if re.fullmatch(r'[ivx]+',tok) and not (exp and tok==exp): res.append('('+tok+') '+m.group(2)); continue
            if exp and (tok==exp or CONF.get(tok)==exp or tok in CONF):
                last=exp; res.append('('+exp+') '+m.group(2)); continue
            res.append(p); continue
        res.append(p)
    return res
def post(p):
    p=fixline(p)
    p=re.sub(r"\s\|\s"," ; ",p)
    # quotes
    p=re.sub(r"[\"']{2,}",'"',p)
    p=re.sub(r"(^|[\s\(—])'\s*(?=\w)",r'\1"',p)
    p=re.sub(r"(?<=[a-rt-z,\.])'(?=[\s;,\.\)]|$)",'"',p)
    p=re.sub(r'"\s+([^"]{1,60}?)\s+"',lambda m:'"'+m.group(1).strip()+'"',p)
    p=re.sub(r'\s+([;:,\.])',r'\1',p)
    p=re.sub(r'\s{2,}',' ',p).strip()
    return p
out={}
for k,v in S.items():
    lines=[l for l in v['lines'] if not (is_heading(l['t']) and (l['gap']>=66 or sum(c.isupper() for c in l['t'])>0.6*sum(c.isalpha() for c in l['t']) or re.match(r'^(PART|Part|Parr|Pari|PaRT)\b',l['t'])))]
    if k=='198': lines=[l for l in lines if 'Section 247' not in l['t'] and l['p']==46 and l['gap']<90 or lines.index(l)<8][:8]
    ps=[post(p) for p in fix_enum(paras(lines))]
    ps=[p for p in ps if sum(c.isalpha() for c in p)>=3 and not re.fullmatch(r'[a-z ]{1,8}',p)]
    out[k]={'page':v['page'],'paras':ps}
json.dump(out,open('secs_c.json','w'),ensure_ascii=False,indent=0)
for k in ['2','9','23','81','198']: print(k,out[k]['paras'])
