/**
 * Client fal.ai, sans dépendance : `fetch` et rien d'autre, comme le reste du projet.
 *
 * POURQUOI FAL PLUTÔT QU'UN FOURNISSEUR DIRECT : le rendu du créneau est raster et texturé
 * (acrylique, coulure, contour marqueur). Un générateur vectoriel sort des lignes propres,
 * qui sont exactement le défaut à éviter. fal donne sous une seule clé le modèle texte vers
 * image, le modèle d'édition à référence (indispensable pour recombiner les six briques
 * d'une pièce à l'autre) et l'agrandissement, donc on peut changer de modèle sans toucher
 * au serveur.
 *
 * Prérequis : `FAL_KEY=...` dans `outils/.env`, à côté des jetons Shopify et Printful.
 */

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ICI = path.dirname(fileURLToPath(import.meta.url));

/**
 * Les identifiants de modèles bougent d'une version à l'autre chez le fournisseur. Ils sont
 * donc tous ici, en un seul endroit, pour qu'une mise à jour reste un changement d'une ligne.
 */
export const MODELES = {
  motif: 'fal-ai/flux/dev',
  edition: 'fal-ai/flux-pro/kontext',
  detourage: 'fal-ai/birefnet',
  agrandir: 'fal-ai/clarity-upscaler',
};

const chargerEnv = () => {
  const f = path.join(ICI, '..', '.env');
  if (!existsSync(f)) return {};
  const out = {};
  for (const ligne of readFileSync(f, 'utf8').split(/\r?\n/)) {
    const m = ligne.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
  return out;
};

const env = { ...chargerEnv(), ...process.env };

export const clePresente = () => Boolean(env.FAL_KEY);

/**
 * Un appel synchrone. `fal.run` bloque jusqu'au résultat, ce qui convient à un serveur MCP :
 * l'appelant attend de toute façon la réponse de l'outil.
 */
export const appeler = async (modele, entree) => {
  if (!env.FAL_KEY) {
    throw new Error(
      'FAL_KEY absente. Ajoute la ligne FAL_KEY=... dans outils/.env, ' +
        'puis relance. Les outils phrase_composer et controle_conformite fonctionnent sans clé.',
    );
  }
  const r = await fetch(`https://fal.run/${modele}`, {
    method: 'POST',
    headers: {
      Authorization: `Key ${env.FAL_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(entree),
  });
  const texte = await r.text();
  if (!r.ok) {
    // Le corps d'erreur du fournisseur porte la vraie cause (quota, modèle retiré, entrée
    // invalide). Le masquer derrière « HTTP 422 » a déjà coûté une demi-heure ailleurs.
    throw new Error(`${modele} a répondu ${r.status} : ${texte.slice(0, 400)}`);
  }
  try {
    return JSON.parse(texte);
  } catch {
    throw new Error(`${modele} a répondu du non-JSON : ${texte.slice(0, 200)}`);
  }
};

/** Récupère la première image d'une réponse, quel que soit le nom du champ selon le modèle. */
export const premiereImage = (reponse) => {
  const url =
    reponse?.images?.[0]?.url || reponse?.image?.url || reponse?.output?.[0] || reponse?.url;
  if (!url) throw new Error(`aucune image dans la réponse : ${JSON.stringify(reponse).slice(0, 300)}`);
  return url;
};

/** Écrit une image distante sur le disque et rend son chemin. */
export const enregistrer = async (url, destination) => {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`téléchargement du résultat impossible : HTTP ${r.status}`);
  writeFileSync(destination, Buffer.from(await r.arrayBuffer()));
  return destination;
};
