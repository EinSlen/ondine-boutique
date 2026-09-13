/**
 * Copilote de montage des produits dans Printful.
 *
 * POURQUOI UN COPILOTE ET PAS UN ROBOT COMPLET : Printful refuse la création de produits par
 * API dès qu'un magasin est connecté à Shopify (« This API endpoint applies only to Printful
 * stores based on the Manual Order / API platform »), et leur v2 a retiré la gestion de
 * produits. Il reste leur éditeur web. Un script qui cliquerait tout seul dedans casserait au
 * premier changement de leur interface, et surtout il monterait douze fiches sans que
 * personne ne regarde le placement, ce qui est exactement ce qu'on ne peut pas se permettre
 * avant un échantillon.
 *
 * Ce script fait donc le travail pénible et laisse les yeux : il ouvre le navigateur sur le
 * bon écran, cherche le blank exact, met l'URL du fichier dans le presse-papier au moment où
 * elle sert, dicte les zones et les centimètres, et retient où tu t'es arrêté.
 *
 * La fenêtre s'ouvre sur le profil dédié `.edge-profile-jamaisdeux`, jamais le profil
 * personnel. Connecte-toi à Printful dedans une seule fois, la session y reste.
 *
 * Usage :
 *   node printful-montage.mjs                 reprend là où tu t'es arrêté
 *   node printful-montage.mjs --depuis 5      force le départ à la pièce 5
 *   node printful-montage.mjs --liste         affiche le plan sans rien ouvrir
 *   node printful-montage.mjs --reset         oublie la progression
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import { fileURLToPath } from 'node:url';

import { ouvrir, ouvrirDetache, commandeManuelle, premierOnglet } from './edge.mjs';

const ICI = path.dirname(fileURLToPath(import.meta.url));
const ETAT = path.join(ICI, '.montage-printful.json');
/**
 * Les fichiers se téléversent depuis le disque : la bibliothèque de Printful n'accepte que
 * l'envoi local ou Dropbox, jamais une adresse web. Relevé dans leur éditeur le 30/08/2026.
 */
const DOSSIERS = ['01_GRAPHIC_PIECES', '02_LOGO_ESSENTIALS', '03_SLEEVES_SPLATTERS', '04_BOTTOMS_AOP'];

/**
 * Adresse directe de chaque blank dans le catalogue Printful, relevée dans leur interface.
 * Ouvrir la fiche du blank d'emblée évite la recherche, qui dépend de leur moteur et de la
 * langue de l'interface.
 */
const ADRESSES = {
  'Gildan 18600': 'https://www.printful.com/dashboard/custom/mens/hoodies-sweatshirts/unisex-heavy-blend-zip-hoodie-gildan-18600',
  'Gildan 18500': 'https://www.printful.com/dashboard/custom/mens/hoodies/unisex-heavy-blend-hoodie-gildan-18500',
  'Cotton Heritage MC1087': 'https://www.printful.com/dashboard/custom/mens/t-shirts/mens-box-tee-cotton-heritage-mc1087',
  'All-Over Print Unisex Wide-Leg Joggers': 'https://www.printful.com/dashboard/custom/mens/sweatpants-joggers/all-over-print-unisex-wide-leg-joggers',
  'All-Over Print Unisex Wide-Leg Pants': 'https://www.printful.com/dashboard/custom/mens/bottoms/all-over-print-unisex-wide-leg-pants',
  'All-Over Print Unisex Track Pants': 'https://www.printful.com/dashboard/custom/mens/pants/all-over-print-unisex-track-pants',
};
const PRODUCTION = path.join(ICI, '..', 'production');

/** Retrouve un fichier d'impression dans les sous-dossiers du pack de production. */
const cheminFichier = (nom) => {
  for (const d of DOSSIERS) {
    const essai = path.join(PRODUCTION, d, nom);
    if (existsSync(essai)) return essai;
  }
  return path.join(PRODUCTION, nom);
};

/**
 * Le plan de montage, repris de `production/05_SUPPLIER_MAPPING` et des tarifs Printful
 * Europe relevés par `marges.mjs`. Les trois pièces marquées `echantillon` sont celles à
 * commander avant toute publicité : elles couvrent le zip, le tee et l'all-over.
 */
