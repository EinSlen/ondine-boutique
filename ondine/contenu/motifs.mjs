/**
 * Générateur de motifs pour jamaisdeux.
 *
 * Produit des motifs SANS RACCORD VISIBLE, contrainte imposée par l'all-over print :
 * le tissu est imprimé à plat puis coupé et cousu, donc un motif à bord franc laisserait
 * une couture apparente. Chaque forme est donc dessinée neuf fois, décalée de plus ou moins
 * une largeur et une hauteur, pour que les bords se recollent exactement.
 *
 * Chaque motif est déterministe : même numéro, même graine, même image. Le numéro n'est
 * attribué qu'une fois, ce qui rend la numérotation des tirages uniques vérifiable.
 *
 * Usage :
 *   node motifs.mjs                    20 motifs, familles et palettes tirées au sort
 *   node motifs.mjs --nb 40            40 motifs
 *   node motifs.mjs --debut 21         reprend la numérotation à 21
 *   node motifs.mjs --famille coulures une seule famille
 *   node motifs.mjs --tuile 2048 --feuille 4500
 *   node motifs.mjs --svg              écrit seulement les SVG, sans lancer le navigateur
 *
 * Sorties dans contenu/motifs/ :
 *   NNN-famille-tuile.png      la tuile répétable, à utiliser en motif de fond
 *   NNN-famille-feuille.png    la tuile répétée, fichier d'impression all-over print
 *   NNN-famille-devant.png     composition centrée sur fond transparent, pour l'imprimé DTF
 *   index.json                 numéro, graine, famille, palette, pour pouvoir tout regénérer
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { navigateur } from './navigateur.mjs';

const ICI = path.dirname(fileURLToPath(import.meta.url));
const SORTIE = path.join(ICI, 'motifs');

const arg = (nom, defaut) => {
  const i = process.argv.indexOf(`--${nom}`);
  return i > -1 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--')
    ? process.argv[i + 1]
    : defaut;
};
const NB = parseInt(arg('nb', '20'), 10);
const DEBUT = parseInt(arg('debut', '1'), 10);
const TUILE = parseInt(arg('tuile', '2048'), 10);
const FEUILLE = parseInt(arg('feuille', '4500'), 10);
const DEVANT = parseInt(arg('devant', '3600'), 10);
const FAMILLE_FIXE = arg('famille', null);
const SVG_SEUL = process.argv.includes('--svg');

// Générateur pseudo-aléatoire déterministe. Date.now() est proscrit ici, un motif doit
// pouvoir être regénéré à l'identique des mois plus tard depuis son seul numéro.
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

/**
 * Palettes sobres, deux à trois tons. Aucune n'utilise le rouge vif : l'esthétique
 * éclaboussure rouge fait refuser une publicité chez Meta comme chez TikTok, et la page
 * de destination est lue par les régies elle aussi.
 */
const PALETTES = {
  encre: { fond: '#0d0d0f', trait: '#e8e6e1', accent: '#8f8b83' },
  papier: { fond: '#e8e4dc', trait: '#16161a', accent: '#6f6a62' }, // le seul clair conserve
  beton: { fond: '#3c3f42', trait: '#d7d4cd', accent: '#84888c' },
  olive: { fond: '#2b2f24', trait: '#cfd0bb', accent: '#6f7552' },
  rouille: { fond: '#241a16', trait: '#d9cec4', accent: '#8c4a2f' },
  ardoise: { fond: '#1b2026', trait: '#c9d2da', accent: '#4a5a68' },
};

// pochoir retire du tirage par defaut: des formes geometriques eparpillees donnent un
// effet papier cadeau, tres loin de l'esthetique visee. Le moteur reste dispo via --famille.
const FAMILLES = ['coulures', 'lavis', 'trame', 'fibres', 'craquelure'];

/** Répète une forme sur les neuf positions pour que la tuile se recolle à ses bords. */
const enrouler = (w, h, forme) => {
  let out = '';
  for (const dx of [-w, 0, w]) {
    for (const dy of [-h, 0, h]) {
      out += `<g transform="translate(${dx} ${dy})">${forme}</g>`;
    }
  }
  return out;
};

// ---------------------------------------------------------------- familles de motifs

