/**
 * The laser range: one buyer, several references, one ad audience.
 * All figures measured on Amazon FR 06/08/2026, costs from Alibaba the same day.
 *
 * Why a range and not one product: the CPA is paid once per customer, so every extra
 * reference in the same basket carries almost no acquisition cost.
 */
const FEE = (p) => p * 0.014 + 0.25;
const VAT = 0.20, DUTY = 0.035, SEA = 1.50;
const r2 = (x) => Math.round(x * 100) / 100;
const landed = (u, kg) => r2((u + SEA * kg) * (1 + DUTY) * (1 + VAT));

const RANGE = [
  { name: "niveau laser vert 4x360", price: 79.99, market: 2500, unit: 11.37, kg: 1.8, share: 0.15, brand: 6 },
  { name: "trepied de chantier", price: 39.99, market: 1150, unit: 6.50, kg: 2.2, share: 0.15, brand: 22 },
  { name: "mire graduee", price: 74.99, market: 1200, unit: 14.00, kg: 2.5, share: 0.10, brand: 67 },
  { name: "lunettes de visee laser", price: 24.84, market: 150, unit: 1.20, kg: 0.1, share: 0.20, brand: 5 },
  { name: "cellule de detection", price: 45.00, market: 400, unit: 8.00, kg: 0.4, share: 0.15, brand: 10 },
];

/**
 * Only the lead product carries an acquisition cost. Accessories ride along in the same
 * basket, so charging them a CPA understates the range by a wide margin. Attach rate is
 * the share of lead buyers who add the accessory.
 */
const ATTACH = { "trepied de chantier": 0.40, "mire graduee": 0.15, "lunettes de visee laser": 0.35, "cellule de detection": 0.12 };

console.log("GAMME LASER DE CHANTIER, acheteur unique: artisan du batiment\n");
console.log("reference                 prix   cout rendu   marge/u   ventes/mois   EUR/mois   role");
let total = 0, totalCash = 0;
const lead = RANGE[0];
const leadUnits = Math.round(lead.market * lead.share);
for (const r of RANGE) {
  const cost = landed(r.unit, r.kg);
  const isLead = r === lead;
  const CPA = isLead ? 25 : 0;
  const margin = r2(r.price - cost - FEE(r.price) - CPA);
  const units = isLead ? leadUnits : Math.round(leadUnits * (ATTACH[r.name] ?? 0.2));
  const rev = r2(units * margin);
  total += rev;
  totalCash += cost * Math.max(30, Math.round(units * 1.5));
  console.log(`${r.name.padEnd(25)} ${r.price.toFixed(2).padStart(6)} ${cost.toFixed(2).padStart(12)}`
    + ` ${margin.toFixed(2).padStart(9)} ${String(units).padStart(13)} ${rev.toFixed(0).padStart(10)}   ${isLead ? "produit d'appel, porte le CPA" : "upsell, CPA deja paye"}`);
}
console.log(`${"".padEnd(25)} ${"".padStart(6)} ${"".padStart(12)} ${"".padStart(9)} ${"TOTAL".padStart(13)} ${total.toFixed(0).padStart(10)} EUR/mois`);

console.log(`\nStock initial pour lancer la gamme: environ ${Math.round(totalCash)} EUR.`);

console.log("\n=== EFFET DU PANIER SUR LE CPA ===");
const main = RANGE[0], cost = landed(main.unit, main.kg);
console.log("Le CPA est paye une fois par client, pas par article.");
for (const [label, extra] of [["niveau seul", 0], ["niveau + trepied", 39.99], ["niveau + trepied + lunettes", 39.99 + 24.84]]) {
  const price = main.price + extra;
  const extraCost = extra ? landed(6.50, 2.2) + (extra > 50 ? landed(1.20, 0.1) : 0) : 0;
  const m = r2(price - cost - extraCost - FEE(price) - 25);
  console.log(`  ${label.padEnd(30)} panier ${price.toFixed(2).padStart(7)} EUR   marge nette ${m.toFixed(2).padStart(6)} EUR`);
}

console.log("\n=== TRAJECTOIRE ===");
const perSale = r2(main.price - cost - FEE(main.price) - 25);
for (const [phase, desc, rev] of [
  ["Phase 1", "niveau laser seul, Amazon comme reference de prix", 13556],
  ["Phase 2", "gamme complete, panier moyen superieur", total],
  ["Phase 3", "ManoMano + Cdiscount + Google Shopping + B2B artisans", total * 2.5],
  ["Phase 4", "extension outillage laser et mesure, marque propre", total * 5],
]) {
  console.log(`${phase}  ${desc.padEnd(52)} ~${Math.round(rev).toLocaleString("fr-FR")} EUR/mois`);
}

console.log("\nPour 100 000 EUR/mois il faut sortir d'un seul canal et d'une seule reference:");
console.log("le marche Amazon FR mesure ne porte pas ce niveau a lui seul.");

console.log("\n=== RISQUES A LEVER AVANT D'ENGAGER ===");
for (const r of [
  "Marquage CE et declaration de conformite du fournisseur, obligatoire sur un produit laser",
  "Classe laser: un niveau de chantier doit etre classe 2 (<1 mW), verifier sur la fiche",
  "10 annonces du meme generique sur Amazon: la concurrence est prouvee, pas la place",
  "Le prix a deja converge, une guerre de prix est possible a tout moment",
  "Batterie lithium integree: transport aerien restreint, le maritime devient obligatoire",
  "Plafond micro-entreprise 203 100 EUR de CA: au-dela de ~15 000 EUR/mois de CA, passer en societe",
]) console.log("  - " + r);
