/**
 * Écrit les fiches produit, en français ou en anglais.
 *
 * La boutique est immatriculée en France et vend en euros : sa langue de base est le
 * français, et c'est cette version qui part dans le contenu principal. L'anglais sert de
 * copie prête à coller dans la traduction, l'API du jeton n'ayant pas accès aux traductions.
 *
 * Ce qui ne se traduit pas : le nom des pièces, celui du drop, la signature de la marque.
 * Personne ne traduit un nom de vêtement, et le streetwear se lit en anglais partout.
 *
 * Usage :
 *   node fiches.mjs                     applique le français au contenu principal
 *   node fiches.mjs --langue en         applique l'anglais
 *   node fiches.mjs --langue en --voir  affiche les textes sans rien écrire
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

const pied = {
  fr: 'Pièce de NOTHING LASTS, la première sortie D2M. Imprimée à la commande en Europe. Douze pièces, puis c’est fini.',
  en: 'Part of NOTHING LASTS, the first D2M release. Printed to order in Europe. Twelve pieces, then it is gone.',
};

const fiche = (scene, coupe) => `<p>${scene}</p><p>${coupe}</p><p>${pied[LANGUE]}</p>`;

const TEXTES = {
  fr: {
    'd2m-heavyweight-tee': fiche(
      'La marque D2M, délavée comme si elle était là depuis longtemps. Impression devant, DEAD2ME dans le dos.',
      'T-shirt épais à coupe carrée, épaules tombantes, se porte large.',
    ),
    'd2m-essentials-tee': fiche(
      'La marque sur du noir, rien d’autre. La pièce qu’on attrape sans réfléchir.',
      'T-shirt à coupe droite, ample sur le corps.',
    ),
    'd2m-zip-hoodie': fiche(
      'Petite marque sur la poitrine, grand D2M dans le dos. La fermeture traverse le dessin.',
      'Sweat zippé oversize, capuche doublée, poignets côtelés.',
    ),
    'd2m-hoodie': fiche(
      'D2M dans le dos, DEAD2ME dessous. Discret de face, franc de dos.',
      'Sweat à capuche oversize, épaules tombantes, poche kangourou.',
    ),
    'split-figures-zip': fiche(
      'Deux silhouettes que la fermeture sépare. L’une lève les bras, l’autre est déjà tombée. Personne ne se rejoint au milieu.',
      'Sweat zippé oversize en noir délavé, dessin sur toute la poitrine.',
    ),
    'seated-figure-zip': fiche(
      'Une silhouette affaissée sur une chaise, le bordeaux s’ouvre derrière la tête. La scène que personne ne photographie.',
      'Sweat zippé oversize en gris chiné, dessin sur toute la poitrine.',
    ),
    'table-alone-zip': fiche(
      'Une table mise pour deux, un côté vide. Le chien attend. Personne ne vient.',
      'Sweat zippé oversize en gris chiné, dessin sur toute la poitrine.',
    ),
    'aftermath-zip': fiche(
      'Une silhouette debout, les mains sur la tête. L’autre au sol. C’est la minute d’après.',
      'Sweat zippé oversize en gris chiné, dessin sur toute la poitrine.',
    ),
    'run-away-tee': fiche(
      'Une silhouette touchée, une autre qui court déjà. L’histoire se termine avant qu’on sache laquelle est laquelle.',
      'T-shirt à coupe carrée en écru, dessin sur la poitrine.',
    ),
    'void-wide-leg-joggers': fiche(
      'Noir sur noir, la marque petite sur la cuisse. Fait pour disparaître dans le reste.',
      'Jogging à jambe large, taille élastiquée, poches profondes.',
    ),
    'static-wide-leg-pants': fiche(
      'Anthracite délavé, la marque à peine visible. Le pantalon qu’on garde jusqu’à l’usure.',
      'Pantalon à jambe large, coupe droite, taille souple.',
    ),
    'no-signal-track-pants': fiche(
      'Du bordeaux qui descend le long des deux côtés, comme un signal qui n’est jamais revenu.',
      'Pantalon de survêtement, cheville resserrée, bandes latérales.',
    ),
  },
  en: {
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
  },
};

const jeu = TEXTES[LANGUE];
if (!jeu) {
  console.error('Langue inconnue. Utilise fr ou en.');
  process.exitCode = 1;
} else if (VOIR) {
  for (const [h, corps] of Object.entries(jeu)) {
    console.log(`\n## ${h}\n${corps.replace(/<\/p><p>/g, '\n').replace(/<[^>]+>/g, '')}`);
  }
} else {
  const { products } = await api('/products.json?limit=50');
  for (const [handle, corps] of Object.entries(jeu)) {
    const p = products.find((x) => x.handle === handle);
    if (!p) {
      console.log(`  introuvable : ${handle}`);
      continue;
    }
    console.log(`${p.title.padEnd(24)} -> ${LANGUE}`);
    await api(`/products/${p.id}.json`, {
      method: 'PUT',
      body: JSON.stringify({ product: { id: p.id, body_html: corps } }),
    });
  }
  console.log(`\nFiches écrites en ${LANGUE === 'fr' ? 'français' : 'anglais'}.`);
}
