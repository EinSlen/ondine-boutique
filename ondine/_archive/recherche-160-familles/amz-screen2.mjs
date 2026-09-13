import puppeteer from "puppeteer-core";
import { writeFileSync, readFileSync, existsSync } from "node:fs";

const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const DIR = "C:\\Users\\Valentin\\Desktop\\Ondine\\recherche";
const PROFILE = "C:\\Users\\Valentin\\AppData\\Local\\Temp\\claude\\C--Users-Valentin\\040a3f1e-6ecb-4f92-b890-48c8510a3f57\\scratchpad\\edge-profile-amz";

const QF = process.argv[2] || "wide-queries.json";
const TAG = process.argv[3] || "wide";
const OUT_JSON = `${DIR}\\${TAG}.json`;
const OUT_CSV = `${DIR}\\${TAG}.csv`;

const BRANDS = [
  // Chinese direct-to-Amazon brands: the third wall. Absent from this list, they read as "0% marques".
  "fnirsi", "revasri", "rojeco", "kentfaith", "ulanzi", "neewer", "andoer", "sunlu", "creality", "elegoo",
  "aoyue", "yihua", "jcd", "tomtop", "apexel", "gtmedia", "topdon", "vevor", "aigostar", "h.koenig",
  "bresser", "celestron", "svbony", "nohawk", "imeter", "mufasha", "downypaws", "petkit", "catlink",
"philips", "ninja", "cosori", "moulinex", "tefal", " seb ", "sodastream", "dyson", "levoit",
  "rowenta", "bosch", "karcher", "kärcher", "xiaomi", "anker", "babyliss", "remington", "braun", "beurer",
  "medisana", "theragun", "hyperice", "epson", "samsung", " lg ", "nikon", "sony", "delonghi", "de'longhi",
  "krups", "russell hobbs", "princess", "proscenic", "roborock", "dreame", "shark", "bissell", "vileda",
  "black+decker", "makita", "einhell", "gardena", "revlon", "ghd", "dreo", "instant pot", "aigostar",
  "h.koenig", "hkoenig", "klarstein", "cecotec", "taurus", "ariete", "nespresso", "hoover", "electrolux",
  "panasonic", "oral-b", "garnier", "l'oreal", "wahl", "andis", "furminator", "kong ", "trixie", "ferplast",
  "catit", "petsafe", "zolux", "nobleza", "dewalt", "milwaukee", "ryobi", "stanley", "facom", "parkside",
  "husqvarna", "stihl", "honda", "ferrex", "intex", "bestway", "zodiac", "dolphin", "abus", "kryptonite",
  "thule", "garmin", "gopro", "dji", "canon", "brother", "hp ", "wacom", "rode ", "shure", "elgato",
  "bose", "jbl", "logitech", "netatmo", "ring ", "eufy", "tp-link", "somfy", "yale", "nuki", "campingaz",
  "coleman", "quechua", "jackery", "ecoflow", "bluetti", "trelock", "aqualung", "silvercrest", "leifheit"];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const parseReviews = (t) => { const m = t.match(/sur\s*5\s*étoiles\s*\(?\s*([\d.,\s]+?)\s*(k|K)?\s*\)/); if (!m) return null; const n = parseFloat(m[1].replace(/\s/g, "").replace(",", ".")); return isNaN(n) ? null : Math.round(m[2] ? n * 1000 : n); };
const parseBought = (t) => { const m = t.match(/(?:Plus de\s*)?([\d\s.,]+)\s*(k|K)?\s*achetés?\s*au cours du mois/i); if (!m) return null; const n = parseFloat(m[1].replace(/[\s.]/g, "").replace(",", ".")); return isNaN(n) ? null : Math.round(m[2] ? n * 1000 : n); };
const parseRating = (t) => { const m = t.match(/([\d],[\d])\s*sur\s*5\s*étoiles/); return m ? parseFloat(m[1].replace(",", ".")) : null; };
const parsePrice = (t) => { const m = t.match(/(\d{1,4})[,.](\d{2})\s*€/); return m ? parseFloat(`${m[1]}.${m[2]}`) : null; };

async function run(page, q, attempt = 1) {
  const url = `https://www.amazon.fr/s?k=${encodeURIComponent(q)}`;
  const res = { query: q, url, blocked: false, items: [] };
  try { const r = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 }); res.status = r ? r.status() : null; }
  catch (e) { res.error = e.message.slice(0, 120); return res; }
  await sleep(3800);
  const data = await page.evaluate(() => {
    const body = document.body ? document.body.innerText : "";
    if (/saisissez les caract|Entrez les caract|Cliquez sur le bouton|Désolé, il faut que/i.test(body.slice(0, 900))) return { blocked: true, cards: [] };
    return { blocked: false, cards: Array.from(document.querySelectorAll('div[data-component-type="s-search-result"]')).slice(0, 26).map((c) => ({
      asin: c.getAttribute("data-asin") || null,
      sponsored: /Sponsoris/i.test(c.innerText.slice(0, 200)),
      title: (() => { const e = c.querySelector('[data-cy="title-recipe"] h2') || c.querySelector("h2"); return e ? e.innerText.replace(/\s+/g, " ").trim() : null; })(),
      priceOff: (() => { const e = c.querySelector(".a-price .a-offscreen"); return e ? e.textContent.trim() : null; })(),
      text: c.innerText.replace(/\s+/g, " ").trim(),
    })) };
  });
  if (data.blocked && attempt < 4) { console.log(`   "${q}" bloque, cooldown ${attempt * 20}s`); await sleep(attempt * 20000); return run(page, q, attempt + 1); }
  res.blocked = data.blocked;
  res.items = data.cards.map((c) => ({
    asin: c.asin, title: c.title, sponsored: c.sponsored,
    price: parsePrice(c.priceOff || "") ?? parsePrice(c.text),
    rating: parseRating(c.text), reviews: parseReviews(c.text), boughtMonth: parseBought(c.text),
  }));
  return res;
}

