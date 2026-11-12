// Build the Judge.me import CSV from the original AliExpress reviews: 4K variant only, real dates, masked names, no seller-only reviews.
import fs from 'node:fs';
const ID = '1005012011085604';
const src = JSON.parse(fs.readFileSync(`avis/ali-${ID}.json`, 'utf8'));
// Reviews only about the AliExpress seller or its delivery, not about the camera.
const SELLER_ONLY = new Set([19, 29]);
// Photos left out: shipping label with personal data, retail box shots.
const SKIP_PHOTOS = new Set(['18-0', '18-2', '40-0']);
const MOIS = { 'janv.': 1, 'févr.': 2, mars: 3, 'avr.': 4, mai: 5, juin: 6, 'juill.': 7, 'août': 8, 'sept.': 9, 'oct.': 10, 'nov.': 11, 'déc.': 12 };
const PAYS = { FR: 'France', BE: 'Belgique', ES: 'Espagne', US: 'États-Unis', GB: 'Royaume-Uni', CL: 'Chili', MX: 'Mexique', IL: 'Israël', BR: 'Brésil', CA: 'Canada', AU: 'Australie', HU: 'Hongrie', UA: 'Ukraine', PE: 'Pérou', CO: 'Colombie', NZ: 'Nouvelle-Zélande', PT: 'Portugal', HR: 'Croatie', TH: 'Thaïlande', NL: 'Pays-Bas', PL: 'Pologne', BG: 'Bulgarie', MQ: 'Martinique' };
const date = (s) => { const [d, m, y] = s.split(' '); return `${y}-${String(MOIS[m]).padStart(2, '0')}-${d.padStart(2, '0')}`; };
const q = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
const rows = [];
src.forEach((r, i) => {
  if (!/^Color:4K-/.test(r.skuInfo || '') || SELLER_ONLY.has(i)) return;
  const pics = (r.images || []).filter((_, k) => !SKIP_PHOTOS.has(`${i}-${k}`));
  rows.push({
    title: '',
    body: (r.buyerTranslationFeedback || r.buyerFeedback).replace(/\s+/g, ' ').trim(),
    rating: r.buyerEval / 20,
    review_date: date(r.evalDate),
    reviewer_name: /aliexpress/i.test(r.buyerName) ? 'Acheteur anonyme' : r.buyerName.trim(),
    reviewer_email: `avis-${r.evaluationIdStr}@example.com`,
    product_handle: 'kapsulcam-4k',
    picture_urls: pics.join(','),
    location: PAYS[r.buyerCountry] || r.buyerCountry,
  });
});
const cols = Object.keys(rows[0]);
fs.writeFileSync('avis/judgeme-import.csv', '﻿' + [cols.join(','), ...rows.map((r) => cols.map((c) => q(r[c])).join(','))].join('\r\n'));
const moy = rows.reduce((s, r) => s + r.rating, 0) / rows.length;
console.log(rows.length, 'avis, moyenne', moy.toFixed(2), ', photos', rows.reduce((s, r) => s + (r.picture_urls ? r.picture_urls.split(',').length : 0), 0));
rows.forEach((r) => console.log(r.rating, r.review_date, r.reviewer_name, r.location, '|', r.body.slice(0, 90)));
