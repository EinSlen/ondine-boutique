// Adds the HD 1080P version (same H88 multi-pack, Alibaba lot 1080P at 20,27 EUR) as a 4th offer of the camera, like Necknix.
// node version-1080p.mjs            -> create the Noir and Blanc variants at 69,90 EUR (last offer card)
// node version-1080p.mjs --retirer  -> delete them
import { gql } from './shop.mjs';

const HANDLE = 'kapsulcam-4k';
const OFFRE = 'Version HD 1080P';
const PRIX = '69.90';

const prod = (await gql(`query($h: String!) { productByHandle(handle: $h) {
  id media(first: 50) { nodes { id ... on MediaImage { image { url } } } }
  variants(first: 50) { nodes { id title selectedOptions { name value } } } } }`, { h: HANDLE })).productByHandle;
const mine = prod.variants.nodes.filter((v) => v.selectedOptions.some((o) => o.value === OFFRE));

if (process.argv.includes('--retirer')) {
  if (!mine.length) { console.log('rien à retirer'); process.exit(0); }
  const d = await gql(`mutation($p: ID!, $v: [ID!]!) { productVariantsBulkDelete(productId: $p, variantsIds: $v) { userErrors { message } } }`, { p: prod.id, v: mine.map((v) => v.id) });
  console.log('retiré', mine.length, JSON.stringify(d.productVariantsBulkDelete.userErrors));
  process.exit(0);
}
if (mine.length) { console.log('déjà présentes :', mine.map((v) => v.title).join(' | ')); process.exit(0); }

const image = (nom) => prod.media.nodes.find((m) => m.image && m.image.url.includes(nom))?.id;
const variants = [['Noir', 'KC1080-NOIR', 'kc3-01-noir'], ['Blanc', 'KC1080-BLANC', 'kc3-02-blanc']].map(([couleur, sku, img]) => ({
  optionValues: [{ optionName: 'Couleur', name: couleur }, { optionName: 'Pack', name: OFFRE }],
  price: PRIX,
  inventoryPolicy: 'CONTINUE',
  inventoryItem: { sku, tracked: false, requiresShipping: true },
  mediaId: image(img),
}));
const d = await gql(`mutation($p: ID!, $v: [ProductVariantsBulkInput!]!) { productVariantsBulkCreate(productId: $p, variants: $v) {
  productVariants { id title price sku } userErrors { field message } } }`, { p: prod.id, v: variants });
console.log(JSON.stringify(d.productVariantsBulkCreate, null, 1));
