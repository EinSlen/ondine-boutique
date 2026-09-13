# Noms de marque, disponibilité vérifiée

> **DÉCISION DU 21/08 : la marque s'appelle `dead2me`, domaine `dead2me.fr`.**
> Pseudo TikTok de marque `@dead2mewear` (le `@dead2me` nu est un compte vide déjà pris).
> Risque pub faible : « dead to me » est un idiome, pas de la violence ; le refus de live2die
> venait de ses visuels (armes, sang), pas de son nom. Rester sobre sur les images.
> Ce qui suit est l'historique de recherche, conservé pour la méthode.


Vérifications du 21 août 2026 par `mesures/noms.mjs`. Les domaines sont interrogés en RDAP
directement auprès des registres (Verisign pour le `.com`, Afnic pour le `.fr`), pas chez un
revendeur, donc un « libre » est fiable. Le pseudo TikTok est vérifié sur la page publique.

60 noms testés, **12 finalistes** ont le `.com`, le `.fr` et le pseudo TikTok libres.

## Les 12 finalistes

| Nom | Ce que le nom dit | Registre |
|---|---|---|
| **jamaisdeux** | jamais deux fois la même pièce, et l'écho de « jamais deux sans trois » | mémorable, grand public |
| **contrepreuve** | contre-épreuve, terme de gravure, tirage unique obtenu par report | art, justifie un prix haut |
| **etatunique** | état unique, l'état d'une planche gravée à un instant donné | art |
| **horstirage** | hors tirage, ce qui sort de l'édition | art |
| **epreuvezero** | épreuve zéro, l'exemplaire avant le tirage | art |
| **epreuveunique** | épreuve unique, explicite | art, un peu descriptif |
| **tirageun** | tirage 1, la numérotation comme identité | neutre, court |
| **piecelibre** | pièce libre, jeu sur pièce unique | neutre |
| **sansdouble** | sans double, aucun exemplaire identique | clair, un peu plat |
| **dernierpoint** | dernier point, la fin d'une histoire et un point de couture | narratif |
| **rienapres** | rien après, la narration de fin | narratif, proche de live2die |
| **restesansmoi** | reste sans moi, phrase POV complète | narratif, long |

## Recommandation

**jamaisdeux**, et `jamaisdeux.fr` en domaine principal.

Le goulot du modèle est l'acquisition, pas le produit. Ce qui compte donc est qu'un nom
entendu dans une vidéo se retienne et se retape correctement dans une barre de recherche.
« Jamais deux » s'accroche à un proverbe que tout francophone connaît, s'écrit sans piège, et
dit le modèle économique en deux mots. Il fonctionne aussi comme accroche : « jamais deux fois
la même », « il n'y en aura jamais deux ».

**contrepreuve** est le second choix, et le meilleur si tu veux assumer le positionnement
art et vendre à 159 € plutôt qu'à 129 €. C'est un vrai terme de gravure, il porte la
crédibilité d'atelier. Il se retient moins bien à l'oral pour une audience de 20 ans.

À écarter : `epreuveunique` et `sansdouble` décrivent au lieu de nommer, et un nom descriptif
est refusé au dépôt de marque plus souvent qu'un nom évocateur.

## Deux vérifications qui restent à faire à la main

1. **Instagram.** Le test automatique renvoie « indéterminé » : Instagram sert un mur de
   connexion sur toutes les URL, y compris les comptes inexistants. Il faut ouvrir
   `instagram.com/lenom` dans un navigateur connecté, cela prend 10 secondes par nom.
2. **Marque déposée.** Un domaine libre ne dit rien sur les droits. Recherche gratuite sur
   `data.inpi.fr`, classe 25 (vêtements), plus une recherche EUIPO. Aucune marque textile
   évidente n'est ressortie pour « jamais deux » ni « contre-épreuve », mais une recherche web
   n'est pas une recherche d'antériorité. Le dépôt INPI en classe 25 coûte 190 € pour une
   classe. Il n'est pas obligatoire pour lancer, il le devient quand la marque a de la valeur.

## Rejouer ou tester d'autres noms

```
cd mesures
node noms.mjs                    # les 60 noms, résultats en cache dans noms.json
node noms.mjs monnom autrenom    # teste des noms à la demande
```

Les candidats sont dans `mesures/noms-candidats.json`, ajoutes-en et relance : les noms déjà
mesurés sont ignorés.
