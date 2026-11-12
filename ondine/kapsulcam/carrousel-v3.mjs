// Replaces the product carousel with carrousel2/ (hosted as theme assets) and relinks variant images.
import fs from 'node:fs';
import path from 'node:path';
import { gql, rest, ICI_DIR } from './shop.mjs';

const THEME = 190830182728;
const ORDRE = [
  ['01-noir', 'KapsulCam 4K noire, caméra POV de 36 g'],
  ['04-ski', 'KapsulCam fixée sur un casque de ski'],
  ['03-pack', 'Contenu de la boîte KapsulCam : caméra, caisson étanche, collier, bracelet, support guidon, clip, adaptateur'],
  ['05-plongee', 'KapsulCam dans son caisson étanche, en plongée'],
  ['06-collier', 'KapsulCam portée au collier magnétique'],
  ['07-sac', 'KapsulCam clipsée sur une bretelle de sac à dos'],
  ['08-poignet', 'KapsulCam portée au poignet avec le bracelet'],
  ['09-specs', 'Caractéristiques KapsulCam : 4K, 36 g, 90 min, étanche 30 m, Wi-Fi, USB-C'],
  ['02-blanc', 'KapsulCam 4K version blanche'],
];

const files = [];
for (const [nom, alt] of ORDRE) {
  const r = await rest('PUT', `themes/${THEME}/assets.json`, { asset: { key: `assets/kc3-${nom}.jpg`, attachment: fs.readFileSync(path.join(ICI_DIR, 'carrousel3', `${nom}.jpg`)).toString('base64') } });
  files.push({ originalSource: r.asset.public_url, alt, contentType: 'IMAGE' });
  console.log('hébergé', nom);
}
fs.writeFileSync(path.join(ICI_DIR, 'images-cdn3.json'), JSON.stringify(files, null, 1));

const p = (await gql(`{ productByHandle(handle: "kapsulcam-4k") { id media(first: 50) { nodes { id } } } }`)).productByHandle;
const old = p.media.nodes.map((m) => m.id);
const c = await gql(`mutation($id: ID!, $m: [CreateMediaInput!]!) { productCreateMedia(productId: $id, media: $m) { media { id } mediaUserErrors { message } } }`,
  { id: p.id, m: files.map((f) => ({ originalSource: f.originalSource, alt: f.alt, mediaContentType: 'IMAGE' })) });
console.log('créés', c.productCreateMedia.media.length, JSON.stringify(c.productCreateMedia.mediaUserErrors));
if (old.length) {
  const d = await gql(`mutation($id: ID!, $ids: [ID!]!) { productDeleteMedia(productId: $id, mediaIds: $ids) { deletedMediaIds mediaUserErrors { message } } }`, { id: p.id, ids: old });
  console.log('anciens retirés', d.productDeleteMedia.deletedMediaIds.length);
}
for (let i = 0; i < 20; i++) {
  const m = (await gql(`{ productByHandle(handle: "kapsulcam-4k") { media(first: 50) { nodes { id status alt } } } }`)).productByHandle.media.nodes;
  if (m.every((x) => x.status === 'READY')) break;
  await new Promise((r) => setTimeout(r, 2000));
}
const q = (await gql(`{ productByHandle(handle: "kapsulcam-4k") { id media(first: 50) { nodes { id alt } } variants(first: 10) { nodes { id title } } } }`)).productByHandle;
const noir = q.media.nodes[0].id;
const blanc = q.media.nodes.find((m) => /version blanche/.test(m.alt)).id;
const v = await gql(`mutation($p: ID!, $v: [ProductVariantAppendMediaInput!]!) { productVariantAppendMedia(productId: $p, variantMedia: $v) { userErrors { message } } }`,
  { p: q.id, v: q.variants.nodes.map((x) => ({ variantId: x.id, mediaIds: [x.title.startsWith('Blanc') ? blanc : noir] })) });
console.log('variantes', JSON.stringify(v.productVariantAppendMedia.userErrors));
