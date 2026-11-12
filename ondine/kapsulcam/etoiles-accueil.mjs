/**
 * Note Judge.me sur l'accueil : badge étoiles + « 12 avis » sous le titre du produit (theme/kc-rating.liquid),
 * lien vers les avis de la fiche (ancre #avis posée sur le bloc « Ce qu'en disent les acheteurs » et sa mention
 * place de marché), et aggregateRating dans le JSON-LD de l'accueil (rating: true sur kc-structured-data).
 * Pas de "review" sur l'accueil : les avis eux-mêmes n'y sont pas affichés.
 *
 * Usage : node etoiles-accueil.mjs --test     (snippets + section de test invisible, vérifie le rendu)
 *         node etoiles-accueil.mjs            (sauvegarde puis publie)
 *         node etoiles-accueil.mjs --revenir  (remet les fichiers sauvegardés)
 */

import fs from 'node:fs';
import path from 'node:path';
import { rest, ICI_DIR } from './shop.mjs';

const THEME = 190830182728;
const TEST = 'sections/kc-sd-test.liquid';
const FP = 'sections/featured-product.liquid';
const TPL = 'templates/product.json';
const TITRE = `                  </h2>
                {%- when 'price' -%}`;
const SD = "{% render 'kc-structured-data', product: product %}";
const AVIS = `<div class=\\"kc-wrap\\"><h2 class=\\"kc-h\\">Ce qu'en disent les acheteurs`;
const AVIS_ANCRE = `<div class=\\"kc-wrap\\" id=\\"avis\\" style=\\"scroll-margin-top:90px\\"><h2 class=\\"kc-h\\">Ce qu'en disent les acheteurs`;
const sauvegarde = (key) => path.join(ICI_DIR, 'theme', `${path.basename(key).replace(/\.(liquid|json)$/, '')}.avant-etoiles.${key.split('.').pop()}`);

const lire = async (key) => (await rest('GET', `themes/${THEME}/assets.json?asset[key]=${key}`)).asset.value;
const ecrire = async (key, value) => {
  await rest('PUT', `themes/${THEME}/assets.json`, { asset: { key, value } });
  console.log('publié', key);
};
const page = async (url) => (await fetch(`${url}${url.includes('?') ? '&' : '?'}nc=${Date.now()}`)).text();

const verifierAccueil = (html, url) => {
  const badge = /class="kc-rating"[\s\S]*?4,8\/5[\s\S]*?12 avis/.test(html) && html.includes('/products/kapsulcam-4k#avis');
  const blocs = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]));
  const g = blocs.find((x) => x['@type'] === 'ProductGroup');
  const ok = { badge, aggregateRating: g?.aggregateRating?.reviewCount === 12, retour: !!g?.hasVariant?.[0]?.offers?.hasMerchantReturnPolicy };
  console.log(url, '|', JSON.stringify(ok), '|', JSON.stringify(g?.aggregateRating));
  if (!Object.values(ok).every(Boolean)) process.exitCode = 1;
};

if (process.argv.includes('--revenir')) {
  for (const key of [FP, TPL]) await ecrire(key, fs.readFileSync(sauvegarde(key), 'utf8'));
  process.exit(0);
}

for (const f of ['kc-rating.liquid', 'kc-structured-data.liquid']) await ecrire(`snippets/${f}`, fs.readFileSync(path.join(ICI_DIR, 'theme', f), 'utf8'));

if (process.argv.includes('--test')) {
  await ecrire(TEST, `{% assign product = all_products['kapsulcam-4k'] %}{% render 'kc-rating', product: product %}<script type="application/ld+json">{% render 'kc-structured-data', product: product, rating: true %}</script>\n{% schema %}{"name":"KC SD test"}{% endschema %}\n`);
  verifierAccueil(await page('https://kapsulcam.com/?section_id=kc-sd-test'), 'test accueil');
  await rest('DELETE', `themes/${THEME}/assets.json?asset[key]=${TEST}`);
  console.log('section de test retirée');
  process.exit(0);
}

const fp = await lire(FP);
if (fp.includes("render 'kc-rating'")) {
  console.log('déjà en place', FP);
} else {
  if (fp.split(TITRE).length !== 2 || fp.split(SD).length !== 2) throw new Error(`ancre introuvable dans ${FP}`);
  fs.writeFileSync(sauvegarde(FP), fp);
  const neuf = fp
    .replace(TITRE, `                  </h2>
                  {%- unless placeholder -%}{% render 'kc-rating', product: product %}{%- endunless -%}
                {%- when 'price' -%}`)
    .replace(SD, "{% render 'kc-structured-data', product: product, rating: true %}");
  await ecrire(FP, neuf);
  fs.writeFileSync(path.join(ICI_DIR, 'theme', 'featured-product.liquid'), neuf);
}

const tpl = await lire(TPL);
if (tpl.includes('id=\\"avis\\"')) {
  console.log('déjà en place', TPL);
} else {
  if (tpl.split(AVIS).length !== 2) throw new Error(`ancre introuvable dans ${TPL}`);
  fs.writeFileSync(sauvegarde(TPL), tpl);
  await ecrire(TPL, tpl.replace(AVIS, AVIS_ANCRE));
  const local = path.join(ICI_DIR, 'theme', 'product.json');
  const l = fs.readFileSync(local, 'utf8');
  if (l.split(AVIS).length === 2) fs.writeFileSync(local, l.replace(AVIS, AVIS_ANCRE));
}

await new Promise((r) => setTimeout(r, 4000));
verifierAccueil(await page('https://kapsulcam.com/'), 'https://kapsulcam.com/');
console.log('ancre #avis sur la fiche :', (await page('https://kapsulcam.com/products/kapsulcam-4k')).includes('id="avis"'));
