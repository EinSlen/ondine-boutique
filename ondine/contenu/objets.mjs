/**
 * Les objets de l'absence, dessinés en code.
 *
 * Ceux-là n'existent pas dans le fonds libre : une chaise RENVERSÉE, un lit défait d'un seul
 * côté, une valise posée à la porte. Ce sont des états, pas des objets, et aucun catalogue de
 * silhouettes ne les propose. Les dessiner donne le contrôle exact sur l'état, et supprime
 * toute question de licence.
 *
 * Tout est en formes PLEINES, comme les silhouettes de la bibliothèque : c'est le filtre
 * d'encre de `encre.mjs` qui apporte ensuite l'usure. Un dessin au trait fin ne tiendrait pas
 * à côté d'une silhouette pleine.
 *
 * Chaque fonction prend une boîte (x, y, w, h) et remplit au mieux dedans, comme `placer`.
 */

/** Un rectangle, éventuellement incliné autour de son centre. */
const bloc = (x, y, w, h, c, rot = 0) =>
  `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${Math.max(1, w).toFixed(1)}" height="${Math.max(1, h).toFixed(1)}" fill="${c}"` +
  (rot ? ` transform="rotate(${rot.toFixed(2)} ${(x + w / 2).toFixed(1)} ${(y + h / 2).toFixed(1)})"` : '') +
  '/>';

const poly = (pts, c) => `<polygon points="${pts.map(([a, b]) => `${a.toFixed(1)},${b.toFixed(1)}`).join(' ')}" fill="${c}"/>`;

const ellipse = (cx, cy, rx, ry, c, rot = 0) =>
  `<ellipse cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" rx="${rx.toFixed(1)}" ry="${ry.toFixed(1)}" fill="${c}"` +
  (rot ? ` transform="rotate(${rot.toFixed(2)} ${cx.toFixed(1)} ${cy.toFixed(1)})"` : '') +
  '/>';

/**
 * Une chaise en vue trois quarts. La face SUPÉRIEURE de l'assise est ce qui fait lire
 * « chaise » en un coup d'oeil : une chaise vue de face n'est qu'une grille de barreaux, et
 * renversée elle devient une échelle. D'où la projection oblique.
 */
const chaisePieces = (u, c) => {
  // projection oblique : la profondeur pousse vers la droite et vers le haut
  const P = (x, d, y) => [(x + 0.35 * d) * u, (y - 0.22 * d) * u];
  const q = (a, b, cc, dd) => poly([a, b, cc, dd], c);
  const ep = 0.05;
  let s = '';

  // l'assise, face supérieure puis son épaisseur vue de face
  const a1 = P(0, 0, 0);
  const a2 = P(0.58, 0, 0);
  const a3 = P(0.58, 0.42, 0);
  const a4 = P(0, 0.42, 0);
  s += q(a1, a2, a3, a4);
  s += q(a1, a2, P(0.58, 0, ep), P(0, 0, ep));
  s += q(a2, a3, P(0.58, 0.42, ep), P(0.58, 0, ep));

  // le dossier : deux montants sur l'arête arrière, plus une traverse haute
  const mont = 0.07;
  for (const x of [0, 0.58 - mont]) {
    const b1 = P(x, 0.42, 0);
    const b2 = P(x + mont, 0.42, 0);
    s += q(b1, b2, P(x + mont, 0.42, -0.62), P(x, 0.42, -0.62));
  }
  const t1 = P(0, 0.42, -0.62);
  const t2 = P(0.58, 0.42, -0.62);
  s += q(t1, t2, P(0.58, 0.42, -0.5), P(0, 0.42, -0.5));
  s += q(P(0, 0.42, -0.34), P(0.58, 0.42, -0.34), P(0.58, 0.42, -0.26), P(0, 0.42, -0.26));

  // les quatre pieds
  const pied = 0.055;
  for (const [x, d] of [
    [0, 0],
    [0.58 - pied, 0],
    [0, 0.42 - pied],
    [0.58 - pied, 0.42 - pied],
  ]) {
    const p1 = P(x, d, ep);
    const p2 = P(x + pied, d, ep);
    s += q(p1, p2, P(x + pied, d, ep + 0.46), P(x, d, ep + 0.46));
  }

  // l'entretoise basse, elle empêche de lire un tabouret
  s += q(P(0, 0, 0.38), P(0.58, 0, 0.38), P(0.58, 0, 0.44), P(0, 0, 0.44));
  return s;
};

