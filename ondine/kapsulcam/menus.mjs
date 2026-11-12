import { gql } from './shop.mjs';
const pageId = async (h) => (await gql(`query($q: String!) { pages(first: 5, query: $q) { nodes { id handle } } }`, { q: `handle:${h}` })).pages.nodes.find((x) => x.handle === h).id;
const prod = (await gql(`{ productByHandle(handle: "kapsulcam-4k") { id } }`)).productByHandle.id;
const blog = (await gql(`{ blogs(first: 20) { nodes { id handle } } }`)).blogs.nodes.find((b) => b.handle === 'journal').id;
const P = async (title, h) => ({ title, type: 'PAGE', resourceId: await pageId(h) });
const menus = {
  'kc-main': ['KapsulCam principal', [
    { title: 'Accueil', type: 'FRONTPAGE', url: '/' },
    { title: 'La caméra', type: 'PRODUCT', resourceId: prod },
    { title: 'Journal', type: 'BLOG', resourceId: blog },
    await P('Livraison et retours', 'livraison-et-retours'),
    await P('Contact', 'nous-contacter'),
  ]],
  'kc-footer': ['KapsulCam informations', [
    await P('Livraison et retours', 'livraison-et-retours'),
    await P("Politique de retour, d'échange et de remboursement", 'politique-de-retour-et-de-remboursement'),
    await P('Conditions de vente', 'conditions-de-vente'),
    await P('Mentions légales', 'mentions-legales'),
    { title: 'Journal', type: 'BLOG', resourceId: blog },
    { title: 'Confidentialité', type: 'HTTP', url: '/policies/privacy-policy' },
    await P('Contact', 'nous-contacter'),
  ]],
};
const all = (await gql(`{ menus(first: 50) { nodes { id handle } } }`)).menus.nodes;
for (const [handle, [title, items]] of Object.entries(menus)) {
  const ex = all.find((m) => m.handle === handle);
  const r = ex
    ? await gql(`mutation($id: ID!, $t: String!, $h: String!, $i: [MenuItemUpdateInput!]!) { menuUpdate(id: $id, title: $t, handle: $h, items: $i) { menu { handle } userErrors { message } } }`, { id: ex.id, t: title, h: handle, i: items })
    : await gql(`mutation($t: String!, $h: String!, $i: [MenuItemCreateInput!]!) { menuCreate(title: $t, handle: $h, items: $i) { menu { handle } userErrors { message } } }`, { t: title, h: handle, i: items });
  console.log(handle, JSON.stringify(r.menuUpdate || r.menuCreate));
}
