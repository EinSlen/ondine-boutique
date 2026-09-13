const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const workspace = 'C:/Users/Valentin/Documents/Codex/2026-08-24/repr';
const galleryRoot = path.join(workspace, 'outputs/galerie-propositions-ondine');
const contentRoot = 'C:/Users/Valentin/Desktop/Ondine/contenu';
const template = path.join(galleryRoot, 'assets/templates/tee-front-blank.png');
const sceneRoot = path.join(galleryRoot, 'assets/live-direction-v2/scenes');
const outputRoot = path.join(galleryRoot, 'assets/mockups-live-direction-100');
const tempRoot = path.join(workspace, 'work/live-direction-v2-build');
const testOnly = process.env.LIVE_DIRECTION_TEST === '1';
const limit = testOnly ? 10 : 100;

const scenes = [
  '01-runner-dress.png',
  '02-seated-chair.png',
  '03-standing-bowed.png',
  '04-walking-away.png',
  '05-crouched-face.png',
  '06-sprinting.png',
  '07-kneeling-reaching.png',
  '08-bench-alone.png'
].map(file => path.join(sceneRoot, file));

const moods = [
  'AFTER YOU LEFT', 'STILL WAITING', 'DON’T TURN AROUND', 'EMPTY SIDE', 'RUN QUIET',
  'NOT COMING BACK', 'LAST ONE HERE', 'TOO FAR NOW', 'MISSED AGAIN', 'NO ANSWER',
  'OUTSIDE THE FRAME', 'SHE KEPT WALKING', 'SAME EMPTY ROOM', 'BEFORE MORNING', 'NOTHING MOVED',
  'ONE CHAIR LEFT', 'ALMOST GONE', 'WAIT WITHOUT ME', 'THE LONG WAY OUT', 'STAY LOST'
];

function ensureDir(dir) { fs.mkdirSync(dir, { recursive: true }); }
function padded(value) { return String(value).padStart(3, '0'); }
function runMagick(args, label) {
  const result = spawnSync('magick', args, { encoding: 'utf8', windowsHide: true });
  if (result.status !== 0) throw new Error(`${label}\n${result.stdout}\n${result.stderr}`);
}
function place(asset, resize, rotate, geometry) {
  return ['(', asset, '-background', 'none', '-resize', resize, '-rotate', String(rotate), ')', '-geometry', geometry, '-compose', 'over', '-composite'];
}

ensureDir(outputRoot);
ensureDir(tempRoot);

const brushSources = [
  path.join(contentRoot, 'taches/339522.svg'),
  path.join(contentRoot, 'taches/339524.svg')
];
const brushes = brushSources.map((source, index) => {
  const out = path.join(tempRoot, `brush-${index + 1}.png`);
  runMagick([
    '-background', 'none', '-density', '220', source,
    '-trim', '+repage', '-resize', index === 0 ? '520x300' : '430x270',
    '-fill', '#681b21', '-colorize', '100', out
  ], `Préparation peinture ${index + 1}`);
  return out;
});

function scene(index) { return scenes[(index + scenes.length) % scenes.length]; }
const p = (asset, resize, rotate, geometry) => place(asset, resize, rotate, geometry);
const b = (index, resize, rotate, geometry) => place(brushes[index % brushes.length], resize, rotate, geometry);

