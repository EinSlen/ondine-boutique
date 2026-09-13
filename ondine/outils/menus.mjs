/**
 * Crée les deux menus de la boutique dead2me.
 *
 * En-tête : les deux collections et la page à propos, rien de plus. Un menu court fait
 * cliquer, un menu long fait hésiter.
 * Pied de page : les pages légales. Elles doivent être atteignables depuis n'importe quelle
 * page, c'est une obligation, et une incohérence entre la publicité et la page de destination
 * est une cause de refus documentée chez Meta.
 *
 * Usage : node menus.mjs
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

const URL_API = `https://${env.SHOPIFY_STORE}/admin/api/${env.SHOPIFY_API_VERSION || '2026-07'}/graphql.json`;

const g = async (query, variables = {}) => {
  const r = await fetch(URL_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': env.SHOPIFY_TOKEN },
    body: JSON.stringify({ query, variables }),
  });
  const j = await r.json();
  if (j.errors) throw new Error(`GraphQL : ${JSON.stringify(j.errors).slice(0, 300)}`);
  for (const [k, v] of Object.entries(j.data || {})) {
    const errs = v && v.userErrors;
    if (Array.isArray(errs) && errs.length) {
      throw new Error(`${k} : ${JSON.stringify(errs).slice(0, 300)}`);
    }
  }
  return j.data;
};

const MENUS = [
  {
    handle: 'main-menu',
    title: 'Menu principal',
    items: [
      { title: 'Tirages uniques', type: 'COLLECTION', ref: 'tirages-uniques' },
      { title: 'Série ouverte', type: 'COLLECTION', ref: 'serie-ouverte' },
      { title: 'À propos', type: 'PAGE', ref: 'a-propos' },
    ],
  },
  {
    handle: 'footer',
    title: 'Pied de page',
    items: [
      { title: 'Guide des tailles', type: 'PAGE', ref: 'guide-des-tailles' },
      { title: 'Livraison', type: 'PAGE', ref: 'livraison' },
      { title: 'Retours et remboursements', type: 'PAGE', ref: 'retours' },
      { title: 'Questions fréquentes', type: 'PAGE', ref: 'faq' },
      { title: 'Conditions générales de vente', type: 'PAGE', ref: 'cgv' },
      { title: 'Mentions légales', type: 'PAGE', ref: 'mentions-legales' },
    ],
  },
];

// on ne référence que ce qui existe vraiment, sinon Shopify refuse tout le menu
const existant = await g(`{
  pages(first: 50) { nodes { id handle } }
  collections(first: 50) { nodes { id handle } }
  menus(first: 20) { nodes { id handle title } }
}`);
const pagesOk = new Map(existant.pages.nodes.map((p) => [p.handle, p.id]));
const colsOk = new Map(existant.collections.nodes.map((c) => [c.handle, c.id]));
const menusExistants = new Map(existant.menus.nodes.map((m) => [m.handle, m.id]));

const M_CREATE = `
mutation($title: String!, $handle: String!, $items: [MenuItemCreateInput!]!) {
  menuCreate(title: $title, handle: $handle, items: $items) {
    menu { id handle }
    userErrors { field message }
  }
}`;
const M_UPDATE = `
mutation($id: ID!, $title: String!, $handle: String!, $items: [MenuItemUpdateInput!]!) {
  menuUpdate(id: $id, title: $title, handle: $handle, items: $items) {
    menu { id handle }
    userErrors { field message }
  }
}`;

for (const menu of MENUS) {
  const items = [];
  const ignores = [];
  for (const it of menu.items) {
    // l'API veut l'identifiant de la ressource, une URL seule ne suffit pas
    const gid = it.type === 'PAGE' ? pagesOk.get(it.ref) : colsOk.get(it.ref);
    if (!gid) {
      ignores.push(it.ref);
      continue;
    }
    items.push({ title: it.title, type: it.type, resourceId: gid });
  }

  const id = menusExistants.get(menu.handle);
  if (id) {
    await g(M_UPDATE, { id, title: menu.title, handle: menu.handle, items });
    console.log(`MAJ  ${menu.handle.padEnd(11)} ${items.length} liens`);
  } else {
    await g(M_CREATE, { title: menu.title, handle: menu.handle, items });
    console.log(`CREE ${menu.handle.padEnd(11)} ${items.length} liens`);
  }
  if (ignores.length) {
    console.log(`     ignorés car pas encore publiés : ${ignores.join(', ')}`);
  }
}

console.log('\nLes CGV et les mentions légales apparaîtront dans le pied de page dès que le');
console.log('SIRET sera renseigné et provision.mjs relancé.');
