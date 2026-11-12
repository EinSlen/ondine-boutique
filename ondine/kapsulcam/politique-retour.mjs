// Creates/updates the return policy page (footer link only), short and laid out like moovora.fr's.
// The withdrawal form template stays in the CGV.
import { gql } from './shop.mjs';

const body = `
<h2>1. Droit de rétractation</h2>
<p>Conformément à la loi, vous disposez de 14 jours calendaires à compter de la réception de votre commande pour exercer votre droit de rétractation, sans avoir à vous justifier.</p>
<h2>2. Satisfait ou remboursé 30 jours</h2>
<p>Vous pouvez nous renvoyer la caméra jusqu'à 30 jours après sa réception, complète, non utilisée et dans son emballage d'origine.</p>
<h2>3. Modalités de retour</h2>
<p>Écrivez-nous depuis la page <a href="/pages/nous-contacter">Contact</a> avec votre numéro de commande : nous vous indiquons l'adresse de retour.</p>
<p>Les produits doivent être renvoyés complets, dans leur état d'origine.</p>
<p>Les frais de retour sont à votre charge.</p>
<h2>4. Remboursement</h2>
<p>Après réception et vérification du colis, nous remboursons l'intégralité de la commande, frais de livraison compris.</p>
<p>Le remboursement est effectué avec le moyen de paiement utilisé lors de la commande.</p>
<h2>5. Échange</h2>
<p>Vous pouvez demander un échange contre l'autre coloris ou une autre offre disponible.</p>
<p>Les frais de retour restent à votre charge. Le nouveau produit est expédié dès réception du produit retourné.</p>
<h2>6. Solutions amiables</h2>
<p>Dans certains cas, pour trouver une solution à l'amiable, nous pouvons vous proposer, avec votre accord, un remboursement partiel de 40 % sans retour du produit : vous gardez la caméra et vous n'avez aucun frais de retour à payer.</p>
<p>Cette solution est proposée au cas par cas et ne remplace pas votre droit légal de rétractation.</p>
<h2>7. Produit défectueux</h2>
<p>Nos produits bénéficient de la garantie légale de conformité de 2 ans. En cas de défaut, envoyez-nous une photo ou une vidéo du problème : nous le remplaçons ou nous vous remboursons, frais de retour compris.</p>
<h2>8. Contact</h2>
<p>Pour toute demande de retour, d'échange ou de remboursement, contactez notre service client depuis la page <a href="/pages/nous-contacter">Contact</a>.</p>
`.trim();

const HANDLE = 'politique-de-retour-et-de-remboursement';
const page = { title: "Politique de retour, d'échange et de remboursement", handle: HANDLE, body, isPublished: true };
const ex = (await gql(`query($q: String!) { pages(first: 1, query: $q) { nodes { id handle } } }`, { q: `handle:${HANDLE}` })).pages.nodes.find((x) => x.handle === HANDLE);
const o = ex
  ? (await gql(`mutation($id: ID!, $page: PageUpdateInput!) { pageUpdate(id: $id, page: $page) { page { handle isPublished } userErrors { message } } }`, { id: ex.id, page })).pageUpdate
  : (await gql(`mutation($page: PageCreateInput!) { pageCreate(page: $page) { page { handle isPublished } userErrors { message } } }`, { page })).pageCreate;
console.log(JSON.stringify(o));
