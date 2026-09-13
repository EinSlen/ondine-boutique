/**
 * Feasibility against the real target: 10 000 EUR of NET margin per month, up to 100 000.
 *
 * Every earlier stage validated unit margin. None asked whether the market is big enough to
 * carry that income. A 22 EUR margin on a 300-a-month market caps out near 1 000 EUR, whatever
 * the ratio looks like.
 *
 *   monthly net = monthly demand x capture share x unit margin
 *
 * Capture share for a new shop with no brand: 10 % is optimistic, 20 % is a stretch goal
 * reached only by dominating the category. Both are shown.
 */
import { readFileSync, existsSync, readdirSync } from "node:fs";

const HERE = "C:\\Users\\Valentin\\Desktop\\Ondine\\recherche";
const TARGET = 10000;
const SHARES = [0.10, 0.20];
const CPA = 16;
const FEE = (p) => p * 0.014 + 0.25;
const r2 = (x) => Math.round(x * 100) / 100;

const files = readdirSync(HERE).filter((f) => /^res-.*\.json$/.test(f));
const seen = new Map();
for (const f of files) {
  for (const r of JSON.parse(readFileSync(`${HERE}\\${f}`, "utf8"))) {
    const s = r.summary;
    if (!s || s.med == null || !s.boughtSum) continue;
    const org = (r.items || []).filter((i) => !i.sponsored && i.price != null && i.boughtMonth);
    const top = org.sort((a, b) => b.boughtMonth - a.boughtMonth)[0];
    const price = top ? Math.min(top.price, s.p25 ?? top.price) : s.p25;
    if (!price) continue;
    if (!seen.has(r.query) || seen.get(r.query).demand < s.boughtSum) {
      seen.set(r.query, { kw: r.query, price, demand: s.boughtSum, brand: s.brandPct ?? 0 });
    }
  }
}
const all = [...seen.values()];

/**
 * Best-case unit margin: assume the product can be landed at 25 % of its selling price,
 * which is the most favourable ratio observed across the whole study (filtre ND in volume).
 * Anything that fails here fails for real.
 */
const bestMargin = (price) => r2(price - price * 0.25 - FEE(price) - CPA);

console.log(`Objectif ${TARGET} EUR de marge nette par mois. ${all.length} familles avec demande mesuree.\n`);
console.log("Hypothese la plus favorable de toute l'etude: cout rendu = 25 % du prix de vente.\n");

const scored = all.map((r) => {
  const m = bestMargin(r.price);
  return { ...r, margin: m, at10: r2(r.demand * 0.10 * m), at20: r2(r.demand * 0.20 * m) };
}).filter((r) => r.margin > 0).sort((a, b) => b.at20 - a.at20);

console.log("famille                            prix  demande  marge/u   a 10%     a 20%   atteint 10k ?");
for (const r of scored.slice(0, 22)) {
  const ok = r.at20 >= TARGET ? "OUI a 20%" : r.at10 >= TARGET ? "OUI a 10%" : "non";
  console.log(`${r.kw.slice(0, 32).padEnd(32)} ${r.price.toFixed(2).padStart(7)} ${String(r.demand).padStart(7)}`
    + ` ${r.margin.toFixed(2).padStart(8)} ${r.at10.toFixed(0).padStart(7)} ${r.at20.toFixed(0).padStart(9)}   ${ok}`);
}

const winners = scored.filter((r) => r.at20 >= TARGET);
console.log(`\n${winners.length} familles sur ${all.length} peuvent atteindre ${TARGET} EUR/mois, meme en supposant`);
console.log("le meilleur cout d'achat observe et 20 % de part de marche.");

console.log("\n=== CE QU'IL FAUT POUR ATTEINDRE LA CIBLE ===");
console.log("marge unitaire   demande mensuelle requise a 10% de part   a 20%");
for (const m of [15, 25, 40, 60, 100, 200]) {
  console.log(`${(m + " EUR").padEnd(16)} ${String(Math.ceil(TARGET / (m * 0.10))).padStart(38)} ${String(Math.ceil(TARGET / (m * 0.20))).padStart(7)}`);
}

console.log("\n=== LES DEUX CANDIDATS RETENUS HIER, CONFRONTES A LA CIBLE ===");
for (const [n, dem, mar] of [["secheur de toilettage", 300, 22.26], ["manometre frigoriste", 100, 19.83]]) {
  const a10 = r2(dem * 0.10 * mar), a20 = r2(dem * 0.20 * mar);
  const need = Math.ceil(TARGET / mar);
  console.log(`${n.padEnd(24)} marche ${String(dem).padStart(5)}/mois  a 20% => ${a20.toFixed(0).padStart(5)} EUR/mois`
    + `  il faudrait ${need} ventes/mois, soit ${Math.round(100 * need / dem)} % du marche`);
}

console.log("\nPlafond micro-entreprise: 203 100 EUR de CA. A 10 000 EUR de marge nette par mois");
console.log("avec 40 % de marge, le CA annuel depasse 300 000 EUR: il faut une societe, pas la micro.");