const PIECES = [
  {
    nom: 'SPLIT FIGURES ZIP',
    blank: 'Gildan 18600',
    couleur: 'Black',
    echantillon: true,
    marge: '26,40 € · 35 %, monte à 51 % sans les manches',
    zones: [
      ['Devant', '01_split_figures_black_zip_print.png', 'largeur du gabarit, à cheval sur le zip'],
      ['Manche gauche', 'BURGUNDY_SPLATTER_LONG_SLEEVE_LEFT.png', 'gouttes sous l’épaule'],
      ['Manche droite', 'BURGUNDY_SPLATTER_LONG_SLEEVE_RIGHT.png', 'gouttes sous l’épaule'],
      ['Logo bas droite', 'D2M_MINI_CHEST_1800px.png', '6 à 8 cm'],
    ],
    garde: 'Les figures restent chacune de leur côté du zip, la tache bordeaux sur celle de droite. Ne recentre pas le dessin sur la fermeture.',
  },
  {
    nom: 'RUN AWAY TEE',
    blank: 'Cotton Heritage MC1087',
    couleur: 'White',
    echantillon: true,
    marge: '25,08 € · 55 %',
    zones: [
      ['Devant', '05_run_away_white_tee_print.png', '28 à 32 cm, haut de poitrine'],
      ['Logo bas droite', 'D2M_MINI_CHEST_1800px.png', '6 à 8 cm'],
    ],
    garde: 'Même échelle que le mockup de référence. Éclaboussure rare.',
  },
  {
    nom: 'VOID WIDE-LEG JOGGERS',
    blank: 'All-Over Print Unisex Wide-Leg Joggers',
    couleur: 'AOP',
    echantillon: true,
    local: true,
    marge: '31,16 € · 42 %',
    zones: [['Tout-over', 'VOID_WIDE_LEG_JOGGERS_AOP_DESIGN_6000.png', 'gabarit de découpe Printful']],
    garde: 'Fichier à prendre sur le disque, il dépasse la limite d’hébergement. Aligne le logo sur le haut de cuisse.',
  },
  {
    nom: 'SEATED FIGURE ZIP',
    blank: 'Gildan 18600',
    couleur: 'Sport Grey',
    marge: '26,40 € · 35 %, monte à 51 % sans les manches',
    zones: [
      ['Devant', '02_seated_figure_grey_zip_print.png', 'largeur du gabarit'],
      ['Manche gauche', 'BURGUNDY_SPLATTER_LONG_SLEEVE_LEFT.png', 'gouttes sous l’épaule'],
      ['Manche droite', 'BURGUNDY_SPLATTER_LONG_SLEEVE_RIGHT.png', 'gouttes sous l’épaule'],
      ['Logo bas droite', 'D2M_MINI_CHEST_1800px.png', '6 à 8 cm'],
    ],
    garde: 'Figure principale majoritairement à gauche du zip, éclat bordeaux conservé à la tête.',
  },
  {
    nom: 'TABLE ALONE ZIP',
    blank: 'Gildan 18600',
    couleur: 'Sport Grey',
    marge: '26,40 € · 35 %, monte à 51 % sans les manches',
    zones: [
      ['Devant', '03_table_alone_grey_zip_print.png', 'largeur du gabarit'],
      ['Manche gauche', 'BURGUNDY_SPLATTER_LONG_SLEEVE_LEFT.png', 'gouttes sous l’épaule'],
      ['Manche droite', 'BURGUNDY_SPLATTER_LONG_SLEEVE_RIGHT.png', 'gouttes sous l’épaule'],
      ['Logo bas droite', 'D2M_MINI_CHEST_1800px.png', '6 à 8 cm'],
    ],
    garde: 'La table et le groupe à gauche, la figure isolée à droite.',
  },
  {
    nom: 'AFTERMATH ZIP',
    blank: 'Gildan 18600',
    couleur: 'Sport Grey',
    marge: '26,40 € · 35 %, monte à 51 % sans les manches',
    zones: [
      ['Devant', '04_aftermath_grey_zip_print.png', 'largeur du gabarit'],
      ['Manche gauche', 'BURGUNDY_SPLATTER_LONG_SLEEVE_LEFT.png', 'gouttes sous l’épaule'],
      ['Manche droite', 'BURGUNDY_SPLATTER_LONG_SLEEVE_RIGHT.png', 'gouttes sous l’épaule'],
      ['Logo bas droite', 'D2M_MINI_CHEST_1800px.png', '6 à 8 cm'],
    ],
    garde: 'Figure debout mains sur la tête à gauche, figure effondrée à droite.',
  },
  {
    nom: 'D2M ZIP HOODIE',
    blank: 'Gildan 18600',
    couleur: 'Black',
    marge: '24,62 € · 31 %, la plus tendue du catalogue',
    zones: [
      ['Poitrine', 'D2M_MINI_CHEST_1800px.png', '8 à 10 cm'],
      ['Dos', 'D2M_PRIMARY_LOGO_4500px.png', '28 à 34 cm'],
      ['Manche gauche', 'BURGUNDY_SPLATTER_LONG_SLEEVE_LEFT.png', 'gouttes sous l’épaule'],
      ['Manche droite', 'BURGUNDY_SPLATTER_LONG_SLEEVE_RIGHT.png', 'gouttes sous l’épaule'],
    ],
    garde: 'Quatre zones imprimées à 5,95 € pièce. Retirer les manches rend 11,90 € de marge.',
  },
  {
    nom: 'D2M HOODIE',
    blank: 'Gildan 18500',
    couleur: 'Black',
    marge: '29,62 € · 40 %, monte à 56 % sans les manches',
    zones: [
      ['Poitrine', 'D2M_MINI_CHEST_1800px.png', '8 à 10 cm'],
      ['Dos', 'D2M_PRIMARY_LOGO_4500px.png', '28 à 32 cm'],
      ['Manche gauche', 'BURGUNDY_SPLATTER_LONG_SLEEVE_LEFT.png', 'gouttes sous l’épaule'],
      ['Manche droite', 'BURGUNDY_SPLATTER_LONG_SLEEVE_RIGHT.png', 'gouttes sous l’épaule'],
    ],
    garde: 'Blank 18500, sans zip. Ne prends pas le 18600 par habitude.',
  },
  {
    nom: 'D2M HEAVYWEIGHT TEE',
    blank: 'Cotton Heritage MC1087',
    couleur: 'Black',
    marge: '14,83 € · 36 %',
    zones: [
      ['Devant', 'D2M_PRIMARY_LOGO_4500px.png', '28 à 32 cm'],
      ['Dos, optionnel', 'D2M_MINI_CHEST_1800px.png', 'nuque, 8 à 10 cm'],
    ],
    garde: 'Le dos est optionnel : le retirer rend 5,95 € sur une pièce déjà juste.',
  },
  {
    nom: 'D2M ESSENTIALS TEE',
    blank: 'Cotton Heritage MC1087',
    couleur: 'Black',
    marge: '11,50 € · 31 %, la moins rentable',
    zones: [
      ['Poitrine', 'D2M_MINI_CHEST_1800px.png', '8 à 10 cm'],
      ['Dos', 'D2M_PRIMARY_LOGO_4500px.png', '28 à 32 cm'],
    ],
    garde: '11,50 € avant la livraison. Soit tu montes le prix, soit tu tombes une des deux zones.',
  },
  {
    nom: 'STATIC WIDE-LEG PANTS',
    blank: 'All-Over Print Unisex Wide-Leg Pants',
    couleur: 'AOP',
    local: true,
    marge: '29,95 € · 49 %',
    zones: [['Tout-over', 'STATIC_WIDE_LEG_PANTS_AOP_DESIGN_6000.png', 'gabarit de découpe Printful']],
    garde: 'Fichier à prendre sur le disque. Marquage discret.',
  },
  {
    nom: 'NO SIGNAL TRACK PANTS',
    blank: 'All-Over Print Unisex Track Pants',
    couleur: 'AOP',
    local: true,
    marge: '27,75 € · 48 %',
    zones: [['Tout-over', 'NO_SIGNAL_TRACK_PANTS_AOP_DESIGN_6000.png', 'gabarit de découpe Printful']],
    garde: 'Fichier à prendre sur le disque. Aligne les rails bordeaux sur les coutures latérales.',
  },
];

