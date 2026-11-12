// Carousel v2, Moovora-like: dramatic ocean backgrounds, condensed uppercase titles, orange accent.
// node slides2.mjs [--seul 01]
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire('C:/Users/Valentin/node_modules/');
const puppeteer = require('puppeteer-core');
const ICI = path.dirname(fileURLToPath(import.meta.url));
const u = (p) => 'file:///' + path.join(ICI, p).replace(/\\/g, '/');
const OUT = path.join(ICI, 'carrousel2');
fs.mkdirSync(OUT, { recursive: true });

const OR = '#E8D5B0';
const css = `
@import url('https://fonts.googleapis.com/css2?family=Barlow:wght@500;600;700;800&family=Barlow+Condensed:wght@700;800;900&display=swap');
*{margin:0;padding:0;box-sizing:border-box}
body{width:1200px;height:1200px;overflow:hidden;font-family:Barlow,sans-serif;color:#fff;background:#04192b;position:relative}
.bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.shade{position:absolute;inset:0}
.logo{position:absolute;top:46px;left:56px;font-family:'Barlow Condensed';font-weight:900;font-size:40px;letter-spacing:3px;z-index:5}
.logo b{color:${OR}}
.t{font-family:'Barlow Condensed';font-weight:900;text-transform:uppercase;line-height:.92;letter-spacing:.5px;text-shadow:0 4px 30px rgba(0,0,0,.45)}
.o{color:${OR}}
.sub{font-weight:700;font-size:32px;line-height:1.25;text-shadow:0 2px 16px rgba(0,0,0,.5)}
.badge{position:absolute;border-radius:50%;border:5px solid ${OR};background:rgba(4,25,43,.75);display:grid;place-items:center;text-align:center;font-family:'Barlow Condensed';font-weight:900;line-height:.9;z-index:5}
.lab{font-weight:700;font-size:24px;text-align:center;line-height:1.1;margin-top:8px;text-shadow:0 2px 10px rgba(0,0,0,.6)}
.it{display:flex;flex-direction:column;align-items:center;justify-content:flex-end}
.it img{object-fit:contain;filter:drop-shadow(0 12px 22px rgba(0,0,0,.55))}
.pill{display:inline-block;background:#fff;color:#04192b;font-weight:800;font-size:26px;border-radius:99px;padding:10px 22px}
`;
const logo = '<div class="logo">KAPSUL<b>CAM</b></div>';
const D = (n) => u(`decoupes/item0${n}.png`);

const univers = (fond, titre, sous, rot = -8, cam = D(0)) => `
    <body>
      <img class="bg" src="${u('decoupes/u-' + fond + '.jpg')}" style="filter:blur(2.5px) brightness(.82);transform:scale(1.04)">
      <div class="shade" style="background:radial-gradient(120% 90% at 70% 40%,rgba(4,25,43,0) 30%,rgba(4,25,43,.75) 100%),linear-gradient(180deg,rgba(4,25,43,0) 45%,rgba(4,25,43,.85) 100%)"></div>
      ${logo}
      <div style="position:absolute;right:110px;top:150px;width:520px;height:720px;display:grid;place-items:center">
        <div style="position:absolute;width:420px;height:420px;border-radius:50%;background:radial-gradient(circle,rgba(232,213,176,.45),rgba(232,213,176,0) 70%);filter:blur(10px)"></div>
        <img src="${cam}" style="position:relative;height:700px;transform:rotate(${rot}deg);filter:drop-shadow(0 40px 45px rgba(0,0,0,.65)) drop-shadow(0 0 2px rgba(255,255,255,.4))">
      </div>
      <div style="position:absolute;left:56px;right:56px;bottom:64px">
        <div class="t" style="font-size:150px">${titre}</div>
        <div class="t o" style="font-size:64px;margin-top:4px">${sous}</div>
        <div class="sub" style="font-size:26px;margin-top:18px;opacity:.9">KapsulCam 4K · 36 g · étanche 30 m avec caisson</div>
      </div>
    </body>`;

