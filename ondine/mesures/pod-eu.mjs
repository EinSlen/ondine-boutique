// Mesure le catalogue Printful reellement fabricable en Europe.
// Sortie: pod-eu.json + tableau trie par prix de base.
import fs from 'fs';

const USD_EUR = 0.856037; // taux reel du 21/08/2026, source api.frankfurter.dev
const KEEP = /hoodie|sweatshirt|t-shirt|tee|crewneck|bag|beanie|cap|jacket|sweatpants/i;
const SKIP = /kids|youth|toddler|baby|dog|phone|mug|poster|sticker|puzzle/i;

const list = JSON.parse(fs.readFileSync(new URL('./pf-catalog.json', import.meta.url), 'utf8')).result;

const candidats = list.filter((p) => {
  const t = `${p.title} ${p.type_name} ${p.model || ''}`;
  return KEEP.test(t) && !SKIP.test(t) && !p.is_discontinued;
});

console.log(`candidats: ${candidats.length} sur ${list.length}`);

const out = [];
for (let i = 0; i < candidats.length; i += 4) {
  const lot = candidats.slice(i, i + 4);
  const res = await Promise.all(
    lot.map(async (p) => {
      try {
        const r = await fetch(`https://api.printful.com/products/${p.id}`, {
          headers: { 'User-Agent': 'Mozilla/5.0' },
        });
        if (!r.ok) return null;
        const j = await r.json();
        const variants = j.result.variants || [];
        const eu = variants.filter((v) =>
          (v.availability_status || []).some(
            (a) => /^EU/.test(a.region) && a.status === 'in_stock',
          ),
        );
        if (!eu.length) return null;
        const prix = eu.map((v) => parseFloat(v.price)).filter(Boolean).sort((a, b) => a - b);
        return {
          id: p.id,
          marque: p.brand || 'Printful',
          modele: p.model || p.title,
          titre: p.title,
          techniques: (p.techniques || []).map((t) => t.key).join('/'),
          usd_min: prix[0],
          usd_max: prix[prix.length - 1],
          eur_min: +(prix[0] * USD_EUR).toFixed(2),
          variantes_eu: eu.length,
          delai: p.avg_fulfillment_time,
        };
      } catch {
        return null;
      }
    }),
  );
  out.push(...res.filter(Boolean));
  await new Promise((r) => setTimeout(r, 400));
  if (i % 40 === 0) console.log(`  ${i}/${candidats.length}, ${out.length} fabricables en UE`);
}

out.sort((a, b) => a.eur_min - b.eur_min);
fs.writeFileSync(new URL('./pod-eu.json', import.meta.url), JSON.stringify(out, null, 2));

const fam = (t) => {
  if (/hoodie|zip/i.test(t)) return 'sweat capuche';
  if (/sweatshirt|crewneck/i.test(t)) return 'sweat col rond';
  if (/t-shirt|tee/i.test(t)) return 'tee';
  if (/bag|tote/i.test(t)) return 'sac';
  if (/beanie|cap|hat/i.test(t)) return 'couvre-chef';
  return 'autre';
};

console.log(`\n${out.length} produits fabricables en UE\n`);
for (const f of ['sweat capuche', 'sweat col rond', 'tee', 'sac', 'couvre-chef']) {
  const g = out.filter((p) => fam(p.titre) === f).slice(0, 6);
  if (!g.length) continue;
  console.log(`--- ${f} ---`);
  for (const p of g) {
    console.log(
      `  ${String(p.eur_min).padStart(6)} EUR | ${p.marque} ${p.modele} | ${p.techniques} | ${p.variantes_eu} variantes`,
    );
  }
}
