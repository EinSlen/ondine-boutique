import fs from 'node:fs';
import path from 'node:path';
import { gql, rest, ICI_DIR } from './shop.mjs';

const d = await gql(`{ shop { name email contactEmail } products(first: 100) { nodes { id title status } } }`);
const themes = await rest('GET', 'themes.json');
const etat = {
  date: new Date().toISOString(),
  shop: d.shop,
  produitsActifs: d.products.nodes.filter((p) => p.status === 'ACTIVE').map((p) => ({ id: p.id, title: p.title })),
  themePublie: themes.themes.find((t) => t.role === 'main'),
  themes: themes.themes.map((t) => ({ id: t.id, name: t.name, role: t.role })),
};
fs.writeFileSync(path.join(ICI_DIR, 'etat-dead2me-avant.json'), JSON.stringify(etat, null, 1));
console.log(JSON.stringify({ shop: etat.shop, actifs: etat.produitsActifs.length, theme: etat.themePublie.name, themes: etat.themes }, null, 1));
