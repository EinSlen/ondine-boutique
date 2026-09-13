/**
 * L'encre dead2me : le socle commun à tous les moteurs de visuels.
 *
 * Tout ce qui fait le style de la marque est ici, et nulle part ailleurs, pour que les
 * pièces à phrase seule et les pièces à silhouette aient exactement la même main.
 *
 * Ce que ce module tient :
 *   - le hasard reproductible, pour qu'un numéro de pièce redonne toujours la même image
 *   - le filtre d'encre : l'encre est tordue puis rongée, sinon le texte lit comme du
 *     vecteur propre, défaut qui avait fait rejeter les premières séries
 *   - les coulures, qui doivent partir du bas des lettres et jamais flotter dans le vide
 *   - l'ajustement du texte MESURÉ dans la page, parce qu'estimer une largeur au nombre de
 *     caractères ne marche pas : la fonte réellement chargée n'est jamais celle qu'on croit
 *
 * Indépendance de la résolution : toutes les fréquences de bruit sont divisées par
 * l'échelle. Sans ça, un fichier d'impression à 3600 px aurait un grain quatre fois plus
 * fin que la planche à 900 px, et ne ressemblerait plus à ce qui a été validé.
 */

/** Générateur reproductible. Deux appels avec la même graine donnent la même image. */
export const alea = (graine) => {
  let a = graine >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

/** Les fontes présentes sur Windows, choisies pour ce que chacune raconte. */
export const FONTES = {
  massue: "Impact,'Franklin Gothic Heavy','Arial Black',sans-serif",
  condense: "Haettenschweiler,'Arial Narrow',Impact,sans-serif",
  serif: "'Times New Roman',Georgia,serif",
  main: "'Ink Free','Segoe Script','Comic Sans MS',cursive",
  mono: "Consolas,'Courier New',monospace",
};

export const PALETTES = [
  { fond: '#0d0d0f', encre: '#ece7dd', accent: '#8f1116', nom: 'sombre' },
  { fond: '#e9e4d9', encre: '#141210', accent: '#7c0d11', nom: 'os' },
  { fond: '#12100e', encre: '#c9c2b4', accent: '#6e0c10', nom: 'terre' },
  { fond: '#dcd6c8', encre: '#1a1714', accent: '#5d1a14', nom: 'lin' },
];

/**
 * Tord l'encre puis la ronge. `ech` est le rapport entre la largeur demandée et les 900 px
 * de la planche de référence : les fréquences sont divisées par lui pour que le grain
 * garde la même taille apparente à toutes les résolutions.
 */
export const filtres = (r, W, ech = 1) => {
  const s1 = Math.floor(r() * 9000);
  const s2 = Math.floor(r() * 9000);
  const f = (v) => (v / ech).toFixed(5);
  return `<defs>
    <filter id="encre" x="-25%" y="-25%" width="150%" height="150%">
      <feTurbulence type="fractalNoise" baseFrequency="${f(0.011)} ${f(0.028)}" numOctaves="3" seed="${s1}" result="w"/>
      <feDisplacementMap in="SourceGraphic" in2="w" scale="${(W * 0.007).toFixed(1)}" xChannelSelector="R" yChannelSelector="G" result="tordu"/>
      <feTurbulence type="fractalNoise" baseFrequency="${f(0.62)}" numOctaves="3" seed="${s2}" result="g"/>
      <feColorMatrix in="g" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0 0 0 -0.44" result="troue"/>
      <feComposite in="tordu" in2="troue" operator="out"/>
    </filter>
    <filter id="encreDouce" x="-20%" y="-20%" width="140%" height="140%">
      <feTurbulence type="fractalNoise" baseFrequency="${f(0.015)} ${f(0.03)}" numOctaves="2" seed="${s1 + 7}" result="w"/>
      <feDisplacementMap in="SourceGraphic" in2="w" scale="${(W * 0.004).toFixed(1)}" xChannelSelector="R" yChannelSelector="G" result="tordu"/>
      <feTurbulence type="fractalNoise" baseFrequency="${f(0.8)}" numOctaves="2" seed="${s2 + 13}" result="g"/>
      <feColorMatrix in="g" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0 0 0 -0.6" result="troue"/>
      <feComposite in="tordu" in2="troue" operator="out"/>
    </filter>
    <filter id="grain">
      <feTurbulence type="fractalNoise" baseFrequency="${f(0.9)}" numOctaves="4" seed="${s2}"/>
      <feColorMatrix type="saturate" values="0"/>
    </filter>
  </defs>`;
};

/**
 * Facteur de surface sûre. Sur un sac, une chaussure ou un vêtement imprimé intégralement,
 * les bords de la zone d'impression se replient et disparaissent : une phrase qui touche le
 * bord arrive coupée sur l'objet. Ce facteur resserre toutes les largeurs maximales.
 */
export let SURETE = 1;
export const surete = (v) => {
  SURETE = v;
};

/**
 * Une ligne de texte à l'encre sale. `tient` donne la largeur maximale et `groupe` lie
 * les lignes d'un même bloc, pour que l'ajustement en page les réduise ensemble.
 */
export const mot = (x, y, texte, taille, fonte, couleur, opts = {}) => {
  const {
    ancre = 'middle',
    rot = 0,
    esp = 0,
    doux = false,
    opacite = 1,
    italique = false,
    poids = 0,
    tient = 0,
    groupe = '',
  } = opts;
  return (
    `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" text-anchor="${ancre}"` +
    ` font-family="${fonte}" font-size="${taille.toFixed(1)}" fill="${couleur}"` +
    (esp ? ` letter-spacing="${esp.toFixed(2)}"` : '') +
    (italique ? ' font-style="italic"' : '') +
    (poids ? ` font-weight="${poids}"` : '') +
    (tient ? ` data-tient="${(tient * SURETE).toFixed(0)}"` : '') +
    (groupe ? ` data-groupe="${groupe}"` : '') +
    (opacite < 1 ? ` opacity="${opacite.toFixed(2)}"` : '') +
    ` filter="url(#${doux ? 'encreDouce' : 'encre'})"` +
    ` transform="rotate(${rot.toFixed(2)} ${x.toFixed(1)} ${y.toFixed(1)})">` +
    texte.replace(/&/g, '&amp;').replace(/</g, '&lt;') +
    '</text>'
  );
};

/**
 * Une coulure : un filet d'encre long et fin, qui part du bas d'une lettre et dérive en
 * descendant, avec une goutte au bout. La version courte et large lisait comme une flèche,
 * c'est le rapport longueur sur largeur qui fait la goutte.
 */
export const coulure = (r, x, y, large, couleur) => {
  const long = large * (9 + r() * 18);
  const derive = (r() - 0.5) * large * 3;
  const pas = 10;
  const g = [];
  const d2 = [];
  for (let i = 0; i <= pas; i++) {
    const t = i / pas;
    const cx = x + derive * t * t + Math.sin(t * 3.4 + r()) * large * 0.2;
    const w = large * (1 - 0.5 * t) * (0.82 + r() * 0.3);
    g.push(`${(cx - w / 2).toFixed(1)} ${(y + long * t).toFixed(1)}`);
    d2.push(`${(cx + w / 2).toFixed(1)} ${(y + long * t).toFixed(1)}`);
  }
  let s = `<path d="M ${g.join(' L ')} L ${d2.reverse().join(' L ')} Z" fill="${couleur}" opacity="0.93"/>`;
  const bout = x + derive;
  s += `<ellipse cx="${bout.toFixed(1)}" cy="${(y + long).toFixed(1)}" rx="${(large * 0.42).toFixed(1)}" ry="${(large * 0.5).toFixed(1)}" fill="${couleur}" opacity="0.93"/>`;
  if (r() > 0.55) {
    s += `<ellipse cx="${(bout + (r() - 0.5) * large * 2).toFixed(1)}" cy="${(y + long * (1.18 + r() * 0.35)).toFixed(1)}" rx="${(large * 0.28).toFixed(1)}" ry="${(large * 0.33).toFixed(1)}" fill="${couleur}" opacity="0.8"/>`;
  }
  return s;
};

/**
 * Sème des coulures le long du bas d'une ligne de texte. Une coulure isolée au milieu du
 * vide lit comme un pictogramme ; accrochée sous les lettres, elle lit comme de la peinture.
 * `ecart` réserve le centre, pour ne pas traverser une ligne de texte placée en dessous.
 */
export const coulures = (r, xCentre, yBas, largeurTexte, nb, large, couleur, ecart = 0) => {
  let s = '';
  for (let k = 0; k < nb; k++) {
    const t = ecart + r() * (0.5 - ecart);
    const x = xCentre + (r() > 0.5 ? t : -t) * largeurTexte * 2;
    s += coulure(r, x, yBas - large * (0.5 + r() * 2), large * (0.6 + r() * 0.8), couleur);
  }
  return s;
};

/** La barre qui raye la phrase, tremblée comme un feutre. */
export const rature = (r, x1, x2, y, ep, couleur) => {
  const n = 9;
  let d = '';
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    d += `${i === 0 ? 'M' : 'L'} ${(x1 + (x2 - x1) * t).toFixed(1)} ${(y + (r() - 0.5) * ep * 2.4).toFixed(1)} `;
  }
  return `<path d="${d}" fill="none" stroke="${couleur}" stroke-width="${ep.toFixed(1)}" stroke-linecap="round" opacity="0.95"/>`;
};

