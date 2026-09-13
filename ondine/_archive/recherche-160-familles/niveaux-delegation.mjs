/**
 * What each level of delegation costs, and what it leaves on the plate.
 *
 * The honest question is not "can everything be delegated" but "at what point does the
 * delegation eat the margin that justified the product". This computes that point.
 */
const r2 = (x) => Math.round(x * 100) / 100;

const PRICE = 79.99;
const PRICE_HT = r2(PRICE / 1.2);
const BASE_COSTS = 44.25;   // landed + Amazon fees + ads + returns + DEEE, from pnl-complet
const FIXED = 340;
const IS = 0.25;
const MARKET = 2500;
const TARGET = 10000;

const LEVELS = [
  {
    name: "Niveau 1: FBA + prestataires",
    extra: 1.63,                       // inspection en routine + photos amorties
    hours: "2 a 4 h/mois",
    tasks: ["passer les commandes et payer", "valider les rapports d'inspection",
      "valider les fiches redigees par IA", "suivre tresorerie et stock", "decisions de prix"],
  },
  {
    name: "Niveau 2: + agent de sourcing",
    extra: 1.63 + r2(PRICE * 0.05),    // 5 % du prix, standard pour un agent en Chine
    hours: "1 h/mois",
    tasks: ["payer", "arbitrer si l'agent remonte un probleme", "suivre la tresorerie"],
  },
  {
    name: "Niveau 3: + agence Amazon complete",
    extra: 1.63 + r2(PRICE * 0.05) + r2(PRICE * 0.15),   // agence 15 % du CA
    hours: "15 min/mois",
    tasks: ["payer", "signer ce qui doit l'etre"],
  },
];

console.log("COUT REEL DE CHAQUE NIVEAU DE DELEGATION\n");
console.log("niveau                              marge/u   ventes pour 10k   part du marche   ton temps");
for (const l of LEVELS) {
  const margin = r2(PRICE_HT - BASE_COSTS - l.extra);
  if (margin <= 0) {
    console.log(`${l.name.padEnd(35)} ${margin.toFixed(2).padStart(8)}   marge negative, impossible`);
    l.impossible = true;
    continue;
  }
  const units = Math.ceil((TARGET / (1 - IS) + FIXED) / margin);
  const share = Math.round((100 * units) / MARKET);
  l.margin = margin; l.units = units; l.share = share;
  console.log(`${l.name.padEnd(35)} ${margin.toFixed(2).padStart(8)} ${String(units).padStart(17)} ${(share + " %").padStart(16)}   ${l.hours}`
    + (share > 30 ? "   HORS D'ATTEINTE" : ""));
}

console.log("\n=== CE QUI RESTE SUR TON BUREAU A CHAQUE NIVEAU ===");
for (const l of LEVELS) {
  console.log(`\n${l.name}  (${l.hours})`);
  for (const t of l.tasks) console.log("   - " + t);
}

console.log("\n=== LES ACTES QUE PERSONNE NE PEUT FAIRE A TA PLACE ===");
console.log("Ce ne sont pas des limites techniques, ce sont des obligations legales.\n");
const LEGAL = [
  ["Creation de la societe", "signature electronique + declaration sur l'honneur de non-condamnation",
   "1 fois, 20 min", "un formaliste (Legalstart, Captain Contrat) prepare tout, tu signes"],
  ["Compte bancaire professionnel", "verification d'identite KYC, obligation anti-blanchiment",
   "1 fois, 15 min", "Qonto ou Shine en visio, pas de rendez-vous en agence"],
  ["Compte Amazon Seller", "verification d'identite et de societe, parfois appel video",
   "1 fois, 30 min", "aucun contournement possible"],
  ["Virements fournisseur", "c'est ton argent qui sort",
   "1 fois par commande, 5 min", "un mandat peut etre donne a un tiers, deconseille"],
  ["Signature des contrats", "engagement juridique de la societe",
   "ponctuel", "delegation possible par procuration ecrite"],
];
for (const [a, why, when, how] of LEGAL) {
  console.log(`${a}`);
  console.log(`   pourquoi : ${why}`);
  console.log(`   frequence: ${when}`);
  console.log(`   au mieux : ${how}\n`);
}

console.log("=== CONCLUSION ===");
const ok = LEVELS.filter((l) => !l.impossible && l.share <= 30);
console.log(`Niveaux compatibles avec 10 000 EUR/mois sur ce produit: ${ok.length} sur ${LEVELS.length}.`);
for (const l of ok) console.log(`  ${l.name} : ${l.units} ventes/mois, ${l.share} % du marche, ${l.hours}`);
const ko = LEVELS.filter((l) => l.impossible || l.share > 30);
for (const l of ko) console.log(`  ${l.name} : hors d'atteinte, la delegation mange la marge`);
console.log("\nUne boutique qui rapporte sans aucune action n'existe pas: au-dela d'un certain");
console.log("niveau de delegation, ce que tu paies depasse ce que le produit degage.");
