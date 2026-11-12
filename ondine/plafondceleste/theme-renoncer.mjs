// node theme-renoncer.mjs : adds the online withdrawal form (article D221-5 of the Code de la consommation) to theme/templates/page.json,
// shown only on the "renoncer-au-contrat" page; it posts a Shopify contact form whose notification is the withdrawal declaration
import fs from 'node:fs';

const FILE = new URL('./theme/templates/page.json', import.meta.url);
const raw = fs.readFileSync(FILE, 'utf8');
const header = (raw.match(/^\/\*[\s\S]*?\*\//) || [''])[0];
const data = JSON.parse(raw.slice(header.length));

const FORM = `{%- if page.handle == 'renoncer-au-contrat' -%}
<div class="pc-renonce">
  {%- form 'contact', id: 'pc-renonce-form', class: 'pc-renonce__form' -%}
    {%- if form.posted_successfully? -%}
      <div class="pc-renonce__ok" role="status">
        <p class="pc-renonce__title">Votre rétractation est bien envoyée.</p>
        <p>Vous allez recevoir un accusé de réception par e-mail, qui reprend votre déclaration avec la date et l'heure de son envoi. Nous vous indiquons ensuite où renvoyer le produit : vous avez 14 jours pour le faire.</p>
      </div>
    {%- else -%}
      <p class="pc-renonce__intro">Vous avez 14 jours après la réception de votre commande pour renoncer à votre achat, sans avoir à vous justifier. Remplissez ce formulaire, puis cliquez sur « Confirmer la rétractation ».</p>
      {%- if form.errors -%}<p class="pc-renonce__error" role="alert">{{ form.errors | default_errors }}</p>{%- endif -%}
      <input type="hidden" name="contact[Objet]" value="Rétractation">
      <label class="pc-renonce__field"><span>Nom et prénom</span><input type="text" name="contact[Nom et prénom]" required autocomplete="name"></label>
      <label class="pc-renonce__field"><span>Numéro de commande</span><input type="text" name="contact[Numéro de commande]" required placeholder="Ex. : #1001"></label>
      <label class="pc-renonce__field"><span>Produits concernés</span><input type="text" name="contact[Produits concernés]" placeholder="Toute la commande, ou le nom du produit"></label>
      <label class="pc-renonce__field"><span>Date de réception</span><input type="date" name="contact[Date de réception]"></label>
      <label class="pc-renonce__field"><span>E-mail où recevoir l'accusé de réception</span><input type="email" name="contact[email]" required autocomplete="email" value="{{ customer.email }}"></label>
      <p class="pc-renonce__note">Les articles personnalisés avec votre photo ou votre texte, comme la lune Séléné, ne peuvent pas être repris pour un changement d'avis (article L221-28, 3° du Code de la consommation). S'ils arrivent abîmés ou différents de ce que vous avez envoyé, écrivez-nous depuis la page <a href="/pages/contact">Contact</a>.</p>
      <button type="submit" class="button pc-renonce__submit">Confirmer la rétractation</button>
    {%- endif -%}
  {%- endform -%}
</div>
<style>
  .pc-renonce { width: 100%; max-width: 672px; margin: 0 auto; }
  .pc-renonce__form { display: grid; gap: 16px; }
  .pc-renonce__intro, .pc-renonce__ok p { margin: 0; font-size: 16px; line-height: 1.6; color: #a4abbb; }
  .pc-renonce__ok { display: grid; gap: 10px; padding: 20px; border: 1px solid #26304a; border-radius: 4px; background: #10172b; }
  .pc-renonce__title { color: #efe7d6 !important; font-weight: 600; }
  .pc-renonce__field { display: grid; gap: 6px; font-size: 14px; color: #a4abbb; }
  .pc-renonce__field input { width: 100%; min-width: 0; padding: 12px 14px; border: 1px solid #26304a; border-radius: 4px; background: #0a0f1d; color: #efe7d6; font: inherit; color-scheme: dark; }
  .pc-renonce__field input:focus { outline: 2px solid #d8ad62; outline-offset: 2px; }
  .pc-renonce__note { margin: 0; font-size: 13px; line-height: 1.55; color: #6f7890; }
  .pc-renonce__note a { color: inherit; }
  .pc-renonce__error { margin: 0; font-size: 14px; color: #f08a7e; }
  .pc-renonce__submit { justify-self: start; }
</style>
{%- endif -%}`;

data.sections.pc_renoncer = { type: 'custom-liquid', settings: { custom_liquid: FORM, section_width: 'page-width', 'padding-block-start': 0, 'padding-block-end': 80 } };
data.order = [...data.order.filter((k) => k !== 'pc_renoncer'), 'pc_renoncer'];
fs.writeFileSync(FILE, (header ? `${header}\n` : '') + JSON.stringify(data, null, 2) + '\n');
console.log('page :', data.order.join(' > '));
