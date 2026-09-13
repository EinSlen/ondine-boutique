/**
 * Photographie n'importe quel produit Printful avec n'importe quel fichier d'impression.
 *
 * `maquettes.mjs` ne sait faire qu'un imprimé au centre du devant d'un t-shirt. Ici les
 * zones sont lues dans les gabarits du produit, ce qui marche pour tout : un bandana, un
 * bonnet, un sac, une chaussure, un poster, un sweat couvert d'un bord à l'autre.
 *
 * Deux modes :
 *   couvrir   le fichier remplit chaque panneau, sans marge. C'est l'impression intégrale :
 *             bandana, bonnet, sac, chaussure. Le fichier doit AVOIR un fond, puisque c'est
 *             l'encre qui fait toute la couleur de l'objet.
 *   placer    le fichier est posé, centré, à l'échelle, sur un seul emplacement. C'est
 *             l'imprimé de poitrine. Le fichier doit être SANS fond.
 *
 * Usage :
 *   node photos-tout.mjs --produit 630 --dossier f-carre --sortie photos-bandana --mode couvrir
 *   node photos-tout.mjs --produit 586 --dossier brut --sortie photos-tee --mode placer --couleur black
 *   node photos-tout.mjs --produit 630 --zones          affiche seulement les emplacements
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
const PRODUIT = parseInt(arg('produit', '630'), 10);
const DOSSIER = arg('dossier', 'f-carre');
const SORTIE_NOM = arg('sortie', `photos-${PRODUIT}`);
const MODE = arg('mode', 'couvrir');
const COULEUR = arg('couleur', null);
const NB = parseInt(arg('nb', '3'), 10);
const THEME = arg('theme', '188585640264');
const STORE_PF = arg('store', '18641093');
const ZONES_SEULES = process.argv.includes('--zones');

const SHOP = `https://${env.SHOPIFY_STORE}/admin/api/${env.SHOPIFY_API_VERSION || '2026-07'}`;
const S = { 'X-Shopify-Access-Token': env.SHOPIFY_TOKEN, 'Content-Type': 'application/json' };
const P = {
  Authorization: `Bearer ${env.PRINTFUL_TOKEN}`,
  'Content-Type': 'application/json',
  'X-PF-Store-Id': STORE_PF,
};

const SOURCE = path.join(HERE, '..', 'contenu', DOSSIER);
const SORTIE = path.join(HERE, '..', 'contenu', SORTIE_NOM);

/** Printful doit pouvoir télécharger le fichier : on le sert comme asset du thème. */
const heberger = async (fichier, cle) => {
  const png = fs.readFileSync(fichier);
  const r = await fetch(`${SHOP}/themes/${THEME}/assets.json`, {
    method: 'PUT',
    headers: S,
    body: JSON.stringify({ asset: { key: `assets/${cle}`, attachment: png.toString('base64') } }),
  });
  const j = await r.json();
  if (!j.asset) throw new Error(`hébergement raté : ${JSON.stringify(j).slice(0, 140)}`);
  // le ?v= est le cache-buster : sans lui Printful ressert l'ancienne image
  return j.asset.public_url;
};

const dimensions = (fichier) => {
  const b = fs.readFileSync(fichier);
  return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
};

/** Attend puis relance quand Printful bloque, au lieu d'abandonner. */
const appel = async (url, options) => {
  for (let essai = 0; essai < 6; essai++) {
    const r = await fetch(url, options);
    const j = await r.json();
    if (j.code !== 429) return j;
    const attente = parseInt((String(j.result).match(/after (\d+) second/) || [])[1] || '40', 10);
    console.log(`     limite atteinte, attente de ${attente + 3} s`);
    await new Promise((z) => setTimeout(z, (attente + 3) * 1000));
  }
  throw new Error('bloqué par la limite après six essais');
};

const attendre = async (cle) => {
  for (let i = 0; i < 25; i++) {
    await new Promise((z) => setTimeout(z, 4000));
    const r = await fetch(`https://api.printful.com/mockup-generator/task?task_key=${cle}`, { headers: P });
    const j = await r.json();
    const res = j.result || {};
    if (res.status === 'completed') return res.mockups || [];
    if (res.status === 'failed') throw new Error(`génération échouée : ${res.error || '?'}`);
  }
  throw new Error('délai dépassé');
};

