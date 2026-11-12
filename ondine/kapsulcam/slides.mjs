// Product carousel slides (1200x1200) from supplier photos, French copy.
// node slides.mjs [--seul 3]
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire('C:/Users/Valentin/node_modules/');
const puppeteer = require('puppeteer-core');
const ICI = path.dirname(fileURLToPath(import.meta.url));
const F = (n) => 'file:///' + path.join(ICI, 'fournisseur', n).replace(/\\/g, '/');
const OUT = path.join(ICI, 'carrousel');
fs.mkdirSync(OUT, { recursive: true });

const ACCENT = '#1463FF';
const css = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800;900&display=swap');
*{margin:0;padding:0;box-sizing:border-box}
body{width:1200px;height:1200px;overflow:hidden;font-family:Inter,Segoe UI,sans-serif;color:#0E1116;background:#F4F5F7;position:relative}
.logo{position:absolute;top:44px;left:56px;font-weight:900;font-size:34px;letter-spacing:-1px}
.logo b{color:${ACCENT}}
.bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.band{position:absolute;left:0;right:0;padding:48px 56px}
h1{font-size:76px;font-weight:900;letter-spacing:-2.5px;line-height:1.02}
h2{font-size:34px;font-weight:600;line-height:1.25;margin-top:16px;opacity:.85}
.chip{display:inline-flex;align-items:center;gap:10px;background:#fff;border-radius:999px;padding:14px 24px;font-size:26px;font-weight:700;box-shadow:0 6px 24px rgba(0,0,0,.12)}
.chip i{width:14px;height:14px;border-radius:50%;background:${ACCENT};display:inline-block}
`;
const logo = (light) => `<div class="logo" style="color:${light ? '#fff' : '#0E1116'}">Kapsul<b>Cam</b></div>`;

const slides = {
  '01-pack': `
    <body style="background:#fff">
      ${logo()}
      <img src="${F('a11.jpg')}" style="position:absolute;left:90px;top:150px;width:1020px;height:978px;object-fit:contain">
      <div style="position:absolute;top:40px;right:56px" class="chip"><i></i>Vidéo 4K</div>
      <div style="position:absolute;bottom:44px;left:0;right:0;display:flex;gap:18px;justify-content:center">
        <div class="chip"><i></i>Pack complet inclus</div>
        <div class="chip"><i></i>Livraison offerte</div>
      </div>
    </body>`,
  '02-partout': `
    <body>
      <img class="bg" src="${F('a15.jpg')}" style="object-position:50% 100%;height:1200px;top:0">
      <div class="band" style="top:0;background:linear-gradient(#fff 72%,rgba(255,255,255,0));padding-bottom:80px">
        ${logo()}<div style="height:56px"></div>
        <h1>Se fixe partout.<br>Filme sans les mains.</h1>
        <h2>Casque, guidon, sac à dos, poignet ou collier magnétique.</h2>
      </div>
    </body>`,
  '03-etanche': `
    <body style="background:#06162B">
      <img class="bg" src="${F('a14.jpg')}" style="height:1200px;object-fit:cover;object-position:50% 0%;clip-path:inset(0 0 33% 0)">
      <div style="position:absolute;left:0;right:0;top:760px;bottom:0;background:#06162B"></div>
      <div class="band" style="bottom:0;color:#fff">
        <h1 style="font-size:96px">Étanche jusqu'à 30 m</h1>
        <h2>Caisson de plongée fourni. Mer, piscine, pluie, neige : elle suit.</h2>
      </div>
      ${logo(true)}
    </body>`,
  '04-un-appui': `
    <body>
      <img class="bg" src="${F('a16.jpg')}" style="object-position:50% 100%">
      <div class="band" style="top:0;background:linear-gradient(#fff 72%,rgba(255,255,255,0));padding-bottom:80px">
        ${logo()}<div style="height:56px"></div>
        <h1>Un appui, ça filme.</h1>
        <h2>Un seul bouton. Pas de menu, pas d'écran à régler.</h2>
      </div>
    </body>`,
  '05-appli': `
    <body style="background:#fff">
      ${logo()}
      <div style="position:absolute;left:56px;top:150px;width:560px">
        <h1 style="font-size:68px">Aperçu en direct sur votre téléphone</h1>
        <h2>Wi-Fi intégré et appli gratuite : cadrez, revoyez, téléchargez et partagez en quelques secondes.</h2>
        <div style="margin-top:40px;display:flex;flex-direction:column;gap:16px;align-items:flex-start">
          <div class="chip"><i></i>iPhone et Android</div>
          <div class="chip"><i></i>Sans câble</div>
        </div>
      </div>
      <div style="position:absolute;right:0;top:0;width:560px;height:1200px;overflow:hidden">
        <img src="${F('a13.jpg')}" style="position:absolute;height:1800px;left:0;top:-270px">
      </div>
    </body>`,
  '06-specs': `
    <body style="background:#fff">
      ${logo()}
      <img src="${F('cam-seule.png')}" style="position:absolute;left:40px;top:180px;height:900px">
      <div style="position:absolute;left:520px;top:150px;right:56px;display:grid;grid-template-columns:1fr 1fr;gap:22px">
        ${[
          ['4K', 'Ultra HD'],
          ['36 g', 'plus léger qu\'une clé'],
          ['90 min', 'd\'autonomie'],
          ['30 m', 'étanche (caisson)'],
          ['Wi-Fi', 'appli gratuite'],
          ['Grand', 'angle'],
        ].map(([a, b]) => `<div style="background:#F4F5F7;border-radius:28px;padding:34px 28px">
            <div style="font-size:60px;font-weight:900;letter-spacing:-2px;color:${ACCENT}">${a}</div>
            <div style="font-size:26px;font-weight:600;margin-top:6px">${b}</div></div>`).join('')}
      </div>
    </body>`,
  '07-dans-la-boite': `
    <body style="background:#fff">
      ${logo()}
      <div style="position:absolute;left:56px;top:130px"><h1 style="font-size:64px">Dans la boîte</h1></div>
      <img src="${F('a11.jpg')}" style="position:absolute;left:60px;top:250px;width:700px;height:671px;object-fit:contain">
      <div style="position:absolute;left:770px;top:280px;right:30px;font-size:26px;font-weight:600;line-height:2;white-space:nowrap">
        ${['Caméra 4K', 'Caisson étanche 30 m', 'Collier magnétique', 'Clip dos', 'Bracelet', 'Support guidon vélo / moto', 'Câble USB-C', 'Notice']
          .map((x) => `<div style="display:flex;gap:14px;align-items:center"><span style="color:${ACCENT};font-weight:900">✓</span>${x}</div>`).join('')}
      </div>
      <div style="position:absolute;bottom:56px;left:56px;right:56px;background:#F4F5F7;border-radius:24px;padding:26px 32px;font-size:28px;font-weight:600">
        Carte microSD non incluse (jusqu'à 256 Go) : disponible en option avec la caméra.
      </div>
    </body>`,
  '08-comparatif': `
    <body style="background:#fff">
      ${logo()}
      <div style="position:absolute;left:56px;top:130px"><h1 style="font-size:64px">Pourquoi KapsulCam ?</h1></div>
      <table style="position:absolute;left:56px;right:56px;top:270px;border-collapse:separate;border-spacing:0 14px;font-size:30px;width:1088px">
        <tr style="font-weight:800;font-size:28px;opacity:.7"><td></td><td style="text-align:center;color:${ACCENT};opacity:1">KapsulCam</td><td style="text-align:center">Smartphone</td><td style="text-align:center">Action cam classique</td></tr>
        ${[
          ['Mains libres', '✓', '✗', '✓'],
          ['Poids', '36 g', '200 g', '150 g'],
          ['Se porte sur soi', '✓', '✗', 'Harnais'],
          ['Étanche 30 m', '✓', '✗', '✓'],
          ['Prix', '89,90 €', '-', '300 € et +'],
        ].map((r) => `<tr>${r.map((c, i) => `<td style="background:${i === 1 ? '#EAF1FF' : '#F4F5F7'};padding:26px 22px;${i ? 'text-align:center;' : 'font-weight:700;border-radius:18px 0 0 18px;'}${i === 3 ? 'border-radius:0 18px 18px 0;' : ''}font-weight:${i === 1 ? 800 : 600};color:${c === '✗' ? '#C9302C' : c === '✓' ? ACCENT : '#0E1116'}">${c}</td>`).join('')}</tr>`).join('')}
      </table>
    </body>`,
};

const seul = process.argv.includes('--seul') ? process.argv[process.argv.indexOf('--seul') + 1] : null;
const nav = await puppeteer.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true, args: ['--allow-file-access-from-files'] });
const page = await nav.newPage();
await page.setViewport({ width: 1200, height: 1200 });
for (const [nom, body] of Object.entries(slides)) {
  if (seul && !nom.startsWith(seul)) continue;
  const html = `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head>${body}</html>`;
  const f = path.join(OUT, `${nom}.html`);
  fs.writeFileSync(f, html);
  await page.goto('file:///' + f.replace(/\\/g, '/'), { waitUntil: 'networkidle0' });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: path.join(OUT, `${nom}.jpg`), type: 'jpeg', quality: 90 });
  fs.unlinkSync(f);
  console.log(nom);
}
await nav.close();
