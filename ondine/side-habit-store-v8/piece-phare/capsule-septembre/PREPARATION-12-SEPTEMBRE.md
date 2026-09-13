# Préparation des vêtements — contrôle du 12 septembre 2026

## Résultat réel
- Un nouveau mockup Ruban V2 est sauvegardé dans `assets/02-ruban-tee-v2.png`, intégré à la galerie et comparé à l’original dans `revision-ruban.html`.
- Le rouge a été éclairci et le motif réduit. L’image conserve l’intention générale du tee, mais la texture peut différer légèrement ; aucune reproduction exacte d’un support physique n’est revendiquée.
- Les quatre sorties d’illustrations isolées sont **refusées pour la production** : PNG RGB 1254 × 1254, sans alpha, avec damier visible. Elles restent des essais dans le dossier de génération, pas des livrables d’impression.
- Le rendu V2 est lui aussi une photo simulée du vêtement complet, pas le fichier à imprimer.
- Aucun achat, échantillon, téléversement fournisseur, produit Shopify ou thème publié modifié.

## Résolution et transparence
Contrôle de métadonnées par sharp, sans modification des pixels :
- Ruban initial isolé : exec-153d79bc-7218-4aa7-b3f6-b417db1725f6.png — channels 3, hasAlpha false.
- Galop initial isolé : exec-ae0bd462-e3c3-4b84-a8b1-f7a3ab53c521.png — channels 3, hasAlpha false.
- Ruban correction : exec-7fd87ebd-a6a6-4991-a992-548ee345c49f.png — channels 3, hasAlpha false.
- Galop correction : exec-3eb63df7-ea6c-4621-9c0f-7368f5dc0d2d.png — channels 3, hasAlpha false.

Répertoire d’origine : `C:/Users/Valentin/.codex/generated_images/01a032dc-3e5a-74c2-ae6a-9aa1372cbde9/`.

Calcul : 1254 / (30 / 2,54) = 106,172 ppp pour le canevas complet à 30 cm. Le motif utile est encore plus petit que le canevas. 30 / 2,54 × 150 = 1771,654, donc au moins 1772 pixels utiles pour 30 cm à 150 ppp. La valeur de métadonnées 72 ppp n’est pas, seule, la mesure de qualité à l’échelle réelle. Aucun faux changement à 300 ppp ni agrandissement présenté comme détail natif.

