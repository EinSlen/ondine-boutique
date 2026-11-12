# KapsulCam (boutique lancée le 15/10/2026)

Boutique Shopify `0rsiku-r1.myshopify.com` (ex-dead2me, reconvertie le 15/10/2026).
Produit unique : mini caméra POV 4K « gélule », fournisseur Alibaba.

## Produit et fournisseur

- Fiche Alibaba `1601458150385` (Shenzhen Ksl, modèle H88), variante **Multi-pack SANS CARTE SD, 4K**,
  noir ou blanc : 26,59 EUR port offert vers la France, livraison 9 à 24 jours.
  Le multi-pack contient caisson étanche 30 m, collier magnétique, clip, bracelet, support guidon, câble.
- La même caméra coûte 45,99 à 47,39 EUR sur AliExpress : rester sur Alibaba.
- Concurrents vus dans la Bibliothèque publicitaire Meta le 15/10 : EyesPRO (eyespro.co, 89,99 EUR seule,
  98,90 EUR le pack, 18 pubs actives depuis le 19/09) et Moovora (moovora.fr, pubs depuis décembre 2025).

## Prix et variantes Shopify (`produit.mjs`, `accessoires.mjs`)

| SKU | Offre | Prix | Barré |
|---|---|---|---|
| KC4K-NOIR / KC4K-BLANC | Caméra + accessoires | 89,90 | |
| KC4K-NOIR-PACK / -BLANC-PACK | Pack Complet : + microSD 64 Go + perche-trépied | 109,90 | 134,70 |
| KC4K-NOIR-DUO / -BLANC-DUO | Duo : 2 caméras | 159,90 | 179,80 |
| KC-SD64 | Carte microSD 64 Go seule | 19,90 | |
| KC-PERCHE | Perche-trépied 3 en 1 seule | 24,90 | |

Prix barrés LÉGAUX : ce sont les prix réels des mêmes articles achetés séparément sur la boutique
(89,90 + 19,90 + 24,90 = 134,70 ; 2 x 89,90 = 179,80), mention affichée sous les offres. Ne jamais
mettre un prix de référence auquel rien n'a été vendu (L112-1-1, directive Omnibus) ; refusé le 15/10
malgré EyesPRO qui barre 149,99. Les deux accessoires doivent rester en vente sinon les barrés tombent.

Zone d'achat façon EyesPRO : `theme/kc-buybox.liquid` (cartes couleur et offre qui pilotent le
sélecteur Dawn caché, date de livraison calculée à 10-18 jours ouvrés, prix dans le bouton) et
`theme/kc-trust.liquid`, envoyés par `upload-assets.mjs`. Pas de faux compte à rebours, pas de faux avis.

## Traiter une commande

