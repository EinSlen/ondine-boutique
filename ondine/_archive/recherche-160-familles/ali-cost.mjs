/**
 * Landed cost probe on AliExpress: product price + shipping, per warehouse country.
 * The whole Ondine margin model assumes 10 EUR landed. This measures it.
 *
 * node ali-cost.mjs [queriesFile] [tag]
 * node ali-cost.mjs --reparse [tag]   re-runs the parser on stored card text, no browser
 */
import puppeteer from "puppeteer-core";
import { writeFileSync, readFileSync, existsSync, mkdirSync } from "node:fs";

const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const HERE = "C:\\Users\\Valentin\\Desktop\\Ondine\\recherche";
const SCRATCH = "C:\\Users\\Valentin\\AppData\\Local\\Temp\\claude\\C--Users-Valentin\\040a3f1e-6ecb-4f92-b890-48c8510a3f57\\scratchpad";
const PROFILE = `${SCRATCH}\\edge-profile-ali`;
const REPARSE = process.argv[2] === "--reparse";
const QF = (REPARSE ? null : process.argv[2]) || "ali-queries.json";
const TAG = (REPARSE ? process.argv[3] : process.argv[3]) || "ali";
const OUT = `${HERE}\\${TAG}.json`;
const SHOTS = `${HERE}\\shots`;

// Kept as raw class members, not a bracketed class: nesting [..] inside [..] silently breaks.
const SP = "\\s\\u00a0\\u202f";
const SPACES = `[${SP}]`;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const num = (s) => parseFloat(String(s).replace(new RegExp(SPACES, "g"), "").replace(",", "."));

async function dismissOverlays(page) {
  await page.evaluate(() => {
    const kill = (el) => { try { el.click(); } catch { } };
    for (const sel of ["[class*='close'][class*='btn']", "[class*='Modal'] [class*='close']",
      ".btn-close", "[data-role='close']", "[class*='banner'] [class*='close']"]) {
      document.querySelectorAll(sel).forEach(kill);
    }
    const txts = ["refuser les cookies", "accepter les cookies", "plus tard", "ok"];
    document.querySelectorAll("button, div[role=button], a[role=button]").forEach((b) => {
      const t = (b.innerText || "").trim().toLowerCase();
      if (txts.includes(t)) kill(b);
    });
  }).catch(() => { });
}

/** Cards are re-classed constantly; anchor on the item link and read the card's text. */
async function harvest(page) {
  return page.evaluate(() => {
    const seen = new Set();
    const out = [];
    for (const a of document.querySelectorAll("a[href*='/item/']")) {
      const m = (a.getAttribute("href") || "").match(/\/item\/(\d+)\.html/);
      if (!m) continue;
      const id = m[1];
      if (seen.has(id)) continue;

      let card = a;
      for (let i = 0; i < 6 && card.parentElement; i++) {
        card = card.parentElement;
        const t = card.innerText || "";
        if (t.length > 40 && /€/.test(t)) break;
      }
      const text = (card.innerText || "").trim();
      if (!text || !/€/.test(text)) continue;
      seen.add(id);

      const img = card.querySelector("img");
      out.push({
        id,
        url: `https://fr.aliexpress.com/item/${id}.html`,
        text: text.slice(0, 420),
        title: (a.getAttribute("title") || (img && img.getAttribute("alt")) || text.split("\n")[0] || "").slice(0, 160),
      });
    }
    return out;
  });
}

/**
 * Cards are line-oriented: title / price / [struck compareAt] / [-x%] / rating / N vendus / ...
 * Parsing must stay line-scoped. Scanning the whole blob picks the "0,34EUR economises"
 * discount line as the price, and welds "5\n84 vendus" into 584.
 */
const PRICE_LINE = new RegExp(`^(\\d{1,3}(?:${SPACES}\\d{3})*),(\\d{2})${SPACES}*€$`);
const SOLD_LINE = new RegExp(`^(?:[1-5][.,]\\d${SPACES}*\\|?${SPACES}*)?(\\d[\\d${SP}.,]*?)${SPACES}*\\+?${SPACES}*(?:vendus|vendu|commandes|sold|orders)\\b`, "i");
const NOISE = /économis|economis|réduction|reduction|coupon|rabais|cashback/i;

