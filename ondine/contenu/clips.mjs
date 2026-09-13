/**
 * Clips verticaux dead2me, dans le registre des comptes du créneau.
 *
 * Ce que font live2die, 242.g_ et RawSoult : une phrase d'accroche en texte plein écran,
 * le vêtement montré lentement, une carte de fin sur la rareté. Pas de voix, pas de visage,
 * pas de démonstration. C'est le texte qui raconte et le produit qui prouve.
 *
 * Trois décisions qui viennent de l'audit :
 *   1. AUCUN SON dans les fichiers. Le son qui fait la portée sur TikTok est le son tendance,
 *      et il doit être ajouté DANS l'application, pas collé ici : c'est ce qui rattache la
 *      vidéo au son et lui ouvre la page Pour toi. Ça évite aussi tout souci de droits.
 *   2. Jamais « peint à la main » ni aucune allusion à une fabrication artisanale. Nos pièces
 *      sont imprimées. Les accroches parlent du TIRAGE, pas du geste.
 *   3. Les accroches marquées `promesse` engagent quelque chose (ne pas réimprimer, supprimer
 *      le fichier). À n'utiliser que si on tient réellement la promesse.
 *
 * Sortie : contenu/clips/NNN-<accroche>.mp4, 1080x1920, muet, environ 8 secondes.
 *
 * Usage :
 *   node clips.mjs --nb 12
 *   node clips.mjs --nb 4 --duree 6
 */

import fs from 'node:fs';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import { ajusterEnPage, alea, coulures, filtres, FONTES, largeur, lignes, mot, PALETTES, PHRASES, prechauffer, rature } from './encre.mjs';
import { navigateur } from './navigateur.mjs';

const run = promisify(execFile);
const ICI = path.dirname(fileURLToPath(import.meta.url));
const SORTIE = path.join(ICI, 'clips');
const TMP = path.join(ICI, '.clips-tmp');

const FFMPEG =
  process.env.FFMPEG ||
  'C:/Users/Valentin/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-8.1-full_build/bin/ffmpeg.exe';

const arg = (n, d) => {
  const i = process.argv.indexOf(`--${n}`);
  return i > -1 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const NB = parseInt(arg('nb', '12'), 10);
const W = 1080;
const H = 1920;
const FPS = 30;

/**
 * Les accroches. `promesse` signale celles qui engagent : ne les utiliser que si la promesse
 * est tenue, sinon c'est de la publicité trompeuse au sens de l'article L121-2.
 */
const ACCROCHES = [
  { t: '1 of 1', promesse: false },
  { t: 'no restock', promesse: true },
  { t: 'one printed', promesse: true },
  { t: 'not printing it again', promesse: true },
  { t: 'someone will get this', promesse: false },
  { t: 'if you know, you know', promesse: false },
  { t: 'i almost kept it', promesse: false },
  { t: 'posted before i changed my mind', promesse: false },
  { t: 'for whoever needs it', promesse: false },
  { t: 'she will see it eventually', promesse: false },
  { t: 'this one is already gone', promesse: false },
  { t: 'made it at 3am', promesse: false },
];

const FINS = ['one of one', 'gone when it is gone', 'link in bio', 'no restock', 'dead2me'];

/** Une carte de texte plein écran, transparente, dans la typographie de la marque. */
const carte = (r, p, texte, style) => {
  const ls = lignes(texte, style === 'accroche' ? 3 : 2);
  const corps = [];
  if (style === 'accroche') {
    const taille = Math.min(W * 0.19, (W * 1.55) / Math.max(...ls.map((l) => l.length)));
    const y0 = H * 0.44 - ((ls.length - 1) * taille * 0.98) / 2;
    ls.forEach((l, i) => {
      corps.push(
        mot(W * 0.5, y0 + i * taille * 0.98, l.toUpperCase(), taille, FONTES.condense, p.encre, {
          esp: taille * 0.03,
          poids: 700,
          tient: W * 0.86,
          groupe: 'a',
        }),
      );
    });
    const bas = y0 + (ls.length - 1) * taille * 0.98;
    corps.push(coulures(r, W * 0.5, bas, largeur(ls[ls.length - 1], taille, FONTES.condense) * 0.85, 3, W * 0.014, p.accent));
  } else if (style === 'phrase') {
    const taille = Math.min(W * 0.14, (W * 1.2) / Math.max(...ls.map((l) => l.length)));
    const y0 = H * 0.87;
    ls.forEach((l, i) => {
      const y = y0 + i * taille * 0.98;
      corps.push(
        mot(W * 0.5, y, l.toUpperCase(), taille, FONTES.condense, p.encre, {
          esp: taille * 0.03,
          poids: 700,
          tient: W * 0.82,
          groupe: 'p',
        }),
      );
      if (i === ls.length - 1) {
        const lg = largeur(l, taille, FONTES.condense);
        corps.push(rature(r, W * 0.5 - lg * 0.6, W * 0.5 + lg * 0.6, y - taille * 0.35, W * 0.014, p.accent));
      }
    });
  } else {
    const taille = W * 0.11;
    corps.push(
      mot(W * 0.5, H * 0.5, texte, taille, FONTES.main, p.encre, { doux: true, rot: (r() - 0.5) * 4, tient: W * 0.8 }),
    );
  }
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">` +
    filtres(r, W, W / 900) +
    `<g id="contenu">${corps.join('')}</g></svg>`
  );
};

