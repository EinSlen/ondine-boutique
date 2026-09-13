# Shopify — aperçu Call me later

## Arrêt sur dépendance externe — 11.09.2026

L’accès au compte fournisseur reste absent après trois tours de poursuite, malgré les corrections techniques et les vérifications indépendantes. Il faut une intervention de Valentin dans l’application fournisseur pour identifier les produits et la synchronisation réels. État complet et conditions de reprise : `BLOCKERS.md`. La boutique complète n’est pas terminée. Les cinq anciennes fiches signalées ont été relues le 11.09 et restent publiées / déclarées vendables ; aucune suspension n’a été effectuée sans accord.

## Contrôle fournisseur et anciennes ventes — 10.09.2026

Lecture Shopify réelle de 11 produits / 52 variantes : aucun rattachement Printful ou Printify détecté dans leurs emplacements de stock, bien que les deux services soient actifs. Parmi eux, cinq anciennes fiches sont publiées sur le canal Boutique en ligne et leurs 25 variantes sont déclarées vendables, suivi de stock désactivé. Aucun statut n’a été modifié. Le contrôle n’est pas exhaustif (dix premiers résultats du catalogue + CML individuellement). Détails, cibles exactes et limites : `supplier-check/RESULTAT.md`. Une décision de Valentin est requise avant une éventuelle remise en brouillon des cinq anciennes fiches.

## Avancement technique local — 10.09.2026

La direction créative reste en pause. Le composant produit a été corrigé localement : sélection de taille avec récupération après délai dépassé, ajout au panier avec retour d’erreur sur la fiche, prévention des doubles soumissions et lien de vérification du panier en cas d’issue incertaine. 23 contrôles navigateur sur API/HTML simulés passent ; validation Liquid officielle de 38 fichiers, révision 4. Détails et limites : `COMMERCE-LOCAL.md`. Aucun changement Shopify distant pendant ce travail, aucun nouveau vêtement présenté comme validé. Les résultats ne prouvent pas le fonctionnement d’un achat réel.

## Priorité — retour du 10.09.2026

Valentin considère Call me later trop éloigné des designs de l’audit. Direction non retenue en l’état : PAUSE de son extension. La capsule Room / Detour / Not now possède des images et huit fichiers de thème locaux préparés, mais ces changements ne sont pas déployés. Ne pas lancer la mutation `themeFilesUpsert` préparée sans réévaluer la direction avec le retour utilisateur. Les 37 fichiers du dernier import restent l’état distant connu ; les 38 fichiers locaux et leur validation révision 3 ne prouvent PAS un déploiement de la capsule. Ne pas supprimer les fichiers, images ou brouillons existants.

Comparatif visuel ciblé : `../product-lab-call-later/comparatif-audit.html`. Aucune nouvelle génération ni mutation Shopify pendant cette comparaison. La validation créative n’est pas acquise ; l’objectif boutique complète n’est pas terminé.

09.09.2026. Un nouveau thème réellement importé dans la boutique existante, sans modifier ni remplacer le thème principal. Ce n’est pas encore une boutique complète prête à vendre.

- Aperçu : https://0rsiku-r1.myshopify.com/?preview_theme_id=189335208264
- Thème : LE STUDIO — Call me later — Aperçu, rôle UNPUBLISHED, identifiant 189335208264. Import terminé sans erreur.
- Produit existant : Call me later — Tee, identifiant 10273301299528, toujours DRAFT. Six variantes S–3XL / Bone, zéro stock, prix de travail 49 €. Aucune synchronisation fournisseur.
- Thème principal conservé : DEAD2ME — DROP 001, identifiant 188582592840.

## Réalisation

Accueil éditorial avec le tee et le porté générés, narration « J’ai répondu dans ma tête », contraste écru / rouge, détails dépliants, affichage adapté aux petits écrans. LE STUDIO est une appellation de présentation, pas un nom de marque validé. Aucune nouvelle image de concurrent utilisée et aucune nouvelle dépense.

La compétence Shopify Liquid a guidé l’implémentation en sections modifiables, les images natives Shopify, les traductions et la validation du thème. Les 37 fichiers de base comprennent aussi les modèles produits, collections, recherche, panier, pages et contact. Leur présence n’équivaut pas à une collection complète ni à un checkout testé.

Le mode présentation masque volontairement les anciens produits et les parcours de commande dans CE thème. Les autres routes affichent une notice de développement ; un aperçu de produit possédant l’étiquette de l’étude peut utiliser la fiche native. Le mode présentation n’est pas une protection globale de la boutique et ne bloque pas les autres canaux. Le statut DRAFT maintient le nouveau produit hors vente.

UNPUBLISHED signifie que le thème n’est pas le thème principal, pas que le lien d’aperçu est protégé par authentification. Le lien a fonctionné dans un navigateur neuf sans connexion. Ne pas traiter cet aperçu comme un coffre privé ou comme une page de test organique instrumentée.

## Vérification de l’import du 09.09 (historique)

- Validation officielle statique des 37 fichiers importés : réussie à cette date. `verification/theme-report.json` décrit désormais la révision locale de 38 fichiers ; ne pas la confondre avec l’import distant.
- Relecture des 37 fichiers depuis Shopify : identiques après normalisation JSON, fin de ligne et en-tête ajouté par Shopify ; `verification/integrity-report.json`.
- Rendu réel Shopify : HTTP 200, deux images chargées, aucune erreur JavaScript ou Liquid détectée.
- Douze contrôles navigateur réussis : images, bouton vers le porté, quatre accordéons, absence de commande dans le contenu, notices sur catalogue / recherche / panier et refus des cookies au clavier.
- Aucun débordement à 1440 / 768 / 390 / 320 px ; captures desktop et mobile examinées.
- La barre d’aperçu Shopify peut recouvrir le bas du bandeau de consentement. Le refus a été vérifié au clavier ; ce contrôle ne prétend pas que le clic est toujours dégagé dans cette interface d’administration.
- Pas de commande passée, pas de paiement, pas de test de production physique ni de publication sociale.

## Suite nécessaire — objectif global non terminé

1. Évaluer le dessin avec Valentin ; ne pas multiplier automatiquement ce motif sur toutes les familles.
2. Compléter un vestiaire cohérent avec les capacités réelles de Printful / Printify déjà installés : autres hauts, bas et accessoires. Ne pas inventer une capacité bijou, tricot ou broderie d’après un simple mockup.
3. Vérifier dans le compte fournisseur le support, les zones de décor, variantes et coût livré en France. Le refus de commander des échantillons est respecté ; le rendu physique reste non vérifié.
4. Finaliser le fichier d’impression puis synchroniser les variantes et leur fulfillment. Ne pas créer à nouveau le produit ou ce thème : les identifiants sont dans `INTEGRATION.json`.
5. Compléter les informations marchandes vérifiées et tester le parcours natif avant toute autorisation de lancement. Ne pas réutiliser silencieusement les anciennes politiques de DEAD2ME.
6. Préparer un test organique à partir de `../product-lab-call-later/TEST-ORGANIQUE.md`. Aucune donnée de demande ou d’achat n’a encore été collectée.

Sources techniques : https://shopify.dev/docs/storefronts/themes/architecture/settings/input-settings ; https://shopify.dev/docs/storefronts/themes/architecture/templates/json-templates ; https://shopify.dev/docs/api/admin-graphql/latest/mutations/themeCreate
