import fs from 'node:fs';
import path from 'node:path';
import { rest, ICI_DIR } from './shop.mjs';
const THEME = 190830182728;
for (const f of process.argv.slice(2)) {
  const key = f.endsWith('.liquid') ? `snippets/${path.basename(f)}` : `assets/${path.basename(f)}`;
  const body = f.endsWith('.liquid') ? { key, value: fs.readFileSync(path.join(ICI_DIR, f), 'utf8') } : { key, attachment: fs.readFileSync(path.join(ICI_DIR, f)).toString('base64') };
  await rest('PUT', `themes/${THEME}/assets.json`, { asset: body });
  console.log('ok', key);
}
