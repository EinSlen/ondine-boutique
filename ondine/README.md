# Ondine

Point d'entrée du projet. Dernière mise à jour le 21 août 2026.

## Décision en cours

**Marque de vêtements en pièce unique, fabriquée en print-on-demand en Europe, vendue sur
Shopify sans aucune manipulation.** Le plan complet et chiffré est dans **`PLAN.md`**.

Origine : la boutique live2die.us, trouvée le 21 août. Elle vend des pièces peintes à la
main, une par une, portées par des vidéos TikTok narratives. C'est le premier modèle
rencontré depuis le 5 août qui casse les trois murs du e-commerce France, parce qu'une
pièce unique n'a pas de comparable et donc pas de prix plancher.

Ce qui a été retenu de ce modèle : le mécanisme, rareté réelle plus narration, sans
publicité. Ce qui a été écarté : la peinture à la main, qui plafonne à 400 $/mois mesurés
et qui ne se sous-traite pas dans une chaîne branchée sur Shopify.

Le point d'entrée retenu est le **sweat all-over print recyclé, à 99 € col rond ou 119 €
à capuche**, base 42,09 € fabriquée en Lettonie ramenée à 33,67 € avec la remise Printful
Growth. Marge nette 47 à 56 €, ROAS seuil 2,11.

Les prix de 129 et 159 € du premier jet venaient d'hypothèses fiscales trop prudentes,
corrigées dans `COUTS.md` : la franchise en base de TVA jusqu'à 85 000 € de chiffre
d'affaires, la remise fournisseur et la micro-entreprise rendent **21,72 € par pièce**, donc
autant que le client n'a pas à payer. Une porte d'entrée à **79 €** existe aussi en imprimé
classique plutôt qu'en all-over print.

Le poste non résolu est l'acquisition, section 8 de `PLAN.md`. C'est le seul, et c'est celui
qui décide.

## Nom retenu

**dead2me**, domaine `dead2me.fr`, avec `contrepreuve` en second choix si le
positionnement art est préféré. Les 12 finalistes, la méthode de vérification et les deux
contrôles qui restent à faire à la main sont dans `NOMS.md`.

## Publicité payante

Elle est possible, mais pas sur une pièce unique et pas en dessous de 69 €. Tarifs réels
relevés le 21 août :

| Plateforme | CPA France | Verdict |
|---|---|---|
| **Meta** | **17 €** | à utiliser, CPM France 6,95 $ contre 16,08 $ aux États-Unis |
| TikTok | 22 €, fourchette 18 à 183 € | organique oui, payant instable |
| Google Shopping | 27 € | mauvais canal, il remet la pièce en comparaison de prix |

À 89 € sur Meta, chaque vente laisse **23,69 €** nets, 3 ventes par mois couvrent les charges
fixes, 130 ventes font 3 000 € nets. **Sous 50 €, toute vente avec publicité est à perte**, sur
les trois plateformes. Il faut aussi une **série ouverte** en stock illimité pour recevoir le
budget, et **deux bibliothèques d'accroches** séparées, parce que le format POV qui marche en
organique est précisément celui que Meta refuse au titre de la règle du « tu ». Tout est dans
`PUB.md`, les coûts dans `COUTS.md`.

## Arborescence

| Dossier | Contenu |
|---|---|
| `PLAN.md` | le plan de la marque, 11 sections, tous les chiffres et leurs sources |
| `NOMS.md` | 60 noms testés, 12 finalistes avec domaines et pseudos libres, recommandation |
| `PUB.md` | comment vendre en publicité payante sans se faire refuser ni bannir |
| `COUTS.md` | les leviers qui font baisser le prix client, grille de prix retenue |
| `AUDIT-SADCORE.md` | **audit mesuré du créneau : 3 marques, prix, ratios, registre des phrases** |
| `PRODUITS.md` | **la gamme : modèles de vêtement, coûts réels, 24 phrases, 7 références** |
| `BOUTIQUE.md` | **état du montage de la boutique, ce qui est prêt et ce qui t'attend** |
| `mesures/` | les scripts de mesure et leurs sorties, dont le balayage des 532 produits |
| `contenu/` | les moteurs de visuels, les planches de choix, la bibliothèque CC0 et les photos produit |
| `outils/` | provisionnement de la boutique Shopify |
| `_archive/` | les deux plans précédents et 160 familles de produits mesurées |

## Les planches à regarder

Trois fichiers à ouvrir par double-clic, ce sont eux qui montrent la marque.

| Fichier | Ce qu'il montre |
|---|---|
| `contenu/planche-produits.html` | **les visuels sur les vrais vêtements**, photos produit par API |
| `contenu/planche-tout.html` | **234 propositions, 26 scènes, tous formats** |
| `contenu/planche-clips.html` | **12 clips TikTok verticaux, muets, prêts à sonoriser** |
| `contenu/revue.html` | la bibliothèque CC0 rendue dans le style, pour trier |
| `contenu/planche-serie.html` | 100 pièces, 26 scènes, le moteur principal |
| `contenu/planche-phrases.html` | 60 pièces à phrase seule, classées par mise en page |

