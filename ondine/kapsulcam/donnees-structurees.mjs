/**
 * Données structurées produit pour la Search Console (Fiches de marchand) : politique de retour
 * (30 jours, retour par courrier à la charge du client) et livraison offerte FR/BE/LU (1-3 j de
 * préparation + 9-15 j de transport = les 10-18 jours ouvrés affichés) sur chaque offre, description
 * sur chaque variante. Le JSON-LD Shopify passe par le snippet theme/kc-structured-data.liquid.
 *
 * Usage : node donnees-structurees.mjs --test     (envoie le snippet + une section de test invisible, vérifie le JSON rendu)
 *         node donnees-structurees.mjs            (sauvegarde puis branche le snippet dans les 2 sections produit)
 *         node donnees-structurees.mjs --revenir  (remet les sections sauvegardées)
 */

import fs from 'node:fs';
import path from 'node:path';
import { rest, ICI_DIR } from './shop.mjs';

const THEME = 190830182728;
const SNIPPET = 'snippets/kc-structured-data.liquid';
const TEST = 'sections/kc-sd-test.liquid';
const SECTIONS = ['sections/main-product.liquid', 'sections/featured-product.liquid'];
const AVANT = '{{ product | structured_data }}';
const APRES = "{% render 'kc-structured-data', product: product %}";
const sauvegarde = (key) => path.join(ICI_DIR, 'theme', `${path.basename(key, '.liquid')}.avant-donnees.liquid`);

const lire = async (key) => (await rest('GET', `themes/${THEME}/assets.json?asset[key]=${key}`)).asset.value;
const ecrire = async (key, value) => {
  await rest('PUT', `themes/${THEME}/assets.json`, { asset: { key, value } });
  console.log('publié', key);
};

const verifier = async (url) => {
  const html = await (await fetch(url, { headers: { 'cache-control': 'no-cache' } })).text();
  const blocs = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]));
  for (const j of blocs.filter((x) => /Product/.test(x['@type']))) {
    const produits = j.hasVariant || [j];
    const offres = produits.map((v) => v.offers);
    const ok = {
      description: produits.every((v) => v.description || j.description && !j.hasVariant),
      retour: offres.every((o) => o.hasMerchantReturnPolicy?.merchantReturnDays === 30),
      livraison: offres.every((o) => o.shippingDetails?.length === 3),
    };
    console.log(url, '|', j['@type'], produits.length, 'élément(s)', '|', JSON.stringify(ok));
    if (!Object.values(ok).every(Boolean)) process.exitCode = 1;
  }
  if (!blocs.some((x) => /Product/.test(x['@type']))) { console.log(url, '| aucun JSON-LD produit'); process.exitCode = 1; }
};

if (process.argv.includes('--revenir')) {
  for (const key of SECTIONS) await ecrire(key, fs.readFileSync(sauvegarde(key), 'utf8'));
  process.exit(0);
}

await ecrire(SNIPPET, fs.readFileSync(path.join(ICI_DIR, 'theme', 'kc-structured-data.liquid'), 'utf8'));

if (process.argv.includes('--test')) {
  await ecrire(TEST, `<script type="application/ld+json">{% if product %}{% render 'kc-structured-data', product: product %}{% else %}{% render 'kc-structured-data', product: all_products['kapsulcam-4k'] %}{% endif %}</script>\n{% schema %}{"name":"KC SD test"}{% endschema %}\n`);
  for (const u of ['https://kapsulcam.com/products/kapsulcam-4k', 'https://kapsulcam.com/products/kit-carte-perche', 'https://kapsulcam.com/']) {
    await verifier(`${u}${u.includes('?') ? '&' : '?'}section_id=kc-sd-test`);
  }
  await rest('DELETE', `themes/${THEME}/assets.json?asset[key]=${TEST}`);
  console.log('section de test retirée');
  process.exit(0);
}

for (const key of SECTIONS) {
  const enLigne = await lire(key);
  if (enLigne.includes(APRES)) { console.log('déjà en place', key); continue; }
  if (enLigne.split(AVANT).length !== 2) throw new Error(`ancre introuvable dans ${key}`);
  fs.writeFileSync(sauvegarde(key), enLigne);
  await ecrire(key, enLigne.replace(AVANT, APRES));
  fs.writeFileSync(path.join(ICI_DIR, 'theme', path.basename(key)), enLigne.replace(AVANT, APRES));
}
await new Promise((r) => setTimeout(r, 5000));
for (const u of ['https://kapsulcam.com/products/kapsulcam-4k', 'https://kapsulcam.com/products/kit-carte-perche', 'https://kapsulcam.com/']) await verifier(u);
