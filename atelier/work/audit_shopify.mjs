import fs from 'node:fs';
import path from 'node:path';

const tools = 'C:/Users/Valentin/Desktop/Ondine/outils';
const env = {};
for (const line of fs.readFileSync(path.join(tools, '.env'), 'utf8').split(/\r?\n/)) {
  const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (match) env[match[1]] = match[2].replace(/^["']|["']$/g, '');
}

const store = env.SHOPIFY_STORE;
const version = env.SHOPIFY_API_VERSION || '2026-07';
const endpoint = `https://${store}/admin/api/${version}/graphql.json`;

async function gql(query) {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': env.SHOPIFY_TOKEN,
    },
    body: JSON.stringify({ query }),
  });
  const body = await response.text();
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${body.slice(0, 300)}`);
  const json = JSON.parse(body);
  if (json.errors) throw new Error(JSON.stringify(json.errors));
  return json.data;
}

const data = await gql(`{
  shop { name myshopifyDomain primaryDomain { host url } }
  products(first: 50, sortKey: UPDATED_AT, reverse: true) {
    nodes {
      title handle status onlineStoreUrl totalInventory tags
      featuredMedia { ... on MediaImage { image { url } } }
      media(first: 10) { nodes { mediaContentType } }
      variants(first: 50) { nodes { title sku price inventoryPolicy inventoryQuantity } }
    }
  }
  collections(first: 50) { nodes { title handle productsCount { count } } }
  pages(first: 50) { nodes { title handle isPublished } }
  menus(first: 20) { nodes { title handle itemsCount } }
}`);

const themeResponse = await fetch(`https://${store}/admin/api/${version}/themes.json`, {
  headers: { 'X-Shopify-Access-Token': env.SHOPIFY_TOKEN },
});
const themeJson = themeResponse.ok ? await themeResponse.json() : { themes: [] };

const report = {
  checkedAt: new Date().toISOString(),
  apiVersion: version,
  shop: data.shop,
  products: data.products.nodes.map((product) => ({
    title: product.title,
    handle: product.handle,
    status: product.status,
    onlineStoreUrl: product.onlineStoreUrl,
    imageCount: product.media.nodes.length,
    hasFeaturedImage: Boolean(product.featuredMedia?.image?.url),
    totalInventory: product.totalInventory,
    tags: product.tags,
    variants: product.variants.nodes.map((variant) => ({
      title: variant.title,
      sku: variant.sku,
      price: variant.price,
      inventoryPolicy: variant.inventoryPolicy,
      inventoryQuantity: variant.inventoryQuantity,
    })),
  })),
  collections: data.collections.nodes,
  pages: data.pages.nodes,
  menus: data.menus.nodes,
  themes: themeJson.themes.map(({ id, name, role, updated_at }) => ({ id, name, role, updated_at })),
};

console.log(JSON.stringify(report, null, 2));