/**
 * Une chaise vue de PROFIL. Sa silhouette est un « h » : montant de dossier qui monte haut,
 * assise qui part devant, pied avant, entretoise basse. C'est la seule vue qui reste lisible
 * une fois couchée : faire tourner la vue trois quarts casse la perspective et le résultat
 * lit comme un cadre vide.
 */
const chaiseProfil = (u, c) => {
  const ep = u * 0.085;
  let s = '';
  s += bloc(0, 0, ep, u * 1.0, c);
  s += bloc(-u * 0.03, 0, u * 0.15, ep, c);
  s += bloc(0, u * 0.5, u * 0.54, ep * 1.25, c);
  s += bloc(u * 0.45, u * 0.55, ep, u * 0.45, c);
  s += bloc(0, u * 0.84, u * 0.54, ep * 0.7, c);
  return s;
};

/**
 * La chaise renversée. Couchée à plat elle devient une forme abstraite, quel que soit le
 * point de vue : à 90 degrés une chaise n'est plus qu'un « h » posé. On la basculine donc à
 * cinquante-cinq degrés, où elle reste identifiable, et c'est la LIGNE DE SOL qui dit qu'elle
 * est tombée.
 */
export const chaiseRenversee = (r, x, y, w, h, c) => {
  const u = Math.min(w / 1.15, h / 0.9) * 0.86;
  const angle = 57 + (r() - 0.5) * 12;
  const cx = 0.36 * u;
  const cy = -0.1 * u;
  const dx = x + w * 0.44 - cx;
  const dy = y + h * 0.42 - cy;
  return (
    `<g transform="translate(${dx.toFixed(1)} ${dy.toFixed(1)}) rotate(${angle.toFixed(1)} ${cx.toFixed(1)} ${cy.toFixed(1)})">` +
    chaisePieces(u, c) +
    '</g>' +
    bloc(x, y + h * 0.87, w, h * 0.05, c)
  );
};

/** La même, debout et vide. */
export const chaiseVide = (r, x, y, w, h, c) => {
  const u = Math.min(w / 0.75, h / 1.15) * 0.94;
  const dx = x + w * 0.1;
  const dy = y + h * 0.62;
  return `<g transform="translate(${dx.toFixed(1)} ${dy.toFixed(1)}) rotate(${((r() - 0.5) * 3).toFixed(1)})">${chaisePieces(u, c)}</g>`;
};

/** Une valise posée, poignée relevée, deux fermoirs et une sangle. */
export const valise = (r, x, y, w, h, c) => {
  const u = Math.min(w / 0.9, h / 1.0);
  const bx = x + (w - u * 0.9) / 2;
  const by = y + h - u * 0.66;
  let s = '';
  // la poignée, un arc épais
  const hx = bx + u * 0.45;
  s += `<path d="M ${(hx - u * 0.17).toFixed(1)} ${by.toFixed(1)} L ${(hx - u * 0.17).toFixed(1)} ${(by - u * 0.2).toFixed(1)} ` +
    `Q ${hx.toFixed(1)} ${(by - u * 0.32).toFixed(1)} ${(hx + u * 0.17).toFixed(1)} ${(by - u * 0.2).toFixed(1)} ` +
    `L ${(hx + u * 0.17).toFixed(1)} ${by.toFixed(1)} L ${(hx + u * 0.12).toFixed(1)} ${by.toFixed(1)} ` +
    `L ${(hx + u * 0.12).toFixed(1)} ${(by - u * 0.18).toFixed(1)} Q ${hx.toFixed(1)} ${(by - u * 0.26).toFixed(1)} ` +
    `${(hx - u * 0.12).toFixed(1)} ${(by - u * 0.18).toFixed(1)} L ${(hx - u * 0.12).toFixed(1)} ${by.toFixed(1)} Z" fill="${c}"/>`;
  // le corps
  s += `<rect x="${bx.toFixed(1)}" y="${by.toFixed(1)}" width="${(u * 0.9).toFixed(1)}" height="${(u * 0.6).toFixed(1)}" rx="${(u * 0.05).toFixed(1)}" fill="${c}"/>`;
  // la ligne d'ouverture et les fermoirs, en creux
  // les fermoirs dépassent du bord haut, sinon ils sont invisibles dans une forme pleine
  s += `<rect x="${(bx + u * 0.16).toFixed(1)}" y="${(by - u * 0.05).toFixed(1)}" width="${(u * 0.11).toFixed(1)}" height="${(u * 0.09).toFixed(1)}" fill="${c}"/>`;
  s += `<rect x="${(bx + u * 0.63).toFixed(1)}" y="${(by - u * 0.05).toFixed(1)}" width="${(u * 0.11).toFixed(1)}" height="${(u * 0.09).toFixed(1)}" fill="${c}"/>`;
  // la sangle verticale
  s += bloc(bx + u * 0.38, by, u * 0.09, u * 0.6, c);
  return s;
};

