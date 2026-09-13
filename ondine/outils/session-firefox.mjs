/**
 * Réutilise TA session Shopify déjà ouverte dans Firefox, pour ouvrir Edge déjà connecté.
 * Aucune connexion, aucun captcha. Tu lances ce script, il ne touche qu'aux cookies Shopify
 * de ton propre profil Firefox, sur ta machine, à ta demande.
 *
 * Firefox peut rester ouvert : le script copie la base de cookies avant de la lire, il ne
 * la verrouille pas.
 *
 * Usage :
 *   set NODE_PATH=C:\Users\Valentin\node_modules
 *   node session-firefox.mjs
 *
 * Ensuite la fenêtre Edge reste ouverte sur ton admin Shopify, connectée. Ne la ferme pas,
 * je m'y rebranche par le port 9222.
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { navigateur as trouverNavigateur } from '../contenu/navigateur.mjs';

const PROFIL_FF = path.join(
  os.homedir(),
  'AppData/Local/Packages/Mozilla.Firefox_n80bbvh6b1yt2/LocalCache/Roaming/Mozilla/Firefox/Profiles/969guhye.default-release',
);
// Edge ne demarre pas sur cette machine (sortie immediate code 0), on prend le premier
// navigateur reellement disponible. Voir contenu/navigateur.mjs.
const EDGE = trouverNavigateur();
const PROFIL_EDGE = path.join(path.dirname(new URL(import.meta.url).pathname).replace(/^\//, ''), '..', '.edge-profile-jamaisdeux');
const PORT = 9222;

// 1. copie de la base de cookies, pour ne pas gêner Firefox
const tmp = path.join(os.tmpdir(), `ff-cookies-${process.pid}.sqlite`);
fs.copyFileSync(path.join(PROFIL_FF, 'cookies.sqlite'), tmp);
for (const suffixe of ['-wal', '-shm']) {
  const src = path.join(PROFIL_FF, `cookies.sqlite${suffixe}`);
  if (fs.existsSync(src)) fs.copyFileSync(src, tmp + suffixe);
}

// 2. lecture des seuls cookies Shopify
const db = new DatabaseSync(tmp, { readOnly: true });
const lignes = db
  .prepare(
    `SELECT host, name, value, path, expiry, isSecure, isHttpOnly, sameSite
     FROM moz_cookies
     WHERE host LIKE '%shopify.com'`,
  )
  .all();
db.close();
for (const suffixe of ['', '-wal', '-shm']) {
  try {
    fs.unlinkSync(tmp + suffixe);
  } catch {
    /* rien */
  }
}

console.log(`${lignes.length} cookies Shopify lus dans Firefox`);
if (!lignes.length) {
  console.error(`Aucun cookie Shopify. Es-tu bien connecté à Shopify dans Firefox ?`);
  process.exit(1);
}

const sameSite = (v) => (v === 2 ? 'Strict' : v === 1 ? 'Lax' : 'None');
const cookies = lignes.map((c) => ({
  name: c.name,
  value: c.value,
  domain: c.host,
  path: c.path || '/',
  secure: !!c.isSecure,
  httpOnly: !!c.isHttpOnly,
  sameSite: sameSite(c.sameSite),
  ...(c.expiry ? { expires: Number(c.expiry) } : {}),
}));

// nom de la boutique, s'il traîne dans un cookie, pour t'éviter d'avoir à le chercher
const handle = (() => {
  for (const c of lignes) {
    const m = /([a-z0-9-]+)\.myshopify\.com/.exec(c.host + ' ' + c.value);
    if (m) return m[1];
  }
  return null;
})();
if (handle) console.log(`boutique détectée : ${handle}.myshopify.com`);

// 3. Edge piloté, on injecte les cookies puis on ouvre l'admin
const { default: puppeteer } = await import('puppeteer-core');
const navigateur = await puppeteer.launch({
  executablePath: EDGE,
  headless: false,
  userDataDir: PROFIL_EDGE,
  defaultViewport: null,
  args: [`--remote-debugging-port=${PORT}`, '--start-maximized', '--no-first-run'],
});
const page = (await navigateur.pages())[0] || (await navigateur.newPage());
await page.setCookie(...cookies);
await page.goto('https://admin.shopify.com', { waitUntil: 'domcontentloaded', timeout: 60000 });
await new Promise((r) => setTimeout(r, 4000));

console.log(`\nURL : ${page.url().slice(0, 120)}`);
const connecte = !/accounts\.shopify\.com|\/login/.test(page.url());
console.log(connecte ? 'CONNECTE, session reprise' : 'pas connecté, la session ne se transfère pas seule');
console.log(`\nLaisse cette fenetre ouverte. Je m'y rebranche par le port ${PORT}.`);

await new Promise((resolve) => navigateur.on('disconnected', resolve));
