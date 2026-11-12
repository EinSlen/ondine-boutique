// Switch the store to KapsulCam: other products to DRAFT, KapsulCam theme published.
// node bascule.mjs --revenir  restores products and previous theme from etat-dead2me-avant.json
import fs from 'node:fs';
import path from 'node:path';
import { gql, rest, ICI_DIR } from './shop.mjs';
const etat = JSON.parse(fs.readFileSync(path.join(ICI_DIR, 'etat-dead2me-avant.json'), 'utf8'));
const revenir = process.argv.includes('--revenir');
const KC_THEME = 190830182728;
for (const p of etat.produitsActifs) {
  const r = await gql(`mutation($p: ProductUpdateInput!) { productUpdate(product: $p) { product { title status } userErrors { message } } }`, { p: { id: p.id, status: revenir ? 'ACTIVE' : 'DRAFT' } });
  console.log(r.productUpdate.product.status, r.productUpdate.product.title);
}
const themeId = revenir ? etat.themePublie.id : KC_THEME;
await rest('PUT', `themes/${themeId}.json`, { theme: { id: themeId, role: 'main' } });
console.log('thème publié', themeId);
