// Writes product.json, index.json, header/footer groups for the KapsulCam theme.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ICI = path.dirname(fileURLToPath(import.meta.url));
const w = (f, o) => { for (const k of Object.keys(o.sections)) if (!o.order.includes(k)) delete o.sections[k]; fs.writeFileSync(path.join(ICI, f), JSON.stringify(o, null, 2)); };

const buyBlocks = {
  title: { type: 'title', settings: {} },
  price: { type: 'price', settings: {} },
  buybox: { type: 'custom_liquid', settings: { custom_liquid: "{% render 'kc-buybox', product: product, section_id: section.id %}" } },
  variant_picker: { type: 'variant_picker', settings: { picker_type: 'button', swatch_shape: 'circle' } },
  buy_buttons: { type: 'buy_buttons', settings: { show_dynamic_checkout: false, show_gift_card_recipient: false } },
  trust: { type: 'custom_liquid', settings: { custom_liquid: "{% render 'kc-trust' %}{% render 'kc-sticky', product: product, section_id: section.id %}" } },
};

const tabs = {
  tab_specs: {
    type: 'collapsible_tab',
    settings: {
      heading: 'Caractéristiques', icon: 'eye',
      content: '<ul><li>Vidéo 4K, encodage H.265</li><li>Poids : 36 g</li><li>Dimensions : 6,4 x 2,8 x 1,8 cm</li><li>Autonomie : jusqu\'à 90 min (Wi-Fi coupé), recharge USB-C</li><li>Stockage : microSD jusqu\'à 128 Go</li><li>Wi-Fi et appli gratuite iOS / Android</li><li>Étanche jusqu\'à 30 m dans le caisson fourni</li></ul>',
    },
  },
  tab_box: {
    type: 'collapsible_tab',
    settings: {
      heading: 'Dans la boîte', icon: 'box',
      content: '<ul><li>Caméra 4K</li><li>Caisson étanche 30 m</li><li>Collier magnétique</li><li>Clip dos</li><li>Bracelet</li><li>Support guidon vélo et moto</li><li>Câble USB-C</li><li>Notice</li><li>Avec le Pack Complet : carte microSD 64 Go et perche-trépied 3 en 1</li></ul>',
    },
  },
  tab_ship: {
    type: 'collapsible_tab',
    settings: {
      heading: 'Livraison et retours', icon: 'truck',
      content: '<p>Livraison suivie offerte en France, Belgique et Luxembourg, en 10 à 18 jours ouvrés. Un numéro de suivi vous est envoyé par e-mail dès l\'expédition.</p><p>Satisfait ou remboursé 30 jours pour une caméra complète et non utilisée. Garantie légale de conformité de 2 ans.</p>',
    },
  },
  tab_safety: {
    type: 'collapsible_tab',
    settings: {
      heading: 'Consignes de sécurité', icon: 'lock',
      content: '<ul><li>Batterie lithium intégrée : ne pas exposer à une forte chaleur (plus de 45 °C), ne pas percer ni démonter, recharger uniquement avec le câble USB-C fourni ou un chargeur 5 V.</li><li>La caméra seule n\'est pas étanche : utilisez le caisson fourni pour l\'eau.</li><li>Petites pièces et collier : tenir hors de portée des enfants de moins de 3 ans. Ne pas laisser le collier autour du cou d\'un enfant sans surveillance.</li><li>Respectez la vie privée : filmer des personnes sans leur accord peut être interdit.</li><li>Appareil électrique : ne pas jeter avec les ordures ménagères, à déposer dans un point de collecte.</li></ul>',
    },
  },
};

