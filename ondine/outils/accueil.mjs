/**
 * Construit la page d'accueil de dead2me sur le thème donné.
 *
 * Parti pris, repris de live2die : très peu de sections, pas de carrousel, pas de
 * témoignages inventés. Une accroche, les tirages uniques d'abord parce que c'est ce qui
 * fait la marque, la série ouverte ensuite, et trois lignes qui expliquent la fabrication.
 * Les sections d'origine du thème qui exigent des images sont retirées : une section vide
 * affiche un cadre gris, ce qui fait plus amateur qu'une page courte.
 *
 * Usage : node accueil.mjs --id 188585640264
 */

import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { BRAND } from './content.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const env = (() => {
  const f = path.join(HERE, '.env');
  const out = {};
  if (existsSync(f)) {
    for (const l of readFileSync(f, 'utf8').split(/\r?\n/)) {
      const m = l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  }
  return { ...out, ...process.env };
})();

const BASE = `https://${env.SHOPIFY_STORE}/admin/api/${env.SHOPIFY_API_VERSION || '2026-07'}`;
const H = { 'X-Shopify-Access-Token': env.SHOPIFY_TOKEN, 'Content-Type': 'application/json' };
const ID = (() => {
  const i = process.argv.indexOf('--id');
  return i > -1 ? process.argv[i + 1] : null;
})();
if (!ID) {
  console.error('Il manque --id');
  process.exit(1);
}

const api = async (chemin, options = {}) => {
  const r = await fetch(BASE + chemin, { headers: H, ...options });
  const txt = await r.text();
  if (!r.ok) throw new Error(`HTTP ${r.status} sur ${chemin} : ${txt.slice(0, 250)}`);
  return txt ? JSON.parse(txt) : {};
};

const page = {
  sections: {
    accroche: {
      type: 'rich-text',
      blocks: {
        titre: {
          type: 'heading',
          settings: { heading: 'Un motif, un exemplaire.', heading_size: 'hxl' },
        },
        texte: {
          type: 'text',
          settings: {
            text:
              '<p>Des pièces imprimées sur le tissu avant la couture, en Europe. ' +
              'Les tirages uniques ne reviennent jamais : quand le motif part, il est retiré.</p>',
          },
        },
        bouton: {
          type: 'button',
          settings: {
            button_label: 'Voir les tirages uniques',
            button_link: 'shopify://collections/tirages-uniques',
            button_style_secondary: false,
          },
        },
      },
      block_order: ['titre', 'texte', 'bouton'],
      settings: {
        desktop_content_position: 'center',
        content_alignment: 'center',
        color_scheme: 'scheme-3',
        full_width: true,
        padding_top: 60,
        padding_bottom: 52,
      },
    },

    uniques: {
      type: 'featured-collection',
      blocks: {},
      block_order: [],
      settings: {
        title: 'Tirages uniques',
        heading_size: 'h1',
        description:
          "<p>Un seul exemplaire par motif, dans une seule taille. C'est ce qui les rend uniques.</p>",
        show_description: true,
        collection: 'tirages-uniques',
        products_to_show: 8,
        columns_desktop: 4,
        full_width: false,
        show_view_all: true,
        view_all_style: 'link',
        enable_desktop_slider: false,
        color_scheme: 'scheme-1',
        image_ratio: 'portrait',
        image_shape: 'default',
        show_secondary_image: true,
        show_vendor: false,
        show_rating: false,
        columns_mobile: '2',
        swipe_on_mobile: false,
        padding_top: 44,
        padding_bottom: 28,
      },
    },

    serie: {
      type: 'featured-collection',
      blocks: {},
      block_order: [],
      settings: {
        title: 'Série ouverte',
        heading_size: 'h1',
        description:
          '<p>Les pièces disponibles en continu, même fabrication, sans la rareté.</p>',
        show_description: true,
        collection: 'serie-ouverte',
        products_to_show: 8,
        columns_desktop: 4,
        full_width: false,
        show_view_all: true,
        view_all_style: 'link',
        enable_desktop_slider: false,
        color_scheme: 'scheme-1',
        image_ratio: 'portrait',
        image_shape: 'default',
        show_secondary_image: true,
        show_vendor: false,
        show_rating: false,
        columns_mobile: '2',
        swipe_on_mobile: false,
        padding_top: 28,
        padding_bottom: 44,
      },
    },

    fabrication: {
      type: 'multicolumn',
      blocks: {
        c1: {
          type: 'column',
          settings: {
            title: 'Imprimé avant la couture',
            text:
              '<p>Le tissu passe sous l’imprimante en pièces détachées, puis il est coupé et cousu. ' +
              'Le motif couvre le vêtement entier, sans bord ni raccord.</p>',
          },
        },
        c2: {
          type: 'column',
          settings: {
            title: 'Fabriqué en Europe',
            text:
              '<p>Chaque commande est fabriquée en Lettonie ou en Espagne, puis expédiée ' +
              'directement. Aucun entrepôt intermédiaire, aucun stock.</p>',
          },
        },
        c3: {
          type: 'column',
          settings: {
            title: 'Numéroté, pas décoratif',
            text:
              '<p>Le numéro d’un tirage unique n’est attribué qu’une fois, et sa fiche ' +
              'disparaît après la vente. C’est vérifiable.</p>',
          },
        },
      },
      block_order: ['c1', 'c2', 'c3'],
      settings: {
        title: 'Comment c’est fait',
        heading_size: 'h2',
        image_width: 'full',
        image_ratio: 'adapt',
        columns_desktop: 3,
        column_alignment: 'left',
        background_style: 'none',
        button_label: '',
        button_link: '',
        color_scheme: 'scheme-2',
        columns_mobile: '1',
        swipe_on_mobile: false,
        padding_top: 44,
        padding_bottom: 44,
      },
    },
  },
  order: ['accroche', 'uniques', 'serie', 'fabrication'],
};

await api(`/themes/${ID}/assets.json`, {
  method: 'PUT',
  body: JSON.stringify({
    asset: { key: 'templates/index.json', value: JSON.stringify(page, null, 2) },
  }),
});

console.log(`page d'accueil écrite sur le thème ${ID} pour ${BRAND.displayName}`);
console.log(`  4 sections : accroche, tirages uniques, série ouverte, comment c'est fait`);
console.log(`  retirées : bannière image, collage, vidéo, qui exigent des visuels`);