const coulures = (r, w, h, p) => {
  let s = '';
  const n = 220 + Math.floor(r() * 180);
  for (let i = 0; i < n; i++) {
    const x = r() * w;
    const y = r() * h;
    const long = h * (0.06 + r() * 0.28);
    const ep = (w / 1024) * (1.5 + r() * 9);
    const derive = (r() - 0.5) * ep * 3;
    const couleur = r() > 0.72 ? p.accent : p.trait;
    const opacite = (0.25 + r() * 0.6).toFixed(2);
    const d = `M ${x} ${y} C ${x + derive} ${y + long * 0.4}, ${x - derive} ${y + long * 0.7}, ${x + derive * 0.4} ${y + long}`;
    s += `<path d="${d}" fill="none" stroke="${couleur}" stroke-width="${ep.toFixed(1)}" stroke-linecap="round" opacity="${opacite}"/>`;
    // la goutte au bout de la coulure, c'est elle qui fait lire le geste
    s += `<circle cx="${(x + derive * 0.4).toFixed(1)}" cy="${(y + long).toFixed(1)}" r="${(ep * 0.75).toFixed(1)}" fill="${couleur}" opacity="${opacite}"/>`;
  }
  return s;
};

const lavis = (r, w, h, p) => {
  let s = '';
  const n = 70 + Math.floor(r() * 60);
  for (let i = 0; i < n; i++) {
    const cx = r() * w;
    const cy = r() * h;
    const rayon = w * (0.015 + r() * 0.075);
    const pts = 9 + Math.floor(r() * 8);
    let d = '';
    for (let k = 0; k < pts; k++) {
      const a = (k / pts) * Math.PI * 2;
      const rr = rayon * (0.55 + r() * 0.75);
      const x = cx + Math.cos(a) * rr;
      const y = cy + Math.sin(a) * rr;
      d += `${k === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)} `;
    }
    const couleur = r() > 0.6 ? p.accent : p.trait;
    s += `<path d="${d}Z" fill="${couleur}" opacity="${(0.1 + r() * 0.28).toFixed(2)}" filter="url(#flou)"/>`;
  }
  return s;
};

const pochoir = (r, w, h, p) => {
  let s = '';
  const n = 90 + Math.floor(r() * 90);
  for (let i = 0; i < n; i++) {
    const x = r() * w;
    const y = r() * h;
    const t = w * (0.016 + r() * 0.045);
    const rot = Math.floor(r() * 4) * 45 + (r() - 0.5) * 12;
    const couleur = r() > 0.7 ? p.accent : p.trait;
    const op = (0.35 + r() * 0.5).toFixed(2);
    const forme = r();
    let corps;
    if (forme < 0.34) {
      // carré évidé, avec les ponts de matière qui font le pochoir
      const e = t * 0.22;
      corps =
        `<rect x="${-t / 2}" y="${-t / 2}" width="${t}" height="${t}" fill="none" stroke="${couleur}" stroke-width="${e.toFixed(1)}"/>` +
        `<rect x="${-t * 0.12}" y="${-t * 0.62}" width="${t * 0.24}" height="${t * 0.24}" fill="${p.fond}"/>`;
    } else if (forme < 0.67) {
      const e = t * 0.18;
      corps =
        `<circle cx="0" cy="0" r="${t / 2}" fill="none" stroke="${couleur}" stroke-width="${e.toFixed(1)}"/>` +
        `<rect x="${-t * 0.1}" y="${-t * 0.6}" width="${t * 0.2}" height="${t * 0.2}" fill="${p.fond}"/>`;
    } else {
      corps = `<path d="M ${-t / 2} ${t / 2} L 0 ${-t / 2} L ${t / 2} ${t / 2} Z" fill="none" stroke="${couleur}" stroke-width="${(t * 0.16).toFixed(1)}"/>`;
    }
    s += `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${rot.toFixed(1)})" opacity="${op}">${corps}</g>`;
  }
  return s;
};

const trame = (r, w, h, p) => {
  // trame de sérigraphie: le pas est un diviseur exact de la tuile, sinon le raccord saute
  const divisions = [36, 44, 52, 64][Math.floor(r() * 4)];
  const pas = w / divisions;
  const phase = r() * Math.PI * 2;
  const echelle = 1.5 + r() * 3;
  let s = '';
  for (let i = 0; i < divisions; i++) {
    for (let j = 0; j < divisions; j++) {
      const u = (i / divisions) * Math.PI * 2 * echelle + phase;
      const v = (j / divisions) * Math.PI * 2 * echelle;
      const onde = (Math.sin(u) + Math.cos(v)) / 2;
      const rayon = Math.max(0, (0.12 + onde * 0.38)) * pas * 0.5;
      if (rayon < 0.4) continue;
      const couleur = onde > 0.55 ? p.accent : p.trait;
      s += `<circle cx="${(i * pas + pas / 2).toFixed(1)}" cy="${(j * pas + pas / 2).toFixed(1)}" r="${rayon.toFixed(1)}" fill="${couleur}" opacity="0.85"/>`;
    }
  }
  return s;
};

