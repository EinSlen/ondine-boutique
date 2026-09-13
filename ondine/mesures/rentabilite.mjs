// Rentabilite reelle avec publicite payante, par plateforme.
// Couts produits: pod-eu.json au taux USD/EUR reel du 21/08/2026 (0,856037).
// Tarifs publicitaires: benchmarks 2026 releves le 21/08/2026, sources dans PUB.md.
import fs from 'fs';

const USD_EUR = 0.856037;
const produits = JSON.parse(fs.readFileSync(new URL('./pod-eu.json', import.meta.url), 'utf8'));

const base = (motif) => {
  const p = produits.find((x) => new RegExp(motif, 'i').test(x.titre));
  if (!p) throw new Error(`base introuvable: ${motif}`);
  return p.eur_min;
};

// Port UE mesure: 4,79 EUR le premier article textile, 1,45 EUR par article suivant.
// Les pieces lourdes sont majorees, faute de grille publique par produit.
const CATALOGUE = {
  'tee Gildan imprime': { cout: base('Unisex Classic Tee'), port: 4.79 },
  'tee heavyweight imprime': { cout: base('Garment-Dyed Heavyweight'), port: 4.79 },
  'bonnet AOP': { cout: base('AOP Beanie|All-Over Print Beanie'), port: 4.79 },
  'sweat Gildan imprime': { cout: base('Heavy Blend Hoodie'), port: 7.0 },
  'sweat col rond AOP': { cout: base('Recycled Unisex Sweatshirt'), port: 7.0 },
  'sweat capuche AOP': { cout: base('Recycled Unisex Hoodie'), port: 7.0 },
};

// Trois hypotheses de remise, Printful annonce "jusqu'a 33 %" sans detailler les categories.
const REMISES = { aucune: 0, prudente: 0.2, annoncee: 0.33 };

const PRELEVEMENTS = 0.133; // micro-entreprise: 12,3 % cotisations + 1 % versement liberatoire
const PAIEMENT_TAUX = 0.018;
const PAIEMENT_FIXE = 0.25;
const REFASHION = 0.06;
const RETOUR = 0.03;
const FIXES_MOIS = 65;

// Plateformes. CPM France mesure pour Meta (6,95 $), estime pour TikTok, Google se pilote au CPC.
const PLATEFORMES = {
  Meta: { cpm_usd: 6.95, ctr: [0.01, 0.0219], cvr: [0.014, 0.025], cpa_rapporte_usd: 29.99, ajustement_fr: 0.667 },
  TikTok: { cpm_usd: 6.0, ctr: [0.0061, 0.015], cvr: [0.0046, 0.0192], cpa_rapporte_usd: 32.74, ajustement_fr: 0.8 },
  'Google Shopping': { cpc_usd: 0.66, cvr: [0.014, 0.028], cpa_rapporte_usd: 38.87, ajustement_fr: 0.8 },
};

const cpaFourchette = (nom) => {
  const p = PLATEFORMES[nom];
  const eur = (usd) => usd * USD_EUR;
  let bas;
  let haut;
  if (p.cpm_usd) {
    const cpm = eur(p.cpm_usd);
    bas = cpm / 1000 / p.ctr[1] / p.cvr[1];
    haut = cpm / 1000 / p.ctr[0] / p.cvr[0];
  } else {
    const cpc = eur(p.cpc_usd);
    bas = cpc / p.cvr[1];
    haut = cpc / p.cvr[0];
  }
  const rapporte = eur(p.cpa_rapporte_usd) * p.ajustement_fr;
  return { bas, haut, rapporte, retenu: rapporte };
};

const net = (prix, produit, remise, cpa = 0) => {
  const c = CATALOGUE[produit];
  const cout = c.cout * (1 - remise) + c.port;
  const brut = prix - cout - (prix * PAIEMENT_TAUX + PAIEMENT_FIXE) - REFASHION;
  const apresRetours = brut - brut * RETOUR - cout * RETOUR;
  return apresRetours - prix * PRELEVEMENTS - cpa;
};

console.log('=== 1. Cout rendu reel, taux USD/EUR 0,856037 du 21/08/2026 ===\n');
console.log('produit                  | base   | port | rendu sans remise | remise 20 % | remise 33 %');
for (const [nom, c] of Object.entries(CATALOGUE)) {
  const r = (rem) => (c.cout * (1 - rem) + c.port).toFixed(2);
  console.log(
    `${nom.padEnd(25)}| ${c.cout.toFixed(2).padStart(6)} | ${c.port.toFixed(2).padStart(4)} | ` +
      `${r(0).padStart(17)} | ${r(0.2).padStart(11)} | ${r(0.33).padStart(11)}`,
  );
}

console.log('\n=== 2. Cout d acquisition reel par plateforme, France ===\n');
console.log('plateforme       | fourchette entonnoir | CPA rapporte ajuste France');
for (const nom of Object.keys(PLATEFORMES)) {
  const c = cpaFourchette(nom);
  console.log(
    `${nom.padEnd(17)}| ${c.bas.toFixed(2).padStart(6)} a ${c.haut.toFixed(2).padStart(7)} EUR | ${c.rapporte.toFixed(2).padStart(10)} EUR`,
  );
}

