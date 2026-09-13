# Corrections du fonctionnement produit — 10.09.2026

Cette révision améliore le code Shopify local sans prolonger les motifs refusés par Valentin. Aucun thème, produit, stock, prix ou fournisseur distant n’a été modifié pendant ce travail. Aucun paiement ni commande n’a été effectué.

## Changements réellement effectués

- Changement d’option : délai maximum de 12 secondes, retour à la sélection précédente après erreur, suppression de l’état bloqué ; les réponses obsolètes ne remplacent pas le choix plus récent.
- Ajout au panier : envoi de l’identifiant de variante, quantité et champs du formulaire à la route locale Shopify ; redirection vers le panier seulement après une réponse JSON de succès exploitable.
- Le formulaire reste natif sans JavaScript. Avec JavaScript, l’erreur est affichée sur la fiche plutôt que de laisser le client sans explication dans ce parcours.
- Double soumission bloquée ; taille et quantité verrouillées uniquement pendant l’ajout. Contrôles restaurés après un échec.
- Erreurs de stock, réseau, réponse non JSON et délai maximum de 15 secondes : aucune relance automatique. Un lien invite à vérifier le panier, car une réponse incertaine ou un refus de quantité peut correspondre à un ajout partiel.
- Les messages serveur sont rendus comme texte, pas comme HTML. Les textes d’interface sont traduits FR/EN.
- Le mode présentation et les variantes indisponibles restent bloqués à l’achat. Les règles de quantité minimum, maximum et incrément restent contrôlées.

Fichiers de production modifiés : `shopify-theme/sections/main-product.liquid`, `shopify-theme/locales/fr.json`, `shopify-theme/locales/en.default.json`. Ces corrections ne valident pas la coupe des vêtements ni leur guide de mesures.

## Vérification et limites

`verification/commerce-report.json` : 23 contrôles réussis. Le navigateur exécute le JavaScript et le CSS extraits du véritable composant Liquid, sur un HTML de contrat et des réponses Shopify simulées. Toutes les requêtes du banc sont interceptées ; aucune n’est envoyée à la boutique. Ce n’est pas un rendu Liquid Shopify réel ni un test de panier réel. Les captures `commerce-fixture-1440.png` et `commerce-fixture-390.png` sont explicitement des écrans techniques sans vêtement proposé. Aucun débordement à 1440, 768, 390 et 320 px.

`verification/theme-report.json` : validation officielle Liquid statique de 38 fichiers locaux, artefact `cml-studio-theme-0909`, révision 4. La validation du code et ces tests ne prouvent pas un déploiement, un checkout fonctionnel en production, la disponibilité fournisseur ou des ventes.

Le même banc a été exécuté sur le JavaScript de la copie distante précédente (`verification/commerce-baseline-report.json`) : 12 contrôles satisfaits et 11 non satisfaits. Cela confirme notamment l’absence de récupération après un chargement d’option qui n’aboutit pas. Plusieurs autres écarts correspondent au nouveau parcours AJAX attendu, absent de l’ancienne version : ils ne prouvent pas que son formulaire natif Shopify ne pouvait pas ajouter un produit. Aucun test de référence n’a été réalisé contre le serveur commercial réel.

`verification/local-delta.json` compare le travail local à la copie sauvegardée des 37 fichiers Shopify. Il ne s’agit pas d’une nouvelle lecture distante. Le thème publié et le précédent aperçu restent inchangés par ce travail. L’archive `studio-preview-r1.zip` est conservée et ne contient pas cette révision.

Écart local total : neuf fichiers, en comptant la capsule antérieure toujours en pause et cette correction produit. Les traductions FR/EN contiennent les deux ensembles de changements ; ne pas les envoyer en bloc comme si la capsule était approuvée.

Sources de la mise en œuvre : [options et rendu de section](https://shopify.dev/docs/storefronts/themes/product-merchandising/variants/support-high-variant-products), [API panier Shopify et réponses d’erreur](https://shopify.dev/docs/api/ajax/reference/cart), [règles de quantité](https://shopify.dev/docs/api/liquid/objects/quantity_rule). La compétence Shopify Liquid a guidé les formulaires, routes, traductions et validation statique.

## Suite du vrai objectif boutique

La collection reste non approuvée : le comparatif `../product-lab-call-later/comparatif-audit.html` demande à Valentin les références exactes auxquelles revenir. Le choix du nom, les dessins et fichiers de fabrication définitifs, les produits associés au compte fournisseur, les coûts livrés France, les informations marchandes et le parcours d’achat réel restent incomplets. Le fournisseur déjà installé et le refus de commander des échantillons sont conservés comme contraintes.

Ne pas déployer la capsule Room / Detour / Not now ni publier le thème au prétexte que les tests techniques sont verts. Avant une future intégration autorisée, relire les fichiers distants, conserver les modifications éventuelles de Valentin et tester le véritable rendu Shopify. La boutique complète n’est pas terminée.
