/**
 * Monte une pièce dans l'éditeur Printful, presque tout seul.
 *
 * Ce qu'il fait, et qui marche : ouvre le blank, entre dans l'éditeur, choisit la technique
 * et la couleur, aligne les tailles sur celles de la fiche Shopify, et téléverse tous les
 * fichiers de la pièce dans la bibliothèque Printful.
 *
 * Ce qu'il laisse à la main, après essai : poser chaque fichier sur sa zone. La fenêtre des
 * fichiers change d'état selon qu'on clique une vignette ou sa case, et un script qui insiste
 * finit par décocher des tailles ou sélectionner six fichiers au lieu d'un. Deux clics par
 * zone valent mieux qu'une pièce montée de travers.
 *
 * Il ne clique jamais sur « Publish ».
 *
 * Le relevé qui a servi à l'écrire est dans production/exploration (11-editeur.png).
 *
 * Usage :
 *   node printful-auto.mjs                    monte la première pièce du plan
 *   node printful-auto.mjs --piece 4          monte la quatrième
 *   node printful-auto.mjs --sans-manches     saute les éclaboussures de manches
 */

import { existsSync } from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import { fileURLToPath } from 'node:url';

import { ouvrir, premierOnglet } from './edge.mjs';

const ICI = path.dirname(fileURLToPath(import.meta.url));
const PRODUCTION = path.join(ICI, '..', 'production');
const DOSSIERS = ['01_GRAPHIC_PIECES', '02_LOGO_ESSENTIALS', '03_SLEEVES_SPLATTERS', '04_BOTTOMS_AOP'];

const cheminFichier = (nom) => {
  for (const d of DOSSIERS) {
    const essai = path.join(PRODUCTION, d, nom);
    if (existsSync(essai)) return essai;
  }
  return null;
};

/**
 * Les zones portent le nom des onglets de l'éditeur, relevés dans leur interface :
 * Front, Back, Right sleeve, Left sleeve, Outside label, Inside label.
 */
