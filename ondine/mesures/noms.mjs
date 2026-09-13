// Verifie la disponibilite reelle d'un nom de marque: domaines par RDAP (registre officiel,
// pas un revendeur) et pseudo TikTok. Aucune cle d'API.
// Usage: node noms.mjs            rejoue la liste du 21/08/2026
//        node noms.mjs monnom     teste un seul nom
// Sortie: noms.json
import fs from 'fs';

const CANDIDATS = [
  { nom: 'monotype', sens: 'estampe tiree a un seul exemplaire, le modele economique dans un mot' },
  { nom: 'epreuve', sens: 'epreuve d artiste, le tirage unique hors serie' },
  { nom: 'sanguine', sens: 'dessin a la craie rouge, evoque le sang sans le nommer, terme d art' },
  { nom: 'pochoir', sens: 'stencil, ADN street, francais, sans violence' },
  { nom: 'estampe', sens: 'gravure imprimee, vocabulaire du tirage' },
  { nom: 'horsserie', sens: 'hors serie, la rarete dite en un mot' },
  { nom: 'horscommerce', sens: 'mention portee sur les tirages non destines a la vente' },
  { nom: 'exemplaire', sens: 'un exemplaire, la numerotation comme nom' },
  { nom: 'lexemplaire', sens: 'variante avec article, plus tenable en domaine' },
  { nom: 'sanssuite', sens: 'sans suite, piece qui n aura pas de seconde, et rupture' },
  { nom: 'troptard', sens: 'phrase de rupture, colle au format POV' },
  { nom: 'plusrien', sens: 'phrase de rupture, tres court' },
  { nom: 'rienapres', sens: 'rien apres, narration de fin' },
  { nom: 'dernierappel', sens: 'traduction directe de our last call' },
  { nom: 'jamaisplus', sens: 'phrase de rupture connue' },
  { nom: 'encoretoi', sens: 'narration amoureuse, doux et lisible' },
  { nom: 'apresnous', sens: 'apres nous, collectif, moins niche que apres toi' },
  { nom: 'sansnous', sens: 'sans nous, meme registre' },
  { nom: 'unicum', sens: 'latin, objet unique, international' },
  { nom: 'singulier', sens: 'singulier, unique et elegant' },
  { nom: 'lavis', sens: 'technique de peinture a l eau diluee, court' },
  { nom: 'fusain', sens: 'charbon a dessin, matiere et noirceur' },
  { nom: 'calque', sens: 'papier calque, reproduction et trace' },
  { nom: 'sillage', sens: 'ce qui reste apres le passage, tres narratif' },
  { nom: 'vestige', sens: 'ce qui subsiste, registre de la trace' },
  { nom: 'residu', sens: 'ce qui reste au fond, brut' },
  { nom: 'atelier21', sens: 'atelier plus numero, credibilise la fabrication' },
  { nom: 'piecelibre', sens: 'piece libre, jeu sur piece unique' },
  { nom: 'tirageun', sens: 'tirage 1, la numerotation comme identite' },
  { nom: 'unsurun', sens: 'un sur un, traduction de 1 of 1' },
];

const fichier = new URL('./noms-candidats.json', import.meta.url);
const depuisFichier = fs.existsSync(fichier) ? JSON.parse(fs.readFileSync(fichier, 'utf8')) : [];
const noms = process.argv.slice(2).length
  ? process.argv.slice(2).map((n) => ({ nom: n, sens: 'teste a la demande' }))
  : [...CANDIDATS, ...depuisFichier];

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';

const RDAP = {
  com: (d) => `https://rdap.verisign.com/com/v1/domain/${d}`,
  net: (d) => `https://rdap.verisign.com/net/v1/domain/${d}`,
  fr: (d) => `https://rdap.nic.fr/domain/${d}`,
};

const domaine = async (nom, tld) => {
  const url = RDAP[tld](`${nom}.${tld}`);
  try {
    const r = await fetch(url, { headers: { Accept: 'application/rdap+json', 'User-Agent': UA } });
    if (r.status === 404) return 'libre';
    if (r.status === 200) return 'pris';
    if (r.status === 429) return 'quota';
    return `http ${r.status}`;
  } catch (e) {
    return 'erreur';
  }
};

const tiktok = async (nom) => {
  try {
    const r = await fetch(`https://www.tiktok.com/@${nom}`, {
      headers: { 'User-Agent': UA, 'Accept-Language': 'en-US,en;q=0.9' },
    });
    if (r.status === 404) return 'libre';
    const html = await r.text();
    if (/"userInfo"/.test(html) && /"followerCount":\d+/.test(html)) return 'pris';
    if (/Couldn.t find this account|couldn't find this account/i.test(html)) return 'libre';
    return 'indetermine';
  } catch {
    return 'erreur';
  }
};

const instagram = async (nom) => {
  try {
    const r = await fetch(`https://www.instagram.com/${nom}/`, {
      headers: { 'User-Agent': UA, 'Accept-Language': 'en-US,en;q=0.9' },
      redirect: 'manual',
    });
    if (r.status === 404) return 'libre';
    if (r.status === 200) {
      const html = await r.text();
      if (/"user":\s*null|Sorry, this page isn/i.test(html)) return 'libre';
      if (new RegExp(`"username":"${nom}"`, 'i').test(html)) return 'pris';
      return 'indetermine';
    }
    return 'indetermine';
  } catch {
    return 'erreur';
  }
};

const dejaFait = (() => {
  try {
    return JSON.parse(fs.readFileSync(new URL('./noms.json', import.meta.url), 'utf8'));
  } catch {
    return [];
  }
})();

const out = [];
for (const c of noms) {
  const cache = dejaFait.find((d) => d.nom === c.nom && d.insta);
  if (cache) {
    out.push(cache);
    console.log(`${c.nom.padEnd(14)} deja mesure, ignore`);
    continue;
  }
  const com = await domaine(c.nom, 'com');
  const fr = await domaine(c.nom, 'fr');
  const tt = await tiktok(c.nom);
  const insta = await instagram(c.nom);
  const score =
    (com === 'libre' ? 2 : 0) +
    (fr === 'libre' ? 1 : 0) +
    (tt === 'libre' ? 2 : 0) +
    (insta === 'libre' ? 2 : 0);
  out.push({ ...c, com, fr, tiktok: tt, insta, score });
  console.log(
    `${c.nom.padEnd(14)} .com ${com.padEnd(6)} .fr ${fr.padEnd(6)} tiktok ${tt.padEnd(12)} insta ${String(insta).padEnd(12)} score ${score}`,
  );
  await new Promise((r) => setTimeout(r, 900));
}

out.sort((a, b) => b.score - a.score);
fs.writeFileSync(new URL('./noms.json', import.meta.url), JSON.stringify(out, null, 2));

console.log('\n=== retenus, .com et pseudo TikTok libres ===');
for (const n of out.filter((x) => x.com === 'libre' && x.tiktok === 'libre')) {
  console.log(`  ${n.nom.padEnd(14)} .fr ${n.fr.padEnd(6)} insta ${String(n.insta || '?').padEnd(12)} | ${n.sens}`);
}
console.log('\nUn domaine libre ne dit rien sur la marque deposee. Verifier INPI et EUIPO avant depot.');
