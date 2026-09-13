// Recupere les vrais tableaux de tailles Printful et genere le HTML du guide des tailles.
// L'endpoint /products/{id}/sizes est public, aucune cle necessaire.
// Sorties: tailles.json et tailles.html
import fs from 'fs';

const PRODUITS = [
  { id: 388, nom: 'Sweat à capuche all-over print' },
  { id: 320, nom: 'Sweat col rond all-over print' },
  { id: 586, nom: 'T-shirt heavyweight' },
  { id: 438, nom: 'T-shirt classique' },
  { id: 458, nom: 'Bonnet' },
];

const POUCE_CM = 2.54;
const cm = (v) => {
  const n = parseFloat(String(v).replace(',', '.'));
  return Number.isFinite(n) ? Math.round(n * POUCE_CM * 10) / 10 : null;
};

const out = [];
for (const p of PRODUITS) {
  const r = await fetch(`https://api.printful.com/products/${p.id}/sizes`, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
  });
  if (!r.ok) {
    console.log(`${p.nom} : HTTP ${r.status}`);
    continue;
  }
  const j = await r.json();
  const res = j.result;
  // Choix du tableau, et c'est un piege. product_measure renvoie parfois A, B, C, qui
  // renvoient a un schema qu'on n'a pas. measure_yourself renvoie parfois une "poitrine"
  // de 46 cm, qui n'est pas un tour de corps mais une mesure a plat. On prend donc le
  // tableau dont les libelles sont explicites, et on verifie la plausibilite ensuite.
  const tables = res.size_tables || [];
  const lisible = (t) => (t.measurements || []).every((m) => !/^[A-Z]$/.test(m.type_label || m.type));
  const table =
    tables.filter(lisible).find((t) => t.type === 'product_measure') ||
    tables.filter(lisible).find((t) => t.type === 'measure_yourself') ||
    tables[0];

  const CORPS = table?.type === 'measure_yourself';
  const FR = {
    Chest: CORPS ? 'Tour de poitrine' : 'Poitrine a plat',
    Waist: 'Tour de taille',
    Hips: 'Tour de hanches',
    Head: 'Tour de tete',
    'Head circumference': 'Tour de tete',
    Length: 'Longueur du vetement',
    Width: 'Largeur a plat',
    'Sleeve length': 'Longueur de manche',
  };

  const mesures = (table?.measurements || []).map((m) => ({
    nom: FR[m.type_label || m.type] || m.type_label || m.type,
    valeurs: Object.fromEntries(
      (m.values || []).map((v) => [
        v.size,
        table.unit === 'inches'
          ? v.value
            ? `${cm(v.value)}`
            : `${cm(v.min_value)} à ${cm(v.max_value)}`
          : v.value || `${v.min_value} à ${v.max_value}`,
      ]),
    ),
  }));

  for (const m of mesures) {
    if (!/^Tour de (poitrine|taille|hanches)/.test(m.nom)) continue;
    const vals = Object.values(m.valeurs).map((v) => parseFloat(String(v)));
    if (vals.some((v) => Number.isFinite(v) && v < 70)) {
      console.log(`  ATTENTION ${p.nom}: ${m.nom} sous 70 cm, requalifie en mesure a plat`);
      m.nom = m.nom.replace(/^Tour de /, '').replace(/^./, (c) => c.toUpperCase()) + ' a plat';
    }
  }

  out.push({
    id: p.id,
    nom: p.nom,
    tailles: res.available_sizes || [],
    type_table: table?.type,
    unite_source: table?.unit,
    mesures,
  });
  console.log(`${p.nom.padEnd(34)} tailles ${(res.available_sizes || []).join(' ')} | ${mesures.length} mesures`);
  await new Promise((r2) => setTimeout(r2, 600));
}

fs.writeFileSync(new URL('./tailles.json', import.meta.url), JSON.stringify(out, null, 2));

// Les tailles vendues: on coupe les extremes, Printful les propose mais elles se vendent peu
// et allongent le tableau pour rien.
const VENDUES = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'];

let html = '';
for (const p of out) {
  const cols = p.tailles.filter((t) => VENDUES.includes(t));
  if (!cols.length || !p.mesures.length) continue;
  html += `<h3>${p.nom}</h3>\n<table><thead><tr><th>Mesure en cm</th>`;
  for (const c of cols) html += `<th>${c}</th>`;
  html += `</tr></thead>\n<tbody>\n`;
  for (const m of p.mesures) {
    html += `<tr><td>${m.nom}</td>`;
    for (const c of cols) html += `<td>${m.valeurs[c] ?? '-'}</td>`;
    html += `</tr>\n`;
  }
  html += `</tbody></table>\n\n`;
}

const noteCorps = out.some((p) => p.type_table === 'measure_yourself');
const noteVetement = out.some((p) => p.type_table === 'product_measure');
html += '<p><em>';
if (noteCorps) html += 'Les tours de poitrine, de taille, de hanches et de tete sont des mesures a prendre sur toi. ';
if (noteVetement) html += 'Les longueurs et largeurs a plat sont des mesures du vetement pose a plat, a comparer avec une piece que tu portes deja. ';
html += 'Pieces fabriquees a la piece, tolerance de 2 cm. Entre deux tailles, prends la plus grande.';
html += '</em></p>';

fs.writeFileSync(new URL('./tailles.html', import.meta.url), html);
console.log(`\ntailles.json et tailles.html ecrits, ${html.length} caracteres de HTML`);
console.log('Mesures converties des pouces en centimetres, arrondi au millimetre.');
