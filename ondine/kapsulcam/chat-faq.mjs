// Adds the KapsulCam FAQ to Shopify Knowledge Base (used by the Inbox AI agent), through the admin open in Edge (port 9222).
// node chat-faq.mjs [from] [to]   -> indexes of FAQ to add (default: all)
import { createRequire } from 'node:module';
const require = createRequire('C:/Users/Valentin/node_modules/');
const puppeteer = require('puppeteer-core');

export const FAQ = [
  ['Quels sont les délais de livraison ?', "La livraison suivie est offerte en France, en Belgique et au Luxembourg : expédition sous 1 à 3 jours ouvrés, puis livraison en 10 à 18 jours ouvrés. Le numéro de suivi est envoyé par e-mail dès l'expédition."],
  ['Dans quels pays livrez-vous ?', 'Nous livrons pour le moment la France, la Belgique et le Luxembourg, avec la livraison suivie offerte.'],
  ['Quelle est votre politique de retour ?', "Satisfait ou remboursé 30 jours : renvoyez la caméra complète, non utilisée et dans son emballage d'origine, et nous vous remboursons dès réception, frais de retour à votre charge. Écrivez-nous depuis la page Contact avec votre numéro de commande pour recevoir l'adresse de retour."],
  ['La carte mémoire est-elle incluse ?', "La carte microSD 64 Go est incluse dans le Pack Complet. Avec l'offre Caméra + accessoires, il faut une carte microSD jusqu'à 128 Go (classe U3 conseillée), aussi vendue séparément sur la boutique."],
  ['La caméra est-elle étanche ?', "La caméra seule résiste aux éclaboussures. Pour la piscine, la mer ou la plongée jusqu'à 30 m, elle se glisse dans le caisson étanche fourni."],
  ['Combien de temps dure la batterie ?', "Jusqu'à 90 minutes d'enregistrement avec le Wi-Fi coupé, et la recharge se fait en USB-C."],
  ['Comment récupérer mes vidéos ?', "Par Wi-Fi avec l'appli gratuite iPhone et Android (aperçu en direct, téléchargement et partage), ou par câble USB-C sur ordinateur."],
  ["Qu'y a-t-il dans la boîte ?", "La caméra 4K, le caisson étanche 30 m, le collier magnétique, le clip dos, le bracelet, le support guidon vélo et moto, le câble USB-C et la notice. Le Pack Complet ajoute une carte microSD 64 Go et une perche-trépied 3 en 1."],
  ['Quelle est la garantie ?', 'La caméra bénéficie de la garantie légale de conformité de 2 ans : en cas de défaut, envoyez-nous une photo ou une vidéo du problème, nous la remplaçons ou vous remboursons, frais de retour compris.'],
  ['Comment contacter le service client ?', 'Par ce chat ou depuis la page Contact du site : nous répondons sous 24 h ouvrées.'],
  ['La caméra a-t-elle une stabilisation ?', "Non, la KapsulCam n'a pas de stabilisation électronique. Pour des images plus stables, portez-la sur le casque ou le torse (collier magnétique ou clip), où il y a moins de vibrations que sur un guidon."],
  ['Quelle carte microSD est compatible ?', "Une carte microSD jusqu'à 128 Go, de préférence en classe U3. La carte 64 Go est incluse dans le Pack Complet."],
];

const [from = 0, to = FAQ.length] = process.argv.slice(2).map(Number);
const nav = await puppeteer.connect({ browserURL: 'http://127.0.0.1:9222', defaultViewport: null });
const p = (await nav.pages()).find((x) => x.url().includes('shopify-knowledge-base'));
await p.bringToFront();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
for (const [q, a] of FAQ.slice(from, to)) {
  await p.goto('https://admin.shopify.com/store/0rsiku-r1/apps/shopify-knowledge-base/app/pairs/new', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await sleep(7000);
  await p.mouse.click(1063, 190); await sleep(400);
  await p.keyboard.type(q, { delay: 15 });
  await p.mouse.click(1063, 306); await sleep(400);
  await p.keyboard.type(a, { delay: 8 });
  await sleep(600);
  await p.mouse.click(1511, 458);
  await sleep(4500);
  console.log('ajoutée :', q, '|', p.url().slice(-40));
}
await p.screenshot({ path: 'C:/Users/Valentin/AppData/Local/Temp/claude/C--Users-Valentin/d7244b14-940c-45e2-b8d7-3da9ddcfce49/scratchpad/kb-faq.png' });
nav.disconnect();
