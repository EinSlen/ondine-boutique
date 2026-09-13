# Boutique Ondine, fontaine à eau pour chat

## Verdict du 6 août 2026 : ne pas lancer ce produit en dropshipping

Les deux inconnues du plan ont été mesurées le 6 août. Elles le referment toutes les deux.
Le détail chiffré est en section 6 (coût fournisseur) et en section 8 (marché). En résumé :

- Coût rendu réel depuis un entrepôt UE : **22,90 €**, alors que le plan supposait 10 €
  et s'était fixé 18 € comme seuil de coupure.
- Prix plancher français constaté sur Google Shopping : **19,95 € chez Electro Depot,
  21,24 € chez Zooplus, 23,14 € sur Amazon**, livraison gratuite. Le coût d'achat est
  donc supérieur au prix de vente de trois concurrents.
- Mur concurrentiel de 5 à 11 enseignes, dont toutes les animaleries : Maxi Zoo,
  Animalis, Zooplus, Truffaut, Zoomalia.
- Le réachat de filtres, seul levier économique du modèle, est couvert par 5 à 6
  enseignes entre 11 et 13 €, avec des cartouches génériques non propriétaires.
- Un concurrent mono-produit français, MonChatBoit.fr, occupe le créneau depuis
  avril 2026 et dispose du panneau de marque Google.

Ce qui reste utile ici : les scrapers de mesure, le moteur photos vers clips, et
`provision.mjs`, tous réutilisables tels quels sur un autre produit. La matière
rédactionnelle de `content.mjs` est spécifique à la fontaine.

Le reste du document décrit le plan d'origine, conservé pour la méthode et pour les
mesures. Ne l'exécute pas en l'état.

---

Tout ce qui se construit sans compte est fait. Ce qui reste demande tes identifiants ou ton SIRET.

## Contenu

| Fichier | Rôle | État |
|---|---|---|
| `content.mjs` | Fiche produit, pack, filtres, 4 pages légales, emails, macros SAV | écrit, 5 placeholders à remplir |
| `provision.mjs` | Crée les produits et les pages via l'Admin GraphQL API, idempotent | testé en `--dry` |
| `stills-to-video.mjs` | Photos fournisseur vers clips verticaux animés | testé, 3 clips encodés |
| `.gitignore` | Protège `.env` et les médias | en place |

## Ce que tu dois faire, dans cet ordre

### 1. Immatriculation (à lancer aujourd'hui, 1 à 3 semaines)

Guichet unique INPI, gratuit. Bloque Shopify Payments, donc c'est le chemin critique.
Régime : micro-entreprise, vente de marchandises. Plafond 203 100 € sur 2026-2028,
franchise de TVA jusqu'à 85 000 €.

### 2. Remplir les 5 placeholders de `content.mjs`

`__RAISON_SOCIALE__`, `__SIRET__`, `__ADRESSE_COMPLETE__`, `__DOMAINE__`,
`__MEDIATEUR_A_DESIGNER__`

`provision.mjs` **refuse d'écrire** tant qu'il en reste un. Publier des CGV ou des
mentions légales à trous t'expose à une sanction DGCCRF, et le dropshipping est
l'activité e-commerce la plus contrôlée depuis l'enquête de 2022.

Pour le médiateur : adhésion à un médiateur de la consommation agréé, obligatoire,
compter 30 à 100 € par an.

### 3. Compte Shopify et token

Essai sur shopify.com. Pas besoin du SIRET pour construire, seulement pour activer
Shopify Payments à la fin.

Token : Paramètres, Applications et canaux de vente, Développer des applications,
Créer une application, Configuration Admin API. Cocher `write_products`,
`write_content`, `write_files`, `write_publications`, `read_orders`. Installer,
puis révéler le token.

Créer `.env` à côté des scripts :

```
SHOPIFY_STORE=tonnom.myshopify.com
SHOPIFY_TOKEN=shpat_...
```

Le `.gitignore` l'exclut déjà. Ne colle jamais ce token dans une conversation :
il donne un accès complet en écriture à la boutique.

### 4. Provisionner

```
node provision.mjs --dry     # contrôle, n'écrit rien
node provision.mjs           # applique
```

Les produits sont créés **en brouillon**. Relis-les dans l'admin avant de publier.

### 5. Les 4 choses qui restent au clic

L'API ne les couvre pas proprement.

