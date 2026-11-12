// 15 s vertical ad in the native style of the winning Meta/TikTok ads (one cut per second, big bold captions, keyword
// in yellow). Real footage only from the supplier's demo of this model (clip-on + its own POV), plus our product photos.
// node video-native.mjs [v1|v2]   -> pub/video/kapsulcam-native-9x16.mp4 (v1), kapsulcam-native-v2-9x16.mp4 (v2)
// v2 adds Mixkit action shots filmed from the outside (free license, see videos/mixkit/licences.json), never POV.
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const require = createRequire('C:/Users/Valentin/node_modules/');
const puppeteer = require('puppeteer-core');
const ICI = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(ICI, 'pub', 'video');
const VERSION = process.argv[2] || 'v1';
const TMP = path.join(OUT, `_native-${VERSION}`);
fs.rmSync(TMP, { recursive: true, force: true });
fs.mkdirSync(TMP, { recursive: true });
const u = (p) => 'file:///' + path.resolve(ICI, p).replace(/\\/g, '/');
const [W, H, FPS] = [1080, 1920, 30];
const SUPPLIER = 'videos/fournisseur.mp4';

// [start, end, kind, source, caption lines (the line starting with * is yellow)]
// clip source: a number = second in the supplier video, or { src, from, cx } for a stock clip (cx = horizontal crop centre).
const VERSIONS = {};
VERSIONS.v1 = [
  [0.0, 1.3, 'clip', 1.05, ["ELLE S'AIMANTE", '*SUR TON T-SHIRT']],
  [1.3, 2.5, 'clip', 4.0, ['UN APPUI', '*ELLE FILME']],
  [2.5, 3.8, 'clip', 21.0, ['TES MAINS', '*RESTENT LIBRES']],
  [3.8, 4.9, 'clip', 25.0, ['*EN 4K', '36 GRAMMES']],
  [4.9, 6.0, 'photo', 'decoupes/p-ski.jpg', ['*AU SKI']],
  [6.0, 7.1, 'photo', 'carrousel3/05-plongee.jpg', ["SOUS L'EAU", '*CAISSON 30 M INCLUS']],
  [7.1, 8.2, 'photo', 'decoupes/p-collier.jpg', ['*AU COU']],
  [8.2, 9.3, 'photo', 'decoupes/p-poignet.jpg', ['*AU POIGNET']],
  [9.3, 11.0, 'box', null, ['TOUT EST', '*INCLUS']],
  [11.0, 11.9, 'pack', null, ['POURQUOI PAYER', '*400 € ?']],
  [11.9, 12.8, 'pack', null, ['*89,90 €', 'TOUT COMPRIS']],
  [12.8, 15.0, 'end', null, []],
];
// v2: hook on an action shot, the real camera, then sports filmed from the outside (Mixkit free license), product, price.
VERSIONS.v2 = [
  [0.0, 1.1, 'clip', { src: 'videos/mixkit/1128.mp4', from: 3.6, cx: 0.6 }, ['TU VIS ÇA ?']],
  [1.1, 2.3, 'clip', 1.05, ['*FILME-LE.', '36 GRAMMES']],
  [2.3, 3.3, 'clip', 4.0, ['UN APPUI', '*ELLE FILME']],
  [3.3, 4.3, 'clip', 21.0, ['*MAINS LIBRES']],
  [4.3, 5.3, 'clip', { src: 'videos/mixkit/1127.mp4', from: 10, cx: 0.62 }, ['*SURF']],
  [5.3, 6.3, 'clip', { src: 'videos/mixkit/1582.mp4', from: 4, cx: 0.5 }, ['*À LA MER', 'CAISSON 30 M INCLUS']],
  [6.3, 7.2, 'clip', { src: 'videos/mixkit/3347.mp4', from: 2, cx: 0.3 }, ['*SKI']],
  [7.2, 8.1, 'clip', { src: 'videos/mixkit/39930.mp4', from: 3, cx: 0.5 }, ['*MOTO']],
  [8.1, 9.1, 'clip', { src: 'videos/mixkit/44322.mp4', from: 2, cx: 0.28 }, ['*VTT']],
  [9.1, 10.0, 'photo', 'decoupes/p-ski.jpg', ['*SUR TON CASQUE']],
  [10.0, 11.4, 'box', null, ['TOUT EST', '*INCLUS']],
  [11.4, 12.3, 'pack', null, ['POURQUOI PAYER', '*400 € ?']],
  [12.3, 13.2, 'pack', null, ['*89,90 €', 'TOUT COMPRIS']],
  [13.2, 15.5, 'end', null, []],
];
// v3: like the winning ads, opens on the supplier's vlog of this camera model (Alibaba listing 1601420267879, same
// supplier ksldz): camera on a t-shirt, then its own POV. The shop watermark and English captions are blurred out
// (delogo, authorised by Valentin on 16/10) and covered by ours. Letterboxed POV shots sit over a blurred copy of themselves.
const VLOG = 'videos/fournisseur-vlog.mp4';
const WM = 'delogo=x=20:y=615:w=680:h=60';
const full = (from, extra = '') => ({ src: VLOG, from, vf: `${WM}${extra},scale=${W}:${H}:flags=lanczos,unsharp=5:5:0.4` });
const band = (from) => ({ src: VLOG, from, vf: `crop=720:406:0:437,delogo=x=20:y=165:w=680:h=75,split[a][b];[a]scale=-2:${H},crop=${W}:${H},boxblur=40:2,eq=brightness=-0.15[bg];[b]scale=-2:800:flags=lanczos,crop=${W}:800,unsharp=5:5:0.5[fg];[bg][fg]overlay=0:${(H - 800) / 2}` });
VERSIONS.v3 = [
  [0.0, 1.2, 'clip', full(0.8, ',delogo=x=140:y=760:w=460:h=165'), ['POV :', '*JE FILME MA JOURNÉE'], 0.585],
  [1.2, 2.4, 'clip', band(3.3), ['*MAINS LIBRES', 'ELLE FILME TOUT'], 0.45],
  [2.4, 3.4, 'clip', full(8.6), ['*36 GRAMMES'], 0.47],
  [3.4, 4.4, 'clip', band(12.0), ['POSE-LA,', '*ELLE TE FILME'], 0.45],
  [4.4, 5.4, 'clip', full(21.6), ['*AIMANTÉE', 'ELLE TIENT PARTOUT'], 0.47],
  [5.4, 6.3, 'clip', { src: 'videos/mixkit/1127.mp4', from: 10, cx: 0.62 }, ['*AU SURF']],
  [6.3, 7.2, 'clip', { src: 'videos/mixkit/1582.mp4', from: 4, cx: 0.5 }, ['*À LA MER', 'CAISSON 30 M INCLUS']],
  [7.2, 8.1, 'clip', { src: 'videos/mixkit/3347.mp4', from: 2, cx: 0.3 }, ['*AU SKI']],
  [8.1, 9.0, 'clip', { src: 'videos/mixkit/39930.mp4', from: 3, cx: 0.5 }, ['*À MOTO']],
  [9.0, 9.9, 'clip', { src: 'videos/mixkit/44322.mp4', from: 2, cx: 0.28 }, ['*À VÉLO']],
  [9.9, 11.1, 'box', null, ['TOUT EST', '*INCLUS']],
  [11.1, 11.9, 'pack', null, ['POURQUOI PAYER', '*400 € ?']],
  [11.9, 12.7, 'pack', null, ['*89,90 €', 'TOUT COMPRIS']],
  [12.7, 14.7, 'end', null, []],
];
// v4: the competitors' POV look (moto, car, dive, bike, ski) with Pexels clips (free commercial licence, filmed with
// other cameras), each tagged "Images d'illustration" (7th field), alternating with the real footage of our camera.
const PX = (id, from) => ({ src: `videos/pexels/${id}.mp4`, from, cx: 0.5 });
VERSIONS.v4 = [
  [0.0, 1.2, 'clip', PX(16512698, 2), ['POV :', '*TA SORTIE À MOTO'], 0.6, true],
  [1.2, 2.4, 'clip', full(0.8, ',delogo=x=140:y=760:w=460:h=165'), ['*36 GRAMMES', 'AIMANTÉE SUR TOI'], 0.585],
  [2.4, 3.4, 'clip', PX(36632263, 5), ['*EN VOITURE'], 0.6, true],
  [3.4, 4.4, 'clip', PX(39549756, 2), ["*SOUS L'EAU", 'CAISSON 30 M INCLUS'], 0.6, true],
  [4.4, 5.4, 'clip', PX(38180720, 8), ['*À VÉLO'], 0.6, true],
  [5.4, 6.4, 'clip', PX(36517633, 3), ['*AU SKI'], 0.6, true],
  [6.4, 7.6, 'clip', band(3.3), ['*MAINS LIBRES', 'UN APPUI, ELLE FILME'], 0.45],
  [7.6, 8.6, 'clip', full(8.6), ['POSE-LA', '*OÙ TU VEUX'], 0.47],
  [8.6, 9.6, 'clip', PX(35546988, 4), ['*À HAUTEUR', "D'YEUX"], 0.6, true],
  [9.6, 10.8, 'box', null, ['TOUT EST', '*INCLUS']],
  [10.8, 11.6, 'pack', null, ['POURQUOI PAYER', '*400 € ?']],
  [11.6, 12.4, 'pack', null, ['*89,90 €', 'TOUT COMPRIS']],
  [12.4, 14.4, 'end', null, []],
];
const SHOTS = VERSIONS[VERSION];

