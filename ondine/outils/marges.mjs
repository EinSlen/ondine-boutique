/**
 * Confronte les prix de vente Shopify aux coûts réels Printful, en euros et pour la région
 * Europe, placement par placement.
 *
 * `--sans-manches` rejoue le calcul en retirant l'éclaboussure des deux manches. C'est le
 * poste le plus lourd du pack de production : deux zones facturées plein tarif sur chaque
 * sweat, pour un détail que la vignette de la grille ne montre même pas.
 *
 * Le calcul compte ce que Printful facture vraiment : le vêtement selon sa technique, plus
 * CHAQUE zone imprimée. Un zip hoodie avec un dessin devant et une éclaboussure sur les deux
 * manches, c'est trois zones, pas une. Le prix de vente est ramené hors taxe : en France il
 * est affiché TTC, et la TVA n'est pas de la marge.
 *
 * Usage : node marges.mjs
 */

import { readFileSync, existsSync } from 'node:fs';
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

const TVA = 0.2;
const PF = { Authorization: `Bearer ${env.PRINTFUL_TOKEN}` };
const SH = { 'X-Shopify-Access-Token': env.SHOPIFY_TOKEN, 'Content-Type': 'application/json' };
const BASE = `https://${env.SHOPIFY_STORE}/admin/api/${env.SHOPIFY_API_VERSION || '2026-07'}`;

// blank Printful et zones imprimées, d'après 05_SUPPLIER_MAPPING du pack de production
const PLAN = {
  'split-figures-zip': { blank: 692, zones: ['front', 'sleeve_left', 'sleeve_right'] },
  'seated-figure-zip': { blank: 692, zones: ['front', 'sleeve_left', 'sleeve_right'] },
  'table-alone-zip': { blank: 692, zones: ['front', 'sleeve_left', 'sleeve_right'] },
  'aftermath-zip': { blank: 692, zones: ['front', 'sleeve_left', 'sleeve_right'] },
  'd2m-zip-hoodie': { blank: 692, zones: ['front', 'back', 'sleeve_left', 'sleeve_right'] },
  'd2m-hoodie': { blank: 146, zones: ['front', 'back', 'sleeve_left', 'sleeve_right'] },
  'd2m-heavyweight-tee': { blank: 917, zones: ['front', 'back'] },
  'd2m-essentials-tee': { blank: 917, zones: ['front', 'back'] },
  'run-away-tee': { blank: 917, zones: ['front'] },
  'void-wide-leg-joggers': { blank: 784, zones: [] },
  'static-wide-leg-pants': { blank: 604, zones: [] },
  'no-signal-track-pants': { blank: 618, zones: [] },
};

const tarifs = new Map();

/** Correspondance identifiant de variante Printful vers sa taille, absente de l'API prix. */
const taillesBlank = async (id) => {
  const j = await (await fetch(`https://api.printful.com/products/${id}`, { headers: PF })).json();
  return Object.fromEntries(j.result.variants.map((v) => [v.id, (v.size || '').toUpperCase()]));
};

const tarifBlank = async (id, taillesVendues) => {
  const cle = `${id}:${taillesVendues.join(',')}`;
  if (tarifs.has(cle)) return tarifs.get(cle);
  const r = await fetch(
    `https://api.printful.com/v2/catalog-products/${id}/prices?selling_region_name=europe&currency=EUR`,
    { headers: PF },
  );
  const j = await r.json();
  if (!j.data) throw new Error(`prix indisponibles pour le blank ${id}`);
  const prixTechnique = (v, technique) =>
    Number(v.techniques.find((t) => t.technique_key === technique)?.discounted_price ?? NaN);
  // on ne retient que les tailles réellement au catalogue : le 5XL coûte plus cher et
  // fausserait la marge d'une fiche qui s'arrête au XXL
  const parId = await taillesBlank(id);
  const retenues = j.data.variants.filter((v) => {
    const t = parId[v.id];
    return !t || !taillesVendues.length || taillesVendues.includes(t);
  });
  const vetement = (retenues.length ? retenues : j.data.variants)
    .map((v) => prixTechnique(v, 'dtg') || prixTechnique(v, 'cut-sew') || prixTechnique(v, 'sublimation'))
    .filter((n) => Number.isFinite(n));
  const zones = Object.fromEntries(
    j.data.product.placements
      .filter((p) => ['dtg', 'cut-sew', 'sublimation'].includes(p.technique_key))
      .map((p) => [p.id, Number(p.discounted_price ?? p.price)]),
  );
  const t = { min: Math.min(...vetement), max: Math.max(...vetement), zones };
  tarifs.set(cle, t);
  return t;
};

const { products } = await (await fetch(`${BASE}/products.json?limit=50`, { headers: SH })).json();

console.log(
  ['produit', 'vente TTC', 'vente HT', 'coût mini', 'coût maxi', 'marge mini', 'taux mini'].join(' | '),
);
console.log('-'.repeat(96));

const sansManches = process.argv.includes('--sans-manches');
let alertes = [];
for (const [handle, plan] of Object.entries(PLAN)) {
  const p = products.find((x) => x.handle === handle);
  if (!p) continue;
  const taillesVendues = (p.options.find((o) => /size|taille/i.test(o.name))?.values ?? []).map((v) => v.toUpperCase());
  const t = await tarifBlank(plan.blank, taillesVendues);
  const zones = sansManches ? plan.zones.filter((z) => !z.startsWith('sleeve')) : plan.zones;
  const impression = zones.reduce((s, z) => s + (t.zones[z] ?? 0), 0);
  const ttc = Number(p.variants[0].price);
  const ht = ttc / (1 + TVA);
  const coutMin = t.min + impression;
  const coutMax = t.max + impression;
  const margeMin = ht - coutMax;
  const taux = (margeMin / ht) * 100;
  if (taux < 45) alertes.push(`${p.title} : ${taux.toFixed(0)} % sur la plus grande taille`);
  console.log(
    [
      p.title.padEnd(23),
      `${ttc.toFixed(2)} €`.padStart(9),
      `${ht.toFixed(2)} €`.padStart(8),
      `${coutMin.toFixed(2)} €`.padStart(9),
      `${coutMax.toFixed(2)} €`.padStart(9),
      `${margeMin.toFixed(2)} €`.padStart(10),
      `${taux.toFixed(0)} %`.padStart(9),
    ].join(' | '),
  );
}

console.log('\nCoût = vêtement + chaque zone imprimée, hors livraison. Vente ramenée hors TVA à 20 %.');
if (alertes.length) {
  console.log('\nÀ surveiller, la livraison et la publicité passent après :');
  for (const a of alertes) console.log(`  - ${a}`);
}
