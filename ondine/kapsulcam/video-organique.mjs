// Organic TikTok / Reels POV montage (no price, no ad end card): hook, the camera popping over a POV shot, quick POV cuts
// moto / pool / slide / MTB / ski / underwater, a question for the comments and the brand line. Only Pexels clips (free
// commercial licence, videos/pexels/licences.json) and our product cut-out: no supplier vlog (blurred patches, footage
// already posted by other shops). The clips were filmed with other cameras, so each one carries "Images d'illustration"
// and no caption says they were filmed with KapsulCam. Silent on purpose: the sound is picked in the app (trending audio).
// node video-organique.mjs [a|b|c|all]   -> pub/video/organique/kapsulcam-pov-{a,b,c}-9x16.mp4
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const require = createRequire('C:/Users/Valentin/node_modules/');
const puppeteer = require('puppeteer-core');
const ICI = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(ICI, 'pub', 'video', 'organique');
const u = (p) => 'file:///' + path.resolve(ICI, p).replace(/\\/g, '/');
const [W, H, FPS] = [1080, 1920, 30];
const px = (id, from, sp = 1) => ({ src: `videos/pexels/${id}.mp4`, from, sp });

// [duration, clip, label for a/b, label for c]
const MONTAGE = [
  [1.0, px(10666934, 0.2), 'piscine', 'mardi : piscine'],
  [1.0, px(35448967, 6.6, 1.2), 'toboggan', 'mercredi : toboggan'],
  [1.0, px(38180342, 5.2, 1.3), 'vtt', 'jeudi : vtt'],
  [1.0, px(36517533, 8.4, 1.2), 'ski', 'vendredi : ski'],
  [1.0, px(38239059, 2.9), "sous l'eau", "samedi : sous l'eau"],
  [1.0, px(37667010, 2, 1.2), 'moto', 'dimanche : moto'],
];
const HOOKS = {
  a: { text: 'pov : tu filmes tout\nsans sortir ton téléphone', open: px(16512698, 2) },
  b: { text: "pov : t'as une caméra\nde 36 g aimantée sur toi", open: px(38180610, 0.5, 1.2) },
  c: { text: "ta semaine si t'avais\nune caméra pouce", open: px(16512698, 2), first: 'lundi : moto' },
};

const build = (v) => {
  const h = HOOKS[v];
  const shots = [{ d: 1.6, clip: h.open, hook: h.text, label: h.first }];
  shots.push({ d: 1.1, clip: px(36861733, 1), label: '36 grammes', prod: true });
  for (const [d, clip, l, lc] of MONTAGE) shots.push({ d, clip, label: v === 'c' ? lc : l });
  shots.push({ d: 1.4, clip: px(4851440, 5.6), label: 'tu la mets où toi ?' });
  shots.push({ d: 1.8, end: true });
  let t = 0;
  for (const s of shots) { s.a = t; t += s.d; s.b = t; }
  return shots;
};

