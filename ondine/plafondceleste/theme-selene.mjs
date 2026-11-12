// node theme-selene.mjs : builds theme/templates/product.selene.json from product.json for the made-to-order photo moon
// (photo or text fields sent as line item properties, made-to-order delivery and returns wording, no express checkout, no "how it works" band)
import fs from 'node:fs';

const SRC = new URL('./theme/templates/product.json', import.meta.url);
const OUT = new URL('./theme/templates/product.selene.json', import.meta.url);
const raw = fs.readFileSync(SRC, 'utf8');
const header = (raw.match(/^\/\*[\s\S]*?\*\//) || [''])[0];
const data = JSON.parse(raw.slice(header.length));

const PERSO = `{%- assign pc_form = 'BuyButtons-ProductForm-' | append: section.id -%}
<div class="pc-perso" data-pc-perso>
  <p class="pc-perso__title">Votre photo ou votre texte</p>
  <label class="pc-perso__field">
    <span class="pc-perso__label">Votre photo</span>
    <span class="pc-perso__pick"><span class="pc-perso__btn">Choisir une photo</span><span class="pc-perso__name">Aucune photo</span></span>
    <input class="pc-perso__file" type="file" name="properties[Photo]" accept="image/jpeg,image/png,image/webp,image/heic" form="{{ pc_form }}">
  </label>
  <label class="pc-perso__field">
    <span class="pc-perso__label">Ou votre texte, 60 caractères maximum</span>
    <input class="pc-perso__text" type="text" name="properties[Texte]" maxlength="60" placeholder="Ex. : Inès & Malik, 14.02.2024" form="{{ pc_form }}">
  </label>
  <p class="pc-perso__hint">Une photo nette et bien éclairée, avec les visages assez grands, donne le plus beau rendu.</p>
  <p class="pc-perso__error" role="alert" hidden>Ajoutez une photo ou un texte pour personnaliser votre lune.</p>
</div>
<style>
  .pc-perso { display: grid; gap: 12px; padding: 18px 20px; border: 1px solid #26304a; border-radius: 4px; background: #10172b; }
  .pc-perso__title { margin: 0; font-weight: 600; color: #efe7d6; }
  .pc-perso__field { position: relative; display: grid; gap: 6px; font-size: 14px; color: #a4abbb; }
  .pc-perso__pick, .pc-perso__text { width: 100%; min-width: 0; padding: 10px 12px; border: 1px solid #26304a; border-radius: 4px; background: #0a0f1d; color: #efe7d6; font: inherit; }
  .pc-perso__pick { display: flex; align-items: center; gap: 12px; cursor: pointer; }
  .pc-perso__field:focus-within .pc-perso__pick { outline: 2px solid #d8ad62; outline-offset: 2px; }
  .pc-perso__btn { flex: none; padding: 8px 14px; border-radius: 2px; background: #d8ad62; color: #1a1306; font-weight: 600; }
  .pc-perso__name { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: #a4abbb; }
  .pc-perso__file { position: absolute; width: 1px; height: 1px; opacity: 0; pointer-events: none; }
  .pc-perso__text { padding: 12px 14px; }
  .pc-perso__hint { margin: 0; font-size: 13px; color: #6f7890; }
  .pc-perso__error { margin: 0; font-size: 14px; color: #f08a7e; }
  .accelerated-checkout-block { display: none !important; }
</style>
<script>
  (() => {
    if (window.pcPersoReady) return;
    window.pcPersoReady = true;
    const formId = {{ pc_form | json }};
    document.addEventListener('change', (event) => {
      const input = event.target;
      if (!(input instanceof HTMLInputElement) || !input.classList.contains('pc-perso__file')) return;
      const name = input.closest('.pc-perso__field')?.querySelector('.pc-perso__name');
      if (name) name.textContent = input.files && input.files.length ? input.files[0].name : 'Aucune photo';
    });
    document.addEventListener('submit', (event) => {
      const form = event.target;
      if (!(form instanceof HTMLFormElement) || form.getAttribute('id') !== formId) return;
      const root = document.querySelector('[data-pc-perso]');
      if (!root) return;
      const file = root.querySelector('.pc-perso__file');
      const text = root.querySelector('.pc-perso__text');
      const error = root.querySelector('.pc-perso__error');
      const hasFile = Boolean(file.files && file.files.length);
      const hasText = text.value.trim() !== '';
      if (!hasFile && !hasText) {
        event.preventDefault();
        event.stopImmediatePropagation();
        error.hidden = false;
        root.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }
      error.hidden = true;
      for (const [input, filled] of [[file, hasFile], [text, hasText]]) {
        if (filled) continue;
        input.disabled = true;
        setTimeout(() => { input.disabled = false; }, 0);
      }
    }, true);
  })();
</script>`;

const REASSURE = `<ul class="pc-reassure">
  <li><span><strong>Fabriquée à votre commande</strong>, livraison suivie offerte en 3 à 4 semaines</span></li>
  <li><span><strong>Pour Noël</strong>, commandez avant le 20 novembre</span></li>
  <li><span><strong>Arrivée abîmée ou différente de votre photo ?</strong> On la refait ou on rembourse</span></li>
  <li><span><strong>Paiement sécurisé</strong></span></li>
</ul>
<style>
  .pc-reassure { list-style: none; margin: 0; padding: 18px 20px; display: grid; gap: 10px; border: 1px solid #26304a; border-radius: 2px; background: #10172b; font-size: 14px; line-height: 1.45; color: #a4abbb; }
  .pc-reassure li { display: grid; grid-template-columns: 18px minmax(0, 1fr); gap: 8px; }
  .pc-reassure li::before { content: "✦"; color: #d8ad62; }
  .pc-reassure strong { font-weight: 600; color: #efe7d6; }
</style>`;

const SHIPPING = "<p>Chaque lune est fabriquée à votre commande avec votre photo ou votre texte, puis envoyée avec un numéro de suivi. Comptez 3 à 4 semaines au total. Pour l'avoir à Noël, commandez avant le 20 novembre.</p><p>Comme c'est un article personnalisé, il ne peut être ni repris ni échangé. S'il arrive abîmé ou s'il ne correspond pas à ce que vous avez envoyé, écrivez-nous depuis la page Contact avec une photo : on la refait ou on vous rembourse.</p>";
const FAQ = "<p><strong>Quelle photo choisir ?</strong> Une photo nette et bien éclairée, où les visages prennent une bonne partie de l'image. Les photos sombres ou floues rendent moins bien.</p><p><strong>Quel texte ?</strong> Jusqu'à 60 caractères : des prénoms, une date, une courte phrase.</p><p><strong>Comment s'allume-t-elle ?</strong> Elle se recharge en USB et s'utilise ensuite sans fil. La télécommande change la couleur, 16 au choix.</p>";

const main = Object.values(data.sections).find((s) => s.type === 'product-information');
const details = main.blocks['product-details'];
details.blocks.pc_reassure.settings.custom_liquid = REASSURE;
details.blocks.pc_accordion.blocks.row_shipping.blocks.text.settings.text = SHIPPING;
details.blocks.pc_accordion.blocks.row_faq.blocks.text.settings.text = FAQ;
details.blocks.pc_perso = { type: 'custom-liquid', settings: { custom_liquid: PERSO }, blocks: {} };
const order = details.block_order.filter((k) => k !== 'pc_perso');
const buy = order.findIndex((k) => details.blocks[k].type === 'buy-buttons');
details.block_order = [...order.slice(0, buy), 'pc_perso', ...order.slice(buy)];

const gallery = Object.values(main.blocks).find((b) => b.type === '_product-media-gallery');
if (gallery) Object.assign(gallery.settings, { aspect_ratio: '1/1.25', media_fit: 'cover' });

delete data.sections.pc_steps;
data.order = data.order.filter((k) => k !== 'pc_steps');
fs.writeFileSync(OUT, (header ? `${header}\n` : '') + JSON.stringify(data, null, 2) + '\n');
console.log('selene :', details.block_order.join(' > '), '|', data.order.join(' > '));
