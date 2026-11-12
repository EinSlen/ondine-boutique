// Loop-style accessory packshots (light grey background, no text, real camera cutout on the tripod), then swaps the product images.
// node accessoires-v2.mjs images | media
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ICI = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(ICI, 'acc');
const cmd = process.argv[2];
const BG = '#EDECE8';
const cam = `data:image/png;base64,${fs.readFileSync(path.join(ICI, 'decoupes', 'item00.png')).toString('base64')}`;

const sd = `
<svg viewBox="0 0 600 600" width="640" height="640" style="filter:drop-shadow(0 30px 40px rgba(0,0,0,.22))">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#23262d"/><stop offset="1" stop-color="#0b0d11"/></linearGradient></defs>
  <path d="M170 90 h220 l40 40 v130 l-20 20 v230 a20 20 0 0 1 -20 20 h-220 a20 20 0 0 1 -20 -20 v-400 a20 20 0 0 1 20 -20z" fill="url(#g)"/>
  <rect x="190" y="100" width="22" height="70" rx="4" fill="#cfa548"/><rect x="228" y="100" width="22" height="70" rx="4" fill="#cfa548"/>
  <rect x="266" y="100" width="22" height="70" rx="4" fill="#cfa548"/><rect x="304" y="100" width="22" height="70" rx="4" fill="#cfa548"/>
  <rect x="342" y="100" width="22" height="70" rx="4" fill="#cfa548"/>
  <text x="290" y="335" fill="#fff" font-family="Inter,Segoe UI" font-weight="800" font-size="96" text-anchor="middle" letter-spacing="-3">64<tspan font-size="54">GB</tspan></text>
  <text x="290" y="395" fill="#c9ccd2" font-family="Inter,Segoe UI" font-weight="600" font-size="32" text-anchor="middle">microSD XC</text>
  <text x="290" y="448" fill="#8b919c" font-family="Inter,Segoe UI" font-weight="600" font-size="28" text-anchor="middle">U3 · V30 · 4K</text>
</svg>`;

const perche = `
<div style="position:relative;width:700px;height:1000px">
  <svg viewBox="0 0 700 1000" width="700" height="1000" style="position:absolute;inset:0;filter:drop-shadow(0 26px 30px rgba(0,0,0,.2))">
    <defs>
      <linearGradient id="t" x1="0" x2="1"><stop offset="0" stop-color="#1c1f25"/><stop offset=".45" stop-color="#4a505b"/><stop offset="1" stop-color="#15171c"/></linearGradient>
      <linearGradient id="h" x1="0" x2="1"><stop offset="0" stop-color="#0d0f12"/><stop offset=".5" stop-color="#2b2f36"/><stop offset="1" stop-color="#0d0f12"/></linearGradient>
    </defs>
    <rect x="336" y="300" width="28" height="200" rx="12" fill="url(#t)"/>
    <rect x="331" y="490" width="38" height="16" rx="6" fill="#0d0f12"/>
    <rect x="330" y="500" width="40" height="150" rx="14" fill="url(#t)"/>
    <rect x="322" y="640" width="56" height="190" rx="24" fill="url(#h)"/>
    <g stroke="#14161a" stroke-width="20" stroke-linecap="round"><path d="M350 820 L215 960"/><path d="M350 820 L485 960"/><path d="M350 820 L350 975"/></g>
    <rect x="334" y="268" width="32" height="40" rx="8" fill="#0d0f12"/>
  </svg>
  <img src="${cam}" style="position:absolute;left:50%;top:-10px;height:300px;transform:translateX(-50%);filter:drop-shadow(0 18px 18px rgba(0,0,0,.25))">
</div>`;

const page = (inner) => `<!doctype html><html><head><meta charset="utf-8"><style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@600;800&display=swap');
body{margin:0;width:1200px;height:1200px;background:${BG};display:flex;align-items:center;justify-content:center}
</style></head><body>${inner}</body></html>`;

if (cmd === 'images') {
  const require = createRequire('C:/Users/Valentin/node_modules/');
  const puppeteer = require('puppeteer-core');
  const nav = await puppeteer.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true });
  const p = await nav.newPage();
  await p.setViewport({ width: 1200, height: 1200 });
  for (const [nom, html] of [['sd64-v2.jpg', page(sd)], ['perche-v2.jpg', page(perche)]]) {
    await p.setContent(html, { waitUntil: 'load', timeout: 60000 }).catch(() => {}); await p.evaluate(() => document.fonts.ready); await new Promise((r) => setTimeout(r, 800));
    await p.screenshot({ path: path.join(OUT, nom), type: 'jpeg', quality: 90 });
    console.log(nom);
  }
  await nav.close();
}

if (cmd === 'media') {
  const { gql, rest } = await import('./shop.mjs');
  const THEME = 190830182728;
  for (const [handle, img, alt] of [['carte-microsd-64-go', 'sd64-v2.jpg', 'Carte microSD 64 Go U3 V30'], ['perche-trepied-3-en-1', 'perche-v2.jpg', 'Perche-trépied 3 en 1 avec la KapsulCam']]) {
    const a = await rest('PUT', `themes/${THEME}/assets.json`, { asset: { key: `assets/kc-${img}`, attachment: fs.readFileSync(path.join(OUT, img)).toString('base64') } });
    const p = (await gql(`query($h: String!) { productByHandle(handle: $h) { id media(first: 10) { nodes { id } } } }`, { h: handle })).productByHandle;
    const c = await gql(`mutation($id: ID!, $m: [CreateMediaInput!]!) { productCreateMedia(productId: $id, media: $m) { media { id } mediaUserErrors { message } } }`, { id: p.id, m: [{ originalSource: a.asset.public_url, alt, mediaContentType: 'IMAGE' }] });
    const old = p.media.nodes.map((x) => x.id);
    if (old.length) await gql(`mutation($id: ID!, $ids: [ID!]!) { productDeleteMedia(productId: $id, mediaIds: $ids) { deletedMediaIds mediaUserErrors { message } } }`, { id: p.id, ids: old });
    console.log(handle, JSON.stringify(c.productCreateMedia.mediaUserErrors), 'anciennes images retirées :', old.length);
  }
}
