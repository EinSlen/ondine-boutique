# Plan complet, tout délégué

Établi le 6 août 2026. Chiffres mesurés, pas estimés, sauf mention contraire.
Objectif : 10 000 EUR nets par mois, extensible vers 100 000.

Tous les calculs sont rejouables : `node recherche/pnl-complet.mjs [ventes]`,
`node recherche/croissance.mjs`, `node recherche/plan-delegue.mjs`.

---

## 1. Le produit

**Niveau laser vert 4x360 degrés, 16 lignes, autonivelant, avec trépied.**

| Donnée | Valeur | Source |
|---|---|---|
| Prix de vente marché | 79,99 EUR TTC | Amazon FR, annonce à 500 ventes/mois |
| Marché mesuré | ~2 500 achats/mois | 7 requêtes recoupées |
| Coût départ usine | 11,37 EUR | Alibaba, MOQ 10 |
| Concurrents identifiés | 10 annonces du même générique | de 36,29 à 79,99 EUR |

Le choix repose sur un point contre-intuitif : dix vendeurs sur le même produit ne prouvent
pas que la place est prise, ils prouvent que le marché fonctionne et qu'il absorbe le volume.
Sur environ 190 familles mesurées, c'est le seul produit qui réunit un marché assez large et
une marge assez épaisse.

---

## 2. L'économie réelle, par unité

| Poste | Montant |
|---|---|
| Prix de vente TTC | 79,99 |
| TVA collectée, reversée à l'État | -13,33 |
| **Chiffre d'affaires HT** | **66,66** |
| Produit départ usine | -11,37 |
| Fret maritime (1,8 kg) | -2,70 |
| Droits de douane 3,5 % | -0,49 |
| Envoi du stock chez Amazon | -0,45 |
| Commission Amazon 15 % | -12,00 |
| Frais FBA préparation et expédition | -5,50 |
| Stockage | -0,35 |
| Amazon Ads 8 % | -6,40 |
| Retours 6 %, provision | -2,40 |
| Casse et perte 2 % | -0,29 |
| Éco-participation DEEE | -0,55 |
| Contribution emballages Citeo | -0,12 |
| **Marge brute** | **24,04** |

Charges fixes : 340 EUR par mois (détail en section 4).

Le modèle sans manipulation ajoute l'inspection et les photos déléguées, soit 4,01 EUR par
unité sur la première commande de 70 pièces, puis 1,63 EUR en routine (inspection une
commande sur trois, photos amorties sur 500 unités) :

| | Marge brute | Ventes pour 10 000 EUR nets |
|---|---|---|
| Première commande | 20,03 EUR | 683 |
| Régime de croisière | **22,41 EUR** | **611**, soit 24 % du marché |

---

## 3. Montage juridique

La micro-entreprise est **exclue** : le plafond de 203 100 EUR de chiffre d'affaires est
dépassé dès 8 500 EUR de ventes mensuelles, et les cotisations de 12,3 % portent sur le
chiffre d'affaires, pas sur le bénéfice, ce qui coûte 3 690 EUR par mois à ce niveau contre
2 169 EUR d'impôt en société.

**Forme retenue : SASU ou EURL.** SASU si tu veux rester assimilé salarié et ne pas cotiser
tant que tu ne te rémunères pas. EURL si tu prévois de te verser un revenu régulier, les
cotisations TNS étant moins chères.

À prévoir dès le départ :
- Immatriculation au guichet unique INPI, 1 à 3 semaines
- Capital social symbolique possible (1 EUR), mais 500 à 1 000 EUR rassure les partenaires
- Assujettissement à la TVA dès le départ : elle devient récupérable sur les achats et l'import
- Guichet OSS si vente vers l'Allemagne, l'Italie ou l'Espagne (phase 3)

---

## 4. Qui fait quoi

