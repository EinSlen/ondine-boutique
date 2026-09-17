# Refonte éditoriale — 17 septembre 2026

Thème : Collection — Chocolat & ciel — Aperçu (189335208264), non publié.
La nouvelle version est maintenant templates/index.json, et reste disponible sous ?view=capsule.
Ancien accueil conservé dans editorial-v2/index-before.json.

Changements : grand visuel de campagne, huit cartes de pièces, filtres femme/homme/tout/favoris, favoris locaux sur l’appareil, fiches détaillées accessibles avec dialog, fermeture au clavier, section éditoriale, palette et FAQ. Nom affiché « Collection 01 », aucun nom de marque définitif choisi.

Vérifications : les cinq fichiers principaux passent Theme Check, de même que le template d’accueil. L’option documentée OPT_OUT_INSTRUMENTATION=true empêche l’envoi du code au service de télémétrie. Le contrôle utilise les schémas embarqués lorsque le téléchargement de documentation n’est pas accessible.
Dans Chrome, contrôle du visuel d’accueil, des huit images, absence de débordement horizontal à 1363 px, filtre Homme (4 pièces), ajout aux favoris (1 pièce), filtre favoris et ouverture de la fiche Henley chocolat.
Responsive CSS prévu à 600 et 900 px. Le contrôle visuel par iframe de 390 px a été refusé par Shopify ; le fichier temporaire templates/index.capsule-check.liquid reste présent et sans lien depuis la boutique : themeFilesDelete a été bloqué par la politique du connecteur (suppression de thème interdite). Pas de validation sur iPhone réel.

Images créées avec l’outil intégré de génération d’images à partir des deux planches de collection :
- Hero : mise en scène éditoriale d’un portant, vêtements chocolat, ciel et bordeaux, sans modèle, texte ni marque. CDN : https://cdn.shopify.com/s/files/1/0981/1990/9704/files/capsule-editorial-hero-v2.png
- Pièces : grille photographique uniforme 4 × 2 des huit propositions, sans texte. Présentation individuelle par cadrage CSS. CDN : https://cdn.shopify.com/s/files/1/0981/1990/9704/files/capsule-editorial-pieces-v2.png
Les sources locales sont dans editorial-v2/assets/hero.png et pieces.png.

Aucune vente ouverte, aucun faux prix ou avis, aucune référence fournisseur inventée. La compatibilité des vêtements exacts avec Printful/Printify reste à établir avant de connecter des articles commandables. Les images demeurent des concepts.
