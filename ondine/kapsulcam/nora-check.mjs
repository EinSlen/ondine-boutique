// Checks the Alibaba messenger conversation with Nora (Shenzhen Ksl) and prints her messages that arrived since the
// last check, with their timestamp and attached files. State: nora-state.json (last timestamp seen).
// node nora-check.mjs          -> "RIEN" or one block per new message
// node nora-check.mjs --init   -> marks everything currently visible as seen
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire('C:/Users/Valentin/node_modules/');
const puppeteer = require('puppeteer-core');
const ICI = path.dirname(fileURLToPath(import.meta.url));
const STATE = path.join(ICI, 'nora-state.json');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const state = Object.assign({ last: '', keys: [] }, fs.existsSync(STATE) ? JSON.parse(fs.readFileSync(STATE, 'utf8')) : {});
const key = (m) => `${m.t}|${m.text.split(' / ')[0]}`;
const save = (msgs) => { const last = msgs.map((m) => m.t).sort().pop() || state.last; state.keys = last === state.last ? [...new Set([...state.keys, ...msgs.filter((m) => m.t === last).map(key)])] : msgs.filter((m) => m.t === last).map(key); state.last = last; fs.writeFileSync(STATE, JSON.stringify(state)); };

const b = await puppeteer.connect({ browserURL: 'http://127.0.0.1:9222', defaultViewport: null, protocolTimeout: 60000 });
// Attach only to the messenger tab: another frozen tab must not block the check.
const tg = b.targets().find((t) => t.type() === 'page' && t.url().includes('message.alibaba.com/message/messenger'));
let p = tg ? await tg.page() : null;
if (!p) { p = await b.newPage(); await p.goto('https://message.alibaba.com/message/messenger.htm', { waitUntil: 'domcontentloaded', timeout: 60000 }).catch(() => {}); }
else await p.reload({ waitUntil: 'domcontentloaded', timeout: 60000 }).catch(() => {});
await sleep(9000);
if (/login|passport/.test(p.url())) { console.log('DECONNECTE : Valentin doit se reconnecter à Alibaba'); b.disconnect(); process.exit(0); }
await p.evaluate(() => { const e = [...document.querySelectorAll('*')].find((x) => x.children.length === 0 && x.textContent.trim() === 'Nora Lee'); if (e) (e.closest('[class*=item],[class*=Item],li,div') || e).click(); });
await sleep(7000);

// Message list: a "Nora Lee" line followed by a "YYYY-MM-DD HH:MM" line opens one of her messages; our messages have
// only the timestamp line. Lines until the next timestamp belong to the message.
const lines = (await p.evaluate(() => document.body.innerText)).split('\n').map((l) => l.trim()).filter(Boolean);
const files = await p.evaluate(() => [...document.querySelectorAll('[data-query]')].map((e) => { try { return JSON.parse(e.getAttribute('data-query')); } catch { return null; } }).filter((q) => q && q.fileName).map((q) => q.fileName));
const ts = /^\d{4}-\d\d-\d\d \d\d:\d\d$/;
const noise = /^(Fourni par Alibaba Translate|Commentaires|\[?Lire\]?|\[?Non lu\]?|Vu|L’utilisateur a rappelé un message\.)$/;
const msgs = [];
for (let i = 0; i < lines.length; i++) {
  if (!ts.test(lines[i])) continue;
  const fromNora = lines[i - 1] === 'Nora Lee';
  const body = [];
  for (let j = i + 1; j < lines.length && !ts.test(lines[j]) && !(lines[j] === 'Nora Lee' && ts.test(lines[j + 1] || '')); j++) if (!noise.test(lines[j])) body.push(lines[j]);
  msgs.push({ t: lines[i], fromNora, text: body.join(' / ').slice(0, 600) });
}
if (process.argv.includes('--init')) {
  save(msgs);
  console.log('INIT', state.last);
} else {
  const fresh = msgs.filter((m) => m.fromNora && (m.t > state.last || (m.t === state.last && !state.keys.includes(key(m))))).sort((a, c) => a.t.localeCompare(c.t));
  if (!fresh.length) console.log('RIEN');
  for (const m of fresh) console.log(`NORA ${m.t} : ${m.text}`);
  save(msgs.filter((m) => m.t >= state.last));
  if (fresh.length) console.log('FICHIERS DANS LA CONVERSATION :', [...new Set(files)].join(' | '));
}
b.disconnect();
