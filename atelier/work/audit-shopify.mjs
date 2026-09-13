import fs from 'node:fs';
import path from 'node:path';

const envFile = 'C:/Users/Valentin/Desktop/Ondine/outils/.env';
const env = Object.fromEntries(
  fs.readFileSync(envFile, 'utf8')
    .split(/\r?\n/)
    .filter((line) => line && !line.startsWith('#') && line.includes('='))
    .map((line) => {
      const index = line.indexOf('=');
      return [line.slice(0, index), line.slice(index + 1)];
    }),
);

const version = env.SHOPIFY_API_VERSION || '2026-07';
const base = `https://${env.SHOPIFY_STORE}/admin/api/${version}`;
const headers = {
  'Content-Type': 'application/json',
  'X-Shopify-Access-Token': env.SHOPIFY_TOKEN,
};

async function rest(route) {
  const response = await fetch(`${base}${route}`, { headers });
  if (!response.ok) throw new Error(`${route}: HTTP ${response.status}`);
  return response.json();
}

async function gql(query) {
  const response = await fetch(`${base}/graphql.json`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query }),
  });
  if (!response.ok) throw new Error(`GraphQL: HTTP ${response.status}`);
  const payload = await response.json();
  if (payload.errors) throw new Error(JSON.stringify(payload.errors));
  return payload.data;
}

const [shop, themes, catalogue] = await Promise.all([
  rest('/shop.json'),
  rest('/themes.json'),
  gql(`{
    products(first: 50, sortKey: UPDATED_AT, reverse: true) {
      nodes { title handle status updatedAt media(first: 20) { nodes { mediaContentType } } }
    }
    collections(first: 50) { nodes { title handle updatedAt } }
    pages(first: 50) { nodes { title handle updatedAt } }
  }`),
]);

console.log(JSON.stringify({
  shop: {
    name: shop.shop.name,
    domain: shop.shop.domain,
    myshopifyDomain: shop.shop.myshopify_domain,
    passwordEnabled: shop.shop.password_enabled,
  },
  themes: themes.themes.map(({ id, name, role, updated_at }) => ({ id, name, role, updatedAt: updated_at })),
  products: catalogue.products.nodes.map((product) => ({
    title: product.title,
    handle: product.handle,
    status: product.status,
    mediaCount: product.media.nodes.length,
    updatedAt: product.updatedAt,
  })),
  collections: catalogue.collections.nodes,
  pages: catalogue.pages.nodes,
}, null, 2));
