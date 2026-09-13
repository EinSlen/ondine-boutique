/**
 * Génère en masse des propositions de visuels dead2me, dans les deux esthétiques observées.
 *
 *   live2die   silhouettes PLEINES, scène de rupture, éclaboussures rouges, fond noir
 *   rawsoult   dessin au trait très brut, fond clair, quelques gouttes, texte manuscrit
 *
 * Sortie : des aperçus à plat (rapides), pas des maquettes Printful. Une maquette prend
 * 25 secondes à cause de la limite de débit du générateur, donc 100 propositions
 * demanderaient trois quarts d'heure. On produit d'abord les aperçus pour choisir, puis on
 * ne photographie que les retenus avec maquettes-aop.mjs.
 *
 * Usage :
 *   node propositions.mjs --nb 100
 *   node propositions.mjs --nb 40 --style live2die
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { navigateur } from './navigateur.mjs';

const ICI = path.dirname(fileURLToPath(import.meta.url));
const BIB = path.join(ICI, 'bibliotheque');
const TACHES = path.join(ICI, 'taches');
const SORTIE = path.join(ICI, 'propositions');

const arg = (n, d) => {
  const i = process.argv.indexOf(`--${n}`);
  return i > -1 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--')
    ? process.argv[i + 1]
    : d;
};
const NB = parseInt(arg('nb', '100'), 10);
const STYLE_FIXE = arg('style', null);
const TAILLE = parseInt(arg('taille', '900'), 10);

const alea = (graine) => {
  let a = graine >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

/** Charge un SVG et en extrait la géométrie replaçable. */
const charger = (dossier, fichier) => {
  const brut = fs.readFileSync(path.join(dossier, fichier), 'utf8');
  const vb = brut.match(/viewBox="([^"]+)"/);
  const w = brut.match(/\swidth="([\d.]+)/);
  const h = brut.match(/\sheight="([\d.]+)/);
  let dedans = brut
    .replace(/^[\s\S]*?<svg[^>]*>/, '')
    .replace(/<\/\s*svg\s*>\s*$/, '')
    .replace(/<metadata[\s\S]*?<\/\s*metadata\s*>/g, '')
    .replace(/<title[\s\S]*?<\/\s*title\s*>/g, '')
    .replace(/<defs[\s\S]*?<\/\s*defs\s*>/g, '')
    .replace(/<sodipodi:namedview[\s\S]*?\/>/g, '')
    .replace(/<rect[^>]*(?:width="100%"|height="100%")[^>]*\/?>/g, '');
  const o = (dedans.match(/<g[\s>]/g) || []).length;
  const c = (dedans.match(/<\/\s*g\s*>/g) || []).length;
  if (o > c) dedans += '</g>'.repeat(o - c);
  dedans = dedans
    .replace(/fill="(?!none)[^"]*"/g, 'fill="currentColor"')
    .replace(/fill:\s*(?!none)[^;"}]+/g, 'fill:currentColor')
    .replace(/stroke="(?!none)[^"]*"/g, 'stroke="currentColor"');
  const [vx, vy, vw, vh] = (vb ? vb[1] : `0 0 ${w ? w[1] : 100} ${h ? h[1] : 100}`)
    .trim()
    .split(/[\s,]+/)
    .map(Number);
  return { dedans, vx, vy, vw, vh, fichier };
};

const placer = (p, x, y, largeur, hauteur, couleur, miroir = false) => {
  const k = Math.min(largeur / p.vw, hauteur / p.vh);
  const dx = x + (largeur - p.vw * k) / 2;
  const dy = y + (hauteur - p.vh * k) / 2;
  const mir = miroir ? `translate(${(p.vw * k).toFixed(2)} 0) scale(-1 1) ` : '';
  return `<g color="${couleur}" fill="${couleur}" transform="translate(${dx.toFixed(2)} ${dy.toFixed(2)}) ${mir}scale(${k.toFixed(5)}) translate(${(-p.vx).toFixed(2)} ${(-p.vy).toFixed(2)})">${p.dedans}</g>`;
};

// ---------------------------------------------------------------- bibliothèque
/**
 * On ne tire QUE dans selection.json, une liste blanche établie à l'œil. La moisson brute
 * ramenait des dames victoriennes et des coeurs décoratifs : 100 propositions tirées d'une
 * bibliothèque médiocre donnent 100 propositions médiocres. Le volume vient des variations
 * (composition, sang, phrase, échelle, miroir), pas du nombre de pièces sources.
 */
const selection = JSON.parse(fs.readFileSync(path.join(ICI, 'selection.json'), 'utf8'));
const parRole = (role) =>
  selection.retenues
    .filter((r) => r.role === role)
    .map((r) => charger(ICI, r.fichier));

const COURT = parRole('court');
const ASSIS = parRole('assis');
const PART = parRole('part');
const COUPLE = parRole('couple');
const SYMBOLES = parRole('symbole');
const PERSOS = [...COURT, ...ASSIS, ...PART];
const OBJETS = [];
const TRACES = fs
  .readdirSync(TACHES)
  .filter((f) => f.endsWith('.svg'))
  .map((f) => charger(TACHES, f));

if (!PERSOS.length) {
  console.error('selection.json ne donne aucun personnage exploitable');
  process.exit(1);
}
console.log(
  `sélection : ${COURT.length} qui partent en courant, ${ASSIS.length} assis, ${PART.length} qui marchent, ${SYMBOLES.length} symboles, ${TRACES.length} traces`,
);

// ---------------------------------------------------------------- phrases
const PHRASES = [
  'dead to me', 'no reply', 'you first', 'still nothing', 'she left twice',
  'don’t wait up', 'gone by morning', 'told you so', 'not my problem',
  'last seen online', 'read at 4am', 'nothing after', 'end of it', 'no one came',
  'you did this', 'call me never', 'i waited', 'was it me', 'keep it',
  'delete this', 'seen 3am', 'left on read', 'not again', 'same as before',
];

const eclaboussures = (r, w, h, couleurs, densite, taille, reserve) => {
  if (!TRACES.length) return '';
  let s = '';
  const nb = Math.max(1, Math.round(densite * 26));
  for (let i = 0; i < nb; i++) {
    const t = TRACES[Math.floor(r() * TRACES.length)];
    let x = r() * w;
    let y = r() * h;
    if (reserve) {
      let e = 0;
      while (e < 10 && x > reserve[0] * w && x < reserve[1] * w && y > reserve[2] * h && y < reserve[3] * h) {
        x = r() * w;
        y = r() * h;
        e++;
      }
      if (e >= 10) continue;
    }
    const ech = Math.sqrt(w * h) * (taille[0] + r() * (taille[1] - taille[0]));
    const k = ech / Math.max(t.vw, t.vh);
    const c = couleurs[Math.floor(r() * couleurs.length)];
    s +=
      `<g color="${c}" fill="${c}" opacity="${(0.7 + r() * 0.3).toFixed(2)}" transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${(r() * 360).toFixed(0)}) scale(${(k * (r() > 0.5 ? -1 : 1)).toFixed(5)} ${k.toFixed(5)}) translate(${(-t.vx - t.vw / 2).toFixed(1)} ${(-t.vy - t.vh / 2).toFixed(1)})">${t.dedans}</g>`;
  }
  const fines = Math.round(densite * 70);
  for (let i = 0; i < fines; i++) {
    const c = couleurs[Math.floor(r() * couleurs.length)];
    s += `<circle cx="${(r() * w).toFixed(1)}" cy="${(r() * h).toFixed(1)}" r="${(Math.sqrt(w * h) * (0.0008 + r() * 0.003)).toFixed(2)}" fill="${c}" opacity="${(0.4 + r() * 0.5).toFixed(2)}"/>`;
  }
  return s;
};

// ---------------------------------------------------------------- compositions
const COMPOSITIONS = {
  /** Deux personnages qui se répondent, hauteur égale. */
  duo: (r, w, h, t, opts) => {
    // celle qui s'en va a gauche, celui qui reste a droite: c'est le sens du recit
    const gauche = [...COURT, ...PART];
    const a = gauche[Math.floor(r() * gauche.length)];
    const b = ASSIS[Math.floor(r() * ASSIS.length)];
    const hs = h * 0.46;
    const y = h * 0.2;
    const barre = opts.barre
      ? `<rect x="${w * 0.487}" y="${y + hs * 0.16}" width="${w * 0.024}" height="${hs * 0.7}" fill="${t}"/>`
      : '';
    return placer(a, w * 0.04, y, w * 0.4, hs, t, true) + barre + placer(b, w * 0.56, y, w * 0.4, hs, t);
  },

  /** Un symbole en grand, un personnage écrasé dessous. */
  symbole: (r, w, h, t) => {
    if (!SYMBOLES.length) return COMPOSITIONS.seul(r, w, h, t);
    const s = SYMBOLES[Math.floor(r() * SYMBOLES.length)];
    const p = PERSOS[Math.floor(r() * PERSOS.length)];
    return placer(s, w * 0.22, h * 0.1, w * 0.56, h * 0.4, t) + placer(p, w * 0.32, h * 0.48, w * 0.36, h * 0.34, t);
  },

  /** Une seule silhouette, beaucoup de vide. */
  seul: (r, w, h, t) => {
    const p = PERSOS[Math.floor(r() * PERSOS.length)];
    const cote = r() > 0.5 ? 0.14 : 0.5;
    return placer(p, w * cote, h * 0.22, w * 0.36, h * 0.5, t, r() > 0.5);
  },

  /** La même silhouette qui s'éloigne, trois fois. */
  eloignement: (r, w, h, t) => {
    const p = PERSOS[Math.floor(r() * PERSOS.length)];
    let s = '';
    for (let i = 0; i < 3; i++) {
      const hh = h * (0.44 - i * 0.1);
      s += placer(p, w * (0.06 + i * 0.3), h * 0.24 + i * h * 0.03, w * 0.3, hh, t, i === 1);
    }
    return s;
  },

  /** Un personnage et un objet, l'objet raconte la scène. */
  objet: (r, w, h, t) => {
    if (!OBJETS.length) return COMPOSITIONS.seul(r, w, h, t);
    const p = PERSOS[Math.floor(r() * PERSOS.length)];
    const o = OBJETS[Math.floor(r() * OBJETS.length)];
    return placer(p, w * 0.06, h * 0.2, w * 0.4, h * 0.46, t) + placer(o, w * 0.56, h * 0.28, w * 0.34, h * 0.3, t);
  },
};

// On ne propose que les compositions dont la bibliothèque a les ingrédients: sans symbole
// ni objet, ces compositions plantent au lieu de se replier proprement.
const NOMS_COMPO = Object.keys(COMPOSITIONS).filter((n) => {
  if (n === 'symbole') return SYMBOLES.length > 0;
  if (n === 'objet') return OBJETS.length > 0;
  return true;
});

const STYLES = {
  live2die: {
    fond: '#101012',
    trait: '#f2efe9',
    encres: ['#8e0f14', '#a3141a', '#6d0b10'],
    police: 'Arial Black, Arial, sans-serif',
    poids: 900,
  },
  rawsoult: {
    fond: '#efece4',
    trait: '#14120f',
    encres: ['#7d0d12', '#5e0a0e'],
    police: 'Comic Sans MS, Segoe Print, cursive',
    poids: 700,
  },
};

const main = async () => {
  fs.mkdirSync(SORTIE, { recursive: true });
  const { default: puppeteer } = await import('puppeteer-core');
  const nav = await puppeteer.launch({
    executablePath: navigateur(),
    headless: true,
    args: ['--no-sandbox'],
  });
  const page = await nav.newPage();
  const H = Math.round(TAILLE * 1.25);
  await page.setViewport({ width: TAILLE, height: H, deviceScaleFactor: 1 });

  const index = [];
  for (let i = 0; i < NB; i++) {
    const n = i + 1;
    const r = alea(n * 2654435761 + 7);
    const styleNom = STYLE_FIXE || (r() > 0.35 ? 'live2die' : 'rawsoult');
    const st = STYLES[styleNom];
    const compo = NOMS_COMPO[Math.floor(r() * NOMS_COMPO.length)];
    // trois niveaux de sang, pour couvrir la demande: rien, un peu, beaucoup
    const sang = ['aucun', 'peu', 'beaucoup'][Math.floor(r() * 3)];
    const densite = sang === 'aucun' ? 0 : sang === 'peu' ? 0.18 : 0.75;
    const taille = sang === 'peu' ? [0.02, 0.06] : [0.06, 0.24];
    const phrase = PHRASES[Math.floor(r() * PHRASES.length)];
    const barre = r() > 0.6;

    const corps =
      COMPOSITIONS[compo](r, TAILLE, H, st.trait, { barre }) +
      (densite ? eclaboussures(r, TAILLE, H, st.encres, densite, taille, [0.1, 0.9, 0.14, 0.72]) : '') +
      `<text x="${TAILLE * 0.5}" y="${H * 0.9}" font-family="${st.police}" font-size="${TAILLE * 0.05}" font-weight="${st.poids}" letter-spacing="${TAILLE * 0.004}" fill="${st.trait}" text-anchor="middle">${phrase.toUpperCase()}</text>`;

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${TAILLE}" height="${H}" viewBox="0 0 ${TAILLE} ${H}"><rect width="${TAILLE}" height="${H}" fill="${st.fond}"/>${corps}</svg>`;
    const nom = `${String(n).padStart(3, '0')}-${styleNom}-${compo}-${sang}.png`;
    await page.setContent(svg, { waitUntil: 'load' });
    await page.screenshot({ path: path.join(SORTIE, nom) });
    index.push({ numero: n, style: styleNom, composition: compo, sang, phrase, barre, fichier: nom });
    if (n % 20 === 0) console.log(`  ${n}/${NB}`);
  }

  fs.writeFileSync(path.join(SORTIE, 'index.json'), JSON.stringify(index, null, 2));
  await nav.close();

  // planche de choix
  let html =
    '<!doctype html><meta charset="utf-8"><title>dead2me, propositions</title>' +
    '<style>body{background:#0d0d0d;color:#eee;font-family:system-ui,sans-serif;padding:24px}' +
    '.g{display:flex;flex-wrap:wrap;gap:12px}figure{margin:0;width:210px}' +
    'img{width:100%;border:1px solid #262626}figcaption{font-size:11px;color:#888;margin-top:4px}' +
    'b{color:#ddd}</style>' +
    `<h1>dead2me — ${index.length} propositions</h1>` +
    '<p style="color:#888;font-size:13px">Note les numéros que tu gardes. Les retenus seront ' +
    'photographiés sur vêtement réel via Printful.</p><div class="g">';
  for (const p of index) {
    html += `<figure><img src="propositions/${p.fichier}"><figcaption><b>${String(p.numero).padStart(3, '0')}</b> ${p.style} · ${p.composition} · sang ${p.sang}</figcaption></figure>`;
  }
  html += '</div>';
  fs.writeFileSync(path.join(ICI, 'propositions.html'), html);

  console.log(`\n${index.length} propositions dans ${SORTIE}`);
  console.log(`planche de choix : contenu/propositions.html`);
};

main().catch((e) => {
  console.error(`ECHEC : ${e.message}`);
  process.exit(1);
});
