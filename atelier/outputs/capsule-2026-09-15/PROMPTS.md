# Prompts — reprise du 15 septembre 2026

Génération et édition réalisées avec l'outil image intégré. Deux planches validées comme aperçus de concepts uniquement. Un essai de décor isolé est rejeté pour défaut de transparence. Aucun autre moteur ou retraitement bitmap n'a été utilisé.

## Planche des hauts

```text
Use case: product-mockup.
Create one beautifully art-directed fashion collection presentation board for a private French streetwear project called Ondine (project name, NOT a finalized logo). This is a NEW exploratory collection, not a shop or manufactured-product claim. Vertical 4:5 composition, high-resolution image. Off-white studio paper background, lots of negative space, quiet editorial typography. Exactly four garments in a balanced 2 by 2 grid, full silhouettes, large enough to inspect the print. Small neat heading "ÉTUDE 01 / LES HAUTS". Each garment gets only its numbered caption below, as specified. Small footer "CONCEPTS — RENDUS GÉNÉRÉS".
DESIGN DIRECTION: convincing cotton garment texture and studio shadows, but every printed illustration must be strongly TWO-DIMENSIONAL, MATTE, HAND-DRAWN and fashion-oriented. Bold confident brush contours, restrained irregular ink grain, 2 or 3 flat inks maximum, adult editorial illustration. No realistic animal photography, no chrome, glass, inflated shapes, 3D objects, shiny ribbons, cherries, phone imagery, stock-vector clipart, skulls, generic big brand lettering or made-up logos. These are original drawings, no competitor logo or artwork.
1 upper left: back view of a faded-bone heavyweight relaxed boxy T-shirt with dropped shoulders. Central back illustration occupying approximately half the torso width: TWO racing horses, one dark ink blue and one dark vermilion, galloping in opposite directions and weaving into an open oval composition. Their long gestural tails and manes express speed, excellent graceful anatomy with elongated graphic proportions. Sophisticated rough silkscreen/poster drawing, individual broad strokes, only two flat opaque colors. Not photographic, not sculpted. No surrounding text. Keep print well away from seams, collar and hem. Caption "01 / GALOP — DOS".
2 upper right: front view of a faded-charcoal heavyweight boxy T-shirt. Central expressive vintage editorial drawing of a wind-bent iris flower, a SMALL imperfect red sun behind its upper stem, and a few thin broken horizontal lines suggesting wind. Ivory and muted red inks, flattened elegant organic drawing with broad readable shapes, asymmetrical but compact vertical composition, no rectangle background, no ornamental frame, no slogan. Not botanical photorealism, not a realistic rose, not a tattoo mockup. Caption "02 / CONTREVENT — FACE".
3 lower left: front view of a deep-navy relaxed pullover hoodie, dropped shoulders, moderate fleece weight, regular-length ribbed hem, kangaroo pocket, no drawstrings. Across upper chest above the pocket, a smaller horizontal ivory version of the gestural racing-horses drawing, approximately 19 cm wide visually, a flat ink print. No lettering, no puff print, no embroidery illusion. Caption "03 / GALOP — HOODIE".
4 lower right: front view of a relaxed, slightly wide cotton long sleeve, fine even navy/ivory horizontal stripes, dark navy crew neck, straight hem, no giant sleeve graphic. Tiny muted-red iris silhouette on left chest, same line language as tee 02 but much simpler and only 4 cm visually. Caption "04 / RAYURE — MANCHES LONGUES".
The striped long sleeve is an aspirational construction study, not a verified supplier product. All garments are visual concepts, do not print prices, supplier names, material specifications, dimensions, order controls or availability badges on the board. Elegant polished clothing design, make the illustrations desirable and genuinely drawn rather than a realism effect.
```

## Planche bas et accessoires

```text
Use case: product-mockup. One new editorial fashion concept board for the private clothing project Ondine, matching a sophisticated French streetwear capsule of matte ink drawings on bone, charcoal, navy and burgundy garments. This is a design-development board, not items for sale. Vertical 4:5 image with warm ivory studio background, elegant spacious layout, restrained high-contrast serif captions. Top heading "ONDINE / ÉTUDE 02", subheading "BAS & ACCESSOIRES"; footer "CONCEPTS — SUPPORTS À CONFIRMER". No other body paragraphs, no pricing, no specification claims.
Show exactly four distinct product concepts in an elegant 2 by 2 grid with absolutely no overlap:
05 top left: full FRONT view of long wide-leg elastic-waist cotton jersey pants, off-white ground with FINE dark-navy vertical double pinstripes, softly pooled straight hems, practical side pockets. No denim construction, no belt loops, no giant logo, no patches, no illustrated horse. An attractive grown-up streetwear silhouette, not trousers shown cropped at the knee. Fine subtle double lines, not broad circus stripes. Caption "05 / LIGNE — PANTALON".
06 top right: three-quarter view of a washed burgundy unstructured curved-brim cap. A tiny elegant one-color ivory emblem of a running horse centered above brim, only bold contours and four leg strokes, no micro detail. This is embroidery design exploration, the silhouette must be bold and simple enough for small scale. No text on cap. Caption "06 / GALOP — CASQUETTE".
07 bottom left: isolated real knitted BALACLAVA shape, dark navy rib knit, with one broad oval face opening bounded by a narrow burgundy rib-knit border and an extended neck. Clearly a closed-over-head balaclava, not an open hood, not a neck gaiter, not a beanie. A quiet garment led by its construction, without a graphic print. No model face. Caption "07 / CONTOUR — CAGOULE".
08 bottom right: one PAIR of small asymmetrical satin silver-tone drop earrings. Two matching simple thin mini-hoops, each suspending a single flat irregular crescent metal charm; one crescent slightly longer than the other. A calm sculptural accessory echoing the movement of the drawings. No stones, no glossy red glass, no hearts, no fantasy complex casting. Pair should be shot closer so inspectable but still clearly jewelry. No claim about alloy or production availability. Caption "08 / CROISSANT — BOUCLES".
Use believable garment fabrics and soft shadows on the presentation board. Any graphic decoration must be a flat two-dimensional drawn mark, no chrome graphics, no photo animals, no glossy ribbon, cherries or competitor trademarks. Polished intentional fashion art direction, make the four products harmonious with navy/ivory/oxide red shirts, but avoid stamping every object with the same icon. All silhouettes and materials are proposed appearances, not supplier-exact mockups.
```

## Essai Galop isolé — rejeté

Image source : `assets/01-hauts.png`. Le résultat est conservé sous `verification/galop-extraction-rejetee.png`.

```text
Use case: background-extraction / precise-object-edit.
The attached image is OUR NEW original fashion concept board. Edit target: ONLY the two-color horse illustration printed on the upper-left bone T-shirt. Produce a separate full-resolution artwork asset for continued print preparation.
Extract and faithfully reconstruct the exact two-horse drawing: navy horse above/left, oxide-red horse below/right, their flowing manes and tails, exact directions, expressive brush contours and worn ink gaps. Preserve this composition and the relationship between the two horses, do not replace it with different poses or new motifs.
Return ONE isolated artwork, no garment, no fabric texture, no garment folds, no captions, no board title, no background paper, no rectangle or border. Both inks should be opaque and matte; the empty areas and worn-out gaps must be genuinely TRANSPARENT ALPHA, not ivory pixels, not a checkerboard painted into the image, not a fake gray shadow.
Maximize native pixel resolution, comfortably center the full illustration with a small transparent margin; do not crop tails or legs. Output PNG with actual alpha transparency. This is an art source, not a labeled print-ready or 300-dpi claim. No text anywhere.
```