/** Largeur approximative d'une ligne, seulement pour accrocher les coulures. */
export const largeur = (texte, taille, fonte) => {
  const ratio =
    fonte === FONTES.massue ? 0.5 : fonte === FONTES.condense ? 0.58 : fonte === FONTES.mono ? 0.6 : 0.45;
  return texte.length * taille * ratio;
};

/** Découpe la phrase en lignes équilibrées, sans couper les mots. */
export const decoupe = (mots, nb) => {
  const out = Array.from({ length: nb }, () => []);
  const cible = Math.ceil(mots.join(' ').length / nb);
  let i = 0;
  for (const m of mots) {
    if (out[i].join(' ').length >= cible && i < nb - 1) i++;
    out[i].push(m);
  }
  return out.filter((l) => l.length).map((l) => l.join(' '));
};

export const lignes = (texte, max) => {
  const mots = texte.split(' ');
  if (mots.length <= max) return mots.length <= 2 ? [texte] : decoupe(mots, Math.min(max, 2));
  return decoupe(mots, max);
};

/**
 * Tourne DANS le navigateur, une fois la page rendue. Estimer la largeur d'un texte à
 * partir du nombre de caractères ne marche pas : la fonte réellement chargée n'est jamais
 * celle qu'on croit, et le texte débordait du cadre. Ici on la mesure et on réduit.
 *
 * Les lignes d'un même bloc partagent un groupe et subissent la même réduction, sinon
 * chaque ligne aurait sa propre taille et le bloc perdrait son aplomb.
 */
