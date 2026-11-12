// Google Ads recommendations for KC Recherche FR (callouts, sitelinks, one headline), with length checks.
import fs from 'node:fs';
const site = 'https://kapsulcam.com';
const accroches = [
  'Livraison offerte', 'Vidéo 4K grand angle', 'Seulement 36 g', 'Caisson étanche 30 m',
  'Collier magnétique fourni', 'Appli iPhone et Android', 'Satisfait ou remboursé', 'Garantie légale 2 ans',
];
const liens = [
  { texte: 'Livraison et retours', url: '/pages/livraison-et-retours', d1: 'Livraison suivie offerte', d2: 'Satisfait ou remboursé 30 jours' },
  { texte: 'Kit carte + perche', url: '/products/kit-carte-perche', d1: 'Carte microSD 64 Go', d2: 'et perche-trépied 3 en 1' },
  { texte: 'Choisir sa caméra POV', url: '/blogs/journal/choisir-mini-camera-pov', d1: '7 critères pour bien choisir', d2: 'Notre guide avant d\'acheter' },
  { texte: 'Filmer en VTT et à vélo', url: '/blogs/journal/filmer-vtt-velo-pov-conseils', d1: 'Nos conseils pour filmer', d2: 'vos sorties en POV' },
  { texte: 'Filmer sous l\'eau', url: '/blogs/journal/filmer-sous-l-eau-mini-camera', d1: 'Le guide pour débuter', d2: 'Caisson étanche 30 m inclus' },
  { texte: 'Nous contacter', url: '/pages/nous-contacter', d1: 'Une question avant d\'acheter ?', d2: 'Réponse sous 24 h ouvrées' },
];
const titre = { avant: 'La Caméra POV Qui Se Porte', apres: 'Caméra 4K Sport et Voyage' };
const len = s => [...s].length;
let ok = true;
const check = (s, max, what) => { if (len(s) > max) { ok = false; console.log(what, 'TROP LONG', len(s), s); } };
accroches.forEach(a => check(a, 25, 'accroche'));
liens.forEach(l => { check(l.texte, 25, 'lien'); check(l.d1, 35, 'desc 1'); check(l.d2, 35, 'desc 2'); });
check(titre.apres, 30, 'titre');
const out = [
  'ACCROCHES (campagne KC Recherche FR)', ...accroches.map(a => `  ${a}`), '',
  'LIENS ANNEXES (campagne KC Recherche FR)',
  ...liens.flatMap(l => [`  ${l.texte}`, `    URL : ${site}${l.url}`, `    Ligne 1 : ${l.d1}`, `    Ligne 2 : ${l.d2}`]), '',
  'TITRE A REMPLACER (annonce du Groupe d\'annonces 1)', `  ${titre.avant}  ->  ${titre.apres}`, '',
];
fs.writeFileSync('google-ads-recos.txt', out.join('\n'));
fs.writeFileSync('google-ads-recos.json', JSON.stringify({ site, accroches, liens, titre }, null, 1));
console.log(ok ? 'longueurs OK' : 'à corriger', accroches.length, 'accroches', liens.length, 'liens');
