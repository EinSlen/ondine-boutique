/**
 * Compose les visuels dead2me à partir de VRAIES silhouettes vectorielles CC0
 * (récupérées par silhouettes.mjs) et du moteur d'éclaboussures.
 *
 * DEUX BIBLIOTHÈQUES, c'est le point clé :
 *
 *   --lot organique  la version live2die complète : crâne, croix, projections ROUGE SANG.
 *                    Réservée aux publications organiques et à la boutique. Ne JAMAIS la
 *                    charger dans un compte publicitaire, ni la laisser sur une page qui
 *                    reçoit de la publicité : le rouge sang et les crânes font refuser les
 *                    campagnes chez Meta comme chez TikTok, et ce sont les visuels qui ont
 *                    fait bannir le compte de live2die à 30 000 abonnés.
 *
 *   --lot pub        même composition, mêmes silhouettes, mais projections à l'encre
 *                    monochrome et aucun crâne. C'est la version validable en campagne.
 *
 * Les silhouettes viennent d'Openclipart, licence CC0, domaine public, usage commercial et
 * merchandising autorisés. La provenance de chaque pièce est dans silhouettes/catalogue.json.
 *
 * Usage :
 *   node scenes.mjs --lot pub --nb 8
 *   node scenes.mjs --lot organique --nb 8
 *   node scenes.mjs --lot pub --largeur 3600
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
const LOT = arg('lot', 'pub');
const NB = parseInt(arg('nb', '8'), 10);
const DEBUT = parseInt(arg('debut', '1'), 10);
const LARGEUR = parseInt(arg('largeur', '3000'), 10);
if (!['pub', 'organique'].includes(LOT)) {
  console.error("--lot doit valoir pub ou organique");
  process.exit(1);
}
const SORTIE = path.join(ICI, `scenes-${LOT}`);

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

// ---------------------------------------------------------------- pièces sources
const PIECES = {
  // La coureuse sert de figure qui s'en va: elle colle au theme run away mieux qu'une
  // marche, et la silhouette est moderne (baskets, foulee ample). L'autre marcheuse
  // recuperee portait un chapeau de paille tres date, ecartee.
  part: 'court-263156.svg',
  court: 'court-263156.svg',
  // Jeune homme sur une chaise, tete dans les mains. Remplace un vieil homme a canne,
  // hors cible. C'est la pose exacte de leur piece She moved on.
  effondre: 'a-classer-181678.svg',
  croix: 'a-classer-295815.svg',
  crane: 'a-classer-169895.svg',
  cimetiere: 'a-classer-353556.svg',
};

/**
 * Extrait le contenu utile d'un SVG et le place dans une boîte donnée.
 * On passe par <svg> imbriqué avec viewBox et preserveAspectRatio : c'est le seul moyen
 * fiable de replacer une pièce dont on ne connaît pas les coordonnées internes.
 */