1. Menu de pied de page : ajouter les 4 pages légales
2. Shopify Payments : activer, demande le SIRET
3. Bandeau cookies : activer le consentement client
4. DSers : installer, mapper le fournisseur sur `ONDINE-FONT-01` et `ONDINE-PACK-01`

### 6. Fournisseur : mesuré le 6 août 2026, l'hypothèse à 10 € est fausse

Mesure faite sur 16 requêtes AliExpress et 12 fiches produit ouvertes une à une
(`recherche/ali-cost.mjs`, `recherche/ali-item.mjs`, résultats dans `ali.json`,
`ali2.json`, `ali-detail.json`, captures dans `shots/` et `shots-item/`).

Le prix d'une carte de résultats ne vaut rien : quand elle porte une mention
`(1,24€/pc)`, c'est un lot ou une variante accessoire, pas la fontaine. Seule la fiche
produit tranche. Coûts rendus réels, livraison comprise :

| Source | Coût rendu | Délai | Remarque |
|---|---|---|---|
| Entrepôt France, 2,2 L, 4 filtres | 17,28 € | 2 à 6 j | prix Local Day expirant le 7/08, stock 1 |
| Entrepôt France, même fiche hors promo | **22,90 €** | 2 à 6 j | le chiffre réaliste en volume |
| Entrepôt Allemagne, inox 2,2 L | 25,79 € | 3 à 8 j | 4,8/5, retour gratuit 90 j |
| Chine Choice, 1,2 L | 11,59 € | 8 à 15 j | 4,9/5 sur 1066 avis, mais 1,2 L |

**Le seuil de coupure que ce plan s'était fixé, 18 €, est franchi par toutes les options
à entrepôt européen.** Résultat net par vente à 34,90 €, coût publicitaire déduit :

| Source | ROAS 2,0 (compte neuf) | ROAS 4,2 (moyenne France) |
|---|---|---|
| France hors promo 22,90 € | -6,19 € | +2,95 € |
| Allemagne 25,79 € | -9,08 € | +0,06 € |
| Chine 11,59 € | +5,12 € | +14,26 € |

L'entrepôt UE n'est rentable que si la publicité atteint la moyenne du marché dès la
première campagne, ce qui n'arrive pas sur un pixel neuf. L'arbitrage est donc frontal :
marge ou délai, pas les deux.

**Le seul chiffre du plan qui tient est le réachat.** Lot de 12 filtres mesuré à 4,00 €
rendu, soit 1,00 € les trois, exactement l'hypothèse d'origine. Revendus 9,90 €, cela
fait 8,51 € de marge par recharge, sans coût d'acquisition. Une seule recharge rattrape
une acquisition à perte, même dans le scénario allemand.

Réserve honnête sur ce point : ces filtres sont génériques, pas propriétaires. Un client
qui compare les retrouve à 8 € les douze ailleurs. Le réachat ne tiendra que par le
confort et l'automatisme, pas par le verrouillage technique.

### 7. Les clips

Récupérer 5 à 10 photos produit sur la fiche du fournisseur, les déposer dans
`photos/`. Elles sont propres et sans watermark, contrairement à ses vidéos.

```
node stills-to-video.mjs --plan      # ce qui serait produit
node stills-to-video.mjs             # 8 clips, un par accroche
```

Sortie dans `out-stills/`, avec un `manifest.json` qui note l'accroche et les photos
de chaque clip. Quand une variante décolle, tu sais laquelle et pourquoi.

Pour du son, déposer des mp3 dans `audio/`. Sans audio les clips sont muets et tu
ajoutes la musique directement dans TikTok, ce qui est souvent préférable pour l'algorithme.

## Ce que ces outils ne font pas

Ils ne produisent pas de vidéo d'un vrai chat buvant à ta fontaine. Un générateur
vidéo IA sortirait une fontaine générique, donc différente de celle que tu expédies :
c'est un tueur de conversion et, en France, de la publicité trompeuse.

Si tu veux ce plan-là, il faut acheter des clips. Le produit ne demandant aucune
parole, ils s'achètent à l'international entre 20 et 50 $ pièce au lieu de 250 € en
France, et le texte français est ajouté par-dessus.

## Séquence de lancement

1. Photos vers clips, publication organique deux à trois semaines, budget zéro
2. Repérer l'accroche qui prend, dans le `manifest.json`
3. Mettre du budget **uniquement** derrière celle-là

La publicité amplifie un signal, elle n'en crée pas. Découvrir son angle avec du
budget publicitaire coûte dix fois plus cher que le découvrir gratuitement.

