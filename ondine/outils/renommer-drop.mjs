/**
 * Aligne le catalogue sur le nom du drop : la collection principale et l'entrée de menu
 * qui s'appelaient « still here » et « drop 001 » portent désormais le nom de la marque.
 * Un seul nom partout, sinon la vitrine en annonce deux et aucun ne s'imprime.
 *
 * Usage : node renommer-drop.mjs [--sec]
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

const BASE = `https://${env.SHOPIFY_STORE}/admin/api/${env.SHOPIFY_API_VERSION || '2026-07'}`;
const H = { 'X-Shopify-Access-Token': env.SHOPIFY_TOKEN, 'Content-Type': 'application/json' };
const APPLIQUE = process.argv.includes('--sec');

const api = async (chemin, options = {}) => {
  const r = await fetch(BASE + chemin, { headers: H, ...options });
  const txt = await r.text();
  if (!r.ok) throw new Error(`HTTP ${r.status} sur ${chemin} : ${txt.slice(0, 250)}`);
  return txt ? JSON.parse(txt) : {};
};
const gql = async (query, variables = {}) => {
  const r = await fetch(`${BASE}/graphql.json`, { method: 'POST', headers: H, body: JSON.stringify({ query, variables }) });
  const j = await r.json();
  if (j.errors) throw new Error(JSON.stringify(j.errors).slice(0, 300));
  return j.data;
};

const NOM = 'NOTHING LASTS';

const { custom_collections } = await api('/custom_collections.json?handle=still-here');
const col = custom_collections[0];
if (col) {
  console.log(`collection ${col.handle} : « ${col.title} » -> « ${NOM} »`);
  if (APPLIQUE) {
    await api(`/custom_collections/${col.id}.json`, {
      method: 'PUT',
      body: JSON.stringify({ custom_collection: { id: col.id, title: NOM } }),
    });
  }
}

const { menus } = await gql(`{ menus(first:20){ nodes{ id handle title items{ title url type resourceId } } } }`);
const principal = menus.nodes.find((m) => m.handle === 'd2m-main');
if (principal) {
  const items = principal.items.map((i) => ({
    title: i.title === 'Drop 001' ? NOM : i.title,
    type: i.type,
    ...(i.resourceId ? { resourceId: i.resourceId } : { url: i.url }),
  }));
  console.log('menu :', items.map((i) => i.title).join(' / '));
  if (APPLIQUE) {
    const res = await gql(
      `mutation($id:ID!,$title:String!,$handle:String!,$items:[MenuItemUpdateInput!]!){
         menuUpdate(id:$id,title:$title,handle:$handle,items:$items){ userErrors{ message } } }`,
      { id: principal.id, title: principal.title, handle: principal.handle, items },
    );
    if (res.menuUpdate.userErrors.length) console.log(JSON.stringify(res.menuUpdate.userErrors));
  }
}

const { menus: m2 } = await gql(`{ menus(first:20){ nodes{ id handle items{ title url type resourceId } } } }`);
const boutique = m2.nodes.find((m) => m.handle === 'd2m-shop');
if (boutique) {
  const items = boutique.items.map((i) => ({
    title: i.title === 'All products' ? NOM : i.title,
    type: i.type,
    ...(i.resourceId ? { resourceId: i.resourceId } : { url: i.url }),
  }));
  console.log('menu boutique :', items.map((i) => i.title).join(' / '));
  if (APPLIQUE) {
    await gql(
      `mutation($id:ID!,$title:String!,$handle:String!,$items:[MenuItemUpdateInput!]!){
         menuUpdate(id:$id,title:$title,handle:$handle,items:$items){ userErrors{ message } } }`,
      { id: boutique.id, title: 'D2M boutique', handle: 'd2m-shop', items },
    );
  }
}
console.log(APPLIQUE ? 'Nom aligne partout.' : 'Simulation. --sec pour appliquer.');
