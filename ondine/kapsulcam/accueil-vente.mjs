/**
 * La page principale devient la page de vente (demande de Valentin, 22/10) : la fiche
 * /products/kapsulcam-4k affiche la même chose que l'accueil (vidéo, zone d'achat featured-product,
 * activités, étapes, comparatif, FAQ) avec en plus les avis (ancre #avis des étoiles de l'accueil).
 * Le produit reste dans Shopify : panier, paiement et Google Shopping en ont besoin.
 * Les 4 onglets de l'ancienne fiche (dont Consignes de sécurité) passent sous le bouton d'achat,
 * sur l'accueil aussi. Lien « Afficher tous les détails » masqué, cartes activités = défilement
 * vers la zone d'achat, onglet « La caméra » retiré du menu kc-main.
 *
 * Usage : node accueil-vente.mjs --test     (templates/product.accueil.json, aperçu ?view=accueil)
 *         node accueil-vente.mjs            (sauvegarde puis publie fiche + accueil + menu)
 *         node accueil-vente.mjs --revenir  (remet fiche, accueil et menu sauvegardés)
 */

import fs from 'node:fs';
import path from 'node:path';
import { rest, gql, ICI_DIR } from './shop.mjs';

const THEME = 190830182728;
const TPL = 'templates/product.json';
const IDX = 'templates/index.json';
const TEST = 'templates/product.accueil.json';
const MENU_SAUVE = path.join(ICI_DIR, 'etat-menu-avant-accueil.json');
const sauvegarde = (key) => path.join(ICI_DIR, 'theme', `${path.basename(key, '.json')}.avant-accueil.json`);