const fibres = (r, w, h, p) => {
  let s = '';
  const n = 450 + Math.floor(r() * 350);
  for (let i = 0; i < n; i++) {
    const x = r() * w;
    const y = r() * h;
    const a = r() * Math.PI * 2;
    const long = w * (0.03 + r() * 0.16);
    const x2 = x + Math.cos(a) * long;
    const y2 = y + Math.sin(a) * long;
    const cx = (x + x2) / 2 + (r() - 0.5) * long * 0.35;
    const cy = (y + y2) / 2 + (r() - 0.5) * long * 0.35;
    const couleur = r() > 0.78 ? p.accent : p.trait;
    s += `<path d="M ${x.toFixed(1)} ${y.toFixed(1)} Q ${cx.toFixed(1)} ${cy.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}" fill="none" stroke="${couleur}" stroke-width="${((w / 1024) * (0.7 + r() * 2.6)).toFixed(1)}" opacity="${(0.2 + r() * 0.55).toFixed(2)}" stroke-linecap="round"/>`;
  }
  return s;
};

const craquelure = (r, w, h, p) => {
  let s = '';
  const noeuds = [];
  const n = 22 + Math.floor(r() * 16);
  for (let i = 0; i < n; i++) noeuds.push([r() * w, r() * h]);
  for (const [x, y] of noeuds) {
    // chaque noeud se relie a ses trois plus proches voisins, ce qui donne un reseau
    const proches = noeuds
      .filter((q) => q[0] !== x || q[1] !== y)
      .map((q) => ({ q, d: (q[0] - x) ** 2 + (q[1] - y) ** 2 }))
      .sort((a, b) => a.d - b.d)
      .slice(0, 3);
    for (const { q } of proches) {
      const mx = (x + q[0]) / 2 + (r() - 0.5) * w * 0.05;
      const my = (y + q[1]) / 2 + (r() - 0.5) * h * 0.05;
      s += `<path d="M ${x.toFixed(1)} ${y.toFixed(1)} Q ${mx.toFixed(1)} ${my.toFixed(1)} ${q[0].toFixed(1)} ${q[1].toFixed(1)}" fill="none" stroke="${p.trait}" stroke-width="${(1 + r() * 3.2).toFixed(1)}" opacity="${(0.3 + r() * 0.5).toFixed(2)}"/>`;
    }
  }
  return s;
};

const MOTEURS = { coulures, lavis, pochoir, trame, fibres, craquelure };

// ---------------------------------------------------------------- assemblage SVG

const svgTuile = (numero, famille, nomPalette, taille) => {
  const p = PALETTES[nomPalette];
  const r = alea(numero * 7919 + famille.length * 104729);
  const corps = MOTEURS[famille](r, taille, taille, p);
  const grain = (0.4 + r() * 0.5).toFixed(2);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${taille}" height="${taille}" viewBox="0 0 ${taille} ${taille}">
<defs>
  <filter id="flou"><feGaussianBlur stdDeviation="${(taille * 0.006).toFixed(1)}"/></filter>
  <filter id="grain" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" seed="${numero}" stitchTiles="stitch"/>
    <feColorMatrix type="saturate" values="0"/>
    <feComponentTransfer><feFuncA type="linear" slope="${grain}"/></feComponentTransfer>
  </filter>
  <clipPath id="cadre"><rect x="0" y="0" width="${taille}" height="${taille}"/></clipPath>
</defs>
<rect width="${taille}" height="${taille}" fill="${p.fond}"/>
<g clip-path="url(#cadre)">${enrouler(taille, taille, corps)}</g>
<rect width="${taille}" height="${taille}" filter="url(#grain)" opacity="0.22" style="mix-blend-mode:overlay"/>
</svg>`;
};

/** Composition centrée pour l'impression sur vêtement déjà cousu, fond transparent. */
const svgDevant = (numero, famille, nomPalette, largeur) => {
  const p = PALETTES[nomPalette];
  const hauteur = Math.round(largeur * 1.333);
  const r = alea(numero * 6971 + 31);
  const corps = MOTEURS[famille](r, largeur, hauteur, p);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${largeur}" height="${hauteur}" viewBox="0 0 ${largeur} ${hauteur}">
<defs>
  <filter id="flou"><feGaussianBlur stdDeviation="${(largeur * 0.005).toFixed(1)}"/></filter>
  <radialGradient id="fondu">
    <stop offset="0.55" stop-color="#fff" stop-opacity="1"/>
    <stop offset="1" stop-color="#fff" stop-opacity="0"/>
  </radialGradient>
  <mask id="masque"><rect width="${largeur}" height="${hauteur}" fill="url(#fondu)"/></mask>
</defs>
<g mask="url(#masque)">${corps}</g>
</svg>`;
};

/** Page HTML qui répète la tuile pour obtenir le fichier d'impression all-over print. */
const htmlFeuille = (svg, tuile, feuille) => {
  const b64 = Buffer.from(svg, 'utf8').toString('base64');
  return `<!doctype html><html><head><style>
html,body{margin:0;padding:0}
body{width:${feuille}px;height:${feuille}px;
background-image:url("data:image/svg+xml;base64,${b64}");
background-size:${tuile}px ${tuile}px;background-repeat:repeat}
</style></head><body></body></html>`;
};

