/**
 * Product hunt, corrected protocol (see README). Step 1 and 2 in one pass:
 * competitive wall first, floor price second. Volume is NOT measured here on purpose,
 * it is what let the cat fountain through on 05/08.
 *
 * The old script matched a hardcoded specialist list, so any niche outside the twelve
 * already studied scored a fake zero. This one reads the merchants actually on the page.
 *
 * node hunt.mjs [queriesFile] [tag]
 */
import puppeteer from "puppeteer-core";
import { writeFileSync, readFileSync, existsSync } from "node:fs";

const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const HERE = "C:\\Users\\Valentin\\Desktop\\Ondine\\recherche";
const PROFILE = "C:\\Users\\Valentin\\AppData\\Local\\Temp\\claude\\C--Users-Valentin\\040a3f1e-6ecb-4f92-b890-48c8510a3f57\\scratchpad\\edge-profile-goog";
const QF = process.argv[2] || "hunt-queries.json";
const TAG = process.argv[3] || "hunt";
const OUT = `${HERE}\\${TAG}.json`;

const CHAINS = ["norauto", "feu vert", "feuvert", "carter-cash", "roady", "leclerc", "lidl", "aldi",
  "castorama", "leroy merlin", "leroymerlin", "decathlon", "boulanger", "darty", "action", "gifi",
  "maxi zoo", "maxizoo", "animalis", "truffaut", "jardiland", "bricomarch", "bricorama", "intermarch",
  "carrefour", "auchan", "conforama", "ikea", "weldom", "bricolage", "botanic", "gamm vert",
  "cultura", "fnac", "picwictoys", "kiabi", "vertbaudet", "nature et decouvertes", "electro depot",
  "electrodepot", "but.fr", "ldlc", "materiel.net", "top office", "bureau vallee", "zooplus", "zoomalia"];
const MARKETPLACES = ["amazon", "aliexpress", "temu", "cdiscount", "manomano", "rakuten", "ebay",
  "shein", "backmarket", "back market", "wish", "etsy", "leboncoin", "veepee", "showroomprive",
  "alibaba", "kaufland", "bigshopper", "vevor", "expondo", "klarstein", "metro."];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const isPrice = (l) => /^\d{1,4}([ .,]\d{3})*[,.]\d{2}\s*€$/.test(l.trim());

async function killConsent(page) {
  for (const t of ["Tout refuser", "Refuser tout", "Reject all"]) {
    try {
      const h = await page.evaluateHandle((txt) => {
        const els = Array.from(document.querySelectorAll("button, div[role=button]"));
        return els.find((e) => (e.innerText || "").trim().toLowerCase() === txt.toLowerCase()) || null;
      }, t);
      const el = h.asElement();
      if (el) { await el.click(); await sleep(2200); return true; }
    } catch { }
  }
  return false;
}

/**
 * Shopping cards render as: title / price / [struck price] / MERCHANT / shipping / "Par <CSS>".
 * The merchant is the first line after a price that is not itself price, shipping or plumbing.
 */