const landing = `
<style>
.kc-wrap{max-width:1320px;margin:0 auto;padding:0 24px;color:#111;letter-spacing:0}
.kc-h{font-size:clamp(30px,4vw,48px);font-weight:500;letter-spacing:-1.2px;line-height:1.05;margin:0 0 14px}
.kc-sub{font-size:17px;color:#6b6b6b;line-height:1.55;margin:0 0 26px;max-width:640px}
.kc-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}
.kc-card{border-radius:20px;overflow:hidden;background:rgba(255,255,255,.06)}
.kc-card img{display:block;width:100%;height:auto}
.kc-card p{margin:0;padding:16px 18px;font-weight:600}
.kc-two{display:grid;grid-template-columns:1fr 1fr;gap:40px;align-items:center}
.kc-two img{width:100%;border-radius:20px;display:block}
.kc-band{display:grid;grid-template-columns:repeat(4,1fr);text-align:center;background:#f3f3f1;border-radius:20px;padding:26px 10px}
.kc-band div{padding:4px 10px;border-left:1px solid #dcdcd8;font-size:14px;color:#6b6b6b}.kc-band div:first-child{border-left:0}
.kc-band b{display:block;font-size:26px;font-weight:500;color:#111;letter-spacing:-.8px;margin-bottom:2px}
.kc-cmp{width:100%;border-collapse:separate;border-spacing:0 8px;font-size:16px}
.kc-cmp th{font-size:12px;letter-spacing:1px;text-transform:uppercase;color:#6b6b6b;font-weight:600;padding:0 10px 4px;text-align:center}
.kc-cmp td{padding:16px 12px;background:#f3f3f1;text-align:center}
.kc-cmp td:first-child{text-align:left;font-weight:600;border-radius:12px 0 0 12px}
.kc-cmp td:last-child{border-radius:0 12px 12px 0}
.kc-cmp .kc-cmp-us{color:#111;font-weight:700}
.kc-cmp td.kc-cmp-us{background:#fff;box-shadow:inset 0 0 0 1.5px #111}
@media(max-width:749px){.kc-grid,.kc-two{grid-template-columns:1fr}.kc-cmp{font-size:13px}.kc-cmp td{padding:12px 6px;white-space:nowrap}.kc-cmp td:first-child{white-space:normal;font-size:12.5px;line-height:1.25}.kc-cmp th{font-size:10px;letter-spacing:.4px;padding:0 4px 4px}.kc-band{grid-template-columns:repeat(2,1fr);row-gap:18px}.kc-band div:nth-child(3){border-left:0}}
</style>
<div class="kc-wrap">
  <div class="kc-band">
    <div><b>4K</b>Ultra HD</div><div><b>36 g</b>sur vous</div><div><b>30 m</b>étanche (caisson)</div><div><b>90 min</b>d'autonomie</div>
  </div>
</div>`;

const usages = `
<div class="kc-wrap">
  <h2 class="kc-h">Tout ce que vous vivez, filmé de votre point de vue</h2>
  <p class="kc-sub">VTT, moto, ski, plongée, balades avec les enfants ou le chien, voyages : vous profitez du moment, KapsulCam s'occupe du reste.</p>
  <div class="kc-grid">
    <div class="kc-card"><img src="{{ 'kc-02-partout.jpg' | asset_url }}" alt="KapsulCam fixée sur un casque, un guidon et un tableau de bord" loading="lazy"><p>Se fixe partout, en quelques secondes</p></div>
    <div class="kc-card"><img src="{{ 'kc-03-etanche.jpg' | asset_url }}" alt="KapsulCam en plongée dans son caisson" loading="lazy"><p>Mer, piscine, pluie : étanche jusqu'à 30 m</p></div>
    <div class="kc-card"><img src="{{ 'kc-04-un-appui.jpg' | asset_url }}" alt="KapsulCam portée au quotidien" loading="lazy"><p>Un appui sur le bouton, elle filme</p></div>
  </div>
</div>`;

