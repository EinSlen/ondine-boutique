import { gql } from './shop.mjs';
const tag = process.argv[2];
const r = await gql(`mutation($s: URL!, $n: String!) { themeCreate(source: $s, name: $n, role: UNPUBLISHED) { theme { id name processing } userErrors { field message } } }`,
  { s: tag, n: "KapsulCam" });
console.log(JSON.stringify(r.themeCreate));
let t = r.themeCreate.theme;
for (let i = 0; t && i < 40 && t.processing; i++) {
  await new Promise((s) => setTimeout(s, 4000));
  t = (await gql(`query($id: ID!) { theme(id: $id) { id name processing processingFailed } }`, { id: t.id })).theme;
}
console.log('fin', JSON.stringify(t));
