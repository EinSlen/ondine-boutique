/**
 * Passe les motifs déposés dans `contenu/briques` au format d'impression Printful :
 * 4500 x 5400 à 300 dpi, fond réellement transparent, recadré sur le dessin.
 *
 * Le travail est fait par `mcp-motifs/impression.mjs`, qui sert déjà au serveur MCP du
 * projet. Ce script n'est que la porte d'entrée en ligne de commande, pour ne pas dépendre
 * d'un client MCP quand on traite une série.
 *
 * Usage :
 *   node motifs-impression.mjs                     tous les motifs non encore traités
 *   node motifs-impression.mjs --tolerance 60      fond encore visible après détourage
 *   node motifs-impression.mjs 001-split-figures   un seul motif
 */

import { readdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { versImpression } from './mcp-motifs/impression.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const BRIQUES = path.join(HERE, '..', 'contenu', 'briques');

const arg = (n, defaut) => {
  const i = process.argv.indexOf(`--${n}`);
  return i > -1 ? Number(process.argv[i + 1]) : defaut;
};

const tolerance = arg('tolerance', 42);
const marge = arg('marge', 120);
const demandes = process.argv.slice(2).filter((a) => !a.startsWith('--') && !/^\d+$/.test(a));

const sources = readdirSync(BRIQUES)
  .filter((f) => f.endsWith('.png') && !f.endsWith('-impression.png'))
  .filter((f) => (demandes.length ? demandes.some((d) => f.startsWith(d)) : true));

if (!sources.length) {
  console.log(`Aucun motif à traiter dans ${BRIQUES}.`);
  process.exitCode = 0;
}

for (const f of sources) {
  const entree = path.join(BRIQUES, f);
  const sortie = path.join(BRIQUES, f.replace(/\.png$/, '-impression.png'));
  if (existsSync(sortie) && !demandes.length) {
    console.log(`  déjà fait : ${path.basename(sortie)}`);
    continue;
  }
  const r = await versImpression(entree, sortie, { tol: tolerance, marge });
  console.log(`  ${f} -> ${path.basename(sortie)} | ${r.taille} | fond ${r.fond} | ${r.largeurOccupee}`);
}
