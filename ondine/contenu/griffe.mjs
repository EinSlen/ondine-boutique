/**
 * Moteur « griffe » : le geste à la main, pas le vecteur propre.
 *
 * Trois axes relevés sur les pièces de live2die et de RawSoult, et qui manquaient à mes
 * essais précédents, tous jugés hors sujet :
 *
 *   1. LE TRAIT TREMBLÉ. Rien n'est droit. Chaque segment est perturbé par du bruit, avec
 *      une épaisseur qui varie et des bouts qui dépassent, comme un feutre sur du tissu.
 *   2. L'ASYMÉTRIE. Les figures sont petites, décentrées, perdues dans un grand vide. Une
 *      composition centrée et symétrique fait affiche, pas vêtement peint.
 *   3. LA TACHE QUI COULE. Le rouge n'est pas réparti, il part d'un point et dégouline vers
 *      le bas, avec des gouttes qui se détachent.
 *
 * Deux registres :
 *   --style raw     gribouillage au stylo sur fond clair, texte manuscrit, quelques gouttes
 *                   sombres. C'est la signature de RawSoult, entièrement reproductible.
 *   --style peint   pochoir sale sur fond noir, coulures rouges, écriture griffée.
 *
 * Usage :
 *   node griffe.mjs --nb 40
 *   node griffe.mjs --nb 20 --style raw
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { navigateur } from './navigateur.mjs';

const ICI = path.dirname(fileURLToPath(import.meta.url));
const SORTIE = path.join(ICI, 'griffes');

const arg = (n, d) => {
  const i = process.argv.indexOf(`--${n}`);
  return i > -1 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--')
    ? process.argv[i + 1]
    : d;
};
const NB = parseInt(arg('nb', '40'), 10);
const STYLE_FIXE = arg('style', null);
const W = parseInt(arg('taille', '900'), 10);
const H = Math.round(W * 1.25);

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

// ---------------------------------------------------------------- trait tremblé
/**
 * Segmente une ligne et déplace chaque point au hasard : c'est ce tremblement qui fait
 * lire un geste humain. Un `<line>` droit trahit immédiatement le vecteur.
 */
const trait = (r, x1, y1, x2, y2, ep, c, bruit = 1) => {
  const long = Math.hypot(x2 - x1, y2 - y1);
  const n = Math.max(3, Math.round(long / 14));
  const amp = bruit * Math.max(1.4, long * 0.02);
  let d = '';
  // les bouts dépassent un peu, comme un feutre qui part et revient
  const depX = (r() - 0.5) * amp * 2;
  const depY = (r() - 0.5) * amp * 2;
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const x = x1 + (x2 - x1) * t + (r() - 0.5) * amp + (i === 0 ? depX : 0);
    const y = y1 + (y2 - y1) * t + (r() - 0.5) * amp + (i === 0 ? depY : 0);
    d += `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)} `;
  }
  return `<path d="${d}" fill="none" stroke="${c}" stroke-width="${(ep * (0.75 + r() * 0.6)).toFixed(1)}" stroke-linecap="round" stroke-linejoin="round" opacity="${(0.82 + r() * 0.18).toFixed(2)}"/>`;
};

const cercle = (r, cx, cy, rayon, ep, c) => {
  const n = 16;
  let d = '';
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * Math.PI * 2;
    const rr = rayon * (0.86 + r() * 0.28);
    const x = cx + Math.cos(a) * rr;
    const y = cy + Math.sin(a) * rr;
    d += `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)} `;
  }
  return `<path d="${d}Z" fill="none" stroke="${c}" stroke-width="${(ep * (0.8 + r() * 0.5)).toFixed(1)}" stroke-linecap="round" opacity="0.9"/>`;
};

// ---------------------------------------------------------------- bonhommes
/**
 * Bonhomme bâton au stylo. C'est exactement le registre de RawSoult : une tête, un corps,
 * quatre traits, tout de travers. Ce qui compte est la POSE, pas l'anatomie.
 */
