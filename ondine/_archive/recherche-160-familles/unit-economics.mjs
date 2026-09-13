/**
 * Unit economics on measured landed costs, not on the 10 EUR the plan assumed.
 * Shopify Payments France standard EU card: 1.4% + 0.25 EUR.
 */
const FEE = (p) => Math.round((p * 0.014 + 0.25) * 100) / 100;
const r2 = (x) => Math.round(x * 100) / 100;

const SOURCES = [
  { name: "France 2,2L promo", cost: 17.28, eta: "2 a 6 j", note: "prix Local Day, expire le 7/08, stock 1" },
  { name: "France 2,2L normal", cost: 22.90, eta: "2 a 6 j", note: "prix hors promo, le realiste en volume" },
  { name: "Allemagne inox 2,2L", cost: 25.79, eta: "3 a 8 j", note: "4.8/5, retour gratuit 90 j" },
  { name: "Chine Choice 1,2L", cost: 11.59, eta: "8 a 15 j", note: "1,2 L seulement, pas 2,4 L" },
];

// ROAS: 4.2 = moyenne marche FR mesuree, 2.0 = realiste pour un compte neuf sans pixel entraine.
const ROAS = [{ label: "debutant x2.0", v: 2.0 }, { label: "marche x4.2", v: 4.2 }];
const PRICES = [{ label: "solo 34,90", p: 34.90 }, { label: "solo 29,90", p: 29.90 }, { label: "pack 44,90", p: 44.90 }];

console.log("Cout rendu mesure le 06/08/2026 sur AliExpress, livraison comprise.\n");
console.log("Marge avant publicite, par prix de vente:\n");
console.log("source                 cout    delai     " + PRICES.map((x) => x.label.padStart(13)).join(""));
for (const s of SOURCES) {
  const cells = PRICES.map((x) => r2(x.p - s.cost - FEE(x.p)).toFixed(2).padStart(13));
  console.log(`${s.name.padEnd(22)} ${s.cost.toFixed(2).padStart(5)}  ${s.eta.padEnd(9)}${cells.join("")}`);
}

console.log("\nResultat net par vente, cout publicitaire deduit (prix de vente 34,90):");
console.log("source                 " + ROAS.map((r) => r.label.padStart(16)).join(""));
for (const s of SOURCES) {
  const cells = ROAS.map((r) => {
    const adCost = 34.90 / r.v;
    return r2(34.90 - s.cost - FEE(34.90) - adCost).toFixed(2).padStart(16);
  });
  console.log(`${s.name.padEnd(22)} ${cells.join("")}`);
}

console.log("\nLe reachat de filtres, seul revenu sans cout d'acquisition:");
const filtreCost = 4.00 / 12 * 3;   // lot de 12 mesure a 3,49-4,19 EUR rendu, vendu par 3
console.log(`  cout de 3 filtres        ${filtreCost.toFixed(2)} EUR   (lot de 12 a 4,00 EUR rendu, mesure)`);
console.log(`  vendus 9,90              marge ${r2(9.90 - filtreCost - FEE(9.90)).toFixed(2)} EUR par recharge`);
console.log(`  hypothese du plan 1,00   ${filtreCost <= 1.0 ? "CONFIRMEE" : "proche, ecart " + r2(filtreCost - 1).toFixed(2)}`);

console.log("\nCombien de recharges pour rattraper une acquisition a perte:");
for (const s of SOURCES) {
  const net = 34.90 - s.cost - FEE(34.90) - 34.90 / 2.0;
  const perRefill = 9.90 - filtreCost - FEE(9.90);
  if (net >= 0) { console.log(`  ${s.name.padEnd(22)} rentable des la 1re vente`); continue; }
  console.log(`  ${s.name.padEnd(22)} ${Math.ceil(-net / perRefill)} recharges necessaires (net ${r2(net).toFixed(2)} EUR)`);
}

console.log("\nSeuil que le plan s'etait fixe: 18,00 EUR rendu, au-dela le scenario favorable passe en negatif.");
for (const s of SOURCES) console.log(`  ${s.name.padEnd(22)} ${s.cost.toFixed(2)}  ${s.cost > 18 ? "AU-DESSUS DU SEUIL" : "sous le seuil"}`);
