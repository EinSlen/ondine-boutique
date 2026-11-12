// Google Ads helper over Edge 9222: node ads-shot.mjs [url|-] [out.png] [js]
import puppeteer from 'puppeteer-core';
const [, , url, out = 'ads.png', js] = process.argv;
const b = await puppeteer.connect({ browserURL: 'http://127.0.0.1:9222', defaultViewport: null, protocolTimeout: 300000 });
const pages = await b.pages();
const p = pages.find(x => x.url().includes('ads.google.com')) || pages[0];
await p.bringToFront();
if (url && url !== '-') {
  await p.goto(url, { waitUntil: 'networkidle2', timeout: 90000 }).catch(() => {});
  await new Promise(r => setTimeout(r, 4000));
}
if (js) console.log(await p.evaluate(js));
await p.screenshot({ path: out });
console.log(p.url());
b.disconnect();