const bonhomme = (r, x, y, h, ep, c, pose) => {
  const u = h / 100;
  const P = (a, b) => [x + a * u, y + b * u];
  const L = (p1, p2, e = 1) => trait(r, p1[0], p1[1], p2[0], p2[1], ep * e, c);
  let s = cercle(r, x, y - 88 * u, 11 * u, ep, c);

  if (pose === 'debout') {
    s += L(P(0, -77), P(0, -34));
    s += L(P(0, -68), P(-16, -50));
    s += L(P(0, -68), P(16, -50));
    s += L(P(0, -34), P(-13, 0));
    s += L(P(0, -34), P(13, 0));
  } else if (pose === 'assis') {
    s += L(P(0, -77), P(0, -40));
    s += L(P(0, -70), P(-15, -54));
    s += L(P(0, -70), P(14, -56));
    s += L(P(0, -40), P(20, -38));
    s += L(P(20, -38), P(22, -6));
    s += L(P(0, -40), P(-4, -8));
    // la chaise, trois traits
    s += L(P(-8, -40), P(30, -40), 0.8);
    s += L(P(-8, -40), P(-8, -4), 0.8);
    s += L(P(28, -40), P(28, -4), 0.8);
    s += L(P(-8, -62), P(-8, -40), 0.8);
  } else if (pose === 'tombe') {
    // au sol, vu de cote: tete a gauche, corps allonge, jambes pliees. La version
    // precedente etait illisible, elle ressemblait a une fleche.
    s = cercle(r, x - 46 * u, y - 16 * u, 12 * u, ep, c);
    s += L(P(-34, -14), P(10, -12));      // tronc
    s += L(P(-26, -14), P(-30, 4));       // bras qui tombe
    s += L(P(-20, -13), P(-14, -32));     // bras leve
    s += L(P(10, -12), P(30, -20));       // cuisse
    s += L(P(30, -20), P(42, -2));        // tibia plie
    s += L(P(10, -12), P(28, 2));         // autre jambe
    s += L(P(-40, 2), P(46, 2), 0.6);     // le sol
  } else if (pose === 'court') {
    s += L(P(2, -77), P(-2, -36));
    s += L(P(0, -68), P(-20, -58));
    s += L(P(0, -68), P(18, -74));
    s += L(P(-2, -36), P(-24, -8));
    s += L(P(-2, -36), P(16, -4));
  } else if (pose === 'tete-mains') {
    s += L(P(0, -77), P(0, -36));
    s += L(P(0, -70), P(-14, -82));
    s += L(P(0, -70), P(14, -82));
    s += L(P(0, -36), P(-12, 0));
    s += L(P(0, -36), P(12, 0));
  }
  return s;
};

// ---------------------------------------------------------------- coulures
/**
 * Une tache qui part d'un point et dégouline. Le rouge de leurs pièces n'est pas réparti
 * uniformément, il vient d'un endroit et descend.
 */
const coulure = (r, x, y, taille, c) => {
  let s = '';
  // la masse de départ, contour irrégulier
  const n = 11;
  let d = '';
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * Math.PI * 2;
    const rr = taille * (0.5 + r() * 0.85);
    d += `${i === 0 ? 'M' : 'L'} ${(x + Math.cos(a) * rr).toFixed(1)} ${(y + Math.sin(a) * rr * 0.8).toFixed(1)} `;
  }
  s += `<path d="${d}Z" fill="${c}" opacity="${(0.85 + r() * 0.15).toFixed(2)}"/>`;

  // les coulées qui descendent, largeur qui se réduit
  const coulees = 2 + Math.floor(r() * 4);
  for (let i = 0; i < coulees; i++) {
    const cx = x + (r() - 0.5) * taille * 1.4;
    const long = taille * (1.5 + r() * 6);
    const larg = taille * (0.1 + r() * 0.22);
    const derive = (r() - 0.5) * taille * 0.5;
    s +=
      `<path d="M ${(cx - larg).toFixed(1)} ${y.toFixed(1)} ` +
      `Q ${(cx - larg * 0.6 + derive).toFixed(1)} ${(y + long * 0.6).toFixed(1)} ` +
      `${(cx + derive).toFixed(1)} ${(y + long).toFixed(1)} ` +
      `Q ${(cx + larg * 0.6 + derive).toFixed(1)} ${(y + long * 0.6).toFixed(1)} ` +
      `${(cx + larg).toFixed(1)} ${y.toFixed(1)} Z" fill="${c}" opacity="${(0.8 + r() * 0.2).toFixed(2)}"/>`;
    // la goutte au bout, détachée
    if (r() > 0.4) {
      s += `<ellipse cx="${(cx + derive).toFixed(1)}" cy="${(y + long + taille * 0.35).toFixed(1)}" rx="${(larg * 0.8).toFixed(1)}" ry="${(larg * 1.1).toFixed(1)}" fill="${c}" opacity="0.85"/>`;
    }
  }
  // projections fines autour
  for (let i = 0; i < 14; i++) {
    const a = r() * Math.PI * 2;
    const dist = taille * (1.2 + r() * 3.5);
    s += `<circle cx="${(x + Math.cos(a) * dist).toFixed(1)}" cy="${(y + Math.sin(a) * dist).toFixed(1)}" r="${(taille * (0.04 + r() * 0.13)).toFixed(1)}" fill="${c}" opacity="${(0.6 + r() * 0.4).toFixed(2)}"/>`;
  }
  return s;
};

