import puppeteer from "puppeteer-core";
import { writeFileSync, readFileSync } from "node:fs";

const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const DIR = "C:\\Users\\Valentin\\Desktop\\Ondine\\recherche";
const PROFILE = "C:\\Users\\Valentin\\AppData\\Local\\Temp\\claude\\C--Users-Valentin\\040a3f1e-6ecb-4f92-b890-48c8510a3f57\\scratchpad\\edge-profile-amz";

const QUERIES_FILE = process.argv[2] || `${DIR}\\screen-queries.json`;
const TAG = process.argv[3] || "screen";
const OUT_JSON = `${DIR}\\${TAG}.json`;
const OUT_CSV = `${DIR}\\${TAG}.csv`;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const parseReviews = (t) => {
  const m = t.match(/sur\s*5\s*étoiles\s*\(?\s*([\d.,\s]+?)\s*(k|K)?\s*\)/);
  if (!m) return null;
  let n = parseFloat(m[1].replace(/\s/g, "").replace(",", "."));
  return isNaN(n) ? null : Math.round(m[2] ? n * 1000 : n);
};
const parseBought = (t) => {
  const m = t.match(/(?:Plus de\s*)?([\d\s.,]+)\s*(k|K)?\s*achetés?\s*au cours du mois/i);
  if (!m) return null;
  let n = parseFloat(m[1].replace(/[\s.]/g, "").replace(",", "."));
  return isNaN(n) ? null : Math.round(m[2] ? n * 1000 : n);
};
const parseRating = (t) => { const m = t.match(/([\d],[\d])\s*sur\s*5\s*étoiles/); return m ? parseFloat(m[1].replace(",", ".")) : null; };
const parsePrice = (t) => { const m = t.match(/(\d{1,4})[,.](\d{2})\s*€/); return m ? parseFloat(`${m[1]}.${m[2]}`) : null; };

async function run(page, q, attempt = 1) {
  const url = `https://www.amazon.fr/s?k=${encodeURIComponent(q)}`;
  const res = { query: q, url, blocked: false, items: [] };
  try { const r = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 }); res.status = r ? r.status() : null; }
  catch (e) { res.error = e.message.slice(0, 120); return res; }
  await sleep(4000);

  const data = await page.evaluate(() => {
    const body = document.body ? document.body.innerText : "";
    if (/saisissez les caract|Entrez les caract|Cliquez sur le bouton|Désolé, il faut que/i.test(body.slice(0, 900)))
      return { blocked: true, cards: [] };
    return {
      blocked: false,
      cards: Array.from(document.querySelectorAll('div[data-component-type="s-search-result"]')).slice(0, 26).map((c) => ({
        asin: c.getAttribute("data-asin") || null,
        sponsored: /Sponsoris/i.test(c.innerText.slice(0, 200)),
        title: (() => { const e = c.querySelector('[data-cy="title-recipe"] h2') || c.querySelector("h2"); return e ? e.innerText.replace(/\s+/g, " ").trim() : null; })(),
        priceOff: (() => { const e = c.querySelector(".a-price .a-offscreen"); return e ? e.textContent.trim() : null; })(),
        text: c.innerText.replace(/\s+/g, " ").trim(),
      })),
    };
  });

  if (data.blocked && attempt < 3) { console.log(`  "${q}" blocked, cooldown then retry`); await sleep(20000); return run(page, q, attempt + 1); }

  res.blocked = data.blocked;
  res.items = data.cards.map((c) => ({
    asin: c.asin, title: c.title, sponsored: c.sponsored,
    price: parsePrice(c.priceOff || "") ?? parsePrice(c.text),
    rating: parseRating(c.text), reviews: parseReviews(c.text), boughtMonth: parseBought(c.text),
  }));
  return res;
}

(async () => {
  const queries = JSON.parse(readFileSync(QUERIES_FILE, "utf8"));
  const browser = await puppeteer.launch({
    executablePath: EDGE, headless: false, userDataDir: PROFILE,
    defaultViewport: { width: 1420, height: 950 },
    args: ["--lang=fr-FR", "--disable-blink-features=AutomationControlled"],
  });
  const page = await browser.newPage();
  await page.setExtraHTTPHeaders({ "Accept-Language": "fr-FR,fr;q=0.9" });

  const all = [];
  for (const q of queries) {
    const r = await run(page, q);
    const org = r.items.filter((i) => !i.sponsored && i.price != null);
    const prices = org.map((i) => i.price).sort((a, b) => a - b);
    const revs = org.map((i) => i.reviews).filter(Boolean);
    const bought = org.map((i) => i.boughtMonth).filter(Boolean);
    const ratings = org.map((i) => i.rating).filter(Boolean);
    const pick = (p) => (prices.length ? prices[Math.min(prices.length - 1, Math.floor(prices.length * p))] : null);
    r.summary = {
      n: org.length, p25: pick(0.25), med: pick(0.5), p75: pick(0.75),
      reviewsMax: revs.length ? Math.max(...revs) : null,
      boughtSum: bought.reduce((a, b) => a + b, 0),
      avgRating: ratings.length ? +(ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(2) : null,
      // does the price band clear a ~35 EUR CPA with >=2x contribution?
      adsViable: pick(0.5) != null && pick(0.5) >= 70,
    };
    const s = r.summary;
    console.log(`${q.slice(0, 34).padEnd(34)} n=${String(s.n).padStart(2)} med=${String(s.med ?? "?").padStart(7)}E bought=${String(s.boughtSum).padStart(6)} rate=${s.avgRating ?? "?"} ${s.adsViable ? "ADS-OK" : ""}`);
    all.push(r);
    await sleep(5000);
  }

  writeFileSync(OUT_JSON, JSON.stringify(all, null, 2), "utf8");
  const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const rows = [["query", "asin", "title", "price", "rating", "reviews", "boughtMonth", "sponsored"].join(",")];
  for (const r of all) for (const i of r.items) rows.push([r.query, i.asin, i.title, i.price, i.rating, i.reviews, i.boughtMonth, i.sponsored].map(esc).join(","));
  writeFileSync(OUT_CSV, rows.join("\n"), "utf8");

  // ranked: needs price >=70 AND volume AND rating >=4.3
  console.log("\n=== CLASSEMENT (prix >= 70 EUR, note >= 4.3, trie par volume) ===");
  const ranked = all.filter((r) => r.summary.adsViable && (r.summary.avgRating ?? 0) >= 4.3)
    .sort((a, b) => b.summary.boughtSum - a.summary.boughtSum);
  if (!ranked.length) console.log("aucune requete ne passe les trois filtres");
  for (const r of ranked) {
    const s = r.summary;
    console.log(`${r.query.slice(0, 36).padEnd(36)} p25=${String(s.p25).padStart(6)} med=${String(s.med).padStart(6)} p75=${String(s.p75).padStart(6)} bought=${String(s.boughtSum).padStart(6)} note=${s.avgRating} avisMax=${s.reviewsMax}`);
  }
  console.log("\n=== VOLUME BRUT, tous prix confondus ===");
  for (const r of [...all].sort((a, b) => b.summary.boughtSum - a.summary.boughtSum).slice(0, 12)) {
    const s = r.summary;
    console.log(`${r.query.slice(0, 36).padEnd(36)} bought=${String(s.boughtSum).padStart(6)} med=${String(s.med ?? "?").padStart(6)}E note=${s.avgRating ?? "?"}`);
  }
  console.log(`\njson -> ${OUT_JSON}\ncsv  -> ${OUT_CSV}`);
  await browser.close();
})().catch((e) => { console.error("FATAL", e); process.exit(1); });
