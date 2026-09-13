/**
 * Dresse la liste de ce que le jeton Shopify autorise, et de ce qu'il refuse.
 *
 * Sert à répondre sans deviner à la question « pourquoi ça marche ici et pas là ». Chaque
 * ligne est une lecture réelle envoyée à l'API : rien n'est modifié.
 *
 * Usage : node droits.mjs
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

const essais = [
  ['Produits et fiches', '{ products(first:1){ nodes{ id } } }'],
  ['Pages de contenu', '{ pages(first:1){ nodes{ id } } }'],
  ['Menus de navigation', '{ menus(first:1){ nodes{ id } } }'],
  ['Collections', '{ collections(first:1){ nodes{ id } } }'],
  ['Canaux de vente', '{ publications(first:1){ nodes{ id } } }'],
  ['Fichiers', '{ files(first:1){ nodes{ id } } }'],
  ['Stock', '{ locations(first:1){ nodes{ id } } }'],
  ['Traductions', '{ translatableResources(first:1, resourceType: PRODUCT){ nodes{ resourceId } } }'],
  ['Livraison', '{ deliveryProfiles(first:1){ nodes{ id } } }'],
  ['Langues', '{ shopLocales{ locale } }'],
  ['Applications installées', '{ appInstallations(first:1){ nodes{ id } } }'],
];

const gql = async (query) => {
  const r = await fetch(`${BASE}/graphql.json`, { method: 'POST', headers: H, body: JSON.stringify({ query }) });
  const j = await r.json();
  if (!j.errors) return { ok: true };
  const m = j.errors[0]?.message || '';
  const scope = (m.match(/`([a-z_]+)` access scope/) || [])[1] || (m.match(/([a-z_]+\/[a-z_]+)/) || [])[1] || '';
  return { ok: false, scope };
};

console.log('\nCe que le jeton autorise, vérifié à l’instant\n');
for (const [nom, q] of essais) {
  const r = await gql(q);
  console.log(`  ${r.ok ? 'oui ' : 'non '} ${nom.padEnd(24)} ${r.ok ? '' : 'il manque ' + (r.scope || 'un droit')}`);
}

// le thème passe par l'API REST, pas par GraphQL
const themes = await fetch(`${BASE}/themes.json`, { headers: H });
console.log(`  ${themes.ok ? 'oui ' : 'non '} ${'Thèmes'.padEnd(24)}`);
console.log('');