[Guide officiel Printful, consulté le 12 septembre](https://help.printful.com/hc/en-us/articles/28491464259740-How-should-I-prepare-my-print-file-for-the-best-results) : la plupart des vêtements requièrent au moins 150 ppp ; certains supports ou détails demandent 300 ppp. Il faut consulter les règles du produit, contrôler transparence et couleur. Cette règle générale ne remplace pas le gabarit du compte.

## État de l’objectif
Le précédent échange d’évaluation ne livrait pas de nouveaux vêtements ni de fichiers : il n’est pas compté comme réalisation. Cette reprise produit une révision visible et identifie un échec technique vérifié qui change la suite : ne pas envoyer ces PNG au fournisseur, et ne pas relancer indéfiniment la même extraction.

L’objectif reste actif et incomplet. Le périmètre complet de `VETEMENTS-A-REALISER.md` est conservé. Il faut encore confirmer le fournisseur utilisé, les vrais supports et leurs gabarits, finaliser les décors utilisables, les autres catégories et la liaison de fabrication. La demande de capture fournisseur reste sans réponse à cet instant. Aucune conclusion « toute la collection est bloquée » n’est tirée du seul échec de détourage.

La génération intégrée a été utilisée exclusivement (5 appels). Pas de CLI/API de remplacement, pas de retouche raster par script. Il faudra une méthode de détourage/export adaptée et une source de résolution suffisante pour les grandes impressions ; la V2 ne résout pas ces points.

## Prompts exacts — mode intégré

### 1. Ruban, illustration isolée
```text
Use case: precise-object-edit.
Asset type: isolated garment print illustration, not a clothing photograph.
Input image 1: edit target, our existing charcoal T-shirt with red glass bow. Extract and refine ONLY the bow artwork.
Primary request: create a standalone high-resolution print master of this exact bow concept. Preserve the original two-loop silhouette, central knot, asymmetric two long tails and sculptural red-glass identity. Improve legibility on charcoal cotton: more luminous saturated ruby/cherry red midtones, broad clean pale rose highlights, fewer murky black internal folds, simpler crisp internal shapes. The effect is an illustration of glossy material, not a promise of shiny physical ink.
Composition: a single complete bow, centered, upright, loops and tails entirely visible, with approximately 5% clear margin. Bold, readable from a distance, editorial streetwear graphic, no text or new motifs.
Background: genuinely transparent alpha outside the bow, including inside the two loop openings. No white or dark rectangle, no painted checkerboard, no shadow outside the artwork, no fabric, no garment, no studio background. Opaque colored bow body; transparency is for cutout background only.
Output: native high-resolution PNG, preferably 3072 by 3072 pixels or the highest supported native resolution, with clean antialiased edges. Do not add garment texture to the artwork.
Constraints: keep the concept recognizably the same bow; no cherries, heart symbols, logos, brand names, slogans, extra objects, frames or watermark.
```

### 2. Galop, illustration isolée
```text
Use case: background-extraction.
Asset type: standalone one-color garment print illustration.
Input image 1: edit target, our existing white T-shirt with black horse graphic. Isolate ONLY its horse illustration.
Primary request: produce the horse graphic as separated black ink on genuine transparent background, not a photo of a T-shirt. Preserve the horse's pose, direction facing right, anatomy, mane and tail movement and overall diagonal composition. Keep the recognizable four legs and natural anatomy. Retain the rough photographic threshold/photocopy aesthetic but make intentional printable black marks rather than a haze of semi-transparent grey pixels. Negative white highlights and spaces in the horse should be transparent, exposing the garment color. No opaque white ink layer.
Composition: full horse, no cropping, no ground line, centered with about 5% clear margin. No new text or branding.
Output: native high-resolution PNG, preferably 3072 by 3072 pixels or the highest supported native resolution, genuine alpha. Transparent area must extend to every edge; no simulated transparency grid or background. No fabric, no seams, no clothing silhouette, no shadows outside the horse, no watermark.
Constraints: this is the existing original horse concept, not a new generic mascot; do not add another animal or change its pose.
```

### 3. Correction de transparence Ruban
```text
Edit this image: remove the entire gray and white patterned background. Return only the unchanged red bow as an RGBA PNG cutout with real alpha transparency. Empty pixels must have alpha zero. Preserve the red bow exactly, including its highlights. The spaces inside the loops are also empty. Keep native detail; high resolution.
```

### 4. Correction de transparence Galop
```text
Edit this image: remove the entire gray and white patterned background. Return only the unchanged black horse illustration as an RGBA PNG cutout with real alpha transparency. Empty pixels must have alpha zero. Preserve the pose and all black horse marks exactly. Treat the white highlights in the horse as empty transparent space too. Keep native detail; high resolution.
```

### 5. Mockup Ruban V2
```text
Use case: compositing.
Asset type: garment design revision, a single full T-shirt back-view mockup.
Input image 1: edit target. Preserve this exact charcoal washed T-shirt, ribbed collar, sleeve length, dropped shoulders, fabric texture, silhouette, neutral studio backdrop, framing and lighting.
Input image 2: artwork reference only. Use only the more luminous red bow; IGNORE its entire gray-and-white patterned background. Do not transfer any background rectangle or pattern.
Primary request: replace the old dark bow on image 1 with the bright ruby-red bow from image 2. Keep the complete two loops, central knot and two asymmetric long tails; preserve the artwork's proportions. Center on upper/middle back with clear empty fabric around it, no seam crossings. Set bow width to approximately 48% of the straight body width measured between the underarms, noticeably smaller than the original mockup. The top is below the collar, with generous blank space near the hem.
Print appearance: flat ink printed into matte cotton, no 3D raised applique, embroidery, vinyl sheen, foil or physical glass. Glossy highlights are part of the image printed with flat ink. Keep ruby-red midtones clearly readable on dark charcoal. Include natural subtle fabric weave through the print, not a solid sticker rectangle.
Constraints: no other edits, no logos, no text, no new objects, no watermarks. One T-shirt only, full back view, uncropped. This is a visual concept, not a photograph of a manufactured product.
```
Sortie : exec-9f9b55e5-ec8c-4a07-9216-293706ac40f5.png, copiée sans retouche dans `assets/02-ruban-tee-v2.png`.

