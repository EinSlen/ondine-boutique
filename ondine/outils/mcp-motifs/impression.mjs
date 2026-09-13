/**
 * Du visuel généré au fichier que Printful accepte.
 *
 * POURQUOI CETTE ÉTAPE EXISTE : un modèle d'image sort du 1024 ou du 2048 carré, sur fond
 * plein, cadré comme une affiche. Envoyé tel quel à Printful, ça donne un petit dessin perdu
 * au milieu d'un grand vêtement, avec un rectangle de fond visible autour. Le fichier
 * d'impression attendu est du 4500 x 5400 à 300 dpi, à fond réellement transparent, recadré
 * sur le dessin. C'est la même correction que `recadrer` applique déjà côté typographie dans
 * `contenu/encre.mjs`.
 *
 * POURQUOI LE DÉTOURAGE EST FAIT ICI ET PAS CHEZ LE FOURNISSEUR : nos motifs sont des aplats
 * très contrastés sur un fond plat. Un écart de couleur au fond sampé aux quatre coins les
 * détache proprement, gratuitement et hors ligne. Le détourage par modèle (`fal.MODELES
 * .detourage`) reste utile pour un sujet photographique, pas pour de l'encre.
 */

import { readFileSync, writeFileSync } from 'node:fs';

import { navigateur } from '../../contenu/navigateur.mjs';

/** Format du fichier d'impression Printful en impression directe sur textile, 300 dpi. */
export const PRINTFUL = { largeur: 4500, hauteur: 5400 };

/**
 * Tourne DANS la page. Détache le fond, recadre sur le dessin, puis repose le dessin sur une
 * toile transparente au format d'impression.
 *
 * La zone de tolérance est double : en dessous de `tol` le pixel devient transparent, entre
 * `tol` et `tol * 1.7` il devient partiellement transparent. Sans cette bande intermédiaire
 * le contour ressortait en escalier, ce qui se voit immédiatement sur un vêtement.
 */
const traiter = async ({ source, largeur, hauteur, marge, tol, contraste }) => {
  const img = new Image();
  img.src = source;
  await img.decode();

  const t = document.createElement('canvas');
  t.width = img.naturalWidth;
  t.height = img.naturalHeight;
  const c = t.getContext('2d', { willReadFrequently: true });
  c.drawImage(img, 0, 0);
  const d = c.getImageData(0, 0, t.width, t.height);
  const px = d.data;

  // Fond estimé par la médiane des quatre coins : une moyenne se ferait tirer par un coin
  // où la peinture a débordé.
  const coin = (x, y) => {
    const i = (y * t.width + x) * 4;
    return [px[i], px[i + 1], px[i + 2]];
  };
  const coins = [
    coin(2, 2),
    coin(t.width - 3, 2),
    coin(2, t.height - 3),
    coin(t.width - 3, t.height - 3),
  ];
  const fond = [0, 1, 2].map((k) => {
    const v = coins.map((q) => q[k]).sort((a, b) => a - b);
    return (v[1] + v[2]) / 2;
  });

  const dejaTransparent = px[3] === 0 && px[(t.width * t.height - 1) * 4 + 3] === 0;

  let x0 = t.width;
  let y0 = t.height;
  let x1 = 0;
  let y1 = 0;
  for (let i = 0; i < px.length; i += 4) {
    if (!dejaTransparent) {
      const e = Math.hypot(px[i] - fond[0], px[i + 1] - fond[1], px[i + 2] - fond[2]);
      if (e < tol) px[i + 3] = 0;
      else if (e < tol * 1.7) px[i + 3] = Math.round(255 * ((e - tol) / (tol * 0.7)));
    }
    if (px[i + 3] > 8) {
      const p = i / 4;
      const x = p % t.width;
      const y = (p - x) / t.width;
      if (x < x0) x0 = x;
      if (y < y0) y0 = y;
      if (x > x1) x1 = x;
      if (y > y1) y1 = y;
    }
  }
  if (x1 <= x0 || y1 <= y0) throw new Error('image vide après détourage : le fond n\'est pas plat');

  if (contraste > 1) {
    for (let i = 0; i < px.length; i += 4) {
      if (px[i + 3] === 0) continue;
      for (let k = 0; k < 3; k++) {
        px[i + k] = Math.max(0, Math.min(255, (px[i + k] - 128) * contraste + 128));
      }
    }
  }
  c.putImageData(d, 0, 0);

  const dessin = { x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1 };
  const sortie = document.createElement('canvas');
  sortie.width = largeur;
  sortie.height = hauteur;
  const s = sortie.getContext('2d');
  s.imageSmoothingQuality = 'high';

  const dispoL = largeur - marge * 2;
  const dispoH = hauteur - marge * 2;
  const ech = Math.min(dispoL / dessin.w, dispoH / dessin.h);
  const finL = dessin.w * ech;
  const finH = dessin.h * ech;
  s.drawImage(
    t,
    dessin.x,
    dessin.y,
    dessin.w,
    dessin.h,
    (largeur - finL) / 2,
    (hauteur - finH) / 2,
    finL,
    finH,
  );

  return {
    donnees: sortie.toDataURL('image/png'),
    couvert: Math.round((finL / largeur) * 100),
    fond: dejaTransparent ? 'déjà transparent' : `détaché de rgb(${fond.map(Math.round).join(',')})`,
  };
};

/**
 * @param {string} entree  PNG source
 * @param {string} sortie  PNG d'impression à écrire
 */
export const versImpression = async (entree, sortie, opts = {}) => {
  const {
    largeur = PRINTFUL.largeur,
    hauteur = PRINTFUL.hauteur,
    marge = 120,
    tol = 42,
    contraste = 1,
  } = opts;

  const { default: puppeteer } = await import('puppeteer-core');
  const nav = await puppeteer.launch({
    executablePath: navigateur(),
    headless: true,
    args: ['--no-sandbox'],
  });
  try {
    const page = await nav.newPage();
    const source = `data:image/png;base64,${readFileSync(entree).toString('base64')}`;
    const res = await page.evaluate(traiter, { source, largeur, hauteur, marge, tol, contraste });
    writeFileSync(sortie, Buffer.from(res.donnees.split(',')[1], 'base64'));
    return {
      fichier: sortie,
      taille: `${largeur} x ${hauteur}`,
      fond: res.fond,
      largeurOccupee: `${res.couvert} % de la zone imprimable`,
    };
  } finally {
    await nav.close();
  }
};
