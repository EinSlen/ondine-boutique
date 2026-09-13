# Vendre en publicité payante

Mesures et vérifications du 21 août 2026. Complète `PLAN.md`, qui ne couvrait que l'organique.

## 1. Le vrai obstacle n'est pas l'esthétique, c'est la référence

Une pièce unique ne peut pas porter de publicité, pour une raison mécanique et pas
esthétique : les régies ont besoin d'une référence stable. Une campagne passe 3 à 7 jours en
phase d'apprentissage, et un ensemble de publicités ne se stabilise qu'autour de 50
conversions par semaine. Un produit à un exemplaire meurt au milieu de l'apprentissage. Dans
le flux catalogue Shopify, il passe en rupture immédiatement, ce qui fait rejeter la fiche et
abîme le catalogue entier.

C'est ce point qui bloque, et il se règle par la structure de l'offre.

## 2. La structure à deux étages

| Étage | Rôle | Prix | Stock | Canal |
|---|---|---|---|---|
| **Tirage unique** | rareté réelle, narration, preuve | 119 € | 1 | organique uniquement |
| **Série ouverte** | la publicité tape ici | 79 € imprimé, 99 € all-over print | illimité | publicité et catalogue |
| **Accessoires** | monter le panier | bonnet 29 €, tote 35 € | illimité | montée en gamme après le clic |

Le print-on-demand donne un stock illimité sans trésorerie. Maintenir une série ouverte en
permanence ne coûte donc rien, et c'est ce qui rend la publicité possible du tout. Les pièces
uniques restent le cœur du récit et la preuve que la marque fabrique vraiment, mais elles ne
reçoivent jamais un euro de budget.

Une seule règle à ne pas casser : les pièces uniques sont **exclues du flux catalogue**. Sinon
elles passent en rupture et font tomber la fiche.

## 3. Le prix qui rend la publicité possible

`mesures/pub-eco.mjs`. Le ROAS seuil est le chiffre d'affaires TTC à générer par euro de
publicité pour ne rien perdre.

| Panier | TTC | Contribution | CPA maximum | ROAS seuil | Ventes/mois pour 10k à CPA 20 € |
|---|---|---|---|---|---|
| Tee AOP seul | 59 € | 16,61 € | 16,61 € | **3,55** | jamais |
| Sweat classique | 69 € | 23,76 € | 23,76 € | 2,90 | 2 711 |
| Sweat AOP col rond | 99 € | 35,85 € | 35,85 € | 2,76 | 643 |
| Sweat AOP capuche | 129 € | 50,03 € | 50,03 € | 2,58 | 340 |
| **Sweat AOP capuche** | **159 €** | **73,27 €** | **73,27 €** | **2,17** | **192** |
| Sweat 129 + bonnet 39 | 168 € | 64,39 € | 64,39 € | 2,61 | 230 |
| Sweat 159 + bonnet + tote | 247 € | 108,58 € | 108,58 € | 2,27 | 115 |

**Ce tableau retient les coûts non optimisés.** Avec les leviers de `COUTS.md`, franchise en
base de TVA, remise Printful Growth et micro-entreprise, le même ROAS seuil de 2,1 est atteint
à **79 € en imprimé classique, 99 € en all-over print col rond et 119 € à capuche**. Le
raisonnement ci-dessous ne change pas, seuls les prix descendent de 30 à 60 €.

Un pixel neuf tient un ROAS de 1,5 à 2,5. Au-delà de 3,5, le plan ne démarre pas, et c'est
exactement ce qui avait tué la fontaine à eau en août. Conclusions :

- **Le tee à 59 € est invendable en publicité à coûts non optimisés**, il demande 3,55 avant
  même de gagner un euro. Avec les leviers de `COUTS.md`, un tee heavyweight imprimé à 49 €
  tombe à 2,06 et devient le meilleur produit d'entrée.
- **Plus le prix monte, plus le ROAS seuil baisse**, donc à coûts non optimisés il faut viser
  159 €. Après optimisation des coûts, 99 € suffisent pour le même seuil.
- **Le CPA se paie une fois par client, jamais par article.** Un bonnet à 39 € ajouté au panier
  monte la contribution de 73 à 108 € sans coûter un euro de publicité de plus. C'est le levier
  le moins cher du plan.

## 4. Les créatifs qui passent

### Ce qui est interdit d'emblée

TikTok refuse toute publicité affichant ou promouvant des armes, des munitions, y compris les
répliques, le paintball et les armes à billes, la violence, l'automutilation et les activités
dangereuses. Un produit autorisé peut être refusé pour son seul visuel, et c'est là que se
concentrent les refus en pratique.

