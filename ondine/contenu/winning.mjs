/**
 * Le registre RawSoult : dessin au stylo très brut, plus une phrase manuscrite.
 *
 * Leur pièce de référence est le mème « are ya winning, son? » : un père qui passe la tête
 * par la porte, un fils affalé devant son écran. Le mème lui-même n'est pas une œuvre
 * protégée, et le dessin est refait entièrement au trait ici, rien n'est repris.
 *
 * Tout est tracé au trait tremblé, comme un feutre sur du tissu : c'est le geste qui fait
 * le style, pas la précision.
 *
 * Usage :
 *   node winning.mjs --nb 20
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { navigateur } from './navigateur.mjs';

const ICI = path.dirname(fileURLToPath(import.meta.url));
const SORTIE = path.join(ICI, 'winning');

const arg = (n, d) => {
  const i = process.argv.indexOf(`--${n}`);
  return i > -1 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const NB = parseInt(arg('nb', '20'), 10);
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

const trait = (r, x1, y1, x2, y2, ep, c) => {
  const long = Math.hypot(x2 - x1, y2 - y1);
  const n = Math.max(3, Math.round(long / 12));
  const amp = Math.max(1.6, long * 0.025);
  let d = '';
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    d += `${i === 0 ? 'M' : 'L'} ${(x1 + (x2 - x1) * t + (r() - 0.5) * amp).toFixed(1)} ${(y1 + (y2 - y1) * t + (r() - 0.5) * amp).toFixed(1)} `;
  }
  return `<path d="${d}" fill="none" stroke="${c}" stroke-width="${(ep * (0.75 + r() * 0.6)).toFixed(1)}" stroke-linecap="round" stroke-linejoin="round"/>`;
};

const rond = (r, cx, cy, rayon, ep, c) => {
  let d = '';
  for (let i = 0; i <= 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    const rr = rayon * (0.86 + r() * 0.28);
    d += `${i === 0 ? 'M' : 'L'} ${(cx + Math.cos(a) * rr).toFixed(1)} ${(cy + Math.sin(a) * rr).toFixed(1)} `;
  }
  return `<path d="${d}Z" fill="none" stroke="${c}" stroke-width="${(ep * (0.8 + r() * 0.5)).toFixed(1)}" stroke-linecap="round"/>`;
};

const boite = (r, x, y, w, h, ep, c) =>
  trait(r, x, y, x + w, y, ep, c) +
  trait(r, x + w, y, x + w, y + h, ep, c) +
  trait(r, x + w, y + h, x, y + h, ep, c) +
  trait(r, x, y + h, x, y, ep, c);

const ecriture = (x, y, texte, taille, c, rot) =>
  `<text x="${x.toFixed(0)}" y="${y.toFixed(0)}" font-family="'Ink Free','Segoe Script','Comic Sans MS',cursive" font-size="${taille.toFixed(0)}" fill="${c}" transform="rotate(${rot.toFixed(1)} ${x.toFixed(0)} ${y.toFixed(0)})">${texte}</text>`;

/** La porte entrouverte, avec la tête qui passe. */
const porte = (r, x, y, ech, ep, c) => {
  const u = ech;
  let s = boite(r, x, y, 46 * u, 76 * u, ep, c);
  // le battant ouvert, en biais
  s += trait(r, x + 46 * u, y + 4 * u, x + 66 * u, y + 12 * u, ep, c);
  s += trait(r, x + 66 * u, y + 12 * u, x + 66 * u, y + 72 * u, ep, c);
  s += trait(r, x + 46 * u, y + 76 * u, x + 66 * u, y + 72 * u, ep, c);
  // la tête qui passe, chapeau
  const tx = x + 30 * u;
  const ty = y + 22 * u;
  s += rond(r, tx, ty, 8 * u, ep, c);
  s += trait(r, tx - 11 * u, ty - 8 * u, tx + 11 * u, ty - 8 * u, ep, c);
  s += trait(r, tx - 7 * u, ty - 8 * u, tx - 7 * u, ty - 15 * u, ep, c);
  s += trait(r, tx + 7 * u, ty - 8 * u, tx + 7 * u, ty - 15 * u, ep, c);
  s += trait(r, tx - 7 * u, ty - 15 * u, tx + 7 * u, ty - 15 * u, ep, c);
  // le bras sur le chambranle
  s += trait(r, tx + 8 * u, ty + 6 * u, tx + 20 * u, ty + 2 * u, ep, c);
  return s;
};

