/**
 * Trouve le navigateur qui fait le rendu, au lieu de le coder en dur.
 *
 * POURQUOI CE FICHIER EXISTE : le chemin d'Edge était écrit en dur dans chaque moteur. Sur
 * cette machine Edge se lance et rend la main aussitôt avec le code 0, donc puppeteer échoue
 * sur « Failed to launch the browser process : Code: 0 », sans stderr et sans autre
 * explication, et tous les moteurs tombent ensemble. Chrome répond normalement.
 *
 * On prend donc le premier navigateur réellement installé. `NAVIGATEUR` dans l'environnement
 * passe devant, pour forcer un binaire précis sans toucher au code.
 */

import { existsSync } from 'node:fs';

const CANDIDATS = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
];

export const navigateur = () => {
  const essais = [process.env.NAVIGATEUR, ...CANDIDATS].filter(Boolean);
  for (const c of essais) if (existsSync(c)) return c;
  throw new Error(
    `aucun navigateur trouvé. Essayés :\n  ${essais.join('\n  ')}\n` +
      'Renseigne NAVIGATEUR avec le chemin de chrome.exe ou msedge.exe.',
  );
};
