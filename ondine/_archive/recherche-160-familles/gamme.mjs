/**
 * Range play: a shop is not one product. Five references at 2 000 EUR a month beat one
 * hypothetical at 10 000, and each needs a market ten times smaller.
 *
 * Groups everything measured into coherent universes and sums what each could carry.
 * A universe only counts if its references share a buyer, otherwise it is not a shop,
 * it is a bazaar, and no single ad audience reaches it.
 */
import { readFileSync, readdirSync } from "node:fs";

const HERE = "C:\\Users\\Valentin\\Desktop\\Ondine\\recherche";
const CPA = 16, TARGET = 10000;
const FEE = (p) => p * 0.014 + 0.25;
const r2 = (x) => Math.round(x * 100) / 100;

const UNIVERS = {
  "toilettage et veterinaire pro": [/secheur chien/i, /tondeuse veterinaire/i, /otoscope veterinaire/i,
    /balance electronique animaux/i, /tondeuse pour cheval/i, /licol/i, /materiel traite/i],
  "atelier electronique": [/fer a souder/i, /station soudage/i, /FNIRSI/i, /multimetre/i,
    /pince amperemetrique/i, /alimentation laboratoire/i, /microscope soudure/i, /station reprise bga/i],
  "laboratoire et mesure": [/balance de precision/i, /ph metre/i, /conductimetre/i, /refractometre/i,
    /microscope scolaire/i, /microscope trinoculaire/i, /luxmetre/i, /sonometre/i, /anemometre/i],
  "frigoriste et climatisation": [/manometre frigoriste/i, /pompe a vide frigoriste/i, /detecteur gaz/i,
    /analyseur de combustion/i],
  "impression 3d": [/imprimante 3d/i, /filament/i, /resine impression/i, /buse imprimante/i, /plateau magnetique/i,
    /sechoir a filament/i],
  "photo et video": [/filtre nd/i, /K&F/i, /teleprompteur/i, /slider/i, /bras articule micro/i, /panneau acoustique/i],
  "poterie et ceramique": [/tour de poterie/i, /four ceramique/i, /kit poterie/i, /gouges/i],
  "chantier et batiment": [/niveau laser/i, /camera thermique/i, /testeur installation/i, /testeur de terre/i,
    /camera inspection/i, /cle dynamometrique/i, /disque diamant/i, /lame scie/i],
};

const seen = new Map();
for (const f of readdirSync(HERE).filter((f) => /^res-.*\.json$/.test(f))) {
  for (const r of JSON.parse(readFileSync(`${HERE}\\${f}`, "utf8"))) {
    const s = r.summary;
    if (!s || !s.boughtSum || s.p25 == null) continue;
    const org = (r.items || []).filter((i) => !i.sponsored && i.price != null && i.boughtMonth);
    const top = org.sort((a, b) => b.boughtMonth - a.boughtMonth)[0];
    const price = top ? Math.min(top.price, s.p25) : s.p25;
    if (!price || price < 20) continue;
    const prev = seen.get(r.query);
    if (!prev || prev.demand < s.boughtSum) seen.set(r.query, { kw: r.query, price, demand: s.boughtSum, brand: s.brandPct ?? 0 });
  }
}

// Best observed landed ratio across the study: 25 % of selling price.
const margin = (p) => r2(p - p * 0.25 - FEE(p) - CPA);

console.log(`Potentiel par univers, part de marche 15 %, cout rendu 25 % du prix.\n`);
const results = [];
for (const [name, pats] of Object.entries(UNIVERS)) {
  const members = [...seen.values()].filter((r) => pats.some((p) => p.test(r.kw)) && margin(r.price) > 0);
  if (!members.length) continue;
  const total = members.reduce((a, r) => a + r.demand * 0.15 * margin(r.price), 0);
  results.push({ name, members, total: r2(total) });
}
results.sort((a, b) => b.total - a.total);

for (const u of results) {
  console.log(`### ${u.name.toUpperCase()}  ->  ${u.total.toFixed(0)} EUR/mois  (${u.members.length} references)`);
  for (const m of u.members.sort((a, b) => b.demand * margin(b.price) - a.demand * margin(a.price))) {
    console.log(`    ${m.kw.slice(0, 34).padEnd(34)} ${m.price.toFixed(2).padStart(7)} x ${String(m.demand).padStart(5)}/mois`
      + `  marge ${margin(m.price).toFixed(2).padStart(6)}  ->  ${r2(m.demand * 0.15 * margin(m.price)).toFixed(0).padStart(6)} EUR/mois`);
  }
  console.log();
}

console.log("=== CONFRONTATION A LA CIBLE ===");
for (const u of results) {
  const pct = Math.round((100 * u.total) / TARGET);
  console.log(`${u.name.padEnd(32)} ${u.total.toFixed(0).padStart(7)} EUR/mois  =  ${pct} % de la cible`
    + (u.total >= TARGET ? "  ATTEINT" : ""));
}
console.log("\nUn univers ne compte que si ses references partagent le meme acheteur: c'est ce qui");
console.log("permet une seule audience publicitaire et un panier moyen superieur a une reference.");
