// Diving film for TikTok / Reels (~47 s), cut for a voice-over recorded in the app (script: VOICE below, also written
// next to the video). Hook on the biggest image, ocean wonders, the turn "sauf si t'as tout filmé", the camera (studio
// cutout, then the supplier photo in its 30 m case), more ocean seen from inside and from the surface, end line.
// Pexels clips filmed with other cameras (videos/pexels/licences.json), so "Images d'illustration" stays on screen and no
// caption says they were filmed with KapsulCam. The bare camera is never shown underwater: water only with the case.
// Clips and output live on E: (C: is full). node video-film-plongee.mjs -> E:/kapsulcam-media/out/kapsulcam-film-plongee-9x16.mp4
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const require = createRequire('C:/Users/Valentin/node_modules/');
const puppeteer = require('puppeteer-core');
const ICI = path.dirname(fileURLToPath(import.meta.url));
const VID = 'E:/kapsulcam-media/pexels';
const OUT = 'E:/kapsulcam-media/out';
const u = (p) => 'file:///' + path.resolve(ICI, p).replace(/\\/g, '/');
const [W, H, FPS] = [1080, 1920, 30];
const TAIL = 0.6;

// d: duration, id + from: Pexels clip and start (s), tr: transition in ('cut' | 'whip' | 'flash' | 'zoom' | 'fade'),
// cap: big caption, pill: small badge [text, appears at s], kind: 'studio' (cutout on blue) or 'photo' (still, push-in).
const SHOTS = [
  { d: 4.0, id: 36717426, from: 1.2, tr: 'cut', cap: 'personne va te croire\nquand tu vas raconter ça' },
  { d: 2.6, id: 28451683, from: 3.3, tr: 'cut' },
  { d: 2.6, id: 36155362, from: 1.8, tr: 'whip' },
  { d: 2.6, id: 26612855, from: 3.0, tr: 'cut' },
  { d: 2.4, id: 33765600, from: 0.5, tr: 'cut' },
  { d: 2.3, id: 33994571, from: 2.0, tr: 'zoom', turn: "sauf si t'as\ntout filmé." },
  { d: 4.4, kind: 'studio', tr: 'flash', pills: [['4K grand angle', 1.0], ['36 g', 1.9]] },
  { d: 3.6, kind: 'photo', src: 'carrousel3/05-plongee.jpg', tr: 'cut', pills: [['étanche 30 m · caisson inclus', 0.5]] },
  { d: 2.8, id: 37825631, from: 3.0, tr: 'zoom' },
  { d: 2.4, id: 33000364, from: 1.0, tr: 'cut' },
  { d: 2.6, id: 30743748, from: 1.6, tr: 'whip', pills: [["jusqu'à 90 min", 0.3]] },
  { d: 2.6, id: 35120301, from: 3.0, tr: 'cut' },
  { d: 2.4, id: 39608308, from: 10.0, tr: 'cut' },
  { d: 2.3, id: 30706634, from: 4.0, tr: 'whip' },
  { d: 2.9, id: 39355913, from: 4.0, tr: 'cut' },
  { d: 4.6, id: 36717426, from: 20.0, tr: 'fade', end: true },
];

const VOICE = [
  [0, 'Quand tu vas raconter ça à tes potes... personne va te croire.'],
  [1, 'Un requin géant juste au-dessus de ta tête. Une tortue à vingt centimètres de ton masque. Un banc de sardines qui t\'avale tout entier.'],
  [5, 'Sauf si t\'as tout filmé.'],
  [6, 'Ça, c\'est KapsulCam. Une caméra 4K de 36 grammes, pas plus grosse que ton pouce.'],
  [7, 'Et dans son caisson, elle est étanche jusqu\'à 30 mètres.'],
  [8, 'Un appui sur le bouton, et tu profites de ta plongée. Grand angle, jusqu\'à 90 minutes d\'enregistrement, et en remontant sur le bateau, tu récupères tout sur ton téléphone.'],
  [13, 'T\'as plus qu\'à choisir ta prochaine destination.'],
  [15, 'Tu plonges. Elle filme. KapsulCam, le lien est dans la bio.'],
];

let t = 0;
for (const s of SHOTS) { s.a = t; t += s.d; s.b = t; }
const total = t;
const TMP = path.join(OUT, '_tmp-film-plongee');
fs.rmSync(TMP, { recursive: true, force: true });
fs.mkdirSync(TMP, { recursive: true });

