/**
 * Générateur de visuels dead2me, calqué sur les pièces réelles de live2die.
 *
 * RÈGLES RELEVÉES sur leurs pièces (« She moved on.. », « Skull cross », « Run away X Kurt ») :
 *   1. UNE SCÈNE, pas un motif répétitif. Des silhouettes noires pleines, sans contour.
 *   2. Deux personnages qui se répondent, séparés par une barre verticale. C'est le récit :
 *      quelqu'un s'en va d'un côté, quelqu'un s'effondre de l'autre.
 *   3. Un grand symbole central sur les pièces à un seul sujet (croix, crâne).
 *   4. Des éclaboussures projetées PARTOUT, pas seulement sur le graphisme : torse, manches,
 *      bas du vêtement. C'est ce qui fait lire le geste et pas l'imprimé.
 *   5. Deux couleurs, jamais plus : le noir des silhouettes, une seconde couleur pour les
 *      projections.
 *
 * CE QU'ON NE REPRODUIT PAS, et c'est un choix, pas un oubli : leurs projections sont rouge
 * sang, avec des impacts de balle et des têtes qui explosent. C'est exactement ce qui fait
 * refuser une publicité chez Meta comme chez TikTok, et leur compte principal a été banni à
 * 30 000 abonnés. On garde la composition, la violence du geste et le contraste, on remplace
 * le sang par de l'encre. La force vient du vide et du contraste, pas de la couleur.
 *
 * Usage :
 *   node pieces.mjs                      10 visuels
 *   node pieces.mjs --nb 20 --debut 11
 *   node pieces.mjs --scene duo          une seule composition
 *   node pieces.mjs --largeur 3600       résolution du fichier d'impression
 *
 * Sorties dans contenu/pieces/ :
 *   NNN-scene-devant.png   fond transparent, prêt pour l'impression devant
 *   NNN-scene-apercu.png   même visuel sur un fond de tissu, pour juger le rendu
 *   index.json             numéro, scène, phrase, graine
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { navigateur } from './navigateur.mjs';

const ICI = path.dirname(fileURLToPath(import.meta.url));
const SORTIE = path.join(ICI, 'pieces');

const arg = (n, d) => {
  const i = process.argv.indexOf(`--${n}`);
  return i > -1 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--')
    ? process.argv[i + 1]
    : d;
};
const NB = parseInt(arg('nb', '10'), 10);
const DEBUT = parseInt(arg('debut', '1'), 10);
const LARGEUR = parseInt(arg('largeur', '3000'), 10);
const SCENE_FIXE = arg('scene', null);

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

const NOIR = '#0a0a0a';
// seconde couleur, jamais rouge sang: l'encre garde le contraste sans le motif de refus
const ENCRES = ['#1a1a1a', '#2b2b2b', '#3a3f45', '#4a4038'];

/** Phrases dans le registre de la marque, sans arme ni mort explicite. */
const PHRASES = [
  'dead to me',
  'no reply',
  'you first',
  'still nothing',
  'she left twice',
  'last seen online',
  'read at 4am',
  'don’t wait up',
  'gone by morning',
  'nothing after',
  'told you so',
  'not my problem',
];

// ---------------------------------------------------------------- silhouettes
/**
 * Silhouettes dessinées en chemins pleins, jamais en contour. Une silhouette au trait
 * ressemble à un pictogramme, une silhouette pleine ressemble à un pochoir, et c'est le
 * pochoir qu'on veut.
 */
/**
 * Les silhouettes sont construites par SQUELETTE, pas dessinees a la main en courbes.
 * Dessiner un corps en Bezier a l'oeil donnait des membres desarticules et des pieds
 * detaches. Ici on definit des articulations, puis on epaissit chaque segment en capsule
 * (trait arrondi), ce qui garantit un corps toujours connecte et proportionne.
 * Proportions humaines: tete = 1/7,5 de la hauteur totale.
 */
const membre = (pts, ep, c) => {
  const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
  return `<path d="${d}" fill="none" stroke="${c}" stroke-width="${ep.toFixed(1)}" stroke-linecap="round" stroke-linejoin="round"/>`;
};

