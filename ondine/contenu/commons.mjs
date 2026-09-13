/**
 * Cherche des images sur Wikimedia Commons et NE GARDE QUE celles réellement libres pour du
 * vêtement vendu : domaine public, CC0, PD-self, PD-old.
 *
 * POURQUOI COMMONS ET PAS UNE RECHERCHE GOOGLE : une image trouvée au hasard appartient à
 * quelqu'un, et la mettre sur un vêtement mis en vente est une contrefaçon. Commons expose la
 * licence de chaque fichier par API, donc on peut filtrer automatiquement et garder la preuve.
 *
 * POURQUOI PAS PIXABAY, UNSPLASH, FREEPIK : leurs licences interdisent ou restreignent
 * justement le merchandising, c'est-à-dire précisément notre usage. Publicdomainvectors et
 * SVG Repo, eux, bloquent l'accès automatisé (403 et 429).
 *
 * Usage :
 *   node commons.mjs                       toutes les requêtes du thème
 *   node commons.mjs --q "silhouette sitting" --n 12
 *   node commons.mjs --planche             refait seulement la planche
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ICI = path.dirname(fileURLToPath(import.meta.url));
const SORTIE = path.join(ICI, 'commons');
const UA = 'dead2me-asset-research/1.0 (contact: valentin)';

const arg = (n, d) => {
  const i = process.argv.indexOf(`--${n}`);
  return i > -1 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--')
    ? process.argv[i + 1]
    : d;
};

/** Seules ces licences autorisent sans condition un vêtement mis en vente. */
const LIBRES = /^(CC0|Public domain|PD|CC-PD|No restrictions)/i;

const REQUETES = [
  'silhouette sitting man chair',
  'silhouette person head in hands',
  'silhouette woman running',
  'silhouette man walking away',
  'silhouette person lying ground',
  'silhouette couple standing',
  'silhouette person crouching',
  'silhouette person standing alone',
  'silhouette crying',
  'silhouette smoking',
  'blood splatter',
  'ink blot stain',
  'paint splash',
  'grave cross silhouette',
  'broken heart silhouette',
  'silhouette phone hand',
  'silhouette chair empty',
  'silhouette bed',
];

const dodo = (ms) => new Promise((r) => setTimeout(r, ms));

const chercher = async (requete, limite) => {
  const url =
    'https://commons.wikimedia.org/w/api.php?action=query&format=json&generator=search' +
    `&gsrsearch=${encodeURIComponent(requete)}&gsrnamespace=6&gsrlimit=${limite}` +
    '&prop=imageinfo&iiprop=url%7Csize%7Cextmetadata&iiurlwidth=700';
  // Commons limite le debit et renvoie 429 avec un corps en texte brut, pas en JSON:
  // sans ce traitement on obtenait des listes vides sans comprendre pourquoi.
  let j = null;
  for (let essai = 0; essai < 5; essai++) {
    const r = await fetch(url, { headers: { 'User-Agent': UA } });
    if (r.status === 429) {
      console.log(`     debit limite, attente 20 s`);
      await dodo(20000);
      continue;
    }
    if (!r.ok) return [];
    try {
      j = await r.json();
      break;
    } catch {
      await dodo(5000);
    }
  }
  if (!j) return [];
  const pages = (j.query && j.query.pages) || {};
  const out = [];
  for (const k of Object.keys(pages)) {
    const x = pages[k];
    const ii = (x.imageinfo || [])[0];
    if (!ii) continue;
    const meta = ii.extmetadata || {};
    const licence = (meta.LicenseShortName && meta.LicenseShortName.value) || '';
    const auteur = ((meta.Artist && meta.Artist.value) || '').replace(/<[^>]+>/g, '').slice(0, 60);
    if (!LIBRES.test(licence)) continue;
    out.push({
      titre: x.title.replace(/^File:/, ''),
      licence,
      auteur,
      url: ii.url,
      apercu: ii.thumburl || ii.url,
      page: `https://commons.wikimedia.org/wiki/${encodeURIComponent(x.title)}`,
      taille: ii.size,
      requete,
    });
  }
  return out;
};

const planche = () => {
  const cat = JSON.parse(fs.readFileSync(path.join(SORTIE, 'catalogue.json'), 'utf8'));
  let html =
    '<!doctype html><meta charset="utf-8"><title>images libres, Commons</title>' +
    '<style>body{background:#111;color:#eee;font-family:system-ui,sans-serif;padding:24px}' +
    'h2{font-size:13px;color:#aaa;border-bottom:1px solid #333;padding-bottom:6px;margin-top:26px}' +
    '.g{display:flex;flex-wrap:wrap;gap:10px}figure{margin:0;width:170px}' +
    'img{width:100%;height:170px;object-fit:contain;background:#1c1c1c;border:1px solid #2b2b2b}' +
    'figcaption{font-size:10px;color:#888;margin-top:4px}i{color:#5b8}</style>' +
    `<h1>${cat.length} images libres pour vêtement vendu</h1>` +
    '<p style="color:#888;font-size:13px">Filtrées sur licence : uniquement domaine public et CC0. ' +
    'Note les fichiers utilisables.</p>';
  const parReq = {};
  for (const c of cat) (parReq[c.requete] ||= []).push(c);
  for (const [req, l] of Object.entries(parReq)) {
    html += `<h2>${req} — ${l.length}</h2><div class="g">`;
    for (const c of l) {
      html += `<figure><img src="fichiers/${c.fichier}"><figcaption>${c.titre.slice(0, 40)}<br><i>${c.licence}</i></figcaption></figure>`;
    }
    html += '</div>';
  }
  fs.writeFileSync(path.join(ICI, 'commons.html'), html);
  console.log(`planche : contenu/commons.html`);
};

if (process.argv.includes('--planche')) {
  planche();
  process.exit(0);
}

fs.mkdirSync(path.join(SORTIE, 'fichiers'), { recursive: true });
const catFichier = path.join(SORTIE, 'catalogue.json');
const catalogue = fs.existsSync(catFichier) ? JSON.parse(fs.readFileSync(catFichier, 'utf8')) : [];
const deja = new Set(catalogue.map((c) => c.titre));

const requetes = arg('q', null) ? [arg('q')] : REQUETES;
const limite = parseInt(arg('n', '14'), 10);

for (const requete of requetes) {
  const res = await chercher(requete, limite);
  let n = 0;
  for (const item of res) {
    if (deja.has(item.titre)) continue;
    try {
      const r = await fetch(item.apercu, { headers: { 'User-Agent': UA } });
      if (!r.ok) { console.log(`     HTTP ${r.status} sur ${item.titre.slice(0,36)}`); continue; }
      const bin = Buffer.from(await r.arrayBuffer());
      const ext = item.apercu.match(/\.(png|jpe?g|svg)/i) ? item.apercu.match(/\.(png|jpe?g|svg)/i)[1] : 'png';
      const fichier = item.titre.replace(/[^a-z0-9]+/gi, '-').slice(0, 48).toLowerCase() + '.' + ext;
      fs.writeFileSync(path.join(SORTIE, 'fichiers', fichier), bin);
      catalogue.push({ ...item, fichier });
      deja.add(item.titre);
      n++;
      await dodo(1500);
    } catch (e) {
      console.log(`     echec sur ${item.titre.slice(0, 40)} : ${e.message}`);
    }
  }
  console.log(`${requete.padEnd(38)} ${res.length} libres, ${n} téléchargées`);
  fs.writeFileSync(catFichier, JSON.stringify(catalogue, null, 2));
  await dodo(3000);
}

console.log(`\n${catalogue.length} images libres dans ${SORTIE}`);
planche();
