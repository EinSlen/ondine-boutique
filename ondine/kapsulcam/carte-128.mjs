// Aligns the microSD capacity on what the supplier box shows (128GB) : product description + theme templates (product, index).
// node carte-128.mjs [--appliquer]
import { gql, rest } from './shop.mjs';

const APPLIQUER = process.argv.includes('--appliquer');
const REMPLACEMENTS = [
  ["jusqu'à 256 Go", "jusqu'à 128 Go"],
  ['de 32 à 256 Go', "jusqu'à 128 Go"],
];
const corrige = (s) => REMPLACEMENTS.reduce((t, [a, b]) => t.split(a).join(b), s);

const { productByHandle: p } = await gql(`{ productByHandle(handle: "kapsulcam-4k") { id descriptionHtml } }`);
const desc = corrige(p.descriptionHtml);
console.log('fiche :', desc !== p.descriptionHtml ? 'à corriger' : 'rien');
if (APPLIQUER && desc !== p.descriptionHtml) {
  const r = await gql(`mutation($p: ProductUpdateInput!) { productUpdate(product: $p) { product { updatedAt } userErrors { message } } }`, { p: { id: p.id, descriptionHtml: desc } });
  console.log('fiche mise à jour', JSON.stringify(r.productUpdate));
}

const { themes } = await rest('GET', 'themes.json');
const theme = themes.find((t) => t.role === 'main');
for (const key of ['templates/product.json', 'templates/index.json']) {
  const { asset } = await rest('GET', `themes/${theme.id}/assets.json?asset[key]=${encodeURIComponent(key)}`);
  const v = corrige(asset.value);
  console.log(key, v !== asset.value ? 'à corriger' : 'rien', '| restant 256 Go :', (v.match(/256 Go/g) || []).length);
  if (APPLIQUER && v !== asset.value) {
    JSON.parse(v);
    await rest('PUT', `themes/${theme.id}/assets.json`, { asset: { key, value: v } });
    console.log(key, 'publié');
  }
}
