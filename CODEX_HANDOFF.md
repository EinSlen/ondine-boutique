# VELNUIT — reprise dans Codex

Document préparé le 1er octobre 2026. Il résume les dernières décisions et observations de la conversation. Les états externes ci-dessous sont datés et doivent être relus dans les comptes avant modification. La tâche Codex n'est pas lancée par la création de cette branche.

## Démarrage

- Dépôt privé : `EinSlen/ondine-boutique`.
- Branche de reprise : `velnuit-codex-reprise-2026-10-01`.
- Base conservée : `capsule-homme-femme-2026-09-16`, commit `539ef622657a0c7fb5cee1e5dbb7068640a0cf01`.
- Lire ce document en premier, puis les fichiers datés cités. Les README de septembre sont des historiques, pas le dernier état.
- Objectif : terminer la boutique Shopify existante VELNUIT et le raccordement des vêtements aux fournisseurs. Ne pas créer une nouvelle boutique ou repartir du début.

## Décisions utilisateur

- Nom retenu : **VELNUIT**. Ondine est le nom historique du dépôt ; DEAD2ME/dead2me est l'ancien nom de boutique, pas la marque à développer.
- Conserver la collection femme ET une collection homme cohérente avec elle : chocolat, ciel, bordeaux, crème, dentelle, henleys, rayures et superpositions. Les propositions homme trop éloignées du style féminin ont été rejetées.
- Ajouter la piste vêtements à slogans, dont le sweat « I Love Milfs », sans remplacer toute la collection par ces produits.
- Présenter des vêtements portés ; pas d'emojis. Les illustrations de concepts ne prouvent pas l'apparence du produit fabriqué.
- Le client demande une prise en charge autonome et ne veut pas répéter les confirmations pour les travaux déjà autorisés. Continuer les travaux accessibles ; expliquer précisément les blocages d'accès.
- Aucun volume de vente, bestseller, marge finale ou rentabilité de nos créations n'est établi. Distinguer signaux de marché, estimations et preuves de ventes.

## Shopify : dernier état connu

Boutique : `0rsiku-r1.myshopify.com` (EUR, France, Basic au dernier contrôle). Nom administratif encore `dead2me` au 28 septembre.

- Thème de travail : `189335208264`, non publié lors du dernier contrôle.
- Thème principal : `188582592840`, laissé inchangé.
- Aperçu de travail : https://0rsiku-r1.myshopify.com/?preview_theme_id=189335208264
- Code actif : `atelier/outputs/capsule-2026-09-16/shopify-theme/`.
- Le 28 septembre : champ vendor passé à VELNUIT sur neuf fiches ; textes de marque actualisés dans `locales/fr.json` et `locales/en.default.json` du thème brouillon.
- Collections automatiques non publiées : Femme `672679788872`, Homme `672679821640` ; tag `capsule-2026-09-16` ET `femme`/`homme`.
- Routes `/?view=femme`, `/?view=homme`, `/?view=piece-1` à `piece-8`, `/?view=contact` : pages de présentation de concepts, pas des fiches de vente raccordées.
- `settings.showcase_mode` était activé dans la copie locale. Ne pas désactiver avant de vérifier les produits physiques et le parcours d'achat.
- Paiements : activation non vérifiée. L'API a refusé la lecture faute de permission Shopify Payments ; la capture mobile affichait encore cette étape à configurer.
- Domaine : `velnuit.com` affiché indisponible chez Porkbun le 28 septembre ; aucun domaine acheté. Recontrôler si nécessaire et convenir d'une alternative avant achat.

### Produits existants : éviter les doublons

Les huit concepts étaient DRAFT, sans photo produit réelle, sans SKU fournisseur, prix par défaut 0, variante par défaut et sans raccordement au 28 septembre. Ils ne sont pas commercialisables en l'état.

| Pièce | Nom | Product ID Shopify |
| --- | --- | --- |
| 1 | Henley dentelle | 10301814112584 |
| 2 | Duo chocolat & ciel | 10301814178120 |
| 3 | Rayures près du corps | 10301814276424 |
| 4 | Caraco bordeaux | 10301814309192 |
| 5 | Henley chocolat | 10301814374728 |
| 6 | Maille & ciel | 10301814440264 |
| 7 | Henley à rayures | 10301814571336 |
| 8 | Bordeaux en deux temps | 10301814636872 |
| 9 | Sweat à capuche I Love Milfs | 10304633635144 |

