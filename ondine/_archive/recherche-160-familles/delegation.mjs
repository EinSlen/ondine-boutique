/**
 * Compare fulfilment models for the laser range, with everything delegated.
 *
 * The study always assumed Shopify plus paid ads. The demand was measured ON Amazon, so
 * selling there removes the acquisition cost entirely and delegates storage, shipping,
 * returns and first-line support in one move.
 *
 * Figures: Amazon FR fee schedule 2026, tools and DIY category.
 */
const r2 = (x) => Math.round(x * 100) / 100;

const PRICE = 79.99;
const COST = 17.47;        // landed, sea freight, in volume
const KG = 1.8;

// --- Shopify plus paid ads, fully delegated operations ---
const shopify = () => {
  const fee = r2(PRICE * 0.014 + 0.25);   // Shopify Payments FR
  const cpa = 25;                          // Meta or Google, hypothesis
  const pick = 3.20;                       // 3PL pick and pack
  const ship = 5.90;                       // Colissimo 2 kg negotiated
  const support = 1.20;                    // delegated first-line support
  const net = r2(PRICE - COST - fee - cpa - pick - ship - support);
  return { name: "Shopify + pub + 3PL", net, detail: { fee, cpa, pick, ship, support } };
};

// --- Amazon FBA: Amazon holds the stock, ships, handles returns and support ---
const fba = () => {
  const commission = r2(PRICE * 0.15);     // tools category
  const fulfil = 5.50;                     // standard parcel around 2 kg
  const storage = 0.35;                    // per unit per month
  const ads = r2(PRICE * 0.08);            // Sponsored Products, optional but realistic
  const returns = r2(PRICE * 0.02);        // provision, returns are frequent on Amazon
  const net = r2(PRICE - COST - commission - fulfil - storage - ads - returns);
  return { name: "Amazon FBA", net, detail: { commission, fulfil, storage, ads, returns } };
};

// --- Both: Amazon for volume, Shopify for margin and the customer relationship ---
const models = [shopify(), fba()];

console.log("NIVEAU LASER 4x360, prix de vente " + PRICE.toFixed(2) + " EUR, cout rendu " + COST.toFixed(2) + " EUR\n");
console.log("modele                   net/vente   detail des couts");
for (const m of models) {
  const d = Object.entries(m.detail).map(([k, v]) => `${k} ${v}`).join("  ");
  console.log(`${m.name.padEnd(24)} ${m.net.toFixed(2).padStart(9)}   ${d}`);
}

console.log("\n=== REVENU MENSUEL SELON LE VOLUME ===");
console.log("ventes/mois   Shopify+pub    Amazon FBA");
for (const n of [100, 277, 375, 500, 800]) {
  console.log(String(n).padStart(11) + r2(n * models[0].net).toFixed(0).padStart(14) + r2(n * models[1].net).toFixed(0).padStart(14));
}

console.log("\n=== CE QUI EST DELEGUE DANS CHAQUE MODELE ===");
const tasks = [
  ["stockage", "3PL", "Amazon"],
  ["preparation et expedition", "3PL", "Amazon"],
  ["retours", "3PL, a organiser", "Amazon, automatique"],
  ["service client niveau 1", "prestataire ou IA", "Amazon"],
  ["acquisition du trafic", "toi ou agence, payant", "Amazon, organique + Ads"],
  ["fiches produit et SEO", "IA", "IA"],
  ["visuels", "photos fournisseur retouchees", "photos fournisseur retouchees"],
  ["comptabilite", "expert-comptable", "expert-comptable"],
  ["import et douane", "transitaire", "transitaire"],
];
console.log("tache                        Shopify+3PL                Amazon FBA");
for (const [t, a, b] of tasks) console.log(`${t.padEnd(28)} ${a.padEnd(26)} ${b}`);

console.log("\n=== CE QUI RESTE INCOMPRESSIBLE POUR TOI ===");
for (const t of [
  "Immatriculation au guichet unique INPI, puis creation de societe au-dela de 203 100 EUR de CA",
  "Ouverture des comptes: banque pro, Amazon Seller ou Shopify, transitaire",
  "Choix et validation du fournisseur, verification des echantillons et du marquage CE",
  "Paiement des commandes et suivi de la tresorerie",
  "Decisions de prix et arbitrages",
]) console.log("  - " + t);

console.log("\n=== COUTS FIXES MENSUELS, TOUT DELEGUE ===");
const fixed = [
  ["expert-comptable", 120],
  ["abonnement Shopify Basic", 32],
  ["Amazon Seller Pro", 39],
  ["mediateur consommation", 6],
  ["outils IA (redaction, visuels)", 40],
];
let sum = 0;
for (const [n, c] of fixed) { sum += c; console.log(`  ${n.padEnd(34)} ${String(c).padStart(4)} EUR/mois`); }
console.log(`  ${"TOTAL".padEnd(34)} ${String(sum).padStart(4)} EUR/mois`);
console.log(`\nSoit ${Math.ceil(sum / models[1].net)} ventes par mois en FBA juste pour couvrir les frais fixes.`);
