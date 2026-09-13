/**
 * Pose les traductions anglaises des fiches et des pages.
 *
 * Shopify garde le contenu principal dans la langue par défaut, ici le français, et range
 * les autres langues à côté, chacune attachée à une empreinte du texte d'origine. Si le
 * texte français change, l'empreinte change et la traduction est signalée comme périmée :
 * c'est voulu, et c'est pour cela qu'on relit l'empreinte à chaque passage plutôt que de
 * la garder en mémoire.
 *
 * Le jeton doit porter le droit `write_translations`. Sans lui, l'API refuse et ce script
 * explique où l'activer.
 *
 * Usage :
 *   node traductions.mjs            simulation, affiche ce qui serait posé
 *   node traductions.mjs --sec      applique
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
const APPLIQUE = process.argv.includes('--sec');
const LOCALE = 'en';

const gql = async (query, variables = {}) => {
  const r = await fetch(`${BASE}/graphql.json`, { method: 'POST', headers: H, body: JSON.stringify({ query, variables }) });
  const j = await r.json();
  if (j.errors) {
    const refus = j.errors.find((e) => /read_translations|write_translations/.test(e.message || ''));
    if (refus) {
      console.error(
        [
          '',
          "Le jeton n'a pas accès aux traductions.",
          '',
          'Dans ton admin Shopify :',
          '  Paramètres → Applications et canaux de vente → Développer des applications',
          "  → ton application → Configuration → Admin API",
          '  → coche read_translations ET write_translations, enregistre,',
          '     puis réinstalle l’application',
          '  → recopie le nouveau jeton dans outils/.env (SHOPIFY_TOKEN)',
          '',
        ].join('\n'),
      );
      process.exit(1);
    }
    throw new Error(JSON.stringify(j.errors).slice(0, 300));
  }
  return j.data;
};

/** Les textes anglais, repris mot pour mot de fiches.mjs et pages.mjs. */
const PIED = 'Part of NOTHING LASTS, the first D2M release. Printed to order in Europe. Twelve pieces, then it is gone.';
const fiche = (scene, coupe) => `<p>${scene}</p><p>${coupe}</p><p>${PIED}</p>`;

const PRODUITS = {
  'd2m-heavyweight-tee': fiche(
    'The D2M mark, washed out like it has been there a while. Front print, DEAD2ME across the back.',
    'Boxy heavyweight tee, dropped shoulders, wears oversized.',
  ),
  'd2m-essentials-tee': fiche(
    'The mark on black, nothing else. The piece you reach for without thinking.',
    'Straight-cut tee, relaxed through the body.',
  ),
  'd2m-zip-hoodie': fiche(
    'Small mark on the chest, the full D2M across the back. The zip runs straight through the artwork.',
    'Oversized zip hoodie, heavy hood, ribbed cuffs.',
  ),
  'd2m-hoodie': fiche(
    'D2M across the back with DEAD2ME beneath it. Quiet from the front, loud from behind.',
    'Oversized pullover hoodie, dropped shoulders, kangaroo pocket.',
  ),
  'split-figures-zip': fiche(
    'Two figures, split by the zip. One reaching up, one already down. Nobody meets in the middle.',
    'Oversized zip hoodie in washed black, artwork across the chest.',
  ),
  'seated-figure-zip': fiche(
    'A figure gone slack in a chair, red spreading out from the head. The scene nobody photographs.',
    'Oversized zip hoodie in heather grey, artwork across the chest.',
  ),
  'table-alone-zip': fiche(
    'A table set for two, one side empty. The dog waits. Nobody comes.',
    'Oversized zip hoodie in heather grey, artwork across the chest.',
  ),
  'aftermath-zip': fiche(
    'One figure standing, hands on their head. One on the ground. This is the minute after.',
    'Oversized zip hoodie in heather grey, artwork across the chest.',
  ),
  'run-away-tee': fiche(
    'One figure hit, one already running. The story ends before you know which is which.',
    'Boxy tee in off-white, artwork across the chest.',
  ),
  'void-wide-leg-joggers': fiche(
    'Black on black, the mark small on the thigh. Built to disappear into the rest.',
    'Wide-leg joggers, elasticated waist, deep pockets.',
  ),
  'static-wide-leg-pants': fiche(
    'Washed charcoal, the mark barely there. The pair you wear until it falls apart.',
    'Wide-leg pants, straight through the leg, relaxed rise.',
  ),
  'no-signal-track-pants': fiche(
    'Red running down both sides, like a signal that never came back.',
    'Track pants, tapered ankle, side stripes.',
  ),
};

const PAGES = {
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
};

/** Pose les valeurs voulues sur une ressource, en respectant les empreintes du moment. */
const traduire = async (gid, nom, valeurs) => {
  const d = await gql(
    `query($id:ID!){ translatableResource(resourceId:$id){ translatableContent{ key value digest locale } } }`,
    { id: gid },
  );
  const contenus = d.translatableResource?.translatableContent ?? [];
  const aPoser = [];
  for (const [cle, valeur] of Object.entries(valeurs)) {
    const source = contenus.find((c) => c.key === cle);
    if (!source) continue;
    aPoser.push({ key: cle, value: valeur, locale: LOCALE, translatableContentDigest: source.digest });
  }
  if (!aPoser.length) {
    console.log(`  ${nom} : rien à traduire`);
    return;
  }
  console.log(`  ${nom} : ${aPoser.map((t) => t.key).join(', ')}`);
  if (!APPLIQUE) return;
  const res = await gql(
    `mutation($id:ID!,$t:[TranslationInput!]!){ translationsRegister(resourceId:$id, translations:$t){ userErrors{ message field } } }`,
    { id: gid, t: aPoser },
  );
  const erreurs = res.translationsRegister.userErrors;
  if (erreurs.length) console.log('    ', JSON.stringify(erreurs).slice(0, 200));
};

const data = await gql(`{
  products(first: 50) { nodes { id handle title } }
  pages(first: 50) { nodes { id handle title } }
}`);

console.log('Fiches produit');
for (const [handle, corps] of Object.entries(PRODUITS)) {
  const p = data.products.nodes.find((x) => x.handle === handle);
  if (!p) {
    console.log(`  introuvable : ${handle}`);
    continue;
  }
  // le titre reste tel quel : un nom de pièce ne se traduit pas
  await traduire(p.id, p.title, { body_html: corps });
}

console.log('\nPages');
for (const [handle, contenu] of Object.entries(PAGES)) {
  const p = data.pages.nodes.find((x) => x.handle === handle);
  if (!p) {
    console.log(`  introuvable : ${handle}`);
    continue;
  }
  await traduire(p.id, handle, { title: contenu.title, body_html: contenu.body });
}

console.log(APPLIQUE ? '\nTraductions anglaises posées.' : '\nSimulation. --sec pour appliquer.');
