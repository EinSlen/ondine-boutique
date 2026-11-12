// node generer-csv-selene.mjs : writes selene-shopify.csv, the Shopify import file for the made-to-order photo moon (same columns as produits-shopify.csv)
import fs from 'node:fs';

const COLS = ['Handle', 'Title', 'Body (HTML)', 'Vendor', 'Type', 'Tags', 'Published', 'Option1 Name', 'Option1 Value', 'Variant SKU', 'Variant Grams', 'Variant Inventory Policy', 'Variant Fulfillment Service', 'Variant Price', 'Variant Requires Shipping', 'Variant Taxable', 'Image Src', 'Image Position', 'Image Alt Text', 'SEO Title', 'SEO Description', 'Status'];
const IMG = 'https://d8j0ntlcm91z4.cloudfront.net/user_3K05E9lsyQPZNbwtqHS0e6aecDs/';
const images = [
  ['hf_20261110_093412_acd2ec2d-a8a0-42b6-9ecc-c7d087464406.png', 'Lune Séléné allumée sur une table de chevet, avec la photo d\'un couple imprimée dedans'],
  ['hf_20261110_093249_3a05ba9d-a93e-4067-8a21-d5c86aa17f62.png', 'Lune Séléné avec deux prénoms et une date imprimés dedans'],
  ['hf_20261110_093412_3d060231-601a-4e0b-a4d1-6207c4f7c6de.png', 'Lune Séléné offerte en cadeau, avec la photo d\'une grand-mère et de sa petite-fille']
];
const body = [
  "<p>Une lune imprimée en 3D qui fait apparaître votre photo ou votre texte quand elle s'allume. Elle arrive avec son support en bois, prête à offrir.</p>",
  '<ul>',
  '<li>Votre photo, ou un texte court (prénoms, date, message), imprimé dans la lune</li>',
  '<li>15 cm de diamètre, support en bois fourni</li>',
  '<li>Rechargeable en USB, sans fil une fois chargée</li>',
  '<li>16 couleurs avec la télécommande, ou une lumière blanche chaude</li>',
  '</ul>',
  "<p>Fabriquée à votre commande : comptez 3 à 4 semaines avant de la recevoir. Pour l'avoir à Noël, commandez avant le 20 novembre.</p>",
  "<p>Article personnalisé : il ne peut être ni repris ni échangé, sauf s'il arrive abîmé ou ne correspond pas à votre photo ou à votre texte.</p>"
].join('');

const first = {
  Handle: 'selene', Title: 'Séléné, la lune à votre photo', 'Body (HTML)': body, Vendor: 'Plafond Céleste', Type: 'Lampe', Tags: 'lune, personnalisé, cadeau',
  Published: 'TRUE', 'Option1 Name': 'Taille', 'Option1 Value': '15 cm', 'Variant SKU': 'PC-SELENE-15', 'Variant Grams': '600', 'Variant Inventory Policy': 'continue',
  'Variant Fulfillment Service': 'manual', 'Variant Price': '54.90', 'Variant Requires Shipping': 'TRUE', 'Variant Taxable': 'FALSE',
  'Image Src': IMG + images[0][0], 'Image Position': '1', 'Image Alt Text': images[0][1],
  'SEO Title': 'Séléné, lampe lune personnalisée avec votre photo', 'SEO Description': 'Lune imprimée en 3D avec votre photo ou votre texte, support en bois, 16 couleurs, rechargeable en USB.', Status: 'active'
};
const rows = [first, ...images.slice(1).map(([src, alt], i) => ({ Handle: 'selene', 'Image Src': IMG + src, 'Image Position': String(i + 2), 'Image Alt Text': alt }))];
const q = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
const csv = '﻿' + [COLS.map(q).join(','), ...rows.map((r) => COLS.map((c) => q(r[c])).join(','))].join('\n') + '\n';
fs.writeFileSync(new URL('./selene-shopify.csv', import.meta.url), csv);
console.log('selene-shopify.csv', rows.length, 'lignes');
