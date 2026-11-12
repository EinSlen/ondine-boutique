/**
 * Fiche produit plus proche de l'accueil : la vidéo mer/surf/plongée passe en premier dans la galerie, en lecture
 * automatique, muette et en boucle (comme le héros de l'accueil), et la note Judge.me (theme/kc-rating.liquid) s'affiche
 * sous le titre. L'image de la variante reste juste après la vidéo et revient en premier quand on change d'offre.
 * Les données produit (ordre des médias, images des variantes, flux Merchant Center) ne sont pas touchées.
 *
 * Usage : node fiche-video.mjs            (sauvegarde puis publie, puis vérifie la fiche en ligne)
 *         node fiche-video.mjs --revenir  (remet les fichiers sauvegardés)
 */

import fs from 'node:fs';
import path from 'node:path';
import { rest, ICI_DIR } from './shop.mjs';

const THEME = 190830182728;
const GAL = 'snippets/product-media-gallery.liquid';
const MP = 'sections/main-product.liquid';
const sauvegarde = (key) => path.join(ICI_DIR, 'theme', `${path.basename(key).replace(/\.liquid$/, '')}.avant-video.liquid`);

const lire = async (key) => (await rest('GET', `themes/${THEME}/assets.json?asset[key]=${key}`)).asset.value;
const ecrire = async (key, value) => {
  await rest('PUT', `themes/${THEME}/assets.json`, { asset: { key, value } });
  console.log('publié', key);
};
const remplacer = (texte, avant, apres, quoi) => {
  const n = texte.split(avant).length - 1;
  if (n !== 1) throw new Error(`${quoi} : ${n} occurrence(s) au lieu de 1`);
  return texte.replace(avant, () => apres);
};

if (process.argv.includes('--revenir')) {
  for (const key of [GAL, MP]) await ecrire(key, fs.readFileSync(sauvegarde(key), 'utf8'));
  process.exit(0);
}

let gal = await lire(GAL);
let mp = await lire(MP);
if (gal.includes('kc_video')) {
  console.log('déjà en place', GAL);
  process.exit(0);
}
for (const [key, v] of [[GAL, gal], [MP, mp]]) fs.writeFileSync(sauvegarde(key), v);

gal = remplacer(gal, `{%- liquid
  if section.settings.hide_variants and variant_images.size == product.media.size`, `{%- liquid
  unless limit == 1
    assign kc_video = product.media | where: 'media_type', 'video' | first
  endunless

  if section.settings.hide_variants and variant_images.size == product.media.size`, 'vidéo choisie');

gal = remplacer(gal, `      {%- if product.selected_or_first_available_variant.featured_media != null -%}
        {%- assign featured_media = product.selected_or_first_available_variant.featured_media -%}
        <li
          id="Slide-{{ section.id }}-{{ featured_media.id }}"
          class="product__media-item grid__item slider__slide is-active{% if single_media_visible %}`, `      {%- if kc_video -%}
        <li
          id="Slide-{{ section.id }}-{{ kc_video.id }}"
          class="product__media-item grid__item slider__slide is-active product__media-item--full kc-gallery-video"
          data-media-id="{{ section.id }}-{{ kc_video.id }}"
        >
          <div
            class="product-media-container media-type-video media-fit-cover global-media-settings gradient constrain-height"
            style="--ratio: {{ kc_video.aspect_ratio }}; --preview-ratio: {{ kc_video.aspect_ratio }};"
          >
            <div class="product__media media media--transparent">
              {{ kc_video | video_tag: autoplay: true, loop: true, muted: true, controls: false, image_size: '1100x' }}
            </div>
          </div>
        </li>
      {%- endif -%}
      {%- if product.selected_or_first_available_variant.featured_media != null -%}
        {%- assign featured_media = product.selected_or_first_available_variant.featured_media -%}
        <li
          id="Slide-{{ section.id }}-{{ featured_media.id }}"
          class="product__media-item grid__item slider__slide{% unless kc_video %} is-active{% endunless %}{% if single_media_visible %}`, 'diapo vidéo');

