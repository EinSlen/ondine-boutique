# Faire baisser le prix payé par le client

Mesures du 21 août 2026. Ce document corrige les prix de `PLAN.md` et de `PUB.md`, qui
retenaient les hypothèses les plus défavorables. Script : `mesures/cout-client.mjs`.

## Réponse courte

Le client peut payer **99 € au lieu de 129 €** pour le même sweat all-over print, avec une
marge nette **supérieure** à celle du plan initial. Et sur la base la moins chère fabricable en
Europe, un sweat imprimé descend jusqu'à **59 €** et un tee jusqu'à **29 €**. Les planchers
mesurés produit par produit sont en fin de document, avec la structure de prix recommandée.

Le prix de 129 à 159 € ne venait pas du coût du produit, il venait de trois hypothèses
prudentes empilées : TVA à 20 % dès le premier euro, aucune remise fournisseur, et société à
l'impôt sur les sociétés. Les trois sont corrigeables, et deux le sont gratuitement.

## Correction du 21 août, taux de change réel

L'API Printful publie ses prix en dollars. Je les avais convertis à 0,925, le taux réel du
jour est **0,856037** (source `api.frankfurter.dev`, 21/08/2026). **Mes coûts étaient donc
surestimés d'environ 8 %.** Les coûts rendus réels, port compris :

| Produit | Base | Port | Rendu sans remise | Remise 20 % | Remise 33 % |
|---|---|---|---|---|---|
| Tee Gildan imprimé | 6,42 € | 4,79 € | 11,21 € | **9,93 €** | 9,09 € |
| Tee heavyweight imprimé | 13,09 € | 4,79 € | 17,88 € | **15,26 €** | 13,56 € |
| Bonnet AOP | 13,27 € | 4,79 € | 18,06 € | **15,41 €** | 13,68 € |
| Sweat Gildan imprimé | 19,05 € | 7,00 € | 26,05 € | **22,24 €** | 19,76 € |
| Sweat col rond AOP | 31,03 € | 7,00 € | 38,03 € | **31,82 €** | 27,79 € |
| Sweat à capuche AOP | 38,95 € | 7,00 € | 45,95 € | **38,16 €** | 33,10 € |

Les tableaux plus bas dans ce document retiennent l'ancien taux, ils sont donc **prudents de
2 à 3 € par pièce**. Aucune conclusion ne change, elles s'améliorent toutes. Les chiffres
définitifs, publicité comprise, sont dans `mesures/rentabilite.mjs` et dans `PUB.md`.

Trois réserves honnêtes sur ces coûts :

- La remise **Growth est annoncée « jusqu'à 33 % »** sans détail par catégorie. Le modèle
  retient 20 %. La colonne 33 % existe pour voir le meilleur cas.
- Le **port de 4,79 € le premier article et 1,45 € le suivant** vient d'une source tierce,
  la page officielle de Printful renvoie une erreur 403 aux lectures automatiques. Les sweats
  sont majorés à 7 € par prudence.
- Le **prix affiché en euros au moment de payer** peut différer de la conversion, Printful
  facturant dans sa propre devise. À vérifier sur la première commande réelle.

## Les quatre leviers, chiffrés

### 1. La franchise en base de TVA, le plus gros levier

Le seuil est de **85 000 € de chiffre d'affaires annuel** pour la vente de marchandises,
93 500 € en seuil majoré. La réforme qui devait l'abaisser à 25 000 € a été **définitivement
supprimée par la loi du 3 novembre 2025**. En dessous, aucune TVA n'est reversée sur les
ventes, donc les 20 % que le plan retirait du prix restent dans la caisse.

Le complément qui rend ce levier net : **Printful ne facture pas de TVA sur une commande
expédiée en France** quand aucun numéro de TVA n'est fourni. Sa règle est explicite, la TVA
n'est appliquée que si la commande est livrée en Lettonie ou en Espagne, les pays de
fabrication. Pour la France, c'est 0 %.

