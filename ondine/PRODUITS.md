# Gamme dead2me : les modèles et les pièces

Établi le 21 août 2026, à partir de l'audit du créneau (`AUDIT-SADCORE.md`) et des coûts de
fabrication réels mesurés en Union européenne (`mesures/pod-eu.json`). Les prix de vente ne
sont pas fixés ici, seuls les coûts de revient le sont, parce qu'eux sont mesurés.

## 1. Le principe de la gamme

L'audit a donné le mécanisme : **la rareté fait la vente, l'audience ne suffit pas.** 242.g_ a
dix fois l'audience de live2die et ne vend rien, parce qu'il vend du stock permanent.

Mais on ne peut pas faire de publicité sur une pièce unique : l'annonce serait épuisée avant
d'avoir amorti son apprentissage. D'où trois étages, chacun avec un rôle distinct.

| Étage | Rôle | Tirage | Canal |
|---|---|---|---|
| **A. La pièce** | fait la marque et la vente | 1 seul exemplaire, numéroté | TikTok organique |
| **B. La série** | encaisse la publicité | ouvert, réassort permanent | Meta, TikTok Ads |
| **C. Le collectible** | attrape l'abonné qui ne mettra pas 70 € | ouvert | boutique, panier |

C'est exactement la structure de live2die, qui vend son sweat à 74 $ et son briquet à 5 $.
L'étage C n'est pas un gadget : c'est lui qui remplit la liste d'emails avec laquelle on
recible les étages A et B sans repayer l'acquisition.

## 2. Les modèles de vêtement, fabricables en UE

Tout est vérifié en stock dans les entrepôts UE (Lettonie et Espagne). Coût de la plus petite
taille, hors remise d'abonnement, au taux de change réel 0,856037.

### Étage A, la pièce unique, imprimée sur tout le vêtement

L'impression intégrale (all-over print, technique de découpe-couture) est notre argument le
plus visible : le motif couvre les manches, le dos, la capuche. Personne dans le créneau ne
fait ça, ils impriment tous une image au centre de la poitrine.

| Modèle | Réf. | Coût | Pourquoi lui |
|---|---|---|---|
| Sweat à capuche recyclé | 388 | **38,95 €** | la pièce reine, c'est le vêtement du créneau |
| Sweat col rond recyclé | 320 | **31,03 €** | même surface imprimée, 8 € de moins, entrée de l'étage A |
| Sweat zippé recyclé | 717 | 49,01 € | trop cher pour démarrer, à garder pour une série spéciale |
| T-shirt col rond | 257 / 261 | 22,21 € / 21,19 € | attention : coupe genrée et toucher polyester |
| T-shirt court | 303 | 20,33 € | vraie demande féminine dans le créneau |

Recommandation : **on lance l'étage A sur le 388 et le 320 seulement.** Deux modèles, c'est
deux fois moins de photos à produire par pièce, et le sweat est le vêtement que la niche porte
réellement.

### Étage B, la série publicitaire, image placée

Ici on imprime une image sur un vêtement en coton normal. C'est moins spectaculaire, mais
trois fois moins cher, réassortissable à l'infini, et le toucher est celui d'un vrai vêtement,
ce qui fait chuter les retours.

| Modèle | Réf. | Coût | Pourquoi lui |
|---|---|---|---|
| T-shirt lourd teinté en pièce | 586 | **13,09 €** | le Comfort Colors 1717, exactement le t-shirt vintage épais que la niche porte |
| Sweat à capuche | 146 | **19,05 €** | le Gildan 18500, le sweat noir standard du créneau |
| T-shirt manches longues | 356 | **15,62 €** | live2die en vend un, la niche aussi |
| T-shirt basique | 438 | 6,42 € | seulement comme prix d'appel très bas, la qualité se sent |
| Polo | 512 | 13,91 € | 242.g_ en vend un, c'est un signal ironique de la niche, à tenter plus tard |

Recommandation : **586 et 146 pour ouvrir**, le 356 en troisième si la publicité tourne.

### Étage C, le collectible