function artArgs(type, offset) {
  const base = ['-size', '1254x1254', 'xc:none'];
  const s0 = scene(offset);
  const s1 = scene(offset + 1);
  const s2 = scene(offset + 2);
  const s3 = scene(offset + 3);
  switch (type) {
    case 0:
      return [...base, ...b(0, '380x220', -12, '+660+560'), ...b(1, '170x110', 18, '+930+430'), ...p(s0, '230x300', -2, '+300+260'), ...p(s1, '350x430', 0, '+650+570'), ...p(s2, '105x150', 0, '+575+450')];
    case 1:
      return [...base, ...b(1, '390x180', -8, '+245+610'), ...p(s0, '170x230', -5, '+320+270'), ...p(s0, '145x205', 0, '+535+292'), ...p(s0, '120x180', 5, '+725+315'), ...p(s1, '355x430', 0, '+305+620')];
    case 2:
      return [...base, ...b(0, '300x185', 10, '+125+460'), ...b(1, '300x145', -6, '+670+760'), ...p(s1, '390x470', 0, '+450+500'), ...p(s0, '160x220', 2, '+760+275'), ...p(s3, '115x170', 0, '+315+770')];
    case 3:
      return [...base, ...b(0, '300x180', -16, '+750+250'), ...p(s3, '210x280', -2, '+325+300'), ...p(s0, '180x245', 3, '+760+300'), ...p(s2, '110x160', 0, '+570+420'), ...p(scene(7), '480x290', 0, '+390+680')];
    case 4:
      return [...base, ...b(1, '420x220', 8, '+650+620'), ...b(0, '190x120', -18, '+165+360'), ...p(scene(4), '480x510', 0, '+395+480'), ...p(scene(5), '125x175', -3, '+755+300')];
    case 5:
      return [...base, ...b(0, '420x230', -4, '+260+690'), ...p(scene(6), '390x420', 0, '+300+560'), ...p(s3, '165x225', 0, '+595+290'), ...p(scene(7), '235x165', 0, '+700+760')];
    case 6:
      return [...base, ...b(1, '285x150', 14, '+130+500'), ...b(0, '250x145', -8, '+850+330'), ...p(scene(1), '355x430', 0, '+300+570'), ...p(scene(0), '270x350', 0, '+735+315')];
    case 7:
      return [...base, ...b(0, '330x180', -12, '+720+670'), ...p(scene(5), '200x265', -4, '+295+300'), ...p(scene(5), '170x235', 0, '+520+330'), ...p(scene(5), '145x210', 4, '+715+355'), ...p(scene(1), '240x310', 0, '+655+690')];
    case 8:
      return [...base, ...b(1, '460x240', 7, '+210+710'), ...b(0, '210x120', -18, '+870+320'), ...p(scene(0), '510x610', -2, '+265+350'), ...p(scene(4), '135x190', 0, '+795+720')];
    default:
      return [...base, ...b(0, '260x145', -10, '+180+300'), ...b(1, '300x160', 12, '+760+710'), ...p(s0, '185x250', -3, '+305+270'), ...p(s1, '250x325', 0, '+700+520'), ...p(s2, '120x175', 0, '+530+430'), ...p(s3, '145x205', 3, '+380+760')];
  }
}

const records = [];
for (let i = 1; i <= limit; i++) {
  const n = padded(i);
  const art = path.join(tempRoot, `${n}-art.png`);
  const out = path.join(outputRoot, `${n}.png`);
  const type = (i - 1) % 10;
  const offset = (i * 3 + Math.floor(i / 10)) % scenes.length;

  runMagick([
    ...artArgs(type, offset),
    '-channel', 'A', '-evaluate', 'multiply', '0.88', '+channel',
    '-blur', '0x0.18', art
  ], `Composition narrative ${n}`);

  runMagick([
    template,
    art, '-geometry', '+0+0', '-compose', 'over', '-composite',
    '-resize', '1000x1000', '-strip', '-quality', '91', out
  ], `Mockup direction ${n}`);

  records.push({
    number: i,
    file: `${n}.png`,
    name: moods[(i - 1) % moods.length],
    composition: ['scènes dispersées', 'fuite répétée', 'attente centrale', 'mémoire fragmentée', 'accroupi grand format', 'geste au sol', 'distance', 'course séquentielle', 'fuite grand format', 'fragments isolés'][type],
    scenes: [path.basename(scene(offset), '.png'), path.basename(scene(offset + 1), '.png')]
  });

  if (i % 10 === 0) process.stdout.write(`Direction V2: ${i}/${limit}\n`);
}

if (!testOnly) fs.writeFileSync(path.join(outputRoot, 'index.json'), JSON.stringify(records, null, 2), 'utf8');
console.log(JSON.stringify({ generated: records.length, outputRoot, testOnly }, null, 2));
