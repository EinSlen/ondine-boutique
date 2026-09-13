# Marque de pièce unique, chaîne zéro manipulation

Mesures du 21 août 2026. Elles remplacent le plan niveau laser, elles ne le complètent pas.

## 1. Verdict

Le modèle live2die est le premier, sur les ~160 familles mesurées depuis le 5 août, qui
casse les trois murs du e-commerce France. Une pièce unique n'a pas de prix plancher
Google Shopping, pas d'enseigne physique en face, pas de marque chinoise sur Amazon.
Le prix n'est plus fixé par la concurrence, il est fixé par la narration.

Mais son exécution est artisanale et ne tient pas tes contraintes. La version qui les
tient est mesurée ci-dessous. Un seul point d'entrée fonctionne : le **sweat all-over
print recyclé**, vendu 99 € col rond ou 119 € à capuche après optimisation des coûts
(`COUTS.md`), 129 € dans les hypothèses prudentes de la section 6.

## 2. Ce que fait live2die, mesuré

Boutique Shopify `i9uvcy-pp.myshopify.com` sur live2die.us, 46 produits publiés en
8 mois, 81 variantes dont 56 épuisées.

| Mesure | Valeur |
|---|---|
| Panier moyen | 50 $ (médiane 45 $, de 5 à 555 $) |
| CA proxy cumulé | 2 823 $ |
| Meilleur mois | 918 $ (juillet 2026) |
| Moyenne | environ 400 $/mois |
| Compte TikTok principal | banni à 30 000 abonnés |
| Compte de repli @llive2diie | 2 345 abonnés, 20 vidéos, 218 000 likes |
| Comparables | @rawsoult 5 113 abonnés / 752 k likes, @242.g_ 24 800 / 4 M likes |

Les descriptions sont explicites : « 1 of 1 hand painted by me », « took me 3 - 4 days
to make with all the painting and spikes », « I have no life other than making clothes ».
Le plafond de ce modèle est la paire de mains du fondateur, et il est atteint à 400 $/mois.

Le catalogue contient « bullet holes », « headshot », « AK 2 the skull », 8 mentions de
sang, 5 de Kurt (Cobain). C'est ce qui explique le bannissement, et c'est non
reproductible : aucune régie Meta ou TikTok ne validera une publicité là-dessus.

## 3. La contradiction à lever

Tu as choisi les séries peintes sous-traitées, puis demandé une chaîne branchée sur
Shopify sans manipulation. Les deux ne coexistent pas : aucun atelier de peintres ne
s'intègre à Shopify, et un prestataire français facture 15 à 25 € l'heure, soit 25 à 35 €
sur une pièce d'une heure et demie, ce qui mange toute la marge d'un sweat à 69 €.

Ce qui lève la contradiction : l'**all-over print**, technique `CUT-SEW`. Le motif est
imprimé sur le tissu **avant la couture**, pas posé en écusson sur un sweat blanc. C'est la
seule technique POD qui reproduit visuellement une pièce peinte intégralement, taches,
coulures, camo, éclaboussures comprises. La matière première du motif peut être une
peinture réelle scannée. Le vêtement, lui, est cousu et expédié sans que tu y touches.

## 4. La chaîne, vérifiée

- Application **Printful sur Shopify**, officielle, gratuite à l'installation, 4,8/5 sur
  3 769 avis. Facturation uniquement à la commande vendue.
- Impression, couture, emballage et expédition au client final automatiques, sans action
  du marchand.
- Fabrication européenne : **Lettonie et Espagne**, pas les États-Unis. Vérifié produit par
  produit, c'est un critère éliminatoire, voir section 5.
- Livraison UE mesurée : **4,79 € le premier article textile, 1,45 € par article suivant**.
- Zéro stock, zéro trésorerie immobilisée. À comparer aux **25 000 €** de trésorerie
  permanente qu'exigeait le plan niveau laser en FBA.
- Les visuels produit sortent du générateur de maquettes Printful. Ils représentent la
  pièce réellement expédiée, donc ils sont utilisables légalement. Les 220 € de studio
  photo du plan précédent disparaissent.