const PIECES = [
  {
    nom: 'SPLIT FIGURES ZIP',
    url: 'https://www.printful.com/dashboard/custom/mens/hoodies-sweatshirts/unisex-heavy-blend-zip-hoodie-gildan-18600',
    couleur: 'Black',
    tailles: ['S', 'M', 'L', 'XL', '2XL'],
    zones: [
      ['Front', '01_split_figures_black_zip_print.png'],
      ['Left sleeve', 'BURGUNDY_SPLATTER_LONG_SLEEVE_LEFT.png'],
      ['Right sleeve', 'BURGUNDY_SPLATTER_LONG_SLEEVE_RIGHT.png'],
    ],
  },
  {
    nom: 'RUN AWAY TEE',
    url: 'https://www.printful.com/dashboard/custom/mens/t-shirts/mens-box-tee-cotton-heritage-mc1087',
    couleur: 'White',
    tailles: ['S', 'M', 'L', 'XL', '2XL'],
    zones: [['Front', '05_run_away_white_tee_print.png']],
  },
  {
    nom: 'SEATED FIGURE ZIP',
    url: 'https://www.printful.com/dashboard/custom/mens/hoodies-sweatshirts/unisex-heavy-blend-zip-hoodie-gildan-18600',
    couleur: 'Sport Grey',
    tailles: ['S', 'M', 'L', 'XL', '2XL'],
    zones: [
      ['Front', '02_seated_figure_grey_zip_print.png'],
      ['Left sleeve', 'BURGUNDY_SPLATTER_LONG_SLEEVE_LEFT.png'],
      ['Right sleeve', 'BURGUNDY_SPLATTER_LONG_SLEEVE_RIGHT.png'],
    ],
  },
  {
    nom: 'TABLE ALONE ZIP',
    url: 'https://www.printful.com/dashboard/custom/mens/hoodies-sweatshirts/unisex-heavy-blend-zip-hoodie-gildan-18600',
    couleur: 'Sport Grey',
    tailles: ['S', 'M', 'L', 'XL', '2XL'],
    zones: [
      ['Front', '03_table_alone_grey_zip_print.png'],
      ['Left sleeve', 'BURGUNDY_SPLATTER_LONG_SLEEVE_LEFT.png'],
      ['Right sleeve', 'BURGUNDY_SPLATTER_LONG_SLEEVE_RIGHT.png'],
    ],
  },
  {
    nom: 'AFTERMATH ZIP',
    url: 'https://www.printful.com/dashboard/custom/mens/hoodies-sweatshirts/unisex-heavy-blend-zip-hoodie-gildan-18600',
    couleur: 'Sport Grey',
    tailles: ['S', 'M', 'L', 'XL', '2XL'],
    zones: [
      ['Front', '04_aftermath_grey_zip_print.png'],
      ['Left sleeve', 'BURGUNDY_SPLATTER_LONG_SLEEVE_LEFT.png'],
      ['Right sleeve', 'BURGUNDY_SPLATTER_LONG_SLEEVE_RIGHT.png'],
    ],
  },
  {
    nom: 'D2M ZIP HOODIE',
    url: 'https://www.printful.com/dashboard/custom/mens/hoodies-sweatshirts/unisex-heavy-blend-zip-hoodie-gildan-18600',
    couleur: 'Black',
    tailles: ['S', 'M', 'L', 'XL', '2XL'],
    zones: [
      ['Front', 'D2M_MINI_CHEST_1800px.png'],
      ['Back', 'D2M_PRIMARY_LOGO_4500px.png'],
      ['Left sleeve', 'BURGUNDY_SPLATTER_LONG_SLEEVE_LEFT.png'],
      ['Right sleeve', 'BURGUNDY_SPLATTER_LONG_SLEEVE_RIGHT.png'],
    ],
  },
  {
    nom: 'D2M HOODIE',
    url: 'https://www.printful.com/dashboard/custom/mens/hoodies/unisex-heavy-blend-hoodie-gildan-18500',
    couleur: 'Black',
    tailles: ['S', 'M', 'L', 'XL', '2XL'],
    zones: [
      ['Front', 'D2M_MINI_CHEST_1800px.png'],
      ['Back', 'D2M_PRIMARY_LOGO_4500px.png'],
      ['Left sleeve', 'BURGUNDY_SPLATTER_LONG_SLEEVE_LEFT.png'],
      ['Right sleeve', 'BURGUNDY_SPLATTER_LONG_SLEEVE_RIGHT.png'],
    ],
  },
  {
    nom: 'D2M HEAVYWEIGHT TEE',
    url: 'https://www.printful.com/dashboard/custom/mens/t-shirts/mens-box-tee-cotton-heritage-mc1087',
    couleur: 'Black',
    tailles: ['S', 'M', 'L', 'XL', '2XL'],
    zones: [['Front', 'D2M_PRIMARY_LOGO_4500px.png']],
  },
  {
    nom: 'D2M ESSENTIALS TEE',
    url: 'https://www.printful.com/dashboard/custom/mens/t-shirts/mens-box-tee-cotton-heritage-mc1087',
    couleur: 'Black',
    tailles: ['S', 'M', 'L', 'XL', '2XL'],
    zones: [
      ['Front', 'D2M_MINI_CHEST_1800px.png'],
      ['Back', 'D2M_PRIMARY_LOGO_4500px.png'],
    ],
  },
];

const arg = (n) => {
  const i = process.argv.indexOf(`--${n}`);
  return i > -1 ? process.argv[i + 1] : null;
};

const SANS_MANCHES = process.argv.includes('--sans-manches');
const rang = Number(arg('piece') || 1);
const piece = PIECES[rang - 1];
if (!piece) {
  console.error(`Il n'y a que ${PIECES.length} pièces au plan.`);
  process.exit(1);
}

const attendre = (question) =>
  new Promise((ok) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(question, (r) => {
      rl.close();
      ok(r.trim().toLowerCase());
    });
  });

const pause = (ms) => new Promise((r) => setTimeout(r, ms));

const { nav } = await ouvrir({ lancerSiAbsent: false });
const page = await premierOnglet(nav);

// sans cette réponse, une confirmation « voulez-vous quitter » fige tout le pilotage
page.on('dialog', (d) => d.accept().catch(() => {}));

/** Trace l'étape en cours : sans elle, un blocage ressemble à un script mort. */
const etape = (t) => console.log(`[${new Date().toLocaleTimeString('fr-FR')}] ${t}`);

