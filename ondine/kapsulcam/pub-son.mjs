// Adds sound to the silent ad films: French voice-over (edge-tts Remy) + Pixabay music for the dive film,
// music only for the others. Output next to the source in E:\kapsulcam-media\out as *-son.mp4.
// node pub-son.mjs [plongee|mer|moto|all]
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const OUT = 'E:/kapsulcam-media/out';
const MUS = 'E:/kapsulcam-media/musique';
const TMP = path.join(OUT, '_son');
fs.mkdirSync(TMP, { recursive: true });

const VOIX_PLONGEE = [
  [0.3, "Quand tu vas raconter ça à tes potes... personne va te croire."],
  [4.2, "Un cachalot juste au-dessus de ta tête. Une tortue à vingt centimètres de ton masque. Un banc de sardines qui t'avale tout entier."],
  [14.2, "Sauf si t'as tout filmé."],
  [16.3, "Ça, c'est KapsulCam. 4K, 36 grammes, pas plus grosse que ton pouce."],
  [21.9, "Et dans son caisson, elle est étanche jusqu'à 30 mètres."],
  [25.3, "Un appui sur le bouton, et tu profites de ta plongée. Grand angle, jusqu'à 90 minutes d'enregistrement, et en remontant sur le bateau, tu récupères tout sur ton téléphone."],
  [37.4, "T'as plus qu'à choisir ta prochaine destination."],
  [41.4, "Tu plonges. Elle filme. Moins quinze pour cent avec le code Kapsul quinze."],
];

const FILMS = {
  plongee: { src: 'kapsulcam-film-plongee-9x16.mp4', music: 'journey-ocean.mp3', musicStart: 0, voix: VOIX_PLONGEE },
  mer: { src: 'kapsulcam-film-mer-9x16.mp4', music: 'upbeat.mp3', musicStart: 2 },
  moto: { src: 'kapsulcam-film-moto-9x16.mp4', music: 'sport-trap.mp3', musicStart: 0 },
};

const run = (cmd, args) => execFileSync(cmd, args, { stdio: ['ignore', 'pipe', 'pipe'] }).toString();
const duree = (f) => Number(run('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]));

const voixPiste = (nom, lignes, total) => {
  const parts = lignes.map(([t, txt], i) => {
    const mp3 = path.join(TMP, `${nom}-${i}.mp3`);
    if (!fs.existsSync(mp3) || !fs.existsSync(`${mp3}.txt`) || fs.readFileSync(`${mp3}.txt`, 'utf8') !== txt) {
      run('python', [path.join(import.meta.dirname, 'tts.py'), mp3, txt]);
      fs.writeFileSync(`${mp3}.txt`, txt);
    }
    const d = duree(mp3);
    const fin = i + 1 < lignes.length ? lignes[i + 1][0] : total;
    console.log(`  ligne ${i} : ${d.toFixed(1)} s pour ${(fin - t).toFixed(1)} s ${d > fin - t ? 'TROP LONGUE' : 'ok'}`);
    return { mp3, t };
  });
  const wav = path.join(TMP, `${nom}-voix.wav`);
  const inputs = parts.flatMap((p) => ['-i', p.mp3]);
  const chains = parts.map((p, i) => `[${i}:a]aresample=48000,adelay=${Math.round(p.t * 1000)}:all=1[v${i}]`).join(';');
  const mix = parts.map((_, i) => `[v${i}]`).join('') + `amix=inputs=${parts.length}:normalize=0,apad,atrim=0:${total},loudnorm=I=-16:TP=-1.5[out]`;
  run('ffmpeg', ['-y', ...inputs, '-filter_complex', `${chains};${mix}`, '-map', '[out]', '-ar', '48000', '-ac', '2', wav]);
  return wav;
};

const faire = (nom) => {
  const f = FILMS[nom];
  const src = path.join(OUT, f.src);
  const total = duree(src);
  const out = path.join(OUT, f.src.replace('.mp4', '-son.mp4'));
  console.log(nom, total.toFixed(1), 's');
  const musique = `[1:a]atrim=${f.musicStart}:${f.musicStart + total},asetpts=PTS-STARTPTS,aresample=48000,afade=t=in:d=0.4,afade=t=out:st=${(total - 2).toFixed(2)}:d=2`;
  let filtre;
  const inputs = ['-i', src, '-i', path.join(MUS, f.music)];
  if (f.voix) {
    inputs.push('-i', voixPiste(nom, f.voix, total));
    filtre = `${musique},loudnorm=I=-27:TP=-3[m];[2:a]asplit[v][sc];[m][sc]sidechaincompress=threshold=0.03:ratio=6:attack=20:release=400[md];[md][v]amix=inputs=2:normalize=0,alimiter=limit=0.89[a]`;
  } else {
    filtre = `${musique},loudnorm=I=-14:TP=-1.5[a]`;
  }
  run('ffmpeg', ['-y', ...inputs, '-filter_complex', filtre, '-map', '0:v', '-map', '[a]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', out]);
  console.log('  ->', out);
};

const quoi = process.argv[2] || 'all';
for (const nom of quoi === 'all' ? Object.keys(FILMS) : [quoi]) faire(nom);
