/**
 * Moteur « phrase seule » : le vêtement comme support d'une déclaration.
 *
 * L'audit du créneau a montré que la niche achète une PHRASE, pas un logo ni une image.
 * Leurs propres produits s'appellent « Relapsed », « She moved on », « FORGET IT ». Ce
 * moteur produit donc des pièces entièrement typographiques.
 *
 * Trois raisons pour lesquelles c'est la famille prioritaire :
 *   1. aucun asset à acheter, donc rien ne bloque
 *   2. aucun risque de droit d'auteur, de droit à l'image ni de marque
 *   3. ça se lit sur une vidéo verticale de trois secondes, une silhouette fine non
 *
 * Le piège à éviter : une typo propre et centrée fait affiche de bureau. Ici l'encre est
 * tordue et rongée, les compositions sont décalées, et rien n'est aligné au pixel. C'est
 * le geste qui fait le style, et il vit dans `encre.mjs`.
 *
 * Usage :
 *   node phrases.mjs                       toutes les phrases, toutes les mises en page
 *   node phrases.mjs --nb 24
 *   node phrases.mjs --mise bloc
 *   node phrases.mjs --taille 3600 --sansFond --palette sombre --vers impression
 *                                          fichiers d'impression, même rendu qu'à 900
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
import { navigateur } from './navigateur.mjs';

const ICI = path.dirname(fileURLToPath(import.meta.url));

const arg = (n, d) => {
  const i = process.argv.indexOf(`--${n}`);
  return i > -1 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--')
    ? process.argv[i + 1]
    : d;
};
const NB = parseInt(arg('nb', '48'), 10);
const MISE_FIXE = arg('mise', null);
// --phrase court la bibliothèque de PHRASES et compose la phrase donnée. Sert au serveur MCP
// de outils/mcp-motifs, pour composer à la demande sans dupliquer ce moteur. Une phrase
// fournie n'est jamais présumée utilisable en publicité : `pub` reste faux, ça se juge.
const PHRASE_LIBRE = arg('phrase', null);
const W = parseInt(arg('taille', '900'), 10);
// Le meme moteur sort l'affiche 4:5, le carre du bandana et du sticker, le 2:3 du poster,
// et le bandeau tres large d'un bonnet ou d'une casquette.
const FORMATS = { affiche: 1.25, carre: 1, poster: 1.5, bande: 0.34 };
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
const SORTIE = path.join(ICI, VERS || 'phrases');

// ------------------------------------------------------------------ mises en page

const signature = (r, p, doux = true) =>
  SANS_FOND
    ? ''
    : mot(W * (0.5 + (r() - 0.5) * 0.36), SANS_FOND ? H * 0.8 : H * 0.955, 'dead2me', W * 0.032, FONTES.main, p.encre, {
    rot: (r() - 0.5) * 5,
    doux,
    opacite: 0.75,
  });

const MISES = {
  /** Bloc massif qui remplit la largeur : la pièce qui se lit de loin. */
  bloc: (r, p, ph) => {
    const ls = lignes(ph.t, 3);
    const taille = Math.min(W * 0.215, (W * 1.66) / Math.max(...ls.map((l) => l.length)));
    const h = taille * 0.9;
    const y0 = H * (0.38 + r() * 0.08) - ((ls.length - 1) * h) / 2;
    const cx = W * (0.5 + (r() - 0.5) * 0.06);
    let s = '';
    ls.forEach((l, i) => {
      s += mot(cx, y0 + i * h, l.toUpperCase(), taille, FONTES.massue, p.encre, {
        rot: (r() - 0.5) * 1.6,
        esp: -taille * 0.02,
        tient: W * 0.88,
        groupe: 'bloc',
      });
    });
    const bas = y0 + (ls.length - 1) * h;
    // la largeur prise est celle de la DERNIERE ligne : avec la plus large, les coulures
    // tombaient a cote d'une derniere ligne courte, suspendues dans le vide
    const derniere = largeur(ls[ls.length - 1], taille, FONTES.massue);
    s += coulures(r, cx, bas, derniere * 0.9, 3 + Math.floor(r() * 4), W * 0.012, p.accent);
    return s + signature(r, p);
  },

  /** Écriture à la main, décalée, avec un grand vide autour. */
  manuscrit: (r, p, ph) => {
    const ls = lignes(ph.t, 2);
    const taille = Math.min(W * 0.175, (W * 1.55) / Math.max(...ls.map((l) => l.length)));
    const x = W * (0.44 + (r() - 0.5) * 0.22);
    const y0 = H * (0.42 + r() * 0.1);
    let s = '';
    ls.forEach((l, i) => {
      s += mot(x + i * W * 0.05, y0 + i * taille * 1.18, l, taille, FONTES.main, p.encre, {
        rot: (r() - 0.5) * 6,
        doux: true,
        tient: W * 0.86,
        groupe: 'main',
      });
    });
    const bas = y0 + (ls.length - 1) * taille * 1.18;
    s += coulures(r, x, bas, largeur(ls[ls.length - 1], taille, FONTES.main), 2 + Math.floor(r() * 3), W * 0.009, p.accent);
    return s + signature(r, p);
  },

  /** Serif italique, petit, perdu dans le vide : le registre le plus mélancolique. */
  serif: (r, p, ph) => {
    const taille = W * (0.115 + r() * 0.035);
    const y = H * (0.44 + (r() - 0.5) * 0.1);
    let s = mot(W * 0.5, y, ph.t, taille, FONTES.serif, p.encre, {
      italique: true,
      doux: true,
      esp: taille * 0.04,
      rot: (r() - 0.5) * 1.2,
      tient: W * 0.84,
    });
    s += coulures(r, W * 0.5, y, largeur(ph.t, taille, FONTES.serif) * 0.8, 1 + Math.floor(r() * 2), W * 0.009, p.accent);
    return s + signature(r, p);
  },

  /** La phrase rayée : ce qui a été dit, puis retiré. */
  barre: (r, p, ph) => {
    const ls = lignes(ph.t, 2);
    const taille = Math.min(W * 0.185, (W * 1.9) / Math.max(...ls.map((l) => l.length)));
    const y0 = H * 0.44 - ((ls.length - 1) * taille) / 2;
    let s = '';
    ls.forEach((l, i) => {
      const y = y0 + i * taille * 0.98;
      s += mot(W * 0.5, y, l.toUpperCase(), taille, FONTES.condense, p.encre, {
        esp: taille * 0.02,
        poids: 700,
        tient: W * 0.86,
        groupe: 'barre',
      });
      if (i === ls.length - 1 || r() > 0.5) {
        const lg = largeur(l, taille, FONTES.condense);
        s += rature(r, W * 0.5 - lg * 0.6, W * 0.5 + lg * 0.6, y - taille * 0.3, W * 0.013, p.accent);
      }
    });
    const bas = y0 + (ls.length - 1) * taille * 0.98;
    s += coulures(r, W * 0.5, bas, largeur(ls[ls.length - 1], taille, FONTES.condense) * 0.85, 2 + Math.floor(r() * 2), W * 0.01, p.accent);
    return s + signature(r, p);
  },

  /** La même phrase répétée jusqu'à saturation, une seule lisible. */
  repetition: (r, p, ph) => {
    const n = 11 + Math.floor(r() * 7);
    const taille = W * 0.062;
    const vive = Math.floor(r() * n);
    let s = '';
    for (let i = 0; i < n; i++) {
      const y = H * 0.16 + (i / (n - 1)) * H * 0.66;
      s += mot(W * (0.5 + (r() - 0.5) * 0.07), y, ph.t, taille, FONTES.mono, i === vive ? p.accent : p.encre, {
        opacite: i === vive ? 1 : 0.15 + r() * 0.16,
        doux: true,
        rot: (r() - 0.5) * 1.2,
        tient: W * 0.9,
        groupe: 'rep',
      });
    }
    return s + signature(r, p);
  },

  /** Phrase plus horodatage, comme une capture d'appel. */
  horodatage: (r, p, ph) => {
    const ls = lignes(ph.t, 2);
    const taille = Math.min(W * 0.17, (W * 1.7) / Math.max(...ls.map((l) => l.length)));
    const y0 = H * 0.38;
    let s = '';
    ls.forEach((l, i) => {
      s += mot(W * 0.5, y0 + i * taille * 0.98, l.toUpperCase(), taille, FONTES.condense, p.encre, {
        esp: taille * 0.03,
        poids: 700,
        tient: W * 0.86,
        groupe: 'horo',
      });
    });
    const bas = y0 + (ls.length - 1) * taille * 0.98;
    // l'heure passe AU-DESSUS de la phrase : en dessous, elle se faisait traverser par les
    // coulures, et un en-tête de journal d'appels se lit de toute façon en haut
    const heures = ['02:41', '03:17', '04:12', '23:58', '01:04', '05:22'];
    s += mot(W * 0.5, y0 - taille * 0.72, `${heures[Math.floor(r() * heures.length)]}   no answer`, W * 0.042, FONTES.mono, p.accent, {
      doux: true,
      esp: W * 0.004,
      tient: W * 0.7,
    });
    s += coulures(r, W * 0.5, bas, largeur(ls[ls.length - 1], taille, FONTES.condense) * 0.45, 3 + Math.floor(r() * 3), W * 0.01, p.accent, 0.1);
    return s + signature(r, p);
  },

  /** Une seule ligne, très large : le bandeau d'un bonnet ou d'une casquette. */
  bandeau: (r, p, ph) => {
    // Deux usages : le bandeau tres large d'une sangle, et le carre d'un bonnet ou la zone
    // imprimee couvre tout le tricot mais ou seule la bande frontale se voit portee. Dans
    // les deux cas la ligne doit rester basse et tenir dans la largeur.
    const taille = Math.min(H * 0.42, W * 0.14);
    const y = H * (H < W ? 0.66 : 0.82);
    let s = mot(W * 0.5, y, ph.t.toUpperCase(), taille, FONTES.condense, p.encre, {
      esp: taille * 0.06,
      poids: 700,
      tient: W * 0.92,
    });
    if (r() > 0.5) {
      const lg = largeur(ph.t, taille, FONTES.condense);
      s += rature(r, W * 0.5 - lg * 0.55, W * 0.5 + lg * 0.55, y - taille * 0.35, H * 0.045, p.accent);
    }
    return s;
  },

  /** Tout en bas dans un coin, le reste vide : la pièce discrète. */
  angle: (r, p, ph) => {
    const taille = W * 0.082;
    const gauche = r() > 0.5;
    const x = gauche ? W * 0.09 : W * 0.91;
    const y = H * 0.82;
    const lg = largeur(ph.t, taille, FONTES.condense);
    let s = mot(x, y, ph.t.toUpperCase(), taille, FONTES.condense, p.encre, {
      ancre: gauche ? 'start' : 'end',
      esp: taille * 0.05,
      poids: 700,
      tient: W * 0.82,
    });
    s += rature(r, gauche ? x : x - lg, gauche ? x + lg : x, y + taille * 0.26, W * 0.007, p.accent);
    s += coulures(r, gauche ? x + lg * 0.4 : x - lg * 0.4, y, lg * 0.7, 2, W * 0.008, p.accent);
    return (
      s +
      mot(gauche ? W * 0.91 : W * 0.09, H * 0.13, 'dead2me', W * 0.032, FONTES.main, p.encre, {
        ancre: gauche ? 'end' : 'start',
        doux: true,
        opacite: 0.72,
        rot: (r() - 0.5) * 5,
      })
    );
  },
};

