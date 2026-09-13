/**
 * Serveur MCP « motifs dead2me ».
 *
 * POURQUOI UN SERVEUR LOCAL PLUTÔT QU'UN CONNECTEUR D'IMAGES GÉNÉRIQUE : le registre MCP
 * n'expose aucun connecteur d'image, mais surtout le besoin n'est pas « générer une image ».
 * Il est de générer une image DANS la grammaire de la marque, de la sortir au format que
 * Printful accepte, et de refuser en amont ce qui ferait fermer la boutique. Un serveur
 * générique ne fait aucune des trois.
 *
 * ZÉRO DÉPENDANCE : le protocole MCP est du JSON-RPC 2.0 en lignes sur stdin et stdout. Le
 * reste du projet n'installe rien non plus, donc pas de node_modules ici.
 *
 * RÈGLE ABSOLUE : stdout est réservé au protocole. Toute trace part sur stderr, sinon le
 * client voit un message JSON invalide et coupe la connexion.
 */

import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import * as fal from './fal.mjs';
import { versImpression } from './impression.mjs';
import { BRIQUES, NEGATIF, composer, controler } from './style.mjs';

const ICI = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.join(ICI, '..', '..');
const CONTENU = path.join(RACINE, 'contenu');
const BRIQUES_DIR = path.join(CONTENU, 'briques');

const trace = (m) => process.stderr.write(`[motifs] ${m}\n`);

const numeroter = (dossier, prefixe) => {
  mkdirSync(dossier, { recursive: true });
  const n =
    readdirSync(dossier)
      .map((f) => parseInt(f.slice(0, 3), 10))
      .filter((x) => !Number.isNaN(x))
      .reduce((a, b) => Math.max(a, b), 0) + 1;
  return path.join(dossier, `${String(n).padStart(3, '0')}-${prefixe}.png`);
};

/** Lance un script du projet et rend sa sortie, pour ne pas dupliquer un moteur qui marche. */
const lancer = (script, args) =>
  new Promise((resolve, reject) => {
    const p = spawn(process.execPath, [script, ...args], { cwd: path.dirname(script) });
    let out = '';
    let err = '';
    p.stdout.on('data', (d) => (out += d));
    p.stderr.on('data', (d) => (err += d));
    p.on('close', (code) =>
      code === 0 ? resolve(out.trim()) : reject(new Error(err.trim() || `code ${code}`)),
    );
  });

// ------------------------------------------------------------------------ outils

