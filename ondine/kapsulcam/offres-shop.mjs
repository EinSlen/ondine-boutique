// Puts the per-offer images (offres-visuels.mjs) on the product: one image per variant, so the main photo follows
// the offer picked in the buy box. Also replaces the Pack Complet thumbnail of the buy box.
import fs from 'node:fs';
import path from 'node:path';
import { gql, rest, ICI_DIR } from './shop.mjs';

const THEME = 190830182728;
const NEW = [
  ['10-pack-noir', 'KapsulCam Pack Complet noir : caméra 4K, carte microSD 64 Go, perche-trépied'],
  ['11-pack-blanc', 'KapsulCam Pack Complet blanc : caméra 4K, carte microSD 64 Go, perche-trépied'],
  ['12-duo-noir', 'KapsulCam Duo noir : 2 caméras 4K'],
  ['13-duo-blanc', 'KapsulCam Duo blanc : 2 caméras 4K'],
];
const put = (key, file) => rest('PUT', `themes/${THEME}/assets.json`, { asset: { key, attachment: fs.readFileSync(path.join(ICI_DIR, file)).toString('base64') } });

await put('assets/kc-offre-pack.png', 'buybox/kc-offre-pack.png');
console.log('vignette Pack Complet remplacée');

const P = `{ productByHandle(handle: "kapsulcam-4k") { id media(first: 50) { nodes { id alt status } } variants(first: 10) { nodes { id title } } } }`;
let prod = (await gql(P)).productByHandle;
const missing = NEW.filter(([, alt]) => !prod.media.nodes.some((m) => m.alt === alt));
if (missing.length) {
  const src = [];
  for (const [nom, alt] of missing) {
    const r = await put(`assets/kc3-${nom}.jpg`, `carrousel3/${nom}.jpg`);
    src.push({ originalSource: r.asset.public_url, alt, mediaContentType: 'IMAGE' });
  }
  const c = await gql(`mutation($id: ID!, $m: [CreateMediaInput!]!) { productCreateMedia(productId: $id, media: $m) { media { id } mediaUserErrors { message } } }`, { id: prod.id, m: src });
  console.log('médias créés', c.productCreateMedia.media.length, JSON.stringify(c.productCreateMedia.mediaUserErrors));
}
for (let i = 0; i < 30; i++) {
  prod = (await gql(P)).productByHandle;
  if (prod.media.nodes.every((m) => m.status === 'READY')) break;
  await new Promise((r) => setTimeout(r, 2000));
}
const byAlt = (re) => prod.media.nodes.find((m) => re.test(m.alt)).id;
const pick = (title) => {
  const blanc = title.startsWith('Blanc');
  if (title.includes('Pack')) return byAlt(blanc ? /Pack Complet blanc/ : /Pack Complet noir/);
  if (title.includes('Duo')) return byAlt(blanc ? /Duo blanc/ : /Duo noir/);
  return byAlt(blanc ? /version blanche/ : /noire, caméra POV/);
};
const u = await gql(`mutation($p: ID!, $v: [ProductVariantsBulkInput!]!) { productVariantsBulkUpdate(productId: $p, variants: $v) { productVariants { title media(first: 1) { nodes { alt } } } userErrors { field message } } }`,
  { p: prod.id, v: prod.variants.nodes.map((x) => ({ id: x.id, mediaId: pick(x.title) })) });
for (const v of u.productVariantsBulkUpdate.productVariants || []) console.log(v.title.padEnd(30), '->', v.media.nodes[0]?.alt);
console.log(JSON.stringify(u.productVariantsBulkUpdate.userErrors));
