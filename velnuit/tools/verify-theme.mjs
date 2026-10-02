import { readdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, relative } from 'node:path';
import { verifyTheme } from './verify-lib.mjs';

const root = fileURLToPath(new URL('../theme/', import.meta.url));
const files = {};
async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) await walk(path);
    else if (/\.(liquid|json|js|css|yml)$/.test(entry.name)) files[relative(root, path).replaceAll('\\', '/')] = await readFile(path, 'utf8');
  }
}
await walk(root);
const result = verifyTheme(files);
process.stdout.write('Theme structure verified: ' + result.files + ' files, ' + result.json + ' JSON files.\n');
