/**
 * Landed cost of a bought batch, versus dropshipping unit by unit.
 *
 * Two things the Alibaba sticker price hides:
 *  - it is ex-works: freight, duty and import VAT come on top;
 *  - under the micro-entreprise VAT franchise, import VAT is NOT deductible. It is a real
 *    20 % on the cost, unlike for a VAT-registered business.
 */
const VAT = 0.20;          // not recoverable under the franchise
const DUTY = 0.035;        // typical 0 to 6.5 %, taken mid-range
const AIR_KG = 6.50;       // express air freight per kg, small batch
const CPA = 16;
const FEE = (p) => p * 0.014 + 0.25;
const r2 = (x) => Math.round(x * 100) / 100;

// eurHigh = price at minimum order, eurLow = price at high volume. Both measured 06/08/2026.
const CASES = [
  { name: "filtre ND variable", frPrice: 55.00, amazonFloor: 29.99, atMoq: 21.63, atVolume: 8.35, kg: 0.15, ali: 24.59 },
  { name: "station fer a souder", frPrice: 49.00, amazonFloor: 39.99, atMoq: 20.10, atVolume: 16.15, kg: 0.90, ali: 22.99 },
  { name: "telemetre golf", frPrice: 75.00, amazonFloor: 53.59, atMoq: 40.65, atVolume: 36.72, kg: 0.35, ali: 49.39 },
  { name: "fontaine a eau chat", frPrice: 23.99, amazonFloor: 19.95, atMoq: 20.10, atVolume: 2.62, kg: 1.20, ali: 22.90 },
];

const landed = (unit, kg) => r2((unit + AIR_KG * kg) * (1 + DUTY) * (1 + VAT));

console.log("Cout rendu reel d'un achat groupe, fret aerien + droits 3,5 % + TVA 20 % non recuperable.\n");
console.log("produit                 dropship  lot MOQ  lot volume   prix FR  plancher");
for (const c of CASES) {
  console.log(`${c.name.padEnd(22)} ${c.ali.toFixed(2).padStart(8)} ${landed(c.atMoq, c.kg).toFixed(2).padStart(8)} ${landed(c.atVolume, c.kg).toFixed(2).padStart(11)}`
    + ` ${c.frPrice.toFixed(2).padStart(9)} ${c.amazonFloor.toFixed(2).padStart(9)}`);
}

console.log("\nNet par vente apres CPA 16 EUR, au prix de vente vise:");
console.log("produit                 dropship   lot MOQ  lot volume");
for (const c of CASES) {
  const net = (cost) => r2(c.frPrice - cost - FEE(c.frPrice) - CPA);
  const tag = (x) => (x > 12 ? " VIABLE" : x > 0 ? " serre" : " negatif");
  const a = net(c.ali), m = net(landed(c.atMoq, c.kg)), v = net(landed(c.atVolume, c.kg));
  console.log(`${c.name.padEnd(22)} ${a.toFixed(2).padStart(8)}${tag(a).padEnd(9)} ${m.toFixed(2).padStart(7)}${tag(m).padEnd(9)} ${v.toFixed(2).padStart(7)}${tag(v)}`);
}

console.log("\nMise de depart pour un premier lot, et seuil de rentabilite:");
for (const c of CASES) {
  for (const qty of [50, 200]) {
    const unit = qty >= 200 ? c.atVolume : c.atMoq;
    const cost = landed(unit, c.kg);
    const cash = r2(cost * qty);
    const net = r2(c.frPrice - cost - FEE(c.frPrice) - CPA);
    if (net <= 0) { console.log(`  ${c.name.padEnd(22)} ${String(qty).padStart(3)} u  mise ${cash.toFixed(2).padStart(8)} EUR  net negatif, sans objet`); continue; }
    console.log(`  ${c.name.padEnd(22)} ${String(qty).padStart(3)} u  mise ${cash.toFixed(2).padStart(8)} EUR  net/vente ${net.toFixed(2).padStart(6)} EUR  rentable a ${Math.ceil(cash / net)} ventes`);
  }
}

console.log("\nAttention: le prix plancher Amazon est le vrai plafond de vente. Vendre au-dessus");
console.log("demande une raison (marque, bundle, service), pas seulement une boutique.");
