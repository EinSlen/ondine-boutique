// One product image per offer (camera alone, Pack Complet with card + tripod, Duo) in the carousel v3 style,
// plus the small offer thumbnails of the buy box. The tripod is cut out of the supplier's real photo.
// node offres-visuels.mjs   -> decoupes/trepied.png, carrousel3/10-*.jpg, buybox/kc-offre-*.png
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire('C:/Users/Valentin/node_modules/');
const puppeteer = require('puppeteer-core');
const ICI = path.dirname(fileURLToPath(import.meta.url));
const u = (p) => 'file:///' + path.join(ICI, p).replace(/\\/g, '/');
const BG = '#EDECE8';
const NOIR = u('decoupes/item00.png');
const BLANC = u('decoupes/item00-blanc.png');

const nav = await puppeteer.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true, args: ['--allow-file-access-from-files'] });
const page = await nav.newPage();

// Tripod cut-out: left tripod of the supplier photo, below its camera, dark pixels and orange feet kept.
await page.goto(u('fournisseur/nora/perche-reel-1.jpg'));
const png = await page.evaluate(async () => {
  const img = document.querySelector('img');
  await img.decode();
  const [x0, y0, w, h] = [40, 196, 610, 1004];
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const g = c.getContext('2d');
  g.drawImage(img, x0, y0, w, h, 0, 0, w, h);
  const d = g.getImageData(0, 0, w, h);
  const p = d.data;
  const smooth = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  for (let i = 0; i < p.length; i += 4) {
    const [r, gr, b] = [p[i], p[i + 1], p[i + 2]];
    const l = 0.299 * r + 0.587 * gr + 0.114 * b;
    const orange = r > 150 && r - b > 90 && r - gr > 45 ? 1 : 0;
    p[i + 3] = Math.round(255 * Math.max(orange, 1 - smooth(95, 150, l)));
  }
  g.putImageData(d, 0, 0);
  return c.toDataURL('image/png');
});
fs.writeFileSync(path.join(ICI, 'decoupes', 'trepied.png'), Buffer.from(png.split(',')[1], 'base64'));
const TRE = u('decoupes/trepied.png');

const css = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
*{margin:0;padding:0;box-sizing:border-box}
body{overflow:hidden;font-family:Inter,sans-serif;color:#111;background:${BG};position:relative}
.it{position:absolute;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;gap:16px}
.it img{object-fit:contain;filter:drop-shadow(0 22px 24px rgba(0,0,0,.2))}
.it span{font-size:26px;font-weight:500}
.sd{position:relative;width:var(--w);height:calc(var(--w)*1.36);background:linear-gradient(160deg,#2a2a2c,#121214);clip-path:polygon(0 0,78% 0,100% 12%,100% 100%,0 100%);border-radius:calc(var(--w)*.06);filter:drop-shadow(0 22px 24px rgba(0,0,0,.2));color:#fff;text-align:center}
.sd i{position:absolute;top:7%;width:9%;height:17%;background:#C9A24A;border-radius:2px}
.sd b{position:absolute;left:0;right:0;top:40%;font-size:calc(var(--w)*.3);font-weight:600;letter-spacing:-.02em}
.sd b small{font-size:.55em}
.sd em{position:absolute;left:0;right:0;top:66%;font-style:normal;font-size:calc(var(--w)*.1);color:#cfcfcf}
.sd u{position:absolute;left:0;right:0;top:79%;text-decoration:none;font-size:calc(var(--w)*.075);color:#8a8a8a}
`;
const sd = (w) => `<div class="sd" style="--w:${w}px">${[14, 30, 46, 62].map((x) => `<i style="left:${x}%"></i>`).join('')}<b>64<small>GB</small></b><em>microSD XC</em><u>U3 · V30 · 4K</u></div>`;
const extras = '<div style="position:absolute;left:0;right:0;bottom:64px;text-align:center;font-size:26px;color:#6b6b6b">+ caisson étanche, collier, clip, bracelet, support guidon, adaptateur</div>';
const title = (t) => `<div style="position:absolute;top:70px;left:0;right:0;text-align:center;font-size:46px;font-weight:500;letter-spacing:-1px">${t}</div>`;

const pack = (cam) => `${title('Pack Complet')}
  <div class="it" style="left:90px;bottom:150px;width:420px"><img src="${cam}" style="height:700px;transform:rotate(-6deg)"><span>Caméra 4K</span></div>
  <div class="it" style="left:520px;bottom:150px;width:220px">${sd(170)}<span>Carte 64 Go</span></div>
  <div class="it" style="left:740px;bottom:150px;width:400px"><img src="${TRE}" style="height:800px"><span>Perche-trépied</span></div>
  ${extras}`;
const duo = (cam) => `${title('Duo')}
  <div class="it" style="left:150px;bottom:150px;width:420px"><img src="${cam}" style="height:760px;transform:rotate(-7deg)"><span>Caméra 1</span></div>
  <div class="it" style="left:630px;bottom:150px;width:420px"><img src="${cam}" style="height:760px;transform:rotate(7deg)"><span>Caméra 2</span></div>
  <div style="position:absolute;left:0;right:0;bottom:64px;text-align:center;font-size:26px;color:#6b6b6b">Chaque caméra avec tous ses accessoires</div>`;
const thumb = (inner) => `<div style="position:absolute;inset:0;background:#fff">${inner}</div>`;

const out = [
  ['carrousel3/10-pack-noir.jpg', 1200, 1200, pack(NOIR)],
  ['carrousel3/11-pack-blanc.jpg', 1200, 1200, pack(BLANC)],
  ['carrousel3/12-duo-noir.jpg', 1200, 1200, duo(NOIR)],
  ['carrousel3/13-duo-blanc.jpg', 1200, 1200, duo(BLANC)],
  ['buybox/kc-offre-pack.png', 220, 220, thumb(`<img src="${NOIR}" style="position:absolute;left:14px;top:22px;height:176px;transform:rotate(-6deg)">
    <div style="position:absolute;left:96px;top:118px">${sd(44)}</div>
    <img src="${TRE}" style="position:absolute;right:2px;top:12px;height:196px">`)],
];
for (const [f, w, h, body] of out) {
  await page.setViewport({ width: w, height: h });
  fs.writeFileSync(path.join(ICI, '_offre.html'), `<!doctype html><html><head><meta charset="utf-8"><style>${css}body{width:${w}px;height:${h}px}</style></head><body>${body}</body></html>`);
  await page.goto(u('_offre.html'), { waitUntil: 'networkidle0' });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: path.join(ICI, f), type: f.endsWith('.png') ? 'png' : 'jpeg', ...(f.endsWith('.png') ? {} : { quality: 90 }) });
  console.log(f);
}
fs.unlinkSync(path.join(ICI, '_offre.html'));
await nav.close();
