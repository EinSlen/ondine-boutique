/**
 * Ouvre une fenêtre Edge pilotable, sur un profil DÉDIÉ, jamais le profil personnel.
 * Valentin s'y connecte à la main, puis les scripts se rebranchent dessus par le port
 * de débogage, ce qui évite d'avoir à retaper un mot de passe.
 *
 * Usage :
 *   node fenetre.mjs                    ouvre l'admin Shopify
 *   node fenetre.mjs https://autre.url  ouvre une autre adresse
 *
 * La fenêtre reste ouverte. Pour s'y rebrancher depuis un autre script :
 *   const b = await puppeteer.connect({ browserURL: 'http://127.0.0.1:9222' })
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ICI = path.dirname(fileURLToPath(import.meta.url));
const PROFIL = path.join(ICI, '..', '.edge-profile-jamaisdeux');
const PORT = 9222;
const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const URL_DEPART = process.argv[2] || 'https://admin.shopify.com/?ui_locales=fr&country=FR';

const { default: puppeteer } = await import('puppeteer-core');

const navigateur = await puppeteer.launch({
  executablePath: EDGE,
  headless: false,
  userDataDir: PROFIL,
  defaultViewport: null,
  args: [
    `--remote-debugging-port=${PORT}`,
    '--start-maximized',
    '--no-first-run',
    '--no-default-browser-check',
  ],
});

const pages = await navigateur.pages();
const page = pages[0] || (await navigateur.newPage());
await page.goto(URL_DEPART, { waitUntil: 'domcontentloaded', timeout: 60000 });

console.log(`Fenetre ouverte sur ${URL_DEPART}`);
console.log(`Profil dedie : ${PROFIL}`);
console.log(`Port de debogage : ${PORT}, les scripts peuvent s'y rebrancher.`);
console.log(`\nConnecte-toi dans cette fenetre. Elle reste ouverte, ne la ferme pas.`);

// on ne ferme rien: le processus reste vivant tant que la fenetre est ouverte
await new Promise((resolve) => navigateur.on('disconnected', resolve));
console.log('Fenetre fermee.');
