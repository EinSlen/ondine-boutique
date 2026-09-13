/**
 * Configure le thème de la boutique dead2me : palette, typographie, réglages.
 * Reproduit le parti pris de live2die, mesuré sur leur page d'accueil : thème Dawn en
 * blanc et noir strict, aucune couleur d'accent. Ce sont les visuels produit qui portent
 * l'ambiance, pas le thème, et c'est ce qui rend le rendu tenable sans directeur artistique.
 *
 * Usage :
 *   node theme.mjs --list            liste les thèmes
 *   node theme.mjs --id 1885...      configure ce thème
 *   node theme.mjs --id 1885... --publish   configure puis publie
 */

import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { BRAND } from './content.mjs';

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

const arg = (n) => {
  const i = process.argv.indexOf(`--${n}`);
  return i > -1 ? process.argv[i + 1] : null;
};

const api = async (chemin, options = {}) => {
  const r = await fetch(BASE + chemin, { headers: H, ...options });
  const txt = await r.text();
  let j;
  try {
    j = JSON.parse(txt);
  } catch {
    j = { brut: txt.slice(0, 200) };
  }
  if (!r.ok) throw new Error(`HTTP ${r.status} sur ${chemin} : ${JSON.stringify(j).slice(0, 300)}`);
  return j;
};

if (process.argv.includes('--list')) {
  const { themes } = await api('/themes.json');
  for (const t of themes) console.log(`  ${t.role.padEnd(11)} id ${t.id}  ${t.name}`);
  process.exit(0);
}

const ID = arg('id');
if (!ID) {
  console.error('Il manque --id. Lance node theme.mjs --list pour voir les identifiants.');
  process.exit(1);
}

// 1. lecture des réglages actuels
const asset = await api(`/themes/${ID}/assets.json?asset[key]=config/settings_data.json`);
const reglages = JSON.parse(asset.asset.value);

// Sur un thème fraîchement importé, `current` est le NOM d'un preset et les réglages sont
// dans presets[nom]. Sur un thème déjà personnalisé, `current` est directement l'objet.
// On écrit dans l'objet, quel que soit le cas, et on bascule current en objet pour que la
// personnalisation soit prise en compte plutôt que le preset d'origine.
const depuisPreset = typeof reglages.current === 'string';
const cur = depuisPreset
  ? JSON.parse(JSON.stringify(reglages.presets[reglages.current]))
  : reglages.current;

// 2. palette blanc et noir, mesurée sur live2die
// schema 1 = fond blanc texte noir, schema 2 = l'inverse, pour les sections sombres
const NOIR = '#000000';
const BLANC = '#ffffff';
const GRIS = '#f5f4f0';

const applique = (schema, fond, texte, bouton, texteBouton) => {
  if (!cur.color_schemes || !cur.color_schemes[schema]) return false;
  const s = cur.color_schemes[schema].settings;
  s.background = fond;
  s.background_gradient = '';
  s.text = texte;
  s.button = bouton;
  s.button_label = texteBouton;
  s.secondary_button_label = texte;
  s.shadow = texte;
  return true;
};

// Les trois premiers schemas portent les cas utiles, mais Dawn en livre cinq et les deux
// derniers gardaient les defauts d'origine. C'est de la que venait le bleu 51,79,180 encore
// present dans la feuille de style de la boutique en ligne : une section posee sur scheme-4
// ou scheme-5 ramenait une couleur qui n'existe nulle part chez live2die. Tout schema non
// traite retombe donc sur blanc et noir.
// Correction sur mesure : la vitrine de live2die est NOIRE, pas blanche. Le reglage d'origine
// partait de l'inverse. Capture a l'appui, fond noir et texte blanc partout, le vetement
// photographie a plat ressort dessus et c'est tout le parti pris. Le schema 1 est donc le
// noir, puisque c'est lui que Dawn pose par defaut sur le corps de page.
const PLAN = {
  'scheme-1': [NOIR, BLANC, BLANC, NOIR, 'noir, texte blanc (defaut du site)'],
  'scheme-2': [NOIR, BLANC, BLANC, NOIR, 'noir'],
  'scheme-3': [BLANC, NOIR, NOIR, BLANC, 'blanc, pour une section claire ponctuelle'],
  'scheme-4': [GRIS, NOIR, NOIR, BLANC, 'creme'],
};
const faits = [];
for (const nom of Object.keys(cur.color_schemes || {})) {
  const [fond, texte, bouton, texteBouton, note] = PLAN[nom] || [BLANC, NOIR, NOIR, BLANC, 'aligne sur blanc et noir'];
  if (applique(nom, fond, texte, bouton, texteBouton)) faits.push(`${nom} ${note}`);
}

// 3. typographie: chasse fixe partout. Mesure sur live2die, qui charge Space Mono en corps et
// Roboto Mono en titres. C'est ce qui fait la moitie de leur allure brute, et c'est le
// reglage le moins cher a reprendre : Assistant, le defaut de Dawn, lit comme un thème neuf.
cur.type_header_font = 'roboto_mono_n4';
cur.type_body_font = 'space_mono_n4';
cur.heading_scale = 100;
cur.body_scale = 100;

// 4. formes et bordures: aucune, le minimal strict
cur.buttons_radius = 0;
cur.buttons_border_thickness = 1;
cur.inputs_radius = 0;
cur.card_corner_radius = 0;
cur.card_border_thickness = 0;
cur.card_shadow_opacity = 0;
cur.media_radius = 0;
cur.media_border_thickness = 0;
cur.media_shadow_opacity = 0;
cur.badge_corner_radius = 0;

// 5. panier et marque
cur.cart_type = 'drawer';
cur.show_vendor = false;
cur.currency_code_enabled = false;
cur.social_tiktok_link = 'https://www.tiktok.com/@dead2mewear';

reglages.current = cur;

// 6. écriture
console.log(depuisPreset ? '  reglages issus du preset Default, bascules en personnalises' : '  reglages personnalises mis a jour');
await api(`/themes/${ID}/assets.json`, {
  method: 'PUT',
  body: JSON.stringify({
    asset: { key: 'config/settings_data.json', value: JSON.stringify(reglages, null, 2) },
  }),
});

console.log(`thème ${ID} configuré pour ${BRAND.displayName}`);
for (const f of faits) console.log(`  ${f}`);
console.log('  typographie Assistant, angles droits, ombres coupées, panier en tiroir');

if (process.argv.includes('--publish')) {
  await api(`/themes/${ID}.json`, {
    method: 'PUT',
    body: JSON.stringify({ theme: { id: Number(ID), role: 'main' } }),
  });
  console.log(`thème ${ID} PUBLIÉ, c'est maintenant la boutique en ligne`);
} else {
  console.log('\nNon publié. Relance avec --publish quand le rendu te convient.');
}
