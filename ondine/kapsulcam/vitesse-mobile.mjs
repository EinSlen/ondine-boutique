// Mesure mobile (4G lente, CPU x4) : FCP, LCP, DCL, TBT et moment où Shopify compte la visite. Usage : node vitesse-mobile.mjs <url> [lent|rapide] (Edge 9222)
import puppeteer from 'puppeteer-core';
const [url, mode = 'lent'] = process.argv.slice(2);
const b = await puppeteer.connect({ browserURL: 'http://127.0.0.1:9222', defaultViewport: null, protocolTimeout: 300000 });
const ctx = await b.createBrowserContext();
const p = await ctx.newPage();
await p.setViewport({ width: 412, height: 823, deviceScaleFactor: 1.75, isMobile: true, hasTouch: true });
await p.setUserAgent('Mozilla/5.0 (Linux; Android 13; SM-A136B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36');
const cdp = await p.createCDPSession();
if (mode === 'lent') {
  await cdp.send('Network.enable');
  await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: 1.6 * 1024 * 1024 / 8, uploadThroughput: 750 * 1024 / 8 });
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
}
const t0 = Date.now();
const ev = [];
const marque = (u) => /monorail|produce_batch|trekkie|\/api\/collect|shopifycloud\/web-pixels|clarity\.ms\/collect|googleadservices|pagead|gtag\/js|google-analytics|g\/collect|judge|jdgm/i.test(u);
p.on('request', (r) => { const u = r.url(); if (marque(u)) ev.push([Date.now() - t0, 'req', u.replace(/\?.*/, '').slice(0, 110)]); });
let bytes = 0, n = 0;
p.on('response', async (r) => { n++; const l = Number(r.headers()['content-length'] || 0); bytes += l; });
await p.evaluateOnNewDocument(() => {
  window.__m = {};
  new PerformanceObserver((l) => { for (const e of l.getEntries()) if (e.name === 'first-contentful-paint') window.__m.fcp = Math.round(e.startTime); }).observe({ type: 'paint', buffered: true });
  new PerformanceObserver((l) => { const e = l.getEntries().pop(); window.__m.lcp = Math.round(e.startTime); window.__m.lcpEl = (e.element?.tagName || '') + '.' + String(e.element?.className || '').slice(0, 40); }).observe({ type: 'largest-contentful-paint', buffered: true });
  let tbt = 0; new PerformanceObserver((l) => { for (const e of l.getEntries()) tbt += Math.max(0, e.duration - 50); window.__m.tbt = Math.round(tbt); }).observe({ type: 'longtask', buffered: true });
});
await p.goto(url, { waitUntil: 'load', timeout: 120000 }).catch((e) => console.log('goto', e.message));
const tLoad = Date.now() - t0;
await new Promise((r) => setTimeout(r, 12000));
const m = await p.evaluate(() => ({ ...window.__m, dcl: Math.round(performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart), banner: !!document.querySelector('#shopify-pc__banner'), html: Math.round((performance.getEntriesByType('navigation')[0]?.transferSize || 0) / 1024), res: performance.getEntriesByType('resource').length, kb: Math.round(performance.getEntriesByType('resource').reduce((s, e) => s + (e.transferSize || 0), 0) / 1024) }));
console.log(mode, '| FCP', m.fcp, 'ms | LCP', m.lcp, 'ms (', m.lcpEl, ') | DCL', m.dcl, '| load', tLoad, '| TBT', m.tbt, 'ms | HTML', m.html, 'Ko | ressources', m.res, '=', m.kb, 'Ko | bannière cookies', m.banner);
const vus = new Set();
for (const [t, k, u] of ev) { const key = u.replace(/[0-9a-f]{8,}/g, '').slice(0, 70); if (vus.has(key)) continue; vus.add(key); console.log(String(t).padStart(6), 'ms', u); }
await ctx.close(); b.disconnect();