| Tâche | Délégué à | Coût |
|---|---|---|
| Stockage | Amazon FBA | 0,35 EUR/unité/mois |
| Préparation et expédition | Amazon FBA | 5,50 EUR/commande |
| Retours et remboursements | Amazon FBA | inclus |
| Service client niveau 1 | Amazon FBA | inclus |
| Transport Chine vers France | Transitaire | 1,50 EUR/kg maritime |
| Douane et documents | Transitaire | inclus dans le fret |
| Comptabilité, bilan, TVA | Expert-comptable | 120 EUR/mois |
| Fiches produit, SEO, traductions | IA | 40 EUR/mois d'outils |
| Visuels et vidéos | IA sur photos fournisseur | inclus |
| Conformité DEEE et emballages | Éco-organisme | 15 EUR/mois + contribution |

**Charges fixes mensuelles : 340 EUR**, dont expert-comptable 120, Amazon Seller Pro 39,
Shopify 32, RC professionnelle 45, GS1 13, éco-organismes 15, médiateur 6, outils IA 40,
banque 20, divers 10.

### Ce qui ne peut pas être délégué

1. Immatriculation et signature des documents légaux
2. Ouverture des comptes : banque professionnelle, Amazon Seller, transitaire
3. Validation des échantillons et du marquage CE avant la commande
4. Paiement des commandes fournisseur
5. Décisions de prix et arbitrages

---

## 5. Le marketing par IA

### Autorisé et efficace

- Titres, bullet points et descriptions Amazon optimisés pour la recherche
- Fiches produit longues, FAQ, emails de suivi, réponses SAV type
- Traduction vers l'allemand, l'italien et l'espagnol en phase 3
- Détourage, nettoyage et mise sur fond blanc des photos **du fournisseur**
- Mise en scène du **vrai** produit dans un décor généré, si le produit reste fidèle
- Clips verticaux animés à partir des photos fournisseur : `stills-to-video.mjs` est déjà écrit
- Textes publicitaires et variantes d'accroches à tester

### Interdit

- **Générer une image d'un produit qui n'est pas exactement celui expédié.** Publicité
  trompeuse, article L121-2 du code de la consommation. C'est aussi un tueur de conversion :
  le client reçoit autre chose que ce qu'il a vu.
- **Inventer des avis clients.** Pratique commerciale trompeuse, sanction pénale, et
  suspension immédiate du compte Amazon.
- **Reprendre les performances annoncées par le fournisseur sans les vérifier** (portée,
  précision, autonomie). C'est toi qui en réponds en tant qu'importateur.

---

## 6. Checklist de lancement

### Étape 1, valider le produit sans jamais le toucher, environ 470 EUR

Tu ne manipules aucune marchandise. L'échantillon faisait trois choses, chacune est reprise
par un prestataire. Détail : `node recherche/sans-echantillon.mjs`.

- [ ] Exiger du fournisseur, **avant toute commande** : déclaration UE de conformité,
      rapport de test EN 60825-1 (sécurité laser), certificat CE, RoHS. Un fournisseur qui
      ne les a pas est éliminé, sans discussion.
- [ ] Commander une inspection en usine avant expédition auprès de **QIMA, SGS ou Bureau
      Veritas**, niveau AQL II, environ 250 EUR. Le rapport arrive avec photos et mesures.
- [ ] Valider ou refuser le lot sur la base du rapport, **avant de payer le solde**.
- [ ] Faire livrer une unité à un studio photo produit (environ 220 EUR) qui shoote et
      renvoie les fichiers. Le studio reçoit, photographie, archive ou détruit : tu ne
      touches rien et tu obtiens des visuels du produit réel, pas des photos fournisseur.

L'inspection est plus fiable qu'un échantillon : elle porte sur le lot expédié, pas sur une
pièce choisie par le vendeur.

### Étape 2, monter la structure, 3 à 6 semaines

