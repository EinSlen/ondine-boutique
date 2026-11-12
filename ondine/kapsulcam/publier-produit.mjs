import { gql } from './shop.mjs';
const prod = (await gql(`{ productByHandle(handle: "kapsulcam-4k") { id } }`)).productByHandle.id;
const pubs = (await gql(`{ publications(first: 20) { nodes { id name } } }`)).publications.nodes;
console.log(pubs.map((p) => p.name).join(' | '));
const cibles = pubs.filter((p) => /Online Store|Boutique en ligne|Shop/i.test(p.name));
const r = await gql(`mutation($id: ID!, $input: [PublicationInput!]!) { publishablePublish(id: $id, input: $input) { userErrors { field message } } }`,
  { id: prod, input: cibles.map((p) => ({ publicationId: p.id })) });
console.log('publié sur', cibles.map((p) => p.name).join(', '), JSON.stringify(r.publishablePublish.userErrors));