function summarize(r) {
  const org = r.items.filter((i) => !i.sponsored && i.price != null && i.title);
  const prices = org.map((i) => i.price).sort((a, b) => a - b);
  const pick = (p) => (prices.length ? prices[Math.min(prices.length - 1, Math.floor(prices.length * p))] : null);
  const revs = org.map((i) => i.reviews).filter(Boolean);
  const bought = org.map((i) => i.boughtMonth).filter(Boolean);
  const ratings = org.map((i) => i.rating).filter(Boolean);
  let brand = 0; const names = new Set();
  for (const i of org) { const t = ` ${i.title.toLowerCase()} `; const h = BRANDS.find((b) => t.includes(b)); if (h) { brand++; names.add(h.trim()); } }
  return {
    n: org.length, p25: pick(0.25), med: pick(0.5), p75: pick(0.75),
    reviewsMax: revs.length ? Math.max(...revs) : null,
    boughtSum: bought.reduce((a, b) => a + b, 0),
    avgRating: ratings.length ? +(ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(2) : null,
    brandPct: org.length ? Math.round((100 * brand) / org.length) : null,
    brandNames: [...names].slice(0, 4).join(", "),
  };
}

(async () => {
  const queries = JSON.parse(readFileSync(`${DIR}\\${QF}`, "utf8"));
  const browser = await puppeteer.launch({
    executablePath: EDGE, headless: false, userDataDir: PROFILE,
    defaultViewport: { width: 1420, height: 950 },
    args: ["--lang=fr-FR", "--disable-blink-features=AutomationControlled"],
  });
  const page = await browser.newPage();
  await page.setExtraHTTPHeaders({ "Accept-Language": "fr-FR,fr;q=0.9" });

  const all = existsSync(OUT_JSON) ? JSON.parse(readFileSync(OUT_JSON, "utf8")) : [];
  const done = new Set(all.map((r) => r.query));

  for (let k = 0; k < queries.length; k++) {
    const q = queries[k];
    if (done.has(q)) continue;
    const r = await run(page, q);
    r.summary = summarize(r);
    const s = r.summary;
    console.log(`[${k + 1}/${queries.length}] ${q.slice(0, 32).padEnd(32)} n=${String(s.n).padStart(2)} med=${String(s.med ?? "?").padStart(7)} bought=${String(s.boughtSum).padStart(6)} note=${String(s.avgRating ?? "?").padStart(4)} marq=${String(s.brandPct ?? "?").padStart(3)}%`);
    all.push(r);
    if (all.length % 5 === 0) writeFileSync(OUT_JSON, JSON.stringify(all, null, 2), "utf8");
    await sleep(4500);
  }

  writeFileSync(OUT_JSON, JSON.stringify(all, null, 2), "utf8");
  const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const rows = [["query", "asin", "title", "price", "rating", "reviews", "boughtMonth", "sponsored"].join(",")];
  for (const r of all) for (const i of r.items ?? []) rows.push([r.query, i.asin, i.title, i.price, i.rating, i.reviews, i.boughtMonth, i.sponsored].map(esc).join(","));
  writeFileSync(OUT_CSV, rows.join("\n"), "utf8");

  console.log("\n=== TERRAIN LIBRE : marques < 25%, med >= 60 EUR, note >= 4.2 ===");
  const win = all.filter((r) => (r.summary.brandPct ?? 100) < 25 && (r.summary.med ?? 0) >= 60 && (r.summary.avgRating ?? 0) >= 4.2)
    .sort((a, b) => b.summary.boughtSum - a.summary.boughtSum);
  if (!win.length) console.log("aucun candidat");
  for (const r of win) { const s = r.summary; console.log(`${r.query.slice(0, 34).padEnd(34)} p25=${String(s.p25).padStart(6)} med=${String(s.med).padStart(6)} p75=${String(s.p75).padStart(6)} achats=${String(s.boughtSum).padStart(6)} note=${s.avgRating} marq=${s.brandPct}% avisMax=${s.reviewsMax}`); }

  console.log("\n=== VOLUME BRUT top 20 (tous filtres ignores) ===");
  for (const r of [...all].sort((a, b) => b.summary.boughtSum - a.summary.boughtSum).slice(0, 20)) {
    const s = r.summary;
    console.log(`${r.query.slice(0, 34).padEnd(34)} achats=${String(s.boughtSum).padStart(6)} med=${String(s.med ?? "?").padStart(6)} note=${String(s.avgRating ?? "?").padStart(4)} marq=${String(s.brandPct ?? "?").padStart(3)}% ${s.brandNames}`);
  }
  const blocked = all.filter((r) => r.blocked).map((r) => r.query);
  if (blocked.length) console.log(`\nBLOQUEES (${blocked.length}): ${blocked.join(", ")}`);
  console.log(`\njson -> ${OUT_JSON}`);
  await browser.close();
})().catch((e) => { console.error("FATAL", e); process.exit(1); });
