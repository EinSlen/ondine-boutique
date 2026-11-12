// EU reach per ad via AdLibraryV3AdDetailsQuery replay.
// node adlib-reach.mjs <in.json> <out.json>
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
const require = createRequire('C:/Users/Valentin/node_modules/');
const puppeteer = require('puppeteer-core');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const [IN, OUT] = process.argv.slice(2);
const ads = JSON.parse(fs.readFileSync(IN, 'utf8'));
const b = await puppeteer.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: 'new', userDataDir: path.dirname(OUT) + '/edge-profile-reach', args: ['--lang=fr-FR'] });
const p = await b.newPage();
await p.setViewport({ width: 1400, height: 1000 });
let post = null;
p.on('request', (r) => {
  if (r.url().includes('/api/graphql') && /AdLibraryV3AdDetailsQuery/.test(r.postData() || '')) post = r.postData();
});
await p.goto('https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&q=moovora&search_type=keyword_unordered&media_type=all', { waitUntil: 'networkidle2', timeout: 90000 }).catch(() => {});
await sleep(5000);
const btns = await p.$$('xpath/.//div[@role="button"][.//text()[normalize-space()="Voir les détails de la publicité"]]');
await btns[0].click();
await sleep(4000);
if (!post) { console.log('pas de requête capturée'); process.exit(1); }
const params = new URLSearchParams(post);
const vars = JSON.parse(params.get('variables'));
console.log('variables', Object.keys(vars));
for (const a of ads) {
  const v = { ...vars };
  for (const k of Object.keys(v)) {
    if (/adArchiveID|ad_archive_id|adID/i.test(k)) v[k] = a.id;
    if (/pageID|page_id/i.test(k) && a.pageId) v[k] = a.pageId;
  }
  params.set('variables', JSON.stringify(v));
  const t = await p.evaluate(async (body) => {
    const r = await fetch('/api/graphql/', { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body, credentials: 'include' });
    return r.text();
  }, params.toString());
  let j = null;
  try { j = JSON.parse(t.split('\n')[0]); } catch {}
  const d = j?.data?.ad_library_main?.ad_details;
  const eu = d?.transparency_by_location?.eu_transparency;
  a.reach = eu?.eu_total_reach ?? null;
  a.countries = eu?.location_audience?.map((x) => x.name).join(',');
  a.payer = d?.aaa_info?.payer_beneficiary_data?.map((x) => x.payer).join(' / ');
  if (!d) a.err = t.slice(0, 160);
  await sleep(300);
}
fs.writeFileSync(OUT, JSON.stringify(ads, null, 1));
console.log('fini', ads.length, 'erreurs', ads.filter((x) => x.err).length);
await b.close();
