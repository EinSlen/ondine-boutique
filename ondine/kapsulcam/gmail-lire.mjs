// Ouvre Gmail dans Edge 9222 sur une recherche et affiche la liste des messages trouvés.
import puppeteer from 'puppeteer-core';
const b = await puppeteer.connect({ browserURL: 'http://127.0.0.1:9222', defaultViewport: null, protocolTimeout: 120000 });
const recherche = process.argv[2] || 'kapsulcam newer_than:3d';
let p = (await b.pages()).find((x) => x.url().includes('mail.google.com'));
if (!p) p = await b.newPage();
await p.goto(`https://mail.google.com/mail/u/0/#search/${encodeURIComponent(recherche)}`, { waitUntil: 'networkidle2' });
await new Promise((r) => setTimeout(r, 5000));
console.log('URL', p.url());
const compte = await p.evaluate(() => document.querySelector('a[aria-label*="@"]')?.getAttribute('aria-label') || '');
console.log('compte', compte.replace(/\s+/g, ' ').slice(0, 160));
const lignes = await p.evaluate(() => [...document.querySelectorAll('tr.zA')].filter((tr) => tr.offsetParent).map((tr) => tr.innerText.replace(/\s+/g, ' ').slice(0, 220)));
for (const l of lignes) console.log('-', l);
b.disconnect();