## Seuils de coupure

- 30 variantes publiées, aucune au-dessus de 5 000 vues : pas un euro de publicité
- 300 € dépensés, CPA au-dessus de 28 € sur le pack : coupure immédiate
- CPC au-dessus de 1 € après 5 créas : le problème est l'accroche, retour à l'organique
- Taux de retour au-dessus de 8 % : changer de fournisseur
- Aucun réachat de filtres après 50 ventes : revoir l'offre, le modèle reposait dessus

## 8. Marché côté vente, mesuré le 6 août 2026

Cette mesure manquait à l'étude du 5 août : la fontaine avait été retenue sur le volume
Amazon seul, sans passer par le test du mur des enseignes, qui est pourtant l'instrument
qui avait invalidé les onze autres familles.

`node gshop-screen.mjs gshop-fontaine.json gshop-fontaine-res`
`node google-shot.mjs "fontaine a eau pour chat"`

| Requête | Prix médian | Enseignes | Mentions retrait |
|---|---|---|---|
| fontaine a eau pour chat | 23,99 € | 6 | 3 |
| fontaine eau chat silencieuse | 36,66 € | 7 | 3 |
| fontaine a eau chat inox | 31,44 € | 5 | 1 |
| distributeur eau automatique chat | 27,62 € | 11 | 5 |
| filtre fontaine a eau chat | 12,70 € | 5 | 0 |
| cartouche filtre fontaine chat | 11,47 € | 6 | 0 |

Enseignes relevées : Maxi Zoo, Animalis, Zooplus, Truffaut, Zoomalia, Carrefour, Leclerc,
Leroy Merlin, Darty, Gifi.

La capture `goog-fontaine-a-eau-pour-chat-1.png` donne le paysage réel des annonces :
Electro Depot 19,95 €, Zooplus 21,24 €, Amazon 23,14 €, Zoomalia 36,99 €, puis un
segment marque à 51,95 € (French Bandit), 69,00 € (Miaustore) et 69,80 € (Moustache & Cie).

Deux enseignements. Le premier est que le segment 50 à 70 € existe bel et bien, mais il
est tenu par des marques à identité visuelle propre, pas par du produit AliExpress
générique. Le second est qu'entre 20 et 24 € se tiennent trois acteurs à livraison
gratuite immédiate, ce qui rend intenable une offre à 34,90 € livrée en 8 à 15 jours.

## Ce que cette étude apprend pour le prochain produit

L'ordre des critères du 5 août était inversé. Le volume a été mesuré en premier et le mur
des enseignes n'a jamais été appliqué au produit retenu. Protocole corrigé, à appliquer
dans cet ordre et à couper au premier échec :

1. Mur des enseignes sur Google Shopping. Éliminer au-delà de 3 enseignes ou 3 mentions
   de retrait en magasin.
2. Prix plancher réel sur Google Shopping, jamais sur Amazon qui surestime.
3. Coût rendu sur la fiche produit AliExpress, jamais sur la carte de résultats.
4. Ratio prix plancher divisé par coût rendu supérieur ou égal à 3, pour absorber un CPA
   français de 12 à 20 € et laisser une marge.
5. Volume seulement en dernier, sur les survivants.

## 9. Chasse au produit du 6 août 2026, protocole corrigé

`node hunt.mjs hunt-queries.json hunt` puis `node ali-cost.mjs ali-queries3.json ali3`
puis `node ratio.mjs`. 28 nouvelles familles, aucune en commun avec les 12 du 5 août.

`hunt.mjs` remplace `gshop-screen.mjs` pour l'étape 1. L'ancien script comparait la page à
une liste de spécialistes écrite en dur, qui ne couvrait que les niches déjà étudiées :
toute famille nouvelle obtenait un zéro trompeur. Le nouveau lit les marchands réellement
présents sur la page, ce qui rend les deux mesures non comparables. Un mur de 9 ici ne veut
pas dire la même chose qu'un mur de 9 dans `gshop.json`.

Aucune des 28 familles n'a un mur faible : le minimum est 9 marchands. Le discriminant
exploitable reste donc le nombre de mentions de retrait en magasin, comme le 5 août. Huit
familles sortent à zéro retrait avec un prix médian supérieur à 55 €, et ont été passées
à l'étape du coût rendu.

