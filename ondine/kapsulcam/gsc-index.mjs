import puppeteer from 'puppeteer-core';
const url = process.argv[2];
const b = await puppeteer.connect({ browserURL: 'http://127.0.0.1:9222', defaultViewport: null, protocolTimeout: 300000 });
const p = (await b.pages()).find((x) => x.url().includes('search-console'));
await p.bringToFront();
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const txt = async () => (await p.evaluate(() => document.body.innerText)).replace(/\s+/g, ' ');
await p.goto('https://search.google.com/search-console?resource_id=sc-domain%3Akapsulcam.com', { waitUntil: 'networkidle2', timeout: 90000 }).catch(() => {});
await wait(3000);
const box = await (await p.evaluateHandle(() => [...document.querySelectorAll('input')].find((i) => /Inspecter/.test(i.getAttribute('aria-label') || '') && i.offsetParent))).asElement().boundingBox();
await p.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
await p.keyboard.type(url, { delay: 15 });
await p.keyboard.press('Enter');
let t = '';
for (let i = 0; i < 40; i++) { await wait(2000); t = await txt(); if (/Cette URL (est|n'est pas|n'a pas été indexée)/.test(t)) break; }
const etat = t.match(/Cette URL (est sur Google|n'est pas sur Google|n'a pas été indexée par Google)/)?.[0] || '?';
const detail = t.match(/(La page est indexée|La page n'est pas indexée : [^|]*?(?= [A-ZÉ][a-zé]+ (?:Découverte|Exploration))|La page n'est pas indexée : [^.]{0,60})/)?.[0] || '';
console.log(url, '|', etat, '|', detail);
if (/est sur Google/.test(etat)) { b.disconnect(); process.exit(0); }
const h = await p.evaluateHandle(() => [...document.querySelectorAll('[role=button],button,span')].filter((e) => (e.innerText || '').trim() === 'DEMANDER UNE INDEXATION' && e.offsetParent).pop());
if (!h.asElement()) { console.log('   bouton introuvable'); b.disconnect(); process.exit(0); }
await h.asElement().click();
let res = '';
for (let i = 0; i < 80; i++) { await wait(3000); t = await txt(); res = t.match(/(Indexation demandée|Quota dépassé|Un problème est survenu|Impossible d'effectuer)/)?.[0] || ''; if (res) break; }
console.log('   ->', res || 'pas de réponse après 4 min');
const ok = await p.evaluateHandle(() => [...document.querySelectorAll('[role=button],button,span')].filter((e) => /^(OK|IGNORER)$/.test((e.innerText || '').trim()) && e.offsetParent).pop());
if (ok.asElement()) await ok.asElement().click();
await wait(1500);
b.disconnect();