const main = async () => {
  // les couleurs vivent dans le catalogue, les zones dans les gabarits : il faut les deux
  const rp = await fetch(`https://api.printful.com/products/${PRODUIT}`, { headers: P });
  const jp = await rp.json();
  if (!jp.result) throw new Error(`produit ${PRODUIT} illisible`);
  const parId = new Map((jp.result.variants || []).map((v) => [v.id, v]));

  const jv = await appel(`https://api.printful.com/mockup-generator/templates/${PRODUIT}`, { headers: P });
  if (!jv.result) throw new Error(`gabarits illisibles : ${JSON.stringify(jv).slice(0, 160)}`);

  const mappings = jv.result.variant_mapping || [];
  const choisi =
    (COULEUR && mappings.find((m) => new RegExp(COULEUR, 'i').test((parId.get(m.variant_id) || {}).color || ''))) ||
    mappings[0];
  if (!choisi) throw new Error('aucune variante mappée');
  const v = parId.get(choisi.variant_id) || {};

  const gabarits = new Map((jv.result.templates || []).map((t) => [t.template_id, t]));
  const zones = new Map();
  for (const t of choisi.templates || []) {
    const g = gabarits.get(t.template_id);
    if (g) {
      zones.set(t.placement, {
        area_width: g.print_area_width,
        area_height: g.print_area_height,
      });
    }
  }

  console.log(`produit ${PRODUIT} : ${jp.result.product.title}`);
  console.log(`variante ${choisi.variant_id} ${v.color || ''} ${v.size || ''}`);
  console.log(`emplacements : ${[...zones.entries()].map(([k, z]) => `${k} ${z.area_width}x${z.area_height}`).join(' | ')}`);
  if (ZONES_SEULES) return;

  const fichiers = fs
    .readdirSync(SOURCE)
    .filter((f) => f.endsWith('.png'))
    .sort()
    .slice(0, NB);
  fs.mkdirSync(SORTIE, { recursive: true });
  console.log(`${fichiers.length} fichier(s), mode ${MODE}`);

  const index = [];
  for (const f of fichiers) {
    const nom = f.replace('.png', '');
    try {
      const url = await heberger(path.join(SOURCE, f), `d2m-${PRODUIT}-${f}`);
      const { w, h } = dimensions(path.join(SOURCE, f));

      // les etiquettes interieures ne sont pas une surface de dessin : on ne les imprime pas
      const utiles = [...zones.keys()].filter((k) => !/label|inside/i.test(k));
      const cibles = MODE === 'placer' ? [utiles.find((k) => /front|default/.test(k)) || utiles[0]] : utiles;
      const files = [];
      for (const placement of cibles) {
        const z = zones.get(placement);
        if (!z) continue;
        if (MODE === 'couvrir') {
          // remplir tout le panneau : sans ça l'objet n'est pas couvert d'un bord à l'autre
          files.push({
            placement,
            image_url: url,
            position: { area_width: z.area_width, area_height: z.area_height, width: z.area_width, height: z.area_height, top: 0, left: 0 },
          });
        } else {
          // respecter le rapport de forme, sinon Printful étire l'image pour remplir
          const k = Math.min(z.area_width / w, (z.area_height * 0.88) / h);
          const width = Math.round(w * k);
          const height = Math.round(h * k);
          files.push({
            placement,
            image_url: url,
            position: {
              area_width: z.area_width,
              area_height: z.area_height,
              width,
              height,
              // un dessin large et court doit descendre, sinon il se colle au col
              top: Math.round(z.area_height * 0.05 + (z.area_height * 0.88 - height) * 0.35),
              left: Math.round((z.area_width - width) / 2),
            },
          });
        }
      }
      if (!files.length) throw new Error('aucun emplacement utilisable');

      const j = await appel(`https://api.printful.com/mockup-generator/create-task/${PRODUIT}`, {
        method: 'POST',
        headers: P,
        body: JSON.stringify({ variant_ids: [choisi.variant_id], format: 'png', files }),
      });
      if (!j.result || !j.result.task_key) throw new Error(`tâche refusée : ${JSON.stringify(j).slice(0, 180)}`);

      const maquettes = await attendre(j.result.task_key);
      let i = 0;
      for (const m of maquettes.slice(0, 2)) {
        const bin = Buffer.from(await (await fetch(m.mockup_url)).arrayBuffer());
        const cible = path.join(SORTIE, `${nom}${i ? `-${i}` : ''}.png`);
        fs.writeFileSync(cible, bin);
        console.log(`  ${nom.padEnd(34)} ${Math.round(bin.length / 1024)} ko`);
        i++;
      }
      index.push({ nom, produit: PRODUIT, variante: choisi.variant_id, photos: maquettes.map((m) => m.mockup_url) });
    } catch (e) {
      console.log(`  ${nom.padEnd(34)} ECHEC : ${e.message}`);
    }
  }

  fs.writeFileSync(path.join(SORTIE, 'photos.json'), JSON.stringify(index, null, 2));
  console.log(`\n${index.length} photo(s) dans ${SORTIE}`);
};

main().catch((e) => {
  console.error(`ECHEC : ${e.message}`);
  process.exit(1);
});
