/**
 * Transforme les fichiers d'impression en VRAIES PHOTOS de produit, par API.
 *
 * Chaîne, validée le 21/08/2026 :
 *   1. le PNG est hébergé publiquement comme asset du thème Shopify (Printful doit pouvoir
 *      le télécharger, et cette voie évite le scope write_files)
 *   2. POST /mockup-generator/create-task/{produit} lance la génération
 *   3. on sonde la tâche jusqu'à completed, environ 5 secondes
 *   4. l'URL de la maquette est enregistrée dans maquettes.json
 *
 * Usage :
 *   node maquettes.mjs --lot pub
 *   node maquettes.mjs --lot organique --produit 146
 *   node maquettes.mjs --lot pub --attacher      attache aussi les photos aux fiches Shopify
 *   node maquettes.mjs --source impression --sortie photos-serie --suffixe .png
 *                      --produit 586 --variante 15116
 *                                                  photographie un dossier quelconque
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
const LOT = arg('lot', 'pub');
const PRODUIT = parseInt(arg('produit', '146'), 10);
const THEME = arg('theme', '188585640264');

// Gildan 18500 noir taille L. Le noir est la couleur de reference de la marque, et c'est
// aussi celle sur laquelle un dessin clair ressort.
const VARIANTE = parseInt(arg('variante', '5532'), 10);
const STORE_PF = arg('store', '18641093');

const SHOP = `https://${env.SHOPIFY_STORE}/admin/api/${env.SHOPIFY_API_VERSION || '2026-07'}`;
const S = { 'X-Shopify-Access-Token': env.SHOPIFY_TOKEN, 'Content-Type': 'application/json' };
const P = {
  Authorization: `Bearer ${env.PRINTFUL_TOKEN}`,
  'Content-Type': 'application/json',
  'X-PF-Store-Id': STORE_PF,
};

// Par defaut le lot historique ; --source et --sortie permettent de photographier
// n'importe quel dossier de fichiers d'impression, et --suffixe de choisir quels fichiers.
const SOURCE = path.join(HERE, '..', 'contenu', arg('source', `scenes-${LOT}`));
const SORTIE = path.join(HERE, '..', 'contenu', arg('sortie', `photos-${LOT}`));
const SUFFIXE = arg('suffixe', '-devant.png');

// La zone d'impression du devant. Le premier essai utilisait 1500 de large sur les 1800
// disponibles, et l'imprime lisait comme une vignette au milieu d'un grand vetement : dans
// ce creneau les dessins mangent toute la poitrine. `plein` prend donc toute la largeur.
const ZONES = {
  vignette: { area_width: 1800, area_height: 2400, width: 1500, height: 1875, top: 250, left: 150 },
};
const MODE_ZONE = arg('zone', 'auto');

/**
 * Calcule la position d'un fichier dans la zone d'impression, à partir de SES dimensions.
 *
 * Deux erreurs à éviter, les deux vues sur les premières maquettes :
 *   - une zone fixe plus petite que la surface disponible donne un dessin minuscule perdu
 *     au milieu du vêtement, alors que dans ce créneau les dessins mangent la poitrine
 *   - une zone au rapport de forme différent de l'image l'étire, parce que Printful remplit
 *     le rectangle demandé au lieu de s'y adapter
 */
const dimensions = (fichier) => {
  const b = fs.readFileSync(fichier);
  return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
};

const positionner = (fichier) => {
  if (ZONES[MODE_ZONE]) return ZONES[MODE_ZONE];
  const { w, h } = dimensions(fichier);
  const maxW = 1800;
  const maxH = 2100;
  const k = Math.min(maxW / w, maxH / h);
  const width = Math.round(w * k);
  const height = Math.round(h * k);
  return {
    area_width: 1800,
    area_height: 2400,
    width,
    height,
    // Un dessin large et court cale en haut de zone se retrouve collé au col. On le
    // descend d'une part de la place qui reste, ce qui le pose sur la poitrine. Un dessin
    // haut, lui, remplit la zone et garde le haut.
    top: Math.round(120 + (maxH - height) * 0.35),
    left: Math.round((1800 - width) / 2),
  };
};

