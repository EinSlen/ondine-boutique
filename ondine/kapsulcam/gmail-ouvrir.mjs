// Ouvre dans Gmail (Edge 9222) le premier résultat d'une recherche et affiche son texte complet.
import puppeteer from 'puppeteer-core';
const b = await puppeteer.connect({ browserURL: 'http://127.0.0.1:9222', defaultViewport: null, protocolTimeout: 120000 });
const recherche = process.argv[2];
const p = (await b.pages()).find((x) => x.url().includes('mail.google.com'));
await p.goto(`https://mail.google.com/mail/u/0/#search/${encodeURIComponent(recherche)}`, { waitUntil: 'networkidle2' });
await new Promise((r) => setTimeout(r, 4000));
await p.evaluate(() => [...document.querySelectorAll('tr.zA')].find((tr) => tr.offsetParent)?.click());
await new Promise((r) => setTimeout(r, 4000));
console.log('URL', p.url());
console.log(await p.evaluate(() => [...document.querySelectorAll('h2.hP, .gD, .g3, .a3s')].filter((e) => e.offsetParent).map((e) => e.getAttribute('email') ? `${e.innerText} <${e.getAttribute('email')}>` : e.innerText).join('\n---\n')));
b.disconnect();
