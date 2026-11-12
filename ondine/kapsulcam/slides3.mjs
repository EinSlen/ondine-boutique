// Carousel v3, Loop-like: light studio packshots, flat-lay of the pack, clean lifestyle crops (no overlays).
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire('C:/Users/Valentin/node_modules/');
const puppeteer = require('puppeteer-core');
const ICI = path.dirname(fileURLToPath(import.meta.url));
const u = (p) => 'file:///' + path.join(ICI, p).replace(/\\/g, '/');
const OUT = path.join(ICI, 'carrousel3');
fs.mkdirSync(OUT, { recursive: true });
const BG = '#EDECE8';

const css = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
*{margin:0;padding:0;box-sizing:border-box}
body{width:1200px;height:1200px;overflow:hidden;font-family:Inter,sans-serif;color:#111;background:${BG};position:relative}
.full{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.shadow{position:absolute;left:50%;bottom:150px;width:420px;height:60px;transform:translateX(-50%);background:radial-gradient(closest-side,rgba(0,0,0,.28),rgba(0,0,0,0));filter:blur(6px)}
.it{display:flex;flex-direction:column;align-items:center;justify-content:flex-end;gap:14px}
.it img{object-fit:contain;filter:drop-shadow(0 18px 18px rgba(0,0,0,.18))}
.it span{font-size:24px;font-weight:500}
`;
const D = (n) => u(`decoupes/item0${n}.png`);
const packshot = (img, rot) => `<body><div class="shadow"></div><img src="${img}" style="position:absolute;left:50%;top:120px;height:880px;transform:translateX(-50%) rotate(${rot}deg);filter:drop-shadow(0 30px 40px rgba(0,0,0,.22))"></body>`;
const crop = (src, pos, scale = 1) => `<body><img class="full" src="${u('fournisseur/' + src)}" style="object-position:${pos};transform:scale(${scale});transform-origin:${pos}"></body>`;

const slides = {
  '01-noir': packshot(D(0), -6),
  '02-blanc': packshot(u('decoupes/item00-blanc.png'), 6),
  '03-pack': `<body>
    <div style="position:absolute;top:70px;left:0;right:0;text-align:center;font-size:44px;font-weight:500;letter-spacing:-1px">Tout est dans la boîte</div>
    <div style="position:absolute;left:70px;right:70px;top:180px;bottom:70px;display:grid;grid-template-columns:1.25fr 1fr 1fr 1fr;grid-template-rows:1fr 1fr;gap:20px 18px">
      <div class="it" style="grid-row:span 2"><img src="${D(0)}" style="height:720px"><span>Caméra 4K</span></div>
      <div class="it"><img src="${D(4)}" style="height:290px"><span>Caisson 30 m</span></div>
      <div class="it"><img src="${D(1)}" style="height:290px"><span>Collier</span></div>
      <div class="it"><img src="${D(2)}" style="height:290px"><span>Bracelet</span></div>
      <div class="it"><img src="${D(3)}" style="height:210px"><span>Support guidon</span></div>
      <div class="it"><img src="${D(5)}" style="height:240px"><span>Clip</span></div>
      <div class="it"><img src="${D(6)}" style="height:220px"><span>Adaptateur</span></div>
    </div></body>`,
  '04-ski': `<body><img class="full" src="${u('decoupes/p-ski.jpg')}"></body>`,
  '05-plongee': crop('a14.jpg', '60% 0%', 1.5),
  '06-collier': `<body><img class="full" src="${u('decoupes/p-collier.jpg')}"></body>`,
  '07-sac': `<body><img class="full" src="${u('decoupes/p-sac.jpg')}"></body>`,
  '08-poignet': `<body><img class="full" src="${u('decoupes/p-poignet.jpg')}"></body>`,
  '09-specs': `<body>
    <div style="position:absolute;top:90px;left:90px;font-size:56px;font-weight:500;letter-spacing:-1.5px;line-height:1.05">Petite,<br>et complète.</div>
    <div style="position:absolute;left:90px;right:90px;bottom:90px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px">
      ${[['4K', 'Ultra HD'], ['36 g', 'sur vous'], ['90 min', "d'autonomie"], ['30 m', 'étanche (caisson)'], ['Wi-Fi', 'appli gratuite'], ['USB-C', 'recharge']]
        .map(([a, b]) => `<div style="background:#fff;border-radius:24px;padding:30px 28px"><div style="font-size:54px;font-weight:500;letter-spacing:-1.5px">${a}</div><div style="font-size:22px;color:#6b6b6b;margin-top:4px">${b}</div></div>`).join('')}
    </div>
    <img src="${D(0)}" style="position:absolute;right:120px;top:70px;height:420px;transform:rotate(10deg);filter:drop-shadow(0 20px 26px rgba(0,0,0,.2))">
  </body>`,
};

const nav = await puppeteer.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true, args: ['--allow-file-access-from-files'] });
const page = await nav.newPage();
await page.setViewport({ width: 1200, height: 1200 });
for (const [nom, body] of Object.entries(slides)) {
  const f = path.join(OUT, `${nom}.html`);
  fs.writeFileSync(f, `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head>${body}</html>`);
  await page.goto('file:///' + f.replace(/\\/g, '/'), { waitUntil: 'load', timeout: 60000 }).catch(() => {});
  await page.evaluate(() => document.fonts.ready);
  await new Promise((r) => setTimeout(r, 600));
  await page.screenshot({ path: path.join(OUT, `${nom}.jpg`), type: 'jpeg', quality: 90 });
  fs.unlinkSync(f);
  console.log(nom);
}
await nav.close();