// ---------------------------------------------------------------- rendu

const rendre = async (page, contenu, largeur, hauteur, chemin, transparent = false) => {
  await page.setViewport({ width: largeur, height: hauteur, deviceScaleFactor: 1 });
  await page.setContent(contenu, { waitUntil: 'load' });
  await page.screenshot({ path: chemin, omitBackground: transparent, captureBeyondViewport: false });
};

const main = async () => {
  fs.mkdirSync(SORTIE, { recursive: true });

  const index = [];
  // Tirage EQUILIBRE, pas aleatoire: un tirage au sort sur 12 motifs donnait 6 lavis et
  // zero coulure. On parcourt les familles et les palettes en rotation, avec un decalage
  // par numero pour que deux series consecutives ne se ressemblent pas.
  const plan = [];
  const noms = Object.keys(PALETTES);
  for (let i = 0; i < NB; i++) {
    const numero = DEBUT + i;
    const famille = FAMILLE_FIXE || FAMILLES[i % FAMILLES.length];
    const palette = noms[(i + Math.floor(i / FAMILLES.length)) % noms.length];
    plan.push({ numero, famille, palette });
  }

  console.log(`${plan.length} motifs, tuile ${TUILE}px, feuille ${FEUILLE}px, devant ${DEVANT}px`);
  if (FAMILLE_FIXE && !MOTEURS[FAMILLE_FIXE]) {
    throw new Error(`famille inconnue: ${FAMILLE_FIXE}. Choix: ${FAMILLES.join(', ')}`);
  }

  // les SVG d'abord, ils ne coutent rien et servent de repli si le navigateur manque
  for (const m of plan) {
    const base = `${String(m.numero).padStart(3, '0')}-${m.famille}`;
    fs.writeFileSync(path.join(SORTIE, `${base}-tuile.svg`), svgTuile(m.numero, m.famille, m.palette, TUILE));
    fs.writeFileSync(path.join(SORTIE, `${base}-devant.svg`), svgDevant(m.numero, m.famille, m.palette, DEVANT));
    index.push({
      numero: m.numero,
      famille: m.famille,
      palette: m.palette,
      graine: m.numero * 7919 + m.famille.length * 104729,
      fichiers: [`${base}-tuile.png`, `${base}-feuille.png`, `${base}-devant.png`],
    });
  }
  fs.writeFileSync(path.join(SORTIE, 'index.json'), JSON.stringify(index, null, 2));

  if (SVG_SEUL) {
    console.log(`SVG seuls écrits dans ${SORTIE}`);
    return;
  }

  const { default: puppeteer } = await import('puppeteer-core');
  const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
  const navigateur = await puppeteer.launch({
    executablePath: navigateur(),
    headless: true,
    args: ['--force-device-scale-factor=1', '--disable-lcd-text', '--no-sandbox'],
  });
  const page = await navigateur.newPage();

  let n = 0;
  for (const m of plan) {
    const base = `${String(m.numero).padStart(3, '0')}-${m.famille}`;
    const svg = svgTuile(m.numero, m.famille, m.palette, TUILE);

    await rendre(page, svg, TUILE, TUILE, path.join(SORTIE, `${base}-tuile.png`));
    await rendre(
      page,
      htmlFeuille(svg, TUILE, FEUILLE),
      FEUILLE,
      FEUILLE,
      path.join(SORTIE, `${base}-feuille.png`),
    );
    const devant = svgDevant(m.numero, m.famille, m.palette, DEVANT);
    await rendre(page, devant, DEVANT, Math.round(DEVANT * 1.333), path.join(SORTIE, `${base}-devant.png`), true);

    n++;
    const ko = (f) => Math.round(fs.statSync(path.join(SORTIE, f)).size / 1024);
    console.log(
      `  ${base.padEnd(20)} ${m.palette.padEnd(9)} tuile ${ko(`${base}-tuile.png`)} ko, ` +
        `feuille ${ko(`${base}-feuille.png`)} ko, devant ${ko(`${base}-devant.png`)} ko`,
    );
  }

  await navigateur.close();
  console.log(`\n${n} motifs écrits dans ${SORTIE}`);
  console.log(`index.json garde numéro, famille, palette et graine : un motif se regénère à l'identique.`);
  console.log(`\nLa tuile est sans raccord. La feuille est la tuile répétée, c'est le fichier`);
  console.log(`all-over print. Le devant est sur fond transparent, pour l'impression classique.`);
};

main().catch((e) => {
  console.error(`ECHEC : ${e.message}`);
  process.exit(1);
});
