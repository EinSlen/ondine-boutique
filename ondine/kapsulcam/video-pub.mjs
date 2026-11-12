// 15 s motion ad in the site's Loop style, rendered frame by frame (deterministic) then encoded with ffmpeg.
// Uses only our packshots and supplier lifestyle images, never third-party POV footage.
// node video-pub.mjs [16x9|1x1|9x16 ...]   -> pub/video/kapsulcam-15s-<format>.mp4
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const require = createRequire('C:/Users/Valentin/node_modules/');
const puppeteer = require('puppeteer-core');
const ICI = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(ICI, 'pub', 'video');
fs.mkdirSync(OUT, { recursive: true });
const u = (p) => 'file:///' + path.join(ICI, p).replace(/\\/g, '/');
const FORMATS = { '16x9': [1920, 1080], '1x1': [1080, 1080], '9x16': [1080, 1920] };
const FPS = 30;
const DUR = 15;
// Opening shot: the home page hero loop (Mixkit, free license), as a backdrop behind the packshot.
const SEA = { '16x9': 'videos/hero-16x9.mp4', '1x1': 'videos/hero-16x9.mp4', '9x16': 'videos/hero-9x16.mp4' };
const SEA_LEN = 3.2;
const CARDS = { ski: 'decoupes/p-ski.jpg', dive: 'carrousel3/05-plongee.jpg', col: 'decoupes/p-collier.jpg', wri: 'decoupes/p-poignet.jpg' };

