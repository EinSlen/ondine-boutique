// Competitor shops selling the same kind of thumb / POV camera: product page screenshots (desktop + mobile, top of page)
// and prices from their public Shopify /products.json. Output: pub/concurrents/index.html.
// node concurrents.mjs
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire('C:/Users/Valentin/node_modules/');
const puppeteer = require('puppeteer-core');
const ICI = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(ICI, 'pub', 'concurrents');
fs.mkdirSync(OUT, { recursive: true });

const SHOPS = [
  { id: 'kapsulcam', nom: 'KapsulCam (nous)', url: 'https://kapsulcam.com/products/kapsulcam-4k', note: 'Notre fiche, pour comparer.' },
  { id: 'eyespro', nom: 'EyesPRO', url: 'https://eyespro.co/products/eyespro-camera', note: 'Le plus proche de nous : même format pouce aimanté. Environ 40 pubs Meta et 34 annonces Google (dont Shopping à 89,99 EUR).' },
  { id: 'moovora', nom: 'Moovora', url: 'https://moovora.fr/products/moovora', note: 'Le plus gros annonceur : environ 110 pubs Meta, certaines actives depuis avril. Trustpilot 2,2/5 au 15/10. Prix affichés sur la page (appli de lots) : 79,99 EUR en HD, 84,99 EUR en 4K, barrés 159,98, alors que le catalogue dit 169,98.' },
  { id: 'campro', nom: 'CamPro', url: 'https://campro-shop.com/products/4k-mini-wifi-action-camera-128gb-thumb-pov-portable-video-recorder-with-ipx7-waterproof-camcorder-helmet-mount-vlogging-black-1', note: 'Même caméra pouce, carte 128 Go incluse. 16 annonces Google.' },
  { id: 'cosy2road', nom: 'Cosy2Road', url: 'https://cosy2road.fr/products/mini-camera-sans-fil-4k', note: 'Boutique auto généraliste (250 produits). Vend la caméra comme « caméra espion ».' },
  { id: 'thepovpro', nom: 'The POV Pro', url: 'https://thepovpro.com/products/pov-pro-4k-uhd', note: 'Australien, prix en dollars australiens. 11 annonces Google en France.' },
  { id: 'kimenya', nom: 'Kimenya (NanoVision)', url: 'https://kimenya.com/products/nanovision-mini-camera-4k-offre-2-1', note: 'Boutique généraliste, mini caméra 4K vendue en lot, angle surveillance.' },
];

const prices = async (shop) => {
  try {
    const u = new URL(shop.url);
    const r = await fetch(`${u.origin}/products/${u.pathname.split('/').pop()}.json`, { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(15000) });
    const j = await r.json();
    return j.product.variants.map((v) => ({ t: v.title, p: v.price, c: v.compare_at_price }));
  } catch { return []; }
};

const nav = await puppeteer.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true });
const shot = async (url, file, w, h, mobile) => {
  const p = await nav.newPage();
  await p.setViewport({ width: w, height: h, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: 1 });
  if (mobile) await p.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1');
  await p.goto(url, { waitUntil: 'networkidle2', timeout: 60000 }).catch(() => {});
  await new Promise((r) => setTimeout(r, 3500));
  await p.evaluate(() => {
    for (const b of document.querySelectorAll('button, a')) {
      if (/^(tout refuser|refuser|reject all|decline|accepter|accept all|j'accepte|ok)$/i.test((b.innerText || '').trim()) && b.offsetParent) { b.click(); break; }
    }
  }).catch(() => {});
  await new Promise((r) => setTimeout(r, 1200));
  await p.screenshot({ path: file, type: 'jpeg', quality: 80 });
  await p.close();
};

const rows = [];
for (const s of SHOPS) {
  const pr = await prices(s);
  await shot(s.url, path.join(OUT, `${s.id}-pc.jpg`), 1440, 900, false);
  await shot(s.url, path.join(OUT, `${s.id}-mobile.jpg`), 390, 844, true);
  rows.push({ ...s, pr });
  console.log(s.nom, pr.map((v) => `${v.t}=${v.p}${v.c ? '/' + v.c : ''}`).join(' ; ').slice(0, 160));
}
await nav.close();

const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const html = `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Boutiques concurrentes</title>
<style>body{margin:0;background:#EDECE8;font-family:Inter,system-ui,sans-serif;color:#111;padding:28px}h1{font-weight:500;letter-spacing:-.03em;margin:0 0 6px}p.s{color:#6b6b6b;margin:0 0 24px}
section{background:#fff;border-radius:18px;padding:20px;margin:0 0 20px}h2{margin:0 0 4px;font-size:22px}h2 a{color:#111}.n{color:#555;margin:0 0 10px}
.pr{font-size:14px;margin:0 0 14px}.pr span{display:inline-block;background:#F3F3F1;border-radius:99px;padding:4px 10px;margin:0 6px 6px 0}.pr s{color:#999}
.sh{display:flex;gap:14px;align-items:flex-start;overflow-x:auto}.sh img{border-radius:10px;border:1px solid #e5e5e5;display:block}.pc{width:720px}.mo{width:195px}</style></head><body>
<h1>Boutiques concurrentes (caméra pouce / POV)</h1><p class="s">Fiches produit relevées le 16/10/2026. Prix lus sur leurs catalogues publics Shopify (prix barré à côté).</p>
${rows.map((r) => `<section><h2><a href="${r.url}" target="_blank">${esc(r.nom)}</a></h2><p class="n">${esc(r.note)}</p>
<div class="pr">${r.pr.map((v) => `<span>${esc(v.t === 'Default Title' ? 'Prix' : v.t)} : <b>${v.p}</b>${v.c && Number(v.c) > Number(v.p) ? ` <s>${v.c}</s>` : ''}</span>`).join('')}</div>
<div class="sh"><img class="pc" src="${r.id}-pc.jpg"><img class="mo" src="${r.id}-mobile.jpg"></div></section>`).join('')}
</body></html>`;
fs.writeFileSync(path.join(OUT, 'index.html'), html);
console.log('->', path.join(OUT, 'index.html'));
