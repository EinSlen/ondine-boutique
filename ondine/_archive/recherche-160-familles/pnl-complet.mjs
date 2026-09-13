/**
 * Complete P&L, nothing left out. Rebuilt after finding three omissions in the earlier
 * models, the first of which invalidated every margin figure in the study:
 *
 *  1. VAT. All prices quoted were TTC. At 79,99 EUR TTC the revenue is 66,66 EUR HT;
 *     the 13,33 EUR of VAT is collected for the state, not earned. Above 85 000 EUR of
 *     turnover VAT registration is compulsory, and 10 000 EUR of monthly margin means
 *     crossing that within the first months.
 *  2. Social contributions or corporate tax. Never counted before.
 *  3. Regulatory costs on an electrical product: DEEE eco-contribution, Citeo packaging,
 *     GS1 barcodes, professional liability insurance. All mandatory, none optional.
 *
 * node pnl-complet.mjs [ventesParMois]
 */
const UNITS = parseInt(process.argv[2] || "375", 10);
const r2 = (x) => Math.round(x * 100) / 100;
const VAT = 0.20;

const PRICE_TTC = 79.99;
const PRICE_HT = r2(PRICE_TTC / (1 + VAT));
const FOB = 11.37;          // Alibaba, volume
const KG = 1.8;
const SEA = 1.50;           // EUR per kg, sea groupage
const DUTY = 0.035;

// --- Variable cost per unit, all HT since VAT is now recoverable ---
const freight = r2(SEA * KG);
const duty = r2((FOB + freight) * DUTY);
const landedHT = r2(FOB + freight + duty);        // import VAT recovered, so excluded
const inbound = 0.45;                              // sending stock into the Amazon warehouse
const commission = r2(PRICE_TTC * 0.15);           // Amazon takes it on the TTC price
const fbaFee = 5.50;
const storage = 0.35;
const ads = r2(PRICE_TTC * 0.08);
const returnRate = 0.06;                           // tools and DIY, realistic
const returnCost = r2(PRICE_TTC * returnRate * 0.5);
const breakage = r2(landedHT * 0.02);
const deee = 0.55;                                 // eco-contribution, electrical product
const citeo = 0.12;                                // packaging contribution

const variable = r2(landedHT + inbound + commission + fbaFee + storage + ads + returnCost + breakage + deee + citeo);
const grossPerUnit = r2(PRICE_HT - variable);

console.log(`COMPTE DE RESULTAT COMPLET, ${UNITS} ventes par mois\n`);
console.log("=== PAR UNITE, HORS TAXES ===");
const lines = [
  ["Prix de vente TTC", PRICE_TTC],
  ["dont TVA collectee, reversee a l'Etat", -r2(PRICE_TTC - PRICE_HT)],
  ["CHIFFRE D'AFFAIRES HT", PRICE_HT],
  ["", null],
  ["Produit depart usine (FOB)", -FOB],
  ["Fret maritime", -freight],
  ["Droits de douane 3,5 %", -duty],
  ["Envoi du stock chez Amazon", -inbound],
  ["Commission Amazon 15 %", -commission],
  ["Frais FBA preparation et expedition", -fbaFee],
  ["Stockage", -storage],
  ["Publicite Amazon Ads 8 %", -ads],
  ["Retours 6 %, provision", -returnCost],
  ["Casse et perte 2 %", -breakage],
  ["Eco-participation DEEE", -deee],
  ["Contribution emballages Citeo", -citeo],
  ["", null],
  ["MARGE BRUTE PAR UNITE", grossPerUnit],
];
for (const [l, v] of lines) {
  if (v === null) { console.log(); continue; }
  console.log(`${l.padEnd(42)} ${v.toFixed(2).padStart(9)} EUR`);
}

