// Ouvre un nouveau message Gmail (Edge 9222), le remplit et l'envoie si le dernier argument vaut 1.
// node gmail-envoyer.mjs <destinataire> <objet> <fichier texte> <capture.png> <0|1>
import fs from 'node:fs';
import puppeteer from 'puppeteer-core';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const [to, sujet, fichier, capture, envoyer] = process.argv.slice(2);
const corps = fs.readFileSync(fichier, 'utf8');
const b = await puppeteer.connect({ browserURL: 'http://127.0.0.1:9222', defaultViewport: null, protocolTimeout: 120000 });
const p = await b.newPage();
await p.setViewport({ width: 1300, height: 900 });
await p.goto(`https://mail.google.com/mail/u/0/?view=cm&fs=1&tf=1&to=${encodeURIComponent(to)}&su=${encodeURIComponent(sujet)}&body=${encodeURIComponent(corps)}`, { waitUntil: 'domcontentloaded', timeout: 60000 }).catch(() => {});
await p.waitForSelector('div[role=button][aria-label^="Envoyer"]', { timeout: 60000 });
await sleep(2500);
const verif = await p.evaluate(() => ({
  de: document.querySelector('[name=from], .az2, .gO')?.innerText || '',
  a: [...document.querySelectorAll('[email]')].map((e) => e.getAttribute('email')),
  objet: document.querySelector('input[name=subjectbox]')?.value,
  corps: document.querySelector('div[aria-label="Corps du message"]')?.innerText,
}));
console.log(JSON.stringify(verif, null, 1));
await p.screenshot({ path: capture });
if (envoyer === '1') {
  await (await p.$('div[role=button][aria-label^="Envoyer"]')).click();
  for (let i = 0; i < 40; i++) {
    await sleep(1000);
    if (/Message envoyé/.test(await p.evaluate(() => document.body.innerText))) { console.log('ENVOYÉ'); break; }
    if (i === 39) console.log('pas de confirmation vue');
  }
  await p.close();
} else console.log('brouillon ouvert, non envoyé');
b.disconnect();
