import fs from 'node:fs';
import path from 'node:path';
import { rest, ICI_DIR } from './shop.mjs';
const THEME = 190830182728;
const dir = path.join(ICI_DIR, 'carrousel');
const out = {};
for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.jpg')).sort()) {
  const r = await rest('PUT', `themes/${THEME}/assets.json`, { asset: { key: `assets/kc-${f}`, attachment: fs.readFileSync(path.join(dir, f)).toString('base64') } });
  out[f] = r.asset.public_url;
  console.log(f, r.asset.public_url);
}
fs.writeFileSync(path.join(ICI_DIR, 'images-cdn.json'), JSON.stringify(out, null, 1));
