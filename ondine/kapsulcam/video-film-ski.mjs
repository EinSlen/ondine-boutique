// 30 s organic film for TikTok / Reels, one activity: the camera on a ski helmet (product photo), a push into its lens,
// then a POV descent built from one Pexels series (same skier, same blue skis: videos/pexels/licences.json) with slow
// and fast passages and a few whip cuts, closing on "tu vis. elle filme." over the last panorama. Not an ad: no price,
// no question. The POV shots were filmed with another camera, so they carry "Images d'illustration" and no caption says
// they were filmed with KapsulCam. Silent on purpose: the music is picked in the app.
// node video-film-ski.mjs   -> pub/video/organique/kapsulcam-film-ski-9x16.mp4
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const require = createRequire('C:/Users/Valentin/node_modules/');
const puppeteer = require('puppeteer-core');
const ICI = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(ICI, 'pub', 'video', 'organique');
const TMP = path.join(OUT, '_tmp-film-ski');
const u = (p) => 'file:///' + path.resolve(ICI, p).replace(/\\/g, '/');
const [W, H, FPS] = [1080, 1920, 30];
const TAIL = 0.3;
// Helmet photo (1200 x 1200) shown as a centred square; the lens sits at (367, 72) in the source.
const PHOTO = 'decoupes/p-ski.jpg';
const SQ = W;
const SQ_TOP = 560;
const LENS = [367 * SQ / 1200, SQ_TOP + 72 * SQ / 1200];

// [duration, Pexels id, start s, speed, transition in, caption]
const SHOTS = [
  [3.2, null, 0, 1, null, 'pov : ta caméra\nest sur ton casque'],
  [2.8, 15349437, 1.5, 1, 'lens', 'première descente\nde la saison'],
  [3.0, 36517447, 9.0, 0.8, 'cut'],
  [2.6, 36517535, 1.5, 1.2, 'cut'],
  [2.4, 36517533, 0.2, 1.3, 'whip'],
  [2.4, 36517441, 3.5, 1.3, 'cut'],
  [2.2, 36517445, 9.5, 1.3, 'whip'],
  [2.6, 36517446, 11.5, 1.2, 'cut'],
  [3.0, 36517630, 5.5, 1, 'cut'],
  [2.6, 36517633, 6.5, 1, 'whip'],
  [3.4, 36517447, 16.0, 0.8, 'cut', 'END'],
].map(([d, id, from, sp, tr, cap]) => ({ d, id, from, sp, tr, cap }));
let t = 0;
for (const s of SHOTS) { s.a = t; t += s.d; s.b = t; }
const TOTAL = t;

fs.rmSync(TMP, { recursive: true, force: true });
fs.mkdirSync(TMP, { recursive: true });
const count = {};
for (const [i, s] of SHOTS.entries()) {
  if (!s.id) continue;
  const dir = path.join(TMP, `clip${i}`);
  fs.mkdirSync(dir);
  const vf = `setpts=PTS/${s.sp},scale=${W}:${H}:force_original_aspect_ratio=increase:flags=lanczos,crop=${W}:${H},eq=contrast=1.06:saturation=1.12:gamma=0.98,fps=${FPS}`;
  execFileSync('ffmpeg', ['-loglevel', 'error', '-ss', String(s.from), '-t', String((s.d + TAIL) * s.sp), '-i', path.join(ICI, `videos/pexels/${s.id}.mp4`), '-vf', vf, '-q:v', '2', path.join(dir, '%04d.jpg')]);
  count[i] = fs.readdirSync(dir).length;
}

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@700;800;900&family=Inter:wght@500;600&display=swap');
*{margin:0;padding:0;box-sizing:border-box}
body{width:${W}px;height:${H}px;overflow:hidden;background:#000;position:relative;font-family:Montserrat,sans-serif}
.bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;will-change:transform,filter}
#photoBg{position:absolute;inset:-60px;width:calc(100% + 120px);height:calc(100% + 120px);object-fit:cover;filter:blur(40px) brightness(.75)}
#photo{position:absolute;left:0;top:${SQ_TOP}px;width:${SQ}px;height:${SQ}px;transform-origin:${LENS[0]}px ${LENS[1] - SQ_TOP}px}
#whiteout{position:absolute;inset:0;background:#fff;opacity:0}
#vignette{position:absolute;inset:0;background:radial-gradient(ellipse at center,rgba(0,0,0,0) 55%,rgba(0,0,0,.35) 100%)}
#shade{position:absolute;left:0;right:0;bottom:0;height:60%;background:linear-gradient(to top,rgba(0,0,0,.55),rgba(0,0,0,0));opacity:0}
#cap{position:absolute;left:60px;right:60px;top:330px;white-space:pre-line;text-align:center;font-weight:800;font-size:66px;line-height:1.15;color:#fff;
  -webkit-text-stroke:9px #000;paint-order:stroke fill;text-shadow:0 6px 18px rgba(0,0,0,.35)}
