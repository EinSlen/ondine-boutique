# NOTHING LASTS : les motifs à produire

Les cinq scènes ci-dessous sont celles que la boutique vend déjà : les titres, les fiches et
les silhouettes portées y correspondent. Ce fichier remplace `PROMPTS-NANO-BANANA.md`, dont
les six sujets (fuite, combiné, halo, porte, cassette, chaise) décrivaient une autre gamme.

Le logo de marque est déjà prêt : `000-marque-d2m-impression.png`, 4500 x 5400, fond
transparent. Il couvre les quatre pièces LOGO ESSENTIALS.

## Le socle, à donner une seule fois

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
include any weapon, wound, injury or any recognisable real person's face. The burgundy marks
are abstract paint, never blood on a body. Do not make it look like clean vector art, a
polished illustration, a 3D render or a photograph.

Subject: <le sujet ci-dessous>
```

Pour les quatre suivants, ne pas recoller le socle. Écrire seulement :

```
Same hand, same brush, same two inks, same photocopy grain and same plain white background
as the previous image. Now paint: <le sujet>
```

C'est ce qui garde une seule main sur la collection. Un socle recollé cinq fois repart à
chaque coup dans une direction différente.

## Les cinq sujets

**001-split-figures** — vendu comme SPLIT FIGURES ZIP
> Two anonymous figures standing apart, facing away from each other. The one on the left
> reaches both arms upward. The one on the right leans back, head tipped away, a burgundy
> spatter breaking across the space behind them. A wide empty gap runs between the two.

**002-seated-figure** — vendu comme SEATED FIGURE ZIP
> A lone anonymous figure slumped sideways in a plain wooden chair, arms hanging loose, head
> fallen back. A burgundy spatter opening outward behind the head like a stain on a wall.

**003-table-alone** — vendu comme TABLE ALONE ZIP
> A small table laid for two, seen from the side. One chair holds a hunched anonymous
> figure; the chair opposite is empty. A dog sits waiting under the empty side. One burgundy
> mark on the tablecloth.

**004-aftermath** — vendu comme AFTERMATH ZIP
> Two anonymous figures. One stands upright with both hands clasped on top of their head,
> elbows out. The other is collapsed on the ground beside them, limbs folded. A burgundy
> spatter spreading across the ground between them.

**005-run-away** — vendu comme RUN AWAY TEE
> Two anonymous figures moving apart. The one on the left is doubled over, arms dropping. The
> one on the right runs out of frame, hair and coat trailing. A burgundy spatter hanging in
> the air between them.

## Variante pour vêtement noir

Les zips gris et le tee écru prennent la version blanche ; les pièces noires prennent la
variante. Remplacer deux lignes du socle :

```
Palette: two inks only, off-white and one deep burgundy red. Nothing else.
Composition: one isolated subject, centred, on a completely plain flat mid-grey background
(around 50 percent grey) with a generous empty margin on all four sides.
```

Le gris moyen garde assez d'écart avec le blanc cassé comme avec le bordeaux pour que le
détourage tienne.

## Ensuite

Déposer les fichiers ici, nommés `001-split-figures.png` et ainsi de suite, puis :

```
node outils/motifs-impression.mjs
```

Il sort les `*-impression.png` en 4500 x 5400 à fond transparent, le format attendu par
Printful. Fond gris encore visible après détourage : monter `--tolerance` à 60. Bords de
l'encre rongés : la descendre à 30.
