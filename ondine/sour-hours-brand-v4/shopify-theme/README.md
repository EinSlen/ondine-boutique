# SOUR HOURS — thème Shopify 4

Thème Online Store 2.0 autonome, préparé localement pour la direction « Les heures à soi ». Il utilise les véritables produits, variantes, prix, images, disponibilités et panier Shopify. Le showroom voisin est une présentation créative ; ses mockups ne sont pas chargés automatiquement dans la boutique.

## Installation

1. Compresser les dossiers `config`, `layout`, `locales`, `sections`, `snippets` et `templates` à la racine du ZIP. Ajouter ce ZIP comme thème non publié dans Shopify, puis ouvrir son aperçu.
2. Configurer la langue française comme langue de la boutique si souhaité. Les traductions françaises et anglaises de l'interface sont incluses. Les textes éditoriaux par défaut sont en français et se modifient dans l'éditeur de thème.
3. Créer les produits retenus dans Shopify avec les données confirmées par les échantillons : variantes, tailles, stock, prix, poids, composition, provenance, entretien et photos. Associer chaque produit au canal Boutique en ligne uniquement quand il est prêt.
4. Créer une collection « Le vestiaire » et la sélectionner dans la section Collection à la une. Les fiches et la collection n'affichent aucun produit fictif en attendant.
5. Choisir la grande photo de couverture puis le second portrait. La composition par défaut « Deux panneaux éditoriaux » reprend l'ouverture de la vitrine locale, avec la grande signature au-dessus. La composition « Portrait superposé » est également disponible. Modifier le repère de collection, la légende et le lien de la seconde photo dans cette même section. Ajouter les photos d'histoire et les trois images du lookbook, puis relier chaque tenue à son produit ou sa collection avec le sélecteur de lien. Le lookbook sans images reste masqué hors de l'éditeur. Les visuels conceptuels voisins peuvent servir pour le brouillon ; remplacer par les photos des échantillons approuvés avant commercialisation.
6. Configurer les menus d'en-tête et de pied de page. Créer une page Contact utilisant le modèle `page.contact`. Renseigner les politiques dans Shopify : seules les politiques existantes apparaissent au pied de page. Configurer les marchés, paiements et zones de livraison dans Shopify.
7. Tester une commande en mode test Shopify, le changement de taille/couleur, les ruptures, les quantités, la remise éventuelle, le contact et les frais de livraison. Publier seulement après ces contrôles dans la vraie boutique.

## Produits prévus

| Identifiant proposé | Pièce |
| --- | --- |
| raw-hours-hoodie | Raw Hours Hoodie |
| double-cherry-tee | Double Cherry Tee |
| sidewalk-longsleeve | Sidewalk Longsleeve |
| afterhours-zip | Afterhours Zip |
| daily-curve-jeans | Daily Curve Jeans |
| off-duty-track-pants | Off Duty Track Pants |
| soft-shell-balaclava | Soft Shell Balaclava |
| half-loop-earrings | Half Loop Earrings |

Le thème accepte tout identifiant et toute collection ; cette liste relie simplement les concepts du projet aux futures fiches.

## Réglages nécessaires pour retrouver la vitrine locale

Les sélecteurs Shopify restent volontairement vides dans le ZIP : des chemins locaux ne peuvent pas devenir des images Shopify ni créer des produits. Importer les fichiers voulus dans Shopify, puis effectuer ces associations dans l'éditeur :

| Emplacement | Fichier dans le dossier `assets` voisin | Destination à choisir |
| --- | --- | --- |
| Ouverture, image principale | `campaign.png` | Collection « Le vestiaire » pour le bouton principal |
| Ouverture, seconde image | `look-cherry.png` | Produit Double Cherry Tee pour le lien de la seconde photo |
| Collection à la une | Images des huit produits, chacune sur sa fiche Shopify | Collection « Le vestiaire », nombre 8 |
| Lookbook 01, Bleu sur bleu | `campaign.png` | Collection de look contenant Raw Hours Hoodie et Daily Curve Jeans |
| Lookbook 02, Beurre & chocolat | `look-sidewalk.png` | Collection de look contenant Sidewalk Longsleeve et Off Duty Track Pants |
| Lookbook 03, Juste une touche | `look-cherry.png` | Collection de look contenant Double Cherry Tee, Afterhours Zip et Daily Curve Jeans |

Créer les collections de looks pour qu'un clic ouvre toutes les pièces de la tenue. Aucun produit ou lien vers une collection inexistante n'est ajouté automatiquement. La vitrine locale utilise des modales de sélection de concepts ; le thème ouvre de vraies pages produit et un panier Shopify. Il n'a donc pas les boutons de changement de vue flottants de la modale locale.

La grille Shopify présente les vrais produits, sans la tuile photographique intercalée de la vitrine HTML. Les images de l'ouverture, de l'histoire et du lookbook sont à régler séparément dans l'éditeur ; l'import du ZIP ne les téléverse pas.

## Fonctionnement

- Navigation éditable, grande signature d'ouverture, couverture à deux panneaux ou avec portrait superposé, collection, lookbook de trois tenues avec liens, histoire et détails de fiche éditables. Grand mot-symbole en pied de page.
- Accueil, collection avec tri et pagination, produit, panier, recherche, page, contact et 404.
- Options produit rendues côté serveur ; changement de combinaison via l'API de rendu de section pour mettre à jour ensemble variante, prix, disponibilité et image. Aucun catalogue de variantes intégral téléchargé en JavaScript.
- Ajout au panier par formulaire Shopify natif ; variantes absentes ou indisponibles bloquées ; panier natif avec mises à jour, suppression par ligne, remises affichées et paiement.
- Interface mobile, navigation clavier, mouvement réduit, liens d'évitement, langues et pays lorsque configurés.
- Aucun avis, achat récent, compteur de rareté, délai de livraison ou caractéristique de vêtement inventé.

## Vérification et limites

Résultats de validation dans `VALIDATION.md`. Le dossier `validation` contient uniquement les contrôles locaux et doit rester hors du ZIP du thème. Aucune boutique distante n'a été modifiée. La validation statique et les scénarios de navigateur avec données simulées ne remplacent pas l'aperçu Shopify, les données réelles et la commande test. La compatibilité des apps, des abonnements et des fiches combinées doit être vérifiée avec les apps réellement installées. Les comptes clients sont gérés par Shopify ; aucune page de compte classique personnalisée n'est incluse. Sans JavaScript, le sélecteur de secours affiche jusqu'à 250 variantes et demande d'appliquer la sélection avant l'ajout ; avec JavaScript, les options sont résolues côté serveur sans cette limite de chargement.
