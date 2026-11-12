// Google Ads image assets in the site's Loop style (light grey, clean packshots, editorial splits), no overlaid text
// (Google image policy). Sizes: landscape 1200x628, square 1200x1200, portrait 960x1200, logos 1200x1200 and 1200x300.
// node pub-visuels.mjs  -> pub/google/*.jpg|png + pub/google/planche.png
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire('C:/Users/Valentin/node_modules/');
const puppeteer = require('puppeteer-core');
const ICI = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(ICI, 'pub', 'google');
fs.mkdirSync(OUT, { recursive: true });
const u = (p) => 'file:///' + path.join(ICI, p).replace(/\\/g, '/');
const BG = '#EDECE8';
const NOIR = u('decoupes/item00.png');
const BLANC = u('decoupes/item00-blanc.png');
const S = { ski: u('decoupes/p-ski.jpg'), collier: u('decoupes/p-collier.jpg'), sac: u('decoupes/p-sac.jpg'), poignet: u('decoupes/p-poignet.jpg'), plongee: u('carrousel3/05-plongee.jpg'), perche: u('fournisseur/nora/perche-reel-1.jpg') };

const css = `*{margin:0;padding:0;box-sizing:border-box}body{background:${BG};position:relative;overflow:hidden}
.shadow{position:absolute;left:50%;transform:translateX(-50%);background:radial-gradient(closest-side,rgba(0,0,0,.26),rgba(0,0,0,0));filter:blur(6px)}
.cam{position:absolute;filter:drop-shadow(0 26px 34px rgba(0,0,0,.22))}
.ph{position:absolute;object-fit:cover}`;
// Centered packshot of one or two cameras.
const packshot = (w, h, imgs) => {
  const ch = Math.round(h * 0.74);
  const cw = Math.round(ch * 622 / 1433);
  const gap = Math.round(cw * 0.45);
  const total = imgs.length * cw + (imgs.length - 1) * gap;
  const x0 = (w - total) / 2;
  return imgs.map((src, i) => `<div class="shadow" style="left:${x0 + i * (cw + gap) + cw / 2}px;top:${h * 0.86}px;width:${cw * 1.1}px;height:${h * 0.05}px"></div>
    <img class="cam" src="${src}" style="left:${x0 + i * (cw + gap)}px;top:${h * 0.1}px;height:${ch}px;transform:rotate(${imgs.length > 1 ? (i ? 6 : -6) : -5}deg)">`).join('');
};
// Editorial split: packshot panel + lifestyle photo panel, rounded inner card like the site.
const split = (w, h, photo, pos = '50% 50%', photoLeft = false) => {
  const pw = Math.round(w * 0.5);
  const r = Math.round(h * 0.05);
  const ph = `<img class="ph" src="${photo}" style="${photoLeft ? 'left' : 'right'}:${r}px;top:${r}px;width:${pw - r}px;height:${h - 2 * r}px;border-radius:${r}px;object-position:${pos}">`;
  const ch = Math.round(h * 0.72);
  const cx = photoLeft ? pw + (w - pw - ch * 622 / 1433) / 2 : (pw - ch * 622 / 1433) / 2;
  return `${ph}<div class="shadow" style="left:${cx + ch * 0.22}px;top:${h * 0.85}px;width:${ch * 0.5}px;height:${h * 0.05}px"></div><img class="cam" src="${NOIR}" style="left:${cx}px;top:${h * 0.12}px;height:${ch}px;transform:rotate(-6deg)">`;
};
const full = (photo, pos = '50% 50%') => `<img class="ph" src="${photo}" style="inset:0;width:100%;height:100%;object-position:${pos}">`;
const logo = (w, h, big) => `<div style="position:absolute;inset:0;background:#fff;display:flex;align-items:center;justify-content:center"><img src="${u('buybox/kc-logo-dark.png')}" style="width:${big}px"></div>`;

const assets = [
  ['paysage-1-duo.jpg', 1200, 628, packshot(1200, 628, [NOIR, BLANC])],
  ['paysage-2-ski.jpg', 1200, 628, split(1200, 628, S.ski, '50% 30%')],
  ['paysage-3-plongee.jpg', 1200, 628, split(1200, 628, S.plongee, '50% 35%', true)],
  ['paysage-4-collier.jpg', 1200, 628, split(1200, 628, S.collier, '50% 40%')],
  ['paysage-5-perche.jpg', 1200, 628, split(1200, 628, S.perche, '50% 50%', true)],
  ['carre-1-noir.jpg', 1200, 1200, packshot(1200, 1200, [NOIR])],
  ['carre-2-duo.jpg', 1200, 1200, packshot(1200, 1200, [NOIR, BLANC])],
  ['carre-3-ski.jpg', 1200, 1200, full(S.ski)],
  ['carre-4-plongee.jpg', 1200, 1200, full(S.plongee)],
  ['carre-5-collier.jpg', 1200, 1200, full(S.collier)],
  ['carre-6-poignet.jpg', 1200, 1200, full(S.poignet)],
  ['portrait-1-noir.jpg', 960, 1200, packshot(960, 1200, [NOIR])],
  ['portrait-2-ski.jpg', 960, 1200, full(S.ski, '55% 50%')],
  ['portrait-3-collier.jpg', 960, 1200, full(S.collier, '50% 50%')],
  ['logo-carre.png', 1200, 1200, logo(1200, 1200, 820)],
  ['logo-paysage.png', 1200, 300, logo(1200, 300, 760)],
];

const nav = await puppeteer.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true, args: ['--allow-file-access-from-files'] });
const p = await nav.newPage();
for (const [nom, w, h, body] of assets) {
  await p.setViewport({ width: w, height: h });
  const f = path.join(OUT, '_tmp.html');
  fs.writeFileSync(f, `<!doctype html><html><head><meta charset="utf-8"><style>${css}body{width:${w}px;height:${h}px}</style></head><body>${body}</body></html>`);
  await p.goto('file:///' + f.replace(/\\/g, '/'), { waitUntil: 'load' });
  await new Promise((r) => setTimeout(r, 500));
  await p.screenshot({ path: path.join(OUT, nom), type: nom.endsWith('.png') ? 'png' : 'jpeg', ...(nom.endsWith('.png') ? {} : { quality: 92 }) });
  console.log(nom);
}
fs.unlinkSync(path.join(OUT, '_tmp.html'));
await nav.close();
