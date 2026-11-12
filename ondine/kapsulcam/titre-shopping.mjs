// SEO title of the 4K product = Google Shopping title (the Google & YouTube app appends the variant name).
// Uses the terms people actually search in France (Keyword Planner 18/10) instead of "POV".
// node titre-shopping.mjs [--revenir]
import fs from 'node:fs';
import path from 'node:path';
import { gql, ICI_DIR } from './shop.mjs';

const TITRE = "Mini Caméra Sport 4K Embarquée, Caméra d'Action Casque Moto, Vélo, Ski";
const f = path.join(ICI_DIR, 'titre-shopping-avant.json');
const revenir = process.argv.includes('--revenir');
const p = (await gql(`{ productByHandle(handle: "kapsulcam-4k") { id seo { title } } }`)).productByHandle;

if (!revenir && !fs.existsSync(f)) fs.writeFileSync(f, JSON.stringify({ date: new Date().toISOString(), seo: p.seo.title }, null, 1));
const titre = revenir ? JSON.parse(fs.readFileSync(f, 'utf8')).seo : TITRE;
const r = await gql(`mutation($p: ProductUpdateInput!) { productUpdate(product: $p) { product { seo { title } } userErrors { message } } }`, { p: { id: p.id, seo: { title: titre } } });
console.log(JSON.stringify(r.productUpdate));
