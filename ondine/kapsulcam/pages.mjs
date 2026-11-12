// Creates/updates KapsulCam pages. Identity comes from identite.json (never committed anywhere).
// node pages.mjs            -> all pages, legal pages only published when identite.json is complete
import fs from 'node:fs';
import path from 'node:path';
import { gql, ICI_DIR } from './shop.mjs';

const idf = path.join(ICI_DIR, 'identite.json');
const id = fs.existsSync(idf) ? JSON.parse(fs.readFileSync(idf, 'utf8')) : {};
const complet = Boolean(id.adresse && id.telephone && id.email);
const NOM = 'Valentin Damlencourt';
const EMAIL = id.email || '[e-mail à compléter]';
const ADRESSE = id.adresse || '[adresse à compléter]';
const TEL = id.telephone || '[téléphone à compléter]';

const pages = [
  {
    handle: 'livraison-et-retours',
    title: 'Livraison et retours',
    body: `
<h2>Livraison</h2>
<p>La livraison suivie est offerte en France, Belgique et Luxembourg.</p>
<p>Chaque commande est préparée puis expédiée sous 1 à 3 jours ouvrés. Le délai de livraison est ensuite de 10 à 18 jours ouvrés. Dès l'expédition, vous recevez un e-mail avec votre numéro de suivi.</p>
<p>Si votre colis n'est pas arrivé 25 jours ouvrés après l'expédition, écrivez-nous : nous le renvoyons ou nous vous remboursons.</p>
<h2>Satisfait ou remboursé 30 jours</h2>
<p>Vous avez 30 jours après réception pour nous renvoyer la caméra complète, non utilisée et dans son emballage d'origine : nous vous remboursons. Écrivez-nous depuis la page <a href="/pages/nous-contacter">Contact</a>, nous vous indiquons l'adresse de retour.</p>
<p>Les frais de retour sont à votre charge. Nous vous remboursons dès réception du retour, frais de livraison initiaux compris, avec le moyen de paiement utilisé pour la commande. Détails dans notre <a href="/pages/politique-de-retour-et-de-remboursement">politique de retour et de remboursement</a>.</p>
<h2>Produit défectueux</h2>
<p>Tous nos produits bénéficient de la garantie légale de conformité de 2 ans et de la garantie des vices cachés. En cas de défaut, contactez-nous avec une photo ou une vidéo du problème : nous prenons en charge le remplacement ou le remboursement, frais de retour compris.</p>`,
  },
  {
    handle: 'nous-contacter',
    title: 'Contact',
    templateSuffix: 'contact',
    body: `<p>Une question sur la caméra ou sur une commande ? Écrivez-nous avec le formulaire ci-dessous. Nous répondons sous 24 h ouvrées.</p>`,
  },
  {
    handle: 'mentions-legales',
    title: 'Mentions légales',
    legal: true,
    body: `
<h2>Éditeur du site</h2>
<p>${NOM}, entrepreneur individuel (immatriculation en cours)<br>${ADRESSE}<br>Téléphone : ${TEL}<br>E-mail : ${EMAIL}</p>
<p>Directeur de la publication : ${NOM}</p>
<h2>Hébergement</h2>
<p>Shopify International Limited, Victoria Buildings, 2e étage, 1-2 Haddington Road, Dublin 4, D04 XN32, Irlande.</p>
<h2>Propriété intellectuelle</h2>
<p>Les textes et visuels de ce site sont protégés. Toute reproduction sans autorisation est interdite.</p>
<h2>Données personnelles</h2>
<p>Les données collectées lors d'une commande servent uniquement à la traiter et à la livrer. Vous pouvez demander leur consultation, rectification ou suppression à ${EMAIL}. Voir aussi notre <a href="/policies/privacy-policy">politique de confidentialité</a>.</p>`,
  },
  {
    handle: 'conditions-de-vente',
    title: 'Conditions générales de vente',
    legal: true,
    body: `
<h2>1. Vendeur</h2>
<p>Les présentes conditions régissent les ventes conclues sur ce site par le vendeur dont l'identité et les coordonnées figurent dans les <a href="/pages/mentions-legales">mentions légales</a>. Contact : ${EMAIL}.</p>
<h2>2. Produits</h2>
<p>Les caractéristiques essentielles des produits sont présentées sur leur fiche. Les photographies sont aussi fidèles que possible ; les mises en situation sont des illustrations.</p>
<h2>3. Prix</h2>
<p>Les prix sont indiqués en euros, toutes taxes comprises (TVA non applicable, article 293 B du CGI). La livraison est offerte vers la France, la Belgique et le Luxembourg. Le prix applicable est celui affiché au moment de la commande.</p>
<h2>4. Commande et paiement</h2>
<p>La commande est validée après acceptation des présentes conditions et paiement intégral par carte bancaire ou par les autres moyens proposés au paiement. Un e-mail de confirmation récapitule la commande. Les paiements sont traités par des prestataires sécurisés ; aucune donnée bancaire n'est conservée par le vendeur.</p>
<h2>5. Livraison</h2>
<p>Les produits sont expédiés sous 1 à 3 jours ouvrés et livrés en 10 à 18 jours ouvrés à l'adresse indiquée lors de la commande, avec suivi. En cas de retard supérieur à 30 jours après la commande, le client peut résoudre la vente dans les conditions des articles L216-2 et suivants du Code de la consommation.</p>
<h2>6. Droit de rétractation</h2>
<p>Conformément à l'article L221-18 du Code de la consommation, le client dispose de 14 jours à compter de la réception du produit pour se rétracter, sans motif. Il notifie sa décision par e-mail à ${EMAIL} ou au moyen du formulaire ci-dessous, puis renvoie le produit complet sous 14 jours. Les frais de retour sont à sa charge. Le vendeur rembourse la totalité des sommes versées, frais de livraison initiaux inclus, sous 14 jours à compter de la réception du produit ou de la preuve de son expédition.</p>
<p><em>Formulaire de rétractation : « Je vous notifie par la présente ma rétractation du contrat portant sur la vente du bien ci-dessous : [produit], commandé le [date], reçu le [date]. Nom : […]. Adresse : […]. Date et signature (en cas d'envoi papier). »</em></p>
<h2>7. Garantie commerciale « satisfait ou remboursé 30 jours »</h2>
<p>En plus du droit de rétractation, le vendeur rembourse le produit retourné entre le 15e et le 30e jour suivant sa réception, à condition qu'il soit complet, non utilisé et dans son emballage d'origine. Les frais de retour sont à la charge du client. Cette garantie ne limite en rien le droit de rétractation de 14 jours ni les garanties légales.</p>
<h2>8. Garanties légales</h2>
<p>Le vendeur est tenu de la garantie légale de conformité (articles L217-3 et suivants du Code de la consommation) et de la garantie des vices cachés (articles 1641 et suivants du Code civil). Le consommateur dispose d'un délai de deux ans à compter de la délivrance du bien pour agir au titre de la garantie de conformité ; il peut choisir entre la réparation et le remplacement du bien, sous réserve des conditions de l'article L217-12. Il est dispensé de prouver le défaut de conformité durant les deux ans suivant la délivrance.</p>
<h2>9. Données personnelles</h2>
<p>Les données du client sont utilisées pour traiter et livrer la commande et ne sont jamais revendues. Le client dispose d'un droit d'accès, de rectification et de suppression en écrivant à ${EMAIL}.</p>
<h2>10. Litiges</h2>
<p>Les présentes conditions sont soumises au droit français. En cas de difficulté, le client peut d'abord contacter le vendeur pour trouver une solution amiable. Il peut ensuite recourir gratuitement à un médiateur de la consommation (désignation en cours). À défaut, les tribunaux compétents sont ceux prévus par la loi.</p>`,
  },
];

