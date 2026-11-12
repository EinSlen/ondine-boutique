// Fills the open "Créer (lien annexe)" drawer in Google Ads from google-ads-recos.json (does not click Créer).
// Usage: node ads-sitelinks.mjs [shot.png] [from]
import fs from 'node:fs';
import puppeteer from 'puppeteer-core';
const { site, liens } = JSON.parse(fs.readFileSync('google-ads-recos.json', 'utf8'));
const shot = process.argv[2] || 'ads.png';
const from = Number(process.argv[3] || 0);
const b = await puppeteer.connect({ browserURL: 'http://127.0.0.1:9222', defaultViewport: null, protocolTimeout: 300000 });
const p = (await b.pages()).find(x => x.url().includes('ads.google.com'));
const sleep = ms => new Promise(r => setTimeout(r, ms));
const panel = i => p.evaluateHandle(i => {
  const d = [...document.querySelectorAll('slidealog-wrapper')].find(x => x.innerText.includes('Créer (lien annexe)'));
  const box = d && d.querySelectorAll('material-expansionpanel.sitelink-editor-expansion-panel')[i];
  if (!box) return null;
  return { title: box.querySelector('.main-header') || box, inputs: [...box.querySelectorAll('input, textarea')].filter(x => x.type !== 'hidden') };
}, i);
const focusedTag = () => p.evaluate(() => document.activeElement ? document.activeElement.tagName : '');
let ok = true;
for (let i = from; i < liens.length && ok; i++) {
  const l = liens[i];
  let h = await panel(i);
  if (!(await h.evaluate(o => !!o))) { console.log('panneau', i + 1, 'introuvable'); break; }
  if ((await h.evaluate(o => o.inputs.length)) < 4) {
    const title = await h.evaluateHandle(o => o.title);
    await title.evaluate(t => t.scrollIntoView({ block: 'center' }));
    await title.click();
    await sleep(2000);
    h = await panel(i);
  }
  const n = await h.evaluate(o => o.inputs.length);
  if (n < 4) { console.log('panneau', i + 1, 'champs introuvables', n); break; }
  const values = [l.texte, l.d1, l.d2, site + l.url];
  const fields = [];
  for (let k = 0; k < 4; k++) fields.push(await h.evaluateHandle((o, k) => o.inputs[k], k));
  for (let k = 0; k < 4; k++) {
    const el = fields[k];
    await el.evaluate(e => { e.scrollIntoView({ block: 'center' }); e.focus(); });
    await el.click();
    const tag = await focusedTag();
    const same = await el.evaluate(e => document.activeElement === e);
    if (!same || !['INPUT', 'TEXTAREA'].includes(tag)) { console.log('ARRET : focus hors du champ', i + 1, k, tag); ok = false; break; }
    await el.evaluate(e => e.select && e.select());
    await p.keyboard.press('Backspace');
    await p.keyboard.type(values[k], { delay: 15 });
    await sleep(250);
    const got = await el.evaluate(e => e.value);
    if (got !== values[k]) { console.log('ARRET : valeur', JSON.stringify(got), 'au lieu de', JSON.stringify(values[k])); ok = false; break; }
  }
  if (ok) console.log('lien', i + 1, 'rempli :', l.texte);
}
await sleep(1000);
await p.screenshot({ path: shot });
b.disconnect();
