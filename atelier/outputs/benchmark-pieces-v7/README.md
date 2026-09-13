# Références de vêtements — 7 septembre 2026

Ouvrir `index.html`. Connexion Internet nécessaire aux photos officielles ; aucune image de marque n'est téléchargée dans les assets de notre boutique. L'affichage distant a été contrôlé dans Chrome. Les titulaires peuvent modifier ou retirer leurs images.

## Périmètre et méthode

30 fiches produit officielles, 10 marques (9 UE et Jaded London au Royaume-Uni). Sélection éditoriale de trois pièces par marque pour comparer graphisme, construction et matière ; ni étude exhaustive du marché, ni classement indépendant des meilleures ventes. Les produits sont identifiés par un numéro, sans score commercial inventé.

Les sites consultés sont les domaines canoniques des marques, avec des marqueurs techniques Shopify dans les pages publiques. `collect.cjs` extrait les métadonnées publiques et leur date dans `references.json`. Les photos ont été inspectées dans une galerie rendue avec Chrome ; `observations.js` contient les observations de style et les conclusions, séparées du texte source. Des fiches peuvent montrer d'abord le dos ou une tenue entière ; leur lien officiel permet d'examiner les autres vues.

Les prix extraits des métadonnées sont des valeurs techniques non normalisées. Ils ne sont volontairement pas affichés comme prix comparables : les régions, promotions et métadonnées peuvent diverger du prix visible au paiement. Exemple observé : Raw Blue chez Scuffers, 89 EUR dans la métadonnée extraite contre 79 EUR dans le texte de collection renvoyé par la consultation web. Vérifier le marché France et la variante avant toute comparaison de prix.

Les mentions « All-time most wanted » de Scuffers et « Men's Bestsellers » de Jaded sont attribuées aux marques. Pas de volumes par SKU, de stock initial ou de ventes organiques vérifiés. La sélection des autres marques n'est pas présentée comme celle de leurs best-sellers.

Sources d'attribution : étude de cas Shopify sur Scuffers et étude promotionnelle de l'agence Black Comet sur Cold Culture, liées dans la page. Aucune de ces sources ne permet de garantir le succès d'une nouvelle marque ni d'identifier le meilleur produit vendu uniquement en organique.

## Décision de travail

Les prototypes SIDE HABIT initiaux ne sont pas validés. Ne pas les créer comme produits actifs, ni acheter de stock sur leur base. Poursuivre un streetwear illustré et délavé : langage d'image figuratif, proportions portées, finitions démontrables. Nude Project / Wasted / Jaded / Cold Culture sont des repères, pas une autorisation de copier leurs images ou logos. Scuffers / derschutze / Arte éclairent les matières et finitions ; ne pas tout mélanger dans chaque vêtement.

La boutique complète reste l'objectif. Ce dossier précise sa direction produit mais ne constitue ni une boutique terminée, ni une collection prête à fabriquer. Le nom SIDE HABIT reste provisoire et non juridiquement validé. Restent notamment les dessins originaux alignés, les échantillons et devis correspondants, les informations marchandes réelles, le thème fonctionnel vérifié et la validation avant mise en ligne.

## Fonctions et vérification

Filtres marque/catégorie, agrandissement clavier, repères enregistrés localement, export JSON. Aucune donnée envoyée à un serveur. L'enregistrement dépend du stockage local autorisé par le navigateur et du chemin du fichier.

`verify.cjs` vérifie les 30 cartes, le chargement des images distantes, les filtres combinés, la persistance, le dialogue, l'export et l'absence de débordement horizontal à 1440/768/390/320 px. Rapport et captures dans `verification`. Aucun test ne valide des ventes, la qualité fournisseur ou la disponibilité commerciale des références.
