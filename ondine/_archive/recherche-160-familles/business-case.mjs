/**
 * Full case for the only product out of ~190 families that can carry 10 000 EUR a month.
 *
 * Niveau laser vert 4x360 degres, 16 lignes, autonivelant, avec trepied.
 * Measured 06/08/2026: Amazon FR volume price 79,99 EUR on 500 monthly purchases,
 * 1 650 monthly purchases across the query, Alibaba 11,37 to 13,12 EUR for the same spec.
 */
const CPA_LOW = 16, CPA_MID = 25, CPA_HIGH = 35;
const FEE = (p) => p * 0.014 + 0.25;
const VAT = 0.20, DUTY = 0.035;
const r2 = (x) => Math.round(x * 100) / 100;
const landed = (unit, kg, frKg) => r2((unit + frKg * kg) * (1 + DUTY) * (1 + VAT));

const PRICE = 79.99;      // where the volume sits on Amazon FR
const FLOOR = 65.54;      // p25, the aggressive competitor
const UNIT = 13.12;       // Alibaba, high end of the range = small order
const UNIT_VOL = 11.37;   // Alibaba, high volume
const KG = 1.8;
const MARKET = 1650;      // monthly purchases measured on the query

console.log("NIVEAU LASER VERT 4x360, 16 LIGNES, AUTONIVELANT AVEC TREPIED\n");
console.log("Marche mesure: " + MARKET + " achats/mois. Prix du volume: " + PRICE.toFixed(2)
  + " EUR. Plancher: " + FLOOR.toFixed(2) + " EUR.\n");

console.log("=== COUT RENDU SELON LE FRET ===");
console.log("fret                 EUR/kg   petit lot   gros volume   delai");
for (const [n, k, d] of [["aerien express", 6.50, "5 a 10 j"], ["aerien economique", 3.50, "12 a 20 j"], ["maritime groupage", 1.50, "35 a 50 j"]]) {
  console.log(n.padEnd(20) + String(k).padStart(6) + landed(UNIT, KG, k).toFixed(2).padStart(12)
    + landed(UNIT_VOL, KG, k).toFixed(2).padStart(14) + "   " + d);
}

const cost = landed(UNIT_VOL, KG, 1.50);
console.log(`\nRetenu: maritime en volume, cout rendu ${cost.toFixed(2)} EUR.\n`);

console.log("=== MARGE NETTE PAR VENTE SELON LE CPA ===");
console.log("prix de vente     CPA 16     CPA 25     CPA 35");
for (const p of [PRICE, FLOOR, 59.99]) {
  const line = [CPA_LOW, CPA_MID, CPA_HIGH].map((c) => r2(p - cost - FEE(p) - c).toFixed(2).padStart(10)).join(" ");
  console.log(`${p.toFixed(2).padStart(13)} ${line}`);
}

console.log("\n=== REVENU MENSUEL SELON LA PART DE MARCHE ===");
console.log("part   ventes/mois   CPA 16      CPA 25      CPA 35");
for (const share of [0.05, 0.10, 0.15, 0.20, 0.30]) {
  const n = Math.round(MARKET * share);
  const cells = [CPA_LOW, CPA_MID, CPA_HIGH].map((c) => {
    const m = r2(PRICE - cost - FEE(PRICE) - c);
    return r2(n * m).toFixed(0).padStart(11);
  }).join(" ");
  console.log(`${(share * 100).toFixed(0).padStart(3)}%${String(n).padStart(13)} ${cells}`);
}

console.log("\n=== MISE DE DEPART ET SEUIL ===");
const m16 = r2(PRICE - cost - FEE(PRICE) - CPA_LOW);
const m25 = r2(PRICE - cost - FEE(PRICE) - CPA_MID);
for (const q of [50, 100, 300, 500]) {
  const cash = r2(cost * q);
  console.log(`  ${String(q).padStart(3)} unites   mise ${cash.toFixed(2).padStart(9)} EUR   poids ${String(Math.round(KG * q)).padStart(4)} kg`
    + `   rentable a ${String(Math.ceil(cash / m25)).padStart(3)} ventes (CPA 25)`);
}

console.log("\n=== CHEMIN VERS 10 000 PUIS 100 000 EUR PAR MOIS ===");
for (const target of [10000, 30000, 100000]) {
  const n16 = Math.ceil(target / m16), n25 = Math.ceil(target / m25);
  console.log(`${String(target).padStart(6)} EUR/mois: ${String(n25).padStart(4)} ventes/mois a CPA 25`
    + ` (${Math.round(100 * n25 / MARKET)} % du marche mesure)`
    + `   budget pub ${r2(n25 * CPA_MID).toFixed(0)} EUR/mois   stock ${r2(n25 * cost).toFixed(0)} EUR/mois`);
}

console.log("\nLe marche mesure est celui d'UNE requete. Le marche reel du niveau laser est plus");
console.log("large (plusieurs requetes, Leroy Merlin, ManoMano, Cdiscount, B2B). 100 000 EUR/mois");
console.log("demande de sortir d'Amazon comme reference et d'ouvrir d'autres canaux.");
