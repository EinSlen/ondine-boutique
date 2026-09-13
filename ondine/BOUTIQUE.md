# Monter la boutique, dans l'ordre

État au 21 août 2026. Ce qui est prêt, ce qui attend toi, et dans quel ordre.

## Ce qui est prêt et testé

| Élément | Où | État |
|---|---|---|
| 5 fiches produits rédigées, tailles et prix | `outils/content.mjs` | prêt |
| 2 collections automatiques par étiquette | `outils/content.mjs` | prêt |
| 7 pages, dont CGV, mentions légales, retours, livraison | `outils/content.mjs` | prêt |
| Guide des tailles en centimètres, vraies données Printful | `mesures/tailles.mjs` | généré |
| Boutique provisionnée en prod (5 produits, 2 collections, 5 pages) | `outils/provision.mjs` | **FAIT, produits en brouillon** |
| Courriels de confirmation et d'expédition | `outils/content.mjs` | à coller dans Shopify |
| 3 réponses toutes prêtes pour le service client | `outils/content.mjs` | prêt |
| Token Admin API OAuth | `outils/.env` | **FAIT, testé HTTP 200** |

Le catalogue provisionné :

| Produit | Prix | Tailles | Série | Coût rendu |
|---|---|---|---|---|
| Sweat à capuche, tirage unique | 119 € | L seulement, 1 exemplaire | unique | 38,16 € |
| Sweat col rond | 99 € | XS à 3XL | ouverte | 31,82 € |
| Sweat à capuche imprimé | 69 € | S à 2XL | ouverte | 22,24 € |
| T-shirt heavyweight | 39 € | S à 2XL | ouverte | 15,26 € |
| Bonnet | 35 € | S, M, L | ouverte | 15,41 € |

Le tirage unique est en **une seule taille et un seul exemplaire**. C'est la seule façon de
rendre la rareté vraie : Shopify compte le stock par variante, donc une pièce unique déclinée
en sept tailles serait sept pièces. C'est aussi ce que fait live2die, dont les fiches précisent
« size small » ou « size xxl ».

## Fait le 21 août : la boutique est en ligne

| Élément | État |
|---|---|
| Thème **Dawn 15.3.0** installé sous le nom `dead2me`, id `188585640264` | **publié** |
| Palette blanc et noir strict, angles droits, ombres coupées, panier en tiroir | appliquée |
| Page d'accueil : accroche noire, tirages uniques, série ouverte, comment c'est fait | écrite |
| Menu principal (2 collections + à propos) et pied de page (4 pages) | créés |
| Les 5 produits | **publiés** |
| Barre d'annonces « Livraison offerte à partir de 90 € » | traduite |

Le thème est le même que live2die : ils utilisent **Whisper**, une variante de Dawn, retirée
depuis du Theme Store. Dawn donne le même rendu, blanc et noir sans couleur d'accent. Vérifié
sur leur page d'accueil : ce sont leurs photos produit sombres qui font l'ambiance, pas le
thème. Autrement dit, l'identité viendra des motifs, pas des réglages.

