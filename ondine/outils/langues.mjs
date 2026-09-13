/**
 * Active les langues de la boutique et pousse les traductions.
 *
 * PRÉREQUIS, ET C'EST LE SEUL BLOCAGE : le jeton de l'app privée doit porter
 * `read_locales`, `write_locales`, `read_translations` et `write_translations`. Sans eux
 * l'API répond « Access denied for shopLocales ». Le script vérifie et le dit avant de rien
 * tenter, plutôt que d'échouer à mi-chemin en laissant une langue activée sans traduction.
 *
 * POURQUOI TRADUIRE ET ACTIVER DANS LE MÊME PASSAGE : une langue publiée sans traduction ne
 * montre pas une boutique en anglais, elle montre la boutique en français à des gens qui
 * attendaient de l'anglais. C'est pire que pas de langue du tout. Les deux opérations sont
 * donc liées ici et la publication n'a lieu qu'après l'écriture des textes.
 *
 * CE QUI EST TRADUIT : les cinq fiches produit et la collection. Les textes du THÈME (boutons,
 * panier, formulaires) n'ont pas besoin de nous : Dawn embarque ses propres fichiers de langue
 * et Shopify les sert dès que la langue existe.
 *
 * Usage :
 *   node langues.mjs                    vérifie les droits et montre ce qui serait fait
 *   node langues.mjs --appliquer        écrit les traductions puis publie la langue
 *   node langues.mjs --langues en,de    plusieurs langues (seul l'anglais est rédigé ici)
 */

