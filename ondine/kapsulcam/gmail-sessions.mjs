// Liste les comptes Google connectés dans le profil Edge 9222 (u/0, u/1, u/2).
import puppeteer from 'puppeteer-core';
const b = await puppeteer.connect({ browserURL: 'http://127.0.0.1:9222', defaultViewport: null, protocolTimeout: 120000 });
const p = await b.newPage();
for (const u of [0, 1, 2]) {
  await p.goto(`https://mail.google.com/mail/u/${u}/#inbox`, { waitUntil: 'networkidle2' }).catch(() => {});
  await new Promise((r) => setTimeout(r, 3000));
  const c = await p.evaluate(() => document.querySelector('a[aria-label*="@"]')?.getAttribute('aria-label') || document.title);
  console.log(u, p.url().slice(0, 80), '|', c.replace(/\s+/g, ' ').slice(0, 120));
}
await p.close();
b.disconnect();