## Rejouer les mesures

Aucun compte, aucune clé d'API, aucun `npm install`. Node seul.

```
cd mesures
node boutique-scan.mjs                      # concurrents Shopify, prix et CA proxy
node boutique-scan.mjs monconcurrent.com     # n'importe quelle boutique Shopify
node tiktok-compte.mjs                      # abonnés, likes, ratio de diffusion
node pod-eu.mjs                             # catalogue Printful fabricable en UE
node pnl-marque.mjs                         # P&L par prix de vente et par coût d'acquisition
node pub-eco.mjs                            # CPA maximum et ROAS seuil par panier
node cout-client.mjs                        # jusqu'où le prix peut descendre, par régime fiscal
node prix-plancher.mjs                      # prix plancher des 25 bases fabricables en UE
node rentabilite.mjs                        # tarifs pub réels par plateforme et compte de résultat
node noms.mjs                               # domaines et pseudos disponibles
```

`pod-eu.mjs` interroge l'API publique de Printful et prend deux à trois minutes. Les autres
sont instantanés.

Ce que les mesures ont donné le 21 août :

| Boutique | Sweat médian | Tee médian | Panier moyen |
|---|---|---|---|
| live2die.us | 74 $ | 27 $ | 44,41 $ |
| brut-clothing.com | 205 € | 85 € | 197,32 € |
| nakedcph.com | 200 € | 65 € | 127,46 € |
| sixthjune.com | 69,90 € | 35 € | 46,70 € |
| avnier.com | 65 € | 45 € | 100,30 € |

| Compte TikTok | Abonnés | Vidéos | Likes | Ratio likes par abonné |
|---|---|---|---|---|
| @llive2diie | 2 345 | 20 | 218 100 | 93 |
| @rawsoult | 5 113 | 67 | 752 300 | 147 |
| @242.g_ | 24 800 | 225 | 4 000 000 | 161 |

Un ratio au-delà de 20 veut dire que le contenu sort du compte et touche des gens qui ne
sont pas abonnés. Ces trois comptes sont à 93, 147 et 161. C'est la preuve que le format
se diffuse, et c'est l'actif à reproduire.

## Ce qui reste à faire

**Le détail complet est dans `BOUTIQUE.md`.** En résumé, la boutique est écrite et le script
de provisionnement est testé : 5 produits, 2 collections, 7 pages dont les CGV et les mentions
légales, et un guide des tailles généré depuis les vraies données Printful.

Ce qui bloque tient en une étape : **l'immatriculation au guichet unique INPI**. Quatre
informations en dépendent (nom, SIRET, adresse, médiateur) et `provision.mjs` refuse d'écrire
tant qu'elles manquent, parce que des CGV incomplètes exposent à une sanction DGCCRF.

Ensuite : médiateur de la consommation, adhésion Refashion, domaine, token Admin API Shopify,
`node provision.mjs`, application Printful, réglages au clic.

Le vrai sujet restant n'est ni la boutique ni la logistique, c'est **les motifs** et les
30 jours de contenu organique. Ni l'un ni l'autre ne se règle par un script.

## Ce qui est en archive et pourquoi

Rien n'a été supprimé. Le dossier n'est pas suivi par git, donc tout ce qui ne sert plus la
décision a été déplacé dans `_archive/`, pas effacé.

- `_archive/README-fontaine-a-eau.md` : première tentative, fontaine à eau pour chat,
  invalidée le 6 août parce que le coût d'achat rendu UE dépassait le prix plancher français.
- `_archive/PLAN-niveau-laser-fba.md` et `_archive/lancement-niveau-laser/` : deuxième
  tentative, niveau laser vert en Amazon FBA. Chiffres sains mais 25 000 € de trésorerie
  permanente et 24 % du marché à prendre pour atteindre l'objectif.
- `_archive/recherche-160-familles/` : 160 familles de produits mesurées, les scrapers
  Amazon, Google Shopping, AliExpress et Alibaba, et les pièges de mesure documentés.
  Utile si le projet revient un jour à un produit physique standard.

Les enseignements de méthode qui survivent aux trois tentatives, à ne pas réapprendre :

- Comparer le prix du même modèle, jamais la médiane d'une catégorie, elle gonfle
  systématiquement l'écart apparent.
- Mesurer le prix de l'annonce qui concentre les achats, pas le prix plancher ni la médiane.
- Prix et demande varient en sens inverse. Au-dessus de 100 €, la demande grand public
  tombe à zéro. Le B2B et la pièce unique sont les deux seules exceptions rencontrées.
- Raisonner en HT. 129 € TTC valent 107,50 € HT, les 21,50 € de TVA ne sont pas du chiffre
  d'affaires.
- Une liste en dur dans un script de mesure produit de faux zéros sur ce qu'elle ne couvre
  pas. Un zéro qui vient d'une liste en dur ne prouve jamais un terrain libre.
- Google renvoie une page vide en HTTP 429 après environ 70 requêtes, sans bannière. Se
  méfier d'un résultat trop beau et uniforme.
