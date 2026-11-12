// Build the Judge.me import CSV for Lucarne from the original AliExpress reviews of listing 1005012194142648 (adapted from kapsulcam/avis-csv.mjs):
// every rating kept, masked names, real dates, no location; reviews about the seller only or naming another disc count are left out.
import fs from 'node:fs';
const ID = '1005012194142648';
const src = JSON.parse(fs.readFileSync(`avis/ali-${ID}.json`, 'utf8'));
// 3, 8, 10, 37, 45: about the AliExpress seller or store, not the projector; 1, 51, 192: name a disc count we do not sell.
const LEFT_OUT = new Set([1, 3, 8, 10, 37, 45, 51, 192]);
// Photos left out: a young child in the picture (9-1, 9-2), English instruction sheet (38-0).
const SKIP_PHOTOS = new Set(['9-1', '9-2', '38-0']);
const MOIS = { 'janv.': 1, 'févr.': 2, mars: 3, 'avr.': 4, mai: 5, juin: 6, 'juill.': 7, 'août': 8, 'sept.': 9, 'oct.': 10, 'nov.': 11, 'déc.': 12 };
const date = (s) => { const [d, m, y] = s.split(' '); return `${y}-${String(MOIS[m]).padStart(2, '0')}-${d.padStart(2, '0')}`; };
const q = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
const rows = [];
src.forEach((r, i) => {
  const body = (r.buyerTranslationFeedback || r.buyerFeedback || '').replace(/\s+/g, ' ').trim();
  if (!body || LEFT_OUT.has(i)) return;
  const pics = (r.images || []).filter((_, k) => !SKIP_PHOTOS.has(`${i}-${k}`));
  rows.push({
    title: '',
    body,
    rating: r.buyerEval / 20,
    review_date: date(r.evalDate),
    reviewer_name: /aliexpress/i.test(r.buyerName) ? 'Acheteur anonyme' : r.buyerName.trim(),
    reviewer_email: `avis-${r.evaluationIdStr}@example.com`,
    product_handle: 'lucarne',
    picture_urls: pics.join(','),
  });
});
const cols = Object.keys(rows[0]);
fs.writeFileSync('avis/judgeme-import.csv', '﻿' + [cols.join(','), ...rows.map((r) => cols.map((c) => q(r[c])).join(','))].join('\r\n'));
const dist = {};
rows.forEach((r) => { dist[r.rating] = (dist[r.rating] || 0) + 1; });
const moy = rows.reduce((s, r) => s + r.rating, 0) / rows.length;
console.log(rows.length, 'avis, moyenne', moy.toFixed(2), JSON.stringify(dist), ', photos', rows.reduce((s, r) => s + (r.picture_urls ? r.picture_urls.split(',').length : 0), 0));
