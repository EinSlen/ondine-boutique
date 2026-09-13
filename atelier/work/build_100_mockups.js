const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const workspace = 'C:/Users/Valentin/Documents/Codex/2026-08-24/repr';
const galleryRoot = path.join(workspace, 'outputs/galerie-propositions-ondine');
const sourceRoot = path.join(workspace, 'outputs/recherche-100-et-12-concepts');
const contentRoot = 'C:/Users/Valentin/Desktop/Ondine/contenu';
const generatedRoot = 'C:/Users/Valentin/.codex/generated_images/01a032dc-3e5a-74c2-ae6a-9aa1372cbde9';
const teeSource = path.join(generatedRoot, 'exec-22c78b07-f9ba-4651-b2b1-c881e86d6333.png');
const teeTemplate = path.join(galleryRoot, 'assets/templates/tee-front-blank.png');
const silhouetteA = path.join(galleryRoot, 'assets/silhouettes/01-hunched-chair.png');
const silhouetteB = path.join(galleryRoot, 'assets/silhouettes/02-face-in-hands.png');
const mockupDir = path.join(galleryRoot, 'assets/mockups-100');
const tempDir = path.join(workspace, 'work/mockup-generation');
const testOnly = process.env.MOCKUP_TEST === '1';
const limit = testOnly ? 10 : 100;

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function runMagick(args, label) {
  const result = spawnSync('magick', args, { encoding: 'utf8', windowsHide: true });
  if (result.status !== 0) {
    throw new Error(`${label}\n${result.stdout}\n${result.stderr}`);
  }
}

function padded(value) {
  return String(value).padStart(3, '0');
}

ensureDir(path.dirname(teeTemplate));
ensureDir(mockupDir);
ensureDir(tempDir);
fs.copyFileSync(teeSource, teeTemplate);

const manifest = JSON.parse(fs.readFileSync(path.join(sourceRoot, 'references/manifest.json'), 'utf8'));
const oldIndex = JSON.parse(fs.readFileSync(path.join(contentRoot, 'propositions/index.json'), 'utf8'));

const brushSource = path.join(contentRoot, 'taches/339524.svg');
const brushPng = path.join(tempDir, 'brush-red.png');
runMagick([
  '-background', 'none', '-density', '180', brushSource,
  '-trim', '+repage', '-resize', '430x220',
  '-fuzz', '14%', '-transparent', 'white',
  '-fill', '#761f25', '-colorize', '100', brushPng
], 'Préparation de la tache bordeaux');

function renderSource(source, destination, size) {
  runMagick([
    '-background', 'none', '-density', '220', source,
    '-alpha', 'on', '-trim', '+repage', '-resize', size,
    '-fill', '#090909', '-colorize', '100', destination
  ], `Conversion ${path.basename(source)}`);
}

function referenceSource(index) {
  const item = manifest[(index + manifest.length) % manifest.length];
  return path.join(sourceRoot, 'references', item.svg_file);
}

function primaryFor(i) {
  if (i % 9 === 0 || i === 2) return silhouetteB;
  if (i % 13 === 0) return silhouetteA;
  return referenceSource(i - 1);
}

function secondaryFor(i) {
  if (i % 17 === 0) return silhouetteB;
  return referenceSource((i + 36) % 100);
}

function transformed(asset, resize, rotate, geometry) {
  return ['(', asset, '-background', 'none', '-resize', resize, '-rotate', String(rotate), ')', '-geometry', geometry, '-compose', 'over', '-composite'];
}

