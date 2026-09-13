/**
 * Step 4 of the corrected protocol: floor price divided by landed cost.
 * Below 3 there is no room for a 12 to 20 EUR French CPA plus a margin.
 */
import { readFileSync } from "node:fs";

const HERE = "C:\\Users\\Valentin\\Desktop\\Ondine\\recherche";

/**
 * Google Shopping medians measured the same day by hunt.mjs.
 * `matched: false` means the AliExpress query returned a different product than the French
 * one, so the ratio is meaningless. Checked by eye on the titles, never trust the number
 * alone: "edible ink cake printer" returns 2,42 EUR Phomemo label printers.
 */
const MARKET = {
  "hangboard-CN": { fr: 79.40, label: "planche suspension escalade", pickup: 0, matched: true },
  "bonsai-CN": { fr: 60.00, label: "outillage bonsai", pickup: 0, matched: false, got: "mini-pelles plastique pour succulentes" },
  "moulincafe-CN": { fr: 57.99, label: "moulin a cafe manuel", pickup: 0, matched: true },
  "filamentdry-CN": { fr: 58.89, label: "sechoir filament 3d", pickup: 0, matched: false, got: "boites de rangement passives, pas de sechoir chauffant" },
  "couveuse-CN": { fr: 59.99, label: "couveuse oeufs", pickup: 0, matched: true },
  "growtent-CN": { fr: 94.99, label: "tente hydroponie", pickup: 0, matched: true },
  "cakeprint-CN": { fr: 259.56, label: "imprimante alimentaire", pickup: 0, matched: false, got: "imprimantes thermiques d'etiquettes Phomemo" },
  "fermenteur-CN": { fr: 170.00, label: "fermenteur biere", pickup: 0, matched: true },
};

const all = JSON.parse(readFileSync(`${HERE}\\ali3.json`, "utf8"));
const r2 = (x) => Math.round(x * 100) / 100;
const stats = (v) => {
  const s = v.filter((x) => x != null).sort((a, b) => a - b);
  if (!s.length) return null;
  const p = (q) => s[Math.min(s.length - 1, Math.floor(s.length * q))];
  return { n: s.length, min: s[0], p25: p(0.25), med: p(0.5) };
};

console.log("Ratio prix plancher France / cout rendu AliExpress, mesure le 06/08/2026.\n");
console.log("produit                    marche   coutP25  coutMed   ratioP25  ratioMed  verdict");

const rows = [];
for (const r of all) {
  const m = MARKET[r.tag];
  if (!m) continue;
  // Multipacks advertise a "(x,xx€/pc)" unit note: their headline is not a unit price.
  const clean = r.items.filter((i) => !i.ad && !/\(\s*[\d,]+\s*€\s*\/\s*pc\s*\)/i.test(i.text));
  const cost = clean.map((i) => i.landed ?? i.price);
  const s = stats(cost);
  if (!s) { console.log(`${m.label.padEnd(26)} aucune donnee`); continue; }

  const rP25 = r2(m.fr / s.p25);
  const rMed = r2(m.fr / s.med);
  const verdict = !m.matched ? "APPARIEMENT RATE" : rMed >= 3 ? "A CREUSER" : rP25 >= 3 ? "limite" : "elimine";
  if (m.matched) rows.push({ ...m, ...s, rP25, rMed, verdict });
  else {
    console.log(`${m.label.padEnd(26)} ${m.fr.toFixed(2).padStart(7)} ${s.p25.toFixed(2).padStart(9)} ${s.med.toFixed(2).padStart(8)}`
      + `        ratio non calculable  ${verdict}`);
    console.log(`${" ".repeat(26)} AliExpress renvoie: ${m.got}`);
    continue;
  }
  console.log(`${m.label.padEnd(26)} ${m.fr.toFixed(2).padStart(7)} ${s.p25.toFixed(2).padStart(9)} ${s.med.toFixed(2).padStart(8)}`
    + ` ${String(rP25).padStart(10)} ${String(rMed).padStart(9)}  ${verdict}`);
}

console.log("\nMarge apres pub, prix de vente = plancher marche, CPA 16 EUR, frais Shopify 1,4% + 0,25:");
for (const r of rows.sort((a, b) => b.rMed - a.rMed)) {
  const fee = r2(r.fr * 0.014 + 0.25);
  const net = r2(r.fr - r.med - fee - 16);
  console.log(`  ${r.label.padEnd(26)} vente ${r.fr.toFixed(2).padStart(7)}  cout ${r.med.toFixed(2).padStart(7)}  net ${net.toFixed(2).padStart(8)} ${net > 8 ? " VIABLE" : net > 0 ? " serre" : " negatif"}`);
}

console.log("\nRappel du produit abandonne, pour comparaison:");
console.log(`  fontaine a eau chat        vente   23.99  cout   22.90  net   -15.25  negatif`);