const slides = {
  '00-mer': univers('mer', 'La mer', "à hauteur d'yeux"),
  '09-vtt': univers('vtt', 'Le trail', 'sans lâcher le guidon', 7),
  '10-moto': univers('moto', 'La route', 'droit devant', -6),
  '11-neige': univers('neige', 'La neige', "jusqu'au dernier virage", 6),
  '12-mer-blanc': univers('mer', 'Version blanche', 'aussi discrète que légère', -7, u('decoupes/item00-blanc.png')),
  '01-contenu': `
    <body>
      <img class="bg" src="${u('decoupes/bg-rayons.jpg')}"><div class="shade" style="background:linear-gradient(180deg,rgba(4,25,43,.55),rgba(4,25,43,.85))"></div>
      ${logo}
      <div style="position:absolute;top:118px;left:0;right:0;text-align:center">
        <div class="t" style="font-size:98px">Contenu du pack</div>
        <div class="t o" style="font-size:54px;margin-top:6px">Tout est inclus :</div>
      </div>
      <div class="it" style="position:absolute;left:60px;top:330px;width:330px;height:780px"><img src="${D(0)}" style="height:700px"><div class="lab" style="font-size:30px">Caméra 4K</div></div>
      <div style="position:absolute;left:420px;top:330px;right:50px;display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:repeat(2,370px);gap:16px 10px">
        <div class="it"><img src="${D(4)}" style="height:300px"><div class="lab">Caisson étanche<br>30 m</div></div>
        <div class="it"><img src="${D(1)}" style="height:300px"><div class="lab">Collier<br>magnétique</div></div>
        <div class="it"><img src="${D(2)}" style="height:300px"><div class="lab">Bracelet</div></div>
        <div class="it"><img src="${D(3)}" style="height:230px"><div class="lab">Support<br>guidon</div></div>
        <div class="it"><img src="${D(5)}" style="height:250px"><div class="lab">Clip<br>arrière</div></div>
        <div class="it"><img src="${D(6)}" style="height:230px"><div class="lab">Adaptateur<br>universel</div></div>
      </div>
      <div class="badge" style="top:40px;right:46px;width:170px;height:170px;font-size:56px">4K<br><span style="font-size:26px">ULTRA HD</span></div>
      <div style="position:absolute;bottom:34px;left:0;right:0;text-align:center"><span class="pill">+ câble USB-C et notice</span></div>
    </body>`,
  '02-supports': `
    <body>
      <img class="bg" src="${u('fournisseur/a15.jpg')}" style="object-position:0 100%;height:1360px;top:-160px;width:1840px;max-width:none;left:0">
      <div class="shade" style="background:linear-gradient(90deg,rgba(4,25,43,.85) 0%,rgba(4,25,43,.35) 55%,rgba(4,25,43,0) 75%)"></div>
      ${logo}
      <div style="position:absolute;left:56px;top:620px;width:640px">
        <div class="t" style="font-size:104px"><span class="o">Un support</span><br>pour chaque<br>aventure</div>
        <div class="sub" style="margin-top:20px">Casque, guidon, sac, poignet ou collier magnétique.</div>
      </div>
      <div style="position:absolute;right:30px;bottom:40px;width:420px;display:grid;grid-template-columns:repeat(3,1fr);gap:14px;background:rgba(4,25,43,.6);border-radius:24px;padding:20px">
        <img src="${D(1)}" style="height:120px;object-fit:contain;width:100%"><img src="${D(3)}" style="height:120px;object-fit:contain;width:100%"><img src="${D(5)}" style="height:120px;object-fit:contain;width:100%">
        <img src="${D(2)}" style="height:120px;object-fit:contain;width:100%"><img src="${D(6)}" style="height:120px;object-fit:contain;width:100%"><img src="${D(4)}" style="height:120px;object-fit:contain;width:100%">
      </div>
    </body>`,
  '03-etanche': `
    <body>
      <img class="bg" src="${u('fournisseur/a14.jpg')}" style="object-position:50% 0;height:1900px;top:0">
      <div class="shade" style="background:linear-gradient(180deg,rgba(4,25,43,0) 40%,rgba(4,25,43,.95) 72%)"></div>
      ${logo}
      <div style="position:absolute;left:56px;right:56px;bottom:70px">
        <div class="t" style="font-size:96px">Étanche jusqu'à</div>
        <div class="t o" style="font-size:250px;line-height:.85">30 M</div>
        <div class="sub" style="margin-top:12px">Caisson de plongée inclus. Mer, piscine, snorkeling, pluie.</div>
      </div>
    </body>`,
  '04-un-appui': `
    <body>
      <img class="bg" src="${u('decoupes/bg-poissons.jpg')}"><div class="shade" style="background:rgba(4,25,43,.62)"></div>
      ${logo}
      <div style="position:absolute;top:120px;left:56px;right:56px">
        <div class="t" style="font-size:112px">Un appui.<br><span class="o">Ça filme.</span></div>
      </div>
      <img src="${D(0)}" style="position:absolute;left:400px;top:420px;height:720px;filter:drop-shadow(0 30px 50px rgba(0,0,0,.6))">
      <div style="position:absolute;left:56px;top:520px;width:330px;text-align:right" class="sub">Objectif<br>grand angle<div style="height:3px;background:${OR};margin:14px 0 0 120px"></div></div>
      <div style="position:absolute;left:56px;top:930px;width:330px;text-align:right" class="sub">Un seul<br>bouton<div style="height:3px;background:${OR};margin:14px 0 0 120px"></div></div>
      <div style="position:absolute;right:56px;top:640px;width:330px" class="sub"><span class="t o" style="font-size:110px;display:block">36 G</span>Plus léger qu'une clé</div>
    </body>`,
  '05-appli': `
    <body style="background:#04192b">
      ${logo}
      <div style="position:absolute;right:0;top:0;width:620px;height:1200px;overflow:hidden"><img src="${u('fournisseur/a13.jpg')}" style="position:absolute;height:1800px;left:0;top:-270px"></div>
      <div class="shade" style="background:linear-gradient(90deg,#04192b 46%,rgba(4,25,43,0) 62%)"></div>
      <div style="position:absolute;left:56px;top:300px;width:600px">
        <div class="t" style="font-size:100px">Vos vidéos<br>sur votre<br><span class="o">téléphone</span></div>
        <div class="sub" style="margin-top:24px;font-weight:600">Wi-Fi intégré, appli gratuite iPhone et Android : aperçu en direct, téléchargement et partage en un clic.</div>
        <div style="margin-top:34px"><span class="pill">Sans câble</span></div>
      </div>
    </body>`,
  '06-specs': `
    <body>
      <img class="bg" src="${u('decoupes/bg-vagues.jpg')}"><div class="shade" style="background:rgba(4,25,43,.72)"></div>
      ${logo}
      <div style="position:absolute;top:130px;left:56px" class="t"><span style="font-size:100px">Petite taille,</span><br><span class="o" style="font-size:100px">grandes aventures</span></div>
      <div style="position:absolute;left:56px;right:56px;top:420px;display:grid;grid-template-columns:1fr 1fr;gap:20px">
        ${[['4K', 'Ultra HD'], ['36 G', 'sur vous'], ['90 MIN', "d'autonomie"], ['30 M', 'étanche (caisson)'], ['WI-FI', 'appli gratuite'], ['1 BOUTON', 'pour tout faire']]
          .map(([a, b]) => `<div style="border:2px solid rgba(255,255,255,.25);background:rgba(4,25,43,.55);border-radius:24px;padding:22px 28px"><div class="t o" style="font-size:96px">${a}</div><div class="sub" style="font-size:28px">${b}</div></div>`).join('')}
      </div>
    </body>`,
  '07-comparatif': `
    <body style="background:#04192b">
      ${logo}
      <div style="position:absolute;top:130px;left:56px" class="t"><span style="font-size:96px">Pourquoi&nbsp;</span><span class="o" style="font-size:96px">KapsulCam ?</span></div>
      <table style="position:absolute;left:56px;right:56px;top:300px;width:1088px;border-collapse:separate;border-spacing:0 14px;font-size:30px;font-weight:700">
        <tr style="font-size:26px;opacity:.75"><td></td><td style="text-align:center;color:${OR};opacity:1">KAPSULCAM</td><td style="text-align:center">SMARTPHONE</td><td style="text-align:center">ACTION CAM</td></tr>
        ${[['Mains libres', '✓', '✗', '✓'], ['Poids', '36 g', '200 g', '150 g'], ['Se porte sur soi', '✓', '✗', 'Harnais'], ['Étanche 30 m', '✓', '✗', '✓'], ['Prix', '89,90 €', '-', '300 € et +']]
          .map((r) => `<tr>${r.map((c, i) => `<td style="padding:26px 22px;background:${i === 1 ? 'rgba(232,213,176,.18)' : 'rgba(255,255,255,.07)'};${i ? 'text-align:center;' : 'border-radius:18px 0 0 18px;'}${i === 3 ? 'border-radius:0 18px 18px 0;' : ''}color:${c === '✗' ? '#ff6b6b' : c === '✓' ? OR : '#fff'}">${c}</td>`).join('')}</tr>`).join('')}
      </table>
    </body>`,
  '08-coloris': `
    <body>
      <img class="bg" src="${u('fournisseur/a05.jpg')}" style="object-position:50% 40%">
      <div class="shade" style="background:linear-gradient(180deg,rgba(4,25,43,.0) 55%,rgba(4,25,43,.9) 85%)"></div>
      <div style="position:absolute;left:56px;right:56px;bottom:60px">
        <div class="t" style="font-size:100px">Noir <span class="o">ou</span> blanc</div>
        <div class="sub" style="margin-top:8px">Livrée dans sa boîte avec tous ses accessoires.</div>
      </div>
    </body>`,
};

const seul = process.argv.includes('--seul') ? process.argv[process.argv.indexOf('--seul') + 1] : null;
const nav = await puppeteer.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true, args: ['--allow-file-access-from-files'] });
const page = await nav.newPage();
await page.setViewport({ width: 1200, height: 1200 });
for (const [nom, body] of Object.entries(slides)) {
  if (seul && !nom.startsWith(seul)) continue;
  const f = path.join(OUT, `${nom}.html`);
  fs.writeFileSync(f, `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head>${body}</html>`);
  await page.goto('file:///' + f.replace(/\\/g, '/'), { waitUntil: 'load', timeout: 60000 }).catch(() => {});
  await page.evaluate(() => document.fonts.ready);
  await new Promise((r) => setTimeout(r, 700));
  await page.screenshot({ path: path.join(OUT, `${nom}.jpg`), type: 'jpeg', quality: 88 });
  fs.unlinkSync(f);
  console.log(nom);
}
await nav.close();
