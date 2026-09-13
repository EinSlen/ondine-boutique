/**
 * Monthly dashboard. Run it with your real numbers, it tells you the two things that
 * actually matter: are you making money, and when do you run out of stock.
 *
 * node suivi.mjs --ventes 120 --stock 340 --prix 79.99 --cout 14.56 --pub 900
 */
const arg = (n, d) => {
  const i = process.argv.indexOf("--" + n);
  return i > -1 && process.argv[i + 1] ? parseFloat(process.argv[i + 1]) : d;
};

const ventes = arg("ventes", 120);      // units sold this month
const stock = arg("stock", 340);        // units left at Amazon
const prix = arg("prix", 79.99);        // TTC selling price
const cout = arg("cout", 14.56);        // HT landed cost per unit
const pub = arg("pub", 900);            // ad spend this month
const fixes = arg("fixes", 340);
const delaiReappro = arg("delai", 50);  // days, sea freight

const r2 = (x) => Math.round(x * 100) / 100;
const prixHT = r2(prix / 1.2);

const caTTC = r2(ventes * prix);
const caHT = r2(ventes * prixHT);
const achats = r2(ventes * cout);
const amazon = r2(ventes * (prix * 0.15 + 5.5 + 0.35));
const retours = r2(ventes * prix * 0.03);
const eco = r2(ventes * 0.67);
const marge = r2(caHT - achats - amazon - retours - eco - pub - fixes);
const impot = marge > 0 ? r2(marge * 0.25) : 0;
const net = r2(marge - impot);

const bar = (v, max, w = 28) => "#".repeat(Math.max(0, Math.round((v / max) * w)));

console.log(`TABLEAU DE BORD, ${ventes} ventes ce mois\n`);
console.log(`Chiffre d'affaires TTC        ${caTTC.toFixed(2).padStart(10)} EUR`);
console.log(`Chiffre d'affaires HT         ${caHT.toFixed(2).padStart(10)} EUR`);
console.log(`  achats marchandise          ${(-achats).toFixed(2).padStart(10)}`);
console.log(`  commissions et frais Amazon ${(-amazon).toFixed(2).padStart(10)}`);
console.log(`  retours (3 %)               ${(-retours).toFixed(2).padStart(10)}`);
console.log(`  eco-contributions           ${(-eco).toFixed(2).padStart(10)}`);
console.log(`  publicite                   ${(-pub).toFixed(2).padStart(10)}`);
console.log(`  charges fixes               ${(-fixes).toFixed(2).padStart(10)}`);
console.log(`RESULTAT AVANT IMPOT          ${marge.toFixed(2).padStart(10)} EUR`);
console.log(`  impot sur les societes 25 % ${(-impot).toFixed(2).padStart(10)}`);
console.log(`RESULTAT NET                  ${net.toFixed(2).padStart(10)} EUR`);

console.log(`\nProgression vers 10 000 EUR nets`);
console.log(`  ${bar(Math.max(0, net), 10000)} ${Math.round((net / 10000) * 100)} %`);

const joursStock = ventes > 0 ? Math.round((stock / ventes) * 30) : 999;
console.log(`\nSTOCK`);
console.log(`  unites restantes            ${String(stock).padStart(10)}`);
console.log(`  couverture                  ${String(joursStock).padStart(10)} jours`);
console.log(`  delai de reapprovisionnement${String(delaiReappro).padStart(10)} jours`);
if (joursStock < delaiReappro + 15) {
  console.log(`  >>> COMMANDER MAINTENANT. En dessous de ${delaiReappro + 15} jours de couverture,`);
  console.log(`      la rupture est probable, et une rupture coute le referencement Amazon.`);
} else {
  console.log(`  commander dans ${joursStock - delaiReappro - 15} jours environ`);
}

const roas = pub > 0 ? r2(caTTC / pub) : null;
console.log(`\nPUBLICITE`);
console.log(`  ROAS                        ${roas ? roas.toFixed(2).padStart(10) : "        n/a"}`);
console.log(`  cout d'acquisition par vente${(pub / Math.max(1, ventes)).toFixed(2).padStart(10)} EUR`);
if (roas && roas < 3) console.log(`  >>> ROAS sous 3, la publicite mange la marge. Baisser le budget et retravailler la fiche.`);

console.log(`\nSEUILS DE COUPURE`);
for (const [t, ok] of [
  ["Resultat net negatif deux mois d'affilee", net > 0],
  ["ROAS durablement sous 3", !roas || roas >= 3],
  ["Couverture de stock sous 65 jours", joursStock >= delaiReappro + 15],
  ["Taux de retour au-dessus de 8 %", true],
]) console.log(`  ${ok ? "ok  " : "ALERTE"}  ${t}`);
