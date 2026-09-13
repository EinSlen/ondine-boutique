/**
 * Rattache les visuels découpés aux fiches produit, dans l'ordre où ils doivent
 * s'afficher : la vue qui porte le motif en premier, l'autre juste derrière, ce qui
 * donne aussi l'image de survol dans les grilles.
 * Les anciennes images en basse définition sont retirées, celles qui restent
 * exploitables sont repoussées en fin de galerie.
 *
 * Usage : node visuels-produits.mjs [--sec]   (--sec applique, sinon simulation)
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
const GQL = `${BASE}/graphql.json`;
const H = { 'X-Shopify-Access-Token': env.SHOPIFY_TOKEN, 'Content-Type': 'application/json' };
const APPLIQUE = process.argv.includes('--sec');

const api = async (chemin, options = {}) => {
  const r = await fetch(BASE + chemin, { headers: H, ...options });
  const txt = await r.text();
  if (!r.ok) throw new Error(`HTTP ${r.status} sur ${chemin} : ${txt.slice(0, 250)}`);
  return txt ? JSON.parse(txt) : {};
};
const gql = async (query, variables = {}) => {
  const r = await fetch(GQL, { method: 'POST', headers: H, body: JSON.stringify({ query, variables }) });
  const j = await r.json();
  if (j.errors) throw new Error(JSON.stringify(j.errors).slice(0, 300));
  return j.data;
};

// vues dans l'ordre d'affichage voulu ; le sweat à capuche mène par son dos, seul côté imprimé en grand
const PLAN = {
  'd2m-zip-hoodie': ['d2m-zip-hoodie-front', 'd2m-zip-hoodie-back'],
  'd2m-hoodie': ['d2m-hoodie-back', 'd2m-hoodie-front'],
  'd2m-heavyweight-tee': ['d2m-heavyweight-tee-front', 'd2m-heavyweight-tee-back'],
  'seated-figure-zip': ['seated-figure-zip-front', 'seated-figure-zip-back'],
  'split-figures-zip': ['split-figures-zip-front', 'split-figures-zip-back'],
  'aftermath-zip': ['aftermath-zip-front', 'aftermath-zip-back'],
  'run-away-tee': ['run-away-tee-front', 'run-away-tee-back'],
  'void-wide-leg-joggers': ['void-wide-leg-joggers-front', 'void-wide-leg-joggers-back'],
  'static-wide-leg-pants': ['static-wide-leg-pants-front', 'static-wide-leg-pants-back'],
  'no-signal-track-pants': ['no-signal-track-pants-front', 'no-signal-track-pants-back'],
  'table-alone-zip': ['table-alone-zip-front'],
  // provisoire : recadre depuis une capture, en attendant la planche du fournisseur
  'd2m-essentials-tee': ['d2m-essentials-tee-front'],
};

// anciennes images assez définies pour rester en fin de galerie
const GARDE = /(run-away-white-tee|aggregated|seated-figure-grey-zip|aftermath-grey-zip)/;

const { files } = await gql(`{ files(first: 250, sortKey: CREATED_AT, reverse: true) {
  nodes { ... on MediaImage { id image { url } } } } }`);
const url = {};
for (const f of files.nodes) {
  if (!f.image) continue;
  const nom = decodeURIComponent(f.image.url.split('/').pop().split('?')[0]).replace(/\.[a-z]+$/i, '');
  if (!(nom in url)) url[nom] = f.image.url;
}

const { products } = await api('/products.json?limit=50');
for (const [handle, vues] of Object.entries(PLAN)) {
  const p = products.find((x) => x.handle === handle);
  if (!p) {
    console.log(`  introuvable : ${handle}`);
    continue;
  }
  const manquant = vues.filter((v) => !url[v]);
  if (manquant.length) {
    console.log(`  visuel absent des Fichiers : ${manquant.join(', ')}`);
    continue;
  }
  const aRetirer = p.images.filter((i) => !GARDE.test(i.src));
  console.log(`${p.title} : ${vues.length} vues à poser, ${aRetirer.length} anciennes à retirer`);
  if (!APPLIQUE) continue;

  let position = 1;
  for (const v of vues) {
    await api(`/products/${p.id}/images.json`, {
      method: 'POST',
      body: JSON.stringify({ image: { src: url[v], position: position++, alt: `${p.title} — ${v.endsWith('back') ? 'dos' : 'face'}` } }),
    });
  }
  for (const img of aRetirer) await api(`/products/${p.id}/images/${img.id}.json`, { method: 'DELETE' });
}
console.log(APPLIQUE ? 'Appliqué.' : 'Simulation. Relance avec --sec pour appliquer.');
