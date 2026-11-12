// Lit Shopify Inbox dans Edge 9222 : liste des conversations, ou texte d'une conversation si un fragment d'URL est passé.
import puppeteer from 'puppeteer-core';
const b = await puppeteer.connect({ browserURL: 'http://127.0.0.1:9222', defaultViewport: null, protocolTimeout: 120000 });
const cible = process.argv[2];
let p = (await b.pages()).find((x) => x.url().includes('inbox.shopify.com'));
if (!p) { p = await b.newPage(); await p.goto('https://inbox.shopify.com/store/0rsiku-r1/conversations', { waitUntil: 'networkidle2' }); }
if (cible) await p.goto(cible.startsWith('http') ? cible : `https://inbox.shopify.com/store/0rsiku-r1/conversations/open/${cible}`, { waitUntil: 'networkidle2' });
await new Promise((r) => setTimeout(r, 4000));
console.log('URL', p.url());
console.log(await p.evaluate(() => document.body.innerText));
const liens = await p.evaluate(() => [...document.querySelectorAll('a[href*="/conversations/"]')].map((a) => `${a.href} | ${a.innerText.replace(/\s+/g, ' ').slice(0, 140)}`));
console.log('--- liens');
for (const l of [...new Set(liens)]) console.log(l);
b.disconnect();
