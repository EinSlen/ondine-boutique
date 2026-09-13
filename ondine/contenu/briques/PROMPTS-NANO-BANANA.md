# Prompts Nano Banana pour les six briques dead2me

Route manuelle et gratuite : génération dans l'app Gemini, puis `motif_impression` du serveur
MCP pour le fichier d'impression. Les modèles image de l'API Gemini sont payants, seule l'app
grand public est gratuite, donc c'est du copier-coller assumé.

## Trois contraintes qui sont dans le prompt pour une raison

**Fond blanc uni, encre noire et bordeaux, jamais de blanc cassé.** Le détourage mesure
l'écart de couleur entre le fond et le dessin. Un fond gris clair avec de l'encre blanc cassé
ne laisse que 51 points d'écart, et le détourage rongerait les bords de l'encre. Blanc contre
noir laisse 440 points, c'est sans ambiguïté. Ces pièces vont donc sur vêtement blanc, écru ou
clair. Pour du vêtement noir, voir la variante en bas.

**Aucun texte dans l'image.** La typographie sort de `contenu/phrases.mjs`, qui la tord et la
ronge mieux qu'un modèle d'image, sans faute d'orthographe et gratuitement. Le modèle ne
dessine que le motif.

**Marge généreuse sur les quatre côtés.** Sans elle le recadrage n'a rien à mordre et Printful
place le dessin trop près de la couture.

## Le socle, à coller avant chaque sujet

```
Create a single graphic intended for screen printing on a garment.

Style: raw hand-painted artwork made with a loaded acrylic brush and a thick black marker
outline. Deliberately crude and amateur, as if painted quickly in a bedroom by someone who
is not a professional illustrator. Visible brush texture, wet paint drips running downward,
uneven bleeding edges, a few small spatter flecks. Hard contrast, flat solid areas of ink,
no gradients and no shading. Heavy photocopy grain, as if the artwork had been photocopied
several times.

Palette: two inks only, matte black and one deep burgundy red. Nothing else.

Composition: one isolated subject, centred, on a completely plain flat pure white background
with a generous empty margin on all four sides. Vertical framing, aspect ratio 4:5.

Do not include any text, letters, numbers, words, signature, watermark or logo. Do not
include any weapon, gun, bullet, bullet hole, wound, blood on a body, or any recognisable
real person's face. Do not make it look like clean vector art, a polished illustration, a 3D
render or a photograph.

Subject:
```

## Les six sujets

### 001 fuite (phrases de rôle « court »)

```
A lone anonymous figure walking away from the viewer, seen from behind, wearing a long coat,
no visible face. One broad burgundy brush stroke slashing diagonally behind her.
```

### 002 combine (phrases de rôle « attend »)

```
An old corded telephone handset left off the hook, hanging and swinging at the end of its
stretched coiled cord. Burgundy paint running down the length of the cord.
```

### 003 halo (phrases de rôle « assis »)

```
An anonymous figure sitting hunched forward on a chair, face buried in both hands. A cracked
circular halo broken open behind the head. A single wilted rose falling below.
```

### 004 porte (phrases de rôle « couple »)

```
Two anonymous silhouettes separated by a narrow doorway. One stands still inside, the other
is already walking out of the frame. A hard rectangle of light between them.
```

### 005 cassette

```
An audio cassette pulled apart, its magnetic ribbon unspooled and tangled across the whole
composition. A burgundy stain soaking through the tangle.
```

### 006 chaise

```
An empty office chair on casters tipped slightly back, a black jacket left hanging from one
armrest, a dead rose on the floor beneath it.
```

## Comment garder la même main sur les six

C'est le point qui décide de la cohérence de la collection. Le créneau ne vend pas six
dessins sans lien, il vend six briques de la même main croisées entre elles.

Tout faire **dans une seule conversation**. Le premier prompt porte le socle complet. Pour les
cinq suivants, ne pas recoller le socle, écrire :

```
Same hand, same brush, same two inks, same photocopy grain and same plain white background
as the previous image. Now paint:
```

Nano Banana tient le style d'une image à l'autre quand on l'enchaîne comme ça, alors qu'un
socle recollé six fois repart à chaque coup dans une direction différente.

## Croiser les briques

C'est le mécanisme de catalogue du créneau : six dessins croisés donnent quarante références.
Dans la même conversation, sur une image déjà obtenue :

```
Keep this exact image and its style. Add to the same composition, painted with the same
brush: <l'autre sujet>
```

## Ensuite

Déposer les fichiers dans `contenu/briques`, nommés `001-fuite.png` et ainsi de suite, puis
appeler l'outil `motif_impression` du serveur MCP. Il détache le fond, recadre sur le dessin
et sort le 4500 x 5400 à fond transparent attendu par Printful.

Si un fond gris reste visible après détourage, monter `tolerance` à 60. Si les bords de
l'encre sont rongés, la descendre à 30.

## Variante pour vêtement noir

Remplacer la ligne de palette par :

```
Palette: two inks only, off-white and one deep burgundy red. Nothing else.
```

et la ligne de fond par :

```
Composition: one isolated subject, centred, on a completely plain flat mid-grey background
(around 50 percent grey) with a generous empty margin on all four sides.
```

Le gris moyen laisse assez d'écart avec le blanc cassé comme avec le bordeaux. Appeler
ensuite `motif_impression` avec `tolerance` à 55.

## Le marquage à connaître

Toute image Google porte un filigrane invisible SynthID, conçu pour survivre au recadrage, au
redimensionnement et à la compression. Ça n'interdit pas la vente. Mais la marque vend
« peint à la main, pièce unique », et n'importe qui peut passer le fichier au détecteur. C'est
un risque de marque, pas un risque juridique, et il se paie en clé fal si on veut l'éviter.