for (const p of pages) {
  const publier = !p.legal || complet;
  const ex = (await gql(`query($q: String!) { pages(first: 1, query: $q) { nodes { id handle } } }`, { q: `handle:${p.handle}` })).pages.nodes.find((x) => x.handle === p.handle);
  const page = { title: p.title, handle: p.handle, body: p.body.trim(), isPublished: publier, ...(p.templateSuffix ? { templateSuffix: p.templateSuffix } : {}) };
  const r = ex
    ? await gql(`mutation($id: ID!, $page: PageUpdateInput!) { pageUpdate(id: $id, page: $page) { page { id handle isPublished } userErrors { field message } } }`, { id: ex.id, page })
    : await gql(`mutation($page: PageCreateInput!) { pageCreate(page: $page) { page { id handle isPublished } userErrors { field message } } }`, { page });
  const o = r.pageUpdate || r.pageCreate;
  console.log(p.handle, o.page ? `publiée=${o.page.isPublished}` : JSON.stringify(o.userErrors));
}

// Shopify written policies (Settings > Policies), pasted through the admin editor: same identity as the legal pages.
const byHandle = Object.fromEntries(pages.map((p) => [p.handle, p.body.trim()]));
const politiques = {
  'coordonnees.html': `<p>${NOM}, entrepreneur individuel (immatriculation en cours)</p>
<p>Adresse : ${ADRESSE}</p>
<p>Téléphone : ${TEL}</p>
<p>E-mail : ${EMAIL}</p>`,
  'mention-legale.html': byHandle['mentions-legales'],
  'conditions-de-vente.html': byHandle['conditions-de-vente'],
  'conditions-de-service.html': `<h2>1. Objet</h2>
<p>Les présentes conditions encadrent l'utilisation du site KapsulCam. Les achats sont régis par nos <a href="/pages/conditions-de-vente">conditions générales de vente</a>.</p>
<h2>2. Accès au site</h2>
<p>Le site est accessible gratuitement. Nous faisons notre possible pour qu'il soit disponible en permanence, sans pouvoir le garantir, notamment en cas de maintenance.</p>
<h2>3. Compte client</h2>
<p>Vous êtes responsable de la confidentialité de vos identifiants et des informations que vous fournissez, qui doivent être exactes.</p>
<h2>4. Propriété intellectuelle</h2>
<p>Les textes, visuels et vidéos du site sont protégés. Toute reproduction sans autorisation est interdite.</p>
<h2>5. Avis clients</h2>
<p>Les avis publiés doivent être sincères, respectueux et porter sur le produit. Nous pouvons refuser un avis contraire à ces règles.</p>
<h2>6. Données personnelles</h2>
<p>Le traitement de vos données est décrit dans notre <a href="/policies/privacy-policy">politique de confidentialité</a>.</p>
<h2>7. Droit applicable</h2>
<p>Ces conditions sont soumises au droit français. Contact : ${EMAIL}.</p>`,
};
fs.mkdirSync(path.join(ICI_DIR, 'politiques'), { recursive: true });
for (const [f, html] of Object.entries(politiques)) fs.writeFileSync(path.join(ICI_DIR, 'politiques', f), html);
console.log('politiques écrites', Object.keys(politiques).join(', '));
