# Dossier de lancement, prêt à l'emploi

Tout ce qui pouvait être produit sans ton identité et sans ton argent est là. Ta part se
réduit à copier-coller, signer et payer.

## Deux façons d'acheter, choisis la tienne

### Sans contacter personne : `5-achat-sans-contact.md`

Alibaba « Ready to Ship » vend en stock, prix affiché, commande au panier, paiement par
carte. **MOQ de 1 unité** sur certaines fiches. Marge de 22,87 EUR, soit 24 % du marché à
capter pour atteindre l'objectif. C'est la voie à prendre si tu ne veux échanger avec
personne.

Une seule règle non négociable : **lire la puissance laser sur la fiche et écarter tout ce
qui dépasse 1 mW.** Un fournisseur affiche « certified » et 40 mW en même temps, ce qui
correspond à un classe 3B interdit en vente grand public.

### En demandant des devis : `1-message-fournisseurs.md`

Deux messages prêts à coller, à envoyer aux fournisseurs de `fournisseurs.json`. Plus long,
mais tu obtiens de meilleurs prix, les documents de conformité et l'étiquetage en usine.

Dans les deux cas, tu n'as rien d'autre à faire aujourd'hui.

## Pendant que les fournisseurs répondent

Ouvre `4-demarches.md` et lance le bloc 1 : société, banque, expert-comptable, assurance.
Environ 80 minutes de ton temps au total, étalées sur trois semaines de délais
administratifs. Ces trois semaines se déroulent en parallèle des échanges fournisseurs,
elles ne coûtent donc rien en calendrier.

## Quand les documents arrivent

Trie avec `2-cahier-des-charges.md` à côté. La règle est simple : un fournisseur qui ne
fournit pas les cinq documents est éliminé, sans discussion et sans relance. Sur un produit
laser, c'est ta société qui répond en cas d'accident.

## Quand le SIRET arrive

Bloc 2 des démarches : DEEE, Citeo, GS1, médiateur. Puis bloc 3 : le compte Amazon.
Les contenus de la fiche produit sont déjà écrits dans `3-fiche-produit-amazon.md`, il n'y
a qu'à coller et ajuster les chiffres réels une fois les specs confirmées.

## Chaque mois

```
node suivi.mjs --ventes 120 --stock 340 --pub 900
```

Il te dit deux choses : combien tu gagnes réellement, et dans combien de jours commander
pour ne pas tomber en rupture. Une rupture de stock coûte le référencement Amazon, c'est
l'erreur la plus chère du modèle.

## Les fichiers

| Fichier | Usage |
|---|---|
| `1-message-fournisseurs.md` | Deux messages prêts à envoyer, et ce que chaque paragraphe protège |
| `2-cahier-des-charges.md` | Référence contractuelle, sert à refuser un lot non conforme |
| `3-fiche-produit-amazon.md` | Titre, bullets, description, mots-clés backend, plan des 7 visuels |
| `4-demarches.md` | Toutes les démarches, où, combien, combien de temps, dans quel ordre |
| `fournisseurs.json` | 23 fournisseurs avec URL produit, URL vendeur, prix, puissance laser |
| `suivi.mjs` | Tableau de bord mensuel avec alertes de réapprovisionnement |

Le raisonnement complet et les chiffres sont dans `../PLAN.md`. Les mesures brutes et les
scrapers sont dans `../recherche/`.

## Ce qui reste vraiment à toi, et pourquoi

Cinq actes, tous imposés par la loi, aucun contournable :

1. Signer la création de la société, avec déclaration sur l'honneur de non-condamnation
2. Passer la vérification d'identité bancaire, obligation anti-blanchiment
3. Passer la vérification d'identité Amazon
4. Faire les virements, c'est ton argent
5. Décider oui ou non sur le rapport d'inspection

Compte 80 minutes au démarrage, puis 2 à 4 heures par mois. Déléguer davantage est possible
mais, chiffres à l'appui dans `../recherche/niveaux-delegation.mjs`, une agence complète
prend 15 % du chiffre d'affaires soit 12 EUR sur une marge de 22 : l'objectif devient
inatteignable.
