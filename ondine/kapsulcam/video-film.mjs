// Organic films for TikTok / Reels (~30-45 s), one activity each, in the style of the selfie / POV videos that work
// organically (e.g. @sweetnbiker): one person filming their own outing, long takes, a short hook at the top, closing on
// "tu vis. elle filme." and the logo. Not ads: no price, no question. Pexels clips only (videos/pexels/licences.json),
// filmed with other cameras, so a discreet "Images d'illustration" stays on screen and no caption says they were filmed
// with KapsulCam. Silent on purpose: the music is picked in the app.
// node video-film.mjs <name|all>   -> pub/video/organique/kapsulcam-film-<name>-9x16.mp4
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
const TAIL = 0.3;

// shots: [duration, Pexels id, start s, speed, transition in ('cut' | 'whip'), caption over this shot (optional)];
// the first shot carries the hook, the last one the end line (endText, default "tu vis. elle filme.").
// hookTop / endTop: where the texts sit (over sky or water, never over the face).
const FILMS = {
  // Same snowboarder filming himself (35133452 POV of his board, 35133453, 35133459).
  snow: {
    hook: "Pov : t'es le pote qui filme\ntoute la journée",
    shots: [
      [5.0, 35133459, 0.0, 1, 'cut'],
      [3.5, 35133459, 6.0, 1, 'cut'],
      [3.0, 35133453, 12.0, 1.2, 'whip'],
      [2.4, 35133452, 0.2, 1, 'cut'],
      [3.5, 35133453, 24.0, 1.2, 'cut'],
      [3.5, 35133459, 16.0, 1, 'cut'],
      [3.0, 35133459, 27.0, 1.2, 'whip'],
      [3.5, 35133453, 32.0, 1.3, 'cut'],
      [3.5, 35133459, 44.0, 1, 'cut'],
      [3.5, 35133459, 54.0, 1.2, 'whip'],
      [3.0, 35133459, 62.0, 1, 'cut'],
      [4.2, 35133459, 70.8, 1, 'cut'],
    ],
  },
  // One crew on the same day (Pexels author Alex Vescovi): the bear-costume selfies, friends in costumes, chairlift,
  // snow sprays, ending on the snowboarder waving under the sky. Hook low: the bear's head fills the top of the frame.
  ours: {
    hook: "Pov : t'as perdu un pari\ncontre tes potes",
    hookTop: 1180,
    endTop: 210,
    shots: [
      [4.0, 29154459, 0.0, 1, 'cut'],
      [3.5, 29543013, 2.0, 1, 'cut'],
      [3.0, 29154459, 4.0, 1, 'whip'],
      [4.5, 29157295, 3.5, 1, 'cut'],
      [3.5, 29437122, 0.2, 1, 'cut'],
      [3.5, 29592530, 5.5, 1, 'whip'],
      [2.4, 29170745, 0.0, 1, 'cut'],
      [3.0, 29157295, 9.0, 1, 'cut'],
      [3.0, 29049283, 0.2, 1, 'whip'],
      [3.9, 29592530, 11.2, 1, 'cut'],
    ],
  },
  // One take of two friends on a scooter (38216374): their selfie, the ride alongside, the foggy mountain road, back to them.
  moto: {
    hook: "Pov : on avait dit\n« on rentre avant la pluie »",
    endTop: 200,
    shots: [
      [4.8, 38216374, 0.0, 1, 'cut'],
      [3.5, 38216374, 5.0, 1, 'cut'],
      [3.5, 38216374, 8.5, 1, 'cut'],
      [3.0, 38216374, 12.0, 1, 'cut'],
      [4.0, 38216374, 14.5, 1.2, 'cut'],
      [4.0, 38216374, 20.0, 1.2, 'whip'],
      [4.0, 38216374, 26.0, 1.2, 'cut'],
      [3.5, 38216374, 32.0, 1.2, 'cut'],
      [3.8, 38216374, 0.6, 1, 'whip'],
    ],
  },
  // Same mountain bike (number 7 on the fork) from the fog to the rocky trails, ending on an open road under a blue sky.
  vtt: {
    hook: "Pov : t'as dit\n« juste une petite sortie »",
    shots: [
      [4.5, 38180610, 0.0, 1, 'cut'],
      [3.5, 38180610, 12.0, 1.2, 'cut'],
      [3.0, 38180588, 4.0, 1.3, 'whip'],
      [3.5, 38180517, 0.5, 1.3, 'cut'],
      [3.0, 38180517, 12.0, 1.3, 'cut'],
      [3.5, 38180609, 6.0, 1.2, 'whip'],
      [3.0, 38180588, 18.0, 1.3, 'cut'],
      [3.5, 38180591, 2.0, 1.2, 'cut'],
      [3.0, 38180609, 20.0, 1.3, 'whip'],
      [3.0, 38180610, 22.0, 1.2, 'cut'],
      [4.2, 38181106, 22.0, 1, 'cut'],
    ],
  },
  // One snorkeler (yellow mask, red vest) filming himself, between POV shots of the same reef (author juansegmentado),
  // ending on his head out of the water under the sky. Hook low: his face fills the top of the underwater selfie.
  mer: {
    hook: "Pov : t'as enfin posé\ntes congés",
    hookTop: 1250,
    endTop: 150,
    shots: [
      [4.5, 40291061, 3.2, 1, 'cut'],
      [3.5, 40291081, 0.5, 1, 'cut'],
      [3.5, 40291089, 0.0, 1, 'cut'],
      [3.0, 40291092, 13.0, 1, 'whip'],
      [3.5, 40291072, 14.0, 1, 'cut'],
      [3.0, 40291089, 11.0, 1, 'whip'],
      [3.5, 40291096, 8.0, 1, 'cut'],
      [3.0, 40291075, 18.0, 1, 'cut'],
      [3.0, 40291092, 0.0, 1, 'whip'],
      [3.5, 40291061, 0.9, 0.75, 'cut'],
    ],
  },
  // A day at the pool seen from your side: your legs in the water, walking in, the slide, a friend underwater, a dive,
  // ending on the pool revealed under the palms.
  piscine: {
    hook: 'Pov : 35 °C et une piscine\nrien que pour toi',
    endTop: 230,
    shots: [
      [4.5, 10666934, 0.0, 1, 'cut'],
      [3.5, 4851440, 0.0, 1, 'cut'],
      [3.5, 35448967, 5.8, 1, 'whip'],
      [3.5, 35181089, 2.0, 1, 'cut'],
      [3.5, 38239059, 2.5, 1, 'cut'],
      [3.0, 8045186, 0.0, 1, 'whip'],
      [3.0, 10666934, 5.0, 1, 'cut'],
      [3.0, 38239059, 17.5, 1, 'cut'],
      [4.0, 4851440, 5.6, 1, 'cut'],
    ],
  },
  // One take of a drive seen from chest height, hands on the wheel (35595804), as with the magnetic necklace. Only what
  // the camera really does: it films your trip (90 min on battery). No GPS, plate reading, loop recording or "proof" claim.
  voiture: {
    hook: "Pov : quelqu'un te rentre dedans\net c'est sa parole contre la tienne",
    endText: 'tu roules.\nelle filme.',
    shots: [
      [5.0, 35595804, 0.0, 1, 'cut'],
      [4.0, 35595804, 5.5, 1, 'cut'],
      [4.0, 35595804, 10.0, 1, 'whip'],
      [4.5, 35595804, 14.5, 1, 'cut', "sauf que toi,\nt'as tout filmé"],
      [4.0, 35595804, 19.5, 1, 'cut'],
      [4.0, 35595804, 24.0, 1, 'whip'],
      [4.0, 35595804, 28.5, 1, 'cut'],
      [4.0, 35595804, 33.0, 1, 'cut'],
    ],
  },
};

