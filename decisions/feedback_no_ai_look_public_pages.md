---
name: feedback_no_ai_look_public_pages
description: "Valentin : pas de « style IA » sur les pages publiques — zéro emoji, tirets sobres, ton calme (site, README d'org, marketing)"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 0e0d3b89-02b8-4072-bcd9-befd7c081403
  modified: 2026-10-06T16:43:35.209Z
---

Retour de Valentin (2026-07-08, à propos de la page jeu du site et du README d'organisation) : « le site fait trop IA je pense (à cause des emoji et des tirets etc) faudrait changer ».

**Why :** les tics d'écriture assistant (emojis en puces/titres 🏭✨🎮, densité de tirets cadratins « — », listes symétriques en « **Gras** — explication », ton sur-enthousiaste) signalent immédiatement un texte généré et cassent la crédibilité d'un site de jeu indé. C'est le pendant « écrit » de son retour de juin sur l'UI du jeu (« pas un truc en mode IA », cf [[project_bloomstead]] MàJ 4).

**How to apply :** sur TOUT support public de Bloomstead (site bloodstead.github.io, profil d'org GitHub, textes de store, posts) — aucun emoji, phrases simples terminées par des points, tirets rares, puces en prose plate sans motif gras-deux-points répété, ton posé de dev solo plutôt que plaquette marketing. Corrigé le 2026-07-08 sur game.html (site 54d2288) et profile/README.md (org 7c92e31). `STORE_TEXT.md` garde pour l'instant des puces en gras (convention lisibilité Steam) — à dépouiller aussi si Valentin le demande.

**Extension 06/10/2026 (projet IMT Cloud, textes lus par le prof : mail, README du zip, estimation de coûts)** : « le text il fait vachement IA genre les : etc change ça ». Donc, pour TOUT texte destiné à un tiers (prof, client, public), pas de structures « Mot : explication » en rafale, pas de listes « Titre : détail », pas de « Leviers : ... », pas de point-virgules en série ; des phrases simples avec des points, des parenthèses ou des virgules. Les deux-points restent OK dans un tableau ou un libellé technique isolé. Voir [[project_imt_cloud_devops]].

**Extension « surtout dans le contenu » (même jour) : les tirets cadratins sont bannis AUSSI des notes de version** — `tools/publish_release.py` convertit désormais tout seul (« scope — texte » → « scope: texte », premier « — » d'une entrée → « : » s'il n'y a pas déjà de deux-points, les autres → virgules) et les sections déjà publiées (v1.3.1→v1.3.8) ont été réécrites sur versions.html (0 cadratin en ligne, vérifié). Conséquence pour MOI : écrire les sujets de commit feat/fix/perf/ui/ux SANS « — » (ils deviennent le texte public des notes) ; le filet du script rattrape les oublis.

**Extension 28/10/2026 (brouillons Slack K-Words, réponse à Harry sur Media.net)** : « dis moi un petit message sans : et tt ». Un brouillon de message d'équipe = court (4 à 6 phrases), aucun deux-points, aucune puce, aucun gras, une seule idée par phrase, ton de collègue. Les tableaux et le détail restent dans ma réponse à Valentin, pas dans le message.
Même échange, 2e retour : « un peu qui fait moins IA pas de date ou quoi ». Donc dans un message Slack pas de dates ni d'heures précises, pas de chiffres rapportés, registre oral de collègue (phrases courtes, « du coup », question directe à la fin), les faits précis restent dans ma réponse à Valentin.

**Extension 10/11/2026 (boutique Plafond Céleste)** : « "on éteint, le plafond s'allume" ça fait bcp IA non? ». Les slogans en antithèse ou en symétrie (« On éteint, le plafond s'allume », « Un geste, quatre ambiances », « Le coucher devient le moment préféré », « X, Y » en miroir) sonnent texte généré. Préférer des titres simples et descriptifs qui disent ce qu'on voit (« Ce que ça donne au plafond », « Pour l'histoire du soir », kicker « En vidéo »), et des phrases concrètes plutôt que des formules. Vaut pour toute boutique ou page de vente.