const arg = (n) => {
  const i = process.argv.indexOf(`--${n}`);
  return i > -1 ? process.argv[i + 1] : null;
};

const lireEtat = () => (existsSync(ETAT) ? JSON.parse(readFileSync(ETAT, 'utf8')) : { faites: [] });
const ecrireEtat = (e) => writeFileSync(ETAT, JSON.stringify(e, null, 2), 'utf8');

if (process.argv.includes('--reset')) {
  ecrireEtat({ faites: [] });
  console.log('Progression oubliée.');
  process.exit(0);
}

if (process.argv.includes('--liste')) {
  console.log('\nPlan de montage, douze pièces\n');
  PIECES.forEach((p, i) => {
    console.log(`${String(i + 1).padStart(2, '0')}. ${p.nom}`);
    console.log(`    ${p.blank} · ${p.couleur}${p.echantillon ? ' · à échantillonner' : ''}`);
    for (const [zone, fichier, taille] of p.zones) console.log(`    ${zone} : ${fichier} (${taille})`);
  });
  console.log('');
  process.exit(0);
}

const etat = lireEtat();
const depuis = Number(arg('depuis') || 0);
const reste = PIECES.map((p, i) => ({ ...p, rang: i + 1 })).filter(
  (p) => (depuis ? p.rang >= depuis : !etat.faites.includes(p.nom)),
);

if (!reste.length) {
  console.log('Les douze pièces sont marquées faites. `--reset` pour repartir de zéro.');
  process.exit(0);
}

const attendre = (question) =>
  new Promise((ok) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(question, (r) => {
      rl.close();
      ok(r.trim().toLowerCase());
    });
  });

