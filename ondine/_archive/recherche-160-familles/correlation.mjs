/**
 * The structural finding: across every family measured, price and demand move in opposite
 * directions. A product that is both expensive and in demand is what the model needs, and
 * it is almost absent from the reachable niches.
 */
import { readFileSync, existsSync } from "node:fs";

const HERE = "C:\\Users\\Valentin\\Desktop\\Ondine\\recherche";
const rows = [];
for (const f of ["res-vague2.json", "res-vague3.json", "res-escalade.json", "res-nd.json", "res-marques.json"]) {
  if (!existsSync(`${HERE}\\${f}`)) continue;
  for (const r of JSON.parse(readFileSync(`${HERE}\\${f}`, "utf8"))) {
    const s = r.summary;
    if (!s || s.med == null) continue;
    rows.push({ kw: r.query, price: s.med, demand: s.boughtSum ?? 0, brand: s.brandPct ?? 0 });
  }
}
// Same query can appear in two files; keep one.
const seen = new Map();
for (const r of rows) if (!seen.has(r.kw)) seen.set(r.kw, r);
const all = [...seen.values()];

const CPA = 16, FEE = (p) => p * 0.014 + 0.25;
// Need cost <= price/3 to clear CPA with a margin; assume the best case cost = price/3.
const viable = (r) => r.price >= 55 && r.demand >= 100;

console.log(`${all.length} familles avec un prix et une demande mesures.\n`);

const buckets = [[0, 25], [25, 55], [55, 100], [100, 1e9]];
console.log("tranche de prix      familles   demande mediane   avec demande >= 100");
for (const [lo, hi] of buckets) {
  const b = all.filter((r) => r.price >= lo && r.price < hi);
  if (!b.length) continue;
  const d = b.map((r) => r.demand).sort((x, y) => x - y);
  const med = d[Math.floor(d.length / 2)];
  const withDemand = b.filter((r) => r.demand >= 100).length;
  const label = hi > 1e8 ? `${lo} EUR et plus` : `${lo} a ${hi} EUR`;
  console.log(`${label.padEnd(20)} ${String(b.length).padStart(8)} ${String(med).padStart(17)} ${String(withDemand).padStart(21)}`);
}

console.log("\n=== LES DEUX CONDITIONS ENSEMBLE : prix >= 55 EUR ET demande >= 100/mois ===");
const win = all.filter(viable).sort((a, b) => b.demand - a.demand);
if (!win.length) console.log("aucune");
for (const r of win) {
  const maxCost = r.price - FEE(r.price) - CPA - 8; // 8 EUR de marge nette plancher
  console.log(`${r.kw.slice(0, 34).padEnd(34)} prix=${r.price.toFixed(2).padStart(7)} demande=${String(r.demand).padStart(5)}`
    + ` marques=${String(r.brand).padStart(3)}%  cout d'achat max viable=${maxCost.toFixed(2)} EUR`);
}

console.log(`\nSur ${all.length} familles, ${win.length} remplissent les deux conditions, soit ${Math.round(100 * win.length / all.length)} %.`);
