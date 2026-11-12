// Runs a JSON list of steps on the Google Ads tab (Edge 9222): node ads-steps.mjs steps.json
// Steps: {click: "text", n, near: "text"} | {type: "text"} | {key: "Enter"} | {clear: n} | {wait: ms} | {shot: "x.png"} | {eval: "js"}
import fs from 'node:fs';
import puppeteer from 'puppeteer-core';
const steps = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const b = await puppeteer.connect({ browserURL: 'http://127.0.0.1:9222', defaultViewport: null, protocolTimeout: 300000 });
const pages = await b.pages();
const p = pages.find(x => x.url().includes('ads.google.com')) || pages[0];
const sleep = ms => new Promise(r => setTimeout(r, ms));
const locate = (text, n, near, depth = 4) => p.evaluate((text, n, near, depth) => {
  const visible = e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  const own = e => [...e.childNodes].filter(c => c.nodeType === 3).map(c => c.textContent).join('').replace(/\s+/g, ' ').trim();
  const list = [];
  const walk = root => {
    for (const e of root.querySelectorAll('*')) {
      if (e.shadowRoot) walk(e.shadowRoot);
      if (visible(e) && own(e) === text) list.push(e);
    }
  };
  walk(document);
  let found = list;
  if (near) {
    found = list.filter(e => {
      for (let a = e.parentElement, i = 0; a && i < depth; a = a.parentElement, i++) if (a.innerText && a.innerText.includes(near)) return true;
      return false;
    });
  }
  const e = found[n || 0];
  if (!e) return null;
  e.scrollIntoView({ block: 'center' });
  const r = e.getBoundingClientRect();
  return { x: r.x + r.width / 2, y: r.y + r.height / 2, count: found.length };
}, text, n, near, depth);
for (const s of steps) {
  if (s.click) {
    const box = await locate(s.click, s.n, s.near, s.depth);
    if (!box) { console.log('INTROUVABLE', JSON.stringify(s)); break; }
    await p.mouse.click(box.x, box.y);
    console.log('clic', s.click, s.n || 0, '/', box.count);
    await sleep(s.after ?? 1500);
  } else if (s.clickxy) {
    await p.mouse.click(s.clickxy[0], s.clickxy[1]);
    console.log('clic xy', s.clickxy.join(','));
    await sleep(s.after ?? 1500);
  } else if (s.guard) {
    const tag = await p.evaluate(() => { let a = document.activeElement; while (a && a.shadowRoot && a.shadowRoot.activeElement) a = a.shadowRoot.activeElement; return a ? a.tagName : ''; });
    if (!['INPUT', 'TEXTAREA'].includes(tag)) { console.log('ARRET : focus sur', tag, 'et non sur un champ'); break; }
  } else if (s.type !== undefined) {
    await p.keyboard.type(s.type, { delay: 25 });
    await sleep(500);
  } else if (s.key) {
    await p.keyboard.press(s.key);
    await sleep(800);
  } else if (s.clear) {
    await p.keyboard.press('End');
    for (let i = 0; i < s.clear; i++) await p.keyboard.press('Backspace');
    await sleep(300);
  } else if (s.wait) {
    await sleep(s.wait);
  } else if (s.shot) {
    await p.screenshot({ path: s.shot });
  } else if (s.eval) {
    console.log(await p.evaluate(s.eval));
  }
}
b.disconnect();
