// Jusqu'ou le prix peut descendre sans casser la marge.
// Empile les leviers de cout mesures le 21/08/2026 et calcule le prix plancher
// par regime fiscal. Le but est que le client paye le moins possible.
const BASES = {
  'sweat AOP capuche': { cout: 42.09, port: 7.5 },
  'sweat AOP col rond': { cout: 33.53, port: 7.0 },
  'tee AOP homme': { cout: 24.0, port: 4.79 },
  'bonnet AOP': { cout: 14.34, port: 4.79 },
  'tote AOP': { cout: 15.49, port: 4.79 },
  'sweat DTF classique': { cout: 22.89, port: 6.5 },
  'tee DTF heavyweight': { cout: 14.14, port: 4.79 },
};

// Leviers. remise_growth: abonnement Printful Growth, 24,99 $/mois, offert au-dela de
// 12 000 $/an de ventes, jusqu'a 33 % sur les produits. On retient 20 %, prudent.
const LEVIERS = {
  remise_growth: 0.2,
  taux_retour_avec_guide: 0.03,
  taux_retour_sans_guide: 0.05,
};

const PAIEMENT_TAUX = 0.018;
const PAIEMENT_FIXE = 0.25;
const REFASHION = 0.06;

// Regimes. La franchise en base s'applique jusqu'a 85 000 EUR de CA annuel
// (tolerance 93 500). Printful ne facture pas de TVA sur une commande expediee
// en France quand aucun numero de TVA n'est fourni.
const REGIMES = {
  'micro + franchise TVA': {
    tva_vente: 0,
    tva_achat: 0,
    prelevements_sur_ca: 0.133,
    fixes_mois: 65,
    plafond_ca_an: 85000,
  },
  // Scenario defavorable: si l'administration qualifie les achats Printful d'acquisitions
  // intracommunautaires au-dela de 10 000 EUR/an, la TVA est autoliquidee et NON deductible
  // en franchise en base. A trancher avec un comptable, c'est la seule inconnue lourde.
  'micro + franchise + autoliquidation': {
    tva_vente: 0,
    tva_achat: 0.2,
    prelevements_sur_ca: 0.133,
    fixes_mois: 65,
    plafond_ca_an: 85000,
  },
  'micro + TVA': {
    tva_vente: 0.2,
    tva_achat: 0,
    prelevements_sur_ca: 0.133,
    fixes_mois: 65,
    plafond_ca_an: 188700,
  },
  'societe + TVA': {
    tva_vente: 0.2,
    tva_achat: 0,
    prelevements_sur_ca: 0,
    is: 0.15,
    fixes_mois: 185,
    plafond_ca_an: null,
  },
};

const marge = (prix, base, regime, { growth = false, guide = false } = {}) => {
  const b = BASES[base];
  const r = REGIMES[regime];
  const cout = (growth ? b.cout * (1 - LEVIERS.remise_growth) : b.cout) * (1 + r.tva_achat);
  const port = b.port * (1 + r.tva_achat);
  const recette = r.tva_vente ? prix / (1 + r.tva_vente) : prix;
  const paiement = prix * PAIEMENT_TAUX + PAIEMENT_FIXE;
  const brut = recette - cout - port - paiement - REFASHION;
  const tauxRetour = guide ? LEVIERS.taux_retour_avec_guide : LEVIERS.taux_retour_sans_guide;
  const retours = brut * tauxRetour + (cout + port) * tauxRetour;
  const avantImpot = brut - retours - prix * r.prelevements_sur_ca;
  const net = r.is ? avantImpot * (1 - r.is) : avantImpot;
  return { net, cout, recette, roas: prix / net };
};

const prixPlancher = (base, regime, opts, netVoulu) => {
  for (let p = 19; p <= 300; p += 1) {
    if (marge(p, base, regime, opts).net >= netVoulu) return p;
  }
  return null;
};

console.log('=== Ou passait l argent, sur le sweat AOP capuche a 129 EUR ===\n');
const avant = marge(129, 'sweat AOP capuche', 'societe + TVA', {});
const apres = marge(129, 'sweat AOP capuche', 'micro + franchise TVA', { growth: true, guide: true });
console.log(`plan initial, societe + TVA, sans remise : net ${avant.net.toFixed(2)} EUR`);
console.log(`micro + franchise + Growth + guide tailles : net ${apres.net.toFixed(2)} EUR`);
console.log(`gain par piece : ${(apres.net - avant.net).toFixed(2)} EUR\n`);

