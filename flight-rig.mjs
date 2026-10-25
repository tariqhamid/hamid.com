// Illustrative flight rhythms, not measured ornithological frequencies.
// Each row: wing period, flap-to-glide cycle, stroke scale, bank angle, flight style.
export const flightProfiles = [
 [.50,3.8,.68,4,'flutter'],[.23,2.9,.68,3,'bounding'],[.31,3.4,.68,4,'steady'],[.70,4.8,.56,3,'burst'],[.25,3.1,.72,2,'steady'],
 [.23,3.5,.72,3,'burst'],[1.15,7.7,.32,5,'soar'],[.40,5.5,.50,7,'soar'],[1.10,6.0,.62,2,'steady'],[.72,5.6,.60,3,'steady'],
 [.19,2.8,.74,4,'bounding'],[.21,3.2,.72,4,'bounding'],[.20,3.1,.76,2,'steady'],[.30,4.0,.70,3,'steady'],[.25,3.9,.55,8,'agile'],
 [.22,2.7,.66,3,'bounding'],[1.30,8.1,.36,3,'soar'],[1.18,6.6,.60,2,'steady'],[.46,4.4,.55,5,'bounding'],[.75,7.2,.40,5,'soar'],
 [.32,3.9,.66,3,'bounding'],[.43,5.1,.46,6,'agile'],[.48,5.6,.50,6,'agile'],[.24,3.2,.68,4,'bounding'],[.30,3.5,.65,3,'steady'],
 [.29,3.7,.72,3,'burst'],[.20,2.8,.74,2,'burst'],[.22,3.3,.65,4,'bounding'],[.70,5.0,.65,6,'agile'],[.23,3.0,.74,2,'steady']
];
// Individually placed shoulder, head and tail joints in each cropped bird image.
const joints = [
 [44,58,72,44,35,77],[48,56,79,47,34,76],[47,57,79,48,32,79],[56,49,87,28,35,70],[50,57,82,45,35,78],
 [45,57,79,55,32,79],[49,56,79,60,34,76],[44,58,79,62,32,78],[48,53,84,46,36,76],[48,57,82,62,36,78],
 [45,57,80,57,33,79],[47,57,80,56,34,79],[46,59,78,60,33,77],[45,56,80,59,34,79],[48,59,86,59,34,78],
 [45,57,80,57,34,80],[45,53,75,58,35,77],[44,57,81,48,34,79],[45,58,81,65,34,79],[44,55,80,64,34,80],
 [46,56,80,59,33,80],[47,55,78,52,32,79],[46,56,80,54,33,78],[46,57,80,52,32,81],[45,57,80,60,33,80],
 [45,57,78,30,32,75],[45,58,79,59,34,81],[44,58,80,54,33,81],[50,56,79,57,36,81],[48,58,81,60,34,79]
];
const poly=pts=>`<polygon points="${pts.map(p=>p.join(',')).join(' ')}"/>`;
function parts(i) {
 const [wx,wy,hx,hy,tx,ty]=joints[i];
 return {
  wing:poly([[-12,-12],[wx+1,-12],[wx+5,wy-21],[wx+10,wy-5],[wx+1,wy+8],[wx-18,wy+5],[-12,wy-8]]),
  backWing:i===0?poly([[0,57],[wx-10,wy-2],[wx+5,wy+4],[wx-3,wy+15],[10,88],[-10,78]]):poly([[wx+2,-12],[112,-12],[112,hy-21],[hx-18,hy-21],[hx-19,hy-4],[wx+9,wy+3],[wx-5,wy-7]]),
  head:`<rect x="${i===0?38:hx-28}" y="-40" width="${i===0?100:155-hx}" height="${hy+73}"/>`,
  shoulder:`<ellipse cx="${wx}" cy="${wy+3}" rx="15" ry="10"/>`,
  tail:poly([[-10,ty-3],[tx-12,ty-11],[tx+6,ty-1],[tx-2,ty+13],[tx-7,110],[-10,110]]),
  jaw:poly([[hx+9,hy+2],[110,hy+5],[110,hy+11],[hx+9,hy+6]])
 };
}
export function rigDefs(names,box,birdUse) {
 return names.map((_,i)=>{
 const p=parts(i);
 return `<g id="flight-source-${i}"><svg width="100" height="100" viewBox="${box(i)}" preserveAspectRatio="none" overflow="hidden">${birdUse(i)}</svg></g>`+
 Object.entries(p).map(([name,shape])=>`<clipPath id="flight-${name}-${i}">${shape}</clipPath>`).join('')+
 `<mask id="flight-body-${i}" maskUnits="userSpaceOnUse" x="-30" y="-40" width="180" height="190"><rect x="-30" y="-40" width="180" height="190" fill="white"/><g fill="black">${p.wing}${p.backWing}${p.tail}</g><g fill="white">${p.head}</g></mask>`+
 `<mask id="flight-face-${i}" maskUnits="userSpaceOnUse" x="-30" y="-40" width="180" height="190"><rect x="-30" y="-40" width="180" height="190" fill="white"/></mask>`+
 `<mask id="flight-protect-head-${i}" maskUnits="userSpaceOnUse" x="-30" y="-40" width="180" height="190"><rect x="-30" y="-40" width="180" height="190" fill="white"/><g fill="black">${p.head}</g></mask>`+
 `<mask id="flight-not-wing-${i}" maskUnits="userSpaceOnUse" x="-30" y="-40" width="180" height="190"><rect x="-30" y="-40" width="180" height="190" fill="white"/><g fill="black">${p.wing}${p.backWing}</g></mask>`;
 }).join('');
}
export function rigBird(i,size,names,box) {
 const [, ,w,h]=box(i).split(' ').map(Number),ratio=h/w;
 const [wx,wy,hx,hy,tx,ty]=joints[i];
 const [beat,cycle,stroke,bank,style]=flightProfiles[i];
 const phase=-(i*.173+beat*.31);
 const vars=`--wing-name:flight-wing-${i};--beat:${beat}s;--cycle:${cycle}s;--phase:${phase}s;--stroke:${-stroke};--bank:${bank}deg;--head-cycle:${(2.1+i%6*.37).toFixed(2)}s;--tail-cycle:${(1.1+i%7*.18).toFixed(2)}s`;
 const part=(cls,id,origin,extra='')=>`<g class="${cls}" style="transform-origin:${origin}" ${extra}><g clip-path="url(#flight-${id}-${i})"><use href="#flight-source-${i}"${id==='tail'?` mask="url(#flight-not-wing-${i})"`:''}/></g></g>`;
 return `<svg x="${-size/2}" y="${-size/2}" width="${size}" height="${size}" viewBox="-18 -25 136 ${100*ratio+50}" overflow="visible"><title>${names[i]}</title><g class="flight-bird flight-${style}" data-flight="${style}" style="${vars}"><g transform="scale(1 ${ratio})"><g class="flight-body-bob">${part('flight-wing flight-back-wing','backWing',`${wx+3}px ${wy-2}px`)}<use href="#flight-source-${i}" mask="url(#flight-body-${i})"/>${part('flight-tail','tail',`${tx}px ${ty}px`)}${part('flight-shoulder','shoulder',`${wx}px ${wy}px`)}<g class="flight-glide">${part('flight-wing','wing',`${wx}px ${wy}px`)}</g><g class="flight-head-intact" clip-path="url(#flight-head-${i})"><use href="#flight-source-${i}"/></g></g></g></g></svg>`;
}
const strokeFrames=flightProfiles.map(([beat,cycle,stroke,,style],i)=>{
 const duty=style==='soar'?.25:style==='bounding'?.64:style==='burst'?.55:style==='agile'?.82:1;
 const count=Math.max(1,Math.round(cycle*duty/beat));
 const span=100*duty/count;
 let frames='';
 for(let j=0;j<count;j++){
  const at=j*span;
  frames+=`${at.toFixed(3)}%{transform:rotate(-3deg) scaleY(1)}${(at+span*.43).toFixed(3)}%{transform:rotate(8deg) scaleY(${-stroke})}${(at+span*.72).toFixed(3)}%{transform:rotate(-5deg) scaleY(.25)}`;
 }
 if(duty<1)frames+=`${(duty*100).toFixed(3)}%,96%{transform:rotate(1deg) scaleY(.78)}`;
 return `@keyframes flight-wing-${i}{${frames}100%{transform:rotate(-3deg) scaleY(1)}}`;
}).join('');
export const flightCss=`
.flight-bird{animation:flight-bank var(--cycle) ease-in-out infinite;animation-delay:var(--phase);transform-origin:50px 55px}
.flight-wing{animation:var(--wing-name) var(--cycle) cubic-bezier(.45,.05,.25,.95) infinite;animation-delay:var(--phase);will-change:transform}
.flight-back-wing{animation-delay:calc(var(--phase) - var(--beat)*.08);opacity:.88}
.flight-head{animation:flight-look var(--head-cycle) ease-in-out infinite;animation-delay:var(--phase)}
.flight-tail{animation:flight-steer var(--tail-cycle) ease-in-out infinite;animation-delay:var(--phase)}
.flight-jaw{animation:flight-beak calc(var(--head-cycle)*2.7) ease-in-out infinite;animation-delay:var(--phase)}
.flight-body-bob{animation:flight-lift calc(var(--beat)*2) ease-in-out infinite;animation-delay:var(--phase)}
@keyframes flight-stroke{0%,100%{transform:rotate(-3deg) scaleY(1)}43%{transform:rotate(8deg) scaleY(var(--stroke))}72%{transform:rotate(-7deg) scaleY(.28)}}
@keyframes flight-soar-stroke{0%,8%,16%,24%{transform:rotate(-2deg) scaleY(1)}4%,12%,20%{transform:rotate(5deg) scaleY(var(--stroke))}32%,84%{transform:rotate(2deg) scaleY(.85)}100%{transform:rotate(-2deg) scaleY(1)}}
@keyframes flight-burst-stroke{0%,12%,24%,36%,48%,100%{transform:rotate(-3deg) scaleY(1)}6%,18%,30%,42%{transform:rotate(8deg) scaleY(var(--stroke))}57%,83%{transform:rotate(0deg) scaleY(.45)}}
@keyframes flight-bank{0%,100%{transform:rotate(calc(var(--bank)*-1)) translateY(0)}35%{transform:rotate(var(--bank)) translateY(-2px)}70%{transform:rotate(0deg) translateY(1px)}}
@keyframes flight-look{0%,100%{transform:rotate(0deg)}24%{transform:rotate(-2deg)}42%{transform:rotate(1deg)}68%{transform:rotate(-.7deg)}}
@keyframes flight-steer{0%,100%{transform:rotate(-2deg)}38%{transform:rotate(4deg) scaleY(1.05)}72%{transform:rotate(-3deg)}}
@keyframes flight-beak{0%,67%,77%,100%{transform:rotate(0deg)}71%{transform:rotate(2.5deg)}74%{transform:rotate(.7deg)}}
@keyframes flight-lift{0%,100%{transform:translateY(0)}45%{transform:translateY(-.8px)}}
@media(prefers-reduced-motion:reduce){.flight-bird,.flight-wing,.flight-head,.flight-tail,.flight-jaw,.flight-body-bob{animation:none!important}}
${strokeFrames}
`;