console.log('\n=== 3. Marge nette par vente, apres publicite, remise prudente 20 % ===\n');
const prix = {
  'tee Gildan imprime': 29,
  'tee heavyweight imprime': 39,
  'bonnet AOP': 35,
  'sweat Gildan imprime': 69,
  'sweat col rond AOP': 89,
  'sweat capuche AOP': 109,
};
console.log('produit                  | prix | sans pub | Meta   | TikTok | Google');
for (const [nom, p] of Object.entries(prix)) {
  const sansPub = net(p, nom, 0.2);
  const l = Object.keys(PLATEFORMES).map((pl) => net(p, nom, 0.2, cpaFourchette(pl).retenu));
  console.log(
    `${nom.padEnd(25)}| ${String(p).padStart(4)} | ${sansPub.toFixed(2).padStart(8)} | ` +
      l.map((x) => x.toFixed(2).padStart(6)).join(' | '),
  );
}

console.log('\n=== 4. CPA maximum supportable, par produit et par prix ===\n');
console.log('un CPA au-dessus de cette valeur fait vendre a perte\n');
console.log('produit                  | 59 E | 69 E | 79 E | 89 E | 99 E | 109 E | 119 E');
for (const nom of ['sweat Gildan imprime', 'sweat col rond AOP', 'sweat capuche AOP']) {
  const l = [59, 69, 79, 89, 99, 109, 119].map((p) => net(p, nom, 0.2).toFixed(0).padStart(4));
  console.log(`${nom.padEnd(25)}| ${l.join(' | ')}`);
}

console.log('\n=== 5. Compte de resultat mensuel, sweat col rond AOP a 89 EUR sur Meta ===\n');
const CPA_META = cpaFourchette('Meta').retenu;
const produitTest = 'sweat col rond AOP';
const prixTest = 89;
const netUnitaire = net(prixTest, produitTest, 0.2, CPA_META);
console.log('ventes/mois | CA      | cout produits | pub     | prelevements | net apres fixes');
for (const v of [10, 30, 50, 71, 100, 200, 400]) {
  const ca = v * prixTest;
  const c = CATALOGUE[produitTest];
  const coutProduits = v * (c.cout * 0.8 + c.port) * (1 + RETOUR);
  const pub = v * CPA_META;
  const prelev = ca * PRELEVEMENTS;
  const netMois = v * netUnitaire - FIXES_MOIS;
  const alerte = ca * 12 > 85000 ? '  franchise TVA depassee' : '';
  console.log(
    `${String(v).padStart(11)} | ${ca.toFixed(0).padStart(7)} | ${coutProduits.toFixed(0).padStart(13)} | ` +
      `${pub.toFixed(0).padStart(7)} | ${prelev.toFixed(0).padStart(12)} | ${netMois.toFixed(0).padStart(16)}${alerte}`,
  );
}

console.log('\n=== 6. Seuils ===\n');
console.log(`marge nette par vente apres pub Meta : ${netUnitaire.toFixed(2)} EUR`);
console.log(`ventes/mois pour couvrir les charges fixes : ${Math.ceil(FIXES_MOIS / netUnitaire)}`);
console.log(`ventes/mois pour 1 000 EUR nets : ${Math.ceil((1000 + FIXES_MOIS) / netUnitaire)}`);
console.log(`ventes/mois pour 3 000 EUR nets : ${Math.ceil((3000 + FIXES_MOIS) / netUnitaire)}`);
console.log(`plafond franchise a ${prixTest} EUR : ${Math.floor(85000 / prixTest / 12)} ventes/mois`);
console.log(`ROAS a atteindre : ${(prixTest / net(prixTest, produitTest, 0.2)).toFixed(2)}`);

console.log('\n=== 7. Phase 2, apres le plafond de la franchise: societe et TVA ===\n');
const netSociete = (prix, produit, remise, cpa) => {
  const c = CATALOGUE[produit];
  const cout = c.cout * (1 - remise) + c.port;
  const ht = prix / 1.2;
  const brut = ht - cout - (prix * PAIEMENT_TAUX + PAIEMENT_FIXE) - REFASHION;
  const apresRetours = brut - brut * RETOUR - cout * RETOUR;
  return apresRetours * 0.85 - cpa;
};
console.log('produit                  | prix | net apres TVA, IS et pub Meta | ventes/mois pour 10 000 EUR');
for (const [nom, p] of [
  ['sweat Gildan imprime', 89],
  ['sweat col rond AOP', 99],
  ['sweat col rond AOP', 109],
  ['sweat capuche AOP', 119],
  ['sweat capuche AOP', 129],
]) {
  const n = netSociete(p, nom, 0.2, CPA_META);
  console.log(
    `${nom.padEnd(25)}| ${String(p).padStart(4)} | ${n.toFixed(2).padStart(29)} | ` +
      `${n > 0 ? String(Math.ceil(10185 / n)).padStart(26) : 'jamais'.padStart(26)}`,
  );
}

console.log('\n=== 8. Ou le risque est vraiment ===\n');
const c = cpaFourchette('Meta');
console.log(`Si le CPA Meta sort au haut de la fourchette (${c.haut.toFixed(2)} EUR) :`);
for (const [nom, p] of [
  ['sweat Gildan imprime', 69],
  ['sweat col rond AOP', 89],
  ['sweat capuche AOP', 109],
]) {
  const n = net(p, nom, 0.2, c.haut);
  console.log(`  ${nom.padEnd(23)} a ${p} EUR : ${n.toFixed(2)} EUR par vente${n < 0 ? '  A PERTE' : ''}`);
}
console.log('\nC est pour cela que la phase de test a 300 EUR mesure le CPA avant de monter le budget.');
