import numpy as np, json
from PIL import Image
from scipy import ndimage as ndi
seg={}
for f in [f.split('/')[-1] for f in __import__('glob').glob('proc/seg_*.json')]:
    seg.update(json.load(open('proc/'+f)))
man={}
def save(a,name,scale=1.0):
    if scale!=1.0:
        h,w=a.shape; im=Image.fromarray((a*255).astype(np.uint8)).resize((max(1,int(w*scale)),max(1,int(h*scale))),Image.LANCZOS); a=np.asarray(im)/255.0
    h,w=a.shape
    rgba=np.zeros((h,w,4),np.uint8); rgba[...,3]=(np.clip(a,0,1)*255).astype(np.uint8)
    Image.fromarray(rgba,'RGBA').save('game/a/'+name+'.webp','WEBP',quality=90,method=6)
    man[name]=[w,h]
def cut(n,b,pad=4):
    a=np.load('proc/'+n+'.npy'); x0,y0,x1,y1=b
    m=ndi.binary_dilation(a>0.3,iterations=6); lab,_=ndi.label(m)
    cy,cx=(y0+y1)//2,(x0+x1)//2
    sub=lab[y0:y1,x0:x1]; ids,c=np.unique(sub[sub>0],return_counts=True); idd=ids[np.argmax(c)]
    keep=(lab==idd)
    r=a*keep
    y0=max(0,y0-pad);x0=max(0,x0-pad);y1=min(a.shape[0],y1+pad);x1=min(a.shape[1],x1+pad)
    return r[y0:y1,x0:x1]
# backgrounds
for n in ['BG_FAR_01','BG_FAR_03','BG_MID_01','BG_MID_02','BG_MID_03','BG_MID_04','BG_MID_05','FG_02','FG_03','LANDMARK','CREATURE_STEP','SIBLINGS','PROP_HUT','PROP_LOG','CREATURE_FULL']:
    a=np.load('proc/'+n+'.npy')
    if n in ('PROP_HUT','PROP_LOG','CREATURE_FULL'):
        ys,xs=np.where(a>0.05); a=a[ys.min():ys.max()+1,xs.min():xs.max()+1]
    save(a,n)
# boy parts
bp=seg['BOY_PARTS_01']
names=['head','chest','arm_u','arm_f','neck','hips','thigh_a','thigh_b','shin_a','shin_b','foot_a','foot_b','toe_a','toe_b']
for nm,b in zip(names,bp): save(cut('BOY_PARTS_01',b),'boy_'+nm,0.5)
for nm,b in zip(['hand_relax','hand_open','hand_fist','hand_reach','hat','strap','hem_shirt','hem_pant'],seg['BOY_PARTS_02']): save(cut('BOY_PARTS_02',b),'boy_'+nm,0.5)
# creature
cp=seg['CREATURE_PARTS']
a=np.load('proc/CREATURE_PARTS.npy')
x0,y0,x1,y1=cp[0]; mid=285
save(a[y0:y1,x0:mid],'pw_leg_a',0.8); save(a[y0:y1,mid:x1],'pw_leg_b',0.8)
for nm,b in zip(['pw_torso','pw_crown','pw_arm_a','pw_arm_b','pw_foot_lift','pw_foot_flat'],cp[1:7]): save(cut('CREATURE_PARTS',b),nm,0.8)
for i,b in enumerate(seg['KIT_01']): save(cut('KIT_01',b),'palm_%d'%i,0.7)
for i,b in enumerate(seg['KIT_02A']): save(cut('KIT_02A',b),'kit_%d'%i,0.7)
for nm,b in zip(['fruit_l','fruit_m','fruit_s','fruit_crack'],seg['PROP_FRUIT']): save(cut('PROP_FRUIT',b),nm,0.5)
for nm,b in zip(['cart_body','cart_wheel'],seg['PROP_CART']): save(cut('PROP_CART',b),nm,0.6)
sb=seg['SISTER']
for nm,i in [('sis_run',0),('sis_orb',1),('sis_turn',2),('sis_stand',3),('sis_reach',4),('sis_sit',5)]: save(cut('SISTER',sb[i]),nm,0.5)
json.dump(man,open('game/a/manifest.json','w'))
print(len(man)); import os; print(sum(os.path.getsize('game/a/'+f) for f in os.listdir('game/a'))//1024,'KB')