const render = async (nav, v) => {
  const shots = build(v);
  const TMP = path.join(OUT, `_tmp-${v}`);
  fs.rmSync(TMP, { recursive: true, force: true });
  fs.mkdirSync(TMP, { recursive: true });
  for (const [i, s] of shots.entries()) {
    if (!s.clip) continue;
    const dir = path.join(TMP, `clip${i}`);
    fs.mkdirSync(dir);
    const vf = `setpts=PTS/${s.clip.sp},scale=${W}:${H}:force_original_aspect_ratio=increase:flags=lanczos,crop=${W}:${H},fps=${FPS}`;
    execFileSync('ffmpeg', ['-loglevel', 'error', '-ss', String(s.clip.from), '-t', String((s.d + 0.1) * s.clip.sp), '-i', path.join(ICI, s.clip.src), '-vf', vf, '-q:v', '2', path.join(dir, '%04d.jpg')]);
  }

  const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@700;800;900&family=Inter:wght@500;600&display=swap');
*{margin:0;padding:0;box-sizing:border-box}
body{width:${W}px;height:${H}px;overflow:hidden;background:#000;position:relative;font-family:Montserrat,sans-serif}
#bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
#flash{position:absolute;inset:0;background:#fff;opacity:0}
#hook{position:absolute;left:60px;right:60px;top:${Math.round(H * 0.3)}px;text-align:center;font-weight:800;font-size:70px;line-height:1.15;color:#fff;white-space:pre-line;
  -webkit-text-stroke:11px #000;paint-order:stroke fill;text-shadow:0 6px 18px rgba(0,0,0,.4)}
#label{position:absolute;left:70px;right:70px;top:${Math.round(H * 0.6)}px;text-align:center;font-weight:900;line-height:1.05;color:#fff;white-space:nowrap;
  letter-spacing:-1px;-webkit-text-stroke:13px #000;paint-order:stroke fill;text-shadow:0 8px 22px rgba(0,0,0,.4)}
#prod{position:absolute;height:${Math.round(H * 0.34)}px;left:50%;top:${Math.round(H * 0.17)}px;filter:drop-shadow(0 30px 40px rgba(0,0,0,.45))}
#illus{position:absolute;left:48px;top:250px;font-family:Inter,sans-serif;font-size:30px;font-weight:600;color:rgba(255,255,255,.9);text-shadow:0 2px 6px rgba(0,0,0,.7)}
#end{position:absolute;inset:0;background:#EDECE8;display:none;text-align:center;font-family:Inter,sans-serif;color:#111}
#end img.cam{position:absolute;height:${Math.round(H * 0.3)}px;left:50%;top:${Math.round(H * 0.17)}px;filter:drop-shadow(0 30px 40px rgba(0,0,0,.25))}
#end .txt{position:absolute;left:0;right:0;top:${Math.round(H * 0.53)}px}
</style></head><body>
<img id="bg"><div id="flash"></div><img id="prod" src="${u('decoupes/item00.png')}">
<div id="hook"></div><div id="label"></div><div id="illus">Images d'illustration</div>
<div id="end"><img class="cam" src="${u('decoupes/item00.png')}">
  <div class="txt"><div style="font-family:Montserrat;font-weight:900;font-size:110px;letter-spacing:-3px;line-height:1.05">vis.<br>elle filme.</div>
  <img src="${u('buybox/kc-logo-dark.png')}" style="width:380px;display:block;margin:70px auto 0"></div></div>
<script>
const ease=(x)=>{x=Math.max(0,Math.min(1,x));return 1-Math.pow(1-x,3)};
const back=(x)=>{x=Math.max(0,Math.min(1,x));const c=1.7;return 1+(c+1)*Math.pow(x-1,3)+c*Math.pow(x-1,2)};
const $=(id)=>document.getElementById(id);
window.setBg=async(src)=>{const im=$('bg');if(im.dataset.src===src)return;im.dataset.src=src;im.src=src;await im.decode();};
window.render=(s,local,first)=>{
  $('end').style.display=s.end?'block':'none';
  $('illus').style.display=s.end?'none':'block';
  $('bg').style.transform='scale('+(1.08-0.08*ease(local/0.3))+')';
  $('flash').style.opacity=first?0:Math.max(0,0.55-local*6);
  const pr=$('prod');
  pr.style.display=s.prod?'block':'none';
  if(s.prod)pr.style.transform='translateX(-50%) rotate(-8deg) scale('+(0.2+0.8*back(local/0.35))+')';
  const hk=$('hook');
  hk.textContent=s.hook||'';
  hk.style.opacity=s.hook?1:0;
  const lb=$('label');
  const lt=s.hook?(local>0.7?s.label||'':''):(s.label||'');
  lb.textContent=lt;
  lb.style.fontSize=(lt.length>14?78:lt.length>10?92:104)+'px';
  const k=s.hook?local-0.7:local;
  lb.style.transform='scale('+(0.8+0.2*ease(k/0.12))+')';
  lb.style.opacity=lt?1:0;
  if(s.end){const a=ease(local/0.35),c=document.querySelector('#end img.cam'),t=document.querySelector('#end .txt');
    c.style.transform='translateX(-50%) rotate(-6deg) scale('+(0.92+0.08*a)+')';t.style.opacity=a;t.style.transform='translateY('+((1-a)*40)+'px)';}
};
</script></body></html>`;
  fs.writeFileSync(path.join(TMP, 'page.html'), html);

  const p = await nav.newPage();
  await p.setViewport({ width: W, height: H });
  await p.goto(u(path.join(TMP, 'page.html')), { waitUntil: 'networkidle0', timeout: 60000 });
  await p.evaluate(() => document.fonts.ready);
  const frames = path.join(TMP, 'frames');
  fs.mkdirSync(frames);
  const total = shots[shots.length - 1].b;
  for (let i = 0; i < Math.round(total * FPS); i++) {
    const t = i / FPS;
    const i0 = shots.findIndex((s) => t >= s.a && t < s.b);
    const s = shots[i0];
    const local = t - s.a;
    if (s.clip) {
      const n = Math.min(Math.floor(local * FPS) + 1, fs.readdirSync(path.join(TMP, `clip${i0}`)).length);
      await p.evaluate((src) => window.setBg(src), u(path.join(TMP, `clip${i0}`, `${String(n).padStart(4, '0')}.jpg`)));
    }
    const view = { end: !!s.end, prod: !!s.prod, hook: s.hook || '', label: s.label || '' };
    await p.evaluate((x, l, f) => window.render(x, l, f), view, local, i0 === 0);
    await p.screenshot({ path: path.join(frames, `${String(i).padStart(4, '0')}.jpg`), type: 'jpeg', quality: 92 });
  }
  await p.close();
  const mp4 = path.join(OUT, `kapsulcam-pov-${v}-9x16.mp4`);
  execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-framerate', String(FPS), '-i', path.join(frames, '%04d.jpg'), '-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=stereo',
    '-shortest', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-c:a', 'aac', '-movflags', '+faststart', mp4]);
  fs.rmSync(TMP, { recursive: true, force: true });
  console.log('->', mp4, `${total.toFixed(1)} s`);
};

fs.mkdirSync(OUT, { recursive: true });
const arg = process.argv[2] || 'all';
const nav = await puppeteer.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true, args: ['--allow-file-access-from-files'] });
for (const v of arg === 'all' ? Object.keys(HOOKS) : [arg]) await render(nav, v);
await nav.close();
