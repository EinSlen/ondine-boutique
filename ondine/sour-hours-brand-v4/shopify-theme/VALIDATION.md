# Validation du thème SOUR HOURS v4

Date : 6 septembre 2026. Révision validée : `sour-hours-v4`, révision 4. Client : `codex`, version `desktop`. Modèle : `gpt-6-astra`.

## Résultat

La validation statique officielle Shopify est passée pour les 32 fichiers JSON/Liquid du thème : `success: true`, 32 résultats `success`, aucune erreur signalée. Les scénarios navigateur des variantes sont passés, sans erreur JavaScript.

Dernière révision : grande signature d'ouverture configurable, choix entre deux panneaux photographiques et portrait superposé, lien éditable de la seconde photo, contraste et position du titre adaptés aux petits écrans. Les 32 fichiers ont été revalidés après ces modifications et les six contrôles navigateur des variantes ont été relancés avec succès.

| Contrôle | Résultat |
| --- | --- |
| Configuration du thème et schémas de réglages | 2 fichiers valides |
| Layout principal | 1 fichier valide |
| Traductions et schémas FR/EN | 4 fichiers valides |
| Sections et groupes de sections | 15 fichiers valides |
| Snippets partagés | 2 fichiers valides |
| Modèles JSON | 8 fichiers valides |
| Changement de variante disponible | Identifiant, prix, image et URL mis à jour ensemble |
| Variante indisponible | Bouton désactivé et soumission empêchée |
| Échec réseau pendant un changement | Sélection précédente rétablie ; disponibilité précédente conservée |
| Requête en cours | Ajout bloqué pendant le chargement |
| Changements rapides avec réponse lente | La dernière sélection reste prioritaire |
| Erreurs JavaScript du navigateur | Aucune dans les scénarios exécutés |

## Méthode

Recherches effectuées avec le script `search_docs.mjs` fourni par la compétence Shopify Liquid, notamment sur les formulaires produit/panier, les options à forte cardinalité, la localisation et les images adaptatives. Implémentation conforme aux exemples documentés du rendu de sections et aux mises à jour natives `updates[]` du panier.

Le script officiel `validate.mjs` du plugin a été exécuté en mode `--theme-path`, avec la liste de tous les fichiers JSON/Liquid et les paramètres d'instrumentation demandés. Le plugin ne disposait initialement pas de ses dépendances de validation. Une copie intacte du script et ses trois dépendances déclarées ont donc été préparées dans `C:\Users\Valentin\AppData\Local\Temp\sour-hours-theme-check-v4`, sans modification du plugin ni ajout de dépendances au livrable.

Dépendances de validation : `@shopify/theme-check-common`, `@shopify/theme-check-docs-updater` et `@shopify/theme-check-node`, toutes en version `3.24.0`.

Les scénarios de `validation/check-variants.mjs` exécutent le JavaScript extrait de la section réelle `main-product.liquid` dans Chrome headless. Les réponses de l'API Shopify y sont simulées localement afin de contrôler la disponibilité, l'échec réseau et la concurrence des requêtes. Aucun produit, panier ou paiement distant n'a été créé.

## Périmètre restant à vérifier sur Shopify

Cette validation garantit la conformité statique constatée et les comportements JavaScript testés ; elle ne constitue pas une commande test dans la boutique. Après import non publié : choisir les collections et photos, contrôler les rendus avec les données réelles, les tailles, les ruptures, les quantités, le formulaire de contact, les marchés, la livraison et un paiement en mode test Shopify. Le rendu visuel final du thème doit être vérifié dans l'aperçu Shopify, notamment après choix des deux images de couverture et des trois photos de lookbook.

Le dossier `validation` et ce rapport ne sont pas nécessaires au thème importé. Le ZIP d'installation doit contenir seulement les dossiers `config`, `layout`, `locales`, `sections`, `snippets` et `templates` à sa racine.
