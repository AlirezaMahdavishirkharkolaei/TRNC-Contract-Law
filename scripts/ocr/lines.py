import csv, collections, json, sys
def words(n):
    out=[]
    with open(f'tsv/f-{n:02d}.tsv') as f:
        r=csv.DictReader(f,delimiter='\t',quoting=csv.QUOTE_NONE)
        for w in r:
            if w['level']!='5' or not w['text'].strip(): continue
            out.append(dict(t=w['text'],l=int(w['left']),tp=int(w['top']),w=int(w['width']),h=int(w['height']),c=float(w['conf']),k=(w['block_num'],w['par_num'],w['line_num'])))
    return out
def split_page(n):
    ws=words(n)
    if n%2==1:
        # odd: margin on right. find gap in lefts histogram between 1500 and 1700
        rights=sorted(w['l']+w['w'] for w in ws if w['l']<1560 and w['l']>300)
        r97=rights[int(len(rights)*.97)] if rights else 1612
        thr=min(1612,r97+4)
    else:
        thr=None
    if n%2==0:
        firsts={}
        for w in ws:
            if w['k'] not in firsts or w['l']<firsts[w['k']]['l']: firsts[w['k']]=w
        cand=[f['l'] for f in firsts.values() if 420<f['l']<720]
        hist=collections.Counter(round(x/6)*6 for x in cand)
        top=[x for x,c in hist.most_common(6)]
        body_left=min(top) if top else 500
    lines=collections.OrderedDict()
    for w in ws:
        if n%2==1:
            side='m' if w['l']>=thr else 'b'
        else:
            side='m' if w['l']<body_left-10 else 'b'
        lines.setdefault((side,)+w['k'],[]).append(w)
    return lines
if __name__=='__main__':
    n=int(sys.argv[1]); L=split_page(n)
    for k,v in L.items():
        print(k[0], int(sum(w['tp'] for w in v)/len(v)), ' '.join(w['t'] for w in v))
