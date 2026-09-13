/**
 * Donne un poids à chaque variante. Elles étaient toutes à zéro, ce qui fausse tout calcul
 * de frais de port par le transporteur et fait refuser certaines étiquettes.
 * Ce sont des ordres de grandeur pour du coton lourd : à remplacer par les poids réels
 * du blank le jour où le fournisseur est choisi.
 *
 * Usage : node poids.mjs [--sec]
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

const gql = async (query, variables = {}) => {
  const r = await fetch(`${BASE}/graphql.json`, { method: 'POST', headers: H, body: JSON.stringify({ query, variables }) });
  const j = await r.json();
  if (j.errors) throw new Error(JSON.stringify(j.errors).slice(0, 300));
  return j.data;
};

const GRAMMES = {
  'd2m-heavyweight-tee': 280,
  'd2m-essentials-tee': 220,
  'run-away-tee': 220,
  'd2m-hoodie': 700,
  'd2m-zip-hoodie': 760,
  'split-figures-zip': 760,
  'seated-figure-zip': 760,
  'table-alone-zip': 760,
  'aftermath-zip': 760,
  'void-wide-leg-joggers': 480,
  'static-wide-leg-pants': 520,
  'no-signal-track-pants': 420,
};

const { products } = await gql(`{
  products(first: 50, query: "status:active") {
    nodes { id handle title variants(first: 20) { nodes { id inventoryItem { id measurement { weight { value unit } } } } } }
  }
}`);

for (const p of products.nodes) {
  const g = GRAMMES[p.handle];
  if (!g) continue;
  console.log(`${p.title.padEnd(24)} ${p.variants.nodes.length} variantes -> ${g} g`);
  if (!APPLIQUE) continue;
  const res = await gql(
    `mutation($productId:ID!,$variants:[ProductVariantsBulkInput!]!){
       productVariantsBulkUpdate(productId:$productId, variants:$variants){ userErrors{ message field } } }`,
    {
      productId: p.id,
      variants: p.variants.nodes.map((v) => ({
        id: v.id,
        inventoryItem: { measurement: { weight: { value: g, unit: 'GRAMS' } } },
      })),
    },
  );
  const erreurs = res.productVariantsBulkUpdate.userErrors;
  if (erreurs.length) console.log('   ', JSON.stringify(erreurs));
}
console.log(APPLIQUE ? 'Poids posés.' : 'Simulation. --sec pour appliquer.');
