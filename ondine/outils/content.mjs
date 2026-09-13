/**
 * Contenu de la boutique dead2me. Toute la matière rédactionnelle est ici,
 * provision.mjs ne fait que l'écrire dans Shopify.
 *
 * Les placeholders au format __MAJUSCULES__ sont bloquants : provision.mjs refuse
 * d'écrire tant qu'il en reste un. Ils attendent le SIRET et l'adresse, donc
 * l'immatriculation au guichet unique INPI.
 *
 * Prix et coûts : voir COUTS.md et PUB.md à la racine du projet. Les prix ci-dessous
 * sont ceux de la phase 1, micro-entreprise en franchise de TVA.
 */

export const BRAND = {
  name: "dead2me",
  displayName: "dead2me",
  baseline: "Un motif, un exemplaire.",
  domain: "dead2me.fr",
  email: "contact@dead2me.fr",
  // Franchise en base de TVA, seuil 85 000 EUR de chiffre d'affaires annuel.
  // La mention est obligatoire sur les factures et les pages de vente.
  tvaMention: "TVA non applicable, article 293 B du CGI.",
  legal: {
    forme: "Entreprise individuelle",
    exploitant: "__NOM_PRENOM__",
    siret: "__SIRET__",
    adresse: "__ADRESSE_COMPLETE__",
    hebergeur:
      "Shopify International Limited, Victoria Buildings, 1-2 Haddington Road, Dublin 4, D04 XN32, Irlande",
    mediateur: "__NOM_ET_SITE_DU_MEDIATEUR__",
  },
};

/**
 * Catalogue. `printful` donne l'identifiant du produit de base et son coût rendu
 * mesuré, pour pouvoir recalculer une marge sans rouvrir les scripts de mesure.
 * `serie` distingue les deux étages de l'offre :
 *   ouverte  = stock illimité, reçoit la publicité, reste dans le flux catalogue
 *   unique   = un seul exemplaire, organique seulement, EXCLU du flux catalogue
 */
