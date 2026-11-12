// Renders accessory product images and buy-box thumbnails, then creates the accessory products.
// node accessoires.mjs images | produits
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ICI = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(ICI, 'acc');
fs.mkdirSync(OUT, { recursive: true });
const cmd = process.argv[2];

const sd = `
<svg viewBox="0 0 600 600" width="760" height="760">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1b1f27"/><stop offset="1" stop-color="#0b0d11"/></linearGradient></defs>
  <path d="M170 90 h220 l40 40 v130 l-20 20 v230 a20 20 0 0 1 -20 20 h-220 a20 20 0 0 1 -20 -20 v-400 a20 20 0 0 1 20 -20z" fill="url(#g)"/>
  <rect x="190" y="100" width="22" height="70" rx="4" fill="#d4a94a"/><rect x="228" y="100" width="22" height="70" rx="4" fill="#d4a94a"/>
  <rect x="266" y="100" width="22" height="70" rx="4" fill="#d4a94a"/><rect x="304" y="100" width="22" height="70" rx="4" fill="#d4a94a"/>
  <rect x="342" y="100" width="22" height="70" rx="4" fill="#d4a94a"/>
  <text x="290" y="330" fill="#fff" font-family="Inter,Segoe UI" font-weight="900" font-size="92" text-anchor="middle">64<tspan font-size="56">GB</tspan></text>
  <text x="290" y="390" fill="#1463FF" font-family="Inter,Segoe UI" font-weight="800" font-size="34" text-anchor="middle">microSD XC</text>
  <text x="290" y="450" fill="#9aa3b2" font-family="Inter,Segoe UI" font-weight="700" font-size="30" text-anchor="middle">U3 · V30 · 4K</text>
</svg>`;

const perche = `
<svg viewBox="0 0 600 600" width="760" height="760" fill="none" stroke="#0E1116" stroke-linecap="round" stroke-linejoin="round">
  <rect x="270" y="60" width="60" height="90" rx="28" fill="#1b1f27" stroke="none"/>
  <circle cx="300" cy="88" r="16" fill="#3b4a6b" stroke="none"/>
  <rect x="286" y="150" width="28" height="30" rx="6" fill="#0E1116" stroke="none"/>
  <rect x="290" y="180" width="20" height="230" rx="10" fill="#2a2f39" stroke="none"/>
  <rect x="284" y="300" width="32" height="120" rx="12" fill="#0E1116" stroke="none"/>
  <path d="M300 420 L200 540" stroke-width="18"/><path d="M300 420 L400 540" stroke-width="18"/><path d="M300 420 L300 550" stroke-width="18"/>
</svg>`;

const page = (inner, titre, sous) => `<!doctype html><html><head><meta charset="utf-8"><style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@600;800;900&display=swap');
body{margin:0;width:1200px;height:1200px;background:#fff;font-family:Inter,sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#0E1116}
.logo{position:absolute;top:44px;left:56px;font-weight:900;font-size:34px;letter-spacing:-1px}.logo b{color:#1463FF}
h1{font-size:54px;margin:10px 0 0;letter-spacing:-1.5px}p{font-size:28px;margin:10px 0 0;opacity:.7}
</style></head><body><div class="logo">Kapsul<b>Cam</b></div>${inner}<h1>${titre}</h1><p>${sous}</p></body></html>`;

if (cmd === 'images') {
  const require = createRequire('C:/Users/Valentin/node_modules/');
  const puppeteer = require('puppeteer-core');
  const nav = await puppeteer.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true });
  const p = await nav.newPage();
  await p.setViewport({ width: 1200, height: 1200 });
  for (const [nom, html] of [
    ['sd64.jpg', page(sd, 'Carte microSD 64 Go', 'U3 · V30, idéale pour la vidéo 4K')],
    ['perche.jpg', page(perche, 'Perche-trépied 3 en 1', 'Perche, trépied et poignée, fixation universelle')],
  ]) {
    await p.setContent(html, { waitUntil: 'load', timeout: 60000 }).catch(() => {}); await p.evaluate(() => document.fonts.ready); await new Promise((r) => setTimeout(r, 800));
    await p.screenshot({ path: path.join(OUT, nom), type: 'jpeg', quality: 90 });
    console.log(nom);
  }
  await nav.close();
}

if (cmd === 'produits') {
  const { gql, rest } = await import('./shop.mjs');
  const THEME = 190830182728;
  const produits = [
    { handle: 'carte-microsd-64-go', title: 'Carte microSD 64 Go', prix: '19.90', sku: 'KC-SD64', img: 'sd64.jpg',
      html: '<p>Carte microSD XC 64 Go, classe U3 / V30, adaptée à l\'enregistrement 4K de la KapsulCam. Environ 2 heures de vidéo 4K.</p>' },
    { handle: 'perche-trepied-3-en-1', title: 'Perche-trépied 3 en 1', prix: '24.90', sku: 'KC-PERCHE', img: 'perche.jpg',
      html: '<p>Perche télescopique qui se déplie en trépied et sert de poignée. Fixation universelle compatible avec la KapsulCam et les supports d\'action cam.</p>' },
  ];
  const pubs = (await gql(`{ publications(first: 20) { nodes { id name } } }`)).publications.nodes.filter((x) => /Online Store|Shop/.test(x.name));
  for (const pr of produits) {
    const a = await rest('PUT', `themes/${THEME}/assets.json`, { asset: { key: `assets/kc-${pr.img}`, attachment: fs.readFileSync(path.join(OUT, pr.img)).toString('base64') } });
    const ex = (await gql(`query($h: String!) { productByHandle(handle: $h) { id } }`, { h: pr.handle })).productByHandle;
    const r = await gql(`mutation($input: ProductSetInput!) { productSet(synchronous: true, input: $input) { product { id handle } userErrors { message } } }`, { input: {
      ...(ex ? { id: ex.id } : {}), handle: pr.handle, title: pr.title, descriptionHtml: pr.html, vendor: 'KapsulCam', productType: 'Accessoire', status: 'ACTIVE',
      productOptions: [{ name: 'Title', values: [{ name: 'Default Title' }] }],
      files: ex ? undefined : [{ originalSource: a.asset.public_url, alt: pr.title, contentType: 'IMAGE' }],
      variants: [{ optionValues: [{ optionName: 'Title', name: 'Default Title' }], price: pr.prix, sku: pr.sku, inventoryPolicy: 'CONTINUE',
        inventoryItem: { tracked: false, requiresShipping: true, measurement: { weight: { value: 0.1, unit: 'KILOGRAMS' } } } }],
    } });
    const id = r.productSet.product.id;
    await gql(`mutation($id: ID!, $input: [PublicationInput!]!) { publishablePublish(id: $id, input: $input) { userErrors { message } } }`, { id, input: pubs.map((x) => ({ publicationId: x.id })) });
    console.log(pr.handle, JSON.stringify(r.productSet.userErrors));
  }
}
