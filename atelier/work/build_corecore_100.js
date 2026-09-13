const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const workspace = 'C:/Users/Valentin/Documents/Codex/2026-08-24/repr';
const root = path.join(workspace, 'outputs/galerie-propositions-ondine/assets/corecore-grunge-v3');
const graphics = path.join(root, 'graphics');
const fragmentsDir = path.join(root, 'fragments');
const printsDir = path.join(root, 'variations-100/prints');
const mockupsDir = path.join(root, 'variations-100/mockups');
const template = path.join(workspace, 'outputs/galerie-propositions-ondine/assets/templates/tee-front-blank.png');

for (const dir of [fragmentsDir, printsDir, mockupsDir]) fs.mkdirSync(dir, { recursive: true });

function magick(args) {
  const result = spawnSync('magick', args, { encoding: 'utf8', windowsHide: true });
  if (result.status !== 0) {
    throw new Error(`ImageMagick failed (${result.status}): ${result.stderr || result.stdout}\n${args.join(' ')}`);
  }
}

const crops = {
  seated: ['01-last-tape-1994.png', '720x760+90+430'],
  cassette: ['01-last-tape-1994.png', '430x390+430+150'],
  mic: ['01-last-tape-1994.png', '430x500+720+20'],
  runner: ['01-last-tape-1994.png', '390x560+810+560'],
  tv: ['02-no-signal.png', '500x600+80+100'],
  door: ['02-no-signal.png', '500x600+520+100'],
  crouch: ['02-no-signal.png', '520x650+980+80'],
  mic2: ['02-no-signal.png', '360x620+1540+80'],
  phone: ['03-missed-call-0317.png', '500x1024+0+0'],
  run1: ['03-missed-call-0317.png', '650x520+470+240'],
  booth: ['03-missed-call-0317.png', '400x680+1120+100'],
  wave: ['03-missed-call-0317.png', '340x260+350+700'],
  cassette2: ['04-side-b-playback-ended.png', '780x680+0+0'],
  seated2: ['04-side-b-playback-ended.png', '960x520+80+500'],
  mic3: ['04-side-b-playback-ended.png', '450x1000+1080+20'],
  chair: ['05-everyone-left.png', '610x1024+0+0'],
  stage: ['05-everyone-left.png', '650x400+410+0'],
  frames: ['05-everyone-left.png', '470x650+530+370'],
  walk: ['05-everyone-left.png', '620x1024+900+0'],
  recorder: ['06-room-tone-side-a.png', '560x940+0+0'],
  bed: ['06-room-tone-side-a.png', '980x700+380+200'],
  doorwoman1: ['06-room-tone-side-a.png', '330x560+1110+0'],
  doorwoman2: ['06-room-tone-side-a.png', '320x650+1350+200']
};

for (const [name, [file, crop]] of Object.entries(crops)) {
  const out = path.join(fragmentsDir, `${name}.png`);
  magick([path.join(graphics, file), '-crop', crop, '+repage', '-trim', '+repage', out]);
}

const themes = [
  { name: 'LAST TAPE', chapter: '01', fragments: ['seated', 'cassette', 'mic', 'runner'] },
  { name: 'NO SIGNAL', chapter: '02', fragments: ['tv', 'door', 'crouch', 'mic2'] },
  { name: 'MISSED CALL', chapter: '03', fragments: ['phone', 'run1', 'booth', 'wave'] },
  { name: 'SIDE B', chapter: '04', fragments: ['cassette2', 'seated2', 'mic3', 'runner'] },
  { name: 'EVERYONE LEFT', chapter: '05', fragments: ['chair', 'stage', 'frames', 'walk'] },
  { name: 'ROOM TONE', chapter: '06', fragments: ['recorder', 'bed', 'doorwoman1', 'doorwoman2'] },
  { name: 'FOUND FOOTAGE', chapter: 'X1', fragments: ['cassette', 'tv', 'phone', 'recorder'] },
  { name: 'LEFT THE FRAME', chapter: 'X2', fragments: ['runner', 'run1', 'walk', 'doorwoman1'] },
  { name: 'AFTER THE SET', chapter: 'X3', fragments: ['mic', 'stage', 'chair', 'door'] },
  { name: 'PLAYBACK ENDED', chapter: 'X4', fragments: ['crouch', 'seated2', 'bed', 'wave'] }
];

