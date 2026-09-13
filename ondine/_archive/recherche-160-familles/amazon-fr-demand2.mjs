import puppeteer from "puppeteer-core";
import { writeFileSync } from "node:fs";

const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const DIR = "C:\\Users\\Valentin\\Desktop\\Ondine\\recherche";
const PROFILE = "C:\\Users\\Valentin\\AppData\\Local\\Temp\\claude\\C--Users-Valentin\\040a3f1e-6ecb-4f92-b890-48c8510a3f57\\scratchpad\\edge-profile-amz";
const OUT_JSON = `${DIR}\\amz-fr-demand2.json`;
const OUT_CSV = `${DIR}\\amz-fr-demand2.csv`;

const QUERIES = [
  "aspirateur toilettage chien",
  "pulseur souffleur chien",
  "tondeuse chien professionnelle",
  "kit toilettage chien",
  "brosse chien poils morts",
  "coupe griffes chien electrique",
  "nettoyeur pattes chien",
  "tapis rafraichissant chien",
  "fontaine a eau chat",
  "tapis de lechage chien",
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// "1 234" | "3,4 k" | "12 k"  -> integer
function parseReviews(txt) {
  // the count sits in parentheses right after "X,Y sur 5 étoiles"
  const m = txt.match(/sur\s*5\s*étoiles\s*\(?\s*([\d.,\s]+?)\s*(k|K)?\s*\)/);
  if (!m) return null;
  let n = parseFloat(m[1].replace(/\s/g, "").replace(",", "."));
  if (isNaN(n)) return null;
  if (m[2]) n *= 1000;
  return Math.round(n);
}

function parseBought(txt) {
  // "Plus de 100 achetés au cours du mois dernier" / "50 achetés au cours du mois dernier"
  const m = txt.match(/(?:Plus de\s*)?([\d\s.,]+)\s*(k|K)?\s*achetés?\s*au cours du mois/i);
  if (!m) return null;
  let n = parseFloat(m[1].replace(/[\s.]/g, "").replace(",", "."));
  if (isNaN(n)) return null;
  if (m[2]) n *= 1000;
  return Math.round(n);
}

function parseRating(txt) {
  const m = txt.match(/([\d],[\d])\s*sur\s*5\s*étoiles/);
  return m ? parseFloat(m[1].replace(",", ".")) : null;
}

function parsePrice(txt) {
  // first "NN,NN €" occurrence in the card
  const m = txt.match(/(\d{1,4})[,.](\d{2})\s*€/);
  return m ? parseFloat(`${m[1]}.${m[2]}`) : null;
}

async function searchQuery(page, q, attempt = 1) {
  const url = `https://www.amazon.fr/s?k=${encodeURIComponent(q)}`;
  const res = { query: q, url, status: null, blocked: false, items: [] };
  try {
    const resp = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
    res.status = resp ? resp.status() : null;
  } catch (e) {
    res.error = e.message.slice(0, 140);
    return res;
  }
  await sleep(4000);

  const data = await page.evaluate(() => {
    const body = document.body ? document.body.innerText : "";
    if (/saisissez les caract|Entrez les caract|Cliquez sur le bouton|Désolé, il faut que/i.test(body.slice(0, 900))) {
      return { blocked: true, cards: [] };
    }
    const cards = Array.from(document.querySelectorAll('div[data-component-type="s-search-result"]'));
    return {
      blocked: false,
      cards: cards.slice(0, 26).map((c) => ({
        asin: c.getAttribute("data-asin") || null,
        sponsored: /Sponsoris/i.test(c.innerText.slice(0, 200)),
        titleGuess: (() => {
          const e = c.querySelector('[data-cy="title-recipe"] h2') || c.querySelector("h2");
          return e ? e.innerText.replace(/\s+/g, " ").trim() : null;
        })(),
        priceOff: (() => { const e = c.querySelector(".a-price .a-offscreen"); return e ? e.textContent.trim() : null; })(),
        text: c.innerText.replace(/\s+/g, " ").trim(),
      })),
    };
  });

  if (data.blocked && attempt < 3) {
    console.log(`  "${q}" blocked, retry ${attempt + 1} after cooldown`);
    await sleep(15000);
    return searchQuery(page, q, attempt + 1);
  }

  res.blocked = data.blocked;
  res.items = data.cards.map((c) => ({
    asin: c.asin,
    title: c.titleGuess,
    sponsored: c.sponsored,
    price: parsePrice(c.priceOff || "") ?? parsePrice(c.text),
    rating: parseRating(c.text),
    reviews: parseReviews(c.text),
    boughtMonth: parseBought(c.text),
  }));
  return res;
}

(async () => {
  const browser = await puppeteer.launch({
    executablePath: EDGE, headless: false, userDataDir: PROFILE,
    defaultViewport: { width: 1420, height: 950 },
    args: ["--lang=fr-FR", "--disable-blink-features=AutomationControlled"],
  });
  const page = await browser.newPage();
  await page.setExtraHTTPHeaders({ "Accept-Language": "fr-FR,fr;q=0.9" });

  const all = [];
  for (const q of QUERIES) {
    const r = await searchQuery(page, q);
    const org = r.items.filter((i) => !i.sponsored && i.price != null);
    const prices = org.map((i) => i.price).sort((a, b) => a - b);
    const revs = org.map((i) => i.reviews).filter((n) => n != null);
    const bought = org.map((i) => i.boughtMonth).filter((n) => n != null);
    r.summary = {
      organic: org.length,
      medianPrice: prices.length ? prices[Math.floor(prices.length / 2)] : null,
      p25: prices.length ? prices[Math.floor(prices.length * 0.25)] : null,
      p75: prices.length ? prices[Math.floor(prices.length * 0.75)] : null,
      reviewsTotal: revs.reduce((a, b) => a + b, 0),
      reviewsMax: revs.length ? Math.max(...revs) : null,
      boughtTotal: bought.reduce((a, b) => a + b, 0),
      boughtMax: bought.length ? Math.max(...bought) : null,
      withBought: bought.length,
      avgRating: (() => { const rr = org.map(i => i.rating).filter(Boolean); return rr.length ? +(rr.reduce((a,b)=>a+b,0)/rr.length).toFixed(2) : null; })(),
    };
    const s = r.summary;
    console.log(`${q.padEnd(32)} blocked=${r.blocked} n=${s.organic} med=${s.medianPrice ?? "?"}E revMax=${s.reviewsMax ?? "?"} boughtSum=${s.boughtTotal} rating=${s.avgRating ?? "?"}`);
    all.push(r);
    await sleep(5000);
  }

  writeFileSync(OUT_JSON, JSON.stringify(all, null, 2), "utf8");
  const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const rows = [["query","asin","title","price","rating","reviews","boughtMonth","sponsored"].join(",")];
  for (const r of all) for (const i of r.items) rows.push([r.query,i.asin,i.title,i.price,i.rating,i.reviews,i.boughtMonth,i.sponsored].map(esc).join(","));
  writeFileSync(OUT_CSV, rows.join("\n"), "utf8");

  console.log("\n=== TABLEAU FINAL (organique seulement) ===");
  console.log("requete".padEnd(32), "P25".padStart(7), "MED".padStart(7), "P75".padStart(7), "avisMax".padStart(9), "achats/mois".padStart(12), "note".padStart(6));
  for (const r of all) {
    const s = r.summary;
    console.log(r.query.padEnd(32),
      String(s.p25 ?? "?").padStart(7), String(s.medianPrice ?? "?").padStart(7), String(s.p75 ?? "?").padStart(7),
      String(s.reviewsMax ?? "?").padStart(9), String(s.boughtTotal || "?").padStart(12), String(s.avgRating ?? "?").padStart(6));
  }
  console.log(`\njson -> ${OUT_JSON}\ncsv  -> ${OUT_CSV}`);
  await browser.close();
})().catch((e) => { console.error("FATAL", e); process.exit(1); });
