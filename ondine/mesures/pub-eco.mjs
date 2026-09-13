// Economie de la publicite payante: CPA maximum, ROAS minimum, effet du panier.
// Memes hypotheses que pnl-marque.mjs. Bases mesurees dans pod-eu.json.
const TVA = 0.2;
const PAIEMENT_TAUX = 0.018;
const PAIEMENT_FIXE = 0.25;
const REFASHION = 0.06;
const TAUX_RETOUR = 0.05;

const BASES = {
  'sweat AOP capuche': { cout: 42.09, port: 7.5 },
  'sweat AOP col rond': { cout: 33.53, port: 7.0 },
  'tee AOP homme': { cout: 24.0, port: 4.79 },
  'bonnet AOP': { cout: 14.34, port: 4.79 },
  'tote AOP': { cout: 15.49, port: 4.79 },
  'sweat imprime classique': { cout: 22.89, port: 6.5 },
};

// Un panier est une liste de [base, prix TTC]. Le port du 2e article est de 1,45 EUR.
const contribution = (panier) => {
  let ht = 0;
  let cout = 0;
  let ttc = 0;
  panier.forEach(([base, prix], i) => {
    const b = BASES[base];
    ht += prix / (1 + TVA);
    ttc += prix;
    cout += b.cout + (i === 0 ? b.port : 1.45) + REFASHION;
  });
  const paiement = ttc * PAIEMENT_TAUX + PAIEMENT_FIXE;
  const brute = ht - cout - paiement;
  const retours = brute * TAUX_RETOUR + cout * TAUX_RETOUR;
  return { ttc, ht, cout, contribution: brute - retours };
};

const ligne = (nom, panier) => {
  const r = contribution(panier);
  const roasBe = r.ttc / r.contribution;
  return {
    nom,
    ttc: r.ttc,
    contribution: r.contribution,
    cpa_max: r.contribution,
    roas_seuil: roasBe,
    cpa_pour_garder_20: r.contribution - 20,
    ventes_pour_10k_a_cpa_20: r.contribution - 20 > 0 ? Math.ceil(10185 / (r.contribution - 20)) : null,
  };
};

const cas = [
  ['Tee AOP seul a 59', [['tee AOP homme', 59]]],
  ['Sweat classique a 69', [['sweat imprime classique', 69]]],
  ['Sweat AOP col rond a 99', [['sweat AOP col rond', 99]]],
  ['Sweat AOP capuche a 129', [['sweat AOP capuche', 129]]],
  ['Sweat AOP capuche a 159', [['sweat AOP capuche', 159]]],
  ['Sweat 129 + bonnet 39', [['sweat AOP capuche', 129], ['bonnet AOP', 39]]],
  ['Sweat 129 + tote 49', [['sweat AOP capuche', 129], ['tote AOP', 49]]],
  ['Sweat 159 + bonnet 39 + tote 49', [['sweat AOP capuche', 159], ['bonnet AOP', 39], ['tote AOP', 49]]],
];

console.log('Le CPA se paie une fois par CLIENT, jamais par article. Un panier a deux articles');
console.log('divise donc le cout d acquisition par article, sans rien changer a la pub.\n');
console.log('panier                            | TTC    | contrib | CPA max | ROAS seuil | ventes/mois a CPA 20');
console.log('-'.repeat(104));
for (const [nom, panier] of cas) {
  const r = ligne(nom, panier);
  console.log(
    `${nom.padEnd(33)} | ${r.ttc.toFixed(0).padStart(5)} E | ${r.contribution.toFixed(2).padStart(7)} | ` +
      `${r.cpa_max.toFixed(2).padStart(7)} | ${r.roas_seuil.toFixed(2).padStart(10)} | ` +
      `${r.ventes_pour_10k_a_cpa_20 ? String(r.ventes_pour_10k_a_cpa_20).padStart(7) : ' JAMAIS'}`,
  );
}

console.log('\nLecture:');
console.log('  ROAS seuil = chiffre d affaires TTC a generer par euro de pub pour ne rien perdre.');
console.log('  Un pixel neuf tient 1,5 a 2,5 en mode. Au-dela de 3,5 le plan ne demarre pas,');
console.log('  c est ce qui avait deja tue la fontaine a eau en aout.');
console.log('  Objectif 10 000 EUR nets, charges fixes 185 EUR/mois incluses.');