console.log('=== Prix a marge nette equivalente, tous leviers actives ===');
console.log('cible : garder les 50 EUR nets du plan initial\n');
for (const base of Object.keys(BASES)) {
  const p = prixPlancher(base, 'micro + franchise TVA', { growth: true, guide: true }, 50);
  const pAvant = prixPlancher(base, 'societe + TVA', {}, 50);
  console.log(
    `${base.padEnd(20)} : ${pAvant ? pAvant + ' EUR' : 'impossible'} avant, ` +
      `${p ? p + ' EUR' : 'impossible'} apres`,
  );
}

console.log('\n=== Combien le client peut payer, par niveau de marge voulu ===');
console.log('sweat AOP capuche, micro + franchise + Growth + guide tailles\n');
console.log('marge nette voulue | prix client | ROAS seuil | ventes/mois pour 3000 EUR nets');
for (const cible of [30, 35, 40, 45, 50, 60]) {
  const p = prixPlancher('sweat AOP capuche', 'micro + franchise TVA', { growth: true, guide: true }, cible);
  if (!p) continue;
  const m = marge(p, 'sweat AOP capuche', 'micro + franchise TVA', { growth: true, guide: true });
  console.log(
    `${String(cible).padStart(15)} E | ${String(p).padStart(9)} E | ${m.roas.toFixed(2).padStart(10)} | ${String(Math.ceil(3065 / m.net)).padStart(10)}`,
  );
}

console.log('\n=== Le plafond de la franchise ===');
for (const prix of [89, 99, 109, 129]) {
  const m = marge(prix, 'sweat AOP capuche', 'micro + franchise TVA', { growth: true, guide: true });
  const ventesPlafond = Math.floor(85000 / prix);
  console.log(
    `a ${prix} EUR : ${ventesPlafond} ventes/an avant le seuil de 85 000 EUR, ` +
      `soit ${Math.floor(ventesPlafond / 12)}/mois et ${Math.round((ventesPlafond / 12) * m.net)} EUR nets/mois`,
  );
}

console.log('\n=== Grille de prix proposee, micro + franchise + Growth + guide ===');
const grille = [
  ['bonnet AOP', 29],
  ['tote AOP', 35],
  ['tee DTF heavyweight', 49],
  ['tee AOP homme', 69],
  ['sweat DTF classique', 79],
  ['sweat AOP col rond', 99],
  ['sweat AOP capuche', 119],
];
console.log('produit             | prix | cout rendu | net    | ROAS seuil');
for (const [base, prix] of grille) {
  const m = marge(prix, base, 'micro + franchise TVA', { growth: true, guide: true });
  console.log(
    `${base.padEnd(20)}| ${String(prix).padStart(4)} | ${(m.cout + BASES[base].port).toFixed(2).padStart(10)} | ` +
      `${m.net.toFixed(2).padStart(6)} | ${m.roas.toFixed(2).padStart(10)}`,
  );
}

console.log('\n=== Comparaison des regimes a prix egal, 99 EUR ===');
for (const reg of Object.keys(REGIMES)) {
  const m = marge(99, 'sweat AOP capuche', reg, { growth: true, guide: true });
  console.log(`${reg.padEnd(36)} : net ${m.net.toFixed(2)} EUR, ROAS seuil ${m.roas.toFixed(2)}`);
}

console.log('\n=== Robustesse a l inconnue TVA sur les achats ===');
console.log('un choix ne tient que si les DEUX colonnes restent sous 2,5 de ROAS seuil\n');
console.log('produit             | prix | franchise 0 %      | avec autoliquidation');
for (const [base, prix] of grille.filter((g) => g[1] >= 45)) {
  const a = marge(prix, base, 'micro + franchise TVA', { growth: true, guide: true });
  const b = marge(prix, base, 'micro + franchise + autoliquidation', { growth: true, guide: true });
  const verdict = a.roas <= 2.5 && b.roas <= 2.5 ? 'ROBUSTE' : 'fragile';
  console.log(
    `${base.padEnd(20)}| ${String(prix).padStart(4)} | net ${a.net.toFixed(0).padStart(3)} roas ${a.roas.toFixed(2)} | ` +
      `net ${b.net.toFixed(0).padStart(3)} roas ${b.roas.toFixed(2)}  ${verdict}`,
  );
}