/** Le chambranle d'une porte ouverte : deux jambages et un linteau. */
export const porte = (r, x, y, w, h, c) => {
  const ep = Math.min(w, h) * 0.05;
  let s = bloc(x, y, ep, h, c);
  s += bloc(x + w - ep, y, ep, h, c);
  s += bloc(x, y, w, ep, c);
  // le battant entrouvert, en biais
  s += poly(
    [
      [x + w - ep, y + ep],
      [x + w + w * 0.16, y + h * 0.06],
      [x + w + w * 0.16, y + h * 0.96],
      [x + w - ep, y + h],
    ],
    c,
  );
  return s;
};

/**
 * Un lit vu de dessus, défait d'un seul côté : la couette est repoussée sur la droite, le
 * drap est nu à gauche, et un seul des deux oreillers est creusé.
 */
export const litDefait = (r, x, y, w, h, c) => {
  const bw = Math.min(w, h * 1.35);
  const bh = bw / 1.35;
  const bx = x + (w - bw) / 2;
  const by = y + (h - bh) / 2;
  let s = '';
  // la tête de lit
  s += bloc(bx - bw * 0.02, by - bh * 0.06, bw * 1.04, bh * 0.07, c);
  // le contour du matelas, en cadre plein fin
  const ep = bw * 0.016;
  s += bloc(bx, by, bw, ep, c);
  s += bloc(bx, by + bh - ep, bw, ep, c);
  s += bloc(bx, by, ep, bh, c);
  s += bloc(bx + bw - ep, by, ep, bh, c);
  // la couette, repoussée : elle ne couvre que la moitié droite, avec un bord replié
  const gx = bx + bw * 0.46;
  s += poly(
    [
      [gx + bw * 0.06, by + bh * 0.3],
      [gx + bw * 0.02, by + bh * 0.46],
      [gx + bw * 0.1, by + bh * 0.62],
      [gx + bw * 0.03, by + bh * 0.8],
      [bx + bw * 0.98, by + bh * 0.96],
      [bx + bw * 0.98, by + bh * 0.28],
    ],
    c,
  );
  // le pli du rabat, une bande qui suit le bord
  s += poly(
    [
      [gx + bw * 0.06, by + bh * 0.3],
      [gx + bw * 0.02, by + bh * 0.46],
      [gx + bw * 0.1, by + bh * 0.62],
      [gx + bw * 0.03, by + bh * 0.8],
      [gx - bw * 0.04, by + bh * 0.78],
      [gx + bw * 0.03, by + bh * 0.6],
      [gx - bw * 0.05, by + bh * 0.44],
      [gx - bw * 0.01, by + bh * 0.28],
    ],
    c,
  );
  // les deux oreillers : celui de gauche est creusé, celui de droite est intact
  s += `<path d="M ${(bx + bw * 0.06).toFixed(1)} ${(by + bh * 0.06).toFixed(1)} ` +
    `Q ${(bx + bw * 0.24).toFixed(1)} ${(by - bh * 0.02).toFixed(1)} ${(bx + bw * 0.42).toFixed(1)} ${(by + bh * 0.06).toFixed(1)} ` +
    `Q ${(bx + bw * 0.36).toFixed(1)} ${(by + bh * 0.16).toFixed(1)} ${(bx + bw * 0.24).toFixed(1)} ${(by + bh * 0.13).toFixed(1)} ` +
    `Q ${(bx + bw * 0.12).toFixed(1)} ${(by + bh * 0.2).toFixed(1)} ${(bx + bw * 0.06).toFixed(1)} ${(by + bh * 0.06).toFixed(1)} Z" fill="${c}"/>`;
  s += `<path d="M ${(bx + bw * 0.56).toFixed(1)} ${(by + bh * 0.05).toFixed(1)} ` +
    `Q ${(bx + bw * 0.76).toFixed(1)} ${(by - bh * 0.03).toFixed(1)} ${(bx + bw * 0.94).toFixed(1)} ${(by + bh * 0.05).toFixed(1)} ` +
    `Q ${(bx + bw * 0.96).toFixed(1)} ${(by + bh * 0.17).toFixed(1)} ${(bx + bw * 0.75).toFixed(1)} ${(by + bh * 0.19).toFixed(1)} ` +
    `Q ${(bx + bw * 0.54).toFixed(1)} ${(by + bh * 0.17).toFixed(1)} ${(bx + bw * 0.56).toFixed(1)} ${(by + bh * 0.05).toFixed(1)} Z" fill="${c}"/>`;
  return s;
};

