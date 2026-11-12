// node appliquer-seo.mjs [--appliquer] : applies seo.json to the store through Shopify CLI (shopify store execute):
// product titles and descriptions for search engines, image alt texts, collection SEO, page meta descriptions, home page title and description.
// Without --appliquer it only reads the store and prints the plan.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const STORE = 'eg1zs2-j9.myshopify.com';
const APPLY = process.argv.includes('--appliquer');
const SEO = JSON.parse(fs.readFileSync(new URL('./seo.json', import.meta.url), 'utf8'));
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'pc-seo-'));
const env = {
  ...process.env,
  SHOPIFY_CLI_AGENT_INFO: 'n:claude-code|v:none|p:anthropic|m:claude-opus-5-5',
  SHOPIFY_CLI_AGENT_IDS: 's:f1fd56fa-8c0b-4047-8ab0-42e1839c519f'
};

let n = 0;
const run = (query, variables, mutation = false) => {
  const q = path.join(tmp, `q${++n}.graphql`);
  fs.writeFileSync(q, query);
  const args = ['store', 'execute', '--store', STORE, '--query-file', q, '--json', '--no-input'];
  if (variables) {
    const v = path.join(tmp, `v${n}.json`);
    fs.writeFileSync(v, JSON.stringify(variables));
    args.push('--variable-file', v);
  }
  if (mutation) args.push('--allow-mutations');
  const out = execFileSync('shopify', args, { env, encoding: 'utf8', shell: true, stdio: ['ignore', 'pipe', 'pipe'] });
  const json = JSON.parse(out.slice(out.indexOf('{')));
  return json.data || json;
};

const data = run(`query SeoCibles {
  shop { id }
  products(first: 20, query: "handle:lucarne OR handle:boreale OR handle:astro OR handle:lagon OR handle:selene") {
    nodes { id handle seo { title description } media(first: 30) { nodes { id alt mediaContentType } } }
  }
  collections(first: 10, query: "handle:frontpage") { nodes { id handle seo { title description } } }
  pages(first: 30) { nodes { id handle title } }
}`);

const plan = [];
for (const p of data.products.nodes) {
  const want = SEO.produits[p.handle];
  if (!want) continue;
  plan.push({ label: `produit ${p.handle} : titre et description`, query: 'mutation ProduitSeo($product: ProductUpdateInput!) { productUpdate(product: $product) { product { id seo { title description } } userErrors { field message } } }', variables: { product: { id: p.id, seo: { title: want.titre, description: want.description } } } });
  if (want.alts) {
    const images = p.media.nodes.filter((m) => m.mediaContentType === 'IMAGE');
    if (images.length !== want.alts.length) {
      console.log(`ATTENTION ${p.handle} : ${images.length} images en ligne pour ${want.alts.length} textes, textes alternatifs non appliqués`);
    } else {
      plan.push({ label: `produit ${p.handle} : ${images.length} textes alternatifs`, query: 'mutation AltImages($files: [FileUpdateInput!]!) { fileUpdate(files: $files) { files { id alt } userErrors { field message code } } }', variables: { files: images.map((m, i) => ({ id: m.id, alt: want.alts[i] })) } });
    }
  }
}
for (const c of data.collections.nodes) {
  const want = SEO.collections[c.handle];
  if (want) plan.push({ label: `collection ${c.handle}`, query: 'mutation CollectionSeo($input: CollectionInput!) { collectionUpdate(input: $input) { collection { id seo { title description } } userErrors { field message } } }', variables: { input: { id: c.id, seo: { title: want.titre, description: want.description } } } });
}
const metas = [];
for (const pg of data.pages.nodes) {
  if (SEO.pages[pg.handle]) metas.push({ ownerId: pg.id, namespace: 'global', key: 'description_tag', type: 'single_line_text_field', value: SEO.pages[pg.handle] });
}
metas.push(
  { ownerId: data.shop.id, namespace: 'global', key: 'title_tag', type: 'single_line_text_field', value: SEO.accueil.titre },
  { ownerId: data.shop.id, namespace: 'global', key: 'description_tag', type: 'single_line_text_field', value: SEO.accueil.description }
);
plan.push({ label: `${metas.length - 2} pages et la page d'accueil : descriptions`, query: 'mutation MetaSeo($metafields: [MetafieldsSetInput!]!) { metafieldsSet(metafields: $metafields) { metafields { id key owner { __typename } } userErrors { field message code } } }', variables: { metafields: metas } });

const missingPages = Object.keys(SEO.pages).filter((h) => !data.pages.nodes.some((p) => p.handle === h));
if (missingPages.length) console.log('pages introuvables :', missingPages.join(', '));

for (const step of plan) {
  if (!APPLY) { console.log('prévu :', step.label); continue; }
  const res = run(step.query, step.variables, true);
  const payload = Object.values(res)[0] || {};
  const errors = payload.userErrors || [];
  console.log(errors.length ? `ERREUR ${step.label} : ${JSON.stringify(errors)}` : `fait : ${step.label}`);
}
if (!APPLY) console.log('\nRien n\'est modifié. Relancer avec --appliquer.');
