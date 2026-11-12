// "Pas cher HD" ad group for KC Recherche FR: HD 1080P offer at 69,90 EUR, price-sensitive searches only, with length checks.
import fs from 'node:fs';
const groupe = 'Pas cher HD';
const url = 'https://kapsulcam.com/products/kapsulcam-4k?variant=54335767183688';
const chemin = ['camera-pov', 'hd'];
const titres = [
  'Mini Caméra HD à 69,90 €', 'Caméra POV HD 1080P', 'Livraison Offerte en France', 'Accessoires Inclus',
  '69,90 € Livraison Comprise', 'Étanche 30 m, Caisson Inclus', 'Existe Aussi en 4K', 'Satisfait ou Remboursé 30 J',
  'Caméra Casque Moto et VTT', 'Filmez Sans Les Mains', 'Caméra VTT HD 1080P', 'Caméra Pouce HD 1080P',
];
const descriptions = [
  'Caméra HD 1080P à fixer sur casque, guidon ou collier magnétique. Un appui : elle filme.',
  'Inclus : caisson étanche 30 m, collier, clip, bracelet, support guidon. Livraison offerte.',
  'Version HD à 69,90 € ou version 4K à 89,90 €. Satisfait ou remboursé 30 jours.',
];
const motsCles = [
  '"camera vtt pas cher"', '"camera casque moto pas cher"', '"mini camera pas cher"', '"camera pouce pas cher"',
  '"camera pov pas cher"', '"mini camera sport pas cher"', '"petite camera pas cher"', '"mini camera 1080p"', '"camera pouce 1080p"',
];
const exclusionsGroupe1 = ['pas cher', '1080p'];
const len = (s) => [...s].length;
let ok = true;
const check = (s, max, what) => { if (len(s) > max) { ok = false; console.log(what, 'TROP LONG', len(s), s); } };
titres.forEach((t) => check(t, 30, 'titre'));
descriptions.forEach((d) => check(d, 90, 'description'));
chemin.forEach((c) => check(c, 15, 'chemin'));
fs.writeFileSync('google-ads-hd.json', JSON.stringify({ groupe, url, chemin, titres, descriptions, motsCles, exclusionsGroupe1 }, null, 1));
console.log(ok ? 'longueurs OK' : 'à corriger', titres.length, 'titres', descriptions.length, 'descriptions', motsCles.length, 'mots-clés');