- [ ] Immatriculation SASU ou EURL au guichet unique INPI
- [ ] Compte bancaire professionnel
- [ ] Assurance responsabilité civile professionnelle (exigée par Amazon au-delà d'un seuil)
- [ ] Adhésion à un éco-organisme DEEE (Ecologic ou Ecosystem) et à Citeo
- [ ] Codes-barres GS1 (obligatoires pour créer les fiches Amazon)
- [ ] Adhésion à un médiateur de la consommation
- [ ] Compte Amazon Seller Pro, vérification d'identité comprise
- [ ] Expert-comptable

### Étape 3, première commande commerciale, environ 900 EUR

- [ ] 50 à 70 unités, fret aérien pour raccourcir le cycle
- [ ] Étiquettes FNSKU Amazon **posées en usine par le fournisseur**, jamais par toi
- [ ] Le transitaire enlève en usine et livre **directement à l'entrepôt Amazon**
- [ ] Fiches produit rédigées par IA, visuels issus du studio photo
- [ ] Lancement Amazon Ads à budget serré, 10 à 15 EUR par jour

### Le circuit complet, personne ne touche le produit sauf les prestataires

1. Tu commandes en ligne, paiement par virement ou Alibaba Trade Assurance
2. Le fournisseur produit, QIMA inspecte dans l'usine et envoie un rapport photo
3. Tu valides ou refuses sur le rapport, avant paiement du solde
4. Le transitaire enlève en usine, gère fret, douane et TVA à l'import
5. Livraison directe à l'entrepôt Amazon, étiquettes déjà posées
6. Amazon réceptionne, stocke, expédie, gère retours et service client
7. Amazon reverse tous les 14 jours sur le compte professionnel

**Ce qui reste à ta charge, et c'est tout** : passer la commande et payer, lire le rapport
d'inspection et dire oui ou non, valider les fiches rédigées par IA, suivre la trésorerie.
Tout se fait en ligne.

### Étape 4, industrialiser

- [ ] Passer au maritime dès que la trésorerie dépasse 4 000 EUR
- [ ] Ajouter les accessoires : trépied, lunettes de visée, mire, cellule
- [ ] Ouvrir Shopify en second canal, marge supérieure et relation client
- [ ] Ouvrir l'Allemagne, l'Italie et l'Espagne via le paneuropéen, guichet OSS

---

## 7. Trajectoire et trésorerie

Simulation par réinvestissement intégral, départ 1 682 EUR (`node recherche/croissance.mjs`) :

| Cycle | Fret | Unités | Ventes/mois | Net/mois | Trésorerie |
|---|---|---|---|---|---|
| 1 | aérien | 72 | 72 | 1 182 | 2 864 |
| 2 | aérien | 122 | 122 | 2 204 | 5 068 |
| 3 | maritime | 295 | 148 | 2 725 | 10 518 |
| 4 | maritime | 614 | 307 | 5 984 | 22 487 |
| 5 | maritime | 1 312 | 625 | 12 482 | 47 451 |

**10 000 EUR nets par mois vers le mois 8 à 12**, sans capital extérieur.

C'est un scénario favorable : il suppose que le stock s'écoule au rythme prévu. Un compte
neuf sans avis démarre plus lentement, compter 2 à 3 mois de rodage supplémentaires.

Le facteur limitant est le délai de réapprovisionnement, pas la demande : en maritime, la
trésorerie ne tourne que six fois par an.

---

## 8. Risques et parades

| Risque | Gravité | Parade |
|---|---|---|
| Guerre des prix (prix déjà convergé) | élevée | Se différencier par la gamme et le service, pas par le prix |
| Suspension du compte Amazon | élevée | Ouvrir Shopify en second canal dès la phase 2 |
| Produit non conforme CE | élevée | Ne jamais commander sans déclaration écrite, tester les échantillons |
| Rupture de stock | moyenne | Recommander à 45 jours de couverture restante |
| Litige produit laser | moyenne | RC professionnelle, classe 2 vérifiée, notice en français |
| Blocage en douane | moyenne | Transitaire déclarant, HS code correct |
| Trésorerie immobilisée | élevée | Ne jamais commander plus de 85 % de la trésorerie disponible |

---

## 9. Ce qui reste incertain

Trois chiffres du plan sont des hypothèses, pas des mesures :

1. **La part de marché.** 23 % du marché mesuré pour atteindre l'objectif. Le leader actuel
   en détient environ 20 % à lui seul, donc c'est plausible, mais non garanti.
2. **Le coût de 11,37 EUR.** Il vient d'une annonce Alibaba, pas d'un devis signé. À
   confirmer, marquage CE compris, avant tout engagement.
3. **Le taux de retour de 6 %** et le budget publicitaire de 8 % du chiffre d'affaires sont
   des moyennes de catégorie, pas des mesures sur ce produit.

Le premier pas à 200 EUR existe précisément pour lever le deuxième point sans risque.