export const ajusterEnPage = () => {
  const els = Array.from(document.querySelectorAll('text[data-tient]'));
  els.forEach((t, i) => {
    if (!t.dataset.groupe) t.dataset.groupe = `seul${i}`;
  });
  const facteurs = new Map();
  for (const t of els) {
    const max = parseFloat(t.dataset.tient);
    const lu = t.getComputedTextLength();
    const f = lu > max ? max / lu : 1;
    const k = t.dataset.groupe;
    facteurs.set(k, Math.min(facteurs.has(k) ? facteurs.get(k) : 1, f));
  }
  for (const t of els) {
    const f = facteurs.get(t.dataset.groupe);
    if (f >= 0.999) continue;
    t.setAttribute('font-size', parseFloat(t.getAttribute('font-size')) * f);
    const esp = t.getAttribute('letter-spacing');
    if (esp) t.setAttribute('letter-spacing', parseFloat(esp) * f);
  }
};


/**
 * Une tache de sang : un noyau irrégulier, des gouttelettes projetées autour, et parfois un
 * filet qui part vers le bas.
 *
 * Le dosage est le sujet. Une première série en avait mis partout et Valentin l'a rejetée
 * pour ça. Ici c'est une à trois taches par pièce, jamais plus, et jamais sur le texte.
 */
