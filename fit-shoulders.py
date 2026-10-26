from pathlib import Path
from PIL import Image
import numpy as np,json
p=Path(__file__).resolve().parent;a=np.asarray(Image.open(p/'bird-bodies.png').convert('RGBA'));boxes=json.loads((p/'body-bounds.json').read_text())['bird-bodies'];old=json.loads((p/'shoulder-placements.json').read_text());out=[];colors=[]
for i,(bx,by,w,h) in enumerate(boxes):
 s=min(100/w,100/h);ox=(100-w*s)/2;oy=(100-h*s)/2
 def pixel(x,y):return a[min(a.shape[0]-1,max(0,round(by+(y-oy)/s))),min(a.shape[1]-1,max(0,round(bx+(x-ox)/s)))]
 ys=[y for y in np.arange(20,82,.5) if pixel(56,y)[3]>220];top=min(ys);bottom=max(ys);target=top+(bottom-top)*(.38 if i==12 else .12)
 choices=[]
 for x in range(52,61):
  for y in np.arange(top+2,bottom-2,.5):
   coverage=np.mean([pixel(x+dx,y+dy)[3]>220 for dx in range(-4,5) for dy in range(-2,3)])
   if coverage>=.98:choices.append(((x-56)**2+(y-target)**2,x,float(y)))
 _,x,y=min(choices)
 if i==0:x,y=46,57
 if i in [12,4,21,29]:y+=3
 if i in [2,3,14,23,24,25]:y-=3
 if i==3:y-=2
 if i==8:y+=3
 assert all(pixel(x+dx,y+dy)[3]>220 for dx in range(-4,5) for dy in range(-2,3)),i
 out.append([x,y]);rgb=pixel(x,y)[:3];colors.append('#'+''.join(f'{v:02x}' for v in rgb))
 print(i,old[i],'->',out[-1])
(p/'shoulder-placements.json').write_text(json.dumps(out));(p/'shoulder-colors.json').write_text(json.dumps(colors))
print('All 30 hinges have an opaque 9 by 5 torso attachment band')
