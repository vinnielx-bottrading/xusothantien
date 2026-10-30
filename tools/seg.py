import numpy as np, json, sys
from PIL import Image, ImageDraw
from scipy import ndimage as ndi
def seg(n, dil=6, minarea=400):
    a=np.load('proc/'+n+'.npy')
    m=ndi.binary_dilation(a>0.3, iterations=dil)
    lab,k=ndi.label(m)
    objs=ndi.find_objects(lab)
    out=[]
    for i,s in enumerate(objs):
        area=(lab[s]==i+1).sum()
        if area<minarea: continue
        y0,y1,x0,x1=s[0].start,s[0].stop,s[1].start,s[1].stop
        out.append([x0,y0,x1,y1])
    out.sort(key=lambda b:(round(b[1]/120),b[0]))
    im=Image.fromarray(((1-a)*255).astype(np.uint8)).convert('RGB'); d=ImageDraw.Draw(im)
    for i,b in enumerate(out):
        d.rectangle(b,outline=(255,0,0),width=2); d.text((b[0]+3,b[1]+3),str(i),fill=(255,0,0))
    im.save('proc/seg_'+n+'.png')
    return out
res={}
for n in sys.argv[1:]:
    res[n]=seg(n); print(n,len(res[n]),res[n])
json.dump(res,open('proc/seg_'+'_'.join(sys.argv[1:])[:40]+'.json','w'))
