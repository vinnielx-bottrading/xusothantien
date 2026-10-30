import numpy as np, glob, json, os
from PIL import Image, ImageDraw
from scipy import ndimage as ndi
fs=sorted(glob.glob('src/*.png'))
names=["KIT_02A","PROP_HUT","BOY_POSES","PROP_FRUIT","KIT_01","KIT_02B","BOY_PARTS_01","BOY_PARTS_02","PROP_LOG","BG_FAR_01","CREATURE_FULL","BG_MID_01","BG_FAR_03","CREATURE_PARTS","PROP_CART","BOY_EMOTION","FG_03","FG_02","BG_MID_03","SIBLINGS","LANDMARK","CREATURE_STEP","BG_MID_02","SISTER","BG_MID_04","BG_MID_05"]
mp={}
def alpha_of(f):
    L=np.asarray(Image.open(f).convert('L')).astype(np.float32)/255
    a=np.clip((0.94-L)/0.80,0,1)  # white->0, black->1
    a[a<0.04]=0
    return a
def save(a,path):
    h,w=a.shape
    rgba=np.zeros((h,w,4),np.uint8); rgba[...,3]=(a*255).astype(np.uint8)
    Image.fromarray(rgba,'RGBA').save(path,'WEBP',quality=88,method=6)
for f,n in zip(fs,names):
    mp[n]=os.path.basename(f)
    a=alpha_of(f)
    np.save('proc/'+n+'.npy',a)
json.dump(mp,open('proc/map.json','w'),indent=1)
print('ok')
