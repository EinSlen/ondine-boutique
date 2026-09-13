/**
 * La série dead2me : la silhouette et la phrase dans la même main.
 *
 * C'est la fusion des deux moteurs validés. `phrases.mjs` avait la bonne typographie mais
 * pas d'image ; `recit.mjs` avait les bonnes silhouettes mais un texte faible. Ici les
 * silhouettes CC0 passent sous le MÊME filtre d'encre que le texte, donc elles cessent de
 * lire comme du vecteur importé et deviennent de la peinture, comme le reste.
 *
 * Deux règles de composition :
 *   1. la phrase et la scène disent la même chose. Chaque phrase porte un rôle dans
 *      `encre.mjs` (assis, couple, court, attend) et seules les scènes de ce rôle sont
 *      tirées. Une phrase de rupture sur une silhouette assise ne raconte rien.
 *   2. la scène occupe le haut, la phrase le bas. C'est la lecture d'un imprimé de
 *      poitrine, et c'est aussi ce qui se lit sur une vidéo verticale.
 *
 * Usage :
 *   node serie.mjs --nb 40
 *   node serie.mjs --nb 40 --registre bloc
 *   node serie.mjs --seul 007 --taille 3600 --vers serie-impression
 *                                                 fichier d'impression d'une seule pièce
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  ajusterEnPage,
  alea,
  coulures,
  filtres,
  FONTES,
  largeur,
  lignes,
  mot,
  PALETTES,
  PHRASES,
  prechauffer,
  recadrer,
  surete,
  rature,
  taches,
} from './encre.mjs';
import { parRole, placer, tirer } from './figures.mjs';
// Les objets de l'absence n'existent pas dans le fonds libre : une chaise RENVERSEE, un lit
// defait d'un seul cote, une valise a la porte sont des etats, pas des objets. Ils sont
// dessines en code dans objets.mjs.
import * as OBJ from './objets.mjs';
import { navigateur } from './navigateur.mjs';

const ICI = path.dirname(fileURLToPath(import.meta.url));
const arg = (n, d) => {
  const i = process.argv.indexOf(`--${n}`);
  return i > -1 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--')
    ? process.argv[i + 1]
    : d;
};
const NB = parseInt(arg('nb', '40'), 10);
const REGISTRE_FIXE = arg('registre', null);
const SEUL = arg('seul', null);
const W = parseInt(arg('taille', '900'), 10);
// Un bandana est carre, un poster est en 2:3, un imprime de poitrine en 4:5. Toutes les
// positions du moteur sont exprimees en fractions de H, donc le meme code sort les trois.
const FORMATS = { affiche: 1.25, carre: 1, poster: 1.5 };
const FORMAT = arg('format', 'affiche');
const H = Math.round(W * (FORMATS[FORMAT] || 1.25));
const ECH = W / 900;
// Un imprime PLACE sur un vetement noir ne doit avoir AUCUN fond : un rectangle imprime
// lit comme une piece rapportee cousue dessus. Le fond ne se garde que pour l'impression
// integrale, ou le tissu de base est blanc et ou c'est l'encre qui fait la couleur.
const SANS_FOND = process.argv.includes('--sansFond');
// sur les objets qui s'enroulent, les bords se perdent : --sur 0.8 resserre le dessin
surete(parseFloat(arg('sur', '1')));
const PALETTE_NOM = arg('palette', null);
const VERS = arg('vers', null);
const SORTIE = path.join(ICI, VERS || 'serie');

const ASSIS = parRole('assis');
const COUPLE = parRole('couple');
const COURT = parRole('court');
const SYMBOLE = parRole('symbole');
// Le vocabulaire d'objets, celui qui manquait. Un banc vide raconte une absence mieux
// qu'une silhouette : il n'y a personne dessus, et c'est tout le sujet.
const BANC = parRole('banc');
const LUNE = parRole('lune');
const TOMBE = parRole('tombe');
const PAYSAGE = parRole('paysage');
const OISEAU = parRole('oiseau');
const ROSE = parRole('rose');
const CLOPE = parRole('clope');
const GRILLE = parRole('grille');
const COURONNE = parRole('couronne');
const TABLE = parRole('table');
const CHAISES = parRole('chaises');
const CADRE = parRole('cadre');

// ------------------------------------------------------------------ les scènes

/**
 * Chaque scène occupe la bande haute et rend des silhouettes déjà encrées. Le filtre est
 * le doux : l'agressif ronge trop une grande masse pleine et la troue comme une dentelle.
 */
