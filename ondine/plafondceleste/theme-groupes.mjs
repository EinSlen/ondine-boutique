// node theme-groupes.mjs : French announcement bar and footer for Plafond Céleste (header-group.json, footer-group.json), social icons hidden until the accounts exist
import fs from 'node:fs';

const edit = (name, change) => {
  const file = new URL(`./theme/sections/${name}`, import.meta.url);
  const raw = fs.readFileSync(file, 'utf8');
  const header = (raw.match(/^\/\*[\s\S]*?\*\//) || [''])[0];
  const data = JSON.parse(raw.slice(header.length));
  change(data);
  fs.writeFileSync(file, (header ? `${header}\n` : '') + JSON.stringify(data, null, 2) + '\n');
  console.log('modifié', name);
};

const LINKS = `<nav class="pc-foot" aria-label="Informations">
  <p class="pc-foot__kicker">Infos</p>
  {%- assign handles = 'livraison,retours,questions,a-propos,contact' | split: ',' -%}
  {%- for handle in handles -%}
    {%- assign page_link = pages[handle] -%}
    {%- if page_link.title != blank -%}<a href="{{ page_link.url }}">{{ page_link.title }}</a>{%- endif -%}
  {%- endfor -%}
  {%- if pages['renoncer-au-contrat'].title != blank -%}<a href="{{ pages['renoncer-au-contrat'].url }}">Renoncer au contrat ici</a>{%- endif -%}
</nav>
<style>
  .pc-foot { display: grid; gap: 8px; }
  .pc-foot__kicker { margin: 0 0 4px; font-size: 12px; letter-spacing: .18em; text-transform: uppercase; color: #d8ad62; }
  .pc-foot a { color: #a4abbb; text-decoration: none; font-size: 15px; }
  .pc-foot a:hover { color: #efe7d6; }
  .shopify-challenge__container { display: grid; justify-items: center; gap: 16px; text-align: center; }
  .shopify-challenge__errors { margin: 0; padding: 0; list-style: none; color: #f08a7e; }
  .shopify-challenge__button, .shopify-challenge__container [type="submit"] { margin-top: 16px; padding: 16px 28px; border: 0; border-radius: 2px; background: #d8ad62; color: #1a1306; font: inherit; font-size: 16px; cursor: pointer; }
  .shopify-challenge__button:hover, .shopify-challenge__container [type="submit"]:hover { background: #e4bf7d; }
  .shopify-challenge__button:focus-visible, .shopify-challenge__container [type="submit"]:focus-visible { outline: 2px solid #efe7d6; outline-offset: 3px; }
</style>`;

const find = (node, test, out = []) => {
  if (node && typeof node === 'object') {
    if (test(node)) out.push(node);
    Object.values(node).forEach((v) => find(v, test, out));
  }
  return out;
};

edit('header-group.json', (d) => {
  find(d, (n) => n.type === '_announcement').forEach((b) => {
    b.settings.text = 'Livraison suivie offerte en France';
    b.settings.letter_spacing = 'loose';
    b.settings.case = 'uppercase';
  });
});

edit('footer-group.json', (d) => {
  find(d, (n) => n.type === 'text' && n.settings && /Join our email list/.test(n.settings.text)).forEach((b) => {
    b.settings.text = '<h2>Les nouveautés, avant tout le monde</h2>';
    b.settings.type_preset = 'h3';
  });
  find(d, (n) => n.type === 'text' && n.settings && /exclusive deals|nouvelle lumière arrive/.test(n.settings.text)).forEach((b) => {
    b.settings.text = '<p>Un e-mail quand une nouvelle lumière arrive. Pas plus.</p>';
  });
  find(d, (n) => n.type === 'email-signup').forEach((b) => { b.settings.label = "S'inscrire"; });
  find(d, (n) => n.type === 'footer-copyright').forEach((b) => { b.settings.show_powered_by = false; });
  find(d, (n) => n.type === 'social-links').forEach((b) => {
    for (const k of Object.keys(b.settings)) if (k.endsWith('_url')) delete b.settings[k];
  });

  const footer = Object.values(d.sections).find((s) => s.type === 'footer');
  const model = Object.values(footer.blocks).find((b) => b.type === 'group');
  footer.blocks.group_pc_links = {
    type: 'group',
    settings: { ...model.settings },
    blocks: { liquid_pc_links: { type: 'custom-liquid', settings: { custom_liquid: LINKS }, blocks: {} } },
    block_order: ['liquid_pc_links']
  };
  footer.block_order = ['group_pc_links', ...footer.block_order.filter((k) => k !== 'group_pc_links')];
});