/**
 * @param pose  positions relatives des articulations, unite = hauteur du corps / 100
 * @param opts  cheveux longs, jupe, direction du regard
 */
const corps = (x, y, h, c, pose, opts = {}) => {
  const u = h / 100;
  const P = (nom) => [x + pose[nom][0] * u, y + pose[nom][1] * u];
  const ep = (v) => v * u;

  let s = '';
  // jambes
  s += membre([P('hancheG'), P('genouG'), P('chevilleG')], ep(5.5), c);
  s += membre([P('hancheD'), P('genouD'), P('chevilleD')], ep(5.5), c);
  // pieds, dans le prolongement de la cheville pour rester attaches
  s += membre([P('chevilleG'), P('piedG')], ep(4.5), c);
  s += membre([P('chevilleD'), P('piedD')], ep(4.5), c);
  // tronc: du bassin aux epaules, epais
  s += membre([P('bassin'), P('poitrine'), P('epaules')], ep(opts.jupe ? 15 : 13), c);
  if (opts.jupe) {
    const [bx, by] = P('bassin');
    s += `<path d="M ${(bx - 9 * u).toFixed(1)} ${(by - 2 * u).toFixed(1)} L ${(bx + 9 * u).toFixed(1)} ${(by - 2 * u).toFixed(1)} L ${(bx + 12 * u).toFixed(1)} ${(by + 12 * u).toFixed(1)} L ${(bx - 12 * u).toFixed(1)} ${(by + 12 * u).toFixed(1)} Z" fill="${c}"/>`;
  }
  // bras
  s += membre([P('epauleG'), P('coudeG'), P('mainG')], ep(4.2), c);
  s += membre([P('epauleD'), P('coudeD'), P('mainD')], ep(4.2), c);
  // cou et tete
  s += membre([P('epaules'), P('cou')], ep(5), c);
  const [tx, ty] = P('tete');
  const rt = 6.6 * u;
  s += `<ellipse cx="${tx.toFixed(1)}" cy="${ty.toFixed(1)}" rx="${(rt * 0.92).toFixed(1)}" ry="${rt.toFixed(1)}" fill="${c}"/>`;
  if (opts.cheveux) {
    // masse arrondie DERRIERE la tete, jamais devant: une courbe libre devant le visage
    // produisait un museau d'animal. Ici c'est un simple bloc arrondi decale.
    const sens = opts.cheveux === 'gauche' ? -1 : 1;
    const lx = tx - sens * rt * 0.45;
    s =
      `<ellipse cx="${lx.toFixed(1)}" cy="${(ty + rt * 0.15).toFixed(1)}" rx="${(rt * 0.95).toFixed(1)}" ry="${(rt * 1.15).toFixed(1)}" fill="${c}"/>` +
      `<path d="M ${(lx - rt * 0.85).toFixed(1)} ${(ty + rt * 0.2).toFixed(1)}
        q ${(rt * 0.2).toFixed(1)} ${(rt * 2.4).toFixed(1)} ${(-rt * 0.1).toFixed(1)} ${(rt * 3.4).toFixed(1)}
        l ${(rt * 1.5).toFixed(1)} 0
        q ${(rt * 0.25).toFixed(1)} ${(-rt * 1.6).toFixed(1)} ${(rt * 0.1).toFixed(1)} ${(-rt * 3.2).toFixed(1)} z" fill="${c}"/>` +
      s;
  }
  return s;
};

