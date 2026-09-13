/**
 * Relève l'éditeur de design de Printful, l'écran où l'on pose les fichiers sur le vêtement.
 *
 * C'est la seule partie du parcours qu'on ne pouvait pas voir depuis l'extérieur. Entrer
 * dedans crée un brouillon chez Printful : ce script ne publie rien, ne met rien en boutique,
 * et s'arrête avant tout bouton d'enregistrement.
 *
 * Usage : node printful-editeur.mjs
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { ouvrir, premierOnglet } from './edge.mjs';

const ICI = path.dirname(fileURLToPath(import.meta.url));
const SORTIE = path.join(ICI, '..', 'production', 'exploration');
const BLANK = 'https://www.printful.com/dashboard/custom/mens/hoodies-sweatshirts/unisex-heavy-blend-zip-hoodie-gildan-18600';

mkdirSync(SORTIE, { recursive: true });

const { nav } = await ouvrir({ lancerSiAbsent: false });
const page = await premierOnglet(nav);

/** Ce qui sert à viser : rôle, texte, attributs stables. */
const relever = () =>
  page.evaluate(() => {
    const sel = 'button, a[href], input, select, [role="button"], [role="tab"], [draggable="true"], canvas';
    return [...document.querySelectorAll(sel)]
      .map((el) => {
        const r = el.getBoundingClientRect();
        if (r.width < 6 || r.height < 6) return null;
        const attrs = {};
        for (const a of el.attributes) {
          if (/^(id|name|type|placeholder|aria-label|role|title|data-[\w-]+)$/i.test(a.name) && a.value) {
            attrs[a.name] = a.value.slice(0, 60);
          }
        }
        return {
          tag: el.tagName.toLowerCase(),
          texte: (el.innerText || el.value || el.getAttribute('aria-label') || '').trim().replace(/\s+/g, ' ').slice(0, 50),
          attrs,
        };
      })
      .filter(Boolean)
      .slice(0, 200);
  });

const etapes = [];
const noter = async (cle, quoi) => {
  await new Promise((r) => setTimeout(r, 2600));
  await page.screenshot({ path: path.join(SORTIE, `${cle}.png`), fullPage: false }).catch(() => {});
  const e = { cle, quoi, url: page.url(), titre: await page.title(), elements: await relever() };
  etapes.push(e);
  console.log(`  ${cle} : ${e.elements.length} éléments, capture faite`);
  return e;
};

console.log('\n→ fiche du blank Gildan 18600');
await page.goto(BLANK, { waitUntil: 'networkidle2', timeout: 90000 });
const fiche = await noter('10-fiche-blank', 'la fiche produit du blank, avant l’éditeur');

// le bouton qui ouvre l'éditeur porte des libellés variables selon la langue et la version
const ouvreEditeur = fiche.elements.find((e) =>
  /start designing|create product|design|personnaliser|créer/i.test(e.texte),
);
console.log(`  bouton d’entrée repéré : ${ouvreEditeur ? `« ${ouvreEditeur.texte} »` : 'aucun, on tentera le premier bouton principal'}`);

const clique = await page.evaluate(() => {
  const cible = [...document.querySelectorAll('button, a[href]')].find((el) =>
    /start designing|create product|design|personnaliser|créer/i.test((el.innerText || '').trim()),
  );
  if (!cible) return false;
  cible.click();
  return true;
});

if (!clique) {
  console.log('  aucun bouton d’entrée trouvé : relève-le depuis la capture 10-fiche-blank.png');
} else {
  console.log('\n→ éditeur de design');
  await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 45000 }).catch(() => {});
  await noter('11-editeur', 'l’éditeur, avec ses zones de placement et son ajout de fichier');

  // on ouvre le panneau des fichiers sans rien téléverser
  const ouvertFichiers = await page.evaluate(() => {
    const cible = [...document.querySelectorAll('button, [role="button"], a')].find((el) =>
      /add file|upload|file library|ajouter un fichier|téléverser/i.test((el.innerText || el.getAttribute('aria-label') || '')),
    );
    if (!cible) return false;
    cible.click();
    return true;
  });
  if (ouvertFichiers) {
    console.log('  panneau des fichiers ouvert');
    await noter('12-fichiers', 'le panneau d’ajout de fichier, où se colle une URL');
  } else {
    console.log('  panneau des fichiers introuvable automatiquement');
  }
}

const dest = path.join(SORTIE, 'editeur.json');
writeFileSync(dest, JSON.stringify(etapes, null, 2), 'utf8');
console.log(`\nRelevé écrit dans ${dest}\n`);
await nav.disconnect();