function merchantsFrom(lines) {
  const out = [];
  const skip = /^(gratuite|livraison|par |note magasin|promotion|en stock|occasion|\+ ?\d|[\d,.]+ ?%|★|de frais|et plus|voir plus|afficher|autres|sponsoris|annonce|comparer|d'occasion)/i;
  for (let i = 0; i < lines.length; i++) {
    if (!isPrice(lines[i])) continue;
    for (let j = i + 1; j < Math.min(i + 4, lines.length); j++) {
      const l = lines[j].trim();
      if (!l || isPrice(l) || skip.test(l)) continue;
      if (l.length > 34 || /^\d/.test(l)) continue;
      out.push(l);
      break;
    }
  }
  return out;
}

async function probe(page, kw, attempt = 1) {
  const out = { kw, url: `https://www.google.fr/search?q=${encodeURIComponent(kw)}&hl=fr&gl=fr` };
  try { const r = await page.goto(out.url, { waitUntil: "domcontentloaded", timeout: 40000 }); out.status = r ? r.status() : null; }
  catch (e) { out.error = e.message.slice(0, 110); return out; }

  // A 429 returns an empty page, not a "unusual traffic" banner. Without this check the
  // scraper reports a perfect empty market for every query. It happened on 40/40.
  if (out.status && out.status >= 400) {
    if (attempt < 4) {
      const wait = attempt * 120000;
      console.log(`   "${kw}" HTTP ${out.status}, pause ${wait / 1000}s`);
      await sleep(wait);
      return probe(page, kw, attempt + 1);
    }
    out.blocked = true; out.verdict = "NON MESURE"; return out;
  }
  await sleep(2600);
  await killConsent(page);
  await sleep(1200);
  await page.evaluate(() => window.scrollBy(0, 700));
  await sleep(1800);

  let d;
  try {
    d = await page.evaluate(() => {
      const body = document.body ? document.body.innerText : "";
      if (/pas un robot|trafic inhabituel|unusual traffic/i.test(body.slice(0, 700))) return { blocked: true, body: "" };
      return { blocked: false, body };
    });
  } catch (e) {
    // Detached frame: Google swapped the document under us. One retry on a fresh nav.
    if (attempt < 3) { await sleep(4000); return probe(page, kw, attempt + 1); }
    out.error = e.message.slice(0, 110); return out;
  }

  if (d.blocked) {
    if (attempt < 3) { console.log(`   "${kw}" bloque, pause ${attempt * 30}s`); await sleep(attempt * 30000); return probe(page, kw, attempt + 1); }
    out.blocked = true; return out;
  }

  const body = d.body;
  const low = body.toLowerCase();
  const lines = body.split("\n").map((s) => s.trim()).filter(Boolean);

  const prices = [...body.matchAll(/(\d{1,4})[,.](\d{2})\s*€/g)]
    .map((m) => parseFloat(`${m[1]}.${m[2]}`)).filter((p) => p >= 5 && p <= 3000).sort((a, b) => a - b);
  const pick = (q) => (prices.length ? prices[Math.min(prices.length - 1, Math.floor(prices.length * q))] : null);

  const merchants = [...new Set(merchantsFrom(lines))];
  const norm = (s) => s.toLowerCase().replace(/\.(fr|com|net|eu)$/,"").trim();
  const chainHits = merchants.filter((m) => CHAINS.some((c) => norm(m).includes(c)));
  const mktHits = merchants.filter((m) => MARKETPLACES.some((c) => norm(m).includes(c)));
  const others = merchants.filter((m) => !chainHits.includes(m) && !mktHits.includes(m));

  out.pMin = prices[0] ?? null;
  out.p25 = pick(0.25);
  out.pMed = pick(0.5);
  out.merchants = merchants;
  out.chains = chainHits;
  out.marketplaces = mktHits;
  out.independents = others;
  out.chainsInText = CHAINS.filter((c) => low.includes(c));
  out.pickup = (body.match(/Retrait|En magasin/gi) || []).length;
  // Wall = physical chains + independent specialists. Marketplaces are everywhere, they discriminate nothing.
  out.wall = new Set([...chainHits.map(norm), ...out.chainsInText]).size + others.length;
  // No price and no merchant on a commercial query means the page did not load, not an
  // empty market. Never let that read as a free field.
  if (out.pMed == null && merchants.length === 0) { out.verdict = "NON MESURE"; return out; }
  out.verdict = out.wall <= 3 && out.pickup <= 3 ? "A CREUSER" : "elimine";
  return out;
}

(async () => {
  const queries = JSON.parse(readFileSync(`${HERE}\\${QF}`, "utf8"));
  const browser = await puppeteer.launch({
    executablePath: EDGE, headless: false, userDataDir: PROFILE,
    defaultViewport: { width: 1400, height: 1100 },
    args: ["--lang=fr-FR", "--disable-blink-features=AutomationControlled"],
  });
  const page = await browser.newPage();
  await page.setExtraHTTPHeaders({ "Accept-Language": "fr-FR,fr;q=0.9" });

  const all = existsSync(OUT) ? JSON.parse(readFileSync(OUT, "utf8")) : [];
  const done = new Set(all.map((r) => r.kw));

  for (let i = 0; i < queries.length; i++) {
    const kw = queries[i];
    if (done.has(kw)) continue;
    const r = await probe(page, kw);
    all.push(r);
    console.log(`[${String(i + 1).padStart(2)}/${queries.length}] ${kw.slice(0, 36).padEnd(36)}`
      + ` med=${String(r.pMed ?? "?").padStart(7)} mur=${String(r.wall ?? "?").padStart(2)}`
      + ` retrait=${String(r.pickup ?? 0).padStart(2)}  ${r.verdict ?? (r.blocked ? "BLOQUE" : "?")}`);
    if (all.length % 3 === 0) writeFileSync(OUT, JSON.stringify(all, null, 2), "utf8");
    await sleep(13000);
  }
  writeFileSync(OUT, JSON.stringify(all, null, 2), "utf8");

  const live = all.filter((r) => !r.blocked && !r.error);
  console.log("\n=== SURVIVANTS : mur <= 3 et retrait <= 3 ===");
  const win = live.filter((r) => r.verdict === "A CREUSER").sort((a, b) => a.wall - b.wall || (b.pMed ?? 0) - (a.pMed ?? 0));
  if (!win.length) console.log("aucun");
  for (const r of win) {
    console.log(`mur=${String(r.wall).padStart(2)} retrait=${String(r.pickup).padStart(2)} p25=${String(r.p25).padStart(7)} med=${String(r.pMed).padStart(7)}  ${r.kw}`);
    console.log(`      marchands: ${[...r.chains, ...r.independents].slice(0, 8).join(", ") || "aucun lu"}`);
  }

  console.log("\n=== ELIMINES, par mur croissant ===");
  for (const r of live.filter((r) => r.verdict !== "A CREUSER").sort((a, b) => a.wall - b.wall)) {
    console.log(`mur=${String(r.wall).padStart(2)} retrait=${String(r.pickup).padStart(2)} med=${String(r.pMed ?? "?").padStart(7)}  ${r.kw.slice(0, 38).padEnd(38)} ${[...r.chains, ...r.independents].slice(0, 5).join(", ")}`);
  }
  const bl = all.filter((r) => r.blocked).map((r) => r.kw);
  if (bl.length) console.log(`\nBLOQUEES: ${bl.join(", ")}`);
  console.log(`\njson -> ${OUT}`);
  await browser.close();
})().catch((e) => { console.error("FATAL", e); process.exit(1); });
