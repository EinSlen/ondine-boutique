// Google Ads search campaign content, with length checks (headline <= 30, description <= 90).
import fs from 'node:fs';
const url = 'https://kapsulcam.com/products/kapsulcam-4k';
const headlines = [
  'Mini Caméra 4K Mains Libres', 'KapsulCam 4K : 36 g, POV', 'Livraison Offerte en France', 'Filmez Sans Les Mains',
  'Étanche 30 m, Caisson Inclus', 'Pack Accessoires Inclus', '89,90 € Tout Compris', 'Caméra Casque Moto et VTT',
  'Idéale VTT, Moto et Plongée', 'Caméra POV 4K Mains Libres', 'Mini Caméra Sport 4K', 'Satisfait ou Remboursé 30 J',
  'La Caméra POV Qui Se Porte', 'Caméra Pouce 4K', 'Idée Cadeau Noël à 89,90 €',
];
const descriptions = [
  'Caméra 4K de 36 g à fixer sur casque, guidon ou collier magnétique. Un appui : elle filme.',
  'Pack inclus : caisson étanche 30 m, clip, bracelet, support guidon. Livraison offerte.',
  'Aperçu en direct et partage via l\'appli gratuite iPhone et Android. Garantie légale 2 ans.',
  'Idée cadeau : livrée avant Noël pour toute commande passée avant le 25 novembre.',
];
const groupes = {
  'Cadeau sport': ['"cadeau motard"', '"cadeau vttiste"', '"cadeau skieur"', '"idée cadeau sportif"', '"cadeau caméra sport"'],
  'Mini caméra 4K': ['[mini caméra 4k]', '"mini camera 4k"', '"mini camera 4k vlog"', '"mini camera 4k sport"', '"mini caméra sport"', '"mini camera action 4k"', '"petite caméra 4k"'],
  'Caméra POV': ['[caméra pov]', '"camera pov 4k"', '"camera pov mini"', '"camera pov moto"', '"camera pov sport"', '"caméra point de vue"'],
  'VTT et vélo': ['[caméra vtt]', '"camera vtt casque"', '"caméra vélo"', '"camera vtt pas cher"', '"caméra guidon vélo"'],
  'Moto': ['[caméra casque moto]', '"camera casque moto pas cher"', '"caméra embarquée moto"', '"camera casque moto 4k"'],
  'Portée sur soi': ['"caméra magnétique sport"', '"caméra portable sur soi"', '"caméra corporelle sport"', '"camera pouce"', '"caméra collier"'],
};
const negatifs = ['espion', 'cachée', 'cachee', 'surveillance', 'intérieur', 'interieur', 'extérieure', 'exterieure', 'maison', 'bébé', 'bebe', 'voiture', 'dashcam', 'norauto', 'solaire', 'alarme', 'police', 'occasion', 'réparation', 'notice', 'amazon', 'decathlon', 'gopro', 'insta360', 'dji', 'garmin', 'sony', 'horror', 'pova', 'chat', 'chien', 'animaux', 'nounou'];
let ok = true;
for (const h of headlines) if ([...h].length > 30) { ok = false; console.log('TITRE TROP LONG', [...h].length, h); }
for (const d of descriptions) if ([...d].length > 90) { ok = false; console.log('DESC TROP LONGUE', [...d].length, d); }
fs.writeFileSync('google-ads.json', JSON.stringify({ url, headlines, descriptions, groupes, negatifs, budgetJour: 20, enchere: 'Maximiser les clics, CPC max 0,80 € les 7 premiers jours, puis Maximiser les conversions' }, null, 1));
console.log(ok ? 'longueurs OK' : 'à corriger', headlines.length, 'titres', descriptions.length, 'descriptions');
