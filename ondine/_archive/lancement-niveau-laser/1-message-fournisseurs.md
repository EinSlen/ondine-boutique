# Message à envoyer aux fournisseurs

À copier-coller tel quel dans la messagerie Alibaba, à 6 à 8 fournisseurs en parallèle.
Ne rien modifier : chaque paragraphe filtre un risque identifié.

Les fournisseurs à contacter sont dans `fournisseurs.json`. Priorité aux « verifie »
(Verified Supplier), et **écarter d'office celui à 40 mW** : c'est un laser classe 3B,
interdit à la vente grand public en Europe.

---

## Message 1, premier contact

Objet : `4D 16-line green laser level - EU import inquiry - CE documents required`

```
Hello,

We are a French company preparing to sell your 4D 16-line green laser level with tripod
on Amazon France. Before requesting a quotation, we need to confirm compliance, as we
will be the legal importer in the European Union.

Please send the following documents. We cannot proceed without them:

1. EU Declaration of Conformity (DoC) for this exact model
2. Test report to EN 60825-1 (laser safety) from an accredited laboratory
3. Confirmation of the laser class. We require CLASS 2, output below 1 mW.
   We will not purchase any product above Class 2.
4. CE marking evidence and RoHS test report
5. Battery specification: cell chemistry, capacity, and UN38.3 transport report

Once we have these, please quote:

- Unit price FOB for 70, 300 and 1000 pieces
- Exact carton dimensions, gross weight, and units per carton
- Production lead time
- Whether you can apply our Amazon FNSKU barcode labels in your factory
- Whether you can ship directly to an Amazon FBA warehouse in France
- Payment terms, and whether Alibaba Trade Assurance is accepted

We will have the goods inspected in your factory by QIMA or SGS before shipment,
at our cost, with AQL level II. Please confirm you accept third-party inspection.

Best regards,
```

---

## Message 2, après réception des documents

À n'envoyer qu'aux fournisseurs ayant fourni les cinq documents.

```
Hello,

Thank you for the documents. We would like to move forward with a first order of
70 pieces, air freight, delivered to an Amazon FBA warehouse in France.

Please confirm:

1. Final unit price FOB and total for 70 pieces
2. Our FNSKU labels applied in your factory, one per unit, and a carton label per box
3. Retail packaging: is the manual available in French? If not, we will provide the
   translated file for you to print.
4. Production time and the date the goods will be ready for inspection
5. Deposit percentage, balance payable after we approve the inspection report

We confirm the order will be paid through Alibaba Trade Assurance, with the balance
released only after a satisfactory QIMA inspection report.

Best regards,
```

---

## Ce que chaque paragraphe protège

| Demande | Risque couvert |
|---|---|
| Déclaration UE de conformité | Ta responsabilité d'importateur, exigible par la DGCCRF et par Amazon |
| Rapport EN 60825-1 | Sécurité oculaire, c'est la norme laser |
| Classe 2 sous 1 mW exigée | Un fournisseur au moins propose 40 mW, soit classe 3B, illégal en vente grand public |
| Rapport UN38.3 | Sans lui, la batterie lithium est refusée au transport |
| Étiquetage FNSKU en usine | Sinon tu dois manipuler la marchandise, ce que tu refuses |
| Expédition directe vers Amazon | Idem, tu ne touches jamais le produit |
| Inspection tierce acceptée | Un fournisseur qui refuse l'inspection a quelque chose à cacher |
| Solde après rapport favorable | Ton seul levier si le lot est mauvais |
