/**
 * Maquettes all-over print : envoie les SIX panneaux d'une pièce à Printful et récupère
 * les photos du vêtement entier, couvert d'un bout à l'autre.
 *
 * Usage :
 *   node maquettes-aop.mjs --lot organique
 *   node maquettes-aop.mjs --lot pub --produit 388
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const env = (() => {
  const out = {};
  for (const l of fs.readFileSync(path.join(HERE, '.env'), 'utf8').split(/\r?\n/)) {
    const m = l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
  return { ...out, ...process.env };
})();

const arg = (n, d) => {
  const i = process.argv.indexOf(`--${n}`);
  return i > -1 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--')
    ? process.argv[i + 1]
    : d;
};
const LOT = arg('lot', 'organique');
// 388 = sweat à capuche all-over print recyclé, tous les emplacements inclus dans le prix
const PRODUIT = parseInt(arg('produit', '388'), 10);
const THEME = arg('theme', '188585640264');
const STORE_PF = arg('store', '18641093');

const SHOP = `https://${env.SHOPIFY_STORE}/admin/api/${env.SHOPIFY_API_VERSION || '2026-07'}`;
const S = { 'X-Shopify-Access-Token': env.SHOPIFY_TOKEN, 'Content-Type': 'application/json' };
const P = {
  Authorization: `Bearer ${env.PRINTFUL_TOKEN}`,
  'Content-Type': 'application/json',
  'X-PF-Store-Id': STORE_PF,
};

const SOURCE = path.join(HERE, '..', 'contenu', `aop-${LOT}`);
const SORTIE = path.join(HERE, '..', 'contenu', `photos-aop-${LOT}`);

const heberger = async (fichier, cle) => {
  const png = fs.readFileSync(fichier);
  const r = await fetch(`${SHOP}/themes/${THEME}/assets.json`, {
    method: 'PUT',
    headers: S,
    body: JSON.stringify({ asset: { key: `assets/${cle}`, attachment: png.toString('base64') } }),
  });
  const j = await r.json();
  if (!j.asset) throw new Error(`hébergement raté : ${JSON.stringify(j).slice(0, 150)}`);
  // On GARDE le parametre ?v= : c'est le cache-buster. Sans lui, Printful re-telecharge
  // l'ancienne image mise en cache et la maquette ne reflete pas le nouveau fichier.
  return j.asset.public_url;
};

const lancer = async (corps) => {
  for (let essai = 0; essai < 6; essai++) {
    const r = await fetch(`https://api.printful.com/mockup-generator/create-task/${PRODUIT}`, {
      method: 'POST',
      headers: P,
      body: JSON.stringify(corps),
    });
    const j = await r.json();
    if (j.result && j.result.task_key) return j.result.task_key;
    if (j.code === 429) {
      const s = parseInt((String(j.result).match(/after (\d+) second/) || [])[1] || '50', 10);
      console.log(`     limite atteinte, attente de ${s + 3} s`);
      await new Promise((r2) => setTimeout(r2, (s + 3) * 1000));
      continue;
    }
    throw new Error(`refus : ${JSON.stringify(j).slice(0, 220)}`);
  }
  throw new Error('trop de tentatives');
};

const attendre = async (cle) => {
  for (let i = 0; i < 25; i++) {
    await new Promise((r) => setTimeout(r, 4000));
    const s = await fetch(`https://api.printful.com/mockup-generator/task?task_key=${cle}`, {
      headers: P,
    });
    const j = await s.json();
    const res = j.result || {};
    if (res.status === 'completed') return res.mockups || [];
    if (res.status === 'failed') throw new Error(`échec : ${res.error || '?'}`);
  }
  throw new Error('délai dépassé');
};

const pieces = JSON.parse(fs.readFileSync(path.join(SOURCE, 'index.json'), 'utf8'));
fs.mkdirSync(SORTIE, { recursive: true });

// variante du sweat AOP: on prend la première mappée
const rv = await fetch(`https://api.printful.com/mockup-generator/templates/${PRODUIT}`, { headers: P });
const jv = await rv.json();
const VARIANTE = jv.result.variant_mapping[0].variant_id;

// Printful exige un champ position PAR panneau. On le construit depuis les gabarits: chaque
// fichier remplit exactement sa zone d'impression, sans marge, sinon le vetement n'est pas
// couvert d'un bord a l'autre.
const gabarits = new Map(jv.result.templates.map((t) => [t.template_id, t]));
const zones = new Map();
for (const t of jv.result.variant_mapping[0].templates) {
  const g = gabarits.get(t.template_id);
  if (g) {
    zones.set(t.placement, {
      area_width: g.print_area_width,
      area_height: g.print_area_height,
      width: g.print_area_width,
      height: g.print_area_height,
      top: 0,
      left: 0,
    });
  }
}
console.log(`produit ${PRODUIT}, variante ${VARIANTE}, ${pieces.length} pièces`);
console.log(`zones connues : ${[...zones.keys()].join(', ')}`);

const index = [];
for (const p of pieces) {
  const num = String(p.numero).padStart(3, '0');
  try {
    const files = [];
    for (const [placement, fichier] of Object.entries(p.fichiers)) {
      const url = await heberger(path.join(SOURCE, fichier), `d2m-aop-${LOT}-${fichier}`);
      const pos = zones.get(placement);
      if (!pos) {
        console.log(`     ${placement} ignoré, pas de zone connue`);
        continue;
      }
      files.push({ placement, image_url: url, position: pos });
    }
    console.log(`  pièce ${num} : ${files.length} panneaux hébergés`);
    const cle = await lancer({ variant_ids: [VARIANTE], format: 'png', files });
    const maquettes = await attendre(cle);
    for (const m of maquettes) {
      const bin = Buffer.from(await (await fetch(m.mockup_url)).arrayBuffer());
      const nom = `${num}-${(m.placement || 'vue').replace(/[^a-z_]/gi, '')}.png`;
      fs.writeFileSync(path.join(SORTIE, nom), bin);
      console.log(`     ${nom} ${Math.round(bin.length / 1024)} ko`);
    }
    index.push({ numero: p.numero, phrase: p.phrase, maquettes: maquettes.map((m) => m.mockup_url) });
  } catch (e) {
    console.log(`  pièce ${num} ECHEC : ${e.message}`);
  }
}

fs.writeFileSync(path.join(SORTIE, 'index.json'), JSON.stringify(index, null, 2));
console.log(`\n${index.length} pièces photographiées dans ${SORTIE}`);
