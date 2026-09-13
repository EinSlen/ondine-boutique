const fs = require('fs');
const path = require('path');

const workspace = 'C:/Users/Valentin/Documents/Codex/2026-08-24/repr';
const sourceRoot = path.join(workspace, 'outputs/recherche-100-et-12-concepts');
const outRoot = path.join(workspace, 'outputs/galerie-propositions-ondine');
const desktopRoot = 'C:/Users/Valentin/Desktop/Ondine/contenu';
const generatedRoot = 'C:/Users/Valentin/.codex/generated_images/01a032dc-3e5a-74c2-ae6a-9aa1372cbde9';

const generatedSilhouettes = [
  {
    id: 'sil-01',
    filename: '01-hunched-chair.png',
    source: path.join(generatedRoot, 'exec-c42c6be8-e0f5-4c08-98ce-d27c5dfc58d7.png'),
    title: 'Hunched Chair',
    note: 'Masse compacte, chaise roulante, texture xerox. La plus proche du rythme visuel recherché.'
  },
  {
    id: 'sil-02',
    filename: '02-face-in-hands.png',
    source: path.join(generatedRoot, 'exec-39fc9780-7de8-45c6-a419-30d918a1d385.png'),
    title: 'Face in Hands',
    note: 'Profil plus net, négatifs très lisibles, parfait pour une petite sérigraphie.'
  }
];

const concepts = [
  ['01-cut-short.png', 'CUT SHORT'],
  ['02-no-exit.png', 'NO EXIT'],
  ['03-dont-look-back.png', "DON’T LOOK BACK"],
  ['04-last-bench.png', 'LAST BENCH'],
  ['05-reach-miss.png', 'REACH / MISS'],
  ['06-ink-bird.png', 'INK BIRD'],
  ['07-one-rose-left.png', 'ONE ROSE LEFT'],
  ['08-fallen-signal.png', 'FALLEN SIGNAL'],
  ['09-line-dead.png', 'LINE DEAD'],
  ['10-walk-the-wire.png', 'WALK THE WIRE'],
  ['11-keyhole-person.png', 'KEYHOLE PERSON'],
  ['12-split-screen.png', 'SPLIT SCREEN']
];

