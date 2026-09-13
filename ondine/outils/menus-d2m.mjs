/**
 * Cree les menus propres au thème D2M, sous des identifiants neufs.
 * On ne touche pas à main-menu ni à footer : ils servent le thème actuellement publié,
 * et les modifier changerait la navigation du site en ligne avant l'heure.
 *
 * Usage : node menus-d2m.mjs [--sec]
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
const APPLIQUE = process.argv.includes('--sec');

const gql = async (query, variables = {}) => {
  const r = await fetch(GQL, { method: 'POST', headers: H, body: JSON.stringify({ query, variables }) });
  const j = await r.json();
  if (j.errors) throw new Error(JSON.stringify(j.errors).slice(0, 400));
  return j.data;
};

const MENUS = [
  {
    handle: 'd2m-main',
    title: 'D2M principal',
    items: [
      { title: 'Boutique', type: 'COLLECTION', resourceId: 'still-here' },
      { title: 'NOTHING LASTS', type: 'COLLECTION', resourceId: 'still-here' },
      { title: 'À propos', type: 'PAGE', resourceId: 'a-propos' },
      { title: 'Contact', type: 'PAGE', resourceId: 'contact' },
    ],
  },
  {
    handle: 'd2m-shop',
    title: 'D2M boutique',
    items: [
      { title: 'Toutes les pièces', type: 'COLLECTION', resourceId: 'still-here' },
      { title: 'Logo essentials', type: 'COLLECTION', resourceId: 'logo-essentials' },
      { title: 'Graphic pieces', type: 'COLLECTION', resourceId: 'graphic-pieces' },
      { title: 'Bottoms', type: 'COLLECTION', resourceId: 'bottoms' },
    ],
  },
  {
    handle: 'd2m-info',
    title: 'D2M infos',
    items: [
      { title: 'À propos', type: 'PAGE', resourceId: 'a-propos' },
      { title: 'Livraison', type: 'PAGE', resourceId: 'livraison' },
      { title: 'Retours', type: 'PAGE', resourceId: 'retours' },
      { title: 'Guide des tailles', type: 'PAGE', resourceId: 'guide-des-tailles' },
      { title: 'Contact', type: 'PAGE', resourceId: 'contact' },
    ],
  },
  {
    handle: 'd2m-legal',
    title: 'D2M mentions',
    items: [
      { title: 'FAQ', type: 'PAGE', resourceId: 'faq' },
      { title: 'Remboursement', type: 'PAGE', resourceId: 'remboursement' },
      { title: 'Confidentialité', type: 'HTTP', url: '/policies/privacy-policy' },
    ],
  },
];

const data = await gql(`{
  menus(first: 30){ nodes{ id handle } }
  collections(first: 30){ nodes{ id handle } }
  pages(first: 50){ nodes{ id handle } }
}`);
const parHandle = (liste) => Object.fromEntries(liste.map((n) => [n.handle, n.id]));
const cols = parHandle(data.collections.nodes);
const pages = parHandle(data.pages.nodes);
const menus = parHandle(data.menus.nodes);

for (const m of MENUS) {
  const items = m.items.map((i) => {
    if (i.type === 'COLLECTION') return { title: i.title, type: 'COLLECTION', resourceId: cols[i.resourceId] };
    if (i.type === 'PAGE') return { title: i.title, type: 'PAGE', resourceId: pages[i.resourceId] };
    return { title: i.title, type: 'HTTP', url: i.url };
  });
  const manquant = items.filter((i) => i.type !== 'HTTP' && !i.resourceId);
  if (manquant.length) {
    console.log(`  ${m.handle} : cible introuvable pour ${manquant.map((x) => x.title).join(', ')}`);
    continue;
  }
  console.log(`  ${m.handle} : ${items.length} entrées${menus[m.handle] ? ' (mise à jour)' : ''}`);
  if (!APPLIQUE) continue;

  const res = menus[m.handle]
    ? await gql(
        `mutation($id:ID!,$title:String!,$handle:String!,$items:[MenuItemUpdateInput!]!){
           menuUpdate(id:$id,title:$title,handle:$handle,items:$items){ userErrors{ message } } }`,
        { id: menus[m.handle], title: m.title, handle: m.handle, items },
      )
    : await gql(
        `mutation($title:String!,$handle:String!,$items:[MenuItemCreateInput!]!){
           menuCreate(title:$title,handle:$handle,items:$items){ userErrors{ message } } }`,
        { title: m.title, handle: m.handle, items },
      );
  const erreurs = (res.menuCreate || res.menuUpdate).userErrors;
  if (erreurs.length) console.log('    ', JSON.stringify(erreurs));
}
console.log(APPLIQUE ? 'Menus en place.' : 'Simulation. --sec pour appliquer.');
