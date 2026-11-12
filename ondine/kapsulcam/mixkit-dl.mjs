// Downloads Mixkit clips only when their page shows the Free License (restricted ones are not allowed in ads).
// node mixkit-dl.mjs <id>:<slug> ...   -> videos/mixkit/<id>.mp4 (4K, else 1080p) + videos/mixkit/licences.json
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const ICI = path.dirname(fileURLToPath(import.meta.url));
const DIR = path.join(ICI, 'videos', 'mixkit');
fs.mkdirSync(DIR, { recursive: true });
const LIC = path.join(DIR, 'licences.json');
const lic = fs.existsSync(LIC) ? JSON.parse(fs.readFileSync(LIC, 'utf8')) : {};
const UA = { headers: { 'User-Agent': 'Mozilla/5.0' } };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
// Mixkit rate-limits plain requests to its pages: the licence is read through the Edge window (port 9222).
const puppeteer = createRequire('C:/Users/Valentin/node_modules/')('puppeteer-core');
const edge = await puppeteer.connect({ browserURL: 'http://127.0.0.1:9222', defaultViewport: null });
const ep = await edge.newPage();

for (const arg of process.argv.slice(2)) {
  const [id, slug] = arg.split(':');
  const file = path.join(DIR, `${id}.mp4`);
  if (fs.existsSync(file) && lic[id]?.licence === 'free') { console.log(id, 'déjà là'); continue; }
  const r = await ep.goto(`https://mixkit.co/free-stock-video/${slug}-${id}/`, { waitUntil: 'domcontentloaded', timeout: 60000 }).catch(() => null);
  await sleep(2500);
  if (!r || r.status() !== 200) { console.log(id, 'page HTTP', r?.status()); continue; }
  const page = await ep.content();
  const licence = /Restricted License/i.test(page) ? 'restricted' : /Free License/i.test(page) ? 'free' : 'inconnue';
  lic[id] = { slug, licence, url: `https://mixkit.co/free-stock-video/${slug}-${id}/`, date: new Date().toISOString().slice(0, 10) };
  fs.writeFileSync(LIC, JSON.stringify(lic, null, 1));
  if (licence !== 'free') { console.log(id, 'ignoré, licence', licence); continue; }
  if (process.env.CHECKONLY) { console.log(id, 'licence libre'); continue; }
  for (const res of ['2160', '1080']) {
    const v = await fetch(`https://assets.mixkit.co/videos/${id}/${id}-${res}.mp4`, UA);
    if (v.status !== 200) continue;
    fs.writeFileSync(file, Buffer.from(await v.arrayBuffer()));
    lic[id].res = res;
    fs.writeFileSync(LIC, JSON.stringify(lic, null, 1));
    console.log(id, 'téléchargé', res, Math.round(fs.statSync(file).size / 1e6), 'Mo');
    break;
  }
}
await ep.close();
edge.disconnect();
