/**
 * Simule un achat de bout en bout sur la boutique, jusqu'à l'écran de livraison.
 * Sert à vérifier qu'un client peut réellement payer : une boutique sans tarif d'expédition
 * accepte le panier mais refuse le paiement, et rien dans l'admin ne le signale.
 *
 * Aucune commande n'est passée : on s'arrête avant le paiement.
 *
 * Usage : node test-achat.mjs
 */

import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const env = (() => {
  const f = path.join(HERE, '..', 'outils', '.env');
  const out = {};
  if (existsSync(f)) {
    for (const l of readFileSync(f, 'utf8').split(/\r?\n/)) {
      const m = l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  }
  return { ...out, ...process.env };
})();

const THEME = process.argv.includes('--theme') ? process.argv[process.argv.indexOf('--theme') + 1] : null;
const { default: puppeteer } = await import('puppeteer-core');
const nav = await puppeteer.launch({
  executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  headless: true,
  args: ['--no-sandbox'],
});
const page = await nav.newPage();
await page.setViewport({ width: 1280, height: 900 });

// le bandeau de consentement recouvre les boutons et fausse le parcours
const degager = () =>
  page.evaluate(() => {
    for (const n of document.querySelectorAll('[id*="shopify-pc"], .shopify-pc__banner')) n.remove();
  });

const url = (chemin) => `https://${env.SHOPIFY_STORE}${chemin}${THEME ? `?preview_theme_id=${THEME}` : ''}`;

console.log('1. fiche produit');
await page.goto(url('/products/kapsulcam-4k'), { waitUntil: 'networkidle2', timeout: 90000 });

await degager();
console.log('2. ajout au panier');
const ajoute = await page.evaluate(() => {
  const b = [...document.querySelectorAll('button')].find((x) => /panier|add to cart/i.test(x.innerText || ''));
  if (!b) return false;
  b.click();
  return true;
});
console.log(`   ${ajoute ? 'ajouté' : 'bouton introuvable'}`);
await new Promise((r) => setTimeout(r, 4000));

console.log('3. panier');
await page.goto(url('/cart'), { waitUntil: 'networkidle2', timeout: 90000 });
await degager();
const panier = await page.evaluate(() => ({
  vide: /vide|empty/i.test(document.body.innerText),
  total: (document.body.innerText.match(/€\s?[\d.,]+/g) || []).slice(-1)[0] || '?',
}));
console.log(`   ${panier.vide ? 'panier vide' : 'article présent, total ' + panier.total}`);

if (!panier.vide) {
  console.log('4. passage au paiement');
  await degager();
  // le bouton de caisse est le bouton d'envoi du formulaire de panier
  const parti = await page.evaluate(() => {
    const b = document.querySelector('button[name="checkout"], form[action*="/cart"] button[type="submit"]');
    if (b) {
      b.click();
      return 'bouton de caisse';
    }
    const f = document.querySelector('form[action*="/cart"]');
    if (f) {
      f.action = '/checkout';
      f.submit();
      return 'formulaire envoyé';
    }
    location.href = '/checkout';
    return 'accès direct';
  });
  console.log(`   ${parti}`);
  await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 40000 }).catch(() => {});
  await new Promise((r) => setTimeout(r, 6000));
  const ou = page.url();
  console.log(`   arrivé sur ${ou.slice(0, 80)}`);
  console.log('5. saisie d’une adresse française');
  const remplir = async (nom, valeur) => {
    const ok = await page.evaluate(
      (n, v) => {
        const champ =
          document.querySelector(`input[name="${n}"]`) ||
          [...document.querySelectorAll('input')].find((i) => new RegExp(n, 'i').test(i.name || i.id || i.placeholder || ''));
        if (!champ) return false;
        const poser = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        poser.call(champ, v);
        champ.dispatchEvent(new Event('input', { bubbles: true }));
        champ.dispatchEvent(new Event('change', { bubbles: true }));
        return true;
      },
      nom,
      valeur,
    );
    return ok;
  };
  await remplir('firstName', 'Test');
  await remplir('lastName', 'Livraison');
  await remplir('address1', '12 rue de la Paix');
  await remplir('postalCode', '75002');
  await remplir('city', 'Paris');
  await new Promise((r) => setTimeout(r, 9000));

  const texte = await page.evaluate(() => document.body.innerText.replace(/\s+/g, ' '));
  const aucun = /aucun mode|no shipping|pas de méthode|indisponible pour cette adresse/i.test(texte);
  const propose = /gratuit|standard|colissimo|€\s?\d|expédition/i.test(texte.slice(texte.indexOf('Méthode') > 0 ? texte.indexOf('Méthode') : 0));
  console.log(`   ${aucun ? 'AUCUN MODE DE LIVRAISON : le client ne peut pas payer' : propose ? 'un mode de livraison est proposé' : 'résultat à lire ci-dessous'}`);
  const i = texte.search(/Méthode d.expédition|Shipping method|mode de livraison/i);
  console.log('   zone livraison :', i > 0 ? texte.slice(i, i + 260) : texte.slice(0, 260));
  await page.screenshot({ path: '../kapsulcam/checkout-test.png' });
}
await nav.close();
