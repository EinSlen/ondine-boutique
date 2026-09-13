/**
 * La grammaire visuelle de dead2me, écrite une fois et verrouillée.
 *
 * POURQUOI UN FICHIER DÉDIÉ : le défaut d'un générateur d'images branché sans garde-fou,
 * c'est que chaque appel part dans une direction différente. Une boutique du créneau vend
 * six motifs recyclés à l'infini, pas quarante motifs sans lien. Le style vit donc ici, en
 * un seul endroit, et aucun outil du serveur ne laisse le modèle l'inventer.
 *
 * CE QUI EST REPRIS DU CRÉNEAU ET CE QUI NE L'EST PAS : la grammaire ci-dessous (peinture à
 * la main, trois tons, silhouette anonyme, coulure bordeaux, grain photocopie) n'appartient
 * à personne, c'est un registre. Les motifs identifiables des marques concurrentes, eux,
 * sont leur travail : rien ici ne les décrit ni ne les reproduit. Voir `INTERDITS`.
 */

/**
 * Le socle envoyé à chaque génération.
 *
 * « no text » est délibéré : la typographie sort de `contenu/encre.mjs`, qui la tord et la
 * ronge mieux qu'un modèle d'image, gratuitement et sans faute d'orthographe. Le modèle ne
 * dessine que le motif, jamais la phrase.
 */
export const STYLE_BASE = [
  'raw hand-painted graphic, thick acrylic brush strokes, black marker outline',
  'deliberately crude and unpolished, drawn by hand not by a professional illustrator',
  'wet paint drips running downward, uneven bleeding edges',
  'three tones only: matte black, off-white, deep burgundy red',
  'heavy photocopy grain, high contrast, flat areas of solid ink',
  'isolated subject centred on plain flat background, generous empty margin',
].join(', ');

/**
 * Le négatif porte deux charges : le rendu (tout ce qui ferait « illustrateur pro », qui est
 * le défaut de la série du 24/08) et la conformité (arme, blessure, visage réel, logo).
 */
export const NEGATIF = [
  'clean vector art, smooth lines, polished professional illustration',
  'gradient, glossy, 3d render, photorealistic, digital painting',
  'text, letters, words, watermark, signature, logo, brand mark',
  'weapon, gun, rifle, knife, bullet, bullet hole',
  'wound, injury, blood on skin, self-harm, noose',
  'recognisable face, real person, celebrity, portrait likeness',
].join(', ');

/**
 * Les six briques de la marque.
 *
 * Le créneau ne vend pas des motifs uniques, il vend six idées recombinées : leurs 46
 * références tiennent sur six dessins croisés entre eux. Les clés `role` correspondent à
 * celles des phrases de `contenu/encre.mjs`, pour qu'un motif et une phrase tirés ensemble
 * racontent la même chose.
 */
export const BRIQUES = {
  fuite: {
    role: 'court',
    resume: 'silhouette de dos qui s\'éloigne',
    prompt:
      'a lone anonymous human silhouette walking away from the viewer, seen from behind, ' +
      'long coat, no visible face, one burgundy brush stroke slashing diagonally behind her',
  },
  combine: {
    role: 'attend',
    resume: 'combiné de téléphone décroché',
    prompt:
      'an old corded telephone handset left hanging off the hook, swinging at the end of ' +
      'its stretched coiled cord, burgundy paint dripping down the cord',
  },
  halo: {
    role: 'assis',
    resume: 'silhouette assise, halo fissuré',
    prompt:
      'an anonymous figure sitting hunched forward, face buried in both hands, a cracked ' +
      'circular halo broken behind the head, single wilted rose falling below',
  },
  porte: {
    role: 'couple',
    resume: 'deux silhouettes séparées par une porte',
    prompt:
      'two anonymous silhouettes separated by a narrow doorway, one standing still inside, ' +
      'the other already walking out of frame, hard rectangle of light between them',
  },
  cassette: {
    role: null,
    resume: 'cassette audio déroulée',
    prompt:
      'an audio cassette tape pulled apart, its magnetic ribbon unspooled and tangled ' +
      'across the whole composition, burgundy stain soaking through the tangle',
  },
  chaise: {
    role: null,
    resume: 'chaise vide renversée',
    prompt:
      'an empty office chair on casters tipped slightly back, a black jacket left hanging ' +
      'from the armrest, a dead rose on the floor beneath it',
  },
};

