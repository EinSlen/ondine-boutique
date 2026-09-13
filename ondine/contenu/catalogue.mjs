/**
 * Rassemble tous les visuels des trois moteurs dans une seule planche de choix, et sait
 * ranger les retenus dans un dossier par pièce, prêt pour la production.
 *
 * Les trois moteurs :
 *   serie    la silhouette et la phrase dans la même main, c'est le moteur principal
 *   phrases  la phrase seule, typographie rongée : ce que la niche achète vraiment
 *   recits   le couple et l'effondré, silhouettes pleines CC0, c'est le coeur de la marque
 *   griffes  bonshommes bâton au trait tremblé, registre RawSoult
 *   winning  le mème « are ya winning, son », refait entièrement au trait
 *
 * Usage :
 *   node catalogue.mjs                      planche unique de tout
 *   node catalogue.mjs --ranger recits:001,003,012 winning:002
 *                                           crée un dossier par pièce retenue
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ICI = path.dirname(fileURLToPath(import.meta.url));
const MOTEURS = [
  { dossier: 'serie', titre: 'Série — silhouette CC0 encrée + phrase, le moteur principal' },
  { dossier: 'phrases', titre: 'Phrases — le vêtement comme déclaration, sans aucune image' },
  { dossier: 'recits', titre: 'Récits — le couple et l’effondré, silhouettes pleines' },
  { dossier: 'winning', titre: 'Winning son — le mème, refait au trait' },
  { dossier: 'griffes', titre: 'Griffes — bonshommes bâton, trait tremblé' },
];

const ranger = process.argv.indexOf('--ranger');
if (ranger > -1) {
  const PIECES = path.join(ICI, 'pieces');
  fs.mkdirSync(PIECES, { recursive: true });
  let n = 0;
  for (const spec of process.argv.slice(ranger + 1)) {
    const [moteur, liste] = spec.split(':');
    if (!moteur || !liste) continue;
    for (const num of liste.split(',')) {
      const src = path.join(ICI, moteur);
      const fichier = fs.readdirSync(src).find((f) => f.startsWith(num.padStart(3, '0')) && f.endsWith('.png'));
      if (!fichier) {
        console.log(`  introuvable : ${moteur} ${num}`);
        continue;
      }
      const nomPiece = `${moteur}-${fichier.replace('.png', '')}`;
      const dest = path.join(PIECES, nomPiece);
      fs.mkdirSync(dest, { recursive: true });
      fs.copyFileSync(path.join(src, fichier), path.join(dest, 'visuel.png'));

      // la fiche de la pièce, pour savoir quoi en faire
      const idx = JSON.parse(fs.readFileSync(path.join(src, 'index.json'), 'utf8'));
      const meta = idx.find((x) => String(x.numero).padStart(3, '0') === num.padStart(3, '0')) || {};
      fs.writeFileSync(
        path.join(dest, 'fiche.md'),
        `# ${nomPiece}\n\n` +
          `- moteur : ${moteur}\n` +
          `- phrase : ${meta.phrase || '?'}\n` +
          `- scène : ${meta.scene || '?'}\n` +
          `- style : ${meta.style || meta.fond || '?'}\n\n` +
          `## À faire\n\n` +
          `1. Régénérer en haute résolution pour l'impression\n` +
          `2. Passer en maquette Printful : \`node outils/maquettes.mjs\`\n` +
          `3. Créer la fiche produit et y attacher la photo\n\n` +
          `Silhouettes en CC0, provenance dans \`bibliotheque/catalogue.json\`.\n`,
      );
      n++;
      console.log(`  rangé : pieces/${nomPiece}/`);
    }
  }
  console.log(`\n${n} pièce(s) rangée(s) dans contenu/pieces/`);
  process.exit(0);
}

let total = 0;
let html =
  '<!doctype html><meta charset="utf-8"><title>dead2me, tout le catalogue</title>' +
  '<style>body{background:#0c0c0c;color:#eee;font-family:system-ui,sans-serif;padding:26px}' +
  'h2{font-size:15px;color:#bbb;border-bottom:1px solid #2c2c2c;padding-bottom:8px;margin-top:36px}' +
  '.g{display:flex;flex-wrap:wrap;gap:12px}figure{margin:0;width:210px}' +
  'img{width:100%;border:1px solid #262626}figcaption{font-size:11px;color:#888;margin-top:4px}' +
  'b{color:#e8e8e8}code{background:#1a1a1a;padding:2px 6px;border-radius:3px;color:#9c9}</style>' +
  '<h1>dead2me — catalogue complet</h1>';

for (const m of MOTEURS) {
  const d = path.join(ICI, m.dossier);
  if (!fs.existsSync(d)) continue;
  const fichiers = fs.readdirSync(d).filter((f) => f.endsWith('.png')).sort();
  if (!fichiers.length) continue;
  let idx = [];
  try {
    idx = JSON.parse(fs.readFileSync(path.join(d, 'index.json'), 'utf8'));
  } catch {
    /* pas d'index */
  }
  html += `<h2>${m.titre} — ${fichiers.length}</h2><div class="g">`;
  for (const f of fichiers) {
    const num = f.slice(0, 3);
    const meta = idx.find((x) => String(x.numero).padStart(3, '0') === num) || {};
    html += `<figure><img src="${m.dossier}/${f}"><figcaption><b>${m.dossier} ${num}</b>${meta.phrase ? ` · ${meta.phrase}` : ''}${meta.scene ? ` · ${meta.scene}` : ''}</figcaption></figure>`;
    total++;
  }
  html += '</div>';
}

html +=
  '<h2>Comment retenir une pièce</h2>' +
  '<p style="color:#999;font-size:13px;line-height:1.8">Note le moteur et le numéro, par exemple ' +
  '<code>recits 003</code>. Ensuite, une commande crée un dossier par pièce avec son visuel et sa fiche :<br>' +
  '<code>node catalogue.mjs --ranger recits:003,012 winning:002</code></p>';

fs.writeFileSync(path.join(ICI, 'catalogue.html'), html);
console.log(`${total} visuels au catalogue`);
console.log(`planche unique : contenu/catalogue.html`);
