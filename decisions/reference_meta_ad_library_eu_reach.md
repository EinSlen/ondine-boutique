---
name: reference_meta_ad_library_eu_reach
description: "Estimer le budget pub Meta d'un concurrent via la couverture UE exacte par pub (GraphQL AdLibraryV3AdDetailsQuery), méthode et chiffres Moovora du 18/10/2026"
metadata:
  node_type: memory
  type: reference
  originSessionId: 7ea3dc47-2666-4a2a-aabe-2384fde52801
  modified: 2026-10-18T20:22:26.942Z
---

La bibliothèque pub Meta publie pour chaque pub diffusée dans l'UE `eu_total_reach` (personnes uniques), plus le payeur
déclaré. Recette testée le 18/10/2026 (Edge headless puppeteer-core, profil jetable, sans connexion) :
1. page de recherche `ads/library/?active_status=all&country=ALL&q=<marque>`, scroller, extraire les « ID dans la bibliothèque » + dates ;
2. cliquer un « Voir les détails de la publicité » pour capturer le POST `/api/graphql/` `AdLibraryV3AdDetailsQuery` ;
3. le rejouer par `fetch` dans la page en changeant seulement `adArchiveID` (garder `pageID`, sinon `missing_required_variable_value`).
Budget ≈ couverture x fréquence (1,5-2,5) x CPM FR (6-10 €) : 9 / 16 / 25 € pour 1 000 personnes (bas / central / haut).
Google : Centre de transparence, page créa `?region=FR` donne « Nombre de diffusions » en fourchette (données avec ~3 mois de retard).

Moovora (concurrent de [[project_kapsulcam]]) au 18/10 : 510 pubs Meta dont 169 actives, 13,9 M de couverture UE cumulée
depuis oct. 2025, ~1,5 M/mois en sept. => ~24 k€/mois (13-37 k€), rythme octobre ~29 k€ ; Italie depuis juin (~1/3) ;
Google marginal (13 annonces, compte « TouliCoin »). Pub la plus vue : angle dashcam voiture (lecture de plaques, GPS).

**Vidéos + son (19/10/2026)** : la page de recherche (`media_type=video`, `view_all_page_id=<id>`) contient dans ses JSON (HTML + réponses `/api/graphql`) des objets `ad_archive_id` + `snapshot.videos[].video_hd_url` : fichiers téléchargeables directement par curl (liens signés, à prendre tout de suite). Analyse du son : ffmpeg 8.1 a le filtre `whisper` (modèle ggml-small.bin de huggingface ggerganov/whisper.cpp, ~11 s pour 40 s d'audio), Shazam via `shazamio` dans un venv, canal « side » stéréo pour la musique sous une voix. Scripts dans `Desktop\Ondine\kapsulcam\pub\benchmark\son-genre-19-10\outils`. Les pubs servies par Meta sont toutes à -14 LUFS.


Résumé repris de l index (compacté le 25/10/2026) : couverture UE par pub via GraphQL ; Moovora ~25-30 k€/mois au 18/10
