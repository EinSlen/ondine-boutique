// node calcul-marges.mjs : detailed per-sale margin for Plafond Céleste, every line visible

// Rates checked on 9/11/2026: micro BIC sales 12.3 % + CFP 0.1 %, Shopify Payments Basic ~1.5 % + 0.25 €,
// EU low-value parcels 3 € duty + 2 € handling per item category, French national parcel tax suspended since 1/7/2026.
const COTISATIONS = 0.124;
const PAIEMENT_PCT = 0.015;
const PAIEMENT_FIXE = 0.25;
const RETOURS = 0.05;
const TAXES_COLIS = 5;
const TVA_IMPORT = 0.2;

// achat: price paid to the supplier, ttc: VAT already included (AliExpress), port: shipping not included in achat, agent: agent fee per order
// AliExpress prices are the exact variant sold (checked variant by variant on 9/11/2026)
const PRODUITS = [
  { nom: "Lucarne 6 disques (AliExpress 6 Slide D)", prix: 34.9, achat: 15.19, ttc: true, port: 0, agent: 0 },
  { nom: "Lucarne 12 disques (AliExpress 12 Slide D)", prix: 39.9, achat: 22.19, ttc: true, port: 0, agent: 0 },
  { nom: "Lucarne 12 disques à 29,90 (ancien calcul)", prix: 29.9, achat: 22.19, ttc: true, port: 0, agent: 0 },
  { nom: "Boréale (AliExpress Aurora with Remote)", prix: 34.9, achat: 7.89, ttc: true, port: 2.5, agent: 0 },
  { nom: "Astro 12 disques (AliExpress)", prix: 39.9, achat: 16.79, ttc: true, port: 0, agent: 0 },
  { nom: "Lagon cube 16 couleurs (AliExpress)", prix: 29.9, achat: 8.05, ttc: true, port: 2.5, agent: 0 },
  { nom: "Orbe 5 cm (AliExpress)", prix: 24.9, achat: 6.59, ttc: true, port: 2.5, agent: 0 },
  { nom: "Couchant (AliExpress)", prix: 19.9, achat: 4.59, ttc: true, port: 2.5, agent: 0 },
  { nom: "Phébé (AliExpress, sans gravure)", prix: 74, achat: 66.69, ttc: true, port: 0, agent: 0 },
  { nom: "Phébé (agent 30 € HT gravée)", prix: 74, achat: 30, ttc: false, port: 0, agent: 1.5, extra: 2 },
  { nom: "Lucarne (agent 5 € HT)", prix: 29.9, achat: 5, ttc: false, port: 0, agent: 1.5 }
];

const eur = (n) => (n >= 0 ? "+" : "") + n.toFixed(2).replace(".", ",");
const lignes = PRODUITS.map((p) => {
  const cotis = p.prix * COTISATIONS;
  const paiement = p.prix * PAIEMENT_PCT + PAIEMENT_FIXE;
  const retours = p.prix * RETOURS;
  const achatTtc = p.ttc ? p.achat : p.achat * (1 + TVA_IMPORT);
  const cout = achatTtc + p.port + p.agent + (p.extra || 0) + TAXES_COLIS;
  const reste = p.prix - cotis - paiement - retours - cout;
  return { ...p, cotis, paiement, retours, achatTtc, cout, reste };
});

console.log("Produit | Prix | Micro 12,4 % | Paiement | Retours 5 % | Achat TTC | Port | Agent+extra | Taxes | Reste");
for (const l of lignes) {
  console.log([l.nom, l.prix.toFixed(2), l.cotis.toFixed(2), l.paiement.toFixed(2), l.retours.toFixed(2), l.achatTtc.toFixed(2), l.port.toFixed(2), (l.agent + (l.extra || 0)).toFixed(2), TAXES_COLIS.toFixed(2), eur(l.reste)].join(" | "));
}
