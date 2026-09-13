/**
 * Provisionne la boutique Shopify de jamaisdeux via l'Admin GraphQL API.
 * Idempotent : relançable autant de fois qu'on veut, il met à jour au lieu de dupliquer.
 *
 * Prérequis : un fichier .env à côté de ce script
 *   SHOPIFY_STORE=jamaisdeux.myshopify.com
 *   SHOPIFY_TOKEN=shpat_xxxxxxxx
 *   SHOPIFY_API_VERSION=2026-01        (optionnel)
 *
 * Scopes nécessaires sur l'app custom :
 *   write_products, write_content, write_publications, read_orders
 *
 * Usage :
 *   node provision.mjs --dry     montre ce qui serait fait, n'écrit rien
 *   node provision.mjs           applique
 */

import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { CATALOGUE, COLLECTIONS, PAGES, BRAND } from "./content.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DRY = process.argv.includes("--dry");

// ---------------------------------------------------------------- env
function loadEnv() {
  const f = path.join(HERE, ".env");
  if (!existsSync(f)) return {};
  const out = {};
  for (const line of readFileSync(f, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return out;
}
const env = { ...loadEnv(), ...process.env };
const STORE = env.SHOPIFY_STORE;
const TOKEN = env.SHOPIFY_TOKEN;
const VERSION = env.SHOPIFY_API_VERSION || "2026-01";

if (!DRY && (!STORE || !TOKEN)) {
  console.error(`Il manque SHOPIFY_STORE et/ou SHOPIFY_TOKEN.

Crée ${path.join(HERE, ".env")} avec :
  SHOPIFY_STORE=tonnom.myshopify.com
  SHOPIFY_TOKEN=shpat_...

Le token s'obtient dans Shopify : Paramètres > Applications et canaux de vente >
Développer des applications > Créer une application > Configuration Admin API >
cocher write_products, write_content, write_publications, read_orders >
Installer > Révéler le token.

Ne colle jamais ce token dans un chat ni dans git, le .gitignore est déjà en place.`);
  process.exit(1);
}

// ---------------------------------------------------------------- graphql
let calls = 0;
async function gql(query, variables = {}) {
  calls++;
  const res = await fetch(`https://${STORE}/admin/api/${VERSION}/graphql.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": TOKEN },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} ${res.statusText} :: ${(await res.text()).slice(0, 400)}`);
  }
  const json = await res.json();
  if (json.errors) throw new Error(`GraphQL: ${JSON.stringify(json.errors).slice(0, 500)}`);
  for (const [k, v] of Object.entries(json.data || {})) {
    const errs = v && (v.userErrors || v.errors);
    if (Array.isArray(errs) && errs.length) throw new Error(`${k} userErrors: ${JSON.stringify(errs)}`);
  }
  return json.data;
}

// ---------------------------------------------------------------- requêtes
const Q_PRODUCT_BY_HANDLE = `
query($handle: String!) {
  productByIdentifier(identifier: {handle: $handle}) {
    id handle title
    variants(first: 20) { nodes { id title sku price } }
  }
}`;

const M_PRODUCT_SET = `
mutation($input: ProductSetInput!) {
  productSet(synchronous: true, input: $input) {
    product { id handle title variants(first: 20) { nodes { id title sku price } } }
    userErrors { field message }
  }
}`;

const Q_COLLECTIONS = `query { collections(first: 50) { nodes { id handle title } } }`;
const M_COLLECTION_CREATE = `
mutation($input: CollectionInput!) {
  collectionCreate(input: $input) { collection { id handle } userErrors { field message } }
}`;
const M_COLLECTION_UPDATE = `
mutation($input: CollectionInput!) {
  collectionUpdate(input: $input) { collection { id handle } userErrors { field message } }
}`;

const Q_PAGES = `query { pages(first: 50) { nodes { id handle title } } }`;
const M_PAGE_CREATE = `
mutation($page: PageCreateInput!) {
  pageCreate(page: $page) { page { id handle } userErrors { field message } }
}`;
const M_PAGE_UPDATE = `
mutation($id: ID!, $page: PageUpdateInput!) {
  pageUpdate(id: $id, page: $page) { page { id handle } userErrors { field message } }
}`;

// ---------------------------------------------------------------- produits
/**
 * Une pièce de série ouverte a un stock illimité : le print-on-demand fabrique à la demande,
 * donc inventoryPolicy CONTINUE et aucun suivi de stock.
 *
 * Un tirage unique existe en UNE taille et à UN exemplaire. C'est la seule façon de rendre la
 * rareté vraie dans Shopify, qui compte le stock par variante et pas par produit. Une pièce
 * unique déclinée en sept tailles ne serait pas unique.
 */
function productInput(p) {
  const unique = p.serie === "unique";
  const tags = [...p.tags, unique ? "tirage unique" : "serie ouverte"];
  if (unique) tags.push("exclu-flux-catalogue");

  return {
    handle: p.handle,
    title: unique ? `${p.title}, ${p.tailles[0]}` : p.title,
    descriptionHtml: `<p><strong>${p.resume}</strong></p>${p.corps}`.trim(),
    vendor: BRAND.displayName,
    productType: p.type,
    tags,
    status: "DRAFT", // publié à la main après relecture, jamais en direct
    productOptions: [
      { name: "Taille", values: p.tailles.map((t) => ({ name: t })) },
    ],
    variants: p.tailles.map((t) => ({
      optionValues: [{ optionName: "Taille", name: t }],
      price: p.prix,
      sku: `${p.sku}-${t}`,
      inventoryPolicy: unique ? "DENY" : "CONTINUE",
      inventoryItem: { tracked: unique },
    })),
  };
}

function collectionInput(c) {
  return {
    handle: c.handle,
    title: c.title,
    descriptionHtml: c.description.trim(),
    ruleSet: {
      appliedDisjunctively: false,
      rules: [
        {
          column: "TAG",
          relation: "EQUALS",
          condition: c.rule === "unique" ? "tirage unique" : "serie ouverte",
        },
      ],
    },
  };
}

// ---------------------------------------------------------------- pages
/**
 * Le guide des tailles est généré depuis les vraies données Printful par
 * mesures/tailles.mjs. On l'injecte ici pour ne pas maintenir deux versions du tableau.
 */
function pagesResolues() {
  const f = path.join(HERE, "..", "mesures", "tailles.html");
  const tableaux = existsSync(f) ? readFileSync(f, "utf8") : "";
  const out = {};
  for (const [handle, page] of Object.entries(PAGES)) {
    let body = page.body.trim();
    if (body.includes("__TABLEAUX_TAILLES__")) {
      if (!tableaux) {
        throw new Error(
          "mesures/tailles.html est absent. Lance d'abord : node mesures/tailles.mjs",
        );
      }
      body = body.replace("__TABLEAUX_TAILLES__", tableaux.trim());
    }
    out[handle] = { title: page.title, body };
  }
  return out;
}

// ---------------------------------------------------------------- run
(async () => {
  console.log(`marque        : ${BRAND.displayName}`);
  console.log(`boutique      : ${STORE || "(dry run)"}`);
  console.log(`api version   : ${VERSION}`);
  console.log(`mode          : ${DRY ? "DRY RUN, aucune ecriture" : "ECRITURE"}\n`);

  const pages = pagesResolues();

  for (const p of CATALOGUE) {
    const unique = p.serie === "unique";
    console.log(
      `  produit     ${p.handle.padEnd(32)} ${p.prix} EUR  ` +
        `${p.tailles.length} taille${p.tailles.length > 1 ? "s" : ""}  ` +
        `${unique ? "TIRAGE UNIQUE, 1 exemplaire" : "serie ouverte, stock illimite"}`,
    );
  }
  for (const c of COLLECTIONS) console.log(`  collection  ${c.handle}`);
  for (const h of Object.keys(pages)) console.log(`  page        ${h}`);

  // Garde-fou page par page, et pas tout ou rien : une page légale incomplète n'est pas
  // publiée, mais elle ne doit pas empêcher de monter le catalogue. Publier des CGV à trous
  // expose à une sanction DGCCRF, retarder la boutique entière pour un SIRET manquant ne
  // protège de rien.
  const trousDe = (p) => [...new Set(p.body.match(/__[A-Z_]+__/g) || [])];
  const pagesPubliables = {};
  const pagesEnAttente = {};
  for (const [handle, page] of Object.entries(pages)) {
    if (trousDe(page).length) pagesEnAttente[handle] = trousDe(page);
    else pagesPubliables[handle] = page;
  }
  const trous = [...new Set(Object.values(pagesEnAttente).flat())];

  if (DRY) {
    console.log(`\nDRY RUN, rien n'a été écrit.`);
    if (trous.length) console.log(`  A REMPLIR dans content.mjs : ${trous.join(", ")}`);
    else console.log(`  aucun placeholder restant, bon pour l'ecriture.`);
    return;
  }

  if (Object.keys(pagesEnAttente).length) {
    console.log(`\n  EN ATTENTE, non publiees tant qu'il manque des informations :`);
    for (const [h, t] of Object.entries(pagesEnAttente)) {
      console.log(`    ${h.padEnd(20)} manque ${t.join(", ")}`);
    }
    console.log(`  Le catalogue et les autres pages sont publiés quand même.`);
  }

  console.log("\n--- produits ---");
  for (const p of CATALOGUE) {
    const input = productInput(p);
    const found = await gql(Q_PRODUCT_BY_HANDLE, { handle: input.handle });
    if (found.productByIdentifier) input.id = found.productByIdentifier.id;
    const r = await gql(M_PRODUCT_SET, { input });
    const prod = r.productSet.product;
    console.log(
      `  ${found.productByIdentifier ? "MAJ " : "CREE"} ${prod.handle.padEnd(32)} ` +
        `${prod.variants.nodes.length} variantes a ${prod.variants.nodes[0]?.price} EUR`,
    );
  }

  console.log("\n--- collections ---");
  const colsExistantes = new Map(
    (await gql(Q_COLLECTIONS)).collections.nodes.map((c) => [c.handle, c.id]),
  );
  for (const c of COLLECTIONS) {
    const input = collectionInput(c);
    const id = colsExistantes.get(c.handle);
    if (id) {
      await gql(M_COLLECTION_UPDATE, { input: { ...input, id } });
      console.log(`  MAJ  ${c.handle}`);
    } else {
      await gql(M_COLLECTION_CREATE, { input });
      console.log(`  CREE ${c.handle}`);
    }
  }

  console.log("\n--- pages ---");
  const pagesExistantes = new Map((await gql(Q_PAGES)).pages.nodes.map((p) => [p.handle, p.id]));
  for (const [handle, page] of Object.entries(pagesPubliables)) {
    const body = { title: page.title, handle, body: page.body };
    const id = pagesExistantes.get(handle);
    if (id) {
      await gql(M_PAGE_UPDATE, { id, page: body });
      console.log(`  MAJ  ${handle}`);
    } else {
      await gql(M_PAGE_CREATE, { page: body });
      console.log(`  CREE ${handle}`);
    }
  }

  console.log(`\nTermine. ${calls} appels API.`);
  console.log(`\nLes produits sont en BROUILLON. Relis-les dans l'admin, puis publie a la main.`);
  console.log(`\nCe qui reste au clic, parce que l'API ne le couvre pas proprement :`);
  console.log(`  1. Installer l'application Printful et relier chaque SKU a sa base`);
  console.log(`  2. Menu de pied de page : ajouter cgv, mentions-legales, retours, livraison`);
  console.log(`  3. Shopify Payments : activer, demande le SIRET`);
  console.log(`  4. Bandeau de consentement cookies`);
  console.log(`  5. Frais de port : 4,90 EUR France, offerts a partir de 90 EUR, 7,90 EUR UE`);
  console.log(`  6. Exclure la collection tirages-uniques des flux Meta et Google`);
})().catch((e) => {
  console.error(`\nECHEC : ${e.message}`);
  process.exit(1);
});