const page = (w, h) => `<!doctype html><html><head><meta charset="utf-8"><style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
*{margin:0;padding:0;box-sizing:border-box}
body{width:${w}px;height:${h}px;overflow:hidden;background:#EDECE8;font-family:Inter,sans-serif;color:#111;position:relative}
.l{position:absolute;opacity:0}
.card{position:absolute;opacity:0;overflow:hidden;border-radius:${Math.round(Math.min(w, h) * 0.035)}px;box-shadow:0 24px 60px rgba(0,0,0,.16)}
.card img{width:100%;height:100%;object-fit:cover;display:block}
#sea .grad{position:absolute;inset:0;background:${w > h ? 'linear-gradient(90deg,rgba(0,0,0,.5),rgba(0,0,0,.08) 60%)' : 'linear-gradient(180deg,rgba(0,0,0,.5),rgba(0,0,0,.05) 55%)'}}
#t1,#t2{color:#fff}#t2{opacity:.85}${w === h ? '#seaimg{object-position:8% 50%}' : ''}
.cam{filter:drop-shadow(0 30px 40px rgba(0,0,0,.22));object-fit:contain}
.h{white-space:nowrap}#cap{white-space:normal}.h{font-weight:500;letter-spacing:-0.035em;line-height:1.05}
.sub{color:#6b6b6b;font-weight:400;letter-spacing:-0.02em}
.pill{display:inline-block;border-radius:999px;background:#111;color:#fff;font-weight:600;letter-spacing:-0.01em}
</style></head><body>
<div id="sea" class="card"><img id="seaimg"><div class="grad"></div></div>
<img id="cam" class="l cam" src="${u('decoupes/item00.png')}">
<div id="t1" class="l h"></div>
<div id="t2" class="l h"></div>
${Object.entries(CARDS).map(([id, src]) => `<div id="${id}" class="card"><img src="${u(src)}"></div>`).join('')}
${[1, 2, 3, 4, 5, 6].map((i) => `<img id="acc${i}" class="l cam" src="${u(`decoupes/item0${i}.png`)}">`).join('')}
<div id="cap" class="l h"></div>
<div id="end" class="l" style="text-align:center"></div>
<script>
const W=${w},H=${h},V=H>=W,P=H>W*1.2,S=Math.min(W,H);
const clamp=(x)=>Math.max(0,Math.min(1,x));
const ease=(x)=>{x=clamp(x);return 1-Math.pow(1-x,3)};
const win=(t,a,b,f=0.45)=>t<a||t>b?0:Math.min(a<=0?1:ease((t-a)/f),ease((b-t)/f));
const rise=(t,a,d)=>(1-ease((t-a)/0.6))*d;
const $=(id)=>document.getElementById(id);
const set=(id,o)=>{const e=$(id);for(const k in o)if(!'xysr'.includes(k)||k.length>1)e.style[k]=o[k];
  e.style.transform='translate('+(o.x||0)+'px,'+(o.y||0)+'px) scale('+(o.s==null?1:o.s)+') rotate('+(o.r||0)+'deg)'};
const px=(v)=>v+'px';
const box=(id,cx,cy,bw,bh,op,dy,extra)=>set(id,Object.assign({left:px(cx-bw/2),top:px(cy-bh/2),width:px(bw),height:px(bh),opacity:op,y:dy||0},extra||{}));
const card=(id,cx,cy,cw,ch,a,b)=>{box(id,cx,cy,cw,ch,win(t0,a,b),rise(t0,a,60));
  $(id).firstChild.style.transform='scale('+(1.02+0.06*clamp((t0-a)/(b-a)))+')'};
const cap=(title,sub,op,dy,mid)=>{const C=V||mid;const e=$('cap');e.innerHTML=title+'<br><span class="sub" style="font-size:.62em">'+sub+'</span>';
  const fs=V?S*0.075:H*0.075;
  set('cap',{fontSize:px(fs),left:px(C?0:W*0.07),top:px(V?H*(P?0.15:0.05):mid?H*0.1:H*0.34),width:px(C?W:W*0.34),textAlign:C?'center':'left',opacity:op,y:dy})};
let t0=0;
function renderAt(t){
  t0=t;
  // Scene 1 (0-3): site hero sea loop + packshot + headline, visible from the first frame (thumbnail).
  const a1=win(t,0,3.1);
  const m=S*0.025;
  set('sea',{left:px(m),top:px(m),width:px(W-2*m),height:px(H-2*m),opacity:a1});
  const hs=V?S*(P?0.1:0.085):H*0.1;
  const tx=V?0:W*0.08, tw=V?W:W*0.58, ty=V?H*(P?0.12:0.06):H*0.36;
  set('t1',{fontSize:px(hs),left:px(tx),top:px(ty),width:px(tw),textAlign:V?'center':'left',opacity:a1});
  $('t1').textContent='Vivez le moment.';
  set('t2',{fontSize:px(hs),left:px(tx),top:px(ty+hs*1.1),width:px(tw),textAlign:V?'center':'left',opacity:win(t,0.5,3.1),y:rise(t,0.5,24)});
  $('t2').textContent='Elle le filme.';
  const ch=V?H*(P?0.5:0.58):H*0.78, cw=ch*622/1433;
  box('cam',V?W/2:W*0.72,V?H*(P?0.63:0.66):H*0.5,cw,ch,a1,0,{s:0.94+0.06*ease(t/3),r:-6+3*ease(t/3)});
  // Scenes 2-4 (3-10.6): lifestyle cards with captions.
  const B=V?Math.min(W*0.86,H*(P?0.6:0.62)):H*0.8;
  const bx=V?W/2:W*0.69, by=V?H*(P?0.6:0.63):H*0.5;
  card('ski',bx,by,V?B:W*0.5,B,3.0,5.6);
  card('dive',bx,by,V?B:W*0.5,B,5.5,8.1);
  const sw=V?B*0.485:W*0.245, sgap=V?B*0.03:W*0.01;
  card('col',bx-(sw+sgap)/2,by,sw,B,8.0,10.6);
  card('wri',bx+(sw+sgap)/2,by,sw,B,8.15,10.6);
  const caps=[[3.0,5.6,'4K. 36 grammes.','Elle se porte sur vous.'],[5.5,8.1,'Étanche 30 m.','Caisson de plongée inclus.'],[8.0,10.6,'Collier, clip, bracelet.','Vous gardez les mains libres.']];
  let shown=false;
  for(const [a,b,ti,su] of caps){const o=win(t,a+0.15,b);if(o>0){shown=true;cap(ti,su,o,rise(t,a+0.15,24));}}
  // Scene 5 (10.5-13): everything in the box.
  const a5=win(t,10.5,13.1);
  if(!shown){if(a5>0)cap('Tout est dans la boîte.','Collier, bracelet, guidon, caisson, clip, support.',a5,rise(t,10.5,24),true);else set('cap',{opacity:0});}
  for(let i=1;i<=6;i++){const k=i-1;
    const cx=V?W*(0.2+0.3*(k%3)):W*(0.13+0.148*k), cy=V?H*(P?0.5+0.22*Math.floor(k/3):0.48+0.28*Math.floor(k/3)):H*0.62;
    const bw=V?W*0.24:W*0.12, bh=V?H*(P?0.19:0.24):H*0.46;
    box('acc'+i,cx,cy,bw,bh,win(t,10.55+k*0.08,13.1),rise(t,10.55+k*0.08,40));}
  // Scene 6 (13-15): end card.
  const a6=ease((t-13.05)/0.6);
  const E=V?S:H;
  $('end').innerHTML='<img src="${u('buybox/kc-logo-dark.png')}" style="width:'+(E*0.48)+'px;display:block;margin:0 auto '+(E*0.06)+'px">'
    +'<div class="h" style="font-size:'+(E*0.13)+'px">89,90 €</div>'
    +'<div class="sub" style="font-size:'+(E*0.038)+'px;margin:'+(E*0.025)+'px 0 '+(E*0.06)+'px">Livraison offerte · Satisfait ou remboursé 30 jours</div>'
    +'<span class="pill" style="font-size:'+(E*0.045)+'px;padding:'+(E*0.028)+'px '+(E*0.07)+'px">kapsulcam.com</span>';
  set('end',{left:'0px',top:px(H/2-E*0.36),width:px(W),opacity:a6,y:(1-a6)*30});
}
window.renderAt=renderAt;
window.seaFrame=async(src)=>{const im=$('seaimg');im.src=src;await im.decode();};
renderAt(0);
</script></body></html>`;

