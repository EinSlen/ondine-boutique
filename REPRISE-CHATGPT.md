# Reprise du projet — 13 septembre 2026

## Dernière demande et dernier refus

Valentin demande de mettre le projet sur GitHub pour le récupérer depuis ChatGPT web.

Juste avant, à propos du tee Ruban V2 : **« pas beau et trop réaliste »**. Ce refus prévaut sur les appréciations plus favorables écrites auparavant dans les rapports. Ne pas continuer à fabriquer ce dessin comme s’il avait été approuvé. Aucune permission de retouche locale des images n’a été donnée en réponse à la question précédente ; le message reçu est un rejet du design.

## Objectif métier conservé

Créer une marque, une boutique et les vêtements correspondants en tenant compte de l’audit, pour des ventes organiques en Europe. L’utilisateur ne veut pas seulement une galerie ou de nouveaux noms. Il demande aussi les fournisseurs et la faisabilité réelle.

- Streetwear inspiré des références observées dans les boutiques reconnues ; ne pas copier leurs logos ou leurs illustrations.
- L’utilisateur appréciait l’exemple Juicy Cherry de Nude Project, pas une obligation de mettre des cerises ou des rubans partout.
- Les rendus très réalistes / objets façon verre 3D ne lui conviennent pas. Il faut revoir le traitement graphique, pas simplement augmenter le brillant ou changer la taille.
- Variété demandée : tee-shirts, sweats/hoodies, pantalons, manches longues et accessoires, dont boucles d’oreilles et vraie cagoule.
- Sour Hours et Mauvais Pli ont été rejetés. SIDE HABIT et LE VESTIAIRE sont des noms de travail, pas une identité validée.
- Pas de budget échantillons annoncé : il dit avoir déjà un fournisseur dans Shopify. Ne pas imposer une commande d’échantillons pour continuer la création.
- Ne pas garantir des ventes, un buzz ou une sortie de difficultés financières grâce à un design. Les pages Best Sellers sont des indications déclarées par les marques, pas des preuves de ventes organiques par produit.

## Les dossiers importants

### Audit et références

- `atelier/outputs/benchmark-pieces-v7/references.json` : 30 références / 10 marques.
- `atelier/outputs/benchmark-pieces-v7/observations.js` et `verification/reference-sheet-*.png` : commentaires et planches comparatives.
- `ondine/audit-organique-v5/` : audit organique historique.
- `ondine/benchmark-visuel-v3/` : benchmark précédent.

Les références comprennent Nude Project, Scuffers, Cold Culture, Wasted Paris, derschutze, Arte, Peso, 6PM, WRSTBHVR et Jaded London. Ne pas appeler toutes ces marques « EU » sans nuance : Jaded London est britannique. Ne pas confondre popularité générale, publicité, communauté et acquisition organique démontrée.

### Galerie actuelle — contestée, pas catalogue prêt

`ondine/side-habit-store-v8/piece-phare/capsule-septembre/`

- `index.html`, `collection.js`, `app.js`, `style.css` : galerie de 6 pièces.
- `revision-ruban.html` : avant/après Ruban, désormais rejeté.
- `assets/01-galop-tee.png` : cheval noir et blanc au dos d’un tee clair.
- `assets/02-ruban-tee.png` et `02-ruban-tee-v2.png` : ruban rouge en rendu brillant, non retenu.
- `assets/03-sillage-hoodie.png` : hoodie bleu tonal, jugé trop générique par l’assistant, sans validation utilisateur.
- `assets/04-rayure-longsleeve.png` : fines rayures et petit ruban ; support coton correspondant non confirmé.
- `assets/05-ligne-pants.png` : pantalon jersey rayé, ne remplace pas un jean baggy.
- `assets/06-galop-cap.png` : casquette bordeaux / cheval, broderie simulée.
- `assets/07-cadence-tee.png`, `08-relief-hoodie.png`, `09-orbite-tee.png` : autres essais non intégrés aux 6 cartes, non validés. Malgré le nom du fichier 08, aucun relief physique n’est promis.

Les mockups ne sont pas des fichiers de décoration séparés. Les tentatives de détourage réalisées le 12 septembre ont donné des PNG RGB opaques avec damier dessiné, sans transparence réelle, en 1254 × 1254. Elles ont été refusées pour l’impression. Ne pas les réétiqueter « print-ready » ou « 300 dpi » pour prétendre résoudre le problème.

### Fabrication et Shopify

- `atelier/outputs/product-lab-call-later/capsule-septembre/VETEMENTS-A-REALISER.md` : périmètre complet et inconnues.
- `atelier/outputs/shopify-studio-preview/shopify-theme/` : thème de travail local ; pas un reflet garanti du thème publié.
- `atelier/outputs/shopify-studio-preview/supplier-check/` : instantanés datés ; relire la date et revalider avant une action.
- `atelier/boutique/` et `ondine/theme-drop001/` : autres versions de sources à préserver.

Printful et Printify ont été observés dans les services installés, mais le fournisseur effectivement utilisé pour les nouvelles pièces n’est pas confirmé. Une capture de l’application fournisseur a été demandée, sans réponse au dernier état connu. Ne pas récupérer des sessions, cookies ou clés privées pour contourner cette absence.

Pistes publiques, pas disponibilité compte vérifiée : AS Colour 5082 pour les tees, AS Colour 5161 pour un hoodie, pantalon coton/élasthanne all-over Printful (pas denim), Otto 18-1248 pour une casquette. Le manches longues all-over polyester 175 g/m² coupe standard ne correspond pas au concept coton ample rayé et a été écarté. Un tour de cou n’est pas une preuve de disponibilité d’une vraie cagoule tricotée. Boucles d’oreilles : pas de SKU confirmé.

Les coûts livrés France, coloris exacts, gabarits, fichiers de fabrication et synchronisation des variantes restent à établir. Les simulations du site ne permettent pas de les déduire.

## Prudence avec les actions externes

La création du dépôt privé est demandée. Cela n’autorise pas la publication du thème, la mise en vente de produits, des commandes, paiements, changements d’abonnement ou suppressions d’anciennes fiches. Des produits historiques ont été observés actifs ; ne pas modifier leur statut automatiquement. Revalider l’état Shopify avant toute action.

Ce dépôt contient des archives de directions abandonnées. Les instructions anciennes de lancement, noms, promesses ou plans ne valent pas validation actuelle. Le dernier retour utilisateur et les faits de fabrication priment.

## Ce qu’il reste réellement à faire

Reprendre le traitement graphique à partir de l’audit et du refus « trop réaliste », obtenir des propositions désirables sans copier, confirmer le fournisseur et les supports, préparer les véritables décors utilisables et les variantes, puis construire une boutique cohérente. Aucune de ces étapes n’est considérée comme terminée par la seule sauvegarde GitHub.
