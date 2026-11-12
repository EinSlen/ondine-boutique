import fs from 'node:fs';
import { rest } from './shop.mjs';
const [fichier, cle, themeId] = process.argv.slice(2);
const r = await rest('PUT', `themes/${themeId}/assets.json`, { asset: { key: cle, attachment: fs.readFileSync(fichier).toString('base64') } });
console.log(r.asset.public_url);
