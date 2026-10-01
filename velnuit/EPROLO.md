# Vérification EPROLO — 1er octobre 2026

EPROLO existe dans Shopify comme service de traitement avec gestion du stock, à l’emplacement `gid://shopify/Location/112454959432`.

Les neuf fiches VELNUIT sont en **brouillon**. Leurs quatorze variantes sont uniquement rattachées à « Emplacement de la boutique » dans la lecture effectuée. Aucun métachamp accessible sur ces produits ou variantes ne contient de référence fournisseur. Ces observations ne prouvent pas que le catalogue privé EPROLO ne contient pas les modèles : elles ne permettent pas d’établir leur liaison.

| Groupe | État vérifié | Informations manquantes |
| --- | --- | --- |
| Huit idées Chocolat & ciel | Une variante « Default Title » chacune, prix Shopify 0 €, aucune photo produit individuelle | Produit EPROLO exact, coupe, matière, mesures, tailles, photo finale, prix |
| Sweat I Love Milfs | Photo fournisseur, description indiquant polyester, six tailles S à 3XL, tableau de mesures, prix saisi 34,90 €, stock suivi à 0 | Référence et variante EPROLO, coût livré France, liaison de traitement, disponibilité et délais |

La recherche Shopify `vendor:EPROLO OR tag:eprolo` ne retourne que le sweat. Les étiquettes et le prix saisi ne constituent pas une synchronisation fournisseur.

## Accès utilisé

Les contrôles utilisent uniquement l’API Shopify autorisée. La liste des applications installées est refusée par les droits de cette connexion. Les emplacements restent lisibles et confirment le service EPROLO. La recherche de plugin EPROLO ne retourne aucun résultat. Aucun outil disponible ici ne donne accès au catalogue privé EPROLO ou à ses coûts de livraison.

## Pour terminer la liaison

1. Dans Shopify → Applications → EPROLO, retrouver le produit exact et les variantes. Pour les huit concepts, chercher les modèles compatibles et vérifier les matériaux et proportions ; une image de concept ne suffit pas.
2. Utiliser la fonction de liaison/import de l’application EPROLO. Préserver les fiches existantes et vérifier qu’aucun doublon n’est créé.
3. Confirmer chaque correspondance taille/couleur, puis le traitement et le suivi de stock dans l’application. Déplacer un stock vers un emplacement EPROLO à la main ne prouve pas cette correspondance.
4. Relever coût produit, transport France, devise, frais éventuels et délai annoncé. Le prix 34,90 € reste à confirmer ; aucun coût ni marge n’a été inventé.
5. Compléter `catalogue.json` avec les références et preuves, puis retirer uniquement les étiquettes devenues obsolètes (`eprolo-a-raccorder`, `fabrication-a-valider`, `prix-a-confirmer`).

Le thème affiche les idées de collection et la fiche fournisseur du sweat en avant-première. Les vrais produits et variantes proviennent ensuite du catalogue Shopify. Aucune commande d’échantillon n’est requise pour continuer ce travail ; sans échantillon, le rendu physique demeure non vérifié.
