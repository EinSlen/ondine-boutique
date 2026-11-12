// Parcourt les onglets et filtres de Shopify Inbox (Edge 9222) et affiche la liste de chaque vue.
import puppeteer from 'puppeteer-core';
const b = await puppeteer.connect({ browserURL: 'http://127.0.0.1:9222', defaultViewport: null, protocolTimeout: 120000 });
const p = (await b.pages()).find((x) => x.url().includes('inbox.shopify.com'));
for (const nom of ['Fermées', 'Conversations de l’agent', 'Non lues', 'Non assignées', 'Ouvertes']) {
  const ok = await p.evaluate((nom) => {
    const el = [...document.querySelectorAll('a, button, [role="tab"], [role="button"], span, div')].filter((e) => e.innerText?.trim() === nom).pop();
    if (!el) return false;
    (el.closest('a, button, [role="tab"], [role="button"]') || el).click();
    return true;
  }, nom);
  await new Promise((r) => setTimeout(r, 3500));
  const texte = await p.evaluate(() => document.body.innerText);
  const debut = texte.indexOf('Paramètres');
  const fin = texte.indexOf('Sélectionnez une conversation');
  console.log(`=== ${nom} (${ok ? 'cliqué' : 'introuvable'}) ${p.url()}`);
  console.log(texte.slice(debut + 10, fin > debut ? fin : debut + 1500).trim().slice(0, 1500));
}
b.disconnect();