// ---------------------------------------------------------------- écriture
/** Texte manuscrit, penché, jamais centré proprement. */
const ecriture = (r, x, y, texte, taille, c, rot) => {
  const police = "'Ink Free','Segoe Script','Comic Sans MS',cursive";
  return `<text x="${x.toFixed(0)}" y="${y.toFixed(0)}" font-family="${police}" font-size="${taille.toFixed(0)}" fill="${c}" transform="rotate(${rot.toFixed(1)} ${x.toFixed(0)} ${y.toFixed(0)})" opacity="0.95">${texte}</text>`;
};

const PHRASES = [
  'dead to me', 'no reply', 'you first', 'still nothing', 'she left twice',
  'don’t wait up', 'gone by morning', 'told you so', 'not my problem',
  'left on read', 'seen 3am', 'i waited', 'was it me', 'keep it', 'delete this',
  'end of it', 'no one came', 'call me never', 'same as before', 'not again',
];

const STYLES = {
  raw: {
    fond: '#eeeae1',
    trait: '#17140f',
    rouge: ['#7c0d11', '#5c0a0d'],
    ep: 6.5,
    coulures: [0, 3],
    tailleCoulure: [4, 11],
  },
  peint: {
    fond: '#0f0f11',
    trait: '#f1eee7',
    rouge: ['#8e0f14', '#a3141a', '#6d0b10'],
    ep: 8.5,
    coulures: [2, 7],
    tailleCoulure: [8, 26],
  },
};

/** Scènes asymétriques : les figures sont petites et décalées, le vide fait le reste. */
const SCENES = [
  (r, st) => {
    // celle qui part en haut à gauche, celui qui reste en bas à droite, très décalés
    const s =
      bonhomme(r, W * 0.26, H * 0.36, H * 0.26, st.ep, st.trait, 'court') +
      bonhomme(r, W * 0.68, H * 0.62, H * 0.3, st.ep, st.trait, 'assis');
    return s;
  },
  (r, st) =>
    bonhomme(r, W * 0.36, H * 0.44, H * 0.32, st.ep, st.trait, 'tete-mains') +
    ecriture(r, W * 0.52, H * 0.56, 'still here', W * 0.05, st.trait, -6),
  (r, st) =>
    bonhomme(r, W * 0.3, H * 0.7, H * 0.24, st.ep, st.trait, 'tombe') +
    bonhomme(r, W * 0.72, H * 0.4, H * 0.28, st.ep, st.trait, 'debout'),
  (r, st) => {
    let s = '';
    for (let i = 0; i < 3; i++) {
      s += bonhomme(r, W * (0.24 + i * 0.24), H * (0.34 + i * 0.1), H * (0.28 - i * 0.05), st.ep, st.trait, 'court');
    }
    return s;
  },
  (r, st) =>
    bonhomme(r, W * 0.62, H * 0.5, H * 0.34, st.ep, st.trait, 'assis') +
    ecriture(r, W * 0.14, H * 0.3, 'are ya ok', W * 0.055, st.trait, -8),
  (r, st) =>
    bonhomme(r, W * 0.34, H * 0.42, H * 0.26, st.ep, st.trait, 'debout') +
    bonhomme(r, W * 0.62, H * 0.66, H * 0.26, st.ep, st.trait, 'tombe'),
];