## 5. Catalogue réellement fabricable en Europe

Mesuré sur les 532 produits du catalogue Printful, 218 candidats textile, **25 seulement
sont fabricables en UE** (`mesures/pod-eu.mjs`, sortie `pod-eu.json`).

Piège majeur : le **All-Over Print Oversized Cotton Hoodie** (57 $) et le **All-Over Print
Unisex Cotton Hoodie** (47,49 $), les deux coupes les plus proches de l'esthétique visée,
sont **disponibles aux États-Unis uniquement**. Les vendre en France veut dire port
transatlantique et délai de deux semaines. Éliminés.

Bases all-over print disponibles en UE :

| Prix de base | Produit |
|---|---|
| 14,34 € | Bonnet AOP |
| 15,49 € | Tote bag AOP |
| 21,97 € | Crop tee AOP, sac bandoulière AOP |
| 24,00 € | T-shirt AOP homme |
| 33,53 € | Sweat col rond recyclé AOP |
| **42,09 €** | **Sweat à capuche recyclé AOP** |
| 50,18 € | Bomber AOP |
| 52,96 € | Sweat zippé recyclé AOP |
| 64,70 € | Veste de survêtement recyclée AOP |

Bases à impression classique en UE, pour mémoire : Gildan 5000 à 6,94 €, Bella + Canvas
3001 à 11,05 €, Comfort Colors 1717 à 14,14 €, sweat Gildan 18500 à 20,58 €, sweat Cotton
Heritage M2580 à 22,89 €.

## 6. P&L mesuré

**Ces prix ont été révisés à la baisse.** Cette section retient la TVA dès le premier euro,
aucune remise fournisseur et une société à l'IS, soit les trois hypothèses les plus
défavorables. Corrigées, elles rendent 21,72 € par pièce et le sweat se vend 99 € au lieu de
129 €. La grille retenue est dans `COUTS.md`, la structure publicitaire dans `PUB.md`.