// --- Monthly fixed costs ---
const FIXED = [
  ["Expert-comptable", 120],
  ["Amazon Seller Pro", 39],
  ["Shopify Basic, second canal", 32],
  ["Assurance RC professionnelle", 45],
  ["Codes-barres GS1", 13],
  ["Adhesion eco-organisme DEEE et Citeo", 15],
  ["Mediateur de la consommation", 6],
  ["Outils IA, redaction et visuels", 40],
  ["Banque professionnelle", 20],
  ["Domaine et divers", 10],
];
const fixedTotal = FIXED.reduce((a, [, c]) => a + c, 0);

const grossMonthly = r2(UNITS * grossPerUnit);
const beforeTax = r2(grossMonthly - fixedTotal);

console.log("\n=== CHARGES FIXES MENSUELLES ===");
for (const [n, c] of FIXED) console.log(`${n.padEnd(42)} ${String(c).padStart(9)} EUR`);
console.log(`${"TOTAL".padEnd(42)} ${String(fixedTotal).padStart(9)} EUR`);

console.log("\n=== RESULTAT MENSUEL ===");
console.log(`${"Marge brute".padEnd(42)} ${grossMonthly.toFixed(2).padStart(9)} EUR`);
console.log(`${"Charges fixes".padEnd(42)} ${(-fixedTotal).toFixed(2).padStart(9)} EUR`);
console.log(`${"RESULTAT AVANT IMPOT".padEnd(42)} ${beforeTax.toFixed(2).padStart(9)} EUR`);

// --- Tax, two legal forms ---
const caHT = r2(UNITS * PRICE_HT);
const caTTC = r2(UNITS * PRICE_TTC);
console.log(`\n(chiffre d'affaires ${caHT.toFixed(0)} EUR HT par mois, soit ${r2(caHT * 12).toFixed(0)} EUR par an)`);

console.log("\n=== IMPOT ET COTISATIONS, SELON LA FORME JURIDIQUE ===");
const microOK = caHT * 12 <= 203100;
const microSocial = r2(caTTC * 0.123);       // 12,3 % of turnover, goods
const microNet = r2(grossMonthly - fixedTotal - microSocial);
console.log(`Micro-entreprise ${microOK ? "" : "(PLAFOND 203 100 EUR DEPASSE, impossible)"}`);
console.log(`  cotisations sociales 12,3 % du CA TTC    ${(-microSocial).toFixed(2).padStart(9)} EUR`);
console.log(`  RESULTAT NET                             ${microNet.toFixed(2).padStart(9)} EUR/mois`);

const isBase = beforeTax * 12;
const isRate = isBase <= 42500 ? 0.15 : 0.25;
const societeTax = r2((beforeTax * isRate));
const societeNet = r2(beforeTax - societeTax);
console.log(`Societe (EURL ou SASU), impot sur les societes ${(isRate * 100).toFixed(0)} %`);
console.log(`  impot sur les benefices                  ${(-societeTax).toFixed(2).padStart(9)} EUR`);
console.log(`  RESULTAT NET avant remuneration          ${societeNet.toFixed(2).padStart(9)} EUR/mois`);

console.log("\n=== POUR ATTEINDRE 10 000 EUR NETS PAR MOIS ===");
const netPerUnitSociete = r2(grossPerUnit * (1 - isRate));
const needed = Math.ceil((10000 + fixedTotal * (1 - isRate)) / netPerUnitSociete);
console.log(`  ${needed} ventes par mois en societe, soit ${Math.round(100 * needed / 2500)} % du marche Amazon FR mesure`);
console.log(`  chiffre d'affaires ${r2(needed * PRICE_TTC).toFixed(0)} EUR TTC par mois`);
console.log(`  stock a financer en permanence, 45 jours: ${r2(needed * 1.5 * landedHT).toFixed(0)} EUR`);

console.log("\n=== BESOIN EN TRESORERIE, LE POSTE LE PLUS SOUS-ESTIME ===");
console.log("  Le fournisseur est paye a la commande, la marchandise arrive 45 jours plus tard,");
console.log("  Amazon reverse tous les 14 jours. Il faut donc financer environ 3 mois de stock");
console.log(`  avant le premier euro encaisse: ${r2(needed * 3 * landedHT).toFixed(0)} EUR au rythme de ${needed} ventes/mois.`);
