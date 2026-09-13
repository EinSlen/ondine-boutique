/**
 * Buying without talking to anyone. Alibaba "Ready to Ship": fixed price, in stock,
 * add to cart, pay by card. MOQ of 1 to 10 on the laser level, measured 06/08/2026.
 *
 * The honest catch is at the end: one message stays unavoidable, and it is not negotiable.
 */
const r2 = (x) => Math.round(x * 100) / 100;
const PRICE = 79.99, PRICE_HT = r2(PRICE / 1.2);
const MARKET = 2500, TARGET = 10000, IS = 0.25, FIXED = 340;

// Ready to Ship, measured. Low end = larger quantity, high end = at MOQ.
const TIERS = [
  { label: "MOQ 1, pour demarrer", unit: 16.61, moq: 1 },
  { label: "MOQ 10", unit: 12.68, moq: 10 },
  { label: "quantite moyenne", unit: 8.57, moq: 2 },
  { label: "gros volume", unit: 7.87, moq: 10 },
];

const AMZ_FEES = r2(PRICE * 0.15 + 5.50 + 0.35);
const ADS = r2(PRICE * 0.08);
const RETURNS = r2(PRICE * 0.03);
const ECO = 0.67;

console.log("ACHAT SANS CONTACT: ALIBABA READY TO SHIP + AMAZON FBA\n");
console.log("palier                  prix u   fret+droits   cout rendu   marge/u   ventes 10k   part");
for (const t of TIERS) {
  const freight = r2(1.5 * 1.8);
  const duty = r2((t.unit + freight) * 0.035);
  const landed = r2(t.unit + freight + duty);
  const margin = r2(PRICE_HT - landed - AMZ_FEES - ADS - RETURNS - ECO);
  const units = Math.ceil((TARGET / (1 - IS) + FIXED) / margin);
  const share = Math.round((100 * units) / MARKET);
  console.log(`${t.label.padEnd(23)} ${t.unit.toFixed(2).padStart(6)} ${r2(freight + duty).toFixed(2).padStart(13)}`
    + ` ${landed.toFixed(2).padStart(12)} ${margin.toFixed(2).padStart(9)} ${String(units).padStart(12)} ${(share + " %").padStart(6)}`
    + (share <= 30 ? "   VIABLE" : "   hors d'atteinte"));
}

console.log("\n=== LE PARCOURS, SANS PARLER A PERSONNE ===");
for (const s of [
  "1. Filtrer sur Ready to Ship, trier par prix, choisir une fiche notee et ancienne",
  "2. Ajouter au panier, choisir la quantite, payer par carte via Trade Assurance",
  "3. Choisir l'option de livraison proposee dans le tunnel de commande",
  "4. Suivre l'expedition depuis le compte Alibaba, comme un colis normal",
]) console.log("  " + s);

console.log("\n=== CE QUE CE MODE NE FOURNIT PAS, ET QUI RESTE OBLIGATOIRE ===");
console.log("  Sur un produit laser, tu es l'importateur: tu reponds penalement de sa conformite.");
console.log("  Ready to Ship livre le produit, pas les documents. Il faut donc:\n");
for (const [t, how] of [
  ["Declaration UE de conformite + rapport EN 60825-1",
   "UN seul message au vendeur, deja redige dans lancement/1-message-fournisseurs.md"],
  ["Confirmation de la classe laser 2 sous 1 mW",
   "meme message, c'est le point le plus important"],
  ["Nom et adresse de l'importateur sur le produit",
   "obligation R122-1, a demander ou a etiqueter par un prestataire"],
]) console.log(`  - ${t}\n      ${how}`);

console.log("\n=== LES DEUX FACONS D'EVITER MEME CE MESSAGE ===");
for (const [n, d, cost] of [
  ["Choisir une fiche qui publie deja ses certificats",
   "beaucoup de fiches Ready to Ship affichent CE, RoHS et le rapport laser en telechargement",
   "0 EUR, mais choix de fiches plus restreint"],
  ["Passer par un grossiste europeen en libre-service",
   "BigBuy, VidaXL, Ankorstore: catalogue en ligne, conformite deja portee par l'importateur UE",
   "environ 8 a 12 EUR de plus par unite, la marge tombe sous le seuil"],
]) console.log(`  ${n}\n     ${d}\n     cout: ${cost}\n`);

console.log("=== LIVRAISON VERS AMAZON ===");
console.log("  Ready to Ship livre a l'adresse que tu indiques. Deux options:");
console.log("   a. Livraison chez toi, puis reexpedition vers Amazon: tu manipules, exclu.");
console.log("   b. Indiquer directement l'adresse de l'entrepot Amazon FBA: possible, mais les");
console.log("      etiquettes FNSKU doivent etre posees avant. Amazon propose son service");
console.log("      d'etiquetage a 0,55 EUR par unite: c'est la solution sans manipulation.");
const label = 0.55;
const landed = r2(12.68 + 2.7 + 0.54);
const marginWithLabel = r2(PRICE_HT - landed - AMZ_FEES - ADS - RETURNS - ECO - label);
const units = Math.ceil((TARGET / (1 - IS) + FIXED) / marginWithLabel);
console.log(`\n  Avec etiquetage Amazon a ${label} EUR: marge ${marginWithLabel.toFixed(2)} EUR,`
  + ` ${units} ventes pour 10 000 EUR, soit ${Math.round(100 * units / MARKET)} % du marche.`);
