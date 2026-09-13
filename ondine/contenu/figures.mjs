/**
 * Les silhouettes de la marque : chargement et placement.
 *
 * Les fichiers viennent de la bibliothèque CC0 moissonnée, et la liste de celles qui sont
 * retenues, avec leur rôle, vit dans `selection.json`. Leur provenance et leur licence sont
 * dans `bibliotheque/catalogue.json`, c'est la preuve de nos droits.
 *
 * Deux précautions dans le chargement :
 *   - les couleurs d'origine sont remplacées par `currentColor`, sinon une silhouette
 *     arriverait en orange ou en bleu au milieu de la palette de la marque
 *   - les balises `<g>` non fermées sont recomptées et refermées, plusieurs fichiers
 *     d'Openclipart sont mal formés et faisaient disparaître tout ce qui suit
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ICI = path.dirname(fileURLToPath(import.meta.url));

export const charger = (fichier) => {
  const brut = fs.readFileSync(path.join(ICI, fichier), 'utf8');
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
  return { dedans, vx, vy, vw, vh };
};

/** Pose une silhouette dans un cadre, en respectant ses proportions. */
export const placer = (p, x, y, largeur, hauteur, couleur, miroir = false) => {
  const k = Math.min(largeur / p.vw, hauteur / p.vh);
  const dx = x + (largeur - p.vw * k) / 2;
  const dy = y + (hauteur - p.vh * k) / 2;
  const mir = miroir ? `translate(${(p.vw * k).toFixed(2)} 0) scale(-1 1) ` : '';
  return `<g color="${couleur}" fill="${couleur}" transform="translate(${dx.toFixed(2)} ${dy.toFixed(2)}) ${mir}scale(${k.toFixed(5)}) translate(${(-p.vx).toFixed(2)} ${(-p.vy).toFixed(2)})">${p.dedans}</g>`;
};

const sel = JSON.parse(fs.readFileSync(path.join(ICI, 'selection.json'), 'utf8'));

/** Toutes les silhouettes retenues d'un rôle, déjà chargées. */
export const parRole = (role) => sel.retenues.filter((x) => x.role === role).map((x) => charger(x.fichier));

export const tirer = (r, l) => l[Math.floor(r() * l.length)];
