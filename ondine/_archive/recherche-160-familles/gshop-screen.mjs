import puppeteer from "puppeteer-core";
import { writeFileSync, readFileSync, existsSync } from "node:fs";

const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const DIR = "C:\\Users\\Valentin\\Desktop\\Ondine\\recherche";
const PROFILE = "C:\\Users\\Valentin\\AppData\\Local\\Temp\\claude\\C--Users-Valentin\\040a3f1e-6ecb-4f92-b890-48c8510a3f57\\scratchpad\\edge-profile-goog";
const QF = process.argv[2] || "gshop-queries.json";
const TAG = process.argv[3] || "gshop";
const OUT = `${DIR}\\${TAG}.json`;

// French physical retail chains + marketplaces = the real competitive wall
const CHAINS = ["norauto", "feu vert", "feuvert", "carter-cash", "cartercash", "roady", "leclerc", "lidl",
  "castorama", "leroy merlin", "leroymerlin", "decathlon", "boulanger", "darty", "action.com", "gifi",
  "maxi zoo", "maxizoo", "animalis", "truffaut", "jardiland", "bricomarch", "bricorama", "intermarch",
  "carrefour", "auchan", "conforama", "ikea", "weldom", "mr.bricolage", "botanic", "gamm vert", "gammvert",
  "zooplus", "wanimo", "sephora", "marionnaud", "nocibe", "decitre", "cultura", "fnac", "picwictoys",
  "kiabi", "vertbaudet", "nature et decouvertes", "oscaro", "mister-auto", "yakarouler", "espace-cuisine"];
const MARKETPLACES = ["amazon", "aliexpress", "temu", "cdiscount", "manomano", "rakuten", "ebay", "shein", "back market", "wish"];

