/**
 * Relève l'interface réelle de Printful pour pouvoir l'automatiser ensuite.
 *
 * POURQUOI CETTE ÉTAPE : l'éditeur Printful est derrière une session, donc invisible depuis
 * ici. Écrire des sélecteurs devinés donnerait un script qui casse au premier clic. Celui-ci
 * ouvre les écrans qui comptent, photographie chacun et liste ses éléments cliquables avec
 * leurs textes et leurs attributs, de quoi écrire ensuite une automatisation qui vise juste.
 *
 * Ce qu'il ne fait pas : il ne clique sur rien, ne crée rien, ne publie rien. Il regarde.
 *
 * Tout reste sur ton disque, dans `production/exploration`. Les captures peuvent montrer des
 * informations de ton compte : ne les partage pas telles quelles.
 *
 * Usage :
 *   node printful-explorer.mjs           relevé guidé, avec les pauses
 *   node printful-explorer.mjs --auto     relevé sans question, sur une session déjà ouverte
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import { fileURLToPath } from 'node:url';

import { ouvrir, ouvrirDetache, commandeManuelle, premierOnglet } from './edge.mjs';

const ICI = path.dirname(fileURLToPath(import.meta.url));
const SORTIE = path.join(ICI, '..', 'production', 'exploration');

/**
 * Les écrans à relever, dans l'ordre du parcours de montage. Le second est le plus
 * important : c'est celui qui rattache un produit Printful à une fiche Shopify existante,
 * au lieu d'en créer une treizième.
 */
const ECRANS = [
  { cle: '01-tableau-de-bord', url: 'https://www.printful.com/dashboard', quoi: 'point de départ' },
  { cle: '02-produits-synchronises', url: 'https://www.printful.com/dashboard/sync', quoi: 'la liste des produits liés à Shopify, et le bouton qui rattache un produit existant' },
  { cle: '03-ajout-produit', url: 'https://www.printful.com/dashboard/product-templates', quoi: 'les gabarits, s’il y en a' },
  { cle: '04-catalogue', url: 'https://www.printful.com/dashboard/catalog', quoi: 'la recherche de blank, on y cherchera Gildan 18600' },
];

const AUTO = process.argv.includes('--auto');

const attendre = (question) =>
  AUTO
    ? Promise.resolve('')
    : new Promise((ok) => {
        const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
        rl.question(question, (r) => {
          rl.close();
          ok(r.trim().toLowerCase());
        });
      });

mkdirSync(SORTIE, { recursive: true });

let { nav, mode } = await ouvrir({ lancerSiAbsent: !AUTO });
console.log(`\nNavigateur ${mode} sur le profil dédié.`);

let page = await premierOnglet(nav);
await page.goto('https://www.printful.com/dashboard', { waitUntil: 'domcontentloaded', timeout: 90000 });
console.log(`Onglet piloté : ${page.url()}`);

if (/\/(login|auth|signin)/i.test(new URL(page.url()).pathname)) {
  console.log('\nPrintful demande une connexion.');
  console.log('Par « Se connecter avec Google », il refusera un navigateur piloté.');
  console.log('Deux façons de passer :');
  console.log('  a) e-mail et mot de passe Printful, directement ici ;');
  console.log('  b) une fenêtre ordinaire, que Google accepte :');
  console.log(`\n     ${commandeManuelle()}\n`);
  const r = await attendre('Entrée une fois connecté, ou "d" pour que j’ouvre la fenêtre ordinaire. ');

  if (r === 'd') {
    await nav.disconnect().catch(() => nav.close().catch(() => {}));
    ouvrirDetache();
    console.log('\nFenêtre ordinaire ouverte. Connecte-toi à Printful dedans, puis reviens ici.');
    await attendre('Entrée une fois connecté. ');
    ({ nav, mode } = await ouvrir({ lancerSiAbsent: false }));
    page = await premierOnglet(nav);
    console.log(`Navigateur ${mode}.`);
  }
  await page.goto('https://www.printful.com/dashboard', { waitUntil: 'domcontentloaded', timeout: 90000 });
}

