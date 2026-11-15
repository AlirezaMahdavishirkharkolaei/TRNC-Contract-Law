import subprocess, json, collections
from PIL import Image, ImageOps
from concurrent.futures import ThreadPoolExecutor
from lines import split_page
def job(n):
    L=split_page(n)
    bw=[w for k,v in L.items() if k[0]=='b' for w in v]
    x0=min(w['l'] for w in bw)-15; x1=max(w['l']+w['w'] for w in bw)+15
    subprocess.run(['pdftoppm','-r','400','-gray','-png','-f',str(n),'-l',str(n),'-singlefile','cap.pdf',f'v2/r-{n:02d}'],check=True)
    im=Image.open(f'v2/r-{n:02d}.png'); s=400/300
    im=im.crop((int(x0*s),0,int(x1*s),im.height)); im=ImageOps.autocontrast(im,cutoff=1)
    im.save(f'v2/c-{n:02d}.png')
    subprocess.run(['tesseract',f'v2/c-{n:02d}.png',f'v2/t-{n:02d}','-l','eng','--psm','6'],capture_output=True)
with ThreadPoolExecutor(2) as ex: list(ex.map(job,range(7,47)))
print('done')