Gain mesuré : environ **16 € par pièce** sur un sweat à 129 €.

### 2. L'abonnement Printful Growth

24,99 $ par mois, **offert au-delà de 12 000 $ de ventes annuelles**, et il donne jusqu'à
33 % de remise sur les produits. Le modèle retient 20 %, prudemment, faute de pouvoir vérifier
le taux exact sur la base all-over print sans compte. Rentable dès 10 à 15 commandes par mois.

Gain : **8,42 €** sur la base du sweat à capuche AOP, qui passe de 42,09 à 33,67 €.

### 3. La micro-entreprise plutôt que la société

Pas d'impôt sur les sociétés, pas de comptable à 100 € par mois. Les prélèvements sont de
12,3 % du chiffre d'affaires en cotisations, plus 1 % de versement libératoire, soit 13,3 %.
À 99 €, cela fait 13,17 € contre 7,50 € d'IS plus 100 € de comptable mensuel, donc la
micro-entreprise gagne jusqu'à environ 25 ventes par mois, et reste plus simple bien au-delà.

Charges fixes : **65 €/mois** au lieu de 185 €.

### 4. Le guide des tailles

Le taux de retour passe de 5 à 3 %. Printful ne reprend pas un retour pour changement d'avis,
donc chaque retour coûte la pièce entière. Un guide précis et des photos portées sont le seul
levier disponible. Gain : environ **2 €** par pièce, pour un travail fait une fois.

## Où passait l'argent

Sur le sweat à capuche all-over print à 129 € :

| Scénario | Marge nette |
|---|---|
| Plan initial : société, TVA, aucune remise | 42,53 € |
| Micro-entreprise, franchise, Growth, guide des tailles | **64,25 €** |
| Écart | **+21,72 € par pièce** |

Ces 21,72 € sont ce que le client peut ne pas payer.

## Grille à marge confortable

Premier jet, à marge élevée par pièce. La version la moins chère pour le client est plus bas,
dans « la structure recommandée ». Marges nettes calculées en micro-entreprise, franchise en
base, remise Growth de 20 %, guide des tailles en place.

| Produit | Prix client | Coût rendu | Marge nette | ROAS seuil |
|---|---|---|---|---|
| Bonnet AOP | 29 € | 16,26 € | 7,20 € | 4,03 |
| Tote bag AOP | 35 € | 17,18 € | 11,20 € | 3,12 |
| Tee heavyweight imprimé | 49 € | 16,10 € | 23,75 € | 2,06 |
| Tee AOP | 69 € | 23,99 € | 32,26 € | 2,14 |
| **Sweat imprimé classique** | **79 €** | 24,81 € | 39,63 € | **1,99** |
| **Sweat AOP col rond** | **99 €** | 33,82 € | 47,01 € | **2,11** |
| **Sweat AOP à capuche** | **119 €** | 41,17 € | 56,05 € | **2,12** |

Le bonnet et le tote ne tiennent pas seuls en publicité, ils servent de montée en panier après
le clic, où ils ne coûtent aucun coût d'acquisition.

## Deux corrections à mes conclusions précédentes

**Le tee n'est pas un piège.** J'ai écrit qu'un tee à 39 € devenait négatif dès le premier euro
de publicité, et c'était vrai sous TVA sans remise. Avec les leviers, un tee heavyweight
imprimé à **49 € laisse 23,75 € nets et un ROAS seuil de 2,06**, meilleur que le sweat AOP à
129 € du plan initial. C'est même le meilleur produit d'entrée de gamme de la grille.

**Le point d'entrée publicitaire n'est pas 159 €, il est à 79 ou 99 €.** Le ROAS seuil visé
reste le même, sous 2,5, mais les coûts corrigés le font atteindre 30 à 60 € plus bas.

## Le levier qui coupe le coût de moitié, et son prix à payer

