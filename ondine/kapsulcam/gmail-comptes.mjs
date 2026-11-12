// Affiche les adresses « Envoyer en tant que » configurées dans Gmail (Edge 9222).
import puppeteer from 'puppeteer-core';
const b = await puppeteer.connect({ browserURL: 'http://127.0.0.1:9222', defaultViewport: null, protocolTimeout: 120000 });
const p = (await b.pages()).find((x) => x.url().includes('mail.google.com'));
await p.goto('https://mail.google.com/mail/u/0/#settings/accounts', { waitUntil: 'networkidle2' });
await new Promise((r) => setTimeout(r, 5000));
const t = await p.evaluate(() => document.body.innerText);
const i = t.indexOf('Envoyer des e-mails en tant que');
console.log(t.slice(i, i + 900));
b.disconnect();