const NOMS_MISES = Object.keys(MISES).filter((n) => n !== 'bandeau');

// ------------------------------------------------------------------ production

const main = async () => {
  fs.mkdirSync(SORTIE, { recursive: true });
  if (!VERS) {
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
    const r = alea(n * 7919 + 31);
    const ph = PHRASE_LIBRE ? { t: PHRASE_LIBRE, pub: false, role: 'libre' } : PHRASES[i % PHRASES.length];
    const tireMise = NOMS_MISES[Math.floor(r() * NOMS_MISES.length)];
    const nomMise = FORMAT === 'bande' ? 'bandeau' : MISE_FIXE || tireMise;
    // le tirage est consomme meme quand la palette est imposee, pour que les numeros de
    // piece restent les memes d'une passe a l'autre
    const tire = PALETTES[Math.floor(r() * PALETTES.length)];
    const p = PALETTE_NOM ? PALETTES.find((x) => x.nom === PALETTE_NOM) || tire : tire;

    const eviteParMise = {
      bloc: [0.28, 0.62],
      barre: [0.3, 0.58],
      manuscrit: [0.34, 0.62],
      serif: [0.34, 0.54],
      repetition: [0.12, 0.86],
      horodatage: [0.24, 0.56],
      angle: [0.74, 0.94],
      bandeau: [0.2, 0.9],
    };
    const corps = MISES[nomMise](r, p, ph) + taches(r, W, H, p, eviteParMise[nomMise] || [0.3, 0.6]);
    const svg =
      `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">` +
      filtres(r, W, ECH) +
      (SANS_FOND ? '' : `<rect width="${W}" height="${H}" fill="${p.fond}"/>`) +
      `<g id="contenu">${corps}</g>` +
      (SANS_FOND ? '' : `<rect width="${W}" height="${H}" filter="url(#grain)" opacity="0.055" style="mix-blend-mode:overlay"/>`) +
      '</svg>';

    // Une phrase fournie se nomme par son texte : deux appels de suite avec la même mise et
    // la même palette écraseraient sinon le même 001.
    const nom = PHRASE_LIBRE
      ? `${PHRASE_LIBRE.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').slice(0, 32).toLowerCase()}-${nomMise}-${p.nom}.png`
      : `${String(n).padStart(3, '0')}-${nomMise}-${p.nom}.png`;
    await page.setContent(svg, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(ajusterEnPage);
    // En impression, on recadre sur le dessin. Sans ça le fichier garde les marges de la
    // planche et Printful place un dessin minuscule au milieu d'un grand vêtement.
    const clip = SANS_FOND ? await page.evaluate(recadrer, W * 0.03) : null;
    await page.screenshot({ path: path.join(SORTIE, nom), omitBackground: SANS_FOND, ...(clip ? { clip } : {}) });
    index.push({ numero: n, phrase: ph.t, pub: ph.pub, mise: nomMise, palette: p.nom, fichier: nom });
  }

  fs.writeFileSync(path.join(SORTIE, 'index.json'), JSON.stringify(index, null, 2));
  await nav.close();
  console.log(`${index.length} visuels dans ${SORTIE}`);
  console.log(`${index.filter((x) => x.pub).length} utilisables en publicité`);
};

main().catch((e) => {
  console.error(`ECHEC : ${e.message}`);
  process.exit(1);
});
