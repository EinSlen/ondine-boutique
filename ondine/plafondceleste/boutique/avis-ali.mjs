// Fetch the original AliExpress reviews of a listing (masked names, real dates, real ratings) into avis/ali-<id>.json (copied from kapsulcam/avis-ali.mjs).
import fs from 'node:fs';
const ID = process.argv[2] || '1005012011085604';
const UA = { 'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36' };
const all = [];
for (let page = 1; page < 20; page++) {
  const r = await fetch(`https://feedback.aliexpress.com/pc/searchEvaluation.do?productId=${ID}&lang=fr_FR&country=FR&page=${page}&pageSize=20&filter=all&sort=complex_default`, { headers: UA });
  const j = await r.json();
  const l = j.data?.evaViewList || [];
  all.push(...l);
  if (l.length < 20) { console.log('total annonce', j.data?.productEvaluationStatistic?.totalNum, 'moyenne', j.data?.productEvaluationStatistic?.evarageStar); break; }
}
fs.writeFileSync(`avis/ali-${ID}.json`, JSON.stringify(all, null, 1));
const dist = {}; all.forEach((a) => { const s = a.buyerEval / 20; dist[s] = (dist[s] || 0) + 1; });
console.log('récupérés', all.length, 'notes', JSON.stringify(dist), 'moyenne', (all.reduce((s, a) => s + a.buyerEval / 20, 0) / all.length).toFixed(2));
console.log('avec texte', all.filter((a) => (a.buyerTranslationFeedback || a.buyerFeedback || '').trim()).length, 'avec photos', all.filter((a) => a.images?.length).length);
console.log('champs', Object.keys(all[0]).join(','));
