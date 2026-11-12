// Adds the home hero video (from the surf shot, square crop, "Images d'illustration") as 2nd media of the product gallery.
// node galerie-video.mjs            -> render + upload + place in position 2
// node galerie-video.mjs --rendu    -> render only
// node galerie-video.mjs --retirer  -> delete that media from the product
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { gql, ICI_DIR } from './shop.mjs';

const HANDLE = 'kapsulcam-4k';
const SRC = path.join(ICI_DIR, 'videos', 'hero-16x9.mp4');
const OUT = path.join(ICI_DIR, 'videos', 'galerie-hero-1x1.mp4');
const ETAT = path.join(ICI_DIR, 'galerie-video.json');
const ALT = 'KapsulCam : mer, surf et plongée (images d\'illustration)';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const prod = (await gql(`query($h: String!) { productByHandle(handle: $h) { id media(first: 50) { nodes { id } } } }`, { h: HANDLE })).productByHandle;

if (process.argv.includes('--retirer')) {
  const { mediaId } = JSON.parse(fs.readFileSync(ETAT, 'utf8'));
  const d = await gql(`mutation($p: ID!, $m: [ID!]!) { productDeleteMedia(productId: $p, mediaIds: $m) { deletedMediaIds mediaUserErrors { message } } }`, { p: prod.id, m: [mediaId] });
  console.log('retiré', JSON.stringify(d.productDeleteMedia));
  fs.unlinkSync(ETAT);
  process.exit(0);
}

const txt = path.join(ICI_DIR, 'videos', 'galerie-hero-mention.txt');
fs.writeFileSync(txt, 'Images d\'illustration');
const esc = (p) => p.replace(/\\/g, '/').replace(/:/g, '\\:');
execFileSync('ffmpeg', ['-v', 'error', '-y', '-ss', '3.9', '-i', SRC, '-an', '-vf',
  `crop=720:720:280:0,drawtext=fontfile='${esc('C:/Windows/Fonts/segoeui.ttf')}':textfile='${esc(txt)}':fontsize=22:fontcolor=white@0.9:shadowcolor=black@0.7:shadowx=0:shadowy=2:x=22:y=h-th-22`,
  '-c:v', 'libx264', '-crf', '20', '-preset', 'slow', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', OUT]);
const size = fs.statSync(OUT).size;
console.log('vidéo', OUT, Math.round(size / 1024), 'Ko');
if (process.argv.includes('--rendu')) process.exit(0);

const st = (await gql(`mutation($i: [StagedUploadInput!]!) { stagedUploadsCreate(input: $i) { stagedTargets { url resourceUrl parameters { name value } } userErrors { message } } }`,
  { i: [{ filename: 'kapsulcam-galerie.mp4', mimeType: 'video/mp4', resource: 'VIDEO', fileSize: String(size), httpMethod: 'POST' }] })).stagedUploadsCreate;
if (st.userErrors.length) throw new Error(JSON.stringify(st.userErrors));
const t = st.stagedTargets[0];
const form = new FormData();
for (const { name, value } of t.parameters) form.append(name, value);
form.append('file', new Blob([fs.readFileSync(OUT)], { type: 'video/mp4' }), 'kapsulcam-galerie.mp4');
const up = await fetch(t.url, { method: 'POST', body: form });
if (!up.ok) throw new Error(`envoi ${up.status} ${(await up.text()).slice(0, 300)}`);
console.log('envoyée');

const c = (await gql(`mutation($id: ID!, $m: [CreateMediaInput!]!) { productCreateMedia(productId: $id, media: $m) { media { id status } mediaUserErrors { message } } }`,
  { id: prod.id, m: [{ originalSource: t.resourceUrl, mediaContentType: 'VIDEO', alt: ALT }] })).productCreateMedia;
if (c.mediaUserErrors.length) throw new Error(JSON.stringify(c.mediaUserErrors));
const mediaId = c.media[0].id;
fs.writeFileSync(ETAT, JSON.stringify({ mediaId }, null, 1));
console.log('média', mediaId);

for (let i = 0; i < 60; i++) {
  const s = (await gql(`query($id: ID!) { node(id: $id) { ... on Video { status } } }`, { id: mediaId })).node.status;
  if (s === 'READY') break;
  if (s === 'FAILED') throw new Error('traitement Shopify échoué');
  await sleep(5000);
}
const r = await gql(`mutation($id: ID!, $m: [MoveInput!]!) { productReorderMedia(id: $id, moves: $m) { job { id } mediaUserErrors { message } } }`,
  { id: prod.id, m: [{ id: mediaId, newPosition: '1' }] });
console.log('position 2', JSON.stringify(r.productReorderMedia.mediaUserErrors));
await sleep(4000);
const fin = (await gql(`query($h: String!) { productByHandle(handle: $h) { media(first: 5) { nodes { id mediaContentType alt } } } }`, { h: HANDLE })).productByHandle.media.nodes;
fin.forEach((m, i) => console.log(i + 1, m.mediaContentType, m.alt));
