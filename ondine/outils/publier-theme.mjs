/**
 * Publie le thème D2M, c'est-à-dire le met en ligne à la place du thème actuel.
 *
 * L'ancien thème n'est pas supprimé : il reste dans la liste, en non publié, et une seule
 * commande suffit à revenir dessus. C'est la marche arrière, à garder en tête avant de
 * publier quoi que ce soit sur une boutique ouverte.
 *
 * Usage :
 *   node publier-theme.mjs            montre ce qui serait fait
 *   node publier-theme.mjs --sec      publie
 *   node publier-theme.mjs --revenir  remet le thème précédent en ligne
 */

import { readFileSync, existsSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const MEMO = path.join(HERE, '.theme-precedent.json');
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
const D2M = 188582592840;

const api = async (chemin, options = {}) => {
  const r = await fetch(BASE + chemin, { headers: H, ...options });
  const txt = await r.text();
  if (!r.ok) throw new Error(`HTTP ${r.status} sur ${chemin} : ${txt.slice(0, 200)}`);
  return txt ? JSON.parse(txt) : {};
};

const { themes } = await api('/themes.json');
const enLigne = themes.find((t) => t.role === 'main');
const cible = themes.find((t) => t.id === D2M);

if (!cible) {
  console.error(`Le thème ${D2M} n'existe plus.`);
  process.exit(1);
}

if (process.argv.includes('--revenir')) {
  if (!existsSync(MEMO)) {
    console.error('Aucun thème précédent noté. Choisis-le à la main dans l’admin.');
    process.exit(1);
  }
  const { id, name } = JSON.parse(readFileSync(MEMO, 'utf8'));
  console.log(`Retour à « ${name} » (${id})`);
  await api(`/themes/${id}.json`, { method: 'PUT', body: JSON.stringify({ theme: { id, role: 'main' } }) });
  console.log('Fait.');
} else if (!process.argv.includes('--sec')) {
  console.log(`\nEn ligne aujourd’hui : « ${enLigne?.name} » (${enLigne?.id})`);
  console.log(`Serait publié        : « ${cible.name} » (${cible.id})`);
  console.log('\nRien n’est fait. Relance avec --sec pour publier.\n');
} else {
  if (enLigne) writeFileSync(MEMO, JSON.stringify({ id: enLigne.id, name: enLigne.name }, null, 2), 'utf8');
  console.log(`Publication de « ${cible.name} »...`);
  await api(`/themes/${D2M}.json`, { method: 'PUT', body: JSON.stringify({ theme: { id: D2M, role: 'main' } }) });
  const apres = await api('/themes.json');
  const neuf = apres.themes.find((t) => t.role === 'main');
  console.log(`En ligne : « ${neuf.name} » (${neuf.id})`);
  console.log(`\nPour revenir en arrière : node publier-theme.mjs --revenir\n`);
}
