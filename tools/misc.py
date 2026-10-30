import numpy as np, json
from PIL import Image
from scipy import ndimage as ndi
def lum_alpha(f):
    L=np.asarray(Image.open('src/'+f).convert('L')).astype(np.float32)/255
    return np.clip((0.94-L)/0.8,0,1)
def save_a(a,name,scale=1.0,rgb=None):
    h,w=a.shape
    out=np.zeros((h,w,4),np.uint8); out[...,3]=(np.clip(a,0,1)*255).astype(np.uint8)
    if rgb is not None: out[...,:3]=rgb
    im=Image.fromarray(out,'RGBA')
    if scale!=1: im=im.resize((max(1,int(w*scale)),max(1,int(h*scale))),Image.LANCZOS)
    im.save('out/'+name+'.webp','WEBP',quality=88,method=6); return im.size
def comps(a,n,dil=6):
    m=ndi.binary_dilation(a>0.3,iterations=dil); lab,k=ndi.label(m); objs=ndi.find_objects(lab)
    c=sorted([((lab[s]==i+1).sum(),s,i+1) for i,s in enumerate(objs)],key=lambda t:-t[0])[:n]
    res=[]
    for area,s,i in c:
        mask=lab==i; ys,xs=np.where(mask&(a>0.02)); y0,y1,x0,x1=ys.min(),ys.max()+1,xs.min(),xs.max()+1
        res.append((x0,y0,x1,y1,(a*mask)[y0:y1,x0:x1]))
    H=a.shape[0]; r1=sorted([r for r in res if (r[1]+r[3])/2<=H/2],key=lambda r:r[0]); r2=sorted([r for r in res if (r[1]+r[3])/2>H/2],key=lambda r:r[0])
    return r1+r2
man={}
# hats
a=lum_alpha('Black Silhouettes of Asian Straw Hats.png')
for i,c in enumerate(comps(a,7)): man['hat_%d'%i]=save_a(c[4],'hat_%d'%i,0.6)
# tall grass kit
a=lum_alpha('Black-and-White Grass Silhouette Asset Sheet.png')
for i,c in enumerate(comps(a,10,4)): man['grass_%d'%i]=save_a(c[4],'grass_%d'%i,0.6)
# crates
a=lum_alpha('Rustic Crates and Harvest Produce.png')
for i,c in enumerate(comps(a,3)): man['crate_%d'%i]=save_a(c[4],'crate_%d'%i,0.5)
# ornaments
a=lum_alpha('Elegant Black Ornamental Divider Set.png')
cs=comps(a,8,3)
cs.sort(key=lambda c:-(c[2]-c[0]))
man['orn_long']=save_a(cs[0][4],'orn_long',0.8); man['orn_short']=save_a(cs[1][4],'orn_short',0.8)
# logo mark
a=lum_alpha('Mountain Range Conical Hat Emblem.png'); ys,xs=np.where(a>0.05); man['logo_mark']=save_a(a[ys.min():ys.max()+1,xs.min():xs.max()+1],'logo_mark',0.6)
# full images
for f,n in [('Rustic Stilt House Silhouette.png','HOUSE'),('Tropical Village Silhouette Panorama.png','V00_MID_01'),('Monochrome Palm Marsh Silhouette.png','V00_MID_02'),('Rustic Hut Silhouette with Lantern and Tropical Foliage.png','V00_FG_01'),('Silhouette Palms and Colossal Tree.png','MENU_MID'),('Silhouette of a Giant Tree Walker.png','KEYART_01'),('Contemplative Child Beneath the Palm Giant.png','KEYART_02')]:
    a=lum_alpha(f)
    if n=='HOUSE':
        ys,xs=np.where(a>0.05); a=a[ys.min():ys.max()+1,xs.min():xs.max()+1]
    man[n]=save_a(a,n,1.0 if n!='HOUSE' else 0.8)
# jar (rgba, keep colors)
im=Image.open('src/Three Stages of a Broken Jar.png').convert('RGBA'); arr=np.asarray(im)
al=arr[...,3]/255.0; lum=arr[...,:3].mean(2)/255
cs=comps(al,3,8)
for i,c in enumerate(cs):
    x0,y0,x1,y1,_=c; sub=arr[y0:y1,x0:x1].copy()
    # keep only bright lines as pale + dark fill
    Image.fromarray(sub,'RGBA').resize((int((x1-x0)*0.35),int((y1-y0)*0.35)),Image.LANCZOS).save('out/jar_%d.webp'%i,'WEBP',quality=88); man['jar_%d'%i]=[int((x1-x0)*0.35),int((y1-y0)*0.35)]
json.dump(man,open('out/misc.json','w'),indent=0); print(man)