const encrer = (svg) => `<g filter="url(#encreDouce)">${svg}</g>`;

const SCENES = {
  /** Le couple à gauche, l'effondrement à droite : avant et après, dans la même image. */
  avantApres: (r, p) =>
    encrer(
      placer(tirer(r, COUPLE), W * 0.02, H * 0.08, W * 0.46, H * 0.44, p.encre) +
        placer(tirer(r, ASSIS), W * 0.53, H * 0.11, W * 0.45, H * 0.41, p.encre),
    ),

  /** Le couple seul, en grand : ce qui a été perdu, sans commentaire. */
  coupleSeul: (r, p) => encrer(placer(tirer(r, COUPLE), W * 0.16, H * 0.06, W * 0.68, H * 0.5, p.encre)),

  /** L'effondré seul, décentré, beaucoup de vide autour. */
  effondre: (r, p) =>
    encrer(placer(tirer(r, ASSIS), W * (r() > 0.5 ? 0.08 : 0.45), H * 0.06, W * 0.47, H * 0.51, p.encre)),

  /** Le couple minuscule en haut, l'effondré en grand dessous : le souvenir et le présent. */
  memoire: (r, p) =>
    encrer(
      placer(tirer(r, COUPLE), W * 0.34, H * 0.04, W * 0.29, H * 0.17, p.encre) +
        placer(tirer(r, ASSIS), W * 0.27, H * 0.22, W * 0.46, H * 0.35, p.encre),
    ),

  /** Celle qui part, celui qui reste assis. La scène de rupture. */
  fuite: (r, p) =>
    encrer(
      placer(tirer(r, COURT), W * 0.01, H * 0.1, W * 0.44, H * 0.42, p.encre, true) +
        placer(tirer(r, ASSIS), W * 0.54, H * 0.12, W * 0.44, H * 0.4, p.encre),
    ),

  /** Celle qui part, seule et en grand : personne à qui parler. */
  depart: (r, p) =>
    encrer(placer(tirer(r, COURT), W * (r() > 0.5 ? 0.07 : 0.46), H * 0.06, W * 0.47, H * 0.51, p.encre, r() > 0.5)),

  /** Une rangée de couples minuscules, et un seul effondré dessous : tout le monde sauf moi. */
  foule: (r, p) => {
    const nb = 4 + Math.floor(r() * 2);
    let s = '';
    for (let i = 0; i < nb; i++) {
      s += placer(tirer(r, COUPLE), W * (0.04 + (i * 0.92) / nb), H * 0.05, (W * 0.92) / nb - W * 0.02, H * 0.15, p.encre);
    }
    return encrer(s + placer(tirer(r, ASSIS), W * 0.29, H * 0.22, W * 0.42, H * 0.34, p.encre));
  },

  /** L'effondré minuscule dans un coin, le reste vide. La pièce la plus silencieuse. */
  loin: (r, p) =>
    encrer(placer(tirer(r, ASSIS), W * (r() > 0.5 ? 0.09 : 0.63), H * 0.3, W * 0.28, H * 0.26, p.encre)),

  /** La frise de croix en bandeau, l'effondré dessous. */
  frise: (r, p) =>
    encrer(
      placer(SYMBOLE[SYMBOLE.length - 1], W * 0.04, H * 0.06, W * 0.92, H * 0.14, p.encre) +
        placer(tirer(r, ASSIS), W * 0.3, H * 0.24, W * 0.4, H * 0.32, p.encre),
    ),

  /** Le banc vide, en grand et bas dans le cadre. Personne dessus, c'est tout le sujet. */
  bancSeul: (r, p) => encrer(placer(tirer(r, BANC), W * 0.06, H * 0.24, W * 0.88, H * 0.3, p.encre)),

  /** La lune en haut, l'effondré petit dessous : la nuit qui ne finit pas. */
  sousLaLune: (r, p) =>
    encrer(
      placer(tirer(r, LUNE), W * 0.3, H * 0.04, W * 0.4, H * 0.26, p.encre) +
        placer(tirer(r, ASSIS), W * 0.34, H * 0.32, W * 0.32, H * 0.25, p.encre),
    ),

  /** Une frise de cimetière en bande basse, l'effondré au-dessus. */
  horizon: (r, p) =>
    encrer(
      placer(tirer(r, ASSIS), W * 0.32, H * 0.05, W * 0.36, H * 0.3, p.encre) +
        placer(tirer(r, PAYSAGE), W * 0.02, H * 0.37, W * 0.96, H * 0.2, p.encre),
    ),

  /** Une tombe seule, en grand. Le registre le plus dur du lot. */
  tombeSeule: (r, p) => encrer(placer(tirer(r, TOMBE), W * 0.16, H * 0.06, W * 0.68, H * 0.48, p.encre)),

  /** La rose seule. La seule pièce douce de la série. */
  roseSeule: (r, p) => encrer(placer(tirer(r, ROSE), W * 0.28, H * 0.05, W * 0.44, H * 0.5, p.encre)),

  /** La cigarette posée, en travers, et beaucoup de vide. */
  clopeSeule: (r, p) => encrer(placer(tirer(r, CLOPE), W * 0.08, H * 0.26, W * 0.84, H * 0.2, p.encre)),

  /** Le couple attablé en haut, l'effondré en grand dessous : le dîner d'avant. */
  tableSouvenir: (r, p) =>
    encrer(
      placer(tirer(r, TABLE), W * 0.28, H * 0.04, W * 0.44, H * 0.19, p.encre) +
        placer(tirer(r, ASSIS), W * 0.28, H * 0.24, W * 0.44, H * 0.33, p.encre),
    ),

  /** L'oiseau qui part, l'effondré qui reste. */
  oiseauQuiPart: (r, p) =>
    encrer(
      placer(tirer(r, OISEAU), W * 0.56, H * 0.05, W * 0.4, H * 0.22, p.encre) +
        placer(tirer(r, ASSIS), W * 0.06, H * 0.2, W * 0.42, H * 0.37, p.encre),
    ),

  /** La grille fermée, et l'effondré devant. */
  grilleFermee: (r, p) =>
    encrer(
      placer(tirer(r, GRILLE), W * 0.22, H * 0.04, W * 0.56, H * 0.34, p.encre) +
        placer(tirer(r, ASSIS), W * 0.34, H * 0.32, W * 0.32, H * 0.25, p.encre),
    ),

  /** La couronne funéraire, seule, centrée. */
  couronneSeule: (r, p) => encrer(placer(tirer(r, COURONNE), W * 0.26, H * 0.07, W * 0.48, H * 0.44, p.encre)),

  /** La rangée de chaises occupées, et personne en dessous. */
  chaisesPleines: (r, p) => encrer(placer(tirer(r, CHAISES), W * 0.05, H * 0.1, W * 0.9, H * 0.42, p.encre)),

  /** Un cadre de barbelés autour du vide, la phrase dessous. */
  barbele: (r, p) =>
    encrer(
      placer(tirer(r, CADRE), W * 0.16, H * 0.05, W * 0.68, H * 0.44, p.encre) +
        placer(tirer(r, ASSIS), W * 0.38, H * 0.2, W * 0.24, H * 0.19, p.encre),
    ),

  /** La chaise renversée. L'objet est banal, c'est l'état qui raconte. */
  chaiseRenversee: (r, p) => encrer(OBJ.chaiseRenversee(r, W * 0.06, H * 0.1, W * 0.88, H * 0.44, p.encre)),

  /** La valise posée dans l'encadrement de la porte. Le départ juste avant qu'il ait lieu. */
  valisePorte: (r, p) =>
    encrer(
      OBJ.porte(r, W * 0.1, H * 0.04, W * 0.5, H * 0.5, p.encre) +
        OBJ.valise(r, W * 0.56, H * 0.28, W * 0.36, H * 0.28, p.encre),
    ),

  /** La valise seule, en grand, au milieu du vide. */
  valiseSeule: (r, p) => encrer(OBJ.valise(r, W * 0.24, H * 0.12, W * 0.52, H * 0.42, p.encre)),

  /** Le lit vu de dessus, défait d'un seul côté. Un seul oreiller est creusé. */
  litDefait: (r, p) => encrer(OBJ.litDefait(r, W * 0.04, H * 0.08, W * 0.92, H * 0.46, p.encre)),

  /** La place vide à table, avec la chaise derrière et le verre renversé. */
  placeVide: (r, p) => encrer(OBJ.placeVide(r, W * 0.06, H * 0.04, W * 0.88, H * 0.52, p.encre, p.fond)),

  /** Le téléphone posé écran contre la table. */
  telephone: (r, p) => encrer(OBJ.telephoneRetourne(r, W * 0.16, H * 0.1, W * 0.68, H * 0.42, p.encre)),

  /** La chaise vide, debout, et l'effondré à côté : la place qui reste. */
  chaiseVide: (r, p) =>
    encrer(
      OBJ.chaiseVide(r, W * 0.08, H * 0.12, W * 0.34, H * 0.42, p.encre) +
        placer(tirer(r, ASSIS), W * 0.52, H * 0.14, W * 0.4, H * 0.38, p.encre),
    ),

  /** La chaise renversée, et l'effondré dessous. Le départ et ce qu'il laisse. */
  crash: (r, p) =>
    encrer(
      OBJ.chaiseRenversee(r, W * 0.06, H * 0.04, W * 0.88, H * 0.26, p.encre) +
        placer(tirer(r, ASSIS), W * 0.32, H * 0.3, W * 0.36, H * 0.27, p.encre),
    ),

  /** La croix, et l'effondré dessous. Le registre le plus dur de la sélection. */
  croix: (r, p) =>
    encrer(
      placer(tirer(r, SYMBOLE), W * 0.31, H * 0.03, W * 0.38, H * 0.27, p.encre) +
        placer(tirer(r, ASSIS), W * 0.31, H * 0.31, W * 0.38, H * 0.27, p.encre),
    ),
};

