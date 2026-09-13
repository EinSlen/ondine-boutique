// Releve les statistiques publiques d'un compte TikTok sans cle d'API.
// Usage: node tiktok-compte.mjs llive2diie rawsoult 242.g_
// Sortie: tiktok-compte.json
import fs from 'fs';

const PANEL = ['llive2diie', 'rawsoult', '242.g_'];
const comptes = process.argv.slice(2).length ? process.argv.slice(2) : PANEL;

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';

const out = [];
for (const c of comptes) {
  let html;
  try {
    const r = await fetch(`https://www.tiktok.com/@${c}`, {
      headers: { 'User-Agent': UA, 'Accept-Language': 'en-US,en;q=0.9' },
    });
    if (!r.ok) {
      console.log(`@${c} : HTTP ${r.status}`);
      continue;
    }
    html = await r.text();
  } catch (e) {
    console.log(`@${c} : injoignable, ${e.message}`);
    continue;
  }

  const nb = (re) => {
    const m = html.match(re);
    return m ? parseInt(m[1], 10) : null;
  };
  const abonnes = nb(/"followerCount":(\d+)/);
  const videos = nb(/"videoCount":(\d+)/);
  const likes = nb(/"heartCount":(\d+)/);
  const bio = (html.match(/"signature":"([^"]{0,200})"/) || [])[1] || '';

  if (abonnes === null) {
    console.log(`@${c} : page servie sans donnees, TikTok a bloque la lecture`);
    continue;
  }

  const fiche = {
    compte: c,
    abonnes,
    videos,
    likes,
    likes_par_video: videos ? Math.round(likes / videos) : null,
    likes_par_abonne: abonnes ? +(likes / abonnes).toFixed(1) : null,
    bio: bio.replace(/\\n/g, ' / '),
  };
  out.push(fiche);
  console.log(
    `@${c} | ${abonnes} abonnes | ${videos} videos | ${likes} likes | ` +
      `${fiche.likes_par_video}/video | ratio ${fiche.likes_par_abonne} | ${fiche.bio}`,
  );

  await new Promise((r) => setTimeout(r, 2000));
}

fs.writeFileSync(new URL('./tiktok-compte.json', import.meta.url), JSON.stringify(out, null, 2));
console.log(`\n${out.length} comptes releves, ecrit dans tiktok-compte.json`);
console.log('Le ratio likes par abonne mesure la diffusion hors audience. Au dela de 20, le contenu sort du compte.');