const count = {};
for (const [i, s] of SHOTS.entries()) {
  if (!s.id) continue;
  const dir = path.join(TMP, `clip${i}`);
  fs.mkdirSync(dir);
  const vf = `scale=${W}:${H}:force_original_aspect_ratio=increase:flags=lanczos,crop=${W}:${H},eq=contrast=1.06:saturation=1.14,unsharp=5:5:0.4,fps=${FPS}`;
  execFileSync('ffmpeg', ['-loglevel', 'error', '-ss', String(s.from), '-t', String(s.d + TAIL), '-i', path.join(VID, `${s.id}.mp4`), '-vf', vf, '-q:v', '2', path.join(dir, '%04d.jpg')]);
  count[i] = fs.readdirSync(dir).length;
}

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@800;900&family=Inter:wght@500;600;700;800&display=swap');
*{margin:0;padding:0;box-sizing:border-box}
body{width:${W}px;height:${H}px;overflow:hidden;background:#000;position:relative;font-family:Montserrat,sans-serif}
.bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;will-change:transform,filter,opacity}
#studio{position:absolute;inset:0;display:none;overflow:hidden;background:radial-gradient(circle at 50% 40%,#1f6a96 0%,#0c3354 42%,#041526 100%)}
#rays{position:absolute;left:-40%;right:-40%;top:-30%;height:120%;background:repeating-conic-gradient(from 180deg at 50% 0%,rgba(255,255,255,.07) 0deg 4deg,rgba(255,255,255,0) 4deg 11deg);filter:blur(14px);-webkit-mask-image:linear-gradient(to bottom,#000 0%,rgba(0,0,0,.5) 45%,transparent 80%)}
#cam{position:absolute;left:50%;top:470px;height:860px;margin-left:-187px;filter:drop-shadow(0 40px 60px rgba(0,0,0,.55))}
#logo{position:absolute;left:0;right:0;top:300px;margin:0 auto;width:400px}
#bubbles{position:absolute;inset:0;pointer-events:none}
.bub{position:absolute;border-radius:50%;background:radial-gradient(circle at 32% 30%,rgba(255,255,255,.9) 0 12%,rgba(255,255,255,.18) 30%,rgba(255,255,255,.05) 62%,rgba(255,255,255,.45) 100%)}
#vignette{position:absolute;inset:0;background:radial-gradient(ellipse at center,rgba(0,0,0,0) 58%,rgba(0,0,0,.32) 100%)}
#flash{position:absolute;inset:0;background:#fff;opacity:0}
#endShade{position:absolute;left:0;right:0;top:0;height:55%;background:linear-gradient(to bottom,rgba(0,10,25,.55),rgba(0,0,0,0));opacity:0}
#hook{position:absolute;left:60px;right:60px;top:300px;text-align:center;white-space:pre-line;font-family:Inter,sans-serif;font-weight:800;font-size:60px;line-height:1.18;color:#fff;
  -webkit-text-stroke:8px #000;paint-order:stroke fill;text-shadow:0 4px 14px rgba(0,0,0,.35)}
#turn{position:absolute;left:40px;right:40px;top:760px;text-align:center;white-space:pre-line;font-weight:900;font-size:104px;line-height:1.02;letter-spacing:-2px;color:#fff;
  -webkit-text-stroke:10px #000;paint-order:stroke fill;text-shadow:0 10px 30px rgba(0,0,0,.45)}