/**
 * Une phrase ne va pas avec n'importe quelle image : chaque rôle a ses scènes.
 *
 * Deux rôles n'ont plus d'asset utilisable et retombent sur les scènes validées :
 *   - `court` n'a que des COUREUSES, et une coureuse raconte du sport, pas un départ. Il
 *     manque une femme qui s'éloigne EN MARCHANT, à acheter en licence étendue.
 *   - `attend` n'a plus rien depuis que la silhouette massive a été écartée : elle lisait
 *     comme un vigile. Il manque une personne debout seule.
 *
 * `--coureurs` réactive les scènes de course, pour comparer une fois l'asset acheté.
 */
const COUREURS = process.argv.includes('--coureurs');
const SCENES_PAR_ROLE = {
  assis: ['effondre', 'memoire', 'croix', 'loin', 'frise', 'sousLaLune', 'horizon', 'tableSouvenir', 'oiseauQuiPart', 'chaisesPleines', 'barbele', 'chaiseRenversee', 'crash', 'litDefait', 'telephone'],
  couple: ['coupleSeul', 'avantApres', 'memoire', 'foule', 'tableSouvenir', 'roseSeule', 'couronneSeule', 'litDefait', 'placeVide', 'chaiseVide'],
  court: COUREURS
    ? ['fuite', 'depart', 'avantApres']
    : ['avantApres', 'memoire', 'coupleSeul', 'foule', 'oiseauQuiPart', 'bancSeul', 'valisePorte', 'valiseSeule', 'chaiseRenversee'],
  attend: ['memoire', 'effondre', 'loin', 'bancSeul', 'horizon', 'grilleFermee', 'clopeSeule', 'sousLaLune', 'tombeSeule', 'telephone', 'placeVide', 'chaiseVide'],
};

