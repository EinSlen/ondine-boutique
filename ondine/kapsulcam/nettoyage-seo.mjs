// Unpublishes leftover dead2me/VELNUIT pages, collections and old blog articles (nothing deleted).
// node nettoyage-seo.mjs [--revenir]
import fs from 'node:fs';
import path from 'node:path';
import { gql, ICI_DIR } from './shop.mjs';

const GARDER = ['livraison-et-retours', 'nous-contacter', 'mentions-legales', 'conditions-de-vente'];
const f = path.join(ICI_DIR, 'etat-seo-avant.json');
const revenir = process.argv.includes('--revenir');
const pubs = (await gql(`{ publications(first: 20) { nodes { id name } } }`)).publications.nodes.filter((p) => /Online Store|Shop/.test(p.name));

if (revenir) {
  const e = JSON.parse(fs.readFileSync(f, 'utf8'));
  for (const p of e.pages) await gql(`mutation($id: ID!) { pageUpdate(id: $id, page: { isPublished: true }) { userErrors { message } } }`, { id: p.id });
  for (const c of e.collections) await gql(`mutation($id: ID!, $i: [PublicationInput!]!) { publishablePublish(id: $id, input: $i) { userErrors { message } } }`, { id: c.id, i: pubs.map((p) => ({ publicationId: p.id })) });
  for (const a of e.articles) await gql(`mutation($id: ID!) { articleUpdate(id: $id, article: { isPublished: true }) { userErrors { message } } }`, { id: a.id });
  console.log('restauré');
  process.exit(0);
}

const d = await gql(`{ pages(first: 100) { nodes { id handle title isPublished } } collections(first: 100) { nodes { id handle title } } articles(first: 100) { nodes { id handle title isPublished blog { handle } } } }`);
const pages = d.pages.nodes.filter((p) => p.isPublished && !GARDER.includes(p.handle));
const collections = d.collections.nodes;
const articles = d.articles.nodes.filter((a) => a.isPublished && a.blog.handle !== 'journal');
fs.writeFileSync(f, JSON.stringify({ date: new Date().toISOString(), pages, collections, articles }, null, 1));
for (const p of pages) {
  const r = await gql(`mutation($id: ID!) { pageUpdate(id: $id, page: { isPublished: false }) { userErrors { message } } }`, { id: p.id });
  console.log('page dépubliée', p.handle, JSON.stringify(r.pageUpdate.userErrors));
}
for (const c of collections) {
  const r = await gql(`mutation($id: ID!, $i: [PublicationInput!]!) { publishableUnpublish(id: $id, input: $i) { userErrors { message } } }`, { id: c.id, i: pubs.map((p) => ({ publicationId: p.id })) });
  console.log('collection dépubliée', c.handle, JSON.stringify(r.publishableUnpublish.userErrors));
}
for (const a of articles) {
  const r = await gql(`mutation($id: ID!) { articleUpdate(id: $id, article: { isPublished: false }) { userErrors { message } } }`, { id: a.id });
  console.log('article dépublié', a.handle, JSON.stringify(r.articleUpdate.userErrors));
}