Passer de l'all-over print au **grand imprimé DTF sur une base épaisse** fait tomber le coût de
33,67 à 18,31 € par pièce, soit 15 € de moins, et permet un sweat à 79 €. C'est le meilleur
ROAS seuil de toute la grille, 1,99.

Le prix à payer est esthétique, et il est réel : un imprimé posé sur un sweat n'est pas une
pièce peinte intégralement. C'est précisément l'all-over print qui justifiait le
positionnement pièce unique et le prix haut. Arbitrage à faire :

- **sweat imprimé à 79 €** : marché plus large, publicité plus facile, différenciation faible,
- **sweat AOP à 99 ou 119 €** : l'esthétique qui t'a plu, différenciation forte, marge par pièce
  supérieure de 8 à 16 €.

Le plus solide est de tenir les deux : le DTF à 79 € comme porte d'entrée qui reçoit la
publicité, l'AOP à 119 € comme pièce désirable qui porte la marque.

## Le plafond, et ce qu'il implique

La franchise s'arrête à 85 000 € de chiffre d'affaires annuel.

| Prix | Ventes/an avant le seuil | Par mois | Net mensuel au plafond |
|---|---|---|---|
| 89 € | 955 | 79 | 2 504 € |
| 99 € | 858 | 71 | 2 836 € |
| 109 € | 779 | 64 | 3 107 € |
| 129 € | 658 | 54 | 3 523 € |

**Les prix bas plafonnent donc autour de 2 500 à 3 500 € nets par mois.** Ce n'est pas un
défaut du plan, c'est sa phase 1 : vendre moins cher pour construire l'audience, qui est le
vrai goulot.

Au passage du seuil, la TVA s'applique et le même sweat à 99 € ne laisse plus que 23,66 € avec
un ROAS seuil de 4,18, donc invendable en publicité. Deux sorties, à décider à ce moment-là et
pas avant :

- **monter les prix** de 20 à 30 % avec une marque qui a désormais de la valeur, ce que fait
  tout le marché : 129 € en société laisse 51 € nets et un ROAS seuil de 2,51,
- ou **rester sous le seuil** en organique pur, sans publicité, à environ 3 000 € nets par mois.

## L'inconnue lourde, et les prix qui y résistent

Si l'administration qualifie les achats Printful d'acquisitions intracommunautaires au-delà de
10 000 € par an, la TVA est autoliquidée et **non déductible** en franchise en base. Elle
coûterait alors environ 8 € par pièce. C'est une question de comptable, pas de mesure, et c'est
la seule inconnue capable de casser un prix.

Un prix n'est retenu que s'il garde un ROAS seuil sous 2,5 **dans les deux cas** :

| Produit | Prix | Franchise à 0 % | Avec autoliquidation | Verdict |
|---|---|---|---|---|
| Tee heavyweight imprimé | 49 € | 24 €, ROAS 2,06 | 21 €, ROAS 2,39 | **robuste** |
| Tee AOP | 69 € | 32 €, ROAS 2,14 | 27 €, ROAS 2,51 | fragile |
| Sweat imprimé classique | 79 € | 40 €, ROAS 1,99 | 35 €, ROAS 2,28 | **robuste** |
| Sweat AOP col rond | 99 € | 47 €, ROAS 2,11 | 40 €, ROAS 2,46 | **robuste** |
| Sweat AOP à capuche | 119 € | 56 €, ROAS 2,12 | 48 €, ROAS 2,49 | **robuste** |

La grille tient donc, sauf le tee AOP à 69 €, à passer à 75 € ou à réserver à l'organique.

## Ce qui reste à vérifier

- **La classification URSSAF.** Le modèle retient 12,3 %, le taux de la vente de marchandises.
  Si l'activité était classée en prestation de services à 21,2 %, cela coûterait 9 € de plus par
  pièce et toute la grille remonterait de 10 à 15 €. À confirmer au moment de l'immatriculation.