// ------------------------------------------------------------------ les registres de texte

const BAS = 0.72;

const signature = (r, p) =>
  SANS_FOND
    ? ''
    : mot(W * (0.5 + (r() - 0.5) * 0.34), SANS_FOND ? H * 0.86 : H * 0.955, 'dead2me', W * 0.03, FONTES.main, p.encre, {
    rot: (r() - 0.5) * 5,
    doux: true,
    opacite: 0.7,
  });

const REGISTRES = {
  /** Condensé lourd, deux lignes maximum : la phrase qui se lit de loin. */
  bloc: (r, p, ph) => {
    const ls = lignes(ph.t, 2);
    const taille = Math.min(W * 0.15, (W * 1.5) / Math.max(...ls.map((l) => l.length)));
    let s = '';
    ls.forEach((l, i) => {
      s += mot(W * 0.5, H * BAS + i * taille * 0.98, l.toUpperCase(), taille, FONTES.condense, p.encre, {
        esp: taille * 0.03,
        poids: 700,
        tient: W * 0.86,
        groupe: 'bloc',
      });
    });
    const bas = H * BAS + (ls.length - 1) * taille * 0.98;
    s += coulures(r, W * 0.5, bas, largeur(ls[ls.length - 1], taille, FONTES.condense) * 0.85, 2 + Math.floor(r() * 3), W * 0.01, p.accent);
    return s;
  },

  /** La phrase rayée : ce qui a été dit, puis retiré. */
  barre: (r, p, ph) => {
    const ls = lignes(ph.t, 2);
    const taille = Math.min(W * 0.145, (W * 1.45) / Math.max(...ls.map((l) => l.length)));
    let s = '';
    ls.forEach((l, i) => {
      const y = H * BAS + i * taille * 0.98;
      s += mot(W * 0.5, y, l.toUpperCase(), taille, FONTES.condense, p.encre, {
        esp: taille * 0.02,
        poids: 700,
        tient: W * 0.84,
        groupe: 'barre',
      });
      if (i === ls.length - 1) {
        const lg = largeur(l, taille, FONTES.condense);
        s += rature(r, W * 0.5 - lg * 0.6, W * 0.5 + lg * 0.6, y - taille * 0.35, W * 0.012, p.accent);
      }
    });
    return s;
  },

  /** À la main, penché, décentré : la note laissée sur la table. */
  manuscrit: (r, p, ph) => {
    const ls = lignes(ph.t, 2);
    const taille = Math.min(W * 0.135, (W * 1.35) / Math.max(...ls.map((l) => l.length)));
    const x = W * (0.46 + (r() - 0.5) * 0.2);
    let s = '';
    ls.forEach((l, i) => {
      s += mot(x + i * W * 0.04, H * BAS + i * taille * 1.16, l, taille, FONTES.main, p.encre, {
        rot: (r() - 0.5) * 6,
        doux: true,
        tient: W * 0.84,
        groupe: 'main',
      });
    });
    const bas = H * BAS + (ls.length - 1) * taille * 1.16;
    s += coulures(r, x, bas, largeur(ls[ls.length - 1], taille, FONTES.main), 2 + Math.floor(r() * 2), W * 0.008, p.accent);
    return s;
  },

  /** Serif italique, petit, très espacé : le registre le plus retenu. */
  serif: (r, p, ph) =>
    mot(W * 0.5, H * (BAS + 0.02), ph.t, W * 0.078, FONTES.serif, p.encre, {
      italique: true,
      doux: true,
      esp: W * 0.004,
      rot: (r() - 0.5) * 1.2,
      tient: W * 0.82,
    }),

  /** L'heure d'appel en mono sous la phrase : la preuve datée. */
  horodate: (r, p, ph) => {
    const ls = lignes(ph.t, 2);
    const taille = Math.min(W * 0.13, (W * 1.3) / Math.max(...ls.map((l) => l.length)));
    let s = '';
    ls.forEach((l, i) => {
      s += mot(W * 0.5, H * (BAS - 0.02) + i * taille * 0.98, l.toUpperCase(), taille, FONTES.condense, p.encre, {
        esp: taille * 0.03,
        poids: 700,
        tient: W * 0.84,
        groupe: 'horo',
      });
    });
    const bas = H * (BAS - 0.02) + (ls.length - 1) * taille * 0.98;
    const heures = ['02:41', '03:17', '04:12', '23:58', '01:04', '05:22'];
    s += mot(W * 0.5, bas + H * 0.06, `${heures[Math.floor(r() * heures.length)]}   no answer`, W * 0.038, FONTES.mono, p.accent, {
      doux: true,
      esp: W * 0.004,
      tient: W * 0.66,
    });
    return s;
  },
};