const lire = async (key) => (await rest('GET', `themes/${THEME}/assets.json?asset[key]=${key}`)).asset.value;
const ecrire = async (key, value) => {
  await rest('PUT', `themes/${THEME}/assets.json`, { asset: { key, value } });
  console.log('publié', key);
};
const json = (v) => JSON.parse(v.replace(/^\/\*[\s\S]*?\*\//, ''));
const page = async (url) => (await fetch(`${url}${url.includes('?') ? '&' : '?'}nc=${Date.now()}`)).text();

const menuPrincipal = async () => {
  const m = (await gql(`{ menus(first: 50) { nodes { id handle title items { id title type resourceId url } } } }`)).menus.nodes;
  return m.find((x) => x.handle === 'kc-main');
};
const majMenu = async (menu, items) => {
  const r = await gql(
    `mutation($id: ID!, $t: String!, $h: String!, $i: [MenuItemUpdateInput!]!) { menuUpdate(id: $id, title: $t, handle: $h, items: $i) { menu { items { title } } userErrors { message } } }`,
    { id: menu.id, t: menu.title, h: menu.handle, i: items.map(({ title, type, resourceId, url }) => ({ title, type, ...(resourceId ? { resourceId } : { url }) })) },
  );
  console.log('menu kc-main', JSON.stringify(r.menuUpdate));
};

if (process.argv.includes('--revenir')) {
  for (const key of [TPL, IDX]) await ecrire(key, fs.readFileSync(sauvegarde(key), 'utf8'));
  await majMenu(await menuPrincipal(), JSON.parse(fs.readFileSync(MENU_SAUVE, 'utf8')).items);
  process.exit(0);
}

const onglets = (tabs) => tabs.map((t) => `<div class="product__accordion accordion"><details id="Details-${t.id}-{{ section.id }}"><summary><div class="summary__title">{% render 'icon-accordion', icon: '${t.icon}' %}<h2 class="h4 accordion__title inline-richtext">${t.heading}</h2></div>{{- 'icon-caret.svg' | inline_asset_content -}}</summary><div class="accordion__content rte">${t.content}</div></details></div>`).join('');
const STYLE = `<style>#shopify-section-{{ section.id }} .product__view-details{display:none}@media screen and (min-width:750px){#shopify-section-{{ section.id }} .product.grid{align-items:flex-start}#shopify-section-{{ section.id }} .product__media-wrapper{position:sticky;top:96px;align-self:flex-start;z-index:1}}</style>`;
const DEFILER = `<script>document.querySelectorAll('.kc-mo-c').forEach((a) => a.addEventListener('click', (e) => { const t = document.querySelector('[id^="shopify-section-"][id$="__produit"]'); if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth' }); } }));</script>`;

const fiche = json(await lire(TPL));
const accueil = json(await lire(IDX));
const tabs = fiche.sections.main?.block_order
  ?.filter((k) => fiche.sections.main.blocks[k].type === 'collapsible_tab')
  .map((k) => ({ id: k, ...fiche.sections.main.blocks[k].settings }));
if (!tabs?.length) throw new Error('templates/product.json ne contient plus la section main avec ses onglets : déjà appliqué ?');

const versAccueil = (t) => {
  const p = t.sections.produit;
  p.blocks.details = { type: 'custom_liquid', settings: { custom_liquid: STYLE + onglets(tabs) } };
  p.block_order = [...p.block_order.filter((k) => k !== 'details'), 'details'];
  t.sections.activites.settings.custom_liquid = `{% render 'kc-activites' %}${DEFILER}`;
  return t;
};
const nouvelAccueil = versAccueil(structuredClone(accueil));
const nouvelleFiche = structuredClone(nouvelAccueil);
nouvelleFiche.sections.avisNote = fiche.sections.avisNote;
nouvelleFiche.sections.avis = fiche.sections.avis;
nouvelleFiche.order = nouvelAccueil.order.flatMap((k) => (k === 'faq' ? ['avisNote', 'avis', 'faq'] : [k]));

const verifierFiche = async (vue) => {
  const produit = await (await fetch('https://kapsulcam.com/products/kapsulcam-4k.js')).json();
  for (const v of produit.variants) {
    const html = await page(`https://kapsulcam.com/products/kapsulcam-4k?variant=${v.id}${vue}`);
    const sec = html.slice(html.indexOf('__produit'));
    const id = sec.match(/name="id" value="(\d+)"/)?.[1];
    const prix = sec.match(/class="price-item price-item--(?:sale|regular)[^"]*">\s*([\d,]+)/)?.[1];
    const ld = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].length;
    const ok = { hero: html.includes('data-kc-go'), id: id === String(v.id), prix: prix === (v.price / 100).toFixed(2).replace('.', ','), securite: html.includes('Consignes de sécurité'), avis: html.includes('id="avis"'), main: !html.includes('__main') };
    console.log(v.title.padEnd(32), id, prix, 'ld+json', ld, JSON.stringify(ok));
    if (!Object.values(ok).every(Boolean)) process.exitCode = 1;
  }
};

if (process.argv.includes('--test')) {
  await ecrire(TEST, JSON.stringify(nouvelleFiche, null, 2));
  await new Promise((r) => setTimeout(r, 3000));
  await verifierFiche('&view=accueil');
  process.exit(0);
}

for (const [key, t] of [[TPL, fiche], [IDX, accueil]]) fs.writeFileSync(sauvegarde(key), JSON.stringify(t, null, 2));
const menu = await menuPrincipal();
fs.writeFileSync(MENU_SAUVE, JSON.stringify(menu, null, 2));
fs.writeFileSync(path.join(ICI_DIR, 'theme', 'product.json'), JSON.stringify(nouvelleFiche, null, 2));
fs.writeFileSync(path.join(ICI_DIR, 'theme', 'index.json'), JSON.stringify(nouvelAccueil, null, 2));
await ecrire(TPL, JSON.stringify(nouvelleFiche, null, 2));
await ecrire(IDX, JSON.stringify(nouvelAccueil, null, 2));
await majMenu(menu, menu.items.filter((i) => i.title !== 'La caméra'));
await rest('DELETE', `themes/${THEME}/assets.json?asset[key]=${TEST}`).catch(() => {});
await new Promise((r) => setTimeout(r, 3000));
await verifierFiche('');
const acc = await page('https://kapsulcam.com/');
console.log('accueil', JSON.stringify({ securite: acc.includes('Consignes de sécurité'), menuSansCamera: !acc.includes('HeaderMenu-la-camera'), sansDetails: acc.includes('.product__view-details{display:none}') }));