const suffixes = ['ARCHIVE 01', 'CUT 02', 'FRAME 03', 'TAKE 04', 'COPY 05', 'ROOM 06', 'TAPE 07', 'FILE 08', 'SIDE 09', 'END 10'];
const layouts = [
  [[20, 25, 390, 470, -2], [420, 55, 240, 230, 0], [470, 300, 170, 190, 2]],
  [[295, 25, 380, 460, 2], [25, 65, 245, 260, -2], [75, 335, 190, 180, 0]],
  [[20, 75, 215, 320, 0], [245, 40, 220, 360, 0], [475, 85, 200, 300, 0], [260, 410, 180, 110, 0]],
  [[20, 20, 470, 390, -3], [465, 275, 210, 250, 2], [60, 410, 190, 120, 0]],
  [[125, 15, 450, 370, 0], [25, 330, 235, 210, -2], [450, 350, 225, 190, 2]],
  [[15, 95, 320, 420, -2], [300, 40, 375, 300, 2], [380, 340, 230, 180, 0]],
  [[20, 40, 300, 300, 0], [360, 40, 300, 300, 0], [205, 320, 290, 210, 0]],
  [[80, 30, 540, 390, 0], [20, 365, 210, 150, -2], [465, 350, 205, 170, 2]],
  [[15, 25, 240, 470, 0], [270, 50, 200, 220, 0], [475, 45, 200, 225, 0], [300, 300, 300, 225, 0]],
  [[160, 25, 380, 420, 0], [20, 90, 170, 190, -3], [510, 90, 170, 190, 3], [260, 410, 180, 110, 0]]
];

const burgundy = '#6b171d';
const entries = [];

for (let themeIndex = 0; themeIndex < themes.length; themeIndex++) {
  const theme = themes[themeIndex];
  for (let variant = 0; variant < 10; variant++) {
    const number = themeIndex * 10 + variant + 1;
    const n = String(number).padStart(3, '0');
    const title = `${theme.name} // ${suffixes[variant]}`;
    const layout = layouts[variant];
    const chosen = theme.fragments.slice();
    if (variant % 3 === 1) chosen.reverse();
    if (variant % 3 === 2) chosen.push(chosen[1]);
    const printFile = `${n}-${theme.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.png`;
    const mockupFile = `${n}-${theme.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.jpg`;
    const printPath = path.join(printsDir, printFile);
    const mockupPath = path.join(mockupsDir, mockupFile);

    const args = ['-size', '700x650', 'canvas:none'];
    for (let layerIndex = 0; layerIndex < layout.length; layerIndex++) {
      const [x, y, w, h, rotation] = layout[layerIndex];
      const fragment = chosen[layerIndex % chosen.length];
      args.push(
        '(', path.join(fragmentsDir, `${fragment}.png`),
        '-resize', `${w}x${h}>`,
        ...(rotation ? ['-background', 'none', '-rotate', String(rotation)] : []),
        ')', '-geometry', `+${x}+${y}`, '-composite'
      );
    }
    const barX = 70 + ((themeIndex * 47 + variant * 61) % 510);
    const barY = 80 + ((themeIndex * 31 + variant * 43) % 330);
    if (variant % 2 === 0) {
      args.push('-fill', burgundy, '-draw', `rectangle ${barX},${barY} ${barX + 8},${barY + 120}`);
    } else {
      args.push('-fill', burgundy, '-draw', `rectangle ${barX},${barY} ${barX + 115},${barY + 8}`);
    }
    args.push(
      '-font', 'Consolas-Bold', '-pointsize', '23', '-fill', '#161311', '-gravity', 'south', '-annotate', '+0+32', title,
      '-font', 'Consolas', '-pointsize', '12', '-fill', '#6b171d', '-gravity', 'southwest', '-annotate', '+22+12', `ONDINE / ${theme.chapter} / ${n}`,
      printPath
    );
    magick(args);
    magick([
      template, printPath, '-geometry', '+277+300', '-composite',
      '-resize', '1000x1000', '-strip', '-interlace', 'Plane', '-quality', '86', mockupPath
    ]);
    entries.push({
      number,
      file: mockupFile,
      print: printFile,
      title,
      theme: theme.name,
      chapter: theme.chapter,
      fragments: [...new Set(chosen.slice(0, layout.length))]
    });
    if (number % 10 === 0) process.stdout.write(`generated ${number}/100\n`);
  }
}

fs.writeFileSync(path.join(root, 'variations-100/index.json'), JSON.stringify(entries, null, 2), 'utf8');
console.log(JSON.stringify({ total: entries.length, mockupsDir, printsDir }, null, 2));

