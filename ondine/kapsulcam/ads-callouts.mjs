// Fills the open "Ajouter des accroches" recommendation editor from google-ads-recos.json (does not click Appliquer).
// Usage: node ads-callouts.mjs [shot.png]
import fs from 'node:fs';
import puppeteer from 'puppeteer-core';
const { accroches } = JSON.parse(fs.readFileSync('google-ads-recos.json', 'utf8'));
const shot = process.argv[2] || 'ads.png';
const b = await puppeteer.connect({ browserURL: 'http://127.0.0.1:9222', defaultViewport: null, protocolTimeout: 300000 });
const p = (await b.pages()).find(x => x.url().includes('ads.google.com'));
const sleep = ms => new Promise(r => setTimeout(r, ms));
const fields = () => p.evaluateHandle(() => [...document.querySelectorAll('input')].filter(x => {
  if (x.getBoundingClientRect().width === 0) return false;
  for (let a = x.parentElement, i = 0; a && i < 6; a = a.parentElement, i++) if (/Texte de l.accroche\s\d+/.test(a.innerText || '')) return true;
  return false;
}));
for (let i = 0; i < accroches.length; i++) {
  let count = await (await fields()).evaluate(l => l.length);
  if (count <= i) {
    const add = await p.evaluateHandle(() => [...document.querySelectorAll('*')].find(e => [...e.childNodes].some(c => c.nodeType === 3 && c.textContent.trim() === 'Ajouter un texte d\'accroche') && e.getBoundingClientRect().width > 0));
    if (!(await add.evaluate(e => !!e))) { console.log('bouton d\'ajout introuvable'); break; }
    await add.evaluate(e => e.scrollIntoView({ block: 'center' }));
    await add.click();
    await sleep(1200);
    count = await (await fields()).evaluate(l => l.length);
    if (count <= i) { console.log('champ', i + 1, 'introuvable'); break; }
  }
  const el = await (await fields()).evaluateHandle((l, i) => l[i], i);
  await el.evaluate(e => { e.scrollIntoView({ block: 'center' }); e.focus(); });
  await el.click();
  if (!(await el.evaluate(e => document.activeElement === e))) { console.log('ARRET : focus hors du champ', i + 1); break; }
  await el.evaluate(e => e.select());
  await p.keyboard.press('Backspace');
  await p.keyboard.type(accroches[i], { delay: 15 });
  await sleep(250);
  const got = await el.evaluate(e => e.value);
  if (got !== accroches[i]) { console.log('ARRET : valeur', JSON.stringify(got)); break; }
  console.log('accroche', i + 1, ':', got);
}
console.log('relu :', await (await fields()).evaluate(l => l.map(x => x.value).join(' | ')));
await p.screenshot({ path: shot });
b.disconnect();
