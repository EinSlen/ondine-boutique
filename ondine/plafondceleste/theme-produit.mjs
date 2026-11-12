// node theme-produit.mjs : dresses theme/templates/product.json (reassurance under the buy buttons, shipping/returns and FAQ accordion, "how it works" band, French recommendations heading)
import fs from 'node:fs';
import { ECO, SAFETY } from './theme-legal.mjs';

const FILE = new URL('./theme/templates/product.json', import.meta.url);
const raw = fs.readFileSync(FILE, 'utf8');
const header = (raw.match(/^\/\*[\s\S]*?\*\//) || [''])[0];
const data = JSON.parse(raw.slice(header.length));

const REASSURE = `<ul class="pc-reassure">
  <li><span><strong>Livraison suivie offerte</strong> en France, 8 à 15 jours ouvrés</span></li>
  <li><span><strong>Retours sous 14 jours</strong> après réception</span></li>
  <li><span><strong>Arrivé cassé ?</strong> Une photo suffit, on remplace ou on rembourse</span></li>
  <li><span><strong>Paiement sécurisé</strong></span></li>
</ul>
<style>
  .pc-reassure { list-style: none; margin: 0; padding: 18px 20px; display: grid; gap: 10px; border: 1px solid #26304a; border-radius: 2px; background: #10172b; font-size: 14px; line-height: 1.45; color: #a4abbb; }
  .pc-reassure li { display: grid; grid-template-columns: 18px minmax(0, 1fr); gap: 8px; }
  .pc-reassure li::before { content: "✦"; color: #d8ad62; }
  .pc-reassure strong { font-weight: 500; color: #efe7d6; }
</style>`;

const STEPS = `<section class="pc-steps">
  <p class="pc-steps__kicker">Comment ça marche</p>
  <ol class="pc-steps__list">
    <li><span class="pc-steps__num">01</span><h3>Branchez</h3><p>En USB, près du lit : un adaptateur secteur, un ordinateur ou une batterie suffit.</p></li>
    <li><span class="pc-steps__num">02</span><h3>Éteignez</h3><p>La pièce dans le noir, c'est là que tout commence.</p></li>
    <li><span class="pc-steps__num">03</span><h3>Regardez en l'air</h3><p>L'image s'affiche au plafond d'une chambre, à 2 ou 3 m.</p></li>
  </ol>
</section>
<style>
  .pc-steps { width: 100%; max-width: var(--page-width, 1240px); margin: 0 auto; padding: clamp(48px, 7vw, 88px) var(--page-margin, 20px); border-top: 1px solid rgba(239, 231, 214, .12); }
  .pc-steps__kicker { margin: 0 0 28px; font-size: 12px; letter-spacing: .22em; text-transform: uppercase; color: #d8ad62; }
  .pc-steps__list { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 32px; }
  .pc-steps__num { display: block; font-family: var(--font-accent--family); font-style: italic; font-weight: 400; font-size: 40px; line-height: 1; color: #d8ad62; }
  .pc-steps h3 { margin: 10px 0 8px; font-family: var(--font-heading--family); font-weight: 600; font-size: 26px; letter-spacing: -.02em; color: #efe7d6; }
  .pc-steps p { margin: 0; max-width: 34ch; font-size: 15px; line-height: 1.6; color: #a4abbb; text-wrap: pretty; }
  @media (max-width: 760px) { .pc-steps__list { grid-template-columns: minmax(0, 1fr); gap: 24px; } }
</style>`;

// Reviews header: hides the whole section when the product has no review yet; the marketplace line only on products whose reviews were imported
const AVIS_HEAD = `{%- assign pc_review_count = product.metafields.reviews.rating_count.value | default: 0 -%}
{%- if pc_review_count > 0 or product.handle == 'lucarne' -%}
<div class="pc-avis">
  <h2 class="pc-avis__title">Ce qu'en disent les acheteurs</h2>
  {%- if product.handle == 'lucarne' -%}<p class="pc-avis__note">Avis d'acheteurs de ce modèle sur une place de marché, traduits.</p>{%- endif -%}
</div>
{%- else -%}
<style>#shopify-section-{{ section.id }} { display: none; }</style>
{%- endif -%}
<style>
  .pc-avis { display: grid; gap: 6px; }
  .pc-avis__title { margin: 0; font-family: var(--font-heading--family); font-weight: 600; font-size: clamp(28px, 3.2vw, 38px); letter-spacing: -.03em; color: #efe7d6; }
  .pc-avis__note { margin: 0; font-size: 12px; color: #6f7890; }
  .jm-review-widget, .jm-review-item, .jm-review-widget [style*="--jm-review-widget"] {
    --jm-review-widget-text-color: #efe7d6 !important;
    --jm-review-widget-lighter-text-color: #a4abbb !important;
    --jm-review-widget-star-and-histogram-color: #d8ad62 !important;
    --jm-review-widget-button-color: #d8ad62 !important;
    --jm-review-widget-button-text-color: #1a1306 !important;
    --jm-widget-primary-color: #d8ad62 !important;
    --jm-widget-border-radius: 2px !important;
    --jm-question-color: #a4abbb !important;
    --jm-track-bg: #26304a !important;
  }
  .jm-review-widget-minimal-header__title { display: none !important; }
  .jdgm-widget-revamp hr, .jm-review-widget [class*="divider"] { border-color: rgba(239, 231, 214, .12) !important; }
  .jdgm-write-review-modal__overlay { background: rgba(6, 10, 21, .82) !important; }
  .jdgm-write-review-modal__content { background: #10172b !important; color: #efe7d6 !important; border: 1px solid #26304a !important; border-radius: 4px !important; }
  .jdgm-write-review-modal__title, .jdgm-write-review-modal__product-title, .jdgm-write-review-modal__status, .jdgm-write-review-modal__field-label, .jdgm-write-review-modal__checkbox-text, .jdgm-write-review-modal__text { color: #efe7d6 !important; }
  .jdgm-write-review-modal__title { font-family: var(--font-heading--family) !important; font-weight: 600 !important; letter-spacing: -.02em !important; }
  .jdgm-write-review-modal__intro, .jdgm-write-review-modal__gdpr-statement, .jdgm-write-review-modal__gdpr-statement a, .jdgm-write-review-modal__field-help, .jdgm-write-review-modal__media-upload-prompt, .jdgm-write-review-modal__media-upload-prompt b { color: #a4abbb !important; }
  .jdgm-write-review-modal .jdgm-star { color: #d8ad62 !important; }
  .jdgm-write-review-modal__stars::before, .jdgm-write-review-modal__stars::after { color: #a4abbb !important; }
  .jdgm-write-review-modal__field-input { background: #0a0f1d !important; color: #efe7d6 !important; border: 1px solid #26304a !important; border-radius: 4px !important; }
  .jdgm-write-review-modal__field-input::placeholder { color: #6f7890 !important; }
  .jdgm-write-review-modal__field-input:focus { outline: 2px solid #d8ad62 !important; outline-offset: 2px !important; }
  .jdgm-write-review-modal__checkbox-custom { background: #0a0f1d !important; border-color: #6f7890 !important; }
  .jdgm-write-review-modal__field-group--media-upload { border-color: #26304a !important; }
  .jdgm-write-review-modal__field-group--media-upload path { fill: #a4abbb !important; }
  .jdgm-write-review-modal__nav-btn:not(.jdgm-write-review-modal__nav-btn-back) { background: #d8ad62 !important; color: #1a1306 !important; border-radius: 2px !important; }
  .jdgm-write-review-modal__nav-btn-back { color: #a4abbb !important; }
  .jdgm-write-review-modal__close-btn path { stroke: #efe7d6 !important; }
  .jdgm-write-review-modal__close-btn:focus-visible { outline: 2px solid #d8ad62 !important; outline-offset: 2px !important; }
  .jdgm-modal__overlay { background: rgba(6, 10, 21, .82) !important; }
  .jdgm-modal .jm-content { background: #10172b !important; color: #efe7d6 !important; }
  .jdgm-modal .jm-carousel, .jdgm-modal .jm-media__blur { background-color: #0a0f1d !important; }
  .jdgm-modal .jm-indicator__close, .jdgm-modal .jm-navigation__previous, .jdgm-modal .jm-navigation__next { background: rgba(10, 15, 29, .8) !important; color: #efe7d6 !important; }
  .jdgm-modal .jm-media-grid__item--active { border-color: #d8ad62 !important; }
</style>`;

const row = (heading, html) => ({
  type: '_accordion-row',
  settings: { heading, open_by_default: false },
  blocks: { text: { type: 'text', settings: { text: html, width: '100%' }, blocks: {} } },
  block_order: ['text']
});

const ACCORDION = {
  type: 'accordion',
  settings: { type_preset: 'paragraph' },
  blocks: {
    row_shipping: row('Livraison et retours', '<p>Chaque commande part avec un numéro de suivi, envoyé par e-mail dès l\'expédition. Comptez 8 à 15 jours ouvrés pour la France. Pour Noël, commandez avant le 1er décembre.</p><p>Vous avez 14 jours après réception pour changer d\'avis : écrivez-nous depuis la page Contact avec votre numéro de commande. Le remboursement est fait sous 14 jours après réception du retour.</p>'),
    row_faq: row('Questions fréquentes', '<p><strong>Ça marche dans une grande pièce ?</strong> Ces lumières sont faites pour un plafond de chambre, à 2 ou 3 m. Dans un grand salon, l\'image s\'étale et pâlit.</p><p><strong>Comment ça s\'alimente ?</strong> En USB : sur une prise murale avec un adaptateur, un ordinateur ou une batterie.</p><p><strong>Et si le produit arrive cassé ?</strong> Envoyez une photo, on remplace ou on rembourse.</p>'),
    row_safety: {
      type: '_accordion-row',
      settings: { heading: 'Sécurité et recyclage', open_by_default: false },
      blocks: { liquid: { type: 'custom-liquid', settings: { custom_liquid: SAFETY }, blocks: {} } },
      block_order: ['liquid']
    }
  },
  block_order: ['row_shipping', 'row_faq', 'row_safety']
};

const main = Object.values(data.sections).find((s) => s.type === 'product-information');
const details = main.blocks['product-details'];
details.blocks.pc_reassure = { type: 'custom-liquid', settings: { custom_liquid: REASSURE }, blocks: {} };
details.blocks.pc_accordion = ACCORDION;
const base = details.block_order.filter((k) => !k.startsWith('pc_'));
const buy = base.findIndex((k) => details.blocks[k].type === 'buy-buttons');
details.block_order = [...base.slice(0, buy + 1), 'pc_reassure', ...base.slice(buy + 1), 'pc_accordion'];

const priceGroup = Object.values(details.blocks).find((b) => b.blocks && Object.values(b.blocks).some((c) => c.type === 'price'));
delete priceGroup.blocks.pc_eco;
priceGroup.block_order = priceGroup.block_order.filter((k) => k !== 'pc_eco');
if (ECO) {
  priceGroup.blocks.pc_eco = { type: 'custom-liquid', settings: { custom_liquid: ECO }, blocks: {} };
  const price = priceGroup.block_order.findIndex((k) => priceGroup.blocks[k].type === 'price');
  priceGroup.block_order.splice(price + 1, 0, 'pc_eco');
}

data.sections.pc_steps = { type: 'custom-liquid', settings: { custom_liquid: STEPS, section_width: 'full-width', 'padding-block-start': 0, 'padding-block-end': 0 } };

const recoKey = Object.keys(data.sections).find((k) => data.sections[k].type === 'product-recommendations');
for (const b of Object.values(data.sections[recoKey].blocks)) {
  if (b.type === 'text') b.settings.text = '<h3>À voir aussi au plafond</h3>';
}

data.sections.pc_avis = {
  type: 'section',
  settings: { content_direction: 'column', gap: 8, section_width: 'page-width', 'padding-block-start': 56, 'padding-block-end': 24 },
  blocks: {
    pc_avis_head: { type: 'custom-liquid', settings: { custom_liquid: AVIS_HEAD }, blocks: {} },
    pc_avis_widget: { type: 'shopify://apps/judge-me-reviews/blocks/review_widget/61ccd3b1-a9f2-4160-9fe9-4fec8413e5d8', settings: {} }
  },
  block_order: ['pc_avis_head', 'pc_avis_widget']
};

const mainKey = Object.keys(data.sections).find((k) => data.sections[k] === main);
const mine = [mainKey, 'pc_steps', 'pc_avis', recoKey];
data.order = [...mine, ...data.order.filter((k) => !mine.includes(k))];
fs.writeFileSync(FILE, (header ? `${header}\n` : '') + JSON.stringify(data, null, 2) + '\n');
console.log('produit :', details.block_order.join(' > '), '|', data.order.join(' > '));
