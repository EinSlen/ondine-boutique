/**
 * Le mot-symbole dead2me, tracé avec la même encre que les vêtements.
 *
 * POURQUOI CE FICHIER : la boutique portait « dead2me » en Space Mono, c'est-à-dire la police
 * du thème. Un nom composé dans la police du thème n'est pas une marque, c'est une étiquette,
 * et c'est le premier écart visible avec les boutiques du créneau, qui posent toutes une
 * griffe dessinée en haut de page. Le mot passe donc ici sous `filtres`, exactement comme le
 * texte des pièces : tordu puis rongé. La marque et le vêtement ont ainsi la même main.
 *
 * Fond transparent et encre blanche par défaut, parce que l'en-tête de la boutique est noir.
 * `--sombre` sort la version encre noire pour un fond clair, à garder pour les factures et
 * les fonds crème.
 *
 * Usage :
 *   node logo.mjs                    la planche des traitements, pour choisir
 *   node logo.mjs --seul 3           un seul traitement, en grand
 *   node logo.mjs --seul 3 --sombre  encre noire sur transparent
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
  mot,
  prechauffer,
  recadrer,
  surete,
} from './encre.mjs';
import { navigateur } from './navigateur.mjs';

const ICI = path.dirname(fileURLToPath(import.meta.url));
const SORTIE = path.join(ICI, 'logo');

const arg = (n, d) => {
  const i = process.argv.indexOf(`--${n}`);
  return i > -1 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--')
    ? process.argv[i + 1]
    : d;
};
const SEUL = arg('seul', null);
const SOMBRE = process.argv.includes('--sombre');
const ENCRE = SOMBRE ? '#141210' : '#ece7dd';
const ACCENT = SOMBRE ? '#7c0d11' : '#8f1116';
const MOT = 'dead2me';

// Une planche large : le mot-symbole se lit en bandeau, pas en carré.
const W = SEUL ? 1800 : 1200;
const H = Math.round(W * 0.34);
const ECH = W / 900;

/**
 * Sept traitements, du plus sobre au plus sale. Ils changent la fonte, l'inclinaison et la
 * présence de coulures. Le reste, la torsion et le rongement, vient du filtre commun et reste
 * identique partout : c'est ce qui garantit que la griffe et les pièces ont la même main.
 */
const TRAITEMENTS = [
  { nom: 'manuscrit', fonte: FONTES.main, casse: (s) => s, incline: -2, gouttes: 1 },
  { nom: 'massue', fonte: FONTES.massue, casse: (s) => s.toUpperCase(), incline: 0, gouttes: 2 },
  { nom: 'condense', fonte: FONTES.condense, casse: (s) => s.toUpperCase(), incline: 0, gouttes: 0 },
  { nom: 'manuscrit-penche', fonte: FONTES.main, casse: (s) => s, incline: -6, gouttes: 2 },
  { nom: 'mono', fonte: FONTES.mono, casse: (s) => s, incline: 0, gouttes: 1 },
  { nom: 'serif', fonte: FONTES.serif, casse: (s) => s, incline: -1, gouttes: 0 },
  { nom: 'massue-penche', fonte: FONTES.massue, casse: (s) => s.toUpperCase(), incline: -4, gouttes: 3 },
];

const dessiner = (t, graine) => {
  const r = alea(graine);
  const texte = t.casse(MOT);
  const taille = H * 0.46;
  const lg = largeur(texte, taille, t.fonte);
  const y = H * 0.6;
  let s = mot(W * 0.5, y, texte, taille, t.fonte, ENCRE, { tient: W * 0.86, groupe: 'logo' });
  if (t.gouttes) s += coulures(r, W * 0.5, y + taille * 0.08, lg * 0.7, t.gouttes, W * 0.006, ACCENT);
  return t.incline
    ? `<g transform="rotate(${t.incline} ${W / 2} ${H / 2})">${s}</g>`
    : s;
};

const main = async () => {
  fs.mkdirSync(SORTIE, { recursive: true });
  surete(1);

  const { default: puppeteer } = await import('puppeteer-core');
  const nav = await puppeteer.launch({
    executablePath: navigateur(),
    headless: true,
    args: ['--no-sandbox', '--font-render-hinting=none'],
  });
  const page = await nav.newPage();
  await page.setViewport({ width: W, height: H, deviceScaleFactor: 1 });
  await prechauffer(page);

  const liste = SEUL ? [TRAITEMENTS[parseInt(SEUL, 10) - 1]] : TRAITEMENTS;
  const produits = [];
  for (let i = 0; i < liste.length; i++) {
    const t = liste[i];
    const n = SEUL ? parseInt(SEUL, 10) : i + 1;
    const r = alea(n * 4703 + 17);
    const svg =
      `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">` +
      filtres(r, W, ECH) +
      `<g id="contenu">${dessiner(t, n * 4703 + 17)}</g></svg>`;

    const nom = `${String(n).padStart(2, '0')}-${t.nom}${SOMBRE ? '-sombre' : ''}.png`;
    await page.setContent(svg, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(ajusterEnPage);
    // Sans recadrage la griffe garde les marges de la planche, et Shopify la réduit ensuite
    // dans l'en-tête : le mot finirait minuscule au milieu d'un grand vide transparent.
    const clip = await page.evaluate(recadrer, W * 0.02);
    await page.screenshot({ path: path.join(SORTIE, nom), omitBackground: true, clip });
    produits.push(nom);
  }

  await nav.close();
  console.log(`${produits.length} griffe(s) dans ${SORTIE}`);
  for (const p of produits) console.log(`  ${p}`);
};

main().catch((e) => {
  console.error(`ECHEC : ${e.message}`);
  process.exit(1);
});
