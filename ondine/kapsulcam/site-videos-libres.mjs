// Rebuilds the site videos from Mixkit clips whose page shows the Free License (videos/mixkit/licences.json):
// home hero loop (16:9 + 9:16) and its poster, and the four activity tiles. The previous files used clips
// under the Mixkit Restricted License (personal use only) and are kept in videos/_licence-restreinte/.
// node site-videos-libres.mjs [--envoyer]   (--envoyer uploads them to the theme under the same asset keys)
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { rest, ICI_DIR } from './shop.mjs';

const THEME = 190830182728;
const V = path.join(ICI_DIR, 'videos');
const MK = (id) => path.join(V, 'mixkit', `${id}.mp4`);
const lic = JSON.parse(fs.readFileSync(path.join(V, 'mixkit', 'licences.json'), 'utf8'));
const ff = (args) => execFileSync('ffmpeg', ['-loglevel', 'error', '-y', ...args]);
const ENC = ['-an', '-c:v', 'libx264', '-preset', 'slow', '-crf', '26', '-pix_fmt', 'yuv420p', '-movflags', '+faststart'];

// [mixkit id, start second, horizontal crop centre]
const HERO = [[1128, 2.0, 0.6], [1582, 4.0, 0.5], [4291, 0.0, 0.5], [1127, 6.0, 0.62]];
const SEG = 3.6;
const FADE = 0.6;
const TILES = { mer: [1582, 8.0, 0.5], moto: [39930, 2.0, 0.5], velo: [44322, 2.0, 0.42], neige: [3347, 2.0, 0.3] };
for (const id of [...HERO.map((h) => h[0]), ...Object.values(TILES).map((t) => t[0])]) {
  if (lic[id]?.licence !== 'free') throw new Error(`clip ${id} sans licence libre vérifiée`);
}

const crop = (w, h, cx) => `crop='min(iw,ih*${w}/${h})':'min(ih,iw*${h}/${w})':'(iw-min(iw,ih*${w}/${h}))*${cx}':'(ih-min(ih,iw*${h}/${w}))/2',scale=${w}:${h}:flags=lanczos,fps=30,setsar=1,format=yuv420p`;
const hero = (w, h, out) => {
  const inputs = HERO.flatMap(([id, ss]) => ['-ss', String(ss), '-t', String(SEG), '-i', MK(id)]);
  const parts = HERO.map(([, , cx], i) => `[${i}:v]${crop(w, h, cx)}[v${i}]`);
  let last = 'v0';
  for (let i = 1; i < HERO.length; i++) {
    parts.push(`[${last}][v${i}]xfade=transition=fade:duration=${FADE}:offset=${(i * (SEG - FADE)).toFixed(2)}[x${i}]`);
    last = `x${i}`;
  }
  ff([...inputs, '-filter_complex', parts.join(';'), '-map', `[${last}]`, ...ENC, out]);
};

const OLD = path.join(V, '_licence-restreinte');
fs.mkdirSync(OLD, { recursive: true });
const backup = (f) => { const p = path.join(V, f); if (fs.existsSync(p) && !fs.existsSync(path.join(OLD, f))) fs.copyFileSync(p, path.join(OLD, f)); };
['hero-16x9.mp4', 'hero-9x16.mp4', 'kc-u-mer.jpg', 'kc-tile-mer.mp4', 'kc-tile-mer.jpg', 'kc-tile-moto.mp4', 'kc-tile-moto.jpg', 'kc-tile-velo.mp4', 'kc-tile-velo.jpg', 'kc-tile-neige.mp4', 'kc-tile-neige.jpg'].forEach(backup);

hero(1280, 720, path.join(V, 'hero-16x9.mp4'));
hero(720, 1280, path.join(V, 'hero-9x16.mp4'));
ff(['-ss', '1.5', '-i', path.join(V, 'hero-16x9.mp4'), '-frames:v', '1', '-q:v', '3', path.join(V, 'kc-u-mer.jpg')]);
for (const [nom, [id, ss, cx]] of Object.entries(TILES)) {
  const mp4 = path.join(V, `kc-tile-${nom}.mp4`);
  ff(['-ss', String(ss), '-t', '4.5', '-i', MK(id), '-vf', crop(540, 720, cx), ...ENC, mp4]);
  ff(['-ss', '1', '-i', mp4, '-frames:v', '1', '-q:v', '3', path.join(V, `kc-tile-${nom}.jpg`)]);
}
console.log('vidéos refaites');

if (process.argv.includes('--envoyer')) {
  const put = (key, file) => rest('PUT', `themes/${THEME}/assets.json`, { asset: { key, attachment: fs.readFileSync(path.join(V, file)).toString('base64') } });
  const map = { 'kc-hero-16x9.mp4': 'hero-16x9.mp4', 'kc-hero-9x16.mp4': 'hero-9x16.mp4', 'kc-u-mer.jpg': 'kc-u-mer.jpg' };
  for (const nom of Object.keys(TILES)) { map[`kc-tile-${nom}.mp4`] = `kc-tile-${nom}.mp4`; map[`kc-tile-${nom}.jpg`] = `kc-tile-${nom}.jpg`; }
  for (const [key, file] of Object.entries(map)) { await put(`assets/${key}`, file); console.log('envoyé', key); }
}
