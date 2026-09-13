/**
 * Aligne le stock des fiches sur la réalité du print-on-demand : rien n'est stocké,
 * le fournisseur imprime à la commande, donc Shopify ne doit rien compter.
 * Sans cela une fiche reste affichée « épuisé » et refuse la commande.
 *
 * Usage : node stock-pod.mjs [--sec]
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

const { products } = await gql(`{
  products(first: 50, query: "status:active") {
    nodes { id title
      variants(first: 20) { nodes { id title inventoryItem { id tracked } } } }
  }
}`);

for (const p of products.nodes) {
  const suivies = p.variants.nodes.filter((v) => v.inventoryItem.tracked);
  if (!suivies.length) continue;
  console.log(`${p.title} : ${suivies.length} variantes suivies`);
  if (!APPLIQUE) continue;

  const res = await gql(
    `mutation($productId:ID!,$variants:[ProductVariantsBulkInput!]!){
       productVariantsBulkUpdate(productId:$productId, variants:$variants){ userErrors{ message field } } }`,
    {
      productId: p.id,
      variants: suivies.map((v) => ({ id: v.id, inventoryItem: { tracked: false } })),
    },
  );
  const erreurs = res.productVariantsBulkUpdate.userErrors;
  if (erreurs.length) console.log('   ', JSON.stringify(erreurs));
}
console.log(APPLIQUE ? 'Suivi de stock retiré.' : 'Simulation. --sec pour appliquer.');