Traduction directe sur le catalogue qui t'a inspiré : les trous de balle, le sang, les armes
dessinées et les références au suicide de Cobain sont inutilisables. Pas seulement en
publicité, mais aussi sur la page de destination, que les régies lisent.

### Le piège Meta, la règle du « tu »

Une publicité ne peut pas affirmer ni sous-entendre qu'elle sait quelque chose de personnel
sur la personne qui la voit, ce qui inclut un état psychologique. L'application attrape le
cadrage indirect, pas seulement le « tu » littéral.

**Donc l'accroche organique qui fonctionne est précisément celle que Meta refuse.** Le format
POV de rupture désigne l'état émotionnel du spectateur : c'est son mécanisme, et c'est le
motif de refus. Il faut deux bibliothèques d'accroches, pas une.

| Organique, fonctionne, interdit en publicité | Version publicitaire conforme |
|---|---|
| « POV : elle est partie et t'a laissé ça » | « Pièce 07 sur 40. Imprimée avant couture, cousue en Europe. » |
| « Toi quand tu comprends que c'est fini » | « Un motif, un exemplaire. Quand il part, il ne revient pas. » |
| « T'as encore son sweat ? » | « La série dead2me, tirages numérotés. » |
| « Ça te rappelle quelqu'un » | « Certains gardent la pièce plus longtemps que l'histoire. » |

La règle mécanique, applicable sans jugement : repérer chaque phrase contenant « tu », « ton »,
« ta », « tes » ou une question adressée au lecteur, et la réécrire au niveau de l'objet, de
l'édition, ou d'un groupe de gens. Laisser le spectateur se reconnaître, ne jamais le désigner.

### Deux autres causes de refus à ne pas se prendre

- **Incohérence entre la publicité et la page de destination.** La page doit montrer le même
  produit, le même prix, et porter mentions légales, conditions de vente, politique de
  remboursement et contact.
- **Contenu généré par IA non déclaré**, désormais surveillé. Et côté français, l'article
  L121-2 interdit de montrer autre chose que la pièce réellement expédiée. Les maquettes
  Printful représentent le produit réel, elles sont donc utilisables ; une image inventée du
  vêtement ne l'est pas.

## 5. Ne pas se faire couper le compte

Le compte principal de live2die a été banni à 30 000 abonnés. Ce risque se gère par
l'organisation, pas par la chance.

- **Deux comptes TikTok dès le premier jour** : un compte de narration, un compte de marque.
  Si le narratif tombe, la boutique survit. C'est exactement ce qui a manqué à live2die.
- **Business Manager avec domaine vérifié** avant le premier euro dépensé.
- **Jamais un visuel organique violent dans le compte publicitaire**, et jamais sur la page de
  destination.
- Les quatre pages de politique de la boutique remplies avant la première campagne, c'est une
  cause de refus documentée et gratuite à éviter.

## 6. Plan de démarrage chiffré

**Phase 0, organique, 30 jours, 0 €.** Le protocole de `PLAN.md` sections 9 et 10. Ne rien
dépenser avant d'avoir un signal, la règle n'a pas changé depuis août.

**Phase 1, test créatif, 300 €.** 5 créatifs orientés objet, 15 €/jour chacun pendant 4 jours,
un seul ensemble de publicités, ciblage large, optimisation sur l'achat. Tant que le compte est
sous 50 conversions par semaine, juger sur l'ajout au panier, pas sur l'achat : le signal
d'achat est trop rare pour être lisible.

Seuils de coupure d'un créatif :

- taux de clic sous 1 % : créatif mort, ne pas l'améliorer, le remplacer,
- coût par ajout au panier au-dessus de 8 € : créatif mort,
- CPA au-dessus de 40 € sur une pièce à 99 € : arrêt de la phase, retour à l'organique.

**Phase 2, montée en charge.** Augmenter le budget par paliers de 30 % par jour tant que le CPA
reste sous 30 €. Au-delà, redescendre d'un palier et attendre 48 h.

**Trajectoire, en deux phases, parce que la franchise de TVA plafonne.**

Phase 1, micro-entreprise et franchise en base, sweat all-over print à 99 €. Chaque vente laisse
47 € nets, soit 27 € après un CPA de 20 €. Le plafond de 85 000 € de chiffre d'affaires tombe à
71 ventes par mois, donc environ **1 850 € nets par mois avec de la publicité**, ou 3 270 € en
organique pur où il n'y a pas de CPA à payer. Cette phase sert à valider les créatifs et à
construire l'audience, pas à atteindre l'objectif.

