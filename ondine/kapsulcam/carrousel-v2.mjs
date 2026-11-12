// Replaces the product carousel with carrousel2/ (hosted as theme assets) and relinks variant images.
import fs from 'node:fs';
import path from 'node:path';
import { gql, rest, ICI_DIR } from './shop.mjs';

const THEME = 190830182728;
const ORDRE = [
  ['00-mer', 'KapsulCam 4K sur fond de surf au coucher du soleil'],
  ['01-contenu', 'Contenu du pack KapsulCam : caméra, caisson étanche, collier magnétique, bracelet, support guidon, clip, adaptateur'],
  ['02-supports', 'KapsulCam fixée sur un casque de ski, avec ses supports'],
  ['03-etanche', 'KapsulCam dans son caisson étanche 30 m, en plongée'],
  ['09-vtt', 'KapsulCam 4K sur fond de sentier VTT'],
  ['04-un-appui', 'KapsulCam : objectif grand angle, un seul bouton, 36 g'],
  ['10-moto', 'KapsulCam 4K sur fond de route de montagne à moto'],
  ['05-appli', 'Aperçu des vidéos KapsulCam sur un téléphone fixé au guidon'],
  ['11-neige', 'KapsulCam 4K sur fond de ski au coucher du soleil'],
  ['12-mer-blanc', 'KapsulCam 4K version blanche sur fond de surf'],
  ['06-specs', 'Caractéristiques KapsulCam : 4K, 36 g, 90 min, étanche 30 m, Wi-Fi'],
  ['07-comparatif', 'Comparatif KapsulCam, smartphone et action cam'],
  ['08-coloris', 'KapsulCam noire et blanche dans leur boîte'],
];

const files = [];
for (const [nom, alt] of ORDRE) {
  const r = await rest('PUT', `themes/${THEME}/assets.json`, { asset: { key: `assets/kc2-${nom}.jpg`, attachment: fs.readFileSync(path.join(ICI_DIR, 'carrousel2', `${nom}.jpg`)).toString('base64') } });
  files.push({ originalSource: r.asset.public_url, alt, contentType: 'IMAGE' });
  console.log('hébergé', nom);
}
fs.writeFileSync(path.join(ICI_DIR, 'images-cdn2.json'), JSON.stringify(files, null, 1));

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