- **Le taux réel de la remise Growth** sur les bases all-over print. Le modèle retient 20 %
  quand Printful annonce jusqu'à 33 %. Si c'est 33 %, il y a encore 5 € par pièce à rendre au
  client.
- **Un fournisseur POD moins cher en Europe.** Printify et Gelato ne publient pas leurs prix
  sans compte, et l'all-over print cousu-coupé en Europe est rare. Printful reste le seul
  vérifié. À réinterroger avec un compte Printify ouvert, c'est gratuit.
- **Le coût du deuxième emplacement d'impression** en DTF, absent de l'API publique. Il
  conditionne le choix entre un grand imprimé dos seul et un imprimé recto verso.

## Les emplacements d'impression, découverte du 21 août

Relevé dans le catalogue Printful, champ `additional_price` par emplacement. C'est le
paramètre qui tranche définitivement entre all-over print et imprimé classique.

**Sur le sweat all-over print recyclé, TOUS les emplacements sont inclus** : devant, dos,
manche gauche, manche droite, poche, capuche, étiquette intérieure et étiquette de col. Rien
n'est facturé en plus, parce que la pièce est imprimée en tissu plat avant d'être cousue.

**Sur les pièces imprimées, seul le devant est inclus.** Le dos coûte **5,95 €**, chaque
manche 5,95 €, l'étiquette extérieure 2,49 €, la broderie 2,95 €.

Conséquence directe sur le catalogue :

| Choix | Coût rendu | Rendu visuel |
|---|---|---|
| Sweat imprimé, devant seul | 22,24 € | un grand imprimé sur le torse |
| Sweat imprimé, devant et dos | **28,19 €** | deux imprimés, toujours sur un sweat vierge |
| Sweat all-over print col rond | 31,82 € | le vêtement entier couvert, coutures comprises |

L'écart entre un imprimé recto verso et un all-over print complet n'est donc que de **3,63 €**.
C'est ce qui règle l'arbitrage : dès qu'on veut deux emplacements, l'all-over print est presque
au même prix et couvre tout. Le sweat imprimé n'a de sens qu'en **devant seul, à 69 €**, comme
porte d'entrée de gamme.

## Le prix le plus bas possible, mesuré base par base

`mesures/prix-plancher.mjs`, sur les 25 produits fabricables en UE, remise Growth appliquée.

Le 79 € du paragraphe précédent venait d'une base premium, le Cotton Heritage M2580 à
25,31 € rendu. Sur la base la moins chère fabricable en Europe, le Gildan 18500, le coût rendu
tombe à 23,46 € et le sweat descend plus bas.

| Produit | Coût rendu | Mini organique | Mini publicité | Publicité utile |
|---|---|---|---|---|
| Tee Gildan 5000 imprimé | 10,34 € | **23 €** | 26 € | 68 € |
| Tee Bella + Canvas 3001 | 13,63 € | 27 € | 34 € | 72 € |
| Tee heavyweight Comfort Colors | 16,10 € | 30 € | 40 € | 75 € |
| Bonnet AOP | 16,26 € | 30 € | 40 € | 76 € |
| Tote AOP | 17,18 € | 32 € | 42 € | 77 € |
| **Sweat Gildan 18500 imprimé** | 23,46 € | **39 €** | **57 €** | 84 € |
| Sweat Cotton Heritage imprimé | 25,31 € | 42 € | 62 € | 87 € |
| Sweat col rond AOP recyclé | 33,82 € | 52 € | 82 € | 97 € |
| Sweat à capuche AOP recyclé | 40,67 € | 60 € | 98 € | 105 € |
| Bomber AOP | 47,14 € | 68 € | 114 € | 113 € |

Les trois colonnes ne disent pas la même chose, et c'est tout le sujet :

- **Mini organique** : le prix en dessous duquel la vente ne rapporte plus rien, quand il n'y a
  aucun coût d'acquisition à payer. C'est le vrai plancher physique.