| Modèle | Réf. | Coût | Remarque |
|---|---|---|---|
| Sticker découpé | 358 | **2,14 €** | offert au-delà d'un certain panier, c'est un aimant à liste d'emails |
| Poster mat | 1 | **5,56 €** | live2die vend le sien à 5 $ : au coût que ça nous fait, c'est un cadeau, pas un produit |
| Poster satiné | 171 | **7,49 €** | la version vendable |
| Bandana imprimé intégral | 630 | **8,77 €** | taille unique, aucun retour possible, marge excellente |
| Bonnet imprimé intégral | 458 | 13,27 € | taille unique aussi |
| Sac à cordon | 262 | 15,84 € | live2die vend des sacs de 25 à 45 $ |
| Banane | 350 | 22,90 € | trop cher pour l'étage C |
| Mug | 19 | 5,09 € | hors registre, à écarter |

Recommandation : **sticker, poster satiné, bandana.** Les trois sont sans taille, donc zéro
retour pour cause de taille, qui est le premier poste de retour du vêtement en ligne.

## 2 bis. Tout le catalogue européen, mesuré

`mesures/pod-eu-tout.mjs` passe sur les **532 produits actifs** de Printful et retient ceux
qui ont au moins une variante en stock dans un entrepôt européen. Résultat :

| | Nombre |
|---|---|
| Produits actifs au catalogue | 532 |
| **Fabricables en Union européenne** | **243** |
| dont disponibles en noir | 110 |
| dont brodés uniquement, donc **incompatibles** avec notre encre | 14 |
| **Réellement utilisables pour dead2me** | **229** |

La broderie ne reproduit ni une encre rongée, ni une coulure, ni un dégradé. Les quatorze
produits qui ne savent faire que ça sont hors sujet pour la marque, quel que soit leur prix.

### La réponse sur les chaussures

**Il n'y a pas de chaussures fabricables en Europe.** Les cinq modèles hommes et les cinq
modèles femmes sont tous marqués hors stock UE : baskets athlétiques, montantes en toile,
lacets en toile, claquettes, sans-lacets. Vérifié un par un.

La seule chose qui se chausse et qui part d'Europe est la **tong sublimée, réf. 359, à
11,75 €**. Elle est réelle et imprimable intégralement, mais c'est une tong.

Deux façons de vivre avec :

- **on s'en passe.** Une marque de vêtements sadcore n'a pas besoin de chaussures, et aucune
  des trois marques de l'audit n'en vend.
- **on accepte l'expédition depuis les États-Unis** pour ce seul produit. Le délai et le port
  ruinent l'expérience client, et un colis hors UE peut se prendre des frais de douane à
  l'arrivée. À éviter au lancement.

### Le meilleur de chaque catégorie, en UE

Prix de la variante la moins chère, hors remise d'abonnement.

| Catégorie | En UE | Le plus intéressant | Réf. | Coût |
|---|---|---|---|---|
| Sweats et vestes | 34 | sweat capuche Gildan 18500, noir | 146 | 19,02 € |
| | | sweat col rond Gildan 18000, noir | 145 | **14,49 €** |
| | | coupe-vent SOL'S 32000, noir, mais **broderie seule** | 661 | 17,91 € |
| T-shirts | 36 | tee lourd teinté Comfort Colors 1717 | 586 | 13,09 € |
| | | tee Gildan 5000, prix d'appel | 438 | **6,41 €** |
| Manches longues | 3 | Gildan 2400, noir | 57 | 13,89 € |
| Bas | 23 | short imprimé intégralement | 298 | 17,31 € |
| Casquettes et bonnets | 30 | bonnet imprimé intégralement | 458 | 13,27 € |
| | | casquette 5 panneaux, noire | 952 | 10,52 € |
| | | bandeau imprimé intégralement | 545 | **6,20 €** |
| Sacs | 15 | cabas imprimé intégralement, noir | 84 | 14,32 € |
| | | cabas coton Westford Mill, noir | 1553 | **8,98 €** |
| | | sac à cordon imprimé intégralement | 262 | 15,81 € |
| Accessoires textile | 6 | bandana imprimé intégralement | 630 | 8,76 € |
| | | chaussettes sublimées | 186 | 9,19 € |
| | | tour de cou imprimé intégralement | 420 | 10,04 € |
| Papier | 57 | stickers découpés | 358 | **2,14 €** |
| | | stickers holographiques | 673 | 4,06 € |
| | | carte postale | 433 | **1,50 €** |
| Maison | 12 | mug noir brillant | 300 | 6,80 € |
| Téléphone | 2 | coque AirPods, noire | 605 | 10,47 € |
| **Chaussures** | **1** | **tong sublimée, et rien d'autre** | 359 | 11,75 € |