const render = async (nav, name) => {
  const film = FILMS[name];
  const shots = film.shots.map(([d, id, from, sp, tr, cap], i) => ({ d, id, from, sp, tr, cap: i === 0 ? film.hook : cap || '' }));
  let t = 0;
  for (const s of shots) { s.a = t; t += s.d; s.b = t; }
  const total = t;
  const TMP = path.join(OUT, `_tmp-film-${name}`);
  fs.rmSync(TMP, { recursive: true, force: true });
  fs.mkdirSync(TMP, { recursive: true });
  const count = {};
  for (const [i, s] of shots.entries()) {
    const dir = path.join(TMP, `clip${i}`);
    fs.mkdirSync(dir);
    const vf = `setpts=PTS/${s.sp},scale=${W}:${H}:force_original_aspect_ratio=increase:flags=lanczos,crop=${W}:${H},eq=contrast=1.05:saturation=1.08,fps=${FPS}`;
    execFileSync('ffmpeg', ['-loglevel', 'error', '-ss', String(s.from), '-t', String((s.d + TAIL) * s.sp), '-i', path.join(ICI, `videos/pexels/${s.id}.mp4`), '-vf', vf, '-q:v', '2', path.join(dir, '%04d.jpg')]);
    count[i] = fs.readdirSync(dir).length;
  }

  const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@700;800;900&family=Inter:wght@500;600;700&display=swap');
*{margin:0;padding:0;box-sizing:border-box}
body{width:${W}px;height:${H}px;overflow:hidden;background:#000;position:relative;font-family:Montserrat,sans-serif}
.bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;will-change:transform,filter}
#vignette{position:absolute;inset:0;background:radial-gradient(ellipse at center,rgba(0,0,0,0) 60%,rgba(0,0,0,.3) 100%)}
#endShade{position:absolute;left:0;right:0;top:0;height:50%;background:linear-gradient(to bottom,rgba(0,0,0,.4),rgba(0,0,0,0));opacity:0}
#hook{position:absolute;left:60px;right:60px;top:${film.hookTop ?? 300}px;text-align:center;white-space:pre-line;font-family:Inter,sans-serif;font-weight:700;font-size:56px;line-height:1.2;color:#fff;
  -webkit-text-stroke:7px #000;paint-order:stroke fill;text-shadow:0 4px 14px rgba(0,0,0,.35)}
#end{position:absolute;left:0;right:0;top:${film.endTop ?? 290}px;text-align:center;color:#fff;opacity:0}
#end .l1{font-weight:900;font-size:118px;letter-spacing:-3px;line-height:1.02;text-shadow:0 8px 30px rgba(0,0,0,.45)}
#end img{width:330px;display:block;margin:46px auto 0;filter:drop-shadow(0 4px 12px rgba(0,0,0,.4))}
#illus{position:absolute;left:44px;top:205px;font-family:Inter,sans-serif;font-size:24px;font-weight:600;color:rgba(255,255,255,.75);text-shadow:0 2px 6px rgba(0,0,0,.6)}
</style></head><body>
<img id="prev" class="bg"><img id="cur" class="bg">
<div id="vignette"></div><div id="endShade"></div>
<div id="hook"></div>
<div id="end"><div class="l1">${(film.endText || 'tu vis.\nelle filme.').replace(/\n/g, '<br>')}</div><img src="${u('buybox/kc-logo-light.png')}"></div>
<div id="illus">Images d'illustration</div>
<script>
const W=${W};
const ease=(x)=>{x=Math.max(0,Math.min(1,x));return 1-Math.pow(1-x,3)};
const $=(id)=>document.getElementById(id);
const load=async(id,src)=>{const im=$(id);if(!src){im.style.display='none';return;}im.style.display='block';if(im.dataset.src!==src){im.dataset.src=src;im.src=src;await im.decode();}};
window.frame=async(f)=>{
  await load('cur',f.cur);await load('prev',f.prev);
  const cur=$('cur'),prev=$('prev');
  cur.style.filter='none';prev.style.filter='none';cur.style.transform='none';
  if(f.prev){const p=ease(f.local/0.25),b=26*Math.sin(Math.PI*p);
    prev.style.transform='translateX('+(-p*W)+'px)';prev.style.filter='blur('+b+'px)';
    cur.style.transform='translateX('+((1-p)*W)+'px)';cur.style.filter='blur('+b+'px)';}
  const hk=$('hook');
  hk.textContent=f.cap;
  hk.style.opacity=f.cap?(f.local>f.d-0.3?Math.max(0,(f.d-f.local)/0.3):f.first?1:Math.min(1,f.local/0.2)):0;
  const ea=f.end?ease((f.local-0.6)/0.7):0;
  $('end').style.opacity=ea;$('endShade').style.opacity=ea;$('end').style.transform='translateY('+((1-ea)*30)+'px)';
};
</script></body></html>`;
  fs.writeFileSync(path.join(TMP, 'page.html'), html);

  const frameOf = (i, local) => {
    const n = Math.min(Math.floor(local * FPS) + 1, count[i]);
    return u(path.join(TMP, `clip${i}`, `${String(n).padStart(4, '0')}.jpg`));
  };
  const p = await nav.newPage();
  await p.setViewport({ width: W, height: H });
  await p.goto(u(path.join(TMP, 'page.html')), { waitUntil: 'networkidle0', timeout: 60000 });
  await p.evaluate(() => document.fonts.ready);
  const frames = path.join(TMP, 'frames');
  fs.mkdirSync(frames);
  for (let k = 0; k < Math.round(total * FPS); k++) {
    const tt = k / FPS;
    const i = shots.findIndex((s) => tt >= s.a && tt < s.b);
    const s = shots[i];
    const local = tt - s.a;
    const whip = s.tr === 'whip' && local < 0.25 && i > 0;
    const f = { local, d: s.d, cap: s.cap, first: i === 0, end: i === shots.length - 1, cur: frameOf(i, local), prev: whip ? frameOf(i - 1, shots[i - 1].d + local) : null };
    await p.evaluate((x) => window.frame(x), f);
    await p.screenshot({ path: path.join(frames, `${String(k).padStart(4, '0')}.jpg`), type: 'jpeg', quality: 93 });
  }
  await p.close();
  const mp4 = path.join(OUT, `kapsulcam-film-${name}-9x16.mp4`);
  execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-framerate', String(FPS), '-i', path.join(frames, '%04d.jpg'), '-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=stereo',
    '-shortest', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-maxrate', '10M', '-bufsize', '20M', '-preset', 'slow', '-c:a', 'aac', '-movflags', '+faststart', mp4]);
  fs.rmSync(TMP, { recursive: true, force: true });
  console.log('->', mp4, `${total.toFixed(1)} s`);
};

fs.mkdirSync(OUT, { recursive: true });
const arg = process.argv[2] || 'all';
const nav = await puppeteer.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true, args: ['--allow-file-access-from-files'] });
for (const name of arg === 'all' ? Object.keys(FILMS) : arg.split(',')) await render(nav, name);
await nav.close();