/** Clique le premier élément dont le texte correspond, et dit s'il l'a trouvé. */
const cliquerTexte = async (motif, selecteurs = 'button, a, [role="button"], [role="tab"], label') =>
  page.evaluate(
    (m, sel) => {
      const re = new RegExp(m, 'i');
      const cible = [...document.querySelectorAll(sel)].find((el) => {
        const t = (el.innerText || el.getAttribute('aria-label') || '').trim();
        return t && re.test(t) && el.getBoundingClientRect().width > 4;
      });
      if (!cible) return false;
      cible.click();
      return true;
    },
    motif,
    selecteurs,
  );

console.log(`\n${piece.nom}`);
console.log(`  blank : ${piece.url.split('/').pop()}`);
console.log(`  couleur : ${piece.couleur}`);

const zones = SANS_MANCHES ? piece.zones.filter(([z]) => !/sleeve/i.test(z)) : piece.zones;
for (const [, f] of zones) {
  if (!cheminFichier(f)) {
    console.error(`  fichier introuvable : ${f}`);
    process.exit(1);
  }
}

// --dans-editeur reprend le travail quand l'éditeur est déjà ouvert devant soi
const DEJA = process.argv.includes('--dans-editeur');

if (!DEJA) {
console.log('\n→ ouverture du blank');
await page.goto(piece.url, { waitUntil: 'networkidle2', timeout: 90000 });
await page.bringToFront().catch(() => {});
await pause(2000);

etape(`couleur : ${piece.couleur}`);
// le nuancier nomme ses pastilles « Black #0b0b0b » : on n'accepte que cette forme,
// sinon un lien de navigation portant le même mot emmène ailleurs
const couleurPosee = await page.evaluate((c) => {
  const cible = [...document.querySelectorAll('[title], [aria-label]')].find((el) => {
    const t = (el.getAttribute('title') || el.getAttribute('aria-label') || '').trim();
    return new RegExp(`^${c}\s+#[0-9a-f]{3,8}$`, 'i').test(t);
  });
  if (!cible) return false;
  const r = cible.getBoundingClientRect();
  if (r.width < 4) return false;
  return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
}, piece.couleur);
if (couleurPosee) {
  await page.mouse.click(couleurPosee.x, couleurPosee.y);
  console.log('   posée');
} else {
  console.log('   à choisir à la main');
}
await pause(1200);

etape('entrée dans l’éditeur');
const amene = await page.evaluate(() => {
  const b = [...document.querySelectorAll('button, a')].find((e) => /start designing|create product|personnaliser/i.test(e.innerText || ''));
  if (!b) return false;
  b.scrollIntoView({ block: 'center' });
  return true;
});
if (!amene) {
  console.error('  bouton d’entrée introuvable, l’interface a changé');
  process.exit(1);
}
await pause(900);
const posEntree = await page.evaluate(() => {
  const b = [...document.querySelectorAll('button, a')].find((e) => /start designing|create product|personnaliser/i.test(e.innerText || ''));
  const r = b.getBoundingClientRect();
  return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
});
await page.mouse.click(posEntree.x, posEntree.y);
// l'éditeur est une surcouche : on le reconnaît à ses onglets de zones et à son bouton final
const dansEditeur = await page
  .waitForFunction(
    () => {
      const t = document.body.innerText;
      return /Right sleeve/i.test(t) && /Publish/i.test(t) && /Printing type/i.test(t);
    },
    { timeout: 45000 },
  )
  .then(() => true)
  .catch(() => false);

if (!dansEditeur) {
  console.error('\n  L’éditeur ne s’est pas ouvert. Rien n’a été touché : relance le script.');
  await nav.disconnect();
  process.exit(1);
}
await pause(2500);
}

etape('technique : impression numérique');
await cliquerTexte('^printing$');
await pause(600);
await cliquerTexte('DTG printing');
await pause(800);