export const CATALOGUE = [
  {
    handle: "sweat-capuche-tirage-unique",
    title: "Sweat à capuche, tirage unique",
    serie: "unique",
    prix: "119.00",
    sku: "D2M-AOP-HOOD",
    printful: { id: 388, coutRendu: 45.95, coutRemise: 38.16 },
    type: "Sweat à capuche",
    // Un tirage unique existe en UNE taille et a UN exemplaire, sinon il n'est pas unique.
    // Changer la taille ici quand on remet une piece en ligne.
    tailles: ["L"],
    tags: ["all-over print", "coton recyclé", "fabriqué en Europe"],
    resume:
      "Un seul exemplaire. Le motif est imprimé sur le tissu avant la couture, capuche et manches comprises.",
    corps: `
<p>Une pièce, un motif, un exemplaire. Quand celle-ci part, elle ne revient pas et le motif
est retiré.</p>
<p><strong>Imprimé avant la couture.</strong> Le tissu passe sous l'imprimante en pièces
détachées, puis il est coupé et cousu. Le motif couvre donc la totalité du vêtement, capuche,
manches et poche comprises, sans bord ni raccord visible. C'est ce qui distingue cette pièce
d'un logo posé sur un sweat vierge.</p>
<p>Coton recyclé, coupe unisexe, imprimé et cousu en Europe. Guide des tailles en bas de
page, la tolérance de fabrication est de 2 cm.</p>
<p><strong>Cette pièce existe en taille L uniquement, à un seul exemplaire.</strong> C'est ce
qui la rend unique : il n'y a pas de déclinaison de tailles derrière.</p>
<p>Pièce numérotée. Le numéro figure sur la facture, il n'est attribué qu'une fois.</p>`,
  },
  {
    handle: "sweat-col-rond-serie-ouverte",
    title: "Sweat col rond",
    serie: "ouverte",
    prix: "99.00",
    sku: "D2M-AOP-CREW",
    printful: { id: 320, coutRendu: 38.03, coutRemise: 31.82 },
    type: "Sweat",
    tailles: ["XS", "S", "M", "L", "XL", "2XL", "3XL"],
    tags: ["all-over print", "coton recyclé", "fabriqué en Europe"],
    resume:
      "Motif imprimé sur le tissu avant la couture. Coton recyclé, cousu en Europe.",
    corps: `
<p>Le motif est imprimé sur le tissu avant que la pièce soit coupée et cousue. Il couvre le
vêtement entier, épaules et manches comprises.</p>
<p>Coton recyclé, coupe unisexe droite. Imprimé et cousu en Europe, expédié depuis la
Lettonie ou l'Espagne.</p>
<p>Cette pièce fait partie d'une série ouverte : elle reste disponible tant que le motif est
en catalogue. Les tirages uniques, eux, sont dans la collection dédiée et ne reviennent
jamais.</p>`,
  },
  {
    handle: "sweat-imprime",
    title: "Sweat à capuche imprimé",
    serie: "ouverte",
    prix: "69.00",
    sku: "D2M-DTF-HOOD",
    // Emplacement DEVANT uniquement, c'est le seul inclus dans le prix de base. Ajouter le dos
    // coute 5,95 EUR chez Printful, ce qui mange un quart de la marge de cette piece.
    printful: { id: 146, coutRendu: 26.05, coutRemise: 22.24, emplacement: "front" },
    type: "Sweat à capuche",
    tailles: ["S", "M", "L", "XL", "2XL"],
    tags: ["imprimé", "fabriqué en Europe"],
    resume: "Sweat molletonné, grand imprimé devant. Fabriqué en Europe.",
    corps: `
<p>Molleton épais, coupe unisexe, grand imprimé devant.</p>
<p>Contrairement aux pièces all-over print, le motif est ici posé sur un vêtement déjà cousu.
C'est ce qui permet ce prix. Le rendu est un grand imprimé net, pas une pièce couverte
d'un bord à l'autre.</p>
<p>Imprimé en Europe. Guide des tailles en bas de page.</p>`,
  },
  {
    handle: "t-shirt-heavyweight",
    title: "T-shirt heavyweight",
    serie: "ouverte",
    prix: "39.00",
    sku: "D2M-TEE-HW",
    printful: { id: 586, coutRendu: 17.88, coutRemise: 15.26 },
    type: "T-shirt",
    tailles: ["S", "M", "L", "XL", "2XL"],
    tags: ["imprimé", "coton épais", "fabriqué en Europe"],
    resume: "Coton épais teint en pièce, tombé lourd. Imprimé en Europe.",
    corps: `
<p>Coton épais teint en pièce, plus lourd et moins transparent qu'un t-shirt standard. Le
teint en pièce donne une couleur légèrement irrégulière, chaque lot est un peu différent.</p>
<p>Coupe unisexe droite. Imprimé en Europe.</p>`,
  },
  {
    handle: "bonnet",
    title: "Bonnet",
    serie: "ouverte",
    prix: "35.00",
    sku: "D2M-AOP-BEANIE",
    printful: { id: 458, coutRendu: 18.06, coutRemise: 15.41 },
    type: "Bonnet",
    tailles: ["S", "M", "L"],
    tags: ["all-over print", "fabriqué en Europe"],
    resume: "Motif imprimé sur toute la surface. Trois tailles.",
    corps: `
<p>Le motif couvre toute la surface du bonnet, coutures comprises.</p>
<p>Trois tailles, du tour de tête 53 cm au 62 cm. Le tableau est en bas de page.</p>`,
  },
];

export const COLLECTIONS = [
  {
    handle: "tirages-uniques",
    title: "Tirages uniques",
    description: `
<p>Un motif, un exemplaire. Chaque pièce de cette collection est la seule de son motif. Quand
elle part, le motif est retiré du catalogue et n'est jamais réutilisé.</p>
<p>Ces pièces ne sont pas mises en avant en publicité. Elles ne peuvent pas l'être : une
référence à un seul exemplaire disparaît avant qu'une campagne ait fini de s'installer.</p>`,
    rule: "unique",
  },
  {
    handle: "serie-ouverte",
    title: "Série ouverte",
    description: `
<p>Les pièces disponibles en continu tant que leur motif est en catalogue. Même fabrication,
même provenance, sans la rareté.</p>`,
    rule: "ouverte",
  },
];

