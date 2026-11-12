import { rest } from './shop.mjs';
const [cmd, key, file] = process.argv.slice(2);
const THEME = 190830182728;
if (cmd === 'get') {
  const r = await rest('GET', `themes/${THEME}/assets.json?asset[key]=${encodeURIComponent(key)}`);
  if (file) (await import('node:fs')).writeFileSync(file, r.asset.value); else console.log(r.asset.value);
} else if (cmd === 'put') {
  const fs = await import('node:fs');
  await rest('PUT', `themes/${THEME}/assets.json`, { asset: { key, value: fs.readFileSync(file, 'utf8') } });
  console.log('ok', key);
} else if (cmd === 'list') {
  const r = await rest('GET', `themes/${THEME}/assets.json`);
  console.log(r.assets.map((a) => a.key).filter((k) => k.startsWith(key || '')).join('\n'));
}
