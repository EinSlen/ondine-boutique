---
name: reference-margin-formula-micro
description: "Formule de marge par vente corrigée le 9/11/2026 ; l'ancienne « prix x 0,806 - coût - 5 » oubliait l'URSSAF et supposait la TVA collectée"
metadata:
  node_type: memory
  type: reference
  originSessionId: 66313848-da54-4e44-a4d0-4c5ea1a97dfa
  modified: 2026-11-09T18:32:10.744Z
---

Le 9/11/2026, à « t'es sûr ? » sur l'appareil photo instantané ([[project-instant-print-camera-20261109]]), revérification de la formule utilisée depuis octobre (travertin, lune, nichoir, etc.) : `prix x 0,806 - coût - 5` retire TVA 20 % + frais de paiement, mais **oublie les cotisations URSSAF** de la micro-entreprise et **suppose qu'on facture la TVA**, alors qu'une micro en franchise en base ne la facture pas.

Formule à utiliser (hypothèses de sources secondaires, à revérifier sur urssaf.fr / service-public) :
- micro en franchise de TVA (seuil ventes de marchandises 85 000 € en 2026) : `reste = P - (1,5 % P + 0,25) - 12,5 % P - coût AliExpress TTC - 5`
- assujetti à la TVA : `reste = P/1,2 - (1,5 % P + 0,25) - 12,5 % (P/1,2) - coût - 5`
- URSSAF vente de marchandises 12,3 % du CA + CFP ~0,1-0,2 % ; Shopify Payments Basic cartes UE ~1,5 % + 0,25 € ; 5 € = droit UE 3 € + frais de gestion 2 € par catégorie d'article.
- non compté : abonnement Shopify, retours et pannes, impôt sur le revenu, emballage.

Écart constaté : à 34,90 € avec 19,49 € d'achat, ancienne formule +3,64 €, franchise +5,27 €, assujetti +0,18 €. À 49,90 € avec 25 € d'achat : ancienne +10,22, franchise +12,66, assujetti +5,39.

**How to apply:** pour toute marge future, utiliser la formule franchise (cas de Valentin, micro pas encore créée) et donner l'assujetti à côté ; rappeler que les marges annoncées avant le 9/11 (travertin, lune, nichoir, pistolet) n'incluaient pas l'URSSAF. Toujours « sur le papier » ([[feedback_profit_never_sure]]).


Résumé repris de l index (compacté le 12/11/2026) : l'ancienne x0,806 oubliait l'URSSAF 12,5 % et supposait la TVA ; micro en franchise : P - 1,5 % P - 0,25 - 12,5 % P - coût - 5