const OUTILS = [
  {
    name: 'controle_conformite',
    description:
      'Passe un sujet, un prompt ou un titre de produit au crible de ce qui fait fermer une ' +
      'boutique print-on-demand : personne réelle, marque déposée, arme, blessure sur un corps, ' +
      'automutilation, symbole haineux. Rend la raison précise et la règle concernée. ' +
      'À appeler avant toute génération, et avant de nommer un produit.',
    inputSchema: {
      type: 'object',
      properties: { texte: { type: 'string', description: 'le texte à contrôler' } },
      required: ['texte'],
    },
    executer: ({ texte }) => {
      const v = controler(texte);
      return v.ok
        ? 'Conforme. Rien de bloquant pour Printful, Shopify, Meta ni TikTok.'
        : `REFUSÉ sur « ${v.terme} ».\n${v.raison}`;
    },
  },
  {
    name: 'briques_lister',
    description:
      'Rend les six briques visuelles de la marque et le rôle de phrase auquel chacune ' +
      'correspond. Le créneau vend six idées recombinées, pas quarante motifs sans lien : ' +
      'passer par cette liste est ce qui garde une collection cohérente.',
    inputSchema: { type: 'object', properties: {} },
    executer: () =>
      Object.entries(BRIQUES)
        .map(([k, b]) => `${k.padEnd(10)} ${b.resume}${b.role ? `  (phrases role: ${b.role})` : ''}`)
        .join('\n'),
  },
  {
    name: 'motif_generer',
    description:
      'Génère un motif dans la grammaire verrouillée de la marque : peinture à la main, trois ' +
      'tons, silhouette anonyme, coulure bordeaux, grain photocopie. Le modèle ne dessine ' +
      'jamais de texte, la typographie sort de phrase_composer. Écrit dans contenu/briques.',
    inputSchema: {
      type: 'object',
      properties: {
        brique: {
          type: 'string',
          enum: Object.keys(BRIQUES),
          description: 'une des six briques de la marque, à préférer à un sujet libre',
        },
        sujet: {
          type: 'string',
          description: 'sujet libre, en anglais, si aucune brique ne convient',
        },
        nb: { type: 'integer', default: 1, description: 'nombre de variantes, 1 à 4' },
      },
    },
    executer: async ({ brique, sujet, nb = 1 }) => {
      if (!brique && !sujet) throw new Error('donne une brique ou un sujet');
      const base = brique ? BRIQUES[brique].prompt : sujet;
      const v = controler(base);
      if (!v.ok) return `REFUSÉ sur « ${v.terme} ».\n${v.raison}`;

      const lignes = [];
      for (let i = 0; i < Math.min(Math.max(nb, 1), 4); i++) {
        const rep = await fal.appeler(fal.MODELES.motif, {
          prompt: composer(base),
          negative_prompt: NEGATIF,
          image_size: 'square_hd',
          num_images: 1,
          enable_safety_checker: true,
        });
        const dest = numeroter(BRIQUES_DIR, brique || 'libre');
        await fal.enregistrer(fal.premiereImage(rep), dest);
        lignes.push(path.relative(RACINE, dest));
      }
      return `${lignes.length} motif(s) :\n${lignes.join('\n')}\n\nPasse-les à motif_impression avant de les envoyer à Printful.`;
    },
  },
  {
    name: 'motif_recombiner',
    description:
      'Croise un motif existant avec une autre brique sur la même pièce, ce qui est le ' +
      'mécanisme de catalogue du créneau : six dessins croisés donnent quarante références. ' +
      'Part d\'une image déjà générée et garde son geste de peinture.',
    inputSchema: {
      type: 'object',
      properties: {
        image: { type: 'string', description: 'chemin du motif de départ, dans contenu/briques' },
        brique: { type: 'string', enum: Object.keys(BRIQUES) },
        sujet: { type: 'string', description: 'ou un ajout libre, en anglais' },
      },
      required: ['image'],
    },
    executer: async ({ image, brique, sujet }) => {
      const src = path.isAbsolute(image) ? image : path.join(RACINE, image);
      if (!existsSync(src)) throw new Error(`introuvable : ${src}`);
      const ajout = brique ? BRIQUES[brique].prompt : sujet;
      if (!ajout) throw new Error('donne une brique ou un sujet à croiser');
      const v = controler(ajout);
      if (!v.ok) return `REFUSÉ sur « ${v.terme} ».\n${v.raison}`;

      const { readFileSync } = await import('node:fs');
      const rep = await fal.appeler(fal.MODELES.edition, {
        prompt: `keep the existing hand-painted style exactly, add to the same composition: ${ajout}`,
        image_url: `data:image/png;base64,${readFileSync(src).toString('base64')}`,
      });
      const dest = numeroter(BRIQUES_DIR, `croise-${brique || 'libre'}`);
      await fal.enregistrer(fal.premiereImage(rep), dest);
      return `croisement : ${path.relative(RACINE, dest)}`;
    },
  },
  {
    name: 'motif_impression',
    description:
      'Transforme un visuel en fichier d\'impression Printful : 4500 x 5400 à 300 dpi, fond ' +
      'réellement transparent, recadré sur le dessin. Sans cette étape Printful place un petit ' +
      'dessin au milieu du vêtement, avec le rectangle de fond visible autour.',
    inputSchema: {
      type: 'object',
      properties: {
        entree: { type: 'string', description: 'chemin du PNG source' },
        marge: { type: 'integer', default: 120, description: 'marge en pixels dans le fichier final' },
        contraste: {
          type: 'number',
          default: 1,
          description: 'au-dessus de 1, durcit l\'encre. 1.15 suffit sur un rendu trop doux',
        },
        tolerance: {
          type: 'integer',
          default: 42,
          description: 'écart de couleur toléré au détourage. Monter si le fond reste visible',
        },
      },
      required: ['entree'],
    },
    executer: async ({ entree, marge = 120, contraste = 1, tolerance = 42 }) => {
      const src = path.isAbsolute(entree) ? entree : path.join(RACINE, entree);
      if (!existsSync(src)) throw new Error(`introuvable : ${src}`);
      const dossier = path.join(path.dirname(src), 'impression');
      mkdirSync(dossier, { recursive: true });
      const dest = path.join(dossier, path.basename(src));
      const r = await versImpression(src, dest, { marge, contraste, tol: tolerance });
      return [
        `fichier : ${path.relative(RACINE, r.fichier)}`,
        `taille : ${r.taille}`,
        `fond : ${r.fond}`,
        `occupation : ${r.largeurOccupee}`,
      ].join('\n');
    },
  },
  {
    name: 'phrase_composer',
    description:
      'Compose une pièce entièrement typographique avec le moteur d\'encre du projet : typo ' +
      'tordue et rongée, coulures, taches. Gratuit, hors ligne, sans aucun risque de droits. ' +
      'C\'est la famille prioritaire de la marque, le créneau achète une phrase avant une image.',
    inputSchema: {
      type: 'object',
      properties: {
        phrase: {
          type: 'string',
          description: 'la phrase, en anglais parlé, deux à quatre mots, adressée à une absente',
        },
        mise: {
          type: 'string',
          enum: ['bloc', 'manuscrit', 'serif', 'barre', 'repetition', 'horodatage', 'angle'],
        },
        palette: { type: 'string', enum: ['sombre', 'os', 'terre', 'lin'] },
        format: { type: 'string', enum: ['affiche', 'carre', 'poster', 'bande'], default: 'affiche' },
        impression: {
          type: 'boolean',
          default: false,
          description: 'true pour sortir le fichier d\'impression au lieu de la planche d\'aperçu',
        },
      },
    },
    executer: async ({ phrase, mise, palette, format = 'affiche', impression = false }) => {
      if (phrase) {
        const v = controler(phrase);
        if (!v.ok) return `REFUSÉ sur « ${v.terme} ».\n${v.raison}`;
      }
      // Toujours passer --vers : sans dossier de sortie dédié, phrases.mjs purge la planche
      // de contenu/phrases avant de produire, et un appel du serveur effacerait la série.
      const args = [
        '--nb', '1',
        '--format', format,
        '--vers', impression ? 'phrases-mcp/impression' : 'phrases-mcp',
      ];
      if (phrase) args.push('--phrase', phrase);
      if (mise) args.push('--mise', mise);
      if (palette) args.push('--palette', palette);
      if (impression) args.push('--sansFond', '--taille', '3600');
      const out = await lancer(path.join(CONTENU, 'phrases.mjs'), args);
      return out || 'produit, voir contenu/phrases';
    },
  },
];