`mesures/pnl-marque.mjs`. Calculs en HT, TVA 20 % retirée du prix TTC, frais de paiement
Shopify 1,8 % + 0,25 €, éco-contribution Refashion, 5 % de retours perdus en entier
(Printful ne reprend pas un retour pour changement d'avis), charges fixes 184,50 €/mois.

Sans publicité, modèle organique de live2die :

| Prix TTC | Marge nette | Pièces/mois pour 10 000 € nets |
|---|---|---|
| Tee 39 € | 10,98 € | 928 |
| Sweat classique 69 € | 23,76 € | 429 |
| **Sweat AOP 129 €** | **50,03 €** | **204** |
| Sweat AOP 159 € | 73,27 € | 139 |
| Tote AOP 49 € | 17,38 € | 587 |

Avec 15 € de coût d'acquisition :

| Prix TTC | Marge nette | Pièces/mois pour 10 000 € nets |
|---|---|---|
| Tee 39 € | **moins 4,02 €** | jamais rentable |
| Sweat classique 69 € | 8,76 € | 1 163 |
| **Sweat AOP 129 €** | **35,03 €** | **291** |
| Sweat AOP 159 € | 58,27 € | 175 |
| Tote AOP 49 € | 2,38 € | 4 281 |

**Le t-shirt à 39 € est un piège.** Il paraît accessible, il ne survit pas au premier euro
de publicité. Le sweat classique à 69 € non plus vraiment : 1 163 pièces par mois est hors
d'atteinte. Le seul point d'entrée qui laisse respirer la publicité est le sweat all-over
print à 129 €, et il reste positif même si le coût d'acquisition double.

Le prix de 129 € est validé par le marché français, pas supposé. Catalogues relevés le
21/08 : **Brut Clothing** (Paris, rework upcyclé, pièce unique) vend ses sweats à une
médiane de **205 €** sur 27 références et ses tees à 85 € sur 62 références. **Avnier** est
à 65 € le sweat, **Sixth June** à 70 €. La pièce unique se paie déjà deux à trois fois le
prix d'un sweat de marque anonyme.

Après IS, 10 000 € de bénéfice mensuel laissent **7 854 €/mois** nets (15 % jusqu'à
42 500 €, 25 % au-delà).

## 7. La pièce unique en POD, sans mensonge

Techniquement : un motif par pièce, inventaire Shopify réglé à 1, numérotation dans le
titre. Chaque motif n'est utilisé qu'une fois et est retiré ensuite. La rareté est réelle,
pas décorative, et un client peut la vérifier.

Ce que tu peux écrire : pièce unique, motif original, numérotée, tirage à un exemplaire,
imprimée et cousue en Europe, coton recyclé sur la gamme AOP.

Ce que tu ne peux pas écrire : « peint à la main », « fait main », « peint par moi ».
C'est une allégation fausse sur une caractéristique essentielle du produit, donc une
pratique commerciale trompeuse au sens de l'article L121-2 du code de la consommation.
La même règle interdit d'inventer des avis clients.
## 8. Ce que ce plan ne résout pas

L'acquisition. À 129 €, il faut 204 ventes par mois en organique ou 291 avec de la
publicité. Ni l'un ni l'autre ne s'achète : live2die fait 8 ventes par mois avec 218 000
likes. Le levier n'est pas le produit, c'est le volume de contenu.

Le format qui a produit ces 218 000 likes est du texte en surimpression sur image, tags
`#pov #relationships #feelings`, sans visage à l'écran. Cette moitié est compatible avec ta
contrainte de ne pas filmer. La moitié « mains qui peignent » ne l'est pas, et c'est celle
qui porte l'attente sur ce genre de compte.

C'est le seul poste du plan qui reste non mesuré, et c'est celui qui décide.

## 9. Ordre d'exécution

1. Choisir un nom et vérifier le domaine. Le nom porte la narration, il vaut plus que le
   produit ici.
2. Micro-entreprise au guichet unique INPI, pas de SASU tout de suite. Le POD ne demande
   aucun capital, donc rien ne justifie des statuts et 100 €/mois de comptable avant la
   première vente. Bascule en SASU quand le CA mensuel dépasse 8 000 €.
3. Shopify Basic, installation de l'application Printful, un seul produit publié.
4. Produire 20 motifs, publier 20 pièces uniques à 129 €, aucune publicité.
5. Publier du contenu quotidien pendant 30 jours sur le format texte sur image.
6. Décider au trentième jour sur les chiffres de la section 10.

Étapes 1 à 4 : environ 3 h. Étape 5 : 30 min par jour, et c'est la seule qui ne se délègue
pas.

## 10. Seuils d'arrêt

- Moins de 30 000 vues cumulées après 30 publications : le format ne prend pas. Changer
  d'angle narratif, pas de produit.
- Moins de 3 ventes sur les 30 premiers jours au-delà de 50 000 vues organiques : le prix
  ou la page produit bloquent, pas l'audience.
- Coût d'acquisition mesuré au-dessus de 45 € en publicité : le modèle ne passe pas à
  l'échelle payante. Rester en organique pur et revoir l'objectif à la baisse.
- Un compte banni sans reprise de croissance en 30 jours sur un compte neuf : l'actif
  d'audience n'est pas reconstructible, arrêter.

## 11. Ce qui reste à vérifier avant d'engager

- Franchise en base de TVA : le seuil applicable en 2026 a été remanié. Le P&L ci-dessus
  retient la TVA à 20 % dès le premier euro, donc l'hypothèse est la plus défavorable et
  les chiffres tiennent dans les deux cas.
- Adhésion Refashion, la REP textile. Obligatoire dès la première mise sur le marché
  français, y compris en POD depuis la Lettonie, puisque c'est toi qui vends au
  consommateur français. Coût unitaire négligeable, l'adhésion est une formalité.
- Prix exact du deuxième emplacement d'impression et de la broderie, non couverts par
  l'API publique.
- Délai réel de fabrication AOP en Lettonie, absent du catalogue public.