| Produit | Marché FR | Coût rendu médian | Ratio | Net après CPA 16 € |
|---|---|---|---|---|
| Planche de suspension escalade | 79,40 € | 29,79 € | 2,67 | **+32,25 €** |
| Fermenteur bière maison | 170,00 € | 78,39 € | 2,17 | **+72,98 €** |
| Moulin à café manuel | 57,99 € | 43,39 € | 1,34 | -2,46 € |
| Couveuse à œufs | 59,99 € | 74,69 € | 0,80 | -31,79 € |
| Tente hydroponie | 94,99 € | 123,69 € | 0,77 | -46,28 € |

Trois familles ont dû être écartées pour appariement raté, le même piège que la fontaine :
la requête AliExpress ne ramène pas le produit français. « edible ink cake printer » renvoie
des imprimantes thermiques d'étiquettes Phomemo à 2,42 €, « bonsai tool set » des mini-pelles
en plastique pour succulentes, « filament dryer » des boîtes de rangement passives au lieu de
sécheurs chauffants. Les ratios correspondants (jusqu'à 45) sont faux et sont marqués comme
tels dans `ratio.mjs`. **Toujours relire les titres avant de croire un ratio favorable.**

### L'enseignement structurel

Sur la couveuse, la tente d'hydroponie et le moulin à café, **le coût rendu AliExpress à
l'unité dépasse le prix de détail français**. Ces marchés sont déjà servis par des acteurs
qui importent en volume, à un coût qu'un dropshipper à l'unité ne peut pas approcher. C'est
la limite de fond du modèle : il ne gagne que là où la marge de distribution française est
anormalement large, pas simplement là où le produit est cher.

Les deux survivants gardent un mur épais, 15 marchands pour l'escalade (Decathlon,
Snowleader, Alpiniste, Ekosport, Casal Sport) et 13 pour le brassage (Autobrasseur,
Rolling Beers, Polsinelli, browin). Le fermenteur est en outre lourd et encombrant, ce qui
est mauvais pour l'expédition à l'unité. Aucun des deux n'est un feu vert, ce sont des
pistes à instruire.

## 10. Piste escalade instruite le 6 août 2026 : écartée

Produit réel et correct, contrairement à trois des huit candidats. Fiches ouvertes une à une :
hangboard bois massif portable à 26,19 € pour 0,8 kg (excellent pour l'expédition à l'unité),
modèle mural avec visserie à 52,39 €, noté 4,8 sur 32 avis avec un retour français positif,
livré en 7 à 14 jours par Colissimo ou Mondial Relay.

Ce qui l'écarte est la demande. `node amz-screen2.mjs q-escalade.json res-escalade` :

| Requête | Prix médian | Achats au dernier mois | Note |
|---|---|---|---|
| poutre entrainement escalade | 64,99 € | **0** | 4,57 |
| hangboard | 65,99 € | **0** | 4,53 |
| planche suspension escalade doigts | 39,99 € | **0** | 4,42 |
| prises escalade entrainement | 39,99 € | **0** | 4,09 |

Aucune annonce n'affiche le badge d'achats récents sur environ 70 annonces cumulées, quand
la fontaine à eau en affichait 10 000 par mois. Le badge est un plancher et non une mesure,
mais l'écart est trop large pour être un artefact. Le prix réel est par ailleurs de 65 € et
non 79 €, ce qui resserre la marge.

S'y ajoutent deux réserves. Le mur compte 15 marchands dont Decathlon, Snowleader et
Ekosport. Et surtout, **un hangboard porte le poids du corps** : en important un produit
hors UE, tu deviens le producteur au sens de la directive 85/374/CEE et tu portes la
responsabilité du fait des produits défectueux. Une planche qui casse ou une fixation qui
lâche, c'est une chute. Ce risque n'a rien de comparable à celui d'une fontaine qui fuit.

## 11. Protocole, deuxième correction

La demande doit passer **avant** le coût rendu, pas en dernier. L'escalade a été sourcée en
entier, fiches ouvertes et ratios calculés, avant qu'une mesure Amazon de quatre minutes ne
la tue. Ordre définitif, couper au premier échec :

1. Mentions de retrait en magasin sur Google Shopping. Le nombre de marchands n'est pas un
   critère exploitable, tout marché en compte au moins neuf.
2. Prix plancher réel sur Google Shopping, jamais sur Amazon.
3. **Demande, via le badge d'achats mensuels Amazon. Zéro badge sur l'ensemble des
   annonces d'une requête commerciale vaut élimination.**