// ------------------------------------------------------------------ protocole

const OUTILS_PUBLICS = OUTILS.map(({ name, description, inputSchema }) => ({
  name,
  description,
  inputSchema,
}));

const repondre = (id, result) =>
  process.stdout.write(`${JSON.stringify({ jsonrpc: '2.0', id, result })}\n`);

const erreur = (id, code, message) =>
  process.stdout.write(`${JSON.stringify({ jsonrpc: '2.0', id, error: { code, message } })}\n`);

const traiter = async (msg) => {
  const { id, method, params } = msg;

  if (method === 'initialize') {
    // On renvoie la version demandée par le client quand elle est fournie : c'est ce qui
    // rend le serveur compatible avec les clients plus anciens comme plus récents.
    return repondre(id, {
      protocolVersion: params?.protocolVersion || '2025-06-18',
      capabilities: { tools: {} },
      serverInfo: { name: 'motifs-dead2me', version: '1.0.0' },
    });
  }
  if (method === 'ping') return repondre(id, {});
  if (method === 'tools/list') return repondre(id, { tools: OUTILS_PUBLICS });

  if (method === 'tools/call') {
    const outil = OUTILS.find((o) => o.name === params?.name);
    if (!outil) return erreur(id, -32602, `outil inconnu : ${params?.name}`);
    try {
      const texte = await outil.executer(params.arguments || {});
      return repondre(id, { content: [{ type: 'text', text: String(texte) }] });
    } catch (e) {
      trace(`${params.name} a échoué : ${e.message}`);
      // L'échec d'un outil se rend DANS le résultat, pas en erreur de protocole : le client
      // doit pouvoir lire la cause et corriger son appel.
      return repondre(id, { content: [{ type: 'text', text: `ÉCHEC : ${e.message}` }], isError: true });
    }
  }

  // Les notifications n'ont pas d'identifiant et n'attendent rien.
  if (id === undefined) return;
  return erreur(id, -32601, `méthode non gérée : ${method}`);
};

// Le découpage du tampon reste synchrone et le traitement passe par une file : un client qui
// envoie deux requêtes pendant qu'un outil travaille déclenche deux évènements « data », et
// un gestionnaire asynchrone qui lit et réécrit `tampon` en perdrait la moitié.
let tampon = '';
const file = [];
let occupe = false;

const vider = async () => {
  if (occupe) return;
  occupe = true;
  while (file.length) await traiter(file.shift());
  occupe = false;
};

process.stdin.setEncoding('utf8');
process.stdin.on('data', (bloc) => {
  tampon += bloc;
  const lignes = tampon.split('\n');
  tampon = lignes.pop();
  for (const ligne of lignes) {
    if (!ligne.trim()) continue;
    try {
      file.push(JSON.parse(ligne));
    } catch {
      trace(`ligne illisible ignorée : ${ligne.slice(0, 120)}`);
    }
  }
  vider();
});

trace(`prêt, ${OUTILS.length} outils, clé fal ${fal.clePresente() ? 'présente' : 'absente'}`);