// Poses: coordonnees des articulations, y negatif = vers le haut depuis les pieds.
const POSES = {
  // marche de dos, qui s'eloigne
  part: {
    tete: [0, -86], cou: [0, -78], epaules: [0, -74], poitrine: [0, -62], bassin: [0, -48],
    epauleG: [-7, -73], coudeG: [-11, -60], mainG: [-9, -46],
    epauleD: [7, -73], coudeD: [11, -60], mainD: [9, -46],
    hancheG: [-5, -47], genouG: [-9, -25], chevilleG: [-11, -4], piedG: [-16, -1],
    hancheD: [5, -47], genouD: [8, -25], chevilleD: [7, -4], piedD: [13, -1],
  },
  // course, jambes ecartees, buste penche
  court: {
    tete: [8, -86], cou: [6, -78], epaules: [4, -74], poitrine: [2, -62], bassin: [0, -48],
    epauleG: [-3, -73], coudeG: [-13, -66], mainG: [-19, -55],
    epauleD: [10, -73], coudeD: [19, -68], mainD: [24, -58],
    hancheG: [-4, -47], genouG: [-16, -30], chevilleG: [-24, -12], piedG: [-31, -8],
    hancheD: [4, -47], genouD: [14, -32], chevilleD: [10, -8], piedD: [17, -3],
  },
  // assis effondre, coudes sur les genoux, tete basse
  effondre: {
    tete: [2, -56], cou: [2, -48], epaules: [1, -45], poitrine: [-1, -36], bassin: [-4, -26],
    epauleG: [-6, -44], coudeG: [-10, -30], mainG: [-2, -50],
    epauleD: [8, -44], coudeD: [12, -30], mainD: [6, -50],
    hancheG: [-6, -25], genouG: [10, -24], chevilleG: [12, -3], piedG: [18, 0],
    hancheD: [-2, -26], genouD: [14, -25], chevilleD: [17, -3], piedD: [23, 0],
  },
};

const SILHOUETTES = {
  part: (x, y, h, c) => corps(x, y, h, c, POSES.part, { cheveux: 'droite', jupe: false }),
  court: (x, y, h, c) => corps(x, y, h, c, POSES.court, { cheveux: 'gauche', jupe: false }),
  effondre: (x, y, h, c) => corps(x, y, h, c, POSES.effondre, {}),
};

/** Le tabouret de la silhouette assise, pose derriere elle. */
const tabouret = (x, y, h, c) => {
  const u = h / 100;
  const l = 15 * u;
  const haut = 26 * u;
  return `<g fill="${c}">
    <rect x="${x - l / 2 - 6 * u}" y="${y - haut}" width="${l}" height="${3.5 * u}" rx="${1.5 * u}"/>
    <rect x="${x - l / 2 - 5 * u}" y="${y - haut}" width="${3 * u}" height="${haut}" rx="${1.5 * u}"/>
    <rect x="${x + l / 2 - 10 * u}" y="${y - haut}" width="${3 * u}" height="${haut}" rx="${1.5 * u}"/>
  </g>`;
};

/** Grand symbole central, comme leur croix. */
const SYMBOLES = {
  croix: (cx, cy, t, c) =>
    `<g fill="${c}"><rect x="${cx - t * 0.11}" y="${cy - t * 0.55}" width="${t * 0.22}" height="${t * 1.1}"/>` +
    `<rect x="${cx - t * 0.42}" y="${cy - t * 0.13}" width="${t * 0.84}" height="${t * 0.26}"/></g>`,
  barre: (cx, cy, t, c) =>
    `<rect x="${cx - t * 0.035}" y="${cy - t * 0.42}" width="${t * 0.07}" height="${t * 0.84}" fill="${c}"/>`,
  cercle: (cx, cy, t, c) =>
    `<circle cx="${cx}" cy="${cy}" r="${t * 0.4}" fill="none" stroke="${c}" stroke-width="${t * 0.07}"/>`,
};

// ---------------------------------------------------------------- projections
/**
 * Les éclaboussures ne sont pas une décoration, c'est ce qui fait lire le geste. Sur leurs
 * pièces elles couvrent tout le vêtement, bien au-delà du graphisme, avec trois tailles :
 * de grosses gouttes, une pluie de points fins, et des traînées.
 */