export const sang = (r, x, y, taille, couleur) => {
  let d = '';
  for (let i = 0; i <= 13; i++) {
    const a = (i / 13) * Math.PI * 2;
    const rr = taille * (0.72 + r() * 0.46);
    d += `${i === 0 ? 'M' : 'L'} ${(x + Math.cos(a) * rr).toFixed(1)} ${(y + Math.sin(a) * rr * 0.85).toFixed(1)} `;
  }
  let s = `<path d="${d}Z" fill="${couleur}" opacity="${(0.86 + r() * 0.14).toFixed(2)}"/>`;
  const n = 5 + Math.floor(r() * 9);
  for (let i = 0; i < n; i++) {
    const a = r() * Math.PI * 2;
    const dist = taille * (1.2 + r() * 3.1);
    const g = taille * (0.06 + r() * 0.17);
    s += `<ellipse cx="${(x + Math.cos(a) * dist).toFixed(1)}" cy="${(y + Math.sin(a) * dist * 0.9).toFixed(1)}" rx="${g.toFixed(1)}" ry="${(g * (1 + r() * 0.5)).toFixed(1)}" fill="${couleur}" opacity="${(0.6 + r() * 0.4).toFixed(2)}"/>`;
  }
  if (r() > 0.5) s += coulure(r, x + (r() - 0.5) * taille, y + taille * 0.6, taille * 0.2, couleur);
  return s;
};

/**
 * Sème une à trois taches en évitant la bande de texte, dont les bornes sont passées en
 * fractions de la hauteur. Une tache posée sur une phrase la rend illisible.
 */
export const taches = (r, W, H, p, evite = [0.6, 0.9]) => {
  if (r() > 0.65) return '';
  const nb = 1 + Math.floor(r() * 2.3);
  let s = '';
  for (let k = 0; k < nb; k++) {
    let y = 0;
    for (let essai = 0; essai < 8; essai++) {
      y = 0.08 + r() * 0.84;
      if (y < evite[0] || y > evite[1]) break;
    }
    s += sang(r, W * (0.08 + r() * 0.84), H * y, W * (0.018 + r() * 0.03), p.accent);
  }
  return s;
};

