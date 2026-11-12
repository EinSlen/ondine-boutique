/**
 * Menu burger mobile : masque le bouton Chat et la barre d'achat collante tant que le menu est ouvert.
 * L'ancienne règle visait menu-drawer, or le menu de l'en-tête Dawn est header-drawer : elle ne s'appliquait jamais.
 *
 * Usage : node menu-mobile.mjs            (sauvegarde puis publie)
 *         node menu-mobile.mjs --revenir  (remet la sauvegarde)
 */

import fs from 'node:fs';
import path from 'node:path';
import { rest, ICI_DIR } from './shop.mjs';

const THEME = 190830182728;
const KEY = 'layout/theme.liquid';
const SAUVEGARDE = path.join(ICI_DIR, 'theme', 'theme.avant-menu.liquid');
const LOCAL = path.join(ICI_DIR, 'theme', 'theme.liquid');
const AVANT = 'body:has(menu-drawer details[open]) shopify-chat';
const APRES = 'body:has(header-drawer details[open]) shopify-chat,body:has(header-drawer details[open]) .kc-sticky';

const publier = async (value) => {
  const r = await rest('PUT', `themes/${THEME}/assets.json`, { asset: { key: KEY, value } });
  fs.writeFileSync(LOCAL, value);
  console.log('publié', r.asset.updated_at);
};

if (process.argv.includes('--revenir')) {
  await publier(fs.readFileSync(SAUVEGARDE, 'utf8'));
  process.exit(0);
}

const enLigne = (await rest('GET', `themes/${THEME}/assets.json?asset[key]=${KEY}`)).asset.value;
if (enLigne.includes(APRES)) {
  console.log('déjà en place');
  process.exit(0);
}
if (enLigne.split(AVANT).length !== 2) throw new Error('ancre introuvable dans layout/theme.liquid');
fs.writeFileSync(SAUVEGARDE, enLigne);
console.log('sauvegarde', path.relative(ICI_DIR, SAUVEGARDE));
await publier(enLigne.replace(AVANT, APRES));