4. Coût rendu sur la fiche produit AliExpress, avec relecture obligatoire des titres.
5. Ratio prix plancher sur coût rendu supérieur ou égal à 3.
6. Responsabilité produit : écarter ce qui porte un corps, chauffe, ou touche à l'enfance
   et au médical.

## 12. Vague 2 et le troisième mur, 6 août 2026

40 familles supplémentaires (`hunt-queries2.json`), aucune commune avec les précédentes.
Total mesuré à ce jour : environ 68 familles distinctes.

Le protocole corrigé a immédiatement payé. Le **fermenteur à bière**, qui sortait « viable »
en section 9 avec 72,98 € de marge, affiche **zéro achat mensuel sur Amazon** et un prix réel
de 50 € au lieu des 170 € lus sur Google Shopping. Quatre minutes de mesure de demande ont
évité une semaine de sourcing. Idem pour le téléprompteur, le slider caméra, le luxmètre et
la maroquinerie, tous à zéro achat.

Trois candidats sont passés en sourcing :

| Produit | Prix FR | Achats/mois | Coût AliExpress | Verdict |
|---|---|---|---|---|
| Filtre ND variable | 96,99 € | 150 | non mesurable | requête ramène des bagues d'adaptation |
| Station de fer à souder | 60,99 € | 150 | 22,99 € (FNIRSI HS-01) | seul survivant |
| Télémètre laser golf | 81,21 € | 100 | 49,39 € (REVASRI) | **éliminé, voir ci-dessous** |

### Le troisième mur : les marques chinoises vendent déjà sur Amazon.fr

Les deux produits sourcés portent le badge AliExpress « Marque, certifié authentique » et
sont vendus par leur boutique officielle. Vérification faite sur Amazon.fr :

- **REVASRI** y vend son télémètre à **53,59 €**, quand il coûte 49,39 € sur AliExpress.
  Quatre euros d'écart, livraison Prime contre 13 à 20 jours. Sans objet.
- **FNIRSI** y vend le HS-01 à **77,35 €**, pour un coût de 22,99 €. L'écart tient encore.

C'est le mur que l'étude n'avait pas vu, et il est plus récent que les deux autres :
AliExpress n'est plus un canal d'arbitrage sur les produits techniques, parce que les
fabricants ont ouvert leurs propres boutiques européennes. Le dropshipper achète au prix
public du fabricant et revend contre le fabricant lui-même.

**Piège d'outil, corrigé.** `amz-screen2.mjs` annonçait « 0 % de marques » sur ces deux
requêtes : sa liste `BRANDS` ne contenait que des marques occidentales (Philips, Ninja,
Cosori). Exactement la même erreur que la liste de spécialistes de `gshop-screen.mjs`. La
liste inclut désormais les marques chinoises vendant en direct (FNIRSI, REVASRI, Kentfaith,
Ulanzi, Neewer, Creality, Vevor, Rojeco...). **Un « 0 % de marques » issu d'une liste en dur
ne prouve jamais un terrain libre.**

### Seul survivant de 68 familles : station de fer à souder

FNIRSI HS-01, 65/96 W, écran OLED, USB-C, 80 à 420 °C, 0,5 kg, noté 5,0 sur 69 avis avec
464 ventes. Coût 22,99 € livré, 11 à 19 jours.

| | |
|---|---|
| Prix de vente envisageable | 54,90 € (sous les 60,99 € du marché) |
| Coût rendu | 22,99 € |
| Frais Shopify | 1,02 € |
| Marge avant publicité | 30,89 € |
| Net après CPA 16 € | **14,89 €** |

Trois réserves sérieuses. FNIRSI vend le même modèle sur Amazon.fr en Prime, et le produit
est identifiable par marque et référence, donc comparable en dix secondes. Il chauffe à
420 °C, ce qui engage la directive basse tension et la responsabilité du fait des produits
pour un importateur. Et le délai de 11 à 19 jours est le plus long rencontré.

## 13. Le survivant tombe aussi, et pourquoi

En section 12, la station FNIRSI HS-01 semblait tenir : 22,99 € d'achat contre une médiane
Amazon de 77,35 €. Erreur de méthode de ma part, corrigée en lisant les annonces une à une
au lieu de la médiane.

**Le FNIRSI HS-01 est vendu 52,04 € sur Amazon.fr**, en Prime. La médiane de 77,35 € agrégeait
d'autres références : HS-02A à 60,99 €, HS-03 à 75,99 €, et des stations à air chaud 700 W
qui n'ont rien à voir. Les seules annonces affichant des achats réels sont à **39,99 €**
(kit 100 W, 50 achats, noté 4,6) et **50,99 €** (YIHUA 858D, 100 achats).

