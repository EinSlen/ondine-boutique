/**
 * Opens actual product pages and reads the real unit price + shipping to France.
 * Search cards lie: a "8,69 EUR" 3L fountain card is a cheap variant or a multipack,
 * flagged only by a "(1,24EUR/pc)" note. Only the item page settles landed cost.
 */
import puppeteer from "puppeteer-core";
import { writeFileSync, readFileSync, existsSync, mkdirSync } from "node:fs";

const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const HERE = "C:\\Users\\Valentin\\Desktop\\Ondine\\recherche";
const SCRATCH = "C:\\Users\\Valentin\\AppData\\Local\\Temp\\claude\\C--Users-Valentin\\040a3f1e-6ecb-4f92-b890-48c8510a3f57\\scratchpad";
const PROFILE = `${SCRATCH}\\edge-profile-ali`;
const OUT = `${HERE}\\ali-detail.json`;
const SHOTS = `${HERE}\\shots-item`;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function dismiss(page) {
  await page.evaluate(() => {
    document.querySelectorAll("button, div[role=button]").forEach((b) => {
      const t = (b.innerText || "").trim().toLowerCase();
      if (["refuser les cookies", "accepter les cookies", "plus tard", "ok"].includes(t)) { try { b.click(); } catch { } }
    });
    document.querySelectorAll("[class*='Modal'] [class*='close'], .btn-close").forEach((b) => { try { b.click(); } catch { } });
  }).catch(() => { });
}

async function readItem(page, it) {
  const rec = { ...it };
  try {
    await page.goto(it.url, { waitUntil: "domcontentloaded", timeout: 60000 });
  } catch (e) { rec.error = e.message.slice(0, 120); return rec; }

  await sleep(4000);
  await dismiss(page);
  await sleep(1500);
  await page.evaluate(() => window.scrollBy(0, 400));
  await sleep(1500);
  await page.evaluate(() => window.scrollTo(0, 0));
  await sleep(1200);

  const d = await page.evaluate(() => {
    const txt = document.body ? document.body.innerText : "";
    const grab = (re) => { const m = txt.match(re); return m ? m[0].trim() : null; };
    // The buy-box price is the largest-rendered standalone price on the page.
    let headline = null, biggest = 0;
    for (const el of document.querySelectorAll("div, span, strong, p")) {
      if (el.children.length) continue;
      const t = (el.innerText || "").trim();
      const m = t.match(/^(\d{1,3}),(\d{2})\s*€$/);
      if (!m) continue;
      const size = parseFloat(getComputedStyle(el).fontSize) || 0;
      if (size > biggest) { biggest = size; headline = parseFloat(`${m[1]}.${m[2]}`); }
    }
    return {
      headline, headlineSize: biggest,
      head: txt.slice(0, 1800),
      title: (document.querySelector("h1") || {}).innerText || null,
      shipLine: grab(/(?:Livraison|Expédition)[^\n]{0,120}/i),
      fromLine: grab(/(?:Exp[ée]di[ée] (?:depuis|de)|Envoi depuis|Ships from)[^\n]{0,60}/i),
      etaLine: grab(/(?:Livraison estimée|Arrivée estimée|Livraison le|Delivery by)[^\n]{0,80}/i),
      soldLine: grab(/[\d\s.,+]+\s*(?:vendus|commandes)/i),
    };
  });

  const prices = [...d.head.matchAll(/(\d{1,3}(?:[\s\u00a0\u202f]\d{3})*),(\d{2})\s*€/g)]
    .map((m) => parseFloat(`${m[1].replace(/[\s\u00a0\u202f]/g, "")}.${m[2]}`))
    .filter((p) => p >= 0.5 && p < 400);

  let ship = null;
  if (d.shipLine && /gratuit/i.test(d.shipLine)) ship = 0;
  else if (d.shipLine) {
    const m = d.shipLine.match(/(\d{1,3}),(\d{2})\s*€/);
    if (m) ship = parseFloat(`${m[1]}.${m[2]}`);
  }

  Object.assign(rec, {
    pageTitle: (d.title || "").slice(0, 120),
    headline: d.headline, headlineSize: d.headlineSize,
    pricesOnPage: prices.slice(0, 8),
    priceMin: prices.length ? Math.min(...prices) : null,
    priceMax: prices.length ? Math.max(...prices) : null,
    shipLine: d.shipLine, fromLine: d.fromLine, etaLine: d.etaLine, soldLine: d.soldLine,
    ship,
    head: d.head.slice(0, 900),
  });

  try {
    mkdirSync(SHOTS, { recursive: true });
    await page.screenshot({ path: `${SHOTS}\\${it.id}.png` });
  } catch { }
  return rec;
}

(async () => {
  const items = JSON.parse(readFileSync(`${HERE}\\ali-items.json`, "utf8"));
  const browser = await puppeteer.launch({
    executablePath: EDGE, headless: false, userDataDir: PROFILE,
    defaultViewport: { width: 1500, height: 1150 },
    args: ["--lang=fr-FR", "--disable-blink-features=AutomationControlled"],
  });
  const page = await browser.newPage();
  await page.setExtraHTTPHeaders({ "Accept-Language": "fr-FR,fr;q=0.9" });

  const all = existsSync(OUT) ? JSON.parse(readFileSync(OUT, "utf8")) : [];
  const done = new Set(all.map((r) => r.id));

  for (let i = 0; i < items.length; i++) {
    if (done.has(items[i].id)) continue;
    const r = await readItem(page, items[i]);
    all.push(r);
    console.log(`[${i + 1}/${items.length}] ${r.id}  carte=${String(r.cardPrice).padStart(6)}  REEL=${String(r.headline ?? "?").padStart(6)}  port=${String(r.ship ?? "?").padStart(5)}  ${(r.fromLine || "").slice(0, 30).padEnd(30)} ${(r.etaLine || "").slice(0, 28)}`);
    writeFileSync(OUT, JSON.stringify(all, null, 2), "utf8");
    await sleep(5000);
  }
  console.log(`\njson -> ${OUT}\ncaptures -> ${SHOTS}`);
  await browser.close();
})().catch((e) => { console.error("FATAL", e); process.exit(1); });
