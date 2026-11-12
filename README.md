# Ondine — projet de marque de vêtements

Sauvegarde de travail du 13 septembre 2026, préparée pour reprendre le projet depuis le web. **Ce dépôt n’est pas une boutique finalisée et ses designs ne sont pas approuvés.**

## Mise à jour du 12 novembre 2026

Ajout des boutiques lancées depuis la sauvegarde de septembre, copiées depuis `Desktop/Ondine` :

- `ondine/kapsulcam/` : boutique KapsulCam (mini caméra POV 4K, lancée le 15/10/2026) : thème, scripts Shopify, politiques, échanges fournisseur, pubs Google et Meta, vidéos finales.
- `ondine/plafondceleste/` : boutique Plafond Céleste (projecteurs de plafond et lune photo) : thème Horizon, SEO, kit légal de lancement, calcul des marges, pubs et vidéos Higgsfield finales.
- [`decisions/`](decisions/README.md) : les fiches de décisions de chaque projet, avec les choix et les refus de Valentin.

Seules les vidéos finales sont versionnées. Les rushs, générations brutes, clips de banque d’images et pubs de concurrents sont listés dans [`ondine/VIDEOS-NON-VERSIONNEES.md`](ondine/VIDEOS-NON-VERSIONNEES.md). Les jetons d’accès (`outils/.env`, `.mcp.json`) et le profil de navigateur ne sont pas dans le dépôt.

## Commencer ici

1. Lire [REPRISE-CHATGPT.md](REPRISE-CHATGPT.md) : demandes, refus récents et état réel.
2. Consulter [l’audit de 30 pièces](atelier/outputs/benchmark-pieces-v7/references.json) et ses [observations](atelier/outputs/benchmark-pieces-v7/observations.js).
3. Voir [la galerie actuelle](ondine/side-habit-store-v8/piece-phare/capsule-septembre/index.html), en gardant à l’esprit qu’elle est contestée par l’utilisateur.
4. Lire [les exigences de fabrication](atelier/outputs/product-lab-call-later/capsule-septembre/VETEMENTS-A-REALISER.md).

## Organisation

- `ondine/` : copie du dossier de travail du Bureau, incluant `contenu/`, anciennes directions, audits, visuels et thèmes.
- `atelier/` : copie du workspace (dossiers `boutique/`, `outputs/`, `work/`) ; contient notamment les sources techniques, rapports et variantes non recopiées sur le Bureau.
- `archives-decompressees/` : éventuels fichiers présents uniquement dans les anciennes archives ZIP.
- `EXPORT-MANIFEST.json` : fichiers sources, empreintes SHA-256 et exclusions.
- `ARCHIVES-MANIFEST.json` : contenu des ZIP, avec pour chaque entrée le fichier équivalent conservé dans le dépôt. Les ZIP d’origine ne sont pas versionnés ; leurs contenus sont dédupliqués par empreinte, sauf exclusions de sécurité explicitement enregistrées.
- `images-generees/` et `IMAGES-MANIFEST.json` : images de cette tâche absentes des dossiers principaux, ou correspondance vers leur copie identique déjà présente. Inclut des essais rejetés, pas uniquement des propositions retenues.

Les deux arborescences restent séparées pour ne pas écraser des variantes divergentes. Git déduplique les contenus identiques. Le manifeste sert à vérifier la copie, pas à prouver que la collection est prête à vendre.

## Ouvrir les pages

Après récupération du dépôt, ouvrir les fichiers HTML localement ou servir le dossier avec un serveur statique. Les images du projet sont locales ; certaines références de marques utilisent des liens externes qui peuvent changer. GitHub affiche le code HTML, il ne publie pas automatiquement la boutique.

Les scripts historiques peuvent contenir des chemins Windows absolus et dépendre du runtime local. Adapter ces chemins avant leur exécution dans un autre environnement. Aucun déploiement, paiement ou synchronisation fournisseur ne doit être déclenché automatiquement à l’ouverture du dépôt.

## Reprendre depuis le navigateur

Pour travailler sur le code dans Codex cloud, connecter GitHub, autoriser ce dépôt privé, puis créer/sélectionner son environnement : [documentation officielle OpenAI](https://learn.chatgpt.com/docs/cloud). Un lien vers un dépôt privé seul ne donne pas accès à son contenu. L’accès de ChatGPT web dépend de la connexion GitHub et des fonctionnalités disponibles sur le compte ; il n’est pas validé par cette sauvegarde.

Prompt de reprise :

> Reprends le projet de vêtements Ondine. Lis d’abord REPRISE-CHATGPT.md, puis l’audit. Les dernières propositions, notamment le ruban brillant, ont été rejetées comme trop réalistes. Ne les traite pas comme des produits approuvés. Aide-moi à obtenir une collection originale cohérente avec mes références et réalisable chez mon fournisseur actuel, pour une vente organique européenne, sans garantir les ventes ni publier ou commander sans mon accord.

## Confidentialité et état

Dépôt privé. Profils navigateur, cookies, configurations d’authentification, dépendances et fichiers contenant certains motifs de secrets exclus. Ce contrôle n’est pas une certification exhaustive d’absence de données sensibles. Les informations de travail sur la boutique restent destinées au propriétaire du projet.

La conversation complète et les connexions aux comptes ne sont pas transférées. Le document de reprise en résume les décisions utiles. Les sources locales originales n’ont pas été supprimées ou déplacées.

Les photos de marques tierces sont des références d’analyse, pas des créations autorisées pour la revente. Conserver les attributions et vérifier les droits avant toute utilisation commerciale. Aucun changement de visibilité publique n’est autorisé par défaut.
