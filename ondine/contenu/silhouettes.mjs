/**
 * Récupère de vraies silhouettes vectorielles depuis Openclipart, en CC0.
 *
 * POURQUOI CE SCRIPT EXISTE : j'ai d'abord dessiné les silhouettes par code, en courbes puis
 * par squelette. Les deux donnaient des bonshommes de pictogramme. Un corps crédible demande
 * des plis de vêtement, des chaussures, un déhanché, ce qui ne se génère pas à l'aveugle.
 *
 * POURQUOI OPENCLIPART ET PAS GOOGLE IMAGES : tout Openclipart est en CC0, domaine public,
 * donc utilisable sur un vêtement revendu, sans attribution. Une image trouvée sur Google
 * appartient à quelqu'un, et une photo de personne connue ajoute le droit à l'image par-dessus
 * le droit d'auteur. Sur du print-on-demand, ça se termine en retrait de boutique.
 *
 * Usage :
 *   node silhouettes.mjs --recherche "silhouette woman walking"
 *   node silhouettes.mjs --ids 220954,320824,263156
 *   node silhouettes.mjs                 récupère la sélection retenue
 *
 * Sorties dans contenu/silhouettes/ : les SVG plus un catalogue.json qui garde la source,
 * l'identifiant et la licence de chaque pièce. Ce catalogue est la preuve des droits, il ne
 * se supprime pas.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ICI = path.dirname(fileURLToPath(import.meta.url));
const SORTIE = path.join(ICI, 'silhouettes');
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126 Safari/537.36';

const arg = (n, d) => {
  const i = process.argv.indexOf(`--${n}`);
  return i > -1 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--')
    ? process.argv[i + 1]
    : d;
};

// Sélection retenue après examen visuel. Le rôle dit à quoi la pièce sert dans une scène.
const RETENUES = [
  { id: '220954', role: 'part', note: 'femme de dos qui marche, talons, port droit' },
  { id: '320824', role: 'effondre', note: 'homme assis, tête dans les mains, dos courbé' },
  { id: '263156', role: 'court', note: 'femme qui court de profil, foulée ample' },
];

const chercher = async (requete) => {
  const r = await fetch(`https://openclipart.org/search/?query=${encodeURIComponent(requete)}`, {
    headers: { 'User-Agent': UA },
  });
  const html = await r.text();
  const vus = new Set();
  const out = [];
  for (const m of html.matchAll(/detail\/(\d+)\/([a-z0-9-]+)/g)) {
    if (vus.has(m[1])) continue;
    vus.add(m[1]);
    out.push({ id: m[1], nom: m[2] });
  }
  return out;
};

const telecharger = async (id) => {
  // il faut suivre la redirection, /download/<id>/ renvoie un 301
  const r = await fetch(`https://openclipart.org/download/${id}/`, {
    headers: { 'User-Agent': UA },
    redirect: 'follow',
  });
  if (!r.ok) throw new Error(`HTTP ${r.status} sur ${id}`);
  const svg = await r.text();
  if (!svg.includes('<svg')) throw new Error(`${id} : ce n'est pas un SVG`);
  return svg;
};

/** Ne garde que la géométrie et force le noir : un pochoir n'a qu'une couleur. */
const enPochoir = (svg) => {
  return svg
    .replace(/fill="(?!none)[^"]*"/g, 'fill="currentColor"')
    .replace(/fill:\s*(?!none)[^;"}]+/g, 'fill:currentColor')
    .replace(/stroke="(?!none)[^"]*"/g, 'stroke="none"');
};

const recherche = arg('recherche', null);
if (recherche) {
  const res = await chercher(recherche);
  console.log(`${res.length} résultats pour « ${recherche} »`);
  for (const r of res.slice(0, 15)) console.log(`  ${r.id.padStart(7)}  ${r.nom}`);
  console.log(`\nPour en récupérer : node silhouettes.mjs --ids ${res.slice(0, 3).map((r) => r.id).join(',')}`);
  process.exit(0);
}

fs.mkdirSync(SORTIE, { recursive: true });
const idsArg = arg('ids', null);
const liste = idsArg
  ? idsArg.split(',').map((id) => ({ id: id.trim(), role: 'a-classer', note: '' }))
  : RETENUES;

const catalogueFichier = path.join(SORTIE, 'catalogue.json');
const catalogue = fs.existsSync(catalogueFichier)
  ? JSON.parse(fs.readFileSync(catalogueFichier, 'utf8'))
  : [];

for (const item of liste) {
  const svg = enPochoir(await telecharger(item.id));
  const nom = `${item.role}-${item.id}.svg`;
  fs.writeFileSync(path.join(SORTIE, nom), svg);
  const chemins = (svg.match(/<path/g) || []).length;
  console.log(`  ${nom.padEnd(26)} ${Math.round(svg.length / 1024)} ko, ${chemins} chemin(s)`);

  const deja = catalogue.findIndex((c) => c.id === item.id);
  const fiche = {
    id: item.id,
    fichier: nom,
    role: item.role,
    note: item.note,
    source: `https://openclipart.org/detail/${item.id}`,
    licence: 'CC0 1.0, domaine public, usage commercial et merchandising autorisés',
    recupere_le: '2026-08-21',
  };
  if (deja > -1) catalogue[deja] = fiche;
  else catalogue.push(fiche);
  await new Promise((r) => setTimeout(r, 800));
}

fs.writeFileSync(catalogueFichier, JSON.stringify(catalogue, null, 2));
console.log(`\n${catalogue.length} silhouettes dans ${SORTIE}`);
console.log(`catalogue.json garde la source et la licence de chacune : c'est la preuve des droits.`);
