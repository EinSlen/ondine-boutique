// node generer-csv.mjs : writes produits-shopify.csv (Shopify product import format) for the Plafond Céleste launch
import fs from 'node:fs';

const LIVRAISON = '<p>Livraison suivie offerte, en 8 à 15 jours ouvrés. Retours possibles sous 14 jours.</p>';

const PRODUITS = [
  {
    handle: 'lucarne', title: 'Lucarne, le ciel de poche', price: '34.90', type: 'Projecteur', tags: 'projecteur, plafond, lancement',
    sku: 'PC-LUCARNE-6', option: '6 disques', status: 'active',
    seo: 'Lucarne, mini projecteur de plafond à brancher, 6 disques',
    body: `<p>Branchez Lucarne sur la prise près du lit, glissez un disque, éteignez : la lune ou une galaxie s'affiche au plafond.</p><ul><li>Se branche directement en USB, sans pile</li><li>6 disques d'images fournis</li><li>Pensé pour un plafond de chambre, à environ 2 m</li></ul>${LIVRAISON}`,
    images: ['https://ae-pic-a1.aliexpress-media.com/kf/S2a99c08cd95d4d78af875bd990eb6f38s.jpg', 'https://ae-pic-a1.aliexpress-media.com/kf/S8b982f3297134e02a55fecdbeb6e34d5k.jpg', 'https://ae-pic-a1.aliexpress-media.com/kf/S22fb63cf1c05413682284aad673aeb47a.jpg', 'https://ae-pic-a1.aliexpress-media.com/kf/S321a301185264f5898e95f9d78ef3c24o.jpg']
  },
  {
    handle: 'boreale', title: 'Boréale, l\'aurore au plafond', price: '34.90', type: 'Projecteur', tags: 'projecteur, aurore, plafond, lancement',
    sku: 'PC-BOREALE', option: 'Aurore avec télécommande', status: 'active',
    seo: 'Boréale, projecteur d\'aurore boréale au plafond avec télécommande',
    body: `<p>Une aurore boréale qui ondule lentement sur le plafond, avec un ciel étoilé autour. On choisit les couleurs à la télécommande.</p><ul><li>Effet aurore et étoiles, plusieurs couleurs</li><li>Télécommande fournie</li><li>Câble USB, à poser sur une table de nuit ou une étagère</li></ul>${LIVRAISON}`,
    images: ['https://ae-pic-a1.aliexpress-media.com/kf/S733fc469962d495a8bd92ef39b8f7b3d0.jpg', 'https://ae-pic-a1.aliexpress-media.com/kf/S20eec4988f5e4d6a8e2c4682d56bf361r.jpg', 'https://ae-pic-a1.aliexpress-media.com/kf/S9ec16fa37a994bbebe5c9df0e5735dc8K.jpg', 'https://ae-pic-a1.aliexpress-media.com/kf/Sf8682591df3d4dde9c1a8a3f29324f2cd.jpg']
  },
  {
    handle: 'astro', title: 'Astro, le petit astronaute', price: '39.90', type: 'Projecteur', tags: 'projecteur, astronaute, plafond, lancement',
    sku: 'PC-ASTRO', option: '12 disques', status: 'active',
    seo: 'Astro, projecteur astronaute de plafond, 12 disques',
    body: `<p>Un petit astronaute qui projette nébuleuses, planètes et étoiles sur le plafond de la chambre.</p><ul><li>12 disques d'images fournis</li><li>À poser sur la table de nuit, image vers le plafond</li><li>Alimentation USB</li></ul>${LIVRAISON}`,
    images: ['https://ae-pic-a1.aliexpress-media.com/kf/Sf191b350b1c445a58ebcaf69db7c9d4dC.jpg', 'https://ae-pic-a1.aliexpress-media.com/kf/S046e2147c99a4b67a77dfd8c0485b0aew.jpg', 'https://ae-pic-a1.aliexpress-media.com/kf/S58e9370998e5405eac7be9b47e51131dE.jpg', 'https://ae-pic-a1.aliexpress-media.com/kf/Sacfd5c6e711947bf9aff9c02035804faR.jpg']
  },
  {
    handle: 'lagon', title: 'Lagon, les reflets d\'eau', price: '29.90', type: 'Lampe', tags: 'lampe, reflets, plafond, lancement',
    sku: 'PC-LAGON', option: '16 couleurs', status: 'active',
    seo: 'Lagon, lampe à reflets d\'eau qui bougent au plafond, 16 couleurs',
    body: `<p>Des reflets d'eau qui bougent doucement sur les murs et le plafond, comme au fond d'une piscine le soir.</p><ul><li>16 couleurs au choix</li><li>Télécommande avec variateur</li><li>Rotation pour animer les reflets</li></ul>${LIVRAISON}`,
    images: ['https://ae-pic-a1.aliexpress-media.com/kf/Sfa894fa2224c42a6b7b8e133c9e3f0488.jpg', 'https://ae-pic-a1.aliexpress-media.com/kf/S115e686037ea4a6084442aab980e2ffeX.jpg', 'https://ae-pic-a1.aliexpress-media.com/kf/Se4c3302fa9a7497da7414567b1df2341L.jpg', 'https://ae-pic-a1.aliexpress-media.com/kf/Se4e26ce5cfe44438b694b3c6a3137f83A.jpg']
  },
  {
    handle: 'phebe', title: 'Phébé, la lune sur mesure', price: '74.00', type: 'Lampe', tags: 'lune, cadeau, gravure, bientot',
    sku: 'PC-PHEBE', option: 'Socle noyer', status: 'draft',
    seo: 'Phébé, lune en lévitation gravée à votre date',
    body: `<p>Une lune qui flotte au-dessus d'un socle en bois gravé à vos deux prénoms et à votre date, avec la carte de la phase de la lune ce soir-là.</p><p>Bientôt disponible.</p>`,
    images: ['https://ae-pic-a1.aliexpress-media.com/kf/Sd4dbdac8a6d449f3b497cac42443eaa9w.jpg']
  }
];