const main = async () => {
  fs.mkdirSync(SORTIE, { recursive: true });
  const { default: puppeteer } = await import('puppeteer-core');
  const nav = await puppeteer.launch({
    executablePath: navigateur(),
    headless: true,
    args: ['--no-sandbox'],
  });
  const page = await nav.newPage();
  await page.setViewport({ width: W, height: H, deviceScaleFactor: 1 });

  const index = [];
  for (let i = 0; i < NB; i++) {
    const n = i + 1;
    const r = alea(n * 40503 + 11);
    const styleNom = STYLE_FIXE || (r() > 0.5 ? 'peint' : 'raw');
    const st = STYLES[styleNom];
    const iScene = Math.floor(r() * SCENES.length);
    let corps = SCENES[iScene](r, st);

    // les coulures, posées de travers et pas réparties
    const nbCoul = st.coulures[0] + Math.floor(r() * (st.coulures[1] - st.coulures[0] + 1));
    for (let k = 0; k < nbCoul; k++) {
      const taille = W * (st.tailleCoulure[0] + r() * (st.tailleCoulure[1] - st.tailleCoulure[0])) / 900;
      corps += coulure(
        r,
        W * (0.12 + r() * 0.76),
        H * (0.14 + r() * 0.6),
        taille,
        st.rouge[Math.floor(r() * st.rouge.length)],
      );
    }

    const phrase = PHRASES[Math.floor(r() * PHRASES.length)];
    corps += ecriture(
      r,
      W * (0.12 + r() * 0.3),
      H * (0.86 + r() * 0.06),
      phrase,
      W * (0.055 + r() * 0.03),
      st.trait,
      (r() - 0.5) * 7,
    );

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><rect width="${W}" height="${H}" fill="${st.fond}"/>${corps}</svg>`;
    const nom = `${String(n).padStart(3, '0')}-${styleNom}-s${iScene + 1}.png`;
    await page.setContent(svg, { waitUntil: 'load' });
    await page.screenshot({ path: path.join(SORTIE, nom) });
    index.push({ numero: n, style: styleNom, scene: iScene + 1, phrase, coulures: nbCoul, fichier: nom });
  }

  fs.writeFileSync(path.join(SORTIE, 'index.json'), JSON.stringify(index, null, 2));
  await nav.close();

  let html =
    '<!doctype html><meta charset="utf-8"><title>dead2me, griffes</title>' +
    '<style>body{background:#0d0d0d;color:#eee;font-family:system-ui,sans-serif;padding:24px}' +
    '.g{display:flex;flex-wrap:wrap;gap:12px}figure{margin:0;width:215px}' +
    'img{width:100%;border:1px solid #262626}figcaption{font-size:11px;color:#888;margin-top:4px}' +
    'b{color:#ddd}</style>' +
    `<h1>dead2me — ${index.length} griffes</h1>` +
    '<p style="color:#888;font-size:13px">Trait tremblé, composition décalée, coulures qui dégoulinent, ' +
    'écriture à la main. Note les numéros retenus.</p><div class="g">';
  for (const p of index) {
    html += `<figure><img src="griffes/${p.fichier}"><figcaption><b>${String(p.numero).padStart(3, '0')}</b> ${p.style} · scène ${p.scene} · ${p.coulures} coulure(s)</figcaption></figure>`;
  }
  html += '</div>';
  fs.writeFileSync(path.join(ICI, 'griffes.html'), html);

  console.log(`${index.length} griffes dans ${SORTIE}`);
  console.log(`planche : contenu/griffes.html`);
};

main().catch((e) => {
  console.error(`ECHEC : ${e.message}`);
  process.exit(1);
});