export const PAGES = {
  "a-propos": {
    title: "À propos",
    body: `
<p>dead2me imprime des motifs sur des vêtements, un exemplaire à la fois pour les tirages
uniques, en série ouverte pour le reste.</p>
<p><strong>Ce que veut dire all-over print.</strong> Le tissu est imprimé en pièces détachées
avant d'être coupé et cousu. Le motif couvre donc le vêtement entier, sans bord ni raccord.
C'est plus long et plus cher qu'un imprimé posé sur un vêtement fini, et c'est la seule
technique qui rend une pièce couverte d'un bout à l'autre.</p>
<p><strong>Où c'est fabriqué.</strong> En Europe, en Lettonie ou en Espagne selon la pièce.
Rien ne passe par un entrepôt intermédiaire, chaque commande est fabriquée puis expédiée
directement.</p>
<p><strong>Ce qui n'est pas dit ici.</strong> Ces pièces ne sont pas peintes à la main. Elles
sont imprimées. La rareté des tirages uniques est réelle, un motif utilisé une fois est
retiré, mais elle vient de la manière de gérer le catalogue, pas d'un geste d'artisan.</p>
<p>Contact : ${BRAND.email}</p>`,
  },

  "guide-des-tailles": {
    title: "Guide des tailles",
    body: `
<p>Toutes les mesures sont en centimètres. Les pièces étant fabriquées à l'unité, la tolérance
de fabrication est de 2 cm. Entre deux tailles, prends la plus grande.</p>
<p>Ce guide est la meilleure façon d'éviter un retour, et un retour de vêtement n'est pas
repris par l'atelier. Prends deux minutes.</p>
__TABLEAUX_TAILLES__
<h3>Comment mesurer</h3>
<p><strong>Tour de poitrine</strong> : sous les bras, à l'endroit le plus large, mètre à plat
et non serré.</p>
<p><strong>Tour de taille</strong> : au creux, au-dessus du nombril.</p>
<p><strong>Tour de hanches</strong> : à l'endroit le plus large.</p>
<p><strong>Largeur à plat</strong> : pose un vêtement que tu portes déjà à plat et mesure d'une
couture d'emmanchure à l'autre. Compare avec le tableau.</p>`,
  },

  livraison: {
    title: "Livraison",
    body: `
<p>Chaque pièce est fabriquée à la commande, il n'y a pas de stock. Le délai se lit donc en
deux parties.</p>
<p><strong>Fabrication</strong> : 2 à 7 jours ouvrés. Les pièces all-over print sont dans le
haut de la fourchette, elles sont imprimées puis cousues.</p>
<p><strong>Transport</strong> : 3 à 6 jours ouvrés vers la France métropolitaine, depuis la
Lettonie ou l'Espagne.</p>
<p>Soit 5 à 13 jours ouvrés au total. Le suivi est envoyé par courriel dès l'expédition.</p>
<p><strong>Frais de port</strong> : 4,90 € en France métropolitaine, offerts à partir de 90 €
de commande. Union européenne : 7,90 €.</p>
<p>Une commande de plusieurs pièces peut arriver en deux colis si les pièces ne sont pas
fabriquées au même endroit. Aucun frais supplémentaire dans ce cas.</p>`,
  },

  retours: {
    title: "Retours et remboursements",
    body: `
<p><strong>Droit de rétractation.</strong> Tu disposes de 14 jours à compter de la réception
pour changer d'avis, sans avoir à te justifier. Écris à ${BRAND.email} avec ton numéro de
commande, nous t'envoyons la procédure. Le remboursement est fait sous 14 jours après
réception de la pièce, sur le moyen de paiement d'origine.</p>
<p>Les frais de retour sont à ta charge, sauf si la pièce est défectueuse ou ne correspond pas
à la commande. Dans ce cas, ils sont pour nous.</p>
<p>La pièce doit revenir non portée et non lavée, étiquettes en place.</p>
<p><strong>Pièce abîmée, impression décalée, mauvaise taille envoyée.</strong> Envoie une photo
à ${BRAND.email} dans les 30 jours. La pièce est refaite ou remboursée, sans retour à
effectuer et sans frais.</p>
<p><strong>Garanties légales.</strong> Indépendamment de ce qui précède, tu bénéficies de la
garantie légale de conformité, articles L217-3 et suivants du code de la consommation, pendant
deux ans à compter de la délivrance, et de la garantie des vices cachés, articles 1641 et
suivants du code civil.</p>
<p><strong>Ce qui n'est pas repris.</strong> Une pièce personnalisée à la demande d'un client
sur un motif qu'il fournit. Les tirages uniques du catalogue, eux, sont des articles standard
et restent couverts par le droit de rétractation.</p>`,
  },

  cgv: {
    title: "Conditions générales de vente",
    body: `
<p>Vendeur : ${BRAND.legal.exploitant}, ${BRAND.legal.forme}, SIRET ${BRAND.legal.siret},
${BRAND.legal.adresse}. Courriel : ${BRAND.email}.</p>

<h3>1. Objet</h3>
<p>Les présentes conditions régissent les ventes conclues sur ${BRAND.domain}. Passer commande
implique leur acceptation.</p>

<h3>2. Produits</h3>
<p>Les vêtements sont fabriqués à la commande. Les photos de présentation sont des rendus du
motif appliqué au vêtement réellement expédié. La couleur perçue peut varier selon l'écran.
Les pièces présentées comme tirages uniques le sont réellement : le motif est retiré du
catalogue après la vente.</p>

<h3>3. Prix</h3>
<p>Les prix sont indiqués en euros, toutes taxes comprises, hors frais de livraison indiqués
avant le paiement. ${BRAND.tvaMention}</p>

<h3>4. Commande et paiement</h3>
<p>La commande est ferme à la confirmation du paiement. Paiement par carte bancaire et par les
moyens proposés au moment du règlement, traités par Shopify Payments. Aucune donnée bancaire
n'est conservée par le vendeur.</p>

<h3>5. Livraison</h3>
<p>Délais et frais détaillés sur la page Livraison. En cas de retard supérieur à 30 jours après
la commande, tu peux résoudre la vente et obtenir un remboursement intégral.</p>

<h3>6. Rétractation</h3>
<p>14 jours à compter de la réception, conditions détaillées sur la page Retours.</p>

<h3>7. Garanties</h3>
<p>Garantie légale de conformité de deux ans, articles L217-3 et suivants du code de la
consommation. Garantie des vices cachés, articles 1641 et suivants du code civil.</p>

<h3>8. Données personnelles</h3>
<p>Les données collectées servent au traitement de la commande, à la livraison et au service
client. Elles ne sont ni vendues ni cédées. Droits d'accès, de rectification, d'effacement et
d'opposition exerçables à ${BRAND.email}. Réclamation possible auprès de la CNIL.</p>

<h3>9. Litiges</h3>
<p>En cas de désaccord, écris d'abord à ${BRAND.email}. À défaut d'accord, tu peux saisir
gratuitement le médiateur de la consommation ${BRAND.legal.mediateur}. Droit français
applicable.</p>`,
  },

  "mentions-legales": {
    title: "Mentions légales",
    body: `
<p><strong>Éditeur du site</strong><br>
${BRAND.legal.exploitant}<br>
${BRAND.legal.forme}<br>
SIRET ${BRAND.legal.siret}<br>
${BRAND.legal.adresse}<br>
${BRAND.email}</p>
<p>${BRAND.tvaMention}</p>
<p><strong>Hébergeur</strong><br>${BRAND.legal.hebergeur}</p>
<p><strong>Médiateur de la consommation</strong><br>${BRAND.legal.mediateur}</p>
<p><strong>Propriété intellectuelle</strong><br>Les motifs et les visuels de ce site sont la
propriété de l'éditeur. Toute reproduction sans autorisation est interdite.</p>`,
  },

  faq: {
    title: "Questions fréquentes",
    body: `
<h3>Pourquoi un tirage unique coûte plus cher</h3>
<p>Même fabrication, même coût de production. Ce qui change est que le motif ne sert qu'une
fois, alors qu'un motif de série ouverte est amorti sur des dizaines de pièces.</p>

<h3>Les pièces sont-elles peintes à la main</h3>
<p>Non. Elles sont imprimées. Sur les pièces all-over print, l'impression est faite sur le
tissu avant la couture, ce qui donne une couverture complète du vêtement, mais il s'agit
d'impression et pas de peinture.</p>

<h3>Un motif peut-il revenir</h3>
<p>Pas pour un tirage unique, c'est le principe et c'est vérifiable, la fiche disparaît. Un
motif de série ouverte reste disponible tant qu'il est au catalogue.</p>

<h3>Comment laver</h3>
<p>À l'envers, à 30 degrés, sans sèche-linge et sans repassage direct sur le motif. L'impression
est dans la fibre sur les pièces all-over print, elle ne s'écaille pas, mais la chaleur sèche
abîme la couleur.</p>

<h3>Je me suis trompé de taille</h3>
<p>14 jours pour changer d'avis, voir la page Retours. Le guide des tailles est le meilleur
moyen de ne pas en arriver là, les mesures y sont réelles et en centimètres.</p>

<h3>Où sont fabriquées les pièces</h3>
<p>En Lettonie ou en Espagne selon la pièce, par un atelier partenaire. Rien n'est fabriqué
hors d'Europe.</p>`,
  },
};