#pills{position:absolute;left:40px;right:40px;top:1360px;display:flex;justify-content:center;gap:22px;flex-wrap:wrap}
.pill{font-family:Inter,sans-serif;font-weight:800;font-size:46px;color:#0b0b0b;background:rgba(255,255,255,.96);border-radius:999px;padding:16px 36px;box-shadow:0 12px 30px rgba(0,0,0,.35);white-space:nowrap}
#end{position:absolute;left:0;right:0;top:250px;text-align:center;color:#fff;opacity:0}
#end .l1{font-weight:900;font-size:122px;letter-spacing:-3px;line-height:1.02;text-shadow:0 8px 30px rgba(0,0,0,.45)}
#end img{width:330px;display:block;margin:46px auto 0;filter:drop-shadow(0 4px 12px rgba(0,0,0,.4))}
#end .url{font-family:Inter,sans-serif;font-weight:600;font-size:40px;margin-top:22px;text-shadow:0 2px 10px rgba(0,0,0,.6)}
#illus{position:absolute;left:44px;top:205px;font-family:Inter,sans-serif;font-size:24px;font-weight:600;color:rgba(255,255,255,.75);text-shadow:0 2px 6px rgba(0,0,0,.6)}
</style></head><body>
<img id="prev" class="bg"><img id="cur" class="bg">
<div id="studio"><div id="rays"></div><img id="logo" src="${u('buybox/kc-logo-light.png')}"><img id="cam" src="${u('decoupes/item00.png')}"></div>
<div id="bubbles"></div>
<div id="vignette"></div><div id="endShade"></div>
<div id="hook"></div><div id="turn"></div><div id="pills"></div>
<div id="end"><div class="l1">tu plonges.<br>elle filme.</div><img src="${u('buybox/kc-logo-light.png')}"><div class="url">kapsulcam.com</div></div>
<div id="illus">Images d'illustration</div>
<div id="flash"></div>
<script>
const W=${W},H=${H};
const clamp=(x)=>Math.max(0,Math.min(1,x));
const ease=(x)=>1-Math.pow(1-clamp(x),3);
const back=(x)=>{x=clamp(x);const c=1.9;return 1+(c+1)*Math.pow(x-1,3)+c*Math.pow(x-1,2)};
const $=(id)=>document.getElementById(id);
const load=async(id,src)=>{const im=$(id);if(!src){im.style.display='none';return;}im.style.display='block';if(im.dataset.src!==src){im.dataset.src=src;im.src=src;await im.decode();}};
const rnd=(k)=>{const x=Math.sin(k*127.1+311.7)*43758.5453;return x-Math.floor(x)};
const bubbles=[...Array(30)].map((_,k)=>{const b=document.createElement('div');b.className='bub';$('bubbles').appendChild(b);
  return {el:b,x:rnd(k)*W,s:10+rnd(k+50)*34,v:160+rnd(k+90)*260,y0:H*(0.6+rnd(k+130)*0.9),w:rnd(k+170)*6.28}});
window.frame=async(f)=>{
  await load('cur',f.cur);await load('prev',f.prev);
  const cur=$('cur'),prev=$('prev'),p=f.local/f.d;
  cur.style.filter='none';prev.style.filter='none';prev.style.opacity=1;cur.style.objectPosition='50% 50%';cur.style.transformOrigin='50% 50%';
  let sc=1+0.045*p;
  if(f.tr==='zoom')sc+=0.14*(1-ease(f.local/0.35));
  cur.style.transform='scale('+sc+')';
  if(f.kind==='photo'){cur.style.objectPosition='62% 50%';cur.style.transformOrigin='750px 520px';cur.style.transform='scale('+(1+0.13*ease(p))+')';}
  if(f.prev&&f.tr==='whip'){const q=ease(f.local/0.25),b=26*Math.sin(Math.PI*q);
    prev.style.transform='translateX('+(-q*W)+'px)';prev.style.filter='blur('+b+'px)';
    cur.style.transform='translateX('+((1-q)*W)+'px) scale('+sc+')';cur.style.filter='blur('+b+'px)';}
  if(f.prev&&f.tr==='fade'){prev.style.transform='none';prev.style.opacity=1;cur.style.opacity=1;prev.style.zIndex=1;prev.style.opacity=1-clamp(f.local/0.6);}else{prev.style.zIndex=0;}
  const st=$('studio');st.style.display=f.kind==='studio'?'block':'none';
  if(f.kind==='studio'){const e=back(f.local/0.5);
    $('cam').style.transform='translateY('+(Math.sin(f.local*2.2)*14+(1-ease(f.local/0.5))*120)+'px) rotate('+(Math.sin(f.local*1.4)*2.5)+'deg) scale('+(0.8+0.2*e)+')';
    $('cam').style.opacity=clamp(f.local/0.25);
    $('logo').style.opacity=clamp((f.local-0.2)/0.3);$('logo').style.transform='translateY('+((1-ease((f.local-0.2)/0.4))*-30)+'px)';
    $('rays').style.transform='rotate('+(Math.sin(f.local*0.8)*4)+'deg)';}
  const showBub=f.kind==='photo';
  for(const b of bubbles){b.el.style.display=showBub?'block':'none';if(!showBub)continue;
    const y=b.y0-b.v*f.local;b.el.style.width=b.el.style.height=b.s+'px';
    b.el.style.transform='translate('+(b.x+Math.sin(f.local*3+b.w)*14)+'px,'+y+'px)';}
  const fl=f.tr==='flash'?1-clamp(f.local/0.35):0;$('flash').style.opacity=fl;
  const hk=$('hook');hk.textContent=f.cap||'';
  hk.style.opacity=f.cap?(f.local>f.d-0.25?Math.max(0,(f.d-f.local)/0.25):1):0;
  const tn=$('turn');tn.textContent=f.turn||'';
  const te=f.turn?back((f.local-0.15)/0.35):0;tn.style.opacity=f.turn?clamp((f.local-0.15)/0.15):0;tn.style.transform='scale('+(0.6+0.4*te)+')';
  const pl=$('pills');pl.innerHTML='';
  if(f.kind==='studio')pl.style.top='1390px';else if(f.kind==='photo')pl.style.top='1290px';else pl.style.top='1330px';
  for(const [txt,at] of (f.pills||[])){if(f.local<at)continue;const d=document.createElement('div');d.className='pill';d.textContent=txt;
    const e=back((f.local-at)/0.35);d.style.transform='scale('+(0.5+0.5*e)+')';d.style.opacity=clamp((f.local-at)/0.12);pl.appendChild(d);}
  const ea=f.end?ease((f.local-0.7)/0.7):0;
  $('end').style.opacity=ea;$('endShade').style.opacity=ea;$('end').style.transform='translateY('+((1-ea)*30)+'px)';
};
</script></body></html>`;
fs.writeFileSync(path.join(TMP, 'page.html'), html);

const frameOf = (i, local) => {
  const n = Math.min(Math.floor(local * FPS) + 1, count[i]);
  return u(path.join(TMP, `clip${i}`, `${String(n).padStart(4, '0')}.jpg`));
};
const nav = await puppeteer.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true, args: ['--allow-file-access-from-files'] });
const p = await nav.newPage();
await p.setViewport({ width: W, height: H });
await p.goto(u(path.join(TMP, 'page.html')), { waitUntil: 'networkidle0', timeout: 60000 });
await p.evaluate(() => document.fonts.ready);
const frames = path.join(TMP, 'frames');
fs.mkdirSync(frames);
const only = process.argv[2] ? process.argv[2].split(',').map(Number) : null;
for (let k = 0; k < Math.round(total * FPS); k++) {
  const tt = k / FPS;
  if (only && !only.some((x) => Math.abs(x - tt) < 0.5 / FPS)) continue;
  const i = SHOTS.findIndex((s) => tt >= s.a && tt < s.b);
  const s = SHOTS[i];
  const local = tt - s.a;
  const prevShot = SHOTS[i - 1];
  const blend = prevShot?.id && ((s.tr === 'whip' && local < 0.25) || (s.tr === 'fade' && local < 0.6));
  const cur = s.id ? frameOf(i, local) : s.kind === 'photo' ? u(s.src) : null;
  const f = { local, d: s.d, tr: s.tr, kind: s.kind, cap: s.cap, turn: s.turn, pills: s.pills, end: !!s.end, cur, prev: blend ? frameOf(i - 1, prevShot.d + local) : null };
  await p.evaluate((x) => window.frame(x), f);
  await p.screenshot({ path: path.join(frames, `${String(k).padStart(4, '0')}.jpg`), type: 'jpeg', quality: 93 });
}
await nav.close();
if (only) { console.log('aperçus ->', frames); process.exit(0); }

const mp4 = path.join(OUT, 'kapsulcam-film-plongee-9x16.mp4');
execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-framerate', String(FPS), '-i', path.join(frames, '%04d.jpg'), '-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=stereo',
  '-shortest', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '17', '-maxrate', '12M', '-bufsize', '24M', '-preset', 'slow', '-c:a', 'aac', '-movflags', '+faststart', mp4]);
const fmt = (x) => `${Math.floor(x / 60)}:${(x % 60).toFixed(1).padStart(4, '0')}`;
const voice = VOICE.map(([i, txt], n) => `${fmt(SHOTS[i].a)} -> ${fmt(VOICE[n + 1] ? SHOTS[VOICE[n + 1][0]].a : total)}  ${txt}`).join('\n');
fs.writeFileSync(path.join(OUT, 'kapsulcam-film-plongee-voix.txt'), voice + '\n');
fs.rmSync(TMP, { recursive: true, force: true });
console.log('->', mp4, `${total.toFixed(1)} s`);
console.log(voice);
