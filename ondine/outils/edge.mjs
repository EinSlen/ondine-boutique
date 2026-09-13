/**
 * Ouverture d'Edge pour les scripts qui pilotent un site derrière une session.
 *
 * POURQUOI CE MODULE : Google refuse la connexion quand il repère un navigateur lancé en
 * mode automatisation (« Ce navigateur ou cette application ne sont peut-être pas
 * sécurisés »). Deux réponses, dans cet ordre :
 *
 *   1. se rebrancher sur un Edge déjà ouvert à la main avec un port de débogage. C'est un
 *      navigateur ordinaire aux yeux du site, la connexion Google y passe ;
 *   2. à défaut, le lancer nous-mêmes en retirant les marqueurs d'automatisation, ce qui
 *      suffit à la plupart des sites mais pas toujours à Google.
 *
 * Le profil est toujours le profil dédié du projet, jamais le profil personnel.
 */

import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ICI = path.dirname(fileURLToPath(import.meta.url));

export const PROFIL = path.join(ICI, '..', '.edge-profile-jamaisdeux');
export const PORT = 9222;
export const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';

/** La commande à taper soi-même quand un site refuse le navigateur piloté. */
export const commandeManuelle = () =>
  `"${EDGE}" --remote-debugging-port=${PORT} --user-data-dir="${PROFIL}"`;

const dejaOuvert = async () => {
  try {
    const r = await fetch(`http://127.0.0.1:${PORT}/json/version`, { signal: AbortSignal.timeout(1500) });
    return r.ok;
  } catch {
    return false;
  }
};

/**
 * Rend un navigateur utilisable et dit comment il a été obtenu.
 * `lancerSiAbsent: false` interdit le démarrage automatique : utile quand on sait d'avance
 * qu'une connexion Google est nécessaire.
 */
export const ouvrir = async ({ lancerSiAbsent = true, demarrer = 'about:blank' } = {}) => {
  const { default: puppeteer } = await import('puppeteer-core');

  if (await dejaOuvert()) {
    const nav = await puppeteer.connect({ browserURL: `http://127.0.0.1:${PORT}`, defaultViewport: null });
    return { nav, mode: 'rebranché', puppeteer };
  }

  if (!lancerSiAbsent) {
    throw new Error(
      `Aucun Edge en écoute sur le port ${PORT}.\nOuvre-le toi-même, connecte-toi, puis relance :\n\n  ${commandeManuelle()}\n`,
    );
  }

  // lancé par nos soins : on retire ce qui trahit l'automatisation
  let nav;
  try {
    nav = await puppeteer.launch({
      executablePath: EDGE,
      headless: false,
      userDataDir: PROFIL,
      defaultViewport: null,
      ignoreDefaultArgs: ['--enable-automation'],
      args: [
        `--remote-debugging-port=${PORT}`,
        '--disable-blink-features=AutomationControlled',
        '--start-maximized',
        '--no-first-run',
        '--no-default-browser-check',
        demarrer,
      ],
    });
  } catch (e) {
    const detail = String(e.message).split(/\r?\n/)[0];
    throw new Error(
      [
        "Edge n'a pas pu être piloté.",
        'La cause la plus courante : une fenêtre Edge est déjà ouverte sur ce profil,',
        'sans port de débogage. Ferme toutes les fenêtres Edge, ou ouvre celle-ci',
        'toi-même puis relance le script :',
        '',
        `  ${commandeManuelle()}`,
        '',
        `Détail : ${detail}`,
      ].join('\n'),
    );
  }
  return { nav, mode: 'lancé', puppeteer };
};

/**
 * Donne l'onglet à piloter et le met au premier plan.
 * Sans cette remontée, un script rebranché sur une fenêtre existante travaille dans un
 * onglet caché : la page change, mais rien ne bouge devant les yeux.
 */
export const premierOnglet = async (nav) => {
  const pages = await nav.pages();
  const page = pages.find((p) => !/^devtools:/.test(p.url())) || (await nav.newPage());
  await page.bringToFront().catch(() => {});
  return page;
};

/** Ouvre Edge en dehors de tout pilotage, pour une connexion que le site surveille. */
export const ouvrirDetache = () => {
  const p = spawn(EDGE, [`--remote-debugging-port=${PORT}`, `--user-data-dir=${PROFIL}`], {
    detached: true,
    stdio: 'ignore',
  });
  p.unref();
};
