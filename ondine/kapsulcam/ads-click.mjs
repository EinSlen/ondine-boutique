// Real mouse click on the nth visible element whose own text matches: node ads-click.mjs "<text>" [n] [out.png]
import puppeteer from 'puppeteer-core';
const [, , text, n = '0', out = 'ads.png'] = process.argv;
const b = await puppeteer.connect({ browserURL: 'http://127.0.0.1:9222', defaultViewport: null, protocolTimeout: 300000 });
const pages = await b.pages();
const p = pages.find(x => x.url().includes('ads.google.com')) || pages[0];
const box = await p.evaluate((text, n) => {
  const all = [];
  const walk = root => {
    for (const e of root.querySelectorAll('*')) {
      if (e.shadowRoot) walk(e.shadowRoot);
      const own = [...e.childNodes].filter(c => c.nodeType === 3).map(c => c.textContent).join('').trim();
      const r = e.getBoundingClientRect();
      if (own === text && r.width > 0 && r.height > 0) all.push(e);
    }
  };
  walk(document);
  const e = all[n];
  if (!e) return null;
  e.scrollIntoView({ block: 'center' });
  const r = e.getBoundingClientRect();
  return { x: r.x + r.width / 2, y: r.y + r.height / 2, count: all.length };
}, text, Number(n));
if (!box) { console.log('INTROUVABLE', text); b.disconnect(); process.exit(1); }
await p.mouse.click(box.x, box.y);
await new Promise(r => setTimeout(r, 5000));
await p.screenshot({ path: out });
console.log('clic', text, n, '/', box.count, p.url());
b.disconnect();
