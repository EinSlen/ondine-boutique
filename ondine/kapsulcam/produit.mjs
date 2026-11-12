// Creates or updates the KapsulCam product (idempotent on the handle).
import fs from 'node:fs';
import path from 'node:path';
import { gql, ICI_DIR } from './shop.mjs';

const HANDLE = 'kapsulcam-4k';
const cdn = JSON.parse(fs.readFileSync(path.join(ICI_DIR, 'images-cdn.json'), 'utf8'));

const ALT = {
  '01-pack.jpg': 'Caméra KapsulCam 4K et son pack complet d\'accessoires',
  '02-partout.jpg': 'KapsulCam fixée sur un casque de ski, un guidon de vélo et un tableau de bord',
  '03-etanche.jpg': 'KapsulCam dans son caisson étanche, en plongée',
  '04-un-appui.jpg': 'KapsulCam portée sur un sac, un t-shirt et un poignet',
  '05-appli.jpg': 'Aperçu en direct de la KapsulCam sur un téléphone fixé au guidon',
  '06-specs.jpg': 'Caractéristiques de la KapsulCam : 4K, 36 g, 90 min, étanche 30 m, Wi-Fi',
  '07-dans-la-boite.jpg': 'Contenu de la boîte KapsulCam',
  '08-comparatif.jpg': 'Comparatif KapsulCam, smartphone et action cam classique',
  '09-deux-coloris.jpg': 'KapsulCam en noir et en blanc dans leur boîte',
};

const description = `
<p><strong>Filmez vos meilleurs moments sans sortir votre téléphone.</strong> KapsulCam est une caméra 4K de 36 g qui se fixe sur un casque, un guidon, un sac, un poignet ou un collier magnétique. Un appui sur le bouton : elle filme. Vous profitez, elle enregistre.</p>
<ul>
<li><strong>Vidéo 4K grand angle</strong> pour des images immersives, à la première personne.</li>
<li><strong>Vraiment mains libres</strong> : collier magnétique, clip, bracelet et support guidon fournis.</li>
<li><strong>Étanche jusqu'à 30 m</strong> avec le caisson de plongée inclus.</li>
<li><strong>Jusqu'à 90 minutes d'enregistrement</strong> (Wi-Fi coupé), recharge en USB-C.</li>
<li><strong>Appli gratuite iPhone et Android</strong> : aperçu en direct, téléchargement et partage sans câble.</li>
</ul>
<h3>Pour qui ?</h3>
<p>VTT et vélo, moto, ski, plongée et piscine, balades avec les enfants ou le chien, voyages, vlogs, recettes de cuisine : tout ce que vous vivez, filmé de votre point de vue.</p>
<h3>Dans la boîte</h3>
<ul>
<li>Caméra 4K</li>
<li>Caisson étanche 30 m</li>
<li>Collier magnétique</li>
<li>Clip dos</li>
<li>Bracelet</li>
<li>Support guidon vélo et moto</li>
<li>Câble USB-C</li>
<li>Notice</li>
</ul>
<p><strong>Pack Complet</strong> : tout le contenu ci-dessus, plus une carte microSD 64 Go et une perche-trépied 3 en 1. <strong>Duo</strong> : deux caméras avec chacune leurs accessoires.</p>
<h3>Caractéristiques</h3>
<ul>
<li>Vidéo : 4K, encodage H.265</li>
<li>Poids : 36 g</li>
<li>Dimensions : 6,4 x 2,8 x 1,8 cm</li>
<li>Autonomie : jusqu'à 90 min (Wi-Fi coupé)</li>
<li>Stockage : carte microSD jusqu'à 128 Go (incluse dans le Pack Complet)</li>
<li>Connexion : Wi-Fi, appli gratuite iOS et Android</li>
<li>Étanchéité : jusqu'à 30 m dans le caisson fourni</li>
</ul>
<h3>Livraison et retours</h3>
<p>Livraison suivie offerte en France, Belgique et Luxembourg, en 10 à 18 jours ouvrés. Satisfait ou remboursé 30 jours pour une caméra complète et non utilisée. Garantie légale de conformité de 2 ans.</p>
`.trim();

const COULEURS = ['Noir', 'Blanc'];
const PACKS = [
  { nom: 'Caméra + accessoires', prix: '89.90', sku: '' },
  { nom: 'Pack Complet', prix: '109.90', compare: '134.70', sku: '-PACK' },
  { nom: 'Duo (2 caméras)', prix: '159.90', compare: '179.80', sku: '-DUO' },
];

const files = Object.keys(cdn).sort().map((f) => ({ originalSource: cdn[f], alt: ALT[f] || '', contentType: 'IMAGE' }));

const variants = COULEURS.flatMap((c) => PACKS.map((p) => ({
  optionValues: [{ optionName: 'Couleur', name: c }, { optionName: 'Pack', name: p.nom }],
  price: p.prix,
  compareAtPrice: p.compare || null,
  sku: `KC4K-${c.toUpperCase()}${p.sku}`,
  inventoryPolicy: 'CONTINUE',
  inventoryItem: { tracked: false, requiresShipping: true, measurement: { weight: { value: 0.3, unit: 'KILOGRAMS' } } },
  taxable: true,
})));

const existant = (await gql(`query($h: String!) { productByHandle(handle: $h) { id } }`, { h: HANDLE })).productByHandle;

const input = {
  ...(existant ? { id: existant.id } : {}),
  handle: HANDLE,
  title: 'KapsulCam 4K : mini caméra POV mains libres',
  descriptionHtml: description,
  vendor: 'KapsulCam',
  productType: 'Caméra d\'action',
  tags: ['camera', 'pov', '4k', 'kapsulcam'],
  status: 'ACTIVE',
  seo: {
    title: 'KapsulCam 4K : mini caméra POV mains libres, étanche 30 m',
    description: 'Caméra 4K de 36 g qui se fixe partout : casque, guidon, collier magnétique. Étanche 30 m avec caisson, appli Wi-Fi, pack d\'accessoires inclus. Livraison offerte.',
  },
  productOptions: [
    { name: 'Couleur', values: COULEURS.map((name) => ({ name })) },
    { name: 'Pack', values: PACKS.map((p) => ({ name: p.nom })) },
  ],
  files: existant && process.argv.includes('--sans-images') ? undefined : files,
  variants,
};

const r = await gql(`mutation($input: ProductSetInput!) { productSet(synchronous: true, input: $input) {
  product { id handle onlineStoreUrl variants(first: 10) { nodes { id title price sku } } media(first: 20) { nodes { id status } } }
  userErrors { field message code } } }`, { input });
console.log(JSON.stringify(r.productSet, null, 1));
