---
name: reference_ecom_fr_tools
description: "Outils de mesure marché et de génération de créas construits le 05/08/2026 (Desktop\\Ondine), avec les pièges ffmpeg et puppeteer résolus"
metadata: 
  node_type: memory
  type: reference
  originSessionId: 0f4722e7-49cc-4165-bf2d-9bd0138c97fc
  modified: 2026-08-21T11:02:29.302Z
---

Outils écrits et testés le 5 août 2026 pour [[project_dropshipping_ondine]].

**⚠️ CHEMINS CHANGÉS LE 21/08/2026** après le pivot vers la marque en print-on-demand. Le
dossier `Ondine` a été réorganisé : les scrapers de cette fiche sont désormais dans
`Ondine\_archive\recherche-160-familles\`, les générateurs de créas dans `Ondine\contenu\`,
`provision.mjs` et `content.mjs` dans `Ondine\outils\`. Les outils du modèle actuel
(`boutique-scan.mjs`, `tiktok-compte.mjs`, `pod-eu.mjs`, `pnl-marque.mjs`) sont dans
`Ondine\mesures\` et sont décrits dans [[project_dropshipping_ondine]]. Rien n'a été supprimé.

**Environnement disponible sur ce PC** : `puppeteer-core` dans
`C:\Users\Valentin\node_modules` et `E:\kwords\screenshot\node_modules`, Edge à
`C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe`, ffmpeg 8.1 via winget (build
Gyan). Toujours lancer les scrapers avec un `userDataDir` dédié, jamais le vrai profil Edge.

**Les mesures marché**
- `amz-screen2.mjs` : prix P25/médiane/P75, note, avis, badge « achetés au dernier mois » et
  part de marques sur Amazon.fr, par requête. Reprend où il s'arrête si Amazon bloque.
- `gshop-screen.mjs` : le plus utile. Mesure le **mur concurrentiel réel** sur Google Shopping,
  en séparant chaînes physiques et détaillants spécialisés, et compte les mentions
  « Retrait »/« En magasin ». C'est l'instrument qui a invalidé tous les autres.
- `google-shot.mjs` : capture le SERP pour le lire à l'œil. À sortir dès que l'extraction
  texte donne des résultats absurdes (0 annonce sur une requête commerciale) : la capture
  révèle immédiatement le vrai paysage.
- `tiktok-fr-creators.mjs` et `tiktok-nail-fr.mjs` : récolte des comptes sur des hashtags
  francophones, puis profilage (abonnés, bio, lien, onglet boutique, score de francophonie).
  Résultats dans `fr-creators.csv` (140 créateurs animaliers, 31 cibles exploitables) et
  `nail-creators.csv` (130 ongle, 21 cibles).

**Les générateurs de créas** (racine `Ondine`)
- `stills-to-video.mjs` : photos produit du fournisseur vers 8 clips verticaux 1080x1920,
  mouvement Ken Burns différent par plan, fondu enchaîné, texte français incrusté.
- `variant-factory.mjs` : à partir de vraie vidéo, 30 variantes par clip (10 accroches x 3
  durées). Les deux écrivent un `manifest.json` liant chaque sortie à son accroche.
- `provision.mjs` : provisionne Shopify en Admin GraphQL, idempotent, refuse d'écrire tant
  qu'un placeholder légal traîne dans `content.mjs`.

**Pièges ffmpeg résolus, tous découverts en testant**
- `drawtext` exige un `fontfile` explicite sur Windows (pas de fontconfig), avec le deux-points
  du lecteur échappé : `fontfile='C\:/Windows/Fonts/segoeuib.ttf'`.
- Le recadrage vertical doit être en mode couverture,
  `scale=W:H:force_original_aspect_ratio=increase` puis `crop=W:H`. Sinon une photo 3:4 mise à
  l'échelle sur la largeur est trop courte et libx264 renvoie « Invalid argument » avec un
  fichier vide.
- `zoompan` doit recevoir **une seule image**. Avec `-loop 1`, il produit `d` images pour
  chaque image entrante et la durée explose : 256 secondes au lieu de 3,2.

**Piège de lecture de données**
Le badge Amazon « X achetés au dernier mois » n'apparaît que sur une partie des annonces et
par paliers arrondis. Les totaux sont des planchers, jamais des mesures. La comparaison entre
requêtes reste valide puisque le biais est constant.
