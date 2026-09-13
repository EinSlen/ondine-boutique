/**
 * Publie produits et collections sur la boutique en ligne.
 * Sans cela, une fiche « active » reste invisible en vitrine et les grilles de la page
 * d'accueil se rendent vides, ce qui est la panne la plus déroutante du catalogue.
 *
 * Usage : node publier-canal.mjs [--sec]
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

const GQL = `https://${env.SHOPIFY_STORE}/admin/api/${env.SHOPIFY_API_VERSION || '2026-07'}/graphql.json`;
const H = { 'X-Shopify-Access-Token': env.SHOPIFY_TOKEN, 'Content-Type': 'application/json' };
const APPLIQUE = process.argv.includes('--sec');

const gql = async (query, variables = {}) => {
  const r = await fetch(GQL, { method: 'POST', headers: H, body: JSON.stringify({ query, variables }) });
  const j = await r.json();
  if (j.errors) throw new Error(JSON.stringify(j.errors).slice(0, 300));
  return j.data;
};

const { publications } = await gql(`{ publications(first:10){ nodes{ id name } } }`);
const boutique = publications.nodes.find((p) => p.name === 'Online Store');
if (!boutique) throw new Error('Canal boutique en ligne introuvable.');

const d = await gql(`{
  products(first:50){ nodes{ id handle status resourcePublicationsCount{count} } }
  collections(first:20){ nodes{ id handle resourcePublicationsCount{count} } }
}`);

const aPublier = [
  ...d.products.nodes.filter((p) => p.status === 'ACTIVE' && p.resourcePublicationsCount.count === 0),
  ...d.collections.nodes.filter((c) => ['logo-essentials', 'graphic-pieces', 'bottoms', 'still-here'].includes(c.handle) && c.resourcePublicationsCount.count === 0),
];

for (const r of aPublier) {
  console.log(`  ${r.handle}`);
  if (!APPLIQUE) continue;
  const res = await gql(
    `mutation($id:ID!,$pub:[PublicationInput!]!){ publishablePublish(id:$id, input:$pub){ userErrors{ message } } }`,
    { id: r.id, pub: [{ publicationId: boutique.id }] },
  );
  if (res.publishablePublish.userErrors.length) console.log('    ', JSON.stringify(res.publishablePublish.userErrors));
}
console.log(aPublier.length ? (APPLIQUE ? `Publié sur ${boutique.name}.` : 'Simulation. --sec pour appliquer.') : 'Rien à publier.');