// Supplier clips: crop the vertical picture out of the 16:9 frame, upscale and sharpen. Stock clips: vertical crop.
for (const [i, [a, b, kind, from]] of SHOTS.entries()) {
  if (kind !== 'clip') continue;
  const dir = path.join(TMP, `clip${i}`);
  fs.mkdirSync(dir);
  const stock = typeof from === 'object';
  const vf = stock && from.vf ? `${from.vf},fps=${FPS}` : stock ? `crop=ih*9/16:ih:(iw-ih*9/16)*${from.cx ?? 0.5}:0,scale=${W}:${H}:flags=lanczos,fps=${FPS}` : `crop=404:718:438:1,scale=${W}:${H}:flags=lanczos,unsharp=5:5:0.7,fps=${FPS}`;
  execFileSync('ffmpeg', ['-loglevel', 'error', '-ss', String(stock ? from.from : from), '-t', String(b - a + 0.1), '-i', path.join(ICI, stock ? from.src : SUPPLIER),
    '-vf', vf, '-q:v', '2', path.join(dir, '%04d.jpg')]);
}

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@800;900&family=Inter:wght@500;600&display=swap');
*{margin:0;padding:0;box-sizing:border-box}
body{width:${W}px;height:${H}px;overflow:hidden;background:#000;position:relative;font-family:Montserrat,sans-serif}
#bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
#scene{position:absolute;inset:0;background:#EDECE8;display:none}
#cap{position:absolute;left:60px;right:60px;top:${Math.round(H * 0.6)}px;text-align:center;font-weight:900;font-size:98px;line-height:1.06;color:#fff;
  text-transform:uppercase;letter-spacing:-1px;-webkit-text-stroke:14px #000;paint-order:stroke fill;text-shadow:0 8px 24px rgba(0,0,0,.45)}
#cap .y{color:#FFD23F}
.cam{position:absolute;filter:drop-shadow(0 30px 40px rgba(0,0,0,.25))}
.acc{position:absolute;object-fit:contain;filter:drop-shadow(0 18px 18px rgba(0,0,0,.18))}
#end{position:absolute;left:0;right:0;text-align:center;font-family:Inter,sans-serif;color:#111}
</style></head><body>
<img id="bg">
<div id="scene">
  <img id="cam" class="cam" src="${u('decoupes/item00.png')}">
  ${[1, 2, 3, 4, 5, 6].map((i) => `<img id="a${i}" class="acc" src="${u(`decoupes/item0${i}.png`)}">`).join('')}
  <div id="end"></div>
</div>
<div id="cap"></div>
<div id="illus" style="position:absolute;left:44px;top:150px;font-family:Inter,sans-serif;font-size:30px;font-weight:600;color:rgba(255,255,255,.9);text-shadow:0 2px 6px rgba(0,0,0,.7);display:none">Images d'illustration</div>
<script>
const W=${W},H=${H};
const ease=(x)=>{x=Math.max(0,Math.min(1,x));return 1-Math.pow(1-x,3)};
const $=(id)=>document.getElementById(id);
window.setBg=async(src)=>{const im=$('bg');if(im.dataset.src===src)return;im.dataset.src=src;im.src=src;await im.decode();};
window.render=(kind,lines,local,dur,capY,illus)=>{
  $('illus').style.display=illus?'block':'none';
  const cap=$('cap');
  cap.style.top=(H*(capY||0.6))+'px';
  cap.innerHTML=lines.map(l=>l.startsWith('*')?'<span class="y">'+l.slice(1)+'</span>':l).join('<br>');
  const pop=0.82+0.18*ease(local/0.14);
  cap.style.transform='scale('+pop+')';
  cap.style.opacity=lines.length?1:0;
  const bg=$('bg'), sc=$('scene');
  sc.style.display=(kind==='box'||kind==='pack'||kind==='end')?'block':'none';
  bg.style.display=sc.style.display==='block'?'none':'block';
  if(kind==='clip')bg.style.transform='scale('+(1.07-0.07*ease(local/0.25))+')';
  if(kind==='photo')bg.style.transform='scale('+(1.04+0.08*local/dur)+')';
  for(let i=1;i<=6;i++)$('a'+i).style.display=kind==='box'?'block':'none';
  $('cam').style.display=(kind==='pack'||kind==='end')?'block':'none';
  $('end').style.display=kind==='end'?'block':'none';
  if(kind==='box'){
    for(let i=1;i<=6;i++){const k=i-1, cx=W*(0.2+0.3*(k%3)), cy=H*(0.2+0.2*Math.floor(k/3)), bw=W*0.25, bh=H*0.17, a=ease((local-k*0.07)/0.25);
      Object.assign($('a'+i).style,{left:(cx-bw/2)+'px',top:(cy-bh/2)+'px',width:bw+'px',height:bh+'px',opacity:a,transform:'translateY('+((1-a)*80)+'px) scale('+(0.7+0.3*a)+')'});}
  }
  const cam=$('cam');
  if(kind==='pack'){const h=H*0.42;Object.assign(cam.style,{height:h+'px',left:(W/2-h*0.217)+'px',top:(H*0.12)+'px',transform:'rotate(-6deg) scale('+(0.94+0.06*ease(local/0.3))+')'});}
  if(kind==='end'){const h=H*0.3, a=ease(local/0.35);
    Object.assign(cam.style,{height:h+'px',left:(W/2-h*0.217)+'px',top:(H*0.1)+'px',transform:'rotate(-6deg)'});
    const e=$('end');e.style.top=(H*0.45)+'px';e.style.opacity=a;e.style.transform='translateY('+((1-a)*40)+'px)';
    e.innerHTML='<img src="${u('buybox/kc-logo-dark.png')}" style="width:460px;display:block;margin:0 auto 50px">'
      +'<div style="font-size:150px;font-weight:600;letter-spacing:-5px;line-height:1">89,90 €</div>'
      +'<div style="font-size:44px;color:#555;margin:26px 0 56px">Livraison offerte<br>Satisfait ou remboursé 30 jours</div>'
      +'<span style="display:inline-block;background:#111;color:#fff;border-radius:999px;font-size:50px;font-weight:600;padding:30px 70px">kapsulcam.com</span>';}
};
</script></body></html>`;
fs.writeFileSync(path.join(TMP, 'page.html'), html);

const nav = await puppeteer.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true, args: ['--allow-file-access-from-files'] });
const p = await nav.newPage();
await p.setViewport({ width: W, height: H });
await p.goto(u(path.join(TMP, 'page.html')), { waitUntil: 'networkidle0', timeout: 60000 });
await p.evaluate(() => document.fonts.ready);
const frames = path.join(TMP, 'frames');
fs.mkdirSync(frames);
const total = SHOTS[SHOTS.length - 1][1];
for (let i = 0; i < Math.round(total * FPS); i++) {
  const t = i / FPS;
  const [i0, [a, b, kind, src, lines, capY, illus]] = [...SHOTS.entries()].find(([, s]) => t >= s[0] && t < s[1]);
  const local = t - a;
  if (kind === 'clip') {
    const n = Math.min(Math.floor(local * FPS) + 1, fs.readdirSync(path.join(TMP, `clip${i0}`)).length);
    await p.evaluate((s) => window.setBg(s), u(path.join(TMP, `clip${i0}`, `${String(n).padStart(4, '0')}.jpg`)));
  } else if (kind === 'photo') {
    await p.evaluate((s) => window.setBg(s), u(src));
  }
  await p.evaluate((k, l, x, d, c, il) => window.render(k, l, x, d, c, il), kind, lines, local, b - a, capY, !!illus);
  await p.screenshot({ path: path.join(frames, `${String(i).padStart(4, '0')}.jpg`), type: 'jpeg', quality: 90 });
}
await nav.close();
const mp4 = path.join(OUT, VERSION === 'v1' ? 'kapsulcam-native-9x16.mp4' : `kapsulcam-native-${VERSION}-9x16.mp4`);
execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-framerate', String(FPS), '-i', path.join(frames, '%04d.jpg'), '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-movflags', '+faststart', mp4]);
fs.rmSync(TMP, { recursive: true, force: true });
console.log('->', mp4);