1. `node commandes.mjs` : affiche pour chaque commande payée non expédiée le message anglais prêt à coller au fournisseur (couleur, quantité, adresse, téléphone) et ce qui reste à commander ailleurs (SD, perche).
2. Alibaba, fiche `1601458150385` (Nora Lee, Shenzhen Ksl) : variante « Multi-pack SANS CARTE SD » couleur + 4K, quantité 1, adresse de livraison = celle du client. 26,59 EUR livraison gratuite, DDP France (TVA éventuelle visible au paiement). Nora a confirmé le 15/10 : commande sur la fiche OK quand c'est moins cher que son devis, envoi neutre sans marque ni infos usine. Devis direct (si la fiche ne convient pas) : caméra 45,83 USD, caméra+carte+perche 65,55 USD, Duo 87,06 USD, carte+perche seules 27,36 USD, tout compris vers l'UE (facture Alibaba envoyée après la liste des commandes).
3. Pack Complet : commander aussi sur Amazon.fr, livrés au client, une microSD 64 Go **U3 / V30** (SanDisk Extreme, pas Ultra qui est U1) et une perche-trépied à fixation action cam. Duo : quantité 2 sur Alibaba.
4. Dès qu'Alibaba donne le numéro de suivi : Shopify > commande > « Traiter la commande » > coller le suivi
   (le client reçoit l'e-mail automatiquement).

## Ce qui a été fait le 15/10

- Thème Dawn 15.5.0 `KapsulCam` (id 190830182728) publié, templates dans `theme/` (`build-templates.mjs`).
  Le zip Dawn n'est accepté qu'hébergé sur cdn.shopify.com (codeload GitHub répond « src is empty »).
- Images du carrousel : `slides.mjs` -> `carrousel/`, hébergées comme assets du thème (`images-cdn.json`).
- Pages : livraison-et-retours, nous-contacter, mentions-legales et conditions-de-vente (ces deux-là
  restent non publiées tant que `identite.json` n'a pas adresse + téléphone).
- Menus `kc-main` et `kc-footer`. Livraison France : gratuite, 10 à 18 jours ouvrés. Express supprimé.
- Format de prix « 89,90 € ». Nom de boutique KapsulCam.
- `bascule.mjs --revenir` remet dead2me (12 produits réactivés, ancien thème) depuis `etat-dead2me-avant.json`.
- Google Ads préparé : `google-ads.json` (15 titres, 4 descriptions, 5 groupes, exclusions).

## Reste à faire

- Valentin : terminer Shopify Payments (identité + IBAN), créer les comptes Google Ads et Merchant Center,
  carte dans Google Ads, compte Alibaba acheteur.
- Vidéos produit (VTT, mer, piscine) : générateur payant à choisir (Higgsfield essai, Hailuo, Kling).
- SIRET dès les premières ventes (Valentin l'a prévu après 100 à 200 EUR de ventes), éco-organisme DEEE,
  médiateur de la consommation.

## Refonte « mer » et conversion (15/10 après-midi)

- Accueil : produit en premier, puis vidéo plein écran `theme/kc-hero.liquid` (boucle Mixkit 16:9 et 9:16
  dans `videos/`), « Prête en 3 secondes » `kc-etapes.liquid`, 4 vidéos d'activités `kc-activites.liquid`,
  chiffres clés, comparatif, FAQ. Les vidéos Mixkit sont de l'ambiance : ne jamais écrire « filmé avec KapsulCam ».
- Barre d'achat collante `kc-sticky.liquid` (écouteur de défilement : l'IntersectionObserver ne se déclenchait pas),
  suggestion microSD dans le panier `kc-upsell.liquid` (rendue dans `snippets/cart-drawer.liquid`).
- Logos de paiement mis en dur (CB, Visa, Mastercard, Amex, Apple Pay, Google Pay, Shop Pay) dans `kc-trust`
  et le pied de page : `shop.enabled_payment_types` est vide tant que Shopify Payments n'est pas terminé.
- Mention « propulsé par Shopify » retirée de `sections/footer.liquid`. Favicon `kc-favicon.png` dans `layout/theme.liquid`.
- SEO : titre et description de l'accueil dans `layout/theme.liquid`, blog `journal` + 3 articles (`blog.mjs`),
  anciennes pages/collections dead2me et VELNUIT dépubliées (`nettoyage-seo.mjs`, `--revenir`), langue anglaise
  dépubliée dans l'admin (Paramètres > Langues).
- Recherche concurrents (agent, 15/10) : Moovora, EyesPRO, The POV Pro, CamPro, Cosy2Road utilisent tous faux
  comptes à rebours, prix barrés -50 % permanents ou chiffres invérifiables. Aucun volume de vente prouvé.

## Style Moovora (15/10 fin d'après-midi)

- Logo « Intepoll » effacé des photos (`fournisseur/a11-clean.jpg`, inpainting OpenCV) et découpes du pack sur fond
  transparent dans `decoupes/`. ATTENTION : la caméra réelle porte le logo Intepoll tant que le fournisseur ne livre
  pas sans marquage, message prêt dans `message-fournisseur.txt`.
- Carrousel v2 `slides2.mjs` -> `carrousel2/` (12 visuels : univers mer/VTT/moto/neige, contenu du pack, étanche...),
  posé par `carrousel-v2.mjs` (remplace les médias, relie Noir/Blanc).
- Thème : Barlow (barlow_n8 / barlow_n5), accent orange #F26B1D sur bleu nuit, bandeau orange 4 messages,
  vignettes dans les cartes d'offre (`buybox/kc-offre-*.png`).
- Refusé : faux badge Trustpilot, logos MotoGP/Tour de France, faux comptes à rebours (Moovora affiche 4,8/851 alors
  que Trustpilot donne 2,2/5 sur 64 avis le 15/10).

## Design immersif sombre (15/10 soir)

- Thème entier en bleu nuit (#04192B), accent orange. Fond vidéo sous-marin derrière le produit (injecté par
  `kc-buybox.liquid` dans la section, assombri brightness .5), panneau d'achat en verre dépoli.
- `theme/kc-univers.liquid` : 4 scènes plein écran (mer, trail, neige, route), vidéo en boucle par scène
  (`videos/kc-u-*-16x9.mp4` et `-9x16.mp4`, lancées au défilement), caméra flottante `kc-cam.png`.
  Remplace `kc-hero` et `kc-activites` sur l'accueil et la fiche (snippets gardés, plus rendus).
- Barre d'achat collante visible dès que le bouton principal sort de l'écran (au-dessus ou en dessous).
- Garantie : « Satisfait ou remboursé 30 jours* », astérisque : produit complet et non utilisé ; rétractation
  14 jours sans condition. Repris dans CGV (article 7), page livraison-et-retours, FAQ, onglet, bandeau.
- Mentions légales : Moovora affiche une adresse de domiciliation londonienne (5 Brayford Square). Proposé à
  Valentin : domiciliation française (15 à 30 EUR/mois) ou société UK. Pas d'adresse inventée.
- (15/10 nuit) Épuration après « pas sûr que ce soit beau » : fond lagon turquoise `kc-u-lagon` (Mixkit 7243)
  clair à gauche, sombre derrière la colonne ; plus de grilles d'icônes ni de pastilles numérotées dans les offres ;
  garanties en un rang sans cadres ; scènes plein écran SANS la caméra collée (vidéo + texte) ; comparatif en vrai
  tableau HTML ; logo `buybox/kc-logo.png` (gélule + KAPSULCAM) codé dans `sections/header.liquid`.
  Reste le vrai levier : photos de la caméra PORTÉE (IA Higgsfield sur la vraie photo, ou échantillon).

## Refonte claire style Loop (15/10 nuit, version en ligne)

Modèle : loopearplugs.com (fond blanc, cartes gris clair #F3F3F1 arrondies, Inter fine et grande, boutons noirs
pilule, slogan géant noir avant le pied de page). Le thème sombre est sauvegardé dans `theme/settings_data.sombre.json`.
- `settings_data.json` : scheme-1 blanc/#111, scheme-2 #F3F3F1, scheme-3/4 #111 ; Inter ; rayons 40/20. Garder les
  blocks Judge.me (`judgeme_core`) à chaque PUT de settings_data.
- En-tête blanc avec `kc-logo-dark.png`, annonce et pied de page noirs. Espacement des lettres Dawn remis à 0
  (style après `base.css` dans `layout/theme.liquid`).
- Snippets clairs : `kc-hero` (carte vidéo arrondie), `kc-buybox` (pastilles couleur, cartes d'offre, badge
  Recommandé), `kc-trust`, `kc-sticky`, `kc-upsell`, `kc-activites` (4 vidéos), `kc-etapes`, `kc-banner`
  (« VIVEZ. ELLE FILME. », Barlow Condensed). `kc-univers` n'est plus rendu.
- Carrousel v3 (`slides3.mjs` puis `carrousel-v3.mjs`) : packshot noir, ski, contenu de la boîte, plongée, collier,
  sac, poignet, fiche technique, packshot blanc. `hide_variants: true` : seule la photo de la couleur choisie s'affiche.
- Envoi : `node tpl.mjs put snippets/<x>.liquid theme/<x>.liquid`, puis `node theme/build-templates.mjs` (écrit en
  local seulement) et `node tpl.mjs put templates/product.json theme/product.json` (idem index.json).
- Contrôle visuel : captures pleine page 1440 et 390 px (Edge headless), vérifiées le 15/10.

## Avis, retours, e-mail (15/10 après-midi)

- Avis : Judge.me gratuit. L'importeur AliExpress de Judge.me invente des noms et date les avis du jour : ne pas
  l'utiliser. `avis-ali.mjs` récupère les avis d'origine (noms masqués, vraies dates), `avis-csv.mjs` garde la seule
  version 4K et écrit `avis/judgeme-import.csv`, importé via Judge.me > Importer > Feuille de calcul (identifiant
  produit = product_handle). 12 avis importés. Mention de provenance au-dessus (section `avisNote`).
- Rétractation 14 jours : jamais affichée sur la fiche, l'accueil, la FAQ ni « Livraison et retours » (demande de
  Valentin, comme moovora.fr). Le texte légal vit uniquement dans la page `politique-de-retour-et-de-remboursement`
  (`politique-retour.mjs`), reliée en bas de page. Le jeton n'a pas `write_legal_policies` (pas de politique Shopify).
- E-mail : ne plus afficher valentin.damlencour4@gmail.com. `pages.mjs` lit `email` dans `identite.json`. Il reste
  l'e-mail de contact de la boutique (réglages Shopify, politique de confidentialité générée) à changer.

## Chat, accueil, retours (15/10 fin d'après-midi)

- Chat : Shopify Inbox (gratuit). Visiteurs sans compte (nom + e-mail), message d'accueil sans emoji, bulle noire
  « Plus haute » pour ne pas couvrir la barre d'achat. Agent IA Shopify actif sur toutes les conversations ; il lit
  la Knowledge Base (appli Shopify gratuite) où `chat-faq.mjs` a ajouté 10 réponses (délais, pays, retours 30 j,
  carte mémoire, étanchéité, batterie, vidéos, contenu, garantie, contact). Le bloc Inbox est dans settings_data :
  `theme/settings_data.json` resynchronisé depuis la boutique (garder les blocs Inbox et Judge.me).
- Règles de retour Shopify (Paramètres > Politiques) : 30 jours, retour à la charge du client (étaient 14 j, gratuit).
- Avis : 2 photos de boîte retirées (avis supprimés puis réimportés via `avis/judgeme-reimport.csv`), 12 avis, 4,8.
- Accueil : photo produit collante sur ordinateur (`kc-buybox`, index seulement). `kc-sticky` est déplacée sous
  `body` au chargement (sinon la colonne animée du thème la décale au milieu de l'écran).
- Restent dans Judge.me : format de date (affiche MM/JJ/AAAA) et étoiles vertes à passer en noir.
- Politiques Shopify (Paramètres > Politiques, footer + paiement) : retour/remboursement (`politiques/retour.html`,
  identique à la page) et expédition (`politiques/expedition.html`) publiées via l'éditeur en mode code
  (`scratchpad settext.mjs`, le jeton n'a pas write_legal_policies). En attente de l'identité du vendeur :
  Coordonnées (obligatoire), Mention légale, Conditions de vente, Conditions de service. Étoiles vertes et dates
  Judge.me gardées telles quelles (choix de Valentin).
- Identité (15/10 soir) : Valentin veut le minimum légal. Nom, adresse, téléphone seulement sur la page
  `mentions-legales` et la politique Shopify « Coordonnées » (obligatoire), toutes deux noindex. CGV, conditions de
  service, confidentialité (passée en manuel, `politiques/confidentialite.html`) et « Mention légale » Shopify
  renvoient aux mentions légales. Descriptions SEO neutres sur mentions-legales et conditions-de-vente.
  Reste valentin.damlencour4@gmail.com dans le code du chat (e-mail service client Shopify) : à remplacer par
  contact@kapsulcam.com une fois le domaine acheté.

## Finitions (16/10)

- Kit `kit-carte-perche` (carte 64 Go U3 + perche-trépied, 44,80 EUR, `kit.mjs`) : Nora ne vend carte et perche
  qu'ensemble. Carte seule et perche seule passées en DRAFT. Prix barré du Pack (134,70) = caméra 89,90 + kit 44,80.
- Panier (`kc-upsell`) : caméra seule => « Passer au Pack (+20 €) » (remplace la ligne par la variante Pack de la même
  couleur) ; Duo => propose le kit. Testé.
- Fiche : onglet « Consignes de sécurité » (batterie, étanchéité, enfants, vie privée, DEEE). Fabricant NON affiché
  (choix de Valentin, GPSR non respecté en connaissance de cause).
- Panier : « Livraison offerte » au lieu de « frais d'expédition calculés à l'étape du paiement » (locales/fr.json).
- E-mail panier abandonné (Messaging) : objet « Votre KapsulCam vous attend », en-tête KapsulCam, adresse masquée.
  Expéditeur encore valentin.damlencour4@gmail.com (à remplacer par contact@kapsulcam.com, Messaging > Paramètres).
- EPROLO désinstallée. Printful et Printify gardées : les 28 vêtements dead2me/VELNUIT en brouillon en dépendent.

## Domaine, e-mail, test de commande (16/10 nuit)

- kapsulcam.com acheté (Shopify), principal, HTTPS. contact@kapsulcam.com via ImprovMX (compte de Valentin) :
  DNS Shopify MX mx1/mx2.improvmx.com, TXT SPF include:spf.improvmx.com, _dmarc p=none. E-mail boutique, contact et
  Messaging = contact@ (vérifié, domaine authentifié).
- Shopify Payments : dossier soumis, versements quotidiens vers Revolut ****3563, relevé client « SP KapsulCam ».
- Test complet le 16/10 (mode test, carte 4242) : commande #1001 reçue, e-mail de confirmation envoyé, `commandes.mjs`
  OK (ignore les commandes test sauf `--test`, références Nora), commande annulée et remboursée, mode test désactivé.
- Saison : étiquette « Idée cadeau de Noël » sur l'accueil (octobre au 24/12) et ligne « livrée avant Noël pour toute
  commande avant le 25 novembre » sur la fiche (calcul automatique : 24/12 moins 21 jours ouvrés), FAQ Noël.
- Visuels Google Ads (`pub-visuels.mjs` -> `pub/google/`) : 5 paysage 1200x628, 6 carrés, 3 portraits 960x1200, 2 logos,
  style du site, sans texte incrusté (règle Google). Aperçu : `pub/apercu-google.png`. Annonces : `google-ads.json`.

## Vidéo pub 15 s (16/10)

- `video-pub.mjs` -> `pub/video/kapsulcam-15s-16x9.mp4`, `-1x1.mp4`, `-9x16.mp4` (rendu image par image dans Edge
  headless puis ffmpeg, ~30 s par format). Aperçu des trois : `pub/video/apercu.html`.
- Scènes : ouverture sur la vidéo de mer de l'accueil (`videos/hero-*.mp4`, Mixkit, droits détenus par Valentin) avec la caméra posée devant et « Vivez le moment. Elle le filme. », ski (4K, 36 grammes), plongée (étanche 30 m), collier +
  bracelet, contenu de la boîte, fin logo + 89,90 € + livraison offerte + satisfait ou remboursé 30 jours + kapsulcam.com.
- Uniquement nos packshots et les photos du fournisseur, aucune image présentée comme filmée par la caméra. Muette.

## Images par offre (16/10)

- `offres-visuels.mjs` : détoure la vraie perche-trépied de Nora (`decoupes/trepied.png`, depuis
  `fournisseur/nora/perche-reel-1.jpg`), crée `carrousel3/10-pack-noir`, `11-pack-blanc`, `12-duo-noir`, `13-duo-blanc`
  et la vignette `buybox/kc-offre-pack.png` (caméra + carte + trépied).
- `offres-shop.mjs` : envoie la vignette dans le thème, ajoute les 4 images au produit et relie chaque variante à son
  image. Avec `hide_variants`, l'image principale suit l'offre choisie (testé en ligne à 1440 et 390 px).

## Benchmark pubs vidéo (16/10)

- `pub/benchmark/index.html` : images extraites des pubs Meta actives en France (Moovora, EyesPRO, Insta360).
- Ce qui marche : vertical 9:16, vraies images dès la première seconde (caméra clipsée, posée sur un casque, POV),
  un plan toutes les 1 à 2 s, sous-titres gras avec un mot en couleur, comparaison de prix avec une GoPro,
  déballage des accessoires, témoignage face caméra, fin courte. Pubs Moovora actives depuis avril (gagnantes).
- La pub animée « style site » (`video-pub.mjs`) est un format de grande marque : elle peut servir sur Google,
  pas comme pub principale sur Meta/TikTok.

## Pub verticale native (16/10)

- `video-native.mjs` -> `pub/video/kapsulcam-native-9x16.mp4` (15 s, 9:16). Format des pubs gagnantes : un plan par
  seconde, gros sous-titres Montserrat Black contour noir, mot clé en jaune, tutoiement.
- Vraies images de ce modèle tirées de `videos/fournisseur.mp4` (caméra aimantée sur la chemise, appui bouton, images
  POV filmées par la caméra en magasin), puis photos produit (ski, plongée, collier, poignet), « Tout est inclus »,
  « Pourquoi payer 400 € ? » sans citer de marque, fin 89,90 € + kapsulcam.com. Muette : musique à choisir dans
  l'outil de pub (bibliothèque TikTok / Meta).

## Audit juridique (16/10)

Conforme : mentions légales (éditeur, hébergeur), CGV complètes (rétractation + formulaire, garantie commerciale 30 j
distincte, vices cachés, délais), politique de retour, confidentialité RGPD, bannière cookies avec Refuser, délais de
livraison affichés, prix barrés justifiés (89,90 + 44,80 = 134,70 ; 2 x 89,90 = 179,80). La plateforme européenne RLL
a fermé en juillet 2025 : plus de lien à mettre.
À régler par Valentin : immatriculation micro-entreprise (vend déjà sans SIRET), médiateur de la consommation
(« désignation en cours » dans les CGV, amende jusqu'à 3 000 EUR), éco-organisme DEEE + piles et IDU (importateur =
producteur), GPSR fabricant / personne responsable UE + déclaration CE (RED, Wi-Fi) du fournisseur (choix de ne pas
afficher le fabricant), TVA des envois directs Chine -> Belgique / Luxembourg à valider avec un comptable.
Corrections de textes proposées : « Garantie 2 ans » -> « Garantie légale 2 ans » (fiche, accueil, Google Ads),
badge « Promotion » -> « Lot », mention « avis non vérifiés par KapsulCam », encadré officiel de la garantie légale
dans les CGV. Messages aux créateurs prêts dans `pub/messages-createurs.txt` (non envoyés).

## Licences des vidéos (16/10)

- Sur Mixkit, plusieurs plans du site sont en « Restricted License » (usage personnel) : mouette 17972, surf 21286 ou
  36833, récif 44974 (vidéo d'accueil), nageuse 27826 (tuile Mer), POV moto 31974 (tuile Moto, image du blog).
  Valentin dit avoir les droits pour ces vidéos : elles restent en ligne. Garder la preuve de licence.
- Plans à licence libre vérifiée : `videos/mixkit/` + `licences.json` (`mixkit-dl.mjs` lit la licence via Edge,
  Mixkit bloque les requêtes directes). Versions du site faites avec eux dans `videos/_libres/` et `blog/_libres/`
  (`site-videos-libres.mjs --envoyer` pour les mettre en ligne si besoin).

## Pub verticale v2 (16/10)

- `node video-native.mjs v2` -> `pub/video/kapsulcam-native-v2-9x16.mp4` (15,5 s). Accroche surf « TU VIS ÇA ? », vraie
  caméra aimantée « FILME-LE. 36 GRAMMES », appui, mains libres (images filmées par la caméra, vidéo fournisseur),
  puis surf, mer (caisson 30 m), ski, moto, VTT filmés de l'extérieur (Mixkit licence libre vérifiée, `videos/mixkit/`),
  photo casque de ski, accessoires, « POURQUOI PAYER 400 € ? », 89,90 €, fin. Aucun plan POV d'une autre caméra.

## Pub verticale v3 (16/10)

- `node video-native.mjs v3` -> `pub/video/kapsulcam-native-v3-9x16.mp4` (14,7 s). Ouvre sur la vidéo vlog du
  fournisseur (`videos/fournisseur-vlog.mp4`, fiche Alibaba 1601420267879, même boutique ksldz, même boîtier) :
  caméra sur un t-shirt « POV : JE FILME MA JOURNÉE », POV café « MAINS LIBRES », posée sur la table « 36 GRAMMES »,
  « POSE-LA, ELLE TE FILME », aimantée « ELLE TIENT PARTOUT », puis surf, mer, ski, moto, vélo (Mixkit libre), offre.
  Filigrane Alibaba et textes anglais effacés (delogo) puis couverts par nos sous-titres : autorisé par Valentin.

## Nora 16/10 matin

- ERP : possible, ils mettent à jour le suivi dans Shopify ; noter le numéro de commande Shopify sur chaque commande
  Alibaba ; e-mail ERP 864982199@qq.com (accès à la boutique = décision de Valentin).
- Prix Alibaba seulement avec paiement sur Alibaba ; pas de facture par commande (prix variable selon le pays).
- GPSR : étiquette sur le produit (marque, modèle, fabricant, personne responsable UE), avec nos infos ou les leurs.
- TVA : saisir un numéro de TVA sur Alibaba pour ne pas payer la taxe UE (pas de numéro tant que pas de SIRET).
- Déclaration CE : pas encore répondu.

## Google Ads en ligne (16/10)

- Compte Google Ads 652-100-7295 (KapsulCam, mode Expert, France, EUR, Mastercard de Valentin, offre 400 EUR si seuil
  atteint avant le 15/12/2026). Mention annonceur : Valentin Damlencourt.
- Appli Shopify « Google & YouTube » installée : Merchant Center 5875932785 lié, suivi des conversions (achat, panier,
  paiement, vue produit) + suivi avancé. Analytics et YouTube passés (la propriété GA proposée était celle d'un autre projet).
- Merchant Center : adresse (Valentin), livraison France offerte 1-3 j + 10-18 j ouvrés (fuseau Paris), retours 30 j,
  produit neuf, retour par la poste à la charge du client, remboursement 14 j. Shopping ads + fiches gratuites actives.
  Belgique et Luxembourg sans livraison configurée (avertissement sur 7 produits, sans effet sur les campagnes France).
- Campagnes : « KC Shopping FR » 10 EUR/j, CPC manuel 0,70 EUR, tous produits (non éligible tant que Google n'a pas
  validé les produits pour la France, 1 à 3 jours) ; « KC Recherche FR » 8,69 EUR/j, Maximiser les clics plafond 0,80 EUR,
  recherche Google seule, France, présence, français, 32 mots-clés, 1 annonce 15 titres/4 descriptions, AI Max coupé.
  Liste d'exclusions « KC exclusions » (33 mots) sur les deux.

## Méthode Google Shopping (18/10)

- Vidéo @iamgaspardgrosjean : produit recherché, Google Shopping direct en « Maximiser les clics », 50 EUR/j, pas de créas.
- Volumes FR (Planificateur, oct. 2025 - sept. 2026) : caméra action 3 600, caméra casque moto 1 900, petite caméra 1 900,
  caméra 4k 1 600, caméra moto 1 600, caméra embarquée / caméra sport / mini caméra 1 300, caméra pov 90, caméra pouce 0.
- `node titre-shopping.mjs [--revenir]` : titre SEO de la fiche (= titre Shopping + variante) avec les termes cherchés.
- KC Shopping (19/10) : 50 EUR/j, Maximiser les clics plafond 0,80 EUR, Recherche Google seule (sans Partenaires), 1080P
  exclues (groupes par ID d'article). KC Recherche en veille. Arrêt si 135 EUR dépensés sans vente.

## Pub verticale v4 « look concurrents » (16/10)

- `node video-native.mjs v4` -> `pub/video/kapsulcam-native-v4-9x16.mp4` (14,4 s). POV moto, voiture, plongée, vélo,
  ski de Pexels (`videos/pexels/`, licence Pexels : usage commercial gratuit), chacun avec « Images d'illustration »
  en haut à gauche, en alternance avec les vraies images de notre caméra (vlog fournisseur). Aucun texte ne dit que ces
  POV sont filmés avec KapsulCam. Valentin voulait sans mention : refusé, la mention reste.
- YouTube : aucune vidéo Creative Commons de notre modèle (SquareTech CC BY = animations, le reste = Runcam Thumb).

## Meta en pause (16/10 soir)

- Page Facebook KapsulCam (id 61595417702788) prête : logo, couverture style accueil (`fb-cover.mjs`), bouton vers
  l'accueil. Appli Shopify « Facebook & Instagram » installée.
- Bloqué : le portefeuille business ne se crée pas (« Something went wrong »), compte Facebook créé le jour même.
  Reprendre vers le 18/10 : Valentin confirme son compte et met une photo de profil, puis Shopify > Facebook &
  Instagram > Portefeuille business « Créer » > Envoyer pour examen. Ensuite compte pub (sa carte), domaine,
  campagne 15 EUR/j V3 contre V4, textes `pub/meta-ads.txt`, lien vers l'accueil.

## Boutiques concurrentes (16/10)

- `node concurrents.mjs` -> `pub/concurrents/index.html` : captures ordinateur + mobile des fiches et prix (catalogues
  Shopify publics). EyesPRO 94,99 seule / 110,98 pack ; Moovora 84,99 en 4K (affiché, barré 159,98) ; CamPro 110 ;
  Cosy2Road 109,90 avec SD 32 Go (vendue « espion ») ; The POV Pro 94,95 ; Kimenya 49,99 les 3 (surveillance).

## Documents CE (16/10)

- `fournisseur/nora/ce/` : 3 rapports TMC Testing Services (Shenzhen), 10/04/2025, modèle H88 (i3, i3s), demandeur et
  fabricant Shenzhen HonZen Vision Technology Co., Ltd. (Yili Science Park, Longhua, Shenzhen).
  EMC EN 301 489-1/-17 conforme ; sécurité EN IEC 62368-1 ; RoHS PASS.
- Manquent : la déclaration UE de conformité signée (DoC) et le rapport radio Wi-Fi EN 300 328 (+ exposition EN 62311).
- Étiquette démo de Nora : boîte neutre « BODY CAMERA », CE/FCC/UKCA, infos fabricant, « Made in China ».

## Surveillance de Nora (16/10)

- `node nora-check.mjs` : recharge la conversation Alibaba (onglet message.alibaba.com, Valentin connecté) et affiche
  les messages de Nora arrivés depuis la dernière fois (`nora-state.json`), « RIEN » sinon, « DECONNECTE » si la
  session Alibaba est tombée. `--init` marque tout comme lu.
- Tâche planifiée dans la session Claude toutes les 15 min : répond seul aux questions d'information, demande à
  Valentin pour prix, paiement, commande, engagement, accès boutique ; ne télécharge pas de fichier sans son accord.
  Expire au bout de 7 jours ou à la fermeture de Claude Code.

## Données structurées Search Console (18/10)

- `donnees-structurees.mjs` + `theme/kc-structured-data.liquid` : le JSON-LD Shopify (`structured_data`) des sections
  main-product et featured-product passe par ce snippet, qui ajoute sur chaque offre la politique de retour (30 jours,
  retour par courrier, frais à la charge du client, FR/BE/LU) et la livraison offerte FR/BE/LU (1-3 j de préparation
  + 9-15 j de transport = les 10-18 jours ouvrés affichés), et la description SEO sur chaque variante.
  À changer en même temps que la page retours ou les délais. `--test` (section invisible rendue via `?section_id=`),
  `--revenir` (sections sauvegardées dans `theme/*.avant-donnees.liquid`).
- Validation lancée dans la Search Console le 18/10 pour les 3 problèmes Fiches de marchand.
- Extraits de produits (aggregateRating/review manquants sur l'accueil et le kit) : laissés tels quels. L'accueil
  n'affiche pas les avis (Google exige qu'ils soient visibles sur la page balisée) et le kit n'a aucun avis.
- Étoiles sur l'accueil (18/10, demande de Valentin) : `etoiles-accueil.mjs` + `theme/kc-rating.liquid`, badge
  « ★ 4,8/5 12 avis » sous le titre du produit (lu dans les métachamps reviews.* de Judge.me, disparaît s'il n'y a
  aucun avis), lien vers `/products/kapsulcam-4k#avis` (ancre posée sur le bloc avisNote de templates/product.json,
  avec sa mention place de marché), et aggregateRating dans le JSON-LD de l'accueil seulement (`rating: true`).
  « review » reste manquant sur l'accueil : les avis n'y sont pas affichés. `--revenir` disponible.
- Menu burger mobile (18/10) : `menu-mobile.mjs`, le Chat et la barre collante sont masqués quand le menu est ouvert
  (l'ancienne règle visait `menu-drawer`, le menu Dawn est `header-drawer`). `--revenir` disponible.
- Enquête 0 vente (18/10) : `vitesse-mobile.mjs` (vitesse mobile + moment où Shopify compte la visite, ~4 s en 4G lente)
  et `clarity-sessions.mjs` (résumé des enregistrements Clarity). Constat : les clics « Partenaires du Réseau de
  Recherche » (sites ouverts dans Facebook/Instagram) = 0 engagement ; à décocher dans KC Recherche FR > Paramètres >
  Réseaux. Merchant Center : livraison BE/LU à ajouter (gratuite, mêmes délais que la France).

## Vidéos POV organiques TikTok / Insta (18/10)

- `node video-organique.mjs [a|b|c|all]` -> `pub/video/organique/kapsulcam-pov-{a,b,c}-9x16.mp4` (11,9 s, piste son
  muette : le son tendance se choisit dans l'appli), aperçu `pub/video/organique/apercu.html`.
- Même montage, 3 accroches : A « pov : tu filmes tout sans sortir ton téléphone », B « pov : t'as une caméra de 36 g
  aimantée sur toi », C « ta semaine si t'avais une caméra pouce » (lundi moto ... dimanche moto). Puis caméra détourée
  qui surgit sur les spatules « 36 grammes », piscine, toboggan, VTT, ski, sous l'eau, moto, « tu la mets où toi ? »,
  fin « vis. elle filme. » + logo. Aucun prix, pas de fin façon pub.
- Uniquement des plans Pexels (`videos/pexels/licences.json` : titre, page, fichier, date) avec « Images d'illustration »,
  plus le détourage produit. Le vlog fournisseur est retiré exprès (zones floutées visibles, vidéo déjà publiée par
  d'autres boutiques, donc risque « contenu non original » sur TikTok).
- Pub TikTok précédente : 8 vues (dit par Valentin le 18/10), compte et réglages inconnus, cause non vérifiée.
- Film ski 30 s (demande du 18/10 : « plus qualitatif », ~30 s, une seule activité, la caméra sur le casque, phrase
  accrocheuse à la fin sans question) : `node video-film-ski.mjs` -> `pub/video/organique/kapsulcam-film-ski-9x16.mp4`
  (30,2 s, 43 Mo, débit plafonné 12 Mb/s pour l'envoi mobile). Photo `decoupes/p-ski.jpg` (caméra sur casque) en carré,
  avancée puis plongée dans l'objectif, télésiège « première descente de la saison », 9 plans POV d'une même série
  Pexels (skieur Utah, skis bleus : 36517447/535/533/441/445/446/630/633), ralentis 0,8x et accélérés 1,2-1,3x,
  3 transitions balayées, fin « tu vis. elle filme. » + logo blanc sur le dernier panorama. Seule photo casque
  disponible = ski (pas de photo casque moto/VTT).
- Film snowboard ~42 s (18/10 soir, Valentin : « enlève le début », « un bougre qui porte la cam », « alonge »,
  exemple TikTok @sweetnbiker 7585635188189826326 = POV selfie Insta360 à moto, 23 s, son original, 229 k vues mais
  marqué isAd) : `node video-film-snow.mjs` -> `pub/video/organique/kapsulcam-film-snow-9x16.mp4` (41,6 s, 63 Mo).
  Un seul snowboardeur qui se filme (série Pexels 35133452 POV pieds, 35133453, 35133459, caméra 360 perche
  invisible), 12 plans longs, 3 transitions balayées, accroche « Pov : t'es le pote qui filme toute la journée »,
  fin « tu vis. elle filme. » + logo dans le ciel au-dessus de son sourire. Mention « Images d'illustration » gardée
  en petit (24 px). Autre série repérée : costumes d'ours (29154459, 29157295), ton humour.

## Films organiques par activité (18/10 soir, « fais tout »)

- `node video-film.mjs <nom|all>` -> `pub/video/organique/kapsulcam-film-<nom>-9x16.mp4`, aperçu `apercu.html`.
  Remplace `video-film-snow.mjs` (le film snow est la config `snow`). 30 à 42 s, muets, une personne qui se filme,
  accroche courte en haut, fin « tu vis. elle filme. » (ou `endText`), « Images d'illustration » en petit.
- snow (41,6 s) : snowboardeur 35133452/53/59. ours (34,3 s) : bande en costumes d'Alex Vescovi (29154459, 29157295,
  29543013 télésiège, 29437122, 29592530, 29170745, 29049283), « Pov : t'as perdu un pari contre tes potes ».
  moto (34,1 s) : deux copines en scooter, un seul plan 38216374, « Pov : on avait dit « on rentre avant la pluie » ».
  vtt (37,7 s) : vélo n° 7 (38180610/588/517/609/591, fin 38181106), « Pov : t'as dit « juste une petite sortie » ».
  mer (34 s) : snorkeleur masque jaune 40291061/92 + récif 40291072-96, « Pov : t'as enfin posé tes congés ».
  piscine (31,5 s) : 10666934, 4851440, 35448967, 35181089, 38239059, 8045186, « Pov : 35 °C et une piscine rien que
  pour toi ». voiture (33,5 s) : un trajet POV mains sur le volant 35595804, « Pov : quelqu'un te rentre dedans et c'est
  sa parole contre la tienne » puis « sauf que toi, t'as tout filmé », fin « tu roules. elle filme. ».
- Angle voiture : Moovora vend la même gélule en dashcam (57 pubs Meta : lecture des plaques, GPS intégré, distance
  des obstacles). Notre fiche Alibaba ne mentionne ni boucle, ni GPS, ni enregistrement sur chargeur ; le pack n'a pas
  de ventouse. Le film voiture ne promet que ce qui est vrai (la caméra filme le trajet, 90 min sur batterie).
- Outils de recherche Pexels (scratchpad du 18/10) : recherche, vignettes, auteur et série, téléchargement par
  Edge ordinaire sur le port 9333 (puppeteer.launch = défi Cloudflare sur les pages vidéo).

## Film plongée pour voix off (19/10 soir)

- `node video-film-plongee.mjs` -> `E:\kapsulcam-media\out\kapsulcam-film-plongee-9x16.mp4` (47,1 s, muet) +
  `kapsulcam-film-plongee-voix.txt` (texte de la voix off calé sur les plans). Plans Pexels dans `E:\kapsulcam-media\pexels`
  (C: plein le 19/10 : 3,7 Mo libres), licences ajoutées à `videos/pexels/licences.json`.
- Accroche « personne va te croire quand tu vas raconter ça » sur l'apnéiste et le cachalot (36717426), requin vu du
  dessous (28451683), tortue (36155362), sardines (26612855), raie (33765600), « sauf si t'as tout filmé » (grotte
  33994571), caméra détourée sur fond bleu (4K grand angle, 36 g), photo du caisson (étanche 30 m, caisson inclus),
  apnée (37825631), poissons (33000364), manta (30743748, « jusqu'à 90 min »), dauphin (35120301), raies (39608308),
  vue drone Maldives (30706634, remplace le saut du bateau 31715184 retiré à la demande de Valentin), baleine au drone (39355913), fin « tu plonges. elle filme. » + kapsulcam.com.
- La caméra nue n'est jamais montrée sous l'eau (seulement dans le caisson). Le texte ne promet pas les mains libres
  sous l'eau : le pack n'a ni fixation masque ni harnais, le caisson se tient sur la poignée ou la perche.

## Fiche produit : vidéo en tête + note sous le titre (19/10)

- `node fiche-video.mjs` (sauvegardes `theme/product-media-gallery.avant-video.liquid` et `theme/main-product.avant-video.liquid`,
  `--revenir` disponible) : la vidéo mer/surf/plongée de la fiche passe en première diapo, lecture automatique muette en
  boucle, et la note Judge.me (`kc-rating`) s'affiche sous le titre comme sur l'accueil. Données produit et flux Merchant
  Center inchangés. Vérifié mobile 390 px et ordinateur 1440 px : vidéo lue, prix dans le 1er écran, choisir une offre remet
  son image en tête (comportement Dawn), vignette de la variante visible (règle CSS sur la vignette vidéo en 1re position).

## Son et genre des pubs concurrentes (19/10)

- Dossier `pub/benchmark/son-genre-19-10/` : `rapport.txt`, 22 vidéos numérotées par couverture UE (360p), transcriptions
  `.srt`, musiques reconnues (`musiques.json`, `musiques-sous-voix.json`), toutes les pubs avec couverture
  (`pubs-concurrents.json`). Envoyé en 3 mails à kapsulcam@gmail.com depuis le Gmail de Valentin le 19/10.
- Outils `outils/` : `adlib-videos.mjs` (pubs vidéo actives FR avec URL des fichiers, par mot-clé ou `page:<id>`),
  `adlib-reach.mjs` (couverture UE par pub), `shazam.py` (3 passages par vidéo, venv avec shazamio). Transcription :
  filtre `whisper` de ffmpeg 8.1 + modèle `ggml-small.bin`. Musique sous une voix : canal stéréo « side »
  (`pan=stereo|c0=c0-c1|c1=c1-c0`) puis Shazam.
- Constats : Moovora seul gros annonceur (63 pubs, 3,56 M) ; voix française face caméra = 57 % de la couverture (les 2
  meilleures pubs), musique seule 8-16 s = 43 % (funk brésilien / phonk, Golden Brown, Manu Chao, rap FR) ; moto 64 %,
  vélo 27 %, VTT 9 %, aucun ski/mer/piscine. Toutes les pubs à -14 LUFS (normalisation Meta probable). Vitivie et
  Copenrain = caméras espion, écartés.

## Page principale = page de vente (22/10)

- Demande de Valentin : « supprime la page La caméra et fais de la page principale la page pour vendre ».
  `accueil-vente.mjs` : `templates/product.json` = copie de l'accueil (kc-hero, featured-product `produit`, activités,
  étapes, comparatif, FAQ, bannière) + avis Judge.me (`#avis`). Les 4 onglets de l'ancienne fiche (dont Consignes de
  sécurité) sont sous le bouton d'achat sur les deux pages, lien « Afficher tous les détails » masqué, cartes activités
  = défilement vers la zone d'achat, « La caméra » retirée du menu kc-main.
- Le produit `kapsulcam-4k` existe toujours (panier, paiement, Merchant Center). `?variant=` est respecté (8 variantes
  vérifiées : id et prix). Le kit garde `product.accessoire.json`.
- Sauvegardes : `theme/product.avant-accueil.json`, `theme/index.avant-accueil.json`, `etat-menu-avant-accueil.json` ;
  `node accueil-vente.mjs --revenir` remet tout.