const projections = (r, w, h, couleur, intensite = 1) => {
  let s = '';
  const gouttes = Math.round(30 * intensite);
  for (let i = 0; i < gouttes; i++) {
    const x = r() * w;
    const y = r() * h;
    const rayon = w * (0.003 + r() * 0.011);
    // goutte RONDE legerement deformee, une goutte d'encre n'a pas d'angles
    const rx = rayon * (0.85 + r() * 0.3);
    const ry = rayon * (0.85 + r() * 0.3);
    const rot = r() * 180;
    s += `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="${rx.toFixed(1)}" ry="${ry.toFixed(1)}" transform="rotate(${rot.toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})" fill="${couleur}" opacity="${(0.8 + r() * 0.2).toFixed(2)}"/>`;
    // trainee EFFILEE: large a la goutte, pointe a l'autre bout
    if (r() > 0.45) {
      const a = r() * Math.PI * 2;
      const l = rayon * (4 + r() * 10);
      const x2 = x + Math.cos(a) * l;
      const y2 = y + Math.sin(a) * l;
      const perp = a + Math.PI / 2;
      const e = rayon * 0.55;
      const ax = x + Math.cos(perp) * e;
      const ay = y + Math.sin(perp) * e;
      const bx = x - Math.cos(perp) * e;
      const by = y - Math.sin(perp) * e;
      s += `<path d="M ${ax.toFixed(1)} ${ay.toFixed(1)} Q ${((x + x2) / 2).toFixed(1)} ${((y + y2) / 2).toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)} Q ${((x + x2) / 2).toFixed(1)} ${((y + y2) / 2).toFixed(1)} ${bx.toFixed(1)} ${by.toFixed(1)} Z" fill="${couleur}" opacity="${(0.7 + r() * 0.25).toFixed(2)}"/>`;
      // la petite goutte satellite au bout de la trainee
      if (r() > 0.5) {
        s += `<circle cx="${x2.toFixed(1)}" cy="${y2.toFixed(1)}" r="${(rayon * 0.35).toFixed(1)}" fill="${couleur}" opacity="0.85"/>`;
      }
    }
  }
  const points = Math.round(420 * intensite);
  for (let i = 0; i < points; i++) {
    const x = r() * w;
    const y = r() * h;
    const rayon = w * (0.0005 + r() * 0.0028);
    s += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${rayon.toFixed(2)}" fill="${couleur}" opacity="${(0.45 + r() * 0.5).toFixed(2)}"/>`;
  }
  return s;
};

// ---------------------------------------------------------------- scènes
const SCENES = {
  /** Deux personnages séparés par une barre : celui qui part, celui qui reste. */
  duo: (r, w, h, encre, phrase) => {
    const cy = h * 0.42;
    const taille = h * 0.34;
    const gauche = r() > 0.5 ? 'part' : 'court';
    return (
      SILHOUETTES[gauche](w * 0.3, cy + taille * 0.5, taille, NOIR) +
      SYMBOLES.barre(w * 0.5, cy, taille * 1.05, NOIR) +
      tabouret(w * 0.7, cy + taille * 0.5, taille * 0.95, NOIR) +
      SILHOUETTES.effondre(w * 0.7, cy + taille * 0.5, taille * 0.95, NOIR) +
      projections(r, w, h, encre, 1.15) +
      texte(w, h, phrase, NOIR)
    );
  },

  /** Un grand symbole central, comme leur croix. */
  symbole: (r, w, h, encre, phrase) => {
    const nom = ['croix', 'cercle'][Math.floor(r() * 2)];
    return (
      SYMBOLES[nom](w * 0.5, h * 0.42, h * 0.5, encre) +
      SILHOUETTES.effondre(w * 0.5, h * 0.52, h * 0.2, NOIR) +
      projections(r, w, h, encre, 1.3) +
      texte(w, h, phrase, NOIR)
    );
  },

  /** Une seule silhouette qui part, très décentrée, beaucoup de vide. */
  seul: (r, w, h, encre, phrase) => {
    const cote = r() > 0.5 ? 0.32 : 0.68;
    return (
      SILHOUETTES.part(w * cote, h * 0.6, h * 0.42, NOIR) +
      projections(r, w, h, encre, 0.85) +
      texte(w, h, phrase, NOIR)
    );
  },

  /** Trois fois la même silhouette qui s'éloigne, de plus en plus petite. */
  repetition: (r, w, h, encre, phrase) => {
    let s = '';
    for (let i = 0; i < 3; i++) {
      const t = h * (0.34 - i * 0.07);
      s += SILHOUETTES.part(w * (0.26 + i * 0.24), h * 0.55, t, NOIR);
    }
    return s + projections(r, w, h, encre, 0.95) + texte(w, h, phrase, NOIR);
  },
};