const comparatif = `
<div class="kc-wrap kc-two">
  <table class="kc-cmp">
    <tr><th></th><th class="kc-cmp-us">KapsulCam</th><th>Smartphone</th><th>Action cam</th></tr>
    <tr><td>Mains libres</td><td class="kc-cmp-us">Oui</td><td>Non</td><td>Oui</td></tr>
    <tr><td>Poids</td><td class="kc-cmp-us">36 g</td><td>200 g</td><td>150 g</td></tr>
    <tr><td>Se porte sur soi</td><td class="kc-cmp-us">Oui</td><td>Non</td><td>Harnais</td></tr>
    <tr><td>Étanche 30 m</td><td class="kc-cmp-us">Oui</td><td>Non</td><td>Oui</td></tr>
    <tr><td>Prix</td><td class="kc-cmp-us">89,90 €</td><td>-</td><td>300 € et +</td></tr>
  </table>
  <div>
    <h2 class="kc-h">Plus besoin de choisir entre vivre et filmer</h2>
    <p class="kc-sub">Le téléphone occupe une main et rate l'action. Une action cam classique pèse lourd et coûte plus de 300 €. KapsulCam pèse 36 g, se porte sur vous et filme en 4K, pour 89,90 € avec tous les accessoires.</p>
    <a class="button" href="{{ routes.root_url }}products/kapsulcam-4k">Je la veux</a>
  </div>
</div>`;

