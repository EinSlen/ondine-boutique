# Fournisseurs et anciennes fiches — contrôle du 10.09.2026

Le contrôle Shopify en lecture seule ne fournit aucune référence fournisseur déjà reliée parmi les produits inspectés. Il révèle aussi cinq anciennes fiches publiées sur le canal Boutique en ligne dont les variantes sont déclarées vendables, sans rattachement à Printful ou Printify observé dans leurs emplacements de stock.

## Périmètre exact

Dix premières fiches renvoyées par la recherche du catalogue, plus le produit existant Call me later — Tee consulté individuellement : **11 produits et 52 variantes**. Toutes les variantes et tous les emplacements de ces produits ont été lus ; aucune pagination imbriquée ne reste ouverte. La recherche du catalogue, elle, indique qu’il existe d’autres fiches. Elles n’ont pas été parcourues automatiquement. Ce n’est donc pas un audit exhaustif du catalogue.

Source de preuve datée : `snapshot-2026-09-10.json`. Requêtes en lecture seule : `provider-links.graphql`, `provider-locations.graphql`, `provider-sales-state.graphql`. Schémas inspectés et trois opérations validées par les outils Shopify et le script officiel `shopify-admin/scripts/validate.mjs`, révision 1. La compétence Shopify Admin a guidé les liaisons entre variantes, emplacements et services, sans supposer qu’une application installée prouve une synchronisation.

## Ce qui est confirmé

- Emplacements Printful et Printify présents et actifs, associés à leurs services respectifs.
- Les 52 variantes contrôlées sont rattachées uniquement à « Emplacement de la boutique », sans service de traitement associé.
- Aucun coût unitaire n’est renseigné dans les objets de stock inspectés : valeur `null`, et non coût nul. Même un coût Shopify renseigné ne suffirait pas à établir le devis fournisseur livré en France.
- Le brouillon Call me later — Tee reste DRAFT, ses six variantes ont le suivi de stock activé et aucune n’est reliée aux emplacements fournisseurs.
- Les cinq anciennes fiches ci-dessous ont une URL Boutique en ligne non nulle ; Shopify déclare leurs 25 variantes `availableForSale: true`. Le suivi de stock est désactivé pour ces 25 variantes. Le nombre de stock affiché à zéro n’est donc pas une preuve de blocage des ventes.

## Les cinq fiches à décider avant modification

| Fiche exacte | ID produit | État lu | Variantes déclarées vendables | Rattachement fournisseur observé |
| --- | --- | --- | --- | --- |
| SPLIT FIGURES ZIP | 10233685999944 | ACTIVE, publiée Boutique en ligne | 5 / 5 | Aucun |
| SEATED FIGURE ZIP | 10233686163784 | ACTIVE, publiée Boutique en ligne | 5 / 5 | Aucun |
| TABLE ALONE ZIP | 10233686393160 | ACTIVE, publiée Boutique en ligne | 5 / 5 | Aucun |
| AFTERMATH ZIP | 10233686524232 | ACTIVE, publiée Boutique en ligne | 5 / 5 | Aucun |
| RUN AWAY TEE | 10233686557000 | ACTIVE, publiée Boutique en ligne | 5 / 5 | Aucun |

Ce constat appelle une décision sur leur maintien en vente pendant la refonte. Aucune fiche n’a été repassée en brouillon : attendre l’accord explicite de Valentin avant de suspendre des produits existants. Une éventuelle remise en DRAFT ne serait pas une suppression ; il faudrait néanmoins relire les cinq produits juste avant l’action et vérifier leur statut après.

## Ce qui n’est pas établi

Nous n’avons pas accédé aux comptes Printful ou Printify et n’avons pas exclu un éventuel processus de commande manuelle. L’absence de lien d’emplacement ne prouve pas que le compte fournisseur ne possède aucun produit. Aucun fichier de décor, SKU interne fournisseur, atelier, coût France, paiement fournisseur ou délai de production n’a été confirmé.

L’état `availableForSale` et la publication d’une fiche ne constituent pas un test de paiement : nous n’avons créé ni panier, ni commande, ni paiement pour ces anciennes références. L’accès éventuel par mot de passe et la configuration du checkout n’ont pas été testés ici.

## Conséquence pour la nouvelle boutique

Ne pas réutiliser les anciennes mentions « fabriqué en Europe », les prix ou les descriptions de matières comme des caractéristiques vérifiées de la prochaine collection. Ne pas affirmer que l’installation des applications rend automatiquement fabricables les dessins générés.

Pour relier une prochaine pièce, il faudra identifier dans l’application fournisseur le support et la variante exacts, vérifier le décor et la livraison France, puis synchroniser la correspondance avec Shopify. Le choix de travailler sans échantillon reste respecté ; aucun achat ni changement de fournisseur n’est demandé par ce contrôle.

La direction graphique reste en pause après le rejet du téléphone. Les tests techniques réussis ne valident pas cette direction. Le nom, les designs, les fichiers de production, les coûts et l’intégration fournisseur restent nécessaires pour terminer la boutique.

Pour étendre le contrôle du catalogue, Valentin peut demander soit de charger la suite des résultats, soit de cibler une catégorie ou un produit. Ne pas conclure sur les fiches non inspectées.

Documentation des champs : [InventoryItem](https://shopify.dev/docs/api/admin-graphql/latest/objects/InventoryItem), [InventoryLevel](https://shopify.dev/docs/api/admin-graphql/latest/objects/InventoryLevel), [Location](https://shopify.dev/docs/api/admin-graphql/latest/objects/Location), [Product](https://shopify.dev/docs/api/admin-graphql/latest/objects/Product), [ProductVariant](https://shopify.dev/docs/api/admin-graphql/latest/objects/ProductVariant).
