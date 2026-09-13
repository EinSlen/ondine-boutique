// P&L d'une marque de vetements en print-on-demand fabrique en UE.
// Bases: pod-eu.json (mesure Printful du 21/08/2026), livraison UE mesuree 4,79 EUR
// premier article textile + 1,45 EUR par article suivant.
const TVA = 0.20;
const IS_TAUX_1 = 0.15;
const IS_PLAFOND_1 = 42500;
const IS_TAUX_2 = 0.25;

const FIXES_MOIS = {
  shopify: 32,
  domaine: 1.5,
  comptable: 100,
  rc_pro: 15,
  mediateur: 6,
  outils_ia: 30,
};
const FIXES = Object.values(FIXES_MOIS).reduce((a, b) => a + b, 0);

const scenarios = [
  { nom: 'Tee heavyweight (Comfort Colors 1717)', ttc: 39, base: 14.14, port: 4.79 },
  { nom: 'Sweat capuche (Cotton Heritage M2580)', ttc: 69, base: 22.89, port: 6.5 },
  { nom: 'Sweat AOP recycle, piece unique', ttc: 129, base: 42.09, port: 7.5 },
  { nom: 'Sweat AOP recycle, pousse a 159', ttc: 159, base: 42.09, port: 7.5 },
  { nom: 'Tote AOP piece unique', ttc: 49, base: 15.49, port: 4.79 },
];

const ligne = (s, cpa) => {
  const ht = s.ttc / (1 + TVA);
  const paiement = s.ttc * 0.018 + 0.25;
  const refashion = 0.06;
  const brute = ht - s.base - s.port - paiement - refashion;
  const retours = brute * 0.05 + (s.base + s.port) * 0.05;
  const nette = brute - retours - cpa;
  return { ...s, ht, brute, nette, pour10k: nette > 0 ? Math.ceil((10000 + FIXES) / nette) : null };
};

for (const cpa of [0, 15]) {
  console.log(`\n=== CPA ${cpa} EUR ${cpa === 0 ? '(organique seul, modele live2die)' : '(pub payante)'} ===`);
  console.log('prix TTC | HT     | base   | marge nette | pieces/mois pour 10k nets');
  for (const s of scenarios) {
    const r = ligne(s, cpa);
    console.log(
      `${String(s.ttc).padStart(6)} E | ${r.ht.toFixed(2).padStart(6)} | ${String(s.base).padStart(6)} | ` +
        `${r.nette.toFixed(2).padStart(11)} | ${r.pour10k ? String(r.pour10k).padStart(6) : ' JAMAIS'}   ${s.nom}`,
    );
  }
}

console.log(`\nCharges fixes: ${FIXES} EUR/mois (${Object.entries(FIXES_MOIS).map(([k, v]) => `${k} ${v}`).join(', ')})`);

const impot = (benefice) =>
  benefice <= IS_PLAFOND_1
    ? benefice * IS_TAUX_1
    : IS_PLAFOND_1 * IS_TAUX_1 + (benefice - IS_PLAFOND_1) * IS_TAUX_2;

console.log('\n=== apres impot sur les societes, sur 12 mois a 10k/mois ===');
const an = 10000 * 12;
console.log(`benefice annuel ${an} EUR, IS ${impot(an).toFixed(0)} EUR, net ${((an - impot(an)) / 12).toFixed(0)} EUR/mois`);

console.log('\n=== tresorerie immobilisee ===');
console.log('POD: 0 EUR de stock. Printful preleve a la commande, encaissement Shopify sous 3 jours.');
console.log('Rappel FBA niveau laser: 25 000 EUR de tresorerie permanente. C est le seul vrai gain du POD.');
