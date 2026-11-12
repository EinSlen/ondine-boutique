// Creates the "Kit carte microSD 64 Go + perche-trépied" accessory (the supplier only ships card + mount together)
// and drafts the two single accessories. node kit.mjs
import fs from 'node:fs';
import path from 'node:path';
import { gql, rest, ICI_DIR } from './shop.mjs';

const THEME = 190830182728;
const HANDLE = 'kit-carte-perche';
const imgs = [
  ['fournisseur/nora/perche-reel-1.jpg', 'kc-kit-1.jpg', 'Perche-trépied du kit, dépliée avec la caméra'],
  ['acc/sd64-v2.jpg', 'kc-kit-2.jpg', 'Carte microSD 64 Go U3 du kit'],
  ['fournisseur/nora/perche-reel-2.jpg', 'kc-kit-3.jpg', 'Perche repliée avec son adaptateur et sa vis'],
];
const files = [];
for (const [src, key, alt] of imgs) {
  const a = await rest('PUT', `themes/${THEME}/assets.json`, { asset: { key: `assets/${key}`, attachment: fs.readFileSync(path.join(ICI_DIR, src)).toString('base64') } });
  files.push({ originalSource: a.asset.public_url, alt, contentType: 'IMAGE' });
}
const ex = (await gql(`query($h: String!) { productByHandle(handle: $h) { id } }`, { h: HANDLE })).productByHandle;
const r = await gql(`mutation($input: ProductSetInput!) { productSet(synchronous: true, input: $input) { product { id handle } userErrors { message } } }`, { input: {
  ...(ex ? { id: ex.id } : {}), handle: HANDLE, title: 'Kit carte microSD 64 Go + perche-trépied', templateSuffix: 'accessoire',
  descriptionHtml: "<p>La carte microSD 64 Go classe U3, adaptée à la 4K (environ 2 heures de vidéo), et la perche-trépied 3 en 1 avec son adaptateur pour la KapsulCam. C'est le même kit que celui du Pack Complet.</p>",
  vendor: 'KapsulCam', productType: 'Accessoire', status: 'ACTIVE',
  productOptions: [{ name: 'Title', values: [{ name: 'Default Title' }] }],
  files: ex ? undefined : files,
  variants: [{ optionValues: [{ optionName: 'Title', name: 'Default Title' }], price: '44.80', sku: 'KC-KIT', inventoryPolicy: 'CONTINUE',
    inventoryItem: { tracked: false, requiresShipping: true, measurement: { weight: { value: 0.26, unit: 'KILOGRAMS' } } } }],
} });
console.log('kit', JSON.stringify(r.productSet.userErrors), r.productSet.product && r.productSet.product.handle);
const pubs = (await gql(`{ publications(first: 20) { nodes { id name } } }`)).publications.nodes.filter((x) => /Online Store|Shop/.test(x.name));
await gql(`mutation($id: ID!, $input: [PublicationInput!]!) { publishablePublish(id: $id, input: $input) { userErrors { message } } }`, { id: r.productSet.product.id, input: pubs.map((x) => ({ publicationId: x.id })) });
for (const h of ['carte-microsd-64-go', 'perche-trepied-3-en-1']) {
  const p = (await gql(`query($h: String!) { productByHandle(handle: $h) { id } }`, { h })).productByHandle;
  const u = await gql(`mutation($p: ProductUpdateInput!) { productUpdate(product: $p) { product { handle status } userErrors { message } } }`, { p: { id: p.id, status: 'DRAFT' } });
  console.log(h, JSON.stringify(u.productUpdate.product));
}