/**
 * Ce qui fait fermer la boutique, et pourquoi.
 *
 * L'ordre des motifs compte : le contrôle rend la PREMIÈRE raison trouvée, donc les
 * atteintes les plus nettes sont en tête. Chaque entrée porte sa justification, parce qu'un
 * refus sans raison finit toujours par être contourné.
 */
export const INTERDITS = [
  {
    motif: /\b(kurt|cobain|nirvana|amy winehouse|tupac|2pac|xxxtentacion|juice wrld)\b/i,
    raison:
      'personne réelle : droit d\'auteur du photographe, droit à l\'image de la succession, ' +
      'et marque déposée pour les noms de groupe. Printful refuse l\'image de célébrité.',
  },
  {
    motif: /\b(nike|swoosh|adidas|supreme|stussy|carhartt|disney|minecraft|louis vuitton|gucci)\b/i,
    raison: 'marque déposée d\'un tiers : contrefaçon caractérisée, retrait Shopify sur simple signalement.',
  },
  {
    motif:
      /\b(gun|guns|rifle|ak|ak-?47|glock|uzi|shotgun|revolver|pistol|handgun|firearm|bullet|bullets|ammo|shell casing|headshot)\b/i,
    raison:
      'arme à feu : interdit par les conditions de Printful et par les règles publicitaires ' +
      'Meta et TikTok. Nous sommes print-on-demand et nous faisons de la publicité, donc exposés deux fois.',
  },
  {
    // Les termes visent la personne, jamais l'objet : « hanging » tout court bloquait le
    // combiné décroché qui pend au bout du fil, et « razor » le fil barbelé. Ce sont deux
    // images centrales du registre, un contrôle qui les refuse finit par être désactivé.
    motif:
      /\b(suicide|self.?harm|noose|overdose|hang(?:ed|ing) (?:by the neck|(?:him|her|my|them)self)|hanging (?:body|figure|corpse)|razor blade|slit (?:wrist|throat)|cutting (?:her|him|my|them)self)\b/i,
    raison:
      'automutilation : suspension de compte immédiate côté TikTok et Meta, sans avertissement préalable.',
  },
  {
    motif: /\b(wound|wounds|injury|gore|stab|bleeding (?:body|arm|wrist|skin)|blood on (?:skin|face|hands))\b/i,
    raison:
      'blessure sur un corps : refusé en publicité. La tache et la coulure bordeaux abstraites, ' +
      'elles, restent autorisées et suffisent au registre.',
  },
  {
    motif: /\b(swastika|nazi|ss bolt|confederate)\b/i,
    raison: 'symbole haineux : illégal à la vente en France, hors de question.',
  },
];

/**
 * Passe un texte au crible avant qu'il ne coûte quoi que ce soit.
 *
 * Le contrôle tourne AVANT l'appel au fournisseur, pas après : une image refusée après coup
 * est une image payée pour rien, et surtout une image qu'on finit par publier « juste
 * celle-là ».
 */
export const controler = (texte) => {
  const t = String(texte || '');
  for (const { motif, raison } of INTERDITS) {
    const trouve = t.match(motif);
    if (trouve) return { ok: false, terme: trouve[0], raison };
  }
  return { ok: true };
};

/** Assemble le prompt final : brique ou sujet libre, toujours enrobé de la grammaire. */
export const composer = (sujet) => `${sujet}. ${STYLE_BASE}`;