const faq = {
  type: 'collapsible-content',
  blocks: Object.fromEntries([
    ['Quelle carte mémoire faut-il ?', 'Une carte microSD jusqu'à 128 Go (classe U3 conseillée). Elle est incluse dans le Pack Complet, avec la perche-trépied. Avec le Duo, ajoutez le kit carte + perche.'],
    ['Est-elle étanche sans le caisson ?', 'La caméra seule résiste aux éclaboussures. Pour la piscine, la mer ou la plongée jusqu\'à 30 m, glissez-la dans le caisson étanche fourni.'],
    ['Comment récupérer mes vidéos ?', 'Par Wi-Fi avec l\'appli gratuite (iPhone et Android) : aperçu en direct, téléchargement et partage. Ou par câble USB-C sur ordinateur.'],
    ['Combien de temps dure la batterie ?', 'Jusqu\'à 90 minutes d\'enregistrement Wi-Fi coupé. La recharge se fait en USB-C.'],
    ['Quels sont les délais de livraison ?', 'La livraison suivie est offerte en France, Belgique et Luxembourg et prend 10 à 18 jours ouvrés. Vous recevez le numéro de suivi par e-mail dès l\'expédition.'],
    ['Sera-t-elle livrée avant Noël ?', 'Oui pour toute commande passée avant le 25 novembre, en France, en Belgique et au Luxembourg. Après cette date, la livraison peut arriver après Noël : la date estimée est indiquée sur la page du produit.'],
    ['Et si elle ne me plaît pas ?', 'Vous avez 30 jours après réception pour nous la renvoyer complète, non utilisée et dans son emballage d\'origine : nous vous remboursons. Écrivez-nous depuis la page Contact. Garantie légale de conformité de 2 ans en plus.'],
  ].map(([q, a], i) => [`q${i}`, { type: 'collapsible_row', settings: { heading: q, icon: 'question_mark', row_content: `<p>${a}</p>` } }])),
  settings: { caption: '', heading: 'Des questions ? On vous répond.', heading_size: 'h1', heading_alignment: 'left', layout: 'none', container_color_scheme: 'scheme-1', color_scheme: 'scheme-1', open_first_collapsible_row: false, padding_top: 36, padding_bottom: 52 },
};
faq.block_order = Object.keys(faq.blocks);

const custom = (liquid, top = 36, bottom = 36) => ({ type: 'custom-liquid', settings: { custom_liquid: liquid, color_scheme: 'scheme-1', padding_top: top, padding_bottom: bottom } });

const mainSettings = {
  enable_sticky_info: true, color_scheme: 'scheme-1', media_size: 'medium', constrain_to_viewport: true,
  media_fit: 'contain', gallery_layout: 'columns', mobile_thumbnails: 'show', media_position: 'left',
  image_zoom: 'lightbox', hide_variants: true, enable_video_looping: true, padding_top: 24, padding_bottom: 12,
};

const blockOrder = ['title', 'price', 'buybox', 'variant_picker', 'buy_buttons', 'trust', 'tab_specs', 'tab_box', 'tab_ship', 'tab_safety'];

w('product.json', {
  sections: {
    main: { type: 'main-product', blocks: { ...buyBlocks, ...tabs }, block_order: blockOrder, settings: mainSettings },
    activites: custom("{% render 'kc-activites' %}", 72, 24),
    hero: custom("{% render 'kc-hero' %}", 0, 8),
    banner: custom("{% render 'kc-banner' %}", 0, 0),
    etapes: custom("{% render 'kc-etapes' %}", 64, 24),
    band: custom(landing, 36, 24),
    comparatif: custom(comparatif),
    avisNote: custom(`<div class="kc-wrap"><h2 class="kc-h">Ce qu'en disent les acheteurs</h2><p class="kc-sub" style="font-size:14px;margin:0">Avis d'acheteurs de ce modèle (version 4K) sur une place de marché, traduits automatiquement. Les avis des clients KapsulCam s'ajoutent ici après leur livraison.</p></div>`, 56, 0),
    avis: { type: 'apps', blocks: { jm: { type: 'shopify://apps/judge-me-reviews/blocks/review_widget/61ccd3b1-a9f2-4160-9fe9-4fec8413e5d8', settings: {} } }, block_order: ['jm'], settings: { include_margins: true } },
    faq,
  },
  order: ['main', 'activites', 'etapes', 'band', 'comparatif', 'avisNote', 'avis', 'faq', 'banner'],
});

w('index.json', {
  sections: {
    produit: {
      type: 'featured-product',
      blocks: { ...buyBlocks, buybox: { type: 'custom_liquid', settings: { custom_liquid: "{% render 'kc-buybox', product: section.settings.product, section_id: section.id %}" } }, trust: { type: 'custom_liquid', settings: { custom_liquid: "{% render 'kc-trust' %}{% render 'kc-sticky', product: section.settings.product, section_id: section.id %}" } } },
      block_order: blockOrder.filter((b) => !b.startsWith('tab_')),
      settings: { product: 'kapsulcam-4k', color_scheme: 'scheme-1', secondary_background: false, media_size: 'medium', constrain_to_viewport: true, media_fit: 'contain', media_position: 'left', image_zoom: 'lightbox', hide_variants: false, enable_video_looping: true, padding_top: 24, padding_bottom: 12 },
    },
    activites: custom("{% render 'kc-activites' %}", 72, 24),
    hero: custom("{% render 'kc-hero' %}", 0, 8),
    banner: custom("{% render 'kc-banner' %}", 0, 0),
    etapes: custom("{% render 'kc-etapes' %}", 64, 24),
    band: custom(landing, 36, 24),
    comparatif: custom(comparatif),
    faq,
  },
  order: ['hero', 'produit', 'activites', 'etapes', 'band', 'comparatif', 'faq', 'banner'],
});
w('product.accessoire.json', {
  sections: {
    main: {
      type: 'main-product',
      blocks: {
        title: buyBlocks.title,
        price: buyBlocks.price,
        description: { type: 'description', settings: {} },
        buy_buttons: buyBlocks.buy_buttons,
        compat: { type: 'custom_liquid', settings: { custom_liquid: `<p style="margin:4px 0 0;font-size:14px;color:#6b6b6b">Compatible avec la <a href="{{ routes.root_url }}products/kapsulcam-4k" style="color:#111">KapsulCam 4K</a>, et aussi incluse dans son Pack Complet.</p>` } },
        trust: { type: 'custom_liquid', settings: { custom_liquid: "{% render 'kc-trust' %}" } },
        tab_ship: tabs.tab_ship,
      },
      block_order: ['title', 'price', 'description', 'buy_buttons', 'compat', 'trust', 'tab_ship'],
      settings: { ...mainSettings, gallery_layout: 'stacked' },
    },
    banner: custom("{% render 'kc-banner' %}", 0, 0),
  },
  order: ['main', 'banner'],
});
console.log('templates écrits');
