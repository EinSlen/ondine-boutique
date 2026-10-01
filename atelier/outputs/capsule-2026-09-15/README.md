# Ondine — reprise créative du 15 septembre 2026

Nouvelle proposition de travail après lecture de `REPRISE-CHATGPT.md`, de l'audit de 30 pièces et des exigences de fabrication. **Les huit concepts ne sont pas encore validés par Valentin.** Ondine désigne le projet ; la typographie sur les planches ne constitue pas une identité de marque adoptée.

[Ouvrir la présentation locale](index.html) · [Fiches de fabrication](FABRICATION.md) · [Données des pièces](collection.json) · [Prompts exacts](PROMPTS.md)

## Ce qui a réellement été créé

- Deux nouvelles planches de quatre pièces, générées avec l'outil d'image intégré : `assets/01-hauts.png` et `assets/02-bas-accessoires.png`.
- Deux directions dessinées en aplats mats : les chevaux Galop et l'iris Contrevent. Les références de l'audit servent à la composition et aux proportions ; aucune image de concurrent n'est incorporée aux nouvelles planches.
- Un motif de fines doubles rayures éditable en SVG : `sources/motif-rayures.svg`. C'est une répétition géométrique d'étude, à reporter sur les panneaux du véritable gabarit fournisseur.
- Une présentation HTML locale et huit fiches avec leurs inconnues de fabrication, sans prix ou disponibilité inventés.
- Un essai d'illustration Galop isolée, contrôlé puis **rejeté pour la production** : `verification/galop-extraction-rejetee.png`.

## Choix créatif proposé

Conserver des dessins lisibles et des silhouettes amples, tout en abandonnant le ruban brillant et l'effet d'objet en verre/3D rejetés. Palette proposée : os, charbon, marine et rouge oxyde. Le vêtement conserve une texture réaliste sur les mockups ; le décor utilise un rendu dessiné et mat.

| N° | Pièce | Proposition |
|---|---|---|
| 01 | Galop — tee, dos | Deux chevaux marine/oxyde, mouvement circulaire et trait patiné. |
| 02 | Contrevent — tee, face | Iris dessiné ivoire, vent et petit disque rouge. |
| 03 | Galop — hoodie | Paire de chevaux claire, composition plus petite sur la poitrine. |
| 04 | Rayure — manches longues | Fines rayures marine/ivoire, col marine, petit iris. |
| 05 | Ligne — pantalon | Jersey ample, taille élastiquée, doubles rayures fines. |
| 06 | Galop — casquette | Bordeaux et petit cheval clair à simplifier pour la broderie. |
| 07 | Contour — cagoule | Vraie construction tricotée, marine et bordure bordeaux. |
| 08 | Croissant — boucles | Paire asymétrique, créoles et pendentifs plats en croissant. |

Le pantalon ne remplace pas un jean baggy. Le modèle rayé en coton n'est pas remplacé par le manches longues polyester précédemment écarté. La cagoule et les boucles restent des concepts à sourcer.

## Qualité et limites observées

Les deux planches font 1122 × 1402 pixels et sont des images RGB opaques. Elles présentent des vêtements entiers : ce ne sont pas des décors d'impression. L'image isolée Galop fait 1231 × 1277 pixels, elle est également RGB opaque et contient un damier dessiné. L'essai n'apporte donc aucun fichier transparent utilisable. Il est conservé uniquement comme preuve du contrôle, sans répétition de la même extraction.

Le trait des chevaux contient des détails fins ; la version casquette réclamera un dessin simplifié distinct. Le hoodie n'utilise pas exactement la même disposition des chevaux que le tee : les deux placements doivent être préparés séparément. Le motif du manches longues est plus grand sur le rendu que les 4 cm envisagés au prompt. Les dimensions évoquées dans les prompts sont des intentions, pas des mesures vérifiées.

La teinte marine du hoodie n'est pas confirmée sur la fiche publique 5161 consultée. Ne pas créer une variante commerciale marine à partir de cette image. La liste publique de coloris ne suffit pas à établir la disponibilité de chaque taille dans le compte.

## État des accès au 15 septembre

La connexion Shopify répond pour la boutique attendue `0rsiku-r1.myshopify.com`. La requête en lecture seule de liste des applications a été validée puis refusée avec `access denied` sur `appInstallations`. Aucun connecteur Printful/Printify n'a été trouvé dans la recherche de plugins. Cela ne démontre ni leur absence dans Shopify ni l'absence de produits chez le fournisseur.

Des fiches publiques de supports ont été relues ; leurs caractéristiques et limites sont dans `FABRICATION.md`. Le compte réellement utilisé, les gabarits, les variantes et les coûts livrés France restent à confirmer.

## Reprise suivante

1. Recueillir le retour sur ces huit concepts et conserver les derniers refus. Ne pas appeler cette capsule approuvée.
2. Identifier le fournisseur dans Shopify à partir d'une capture de son application montrant son nom et son catalogue ou ses produits synchronisés. Aucune donnée de connexion ou de paiement n'est nécessaire.
3. Choisir le support et le coloris exacts, récupérer les gabarits de chaque zone. Les silhouettes sans équivalent restent en développement.
4. Préparer les décors définitifs : illustrations séparées avec transparence réelle, rayures réparties sur les panneaux, dessin de broderie simplifié. Vérifier dimensions, contours, détails et résolution réelle.
5. Vérifier coûts, variantes, correspondances fournisseur et parcours de commande avant toute mise en vente.

Cette reprise n'a modifié ni thème, ni produit, ni stock Shopify. Aucun achat, lancement ou publication de boutique n'a été effectué. Le travail est conservé dans une nouvelle branche du dépôt privé, avec la base historique intacte.
