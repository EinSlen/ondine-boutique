/**
 * Générateur all-over print : couvre TOUT le vêtement, comme live2die.
 *
 * POURQUOI CE SCRIPT REMPLACE L'IMPRIMÉ DEVANT : un imprimé classique est un rectangle sur
 * la poitrine, les éclaboussures ne peuvent pas déborder sur les manches ni sur le bas. Sur
 * les pièces de live2die les projections couvrent le vêtement entier, parce qu'ils peignent
 * un vêtement fini. La seule technique POD équivalente est l'all-over print, qui imprime le
 * tissu à plat avant la couture, avec SIX panneaux séparés :
 *   devant 2636x2636, dos 2640x2633, manche gauche et droite, poche, capuche, en 3000x3000.
 * On envoie un fichier par panneau, tous couverts de projections, la scène sur le devant.
 *
 * Usage :
 *   node aop.mjs --lot organique          rouge sang, sans crâne
 *   node aop.mjs --lot pub                encre claire, validable en publicité
 *   node aop.mjs --nb 4
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { navigateur } from './navigateur.mjs';

const ICI = path.dirname(fileURLToPath(import.meta.url));
const SILS = path.join(ICI, 'silhouettes');

const arg = (n, d) => {
  const i = process.argv.indexOf(`--${n}`);
  return i > -1 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--')
    ? process.argv[i + 1]
    : d;
};
const LOT = arg('lot', 'organique');
const NB = parseInt(arg('nb', '4'), 10);
const DEBUT = parseInt(arg('debut', '1'), 10);
const SORTIE = path.join(ICI, `aop-${LOT}`);

// Panneaux du sweat à capuche all-over print recyclé, relevés sur l'API Printful.
const PANNEAUX = [
  { placement: 'front', w: 2636, h: 2636, scene: true },
  { placement: 'back', w: 2640, h: 2633, scene: false },
  { placement: 'sleeve_left', w: 3000, h: 3000, scene: false },
  { placement: 'sleeve_right', w: 3000, h: 3000, scene: false },
  { placement: 'pocket', w: 3000, h: 3000, scene: false },
  { placement: 'hood', w: 3000, h: 3000, scene: false },
];

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

const PIECES = {
  // Coureuse a queue de cheval, foulee ample: c'est la silhouette que live2die utilise,
  // identifiee sur une capture d'ecran de leur fichier de travail.
  court: 'a-classer-223754.svg',
  // Silhouette PLEINE, uniformement noire. L'ancienne (181678) etait une gravure a
  // hachures blanches: ca lit comme un croquis, pas comme un pochoir. Sur les pieces de
  // reference les deux personnages sont des masses pleines.
  effondre: 'a-classer-320868.svg',
  croix: 'a-classer-295815.svg',
  cimetiere: 'a-classer-353556.svg',
  // le crâne est retiré du tirage, Valentin ne le veut pas
};

const placer = (nomFichier, x, y, largeur, hauteur, couleur, opts = {}) => {
  const brut = fs.readFileSync(path.join(SILS, nomFichier), 'utf8');
  const vb = brut.match(/viewBox="([^"]+)"/);
  const w = brut.match(/\swidth="([\d.]+)/);
  const h = brut.match(/\sheight="([\d.]+)/);
  const viewBox = vb ? vb[1] : `0 0 ${w ? w[1] : 100} ${h ? h[1] : 100}`;
  let interieur = brut
    .replace(/^[\s\S]*?<svg[^>]*>/, '')
    .replace(/<\/\s*svg\s*>\s*$/, '')
    .replace(/<metadata[\s\S]*?<\/\s*metadata\s*>/g, '')
    .replace(/<title[\s\S]*?<\/\s*title\s*>/g, '')
    .replace(/<defs[\s\S]*?<\/\s*defs\s*>/g, '')
    .replace(/<sodipodi:namedview[\s\S]*?\/>/g, '')
    .replace(/<rect[^>]*(?:width="100%"|height="100%")[^>]*\/?>/g, '');
  const ouverts = (interieur.match(/<g[\s>]/g) || []).length;
  const fermes = (interieur.match(/<\/\s*g\s*>/g) || []).length;
  if (ouverts > fermes) interieur += '</g>'.repeat(ouverts - fermes);
  const [vx, vy, vw, vh] = viewBox.trim().split(/[\s,]+/).map(Number);
  const k = Math.min(largeur / vw, hauteur / vh);
  const dx = x + (largeur - vw * k) / 2;
  const dy = y + (hauteur - vh * k) / 2;
  const mir = opts.miroir ? `translate(${(vw * k).toFixed(2)} 0) scale(-1 1) ` : '';
  return `<g color="${couleur}" fill="${couleur}" transform="translate(${dx.toFixed(2)} ${dy.toFixed(2)}) ${mir}scale(${k.toFixed(5)}) translate(${(-vx).toFixed(2)} ${(-vy).toFixed(2)})">${interieur}</g>`;
};

/**
 * Projections : de VRAIES traces de peinture, pas des formes geometriques.
 *
 * Mes ellipses et queues triangulaires se voyaient tout de suite comme du dessin vectoriel.
 * Ici on tamponne des eclaboussures reelles (Openclipart, CC0) a des echelles, rotations et
 * miroirs varies. Bords dechires, eclats irreguliers, c'est ce qui fait lire de la peinture.
 * La densite est par million de pixels pour que la couverture soit la meme sur un panneau de
 * manche 3000x3000 et sur le devant 2636x2636.
 */