- **Mini publicité** : le prix en dessous duquel **aucune campagne ne peut atteindre
  l'équilibre**, parce que le ROAS seuil dépasse 2,5. Ce n'est pas un prix rentable, c'est un
  prix où la publicité tourne pour rien.
- **Publicité utile** : le prix qui laisse **25 € par vente après un coût d'acquisition de
  20 €**. C'est le seul prix où la publicité fait gagner de l'argent.

## Le mur, chiffré sur un sweat imprimé

| Prix | Marge nette | ROAS seuil | Verdict |
|---|---|---|---|
| 35 € | 4,92 € | 7,11 | vente presque à perte |
| 45 € | 13,12 € | 3,43 | publicité impossible |
| 55 € | 21,31 € | 2,58 | publicité impossible de peu |
| **59 €** | **24,59 €** | **2,40** | équilibre atteignable |
| 69 € | 32,79 € | 2,10 | confortable |
| 79 € | 40,98 € | 1,93 | très confortable |

En dessous de 39 €, un sweat se vend à perte quoi qu'il arrive. Le coût rendu de 23,46 € et les
13,3 % de cotisations sur le chiffre d'affaires sont des murs, pas des hypothèses.

## Ce qu'un prix bas coûte en volume

Objectif 10 000 € nets par mois :

| Produit et prix | Net par vente | Ventes/mois sans publicité | Ventes/mois avec CPA 20 € |
|---|---|---|---|
| Tee imprimé 29 € | 13,30 € | 757 | impossible |
| Tee heavyweight 39 € | 15,90 € | 633 | impossible |
| Sweat imprimé 49 € | 17,10 € | 589 | impossible |
| Sweat imprimé 84 € | 45,00 € | 224 | 403 |
| Sweat AOP 105 € | 45,00 € | 224 | 403 |
| Sweat AOP 119 € | 56,05 € | 180 | 279 |

**Baisser le prix ne rend pas l'objectif plus facile, il le rend plus dur.** Un prix divisé par
deux ne double pas les ventes, il double le travail de contenu, et l'acquisition est déjà le
seul poste non résolu du plan.

## La structure recommandée, deux prix pour deux rôles

Puisque les prix bas ne survivent qu'en organique et que la publicité n'est utile qu'au-dessus
de 84 €, il faut assumer les deux au lieu de chercher un prix unique.

| Rôle | Produit | Prix | Canal | Net |
|---|---|---|---|---|
| Porte d'entrée | tee Gildan imprimé | **29 €** | organique et montée en panier | 13,30 € |
| Porte d'entrée | bonnet AOP | **35 €** | montée en panier | 13,20 € |
| Cœur de gamme | sweat Gildan imprimé | **59 €** | organique | 24,59 € |
| Moteur publicitaire | sweat col rond AOP | **99 €** | publicité et catalogue | 47,01 € |
| Pièce désirable | sweat à capuche AOP | **119 €** | pièce unique, organique | 56,05 € |

Le client qui vient de l'organique peut donc entrer à 29 € et repartir avec un sweat à 59 €.
Celui qui vient de la publicité voit le sweat AOP à 99 €, le seul prix qui rembourse le clic.
Personne ne paye 119 € sauf s'il veut la pièce unique, et c'est le principe.

## L'arbitrage qui reste à toi

Les deux objectifs se contredisent, et aucun calcul ne les réconcilie :

- **Prix le plus bas possible** : entrée à 29 €, sweat à 59 €, publicité impossible, tout repose
  sur le contenu organique, plafond réaliste 2 000 à 4 000 € nets par mois.
- **Objectif 10 000 € nets** : sweat à 99 € minimum, publicité utilisable, 279 à 400 ventes par
  mois.

La grille ci-dessus tient les deux bouts en même temps, mais si tu veux vraiment que le client
paye le moins possible, il faut accepter de revoir l'objectif mensuel à la baisse.
