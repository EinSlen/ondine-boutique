/**
 * Synchronise un thème Shopify avec un dossier local, dans les deux sens.
 * Sert à travailler les fichiers du thème comme du code, au lieu de passer par
 * l'éditeur en ligne : on tire une fois, on modifie, on renvoie fichier par fichier.
 *
 * Usage :
 *   node theme-fs.mjs --list
 *   node theme-fs.mjs --pull --id 188582592840 --dir ../theme
 *   node theme-fs.mjs --push --id 188582592840 --dir ../theme [chemins...]
 *   node theme-fs.mjs --cat --id 188582592840 sections/header.liquid
 */

import { readFileSync, existsSync, mkdirSync, writeFileSync, readdirSync, statSync } from 'node:fs';
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

const BASE = `https://${env.SHOPIFY_STORE}/admin/api/${env.SHOPIFY_API_VERSION || '2026-07'}`;
const H = { 'X-Shopify-Access-Token': env.SHOPIFY_TOKEN, 'Content-Type': 'application/json' };

const arg = (n) => {
  const i = process.argv.indexOf(`--${n}`);
  return i > -1 ? process.argv[i + 1] : null;
};

const api = async (chemin, options = {}) => {
  for (let essai = 0; essai < 5; essai++) {
    const r = await fetch(BASE + chemin, { headers: H, ...options });
    if (r.status === 429) {
      await new Promise((ok) => setTimeout(ok, 1500 * (essai + 1)));
      continue;
    }
    const txt = await r.text();
    if (!r.ok) throw new Error(`HTTP ${r.status} sur ${chemin} : ${txt.slice(0, 300)}`);
    return txt ? JSON.parse(txt) : {};
  }
  throw new Error(`Trop de 429 sur ${chemin}`);
};

const TEXTE = /\.(liquid|json|js|css|scss|svg|txt|md)$/i;

if (process.argv.includes('--list')) {
  const { themes } = await api('/themes.json');
  for (const t of themes) console.log(`  ${t.role.padEnd(11)} id ${t.id}  ${t.name}`);
  process.exit(0);
}

const ID = arg('id');
if (!ID) {
  console.error('Il manque --id.');
  process.exit(1);
}

if (process.argv.includes('--cat')) {
  const cle = process.argv[process.argv.length - 1];
  const j = await api(`/themes/${ID}/assets.json?asset[key]=${encodeURIComponent(cle)}`);
  console.log(j.asset.value ?? `(binaire : ${j.asset.public_url})`);
  process.exit(0);
}

const DIR = path.resolve(HERE, arg('dir') || '../theme');

if (process.argv.includes('--pull')) {
  const { assets } = await api(`/themes/${ID}/assets.json`);
  let n = 0;
  for (const a of assets) {
    if (!TEXTE.test(a.key)) continue;
    const j = await api(`/themes/${ID}/assets.json?asset[key]=${encodeURIComponent(a.key)}`);
    if (typeof j.asset.value !== 'string') continue;
    const dest = path.join(DIR, a.key);
    mkdirSync(path.dirname(dest), { recursive: true });
    writeFileSync(dest, j.asset.value, 'utf8');
    n++;
    if (n % 50 === 0) console.log(`  ${n} fichiers`);
  }
  console.log(`Tiré ${n} fichiers dans ${DIR}`);
  process.exit(0);
}

if (process.argv.includes('--push')) {
  const explicites = process.argv.slice(2).filter((a) => TEXTE.test(a) && !a.startsWith('--'));
  const cles = explicites.length
    ? explicites
    : (function marche(base, prefixe = '') {
        const out = [];
        for (const e of readdirSync(base)) {
          const p = path.join(base, e);
          const rel = prefixe ? `${prefixe}/${e}` : e;
          if (statSync(p).isDirectory()) out.push(...marche(p, rel));
          else if (TEXTE.test(e)) out.push(rel);
        }
        return out;
      })(DIR);

  for (const cle of cles) {
    const src = path.join(DIR, cle);
    if (!existsSync(src)) {
      console.error(`  absent en local : ${cle}`);
      continue;
    }
    await api(`/themes/${ID}/assets.json`, {
      method: 'PUT',
      body: JSON.stringify({ asset: { key: cle, value: readFileSync(src, 'utf8') } }),
    });
    console.log(`  poussé ${cle}`);
  }
  process.exit(0);
}

console.error('Choisis --list, --pull, --push ou --cat.');
process.exit(1);