import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ICI = path.dirname(fileURLToPath(import.meta.url));
const APPLIQUER = process.argv.includes('--appliquer');
const arg = (n, d) => {
  const i = process.argv.indexOf(`--${n}`);
  return i > -1 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const LANGUES = arg('langues', 'en').split(',').map((s) => s.trim()).filter(Boolean);

const env = (() => {
  const f = path.join(ICI, '.env');
  const out = {};
  if (!existsSync(f)) return out;
  for (const l of readFileSync(f, 'utf8').split(/\r?\n/)) {
    const m = l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
  return out;
})();
const BASE = `https://${env.SHOPIFY_STORE}/admin/api/${env.SHOPIFY_API_VERSION || '2026-01'}/`;
const H = { 'X-Shopify-Access-Token': env.SHOPIFY_TOKEN, 'Content-Type': 'application/json' };
const gql = async (query, variables) => {
  const r = await fetch(`${BASE}graphql.json`, { method: 'POST', headers: H, body: JSON.stringify({ query, variables }) });
  return r.json();
};

/**
 * Les textes anglais. Ce ne sont pas des traductions littérales du français : le registre de
 * la marque EST anglais au départ, phrases courtes et parlées, adressées à quelqu'un d'absent.
 * Traduire mot à mot le français aurait donné de la fiche technique traduite.
 */
const EN = {
  'split-figures-zip': {
    titre: 'SPLIT FIGURES ZIP',
    phrase: 'Two silhouettes, the zip between them. Nobody crosses.',
    corps: 'Black zip hoodie. The artwork is built around the zip, which does the separating: two white silhouettes either side, uneven burgundy paint.',
  },
  'aftermath-zip': {
    titre: 'AFTERMATH ZIP',
    phrase: "Everything's been said. The gestures are what's left.",
    corps: 'Grey zip hoodie. Two figures with opposite gestures, split by the zip, burgundy laid over the scene.',
  },
  'seated-figure-zip': {
    titre: 'SEATED FIGURE ZIP',
    phrase: 'Sitting, and nobody comes.',
    corps: 'Grey zip hoodie. Black seated silhouette, dry framing, deliberately uneven burgundy, placed to work with the zip.',
  },
  'table-alone-zip': {
    titre: 'TABLE ALONE ZIP',
    phrase: 'The table on one side. You on the other.',
    corps: 'Grey zip hoodie. The zip cuts the scene in two: the table on one side, the lone figure on the other, burgundy accents.',
  },
  'run-away-tee': {
    titre: 'RUN AWAY TEE',
    phrase: 'She ran. You watched.',
    corps: 'White tee. Two black silhouettes in motion, a lot of empty space around them, burgundy concentrated on the scene.',
  },
};
const PIED_EN =
  '<p><strong>Sizes:</strong> S to XXL. Check the size guide before ordering.</p>' +
  '<p>Printed in Europe, made to order.</p>';

const corpsHtml = (t) => `<p><em>${t.phrase}</em></p><p>${t.corps}</p>${PIED_EN}`;

const droits = async () => {
  const r = await fetch(`${BASE.replace(/api\/.*/, '')}oauth/access_scopes.json`, { headers: H });
  const j = await r.json();
  const noms = (j.access_scopes || []).map((x) => x.handle);
  const manquants = ['read_locales', 'write_locales', 'read_translations', 'write_translations'].filter(
    (n) => !noms.includes(n),
  );
  return { noms, manquants };
};

/**
 * `translationsRegister` exige l'empreinte du contenu source de CHAQUE champ. Sans elle
 * Shopify refuse, parce que l'empreinte est ce qui garantit que la traduction correspond bien
 * à la version actuelle du texte d'origine.
 */
const empreintes = async (id) => {
  const r = await gql(
    'query($id:ID!){translatableResource(resourceId:$id){translatableContent{key digest}}}',
    { id },
  );
  const out = {};
  for (const c of r.data?.translatableResource?.translatableContent || []) out[c.key] = c.digest;
  return out;
};

const main = async () => {
  const { noms, manquants } = await droits();
  if (manquants.length) {
    console.log('DROITS INSUFFISANTS. Le jeton porte :');
    console.log(`  ${noms.join(', ')}`);
    console.log('\nIl manque :');
    for (const m of manquants) console.log(`  ${m}`);
    console.log(
      '\nÀ faire une fois dans l\'admin : Paramètres, Applications et canaux de vente,\n' +
        'Développer des applications, ton application, Configuration, API Admin,\n' +
        'coche les quatre portées, Enregistrer, puis régénère le jeton et remplace\n' +
        `SHOPIFY_TOKEN dans ${path.join(ICI, '.env')}. Relance ensuite ce script.`,
    );
    // On sort par le code de retour et non par process.exit : couper le processus pendant que
    // la requête HTTP se referme faisait remonter une assertion libuv sous Windows.
    process.exitCode = 1;
    return;
  }

  const j = await (await fetch(`${BASE}products.json?limit=250&status=active`, { headers: H })).json();
  const produits = (j.products || []).filter((p) => EN[p.handle]);
  console.log(`langues visées : ${LANGUES.join(', ')}`);
  console.log(`fiches à traduire : ${produits.length}`);
  for (const p of produits) console.log(`  ${p.handle.padEnd(20)} ${EN[p.handle].phrase}`);
  if (!APPLIQUER) {
    console.log('\nRien écrit. Relance avec --appliquer.');
    return;
  }

  for (const code of LANGUES) {
    // La langue est ajoutée NON publiée : on écrit les textes d'abord, on publie ensuite.
    let r = await gql(
      'mutation($l:String!){shopLocaleEnable(locale:$l){shopLocale{locale} userErrors{message}}}',
      { l: code },
    );
    const e = r.data?.shopLocaleEnable?.userErrors || [];
    console.log(`langue ${code} :`, e.length ? JSON.stringify(e).slice(0, 150) : 'ajoutée');

    if (code !== 'en') {
      console.log(`  ${code} : aucun texte rédigé pour cette langue, la fiche restera en français.`);
      continue;
    }

    for (const p of produits) {
      const id = `gid://shopify/Product/${p.id}`;
      const d = await empreintes(id);
      const t = EN[p.handle];
      const trads = [];
      if (d.title) trads.push({ key: 'title', locale: code, value: t.titre, translatableContentDigest: d.title });
      if (d.body_html) trads.push({ key: 'body_html', locale: code, value: corpsHtml(t), translatableContentDigest: d.body_html });
      r = await gql(
        'mutation($id:ID!,$t:[TranslationInput!]!){translationsRegister(resourceId:$id,translations:$t){userErrors{field message}}}',
        { id, t: trads },
      );
      const er = r.data?.translationsRegister?.userErrors || [];
      console.log(`  ${p.handle.padEnd(20)}`, er.length ? JSON.stringify(er).slice(0, 150) : `${trads.length} champs traduits`);
    }

    r = await gql(
      'mutation($l:String!){shopLocaleUpdate(locale:$l,shopLocale:{published:true}){shopLocale{locale published} userErrors{message}}}',
      { l: code },
    );
    const ep = r.data?.shopLocaleUpdate?.userErrors || [];
    console.log(`langue ${code} publiée :`, ep.length ? JSON.stringify(ep).slice(0, 150) : 'oui');
  }
};

main().catch((e) => {
  console.error(`ECHEC : ${e.message}`);
  process.exit(1);
});