gal = remplacer(gal, `<media-gallery
  id="MediaGallery-{{ section.id }}"`, `{%- if kc_video -%}
  <style>.kc-gallery-video video{object-fit:cover;pointer-events:none}[id$="-video"].thumbnail-list__item:first-child+.thumbnail-list_item--variant{display:list-item}</style>
{%- endif -%}
<media-gallery
  id="MediaGallery-{{ section.id }}"`, 'style de la vidéo');

const boucle = `{%- for media in product.media -%}`;
if (gal.split(boucle).length - 1 !== 2) throw new Error('boucles médias : nombre inattendu');
gal = gal.split(boucle).join(`${boucle}
        {%- if kc_video and media.id == kc_video.id -%}{%- continue -%}{%- endif -%}`);

gal = remplacer(gal, `        {%- if featured_media != null -%}
          {%- liquid
            capture media_index`, `        {%- if kc_video -%}
          <li
            id="Slide-Thumbnails-{{ section.id }}-video"
            class="thumbnail-list__item slider__slide"
            data-target="{{ section.id }}-{{ kc_video.id }}"
            data-media-position="1"
          >
            <span class="thumbnail__badge" aria-hidden="true">
              <span class="svg-wrapper">
                {{- 'icon-play.svg' | inline_asset_content -}}
              </span>
            </span>
            <button
              class="thumbnail global-media-settings global-media-settings--no-shadow"
              aria-label="{{ 'products.product.media.load_video' | t: index: 1 }}"
              aria-current="true"
              aria-controls="GalleryViewer-{{ section.id }}"
              aria-describedby="Thumbnail-{{ section.id }}-video"
            >
              {{
                kc_video.preview_image
                | image_url: width: 416
                | image_tag:
                  loading: 'lazy',
                  sizes: sizes,
                  widths: '54, 74, 104, 162, 208, 324, 416',
                  id: 'Thumbnail-video',
                  alt: kc_video.alt
                | escape
              }}
            </button>
          </li>
        {%- endif -%}
        {%- if featured_media != null -%}
          {%- liquid
            capture media_index`, 'vignette vidéo');

gal = remplacer(gal, `              aria-current="true"
              aria-controls="GalleryViewer-{{ section.id }}"
              aria-describedby="{{ thumbnail_id }}"`, `              {% unless kc_video %}aria-current="true"{% endunless %}
              aria-controls="GalleryViewer-{{ section.id }}"
              aria-describedby="{{ thumbnail_id }}"`, 'vignette de la variante');

mp = remplacer(mp, `                    </a>
                  </div>
                {%- when 'price' -%}`, `                    </a>
                  </div>
                  {% render 'kc-rating', product: product %}
                {%- when 'price' -%}`, 'note sous le titre');

await ecrire(GAL, gal);
await ecrire(MP, mp);

for (const variante of ['54313018884424', '54313320120648']) {
  const html = await (await fetch(`https://kapsulcam.com/products/kapsulcam-4k?variant=${variante}&nc=${Date.now()}`)).text();
  const liste = html.slice(html.indexOf('id="Slider-Gallery-'));
  const diapos = [...liste.matchAll(/data-media-id="[^"]*-(\d+)"/g)].slice(0, 3).map((m) => m[1]);
  const video = liste.slice(0, liste.indexOf('</li>')).match(/<video[^>]*>/)?.[0] || '';
  const ok = {
    videoEnPremier: diapos[0] === '64002257420616',
    autoplay: /autoplay/.test(video) && /muted/.test(video) && /playsinline/.test(video) && /loop/.test(video),
    note: /class="kc-rating"/.test(html),
    erreurLiquid: /Liquid error/.test(html),
  };
  console.log(variante, '| diapos', diapos.join(' '), '|', JSON.stringify(ok), '|', video);
  if (!ok.videoEnPremier || !ok.autoplay || !ok.note || ok.erreurLiquid) process.exitCode = 1;
}