function designArgs(type, primary, secondary) {
  const base = ['-size', '600x650', 'xc:none'];
  const brush = (resize, rotate, geometry) => transformed(brushPng, resize, rotate, geometry);
  const p = (resize, rotate, geometry) => transformed(primary, resize, rotate, geometry);
  const s = (resize, rotate, geometry) => transformed(secondary, resize, rotate, geometry);
  const draw = (...commands) => ['-fill', '#090909', '-stroke', '#090909', '-strokewidth', '5', '-draw', commands.join(' ')];
  const redDraw = (...commands) => ['-fill', '#761f25', '-stroke', '#761f25', '-strokewidth', '7', '-draw', commands.join(' ')];

  switch (type) {
    case 0:
      return [...base, ...brush('300x150', -8, '+75+92'), ...p('330x390', 0, '+118+145'), ...draw('rectangle 480,120 493,548')];
    case 1:
      return [...base, ...brush('255x120', 14, '+40+135'), ...p('245x335', 0, '+38+178'), ...draw('rectangle 294,138 306,540'), ...s('205x285', 0, '+350+220')];
    case 2:
      return [...base, ...draw('rectangle 282,64 319,592'), ...p('185x250', 0, '+42+350'), ...s('155x220', 0, '+400+250'), ...brush('315x120', -4, '+144+260')];
    case 3:
      return [...base, ...redDraw('line 55,590 540,68'), ...p('285x355', 2, '+245+78'), ...s('105x145', 0, '+66+420'), ...draw('rectangle 500,500 516,612')];
    case 4:
      return [...base, ...brush('290x115', 0, '+40+72'), ...p('155x210', -4, '+45+355'), ...p('135x190', 0, '+230+370'), ...p('115x170', 4, '+405+385'), ...draw('rectangle 65,585 535,596')];
    case 5:
      return [...base, '-fill', 'none', '-stroke', '#090909', '-strokewidth', '24', '-draw', 'circle 300,300 300,98', ...p('255x340', 0, '+173+128'), ...redDraw('line 300,504 300,628'), ...brush('210x90', -12, '+280+92')];
    case 6:
      return [...base, ...draw('rectangle 45,308 555,326'), ...brush('270x115', -5, '+168+255'), ...p('235x330', 0, '+52+125'), ...s('168x235', 0, '+380+320')];
    case 7:
      return [...base, ...p('355x430', 0, '+48+180'), ...draw('rectangle 430,112 443,590'), ...brush('200x92', 17, '+330+70'), ...redDraw('circle 502,176 502,184', 'circle 526,207 526,214')];
    case 8:
      return [...base, ...p('430x510', -3, '-55+100'), ...redDraw('rectangle 452,92 473,592'), ...s('120x170', 0, '+430+395')];
    default:
      return [...base, '-fill', 'none', '-stroke', '#090909', '-strokewidth', '18', '-draw', 'circle 300,287 300,105', ...p('240x325', 0, '+180+130'), ...brush('235x90', -8, '+70+420'), ...redDraw('line 300,480 300,630')];
  }
}

const records = [];
for (let i = 1; i <= limit; i++) {
  const n = padded(i);
  const primaryPng = path.join(tempDir, `${n}-primary.png`);
  const secondaryPng = path.join(tempDir, `${n}-secondary.png`);
  const designPng = path.join(tempDir, `${n}-design.png`);
  const outputPng = path.join(mockupDir, `${n}.png`);

  renderSource(primaryFor(i), primaryPng, '390x430');
  renderSource(secondaryFor(i), secondaryPng, '270x310');

  runMagick([
    ...designArgs((i - 1) % 10, primaryPng, secondaryPng),
    '-channel', 'A', '-evaluate', 'multiply', '0.91', '+channel',
    designPng
  ], `Composition ${n}`);

  runMagick([
    teeTemplate,
    '(', designPng, '-resize', '600x650', ')',
    '-geometry', '+327+290', '-compose', 'over', '-composite',
    '-resize', '1000x1000', '-strip', '-quality', '90', outputPng
  ], `Mockup ${n}`);

  const old = oldIndex[i - 1] || {};
  const reference = manifest[i - 1];
  records.push({
    number: i,
    file: `${n}.png`,
    name: (old.phrase || reference.title || `proposition ${n}`).toUpperCase(),
    family: reference.family,
    referenceTitle: reference.title,
    composition: ['impact', 'duo', 'barre', 'diagonale', 'séquence', 'halo', 'rupture', 'verticale', 'hors-cadre', 'cercle'][(i - 1) % 10],
    originalSilhouette: primaryFor(i) === silhouetteA || primaryFor(i) === silhouetteB
  });

  if (i % 10 === 0) process.stdout.write(`Mockups: ${i}/${limit}\n`);
}

if (!testOnly) {
  fs.writeFileSync(path.join(mockupDir, 'index.json'), JSON.stringify(records, null, 2), 'utf8');
}

console.log(JSON.stringify({ generated: records.length, directory: mockupDir, testOnly }, null, 2));