Pour le sweat, fiche créée le 26 septembre, DRAFT : Noir, S/M/L/XL/2XL/3XL, prix provisoire 34,90 EUR, stock suivi à 0, pas de SKU ni de correspondance fournisseur. Les variantes sont `54140904603976`, `54140904636744`, `54140904669512`, `54140904702280`, `54140904735048`, `54140904767816`.

Une photo fournisseur et un descriptif polyester avec tableau des mesures sont déjà enregistrés. Photo Shopify : https://cdn.shopify.com/s/files/1/0981/1990/9704/files/hoodie-i-love-milfs-fournisseur.jpg?v=1790396018

## Fournisseurs et blocage réel

**EPROLO a été installé par le client sur téléphone le 29 septembre.** La capture `IMG_4136.png` le montre dans les sept applications installées. `IMG_4137.png` montre son accueil avec les étapes Install EPROLO App et Connect your store en vert, puis Find Product / Import first product encore à faire. Cela indique l'installation et la connexion côté téléphone ; ne prouve pas le raccordement des variantes.

Une requête antérieure `appByHandle(handle:"eprolo") { installation { id } }` a renvoyé null. Les captures suivantes contredisent une conclusion d'absence d'installation ; ne pas insister pour réinstaller sur cette seule base.

Le navigateur distant de l'assistant restait déconnecté d'EPROLO au 30 septembre, avec formulaire e-mail, mot de passe et captcha visuel. Connexion Google Shopify auparavant en erreur 502. Le client n'a pas confirmé une connexion réussie dans ce navigateur. Sa session mobile ne se transfère pas automatiquement. Le passage à Codex ne transfère ni cookies ni mots de passe ni droits des connecteurs ; tester les capacités réellement disponibles dans le nouvel environnement.

Printful était connecté à la boutique (store `18641093`, Live le 25 septembre), sans vêtements synchronisés dans la vue consultée. Printify figurait aussi parmi les services installés. Ni l'installation d'une app ni l'affectation d'un emplacement de stock ne créent la correspondance fournisseur d'un produit.

**Refus antérieur à respecter :** l'import global de produits Shopify dans Printful a été rejeté par le contrôle automatique le 25 septembre, car il pouvait englober l'ancien catalogue. Dialogue annulé. Ne pas relancer le même import global ni contourner le refus ; privilégier un rattachement ciblé, vérifié et autorisé.

### Références EPROLO prioritaires

- Sweat : https://eprolo.com/app/product/I-Love-Milfs-Hoodie-Men-Women-Fashion-Hoodie
- Pièce 1, alternative proche (pas identique à la maquette) : https://eprolo.com/app/product/aci-large-also-pool-brown-lace-spliced-brushed-knit-base-layer-womens-slim-fit-slimming-henley-neck-inner-wear-top
- Pièce 4, caraco : https://eprolo.com/app/product/lace-trimmed-u-neck-sleeveless-solid-color-tank-top — variantes Wine Red S/M/L observées, bretelles larges et coupe ajustée ; différent du concept à bretelles fines.
- Pièce 5, alternative homme : https://eprolo.com/app/product/mens-american-style-long-sleeve-henley-layered-top — brun/café, M–4XL, mélange coton ; plus ample et moins côtelé que le concept. Vérifier l'inclusion de la couche blanche.

Rapport détaillé : `atelier/outputs/capsule-2026-09-16/sourcing-2026-09-26.md`. Les pièces 2, 6 et 7 n'ont pas de correspondance exacte validée. La piste pièce 8 est un haut bordeaux manches courtes sans le sous-pull gris ; ne pas vendre un ensemble de deux articles si un seul est livré. Le henley rayé à grand lettrage a été écarté.

Estimation publique du sweat observée le 26 septembre, destination France sélectionnée : produit 5,97 USD + YUN Standard 8,89 USD = 14,86 USD, avant supplément UE annoncé d'au moins 3,50 USD. Préparation annoncée 2–3 jours ouvrés, transport 8–12 jours. Ce n'est ni un devis final ni une confirmation de stock ou de marge. Recalculer avant vente.

## Reprendre dans cet ordre