const NOMS_REGISTRES = Object.keys(REGISTRES);

// ------------------------------------------------------------------ production

const main = async () => {
  fs.mkdirSync(SORTIE, { recursive: true });
  if (!SEUL && !VERS) {
    for (const f of fs.readdirSync(SORTIE)) {
      if (f.endsWith('.png') || f === 'index.json') fs.unlinkSync(path.join(SORTIE, f));
    }
  }

  const { default: puppeteer } = await import('puppeteer-core');
  const nav = await puppeteer.launch({
    executablePath: navigateur(),
    headless: true,
    args: ['--no-sandbox', '--font-render-hinting=none'],
  });
  const page = await nav.newPage();
  await page.setViewport({ width: W, height: H, deviceScaleFactor: 1 });
  await prechauffer(page);

  const index = [];
  for (let i = 0; i < NB; i++) {
    const n = i + 1;
    if (SEUL && String(n).padStart(3, '0') !== SEUL.padStart(3, '0')) continue;
    const r = alea(n * 31607 + 17);
    const ph = PHRASES[i % PHRASES.length];
    // le tirage est consomme meme quand la palette est imposee, pour que les numeros de
    // piece restent les memes d'une passe a l'autre
    const tire = PALETTES[Math.floor(r() * PALETTES.length)];
    const p = PALETTE_NOM ? PALETTES.find((x) => x.nom === PALETTE_NOM) || tire : tire;
    const choix = SCENES_PAR_ROLE[ph.role] || ['effondre'];
    const scene = choix[Math.floor(r() * choix.length)];
    const registre = REGISTRE_FIXE || NOMS_REGISTRES[Math.floor(r() * NOMS_REGISTRES.length)];

    const corps =
      SCENES[scene](r, p) +
      taches(r, W, H, p, [BAS - 0.17, BAS + 0.24]) +
      REGISTRES[registre](r, p, ph) +
      signature(r, p);
    const svg =
      `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">` +
      filtres(r, W, ECH) +
      (SANS_FOND ? '' : `<rect width="${W}" height="${H}" fill="${p.fond}"/>`) +
      `<g id="contenu">${corps}</g>` +
      (SANS_FOND ? '' : `<rect width="${W}" height="${H}" filter="url(#grain)" opacity="0.055" style="mix-blend-mode:overlay"/>`) +
      '</svg>';

    const nom = `${String(n).padStart(3, '0')}-${scene}-${registre}-${p.nom}.png`;
    await page.setContent(svg, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(ajusterEnPage);
    // En impression, on recadre sur le dessin. Sans ça le fichier garde les marges de la
    // planche et Printful place un dessin minuscule au milieu d'un grand vêtement.
    const clip = SANS_FOND ? await page.evaluate(recadrer, W * 0.03) : null;
    await page.screenshot({ path: path.join(SORTIE, nom), omitBackground: SANS_FOND, ...(clip ? { clip } : {}) });
    index.push({ numero: n, phrase: ph.t, pub: ph.pub, role: ph.role, scene, registre, palette: p.nom, fichier: nom });
  }

  if (!SEUL) fs.writeFileSync(path.join(SORTIE, 'index.json'), JSON.stringify(index, null, 2));
  await nav.close();
  console.log(`${index.length} pièces dans ${SORTIE}`);
  console.log(`${index.filter((x) => x.pub).length} utilisables en publicité`);
};

main().catch((e) => {
  console.error(`ECHEC : ${e.message}`);
  process.exit(1);
});