/** Ce qui sert à viser un élément : son rôle, son texte, et les attributs stables. */
const releverInteractifs = () =>
  page.evaluate(() => {
    const utile = (el) => {
      const r = el.getBoundingClientRect();
      if (r.width < 4 || r.height < 4) return null;
      const attrs = {};
      for (const a of el.attributes) {
        if (/^(id|name|type|placeholder|aria-label|role|data-[\w-]+)$/i.test(a.name) && a.value) {
          attrs[a.name] = a.value.slice(0, 80);
        }
      }
      return {
        tag: el.tagName.toLowerCase(),
        texte: (el.innerText || el.value || '').trim().replace(/\s+/g, ' ').slice(0, 70),
        classes: (el.className || '').toString().split(/\s+/).filter(Boolean).slice(0, 4).join(' '),
        attrs,
      };
    };
    const sel = 'button, a[href], input, select, textarea, [role="button"], [role="tab"], [contenteditable="true"]';
    return [...document.querySelectorAll(sel)].map(utile).filter(Boolean).slice(0, 220);
  });

const rapport = [];

for (const e of ECRANS) {
  console.log(`\n→ ${e.cle} : ${e.quoi}`);
  try {
    await page.goto(e.url, { waitUntil: 'networkidle2', timeout: 90000 });
  } catch {
    console.log('   chargement lent, on continue avec ce qui est affiché');
  }
  await new Promise((r) => setTimeout(r, 2500));

  const fichier = path.join(SORTIE, `${e.cle}.png`);
  await page.screenshot({ path: fichier, fullPage: true }).catch(() => page.screenshot({ path: fichier }));

  const interactifs = await releverInteractifs();
  rapport.push({ ...e, urlFinale: page.url(), titre: await page.title(), interactifs });
  console.log(`   ${interactifs.length} éléments relevés, capture dans ${path.basename(fichier)}`);
}

// l'écran décisif : la recherche d'un blank précis, celui de la première pièce à monter
console.log('\n→ 05-recherche-blank : on cherche « Gildan 18600 » dans le catalogue');
try {
  await page.goto('https://www.printful.com/dashboard/catalog?search=Gildan%2018600', {
    waitUntil: 'networkidle2',
    timeout: 90000,
  });
  await new Promise((r) => setTimeout(r, 2500));
  await page.screenshot({ path: path.join(SORTIE, '05-recherche-blank.png'), fullPage: true });
  rapport.push({
    cle: '05-recherche-blank',
    quoi: 'résultat de recherche pour un blank précis',
    urlFinale: page.url(),
    titre: await page.title(),
    interactifs: await releverInteractifs(),
  });
  console.log('   capture faite');
} catch {
  console.log('   la recherche n’a pas répondu, note l’URL réelle depuis la fenêtre');
}

console.log('\nOuvre maintenant à la main l’écran qui rattache un produit existant');
console.log('(dans Products, le bouton du genre « Add product » puis « Connect existing »).');
const suite = await attendre('Entrée quand tu y es, ou "s" pour sauter. ');

if (suite !== 's') {
  await new Promise((r) => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(SORTIE, '06-rattachement.png'), fullPage: true }).catch(() => {});
  rapport.push({
    cle: '06-rattachement',
    quoi: 'écran de rattachement à un produit Shopify existant, atteint à la main',
    urlFinale: page.url(),
    titre: await page.title(),
    interactifs: await releverInteractifs(),
  });
  console.log('   capture et relevé faits');
}

const dest = path.join(SORTIE, 'releve.json');
writeFileSync(dest, JSON.stringify(rapport, null, 2), 'utf8');

console.log(`\nRelevé écrit dans ${dest}`);
console.log('Captures dans production/exploration. Dis-moi quand c’est fait, je lis et j’écris l’automatisation.\n');
if (mode === 'lancé') await nav.close();
else await nav.disconnect();