function parseCard(c) {
  const lines = c.text.split("\n").map((s) => s.trim()).filter(Boolean);
  const low = c.text.toLowerCase();

  const priced = [];
  for (const l of lines) {
    if (NOISE.test(l)) continue;
    const m = l.match(PRICE_LINE);
    if (m) priced.push(parseFloat(`${m[1].replace(new RegExp(SPACES, "g"), "")}.${m[2]}`));
  }
  const price = priced.length ? priced[0] : null;
  const compareAt = priced.length > 1 && priced[1] > priced[0] ? priced[1] : null;

  let shipping = null;
  if (/livraison gratuite|free shipping|expédition gratuite/i.test(low)) shipping = 0;
  else {
    for (const l of lines) {
      const s = l.match(/(?:livraison|exp[ée]dition|shipping)[^\d€]{0,24}(\d{1,3}),(\d{2})\s*€/i)
        || l.match(/^\+\s*(\d{1,3}),(\d{2})\s*€/);
      if (s) { shipping = parseFloat(`${s[1]}.${s[2]}`); break; }
    }
  }

  let sold = null;
  for (const l of lines) {
    const m = l.match(SOLD_LINE);
    if (m) { sold = Math.round(num(m[1])); break; }
  }
  let rating = null;
  for (const l of lines) {
    const m = l.match(/^([1-5][.,]\d)(?:\s*\||\s*$)/);
    if (m) { rating = num(m[1]); break; }
  }

  const title = c.title.replace(/^(?:Promo|Marque\+|Pub|Choice)\s*/gi, "").trim();
  // Order matters: "Filtre pour fontaine a eau" is a filter, not a fountain.
  const isFeeder = /mangeoire|nourriture|croquette|feeder|2\s*en\s*1/i.test(title);
  const isBottle = /bouteille|portable|voyage|promenade|nomade|de marche/i.test(title);
  const isFilter = /^.{0,40}\b(filtres?|cartouches?|éponges?)\b/i.test(title) || /de remplacement/i.test(title);
  const isFountain = /fontaine|fountain|abreuvoir|distributeur d'eau|water dispenser/i.test(title);

  return {
    id: c.id, url: c.url, text: c.text, title,
    price, compareAt, shipping,
    landed: price != null && shipping != null ? Math.round((price + shipping) * 100) / 100 : null,
    sold, rating,
    freeShip: shipping === 0,
    choice: /\bchoice\b/i.test(low),
    ad: lines.includes("Pub"),
    kind: isFeeder ? "mangeoire" : isBottle ? "bouteille" : isFilter ? "filtre" : isFountain ? "fontaine" : "autre",
  };
}