const nav = await puppeteer.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true, args: ['--allow-file-access-from-files'] });
const formats = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(FORMATS);
for (const fmt of formats) {
  const [w, h] = FORMATS[fmt];
  const dir = path.join(OUT, `frames-${fmt}`);
  fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
  const f = path.join(OUT, `_${fmt}.html`);
  fs.writeFileSync(f, page(w, h));
  const p = await nav.newPage();
  await p.setViewport({ width: w, height: h });
  await p.goto('file:///' + f.replace(/\\/g, '/'), { waitUntil: 'networkidle0', timeout: 60000 });
  await p.evaluate(() => document.fonts.ready);
  const sea = path.join(OUT, `_sea-${fmt}`);
  fs.rmSync(sea, { recursive: true, force: true }); fs.mkdirSync(sea);
  execFileSync('ffmpeg', ['-loglevel', 'error', '-t', String(SEA_LEN), '-i', path.join(ICI, SEA[fmt]), '-vf', `fps=${FPS}`, '-q:v', '2', path.join(sea, '%04d.jpg')]);
  const seaFrames = fs.readdirSync(sea).sort();
  for (let i = 0; i < DUR * FPS; i++) {
    const t = i / FPS;
    if (t < SEA_LEN) await p.evaluate((src) => window.seaFrame(src), 'file:///' + path.join(sea, seaFrames[Math.min(i, seaFrames.length - 1)]).replace(/\\/g, '/'));
    await p.evaluate((x) => window.renderAt(x), t);
    await p.screenshot({ path: path.join(dir, `${String(i).padStart(4, '0')}.jpg`), type: 'jpeg', quality: 90 });
  }
  await p.close();
  const mp4 = path.join(OUT, `kapsulcam-15s-${fmt}.mp4`);
  execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-framerate', String(FPS), '-i', path.join(dir, '%04d.jpg'), '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-movflags', '+faststart', mp4]);
  fs.rmSync(dir, { recursive: true, force: true }); fs.rmSync(sea, { recursive: true, force: true }); fs.unlinkSync(f);
  console.log(fmt, '->', mp4);
}
await nav.close();
