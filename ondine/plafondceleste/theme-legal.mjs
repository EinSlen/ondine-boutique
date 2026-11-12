// Legal product blocks built from boutique/lancement/infos-a-remplir.json: eco-participation line under the price
// (once the WEEE IDU exists) and the "Sécurité et recyclage" accordion content (manufacturer, EU responsible person, warnings)
import fs from 'node:fs';

const INFOS = JSON.parse(fs.readFileSync(new URL('./boutique/lancement/infos-a-remplir.json', import.meta.url), 'utf8'));

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const byHandle = (render) => {
  const cases = Object.entries(INFOS.produits)
    .map(([handle, p]) => [handle, render(p)])
    .filter(([, html]) => html)
    .map(([handle, html]) => `{%- when '${handle}' -%}${html}`);
  return cases.length ? `{%- case product.handle -%}${cases.join('')}{%- endcase -%}` : '';
};

export const ECO = INFOS.deee.idu
  ? `${byHandle((p) => (p.eco_participation_ttc ? `<p class="pc-eco">Dont ${esc(p.eco_participation_ttc)} € d'éco-participation</p>` : ''))}
<style>
  .pc-eco { margin: 0; font-size: 13px; color: #a4abbb; }
</style>`
  : '';

const WARNINGS = [
  'Usage en intérieur, dans un endroit sec.',
  'Ne regardez pas la source lumineuse de près.',
  "Ce n'est pas un jouet. Dans une chambre d'enfant, placez l'appareil et son câble hors de sa portée, jamais dans le lit ni dans le berceau.",
  'Alimentation par câble USB 5 V uniquement. Débranchez-le avant de le nettoyer.',
  "Ne couvrez pas l'appareil quand il est allumé."
];
const BATTERY = 'Contient une batterie rechargeable : chargez-la avec un câble USB 5 V, sous surveillance et loin de toute source de chaleur. Ne la percez pas et ne la jetez pas au feu.';

const identity = (p) => {
  if (!p.fabricant) return '';
  const maker = [p.fabricant, p.adresse_fabricant, p.contact_fabricant].filter(Boolean).map(esc).join(', ');
  const eu = INFOS.responsable_ue ? `<p><strong>Responsable dans l'Union européenne :</strong> ${esc(INFOS.responsable_ue)}</p>` : '';
  return `<p><strong>Fabricant :</strong> ${maker}</p>${eu}`;
};

const warnings = (p) => `<p><strong>Référence :</strong> ${esc(p.reference)}</p><p><strong>Précautions :</strong></p><ul>${[...WARNINGS, ...(p.batterie ? [BATTERY] : [])].map((w) => `<li>${esc(w)}</li>`).join('')}</ul>`;

export const SAFETY = `<div class="pc-safety">
  ${byHandle(identity)}
  ${byHandle(warnings)}
  <p><strong>Recyclage :</strong> ne jetez pas cet appareil avec les ordures ménagères. Déposez-le gratuitement en magasin ou en déchetterie, points de collecte sur <a href="https://quefairedemesdechets.ademe.fr" target="_blank" rel="noopener">quefairedemesdechets.ademe.fr</a>.</p>
</div>
<style>
  .pc-safety { display: grid; gap: 8px; font-size: 14px; line-height: 1.55; color: #a4abbb; }
  .pc-safety p, .pc-safety ul { margin: 0; }
  .pc-safety ul { padding-left: 18px; display: grid; gap: 4px; }
  .pc-safety strong { font-weight: 600; color: #efe7d6; }
  .pc-safety a { color: inherit; }
</style>`;
