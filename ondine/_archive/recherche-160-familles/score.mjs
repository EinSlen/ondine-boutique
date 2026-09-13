/**
 * Final scoring for a hunt wave. Reads whatever Amazon and Alibaba results exist and ranks
 * families on the only ratio that decides: FLOOR price over landed cost.
 *
 * Using the median was the mistake that kept the soldering station alive one stage too long.
 * The floor (p25) is what a customer actually finds in ten seconds on Amazon, so it is the
 * ceiling on any selling price.
 *
 * node score.mjs <amazonResults.json> [alibabaResults.json]
 */
import { readFileSync, existsSync } from "node:fs";

const HERE = "C:\\Users\\Valentin\\Desktop\\Ondine\\recherche";
const AMZ = process.argv[2];
const BABA = process.argv[3];

const VAT = 0.20, DUTY = 0.035, AIR_KG = 6.50, CPA = 16, KG = 0.5;
const FEE = (p) => p * 0.014 + 0.25;
const r2 = (x) => Math.round(x * 100) / 100;
const landed = (unit, kg = KG) => r2((unit + AIR_KG * kg) * (1 + DUTY) * (1 + VAT));

if (!AMZ || !existsSync(`${HERE}\\${AMZ}`)) {
  console.error(`usage: node score.mjs <amazonResults.json> [alibabaResults.json]`);
  process.exit(1);
}

const STOP = new Set(["pour", "avec", "sans", "des", "les", "une", "los", "the", "and", "for", "with", "professionnel",
  "professionnelle", "portable", "numerique", "numérique", "digital", "kit", "set", "haute", "grande", "petit"]);
const sig = (t) => new Set((t || "").toLowerCase().replace(/[^a-zà-ÿ0-9 ]/g, " ").split(/\s+/)
  .filter((w) => w.length > 3 && !STOP.has(w)).slice(0, 8));
const jaccard = (a, b) => {
  if (!a.size || !b.size) return 0;
  let inter = 0;
  for (const x of a) if (b.has(x)) inter++;
  return inter / (a.size + b.size - inter);
};

/**
 * Saturation: how many organic listings are near-clones of each other. On "niveau laser
 * rotatif" ten listings shared the same generic Chinese product and the price had already
 * converged to cost plus a thin margin. High saturation means the arbitrage is already done.
 */
function saturation(items) {
  const t = items.filter((i) => !i.sponsored && i.title).map((i) => sig(i.title));
  if (t.length < 4) return null;
  let pairs = 0, clones = 0;
  for (let i = 0; i < t.length; i++) for (let j = i + 1; j < t.length; j++) { pairs++; if (jaccard(t[i], t[j]) >= 0.5) clones++; }
  return pairs ? Math.round((100 * clones) / pairs) : null;
}

/**
 * Where the volume actually sits. On "etiqueteuse industrielle" the p25 floor read 69,99 EUR
 * while 2000 of the monthly purchases were a DYMO at 25,88 EUR. The price carrying the
 * demand is the real reference, not the quartile.
 */
function volumePrice(items) {
  const org = (items || []).filter((i) => !i.sponsored && i.price != null && i.boughtMonth);
  if (!org.length) return null;
  const top = org.sort((a, b) => b.boughtMonth - a.boughtMonth)[0];
  return { price: top.price, bought: top.boughtMonth, title: (top.title || "").slice(0, 44) };
}

const amz = JSON.parse(readFileSync(`${HERE}\\${AMZ}`, "utf8"));
const rows = [];
for (const r of amz) {
  const s = r.summary;
  if (!s || s.med == null) continue;
  const vp = volumePrice(r.items);
  rows.push({
    kw: r.query,
    floor: s.p25, med: s.med, p75: s.p75,
    demand: s.boughtSum ?? 0,
    brand: s.brandPct ?? 0,
    brandNames: s.brandNames || "",
    rating: s.avgRating,
    sat: saturation(r.items || []),
    volPrice: vp ? vp.price : null,
    volTitle: vp ? vp.title : "",
  });
}

// A family is worth sourcing only if the floor itself carries a CPA plus a margin.
// Best case cost is bounded by what the floor can absorb.
// The reference price is where the demand sits, falling back to the floor.
const refPrice = (r) => (r.volPrice != null ? Math.min(r.volPrice, r.floor) : r.floor);
const maxCost = (p) => r2(p - FEE(p) - CPA - 8);

console.log(`${rows.length} familles mesurees dans ${AMZ}.\n`);
console.log("=== CLASSEES PAR PLANCHER, seules celles avec de la demande ===");
console.log("famille                          plancher  prixVol  demande  marques  satur  cout max viable");
const live = rows.filter((r) => r.demand >= 50 && r.floor != null).sort((a, b) => b.floor - a.floor);
for (const r of live) {
  const mc = maxCost(refPrice(r));
  console.log(`${r.kw.slice(0, 32).padEnd(32)} ${r.floor.toFixed(2).padStart(8)} ${(r.volPrice != null ? r.volPrice.toFixed(2) : "-").padStart(8)}`
    + ` ${String(r.demand).padStart(8)} ${String(r.brand).padStart(7)}% ${String(r.sat ?? "?").padStart(5)}% ${(mc > 0 ? mc.toFixed(2) : "aucun").padStart(15)}`
    + (r.brandNames ? `  [${r.brandNames}]` : ""));
}

console.log("\n=== SANS DEMANDE MESUREE, ecartees d'office ===");
const dead = rows.filter((r) => r.demand < 50).sort((a, b) => b.med - a.med);
console.log(dead.map((r) => `${r.kw} (${r.med.toFixed(0)} EUR)`).join(", ") || "aucune");

if (BABA && existsSync(`${HERE}\\${BABA}`)) {
  const baba = JSON.parse(readFileSync(`${HERE}\\${BABA}`, "utf8"));
  console.log("\n=== RATIO SUR LE PLANCHER, cout rendu inclus (fret + droits + TVA non recuperable) ===");
  console.log("famille                        plancher  gros vol  rendu   net/vente  verdict");
  for (const b of baba) {
    const r = rows.find((x) => x.kw === b.frKw);
    if (!r || !b.items || !b.items.length) continue;
    const v = b.items.map((i) => i.eurLow).filter(Boolean).sort((x, y) => x - y);
    if (!v.length) continue;
    const vol = v[Math.floor(v.length * 0.25)];
    const cost = landed(vol, b.kg ?? KG);
    const p = refPrice(r);
    const net = r2(p - cost - FEE(p) - CPA);
    const verdict = net > 12 ? "VIABLE" : net > 0 ? "serre" : "negatif";
    console.log(`${r.kw.slice(0, 30).padEnd(30)} ${p.toFixed(2).padStart(8)} ${vol.toFixed(2).padStart(9)}`
      + ` ${cost.toFixed(2).padStart(7)} ${net.toFixed(2).padStart(10)}  ${verdict}`);
  }
}

console.log("\nRappel: verifier les TITRES Alibaba avant de croire un ratio, et comparer le MEME");
console.log("modele, jamais une mediane de categorie.");
