/**
 * What "a shop plus a connector that does everything" actually means, priced out.
 *
 * Four real setups exist. They automate execution to different degrees and cost very
 * different amounts of margin. The trap is that the most automated one is also the one
 * the whole study proved unviable.
 */
const r2 = (x) => Math.round(x * 100) / 100;
const PRICE = 79.99;
const PRICE_HT = r2(PRICE / 1.2);
const MARKET = 2500;
const TARGET = 10000;
const IS = 0.25;

const SETUPS = [
  {
    name: "A. Dropshipping automatise",
    tools: "AutoDS, DSers, Zendrop, CJdropshipping",
    // No stock. Cost is the AliExpress retail price, which is the whole problem.
    cost: 22.90,              // AliExpress retail, measured
    fees: 0,                  // supplier ships direct
    platform: r2(PRICE * 0.014 + 0.25),
    ads: 25,                  // full CPA, no Amazon traffic
    subs: 45,                 // Shopify + connector subscription
    auto: "total: catalogue, commande, tracking, tout est synchronise",
    touch: "aucune manipulation",
    delay: "12 a 25 jours",
  },
  {
    name: "B. Shopify + 3PL France",
    tools: "Bigblue, Cubyn, ShipBob, integres a Shopify",
    cost: 14.56,              // landed cost, bought in volume
    fees: r2(2.90 + 5.40),    // pick and pack + shipping
    platform: r2(PRICE * 0.014 + 0.25),
    ads: 25,
    subs: 32,
    auto: "commande vers 3PL automatique, tracking automatique",
    touch: "aucune, le fournisseur livre au 3PL",
    delay: "48 h au client",
  },
  {
    name: "C. Amazon FBA",
    tools: "Seller Central, aucun connecteur necessaire",
    cost: 14.56,
    fees: r2(PRICE * 0.15 + 5.50 + 0.35),
    platform: 0,
    ads: r2(PRICE * 0.08),    // Amazon Ads, traffic already there
    subs: 39,
    auto: "stockage, expedition, retours, SAV, tout chez Amazon",
    touch: "aucune, le fournisseur livre a l'entrepot Amazon",
    delay: "24 a 48 h au client",
  },
  {
    name: "D. FBA + Shopify (MCF)",
    tools: "Amazon Multi-Channel Fulfillment, connecte a Shopify",
    cost: 14.56,
    fees: r2(PRICE * 0.15 * 0.6 + 7.20 + 0.35),   // mix des deux canaux
    platform: r2(PRICE * 0.014 * 0.4 + 0.10),
    ads: r2(PRICE * 0.08 * 0.6 + 25 * 0.4),
    subs: 71,
    auto: "un seul stock chez Amazon sert les deux canaux",
    touch: "aucune",
    delay: "24 a 72 h",
  },
];

console.log("QUATRE MONTAGES REELS, CHIFFRES SUR LE NIVEAU LASER\n");
console.log("montage                        marge/u   ventes 10k   part marche   delai client");
for (const s of SETUPS) {
  const perUnit = r2(PRICE_HT - s.cost - s.fees - s.platform - s.ads);
  s.margin = perUnit;
  if (perUnit <= 0) {
    console.log(`${s.name.padEnd(30)} ${perUnit.toFixed(2).padStart(8)}   marge negative`);
    s.units = Infinity; s.share = Infinity;
    continue;
  }
  const units = Math.ceil((TARGET / (1 - IS) + s.subs + 300) / perUnit);
  const share = Math.round((100 * units) / MARKET);
  s.units = units; s.share = share;
  console.log(`${s.name.padEnd(30)} ${perUnit.toFixed(2).padStart(8)} ${String(units).padStart(12)} ${(share + " %").padStart(13)}   ${s.delay}`
    + (share > 30 ? "   HORS D'ATTEINTE" : ""));
}

console.log("\n=== DETAIL DE CHAQUE MONTAGE ===");
for (const s of SETUPS) {
  console.log(`\n${s.name}`);
  console.log(`  outils        : ${s.tools}`);
  console.log(`  automatisation: ${s.auto}`);
  console.log(`  manipulation  : ${s.touch}`);
  console.log(`  cout produit  : ${s.cost.toFixed(2)} EUR   frais logistique: ${s.fees.toFixed(2)} EUR   pub: ${s.ads.toFixed(2)} EUR`);
  console.log(`  abonnements   : ${s.subs} EUR/mois`);
}

console.log("\n=== POURQUOI LE PLUS AUTOMATISE EST LE MOINS VIABLE ===");
const a = SETUPS[0], c = SETUPS[2];
console.log(`  Le dropshipping automatise achete au prix PUBLIC d'AliExpress: ${a.cost.toFixed(2)} EUR.`);
console.log(`  Acheter en volume chez le fabricant coute ${c.cost.toFixed(2)} EUR, soit ${r2(a.cost - c.cost).toFixed(2)} EUR de moins par unite.`);
console.log(`  Sur ${c.units} ventes par mois, l'ecart represente ${r2((a.cost - c.cost) * c.units).toFixed(0)} EUR mensuels.`);
console.log(`  Le connecteur supprime le travail, pas le surcout. C'est le surcout qui bloque.`);

console.log("\n=== CE QU'IL FAUT SAVOIR SUR LES OFFRES CLE EN MAIN ===");
for (const t of [
  "Les 'boutiques automatisees livrees cle en main' vendues en ligne sont majoritairement",
  "un business de formation: le vendeur gagne sur la formation, pas sur l'e-commerce.",
  "Verifier toujours si le vendeur vit de sa boutique ou de la vente de la methode.",
  "Aucun connecteur ne negocie un prix fournisseur, ne cree une fiche qui convertit,",
  "ni ne repond d'un produit non conforme. Ce sont les trois choses qui font la difference.",
]) console.log("  " + t);