Phase 2, société et TVA, sweat à 129 €. Chaque vente laisse 51 € nets, soit 31 € après CPA.
L'objectif de 10 000 € demande **329 ventes par mois**, soit 42 400 € de chiffre d'affaires.
C'est aussi le régime où le compte publicitaire devient stable, puisque 329 ventes par mois
font 76 conversions par semaine, au-delà des 50 nécessaires.

Le passage de phase n'est pas un choix esthétique : à 99 € sous TVA il ne reste que 23,66 € et
un ROAS seuil de 4,18, donc invendable. Franchir le seuil oblige à monter les prix ou à sortir
de la publicité. Détail dans `COUTS.md`.

## 7. Ce qui reste non mesuré

- **Le CPA réel en France sur ce segment.** Le CPM français est 2,3 fois moins cher qu'aux
  États-Unis, c'est un avantage de départ, pas une garantie de CPA.
- **Le taux de retour réel.** Le P&L retient 5 %. La mode tourne souvent plus haut à cause des
  tailles, et Printful ne reprend pas un retour pour changement d'avis. Un guide des tailles
  précis et des photos portées sont le seul levier.
- **L'acceptation du prix de 99 €** sans marque installée, puis de 129 € en phase 2. C'est
  l'hypothèse la plus lourde du plan, et le premier test de la phase 1.
- **La qualification fiscale des achats Printful.** Si la TVA est autoliquidée sans être
  déductible, chaque pièce coûte 8 € de plus et le prix plancher remonte. Les prix retenus
  résistent aux deux cas, voir le tableau de robustesse de `COUTS.md`.

## 8. Les vrais tarifs, plateforme par plateforme

Relevé le 21 août 2026, `mesures/rentabilite.mjs`. Le coût d'acquisition est calculé de deux
façons indépendantes : par l'entonnoir (CPM divisé par taux de clic puis par taux de
conversion) et par le CPA moyen rapporté par les plateformes de mesure, ajusté au marché
français.

| Plateforme | Fourchette entonnoir | CPA rapporté, ajusté France | Retenu |
|---|---|---|---|
| **Meta** | 10,87 à 42,50 € | **17,12 €** | 17 € |
| TikTok | 17,83 à 183,04 € | 22,42 € | 22 € |
| Google Shopping | 20,18 à 40,36 € | 26,62 € | 27 € |

### Meta gagne, et pour une raison mesurable

Le CPM français est de **6,95 $** contre 16,08 $ aux États-Unis, 11,81 $ au Royaume-Uni et
9,05 $ en Allemagne. La France est le troisième marché le moins cher d'Europe de l'Ouest,
derrière l'Italie à 6,06 $ et l'Espagne à 6,65 $. Le taux de clic médian est de 2,19 % toutes
industries, et l'habillement affiche les CPC les plus bas de Facebook, 0,45 à 0,68 $. Les
campagnes Advantage+ Shopping sortent un CPA inférieur de 32 % aux campagnes réglées à la main.

### TikTok est moins cher à l'impression et plus cher à la vente

CPM entre 4,80 et 13,26 $ selon les rapports, donc moins cher que Meta. Mais le taux de clic
tombe à 0,61 % en moyenne, contre 2,19 % chez Meta, et le taux de conversion moyen mesuré est
de 1,92 %. Le produit des deux fait exploser la fourchette : **17,83 à 183 € de CPA**. C'est la
plateforme la plus instable des trois, et celle qui dépend le plus du créatif.

À garder quand même en tête : c'est là que vit l'audience du modèle, et l'organique y est
gratuit. TikTok sert à faire connaître, Meta à faire acheter.

### Google est structurellement le mauvais canal ici

Ce n'est pas une question de prix, même si son CPA est le plus élevé des trois. Google Shopping
est un canal d'intention : le client tape « sweat oversize noir » et compare les vignettes.
Personne ne cherche une marque qui n'existe pas encore, et sur une requête générique ta pièce
à 99 € s'affiche **à côté de Sixth June à 69,90 €**.

Autrement dit, Google te remet exactement dans le mur de comparaison que la pièce unique
permettait d'éviter. Meta et TikTok sont des canaux de découverte, où le client ne compare pas
parce qu'il ne cherchait rien. C'est le canal qui doit correspondre au produit, et ici c'est la
découverte.

Google garde un usage, plus tard et petit : une campagne sur le **nom de la marque** seulement,
pour ne pas laisser un concurrent acheter ton nom quand ton audience te cherche. Quelques euros
par jour, pas un canal d'acquisition.

## 9. Rentabilité réelle, chiffrée

