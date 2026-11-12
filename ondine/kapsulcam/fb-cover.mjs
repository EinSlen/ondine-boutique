// Facebook cover (1640x624) in the style of the home hero: sea photo, white headline, camera packshot.
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const require = createRequire('C:/Users/Valentin/node_modules/');
const puppeteer = require('puppeteer-core');
const ICI = path.dirname(fileURLToPath(import.meta.url));
const u = (p) => 'file:///' + path.join(ICI, p).replace(/\\/g, '/');
const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500&display=swap');
*{margin:0;padding:0;box-sizing:border-box}
body{width:1640px;height:624px;overflow:hidden;position:relative;font-family:Inter,sans-serif;background:#1b2a33}
.bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:50% 45%}
.sh{position:absolute;inset:0;background:linear-gradient(90deg,rgba(0,0,0,.5),rgba(0,0,0,.1) 60%),linear-gradient(0deg,rgba(0,0,0,.3),rgba(0,0,0,0) 45%)}
h1{position:absolute;left:120px;top:150px;color:#fff;font-weight:500;font-size:92px;line-height:.98;letter-spacing:-2.5px}
p{position:absolute;left:124px;top:370px;color:#fff;font-size:26px;opacity:.95}
.cam{position:absolute;right:250px;top:70px;height:480px;transform:rotate(-8deg);filter:drop-shadow(0 30px 40px rgba(0,0,0,.45))}
</style></head><body>
<img class="bg" src="${u('videos/kc-u-mer.jpg')}"><div class="sh"></div>
<h1>Vivez le moment.<br>Elle le filme.</h1>
<p>La caméra 4K de 36 g qui se porte sur vous.</p>
<img class="cam" src="${u('decoupes/item00.png')}">
</body></html>`;
fs.writeFileSync(path.join(ICI, '_cover.html'), html);
const nav = await puppeteer.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true, args: ['--allow-file-access-from-files'] });
const p = await nav.newPage();
await p.setViewport({ width: 1640, height: 624 });
await p.goto(u('_cover.html'), { waitUntil: 'networkidle0' });
await p.evaluate(() => document.fonts.ready);
await p.screenshot({ path: path.join(ICI, 'pub', 'fb-couverture.jpg'), type: 'jpeg', quality: 92 });
await nav.close();
fs.unlinkSync(path.join(ICI, '_cover.html'));
console.log('pub/fb-couverture.jpg');