1. Vérifier branche, derniers changements, accès Shopify et EPROLO. Préférer les connecteurs adaptés ; pour les opérations absentes, utiliser une interface autorisée. Ne jamais demander ou copier des secrets dans le chat ou le dépôt.
2. Dans EPROLO, retrouver le sweat exact et contrôler ses références, variantes, stock, composition, mesures, photos et coût livré France. Examiner les options permettant de relier la fiche Shopify existante avant un import qui créerait un doublon. Maintenir le produit en brouillon pendant cette préparation.
3. Avancer sur les pièces femme 1 et 4 et homme 5 en exposant les écarts réels avec les concepts. Une validation du style ne vaut pas validation d'un produit physiquement différent.
4. En parallèle des blocages d'authentification, terminer ce qui est possible dans le thème brouillon : marque, pages produit, navigation femme/homme, images fidèles, mobile, panier et messages de disponibilité. Ne pas se limiter à répéter les demandes de connexion.
5. Vérifier prix, livraison, retours, identité du vendeur, politiques et paiements avec les informations du client ; ne pas les inventer. Préparer un parcours d'achat testable.
6. Présenter les seules décisions concrètes encore nécessaires : domaine disponible et coût, éventuels achats/abonnements/échantillons ou permissions. Ne rien facturer sans autorisation applicable.
7. Consigner chaque changement, vérifier son résultat et mettre à jour ce document. Ne dire « prêt à vendre » qu'après vérification de la chaîne produit → commande → fournisseur et des paiements/livraisons. Respecter les restrictions de publication de l'outil ; elles ne doivent pas être contournées.

## Fichiers et sauvegarde

- `atelier/outputs/capsule-2026-09-16/boutique-24/catalogue.json` et `raccordement-fournisseur.json` : IDs et instantanés historiques ; ils précèdent certaines captures du 29 septembre.
- `atelier/outputs/capsule-2026-09-16/editorial-v3/` : visuels portés et campagne, tous deux générés pour des concepts.
- `atelier/outputs/capsule-2026-09-16/editorial-v2/` et `capsule-2026-09-15/` : variantes historiques, pas instructions de revenir aux designs rejetés.
- `atelier/outputs/benchmark-pieces-v7/`, `ondine/audit-organique-v5/` : audit et références de marché existants, à dater et revalider pour des faits actuels.
- `atelier/outputs/codex-handoff-2026-10-01/local-variants/` : sauvegardes locales qui différaient de GitHub, préservées séparément pour ne pas écraser les versions distantes plus récentes.
- `atelier/outputs/codex-handoff-2026-10-01/manifest.json` : provenance et empreintes des fichiers ajoutés. Les fichiers de thème absents de la branche mais présents localement sont sauvegardés ; cela n'atteste pas qu'ils sont identiques au thème Shopify courant. Comparer avant tout déploiement.

La validation Theme Check avait réussi pour les modifications de septembre et les deux locales VELNUIT le 28 septembre. Aucun test de commande complet ni nouvelle validation de l'ensemble de cette sauvegarde n'est affirmé. Les scripts historiques peuvent utiliser des chemins absolus de l'ancien workspace ; lire avant exécution.

## Prompt pour la nouvelle tâche Codex

Reprends VELNUIT depuis CODEX_HANDOFF.md sur la branche velnuit-codex-reprise-2026-10-01 du dépôt EinSlen/ondine-boutique. Termine la boutique Shopify existante et le raccordement EPROLO en conservant nos collections femme et homme. Commence par vérifier les accès et l'état réel, puis avance sur toutes les étapes autorisées. Conserve les produits non validés en brouillon et donne-moi des résultats vérifiés, sans repartir de zéro.

## Limite de cette sauvegarde

Les 7 PNG locaux supplémentaires ne sont pas inclus dans ce commit : leur transfert a été interrompu. Ils sont listés dans le manifeste comme `not_committed`. Ne pas prétendre que tous les fichiers locaux ont été transférés. Les deux visuels portés de la version actuelle étaient déjà hébergés sur Shopify :

- https://cdn.shopify.com/s/files/1/0981/1990/9704/files/capsule-modeles-portes-v3.png
- https://cdn.shopify.com/s/files/1/0981/1990/9704/files/capsule-campagne-portee-v3.png

Vérifier et récupérer ces sources autorisées si nécessaires à la reprise. Les fichiers texte, y compris les variantes locales divergentes, sont sauvegardés sans remplacer les versions GitHub existantes.