Coûts réels au taux du jour, remise Growth prudente à 20 %, micro-entreprise en franchise de
TVA, retours à 3 %.

### Marge nette par vente, après publicité

| Produit | Prix | Sans pub | Meta | TikTok | Google |
|---|---|---|---|---|---|
| Tee Gildan imprimé | 29 € | 13,54 € | **-3,58 €** | -8,88 € | -13,08 € |
| Tee heavyweight | 39 € | 16,40 € | **-0,72 €** | -6,02 € | -10,22 € |
| Bonnet AOP | 35 € | 12,98 € | **-4,15 €** | -9,44 € | -13,64 € |
| Sweat Gildan imprimé | 69 € | 34,01 € | **16,88 €** | 11,59 € | 7,39 € |
| Sweat col rond AOP | 89 € | 40,81 € | **23,69 €** | 18,39 € | 14,20 € |
| Sweat à capuche AOP | 109 € | 50,87 € | **33,75 €** | 28,45 € | 24,25 € |

Confirmé avec les vrais chiffres : **tout ce qui est sous 50 € perd de l'argent dès qu'on paye
la publicité**, sur les trois plateformes. Les petits prix sont un canal organique, pas un
produit publicitaire. Au-dessus de 69 €, les trois plateformes deviennent rentables, et Meta
laisse 5 à 10 € de plus par vente que les autres.

### CPA maximum supportable avant de vendre à perte

| Produit | 59 € | 69 € | 79 € | 89 € | 99 € | 109 € | 119 € |
|---|---|---|---|---|---|---|---|
| Sweat Gildan imprimé | 26 € | 34 € | 42 € | 50 € | 59 € | 67 € | 75 € |
| Sweat col rond AOP | 16 € | 24 € | 33 € | 41 € | 49 € | 57 € | 65 € |
| Sweat à capuche AOP | 10 € | 18 € | 26 € | 34 € | 43 € | 51 € | 59 € |

### Compte de résultat mensuel, sweat col rond AOP à 89 € sur Meta

| Ventes/mois | CA | Coût produits | Publicité | Prélèvements | Net après charges fixes |
|---|---|---|---|---|---|
| 10 | 890 € | 328 € | 171 € | 118 € | **172 €** |
| 30 | 2 670 € | 983 € | 514 € | 355 € | **646 €** |
| 50 | 4 450 € | 1 639 € | 856 € | 592 € | **1 120 €** |
| 71 | 6 319 € | 2 327 € | 1 216 € | 840 € | **1 617 €** |
| 100 | 8 900 € | 3 278 € | 1 712 € | 1 184 € | 2 304 € (franchise dépassée) |
| 200 | 17 800 € | 6 556 € | 3 425 € | 2 367 € | 4 673 € (franchise dépassée) |

Seuils : **3 ventes par mois couvrent les charges fixes**, 45 ventes font 1 000 € nets, 130
ventes font 3 000 € nets, et le plafond de la franchise de TVA arrive à 79 ventes par mois.
Le ROAS à atteindre est de **2,18**, dans la zone qu'un compte neuf peut tenir.

### Phase 2, après le plafond, en société avec TVA

| Produit | Prix | Net après TVA, IS et publicité Meta | Ventes/mois pour 10 000 € |
|---|---|---|---|
| Sweat Gildan imprimé | 89 € | 23,55 € | 433 |
| Sweat col rond AOP | 109 € | 28,84 € | 354 |
| Sweat à capuche AOP | 119 € | 30,18 € | 338 |
| Sweat à capuche AOP | 129 € | 36,90 € | 276 |

L'objectif de 10 000 € nets par mois demande donc **276 à 433 ventes mensuelles** selon le prix,
soit 36 000 à 39 000 € de chiffre d'affaires. C'est une vraie marque, pas un projet du soir.

## 10. Où est le risque, chiffré

Si le coût d'acquisition sort en haut de la fourchette Meta, soit 42,50 € :

| Produit | Prix | Résultat par vente |
|---|---|---|
| Sweat Gildan imprimé | 69 € | **-8,49 €, à perte** |
| Sweat col rond AOP | 89 € | **-1,68 €, à perte** |
| Sweat à capuche AOP | 109 € | +8,37 €, tient |

Le CPA n'est pas une donnée, c'est un résultat. Il dépend du créatif, et la fourchette va de 11
à 42 € sur la même plateforme. C'est exactement pour cela que la phase de test à 300 €
existe : elle mesure ton CPA réel avant d'engager du budget. Tant qu'il n'est pas mesuré, le
seul produit qui résiste au pire cas est le sweat à capuche AOP à 109 € ou plus.
