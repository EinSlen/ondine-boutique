/**
 * Balaye TOUT le catalogue Printful et retient ce qui est fabricable en Union européenne.
 *
 * Le premier relevé ne portait que sur 25 bases choisies à la main. Celui-ci passe sur les
 * 532 produits actifs, ce qui permet de proposer une gamme sur tout ce qui existe, des
 * chaussures aux casquettes, et pas seulement sur les t-shirts.
 *
 * Ce qui est retenu par produit : la technique d'impression, le nombre de variantes en stock
 * dans un entrepôt européen, et le prix de la variante européenne la moins chère, converti
 * au taux réel du jour.
 *
 * Usage :
 *   node pod-eu-tout.mjs
 *   node pod-eu-tout.mjs --reprendre     repart du fichier existant sans refaire les appels
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ICI = path.dirname(fileURLToPath(import.meta.url));
const SORTIE = path.join(ICI, 'pod-eu-tout.json');
const REPRENDRE = process.argv.includes('--reprendre');

const taux = async () => {
  try {
    const r = await fetch('https://api.frankfurter.dev/v1/latest?base=USD&symbols=EUR');
    const j = await r.json();
    return j.rates.EUR;
  } catch {
    return 0.856037;
  }
};

const main = async () => {
  const TAUX = await taux();
  console.log(`taux USD vers EUR : ${TAUX}`);

  const catalogue = JSON.parse(fs.readFileSync(path.join(ICI, 'pf-catalog.json'), 'utf8')).result.filter(
    (p) => !p.is_discontinued,
  );
  console.log(`${catalogue.length} produits actifs à examiner`);

  const deja = REPRENDRE && fs.existsSync(SORTIE) ? JSON.parse(fs.readFileSync(SORTIE, 'utf8')) : [];
  const vus = new Set(deja.map((x) => x.id));
  const out = [...deja];

  let n = 0;
  for (const p of catalogue) {
    n++;
    if (vus.has(p.id)) continue;
    let j = null;
    for (let essai = 0; essai < 4; essai++) {
      const r = await fetch(`https://api.printful.com/products/${p.id}`);
      if (r.status === 429) {
        const attente = parseInt(r.headers.get('retry-after') || '20', 10);
        console.log(`   limite atteinte, attente ${attente + 2} s`);
        await new Promise((z) => setTimeout(z, (attente + 2) * 1000));
        continue;
      }
      if (!r.ok) break;
      j = await r.json();
      break;
    }
    if (!j || !j.result) {
      out.push({ id: p.id, titre: p.title, erreur: true });
      continue;
    }

    const prod = j.result.product;
    const variantes = j.result.variants || [];
    const eu = variantes.filter((v) =>
      (v.availability_status || []).some((a) => /^EU/.test(a.region) && a.status === 'in_stock'),
    );
    const prix = eu.map((v) => parseFloat(v.price)).filter((x) => x > 0);
    const couleurs = [...new Set(eu.map((v) => v.color).filter(Boolean))];

    out.push({
      id: p.id,
      titre: prod.title,
      marque: prod.brand || null,
      modele: prod.model || null,
      techniques: (prod.techniques || []).map((t) => t.key).join('/'),
      variantes_eu: eu.length,
      eur_min: prix.length ? +(Math.min(...prix) * TAUX).toFixed(2) : null,
      eur_max: prix.length ? +(Math.max(...prix) * TAUX).toFixed(2) : null,
      couleurs_eu: couleurs.length,
      noir: couleurs.some((c) => /black|noir/i.test(c)),
      taux: TAUX,
    });

    if (n % 25 === 0) {
      fs.writeFileSync(SORTIE, JSON.stringify(out, null, 2));
      console.log(`  ${n}/${catalogue.length} examinés, ${out.filter((x) => x.variantes_eu).length} fabricables en UE`);
    }
    await new Promise((z) => setTimeout(z, 260));
  }

  fs.writeFileSync(SORTIE, JSON.stringify(out, null, 2));
  const dispo = out.filter((x) => x.variantes_eu);
  console.log(`\nTERMINE : ${dispo.length} produits fabricables en UE sur ${out.length}`);
  console.log(`dont ${dispo.filter((x) => x.noir).length} disponibles en noir`);
};

main().catch((e) => {
  console.error(`ECHEC : ${e.message}`);
  process.exit(1);
});