const HEAD = ['Handle', 'Title', 'Body (HTML)', 'Vendor', 'Type', 'Tags', 'Published', 'Option1 Name', 'Option1 Value', 'Variant SKU', 'Variant Grams', 'Variant Inventory Policy', 'Variant Fulfillment Service', 'Variant Price', 'Variant Requires Shipping', 'Variant Taxable', 'Image Src', 'Image Position', 'Image Alt Text', 'SEO Title', 'SEO Description', 'Status'];
const q = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
const rows = [HEAD.map(q).join(',')];
for (const p of PRODUITS) {
  p.images.forEach((src, i) => {
    const first = i === 0;
    const r = {
      Handle: p.handle,
      Title: first ? p.title : '',
      'Body (HTML)': first ? p.body : '',
      Vendor: first ? 'Plafond Céleste' : '',
      Type: first ? p.type : '',
      Tags: first ? p.tags : '',
      Published: first ? (p.status === 'active' ? 'TRUE' : 'FALSE') : '',
      'Option1 Name': first ? 'Modèle' : '',
      'Option1 Value': first ? p.option : '',
      'Variant SKU': first ? p.sku : '',
      'Variant Grams': first ? '0' : '',
      'Variant Inventory Policy': first ? 'continue' : '',
      'Variant Fulfillment Service': first ? 'manual' : '',
      'Variant Price': first ? p.price : '',
      'Variant Requires Shipping': first ? 'TRUE' : '',
      'Variant Taxable': first ? 'FALSE' : '',
      'Image Src': src,
      'Image Position': String(i + 1),
      'Image Alt Text': p.title,
      'SEO Title': first ? p.title : '',
      'SEO Description': first ? p.seo : '',
      Status: first ? p.status : ''
    };
    rows.push(HEAD.map((h) => q(r[h])).join(','));
  });
}
fs.writeFileSync(new URL('./produits-shopify.csv', import.meta.url), '﻿' + rows.join('\n'));
console.log(`${PRODUITS.length} produits, ${rows.length - 1} lignes`);
