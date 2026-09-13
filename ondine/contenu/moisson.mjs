/**
 * Moissonne en masse des silhouettes CC0 sur Openclipart pour la bibliothèque dead2me.
 *
 * Tout Openclipart est en CC0 (domaine public), donc utilisable sur un vêtement revendu,
 * sans attribution. La provenance de chaque pièce est écrite dans catalogue.json, qui sert
 * de preuve des droits.
 *
 * Deux esthétiques visées :
 *   live2die  silhouettes pleines, scènes de rupture, éclaboussures
 *   rawsoult  dessins au trait très bruts, quelques gouttes, texte manuscrit
 *
 * Usage :
 *   node moisson.mjs              moissonne toutes les requêtes
 *   node moisson.mjs --planche    refait seulement la planche de contrôle
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ICI = path.dirname(fileURLToPath(import.meta.url));
const SORTIE = path.join(ICI, 'bibliotheque');
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126 Safari/537.36';

/** Les thèmes du registre : rupture, solitude, attente, deuil, fuite. */
const REQUETES = {
  personnage: [
    'silhouette woman walking',
    'silhouette man walking away',
    'silhouette woman running',
    'silhouette man running',
    'silhouette sitting alone',
    'silhouette depressed',
    'sitting crying man',
    'silhouette standing waiting',
    'silhouette couple',
    'silhouette man crouching',
    'silhouette person head hands',
    'silhouette girl sad',
    'silhouette walking rain',
    'silhouette man smoking',
    'silhouette woman crying',
    'silhouette man sitting bench',
    'silhouette person at window',
    'silhouette man alone street',
    'silhouette back turned',
    'silhouette person umbrella',
    'silhouette woman sitting floor',
    'silhouette person suitcase',
    'silhouette man on phone',
    'silhouette kneeling',
    'silhouette teenager sitting',
  ],
  objet: [
    'silhouette chair',
    'silhouette bed',
    'silhouette phone hand',
    'silhouette cigarette',
    'silhouette bottle',
    'silhouette door',
    'silhouette window night',
    'silhouette clock',
    'silhouette broken heart',
    'silhouette rose',
    'silhouette knife',
    'silhouette pills',
    'empty chair',
    'silhouette bench',
    'silhouette dog sitting',
    'silhouette suitcase',
    'silhouette television',
    'silhouette mirror',
    'cassette tape silhouette',
    'payphone silhouette',
    'bus stop silhouette',
    'street lamp silhouette',
    'silhouette rain drops',
    'empty bed',
    'wilted flower silhouette',
    'dead tree silhouette',
    'wine glass silhouette',
    'ashtray silhouette',
    'envelope silhouette',
    'wedding ring silhouette',
  ],
  symbole: [
    'cross grave',
    'graveyard silhouette',
    'tombstone',
    'skull silhouette',
    'angel wings silhouette',
    'crow silhouette',
    'moon silhouette',
    'barbed wire',
    'candle silhouette',
    'bird cage silhouette',
    'hourglass silhouette',
    'chain link silhouette',
  ],
  trace: ['splatter smear', 'ink splatter', 'paint stroke', 'grunge texture', 'scratch texture'],
};

const dodo = (ms) => new Promise((r) => setTimeout(r, ms));

const chercher = async (requete) => {
  for (let essai = 0; essai < 3; essai++) {
    try {
      const r = await fetch(`https://openclipart.org/search/?query=${encodeURIComponent(requete)}`, {
        headers: { 'User-Agent': UA },
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const html = await r.text();
      const vus = new Map();
      for (const m of html.matchAll(/detail\/(\d+)\/([a-z0-9-]+)/g)) {
        if (!vus.has(m[1])) vus.set(m[1], m[2]);
      }
      return [...vus].map(([id, nom]) => ({ id, nom }));
    } catch {
      await dodo(2500);
    }
  }
  return [];
};

/** Openclipart renvoie aléatoirement 301 ou 500 sur /download, il faut réessayer. */
const telecharger = async (id) => {
  for (let essai = 0; essai < 4; essai++) {
    try {
      const r = await fetch(`https://openclipart.org/download/${id}/`, {
        headers: { 'User-Agent': UA },
        redirect: 'follow',
      });
      if (r.ok) {
        const svg = await r.text();
        if (svg.includes('<svg')) return svg;
      }
    } catch {
      /* on réessaie */
    }
    await dodo(1500);
  }
  return null;
};

if (!process.argv.includes('--planche')) {
  fs.mkdirSync(SORTIE, { recursive: true });
  const cat = path.join(SORTIE, 'catalogue.json');
  const catalogue = fs.existsSync(cat) ? JSON.parse(fs.readFileSync(cat, 'utf8')) : [];
  const deja = new Set(catalogue.map((c) => c.id));

  let ajoutes = 0;
  for (const [famille, liste] of Object.entries(REQUETES)) {
    for (const requete of liste) {
      const res = await chercher(requete);
      let n = 0;
      for (const r of res.slice(0, 6)) {
        if (deja.has(r.id)) continue;
        const svg = await telecharger(r.id);
        if (!svg) continue;
        const fichier = `${famille}-${r.id}.svg`;
        fs.writeFileSync(path.join(SORTIE, fichier), svg);
        catalogue.push({
          id: r.id,
          nom: r.nom,
          famille,
          requete,
          fichier,
          source: `https://openclipart.org/detail/${r.id}`,
          licence: 'CC0 1.0, domaine public, merchandising autorisé',
        });
        deja.add(r.id);
        n++;
        ajoutes++;
        await dodo(700);
      }
      console.log(`${requete.padEnd(32)} ${res.length} résultats, ${n} nouveaux`);
      fs.writeFileSync(cat, JSON.stringify(catalogue, null, 2));
      await dodo(900);
    }
  }
  console.log(`\n${ajoutes} pièces ajoutées, ${catalogue.length} au total dans ${SORTIE}`);
}

// planche de contrôle, pour trier à l'œil ce qui est utilisable
const catalogue = JSON.parse(fs.readFileSync(path.join(SORTIE, 'catalogue.json'), 'utf8'));
let html =
  '<!doctype html><meta charset="utf-8"><title>bibliothèque dead2me</title>' +
  '<style>body{background:#111;color:#eee;font-family:system-ui,sans-serif;padding:24px}' +
  'h2{font-size:14px;color:#aaa;border-bottom:1px solid #333;padding-bottom:6px;margin-top:30px}' +
  '.g{display:flex;flex-wrap:wrap;gap:10px}figure{margin:0;width:150px}' +
  'img{width:100%;height:150px;object-fit:contain;background:#1c1c1c;border:1px solid #2b2b2b}' +
  'figcaption{font-size:10px;color:#777;margin-top:4px;word-break:break-all}</style>' +
  `<h1>Bibliothèque dead2me — ${catalogue.length} pièces CC0</h1>`;
for (const famille of Object.keys(REQUETES)) {
  const l = catalogue.filter((c) => c.famille === famille);
  if (!l.length) continue;
  html += `<h2>${famille} — ${l.length}</h2><div class="g">`;
  for (const c of l) {
    html += `<figure><img src="bibliotheque/${c.fichier}"><figcaption>${c.id} ${c.nom.slice(0, 26)}</figcaption></figure>`;
  }
  html += '</div>';
}
fs.writeFileSync(path.join(ICI, 'bibliotheque.html'), html);
console.log(`planche écrite : contenu/bibliotheque.html`);
