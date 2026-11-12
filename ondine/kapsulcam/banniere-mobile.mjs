/**
 * Compacte la bannière cookies Shopify sur mobile (452 px -> 246 px de haut sur iPhone) :
 * barre pleine largeur en bas, titre masqué, Accepter et Refuser côte à côte et identiques (CNIL).
 * Le texte légal reste celui de Shopify (paramètres automatisés gardés). Ordinateur inchangé.
 *
 * Usage : node banniere-mobile.mjs            (sauvegarde puis publie)
 *         node banniere-mobile.mjs --revenir  (remet la sauvegarde)
 */

import fs from 'node:fs';
import path from 'node:path';
import { rest, ICI_DIR } from './shop.mjs';

const THEME = 190830182728;
const KEY = 'layout/theme.liquid';
const SAUVEGARDE = path.join(ICI_DIR, 'theme', 'theme.avant-banniere.liquid');
const LOCAL = path.join(ICI_DIR, 'theme', 'theme.liquid');
const ANCRE = 'body:has(menu-drawer details[open]) shopify-chat{display:none!important}';
const CSS = '@media (max-width:749px){#shopify-pc__banner{left:0!important;right:0!important;bottom:0!important;top:auto!important;width:100%!important;max-width:none!important;margin:0!important;border-radius:16px 16px 0 0!important;padding:14px 16px calc(12px + env(safe-area-inset-bottom))!important;box-shadow:0 -6px 24px rgba(0,0,0,.12)!important;transform:none!important}#shopify-pc__banner .shopify-pc__banner__wrapper{display:block!important;padding:0!important;margin:0!important}#shopify-pc__banner__body-title{display:none!important}#shopify-pc__banner .shopify-pc__banner__body p{font-size:12.5px!important;line-height:1.4!important}#shopify-pc__banner .shopify-pc__banner__btns{display:flex!important;flex-direction:row!important;flex-wrap:wrap!important;gap:8px!important;margin:10px 0 0!important;padding:0!important;width:100%!important}#shopify-pc__banner .shopify-pc__banner__btns button{margin:0!important;padding:11px 8px!important;font-size:14px!important;border-radius:99px!important;min-width:0!important;width:auto!important}#shopify-pc__banner__btn-accept,#shopify-pc__banner__btn-decline{flex:1 1 0!important;order:1!important}#shopify-pc__banner__btn-manage-prefs{flex:1 1 100%!important;order:2!important;padding:2px!important;font-size:12.5px!important}}';

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
if (enLigne.includes('#shopify-pc__banner{')) {
  console.log('déjà en place');
  process.exit(0);
}
if (enLigne.split(ANCRE).length !== 2) throw new Error('ancre introuvable dans layout/theme.liquid');
fs.writeFileSync(SAUVEGARDE, enLigne);
console.log('sauvegarde', path.relative(ICI_DIR, SAUVEGARDE));
await publier(enLigne.replace(ANCRE, ANCRE + CSS));
