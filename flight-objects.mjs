import {readFileSync} from 'node:fs';
import {flightProfiles} from './flight-rig.mjs';

const size=name=>{const png=readFileSync(new URL(name,import.meta.url));return [png.readUInt32BE(16),png.readUInt32BE(20)];};
const [bw,bh]=size('bird-bodies.png'),[ww,wh]=size('bird-wings.png');
const bodyBounds=JSON.parse(readFileSync(new URL('body-bounds.json',import.meta.url),'utf8'))['bird-bodies'];
const shoulderJoints=JSON.parse(readFileSync(new URL('shoulder-joints.json',import.meta.url),'utf8'));
const wingBounds=JSON.parse(readFileSync(new URL('wing-object-bounds.json',import.meta.url),'utf8'));
// Resize around the measured feather root so the shoulder stays connected.
const wingScale=.72;
const shoulderColors=JSON.parse(readFileSync(new URL('shoulder-colors.json',import.meta.url),'utf8'));
// Fit the root to each silhouette's upper torso instead of a shared height.
const shoulderPlacements=JSON.parse(readFileSync(new URL('shoulder-placements.json',import.meta.url),'utf8'));
const shoulderFor=i=>shoulderPlacements[i];
const jointCurve='M-16 -12 Q-7 -10 5 -5 Q11 1 5 8 Q-6 10 -15 1Z';
// Keep the hoopoe's covert behind its neck; its wing already overlaps the torso.
const cuffCurve='M-14 -5 Q-5 -10 5 -4 Q8 1 3 6 Q-5 9 -14 4 Q-17 0 -14 -5Z';
const jointFor=i=>i===0?'M-11 -7 Q-5 -7 1 -3 Q3 1 0 4 Q-6 5 -11 0Z':jointCurve;

export function rigDefs(names){
 let defs=`<image id="bird-body-atlas" width="${bw}" height="${bh}" href="bird-bodies.png"/><image id="bird-wing-atlas" width="${ww}" height="${wh}" href="bird-wings.png"/><clipPath id="hoopoe-shoulder-cover"><path d="M39 44 Q48 39 60 45 Q64 51 59 57 Q47 62 39 54 Q36 49 39 44Z"/></clipPath>`;
 names.forEach((_,i)=>{
  const [bx,by,cw,ch]=bodyBounds[i];
  const [sx,sy]=shoulderFor(i);
  defs+=`<clipPath id="shoulder-cuff-${i}"><path transform="translate(${sx} ${sy})" d="${cuffCurve}"/></clipPath>`;
  defs+=`<clipPath id="shoulder-cover-${i}"><path transform="translate(${sx-51} ${sy-51})" d="M39 44 Q48 39 60 45 Q64 51 59 57 Q47 62 39 54 Q36 49 39 44Z"/></clipPath><clipPath id="shoulder-joint-${i}"><path d="${jointFor(i)}"/></clipPath>`;
  defs+=`<clipPath id="body-cell-${i}"><rect x="${bx}" y="${by}" width="${cw}" height="${ch}"/></clipPath><g id="body-object-${i}"><svg width="100" height="100" viewBox="${bx} ${by} ${cw} ${ch}" preserveAspectRatio="xMidYMid meet" overflow="hidden"><use href="#bird-body-atlas" clip-path="url(#body-cell-${i})"/></svg></g>`;
  for(let side=0;side<2;side++){
   const {box:[x,y,w,h],path}=wingBounds[i][side];
   const [rx,ry]=shoulderJoints[i].roots[side];
   defs+=`<clipPath id="wing-cell-${i}-${side}"><path d="${path}"/></clipPath><g id="wing-object-${i}-${side}" transform="${i===0?'translate(4 4)':'translate(0 0)'}"><svg x="${-rx*wingScale}" y="${-ry*wingScale}" width="${62*wingScale}" height="${82*wingScale}" viewBox="${x} ${y} ${w} ${h}" preserveAspectRatio="none" overflow="hidden"><use href="#bird-wing-atlas" clip-path="url(#wing-cell-${i}-${side})"/></svg></g>`;
  }
 });
 return defs;
}