/** La phrase, en bas, petite. Chez eux elle est dans le titre du produit, pas criée. */
const texte = (w, h, phrase, couleur) => {
  if (!phrase) return '';
  const taille = w * 0.038;
  return `<text x="${w * 0.5}" y="${h * 0.9}" font-family="Arial Black, Arial, sans-serif" font-size="${taille}" font-weight="900" letter-spacing="${taille * 0.08}" fill="${couleur}" text-anchor="middle">${phrase.toUpperCase()}</text>`;
};

// ---------------------------------------------------------------- assemblage
const NOMS_SCENES = Object.keys(SCENES);

const svg = (numero, scene, encre, phrase, largeur, fond) => {
  const hauteur = Math.round(largeur * 1.25);
  const r = alea(numero * 7919 + scene.length * 7717);
  const corps = SCENES[scene](r, largeur, hauteur, encre, phrase);
  const decor = fond
    ? `<rect width="${largeur}" height="${hauteur}" fill="${fond}"/>`
    : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${largeur}" height="${hauteur}" viewBox="0 0 ${largeur} ${hauteur}">${decor}${corps}</svg>`;
};

const main = async () => {
  fs.mkdirSync(SORTIE, { recursive: true });

  const plan = [];
  for (let i = 0; i < NB; i++) {
    const numero = DEBUT + i;
    const r = alea(numero * 2654435761);
    const scene = SCENE_FIXE || NOMS_SCENES[i % NOMS_SCENES.length];
    const encre = ENCRES[Math.floor(r() * ENCRES.length)];
    const phrase = PHRASES[(numero - 1) % PHRASES.length];
    plan.push({ numero, scene, encre, phrase });
  }

  if (SCENE_FIXE && !SCENES[SCENE_FIXE]) {
    throw new Error(`scène inconnue : ${SCENE_FIXE}. Choix : ${NOMS_SCENES.join(', ')}`);
  }

  console.log(`${plan.length} visuels, largeur ${LARGEUR}px`);

  const { default: puppeteer } = await import('puppeteer-core');
  const navigateur = await puppeteer.launch({
    executablePath: navigateur(),
    headless: true,
    args: ['--force-device-scale-factor=1', '--no-sandbox'],
  });
  const page = await navigateur.newPage();
  const hauteur = Math.round(LARGEUR * 1.25);

  const index = [];
  for (const p of plan) {
    const base = `${String(p.numero).padStart(3, '0')}-${p.scene}`;

    // le fichier d'impression, fond transparent
    await page.setViewport({ width: LARGEUR, height: hauteur, deviceScaleFactor: 1 });
    await page.setContent(svg(p.numero, p.scene, p.encre, p.phrase, LARGEUR, null), {
      waitUntil: 'load',
    });
    await page.screenshot({
      path: path.join(SORTIE, `${base}-devant.png`),
      omitBackground: true,
    });

    // l'aperçu sur tissu, pour juger le rendu comme sur leur boutique
    await page.setContent(svg(p.numero, p.scene, p.encre, p.phrase, LARGEUR, '#8a8a8a'), {
      waitUntil: 'load',
    });
    await page.screenshot({ path: path.join(SORTIE, `${base}-apercu.png`) });

    const ko = (f) => Math.round(fs.statSync(path.join(SORTIE, f)).size / 1024);
    console.log(
      `  ${base.padEnd(18)} « ${p.phrase} »`.padEnd(48) +
        ` devant ${ko(`${base}-devant.png`)} ko, aperçu ${ko(`${base}-apercu.png`)} ko`,
    );
    index.push({ ...p, fichiers: [`${base}-devant.png`, `${base}-apercu.png`] });
  }

  fs.writeFileSync(path.join(SORTIE, 'index.json'), JSON.stringify(index, null, 2));
  await navigateur.close();

  console.log(`\n${index.length} visuels dans ${SORTIE}`);
  console.log(`Silhouettes pleines, deux couleurs, projections sur tout le vêtement.`);
  console.log(`Pas de rouge sang, pas d'arme : la composition est reprise, pas le motif de refus.`);
};

main().catch((e) => {
  console.error(`ECHEC : ${e.message}`);
  process.exit(1);
});
