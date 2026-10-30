import numpy as np, json, sys
from PIL import Image
from scipy import ndimage as ndi
S={ # id: (file, n_frames)
 'boy_idle':('Six Idle Boy Silhouettes on Green.png',6),
 'boy_walk':('Neon Green Walking Boy Sprite Sheet.png',8),
 'boy_run':('Neon Green Running Boy Sprite Sheet.png',8),
 'boy_carry':('Eight-Frame Silhouette Walk Cycle.png',8),
 'boy_putdown':('Conical-Hat Child Crate Animation Sheet.png',6),
 'boy_startle':('Startled Boy Silhouette Pose Sheet.png',6),
 'boy_call':('Child Silhouette Calling Pose Sheet.png',6),
 'boy_kneel':('Six-Frame Child Silhouette Storyboard.png',6),
 'boy_jump':('Boy Jumping Animation Sprite Sheet.png',8),
 'boy_push':('Child Silhouette Pushing Animation Sheet.png',8),
 'boy_pull':('Child Pulling Animation Sprite Sheet.png',8),
 'boy_climb':('Child Climbing Sprite Sequence.png',8),
 'boy_fear':('Crouching Hat-Wearing Silhouette Sprite Sheet.png',6),
 'boy_edge':('Six Silhouettes in Motion.png',6),
 'boy_sit':('Child in Conical Hat_ Sitting Poses.png',8),
 'boy_lookup':('Child Silhouette Pose Sequence.png',6),
 'boy_crush':("Boy’s Falling Action Sequence.png",6),
 'boy_drown':('Child Sinking Silhouette Animation Sheet.png',6),
 'boy_menu':('Four Straw-Hatted Silhouette Sprite Frames.png',4),
 'sis_firefly':('Green Screen Girl’s Jar Adventure.png',8),
 'sis_run':('Girl Running Silhouette Animation Sheet.png',8),
 'sis_idle':('Girl Silhouette Jar Pose Sprites.png',6),
 'sis_end':('Childhood Pose Sequence Silhouettes.png',8),
}
def load_rgba(f):
    im=Image.open('src/'+f)
    if im.mode=='RGBA' and np.asarray(im)[...,3].min()<10:
        a=np.asarray(im).astype(np.float32); return a[...,:3],a[...,3]/255
    a=np.asarray(im.convert('RGB')).astype(np.float32); r,g,b=a[...,0],a[...,1],a[...,2]
    spill=g-np.maximum(r,b)
    al=np.clip(1-(spill-35)/110,0,1)
    rgb=a.copy(); rgb[...,1]=np.minimum(g,np.maximum(r,b))  # despill
    return rgb,al
def frames(rgb,al,n):
    m=ndi.binary_dilation(al>0.5,iterations=7); lab,k=ndi.label(m)
    objs=ndi.find_objects(lab); comps=[]
    for i,s in enumerate(objs):
        area=(lab[s]==i+1).sum(); comps.append([area,s,i+1])
    comps.sort(key=lambda c:-c[0]); big=comps[:n]; small=comps[n:]
    big=[dict(sl=c[1],ids=[c[2]]) for c in big]
    for c in small:  # merge small bits to nearest big
        cy=(c[1][0].start+c[1][0].stop)/2; cx=(c[1][1].start+c[1][1].stop)/2
        best=min(big,key=lambda b:((b['sl'][0].start+b['sl'][0].stop)/2-cy)**2+((b['sl'][1].start+b['sl'][1].stop)/2-cx)**2)
        best['ids'].append(c[2])
    out=[]
    for b in big:
        mask=np.isin(lab,b['ids']); ys,xs=np.where(mask&(al>0.02))
        y0,y1,x0,x1=ys.min(),ys.max()+1,xs.min(),xs.max()+1
        out.append(dict(y0=y0,y1=y1,x0=x0,x1=x1,mask=mask[y0:y1,x0:x1]))
    # order: rows by y center then x
    H=al.shape[0]
    rows=sorted(out,key=lambda f:(f['y0']+f['y1'])/2)
    ycs=np.array([(f['y0']+f['y1'])/2 for f in rows])
    # split rows by largest gaps
    nrows=2 if n>4 or n==4 else 1
    order=np.argsort(ycs); 
    thr=np.median(ycs)
    r1=[f for f in out if (f['y0']+f['y1'])/2<=H/2]; r2=[f for f in out if (f['y0']+f['y1'])/2>H/2]
    r1.sort(key=lambda f:f['x0']); r2.sort(key=lambda f:f['x0'])
    return r1+r2
def hatw(f,al):
    # width of widest row in top 25% of figure
    sub=al[f['y0']:f['y1'],f['x0']:f['x1']]*f['mask']; h=sub.shape[0]
    top=sub[:max(4,int(h*0.3))]>0.5
    return top.sum(1).max()
res={}
for key,(fn,n) in S.items():
    rgb,al=load_rgba(fn); fr=frames(rgb,al,n)
    hs=[f['y1']-f['y0'] for f in fr]; hw=[hatw(f,al) for f in fr]
    res[key]=dict(n=len(fr),h=hs,hw=[int(x) for x in hw])
    pass

REF={'boy_idle':428,'boy_walk':386,'boy_run':380,'boy_carry':376,'boy_putdown':391,'boy_startle':414,'boy_call':422,'boy_kneel':411,'boy_jump':395,'boy_push':395,'boy_pull':390,'boy_climb':402,'boy_fear':423,'boy_edge':418,'boy_sit':400,'boy_lookup':440,'boy_crush':410,'boy_drown':428,'boy_menu':430,
     'sis_idle':423,'sis_firefly':372,'sis_run':360,'sis_end':391}
DS=0.68
atlas={}
for key,(fn,n) in S.items():
    rgb,al=load_rgba(fn); fr=frames(rgb,al,n)
    tgt=64 if key.startswith('boy') else 52
    ims=[];meta=[]
    for f in fr:
        sub_a=al[f['y0']:f['y1'],f['x0']:f['x1']]*f['mask']; sub_rgb=rgb[f['y0']:f['y1'],f['x0']:f['x1']]
        h,w=sub_a.shape
        bottom=sub_a[int(h*0.88):]>0.5
        cols=np.where(bottom.any(0))[0]
        ax=(cols.min()+cols.max())/2 if len(cols) and key not in('boy_drown',) else w/2
        rgba=np.zeros((h,w,4),np.uint8); rgba[...,:3]=np.clip(sub_rgb,0,255).astype(np.uint8); rgba[...,3]=(sub_a*255).astype(np.uint8)
        im=Image.fromarray(rgba,'RGBA'); im=im.resize((max(1,int(w*DS)),max(1,int(h*DS))),Image.LANCZOS)
        ims.append(im); meta.append([im.width,im.height,round(ax*DS,1),im.height])
    W=sum(i.width for i in ims)+2*len(ims); H=max(i.height for i in ims)
    strip=Image.new('RGBA',(W,H),(0,0,0,0)); x=0; fl=[]
    for im,m in zip(ims,meta):
        strip.paste(im,(x,0)); fl.append([x,0,m[0],m[1],m[2],m[3]]); x+=im.width+2
    strip.save('out/'+key+'.webp','WEBP',quality=90,method=6)
    atlas[key]=dict(s=round(tgt/(REF[key]*DS),5),f=fl)
json.dump(atlas,open('out/sprites.json','w'))
print('done',len(atlas))
