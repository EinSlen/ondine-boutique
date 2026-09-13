/**
 * Bootstrapped growth. Reaching 10 000 EUR net a month needs about 25 000 EUR of working
 * capital, and the starting budget is 1 682 EUR. The only route is reinvesting everything.
 *
 * Each cycle: order stock, wait for it, sell it, reinvest the whole margin into a bigger order.
 * Cycle length is driven by sea freight, so it is the real speed limit.
 */
const r2 = (x) => Math.round(x * 100) / 100;

const START = 1682;          // Valentin's stated budget
const LANDED = 14.56;        // HT landed cost per unit
const GROSS = 24.04;         // gross margin per unit, all fees deducted
const FIXED = 340;           // monthly fixed costs
const TAX = 0.15;            // corporate tax, first bracket
const MARKET = 2500;         // monthly Amazon FR purchases on the lead product
const CYCLE_AIR = 1.0;       // months, air freight for the first small orders
const CYCLE_SEA = 2.0;       // months, sea freight once volumes justify it

console.log("CROISSANCE PAR REINVESTISSEMENT, depart " + START + " EUR\n");
console.log("cycle  fret      unites   stock achete   ventes/mois   marge nette   tresorerie");

let cash = START;
let month = 0;
let cumNet = 0;
for (let c = 1; c <= 10; c++) {
  const sea = cash > 4000;
  const cycleLen = sea ? CYCLE_SEA : CYCLE_AIR;
  const unitCost = sea ? LANDED : r2(LANDED + 3.5 * 1.8 / 1.2);   // air is dearer per unit
  const units = Math.floor((cash * 0.85) / unitCost);              // keep 15 % buffer
  if (units < 5) { console.log("  tresorerie insuffisante pour continuer"); break; }

  const monthlySales = Math.min(units / cycleLen, MARKET * 0.25);
  const gross = r2(monthlySales * GROSS * cycleLen);
  const beforeTax = r2(gross - FIXED * cycleLen);
  const net = r2(beforeTax * (1 - TAX));
  cash = r2(cash - units * unitCost + units * unitCost + net);     // stock rotates, margin accrues
  cumNet += net;
  month += cycleLen;

  console.log(`${String(c).padStart(5)}  ${(sea ? "maritime" : "aerien  ")}  ${String(units).padStart(6)}`
    + ` ${r2(units * unitCost).toFixed(0).padStart(13)} ${monthlySales.toFixed(0).padStart(13)}`
    + ` ${r2(net / cycleLen).toFixed(0).padStart(13)} ${cash.toFixed(0).padStart(12)}`);

  if (net / cycleLen >= 10000) { console.log(`\n  Objectif 10 000 EUR/mois atteint au mois ${month}.`); break; }
}

console.log(`\nApres ${month} mois: tresorerie ${cash.toFixed(0)} EUR, cumul des benefices ${cumNet.toFixed(0)} EUR.`);

console.log("\n=== CE QUI LIMITE LA VITESSE ===");
console.log("  1. Le delai de reapprovisionnement. En maritime, 45 a 60 jours entre le paiement");
console.log("     et la mise en vente: la tresorerie ne tourne que 6 fois par an.");
console.log("  2. Le plafond de part de marche. Au-dela de 20 a 25 % d'une requete, il faut");
console.log("     ouvrir un autre canal ou un autre pays, pas pousser la publicite.");
console.log("  3. Les frais fixes de 340 EUR sont dus des le premier mois, avant toute vente.");

console.log("\n=== ACCELERATEURS POSSIBLES ===");
for (const [n, d] of [
  ["Aerien sur les premiers cycles", "coute 3 EUR de plus par unite mais divise le cycle par deux"],
  ["Acompte 30 % chez le fournisseur", "libere de la tresorerie, a negocier apres 2 commandes"],
  ["Amazon Lending ou avance de tresorerie", "accessible apres 6 mois d'historique de ventes"],
  ["Gamme d'accessoires", "double la marge par client sans nouveau cout d'acquisition"],
  ["Marketplaces DE, IT, ES", "triple le marche adressable sans nouveau produit"],
]) console.log(`  ${n.padEnd(40)} ${d}`);
