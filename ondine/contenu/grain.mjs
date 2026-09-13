/**
 * La tuile de grain du site, tirée du MÊME bruit que les vêtements.
 *
 * ESSAYÉ LE 28/08/2026 SUR LA BOUTIQUE, PUIS RETIRÉ. À ne pas remettre en l'état.
 * Les photos produit sont des vêtements sur fond NOIR PLAT. Sans grain, la photo se confond
 * avec la page et la pièce a l'air de flotter, sans cadre. Dès que la page prend du grain et
 * pas les photos, le bord de chaque image devient visible et la grille se remplit de
 * rectangles noirs. C'est exactement ce que Valentin a vu tout de suite.
 * Pour le remettre il faudrait texturer AUSSI les visuels produit, donc reprendre les photos,
 * pas la feuille de style. C'est aussi la raison pour laquelle les boutiques du créneau sont
 * en noir plat : elles photographient toutes sur fond noir.
 *
 * POURQUOI PAS UNE IMAGE DE FOND : une photo derrière la grille se bat avec les vêtements
 * photographiés et alourdit le mobile, d'où vient tout le trafic. Les boutiques du créneau
 * sont en noir plat pour cette raison. Ce qu'on ajoute ici n'est donc pas un décor mais une
 * matière : le grain de photocopie de `encre.mjs`, réglages identiques (fractalNoise,
 * fréquence 0.9, 4 octaves, désaturé), pour que le site et le tissu aient la même texture.
 *
 * `stitchTiles="stitch"` est indispensable : sans lui le bruit ne se raccorde pas d'une tuile
 * à l'autre et la répétition dessine une grille visible sur toute la page.
 *
 * L'opacité est cuite dans le PNG plutôt que posée en CSS, pour que la tuile serve de
 * `background-image` sur le corps de page. Un calque en surimpression aurait demandé un
 * `position:fixed` au-dessus du contenu, donc un risque d'interception des clics.
 *
 * Usage :
 *   node grain.mjs                 tuile 400 px, opacité 0.055
 *   node grain.mjs --taille 600 --opacite 0.08
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { navigateur } from './navigateur.mjs';

const ICI = path.dirname(fileURLToPath(import.meta.url));
const SORTIE = path.join(ICI, 'logo');

const arg = (n, d) => {
  const i = process.argv.indexOf(`--${n}`);
  return i > -1 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--')
    ? process.argv[i + 1]
    : d;
};
const T = parseInt(arg('taille', '400'), 10);
const OPACITE = parseFloat(arg('opacite', '0.055'));

const svg =
  `<svg xmlns="http://www.w3.org/2000/svg" width="${T}" height="${T}" viewBox="0 0 ${T} ${T}">` +
  '<filter id="grain" x="0" y="0" width="100%" height="100%">' +
  '<feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" seed="7" stitchTiles="stitch"/>' +
  '<feColorMatrix type="saturate" values="0"/>' +
  '</filter>' +
  `<rect width="${T}" height="${T}" filter="url(#grain)" opacity="${OPACITE}"/>` +
  '</svg>';

const main = async () => {
  fs.mkdirSync(SORTIE, { recursive: true });
  const { default: puppeteer } = await import('puppeteer-core');
  const nav = await puppeteer.launch({
    executablePath: navigateur(),
    headless: true,
    args: ['--no-sandbox'],
  });
  const page = await nav.newPage();
  await page.setViewport({ width: T, height: T, deviceScaleFactor: 1 });
  await page.setContent(`<body style="margin:0">${svg}</body>`, { waitUntil: 'load' });
  const dest = path.join(SORTIE, 'grain.png');
  await page.screenshot({ path: dest, omitBackground: true });
  await nav.close();
  console.log(`tuile ${T} px, opacite ${OPACITE} : ${dest}`);
  console.log(`poids : ${Math.round(fs.statSync(dest).size / 1024)} ko`);
};

main().catch((e) => {
  console.error(`ECHEC : ${e.message}`);
  process.exit(1);
});