// specialist online retailers + category brands: the real moat inside a passion niche
const SPECIALISTS = [
  // ongle / prothesie
  "peggy sage", "nailish", "beautycoiffure", "nail-shop", "nailshop", "mavala", "semilac", "nded",
  "crystal nails", "indigo nails", "kiara sky", "gelish", "lechat", "staleks", "marathon", "sunone",
  "purenails", "boutique-ongles", "prostynails", "moyra", "lilas nails",
  // barbier / coiffure
  "barber dts", "barberdts", "monsieur barbier", "wahl", "andis", "babyliss", "moser", "jrl", "stylecraft",
  "gamma+", "barberstore", "coiffureandnature", "sinelco", "olivia garden",
  // tatouage
  "killer ink", "killerink", "cheyenne", "bishop", "critical", "inkjecta", "dragonhawk", "mast ",
  "ambition", "tattoo-shop", "tatouage-shop", "worldtattoo", "eikon",
  // peche
  "pacific peche", "pacificpeche", "top-fishing", "topfishing", "leurredelamer", "meme-peche",
  "shimano", "daiwa", "penn ", "okuma", "rapala",
  // aquario
  "aquarium systems", "zoanthus", "tropical", "aquaplante", "aquariofil", "red sea", "tunze", "eheim",
  // patisserie
  "cerf dellier", "cerfdellier", "meilleurduchef", "cuisineaddict", "scrapcooking", "patisdecor", "silikomart",
  // imagerie thermique
  "flir", "seek thermal", "hikmicro", "infiray", "topdon", "uni-t", "uni trend",
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

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

async function probe(page, kw, attempt = 1) {
  const out = { kw, url: `https://www.google.fr/search?q=${encodeURIComponent(kw)}&hl=fr&gl=fr`, blocked: false };
  try { const r = await page.goto(out.url, { waitUntil: "domcontentloaded", timeout: 40000 }); out.status = r ? r.status() : null; }
  catch (e) { out.error = e.message.slice(0, 110); return out; }
  await sleep(2600);
  await killConsent(page);
  await sleep(1200);
  await page.evaluate(() => window.scrollBy(0, 700));
  await sleep(1800);

  const d = await page.evaluate(() => {
    const body = document.body ? document.body.innerText : "";
    if (/pas un robot|trafic inhabituel|unusual traffic/i.test(body.slice(0, 700))) return { blocked: true, body: "" };
    return { blocked: false, body };
  });

  if (d.blocked) {
    if (attempt < 3) { console.log(`   "${kw}" bloque, pause ${attempt * 30}s`); await sleep(attempt * 30000); return probe(page, kw, attempt + 1); }
    out.blocked = true; return out;
  }

  const body = d.body;
  const low = body.toLowerCase();

  // all prices on the page (Shopping block dominates the top)
  const prices = [...body.matchAll(/(\d{1,4})[,.](\d{2})\s*€/g)]
    .map((m) => parseFloat(`${m[1]}.${m[2]}`))
    .filter((p) => p >= 5 && p <= 3000);
  prices.sort((a, b) => a - b);
  const pick = (q) => (prices.length ? prices[Math.min(prices.length - 1, Math.floor(prices.length * q))] : null);

  out.chainsFound = CHAINS.filter((c) => low.includes(c));
  out.marketplacesFound = MARKETPLACES.filter((c) => low.includes(c));
  out.specialistsFound = SPECIALISTS.filter((c) => low.includes(c));
  out.priceCount = prices.length;
  out.pMin = prices[0] ?? null;
  out.p25 = pick(0.25);
  out.pMed = pick(0.5);
  out.p75 = pick(0.75);
  out.hasShopping = /Sponsoris|Sélection de produits|En magasin|Retrait/i.test(body);
  out.pickupSignals = (body.match(/Retrait|En magasin/gi) || []).length;
  return out;
}

(async () => {
  const queries = JSON.parse(readFileSync(`${DIR}\\${QF}`, "utf8"));
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
    console.log(`[${i + 1}/${queries.length}] ${kw.slice(0, 34).padEnd(34)} med=${String(r.pMed ?? "?").padStart(7)} chaines=${String((r.chainsFound || []).length).padStart(2)} spec=${String((r.specialistsFound || []).length).padStart(2)} retrait=${String(r.pickupSignals ?? 0).padStart(2)} | ${(r.specialistsFound || []).slice(0, 5).join(",")}`);
    if (all.length % 4 === 0) writeFileSync(OUT, JSON.stringify(all, null, 2), "utf8");
    await sleep(7000);
  }
  writeFileSync(OUT, JSON.stringify(all, null, 2), "utf8");

  const wall = (r) => (r.chainsFound || []).length + (r.specialistsFound || []).length;

  console.log("\n=== TERRAIN LIBRE REEL : mur total <= 2, prix median >= 60 EUR ===");
  const win = all.filter((r) => !r.blocked && wall(r) <= 2 && (r.pMed ?? 0) >= 60)
    .sort((a, b) => wall(a) - wall(b) || (b.pMed ?? 0) - (a.pMed ?? 0));
  if (!win.length) console.log("aucun candidat");
  for (const r of win) console.log(`mur=${String(wall(r)).padStart(2)}  ${r.kw.slice(0, 34).padEnd(34)} p25=${String(r.p25).padStart(7)} med=${String(r.pMed).padStart(7)} p75=${String(r.p75).padStart(7)}`);

  console.log("\n=== TOUS, par mur concurrentiel total (chaines + specialistes) ===");
  for (const r of [...all].filter((r) => !r.blocked).sort((a, b) => wall(a) - wall(b))) {
    console.log(`mur=${String(wall(r)).padStart(2)} (${String((r.chainsFound || []).length).padStart(2)}ch+${String((r.specialistsFound || []).length).padStart(2)}sp)  ${r.kw.slice(0, 34).padEnd(34)} med=${String(r.pMed ?? "?").padStart(7)} retrait=${String(r.pickupSignals ?? 0).padStart(2)}  ${[...(r.chainsFound || []), ...(r.specialistsFound || [])].slice(0, 6).join(", ")}`);
  }
  const bl = all.filter((r) => r.blocked).map((r) => r.kw);
  if (bl.length) console.log(`\nBLOQUEES: ${bl.join(", ")}`);
  console.log(`\njson -> ${OUT}`);
  await browser.close();
})().catch((e) => { console.error("FATAL", e); process.exit(1); });
