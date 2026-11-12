// node theme-traductions.mjs : replaces the English texts left in the theme templates (contact button, cart, 404, password page, disabled hero, disclosures heading)
import fs from 'node:fs';

const edit = (name, change) => {
  const file = new URL(`./theme/templates/${name}`, import.meta.url);
  const raw = fs.readFileSync(file, 'utf8');
  const header = (raw.match(/^\/\*[\s\S]*?\*\//) || [''])[0];
  const data = JSON.parse(raw.slice(header.length));
  change(data);
  fs.writeFileSync(file, (header ? `${header}\n` : '') + JSON.stringify(data, null, 2) + '\n');
  console.log('traduit', name);
};

const each = (node, test, apply) => {
  if (!node || typeof node !== 'object') return;
  if (test(node)) apply(node);
  Object.values(node).forEach((v) => each(v, test, apply));
};

const replaceText = (map) => (data) => each(data, (n) => n.settings, (n) => {
  for (const [key, value] of Object.entries(n.settings)) {
    if (typeof value !== 'string') continue;
    for (const [en, fr] of map) if (value.includes(en)) n.settings[key] = n.settings[key].replace(en, fr);
  }
});

edit('page.contact.json', replaceText([['Submit', 'Envoyer']]));

edit('cart.json', replaceText([
  ['>Cart<', '>Panier<'],
  ['You may also like', 'À voir aussi au plafond'],
  ['View all', 'Tout voir']
]));
edit('cart.json', (data) => each(data, (n) => n.settings && n.settings.title === 'Cart', (n) => { n.settings.title = 'Panier'; }));

edit('404.json', replaceText([
  ['Page not found', 'Page introuvable'],
  ['The link may be incorrect, or the page has been removed.', "Le lien est peut-être erroné, ou la page n'existe plus."],
  ['Continue shopping', 'Voir la collection'],
  ['Discover something new', 'Nos lumières']
]));

edit('password.json', replaceText([
  ['Opening soon', 'Ouverture prochaine'],
  ['Sign up for our newsletter to be the first to know when we launch.', "Laissez votre e-mail : on vous prévient le jour de l'ouverture."],
  ['Sign up', 'Me prévenir']
]));

edit('index.json', replaceText([
  ['Browse our latest products', 'Découvrez nos lumières'],
  ['Shop all', 'Tout voir']
]));

for (const name of ['product.json', 'product.selene.json']) {
  edit(name, (data) => each(data, (n) => n.type === 'disclosures', (n) => { n.settings.heading = 'Informations produit'; }));
}