/** Le fils devant son bureau, avachi. */
const bureau = (r, x, y, ech, ep, c) => {
  const u = ech;
  let s = '';
  // l'écran
  s += boite(r, x + 26 * u, y + 6 * u, 34 * u, 24 * u, ep, c);
  s += trait(r, x + 43 * u, y + 30 * u, x + 43 * u, y + 38 * u, ep, c);
  s += trait(r, x + 34 * u, y + 38 * u, x + 52 * u, y + 38 * u, ep, c);
  // le plateau du bureau
  s += trait(r, x + 8 * u, y + 42 * u, x + 68 * u, y + 42 * u, ep, c);
  s += trait(r, x + 66 * u, y + 42 * u, x + 66 * u, y + 76 * u, ep, c);
  // la chaise et le personnage affalé
  const px = x + 18 * u;
  s += rond(r, px, y + 22 * u, 8 * u, ep, c);
  s += trait(r, px, y + 30 * u, px + 2 * u, y + 44 * u, ep, c);
  s += trait(r, px + 1 * u, y + 34 * u, px + 20 * u, y + 40 * u, ep, c);
  s += trait(r, px + 2 * u, y + 44 * u, px + 16 * u, y + 48 * u, ep, c);
  s += trait(r, px + 16 * u, y + 48 * u, px + 14 * u, y + 70 * u, ep, c);
  s += trait(r, px + 2 * u, y + 44 * u, px - 2 * u, y + 70 * u, ep, c);
  // dossier de chaise
  s += trait(r, px - 12 * u, y + 44 * u, px - 12 * u, y + 20 * u, ep, c);
  s += trait(r, px - 12 * u, y + 44 * u, px + 6 * u, y + 44 * u, ep, c);
  return s;
};

const goutte = (r, x, y, taille, c) => {
  let s = '';
  let d = '';
  for (let i = 0; i <= 9; i++) {
    const a = (i / 9) * Math.PI * 2;
    const rr = taille * (0.6 + r() * 0.7);
    d += `${i === 0 ? 'M' : 'L'} ${(x + Math.cos(a) * rr).toFixed(1)} ${(y + Math.sin(a) * rr * 0.85).toFixed(1)} `;
  }
  s += `<path d="${d}Z" fill="${c}" opacity="0.9"/>`;
  if (r() > 0.4) {
    const long = taille * (2 + r() * 4);
    s += `<path d="M ${(x - taille * 0.2).toFixed(1)} ${y.toFixed(1)} Q ${x.toFixed(1)} ${(y + long * 0.6).toFixed(1)} ${x.toFixed(1)} ${(y + long).toFixed(1)} Q ${x.toFixed(1)} ${(y + long * 0.6).toFixed(1)} ${(x + taille * 0.2).toFixed(1)} ${y.toFixed(1)} Z" fill="${c}" opacity="0.85"/>`;
  }
  return s;
};

const PHRASES = [
  'are ya winning, son?',
  'still losing',
  'not winning',
  'ya winning?',
  'no wins today',
  'losing again',
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
    const r = alea(n * 60077 + 5);
    const clair = r() > 0.35;
    const fond = clair ? '#eeeae1' : '#0f0f11';
    const c = clair ? '#17140f' : '#f1eee7';
    const rouge = clair ? '#7c0d11' : '#a3141a';
    const ep = W * 0.0055;
    const ech = W * 0.0042;

    let corps = porte(r, W * 0.06, H * 0.16, ech, ep, c) + bureau(r, W * 0.44, H * 0.2, ech, ep, c);
    const phrase = PHRASES[Math.floor(r() * PHRASES.length)];
    corps += ecriture(W * 0.12, H * 0.11, phrase, W * 0.058, c, (r() - 0.5) * 5);

    const nb = 1 + Math.floor(r() * 5);
    for (let k = 0; k < nb; k++) {
      corps += goutte(r, W * (0.12 + r() * 0.76), H * (0.2 + r() * 0.6), W * (0.006 + r() * 0.014), rouge);
    }
    corps += ecriture(W * (0.14 + r() * 0.24), H * 0.9, 'dead2me', W * 0.045, c, (r() - 0.5) * 6);

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><rect width="${W}" height="${H}" fill="${fond}"/>${corps}</svg>`;
    const nom = `${String(n).padStart(3, '0')}-${clair ? 'clair' : 'sombre'}.png`;
    await page.setContent(svg, { waitUntil: 'load' });
    await page.screenshot({ path: path.join(SORTIE, nom) });
    index.push({ numero: n, fond: clair ? 'clair' : 'sombre', phrase, fichier: nom });
  }

  fs.writeFileSync(path.join(SORTIE, 'index.json'), JSON.stringify(index, null, 2));
  await nav.close();
  console.log(`${index.length} visuels dans ${SORTIE}`);
};

main().catch((e) => {
  console.error(`ECHEC : ${e.message}`);
  process.exit(1);
});