/** Courriels transactionnels, à coller dans Shopify, Paramètres, Notifications. */
export const EMAILS = {
  confirmation: {
    objet: "Commande {{ order_name }} confirmée",
    corps: `Ta commande est enregistrée.

Chaque pièce est fabriquée à la commande. Compte 2 à 7 jours ouvrés de fabrication, puis 3 à 6
jours de transport. Tu reçois le numéro de suivi dès l'expédition.

Si tu as commandé un tirage unique, son motif vient d'être retiré du catalogue.

Une question : ${BRAND.email}`,
  },
  expedition: {
    objet: "Commande {{ order_name }} expédiée",
    corps: `C'est parti. Le suivi est dans ce courriel.

Si la pièce arrive abîmée ou mal imprimée, envoie une photo à ${BRAND.email} : elle est refaite
ou remboursée, sans retour à faire et sans frais.

Tu as 14 jours après réception pour changer d'avis.`,
  },
};

/** Réponses toutes prêtes pour le service client. */
export const SUPPORT_MACROS = [
  {
    cas: "Où est ma commande",
    reponse: `Ta commande est en fabrication. Le délai est de 2 à 7 jours ouvrés avant
expédition, puis 3 à 6 jours de transport. Je te confirme le suivi dès qu'il est disponible.`,
  },
  {
    cas: "Pièce abîmée ou mal imprimée",
    reponse: `Envoie-moi une photo de la pièce et de l'étiquette. Je la fais refaire ou je te
rembourse, à ton choix. Tu n'as rien à renvoyer et rien à payer.`,
  },
  {
    cas: "Mauvaise taille",
    reponse: `Tu as 14 jours après réception pour la retourner, non portée et non lavée. Les
frais de retour sont à ta charge dans ce cas. Dis-moi la taille voulue, je peux préparer
l'échange dès que le retour est en route.`,
  },
];

export const PRICING = Object.fromEntries(
  CATALOGUE.map((p) => [p.handle, { prix: p.prix, sku: p.sku, serie: p.serie }]),
);