etape(`tailles : ${piece.tailles.join(', ')}`);
const taillesPosees = await page.evaluate((voulues) => {
  const boites = [...document.querySelectorAll('input[type="checkbox"]')].filter((i) => {
    const t = (i.closest('label')?.innerText || i.parentElement?.innerText || '').trim();
    return /^(2XS|XS|S|M|L|XL|2XL|3XL|4XL|5XL)$/.test(t);
  });
  let n = 0;
  for (const b of boites) {
    const t = (b.closest('label')?.innerText || b.parentElement?.innerText || '').trim();
    const doitEtre = voulues.includes(t);
    if (b.checked !== doitEtre) {
      b.click();
      n++;
    }
  }
  return { ajustees: n, trouvees: boites.length };
}, piece.tailles);
console.log(`   ${taillesPosees.trouvees} tailles au blank, ${taillesPosees.ajustees} ajustée(s)`);
await pause(900);

etape('fichiers, zone par zone');
for (const [zone, fichier] of zones) {
  const chemin = cheminFichier(fichier);
  console.log(`   ${zone} ← ${fichier}`);

  if (!(await cliquerTexte(`^${zone}$`))) {
    console.log(`     onglet « ${zone} » introuvable, zone sautée`);
    continue;
  }
  await pause(1600);

  await cliquerTexte('add file|upload|file library|ajouter');
  await pause(1800);

  // la case de conditions commande l'envoi ; elle vit dans la fenêtre des fichiers
  await page.evaluate(() => {
    const label = [...document.querySelectorAll('label, span, div')].find((el) =>
      /I understand and accept/i.test((el.innerText || '').trim()),
    );
    const boite = label?.querySelector('input[type="checkbox"]');
    if (boite && !boite.checked) boite.click();
  });
  await pause(500);

  const dejaLa = await page.evaluate((n) => document.body.innerText.includes(n.slice(0, 22)), path.basename(chemin));
  if (dejaLa) {
    etape(`     ${path.basename(chemin)} déjà dans la bibliothèque`);
  } else {
    const champ = await page.$('input[type="file"]');
    if (!champ) {
      console.log('     champ d’envoi introuvable, fichier à monter à la main');
      continue;
    }
    await champ.uploadFile(chemin);
    etape(`     envoi de ${path.basename(chemin)}`);
    await page
      .waitForFunction((n) => document.body.innerText.includes(n.slice(0, 22)), { timeout: 60000 }, path.basename(chemin))
      .catch(() => console.log('     l’envoi tarde'));
  }
  await pause(1500);

  /*
    Pose du fichier. Deux précautions apprises à l'essai : on filtre la bibliothèque pour
    n'avoir qu'un résultat, et on clique aux coordonnées. Le clic ordinaire de Puppeteer
    exige un élément dégagé, or la fenêtre superpose ses couches et il attend sans fin.
  */
  const filtre = await page.evaluate(() => {
    const champs = [...document.querySelectorAll('input[placeholder]')].filter(
      (i) => /Search file library/i.test(i.placeholder) && i.getBoundingClientRect().width > 0,
    );
    const c = champs[champs.length - 1];
    if (!c) return false;
    c.focus();
    return true;
  });
  if (filtre) {
    await page.keyboard.type(path.basename(chemin).slice(0, 18), { delay: 35 });
    await pause(3200);
  }

  const boite = await page.evaluate(() => {
    const item = document.querySelector('.pf-library-item input[type="checkbox"]');
    if (!item) return null;
    const r = item.getBoundingClientRect();
    return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
  });

  if (!boite) {
    console.log('     fichier introuvable après filtrage, zone à poser à la main');
  } else {
    await page.mouse.click(boite.x, boite.y);
    await pause(2200);

    const valide = await page.evaluate(() => {
      const b = [...document.querySelectorAll('button')].find((x) => /save and close/i.test(x.innerText || ''));
      if (!b) return 'bouton absent';
      if (b.disabled) return 'bouton inactif';
      const r = b.getBoundingClientRect();
      return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
    });

    if (typeof valide === 'string') {
      console.log(`     ${valide}, zone à poser à la main`);
    } else {
      await page.mouse.click(valide.x, valide.y);
      await pause(4000);
      const fini = await page.evaluate(() => !/File library/i.test(document.body.innerText));
      console.log(`     ${fini ? 'posé sur le vêtement' : 'fenêtre encore ouverte'}`);
    }
  }
  await pause(1200);
}

console.log('\nL’écran est prêt. Regarde le placement, ajuste la taille en centimètres,');
console.log('puis publie toi-même. Ce script ne clique jamais sur « Publish ».');
await attendre('Entrée pour rendre la main. ');
await nav.disconnect();
