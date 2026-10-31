import numpy as np, json
from PIL import Image
from scipy import ndimage as ndi
exec(open('/home/claude/x2/sprites.py').read().split('res={}')[0].replace("'src/'+f","'/home/claude/x4/src/'+f"))
S2={'boy_ladder':('Boy Ladder Climb.png',8,'torso')}
REFH=64; DS=0.68
atlas={}
for key,(fn,n,anch) in S2.items():
    rgb,al=load_rgba(fn); fr=frames(rgb,al,n)
    # scale: use hat width as reference (hat ~ constant). boy_idle hat width ~162px at ref height 428 -> hat = 0.38*height
    hw=np.median([hatw(f,al) for f in fr]); scale=REFH/(hw/0.379)/DS
    fl=[];ims=[];meta=[]
    for f in fr:
        sub_a=al[f['y0']:f['y1'],f['x0']:f['x1']]*f['mask']; sub_rgb=rgb[f['y0']:f['y1'],f['x0']:f['x1']]
        h,w=sub_a.shape
        if anch=='feet':
            cols=np.where((sub_a[int(h*.88):]>.5).any(0))[0]; ax=(cols.min()+cols.max())/2
        else:
            band=sub_a[:int(h*.45)]>.5; m=band.sum(0).astype(float); ax=(m*np.arange(w)).sum()/max(1,m.sum())
        rgba=np.zeros((h,w,4),np.uint8); rgba[...,:3]=np.clip(sub_rgb,0,255).astype(np.uint8); rgba[...,3]=(sub_a*255).astype(np.uint8)
        im=Image.fromarray(rgba,'RGBA').resize((max(1,int(w*DS)),max(1,int(h*DS))),Image.LANCZOS)
        ims.append(im); meta.append([im.width,im.height,round(ax*DS,1),im.height, f['y0'],f['y1']])
    W=sum(i.width for i in ims)+2*len(ims); H=max(i.height for i in ims)
    strip=Image.new('RGBA',(W,H),(0,0,0,0)); x=0
    for im,m in zip(ims,meta):
        strip.paste(im,(x,0)); fl.append([x,0,m[0],m[1],m[2],m[3]]); x+=im.width+2
    strip.save('out/'+key+'.webp','WEBP',quality=90,method=6)
    atlas[key]=dict(s=round(scale,5),f=fl)
    print(key,len(fr),'scale',round(scale,4),'h_wu',[round(m[1]*scale,1) for m in meta])
json.dump(atlas,open('out/sprites_ladder.json','w'))
