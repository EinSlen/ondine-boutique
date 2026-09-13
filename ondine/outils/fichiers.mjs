/**
 * Envoie des images dans les Fichiers de la boutique, en trois temps comme l'exige
 * l'API : on demande une place, on téléverse dessus, on déclare le fichier.
 * Les visuels ainsi déposés se référencent dans un thème par shopify://shop_images/nom.jpg,
 * ce qui laisse Shopify générer les tailles et le srcset au lieu de figer une URL.
 *
 * Usage :
 *   node fichiers.mjs --liste
 *   node fichiers.mjs ../visuels/d2m-hero.jpg ../visuels/look-01.jpg
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

const GQL = `https://${env.SHOPIFY_STORE}/admin/api/${env.SHOPIFY_API_VERSION || '2026-07'}/graphql.json`;
const H = { 'X-Shopify-Access-Token': env.SHOPIFY_TOKEN, 'Content-Type': 'application/json' };

const gql = async (query, variables = {}) => {
  const r = await fetch(GQL, { method: 'POST', headers: H, body: JSON.stringify({ query, variables }) });
  const j = await r.json();
  if (j.errors) throw new Error(JSON.stringify(j.errors).slice(0, 400));
  return j.data;
};

if (process.argv.includes('--supprimer')) {
  const noms = process.argv.slice(process.argv.indexOf('--supprimer') + 1);
  const d = await gql(`{ files(first: 250, sortKey: CREATED_AT, reverse: true) {
    nodes { id ... on MediaImage { image { url } } } } }`);
  const ids = [];
  for (const f of d.files.nodes) {
    if (!f.image) continue;
    const nom = decodeURIComponent(f.image.url.split('/').pop().split('?')[0]);
    if (noms.some((n) => nom === n || nom.startsWith(n.replace(/\.[a-z]+$/i, '') + '_'))) {
      ids.push(f.id);
      console.log(`  supprime ${nom}`);
    }
  }
  if (ids.length) {
    const r = await gql(`mutation($ids:[ID!]!){ fileDelete(fileIds:$ids){ userErrors{ message } } }`, { ids });
    if (r.fileDelete.userErrors.length) console.log(JSON.stringify(r.fileDelete.userErrors));
  }
  process.exitCode = 0;
} else if (process.argv.includes('--liste')) {
  const d = await gql(`{ files(first: 100, sortKey: CREATED_AT, reverse: true) {
    nodes { ... on MediaImage { id fileStatus image { url width height } } } } }`);
  for (const f of d.files.nodes) {
    if (!f.image) continue;
    console.log(`  ${f.fileStatus.padEnd(5)} ${f.image.width}x${f.image.height}  ${f.image.url.split('/').pop().split('?')[0]}`);
  }
  process.exitCode = 0;
} else {
  const chemins = process.argv.slice(2).filter((a) => !a.startsWith('--'));
  if (!chemins.length) {
    console.error('Donne au moins un chemin de fichier.');
    process.exitCode = 1;
  }

  const type = (f) =>
    ({ '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp' })[
      path.extname(f).toLowerCase()
    ] || 'application/octet-stream';

  for (const c of chemins) {
    const src = path.resolve(HERE, c);
    const nom = path.basename(src);
    const corps = readFileSync(src);

    const { stagedUploadsCreate } = await gql(
      `mutation($input:[StagedUploadInput!]!){ stagedUploadsCreate(input:$input){
        stagedTargets{ url resourceUrl parameters{ name value } } userErrors{ message } } }`,
      { input: [{ filename: nom, mimeType: type(nom), httpMethod: 'POST', resource: 'FILE', fileSize: String(corps.length) }] },
    );
    if (stagedUploadsCreate.userErrors.length) throw new Error(JSON.stringify(stagedUploadsCreate.userErrors));
    const cible = stagedUploadsCreate.stagedTargets[0];

    const form = new FormData();
    for (const p of cible.parameters) form.append(p.name, p.value);
    form.append('file', new Blob([corps], { type: type(nom) }), nom);
    const envoi = await fetch(cible.url, { method: 'POST', body: form });
    if (!envoi.ok) throw new Error(`Téléversement refusé pour ${nom} : HTTP ${envoi.status}`);

    const { fileCreate } = await gql(
      `mutation($files:[FileCreateInput!]!){ fileCreate(files:$files){
        files{ fileStatus ... on MediaImage { id image { url } } } userErrors{ message } } }`,
      { files: [{ originalSource: cible.resourceUrl, contentType: 'IMAGE', filename: nom }] },
    );
    if (fileCreate.userErrors.length) throw new Error(JSON.stringify(fileCreate.userErrors));
    console.log(`  déposé ${nom} -> shopify://shop_images/${nom}`);
  }
}
