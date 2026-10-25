from pathlib import Path
from PIL import Image
import numpy as np,json
p=Path('outputs/hamid.com');a=np.asarray(Image.open(p/'bird-bodies.png').convert('RGBA'));boxes=json.loads((p/'body-bounds.json').read_text())['bird-bodies'];old=json.loads((p/'shoulder-placements.json').read_text());out=[];colors=[]
for i,(bx,by,w,h) in enumerate(boxes):
 s=min(100/w,100/h);ox=(100-w*s)/2;oy=(100-h*s)/2
 def pixel(x,y):return a[min(a.shape[0]-1,max(0,round(by+(y-oy)/s))),min(a.shape[1]-1,max(0,round(bx+(x-ox)/s)))]
 ys=[y for y in np.arange(20,82,.5) if pixel(50,y)[3]>220];top=min(ys);bottom=max(ys);target=top+(bottom-top)*.34
 choices=[]
 for x in range(46,55):
  for y in np.arange(top+3,bottom-3,.5):
   coverage=np.mean([pixel(x+dx,y+dy)[3]>220 for dx in range(-6,7) for dy in range(-3,4)])
   if coverage>=.98:choices.append(((x-50)**2+(y-target)**2,x,float(y)))
 _,x,y=min(choices)
 if i==0:x,y=46,57
 assert all(pixel(x+dx,y+dy)[3]>220 for dx in range(-4,5) for dy in range(-2,3)),i
 out.append([x,y]);rgb=pixel(x,y)[:3];colors.append('#'+''.join(f'{v:02x}' for v in rgb))
 print(i,old[i],'->',out[-1])
(p/'shoulder-placements.json').write_text(json.dumps(out));(p/'shoulder-colors.json').write_text(json.dumps(colors))
print('All 30 hinges have an opaque 9 by 5 torso attachment band')