const heberger = async (fichier, cle) => {
  const png = fs.readFileSync(fichier);
  const r = await fetch(`${SHOP}/themes/${THEME}/assets.json`, {
    method: 'PUT',
    headers: S,
    body: JSON.stringify({ asset: { key: `assets/${cle}`, attachment: png.toString('base64') } }),
  });
  const j = await r.json();
  if (!j.asset) throw new Error(`hébergement raté : ${JSON.stringify(j).slice(0, 160)}`);
  // On GARDE le parametre ?v= : c'est le cache-buster. Sans lui, Printful re-telecharge
  // l'ancienne image mise en cache et la maquette ne reflete pas le nouveau fichier.
  return j.asset.public_url;
};

const maquette = async (url, ZONE) => {
  const r = await fetch(`https://api.printful.com/mockup-generator/create-task/${PRODUIT}`, {
    method: 'POST',
    headers: P,
    body: JSON.stringify({
      variant_ids: [VARIANTE],
      format: 'png',
      files: [
        {
          placement: 'front',
          image_url: url,
          position: ZONE,
        },
      ],
    }),
  });
  let j = await r.json();

  // Printful limite le generateur de maquettes: 2 taches puis blocage. Il indique le delai
  // exact a attendre dans son message, on le lit et on repatiente au lieu d'abandonner.
  let essais = 0;
  while (j.code === 429 && essais < 5) {
    const attente = parseInt((String(j.result).match(/after (\d+) second/) || [])[1] || '50', 10);
    console.log(`     limite atteinte, attente de ${attente + 3} s`);
    await new Promise((r2) => setTimeout(r2, (attente + 3) * 1000));
    const rr = await fetch(`https://api.printful.com/mockup-generator/create-task/${PRODUIT}`, {
      method: 'POST',
      headers: P,
      body: JSON.stringify({
        variant_ids: [VARIANTE],
        format: 'png',
        files: [
          {
            placement: 'front',
            image_url: url,
            position: ZONE,
          },
        ],
      }),
    });
    j = await rr.json();
    essais++;
  }

  if (!j.result || !j.result.task_key) {
    throw new Error(`tâche refusée : ${JSON.stringify(j).slice(0, 200)}`);
  }
  const cle = j.result.task_key;
  for (let i = 0; i < 20; i++) {
    await new Promise((r2) => setTimeout(r2, 4000));
    const s = await fetch(`https://api.printful.com/mockup-generator/task?task_key=${cle}`, {
      headers: P,
    });
    const js = await s.json();
    const res = js.result || {};
    if (res.status === 'completed') return res.mockups[0].mockup_url;
    if (res.status === 'failed') throw new Error(`génération échouée : ${res.error || '?'}`);
  }
  throw new Error('délai dépassé');
};

fs.mkdirSync(SORTIE, { recursive: true });
const fichiers = fs
  .readdirSync(SOURCE)
  .filter((f) => f.endsWith(SUFFIXE))
  .sort();

console.log(`lot ${LOT}, ${fichiers.length} fichiers, produit ${PRODUIT}, variante ${VARIANTE}`);

const index = [];
for (const f of fichiers) {
  const nom = f.replace(SUFFIXE, '');
  if (fs.existsSync(path.join(SORTIE, `${nom}.png`))) {
    console.log(`  ${nom.padEnd(20)} deja fait, ignore`);
    continue;
  }
  try {
    const url = await heberger(path.join(SOURCE, f), `d2m-${LOT}-${nom}.png`);
    const photo = await maquette(url, positionner(path.join(SOURCE, f)));
    const bin = Buffer.from(await (await fetch(photo)).arrayBuffer());
    const dest = path.join(SORTIE, `${nom}.png`);
    fs.writeFileSync(dest, bin);
    console.log(`  ${nom.padEnd(20)} ${Math.round(bin.length / 1024)} ko`);
    index.push({ nom, lot: LOT, fichier_impression: url, photo, local: `${nom}.png` });
  } catch (e) {
    console.log(`  ${nom.padEnd(20)} ECHEC : ${e.message}`);
  }
}

fs.writeFileSync(path.join(SORTIE, 'maquettes.json'), JSON.stringify(index, null, 2));
console.log(`\n${index.length} photos dans ${SORTIE}`);
console.log(`maquettes.json garde l'URL du fichier d'impression et celle de la photo.`);
