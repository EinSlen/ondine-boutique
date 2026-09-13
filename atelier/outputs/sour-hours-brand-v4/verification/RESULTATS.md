# Vérification de la vitrine SOUR HOURS V4

6 septembre 2026 · Chrome local automatisé avec Playwright, puis inspection des captures.

**22 contrôles réussis**, aucun échec ni erreur JavaScript lors de la dernière exécution. Détails horodatés dans [results.json](results.json).

## Couverture

- Huit produits et onze images sources chargés.
- Quatre filtres de catégorie, tri par prix et recherche par mot-clé.
- Ouverture de fiche depuis la recherche, vues pièce/détail/silhouette, navigation entre produits.
- Taille obligatoire avant ajout ; pas de vue portée inventée pour les accessoires.
- Ajout, modification de quantité, suppression, persistance après rechargement et export texte de la sélection.
- Entrées de stockage invalides ignorées.
- Look Cherry associé aux trois bonnes pièces.
- Absence de débordement horizontal aux largeurs 1440, 768, 390 et 320 pixels.
- Contrôles de vue ancrés à l’image sur mobile.
- Huit briefs dans l’atelier, calculateur vérifié et absence de débordement à 390 pixels.
- Présence des cibles des liens et ressources locales des deux pages HTML.

## Corrections après inspection

Une tuile de collection débordait sur tablette : largeur contrainte à sa grille. Les commandes de vue mobile étaient positionnées en bas de la modale : elles sont maintenant liées au cadre image. Les titres sur photo ont été repositionnés et contrastés pour mobile/tablette. Le cadrage de la seconde campagne a été remonté sur téléphone.

## Captures finales

- [Ordinateur](desktop.png)
- [Tablette](tablet.png)
- [Mobile, ouverture](mobile-top.png)
- [Mobile, page complète](mobile.png)
- [Fiche produit ordinateur](product.png)
- [Fiche produit mobile](mobile-product.png)
- [Dossier atelier](atelier.png)
- [Atelier mobile](atelier-mobile.png)

## Limites

Ces résultats concernent la présentation HTML locale et Chrome. Ils ne constituent pas un audit d’accessibilité complet, un test sur tous les navigateurs ni un test de paiement. Le thème Shopify possède son [rapport distinct](../shopify-theme/VALIDATION.md) ; ses données réelles, son aperçu et une commande test restent à vérifier dans Shopify avant toute publication.