Le marché se fait donc sous 51 €, pas à 61 €. À 42 € de prix de vente, la marge tombe à
18,17 € avant publicité, soit **2,17 € net** après un CPA de 16 €.

**Règle à retenir : comparer le prix du même modèle, jamais la médiane d'une catégorie.**
Une médiane de catégorie mélange des gammes et gonfle systématiquement l'écart apparent.

Même verdict sur le filtre ND, instruit ensuite avec une requête correcte. Les ventes
AliExpress sont dominées par K&F Concept, à 23,59 et 24,59 €. Or **K&F Concept vend sur
Amazon.fr avec un premier quartile à 29,99 €**, et Neewer occupe 39 % d'une des requêtes.
Cinq euros d'écart contre une livraison Prime : sans objet.

### Bilan sur environ 68 familles

Aucun produit ne passe. Le blocage n'est pas le choix du produit, il est dans le modèle
d'achat : le dropshipping à l'unité paie le prix public du fabricant, pendant que ses
concurrents sont soit des importateurs en volume, soit le fabricant lui-même désormais
présent sur Amazon.fr. Les trois murs se referment dans cet ordre selon le type de produit :
enseignes physiques sur le grand public, détaillants spécialisés sur les niches passion,
marques chinoises en direct sur les produits techniques.

## 14. Vague 3 et test de l'achat groupé, 6 août 2026

40 familles de métiers d'art et de paramédical. Google ayant fini par renvoyer des HTTP 429
en série, l'ordre a été inversé : filtrage par la demande Amazon d'abord, qui n'est pas
rate-limitée. Le protocole le permet, la demande étant le critère le plus discriminant.

### La corrélation qui explique tout

`node correlation.mjs`, sur les 63 familles disposant d'un prix et d'une demande mesurés :

| Tranche de prix | Familles | Demande médiane | Dont demande >= 100/mois |
|---|---|---|---|
| 0 à 25 € | 20 | 250 | 14 |
| 25 à 55 € | 18 | 50 | 8 |
| 55 à 100 € | 16 | 100 | 9 |
| 100 € et plus | 9 | **0** | 1 |