#end{position:absolute;left:0;right:0;top:${Math.round(H * 0.5)}px;text-align:center;color:#fff;opacity:0}
#end .l1{font-weight:900;font-size:124px;letter-spacing:-3px;line-height:1.02;text-shadow:0 8px 30px rgba(0,0,0,.45)}
#end img{width:360px;display:block;margin:60px auto 0;filter:drop-shadow(0 4px 12px rgba(0,0,0,.4))}
#illus{position:absolute;left:48px;top:250px;font-family:Inter,sans-serif;font-size:28px;font-weight:600;color:rgba(255,255,255,.85);text-shadow:0 2px 6px rgba(0,0,0,.7)}
</style></head><body>
<img id="photoBg" src="${u(PHOTO)}"><img id="photo" src="${u(PHOTO)}">
<img id="prev" class="bg"><img id="cur" class="bg">
<div id="whiteout"></div><div id="vignette"></div><div id="shade"></div>
<div id="cap"></div>
<div id="end"><div class="l1">tu vis.<br>elle filme.</div><img src="${u('buybox/kc-logo-light.png')}"></div>
<div id="illus">Images d'illustration</div>
<script>
const W=${W},DX=${W / 2 - LENS[0]},DY=${H / 2 - LENS[1]};
const ease=(x)=>{x=Math.max(0,Math.min(1,x));return 1-Math.pow(1-x,3)};
const easeIn=(x)=>{x=Math.max(0,Math.min(1,x));return x*x*x};
const $=(id)=>document.getElementById(id);
const load=async(id,src)=>{const im=$(id);if(!src){im.style.display='none';return;}im.style.display='block';if(im.dataset.src!==src){im.dataset.src=src;im.src=src;await im.decode();}};
window.frame=async(f)=>{
  await load('cur',f.cur);await load('prev',f.prev);
  const photo=f.kind==='photo';
  $('photo').style.display=$('photoBg').style.display=photo?'block':'none';
  $('illus').style.display=photo?'none':'block';
  let white=0;
  if(photo){
    const z=f.local<2.4?1+0.12*ease(f.local/2.4):1.12+11*easeIn((f.local-2.4)/0.8);
    const bl=f.local<2.4?0:7*easeIn((f.local-2.4)/0.8);
    const pt=f.local<2.4?0.25*ease(f.local/2.4):0.25+0.75*ease((f.local-2.4)/0.8);
    $('photo').style.transform='translate('+(DX*pt)+'px,'+(DY*pt)+'px) scale('+z+')';$('photo').style.filter='blur('+bl+'px)';
    white=f.local<2.85?0:0.9*easeIn((f.local-2.85)/0.35);
  }
  const cur=$('cur'),prev=$('prev');
  cur.style.filter='none';prev.style.filter='none';
  if(f.tr==='lens'){const p=ease(f.local/0.5);cur.style.transform='scale('+(1.35-0.35*p)+')';cur.style.filter='blur('+(12*(1-p))+'px)';white=Math.max(white,0.85*(1-ease(f.local/0.35)));}
  else if(f.tr==='whip'&&f.local<0.25){const p=ease(f.local/0.25),b=26*Math.sin(Math.PI*p);
    prev.style.transform='translateX('+(-p*W)+'px)';prev.style.filter='blur('+b+'px)';
    cur.style.transform='translateX('+((1-p)*W)+'px)';cur.style.filter='blur('+b+'px)';}
  else if(!photo){cur.style.transform='scale('+(1.04-0.04*ease(f.local/0.3))+')';}
  if(!(f.tr==='whip'&&f.local<0.25))prev.style.display='none';
  $('whiteout').style.opacity=white;
  const cap=$('cap');
  const capOn=f.cap&&f.cap!=='END'&&f.local<f.d-0.15;
  cap.textContent=capOn?f.cap:'';
  cap.style.opacity=capOn?Math.min(1,f.local/0.15+ (photo?1:0)):0;
  const endOn=f.cap==='END';
  const ea=endOn?ease((f.local-0.5)/0.6):0;
  $('end').style.opacity=ea;$('end').style.transform='translateY('+((1-ea)*30)+'px)';
  $('shade').style.opacity=ea;
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
for (let k = 0; k < Math.round(TOTAL * FPS); k++) {
  const tt = k / FPS;
  const i = SHOTS.findIndex((s) => tt >= s.a && tt < s.b);
  const s = SHOTS[i];
  const local = tt - s.a;
  const prevShot = SHOTS[i - 1];
  const f = {
    kind: s.id ? 'clip' : 'photo', local, d: s.d, tr: s.tr, cap: s.cap || '',
    cur: s.id ? frameOf(i, local) : null,
    prev: s.tr === 'whip' && local < 0.25 && prevShot?.id ? frameOf(i - 1, prevShot.d + local) : null,
  };
  await p.evaluate((x) => window.frame(x), f);
  await p.screenshot({ path: path.join(frames, `${String(k).padStart(4, '0')}.jpg`), type: 'jpeg', quality: 93 });
}
await nav.close();
const mp4 = path.join(OUT, 'kapsulcam-film-ski-9x16.mp4');
execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-framerate', String(FPS), '-i', path.join(frames, '%04d.jpg'), '-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=stereo',
  '-shortest', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-maxrate', '12M', '-bufsize', '24M', '-preset', 'slow', '-c:a', 'aac', '-movflags', '+faststart', mp4]);
fs.rmSync(TMP, { recursive: true, force: true });
console.log('->', mp4, `${TOTAL.toFixed(1)} s`);
