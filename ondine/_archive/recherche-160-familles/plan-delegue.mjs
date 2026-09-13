/**
 * Fully delegated plan, Amazon FBA first. Path from 10 000 to 100 000 EUR a month.
 *
 * FBA nets 36,67 EUR against 25,85 for Shopify plus ads, and it also absorbs storage,
 * shipping, returns and first-line support. The demand was measured on Amazon in the first
 * place, so the traffic is already where the product is.
 */
const r2 = (x) => Math.round(x * 100) / 100;
const netFBA = (price, cost) => r2(price - cost - price * 0.15 - 5.50 - 0.35 - price * 0.08 - price * 0.02);

const RANGE = [
  { name: "niveau laser 4x360", price: 79.99, cost: 17.47, market: 2500, attach: 1.00 },
  { name: "trepied de chantier", price: 39.99, cost: 12.17, market: 1150, attach: 0.40 },
  { name: "lunettes de visee", price: 24.84, cost: 1.68, market: 150, attach: 0.35 },
  { name: "mire graduee", price: 74.99, cost: 22.05, market: 1200, attach: 0.15 },
  { name: "cellule de detection", price: 45.00, cost: 10.68, market: 400, attach: 0.12 },
];

// Amazon FR market share by phase, on the lead product.
const SHARES = { p1: 0.11, p2: 0.15, p3: 0.20 };
// Relative size of the other Amazon EU marketplaces for tools, versus France.
const EU = { Allemagne: 2.0, Italie: 0.7, Espagne: 0.6 };

const leadUnits = (share) => Math.round(RANGE[0].market * share);

function rangeRevenue(share, factor = 1) {
  const lead = leadUnits(share) * factor;
  let total = 0;
  const lines = [];
  for (const r of RANGE) {
    const units = Math.round(lead * r.attach);
    const net = netFBA(r.price, r.cost);
    const rev = r2(units * net);
    total += rev;
    lines.push({ name: r.name, units, net, rev });
  }
  return { total: r2(total), lines };
}

console.log("PLAN TOUT DELEGUE, AMAZON FBA, GAMME LASER DE CHANTIER\n");

const p2 = rangeRevenue(SHARES.p2);
console.log("Gamme complete, 15 % de part sur Amazon France:");
console.log("reference                 prix    net/vente   ventes/mois    EUR/mois");
for (const l of p2.lines) {
  const p = RANGE.find((r) => r.name === l.name);
  console.log(`${l.name.padEnd(25)} ${p.price.toFixed(2).padStart(6)} ${l.net.toFixed(2).padStart(11)} ${String(l.units).padStart(13)} ${l.rev.toFixed(0).padStart(11)}`);
}
console.log(`${"".padEnd(25)} ${"".padStart(6)} ${"".padStart(11)} ${"TOTAL".padStart(13)} ${p2.total.toFixed(0).padStart(11)} EUR/mois`);

console.log("\n=== TRAJECTOIRE ===");
const p1 = rangeRevenue(SHARES.p1);
const p1Lead = r2(leadUnits(SHARES.p1) * netFBA(RANGE[0].price, RANGE[0].cost));
const euFactor = 1 + Object.values(EU).reduce((a, b) => a + b, 0);
const p3 = rangeRevenue(SHARES.p3, euFactor);

const rows = [
  ["Phase 1", "produit seul, Amazon FR, 11 % de part", p1Lead, "3 a 6 mois"],
  ["Phase 2", "gamme complete, Amazon FR, 15 %", p2.total, "6 a 12 mois"],
  ["Phase 3", "gamme + Amazon DE, IT, ES (paneuropeen), 20 %", p3.total, "12 a 24 mois"],
];
for (const [ph, desc, rev, when] of rows) {
  console.log(`${ph}  ${desc.padEnd(48)} ${Math.round(rev).toLocaleString("fr-FR").padStart(8)} EUR/mois   ${when}`);
}

console.log("\n=== STOCK A FINANCER PAR PHASE, 45 jours de couverture ===");
for (const [ph, share, factor] of [["Phase 1", SHARES.p1, 1], ["Phase 2", SHARES.p2, 1], ["Phase 3", SHARES.p3, euFactor]]) {
  const lead = leadUnits(share) * factor;
  let cash = 0;
  for (const r of RANGE) cash += Math.round(lead * r.attach * 1.5) * r.cost;
  console.log(`  ${ph}  ${Math.round(cash).toLocaleString("fr-FR").padStart(8)} EUR de stock`);
}

console.log("\n=== CE QUE L'IA FAIT, ET CE QU'ELLE NE DOIT PAS FAIRE ===");
console.log("AUTORISE ET EFFICACE:");
for (const t of [
  "fiches produit, titres et bullet points Amazon, optimises pour la recherche",
  "descriptions longues, FAQ, emails de suivi, reponses SAV type",
  "traduction vers l'allemand, l'italien et l'espagnol pour la phase 3",
  "detourage, nettoyage et mise sur fond blanc des photos FOURNISSEUR",
  "mise en scene du VRAI produit dans un decor genere, si le produit reste fidele",
  "clips verticaux animes a partir des photos fournisseur (stills-to-video.mjs, deja ecrit)",
  "textes publicitaires et variantes d'accroches a tester",
]) console.log("  + " + t);
console.log("INTERDIT:");
for (const t of [
  "generer une image d'un produit que tu ne vends pas exactement: publicite trompeuse, L121-2",
  "inventer des avis clients: pratique commerciale trompeuse, sanction penale",
  "afficher des performances non verifiees (portee, precision) reprises du fournisseur sans controle",
]) console.log("  - " + t);

console.log("\n=== POINTS DE VIGILANCE FBA ===");
for (const t of [
  "Compte vendeur: verification d'identite et de societe, compter 1 a 3 semaines",
  "TVA: en vente UE au-dela des seuils, immatriculation au guichet OSS obligatoire",
  "Le stock envoye a Amazon est immobilise: une rupture coute le referencement",
  "Suspension de compte possible sur litige produit: prevoir Shopify en second canal",
  "Produit laser: fiche de conformite CE exigible par Amazon a tout moment",
]) console.log("  - " + t);
