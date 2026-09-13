/**
 * Rédige les pages légales de la boutique : conditions générales de vente et politique de
 * remboursement.
 *
 * Elles sont créées **non publiées**. Quatre informations manquent encore et sont marquées
 * par des balises visibles : identité du vendeur, SIRET, adresse, médiateur. Publier des
 * conditions incomplètes expose à une sanction, et le contrôle refuse donc de publier tant
 * que ces balises subsistent.
 *
 * Ce que ces pages ne remplacent pas : les politiques du tunnel de paiement, qui sont un
 * réglage Shopify à part et demandent le droit `write_legal_policies` sur le jeton.
 *
 * Usage :
 *   node legal.mjs                écrit ou met à jour les pages, en brouillon
 *   node legal.mjs --publier      les met en ligne, refusé s'il reste des balises
 */

import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const env = (() => {
  const f = path.join(HERE, '.env');
  const out = {};
  if (existsSync(f)) {
    for (const l of readFileSync(f, 'utf8').split(/\r?\n/)) {
      const m = l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  }
  return { ...out, ...process.env };
})();

const BASE = `https://${env.SHOPIFY_STORE}/admin/api/${env.SHOPIFY_API_VERSION || '2026-07'}`;
const H = { 'X-Shopify-Access-Token': env.SHOPIFY_TOKEN, 'Content-Type': 'application/json' };
const PUBLIER = process.argv.includes('--publier');

const api = async (chemin, options = {}) => {
  const r = await fetch(BASE + chemin, { headers: H, ...options });
  const txt = await r.text();
  if (!r.ok) throw new Error(`HTTP ${r.status} sur ${chemin} : ${txt.slice(0, 250)}`);
  return txt ? JSON.parse(txt) : {};
};

/** Les informations que seul Valentin peut fournir, une fois l'immatriculation faite. */
const AREMPLIR = {
  '__VENDEUR__': 'nom et prénom, ou raison sociale',
  '__SIRET__': 'numéro SIRET à 14 chiffres',
  '__ADRESSE__': 'adresse complète du siège',
  '__MEDIATEUR__': 'nom et site du médiateur de la consommation',
};

const CGV = `<h2>1. Identité du vendeur</h2>
<p>La boutique dead2me est éditée par __VENDEUR__, entrepreneur individuel immatriculé sous le numéro SIRET __SIRET__, dont le siège est situé __ADRESSE__. Contact : par le formulaire de la page Contact.</p>

<h2>2. Objet</h2>
<p>Les présentes conditions régissent la vente de vêtements imprimés à la commande, proposés sur la boutique dead2me à des consommateurs. Toute commande implique leur acceptation.</p>

<h2>3. Produits</h2>
<p>Chaque pièce est imprimée à la commande. Les visuels de présentation sont des représentations : de légères différences de teinte ou de placement d'impression peuvent exister, sans constituer un défaut. Les caractéristiques essentielles de chaque pièce figurent sur sa fiche.</p>

<h2>4. Prix</h2>
<p>Les prix sont indiqués en euros, toutes taxes comprises, hors frais de livraison. Les frais de livraison applicables sont affichés avant la validation de la commande. Le vendeur se réserve le droit de modifier ses prix à tout moment, le prix applicable étant celui affiché au moment de la commande.</p>

<h2>5. Commande</h2>
<p>La commande est ferme après validation du paiement. Un courriel de confirmation récapitulant la commande est envoyé à l'adresse indiquée. Le vendeur se réserve le droit d'annuler toute commande présentant un litige de paiement ou un caractère manifestement anormal.</p>

<h2>6. Paiement</h2>
<p>Le paiement s'effectue en ligne au moment de la commande, par les moyens proposés au tunnel de paiement. Les données bancaires ne transitent jamais par le vendeur.</p>

<h2>7. Livraison</h2>
<p>Les délais annoncés se composent du temps de fabrication et du temps de transport. Ils sont indicatifs. En cas de retard supérieur à trente jours après la date de livraison annoncée, le client peut annuler sa commande et obtenir le remboursement intégral.</p>

<h2>8. Droit de rétractation</h2>
<p>Conformément aux articles L221-18 et suivants du code de la consommation, le client dispose de quatorze jours à compter de la réception pour exercer son droit de rétractation, sans avoir à motiver sa décision. Les frais de retour restent à sa charge. Le remboursement intervient au plus tard quatorze jours après récupération du bien ou preuve de son expédition.</p>
<p>Le formulaire type de rétractation peut être demandé par la page Contact.</p>

<h2>9. Garanties légales</h2>
<p>Toutes les pièces bénéficient de la garantie légale de conformité (articles L217-3 et suivants du code de la consommation) et de la garantie contre les vices cachés (articles 1641 et suivants du code civil). En cas de défaut, le client peut demander la réparation ou le remplacement, puis à défaut la réduction du prix ou la résolution de la vente.</p>

<h2>10. Propriété intellectuelle</h2>
<p>Les visuels, motifs, textes et éléments graphiques de la boutique sont protégés. Toute reproduction, même partielle, est interdite sans autorisation écrite.</p>

<h2>11. Données personnelles</h2>
<p>Les données collectées servent au traitement des commandes et, si le client y consent, à l'envoi d'informations sur les sorties. Le client dispose d'un droit d'accès, de rectification, d'effacement et de portabilité, exerçable par la page Contact. Le détail figure dans la politique de confidentialité.</p>

<h2>12. Médiation et litiges</h2>
<p>En cas de litige non résolu directement, le client peut recourir gratuitement au médiateur de la consommation : __MEDIATEUR__. Il peut également utiliser la plateforme européenne de règlement en ligne des litiges. À défaut d'accord, les tribunaux français sont compétents.</p>

<h2>13. Droit applicable</h2>
<p>Les présentes conditions sont soumises au droit français.</p>`;

const REMBOURSEMENT = `<h2>Rétractation</h2>
<p>Tu disposes de quatorze jours à compter de la réception pour changer d'avis, sans avoir à te justifier. Écris-nous par la page Contact avec ton numéro de commande, et nous t'indiquons l'adresse de retour.</p>

<h2>État de la pièce</h2>
<p>La pièce doit revenir dans un état permettant sa remise en vente : essayée, non portée au-delà de l'essayage, non lavée, avec ses étiquettes. Une pièce visiblement portée ou abîmée peut faire l'objet d'un remboursement partiel.</p>

<h2>Frais de retour</h2>
<p>Les frais de retour sont à ta charge, sauf si la pièce est arrivée abîmée, défectueuse, ou n'était pas celle commandée : dans ce cas nous prenons le retour à notre charge.</p>

<h2>Remboursement</h2>
<p>Une fois le retour reçu et vérifié, le remboursement est effectué sur le moyen de paiement d'origine, au plus tard quatorze jours après. Les frais de livraison initiaux sont remboursés au tarif standard.</p>

<h2>Pièce abîmée ou erreur</h2>
<p>Envoie-nous une photo dans les quatorze jours suivant la réception. Nous remplaçons la pièce ou la remboursons intégralement, frais de retour compris, sans que tu aies à la renvoyer à tes frais.</p>

<h2>Échanges</h2>
<p>Chaque pièce étant imprimée à la commande, nous ne pratiquons pas l'échange direct : demande le remboursement, puis repasse commande dans la taille voulue tant que la sortie est ouverte.</p>`;

const PAGES = [
  { handle: 'cgv', title: 'Conditions générales de vente', body: CGV },
  { handle: 'remboursement', title: 'Politique de remboursement', body: REMBOURSEMENT },
];

const { pages } = await api('/pages.json?limit=50');

for (const p of PAGES) {
  const trous = Object.keys(AREMPLIR).filter((b) => p.body.includes(b));
  const existante = pages.find((x) => x.handle === p.handle);

  if (PUBLIER && trous.length) {
    console.log(`\n${p.title} : publication refusée, il reste ${trous.length} information(s) à fournir`);
    for (const t of trous) console.log(`  ${t.padEnd(16)} ${AREMPLIR[t]}`);
    continue;
  }

  const corps = {
    page: {
      title: p.title,
      handle: p.handle,
      body_html: p.body,
      published: PUBLIER && !trous.length,
    },
  };

  if (existante) {
    await api(`/pages/${existante.id}.json`, { method: 'PUT', body: JSON.stringify({ page: { id: existante.id, ...corps.page } }) });
    console.log(`${p.title} : mise à jour${corps.page.published ? ' et publiée' : ', en brouillon'}`);
  } else {
    await api('/pages.json', { method: 'POST', body: JSON.stringify(corps) });
    console.log(`${p.title} : créée${corps.page.published ? ' et publiée' : ', en brouillon'}`);
  }
  if (trous.length) {
    console.log(`  ${trous.length} information(s) à compléter : ${trous.join(', ')}`);
  }
}

console.log(
  PUBLIER
    ? '\nRelance sans --publier après avoir complété les balises dans ce fichier.'
    : '\nPages en brouillon. Complète les balises dans outils/legal.mjs, puis : node legal.mjs --publier',
);