/** Les phrases de la marque, avec leur usage publicitaire et leur scène. */
export const PHRASES = [
  { t: "don't wait up", pub: false, role: 'court' },
  { t: 'i left first', pub: true, role: 'court' },
  { t: 'i still park there', pub: true, role: 'attend' },
  { t: 'we said forever', pub: true, role: 'couple' },
  { t: "she isn't coming", pub: true, role: 'attend' },
  { t: 'i waited anyway', pub: true, role: 'attend' },
  { t: 'nothing after you', pub: false, role: 'assis' },
  { t: 'you moved on fast', pub: false, role: 'court' },
  { t: 'your side is cold', pub: false, role: 'couple' },
  { t: 'she took the dog', pub: true, role: 'court' },
  { t: 'last one to leave', pub: true, role: 'assis' },
  { t: 'i answered every time', pub: true, role: 'attend' },
  { t: 'call ended 4:12', pub: true, role: 'assis' },
  { t: 'still your number', pub: false, role: 'attend' },
  { t: 'i deleted nothing', pub: true, role: 'assis' },
  { t: 'typing, then nothing', pub: true, role: 'assis' },
  { t: 'no one noticed', pub: true, role: 'assis' },
  { t: 'everyone left fine', pub: true, role: 'court' },
  { t: 'i peaked already', pub: true, role: 'assis' },
  { t: 'nothing worked out', pub: true, role: 'assis' },
  { t: 'not doing great', pub: true, role: 'assis' },
  { t: 'same room, no one', pub: true, role: 'couple' },
  { t: 'grew up alone', pub: true, role: 'attend' },
  { t: 'wrong one stayed', pub: true, role: 'couple' },
  { t: 'you never called', pub: false, role: 'attend' },
  { t: 'she blocked me', pub: true, role: 'court' },
  { t: 'i kept the receipts', pub: true, role: 'assis' },
  { t: 'no one asked', pub: true, role: 'assis' },
  { t: 'still up at four', pub: true, role: 'attend' },
  { t: 'we had a plan', pub: true, role: 'couple' },
  { t: 'you had someone', pub: false, role: 'couple' },
  { t: 'nothing since june', pub: true, role: 'attend' },
  { t: 'she kept the ring', pub: true, role: 'couple' },
  { t: 'i drove past twice', pub: true, role: 'attend' },
  { t: 'left the light on', pub: true, role: 'attend' },
  { t: 'i still say we', pub: true, role: 'couple' },
  { t: 'never made the list', pub: true, role: 'assis' },
  { t: 'always the backup', pub: true, role: 'assis' },
  { t: 'i was the practice', pub: true, role: 'couple' },
  { t: 'you got better', pub: false, role: 'court' },
  { t: 'i got worse', pub: true, role: 'assis' },
  { t: 'nobody clapped', pub: true, role: 'assis' },
  { t: 'came home to nothing', pub: true, role: 'attend' },
  { t: 'ate alone again', pub: true, role: 'assis' },
  { t: 'they all graduated', pub: true, role: 'assis' },
  { t: 'still in my room', pub: true, role: 'assis' },
  { t: 'i peaked at nineteen', pub: true, role: 'assis' },
  { t: 'nothing to report', pub: true, role: 'assis' },
  { t: 'i am the ex', pub: true, role: 'couple' },
  { t: 'you kept the friends', pub: false, role: 'couple' },
  { t: 'i moved out first', pub: true, role: 'court' },
  { t: 'the dog forgot me', pub: true, role: 'assis' },
  { t: 'call me when', pub: true, role: 'attend' },
  { t: 'seen, no reply', pub: true, role: 'attend' },
  { t: 'i waited till two', pub: true, role: 'attend' },
  { t: 'you looked happy', pub: false, role: 'couple' },
  { t: 'everyone knew but me', pub: true, role: 'assis' },
  { t: 'last to know', pub: true, role: 'assis' },
  { t: 'i unpacked nothing', pub: true, role: 'court' },
  { t: 'she moved in june', pub: true, role: 'court' },
];

/**
 * Force le chargement des fontes avant la première mesure.
 *
 * Sans ça, la toute première image d'une série sortait différemment d'une passe à l'autre :
 * au premier rendu la fonte demandée n'était pas encore résolue, `getComputedTextLength`
 * mesurait la fonte de repli, et l'ajustement se calait sur la mauvaise largeur.
 */
export const prechauffer = async (page) => {
  const echantillon = Object.values(FONTES)
    .map((f) => `<div style="font-family:${f};font-size:48px">dead2me 0123 don't</div>`)
    .join('');
  await page.setContent(`<body>${echantillon}</body>`, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
};

/**
 * Tourne DANS la page : rend la boîte du dessin, marge comprise.
 *
 * `getBBox` ne mesure que la géométrie et ignore ce que les filtres débordent, d'où la
 * marge. Elle sert au recadrage des fichiers d'impression : une image cadrée comme une
 * affiche donne, sur un vêtement, un dessin perdu au milieu du tissu.
 */
export const recadrer = (marge) => {
  const g = document.getElementById('contenu');
  const b = g.getBBox();
  const svg = g.ownerSVGElement;
  const W = svg.width.baseVal.value;
  const H = svg.height.baseVal.value;
  const x = Math.max(0, b.x - marge);
  const y = Math.max(0, b.y - marge);
  return {
    x: Math.round(x),
    y: Math.round(y),
    width: Math.round(Math.min(W - x, b.width + marge * 2)),
    height: Math.round(Math.min(H - y, b.height + marge * 2)),
  };
};