/**
 * Une place vide à table : la chaise derrière, le plateau, une assiette et un verre renversé.
 *
 * La couleur de fond est nécessaire : une assiette pleine n'est qu'un disque, il faut évider
 * son centre pour qu'elle lise comme une assiette.
 */
export const placeVide = (r, x, y, w, h, c, fond = '#0d0d0f') => {
  const ty = y + h * 0.62;
  let s = chaiseVide(r, x + w * 0.22, y - h * 0.02, w * 0.56, h * 0.78, c);
  // le plateau de table, une bande épaisse qui traverse tout
  s += bloc(x, ty, w, h * 0.075, c);
  // l'assiette, évidée
  const cx = x + w * 0.5;
  const ay = ty - h * 0.035;
  s += ellipse(cx, ay, w * 0.17, w * 0.062, c);
  s += ellipse(cx, ay, w * 0.115, w * 0.036, fond);
  // les couverts, de part et d'autre
  s += bloc(cx - w * 0.26, ty - h * 0.055, w * 0.022, h * 0.055, c);
  s += bloc(cx + w * 0.24, ty - h * 0.055, w * 0.022, h * 0.055, c);
  // un verre renversé, couché sur le plateau
  s += poly(
    [
      [cx + w * 0.31, ty - h * 0.012],
      [cx + w * 0.45, ty - h * 0.042],
      [cx + w * 0.45, ty - h * 0.002],
      [cx + w * 0.31, ty + h * 0.004],
    ],
    c,
  );
  s += bloc(cx + w * 0.44, ty - h * 0.048, w * 0.018, h * 0.05, c);
  return s;
};

/** Un téléphone posé écran contre la table, avec son bloc photo. */
export const telephoneRetourne = (r, x, y, w, h, c) => {
  const tw = Math.min(w * 0.42, h * 0.5);
  const th = tw * 2.02;
  const tx = x + (w - tw) / 2;
  const ty = y + (h - th) / 2;
  const rot = -14 + (r() - 0.5) * 16;
  let s = `<g transform="rotate(${rot.toFixed(1)} ${(tx + tw / 2).toFixed(1)} ${(ty + th / 2).toFixed(1)})">`;
  s += `<rect x="${tx.toFixed(1)}" y="${ty.toFixed(1)}" width="${tw.toFixed(1)}" height="${th.toFixed(1)}" rx="${(tw * 0.14).toFixed(1)}" fill="${c}"/>`;
  // le bloc photo, en creux
  s += `<rect x="${(tx + tw * 0.12).toFixed(1)}" y="${(ty + th * 0.05).toFixed(1)}" width="${(tw * 0.34).toFixed(1)}" height="${(tw * 0.34).toFixed(1)}" rx="${(tw * 0.09).toFixed(1)}" fill="#000"/>`;
  s += `<circle cx="${(tx + tw * 0.22).toFixed(1)}" cy="${(ty + th * 0.05 + tw * 0.1).toFixed(1)}" r="${(tw * 0.055).toFixed(1)}" fill="${c}"/>`;
  s += `<circle cx="${(tx + tw * 0.36).toFixed(1)}" cy="${(ty + th * 0.05 + tw * 0.24).toFixed(1)}" r="${(tw * 0.055).toFixed(1)}" fill="${c}"/>`;
  s += '</g>';
  // la surface sur laquelle il est posé
  return s;
};
