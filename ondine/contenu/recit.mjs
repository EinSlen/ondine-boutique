/**
 * Scènes narratives dead2me : le couple d'avant, l'effondrement d'après.
 *
 * C'est le montage que Valentin a retenu sur la planche des 161 pièces : le couple et le
 * personnage effondré sur la chaise. Ces deux images, mises côte à côte, racontent en une
 * seconde ce que la marque vend. Les silhouettes sont PLEINES (CC0, Openclipart), et le
 * geste vient du moteur griffe : coulures qui dégoulinent, écriture manuscrite penchée,
 * composition décalée.
 *
 * Usage :
 *   node recit.mjs --nb 40
 *   node recit.mjs --nb 12 --style peint
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { navigateur } from './navigateur.mjs';

const ICI = path.dirname(fileURLToPath(import.meta.url));
const SORTIE = path.join(ICI, 'recits');

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

const charger = (fichier) => {
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

const placer = (p, x, y, largeur, hauteur, couleur, miroir = false) => {
  const k = Math.min(largeur / p.vw, hauteur / p.vh);
  const dx = x + (largeur - p.vw * k) / 2;
  const dy = y + (hauteur - p.vh * k) / 2;
  const mir = miroir ? `translate(${(p.vw * k).toFixed(2)} 0) scale(-1 1) ` : '';
  return `<g color="${couleur}" fill="${couleur}" transform="translate(${dx.toFixed(2)} ${dy.toFixed(2)}) ${mir}scale(${k.toFixed(5)}) translate(${(-p.vx).toFixed(2)} ${(-p.vy).toFixed(2)})">${p.dedans}</g>`;
};

const sel = JSON.parse(fs.readFileSync(path.join(ICI, 'selection.json'), 'utf8'));
const parRole = (role) =>
  sel.retenues.filter((r) => r.role === role).map((r) => charger(r.fichier));
const ASSIS = parRole('assis');
const COUPLE = parRole('couple');
const COURT = parRole('court');
const ATTEND = parRole('attend');
const SYMBOLE = parRole('symbole');
console.log(
  `sélection : ${COUPLE.length} couples, ${ASSIS.length} effondrés, ${COURT.length} qui courent, ${ATTEND.length} qui attendent`,
);

/** Coulure qui part d'un point et dégouline, reprise du moteur griffe. */
const coulure = (r, x, y, taille, c) => {
  let s = '';
  let d = '';
  for (let i = 0; i <= 11; i++) {
    const a = (i / 11) * Math.PI * 2;
    const rr = taille * (0.5 + r() * 0.85);
    d += `${i === 0 ? 'M' : 'L'} ${(x + Math.cos(a) * rr).toFixed(1)} ${(y + Math.sin(a) * rr * 0.8).toFixed(1)} `;
  }
  s += `<path d="${d}Z" fill="${c}" opacity="${(0.85 + r() * 0.15).toFixed(2)}"/>`;
  const n = 2 + Math.floor(r() * 4);
  for (let i = 0; i < n; i++) {
    const cx = x + (r() - 0.5) * taille * 1.4;
    const long = taille * (1.5 + r() * 6);
    const larg = taille * (0.1 + r() * 0.22);
    const dv = (r() - 0.5) * taille * 0.5;
    s +=
      `<path d="M ${(cx - larg).toFixed(1)} ${y.toFixed(1)} Q ${(cx - larg * 0.6 + dv).toFixed(1)} ${(y + long * 0.6).toFixed(1)} ` +
      `${(cx + dv).toFixed(1)} ${(y + long).toFixed(1)} Q ${(cx + larg * 0.6 + dv).toFixed(1)} ${(y + long * 0.6).toFixed(1)} ` +
      `${(cx + larg).toFixed(1)} ${y.toFixed(1)} Z" fill="${c}" opacity="${(0.8 + r() * 0.2).toFixed(2)}"/>`;
    if (r() > 0.4) {
      s += `<ellipse cx="${(cx + dv).toFixed(1)}" cy="${(y + long + taille * 0.35).toFixed(1)}" rx="${(larg * 0.8).toFixed(1)}" ry="${(larg * 1.1).toFixed(1)}" fill="${c}" opacity="0.85"/>`;
    }
  }
  for (let i = 0; i < 14; i++) {
    const a = r() * Math.PI * 2;
    const dist = taille * (1.2 + r() * 3.5);
    s += `<circle cx="${(x + Math.cos(a) * dist).toFixed(1)}" cy="${(y + Math.sin(a) * dist).toFixed(1)}" r="${(taille * (0.04 + r() * 0.13)).toFixed(1)}" fill="${c}" opacity="${(0.6 + r() * 0.4).toFixed(2)}"/>`;
  }
  return s;
};

const ecriture = (x, y, texte, taille, c, rot) =>
  `<text x="${x.toFixed(0)}" y="${y.toFixed(0)}" font-family="'Ink Free','Segoe Script','Comic Sans MS',cursive" font-size="${taille.toFixed(0)}" fill="${c}" transform="rotate(${rot.toFixed(1)} ${x.toFixed(0)} ${y.toFixed(0)})" opacity="0.95">${texte}</text>`;

const PHRASES = [
  'dead to me', 'no reply', 'you first', 'still nothing', 'she left twice',
  'don’t wait up', 'gone by morning', 'told you so', 'left on read', 'seen 3am',
  'i waited', 'was it me', 'keep it', 'delete this', 'end of it', 'no one came',
];

