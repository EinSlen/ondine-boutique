/**
 * Écrit les pages de la boutique, en français ou en anglais.
 *
 * Le français est la version qui compte : c'est celle que lira un client français, et le
 * droit de la consommation exige que le droit de rétractation et les conditions de retour
 * lui soient présentés dans sa langue. L'anglais reste disponible pour la traduction.
 *
 * Ce qui reste prudent tant que la production n'est pas branchée : aucun tableau de mesures
 * avant que le vêtement fournisseur soit arrêté, aucun délai d'expédition ferme.
 *
 * Usage :
 *   node pages.mjs                     applique le français
 *   node pages.mjs --langue en         applique l'anglais
 *   node pages.mjs --langue en --voir  affiche sans rien écrire
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

const arg = (n) => {
  const i = process.argv.indexOf(`--${n}`);
  return i > -1 ? process.argv[i + 1] : null;
};
const LANGUE = (arg('langue') || 'fr').toLowerCase();
const VOIR = process.argv.includes('--voir');

const api = async (chemin, options = {}) => {
  const r = await fetch(BASE + chemin, { headers: H, ...options });
  const txt = await r.text();
  if (!r.ok) throw new Error(`HTTP ${r.status} sur ${chemin} : ${txt.slice(0, 250)}`);
  return txt ? JSON.parse(txt) : {};
};

const PAGES = {
  fr: {
    'a-propos': {
      title: 'À propos',
      body: `<p>D2M est une marque de streetwear construite sur des images simples : des scènes courtes, du noir, de l’écru, une seule teinte de rouge.</p>
<p>NOTHING LASTS est la première sortie. Douze pièces, chacune pensée comme une composition frontale. Sur les sweats zippés, la fermeture traverse le dessin au lieu de le contourner.</p>
<p>Tout est imprimé à la commande en Europe. Rien n’est stocké, rien n’est réimprimé. Quand une sortie se termine, elle se termine.</p>
<p>Conçu en France.</p>`,
    },
    contact: {
      title: 'Contact',
      body: `<p>Une question sur une commande, une taille ou une sortie ? Écris-nous avec le formulaire ci-dessous, nous répondons rapidement.</p>`,
    },
    'guide-des-tailles': {
      title: 'Guide des tailles',
      body: `<p>Les hauts vont du S au XXL. Les bas vont du 2XS au 3XL.</p>
<p>Toutes les pièces sont coupées large : épaules tombantes sur les t-shirts et les sweats, jambe droite et ample sur les bas. Pour un porté ajusté, prends ta taille habituelle. Pour le tombé des photos, prends une taille au-dessus.</p>
<p>Le tableau de mesures complet sera publié quand le vêtement de production sera arrêté. Nous préférons l’absence de chiffres à des chiffres que nous ne pourrions pas tenir.</p>`,
    },
    livraison: {
      title: 'Livraison',
      body: `<p>Chaque pièce est imprimée à la commande : le délai total est celui de la fabrication, puis du transport. Les options et les prix exacts pour ton adresse s’affichent au moment du paiement.</p>
<p>France : standard 7,99 €, offerte à partir de 65 €. Express 10,99 €.</p>
<p>Union européenne : standard 22 €.</p>
<p>Reste du monde : standard 29 €.</p>
<p>Le numéro de suivi est envoyé par courriel dès que le colis quitte l’atelier.</p>`,
    },
    retours: {
      title: 'Retours et remboursements',
      body: `<p><strong>Droit de rétractation.</strong> Tu disposes de 14 jours à compter de la réception pour te rétracter, sous réserve des exceptions prévues par la loi. Contacte-nous depuis la page Contact avec ton numéro de commande.</p>
<p>La pièce doit revenir dans un état permettant sa remise en vente : essayée, non portée, non lavée. Les frais de retour restent à ta charge, sauf si la pièce est arrivée abîmée ou n’était pas celle commandée.</p>
<p>Une fois le retour reçu et vérifié, le remboursement est effectué sur le moyen de paiement d’origine sous 14 jours.</p>
<p><strong>Pièce abîmée ou erreur.</strong> Envoie-nous une photo dans les 14 jours suivant la réception : nous remplaçons ou remboursons intégralement, frais de retour compris.</p>`,
    },
    faq: {
      title: 'Questions fréquentes',
      body: `<p><strong>C’est quoi NOTHING LASTS ?</strong><br>La première sortie D2M : douze pièces, des silhouettes simples, beaucoup de vide et une seule teinte de rouge. Sur les sweats zippés, la fermeture fait partie de la composition.</p>
<p><strong>Y aura-t-il des réassorts ?</strong><br>Non. Quand une sortie se termine, elle ne revient pas. Une pièce peut réapparaître sous une autre forme dans une sortie suivante, jamais à l’identique.</p>
<p><strong>Quelles tailles ?</strong><br>Hauts du S au XXL, bas du 2XS au 3XL, coupés large. Le tableau de mesures sera ajouté au guide des tailles dès que le vêtement de production sera arrêté.</p>
<p><strong>Où est-ce fabriqué ?</strong><br>Imprimé à la commande en Europe, puis expédié depuis là.</p>
<p><strong>Combien de temps pour recevoir ma commande ?</strong><br>Le temps de fabrication, puis celui du transport. L’estimation pour ton adresse s’affiche au moment du paiement, et le suivi arrive par courriel.</p>`,
    },
  },
  en: {
    'a-propos': {
      title: 'About',
      body: `<p>D2M is a streetwear label built on simple images: short scenes, black and off-white, one colour of red.</p>
<p>NOTHING LASTS is the first release. Twelve pieces, each one a flat composition. On the zip hoodies the zip runs through the artwork rather than around it.</p>
<p>Everything is printed to order in Europe. Nothing is warehoused, nothing is restocked. When a release closes, it closes.</p>
<p>Designed in France.</p>`,
    },
    contact: {
      title: 'Contact',
      body: `<p>A question about an order, a size, or a release? Use the form below and we will get back to you.</p>`,
    },
    'guide-des-tailles': {
      title: 'Size guide',
      body: `<p>Tops run S to XXL. Bottoms run 2XS to 3XL.</p>
<p>Every piece is cut oversized: dropped shoulders on the tees and hoodies, a wide straight leg on the bottoms. If you want a closer fit, take your usual size. If you want the fit in the photos, take one up.</p>
<p>The full measurement table is published once the production blank is locked. We would rather leave it out than print numbers we cannot stand behind.</p>`,
    },
    livraison: {
      title: 'Shipping',
      body: `<p>Every piece is printed to order, so the total time is production plus transit. The exact options and costs for your address are shown at checkout.</p>
<p>France: standard 7,99 €, free from 65 €. Express 10,99 €.</p>
<p>European Union: standard 22 €.</p>
<p>Rest of the world: standard 29 €.</p>
<p>Tracking is sent by email as soon as the parcel leaves the production facility.</p>`,
    },
    retours: {
      title: 'Returns',
      body: `<p><strong>Right of withdrawal.</strong> You have 14 days from delivery to withdraw from your order, subject to the exceptions set out by law. Contact us through the contact page with your order number.</p>
<p>The piece must come back in a resalable condition: tried on, not worn out, not washed. Return shipping is at your expense unless the piece arrived damaged or was not the one you ordered.</p>
<p>Once the return is received and checked, the refund is issued to the original payment method within 14 days.</p>
<p><strong>Damaged or wrong item.</strong> Send us a photo within 14 days of delivery and we replace it or refund it in full, return shipping included.</p>`,
    },
    faq: {
      title: 'FAQ',
      body: `<p><strong>What is NOTHING LASTS?</strong><br>The first D2M release: twelve pieces, built on simple silhouettes, empty space and one colour of red. On the zip hoodies the zip is part of the composition.</p>
<p><strong>Will anything be restocked?</strong><br>No. When a release closes it does not come back. A piece may return in a different form in a later release, never as the same one.</p>
<p><strong>What sizes are there?</strong><br>Tops S to XXL, bottoms 2XS to 3XL, cut oversized. The measurement table is added to the size guide once the production blank is locked.</p>
<p><strong>Where is it made?</strong><br>Printed to order in Europe, then shipped from there.</p>
<p><strong>How long does an order take?</strong><br>Production plus transit. The estimate for your address is shown at checkout, and tracking follows by email.</p>`,
    },
  },
};

const jeu = PAGES[LANGUE];
if (!jeu) {
  console.error('Langue inconnue. Utilise fr ou en.');
  process.exitCode = 1;
} else if (VOIR) {
  for (const [h, c] of Object.entries(jeu)) {
    console.log(`\n## ${h} — ${c.title}\n${c.body.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()}`);
  }
} else {
  const { pages } = await api('/pages.json?limit=50');
  for (const [handle, contenu] of Object.entries(jeu)) {
    const p = pages.find((x) => x.handle === handle);
    if (!p) {
      console.log(`  introuvable : ${handle}`);
      continue;
    }
    console.log(`${handle.padEnd(20)} -> ${contenu.title}`);
    await api(`/pages/${p.id}.json`, {
      method: 'PUT',
      body: JSON.stringify({ page: { id: p.id, title: contenu.title, body_html: contenu.body } }),
    });
  }
  console.log(`\nPages écrites en ${LANGUE === 'fr' ? 'français' : 'anglais'}.`);
}