Trois trouvailles dans ce tableau :

- le **sweat col rond Gildan 18000 à 14,49 €** est 4,50 € moins cher que le sweat à capuche
  et porte aussi bien un imprimé de poitrine. C'est la vraie entrée de gamme de l'étage B.
- le **bandeau à 6,20 €** et les **stickers holographiques à 4,06 €** sont deux collectibles
  à très forte marge que je n'avais pas vus.
- la **carte postale à 1,50 €** peut être glissée dans chaque colis. Sur ce créneau, une
  phrase imprimée sur une carte dans un colis est exactement le genre de détail qui se filme
  et se poste.

## 3. Les modèles de visuel

Deux moteurs portent la marque, et ils partagent la même main : tout le geste (l'encre
tordue puis rongée, les coulures, l'écriture) vit dans un seul fichier, `contenu/encre.mjs`.
C'est ce qui fait qu'une pièce à silhouette et une pièce à phrase seule se ressemblent.

### Moteur principal : la série, silhouette plus phrase

`contenu/serie.mjs`, planche `contenu/planche-serie.html`.

C'est la fusion des deux essais validés. Les silhouettes CC0 retenues passent sous le même
filtre d'encre que le texte, donc elles cessent de lire comme du vecteur importé et
deviennent de la peinture.

Deux règles de composition :

1. **La phrase et l'image disent la même chose.** Chaque phrase porte un rôle et seules les
   scènes de ce rôle sont tirées. Une phrase de rupture sur une silhouette assise ne
   raconte rien.
2. **La scène occupe le haut, la phrase le bas.** C'est la lecture d'un imprimé de poitrine,
   et c'est aussi ce qui se lit sur une vidéo verticale.

Cinq scènes : l'avant et l'après dans la même image, la mémoire (le couple minuscule en haut
et l'effondrement en grand dessous), l'effondré seul, le couple seul, et la croix.

### Moteur secondaire : la phrase seule

`contenu/phrases.mjs`, planche `contenu/planche-phrases.html`, 48 visuels.

Une pièce entièrement typographique. Trois avantages qui la rendent indispensable :

1. **Aucun asset à acheter.** Rien ne bloque, jamais.
2. **Zéro risque juridique.** Ni droit d'auteur photographique, ni droit à l'image, ni
   marque déposée. C'est la seule famille sur laquelle nous ne prenons aucun risque, alors
   que les deux marques de l'audit en prennent de bien réels.
3. **Ça se lit sur une vidéo de trois secondes.** Une silhouette fine ne se lit pas à cette
   taille, une phrase si.

### Le vocabulaire d'objets, celui qui manquait

La bibliothèque contenait depuis le début 49 objets et 47 symboles moissonnés, et **aucun
n'était utilisé**. C'était l'erreur : dans ce créneau, un objet raconte souvent mieux qu'un
personnage. Un banc vide dit l'absence mieux qu'une silhouette, parce qu'il n'y a personne
dessus et que c'est tout le sujet.

`contenu/revue.mjs` a été écrit pour ça : il rend chaque pièce **dans le style de la marque**,
encre claire sur noir, à travers le filtre. Une planche brute d'Openclipart ne permet pas de
juger, un trait fin y paraît correct sur fond blanc et devient une bouillie illisible sur un
vêtement. Planche : `contenu/revue.html`.

**23 pièces ajoutées** après cette revue, et 27 écartées avec leur raison :

| Nouveau rôle | Ce que c'est |
|---|---|
| `banc` | un banc public vide, la pièce la plus forte du lot |
| `lune` | pleine lune, croissant, lune encadrée de branches nues |
| `tombe` | croix sur un tertre, pierre tombale et arbre mort, lune derrière une croix |
| `paysage` | frises de cimetière avec arbres nus, servent de bande basse |
| `oiseau` | un corbeau posé, un oiseau qui s'envole |
| `grille` | grille de fer forgé, lit comme une entrée de cimetière |
| `rose` | une rose pleine, la seule pièce douce de la série |
| `clope` | une cigarette posée |
| `couronne` | une couronne funéraire |
| `table` | un couple attablé, vu de dos |
| `chaises` | une rangée de chaises occupées |
| `cadre` | un cadre de barbelés |

Ce qui a été écarté, et pourquoi c'est utile de le savoir : quatre fichiers ne contiennent
qu'un **rectangle plein** (fichiers cassés), trois ont du **texte incrusté** dedans (« Designed
and released in public domain by FreeSVG.org », « HOME SWEET HOME »), six sont des horloges
**4:20**, et le reste est hors registre (fauteuil roulant, escargot, tire-bouchon, hamacs,
couverts, cupidons, anges).

**Douze scènes nouvelles** en sont sorties : le banc seul, sous la lune, l'horizon de
cimetière, la tombe seule, la rose seule, la cigarette, la table du souvenir, l'oiseau qui
part, la grille fermée, la couronne, les chaises pleines, le cadre de barbelés. Avec les sept
d'avant et les huit d'objets dessinés, le moteur a **vingt-six scènes**.

### Les objets de l'absence, dessinés en code

`contenu/objets.mjs`. Une chaise **renversée**, un lit défait **d'un seul côté**, une valise
posée à la porte : ce sont des **états**, pas des objets, et aucun catalogue de silhouettes ne
les propose. Les dessiner donne le contrôle exact sur l'état, et supprime toute question de
licence.

Six objets, tous en formes pleines pour tenir à côté des silhouettes du fonds : chaise
renversée, chaise vide, valise, lit défait, place vide à table, téléphone posé écran contre la
table. Huit scènes en sortent, dont la chaise renversée avec l'effondré dessous.

Trois choses apprises en les dessinant, qui valent pour tout objet ajouté ensuite :

- **Une chaise vue de face n'est qu'une grille de barreaux.** Il faut la vue trois quarts, où
  la face supérieure de l'assise se voit : c'est elle qui fait lire « chaise » d'un coup d'oeil.
- **Une chaise couchée à plat devient une forme abstraite**, quel que soit le point de vue. À
  quatre-vingt-dix degrés ce n'est plus qu'un « h » posé. Elle est donc basculée à
  cinquante-sept degrés, et c'est la **ligne de sol** qui dit qu'elle est tombée.
- **Dans une forme pleine, tout détail intérieur est invisible.** Les fermoirs de la valise ont
  été sortis du bord haut pour se voir, et l'assiette de la place vide est évidée avec la
  couleur de fond, sinon ce n'est qu'un disque.

### Les deux silhouettes qui manquent

Deux rôles n'ont plus d'asset utilisable et retombent sur les scènes validées :

- **une femme qui s'éloigne en marchant.** Tout ce qui existe en libre est une coureuse, et
  une coureuse raconte du sport, pas un départ.
- **une personne debout seule.** La seule disponible lisait comme un vigile, elle est sortie
  de la sélection.

Les deux coûtent 10 à 30 € en licence étendue sur une banque d'images. C'est le seul achat
qui débloque quelque chose dans tout le projet. `node serie.mjs --coureurs` réactive les
scènes de course pour comparer une fois l'achat fait.

### Les trois moteurs précédents

`recit.mjs` (silhouettes, texte faible), `griffe.mjs` (pochoir dégoulinant, sert de texture)
et `winning.mjs` (registre RawSoult au stylo). Ils tournent toujours et alimentent la
variété du flux TikTok, mais ils ne portent plus la marque.

## 4. La bibliothèque de phrases

Les trois règles relevées sur leurs vrais produits : **présent ou passé immédiat**, **adressée
à quelqu'un d'absent**, **deux à quatre mots**, jamais poétique, toujours parlée.

Toutes celles-ci sont écrites pour dead2me, aucune n'est reprise de leurs produits. En anglais,
parce que c'est la langue du créneau, y compris pour l'audience française.

La colonne « pub » applique la règle des attributs personnels de Meta : une annonce ne peut pas
sous-entendre qu'elle sait quelque chose de personnel sur celui qui la voit. Une phrase à la
première personne parle de nous, elle passe. Une phrase qui dit « you » peut être refusée. Les
phrases marquées « organique » vont sur l'étage A, qui ne fait pas de publicité de toute façon.

| Phrase | Registre | Pub |
|---|---|---|
| don't wait up | départ | organique |
| i left first | départ | oui |
| i still park there | habitude restée | oui |
| we said forever | passé commun | oui |
| she isn't coming | attente | oui |
| i waited anyway | attente | oui |
| nothing after you | après | organique |
| you moved on fast | après | organique |
| your side is cold | absence physique | organique |
| she took the dog | détail concret | oui |
| last one to leave | fin de soirée | oui |
| i answered every time | reproche retenu | oui |
| call ended 4:12 | horodatage | oui |
| still your number | téléphone | organique |
| i deleted nothing | téléphone | oui |
| typing, then nothing | téléphone | oui |
| no one noticed | invisibilité | oui |
| everyone left fine | comparaison | oui |
| i peaked already | losercore | oui |
| nothing worked out | losercore | oui |
| not doing great | losercore | oui |
| same room, no one | solitude | oui |
| grew up alone | enfance | oui |
| wrong one stayed | amertume | oui |

Soixante phrases au total, dont cinquante utilisables en publicité. Les trente-six autres
sont dans `contenu/encre.mjs`, avec leur rôle et leur usage publicitaire : *she blocked me*,
*i kept the receipts*, *left the light on*, *nobody clapped*, *ate alone again*, *still in my
room*, *the dog forgot me*, *seen, no reply*, *everyone knew but me*, *i unpacked nothing*.

Le détail concret bat toujours l'émotion nommée : « she took the dog » fonctionne, « i am
sad » ne fonctionne pas.

## 4 bis. Les formats et les taches de sang

Un même visuel ne sert pas un t-shirt et un bandana. Les deux moteurs sortent donc le même
dessin dans cinq formats, avec une seule option :

| Format | Rapport | Pour quoi |
|---|---|---|
| `affiche` | 4:5 | l'imprimé de poitrine, c'est le défaut |
| `carre` | 1:1 | bandana, sticker, sac, bonnet |
| `poster` | 2:3 | l'affiche vendue après la pièce |
| `bande` | 3:1 | sangle, casquette, bandeau |
| `--sur 0.78` | | resserre le dessin sur les objets qui s'enroulent |

Les taches de sang sont dosées, pas semées. Une à trois par pièce, et rien du tout dans un
tiers des cas. Elles évitent la bande de texte, sinon la phrase devient illisible. Une
première série en avait mis partout et c'était le défaut principal.

Deux réglages appris à la fabrication : un noyau de tache trop petit lit comme un losange
rouge, il lui faut du volume ; et sur un objet qui s'enroule, une phrase qui touche le bord
arrive coupée, d'où `--sur`.

## 5. La gamme concrète proposée

Sept références au lancement, ce qui suffit à remplir une boutique sans diluer l'attention.

| Réf. | Étage | Modèle | Visuel | Coût |
|---|---|---|---|---|
| 1 | A | Sweat capuche imprimé intégral (388) | récit ou phrase, **1 exemplaire numéroté** | 38,95 € |
| 2 | A | Sweat col rond imprimé intégral (320) | récit ou phrase, **1 exemplaire numéroté** | 31,03 € |
| 3 | B | T-shirt lourd teinté en pièce (586) | phrase seule, série ouverte | 13,09 € |
| 4 | B | Sweat capuche coton (146) | phrase seule, série ouverte | 19,05 € |
| 5 | C | Bandana imprimé intégral (630) | pochoir dégoulinant | 8,77 € |
| 6 | C | Poster satiné (171) | le visuel d'une pièce vendue, décliné en affiche | 7,49 € |
| 7 | C | Sticker découpé (358) | signature dead2me | 2,14 € |

La référence 6 est la trouvaille de cette gamme : **quand une pièce unique est vendue, son
visuel ne peut plus être porté par personne, mais il peut encore être accroché au mur.** On
vend le vêtement une fois et l'affiche indéfiniment. Ça donne une deuxième vie à chaque motif
sans casser la promesse d'unicité, et le poster est la référence la plus rentable de la gamme
en pourcentage.

## 6. Du visuel au produit, la chaîne complète

Elle tourne, cinq photos produit sont dans `contenu/planche-produits.html`.

```
cd contenu
node serie.mjs --seul 017 --taille 3600 --sansFond --palette sombre --vers brut
node ../outils/maquettes.mjs --source impr-tee --sortie photos-tee      --suffixe .png --produit 586 --variante 15116
```

Quatre choses apprises en la montant, à ne pas refaire :

- **Un imprimé placé ne doit avoir aucun fond.** Un rectangle imprimé sur un vêtement noir
  lit comme une pièce rapportée cousue dessus. D'où `--sansFond`, qui rend un fichier
  transparent à encre claire. C'est l'inverse de l'impression intégrale, où le tissu de base
  est blanc et où il faut au contraire imprimer le fond.
- **Le fichier doit être recadré sur le dessin.** Cadré comme une affiche, il arrive avec ses
  marges et Printful pose un dessin minuscule au milieu d'un grand vêtement.
- **La position doit respecter le rapport de forme du fichier**, sinon Printful l'étire pour
  remplir le rectangle demandé.
- **Un dessin large et court doit être descendu sur la poitrine**, sinon il se colle au col.

Les variantes noires en UE : t-shirt 1717 taille L = 15116, sweat 18500 taille L = 5532.

Printful bloque le générateur de maquettes après deux tâches et indique le délai à attendre :
le script le lit et repatiente au lieu d'abandonner.

## 6 bis. Les clips TikTok

`contenu/clips.mjs`, douze clips dans `contenu/planche-clips.html`.

Ce que font les trois comptes de l'audit : une phrase d'accroche en texte plein écran, le
vêtement montré lentement, une carte de fin sur la rareté. Pas de voix, pas de visage, pas de
démonstration. C'est le texte qui raconte et le produit qui prouve. Nos clips reprennent
exactement cette structure, en 1080x1920, environ sept secondes et demie.

Trois décisions, et elles comptent :

- **Les fichiers sont muets, volontairement.** Le son qui donne la portée sur TikTok est le son
  tendance, et il doit être ajouté **dans l'application** : c'est ce qui rattache la vidéo au
  son et lui ouvre la page Pour toi. Coller une musique ici la couperait de tout ça, et nous
  exposerait sur les droits.
- **Aucune allusion à une fabrication artisanale.** Nos pièces sont imprimées. Les accroches
  parlent du **tirage**, jamais du geste. Écrire « peint à la main » serait faux.
- **Les accroches qui engagent sont marquées.** « no restock », « one printed », « not printing
  it again » sont des promesses. Ne les utiliser que si la promesse est tenue : sinon c'est une
  publicité trompeuse au sens de l'article L121-2, et c'est aussi le genre de mensonge que la
  niche repère en une semaine.

## 7. Ce qui reste à décider

- Les prix, une fois la gamme arrêtée. La bande du créneau est de 32 à 69 €, l'audit
  recommande une entrée à 69 € sur l'étage B.
- Le nombre de pièces uniques par semaine, qui détermine le rythme des vidéos.
- L'achat de la silhouette de femme qui s'éloigne, 10 à 30 € en licence étendue, seul point
  bloquant du moteur 2.
