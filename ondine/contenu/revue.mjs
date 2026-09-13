/**
 * Revue de la bibliothèque, rendue DANS le style de la marque.
 *
 * La planche brute d'Openclipart ne sert à rien pour choisir : un dessin au trait fin y a
 * l'air correct sur fond blanc et devient une bouillie illisible une fois posé en encre
 * claire sur du noir, à travers le filtre. Ici chaque pièce est rendue exactement comme elle
 * apparaîtrait sur un vêtement, ce qui permet de trier pour de vrai.
 *
 * Chaque vignette porte son identifiant, à reporter dans `selection.json`.
 *
 * Usage :
 *   node revue.mjs                    toutes les familles
 *   node revue.mjs --famille objet
 *   node revue.mjs --famille symbole --taille 260
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { alea, filtres, PALETTES, prechauffer } from './encre.mjs';
import { charger, placer } from './figures.mjs';
import { navigateur } from './navigateur.mjs';

const ICI = path.dirname(fileURLToPath(import.meta.url));
const SORTIE = path.join(ICI, 'revue');

const arg = (n, d) => {
  const i = process.argv.indexOf(`--${n}`);
  return i > -1 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const FAMILLE = arg('famille', null);
const T = parseInt(arg('taille', '300'), 10);

const main = async () => {
  fs.mkdirSync(SORTIE, { recursive: true });
  const catalogue = JSON.parse(fs.readFileSync(path.join(ICI, 'bibliotheque', 'catalogue.json'), 'utf8'));
  const sel = JSON.parse(fs.readFileSync(path.join(ICI, 'selection.json'), 'utf8'));
  const deja = new Map(sel.retenues.map((r) => [path.basename(r.fichier), r.role]));
  const ecartees = new Set(Object.keys(sel.ecartees || {}));

  const liste = catalogue.filter((x) => (!FAMILLE || x.famille === FAMILLE) && fs.existsSync(path.join(ICI, 'bibliotheque', x.fichier)));
  console.log(`${liste.length} pièces à rendre`);

  const { default: puppeteer } = await import('puppeteer-core');
  const nav = await puppeteer.launch({
    executablePath: navigateur(),
    headless: true,
    args: ['--no-sandbox'],
  });
  const page = await nav.newPage();
  await page.setViewport({ width: T, height: T, deviceScaleFactor: 1 });
  await prechauffer(page);

  const p = PALETTES[0];
  const rendus = [];
  for (const piece of liste) {
    const nom = piece.fichier.replace('.svg', '');
    const cible = path.join(SORTIE, `${nom}.png`);
    try {
      const forme = charger(path.join('bibliotheque', piece.fichier));
      const r = alea(1234);
      const svg =
        `<svg xmlns="http://www.w3.org/2000/svg" width="${T}" height="${T}" viewBox="0 0 ${T} ${T}">` +
        filtres(r, T, T / 900) +
        `<rect width="${T}" height="${T}" fill="${p.fond}"/>` +
        `<g filter="url(#encreDouce)">${placer(forme, T * 0.08, T * 0.08, T * 0.84, T * 0.84, p.encre)}</g>` +
        '</svg>';
      await page.setContent(svg, { waitUntil: 'load' });
      await page.screenshot({ path: cible });
      rendus.push({ ...piece, nom, statut: deja.has(piece.fichier) ? `retenue ${deja.get(piece.fichier)}` : ecartees.has(nom) ? 'écartée' : 'à juger' });
    } catch (e) {
      console.log(`  ${nom} illisible : ${e.message}`);
    }
  }
  await nav.close();

  const parFamille = {};
  for (const x of rendus) (parFamille[x.famille] = parFamille[x.famille] || []).push(x);

  let html =
    '<!doctype html><meta charset="utf-8"><title>dead2me, revue de la bibliotheque</title>' +
    '<style>body{background:#0b0b0b;color:#eee;font-family:system-ui,sans-serif;padding:22px}' +
    'h1{font-size:19px;margin-bottom:4px}p.i{color:#8a8a8a;font-size:13px;margin-top:0;max-width:820px;line-height:1.6}' +
    'h2{font-size:14px;color:#aaa;border-bottom:1px solid #2a2a2a;padding-bottom:7px;margin-top:30px}' +
    '.g{display:flex;flex-wrap:wrap;gap:10px}figure{margin:0;width:168px}' +
    'img{width:100%;border:1px solid #242424;display:block}' +
    'figcaption{font-size:10.5px;color:#8a8a8a;margin-top:4px;line-height:1.4;word-break:break-word}' +
    'b{color:#eaeaea}.ret{color:#7fc08a}.eca{color:#a06060}.jug{color:#c9a86a}</style>' +
    '<h1>dead2me, revue de la bibliothèque</h1>' +
    '<p class="i">Chaque pièce est rendue comme elle apparaîtrait sur un vêtement : encre claire sur noir, ' +
    'à travers le filtre de la marque. Une planche brute ne permet pas de juger. ' +
    'Vert = déjà retenue, rouge = écartée avec sa raison, ambre = à juger.</p>';
  for (const [famille, l] of Object.entries(parFamille)) {
    html += `<h2>${famille} — ${l.length}</h2><div class="g">`;
    for (const x of l) {
      const cls = x.statut.startsWith('retenue') ? 'ret' : x.statut === 'écartée' ? 'eca' : 'jug';
      html += `<figure><img src="revue/${x.nom}.png"><figcaption><b>${x.id}</b> ${x.nom.replace(famille + '-', '')}<br><span class="${cls}">${x.statut}</span></figcaption></figure>`;
    }
    html += '</div>';
  }
  fs.writeFileSync(path.join(ICI, 'revue.html'), html);
  console.log(`${rendus.length} rendus, planche : contenu/revue.html`);
};

main().catch((e) => {
  console.error(`ECHEC : ${e.message}`);
  process.exit(1);
});