export function rigBird(i,size,names){
 const [beat,cycle,stroke,bank,type]=flightProfiles[i];
 const [sx,sy]=shoulderFor(i);
 // A broad covert joins the wing to the torso; the intact body texture covers
 // its inner edge along a curved shoulder seam, rather than a pointed hinge.
 const joint=`<g data-part="broad-wing-root">${i===0?'':`<path d="${jointFor(i)}" fill="${shoulderColors[i]}"/>`}<g clip-path="url(#shoulder-joint-${i})"><use href="#body-object-${i}" transform="translate(${-sx} ${-sy})"/></g></g>`;
 const cover=`<g clip-path="url(#shoulder-cover-${i})" data-part="curved-shoulder"><use href="#body-object-${i}"/></g>`;
 const cuff=`<g data-part="curved-feather-hinge" clip-path="url(#shoulder-cuff-${i})"><use href="#body-object-${i}"/></g>`;
 const vars=`--cycle:${cycle}s;--beat:${beat}s;--phase:${-(i*.173+beat*.31)}s;--bank:${bank*.45}deg;--stroke:${stroke}`;
 return `<svg x="${-size/2}" y="${-size/2}" width="${size}" height="${size}" viewBox="-18 -32 136 165" overflow="visible"><title>${names[i]}</title><g class="object-bird" data-flight="${type}" data-mechanism="separate-wing-objects" style="${vars}"><g transform="scale(1 .84)"><g transform="translate(${sx+1} ${sy-1})"><g transform="scale(.83 .88)"><g class="wing-object far-wing" data-part="back-wing" style="animation-name:object-wing-${i}">${joint}<use href="#wing-object-${i}-1"/></g></g></g><use href="#body-object-${i}" data-part="intact-body"/>${cover}${cuff}<g transform="translate(${sx} ${sy})"><g class="wing-object near-wing" data-part="front-wing" style="animation-name:object-wing-${i}">${joint}<use href="#wing-object-${i}-0"/></g></g></g></g></svg>`;
}

const frames=flightProfiles.map(([beat,cycle,stroke,,type],i)=>{
 const duty=type==='soar'?.25:type==='bounding'?.64:type==='burst'?.55:type==='agile'?.82:1;
 const count=Math.max(1,Math.round(cycle*duty/beat)),step=100*duty/count;
 let keys='';
 const down=i===0?-74:-58-stroke*40;
 const up=i===0?-8:12;
 for(let j=0;j<count;j++){
  const t=j*step;
  keys+=`${t.toFixed(3)}%{transform:rotate(${up}deg) scale(.84,.94)}${(t+step*.43).toFixed(3)}%{transform:rotate(${down}deg) scale(1.03,1)}${(t+step*.76).toFixed(3)}%{transform:rotate(-35deg) scale(.74,.85)}`;
 }
 if(duty<1)keys+=`${(duty*100).toFixed(3)}%,97%{transform:rotate(-34deg) scale(1,.94)}`;
 return `@keyframes object-wing-${i}{${keys}100%{transform:rotate(${up}deg) scale(.84,.94)}}`;
}).join('');

export const flightCss=`
.object-bird{animation:object-bank calc(var(--cycle)*var(--motion-factor,1)) ease-in-out infinite;animation-delay:var(--phase);transform-origin:50px 55px}
.wing-object{animation-duration:calc(var(--cycle)*var(--motion-factor,1));animation-timing-function:cubic-bezier(.38,.12,.28,.92);animation-iteration-count:infinite;animation-delay:var(--phase);transform-origin:0px 0px;will-change:transform}
.far-wing{animation-delay:calc(var(--phase) - var(--beat)*.04);opacity:.9}
@keyframes object-bank{0%,100%{transform:rotate(calc(var(--bank)*-1)) translateY(0)}36%{transform:rotate(var(--bank)) translateY(-1px)}72%{transform:rotate(0deg) translateY(1px)}}
${frames}
@media(prefers-reduced-motion:reduce){.object-bird,.wing-object{animation:none!important}.wing-object{transform:rotate(-34deg)}}
`;
