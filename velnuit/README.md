# VELNUIT — boutique Shopify

Direction confirmée le 1er octobre 2026 : poursuivre les produits **VELNUIT / EPROLO**, plus récents que l’archive Ondine.

## Ce qui est préparé

- Thème Shopify autonome dans `theme/`, palette chocolat/crème/bleu ciel, campagne et huit concepts existants.
- Présentation séparée du sweat à slogan avec sa photo fournisseur, sa matière déclarée et son tableau de tailles.
- Navigation mobile et desktop, vraies collections Femme/Homme, filtres, recherche, variantes, panier, contact, pages et langue/pays.
- Paramètres et sections modifiables dans l’éditeur Shopify.
- Avant-première activée par défaut ; les routes normales restent accessibles. Aucun ancien téléphone ou ruban rejeté n’est repris.
- Prix à venir et commandes désactivées pour les pièces sans prix ou marquées `fabrication-a-valider`, `eprolo-a-raccorder`, `prix-a-confirmer`, `fournisseur-non-synchronise` ou `concept-non-fabrique`.
- Newsletter optionnelle, désactivée par défaut, avec consentement.
- Sources des neuf fiches dans [catalogue.json](catalogue.json), textes des quatre pages publiées dans [contenus-pages.json](contenus-pages.json), état fournisseur dans [EPROLO.md](EPROLO.md).

Les achats désactivés ici sont des contrôles d’interface. Le statut brouillon des produits est un contrôle Shopify effectif (la boutique n’est actuellement pas protégée par mot de passe) ; le thème ne bloque pas à lui seul l’API panier ni un lien direct vers le paiement.

## Installation

Le dossier `theme/` est le seul dossier à importer comme thème. Utiliser la connexion GitHub de Shopify en sélectionnant ce dossier, ou récupérer le ZIP fourni par le workflow **VELNUIT theme**. Les photos déjà présentes dans Shopify sont référencées via `shopify://shop_images/` ; elles ne sont pas embarquées dans le ZIP et devront être sélectionnées dans l’éditeur si le thème est importé sur une autre boutique.

Le thème préparé doit rester **non publié** pendant la vérification. Il ne modifie pas le thème principal, les anciennes fiches DEAD2ME, les abonnements ni les commandes.

## Vérification

```sh
node velnuit/tools/verify-theme.mjs
shopify theme check --path velnuit/theme --fail-level error
shopify theme package --path velnuit/theme
```

Le workflow vérifie les références de sections et snippets, les traductions, les réglages, la syntaxe JavaScript, puis exécute Theme Check et produit un ZIP. Un second job Playwright vérifie l’aperçu Shopify installé, en 1440 px et 390 px : galerie, filtres, images, pages, navigation mobile, contact sans envoi, panier vide, recherche et indisponibilité des produits brouillons. Les captures et résultats sont conservés en artefact. Ce test ne couvre pas le paiement ni les variantes de produits actifs. En prévisualisation, vérifier mobile/desktop, filtres des huit concepts, contact, recherche, tailles et panier d’un produit confirmé. Ne pas passer de commande réelle pour tester.

## Ce qui empêche encore l’ouverture des ventes

Les huit concepts n’ont pas de support fournisseur confirmé ; le sweat n’a pas de liaison EPROLO vérifiable. Les coûts livrés France et délais restent inconnus. Les brouillons restent donc en brouillon. La galerie de concepts disparaît automatiquement lorsque l’avant-première est désactivée, au profit des collections Shopify.

Les pages historiques publiées parlent encore de DEAD2ME, d’impression en Europe et d’anciens tarifs : elles ne doivent pas servir à décrire VELNUIT / EPROLO. Les pages À propos, Guide des tailles, Livraison et FAQ sont publiées et liées au nouveau menu VELNUIT. La page Livraison décrit la préparation actuelle sans annoncer les anciens tarifs. Les CGV existantes contiennent encore des champs d’identité et de médiateur non remplis. Les données du vendeur et les conditions effectives de livraison/retour devront être renseignées avant l’ouverture.

La publication du thème doit être effectuée dans Shopify après vérification ; l’outil disponible ne permet pas de publier un thème principal. Aucun produit n’est activé automatiquement par ce travail.

Les tarifs hérités du profil général (France 7,99 € / seuil 65 € / Express 10,99 €, UE 22 €, international 29 €) ne sont pas confirmés pour EPROLO. Trois emplacements n’ont pas de tarif, dont EPROLO. Le marché France est actif et le SSL est activé. La connexion refuse la lecture du compte Shopify Payments : encaissement non vérifié.
