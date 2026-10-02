# État VELNUIT — 1er octobre 2026

L’avant-première VELNUIT est installée, ses pages utiles sont publiées et les contrôles navigateur sont réussis. **La vente n’est pas ouverte.** Le thème VELNUIT reste non publié ; le domaine public utilise encore le thème principal DEAD2ME.

- [Aperçu VELNUIT](https://0rsiku-r1.myshopify.com/?preview_theme_id=190185144648)
- [Éditeur du thème](https://0rsiku-r1.myshopify.com/admin/themes/190185144648/editor)
- [Changements GitHub — PR #1](https://github.com/EinSlen/ondine-boutique/pull/1)
- [Contrôles réussis](https://github.com/EinSlen/ondine-boutique/actions/runs/36859476065)
- [ZIP Shopify](https://github.com/EinSlen/ondine-boutique/actions/runs/36859476065/artifacts/11160826733)
- [Captures et résultats navigateur](https://github.com/EinSlen/ondine-boutique/actions/runs/36859476065/artifacts/11160881779)

## Site installé et vérifié

Thème `190185144648` : campagne Chocolat & ciel, huit concepts, filtres Femme/Homme, sweat fournisseur et mesures, collections natives, variantes, panier, recherche, contact et localisation. Les liens Femme/Homme affichent leurs concepts dans l’avant-première et leurs collections lorsque les ventes sont ouvertes. Les collections vides sont masquées sur l’accueil en avant-première. Titre et description de l’accueil utilisent VELNUIT.

Quatre pages sont **publiées**, finalisées pour l’avant-première et reliées au menu `velnuit-footer` utilisé par le nouveau thème :

| Page | Identifiant | URL |
| --- | --- | --- |
| À propos | 157134618952 | /pages/velnuit-a-propos |
| Guide des tailles | 157134651720 | /pages/velnuit-guide-des-tailles |
| Livraison | 157134684488 | /pages/velnuit-livraison |
| FAQ | 157134717256 | /pages/velnuit-faq |

Le formulaire Contact existant est conservé. Le guide inclut les mesures fournisseur du sweat. La page Livraison ne promet ni les anciens tarifs ni un délai inconnu.

Commit de code vérifié : `68567c7f3e0cd1daf36960a21963a1d2f5f24313`.
- Structure/traductions/JavaScript : réussite, 44 fichiers source.
- Shopify Theme Check : **0 erreur**, 81 avertissements de classes CSS communes définies hors des sections.
- Relecture Shopify : **43 fichiers installables identiques aux sources**, JSON comparé sans les commentaires générés.
- Chromium : **22 vérifications réussies**, en 1440 × 1000 et 390 × 844. Accueil, images réellement chargées, filtres, navigation Femme/mobile, absence de débordement horizontal, quatre pages, champs Contact, panier vide, recherche et 404. Le sweat brouillon reste inaccessible à l’achat.
- Aucune commande ni soumission du formulaire : livraison des messages, paiement, variantes d’un produit actif et traitement EPROLO ne sont pas validés par ce test.

## Vérification de l’ouverture

| Élément | État observé |
| --- | --- |
| HTTPS | Activé |
| Mot de passe storefront | Désactivé ; ancien thème public |
| Marché | France actif |
| Catalogue VELNUIT | 9 brouillons, 14 variantes |
| Concepts | 8 fiches à 0 €, fournisseur exact non confirmé |
| Sweat | Photo et 6 tailles ; prix saisi 34,90 € non validé, stock 0 |
| EPROLO | Service et emplacement présents, liaison des variantes non confirmée par les données accessibles |
| Livraison | Ancien profil général ; 3 emplacements sans tarifs, dont EPROLO |
| Paiement | Lecture du compte Shopify Payments refusée par les droits de la connexion ; activation et encaissement non vérifiables ici |
| Légal | Identité du vendeur non fournie ; anciennes pages/politique DEAD2ME et CGV incomplètes |

Le profil général conserve France 7,99 € / gratuit à partir de 65 € / Express 10,99 €, UE 22 €, international 29 €. Ces tarifs ne sont pas validés pour les nouveaux produits. Seul l’emplacement de la boutique appartient au groupe avec tarifs. Les coûts et délais EPROLO demeurent inconnus.

Le SIRET n’est pas nécessaire pour développer le site. L’ouverture de ventes professionnelles nécessite la formalisation applicable au vendeur et des informations légales exactes ; aucun nom, adresse, numéro ni médiateur n’a été inventé.

[Étapes concrètes restantes dans Shopify](velnuit/OUVERTURE.md). [Vérification fournisseur](velnuit/EPROLO.md).

## Limite du nettoyage et de la publication

La connexion Shopify bloque la suppression et la publication de thèmes, et les écritures sur le thème principal. Le nettoyage `themeFilesDelete` de la copie a été refusé comme action destructive. Ses **21 fichiers historiques hérités** restent présents, sans être utilisés par le nouvel accueil ou la navigation ; d’anciennes vues `?view=` sont encore disponibles. Le ZIP propre contient seulement VELNUIT. Aucun contournement n’a été tenté.

Les sources GitHub ne sont pas encore fusionnées dans main. Aucun achat, commande fournisseur, changement de forfait ou activation de produit n’a été effectué.
