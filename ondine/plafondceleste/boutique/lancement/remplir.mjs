// node remplir.mjs : fills the legal pages from infos-a-remplir.json (SIRET, consumer mediator, eco-organism IDUs),
// writes them to ../politiques/ and lists what is still missing before the store can open
import fs from 'node:fs';

const here = (p) => new URL(p, import.meta.url);
const infos = JSON.parse(fs.readFileSync(here('./infos-a-remplir.json'), 'utf8'));
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const missing = [];

const siret = infos.siret.replace(/\s+/g, '');
if (!siret) missing.push('SIRET (déclaration de la micro-entreprise)');
else if (!/^\d{14}$/.test(siret)) throw new Error(`SIRET invalide : ${infos.siret} (14 chiffres attendus)`);
const siretText = siret ? `${siret.slice(0, 3)} ${siret.slice(3, 6)} ${siret.slice(6, 9)} ${siret.slice(9)}` : "en cours d'attribution";

const m = infos.mediateur;
if (!m.adhesion_faite) missing.push(`médiateur de la consommation (adhésion ${m.nom})`);
const mediatorLine = `${esc(m.nom)}, ${esc(m.adresse)}, <a href="${esc(m.site)}">${esc(m.site.replace(/^https?:\/\//, ''))}</a>`;
const MEDIATION = m.adhesion_faite
  ? `En cas de litige, le client adresse d'abord une réclamation écrite au vendeur depuis la page <a href="/pages/contact">Contact</a>. Si le litige n'est pas réglé, il peut recourir gratuitement au médiateur de la consommation dont relève le vendeur : ${mediatorLine}, en déposant sa demande sur ce site dans un délai d'un an à compter de sa réclamation écrite. À défaut, les tribunaux compétents sont ceux prévus par la loi.`
  : "En cas de difficulté, le client peut d'abord contacter le vendeur pour trouver une solution amiable. Il peut ensuite recourir gratuitement à un médiateur de la consommation (désignation en cours). À défaut, les tribunaux compétents sont ceux prévus par la loi.";

const idus = [
  ['deee', 'équipements électriques et électroniques'],
  ['emballages', 'emballages ménagers'],
  ['piles', 'piles et batteries']
].map(([key, label]) => {
  const { eco_organisme: org, idu } = infos[key];
  if (!idu) missing.push(`IDU ${label} (adhésion ${org})`);
  return idu ? `Identifiant unique (IDU) ${label} : ${esc(idu)}, éco-organisme ${esc(org)}.` : '';
}).filter(Boolean);

const missingMakers = Object.entries(infos.produits).filter(([, p]) => !p.fabricant).map(([h]) => h);
if (missingMakers.length) missing.push(`fabricant et adresse pour : ${missingMakers.join(', ')} (demande aux fournisseurs)`);

const tokens = {
  SIRET: siretText,
  MEDIATION,
  ECO_PRIX: infos.deee.idu ? " Les prix des appareils électriques comprennent l'éco-participation, indiquée sur chaque fiche produit et reversée à l'éco-organisme chargé de leur recyclage." : '',
  IDU_CGV: idus.length ? ` ${idus.join(' ')}` : '',
  IDU_ML: idus.length ? `\n<h2>Recyclage</h2>\n<p>${idus.join('<br>')}</p>` : '',
  MEDIATEUR_ML: m.adhesion_faite ? `\n<h2>Médiateur de la consommation</h2>\n<p>${mediatorLine}</p>` : '',
  MEDIATEUR_COORD: m.adhesion_faite ? `\n<p>Médiateur de la consommation : ${mediatorLine}</p>` : ''
};

for (const name of ['conditions-de-vente', 'mentions-legales', 'coordonnees']) {
  const model = fs.readFileSync(here(`./modeles/${name}.html`), 'utf8');
  const html = model.replace(/\{\{([A-Z_]+)\}\}/g, (all, key) => {
    if (!(key in tokens)) throw new Error(`jeton inconnu ${all} dans ${name}.html`);
    return tokens[key];
  });
  fs.writeFileSync(here(`../politiques/${name}.html`), html);
  console.log('écrit politiques/' + name + '.html');
}

console.log(missing.length ? `\nEncore à remplir avant d'ouvrir :\n- ${missing.join('\n- ')}` : '\nTout est rempli.');