const encoder = async (entrees, filtre, duree, sortie) => {
  const args = ['-y', '-hide_banner', '-loglevel', 'error'];
  for (const e of entrees) args.push('-loop', '1', '-t', String(duree), '-i', e);
  args.push(
    '-f', 'lavfi', '-t', String(duree), '-i', `color=c=black:s=${W}x${H}:r=${FPS}`,
    '-filter_complex', filtre,
    '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20',
    '-pix_fmt', 'yuv420p', '-r', String(FPS), '-t', String(duree),
    sortie,
  );
  await run(FFMPEG, args, { maxBuffer: 1 << 26 });
};

const main = async () => {
  fs.mkdirSync(SORTIE, { recursive: true });
  fs.mkdirSync(TMP, { recursive: true });
  for (const f of fs.readdirSync(SORTIE)) if (f.endsWith('.mp4') || f === 'index.json') fs.unlinkSync(path.join(SORTIE, f));

  // les photos produit réelles : c'est ce qui prouve que la pièce existe
  const dossiers = ['photos-aop-sweat', 'photos-tee', 'photos-sweat', 'photos-bandana', 'photos-bonnet', 'photos-tote', 'photos-chaussettes'];
  const photos = [];
  for (const d of dossiers) {
    const dir = path.join(ICI, d);
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir)) if (f.endsWith('.png')) photos.push({ produit: d.replace('photos-', ''), chemin: path.join(dir, f) });
  }
  if (!photos.length) throw new Error('aucune photo produit, lancer photos-tout.mjs d’abord');
  console.log(`${photos.length} photos produit disponibles`);

  const { default: puppeteer } = await import('puppeteer-core');
  const nav = await puppeteer.launch({
    executablePath: navigateur(),
    headless: true,
    args: ['--no-sandbox', '--font-render-hinting=none'],
  });
  const page = await nav.newPage();
  await page.setViewport({ width: W, height: H, deviceScaleFactor: 1 });
  await prechauffer(page);

  const rendre = async (svg, fichier) => {
    await page.setContent(svg, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(ajusterEnPage);
    await page.screenshot({ path: fichier, omitBackground: true });
  };

  const index = [];
  for (let i = 0; i < NB; i++) {
    const n = i + 1;
    const r = alea(n * 15485863 + 7);
    const p = PALETTES[r() > 0.35 ? 0 : 2];
    const acc = ACCROCHES[i % ACCROCHES.length];
    const ph = PHRASES[Math.floor(r() * PHRASES.length)];
    const photo = photos[Math.floor(r() * photos.length)];
    const fin = FINS[Math.floor(r() * FINS.length)];

    const fAcc = path.join(TMP, `a${n}.png`);
    const fPhr = path.join(TMP, `p${n}.png`);
    const fFin = path.join(TMP, `f${n}.png`);
    await rendre(carte(r, p, acc.t, 'accroche'), fAcc);
    await rendre(carte(r, p, ph.t, 'phrase'), fPhr);
    await rendre(carte(r, p, fin, 'fin'), fFin);

    const dA = 1.6;
    const dB = parseFloat(arg('duree', '4.4'));
    const dC = 1.6;
    const s1 = path.join(TMP, `s1-${n}.mp4`);
    const s2 = path.join(TMP, `s2-${n}.mp4`);
    const s3 = path.join(TMP, `s3-${n}.mp4`);

    // l'accroche : texte seul sur le fond de la marque, léger rapprochement
    await encoder(
      [fAcc.replace(/\\/g, '/')],
      `[1]drawbox=c=${p.fond.replace('#', '0x')}:t=fill[bg];[0]zoompan=z='min(zoom+0.0009,1.08)':d=1:s=${W}x${H}:fps=${FPS}[tx];` +
        `[bg][tx]overlay=0:0,fade=t=in:st=0:d=0.25,fade=t=out:st=${(dA - 0.2).toFixed(2)}:d=0.2,format=yuv420p`,
      dA,
      s1,
    );

    // le produit : rapprochement lent, la phrase apparaît en bas
    await encoder(
      [photo.chemin.replace(/\\/g, '/'), fPhr.replace(/\\/g, '/')],
      `[2]drawbox=c=${p.fond.replace('#', '0x')}:t=fill[bg];` +
        // le produit doit remplir le cadre : mis a la largeur seule, il laissait deux
        // grosses bandes noires et l objet paraissait minuscule sur un telephone
        `[0]scale=-1:1440,crop=${W}:1440:(iw-${W})/2:0,pad=${W}:${H}:0:120:color=${p.fond.replace('#', '0x')}@0,` +
        `zoompan=z='min(zoom+0.0011,1.14)':d=1:s=${W}x${H}:fps=${FPS}[prod];` +
        `[bg][prod]overlay=0:0[base];[1]format=rgba,fade=t=in:st=1.0:d=0.5:alpha=1[tx];` +
        `[base][tx]overlay=0:0,fade=t=in:st=0:d=0.2,fade=t=out:st=${(dB - 0.25).toFixed(2)}:d=0.25,format=yuv420p`,
      dB,
      s2,
    );

    // la carte de fin, écrite à la main
    await encoder(
      [fFin.replace(/\\/g, '/')],
      `[1]drawbox=c=${p.fond.replace('#', '0x')}:t=fill[bg];[bg][0]overlay=0:0,` +
        `fade=t=in:st=0:d=0.3,fade=t=out:st=${(dC - 0.3).toFixed(2)}:d=0.3,format=yuv420p`,
      dC,
      s3,
    );

    const liste = path.join(TMP, `l${n}.txt`);
    fs.writeFileSync(liste, [s1, s2, s3].map((f) => `file '${f.replace(/\\/g, '/')}'`).join('\n'));
    const nom = `${String(n).padStart(3, '0')}-${acc.t.replace(/[^a-z0-9]+/gi, '-').slice(0, 26)}.mp4`;
    await run(FFMPEG, ['-y', '-hide_banner', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', liste, '-c', 'copy', path.join(SORTIE, nom)], {
      maxBuffer: 1 << 26,
    });

    const taille = fs.statSync(path.join(SORTIE, nom)).size;
    console.log(`  ${nom.padEnd(40)} ${Math.round(taille / 1024)} ko  ${photo.produit}`);
    index.push({
      numero: n,
      accroche: acc.t,
      promesse: acc.promesse,
      phrase: ph.t,
      pub: ph.pub,
      produit: photo.produit,
      photo: path.basename(photo.chemin),
      fin,
      fichier: nom,
      duree: +(dA + dB + dC).toFixed(1),
    });
  }

  fs.writeFileSync(path.join(SORTIE, 'index.json'), JSON.stringify(index, null, 2));
  await nav.close();
  fs.rmSync(TMP, { recursive: true, force: true });
  console.log(`\n${index.length} clips dans ${SORTIE}`);
  console.log(`${index.filter((x) => x.promesse).length} portent une promesse à tenir (ne pas réimprimer)`);
  console.log(`Le son se rajoute DANS TikTok : c'est le son tendance qui donne la portée.`);
};

main().catch((e) => {
  console.error(`ECHEC : ${e.message}`);
  process.exit(1);
});
