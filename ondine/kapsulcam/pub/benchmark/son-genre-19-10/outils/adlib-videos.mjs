// Collect active FR video ads (with video URLs) from the Meta Ad Library.
// node adlib-videos.mjs <outDir> "query1" "query2" ...
import { createRequire } from 'node:module';
import fs from 'node:fs';
const require = createRequire('C:/Users/Valentin/node_modules/');
const puppeteer = require('puppeteer-core');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const [OUT, ...queries] = process.argv.slice(2);
fs.mkdirSync(OUT, { recursive: true });

const ads = new Map();
const walk = (o, q) => {
  if (!o || typeof o !== 'object') return;
  if (Array.isArray(o)) { for (const x of o) walk(x, q); return; }
  if (o.ad_archive_id && o.snapshot) {
    const s = o.snapshot;
    const vids = [...(s.videos || []), ...((s.cards || []).filter((c) => c.video_hd_url || c.video_sd_url))];
    const prev = ads.get(o.ad_archive_id);
    ads.set(o.ad_archive_id, {
      id: o.ad_archive_id,
      q,
      page: s.page_name,
      pageId: s.page_id || o.page_id,
      start: o.start_date ? new Date(o.start_date * 1000).toISOString().slice(0, 10) : null,
      active: o.is_active,
      collation: o.collation_count,
      platforms: o.publisher_platform,
      body: s.body?.text || s.cards?.[0]?.body || '',
      title: s.title || s.cards?.[0]?.title || '',
      link: s.link_url || s.cards?.[0]?.link_url || '',
      cta: s.cta_text,
      display: s.display_format,
      videos: vids.map((v) => ({ hd: v.video_hd_url, sd: v.video_sd_url, img: v.video_preview_image_url })),
      ...(prev || {}),
    });
    return;
  }
  for (const k of Object.keys(o)) walk(o[k], q);
};
const parseChunks = (t, q) => {
  for (const line of t.split('\n')) {
    const s = line.trim();
    if (!s.startsWith('{')) continue;
    try { walk(JSON.parse(s), q); } catch {}
  }
};

const b = await puppeteer.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: 'new', userDataDir: OUT + '/edge-profile', args: ['--lang=fr-FR'] });
const p = await b.newPage();
await p.setViewport({ width: 1400, height: 1000 });
let curQ = '';
p.on('response', async (r) => {
  if (!r.url().includes('/api/graphql')) return;
  try { parseChunks(await r.text(), curQ); } catch {}
});
for (const q of queries) {
  curQ = q;
  const before = ads.size;
  const url = q.startsWith('page:')
    ? `https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=FR&view_all_page_id=${q.slice(5)}&media_type=video`
    : `https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=FR&q=${encodeURIComponent(q)}&search_type=keyword_unordered&media_type=video`;
  await p.goto(url, { waitUntil: 'networkidle2', timeout: 90000 }).catch(() => {});
  await sleep(4000);
  const html = await p.content();
  for (const m of html.matchAll(/<script type="application\/json"[^>]*>([\s\S]*?)<\/script>/g)) {
    try { walk(JSON.parse(m[1]), q); } catch {}
  }
  for (let i = 0; i < 12; i++) { await p.evaluate(() => window.scrollBy(0, 5000)); await sleep(1500); }
  const text = await p.evaluate(() => document.body.innerText);
  const total = (text.match(/~?(\d[\d\s\u202f]*) résultats?/) || [])[1];
  console.log(`${q}: ${total || '?'} résultats, ${ads.size - before} nouvelles pubs`);
}
fs.writeFileSync(`${OUT}/ads.json`, JSON.stringify([...ads.values()], null, 1));
console.log('total', ads.size, 'avec vidéo', [...ads.values()].filter((a) => a.videos.length).length);
await b.close();
