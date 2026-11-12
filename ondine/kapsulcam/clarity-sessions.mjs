// Résumé des enregistrements Clarity (3 derniers jours) par source, page d'arrivée et engagement. Ouvrir d'abord Shopify > Applications > Microsoft Clarity > Enregistrements dans Edge 9222.
import puppeteer from 'puppeteer-core';
const b = await puppeteer.connect({ browserURL: 'http://127.0.0.1:9222', defaultViewport: null, protocolTimeout: 300000 });
const p = (await b.pages()).find((x) => x.url().includes('admin.shopify.com'));
const f = p.frames().find((x) => x.url().includes('/projects/view/'));
const vus = new Map();
for (let i = 0; i < 40; i++) {
  const items = await f.evaluate(() => {
    const out = [];
    for (const el of document.querySelectorAll('*')) {
      const t = el.innerText || '';
      if (el.children.length && /Durée/.test(t) && /ID d.utilisateur/.test(t) && (t.match(/ID d.utilisateur/g) || []).length === 1) out.push(t);
    }
    return out.filter((t, i, a) => !a.some((u, j) => j !== i && u !== t && t.includes(u)));
  });
  for (const t of items) vus.set(t.match(/ID d.utilisateur : (\S+)/)?.[1] + (t.match(/(\d\d:\d\d)\n/)?.[1] || ''), t);
  const fin = await f.evaluate(() => { const sc = [...document.querySelectorAll('*')].filter((e) => e.scrollHeight > e.clientHeight + 50 && /Durée/.test(e.innerText || '') && getComputedStyle(e).overflowY !== 'visible'); const el = sc.sort((a, b) => a.innerText.length - b.innerText.length)[0]; if (!el) return true; const avant = el.scrollTop; el.scrollTop += 900; return el.scrollTop === avant; });
  await new Promise((r) => setTimeout(r, 1500));
  if (fin && i > 2) break;
}
const sec = (d) => { const [m, s] = (d || '0:0').split(':').map(Number); return m * 60 + s; };
const rows = [...vus.values()].map((t) => { const l = t.split('\n').map((x) => x.trim()).filter(Boolean); const at = (k) => l[l.findIndex((x) => x.startsWith(k)) + 1] || ''; const id = l.findIndex((x) => x.startsWith("ID d")); return { entree: at('Entrée'), ref: (l.find((x) => x.startsWith('Referrer:')) || '').slice(9), heure: l.find((x) => /^\d\d:\d\d$/.test(x)), jour: l.find((x) => /^Oct\./.test(x)), duree: sec(at('Durée')), clics: Number(at('Clics')), pages: Number(at('Pages')), pays: l[id + 1], nav: l[id + 2], app: l[id + 3] }; });
console.log('enregistrements :', rows.length);
const grp = {};
for (const r of rows) { const pub = /gclid|gad_source/.test(r.entree); const k = `${pub ? 'PUB' : 'hors pub'} | ${r.ref || '(sans référent)'} | ${r.entree.includes('54335767183688') ? 'variante 1080P' : r.entree.includes('kapsulcam-4k') ? 'fiche 4K' : 'accueil/autre'}`; (grp[k] = grp[k] || []).push(r); }
for (const [k, v] of Object.entries(grp).sort((a, b) => b[1].length - a[1].length)) { const d = v.map((r) => r.duree).sort((a, b) => a - b); console.log(String(v.length).padStart(3), k, '| durée médiane', d[Math.floor(d.length / 2)], 's, max', d[d.length - 1], 's | clics', v.reduce((s, r) => s + r.clics, 0), '| >1 page', v.filter((r) => r.pages > 1).length, '|', [...new Set(v.map((r) => `${r.nav}/${r.app}`))].join(', '), '|', [...new Set(v.map((r) => r.pays))].join(',')); }
console.log('--- détail pub hors partenaires et visites de plus de 30 s');
for (const r of rows.filter((r) => (/gclid|gad_source/.test(r.entree) && !/syndicated/.test(r.ref)) || r.duree > 30)) console.log(r.jour, r.heure, r.ref || '-', r.duree + 's', 'clics', r.clics, 'pages', r.pages, r.pays, r.nav, r.app, r.entree.replace(/&gclid=.*/, '').slice(0, 90));
b.disconnect();
