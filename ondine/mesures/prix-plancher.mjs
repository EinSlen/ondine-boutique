// Le prix le plus bas possible, base par base, sur les 25 produits fabricables en UE.
// Deux planchers differents:
//   organique : marge nette >= 8 EUR, aucun cout d'acquisition a payer
//   publicite : ROAS seuil <= 2,5, sinon un pixel neuf ne peut pas tenir
// Hypotheses de cout: pod-eu.json, remise Growth 20 %, micro-entreprise + franchise en base.
import fs from 'fs';

const REMISE_GROWTH = 0.2;
const PRELEVEMENTS = 0.133;
const PAIEMENT_TAUX = 0.018;
const PAIEMENT_FIXE = 0.25;
const REFASHION = 0.06;
const RETOUR = 0.03;
const ROAS_MAX = 2.5;
const NET_MIN_ORGANIQUE = 8;

const produits = JSON.parse(fs.readFileSync(new URL('./pod-eu.json', import.meta.url), 'utf8'));

// Le port UE mesure: 4,79 EUR le premier article textile. Les pieces lourdes coutent plus,
// on majore les sweats et vestes.
const port = (titre) => {
  if (/hoodie|zip|jacket|sweatshirt|crewneck|duffle|track/i.test(titre)) return 7.0;
  if (/dress|leggings|pants/i.test(titre)) return 5.9;
  return 4.79;
};

const net = (prix, coutRendu) => {
  const brut = prix - coutRendu - (prix * PAIEMENT_TAUX + PAIEMENT_FIXE) - REFASHION;
  return brut - brut * RETOUR - coutRendu * RETOUR - prix * PRELEVEMENTS;
};

const plancher = (coutRendu, test) => {
  for (let p = 12; p <= 400; p += 1) if (test(p, net(p, coutRendu))) return p;
  return null;
};

const lignes = produits.map((p) => {
  const coutRendu = p.eur_min * (1 - REMISE_GROWTH) + port(p.titre);
  return {
    titre: p.titre.replace(/All-Over Print/i, 'AOP'),
    technique: p.techniques === 'CUT-SEW' ? 'AOP' : 'imprime',
    base: +(p.eur_min * (1 - REMISE_GROWTH)).toFixed(2),
    coutRendu: +coutRendu.toFixed(2),
    organique: plancher(coutRendu, (p, n) => n >= NET_MIN_ORGANIQUE),
    pub: plancher(coutRendu, (p, n) => n > 0 && p / n <= ROAS_MAX),
    pubUtile: plancher(coutRendu, (p, n) => n >= 45),
  };
});

lignes.sort((a, b) => (a.pub || 999) - (b.pub || 999));

console.log('Prix le plus bas possible, base par base. Remise Growth de 20 % appliquee.\n');
console.log('produit                              | tech    | cout rendu | mini organique | mini pub | pub utile');
console.log('-'.repeat(108));
for (const l of lignes) {
  console.log(
    `${l.titre.slice(0, 36).padEnd(37)}| ${l.technique.padEnd(8)}| ${String(l.coutRendu).padStart(10)} | ` +
      `${l.organique ? String(l.organique).padStart(11) + ' E' : '          -'} | ` +
      `${l.pub ? String(l.pub).padStart(6) + ' E' : '     -'} | ` +
      `${l.pubUtile ? String(l.pubUtile).padStart(7) + ' E' : '      -'}`,
  );
}

console.log('\n=== Le mur, pourquoi on ne descend pas plus bas ===');
const sweat = lignes.find((l) => /Gildan 18500|Unisex Heavy Blend Hoodie/i.test(l.titre)) || lignes.find((l) => /hoodie/i.test(l.titre));
if (sweat) {
  console.log(`\nSur ${sweat.titre} :`);
  for (const prix of [35, 45, 55, 59, 69, 79]) {
    const n = net(prix, sweat.coutRendu);
    console.log(
      `  ${String(prix).padStart(3)} EUR : net ${n.toFixed(2).padStart(6)} EUR, ROAS seuil ${n > 0 ? (prix / n).toFixed(2) : 'infini'}` +
        `${n <= 0 ? '  vente a perte' : prix / n > ROAS_MAX ? '  pub impossible' : ''}`,
    );
  }
}

console.log('\n=== Ce que coute un prix bas en volume, objectif 10 000 EUR nets ===');
console.log('prix | net/piece | ventes/mois sans pub | ventes/mois a CPA 20');
for (const l of lignes.filter((x) => /Hoodie|T-Shirt/i.test(x.titre)).slice(0, 6)) {
  const p = l.pub;
  if (!p) continue;
  const n = net(p, l.coutRendu);
  const avecPub = n - 20;
  console.log(
    `${String(p).padStart(4)} | ${n.toFixed(2).padStart(9)} | ${String(Math.ceil(10065 / n)).padStart(20)} | ` +
      `${avecPub > 0 ? String(Math.ceil(10065 / avecPub)).padStart(20) : '          impossible'}   ${l.titre.slice(0, 30)}`,
  );
}
console.log('\nUn prix divise par deux ne double pas les ventes, il double le travail de contenu.');