async function probe(page, q) {
  const url = `https://fr.aliexpress.com/w/wholesale-${encodeURIComponent(q.kw).replace(/%20/g, "-")}.html`
    + `?g=y&SearchText=${encodeURIComponent(q.kw)}`
    + (q.ship ? `&shipFromCountry=${q.ship}` : "")
    + (q.sort ? `&SortType=${q.sort}` : "");

  const rec = { ...q, url, items: [] };
  try {
    const r = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
    rec.status = r ? r.status() : null;
  } catch (e) { rec.error = e.message.slice(0, 140); return rec; }

  await sleep(3500);
  await dismissOverlays(page);
  await sleep(1200);

  for (let i = 0; i < 5; i++) {
    await page.evaluate(() => window.scrollBy(0, 1400));
    await sleep(1300);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await sleep(900);

  const body = await page.evaluate(() => (document.body ? document.body.innerText : "").slice(0, 600));
  if (/robot|captcha|verify|slider/i.test(body) && body.length < 400) rec.blocked = true;

  const raw = await harvest(page);
  rec.items = raw.map(parseCard).filter((x) => x.price != null);
  rec.count = rec.items.length;

  try {
    mkdirSync(SHOTS, { recursive: true });
    await page.screenshot({ path: `${SHOTS}\\${q.tag}.png`, fullPage: false });
  } catch { }
  return rec;
}

function stats(items, key) {
  const v = items.map((i) => i[key]).filter((x) => x != null).sort((a, b) => a - b);
  if (!v.length) return null;
  const p = (q) => v[Math.min(v.length - 1, Math.floor(v.length * q))];
  return { n: v.length, min: v[0], p25: p(0.25), med: p(0.5), p75: p(0.75), max: v[v.length - 1] };
}

const eur = (x) => (x == null ? "?" : x.toFixed(2));

function report(all) {
  const real = (r) => r.items.filter((i) => !i.ad && ["fontaine","filtre"].includes(i.kind));

  console.log("\n=== PRIX RENDU, cartes pertinentes, hors pub et hors mangeoires ===");
  console.log("tag                        n   min     p25     med     p75    portGratuit");
  for (const r of all) {
    const it = real(r);
    const s = stats(it, "landed");
    if (!s) { console.log(`${r.tag.padEnd(24)} aucune carte exploitable`); continue; }
    const free = it.filter((i) => i.freeShip).length;
    console.log(`${r.tag.padEnd(24)} ${String(s.n).padStart(3)} ${eur(s.min).padStart(7)} ${eur(s.p25).padStart(7)} ${eur(s.med).padStart(7)} ${eur(s.p75).padStart(7)}    ${free}/${it.length}`);
  }

  console.log("\n=== FONTAINES CREDIBLES : >=200 ventes, note >=4.5, port compris ===");
  const pool = all.flatMap((r) => real(r).filter((i) => i.kind === "fontaine").map((i) => ({ ...i, tag: r.tag })))
    .filter((i) => i.landed != null && (i.sold ?? 0) >= 200 && (i.rating ?? 0) >= 4.5);
  const byId = new Map();
  for (const i of pool) if (!byId.has(i.id) || byId.get(i.id).landed > i.landed) byId.set(i.id, i);
  const best = [...byId.values()].sort((a, b) => a.landed - b.landed);
  for (const i of best.slice(0, 14)) {
    console.log(`${eur(i.landed).padStart(7)} EUR  ${String(i.sold).padStart(6)} vendus  ${String(i.rating).padStart(3)}*  ${i.tag.padEnd(18)} ${i.title.slice(0, 58)}`);
  }
  if (!best.length) console.log("aucune");

  console.log("\n=== FILTRES (recharges) ===");
  const filt = all.flatMap((r) => real(r).filter((i) => i.kind === "filtre").map((i) => ({ ...i, tag: r.tag })))
    .filter((i) => i.landed != null && (i.sold ?? 0) >= 200)
    .sort((a, b) => a.landed - b.landed);
  for (const i of filt.slice(0, 8)) {
    console.log(`${eur(i.landed).padStart(7)} EUR  ${String(i.sold).padStart(6)} vendus  ${i.title.slice(0, 66)}`);
  }

  console.log("\n=== VERDICT MARGE, hypothese du plan = 10.00 EUR rendu ===");
  const fountains = best.filter((i) => i.landed >= 8);
  const s = stats(fountains, "landed");
  if (s) {
    console.log(`fontaine credible la moins chere : ${eur(s.min)} EUR rendu`);
    console.log(`mediane des fontaines credibles  : ${eur(s.med)} EUR rendu`);
    for (const [label, cost] of [["le moins cher", s.min], ["la mediane", s.med]]) {
      const pv = 34.9, pack = 44.9;
      const tx = (p) => Math.round((p / 1.0) * 0.029 * 100) / 100 + 0.25;
      const mSolo = pv - cost - tx(pv);
      const mPack = pack - cost - 3 * 1.0 - tx(pack);
      console.log(`  ${label.padEnd(14)} cout=${eur(cost)}  marge solo 34,90=${eur(mSolo)}  marge pack 44,90=${eur(mPack)}  CPA max solo=${eur(mSolo)}`);
    }
  }
}

(async () => {
  if (REPARSE) {
    const all = JSON.parse(readFileSync(OUT, "utf8"));
    for (const r of all) r.items = (r.items || []).map(parseCard).filter((x) => x.price != null);
    writeFileSync(OUT, JSON.stringify(all, null, 2), "utf8");
    report(all);
    console.log(`\njson -> ${OUT}`);
    return;
  }

  const queries = JSON.parse(readFileSync(`${HERE}\\${QF}`, "utf8"));
  const browser = await puppeteer.launch({
    executablePath: EDGE, headless: false, userDataDir: PROFILE,
    defaultViewport: { width: 1500, height: 1150 },
    args: ["--lang=fr-FR", "--disable-blink-features=AutomationControlled"],
  });
  const page = await browser.newPage();
  await page.setExtraHTTPHeaders({ "Accept-Language": "fr-FR,fr;q=0.9" });

  const all = existsSync(OUT) ? JSON.parse(readFileSync(OUT, "utf8")) : [];
  const done = new Set(all.map((r) => r.tag));

  for (let i = 0; i < queries.length; i++) {
    const q = queries[i];
    if (done.has(q.tag)) continue;
    const r = await probe(page, q);
    all.push(r);
    const s = stats(r.items.filter((x) => !x.ad && x.kind === "fontaine"), "landed");
    console.log(`[${i + 1}/${queries.length}] ${q.tag.padEnd(24)} n=${String(r.count ?? 0).padStart(3)}`
      + ` fontaines rendu med=${eur(s ? s.med : null).padStart(7)}${r.blocked ? "  BLOQUE" : ""}${r.error ? "  " + r.error : ""}`);
    writeFileSync(OUT, JSON.stringify(all, null, 2), "utf8");
    await sleep(6000);
  }

  report(all);
  console.log(`\njson -> ${OUT}\ncaptures -> ${SHOTS}`);
  await browser.close();
})().catch((e) => { console.error("FATAL", e); process.exit(1); });
