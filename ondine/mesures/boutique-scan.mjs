// Mesure n'importe quelle boutique Shopify concurrente sans compte ni cle d'API.
// Usage: node boutique-scan.mjs live2die.us brut-clothing.com
// Sans argument, rejoue le panel du 21/08/2026.
// Sortie: boutique-scan.json
import fs from 'fs';

const PANEL = [
  'live2die.us',
  'brut-clothing.com',
  'avnier.com',
  'sixthjune.com',
  'nakedcph.com',
];

const domaines = process.argv.slice(2).length ? process.argv.slice(2) : PANEL;

const famille = (t) => {
  t = t.toLowerCase();
  if (/hoodie|capuche|zip.?up|sweat.?shirt|crewneck/.test(t)) return 'sweat';
  if (/t-?shirt|tshirt|\btee\b|longsleeve/.test(t)) return 'tee';
  if (/\bbag\b|tote|sac/.test(t)) return 'sac';
  if (/shoe|high.?top|birkenstock|sneaker/.test(t)) return 'chaussure';
  return 'autre';
};

const mediane = (a) => (a.length ? a.slice().sort((x, y) => x - y)[Math.floor(a.length / 2)] : null);

const out = [];
for (const d of domaines) {
  let json;
  try {
    const r = await fetch(`https://${d}/products.json?limit=250`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
    });
    if (!r.ok) {
      console.log(`${d} : HTTP ${r.status}, boutique non lisible`);
      continue;
    }
    json = await r.json();
  } catch (e) {
    console.log(`${d} : injoignable, ${e.message}`);
    continue;
  }

  const produits = json.products || [];
  if (!produits.length) {
    console.log(`${d} : catalogue vide ou protege`);
    continue;
  }

  const variantes = [];
  for (const p of produits) {
    for (const v of p.variants) {
      const prix = parseFloat(v.price);
      if (!prix) continue;
      variantes.push({
        titre: p.title.trim(),
        prix,
        dispo: v.available,
        famille: famille(`${p.title} ${p.product_type || ''}`),
        cree: (v.created_at || p.published_at).slice(0, 7),
      });
    }
  }

  const epuisees = variantes.filter((v) => !v.dispo);
  const parFamille = {};
  for (const f of ['sweat', 'tee', 'sac', 'chaussure']) {
    const prix = variantes.filter((v) => v.famille === f).map((v) => v.prix);
    if (prix.length) parFamille[f] = { n: prix.length, median: mediane(prix), min: Math.min(...prix), max: Math.max(...prix) };
  }

  const parMois = {};
  for (const v of epuisees) parMois[v.cree] = +((parMois[v.cree] || 0) + v.prix).toFixed(0);

  const fiche = {
    domaine: d,
    produits: produits.length,
    variantes: variantes.length,
    epuisees: epuisees.length,
    ca_proxy: +epuisees.reduce((a, v) => a + v.prix, 0).toFixed(0),
    panier_moyen: epuisees.length ? +(epuisees.reduce((a, v) => a + v.prix, 0) / epuisees.length).toFixed(2) : null,
    prix_median: mediane(variantes.map((v) => v.prix)),
    par_famille: parFamille,
    ca_proxy_par_mois: parMois,
  };
  out.push(fiche);

  console.log(
    `${d} | ${fiche.produits} produits | ${fiche.epuisees}/${fiche.variantes} epuisees | ` +
      `CA proxy ${fiche.ca_proxy} | panier ${fiche.panier_moyen} | ` +
      Object.entries(parFamille).map(([f, s]) => `${f} med ${s.median}`).join(', '),
  );

  await new Promise((r) => setTimeout(r, 1500));
}

fs.writeFileSync(new URL('./boutique-scan.json', import.meta.url), JSON.stringify(out, null, 2));
console.log(`\n${out.length} boutiques mesurees, ecrit dans boutique-scan.json`);
console.log('Le CA proxy suppose qu une variante epuisee a ete vendue. Il majore sur les pieces retirees.');