Scripts ajoutés, tous rejouables : `outils/theme.mjs` (palette et réglages, `--publish` pour
publier), `outils/accueil.mjs` (sections de la page d'accueil), `outils/menus.mjs` (navigation).

### Ce qui reste sur la boutique elle-même

- ~~Nom de la boutique~~ : **fait**, la boutique s'appelle `dead2me`, vérifié par l'API.
- **Mot de passe de la boutique** encore actif, normal pendant l'essai. À retirer dans Boutique
  en ligne, Préférences, quand tu veux ouvrir.
- **Les visuels produit manquent**, les fiches affichent les images d'exemple du thème. Ils
  viendront des maquettes Printful une fois les motifs choisis.
- **Essai Shopify** : il finit dans 3 jours, forfait à 1 € proposé.

## Ce qui reste, dans l'ordre

### 1. Immatriculation, guichet unique INPI, 20 min

C'est le seul vrai blocage. Quatre informations manquent partout ailleurs :
`__NOM_PRENOM__`, `__SIRET__`, `__ADRESSE_COMPLETE__`, `__NOM_ET_SITE_DU_MEDIATEUR__`.
`provision.mjs` **refuse d'écrire** tant qu'elles sont vides, parce que publier des CGV
incomplètes t'expose à une sanction DGCCRF.

Micro-entreprise, activité de vente de marchandises. Pas de SASU pour l'instant, le
print-on-demand ne demande aucun capital.

À l'immatriculation, vérifie que l'activité est bien classée en **vente de marchandises à
12,3 %** et non en prestation de services à 21,2 %. L'écart vaut 9 € par pièce.

### 2. Adhésion à un médiateur de la consommation, 30 à 100 €/an

Obligatoire pour toute vente en ligne à des particuliers, et son nom doit figurer dans les
CGV. C'est la quatrième information manquante.

### 3. Adhésion Refashion, la REP textile

Obligatoire dès la première mise sur le marché français, y compris pour du print-on-demand
expédié de Lettonie, puisque c'est toi qui vends au consommateur français. Coût unitaire
négligeable, l'adhésion est une formalité en ligne.

### 4. Domaine dead2me.fr

Libre au 21 août, vérifié en RDAP chez l'Afnic. Vérifie aussi le pseudo Instagram à la main,
le test automatique ne passe pas le mur de connexion.

### 5. Token Admin API et provisionnement : FAIT

Le token OAuth a été créé via le Dev Dashboard (application `dead2me-provision`) et écrit dans
`outils/.env`. La boutique `0rsiku-r1.myshopify.com` contient déjà les 5 produits en brouillon,
les 2 collections et les 5 pages. Pour republier après une modification de `content.mjs` :

```
cd mesures && node tailles.mjs
cd ../outils && node provision.mjs
```

Les produits restent **en brouillon**. Tu les relis dans l'admin avant de les publier.

### 7. Application Printful

Installe-la depuis l'App Store Shopify, gratuite, puis relie chaque SKU à sa base :

| SKU | Base Printful | Emplacements |
|---|---|---|
| `D2M-AOP-HOOD-*` | 388, All-Over Print Recycled Unisex Hoodie | tous inclus |
| `D2M-AOP-CREW-*` | 320, All-Over Print Recycled Unisex Sweatshirt | tous inclus |
| `D2M-DTF-HOOD-*` | 146, Gildan 18500 | **devant seulement** |
| `D2M-TEE-HW-*` | 586, Comfort Colors 1717 | **devant seulement** |
| `D2M-AOP-BEANIE-*` | 458, All-Over Print Beanie | tous inclus |

Sur les deux pièces imprimées, n'ajoute pas d'impression au dos : elle coûte 5,95 € et mange un
quart de la marge. Sur les pièces all-over print, tous les emplacements sont inclus, donc
utilise-les tous.

Prends l'abonnement **Printful Growth** dès que tu passes 10 commandes par mois : 24,99 $, il
rend jusqu'à 33 % sur les produits et devient gratuit au-delà de 12 000 $ de ventes annuelles.

### 8. Réglages Shopify au clic

- Frais de port : 4,90 € France métropolitaine, offerts à partir de 90 €, 7,90 € Union
  européenne. Les prix du catalogue sont calculés avec ces montants.
- Menu de pied de page : `cgv`, `mentions-legales`, `retours`, `livraison`, `faq`.
- Shopify Payments : demande le SIRET, donc après l'étape 1.
- Bandeau de consentement cookies.
- Courriels de confirmation et d'expédition : textes dans `outils/content.mjs`, objet `EMAILS`.
- **Exclure la collection `tirages-uniques` des flux Meta et Google.** Une référence à un
  exemplaire passe en rupture immédiatement et fait rejeter tout le flux.

### 9. Deux comptes TikTok, pas un

Un compte de narration, un compte de marque. Si le narratif se fait bannir, la boutique
survit. C'est exactement ce qui a manqué à live2die, banni à 30 000 abonnés.

Le pseudo `@dead2me` est déjà pris (compte vide à 0 abonné). Pseudo jumeau libre au 21 août,
vérifié : **`@dead2mewear`**, cohérent avec le domaine dead2me.fr. Prends-le pour le compte
de marque, et un pseudo narratif distinct pour l'autre compte.

## Ce qui n'existe pas encore, et qui est le vrai sujet

**Une première série de 10 motifs est générée** dans `contenu/motifs/`, cinq familles :
coulures, lavis, trame, fibres, craquelure. Trois fichiers par motif, la tuile répétable, la
feuille all-over print et une composition centrée sur fond transparent. Raccord invisible
vérifié. Il reste à choisir lesquels garder et à les charger dans Printful.

Contraintes techniques mesurées : les pièces all-over print s'impriment en tissu plat, donc le
motif doit être **répétable sans raccord visible**, à haute résolution, sur toute la surface.
Les pièces imprimées demandent un visuel unique, centré, devant.

**La publicité ne démarre pas avant.** Le protocole reste celui de `PLAN.md` : 30 jours
d'organique à zéro euro, puis 300 € de test créatif seulement si le contenu prend. Les seuils
de coupure sont en section 10 de `PLAN.md` et en section 6 de `PUB.md`.

## Rappel des chiffres qui commandent

- Marge nette par vente sur le sweat col rond à 99 €, sans publicité : **47 €**.
- Avec la publicité Meta à 17 € de coût d'acquisition : **30 €**.
- **3 ventes par mois** couvrent les charges fixes de 65 €.
- Plafond de la franchise de TVA : **85 000 €** de chiffre d'affaires, soit 71 ventes par mois
  à 99 €. Au-delà, il faut passer en société et remonter les prix.
- Sous 50 € de prix de vente, **toute vente avec publicité est à perte**, sur les trois
  plateformes. Le bonnet et le t-shirt sont des produits organiques et de montée en panier.