const familyLabels = {
  '01-personnages': 'Personnages',
  '02-chaises': 'Chaises',
  '03-mains': 'Mains',
  '04-corbeaux': 'Corbeaux',
  '05-roses': 'Roses',
  '06-anges': 'Anges',
  '07-telephones': 'Téléphones',
  '08-barbeles': 'Barbelés',
  '09-cimetieres': 'Cimetières',
  '10-portes': 'Portes'
};

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function copyFile(source, destination) {
  ensureDir(path.dirname(destination));
  fs.copyFileSync(source, destination);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function stripMarkdown(value) {
  return value
    .replaceAll('**', '')
    .replace(/\[VISUEL\]/g, '')
    .replace(/`/g, '')
    .trim();
}

function extractProposals(markdown) {
  const proposals = [];
  let currentFamily = 'Autres';
  for (const rawLine of markdown.split(/\r?\n/)) {
    const line = rawLine.trim();
    const heading = line.match(/^##\s+(.+)$/);
    if (heading && !heading[1].toLowerCase().includes('douze concepts')) {
      currentFamily = heading[1].trim();
      continue;
    }
    const match = line.match(/^(\d+)\.\s+\*\*(.+?)\*\*\s*(?:`\[VISUEL\]`)?\s*—\s*(.+)$/);
    if (!match) continue;
    proposals.push({
      number: Number(match[1]),
      title: stripMarkdown(match[2]),
      description: stripMarkdown(match[3]),
      family: currentFamily,
      visual: line.includes('[VISUEL]')
    });
  }
  return proposals;
}

ensureDir(path.join(outRoot, 'assets/silhouettes'));
ensureDir(path.join(outRoot, 'assets/concepts'));
ensureDir(path.join(outRoot, 'assets/references'));

for (const silhouette of generatedSilhouettes) {
  copyFile(silhouette.source, path.join(outRoot, 'assets/silhouettes', silhouette.filename));
}

for (const [filename] of concepts) {
  copyFile(
    path.join(sourceRoot, 'concepts', filename),
    path.join(outRoot, 'assets/concepts', filename)
  );
}

const manifest = JSON.parse(
  fs.readFileSync(path.join(sourceRoot, 'references/manifest.json'), 'utf8')
);

for (const reference of manifest) {
  const numberedName = String(reference.index).padStart(3, '0') + '.png';
  copyFile(
    path.join(sourceRoot, 'references/png-numerotes', numberedName),
    path.join(outRoot, 'assets/references', numberedName)
  );
}

const heroWalker = manifest.find(reference => reference.index === 5);
copyFile(
  path.join(sourceRoot, 'references', heroWalker.svg_file),
  path.join(outRoot, 'assets/hero-walker.svg')
);

const proposalMarkdown = fs.readFileSync(
  path.join(sourceRoot, 'CATALOGUE-50-PROPOSITIONS.md'),
  'utf8'
);
const proposals = extractProposals(proposalMarkdown);

const mockupIndexPath = path.join(outRoot, 'assets/mockups-live-direction-100/index.json');
const mockups = fs.existsSync(mockupIndexPath)
  ? JSON.parse(fs.readFileSync(mockupIndexPath, 'utf8'))
  : [];

const prototypes = [
  ['01-tee-front-isolated-scenes.png', 'AFTER YOU LEFT', 'Tee face · scènes isolées et peinture physique'],
  ['02-black-zip-scattered-memories.png', 'SCATTERED MEMORIES', 'Zip noir · encre blanche et peinture bordeaux'],
  ['03-grey-hoodie-distance.png', 'NO WAY BACK', 'Hoodie gris · fuite, attente et grands vides'],
  ['04-tee-back-running-away.png', 'RUNNING OUT', 'Tee dos · séquence photographique érodée']
];

const liveGrammarV4 = [
  ['01-final-rehearsal-charcoal-ls.png', 'FINAL REHEARSAL', 'Long-sleeve charbon · deux scènes primitives, barre centrale, chaise vide et peinture textile.'],
  ['02-empty-stage-ivory-tee.png', 'EMPTY STAGE', 'Tee écru · trois vignettes très espacées, scène forte en bas et grandes zones de tissu nu.'],
  ['03-four-beats-black-zip.png', 'FOUR BEATS', 'Zip noir · séquence blanche en quatre temps, fermeture utilisée comme vide et rouge sur les coutures.']
];

const liveGrammarV4Cards = liveGrammarV4.map(([filename, title, note], index) => {
  const n = String(index + 1).padStart(2, '0');
  const src = `assets/live-grammar-v4/prototypes/${filename}`;
  return `
    <article class="card media-card item" data-kind="live-grammar" data-family="live-grammar" data-search="${escapeHtml(`${title} ${note} silhouettes primitives peinture textile vêtement brut`)}">
      <button class="pick" type="button" data-pick="live-grammar-${n}" data-label="V4-${n} — ${escapeHtml(title)}" aria-label="Garder ce prototype">+</button>
      <button class="visual mockup-visual" type="button" data-full="${src}" data-caption="V4-${n} — ${escapeHtml(title)}">
        <img src="${src}" alt="Prototype V4 ${escapeHtml(title)}" loading="eager">
      </button>
      <div class="card-copy">
        <div class="eyebrow">V4-${n} · GRAMMAIRE BRUTE · ORIGINAL</div>
        <h3>${escapeHtml(title)}</h3>
        <p>${escapeHtml(note)}</p>
      </div>
    </article>`;
}).join('');

const corecoreV3 = [
  ['01-last-tape-1994.png', 'LAST TAPE / 1994', 'L’icône grunge anonyme, la cassette arrachée, le micro vide et le départ. La pièce manifeste.'],
  ['02-no-signal.png', 'NO SIGNAL', 'Écran mort, porte fermée, personnage replié et micro abandonné. Le chapitre le plus corecore.'],
  ['03-missed-call-0317.png', 'MISSED CALL / 03:17', 'Un appel décroché, une fuite répétée et quelqu’un qui attend encore dans la cabine.'],
  ['04-side-b-playback-ended.png', 'SIDE B / PLAYBACK ENDED', 'La bande relie la cassette au micro pendant que l’artiste reste assis devant l’ampli.'],
  ['05-everyone-left.png', 'EVERYONE LEFT', 'Chaise vide, scène vide, couloir de surveillance et musicien qui quitte la salle.'],
  ['06-room-tone-side-a.png', 'ROOM TONE / SIDE A', 'Le magnétophone tourne encore dans une chambre devenue presque entièrement silencieuse.']
];

const corecore100IndexPath = path.join(outRoot, 'assets/corecore-grunge-v3/variations-100/index.json');
const corecore100 = fs.existsSync(corecore100IndexPath)
  ? JSON.parse(fs.readFileSync(corecore100IndexPath, 'utf8'))
  : [];

const corecoreCards = corecoreV3.map(([filename, title, note], index) => {
  const n = String(index + 1).padStart(2, '0');
  const src = `assets/corecore-grunge-v3/mockups/${filename}`;
  return `
    <article class="card media-card item" data-kind="corecore" data-family="corecore" data-search="${escapeHtml(title + ' ' + note + ' grunge corecore 1994 cassette')}">
      <button class="pick" type="button" data-pick="corecore-${n}" data-label="V3-${n} — ${escapeHtml(title)}" aria-label="Garder ce concept">+</button>
      <button class="visual mockup-visual" type="button" data-full="${src}" data-caption="V3-${n} — ${escapeHtml(title)}">
        <img src="${src}" alt="Concept V3 ${escapeHtml(title)}" loading="eager">
      </button>
      <div class="card-copy">
        <div class="eyebrow">V3-${n} · LAST TAPE / 1994 · ORIGINAL</div>
        <h3>${escapeHtml(title)}</h3>
        <p>${escapeHtml(note)}</p>
      </div>
    </article>`;
}).join('');

const corecore100Cards = corecore100.map((item) => {
  const n = String(item.number).padStart(3, '0');
  const src = `assets/corecore-grunge-v3/variations-100/mockups/${item.file}`;
  const print = `assets/corecore-grunge-v3/variations-100/prints/${item.print}`;
  const fragmentText = (item.fragments || []).join(' · ');
  return `
    <article class="card media-card item" data-kind="corecore-variation" data-family="corecore" data-search="${escapeHtml(`${n} ${item.title} ${item.theme} ${fragmentText} corecore grunge 1994`)}">
      <button class="pick" type="button" data-pick="corecore-variation-${n}" data-label="V3-${n} — ${escapeHtml(item.title)}" aria-label="Garder cette variation">+</button>
      <button class="visual mockup-visual" type="button" data-full="${src}" data-caption="V3-${n} — ${escapeHtml(item.title)}">
        <img src="${src}" alt="Variation V3 ${n} ${escapeHtml(item.title)}" loading="lazy">
      </button>
      <div class="card-copy compact">
        <div class="eyebrow">V3-${n} · CHAPITRE ${escapeHtml(item.chapter)} · 1-BIT</div>
        <h3>${escapeHtml(item.title)}</h3>
        <p>${escapeHtml(fragmentText)} · <a href="${print}" target="_blank">print transparent</a></p>
      </div>
    </article>`;
}).join('');

const silhouetteCards = generatedSilhouettes.map((item, index) => {
  const n = String(index + 1).padStart(2, '0');
  const src = `assets/silhouettes/${item.filename}`;
  return `
    <article class="card media-card item" data-kind="silhouette" data-family="silhouette" data-search="${escapeHtml(item.title + ' ' + item.note)}">
      <button class="pick" type="button" data-pick="${item.id}" data-label="S${n} — ${escapeHtml(item.title)}" aria-label="Garder cette silhouette">+</button>
      <button class="visual transparent-grid" type="button" data-full="${src}" data-caption="S${n} — ${escapeHtml(item.title)}">
        <img src="${src}" alt="Silhouette originale ${escapeHtml(item.title)}" loading="eager">
      </button>
      <div class="card-copy">
        <div class="eyebrow">S${n} · ORIGINAL</div>
        <h3>${escapeHtml(item.title)}</h3>
        <p>${escapeHtml(item.note)}</p>
      </div>
    </article>`;
}).join('');

const mockupCards = mockups.map((item) => {
  const n = String(item.number).padStart(3, '0');
  const src = `assets/mockups-live-direction-100/${item.file}`;
  const search = `${n} ${item.name} ${item.composition} ${(item.scenes || []).join(' ')}`;
  return `
    <article class="card media-card item" data-kind="mockup" data-family="live-direction" data-search="${escapeHtml(search)}">
      <button class="pick" type="button" data-pick="live-${n}" data-label="L${n} — ${escapeHtml(item.name)}" aria-label="Garder ce mockup">+</button>
      <button class="visual mockup-visual" type="button" data-full="${src}" data-caption="M${n} — ${escapeHtml(item.name)}">
        <img src="${src}" alt="Mockup tee-shirt ${n} ${escapeHtml(item.name)}" loading="lazy">
      </button>
      <div class="card-copy compact">
        <div class="eyebrow">L${n} · ${escapeHtml(item.composition)} · PHOTO XEROX</div>
        <h3>${escapeHtml(item.name)}</h3>
        <p>${escapeHtml((item.scenes || []).join(' · '))}</p>
      </div>
    </article>`;
}).join('');

const prototypeCards = prototypes.map(([filename, title, note], index) => {
  const n = String(index + 1).padStart(2, '0');
  const src = `assets/live-direction-v2/prototypes/${filename}`;
  return `
    <article class="card media-card item" data-kind="prototype" data-family="live-direction" data-search="${escapeHtml(title + ' ' + note)}">
      <button class="pick" type="button" data-pick="prototype-${n}" data-label="V${n} — ${escapeHtml(title)}" aria-label="Garder ce prototype">+</button>
      <button class="visual mockup-visual" type="button" data-full="${src}" data-caption="V${n} — ${escapeHtml(title)}">
        <img src="${src}" alt="Prototype ${escapeHtml(title)}" loading="eager">
      </button>
      <div class="card-copy">
        <div class="eyebrow">V${n} · PROTOTYPE PREMIUM · ORIGINAL</div>
        <h3>${escapeHtml(title)}</h3>
        <p>${escapeHtml(note)}</p>
      </div>
    </article>`;
}).join('');

const conceptCards = concepts.map(([filename, title], index) => {
  const n = String(index + 1).padStart(2, '0');
  const src = `assets/concepts/${filename}`;
  return `
    <article class="card media-card item" data-kind="concept" data-family="concept" data-search="${escapeHtml(title)}">
      <button class="pick" type="button" data-pick="concept-${n}" data-label="C${n} — ${escapeHtml(title)}" aria-label="Garder ce concept">+</button>
      <button class="visual concept-visual" type="button" data-full="${src}" data-caption="C${n} — ${escapeHtml(title)}">
        <img src="${src}" alt="Concept ${escapeHtml(title)}" loading="lazy">
      </button>
      <div class="card-copy compact">
        <div class="eyebrow">C${n} · CONCEPT</div>
        <h3>${escapeHtml(title)}</h3>
      </div>
    </article>`;
}).join('');

const referenceCards = manifest.map((reference) => {
  const n = String(reference.index).padStart(3, '0');
  const family = familyLabels[reference.family] || reference.family;
  const src = `assets/references/${n}.png`;
  const search = `${n} ${reference.title} ${family} ${reference.query}`;
  return `
    <article class="card media-card item" data-kind="reference" data-family="${escapeHtml(reference.family)}" data-search="${escapeHtml(search)}">
      <button class="pick" type="button" data-pick="ref-${n}" data-label="#${n} — ${escapeHtml(reference.title)}" aria-label="Garder cette référence">+</button>
      <button class="visual ref-visual" type="button" data-full="${src}" data-caption="#${n} — ${escapeHtml(reference.title)}">
        <img src="${src}" alt="Référence ${n} ${escapeHtml(reference.title)}" loading="lazy">
      </button>
      <div class="card-copy compact">
        <div class="eyebrow">#${n} · ${escapeHtml(family)}</div>
        <h3>${escapeHtml(reference.title)}</h3>
        <p class="license">CC0 / domaine public · <a href="${escapeHtml(reference.detail_url)}" target="_blank" rel="noreferrer">source</a></p>
      </div>
    </article>`;
}).join('');

const proposalCards = proposals.map((proposal) => {
  const n = String(proposal.number).padStart(2, '0');
  const search = `${proposal.number} ${proposal.title} ${proposal.description} ${proposal.family}`;
  return `
    <article class="card brief-card item ${proposal.visual ? 'is-visual' : ''}" data-kind="brief" data-family="brief" data-search="${escapeHtml(search)}">
      <button class="pick" type="button" data-pick="brief-${n}" data-label="P${n} — ${escapeHtml(proposal.title)}" aria-label="Garder cette proposition">+</button>
      <div class="brief-number">${n}</div>
      <div class="card-copy">
        <div class="eyebrow">P${n} · ${escapeHtml(proposal.family)}${proposal.visual ? ' · VISUEL EXISTANT' : ''}</div>
        <h3>${escapeHtml(proposal.title)}</h3>
        <p>${escapeHtml(proposal.description)}</p>
      </div>
    </article>`;
}).join('');

const familyOptions = Object.entries(familyLabels)
  .map(([value, label]) => `<option value="${escapeHtml(value)}">${escapeHtml(label)}</option>`)
  .join('');

const html = `<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>ONDINE — galerie de propositions</title>
  <style>
    :root {
      --ink: #0c0c0c;
      --paper: #e8e5de;
      --paper-2: #d7d2c8;
      --red: #681b21;
      --red-bright: #8e242b;
      --line: rgba(232,229,222,.17);
      --muted: #99958e;
      --panel: #151515;
    }
    * { box-sizing: border-box; }
    html { scroll-behavior: smooth; }
    body {
      margin: 0;
      color: var(--paper);
      background:
        radial-gradient(circle at 12% 0%, rgba(104,27,33,.18), transparent 26rem),
        repeating-linear-gradient(0deg, rgba(255,255,255,.012) 0 1px, transparent 1px 3px),
        var(--ink);
      font-family: Inter, Arial, Helvetica, sans-serif;
    }
    button, input, select { font: inherit; }
    button { color: inherit; }
    a { color: inherit; }
    .hero {
      min-height: 76vh;
      padding: 36px clamp(22px, 5vw, 84px) 56px;
      border-bottom: 1px solid var(--line);
      position: relative;
      overflow: hidden;
      display: grid;
      grid-template-columns: minmax(260px, .85fr) minmax(420px, 1.5fr);
      align-items: center;
      gap: clamp(28px, 6vw, 100px);
    }
    .brand { position: absolute; top: 25px; left: clamp(22px, 5vw, 84px); font-size: 12px; letter-spacing: .32em; }
    .hero-copy { max-width: 620px; z-index: 2; }
    .kicker, .eyebrow { color: var(--muted); text-transform: uppercase; letter-spacing: .18em; font-size: 10px; font-weight: 800; }
    h1 { margin: 14px 0 18px; font-family: Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif; font-size: clamp(56px, 9vw, 138px); font-weight: 900; line-height: .78; letter-spacing: -.04em; text-transform: uppercase; }
    h1 span { color: var(--red-bright); }
    .lede { max-width: 52ch; color: #bbb7af; line-height: 1.65; font-size: 15px; }
    .counts { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 28px; }
    .counts span { border: 1px solid var(--line); padding: 8px 11px; font-size: 11px; letter-spacing: .08em; text-transform: uppercase; }
    .hero-art {
      height: min(560px, 62vw);
      min-height: 380px;
      background: var(--paper);
      position: relative;
      overflow: hidden;
      box-shadow: 0 30px 90px rgba(0,0,0,.45);
    }
    .hero-art::after { content: ''; position: absolute; inset: 0; pointer-events: none; opacity: .15; background: repeating-linear-gradient(3deg, transparent 0 3px, #000 3px 4px); mix-blend-mode: multiply; }
    .hero-art .seated { position: absolute; width: 43%; height: 88%; left: 2%; bottom: 3%; object-fit: contain; z-index: 2; }
    .hero-art .walker { position: absolute; width: 24%; height: 48%; right: 7%; bottom: 14%; object-fit: contain; filter: contrast(1.4) grayscale(1); z-index: 2; }
    .hero-art .bar { position: absolute; width: 9px; height: 58%; left: 53%; top: 21%; background: #090909; z-index: 3; }
    .hero-art .paint { position: absolute; width: 23%; height: 24%; left: 18%; top: 20%; background: var(--red); clip-path: polygon(0 44%, 20% 26%, 31% 0, 43% 29%, 60% 8%, 73% 39%, 100% 47%, 72% 57%, 88% 85%, 55% 69%, 39% 100%, 31% 64%, 4% 77%, 18% 56%); transform: rotate(-10deg); opacity: .9; z-index: 1; }
    .hero-art .caption { position: absolute; right: 18px; top: 18px; color: #1b1b1b; writing-mode: vertical-rl; font-size: 9px; letter-spacing: .22em; text-transform: uppercase; z-index: 4; }
    .hero-art .hero-garment { width: 100%; height: 100%; object-fit: cover; display: block; }
    .toolbar {
      position: sticky;
      top: 0;
      z-index: 30;
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      align-items: center;
      padding: 13px clamp(16px, 4vw, 64px);
      background: rgba(12,12,12,.94);
      backdrop-filter: blur(14px);
      border-bottom: 1px solid var(--line);
    }
    .search, .family-select {
      border: 1px solid var(--line);
      background: #0d0d0d;
      color: var(--paper);
      min-height: 38px;
      padding: 0 12px;
      outline: none;
    }
    .search { min-width: min(330px, 100%); flex: 1; }
    .search:focus, .family-select:focus { border-color: var(--red-bright); }
    .filter, .action {
      min-height: 38px;
      padding: 0 12px;
      border: 1px solid var(--line);
      background: transparent;
      cursor: pointer;
      font-size: 10px;
      font-weight: 800;
      letter-spacing: .11em;
      text-transform: uppercase;
    }
    .filter:hover, .action:hover, .filter.active { background: var(--paper); color: var(--ink); }
    .action { border-color: rgba(142,36,43,.8); }
    .selected-counter { min-width: 70px; text-align: center; color: #d9aaa9; font-size: 11px; letter-spacing: .08em; text-transform: uppercase; }
    main { padding: 0 clamp(16px, 4vw, 64px) 100px; }
    .gallery-section { padding-top: 74px; }
    .section-head { display: flex; justify-content: space-between; gap: 24px; align-items: flex-end; margin-bottom: 24px; border-bottom: 1px solid var(--line); padding-bottom: 15px; }
    .section-head h2 { margin: 0; font-family: Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif; text-transform: uppercase; font-size: clamp(34px, 5vw, 74px); line-height: .88; letter-spacing: -.02em; }
    .section-head p { margin: 0; max-width: 48ch; color: var(--muted); line-height: 1.5; font-size: 12px; text-align: right; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 14px; }
    .silhouette-grid { grid-template-columns: repeat(2, minmax(260px, 460px)); }
    .concept-grid { grid-template-columns: repeat(auto-fill, minmax(270px, 1fr)); }
    .mockup-grid { grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); }
    .brief-grid { grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); }
    .card { position: relative; background: var(--panel); border: 1px solid var(--line); min-width: 0; transition: transform .18s ease, border-color .18s ease, opacity .2s ease; }
    .card:hover { transform: translateY(-3px); border-color: rgba(232,229,222,.4); }
    .card.hidden { display: none; }
    .card.is-picked { border-color: var(--red-bright); box-shadow: inset 0 0 0 1px var(--red-bright); }
    .pick { position: absolute; top: 9px; right: 9px; width: 34px; height: 34px; border-radius: 50%; border: 1px solid rgba(255,255,255,.25); background: rgba(8,8,8,.8); cursor: pointer; z-index: 5; display: grid; place-items: center; font-size: 22px; line-height: 1; }
    .pick:hover, .is-picked .pick { background: var(--red-bright); border-color: var(--red-bright); }
    .is-picked .pick { font-size: 0; }
    .is-picked .pick::after { content: '✓'; font-size: 16px; }
    .visual { width: 100%; border: 0; padding: 0; cursor: zoom-in; display: block; overflow: hidden; background: var(--paper); aspect-ratio: 4/5; }
    .visual img { width: 100%; height: 100%; object-fit: contain; transition: transform .28s ease; }
    .visual:hover img { transform: scale(1.025); }
    .transparent-grid { background-color: var(--paper); background-image: linear-gradient(45deg, rgba(0,0,0,.035) 25%, transparent 25%), linear-gradient(-45deg, rgba(0,0,0,.035) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, rgba(0,0,0,.035) 75%), linear-gradient(-45deg, transparent 75%, rgba(0,0,0,.035) 75%); background-size: 24px 24px; background-position: 0 0, 0 12px, 12px -12px, -12px 0; }
    .concept-visual { aspect-ratio: 1/1; background: #ddd9d1; }
    .mockup-visual { aspect-ratio: 1/1; background: #050505; }
    .ref-visual { aspect-ratio: 1/1; padding: 20px; }
    .card-copy { padding: 18px; }
    .card-copy.compact { padding: 14px; }
    .card h3 { margin: 7px 0 8px; text-transform: uppercase; font-size: 15px; line-height: 1.15; letter-spacing: .02em; }
    .card p { margin: 0; color: #a7a39c; font-size: 12px; line-height: 1.5; }
    .license { padding-top: 7px; font-size: 10px !important; }
    .license a { color: #d7b1b0; }
    .brief-card { min-height: 235px; overflow: hidden; padding-top: 44px; }
    .brief-card.is-visual::before { content: 'VISUEL'; position: absolute; top: 13px; left: 14px; color: #d7b1b0; font-size: 9px; letter-spacing: .15em; font-weight: 900; }
    .brief-number { position: absolute; right: -8px; bottom: -35px; color: rgba(255,255,255,.035); font: 160px/1 Impact, sans-serif; pointer-events: none; }
    .empty-state { display: none; padding: 60px 10px; color: var(--muted); text-align: center; border: 1px dashed var(--line); margin-top: 20px; }
    .lightbox { position: fixed; inset: 0; z-index: 100; display: none; place-items: center; padding: 30px; background: rgba(0,0,0,.92); }
    .lightbox.open { display: grid; }
    .lightbox img { max-width: min(1200px, 92vw); max-height: 84vh; object-fit: contain; background: var(--paper); box-shadow: 0 20px 80px #000; }
    .lightbox p { margin: 12px 0 0; text-align: center; color: #b9b5ad; font-size: 12px; letter-spacing: .1em; text-transform: uppercase; }
    .lightbox-close { position: fixed; top: 18px; right: 22px; width: 44px; height: 44px; border: 1px solid var(--line); background: #111; cursor: pointer; font-size: 22px; }
    .toast { position: fixed; left: 50%; bottom: 30px; z-index: 120; transform: translate(-50%, 30px); opacity: 0; pointer-events: none; background: var(--paper); color: var(--ink); padding: 12px 18px; font-size: 11px; letter-spacing: .08em; text-transform: uppercase; transition: .22s; }
    .toast.show { opacity: 1; transform: translate(-50%, 0); }
    footer { border-top: 1px solid var(--line); padding: 30px clamp(16px, 4vw, 64px); color: var(--muted); font-size: 11px; line-height: 1.6; }
    @media (max-width: 900px) {
      .hero { grid-template-columns: 1fr; padding-top: 90px; }
      .hero-art { height: 62vw; min-height: 330px; }
      .section-head { align-items: flex-start; flex-direction: column; }
      .section-head p { text-align: left; }
      .silhouette-grid { grid-template-columns: 1fr 1fr; }
    }
    @media (max-width: 590px) {
      .hero { padding-left: 18px; padding-right: 18px; min-height: auto; }
      .hero-art { height: 390px; }
      .toolbar { align-items: stretch; }
      .search, .family-select { width: 100%; }
      .silhouette-grid { grid-template-columns: 1fr; }
      .grid, .concept-grid, .brief-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
      .brief-grid { grid-template-columns: 1fr; }
      .card-copy, .card-copy.compact { padding: 11px; }
      .ref-visual { padding: 10px; }
      .card h3 { font-size: 12px; }
      .card p { font-size: 10px; }
    }
  </style>
</head>
<body>
  <header class="hero">
    <div class="brand">ONDINE / DESIGN LAB / 2026</div>
    <div class="hero-copy">
      <div class="kicker">V4 · silhouettes primitives · textile peint · scènes espacées</div>
      <h1>Final<br><span>Rehearsal</span></h1>
      <p class="lede">Direction corrigée : le vêtement est la toile. Deux ou trois silhouettes primitives racontent une action, le reste reste vide, et le bordeaux est physiquement projeté sur le textile. Aucun collage corecore décoratif, aucune composition de poster.</p>
      <div class="counts">
        <span>3 prototypes V4</span>
        <span>silhouettes brutes</span>
        <span>peinture textile</span>
        <span>zéro typographie</span>
        <span>archives V3 conservées</span>
      </div>
    </div>
    <div class="hero-art" aria-label="Aperçu de composition">
      <img class="hero-garment" src="assets/live-grammar-v4/prototypes/01-final-rehearsal-charcoal-ls.png" alt="Prototype FINAL REHEARSAL">
    </div>
  </header>

  <nav class="toolbar" aria-label="Filtres de la galerie">
    <input id="search" class="search" type="search" placeholder="Rechercher un titre, un numéro, rose, corbeau…">
    <button class="filter active" type="button" data-filter="all">Tout</button>
    <button class="filter" type="button" data-filter="live-grammar">3 prototypes V4</button>
    <button class="filter" type="button" data-filter="corecore">Archive V3</button>
    <button class="filter" type="button" data-filter="corecore-variation">Archive 100 V3</button>
    <button class="filter" type="button" data-filter="prototype">4 prototypes</button>
    <button class="filter" type="button" data-filter="mockup">100 direction photo</button>
    <button class="filter" type="button" data-filter="silhouette">Silhouettes</button>
    <button class="filter" type="button" data-filter="concept">Concepts</button>
    <button class="filter" type="button" data-filter="reference">Références</button>
    <button class="filter" type="button" data-filter="brief">50 idées</button>
    <button class="filter" type="button" data-filter="selected">Mes choix</button>
    <select id="family" class="family-select" aria-label="Famille de références">
      <option value="all">Toutes les familles</option>
      ${familyOptions}
    </select>
    <span id="selectedCounter" class="selected-counter">0 gardé</span>
    <button id="copyChoices" class="action" type="button">Copier mes choix</button>
  </nav>

  <main>
    <section class="gallery-section" data-section-kind="live-grammar">
      <div class="section-head">
        <h2>V4 · GRAMMAIRE BRUTE</h2>
        <p>La correction directe : micro-scènes primitives, tissu très présent, placements volontairement maladroits et peinture bordeaux appliquée au vêtement. Les références servent à comprendre la grammaire, jamais à recopier un dessin. <a href="assets/live-grammar-v4/planche-v4-3-prototypes.jpg" target="_blank">Ouvrir la planche V4</a>.</p>
      </div>
      <div class="grid concept-grid">${liveGrammarV4Cards}</div>
    </section>

    <section class="gallery-section" data-section-kind="corecore">
      <div class="section-head">
        <h2>Archive · LAST TAPE / 1994</h2>
        <p>Ancienne V3 conservée uniquement pour comparaison. Cette construction en collages était trop éloignée de la demande ; la direction active est désormais la V4 ci-dessus. <a href="assets/corecore-grunge-v3/planche-6-corecore-v3.jpg" target="_blank">Ouvrir l’archive V3</a>.</p>
      </div>
      <div class="grid concept-grid">${corecoreCards}</div>
    </section>

    <section class="gallery-section" data-section-kind="corecore-variation">
      <div class="section-head">
        <h2>Archive · 100 propositions V3</h2>
        <p>Ces cent montages restent consultables mais ne représentent plus la direction active. Ils sont archivés pour éviter de perdre le travail précédent. <a href="assets/corecore-grunge-v3/planche-100-corecore-v3.jpg" target="_blank">Ouvrir l’ancienne planche 10×10</a>.</p>
      </div>
      <div class="grid mockup-grid">${corecore100Cards}</div>
    </section>

    <section class="gallery-section" data-section-kind="prototype">
      <div class="section-head">
        <h2>4 prototypes premium</h2>
        <p>Les quatre pièces qui fixent la direction : photographies xerox, scènes dispersées, peinture physique et traitement one-of-one. Ce sont les références qualitatives de la nouvelle série.</p>
      </div>
      <div class="grid concept-grid">${prototypeCards}</div>
    </section>

    <section class="gallery-section" data-section-kind="mockup">
      <div class="section-head">
        <h2>Archive · 100 mockups photo</h2>
        <p>Les cent recherches précédentes sont conservées ici comme archive. La direction retenue et développée aujourd’hui est la capsule 1-bit LAST TAPE / 1994 ci-dessus. <a href="planche-100-live-direction-v2.jpg" target="_blank">Ouvrir l’ancienne planche</a>.</p>
      </div>
      <div class="grid mockup-grid">${mockupCards}</div>
    </section>

    <section class="gallery-section" data-section-kind="silhouette">
      <div class="section-head">
        <h2>Silhouettes originales</h2>
        <p>Deux postures propres et exploitables commercialement. Fond transparent, découpe noire, aucune arme ni personne identifiable.</p>
      </div>
      <div class="grid silhouette-grid">${silhouetteCards}</div>
    </section>

    <section class="gallery-section" data-section-kind="concept">
      <div class="section-head">
        <h2>12 concepts</h2>
        <p>Les premières compositions de collection, pensées comme des tests de placement, de vide et d’accent bordeaux.</p>
      </div>
      <div class="grid concept-grid">${conceptCards}</div>
    </section>

    <section class="gallery-section" data-section-kind="reference">
      <div class="section-head">
        <h2>100 références</h2>
        <p>Images Openclipart déclarées CC0 / domaine public. Les liens source sont conservés sous chaque carte.</p>
      </div>
      <div class="grid">${referenceCards}</div>
    </section>

    <section class="gallery-section" data-section-kind="brief">
      <div class="section-head">
        <h2>50 propositions</h2>
        <p>Des directions de design combinant les références numérotées. Les cartes marquées VISUEL correspondent aux douze rendus déjà produits.</p>
      </div>
      <div class="grid brief-grid">${proposalCards}</div>
    </section>

    <div id="emptyState" class="empty-state">Aucun résultat pour ces filtres.</div>
  </main>

  <footer>
    Galerie autonome : la direction active est la V4 GRAMMAIRE BRUTE. Ses trois prototypes et toutes les images nécessaires sont inclus dans le dossier <strong>assets</strong>. Les silhouettes sont anonymes et les compositions sont des créations originales réalisées pour Ondine. Les V3 précédentes restent consultables comme archives. Cette page mémorise uniquement vos choix dans le stockage local de votre navigateur.
  </footer>

  <div id="lightbox" class="lightbox" role="dialog" aria-modal="true" aria-label="Agrandissement">
    <button class="lightbox-close" type="button" aria-label="Fermer">×</button>
    <div><img id="lightboxImage" alt="Agrandissement"><p id="lightboxCaption"></p></div>
  </div>
  <div id="toast" class="toast" role="status"></div>

  <script>
    (() => {
      const storageKey = 'ondine-gallery-choices-v1';
      let selected = new Set(JSON.parse(localStorage.getItem(storageKey) || '[]'));
      let activeFilter = 'all';
      const items = [...document.querySelectorAll('.item')];
      const sections = [...document.querySelectorAll('[data-section-kind]')];
      const search = document.getElementById('search');
      const family = document.getElementById('family');
      const counter = document.getElementById('selectedCounter');
      const toast = document.getElementById('toast');

      const normalize = value => value.toLowerCase().normalize('NFD').replace(/[\\u0300-\\u036f]/g, '');

      function showToast(message) {
        toast.textContent = message;
        toast.classList.add('show');
        clearTimeout(showToast.timer);
        showToast.timer = setTimeout(() => toast.classList.remove('show'), 1800);
      }

      function syncSelection() {
        document.querySelectorAll('[data-pick]').forEach(button => {
          button.closest('.item').classList.toggle('is-picked', selected.has(button.dataset.pick));
        });
        counter.textContent = selected.size + (selected.size > 1 ? ' gardés' : ' gardé');
        localStorage.setItem(storageKey, JSON.stringify([...selected]));
      }

      function applyFilters() {
        const term = normalize(search.value.trim());
        const familyValue = family.value;
        let visibleCount = 0;
        items.forEach(item => {
          const kind = item.dataset.kind;
          const pickId = item.querySelector('[data-pick]').dataset.pick;
          const matchesFilter = activeFilter === 'all' || kind === activeFilter || (activeFilter === 'selected' && selected.has(pickId));
          const matchesFamily = familyValue === 'all' || item.dataset.family === familyValue;
          const matchesSearch = !term || normalize(item.dataset.search || '').includes(term);
          const visible = matchesFilter && matchesFamily && matchesSearch;
          item.classList.toggle('hidden', !visible);
          if (visible) visibleCount++;
        });
        sections.forEach(section => {
          section.style.display = section.querySelector('.item:not(.hidden)') ? '' : 'none';
        });
        document.getElementById('emptyState').style.display = visibleCount ? 'none' : 'block';
      }

      document.querySelectorAll('[data-pick]').forEach(button => {
        button.addEventListener('click', event => {
          event.stopPropagation();
          const id = button.dataset.pick;
          selected.has(id) ? selected.delete(id) : selected.add(id);
          syncSelection();
          applyFilters();
        });
      });

      document.querySelectorAll('[data-filter]').forEach(button => {
        button.addEventListener('click', () => {
          document.querySelectorAll('[data-filter]').forEach(item => item.classList.remove('active'));
          button.classList.add('active');
          activeFilter = button.dataset.filter;
          applyFilters();
        });
      });

      search.addEventListener('input', applyFilters);
      family.addEventListener('change', applyFilters);

      document.getElementById('copyChoices').addEventListener('click', async () => {
        const labels = [...document.querySelectorAll('[data-pick]')]
          .filter(button => selected.has(button.dataset.pick))
          .map(button => button.dataset.label);
        const text = labels.length ? labels.join('\\n') : 'Aucun choix enregistré.';
        try {
          await navigator.clipboard.writeText(text);
        } catch {
          const area = document.createElement('textarea');
          area.value = text;
          document.body.appendChild(area);
          area.select();
          document.execCommand('copy');
          area.remove();
        }
        showToast(labels.length ? 'Choix copiés' : 'Aucun choix à copier');
      });

      const lightbox = document.getElementById('lightbox');
      const lightboxImage = document.getElementById('lightboxImage');
      const lightboxCaption = document.getElementById('lightboxCaption');
      document.querySelectorAll('[data-full]').forEach(button => {
        button.addEventListener('click', () => {
          lightboxImage.src = button.dataset.full;
          lightboxCaption.textContent = button.dataset.caption || '';
          lightbox.classList.add('open');
        });
      });
      function closeLightbox() { lightbox.classList.remove('open'); }
      lightbox.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
      lightbox.addEventListener('click', event => { if (event.target === lightbox) closeLightbox(); });
      document.addEventListener('keydown', event => { if (event.key === 'Escape') closeLightbox(); });

      syncSelection();
      applyFilters();
    })();
  </script>
</body>
</html>`;

fs.writeFileSync(path.join(outRoot, 'index.html'), html, 'utf8');

const promptText = `# Silhouettes originales — note de génération\n\nMode : création d’images à partir d’un prompt, sans image de référence.\n\n## S01 — Hunched Chair\n\nAnonymous adult seated on a simple rolling office chair, three-quarter side profile, deeply hunched, head bowed, elbows on thighs, hands loose between knees; solid matte-black photographic cutout, transparent background, subtle xerox distress; no weapon, injury, text, logo, celebrity or known artwork.\n\n## S02 — Face in Hands\n\nAnonymous adult seated sideways on a plain armless chair, strict side profile, torso folded forward, elbows on thighs, both hands covering face; pure solid black screen-print silhouette, transparent background; no weapon, injury, text, logo, celebrity or known artwork.\n`;
fs.writeFileSync(path.join(outRoot, 'PROMPTS-SILHOUETTES.md'), promptText, 'utf8');

const desktopAssets = path.join(desktopRoot, 'propositions-live2die/assets');
ensureDir(desktopAssets);
fs.cpSync(path.join(outRoot, 'assets'), desktopAssets, { recursive: true });
const desktopHtml = html
  .replaceAll('src="assets/', 'src="propositions-live2die/assets/')
  .replaceAll('data-full="assets/', 'data-full="propositions-live2die/assets/')
  .replaceAll('href="assets/', 'href="propositions-live2die/assets/');
fs.writeFileSync(path.join(desktopRoot, 'propositions-live2die.html'), desktopHtml, 'utf8');
fs.writeFileSync(path.join(desktopRoot, 'propositions-live2die/PROMPTS-SILHOUETTES.md'), promptText, 'utf8');
const corecorePromptPath = path.join(outRoot, 'PROMPTS-CORECORE-V3.md');
if (fs.existsSync(corecorePromptPath)) {
  copyFile(corecorePromptPath, path.join(desktopRoot, 'propositions-live2die/PROMPTS-CORECORE-V3.md'));
}
const liveGrammarPromptPath = path.join(outRoot, 'PROMPTS-LIVE-GRAMMAR-V4.md');
if (fs.existsSync(liveGrammarPromptPath)) {
  copyFile(liveGrammarPromptPath, path.join(desktopRoot, 'propositions-live2die/PROMPTS-LIVE-GRAMMAR-V4.md'));
}

console.log(JSON.stringify({
  outputHtml: path.join(outRoot, 'index.html'),
  desktopHtml: path.join(desktopRoot, 'propositions-live2die.html'),
  silhouettes: generatedSilhouettes.length,
  liveGrammarV4: liveGrammarV4.length,
  corecoreV3: corecoreV3.length,
  corecore100: corecore100.length,
  concepts: concepts.length,
  references: manifest.length,
  proposals: proposals.length
}, null, 2));