let { nav, mode } = await ouvrir();
console.log(`\nNavigateur ${mode} sur le profil dédié.`);

let page = await premierOnglet(nav);

// le presse-papier n'est accessible que si la page en a la permission
try {
  await nav.defaultBrowserContext().overridePermissions('https://www.printful.com', ['clipboard-read', 'clipboard-write']);
} catch {
  /* certaines versions d'Edge refusent, on retombe sur l'affichage de l'URL */
}

const copier = async (texte) => {
  try {
    await page.evaluate((t) => navigator.clipboard.writeText(t), texte);
    return true;
  } catch {
    return false;
  }
};

await page.goto('https://www.printful.com/dashboard/sync', { waitUntil: 'domcontentloaded', timeout: 90000 });

const connecte = async () =>
  page.evaluate(() => !/\/(login|auth|signin)/i.test(location.pathname));

if (!(await connecte())) {
  console.log('\nPrintful demande une connexion.');
  console.log('Par « Se connecter avec Google », il refusera un navigateur piloté.');
  console.log('Utilise ton e-mail et ton mot de passe Printful, ou une fenêtre ordinaire :');
  console.log(`\n     ${commandeManuelle()}\n`);
  const r = await attendre('Entrée une fois connecté, ou "d" pour que j’ouvre la fenêtre ordinaire. ');

  if (r === 'd') {
    await nav.disconnect().catch(() => nav.close().catch(() => {}));
    ouvrirDetache();
    console.log('\nFenêtre ordinaire ouverte. Connecte-toi à Printful dedans, puis reviens ici.');
    await attendre('Entrée une fois connecté. ');
    ({ nav, mode } = await ouvrir({ lancerSiAbsent: false }));
    page = await premierOnglet(nav);
  }
  await page.goto('https://www.printful.com/dashboard/sync', { waitUntil: 'domcontentloaded', timeout: 90000 });
}

console.log(`\n${reste.length} pièce(s) à monter. Entrée pour passer à la suivante, "s" pour sauter, "q" pour arrêter.\n`);

for (const p of reste) {
  console.log('─'.repeat(72));
  console.log(`${String(p.rang).padStart(2, '0')}/12  ${p.nom}${p.echantillon ? '   [à échantillonner]' : ''}`);
  console.log(`      Blank    ${p.blank} · ${p.couleur}`);
  console.log(`      Marge    ${p.marge}`);
  console.log(`      Garde    ${p.garde}`);
  console.log('');

  const adresse = ADRESSES[p.blank];
  if (adresse) {
    await page.goto(adresse, { waitUntil: 'domcontentloaded', timeout: 90000 }).catch(() => {});
    await page.bringToFront().catch(() => {});
    console.log(`      Fiche du blank ouverte. Clique « Start designing », puis choisis ${p.couleur}.`);
  } else {
    await page.goto('https://www.printful.com/dashboard/custom-products', { waitUntil: 'domcontentloaded', timeout: 90000 });
    console.log(`      Cherche le blank à la main : « ${p.blank} »`);
  }

  for (const [zone, fichier, taille] of p.zones) {
    const source = cheminFichier(fichier);
    const copie = await copier(source);
    console.log('');
    console.log(`      → ${zone} · ${taille}`);
    console.log(`        Fichier : ${source}`);
    console.log('        Dans l’éditeur, pour cette zone :');
    console.log('          1. onglet de la zone en haut');
    console.log('          2. Uploads à gauche');
    console.log('          3. coche la case de la vignette du fichier');
    console.log('          4. survole la vignette et clique « Apply »');
    console.log(`        Si le fichier manque : Upload, coche « I understand », ${copie ? 'le chemin est dans le presse-papier' : 'recopie le chemin ci-dessus'}.`);
    const r = await attendre('        Entrée quand la zone est posée. ');
    if (r === 'q') {
      console.log('\nArrêt. La progression est enregistrée.');
      await nav.close();
      process.exit(0);
    }
  }

  const fin = await attendre(`\n      Pièce montée et toutes les tailles SYNCED ? [Entrée = oui, s = sauter, q = arrêter] `);
  if (fin === 'q') {
    console.log('\nArrêt. La progression est enregistrée.');
    break;
  }
  if (fin !== 's') {
    etat.faites = [...new Set([...etat.faites, p.nom])];
    ecrireEtat(etat);
    console.log(`      ${p.nom} marquée faite (${etat.faites.length}/12).`);
  }
  console.log('');
}

console.log('\nRappel avant de lancer la moindre publicité : commande un échantillon de');
console.log('SPLIT FIGURES ZIP, RUN AWAY TEE et VOID WIDE-LEG JOGGERS.');
console.log('Et ne branche la production que si chaque taille Shopify est marquée SYNCED.\n');
if (mode === 'lancé') await nav.close();
else await nav.disconnect();