const TACHES = fs
  .readdirSync(path.join(ICI, 'taches'))
  .filter((f) => f.endsWith('.svg'))
  .map((f) => {
    const brut = fs.readFileSync(path.join(ICI, 'taches', f), 'utf8');
    const vb = brut.match(/viewBox="([^"]+)"/);
    let interieur = brut
      .replace(/^[\s\S]*?<svg[^>]*>/, '')
      .replace(/<\/\s*svg\s*>\s*$/, '')
      .replace(/<metadata[\s\S]*?<\/\s*metadata\s*>/g, '')
      .replace(/<title[\s\S]*?<\/\s*title\s*>/g, '')
      .replace(/<defs[\s\S]*?<\/\s*defs\s*>/g, '')
      .replace(/<rect[^>]*(?:width="100%"|height="100%")[^>]*\/?>/g, '');
    const o = (interieur.match(/<g[\s>]/g) || []).length;
    const c = (interieur.match(/<\/\s*g\s*>/g) || []).length;
    if (o > c) interieur += '</g>'.repeat(o - c);
    // on force la couleur: les fichiers sources sont noirs, on veut du rouge ou du gris
    interieur = interieur
      .replace(/fill="(?!none)[^"]*"/g, 'fill="currentColor"')
      .replace(/fill:\s*(?!none)[^;"}]+/g, 'fill:currentColor');
    const [vx, vy, vw, vh] = (vb ? vb[1] : '0 0 100 100').trim().split(/[\s,]+/).map(Number);
    return { interieur, vx, vy, vw, vh };
  });

/**
 * `reserve` est un rectangle que les grosses taches evitent, en fraction du panneau.
 * Sans lui une trace passe devant les personnages et les mange, verifie sur maquette.
 * La bruine fine, elle, passe partout: c'est ce qui garde le vetement homogene.
 */
const projections = (r, w, h, couleurs, densite, reserve = null, taille = [0.09, 0.3]) => {
  if (!TACHES.length) return '';
  const surface = (w * h) / 1e6;
  let s = '';
  const nb = Math.round(3.2 * densite * surface);
  for (let i = 0; i < nb; i++) {
    const t = TACHES[Math.floor(r() * TACHES.length)];
    const ech = Math.sqrt(w * h) * (taille[0] + r() * (taille[1] - taille[0]));
    const k = ech / Math.max(t.vw, t.vh);
    let x = r() * w;
    let y = r() * h;
    if (reserve) {
      // on retire jusqu'a 12 essais avant d'abandonner la tache, pour ne pas boucler
      let essais = 0;
      while (
        essais < 12 &&
        x > reserve.x0 * w &&
        x < reserve.x1 * w &&
        y > reserve.y0 * h &&
        y < reserve.y1 * h
      ) {
        x = r() * w;
        y = r() * h;
        essais++;
      }
      if (essais >= 12) continue;
    }
    const rot = r() * 360;
    const mir = r() > 0.5 ? -1 : 1;
    const c = couleurs[Math.floor(r() * couleurs.length)];
    s +=
      `<g color="${c}" fill="${c}" opacity="${(0.72 + r() * 0.28).toFixed(2)}" ` +
      `transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${rot.toFixed(0)}) ` +
      `scale(${(k * mir).toFixed(5)} ${k.toFixed(5)}) ` +
      `translate(${(-t.vx - t.vw / 2).toFixed(1)} ${(-t.vy - t.vh / 2).toFixed(1)})">${t.interieur}</g>`;
  }
  // fine bruine autour, ce sont les micro-gouttes qu'on voit sur leurs pieces
  const fines = Math.round(90 * densite * surface);
  for (let i = 0; i < fines; i++) {
    const c = couleurs[Math.floor(r() * couleurs.length)];
    s += `<circle cx="${(r() * w).toFixed(1)}" cy="${(r() * h).toFixed(1)}" r="${(Math.sqrt(w * h) * (0.0005 + r() * 0.0022)).toFixed(2)}" fill="${c}" opacity="${(0.45 + r() * 0.45).toFixed(2)}"/>`;
  }
  return s;
};

const REGLAGES = {
  // Beaucoup de sang: grandes traces, vetement couvert. C'est la version live2die.
  organique: {
    fond: '#101012',
    trait: '#f2efe9',
    encres: ['#8e0f14', '#a3141a', '#6d0b10', '#c01a20'],
    densite: 0.55,
    tailleTache: [0.09, 0.3],
    barre: true,
    phrases: ['dead to me', 'she left twice', 'don’t wait up', 'nothing after', 'you did this', 'no one came'],
  },
  // Un tout petit peu de sang: quelques gouttes eparses seulement, comme sur les pieces de
  // RawSoult. Les traces restent petites, le vetement reste lisible.
  discret: {
    fond: '#101012',
    trait: '#f2efe9',
    encres: ['#8e0f14', '#6d0b10'],
    densite: 0.12,
    tailleTache: [0.025, 0.07],
    barre: false,
    phrases: ['dead to me', 'no reply', 'still nothing', 'gone by morning', 'told you so', 'end of it'],
  },
  // Sans rouge du tout, validable en publicite.
  pub: {
    fond: '#101012',
    trait: '#f2efe9',
    encres: ['#d8d4cb', '#a8a49b', '#8f9aa3'],
    densite: 0.3,
    tailleTache: [0.05, 0.16],
    barre: false,
    phrases: ['dead to me', 'no reply', 'you first', 'still nothing', 'last seen online', 'told you so'],
  },
};

/**
 * La scène est confinée à la BANDE CENTRALE du panneau. Le panneau devant d'un all-over
 * print couvre le torse ET les manches : une scène pleine largeur voit ses personnages
 * partir sur les manches et se faire couper par les coutures, vérifié sur maquette.
 * La zone de face utile va d'environ 26 % à 74 % de la largeur.
 */
const scene = (r, w0, h, cfg, phrase) => {
  const type = ['duo', 'symbole'][Math.floor(r() * 2)];
  const t = cfg.trait;
  const marge = w0 * 0.26;
  const w = w0 - marge * 2;
  const dx = (x) => marge + x;
  if (type === 'symbole') {
    const nom = ['croix', 'cimetiere'][Math.floor(r() * 2)];
    const grand = nom === 'cimetiere';
    return (
      placer(PIECES[nom], dx(grand ? 0 : w * 0.16), h * 0.16, grand ? w : w * 0.68, grand ? h * 0.24 : h * 0.36, t) +
      placer(PIECES.effondre, dx(w * 0.22), h * (grand ? 0.42 : 0.48), w * 0.56, h * 0.28, t) +
      texte(dx(w * 0.5), h, phrase, t, w)
    );
  }
  // Tailles equilibrees: les deux personnages font la meme hauteur, sinon l'un ecrase
  // l'autre et la scene perd son sens de face a face.
  const hs = h * 0.4;
  const y = h * 0.2;
  const barre = cfg.barre
    ? `<rect x="${dx(w * 0.487)}" y="${y + hs * 0.1}" width="${w * 0.022}" height="${hs * 0.8}" fill="${t}"/>`
    : '';
  return (
    placer(PIECES.court, dx(w * 0.02), y, w * 0.42, hs, t, { miroir: true }) +
    barre +
    placer(PIECES.effondre, dx(w * 0.56), y, w * 0.42, hs, t) +
    texte(dx(w * 0.5), h, phrase, t, w)
  );
};

const texte = (cx, h, phrase, couleur, w) => {
  const taille = w * 0.085;
  return `<text x="${cx}" y="${h * 0.66}" font-family="Arial Black, Arial, sans-serif" font-size="${taille}" font-weight="900" letter-spacing="${taille * 0.08}" fill="${couleur}" text-anchor="middle">${phrase.toUpperCase()}</text>`;
};

const main = async () => {
  fs.mkdirSync(SORTIE, { recursive: true });
  const cfg = REGLAGES[LOT];
  if (!cfg) throw new Error(`--lot doit valoir pub ou organique`);

  const { default: puppeteer } = await import('puppeteer-core');
  const nav = await puppeteer.launch({
    executablePath: navigateur(),
    headless: true,
    args: ['--no-sandbox'],
  });
  const page = await nav.newPage();

  console.log(`lot ${LOT}, ${NB} pièces, ${PANNEAUX.length} panneaux chacune`);
  const index = [];

  for (let i = 0; i < NB; i++) {
    const numero = DEBUT + i;
    const phrase = cfg.phrases[(numero - 1) % cfg.phrases.length];
    const fichiers = {};

    for (const p of PANNEAUX) {
      // graine par piece ET par panneau: chaque panneau a ses propres taches, mais la
      // densite est identique partout pour que le vetement paraisse d'un seul geste
      const r = alea(numero * 7919 + p.placement.length * 31 + p.w);
      const corps =
        (p.scene ? scene(r, p.w, p.h, cfg, phrase) : '') +
        projections(
          r,
          p.w,
          p.h,
          cfg.encres,
          cfg.densite,
          // la scene occupe la bande centrale haute: on la protege des grosses traces
          p.scene ? { x0: 0.24, x1: 0.76, y0: 0.14, y1: 0.62 } : null,
          cfg.tailleTache,
        );
      // En all-over print, le tissu de base est BLANC et c'est l'encre qui fait toute la
      // couleur du vetement. Sans fond imprime, on obtient un sweat blanc taché. On peint
      // donc le fond en noir sur chaque panneau, puis la scene en clair par-dessus.
      const svg =
        `<svg xmlns="http://www.w3.org/2000/svg" width="${p.w}" height="${p.h}" viewBox="0 0 ${p.w} ${p.h}">` +
        `<rect width="${p.w}" height="${p.h}" fill="${cfg.fond}"/>${corps}</svg>`;

      await page.setViewport({ width: p.w, height: p.h, deviceScaleFactor: 1 });
      await page.setContent(svg, { waitUntil: 'load' });
      const nom = `${String(numero).padStart(3, '0')}-${p.placement}.png`;
      await page.screenshot({ path: path.join(SORTIE, nom) });
      fichiers[p.placement] = nom;
    }

    const ko = Object.values(fichiers).reduce(
      (a, f) => a + fs.statSync(path.join(SORTIE, f)).size,
      0,
    );
    console.log(`  pièce ${String(numero).padStart(3, '0')} « ${phrase} » ${PANNEAUX.length} panneaux, ${Math.round(ko / 1024)} ko`);
    index.push({ numero, lot: LOT, phrase, fichiers });
  }

  fs.writeFileSync(path.join(SORTIE, 'index.json'), JSON.stringify(index, null, 2));
  await nav.close();
  console.log(`\n${index.length} pièces dans ${SORTIE}`);
  console.log(`Chaque pièce a ses 6 panneaux : le vêtement sera couvert d'un bout à l'autre.`);
};

main().catch((e) => {
  console.error(`ECHEC : ${e.message}`);
  process.exit(1);
});