const placer = (nomFichier, x, y, largeur, hauteur, couleur, opts = {}) => {
  const brut = fs.readFileSync(path.join(SILS, nomFichier), 'utf8');
  const vb = brut.match(/viewBox="([^"]+)"/);
  const w = brut.match(/\swidth="([\d.]+)/);
  const h = brut.match(/\sheight="([\d.]+)/);
  const viewBox = vb ? vb[1] : `0 0 ${w ? w[1] : 100} ${h ? h[1] : 100}`;
  // Nettoyage robuste. Deux pieges reels rencontres sur Openclipart:
  //   - la balise fermante peut etre coupee par un retour a la ligne avant le chevron
  //   - un g peut etre ouvert sans etre ferme, ce qui avale tout ce qu'on dessine apres
  // On retire donc metadata/defs/title en tolerant les retours a la ligne dans les balises,
  // puis on reequilibre les <g> en ajoutant les fermetures manquantes.
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

  // On calcule l'echelle a la main et on emet un <g>, PAS un <svg> imbrique: un svg
  // imbrique rogne son contenu a sa boite et masquait les elements dessines apres lui.
  const [vx, vy, vw, vh] = viewBox.trim().split(/[\s,]+/).map(Number);
  const k = Math.min(largeur / vw, hauteur / vh);
  const dx = x + (largeur - vw * k) / 2;
  const dy = y + (hauteur - vh * k) / 2;
  const mir = opts.miroir ? `translate(${(vw * k).toFixed(2)} 0) scale(-1 1) ` : '';
  return `<g color="${couleur}" fill="${couleur}" transform="translate(${dx.toFixed(2)} ${dy.toFixed(2)}) ${mir}scale(${k.toFixed(5)}) translate(${(-vx).toFixed(2)} ${(-vy).toFixed(2)})">${interieur}</g>`;
};

// ---------------------------------------------------------------- éclaboussures
const projections = (r, w, h, couleur, intensite) => {
  let s = '';
  const gouttes = Math.round(30 * intensite);
  for (let i = 0; i < gouttes; i++) {
    const x = r() * w;
    const y = r() * h;
    const rayon = w * (0.003 + r() * 0.011);
    s += `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="${(rayon * (0.85 + r() * 0.3)).toFixed(1)}" ry="${(rayon * (0.85 + r() * 0.3)).toFixed(1)}" fill="${couleur}" opacity="${(0.8 + r() * 0.2).toFixed(2)}"/>`;
    if (r() > 0.45) {
      const a = r() * Math.PI * 2;
      const l = rayon * (4 + r() * 10);
      const x2 = x + Math.cos(a) * l;
      const y2 = y + Math.sin(a) * l;
      const perp = a + Math.PI / 2;
      const e = rayon * 0.55;
      s +=
        `<path d="M ${(x + Math.cos(perp) * e).toFixed(1)} ${(y + Math.sin(perp) * e).toFixed(1)} ` +
        `Q ${((x + x2) / 2).toFixed(1)} ${((y + y2) / 2).toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)} ` +
        `Q ${((x + x2) / 2).toFixed(1)} ${((y + y2) / 2).toFixed(1)} ` +
        `${(x - Math.cos(perp) * e).toFixed(1)} ${(y - Math.sin(perp) * e).toFixed(1)} Z" ` +
        `fill="${couleur}" opacity="${(0.7 + r() * 0.25).toFixed(2)}"/>`;
      if (r() > 0.5) {
        s += `<circle cx="${x2.toFixed(1)}" cy="${y2.toFixed(1)}" r="${(rayon * 0.35).toFixed(1)}" fill="${couleur}" opacity="0.85"/>`;
      }
    }
  }
  const points = Math.round(420 * intensite);
  for (let i = 0; i < points; i++) {
    s += `<circle cx="${(r() * w).toFixed(1)}" cy="${(r() * h).toFixed(1)}" r="${(w * (0.0005 + r() * 0.0028)).toFixed(2)}" fill="${couleur}" opacity="${(0.45 + r() * 0.5).toFixed(2)}"/>`;
  }
  return s;
};

// ---------------------------------------------------------------- réglages par lot
// Encre du dessin. Le vetement de reference est NOIR (comme chez live2die), donc le
// dessin doit etre CLAIR: un dessin noir sur un sweat noir est invisible, verifie sur
// maquette Printful. --clair inverse pour un vetement clair.
const SUR_CLAIR = process.argv.includes('--clair');
const NOIR = SUR_CLAIR ? '#0a0a0a' : '#efece6';
const REGLAGES = {
  pub: {
    encres: SUR_CLAIR ? ['#1c1c1c', '#2b2b2b', '#3a3f45'] : ['#cfcbc2', '#a8a49b', '#8f9aa3'],
    symboles: ['croix', 'cimetiere'],
    intensite: 1,
    phrases: [
      'dead to me',
      'no reply',
      'you first',
      'still nothing',
      'last seen online',
      'read at 4am',
      'gone by morning',
      'told you so',
    ],
  },
  organique: {
    // le rouge n'existe QUE dans ce lot, et ce lot ne va jamais dans un compte publicitaire
    encres: ['#8e0f14', '#a3141a', '#6d0b10'],
    symboles: ['croix', 'crane', 'cimetiere'],
    intensite: 1.5,
    phrases: [
      'dead to me',
      'she left twice',
      'don’t wait up',
      'nothing after',
      'not my problem',
      'you did this',
      'no one came',
      'end of it',
    ],
  },
};

// ---------------------------------------------------------------- scènes
const texte = (w, h, phrase) => {
  const taille = w * 0.038;
  return `<text x="${w * 0.5}" y="${h * 0.93}" font-family="Arial Black, Arial, sans-serif" font-size="${taille}" font-weight="900" letter-spacing="${taille * 0.08}" fill="${NOIR}" text-anchor="middle">${phrase.toUpperCase()}</text>`;
};

const SCENES = {
  /** Celle qui part, celui qui reste. La barre au milieu sépare les deux temps du récit. */
  duo: (r, w, h, cfg) => {
    const hs = h * 0.42;
    const y = h * 0.2;
    return (
      placer(PIECES.part, w * 0.06, y, w * 0.36, hs, NOIR, { miroir: true }) +
      `<rect x="${w * 0.485}" y="${y + hs * 0.08}" width="${w * 0.03}" height="${hs * 0.88}" fill="${NOIR}"/>` +
      placer(PIECES.effondre, w * 0.56, y + hs * 0.1, w * 0.36, hs * 0.9, NOIR) +
      projections(r, w, h, cfg.encre, cfg.intensite)
    );
  },

  /** Elle court, il reste. Version plus violente du même récit. */
  fuite: (r, w, h, cfg) => {
    const hs = h * 0.4;
    const y = h * 0.22;
    return (
      placer(PIECES.court, w * 0.05, y, w * 0.4, hs, NOIR) +
      placer(PIECES.effondre, w * 0.58, y + hs * 0.14, w * 0.34, hs * 0.86, NOIR) +
      projections(r, w, h, cfg.encre, cfg.intensite * 1.2)
    );
  },

  /** Un grand symbole, une silhouette dessous, écrasée par lui. */
  symbole: (r, w, h, cfg) => {
    const nom = cfg.symboles[Math.floor(r() * cfg.symboles.length)];
    const grand = nom === 'cimetiere';
    return (
      placer(
        PIECES[nom],
        grand ? w * 0.06 : w * 0.26,
        h * 0.12,
        grand ? w * 0.88 : w * 0.48,
        grand ? h * 0.3 : h * 0.46,
        cfg.encre,
      ) +
      placer(PIECES.effondre, w * 0.36, h * (grand ? 0.46 : 0.56), w * 0.28, h * 0.3, NOIR) +
      projections(r, w, h, cfg.encre, cfg.intensite)
    );
  },

  /** Trois fois la même, qui s'éloigne. Le vide fait le reste. */
  eloignement: (r, w, h, cfg) => {
    let s = '';
    for (let i = 0; i < 3; i++) {
      const hs = h * (0.38 - i * 0.09);
      s += placer(PIECES.part, w * (0.06 + i * 0.3), h * 0.24 + i * h * 0.04, w * 0.3, hs, NOIR, {
        miroir: i === 1,
      });
    }
    return s + projections(r, w, h, cfg.encre, cfg.intensite * 0.9);
  },
};

const NOMS = Object.keys(SCENES);

// ---------------------------------------------------------------- rendu
const main = async () => {
  fs.mkdirSync(SORTIE, { recursive: true });
  const base = REGLAGES[LOT];
  const hauteur = Math.round(LARGEUR * 1.25);

  const { default: puppeteer } = await import('puppeteer-core');
  const navigateur = await puppeteer.launch({
    executablePath: navigateur(),
    headless: true,
    args: ['--no-sandbox'],
  });
  const page = await navigateur.newPage();

  console.log(`lot ${LOT.toUpperCase()}, ${NB} visuels, ${LARGEUR}px`);
  if (LOT === 'organique') {
    console.log(`ATTENTION : rouge sang et crânes, à ne jamais charger dans un compte pub.`);
  }

  const index = [];
  for (let i = 0; i < NB; i++) {
    const numero = DEBUT + i;
    const r = alea(numero * 7919 + LOT.length * 104729);
    const scene = NOMS[i % NOMS.length];
    const cfg = {
      encre: base.encres[Math.floor(r() * base.encres.length)],
      symboles: base.symboles,
      intensite: base.intensite,
    };
    const phrase = base.phrases[(numero - 1) % base.phrases.length];
    const corps = SCENES[scene](r, LARGEUR, hauteur, cfg) + texte(LARGEUR, hauteur, phrase);
    const svg = (fond) =>
      `<svg xmlns="http://www.w3.org/2000/svg" width="${LARGEUR}" height="${hauteur}" viewBox="0 0 ${LARGEUR} ${hauteur}">` +
      (fond ? `<rect width="${LARGEUR}" height="${hauteur}" fill="${fond}"/>` : '') +
      `${corps}</svg>`;

    const nom = `${String(numero).padStart(3, '0')}-${scene}`;
    await page.setViewport({ width: LARGEUR, height: hauteur, deviceScaleFactor: 1 });
    await page.setContent(svg(null), { waitUntil: 'load' });
    await page.screenshot({ path: path.join(SORTIE, `${nom}-devant.png`), omitBackground: true });
    await page.setContent(svg('#8f8f8f'), { waitUntil: 'load' });
    await page.screenshot({ path: path.join(SORTIE, `${nom}-apercu.png`) });

    const ko = (f) => Math.round(fs.statSync(path.join(SORTIE, f)).size / 1024);
    console.log(
      `  ${nom.padEnd(20)} « ${phrase} »`.padEnd(46) +
        ` devant ${ko(`${nom}-devant.png`)} ko, aperçu ${ko(`${nom}-apercu.png`)} ko`,
    );
    index.push({ numero, scene, phrase, encre: cfg.encre, lot: LOT });
  }

  fs.writeFileSync(path.join(SORTIE, 'index.json'), JSON.stringify(index, null, 2));
  await navigateur.close();
  console.log(`\n${index.length} visuels dans ${SORTIE}`);
};

main().catch((e) => {
  console.error(`ECHEC : ${e.message}`);
  process.exit(1);
});