**Prix et demande varient en sens inverse.** Seules 10 familles sur 63, soit 16 %, réunissent
un prix supérieur à 55 € et une demande supérieure à 100 par mois. Sur ces dix, six étaient
déjà éliminées par le mur des marques, et les trois restantes n'ont pas de sourcing
identifiable ou coûtent plus cher à l'achat qu'elles ne se vendent (déshydrateur : 57,39 €
d'achat pour 62,80 € de vente).

### L'achat groupé, seule hypothèse restante, testée sur Alibaba

`node alibaba.mjs` puis `node import-math.mjs`. Les prix Alibaba sont départ usine : il faut
y ajouter le fret, 3,5 % de droits, et **20 % de TVA à l'import qui n'est pas récupérable
sous le régime de la franchise en base**. Les fourchettes affichées sont des paliers de
quantité : le prix bas suppose plusieurs centaines d'unités.

| Produit | Dropshipping | Lot au minimum | Lot en volume | Prix FR | Plancher Amazon |
|---|---|---|---|---|---|
| Filtre ND variable | 24,59 € | 28,08 € | **11,58 €** | 55,00 € | 29,99 € |
| Station fer à souder | 22,99 € | 32,23 € | 27,32 € | 49,00 € | 39,99 € |
| Télémètre golf | 49,39 € | 53,31 € | 48,43 € | 75,00 € | 53,59 € |
| Fontaine à eau chat | 22,90 € | 34,65 € | 12,94 € | 23,99 € | 19,95 € |

Deux enseignements. **Commander au minimum coûte plus cher que le dropshipping** une fois le
fret et la TVA ajoutés : l'avantage n'apparaît qu'à partir de plusieurs centaines d'unités.
Et un seul cas devient franchement viable, le filtre ND en volume : 26,40 € net par vente,
pour une mise de 2 316 € rentabilisée à 88 ventes.

### La limite que l'achat groupé ne franchit pas

Ce calcul suppose une vente à 55 €, la médiane. Or **le vrai plafond est le prix plancher,
29,99 € chez K&F Concept sur Amazon en Prime**. À 29,99 €, le filtre ND en volume ne laisse
que 1,74 € net.

Vendre au-dessus du plancher demande une raison : une marque, un assortiment, un service.
Pas seulement une boutique Shopify. C'est le point où le problème cesse d'être un problème
de sourcing pour devenir un problème de positionnement.

## 15. Vagues 4 et 5 : le B2B casse la corrélation, 6 août 2026

60 familles supplémentaires en B2B, dentaire, vétérinaire, laboratoire, instruments pro et
consommables. Total mesuré : environ 160 familles.

**Le B2B casse la corrélation prix contre demande** établie en section 14. On y trouve enfin
des prix supérieurs à 60 € avec des centaines à des milliers d'achats mensuels : étiqueteuse
industrielle 2 400 par mois, tondeuse vétérinaire 1 900, niveau laser 1 650, balance de
précision 1 300, caméra d'inspection 1 250.

### Deux critères ajoutés au scoring, chacun né d'une erreur évitée

**La saturation** (`score.mjs`) mesure la part d'annonces quasi identiques. Le niveau laser
rotatif sort à 31 % quand tout le reste est entre 0 et 13 % : dix annonces du même produit
générique chinois, de 36,29 € à 79,99 €, prix déjà convergé vers le coût. C'est le quatrième
mur : **l'arbitrage a déjà été fait par d'autres**. Sans cet indice, son plancher apparent de
65,54 € en faisait un bon candidat.

**Le prix du volume** est le prix de l'annonce qui concentre les achats, et il remplace le
plancher comme référence. Sur l'étiqueteuse industrielle, le plancher affichait 69,99 € alors
que 2 000 des achats mensuels portaient sur un DYMO à 25,88 €. Le critère élimine d'un coup
l'étiqueteuse, le testeur d'installation (volume sur un détecteur à 15,88 €), le micromoteur
dentaire et la caméra d'inspection.

### Un cinquième obstacle : quand la certification est le produit

Le testeur d'installation électrique avait le meilleur profil brut : plancher 80,64 €, 700
achats, 1 % de saturation. Son marché est tenu par Peak Tech, Bosch, Fluke, Stanley. Sur un
instrument de sécurité soumis à la norme VDE, la certification **est** le produit : aucun
électricien n'achète un générique non certifié. Même logique sur le dentaire et le médical.

### Les deux seuls candidats qui survivent à tout

| | Sécheur de toilettage | Manomètre frigoriste |
|---|---|---|
| Prix plancher | 79,00 € | 67,00 € |
| Prix du volume | **79,99 €** | 46,99 € |
| Demande | 300/mois | 100/mois |
| Marques | 22 % (faibles) | 0 % |
| Saturation | 7 % | 1 % |
| Coût Alibaba en volume | 25,00 € (MOQ 5) | 6,00 € (MOQ 100) |
| Coût rendu | 40,36 € (maritime) | 10,25 € (maritime) |
| **Net par vente** | **22,26 €** | **19,83 €** |
| Mise pour un premier lot | 1 211 € (30 u, 150 kg) | 1 025 € (100 u) |
| Rentable à | 99 ventes | 52 ventes |

Le sécheur est le seul de toute l'étude dont **le prix du volume confirme le plancher**
(79,99 € contre 79,00 €) : le marché n'est pas cassé par un produit d'appel bas de gamme.
Son poids de 5 kg impose le fret maritime, ce qui impose le stock, ce qui règle au passage
le délai de livraison client, ramené à 48 h depuis la France.

Réserves à connaître : les deux sont des appareils électriques ou sous pression, donc la
directive basse tension et la responsabilité du fait des produits s'appliquent. Le manomètre
a un marché de 100 achats mensuels seulement, et CCLIFE, BACOENG, MRCARTOOL et Elitech y
vendent déjà en direct.

## 16. Refonte sur l'objectif 10 000 EUR par mois, 6 août 2026

Nouveau critère, qui invalide tout ce qui précède : le produit doit porter **10 000 EUR de
marge nette mensuelle**, extensible vers 100 000. Toutes les étapes antérieures validaient une
marge unitaire, aucune ne demandait si le marché pouvait porter ce revenu.

`node objectif-10k.mjs` teste les 73 familles ayant une demande mesurée, en supposant le
meilleur coût d'achat observé de toute l'étude (25 % du prix de vente) :

| Marge unitaire | Demande mensuelle requise (10 % de part) |
|---|---|
| 25 € | 4 000 |
| 40 € | 2 500 |
| 60 € | 1 667 |
| 100 € | 1 000 |

**Les deux candidats de la section 15 sont mathématiquement hors cible.** Le sécheur de
toilettage demanderait 450 ventes par mois sur un marché de 300, soit 150 % du marché. Le
manomètre frigoriste, 505 %. Une seule famille sur 73 franchit la barre.

### La tenaille

Les cinq premières vagues chassaient des niches de 100 à 500 achats mensuels. La vague 6 a
mesuré 30 marchés de masse : vidéoprojecteur 5 650 par mois, aspirateur balai 6 700, caméra
de surveillance 15 600. Le sourcing les tue autrement. **L'aspirateur balai coûte 88,39 € sur
AliExpress pour un marché à 79,99 €**, et le vidéoprojecteur laisse 6 € une fois le fret et la
TVA payés.

Formulé simplement : **les niches ont la marge sans le volume, les marchés de masse ont le
volume avec des prix déjà comprimés au coût.** Un seul produit sur environ 190 familles
échappe aux deux.

## 17. Le seul candidat à 10 000 EUR : la gamme laser de chantier

Niveau laser vert 4x360 degrés, 16 lignes, autonivelant avec trépied. Le produit était sorti
en section 15 avec 31 % de saturation, que j'avais lu comme un défaut. C'est une lecture
fausse : **dix vendeurs sur le même produit prouvent que le marché fonctionne**. Le seul test
qui compte est de savoir s'il reste de la marge, et il en reste.

| | |
|---|---|
| Prix du volume Amazon FR | 79,99 € (500 achats/mois sur cette seule annonce) |
| Marché mesuré | ~2 500/mois sur 7 requêtes recoupées |
| Coût Alibaba, même spécification | 11,37 € |
| Coût rendu, maritime en volume | **17,47 €** |
| Marge nette à CPA 25 € | **36,15 €** |
| Mise de départ, 50 unités | 873 € |
| Rentabilité | 25 ventes |

`node business-case.mjs` : 10 000 EUR par mois demandent 277 ventes mensuelles, soit 17 % du
marché mesuré. Le concurrent principal en réalise déjà 500 à lui seul.

### La gamme, et pourquoi elle change les chiffres

Le CPA se paie une fois par client, pas par article. Un accessoire vendu dans le même panier
ne coûte rien à acquérir. `node plan-laser.mjs` :

| Référence | Prix | Coût rendu | Marge | Ventes/mois | EUR/mois |
|---|---|---|---|---|---|
| Niveau laser 4x360 (produit d'appel) | 79,99 € | 17,47 € | 36,15 € | 375 | 13 556 |
| Trépied de chantier (upsell 40 %) | 39,99 € | 12,17 € | 27,01 € | 150 | 4 052 |
| Lunettes de visée (upsell 35 %) | 24,84 € | 1,68 € | 22,56 € | 131 | 2 955 |
| Mire graduée (upsell 15 %) | 74,99 € | 22,05 € | 51,64 € | 56 | 2 892 |
| Cellule de détection (upsell 12 %) | 45,00 € | 10,68 € | 33,44 € | 45 | 1 505 |
| | | | | **TOTAL** | **24 960** |

Panier seul 79,99 € pour 36,15 € de marge, panier complet 144,82 € pour **86,22 €**.

### Trajectoire vers 100 000

| Phase | Levier | Revenu mensuel |
|---|---|---|
| 1 | Niveau laser seul | ~13 500 € |
| 2 | Gamme complète, panier moyen supérieur | ~25 000 € |
| 3 | ManoMano, Cdiscount, Google Shopping, B2B artisans | ~62 000 € |
| 4 | Extension outillage laser et mesure, marque propre | ~125 000 € |

### Ce qui reste incertain, à lever avant d'engager

Les hypothèses de part de marché (15 %) et de CPA (25 €) ne sont pas mesurées, ce sont des
estimations. Le coût de 11,37 € doit être confirmé par un devis fournisseur avec le marquage
CE et la déclaration de conformité, obligatoires sur un produit laser. Vérifier que la classe
est bien 2, sous 1 mW. La batterie lithium intégrée restreint le fret aérien, ce qui rend le
maritime obligatoire et impose donc du stock. Enfin, dix annonces du même générique prouvent
que la concurrence existe : elles prouvent le marché, pas la place.

Au-delà d'environ 15 000 EUR de chiffre d'affaires mensuel, le plafond micro-entreprise de
203 100 EUR est dépassé : il faudra une société.
