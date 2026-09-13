# dead2me — capsule visuelle 01

## Décision de direction

Les propositions laissées par Claude étaient surtout pensées pour des vêtements noirs, avec
des compositions assez propres et numériques. Les références données pointent vers un langage
différent : coton blanc ou écru, scène narrative très simple, encre noire irrégulière, petite
touche bordeaux, beaucoup de vide, photo produit brute et directe.

Cette capsule reprend ces principes généraux avec trois compositions originales. Aucun dessin,
personnage, texte ou placement de la marque de référence n'a été recopié.

## Fichiers

- `01-the-light-stayed-on.png` — deux portes, deux personnages, lien interrompu.
- `02-we-missed-the-end.png` — deux chaises devant une image restée vide.
- `03-no-one-noticed.png` — banc vide, lettre laissée, passants lointains.
- `apercu-capsule-01.png` — simulation de la capsule sur tee, hoodie et manches longues écrus.

Les trois fichiers de dessin sont des PNG RGBA à fond réellement transparent. Le contrôle des
bords donne un alpha nul sur les cinq points testés pour chaque fichier.

## Statut de la boutique vérifié le 24 août 2026

- Boutique Shopify : `dead2me`, mot de passe encore actif.
- Thème principal : `dead2me`, id `188585640264`.
- Cinq produits actifs : hoodie unique, sweat col rond, hoodie imprimé, tee heavyweight, bonnet.
- Trois collections présentes, dont `tirages-uniques` et `serie-ouverte`.
- Six pages présentes.
- Les cinq produits ont encore zéro média : aucune image produit n'est attachée.

## Ce qui n'a volontairement pas été modifié

La boutique en production n'a pas été changée et aucun visuel n'a été attaché aux produits.
Cette capsule sert à choisir la bonne direction avant une écriture externe visible.

## Prochaine passe après validation

1. Retenir une ou plusieurs pistes.
2. Refaire les masters retenus à la résolution d'impression Printful : les PNG actuels sont des
   prototypes visuels, pas encore des masters grand format à 300 ppp.
3. Décliner chaque master en tee, hoodie et éventuellement manches longues blancs/écrus.
4. Générer les maquettes Printful réelles.
5. Attacher les médias aux fiches Shopify puis remplacer les blocs génériques de l'accueil.

## Prompts utilisés avec ImageGen

Les trois prompts suivent la même structure : graphisme de poitrine original, scène narrative
minimale, deux encres maximum (noir et bordeaux), texture peinture textile/sérigraphie sèche,
fond transparent, texte exact une seule fois, sans crâne, arme, gore, marque ni filigrane.

- **THE LIGHT STAYED ON** : deux silhouettes anonymes dans deux encadrements de porte opposés,
  reliées par un fil bordeaux interrompu.
- **WE MISSED THE END** : deux chaises pliantes tournées vers un cadre vide, ligne bordeaux qui
  s'arrête avant la deuxième chaise.
- **NO ONE NOTICED** : banc vide, enveloppe bordeaux, trois silhouettes très lointaines.

Mode utilisé : outil ImageGen intégré. Une passe `background-extraction` a été appliquée aux
deux fichiers qui avaient initialement dessiné un damier au lieu d'un vrai canal alpha.
