/**
 * Zero-touch model: the supplier ships straight into Amazon FBA, Valentin never handles
 * the goods. Standard Amazon private label practice.
 *
 * The sample was doing three jobs. Each one has to be replaced by a delegated service,
 * because as the importer he carries the liability whether he saw the product or not.
 */
const r2 = (x) => Math.round(x * 100) / 100;

console.log("MODELE SANS MANIPULATION, fournisseur vers Amazon FBA en direct\n");

console.log("=== CE QUE L'ECHANTILLON FAISAIT, ET PAR QUOI LE REMPLACER ===\n");
const JOBS = [
  {
    job: "Verifier la qualite reelle",
    replace: "Inspection tierce partie en usine avant expedition",
    who: "QIMA, SGS ou Bureau Veritas",
    cost: 250,
    when: "avant chaque commande, puis 1 sur 3 en routine",
    note: "plus rigoureux qu'un echantillon: controle sur le lot reel, pas sur une piece choisie",
  },
  {
    job: "Verifier la conformite CE",
    replace: "Rapports de test d'un laboratoire accredite, exiges du fournisseur",
    who: "fournisseur, rapports EN 60825-1 (laser), CE, RoHS",
    cost: 0,
    when: "avant la premiere commande, sans exception",
    note: "si le fournisseur ne les a pas, il ne faut pas travailler avec lui",
  },
  {
    job: "Produire les visuels",
    replace: "Une unite livree a un studio photo qui shoote et renvoie les fichiers",
    who: "studio produit FR, ou service photo en Chine",
    cost: 220,
    when: "une fois",
    note: "tu ne touches rien, le studio recoit, photographie et archive ou detruit",
  },
];
let oneShot = 0;
for (const j of JOBS) {
  oneShot += j.cost;
  console.log(`${j.job}`);
  console.log(`   remplace par : ${j.replace}`);
  console.log(`   prestataire  : ${j.who}`);
  console.log(`   cout         : ${j.cost === 0 ? "inclus, a exiger" : j.cost + " EUR"}   (${j.when})`);
  console.log(`   ${j.note}\n`);
}
console.log(`Cout total de mise en place, une seule fois: ${oneShot} EUR.\n`);

console.log("=== IMPACT SUR L'ECONOMIE ===");
const GROSS = 24.04;          // marge brute par unite, modele complet
const FIRST_ORDER = 70;       // unites de la premiere commande
const inspectionPerUnit = r2(250 / FIRST_ORDER);
const photoAmort = r2(220 / 500);   // amorti sur 500 unites
console.log(`  Inspection, repartie sur ${FIRST_ORDER} unites          -${inspectionPerUnit.toFixed(2)} EUR/unite`);
console.log(`  Photos, amorties sur 500 unites            -${photoAmort.toFixed(2)} EUR/unite`);
console.log(`  Marge brute revisee                         ${r2(GROSS - inspectionPerUnit - photoAmort).toFixed(2)} EUR/unite`);
console.log(`  En routine (inspection 1 commande sur 3)    ${r2(GROSS - inspectionPerUnit / 3 - photoAmort).toFixed(2)} EUR/unite`);

console.log("\n=== CIRCUIT COMPLET, PERSONNE NE TOUCHE LE PRODUIT SAUF LES PRESTATAIRES ===");
const FLOW = [
  "1. Tu commandes en ligne chez le fournisseur, paiement par virement ou Trade Assurance",
  "2. Le fournisseur produit, puis QIMA inspecte le lot dans l'usine et t'envoie un rapport photo",
  "3. Tu valides ou tu refuses le lot sur la base du rapport, avant paiement du solde",
  "4. Le transitaire enleve en usine, gere le fret, la douane et la TVA a l'import",
  "5. Le transitaire livre directement a l'entrepot Amazon FBA, etiquettes FNSKU posees en usine",
  "6. Amazon receptionne, stocke, expedie, gere retours et service client",
  "7. Amazon te reverse tous les 14 jours sur le compte pro",
];
for (const s of FLOW) console.log("  " + s);

console.log("\n=== CE QUI RESTE A TA CHARGE, ET C'EST TOUT ===");
for (const s of [
  "Passer la commande et payer (en ligne)",
  "Lire le rapport d'inspection et dire oui ou non (en ligne)",
  "Valider les fiches produit redigees par IA (en ligne)",
  "Suivre la tresorerie et le stock (en ligne)",
]) console.log("  - " + s);

console.log("\n=== LES RISQUES QUE CE MODELE NE SUPPRIME PAS ===");
for (const [r, p] of [
  ["Tu restes responsable comme importateur, meme sans avoir vu le produit",
   "RC professionnelle + rapports CE archives + inspection documentee"],
  ["Un defaut de serie passe l'inspection par echantillonnage",
   "Inspection AQL niveau II, et clause de retour aux frais du fournisseur"],
  ["Les photos fournisseur ne correspondent pas au lot livre",
   "C'est exactement ce que le studio photo sur produit reel evite"],
  ["Le fournisseur change de specification sans prevenir",
   "Cahier des charges ecrit, et inspection a chaque changement de lot"],
]) console.log(`  ${r}\n      parade: ${p}`);
