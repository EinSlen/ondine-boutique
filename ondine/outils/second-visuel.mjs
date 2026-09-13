/**
 * Fabrique le SECOND visuel de chaque produit, par recadrage sur le dessin.
 *
 * POURQUOI : le thème révèle une deuxième image au survol de la carte, et chaque produit n'en
 * a qu'une. Sur une pièce à 90 € une seule photo est trop peu, et la grille reste morte au
 * survol. Aucun deuxième angle n'existe dans le projet, donc on tire le second visuel du
 * premier : un gros plan sur l'imprimé, qui est justement ce qu'on achète.
 *
 * COMMENT LE CADRE EST TROUVÉ : le vêtement est détouré sur noir, donc on mesure d'abord sa
 * boîte réelle (pixels non noirs) au lieu de découper à l'aveugle dans l'image. Le buste se
 * situe ensuite dans le haut de cette boîte. Sans cette étape, un vêtement cadré petit dans
 * une grande image donnerait un gros plan sur du vide.
 *
 * LIMITE ASSUMÉE : un recadrage ne crée pas de détail. En dessous de 1000 px de large la
 * source ne supporte pas l'opération et le produit est ignoré, avec un message. La réponse
 * pour ceux-là est une meilleure photo, pas un meilleur script.
 *
 * Usage :
 *   node second-visuel.mjs             produit les recadrages dans _seconds/ et une planche
 *   node second-visuel.mjs --envoyer   les ajoute aux fiches produit sur Shopify
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { navigateur } from '../contenu/navigateur.mjs';

const ICI = path.dirname(fileURLToPath(import.meta.url));
const SORTIE = path.join(ICI, '_seconds');
const ENVOYER = process.argv.includes('--envoyer');
const LARGEUR_MINI = 1000;

const env = (() => {
  const f = path.join(ICI, '.env');
  const out = {};
  if (!existsSync(f)) return out;
  for (const l of readFileSync(f, 'utf8').split(/\r?\n/)) {
    const m = l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
  return out;
})();
const BASE = `https://${env.SHOPIFY_STORE}/admin/api/${env.SHOPIFY_API_VERSION || '2026-01'}/`;
const H = { 'X-Shopify-Access-Token': env.SHOPIFY_TOKEN, 'Content-Type': 'application/json' };
const gql = async (query, variables) => {
  const r = await fetch(`${BASE}graphql.json`, { method: 'POST', headers: H, body: JSON.stringify({ query, variables }) });
  return r.json();
};

/**
 * Tourne DANS la page. Mesure la boîte du vêtement, puis rend le gros plan du buste.
 *
 * Le seuil de 26 sur la somme RVB tolère le noir non parfaitement pur des photos compressées :
 * à 0 la boîte prenait toute l'image à cause du bruit de compression dans les coins.
 */
const recadrer = async ({ source, hautBoite, basBoite, marge }) => {
  const img = new Image();
  img.src = source;
  await img.decode();
  const W = img.naturalWidth;
  const Hh = img.naturalHeight;
  const c = document.createElement('canvas');
  c.width = W;
  c.height = Hh;
  const x = c.getContext('2d', { willReadFrequently: true });
  x.drawImage(img, 0, 0);
  const d = x.getImageData(0, 0, W, Hh).data;

  let x0 = W, y0 = Hh, x1 = 0, y1 = 0;
  for (let i = 0; i < d.length; i += 4) {
    if (d[i] + d[i + 1] + d[i + 2] < 26) continue;
    const p = i / 4;
    const px = p % W;
    const py = (p - px) / W;
    if (px < x0) x0 = px;
    if (py < y0) y0 = py;
    if (px > x1) x1 = px;
    if (py > y1) y1 = py;
  }
  const bw = x1 - x0;
  const bh = y1 - y0;
  if (bw < 40 || bh < 40) throw new Error('vêtement introuvable sur le fond');

  // On centre sur l'ENCRE, pas sur le buste : viser la poitrine coupait le dessin en deux sur
  // les pièces où l'imprimé est bas. L'encre est ce qui s'écarte le plus de la couleur
  // dominante du vêtement, ce qui marche aussi bien pour du noir sur gris que du blanc sur
  // noir. On prend l'étendue verticale du gros de cette encre, pas son seul centre, sinon un
  // dessin haut et large se retrouve cadré trop serré.
  const lum = (i) => 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
  const ech = [];
  for (let py = y0; py <= y1; py += 2) {
    for (let px = x0; px <= x1; px += 2) ech.push(lum((py * W + px) * 4));
  }
  ech.sort((a, b) => a - b);
  const fond = ech[Math.floor(ech.length / 2)];
  const parLigne = new Float64Array(Hh);
  let total = 0;
  for (let py = y0; py <= y1; py++) {
    for (let px = x0; px <= x1; px++) {
      const i = (py * W + px) * 4;
      if (d[i] + d[i + 1] + d[i + 2] < 26) continue;
      if (Math.abs(lum(i) - fond) > 60) { parLigne[py]++; total++; }
    }
  }
  // Bornes serrées à 15 % et 85 % de l'encre cumulée. Les éclaboussures sont dispersées sur
  // toute la pièce : à 8 et 92 elles étiraient la mesure et le « détail » montrait presque
  // le vêtement entier, donc n'apportait rien au survol.
  let cum = 0;
  let encreHaut = y0;
  let encreBas = y1;
  for (let py = y0; py <= y1; py++) {
    cum += parLigne[py];
    if (cum <= total * 0.15) encreHaut = py;
    if (cum <= total * 0.85) encreBas = py;
  }
  const utile = total > bw * 2 && encreBas > encreHaut;
  const centre = utile ? (encreHaut + encreBas) / 2 : y0 + bh * ((hautBoite + basBoite) / 2);
  const hauteurEncre = utile ? encreBas - encreHaut : bh * (basBoite - hautBoite);

  // Le plafond est ce qui garantit que ça reste un gros plan : au-delà des deux tiers de la
  // hauteur du vêtement, la seconde image redevient la première.
  let ch = Math.min(Math.max(hauteurEncre * 1.35, bh * 0.3), bh * 0.62);
  let cw = ch * 0.8;
  if (cw > bw * (1 + marge)) { cw = bw * (1 + marge); ch = cw / 0.8; }
  const cx = x0 + bw / 2 - cw / 2;
  const cy0 = Math.max(0, Math.min(centre - ch / 2, Hh - ch));

  const out = document.createElement('canvas');
  out.width = Math.round(cw);
  out.height = Math.round(ch);
  const o = out.getContext('2d');
  o.imageSmoothingQuality = 'high';
  o.fillStyle = '#000';
  o.fillRect(0, 0, out.width, out.height);
  o.drawImage(c, Math.round(cx), Math.round(cy0), Math.round(cw), Math.round(ch), 0, 0, out.width, out.height);
  return { donnees: out.toDataURL('image/png'), taille: `${out.width}x${out.height}`, boite: `${bw}x${bh}` };
};