const STYLES = {
  peint: { fond: '#0f0f11', trait: '#f1eee7', rouge: ['#8e0f14', '#a3141a', '#6d0b10'], coul: [1, 5], tc: [8, 24] },
  raw: { fond: '#eeeae1', trait: '#17140f', rouge: ['#7c0d11', '#5c0a0d'], coul: [0, 2], tc: [4, 10] },
};

const tirer = (r, l) => l[Math.floor(r() * l.length)];

/** Les scènes racontent toutes la même histoire en deux temps. */
const SCENES = {
  /** Le couple à gauche, l'effondrement à droite : avant et après. */
  avantApres: (r, st) =>
    placer(tirer(r, COUPLE), W * 0.04, H * 0.2, W * 0.42, H * 0.4, st.trait) +
    placer(tirer(r, ASSIS), W * 0.56, H * 0.24, W * 0.38, H * 0.36, st.trait),

  /** Le couple seul, en grand : ce qu'on a perdu. */
  coupleSeul: (r, st) =>
    placer(tirer(r, COUPLE), W * 0.24, H * 0.18, W * 0.52, H * 0.46, st.trait),

  /** L'effondré seul, décentré, beaucoup de vide. */
  effondreSeul: (r, st) =>
    placer(tirer(r, ASSIS), W * (r() > 0.5 ? 0.16 : 0.48), H * 0.24, W * 0.38, H * 0.42, st.trait),

  /** Le couple en haut, tout petit, l'effondré en bas, en grand. */
  memoire: (r, st) =>
    placer(tirer(r, COUPLE), W * 0.3, H * 0.12, W * 0.24, H * 0.18, st.trait) +
    placer(tirer(r, ASSIS), W * 0.34, H * 0.42, W * 0.42, H * 0.38, st.trait),

  /** Celle qui court, celui qui reste assis. */
  fuite: (r, st) =>
    placer(tirer(r, COURT), W * 0.04, H * 0.24, W * 0.38, H * 0.34, st.trait, true) +
    placer(tirer(r, ASSIS), W * 0.56, H * 0.24, W * 0.38, H * 0.36, st.trait),

  /** Celui qui attend, et le couple au loin. */
  attente: (r, st) =>
    (ATTEND.length ? placer(tirer(r, ATTEND), W * 0.1, H * 0.24, W * 0.32, H * 0.42, st.trait) : '') +
    placer(tirer(r, COUPLE), W * 0.6, H * 0.3, W * 0.3, H * 0.24, st.trait),

  /** La croix, et l'effondré dessous. */
  croix: (r, st) =>
    placer(tirer(r, SYMBOLE), W * 0.26, H * 0.1, W * 0.48, H * 0.34, st.trait) +
    placer(tirer(r, ASSIS), W * 0.34, H * 0.46, W * 0.34, H * 0.3, st.trait),
};

const NOMS = Object.keys(SCENES);

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
    const r = alea(n * 50021 + 3);
    const styleNom = STYLE_FIXE || (r() > 0.42 ? 'peint' : 'raw');
    const st = STYLES[styleNom];
    const scene = NOMS[i % NOMS.length];
    let corps = SCENES[scene](r, st);

    const nc = st.coul[0] + Math.floor(r() * (st.coul[1] - st.coul[0] + 1));
    for (let k = 0; k < nc; k++) {
      const taille = (W * (st.tc[0] + r() * (st.tc[1] - st.tc[0]))) / 900;
      corps += coulure(r, W * (0.1 + r() * 0.8), H * (0.12 + r() * 0.62), taille, tirer(r, st.rouge));
    }

    const phrase = tirer(r, PHRASES);
    corps += ecriture(W * (0.1 + r() * 0.32), H * (0.87 + r() * 0.05), phrase, W * (0.055 + r() * 0.03), st.trait, (r() - 0.5) * 7);

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><rect width="${W}" height="${H}" fill="${st.fond}"/>${corps}</svg>`;
    const nom = `${String(n).padStart(3, '0')}-${styleNom}-${scene}.png`;
    await page.setContent(svg, { waitUntil: 'load' });
    await page.screenshot({ path: path.join(SORTIE, nom) });
    index.push({ numero: n, style: styleNom, scene, phrase, coulures: nc, fichier: nom });
  }

  fs.writeFileSync(path.join(SORTIE, 'index.json'), JSON.stringify(index, null, 2));
  await nav.close();

  let html =
    '<!doctype html><meta charset="utf-8"><title>dead2me, récits</title>' +
    '<style>body{background:#0d0d0d;color:#eee;font-family:system-ui,sans-serif;padding:24px}' +
    '.g{display:flex;flex-wrap:wrap;gap:12px}figure{margin:0;width:215px}' +
    'img{width:100%;border:1px solid #262626}figcaption{font-size:11px;color:#888;margin-top:4px}' +
    'b{color:#ddd}</style>' +
    `<h1>dead2me — ${index.length} récits</h1>` +
    '<p style="color:#888;font-size:13px">Le couple et l’effondré, silhouettes pleines. ' +
    'Note les numéros retenus.</p><div class="g">';
  for (const p of index) {
    html += `<figure><img src="recits/${p.fichier}"><figcaption><b>${String(p.numero).padStart(3, '0')}</b> ${p.style} · ${p.scene}</figcaption></figure>`;
  }
  html += '</div>';
  fs.writeFileSync(path.join(ICI, 'recits.html'), html);
  console.log(`${index.length} récits dans ${SORTIE}`);
  console.log(`planche : contenu/recits.html`);
};

main().catch((e) => {
  console.error(`ECHEC : ${e.message}`);
  process.exit(1);
});
