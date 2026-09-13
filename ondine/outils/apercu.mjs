/**
 * Photographie une page de la boutique, en aperçu d'un thème non publié si besoin.
 * Sert à juger le rendu sans ouvrir un navigateur à la main, en desktop et en mobile.
 *
 * Usage :
 *   node apercu.mjs --theme 188582592840 --page / --nom accueil
 *   node apercu.mjs --page /products/d2m-hoodie --nom fiche --mobile
 *   node apercu.mjs --page / --nom accueil --haut 3000
 */

import { mkdirSync, existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const env = (() => {
  const f = path.join(HERE, '.env');
  const out = {};
  if (existsSync(f)) {
    for (const l of readFileSync(f, 'utf8').split(/\r?\n/)) {
      const m = l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  }
  return { ...out, ...process.env };
})();

const arg = (n, defaut = null) => {
  const i = process.argv.indexOf(`--${n}`);
  return i > -1 ? process.argv[i + 1] : defaut;
};

const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const SORTIE = path.join(HERE, '..', 'apercus');
mkdirSync(SORTIE, { recursive: true });

const theme = arg('theme');
const page = arg('page', '/');
const nom = arg('nom', 'apercu');
const mobile = process.argv.includes('--mobile');
const pleine = process.argv.includes('--pleine');
const haut = Number(arg('haut', 0));

const url = `https://${env.SHOPIFY_STORE}${page}${theme ? `${page.includes('?') ? '&' : '?'}preview_theme_id=${theme}` : ''}`;

const { default: puppeteer } = await import('puppeteer-core');
const nav = await puppeteer.launch({
  executablePath: EDGE,
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--hide-scrollbars'],
});
const p = await nav.newPage();
const hauteur = Number(arg('hauteur', 0));
await p.setViewport(
  mobile
    ? { width: 390, height: hauteur || 844, deviceScaleFactor: 2 }
    : { width: 1440, height: hauteur || 900, deviceScaleFactor: 1 },
);
await p.goto(url, { waitUntil: 'networkidle2', timeout: 90000 });
await p.evaluate(async () => {
  // on descend la page pour déclencher le chargement différé des images
  await new Promise((ok) => {
    let y = 0;
    const pas = setInterval(() => {
      window.scrollBy(0, 600);
      y += 600;
      if (y > document.body.scrollHeight) {
        clearInterval(pas);
        window.scrollTo(0, 0);
        setTimeout(ok, 600);
      }
    }, 60);
  });
});
await p.evaluate(() => {
  // le bandeau de consentement recouvre la page et fausse les captures
  for (const n of document.querySelectorAll('[id*="shopify-pc"], .shopify-pc__banner')) n.remove();
});
const fichier = path.join(SORTIE, `${nom}${mobile ? '-mobile' : ''}.png`);
await p.screenshot({
  path: fichier,
  fullPage: pleine,
  ...(haut ? { clip: { x: 0, y: 0, width: mobile ? 390 : 1440, height: haut } } : {}),
});
console.log(`${fichier}\n${url}`);
await nav.close();