const main = async () => {
  mkdirSync(SORTIE, { recursive: true });
  const j = await (await fetch(`${BASE}products.json?limit=250&status=active`, { headers: H })).json();

  const { default: puppeteer } = await import('puppeteer-core');
  const nav = await puppeteer.launch({ executablePath: navigateur(), headless: true, args: ['--no-sandbox'] });
  const page = await nav.newPage();

  const faits = [];
  for (const p of j.products || []) {
    const img = (p.images || [])[0];
    if (!img) { console.log(`${p.handle.padEnd(20)} aucune image`); continue; }
    if ((p.images || []).length > 1) { console.log(`${p.handle.padEnd(20)} a déjà un second visuel`); continue; }
    if (img.width < LARGEUR_MINI) {
      console.log(`${p.handle.padEnd(20)} IGNORÉ : source ${img.width}x${img.height}, sous le seuil de ${LARGEUR_MINI} px. Il faut une meilleure photo.`);
      continue;
    }
    const bin = Buffer.from(await (await fetch(img.src)).arrayBuffer());
    const type = img.src.includes('.webp') ? 'image/webp' : 'image/png';
    const source = `data:${type};base64,${bin.toString('base64')}`;
    const r = await page.evaluate(recadrer, { source, hautBoite: 0.1, basBoite: 0.62, marge: 0.02 });
    const dest = path.join(SORTIE, `${p.handle}-2.png`);
    writeFileSync(dest, Buffer.from(r.donnees.split(',')[1], 'base64'));
    console.log(`${p.handle.padEnd(20)} vêtement ${r.boite} -> gros plan ${r.taille}`);
    faits.push({ produit: p, fichier: dest });
  }
  await nav.close();

  if (!ENVOYER) {
    console.log(`\n${faits.length} recadrage(s) dans ${SORTIE}. Relance avec --envoyer pour les publier.`);
    return;
  }

  for (const f of faits) {
    const bin = readFileSync(f.fichier);
    let r = await gql(
      'mutation($i:[StagedUploadInput!]!){stagedUploadsCreate(input:$i){stagedTargets{url resourceUrl parameters{name value}} userErrors{message}}}',
      { i: [{ filename: path.basename(f.fichier), mimeType: 'image/png', resource: 'IMAGE', httpMethod: 'POST' }] },
    );
    const t = r.data?.stagedUploadsCreate?.stagedTargets?.[0];
    if (!t) { console.log(`${f.produit.handle} : dépôt refusé`); continue; }
    const fd = new FormData();
    for (const q of t.parameters) fd.append(q.name, q.value);
    fd.append('file', new Blob([bin], { type: 'image/png' }), path.basename(f.fichier));
    await fetch(t.url, { method: 'POST', body: fd });

    r = await gql(
      'mutation($id:ID!,$m:[CreateMediaInput!]!){productCreateMedia(productId:$id,media:$m){media{status} mediaUserErrors{message}}}',
      { id: `gid://shopify/Product/${f.produit.id}`, m: [{ originalSource: t.resourceUrl, mediaContentType: 'IMAGE', alt: `${f.produit.title}, détail de l'impression` }] },
    );
    const e = r.data?.productCreateMedia?.mediaUserErrors || [];
    console.log(`${f.produit.handle.padEnd(20)} ${e.length ? JSON.stringify(e).slice(0, 150) : 'second visuel publié'}`);
  }
};

main().catch((e) => {
  console.error(`ECHEC : ${e.message}`);
  process.exit(1);
});
