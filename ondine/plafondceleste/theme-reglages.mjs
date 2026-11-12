// node theme-reglages.mjs : applies the Plafond Céleste look to theme/config/settings_data.json (current settings only, comment header kept)
import fs from 'node:fs';

const FILE = new URL('./theme/config/settings_data.json', import.meta.url);
const raw = fs.readFileSync(FILE, 'utf8');
const header = raw.match(/^\/\*[\s\S]*?\*\//)[0];
const data = JSON.parse(raw.slice(header.length));
const c = data.current;

Object.assign(c, {
  type_body_font: 'plus_jakarta_sans_n4',
  type_subheading_font: 'plus_jakarta_sans_n5',
  type_heading_font: 'plus_jakarta_sans_n6',
  type_accent_font: 'instrument_serif_i4',
  type_size_paragraph: '16',
  type_size_h1: '64',
  type_size_h2: '44',
  type_letter_spacing_h1: 'heading-tight',
  type_letter_spacing_h2: 'heading-tight',
  type_letter_spacing_h3: 'heading-tight',
  page_width: 'normal',
  card_hover_effect: 'lift',
  palette_primary_button_background: '#d8ad62',
  palette_primary_button_text: '#1a1306',
  palette_primary_button_border: '#d8ad62',
  button_border_radius_primary: 2,
  button_border_radius_secondary: 2,
  inputs_border_radius: 2,
  popover_border_radius: 4,
  variant_button_radius: 2,
  card_corner_radius: 2,
  badge_corner_radius: 2,
  badge_sold_out_background_color: '#151e36',
  color_palette: {
    background: '#0a0f1d',
    foreground: '#efe7d6',
    color1: '#a4abbb',
    color2: '#26304a'
  }
});

fs.writeFileSync(FILE, `${header}\n${JSON.stringify(data, null, 2)}\n`);
console.log('réglages appliqués');
